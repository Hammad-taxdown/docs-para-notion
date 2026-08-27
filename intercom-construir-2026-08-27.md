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
> navegador: **`docs/auditoria-canvas-nuevo-2026-08-27.md`**, y trae dos hechos que reescriben esta
> guía de arriba abajo:
>
> 1. **Son 32 paths (`A`…`AF`) con 11 END, y el flujo está DUPLICADO POR IDIOMA**: `A. Selección
>    Idioma` bifurca en `B. Introducción ESP` y `C. Introducción ENG`, y de ahí bajan **dos cadenas
>    paralelas completas**. El §4 de esta guía es un catálogo de **puntos**, no de paths: **cada punto
>    se construye DOS VECES**. Lo que se duplica y lo que no está en **§4.0**; el mapeo entre los 32
>    paths reales y los puntos del diseño, en **§8**.
> 2. **Se trabaja en `s1hap599` = TaxDown PRODUCCIÓN** (decisión del usuario del 27/08). No hay
>    workspace de pruebas: **el backup del canvas antes de publicar es la única vuelta atrás**.
>
> Solo cuatro paths están nombrados (`A. Selección Idioma`, `B. Introducción ESP`, `C. Introducción
> ENG`, `Z. FAQ`). De los otros 28 la auditoría **no pudo leer el contenido**, así que aquí salen como
> **DESCONOCIDO**: no se inventa qué hay dentro de ninguno.

---

## 0 · ÍNDICE

1. Estado de hoy: qué está hecho y qué falta (**y los CUATRO bloqueos que hay que resolver antes del primer clic**)
2. Los atributos
3. Los Data Connectors, uno por uno — incluido **§3.2.6, el `idioma` que ahora sale de la rama**
4. El canvas paso a paso — **§4.0 es lo que se duplica y lo que no**
5. Los workflows de Intercom
6. Checklist de verificación (con **dos casillas por punto**: ESP y ENG)
7. Las trampas, con su evidencia
8. **TABLA DE MAPEO: los 32 paths reales ↔ los puntos del diseño**

---

# 1 · ESTADO DE HOY

## 1.1 · Hecho (no se vuelve a tocar)

| Qué | Estado | Evidencia |
|---|---|---|
| **Nodo `Validar y Normalizar` (el escritor)** con `corr_id` y `Log_Evento` | **PEGADO Y PUBLICADO**, 76.156 car., `versionId == activeVersionId == 5b31d761` | el usuario, 27/08 |
| **Prompt v14 en LangSmith**, tag `prod` movido | **HECHO** | el usuario, 27/08. No comprobable por MCP: solo consta que el fichero local pasa su puerta de 110 comprobaciones |
| **Custom Bot nuevo creado**: id **68617004**, app **`s1hap599` = TaxDown PRODUCCIÓN**, estado **Draft** | **CREADO con el TEXTO y los CAMINOS**: **32 paths** (`A`…`AF`), **11 END**, **duplicado por idioma** (dos cadenas paralelas ESP/ENG). Trigger `When customer clicks a website element`, audiencia `Users` + 2 más | `docs/auditoria-canvas-nuevo-2026-08-27.md`, leído en el navegador el 27/08 |
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

**Ya no es una incógnita, y la respuesta es la mala.** El bot `68617004` está en **`app s1hap599` =
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

### 🚨 B2 · «Map action inputs» **NO acepta valores literales** — y de ahí sale el diseño de los DC

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
| **`idioma_bot`** | **Text** | los **6** DC del escritor y el del FAQ. Lo fija un paso `Set` al empezar cada cadena | **CREAR**. Valores exactos: **`es`** en la cadena ESP y **`en`** en la ENG (§3.2.6). Es el único atributo cuyo valor depende de la cadena — y no hace falta uno por idioma: **el atributo es de la conversación, y una conversación recorre una sola cadena** |
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

## 3.2 · El escritor — `beckham_upsert_expediente` · SE REUTILIZA, Y HAY QUE PARTIRLO EN SEIS

| | |
|---|---|
| **URL** | `POST https://es.synapse.rentax.es/webhook/beckham-upsert-expediente` |
| **Id del DC (borrador visto el 28/07)** | **473461** |
| **Estado hoy** | conectado en los 4 puntos **D · H · G · N** (`docs/arquitectura-completa-2026-08-16.md`, subgrafo `DCS`) |
| **Contrato de entrada** | `docs/contrato-upsert-expediente-v1.json` — **46 claves**, extraídas del nodo vivo leyendo sus `body.X` |
| **Rechazos** | `user_id_forma_invalida` · `user_id_or_conversation_id_missing` · `punto_desconocido` · `descarte_desconocido` — devuelven `_invalid:true` y **no escriben nada** |

