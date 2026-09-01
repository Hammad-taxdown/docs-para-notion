# INTERCOM · CONSTRUIR EL CANVAS NUEVO ENTERO · 27/08/2026

> Guía de construcción **total** del canvas nuevo. Sustituye y **amplía** la versión de la mañana del
> 27/08 (nada de lo que había se ha quitado). El canvas **no se toca por API**: el MCP de Intercom de
> esta sesión solo lee conversaciones, contactos, compañías y artículos — **no expone Custom Bots,
> Workflows ni Data Connectors**. Todo lo de aquí son clics.
>
> **Regla de las cifras y los nombres:** aquí solo hay números, ids y textos de UI que están leídos de
> un fichero del repo o de un export de n8n, con la fuente al lado. Lo que no está medido dice
> **DESCONOCIDO** en mayúsculas y lleva la comprobación que lo cerraría. Lo que dependa de **T081**
> (B pura vs B híbrida) lleva el aviso ⚖️.
>
> **ADAPTADA AL CANVAS REAL (27/08, tarde).** El canvas del usuario está leído abriéndolo en el
> navegador: **`docs/auditoria-canvas-nuevo-2026-08-27.md`**, y trae **tres** hechos que reescriben
> esta guía de arriba abajo:
>
> 1. **Son 32 paths (`A`…`AF`) con 11 END, y el flujo está DUPLICADO POR IDIOMA**: `A. Selección
>    Idioma` bifurca en `B. Introducción ESP` y `C. Introducción ENG`, y de ahí bajan **dos cadenas
>    paralelas completas**. El §4 de esta guía es un catálogo de **puntos**, no de paths: **cada punto
>    se construye DOS VECES**. Lo que se duplica y lo que no está en **§4.0**; el mapeo entre los 32
>    paths reales y los puntos del diseño, en **§8**.
> 2. **Se trabaja en `s1hap599` = TaxDown PRODUCCIÓN** (decisión del usuario del 27/08). **No hay
>    workspace de pruebas y la norma del workspace TEST queda derogada**: en producción, **el duplicado
>    del Custom Bot antes de publicar es la única vuelta atrás**, y lo que hoy protege producción es el
>    estado **`Draft`** del bot nuevo. Sigue prohibido `Preview` y sigue prohibido escribir desde el
>    Inbox: en producción mienten igual.
> 3. **EL IDIOMA YA NO SE PREGUNTA: sale de la rama.** Se fija con un `Set idioma_bot` al empezar cada
>    cadena y viaja como **input `idioma`** de cada DC que escriba — que **ya está en el contrato del
>    escritor**, así que no es campo nuevo. De él depende que el informe del v2 salga en el idioma del
>    cliente. Ficha completa en **§3.2.6**.
>
> Solo cuatro paths están nombrados (`A. Selección Idioma`, `B. Introducción ESP`, `C. Introducción
> ENG`, `Z. FAQ`). De los otros 28 la auditoría **no pudo leer el contenido**, así que aquí salen como
> **DESCONOCIDO**: no se inventa qué hay dentro de ninguno.

---

## 0 · ÍNDICE

1. Estado de hoy: qué está hecho y qué falta (**y los CUATRO bloqueos que hay que resolver antes del primer clic**)
2. Los atributos — y por qué **no se duplican** por idioma
3. Los Data Connectors, uno por uno — incluido **§3.2.6, el `idioma` que ahora sale de la rama**
4. El canvas paso a paso. **§4.0 = lo que se duplica y lo que no**; y las cuatro secciones que salen
   directas de la auditoría: **§4.A0** (la errata), **§4.I/W** (los dos ⚠️), **§4.Z** (el FAQ que va a
   un `END`) y **§4.END** (los once finales sin auditar)
5. Los workflows de Intercom
6. Checklist de verificación (con **dos casillas por punto**: ESP y ENG)
7. Las trampas, con su evidencia
8. **TABLA DE MAPEO: los 32 paths reales ↔ los puntos del diseño** — y el recuento que no cuadra

---

# 1 · ESTADO DE HOY

## 1.1 · Hecho (no se vuelve a tocar)

| Qué | Estado | Evidencia |
|---|---|---|
| **Nodo `Validar y Normalizar` (el escritor)** con `corr_id` y `Log_Evento` | **PEGADO Y PUBLICADO**, 76.156 car., `versionId == activeVersionId == 5b31d761` | el usuario, 27/08 |
| **Prompt v14 en LangSmith**, tag `prod` movido | **HECHO** | el usuario, 27/08. No comprobable por MCP: solo consta que el fichero local pasa su puerta de 110 comprobaciones |
| **Custom Bot nuevo creado**: id **«Mobility Bot (OnClick)» (68617004)**, app **`s1hap599` = TaxDown PRODUCCIÓN**, estado **Draft** | **CREADO con el TEXTO y los CAMINOS**: **32 paths** (`A`…`AF`), **11 END**, **duplicado por idioma** (dos cadenas paralelas ESP/ENG). Trigger `When customer clicks a website element`, audiencia `Users` + 2 más | `docs/auditoria-canvas-nuevo-2026-08-27.md`, leído en el navegador el 27/08 |
| Whitelist de `punto` cerrada en el escritor | HECHO (WP-206, 11/08) | `descarte_residencia｜lead｜cualifica｜descarte_plazo｜faq_entrada｜autodescarte_declarado` |
| ~~`veredicto_f2` · `fecha_limite_f2` · `dias_pasados_f2`~~ | **YA NO CUENTA COMO HECHO.** Están creados en `q3bhdtoi`, y el bot nuevo vive en `s1hap599` ⇒ **hay que crearlos** (§2.1, y auditoría §3 punto 1) | INTERCOMDOC Parte D + B1 |

## 1.2 · Falta (esta guía es exactamente esto)

| # | Qué falta | Sección |
|---|---|---|
| 1 | Los **atributos de conversación** (5 de WP-210 §2.3 + el de la fecha de `F` + **`idioma_bot`**) | §2 |
| 1b | Los **tres atributos del cálculo** (`veredicto_f2`, `fecha_limite_f2`, `dias_pasados_f2`), que **no existen en este workspace** | §2 · B1 |
| 2 | Los **Data Connectors** y, en cada uno, el input `modo` **y el input `idioma`** | §3 |
| 3 | Los **pasos que llaman a los DC** dentro de los caminos ya dibujados — **dos veces, uno por cadena** | §4 · §4.0 |
| 4 | Las **condiciones de los branches `I. Path` y `W. Path`**, que hoy dan ⚠️ «Missing condition» | §4.I/W |
| 5 | Los **pasos de dentro de `Z. FAQ`**, que hoy va directo a un `END` | §4.Z |
| 6 | El **`idioma` por rama** (`Set idioma_bot` + input del DC): el canvas ya lo elige en `A`, así que **deja de preguntarse** | §3.2.6 |
| 7 | Auditar **cuál de los 11 `END` lleva `Close conversation`** de verdad | §4.END |
| 8 | **Renombrar los 28 paths llamados «Path»** y rellenar el mapeo | §8 |
| 9 | La **errata del primer mensaje** («españo») | §4.A0 |
| 10 | El **workflow con trigger `Reopened`** (hoy no existe ninguno) | §5 |
| 11 | El **cambio del disparador** al bot nuevo, **al final** y solo con el e2e verde | §6 · WP-233 |

## 1.3 · LOS CUATRO BLOQUEOS QUE HAY QUE RESOLVER ANTES DEL PRIMER CLIC

Ninguno es opinable: los cuatro están medidos y los cuatro invalidan trabajo si se descubren después.
El **B1 ya está resuelto** — y la respuesta es la mala. El **B4 es nuevo** y sale de la auditoría.

### 🚨 B1 · CONFIRMADO: el canvas nuevo vive en OTRO workspace, y es el de PRODUCCIÓN

**Ya no es una incógnita, y la respuesta es la mala.** El bot `«Mobility Bot (OnClick)» (68617004)` está en **`app s1hap599` =
TaxDown, PRODUCCIÓN**, leído abriéndolo en el navegador (`docs/auditoria-canvas-nuevo-2026-08-27.md`,
encabezado). Y **todo** lo construido hasta el 26/08 vive en **`q3bhdtoi`**
(`docs/arquitectura-completa-2026-08-16.md` líneas 233 y 810; y la cabecera
`x-intercom-source-app-id: q3bhdtoi` del DC 461046, `docs/inventario-automatizaciones.md` §95).
**Son dos workspaces distintos.** De ahí la regla dura, sin excepciones:

> **Nada de lo que en esta guía diga «YA EXISTE» existe en `s1hap599` hasta que se compruebe abriendo
> la lista en pantalla.** Todo lo reutilizable está en el workspace viejo.

**Y SE TRABAJA EN PRODUCCIÓN** (decisión del usuario, 27/08). Lo que eso cambia, y no es poco:

- **El backup del canvas antes de publicar es la ÚNICA vuelta atrás.** No hay workspace de pruebas
  donde equivocarse gratis: se duplica el Custom Bot (`OnClick Mobility — BACKUP AAAAMMDD`), **se
  anota en la bitácora**, y solo entonces se publica. Un canvas publicado mal no se «revierte»: se
  restaura del duplicado, a mano.
- **Lo que hoy protege producción es el estado `Draft`** del bot nuevo, no un workspace aparte.
  Mientras el disparador no se cambie, el canvas se puede construir entero sin riesgo — y el bot vivo
  `66243731` **no se toca**, que es por donde entran los leads reales.
- Siguen prohibidos **`Preview`** (usa respuestas mock, trampa 9) y **escribir desde el Inbox** (es un
  mensaje de admin y no dispara nada, trampa 11). En producción mienten igual.
- El e2e va **solo** con `beckham-e2e@taxdown.es`, y con la bandeja revisada después de **cada**
  recorrido: aquí un correo de más le llega a un cliente de verdad.

**Un Custom Bot no se puede copiar entre workspaces** (medido el 3/08: *«en la migración al workspace
principal hay que reconstruir el Custom Bot de cero»*), así que hay cinco cosas de n8n y de Intercom
que apuntan al workspace viejo **por valor fijo**:

| Pieza de n8n | Qué lleva dentro | Consecuencia en otro workspace |
|---|---|---|
| `Callback_Intercom` (`beckham_bot`) | `POST https://api.intercom.io/hooks/workflows/trigger_step/`**`q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015`**`/{{conversation_id}}` | **El agente no publica nada.** El cliente escribe y no recibe respuesta |
| `Traer_Conversacion_intercom1` | `GET api.intercom.io/conversations/{id}`, credencial `intercomApi` | El token es de un workspace: 401 |
| `Cerrar_Conversacion` | `admin_id: "4418209"` fijo en el `jsonBody` | El admin no existe allí |
| `Assign team` del canvas | team **11098265** = `Ops_BOT_Mobility` (nombre confirmado por API el 1/08) | Otro id |
| Audiencia de `reuse_mobility` | `Users AND Team assigned is Ops_BOT_Mobility` | Los turnos 2..n no arrancan |

**LA FASE 0 YA NO ES UNA CONTINGENCIA: ES EL PLAN.** Hay que crear en `s1hap599`, de cero:

| Qué | Cuántos | Dónde está la ficha |
|---|---|---|
| Conversation attributes | **10**: los 3 del cálculo + los 5 de WP-210 + `fecha_alta_ss_bot` + `idioma_bot` | §2.1 |
| Data Connectors | **9**: `beckham_plazo_f2` + los **6** del escritor + `beckham_faq` + el del agente | §3 |
| Workflows reutilizables | **2**: `n8n_BOT_mobility` (con su DC del turno) y `reuse_mobility` | §5.1 |
| Team del bot | **1**: el equivalente de `Ops_BOT_Mobility`; el id `11098265` es del workspace viejo | §4.G |
| Valores fijos dentro de `beckham_bot` | **2**: el token de `Callback_Intercom` y el `admin_id` de `Cerrar_Conversacion` | tabla de arriba |
| Credencial `intercomApi` | **1**, y **solo se toca desde la UI** | tabla de arriba |

Los dos valores fijos de `beckham_bot` se entregan como **fichero para Cmd+A**: `update_workflow` del
MCP reenvía los 55 nodos y **borra las credenciales** (trampa 27).

**Y el token del callback cambia seguro, no «puede»:** el valor lleva el app id delante
(`q3bhdtoi_2af9679b-…`), y el app id ya sabemos que es otro. Lo que sigue **DESCONOCIDO** es si el
`2af9679b-…` también cambia por ser un **paso** nuevo. Se cierra en la misma pantalla: copiar la URL
de callback que muestre el paso `Wait for webhook` del canvas nuevo y compararla con la de arriba.

### 🚨🚨 CORRECCIÓN DEL 28/08 QUE TUMBA B2 Y B3 · **el Data Connector tiene un campo `Body` JSON**

**Visto en pantalla por el usuario el 28/08, con capturas del DC vivo del workspace de TEST.** La UI
actual del Data Connector tiene, además de los «Data inputs», un campo **`Body`** donde se escribe el
JSON de la petición a mano:

```json
{
  "fecha_alta_ss": "{{fecha de alta en la Seguridad Social}}"
}
```

Y su «Add data» ofrece **todos** los atributos, no solo los data inputs de ese conector (medido por el
usuario). Eso cambia dos cosas que B2 y B3 daban por ciertas, y las dos venían de `INTERCOMDOC`, que
describe una UI **anterior a este campo**:

| Lo que decía | Lo que es verdad desde el 28/08 |
|---|---|
| **B3:** «el `Name` del input es la clave del body», así que había que llamarlo `intercom_conversation_id` a mano | **FALSO con la UI actual.** El `Name` es solo la etiqueta del input; **la clave la pone el `Body`**. El usuario tiene el suyo como «fecha de alta en la Seguridad Social» y el DC del TEST **funciona**: test en vivo `Pass · 200 ok`, `fuera_plazo`, `dias_pasados: 219` |
| **B2:** «Map action inputs no acepta literales» → hacían falta `Custom value` y 6 DC | **La medición del 28/07 sigue siendo cierta para «Map action inputs»**, pero es irrelevante: **el `Body` sí acepta literales**. Los 6 DC se mantienen, pero por otro motivo (abajo), y `Custom value` ya no hace falta: el `punto` y el `modo` van **escritos literales en el `Body`** de cada conector |

**POR QUÉ SE MANTIENEN LOS SEIS DC AUNQUE AHORA CABRÍA UNO SOLO.** Con el `Body` se podría hacer
`"punto": "{{punto_bot}}"` y fijar `punto_bot` con un `Set` en cada rama — **un** conector en vez de
seis. Se descarta, y el motivo está en la lápida de este mismo proyecto: `SAVE` se borró en `WP-216`
B9 porque *«escribir un atributo en un paso para leerlo en otro es el patrón que costó cinco días»*.
Con un `punto_bot` mutable hay **12 sitios** donde olvidar el `Set` (6 puntos × 2 cadenas), y el fallo
es **silencioso y caro**: el DC mandaría el punto de la rama anterior y escribiría el expediente mal.
Con el literal en el `Body`, **el punto va soldado al conector y es imposible equivocarlo.**

**El `idioma` sí va por atributo (`{{idioma_bot}}`) y no es contradicción:** se fija **una vez** al
principio de cada cadena y no cambia en toda la conversación. `punto_bot` habría que refijarlo en cada
punto. Uno es constante de sesión, el otro sería estado mutable — y es el mutable el que muerde.

### 🚨 B2 · «Map action inputs» **NO acepta valores literales** — y de ahí sale el diseño de los DC

> ⚠️ **PARCIALMENTE SUPERADO EL 28/08 · ver la corrección de arriba.** La medición sigue siendo
> cierta, pero el `Body` del conector sí acepta literales, así que la conclusión práctica cambia.

**Medido en pantalla el 28/07 por el usuario** (`.spartax/log.md` línea 21, punto 2):

> *«'Map action inputs' NO acepta literales (probado por el usuario) → las constantes NO pueden ir en
> el mapeo del paso.»*

Y el desplegable `Data source` de un Data input tiene **exactamente 3 opciones**: `Let Fin collect` ·
`Select data attribute` (submenú) · `Custom value`.

Lo que **sí** acepta «Map action inputs» son **chips de atributo** — por eso `fecha_alta_ss` funciona
hoy en el DC1 y por eso `punto` y `modo` **no pueden** resolverse ahí. Esa es toda la diferencia, y
explica de golpe todas las contradicciones de los documentos anteriores.

⚠️ **Esto choca de frente con lo que decía la versión de la mañana de este mismo fichero**
(«los valores por rama van en Map action inputs») y con la letra de WP-210 §2.2. La letra está mal;
la medición está bien. **El transporte B sigue siendo válido — el modo sigue viajando como input del
DC — pero el input se rellena a nivel de conector con `Custom value`, no en el paso.**

**Las tres vías, con lo que cuesta cada una:**

| Vía | Cómo | Estado |
|---|---|---|
| **1 · Un DC por punto**, con `punto` **y** `modo` como `Custom value` | 6 DC escritores en vez de 1 | **RECOMENDADA.** Es además lo que ya manda `docs/prds/fase2/PRD-FASE2.md` línea 462: *«un solo DC por punto»*. No depende de ninguna incógnita de UI salvo la de abajo |
| **2 · Un DC y el literal en el paso** | lo que decían los documentos | **BLOQUEADA** por la medición del 28/07 |
| **3 · Un atributo por rama fijado con `Set` + input enlazado al atributo** | el paso `Set <atributo>` **sí** acepta texto literal (INTERCOMDOC B.3, resuelto el 28/07) | **PLAN B.** Cuesta un atributo y un paso por rama, y arrastra el problema del `Name` bloqueado (B3) |

