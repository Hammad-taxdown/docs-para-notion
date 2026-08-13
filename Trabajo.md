# Trabajo — Bot Beckham (n8n) · Bitácora

Bitácora de trabajo del proyecto de automatización del régimen Beckham (Intercom + n8n + Airtable).
Se actualiza en cada sesión/tarea. Contexto completo en `contexto_proyecto_beckham.md`.

Gestión de tareas vía Orchestron (`.orchestron/`). Estado: `python3 .../orchestron/scripts/state.py status`.

---

## 🔴 RETOMAR AQUÍ — sesión del 2026-07-30 (mañana). Este bloque manda sobre el del 29/07

> **Cero cambios en sistemas.** Todo MCP fue de solo lectura. Lo escrito: 4 ficheros nuevos en el repo.
> Nada publicado, nada activado, nada modificado en Intercom, n8n ni Airtable.

### Estado verificado por MCP (solo lectura, 30/07 ~10:15 CEST)

| Elemento | Estado real | Evidencia |
|---|---|---|
| `beckham_bot` | `active:true` · `versionId == activeVersionId == aa19146c-32a9-4ef4-99b4-b172685985a9` · `updatedAt 2026-07-28T17:39:45Z` · 40 nodos | n8n `nhOwpiGxikeU5DLR` |
| Borrador pendiente | **No hay.** Nadie ha tocado nada desde el 28/07 | `versionId == activeVersionId` |
| Ejecuciones de `beckham_bot` | Última **28/07 18:45:38Z**. Cero el 29/07 y cero el 30/07 | n8n |
| `Validar y Normalizar` | Empieza literal en `const body = $input.first().json.body || {};` · **cero `JSON.parse`** | código citado por MCP |
| Nodo Airtable | `matchingColumns:["UserId"]` · `typecast:true` · `onError:null` · `retryOnFail:null` · `settings` sin `errorWorkflow` | MCP |
| Airtable | 2 tablas · los 6 campos del bot existen · `Noresidenteultimosanios` no existe | MCP schema |

### 🔥 HECHOS VERIFICADOS NUEVOS del 30/07

1. **El 29/07 a las 15:27 y 15:28 UTC (17:27/17:28 CEST) hubo DOS conversaciones REALES no-Preview**
   (`215475274782617`, `215475274794187`), lanzadas por el propio usuario desde el launcher, y **las dos
   nacieron con `ticket: null`**. El síntoma de WP-10 **no se reprodujo**.
   **Matiz que impide cantar victoria:** en las dos nadie contestó el quick-reply →
   `user_became_idle` + `close` a los 3 min por `user_inactivity_conversation_autoclosed`, y cero
   ejecuciones en n8n. **No prueban nada sobre el turno 2**: solo que el ticket no se crea al nacer.
   ⇒ **WP-10 cambia de método: reproducir primero, desactivar después.**
2. **Deuda no registrada hasta hoy:** el nodo `Airtable Upser Expediente` mapea **los 9 campos siempre**
   por expresión (`={{ $json.fields.X }}`), no solo los presentes. Los ausentes llegan como `undefined`.
   Con `typecast:true`, es la incógnita técnica nº8 y **hasta medirla hay que asumir que pisa**.
3. **Contradicción documental:** `INTERCOMDOC.md` §2 afirma que el DC manda `application/json` y que
   "confirmado que nuestro DC lo lleva"; las ejecuciones `8052012`/`8052018` dicen `urlencoded`. Uno de
   los dos está mal. Se arregla en n8n (decisión N1), y el DC se revisa cuando se abra por otro motivo.
4. **Formato real del `user_id`** (aportado por el usuario): `eu-west-1:<uuid>`, p. ej.
   `eu-west-1:0dc0b2b7-…`. Permite validar **forma**, no solo "no vacío" → mejora la guarda de WP-205.

### ✅ 46 DE 47 DECISIONES CERRADAS — `DECISIONES-ABIERTAS-2026-07-30.md`

Fichero con las 47 preguntas desarrolladas, respondidas por el usuario. Solo **N6** quedó en blanco
(pedir a Fer que archive el ticket type `Prueba Fer`). Las que **cambian el plan**:

- **M1 · recordatorios:** los construimos, **pero la automatización VIVE EN AIRTABLE** y la montan Alina
  e Iciar. Nuestro alcance: que el dato llegue de Intercom a Airtable. ⇒ **`WP-230` CANCELADO** (era L).
  Un lead potencial es **tanto quien dice "todavía no" como quien da una fecha aproximada**: los dos se
  guardan.
- **M2:** dueño = equipo `Ops_Mobility`; los follow-up automatizados en Airtable.
- **M3:** no es promocional (son clientes que pagan). **Sin opt-in como puerta**; el mensaje cierra con
  "te iremos avisando cuando se acerque tu plazo". Retención: fecha aprox + 6 meses; sin fecha, aviso
  cada 1-2 meses. ⚠️ **Pendiente: ponerle tope de intentos** — "cada 1-2 meses" sin fin no es publicable.
- **M4 · corpus fiscal:** **es el System Prompt** que escriben Paula, Alina e Iciar; ya hay v1 en uso.
  ⇒ `WP-220` pasa de L bloqueado a S desbloqueado y **desaparece la tool `buscar_contexto_fiscal`**
  (sin RAG, sin vector store). **Es lo que libera el camino crítico**, que baja de peso 16 a 14.
- **M5 = (a):** dos nodos `AI Agent`, mismo modelo (`David Beckham`) y mismo `prompt_base`; al de FAQ no
  le llega el cable de escritura. Son **dos nodos ejecutores del mismo agente**, no dos agentes.
- **M6 = (a)** con el plazo exacto pendiente (full VIP tiene trato más rápido).
- **U1 = (a)** prerrequisitos primero. **U2:** sonda autorizada, con la cuenta del usuario (todo en TEST).
- **U3:** para acceder al trámite **hay que estar logueado y ser full VIP** ⇒ el `user_id` existe siempre.
  No hay clave sintética: el 400 se mantiene pero pasa a ser **señal de bug con alerta**.
- **U4 = (b)** "no creo que cumpla" deja de ser terminal. **U5 = email.** **U7 = (a)** WP-07 entra.
- **U6 · notas amarillas APORTADAS POR ESCRITO** (ya no es dato faltante): (1) calculadora de Alina →
  enlace, pendiente no urgente, no se sabe dónde vive; (2) FAQ → flag + no preguntar datos personales +
  volver al flujo con botón "No, quiero comprobar si cuento con los requisitos" + **triaje de tono**
  (insultos, mayúsculas, repetición condescendiente → `Ops_Mobility`); (3) fecha prevista → "CUIDADO CON
  LOS ATRIBUTOS a ver si rompemos otra vez el Data Connector".
  ⚠️ **"Volver al path B" NO es implementable literal** (no hay GOTO en Intercom): el botón se queda, pero
  se **relanza** el bloque de filtros, no se reanuda.
- **T5:** de acuerdo con reproducir antes de desactivar. El usuario **tiene permisos para desactivar en
  TEST**. Sospecha suya: otro workflow de Intercom que sigue activo porque el equipo prueba cosas en test.
- **T8 = (a):** medir ya si el `undefined` pisa, pegado a WP-201.
- **N1 = (a):** parseo defensivo en n8n, no en el DC.
- **N2:** las 4 filas de prueba se quedan (sirven para la presentación como "cómo estaba el proyecto").
- **N4:** las dos conversaciones del 29/07 las lanzó el usuario → **sin contaminación**.
- **N5:** `distribuidor - usuario envia mensaje` lo pausó él; dice que da igual porque está en test.
  ⚠️ **Aviso emitido: si reparte los mensajes entrantes, el turno 2 fallará por eso y no por el ticket
  → dos variables en la misma prueba. Es la precondición nº1 de la sonda.**
- **N7:** va a desactivar el correo del `Submitted`; se le dieron 3 sitios donde buscarlo (no verificados
  en UI): ticket type `Prueba Fer` → estados · Channels/Email → plantillas · Workflows Live.
- **N8:** todo se monta en TEST y luego se pasa a producción.
  ⚠️ **Aviso emitido: "es test" vale para Intercom, no para Airtable — la base es la real, con datos de
  empleados reales. `WP-203` no es cosmética.**
- **N9:** workflow de errores **nuevo desde cero** (no reutilizar `Notificaciones_error`). Sistema →
  Slack; negocio (documentación inválida, dato no interpretable, caso complejo) → email.
- **N10 + N14.2 · ALCANCE NUEVO:** el agente marca `AplicaBeckham`, **evalúa la complejidad del caso
  desde los inputs (lo hace el prompt, no una regla)**, y **rellena los modelos 030 y 149**; al final, un
  **PDF-resguardo** al usuario con sus datos y sus obligaciones fiscales. **P1 = entra en Fase 2.**
  **P2 = (a)+(c):** se propone el campo `complejidad_caso`, lo evalúa el prompt, y el esquema final lo
  aprueban Alina e Iciar. ⇒ **3 WP nuevos: `WP-234`, `WP-235`, `WP-236`.**
  ⚠️ **Aviso emitido: los 030/149 tocan campos que ya gobierna otro proceso** (`Borrador030`,
  `Borrador149`, `Estado030149`, `Modificacion M030/M149`, `LinkFormulario030149`) → segundo escritor.
- **N11:** español e inglés, con aviso en el mensaje inicial de que puede escribir en inglés.
- **N12 = (a):** el `email` llega de Intercom, se añade como People attribute sin fallback.
- **N13 = (a):** trazabilidad solo en pruebas. Los datos personales no son problema: cuentas de empresa.
- **N14.1 = (c):** consultar Airtable primero y preguntar solo lo que falte.
- **N15:** **`WP-11` se fusiona con `WP-223`** — el triaje es enrutar al FAQ y detectar el tono.
- **N16:** `jarry_ignore` sigue siendo obligatorio. Ventana para conversaciones reales: **hoy por la tarde**.
- **T11/T14/T15/T16:** costes fuera de la discusión técnica → se pidió un **estudio de mercado** para la
  presentación del 31/07. **T13:** live pero en entorno TEST. **T17:** apuntado y aparcado.

### 📦 Entregables creados hoy (4 ficheros, ninguno toca sistemas)

1. **`DECISIONES-ABIERTAS-2026-07-30.md`** — las 47 preguntas desarrolladas + las respuestas del usuario.
2. **`docs/prds/fase2/map.html`** — mapa único con **los 47 WP**: `WP-01…11` + `WP-201…233` +
   `WP-234/235/236` nuevos, en **8 olas de rápido-de-quitar a complejo**, con arquitectura, pasos
   concretos y criterio de verificación por WP. Paleta TaxDown, fondo blanco.
   **`docs/prds/map.html` y `ROADMAP.md` NO se han tocado.**
3. **`RUNBOOK-2026-07-30.md`** — WP-201 como acción atómica (código exacto, qué no publicar, rollback),
   la parada de aprobación, la sonda paso a paso y el método corregido de WP-10.
4. **`scripts/contract-test.sh`** — 5 curls de WP-201 + 2 de T8. Ejecutable, sintaxis verificada, no
   borra nada. Los `UserId` de prueba usan la forma real terminada en `ct01`/`ct08`.
5. **`ESTUDIO-COSTES-2026-07-30.md`** — precios verificados de OpenAI, Intercom, n8n y Airtable con
   fuente y fecha; coste por conversación en 3 modelos; **el hallazgo: no usar Fin ahorra ≈950–9.950 $/año
   a 1.000 clientes** (Fin cobra 0,99 $/resolución y **9,99 $/lead qualification**, que es exactamente lo
   que hace este bot); el techo que no se puede comprar son los **5 req/s por base** de Airtable.
   **DATO NO DISPONIBLE declarado:** no hay estadística pública de modelos 149 presentados.

### Estimación de calendario (PROPUESTA, no compromiso)

Tres hitos, en vez de "1 mes" vs "2 semanas" (que estiman proyectos distintos):
**7/08 el bot guarda** (cañería cerrada, ~7 días laborables, verificable por curl) · **28/08 MVP
conversacional** sin documentos, condicionado a vacaciones de agosto y a `WP-10` · **octubre alcance
completo** con los 030/149 como bloque aparte. Riesgo nº1: si `T1` sale mal esta tarde, la ola del modo
se rediseña (+1 semana). Riesgo nº2: **cinco bloqueos dependen de otras personas** en agosto.

### Lo primero al retomar
1. WP-201 (código exacto en el runbook) → `./scripts/contract-test.sh` → **parada de aprobación** antes de publicar.
2. `--t8` y leer la fila por MCP para cerrar la incógnita nº8.
3. Precondición del distribuidor → sonda → WP-10, por la tarde.

---

## 🔴 RETOMAR AQUÍ — sesión del 2026-07-29 — HISTÓRICO, ver bloque de arriba

> Solo hechos verificados. Nada publicado, nada activado, nada modificado en Intercom, n8n ni Airtable.
> Council de la Fase 2: entregas en el scratchpad de la sesión (`council-A1..A5.md`, `COUNCIL-SINTESIS.md`).

