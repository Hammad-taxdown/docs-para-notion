#!/usr/bin/env bash
# pasos-arreglos.sh · 31/08/2026 · TODO lo que hay que arreglar en n8n
#   bash docs/pasos-arreglos.sh        todos
#   bash docs/pasos-arreglos.sh 3      uno suelto
#   bash docs/pasos-arreglos.sh c 2    copia el valor del paso 2 al portapapeles
cd "$(dirname "$0")/.." || exit 1
N=$'\033[0m'; B=$'\033[1m'; D=$'\033[2m'; R=$'\033[31m'; V=$'\033[32m'; A=$'\033[33m'; C=$'\033[36m'

cab(){ printf '\n%s%s━━━ PASO %s ━━━%s %s%s%s\n' "$B" "$C" "$1" "$N" "$B" "$2" "$N"
  printf '%swf:%s     %s\n' "$D" "$N" "$3"
  printf '%slink:%s   %s\n' "$D" "$N" "$4"
  printf '%snodo:%s   %s%s%s\n' "$D" "$N" "$V" "$5" "$N"
  printf '%scampo:%s  %s\n' "$D" "$N" "$6"; }

V_CALLBACK='https://api.intercom.io/hooks/workflows/trigger_step/{{ $('"'"'Webhook1'"'"').first().json.body.callback_token }}/{{ $('"'"'Webhook1'"'"').first().json.body.conversation_id }}'
V_CERRAR='{"message_type":"close","type":"admin","admin_id":"PON_AQUI_EL_ADMIN_ID_DE_PROD"}'
V_TEAM='6628493'

p1(){ cab 1 "LA CREDENCIAL DE INTERCOM · un solo sitio para los dos nodos que la usan" \
  "(ninguno · es global de n8n)" "https://es.synapse.rentax.es/home/credentials" \
  "la credencial de Intercom" "Access Token"
echo "${D}menu de tu usuario (arriba a la derecha) -> ${N}${B}Credentials${N}${D} -> busca la de Intercom${N}"
echo "${D}-> pega el Access Token de PRODUCCION -> Save.${N}"
echo "${A}el token sale de:${N} ${D}Intercom -> Settings -> Developer Hub -> tu app -> Authentication${N}"
echo "${A}OJO:${N} ${D}esto SOLO arregla 2 nodos de los 67: ${N}Traer_Conversacion_intercom1${D} y ${N}Cerrar_Conversacion${D}.${N}"
echo "${D}Los 4 callbacks NO llevan credencial: su token va DENTRO de la URL (pasos 2 y 6).${N}"
echo "${R}Y ojo al orden:${N} ${D}en cuanto cambies esto, Cerrar_Conversacion empieza a fallar${N}"
echo "${D}contra la API hasta que hagas el paso 3 -- y falla EN SILENCIO.${N}"; }

p2(){ cab 2 "EL CALLBACK DEL BOT · sin esto el bot NO PUEDE HABLAR en produccion" \
  "beckham_bot" "https://es.synapse.rentax.es/workflow/nhOwpiGxikeU5DLR" \
  "Callback_Intercom" "URL (texto con expresion)"
echo "${R}HOY DICE:${N} ${D}...trigger_step/${N}${R}q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015${N}${D}/...${N}"
echo "${D}Ese ${N}${R}q3bhdtoi_${N}${D} es el app id del workspace VIEJO. Es la UNICA via por la que el bot${N}"
echo "${D}publica su respuesta en la rama principal.${N}"
echo "${B}TIENE QUE DECIR:${N}"
echo "  ${V}${V_CALLBACK}${N}"
echo "${A}POR QUE ASI Y NO CON EL TOKEN NUEVO PEGADO:${N} ${D}asi el token viaja en el body y el${N}"
echo "${D}workflow sirve en CUALQUIER workspace. Es lo que ya hace tu FAQ, y por eso el FAQ${N}"
echo "${D}no tiene este problema.${N}"
echo "${R}HACE FALTA ADEMAS, en Intercom:${N} ${D}anadir al Body del Data Connector del canvas${N}"
echo "${D}la clave ${N}${V}\"callback_token\"${N}${D} con el token de ESE paso. Sin eso, la expresion${N}"
echo "${D}de arriba llega vacia.${N}"
echo "${B}copiar:${N} bash docs/pasos-arreglos.sh c 2"; }

