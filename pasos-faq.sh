#!/usr/bin/env bash
# pasos-faq.sh · 28/08/2026 · MONTAR EL SIDECAR DEL FAQ, paso a paso
#   bash docs/pasos-faq.sh            todos los pasos y el orden
#   bash docs/pasos-faq.sh 6          un paso suelto
#   bash docs/pasos-faq.sh c <clave>  deja ESE valor en el portapapeles
#   bash docs/pasos-faq.sh c          la lista de claves copiables
#
# Sale con exit 1 si se pide un paso o una clave que no existe. Un `exit 0` no dice
# que el script haya hecho su trabajo.
#
# Diseno: docs/faq-diseno-2026-08-28.md (1.183 lineas; las TRES secciones del
# 31/08 estan al principio y MANDAN sobre el resto, la mas nueva sobre las otras:
# SIETE nodos, no cinco, y la de las 11:55 mide que CINCO YA ESTAN CONSTRUIDOS.
# NADA de esto se puede hacer por MCP: `update_workflow` reenvia los 60 nodos de
# beckham_bot y BORRA las credenciales de todos. Todo a mano en la UI.
#
# ESTADO MEDIDO 31/08 11:55 · beckham_bot = 60 nodos, versionId == activeVersionId
# == d4ec794a-000f-4b0b-930e-4b2c306baf45. Pasos 0,1,2,3,4 CUMPLIDOS. Quedan el 5
# (rellenar LangSmith), el 6 y el 7 (crear dos nodos) y el 8 (rellenar el
# callback). La meta sigue siendo 62 nodos: ahora es 60 + 2, no 55 + 7.
cd "$(dirname "$0")/.." || exit 1
N=$'\033[0m'; B=$'\033[1m'; D=$'\033[2m'; R=$'\033[31m'; V=$'\033[32m'; A=$'\033[33m'; C=$'\033[36m'

WF='beckham_bot · nhOwpiGxikeU5DLR'
NODO_FAQ='docs/nodo-preparar-prompt-faq-2026-08-28.js'

cab(){ printf '\n%s%s━━━ PASO %s ━━━%s %s%s%s\n' "$B" "$C" "$1" "$N" "$B" "$2" "$N"
       printf '%sdonde:%s   %s\n' "$D" "$N" "$3"
       printf '%snodo:%s    %s\n' "$D" "$N" "$4"
       printf '%scomo:%s    %s\n' "$D" "$N" "$5"; }
ver(){ printf '%sverificar:%s %s\n' "$B" "$N" "$1"; }
cop(){ printf '%scopiar:%s    bash docs/pasos-faq.sh c %s\n' "$B" "$N" "$1"; }
car(){ python3 -c "import io,sys;print(len(io.open(sys.argv[1],encoding='utf-8').read()))" "$1"; }

# ── LOS VALORES COPIABLES ────────────────────────────────────────────────────
# Todos sin el `=` inicial y sin salto de linea final, como pide n8n.
V_IF="{{ \$json._cortado }}"
V_LS_CONTEXTO="{{ \$json.contexto }}"
V_LS_FECHA="{{ \$now.setZone('Europe/Madrid').toFormat('dd/MM/yyyy') }}"
V_AG_TEXT="{{ \$('Preparar_Prompt_FAQ').first().json.prompt }}"
V_AG_SYS="{{ \$json.bot_mobility_prompt }}"
V_CB_URL="https://api.intercom.io/hooks/workflows/trigger_step/{{ \$('Preparar_Prompt_FAQ').first().json.callback_token }}/{{ \$('Preparar_Prompt_FAQ').first().json.conversation_id }}"
V_CB_BODY="{{ { \"data\": { \"mensajeUsuario\": \$json.output.replace(/<[^>]+>/g, '') } } }}"

V_FALLBACK=$(cat <<'JS'
// Mensaje_Fallback_FAQ · recibe la rama de error de `Langsmith Prompt FAQ` y la del
// `AI AGENT FAQ`, y sale a `Callback_Intercom_FAQ`. El cliente SIEMPRE recibe algo.
// `.first()` y NUNCA `.item`: en un nodo de codigo el `.item` cuelga el task runner
// hasta el timeout. Y aqui es seguro porque el turno del FAQ es de UN item.
const idioma = ($('Preparar_Prompt_FAQ').first().json.idioma === 'en') ? 'en' : 'es';
const TEXTO = {
  es: 'Ahora mismo no puedo contestarte. Escribenos a support@taxdown.es y te responde una persona en 24-48 horas.',
  en: 'I cannot answer right now. Please write to support@taxdown.es and someone will reply within 24-48 hours.'
};
return [{ json: { output: TEXTO[idioma], _fallback: true } }];
JS
)

V_DC_ES=$(cat <<'JSON'
{ "conversation_id": «chip conversation_id»,
  "user_id":         «chip user_id»,
  "message":         «chip pregunta»,
  "idioma":          "es",
  "callback_token":  "«el token del paso, copiado de Intercom»",
  "punto":           "faq_entrada" }
JSON
)
V_DC_EN=$(printf '%s' "$V_DC_ES" | sed 's/"es"/"en"/')

V_Z1_ES='Preguntame lo que quieras sobre el regimen. Te doy informacion general sobre la Ley Beckham; no es asesoramiento personalizado. Escribeme tu pregunta y te contesto en unos segundos.'
V_Z2_ES='Escribe tu pregunta. Tardo unos segundos en contestarte.'
V_Z4_ES='{{mensajeUsuario}}'
V_Z5_ES='Pulsa uno de los botones.'
V_Z1_EN='Ask me anything about the regime. This is general information about the Beckham Law, not personalised tax advice. I can answer one question; for anything else I will pass you to a person.'
V_Z2_EN='Type your question. It takes me a few seconds to answer.'
V_Z5_EN='Please tap one of the buttons.'

