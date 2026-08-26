# Todo lo que falta para cerrar el proyecto · 26/08/2026

Inventario completo, leído del tracker y de los 39 PRDs de la Fase 2. Nada filtrado.
**Fecha de entrega: 31/08/2026 — quedan 5 días.**

---

# PARTE 1 · TODO lo que falta

## 1.1 · PRDs de la Fase 2 · 12 hechos, **27 sin acabar**

`building` **4** · `specified` **22** · `skeleton` **1**

## 1.2 · Tareas del tracker abiertas

| Tarea | Qué | Estado real |
|---|---|---|
| `T065` | Cablear el v2 del informe y despublicar el v1 | 🔴 bloqueada · credencial de Google de Alina |
| `T069` | Contraprueba NRF del v2 | 🔴 bloqueada por lo mismo |
| `T075` | El `else` perdido de la guarda española | ⏸️ deuda aceptada, no se toca |
| `T076` | El filtro `Empresa != TaxDown` deja pasar la celda vacía | ⏸️ deuda aceptada, no se toca |
| `T077` | **Decidir el transporte del `modo_bot`** | ⛔ **decisión tuya · desbloquea 17 PRDs** |
| `T078` | `WP-216` correcciones del canvas | ✅ construible hoy |
| `T005`–`T008`, `T015` | Los Data Connectors del canvas viejo | ⚠️ **quedan absorbidos** por el canvas nuevo: si se rehace, se cierran o se rehacen con él |

## 1.3 · Decisiones que no son de código y bloquean cosas

| | Decisión | Qué bloquea |
|---|---|---|
| **T077** | ¿el modo viaja como atributo persistido o como input del DC? | `WP-210` y con él 17 PRDs |
| **M6** | el SLA del escalado a humano | el **texto publicable** de `WP-223` (el mecanismo sí se puede construir) |
| **U3** | qué identidad se usa cuando no hay `user_id` | el agujero por arriba de `WP-224`: hoy sin `user_id` el escritor devuelve **400 y no hay lead** |
| — | ¿se hacen los recordatorios? | `WP-230` está condicionado a que el manager lo apruebe |
| — | `WP-203` auth de webhooks | **descartado por ti** el 26/08 (`T053`). Queda como PRD `building` que no se va a construir |

## 1.4 · Cosas fuera de mi ámbito, por tu decisión

- **El envío del informe al cliente.** El PDF se genera, se sube y se marca, y la `5` está
  `undeployed`. Lo llevas tú.
- **Las filas de prueba de la tabla.** No se limpian.
- **`Automation 1`** no se borra.

---

# PARTE 2 · Lo que hay que cerrar para el canvas nuevo y la arquitectura final

Esto es el **orden topológico real**, calculado de los `depends_on`. Siete niveles de profundidad.

## Nivel 0 · nada lo bloquea, se puede empezar hoy

| | Qué | Nota |
|---|---|---|
| **T077** | **Decidir el transporte del modo** | Es lo único que abre la columna del menú. `WP-210` depende de `WP-209`, **la sonda que está muerta** |
| `WP-216` | Correcciones del canvas | Incluye el typo **`veredicto_f2`**: el atributo con «i» no existe, el branch cae **siempre** al `else` y el `else` **cierra la conversación** |
| `WP-207` | Extraer el escritor a subworkflow | **Sus tres dependencias están hechas** (`WP-201`, `205`, `206`). Nadie se había dado cuenta de que ya se puede |
| `WP-220` | El prompt como fuente única del conocimiento fiscal | `building`. **Probablemente hecho de facto**: el corpus vive dentro del prompt desde el v9. Hay que comprobarlo, no asumirlo |
| `WP-232` | Runbook, inventario y gates | Sin dependencias |

## Nivel 1

`WP-208` (corr_id) ← `WP-207` · `WP-210` (contrato del modo) ← **T077** · `WP-224` (lead en H) ← `WP-207`+`WP-216` · `WP-217` (handoff en frío de G) ← `WP-216`

## Nivel 2