### Snapshot verificado por MCP (solo lectura) — 2026-07-29

| Elemento | Estado real | Evidencia |
|---|---|---|
| `beckham_bot` | `active: true`, 2 triggers, última ejecución **28/07 18:45:38 UTC** | n8n `nhOwpiGxikeU5DLR` |
| Ejecuciones el 29/07 | **cero** | n8n |
| Conversaciones el 29/07 | **una sola, y es Preview** (`Workflow: Preview: true`) → sin valor probatorio | Intercom |
| Última conv. no-Preview | `215475263900223`, 28/07 ~20:05 → **`Ticket category: Customer ticket`, `state: submitted`** | Intercom |
| Convs. que funcionaron | `215475260478265`, `215475261729464` → `ticket: null` | Intercom |
| `beckham_get_expediente` | `active: false`, `triggerCount: 0` → WP-07 sigue abierto | n8n `PAGK9sof3bfTdbRB` |
| `distribuidor - usuario envia mensaje` | **no existe en n8n**: es un workflow de **Intercom**. Su estado live/paused no lo expone la API pública | búsqueda n8n = 0 resultados |

**Conclusión: el bloqueo de WP-10 sigue exactamente donde quedó, y no hay evidencia nueva de hoy.**

### 🔥 HECHO VERIFICADO NUEVO — el fix de CONTENT-TYPE nunca se aplicó (bloqueo por delante de WP-10)

Confirmado por **dos agentes de forma independiente**, citando el código del nodo:
`Validar y Normalizar` (en `beckham_bot`) empieza con `const body = $input.first().json.body || {};`
y decide sobre `body.user_id` / `body.intercom_conversation_id`. **No hay ni un `JSON.parse` en
ningún nodo Code del workflow.** Con el DC mandando `application/x-www-form-urlencoded` y el JSON
**como clave** del body, `body.user_id` es `undefined` → `Respond Error`.

**Impacto:** hoy fallan **las 4 ramas de WP-06** y también `LEAD`/`PERSIST` de la Fase 2. Es el
arreglo más barato y el que más desbloquea → **va antes de WP-10**.

Matiz aportado por el agente de tools: es un problema del **borde del Data Connector**, no del
agente. Montadas como `Call n8n Workflow Tool` sobre un `upsert_expediente` extraído, el
content-type no las afecta.

### 🔥 HECHOS VERIFICADOS NUEVOS — el agente de WP-09 tiene defectos que no eran conocidos

1. **El `systemMessage` del `AI Agent` NO es expresión** (no empieza por `=`) → `{{contexto}}`,
   `{{current_date}}` y `{{user_plan_tax_return}}` **llegan literales al modelo**. El agente no sabe
   qué día es hoy, y habla de un plazo improrrogable.
2. **El prompt nombra tres tools que no existen** (`guardar_datos_airtable`, `agendar_llamada`,
   `transferir_humano`) → el agente **promete acciones que nadie ejecuta**. Efecto colateral grave:
   hace **indistinguible** un fallo de allowlist de una alucinación.
3. El prompt se contradice: usa HTML para negritas y termina con "texto plano, sin HTML ni Markdown"
   → explica el defecto de las etiquetas literales parcheado el 28/07 en el callback.
4. **`Mensaje_fallback` dice "un compañero te escribirá" y solo llama a `Callback_Intercom`**:
   **nadie asigna a un humano**. Promesa falsa.
5. El `AI Agent` vivo tiene **cero conexiones `ai_tool`**; las 5 `toolWorkflow` están `disabled` y
   cuelgan del viejo `Agente_conversacional`. Coste de migración del aislamiento: **cero**.
6. Sin `maxIterations` ni `returnIntermediateSteps` → cero trazabilidad de llamadas a tools.
   El sub-nodo de modelo se llama **`David Beckham`**, no `OpenAI Chat Model2`.
7. `Webhook1` es POST **sin autenticación** → cualquier `modo` que llegue en el body es
   falsificable. El modo debe derivarse **server-side** desde `Traer_Conversacion_intercom1`.

### 🔥 HECHOS VERIFICADOS NUEVOS — Airtable (base `app5K8OnSObqwWweS`)

- La base tiene **solo 2 tablas**: `Empleados` (`tblTWCWu5nQXNOMR1`) y `Checkout`.
- **La vista "Leads potenciales" NO EXISTE.** La contrapropuesta aprobada por el Council del 28/07
  **nunca se implementó**. Solo hay `Grid view` + 4 vistas *form*.
- **Ningún campo de fecha tiene hora**: los tres son date-only → hoy es imposible programar un envío
  con precisión horaria.
- `Descarte` ya incluye `Otro/Incompleto` → **corrige WP-02**, que lo daba como pendiente.
- `recSop5rTn99Qft0o` es `lead_potencial=true` **sin `UserId`** → ese lead ya es irrecuperable por la
  clave de upsert. 3 de 6 filas sin `UserId`.
- Confirmado: `typecast:true`, `matchingColumns:["UserId"]`, `retryOnFail:null`, `settings` **sin**
  `errorWorkflow`. Existe `Notificaciones_error` (`TXVWRUzc1G5HXHjZ`, active) → enchufarlo es
  configuración, no construcción.

### ✅ CORRECCIONES a la bitácora (deuda que ya no aplica)

- **`Respond OK` YA está recortado** a `{ok, action, record_id}`. La línea de "68 campos con PII"
  quedaba **obsoleta**. Matiz: la PII no está resuelta, está *movida* — si se activa
  `returnIntermediateSteps` para tener trazabilidad, reaparece en los logs.
- **No existe ningún paso "Update data" en Intercom.** Existe `Set conversation data`, con una acción
  `Set <atributo>` por atributo ya creado. La bitácora lo nombraba mal.
- El atributo real es **`veredicto_f2`** (con "e"). El diagrama de la Fase 2 lo escribe `veridicto_f2`.

### ✅ INCÓGNITA CERRADA — los Conversation attributes cruzan de path

**HECHO VERIFICADO:** leer un Conversation attribute desde **otro path** funciona — es exactamente lo
que hace WP-04: el DC vive en `F`, `I. Path` no cuelga de su Success Path, y tras el `Object mapping`
el branch **sí** lee `veredicto_f2` (dos conversaciones no-Preview). Y **leer desde fuera del canvas**
también: `Preparar_Prompt` lo lee de `custom_attributes` por API en cada turno.
→ Los Conversation attributes fueron **la solución** de WP-04, no la trampa. El diseño del `modo` no
repite ese fallo.

**DESCONOCIDO que queda:** el lado de **escritura con un paso `Set`** (todo lo verificado se escribió
con `Object mapping`). Si `Set` acepta un **literal** es el mismo pre-check B que bloquea el
discriminador `punto` de WP-06 → **un solo experimento desbloquea dos WPs**.

### Bloqueos y decisiones pendientes del usuario / manager

1. **Recordatorios — conflicto de alcance:** `WP-03` los declara **fuera de alcance de todo el
   proyecto** ("lo hace otra persona"); la Fase 2 pide construirlos. Decisión de negocio.
2. **Corpus fiscal aprobado** para el modo FAQ: no consta que exista. Sin él el FAQ **no es
   publicable con ninguna arquitectura**.
3. **Imágenes de la Fase 2: no se adjuntaron en esta sesión** → la tabla de notas amarillas queda
   como dato faltante declarado. No se ha inventado ninguna nota.
4. **`distribuidor - usuario envia mensaje`**: saber si lo pausó el usuario y puede reactivarlo, o
   depende de Adri / Fer.
5. **Las dos preguntas del contrato de tools de WP-09** siguen abiertas (tool de datos: consultar
   Airtable / preguntar al usuario / ambas; y reporte: quién, cómo, cuándo, qué lo dispara).
6. **Opt-in vs opt-out de recordatorios**: el Council recomienda **opt-in** (la rama `Q` guarda el
   lead pero no programa nada sin un Sí explícito). Pendiente de confirmación.

### Orden de trabajo recomendado por el Council (dos agentes lo proponen por separado)

```
1. Fix CONTENT-TYPE (JSON.parse del body) + enchufar errorWorkflow     ← n8n, barato, desbloquea escrituras
2. Arreglar el prompt: systemMessage como expresión + quitar las tools inexistentes
3. Experimento "recorrido sonda": duplicar OnClick Mobility como LAB   ← ~20 min, 6 respuestas, sirve de rollback
4. WP-10 (el ticket)
5. Construir el modo FAQ
```

Cada paso, **un solo cambio** y su prueba en conversación **no-Preview** con ejecución correlativa.

### 📌 AGENDA ACORDADA PARA LA SESIÓN DEL 2026-07-30 (cierre del 29/07 ~16:35)

El usuario cerró la sesión sin ejecutar nada. **Nada aprobado, nada tocado.** Orden acordado para
mañana, con sus apuntes literales (captura de pantalla del usuario, 29/07 16:34):

1. **`WP-201` — fix del CONTENT-TYPE. ES LO PRIMERO.** Aprobado verbalmente por el usuario
   ("Empezamos con el paso 1"), **pendiente de aprobación explícita inmediatamente antes de tocar**.
2. **Los tickets que se abren solos (WP-10).** El usuario pregunta expresamente por esto: *"No había
   que arreglar lo de los tickets que se abren solos de ayer?"*. Aclaración dada: **es WP-10**, el
   bloqueo 3, y no es algo que rompiéramos nosotros — es configuración del workspace cambiada entre
   las 19:04 y las 19:19 del 28/07. Si el usuario prefiere atacarlo antes que WP-201, **es su
   decisión y manda**.
3. **Mapa visual de los WP de la Fase 2**: *"Dame del wp201-233 integrados en un map dentro de la
   carpeta de fase2"* → generar un `map.html` propio en `docs/prds/fase2/`, al estilo de
   `docs/prds/map.html` (paleta de marca TaxDown), **sin tocar el mapa del roadmap principal**.
4. **Resolver las decisiones abiertas antes de construir**: *"Empezamos resolviendo las 24 dudas
   antes, te las respondo(?)"* → **INFERENCIA**: se refiere al apartado **`24 Decisiones abiertas`**
   de `PRD-FASE2.md`. Confirmar con el usuario al empezar. Método: presentarle las decisiones
   agrupadas en un solo bloque y que las responda.
5. **Los 3 bloqueos del sistema**: *"BLOQUEOS DEL SISTEMA Resolvemos los 3 problemas hazme preguntas
   y los resolvemos"* → el usuario quiere resolver los tres (CONTENT-TYPE · prompt del agente ·
   ticket de WP-10) y pide que **se le hagan preguntas** en vez de recibir un plan cerrado.
6. **Arquitectura (punto 5 de mi resumen)**: *"Aplicamos la solución que propones, antes se estudia y
   miramos si todo se puede implementar en Intercom a-i"* → **DECISIÓN APROBADA en principio** de las
   correcciones (a)-(i) del Council, **condicionada** a un estudio previo de viabilidad real en
   Intercom de cada una de las nueve, una por una. No construir hasta ese estudio.
7. **Decisiones de negocio (punto 6 de mi resumen)**: *"EL PUNTO 6 debatir antes de tocar nada"* →
   **BLOQUEO explícito del usuario**: alcance de recordatorios, corpus fiscal, lectura de "el mismo
   agente", dueño del seguimiento, base legal/retención y SLA de `Ops_Mobility` **se debaten antes de
   tocar cualquier cosa relacionada**.

**Pendiente además:** el usuario avisa de que trae **muchas preguntas** acumuladas. Reservar tiempo
para eso antes de meterse en ejecución.

**Las imágenes de la Fase 2 siguen sin aportarse** (la única captura recibida son estos apuntes de
agenda, no el diseño del flujo) → la tabla de notas amarillas sigue **sin construir y sin inventar**.

---

## 🔴 RETOMAR AQUÍ — cierre de la sesión del 2026-07-28 (~10 h) — HISTÓRICO, ver bloque de arriba

> Informe visual completo: **`informe-sesion-2026-07-28.html`** (raíz del proyecto).
> Mapa de dependencias: **`docs/prds/map.html`** · **`docs/prds/ROADMAP.md`**.
> Traza cronológica de todo lo que se hizo y se descubrió: **`.spartax/log.md`**.

### Lo que se cerró hoy

**WP-04 — ARREGLADO y verificado en conversación real, las dos ramas.** El bug que desde el 23/07 hacía que todo cayera en "No he entendido bien la fecha".

