# El pivote conversacional · 31/08/2026

> **Estado: CONSTRUIDO, SIN CABLEAR.** El workflow existe (`beckham_bot_conversacional`,
> `n1jx7z9NtXWCD4VC`), inactivo, en el proyecto personal, con los cuatro nodos de código puestos como
> `throw` a propósito. Producción (`beckham_bot`, `nhOwpiGxikeU5DLR`) **no se ha tocado**: sigue
> activa con el canvas de Intercom delante.
>
> Este documento es la pieza que faltaba: el pivote tenía código, prompt y puertas, y **ni un
> documento de diseño**. Los stickies del workflow tienen el detalle nodo a nodo; aquí está el porqué,
> lo que se pierde y lo que hay que decidir.

---

## 1 · Qué cambia, en una frase

**La lógica sale de Intercom.** Antes el Custom Bot `OnClick Mobility` hacía los filtros con botones
cerrados y llamaba al agente solo para el intake. Ahora **un único agente de n8n** se presenta,
contesta preguntas sin límite, hace los tres filtros en conversación y sigue con el expediente.

De Intercom se queda **una sola cosa: el transporte.** Ver §4, que es lo que hay que decidir.

---

## 2 · El diff real, medido nodo a nodo el 31/08

`beckham_bot` tiene **56 nodos de lógica**; el nuevo, **49**. La diferencia no es recorte de
funcionalidad, es exactamente esto:

| Se van (9) | Por qué |
|---|---|
| Los **8 nodos del sidecar del FAQ** (`Webhook_FAQ`, `Preparar_Prompt_FAQ`, `¿Cortar_FAQ?`, `Langsmith Prompt FAQ`, `AI AGENT FAQ`, `David Beckham1`, `Mensaje_Fallback_FAQ`, `Callback_Intercom_FAQ`) | Su única razón de ser era el **aislamiento topológico**: un agente sin tools de escritura para contestar preguntas. Con un solo agente no hay dos agentes que aislar |
| `Callback_Intercom` | Sustituido por `Responder_Intercom` (§3) |

| Entran (2) | Por qué |
|---|---|
| **`calcular_plazo`** | Era el Data Connector `beckham_plazo_f2` de Intercom. Pasa a ser la cuarta tool del agente, y se llama **en el mismo turno** en que el cliente da la fecha |
| **`Responder_Intercom`** | El canal de salida nuevo (§3) |

**Los otros 47 nodos son los mismos**, con el mismo `onError`, `retryOnFail` y `alwaysOutputData`
comprobados uno a uno. El escritor (`Validar y Normalizar`, 76.156 car.), la escalera
(`Decidir_Status`), el lector (47 claves + 9 booleanos), las guardas de unicidad y de idempotencia y
los cinco `Avisar_*` van **idénticos**.

Aristas `ai_tool`: **3 → 4** (`guardar_datos_cliente`, `leer_expediente`, `analizar_documento` y la
nueva `calcular_plazo`).

---

## 3 · Los dos cambios que no se ven en el recuento de nodos

### 3.1 · Sin Custom Bot no hay `callback_token`, y ese token era el único canal de salida

`Callback_Intercom` publicaba en
`POST /hooks/workflows/trigger_step/{{callback_token}}/{{conversation_id}}`, **sin credencial**,
porque el token *era* la autorización. Y ese token lo emite **el paso del Custom Bot que hace
`wait_for_callback`**. Si el canvas muere, el token desaparece y el bot se queda mudo.

**Solución cableada:** `Responder_Intercom` → `POST /conversations/{id}/reply` con
`message_type=comment`, `admin_id=4418209` (el operator de producción, el mismo que manda la
bienvenida) y credencial `intercomApi` — la misma que ya usaban `Traer_Conversacion_intercom1` y
`Cerrar_Conversacion`. Los saltos de línea se convierten a `<br>` porque `/reply` no los respeta.

**Efecto secundario bueno:** al no haber `wait_for_callback`, Intercom **libera el slot
customer-facing** en cuanto dispara, en vez de retenerlo mientras espera.

### 3.2 · La deduplicación de turnos se ha perdido, y era gratis

La hacía el `wait_for_callback`: solo había **un** paso esperando, así que solo llegaba **un**
callback. Aquí dos webhooks son dos ejecuciones y **dos respuestas al cliente**.

