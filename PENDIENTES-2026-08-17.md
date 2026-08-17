# Todo lo que queda · 17/08/2026

> Reconciliado hoy contra las tres fuentes: `state.json` (trabajo diario), los 39 PRD de
> `docs/prds/fase2/` (backlog) y `.spartax/log.md` (lo que de verdad pasó). **Donde el tracker y el
> log se contradicen, manda el log.**

## Lo primero: el tracker está desfasado

`WP-234`, `WP-235`, `WP-236`, `WP-238` y `WP-239` **están cerrados y verificados en conversación real
o con bytes**, y sus PRD siguen diciendo `building` o `specified`. `WP-209` está declarada **muerta**
(decisión del 14/08) y el PRD la sigue dando por viva. Hasta que eso se corrija, cualquier recuento
que salga del mapa es falso — y el mapa es lo que se enseña.

**Tarea: corregir los 6 estados y regenerar el mapa.** 15 minutos, y es lo que hace que el número
que se enseñe mañana sea el verdadero.

---

## A · Lo que bloquea el push a producción de mañana

Esto es lo que hay que tener resuelto para «empezar a subir cosas», no el 31/08.

| # | Qué | Por qué bloquea |
|---|---|---|
| A1 | **`WP-203` / `T053` · encender el auth de los webhooks** | Está **probado y apagado a propósito**. Y tiene un efecto medido: con el auth puesto, la API de n8n **no puede leer el workflow** (`Credential could not be found`), o sea que se pierde la auditoría por MCP que es lo que caza los fallos silenciosos. Por eso se enciende **lo último**. Y con **token nuevo**, no el de la prueba |
| A2 | **`T052` · el idioma al canvas** | Aplazado por ti con una condición explícita: «cuando se empiece a migrar a producción». Esa condición se cumple mañana |
| A3 | **Separación de entornos y limpieza de filas de prueba** | `Empleados` tiene **2 filas y las dos son de test**. Hay que decidir qué pasa con ellas antes de que entre la primera real |
| A4 | **`WP-204` · el prompt deja de mentir** | `maxIterations` y cuadrar las aristas `ai_tool` con las tools que nombra el prompt. Hoy hay **dos tools reales negadas** en el texto |
| A5 | **`WP-216` · reestructura A/B del canvas y recolocar D/H/G/N** | **`T006` depende de esto**: los 4 puntos de disparo están pendientes de recolocar desde el 4/08 |
| A6 | **`T005` · `T006` · `T007` · `T008`** | El DC principal, los 4 puntos, el e2e en Messenger real de los cuatro caminos, y el **botón de publicar**. `T008` es literalmente *Set changes live* |
| A7 | **`WP-231` · observabilidad y alertas** | Parcial: `beckham_alertas` ya vive como `errorWorkflow`. Falta el resto. En producción, sin esto los fallos son mudos |

## B · Lo que el plan maestro pone para HOY (tramo 3, lunes 17)

| # | Qué | Peso |
|---|---|---|
| B1 | **`WP-220` · el corpus fiscal al prompt** — ya extraído en `docs/corpus-fiscal-beckham-2026-08-13.md`. **Falta meter que la prestación por paternidad de la SS SÍ tributa**, que la plantilla del informe ya lo dice y el prompt no | S |
| B2 | **`WP-214` · rama calculadora** | S |
| B3 | **`WP-215` · autodescarte declarado** | S |

**`WP-220` es la palanca del día:** desbloquea la cadena entera del FAQ, 11 paquetes.

## C · La cadena del FAQ y del modo — 11 paquetes, ~19 puntos

Bloqueada detrás de `WP-220`. Es un bloque coherente: comparte sesiones de canvas y publicaciones.

`WP-210` contrato del modo (S) · `WP-211` `Resolver_Modo` fail-closed (M) · `WP-212` reset de
`modo_bot` (S) · `WP-213` menú `AOPT` (S) · `WP-218` dos nodos y un solo agente (M) · `WP-219` guarda
en el borde de las tools de escritura (M) · `WP-221` FAQ de un turno (L) · `WP-222` corte de contexto
y PII (M) · `WP-226` semántica de reset por `punto` (L) · `WP-227` reentrada y trigger `Reopened` (M)
· `WP-229` FAQ → solicitud (M)

> **Invariante que conviene no olvidar:** el menú **no es un punto de entrada garantizado**, porque el
> Messenger **reanuda el hilo abierto**. Es el mismo mecanismo que rompió el D0 del idioma.

## D · Leads y handoff — 5 paquetes, bloqueados por decisiones de negocio

| Paquete | Espera a |
|---|---|
| `WP-217` handoff en frío de `G` (M) | — |
| `WP-223` `escalar_humano` y `registrar_optout` (M) | **M6** · SLA, horario y capacidad de `Ops_Mobility` |
| `WP-224` registro del lead en `H` (M) | — |
| `WP-225` vista Leads, opt-in y contrato de datos (M) | **M2** dueño del seguimiento · **M3** base legal y retención |
| `T015` DC de persistencia en D/G/N para los descartes que mueren en los filtros | — |