- **Causa raíz real:** los **outputs de un Data Connector son atributos locales del path del connector y NO son legibles desde otro path**. El connector vive en `F` y el branch en `I. Path` → leía vacío. No era un bug, era una regla de Intercom que no conocíamos.
- **Solución:** `Object mapping`, al final de la pestaña **`2 Data`** del DC. `Intercom object = Conversation`, `API object = Root`, y tres filas de `+ New attribute mapping`: `veredicto_f2`←`veredicto`, `fecha_limite_f2`←`fecha_limite`, `dias_pasados_f2`←`dias_pasados`. Los tres creados como **Conversation attributes de tipo Text** (también `dias_pasados_f2`, que es número, a propósito, para no arriesgar un desajuste de tipo). Luego el branch lee `veredicto_f2` (aparece bajo el encabezado `Conversation`).
- **Verificado:** `21/06/2025` → `fuera_plazo` / límite `21/12/2025` / 219 días → mensaje de plazo vencido. `01/04/2026` → `en_plazo` / límite `01/10/2026` / 0 días → cualifica y asigna al team `11098265`. Ambas con `Workflow: Preview = false`.
- **El experimento que lo cerró:** cambiar la condición a **`has any value`**. Al seguir cayendo al `else`, quedaron descartadas de golpe todas las hipótesis sobre el chip, el valor, el tipo y el operador. Preguntar "¿hay algo?" antes de "¿es correcto?".
- **Cinco hipótesis muertas:** atributos duplicados · Pill Conversion Error · desajuste de tipo · el operador `contains` · "cosa del entorno TEST". Ninguna era. No resucitarlas.
- Resuelve de paso el bloqueo del 24/07 de que `fecha_limite`/`dias_pasados` no aparecían en el selector del mensaje `G`. Misma causa.

**El circuito conversacional funciona por primera vez.** Nunca había llegado un mensaje de n8n a Intercom. Tres arreglos:

1. `Callback_Intercom`: el `jsonBody` leía `$json.message`, que no existe — el nodo anterior emite `last_message_content`. Mandaba literalmente `{"data":{}}` y se comía un **400 Invalid Request**, dejando el `Wait for webhook` colgado. **Pasaba siempre, desde antes de hoy.**
2. En el DC `n8n_bot_mobility`, tres inputs de `Required` a `Optional` (`Conversation Part ID`, `Last Message Body`, `Last Message ID`). `Required` es **condición de ejecución**: si falta el valor, el connector no se ejecuta. **Trampa:** `Last Message ID` tenía `Format: Number` e Intercom no permite que un no-textual sea opcional ("Non-text parameters must be required for this HTTP method") → hubo que cambiarlo primero a `Text`.
3. Faltaban dos conexiones en el canvas: `Formatear_conversacion1 → Preparar_Prompt → Callback_Intercom`.

**WP-09 — el agente conversacional, construido y respondiendo.** Se descubrió que el "bloque 2" **no existía en runtime**: `Agente_conversacional` estaba `disabled` y sin conexión de entrada. Se montó uno nuevo (no se reutilizó el viejo, que además apunta al webhook equivocado por un rename anterior).

```
Webhook1 → If2 → (Wait2 3s | directo) → Traer_Conversacion_intercom1
         → Formatear_conversacion1 → Preparar_Prompt → AI Agent → Callback_Intercom
                            └─ (salida de error) → Mensaje_fallback → Callback_Intercom
```

- `AI Agent` (Tools Agent), `promptType: define`, texto `{{ $json.prompt }}`, System Message = prompt v1 de Paula, modelo `OpenAI Chat Model2`. **Sin nodo de Memory**: el historial se reconstruye desde la API de Intercom en cada turno.
- `Preparar_Prompt` detecta el **arranque en frío** e inyecta un bloque "DATOS QUE YA CONOCEMOS" (nombre, email, teléfono, `veredicto_f2`, `fecha_limite_f2`).
- `Mensaje_fallback` como red de seguridad en la salida de error.
- **Verificado:** responde a preguntas, y al cualificar **se presenta solo** sin que el usuario escriba.
- Dos defectos corregidos: el HTML (`<b>…</b>`) salía literal → limpieza en el callback + regla en el prompt; y el agente volvía a pedir datos ya conocidos → bloque de datos conocidos.

**Council de 5 agentes sobre la arquitectura de persistencia.** Decisión (4 votos de 5): **4 Data Connectors finos con discriminador `punto`**, cero constantes de negocio en Intercom, **un solo escritor** a Airtable. Criterio decisivo: testabilidad por curl. Descartadas: constantes en Intercom (con `typecast`, una errata crea una opción nueva en el single-select), un solo DC con atributos de conversación, y el workflow separado para leads (dos escritores sobre la misma fila).

### ⛔ Lo que quedó bloqueado — WP-10, y es lo primero de mañana

**El turno 2 no funciona, y no es nuestro código.** La conversación nace como **`Customer ticket`** (tipo `Prueba Fer`) y **sobre un ticket no se disparan los triggers de "customer sends any message"** → el mensaje del usuario nunca llega a n8n. Verificado en la conversación `215475262949230`: tras el mensaje del usuario solo hay un `ticket_state_updated_by_admin` y **nada más**; cero ejecuciones nuevas en n8n.

- Pausar el workflow `distribuidor - usuario envia mensaje` **no lo arregló**: el ticket ya existía antes. Y ese workflow **sigue pausado** — hay que reactivarlo, porque pausado no reparte los mensajes de nadie en el workspace.
- **Efecto secundario grave:** al pasar el ticket a `Submitted`, **Intercom manda un correo al cliente**. En producción, un usuario a mitad de conversación recibiría un correo de soporte diciéndole que le contestarán por otro canal.
- **Dato que acota la búsqueda:** la conversación de las 19:04 tenía `ticket: null` y funcionó; las de 19:19 en adelante son todas ticket. Algo cambió en el workspace entre esas dos horas y no fue este proyecto.
- Checklist completa de dónde mirar: **`docs/prds/WP-10-enrutado-mensajes-intercom.md`**. Método: **desactivar de uno en uno y probar entre medias**.
- **Workaround mientras esté abierto:** lanzar el reusable `n8n_BOT_mobility` a mano desde el Inbox tras cada respuesta.

### Dos conclusiones propias que hubo que revertir

1. **"El fix del chip no funciona"** — la prueba se hizo en **Preview**, que usa mocks. Las 5 únicas conversaciones de esa hora eran Preview, y el connector reportó éxito sin llamar a n8n. **Regla nueva: ninguna conclusión sin conversación no-Preview + ejecución correlativa en n8n.**
2. **"El `else` reintenta"** — falso. Manda el mensaje y **cierra la conversación** en el mismo segundo. Toda la documentación previa lo decía mal.

### Siguientes pasos

1. **WP-10 · el ticket.** Es el desbloqueo real. Ver checklist en su PRD.
2. **WP-11 · método de triaje**, acordado con **Alina**. Reglas de negocio, se recogen en la próxima sesión. PRD esqueleto creado con las preguntas a resolver.
3. **WP-06** — construir los 4 DCs. Sin bloqueos, es lo más productivo si WP-10 se atasca.
4. **WP-07** — revisar `beckham_get_expediente` (existe pero con `triggerCount: 0`, probablemente incompleto; falta asignarle la credencial de Airtable a mano).
5. **WP-09** — cerrar el **contrato de herramientas** para Paula. Faltan dos respuestas: si la tool de datos es *consultar* Airtable o *preguntar* al usuario, y el quién/cómo/cuándo del reporte.

### Deuda pequeña, apuntada
Chips pegados en el mensaje de `N. Path` (`21/12/2025y han pasado: 219días`) · `M. Path` re-llama al connector sin necesidad (cambio aparte) · 4 filas de prueba + 1 vacía en Airtable · `Respond OK` devuelve los 68 campos con PII y URLs prefijadas · nodo Airtable sin `retryOnFail`/`onError` · fecha inválida responde `ok:true` · `Existe_Expediente1` fuera de la cadena pero **no borrar**.

---

## 🔴 (HISTÓRICO — sesión 2026-07-28, notas de media sesión; el bloque de arriba las corrige)

### WP-04 — fix aplicado y publicado, resultado **NO CONCLUYENTE**. La hipótesis 1 sigue viva.
> **CORRECCIÓN dentro de la misma sesión.** Una primera versión de este bloque decía que el fix se probó "en Messenger real" y que la hipótesis quedaba **refutada**. **Falso, anulado.** Verificado por MCP: las 5 únicas conversaciones del 28/07 son de **Preview** (`"Workflow: Preview": true`, contacto `Preview User`), y en una de ellas el connector reportó `success` a las 08:52:18 UTC mientras la última ejecución de `beckham_f2_plazo.` fue a las 07:30:49 UTC → **respuesta mock, no llamada real**. Las 8 ejecuciones de n8n del día tienen vacía la cabecera `x-intercom-source-dataconnector-id` → fueron clics del botón **Test**, no ejecuciones de workflow.

Se aplicó el fix (chip `veredicto` borrado y reinsertado con el selector `{..}` en las dos condiciones de `I. Path`) y se **publicó**. **No se ha validado nunca en real, así que no se sabe si funciona.** El bot se lanza desde **`https://development.app.rentax.es/procedure/P00027/form`** (`first_contact_reply.url` de la conversación 215475219542253, mensaje `admin_initiated` → launcher en esa página, de ahí "OnClick").

**Regla nueva, no negociable:** ninguna conclusión sobre este bot se acepta sin (a) conversación **NO-Preview** y (b) ejecución correlativa en n8n con la cabecera `x-intercom-source-dataconnector-id` rellena.

### ⚠️ El `else` de `I. Path` NO reintenta: CIERRA la conversación
Verificado en el timeline: mensaje del `else` `08:52:39` → `close` en el mismo segundo → `message_assignment: nobody_admin`. **Toda la documentación previa (memoria, esta bitácora, WP-04, WP-06) decía `else → K.Path → retry a F`. Es FALSO.** Con el bug vivo, quien llega a `F` acaba en callejón sin salida y sin persistencia.

Evidencia adicional del 28/07 (MCP Intercom, timeline de la conversación — no hace falta cruzar con los logs del DC):
```
18:42:22  custom_action_started   → beckham_plazo_f2
18:42:24  custom_action_finished  → result: "success"
18:42:25  note (vacía) + "No he entendido bien la fecha, ¿me la escribes así: DD/MM/AAAA"
18:42:26  repite "¿Qué día te diste de alta...?"
```
**Hipótesis viva (la 2ª, ahora principal):** `I. Path` no cuelga del **Success Path** del bloque del connector en `F` sino de la salida del Collect data → en ese contexto `veredicto` no existe. Sospecha del usuario, sin verificar: algo propio del workspace TEST. Al retomar, **empezar por ver de qué salida de `F` cuelga `I. Path`**, no por tocar el chip otra vez. Detalle en `docs/prds/WP-04-...md` §3-bis.

### DECISIÓN ARQUITECTÓNICA (Council de 5 agentes, 28/07): **Opción A**, y NO construir todavía
**4 Data Connectors finos**, mismo webhook, discriminador **`punto`** (`descarte_residencia|lead|cualifica|descarte_plazo`); **cero constantes de negocio en Intercom**; n8n las deriva con **whitelist** y devuelve 400 ante un `punto` desconocido. 4 votos de 5. Criterio decisivo: es la única opción cuyo comportamiento se prueba **por curl sin navegador**, y en este proyecto curl es lo único que ha funcionado (2 bugs cazados el mismo día) frente a 3 fixes publicados en Intercom que fallaron.

Descartadas: **B** (constantes en el único sitio no testeable + `typecast:true` crea opciones nuevas en el single-select ante una errata) · **C** (apuesta al mecanismo "valor fijado en un paso, leído en otro", que es justo el que falla; y un atributo de conversación persistente arrastra el `outcome` anterior en una reentrada) · **propuesta de workflow separado para leads** (dos escritores sobre la misma fila y clave, duplicando `toIsoDate`/`toBool`). **Contrapropuesta aceptada:** un solo escritor + **vista de Airtable "Leads potenciales"** (`lead_potencial = true` AND `Descarte` vacío) sobre la que la otra persona monta los recordatorios.

**El Council recomienda por unanimidad NO construir WP-06 hoy:** 2 de los 4 puntos (`G`, `N`) están detrás de un branch que no funciona y de un `else` que **cierra la conversación** — sería montar código muerto y quemar ~36 configuraciones a mano sobre una estructura que la documentación describía mal.

### Agujeros abiertos que ninguna opción cubre — decisiones del usuario
1. **Ninguna rama limpia las marcas de otra**: quien fue lead y luego cualifica se queda `lead_potencial=true` para siempre. Evidencia: `recKZg6HkEYxLocIz` tiene `alta_ss=true` + `Descarte`=plazo + `fecha_prevista_alta` a la vez. Falta **semántica de reset por `punto`**.
2. **`UserId` no es único**: la automatización `wflo1oMmSWlcYsO3V` crea filas hijas desde 4 form views, copia al padre vía `recordId` y borra la hija (con 2 ramas no-op que dejan zombis); y los formularios **no rellenan `UserId`** → un empleado ya registrado no hará match y generará **fila duplicada**. Falta guarda que **cuente** matches y aborte si ≠1.
3. **`Respond OK` devuelve el registro completo de Airtable** (68 campos, PII, URLs de formularios prefilled) → queda en los logs del DC 7-14 días. Recortar a `{ok:true, record_id}`.
4. **Fallos silenciosos**: fecha inválida → el Code la descarta y responde `ok:true`.
5. **Webhook de upsert público, sin auth, path adivinable**, escribiendo en tabla con datos reales.
6. **Nodo Airtable sin `retryOnFail`/`onError`**; `beckham_bot` sin `errorWorkflow`.
7. **CONTENT-TYPE (bloqueante para WP-06)**: verificado en las ejecuciones `8052012`/`8052018` que las llamadas del DC llegan como `application/x-www-form-urlencoded` con el JSON **como clave** del body → `body.user_id` undefined → 400. El 400 del Test **no** era por inputs vacíos. Fix: `JSON.parse` de la clave única en el Code node.

