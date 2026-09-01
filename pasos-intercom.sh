#!/usr/bin/env bash
# pasos-intercom.sh · 28/08/2026 · construir el canvas nuevo en TaxDown PRODUCCION
#   bash docs/pasos-intercom.sh        todos los pasos
#   bash docs/pasos-intercom.sh 3      un paso suelto, Y copia su valor al portapapeles
cd "$(dirname "$0")/.." || exit 1
N=$'\033[0m'; B=$'\033[1m'; D=$'\033[2m'; R=$'\033[31m'; V=$'\033[32m'; A=$'\033[33m'; C=$'\033[36m'

cab(){ printf '\n%s%s━━━ PASO %s ━━━%s %s%s%s\n' "$B" "$C" "$1" "$N" "$B" "$2" "$N"
       printf '%sdonde:%s    %s\n' "$D" "$N" "$3"; printf '%scomo:%s     %s\n' "$D" "$N" "$4"; }

p0(){ cab 0 "COMPROBAR QUE NO EXISTE YA · 2 minutos que pueden ahorrar una tarde" \
  "INTERCOM s1hap599 · Settings > Apps & integrations > Data connectors, y Settings > Data > People/Conversation data" \
  "solo mirar, no crear nada"
echo "${R}EL CANVAS VIEJO ESTA EN OTRO WORKSPACE.${N} ${D}El viejo (OnClick Mobility, 66243731) vive en${N}"
echo "${D}${N}${A}q3bhdtoi${N}${D} = TEST. El nuevo (Mobility Bot (OnClick), 68617004) esta en ${N}${A}s1hap599${N}${D} = prod.${N}"
echo "${D}Los Data Connectors, los atributos, los reusables y los teams ${N}${R}NO se comparten entre workspaces${N}${D}.${N}"
echo "${D}Asi que, salvo que alguien ya los haya creado en prod, hay que crearlos de cero.${N}"
echo "${B}mira y apunta:${N}"
echo "  1 ${D}existe un DC que llame a ${N}beckham_f2_plazo${D}?${N}"
echo "  2 ${D}existe un DC que llame a ${N}beckham-upsert-expediente${D}?${N}"
echo "  3 ${D}existe un DC que llame a ${N}Webhook1${D} de beckham_bot?${N}"
echo "  4 ${D}existen los atributos de conversacion ${N}veredicto_f2 fecha_limite_f2 dias_pasados_f2${D}?${N}"
echo "  5 ${D}existe un reusable tipo ${N}n8n_BOT_mobility${D}? y un workflow de turnos 2..n?${N}"
echo "  6 ${D}que ID tiene el team de Ops en PROD?${N} ${R}el 11098265 es de TEST y aqui no vale${N}"
echo "  7 ${D}existe el tag ${N}jarry_ignore${D} en prod?${N}"
echo "${V}Si alguno existe: se REUTILIZA, no se duplica.${N} ${D}Un DC duplicado es un escritor duplicado.${N}"; }

p1(){ cab 1 "LA CREDENCIAL DE AIRTABLE · es lo unico que bloquea probar el escritor nuevo" \
  "N8N · workflow BECKHAM_upsert_expediente (1BaSgHfQzuzC9sw1) · nodo Airtable Upser Expediente" \
  "desplegable en la UI. Por MCP las credenciales salen VACIAS siempre, asi que esto no lo puedo ver yo"
echo "${D}Abrir el nodo -> ${N}${B}Credential to connect with${N}${D} -> elegir la MISMA que usa beckham_bot.${N}"
echo "${A}verificar:${N} ${D}Execute workflow con ${N}punto=cualifica${D} y ${N}modo=faq_regimen${D}:${N}"
echo "  ${V}tiene que salir por 'Respuesta rechazo de la guarda' con resultado=modo_no_permitido${N}"
echo "  ${V}y el nodo de Airtable NO debe ejecutarse${N} ${D}(esa prueba no necesita credencial).${N}"
echo "${D}Luego el caso bueno, que SI escribe: ${N}punto=cualifica${D} + ${N}modo=solicitud${D} + un user_id de prueba.${N}"; }