### 3.2.1 · La tabla COMPLETA de inputs del escritor

Las 9 originales (WP-05 §28) + `punto` + `modo` + las **dos del `corr_id`** que hoy faltan:

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

- **`Close conversation` SOLO en `D` y `N`.** Todo lo demás termina el workflow con el hilo **abierto**.
- **Ninguna rama toca `ticket.state`.** Ni una.
- **NO existen** `M. Path`, `SAVE`, `FLAG`, `RESUME → B`, `K → FRETRY → M`. No se reconstruyen.
- **Cada llamada a un DC que escriba lleva `punto` y `modo`** como `Custom value` del DC (B2).
- **El modo nunca viaja en el body del webhook público**: un tercero que golpee el webhook no puede
  declarar modo.
- **Los chips se insertan con el Attribute Inserter.** Un token escrito a mano se pinta como pill y
  resuelve a **`null`** (Pill Conversion Error).
- **El menú no es un punto de entrada garantizado**: el Messenger **reanuda el hilo abierto**.

## 4.A · `A · Bienvenida`

- **Tipo de paso:** mensaje del bot (+ **añadir el tag `jarry_ignore`** a la conversación).
- **Texto:** el que ya tiene el bot 68617004 — explica la Ley Beckham. **No se toca.**
- **DC:** ninguno.
- **`modo` / `punto`:** ninguno (no hay llamada). El `menu` se declara en la llamada del paso que la
  haga, si la hay.
- **Cierra:** no.
- **Atributos:** ninguno.
- **Por qué el tag:** es la marca con la que se excluye la conversación de un distribuidor ajeno.
  En `q3bhdtoi` el `Distribuidor - Usuario envia mensaje` está **desactivado a mano desde el 1/08**;
  si en el workspace nuevo hay uno equivalente **repartiendo clientes reales**, la colisión vuelve y
  el arreglo previsto es **una regla de audiencia que excluya `jarry_ignore`**, no apagarlo.
- ❌ **Fuera:** la pregunta «¿quieres acogerte?» y la salida `ANO` del canvas viejo. El menú las
  sustituye.

## 4.AOPT · `AOPT · el menú` (WP-213)

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

- **Tipo:** reply buttons (`Sí` / `No`).
- **DC:** ninguno.
- **Salidas:** `Sí` → `D` (descarte) · `No` → `E`.
- **Cierra:** no. **Atributos:** ninguno.
- **Ojo con el sentido:** **`Sí` descarta.** Fue residente los últimos 5 años ⇒ no cumple.

## 4.D · `D · descarte por residencia` 🔴

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

- **Tipo:** reply buttons (`Sí` / `No`).
- **DC:** ninguno.
- **Salidas:** `No` → `H` (lead potencial) · `Sí` → `F`.
- **Cierra:** no. **Atributos:** ninguno.

## 4.H · `H · lead potencial` 🟡 (WP-224)

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

- **Tipo:** **`Collect data`**, guardando en **`fecha_alta_ss_bot`**, tipo **Text**, formato
  `DD/MM/AAAA`.
- **Nunca un atributo `Date & Time`:** no se pueden usar en workflows (no se puede validar la zona
  horaria del cliente) y además fuerzan a pedir la hora. Es el problema de F2, ya resuelto así.
- **DC:** ninguno todavía.
- **Cierra:** no.
- ❌ **Fuera:** el paso `SAVE`. Escribir un atributo en un paso para leerlo en otro es el patrón que
  costó cinco días. La fecha viaja como **input del DC en el mismo path**.

## 4.DC1 · la llamada a `beckham_plazo_f2`

- **Tipo:** paso de Data Connector, **en el mismo path que `F`**.
- **DC:** `beckham_plazo_f2` (§3.1). **Una sola vez en toda la conversación.**
- **Mapeo:** `fecha_alta_ss` ← chip `fecha_alta_ss_bot`.
- **`modo`/`punto`:** no lleva. No escribe.
- **Atributos que toca:** los tres del `Object mapping` — `veredicto_f2`, `fecha_limite_f2`,
  `dias_pasados_f2`.
- **Cierra:** no.

## 4.I · `I · branch sobre `veredicto_f2`` — **cuatro** salidas

- **Tipo:** **Branch**.
- **La condición lee `veredicto_f2` bajo el encabezado `Conversation`.** No bajo
  `beckham_plazo_f2`. (Si el desplegable te ofrece los dos, es que has insertado el chip del
  conector: bórralo y vuelve a insertarlo desde el encabezado `Conversation`.)