### WP-06 — pre-check A: `{{user_id}}` NO está confirmado (corrección)
Se declaró "RESUELTO" leyendo el `external_id` **del contacto**. Eso prueba que el contacto lo tiene, **no** que el token resuelva en `OnClick Mobility`. Y hoy el contacto de pruebas es otro (`6a50e308…`, external_id UUID plano) frente al documentado (`6a623110…`, formato Cognito `eu-west-1:`) → **dos formatos distintos entrando en la misma columna clave**. Sigue **PENDIENTE**.

### (Histórico) WP-06 — pre-check A "RESUELTO"
El contacto de esa conversación (`6a623110378d0842952fe39a`, `hammad.bellachhab@taxdown.es`) tiene **`external_id` = `eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac`** — valor real, formato Cognito, coherente con "ID interno de TaxDown". Vale para usuarios **logueados**; un visitante anónimo llegaría sin External ID → 400 del webhook. Como el bot vive dentro de un formulario de procedimiento, lo normal es que haya sesión, pero confirmarlo al probar WP-06.

**Pre-check B sigue abierto (bloqueante para el mapeo):** ¿"Map action inputs" admite valores literales o solo chips de atributo? Si solo chips → plan B: paso "Update data" que fija un atributo temporal con la constante antes del DC.

**Orden acordado:** WP-04 parqueado, se avanza con WP-06 (construir el DC `beckham_upsert_expediente` + conectarlo en D, H, G, N en borrador). Las ramas G y N no se podrán validar de extremo a extremo hasta que WP-04 esté resuelto; D y H sí.

---

## 🔴 RETOMAR AQUÍ (sesión tarde 2026-07-27: auditoría Chrome + causa raíz de F3 confirmada — sustituye el bloque de auditoría MCP de más abajo) — HISTÓRICO, ver bloque de arriba

**Sesión cerrada por hoy. Se retoma con el Data Connector nuevo (WP-06) por la noche o mañana.** Roadmap actualizado con `/prd:map` (PRD Kit): `docs/prds/ROADMAP.md` + `docs/prds/map.html` (rediseñado con colores de marca TaxDown). PRDs `WP-04` y `WP-06` reescritos con los hallazgos de hoy — pasan de `skeleton` a `specified`.

**⚠️ Estado del bug de F3: CONFIRMADO el diagnóstico, pero SIGUE ACTIVO — no está arreglado.** Hoy solo se confirmó la causa raíz (sección 3 abajo); el fix no se ha aplicado ni publicado todavía.

**Resumen del día completo (mañana + tarde), por si se retoma leyendo solo este bloque:** por la mañana se cerró **WP-05** — se construyeron a mano los nodos de persistencia dentro de `beckham_bot` en n8n (`Webhook_Upsert_Expediente → Validar y Normalizar → ¿Datos Válidos? → Airtable Upsert Expediente → Respond OK/Error`), se conectó una credencial nueva de Airtable (Personal Access Token), y se probó contra el webhook de producción con **peticiones curl reales** — crea, actualiza sin duplicar, rechaza sin `user_id`. Se encontraron y arreglaron dos bugs en el proceso (fechas desplazadas un día; booleanos que llegaban como texto desde el Data Connector). Detalle completo de esa parte de la mañana: sección "Construcción manual del nodo de persistencia..." en el bloque de abajo. Por la tarde se hizo la auditoría de Chrome sobre `OnClick Mobility` que se detalla a continuación.

**Dos informes HTML nuevos, en español, con colores de marca TaxDown, creados hoy para repasar la sesión visualmente:** `docs/prds/map.html` (mapa de dependencias PRD) e `informe-sesion-2026-07-27.html` (raíz del proyecto, informe narrativo de la sesión completa — mañana y tarde).

### 1. Objetivo de la sesión (tarde)
Antes de reconstruir el Data Connector principal (WP-06), inspeccionar por Chrome (solo lectura) cómo está estructurado realmente `OnClick Mobility` en Intercom TEST, porque la memoria del proyecto tenía datos obsoletos/incorrectos sobre nombres de paths y arquitectura del bug de F3.

### 2. HECHOS VERIFICADOS — estructura real de `OnClick Mobility` (id 66243731, workspace TEST `q3bhdtoi`, Live)
Navegado con Chrome, editor en modo lectura (sin publicar nada). Estructura real, **corrige la memoria anterior**:

```
A. Bienvenida → B. F1 Residencia fiscal last 5 years
                   Sí → D. Fue residente (descarte duro, "No residente ultimos 5 años") → Close
                   No → E. Alta SS
                          No → H. No descartar aún... (lead potencial, F4 ya montado) → Close
                          Sí → F. Fecha Alta SS (Collect data texto + DC beckham_plazo_f2)
                                 → I. Path (branch sobre "veredicto")
                                      en_plazo    → G. Enviar a n8n (cualifica)
                                      fuera_plazo → M. Path (re-llama beckham_plazo_f2, redundante)
                                                    → éxito → N.Path (descarte por plazo)
                                                    → fallo conexión → O.Path (escalar a humano)
                                      else        → K. Path → vuelve a F (reintento)
```

- El branch se llama **I. Path**, no "J. Path" como decía toda la memoria previa.
- Solo hay **un** atributo `veredicto` en todo el workspace, agrupado bajo el encabezado del conector `beckham_plazo_f2` en el selector de atributos — **verificado buscando "veredicto" en el picker de condiciones y viendo un único resultado**. Esto **descarta definitivamente** la hipótesis de "atributos duplicados a nivel de app" que llevaba semanas en disputa en esta bitácora.
- **Puntos reales de descarte/cualificación = 4, no 3**: `D` (residencia), `H` (lead potencial), `G` (cualifica), `N` (descarte por plazo). El roadmap anterior de WP-06 hablaba de 3 puntos.

### 3. BUG DE F3 — CAUSA RAÍZ CONFIRMADA (ya no es hipótesis)
Verificado cruzando dos fuentes independientes de la MISMA conversación real (`215475219542253`, 24/07):

1. **Logs del Data Connector** (Settings → Integrations → Data connectors → `beckham_plazo_f2` → Logs): ejecución `24/07 18:42:24`, fuente = esa conversación, respuesta 200:
   ```json
   {"veredicto":"en_plazo","fecha_alta_norm":"2026-03-03","fecha_alta_ddmmaaaa":"03/03/2026",
    "fecha_limite":"03/09/2026","fecha_limite_iso":"2026-09-03","dias_pasados":0}
   ```
   con **"Response processing: API attributes mapped successfully"** (Intercom confirma que el mapeo fue correcto).
2. **La conversación real** en el Inbox: el mensaje del bot inmediatamente siguiente, timestamp **18:42:26** (2 segundos después), es la repetición de "¿Qué día te diste de alta...?" — el mensaje de la rama de **reintento** (K/else), no el de cualificación (G).

**Conclusión: con un `veredicto="en_plazo"` recibido y mapeado correctamente, el branch `I. Path` igualmente cayó al `else`.** Esto descarta n8n, el mapeo del conector y los atributos duplicados. Causa más probable (patrón "Pill Conversion Error" de INTERCOMDOC §5): el chip `veredicto` de la condición no está correctamente vinculado a la instancia real del output, pese a verse bien en el editor.

**Fix mínimo, documentado en `WP-04`:** en `I. Path`, borrar el chip `veredicto` de ambas condiciones y reinsertarlo con el selector `{..}`, confirmando que aparece bajo el encabezado `beckham_plazo_f2`. Validar con **Simulation** (no Preview, que usa mock) con una fecha en plazo y otra fuera de plazo. Publicar solo con OK explícito.

### 4. WP-06 replanteado desde cero
Con la estructura real confirmada, se reescribió el PRD de WP-06: DC único, 9 Data inputs en modo **"Let Fin collect"** (no People attribute ni Custom value — los valores cambian por rama), `Required` OFF salvo posiblemente ninguno, `Fallback` vacío en todos, conectado en los 4 puntos reales (`D`, `H`, `G`, `N`). Detalle completo, tabla de inputs y checklist previo a conectar: `docs/prds/WP-06-dc-principal-intercom.md`.

**Pendientes abiertos para cuando se retome (noche/mañana):**
1. Aplicar el fix de WP-04 (reinsertar chip `veredicto` en `I. Path`) y validar con Simulation — es rápido y desbloquea poder probar WP-06 de extremo a extremo en las ramas de plazo.
2. Confirmar si `{{user_id}}` resuelve con valor real en el contexto de `OnClick Mobility` (crítico para WP-06, no verificado aún).
3. Confirmar si "Map action inputs" admite valores literales o solo chips (bloquea el diseño exacto de `alta_ss`/`descarte` por rama).
4. Construir el DC `beckham_upsert_expediente` desde cero según el PRD de WP-06 (el borrador anterior se descarta como base).

### 5. Nada modificado en sistemas productivos
Toda la sesión de Chrome fue de solo lectura: se navegó el editor de `OnClick Mobility` en modo edición (necesario para abrir condiciones y ver el origen de los chips) pero **no se guardó ni publicó ningún cambio** ("Set changes live" quedó siempre deshabilitado/gris). Se consultaron Logs y Health del Data Connector (solo lectura). No se tocó n8n ni Airtable en esta sesión.

---

## 🔴 RETOMAR AQUÍ (auditoría MCP verificada 2026-07-27, sustituye supuestos de abajo — ver detalle más abajo)

**Auditoría de solo lectura vía MCP (n8n + Airtable) — 2026-07-27.** El bloque de "RETOMAR AQUÍ" de 2026-07-22 queda **marcado como histórico/parcialmente obsoleto** (no se borra, se conserva íntegro debajo). Resumen de lo verificado hoy:

### HECHOS VERIFICADOS (por MCP, no por memoria)
- `beckham_bot` (`nhOwpiGxikeU5DLR`): **34 nodos**, activo en producción. Dos webhooks reales: `Webhook1` (path `22de1fbd-bada-40b3-a120-41e519442139`, respuesta inmediata) y `Webhook_Upsert_Expediente` (path `beckham-upsert-expediente`, nuevo, en construcción).
- Cadena `Formatear_conversacion1 → Existe_Expediente1 → Callback_Intercom` **verificada y conectada** (arreglo aplicado hoy tras un error propio, ver "ELEMENTOS OBSOLETOS").
- `beckham_f2_plazo.` (`wdOOF0ecCkgFOUjt`): workflow **independiente**, activo, 3 nodos (`Webhook→Code→Respond to Webhook`), sin credenciales, sin rama de error explícita (fecha inválida → `veredicto:"no_valida"`, no rompe pero tampoco alerta). Path producción `b3c76655-b298-4f5e-9772-48d301f6d925`.
- Airtable `Empleados` (`app5K8OnSObqwWweS`/`tblTWCWu5nQXNOMR1`): `intercom_conversation_id` **SÍ existe** (creado en F1). `Noresidenteultimosanios` **NO EXISTE** (contradice mapeo dado por cerrado más abajo). `Descarte`, `Status`, `email` (clave de negocio, temporal) confirmados. No existe campo para el `contact_id` crudo de Intercom — solo `UserId` (ID interno TaxDown, sincronizado vía token `{{user_id}}`).
- Automatizaciones nativas de Airtable y duplicados a nivel de fila: **DESCONOCIDO**, no auditado esta sesión.

### DECISIONES (reafirmadas hoy)
- **Clave de negocio del expediente = `UserId`** (decisión del usuario, 2026-07-27 tarde). **SUSTITUYE Y ANULA** la decisión anterior de usar `email` como clave temporal, que aparece en secciones más abajo de este documento. Motivo: `UserId` es el ID interno de TaxDown (sincronizado con Intercom vía token `{{user_id}}`) y es estable; el email puede cambiar. Comprobado por MCP antes de cambiarlo: la tabla `Empleados` tenía solo 2 filas preexistentes y **ninguna** con `UserId` relleno → sin riesgo de datos heredados. Sin fallback a email (evita lógica de doble clave). Salvaguarda: `user_id` vacío o ausente → HTTP 400 sin escribir nada, porque un upsert con valor de match vacío podría sobrescribir una de las filas que tienen `UserId` vacío. Consecuencia positiva: los contactos **sin email** (visitantes anónimos de Messenger) ya se guardan correctamente — verificado por curl.
- `beckham_bot` se sigue editando **a mano**, nunca por `update_workflow` del MCP (confirmado el riesgo real: la API no devuelve `credentials` de los nodos).
- Persistencia (`upsert_expediente`) se construye **dentro** de `beckham_bot`, no como subworkflow aparte.

