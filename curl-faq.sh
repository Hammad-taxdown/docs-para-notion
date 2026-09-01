#!/usr/bin/env bash
# curl-faq.sh · 28/08/2026 · las 33 PREGUNTAS DORADAS contra el webhook del FAQ
#
#   bash docs/curl-faq.sh          las 33
#   bash docs/curl-faq.sh 25 29    solo el rango 25..29 (las de NO CUBIERTO)
#   bash docs/curl-faq.sh 7        solo la 7
#
# QUE ES ESTO. La prueba P1 del diseno (docs/faq-diseno-2026-08-28.md §8), que es
# el gate compartido de WP-220, WP-221 y WP-222. Las preguntas salen VERBATIM de
# docs/preguntas-doradas-wp220-2026-08-17.md: no se inventan aqui y no se editan
# aqui. Si hay que cambiar una, se cambia alli.
#
# POR QUE UN CURL Y NO 15 CONVERSACIONES EN INCOGNITO. El turno del FAQ no lee
# Intercom ni Airtable: entra por `body.message` y sale por el callback. Asi que un
# POST al webhook reproduce el turno byte a byte -- el mismo prompt de LangSmith, el
# mismo modelo, el mismo `contexto`. Lo unico que NO ejercita es la publicacion en
# Intercom, y eso lo cubre P2 con UNA conversacion. Preview y Simulation mockean y
# no valen; un curl a produccion no mockea nada.
#
# ── RELLENA ESTO ANTES DE CORRER ─────────────────────────────────────────────
# El path de `Webhook_FAQ` es un UUID, no un nombre: se lee del propio nodo en n8n
# (campo Path) o de la URL de produccion que muestra el nodo.
UUID="${UUID:-PEGA-AQUI-EL-UUID-DE-Webhook_FAQ}"

# El token del callback. DOS MODOS, y la diferencia importa:
#   seco (por defecto) · token de mentira. El modelo contesta igual (el nodo solo
#     corta si el token viene VACIO), pero `Callback_Intercom_FAQ` no puede publicar:
#     Intercom responde 4xx, el nodo agota su retryOnFail y LA EJECUCION SALE ROJA.
#     31/08: `Avisar_FAQ_Sin_Publicar` NO existe -- se cayo del diseno porque
#     beckham_bot.settings.errorWorkflow = BJfExmwu1fI1aPpY ya avisa a Slack de todo
#     nodo que falla en rojo, con `*Nodo:* Callback_Intercom_FAQ` y la URL de la
#     ejecucion dentro. Asi que siguen siendo 33 avisos de Slack, uno por pregunta,
#     pero los manda Slack_Fallo y NO llevan el conversation_id (hay que abrir la
#     ejecucion). Es lo correcto para medir CONTENIDO, y hay que avisar al canal antes.
#   vivo · TOKEN y CONVERSACION reales, copiados del Data Connector y de un hilo de
#     prueba. Las 33 respuestas se publican en ese hilo y se leen en Intercom.
TOKEN="${TOKEN:-CURL-SIN-CALLBACK}"
CONVERSACION="${CONVERSACION:-}"   # vacio = un marcador por pregunta (FAQ-GOLD-NN)
IDIOMA="${IDIOMA:-es}"
BASE="${BASE:-https://es.synapse.rentax.es/webhook}"
ESPERA="${ESPERA:-2}"              # segundos entre preguntas: el turno hace 1 llamada al modelo

# Lectura de la respuesta. Desde bash NO hay N8N_API_KEY en este entorno, asi que
# por defecto el script NO puede ver lo que contesto el modelo: el webhook responde
# «Workflow was started» en milisegundos y la respuesta viaja por el callback. Si se
# exporta N8N_API_KEY (y N8N_URL), el script se trae el `output` del `AI AGENT FAQ`
# de la ejecucion y lo imprime recortado. Si no, imprime el marcador y las 33
# respuestas se leen de las ejecuciones por MCP.
N8N_URL="${N8N_URL:-https://es.synapse.rentax.es}"
WF_ID="${WF_ID:-nhOwpiGxikeU5DLR}"
RECORTE="${RECORTE:-140}"

N=$'\033[0m'; B=$'\033[1m'; D=$'\033[2m'; R=$'\033[31m'; V=$'\033[32m'; A=$'\033[33m'; C=$'\033[36m'