`Wait2` (3 s) y `If2` **mitigan, no arreglan**: `If2` solo decide si se espera, no deduplica
ejecuciones. El sitio natural para cerrarlo es la Data Table **`beckham_faq_estado`**
(`Rnn7SUQ8RxFdK7Xp`), que con el diseño nuevo queda inerte, guardando `ultimo_part_id` por
conversación. **No está construido.**

---

## 4 · EL TRANSPORTE: `reuse_mobility` NO SE VA. Es lo único de Intercom que importa

**Alguien tiene que mandarle a n8n el body de cada mensaje del cliente.** El contrato del webhook
nuevo son cinco claves —`conversation_id`, `user_id`, `user_email`, `message`,
`conversation_part_id_debounce`— y son **las mismas de hoy menos `callback_token`**. Ese «alguien» es
un workflow de Intercom con el trigger **«When customer sends any message»** más un Data Connector.

**Eso es exactamente `reuse_mobility` (`66250478`)**, cuyo único paso es `Pass to n8n_BOT_mobility`.
Verificado funcionando el 1/08 (`Sent` 0 → 1, `Engaged` 100 %, conversación `215475316515974`, tres
ejecuciones correlativas de `beckham_bot`).

**Cambia de papel, y a más importante:** hoy relanza los **turnos 2..n**; mañana es **la única
entrada de todos los turnos, incluido el primero**.

### 4.1 · Lo que hay que tocarle, y son tres cosas

**(a) Quitar el `wait_for_callback`.** Vive en el **paso** del reusable `n8n_BOT_mobility`
(`66246057`), no en el Data Connector. Con el diseño nuevo nadie va a mandar ese callback: el paso se
quedaría esperando, reteniendo el slot customer-facing, y el turno siguiente podría no disparar.
Dos formas, y la segunda es más limpia:
- dejar `Pass to n8n_BOT_mobility` y quitarle el `wait_for_callback` a ese paso; o
- que `reuse_mobility` llame **al Data Connector directamente** y se quite el reusable de en medio.

**(b) ⛔ LA AUDIENCIA, Y ESTO ES UN BLOQUEANTE QUE NADIE TENÍA APUNTADO.**
La audiencia de `reuse_mobility`, auditada el 1/08, es
**`Custom = Users AND 'Team assigned is Ops_BOT_Mobility'`** (team `11098265`).

Y **quien asignaba ese team era el Custom Bot**: en el timeline del 28/07 la asignación cae a las
`17:43:47`, justo después del turno 1 del canvas. **Comprobado el 31/08 por MCP: ni `beckham_bot` ni
`beckham_bot_conversacional` asignan team en ningún nodo** — cero apariciones de `11098265`,
`Ops_BOT_Mobility` o `team_assignee` en los dos workflows.

**Si el canvas muere y nadie asigna el team, la condición de audiencia no se cumple nunca y
`reuse_mobility` no dispara jamás: el bot no recibe un solo mensaje.** Tres salidas:
1. **Cambiar la audiencia** de `reuse_mobility` a una condición que no dependa del canvas (un atributo
   de plan, un tag, o el segmento de clientes full VIP que ya existe en producción).
2. **Que n8n asigne el team** en el primer turno (`PUT /conversations/{id}` con `assignee`), lo que
   añade una llamada más a la API pero deja la audiencia como está.
3. **Dejar un workflow mínimo de entrada** en Intercom que salude y asigne el team, y que
   `reuse_mobility` se ocupe del resto.

**(c) El saludo: quién abre la conversación.** «Customer sends any message» dispara **cuando el
cliente escribe**, así que con solo `reuse_mobility` el cliente se encuentra un chat vacío y tiene
que escribir primero. La rama `[ARRANQUE_EN_FRIO]` de `Preparar_Prompt` existe, pero es **defensiva**:
solo entra si el texto llega vacío, y si el cliente ha escrito «hola» no entra. Decisión de producto:
o se deja que el cliente escriba primero (más simple, un chat vacío), o se mantiene un workflow de
bienvenida en Intercom (que además resuelve el punto (b) por la vía 3).

### 4.2 · El riesgo heredado que sigue vivo: `WP-10`

