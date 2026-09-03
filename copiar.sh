#!/bin/bash
# 26/08 · Deja en el portapapeles cada valor de los pasos, ya listo para pegar.
#   bash docs/copiar.sh 1     el nodo Decidir_Status entero (03/09: rechaza el cierre sin NIF)
#   bash docs/copiar.sh 2     el filtro del .030
#   bash docs/copiar.sh 3     el filtro del informe (v1 y v2, es el mismo)
#   bash docs/copiar.sh 4     el JSON Body de Marcar InformeListo del v2
#   bash docs/copiar.sh 5     el prompt v14 entero, para LangSmith
#   bash docs/copiar.sh 6     la description de beckham_bot
#   bash docs/copiar.sh 7     el nodo Validar y Normalizar COMPLETO (Cmd+A)
#   bash docs/copiar.sh 8     el prompt v15 entero (un solo agente conversacional)
#   bash docs/copiar.sh 9     el prompt v16 entero (03/09: copy asesores, paternidad, pareja de hecho, aviso pasaporte)
#   bash docs/copiar.sh 10    el $fromAI de fecha_limite_plazo para la tool guardar_datos_cliente (sin el =)
#   bash docs/copiar.sh 11    el copy propuesto de la landing P00027 (markdown)
#   bash docs/copiar.sh 12    el Response Body de Respond OK con el aviso de cierre (sin el =)
#   bash docs/copiar.sh 13    el $fromAI de fecha_documento para la tool calcular_plazo (sin el =)
#   bash docs/copiar.sh 14    el TEXTO que se AÑADE al final de la Description de la tool calcular_plazo
#   bash docs/copiar.sh 15    el Code entero del nodo 'Calcular el plazo' de beckham_f2_plazo.
# Todo sin el '=' inicial y sin salto de linea final, como pide n8n.
cd "$(dirname "$0")/.." || exit 1
V=$(printf '\033[32m'); D=$(printf '\033[2m'); N=$(printf '\033[0m'); R=$(printf '\033[31m')

F030='AND(OR({Status}="4. Pte hacer informe",{Status}="5. Informe enviado"), OR({Regenerar030}=1, {Fichero030}=BLANK()))'
FINF='AND(OR({Status}="4. Pte hacer informe",{Status}="5. Informe enviado"), OR({RegenerarInforme}=1, {InformePdf}=BLANK()))'
BODY="{{ JSON.stringify({ fields: { Status: '5. Informe enviado', InformeListo: true, RegenerarInforme: false, ErrorInforme: '', InformeEnviadoEl: \$now.toISO() } }) }}"