### PENDIENTES (roadmap operativo detallado en la sesión de hoy)
1. ~~Añadir nodo `Respond OK`~~ — **HECHO**.
2. ~~Probar `Webhook_Upsert_Expediente` por curl~~ — **HECHO Y VERIFICADO** (crea, actualiza sin duplicar, 400 sin `user_id`, `trim` contra duplicados por espacios, fechas correctas, funciona sin email). Dos bugs encontrados y resueltos: fechas desplazadas un día (fix: `T12:00:00.000Z`) y booleanos que llegan como texto (fix: función `toBool`). Filas de prueba que el usuario decidió dejar: `recKZg6HkEYxLocIz`, `recSop5rTn99Qft0o`, `reckt17pB8TvbuCCZ`, `rec1PBEQCqLYeZ1ZO`.
3. **SIGUIENTE PASO — crear el Data Connector nuevo en Intercom** (`beckham_upsert_expediente`): POST a `https://es.synapse.rentax.es/webhook/beckham-upsert-expediente`, 9 Data inputs todos de tipo Text, con **`user_id` y `conversation_id` como Required** y `email` opcional. Riesgo abierto a confirmar en el editor: que el token `{{user_id}}` esté disponible en el contexto de `OnClick Mobility` (solo se ha visto funcionando en el DC 461046) — si no lo estuviera, el webhook devolvería 400 y no se guardaría nada.
4. Conectar ese DC en los 3 puntos de disparo de `OnClick Mobility` (cualifica, descarta, lead potencial).
5. Prueba e2e en Messenger real (3 escenarios) + publicación con OK explícito.
6. `get_expediente` (multi-turno/reentrada, resuelve el hueco de `reuse_mobility`) — no bloqueante, puede ir en paralelo.
7. Agente IA (`sesion_2026-07-21_agente-ia.md`) — revisar vigencia del diseño con Paula tras cerrar persistencia. Fuera de foco esta semana.

### BLOQUEOS
- **F3 bug** (branch de Intercom no detecta veredicto del connector F2/F3, cae a reintento) — con IT, sin ETA. No bloquea el resto (sin dependientes).

### ELEMENTOS OBSOLETOS (confirmado hoy, corrige instrucciones previas)
- **`Calcular_Plazo_F2` YA NO debe conservarse dentro de `beckham_bot`** — se eliminó hoy tras confirmar por MCP que no tenía ninguna conexión de entrada (huérfano genuino, cálculo real vive en `beckham_f2_plazo.`, workflow aparte). Cualquier instrucción anterior que diga "conservar `Calcular_Plazo_F2`" queda **corregida y anulada**.
- `Search records2` y `Crear_Expediente1` — eliminados hoy (por error propio, no por decisión de diseño); el hueco se cerró reconectando `Formatear_conversacion1 → Existe_Expediente1` directamente, replicando el comportamiento real que ya tenían en producción (estaban `disabled`, n8n los saltaba).
- Bloque① de filtros obsoletos (`Filtro_Eliminatorio1`, `Interpretar_F1/F3`, `Ruta_F1/F2/F3`, `Set_F1/F2/F3_*`, etc.) — **ya no existen**, confirmado por MCP. El punto 1 de "Próximos pasos" de abajo (2026-07-22) está **cerrado**, no pendiente.
- Mapeo "F3 → `Noresidenteultimosanios`" (ver sección Airtable de 2026-07-22 más abajo) — **el campo no existe**, corregido arriba.

### HIPÓTESIS NO CONFIRMADAS
- Que haga falta crear "dos webhooks nuevos": **descartado** — los dos webhooks preexistentes (F2 y el async principal `Webhook1`) ya existían. Lo pendiente es terminar un webhook ya empezado + crear un Data Connector (no un webhook) en Intercom.
- Duplicados/automatizaciones en Airtable: sin auditar, pendiente si se necesita en el futuro.

**Fecha de esta revisión:** 2026-07-27. **Plan detallado y estado de tareas también vive en `docs/prds/` (PRD Kit, WP-01 a WP-09) y en `.spartax/state.json` de este repo.**

---

## 🔴 RETOMAR AQUÍ (última actualización 2026-07-22) — HISTÓRICO, ver correcciones arriba

> **GIRO (reunión con manager):** los filtros **F1/F2/F3 se han MOVIDO de n8n a dentro del bot de Intercom** (`OnClick Mobility`). n8n pasa a ser **orquestación + persistencia + agente IA**. El Bloque ① de filtros de n8n queda **obsoleto** (pendiente de borrar).

**Documentos del proyecto (mapa):**
- `Trabajo.md` — bitácora (este fichero).
- `sesion_2026-07-21.md` — análisis/arquitectura post-reunión (Intercom/n8n/LangSmith/Airtable).
- `sesion_2026-07-21_agente-ia.md` — **diseño del agente IA** (tools, subworkflows, contrato, salida JSON, multi-turno, mapa de impacto sobre la limpieza de n8n).
- `contexto_proyecto_beckham.md` — negocio. `ARQUITECTURA_bloque1.md` — callback/fallback (histórico del Bloque ①).
- `.orchestron/` — histórico read-only. `mvp_beckham/` — demo. `Empleados-Grid view (1).csv` — CSV nuevo de Airtable.

**Dónde estamos (todo en BORRADOR, sin publicar):**
- ✅ **Intercom `OnClick Mobility` (66243731)** — filtro completo, reordenado tras hablar con manager:
  Welcome (explicación Ley + ¿acogerte? Sí/No) → **B Residencia fiscal 5 años** (Tag `jarry_ignore`; Sí→descarte `Fue residente`+Close · No→) → **E Alta SS** (Sí→ · No→**I Lead potencial**) → **F Fecha** (Collect data `fecha_alta_ss`; botones placeholder "dentro/fuera de plazo") → dentro→**H Enviar a n8n** (Assign `Ops_BOT_Mobility` + Pass a `n8n_BOT_mobility`) · fuera→**G** descarte plazo+Close. Welcome No→**C** cierre. **Rama I (lead potencial) conectada a H** (no perder leads sin alta SS).
- ✅ **Intercom `n8n_BOT_mobility` (66246057)** — añadido paso **"Reply" `{{mensajeUsuario}}` + fallback** (gap resuelto). Path A: DC → Wait webhook → Reply → END.
- ⬜ **`reuse_mobility` (66250478)** y Data Connector `n8n_bot_mobility` (461046): sin cambios. Hueco: entrar escribiendo se salta el filtro → resolver con persistencia.
- ⬜ **n8n `beckham_bot` (`nhOwpiGxikeU5DLR`)**: **PUBLISHED/activo (1/4)**. Filtro Bloque ① obsoleto → **pendiente borrar** (ver "Próximos pasos"). Sin tocar.

**Próximos pasos (mañana, en orden):**
1. **Borrar nodos de filtro obsoletos en `beckham_bot`** (a mano en el editor n8n, uno a uno, guardar borrador SIN publicar). **BORRAR:** `Determinar_Pregunta_Pendiente1`, `Filtro_Eliminatorio1`, `Interpretar_F1`, `Interpretar_F3`, `Ruta_F1/F2/F3`, los 9 `Set_F1/F2/F3_*`, `Set_Fallback_continuar`, `Enviar_F1_Inicial`, `Converger_Bloque1`. **CONSERVAR:** `Calcular_Plazo_F2` (⚠ está entre ellos), `Callback_Intercom`, `Traer_Conversacion_intercom1`, `Formatear_conversacion1`, `Existe_Expediente1`, `Search records2`, `Crear_Expediente1`, `Webhook1`, `If2`, `Wait2`, y toda la fila DESACTIVADA de arriba. (Verificar por MCP tras borrar.)
2. **T3 — Veredicto de plazo F2** en n8n: reusar `Calcular_Plazo_F2` → devolver `en_plazo`/`fuera_plazo`. **T4 — cerrar F2 en Intercom**: sustituir botones placeholder por rama automática con ese veredicto.
3. **Conectar Airtable** (T6): reactivar/configurar `Search records2` + `Crear_Expediente1` (base/tabla reales) → `get_expediente` + **upsert idempotente** (comprobar si ya existe expediente antes de crear). Distinguir **lead potencial** (`alta_ss=No`, tag/estado + vista oculta) de **cualifica**.
4. **T2 — Agente IA**: diseño ya documentado en `sesion_2026-07-21_agente-ia.md`; implementar tools/subworkflows cuando toque.

**Decisiones/pendientes anotadas:**
- **Airtable (CSV nuevo auditado):** F3 → **`Noresidenteultimosanios`** ✅, descarte → **`Descarte`** (single-select) ✅, `Status` = estado_expediente. Ocultos: `UserId`, `recordId`, `RecordID Formulario`. ⚠️ **Falta** un campo para el **`conversation_id`/`contact_id` de Intercom** (decidir: añadir campo o enganchar por `email`).
- F2 sigue con botones placeholder "dentro/fuera de plazo" (pendiente veredicto n8n).

**Cautelas:**
- **No publicar** (`Publish`/`Set changes live`/`Active`) ni en n8n ni en Intercom sin OK explícito. n8n `beckham_bot` está **PUBLISHED/producción** (instancia compartida con el bot de cripto).
- **No tocar** los nodos desactivados de la parte superior de `beckham_bot`.
- El tag **`jarry_ignore` NO se toca** (silencia al otro bot, Jarry). Trabajar solo en workspace Intercom **TEST** (`q3bhdtoi`).

**Aprendizajes de navegador (n8n editor) — para la próxima edición:**
1. El **paste** de n8n descarta las conexiones cuyo extremo no está en el set pegado → las conexiones de **frontera** hay que hacerlas a mano.
2. Los puertos del Switch están a ~12px → fácil errar de puerto; **verificar siempre con MCP tras guardar** (los edges del DOM están virtualizados y no son fiables; los nodos/handles vía `getBoundingClientRect` sí).
3. Para soltar una conexión hay que caer en el **handle de input exacto**, no en el cuerpo del nodo.
4. **Re-arrastrar desde un output ya conectado NO crea** una 2ª conexión de forma fiable (por eso quedó el fallback sin rematar).
5. `Cmd+S` guarda una **nueva versión borrador** (pide nombre); **no publica**.
6. Insumos de trabajo: `beckham_T002_T005_nodes.json` (clipboard de los 17 nodos, en la raíz del proyecto) y `scratchpad/build_nodes.py` (generador).

---

## Diseño FINAL F1–F3 (T002–T005) — cerrado 2026-07-20

**Topología** (cada ruta: interpretar → Switch 3 casos → Set `message` → converge en `Callback_Intercom`):
```
Filtro_Eliminatorio1 (Switch por pregunta_pendiente)
 ├0 F1 → Interpretar_F1 → Switch3 ┬ avanza  → Set msg = F2 pregunta          ┐
 │                                ├ descarta → Set msg = sin_alta_ss          │
 │                                └ reintento→ Set msg = reintento_F1         │
 ├1 F2 → Calcular_Plazo_F2 → Switch3 ┬ avanza  → Set msg = F3 pregunta       │
 │                                   ├ descarta → Set msg = plazo_vencido     ├→ Callback_Intercom
 │                                   └ reintento→ Set msg = reintento_F2      │
 ├2 F3 → Interpretar_F3 → Switch3 ┬ avanza  → Set msg = mensaje_continuar    │
 │                                ├ descarta → Set msg = residente_5_anios    │
 │                                └ reintento→ Set msg = reintento_F3         │
 └3 fallback (NUEVO, fallbackOutput:"extra") → Set msg = mensaje_continuar    ┘
```

**Decisiones cerradas:**
1. **Switch de 3 casos** (avanza/descarta/reintento), NO el If binario. El input ambiguo → **reintento**, nunca descarte.
2. **F2 fecha:** el usuario la escribe en **texto libre**; el Code node la **parsea y normaliza** (acepta `dd/mm/aaaa`, `dd-mm-aaaa`, ISO, "12 de enero de 2024") antes de calcular `fecha+6m ≥ hoy`.
3. **Bloque② (avanza-F3) y fallback "completo":** ambos → `Set` con **mensaje de continuar** (placeholder).
4. **Persistencia Airtable:** asumida bloqueada; se construye la lógica igual.

**Interpretación (Code determinista, sin IA)** — todos leen `{{ $('Formatear_conversacion1').item.json.last_message_content }}`:
| Filtro | avanza | descarta | reintento |
|---|---|---|---|
| **F1** ¿alta SS? | SÍ (`sí/claro/ya estoy/afirmativo…`) → F2 | NO (`no/todavía no/aún no…`) → `sin_alta_ss` | sin keyword clara |
| **F2** ¿qué día alta? | fecha parseada y `+6m ≥ hoy` → F3 | fecha parseada y `+6m < hoy` → `plazo_vencido` | no se parsea fecha |
| **F3** (invertido) ¿residente 5 años? | **NO** → continuar | **SÍ** → `residente_5_anios` | ambiguo |

