---
id: WP-09
title: "F6: agente IA conversacional (LangSmith) para el bot Beckham"
status: building
size: L
depends_on: [WP-05, WP-10]
milestone: "Fase 3 — Agente IA"
owner: "Paula, Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-09 — F6: agente IA conversacional para el bot Beckham

> ## 🔨 BUILDING — construido y funcionando parcialmente (2026-07-28)
>
> Este WP dejó de ser un skeleton: **el agente existe, está conectado y responde**. Se adelantó porque, al arreglar WP-04 y descubrir el estado real de la cadena conversacional, resultó que el "bloque 2" no existía en runtime y era el bloqueo de verdad.
>
> ### Lo que está construido y verificado en conversación real
>
> ```
> Webhook1 → If2 → (Wait2 3s | directo) → Traer_Conversacion_intercom1
>          → Formatear_conversacion1 → Preparar_Prompt → AI Agent → Callback_Intercom
>                            └─ (salida de error) → Mensaje_fallback → Callback_Intercom
> ```
>
> - **`AI Agent`** nuevo (tipo Tools Agent), `promptType: define`, texto `{{ $json.prompt }}`, System Message = prompt v1 de Paula, modelo `OpenAI Chat Model2`. **Sin nodo de Memory**: el historial viaja dentro del prompt porque `Formatear_conversacion1` lo reconstruye desde la API de Intercom en cada turno, así que el agente es sin estado por diseño.
> - **`Preparar_Prompt`** (Code): detecta el **arranque en frío** (`last_message_content` vacío → `cold_start: true`) y en ese caso manda una instrucción `[ARRANQUE_EN_FRIO]` en vez de un prompt vacío. Además inyecta un bloque **"DATOS QUE YA CONOCEMOS"** con `nombre_apellidos`, `email`, `telefono` del body del webhook y `veredicto_f2` / `fecha_limite_f2` leídos de los `custom_attributes` de la conversación.
> - **`Mensaje_fallback`** (Code): red de seguridad enganchada a la salida de error de `Formatear_conversacion1`, para que un fallo del Code node no deje la conversación muda esperando en el `Wait for webhook`.
> - **No se reutilizó** el `Agente_conversacional` viejo: sigue `disabled` y sin conexión de entrada, como referencia. Decisión del usuario. Su campo `text` y la url de `Responder_Intercom` apuntan al webhook equivocado (`Webhook_Upsert_Expediente`, resto de un rename), así que copiarlo habría arrastrado el error.
>
> **Verificado en conversaciones reales (no Preview):** turno normal lanzando el reusable desde el Inbox → el agente responde; y **arranque en frío** por el path `G` con fecha en plazo → el agente **se presenta solo**, sin que el usuario escriba nada.
>
> ### Bloqueado
>
> **El turno 2 no funciona**, y no por nuestro código: la conversación es un `Customer ticket` y sobre un ticket no se disparan los triggers de mensaje → el mensaje del usuario nunca llega a n8n. Detalle y checklist en **WP-10**, del que este WP ahora depende.
>
> ### Pendiente de diseño
>
> - **Prompt:** v1 de Paula ya integrada. Falta que contemple el marcador `[ARRANQUE_EN_FRIO]` y que prohíba HTML/Markdown (ver defecto corregido abajo).
> - **Herramientas:** ninguna montada todavía. Ver §4.
> - **Cierre de conversación:** hoy nadie cierra. `G` no puede (el agente necesita el hilo abierto), así que le corresponde al agente cuando termine el expediente — probablemente una tool.
>
> ### Defectos encontrados en la primera prueba real
>
> | Defecto | Causa | Fix |
> |---|---|---|
> | El agente escribía `<b>…</b>` y salía literal | El `mensajeUsuario` de Intercom se inserta como texto plano | `.replace(/<[^>]+>/g, '')` en el `jsonBody` del callback **+** línea en el prompt prohibiendo HTML y Markdown. **Aplicado y verificado** |
> | Volvía a pedir nombre y fecha de llegada | El prompt no recibía nada de lo ya conocido | Bloque "DATOS QUE YA CONOCEMOS" en `Preparar_Prompt` |
> | Ante *"¿qué documentos necesito?"* ignoró la pregunta y arrancó el cuestionario | Diseño del prompt | Para Paula: un usuario que llega preguntando espera respuesta, no un cuestionario |

## 4. Catálogo de herramientas (pendiente de cerrar)

El usuario pidió cuatro. Análisis del 28/07:

| Propuesta | Veredicto |
|---|---|
| "Pedir unos datos" | **Ambiguo, pendiente de aclarar.** Si es *preguntar al usuario*, **no es una tool** (preguntar es solo escribir un mensaje). Si es *consultar* lo que ya hay en Airtable, sí lo es, y es `get_expediente` (WP-07) |
| "Rellenar el expediente" | ✅ Encaja. Es el upsert ya verificado de WP-05 — el agente llamaría al **único escritor** de Airtable, como decidió el Council |
| "Generar un reporte" | **Pendiente:** ¿para quién (equipo, cliente), en qué forma (mensaje, nota interna, PDF, fila en Airtable) y cuándo (a petición, al completar, siempre)? |
| "Detectar si viene a preguntar y responder distinto" | ❌ **No es una tool, es un modo.** Y ya tenemos el dato sin gastar una llamada del LLM: `cold_start` distingue handoff de mensaje libre, y `veredicto_f2` vacío distingue a quien nunca pasó el filtro. Se decide en `Preparar_Prompt`, determinista y gratis |

**Nota de implementación:** las tools que toquen la persistencia deberían ir como **sub-workflow** (`Call n8n Workflow Tool`), no por HTTP al propio webhook de `beckham_bot`. Eso refuerza extraer la cadena de upsert a un workflow propio — que además la volvería editable por MCP, hoy imposible.

**Las descripciones de las tools son parte del prompt.** Hay que entregarle a Paula un contrato cerrado (nombre, descripción para el LLM, parámetros, salida, efectos) para que escriba sobre algo firme.

---

> **Notas del skeleton original, conservadas:** revisar si el diseño de `sesion_2026-07-21_agente-ia.md` sigue vigente. Lo construido el 28/07 no lo sigue: no usa LangSmith ni los subworkflows que allí se planteaban.

## 1. Objective

Sustituir (o complementar) la lógica determinista actual por un agente conversacional en n8n capaz de manejar la conversación de forma más flexible, usando el expediente persistido (WP-05) como su memoria del caso, con tools/subworkflows y trazabilidad vía LangSmith.

## 2. Scope

**In:**
- Diseño ya documentado en `sesion_2026-07-21_agente-ia.md` (tools, subworkflows, contrato, salida JSON, multi-turno, derivación humana, mapa de impacto sobre la limpieza de n8n) — revisar si sigue vigente tras los cambios de F5.
- Definir el alcance real de implementación con Paula (qué parte del flujo pasa a ser agente vs. qué se queda determinista).

**Out:**
- Cualquier cambio al filtro determinista F1–F3 (WP-01) — se asume que se mantiene tal cual salvo decisión explícita en contra.
- Persistencia — ya cubierta por WP-05, el agente la consume, no la reimplementa.

## 3. Open questions

- ¿Sigue vigente el diseño de `sesion_2026-07-21_agente-ia.md` tras los cambios de esquema de Airtable (F5) y el bug de F3, o hay que revisarlo con Paula antes de especificar este WP?
- ¿Qué parte exacta de la conversación pasa a ser agente (todo el flujo, o solo ciertas ramas como la de lead potencial / soporte)?
- ¿Qué disponibilidad tiene Paula esta fase — se especifica ya o se espera a después del viernes?
