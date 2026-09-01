#!/bin/bash
# 31/08 · CABLEAR beckham_bot_conversacional (n1jx7z9NtXWCD4VC).
# El workflow ya existe, en el proyecto PERSONAL, INACTIVO y sin credenciales, con
# los cuatro nodos de codigo puestos como STUB a proposito: n8n no deja pegar 114.622
# caracteres por API sin arriesgar el nodo custom de LangSmith, asi que se pegan a
# mano con Cmd+A. Cada stub lanza un throw que remite a un paso de este script.
#
#   bash docs/pasos-conversacional.sh        -> todos los pasos y el orden
#   bash docs/pasos-conversacional.sh 1..8   -> un paso suelto, Y copia el valor al portapapeles
#   bash docs/pasos-conversacional.sh test   -> las puertas de las piezas de este cambio
#
# NADA DE AQUI TOCA PRODUCCION. beckham_bot (nhOwpiGxikeU5DLR) sigue activo y con el
# canvas de Intercom delante: mientras no se apague, los dos pueden convivir porque
# los paths de webhook del nuevo llevan sufijo -v2 y su UUID es otro.
cd "$(dirname "$0")/.." || exit 1
B=$(printf '\033[1m'); D=$(printf '\033[2m'); V=$(printf '\033[32m'); A=$(printf '\033[33m')
R=$(printf '\033[31m'); C=$(printf '\033[36m'); N=$(printf '\033[0m')

WF="n1jx7z9NtXWCD4VC"
URL="https://taxdown.app.n8n.cloud/workflow/$WF"

paso() {
cat <<EOF

${B}${C}━━━ PASO $1 ━━━${N} ${B}$2${N}
${D}workflow:${N} beckham_bot_conversacional  ${D}(personal, INACTIVO)${N}
${D}link:${N}     $URL
${D}nodo:${N}     $3
${D}campo:${N}    $4
EOF
}

# Los pasos de Intercom no van en el workflow de n8n: cabecera propia, o la linea
# `workflow: beckham_bot_conversacional` miente en cuatro pasos de trece.
pasoic() {
cat <<EOF

${B}${C}━━━ PASO $1 ━━━${N} ${B}$2${N}
${D}sistema:${N}  INTERCOM  ${D}(workspace s1hap599, PRODUCCION)${N}
${D}donde:${N}    $3
${D}que:${N}      $4
EOF
}

# Cuenta CARACTERES, no bytes. `wc -c` da bytes y el editor de n8n cuenta caracteres:
# con ~1.500 acentos los dos numeros se separan casi 3.000. Y `python3 -c print` en
# vez de node, porque console.log de node 26 colorea la salida aunque escriba a una
# tuberia y los codigos ANSI se cuelan dentro de la variable.
car() { python3 -c "import io,sys; print(len(io.open(sys.argv[1],encoding='utf-8').read()))" "$1"; }

pegar() {  # $1 fichero  $2 nodo  $3 esperado
  local n; n=$(car "$1")
  echo "${A}fichero:${N} $1"
  echo "${A}el contador de n8n tiene que decir:${N} ${V}$(printf "%'d" "$n" 2>/dev/null || echo "$n") caracteres${N}"
  if [ "$n" != "$3" ]; then
    echo "${R}OJO: el fichero mide $n y se esperaban $3. NO PEGUES: algo lo ha tocado.${N}"
  fi
  if [ -t 1 ] && command -v pbcopy >/dev/null; then
    pbcopy < "$1"; echo "${V}✓ copiado al portapapeles. Cmd+A en el campo del nodo y Cmd+V.${N}"
  fi
  echo "${D}Cmd+A SIEMPRE, nunca pegar por trozos: un parche por partes se puede pegar${N}"
  echo "${D}de mas, y el 21/08 acabo con una linea de prosa dentro del codigo.${N}"
}

