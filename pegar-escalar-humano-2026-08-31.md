# Cablear `BECKHAM_escalar_humano` como tool del `AI Agent` vivo · 31/08/2026

Workflow: **`BECKHAM_escalar_humano`** · `m8GmgA2ot05foDBd` · 14 nodos · `active=false` ·
`versionId=531618b8-e9d6-4283-a436-37a09ce6654d` (alineado hoy con el sistema vivo).
Fuente SDK en el repo: **`docs/wf-223-escalar-humano-sdk-2026-08-31.js`** (26.587 car.).

---

## AVISO DE ESTADO · leer antes de tocar `beckham_bot`

**Se está editando AHORA MISMO.** Dos mediciones por MCP con nueve minutos de diferencia, las dos de
hoy:

| | 12:00 | 12:09 |
|---|---|---|
| nodos | **60** | **62** |
| `versionId` | `d4ec794a-…` | **`dd33b73a-285f-4a91-bc43-c0624978bd16`** |
| `activeVersionId` | `d4ec794a-…` | `d4ec794a-000f-4b0b-930e-4b2c306baf45` |
| | iguales: nada sin publicar | **DIFIEREN: hay borrador sin publicar** |

Los dos nodos que aparecieron entre una lectura y otra son **`AI AGENT FAQ`** y
**`OpenAI Chat Model`**, y además cambiaron **`Langsmith Prompt FAQ`** y **`Leer_MotivoCierre`**. O
sea: **el sidecar del FAQ se está cableando en la UI en este momento**, y lo que corre en producción
sigue siendo `d4ec794a`.

**La referencia de «no lo he tocado» ya no es `ef638a18` ni `7f439285`.** Hoy ha habido varias
publicaciones: la fórmula de `Leer_Expediente_Para_Prompt` (R9, la fuga de PII) y los nodos del FAQ
(`Webhook_FAQ`, `Preparar_Prompt_FAQ`, `¿Cortar_FAQ?`, `Callback_Intercom_FAQ`,
`Langsmith Prompt FAQ`, y ahora `AI AGENT FAQ` + `OpenAI Chat Model`).

**Consecuencia práctica, y es la que importa:** al pulsar **Save** en la UI para cualquiera de los
pasos 4-6 de aquí **se publica TAMBIÉN todo el borrador del FAQ**, incluido lo que esté a medias
(a las 12:00 `Callback_Intercom_FAQ` tenía solo `method: POST`, sin URL ni body). **Primero se
termina el FAQ y se publica; los pasos 4-6 van después.** Los pasos 1-3 no tocan `beckham_bot` y se
pueden hacer ya.

Lo que **no** ha cambiado y es la línea base del paso 4: el `AI Agent` sigue con **exactamente 3
aristas `ai_tool`** (`guardar_datos_cliente`, `leer_expediente`, `analizar_documento`).

## EL ORDEN, Y QUÉ DESATASCA QUÉ

| # | Paso | Rompe producción si falla | Desatasca |
|---|---|---|---|
| 1 | `team_id_ops` en el subworkflow | no | **TODO. Sin esto el workflow responde `team_sin_configurar` y no llama a Intercom.** |
| 2 | Credencial `intercomApi` en los dos nodos HTTP | no | que la llamada llegue a Intercom |
| 3 | Probar el subworkflow SOLO, a mano | no | saber que asigna de verdad antes de enseñárselo al agente |
| 4 | El nodo tool + la arista `ai_tool` en `beckham_bot` | **SÍ** (se toca un workflow activo) | que el bot pueda escalar |
| 5 | El prompt en LangSmith | **SÍ** (es el que decide si la tool se llama) | que el LLM la llame alguna vez |
| 6 | `Mensaje_fallback` | **SÍ** | que la promesa del fallback deje de ser falsa |

Los pasos 1-3 son **inofensivos**: el subworkflow está inactivo y nadie lo llama. Los 4-6 tocan
producción.

---

## PASO 1 · el `team_id_ops` (es el tapón)

Hoy el campo sale **VACÍO a propósito**. Antes llevaba `11098265`, que es del **workspace viejo**
(`q3bhdtoi`), y con ese id se llamaba a la API de Intercom y se confiaba en que la rechazara. Ya no:
la guarda lo rechaza **por forma y también por valor** y **no se llama a la API**.

- Workflow **`BECKHAM_escalar_humano`** → nodo **`Team de Ops (VALOR A CONFIRMAR)`** → campo
  **`team_id_ops`**. Es un **texto**, no un desplegable.
- Hoy dice: *(vacío)*. Tiene que decir: **el id numérico del team de Ops del workspace
  `s1hap599`**.
