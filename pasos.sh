#!/bin/bash
# Los pasos del 21/08 en la terminal. Sin abrir ningun fichero.
#   bash docs/pasos.sh        -> los 4 pasos y el orden
#   bash docs/pasos.sh 1      -> solo el paso 1, Y te lo copia al portapapeles
#   bash docs/pasos.sh test   -> pasa las siete puertas
#   bash docs/pasos.sh 19     -> los pasos del 19/08, que ya estan hechos
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

p1(){ paso 1 "el peldano 2 se escribe AL OFRECER la llamada" "beckham_bot · nhOwpiGxikeU5DLR" "Decidir_Status" "Cmd+A dentro del codigo, Cmd+V, guardar y PUBLICAR"
echo "${A}fichero:${N} docs/nodo-decidir-status-2026-08-21.js"
echo "${A}el contador tiene que decir:${N} ${V}11.191 caracteres${N} ${D}(antes 8.977)${N}"
echo "${R}EL NODO ENTERO, no por trozos: hoy un parche 'busca esta linea' acabo con una linea${N}"
echo "${R}de prosa dentro del codigo y un SyntaxError.${N}"
echo "${D}por que: la cola del fiscal dependia de que el cliente contestase DOS veces mas${N}"
echo "${D}despues del Calendly. Medido en la conv 215475580835251: se quedo en el peldano 1.${N}"
echo "${D}efecto aceptado: el 2 llega a mitad de conversacion, con casos aun incompletos.${N}"
[ "$1" = copia ] && pbcopy < docs/nodo-decidir-status-2026-08-21.js && echo "${B}-> copiado (11.191 car)${N}"; }

p2(){ paso 2 "prompt v13: NIF/NIE, patrimonio junto, y el Calendly pregunta" "LANGSMITH" "bot_mobility_prompt" "pegar Y mover el tag prod"
echo "${A}fichero:${N} docs/prompt-final-2026-08-21-v13.txt"
echo "${A}contador:${N} ${V}65.848 caracteres${N} ${D}(v12: 63.932, +1.916)${N}"
echo "${R}GUARDAR **Y** MOVER EL TAG prod. Sin el tag el bot sigue leyendo el v12.${N}"
echo "${D}4 cambios: D3 pide NIF o NIE sin nombrar el pasaporte · inversiones PEGADAS a${N}"
echo "${D}inmuebles (PF2, PF3) · hijos PF7 y observaciones PF8, ya no al reves · el mensaje${N}"
echo "${D}del Calendly termina pidiendo que avise y preguntando por dudas.${N}"
[ "$1" = copia ] && pbcopy < docs/prompt-final-2026-08-21-v13.txt && echo "${B}-> copiado (65.848 car)${N}"; }

p3(){ paso 3 "comprobar que el 2 se escribe de verdad" "beckham_bot" "(ninguno: conversacion real)" "Messenger en INCOGNITO, workspace TEST"
echo "${A}que hacer:${N} conversacion nueva, y al llegar al salario decir ${V}52.000${N}"
echo "${A}que mirar SIN llegar al final:${N} la fila tiene que estar ya en ${V}2. Pendiente llamada TD${N}"
echo "${D}en la traza de Decidir_Status: _requiere_llamada:true y _senales con la senal dentro.${N}"
echo "${R}el Messenger REANUDA el hilo abierto: sin incognito no arrancas de cero.${N}"
echo "${D}y la fila del cliente anterior hay que neutralizarla (prefijo ARCHIVADA en UserId).${N}"; }

p4(){ paso 4 "la no regresion que importa" "beckham_bot + los dos generadores" "(ninguno)" "una conversacion que llegue al final"
echo "${A}un expediente que se cierra COMPLETO tiene que seguir yendo al${N} ${V}3. Pte hacer informe${N}"
echo "${D}o sea: el cambio del paso 1 no puede dejar casos clavados en el 2. La puerta lo${N}"
echo "${D}cubre con cinco no regresiones, pero conviene verlo una vez en vivo.${N}"
echo "${D}y detras: informe y .030 en el tick siguiente, cada fila con SU fichero.${N}"; }

puertas(){ echo "${B}${C}━━━ LAS SIETE PUERTAS ━━━${N}"
for t in test-decidir-status.js test-validador-2026-08-19.js test-prompt-v10.js test-prompt-v12.js test-prompt-v13.js test-lector-expediente.js test-v2-preparar-informe.js; do
  r=$(node "docs/$t" 2>&1 | grep -oE "[0-9]+ verdes, [0-9]+ rojas|TODO PASA · [0-9]+ comprobaciones"); node "docs/$t" >/dev/null 2>&1 \
    && printf "  ${V}OK${N}   %-38s %s\n" "$t" "$r" || printf "  ${R}FALLA${N} %-38s %s\n" "$t" "$r"
done
bash docs/montar-nodo-030.sh    >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-030.sh    || printf "  ${R}FALLA${N} %-38s\n" montar-nodo-030.sh
bash docs/montar-nodo-informe.sh >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-informe.sh || printf "  ${R}FALLA${N} %-38s\n" montar-nodo-informe.sh
}

case "$1" in
  test|puertas) puertas ;;
  19|viejo) bash docs/pasos-2026-08-19.sh ;;
  ''|todos) puertas
    echo; echo "${B}${C}════ 4 PASOS · 21/08 ════${N}"
    for i in 1 2 3 4; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN ━━━${N}"
    echo "  1 (publicar) -> 2 (tag prod) -> 3 -> 4"
    echo "  ${R}el 1 y el 2 van juntos el mismo dia:${N} el prompt le dice al bot que no insista"
    echo "  porque 'el equipo ya lo ve', y eso solo es verdad con el nodo pegado."
    echo; echo "${D}un paso suelto y copiado al portapapeles:${N}  bash docs/pasos.sh 1"
    echo "${D}los pasos del 19/08, ya hechos:${N}              bash docs/pasos.sh 19" ;;
  [0-4]) "p$1" copia ;;
  *) echo "uso: bash docs/pasos.sh [1-4|test|19]" ;;
esac