# ─────────────────────────────────────────────────────────────────────────────
p1(){ paso 1 "Formatear_conversacion1" "Formatear_conversacion1" "JavaScript Code  (es un TEXTAREA de codigo)"
echo "${D}hoy dice:${N} throw new Error('PASO 1 · FALTA PEGAR EL CODIGO...')  ${D}(183 car)${N}"
pegar docs/nodo-formatear-conversacion-2026-08-31.js Formatear_conversacion1 11288
echo "${D}es BYTE A BYTE el del beckham_bot vivo (sha256 53f966ef970a). No se toca:${N}"
echo "${D}el nodo ya entra bien desde el primer mensaje, no solo a mitad de hilo.${N}"
echo "${R}NO RENOMBRES ESTE NODO:${N} ${D}lee \$('Webhook1') dentro del codigo, y n8n NO${N}"
echo "${D}reescribe las referencias que viven dentro de un nodo code.${N}"; }

p2(){ paso 2 "Preparar_Prompt" "Preparar_Prompt" "JavaScript Code  (es un TEXTAREA de codigo)"
echo "${D}hoy dice:${N} throw new Error('PASO 2 · ...')  ${D}(179 car)${N}"
pegar docs/nodo-preparar-prompt-CONVERSACIONAL-2026-08-31.js Preparar_Prompt 19305
echo "${A}ES EL UNICO CODIGO NUEVO DE TODO EL CAMBIO.${N} ${D}Sustituye la fuente muerta${N}"
echo "${D}(los custom attributes veredicto_f2 / fecha_limite_f2 / dias_pasados_f2 /${N}"
echo "${D}fecha_alta_ss_f2, que los escribia el canvas de Intercom) por el bloque${N}"
echo "${D}«EL PLAZO NO LO CALCULAS TU», que manda usar la tool calcular_plazo.${N}"
echo "${D}31/08 · lleva ademas el freno de coste que se pierde al no copiar el sidecar${N}"
echo "${D}del FAQ: mensaje a 4.000 car por la cabeza, historial a 24.000 POR LA COLA, y${N}"
echo "${D}enmascarado SOLO del IBAN. El NIF, el email y el telefono pasan TAL CUAL a${N}"
echo "${D}proposito: son el contrato, y enmascararlos deja al bot preguntando en bucle.${N}"
echo "${A}OJO, EL PROPIO STUB DA UNA CIFRA VIEJA:${N} ${D}el throw del nodo dice 13.972${N}"
echo "${D}caracteres, que es lo que medía antes de anadirle el freno de coste. La cifra${N}"
echo "${D}buena es la de aqui arriba. Se corrige el dia que se toque el nodo por API.${N}"
echo "${A}verificalo antes de pegar:${N} node docs/test-preparar-prompt-conversacional.js"
echo "${D}tiene que decir ${N}${V}58 verdes, 0 rojas${N}"; }

p3(){ paso 3 "Validar y Normalizar" "Validar y Normalizar" "JavaScript Code  (es un TEXTAREA de codigo)"
echo "${D}hoy dice:${N} throw new Error('PASO 3 · ...')  ${D}(177 car)${N}"
pegar docs/nodo-validar-normalizar-COMPLETO.js "Validar y Normalizar" 76156
echo "${D}el escritor, con el corr_id y el Log_Evento. Es BYTE A BYTE el del vivo${N}"
echo "${D}(sha256 ea366fadf202): el pegado en produccion ya esta hecho.${N}"
echo "${A}el mas grande de los cuatro. Si el contador de n8n no da 76.156 exactos,${N}"
echo "${A}se ha truncado el pegado: vuelve a hacerlo, no lo dejes «casi».${N}"; }

p4(){ paso 4 "Decidir_Status" "Decidir_Status" "JavaScript Code  (es un TEXTAREA de codigo)"
echo "${D}hoy dice:${N} throw new Error('PASO 4 · ...')  ${D}(175 car)${N}"
pegar docs/nodo-decidir-status-2026-08-28.js Decidir_Status 13206
echo "${D}la escalera renumerada de Iciar: la tabla ORDEN con los peldanos 9-14 reales,${N}"
echo "${D}el descarte a '14. Descartado' y la guarda en nActual > 4.${N}"
echo "${A}verificalo:${N} node docs/test-decidir-status.js ${D}-> 36 verdes${N}"; }

