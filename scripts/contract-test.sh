#!/usr/bin/env bash
# contract-test.sh — WP-201 + incógnita T8
#
# Prueba el escritor único (webhook `beckham-upsert-expediente`) sin navegador.
#   Bloque A (WP-201): los dos content-types + el 400 sin user_id.
#   Bloque B (T8):     ¿un campo que NO se manda pisa la celda que ya estaba?
#
# Uso:
#   ./scripts/contract-test.sh            # bloque A solo (rápido, no escribe datos raros)
#   ./scripts/contract-test.sh --t8       # A + B (crea 1 fila de prueba y la modifica)
#
# NO borra nada. La fila que crea el bloque B queda con UserId de prueba y prefijo TEST-.
set -uo pipefail

BASE="${BECKHAM_WEBHOOK_BASE:-https://es.synapse.rentax.es}"
URL="$BASE/webhook/beckham-upsert-expediente"

# UserId con la forma real confirmada (eu-west-1:<uuid>), pero marcado como test.
UID_A="eu-west-1:00000000-0000-4000-8000-0000000000c1"
CONV="TEST-contract-$(date +%s)"

pass=0; fail=0
hr(){ printf '\n\033[2m%s\033[0m\n' "────────────────────────────────────────────────────────"; }

# check <nombre> <esperado-regex> <http-esperado> <curl-args...>
check(){
  local name="$1" want="$2" wantcode="$3"; shift 3
  local out code body
  out=$(curl -sS -w '\n%{http_code}' "$@" "$URL" 2>&1)
  code=$(printf '%s' "$out" | tail -n1)
  body=$(printf '%s' "$out" | sed '$d')
  if printf '%s' "$body" | grep -Eq "$want" && [ "$code" = "$wantcode" ]; then
    printf '\033[32m  PASS\033[0m  %s\n        HTTP %s · %s\n' "$name" "$code" "$body"; pass=$((pass+1))
  else
    printf '\033[31m  FAIL\033[0m  %s\n        HTTP %s (esperado %s)\n        %s\n        esperaba /%s/\n' \
      "$name" "$code" "$wantcode" "$body" "$want"; fail=$((fail+1))
  fi
}

hr; echo "BLOQUE A · WP-201 · parseo del body"; echo "  → $URL"

# A1 — el caso que hoy falla: el Data Connector manda urlencoded con el JSON como única clave.
check "A1 urlencoded (el caso del Data Connector)" '"ok":true' 200 \
  -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw "{\"user_id\":\"$UID_A\",\"intercom_conversation_id\":\"$CONV\",\"punto\":\"lead\"}"

# A2 — no regresión: el JSON nativo debe seguir funcionando igual.
check "A2 application/json (no regresión)" '"ok":true' 200 \
  -X POST -H 'Content-Type: application/json' \
  --data "{\"user_id\":\"$UID_A\",\"intercom_conversation_id\":\"$CONV\",\"punto\":\"lead\"}"

# A3 — la salvaguarda sigue viva: sin user_id no se escribe nada.
check "A3 sin user_id → 400" '"ok":false' 400 \
  -X POST -H 'Content-Type: application/json' \
  --data "{\"intercom_conversation_id\":\"$CONV\"}"

# A4 — user_id vacío tampoco pasa (protege las filas con UserId vacío de la tabla).
check "A4 user_id vacío → 400" '"ok":false' 400 \
  -X POST -H 'Content-Type: application/json' \
  --data "{\"user_id\":\"   \",\"intercom_conversation_id\":\"$CONV\"}"

# A5 — urlencoded sin user_id: el parseo funciona Y la validación sigue rechazando.
check "A5 urlencoded sin user_id → 400" '"ok":false' 400 \
  -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw "{\"intercom_conversation_id\":\"$CONV\"}"