p2(){ cab 2 "LOS OCHO ATRIBUTOS DE CONVERSACION · todos tipo Text" \
  "INTERCOM s1hap599 · Settings > Data > Conversation data > Create attribute" \
  "ocho veces el mismo formulario. Tipo: Text SIEMPRE"
echo "${B}los 3 del calculo${N} ${D}(sin ellos el Object mapping del paso 3 no tiene destino):${N}"
echo "  ${V}veredicto_f2${N}      ${D}Text · lo rellena el DC del plazo${N}"
echo "  ${V}fecha_limite_f2${N}   ${D}Text · formato DD/MM/AAAA, lo imprime el mensaje de fuera de plazo${N}"
echo "  ${V}dias_pasados_f2${N}   ${D}Text ${N}${R}A PROPOSITO${N}${D} aunque sea un numero: un desajuste de tipo${N}"
echo "                    ${D}provoca fallos de persistencia SILENCIOSOS${N}"
echo "${B}los 5 nuevos${N} ${D}(contadores y acarreos entre turnos):${N}"
echo "  ${V}corte_contexto_bot${N} ${V}faq_resumen_bot${N} ${V}faq_turnos_bot${N} ${V}intentos_fecha_bot${N} ${V}corr_id_bot${N}"
echo "${R}NO crear modo_bot.${N} ${D}T081 cerrada el 28/08 en B PURA: el modo viaja como input del DC y${N}"
echo "${D}no se persiste. Un atributo de modo seria un segundo sitio donde puede desincronizarse.${N}"
echo "${A}OJO:${N} ${D}Date & Time NO se puede usar en workflows. Las fechas van SIEMPRE como Text DD/MM/AAAA${N}"
echo "${D}y se normalizan en n8n. Eso es lo que causo el bug de F2.${N}"; }

p3(){ cab 3 "EL DC DEL PLAZO + SU OBJECT MAPPING · el que desatasca los dos warnings" \
  "INTERCOM s1hap599 · Settings > Apps & integrations > Data connectors > New" \
  "crear el conector y luego mapear sus 3 salidas"
echo "${B}1 Setup:${N} ${D}Request type ${N}POST${D}, y la URL del webhook de ${N}beckham_f2_plazo.${D}${N}"
echo "${D}  (esta en n8n: workflow wdOOF0ecCkgFOUjt, nodo Webhook -> Production URL).${N}"
echo "${D}  Header ${N}Content-Type: application/json${D} ${N}${R}obligatorio${N}${D}: sin el, el receptor falla el parseo.${N}"
echo "${B}2 Data · inputs:${N} ${D}la fecha de alta recogida en el Collect data, en modo ${N}Let Fin collect${D}.${N}"
echo "${D}  Fallback value ${N}${R}VACIO${N}${D}: un fallback pisaria el dato bueno.${N}"
echo "${B}2 Data · Object mapping${N} ${D}(al final de esa pestana, '+ New attribute mapping'):${N}"
echo "  ${D}Intercom object = ${N}${V}Conversation${N}${D} · API object = ${N}${V}Root${N}${D} · tres filas:${N}"
echo "     ${V}veredicto_f2${N}    ${D}<- ${N}veredicto"
echo "     ${V}fecha_limite_f2${N} ${D}<- ${N}fecha_limite"
echo "     ${V}dias_pasados_f2${N} ${D}<- ${N}dias_pasados"
echo "${R}LA TRAMPA QUE COSTO CINCO DIAS:${N} ${D}los outputs de un DC son ${N}${R}LOCALES A SU PATH${N}${D}. Solo${N}"
echo "${D}cruzan de path si se promocionan aqui a Conversation attributes. Y en el paso 4, el chip${N}"
echo "${D}hay que insertarlo desde el encabezado ${N}${V}Conversation${N}${D}, ${N}${R}NUNCA${N}${D} desde el encabezado con el${N}"
echo "${D}nombre del DC: eso vuelve a romperlo y el branch lee vacio.${N}"
echo "${A}el 'Test connection' con inputs enlazados manda una llamada REAL vacia -> 400 esperado, no es fallo.${N}"; }

p4(){ cab 4 "LAS CONDICIONES DE I. Path Y W. Path · aqui desaparecen los dos warnings rojos" \
  "INTERCOM s1hap599 · Custom Bot «Mobility Bot (OnClick)» · 68617004 · pasos I. Path y W. Path (uno por idioma)" \
  "abrir el paso Branches y escribir las dos condiciones en cada uno"
echo "${D}Hoy los dos dicen ${N}${R}Branches don't have a value, make sure you add at least one condition${N}"
echo "${D}y sus dos ramas salen como 'Missing condition', asi que ${N}${R}TODO cae al else${N}${D}. Normal: hasta${N}"
echo "${D}el paso 3 el atributo no existia.${N}"
echo "${B}en cada uno de los dos:${N}"
echo "  ${D}rama 1: ${N}${V}veredicto_f2${N} ${D}(encabezado ${N}${V}Conversation${N}${D}) ${N}contains${D} ${N}${V}en_plazo${N}"
echo "  ${D}rama 2: ${N}${V}veredicto_f2${N} ${D}(encabezado ${N}${V}Conversation${N}${D}) ${N}contains${D} ${N}${V}fuera_plazo${N}"
echo "  ${D}else:   ${N}${D}se parte en dos, y esto es WP-216 B7:${N}"
echo "     ${D}fecha no parseable -> repreguntar con ${N}intentos_fecha_bot${D} (<2 repregunta con ejemplo${N}"
echo "     ${D}literal, ==2 escala) · veredicto VACIO -> escalar ${N}${R}SIN${N}${D} repreguntar (es fallo de sistema)${N}"
echo "${R}El else de hoy CIERRA LA CONVERSACION.${N} ${D}Mientras siga asi, cada cliente que llegue ahi se${N}"
echo "${D}queda sin respuesta y con el hilo cerrado.${N}"
echo "${A}tecnica de diagnostico probada:${N} ${D}si una condicion no dispara, ponla en ${N}has any value${D} primero:${N}"
echo "${D}preguntar '¿hay algo?' antes de '¿es correcto?'.${N}"; }