p3(){ cab 3 "EL ADMIN QUE CIERRA · hoy la conversacion NO SE CIERRA NUNCA, y en silencio" \
  "beckham_bot" "https://es.synapse.rentax.es/workflow/nhOwpiGxikeU5DLR" \
  "Cerrar_Conversacion" "JSON (el jsonBody)"
echo "${V}*** 31/08 · ESTE PASO SE CAE: NO HAY QUE TOCAR NADA. ***${N}"
echo "${D}Medido por MCP de Intercom: el admin ${N}${V}4418209${N}${D} es ${N}${V}operator+s1hap599@intercom.io${N}${D},${N}"
echo "${D}o sea el operator de ${N}${B}PRODUCCION${N}${D}, no de TEST. Aparece cerrando ${N}${B}108 conversaciones${N}"
echo "${D}reales (last_closed_by_id), aplicando el tag jarry_ignore y como autor del mensaje${N}"
echo "${D}de bienvenida. El jsonBody de este nodo ${N}${V}YA ES CORRECTO${N}${D}.${N}"
echo "${D}--- lo que decia antes, conservado: ---${N}"
echo "${D}{\"message_type\":\"close\",\"type\":\"admin\",\"admin_id\":\"4418209\"}${N}"
echo "${D}Ese admin es del workspace de TEST. Intercom RECHAZA un admin que no es del workspace${N}"
echo "${D}autenticado -- y el nodo tiene ${N}${R}onError: continueRegularOutput${N}${D}, o sea que se traga el${N}"
echo "${D}error: no hay ejecucion roja, no salta alerta, y la conversacion se queda ABIERTA.${N}"
echo "${D}Efecto de rebote: el Messenger reanuda el hilo abierto, que es lo que rompio el D0 del idioma.${N}"
echo "${B}TIENE QUE DECIR${N} ${D}(cambiando el numero por el admin de produccion):${N}"
echo "  ${V}${V_CERRAR}${N}"
echo "${A}el admin_id sale de:${N} ${D}Intercom -> Settings -> Workspace -> Teammates -> abres el${N}"
echo "${D}teammate (el bot, la app, o quien quieras que figure cerrando) y ${N}${B}el id esta en la URL${N}${D}.${N}"
echo "${D}O de golpe todos, con el token de prod:${N}"
echo "  ${D}curl -s https://api.intercom.io/admins -H \"Authorization: Bearer TU_TOKEN\" \\${N}"
echo "  ${D}  -H \"Intercom-Version: 2.11\" | python3 -m json.tool | grep -E '\"id\"|\"name\"'${N}"
echo "${R}NO es el 6628493:${N} ${D}ese es un TEAM y va en el paso 5. Aqui hace falta un ADMIN.${N}"
echo "${B}copiar:${N} bash docs/pasos-arreglos.sh c 3"; }

p4(){ cab 4 "EL ENLACE DE LAS ALERTAS · hoy TODAS llevan al workspace viejo" \
  "beckham_alertas" "https://es.synapse.rentax.es/workflow/BJfExmwu1fI1aPpY" \
  "Slack_Aviso" "Message Text (es una EXPRESION, no texto plano)"
echo "${D}Dentro del texto hay esta URL:${N}"
echo "  ${R}https://app.intercom.com/a/apps/q3bhdtoi/conversations/${N}"
echo "${B}cambia SOLO esa palabra:${N}  ${R}q3bhdtoi${N}  ${D}->${N}  ${V}s1hap599${N}"
echo "${D}Los cinco Avisar_* de beckham_bot pasan conversation_id, asi que ese enlace sale en${N}"
echo "${D}TODA alerta de negocio. Quien la recibe hoy no encuentra la conversacion.${N}"; }

p5(){ cab 5 "EL TEAM Y EL ADMIN DE LA ESCALADA" \
  "BECKHAM_escalar_humano" "https://es.synapse.rentax.es/workflow/m8GmgA2ot05foDBd" \
  "Team de Ops (VALOR A CONFIRMAR)" "dos variables del nodo Set, las dos de TEXTO"
echo "  ${B}team_id_ops${N}   ${D}hoy: ${N}${R}vacio${N}   ${D}->${N}  ${V}${V_TEAM}${N}"
echo "  ${B}admin_id_bot${N}  ${D}hoy: ${N}${V}4418209${N}  ${D}->${N}  ${V}NO SE TOCA: es el operator de PRODUCCION${N}"
echo "${A}NO TOQUES ESTO:${N} ${D}en el nodo ${N}Guarda de la escalada${D} hay un${N}"
echo "  ${D}const TEAM_DE_OTRO_WORKSPACE = '11098265'${N}"
echo "${D}Eso es una ${N}${B}LISTA NEGRA${N}${D}, no un resto. Cambiarlo por el 6628493 DESACTIVA la guarda${N}"
echo "${D}que impide escalar al team equivocado.${N}"
echo "${B}copiar el team:${N} bash docs/pasos-arreglos.sh c 5"; }