- Dónde se saca en Intercom: **Settings → Teams → el team → el número del final de la URL**.

El otro valor de ese nodo, `admin_id_bot`, ya está puesto y **es el que el bot usa hoy para cerrar
conversaciones** (`Cerrar_Conversacion` de `beckham_bot`, medido hoy). Para confirmarlo tal cual:

```bash
printf '4418209' | pbcopy
```

**Verificación:** en cuanto pongas el team, dime el número y **lo compruebo yo por MCP** (no hay
`N8N_API_KEY` en el entorno). El comprobable desde aquí es el comportamiento de la guarda:

```bash
node docs/test-escalar-humano.js | tail -2
```

Tiene que salir **`VERDES 52 · ROJOS 0`** y `exit 0`. La puerta **ejecuta** la guarda con un
`$input` de mentira (no compara texto) y comprueba, entre otras cosas, que el team vacío y el
`11098265` dan `team_sin_configurar`, que la nota lleva `24-48 horas` y ningún otro plazo, y que los
dos nodos HTTP siguen con el patrón de `Cerrar_Conversacion`. **Mide la fuente**
(`docs/wf-223-escalar-humano-sdk-2026-08-31.js`), así que si alguien cambia el SDK y no el workflow
—o al revés— se ve.

---

## PASO 2 · la credencial `intercomApi` en los DOS nodos HTTP

Los dos van con el **patrón de la casa**, el del nodo vivo `Cerrar_Conversacion`
(`httpRequest` **tv 4.4** · `predefinedCredentialType` · `nodeCredentialType: intercomApi` · body en
**JSON de texto**). Lo único que falta es elegir la credencial, y **eso no se puede hacer por MCP**:
el MCP devuelve `credentials={}` en TODOS los nodos, también en los que funcionan.

- Nodo **`Asignar la conversacion al team de Ops`** → *Credential for Intercom API* → la misma que
  usa `beckham_bot`.
- Nodo **`Nota interna con el motivo`** → lo mismo.

**Verificación:** la única que vale es ejecutar (paso 3).

---

## PASO 3 · probar el subworkflow SOLO

En `BECKHAM_escalar_humano` → **Execute workflow** → el trigger pide los 4 valores. Pon un
`conversation_id` real de una conversación de prueba de `s1hap599`.

Qué tiene que salir, y el enum completo:

| Caso | `resultado` | `ok` |
|---|---|---|
| team sin poner, o `11098265`, o no numérico | `team_sin_configurar` | `false` |
| `conversation_id` vacío o con `/`, `?`, `#`, espacios | `schema_error` | `false` |
| todo bien | `asignada` | `true` |
| asignó pero la nota falló | `asignada_sin_nota` | **`true`** |
| Intercom dijo no a la asignación | `asignacion_fallida` | `false` |

Y en Intercom, en esa conversación, tienen que aparecer **dos cosas**: la conversación **asignada al
team**, y **una nota interna** (no un mensaje al cliente) que dice:

> Escalado por el bot Beckham. SLA prometido al cliente: 24-48 horas. UserId: … · corr_id: … ·
> Motivo (con la PII enmascarada): …

**El SLA es `24-48 horas` y no otro.** Es el único plazo que el prompt permite dar
(`docs/prompt-final-2026-08-26-v14.txt`, líneas 105, 363, 364, 367, 430 y 468). Comprobado con la
prueba de la guarda: la nota lleva ese plazo y **ningún otro** («en breve», «inmediato», «48 h»
sueltos: cero apariciones).

**COSMÉTICO, y hay que arrastrarlo a mano:** el motor de layout del SDK ignora las posiciones y ha
apilado **las CUATRO notas** en el mismo punto (`[672,448]`). Están una encima de otra.

---

## PASO 4 · el nodo tool y la arista `ai_tool` en `beckham_bot`

**A mano en la UI. NUNCA con `update_workflow` del MCP**: reenvía los 60 nodos y borra las
credenciales.

El molde ya existe en el propio workflow: **`analizar_documento`** es un
`@n8n/n8n-nodes-langchain.toolWorkflow` **tv 2.2** que llama a otro workflow y mezcla
**un valor por expresión** con **uno por `$fromAI`**. Se copia esa forma, no se inventa otra.

1. **Añadir nodo** → busca *Call n8n Workflow Tool* → nómbralo **`escalar_a_humano`**.
2. **Source: Database** · **Workflow: `BECKHAM_escalar_humano`** (`m8GmgA2ot05foDBd`).
3. **La arista**: arrastra desde el conector de abajo del nodo (el de la bolita) hasta el conector
   **`Tool`** del nodo **`AI Agent`** — el mismo punto donde ya entran `guardar_datos_cliente`,
   `leer_expediente` y `analizar_documento`. Hoy el `AI Agent` tiene **3 aristas `ai_tool`**;
   después tiene que tener **4**. Es una arista `ai_tool`, no `main`.
