#!/bin/bash
# 26/08 · ADAPTAR LO NUESTRO A LA ESCALERA RENUMERADA DE ICIAR.
# Lo de partners (1. Actualizar status partner y 2. Envio mensaje agendar llamada)
# NO SE TOCA: va por su cuenta.
#   bash docs/pasos.sh        -> los pasos y el orden
#   bash docs/pasos.sh 1      -> un paso suelto, Y lo copia al portapapeles
#   bash docs/pasos.sh test   -> pasa las NUEVE puertas
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

tabla(){ echo "${D}la traduccion, y son los cinco nombres que nos tocan:${N}"
echo "${D}  '2. Pendiente llamada TD' -> ${N}${V}'3. Pendiente llamada TD'${N}"
echo "${D}  '3. Pte hacer informe'    -> ${N}${V}'4. Pte hacer informe'${N}"
echo "${D}  '4. Informe enviado'      -> ${N}${V}'5. Informe enviado'${N}"
echo "${D}  '12. Descartado'          -> ${N}${V}'13. Descartado'${N}"
echo "${D}  '1. Interesado'           -> ${N}${V}igual${N}"
echo "${D}  y entra el peldano NUEVO  -> ${N}${V}'2. Pte agendar llamada'${N}"; }

p1(){ paso 1 "el nodo Decidir_Status con la escalera de 13 peldanos" \
  "beckham_bot · nhOwpiGxikeU5DLR" "Decidir_Status" \
  "Cmd+A dentro del codigo, Cmd+V, guardar y PUBLICAR"
echo "${A}fichero:${N} docs/nodo-decidir-status-2026-08-26.js"
echo "${A}el contador tiene que decir:${N} ${V}11.975 caracteres${N} ${D}(antes 11.191)${N}"
echo "${R}EL NODO ENTERO, no por trozos.${N}"
tabla
echo "${D}que cambia dentro: el mapa ORDEN pasa a 13 peldanos con los nombres COPIADOS${N}"
echo "${D}del schema vivo, los cuatro 'propuesto =' se renumeran, y la guarda del${N}"
echo "${D}descarte pasa de nActual>2 a nActual>3 porque el peldano de la llamada${N}"
echo "${D}ahora es el 3.${N}"
echo "${A}la puerta ya lo mide:${N} test-decidir-status.js, ${V}30 verdes${N} ${D}(antes 28; las dos${N}"
echo "${D}nuevas son el peldano 2 de Iciar subiendo al 4 y al 3).${N}"
[ "$1" = copia ] && pbcopy < docs/nodo-decidir-status-2026-08-26.js && echo "${B}-> copiado (11.975 car)${N}"; }

p2(){ paso 2 "el filtro del .030" "beckham_generar_030 · OoJ2l7PmxSHLxXA4" \
  "Buscar filas pendientes (Airtable, search)" "campo Filter By Formula, y PUBLICAR"
echo "${R}hoy busca dos nombres que YA NO EXISTEN, asi que devuelve 0 filas SIEMPRE.${N}"
echo "${A}pegar esto tal cual:${N}"
echo "${V}AND(OR({Status}=\"4. Pte hacer informe\",{Status}=\"5. Informe enviado\"), OR({Regenerar030}=1, {Fichero030}=BLANK()))${N}"
echo "${D}sin el = inicial y sin salto de linea final.${N}"
[ "$1" = copia ] && printf 'AND(OR({Status}="4. Pte hacer informe",{Status}="5. Informe enviado"), OR({Regenerar030}=1, {Fichero030}=BLANK()))' | pbcopy && echo "${B}-> copiado${N}"; }

p3(){ paso 3 "el informe v1: el filtro Y el Status que escribe" \
  "beckham_informe_mobility · Us5sFgXD9qVxJvxO" "Buscar filas pendientes + Marcar InformeListo" \
  "dos nodos, y PUBLICAR una sola vez al final"
echo "${A}3a · Buscar filas pendientes${N} -> Filter By Formula:"
echo "${V}AND(OR({Status}=\"4. Pte hacer informe\",{Status}=\"5. Informe enviado\"), OR({RegenerarInforme}=1, {InformePdf}=BLANK()))${N}"
echo "${A}3b · Marcar InformeListo${N} ${D}(es un nodo de Airtable NATIVO, no un http)${N}"
echo "${D}   en la lista de campos, el campo ${N}${V}Status${N}${D} es un DESPLEGABLE: hoy tiene${N}"
echo "${R}   '4. Informe enviado'${N}${D} y hay que reelegir ${N}${V}'5. Informe enviado'${N}"
echo "${R}   si no se cambia, el PATCH falla DESPUES de subir el PDF: la fila se queda${N}"
echo "${R}   sin InformeListo y sin Status, y REENTRA EN CADA TICK para siempre.${N}"
[ "$1" = copia ] && printf 'AND(OR({Status}="4. Pte hacer informe",{Status}="5. Informe enviado"), OR({RegenerarInforme}=1, {InformePdf}=BLANK()))' | pbcopy && echo "${B}-> copiado el filtro de 3a${N}"; }