copiar(){ case "$1" in
  nodo)      [ -r "$NODO_FAQ" ] || { printf '%sfalta el fichero:%s %s\n' "$R" "$N" "$NODO_FAQ" >&2; return 1; }
             pbcopy < "$NODO_FAQ"; printf '%scopiado el nodo Preparar_Prompt_FAQ ENTERO%s · n8n tiene que decir %s%s caracteres%s\n' "$V" "$N" "$V" "$(car $NODO_FAQ)" "$N" ;;
  uuid)      u=$(uuidgen | tr 'A-Z' 'a-z'); printf '%s' "$u" | pbcopy; printf '%sUUID nuevo para el Path de Webhook_FAQ:%s %s\n' "$V" "$N" "$u" ;;
  if)        printf '%s' "$V_IF" | pbcopy;        printf '%scopiada la condicion del IF%s · %s\n' "$V" "$N" "$V_IF" ;;
  ls-ctx)    printf '%s' "$V_LS_CONTEXTO" | pbcopy; printf '%scopiado el inputParameter contexto%s\n' "$V" "$N" ;;
  ls-fecha)  printf '%s' "$V_LS_FECHA" | pbcopy;  printf '%scopiado el inputParameter current_date%s\n' "$V" "$N" ;;
  ag-text)   printf '%s' "$V_AG_TEXT" | pbcopy;   printf '%scopiado el Text del agente%s\n' "$V" "$N" ;;
  ag-sys)    printf '%s' "$V_AG_SYS" | pbcopy;    printf '%scopiado el System Message del agente%s\n' "$V" "$N" ;;
  fallback)  printf '%s' "$V_FALLBACK" | pbcopy;  printf '%scopiado el codigo de Mensaje_Fallback_FAQ%s\n' "$V" "$N" ;;
  cb-url)    printf '%s' "$V_CB_URL" | pbcopy;    printf '%scopiada la URL del callback%s\n' "$V" "$N" ;;
  cb-body)   printf '%s' "$V_CB_BODY" | pbcopy;   printf '%scopiado el JSON Body del callback%s\n' "$V" "$N" ;;
  dc-es)     printf '%s' "$V_DC_ES" | pbcopy;     printf '%scopiado el Body del DC espanol%s %s(los chips se INSERTAN con Add data)%s\n' "$V" "$N" "$D" "$N" ;;
  dc-en)     printf '%s' "$V_DC_EN" | pbcopy;     printf '%scopiado el Body del DC ingles%s\n' "$V" "$N" ;;
  z1-es)     printf '%s' "$V_Z1_ES" | pbcopy;     printf '%scopiado el mensaje Z1 ES (lleva el DISCLAIMER)%s\n' "$V" "$N" ;;
  z2-es)     printf '%s' "$V_Z2_ES" | pbcopy;     printf '%scopiado el Collect data Z2 ES%s\n' "$V" "$N" ;;
  z4)        printf '%s' "$V_Z4_ES" | pbcopy;     printf '%scopiado el Reply Z4 (las dos cadenas)%s\n' "$V" "$N" ;;
  z5-es)     printf '%s' "$V_Z5_ES" | pbcopy;     printf '%scopiado el aviso de Z5 ES%s\n' "$V" "$N" ;;
  z1-en)     printf '%s' "$V_Z1_EN" | pbcopy;     printf '%scopiado el mensaje Z1 EN%s %s(traduccion propuesta: revisala)%s\n' "$V" "$N" "$D" "$N" ;;
  z2-en)     printf '%s' "$V_Z2_EN" | pbcopy;     printf '%scopiado el Collect data Z2 EN%s\n' "$V" "$N" ;;
  z5-en)     printf '%s' "$V_Z5_EN" | pbcopy;     printf '%scopiado el aviso de Z5 EN%s\n' "$V" "$N" ;;
  '') printf '%sclaves:%s nodo uuid if ls-ctx ls-fecha ag-text ag-sys fallback cb-url cb-body\n' "$B" "$N"
      printf '        dc-es dc-en z1-es z2-es z4 z5-es z1-en z2-en z5-en\n'
      printf '%s        (19 claves. `c` sin argumento las lista y sale 0; una clave que no%s\n' "$D" "$N"
      printf '%s        existe sale con exit 1, que es el corolario del proyecto.)%s\n' "$D" "$N"
      return 0 ;;
  *)  printf '%sclave desconocida:%s %s\n' "$R" "$N" "$1" >&2
      printf '%slas 19 que hay:%s nodo uuid if ls-ctx ls-fecha ag-text ag-sys fallback cb-url cb-body\n' "$B" "$N" >&2
      printf '                dc-es dc-en z1-es z2-es z4 z5-es z1-en z2-en z5-en\n' >&2
      return 1 ;;
esac; }

# ── LOS PASOS ────────────────────────────────────────────────────────────────
p0(){ cab 0 "LO QUE QUEDA DE MIRAR (dos cosas) Y EL BACKUP · antes de clicar nada" \
  "INTERCOM s1hap599 (PRODUCCION) · Custom Bot «Mobility Bot (OnClick)» · 68617004" "(ninguno todavia)" \
  "solo mirar, y duplicar"
printf '%sP0 YA ESTA MEDIDO Y SALIO BIEN:%s %sun agent v3.1 con CERO aristas ai_tool ARRANCA.%s\n' "$B" "$N" "$V" "$N"
printf '%s  Workflow desechable ZZZ_prueba_agente_sin_tools (oC8HjfvLlu4JrFbi), ejecucion 8151999:%s\n' "$D" "$N"
printf '%s  el error es «Node does not have any credentials set» del sub-nodo del MODELO, y la pila%s\n' "$D" "$N"
printf '%s  llega hasta getChatModel -- o sea que el agente entro en execute(). CERO menciones de%s\n' "$D" "$N"
printf '%s  tools. Corroborado con get_node_types (tools? es OPCIONAL) y validate_workflow (valid).%s\n' "$D" "$N"
printf '%s  Asi que se construye con `agent`, NO con Basic LLM Chain, y el callback publica%s '$'\033[32m''$json.output'"$N"'.\n' "$D" "$N"
printf '\n%s31/08 11:33 · TRES PUNTOS DE ESTE PASO ESTAN RESUELTOS. Quedan DOS.%s\n' "$V" "$N"
printf '  %sRESUELTO%s el borrador sin publicar: %sversionId == activeVersionId == 7f439285%s, medido\n' "$V" "$N" "$B" "$N"
printf '           %sa las 11:33. Ya no hay borrador ajeno que se publique de propina al pulsar%s\n' "$D" "$N"
printf '           %sSave. Y lo que llevaba dentro esta identificado: era el arreglo de R9 (la%s\n' "$D" "$N"
printf '           %sformula de Leer_Expediente_Para_Prompt, que hoy devuelve FALSE() con user_id%s\n' "$D" "$N"
printf '           %svacio en vez de casar dos filas ajenas). %sLA REFERENCIA NUEVA de «no lo he%s\n' "$D" "$B" "$N"
printf '           %stocado» ES d4ec794a con 60 nodos%s%s (11:55), no 7f439285 ni ef638a18.%s\n' "$B" "$N" "$D" "$N"
printf '\n%s31/08 11:55 · Y HAY CINCO NODOS DEL SIDECAR YA CONSTRUIDOS.%s %sMedido: beckham_bot tiene%s\n' "$V" "$N" "$D" "$N"
printf '%s60 nodos y triggerCount 4. Webhook_FAQ, Preparar_Prompt_FAQ y ¿Cortar_FAQ? estan ACTIVOS y%s\n' "$D" "$N"
printf '%sbien; Langsmith Prompt FAQ y Callback_Intercom_FAQ existen DISABLED y VACIOS. Las tres%s\n' "$D" "$N"
printf '%saristas que hay son las correctas y el aislamiento AGUANTA: cero aristas entre el FAQ y el%s\n' "$D" "$N"
printf '%sintake. Asi que los pasos 2, 3 y 4 estan CUMPLIDOS -- se leen para comprobar, no para hacer.%s\n' "$D" "$N"
printf '  %sRESUELTO%s el END de detras de «Z. FAQ»: %sNO lleva Close conversation%s. Solo un Message\n' "$V" "$N" "$B" "$N"
printf '           %s(«Aqui IRA AL FAQ») y un «+ Add step»; el END que veia la auditoria del 27/08%s\n' "$D" "$N"
printf '           %sera el final de un path VACIO. R3 pierde su mitad grave: quien pulsa «tengo%s\n' "$D" "$N"
printf '           %spreguntas» se queda sin RESPUESTA, no sin HILO.%s\n' "$D" "$N"
printf '  %sRESUELTO%s la rama inglesa: %sSI existe y se llama «AI. FAQ ENGLISH»%s (no el path AA que\n' "$V" "$N" "$B" "$N"
printf '           %ssuponia la auditoria). El hueco existe y se rellena igual que el espanol.%s\n' "$D" "$N"
printf '\n%sLO QUE QUEDA:%s\n' "$B" "$N"
printf '%s1 · B1b:%s abrir un Data Connector y anotar si el token del callback identifica el\n' "$A" "$N"
printf '     %sCONECTOR o el PASO. No bloquea la etapa 1 (2 conectores en los dos casos), pero%s\n' "$D" "$N"
printf '     %sSIZEA la etapa 2: si es por paso, 3 turnos x 2 idiomas son SEIS conectores.%s\n' "$D" "$N"
printf '     %sY hay un corolario que vale ya: si el token es POR PASO, un conector con el token%s\n' "$D" "$N"
printf '     %ssoldado en su Body solo se puede insertar UNA vez en todo el canvas. Un conector%s\n' "$D" "$N"
printf '     %sdel FAQ = un paso del canvas.%s\n' "$D" "$N"
printf '%s2 · DUPLICAR el Custom Bot%s como %sMobility Bot (OnClick) — BACKUP 20260831%s.\n' "$R" "$N" "$V" "$N"
printf '     %sEs la UNICA vuelta atras que existe: un canvas publicado mal no se revierte.%s\n' "$D" "$N"
ver "nada que ejecutar. Las dos respuestas se apuntan en el log de la sesion."; }