- **El atributo se llama `veredicto_f2`, con E.** `veridicto_f2` **no existe**, y un branch sobre él
  cae siempre al `else` — que en el canvas viejo **cerraba la conversación**.

| Salida | Condición | Va a | Cierra |
|---|---|---|:--:|
| 1 | `contains en_plazo` | `G` | no |
| 2 | `contains fuera_plazo` | **`N` directo** (sin `M. Path`) | **sí** |
| 3 | `contains no_valida` | repregunta de fecha (4.I3) | no |
| 4 | `else` / `has no value` | **`L` directo**, sin repreguntar | no |

**La diferencia entre la 3 y la 4 es de diseño, no cosmética** (WP-216 B7): la 3 es **culpa del dato**
(el cliente escribió algo que no es una fecha) y se repregunta; la 4 es **fallo de sistema** (el DC no
respondió) y repreguntarle al cliente por un fallo nuestro es maltratarle.

### 4.I3 · la repregunta de fecha

- **Tipo:** `Set intentos_fecha_bot` + mensaje + vuelta al `Collect data`. **Desenrollado**, porque un
  `Set` solo escribe literales:
  - primera vez: `Set intentos_fecha_bot = 1` → mensaje con **un ejemplo literal** de fecha → `F`.
  - segunda vez (`intentos_fecha_bot` ya vale `1`): `Set intentos_fecha_bot = 2` → **escalar a `L`**.
- **No cierra nunca.**

## 4.G · `G · cualifica` 🟢 (WP-217)

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

## 4.AUTO · el autodescarte declarado (WP-215)

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

- **Tipo:** mensaje + **`Assign` REAL**.
- **UN solo path `L`, con UNA sola redacción**, alcanzable desde: el menú, el FAQ, la calculadora,
  la salida 4 de `I`, el segundo intento de fecha, y cualquier rama de error.
- **Asigna de verdad a `Ops_Mobility`.** El id del team `Ops_Mobility` es **DESCONOCIDO** (el
  `11098265` es `Ops_BOT_Mobility`, el team del bot, y **no** es el mismo destino).
- **SLA en el texto: 24 a 48 horas** (M6, decidido por el usuario el 26/08). Va **en dos sitios**: aquí
  y **en el prompt**, porque el bot lo dice antes de que exista ningún escalado real.
- **`modo` declarado:** `humano`. No escribe expediente.
- **Cierra: NO.**
- **Y hay que arreglar `Mensaje_fallback` de `beckham_bot`:** hoy dice *«Un compañero del equipo lo
  revisará y te escribirá en breve»* y **solo llama a `Callback_Intercom`** — **nadie asigna a nadie**.
  O asigna, o se le cambia el texto. Es una promesa falsa en producción.

---

# 5 · LOS WORKFLOWS DE INTERCOM

| # | Nombre | Tipo | Trigger | Estado |
|:--:|---|---|---|---|
| 1 | **OnClick Mobility v2** (id **68617004**, app **s1hap599**) | **Custom Bot** · customer-facing | el punto de entrada del actual — **se cambia AL FINAL** | **EN CONSTRUCCIÓN**: texto y caminos hechos; faltan DC y atributos |
| 2 | `n8n_BOT_mobility` (**66246057**) | **Reusable** | invocado con `Pass to` | YA EXISTE en `q3bhdtoi` · se reutiliza · contiene el DC 461046 |
| 3 | `reuse_mobility` (**66250478**) | Workflow · customer-facing | `customer sends any message` | YA EXISTE en `q3bhdtoi` · turnos 2..n · audiencia `Users AND Team assigned is Ops_BOT_Mobility`, canales Web + iOS + Android + **EMAIL** |
| 4 | **BECKHAM_reentrada** | ver 5.2 | **`Reopened`** | **CREAR** — hoy **no existe ninguno** con ese trigger |
| 5 | **BECKHAM_faq_reusable** *(opcional)* | Reusable | `Pass to` desde la rama FAQ | **CREAR solo si** se quiere aislar el FAQ. **Con reservas**: `Pass to` **no vuelve**, así que el FAQ dejaría de poder continuar en el canvas |
| — | `OnClick Mobility` (**66243731**, Live) | Custom Bot | el disparador actual | **NO SE TOCA.** Es el rollback, y hoy entran leads reales por él |
| — | `OnClick Mobility — BACKUP AAAAMMDD` | Custom Bot | ninguno | **Duplicado de seguridad** antes de publicar (WP-233) |
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