**La única incógnita de la vía 1:** con `Custom value`, ¿el campo `Name` del input sigue siendo libre?
INTERCOMDOC (pregunta abierta 1 + C.1) solo documenta que **al enlazar a un atributo Intercom bloquea
el `Name` y lo deriva de él** (visto en pantalla: `conversation.id`), y que con `Let Fin collect` el
`Name` es libre. Con `Custom value` es **INFERENCIA, no medido**: no hay atributo del que derivarlo,
así que debería quedar libre. **Compruébalo en el PRIMER DC antes de crear los otros cinco.**

### 🚨 B3 · El `Name` del input es la clave del body — y el escritor exige `intercom_conversation_id`

El escritor rechaza con `user_id_or_conversation_id_missing` si no llega **`body.intercom_conversation_id`**
(leído en `docs/nodo-validar-normalizar-COMPLETO.js` líneas 189 y 193).

Si el input de la conversación se crea con `Select data attribute` → el `Name` se bloquea a
`conversation.id` → el body llega con la clave `conversation.id` → **el escritor rechaza y no escribe
nada**, con un 400 que en el canvas no se ve.

**Por tanto:** el input de la conversación se crea con **`Let Fin collect`**, `Name` escrito a mano
`intercom_conversation_id`, y el **valor** se mapea en cada paso con el **chip** de la conversación
desde «Map action inputs» (chips sí, literales no). Lo mismo vale para `user_id`: `Name` a mano y chip
`{{user_id}}` insertado **con el Attribute Inserter**, nunca escrito a mano (Pill Conversion Error).

### 🚨 B4 · El canvas está DUPLICADO POR IDIOMA: todo el §4 se construye DOS VECES

**Medido** (`docs/auditoria-canvas-nuevo-2026-08-27.md` §1): el primer paso `A. Selección Idioma`
bifurca en `B. Introducción ESP` y `C. Introducción ENG`, y **de cada uno baja una cadena completa**.
No es el diseño que había: el plan asumía **un** flujo con el idioma como atributo.

Consecuencias que hay que presupuestar **antes** del primer clic, porque se descubren tarde y caro:

- **Cada DC se conecta dos veces** y **cada `Map action inputs` se rellena dos veces**. El doble de
  clics, no el doble de conectores: los DC son los mismos objetos (§4.0).
- **Cada arreglo posterior se hace dos veces.** Un arreglo en una sola cadena da un bot que **funciona
  en español y falla en inglés**, y la firma del fallo es **la asimetría**. Este proyecto ya paga esa
  factura dos veces: el script del correo inglés de Airtable existe **duplicado**
  (`wacPpABiplv5tO7OM` y `wac2hg1IZkE0yOxMF`) y hay que cambiar el texto en los dos; y `T075` es
  literalmente *«la firma es la asimetría: en inglés sí se marca»*.
- **`Close conversation` deja de ser «dos veces» y pasa a ser CUATRO** (`D` y `N`, en cada cadena).
- **El path `L` único de WP-223 es imposible**: son dos, uno por idioma. Se reescribe la invariante en
  §4.0.
- **Nadie sabe qué punto del diseño es cada path**: 28 de los 32 se llaman «Path». **Sin el mapeo de
  §8 relleno no se puede empezar**, porque cada punto hay que encontrarlo dos veces.

**Lo que NO se duplica está en §4.0**, y es la lista que evita el trabajo de más: los atributos, los
Data Connectors, n8n, Airtable, el prompt y los reusables **son uno solo**.

---

# 2 · LOS ATRIBUTOS

## 2.1 · La tabla

| Atributo | Tipo | Quién lo usa | Estado |
|---|---|---|---|
| `veredicto_f2` | **Text** | branch de `I` **y de `W`** · mensajes `G`/`N` de las dos cadenas | **CREAR**: existe en `q3bhdtoi`, no en `s1hap599` (B1 y auditoría §3 punto 1). Valores: `en_plazo`｜`fuera_plazo`｜`no_valida`｜vacío |
| `fecha_limite_f2` | **Text** | mensajes de `N` y de `G`, en los dos idiomas | **CREAR** (ídem) |
| `dias_pasados_f2` | **Text** | mensaje de `N`, en los dos idiomas | **CREAR** (ídem). **Text a propósito aunque sea un número**, para no arriesgar desajuste de tipo |
| `corte_contexto_bot` | **Text** | WP-222 · `Formatear_conversacion1` descarta las parts anteriores | **CREAR** |
| `faq_resumen_bot` | **Text** | WP-222 · resumen ≤400 car. al salir del FAQ | **CREAR** |
| `faq_turnos_bot` | **Text** | WP-221 · contador de turnos de FAQ, tope 3 | **CREAR** |
| `intentos_fecha_bot` | **Text** | WP-216 B7 · reintentos de fecha, `<2` repregunta · `==2` escala | **CREAR** |
| `corr_id_bot` | **Text** | WP-208 · traza | **CREAR** |
| `fecha_alta_ss_bot` | **Text** | el `Collect data` del paso `F`, **en las dos cadenas** | **CREAR** (nombre **propuesto**: el del atributo que usa el canvas viejo es **DESCONOCIDO**). Text obligatorio: los `Date & Time` **no se pueden usar en workflows** (INTERCOMDOC C.9) |
| **`idioma_bot`** | **Text** | los **6** DC del escritor y el del FAQ. Lo fija un paso `Set` al empezar cada cadena | **CREAR**. Valores exactos: **`es`** en la cadena ESP y **`en`** en la ENG (§3.2.6). Es el único atributo cuyo valor depende de la cadena — y no hace falta uno por idioma: **el atributo es de la conversación, y una conversación recorre una sola cadena**. **De él depende que el informe salga en el idioma del cliente**: §3.2.6 |
| **`fecha_alta_norm_f2`** | **Text** | el input `fecha_alta_ss` de los **6** DC del escritor | **CREAR (28/08, hallazgo del usuario).** Lo rellena el Object mapping del DC1 con `fecha_alta_ddmmaaaa`. **Sin él el bot vuelve a preguntar la fecha que el cliente ya dio**: ver §3.1.1 |
| `modo_bot` | — | — | **NO SE CREA.** ⚖️ Solo nacería si T081 sale **B híbrida**, y entonces **solo** para la reentrada, nunca como fuente de verdad del turno |
| `Texto_descarte_f2` | Text | nadie | Existe en `q3bhdtoi` desde el 24/07, **sin uso aparente** (visto en pantalla el 28/07). En `s1hap599` **DESCONOCIDO si existe, y da igual**: no se toca ni se usa, y **no se crea** |

**Convención de nombres, y es contrato:** sufijo **`_bot`** = estado conversacional · sufijo **`_f2`**
= reservado al cálculo del plazo. No mezclar.

🟢 **LOS ATRIBUTOS NO SE DUPLICAN POR IDIOMA, y es la mejor noticia de la adaptación.** Un Conversation
attribute es del **workspace** y su valor es de la **conversación**, no del path: las dos cadenas
escriben y leen **el mismo juego de 10**. No hay `veredicto_f2_en` ni nada parecido, y no hay colisión
posible porque una conversación baja por **una sola** cadena. Lo que se duplica es el **cableado**
(§4.0).

## 2.2 · Cómo se crea un Conversation attribute, clic a clic

1. **Settings** → **Data** → **Conversations**. (Es la pestaña hermana de `Settings > Data > People`,
   la que se usa para «Prevent updates via the Messenger»; las dos se recorrieron a mano el 28/07
   buscando `veredicto`/`fecha*`.)
2. Crear atributo nuevo. **Name** exactamente el de la tabla — se escribe entero, sin espacios y sin
   mayúsculas, porque el branch y los mensajes lo van a buscar por ese texto.
3. **Type = Text** en los diez. No `Number` en `faq_turnos_bot` ni en `intentos_fecha_bot`: el paso
   `Set <atributo>` solo escribe **texto literal**, y un contador de tipo `Number` con un `Set` de
   texto es un **Attribute Type Mismatch**, que da **fallo de persistencia silencioso** en el Inbox
   (INTERCOMDOC §5). Text y se comparan como texto.
4. **Description**: opcional, pero pon quién lo escribe («lo fija el paso X del canvas nuevo»). Es lo
   único que va a impedir que alguien lo borre en tres meses.
5. Guardar y **volver a la lista para verificar que aparece con ese nombre exacto**. Un atributo con
   una letra distinta no da error: da un branch que cae siempre al `else` — y eso es exactamente lo
   que costó cinco días con el typo `veridicto_f2` (el `else` de `I` **cerraba la conversación**).

**Los DIEZ nombres exactos a crear en `s1hap599`, para copiar de una vez** (los 5 de WP-210 §2.3, el
de la fecha de `F`, el del idioma, y los **3 del cálculo**, que en este workspace tampoco están):

```
corte_contexto_bot
faq_resumen_bot
faq_turnos_bot
intentos_fecha_bot
corr_id_bot
fecha_alta_ss_bot
idioma_bot
veredicto_f2
fecha_limite_f2
dias_pasados_f2
```

**Los diez, tipo `Text`.** Y los tres últimos **con ese nombre exacto**: `veridicto_f2` con «i» no
existe, y un branch sobre él cae siempre al `else` — que en el canvas viejo **cerraba la
conversación**.

## 2.3 · Los contadores solo se pueden fijar a literales

No hay aritmética en el canvas. `faq_turnos_bot` y `intentos_fecha_bot` **no se incrementan**: se
**fijan** con un `Set` a `1`, a `2`, a `3` en pasos distintos, con las ramas **desenrolladas**. Es el
mismo «plan B N=3 desenrollado» que ya está apuntado del 4/08 para el FAQ. Si algún día hacen falta
más de tres, el bucle necesita el trigger de mensaje, o sea **WP-10**, que está bloqueado.

**Y con el flujo duplicado, el desenrollado se multiplica por dos:** `intentos_fecha_bot` son **dos**
pasos `Set` por cadena ⇒ **cuatro** pasos en el canvas; `faq_turnos_bot` son tres por cadena ⇒ **seis**
si el FAQ acaba duplicado (§4.Z). Cuéntalos al presupuestar los clics: es donde más se dispara.

**El `Set` es además la pieza que resuelve el idioma**, porque es el único sitio del canvas que acepta
**texto literal** (trampa 4): `Set idioma_bot = es` al empezar la cadena ESP y `Set idioma_bot = en` al
empezar la ENG. Detalle completo en §3.2.6.

---

# 3 · LOS DATA CONNECTORS

> ## 🚨🚨🚨 CORRECCIÓN DE FONDO · 28/08/2026 · **EL CANVAS NO ESCRIBE EL EXPEDIENTE**
>
> **Lo cazó el usuario** («¿pero por qué cojones 6 DC? antes del upsert lo hacía el agente») y se
> comprobó **abriendo el workspace de TEST en el navegador**, no leyendo:
>
> **En `q3bhdtoi` (TEST) hay DOS Data Connectors, no seis ni siete:**
> 1. `beckham_plazo_f2` — el cálculo del plazo
> 2. `n8n_bot_mobility` (461046) — **11 data inputs**: Name · User ID · Email · Phone ·
>    Conversation Part ID · Last Message Body · … Todos con `Data source` = atributo de Intercom
>
> **NO EXISTE ningún Data Connector del escritor.** El expediente lo escribe **el agente**, con su
> tool `guardar_datos_cliente` → `Webhook_Upsert_Expediente` → `Validar y Normalizar` → Airtable.
> El canvas solo hace dos cosas: calcular el plazo, y **traer al agente**.
>
> **De dónde salió el error, para no repetirlo:** los «4 puntos de persistencia `D`/`H`/`G`/`N` que
> llaman al escritor con su `punto`» son el **diseño de `WP-206`/`WP-224`**, no lo construido. Se
> leyeron como estado actual y se diseñaron encima **seis conectores que no existen ni hacen falta**.
> Y estaba escrito en el propio backlog: **`WP-224` dice literalmente que `H` NO persiste nada hoy**,
> y que por eso quien abandona desaparece sin traza. Esa frase era la prueba, y no se relacionó.
>
> **Regla que queda:** antes de diseñar sobre una pieza, **mirar la pieza**. Un PRD describe lo que
> se quiere; solo el sistema vivo dice lo que hay. Es la §8 de `CLAUDE.md` otra vez, aplicada esta
> vez a documentos que no escribí yo.
>
> **QUÉ HAY QUE HACER DE VERDAD EN PROD, y es mucho menos:** replicar **esos dos** DC. El `punto`,
> el `modo` y el `idioma` como inputs del escritor son **Fase 2** — entran cuando el escritor se
> extraiga a subworkflow (`WP-207`, ya creado como `1BaSgHfQzuzC9sw1`), **no ahora**.
>
> **Todo el §3.2 de abajo (los seis DC del escritor) queda como DISEÑO DE FASE 2, no como trabajo
> de hoy.** Se conserva porque el contrato de sus inputs sigue siendo válido para cuando llegue.



## 3.0 · Cómo se crea un Data Connector, clic a clic (vale para los cinco)

Permisos necesarios: **«Can access developer hub»** y **«Can manage workspace data»**
(INTERCOMDOC §2).

**Pestaña `1 Setup`**
1. Nombre del conector. Convención del proyecto (PRD-FASE2 línea 1348): **`beckham_<qué pide>`**.
2. **Método** y **URL**. Métodos y payloads (INTERCOMDOC §2): `GET` **no permite** cuerpo; `POST`,
   `PUT` y `PATCH` lo **exigen** en `application/json`; `DELETE` lo tiene opcional.
3. **Header obligatorio**: `Content-Type: application/json`. Sin él el endpoint receptor **falla al
   parsear** y devuelve un error de validación de esquema. *(Matiz medido: nuestro escritor aguanta
   además `application/x-www-form-urlencoded` con el JSON como clave — es el caso C4 del
   `contract-test-completo.sh`, 8/8 — así que si el DC manda urlencoded no se pierde ni un campo. Pero
   el header correcto es el de arriba.)*

**Pestaña `2 Data`**
4. **Data inputs**, uno por cada clave del body. Por cada input:
   - **Name** = la clave literal del body. Con `Let Fin collect` es libre; **enlazado a un atributo se
     bloquea y lo deriva del atributo** (visto en pantalla: `conversation.id`) → ver B3.
   - **Data source**: `Let Fin collect` ｜ `Select data attribute` ｜ `Custom value`. Nada más: son
     **exactamente tres** (medido 28/07).
   - **Required**: es una **condición de ejecución**, no un aviso — si está ON y el valor falta, **el
     conector no se ejecuta** (INTERCOMDOC C.4). El label dice «Fin must collect this parameter» y eso
     engaña: aplica a los tres modos.
   - **Fallback value**: **VACÍO en todos**. Un fallback mandaría un valor de relleno en las ramas
     donde el campo no aplica y **eso sí pisaría** el dato bueno de Airtable. Lo de no pisar con nulos
     ya lo resuelve el nodo de código, que descarta lo vacío (verificado por curl, caso C7: se mandó
     solo `nombre` sobre un expediente lleno y **los otros 17 campos quedaron intactos**).
5. **Object mapping** — al **final de la pestaña `2 Data`**. Es la **única vía verificada** de sacar
   un output del conector fuera de su path: `Intercom object = Conversation`, `API object = Root`, y
   **una fila por campo**. Sin esto, los outputs son **atributos locales del path** y el branch de
   otro path lee vacío.
6. *(Opcional)* **Sandbox de Python** para transformar la respuesta. Módulos permitidos: `math`,
   `json`, `datetime`, `datetime.timezone`, `re`, `decimal`, `random`, `time`. No nos hace falta en
   ninguno de los cinco: n8n ya devuelve el JSON con la forma final.

**Pestaña `3 Test`**
7. **«Test connection» manda una llamada REAL.** Con inputs enlazados a atributo llegan vacíos porque
   no hay contexto de usuario en el editor → **400 esperado, no es un fallo de configuración**
   (INTERCOMDOC C.8 y pregunta abierta 8).

**Y dos límites duros:**
- **Timeout 15 s** (30 s solo en Fin Procedures). Todo lo que tarde más responde **200 ya** y publica
  por **callback**.
- **Logs del DC**: retención **7 días**, 14 con extended. Sirven para ver el body enviado y la
  respuesta sin depender de n8n. Y **cuidado con lo que se devuelve**: `Respond OK` llegó a devolver
  el registro completo de Airtable (68 campos con PII y URLs de formularios prefilled), y eso se queda
  ahí 7-14 días.

---

## 3.1 · `beckham_plazo_f2` — DC1, el único síncrono · SE REUTILIZA

| | |
|---|---|
| **Nombre exacto** | `beckham_plazo_f2` |
| **URL** | `POST https://es.synapse.rentax.es/webhook/b3c76655-b298-4f5e-9772-48d301f6d925` |
| **Workflow destino** | `beckham_f2_plazo.` · `wdOOF0ecCkgFOUjt` · 3 nodos, sin estado y **sin credenciales** |
| **Id del DC** | **468021** (visto en el log de la conversación real `215475257954132`, 28/07) |
| **Dónde se llama** | **una sola vez**, en el path `F`, justo después del `Collect data` |

