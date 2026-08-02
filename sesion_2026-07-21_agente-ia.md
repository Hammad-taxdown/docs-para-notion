# Sesión de planificación — Diseño del agente IA

> **Naturaleza:** análisis y planificación (T2). No se implementa nada.
> **Etiquetas:** `[HECHO]` comprobado en una fuente · `[INFERENCIA]` deducido · `[PROPUESTA]` diseño sugerido · `[DESCONOCIDO]` no verificable con lo disponible.
> **Nota de archivo:** se nombró `sesion_2026-07-21_agente-ia.md` (no `sesion_2026-07-21.md`) para no sobrescribir el análisis previo del mismo día.

---

## 1. Decisión de orden y justificación

Se empieza por **T2 (diseño del agente)** antes que **T1 (limpieza de n8n)**. `[HECHO — decisión del usuario]`

Motivo `[INFERENCIA]`: no se puede decidir con seguridad qué nodos borrar del Bloque ① hasta saber qué lógica del workflow actual el agente **reutilizará** (p. ej. el parseo de conversación, el cálculo de plazo, la búsqueda/creación de expediente). Borrar antes de tener el mapa de dependencias arriesga eliminar lógica aprovechable. Por eso T2 produce el **mapa de impacto** que gobierna T1.

---

## 2. Estado actual confirmado

`[HECHO]`
- **Intercom (workspace TEST, app `q3bhdtoi`)** — todo en BORRADOR, sin publicar:
  - `OnClick Mobility` (66243731): filtro completo (Welcome ley+¿acogerte? → F1 → F2[fecha, atributo `fecha_alta_ss`] → F3 → descartes + cualifica; Tag `jarry_ignore` al inicio; Assign `Ops_BOT_Mobility` + Pass a `n8n_BOT_mobility` al cualificar).
  - `n8n_BOT_mobility` (66246057): paso "Reply" `{{mensajeUsuario}}` + fallback añadido.
  - `reuse_mobility` (66250478) y Data Connector `n8n_bot_mobility` (461046): sin cambios.
- **n8n `beckham_bot` (`nhOwpiGxikeU5DLR`)**: 51 nodos. Bloque ① de filtros construido y verificado, ahora **obsoleto**. Persistencia Airtable (`Search records2`, `Crear_Expediente1`) **desactivada y sin base/tabla**. Existe un **andamiaje de agente IA desactivado** en la parte superior (ver §17). Sin publicar.
- **Airtable** `Empleados` (= Expediente): 58 columnas; nuevo CSV con "no residente" (F3) + single-select de descarte, pendiente de auditar.
- **Contrato de comunicación**: Intercom↔n8n vía Data Connector (síncrono, ack) + **callback asíncrono** (n8n devuelve `{data:{mensajeUsuario}}`).

**F2 sigue pendiente**: botones "En/Fuera de plazo" son placeholder; falta la rama automática con el veredicto de n8n. `[HECHO]`

---

## 3. Información desconocida o no accesible

`[DESCONOCIDO]`
1. **Prompt del agente y sus decisiones de negocio** — los define Paula; no están escritos. Todo el diseño de tools es andamiaje para ese prompt.
2. **Nombres/tipos definitivos de campos Airtable** — no se ha auditado la base viva ni el CSV nuevo esta sesión (solo se conoce el esquema del CSV anterior).
3. **Qué atributos de filtro envía hoy el Data Connector** — el DC manda datos de conversación; **no está confirmado** que envíe `alta_ss`/`fecha_alta_ss`/`residente_5_anios` (atributos creados en Intercom hoy). Habrá que añadirlos al payload.
4. **Reglas de negocio de los bloques ②–⑥** (datos básicos, perfil, documentación, 030/149) — existen a nivel de esquema en la doc, pero las reglas finas no están cerradas.
5. **Identidad canónica del expediente** — candidata `email`/`UserId`/`recordId`, sin confirmar.
6. **Capacidades reales del andamiaje IA desactivado** en `beckham_bot` (si es reutilizable o descartable) — requiere inspección detallada nodo a nodo.

No se inventan reglas de negocio no documentadas.

---

## 4. Responsabilidad del agente

`[PROPUESTA]` (coherente con el reparto acordado y con `contexto_proyecto_beckham.md`)