### 6.1 · Antes del primer clic
- [ ] **B1** · comprobado el app id real del bot 68617004. Si **no** es `q3bhdtoi`: apuntada la lista
      de lo que hay que recrear y los **tres pegados** de `beckham_bot`.
- [ ] **B1b** · copiada la URL de callback del paso `Wait for webhook` del canvas nuevo y comparada
      con `q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015`.
- [ ] **B2** · en un DC de prueba: con `Custom value`, el campo `Name` **es editable**.
- [ ] **B3** · el input de la conversación se llama `intercom_conversation_id`, **no** `conversation.id`.
- [ ] Duplicado `OnClick Mobility — BACKUP AAAAMMDD` creado **antes** de publicar nada.

### 6.2 · Atributos
- [ ] `corte_contexto_bot` · Text
- [ ] `faq_resumen_bot` · Text
- [ ] `faq_turnos_bot` · Text
- [ ] `intentos_fecha_bot` · Text
- [ ] `corr_id_bot` · Text
- [ ] `fecha_alta_ss_bot` · Text
- [ ] `veredicto_f2` · `fecha_limite_f2` · `dias_pasados_f2` existen **en este workspace**
- [ ] **`modo_bot` NO existe** ⚖️
- [ ] Ninguno de los seis nuevos es de tipo `Number` ni `Date & Time`

### 6.3 · Data Connectors
- [ ] `beckham_plazo_f2` con su `Object mapping` de **3 filas** (`Conversation` / `Root`)
- [ ] Los **6** DC del escritor creados, cada uno con su `punto` y su `modo` como `Custom value`
- [ ] `Fallback value` **vacío** en **todos** los inputs de **todos** los DC
- [ ] `Required` **ON** solo donde dice la tabla; `conversationPartId` **OFF** en todos
- [ ] `Content-Type: application/json` en todos
- [ ] `alta_ss`, `lead_potencial` y `Descarte` **sin mapear** en los seis
- [ ] `conversation_id` y `conversationPartId` presentes en los seis (agujero del `corr_id`, §3.2.4)
- [ ] DC 461046 con el input `modo` = `solicitud`
- [ ] `beckham_faq` creado con `wait_for_callback` y **sin** `Object mapping`
- [ ] `beckham_arranque_frio` creado **solo si** `Optional` no valió

### 6.4 · Canvas
- [ ] `Close conversation` aparece **exactamente dos veces**: `D` y `N`
- [ ] **Cero** pasos que toquen `ticket.state`
- [ ] No existen `M. Path`, `SAVE`, `FLAG`, `RESUME → B`, `K → FRETRY → M`
- [ ] `I` tiene **cuatro** salidas y la condición lee `veredicto_f2` bajo `Conversation`
- [ ] `grep` del canvas y de los PRD: **cero** apariciones de `veridicto_f2`
- [ ] `G` asigna al team `11098265` (`Ops_BOT_Mobility`) **antes** del `Pass to`
- [ ] `A` pone el tag `jarry_ignore`
- [ ] `AOPT` tiene los 4 botones (o, si no caben, la captura que lo demuestra)
- [ ] El path `L` es **uno solo**, con **una sola redacción**, y asigna de verdad

### 6.5 · e2e (WP-233) — **y solo entonces se cambia el disparador**
- [ ] **4 recorridos del menú**: comprobar requisitos · calculadora · preguntas · humano
- [ ] **4 escenarios de reentrada**: hilo abierto · cerrado · dentro del cooldown de 2 min · a los 3 días
- [ ] **Recorridos de dato**: `en_plazo` · `fuera_plazo` · fecha no parseable ×2 intentos · `H` con
      abandono · `H` con «en marzo»
- [ ] Los 8 escenarios con su par (`conversation_id` **no-Preview**, `execution_id`) y con
      `x-intercom-source-dataconnector-id` **no vacía** donde aplique
- [ ] `bash scripts/contract-test.sh` **verde**
- [ ] En **ningún** escenario cambia `ticket.state`
- [ ] El contacto de e2e (`beckham-e2e@taxdown.es`) **no recibe ningún correo** — bandeja revisada
      tras **cada** recorrido
- [ ] Todo recorrido por `H` deja fila con `lead_potencial=true` y `precision_fecha_prevista` no vacía
- [ ] `corr_id` presente en Intercom, n8n **y** Airtable para el mismo caso
- [ ] El backup del canvas **listado en la bitácora antes** de publicar

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
| Custom Bot nuevo | **68617004** · app **s1hap599** |
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
| Contrato del escritor | `docs/contrato-upsert-expediente-v1.json` · 46 claves · puerta `docs/test-contrato-upsert.js` (25 comprobaciones) |