case "$1" in
  1) pbcopy < docs/nodo-decidir-status-2026-09-03.js
     n=$(python3 -c "import io;print(len(io.open('docs/nodo-decidir-status-2026-09-03.js',encoding='utf-8').read()))")
     echo "${V}copiado el nodo Decidir_Status entero${N}"
     echo "${D}el contador de n8n tiene que decir: ${N}${V}$n caracteres${N}" ;;
  2) printf '%s' "$F030" | pbcopy; echo "${V}copiado el filtro del .030${N}"; echo "${D}$F030${N}" ;;
  3) printf '%s' "$FINF" | pbcopy; echo "${V}copiado el filtro del informe${N}"; echo "${D}$FINF${N}" ;;
  7) pbcopy < docs/nodo-validar-normalizar-COMPLETO.js
     n=$(python3 -c "import io;print(len(io.open('docs/nodo-validar-normalizar-COMPLETO.js',encoding='utf-8').read()))")
     echo "${V}copiado el nodo Validar y Normalizar ENTERO${N}"
     echo "${D}n8n tiene que decir: ${N}${V}$n caracteres${N}${D} · pegar con Cmd+A${N}" ;;
  6) printf '%s' "Bot conversacional que cualifica candidatos a la Ley Beckham y construye su expediente: cualifica en Intercom, escribe el expediente en Airtable (Empleados) y dispara los dos entregables por la columna Status. Dueno: Hammad. PRD: docs/prds/fase2/PRD-FASE2.md" | pbcopy
     echo "${V}copiada la description de beckham_bot${N}"
     echo "${D}va en: los tres puntos de arriba a la derecha -> Settings -> Description${N}" ;;
  5) pbcopy < docs/prompt-final-2026-08-26-v14.txt
     n=$(python3 -c "import io;print(len(io.open('docs/prompt-final-2026-08-26-v14.txt',encoding='utf-8').read()))")
     echo "${V}copiado el prompt v14 entero${N}"
     echo "${D}el contador de LangSmith tiene que decir: ${N}${V}$n caracteres${N}"
     echo "${D}y hay que MOVER EL TAG prod, o el bot sigue leyendo el v13.${N}" ;;
  4) printf '%s' "$BODY" | pbcopy; echo "${V}copiado el JSON Body de Marcar InformeListo del v2${N}"; echo "${D}$BODY${N}" ;;
  8) pbcopy < docs/prompt-final-2026-08-31-v15.txt
     n=$(python3 -c "import io;print(len(io.open('docs/prompt-final-2026-08-31-v15.txt',encoding='utf-8').read()))")
     echo "${V}copiado el prompt v15 entero (un solo agente conversacional)${N}"
     echo "${D}el contador de LangSmith tiene que decir: ${N}${V}$n caracteres${N}"
     echo "${R}NO LO PEGUES EN bot_mobility_prompt CON EL TAG prod.${N}"
     echo "${D}Ese tag lo lee beckham_bot, que esta EN PRODUCCION con el canvas de Intercom${N}"
     echo "${D}delante. El v15 dice que NADA viene pre-filtrado y nombra calcular_plazo, que en${N}"
     echo "${D}el bot vivo no existe: moverle el tag prod rompe el bot de verdad. El v15 va en${N}"
     echo "${D}un prompt o un tag NUEVO, y lo lee el workflow NUEVO, no el vivo.${N}" ;;
  9) pbcopy < docs/prompt-final-2026-09-03-v16.txt
     n=$(python3 -c "import io;print(len(io.open('docs/prompt-final-2026-09-03-v16.txt',encoding='utf-8').read()))")
     echo "${V}copiado el prompt v16 entero${N}"
     echo "${D}el contador de LangSmith tiene que decir: ${N}${V}$n caracteres${N}"
     echo "${D}va en bot_mobility_prompt y hay que MOVER EL TAG prod al commit nuevo: lo lee el conversacional.${N}"
     echo "${D}Orden: DESPUES del paso 6 (el validador), que es quien produce el aviso_pasaporte que este prompt lee.${N}" ;;
  10) FL="{{ \$fromAI('fecha_limite_plazo', \`Fecha limite para solicitar el regimen Beckham, en formato DD/MM/AAAA con barras. Ejemplo: 23/10/2026. Copia EXACTAMENTE la fecha_limite que te ha devuelto la herramienta calcular_plazo en este mismo turno, y mandala junto con fecha_alta_ss en cuanto el veredicto sea en_plazo o fuera_plazo. Si calcular_plazo no ha contestado o el veredicto es no_valida, dejala vacia: NUNCA la calcules tu.\`, 'string') }}"
     printf '%s' "$FL" | pbcopy
     echo "${V}copiado el \$fromAI de fecha_limite_plazo para guardar_datos_cliente${N}"
     echo "${D}Body Parameters -> Add Body Field -> Name: fecha_limite_plazo · Value en modo Expression (pega, sin el =)${N}"
     echo "${D}$FL${N}" ;;
  11) pbcopy < docs/landing-P00027-copy-2026-09-03.md; echo "${V}copiado el copy de la landing P00027 (markdown)${N}"
     echo "${D}el unico hueco es ENLACE-CALCULADORA${N}" ;;
  12) RB="{{ { ok: true, action: 'upserted', record_id: \$json.id, descartados: [ \$('Validar y Normalizar').first().json._fechas_descartadas, \$('Decidir_Status').first().json._aviso_cierre ].filter(Boolean).join(' · ') || null } }}"
     printf '%s' "$RB" | pbcopy
     echo "${V}copiado el Response Body de Respond OK${N}"
     echo "${D}$RB${N}" ;;
  13) pbcopy < docs/valor-fecha-documento-fromai-2026-09-03.txt
     echo "${V}copiado el \$fromAI de fecha_documento para calcular_plazo${N}"
     echo "${D}Body Parameters -> Add Body Field -> Name: fecha_documento · Value en modo Expression (pega, sin el =)${N}" ;;
  14) pbcopy < docs/valor-description-calcular-plazo-anadido-2026-09-03.txt
     echo "${V}copiado el texto que se ANADE al final de la Description de la tool calcular_plazo${N}"
     echo "${D}Description -> ir al final del texto -> pegar (NO sustituir lo que hay)${N}" ;;
  15) pbcopy < docs/nodo-f2-calcular-plazo-2026-09-03.js
     n=$(python3 -c "import io;print(len(io.open('docs/nodo-f2-calcular-plazo-2026-09-03.js',encoding='utf-8').read()))")
     echo "${V}copiado el Code de 'Calcular el plazo' (beckham_f2_plazo.)${N}"; echo "${D}n8n tiene que decir: ${N}${V}$n caracteres${N}" ;;
  *) echo "uso: bash docs/copiar.sh [1-15]" ;;
esac