El agente es el **gestor conversacional del expediente DESPUÉS del filtro**. El filtro F1/F2/F3 ya NO es suyo (vive en Intercom). Su misión:
- Conducir los bloques posteriores: **② datos básicos, ③ perfil, ④ enrutado (caso claro vs. complejo), ⑤/⑥ documentación y guía 030/149**.
- **Analizar** el caso con los datos del expediente y la conversación.
- **Consultar** información (expediente, documentos, contexto).
- **Validar** presencia/tipo de documentos.
- **Proponer** el siguiente paso y una respuesta al usuario, en **formato estructurado**.
- **Derivar a humano** cuando exceda sus límites.

**NO** decide elegibilidad F1/F2/F3 (ya resuelta) ni ejecuta escrituras directas: **propone**, y n8n persiste vía tools acotadas.

---

## 5. Punto de entrada y condiciones de invocación

`[PROPUESTA]`
- **Cuándo interviene**: solo tras **cualificación** en Intercom (rama H de `OnClick`: `Pass to n8n_BOT_mobility` → DC → `Webhook1` de n8n), o en turnos posteriores de un expediente ya cualificado.
- **Condiciones para invocarlo** (todas): `filtro_estado = cualifica`; existe `conversation_id`; identidad mínima resoluble (email o user_id); Airtable disponible.
- **No se invoca** si: el caso fue descartado (F1/F2/F3), el filtro está incompleto/abandonado, o falta identidad mínima → en esos casos, ruta de error o cierre sin agente.

---

## 6. Contrato de entrada

`[PROPUESTA]` — nombres provisionales; `DESCONOCIDO` donde no está confirmado.

| Campo | Origen | Oblig. | Tipo | Validación | Si falta | Fuente de verdad |
|---|---|---|---|---|---|---|
| `conversation_id` | Intercom (DC) | Sí | string | no vacío | error → no procesar | Intercom |
| `contact_id` | Intercom (DC `user_id`) | Sí | string | no vacío | error | Intercom |
| `expediente_id` (`recordId`) | Airtable (lookup) | No* | string `rec…` | patrón rec | crear si procede | Airtable |
| `user_email` | Intercom (DC `email`) | Sí | email | formato | derivar humano | Airtable (clave negocio) |
| `user_id` de negocio | Intercom `UserId`/`custom_data` | No | string | — | usar email | `DESCONOCIDO` |
| `alta_ss` (F1) | Intercom (atributo) | Sí | bool | true/false | error de contrato | Intercom→Airtable |
| `fecha_alta_ss` (F2) | Intercom (atributo Date) | Sí | date ISO | fecha válida | reintento/humano | Intercom→Airtable |
| `veredicto_plazo` | n8n (T3) | Sí | enum `en_plazo\|fuera_plazo` | ∈ enum | recalcular (T3) | n8n |
| `residente_5_anios` (F3) | Intercom (atributo) | Sí | bool | true/false | error | Intercom→Airtable |
| `filtro_estado` | Intercom | Sí | enum `cualifica\|descartado\|incompleto` | ∈ enum | no invocar | Intercom |
| `motivo_descarte` | Intercom | No | enum | ∈ enum descarte | — | Intercom |
| `mensaje_usuario` | Intercom (DC `last_conversation_part.body`) | Sí | string | — | pedir aclaración | Intercom |
| `historial` (mínimo) | Intercom (`Formatear_conversacion1`) | No | list | — | usar solo último | Intercom |
| `estado_expediente` | Airtable | No | enum (10 valores) | ∈ enum | asumir inicial | Airtable |
| `documentos_disponibles` | Airtable | No | list | — | lista vacía | Airtable |
| `documentos_pendientes` | Airtable/derivado | No | list | — | recalcular | Airtable |
| `partner` / `planService` / `forales` | Intercom (`custom_data`) | No | string | — | ignorar | Intercom |
| `event_id` | Intercom | Sí | string | único | rechazar dedupe | Intercom |
| `correlation_id` | n8n | Sí | string | — | generar | n8n |
| `prompt_version` | LangSmith/n8n | Sí | string | — | usar `prod` | LangSmith |
| `run_id` | n8n | Sí | string | — | generar | n8n |

\* `expediente_id` es obligatorio para *actualizar*, opcional para *crear*.

**Nota clave** `[DESCONOCIDO]`: los campos `alta_ss`, `fecha_alta_ss`, `residente_5_anios` requieren que el **Data Connector los incluya en el payload** (hoy no confirmado). Es una dependencia de diseño (ver §15).

