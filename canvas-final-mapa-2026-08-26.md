# El canvas final · mapa consolidado y orden de construcción · 26/08/2026

> **SUPERADO EL 27/08/2026.** Este mapa se conserva como historia del análisis; lo vigente está en
> `docs/canvas-desde-cero-2026-08-27.md`. Tres cosas quedaron superadas el 26–27/08:
>
> 1. **El «bloqueo» de la §2 ya no existe.** El 26/08 el usuario cerró `T077` con la **opción B**
>    (el modo viaja como **input del Data Connector**) y `WP-210` está reescrito. La columna del
>    menú (17 PRDs) quedó desbloqueada; la decisión está cerrada y no se reabre.
> 2. **La §3 (aplicar `WP-216` sobre el canvas actual) quedó superada el 27/08.** El canvas se
>    reconstruye **desde cero en una copia** según `docs/canvas-desde-cero-2026-08-27.md`, y las
>    correcciones de `WP-216` van **dentro** de ese rebuild, no como parche del canvas viejo.
> 3. **M6 (§7) quedó decidida el 26/08**: SLA de **24–48 h**, y viaja además en el prompt v14. Ya
>    no bloquea el texto publicable de `WP-223`.

Este documento existe porque **el diseño del canvas definitivo está repartido en veinticuatro PRDs y
eso no se puede clicar**. Aquí está junto, con el grafo de dependencias real, el punto exacto donde
está bloqueado, y lo que se puede construir hoy sin decidir nada.

Leído de los PRDs de `docs/prds/fase2/`, no de memoria.

---

## 1 · El canvas que hay hoy en producción

`OnClick Mobility`, Custom Bot del workspace TEST. Cuatro puntos de persistencia (**D · H · G · N**) y
tres filtros:

```
A  Bienvenida ─ ¿quieres acogerte?
│                └─ no ──► ANO  cierre a soporte
└─ sí ──► B  FILTRO F1 · ¿residente fiscal en España los últimos 5 años?
          │        └─ sí ──► D  🔴 DESCARTE DURO · 💾 persiste · CIERRA
          └─ no ──► E  FILTRO F3 · ¿alta en la Seguridad Social?
                    │        └─ no ──► H  🟡 LEAD POTENCIAL · 💾 persiste
                    └─ sí ──► F  Collect data · fecha de alta en la SS
                              └─► DC1  beckham_f2_plazo  ⚡ SÍNCRONO
                                  └─► I  FILTRO F2 · branch sobre veredicto_f2
                                       ├─ en_plazo    ──► G  🟢 CUALIFICA · 💾 · pasa al agente
                                       ├─ fuera_plazo ──► N  🔴 DESCARTE POR PLAZO · 💾 · CIERRA
                                       ├─ else        ──► K  reintento de fecha
                                       └─ error       ──► O  escalar a humano
G ──► reuse_mobility · turnos 2..n · wait_for_callback ──► beckham_bot
```

Los cuatro puntos llaman al **escritor único** (`beckham-upsert-expediente`) con su `punto`. La
whitelist de `punto` está cerrada y es `descarte_residencia | lead | cualifica | descarte_plazo |
faq_entrada | autodescarte_declarado` (`WP-206`, hecho).

**Esto funciona hoy.** Entran leads reales por aquí.

---

## 2 · El bloqueo, y es de diseño, no de trabajo

El canvas nuevo gira alrededor de un **menú** con cuatro salidas, y para eso hace falta saber **en qué
modo está el usuario** en cada turno. Ese es `modo_bot`, y su contrato es `WP-210`.

**`WP-210` depende de `WP-209`, la conversación sonda, que está MUERTA** (decisión del 14/08; sus nueve
incógnitas quedaron sin cerrar). Y el propio PRD lo dice:

> *«WP-209: si la sonda devuelve `OTRO_PATH_FALLA`, **este contrato cambia de transporte** (el modo
> pasa a ser input explícito y obligatorio de cada llamada al DC) y hay que reescribirlo antes de
> construir.»*

`WP-212` (el reset del modo al inicio) depende también de la sonda, para saber si `Set` admite cadena
vacía. Y `WP-229` igual, para saber si `Pass to` entre dos reusables funciona.

### Qué cuelga de ahí

```
WP-209 sonda ✝ MUERTA
   └─► WP-210 contrato del modo ─┬─► WP-211 Resolver_Modo ─┬─► WP-227 Reopened y reentrada
                                 │                          └─► WP-221 FAQ de un turno
                                 └─► WP-212 reset al inicio ──► WP-213 MENÚ ─┬─► WP-214 calculadora
                                                                              ├─► WP-215 autodescarte
                                                                              ├─► WP-221 FAQ
                                                                              └─► WP-223 humano/optout
                                                                                        └─► WP-233 e2e y PUBLICAR
```

**Sin decidir el transporte del modo no se puede construir nada de esa columna.** Y son diecisiete de
los veinte PRDs pendientes.

### La decisión que hay que tomar, y es de una línea

**¿Cómo viaja el modo?**

