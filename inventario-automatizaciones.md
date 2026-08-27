# Inventario de automatizaciones · Beckham

**Actualizado: 12/08/2026.** Capa n8n y capa Airtable **verificadas por MCP hoy**; capas de Intercom
tomadas de la bitácora y marcadas como tal.

> ## Por qué existe este documento
>
> Porque no tenerlo ha costado tiempo tres veces:
>
> 1. `distribuidor - usuario envia mensaje` **no existe en n8n** — es un workflow de **Intercom**.
>    Averiguarlo costó una sesión.
> 2. **11/08:** `WP-237` se escribió como paquete de construcción. Al auditar antes de tocar nada
>    resultó que **el botón, el envío en dos idiomas, el formulario de confirmación y la fusión de
>    filas ya existían**. Solo faltaba un salto de `Status`.
> 3. **11/08:** `WP-236` daba la plantilla del informe por inexistente. Ya existía.
>
> **La regla que sale de aquí: antes de construir, buscar. Y buscar en las CUATRO capas**, porque una
> pieza que no está en n8n puede estar viva en Intercom o en Airtable.

---

## Capa 1 · Workflows de n8n

`https://es.synapse.rentax.es` · La instancia tiene del orden de **289 workflows**; aquí solo los del
proyecto. Verificado por MCP el 12/08.

### Vivos y del bot

| Workflow | id | Activo | Para qué |
|---|---|---|---|
| **`beckham_bot`** | `nhOwpiGxikeU5DLR` | ✅ | **El motor.** 55 nodos — 48 de lógica + 7 sticky (eran 51 el 12/08; actualizado 27/08): webhooks del DC, el AI Agent, el escritor y el lector del expediente, y el cierre de Intercom |
| `beckham_analizar_documento` | `ONhveViBeiI6GXWd` | ✅ | Tool del agente: lee el adjunto y dice **qué documento es** y qué datos trae |
| `beckham_f2_plazo.` | `wdOOF0ecCkgFOUjt` | ✅ | Filtro F2: plazo de 6 meses desde el alta en la Seguridad Social |
| `beckham_alertas` | `BJfExmwu1fI1aPpY` | ✅ | Avisos a Slack. **Dos entradas**: Error Trigger y Execute Workflow Trigger. Seis campos, **todos declarados string** |
| `beckham_adjuntos_huerfanos` | `9Dh7U9DIxvXvzPxG` | ✅ | **Nuevo el 12/08 (T041).** Cada hora, adjuntos que Airtable aceptó y nunca descargó |

### Vivos pero de otro proceso — **no tocar sin hablar con su dueño**

| Workflow | id | Activo | Para qué |
|---|---|---|---|
| `Sync status_renta - Beckham` | `6Zq09G6vsBXtHqDa` | ✅ | Sincroniza `status_renta`. **Escribe en la misma base** |
| `beckham_hypatia` | `E1nGOiR0IoVhg6Tl` | ✅ | Mensaje de revisión parseando el `.151` |
| `FLUJO_revisionBeckham_Intercom` | `XkfHEMIT3ejuZDtO` | ✅ | Revisión Beckham en Intercom |

### Apagados o históricos — no cuentan, pero confunden al buscar

| Workflow | id | Nota |
|---|---|---|
| `beckham_bot_test` | `3HE0vkd896Gd4HOA` | Copia de pruebas del 17/07. **Nombre peligrosamente parecido al bueno** |
| `FLUJO_revisionBeckham_Intercom test` | `9V0N4zDVR7MLX6Hp` | Apagado |
| `Beckham - landbot` | `UVMLDvks69zjPwS9` | Anterior al proyecto |
| `Beckham - Analizar ficheros de conversacion` | `7RPpltAdPlUKbX8x` | Anterior. **No confundir con `beckham_analizar_documento`** |
| `MensajeBeckham` | `E9OhxvmQ6qQ8RzSo` | Anterior |

---

## Capa 2 · Automatizaciones de Airtable

Base `app5K8OnSObqwWweS` (*Mobility_2026*), tabla `Empleados` (`tblTWCWu5nQXNOMR1`).
**Estas escriben en las mismas columnas que el bot.** Verificado por MCP el 12/08.

| Automatización | id | Estado | Dispara con | Qué hace |
|---|---|---|---|---|
| **2. Usuario completa el formulario de confirmación M030** | `wflo1oMmSWlcYsO3V` | desplegada | `formSubmitted` sobre `viwjxT8e1uLg7K4OC` | El formulario crea una fila nueva; el script la **fusiona en la original** por `recordId` y **borra el duplicado**. **No toca `Status`** |
| **1. Envio borradores 030 y 149** (renombrada en la base — los docs viejos la llaman «la 3», y buscarla por ese número no la encuentra; anotado el 27/08) | `wflx5iCN4pXuwPAvO` | desplegada | `EnviarBorradores` = true | Dos ramas **por idioma**. Adjunta los dos borradores, manda el correo por webhook de n8n, y escribe `Estado030149 = 3`; el `Status` **ya no retrocede** (24/08): solo lo sube la rama con guarda, al peldaño de confirmación — viejo `7`, hoy `8. Pte confirmación usuario` tras la renumeración del 26/08. Va por ids de opción |
| **4. El cliente confirma los modelos → Status a 8** | `wflYrTfhxYtRaLZkU` | **nueva 12/08** | `Status = 7` (hoy `8. Pte confirmación usuario`, renumeración del 26/08) **Y** `Estado030149` en 4.1 / 4.3 | `Status = 8. Confirmado` (hoy `9. Confirmado`). Va por ids de opción, así que la renumeración no la rompe (anotado el 27/08). Es `WP-237` |
| **Crear Check out** | `wflfiMbXabZqYnAzr` | desplegada | `CrearCheckout` = true | Crea el checkout de pago. **De otro proceso** |

