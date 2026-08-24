#!/bin/bash
# Lo que queda del 24/08. T073 y T074 YA ESTAN HECHOS Y PUBLICADOS.
#   bash docs/pasos.sh        -> lo que queda y el orden
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

p1(){ paso 1 "T068 · la no regresion que importa, y es lo unico que queda" \
  "beckham_bot + los dos generadores" "(ninguno)" \
  "una conversacion que llegue al final, Messenger en INCOGNITO, workspace TEST"
echo "${A}un expediente que se cierra COMPLETO tiene que seguir yendo al${N} ${V}3. Pte hacer informe${N}"
echo "${D}o sea: el cambio del peldano 2 del 21/08 no puede dejar casos clavados en el 2. La${N}"
echo "${D}puerta test-decidir-status.js lo cubre con cinco no regresiones, pero prueba EL CODIGO${N}"
echo "${D}del nodo, no el camino real: el webhook, el Upser, la columna, el filtro y el reloj${N}"
echo "${D}quedan fuera. Las dos roturas del 17/08 y del 18/08 fueron en el CABLEADO.${N}"
echo "${A}los pasos:${N} 1) incognito y workspace TEST · 2) neutralizar la fila anterior con el"
echo "${D}   prefijo ARCHIVADA en su UserId · 3) conversacion completa y cerrar con${N}"
echo "${V}   MotivoCierre='Expediente completo'${N} ${D}· 4) NO TOCAR NADA MAS · 5) la fila tiene que${N}"
echo "${D}   estar en el 3 · 6) al tick siguiente, DOS ejecuciones mode=trigger con ~18 s de${N}"
echo "${D}   diferencia, y la fila con su .030, su PDF, InformeListo y el Status en 4.${N}"
echo "${R}el Messenger REANUDA el hilo abierto: sin incognito no arrancas de cero.${N}"
echo "${D}referencia de que el mecanismo funciona (20/08): ejecuciones 8125154 y 8125157, .030 de${N}"
echo "${D}2.700 bytes y PDF de 33.089. Si no sale, el fallo esta en el dato o en el Status, no en${N}"
echo "${D}el reloj.${N}"; }

p2(){ paso 2 "las DOS decisiones que quedan, y son de una linea cada una" \
  "AIRTABLE Mobility_2026" "(ninguno)" "las decides tu; ejecutarlas son minutos"
echo "${A}a · comentarios149 se recibe y se tira.${N} El cuerpo del correo solo usa comentarios030,"
echo "${D}   asi que lo que escriba un fiscal en el 149 NO LO VE EL CLIENTE NUNCA y nada avisa.${N}"
echo "${D}   Arreglarlo de verdad esta dentro del script, y el script solo lo puede editar un${N}"
echo "${D}   COLABORADOR DEL SECRETO n8nApi (eacbfZbyDYjL9UWCW) -- o sea que es un permiso, no un${N}"
echo "${D}   imposible. Mientras: renombrar comentarios030 -> 'Comentarios al cliente' y${N}"
echo "${D}   comentarios149 -> 'Notas internas 149 (no se envia)'. ${N}${V}Es GRATIS y no rompe nada:${N}"
echo "${V}   el script recibe esos dos campos POR ID, no por nombre.${N}"
echo "${R}   Y CUATRO NOMBRES QUE NO SE PUEDEN RENOMBRAR NUNCA:${N} el script lee POR NOMBRE la tabla"
echo "${R}   Empleados y los campos Borrador030, Borrador149 y Linkconfirmacionmodelos.${N}"
echo "${D}   Renombrar cualquiera rompe el envio y no hay forma de arreglarlo. OJO con T071.${N}"
echo "${A}b · la 2 y la 2b siguen LAS DOS activas sobre el mismo formulario${N} (viwjxT8e1uLg7K4OC),"
echo "${D}   o sea dos escritores, y con eso la whitelist del 19/08 esta ANULADA. La 2 (script)${N}"
echo "${D}   copia las 93 columnas con lista negra de 5 y BORRA la fila del formulario; la 2b${N}"
echo "${D}   copia 3 campos con whitelist y no borra. Hay que apagar una.${N}"
echo "${V}   Recomendacion: apagar la 2.${N} ${D}Lo que se pierde son filas huerfanas del formulario, y${N}"
echo "${D}   estan PROBADAS como inofensivas (desde el 13/08 el enlace no prefija UserId y sin${N}"
echo "${D}   UserId el bot no las ve; se barren con la vista viwg0qUDTQVZvuadi). Lo que se${N}"
echo "${D}   arriesga dejandola es una sobrescritura SILENCIOSA del expediente de un cliente.${N}"; }

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
  24) bash docs/pasos-2026-08-24.sh ;;
  21) bash docs/pasos-2026-08-21.sh ;;
  19|viejo) bash docs/pasos-2026-08-19.sh ;;
  ''|todos) puertas
    echo; echo "${B}${C}════ LO QUE QUEDA · 24/08 ════${N}"
    for i in 1 2; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN ━━━${N}"
    echo "  ${V}T073 (la plantilla del v2) y T074 (las automatizaciones) HECHOS Y PUBLICADOS.${N}"
    echo "  Queda el 1 (la no regresion en vivo) y el 2 (tus dos decisiones)."
    echo; echo "${D}un paso suelto y copiado al portapapeles:${N}  bash docs/pasos.sh 1"
    echo "${D}los 3 pasos del 24/08, ya hechos:${N}            bash docs/pasos.sh 24"
    echo "${D}los pasos del 21/08, ya hechos:${N}              bash docs/pasos.sh 21"
    echo "${D}los pasos del 19/08, ya hechos:${N}              bash docs/pasos.sh 19" ;;
  [1-2]) "p$1" copia ;;
  *) echo "uso: bash docs/pasos.sh [1-2|test|24|21|19]" ;;
esac