p5(){ paso 5 "Langsmith Prompt" "promptName / promptTag  ${R}(los dos son TEXTO)${N}"
cat <<EOF
${R}${B}BLOQUEANTE. Tal como esta el nodo, este workflow leeria el prompt de PRODUCCION.${N}
${D}hoy dice:${N}  promptName = ${R}bot_mobility_prompt${N}   promptTag = ${R}prod${N}
${D}tiene que decir:${N}  promptName = ${V}bot_mobility_prompt_conversacional${N}   promptTag = ${V}prod${N}

${A}por que, y son DOS roturas, no una:${N}
${D}  1. tal cual esta, el workflow nuevo lee el v14, que dice que los filtros ya se${N}
${D}     hicieron en un formulario previo y NO conoce calcular_plazo. El agente daria${N}
${D}     por hechos los filtros que ahora tiene que hacer el.${N}
${D}  2. y si alguien lo «arregla» pegando el v15 en bot_mobility_prompt tag prod,${N}
${D}     rompe beckham_bot VIVO, que esta activo con el canvas delante: el v15 dice${N}
${D}     que nada viene pre-filtrado y el bot repreguntaria lo que el canvas ya pregunto.${N}
${R}EL v15 NO SE PEGA NUNCA EN bot_mobility_prompt. Prompt NUEVO en LangSmith.${N}
EOF
echo "${A}en LangSmith:${N} ${D}crear el prompt ${N}bot_mobility_prompt_conversacional${D} y pegar${N}"
echo "${D}docs/prompt-final-2026-08-31-v15.txt ($(car docs/prompt-final-2026-08-31-v15.txt) caracteres), tag prod DE ESE prompt.${N}"
echo "${A}verificalo antes:${N} node docs/test-prompt-v15.js ${D}-> ${N}${V}206 verdes, 0 rojas${N}"
if [ -t 1 ] && command -v pbcopy >/dev/null; then
  printf 'bot_mobility_prompt_conversacional' | pbcopy
  echo "${V}✓ 'bot_mobility_prompt_conversacional' en el portapapeles (sin = y sin salto).${N}"
fi
echo "${A}el nodo es CUSTOM (CUSTOM.langSmithPrompt) y NO se recrea por MCP.${N}"
echo "${D}Se toca a mano en la UI. Si se reescribe el workflow por API, se pierde.${N}"; }

p6(){ paso 6 "Settings del workflow" "Settings (el engranaje, arriba a la derecha)"
cat <<EOF
${R}${B}BLOQUEANTE SILENCIOSO: hoy una caida de este workflow NO AVISA A NADIE.${N}
${D}settings actuales:${N} ${R}{executionOrder:'v1', availableInMCP:true}${N} ${D}y nada mas${N}
${D}beckham_bot vivo tiene SIETE mas. Las que hay que poner, una a una:${N}
   ${D}Error Workflow${N}          -> ${V}beckham_alertas${N} ${D}(BJfExmwu1fI1aPpY)  ← desplegable${N}
   ${D}Timeout Workflow${N}        -> ${V}activado, 120 segundos${N}
   ${D}Save execution progress${N} -> ${V}activado${N}
   ${D}Caller policy${N}           -> ${V}Workflows from the same owner${N} ${D}← desplegable${N}
${A}el Error Workflow es el que importa:${N} ${D}beckham_alertas tiene un Error Trigger,${N}
${D}asi que beckham_bot avisa a Slack cuando se cae y este NO. Y sin el timeout, una${N}
${D}ejecucion colgada se queda colgada.${N}
EOF
}

