#!/bin/bash
# Los pasos del 24/08 en la terminal. Sin abrir ningun fichero.
#   bash docs/pasos.sh        -> los 3 pasos y el orden
#   bash docs/pasos.sh 1      -> solo el paso 1, Y te copia al portapapeles lo que haya que pegar
#   bash docs/pasos.sh test   -> pasa las NUEVE puertas
#   bash docs/pasos.sh 21     -> los pasos del 21/08, ya hechos
#   bash docs/pasos.sh 19     -> los pasos del 19/08, ya hechos
cd "$(dirname "$0")/.." || exit 1
B=$(printf '\033[1m'); D=$(printf '\033[2m'); V=$(printf '\033[32m'); A=$(printf '\033[33m')
R=$(printf '\033[31m'); C=$(printf '\033[36m'); N=$(printf '\033[0m')

paso() {
cat <<EOF

${B}${C}━━━ PASO $1 ━━━${N} ${B}$2${N}
${D}workflow:${N} $3
${D}nodo:${N}     $4
${D}como:${N}     $5
EOF
}

p1(){ paso 1 "T073 · devolver al v2 la plantilla que calcula, en vez de una fija" \
  "beckham_informe_mobility_v2 · snoDqB063jMSgzUq" "Copiar la plantilla (Google Drive, operation=copy)" \
  "A MANO EN LA UI DE n8n. NO por MCP."
echo "${A}campo File:${N} modo ${V}By ID${N}, en ${V}Expression${N}, con  ${V}{{ \$json.plantilla }}${N}"
echo "${A}hoy tiene:${N}  ${R}1DgRGflmdr7_-W16kf4Oo3NVoMtQ3QoshWNUGEgjSlx4${N} ${D}(literal, y NO es ninguna de las 8)${N}"
echo "${A}y en Options:${N} volver a anadir ${V}Same Folder As Original = true${N} ${D}(se perdio en el mismo cambio)${N}"
echo "${R}NUNCA con update_workflow del MCP: cada reescritura por API BORRA las credenciales${N}"
echo "${R}de los 14 nodos, y lo dice el sticky del propio workflow.${N}"
echo "${D}por que corre prisa: 'Preparar el informe' elige bien entre las ocho plantillas${N}"
echo "${D}(regimen x idioma) y NADIE USA ESE CALCULO. En cuanto la credencial de Google firme,${N}"
echo "${D}los ocho casos salen del MISMO documento: regimen e idioma equivocados en 7 de cada 8.${N}"
echo "${D}Y no falla: el PDF sale bien formado, se sube y se manda. Es el fallo mas caro que hay.${N}"
echo "${A}como comprobarlo despues:${N} reexportar por MCP y ver que el fileId vuelve a ser"
echo "${D}{'mode':'id','value':'={{ \$json.plantilla }}'} y que options trae sameFolder:true.${N}"
[ "$1" = copia ] && printf '{{ $json.plantilla }}' | pbcopy && echo "${B}-> copiado al portapapeles: {{ \$json.plantilla }}${N}"; }

p2(){ paso 2 "T074 · el swap de las automatizaciones de Airtable" \
  "AIRTABLE Mobility_2026 · app5K8OnSObqwWweS" "3b, '1. Envio borradores', 2 y 2b" \
  "TRES CLICS de deployed/undeployed. NO hay que editar ningun script."
echo "${V}HALLAZGO DEL 24/08: no hay que arreglar nada, hay que INTERCAMBIAR.${N} La 3b nativa"
echo "${D}(wflbayW4R4IvjHLTQ, hecha el 13/08) YA LLEVA DENTRO las seis correcciones, y esta${N}"
echo "${D}undeployed. La de script esta deployed. Es un swap, y es reversible.${N}"
echo
echo "${A}clic 1:${N} ${V}3b. Envio borradores 030 y 149 sin script${N} -> ${V}deployed${N}"
echo "${A}clic 2:${N} ${R}1. Envio borradores 030 y 149${N} ${D}(wflx5iCN4pXuwPAvO, la que los docs llaman${N}"
echo "${D}        'la 3': ESTA RENOMBRADA en la base)${N} -> ${R}undeployed${N}"
echo "${A}clic 3:${N} ${R}2. Usuario completa el formulario de confirmacion M030${N} -> ${R}undeployed${N}"
echo "${D}        (deja solo la 2b nativa, que ya esta deployed: hoy las DOS escriben sobre el${N}"
echo "${D}        mismo formulario viwjxT8e1uLg7K4OC. Esto ya se decidio el 19/08 y se ha vuelto${N}"
echo "${D}        a activar.)${N}"
echo
echo "${A}lo que se gana, medido en la config de las dos:${N}"
echo "${D} · la de script escribe Status=7 SIN condicion en las dos ramas -> una fila en 8 con${N}"
echo "${D}   EnviarBorradores marcada BAJA a 7. La 3b lo mete en un condicional duplicado dentro${N}"
echo "${D}   de cada rama de idioma (Airtable no deja nodos detras de un grupo condicional).${N}"
echo "${D} · la de script compara Idioma con 'Espanol'/'Ingles' exactos: con idioma vacio no manda${N}"
echo "${D}   nada y la ejecucion sale verde. En la 3b el ingles es el caso explicito y el espanol${N}"
echo "${D}   es la RAMA POR DEFECTO.${N}"
echo "${D} · el trigger de la 3b exige la tercera condicion (fldHucVawayh0zYvk no vacio): que los${N}"
echo "${D}   borradores EXISTAN. El de la de script no.${N}"
echo "${D} · Modificacion M149 llega al cliente, y el enlace sale del REGISTRO en las dos ramas${N}"
echo "${D}   (la rama inglesa de la vieja lo leia de la variable).${N}"
echo
echo "${R}OJO al orden del clic 1 y el 2:${N} entre uno y otro las DOS estan deployed. Con"
echo "${D}EnviarBorradores marcada eso son dos correos. Hazlo con la vista sin filas pendientes,${N}"
echo "${D}o al reves: primero undeploy de la vieja y luego deploy de la 3b.${N}"
echo "${V}LA 5 NO SE TOCA.${N} ${D}Aparcada a proposito: las comunicaciones al cliente iran por otra${N}"
echo "${D}via. Que nadie mande el informe desde Airtable NO es un fallo ahora mismo.${N}"
echo "${D}el detalle largo: docs/correcciones-automatizaciones-airtable-2026-08-21.md${N}"
[ "$1" = copia ] && echo "${D}(nada que copiar: son clics en Airtable)${N}"; }