---

## 7. Catálogo de tools

`[PROPUESTA]` — tools pequeñas, de responsabilidad cerrada y permisos mínimos. **Ninguna** puede modificar Airtable de forma genérica.

| # | Tool | Responsabilidad única | Input | Output | Sistema / Operación | Permisos mínimos | Idempotencia | Errores | Reintentos | No usar cuando | ¿Aprob. humana? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `get_expediente` | Leer 1 expediente por clave | email/recordId | expediente o null | Airtable / lectura | read tabla Expediente | n/a | 404, 429, timeout | transitorios: 3× backoff | — | No |
| 2 | `create_expediente` | Crear expediente si no existe | identidad + F1/F2/F3 | recordId | Airtable / creación | write campos identidad+filtro | clave negocio (email) | duplicado, 429 | no reintentar en 4xx | si ya existe (usar update) | No |
| 3 | `update_expediente` | Actualizar **campos permitidos** de 1 expediente | recordId + parche acotado | ok+versión | Airtable / actualización | write **lista blanca** de campos | recordId+hash parche | 404, conflicto, 429 | transitorios sí | campos legales/estado sensible | Según campo |
| 4 | `get_filtro_status` | Devolver F1/F2/F3 + veredicto | expediente/conversación | estado filtro | Airtable/Intercom / lectura | read | n/a | — | — | — | No |
| 5 | `get_conversation_context` | Contexto conversacional mínimo | conversation_id | último msg + resumen | Intercom / lectura | read conversación | n/a | 429, timeout | sí | — | No |
| 6 | `get_document_status` | Listar docs disponibles/pendientes | recordId | docs[] + faltantes[] | Airtable / lectura | read campos doc | n/a | 404 | sí | — | No |
| 7 | `validate_documents` | Validar presencia/tipo de docs | docs[] + requisitos | resultado validación | (lógica n8n) / lectura+cálculo | — | n/a | archivo ilegible | no | — | Si ilegible → humano |
| 8 | `register_pending_docs` | Marcar docs pendientes | recordId + lista | ok | Airtable / actualización acotada | write campo `documentos_pendientes` | recordId+lista | 429 | sí | — | No |
| 9 | `save_agent_result` | Guardar el análisis del agente | recordId + resultado JSON | ok+versión | Airtable / creación (append) | write tabla log/análisis | run_id | 429 | sí | — | No |
| 10 | `update_expediente_status` | Cambiar `estado_expediente` según máquina de estados | recordId + nuevo estado | ok | Airtable / actualización | write **solo** campo estado | recordId+estado+ts | transición inválida | no | estado sensible (concedido/parado) | Sí para sensibles |
| 11 | `prepare_intercom_reply` | Devolver `mensajeUsuario` a Intercom | texto | ok | n8n→Intercom (callback) / acción | — | conversation_id+step | 429, timeout | sí (idempotente) | — | No |
| 12 | `request_more_info` | Formular pregunta de dato faltante | campo faltante | reply estructurado | (salida) / lectura | — | n/a | — | — | — | No |
| 13 | `transfer_to_human` | Derivar el caso a persona | motivo + contexto | ok | Intercom/Airtable / acción | assign + tag + write estado | conversation_id+motivo | 429 | sí | — | Es la propia derivación |
| 14 | `register_transfer_reason` | Registrar motivo de derivación | recordId + código | ok | Airtable / actualización acotada | write campo motivo | recordId+run_id | — | sí | — | No |
| 15 | `register_error` | Registrar error para operación | contexto error | ok | Airtable/log / creación | write tabla errores | run_id+step | — | no (es el fallback) | — | No |
| 16 | `get_previous_run` | Recuperar ejecución anterior | correlation_id | run previo/null | log / lectura | read log | n/a | — | sí | — | No |
| 17 | `check_idempotency` | ¿esta acción ya se ejecutó? | idempotency_key | sí/no + resultado | ledger / lectura | read ledger | n/a | — | sí | — | No |

Principio: **1, 4, 5, 6, 16, 17** son de solo lectura; **2, 3, 8, 9, 10, 14, 15** escriben en campos acotados; **11, 13** son acciones externas idempotentes; **7, 12** son lógica/salida sin efecto externo.

---

## 8. Diseño conceptual de subworkflows