**Textos:**
| Clave | Texto | Estado |
|---|---|---|
| F2 pregunta | `¿Qué día te diste de alta en la Seguridad Social?` | final |
| F3 pregunta | `¿Has sido residente fiscal en España en los últimos 5 años?` | final |
| `sin_alta_ss` | `Antes tienes que darte de alta en la Seguridad Social 📋. Ese es el primer paso: en cuanto tengas tu alta, el plazo de 6 meses empieza a correr y podremos tramitar tu solicitud. Vuelve entonces y seguimos.` | final |
| `plazo_vencido` | `Ups… no puedes acogerte al régimen 😕. ¿Te ayudamos con tu declaración? ¿Necesitas ayuda? Contáctanos.` | final |
| `residente_5_anios` | (mismo que `plazo_vencido`) | final |
| `reintento_F1` | `Perdona, no acabo de entenderte 🤔. ¿Estás dado de alta en la Seguridad Social española? Respóndeme con un sí o un no, por favor.` | **placeholder** |
| `reintento_F2` | `Perdona, no he podido leer bien la fecha 🤔. ¿Me dices el día en que te diste de alta? Por ejemplo: 15/03/2024.` | **placeholder** |
| `reintento_F3` | `Perdona, no acabo de entenderte 🤔. ¿Has sido residente fiscal en España en los últimos 5 años? Respóndeme con un sí o un no.` | **placeholder** |
| `mensaje_continuar` | `¡Perfecto! Cumples los requisitos de esta primera parte ✅. Seguimos con el siguiente paso…` | **placeholder** |

**T005:** activar `fallbackOutput: "extra"` en `Filtro_Eliminatorio1` (hoy solo 3 salidas) y conectar la 4ª a `Set mensaje_continuar`.

---

## Sesión 2026-07-20 — Bloque ① Filtros eliminatorios (rutas F1/F2/F3)

### Objetivo de la sesión
Construir las 4 salidas del Switch `Filtro_Eliminatorio1` (hoy sin conectar) + el nodo `Enviar_F1_Inicial`, con la lógica determinista de descarte/continuación y el cálculo de plazo de F2. Envío de mensajes vía HTTP Request a Intercom. Persistencia (Airtable) diferida.

### Decisiones de la sesión
1. **Alcance:** solo rutas F1/F2/F3 + `Enviar_F1_Inicial`.
2. **Envío a Intercom:** nodo **HTTP Request** (POST reply a la API). No existía nodo de envío; se crea desde cero.
3. **Airtable: por ahora no.** Solo lógica + envío; guardado/soft-delete quedan como marcadores diferidos (Sticky Note).

### Hallazgos de la exploración inicial
- El export `n8n/mobility_bot (1).json` confirma que `Filtro_Eliminatorio` (F1/F2/F3 + fallback) **no tiene ninguna conexión de salida** → el bot termina ahí. Es el pendiente inmediato.
- **No existe ningún nodo de envío a Intercom** todavía; solo `Traer_Conversacion_intercom1` (GET). Hay que crear el mecanismo de envío.
- Nodos Airtable (`Search records1`, `Crear_Expediente`) **deshabilitados** y con base/tabla vacías.
- **Discrepancia de nombres:** el export del repo tiene nodos SIN sufijo; el editor en vivo usa sufijo `1`/`2` (`Webhook1`, `Crear_Expediente1`, `Filtro_Eliminatorio1`…). Se trabaja con los nombres del editor.
- Modelo de datos vigente: **v3 = tabla única `Expediente` + `datos_json` + soft delete** (`modelo_er_beckham_1/2.html`). `motivo_descarte` (select): `plazo_vencido · residente_5_anios · sin_alta_ss · incompleto · otro`.
- Flujo conversacional más reciente: **v0.7** (`flujo_bot_beckham_1.html`).

### Datos de referencia para los nodos

**Textos (literales):**
- **F1:** `¿Estás dado de alta en la Seguridad Social española?`
  - Descarte (No) · `sin_alta_ss`: `Antes tienes que darte de alta en la Seguridad Social 📋. Ese es el primer paso: en cuanto tengas tu alta, el plazo de 6 meses empieza a correr y podremos tramitar tu solicitud. Vuelve entonces y seguimos.`
- **F2:** `¿Qué día te diste de alta en la Seguridad Social?`
  - Lógica: `fecha_alta_ss + 6 meses >= hoy` → en plazo; si `< hoy` → descarte.
  - Descarte (+6m) · `plazo_vencido`: `Ups… no puedes acogerte al régimen 😕. ¿Te ayudamos con tu declaración? ¿Necesitas ayuda? Contáctanos.`
- **F3:** `¿Has sido residente fiscal en España en los últimos 5 años?`
  - Invertido: "No" cualifica · "Sí" descarta · `residente_5_anios`: mismo mensaje genérico que F2.

**Envío HTTP Request a Intercom:**
- `POST https://api.intercom.io/conversations/{{ $('Webhook1').item.json.body.conversation_id }}/reply`
- Auth: `intercomApi` credencial "Intercom Spain TEST" (misma que el GET existente).
- Body: `{ "message_type": "comment", "type": "admin", "admin_id": "<ADMIN_ID>", "body": "<texto>" }`
- Respuesta del usuario disponible en `last_message_content` (salida de `Formatear_conversacion1`).

### Tareas (M1)
| ID | Tarea | Estado |
|----|-------|--------|
| T001 | `Enviar_F1_Inicial` (Set) + `Callback_Intercom` (HTTP callback) + reconexión | ✅ hecho (sin publicar) |
| T002 | Ruta F1 (salida 0): `Interpretar_F1` → If → `Descarte_F1` / `Enviar_F2` | pendiente |
| T003 | Ruta F2 (salida 1): `Calcular_Plazo_F2` → If → `Descarte_F2` / `Enviar_F3` | pendiente |
| T004 | Ruta F3 (salida 2): `Interpretar_F3` → If invertido → `Descarte_F3` / `Continuar_Bloque2` | pendiente |
| T005 | Fallback (salida 3): `Fin_Bloque1` (NoOp) | pendiente |

### Plan de continuación (acordado 2026-07-20) — T002–T005 EN STANDBY
1. **Conectar un MCP de n8n** (preferido sobre la extensión de Chrome para editar n8n). La extensión de Chrome se reserva para **Intercom**.
2. **Rutas F1/F2/F3** (T002–T005) — en standby hasta tener el MCP.
3. **Paso "Reply"** en el workflow `n8n_BOT_mobility` de Intercom (cerrar el gap).
4. **Futuro:** sustituir los textos de los mensajes de los workflows por los redactados en el proyecto.

### Decisiones abiertas (a resolver al implementar)
- Interpretación sí/no y fecha sin AI Agent → Code node determinista (keywords + parseo de fecha, con fallback "no te he entendido").
- `admin_id` de Intercom para el reply.
- Mantener cada nodo `Enviar_*`/`Descarte_*` aislado e intercambiable (futuro agente de Paula).

### GIRO ARQUITECTÓNICO (importante) — el bot vive en Intercom
Tras revisar Intercom, se corrige la arquitectura y **se descarta** la decisión previa de "HTTP Request POST reply + admin_id":

- El bot lo conducen **3 workflows de Intercom**: `ON CLICK` (66243731), `REUSE` (66246057), `ANY MSG` (66250478).
- Un **Data Connector** `n8n_bot_mobility` (id 461046, **Live**) es el puente Intercom → n8n.
- Flujo real: usuario escribe → workflow Intercom → DC llama al webhook de n8n → **n8n calcula y DEVUELVE datos** → Intercom muestra el mensaje. **n8n NO llama a la API de Intercom.**
- El futuro **AI Agent vivirá en n8n** (para F1–F3 sigue siendo texto fijo determinista, Opción B).

### Contrato del Data Connector `n8n_bot_mobility` (leído en Intercom 2026-07-20)
**Request (Intercom → n8n):** `POST https://es.synapse.rentax.es/webhook/22de1fbd-bada-40b3-a120-41e519442139`
Body JSON:
```json
{
  "conversation_id": "{{conversation.id}}",
  "user_id": "{{user_id}}",
  "conversationPartId": "{{last_conversation_part.id}}",
  "message": "{{last_conversation_part.body}}",
  "nombre_apellidos": "{{full_name}}",
  "telefono": "{{phone}}",
  "user_email": "{{email}}",
  "partner": "{{custom_data.partner}}",
  "conversation_part_id_debounce": "{{conversation_part.id}}",
  "First Message ID": "{{initial_part.id}}"
}
```
**Response (n8n → Intercom):** Intercom **solo lee el campo `message` (String)**. Todo lo demás se ignora.
→ n8n debe devolver `{ "message": "<texto a mostrar>" }`.

**Estado actual detectado:** el "Test response" del DC es `"Workflow was started"` → el `Webhook1` de n8n responde en **modo inmediato** (ack por defecto), así que el DC **nunca recibe un mensaje calculado**. Hay que cambiarlo.

### Workflows de Intercom (mapeados 2026-07-20 vía navegador)
- **`reuse_mobility`** (66250478) · trigger "cuando el cliente envía cualquier mensaje" → muestra "This might take a few more seconds, please wait…" → **Pass to** `n8n_BOT_mobility`.
- **`n8n_BOT_mobility`** (66246057, **Reusable**, usado desde Inbox / OnClick Mobility / reuse_mobility):
  - **Path A**: Data Connector `n8n_bot_mobility` (síncrono) → "updates: `Message`" → **Wait for webhook** (asíncrono, recibe `mensajeUsuario`) → END. **⚠️ NO hay paso "Reply to customer" tras el Wait** (gap Intercom).
  - **Path B** (si el DC falla): responde "error n8n" → END.

### Contrato del CALLBACK asíncrono (Wait for webhook) — así entrega n8n el texto
n8n, al terminar su lógica, hace **POST** a:
```
https://api.intercom.io/hooks/workflows/trigger_step/q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015/<CONVERSATION_ID>
```
con body:
```json
{ "data": { "mensajeUsuario": "<texto a mostrar>" } }
```
- La URL lleva token embebido → **no requiere auth ni admin_id**.
- `<CONVERSATION_ID>` = `{{ $('Webhook1').item.json.body.conversation_id }}`.
- Intercom reanuda el workflow con `mensajeUsuario` (String) disponible.

### Arquitectura definitiva (resumen)
```
Usuario → reuse_mobility → "please wait" → n8n_BOT_mobility
   → DC llama al Webhook de n8n (n8n responde ack inmediato)
   → n8n hace debounce + lógica F1/F2/F3
   → n8n POST callback a Intercom con { data: { mensajeUsuario } }
   → Intercom reanuda y (debe) responder mensajeUsuario al usuario
```
- **Sync (DC):** n8n devuelve el ack; el campo `message` del DC queda sin uso real.
- **Async (callback):** por aquí viaja el texto verdadero (`mensajeUsuario`).
- **admin_id / HTTP reply a la API de conversaciones: DESCARTADO definitivamente.**

### Diseño corregido de F1–F3 (T001–T005)
- **NO** se cambia el modo de respuesta de `Webhook1` (sigue respondiendo ack inmediato al DC).
- Cada rama terminal fija el texto en un campo (`message`) y **converge en UN único nodo `Callback_Intercom`** (HTTP Request POST a la URL del callback con `{ "data": { "mensajeUsuario": "{{ $json.message }}" } }`).
- `Callback_Intercom` = **punto intercambiable** para el futuro AI Agent de Paula.

```
Filtro_Eliminatorio1
  ├ (nuevo exp.) Set msg=F1                                   ┐
  ├ F1 out0 → Interpretar_F1 → If ┬ no  → Set msg=descarte sin_alta_ss ┤
  │                               └ sí  → Set msg=F2                    │
  ├ F2 out1 → Calcular_Plazo_F2 → If ┬ vencido → Set msg=plazo_vencido ├─→ Callback_Intercom (POST a Intercom)
  │                                  └ plazo → Set msg=F3               │
  ├ F3 out2 → Interpretar_F3 → If ┬ sí → Set msg=residente_5_anios     │
  │                               └ no → Set msg=(bloque② placeholder) │
  └ fallback → Set msg=(placeholder)                                    ┘
```

### GAP en el lado Intercom (a resolver con Paula/Hammad)
En `n8n_BOT_mobility` Path A, tras "Wait for webhook" **falta un paso "Reply to customer"** que muestre `{{ mensajeUsuario }}`. Sin él, aunque n8n haga el callback, el usuario no verá el mensaje. Confirmar si está pendiente de añadir.

