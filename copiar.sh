#!/bin/bash
# 26/08 · Deja en el portapapeles cada valor de los pasos, ya listo para pegar.
#   bash docs/copiar.sh 1     el nodo Decidir_Status entero
#   bash docs/copiar.sh 2     el filtro del .030
#   bash docs/copiar.sh 3     el filtro del informe (v1 y v2, es el mismo)
#   bash docs/copiar.sh 4     el JSON Body de Marcar InformeListo del v2
# Todo sin el '=' inicial y sin salto de linea final, como pide n8n.
cd "$(dirname "$0")/.." || exit 1
V=$(printf '\033[32m'); D=$(printf '\033[2m'); N=$(printf '\033[0m')

F030='AND(OR({Status}="4. Pte hacer informe",{Status}="5. Informe enviado"), OR({Regenerar030}=1, {Fichero030}=BLANK()))'
FINF='AND(OR({Status}="4. Pte hacer informe",{Status}="5. Informe enviado"), OR({RegenerarInforme}=1, {InformePdf}=BLANK()))'
BODY="{{ JSON.stringify({ fields: { Status: '5. Informe enviado', InformeListo: true, RegenerarInforme: false, ErrorInforme: '', InformeEnviadoEl: \$now.toISO() } }) }}"

case "$1" in
  1) pbcopy < docs/nodo-decidir-status-2026-08-26.js
     n=$(python3 -c "import io;print(len(io.open('docs/nodo-decidir-status-2026-08-26.js',encoding='utf-8').read()))")
     echo "${V}copiado el nodo Decidir_Status entero${N}"
     echo "${D}el contador de n8n tiene que decir: ${N}${V}$n caracteres${N}" ;;
  2) printf '%s' "$F030" | pbcopy; echo "${V}copiado el filtro del .030${N}"; echo "${D}$F030${N}" ;;
  3) printf '%s' "$FINF" | pbcopy; echo "${V}copiado el filtro del informe${N}"; echo "${D}$FINF${N}" ;;
  4) printf '%s' "$BODY" | pbcopy; echo "${V}copiado el JSON Body de Marcar InformeListo del v2${N}"; echo "${D}$BODY${N}" ;;
  *) echo "uso: bash docs/copiar.sh [1|2|3|4]" ;;
esac