p1(){ cab 1 "LA PUERTA DEL REPO · lo unico que se puede verificar sin salir de bash" \
  "REPO" "docs/nodo-preparar-prompt-faq-2026-08-28.js" "correr la puerta"
printf '%sfichero:%s %s %s(%s caracteres)%s\n' "$A" "$N" "$NODO_FAQ" "$D" "$(car $NODO_FAQ)" "$N"
printf '%sQue mide, y por que estas 114:%s los cuatro cortes baratos, el enmascarado de las cuatro\n' "$D" "$N"
printf '%sclases de PII, que 50.000 / 60000 / 2026 / 02/03/2026 / un CP NO se enmascaran, el idioma%s\n' "$D" "$N"
printf '%sen es y en en, el marco [MODO FAQ], las 6 lineas VERBATIM del v4, el body de UNA clave del%s\n' "$D" "$N"
printf '%sData Connector, y que el nodo NO lee Airtable ni el hilo -- eso ultimo ejecutandolo con%s\n' "$D" "$N"
printf '%sSOLO $input y console, mas una COPIA SABOTEADA que tiene que reventar.%s\n' "$D" "$N"
ver "node docs/test-preparar-prompt-faq.js   ${V}-> 114 verdes, 0 rojas${N}"
printf '%s          bash docs/pasos.sh test   %s-> las DIECINUEVE puertas verdes%s\n' ' ' "$V" "$N"
printf '%s31/08 · OJO CON ESA SEGUNDA:%s %s`pasos.sh test` imprime FALLA cuando una puerta cae, pero%s\n' "$R" "$N" "$D" "$N"
printf '%sSALE CON exit 0 igual. Hay que LEER las 19 lineas, no mirar el codigo de salida. Es el%s\n' "$D" "$N"
printf '%scorolario de la casa: un exit 0 no dice que el script haya hecho su trabajo.%s\n' "$D" "$N"; }

p2(){ cab 2 "Webhook_FAQ · CUMPLIDO · su path es un UUID" \
  "$WF" "Webhook_FAQ (YA CREADO y activo · n8n-nodes-base.webhook tv2.1)" \
  "nada que hacer: comprobar que los cuatro campos son estos"
printf '%s31/08 11:55 · ESTE PASO YA ESTA HECHO, Y ESTA BIEN.%s %sMedido en el nodo vivo: webhook%s\n' "$V" "$N" "$D" "$N"
printf '%stv2.1, httpMethod POST, path %s76ab852d-3a77-43e2-b951-f75d8f85dbcd%s%s, options {} (o sea%s\n' "$D" "$B" "$N" "$D" "$N"
printf '%sResponse Immediately), alwaysOutputData true, sin onError. Los cuatro campos correctos.%s\n' "$D" "$N"
printf '%sNO hay que crear nada: lo que sigue es la referencia de COMO tiene que estar.%s\n' "$A" "$N"
printf '  %sHTTP Method%s      %sdesplegable%s -> %sPOST%s %s(por defecto viene GET)%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$D" "$N"
printf '  %sPath%s             %stexto%s      -> %sun UUID%s %s(NO «beckham-faq»: el webhook es publico%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$D" "$N"
printf '                     %sy sin auth, y un nombre legible es adivinable. Es oscuridad, no%s\n' "$D" "$N"
printf '                     %sseguridad: la seguridad de verdad es WP-203 y sigue pendiente.)%s\n' "$D" "$N"
printf '  %sRespond%s          %sdesplegable%s -> %sImmediately%s %s(el de por defecto: contesta «Workflow%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$D" "$N"
printf '                     %swas started» en milisegundos, asi que el DC no gasta sus 15 s)%s\n' "$D" "$N"
printf '  %sAlways Output Data%s %sinterruptor%s -> %sON%s %s(Settings del nodo)%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$D" "$N"
printf '%sSin onError.%s %sY el nodo se deja SUELTO, sin conectar a nada del intake.%s\n' "$D" "$N" "$D" "$N"
cop uuid
ver "la URL de produccion del propio nodo, y luego ${B}bash docs/curl-faq.sh 1 1${N} (paso 9)."
printf '%s          Que el nodo existe con POST y ese path lo compruebo yo por MCP.%s\n' "$D" "$N"; }

p3(){ cab 3 "Preparar_Prompt_FAQ · CUMPLIDO · el UNICO pegado del diseno" \
  "$WF" "Preparar_Prompt_FAQ (YA PEGADO y activo · Code, Run Once for All Items)" \
  "nada que hacer: el hash del nodo vivo y el del fichero coinciden"
printf '%s31/08 11:55 · ESTE PEGADO YA ESTA HECHO, Y VERIFICADO BYTE A BYTE.%s %sEl jsCode del nodo%s\n' "$V" "$N" "$D" "$N"
printf '%svivo y el fichero local tienen los mismos 13.654 caracteres Y EL MISMO sha256%s\n' "$D" "$N"
printf '%s(5d7f26ee9c629ab8...). No por longitud: por hash. NO hay que repegarlo.%s\n' "$D" "$N"
printf '%sfichero:%s %s\n' "$A" "$N" "$NODO_FAQ"
printf '%sel contador tiene que decir:%s %s%s caracteres%s\n' "$A" "$N" "$V" "$(car $NODO_FAQ)" "$N"
printf '%sENTERO, con Cmd+A.%s %sEl 21/08 un parche por trozos acabo con una linea de prosa DENTRO%s\n' "$R" "$N" "$D" "$N"
printf '%sdel codigo: SyntaxError: Unexpected number. Un fichero completo con Cmd+A, no.%s\n' "$D" "$N"
printf '%sMode:%s %sRun Once for All Items%s %s(el de por defecto). Arista: Webhook_FAQ -> aqui.%s\n' "$D" "$V" "$N" "$D" "$N" "$N"
printf '%sNo puede romper nada al pegarse mal:%s %snadie mas lo invoca todavia.%s\n' "$V" "$N" "$D" "$N"
cop nodo
ver "node docs/test-preparar-prompt-faq.js   ${V}-> 114 verdes, 0 rojas${N}"
printf '%s          y en n8n, que el contador diga %s. Eso lo miras tu en la caja del editor.%s\n' "$D" "$(car $NODO_FAQ)" "$N"; }