### Bitácora de progreso
- 2026-07-20 — Sesión iniciada. Explorados flujo (v0.7), modelo E/R (v3) y workflow n8n. Orchestron inicializado, 5 tareas M1 creadas. Plan aprobado.
- 2026-07-20 — Estado real del editor: `beckham_bot_test.json` (Crear_Expediente1 deshabilitado/passthrough; Filtro_Eliminatorio1 sin fallbackOutput; Webhook1 con pinData de prueba).
- 2026-07-20 — **Giro arquitectónico**: leído el Data Connector en Intercom. Contrato = respuesta `{message}`. Descartado HTTP Request + admin_id.
- 2026-07-20 — **Mapeados los workflows de Intercom** (reuse_mobility + n8n_BOT_mobility reutilizable). Descubierto patrón **asíncrono**: n8n entrega el texto vía **callback POST** a `trigger_step/...` con `{data:{mensajeUsuario}}` (sin auth). Detectado GAP: falta paso "Reply" en Path A. T001–T005 re-diseñadas sobre `Callback_Intercom` (HTTP Request al callback). Pendiente: confirmar el reply step con Paula antes de probar end-to-end.
- 2026-07-20 — Decisión: **Opción A (callback)**. **T001 CONSTRUIDO** en n8n vía navegador (paste de nodos + cableado): `Enviar_F1_Inicial` (Set) + `Callback_Intercom` (HTTP al callback). Reconectado `Crear_Expediente1 → Enviar_F1_Inicial → Callback_Intercom`. Guardado en copia de trabajo, **SIN publicar**. Workflow real: **`beckham_bot` (id nhOwpiGxikeU5DLR)** — ojo: es más grande que el export; los nodos desactivados de arriba son de otros bloques, no tocar.
- 2026-07-20 (tarde) — **MCP `n8n-mcp` conectado** (auth OK). Confirmado: `update_workflow` exige SDK completo (reescribe los 34 nodos → riesgo bloques langchain desactivados); `publish_workflow` es paso separado → `Cmd+S` guarda **borrador versionado**, no publica.
- 2026-07-20 (tarde) — **DISEÑO T002–T005 cerrado** con el usuario (Switch de 3 casos avanza/descarta/reintento; input ambiguo → reintento; F2 fecha texto libre parseada+normalizada; Bloque②/fallback → mensaje de continuar; se asume el bloqueo de Airtable). Ver "Diseño FINAL F1–F3".
- 2026-07-20 (tarde) — **M1 COMPLETO (T002–T005)** construido vía **Chrome paste** (17 nodos, `beckham_T002_T005_nodes.json`) + cableado manual de frontera, y **VERIFICADO por MCP**. Correcto: `Filtro` out0→`Interpretar_F1`, out1→`Calcular_Plazo_F2`, out2→`Interpretar_F3`; cada uno → `Ruta_Fx` (Switch 3 casos) → 3 `Set_*` → `Converger_Bloque1` → `Callback_Intercom`; `fallbackOutput=extra`. **Guardado en varias versiones borrador, NO publicado** (producción en versión activa antigua, intacta).
- 2026-07-20 (tarde) — **CAVEAT fallback (dead-code):** `out3` quedó conectado directo a `Converger` en vez de pasar por `Set_Fallback_continuar` (input sin alimentar). No se logró vía navegador (n8n no crea 2ª conexión al re-arrastrar de un output ya conectado). Diferido: es inalcanzable hasta cablear persistencia Airtable y no existe Bloque②. **Instrucciones para rematarlo a mano: ver sección "PENDIENTE — rematar fallback".**
- 2026-07-20 (tarde) — Aprendizajes del editor n8n registrados en el bloque RETOMAR (paste descarta conexiones de frontera; puertos del Switch ~12px; soltar exige handle de input exacto; no re-arrastrar de output conectado; edges del DOM virtualizados → verificar solo por MCP tras guardar).
- 2026-07-20 (tarde) — Creado **MVP de demo** (`mvp_beckham/index.html`) para presentar el modelo al manager, con branding tipo TaxDown. Resumen ejecutivo en `mvp_beckham/RESUMEN.md`.

---

## ✅ RESUELTO (2026-07-21) — fallback rematado a mano por el usuario

`Filtro` out3 → `Set_Fallback_continuar` → `Converger` → `Callback`. Verificado por MCP. Se conservan abajo las instrucciones por si hubiera que rehacerlo.

<details><summary>Instrucciones originales (histórico)</summary>

### PENDIENTE — rematar el fallback (out3 → Set_Fallback_continuar) a mano

**Qué falla hoy:** en `Filtro_Eliminatorio1`, la **4ª salida (Fallback)** va directa a `Converger_Bloque1`. Debería ir a `Set_Fallback_continuar` (que fija `message = mensaje_continuar`) y de ahí a `Converger`. Hoy `Set_Fallback_continuar` tiene su salida cableada a `Converger` pero **su entrada está suelta**.

**Pasos para arreglarlo en el editor de n8n** (`https://es.synapse.rentax.es/workflow/nhOwpiGxikeU5DLR`), **sin publicar**:
1. Abre el workflow y localiza `Filtro_Eliminatorio1` y su salida **Fallback** (la 4ª, la de más abajo).
2. **Borra** la conexión `Fallback → Converger_Bloque1`: pasa el ratón por encima de esa línea y pulsa el icono de **papelera** que aparece (o selecciónala y `Supr`). *(Truco: acércate al canvas con zoom para distinguir bien esa línea de las de los 10 `Set_*`.)*
3. **Arrastra** desde el punto de salida **Fallback** hasta el **borde izquierdo (input)** de `Set_Fallback_continuar` y suelta ahí (sobre el conector de entrada, no sobre el cuerpo del nodo). Como la salida Fallback quedará **libre** tras el paso 2, esta vez sí creará la conexión.
4. Resultado esperado: `Fallback → Set_Fallback_continuar → Converger_Bloque1 → Callback_Intercom`.
5. `Cmd+S` → guarda una nueva versión borrador (**no** pulses *Publish*).

> Es cosmético/futuro: la rama Fallback (`pregunta_pendiente = "completo"`) no se ejecuta hasta que haya persistencia en Airtable y exista el Bloque②. Puedes dejarlo para entonces.

</details>

---

## Cierre de sesión 2026-07-21
- Bloque ① **completo, verificado (MCP) y correcto** — incluido el fallback (rematado por el usuario). **Sigue en borrador, SIN publicar.**
- Creados `ARQUITECTURA_bloque1.md` y `mvp_beckham/` (demo + `RESUMEN.md`).
- Se migra a una **versión mejorada de la skill de orquestación** en la próxima sesión: usará su propia carpeta de logs; `.orchestron/` queda como contexto histórico de solo lectura.
- **Próximos pasos** (sin empezar): (1) paso "Reply" en Intercom, (2) persistencia Airtable, (3) test e2e, (4) textos finales, (5) Bloque ②. Detalle en el bloque "RETOMAR AQUÍ".

---

## Cierre de sesión 2026-07-22 — Migración del filtro a Intercom

**Contexto:** tras reunión con manager, los filtros F1/F2/F3 salen de n8n y viven en el bot de Intercom.

**Hecho hoy (todo en BORRADOR, sin publicar):**
- **Intercom `OnClick Mobility`** construido entero (guiado por Claude, ejecutado por el usuario en el editor): Welcome con explicación de la Ley (①–⑤) + ¿acogerte? · **reordenado** a Residencia → Alta SS → Fecha (residencia = descarte duro primero) · descartes (`Fue residente`, `Fuera de plazo` con Close) · Welcome-No → cierre soporte · Tag `jarry_ignore` al inicio · cualifica → Assign `Ops_BOT_Mobility` + Pass a `n8n_BOT_mobility`.
- **Rama "lead potencial"** (Alta SS = No): en vez de descartar, mensaje amable + conectada al path final (H) para crear el expediente igualmente y no perder el lead. (Se borró una nota interna que se había pegado como mensaje al cliente.)
- **Intercom `n8n_BOT_mobility`**: añadido paso **"Reply" `{{mensajeUsuario}}` + fallback** → gap del mensaje resuelto.
- **Auditado el CSV nuevo** (`Empleados-Grid view (1).csv`): F3 → `Noresidenteultimosanios`, descarte → `Descarte` (single-select), `Status` = estado. Detectado que **falta campo para `conversation_id`** de Intercom.
- **Diseño del agente IA** documentado en `sesion_2026-07-21_agente-ia.md` (tools, subworkflows, contrato, salida JSON, multi-turno, derivación humana, mapa de impacto para la limpieza de n8n).
- Memoria del proyecto actualizada.

**No hecho (para mañana):** borrar los nodos de filtro obsoletos en `beckham_bot` (se dejó para mañana, se hará a mano; `beckham_bot` está PUBLISHED/producción). Ver lista y orden en "RETOMAR AQUÍ".

**Aprendizaje de sesión:** el editor visual de Intercom (workflows) usa **"Reply buttons"** para ramas Sí/No, **"Collect data" + atributo Date** para fechas (muestra date-picker), y **"Branches"** para ramas automáticas. Es denso: construir por captura es frágil → mejor dictar y que el usuario ejecute.

---

## Cierre de sesión 2026-08-10 (lunes) — WP-205b, cierre de conversación y el respaldo del prompt

**Estado del workflow al cerrar:** `beckham_bot` `versionId == activeVersionId == 7e499c3b`,
**51 nodos**, **52 columnas** mapeadas, tool `guardar_datos_cliente` con **36 parámetros**,
`Validar y Normalizar` de **869 líneas**, `typecast: true`, **cero `.item`**.
Prompt en LangSmith: **v7**, tag `prod`.

### Cerrado y verificado hoy

| Ficha | Qué |
|---|---|
| T051 | **Email:** decisión del usuario, todos los users que entran tienen email. No hay lead sin email, así que el hueco del visitante anónimo no se da. |
| T037 | **Era una ficha falsa mía.** La nacionalidad YA se guardaba: columna, parámetro 30 de la tool, línea 687 del validador y mapeo, todo existía. La cazó el usuario preguntando "¿ya existe eso?". Verificada con un curl: `marroquí` → `MARRUECOS`, y `PaisNacimiento` no se pisa. |
| T047 | **Cónyuge:** `ConyugeQuiereAcogerse`. PF5b ya preguntaba y el dato se tiraba. Probado en sus dos sentidos; `AplicaBeckham` intacto en las cuatro llamadas. |
| T048 | **Discrepancia de fecha de alta:** `DiscrepanciaFechaAlta`. Decisión de negocio: avisar en el chat, ofrecer la llamada aunque el caso sea claro, y **no bloquear ni descartar**. Con guarda de forma contra el bug del `[object Object]`. |
| T046 | **Opción huérfana** de `Propiedades` e `Inversiones` borrada por el usuario en la UI (el MCP no toca `choices`). Curl de humo después, porque el nodo cachea el esquema. |
| **T056** | **WP-205b ENTERA.** `count==0` crea · `count==1` actualiza · `count>1` → `multi_match`, avisa a Slack y **no escribe**. Más `last_idem_key`: repetir el payload byte a byte devuelve `dedup:true` **sin ejecutar el nodo de Airtable** (probado en el `runData`), y cambiar un solo carácter vuelve a escribir. El lector pasó de `limit:1` a `2` para poder **detectar** el duplicado. |
| T058 | **El `nie` que perdía ficheros.** `tipo_documento=nie` se descartaba con `ok:true` y el fichero no se guardaba. Una línea. |
| T055 | Regla de la discrepancia, dentro del prompt. |
| T038 | **El respaldo del prompt se actualiza solo.** `Refrescar_Respaldo` escribe en la Data Table desde la rama **sana** del guardián, en paralelo al agente y terminal. Verificado en conversación real. |
| T049 | **Cierre de la conversación de Intercom.** Mecanismo publicado y el prompt v7 con la sección `CIERRE DE LA CONVERSACIÓN`. |
| T050 | Spec de estructura canónica de documentos escrita (`docs/estructura-canonica-documentos-2026-08-10.md`). |

### Tres fallos silenciosos cazados por el diff estático

Ninguno se veía por curl ni por la respuesta del webhook. Los tres justifican la auditoría por MCP:

1. **`detalle_alerta` truncado** al pegarlo en la UI: quedó solo la expresión y `beckham_alertas`
   declara sus entradas como `string` con `attemptToConvertTypes:false`, así que el número la
   rechazaba. La guarda de datos **sí** funcionaba; lo que fallaba era el aviso.
2. **`Refrescar_Respaldo` colgado de la rama del error.** Habría machacado el respaldo bueno con
   basura en el primer 404 de LangSmith: la red de seguridad convertida en acelerador del fallo.
   Además con `activo:false` y sin filtro de fila.
3. **El mapeo de `Empresa`** (del viernes) sustituido en vez de añadido. Solo se ve diferenciando la
   **lista** de nombres de columna, no el número.

### Errores propios, escritos para no repetirlos

- **Arrastré el parche v5 sin validar dentro del v6** y metió un **bucle infinito** en la pregunta
  del idioma: el bloque decía "manda los dos mensajes SIEMPRE, PASE LO QUE PASE" y contradecía otra
  línea del mismo bloque. Arreglado en v6.1 mirando el historial y guardando el idioma. **Regla: no
  arrastrar a una publicación parches que el log marque como no verificados.**
- **Ficha T037 creada sin seguir el dato hasta la celda**, el mismo error del email de operador del
  viernes.
- **Diseño del cierre mal planteado la primera vez:** puse un `If` tras `Callback_Intercom` leyendo
  `$('Validar y Normalizar')`, y son **dos ejecuciones distintas** (conversación vs escritor).
- **Propuse crear un API key de n8n** para arreglar la visibilidad de la credencial. No existe esa
  opción: el MCP es el **servidor integrado** de n8n.

