#!/usr/bin/env bash
# contract-test-completo.sh — el expediente ENTERO, los 20 campos de golpe
#
# Las baterias anteriores prueban UN campo por caso, para saber cual falla.
# Esta prueba lo contrario: manda TODO relleno a la vez, que es lo que hara el
# bot de verdad cuando las tools esten cableadas. Sirve para cazar lo que solo
# aparece con el expediente completo: colisiones entre campos, derivaciones del
# `punto` que pisan valores explicitos, y limites de longitud.
#
# Uso: ./scripts/contract-test-completo.sh
#
# Igual que las otras: solo ve el HTTP. La verificacion campo a campo va por MCP.
set -uo pipefail

BASE="${BECKHAM_WEBHOOK_BASE:-https://es.synapse.rentax.es}"
URL="$BASE/webhook/beckham-upsert-expediente"
PRE="eu-west-1:00000000-0000-4000-8000-0000000000"

pass=0; fail=0
hr(){ printf '\n\033[2m%s\033[0m\n' "──────────────────────────────────────────────────────────────"; }

# Los 18 campos que acepta el contrato, todos con valores VALIDOS.
campos_json() {
  cat <<JSON
  "email": "hammad.bellachhab@taxdown.es",
  "nombre": "Hammad",
  "apellidos": "Bellachhab Ridaoui",
  "nif": "12345678Z",
  "telefono": "+34 666 17 58 16",
  "tipo_via": "C/",
  "calle": "Gaztambide",
  "numero": "2",
  "planta": "3",
  "puerta": "B",
  "codigo_postal": "28015",
  "fecha_nacimiento": "15/06/1990",
  "fecha_alta_ss": "01/04/2026",
  "fecha_prevista_alta": "15/09/2026",
  "fecha_limite_plazo": "01/10/2026"
JSON
}

lanza(){
  local id="$1" wantcode="$2" body="$3" ct="${4:-application/json}"
  local out code resp
  if [ "$ct" = "urlencoded" ]; then
    out=$(curl -sS -w '\n%{http_code}' -X POST "$URL" \
          -H 'Content-Type: application/x-www-form-urlencoded' --data-raw "$body" 2>&1)
  else
    out=$(curl -sS -w '\n%{http_code}' -X POST "$URL" \
          -H 'Content-Type: application/json' -d "$body" 2>&1)
  fi
  code=$(printf '%s' "$out" | tail -n1)
  resp=$(printf '%s' "$out" | sed '$d')
  if [ "$code" = "$wantcode" ]; then
    printf '\033[32m  OK  \033[0m %-6s %s\n' "$id" "$resp"; pass=$((pass+1))
  else
    printf '\033[31m FAIL \033[0m %-6s HTTP %s (esperado %s)\n        %s\n' "$id" "$code" "$wantcode" "$resp"; fail=$((fail+1))
  fi
}

hr; echo "EXPEDIENTE COMPLETO · los 20 campos a la vez"; echo "  → $URL"

# C1 · todo relleno, sin `punto`: los booleanos van explicitos
lanza C1 200 "{\"user_id\":\"${PRE}a1\",\"intercom_conversation_id\":\"TEST-full-a1\",
$(campos_json),
  \"alta_ss\": true,
  \"lead_potencial\": false,
  \"Descarte\": \"Otro/Incompleto\"
}"

# C2 · todo relleno CON punto=cualifica: alta_ss lo deriva el punto
lanza C2 200 "{\"user_id\":\"${PRE}a2\",\"intercom_conversation_id\":\"TEST-full-a2\",
$(campos_json),
  \"punto\": \"cualifica\"
}"

# C3 · todo relleno CON punto=lead: alta_ss=false y lead_potencial=true derivados
lanza C3 200 "{\"user_id\":\"${PRE}a3\",\"intercom_conversation_id\":\"TEST-full-a3\",
$(campos_json),
  \"punto\": \"lead\"
}"

# C4 · el mismo expediente completo pero URLENCODED, que es como llega del DC
lanza C4 200 "{\"user_id\":\"${PRE}a4\",\"intercom_conversation_id\":\"TEST-full-a4\",$(campos_json),\"punto\":\"cualifica\"}" urlencoded

# C5 · NIE en vez de DNI, y telefono extranjero, sobre expediente completo
lanza C5 200 "{\"user_id\":\"${PRE}a5\",\"intercom_conversation_id\":\"TEST-full-a5\",
$(campos_json | sed 's/12345678Z/X1234567L/; s/+34 666 17 58 16/+447911123456/'),
  \"punto\": \"cualifica\"
}"

hr; echo "C6 · IDEMPOTENCIA — el mismo expediente completo DOS veces"
lanza C6a 200 "{\"user_id\":\"${PRE}a6\",\"intercom_conversation_id\":\"TEST-full-a6\",$(campos_json),\"punto\":\"cualifica\"}"
lanza C6b 200 "{\"user_id\":\"${PRE}a6\",\"intercom_conversation_id\":\"TEST-full-a6\",$(campos_json),\"punto\":\"cualifica\"}"

hr; echo "C7 · T8 SOBRE EXPEDIENTE COMPLETO — mandar UN campo no debe vaciar los otros 17"
lanza C7 200 "{\"user_id\":\"${PRE}a1\",\"intercom_conversation_id\":\"TEST-full-a1\",\"nombre\":\"Cambiado\"}"

hr
printf 'HTTP: \033[32m%s OK\033[0m · \033[31m%s FAIL\033[0m\n' "$pass" "$fail"

cat <<'TABLA'

────────────────────────────────────────────────────────────────
VERIFICAR POR MCP (Empleados · app5K8OnSObqwWweS / tblTWCWu5nQXNOMR1)

  …a1  los 18 campos escritos · alta_ss=true · lead_potencial=false
       Descarte='Otro/Incompleto'  ... Y DESPUES de C7:
       Nombre empleado='Cambiado' y LOS OTROS 17 INTACTOS
  …a2  igual, pero alta_ss=true derivado del punto 'cualifica'
  …a3  alta_ss=FALSE y lead_potencial=TRUE derivados del punto 'lead'
  …a4  identico a a2 -> el urlencoded no pierde ningun campo
  …a5  NIF=X1234567L y NumeroTelefono=+447911123456
  …a6  UN SOLO registro (dos llamadas, un record_id) e identico a a2

  En los cinco: tipo_via -> CALLE · Planta=3 · Puerta=B
  fecha_nacimiento 15/06/1990 -> 1990-06-15
  fecha_alta_ss 01/04/2026 -> 2026-04-01  (sin desplazamiento de dia)

Al acabar: borrar a1-a6.
────────────────────────────────────────────────────────────────
TABLA