if [ "${1:-}" = "--t8" ]; then
  UID_B="eu-west-1:00000000-0000-4000-8000-0000000000c8"
  hr; echo "BLOQUE B · T8 · ¿un campo ausente pisa la celda?"
  echo "  Paso 1: fila completa. Paso 2: solo 3 campos. Luego se compara por MCP."

  check "B1 fila completa (9 campos)" '"ok":true' 200 \
    -X POST -H 'Content-Type: application/json' --data "$(cat <<JSON
{"user_id":"$UID_B","intercom_conversation_id":"TEST-t8-completo",
 "email":"contract-test@example.invalid","alta_ss":"true","lead_potencial":"false",
 "fecha_alta_ss":"01/03/2026","fecha_prevista_alta":"15/09/2026",
 "fecha_limite_plazo":"2026-09-01","Descarte":""}
JSON
)"

  check "B2 solo user_id + conv + fecha_alta_ss" '"ok":true' 200 \
    -X POST -H 'Content-Type: application/json' \
    --data "{\"user_id\":\"$UID_B\",\"intercom_conversation_id\":\"TEST-t8-parcial\",\"fecha_alta_ss\":\"02/03/2026\"}"

  cat <<'NOTA'

  ── Qué mirar ahora (por MCP, no a ojo) ────────────────────────────────
  Leer la fila con UserId = eu-west-1:00000000-0000-4000-8000-0000000000c8
  y comprobar campo a campo:

    fecha_alta_ss   DEBE haber cambiado a 2026-03-02   (era lo que mandamos)
    email           NO debe haberse vaciado
    alta_ss         NO debe haberse desmarcado
    fecha_prevista_alta / fecha_limite_plazo   NO deben haberse borrado

  Si alguno se ha vaciado → el `undefined` SÍ pisa, y hay que construir el
  objeto de columnas dinámicamente (solo las claves presentes) en vez de
  mapear los 9 siempre. Eso es la corrección de T8.
  ───────────────────────────────────────────────────────────────────────
NOTA
fi

if [ "${1:-}" = "--wp206" ]; then
  UID_C="eu-west-1:00000000-0000-4000-8000-000000000206"
  hr; echo "BLOQUE C · WP-206 · whitelist de punto y de Descarte"
  echo "  Los 6 punto validos pasan; un punto inventado y una errata en Descarte NO escriben."

  # C1..C6 — los 6 valores validos de `punto` siguen devolviendo ok:true.
  for p in cualifica lead descarte_plazo descarte_residencia autodescarte_declarado faq_entrada; do
    check "C punto=$p → ok" '"ok":true' 200 \
      -X POST -H 'Content-Type: application/json' \
      --data "{\"user_id\":\"$UID_C\",\"intercom_conversation_id\":\"TEST-206-$p\",\"punto\":\"$p\"}"
  done

  # C7 — un `punto` que no esta en la whitelist no debe escribir nada.
  check "C7 punto inventado → 400" '"ok":false' 400 \
    -X POST -H 'Content-Type: application/json' \
    --data "{\"user_id\":\"$UID_C\",\"intercom_conversation_id\":\"TEST-206-malo\",\"punto\":\"inventado\"}"

  # C8 — errata en Descarte: con typecast:true esto CREARIA una opcion nueva en produccion.
  check "C8 errata en Descarte → 400" '"ok":false' 400 \
    -X POST -H 'Content-Type: application/json' \
    --data "{\"user_id\":\"$UID_C\",\"intercom_conversation_id\":\"TEST-206-errata\",\"Descarte\":\"Alta en SS mas de 6 mesess\"}"

  cat <<'NOTA206'

  ── Comprobacion que el script NO puede hacer ──────────────────────────
  Contar por MCP las opciones del single-select `Descarte` (fldcEq4ts2Vyqzg5b).
  Antes de esta bateria eran 4:
    No residente ultimos 5 años · Menos de 55 salario ·
    Alta en SS mas de 6 meses · Otro/Incompleto
  Si tras C8 hay 5, la whitelist no esta cortando y `typecast:true` creo
  una opcion nueva en produccion en silencio.
  ───────────────────────────────────────────────────────────────────────
NOTA206
fi

hr
printf 'RESULTADO: \033[32m%d PASS\033[0m · \033[31m%d FAIL\033[0m\n\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