p5(){ cab 5 "EL DC DEL ESCRITOR · y aqui entra el idioma" \
  "INTERCOM s1hap599 · nuevo Data Connector, y luego conectarlo en cada punto de persistencia" \
  "un DC con plantilla fija; cada punto mapea solo lo que conoce"
echo "${B}1 Setup:${N} ${D}POST a ${N}https://es.synapse.rentax.es/webhook/beckham-upsert-expediente"
echo "${D}  Header ${N}Content-Type: application/json${D}.${N}"
echo "${B}2 Data · inputs${N} ${D}(todos ${N}Text${D}, todos ${N}Let Fin collect${D}, Fallback ${N}${R}VACIO${N}${D}):${N}"
echo "  ${V}user_id${N} ${V}intercom_conversation_id${N} ${V}email${N} ${V}alta_ss${N} ${V}lead_potencial${N}"
echo "  ${V}fecha_alta_ss${N} ${V}fecha_prevista_alta${N} ${V}fecha_limite_plazo${N} ${V}descarte${N}"
echo "  ${V}punto${N} ${V}modo${N} ${V}idioma${N}   ${D}<- estos tres son los que cambian por rama${N}"
echo "  ${R}Required ON solo en user_id y conversation.id.${N} ${D}Required es ${N}${R}condicion de ejecucion${N}${D}:${N}"
echo "  ${D}si un campo de rama va Required y viene vacio, ${N}${R}el conector NO LLAMA${N}${D} y no se guarda nada.${N}"
echo "  ${A}la CLAVE del body es 'Descarte' con D mayuscula${N} ${D}(el Name del input puede ir en minuscula).${N}"
echo "${B}luego, en CADA punto del canvas${N} ${D}('Map action inputs' del paso, ${N}${R}no${N}${D} 'Custom value':${N}"
echo "${D}Custom value es unico a nivel de conector y no sirve para valores por rama):${N}"
echo "  ${D}descarte duro       -> punto=${N}${V}descarte_residencia${N}${D}  modo=${N}${V}solicitud${N}"
echo "  ${D}lead sin alta       -> punto=${N}${V}lead${N}${D}                 modo=${N}${V}lead_potencial${N}"
echo "  ${D}cualifica           -> punto=${N}${V}cualifica${N}${D}            modo=${N}${V}solicitud${N}"
echo "  ${D}fuera de plazo      -> punto=${N}${V}descarte_plazo${N}${D}       modo=${N}${V}solicitud${N}"
echo "  ${D}FAQ                 -> punto=${N}${V}faq_entrada${N}${D}          modo=${N}${V}faq_regimen${N}"
echo "  ${D}autodescarte        -> punto=${N}${V}autodescarte_declarado${N}${D} modo=${N}${V}faq_regimen${N}"
echo "  ${B}y en TODOS:${N} ${D}idioma=${N}${V}es${N}${D} en la cadena espanola, idioma=${N}${V}en${N}${D} en la inglesa.${N}"
echo "${V}El idioma lo DECLARA la rama, no lo detecta el LLM${N} ${D}(decision del 28/08). El escritor lo${N}"
echo "${D}guarda en la columna Idioma y ${N}${B}el informe v2 elige con ella su plantilla${N}${D} de las ocho.${N}"
echo "${R}calculadora, humano y menu NO llaman al escritor:${N} ${D}la guarda del subworkflow los rechaza a${N}"
echo "${D}proposito, porque no escriben expediente.${N}"
echo "${A}RECUERDA: el canvas esta duplicado por idioma, asi que cada punto son DOS cableados.${N}"; }

