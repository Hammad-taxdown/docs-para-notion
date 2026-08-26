#!/bin/bash
# 26/08 · ADAPTAR LO NUESTRO A LA ESCALERA RENUMERADA DE ICIAR.
# Lo de partners (1. Actualizar status partner y 2. Envio mensaje agendar llamada)
# NO SE TOCA: va por su cuenta.
#   bash docs/pasos.sh        -> los pasos y el orden
#   bash docs/pasos.sh 1      -> un paso suelto, Y lo copia al portapapeles
#   bash docs/pasos.sh test   -> pasa las DOCE puertas
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

p1(){ paso 1 "el prompt v14 con el SLA de 24-48 horas del escalado" \
  "LANGSMITH" "bot_mobility_prompt" "pegar Y mover el tag prod"
echo "${A}fichero:${N} docs/prompt-final-2026-08-26-v14.txt"
echo "${A}el contador tiene que decir:${N} ${V}66.020 caracteres${N} ${D}(v13: 65.848, +172)${N}"
echo "${R}GUARDAR **Y** MOVER EL TAG prod. Sin el tag el bot sigue leyendo el v13.${N}"
echo "${D}que cambia: la regla 11 pasa a decir el plazo al remitir a support, acota que${N}"
echo "${D}ese es el UNICO plazo que puede dar, y el NIVEL 2 del escalado tambien lo dice.${N}"
echo "${A}OJO AL MATIZ:${N} ${D}el 24-48 YA ESTABA cuatro veces en el prompt, pero para OTRA${N}"
echo "${D}cosa -- 'el equipo REVISA EL EXPEDIENTE en 24-48 horas'. Lo que faltaba era el${N}"
echo "${D}plazo de RESPUESTA al escalar. Son dos promesas con la misma cifra: la puerta las${N}"
echo "${D}cuenta por separado para que el dia que una cambie salte.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 5"
echo "${B}verificar:${N}  node docs/test-prompt-v14.js   ${D}-> 110 verdes, 0 rojas${N}"
[ "$1" = copia ] && bash docs/copiar.sh 5; }

p2(){ paso 2 "WP-216 · las correcciones del canvas, y una CIERRA CONVERSACIONES" \
  "INTERCOM · Custom Bot OnClick Mobility" "varios pasos del canvas" \
  "a mano en la UI. El canvas NO se toca por API"
echo "${R}1 · EL TYPO. El atributo es ${N}${V}veredicto_f2${N}${R} con E.${N} Si en algun branch esta"
echo "${D}   escrito con I, ese atributo NO EXISTE, el branch cae SIEMPRE al else, y el else${N}"
echo "${R}   CIERRA LA CONVERSACION.${N} ${D}Marcado como hecho verificado en el PRD. Buscalo en${N}"
echo "${D}   TODOS los branches del path I.${N}"
echo "${R}2 · BORRAR 'M. Path'.${N} ${D}Los outputs de un Data Connector son LOCALES A SU PATH, y su${N}"
echo "${D}   Object mapping PISA el resultado del primero. El veredicto ya esta en el${N}"
echo "${D}   atributo despues de F. La rama fuera_plazo pasa a ir a ${N}${V}N${N}${D} directo.${N}"
echo "${R}3 · BORRAR 'SAVE'.${N} ${D}Escribir un atributo en un paso para leerlo en otro es el${N}"
echo "${D}   patron que costo cinco dias. La fecha viaja como input del DC en el mismo path.${N}"
echo "${R}4 · Close conversation SOLO en D y en N.${N} ${D}El resto de ramas terminan con el hilo${N}"
echo "${D}   ABIERTO, y NINGUNA toca ticket.state.${N}"
echo "${R}5 · El else de 'I. Path' se parte en dos.${N} ${D}Fecha no parseable -> repreguntar con${N}"
echo "${D}   intentos_fecha_bot (<2 repregunta con ejemplo literal, ==2 escala). Veredicto${N}"
echo "${D}   VACIO -> es fallo de sistema, escala SIN repreguntar. Y se elimina K -> FRETRY -> M.${N}"
echo "${R}6 · Eliminar FLAG y RESUME -> B del diseno.${N} ${D}No se construyen.${N}"
echo "${A}antes de tocar:${N} ${V}duplica el Custom Bot${N} ${D}(OnClick Mobility — BACKUP AAAAMMDD).${N}"
echo "${D}Hoy entran leads reales por ahi, y WP-233 ya lo pide.${N}"
echo "${B}verificar:${N} ${D}una conversacion con fecha no parseable REPREGUNTA en vez de cerrarse,${N}"
echo "${D}y el hilo sigue ABIERTO en G y en H. Lo compruebo yo leyendo la conversacion.${N}"; }

