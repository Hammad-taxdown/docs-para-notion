#!/bin/bash
# Los pasos del 19/08 en la terminal. Sin abrir ningun fichero.
#   bash docs/pasos.sh        -> los 13 pasos
#   bash docs/pasos.sh 6      -> solo el paso 6, Y te lo copia al portapapeles
#   bash docs/pasos.sh test   -> pasa las 6 puertas
cd "$(dirname "$0")/.." || exit 1
B=$(printf '\033[1m'); D=$(printf '\033[2m'); V=$(printf '\033[32m'); A=$(printf '\033[33m')
R=$(printf '\033[31m'); C=$(printf '\033[36m'); N=$(printf '\033[0m')

F030='AND(OR({Status}="3. Pte hacer informe",{Status}="4. Informe enviado"), OR({Regenerar030}=1, {Fichero030}=BLANK()))'
FINF='AND(OR({Status}="3. Pte hacer informe",{Status}="4. Informe enviado"), OR({RegenerarInforme}=1, {InformePdf}=BLANK()))'

paso() {
cat <<EOF

${B}${C}━━━ PASO $1 ━━━${N} ${B}$2${N}
${D}workflow:${N} $3
${D}nodo:${N}     $4
${D}casilla:${N}  $5
EOF
}

p1(){ paso 1 "el filtro del informe pasa a aceptar el 3" "beckham_informe_mobility · Us5sFgXD9qVxJvxO" "Buscar filas pendientes" "Filter By Formula"
echo "${D}ahora dice:${N} AND({Status}=\"4. Informe enviado\", OR({RegenerarInforme}=1, {InformePdf}=BLANK()))"
echo "${A}Cmd+A, Delete, y pegar (SIN = delante, SIN salto de linea final):${N}"; echo "${V}$FINF${N}"
[ "$1" = copia ] && printf '%s' "$FINF" | pbcopy && echo "${B}-> copiado al portapapeles${N}"; }

p2(){ paso 2 "el informe escribe el peldano 4" "beckham_informe_mobility · Us5sFgXD9qVxJvxO" "Marcar InformeListo" "casilla NUEVA: Status"
echo "${D}ya escribe 4:${N} InformeListo, RegenerarInforme, ErrorInforme, InformeEnviadoEl  (+ el id, NO tocar)"
echo "${A}anadir la 5a casilla 'Status' con este valor literal, sin =:${N}"; echo "${V}4. Informe enviado${N}"
echo "${R}typecast:true -> una letra distinta NO falla: CREA UNA OPCION NUEVA. Cuatro, punto, UN espacio.${N}"
[ "$1" = copia ] && printf '%s' '4. Informe enviado' | pbcopy && echo "${B}-> copiado${N}"; }

p3(){ paso 3 "el informe avisa si se cae" "beckham_informe_mobility · Us5sFgXD9qVxJvxO" "(ninguno: Settings del workflow)" "Error Workflow"
echo "${D}tres puntos arriba a la derecha -> Settings -> Error Workflow${N}"
echo "${A}ahora esta VACIA. Poner:${N} ${V}beckham_alertas${N} ${D}(BJfExmwu1fI1aPpY)${N}"
echo "${D}beckham_alertas tiene un Error Trigger esperando justo esto.${N}"
echo "${B}Guarda y PUBLICA. Los pasos 1, 2 y 3 en la misma publicacion.${N}"; }

p4(){ paso 4 "el filtro del .030 pasa a aceptar el 3" "beckham_generar_030 · OoJ2l7PmxSHLxXA4" "Buscar filas pendientes" "Filter By Formula"
echo "${D}ahora dice:${N} AND({Status}=\"4. Informe enviado\", OR({Regenerar030}=1, {Fichero030}=BLANK()))"
echo "${A}Cmd+A, Delete, y pegar:${N}"; echo "${V}$F030${N}"
echo "${D}los dos peldanos y no solo el 3: los schedule van con 18 s de diferencia y con solo${N}"
echo "${D}el 3 un .030 que falle no reintenta jamas.${N}"
[ "$1" = copia ] && printf '%s' "$F030" | pbcopy && echo "${B}-> copiado${N}"; }