p4(){ cab 4 "¿Cortar_FAQ? · CUMPLIDO · el SEXTO nodo, y el diseno lo tenia en CINCO" \
  "$WF" "¿Cortar_FAQ? (YA CREADO y activo · If tv2.3)" "nada que hacer: comprobar la condicion"
printf '%s31/08 11:55 · ESTE NODO YA ESTA CREADO, Y SU CONDICION ES LA CORRECTA.%s %sMedido: if%s\n' "$V" "$N" "$D" "$N"
printf '%stv2.3, una sola condicion, leftValue = %s={{ $json._cortado }}%s%s, operador boolean/true,%s\n' "$D" "$B" "$N" "$D" "$N"
printf '%stypeValidation strict. Y sus dos salidas van a donde tienen que ir. Nada que tocar.%s\n' "$D" "$N"
printf '%sPOR QUE HACE FALTA:%s el diseno §3.2 dice que el corte barato «no llama al modelo», y un\n' "$R" "$N"
printf '%snodo de codigo NO elige por que rama sale. Preparar_Prompt_FAQ devuelve `_cortado` y el%s\n' "$D" "$N"
printf '%s`output` ya escrito; quien se salta el modelo es este IF. Sin el, el nodo sigue siendo%s\n' "$D" "$N"
printf '%scorrecto y el cliente sigue recibiendo respuesta, pero el UNICO freno de coste del lado%s\n' "$D" "$N"
printf '%sservidor (§7 R5: webhook publico, ~66.020 caracteres de systemMessage por POST)%s\n' "$D" "$N"
printf '%sdesaparece EN SILENCIO.%s\n' "$R" "$N"
printf '  %sConditions%s -> %sBoolean · is true%s -> valor: %s%s%s\n' "$B" "$N" "$D" "$N" "$V" "$V_IF" "$N"
printf '  %ssalida true%s  -> %sCallback_Intercom_FAQ%s %s(publica el `output` del corte, 0 tokens)%s\n' "$B" "$N" "$V" "$N" "$D" "$N"
printf '  %ssalida false%s -> %sLangsmith Prompt FAQ%s %s(el turno normal)%s\n' "$B" "$N" "$V" "$N" "$D" "$N"
cop if
ver "un curl con message vacio: ${V}la ejecucion sale por la rama true y el AI AGENT FAQ NO corre${N}."
printf '%s          Eso lo compruebo yo por MCP leyendo el runData de la ejecucion.%s\n' "$D" "$N"; }

p5(){ cab 5 "Langsmith Prompt FAQ · EXISTE EN BLANCO · borrarlo y DUPLICAR el vivo" \
  "$WF" "Langsmith Prompt FAQ (existe DISABLED y VACIO · CUSTOM.langSmithPrompt tv1)" \
  "borrar el que hay, y copiar/pegar 'Langsmith Prompt' en el MISMO workflow"
printf '%sPOR QUE DUPLICANDO:%s el nodo de LangSmith es %sCUSTOM%s y no se recrea por MCP; copiar/pegar\n' "$R" "$N" "$B" "$N"
printf '%sdentro del mismo workflow es lo que %sARRASTRA LA CREDENCIAL%s. Crearlo a mano deja un nodo\n' "$D" "$B" "$N"
printf '%ssin credencial, y el sintoma es el de P0: «Node does not have any credentials set».%s\n' "$D" "$N"
printf '%s31/08 11:55 · EL NODO YA EXISTE, PERO ESTA EN BLANCO Y NO SE CREO DUPLICANDO.%s\n' "$R" "$N"
printf '%s  Medido, los dos uno al lado del otro:%s\n' "$D" "$N"
printf '%s    Langsmith Prompt      -> promptName=bot_mobility_prompt, promptTag=prod, y los DOS%s\n' "$D" "$N"
printf '%s                             inputParameters (contexto y current_date) rellenos.%s\n' "$D" "$N"
printf '%s    Langsmith Prompt FAQ  -> %s{"inputParameters":{"parameters":[]}}%s%s. Y disabled.%s\n' "$D" "$R" "$N" "$D" "$N"
printf '%s  O sea que se creo desde el PANEL DE NODOS, no con un copiar/pegar. Eso ANULA lo que%s\n' "$D" "$N"
printf '%s  decia aqui el 31/08 a las 11:33 («comprobar cuatro y cambiar uno»): estan los cuatro%s\n' "$D" "$N"
printf '%s  vacios, y sobre todo NO ARRASTRO LA CREDENCIAL, que era el unico motivo de duplicar.%s\n' "$D" "$N"
printf '%sLO MAS BARATO, Y ES LO QUE RECOMIENDO:%s %sBORRAR el Langsmith Prompt FAQ que hay y%s\n' "$V" "$N" "$D" "$N"
printf '%svolver a crearlo con Ctrl+C / Ctrl+V sobre «Langsmith Prompt» en el MISMO workflow. Eso%s\n' "$D" "$N"
printf '%strae los cuatro campos Y la credencial de un golpe, y deja UN solo campo que cambiar: el%s\n' "$D" "$N"
printf '%sonError. Rellenarlo a mano son cuatro campos MAS la credencial, que es justo la parte que%s\n' "$D" "$N"
printf '%sno se puede verificar desde bash ni por MCP (credentials sale {} en TODOS los nodos).%s\n' "$D" "$N"
printf '%sY NO SE HABILITA hasta que existan el agente y el fallback%s %s(pasos 6 y 7): habilitarlo%s\n' "$A" "$N" "$D" "$N"
printf '%santes deja el turno muriendo DESPUES de haber pagado la llamada al prompt.%s\n' "$D" "$N"
printf '  %spromptName%s %stexto%s -> %sbot_mobility_prompt%s %s(EXACTAMENTE el del intake)%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$D" "$N"
printf '  %spromptTag%s  %stexto%s -> %sprod%s %s(idem)%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$D" "$N"
printf '  %sinputParameters%s -> %scontexto%s = %s%s%s\n' "$B" "$N" "$V" "$N" "$D" "$V_LS_CONTEXTO" "$N"
printf '                     %scurrent_date%s = %s%s%s\n' "$V" "$N" "$D" "$V_LS_FECHA" "$N"
printf '  %sonError%s %sdesplegable%s -> %sContinue (using error output)%s -> %sMensaje_Fallback_FAQ%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$V" "$N"
printf '%sA PROPOSITO no se enchufa al Prompt_De_Respaldo:%s %sesa copia local guarda el prompt YA%s\n' "$R" "$N" "$D" "$N"
printf '%sRENDERIZADO con el contexto del ultimo turno, o sea con datos de otra persona dentro.%s\n' "$D" "$N"
printf '%sSi LangSmith se cae, el FAQ se disculpa y ofrece una persona.%s\n' "$D" "$N"
cop ls-ctx; cop ls-fecha
ver "P4 · diff de dos campos por MCP: ${V}promptName y promptTag IDENTICOS${N} a los del nodo del intake."; }