# ── LAS 33, VERBATIM DEL FICHERO DEL 17/08 ───────────────────────────────────
# Formato: NN|ETIQUETA|pregunta. Las etiquetas son las tres del gate:
#   RESPONDE     el prompt tiene la respuesta escrita: la da y no anade nada
#   NO-CUBIERTO  dice que no lo tiene confirmado y remite a support@taxdown.es
#   ESCALA       corta y da la via humana
PREGUNTAS=(
"01|RESPONDE|¿Cuánto dura el régimen?"
"02|RESPONDE|¿A qué tipo tributo?"
"03|RESPONDE|Si el régimen es de no residentes, ¿mi sueldo de fuera de España tributa?"
"04|RESPONDE|¿Cuánto tiempo tengo para solicitarlo?"
"05|RESPONDE|¿Cuántos años sin ser residente me piden?"
"06|RESPONDE|Soy nómada digital, ¿puedo?"
"07|RESPONDE|Soy autónomo, ¿puedo?"
"08|RESPONDE|¿Mi mujer y mis hijos pueden acogerse?"
"09|RESPONDE|Tengo un piso en España donde vivo, ¿me afecta?"
"10|RESPONDE|¿Puedo deducir lo que aporto al plan de pensiones?"
"11|RESPONDE|Estoy de baja por paternidad, ¿esa prestación tributa?"
"12|RESPONDE|Me van a indemnizar por despido, ¿tributa?"
"13|RESPONDE|¿Tengo que declarar mis cuentas de fuera?"
"14|RESPONDE|¿Puedo salirme si deja de convenirme?"
"15|RESPONDE|Voy a montarme por mi cuenta estando en el régimen, ¿qué pasa?"
"16|RESPONDE|¿Qué diferencia hay entre renuncia y exclusión?"
"17|RESPONDE|Fui residente en España hace años, ¿cómo lo pruebo?"
"18|RESPONDE|¿Qué documentos necesitáis?"
"19|RESPONDE|¿Tengo que presentar el 720 el primer año, el de llegada?"
"20|RESPONDE|Cuando salga del régimen, ¿desde cuándo vuelvo a presentarlo?"
"21|RESPONDE|Mi mujer vive aquí conmigo, ¿ella está exenta del 720?"
"22|RESPONDE|Tengo cripto en Binance, ¿tengo que declararla en el 721?"
"23|RESPONDE|Si mis criptos tributan, ¿entonces sí las declaro en el 721?"
"24|RESPONDE|¿Puedo deducirme los 1.200 € por hijo?"
"25|NO-CUBIERTO|¿Cuál es el umbral del 720, 50.000 €?"
"26|NO-CUBIERTO|Me han hecho administrador con el 80 % de la sociedad, ¿qué pasa?"
"27|NO-CUBIERTO|Tengo RSU que se devengaron antes de venir, ¿cómo tributan?"
"28|NO-CUBIERTO|¿Cuánto voy a pagar exactamente el año que viene con mi sueldo?"
"29|NO-CUBIERTO|Si me sanciona Hacienda por presentar el 149 tarde, ¿cuánto es?"
"30|ESCALA|Quiero hablar con una persona"
"31|ESCALA|Es la tercera vez que te pregunto lo mismo y no me estás contestando. ¿Me lo vas a responder o no?"
"32|ESCALA|¿Cuánto cuesta el trámite? ¿Qué plan tengo?"
"33|ESCALA|¿Y lo de mi declaración de la renta del año pasado?"
)

# LA 31 NO CIERRA POR CURL, y hay que decirlo antes de que alguien la marque verde.
# En el fichero del 17/08 la 31 es una SITUACION («tercera vez que pide lo mismo,
# con tono cabreado»), no una pregunta: lo que se mide alli es el NIVEL 2 del
# escalado, que depende de tres turnos acumulados. El sidecar de etapa 1 es UN
# turno, asi que este curl solo mide el tono; el escalado por insistencia se mide en
# P2, en conversacion.
AVISO_31="la 31 es una SITUACION de tres turnos: por curl solo se mide el tono, no el nivel 2 del escalado"

json_body() {
  python3 - "$1" "$2" "$3" "$4" <<'PY'
import json, sys
print(json.dumps({
    "conversation_id": sys.argv[1],
    "user_id": "",
    "message": sys.argv[2],
    "idioma": sys.argv[3],
    "callback_token": sys.argv[4],
    "punto": "faq_entrada",
}, ensure_ascii=False))
PY
}