> **Trampa del filtro, aprendida el 12/08:** `filtersObj` **no admite un `or` anidado** dentro del
> `and`. Para varios valores de un select va `isAnyOf` con un array. Un `or` anidado devuelve
> `typeMismatch` y no se guarda nada.

---

## Capa 3 · Intercom · el canvas

*Tomado de la bitácora, no verificado por MCP en esta sesión.*

| Pieza | Qué es |
|---|---|
| **Custom Bot `OnClick Mobility`** | El canvas visual. Filtros **F1** (fecha de llegada), **F2** (plazo de 6 meses, delegado a n8n) y **F3** (fecha límite) |
| **Puntos de disparo D, H, G y N** | Los cuatro sitios desde los que el canvas llama a n8n |
| **`A. Bienvenida`** | Arranque. El plan del reset quedó superado (anotado el 27/08): el modo viaja como **input del Data Connector** (transporte B, `T077` cerrada el 26/08; `WP-210` reescrito), así que no hay `modo_bot` que resetear (`T081` abierta para la variante B híbrida); el menú entra en el **rebuild del canvas en copia** según `docs/canvas-desde-cero-2026-08-27.md` |

> **Invariante que rompió el D0 del idioma el 07/08:** el Messenger **reanuda la conversación abierta**,
> así que el menú **no es un punto de entrada garantizado** y el agente puede entrar con cinco turnos
> ya escritos que él no ha visto.

---

## Capa 4 · Data Connectors de Intercom

> **26/08 · el contrato REAL del DC del turno, leído de una ejecución y no del canvas.** La cabecera
> `x-intercom-source-dataconnector-id: 461046` identifica el DC que llama a `Webhook1`, y su
> `x-intercom-source-app-id` es `q3bhdtoi`. El body que manda son **7 claves**:
> `conversation_id` · `user_id` · `conversationPartId` · `message` · `user_email` ·
> `conversation_part_id_debounce` · `First Message ID`. Fuente: ejecución `8129120`, nodo `If2`.
> Sirve para dos cosas: el `corr_id` de `WP-208` sale de ahí sin tocar el canvas, y **`message` y
> `user_email` son PII** — de ahí que `Log_Evento` tenga 6 campos y no el body.

*Tomado de la bitácora, no verificado por MCP en esta sesión.*

| DC | Qué hace |
|---|---|
| El de la conversación | Llama a `Webhook1` de `beckham_bot` con `wait_for_callback`. **Es el que trae al agente** |
| Escritor | `POST /webhook/beckham-upsert-expediente` |
| Lector | `GET /webhook/beckham-get-expediente`, devuelve **47 claves** más los 9 documentos como **booleanos** (arreglado el 19/08; las 21 claves de antes eran el bug que hacía repreguntar) |

> **`Callback_Intercom` y `Validar y Normalizar` son ejecuciones DISTINTAS** — conversación contra
> escritor. **No se pueden referenciar entre sí.**

---

## Los dos webhooks del escritor y el lector

| | URL |
|---|---|
| Escritor | `https://es.synapse.rentax.es/webhook/beckham-upsert-expediente` |
| Lector | `https://es.synapse.rentax.es/webhook/beckham-get-expediente` |

**Auth: apagado a propósito** desde el 10/08. La credencial `beckham_webhook_auth`
(`chTgEmF0KkSvcivT`) existe y funciona (403 sin cabecera, 200 con ella), pero mientras está puesta
**la identidad del MCP no puede leer el workflow** y se pierde el diff estático — que en tres días ha
cazado cuatro fallos silenciosos. La reactivación «al final» con token nuevo quedó **descartada por decisión del usuario el 26/08** (`WP-203` cerrado sin construirse, `T053`): el auth se queda apagado (anotado el 27/08).

---

## Deuda de este inventario

- **`beckham_bot` tiene la `description` vacía.** `WP-232` pide dueño + PRD en cada workflow del bot.
- **Nombres fuera de convención · MEDIDO EL 26/08, y no todos cuestan lo mismo.** Cuatro salen gratis
  porque tienen **cero referencias en expresiones** y n8n reescribe `connections` solo: `If2`, `Wait2`,
  `Airtable Upser Expediente` (falta la `t`) y el punto final de `beckham_f2_plazo.` — este último se
  llama por **id** desde el Data Connector, así que el nombre da igual. **`Webhook1` no:** tiene **13
  referencias**, y **2 están dentro de nodos `code`** (`Formatear_conversacion1` y `Preparar_Prompt`),
  donde **n8n no reescribe nada al renombrar**. Se rompen en silencio, y como una es `Preparar_Prompt`
  el síntoma sería que el bot vuelve a preguntar lo ya contado. Los cuatro primeros son el paso 3 de
  `docs/pasos.sh`; el quinto está razonado en la **§30.2 del PRD maestro** y no se toca solo.
- **La `description` de `beckham_bot` no se pone por MCP:** `update_workflow` exige reenviar el
  workflow entero, 55 nodos con dos de código de 198 y 241 KB. Va a mano en la UI.
- **Las credenciales son de Ops/Fiscal y la identidad del MCP no las ve.** Consecuencia práctica: al
  crear un workflow por MCP hay que **asignar la credencial a mano** en la UI. Pasó con
  `beckham_adjuntos_huerfanos` el 12/08.
- **Capas 3 y 4 sin verificar por MCP.** Intercom se audita a mano; conviene revisarlas antes de
  `WP-06`.
