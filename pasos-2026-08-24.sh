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

p2(){ paso 2 "T074 · adaptar lo nuestro a las automatizaciones de Iciar" \
  "AIRTABLE Mobility_2026 · app5K8OnSObqwWweS" "1. Envio borradores 030 y 149 (wflx5iCN4pXuwPAvO)" \
  "en la UI de Airtable. NO hay que tocar ni una linea de script."
echo "${V}SE QUEDAN LAS DE ICIAR, y no es preferencia: su script NO manda el correo.${N} Hace"
echo "${D}POST a es.synapse.rentax.es/webhook/a6a3ebaa... con notif=NOTIF_Mobility_BorradorM030 y${N}"
echo "${D}transactionalIDCustomer=54, o sea que el correo sale por el sistema transaccional de${N}"
echo "${D}TaxDown. Nuestras 3b y 5 usan sendEmail DE AIRTABLE: es otro canal.${N}"
echo "${A}consecuencia:${N} la ${V}3b se queda undeployed PARA SIEMPRE${N} ${D}(publicarla = dos correos${N}"
echo "${D}por el mismo hito, uno de cada canal) y la ${N}${V}5 sigue aparcada${N} ${D}-- 'la otra via' es${N}"
echo "${D}ese webhook. Que el informe no salga desde Airtable NO es un fallo.${N}"
echo
echo "${B}LOS TRES ARREGLOS, y los tres estan en la parte NATIVA:${N}"
echo "${R}A · la guarda del Status. La grave.${N} Hoy el updateRecord de cada rama escribe"
echo "${D}   Status=7 (sel1oCLW0XPLZNZz7) + Estado030149=3 (selBhjx9YrZGJUSz0) SIN condicion: una${N}"
echo "${D}   fila en 8, 9 u 11 con EnviarBorradores marcada BAJA a 7. Hay que envolver SOLO el${N}"
echo "${D}   updateRecord en un grupo condicional (el script se queda fuera, delante):${N}"
echo "${A}     rama 1:${N} Status es 1, 2, ${V}4${N}, 5, 6 o esta vacio -> Status=7 y Estado030149"
echo "${A}     rama 2:${N} el resto                          -> SOLO Estado030149"
echo "${R}   en esa lista va el 4 y NO va el 3.${N} ${D}El 18/08 una fila en 3 subio al 7 antes del${N}"
echo "${D}   tick y el informe no se genero nunca: los generadores solo miran 3 y 4. En el 4 ya${N}"
echo "${D}   estan los dos ficheros subidos, asi que 4 -> 7 es el paso normal.${N}"
echo "${D}   Y duplicada dentro de CADA rama de idioma: Airtable no deja nodos detras de un grupo.${N}"
echo "${R}B · con Idioma vacio no se manda nada y la ejecucion sale VERDE.${N} Las ramas comparan"
echo "${D}   Idioma con valores exactos (Espanol selpK6kadMNE60g0g / Ingles selB0lkXu3bmepNM3) y el${N}"
echo "${D}   campo es un singleSelect de solo esas dos: la celda vacia no entra en ninguna.${N}"
echo "${A}   un solo clic:${N} la condicion de la rama espanola pasa de ${R}Idioma es Espanol${N} a"
echo "${V}   Idioma NO es Ingles${N} ${D}-- el 'is not' de un singleSelect SI incluye las vacias, asi${N}"
echo "${D}   que el espanol queda como rama por defecto sin tocar el orden ni la rama inglesa.${N}"
echo "${R}C · el trigger no exige que los borradores existan.${N} Pide EnviarBorradores marcada y"
echo "${D}   Borrador030 no vacio (fldZ6RNPfTbK2S3MR). Anadir ${N}${V}Borrador149 no vacio${N}"
echo "${D}   (fldHucVawayh0zYvk): los dos scripts adjuntan los dos y el correo dice 'los dos${N}"
echo "${D}   tramites'. Es la misma tercera condicion que lleva la 3b.${N}"
echo
echo "${A}LO QUE NO SE PUEDE ARREGLAR SIN TOCAR EL SCRIPT:${N} comentarios149 (fldQ3T7KtPYTZeYcK) se"
echo "${D}pasa en el inputObj y el cuerpo del correo SOLO usa comentarios030. Si un fiscal escribe${N}"
echo "${D}ahi, el cliente no lo ve nunca y nada avisa. Salidas, las dos de producto: escribir${N}"
echo "${D}siempre en comentarios030, u ocultar/renombrar la columna. ${N}${A}TU DECISION.${N}"
echo "${A}Y LA 2 CONTRA LA 2b SIGUE ABIERTA:${N} las dos deployed sobre el mismo formulario"
echo "${D}viwjxT8e1uLg7K4OC = dos escritores. La 2 (script) copia las 93 columnas con lista negra${N}"
echo "${D}de 5 y BORRA la fila del formulario; la 2b copia 3 campos con whitelist y no borra. Con${N}"
echo "${D}las dos vivas la whitelist del 19/08 esta anulada. Hay que apagar una. ${N}${A}TU DECISION.${N}"
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