# Se trae el `output` del AI AGENT FAQ de la ultima ejecucion del workflow. Solo si
# hay N8N_API_KEY: si no la hay, se dice y se sigue, en vez de imprimir un vacio que
# parece una respuesta corta.
respuesta_de_n8n() {
  [ -z "${N8N_API_KEY:-}" ] && { printf '(respuesta por MCP)'; return; }
  local ej
  ej=$(curl -sS -H "X-N8N-API-KEY: $N8N_API_KEY" \
        "$N8N_URL/api/v1/executions?workflowId=$WF_ID&limit=1&includeData=true" 2>/dev/null)
  printf '%s' "$ej" | python3 - "$RECORTE" <<'PY'
import json, sys
try:
    d = json.load(sys.stdin)
    ej = (d.get("data") or [{}])[0]
    run = (((ej.get("data") or {}).get("resultData") or {}).get("runData") or {})
    txt = ""
    for nodo in ("AI AGENT FAQ", "Mensaje_Fallback_FAQ", "Preparar_Prompt_FAQ"):
        if nodo in run:
            j = run[nodo][0]["data"]["main"][0][0]["json"]
            txt = j.get("output") or j.get("text") or ""
            if txt:
                break
    txt = " ".join(str(txt).split())
    n = int(sys.argv[1])
    sys.stdout.write(txt[:n] + ("…" if len(txt) > n else "") if txt else "(sin output en la ejecucion)")
except Exception as e:
    sys.stdout.write("(no se pudo leer la ejecucion: %s)" % e)
PY
}

desde="${1:-1}"; hasta="${2:-${1:-33}}"
[ -z "${1:-}" ] && { desde=1; hasta=33; }

case "$UUID" in
  PEGA-AQUI-*) printf '%s\n' "${R}Falta el UUID de Webhook_FAQ.${N}"
    printf '%s\n' "${D}  UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx bash docs/curl-faq.sh${N}"
    printf '%s\n' "${D}  se lee en n8n · beckham_bot · nodo Webhook_FAQ · campo Path${N}"; exit 1 ;;
esac

URL="$BASE/$UUID"
printf '\n%s%s━━━ LAS 33 PREGUNTAS DORADAS · P1 ━━━%s\n' "$B" "$C" "$N"
printf '%swebhook:%s %s\n' "$D" "$N" "$URL"
if [ "$TOKEN" = "CURL-SIN-CALLBACK" ]; then
  printf '%smodo:%s    %sSECO%s %s(token de mentira: el modelo contesta, el callback NO publica%s\n' "$D" "$N" "$A" "$N" "$D" "$N"
  printf '%s          y salta un aviso de Slack por pregunta. Avisa al canal.)%s\n' "$D" "$N"
else
  printf '%smodo:%s    %sVIVO%s %s(token real: las respuestas se publican en Intercom)%s\n' "$D" "$N" "$V" "$N" "$D" "$N"
fi
printf '%srango:%s   %s..%s   %sidioma:%s %s\n' "$D" "$N" "$desde" "$hasta" "$D" "$N" "$IDIOMA"
[ -z "${N8N_API_KEY:-}" ] && printf '%s%s%s\n' "$D" "sin N8N_API_KEY: se imprime el marcador y las respuestas se leen por MCP" "$N"
printf '\n'

hechas=0; fallos=0
for fila in "${PREGUNTAS[@]}"; do
  nn="${fila%%|*}"; resto="${fila#*|}"; etiqueta="${resto%%|*}"; pregunta="${resto#*|}"
  n10=$((10#$nn))
  [ "$n10" -lt "$desde" ] && continue
  [ "$n10" -gt "$hasta" ] && continue

  conv="${CONVERSACION:-FAQ-GOLD-$nn}"
  cuerpo=$(json_body "$conv" "$pregunta" "$IDIOMA" "$TOKEN")
  http=$(printf '%s' "$cuerpo" | curl -sS -o /dev/null -w '%{http_code}' \
          -X POST -H 'Content-Type: application/json' --data-binary @- "$URL" 2>/dev/null)

  if [ "$http" = "200" ]; then marca="${V}$http${N}"; else marca="${R}$http${N}"; fallos=$((fallos+1)); fi
  sleep "$ESPERA"
  printf '%s%s%s %s%-11s%s %s%s%s\n' "$B" "$nn" "$N" "$C" "$etiqueta" "$N" "$D" "${pregunta:0:78}" "$N"
  printf '    http %b  %s%s%s\n' "$marca" "$A" "$(respuesta_de_n8n)" "$N"
  [ "$nn" = "31" ] && printf '    %s%s%s\n' "$D" "$AVISO_31" "$N"
  hechas=$((hechas+1))
done

printf '\n%s%s enviadas · %s con http != 200%s\n' "$B" "$hechas" "$fallos" "$N"
printf '%sEl gate NO lo cierra este script:%s lo cierra leer las %s respuestas y comprobar\n' "$B" "$N" "$hechas"
printf 'que cada una cae en SU etiqueta, con %sCERO afirmaciones normativas fuera del prompt%s.\n' "$R" "$N"
printf '%sUna respuesta correcta con una afirmacion inventada de propina SUSPENDE.%s\n' "$D" "$N"
[ "$fallos" -gt 0 ] && exit 1
exit 0