p6(){ cab 6 "AI AGENT FAQ · NO EXISTE TODAVIA · cero aristas ai_tool, y ahi esta la defensa" \
  "$WF" "AI AGENT FAQ (POR CREAR · @n8n/n8n-nodes-langchain.agent tv3.1)" \
  "boton +, AI Agent, y NO enchufarle ninguna tool"
printf '  %sSource for Prompt%s %sdesplegable%s -> %sDefine below%s\n' "$B" "$N" "$D" "$N" "$V" "$N"
printf '  %sText%s              %stexto/expresion%s -> %s%s%s\n' "$B" "$N" "$D" "$N" "$V" "$V_AG_TEXT" "$N"
printf '  %sSystem Message%s    %stexto/expresion%s -> %s%s%s\n' "$B" "$N" "$D" "$N" "$V" "$V_AG_SYS" "$N"
printf '  %sMax Iterations%s    %snumero%s -> %s2%s %s(sin tools basta UNA llamada; el 2 es el tope)%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$D" "$N"
printf '  %sonError%s           %sdesplegable%s -> %sContinue (using error output)%s -> %sMensaje_Fallback_FAQ%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$V" "$N"
printf '  %saristas ai_languageModel%s -> %s1%s, al MISMO sub-nodo %s«David Beckham»%s del intake\n' "$B" "$N" "$V" "$N" "$B" "$N"
printf '  %saristas ai_tool%s -> %sCERO. NINGUNA. Ni memory, ni outputParser.%s\n' "$B" "$R" "$N"
printf '%sPor que es la defensa:%s %sel array tools[] que sale hacia el modelo va VACIO, no es que el%s\n' "$D" "$N" "$D" "$N"
printf '%sprompt se lo prohiba. El nodo agent no expone ningun selector de tools -- son aristas del%s\n' "$D" "$N"
printf '%sgrafo -- asi que no hay allowlist que un LLM pueda desobedecer. Se verifica CONTANDO%s\n' "$D" "$N"
printf '%sARISTAS, nunca leyendo el prompt.%s\n' "$B" "$N"
printf '%sSi «David Beckham» no dejara alimentar dos agentes%s %s(no esta medido)%s: se duplica el\n' "$A" "$N" "$D" "$N"
printf '%ssub-nodo con la misma configuracion y la deriva son dos campos (model, options).%s\n' "$D" "$N"
cop ag-text; cop ag-sys
ver "P4 · por MCP: ${V}ai_tool = 0${N} y ${V}ai_languageModel = 1${N} en AI AGENT FAQ. Lo cuento yo."; }

p7(){ cab 7 "Mensaje_Fallback_FAQ · NO EXISTE TODAVIA · el cliente SIEMPRE recibe algo" \
  "$WF" "Mensaje_Fallback_FAQ (POR CREAR · Code)" "pegar 9 lineas"
printf '%sRecibe%s las dos ramas de error (LangSmith y el agente) y %ssale a%s Callback_Intercom_FAQ.\n' "$D" "$N" "$D" "$N"
printf '%sLee el idioma de Preparar_Prompt_FAQ con %s.first()%s%s, nunca .item.%s\n' "$D" "$B" "$N" "$D" "$N"
cop fallback
ver "desconectar la credencial de LangSmith un momento y mandar un curl: ${V}el cliente recibe la disculpa${N}."
printf '%s          (o mas barato: pinchar la rama de error a mano en la ejecucion. Lo miro yo.)%s\n' "$D" "$N"; }

