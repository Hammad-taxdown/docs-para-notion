#!/usr/bin/env bash
# contract-test-ampliado.sh — contrato ampliado del 3/08 (9 -> 19 campos)
#
# Prueba los 10 campos NUEVOS del escritor `beckham-upsert-expediente`:
# nombre, apellidos, nif, telefono, tipo_via, calle, numero, codigo_postal,
# planta/puerta y fecha_nacimiento.
#
# Uso:
#   ./scripts/contract-test-ampliado.sh
#
# QUE COMPRUEBA ESTE SCRIPT:  solo el codigo HTTP y el `ok` del cuerpo.
# QUE NO PUEDE COMPROBAR:     si el CAMPO acabo escrito o ausente en Airtable.
#   Eso se verifica por MCP fila a fila -> al final imprime la tabla de lo
#   esperado y la lista de UserIds para ir a mirarlos.
#
# Cada caso usa un UserId DISTINTO para que cada fila sea verificable y
# borrable por separado. NO borra nada.
set -uo pipefail

BASE="${BECKHAM_WEBHOOK_BASE:-https://es.synapse.rentax.es}"
URL="$BASE/webhook/beckham-upsert-expediente"
PRE="eu-west-1:00000000-0000-4000-8000-0000000000"

pass=0; fail=0
hr(){ printf '\n\033[2m%s\033[0m\n' "──────────────────────────────────────────────────────────────"; }

# caso <id> <sufijo-hex> <esperado-http> <json-de-campos>
caso(){
  local id="$1" suf="$2" wantcode="$3" campos="$4"
  local body out code resp
  body="{\"user_id\":\"${PRE}${suf}\",\"intercom_conversation_id\":\"TEST-amp-${suf}\"${campos}}"
  out=$(curl -sS -w '\n%{http_code}' -X POST "$URL" \
        -H 'Content-Type: application/json' -d "$body" 2>&1)
  code=$(printf '%s' "$out" | tail -n1)
  resp=$(printf '%s' "$out" | sed '$d')
  if [ "$code" = "$wantcode" ]; then
    printf '\033[32m  OK  \033[0m %-5s %s\n' "$id" "$resp"; pass=$((pass+1))
  else
    printf '\033[31m FAIL \033[0m %-5s HTTP %s (esperado %s)\n       %s\n' "$id" "$code" "$wantcode" "$resp"; fail=$((fail+1))
  fi
}

hr; echo "CAMPOS QUE DEBEN ESCRIBIRSE"; echo "  → $URL"
caso N1  d1 200 ',"nombre":"Hammad","apellidos":"Bellachhab"'
caso N2  d2 200 ',"nif":"12345678Z"'
caso N3  d3 200 ',"nif":"X1234567L"'
caso N4  d4 200 ',"telefono":"666175816"'
caso N5  d5 200 ',"telefono":"+34 666 17 58 16"'
caso N6  d6 200 ',"telefono":"+447911123456"'
caso N7  d7 200 ',"calle":"Gaztambide","numero":"2","codigo_postal":"28015"'
caso N8  d8 200 ',"tipo_via":"C/","calle":"Gaztambide","numero":"2","codigo_postal":"28015"'
caso N9  d9 200 ',"fecha_nacimiento":"29/02/2028"'

hr; echo "CAMPOS MALOS: se descartan Y AVISAN (el HTTP sigue siendo 200)"
caso M1  e1 200 ',"nif":"12345678A"'
caso M1b eb 200 ',"nif":"12345678H"'
caso M2  e2 200 ',"telefono":"+3466175816"'
caso M3  e3 200 ',"telefono":"+34 234876459"'
caso M4  e4 200 ',"calle":"Miguiel Hernandez","numero":"56"'
caso M5  e5 200 ',"calle":"Gaztambide","numero":"2","codigo_postal":"99999"'
caso M6  e6 200 ',"tipo_via":"RUA DE LA PLATA","calle":"Gaztambide","numero":"2","codigo_postal":"28015"'
caso M7  e7 200 ',"fecha_nacimiento":"31/02/1990"'

hr; echo "P1 · INVARIANTE T8 — un campo ausente NO pisa la celda"
caso P1a f1 200 ',"nombre":"Primero","telefono":"600111222","calle":"Gaztambide","numero":"2","codigo_postal":"28015"'
caso P1b f1 200 ',"nombre":"Segundo"'

hr
printf 'HTTP: \033[32m%s OK\033[0m · \033[31m%s FAIL\033[0m\n' "$pass" "$fail"

cat <<'TABLA'

────────────────────────────────────────────────────────────────
AHORA VERIFICAR POR MCP EN AIRTABLE (esto el script no lo ve)
Base app5K8OnSObqwWweS · tabla tblTWCWu5nQXNOMR1 (Empleados)

  N1  …d1  Nombre empleado=Hammad · Apellidos empleado=Bellachhab
  N2  …d2  NIF=12345678Z
  N3  …d3  NIF=X1234567L
  N4  …d4  NumeroTelefono=+34666175816
  N5  …d5  NumeroTelefono=+34666175816   (normalizado, sin espacios)
  N6  …d6  NumeroTelefono=+447911123456  (UK, se acepta)
  N7  …d7  calle + numero + Codigo Postal=28015, LOS TRES
  N8  …d8  Tipo de vía=CALLE  (alias C/ resuelto)
  N9  …d9  FechaNacimiento=2028-02-29  (bisiesto, no se come fechas buenas)

  M1  …e1  NIF AUSENTE  + aviso
  M1b …eb  NIF AUSENTE  + aviso   (12345678H: la letra buena es Z)
  M2  …e2  NumeroTelefono AUSENTE + aviso   ← el caso real de la conv B
  M3  …e3  NumeroTelefono AUSENTE + aviso   ← empieza por 2
  M4  …e4  calle/numero/CP LOS TRES AUSENTES + aviso "falta: codigo_postal"
  M5  …e5  domicilio AUSENTE + aviso (provincia 99 no existe)
  M6  …e6  Tipo de vía AUSENTE + aviso, pero calle/numero/CP SI escritos
  M7  …e7  FechaNacimiento AUSENTE + aviso

  P1  …f1  Nombre empleado=Segundo  Y  NumeroTelefono=+34600111222
           Y el domicilio INTACTO  ← si el telefono o el domicilio se
           vaciaron, T8 esta roto y eso es perdida de datos silenciosa.

Los avisos valen SOLO con ok:true + message_timestamp en el output de
Slack_Aviso y vistos en pantalla. Subejecucion < 50 ms = no se envio.

Al acabar: BORRAR las 18 filas de prueba (UserId acabado en d1-d9, e1-e7, eb, f1).
────────────────────────────────────────────────────────────────
TABLA