`[PROPUESTA]` — nombres provisionales. No se construyen.

| Subworkflow | Trigger interno | Input | Pasos conceptuales | Sistemas | Output | Ruta de error | Idempotencia | Reutiliza nodos actuales |
|---|---|---|---|---|---|---|---|---|
| `get_expediente` | Execute Workflow | email/recordId | normalizar clave → buscar en Airtable → mapear | Airtable | expediente/null | error→register_error | n/a (lectura) | **`Search records2`** (adaptar base/tabla) |
| `upsert_expediente` | Execute Workflow | identidad+parche | check_idempotency → get → decidir create/update → escribir → guardar external_id | Airtable+ledger | recordId+estado | error→DLQ | clave negocio + ledger | **`Existe_Expediente1`** + **`Crear_Expediente1`** |
| `get_conversation_context` | Execute Workflow | conversation_id | GET conversación → parsear/limpiar → resumir | Intercom | contexto | error→continuar con último msg | n/a | **`Traer_Conversacion_intercom1`** + **`Formatear_conversacion1`** |
| `get_document_status` | Execute Workflow | recordId | leer campos doc → derivar faltantes | Airtable | docs+faltantes | error | n/a | (nuevo) |
| `validate_documents` | Execute Workflow | docs+reqs | comprobar presencia/tipo | (n8n/Code) | validación | ilegible→humano | n/a | posible reuso de parseo de adjuntos de `Formatear_conversacion1` |
| `save_agent_result` | Execute Workflow | recordId+JSON | validar JSON → append log | Airtable | ok | error→DLQ | run_id | (nuevo; posible base en `crear_traza` desactivado) |
| `update_expediente_status` | Execute Workflow | recordId+estado | validar transición → escribir | Airtable | ok | transición inválida→error | recordId+estado | (nuevo) |
| `prepare_intercom_reply` | Execute Workflow | texto | POST callback `{data:{mensajeUsuario}}` | Intercom | ok | 429→retry | conversation_id+step | **`Callback_Intercom`** |
| `calcular_plazo_f2` (T3) | Execute Workflow | fecha_alta_ss | parsear fecha → +6m ≥ hoy → normalizar veredicto | (Code) | `en_plazo\|fuera_plazo` | no parseable→reintento | determinista | **`Calcular_Plazo_F2`** (reuso directo) |
| `transfer_to_human` | Execute Workflow | motivo+contexto | assign + tag + estado + resumen | Intercom+Airtable | ok | error→DLQ | conversation_id+motivo | posible base en `Transferir_humano` desactivado |
| `register_error` | Execute Workflow | contexto | escribir tabla errores | Airtable/log | ok | — | run_id+step | (nuevo) |
| `check_idempotency` | Execute Workflow | key | leer ledger | ledger | sí/no | — | n/a | (nuevo) |

---

## 9. Salida JSON estructurada

`[PROPUESTA]` — el agente devuelve **solo** este JSON; n8n no interpreta texto libre.

```json
{
  "schema_version": 1,
  "run_id": "run_...",
  "correlation_id": "cor_...",
  "analysis_status": "ok | incomplete_info | needs_human | error",
  "next_action": "reply | ask_more_info | persist_and_reply | transfer_human | wait",
  "reply_to_user": "texto para mostrar (o null)",
  "data_to_persist": {
    "expediente_id": "rec... | null",
    "fields": { "<campo_lista_blanca>": "<valor>" }
  },
  "pending_documents": ["contrato_trabajo", "..."],
  "human_review": {
    "required": false,
    "reason_code": "null | contradiccion | falta_datos | doc_ilegible | fuera_de_reglas | error_integracion | riesgo_respuesta | solicitud_usuario | accion_irreversible | conflicto_intercom_airtable"
  },
  "error": {
    "is_error": false,
    "recoverable": true,
    "message": "null | descripción segura"
  },
  "idempotency_key": "..."
}
```

**Obligatorios**: `schema_version`, `run_id`, `analysis_status`, `next_action`, `human_review.required`, `error.is_error`.
**Opcionales**: `reply_to_user`, `data_to_persist`, `pending_documents`, `error.message`.
**Validaciones**: enums cerrados; `data_to_persist.fields` **solo** claves de lista blanca; si `next_action=transfer_human` ⇒ `human_review.required=true` y `reason_code≠null`; `reply_to_user` requerido si `next_action∈{reply, ask_more_info, persist_and_reply}`.