`WP-211` (Resolver_Modo) ← `208`+`210` · `WP-212` (reset) ← **T077**+`210` · `WP-218` (dos nodos de agente) ← `211` · `WP-225` (vista de leads) ← `224` · `WP-226` (semántica de reset) ← `224` · `WP-231` (observabilidad) ← `208`

## Nivel 3

`WP-213` **el MENÚ** ← `212` · `WP-219` (guarda de modo en las tools) ← `211`+`218` · `WP-227` (Reopened y reentrada) ← `211`+`212`

## Nivel 4

`WP-214` (calculadora) · `WP-215` (autodescarte) · `WP-221` (FAQ de un turno) ← `211`+`213`+`218`+`219`+`220` · `WP-223` (humano y opt-out) ← `218`+`219` · `WP-230` (recordatorios) ← `225`

## Nivel 5

`WP-222` (corte de contexto y PII) ← `221` · `WP-228` (FAQ multi-turno) ← `221`+`222`+`227` · `WP-229` (FAQ→solicitud) ← **T077**+`221`+`222`

## Nivel 6 · la puerta

`WP-233` · **prueba e2e y publicar el canvas.** Su matriz de aceptación:

- **4 recorridos del menú**: comprobar requisitos · calculadora · preguntas · humano
- **4 escenarios de reentrada**: hilo abierto · hilo cerrado · dentro del cooldown de 2 min · vuelta a los 3 días
- Recorridos de dato: `en_plazo` · `fuera_plazo` · fecha no parseable ×2 · `H` con abandono · `H` con «en marzo»
- Cada uno con su par `conversation_id` **no-Preview** y `execution_id`
- **Backup `OnClick Mobility — BACKUP AAAAMMDD` antes de publicar**

## 2.1 · Lo que yo no puedo construir

**El canvas no se toca por API.** El MCP de Intercom solo lee conversaciones, contactos, compañías y
artículos: no expone Custom Bots, Workflows ni Data Connectors. Los clics son en la UI — tuyos, o míos
por navegador, que es lento y frágil para un bot de este tamaño.

Lo que sí: preparar cada paso con su payload exacto, construir todo lo de n8n, y verificar leyendo
conversaciones y ejecuciones.

---

# PARTE 3 · El plan para cerrarlo

## Lo que hago yo, en este orden, sin que decidas nada

1. **`WP-220`** — comprobar si ya está hecho. Si el corpus está en el prompt, se cierra y desbloquea
   `WP-221`. Es media hora y puede quitar un nodo de la ruta crítica.
2. **`WP-207`** — extraer el escritor a subworkflow. Sus tres dependencias están hechas.
3. **`WP-208`** — `corr_id` de extremo a extremo, que necesita `WP-211` y `WP-231`.
4. **`WP-232`** — runbook e inventario, sin dependencias.
5. Preparar **`WP-216`** clic por clic para que lo apliques de una sentada.
6. Auditar Intercom y cerrar o rehacer `T005`–`T008` y `T015`.

## Lo que necesito de ti, por orden de cuánto desbloquea

| | Qué | Desbloquea |
|---|---|---|
| 1 | **T077 · el transporte del modo** — A (atributo) o B (input del DC). Con la sonda muerta, **B es el único camino no bloqueado** | **17 PRDs** |
| 2 | Aplicar `WP-216` en el canvas | `WP-217`, `WP-224` |
| 3 | **M6** · el SLA del escalado | el texto de `WP-223` |
| 4 | **U3** · identidad sin `user_id` | el agujero de `WP-224` |
| 5 | ¿Se hacen los recordatorios? | `WP-230` |

## Y el dato de calendario, una vez

**26 PRDs en 7 niveles de profundidad, en 5 días.** El orden topológico no se puede paralelizar más
allá de lo que permiten las dependencias: el menú (`WP-213`) está en el nivel 3 y la publicación
(`WP-233`) en el 6. Si el alcance del 31/08 se mantiene entero, hay que decidir **qué entra en el
canvas publicado y qué se queda para después** — y esa decisión es tuya. No la vuelvo a plantear.