**Inputs**

| Name | Tipo | Required | Modo de relleno | Fallback | De dónde sale el valor |
|---|---|:--:|---|---|---|
| `fecha_alta_ss` | Text | **ON** (recomendado: sin fecha no hay cálculo que hacer — **no medido**, decisión de esta guía) | `Let Fin collect`, mapeado en el paso con el **chip** del atributo | vacío | el `Collect data` de `F` → `fecha_alta_ss_bot` (Text `DD/MM/AAAA`) |

**Outputs (6, leídos del código del workflow, no de memoria)**

`veredicto` · `fecha_alta_norm` · `fecha_alta_ddmmaaaa` · `fecha_limite` · `fecha_limite_iso` ·
`dias_pasados`

**Object mapping** (pestaña `2 Data`, `Intercom object = Conversation`, `API object = Root`)

| API field | → Conversation attribute |
|---|---|
| `veredicto` | `veredicto_f2` |
| `fecha_limite` | `fecha_limite_f2` |
| `dias_pasados` | `dias_pasados_f2` |

**Los cuatro valores de `veredicto`, y son los que definen las cuatro salidas de `I`:**

| Valor | Cuándo | Salida |
|---|---|---|
| `en_plazo` | `fecha_alta + 6 meses >= hoy`. `dias_pasados = 0` | `G` |
| `fuera_plazo` | el límite ya pasó. `dias_pasados` = días **desde que venció** | `N` |
| `no_valida` | la fecha no se pudo parsear con ninguno de los 4 formatos (epoch, ISO, `d/m/a`, «15 de junio de 2026») | repregunta / escalado |
| *(vacío)* | el DC ni respondió | escalar **sin repreguntar** |

⛔ **No reinsertar el chip `veredicto` bajo el encabezado `beckham_plazo_f2` en la condición del
branch: eso ROMPE el arreglo.** El branch tiene que leer `veredicto_f2` bajo el encabezado
**`Conversation`**. Es la trampa nº1 del proyecto y ya mató cinco hipótesis.

**Qué hay que hacerle:** nada, si el workspace es el mismo. Si es otro, **recrearlo entero** con esta
ficha. No necesita el input `modo`: no escribe en Airtable, solo calcula.

---

### 3.1.1 · 🚨 HAY QUE MAPEAR LA FECHA NORMALIZADA, y sin ella el bot repregunta

**Lo preguntó el usuario el 28/08 («¿y no hay que mapear la normalizada?») y la respuesta es SÍ.**
Medido llamando al webhook del `f2` de verdad y ejecutando `toIsoDate` del validador vivo, los dos el
28/08 — no leído:

| El cliente escribe | `f2` (4 formatos) | `toIsoDate` del escritor (2 formatos) |
|---|---|---|
| `01/06/2026` | ✅ | ✅ |
| **`1/6/2026`** | ✅ → devuelve `01/06/2026` | ❌ **RECHAZA** |
| **`1/6/26`** | ✅ → devuelve `01/06/2026` | ❌ **RECHAZA** |
| **`1 de junio de 2026`** | ✅ → devuelve `01/06/2026` | ❌ **RECHAZA** |
| `01-06-2026` | ✅ | ❌ **RECHAZA** |

`toIsoDate` exige **exactamente** `^(\d{2})\/(\d{2})\/(\d{4})$` o `AAAA-MM-DD`. El `f2` acepta además
timestamp, un dígito en día y mes, año de dos cifras y el mes escrito en castellano.

**Qué pasaría mandando al escritor la fecha CRUDA del `Collect data`:** el canvas calcula el plazo
bien y enruta bien (el `f2` sí la entendió), pero el escritor **descarta la fecha en silencio** — la
manda a `_fechas_descartadas` y devuelve **`ok:true`**, no falla — y el bot **vuelve a preguntar la
fecha que el cliente ya dio y el sistema ya había entendido.** Es el peor síntoma que tiene este
proyecto, y por esta vía no lo cazaría ninguna prueba: las dos piezas funcionan, lo que no encaja es
la frontera.

**Por tanto el Object mapping del DC1 lleva CUATRO filas, no tres:**

```
veredicto_f2         ←  veredicto
fecha_limite_f2      ←  fecha_limite
dias_pasados_f2      ←  dias_pasados
fecha_alta_norm_f2   ←  fecha_alta_ddmmaaaa      ← el que faltaba
```

Y en los **6** DC del escritor, el input `fecha_alta_ss` se rellena con el chip de
**`fecha_alta_norm_f2`**, **nunca** con el del `Collect data` crudo. El `f2` pasa a ser también el
normalizador de fechas del sistema, que es lo que ya era de hecho.

**Los otros dos campos siguen sin mapearse a propósito:** `fecha_alta_norm` (ISO, redundante con el
`ddmmaaaa` que ya sirve) y `fecha_limite_iso` (nadie lo lee en el canvas).

⚠️ **LA MISMA GRIETA SIGUE ABIERTA EN OTRO SITIO, y se queda anotada:** la rama `H` (lead potencial)
recoge `fecha_prevista_alta` con un `Collect data` y **no pasa por el `f2`**, así que esa fecha llega
cruda al escritor y `1/6/2026` la descarta igual. Aquí no hay normalizador que interponer. Las dos
salidas son: ampliar `toIsoDate` en el escritor (toca el nodo de 76 KB), o pedir la fecha con el
formato en el propio texto del `Collect data`. **No se arregla en este paso**; queda escrito para no
descubrirlo con un lead perdido.

## 3.2 · El escritor — `beckham_upsert_expediente` · SE REUTILIZA, Y HAY QUE PARTIRLO EN SEIS

| | |
|---|---|
| **URL** | `POST https://es.synapse.rentax.es/webhook/beckham-upsert-expediente` |
| **Id del DC (borrador visto el 28/07)** | **473461** |
| **Estado hoy** | conectado en los 4 puntos **D · H · G · N** (`docs/arquitectura-completa-2026-08-16.md`, subgrafo `DCS`) |
| **Contrato de entrada** | `docs/contrato-upsert-expediente-v1.json` — **46 claves**, extraídas del nodo vivo leyendo sus `body.X` |
| **Rechazos** | `user_id_forma_invalida` · `user_id_or_conversation_id_missing` · `punto_desconocido` · `descarte_desconocido` — devuelven `_invalid:true` y **no escriben nada** |

### 3.2.1 · La tabla COMPLETA de inputs del escritor

Las 9 originales (WP-05 §28) + `punto` + `modo` + las **dos del `corr_id`** que hoy faltan + **el
`idioma` que sale de la rama** (§3.2.6):

| # | Name (= clave del body) | Tipo | Required | Modo de relleno | Fallback | De dónde sale el valor |
|:--:|---|---|:--:|---|---|---|
| 1 | `user_id` | Text | **ON** | `Let Fin collect`, chip `{{user_id}}` en el paso | vacío | External ID de TaxDown = nuestro `UserId`. **`user.id` (Contact ID) ≠ `user_id`** |
| 2 | `intercom_conversation_id` | Text | **ON** | `Let Fin collect`, `Name` a mano, chip de la conversación en el paso | vacío | ver **B3**: enlazarlo al atributo bloquea el `Name` a `conversation.id` y el escritor rechaza |
| 3 | `punto` | Text | **ON** | **`Custom value`**, distinto en cada uno de los 6 DC | vacío | ver 3.2.3 |
| 4 | `modo` | Text | **ON** | **`Custom value`**, distinto en cada uno de los 6 DC | vacío | ver 3.2.3 |
| 5 | `conversation_id` | Text | OFF | `Let Fin collect` + chip | vacío | **para el `corr_id`** · ver 3.2.4 |
| 6 | `conversationPartId` | Text | **OFF, obligatoriamente** | `Let Fin collect` + chip | vacío | **para el `corr_id`** · ver 3.2.4 y la trampa de WP-217 |
| 7 | `email` | Text | OFF | `Let Fin collect` + chip | vacío | el email del contacto, donde la rama lo conozca |
| 8 | `fecha_alta_ss` | Text | OFF | `Let Fin collect` + chip | vacío | `fecha_alta_ss_bot` (solo `G` y `N`) |
| 9 | `fecha_limite_plazo` | Text | OFF | `Let Fin collect` + chip | vacío | `fecha_limite_f2` (solo `G` y `N`) |
| 10 | `fecha_prevista_alta` | Text | OFF | `Let Fin collect` + chip | vacío | el `Collect data` de la rama del lead (`H`→`P`/`R`) |
| 11 | `alta_ss` | Text | OFF | **SIN MAPEAR** | vacío | **lo deriva el `punto`** — ver 3.2.2 |
| 12 | `lead_potencial` | Text | OFF | **SIN MAPEAR** | vacío | **lo deriva el `punto`** |
| 13 | `Descarte` (**D mayúscula**, igual que la columna de Airtable) | Text | OFF | **SIN MAPEAR** | vacío | **lo deriva el `punto`** |
| 14 | **`idioma`** | Text | **OFF a propósito** | `Let Fin collect`, chip **`idioma_bot`** en el paso | vacío | **la cadena**: `es` en la ESP, `en` en la ENG · ver **§3.2.6**. Ya está en el contrato (46 claves), **no es campo nuevo** |

Todos **Text**: el body de un DC manda todo entre comillas y el validador ya convierte booleanos de
texto (`"si"`, `"no"`, `"true"`) y fechas.

### 3.2.2 · Los tres que NO se mapean, y por qué es una decisión y no un olvido

El `punto` **no es una etiqueta: escribe**. Esta es la tabla `x-deriva` del contrato, tal cual:

| `punto` | Lo que el escritor escribe ADEMÁS de lo que venga en el body |
|---|---|
| `cualifica` | `alta_ss = true` |
| `lead` | `alta_ss = false` · `lead_potencial = true` |
| `descarte_plazo` | `alta_ss = true` · `Descarte = "Alta en SS mas de 6 meses"` |
| `descarte_residencia` | `Descarte = "No residente ultimos 5 años"` |
| `autodescarte_declarado` | `Descarte = "Otro/Incompleto"` |
| `faq_entrada` | *(nada)* |

Mandar `alta_ss`, `lead_potencial` o `Descarte` **desde Intercom** es exactamente la **opción B que el
Council descartó el 28/07**: dejaría las constantes de negocio «en el único sitio no testeable», y con
`typecast:true` una errata crearía una opción nueva en el `singleSelect`. La regla que quedó:
**cero constantes de negocio en Intercom**. Los tres inputs se dejan en el contrato **sin mapear** (o
se quitan) y nadie los rellena nunca.

### 3.2.3 · Los seis DC del escritor, con su `punto` y su `modo` fijos

Uno por punto, cada uno con **dos `Custom value`**. Es la vía 1 de **B2**, y coincide con PRD-FASE2
línea 462 («un solo DC por punto»).

| DC a crear | `punto` (Custom value) | `modo` (Custom value) | Se llama desde |
|---|---|---|---|
| `beckham_upsert_descarte_residencia` | `descarte_residencia` | `solicitud` | `D` |
| `beckham_upsert_lead` | `lead` | `lead_potencial` | `H` (y el enriquecimiento de `P`/`R`) |
| `beckham_upsert_cualifica` | `cualifica` | `solicitud` | `G` |
| `beckham_upsert_descarte_plazo` | `descarte_plazo` | `solicitud` | `N` |
| `beckham_upsert_faq_entrada` | `faq_entrada` | `faq_regimen` | la rama FAQ |
| `beckham_upsert_autodescarte` | `autodescarte_declarado` | `faq_regimen` | el autodescarte, dentro del FAQ |

**Y los seis llevan además el input `idioma`** — ese **no** va como `Custom value`, porque su valor
depende de la cadena y no del punto: va como chip `idioma_bot` en cada «Map action inputs» (§3.2.6).
Por eso siguen siendo **6 DC y no 12**.

Los valores válidos de `modo` son **seis** y `menu` **es un valor explícito, no una ausencia**:
`menu` · `solicitud` · `faq_regimen` · `calculadora` · `lead_potencial` · `humano`.

**Los puntos que NO llaman al escritor no necesitan `modo`:** `menu`, `calculadora` y `humano` no
escriben expediente. Si algún día se les quiere traza, será con un DC propio con su `Custom value`.

**Si prefieres UN solo DC (vía 3, plan B):** crea un atributo `punto_bot` y otro `modo_bot` de tipo
Text, fija los dos con pasos `Set` antes de cada llamada (el `Set` **sí** acepta texto literal) y
enlaza los dos inputs a esos atributos — aceptando que el `Name` se te va a bloquear a
`conversation.punto_bot` / `conversation.modo_bot` y que entonces **el escritor no reconocerá las
claves**, así que habría que renombrarlas también en el nodo de código. Por eso es plan B y no plan A.

### 3.2.4 · EL AGUJERO NUEVO DEL `corr_id`, que nadie ha visto todavía

El nodo que se pegó hoy construye el `corr_id` así (líneas 128-135 del `COMPLETO`):

```js
const c = String(body.conversation_id || '').trim();
const p = String(body.conversationPartId || body.conversation_part_id_debounce || '').trim();
if (!c || !p) return '(sin-corr-id)';   // fail-closed: no se inventa uno a medias
```

Lee **`body.conversation_id`**, que **no es** `body.intercom_conversation_id`. El escritor usa
`intercom_conversation_id` para hacer match de la fila y `conversation_id` **solo** para el `corr_id`.
El DC del escritor **hoy no manda ninguna de las dos claves del `corr_id`** → cada escritura del
canvas va a registrar `[(sin-corr-id)]` en el `Log_Evento`, y el criterio 5 de WP-233 («`corr_id`
presente en Intercom, n8n y Airtable para el mismo caso») **no se puede cumplir**.

**Arreglo:** los inputs **5** y **6** de la tabla. Y `conversationPartId` va **Required OFF sin
excepción**, por la trampa de WP-217: el DC 461046 falló con
`Request validation error: Last comment: Body, Conversation part: Id missing` y **cero ejecuciones en
n8n** (conversación `215475260478265`). Un input **no textual no puede ser opcional** en Intercom, así
que si el chip de la part es numérico hace falta un paso previo **Number→Text**, o un **DC dedicado de
arranque en frío**. En el peor caso se acepta `(sin-corr-id)` en los puntos de arranque en frío y se
declara — pero se declara, no se descubre.

### 3.2.5 · Y una corrección al contrato del `modo`: hoy el escritor NO lo valida

En el nodo vivo, `modo` se usa **solo para el `Log_Evento`**:

```js
modo: String(body.modo || ''),            // WP-210: hoy puede venir vacio
```

No hay whitelist de `modo` ni rechazo por `modo` ausente. Eso es la **capa 3 de WP-219** y **está
pendiente**. Consecuencia práctica, y hay que saberla antes de probar: **una llamada sin `modo` HOY
escribe igual** — la «prueba negativa» de WP-210 §5 («sin `modo` no se escribe nada») fallaría hoy, y
no porque el canvas esté mal.

---

### 3.2.6 · EL `idioma`: ya no se pregunta, SALE DE LA RAMA — y no cuesta ningún campo nuevo

**Lo que cambia con el canvas real.** El diseño anterior trataba el idioma como un dato que había que
averiguar dentro del flujo (y el D0 del idioma se rompió el 7/08 justamente por eso: el Messenger
reanudaba el hilo abierto y nadie volvía a preguntarlo). En el canvas del usuario **el idioma es la
primera bifurcación**: `A. Selección Idioma` → `B. Introducción ESP` ｜ `C. Introducción ENG`
(auditoría §1). A partir de ahí **la rama YA ES el idioma**: no hay nada que preguntar y nada que
inferir.

**Y la mejor parte: `idioma` YA ESTÁ en el contrato del escritor**, así que **no dispara la regla de
los cinco sitios**. Está medido en dos ficheros:

- `docs/contrato-upsert-expediente-v1.json` → `properties.idioma`, **1 de las 46 claves**:
  *«singleSelect 'Idioma', whitelist cerrada en el nodo. Un valor fuera NO se escribe y va a
  descartados; se compara POR NOMBRE.»*
- `docs/nodo-validar-normalizar-COMPLETO.js` línea **373**, el nodo vivo que se pegó hoy:

```js
ponerSelect('Idioma', body.idioma, [
  ['Español', ['espanol', 'espanola', 'castellano', 'spanish', 'es', 'esp']],
  ['Ingles',  ['ingles', 'inglesa', 'english', 'en', 'eng']]
], { rechazarSiNiega: true });
```

O sea: **`es` y `en` son valores válidos y escriben la columna `Idioma`** sin tocar nada de n8n. Y un
detalle medido que hay que respetar: las claves de **3 letras o menos se comparan por igualdad
exacta**, no por palabra suelta — lo dice el comentario del propio nodo (líneas 346-347): si no,
*«mi idioma es ingles»* casaría con `es` y guardaría Español. **Manda exactamente `es` o `en`, solos,
sin frase alrededor.**

#### Por qué esto importa aunque «solo» sea una columna: el informe v2 elige la plantilla con ella

Medido en `docs/nodo-v2-preparar-informe-2026-08-21.js`:

- línea **69**: `const idioma = (sinTildes(txt(r.Idioma)).trim().toLowerCase() === "ingles") ? "EN" : "ES";`
- líneas **70-72**: `clave = <régimen0> + "+" + <régimen1> + "|" + idioma` y esa clave se busca en el
  mapa `PLANTILLAS`, que tiene **8 entradas** (4 combinaciones de régimen × 2 idiomas).

**Solo el valor `Ingles` da `EN`. Todo lo demás — incluida la celda VACÍA — cae en `ES`**, y no hay
error: hay PDF. Consecuencia exacta si el canvas no manda `idioma`: **un cliente que eligió English
recibe el informe fiscal en español**, bien formado, subido y enviado por el canal transaccional. Es
el mismo patrón que el ID fijo del nodo `Copiar la plantilla` (`T073`): fallo silencioso con
entregable de aspecto correcto. **El input `idioma` del DC es lo que tapa ese agujero desde arriba.**

#### Cómo se pasa: el valor es fijo por rama, y llega a «Map action inputs» como CHIP

Aquí choca con **B2**: «Map action inputs» **no acepta literales** (trampa 3, medido el 28/07), así
que *«pon `es` a mano en el mapeo del paso»* **no se puede hacer**. Lo que sí acepta son **chips**. El
camino, en dos piezas:

1. **Un paso `Set idioma_bot` al principio de cada cadena** — el `Set` es el único sitio del canvas
   que acepta texto literal (trampa 4): `Set idioma_bot = es` como **primer paso de
   `B. Introducción ESP`** y `Set idioma_bot = en` como **primer paso de `C. Introducción ENG`**. Son
   **dos pasos en todo el canvas**, y se ponen una sola vez aunque haya once puntos que lo usen.
2. **Un input `idioma` en cada DC que escriba**, con `Data source = Let Fin collect`, `Name` escrito
   a mano `idioma` (así no se bloquea, B3), `Required` **OFF**, `Fallback` **vacío** — y en cada «Map
   action inputs» el **chip `idioma_bot`** insertado desde el encabezado **`Conversation`**.

**`Required` va OFF a propósito:** `Required ON` es condición de ejecución (trampa 5), así que si un
día el `Set` no llegó a correr, con ON **el conector entero no se ejecuta** y se pierde la fila; con
OFF se pierde el idioma y se escribe todo lo demás. Perder el idioma es un PDF en el idioma
equivocado; perder la fila es perder el lead.

**La alternativa, y su precio:** partir cada DC del escritor **también por idioma** y poner `idioma`
como `Custom value` (`es`/`en`), igual que `punto` y `modo`. Eso se lleva el atributo y los dos pasos
`Set`… y **convierte los 6 DC del escritor en 12**. No se recomienda: son doce fichas que mantener y
seis oportunidades más de que una quede desparejada, y la asimetría entre idiomas es justo el fallo
que este canvas ya arriesga por diseño (**B4**).

| Vía | Piezas | Coste | Veredicto |
|---|---|---|---|
| **`Set idioma_bot` + chip** | 1 atributo · 2 pasos `Set` · 1 input por DC | 1 chip más en cada «Map action inputs» | **RECOMENDADA** |
| `idioma` como `Custom value` | 0 atributos · 0 pasos | **6 DC → 12 DC** | descartada |

**Los DC que llevan el input `idioma`:** los **6** del escritor (§3.2.3) y **`beckham_faq`** (§3.4) —
el FAQ contesta con un LLM y el idioma de la respuesta no se adivina. **No lo lleva**
`beckham_plazo_f2`: solo calcula fechas.

**Tres cosas que NO hay que hacer con el idioma:**

- **No preguntarlo dentro del flujo.** Ya está elegido en `A`. Un `Collect data` de idioma sería un
  segundo origen de verdad para el mismo dato, y cuando hay dos, uno miente.
- **No crear `idioma_bot_es` / `idioma_bot_en`.** Un Conversation attribute es del workspace y su
  valor es de la conversación, y **una conversación baja por una sola cadena** (§2.1): uno basta para
  las dos.
- **No mandar `Español` / `Ingles`.** Se manda `es`/`en` y **el nodo normaliza**. Mandar el nombre de
  la opción de Airtable desde Intercom es meter una constante de negocio en el único sitio no
  testeable, que es lo que el Council descartó el 28/07 (§3.2.2).

**Verificación (dos recorridos, uno por cadena):** tras pasar por `G` en cada idioma, la columna
`Idioma` de la fila dice **`Español`** en el recorrido ESP y **`Ingles`** en el ENG. Si sale **vacía**,
lo que falta es el **chip del paso**, no el DC: `ponerSelect` hace `if (!bruto) return;` antes de
tocar nada, así que un input vacío **no deja rastro** ni en `descartadas`.

---

## 3.3 · `n8n_bot_mobility` (461046) — el DC que trae al agente · SE REUTILIZA

| | |
|---|---|
| **Id** | **461046**, app **`q3bhdtoi`** (cabecera `x-intercom-source-dataconnector-id`, ejecución `8129120`) |
| **URL** | `POST https://es.synapse.rentax.es/webhook/22de1fbd-bada-40b3-a120-41e519442139` → `Webhook1` de `beckham_bot` |
| **Modo** | **con `wait_for_callback`** |
| **Dónde vive** | dentro del **reusable `n8n_BOT_mobility` (66246057)**, no en el canvas |

**Body real, 7 claves, leídas de una ejecución y no del canvas:**

| Name | Para qué |
|---|---|
| `conversation_id` | el hilo · y la mitad del `corr_id` |
| `user_id` | la clave de negocio |
| `conversationPartId` | **camelCase** · el mensaje · la otra mitad del `corr_id` |
| `message` | **PII** |
| `user_email` | **PII** |
| `conversation_part_id_debounce` | **mismo valor** que `conversationPartId`, y la única que lee `If2` |
| `First Message ID` | — |

**Tres claves para dos cosas** — no confundirlas. Y `message` + `user_email` son PII: por eso el
`Log_Evento` tiene **6 campos** y no el body, y por eso `dropped` guarda **nombres** de campo y tira
los valores.

**Qué hay que hacerle:** añadirle el input **`modo`** con `Custom value = solicitud` (la llamada del
turno viene de la rama de solicitud). ⚖️ Si T081 sale B híbrida, sigue siendo `Custom value`: el modo
del turno lo decide quien llama, no el atributo.

**Cómo se le añade un input a un DC que ya existe:**
1. Abre el DC → pestaña **`2 Data`** → **Data inputs** → añadir.
2. **Name** = `modo` (escrito a mano, en minúsculas).
3. **Data source** = `Custom value` → escribe `solicitud`.
4. **Required** = ON. **Fallback** = vacío.
5. Guardar. **Y publicar el conector** si la UI lo pide aparte.
6. Verificación: pestaña `3 Test` → «Test connection». Espera **400** si los demás inputs llegan
   vacíos; lo que se comprueba aquí es que `modo` **aparece en el body enviado** que muestra el log,
   no el código de respuesta.
7. Verificación real: un turno desde el Messenger y el `Log_Evento` de la ejecución con
   `"modo":"solicitud"` en vez de `"modo":""`.

---

## 3.4 · `beckham_faq` — DC NUEVO

| | |
|---|---|
| **Nombre exacto** | `beckham_faq` |
| **URL** | `POST https://es.synapse.rentax.es/webhook/22de1fbd-bada-40b3-a120-41e519442139` (el mismo `Webhook1`: el routing entre los dos nodos de agente lo hace el IF de WP-218 dentro de n8n, no dos webhooks) |
| **Modo** | **con `wait_for_callback`** |
| **Dónde se llama** | rama FAQ, justo después del `Collect data` de la pregunta libre |

**Inputs**

| Name | Tipo | Required | Modo de relleno | Fallback | De dónde sale |
|---|---|:--:|---|---|---|
| `conversation_id` | Text | ON | `Let Fin collect` + chip | vacío | la conversación |
| `user_id` | Text | ON | `Let Fin collect` + chip `{{user_id}}` | vacío | External ID |
| `conversationPartId` | Text | **OFF** | `Let Fin collect` + chip | vacío | la part · trampa WP-217 |
| `message` | Text | ON | `Let Fin collect` + chip del `Collect data` | vacío | **la pregunta del cliente** |
| `modo` | Text | ON | **`Custom value` = `faq_regimen`** | vacío | fijo |
| `punto` | Text | ON | **`Custom value` = `faq_entrada`** | vacío | fijo |
| **`idioma`** | Text | **OFF** | `Let Fin collect` + chip **`idioma_bot`** | vacío | la cadena (§3.2.6). **El FAQ contesta con un LLM: sin esto la respuesta puede salir en el idioma equivocado** |

**Object mapping:** **ninguno**. La respuesta no vuelve por el cuerpo del DC: vuelve por el
**callback** que reanuda el paso. Mapear algo aquí sería pisar atributos sin necesidad.

**Por qué el FAQ vive DENTRO del canvas y no como un reusable aparte** (medido el 4/08, y es la razón
por la que WP-221 está escrito así): *custom action + callback* **sí** devuelve el control al canvas;
**`Pass to <reusable>` NO vuelve** — es un handoff sin retorno. Un callback = **un turno**.

---

## 3.5 · `beckham_arranque_frio` — DC NUEVO, **solo si `Optional` no vale** (WP-217)

| | |
|---|---|
| **Nombre exacto** | `beckham_arranque_frio` |
| **URL** | la misma de `Webhook1` |
| **Inputs** | los de 3.3 **menos** los de «último mensaje» (`conversationPartId`, `message`, `conversation_part_id_debounce`, `First Message ID`), **más** `modo` = `Custom value` `solicitud` |
| **Cuándo se crea** | solo si `Required OFF` **no** basta para que el DC arranque sin mensaje previo del usuario |

**El problema que resuelve, con su evidencia:** en `G` el canvas llama al agente cuando el usuario
**todavía no ha escrito nada** en ese hilo (viene de pulsar botones). El DC 461046 falló ahí con
`Request validation error: Last comment: Body, Conversation part: Id missing` y **cero ejecuciones en
n8n** (conversación `215475260478265`, 28/07). Y **un input no textual no puede ser opcional**.

**Orden de intentos:** (1) poner esos inputs a `Optional` → (2) paso previo **Number→Text** →
(3) este DC dedicado. Si ninguna vale, **WP-217 se cierra como BLOQUEO con la evidencia, no con un
apaño**.

---

# 4 · EL CANVAS PASO A PASO

**Invariantes que valen para todo el canvas, y se comprueban al final una por una:**

> 🔁 **CADA PUNTO DE ESTE §4 SE CONSTRUYE DOS VECES**, una en la cadena ESP y otra en la ENG. Lo que se
> duplica y lo que no está en **§4.0**; qué path real es cada punto, en **§8**.

- **`Close conversation` exactamente CUATRO veces**: `D` y `N` **de cada cadena** (§4.0.2). Todo lo
  demás termina el workflow con el hilo **abierto**.
- **Ninguna rama de ninguna cadena toca `ticket.state`.** Ni una.
- **NO existen** `M. Path`, `SAVE`, `FLAG`, `RESUME → B`, `K → FRETRY → M`. No se reconstruyen.
- **Cada llamada a un DC que escriba lleva `punto` y `modo`** como `Custom value` del DC (B2).
- **El modo nunca viaja en el body del webhook público**: un tercero que golpee el webhook no puede
  declarar modo.
- **Los chips se insertan con el Attribute Inserter.** Un token escrito a mano se pinta como pill y
  resuelve a **`null`** (Pill Conversion Error).
- **El menú no es un punto de entrada garantizado**: el Messenger **reanuda el hilo abierto**.

## 4.0 · EL CANVAS ESTÁ DUPLICADO POR IDIOMA: qué se duplica y qué no

**Este §4 es un catálogo de PUNTOS del diseño, no de paths del canvas.** El canvas real tiene 32 paths
porque cada punto existe **dos veces**: una en la cadena ESP (`B. Introducción ESP` y lo que baja de
ella) y otra en la ENG (`C. Introducción ENG` y lo suyo), medido en la auditoría §1. Cuando una ficha
de abajo dice «el paso `D`», quiere decir **el punto de descarte por residencia, en las dos cadenas**.
Qué path real es cada punto, en **§8** — y hoy **28 de los 32 están sin identificar**.

### 4.0.1 · La tabla del doble trabajo

| Pieza | ¿Se duplica? | Por qué |
|---|:--:|---|
| **Conversation attributes** (los 10 de §2.1) | **NO** | Son del **workspace** y su valor es de la **conversación**. Una conversación baja por una sola cadena ⇒ cero colisión. No existe ni hace falta `veredicto_f2_en` |
| **Data Connectors** (los 9 de §3) | **NO** | Un DC es un objeto del workspace. El mismo `beckham_upsert_cualifica` se llama desde las dos cadenas |
| **El `Object mapping` de un DC** | **NO** | Vive dentro del DC (pestaña `2 Data`), no en el paso |
| **`punto` y `modo` (`Custom value`)** | **NO** | Viven dentro del DC (§3.2.3). Por eso hay 6 DC de escritor y no 12 |
| **n8n, Airtable, el prompt, los dos reusables** | **NO** | No se enteran de la cadena. Lo único que les llega del idioma es el input `idioma` (§3.2.6) |
| **El CABLEADO: el paso que llama al DC** | **SÍ, ×2** | Un paso de Data Connector por cadena |
| **«Map action inputs» de cada llamada** | **SÍ, ×2** | Es del **paso**, no del conector. **Aquí se va el tiempo**: los chips se insertan uno a uno con el Attribute Inserter, en cada punto de cada cadena |
| **Las condiciones de los branches** | **SÍ, ×2** | `I. Path` (ESP) y `W. Path` (ENG) son el mismo branch escrito dos veces (§4.I/W) |
| **Los pasos `Set`** (`intentos_fecha_bot`, `faq_turnos_bot`) | **SÍ, ×2** | Y ya venían desenrollados: §2.3. Es donde más se disparan los clics |
| **`Close conversation`** | **SÍ, ×2 ⇒ CUATRO** | `D` y `N` en cada cadena. La invariante «solo dos `Close`» pasa a **«exactamente cuatro, dos por cadena»** |
| **El path `L`** | **SÍ, ×2** | La invariante «un solo `L`» de WP-223 es **imposible** en un canvas duplicado. Se reescribe en 4.0.2 |
| **Los textos de cliente** | **SÍ, ×2 y en dos idiomas** | Es el propósito del duplicado: cada mensaje existe en ES y en EN |
| **El tag `jarry_ignore`** | **NO, si se pone en `A`** | `A. Selección Idioma` es el único paso por el que pasan las dos cadenas: es el único sitio que no hay que duplicar (§4.A0) |

### 4.0.2 · Las invariantes, reescritas para dos cadenas

- **`Close conversation` exactamente CUATRO veces**: `D`+`N` de la cadena ESP y `D`+`N` de la ENG.
  Cinco es un `Close` de más; cuatro repartidos 3-1 es una asimetría.
- **El path `L` son DOS**, con la **misma redacción traducida** y el **mismo team destino**. Lo que se
  conserva de WP-223 no es «un solo path» — que ya no se puede — sino **una sola redacción por idioma
  y un solo destino de asignación**. Si en una cadena `L` asigna y en la otra no, el fallo es
  invisible en español.
- **Ninguna rama de ninguna cadena toca `ticket.state`.** Ni una.
- **NO existen** `M. Path`, `SAVE`, `FLAG`, `RESUME → B`, `K → FRETRY → M`. No se reconstruyen **en
  ninguna de las dos cadenas**.
- **Cada punto que escribe lleva `punto` + `modo` (fijos en el DC) + el chip `idioma_bot` (del paso).**
- **Los chips se insertan con el Attribute Inserter**, y los de atributo de conversación **desde el
  encabezado `Conversation`**. Un token escrito a mano se pinta como pill y resuelve a **`null`**.

### 4.0.3 · Cómo se trabaja para que la asimetría no se cuele

Es un método, no una recomendación, y viene de que **el proyecto ya paga esta factura dos veces**: el
script del correo inglés de Airtable existe duplicado (`wacPpABiplv5tO7OM` y `wac2hg1IZkE0yOxMF`) y
hay que cambiar el texto en los dos; y `T075` está apuntado literalmente como *«la firma es la
asimetría: en inglés sí se marca»*.

1. **Punto por punto, no cadena por cadena.** Se abre el punto en ESP, se cablea, y **acto seguido** el
   mismo punto en ENG. Terminar la cadena española entera y luego empezar la inglesa es la forma
   segura de que a la inglesa le falten tres chips.
2. **Ninguna casilla del §6.4 se marca hasta que las DOS lo están.** Por eso el §6.4 lleva **dos
   casillas por punto**, `ESP` y `ENG`.
3. **Al renombrar los 28 «Path» (§8), el nombre lleva el idioma dentro**: `D · descarte residencia
   ESP` / `D · descarte residencia ENG`. Renombrar un path **es gratis y no rompe nada** (auditoría
   §1), y es la única defensa contra abrir el canvas dentro de una semana y no saber cuál es cuál.
4. **Cada arreglo posterior se apunta en la bitácora con «×2 hecho»**, o no está hecho.
5. **El e2e se recorre en los dos idiomas** (§6.5). Un e2e verde solo en español no dice nada del 50%
   del canvas.

---