**Ejemplo válido (avanza)** — anonimizado:
```json
{ "schema_version":1,"run_id":"run_001","correlation_id":"cor_001",
  "analysis_status":"ok","next_action":"ask_more_info",
  "reply_to_user":"¿Me indicas tu NIF/NIE o número de pasaporte?",
  "data_to_persist":{"expediente_id":"rec_demo_001","fields":{"estado_expediente":"pendiente de datos del usuario"}},
  "pending_documents":["contrato_trabajo"],
  "human_review":{"required":false,"reason_code":null},
  "error":{"is_error":false,"recoverable":true,"message":null},
  "idempotency_key":"rec_demo_001:ask_nif:run_001" }
```

**Ejemplo derivación humana** — anonimizado:
```json
{ "schema_version":1,"run_id":"run_002","correlation_id":"cor_002",
  "analysis_status":"needs_human","next_action":"transfer_human",
  "reply_to_user":"Voy a pasarte con una persona del equipo para revisar tu caso 🙌",
  "data_to_persist":{"expediente_id":"rec_demo_002","fields":{"estado_expediente":"pendiente de hacer por tax down"}},
  "pending_documents":[],
  "human_review":{"required":true,"reason_code":"doc_ilegible"},
  "error":{"is_error":false,"recoverable":true,"message":null},
  "idempotency_key":"rec_demo_002:transfer:run_002" }
```

**Si la salida NO valida** `[PROPUESTA]`: n8n **no** persiste; reintenta 1 vez pidiendo al modelo el formato correcto; si vuelve a fallar → `register_error` + `transfer_to_human` (reason `riesgo_respuesta`) + reply de cortesía. Nunca ejecutar acciones a partir de texto libre.

---

## 10. Límites y guardarraíles

`[PROPUESTA]`

**Puede:** consultar información necesaria · analizar el caso · proponer respuesta · pedir datos faltantes · preparar una actualización estructurada (lista blanca) · recomendar derivación humana.

**No debe:** inventar datos · alterar F1/F2/F3 ya resueltos sin regla explícita · modificar campos de Airtable fuera de la lista blanca · borrar registros · cerrar casos sensibles sin control · publicar cambios en Intercom por su cuenta · ejecutar pagos · modificar credenciales · alterar workflows · tomar decisiones jurídicas no contempladas · ocultar errores · reintentar indefinidamente · procesar dos veces la misma acción externa.

**Sin información suficiente** ⇒ `analysis_status = "incomplete_info"` explícito (no adivina).

---

## 11. Multi-turno y persistencia

`[PROPUESTA]`
1. **Localizar expediente**: `get_expediente` por clave de negocio (email normalizado; alternativa `UserId`).
2. **Identificador de enlace Intercom↔n8n↔Airtable**: `conversation_id` (correlación conversacional) + clave de negocio (email) para el expediente; `recordId` para updates.
3. **Qué se guarda por turno**: solo el **delta** (campos nuevos/cambiados) + resultado del análisis en log; no el historial completo.
4. **No duplicar**: no reescribir campos ya confirmados por humano; usar lookups/derivados en vez de copiar.
5. **Contexto mínimo**: último mensaje + estado del expediente + docs; resumen corto, no todo el hilo.
6. **Evitar reenviar el historial**: `get_conversation_context` resume; se envía resumen, no transcripción íntegra.
7. **Respuesta nueva vs. evento repetido**: dedupe por `event_id` (+ `conversation_part.id`).
8. **Conversación reabierta**: buscar expediente existente y **continuar desde su estado**, no reiniciar.
9. **Hueco de `reuse_mobility`**: al entrar por "cualquier mensaje", n8n hace `get_expediente`; si existe y está cualificado, continúa el bloque pendiente; si no existe/no cualificado, deriva a iniciar el filtro (o a humano). Así el filtro no se salta silenciosamente.
10. **Airtable no disponible**: no crear estado inconsistente; responder mensaje de espera, `register_error`, y reintento/replay diferido.
11. **Expediente duplicado**: vista de duplicados + preferir el más reciente/completo; marcar conflicto → humano.
12. **Evento antiguo tras uno reciente**: comparar `occurred_at`; descartar el atrasado si pisaría estado más nuevo.

---

## 12. Idempotencia y recuperación

