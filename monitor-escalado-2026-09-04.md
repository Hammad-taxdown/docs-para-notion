# Gestionar_escalado MOB como monitor post-respuesta · 04/09/2026

**Qué es.** El workflow de Iciar `Gestionar_escalado MOB` (`iIs0vU6ngiQAiA8u`) analiza con un LLM (gpt-5.2)
la última respuesta del bot y detecta dos cosas: si hay que **escalar** a una persona (petición de agente,
enfado, bloqueo documental, caso complejo) y si el bot ha cometido una **anomalía** (dato inventado, bucle,
error lógico...). Las anomalías van a `Notificaciones_error` (`TXVWRUzc1G5HXHjZ`).

**Por qué NO es una tool del agente.** Necesita `respuesta_bot`, que no existe cuando el agente decide llamar
a una herramienta; su parser no devolvía `escalar`; no asigna a nadie; y su rama por defecto snoozeaba la
conversación 7 días. El 04/09 estuvo publicado como tool con inputs vacíos: riesgo real de dormir al cliente.

**Dónde va.** Detrás de `Responder_Intercom` en `beckham_bot_conversacional`, como segunda rama, sin esperar la
respuesta y con *On Error: Continue*: nunca frena ni rompe el turno. La tool `transferir_humano` la usa el agente
cuando el cliente lo pide o se enfada; el monitor pilla lo que al agente se le escape.

## Cambios en `Gestionar_escalado MOB`
1. Trigger `When Executed by Another Workflow`: añadir el input `user_id` (los otros cuatro se quedan).
2. `Structured Output Parser`: Input Schema = `docs/valor-monitor-parser-schema-2026-09-04.json` (copiar.sh 25).
   Claves: `escalar`, `motivo_escalado`, `alerta`, `tipo_alerta`, `detalle_alerta`. `Call 'Notificaciones_error'`
   ya lee `tipo_alerta` y `detalle_alerta`: no se toca.
3. Nodo If nuevo `Escalar?`, colgado de `Decisor_LLM` (tercera salida, junto a If1 e If2), AND de tres:
   - Boolean · `{{ $json.output.escalar }}` · is true
   - String · `{{ $('When Executed by Another Workflow').item.json.respuesta_bot }}` · does not contain · `te paso` (ignore case)
   - String · el mismo campo · does not contain · `te transfiero` (ignore case)
4. Nodo Execute Workflow nuevo `Transferir_por_monitor` en la rama TRUE de `Escalar?`: Workflow =
   `mobility_transferir_humano`; inputs `conversation_id` y `user_id` desde el trigger, `motivo` = copiar.sh 26.
5. Desactivar (no borrar) `Snooze_7_Dias`, `Nota_Snooze`, `Wait1`, `Snooze_Intercom`. Decisión pendiente de Iciar.
6. Publish.

## Cambios en `beckham_bot_conversacional`
Nodo Execute Workflow nuevo `Monitor_escalado`, colgado de la salida de `Responder_Intercom` (segunda rama, la
primera sigue a `Leer_MotivoCierre`). Workflow = `Gestionar_escalado MOB`. Options → *Wait For Sub-Workflow
Completion* = OFF. Settings del nodo → *On Error* = Continue (regular output). Inputs (Expression, sin `=`):
- `conversation_id` = `{{ $('Webhook1').first().json.body.conversation_id }}`
- `user_id` = `{{ $('Webhook1').first().json.body.user_id }}`
- `ultimo_mensaje_usuario` = `{{ $('Formatear_conversacion1').first().json.last_message_content }}`
- `chat_history` = `{{ $('Formatear_conversacion1').first().json.chat_history }}`
- `respuesta_bot` = copiar.sh 27 (con guarda `isExecuted`: por el `Mensaje_fallback` el agente no corre).
Publish.

## Prueba
Conversación de prueba en incógnito: dos mensajes seguidos de hartazgo ("YA TE LO HE DICHO, ESTO ES UNA PÉRDIDA
DE TIEMPO"). Si el agente no transfiere por sí mismo, el monitor lo hace: la conversación queda asignada a
Ops_Mobility con la nota «Transferido por el bot de Mobility · Motivo: Detectado por el monitor: usuario_enfadado…».