| | Opción | Qué implica |
|---|---|---|
| **A** | **Atributo persistido** (`modo_bot` en los custom attributes), como está escrito hoy | Hace falta que el paso `Set` del canvas pueda escribirlo y **vaciarlo** al inicio. Si no puede vaciarlo, hace falta un centinela y un TTL como texto ISO parseado en n8n. Es lo que la sonda tenía que confirmar |
| **B** | **Input explícito del Data Connector** en cada llamada | No depende de `Set` ni de resets. A cambio, **cada punto del canvas tiene que pasar el modo**, y un punto que se olvide manda un turno sin modo. `Resolver_Modo` pasa a ser fail-closed puro |

**B no necesita la sonda.** A la vista de que la sonda está muerta y de que quedan cinco días, B es el
camino que no está bloqueado — pero es una decisión de arquitectura, no mía.

---

## 3 · Lo que se puede construir HOY sin decidir nada

**`WP-216` · Correcciones del canvas** — está en `building`, **no depende de nada** («son eliminaciones
y correcciones de nombres») y arregla cosas que hoy pueden estar cerrando conversaciones de clientes:

| | Qué | Por qué importa hoy |
|---|---|---|
| 1 | **El typo `veredicto_f2`** corregido en toda la Fase 2 | El atributo con «i» **no existe**, así que un branch sobre él **cae siempre al `else`** — y el `else` **cierra la conversación**. Hecho verificado |
| 2 | **Borrar `M. Path`** | Los outputs de un DC son locales al path y su `Object mapping` **pisa** el resultado del primero. El veredicto ya está en el atributo tras `F`. `fuera_plazo` pasa a ir a `N` directo |
| 3 | **Borrar `SAVE`** | Escribir un atributo en un paso para leerlo en otro es el patrón que costó cinco días en WP-04. La fecha viaja como input del DC en el mismo path |
| 4 | **Tres verbos de cierre separados** | `Close conversation` **solo** en `D` y `N`. El resto termina con el hilo **abierto**, y **ninguna rama toca `ticket.state`** |
| 5 | **Rediseñar el `else` de `I. Path`** | Separar «fecha no parseable» (repreguntar con `intentos_fecha_bot`: `<2` repreguntar con ejemplo literal, `==2` escalar) de «veredicto vacío» (fallo de sistema → escalar **sin** repreguntar). Se elimina `K → FRETRY → M` |
| 6 | **Eliminar `FLAG` y `RESUME → B`** del diseño | No se construyen |

Eso es un canvas **más sano hoy**, sin tocar el diseño nuevo y sin depender de ninguna incógnita.

---

## 4 · Lo que NO puedo hacer yo, y hay que saberlo antes de empezar

**El canvas no se toca por API.** El MCP de Intercom de esta sesión solo lee conversaciones, contactos,
compañías y artículos: **no expone Custom Bots, Workflows ni Data Connectors**. Se construye clicando.

Lo que sí puedo: preparar cada paso con su payload exacto, y verificar el resultado leyendo las
conversaciones y las ejecuciones de n8n.

## 5 · Y cómo hacerlo sin quedarse sin embudo

Hoy entran leads reales por el canvas. La vía limpia en Intercom es **duplicar el Custom Bot**, montar
el nuevo en la copia, probarlo en incógnito y **cambiar el disparador al final**. Mismo trabajo, y si
algo sale mal el viejo sigue vivo. `WP-233` ya lo pide, con otras palabras:

> *«Backup `OnClick Mobility — BACKUP AAAAMMDD` antes de publicar.»*

Y su matriz de aceptación es la que manda: **cuatro recorridos del menú** (comprobar requisitos ·
calculadora · preguntas · humano) y **cuatro escenarios de reentrada** (hilo abierto · hilo cerrado ·
dentro del cooldown de 2 min · vuelta a los 3 días), cada uno con su par `conversation_id` **no-Preview**
y su `execution_id`.

---

## 6 · Las otras dependencias que hay que mirar antes de prometer fechas

No son del canvas, pero el canvas nuevo las necesita y **ninguna está hecha**:

| PRD | Estado | Lo necesita |
|---|---|---|
| `WP-207` extraer el escritor a subworkflow | `specified` | `WP-224` (registro del lead en H) |
| `WP-208` `corr_id` de extremo a extremo | `specified` | `WP-211` (para el log del evento) |
| `WP-218` dos nodos de agente | `specified` | `WP-221`, `WP-223` |
| `WP-219` guarda de modo en las tools | `specified` | `WP-221`, `WP-223` |
| `WP-220` corpus fiscal | comprobar | `WP-221` — *«sin corpus aprobado el modo no es publicable»*. El corpus ya vive dentro del prompt desde el v9, así que esto puede estar hecho de facto: **hay que comprobarlo, no asumirlo** |

## 7 · Y dos decisiones de negocio abiertas que bloquean texto publicable

- **M6** — el SLA del escalado a humano. `WP-223` se puede construir, pero **el texto que promete un
  plazo no se publica** hasta que exista la decisión.
- **U3** — qué identidad se usa cuando no hay `user_id`. Hoy sin `user_id` el escritor devuelve **400 y
  no hay lead**, así que `WP-224` tiene un agujero por arriba.