`[PROPUESTA]`
- **Clave de idempotencia**: `event_id` de Intercom (dedupe de reentrega) + clave de negocio para el upsert + `idempotency_key` compuesta por operación (`recordId:accion:run_id`).
- **Ledger de ejecuciones**: `event_id`, `estado` (`processing|succeeded|failed`), `external_id`, `occurred_at`, `attempt`.
- **Patrón**: `check_idempotency` → si `succeeded`, devolver resultado previo (no repetir efecto) → si nuevo, marcar `processing` → ejecutar → guardar `succeeded`+external_id.
- **Efecto ejecutado, confirmación perdida**: upsert idempotente + external_id persistido ⇒ el reintento reconcilia sin duplicar.
- **No prometer "exactly once"**: efectos **efectivamente una vez** con dedupe + reconciliación.

---

## 13. Derivación humana

`[PROPUESTA]`

| Motivo | Código | Acción del agente | Estado Airtable (propuesto) | Acción futura Intercom | Info al humano |
|---|---|---|---|---|---|
| Información contradictoria | `contradiccion` | transfer_human | pendiente de hacer por tax down | assign + nota | qué campos chocan |
| Falta de datos obligatorios | `falta_datos` | primero `ask_more_info`; si persiste, transfer | pendiente de datos del usuario | assign | qué falta |
| Documento ilegible/no reconocido | `doc_ilegible` | transfer_human | pendiente de hacer por tax down | assign | doc afectado |
| Caso fuera de reglas | `fuera_de_reglas` | transfer_human | parado | assign | resumen caso |
| Error persistente de integración | `error_integracion` | register_error + transfer | parado | assign | log/execution id |
| Riesgo de respuesta incorrecta | `riesgo_respuesta` | transfer_human | pendiente de hacer por tax down | assign | motivo |
| Usuario pide atención humana | `solicitud_usuario` | transfer_human | pendiente de hacer llamada | assign | petición literal |
| Acción irreversible | `accion_irreversible` | NO ejecutar; transfer | pendiente de confirmación del usuario | assign | acción propuesta |
| Conflicto Intercom↔Airtable | `conflicto_intercom_airtable` | transfer_human | parado | assign | ambos valores |

`transfer_to_human` siempre: assign a cola humana + tag + estado + resumen. **Nunca** cierra casos sensibles por su cuenta.

---

## 14. Dependencias con Airtable

`[PROPUESTA/DESCONOCIDO]`
- Requiere `get_expediente` / `upsert_expediente` operativos ⇒ reactivar y configurar `Search records2` / `Crear_Expediente1` (base/tabla reales) — **T6**.
- Confirmar mapeos (T5): **F3 → `residente_5_anios`** y **descarte → `motivo_descarte`** (single-select: `plazo_vencido·residente_5_anios·sin_alta_ss·incompleto·otro`). `[INFERENCIA sobre el CSV nuevo]`
- Definir **lista blanca** de campos escribibles por el agente (vs. campos legales/estado sensibles solo-humano).
- Clave de negocio única (email normalizado) + vista de duplicados.

## 15. Dependencias con Intercom

`[PROPUESTA/DESCONOCIDO]`
- El **Data Connector** debe incluir en el payload los **atributos de filtro** (`alta_ss`, `fecha_alta_ss`, `residente_5_anios`, `veredicto_plazo`, `motivo_descarte`) para que el agente los reciba. **Hoy no confirmado** que los envíe.
- El paso **"Reply"** en `n8n_BOT_mobility` (hecho hoy) es el canal por el que el agente comunica (`mensajeUsuario`).
- `transfer_to_human` usa assign/tag de Intercom; respetar `jarry_ignore`.

## 16. Dependencias con F2 y `Calcular_Plazo_F2`

`[PROPUESTA]`
- **T3** reutiliza `Calcular_Plazo_F2` como subworkflow `calcular_plazo_f2` → devuelve `en_plazo|fuera_plazo`.
- **T4** (Intercom) sustituye los botones placeholder de F2 por una rama automática que consume ese veredicto (vía atributo del DC o callback).
- **Este nodo NO se borra en T1** — se conserva/reutiliza. Es la primera entrada del mapa de impacto.

---

## 17. Mapa de impacto sobre T1

`[HECHO — inventario por inspección MCP de hoy]` + `[PROPUESTA — categoría]`. Basado en los nodos del Bloque ① de `beckham_bot`.