p7(){ paso 7 "If2 · el debounce" "Conditions  ${R}(DECISION, no hay valor que copiar)${N}"
cat <<EOF
${D}hoy dice:${N} {{ \$json.body.conversation_part_id_debounce }} ${D}· string : is not empty${N}
${A}el problema:${N} ${D}esa clave la mandaba el Data Connector del canvas. Si el trigger${N}
${D}nuevo de Intercom no la manda, la condicion es SIEMPRE FALSA, la ejecucion sale${N}
${D}por la rama 1, se salta el Wait2 de 3 segundos y ${N}${R}el debounce muere en silencio${N}${D}:${N}
${D}dos mensajes seguidos del cliente producen dos turnos que se solapan.${N}
${A}como se decide, y es medible:${N} ${D}disparar el webhook una vez desde Intercom y mirar${N}
${D}en la ejecucion que claves trae \$json.body. Si trae un id de parte de mensaje,${N}
${D}se apunta ahi. Si no, la condicion pasa a ser la clave que si venga (por ejemplo${N}
${D}el id del mensaje), o se quita el If2 y se deja el Wait2 en el camino unico.${N}
${R}NO lo dejes como esta sin mirarlo: el sintoma es turnos solapados, y en un bot${N}
${R}conversacional eso significa dos respuestas distintas a la misma pregunta.${N}
EOF
}

p8(){ paso 8 "Prompt_De_Respaldo y Refrescar_Respaldo" "Data table  ${R}(COMPROBAR, puede que no haga falta tocar)${N}"
cat <<EOF
${D}los dos apuntan a:${N} beckham_prompt_respaldo ${D}(mTN65aN389Z3KMbe)${N}
${A}y esa data table vive en el proyecto de EQUIPO${N} ${D}ADm8RL3z3EJcozih (Ops / Fiscal),${N}
${D}mientras que este workflow vive en el PERSONAL XbyRcOSCxcL1TkeG.${N}
${A}que hay que comprobar:${N} ${D}abrir el nodo y ver si la data table sigue seleccionada${N}
${D}o si el desplegable sale vacio. Si sale vacio, un workflow personal no alcanza la${N}
${D}data table del equipo y hay dos salidas: mover el workflow al proyecto de equipo${N}
${D}cuando toque, o crear la data table de respaldo en el personal.${N}
${A}por que no puede esperar:${N} ${D}el respaldo del prompt solo entra en juego EL DIA QUE${N}
${D}LANGSMITH FALLE. Si esta roto, no se nota hasta ese dia, que es justo el peor.${N}
EOF
}

p9(){ paso 9 "Las credenciales" "${R}(esto lo hace el usuario, esta apuntado aqui para no olvidar ninguna)${N}"
cat <<EOF
${D}Nacio sin ninguna a proposito. Diez nodos las esperan, en cuatro grupos:${N}

${B}Intercom${N} ${D}(predefinedCredentialType · intercomApi) — 3 nodos${N}
   ${D}Traer_Conversacion_intercom1 · Responder_Intercom · Cerrar_Conversacion${N}
   ${R}la de PRODUCCION, no la de TEST.${N} ${D}El workspace es s1hap599.${N}

${B}Airtable${N} ${D}— 5 nodos${N}
   ${D}Leer_Expediente_Para_Prompt · Leer_MotivoCierre · Leer_Status_Actual${N}
   ${D}Buscar Expediente en Airtable · Airtable Upser Expediente${N}
   ${A}OJO CON EL UPSER:${N} ${D}al abrirlo, n8n puede ofrecer refrescar la lista de campos.${N}
   ${R}Si lo refrescas, puede REACTIVAR campos que estan quitados a proposito${N} ${D}(los 39${N}
   ${D}removed: InformePdf, Borrador030, los comentarios del fiscal...) y el bot los${N}
   ${D}escribiria VACIOS en cada llamada. La lista buena:${N}
   ${D}docs/upser-campos-mapeados-2026-08-26.txt${N}

${B}OpenAI${N} ${D}— 1 nodo:${N} David Beckham ${D}(modelo gpt-5.6-terra)${N}

${B}LangSmith${N} ${D}— 1 nodo:${N} Langsmith Prompt
   ${R}es el nodo CUSTOM.${N} ${D}Su credencial solo se pone desde la UI. Si el desplegable${N}
   ${D}sale vacio, el camino que funciono en beckham_bot fue DUPLICAR el nodo desde el${N}
   ${D}workflow que ya lo tiene, que arrastra la credencial con el.${N}

${D}Los que NO llevan credencial y esta bien asi: los 3 httpRequestTool${N}
${D}(guardar_datos_cliente, leer_expediente, calcular_plazo — pegan a webhooks${N}
${D}nuestros), analizar_documento y los cinco Avisar_* (son subflujos), los dos${N}
${D}dataTable y los tres webhooks.${N}
EOF
}