## 4.A0 · `A. Selección Idioma` — el primer paso real, y su errata

- **Nombre en el canvas:** **`A. Selección Idioma`** (uno de los cuatro paths con nombre). Es el
  destino del trigger `When customer clicks a website element`.
- **Tipo de paso:** **reply buttons**, dos: `🇪🇸 Español` y `🇬🇧/🇺🇸 English` (auditoría §1).
- **Salidas:** `Español` → **`B. Introducción ESP`** · `English` → **`C. Introducción ENG`**.
- **Es el único paso que NO se duplica**, porque por él pasan las dos cadenas (§4.0.1).
- 🔴 **ERRATA QUE HAY QUE ARREGLAR, y es el primer texto que ve el cliente:** hoy dice
  **«¿Quieres que te atendamos en españo?»** — falta la `l` de «español» (auditoría §5). Se corrige en
  el cuerpo del mensaje de este paso, es un campo de **texto** libre y no rompe nada.
- **DC:** ninguno. **Cierra:** no.
- **Atributos:** ninguno **aquí**. El `Set idioma_bot` va en el primer paso de cada cadena, no en este,
  porque en este todavía no se sabe la respuesta (§3.2.6).
- **El tag `jarry_ignore`:** si el paso admite añadir un tag, **ponerlo aquí**. Es el único sitio del
  canvas que no hay que duplicar, y así no puede quedar puesto en una cadena y no en la otra.

## 4.A · `B. Introducción ESP` y `C. Introducción ENG` — la bienvenida, ×2

- **Tipo de paso:** mensaje del bot. **Uno por cadena**, el mismo contenido en su idioma.
- **Texto:** el que ya tiene el bot «Mobility Bot (OnClick)» (68617004) — explica la Ley Beckham. **No se toca** (la errata que
  sí se toca está en `A`).
- 🆕 **PRIMER PASO DE CADA UNO:** `Set idioma_bot = es` en `B` y `Set idioma_bot = en` en `C`
  (§3.2.6). Son los dos únicos `Set` del canvas que no van desenrollados, y de ellos depende que el
  informe salga en el idioma del cliente.
- **DC:** ninguno.
- **`modo` / `punto`:** ninguno (no hay llamada). El `menu` se declara en la llamada del paso que la
  haga, si la hace.
- **Cierra:** no. De cada uno bajan **dos** salidas medidas (auditoría §1): de `B` salen `D` y
  `Z. FAQ`; de `C` salen `AA` y `Q`. **Qué punto del diseño es cada una está DESCONOCIDO** (§8).
- **Por qué el tag `jarry_ignore`:** es la marca con la que se excluye la conversación de un
  distribuidor ajeno. En `q3bhdtoi` el `Distribuidor - Usuario envia mensaje` está **desactivado a
  mano desde el 1/08**; si en `s1hap599` hay uno equivalente **repartiendo clientes reales**, la
  colisión vuelve y el arreglo previsto es **una regla de audiencia que excluya `jarry_ignore`**, no
  apagarlo. Y aquí es producción: **no se apaga nada de otro equipo sin avisar** (trampa 22).
- ❌ **Fuera:** la pregunta «¿quieres acogerte?» y la salida `ANO` del canvas viejo. El menú las
  sustituye.
- ❌ **Fuera también: preguntar el idioma.** Ya está elegido en `A`, y dos orígenes para el mismo dato
  significa que uno miente.

## 4.AOPT · `AOPT · el menú` (WP-213)

- 🔁 **×2**: un menú por cadena, con los cuatro botones traducidos. Path real: **DESCONOCIDO en las dos
  cadenas** (§8.3 fila 3) — y es uno de los cuatro candidatos a **no existir todavía** (§8.3.1).
- **Tipo de paso:** **reply buttons**.
- **Los cuatro botones, en este orden de prioridad:**
  1. `Comprobar si cumplo` → rama **solicitud**
  2. `Calcular mi ahorro` → rama **calculadora**
  3. `Tengo preguntas` → rama **FAQ**
  4. `Hablar con una persona` → **path `L`**
- **El máximo de reply buttons por paso es DESCONOCIDO.** No hay cifra medida en ningún fichero del
  repo. Si 4 no caben, se cae el último y «hablar con una persona» se ofrece dentro de las otras
  ramas. **Entregable de WP-213 §4.2: la captura del número real de botones que caben**, en móvil y
  en escritorio.
- **`«no creo que cumpla»` NO va en el menú.** Cerrar a alguien por una autoevaluación sin datos quema
  un lead. Vive dentro del FAQ (WP-215).
- **DC:** ninguno en el propio menú.
- **Cierra:** no. **Atributos:** ninguno.
- **Mitigación declarada como probabilística:** los reply buttons **no impiden** escribir en el
  composer. El colector se deja activo mientras el workflow posea el slot para que el texto libre no
  se lo coma otro workflow, y se declara que esto **no es aislamiento**.

## 4.B · `B · FILTRO F1 · ¿residente fiscal en España los últimos 5 años?`

- 🔁 **×2**. Path real: **DESCONOCIDO** (§8.3 fila 4). **No confundir con el path `B. Introducción
  ESP`**: el `B` del diseño es este filtro, el `B` del canvas es la bienvenida española (§8.2).
- **Tipo:** reply buttons (`Sí` / `No`).
- **DC:** ninguno.
- **Salidas:** `Sí` → `D` (descarte) · `No` → `E`.
- **Cierra:** no. **Atributos:** ninguno.
- **Ojo con el sentido:** **`Sí` descarta.** Fue residente los últimos 5 años ⇒ no cumple.

## 4.D · `D · descarte por residencia` 🔴

- 🔁 **×2, y son 2 de los 4 `Close` del canvas.** Path real: **DESCONOCIDO** (§8.3 fila 5). Hay un path
  llamado `D` colgando de `B. Introducción ESP`, pero **coincidencia de letra ≠ coincidencia de punto**
  (§8.2).
- **Tipo:** mensaje + **`Close conversation`**.
- **DC:** `beckham_upsert_descarte_residencia` (`punto=descarte_residencia`, `modo=solicitud`).
- **Mapeo en «Map action inputs»:** solo chips — `user_id`, `intercom_conversation_id`,
  `conversation_id`, `conversationPartId`, `email`. `punto` y `modo` **no aparecen aquí**: van fijos en
  el conector.
- **Cierra: SÍ.** Es uno de los **dos únicos** `Close` del canvas.
- **Atributos:** ninguno. `Descarte` lo deriva el punto en n8n.
- **Orden dentro del paso:** llamar al DC **antes** del `Close`. Un `Close` primero puede dejar el
  paso sin ejecutar el conector.

## 4.E · `E · FILTRO F3 · ¿estás ya de alta en la Seguridad Social?`

- 🔁 **×2**. Path real: **DESCONOCIDO** (§8.3 fila 6).
- **Tipo:** reply buttons (`Sí` / `No`).
- **DC:** ninguno.
- **Salidas:** `No` → `H` (lead potencial) · `Sí` → `F`.
- **Cierra:** no. **Atributos:** ninguno.

## 4.H · `H · lead potencial` 🟡 (WP-224)

- 🔁 **×2**. Path real: **DESCONOCIDO** (§8.3 fila 7).
- **Tipo:** llamada al DC **ANTES de preguntar nada**, y después el `Collect data` de la fecha
  prevista.
- **DC:** `beckham_upsert_lead` (`punto=lead`, `modo=lead_potencial`).
- **Qué escribe sin que nadie lo mapee:** `lead_potencial=true`, `alta_ss=false` (derivados del punto)
  y `precision_fecha_prevista=desconocida`.
- **Cierra: NO.** Hilo abierto.
- **Atributos:** ninguno propio.
- **Por qué el DC va primero, con evidencia:** hoy `H` **no persiste nada**, así que quien abandona
  antes de responder la fecha **desaparece sin traza**. Ya existe la fila `recSop5rTn99Qft0o` con
  `lead_potencial=true` y **sin `UserId`**, irrecuperable por la clave de upsert.
- **Después:** `P`/`R` enriquecen **la misma fila** con el mismo punto; la rama `Q` («no sé cuándo»)
  **guarda el lead y no programa nada**.
- **Modelo de la fecha, y no es negociable:** los campos `date` de Airtable son **date-only**, así que
  «en marzo» se convertiría en «1 de marzo» y el mensaje mentiría. Va **ancla + precisión + ventana +
  texto literal** (`precision_fecha_prevista` ∈ `exacta｜mes｜trimestre｜rango｜desconocida`). Los 4
  campos son **nuevos en Airtable** → **CINCO sitios + el SEXTO** (refrescar el schema cacheado del
  nodo `Airtable Upser Expediente`, comprobando contra `docs/upser-campos-mapeados-2026-08-26.txt` que
  no se reactivó ninguno de los 36 quitados).
- 🚨 **Agujero abierto U3:** sin `user_id` el escritor devuelve **400 y no hay lead**. `H` tiene un
  agujero por arriba y **no está tapado**.

## 4.F · `F · Collect data · fecha de alta en la SS`

- 🔁 **×2**, y el `Collect data` de las dos cadenas escribe **el mismo** atributo `fecha_alta_ss_bot`
  (§2.1: los atributos no se duplican). Path real: **DESCONOCIDO** (§8.3 fila 8) — hay un path llamado
  `F` en el canvas, pero cuelga de la rama de `Z. FAQ` (§8.2).
- **Tipo:** **`Collect data`**, guardando en **`fecha_alta_ss_bot`**, tipo **Text**, formato
  `DD/MM/AAAA`.
- **Nunca un atributo `Date & Time`:** no se pueden usar en workflows (no se puede validar la zona
  horaria del cliente) y además fuerzan a pedir la hora. Es el problema de F2, ya resuelto así.
- **DC:** ninguno todavía.
- **Cierra:** no.
- ❌ **Fuera:** el paso `SAVE`. Escribir un atributo en un paso para leerlo en otro es el patrón que
  costó cinco días. La fecha viaja como **input del DC en el mismo path**.

## 4.DC1 · la llamada a `beckham_plazo_f2`

- 🔁 **El DC es UNO; el paso que lo llama, DOS** (§4.0.1). Y su «Map action inputs» se rellena dos
  veces: es el paso donde se ve mejor la diferencia entre conector y cableado.
- **Tipo:** paso de Data Connector, **en el mismo path que `F`**.
- **DC:** `beckham_plazo_f2` (§3.1). **Una sola vez en toda la conversación.**
- **Mapeo:** `fecha_alta_ss` ← chip `fecha_alta_ss_bot`.
- **`modo`/`punto`:** no lleva. No escribe.
- **Atributos que toca:** los tres del `Object mapping` — `veredicto_f2`, `fecha_limite_f2`,
  `dias_pasados_f2`.
- **Cierra:** no.

## 4.I/W · el branch del veredicto: `I. Path` (ESP) y `W. Path` (ENG) — **cuatro** salidas cada uno

🚨 **LOS DOS ESTÁN HOY EN ROJO, y no es un descuido: es el ORDEN.** Intercom marca `I. Path` y
`W. Path` con ⚠️ y el tooltip literal *«Branches don't have a value, make sure you add at least one
condition»*. Abierto `I. Path`: un paso **Branches** con **dos ramas, las dos con «Missing
condition»**, más el `else` — o sea que **todo cae al `else`** (auditoría §2).

**Las condiciones NO SE PUEDEN ESCRIBIR TODAVÍA, y por eso los ⚠️ no son un error de quien lo montó.**
La condición es `veredicto_f2 contains en_plazo`, y **el atributo `veredicto_f2` no existe en
`s1hap599`**. Y no basta con crearlo: el chip que hay que insertar es el del encabezado
`Conversation`, y quien puebla ese atributo es el **`Object mapping`** del DC (§3.1). El orden es
obligatorio y saltárselo obliga a reescribir las condiciones:

| # | Paso | Sección |
|:--:|---|---|
| 1 | Crear los **3 atributos** del cálculo, tipo Text | §2.1 |
| 2 | Crear el DC **`beckham_plazo_f2`** con su **`Object mapping` de 3 filas** (`Intercom object = Conversation`, `API object = Root`) | §3.1 |
| 3 | Cablear el paso del DC en el punto `F` **de las dos cadenas** | §4.DC1 |
| 4 | **Y AHORA SÍ**: volver a `I. Path` y a `W. Path` y escribir las cuatro salidas de cada uno | esta sección |
| 5 | Comprobar que el ⚠️ ha desaparecido **en los dos**. Si desaparece en uno solo, falta el otro | §6.4 |

**Cómo se escribe la condición, y aquí está la trampa nº1 del proyecto:**

- Se inserta el chip **`veredicto_f2` desde el encabezado `Conversation`** del selector de atributos.
- ⛔ **NUNCA desde el encabezado con el nombre del DC (`beckham_plazo_f2`).** Si el desplegable te
  ofrece los dos, el del conector es el output **local al path**: el branch lee vacío y cae al `else`.
  Es el bug que costó cinco días y mató cinco hipótesis (trampas 1 y 2).
- **El atributo se llama `veredicto_f2`, con E.** `veridicto_f2` no existe, y un branch sobre un
  atributo inexistente **no da error**: cae siempre al `else`.
- El operador es **`contains`**, no `is`. Los cuatro valores llegan como texto.

| Salida | Condición | Va a, en la cadena ESP | Va a, en la cadena ENG | Cierra |
|---|---|---|---|:--:|
| 1 | `contains en_plazo` | el punto `G` **de la ESP** | el punto `G` **de la ENG** | no |
| 2 | `contains fuera_plazo` | el punto `N` **de la ESP**, directo (sin `M. Path`) | el punto `N` **de la ENG** | **sí** |
| 3 | `contains no_valida` | la repregunta de fecha de la ESP (4.I3) | la de la ENG | no |
| 4 | `else` / `has no value` | el `L` **de la ESP**, directo y sin repreguntar | el `L` **de la ENG** | no |

🔴 **LOS DESTINOS DE LA ENG SON LOS DE LA ENG.** Un branch de la cadena inglesa que apunte a un paso
español manda al cliente al mensaje en el idioma equivocado y **no da ningún error, ni de validación
ni en ejecución**. Al cablear `W`, comprobar el destino de las cuatro salidas **una por una** contra la
tabla de §8.

**La diferencia entre la 3 y la 4 es de diseño, no cosmética** (WP-216 B7): la 3 es **culpa del dato**
(el cliente escribió algo que no es una fecha) y se repregunta; la 4 es **fallo de sistema** (el DC no
respondió) y repreguntarle al cliente por un fallo nuestro es maltratarle.

⚠️ **Y lo primero que hay que mirar al abrir `I` y `W` hoy:** mientras las condiciones estén vacías,
**el 100% de las conversaciones sale por el `else`**. Si esa salida está cableada a un paso con
`Close conversation`, el canvas **cierra todas las conversaciones** — que es exactamente el modo de
fallo de julio, con otra causa (entonces el atributo venía vacío; ahora la condición no está
escrita). Comprobarlo forma parte de la auditoría de los 11 `END` (§4.END).

### 4.I3 · la repregunta de fecha

- 🔁 **×2, y ya venía desenrollada ⇒ CUATRO pasos `Set` en el canvas** (§2.3). Path real:
  **DESCONOCIDO** (§8.3 fila 11), y es otro de los candidatos a no existir todavía (§8.3.1).
- **Tipo:** `Set intentos_fecha_bot` + mensaje + vuelta al `Collect data`. **Desenrollado**, porque un
  `Set` solo escribe literales:
  - primera vez: `Set intentos_fecha_bot = 1` → mensaje con **un ejemplo literal** de fecha → `F`.
  - segunda vez (`intentos_fecha_bot` ya vale `1`): `Set intentos_fecha_bot = 2` → **escalar a `L`**.
- **No cierra nunca.**

## 4.G · `G · cualifica` 🟢 (WP-217)

- 🔁 **×2**, y **las dos cadenas asignan al MISMO team y pasan al MISMO reusable**: el agente es uno,
  el idioma se lo dice el prompt a partir de la conversación. Path real: **DESCONOCIDO** (§8.3 fila 12).
- **Tipo:** DC del escritor + **`Assign team`** + **`Pass to n8n_BOT_mobility`**.
- **DC:** `beckham_upsert_cualifica` (`punto=cualifica`, `modo=solicitud`).
- **Mapeo:** los chips de identidad + `fecha_alta_ss` ← `fecha_alta_ss_bot` + `fecha_limite_plazo` ←
  `fecha_limite_f2`.
- **`Assign team`: al team del bot, `11098265` = `Ops_BOT_Mobility`.** No a Ops. **Y no es cosmético:**
  la audiencia de `reuse_mobility` es `Users AND Team assigned is Ops_BOT_Mobility` (auditada el
  1/08), así que **sin esta asignación los turnos 2..n no arrancan** y el agente contesta una vez y
  se calla.
- **`Pass to`:** al reusable `n8n_BOT_mobility` (66246057).
- **Cierra: NO.** `G`/`GEND` no cierra: el hilo sigue abierto para el resto de la solicitud.
- **Riesgo vivo:** el **arranque en frío** (§3.5). Es el punto donde el handoff ya falló con evidencia.

## 4.N · `N · descarte por plazo` 🔴

- 🔁 **×2, y son los otros 2 `Close`.** Path real: **DESCONOCIDO** (§8.3 fila 13) — hay un path `N` en
  el canvas, colgando de la rama de `Z. FAQ` (§8.2).