p6(){ cab 6 "EL REUSABLE DEL AGENTE + SU DC · esto SI es un workflow de Intercom nuevo" \
  "INTERCOM s1hap599 · Automation > Workflows > New > Reusable workflow" \
  "crear el reusable, meterle dentro el DC con wait_for_callback, y llamarlo con Pass to"
echo "${D}En TEST esto es el reusable ${N}n8n_BOT_mobility${D} (66246057) con dos caminos:${N}"
echo "${D}  Path A: DC -> Wait for webhook   ·   Path B: error de n8n${N}"
echo "${B}el DC de dentro:${N} ${D}POST a ${N}Webhook1${D} de beckham_bot, con ${N}${V}wait_for_callback${N}${D} activado.${N}"
echo "${D}n8n responde 200 (ack) y publica el mensaje despues por Callback_Intercom.${N}"
echo "${D}Sus inputs, medidos del body real de la ejecucion 8129120 (7 claves):${N}"
echo "  ${V}conversation_id${N} ${V}user_id${N} ${V}conversationPartId${N} ${V}message${N} ${V}user_email${N}"
echo "  ${V}conversation_part_id_debounce${N} ${V}First Message ID${N}"
echo "${A}message y user_email son PII${N} ${D}-> por eso el Log_Evento del escritor lleva 6 campos y no el body.${N}"
echo "${R}Timeout de un DC: 15 segundos.${N} ${D}Por eso se responde 200 ya y se publica por callback.${N}"
echo "${D}Y en el punto que cualifica: ${N}${V}Assign${N}${D} al team de Ops ${N}${R}de PROD${N}${D} (el 11098265 es de TEST)${N}"
echo "${D}+ ${N}${V}Pass to${N}${D} el reusable. ${N}${R}Ese punto NO cierra${N}${D} la conversacion.${N}"; }

p7(){ cab 7 "LO QUE VA DESPUES · no bloquea nada del flujo principal" \
  "INTERCOM s1hap599" "cuando los pasos 0-6 esten en verde"
echo "  ${B}a${N} ${D}Workflow de turnos 2..n${N} ${D}(en TEST es reuse_mobility, 66250478), trigger${N}"
echo "     ${N}${V}customer sends any message${N}${D}. ${N}${R}OJO:${N}${D} no se dispara sobre un Customer ticket, y pasar${N}"
echo "     ${D}el ticket a Submitted manda un correo al cliente. Ese es el bloqueo WP-10.${N}"
echo "  ${B}b${N} ${D}Workflow con trigger ${N}${V}Reopened${N}${D} (WP-227, hoy no existe ninguno). Con T081 = B PURA${N}"
echo "     ${D}la reentrada cae ${N}${B}siempre al menu${N}${D}, asi que este workflow se queda en: reencaminar al${N}"
echo "     ${D}menu, que el enlace de recordatorio vaya ${N}${B}siempre al launcher${N}${D} sin reabrir el hilo viejo,${N}"
echo "     ${D}y no tocar ticket.state nunca.${N}"
echo "  ${B}c${N} ${D}El DC del FAQ${N} ${D}-> ${N}${R}espera a que yo cablee el nodo FAQ del agente${N}${D} (WP-218/221).${N}"
echo "     ${D}Hoy Z. FAQ va directo a un END: quien pulse 'tengo preguntas' se queda sin respuesta.${N}"
echo "  ${B}d${N} ${D}Renombrar los 28 paths que se llaman 'Path'.${N} ${D}Gratis, y sin eso esto no se mantiene.${N}"
echo "  ${B}e${N} ${D}La errata del primer mensaje: ${N}${R}'atendamos en españo'${N}${D} -> falta la l.${N}"; }

pf(){ printf '\n%s%s━━━ LO QUE NO SE PUEDE OLVIDAR AL PUBLICAR ━━━%s\n' "$B" "$C" "$N"
echo "${R}Estamos en PRODUCCION${N} ${D}(norma del workspace TEST derogada el 27/08). El backup antes de${N}"
echo "${D}publicar es la UNICA vuelta atras: duplica el bot como ${N}${V}Mobility Bot — BACKUP AAAAMMDD${N}${D}.${N}"
echo "${R}Preview NUNCA:${N} ${D}usa respuestas MOCK de los DC e invalido dos diagnosticos. Simulations son${N}"
echo "${D}de Fin, no de Custom Bots. Lo unico que vale: publicar + Messenger real como cliente +${N}"
echo "${D}verificar la conversacion no-Preview ${N}${B}Y${N}${D} su ejecucion en n8n. Las dos, o no cuenta.${N}"
echo "${D}Y el Messenger ${N}${B}reanuda${N}${D} el hilo abierto: para probar de cero, incognito.${N}"
printf '\n%sun paso suelto:%s bash docs/pasos-intercom.sh 3\n' "$D" "$N"; }

case "${1:-}" in
  ''|todos) for i in 0 1 2 3 4 5 6 7; do "p$i"; done; pf ;;
  [0-7]) "p$1" ;;
  *) echo "uso: bash docs/pasos-intercom.sh [0-7]" ;;
esac