p10(){ pasoic 10 "reuse_mobility · EL TRANSPORTE" "Intercom · workflow 66250478" "Audience  ${R}(BLOQUEANTE)${N}"
cat <<EOF
${R}${B}LA PRIMERA COSA DE INTERCOM, Y SI NO SE HACE EL BOT NO RECIBE UN SOLO MENSAJE.${N}
${D}link:${N} https://app.intercom.com/a/apps/s1hap599/automation/workflows/66250478

${A}reuse_mobility NO SE VA.${N} ${D}Es lo unico de Intercom que importa: su trigger «When customer${N}
${D}sends any message» es la UNICA via por la que un mensaje del cliente llega a n8n. Hoy${N}
${D}relanza los turnos 2..n; manana es la entrada de TODOS los turnos, el primero incluido.${N}

${R}EL PROBLEMA:${N} ${D}su audiencia es${N} ${R}Custom = Users AND 'Team assigned is Ops_BOT_Mobility'${N}
${D}(team 11098265), y ${N}${R}quien asignaba ese team era el Custom Bot${N}${D} — en el timeline del${N}
${D}28/07 la asignacion cae a las 17:43:47, justo despues del turno 1 del canvas.${N}
${A}Comprobado el 31/08 por MCP:${N} ${D}NI beckham_bot NI el nuevo asignan team en ningun nodo${N}
${D}(cero apariciones de 11098265, Ops_BOT_Mobility y team_assignee en los dos).${N}
${R}Si el canvas muere y nadie asigna el team, la condicion no se cumple NUNCA.${N}

${B}TRES SALIDAS. La 1 es la que recomiendo:${N}
${V} 1.${N} ${D}Cambiar la audiencia a algo que no dependa del canvas: el atributo de plan de los${N}
    ${D}clientes full VIP que YA existe en produccion, o un tag. Cero codigo.${N}
${V} 2.${N} ${D}Que n8n asigne el team en el primer turno (PUT /conversations/{id}). Una llamada${N}
    ${D}mas a la API, y la audiencia se queda como esta.${N}
${V} 3.${N} ${D}Dejar un workflow minimo de bienvenida en Intercom que salude Y asigne el team.${N}
    ${D}Resuelve tambien el paso 12.${N}
EOF
}

p11(){ pasoic 11 "reuse_mobility · quitar el wait_for_callback" "Intercom · paso 'Pass to n8n_BOT_mobility'" "el paso, NO el Data Connector"
cat <<EOF
${A}el wait_for_callback vive en el PASO del reusable n8n_BOT_mobility (66246057),${N}
${A}no en el Data Connector.${N} ${D}Es una casilla del paso.${N}

${R}por que hay que quitarlo:${N} ${D}con el diseno nuevo NADIE va a mandar ese callback — el bot${N}
${D}contesta por Responder_Intercom (POST /conversations/{id}/reply). El paso se quedaria${N}
${D}esperando para siempre, ${N}${R}reteniendo el slot customer-facing${N}${D}, y el turno siguiente${N}
${D}podria no disparar. Solo UN workflow customer-facing corre por evento, y retiene el${N}
${D}slot incluso mientras espera input.${N}

${B}dos formas, la segunda mas limpia:${N}
${V} a.${N} ${D}dejar «Pass to n8n_BOT_mobility» y quitarle el wait_for_callback a ese paso${N}
${V} b.${N} ${D}que reuse_mobility llame al Data Connector DIRECTAMENTE y fuera el reusable${N}

${A}efecto secundario bueno:${N} ${D}sin wait_for_callback, Intercom libera el slot en cuanto${N}
${D}dispara, en vez de retenerlo. Para un bot conversacional eso es mejor, no peor.${N}
${D}El callback_token que el DC siga mandando en el body es inofensivo: n8n lo ignora.${N}
EOF
}