p5(){ paso 5 "el .030 avisa si se cae" "beckham_generar_030 · OoJ2l7PmxSHLxXA4" "(ninguno: Settings del workflow)" "Error Workflow"
echo "${A}poner:${N} ${V}beckham_alertas${N} ${D}(BJfExmwu1fI1aPpY)${N}"
echo "${B}Guarda y PUBLICA.${N}"; }

p6(){ paso 6 "validador: 501 gentilicios, umbral 50k, estado civil a 3, fuera el 1 de julio" "beckham_bot · nhOwpiGxikeU5DLR" "Validar y Normalizar" "el editor de codigo (Cmd+A, Delete, Cmd+V)"
echo "${A}fichero:${N} docs/nodo-validar-y-normalizar-2026-08-19.js"
echo "${A}el contador tiene que decir:${N} ${V}73.081 caracteres${N} ${D}(antes 40.317)${N}"
echo "${R}si te sale 75.205 eso son BYTES. La cifra buena es 73.081.${N}"
echo "${D}NO ejecutes el nodo suelto: sin webhook no tiene body y da _invalid:true.${N}"
[ "$1" = copia ] && pbcopy < docs/nodo-validar-y-normalizar-2026-08-19.js && echo "${B}-> copiado (73.081 car)${N}"; }

p7(){ paso 7 "fuera el parametro de la fecha de la llamada" "beckham_bot · nhOwpiGxikeU5DLR" "guardar_datos_cliente (HTTP Request Tool)" "Body Parameters"
echo "${A}hay 41. Borrar la fila 'fecha_llamada' con su papelera. Tienen que quedar${N} ${V}40${N}"; }

p8(){ paso 8 "el lector deja de estar ciego (2 cambios en el mismo nodo)" "beckham_bot · nhOwpiGxikeU5DLR" "Buscar Expediente en Airtable" "Options -> Fields   Y   pestana Settings"
echo "${A}8a${N} Options -> Fields tiene 21 campos. ${B}QUITA LA OPCION 'Fields' ENTERA${N} (su X)."
echo "   ${D}si dejas la whitelist, el paso 9 no sirve: no puede formatear lo que Airtable no manda.${N}"
echo "${A}8b${N} pestana Settings del nodo:"
echo "   On Error         -> ${V}Continue (using regular output)${N}"
echo "   Retry On Fail    -> ${V}activado${N}"
echo "   Always Output Data -> ${D}ya esta activado, dejarlo${N}"
echo "   ${D}es la unica de las 5 lecturas de Airtable del workflow que va sin guardas.${N}"; }

p9(){ paso 9 "el lector devuelve 47 claves en vez de 21" "beckham_bot · nhOwpiGxikeU5DLR" "Formatear Respuesta Expediente" "el editor de codigo"
echo "${A}fichero:${N} docs/nodo-lector-expediente-2026-08-19.js"
echo "${A}contador:${N} ${V}7.621 caracteres${N}, 149 lineas"
echo "${D}el escritor guarda 57 y el lector devolvia 21: por eso el bot repreguntaba datos ya${N}"
echo "${D}guardados. Los documentos van como BOOLEANOS: las URLs de Airtable caducan el mismo dia.${N}"
echo "${R}los pasos 8 y 9 van ATADOS.${N}"
[ "$1" = copia ] && pbcopy < docs/nodo-lector-expediente-2026-08-19.js && echo "${B}-> copiado (7.621 car)${N}"; }

p10(){ paso 10 "el bot escribe el 3 y ya no el 4" "beckham_bot · nhOwpiGxikeU5DLR" "Decidir_Status" "el editor de codigo"
echo "${A}fichero:${N} docs/nodo-decidir-status-2026-08-19.js"
echo "${A}contador:${N} ${V}8.977 caracteres${N} ${D}(antes 8.082)${N}"
echo "${R}EL ULTIMO DE N8N. Va DESPUES de los pasos 1, 2 y 4: si no, una fila que cierre se${N}"
echo "${R}queda clavada en el 3 y no la recoge nadie.${N}"
echo "${B}Guarda y PUBLICA beckham_bot con los pasos 6,7,8,9,10 de una vez.${N}"
[ "$1" = copia ] && pbcopy < docs/nodo-decidir-status-2026-08-19.js && echo "${B}-> copiado (8.977 car)${N}"; }