p3(){ paso 3 "T068 · la no regresion que importa" "beckham_bot + los dos generadores" "(ninguno)" \
  "una conversacion que llegue al final, Messenger en INCOGNITO, workspace TEST"
echo "${A}un expediente que se cierra COMPLETO tiene que seguir yendo al${N} ${V}3. Pte hacer informe${N}"
echo "${D}o sea: el cambio del peldano 2 del 21/08 no puede dejar casos clavados en el 2. La${N}"
echo "${D}puerta test-decidir-status.js lo cubre con cinco no regresiones, pero conviene verlo${N}"
echo "${D}una vez en vivo.${N}"
echo "${D}y detras: informe y .030 en el tick siguiente, cada fila con SU fichero.${N}"
echo "${R}el Messenger REANUDA el hilo abierto: sin incognito no arrancas de cero.${N}"
echo "${D}y la fila del cliente anterior hay que neutralizarla (prefijo ARCHIVADA en UserId).${N}"; }

puertas(){ echo "${B}${C}━━━ LAS NUEVE PUERTAS ━━━${N}"
for t in test-decidir-status.js test-validador-2026-08-19.js test-prompt-v10.js test-prompt-v12.js test-prompt-v13.js test-lector-expediente.js test-v2-preparar-informe.js; do
  r=$(node "docs/$t" 2>&1 | grep -oE "[0-9]+ verdes, [0-9]+ rojas|TODO PASA · [0-9]+ comprobaciones"); node "docs/$t" >/dev/null 2>&1 \
    && printf "  ${V}OK${N}   %-38s %s\n" "$t" "$r" || printf "  ${R}FALLA${N} %-38s %s\n" "$t" "$r"
done
bash docs/montar-nodo-030.sh    >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-030.sh    || printf "  ${R}FALLA${N} %-38s\n" montar-nodo-030.sh
bash docs/montar-nodo-informe.sh >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-informe.sh || printf "  ${R}FALLA${N} %-38s\n" montar-nodo-informe.sh
}

case "$1" in
  test|puertas) puertas ;;
  21) bash docs/pasos-2026-08-21.sh ;;
  19|viejo) bash docs/pasos-2026-08-19.sh ;;
  ''|todos) puertas
    echo; echo "${B}${C}════ 3 PASOS · 24/08 ════${N}"
    for i in 1 2 3; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN ━━━${N}"
    echo "  1 (el v2, a mano) -> 2 (Airtable) -> 3 (la no regresion en vivo)"
    echo "  ${R}el 1 y el 2 van antes de que vuelva Alina:${N} el 1 porque en cuanto haya"
    echo "  credencial de Google el fallo se vuelve invisible, y el 2 porque la 3 ya puede"
    echo "  hacer retroceder una fila hoy mismo."
    echo; echo "${D}un paso suelto y copiado al portapapeles:${N}  bash docs/pasos.sh 1"
    echo "${D}los pasos del 21/08, ya hechos:${N}              bash docs/pasos.sh 21"
    echo "${D}los pasos del 19/08, ya hechos:${N}              bash docs/pasos.sh 19" ;;
  [1-3]) "p$1" copia ;;
  *) echo "uso: bash docs/pasos.sh [1-3|test|21|19]" ;;
esac
