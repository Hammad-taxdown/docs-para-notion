# El pivote conversacional · 31/08/2026

> **Estado al 01/09: CABLEADO Y ACTIVO. Un bloqueante y un fallo abierto.**
> `beckham_bot_conversacional` (`n1jx7z9NtXWCD4VC`) está **activo y publicado**
> (`activeVersionId == versionId`), con los cuatro nodos de código pegados con su contador exacto
> (**11.288 · 20.569 · 76.156 · 13.206**), los settings completos y la credencial `Intercom Spain PROD`
> verificada en una ejecución real. LangSmith devuelve el prompt (no entra el respaldo) y
> `Responder_Intercom` publica en 611 ms.
>
> **Bloqueante:** la **prioridad** entre workflows customer-facing de Intercom (§4.2).
> **Abierto:** el DC manda en `message` **el saludo del propio bot**, así que el agente se contesta a
> sí mismo (§4.3). Arreglo escrito, sin hacer.
>
> **Producción vieja:** `beckham_bot` (`nhOwpiGxikeU5DLR`) sigue `active=true` pero **sin tráfico desde
> el 31/08 a las 11:00**. Y **lee el mismo tag `prod`, donde ahora vive el v15** — que nombra una tool
> que ese workflow no tiene. Riesgo latente; se cierra despublicándolo.
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

## 4 · EL TRANSPORTE — reescrito el 01/09 contra el sistema vivo

> **Este apartado decía tres cosas que resultaron falsas y se corrigen abajo con su medición.**
> Se conserva el error porque las tres se dedujeron de documentos y no de la plataforma, y esa es
> la §8 de `CLAUDE.md` otra vez.

### 4.1 · Lo que hay hoy, medido

| Pieza | Qué es | Estado |
|---|---|---|
| **DC `514525`** | `POST .../webhook/179cb7ee-…` → `Webhook1`. **12 claves** en el body | funcionando |
| Workflow del **clic** | `When customer clicks a website element` → bienvenida bilingüe → `Pass to pass_to_n8n_mobility_bot` | funcionando |
| Workflow del **mensaje** | `When customer sends any message` → `Pass to pass_to_n8n_mobility_bot` | **hubo que CREARLO** |
| `Responder_Intercom` | `POST /conversations/{id}/reply`, `admin_id 4418209` | `success` en 611 ms |

**Las tres correcciones:**

1. **NO hay casilla `wait_for_callback` que quitar.** El paso del reusable no la tiene: el DC dispara y
   vuelve. Todo lo que se escribió sobre liberar el slot quitándola era falso.
2. **NO existe un paso `End` en Intercom.** El `END` que se ve en el canvas es una **etiqueta** que
   indica dónde acaba el camino, no una instrucción. No se puede cerrar un camino a mano.
3. **La audiencia no era el bloqueante.** El team **sí** se asigna. Lo que faltaba era, simplemente,
   **crear el workflow con el trigger del mensaje**.

Y una que queda derogada: el workflow **`distribuidor - usuario envia mensaje`** era del workspace
**TEST**. No aplica en producción y no se vuelve a mencionar.

### 4.2 · El bloqueante que queda: la prioridad

**Solo un workflow customer-facing corre por evento, y gana el de más arriba de la lista**, que se
ordena arrastrando. Los dos del proyecto **no compiten entre sí** — un clic no es un mensaje. La
carrera es contra los demás workflows del workspace con el trigger `customer sends any message`.

**El criterio de seguridad, y es el que importa:** un workflow **arriba** con audiencia **estrecha**
es inofensivo — se evalúa primero, no encaja y **cede el turno**. Uno arriba con audiencia **amplia**
secuestra el soporte entero. La audiencia de este lleva `Team assigned is Ops_BOT_Mobility`, así que
subirlo al tope es seguro; **si algún día se le quita esa condición, hay que bajarlo en el mismo
movimiento**. Y **no se pausa el otro**: es el error del 28/07, que dejó el workspace sin reparto.

**Dos salidas que no tocan el orden:**

- **A · que este workflow deje de ser customer-facing.** Un workflow lo es porque **puede mandar
  mensajes**; lo que solo enruta es *background* y no pide slot (medido el 1/08). Este no necesita
  mandar nada, porque el bot contesta desde n8n por la API: el único mensaje que sale de Intercom es
  el de error del reusable. **Quitando ese paso, deja de competir.** El precio es que si n8n se cae el
  cliente no ve nada, y eso se cubre con `Mensaje_fallback`, que publica por la misma API.
- **B · suscripción de webhook.** Un webhook **no es un workflow**: no compite, no tiene audiencia y
  dispara en cada respuesta. Topic `conversation.user.replied` → el webhook de n8n. Cuesta dos cosas:
  dispara para **todo** el workspace (el filtro se hace en n8n) y el payload es el JSON de Intercom,
  no el body plano, así que hay que mapear cinco claves antes de `Formatear_conversacion1`. Se
  descartó el 1/08 «por innecesaria»; vuelve a estar sobre la mesa.

**A primero**: es quitar un paso. Si Intercom sigue clasificándolo como customer-facing, B no falla
porque se sale del sistema de workflows por completo.

### 4.3 · ⚠️ ABIERTO · el DC manda en `message` el saludo del propio bot

`{{last_conversation_part.body}}` coge la **última parte del hilo**, y en la entrada por clic esa
parte es **lo que acaba de escribir el canvas**. Medido en las ejecuciones `8159910` y `8159914`:

```
"message": "🇪🇸 Español ¡Hola! 👋 Soy el Mobility Bot del equipo de TaxDown…"
conversationPartId == conversation_part_id_debounce == First Message ID
```

Consecuencia: `Preparar_Prompt` ve texto no vacío, **`cold_start` sale `false`** y el agente
**contesta a su propio saludo**. En `8159910` devolvió el pitch entero del régimen; en `8159914`, la
pregunta del idioma. Comportamiento distinto en cada turno porque responde a basura.

**El arreglo, con un dato que ya llega en el body:** si `conversationPartId == First Message ID` es la
primera parte del hilo, o sea **arranque en frío**, no un mensaje del cliente. Va en `Preparar_Prompt`
y hay que ampliar su puerta. **Escrito y sin hacer.**

### 4.4 · El riesgo heredado, todavía sin medir en producción: `WP-10`

**Sobre un `Customer ticket` los triggers `customer sends any message` NO se disparan.** Medido el
28/07 en la conversación `215475262949230`: el cliente responde, dos segundos después un
`ticket_state_updated_by_admin`, y después **nada**. Era del workspace TEST, así que **en producción
hay que volver a medirlo**: abrir un hilo nuevo desde el Messenger como cliente y comprobar que nace
con `"ticket": null`.

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