**Sobre un `Customer ticket` los triggers de tipo «customer sends any message» NO se disparan.**
Medido el 28/07 en la conversación `215475262949230`: el cliente responde a las `17:43:59`, a las
`17:44:02` un `ticket_state_updated_by_admin`, y después **nada** — ni `custom_action_started`, ni
ejecuciones en n8n. `reuse_mobility` marcaba `Sent: 0`.

El causante era el workflow **`distribuidor - usuario envia mensaje`**, que al no encontrar destino
convertía la conversación en ticket. `WP-10` sigue en `specified` y era del workspace **TEST**; en
producción hay que **volver a medirlo**, porque toda la arquitectura nueva depende de ese trigger.
Es la primera prueba que hay que hacer, antes de cablear nada más.

---

## 5 · Lo que se gana y lo que se paga

**Se gana:**
- **Un sistema en vez de tres.** Se van de golpe el `callback_token`, el `wait_for_callback`, el
  timeout de 15 s del DC, el slot único de Intercom, el `Collect data`, el arranque en frío del
  `Conversation part: Id` y el nudo del multi-turno del FAQ.
- **El plazo en el mismo turno.** Antes era un DC síncrono con `Object mapping` a atributos de
  conversación; ahora es una tool que el agente llama cuando le dan la fecha.
- **Preguntas sin límite antes de los filtros**, que es lo que el FAQ multi-turno intentaba resolver
  con un bucle en el canvas.
- **Un arreglo, un sitio.** La duplicación por idioma del canvas (32 paths, dos ramas completas)
  obligaba a hacer cada cambio **dos veces**. El idioma pasa a ser un dato del prompt y de la columna
  `Idioma` de Airtable, que es de donde ya lo lee el informe v2 para elegir su plantilla.

**Se paga, y está aceptado por escrito:**
1. **Se pierde el aislamiento topológico.** El agente que contesta preguntas es el mismo que tiene las
   tres tools de escritura. Alguien que solo venía a preguntar puede acabar con expediente creado.
   La defensa pasa del **grafo** al **prompt + las whitelists del escritor**.
2. **El descarte deja de ser determinista.** Hoy quien fue residente 5 años cae en la rama `D` por
   construcción del canvas. Ahora lo decide el modelo leyendo una respuesta en texto libre. De ahí
   que la puerta del v15 ancle la **rama literal** de cada filtro (§5 de `CLAUDE.md`).
3. **El orden de los tres filtros pasa del grafo al prompt.** Y un prompt se puede desobedecer.
4. **La deduplicación de turnos** (§3.2).
5. **El coste por turno crece con el historial**, porque `chat_history` viaja entero. Mitigado con los
   dos topes de `Preparar_Prompt` (4.000 car. el mensaje por la cabeza, 24.000 el historial por la
   cola), no eliminado.

---

## 6 · El prompt

**v15**, `docs/prompt-final-2026-08-31-v15.txt`, **86.548 caracteres** (+20.528 sobre el v14).
Puerta `docs/test-prompt-v15.js`: **206 verdes**, hereda las 107 comprobaciones del v14 midiendo el
v15 y añade 99.

**No va en `bot_mobility_prompt` tag `prod`.** Ese lo lee `beckham_bot`, que está **activo con el
canvas delante**: el v15 dice que nada viene pre-filtrado, así que el bot vivo repreguntaría lo que el
canvas ya preguntó. Va en un prompt nuevo — `bot_mobility_prompt_conversacional` — y el nodo
`Langsmith Prompt` del workflow nuevo hay que apuntarlo ahí (`bash docs/pasos-conversacional.sh 5`).

El bloque de conocimiento fiscal es **byte a byte** el del v14, y la puerta lo comprueba: una
mutación del 24 % dentro de ese bloque la caza.

---

## 7 · Los pasos

`bash docs/pasos-conversacional.sh` — 9 pasos con `pbcopy`, contador esperado y clic a clic.
`bash docs/pasos-conversacional.sh test` — las puertas de las piezas de este cambio.

Y las 22 del proyecto: `bash docs/pasos.sh test` (que **desde el 31/08 sale con `exit 1`** si alguna
está roja; hasta ese día imprimía FALLA en rojo y devolvía 0 igual).