p8(){ cab 8 "Callback_Intercom_FAQ · EXISTE EN BLANCO · el SEPTIMO y ULTIMO nodo" \
  "$WF" "Callback_Intercom_FAQ (YA EXISTE, disabled y vacio · HTTP Request tv4.4)" "POST, sin credencial"
printf '%s31/08 11:55 · EL NODO YA EXISTE Y ES tv4.4, NO tv4.2.%s %sEsta BIEN asi: Cerrar_Conversacion,%s\n' "$V" "$N" "$D" "$N"
printf '%sel otro POST a Intercom de la casa, tambien es tv4.4 y lleva la misma forma de body. No hay%s\n' "$D" "$N"
printf '%sque recrearlo. Hoy tiene %s{"method":"POST","options":{}}%s%s y nada mas, retryOnFail OFF y%s\n' "$D" "$R" "$N" "$D" "$N"
printf '%sdisabled. Le faltan url, sendBody, specifyBody, jsonBody y el retryOnFail.%s\n' "$D" "$N"
printf '%sEL DETALLE DE UI QUE CUESTA UN TURNO MUDO SI NO SE DICE:%s %sen httpRequest tv4.x el campo%s\n' "$R" "$N" "$D" "$N"
printf '%sdel JSON NO SALE EN PANTALLA hasta que activas %sSend Body%s%s y pones %sBody Content Type =%s\n' "$D" "$B" "$N" "$D" "$B" "$N"
printf '%s%sJSON%s%s y %sSpecify Body = Using JSON%s%s. Sin esos dos toggles no hay donde pegar el cb-body,%s\n' "$D" "$B" "$N" "$D" "$B" "$N" "$D" "$N"
printf '%sy el nodo hace un POST SIN CUERPO -- que Intercom acepta con 200 y NO PUBLICA NADA.%s\n' "$R" "$N"
printf '  %sMethod%s %sdesplegable%s -> %sPOST%s %s(ya esta)%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$D" "$N"
printf '  %sURL%s    %sexpresion%s ->\n' "$B" "$N" "$D" "$N"
printf '    %s%s%s\n' "$V" "$V_CB_URL" "$N"
printf '  %sSend Body%s ON · %sJSON%s · %sUsing JSON%s ->\n' "$B" "$N" "$D" "$N" "$D" "$N"
printf '    %s%s%s\n' "$V" "$V_CB_BODY" "$N"
printf '  %sAuthentication%s -> %sNone%s %s(el token va DENTRO de la URL)%s\n' "$B" "$N" "$V" "$N" "$D" "$N"
printf '  %sRetry On Fail%s ON · %sonError%s -> %sSIN onError%s %s(igual que el Callback_Intercom vivo)%s\n' "$B" "$N" "$B" "$N" "$V" "$N" "$D" "$N"
printf '%sEL TOKEN DEJA DE ESTAR SOLDADO, y es la correccion mas importante del diseno.%s\n' "$R" "$N"
printf '%sEl callback del intake lleva la URL fija con %sq3bhdtoi%s%s, que es el app id del workspace%s\n' "$D" "$B" "$N" "$D" "$N"
printf '%sVIEJO; el canvas nuevo vive en %ss1hap599%s%s. Con el token viajando en el Body, el FAQ%s\n' "$D" "$B" "$N" "$D" "$N"
printf '%sfunciona en los DOS workspaces y no hay que elegir.%s\n' "$D" "$N"
printf '%sOJO · CORRECCION AL §2.2 DEL DISENO:%s el diseno lee el token de\n' "$A" "$N"
printf '%s  $(\x27Webhook_FAQ\x27).first().json.body.callback_token%s, y eso sale %sundefined%s cuando el Data\n' "$D" "$N" "$R" "$N"
printf '%sConnector manda form-urlencoded con el JSON entero como UNA sola clave (medido en las%s\n' "$D" "$N"
printf '%sejecuciones 8052012 y 8052018). Hay que leerlo de %sPreparar_Prompt_FAQ%s%s, que es quien lo%s\n' "$D" "$B" "$N" "$D" "$N"
printf '%sparsea. El sintoma si se hace mal: turno mudo con la ejecucion en VERDE.%s\n' "$D" "$N"
printf '%sY el .first() aqui es seguro%s %s(la regla de las expresiones pide .item): el turno del FAQ%s\n' "$D" "$N" "$D" "$N"
printf '%ses de UN item por construccion, y el .first() solo muerde con varias filas pendientes.%s\n' "$D" "$N"
printf '\n%s31/08 · Avisar_FAQ_Sin_Publicar SE CAE. NO se crea, y no es un recorte:%s\n' "$R" "$N"
printf '%s  MEDIDO: beckham_bot.settings.errorWorkflow = %sBJfExmwu1fI1aPpY%s%s, y beckham_alertas%s\n' "$D" "$B" "$N" "$D" "$N"
printf '%s  tiene DOS entradas -- Fallo_De_Workflow (errorTrigger) -> Slack_Fallo, y%s\n' "$D" "$N"
printf '%s  Aviso_Desde_Beckham (executeWorkflowTrigger) -> Slack_Aviso. Un nodo que falla en%s\n' "$D" "$N"
printf '%s  ROJO ya avisa a Slack con %s*Nodo:* Callback_Intercom_FAQ%s%s y la URL de la ejecucion.%s\n' "$D" "$B" "$N" "$D" "$N"
printf '%s  Y el Callback_Intercom VIVO lo demuestra: retryOnFail ON y onError NULL. El intake%s\n' "$D" "$N"
printf '%s  YA resuelve «el callback no publico» con el errorWorkflow, no con un nodo de aviso.%s\n' "$D" "$N"
printf '%sLAS DOS SENALES, que era lo que el diseno queria distinguir:%s\n' "$B" "$N"
printf '  %sel modelo falla%s   -> corre Mensaje_Fallback_FAQ, el cliente recibe la disculpa,\n' "$V" "$N"
printf '                      %sla ejecucion sale VERDE y no hay Slack%s\n' "$D" "$N"
printf '  %sel callback falla%s -> la ejecucion sale ROJA y Slack_Fallo nombra el nodo\n' "$V" "$N"
printf '%sEL PRECIO, declarado:%s %sSlack_Fallo NO lleva conversation_id (su plantilla solo usa%s\n' "$A" "$N" "$D" "$N"
printf '%sworkflow.name, lastNodeExecuted, error.message, mode y execution.url), asi que saber%s\n' "$D" "$N"
printf '%sQUE hilo se quedo mudo es un clic mas en execution.url. Se paga: un nodo menos.%s\n' "$D" "$N"
printf '%sY en un caso es ESTRICTAMENTE mejor:%s %sexecutionTimeout de beckham_bot son 120 s, y un%s\n' "$V" "$N" "$D" "$N"
printf '%stimeout CANCELA la ejecucion -- las salidas de error de nodo NO corren (R6). Un Avisar_*%s\n' "$D" "$N"
printf '%scolgado de un onError no se ejecutaria nunca ahi; el errorWorkflow si.%s\n' "$D" "$N"
cop cb-url; cop cb-body
ver "un curl en modo VIVO (TOKEN y CONVERSACION reales): ${V}el mensaje aparece en el hilo${N}."; }

p9(){ cab 9 "P4 y P1 · medir ANTES de tocar el canvas" \
  "REPO + MCP" "(ninguno)" "un comando y una lectura"
printf '%sP4 · el aislamiento desde dentro%s %s(lo hago yo por MCP)%s\n' "$B" "$N" "$D" "$N"
printf '  %sAI AGENT FAQ: aristas ai_tool = %s0%s · ai_languageModel = %s1%s\n' "$D" "$V" "$N" "$V" "$N"
printf '  %spromptName y promptTag identicos entre los dos nodos de LangSmith%s\n' "$D" "$N"
printf '  %sy beckham_bot con %s60 + 2 = 62 nodos%s%s (la meta no cambia, la BASE si: el 31/08 a las%s\n' "$D" "$V" "$N" "$D" "$N"
printf '  %s11:55 ya hay 60 nodos y CINCO son del sidecar. Siguen siendo 7 en total: entra el IF del%s\n' "$D" "$N"
printf '  %scorte y se cae Avisar_FAQ_Sin_Publicar -- diseno, §A y §C1)%s\n' "$D" "$N"
printf '  %sLA REFERENCIA del versionId (31/08 11:55):%s %sel de partida es d4ec794a con 60 nodos,%s\n' "$A" "$N" "$D" "$N"
printf '  %sy ya esta PUBLICADO (versionId == activeVersionId). Al acabar tienen que ser 62 nodos%s\n' "$D" "$N"
printf '  %sy una version nueva movida SOLO por los 2 que faltan mas los 2 rellenos. Es la TERCERA%s\n' "$D" "$N"
printf '  %sreferencia del dia: ef638a18 -> 7f439285 -> d4ec794a. No citar las dos viejas.%s\n' "$D" "$N"
printf '\n%sP1 · las 33 preguntas doradas%s\n' "$B" "$N"
printf '  %sUUID=<el del paso 2> bash docs/curl-faq.sh%s\n' "$B" "$N"
printf '  %sEn modo SECO el callback no publica y salta un aviso por pregunta: AVISA AL CANAL.%s\n' "$A" "$N"
printf '  %sEl numero que tiene que salir: %s33 en su etiqueta%s %s(24 RESPONDE · 5 NO CUBIERTO · 4%s\n' "$D" "$V" "$N" "$D" "$N"
printf '  %sESCALA). Una respuesta correcta CON una afirmacion normativa inventada de propina%s\n' "$D" "$N"
printf '  %sSUSPENDE. Las 33 respuestas las leo yo de las ejecuciones.%s\n' "$D" "$N"
printf '%sP3 · los 10 prompts adversarios%s %s-> lo que se cuenta son EJECUCIONES:%s\n' "$B" "$N" "$D" "$N"
printf '  %sCERO de Webhook_Upsert_Expediente en la ventana. No lo que el bot conteste.%s\n' "$V" "$N"
ver "bash docs/pasos.sh test   ${V}-> las DIECINUEVE puertas verdes${N}"; }