p12(){ pasoic 12 "WP-10 · LA PRUEBA QUE VA ANTES DE TODO" "Intercom · Messenger real, de cliente" "medir, no configurar"
cat <<EOF
${R}${B}SOBRE UN «Customer ticket» EL TRIGGER «customer sends any message» NO DISPARA.${N}
${D}Medido el 28/07 en la conversacion 215475262949230: el cliente responde a las${N}
${D}17:43:59, a las 17:44:02 un ticket_state_updated_by_admin, y despues NADA — ni${N}
${D}custom_action_started, ni una ejecucion en n8n. reuse_mobility marcaba Sent: 0.${N}
${D}El causante era el workflow «distribuidor - usuario envia mensaje», que al no${N}
${D}encontrar destino convertia la conversacion en ticket (tipo «Prueba Fer»).${N}

${A}WP-10 sigue en «specified» Y ERA DEL WORKSPACE TEST.${N} ${D}En produccion hay que${N}
${D}VOLVER A MEDIRLO, porque TODA la arquitectura nueva depende de ese trigger.${N}

${B}la prueba, y son 5 minutos:${N}
${D} 1. cerrar los hilos abiertos del contacto de pruebas (el Messenger REANUDA el hilo${N}
${D}    abierto: sin esto no se prueba desde cero)${N}
${D} 2. abrir uno nuevo y escribir ${N}${A}desde el Messenger como cliente${N}${D} — nunca desde el${N}
${D}    Inbox, que es un mensaje de ADMIN y no dispara este trigger${N}
${D} 3. comprobar por MCP que la conversacion nace con ${N}${V}"ticket": null${N}
${D} 4. y que en n8n aparece UNA ejecucion por cada mensaje del cliente${N}
${R}Si sale ticket distinto de null, no se cablea nada mas hasta arreglar esto.${N}
EOF
}

p13(){ pasoic 13 "El saludo · DECISION DE PRODUCTO" "Intercom" "${R}(decidir, no hay valor que copiar)${N}"
cat <<EOF
${A}«customer sends any message» dispara CUANDO EL CLIENTE ESCRIBE.${N} ${D}Asi que con solo${N}
${D}reuse_mobility el cliente se encuentra un chat VACIO y tiene que escribir primero.${N}

${D}La rama [ARRANQUE_EN_FRIO] de Preparar_Prompt existe, pero es DEFENSIVA: solo entra${N}
${D}si el texto llega vacio. Si el cliente escribe «hola», NO entra — y esta bien asi.${N}

${B}dos opciones:${N}
${V} a.${N} ${D}el cliente escribe primero. Mas simple, cero Intercom. El precio es un chat${N}
    ${D}vacio con el «esto puede tardar unos segundos» y nada mas.${N}
${V} b.${N} ${D}mantener un workflow de bienvenida en Intercom que salude${N} ${A}Y ASIGNE EL TEAM${N}${D}:${N}
    ${D}resuelve de paso el bloqueante del paso 10 por la via 3.${N}
${A}Si eliges (b), el paso 10 se cae solo.${N}
EOF
}

p14(){ pasoic 14 "EL DATA CONNECTOR · un solo cambio" "Data connector 514525 (PRODUCCION)" "la URL, y nada mas"
cat <<EOF
${D}link:${N} https://app.intercom.com/a/apps/s1hap599/settings/app-settings/data-connectors/514525/health
${D}reuse:${N} https://app.intercom.com/a/apps/s1hap599/automation/workflows-overview?title=reuse
${V}Ya estan conectados entre si. No hay que crear nada.${N}

${B}LO UNICO QUE CAMBIA, en la pestana 1 Setup del DC:${N}
${D}  la URL, de:${N}  .../webhook/${R}22de1fbd-bada-40b3-a120-41e519442139${N}
${D}  a:${N}          .../webhook/${V}179cb7ee-9db2-4700-a97b-52297a8d3de4${N}

${D}Los data inputs NO se tocan: las cinco claves del contrato nuevo ya viajan${N}
${D}(conversation_id, user_id, user_email, message, conversation_part_id_debounce).${N}
${D}El callback_token no iba en el body, asi que no hay nada que quitar de aqui.${N}
EOF
}