p6(){ cab 6 "LIMPIAR EL SIDECAR DEL FAQ · hay CUATRO callbacks y DOS fallbacks" \
  "beckham_bot" "https://es.synapse.rentax.es/workflow/nhOwpiGxikeU5DLR" \
  "Callback_Intercom_FAQ1 · FAQ2 · FAQ3 · Mensaje_Fallback_FAQ1" "borrar los cuatro"
echo "${R}COMO ESTA HOY${N} ${D}(cada rama con su callback propio):${N}"
echo "  ${D}¿Cortar_FAQ? [true]     -> Callback_Intercom_FAQ${N}"
echo "  ${D}AI AGENT FAQ [ok]       -> Callback_Intercom_FAQ${N}${R}1${N}"
echo "  ${D}Mensaje_Fallback_FAQ${N}${R}1${N}${D}   -> Callback_Intercom_FAQ${N}${R}2${N}"
echo "  ${D}Mensaje_Fallback_FAQ    -> Callback_Intercom_FAQ${N}${R}3${N}"
echo "${R}POR QUE IMPORTA:${N} ${D}el paso 2 cambia la URL del callback. Con cuatro copias son${N}"
echo "${D}CUATRO sitios, y el que olvides deja ESA rama muda sin que nada falle.${N}"
echo "${B}BORRA:${N} ${R}Callback_Intercom_FAQ1${N}, ${R}FAQ2${N}, ${R}FAQ3${N} ${D}y${N} ${R}Mensaje_Fallback_FAQ1${N}"
echo "${B}Y DEJA LAS ARISTAS ASI:${N}"
echo "  ${V}AI AGENT FAQ${N} ${D}-- salida normal --> ${N}${V}Callback_Intercom_FAQ${N}"
echo "  ${V}AI AGENT FAQ${N} ${D}-- salida error  --> ${N}${V}Mensaje_Fallback_FAQ${N}"
echo "  ${V}Mensaje_Fallback_FAQ${N} ${D}-------------> ${N}${V}Callback_Intercom_FAQ${N}"
echo "${D}Al acabar: ${N}Callback_Intercom_FAQ${D} con ${N}${B}3 entradas${N}${D} y ${N}Mensaje_Fallback_FAQ${D} con ${N}${B}2${N}${D}.${N}"
echo "${B}Y EN Callback_Intercom_FAQ -> Settings:${N}"
echo "  ${V}Retry On Fail${N} ${D}= ON${N}     ${V}On Error${N} ${D}= Continue (using error output)${N}"
echo "${D}Sin eso, si Intercom rechaza el callback la ejecucion muere y NADIE se entera de que${N}"
echo "${D}el cliente se quedo sin respuesta.${N}"; }

p7(){ cab 7 "TRES NODOS DE AIRTABLE CON EL STATUS RANCIO · menor, pero es el sexto sitio" \
  "beckham_generar_030 y beckham_informe_mobility" \
  "https://es.synapse.rentax.es/workflow/OoJ2l7PmxSHLxXA4 (y .../Us5sFgXD9qVxJvxO)" \
  "Limpiar Regenerar030 y Error030 · Escribir el motivo en Error030 · Escribir el motivo en ErrorInforme" \
  "columns.schema del Status (la lista cacheada)"
echo "${D}Los tres tienen las ${N}${R}12 opciones VIEJAS${N}${D} del singleSelect Status cacheadas${N}"
echo "${D}('3. Pte hacer informe', '4. Informe enviado'...). Hoy es inofensivo porque los valores${N}"
echo "${D}que escriben existen en las dos listas, pero un nodo de Airtable valida contra SU COPIA${N}"
echo "${D}antes de llamar a la API.${N}"
echo "${B}se arregla:${N} ${D}abrir el nodo y ${N}${V}refrescar la lista de campos${N}${D} en la UI. No se toca codigo.${N}"
echo "${A}al refrescar, cuenta:${N} ${D}tienen que quedar las ${N}${B}13 opciones${N}${D} nuevas.${N}"; }