p10(){ cab 10 "INTERCOM · los DOS Data Connectors" \
  "INTERCOM s1hap599 · Settings > Apps & integrations > Data connectors" \
  "beckham_faq_es y beckham_faq_en, identicos salvo DOS literales" "crear dos veces"
printf '  %sMetodo/URL%s -> %sPOST https://es.synapse.rentax.es/webhook/<el UUID del paso 2>%s\n' "$B" "$N" "$V" "$N"
printf '  %sModo%s -> %scon wait_for_callback%s %s(31/08: NO es una opcion del CONECTOR. Es una%s\n' "$B" "$N" "$V" "$N" "$D" "$N"
printf '         %scasilla del PASO, y aparece al insertar el Data Connector en el canvas -- se ve%s\n' "$D" "$N"
printf '         %sen el paso 11, Z3. El usuario ya perdio un rato buscandola aqui.)%s\n' "$D" "$N"
printf '  %sObject mapping%s -> %sNINGUNO%s %s(la respuesta vuelve por el callback; mapear aqui PISA%s\n' "$B" "$N" "$R" "$N" "$D" "$N"
printf '                     %satributos)%s\n' "$D" "$N"
printf '  %sData inputs (3, con «Let Fin collect», Name a mano y en minusculas):%s\n' "$B" "$N"
printf '     %sconversation_id%s  Required %sON%s   %schip Conversation ID%s\n' "$V" "$N" "$R" "$N" "$D" "$N"
printf '     %suser_id%s          Required %sOFF%s  %schip External ID%s\n' "$V" "$N" "$A" "$N" "$D" "$N"
printf '     %spregunta%s         Required %sON%s   %schip de la respuesta del Collect data%s\n' "$V" "$N" "$R" "$N" "$D" "$N"
printf '%sLas dos Required son DECISIONES:%s %sRequired es una condicion de EJECUCION. Si falta el%s\n' "$D" "$N" "$D" "$N"
printf '%svalor el conector no arranca, no hay callback, y el cliente se queda mirando el chat SIN%s\n' "$D" "$N"
printf '%sNINGUN ERROR VISIBLE. conversation_id es el unico cuya ausencia DEBE parar el DC (sin el%s\n' "$D" "$N"
printf '%sno hay donde publicar). user_id en OFF porque %sun visitante anonimo del Messenger no%s\n' "$D" "$A" "$N"
printf '%stiene External ID%s%s, y el FAQ es la PRIMERA pantalla del embudo: con Required ON estaria%s\n' "$A" "$D" "$N"
printf '%smuerto justo para su usuario tipico -- y para el metodo de prueba, que es incognito.%s\n' "$D" "$N"
printf '\n%sBody (6 claves).%s %sLos chips se INSERTAN con «Add data», NUNCA se teclean: tecleado se%s\n' "$B" "$N" "$R" "$N"
printf '%spinta como pill y resuelve a null.%s\n' "$R" "$N"
printf '%s%s%s\n' "$D" "$V_DC_ES" "$N"
cop dc-es; cop dc-en
ver "en el paso 12, la primera conversacion real. Que los dos DC existen lo miras tu: no hay API de canvas."; }

p11(){ cab 11 "INTERCOM · los CINCO pasos de «Z. FAQ», y DOS VECES (ESP y ENG)" \
  "INTERCOM s1hap599 · Custom Bot «Mobility Bot (OnClick)» · 68617004 · rama Z. FAQ" "5 pasos x 2 cadenas" \
  "en Draft. NO publicar hasta el paso 12"
printf '  %sZ1%s %sMessage%s          el mensaje de entrada %sCON EL DISCLAIMER%s %s(copiar z1-es / z1-en)%s\n' "$B" "$N" "$D" "$N" "$R" "$N" "$D" "$N"
printf '     %s31/08 · Z1 NO ES UN PASO NUEVO en la cadena espanola:%s %sese Message YA EXISTE y dice%s\n' "$V" "$N" "$D" "$N"
printf '     %s«Aqui IRA AL FAQ». Se REESCRIBE. Asi que son 4 pasos nuevos + 1 reescrito por cadena,%s\n' "$D" "$N"
printf '     %sno 5 nuevos. Y por eso NO se funde el disclaimer dentro del Collect data de Z2:%s\n' "$D" "$N"
printf '     %sfundirlo no ahorra un paso, BORRA uno que ya esta puesto.%s\n' "$D" "$N"
printf '  %sZ2%s %sCollect data Text%s la pregunta %s(copiar z2-es / z2-en)%s\n' "$B" "$N" "$D" "$N" "$D" "$N"
printf '  %sZ3%s %sData Connector%s   beckham_faq_es / _en, %scon wait_for_callback%s, los 3 chips\n' "$B" "$N" "$D" "$N" "$V" "$N"
printf '  %sZ4%s %sReply%s            %s{{mensajeUsuario}}%s   %s<-- EL PASO QUE NADIE CONTABA%s\n' "$B" "$N" "$D" "$N" "$V" "$N" "$R" "$N"
printf '  %sZ5%s %sReply buttons%s    [Quiero empezar mi solicitud] [Hablar con una persona] [Volver al menu]\n' "$B" "$N" "$D" "$N"
printf '\n%sZ4 NO ES OPCIONAL:%s %sel callback REANUDA el paso, NO publica el mensaje. Intercom solo lee%s\n' "$R" "$N" "$D" "$N"
printf '%sdata.mensajeUsuario y hace falta un paso Reply que lo RENDERICE. Sin el, el cliente%s\n' "$D" "$N"
printf '%spregunta, espera, y lo siguiente que ve es la botonera SIN RESPUESTA -- con la ejecucion%s\n' "$D" "$N"
printf '%sde n8n en verde y wait_for_callback_webhook_received en la traza de Intercom. Los cinco%s\n' "$D" "$N"
printf '%spasos del runbook salen verdes mientras el cliente no ha leido una palabra. El bot de hoy%s\n' "$D" "$N"
printf '%ssolo habla porque ese paso existe en el reusable del intake.%s\n' "$D" "$N"
printf '%sNINGUN paso del FAQ cierra la conversacion.%s %sClose conversation sigue solo en D y en N.%s\n' "$A" "$N" "$D" "$N"
printf '%sZ5 termina con «Pulsa uno de los botones»%s %s(R4: los botones no impiden el composer, y el%s\n' "$D" "$N" "$D" "$N"
printf '%scliente acaba de ser entrenado a escribir por el Collect data).%s\n' "$D" "$N"
printf '%sLa rama inglesa se llama «AI. FAQ ENGLISH»%s %s(medido con capturas el 31/08; NO es el path%s\n' "$V" "$N" "$D" "$N"
printf '%sAA que suponia la auditoria del 27/08). El hueco existe: no hay que crearlo.%s\n' "$D" "$N"
printf '%sMETODO OBLIGATORIO:%s %spunto por punto en las DOS cadenas, ninguna casilla marcada hasta%s\n' "$R" "$N" "$D" "$N"
printf '%sque las dos lo esten. La firma de este fallo es siempre la misma -- funciona en espanol,%s\n' "$D" "$N"
printf '%sfalla en ingles -- y el proyecto ya la ha pagado DOS veces.%s\n' "$D" "$N"
printf '%sCero atributos nuevos y cero pasos Set.%s %sNi faq_turnos_bot, ni idioma_bot, ni modo_bot.%s\n' "$V" "$N" "$D" "$N"
cop z1-es; cop z2-es; cop z4; cop z5-es; cop z1-en; cop z2-en; cop z5-en
ver "el mapa de la rama, leido a mano en las dos cadenas. No hay export, ni diff, ni grep (R7)."; }