4. **Workflow Inputs** → *Mapping Mode:* **Define below** (igual que `analizar_documento`) → cuatro
   campos.

**`conversation_id` y `user_id` van POR EXPRESIÓN, NUNCA por `$fromAI`** (WP-219): el LLM no elige a
quién se escala ni de quién. Que funciona dentro de un nodo tool está medido en el propio workflow:
`leer_expediente` ya manda `user_id` así.

```bash
# conversation_id
printf '{{ $('"'"'Webhook1'"'"').first().json.body.conversation_id }}' | pbcopy
```
```bash
# user_id
printf '{{ $('"'"'Webhook1'"'"').first().json.body.user_id }}' | pbcopy
```
```bash
# corr_id — la convencion de la casa: conversation_id + ':' + el id de la parte
printf '{{ $('"'"'Webhook1'"'"').first().json.body.conversation_id }}:{{ $('"'"'Webhook1'"'"').first().json.body.conversationPartId || $('"'"'Webhook1'"'"').first().json.body.conversation_part_id_debounce }}' | pbcopy
```
```bash
# motivo — LO UNICO que redacta el modelo, y no direcciona nada
printf '{{ $fromAI('"'"'motivo'"'"', `En una frase, por que hay que pasar esta conversacion a una persona. No copies datos personales del cliente: el equipo tiene la conversacion delante.`, '"'"'string'"'"') }}' | pbcopy
```

5. **Description** (lo que lee el LLM para decidir si la llama):

```bash
printf 'Pasa esta conversacion a una persona del equipo: la asigna al team de Ops en Intercom y deja una nota interna con el motivo.\n\nLlamala SOLO cuando el cliente pida hablar con una persona, o cuando lleves dos intentos sin poder resolver lo que te pide.\n\nLLAMALA UNA SOLA VEZ por conversacion. Si responde ok:true, dile al cliente que una persona del equipo lo coge y que el equipo responde en 24-48 horas. Si responde ok:false, NO le digas que ya esta escalado: dale la via de contacto de support@taxdown.es.' | pbcopy
```

Los valores se pegan **sin el `=` inicial y sin salto de línea final** — los `printf` de arriba ya
salen así.

**Verificación:** dime cuándo lo has guardado y **compruebo por MCP** que el `AI Agent` tiene
**4 aristas `ai_tool`** y que los cuatro `workflowInputs` están como aquí (y que
`conversation_id`/`user_id` **no** llevan `$fromAI`). El número que tiene que salir es **4**.

---

## PASO 5 · el prompt · SIN ESTO LA TOOL NO SE LLAMA NUNCA

**Esto no es opcional y es lo que más cuesta.** El prompt vigente le prohíbe al bot justo lo que la
tool hace. Medido en `docs/prompt-final-2026-08-26-v14.txt`:

| Línea | Lo que dice hoy | Por qué choca |
|---|---|---|
| 104 | «no puedes agendar llamadas, ni validar documentos, **ni transferir a una persona**. NUNCA digas que has hecho ninguna de esas cosas: nada de "te paso con un compañero"» | con la tool cableada, **sí** puede transferir |
| 764 | «Tienes **TRES** herramientas y hay que usarlas: …» | pasan a ser **CUATRO** |
| 435 | `PIDE HABLAR CON UN HUMANO:` «Escríbenos a support@taxdown.es y una persona del equipo te atiende.» | es la vía de hoy; con la tool, el camino cambia |
| 430 | NIVEL 2 de frustración → también manda a support@taxdown.es | mismo caso |

La fuente de verdad del prompt es **LangSmith**, `bot_mobility_prompt` tag `prod` — no el fichero.
Un cambio aquí es **una versión nueva del prompt con su puerta** (`test-prompt-v14.js` mide el v14;
haría falta la del v15). **No lo he escrito**: es una decisión de producto (qué le decimos al cliente
cuando pide una persona), no un pegado.

Mientras el prompt no cambie, el paso 4 es **inofensivo pero inútil**: la tool está colgada y el LLM
no la llama, porque tiene escrito que no puede transferir.

---

## PASO 6 · `Mensaje_fallback`, que hoy promete en falso

Lo que el bot le dice HOY al cliente cuando se rompe (`Mensaje_fallback`, nodo `code` de cinco
líneas, texto literal):

