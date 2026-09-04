#!/bin/bash
# 26/08 · ADAPTAR LO NUESTRO A LA ESCALERA RENUMERADA DE ICIAR.
# Lo de partners (1. Actualizar status partner y 2. Envio mensaje agendar llamada)
# NO SE TOCA: va por su cuenta.
#   bash docs/pasos.sh        -> los pasos y el orden
#   bash docs/pasos.sh 1      -> un paso suelto, Y lo copia al portapapeles
#   bash docs/pasos.sh 5      -> 31/08 · el prompt v15, el agente conversacional unico
#   bash docs/pasos.sh test   -> pasa las VEINTISEIS puertas (25 hasta el 04/09 mediodia, 23 el 03/09)
#   bash docs/pasos.sh 18..19 -> 04/09 tarde · la tool transferir_humano (de Iciar) y el prompt v18 (Notion + transferencia)
#   bash docs/pasos.sh 15..17 -> 04/09 · la autorizacion prerrellenada viaja a Intercom (tool enviar_autorizacion)
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

p2(){ paso 2 "WP-216 · SUPERADO EL 27/08: el canvas se construye DESDE CERO" \
  "INTERCOM · Custom Bot OnClick Mobility" "el canvas ENTERO, en una COPIA" \
  "a mano en la UI. El canvas NO se toca por API"
echo "${R}SUPERADO EL 27/08.${N} ${D}Decision del usuario: el canvas nuevo se construye desde cero${N}"
echo "${D}en una COPIA del Custom Bot (el disparador se cambia AL FINAL). Las 6 correcciones de${N}"
echo "${D}WP-216 van DENTRO del rebuild como invariantes, no como parches al canvas viejo.${N}"
echo "${B}plan completo:${N} docs/canvas-desde-cero-2026-08-27.md"
echo "${D}El typo B1 (veredicto_f2 con E) ya estaba corregido y verificado. Las otras cinco,${N}"
echo "${D}como referencia de lo que el canvas nuevo NO reconstruye:${N}"
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

p4(){ paso 4 "WP-207+208 · el nodo del escritor CON el corr_id, para pegar con Cmd+A" \
  "N8N · beckham_bot (nhOwpiGxikeU5DLR)" "Validar y Normalizar" \
  "Cmd+A y pegar el fichero ENTERO"
echo "${A}fichero:${N} docs/nodo-validar-normalizar-COMPLETO.js"
echo "${A}el contador tiene que decir:${N} ${V}76.156 caracteres${N} ${D}(el vivo: 73.081, +3.075)${N}"
echo "${R}ENTERO, con Cmd+A.${N} ${D}El 21/08 entregue un parche por trozos y el pegado acabo con${N}"
echo "${D}una linea de prosa DENTRO del codigo: SyntaxError. Un fichero completo no.${N}"
echo
echo "${D}que le entra de nuevo, y son solo tres inserciones:${N}"
echo "   ${V}1${N} ${D}el corr_id = conversation_id:conversationPartId, que YA LLEGAN los dos${N}"
echo "     ${D}(medido en el body de la ejecucion 8129120, no supuesto)${N}"
echo "   ${V}2${N} ${D}Log_Evento de 6 campos, una linea por ejecucion prefijada con el corr_id${N}"
echo "   ${V}3${N} ${D}la clave corr_id en la salida. Se ANADE: los nodos de abajo leen _invalid,${N}"
echo "     ${D}fields, _hay_fechas_descartadas, _fechas_descartadas y _formula_userid, y una${N}"
echo "     ${D}clave de mas les es inerte.${N}"
echo
echo "${A}last_corr_id va APAGADO a proposito${N} ${D}(_ESCRIBIR_LAST_CORR_ID = false).${N}"
echo "${D}Encenderlo exige la columna en Airtable Y refrescar la lista de campos del nodo${N}"
echo "${D}Airtable Upser Expediente, que es el SEXTO sitio y puede reactivar los 36 campos${N}"
echo "${D}que se quitaron. Cuando exista la columna: cambiar ese false a true y nada mas.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 7"
echo "${B}verificar:${N}  bash docs/montar-nodo-validar.sh   ${D}-> 35 verdes${N}"
echo "${D}            y tras pegar, una conversacion real: en el log de la ejecucion sale${N}"
echo "${D}            UNA linea [conv:part] con los 6 campos y CERO datos del cliente.${N}"
[ "$1" = copia ] && bash docs/copiar.sh 7; }

p5(){ paso 5 "el prompt v15 · TODO el recorrido en un solo agente conversacional" \
  "LANGSMITH (prompt o tag NUEVO, no el prod)" "bot_mobility_prompt" \
  "pegar con Cmd+A · y NO mover el tag prod"
echo "${A}fichero:${N} docs/prompt-final-2026-08-31-v15.txt"
echo "${A}el contador tiene que decir:${N} ${V}86.548 caracteres${N} ${D}(v14: 66.020, +20.528)${N}"
echo "${R}ESTE PASO NO SE DA HASTA QUE EXISTA EL WORKFLOW NUEVO.${N} ${D}Dos razones, las dos duras:${N}"
echo "${D}  1. el v15 nombra la tool ${N}${V}calcular_plazo${N}${D}, y una tool nombrada y no cableada es el${N}"
echo "${D}     gate de WP-220: el prompt entra A LA VEZ que el workflow que la tiene.${N}"
echo "${D}  2. el tag ${N}${V}prod${N}${D} de bot_mobility_prompt lo lee ${N}${V}beckham_bot${N}${D}, que esta ACTIVO en${N}"
echo "${D}     produccion CON el canvas de Intercom delante. El v15 dice que nada viene${N}"
echo "${D}     pre-filtrado y que el agente hace los tres filtros hablando: si le mueves el tag${N}"
echo "${D}     prod, el bot vivo empieza a repreguntar lo que el canvas ya preguntó.${N}"
echo "${D}que cambia respecto al v14, y cada cosa con su comprobacion en la puerta:${N}"
echo "${D}  · BLOQUE 0 · APERTURA: la bienvenida REAL del canvas (leida de conversaciones${N}"
echo "${D}    de Intercom, no inventada), la guarda de no repetirla si ya esta en el historial,${N}"
echo "${D}    las cuatro opciones de arranque literales y el modo preguntas sin tope.${N}"
echo "${D}  · los tres filtros pasan a llamarse ${N}${V}A${N}${D} (residencia) ${N}${V}B${N}${D} (alta SS) y ${N}${V}C${N}${D} (fecha+plazo).${N}"
echo "${D}    La numeracion F1/F2/F3/F4 se RETIRA: significaba cosas opuestas en el prompt y${N}"
echo "${D}    en el canvas. Cero apariciones de \\bF[1-4]\\b en el fichero, y la puerta lo mide.${N}"
echo "${D}  · la tool ${N}${V}calcular_plazo${N}${D} con sus CUATRO veredictos: en_plazo, fuera_plazo,${N}"
echo "${D}    no_valida (culpa del dato -> se repregunta, 2 intentos) y SIN VEREDICTO (fallo${N}"
echo "${D}    nuestro -> NO se repregunta y NO se descarta).${N}"
echo "${R}  · LA ROTURA MAS CARA, TAPADA:${N} ${D}el parametro fecha_alta_ss de la tool leia el custom${N}"
echo "${D}    attribute fecha_alta_ss_f2, que el canvas nuevo YA NO ESCRIBE. El v15 manda${N}"
echo "${D}    guardarla con guardar_datos_cliente en cuanto el veredicto sea en_plazo. Sin eso,${N}"
echo "${D}    el escritor responde ok:true y la fecha de alta NO SE GUARDA NUNCA -- y de ella${N}"
echo "${D}    salen el plazo de la siguiente sesion y la fecha de alta impresa en el informe.${N}"
echo "${D}  · regla 10: de TRES herramientas a CUATRO, y CUANDO NO SE GUARDA. Un cliente que${N}"
echo "${D}    solo pregunta no debe acabar con expediente: antes lo garantizaba la topologia${N}"
echo "${D}    (el sidecar FAQ no tenia la tool de escritura), ahora lo garantiza el prompt.${N}"
echo "${D}  · seccion nueva EL ORDEN, Y LO QUE PASA CUANDO EL CLIENTE SE LO SALTA, con el${N}"
echo "${D}    tablero de las tres casillas y los cuatro saltos reales.${N}"
echo "${A}intacto y comprobado byte a byte:${N} ${D}el bloque de CONOCIMIENTO FISCAL (12.831 car.,${N}"
echo "${D}aprobado por Fiscal el 11/08). La puerta lo compara CARACTER A CARACTER con el v14.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 8"
echo "${B}verificar:${N}  node docs/test-prompt-v15.js   ${D}-> 198 verdes, 0 rojas${N}"
echo "${D}            (110 heredadas del v14 MIDIENDO EL v15 + 88 nuevas)${N}"
[ "$1" = copia ] && bash docs/copiar.sh 8; }

# ══ 03/09 · LO DE LA CONVERSACION 215475755624195 (oneshot) ══════════════════════════
p6(){ paso 6 "el validador con los 4 parches del 03/09 (pasaporte, gentilicios, vias catalanas, pareja de hecho)" \
  "beckham_bot_conversacional (n1jx7z9NtXWCD4VC) · PRODUCCION" "Validar y Normalizar  (TEXTAREA de codigo)" \
  "Cmd+A dentro del textarea y pegar · despues PUBLISH"
echo "${A}fichero:${N} docs/nodo-validar-normalizar-COMPLETO.js  ${D}(montado por anclas desde el nodo vivo: docs/montar-validador-2026-09-03.py)${N}"
echo "${A}el contador tiene que decir:${N} ${V}86.587 caracteres${N} ${D}(vivo: 86.471 desde las 10:36Z; el parche de la tarde solo cambia el texto del aviso_pasaporte)${N}"
echo "${D}que arregla, cada cosa medida en la conversacion del 02/09:${N}"
echo "${D}  1. PASAPORTE: si el cliente da un pasaporte al pedirle el NIF/NIE, el nodo lo guarda igual que hoy${N}"
echo "${D}     pero devuelve ${N}${V}aviso_pasaporte${N}${D} en descartados: el NIF/NIE es OBLIGATORIO y sin el no hay expediente completo (prompt v16, paso 7).${N}"
echo "${D}  2. GENTILICIOS: 'algerino' (y 3 formas mas) + fallback por errata de 1-2 letras ('marroqi', 'colmbia').${N}"
echo "${D}     Un empate (irlandia) se descarta, no se adivina.${N}"
echo "${D}  3. VIAS CATALANAS: Carrer/Passeig/Avinguda (+ PG, Avgda, Plaça) -> CALLE/PASEO/AVENIDA, en tipo_via${N}"
echo "${D}     y en el nombre de la calle ('Carrer de Balmes' -> 'Calle de Balmes').${N}"
echo "${D}  4. PAREJA DE HECHO -> soltero (ante Hacienda). Hasta hoy -> casado y disparaba la pregunta del conyuge.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 7"
echo "${B}verificar:${N}  bash docs/montar-nodo-validar.sh   ${D}-> 78 verdes, 0 rojas (45 de antes + 33 del 03/09)${N}"
echo "${D}            tras pegar: yo leo el nodo por MCP (86.471 car.) y reexporto beckham_bot_conversacional.json${N}"
echo "${D}            prueba en el chat: nacionalidad 'algerino', domicilio 'Carrer de Balmes 10', NIF = un pasaporte${N}"
[ "$1" = copia ] && bash docs/copiar.sh 7; }

p7(){ paso 7 "el prompt v16 · copy: habla por los asesores, paternidad, pareja de hecho, aviso de pasaporte" \
  "LANGSMITH · bot_mobility_prompt · tag prod (lo lee el conversacional)" "el prompt entero" \
  "pegar con Cmd+A y mover el tag prod al commit nuevo"
echo "${A}fichero:${N} docs/prompt-final-2026-09-03-v16.txt  ${D}(montado por anclas desde el v15: docs/montar-prompt-v16.py)${N}"
echo "${A}el contador tiene que decir:${N} ${V}91.628 caracteres${N} ${D}(v15: 86.548)${N}"
echo "${D}que cambia respecto al v15 (once parches, cada uno con su comprobacion):${N}"
echo "${D}  · FUERA el «no es asesoramiento» / «es informacion general»: cero apariciones. El bot habla en${N}"
echo "${D}    nombre de NUESTROS ASESORES, que preparan, revisan y envian los borradores (7 menciones).${N}"
echo "${D}  · los dos mensajes de cierre y la ficha AEAT: los borradores los hacen los asesores y se envian${N}"
echo "${D}    para el visto bueno ANTES de presentarlos. El SLA 24-48 h no cambia de recuento.${N}"
echo "${D}  · paternidad: sigue tributando, y NO exime del 24 % aunque un compañero diga lo contrario (x2).${N}"
echo "${D}  · pareja de hecho -> SOLTERO ante Hacienda, y no se pregunta PF6b. (El v15 decia casado.)${N}"
echo "${D}  · D3: si el sistema devuelve aviso_pasaporte, pide el NIE UNA sola vez; si lo da, va en nif.${N}"
echo "${D}  · nacionalidad con errata: pasarla TAL CUAL, el sistema la tolera (paso 6).${N}"
echo "${D}  · en en_plazo manda fecha_limite_plazo a guardar_datos_cliente, en la misma llamada que fecha_alta_ss (paso 9).${N}"
echo "${D}  · D3 (tarde): sin NIE la conversacion NO AVANZA. No sigue con D4 ni pide documentos; deja el hilo abierto.${N}"
echo "${D}  · discrepancia de fecha de alta POR TRAMOS (tarde): calcular_plazo con fecha_documento; leve (<=7 dias) toma la del${N}"
echo "${D}    documento y sigue; grave (>7 o fuera de plazo) llamada como hasta hoy. Requiere los pasos 13 y 14.${N}"
echo "${A}intacto salvo 3 frases de copy:${N} ${D}el bloque de CONOCIMIENTO FISCAL. La puerta aplica esos 3 parches al${N}"
echo "${D}bloque del v15 y exige igualdad byte a byte: un cuarto cambio la pone en rojo.${N}"
echo "${R}ORDEN:${N} ${D}despues del paso 6 (el aviso_pasaporte lo produce el validador nuevo). Antes no rompe nada:${N}"
echo "${D}el aviso simplemente no llega.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 9"
echo "${B}verificar:${N}  node docs/test-prompt-v16.js   ${D}-> 255 verdes, 0 rojas (206 heredadas del v15 MIDIENDO el v16, 8 re-baselineadas explicitas)${N}"
[ "$1" = copia ] && bash docs/copiar.sh 9; }

p8(){ paso 8 "SUPERADO el 03/09 a las 12:30: la fecha limite NO va a Intercom, va a Airtable (paso 9)" \
  "beckham_f2_plazo. (wdOOF0ecCkgFOUjt)" "nada" "nada que tocar"
echo "${D}Se habia subido por MCP un borrador que escribia fecha_limite_bot en el contacto de Intercom. El usuario${N}"
echo "${D}lo descarto: la tool ya devuelve fecha_limite al agente, asi que basta con que el agente la guarde en el${N}"
echo "${D}expediente. El borrador se REVIRTIO por MCP al codigo original (3 nodos, identico al publicado 09147598).${N}"
echo "${D}Si ves en n8n un borrador sin publicar en beckham_f2_plazo., es ese: no cambia nada y se puede publicar o ignorar.${N}"
[ "$1" = copia ] && echo "${D}(no hay valor que copiar)${N}"; }

p9(){ paso 9 "la tool guardar_datos_cliente manda fecha_limite_plazo (la columna, el validador y el Upser YA existen)" \
  "beckham_bot_conversacional (n1jx7z9NtXWCD4VC) · PRODUCCION" "guardar_datos_cliente (la tool HTTP)  · Body Parameters (40 hoy)" \
  "Add Body Field: Name = fecha_limite_plazo · Value = la expresion \$fromAI (modo Expression, sin el = inicial) · PUBLISH"
echo "${A}valor:${N} ${D}(se copia con copiar.sh 10; es un \$fromAI como el de fecha_alta_ss, que esta justo encima)${N}"
echo "${D}por que solo este sitio: de los CINCO de un campo nuevo, cuatro ya estan hechos. La columna fecha_limite_plazo${N}"
echo "${D}existe en Airtable, el validador la acepta (ponerFecha, DD/MM/AAAA), el Upser la mapea y Preparar_Prompt la${N}"
echo "${D}lee ('Fecha limite para solicitar (calculada en una sesion anterior)'). Lo unico que faltaba era que el${N}"
echo "${D}agente la mandara: la tool no tenia el parametro y el prompt v15 decia que no existia. El v16 (paso 7) ya${N}"
echo "${D}lo manda en en_plazo, en la misma llamada que fecha_alta_ss. El lector NO la devuelve a proposito: el plazo${N}"
echo "${D}no se hereda nunca, se recalcula con calcular_plazo (regla 14).${N}"
echo "${R}ORDEN:${N} ${D}antes del paso 7 o a la vez: si el prompt v16 manda el parametro y la tool no lo tiene, el agente${N}"
echo "${D}no puede mandarlo y el dato no se guarda (sin error). Al reves no rompe nada.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 10"
echo "${B}verificar:${N}  ${D}yo, por MCP: bodyParameters de guardar_datos_cliente pasa de 40 a 41; y en la primera conversacion${N}"
echo "${D}            real con en_plazo, la fila de Airtable trae fecha_limite_plazo = la fecha que dijo el bot.${N}"
[ "$1" = copia ] && bash docs/copiar.sh 10; }

p10(){ paso 10 "la landing P00027 · solo copy, con la calculadora y el proceso real" \
  "app.taxdown.es/procedure/P00027 (quien edite la landing)" "el texto entero" \
  "sustituir por el copy propuesto; ENLACE-CALCULADORA es el unico hueco"
echo "${A}fichero:${N} docs/landing-P00027-copy-2026-09-03.md"
echo "${D}que cambia: el proceso pasa del formulario+email al chat con el bot; aparece que recibe el cliente${N}"
echo "${D}(borradores del 030 y 149 revisados por un asesor, visto bueno antes de presentar); enlace a la${N}"
echo "${D}calculadora ANTES de solicitar; el salario sale de los requisitos (nunca descarta) y pasa a orientacion;${N}"
echo "${D}y el plazo cuenta desde el ALTA EN LA SS, no desde la llegada (la landing actual mezcla los dos).${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 11"
[ "$1" = copia ] && bash docs/copiar.sh 11; }

p11(){ paso 11 "Decidir_Status rechaza el cierre sin NIF/NIE (bloqueo DURO, en codigo)" \
  "beckham_bot_conversacional (n1jx7z9NtXWCD4VC) · PRODUCCION" "Decidir_Status  (TEXTAREA de codigo)" \
  "Cmd+A dentro del textarea y pegar · despues PUBLISH"
echo "${A}fichero:${N} docs/nodo-decidir-status-2026-09-03.js  ${D}(montado por anclas sobre el 2026-09-02, que es el vivo)${N}"
n=$(python3 -c "import io;print(len(io.open('docs/nodo-decidir-status-2026-09-03.js',encoding='utf-8').read()))")
echo "${A}el contador tiene que decir:${N} ${V}$n caracteres${N} ${D}(vivo: 13.814)${N}"
echo "${D}que hace: si llega (o ya hay en la fila) motivo 'Expediente completo' y NI esta llamada NI la fila traen NIF,${N}"
echo "${D}NO sube al 4, BORRA MotivoCierre del guardado (asi '¿Cerrar conversacion?' no cierra el hilo) y devuelve${N}"
echo "${D}_aviso_cierre = 'cierre_rechazado=...'. Un pasaporte NO cuenta. El NIF puede venir de la fila (turno anterior).${N}"
echo "${D}El resto de la escalera no cambia: la puerta lo comprueba con los 36 casos de antes + 9 nuevos.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 1"
echo "${B}verificar:${N}  node docs/test-decidir-status.js   ${D}-> 45 verdes, 0 rojas${N}"
[ "$1" = copia ] && bash docs/copiar.sh 1; }

p12(){ paso 12 "Respond OK devuelve tambien el aviso de cierre (para que el agente lo lea)" \
  "beckham_bot_conversacional (n1jx7z9NtXWCD4VC) · PRODUCCION" "Respond OK  · Response Body (campo de EXPRESION, un solo valor)" \
  "sustituir el valor entero por el copiado (sin el = inicial) · PUBLISH"
echo "${D}hoy dice: { ok: true, action: 'upserted', record_id: \$json.id, descartados: \$('Validar y Normalizar').first().json._fechas_descartadas || null }${N}"
echo "${D}nuevo:    lo mismo, pero descartados junta ademas \$('Decidir_Status').first().json._aviso_cierre (si lo hay).${N}"
echo "${D}Sin este paso el bloqueo del 11 funciona igual (no se cierra ni sube), pero el agente no sabe por que.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 12"
echo "${B}verificar:${N}  ${D}yo, por MCP: el responseBody de Respond OK contiene _aviso_cierre${N}"
[ "$1" = copia ] && bash docs/copiar.sh 12; }

p13(){ paso 13 "beckham_f2_plazo. cuenta la discrepancia con el documento (borrador subido por MCP)" \
  "beckham_f2_plazo. (wdOOF0ecCkgFOUjt) · el BORRADOR; el publicado sigue igual hasta el Publish" "Calcular el plazo  (Code)" \
  "revisar el borrador y PUBLISH (no hay credenciales: no se pierde nada)"
n=$(python3 -c "import io;print(len(io.open('docs/nodo-f2-calcular-plazo-2026-09-03.js',encoding='utf-8').read()))")
echo "${A}fichero:${N} docs/nodo-f2-calcular-plazo-2026-09-03.js  ${D}($n caracteres; si prefieres pegarlo a mano: bash docs/copiar.sh 15)${N}"
echo "${D}que cambia: las 6 claves de siempre NO cambian. Si llega fecha_documento, devuelve ademas doc_fecha_ddmmaaaa,${N}"
echo "${D}doc_veredicto, doc_fecha_limite, dias_diferencia y discrepancia: ninguna / leve (<=7 dias y en plazo) /${N}"
echo "${D}grave (>7, o fuera de plazo, o sin fecha declarada) / documento_no_valido / sin_documento. Y entiende ingles.${N}"
echo "${B}verificar:${N}  node docs/test-f2-plazo.js   ${D}-> 19 verdes, 0 rojas (EJECUTA el codigo)${N}"
echo "${D}            tras publicar: yo por MCP, versionId == activeVersionId y 3 nodos${N}"
[ "$1" = copia ] && bash docs/copiar.sh 15; }

p14(){ paso 14 "la tool calcular_plazo manda fecha_documento y sabe que le devuelven" \
  "beckham_bot_conversacional (n1jx7z9NtXWCD4VC) · PRODUCCION" "calcular_plazo (la tool HTTP)  · Body Parameters (1 hoy) y Description" \
  "Add Body Field: Name = fecha_documento · Value = el \$fromAI (Expression, sin el =) · y ANADIR al final de la Description el texto de copiar.sh 14 · PUBLISH"
echo "${B}copiar:${N}     bash docs/copiar.sh 13   ${D}(el Value del Body Field)${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 14   ${D}(el parrafo que se ANADE al final de la Description, sin borrar lo que hay)${N}"
echo "${R}ORDEN:${N} ${D}despues del 13. Si la tool manda fecha_documento y el f2 viejo la ignora, el prompt ve discrepancia${N}"
echo "${D}vacia y trata el caso como grave, que es lo de hoy: no rompe. El prompt (paso 7) ya lleva la regla.${N}"
echo "${B}verificar:${N}  ${D}yo, por MCP: bodyParameters de calcular_plazo pasa de 1 a 2 y la Description contiene 'fecha_documento'${N}"
[ "$1" = copia ] && bash docs/copiar.sh 13; }

# ── 04/09 · LA AUTORIZACION PRERRELLENADA VIAJA A INTERCOM ─────────────────────────────
p15(){ paso 15 "mobility_autorizacion_intercom (wMdJ0PRsXdWWdXL4): credenciales de 2 nodos HTTP y Publish" \
  "mobility_autorizacion_intercom (wMdJ0PRsXdWWdXL4) · proyecto Ops / Fiscal · CREADO POR MCP el 04/09, inactivo" \
  "Enviar_a_Intercom  y  Subir_la_autorizacion_a_Airtable  (los dos HTTP Request)" \
  "en cada uno: Authentication = Predefined Credential Type (ya puesto) -> desplegable 'Credential for Intercom API' / 'Credential for Airtable Personal Access Token': elegir la MISMA credencial que usan Responder_Intercom (en beckham_bot_conversacional) y 'Subir la autorizacion a Airtable' (en mobility_autorizacion_prerrellenada C3lKxKwi1bRyokf7). Luego PUBLISH."
echo "${A}ya asignadas solas al crearlo (COMPROBAR que son las de C3lKxKwi1bRyokf7):${N}"
echo "${D}  Buscar_Expediente -> N8N_traza_Alina (airtable) · Copiar_la_plantilla y Descargar_como_PDF -> 'Google Drive -DaniMario' · Rellenar_los_huecos -> Google-Docs_RodrigoCabo${N}"
echo "${R}OJO Drive:${N} ${D}el 21/08 'Google Drive -DaniMario' estaba SIN autorizar. Abrir 'Copiar la plantilla' del C3lKxKwi1bRyokf7, mirar que credencial de Drive usa HOY (funciona desde el 03/09) y poner ESA en los dos nodos de Drive de este.${N}"
echo "${A}Settings del workflow:${N} ${D}'This workflow can be called by' -> si beckham_bot_conversacional NO esta en Ops / Fiscal, poner 'Any workflow'. (analizar_documento, que tambien es tool, ya funciona: copiar su ajuste.)${N}"
echo "${A}Descargar_la_existente:${N} ${D}sin credencial a proposito: baja la URL firmada de Airtable.${N}"
echo "${B}verificar:${N}  ${D}yo, por MCP: active=true, 17 nodos, versionId==activeVersionId. Y una ejecucion manual con un user_id real de prueba: el PDF aparece en la conversacion de Intercom.${N}"
echo "${B}puerta:${N}     node docs/test-autorizacion-preparar.js  ${D}-> 24 verdes (EJECUTA el Code del nodo)${N}"; }

p16(){ paso 16 "la tool enviar_autorizacion en el AI Agent del conversacional (nodo NUEVO, no el de Iciar)" \
  "beckham_bot_conversacional (n1jx7z9NtXWCD4VC) · PRODUCCION" "nodo NUEVO 'Call n8n Workflow Tool' colgado del AI Agent como Tool" \
  "OJO: hay YA un 'Call n8n Workflow Tool' VACIO en el borrador (14:56 de hoy): es el de Iciar (escalado a humano). NO tocarlo. Anadir OTRO: + Tool -> Call n8n Workflow Tool. Name = enviar_autorizacion · Description = copiar.sh 16 · Workflow = From list -> mobility_autorizacion_intercom · Workflow Inputs (Define below): user_id = copiar.sh 17 (Expression, sin el =) · conversation_id = copiar.sh 18 (Expression) · idioma = copiar.sh 19 (Expression, es el \$fromAI). PUBLISH solo si el nodo de Iciar ya esta configurado o lo quita ella: un toolWorkflow sin workflow rompe al agente."
echo "${B}copiar:${N}     bash docs/copiar.sh 16   ${D}(Description, 1.062 car.)${N}   copiar.sh 17 / 18 / 19 ${D}(los tres inputs)${N}"
echo "${R}ORDEN:${N} ${D}despues del 15 (la tool tiene que existir publicada para elegirla en la lista) y ANTES del 17 (el prompt la nombra).${N}"
echo "${B}verificar:${N}  ${D}yo, por MCP: un nodo @n8n/n8n-nodes-langchain.toolWorkflow llamado enviar_autorizacion con workflowId wMdJ0PRsXdWWdXL4 y 3 inputs, conectado ai_tool al AI Agent; versionId==activeVersionId.${N}"; }

p17(){ paso 17 "SUPERADO POR EL 19 (04/09 tarde): el prompt v17 no se pega; se pega el v18, que lo incluye" \
  "LANGSMITH" "bot_mobility_prompt" "pegar Y mover el tag prod"
echo "${R}ANTES DE MONTARLO:${N} ${D}Alina e Iciar editan ya el prompt. Copiar el prompt VIVO (tag prod) de LangSmith a un fichero y montar sobre EL:${N}"
echo "${D}  python3 docs/montar-prompt-v17.py <prompt-vivo.txt> docs/prompt-final-2026-09-04-v17.txt   (4 parches por ancla; ABORTA si un ancla no esta)${N}"
echo "${D}  Si se monta sobre el v16 local (por defecto) el contador es:${N} ${V}92.765 caracteres${N} ${D}(v16: 91.628, +1.137)${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 20"
echo "${R}GUARDAR **Y** MOVER EL TAG prod.${N} ${R}ORDEN: DESPUES del 16.${N} ${D}Si el prompt nombra la tool y el agente no la tiene, se la inventa o se bloquea en el paso de la autorizacion.${N}"
echo "${B}puerta:${N}     node docs/test-prompt-v17.js  ${D}-> 281 verdes (hereda las 265 del v16 con 3 re-baselines explicitos + 16 nuevas; 4 mutaciones cazadas)${N}"
echo "${B}verificar:${N}  ${D}yo, por MCP: el nodo Langsmith Prompt de la primera ejecucion posterior contiene 'enviar_autorizacion' 3 veces y 0 'Autorizacion_Generica'.${N}"; }

# ── 04/09 TARDE · LA TOOL transferir_humano Y EL PROMPT v18 ──────────────────────────────
p18(){ paso 18 "la tool transferir_humano: publicar el subworkflow de Iciar y apuntarle el nodo del agente (SUSTITUYE al 'Gestionar_escalado MOB')" \
  "mobility_transferir_humano (ErttueeJzWfTkiWH, inactivo) y beckham_bot_conversacional (n1jx7z9NtXWCD4VC) · PRODUCCION" \
  "en el subworkflow: Asignar_Ops_Mobility y Nota_Transferencia (los 2 HTTP) · en el conversacional: el nodo 'Gestionar_escalado MOB' colgado del AI Agent" \
  "SUBWORKFLOW: en los 2 HTTP elegir la credencial de Intercom API (la de Responder_Intercom) · Settings -> 'can be called by' como analizar_documento · Publish. AGENTE: abrir 'Gestionar_escalado MOB' -> Workflow = From list -> mobility_transferir_humano · Name = transferir_humano · Description = copiar.sh 21 · Workflow Inputs (Define below): conversation_id = copiar.sh 18 · user_id = copiar.sh 17 · motivo = copiar.sh 22 (los tres en Expression, sin el =) · Save · Publish."
echo "${R}POR QUE SE SUSTITUYE:${N} ${D}'Gestionar_escalado MOB' (iIs0vU6ngiQAiA8u) esta PUBLICADO como tool con Description e inputs VACIOS, y no transfiere: es un monitor post-respuesta que necesita respuesta_bot y que SNOOZEA la conversacion 7 dias. Si el agente lo llama, la conversacion del cliente se duerme una semana. Si Iciar quiere el monitor, va como Execute Workflow detras de Responder_Intercom, no como tool.${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 21 ${D}(Description)${N} · 17 ${D}(user_id)${N} · 18 ${D}(conversation_id)${N} · 22 ${D}(motivo, \$fromAI)${N}"
echo "${B}verificar:${N}  ${D}yo, por MCP: ErttueeJzWfTkiWH active=true; en el conversacional un toolWorkflow 'transferir_humano' -> ErttueeJzWfTkiWH con 3 inputs y NINGUN nodo apuntando a iIs0vU6ngiQAiA8u; versionId==activeVersionId.${N}"; }

p19(){ paso 19 "el prompt v18: transferir por la tool (fuera la contradiccion) + las 13 mejoras de la pagina de Notion" \
  "LANGSMITH" "bot_mobility_prompt" "pegar Y mover el tag prod"
echo "${R}ANTES DE MONTARLO:${N} ${D}si Alina o Iciar han tocado el prompt vivo despues de las 11:24 del 04/09, copiarlo a un fichero y montar sobre EL, encadenando los dos montadores:${N}"
echo "${D}  python3 docs/montar-prompt-v17.py <vivo.txt> /tmp/v17.txt && python3 docs/montar-prompt-v18.py /tmp/v17.txt docs/prompt-final-2026-09-04-v18.txt${N}"
echo "${D}  Si se monta sobre el v16 local (por defecto) el contador es:${N} ${V}99.412 caracteres${N} ${D}(v17: 92.765, +6.647; v16: 91.628)${N}"
echo "${B}copiar:${N}     bash docs/copiar.sh 23"
echo "${A}Y EN LA MISMA PASADA, la tool guardar_datos_cliente del conversacional:${N} ${D}Body Parameters -> senales_complejidad -> Value = copiar.sh 24 (Expression, sin el =). El texto vivo lista SIETE etiquetas con la de '1 de julio' (retirada el 19/08) y el 55.000 (es 50.000 desde el 19/08); el nuevo lista SEIS y aclara que el foral por si solo NO se manda. Sin esto, el agente sigue viendo el foral como etiqueta valida en la tool.${N}"
echo "${R}GUARDAR **Y** MOVER EL TAG prod. ORDEN: DESPUES del 18.${N} ${D}El prompt nombra transferir_humano y enviar_autorizacion: sin las dos tools cableadas el agente se las inventa o se bloquea.${N}"
echo "${A}Lo que NO entra del Notion, y por que:${N} ${D}reordenar bloques (datos personales despues del veredicto) es un cambio de estructura, va aparte; 'me contesta dos veces' y '¿y ahora que?' son los turnos solapados (deuda aceptada); el declarante foral ES senal de complejidad a proposito; '¿tienes alguna otra pregunta?' antes del resumen: falta saber que resumen.${N}"
echo "${B}puerta:${N}     node docs/test-prompt-v18.js  ${D}-> 312 verdes (hereda las 281 del v17 con 14 re-baselines explicitos + 31 nuevas; 7 mutaciones cazadas)${N}"
echo "${B}verificar:${N}  ${D}yo, por MCP: el Langsmith Prompt de la primera ejecucion posterior contiene 'transferir_humano' 8 veces, 'SEIS HERRAMIENTAS' 1 y 0 'calendly.com/d/csbw'.${N}"; }

p20(){ paso 20 "Gestionar_escalado MOB como MONITOR post-respuesta (red de seguridad del agente), no como tool" \
  "Gestionar_escalado MOB (iIs0vU6ngiQAiA8u, inactivo, de Iciar) y beckham_bot_conversacional (n1jx7z9NtXWCD4VC) · PRODUCCION" \
  "en el monitor: trigger (+user_id), Structured Output Parser (schema), If nuevo 'Escalar?', Execute Workflow nuevo 'Transferir_por_monitor', y los 4 nodos del snooze DESACTIVADOS · en el conversacional: Execute Workflow nuevo 'Monitor_escalado' detras de Responder_Intercom, sin esperar" \
  "TODO EN LA UI (el prompt del decisor es de Iciar y no se reescribe por API). Valores: copiar.sh 25 (schema del parser) · 26 (motivo) · 27 (respuesta_bot con guarda). Detalle clic a clic en el chat del 04/09 tarde y en docs/monitor-escalado-2026-09-04.md"
echo "${R}POR QUE ASI:${N} ${D}como tool el decisor no tiene respuesta_bot (no existe cuando el agente decide) y su rama por defecto SNOOZEA 7 dias. Detras de Responder_Intercom SI tiene la respuesta, las alertas van a Notificaciones_error y, con la rama 'Escalar?' -> mobility_transferir_humano, pilla lo que al agente se le escape. Gate: no transfiere si la respuesta ya dice 'te paso' (el agente ya lo hizo).${N}"
echo "${A}El snooze se DESACTIVA, no se borra:${N} ${D}decision pendiente de Iciar. Con el bot llevando el hilo, dormirlo 7 dias en cada turno no aporta; si lo quiere, se reactivan los 4 nodos.${N}"
echo "${B}verificar:${N}  ${D}yo, por MCP: iIs0vU6ngiQAiA8u active=true con If 'Escalar?' + executeWorkflow -> ErttueeJzWfTkiWH y los 4 del snooze disabled; conversacional con executeWorkflow 'Monitor_escalado' -> iIs0vU6ngiQAiA8u, waitForSubWorkflow=false, onError=continueRegularOutput, colgado de Responder_Intercom. Y una conversacion de prueba: 'ESTO ES UNA PERDIDA DE TIEMPO' x2 -> asignada a Ops_Mobility con nota 'Detectado por el monitor'.${N}"; }

# 31/08 · ESTA FUNCION SALIA CON exit 0 AUNQUE LAS VEINTIDOS ESTUVIERAN ROJAS.
# Imprimia FALLA en rojo y devolvia el codigo del ultimo printf, que siempre es 0.
# O sea que la puerta de las puertas mentia, que es exactamente el corolario que el
# proyecto ya tenia escrito: un exit 0 no dice que el script haya hecho su trabajo,
# solo que no aborto. Ahora `fallos` cuenta y la funcion devuelve 1 si hay alguno.
# 02/09 · RETIRADA test-preparar-prompt-dos-agentes.js: media el Preparar_Prompt de beckham_bot
# (el bot del canvas) contra su export, y ese export se quito del repo hoy porque el workflow
# no recibe trafico desde el 31/08. El Preparar_Prompt vivo es el del conversacional y lo mide
# test-preparar-prompt-conversacional.js (89). El fichero de la puerta se conserva por historia.
puertas(){ echo "${B}${C}━━━ LAS VEINTISEIS PUERTAS ━━━${N}"
  fallos=0
for t in test-decidir-status.js test-validador-2026-08-19.js test-prompt-v10.js test-prompt-v12.js test-prompt-v13.js test-prompt-v14.js test-prompt-v15.js test-prompt-v16.js test-f2-plazo.js test-lector-expediente.js test-v2-preparar-informe.js test-contrato-upsert.js test-log-evento.js test-diagramas-mermaid.js test-guarda-punto-modo.js test-nodo-validar-subworkflow.js test-resolver-modo.js test-preparar-prompt-faq.js test-preparar-prompt-conversacional.js test-registrar-optout.js test-autorizacion-preparar.js test-prompt-v17.js test-prompt-v18.js; do
  r=$(node "docs/$t" 2>&1 | grep -oE "[0-9]+ verdes, [0-9]+ rojas|TODO PASA · [0-9]+ comprobaciones"); node "docs/$t" >/dev/null 2>&1 \
    && printf "  ${V}OK${N}   %-38s %s\n" "$t" "$r" || { printf "  ${R}FALLA${N} %-38s %s\n" "$t" "$r"; fallos=$((fallos+1)); }
done
bash docs/montar-nodo-030.sh    >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-030.sh    || { printf "  ${R}FALLA${N} %-38s\n" montar-nodo-030.sh; fallos=$((fallos+1)); }
bash docs/montar-nodo-informe.sh >/dev/null 2>&1 && printf "  ${V}OK${N}   %-38s\n" montar-nodo-informe.sh || { printf "  ${R}FALLA${N} %-38s\n" montar-nodo-informe.sh; fallos=$((fallos+1)); }
r=$(bash docs/montar-nodo-validar.sh 2>&1 | grep -oE "[0-9]+ verdes, [0-9]+ rojas"); bash docs/montar-nodo-validar.sh >/dev/null 2>&1 \
  && printf "  ${V}OK${N}   %-38s %s\n" montar-nodo-validar.sh "$r" || { printf "  ${R}FALLA${N} %-38s %s\n" montar-nodo-validar.sh "$r"; fallos=$((fallos+1)); }
  if [ "$fallos" -gt 0 ]; then echo "  ${R}${B}$fallos PUERTA(S) ROJA(S). No se publica nada.${N}"; return 1; fi
  echo "  ${V}las veintiseis verdes.${N}"; return 0
}

case "$1" in
  test|puertas) puertas; exit $? ;;
  26) bash docs/pasos-2026-08-26-renumeracion.sh ;;
  24) bash docs/pasos-2026-08-24.sh ;;
  21) bash docs/pasos-2026-08-21.sh ;;
  19|viejo) bash docs/pasos-2026-08-19.sh ;;
  ''|todos) puertas
    echo; echo "${B}${C}════ 04/09 TARDE · transferir_humano Y PROMPT v18 ════${N}"
    for i in 18 19 20; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN DEL 04/09 TARDE ━━━${N}"
    echo "  ${R}18 -> 19${N}. El 15 y el 16 ya estan hechos y verificados; el 17 queda SUPERADO por el 19."
    echo; echo "${B}${C}════ 04/09 · LA AUTORIZACION PRERRELLENADA VIAJA A INTERCOM ════${N}"
    for i in 15 16 17; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN DEL 04/09 ━━━${N}"
    echo "  ${R}15 -> 16 -> 17${N}: primero el subworkflow publicado (credenciales), luego la tool en el agente, y el prompt el ULTIMO."
    echo "  ${D}Ninguno rompe produccion hasta el 17: sin el prompt el agente no llama a la tool. El 17 sin el 16 SI rompe el paso de la autorizacion.${N}"
    echo; echo "${B}${C}════ LO DE LA CONVERSACION DEL 02/09 · 03/09 ════${N}"
    for i in 6 7 8 9 10 11 12 13 14; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN DEL 03/09 ━━━${N}"
    echo "  ${R}6 primero${N} (arregla tres fallos vistos en produccion y es un Cmd+A), ${R}7 despues${N} (el prompt"
    echo "  lee el aviso que produce el 6). ${D}El 9 (un Body Field en la tool) va antes del 7 o a la vez. El 8 esta${N}"
    echo "  ${D}SUPERADO (la fecha limite va a Airtable, no a Intercom). El 10 es copy: lo hace quien edite la landing.${N}"
    echo "  ${R}11 y 12 (03/09 tarde): el bloqueo duro sin NIF${N}, dos Cmd+A en el mismo workflow y un Publish."
    echo "  ${R}13 y 14 (03/09 tarde): la discrepancia de 7 dias${N}: publicar el f2, y en la tool un Body Field + un parrafo. Luego el 7."
    echo; echo "${B}${C}════ EL AGENTE CONVERSACIONAL UNICO · 31/08 ════${N}"
    p5
    echo; echo "${B}${C}════ ADAPTAR A LA ESCALERA NUEVA · 26/08 ════${N}"
    for i in 1 2 3 4; do "p$i"; done
    echo; echo "${B}${C}━━━ ORDEN ━━━${N}"
    echo "  ${R}el 5 es lo de hoy, y va DETRAS del workflow nuevo:${N} el prompt v15 se pega cuando"
    echo "  la tool calcular_plazo existe, y en un prompt/tag que NO sea el prod del bot vivo."
    echo "  ${D}El 1 (v14) sigue siendo el prompt del bot EN PRODUCCION: no se retira todavia.${N}"
    echo "  ${R}el 4 va primero (27/08):${N} un Cmd+A que desatasca WP-207 y WP-208 y todo el"
    echo "  lado n8n del rebuild del canvas. 35 comprobaciones EJECUTANDO el nodo."
    echo "  ${D}El 1 es pegar y mover el tag: dos minutos. El 3 es higiene y no corre prisa.${N}"
    echo "  ${D}El 2 esta SUPERADO: el canvas se construye desde cero en una copia${N}"
    echo "  ${D}(docs/canvas-desde-cero-2026-08-27.md); sus correcciones van dentro del rebuild.${N}"
    echo; echo "${D}un paso suelto y copiado al portapapeles:${N}  bash docs/pasos.sh 6" ;;
  [1-9]|1[0-9]|20) "p$1" copia ;;
  *) echo "uso: bash docs/pasos.sh [1-20|test|26|24|21|19]" ;;
esac