- **Tipo:** mensaje + **`Close conversation`**.
- **Se llega DIRECTO desde `I`.** `M. Path` **no se reconstruye**: los outputs de un DC son locales al
  path y su `Object mapping` **pisaba** el resultado del primero con otro `hoy`. El veredicto ya está
  en el atributo desde `F`.
- **DC:** `beckham_upsert_descarte_plazo` (`punto=descarte_plazo`, `modo=solicitud`).
- **Texto:** usa los chips **`fecha_limite_f2`** y **`dias_pasados_f2`** bajo el encabezado
  `Conversation`.
- **Cierra: SÍ.** El segundo y último `Close`.
- **Verificación específica:** en un recorrido `fuera_plazo` tiene que haber **una sola** ejecución del
  DC `beckham_plazo_f2` en la conversación. Antes había dos.

## 4.CALC · la rama calculadora (WP-214)

- 🔁 **×2**, y **la URL puede ser distinta por idioma**: si la calculadora tiene versión inglesa, son
  dos enlaces; si no, el mismo en las dos. **DESCONOCIDO** (la URL ya lo era: entregable 2 de WP-214).
  Path real: **DESCONOCIDO** (§8.3 fila 14).
- **Tipo:** mensaje con **ENLACE** (o botón-link) + reply buttons de vuelta al menú.
- **Intercom NO redirige el navegador.** No existe el paso «redirigir»: se manda un enlace.
- **DC:** ninguno hoy — **no escribe expediente** (decisión: no se crea fila salvo decisión expresa).
  Si algún día se le quiere traza, sería un DC propio con `modo=calculadora` como `Custom value`.
- **`modo` declarado:** `calculadora`.
- **Cierra: NO.** Es el punto de **máxima intención comercial**: `Cerrar recorrido` del diagrama
  original **se sustituye** por fin de workflow con el hilo abierto.
- **Atributos:** ninguno. La vuelta al menú **no reescribe nada** — `menu` es un valor, no una
  ausencia, y el paso del menú lo declara en su propia llamada si la hace.
- **URL de la calculadora: DESCONOCIDA.** La confirma el usuario (entregable 2 de WP-214).
- **Métrica del click: DESCONOCIDO** si es observable desde el workflow (incógnita 10). **No se
  promete métrica.**
- **Comprobar en la prueba visual:** si el enlace abre en la misma pestaña, el usuario **pierde el
  Messenger**.

## 4.FAQ · la rama FAQ, etapa 1: **UN turno** (WP-221)

> 🔁 **×2.** Esta es la ficha de **diseño**; el path real de la cadena ESP es **`Z. FAQ`** y lo que le
> falta dentro está aterrizado en **§4.Z**. El de la cadena ENG **está DESCONOCIDO y puede no existir**.

1. **`Collect data`** con la pregunta libre (Text).
2. **DC `beckham_faq`** (§3.4) con `wait_for_callback`, `modo=faq_regimen`, `punto=faq_entrada`.
3. **Respuesta del agente** publicada por el **callback** (`Callback_Intercom` de `beckham_bot`).
4. **`Set faq_turnos_bot`** al número de turno (`1`, `2`, `3`: desenrollado).
5. **`WDONE` · reply buttons:** `otra pregunta` · `ya está, quiero empezar` · `hablar con una persona`.
6. **Al tercer turno (`faq_turnos_bot >= 3`)**: la respuesta es **la oferta de humano o de solicitud**,
   y **no se responde nada más**.

- **`WDONE` es un BOTÓN, nunca una intención inferida por el LLM ni una tool que fije el estado.** Si
  el LLM decide, elige su propio nivel de privilegio. El agente puede **proponer** (`sugerencia_modo`
  en su salida); no decidir.
- **El bucle `W → WDONE → W` está RECHAZADO como diseño primario:** solo puede ejecutarse **un**
  workflow customer-facing a la vez y `wait_for_callback` es **un** callback por paso.
- **Tools del nodo FAQ del agente: exactamente dos** — `escalar_humano(motivo)` y
  `registrar_optout()`. **`buscar_contexto_fiscal` NO existe**: descartada en WP-220, el conocimiento
  fiscal va **inline en el `systemMessage`**.
- **Cierra: NO** en ningún paso de la rama.
- **Riesgo técnico medido:** la cadena Intercom→n8n→API Intercom→LLM→callback contra el **timeout de
  15 s**, con un `Wait2 3s` ya dentro. Responder 200 al webhook de inmediato y publicar por callback.

## 4.Z · `Z. FAQ`, el path REAL: hoy va DIRECTO a un `END`

**Lo medido** (auditoría §1 y §4): `Z. FAQ` existe, está **nombrado** (uno de los cuatro con nombre),
cuelga de **`B. Introducción ESP`** y **acaba en un `END` justo después**. Tal cual está, un cliente
que pulse «tengo preguntas» **se queda sin respuesta**, y con el hilo cerrado si ese `END` lleva
`Close conversation` — que es lo que hay que comprobar (§4.END).

**Lo que le falta DENTRO, en orden.** Es exactamente el §4.FAQ de arriba, aterrizado en este path:

| # | Paso que falta | Tipo de paso | Ficha |
|:--:|---|---|---|
| 1 | **La pregunta libre** | **`Collect data`**, tipo **Text** | §4.FAQ punto 1 |
| 2 | **La llamada al DC `beckham_faq`** con `wait_for_callback`. Su «Map action inputs»: chips `conversation_id`, `user_id`, `conversationPartId`, `message` (el del `Collect data`) y **`idioma_bot`**. `punto=faq_entrada` y `modo=faq_regimen` van **fijos en el conector**, no aquí | Data Connector | §3.4 · §3.2.6 |
| 3 | **La respuesta del agente NO es un paso**: la publica el **callback** (`Callback_Intercom` de `beckham_bot`) reanudando el paso que espera. No hay que dibujar nada | — | trampa 21 |
| 4 | **`Set faq_turnos_bot`** al número de turno, **desenrollado** a `1`, `2`, `3` | `Set` (texto literal) | §2.3 |
| 5 | **`WDONE` · reply buttons**: `otra pregunta` · `ya está, quiero empezar` · `hablar con una persona` | reply buttons | §4.FAQ punto 5 |
| 6 | **La salida del autodescarte** («no creo que cumpla»), que vive **dentro del FAQ** y no en el menú | mensaje + DC | §4.AUTO · WP-215 |
| 7 | **Quitar el `END` de detrás**, o dejarlo como fin de workflow **sin `Close`** | — | §4.END |
| 8 | **Al tercer turno** (`faq_turnos_bot >= 3`): la respuesta es la **oferta de humano o de solicitud**, y no se responde nada más | branch + mensaje | §4.FAQ punto 6 |

**Y `Z. FAQ` HAY QUE HACERLO DOS VECES.** El path nombrado cuelga de la cadena **ESP**. La auditoría
**no leyó** su equivalente inglés, así que **está DESCONOCIDO** si hay un `Z` en la cadena ENG o si el
FAQ inglés es uno de los 28 paths sin nombre. Se cierra abriendo `C. Introducción ENG` y siguiendo sus
salidas (`AA` y `Q`): **si no hay rama de FAQ en inglés, hay que crearla entera**, y son los 8 pasos
de arriba otra vez.

**Lo que más clics cuesta de todo el proyecto está aquí:** el tope de 3 turnos son **3 pasos `Set` por
cadena ⇒ 6 en el canvas** (§2.3), más los dos `WDONE`, más los dos `Collect data`. Presupuéstalo antes
de empezar, porque es el punto donde la cuenta se dispara.

**Y no se cierra ningún paso de la rama FAQ.** `Close conversation` solo en `D` y `N` de cada cadena
(§4.0.2).

## 4.AUTO · el autodescarte declarado (WP-215)

- 🔁 **×2**, dentro del FAQ de cada cadena. Path real: **DESCONOCIDO** (§8.3 fila 16), y es el cuarto
  candidato a no existir todavía (§8.3.1).
- **Se llega DESDE EL FAQ**, no desde el menú.
- **Tipo:** DC del escritor + mensaje + reply buttons (FAQ · calculadora · volver al menú).
- **DC:** `beckham_upsert_autodescarte` (`punto=autodescarte_declarado`, `modo=faq_regimen`).
- **NUNCA escribe `Descarte`** desde el canvas: el `punto` deriva `Descarte="Otro/Incompleto"` en n8n,
  que es distinto del veredicto de un filtro. Y **nunca** un `*_f2`.
- **Cierra: NO.** Hilo abierto.
- **Verificación:** existe fila con la traza del punto **y** el campo `Descarte`… lo escribe la deriva,
  así que lo que se comprueba es que **no hay ningún `Descarte` puesto por el canvas** y que el punto
  registrado es `autodescarte_declarado`.
- ⚠️ **Decisión abierta U4:** que el autodescarte **no sea terminal** está *pendiente de confirmación
  del usuario*.
- **Sin `modo` esta rama se rompe entera:** con la invariante 2 de WP-210, una llamada sin `modo` cae
  en fail-closed, `Resolver_Modo` corta el turno y **la traza no se escribe** — justo lo contrario del
  objetivo del paquete.

## 4.L · el path `L` · hablar con una persona (WP-223)

- 🔁 **AQUÍ LA INVARIANTE DE WP-223 CAMBIA, y hay que decirlo claro: «un solo path `L`» es IMPOSIBLE en
  un canvas duplicado.** Son **dos**, uno por cadena. Lo que se conserva del paquete es **una sola
  redacción por idioma** (la inglesa es la traducción de la española, no otro mensaje) y **un solo team
  destino**. Path real: **DESCONOCIDO** en las dos — ⚠️ **hay un path llamado `L` en la cadena ENG**
  (§8.2), que puede ser este punto o no.
- **Tipo:** mensaje + **`Assign` REAL**.
- **DOS paths `L`, uno por cadena**, cada uno alcanzable desde **su** menú, **su** FAQ, **su**
  calculadora, la salida 4 de **su** branch (`I` para la ESP, `W` para la ENG), el segundo intento de
  fecha y cualquier rama de error **de su cadena**.
- 🔴 **El fallo a vigilar:** que el `L` de una cadena asigne y el de la otra no. **En español no se
  nota**, y el cliente inglés se queda esperando a una persona que nunca recibe el aviso. Es
  literalmente la firma de `T075`.
- **Asigna de verdad a `Ops_Mobility`.** El id del team `Ops_Mobility` es **DESCONOCIDO** (el
  `11098265` es `Ops_BOT_Mobility`, el team del bot, y **no** es el mismo destino).
- **SLA en el texto: 24 a 48 horas** (M6, decidido por el usuario el 26/08). Va **en dos sitios**: aquí
  y **en el prompt**, porque el bot lo dice antes de que exista ningún escalado real.
- **`modo` declarado:** `humano`. No escribe expediente.
- **Cierra: NO.**
- **Y hay que arreglar `Mensaje_fallback` de `beckham_bot`:** hoy dice *«Un compañero del equipo lo
  revisará y te escribirá en breve»* y **solo llama a `Callback_Intercom`** — **nadie asigna a nadie**.
  O asigna, o se le cambia el texto. Es una promesa falsa en producción.

## 4.END · los ONCE `END`: hay que auditar cuál lleva `Close conversation` de verdad

**Medido:** el canvas tiene **11 END** (auditoría §1 y §4). El diseño admite `Close conversation` en
**cuatro** sitios y solo cuatro: `D` y `N` de cada cadena (§4.0.2).

**Un `END` de path NO es necesariamente un `Close`.** Un workflow puede terminar dejando el hilo
**abierto** — que es lo que tiene que pasar en `G`, en la calculadora, en el FAQ, en `L`, en `H` y en
el autodescarte. Así que los once hay que **abrirlos uno por uno** y anotar qué hay dentro: fin de
workflow, `Close conversation`, o las dos cosas.

**Por qué no vale asumirlo, con las dos consecuencias concretas:**

- Cerrar el hilo en una rama que no sea un descarte **rompe la reentrada**: el Messenger reanuda el
  hilo **abierto** (trampa 12), y un hilo cerrado obliga al cliente a reabrir para seguir.
- En `G` un `Close` **mata el handoff al agente**: los turnos 2..n los sirve `reuse_mobility` sobre una
  conversación **abierta y asignada** al team del bot. Un `Close` ahí y el bot contesta una vez y se
  calla, sin ningún error visible.

**La tabla que hay que rellenar. La auditoría NO pudo leerla: los once están DESCONOCIDOS.**

| END nº | Cuelga del path | Cadena | ¿`Close conversation`? | ¿Debería? |
|:--:|---|---|:--:|---|
| 1 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | `sí` **solo** si el path es `D` o `N` |
| 2 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 3 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 4 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 5 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 6 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 7 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 8 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 9 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 10 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |
| 11 | DESCONOCIDO | DESCONOCIDO | DESCONOCIDO | ídem |

**Tres `END` están además situados en un sitio que ya sabemos que es sospechoso** (auditoría §1): el
que va detrás de `Z. FAQ`, y los de las cadenas donde el diagrama medido los pone en medio de la
secuencia (`E ──[END]──► G`, `AA ─[END]──► R`, `R ─[END]──► T`). **Un `END` en medio de una secuencia
es la primera cosa que hay que entender**: o es el fin de una rama que se dibuja seguida, o es un
camino que se corta antes de tiempo. **No se decide desde aquí: se abre el path.**

**Criterio de cierre del §6.4:** exactamente **cuatro** `Close` en todo el canvas, y **dos por
cadena**. Cuatro repartidos 3-1 es una asimetría, y la asimetría entre idiomas es el fallo que este
canvas arriesga por diseño (§4.0.3).

---

# 5 · LOS WORKFLOWS DE INTERCOM

| # | Nombre | Tipo | Trigger | Estado |
|:--:|---|---|---|---|
| 1 | **OnClick Mobility v2** (id **«Mobility Bot (OnClick)» (68617004)**, app **s1hap599**) | **Custom Bot** · customer-facing | el punto de entrada del actual — **se cambia AL FINAL** | **EN CONSTRUCCIÓN**, estado `Draft`: **32 paths** con el texto y los caminos hechos, **duplicados por idioma**; faltan los DC y los atributos **en las dos cadenas**, las condiciones de `I`/`W`, y los pasos de dentro de `Z. FAQ` |
| 2 | `n8n_BOT_mobility` (**66246057**) | **Reusable** | invocado con `Pass to` | YA EXISTE en `q3bhdtoi` · se reutiliza · contiene el DC 461046 |
| 3 | `reuse_mobility` (**66250478**) | Workflow · customer-facing | `customer sends any message` | YA EXISTE en `q3bhdtoi` · turnos 2..n · audiencia `Users AND Team assigned is Ops_BOT_Mobility`, canales Web + iOS + Android + **EMAIL** |
| 4 | **BECKHAM_reentrada** | ver 5.2 | **`Reopened`** | **CREAR** — hoy **no existe ninguno** con ese trigger |
| 5 | **BECKHAM_faq_reusable** *(opcional)* | Reusable | `Pass to` desde la rama FAQ | **CREAR solo si** se quiere aislar el FAQ. **Con reservas**: `Pass to` **no vuelve**, así que el FAQ dejaría de poder continuar en el canvas |
| — | `OnClick Mobility` (**66243731**, Live) | Custom Bot | el disparador actual | **NO SE TOCA.** Es el rollback, y hoy entran leads reales por él |
| — | `OnClick Mobility — BACKUP AAAAMMDD` | Custom Bot | ninguno | **Duplicado de seguridad** antes de publicar (WP-233). **En producción es la ÚNICA vuelta atrás** (trampa 31): un canvas publicado mal no se «revierte», se restaura de aquí a mano. **Y se anota en la bitácora** |
| — | `Distribuidor - Usuario envia mensaje` | Workflow · background | `customer sends any message` | **DESACTIVADO a mano en `q3bhdtoi` desde el 1/08**, decisión del usuario. Si en `s1hap599` hay uno equivalente **con clientes reales**, no se apaga: se le excluye por audiencia con `jarry_ignore` |

**Reglas de convivencia, y las tres muerden:**

- **Solo UN workflow customer-facing puede correr a la vez**, y **retiene el slot incluso mientras
  espera input del usuario**. Los de **background** sí pueden ejecutarse varios sobre el mismo evento.
- **Cooldown de 2 minutos por cliente** en triggers customer-facing: una prueba encadenada que no
  dispara **puede ser esto y no un fallo de configuración**.
- **Los Workflows se evalúan ANTES de que Fin decida** si ejecuta una Procedure. Pero **Fin Simple
  Deploy actúa como override global**: si está activo para la misma audiencia, Fin responde y bloquea
  el Custom Bot. Diagnóstico: (1) mirar si hay mismatch **Lead vs User**, (2) hacer las audiencias
  mutuamente exclusivas, (3) si tienen que convivir, meter el nodo **«Let Fin handle»** para cederle
  el control después de recoger los datos.
- **Un Customer ticket NO dispara `customer sends any message`** (y pasarlo a `Submitted` **manda
  correo al cliente**). Es el bloqueo **WP-10**, y por eso el FAQ multiturno (WP-228) **no se
  construye**.

## 5.1 · Los dos que se reutilizan: qué hay que tocarles