### Lo que queda · 10 paquetes

`T015` bloque 7 · `T005` DC principal · `T006` los 4 puntos D/H/G/N · `T007` e2e en Messenger ·
`T008` publicar · `T041` la URL de adjuntos que caduca · `T036` modelos 030 y 149 ·
`T057` PDF-resguardo · `T031` estados 030/149 · `T052` idioma al canvas (aplazada a producción).

**Y tres que se cierran mañana:** conversación completa que pruebe el cierre real, las casillas de
los 030/149 (las concreta el usuario) y **reactivar el auth de los webhooks**.

### Deuda declarada

- La credencial `beckham_webhook_auth` **no la ve la identidad del servidor MCP** de n8n, así que
  con el auth puesto se pierde el diff estático. Pendiente de los devs.
- El token de los webhooks ha pasado por la terminal y está en el log: **generar otro antes de
  producción**.
- Si el cliente nunca contesta a "¿alguna otra duda?", la conversación **se queda abierta**. Haría
  falta un proceso por tiempo.
- Comentario obsoleto en las líneas 338-339 del validador: ya no hay dos opciones duplicadas.

---

## Cierre de sesión · 2026-08-11

### Lo que se cerró de verdad

**El cierre de Intercom funciona.** Era la duda que quedaba del lunes: el mecanismo estaba publicado
y probado por curl, pero eso solo demostraba que el dato se guardaba. Hoy, en la conversación
`215475438827585`, Intercom devolvió `state: "closed"`, `open: false` y una última parte de tipo
`close` a las 11:05:54. El bot manda el mensaje de despedida **y luego** cierra, en ese orden — un
mensaje sobre una conversación cerrada la reabriría.

**El prompt v7 está vivo.** Leído del campo `texto` que escribe `Refrescar_Respaldo` en la traza:
46.319 caracteres contra los 44.053 del v6.1. Los 243 de diferencia con la copia local no son un
parche colado: son las dos variables sustituidas, `{current_date}` y `{contexto}`. Once líneas de
diff, todas de sustitución.

**`conyuge_quiere_acogerse` probado en conversación real.** No se podía comprobar desde la fila
porque es un checkbox y la respuesta fue "no", indistinguible de "no se preguntó". Estaba en la
traza: `"conyuge_quiere_acogerse": "no"`, y el validador escribe `false` explícitamente.

### Un bug que cazó el usuario

`Decidir_Status` daba **siempre** `2. Pendiente llamada TD` a todo el que quisiera acogerse, hubiera
llamada o no. Un expediente completo se quedaba clavado ahí. El nodo no sabía que existía
`motivo_cierre`. Arreglado: `expediente completo` → `3. Pte hacer informe`, que es el peldaño que ya
estaba en la escalera. **Publicado y sin probar**, por decisión del usuario.

### Tres cosas que ya estaban construidas y no lo sabíamos

1. **`WP-237` casi entero.** El botón `EnviarBorradores` existe, la automatización envía el correo en
   dos idiomas con los adjuntos y el enlace de confirmación, y el formulario de vuelta fusiona la
   fila y borra el duplicado. **Solo falta el salto de `Status` 7 → 8.**
2. **`WP-236` tenía plantilla.** El informe Mobility que pasó el usuario es exactamente el documento
   que la ficha daba por inexistente. Y sus tres bloques (A/B/C) encajan uno a uno con las dos
   columnas de fórmula que ya existen.
3. **El formato de resumen que pedía el usuario ya estaba en el prompt**, líneas 58-83. Lo que fallaba
   era la descripción de la tool, que pedía explícitamente lo contrario.

Van **cinco** veces en este proyecto: el camino existe y nadie lo usa.

### El modelo 030 cambió de naturaleza dos veces en el mismo día

Por la mañana se recortó a **solo el 030** (el 149 lo hacen los fiscales a mano). Por la tarde, al ver
el fichero real, resultó que **el entregable nunca fue un PDF**: es un fichero `.030` de texto
posicional de ancho fijo que el fiscal sube a la sede y **es Hacienda quien genera el PDF**. Los dos
PDF que se analizaron eran renders planos, sin un solo campo rellenable.

El coste real no son columnas nuevas: son **tablas de conversión**, porque el fichero quiere códigos
(ISO-2, código INE de municipio) y Airtable guarda nombres.

### Mis errores de hoy

- Dije que `Decidir_Status` quedaría en **161 líneas** y quedó en 164. Conté el parche entero como
  añadido sin descontar las seis líneas que ya eran idénticas.
- Creé la ficha `WP-239` como "cambio de prompt" y **a los diez minutos** hubo que reescribirla: era
  cambio de tool. No leí la tool antes de escribir la ficha.
- Iba a crear `WP-237` como WP de construcción **antes de auditar lo que ya existía**. Lo audité justo
  a tiempo y resultó estar hecho casi entero.
- Validé el JS del mapa quitando los backticks, y el fallo que reporté era mío, no del fichero.

---

## Cierre de sesión · 2026-08-12

### Cerrado hoy

**`T041`** dejó de ser «comprobar si funciona» y pasó a ser «detectar cuándo no». Airtable **no se
descarga el adjunto al escribirlo**: acepta la URL, responde al instante y lo baja después en segundo
plano. Probado siguiendo el mismo `id` de adjunto en dos momentos. Si la URL de Intercom caduca antes,
el fichero se pierde y **nadie se entera**. Workflow `beckham_adjuntos_huerfanos` activo cada hora.

**`WP-234`** publicada y auditada: columna `SenalesComplejidad` con las siete señales del Bloque 6, y
los siete nombres comparados **carácter a carácter** contra Airtable — con `typecast: true` un nombre
mal escrito no falla, crea una opción nueva.

**`WP-237`** resultó ser un salto de `Status`, no un paquete de construcción. Encendida.

**`WP-232`**: inventario de automatizaciones con las cuatro capas, y runbook del turno mudo.

**El contrato del `.030` cerrado con cinco muestras.** Solo queda la zona del domicilio.

### Dos correcciones a lo que yo mismo había dado por bueno

Con tres muestras declaré que la cabecera `20250203` era una **constante**. Con cinco resultó ser la
**versión del formato**: la quinta trae `20190101`. **Tres muestras iguales no hacen una constante.**

Y la «incidencia técnica de la Agencia Tributaria» que el correo le cuenta al cliente **no es de la
Agencia Tributaria**: solo pasa con la versión vieja, y es del generador.

### El muro del día

Las automatizaciones de Airtable que construyó Iciar tienen **seis fallos, dos rojos**. No se han
podido arreglar: **Airtable no deja crear ni editar acciones de script por API** (`readOnlyNodeType`),
y el usuario **no puede editarlas en la UI** aunque es Creator de la base.

Es el **tercer sistema** donde el proyecto se bloquea por credenciales que no son suyas. Eso ya no es
un problema técnico: es una conversación con Ops.

### Mi error del día

El usuario me dijo que no podía editar los scripts, y **seguí varios turnos dándole instrucciones para
pegar código en esos mismos scripts**. Se lo había dicho claro. Cuando alguien declara un bloqueo, ese
bloqueo entra en el plan inmediatamente; no se sigue produciendo entregables que lo ignoran.

---

## Cierre de sesión · 2026-08-13

### La deuda de verificación se acabó

Las tres cosas que llevaban dos días publicadas sin probar quedaron verificadas en una sola
conversación: `WP-234`, `WP-238` y `WP-239`. 79 ejecuciones, cero errores.

**Y `WP-238` arreglaba un caso peor del que fui a arreglar.** La traza demuestra que la fila estaba
en `1. Interesado` y subió a `2` sólo por la rama nueva. La causa raíz que no vi al escribir el
parche: **un caso complejo nunca marca `AplicaBeckham`** — esa confirmación sólo se pide en la rama
de caso claro. Así que todo cliente complejo que agendaba llamada se quedaba en «1. Interesado» y el
equipo no tenía forma de saber que había una llamada pendiente.

**La protección del typecast se vio funcionar en vivo:** el agente mandó `El conyuge tambien quiere
acogerse` sin acentos y en la celda quedó con ellos. Sin el normalizador, Airtable habría creado una
opción nueva al lado de la buena.

### Las automatizaciones, rehechas sin una línea de script

La idea fue suya y era la buena: Airtable tiene acciones nativas de correo y de actualización, así
que todo lo que hacía el script se puede hacer sin script. Y sin script **sí se pueden crear por
API** — lo único que Airtable bloquea es `customScript`.

`2b` y `3b` sustituyen a las viejas, encendidas, con los cuatro fallos corregidos.

**Pero el arreglo que más valía no fue una automatización, fue una fórmula:** quitar `prefill_UserId`
de los enlaces de formulario. Con el `UserId` duplicado, confirmar rompía el expediente — saltaba la
guarda de unicidad y el bot dejaba de escribir. Sin él, la fila del formulario es inerte.

### El `.030` deja de ser un misterio

Dos tablas de conversión cerradas y comprobadas por script, tres columnas nuevas creadas y
publicadas, y el corpus fiscal extraído del manual. De los tres bloqueos que tenía el paquete,
quedan cero de conversión.

### Dos fallos de método, míos

1. **Mi propio script de auditoría dio una falsa alarma.** Dijo que se había perdido la columna
   `Apellidos empleado` y a la vez que se había añadido. No había cambiado nada: usaba `comm` sobre
   listas ordenadas, y las claves nuevas caen entre medias de la vieja con la ordenación local, lo
   que rompe la premisa de `comm`. Comprobado en hexadecimal y repetido con `diff`. **Para columnas,
   `diff`, nunca `comm`.**
2. **Los dos agentes de fondo acertaron el tipo de problema y fallaron los detalles.** Uno dijo que
   la vista se había quedado a medias y estaba entera; el otro atribuyó una errata a la columna
   equivocada, contó cinco opciones donde hay cuatro e inventó unos espacios que no existen. Los dos
   hubo que contrastarlos contra la fuente. **Verificar siempre, no leer su resumen.**

### Lo que sigue esperando a una persona

- El umbral pasa a **«entre 50.000 y 55.000»** por decisión suya, porque depende de la divisa. Toca
  el prompt (6 menciones), el `.docx` del informe y el corpus.
- La errata de la opción `Propiedades`: *«en España ni el extranjero»*, falta el «en».
- **Qué año manda en la cabecera del informe**, que sigue sin responder.

---

## Cierre de sesión · 2026-08-13

### Verificado en conversación real

`WP-234`, `WP-238` y `WP-239`, los tres que llevaban dos días publicados a ciegas. 79 ejecuciones,
cero errores.

**Y el bug del `Status` era peor de lo que yo había diagnosticado.** Un caso complejo **nunca** marca
`AplicaBeckham` — esa confirmación solo se pide en la rama de caso claro. Así que antes del parche,
**todo cliente que agendaba llamada se quedaba en «1. Interesado»** y el equipo no tenía forma de
saber que había una llamada pendiente. El parche arregla un caso más grave que el que fui a arreglar.

También quedó demostrada en vivo la protección del `typecast`: el agente mandó
`El conyuge tambien quiere acogerse` **sin acentos** y en la celda quedó el nombre canónico con
ellos. Sin esa normalización, Airtable habría creado una opción nueva sin que nadie lo viera.

### La idea del día fue suya

Preguntó por qué no hacíamos las automatizaciones **desde Airtable**, que también manda correos. Y
tenía razón: `2b` y `3b` están rehechas **sin una sola línea de script**, con acciones nativas. Eso
resuelve de raíz el problema que nos tuvo atascados media tarde — los scripts no se pueden editar ni
por UI ni por API, pero lo que no es script sí lo puedo crear yo por MCP.

### El daño de las filas huérfanas, cortado por una fórmula

Lo que rompía el expediente no era la fila duplicada: era que el enlace del formulario **prefijaba el
`UserId`**, y dos filas con el mismo `UserId` hacen que el bot deje de escribir. Quitar ese trozo de
la fórmula lo desactiva entero. Media tarde de plan de rehacer formularios evaporada por una línea.

### Cuatro cifras para un mismo umbral

Al contrastar el corpus contra el manual salió que **el umbral de salario no coincide entre
documentos propios**: el manual dice 55.000, el informe que se lleva el cliente dice 50.000, y el
prompt dice **55.000 y 60.000 a la vez** según el párrafo. El cliente puede oír una cifra en el chat
y leer otra en su informe.

### Mis errores de hoy

- Propuse montar un formulario de interfaz en modo actualización **sin comprobar antes si Airtable
  permite compartir con edición**. No lo permite: es solo lectura, y lo dice en su propia pantalla.
  Le hice montar una página para nada.
- En la auditoría dije que se había perdido una columna. **Era falso**: usé `sort` + `comm` para
  comparar listas con acentos y el orden no coincide. Lo cacé antes de reportarlo, pero era el
  género de falso positivo que este proyecto persigue en el código y yo cometí en la herramienta.
- Insistí en diagnosticar por qué no podía editar los scripts cuando lo útil era darle el paso a
  paso para crear una automatización nueva desde cero.