p12(){ cab 12 "PUBLICAR el canvas, y las cuatro pruebas de despues" \
  "INTERCOM · Custom Bot «Mobility Bot (OnClick)» · 68617004" "(el canvas entero)" "Publish"
printf '%sES EL UNICO PASO QUE ROMPE PRODUCCION SI SALE MAL.%s %sLos pasos 2 a 8 son ADITIVOS: siete%s\n' "$R" "$N" "$D" "$N"
printf '%snodos nuevos que nadie invoca hasta que exista el conector del otro lado, y beckham_bot%s\n' "$D" "$N"
printf '%ssigue sirviendo el intake sin enterarse.%s %sSu vuelta atras es el duplicado del paso 0.%s\n' "$D" "$N" "$A" "$N"
printf '\n%sP2%s UNA conversacion real desde el Messenger %sEN INCOGNITO%s, por cadena.\n' "$B" "$N" "$R" "$N"
printf '   %sEl Messenger REANUDA el hilo abierto: sin incognito no se prueba desde cero.%s\n' "$D" "$N"
printf '   %sQue tiene que salir: la respuesta SE VE, el hilo NO se cierra, el idioma es el de la%s\n' "$D" "$N"
printf '   %srama. Y el cronometro: wait_for_callback_started -> _received.%s\n' "$D" "$N"
printf '%sP5%s no-regresion del intake: una conversacion completa escribe su fila, y\n' "$B" "$N"
printf '   %sPreparar_Prompt sigue con %s10.945%s%s caracteres y Validar y Normalizar con %s76.156%s.\n' "$D" "$V" "$N" "$D" "$V" "$N"
printf '%sP7%s T-COMPOSER y T-BOTONES: que hace Intercom con el texto tecleado en un paso de\n' "$B" "$N"
printf '   %sbotones, y cuantos reply buttons caben de verdad. Se anota lo que pase.%s\n' "$D" "$N"
printf '   %s31/08 · Y AHORA MIDE UNA COSA MAS (R10):%s %sel workflow de turnos 2..n que ya%s\n' "$R" "$N" "$D" "$N"
printf '   %sexiste va con trigger «customer sends any message». Si el cliente TECLEA en Z5,%s\n' "$D" "$N"
printf '   %sese mensaje puede disparar el workflow de turnos -> DC 461046 -> Webhook1 -> el%s\n' "$D" "$N"
printf '   %sagente CON LAS TRES TOOLS, mientras el canvas del FAQ sigue esperando su callback.%s\n' "$D" "$N"
printf '   %sLA MEDICION ES BARATA:%s %scontar ejecuciones de Webhook1 en la ventana del T-COMPOSER.%s\n' "$B" "$N" "$D" "$N"
printf '   %sSi sale >= 1, R1 deja de ser diferido y hay que decidir ANTES de publicar.%s\n' "$A" "$N"
printf '%sP8%s T-TURNO2: abre o cierra la etapa 2 entera. Media hora.\n' "$B" "$N"
ver "las cuatro se anotan en .spartax/log.md el mismo dia. El cronometro de P2 es el dato que falta (R6)."; }

orden(){ printf '\n%s%s━━━ EL ORDEN, Y QUE DESATASCA QUE ━━━%s\n' "$B" "$C" "$N"
printf '  %s0%s mirar y duplicar        %s-> lo bloquea TODO, y el duplicado es LA reversibilidad%s\n' "$V" "$N" "$D" "$N"
printf '  %s1%s la puerta del repo      %s-> bloquea el 3%s\n' "$V" "$N" "$D" "$N"
printf '  %s2-8%s los 7 nodos de n8n    %s-> ADITIVOS. Reversible: se borran los 7%s\n' "$V" "$N" "$D" "$N"
printf '      %s31/08 11:55: los pasos 2,3,4 CUMPLIDOS. Quedan 5 (rellenar), 6 y 7 (crear), 8%s\n' "$D" "$N"
printf '      %s(rellenar). Y MEDIDO: el sidecar a medias es INERTE -- un POST al webhook muere en%s\n' "$D" "$N"
printf '      %sun nodo disabled, sale VERDE, no publica, no escribe y no gasta un token.%s\n' "$D" "$N"
printf '  %s9%s P4 y P1                 %s-> bloquean el 10; miden ANTES de que haya clientes detras%s\n' "$V" "$N" "$D" "$N"
printf '  %s10-11%s los DC y el canvas   %s-> en Draft, todavia reversible%s\n' "$V" "$N" "$D" "$N"
printf '  %s12%s PUBLICAR               %s-> %sEL UNICO IRREVERSIBLE%s\n' "$R" "$N" "$D" "$R" "$N"
printf '\n%sLo que NO se toca en esta tanda:%s %sPreparar_Prompt (11 KB), Validar y Normalizar (76 KB),%s\n' "$B" "$N" "$D" "$N"
printf '%sIf2, Wait2, Formatear_conversacion1, Leer_Expediente_Para_Prompt, el DC 461046 y el%s\n' "$D" "$N"
printf '%sreusable. CERO modificaciones en los 48 nodos de logica que ya existen.%s\n' "$D" "$N"
printf '%sY beckham_bot NO se toca por MCP:%s %sreenvia los 60 nodos y BORRA las credenciales de%s\n' "$R" "$N" "$D" "$N"
printf '%stodos. Si al terminar su versionId ha cambiado por otra cosa que estos 7 nodos, es un%s\n' "$D" "$N"
printf '%sFALLO GRAVE.%s\n' "$R" "$N"
printf '\n%sun paso suelto:%s bash docs/pasos-faq.sh 6   %s·  un valor al portapapeles:%s bash docs/pasos-faq.sh c ag-text\n' "$D" "$N" "$D" "$N"; }

case "${1:-}" in
  c|copiar) copiar "${2:-}" ;;
  0)  p0 ;;  1) p1 ;;  2) p2 ;;  3) p3 ;;  4) p4 ;;  5) p5 ;;  6) p6 ;;
  7)  p7 ;;  8) p8 ;;  9) p9 ;;  10) p10 ;; 11) p11 ;; 12) p12 ;;
  ''|todos) for i in 0 1 2 3 4 5 6 7 8 9 10 11 12; do "p$i"; done; orden ;;
  orden) orden ;;
  *) printf 'uso: bash docs/pasos-faq.sh [0-12|c <clave>|orden]\n' >&2
     printf 'paso desconocido: %s\n' "$1" >&2
     exit 1 ;;
esac