p8(){ cab 8 "LO QUE HAY QUE COMPROBAR EN INTERCOM, NO EN N8N" \
  "(ninguno)" "https://app.intercom.com/a/apps/s1hap599/settings/data/conversation-data" \
  "los atributos de conversacion" "solo mirar que existen"
echo "${V}*** 31/08 · COMPROBADO POR MCP Y SALE BIEN: LOS CUATRO EXISTEN EN PRODUCCION. ***${N}"
echo "${D}Leidos de conversaciones reales de s1hap599: veredicto_f2=\"en_plazo\",${N}"
echo "${D}fecha_limite_f2=\"01/10/2026\", dias_pasados_f2=\"0\", fecha_alta_ss_f2=\"2026-04-01\".${N}"
echo "${D}${N}${V}NO HAY NADA QUE CREAR.${N}${D} Este paso queda cerrado.${N}"
echo "${D}--- los cuatro, para referencia: ---${N}"
echo "  ${V}veredicto_f2${N}   ${V}fecha_limite_f2${N}   ${V}dias_pasados_f2${N}   ${V}fecha_alta_ss_f2${N}"
echo "${R}El cuarto se me paso al darte la lista el 31/08.${N} ${D}De el sale la fecha de alta hacia${N}"
echo "${D}el expediente: ${N}guardar_datos_cliente${D} manda fecha_alta_ss desde${N}"
echo "${D}custom_attributes?.${N}${V}fecha_alta_ss_f2${N}${D} || ''.${N}"
echo "${R}Si falta:${N} ${D}se manda cadena vacia, el upsert devuelve ok:true SIN el dato, y el informe${N}"
echo "${D}imprime «Por confirmar» en la fecha de alta ${N}${R}para siempre y sin ruido${N}${D}.${N}"
echo "${D}Y ${N}Preparar_Prompt${D} (lineas 125-127) lee los otros tres: si no existen, el bloque${N}"
echo "${D}«DATOS QUE YA CONOCEMOS» pierde el veredicto y la fecha limite ${N}${B}sin fallar${N}${D} -- y el bot${N}"
echo "${D}vuelve a preguntar lo que el cliente ya conto.${N}"; }

pf(){ printf '\n%s%s━━━ EL ORDEN, Y POR QUE ━━━%s\n' "$B" "$C" "$N"
echo "  ${B}8${N} ${D}primero: es solo mirar, y si falta un atributo lo demas no arregla nada.${N}"
echo "  ${B}3 y 2${N} ${D}despues: hay que BUSCAR dos datos (el admin_id y el token del callback).${N}"
echo "  ${B}1${N} ${D}la credencial. Ojo: en cuanto la cambies, el paso 3 empieza a fallar en silencio.${N}"
echo "  ${B}2${N} ${D}el callback. Hasta que este, ${N}${R}el bot no puede hablar${N}${D} por la rama principal.${N}"
echo "  ${B}6${N} ${D}limpiar el FAQ. Hazlo ANTES del 2, o el 2 son cuatro sitios en vez de uno.${N}"
echo "  ${B}5, 4 y 7${N} ${D}al final: no bloquean nada.${N}"
printf '\n%sLO QUE NECESITO DE TI:%s el %sadmin_id%s del bot en prod y el %stoken del callback%s del canvas.\n' "$A" "$N" "$B" "$N" "$B" "$N"
printf '%sun paso suelto:%s bash docs/pasos-arreglos.sh 2   ·   %scopiar su valor:%s bash docs/pasos-arreglos.sh c 2\n' "$D" "$N" "$D" "$N"; }

case "${1:-}" in
  c) case "${2:-}" in
       2) printf '%s' "$V_CALLBACK" | pbcopy; echo "copiada la URL del callback ($(printf '%s' "$V_CALLBACK" | wc -c | tr -d ' ') car)" ;;
       3) printf '%s' "$V_CERRAR" | pbcopy; echo "copiado el jsonBody de Cerrar_Conversacion · CAMBIA el PON_AQUI por el admin_id real" ;;
       5) printf '%s' "$V_TEAM" | pbcopy; echo "copiado el team de Ops: $V_TEAM" ;;
       *) echo "hay valor que copiar en los pasos: 2, 3, 5"; exit 1 ;;
     esac ;;
  ''|todos) for i in 1 2 3 4 5 6 7 8; do "p$i"; done; pf ;;
  [1-8]) "p$1" ;;
  *) echo "uso: bash docs/pasos-arreglos.sh [1-8|c 2|c 3|c 5]"; exit 1 ;;
esac