p11(){ paso 11 "3b no manda el correo si no hay borradores" "AIRTABLE · automatizacion 3b (wflbayW4R4IvjHLTQ)" "el trigger: When record matches conditions" "anadir 2 condiciones con AND"
echo "${D}ahora solo tiene:${N} EnviarBorradores (fldGSgXLLCf2okzvB) is checked"
echo "${A}anadir:${N}"
echo "   Borrador030 (fldZ6RNPfTbK2S3MR)  ->  ${V}is not empty${N}"
echo "   Borrador149 (fldHucVawayh0zYvk)  ->  ${V}is not empty${N}"
echo "${D}es el mismo patron que ya tiene la automatizacion 5 (InformePdf is not empty).${N}"
echo "${D}Ya salio un correo con los dos borradores VACIOS. Publica la automatizacion.${N}"; }

p12(){ paso 12 "las automatizaciones 2 y 2b estan al reves — ${R}DECIDES TU${N}" "AIRTABLE" "2 (wflo1oMmSWlcYsO3V) y 2b (wflvsvULr5SUHcgPN)" "deployed / undeployed"
echo "   ${R}2  esta VIVA${N}  customScript: copia TODOS los campos del formulario al expediente y borra la fila"
echo "   ${A}2b esta APAGADA${N} nativa: copia SOLO 3 campos explicitos, pero NO borra la fila"
echo "${D}riesgo abierto: el dia que alguien anada un campo al formulario, ese campo sobrescribe${N}"
echo "${D}el expediente sin que nadie lo decida. Y la 2 no se puede editar (customScript).${N}"
echo "${B}NO LO TOCO. Dime si y te doy los dos clics.${N}"; }

p13(){ paso 13 "prompt v10" "LANGSMITH" "bot_mobility_prompt" "el editor + el tag prod"
echo "${A}fichero:${N} docs/prompt-final-2026-08-19-v10.txt"
echo "${A}contador:${N} ${V}60.328 caracteres${N} ${D}(v9: 59.708, +620)${N}"
echo "${R}GUARDAR **Y** PONER EL TAG prod. Sin el tag el bot sigue leyendo el v9.${N}"
echo "${D}17 cambios: umbral 50k, el 1 de julio fuera del enrutado, estado civil a 3, fuera la${N}"
echo "${D}pregunta de la fecha (incluido el recordatorio 11b), los 2 links nuevos y el 24-48h.${N}"
[ "$1" = copia ] && pbcopy < docs/prompt-final-2026-08-19-v10.txt && echo "${B}-> copiado (60.328 car)${N}"; }

puertas(){ echo "${B}${C}━━━ LAS SEIS PUERTAS ━━━${N}"
for t in test-decidir-status.js test-validador-2026-08-19.js test-prompt-v10.js test-lector-expediente.js; do
  r=$(node "docs/$t" 2>&1 | grep -oE "[0-9]+ verdes, [0-9]+ rojas"); node "docs/$t" >/dev/null 2>&1 \
    && printf "  ${V}OK${N}   %-38s %s\n" "$t" "$r" || printf "  ${R}FALLA${N} %-38s %s\n" "$t" "$r"
done
bash docs/montar-nodo-030.sh    >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-030.sh    || printf "  ${R}FALLA${N} %-38s\n" montar-nodo-030.sh
bash docs/montar-nodo-informe.sh >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-informe.sh || printf "  ${R}FALLA${N} %-38s\n" montar-nodo-informe.sh
}

case "$1" in
  test|puertas) puertas ;;
  ''|todos) puertas
    echo; echo "${B}${C}════ 13 PASOS · Airtable (renombrar + 3b) YA ESTA HECHO ════${N}"
    for i in 1 2 3 4 5 6 7 8 9 10 11 12 13; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN ━━━${N}"
    echo "  1,2,3 juntos (publicar) -> 4,5 (publicar) -> 6,7,8,9,10 juntos (publicar) -> 11 -> 13"
    echo "  ${R}el 10 SIEMPRE despues del 1, 2 y 4.${N}  el 13 el ultimo: reversible en un clic."
    echo; echo "${D}un paso suelto y copiado al portapapeles:${N}  bash docs/pasos.sh 6" ;;
  [0-9]|1[0-3]) "p$1" copia ;;
  *) echo "uso: bash docs/pasos.sh [1-13|test]" ;;
esac
