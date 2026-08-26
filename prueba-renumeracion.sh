#!/bin/bash
# 26/08 · La prueba punta a punta de la escalera renumerada, por el webhook del
# escritor (el LLM no participa en la escalera, asi que no hace falta conversacion).
#   bash docs/prueba-renumeracion.sh
# Al acabar hay que LIMPIAR la fila: si se queda en el 4 sin ficheros, reentra en
# cada tick para siempre. La limpieza la hago yo por MCP.
set -uo pipefail
U="eu-west-1:00000000-0000-4000-8000-000000000826"
URL="https://es.synapse.rentax.es/webhook/beckham-upsert-expediente"
V=$(printf '\033[32m'); R=$(printf '\033[31m'); D=$(printf '\033[2m'); N=$(printf '\033[0m')

echo "${D}user_id de prueba: $U${N}"
echo
echo "── 1 · senal de complejidad, SIN cierre -> tiene que quedar en '3. Pendiente llamada TD'"
r1=$(curl -sS -X POST -H 'Content-Type: application/json' \
 --data "{\"user_id\":\"$U\",\"intercom_conversation_id\":\"TEST-RENUM-2026-08-26\",\"punto\":\"lead\",\"nombre\":\"Renum\",\"apellidos\":\"Escalera\",\"salario\":52000,\"senales_complejidad\":[\"Salario no definido o en el limite\"]}" "$URL")
echo "   $r1"
printf '%s' "$r1" | grep -q '"ok":true' && echo "   ${V}OK${N}" || { echo "   ${R}FALLA: no sigas, mira la ejecucion del bot${N}"; exit 1; }
echo
echo "── 2 · cierre completo -> tiene que SUBIR a '4. Pte hacer informe'"
r2=$(curl -sS -X POST -H 'Content-Type: application/json' \
 --data "{\"user_id\":\"$U\",\"intercom_conversation_id\":\"TEST-RENUM-2026-08-26\",\"punto\":\"lead\",\"motivo_cierre\":\"Expediente completo\"}" "$URL")
echo "   $r2"
printf '%s' "$r2" | grep -q '"ok":true' && echo "   ${V}OK${N}" || { echo "   ${R}FALLA${N}"; exit 1; }
echo
echo "${V}Los dos en ok:true.${N} ${D}Ahora toca comprobar por MCP: el Status de la fila, y en el${N}"
echo "${D}tick siguiente DOS ejecuciones mode=trigger con ~18 s de diferencia. Eso lo hago yo.${N}"