| Nodo | Función actual | Categoría | Evidencia | Dependencias | Riesgo si se elimina | Acción futura |
|---|---|---|---|---|---|---|
| `Filtro_Eliminatorio1` (Switch) | Enruta por `pregunta_pendiente` F1/F2/F3 | **ELIMINAR** | filtro ahora en Intercom | recibe de `Determinar_Pregunta_Pendiente1` | ninguno (obsoleto) | borrar en T1 |
| `Determinar_Pregunta_Pendiente1` (Code) | Decide siguiente pregunta | **ELIMINAR** | específico del filtro | — | ninguno | borrar |
| `Interpretar_F1` (Code) | Sí/No alta SS | **ELIMINAR** | filtro en Intercom | — | ninguno | borrar |
| `Interpretar_F3` (Code) | Sí/No residencia | **ELIMINAR** | filtro en Intercom | — | ninguno | borrar |
| `Ruta_F1/F2/F3` (Switch) | avanza/descarta/reintento | **ELIMINAR** | filtro en Intercom | — | ninguno | borrar |
| `Set_F1/F2/F3_*` (10 Set) | textos de pregunta/descarte | **ELIMINAR** | textos ahora en Intercom | — | ninguno | borrar |
| `Set_Fallback_continuar` | mensaje "completo" | **ELIMINAR** | ligado al Switch | — | ninguno | borrar |
| `Enviar_F1_Inicial` (Set) | texto F1 inicial | **ELIMINAR** | F1 ahora en Intercom | — | ninguno | borrar |
| `Converger_Bloque1` (NoOp) | junta ramas del filtro | **ELIMINAR** | punto de convergencia del filtro | alimenta `Callback_Intercom` | reconectar salida antes | borrar tras recablear |
| **`Calcular_Plazo_F2` (Code)** | fecha+6m ≥ hoy | **REUTILIZAR** | lógica de negocio válida | usada por T3/T4 | perder cálculo de plazo | → subworkflow `calcular_plazo_f2` |
| **`Formatear_conversacion1` (Code)** | parseo conversación + adjuntos | **REUTILIZAR** | útil como contexto del agente | Webhook→…→ | perder parseo | → `get_conversation_context` |
| **`Traer_Conversacion_intercom1` (HTTP)** | GET conversación | **REUTILIZAR** | contexto | credencial Intercom | perder fetch | → `get_conversation_context` |
| **`Existe_Expediente1` (If)** | ¿existe expediente? | **REUTILIZAR** | base de upsert | Airtable | perder lógica get | → `upsert_expediente` (corregir bug `leftValue "id"`) |
| **`Search records2` (Airtable, off)** | buscar expediente | **REUTILIZAR** | placeholder de lectura | base/tabla vacías | — | → `get_expediente` (T6) |
| **`Crear_Expediente1` (Airtable, off)** | crear expediente | **REUTILIZAR** | placeholder de creación | base/tabla vacías | — | → `upsert_expediente` (T6) |
| **`Callback_Intercom` (HTTP)** | POST `{data:{mensajeUsuario}}` | **REUTILIZAR** | canal de respuesta | token callback | perder canal | → `prepare_intercom_reply` |
| `Webhook1` | entrada (DC) | **CONSERVAR** | punto de entrada n8n | DC | romper entrada | mantener |
| `If2` / `Wait2` | debounce | **CONSERVAR** | infra anti-duplicados | — | dobles ejecuciones | mantener/revisar |
| Andamiaje IA superior **desactivado** (`Agente_conversacional`, `OpenAI Chat Model`/`1`, `Determinar_usuario`, tools `Validar_documentacion`/`Validador_API`/`Transferir_humano`/`Guardar_resumen_airtable`/`Reenvio_Checkout`, `Responder_Intercom`/`1`, `crear_traza`, `Snooze_Intercom`, `Nota_Snooze`, `Wait1`, `Detectar Tipo Usuario`, `Call 'Gestionar_conversacion'`, `Code in JavaScript`, Sticky Notes) | Bloques de otros usos / posible base del agente | **CONSERVAR / REVISAR** | fuera de alcance por regla | desconocidas | podría perderse base del agente | **NO tocar en T1**; revisar en fase de agente |

## 18. Nodos que podrían eliminarse