- **`n8n_BOT_mobility` (66246057):** añadirle el input `modo` = `Custom value` `solicitud` a su DC
  461046 (§3.3). Nada más.
- **`reuse_mobility` (66250478):** nada, **si** `G` asigna al team `Ops_BOT_Mobility`. Aparcado sin
  tocar: el canal **EMAIL** marcado junto a Web/iOS/Android, con el aviso de Intercom de que **reduce
  las acciones disponibles para todos los canales**. Si aparece un comportamiento raro de canales,
  este es el primer sospechoso.

## 5.2 · Crear el workflow con trigger `Reopened` (WP-227), paso a paso

⚖️ **Este paquete depende de T081.** Con **B pura** (recomendada) **la reentrada cae SIEMPRE al menú**:
se van la lectura de `modo_bot`, las cuatro reglas de reencaminado y el TTL, y el paquete **pasa de M a
S**. Con **B híbrida** se construye tal cual está escrito en el PRD. Lo que **no** cambia en ninguna de
las dos: el trigger, que el enlace de recordatorio vaya **siempre al launcher**, y la matriz e2e.

1. **Workflows** → crear workflow nuevo. Nombre: `BECKHAM_reentrada`.
2. **Trigger** = **`Reopened`**. Los triggers están segmentados por estado: `First message`,
   `Any message`, **`Reopened`** — y **`Reopened` no es** `customer sends any message`. Hoy no existe
   ninguno con ese trigger en el workspace: no hay nada que pisar.
3. **Tipo:** aquí hay que decidir, y **es DESCONOCIDO qué admite Intercom con este trigger**:
   - si el workflow tiene que **volver a mostrar el menú**, tiene que ser **customer-facing** — y
     entonces **compite por el único slot** con `OnClick Mobility v2` y con `reuse_mobility`;
   - si solo **etiqueta o enruta**, puede ser **background** y no pide slot (etiquetar, enrutar con
     lógica booleana y cerrar hilos es justo lo que la doc pone como propio del background).
   **Comprobación:** al elegir el trigger, mirar qué tipos de paso ofrece el editor. Si ofrece
   mensajes y botones, es customer-facing.
4. **Audiencia:** la misma que el bot nuevo, y **cuidado con el mismatch Lead vs User** — configurar
   para «Users» cuando el visitante es «Lead» es el error clásico de que un workflow no dispare.
5. **Cuerpo:** con B pura, un solo camino → **mostrar `AOPT`**. Y **no tocar `ticket.state`**.
6. **El enlace del recordatorio va SIEMPRE al launcher**, nunca reabriendo el hilo viejo.
7. **Publicar** (`Set changes live`).
8. **Verificación · los CUATRO escenarios, y sin los cuatro el paquete no cierra**, cada uno con su
   par (`conversation_id` **no-Preview**, `execution_id`):
   - **hilo abierto** → se reanuda, el usuario **no ve** el menú (y queda documentado que no lo ve);
   - **hilo cerrado** → el mensaje del usuario **reabre** y dispara el workflow: **una** ejecución;
   - **dentro del cooldown de 2 min** → **no dispara nada**, verificado como **ausencia** de
     ejecución, no asumido;
   - **a los 3 días** → cae en el modo esperado según la regla.
9. **Contingencia:** cerrar los hilos del contacto de pruebas antes de cada prueba. El Messenger
   reanuda.

---

# 6 · CHECKLIST DE VERIFICACIÓN

Marcable. Si algo queda sin marcar, **el canvas no está entero** — y el disparador no se cambia.

> **DOS CASILLAS POR PUNTO en el §6.4**, `ESP` y `ENG`: el canvas está duplicado por idioma (§4.0) y
> una casilla marcada a medias es la asimetría que este proyecto ya ha pagado dos veces (§4.0.3).

### 6.1 · Antes del primer clic
- [ ] **§8.3 relleno**: los **28 paths sin nombre** abiertos, identificados y **renombrados con `ESP` /
      `ENG` dentro**. Cero paths llamados «Path»
- [ ] **§8.3.1 resuelto**: sabido si faltan puntos en el canvas (menú, autodescarte, repregunta de
      fecha, FAQ inglés) o si hay paths que agrupan pasos
- [ ] **§4.END relleno**: los **11 `END`** abiertos uno por uno, anotado cuál lleva `Close conversation`
- [ ] **B1b** · copiada la URL de callback del paso `Wait for webhook` del canvas nuevo y comparada con
      `q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015`. **El app id cambia seguro**; lo que se comprueba
      es si el `2af9679b-…` también
- [ ] **B2** · en un DC de prueba: con `Custom value`, el campo `Name` **es editable**. Comprobado en el
      **PRIMER** DC, antes de crear los otros cinco
- [ ] **B3** · el input de la conversación se llama `intercom_conversation_id`, **no** `conversation.id`
- [ ] **PRODUCCIÓN** · duplicado **`OnClick Mobility — BACKUP AAAAMMDD`** creado **y anotado en la
      bitácora** antes de publicar nada. **Es la única vuelta atrás que hay**
- [ ] El bot vivo **`66243731`** sigue `Live` y **sin tocar**; el nuevo **`«Mobility Bot (OnClick)» (68617004)`** sigue en `Draft`

### 6.2 · Atributos (no se duplican por idioma)
- [ ] `corte_contexto_bot` · Text
- [ ] `faq_resumen_bot` · Text
- [ ] `faq_turnos_bot` · Text
- [ ] `intentos_fecha_bot` · Text
- [ ] `corr_id_bot` · Text
- [ ] `fecha_alta_ss_bot` · Text
- [ ] **`idioma_bot`** · Text
- [ ] `veredicto_f2` · `fecha_limite_f2` · `dias_pasados_f2` creados **en `s1hap599`** y con el nombre
      exacto (`veredicto`, con **E**)
- [ ] **`modo_bot` NO existe** ⚖️
- [ ] Ninguno de los diez es de tipo `Number` ni `Date & Time`
- [ ] **Cero atributos con sufijo de idioma** (`_es` / `_en`): no hacen falta y son un error de diseño

### 6.3 · Data Connectors (no se duplican por idioma)
- [ ] `beckham_plazo_f2` con su `Object mapping` de **3 filas** (`Conversation` / `Root`), **creado
      ANTES de escribir las condiciones de `I` y `W`** (§4.I/W)
- [ ] Los **6** DC del escritor creados, cada uno con su `punto` y su `modo` como `Custom value`
- [ ] **El input `idioma`** presente en los **6** DC del escritor **y en `beckham_faq`**: `Let Fin
      collect`, `Name` = `idioma`, `Required` **OFF**, `Fallback` vacío (§3.2.6)
- [ ] `Fallback value` **vacío** en **todos** los inputs de **todos** los DC
- [ ] `Required` **ON** solo donde dice la tabla; `conversationPartId` **OFF** en todos
- [ ] `Content-Type: application/json` en todos
- [ ] `alta_ss`, `lead_potencial` y `Descarte` **sin mapear** en los seis
- [ ] `conversation_id` y `conversationPartId` presentes en los seis (agujero del `corr_id`, §3.2.4)
- [ ] DC 461046 con el input `modo` = `solicitud`
- [ ] `beckham_faq` creado con `wait_for_callback` y **sin** `Object mapping`
- [ ] `beckham_arranque_frio` creado **solo si** `Optional` no valió

### 6.4 · Canvas · **DOS casillas por punto**

**Lo que es único en todo el canvas:**
- [ ] `A. Selección Idioma` con la **errata «españo» corregida**
- [ ] El tag `jarry_ignore` puesto **una sola vez**, en `A` (o, si no cabe, en `B` **y** en `C`)
- [ ] `Close conversation` aparece **exactamente CUATRO** veces: `D`+`N` de la ESP y `D`+`N` de la ENG
- [ ] **Cero** pasos que toquen `ticket.state` en ninguna de las dos cadenas
- [ ] No existen `M. Path`, `SAVE`, `FLAG`, `RESUME → B`, `K → FRETRY → M` en ninguna cadena
- [ ] `grep` del canvas y de los PRD: **cero** apariciones de `veridicto_f2`

**Punto por punto, y la casilla no se marca hasta que las dos lo están:**

| Punto | ESP | ENG | Qué se comprueba |
|---|:--:|:--:|---|
| Bienvenida (`B`/`C`) | [ ] | [ ] | `Set idioma_bot` = `es` / `en` como **primer** paso |
| `AOPT` · menú | [ ] | [ ] | los 4 botones (o la captura que demuestre que no caben) |
| `B` · F1 residencia | [ ] | [ ] | `Sí` **descarta**; salidas a `D` y a `E` de **su** cadena |
| `D` · descarte residencia | [ ] | [ ] | DC `descarte_residencia` **antes** del `Close` |
| `E` · F3 alta en SS | [ ] | [ ] | `No` → `H`, `Sí` → `F`, de **su** cadena |
| `H` · lead potencial | [ ] | [ ] | el DC va **antes** de preguntar nada; no cierra |
| `F` · `Collect data` fecha | [ ] | [ ] | guarda en `fecha_alta_ss_bot`, Text `DD/MM/AAAA` |
| `DC1` · `beckham_plazo_f2` | [ ] | [ ] | en el **mismo path** que `F`; una sola llamada por conversación |
| `I`/`W` · branch veredicto | [ ] | [ ] | **⚠️ desaparecido**, 4 salidas, chip desde `Conversation`, destinos de **su** cadena |
| `I3` · repregunta de fecha | [ ] | [ ] | desenrollada: `Set … = 1` → repregunta · `= 2` → `L` |
| `G` · cualifica + handoff | [ ] | [ ] | `Assign team` del bot **antes** del `Pass to`; **no** cierra |
| `N` · descarte plazo | [ ] | [ ] | chips `fecha_limite_f2` y `dias_pasados_f2`; `Close` |
| Calculadora | [ ] | [ ] | enlace (Intercom no redirige); **no** cierra; vuelta al menú |
| FAQ (`Z` y su gemelo) | [ ] | [ ] | los **8 pasos** de §4.Z dentro; el `END` de detrás **sin `Close`** |
| Autodescarte | [ ] | [ ] | se llega **desde el FAQ**; **cero** `Descarte` escrito por el canvas |
| `L` · humano | [ ] | [ ] | `Assign` **REAL**; SLA 24-48 h en el texto; **misma** redacción traducida |
| El chip `idioma_bot` en el mapeo | [ ] | [ ] | presente en **cada** «Map action inputs» de un DC que escriba |

### 6.5 · e2e (WP-233) — **y solo entonces se cambia el disparador**

**Todo recorrido se hace DOS VECES, una por idioma.** Un e2e verde solo en español no dice nada del
50% del canvas.

- [ ] **4 recorridos del menú × 2 idiomas = 8**: comprobar requisitos · calculadora · preguntas · humano
- [ ] **4 escenarios de reentrada**: hilo abierto · cerrado · dentro del cooldown de 2 min · a los 3 días
- [ ] **Recorridos de dato × 2 idiomas**: `en_plazo` · `fuera_plazo` · fecha no parseable ×2 intentos ·
      `H` con abandono · `H` con «en marzo»
- [ ] Cada escenario con su par (`conversation_id` **no-Preview**, `execution_id`) y con
      `x-intercom-source-dataconnector-id` **no vacía** donde aplique
- [ ] **La columna `Idioma` de Airtable**: `Español` en los recorridos ESP y `Ingles` en los ENG
      (§3.2.6). **Ninguna fila con `Idioma` vacío**
- [ ] `bash scripts/contract-test.sh` **verde**
- [ ] En **ningún** escenario cambia `ticket.state`
- [ ] El contacto de e2e (`beckham-e2e@taxdown.es`) **no recibe ningún correo** — bandeja revisada tras
      **cada** recorrido. **Es producción: un correo de más le llega a un cliente de verdad**
- [ ] Todo recorrido por `H` deja fila con `lead_potencial=true` y `precision_fecha_prevista` no vacía
- [ ] `corr_id` presente en Intercom, n8n **y** Airtable para el mismo caso
- [ ] El backup del canvas **listado en la bitácora antes** de publicar
- [ ] **Y al terminar:** `versionId` de `beckham_bot` **sin cambiar** (`5b31d761-…`). Si cambió, alguien
      tocó el workflow por API y **hay que comprobar las credenciales de los 55 nodos**

---

# 7 · LAS TRAMPAS, CADA UNA CON SU EVIDENCIA

| # | Trampa | Evidencia |
|:--:|---|---|
| 1 | **Los outputs de un Data Connector son atributos LOCALES del path.** No se leen desde otro path. La única vía de sacarlos es el `Object mapping` de la pestaña `2 Data` | Conversación real `215475257954132` (28/07): el DC devolvió `fuera_plazo` / `25/10/2025` / 276 días y **el branch de `I` cayó al `else`**. El experimento que mató las 5 hipótesis: cambiar la condición a **`has any value`** y **seguir fallando** ⇒ no había *nada* que leer. Re-verificado el 1/08 en `215475300855984` |
| 2 | **Reinsertar el chip `veredicto` bajo el encabezado del DC ROMPE el arreglo** que está vivo en producción | INTERCOMDOC Parte D. El selector distingue el origen por encabezados `Conversation` / `People` / nombre del DC |
| 3 | **«Map action inputs» NO acepta valores literales** (sí acepta chips) | Probado por el usuario en pantalla el **28/07** (`.spartax/log.md` línea 21, punto 2) |
| 4 | **El paso `Set <atributo>` acepta SOLO texto literal y NO admite chips** ⇒ sirve para constantes, **no** para propagar el output de un DC | Resuelto el 28/07, INTERCOMDOC Parte B punto 3 |
| 5 | **`Required` es una condición de ejecución**: si falta el valor, **el conector no se ejecuta**. El label «Fin must collect this parameter» engaña | INTERCOMDOC C.4 |
| 6 | **Un input no textual NO puede ser opcional**, y el arranque en frío revienta | Conversación `215475260478265` (28/07): `Request validation error: Last comment: Body, Conversation part: Id missing` y **cero ejecuciones** en n8n |
| 7 | **`Fallback value` con valor PISA el dato bueno** en las ramas donde el campo no aplica | INTERCOMDOC C.5 + caso C7 del `contract-test-completo.sh`: se mandó solo `nombre` sobre un expediente lleno y los otros 17 campos quedaron intactos **porque el nodo descarta lo vacío** |
| 8 | **Al enlazar un input a un atributo, Intercom bloquea el `Name` y lo deriva del atributo** (`conversation.id`) ⇒ la clave del body deja de ser la que el escritor espera | Visto en pantalla; INTERCOMDOC pregunta abierta 1 + C.1. El escritor exige `body.intercom_conversation_id` (`COMPLETO` líneas 189 y 193) |
| 9 | **`Preview` está PROHIBIDO**: usa respuestas **mock** de los DC | Invalidó **dos** diagnósticos, el 23/07 y el 28/07 |
| 10 | **Las «Simulations» son de Fin, NO del editor de Custom Bots.** No hay ruta de UI para simular `OnClick Mobility` | Corregido por el usuario el 28/07. **No volver a recomendarlo** |
| 11 | **Escribir desde el Inbox no dispara nada**: es un mensaje de **admin**, no dispara `customer sends any message`, y **asigna** la conversación al teammate | 1/08 punto 6. La conversación `215475300855984` quedó contaminada así |
| 12 | **El Messenger REANUDA el hilo abierto** ⇒ el menú **no es un punto de entrada garantizado** y el agente puede entrar con cinco turnos ya escritos que no ha visto. Para probar de cero: **incógnito** o cerrar los hilos | Es el mecanismo que rompió el D0 del idioma el 7/08 |
| 13 | **Cooldown de 2 minutos** en triggers customer-facing: un reintento inmediato **no dispara** | INTERCOMDOC §1 |
| 14 | **Snapshot estático del perfil** al disparar el flujo: un Visitor sin `email`/`user_id` arrastra el vacío **hasta el final**, aunque el perfil se enriquezca después | INTERCOMDOC §1 y Parte B punto 8 |
| 15 | **Pill Conversion Error**: un token escrito a mano se pinta como pill pero resuelve a **`null`** y rompe la URL (404). Y **`user.id` (Contact ID) ≠ `user_id` (External ID de TaxDown = nuestro `UserId`)** | INTERCOMDOC §5. Sigue vivo como mecanismo general, **aunque NO era la causa del bug de F3** |
| 16 | **`Attribute Type Mismatch`** (guardar un string en un atributo `list`, o al revés) ⇒ **fallo de persistencia SILENCIOSO** en el Inbox | INTERCOMDOC §5. Por eso `dias_pasados_f2` es Text aunque sea un número |
| 17 | **Los atributos `Date & Time` no se pueden usar en workflows** (no se puede validar la zona horaria del cliente) y fuerzan a pedir la hora | INTERCOMDOC C.9. Es la razón de que F2 y F4 usen Text `DD/MM/AAAA` |
| 18 | **El «Test connection» con inputs enlazados manda una llamada REAL y llega vacía ⇒ 400 esperado**, no es un fallo de configuración | INTERCOMDOC C.8 |
| 19 | **Timeout de DC: 15 s** (30 solo en Fin Procedures) ⇒ responder 200 ya y publicar por callback | INTERCOMDOC §2 |
| 20 | **Un Customer ticket no dispara `customer sends any message`**, y pasarlo a `Submitted` **manda correo al cliente** | Bloqueo WP-10. Por eso WP-228 no se construye y por eso el e2e va **solo** con `beckham-e2e@taxdown.es` |
| 21 | **`Pass to <reusable>` NO devuelve el control**; *custom action + callback* **sí**. Un callback = **un turno** | Medido el 4/08 leyendo `Callback_Intercom`: `POST .../trigger_step/…` **reanuda** el paso que esperaba y entrega `mensajeUsuario` al canvas. Traza confirmada: `custom_action_started` → `wait_for_callback_started` → `wait_for_callback_webhook_received` → el agente publica |
| 22 | **Un workflow apagado y olvidado envenena un diagnóstico.** Ha pasado **dos veces**: el falso negativo del 29/07 y el `Distribuidor` apagado el 1/08 | 1/08, corrección al registro del propio día. **Antes de diagnosticar cualquier cosa: comprobar qué está encendido y qué no** |
| 23 | **Arrastrar un nodo sobre una flecha existente PUEDE reconectarla.** Mover el canvas no rompe conexiones; arrastrar encima, sí | 1/08: se perdió `Mensaje_fallback → Callback_Intercom` así, y estuvo **publicado**. Consecuencia real: el usuario no recibía **nada** |
| 24 | **Sin `user_id` el escritor devuelve 400 y NO HAY LEAD** | Agujero abierto **U3**. Ya existe la fila `recSop5rTn99Qft0o` con `lead_potencial=true` y sin `UserId`, irrecuperable |
| 25 | **`Respond OK` llegó a devolver el registro completo de Airtable** (68 campos, PII y URLs de formularios prefilled) y eso queda en los **logs del DC 7-14 días** | Council 28/07, hallazgo bloqueante 2 |
| 26 | **El canvas no se toca por API.** El MCP de Intercom solo lee conversaciones, contactos, compañías y artículos | Verificado en esta sesión y en la del 26/08 |
| 27 | **`update_workflow` del MCP sobre `beckham_bot` BORRA las credenciales** y exige reenviar los 55 nodos ⇒ los cambios en n8n se entregan como **fichero para Cmd+A** | Regla del proyecto, y la razón de que WP-207 entregue el nodo montado por anclas |
| 28 | **EL CANVAS ESTÁ DUPLICADO POR IDIOMA: cada arreglo se hace DOS VECES, y la firma del fallo es la ASIMETRÍA** — un bot que funciona en español y falla en inglés. Nadie lo nota probando en español | `docs/auditoria-canvas-nuevo-2026-08-27.md` §1: dos cadenas paralelas desde `A`. Y el proyecto ya lo paga dos veces: el script del correo inglés de Airtable existe duplicado (`wacPpABiplv5tO7OM` y `wac2hg1IZkE0yOxMF`), y `T075` está apuntado como *«la firma es la asimetría: en inglés sí se marca»* |
| 29 | **COINCIDENCIA DE LETRA ≠ COINCIDENCIA DE PUNTO.** En el canvas hay paths llamados `D`, `E`, `F`, `G`, `N` y `L` que **no son** los puntos `D`/`E`/`F`/`G`/`N`/`L` del diseño: `F` y `N` cuelgan de la rama del FAQ y `L` cuelga de la cadena **inglesa** | Topología medida en la auditoría §1, reproducida en §8.2. Las dos únicas identificaciones fiables son `I. Path` y `W. Path`, **por su ⚠️** y no por su letra |
| 30 | **Un `Idioma` vacío en Airtable NO da error: da el informe en ESPAÑOL.** `docs/nodo-v2-preparar-informe-2026-08-21.js` línea 69 solo compara con `"ingles"`; todo lo demás cae en `ES` y el PDF sale bien formado, se sube y se manda | Leído del fichero. Mismo patrón que el ID fijo de `Copiar la plantilla` (`T073`): fallo silencioso con entregable de aspecto correcto. Lo tapa el input `idioma` (§3.2.6) |
| 31 | **SE TRABAJA EN PRODUCCIÓN (`s1hap599` = TaxDown): el duplicado del Custom Bot antes de publicar es la ÚNICA vuelta atrás.** No hay workspace donde equivocarse gratis, y lo que hoy protege producción es el estado **`Draft`** del bot nuevo, no un entorno aparte | Decisión del usuario del 27/08 (auditoría, encabezado). Un canvas publicado mal no se «revierte»: se restaura del duplicado, a mano |