> «Vaya, ahora mismo no puedo continuar por un problema tecnico. Un compañero del equipo lo revisara
> y te escribira en breve. Disculpa las molestias.»

Y la alerta que sale a Slack a la vez lo admite con letra: **«Nadie ha sido asignado.»**
(`Avisar_Fallback1`, `tipo_alerta: bot_fallback_sin_humano`). Medido hoy sobre los 60 nodos: cero
`assignee`, cero `team_id`, cero `Assign`, cero `snoozed`, y `/conversations/{id}/parts` aparece
**una sola vez** en todo el workflow — la de cerrar.

**Y OJO CON ESTO, que es lo que decide el arreglo:** a `Mensaje_fallback` solo entra **la rama de
ERROR de `Formatear_conversacion1`**. Por ahí **no se pasa por el `AI Agent`**, así que **la tool del
paso 4 NO puede cumplir esta promesa**: la tool la llama el modelo, y en ese camino no hay modelo.
Son dos agujeros distintos.

### Opción B · la buena: llamar al subworkflow también desde el fallback

Un nodo más en `beckham_bot`, con el patrón de los tres `Avisar_*` nuevos
(`executeWorkflow` **tv 1.3** · `waitForSubWorkflow: true` · `onError: continueErrorOutput`):

- **Añadir nodo** → *Execute Sub-workflow* → nómbralo **`Escalar_Fallback_A_Humano`**.
- **Workflow: `BECKHAM_escalar_humano`**.
- Conéctalo **de `Mensaje_fallback` a este nodo, y de este a `Callback_Intercom`** (o en paralelo,
  como `Avisar_Fallback1`: `Mensaje_fallback` ya sale a dos sitios).
- Los cuatro valores:

```bash
printf '{{ $('"'"'Webhook1'"'"').first().json.body.conversation_id }}' | pbcopy
```
```bash
printf '{{ $('"'"'Webhook1'"'"').first().json.body.user_id }}' | pbcopy
```
```bash
printf 'Fallo tecnico del bot: Formatear_conversacion1 no pudo procesar la conversacion. El cliente ha recibido el mensaje de disculpa y espera respuesta.' | pbcopy
```
```bash
printf '{{ $('"'"'Webhook1'"'"').first().json.body.conversation_id }}:{{ $('"'"'Webhook1'"'"').first().json.body.conversationPartId || $('"'"'Webhook1'"'"').first().json.body.conversation_part_id_debounce }}' | pbcopy
```

Con esto la promesa se cumple **de verdad**: el hilo queda asignado al team y con su nota.

### Opción A · el parche interino, mientras el `team_id_ops` esté vacío

Hasta que el paso 1 esté hecho, la escalada responde `team_sin_configurar` y **la promesa sigue
siendo falsa**. Si esto va a tardar, el texto tiene que dejar de prometer un humano y dar la vía que
el propio prompt ya usa (support@taxdown.es, 24-48 horas). **El nodo entero, para Cmd+A** — son
cinco líneas y no se pega por trozos:

```bash
cat <<'JS' | pbcopy
return {
  json: {
    output: 'Vaya, ahora mismo no puedo continuar por un problema tecnico. Escribenos a support@taxdown.es y una persona del equipo lo coge desde aqui, normalmente en 24-48 horas. Disculpa las molestias.'
  }
};
JS
```

- `beckham_bot` → nodo **`Mensaje_fallback`** → **Cmd+A** en el editor de código y pegar.
- Cambia una promesa que nadie cumple por una que sí se cumple, con **el mismo plazo que el prompt**.
- **Si se hace la opción B, esta NO se hace**: el texto de hoy vuelve a ser verdad.

**Verificación del paso 6:** medido con el propio comando, el nodo de la opción A son **230
caracteres** sin el salto de línea final (el `cat` del `pbcopy` añade uno, y en un nodo de código eso
es inofensivo):

```bash
printf 'return {\n  json: {\n    output: '"'"'Vaya, ahora mismo no puedo continuar por un problema tecnico. Escribenos a support@taxdown.es y una persona del equipo lo coge desde aqui, normalmente en 24-48 horas. Disculpa las molestias.'"'"'\n  }\n};' | wc -m
```

---

## LO QUE ESTE WORKFLOW **NO** TAPA

El `AI Agent` vivo va con **`onError: null`**. Un fallo del agente o del LLM es hoy un **turno mudo**:
ni mensaje al cliente, ni alerta a Slack. `Mensaje_fallback` no lo recoge, porque solo lo alimenta la
rama de error de `Formatear_conversacion1`. Eso es un tercer agujero, sigue abierto, y no lo arregla
ni la tool ni el paso 6.