p4(){ paso 4 "el informe v2, lo mismo, para que no nazca roto" \
  "beckham_informe_mobility_v2 · snoDqB063jMSgzUq" "Buscar filas pendientes + Marcar InformeListo" \
  "NO se publica: sigue inactivo esperando la credencial de Google"
echo "${A}4a · el mismo filtro que en 3a.${N}"
echo "${A}4b · Marcar InformeListo${N} ${D}aqui SI es un httpRequest: en su JSON Body cambiar${N}"
echo "${R}   Status: '4. Informe enviado'${N}${D} por ${N}${V}Status: '5. Informe enviado'${N}"
echo "${R}A MANO EN LA UI, nunca por MCP: reescribir el v2 por API borra las${N}"
echo "${R}credenciales de sus 14 nodos.${N}"
echo "${D}se hace ahora porque si no, el dia que Alina conecte la credencial el v2${N}"
echo "${D}arranca ya roto y nadie se acuerda de por que.${N}"; }

p5(){ paso 5 "Airtable: un clic en la guarda, y la fila que retrocedio" \
  "AIRTABLE Mobility_2026" "1. Envio borradores 030 y 149 · wflx5iCN4pXuwPAvO" \
  "un clic y una celda"
echo "${V}BUENA NOTICIA: la guarda del Status que montamos el 24/08 NO se rompio,${N}"
echo "${V}porque va por IDs de opcion y los IDs no cambiaron.${N} ${D}Pero su SIGNIFICADO si:${N}"
echo "${D}la lista era 1,2,4,5,6 y hoy es 1,3,5,6,7.${N}"
echo "${A}5a · SOLO HAY QUE ANADIR UNO.${N} En las DOS ramas que llevan la guarda (la"
echo "${D}   espanola y la inglesa), en 'Status es cualquiera de', anadir${N}"
echo "${V}   '2. Pte agendar llamada'${N}${D}. Lo demas se queda: el que hay que dejar FUERA${N}"
echo "${D}   sigue siendo 'Pte hacer informe' (mismo id), que ya estaba fuera.${N}"
echo "${A}5b · la fila que retrocedio:${N} ${V}recp0TwCJ7RPzhwbA${N} ${D}(MAXIMILIAN BOSSERT) estaba${N}"
echo "${D}   en 'Informe enviado' con InformeListo marcado y hoy esta en '2. Pte${N}"
echo "${D}   agendar llamada'. Devolverla a ${N}${V}'5. Informe enviado'${N}${D}.${N}"
echo "${D}NO SE TOCA: la automatizacion 4 (va por IDs y sigue correcta), ni la 3b ni${N}"
echo "${D}la 5 (undeployed), ni nada de partners.${N}"; }

p6(){ paso 6 "la prueba, la misma de T068 y no vale darla por hecha" \
  "el webhook del escritor" "(ninguno)" "dos curl y mirar la fila"
echo "${D}con el nodo publicado, repetir lo del 24/08 con un user_id de prueba:${N}"
echo "${D}  1) senal de complejidad sin cierre  -> tiene que quedar en ${N}${V}3. Pendiente llamada TD${N}"
echo "${D}  2) motivo_cierre='Expediente completo' -> tiene que subir a ${N}${V}4. Pte hacer informe${N}"
echo "${D}  3) esperar el tick y ver DOS ejecuciones mode=trigger con ~18 s de diferencia${N}"
echo "${A}y al acabar, limpiar la fila${N} ${D}(ponerla en '13. Descartado' y prefijar ARCHIVADA${N}"
echo "${D}en el UserId): si se queda en el 4 sin ficheros, reentra en cada tick.${N}"
echo "${D}esto lo puedo lanzar yo cuando me digas que ya has publicado.${N}"; }

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
    echo; echo "${B}${C}════ ADAPTAR A LA ESCALERA NUEVA · 26/08 ════${N}"
    for i in 1 2 3 4 5 6; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN ━━━${N}"
    echo "  ${R}1 -> 2 -> 3 son los que desatascan.${N} Mientras no esten los tres, el"
    echo "  informe y el .030 NO SALEN: sus filtros buscan nombres que ya no existen"
    echo "  y llevan desde el cambio corriendo en vacio, en verde y en medio segundo."
    echo "  El 4 va detras para que el v2 no nazca roto, el 5 son dos clics y el 6 es"
    echo "  la unica forma de saber que ha quedado bien."
    echo; echo "${D}un paso suelto y copiado al portapapeles:${N}  bash docs/pasos.sh 1" ;;
  [1-6]) "p$1" copia ;;
  *) echo "uso: bash docs/pasos.sh [1-6|test|24|21|19]" ;;
esac