p3(){ paso 3 "WP-232 · la description de beckham_bot y los cuatro renombrados gratis" \
  "N8N · beckham_bot (nhOwpiGxikeU5DLR)" "ajustes del workflow y 4 nodos" \
  "a mano en la UI. NO por MCP"
echo "${A}3.1 · la description${N} ${D}(es el unico de los ocho que la tiene VACIA)${N}"
echo "   ${D}menu de los tres puntos, arriba a la derecha -> Settings -> Description${N}"
echo "   ${B}pegar:${N} bash docs/copiar.sh 6"
echo "${R}   por que a mano y no por MCP:${N} ${D}update_workflow exige reenviar el workflow${N}"
echo "${D}   ENTERO -- 55 nodos, dos de codigo de 198 y 241 KB. Un campo de texto no vale eso.${N}"
echo
echo "${A}3.2 · los renombrados que salen GRATIS${N} ${D}(doble clic en el nombre del nodo)${N}"
echo "   ${D}If2                       -> ${N}${V}If_debounce${N}"
echo "   ${D}Wait2                     -> ${N}${V}Wait_debounce${N}"
echo "   ${D}Airtable Upser Expediente -> ${N}${V}Airtable_Upsert_Expediente${N} ${D}(y cae la errata)${N}"
echo "   ${D}el workflow ${N}${V}beckham_f2_plazo.${N}${D} -> quitarle EL PUNTO FINAL${N}"
echo "   ${D}Los tres nodos tienen ${N}${V}CERO${N}${D} referencias en expresiones: medido hoy, no estimado.${N}"
echo "   ${D}n8n reescribe connections solo. Y el f2 se llama por ${N}${V}id${N}${D}, no por nombre.${N}"
echo
echo "${R}3.3 · Webhook1 NO entra aqui.${N} ${D}Tiene ${N}${R}13 referencias${N}${D}, y ${N}${R}2 estan dentro de${N}"
echo "${D}   nodos ${N}${R}code${N}${D} -- Formatear_conversacion1 y Preparar_Prompt -- donde n8n ${N}${R}NO${N}"
echo "${D}   reescribe nada al renombrar. Si se hace sin tocar esas dos a mano,${N}"
echo "${R}   Preparar_Prompt apunta a un nodo que no existe y el bot vuelve a preguntar${N}"
echo "${R}   lo que el cliente ya conto.${N} ${D}Que es el peor sintoma que tiene este proyecto.${N}"
echo "   ${D}Si algun dia se hace: renombrar Y repegar los dos nodos de codigo en el${N}"
echo "${D}   mismo movimiento. Esta escrito en la §30.2 del PRD maestro.${N}"
echo "${B}verificar:${N}  bash docs/pasos.sh test  ${D}-> las diez siguen verdes${N}"
echo "${D}            y una conversacion de prueba: si Preparar_Prompt esta bien, el bot NO${N}"
echo "${D}            repregunta el nombre. Eso lo compruebo yo.${N}"
[ "$1" = copia ] && bash docs/copiar.sh 6; }

puertas(){ echo "${B}${C}━━━ LAS DOCE PUERTAS ━━━${N}"
for t in test-decidir-status.js test-validador-2026-08-19.js test-prompt-v10.js test-prompt-v12.js test-prompt-v13.js test-prompt-v14.js test-lector-expediente.js test-v2-preparar-informe.js test-contrato-upsert.js test-log-evento.js; do
  r=$(node "docs/$t" 2>&1 | grep -oE "[0-9]+ verdes, [0-9]+ rojas|TODO PASA · [0-9]+ comprobaciones"); node "docs/$t" >/dev/null 2>&1 \
    && printf "  ${V}OK${N}   %-38s %s\n" "$t" "$r" || printf "  ${R}FALLA${N} %-38s %s\n" "$t" "$r"
done
bash docs/montar-nodo-030.sh    >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-030.sh    || printf "  ${R}FALLA${N} %-38s\n" montar-nodo-030.sh
bash docs/montar-nodo-informe.sh >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-informe.sh || printf "  ${R}FALLA${N} %-38s\n" montar-nodo-informe.sh
}

case "$1" in
  test|puertas) puertas ;;
  26) bash docs/pasos-2026-08-26-renumeracion.sh ;;
  24) bash docs/pasos-2026-08-24.sh ;;
  21) bash docs/pasos-2026-08-21.sh ;;
  19|viejo) bash docs/pasos-2026-08-19.sh ;;
  ''|todos) puertas
    echo; echo "${B}${C}════ ADAPTAR A LA ESCALERA NUEVA · 26/08 ════${N}"
    for i in 1 2 3; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN ━━━${N}"
    echo "  ${R}el 2 va primero:${N} el typo del veredicto puede estar cerrando"
    echo "  conversaciones de clientes ahora mismo, y ese es el unico de los tres"
    echo "  que le pasa algo a un cliente real."
    echo "  ${D}El 1 es pegar y mover el tag: dos minutos. El 3 es higiene y no corre prisa,${N}"
    echo "  ${D}pero cierra WP-232 y deja escrito por que Webhook1 no se toca.${N}"
    echo; echo "${D}un paso suelto y copiado al portapapeles:${N}  bash docs/pasos.sh 1" ;;
  [1-3]) "p$1" copia ;;
  *) echo "uso: bash docs/pasos.sh [1-3|test|26|24|21|19]" ;;
esac