`[PROPUESTA]` (categoría ELIMINAR de §17): `Filtro_Eliminatorio1`, `Determinar_Pregunta_Pendiente1`, `Interpretar_F1`, `Interpretar_F3`, `Ruta_F1`, `Ruta_F2`, `Ruta_F3`, los 10 `Set_F*`, `Set_Fallback_continuar`, `Enviar_F1_Inicial`, `Converger_Bloque1` (tras recablear su salida). **Solo tras aprobación y con recableado de `Callback_Intercom`.**

## 19. Nodos que deben conservarse o reutilizarse

`[PROPUESTA]`: `Calcular_Plazo_F2`, `Formatear_conversacion1`, `Traer_Conversacion_intercom1`, `Existe_Expediente1`, `Search records2`, `Crear_Expediente1`, `Callback_Intercom`, `Webhook1`, `If2`, `Wait2`, y **todo el andamiaje IA desactivado de arriba** (no tocar; revisar como posible base del agente).

---

## 20. Riesgos y decisiones pendientes

| # | Riesgo / decisión | Impacto | Mitigación |
|---|---|---|---|
| R1 | El DC no envía los atributos de filtro | Alto | Confirmar/añadir al payload del DC (§15) |
| R2 | Borrar `Converger_Bloque1`/`Callback_Intercom` sin recablear rompe la respuesta | Alto | Recablear antes; T1 tras T3/T4 |
| R3 | Tool genérica de escritura en Airtable | Alto | Lista blanca por tool; prohibido update genérico |
| R4 | Andamiaje IA desactivado: ¿reusar o rehacer? | Medio | Revisar nodo a nodo en fase de agente; no tocar en T1 |
| R5 | Clave de negocio no definida → duplicados | Alto | Fijar email normalizado + vista duplicados (T5/T6) |
| R6 | Salida del agente no válida | Medio | Esquema estricto + reintento + humano |
| D1 | ¿Qué campos van en la lista blanca del agente? | — | Decidir con Paula/Iciar (T5) |
| D2 | ¿Dónde se guarda el ledger de idempotencia? | — | Airtable a baja escala o almacén externo |
| D3 | ¿El agente usa el andamiaje existente o uno nuevo? | — | Tras revisar §17 |

## 21. Plan de implementación futuro

`[PROPUESTA]` (no se ejecuta)
1. **T5** auditar CSV/Airtable → cerrar diccionario + lista blanca + clave de negocio.
2. **T3** subworkflow `calcular_plazo_f2` (reuso de `Calcular_Plazo_F2`).
3. **T4** cerrar F2 en Intercom con rama automática.
4. **T6** `get_expediente` + `upsert_expediente` idempotentes (reactivar Airtable).
5. Subworkflows de contexto/documentos/respuesta (`get_conversation_context`, `get_document_status`, `prepare_intercom_reply`).
6. Definir prompt + tools del agente (con Paula) + salida JSON + LangSmith (dataset/eval).
7. `transfer_to_human` + tabla de errores/ledger.
8. **T1** limpieza de nodos ELIMINAR (tras recablear) — con OK.
9. Pruebas en TEST → e2e → (con OK) publicar.

## 22. Criterios de verificación

`[PROPUESTA]`
- Cada tool tiene responsabilidad cerrada y permisos mínimos; ninguna hace update genérico.
- Toda escritura futura tiene clave de idempotencia.
- La salida del agente valida contra el esquema; si no, no se persiste.
- Un `event_id` duplicado no crea segundo registro.
- Un evento antiguo no pisa estado más nuevo.
- `reuse_mobility` no permite saltarse el filtro silenciosamente.
- La derivación humana tiene código, estado y contexto para la persona.
- Ningún nodo desactivado superior se toca en T1.
- `Calcular_Plazo_F2` y la lógica reutilizable se conservan antes de cualquier borrado.

## 23. Acciones expresamente no realizadas

Durante esta sesión **no** se: modificó Intercom · publicó ningún borrador · tocó `OnClick Mobility` ni `n8n_BOT_mobility` · sustituyeron los botones de F2 · modificó n8n · borró ningún nodo · creó subworkflows · ejecutó workflows/nodos · enviaron webhooks · modificó Airtable · escribieron registros · implementó el agente · conectaron tools · cambiaron credenciales · desplegó nada · hicieron commits. Solo se creó este documento de planificación y se actualizó la memoria del proyecto.