## E · Bloqueado por fuera. Ninguna cantidad de horas mías lo sustituye

| Paquete | Espera a |
|---|---|
| `WP-228` FAQ multi-turno en n8n (L) | **WP-10** · configuración del workspace de Intercom |
| `WP-230` scheduler de recordatorios (L) | **WP-10** · **M1** alcance · **M2** dueño. **Y no tiene dueño asignado** |

## F · Infraestructura y cierre

`WP-207` extraer `BECKHAM_upsert_expediente` a subworkflow (M) · `WP-208` `corr_id` de extremo a
extremo y `Log_Evento` (M) · `WP-232` runbook y gates (**parcial**: el inventario, el runbook y los
tres `contract-test.sh` ya están entregados) · `WP-233` e2e de Fase 2 y publicación (M) ·
`T031` el bot actualiza los estados de los modelos 030 y 149 (M)

> **`T036` se puede cerrar hoy con una nota.** Su título dice «rellena los modelos 030 **y 149**», y
> la decisión tomada es que **el bot solo genera el 030**: el 149 lo rehace un fiscal a mano. Lo que
> estaba en alcance está entregado y probado con bytes.

## G · Deuda pequeña, cerrable en minutos

> **Cerrado el 17/08 y no se reabre:** el volcado de 245 países en las descripciones y el duplicado
> de `Checkout_Url` **se quedan como están**. No son deuda: son cosmética que no afecta a ningún
> camino de datos.

| Qué | Coste |
|---|---|
| **Probar que el PDF imprime `FechaLlamada`** — escribir la columna a mano en `recc6e7gYS6usQCQN`, marcar `RegenerarInforme`, mirar el PDF al tick de 15 min | 2 min + espera |
| **Los 44 arrastres de columnas** — `docs/arrastres-columnas-pendientes-2026-08-17.md` | manual, tú |
| **Corregir los 6 estados de PRD y regenerar el mapa** | 15 min |
| **`LinkFormulario030149` no tiene ninguna automatización detrás.** Todo lo que se envíe por ese formulario **se queda en una fila suelta** y nadie lo ve. Decidir: cablearlo o retirarlo | decisión |

## Riesgos declarados que NO son tareas — no se cierran con trabajo

- **Casillas 772-790 del `.030`** (bloque, escalera, planta, puerta): no se sabe cuál es cuál. El
  `.030` real de referencia lleva la planta en la 778 y nosotros la escribimos en la 784. **No se
  resuelve sin una muestra con planta Y escalera a la vez, y dijiste que no hay más muestras.**
- **La fecha de efectos del `.030`** (1390-1397): la regla es deducción nuestra, **no la ha firmado
  Fiscal**. Encaja con las cuatro muestras.
- **El umbral del régimen:** cuatro cifras distintas en cuatro sitios (55.000 / 60.000 / 50.000).
  Decisión cerrada: **no se toca sin Fiscal**, porque cambiarlo reescribe la semántica del enrutado.

---

## La aritmética, dicha una vez y sin adornos

**~59 puntos abiertos.** A la calibración medida del proyecto (1 punto ≈ 3 h de trabajo real con su
verificación) son **177 horas**. Quedan **11 días laborables** hasta el 31/08.

> **16 horas al día.** El plan maestro del 5/08 asumía 11, y ya era jornada doble.

Esto no es que se haya ido lento: entre el 10 y el 16/08 entró y se entregó alcance que **no estaba
fichado** — el `.030` completo, el informe Mobility en producción, las automatizaciones, y la
documentación del repo. Lo que no se ha movido desde el 5/08 es **la cadena conversacional de Fase 2**,
que son 21 de los 28 paquetes que quedan.

### Las tres palancas, y ninguna recorta alcance

1. **Agrupar la cadena del FAQ (grupo C) en 3 sesiones de canvas, no en 11.** El coste de un paquete
   no es el cambio: es abrir, publicar, auditar por MCP y probar. Agrupado, ~19 puntos se comportan
   como ~12.
2. **Cerrar los cinco bloqueadores de negocio mañana.** `M1`, `M2`, `M3`, `M5`, `M6`. No son código,
   son horas de otros, y **`M5` venció el 13/08**. Gatean 4 paquetes.
3. **`WP-10`.** Configuración del workspace de Intercom, ajena al proyecto. Gatea `WP-228` y `WP-230`,
   6 puntos. Si el 21/08 sigue abierto, esos dos días no se pueden ejecutar por dependencia externa.

### Los siete asks de la llamada de mañana, por orden de valor

`M2` · `M3` · `M6` (desbloquean `WP-223` y `WP-225`) → `M1` + **dueño de `WP-230`** → `WP-10` con Adri
y Fer → `M5` → **el token de Calendly** (el más barato de todos y el último en importancia).