orden(){ cat <<EOF

${B}${C}━━━ EL ORDEN, Y QUE DESATASCA QUE ━━━${N}

${B}Primero lo que impide que el workflow ARRANQUE${N} ${D}(sin esto revienta al primer turno)${N}
  ${V}1-4${N}  los cuatro pegados de codigo. 114.622 caracteres en total.
       ${D}Ahora mismo los cuatro nodos lanzan un throw: no es que fallen, es que estan${N}
       ${D}puestos para fallar hasta que se peguen.${N}
  ${V}9${N}    las credenciales (las hace el usuario).

${B}Despues lo que hace que arranque CON EL PROMPT BUENO${N}
  ${V}5${N}    el nodo de LangSmith al prompt nuevo. ${R}Sin esto lee el v14 y da los${N}
       ${R}filtros por hechos.${N}

${B}Despues lo que solo se nota cuando algo va mal${N}
  ${V}6${N}    settings: Error Workflow y timeout. ${D}Hoy una caida no avisa a nadie.${N}
  ${V}8${N}    la data table del respaldo. ${D}Solo se nota el dia que falle LangSmith.${N}

${B}Y la decision que hay que medir en Intercom${N}
  ${V}7${N}    la condicion del If2. ${D}Hay que disparar el webhook una vez y mirar el body.${N}

${B}Y EL LADO INTERCOM, que es donde esta el bloqueante de verdad${N}
  ${V}12${N}   ${R}PRIMERO DE TODO:${N} medir WP-10. Si la conversacion nace ticket, «customer sends
       any message» no dispara y ${R}no hay arquitectura${N}. 5 minutos.
  ${V}10${N}   la audiencia de reuse_mobility. ${R}Hoy depende de un team que asignaba el canvas,${N}
       ${R}y nadie mas lo asigna: sin esto el bot no recibe un solo mensaje.${N}
  ${V}11${N}   quitar el wait_for_callback del paso del reusable.
  ${V}14${N}   el DC 514525: cambiar la URL al webhook nuevo. ${D}Un campo.${N}
  ${V}13${N}   decidir el saludo. Si eliges «workflow de bienvenida», el 10 se cae solo.

${A}NADA DE LOS PASOS 1-9 TOCA PRODUCCION.${N} ${D}beckham_bot (nhOwpiGxikeU5DLR) sigue activo, con${N}
${D}sus paths de webhook, y el nuevo lleva -v2 y otro UUID: pueden convivir.${N}
${R}LOS PASOS 10 y 11 SI LA TOCAN:${N} ${D}reuse_mobility es el transporte del bot VIVO. Cambiarle${N}
${D}la audiencia o quitarle el wait_for_callback ${N}${R}rompe el bot de hoy${N}${D}, asi que van en el${N}
${D}MISMO movimiento en que se apaga el canvas y se enciende el workflow nuevo. El 12 y${N}
${D}el 13 se pueden hacer antes: uno es medir y el otro decidir.${N}
EOF
}

puertas(){ echo "${B}${C}━━━ las puertas de las piezas de ESTE cambio ━━━${N}"
local fallo=0
for t in test-preparar-prompt-conversacional test-prompt-v15 test-decidir-status test-contrato-upsert; do
  printf '%-42s' "$t"
  if out=$(node "docs/$t.js" 2>&1); then
    echo "${V}$(echo "$out" | grep -o '[0-9]* verdes, [0-9]* rojas' | tail -1)${N}"
  else
    echo "${R}ROJA -> node docs/$t.js${N}"; fallo=1
  fi
done
echo "${D}las VEINTIDOS del proyecto: bash docs/pasos.sh test${N}"
return $fallo; }

case "$1" in
  1) p1;; 2) p2;; 3) p3;; 4) p4;; 5) p5;; 6) p6;; 7) p7;; 8) p8;; 9) p9;;
  10) p10;; 11) p11;; 12) p12;; 13) p13;; 14) p14;;
  test) puertas; exit $?;;
  *) orden; for i in 1 2 3 4 5 6 7 8 9 14 10 11 12 13; do "p$i"; done
     echo; echo "${D}un paso suelto, con el valor al portapapeles:${N} bash docs/pasos-conversacional.sh 3";;
esac
