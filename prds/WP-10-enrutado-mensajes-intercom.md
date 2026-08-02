---
id: WP-10
title: "Saneamiento del enrutado de mensajes en Intercom: tickets y distribuidor"
status: specified
size: M
depends_on: []
milestone: "Fase 3 — Agente IA"
owner: "Hammad"
external: "Adri / Fer (dueños del distribuidor y del ticket type)"
critical: true
issue: ""
---

# PRD · WP-10 — Saneamiento del enrutado de mensajes en Intercom

> **Specified (2026-07-28).** Creado al descubrir que el agente conversacional (WP-09) funciona pero **solo puede tener un turno**: cuando el usuario responde, su mensaje no llega a n8n. La causa no está en nuestro código sino en la configuración del workspace.

## 1. Objective

Conseguir que **cada mensaje que escribe el usuario llegue al agente conversacional**, y que ninguna pieza ajena convierta la conversación en ticket ni le mande correos de soporte.

## 2. El problema, con evidencia

Verificado el 28/07 sobre la conversación real `215475262949230`:

```
17:43:35  custom_action_started    beckham_plazo_f2
17:43:38  veredicto_f2 / dias_pasados_f2 / fecha_limite_f2 escritos · success
17:43:39  custom_action_started    n8n_bot_mobility        → success
17:43:41  wait_for_callback_started        (Custom Bot "n8n_BOT_mobility")
17:43:46  wait_for_callback_webhook_received
17:43:46  el agente publica su mensaje                     ✅ turno 1 OK
17:43:47  assignment → team 11098265
17:43:59  el usuario responde: "Hammad Bellachhab"
17:44:02  ticket_state_updated_by_admin                    ⛔ y aquí acaba todo
```

Después del mensaje del usuario **no hay nada**: ni `custom_action_started`, ni `wait_for_callback_*`, ni un solo `operator_workflow_event` con nombre. En n8n, **cero ejecuciones nuevas**. `app_package_code` es `null` en las 26 partes, así que ninguna app externa firma.

### Causa raíz

**La conversación es un `Customer ticket` (tipo `Prueba Fer`) desde el momento en que nace**, y sobre un ticket **no se disparan los triggers de tipo "customer sends any message"**. Por eso:

- `reuse_mobility` marca `Sent: 0` — nunca le llega el turno.
- Pausar el workflow `distribuidor - usuario envia mensaje` **no arregló nada**: el ticket ya existía antes.
- Lo que ocurre a las 17:44:02 **no es la creación del ticket**, es un cambio de estado a `Submitted`.

**Efecto secundario confirmado:** al pasar a `Submitted`, Intercom **envía un correo al cliente** ("hemos recibido tu solicitud"). En producción, un usuario a mitad de conversación con el bot recibiría un correo de soporte que nadie ha pedido, diciéndole que le contestarán por otro canal.

### Dato que acota la búsqueda

| Conversación | Hora | `ticket` |
|---|---|---|
| `215475260478265` | 19:04 | `null` — funcionó |
| `215475262531698` | 19:19 | `Prueba Fer` |
| `215475262665625` | 19:27 | `Prueba Fer` |
| `215475262949230` | 19:43 | `Prueba Fer` |

Algo cambió en el workspace entre las 19:04 y las 19:19, y no fue trabajo de este proyecto. La API pública **no expone** el nombre del causante (`ticket_state_updated_by_admin` viene sin `workflow.name`), así que hay que localizarlo en la UI.

## 3. Scope

**In:**
- Localizar y desactivar lo que convierte las conversaciones en `Customer ticket`.
- Dar de alta el bot en el workflow `distribuidor - usuario envia mensaje`, y **reactivarlo** (hoy está pausado, y pausado no reparte los mensajes de nadie en todo el workspace).
- Verificar que una conversación nueva nace con `ticket: null` y que el turno 2 del agente funciona sin intervención manual.

**Out:**
- El diseño del agente y sus herramientas — WP-09.
- La diferenciación de audiencias para producción (allí se hará con los atributos de plan ya existentes, porque el bot es solo para clientes full VIP).

## 4. Checklist de inspección, por probabilidad

| # | Dónde | Qué buscar | Acción |
|---|---|---|---|
| 1 | `Fin AI Agent → Deploy → Messenger` | Si Fin está live sobre el Messenger y si crea ticket al no poder resolver. El Messenger muestra "Powered by Fin" al pie | Desactivar para la audiencia de pruebas |
| 2 | `Settings → Tickets → Prueba Fer` | Si es tipo por defecto, customer-facing, o tiene formulario en el Messenger | Quitar customer-facing o archivar |
| 3 | `Settings → Channels → Messenger` | Si las conversaciones entrantes se crean como ticket; conversation starters que sean formularios de ticket | Desactivar |
| 4 | `Workflows` (filtro Live) | Triggers "customer sends any message" y "customer starts a conversation"; cualquier paso `Create ticket` / `Convert to ticket` | Pausar los ajenos |
| 5 | `Simple automations` | Reglas ligeras Live sobre mensajes | Pausar |
| 6 | `Settings → Inbox → Rules` | Reglas que cambien estado de ticket | Desactivar |
| 7 | `Settings → Apps` | La app `adri-app-test`, que inyecta notas "Conversación relacionada detectada" (5 en 5 segundos) | Desinstalar o desactivar |

**Método obligatorio: desactivar una cosa a la vez y probar entre medias.** Si se apagan cinco y funciona, no se sabrá cuál era — y en producción no se podrá apagar el bot de soporte general.

## 5. Criterio de verificación

1. Cerrar las conversaciones abiertas del contacto de pruebas.
2. Abrir una conversación nueva por el flujo normal y comprobar por MCP que devuelve **`"ticket": null`** y **sin** `Ticket category` ni `Created by` en `custom_attributes`.
3. Cualificar → el agente saluda → responder → **el agente vuelve a responder sin intervención manual**.
4. En n8n deben aparecer **dos** ejecuciones de `beckham_bot`, una por turno.
5. El contacto **no** recibe ningún correo de ticket.

## 6. Workaround mientras esté abierto

Lanzar el reusable `n8n_BOT_mobility` **a mano desde el Inbox** después de cada respuesta del usuario. Salta el trigger por completo y permite seguir validando el agente (WP-09) sin depender de esto.

## 7. Open questions

- ¿Qué activó la conversión a ticket entre las 19:04 y las 19:19 del 28/07? Es lo único que bloquea cerrar este WP.
- ¿Quién es el dueño del workflow `distribuidor - usuario envia mensaje` y qué condición usa para enrutar? Si se conoce, basta con cumplirla desde nuestro lado en vez de pedirle un cambio.