---

# 8 · TABLA DE MAPEO · los 32 paths reales ↔ los puntos del diseño

**Para qué es.** El canvas tiene **32 paths** y **28 se llaman «Path»** (auditoría §1). Sin esta tabla
rellena **no se puede empezar a cablear**, porque cada punto del §4 hay que encontrarlo **dos veces** y
hoy no hay forma de saber cuál es cuál. Renombrar un path **es gratis y no rompe nada** (auditoría §1),
así que la tabla se rellena renombrando: la columna «Nombre a poner» es el entregable.

> **REGLA DE ESTA TABLA:** lo que la auditoría leyó abriendo el canvas en el navegador va como hecho;
> **todo lo demás dice `DESCONOCIDO`**. Aquí **no se infiere** qué hay dentro de un path a partir de su
> letra ni de su posición.

## 8.1 · Lo que SÍ está leído (4 paths de 32)

| Path real | Nombre en el canvas | Punto del diseño | Qué se sabe, medido |
|---|---|---|---|
| `A` | **`A. Selección Idioma`** | **`A`** (§4.A0) | Reply buttons `🇪🇸 Español` / `🇬🇧/🇺🇸 English`. Es el destino del trigger. **Errata: «españo»** |
| `B` | **`B. Introducción ESP`** | **bienvenida**, cadena ESP (§4.A) | Cuelga de `A`. De él bajan **`D`** y **`Z. FAQ`** |
| `C` | **`C. Introducción ENG`** | **bienvenida**, cadena ENG (§4.A) | Cuelga de `A`. De él bajan **`AA`** y **`Q`** |
| `Z` | **`Z. FAQ`** | **FAQ**, cadena ESP (§4.Z) | Cuelga de `B`. **Va directo a un `END`**: le faltan los 8 pasos de §4.Z |

Y los dos que Intercom identifica **por su error**:

| Path real | Punto del diseño | Evidencia |
|---|---|---|
| **`I. Path`** | **el branch del veredicto**, cadena **ESP** (§4.I/W) | ⚠️ *«Branches don't have a value»*: abierto, es un paso **Branches** con 2 ramas + `else` |
| **`W. Path`** | **el branch del veredicto**, cadena **ENG** (§4.I/W) | el **mismo** ⚠️, en la posición simétrica de la cadena ENG |

**Total identificado: 6 de 32.** Los otros 26 (11 de ellos `END`) están **DESCONOCIDOS**.

## 8.2 · La topología leída

Esto **sí** está medido — el **orden** de los paths, no su contenido (auditoría §1):

```
A. Selección Idioma
├─► B. Introducción ESP ─┬─► D ──► E ──[END]──► G ──► I ⚠️ ──► J …
│                        └─► Z. FAQ ──[END]──► F ──► H ──► N ──► K …
└─► C. Introducción ENG ─┬─► AA ─[END]──► R ─[END]──► T ──► W ⚠️ ─► L …
                         └─► Q ─────────► S ────────► V ──► AC ─► O …
```

🚨 **CUIDADO CON LAS LETRAS: las del canvas NO son las del diseño.** El diseño llama `D` al descarte
por residencia, `E` al filtro F3, `F` al `Collect data` de la fecha, `G` a cualifica, `I` al branch,
`N` al descarte por plazo y `L` a hablar con una persona. En el canvas real **existen** paths llamados
`D`, `E`, `F`, `G`, `N` y `L` — y **no hay ninguna evidencia de que sean esos puntos**: `F` y `N`
cuelgan de la rama de `Z. FAQ`, y `L` cuelga de la cadena **inglesa**. **Coincidencia de letra ≠
coincidencia de punto.** Es la trampa más fácil de este documento, y la única excepción son `I` y `W`,
que se identifican por su ⚠️ y no por su letra.

## 8.3 · Los puntos del diseño ↔ el path real: la tabla a rellenar

Dos columnas de path porque **cada punto existe dos veces** (§4.0). `DESCONOCIDO` = la auditoría no
pudo leerlo, y se cierra abriendo el path en el editor (§8.4).

| # | Punto del diseño | Ficha | Path real ESP | Path real ENG | Nombre a poner al renombrar |
|:--:|---|---|---|---|---|
| 1 | Selección de idioma | §4.A0 | **`A`** ✅ (**único, no se duplica**) | — | `A. Selección Idioma` *(ya está)* |
| 2 | Bienvenida (`A` del diseño) | §4.A | **`B`** ✅ | **`C`** ✅ | *(ya están nombrados)* |
| 3 | `AOPT` · el menú de 4 salidas | §4.AOPT | **DESCONOCIDO** | **DESCONOCIDO** | `AOPT · menú ESP` / `AOPT · menú ENG` |
| 4 | `B` · **FILTRO F1**, ¿residente 5 años? | §4.B | **DESCONOCIDO** | **DESCONOCIDO** | `F1 · residencia 5 años ESP` / `… ENG` |
| 5 | `D` · descarte por residencia 🔴 **CLOSE** | §4.D | **DESCONOCIDO** | **DESCONOCIDO** | `D · descarte residencia ESP` / `… ENG` |
| 6 | `E` · **FILTRO F3**, ¿alta en la SS? | §4.E | **DESCONOCIDO** | **DESCONOCIDO** | `F3 · alta en SS ESP` / `… ENG` |
| 7 | `H` · lead potencial 🟡 | §4.H | **DESCONOCIDO** | **DESCONOCIDO** | `H · lead potencial ESP` / `… ENG` |
| 8 | `F` · `Collect data` de la fecha de alta | §4.F | **DESCONOCIDO** | **DESCONOCIDO** | `F · fecha alta SS ESP` / `… ENG` |
| 9 | `DC1` · la llamada a `beckham_plazo_f2` | §4.DC1 | **el MISMO path que el 8** | ídem | *(no es un path aparte: el DC va dentro del path de `F`)* |
| 10 | `I` · branch sobre `veredicto_f2` | §4.I/W | **`I. Path`** ✅ | **`W. Path`** ✅ | `I · branch veredicto ESP` / `W · branch veredicto ENG` |
| 11 | `I3` · la repregunta de fecha | §4.I3 | **DESCONOCIDO** | **DESCONOCIDO** | `I3 · repregunta fecha ESP` / `… ENG` |
| 12 | `G` · cualifica 🟢 + handoff al agente | §4.G | **DESCONOCIDO** | **DESCONOCIDO** | `G · cualifica ESP` / `… ENG` |
| 13 | `N` · descarte por plazo 🔴 **CLOSE** | §4.N | **DESCONOCIDO** | **DESCONOCIDO** | `N · descarte plazo ESP` / `… ENG` |
| 14 | La rama **calculadora** | §4.CALC | **DESCONOCIDO** | **DESCONOCIDO** | `CALC · calculadora ESP` / `… ENG` |
| 15 | La rama **FAQ** | §4.FAQ · §4.Z | **`Z. FAQ`** ✅ (incompleto) | **DESCONOCIDO** — **puede no existir** | `Z · FAQ ESP` *(ya)* / `Z · FAQ ENG` |
| 16 | El **autodescarte declarado** (dentro del FAQ) | §4.AUTO | **DESCONOCIDO** | **DESCONOCIDO** | `AUTO · autodescarte ESP` / `… ENG` |
| 17 | `L` · hablar con una persona | §4.L | **DESCONOCIDO** | **DESCONOCIDO** ⚠️ hay un path llamado **`L`** en la cadena **ENG**: comprobar si es este punto | `L · humano ESP` / `L · humano ENG` |
| — | Los **11 `END`** | §4.END | **DESCONOCIDO** ×11 | ídem | `END · <de qué path viene>` |

### 8.3.1 · El recuento que NO cuadra, y es un hallazgo, no un error de la tabla

- **32 paths** = 1 (`A`) + 2 (`B`, `C`) + **11 `END`** + **18 paths de lógica**.
- Los puntos 3 a 17 son **15 filas**, pero la 9 (`DC1`) **no es un path**: quedan **14 conceptos** que
  necesitan path propio. Duplicados por idioma serían **28**.
- **28 necesarios contra 18 disponibles ⇒ faltan hasta 10 paths.**

Eso significa una de dos, y hay que averiguar cuál **antes** de cablear el primer DC:

1. **Hay puntos del diseño que todavía no existen en el canvas.** Candidatos declarados, por lo que la
   auditoría **no** vio: el **menú `AOPT`**, el **autodescarte**, la **repregunta de fecha** y el **FAQ
   inglés**.
2. **Un path agrupa varios pasos** (un path de Intercom puede llevar dentro mensaje + `Collect data` +
   DC + branch), y entonces 18 pueden dar de sí para los 14 conceptos ×2.

**No se resuelve desde aquí: se resuelve abriendo los 28 paths.** Es el **entregable nº1** de la sesión
de construcción, antes del primer atributo y del primer DC — porque si falta el menú, falta un punto de
entrada entero y eso cambia el orden de todo lo demás.

## 8.4 · Cómo se rellena, clic a clic

1. Abrir el Custom Bot **«Mobility Bot (OnClick)» (68617004)** (app `s1hap599`), estado **Draft**. **No** se publica nada en este
   paso: renombrar y leer no cambia el comportamiento del bot vivo `66243731`.
2. Clic en un path sin nombre → el panel de la derecha muestra sus pasos en orden.
3. Anotar en la tabla de §8.3: **qué tipo es el primer paso** (mensaje ｜ reply buttons ｜ `Collect
   data` ｜ Data Connector ｜ Branches), **a qué paths sale**, y **si lleva `Close conversation`**
   (esto último va también a la tabla de §4.END).
4. **Renombrar el path** con el nombre de la columna «Nombre a poner», **con el idioma dentro**. El
   nombre es un campo de **texto** libre.
5. Pasar al siguiente. **Los 28, sin saltarse ninguno:** un path sin identificar es un punto que se
   cablea dos veces mal, o cero veces.
6. **Verificación:** al terminar, recorrer la lista de paths y comprobar dos cosas — **cero paths
   llamados «Path»**, y **cada nombre acaba en `ESP` o en `ENG`** salvo `A. Selección Idioma`. Si
   sobra o falta un nombre por cadena, hay una asimetría **antes** de haber cableado nada, que es el
   mejor momento posible para encontrarla.

---

## Apéndice · las URLs y los ids, en un sitio

| Qué | Valor |
|---|---|
| Escritor | `POST https://es.synapse.rentax.es/webhook/beckham-upsert-expediente` |
| Lector | `POST https://es.synapse.rentax.es/webhook/beckham-get-expediente` (**POST**, leído del export; algún documento dice GET y está mal) |
| Agente (`Webhook1`) | `POST https://es.synapse.rentax.es/webhook/22de1fbd-bada-40b3-a120-41e519442139` |
| Cálculo del plazo | `POST https://es.synapse.rentax.es/webhook/b3c76655-b298-4f5e-9772-48d301f6d925` |
| Callback a Intercom | `POST https://api.intercom.io/hooks/workflows/trigger_step/q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015/<conversation_id>` |
| `beckham_bot` | `nhOwpiGxikeU5DLR` · 55 nodos (48 lógica + 7 sticky) · **ACTIVO EN PRODUCCIÓN** |
| `beckham_f2_plazo.` | `wdOOF0ecCkgFOUjt` · 3 nodos |
| Custom Bot nuevo | **«Mobility Bot (OnClick)» (68617004)** · app **s1hap599** |
| Custom Bot vivo | **66243731** · Live |
| Reusable del turno | **66246057** |
| Relanzador de turnos 2..n | **66250478** |
| DC del turno | **461046** · app `q3bhdtoi` |
| DC del plazo | **468021** |
| DC del escritor (borrador visto 28/07) | **473461** |
| Team del bot | **11098265** = `Ops_BOT_Mobility` |
| Team `Ops_Mobility` | **DESCONOCIDO** |
| `admin_id` del cierre | **4418209** (fijo en `Cerrar_Conversacion`) |
| Contacto de e2e | `beckham-e2e@taxdown.es` |
| Contrato del escritor | `docs/contrato-upsert-expediente-v1.json` · 46 claves (`idioma` incluida) · puerta `docs/test-contrato-upsert.js` (25 comprobaciones) |
| Workspace donde se construye | **`s1hap599` = TaxDown, PRODUCCIÓN**. El anterior era `q3bhdtoi` |
| Forma del canvas nuevo | **32 paths** (`A`…`AF`) · **11 `END`** · **duplicado por idioma** · 4 paths con nombre · 2 con ⚠️ |
| Los dos branches del veredicto | **`I. Path`** (cadena ESP) y **`W. Path`** (cadena ENG) |
| El FAQ real | **`Z. FAQ`**, cadena ESP, hoy **directo a un `END`** |
| Normalización del idioma | `docs/nodo-validar-normalizar-COMPLETO.js` línea **373**: `es｜esp｜espanol…` → `Español` · `en｜eng｜english…` → `Ingles` |
| Plantillas del informe v2 | **8** = 4 combinaciones de régimen × 2 idiomas · `docs/nodo-v2-preparar-informe-2026-08-21.js` líneas 17-26 |
