# FAQ · DISEÑO FINAL · 28/08/2026

> **Qué es este documento.** El diseño del FAQ que se construye. Sale de tres diseños candidatos y
> nueve veredictos adversariales: **los tres candidatos murieron**, y este es el que queda al
> rescatar lo que aguantó de cada uno y resolver por construcción los fallos que los mataron.
>
> **Regla de lectura:** todo lo que aquí se llama MEDIDO está comprobado hoy contra el sistema vivo
> o contra un fichero del repo, con la línea citada. Todo lo que es DESCONOCIDO se dice, y ninguna
> pieza del diseño depende de un DESCONOCIDO sin declarar qué pasa si sale mal.

---

## 31/08 11:55 · TERCERA PASADA · **CINCO de los SIETE nodos YA ESTÁN CONSTRUIDOS**

> **Esta sección manda sobre TODO lo de abajo, incluidas las dos secciones del 31/08 que le siguen, y
> no borra nada.** Medido a las **11:55 Madrid** por MCP de solo lectura contra `beckham_bot`
> (`nhOwpiGxikeU5DLR`) y contra los ficheros del repo, con la línea citada. **Cero escrituras.**
>
> **El titular:** entre la pasada de las 11:33 y esta, el sidecar se ha empezado a construir en la
> UI. Las dos pasadas anteriores razonaban contra un `beckham_bot` de **55** nodos sin una línea de
> FAQ dentro. Hoy tiene **60** y cinco de ellos son el sidecar. Todo lo que hay está **bien** y
> encaja con el diseño; lo que falta son **dos nodos, dos rellenos y cuatro aristas**.

### C0 · La referencia de «no lo he tocado» cambia por TERCERA vez hoy, y ahora es `d4ec794a` con 60 nodos

```
beckham_bot · nhOwpiGxikeU5DLR · active=true · triggerCount=4  (era 3)
  nodos           = 60                                          (era 55)
  versionId       = d4ec794a-000f-4b0b-930e-4b2c306baf45
  activeVersionId = d4ec794a-000f-4b0b-930e-4b2c306baf45         → PUBLICADO, no hay borrador
  updatedAt       = 2026-08-31T09:49:18.951Z   = 11:49 Madrid, HOY
  settings.errorWorkflow    = BJfExmwu1fI1aPpY
  settings.executionTimeout = 120
```

Las tres referencias de hoy, en orden, para que no se cite la vieja: `ef638a18` (briefing, 55 nodos)
→ `7f439285` (pasada de las 11:33, 55 nodos) → **`d4ec794a` (esta, 60 nodos)**. `triggerCount` sube
de 3 a 4 porque `Webhook_FAQ` **es** un trigger. **La meta sigue siendo 62 nodos**, y el número
aguanta por casualidad aritmética: el diseño decía `55 + 7 = 62` y hoy es **`60 + 2 = 62`**.

### C1 · LO QUE YA ESTÁ, nodo a nodo y con sus parámetros medidos

| # | Nodo | Tipo medido | Estado | Contra el diseño |
|---|---|---|---|---|
| 1 | `Webhook_FAQ` | `webhook` **tv2.1**, POST, `path 76ab852d-3a77-43e2-b951-f75d8f85dbcd`, `options:{}` (responseMode por defecto), `alwaysOutputData:true` | **activo** | **exacto.** UUID, POST, 200 inmediato |
| 2 | `Preparar_Prompt_FAQ` | `code` tv2, `jsCode` de **13.654** car. | **activo** | **exacto, y byte a byte** |
| 3 | `¿Cortar_FAQ?` | `if` **tv2.3**, una condición: `leftValue = ={{ $json._cortado }}`, operador `boolean / true`, `typeValidation: strict` | **activo** | **exacto.** Es el `V_IF` de `pasos-faq.sh` sin una coma de diferencia |
| 4 | `Langsmith Prompt FAQ` | `CUSTOM.langSmithPrompt` tv1, `parameters = {"inputParameters":{"parameters":[]}}` | **DISABLED y VACÍO** | ver C3 |
| 5 | `Callback_Intercom_FAQ` | `httpRequest` **tv4.4**, `parameters = {"method":"POST","options":{}}` | **DISABLED y VACÍO** | ver C4 |

**El pegado del paso 3 está verificado byte a byte, no por longitud.** El `jsCode` vivo y
`docs/nodo-preparar-prompt-faq-2026-08-28.js` tienen los mismos 13.654 caracteres **y el mismo
sha256** (`5d7f26ee9c629ab8…`). No hay que repegarlo, y el paso 3 de `pasos-faq.sh` está cumplido.

**Las aristas que ya existen son las tres correctas, y ni una más:**

```
Webhook_FAQ ──► Preparar_Prompt_FAQ ──► ¿Cortar_FAQ? ──┬─[true ]─► Callback_Intercom_FAQ  (disabled)
                                                       └─[false]─► Langsmith Prompt FAQ   (disabled)
```

**Y el aislamiento AGUANTA, medido en el grafo entero de los 60:** ningún nodo del intake apunta a un
nodo del FAQ, y ningún nodo del FAQ apunta a un nodo del intake. Las aristas no-`main` siguen siendo
**exactamente cuatro** y todas van al agente viejo: `David Beckham --ai_languageModel--> AI Agent`,
`guardar_datos_cliente / leer_expediente / analizar_documento --ai_tool--> AI Agent`. **`ai_tool` del
lado del FAQ = 0**, porque el agente del FAQ todavía no existe.

### C2 · LO QUE FALTA · dos nodos, dos rellenos, cuatro aristas

Contado sobre el export de las 11:55, no heredado:

| Qué | Cuál | Pasos de `pasos-faq.sh` |
|---|---|---|
| **crear 2 nodos** | `AI AGENT FAQ` (hay **1** solo `@n8n/n8n-nodes-langchain.agent` en los 60) · `Mensaje_Fallback_FAQ` (los **8** `code` están todos identificados y ninguno es él) | 6 y 7 |
| **rellenar 2 nodos** | `Langsmith Prompt FAQ` (C3) · `Callback_Intercom_FAQ` (C4) | 5 y 8 |
| **habilitar 2 nodos** | los dos mismos, hoy `disabled: true` | 5 y 8 |
| **4 aristas** | `Langsmith Prompt FAQ → AI AGENT FAQ` · `AI AGENT FAQ → Callback_Intercom_FAQ` · `Langsmith Prompt FAQ --[error]→ Mensaje_Fallback_FAQ` · `AI AGENT FAQ --[error]→ Mensaje_Fallback_FAQ` · más `Mensaje_Fallback_FAQ → Callback_Intercom_FAQ` | 5, 6, 7 |
| **1 arista `ai_languageModel`** | `David Beckham → AI AGENT FAQ`. Sigue **SIN MEDIR** si un sub-nodo admite dos consumidores (§D.4): en los 60 nodos no hay ni un precedente | 6 |

Los pasos **0, 1, 2, 3 y 4** de `docs/pasos-faq.sh` **están cumplidos**. Los que quedan son **5, 6,
7, 8** en n8n y **9 a 12** de medición y canvas.

### C3 · `Langsmith Prompt FAQ` NO se creó duplicando · la §A6.1 queda FALSIFICADA

La §A6 punto 1 de la pasada de las 11:33 dice que el paso 5 pasa de «rellenar cuatro campos» a
«**comprobar cuatro y cambiar uno**», porque el nodo duplicado trae ya `promptName`, `promptTag` y
los dos `inputParameters`. **Contra el nodo vivo eso es falso.** Los dos nodos, uno al lado del otro:

```
Langsmith Prompt      (el del intake, activo, onError: continueErrorOutput)
  {"promptName":"bot_mobility_prompt","promptTag":"prod",
   "inputParameters":{"parameters":[
     {"name":"contexto","value":"={{ $json.contexto }}"},
     {"name":"current_date","value":"={{ $now.setZone('Europe/Madrid').toFormat('dd/MM/yyyy') }}"}]}}

Langsmith Prompt FAQ  (disabled, onError: null)
  {"inputParameters":{"parameters":[]}}
```

**Está en blanco:** sin `promptName`, sin `promptTag` y con `inputParameters` vacío. O sea que se creó
**desde el panel de nodos**, no con un copiar/pegar del vivo. Y eso importa por una razón que no es
cosmética: **duplicar era lo único que arrastraba la credencial.** El nodo de LangSmith es `CUSTOM`,
no se recrea por MCP, y su credencial solo se pone desde la UI.

**Lo que sale más barato, y es lo que recomiendo:** **borrar el `Langsmith Prompt FAQ` que hay** y
volver a crearlo con **Ctrl+C / Ctrl+V sobre `Langsmith Prompt`** dentro del mismo workflow. Eso trae
los cuatro campos rellenos **y** la credencial de un golpe, y deja un solo campo que cambiar: el
`onError` a `continueErrorOutput` apuntando a `Mensaje_Fallback_FAQ` (**no** a `Prompt_De_Respaldo` —
§3.3). Rellenarlo a mano son cuatro campos **más** la credencial, que es justo la parte que no se
puede verificar desde bash.

> **Y el MCP no puede confirmar la credencial de ninguna de las dos formas:** devuelve
> `credentials = {}` en **todos** los nodos, también en los que funcionan. Los cinco nodos del FAQ
> salen con `credentials={}` y eso **no dice nada**. La credencial se confirma **ejecutando**.

### C4 · `Callback_Intercom_FAQ` es **tv4.4**, no tv4.2, y en tv4.4 el `jsonBody` no aparece hasta dos toggles antes

El diseño (§3.5 y la tabla del §A) dice `httpRequest` **tv4.2**. El nodo creado es **tv4.4**, y **está
bien así**: `Cerrar_Conversacion`, que es el otro POST a Intercom de la casa, también es tv4.4 y lleva
exactamente la misma forma de body. **No hay que recrearlo**; lo que hay que corregir es el número en
este documento.

Lo que le falta, comparado con el `Callback_Intercom` vivo, que es el molde:

| Campo | `Callback_Intercom` (vivo, tv4.2) | `Callback_Intercom_FAQ` (hoy, tv4.4) |
|---|---|---|
| `method` | `POST` | **`POST`** ✔ |
| `url` | `=…/trigger_step/q3bhdtoi_2af9679b-…/{{ $('Webhook1')… }}` | **ausente** → `c cb-url` |
| `sendBody` | `true` | **ausente** |
| `specifyBody` | `"json"` | **ausente** |
| `jsonBody` | `={{ { "data": { "mensajeUsuario": $json.output.replace(/<[^>]+>/g, '') } } }}` | **ausente** → `c cb-body` |
| `retryOnFail` | `true` | **`false`** |
| `onError` | `null` | **`null`** ✔ — correcto: el fallo tiene que salir ROJO para que muerda el `errorWorkflow` (§A) |
| credencial | ninguna (el token va en la URL) | ninguna ✔ |

**El detalle de UI que se pierde si no se dice:** en `httpRequest` tv4.x el campo del JSON **no está
en pantalla** hasta que se activa **Send Body** y se pone **Body Content Type = JSON** y **Specify
Body = Using JSON**. Sin esos dos toggles no hay dónde pegar el `cb-body`, y el nodo se queda haciendo
un POST sin cuerpo — que Intercom acepta con 200 y **no publica nada**: turno mudo con la ejecución
en verde. Va al paso 8.

### C5 · El sidecar a medias es **INERTE**, y eso está medido, no supuesto

`Webhook_FAQ` está **habilitado** y su path es público, así que la pregunta importa: ¿qué pasa hoy si
alguien hace un POST? Seguido por el grafo:

| Camino | Dónde muere hoy | Qué cuesta |
|---|---|---|
| turno normal (`_cortado: false`) | `¿Cortar_FAQ?` rama 1 → `Langsmith Prompt FAQ`, que está **disabled y sin salidas** | **cero.** No se llama al modelo: LangSmith es el paso anterior al agente y no corre |
| turno cortado (`_cortado: true`) | `¿Cortar_FAQ?` rama 0 → `Callback_Intercom_FAQ`, **disabled y sin URL** | cero |

**Las dos ejecuciones salen VERDES y no publican nada, no escriben nada y no gastan un token.** O sea
que la afirmación del §9 —«los pasos 5, 6 y 7 son aditivos: nadie los invoca hasta que exista el
conector del otro lado»— **está ahora medida en el estado real**, y con un matiz mejor que el escrito:
aunque alguien encuentre el UUID y haga un `curl`, hoy **no puede provocar ni un gasto ni una
escritura**. El riesgo R5 (webhook público sin auth) no se activa hasta que se habiliten los dos
nodos.

**El corolario para el orden de trabajo:** los dos nodos que faltan se pueden crear con calma, pero
**`Langsmith Prompt FAQ` y `Callback_Intercom_FAQ` no se habilitan hasta que la cadena esté entera**.
Habilitar LangSmith con el agente sin crear deja el turno muriendo en un nodo nuevo **después** de
haber pagado la llamada al prompt; habilitar el Callback sin URL publica nada con 200.

### C6 · La pregunta 2, reconfirmada contra el export de HOY

No cambia nada de la §B, y las líneas son las de este export de las 11:55:

- **`Callback_Intercom` no sirve.** Su `url` viva, literal:
  `=https://api.intercom.io/hooks/workflows/trigger_step/q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015/{{ $('Webhook1').first().json.body.conversation_id }}`
  Lee `$('Webhook1')` (que en un turno de FAQ no ha corrido), lleva el app id del workspace **viejo**
  soldado, y **no es una hoja**: `{"main":[[{"node":"Leer_MotivoCierre"}]]}`.
- **`Mensaje_fallback` no sirve.** Su `jsCode` son **186 caracteres** con **cero** `$('Webhook1')`, y
  aun así sale a **dos** nodos: `{"main":[[{"node":"Avisar_Fallback1"},{"node":"Callback_Intercom"}]]}`,
  y los dos leen `$('Webhook1')` (`Avisar_Fallback1` **3** veces). Engancharle el FAQ importa la cola
  entera del intake.
- **El recuento de `$('Webhook1')` en los 60 nodos** (idéntico al de los 55, o sea que los cinco nodos
  del FAQ no han añadido ni una): `Avisar_Fallback1` 3 · `guardar_datos_cliente` 3 ·
  `Leer_Expediente_Para_Prompt` 2 · `Formatear_conversacion1`, `Callback_Intercom`, `Preparar_Prompt`,
  `leer_expediente`, `Leer_MotivoCierre`, `Cerrar_Conversacion` 1 cada uno.

### C7 · Confirmado que la reducción de la §A se aplicó de verdad

`Avisar_FAQ_Sin_Publicar` **no existe** en los 60 nodos. Los `executeWorkflow` siguen siendo **cinco**
y son los cinco de siempre, todos a `BJfExmwu1fI1aPpY`: `Avisar_Upsert_Rechazado`, `Avisar_Fallback1`
y `Avisar_Fecha_Invalida` con `waitForSubWorkflow:true` + `onError:continueErrorOutput`;
`Avisar_Persistencia_Fallida` y `Avisar_Multi_Match` con los dos por defecto. La señal del callback
roto es el `errorWorkflow`, como quedó decidido.

**Y sigue sin haber sticky del FAQ.** Los **7** son los de siempre (`DEBOUNCE`, `LLAMADA INTERCOM…`,
`WP-07`, `UPSERT EXPEDIENTE`, `GET EXPEDIENTE`, `Sub flujos…`, `David Beckham`). No es obligatorio,
pero **si se añade uno, la meta pasa de 62 a 63 nodos** y hay que decirlo antes, no después: el número
de nodos es la comprobación de que no se ha tocado nada más.

### C8 · La respuesta corta a las cuatro preguntas de la tanda

1. **Piezas nuevas de verdad: SIETE nodos, de los que quedan DOS por crear.** El número no baja de 7
   y las tres mediciones que lo sostienen siguen en pie (§A1). Lo que el usuario tiene en Intercom no
   quita ni un nodo: el reusable contiene el DC `461046`, cuya URL es el `path` de `Webhook1`, y ese
   camino acaba en el `AI Agent` de las **3** aristas `ai_tool` (medido otra vez hoy).
2. **`Mensaje_fallback` y `Callback_Intercom`: NO**, y las líneas están en C6.
3. **El corte necesita el `if`, y el total es SIETE.** El `if` ya está creado, es tv2.3 y su condición
   es la correcta.
4. **`docs/pasos-faq.sh`**: `bash -n` pasa, las **19** claves cuadran con las 19 ramas del `case`,
   `c <clave-mala>` sale con **exit 1** y un paso inexistente también. Lo que estaba desfasado era el
   **estado**: pedía crear cinco nodos que ya están. Corregido en esta pasada (C9).

### C9 · Lo tocado en el repo en esta pasada

- `docs/faq-diseno-2026-08-28.md` · esta sección. **Nada borrado.** Correcciones que deja escritas:
  `Callback_Intercom_FAQ` es **tv4.4** (el §3.5 y el §A dicen tv4.2), la §A6.1 queda **falsificada**
  (el nodo de LangSmith está en blanco, no duplicado), y la base de nodos es **60**, no 55.
- `docs/pasos-faq.sh` · **banda de ESTADO MEDIDO** en los pasos 2, 3, 4, 5 y 8; **los títulos de los
  pasos 2 a 8 dicen ahora si el nodo está CUMPLIDO, EXISTE EN BLANCO o NO EXISTE TODAVÍA**, que es lo
  que se lee de un vistazo en el índice; la referencia nueva (`d4ec794a`, 60 nodos, `60 + 2 = 62`) en
  la cabecera y en los pasos 0, 9 y `orden`; los dos toggles de `Send Body` en el paso 8; y el
  borrar-y-duplicar de LangSmith en el paso 5. **Las 19 claves no cambian**, `bash -n` pasa, y
  `c <clave-mala>` y un paso inexistente siguen saliendo con **exit 1**.

---

## 31/08 11:33 · SEGUNDA PASADA · el número se queda en SIETE, y el paso 0 pierde tres puntos

> **Esta sección manda sobre TODO lo de abajo, incluida la del 31/08 que le sigue, y no borra nada.**
> Medido hoy a las **11:33 Madrid** por MCP de solo lectura contra `beckham_bot`
> (`nhOwpiGxikeU5DLR`) y `beckham_alertas` (`BJfExmwu1fI1aPpY`), y contra los ficheros del repo, con
> la línea citada. **Cero escrituras**: ni un workflow tocado.

### A0 · EL BORRADOR SIN PUBLICAR YA NO EXISTE, y su contenido no era «otra mano»

Medido a las 11:33: **`versionId` == `activeVersionId` == `7f439285-e592-4291-8d33-b74df367d4a5`**,
`updatedAt 2026-08-31T08:27:13.087Z`, **55 nodos**, `active=true`.

Eso **cierra el punto 5 de la sección §D de abajo y el punto 0 del paso 0 de `docs/pasos-faq.sh`**, y
los cierra en los dos sentidos:

1. **Ya no difieren**, así que no hay borrador ajeno que se publique de propina al pulsar Save tras
   pegar `Preparar_Prompt_FAQ`. Entre la primera lectura de hoy (que los vio distintos) y esta,
   alguien pulsó Publish. **Se dice porque cambió dentro de la sesión, no se alisa.**
2. **Y lo que ese borrador llevaba dentro está identificado**: es el arreglo de **R9**, no una mano
   desconocida. La fórmula viva de `Leer_Expediente_Para_Prompt` es hoy, literal:
   `={{ ($('Webhook1').first().json.body.user_id || '').trim() ? "{UserId} = '" + $('Webhook1').first().json.body.user_id.replaceAll("'", "") + "'" : "FALSE()" }}`
   O sea que **R9 está cerrado y ACTIVO para el intake**, no solo guardado.

**La nueva referencia de «no lo he tocado» es `7f439285` con 55 nodos**, no `ef638a18`. Al acabar el
sidecar tienen que ser **62 nodos** y una versión nueva **movida solo por esos 7**.

**Y R9 sigue medio abierto, con la línea:** `Leer_MotivoCierre` conserva el agujero —
`={{ "{UserId} = '" + ($('Webhook1').first().json.body.user_id || '').replaceAll("'", "") + "'" }}`,
que con `user_id` vacío queda `{UserId} = ''`. No es del FAQ (el sidecar no lee Airtable), pero **la
§B.3 de abajo lo cita como motivo para no reutilizar `Callback_Intercom`**, y ese motivo sigue en pie.

### A1 · SIETE. Contado pieza a pieza, y ninguna se cae

Verificado por mi cuenta, no heredado. Las tres mediciones que sostienen el número:

| Medición de hoy | Resultado |
|---|---|
| aristas del `AI Agent` vivo | `ai_tool` = **3** (`guardar_datos_cliente`, `leer_expediente`, `analizar_documento`) + `ai_languageModel` = **1** (`David Beckham`) |
| `settings` de `beckham_bot` | `errorWorkflow: BJfExmwu1fI1aPpY` · `executionTimeout: 120` |
| `beckham_alertas` | dos entradas: `Fallo_De_Workflow` (errorTrigger) → `Slack_Fallo` · `Aviso_Desde_Beckham` (executeWorkflowTrigger, 6 claves) → `Slack_Aviso` |

| # | Nodo | Por qué NO se puede quitar ni reutilizar |
|---|---|---|
| 1 | `Webhook_FAQ` | la URL **es** el aislamiento. `Webhook1` (`path 22de1fbd-…`) va a `If2` y acaba en el agente de las 3 tools |
| 2 | `Preparar_Prompt_FAQ` | el único pegado. Sin él no hay `contexto`, ni enmascarado, ni corte |
| 3 | `¿Cortar_FAQ?` | un nodo `code` no elige rama. Es el único freno de coste del lado servidor |
| 4 | `Langsmith Prompt FAQ` | el vivo sale a `¿Prompt vacio?` → `AI Agent` (con tools). Enchufar el FAQ ahí **es** el fallo que el diseño evita |
| 5 | `AI AGENT FAQ` | `ai_tool` = 0. Es la defensa, y es un grafo, no un prompt |
| 6 | `Mensaje_Fallback_FAQ` | ver §A3 |
| 7 | `Callback_Intercom_FAQ` | ver §A2 |

**Y lo que el usuario ya tiene creado en Intercom no quita ni un nodo de n8n**, confirmado con la
medición: el reusable `n8n_BOT_mobility` contiene el DC `461046`, cuya URL es el `path` de
`Webhook1`, y `Webhook1` → `If2` → … → `AI Agent` (3 aristas `ai_tool`). Cualquier camino que
reutilice lo de Intercom **termina en el agente con tools**, que es exactamente lo que el criterio
prohíbe. El workflow de turnos 2..n tampoco quita nada y **añade R10**.

### A2 · `Mensaje_fallback` y `Callback_Intercom` del vivo: NO, y estas son las líneas

Medido nodo a nodo con las referencias a `$('Webhook1')` contadas sobre los 55:

| refs | nodo |
|:--:|---|
| 3 | `Avisar_Fallback1` · `guardar_datos_cliente` |
| 2 | `Leer_Expediente_Para_Prompt` |
| 1 | `Formatear_conversacion1` · `Callback_Intercom` · `Preparar_Prompt` · `leer_expediente` · `Leer_MotivoCierre` · `Cerrar_Conversacion` |

- **`Callback_Intercom` (`httpRequest` tv4.2, `retryOnFail: true`, `onError: null`, sin credencial).**
  Su URL viva, literal:
  `=https://api.intercom.io/hooks/workflows/trigger_step/q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015/{{ $('Webhook1').first().json.body.conversation_id }}`
  Lee `$('Webhook1')`, que en un turno de FAQ **no ha corrido** → el POST se va a `…/undefined`; el
  token está soldado al workspace **viejo**; y **no es una hoja**: sale a `Leer_MotivoCierre` →
  `¿Cerrar conversacion?` → `Cerrar_Conversacion`, o sea que enchufar el FAQ ahí puede **cerrarle el
  hilo al cliente a mitad del FAQ**.
- **`Mensaje_fallback` (`code`, `onError: null`).** Su código son cinco líneas con **cero**
  `$('Webhook1')`, y aun así no sirve: **sale a DOS nodos** —
  `{"main":[[{"node":"Avisar_Fallback1"},{"node":"Callback_Intercom"}]]}` — y los dos leen
  `$('Webhook1')`, así que engancharle el FAQ **importa la cola entera del intake**. Además es
  monolingüe y su texto promete un compañero que **nadie asigna** (0 `assignee`, 0 `team_id`, 0
  `snoozed` en los 55 nodos).

### A3 · La reducción de §F: el motivo escrito NO se sostiene. El bueno es otro, y tampoco se toma

La §F de abajo dice que quitar `Mensaje_Fallback_FAQ` (7 → 6) «depende de la forma del item que n8n
emite por una salida de error, que no está medida». **Eso es falso, y hay que dejarlo escrito para que
nadie gaste una medición en resolverlo.** La línea que lo decide está en el fichero:

```js
output: cortado ? TEXTOS[CORTE_TEXTO[motivoCorte]][idioma] : ''
```

Toda ruta que puede llegar a una salida de error (LangSmith o el agente) va con **`cortado === false`**,
o sea con **`output: ''`**. Así que de las dos formas posibles del item de error —el item de entrada
del nodo que falló, o solo `{error:…}`— **las dos dan `output` falsy**, y un
`($json.output || …)` muerde en las dos. No hay tercera forma: n8n no puede inventar un `output`
verdadero.

**El motivo de verdad para no tomarla es otro, y es de construcción:** metería el texto del fallback
**dentro del `jsonBody` que atraviesan TODAS las respuestas del FAQ**. Hoy un error de tecleo en el
texto del fallback solo puede romper el fallback; ahí romperia **todos los turnos**, y se teclea a
mano en una UI sin export, sin diff y sin grep (R7). Un nodo `code` de nueve líneas cuesta un pegado
y aísla el camino raro del camino caliente. **Se queda en SIETE.**

### A4 · `Avisar_FAQ_Sin_Publicar`: un argumento más para que no vuelva

La única ventaja que tenía sobre el `errorWorkflow` era llevar el `conversation_id`. Medido hoy:
`Slack_Aviso` construye el enlace como
`'*Conversación:* https://app.intercom.com/a/apps/q3bhdtoi/conversations/' + $json.conversation_id`.
Ese `q3bhdtoi` es el workspace **viejo**, y el FAQ vive en `s1hap599`: el enlace saldría **roto**.
O sea que su ventaja no era un dato, era un enlace que no abre. **Confirmado que se cae.**

### A5 · LO QUE SÍ BAJA · el paso 0 pierde tres puntos y el canvas dos pasos

**Paso 0 · de cinco puntos a dos.** Resueltos con las capturas del usuario de hoy (log 09:29) y con la
medición de §A0:

| Punto del paso 0 | Estado |
|---|---|
| el borrador sin publicar | **RESUELTO** · §A0: ya no existe, y era el arreglo de R9 |
| abrir el `END` de detrás de `Z. FAQ` | **RESUELTO** · `Z. FAQ` **no lleva `Close conversation`**: solo un Message («Aqui IRA AL FAQ») y un `+ Add step`. El `END` de la auditoría del 27/08 era el final de un path **vacío**. **R3 pierde su mitad grave**: quien pulsa «tengo preguntas» hoy se queda sin respuesta, **no sin hilo** |
| ¿hay rama de FAQ en la cadena inglesa? | **RESUELTO** · **sí, y se llama `AI. FAQ ENGLISH`** (no el path `AA` que suponía la auditoría). El hueco existe y se rellena igual que el español |
| `B1b` · el token del callback, ¿conector o paso? | **SIGUE ABIERTO.** No bloquea la etapa 1 |
| duplicar el Custom Bot → `BACKUP 20260831` | **SIGUE.** Es *la* reversibilidad |

**Canvas · de 10 pasos nuevos a 8 nuevos + 1 reescrito.** `Z1` **no es un paso nuevo en la cadena
española**: es reescribir el Message que ya está ahí («Aqui IRA AL FAQ») con el texto del disclaimer.
Quedan `Z2`-`Z5` como nuevos. En la cadena inglesa el path existe pero **no está medido qué lleva
dentro**, así que ahí se cuentan 4 nuevos + 1 por confirmar.

**Y eso resuelve solo la decisión abierta del §C** («meter el disclaimer de Z1 dentro del `Collect
data` de Z2 y ahorrar 2 pasos»): el paso Message **ya existe**, así que fundirlo no ahorra un paso,
**borra uno que ya está puesto**. `Z1` se queda, y con él el entregable 4 de WP-220 en su propia
pantalla. **No hay nada que preguntar.**

### A6 · Dos precisiones que ahorran clics, medidas en el nodo vivo

1. **El duplicado de LangSmith no necesita tocar ningún campo.** El nodo vivo trae ya, literal:
   `promptName: bot_mobility_prompt` · `promptTag: prod` · `inputParameters`: `contexto = {{ $json.contexto }}`
   y `current_date = {{ $now.setZone('Europe/Madrid').toFormat('dd/MM/yyyy') }}`. Y
   `Preparar_Prompt_FAQ` emite `contexto`, así que **la expresión vale tal cual**. El paso 5 pasa de
   «rellenar cuatro campos» a **«comprobar cuatro y cambiar uno»**: el `onError`, que en el vivo ya es
   `continueErrorOutput` pero apunta a `Prompt_De_Respaldo` y en el FAQ tiene que ir a
   `Mensaje_Fallback_FAQ` (§3.3: la copia local guarda el prompt **ya renderizado**, con el contexto de
   otra persona dentro).
2. **Los DOS conectores no son solo por el idioma.** Si `B1b` dice que el token identifica el **paso**,
   un conector con el token soldado en su Body **solo se puede insertar UNA vez en todo el canvas**:
   reusarlo en un segundo paso mandaría el token del primero. Corolario que conviene escribir:
   **un conector del FAQ = un paso del canvas**, en los dos escenarios de `B1b`.

### A7 · Lo tocado en el repo en esta pasada

- `docs/faq-diseno-2026-08-28.md` · esta sección. Nada borrado.
- `docs/pasos-faq.sh` · paso 0 reescrito (tres puntos menos), paso 5 («comprobar 4, cambiar 1»),
  paso 9 (la referencia nueva es `7f439285` + 55 nodos) y paso 11 (`Z1` es una reescritura, y el
  nombre real de la rama inglesa). **`bash -n` pasa y `c <clave-mala>` sale con `exit 1`** —
  comprobado, ya salía bien: las **19** claves siguen cuadrando.
- `docs/curl-faq.sh` · nombraba `Avisar_FAQ_Sin_Publicar`, que ya no existe. Los 33 avisos de Slack
  del modo seco siguen saliendo, pero por el `errorWorkflow` y con otro texto.
- `docs/nodo-preparar-prompt-faq-2026-08-28.js` · **solo la cabecera de comentarios**: decía «el
  segundo de los cinco del sidecar» y su diagrama se saltaba `¿Cortar_FAQ?`. Cero cambios de lógica,
  **114 verdes intactos**. El número del pegado pasa de **13.406 a 13.654**, y lo dice
  `bash docs/pasos-faq.sh 3`, que lo calcula del fichero en vez de llevarlo escrito.

---

## 31/08 · REVISIÓN CONTRA EL SISTEMA VIVO · siete nodos, y por qué siete

> **Esta sección manda sobre lo de abajo, y no borra nada de lo de abajo.** Todo lo que dice está
> medido hoy 31/08 por MCP contra `beckham_bot` (`nhOwpiGxikeU5DLR`) y `beckham_alertas`
> (`BJfExmwu1fI1aPpY`), con la línea citada. Donde contradice al diseño del 28/08, lo dice y dice
> con qué medición. **Cero escrituras**: esta revisión no ha tocado ningún workflow.

### A · EL NÚMERO REAL DE NODOS ES **SIETE**, y son siete porque dos correcciones se cancelan

El §3 decía «cinco nodos nuevos» y el §11 titulaba «5 nodos nuevos» **con siete nombres en la misma
línea**: se contradecía consigo mismo. El número bueno es 7, y se llega así:

**+1 · `¿Cortar_FAQ?` (`if` tv2.3) entra.** El §3.2 dice que el corte barato «no llama al modelo», y
en n8n **un nodo de código no elige por qué rama sale**. `Preparar_Prompt_FAQ` devuelve `_cortado` y
el `output` ya escrito; quien se salta el modelo es un `if` de una condición entre él y
`Langsmith Prompt FAQ`. Sin ese `if` el nodo sigue siendo correcto y el cliente sigue recibiendo
respuesta, pero **el único freno de coste del lado servidor (§7 R5) desaparece en silencio**.

**−1 · `Avisar_FAQ_Sin_Publicar` SE CAE, y esto es la reutilización que faltaba.** Medido:

```
beckham_bot.settings.errorWorkflow = "BJfExmwu1fI1aPpY"
beckham_alertas tiene DOS entradas:
  Fallo_De_Workflow   (n8n-nodes-base.errorTrigger)        -> Slack_Fallo
  Aviso_Desde_Beckham (n8n-nodes-base.executeWorkflowTrigger) -> Slack_Aviso
```

O sea que **un nodo que falla en rojo ya avisa a Slack**, con el nombre del nodo y la URL de la
ejecución dentro:

```
:red_circle: *FALLO — {{ $json.workflow.name }}*
*Nodo:* {{ $json.execution.lastNodeExecuted || "no informado" }}
*Mensaje:* {{ $json.execution.error.message }}
*Modo:* {{ $json.execution.mode }}
*Ejecución:* {{ $json.execution.url }}
```

Y eso **desmiente la frase del §3.5** («es la única señal que distingue "el modelo falló" de "el
modelo contestó y el cliente no lo vio"»). El sistema vivo ya las distingue, y **`Callback_Intercom`
lo demuestra**: va con `retryOnFail: true` y `onError: null`, o sea que **el intake ya resuelve «el
callback no publicó» con el `errorWorkflow`, no con un nodo de aviso.** Las dos señales, en el FAQ:

| Qué pasó | Qué se ve |
|---|---|
| el modelo o LangSmith fallan | corre `Mensaje_Fallback_FAQ`, el cliente recibe la disculpa, la ejecución sale **VERDE** y no hay Slack |
| el callback no publica | la ejecución sale **ROJA** y `Slack_Fallo` dice **`*Nodo:* Callback_Intercom_FAQ`** |

**El precio, declarado:** `Slack_Fallo` **no lleva `conversation_id`** (su plantilla solo usa
`workflow.name`, `execution.lastNodeExecuted`, `execution.error.message`, `execution.mode` y
`execution.url`), así que saber **qué hilo** se quedó mudo es un clic más en `execution.url`. Se paga:
un nodo menos que crear y cero contrato nuevo que mantener.

**Y en un caso el `errorWorkflow` es estrictamente mejor que el nodo de aviso:** `executionTimeout`
de `beckham_bot` es **120 s** (medido en `settings`) y un timeout **cancela la ejecución**, así que
las salidas de error de nodo no corren (R6). Un `Avisar_*` colgado de un `onError` **no se
ejecutaría nunca** en ese escenario; el `errorWorkflow` es el único camino que queda.

**Total: 7 nodos nuevos, 0 modificados. `beckham_bot` pasa de 55 a 62 nodos.**

| # | Nodo | Tipo | Por qué no se puede reutilizar nada |
|---|---|---|---|
| 1 | `Webhook_FAQ` | `webhook`, POST, path UUID | **la URL ES el aislamiento**; los 3 webhooks vivos van al intake o al escritor |
| 2 | `Preparar_Prompt_FAQ` | `code` | ya escrito, **13.654** car. (13.406 antes de la cabecera del 31/08), 114 verdes. El único pegado |
| 3 | `¿Cortar_FAQ?` | `if` **tv2.3** | un nodo de código no elige rama |
| 4 | `Langsmith Prompt FAQ` | `CUSTOM.langSmithPrompt` | **se DUPLICA en la UI** (es lo que arrastra la credencial) |
| 5 | `AI AGENT FAQ` | `lc.agent` tv3.1 | **0 aristas `ai_tool`**; el vivo tiene 3 |
| 6 | `Mensaje_Fallback_FAQ` | `code` | el vivo es monolingüe y no es una hoja — §B |
| 7 | `Callback_Intercom_FAQ` | `httpRequest` tv4.2, sin credencial | el vivo lleva el token del workspace VIEJO soldado — §B |

### B · NO se reutiliza `Mensaje_fallback` ni `Callback_Intercom` del vivo, y aquí están las líneas

**`Callback_Intercom` · tres motivos, cualquiera basta.** Su URL viva, literal:

```
=https://api.intercom.io/hooks/workflows/trigger_step/q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015/{{ $('Webhook1').first().json.body.conversation_id }}
```

1. **Lee `$('Webhook1')`, y en un turno de FAQ `Webhook1` no ha corrido.** El `conversation_id` sale
   vacío y el POST se va a `…/trigger_step/q3bhdtoi_…/undefined`.
2. **El token está soldado al workspace viejo** (`q3bhdtoi_`), y el canvas nuevo vive en `s1hap599`.
3. **Y no es una hoja.** `Callback_Intercom` → `Leer_MotivoCierre` → `¿Cerrar conversacion?` →
   `Cerrar_Conversacion`, y `Leer_MotivoCierre` es
   `filterByFormula = {{ "{UserId} = '" + ($('Webhook1').first().json.body.user_id || '')… }}`.
   Enchufar el FAQ ahí no es solo que no publique: **mete el turno del FAQ en la escalera del cierre
   y puede cerrarle el hilo al cliente a mitad del FAQ**, con un `user_id` vacío que hoy casa con dos
   filas reales (R9). Es R3 al revés y es peor.

**`Mensaje_fallback` · su código está limpio y AUN ASÍ no sirve.** Son cinco líneas y **cero
`$('Webhook1')`** (conteo por nodo: 0 para él, 1 para `Callback_Intercom`, 3 para `Avisar_Fallback1`).
Tres motivos:

1. **Tampoco es una hoja:** sale a `Avisar_Fallback1` **y** a `Callback_Intercom`, y **los dos leen
   `$('Webhook1')`** (`Avisar_Fallback1` tres veces: `conversation_id`, `user_id`,
   `ultimo_mensaje_usuario`). Engancharle el FAQ **importa la cola entera del intake**.
2. **Es monolingüe** (español), y el FAQ es bilingüe por construcción.
3. **Su texto promete lo que el FAQ no puede cumplir:** «Un compañero del equipo lo revisara y te
   escribira en breve» — y medido hoy en los 55 nodos **nadie asigna nada** (0 `assignee`, 0
   `team_id`, 0 `snoozed`; los 2 `admin_id` son el que cierra). `Mensaje_Fallback_FAQ` manda a
   `support@taxdown.es` con SLA de 24-48 h, que es lo que el prompt v14 promete en 18 sitios.

**Las referencias a `$('Webhook1')` en los 55 nodos, medidas hoy** — la lista de lo que NO se puede
tocar desde el sidecar:

| refs | nodo |
|:--:|---|
| 3 | `Avisar_Fallback1`, `guardar_datos_cliente` |
| 2 | `Leer_Expediente_Para_Prompt` |
| 1 | `Formatear_conversacion1`, `Callback_Intercom`, `Preparar_Prompt`, `leer_expediente`, `Leer_MotivoCierre`, `Cerrar_Conversacion` |

### C · Lo que el usuario ya tiene en Intercom no baja ninguna pieza — y el de turnos 2..n **añade un riesgo**

- **El reusable `n8n_BOT_mobility` (66246057): NO,** por dos motivos independientes. Contiene el DC
  `n8n_bot_mobility` (461046), cuya URL **es `Webhook1`**, y ese camino acaba en el `AI Agent` vivo,
  que tiene **exactamente 3 aristas `ai_tool`** (medido: `guardar_datos_cliente`, `leer_expediente`,
  `analizar_documento`). Y `Pass to <reusable>` no devuelve el control, así que **Z5 no se pintaría**
  y el cliente se queda sin salida.
- **El DC 461046 con un input más: NO.** Un input no cambia la URL, y **la URL es el aislamiento**.
  Además `If2` exige `body.conversation_part_id_debounce` no vacío y el body del FAQ no la manda a
  propósito, así que la llamada moriría en `If2` **sin caer en el fallback** (`Mensaje_fallback` lo
  alimenta la rama de error de `Formatear_conversacion1`, no ninguna rama de `If2`).
- **El Intercom Workflow de turnos 2..n: no reutiliza nada, y empeora R4. → `R10`.** Su trigger es
  «customer sends any message». Si el cliente **teclea** en Z5 en vez de pulsar (R4, medido: los
  botones no impiden el composer, y el `Collect data` acaba de entrenarle a escribir), ese mensaje
  puede disparar el workflow de turnos → DC 461046 → `Webhook1` → **el agente CON las tres tools**,
  **mientras el canvas del FAQ sigue esperando su callback**. El diseño decía que ese texto «queda en
  el hilo y lo leerá el intake después»; con el workflow de turnos ya creado, **puede llegarle YA**.
  **No está medido y es la medición más barata del lote:** durante `T-COMPOSER` (§8 P7), **contar
  ejecuciones de `Webhook1` en la ventana**. Si sale ≥ 1, R1 deja de ser diferido y hay que decidir
  **antes** de publicar el canvas.
- **Canvas: los 5 pasos por cadena son el mínimo, con una excepción opcional.** El disclaimer de Z1
  cabe dentro del texto del `Collect data` de Z2 y ahorra **2 pasos** (uno por cadena). **No lo tomo
  yo:** es el entregable 4 de WP-220 y meterlo en el prompt de un campo de entrada lo hace menos
  visible. Decisión del usuario (§10).
- **Data Connectors: siguen siendo 2.** Uno solo exigiría un chip `idioma`, y `idioma_bot` **no
  existe en `s1hap599`**. Y el `callback_token` es distinto por cadena de todos modos.

### D · Correcciones al texto de abajo, que quedan en pie

1. **El §2.2 lee el token del nodo equivocado.** Dice
   `$('Webhook_FAQ').first().json.body.callback_token`, y eso sale **`undefined`** cuando el Data
   Connector manda `form-urlencoded` con el JSON entero como **una sola clave** (medido en las
   ejecuciones `8052012` y `8052018`). Se lee de **`Preparar_Prompt_FAQ`**, que es quien lo parsea.
   Síntoma si se hace mal: **turno mudo con la ejecución en verde**. Ya corregido en
   `docs/pasos-faq.sh` p8.
2. **P0 ya está medido y salió BIEN.** Un `agent` v3.1 con **cero** aristas `ai_tool` **arranca**
   (workflow desechable `ZZZ_prueba_agente_sin_tools`, `oC8HjfvLlu4JrFbi`, ejecución `8151999`). Así
   que **no hay plan B de `Basic LLM Chain`** y el callback publica `$json.output` sin `Set` de por
   medio. El DESCONOCIDO del §3.4 y la P0 del §8 quedan **cerrados**.
3. **El `if` del corte va en `tv2.3`.** Los ocho `if` vivos de `beckham_bot` son todos 2.3.
4. **`David Beckham` alimentando dos agentes sigue SIN MEDIR.** Medido hoy: en los 55 nodos hay
   **exactamente 4 aristas no-`main`** (1 `ai_languageModel` + 3 `ai_tool`) y **ninguna es un
   sub-nodo con dos consumidores**, así que el workflow no aporta precedente. El modelo es
   `gpt-5.6-terra` (tv1.3): si hay que duplicarlo, la deriva son dos campos.
5. **`beckham_bot` tiene un BORRADOR SIN PUBLICAR desde hoy a las 10:27.**
   `versionId 7f439285-e592-4291-8d33-b74df367d4a5` ≠
   `activeVersionId ef638a18-5f3a-466c-97da-95782483c87b`. Lo que corre en producción sigue siendo
   `ef638a18` y **no hay daño**, pero **el día que se pegue `Preparar_Prompt_FAQ` y se pulse Save se
   publica también lo que haya en ese borrador**. Abrir el workflow y ver qué contiene **antes** de
   pegar nada. Va como punto 0 de `docs/pasos-faq.sh`.
6. **El §11 se contradecía consigo mismo** (titular «5 nodos», lista de siete nombres). El número
   bueno es **7** y está en §A.

### E · Lo que no cambia

El aislamiento por URL. El webhook propio con `path` UUID. Cero lecturas de Airtable y cero de
Intercom. `docs/nodo-preparar-prompt-faq-2026-08-28.js` **tal cual está** (**13.654** caracteres desde el
31/08 —solo cabecera de comentarios, cero lógica—, 114
verdes, sin una línea nueva). Los **2** Data Connectors. El paso **`Z4 · Reply`**, que sigue sin ser
opcional. Cero atributos nuevos, cero columnas, cero tools. Y `beckham_bot` **sin tocarse por MCP**.

### F · Una reducción más que existe y NO se toma hoy, para que no se descubra dos veces

`Mensaje_Fallback_FAQ` **se podría** eliminar (6 nodos en vez de 7): se le añade a
`Preparar_Prompt_FAQ` una clave `output_fallback` con la disculpa bilingüe, las dos ramas de error van
directas a `Callback_Intercom_FAQ`, y su `jsonBody` pasa a
`($json.output || $('Preparar_Prompt_FAQ').first().json.output_fallback).replace(…)`.
**No se hace, y el motivo es la regla de la casa:** eso depende de **la forma del item que n8n emite
por una salida de error**, que no está medida en ningún sitio del repo, y **si el `||` no muerde el
resultado es un turno mudo con la ejecución en verde** — el peor fallo del proyecto. La reducción de
§A se apoya en un `settings.errorWorkflow` que está medido hoy; esta se apoyaría en una suposición.
Si alguien la quiere, **la medición es un curl con `message` vacío y mirar el runData de la rama de
error**, y entonces sí.
---

## 0 · La decisión, en cinco líneas

El FAQ **no entra en la cadena del intake**. Es un **SIDECAR**: un webhook propio, cuatro nodos
propios y un agente propio con **cero aristas `ai_tool`**, dentro del mismo `beckham_bot`. No comparte
con el intake ni un nodo del camino: ni `If2`, ni `Wait2`, ni `Traer_Conversacion_intercom1`, ni
`Formatear_conversacion1`, ni `Leer_Expediente_Para_Prompt`, ni `Preparar_Prompt`, ni
`Leer_MotivoCierre`, ni `¿Cerrar conversacion?`. Comparte **el prompt** (`bot_mobility_prompt`, tag
`prod`, v14 — «el mismo prompt», decisión del 05/08) y **el modelo** (`David Beckham`).

**Etapa 1 es UN turno.** El multi-turno espera, y espera por una razón medida, no por prudencia.

---

## 1 · Por qué un sidecar y no ninguno de los tres diseños

Los tres candidatos hacían lo mismo en el fondo: meter el FAQ **dentro** del camino que hoy atiende
a los clientes, y separarlo con un `modo` que viaja en el `body` del webhook. De ahí salían, en
cadena, la mayoría de los fallos mortales:

| Lo que mató a los tres | Por qué el sidecar no lo tiene |
|---|---|
| **Enrutar el privilegio con una clave del `body` de un webhook público.** Un `curl` con `modo=solicitud` llega al agente con las tres tools. | El enrutado es **la URL**. Una petición al webhook del FAQ **no puede** alcanzar al agente del intake: no hay arista. No es una condición que evaluar, es un grafo. |
| **Fail-open / fail-closed, y en los dos casos se pierde algo.** Fail-open: un `modo` perdido convierte un turno de FAQ en intake y escribe. Fail-closed: un `modo` perdido manda el intake al agente sin tools y **el expediente deja de escribirse en silencio** — la forma exacta del 17/08. | **No hay polaridad que elegir.** El intake no cambia en absoluto: sigue entrando por `Webhook1` y sigue llegando al mismo agente. No existe el fallo «se perdió el modo». |
| **Fuga del expediente de otra persona.** `Leer_Expediente_Para_Prompt` monta `{UserId} = '<user_id>'`; con `user_id` vacío queda `{UserId} = ''`, que **casa con las dos filas que hoy tienen `UserId` en blanco** (`recpRqwHEubuhD7ft` ICIAR GARCIA GONZALEZ y `recfC5GaTt9M9YAWk`). El FAQ es la puerta anónima del embudo. | **El FAQ no lee Airtable.** Ni una consulta. No hay fuga que tapar con un `if`. |
| **El hilo se cierra a mitad del FAQ** si el cliente ya tenía `MotivoCierre` escrito. | **El FAQ no lee `MotivoCierre` y no llega nunca a `Cerrar_Conversacion`.** No hay guarda que clicar. |
| **PII y ZIP bombs por `Formatear_conversacion1`**: barre todas las parts del hilo, se traga lo que el cliente teclee en el composer, descarga adjuntos y descomprime ZIP con `inflateRawSync` sin tope. | **El FAQ no lo ejecuta.** La pregunta llega por `body.message` y nada más. |
| **Pegar 11 KB y 76 KB con Cmd+A sobre nodos vivos** de un workflow `active=true`, a tres días de la entrega, sin staging y sin rollback. | **Un solo pegado, y de un nodo NUEVO de ~4 KB.** Si sale mal, el intake ni se entera. |

Y hay un beneficio que no se ve hasta el final y que vale más que todos los anteriores: **como el
turno del FAQ no depende de Intercom para nada excepto para publicar la respuesta, se puede
reproducir entero con un `curl`.** Eso convierte el gate de las 33 preguntas doradas —hoy el
bloqueo de WP-220, WP-221 y WP-222— de «15 a 20 conversaciones en incógnito» a «33 peticiones y
leer 33 ejecuciones». Está desarrollado en §8.

### Lo que se rescata de cada candidato

- **Del diseño 2 · el aislamiento topológico.** El agente del FAQ no puede escribir porque el array
  `tools[]` que sale hacia el modelo va **vacío**, no porque el prompt se lo prohíba. El nodo
  `agent` v3.1 no expone ningún selector de tools (las tools son aristas del grafo), así que no hay
  allowlist que el modelo pueda desobedecer. **Se verifica contando aristas por MCP, nunca leyendo
  el prompt.** Es la única defensa de toda esta familia de diseños que no depende de que un LLM
  obedezca.
- **Del diseño 2 · el prompt no se duplica porque nunca estuvo en n8n.** WP-218 pedía un nodo `Set`
  con el `prompt_base` compartido: **eso habría sido el bug**. El texto vive en LangSmith; n8n solo
  lo pide. Aquí se duplica **el nodo que lo pide**, no el texto, y la deriva posible son dos
  escalares (`promptName`, `promptTag`) que se comprueban con un diff de dos campos.
- **Del diseño 1 · el `modo` del escritor como expresión fija.** Cuando llegue la etapa 2 y el
  canvas escriba de verdad, `guardar_datos_cliente` llevará `modo` por **expresión**, jamás por
  `$fromAI`, y el rechazo vivirá en `Validar y Normalizar`. El LLM no tiene canal para tocar ese
  parámetro. En etapa 1 no hace falta (el agente no tiene la tool), pero **la matriz se corrige hoy**
  — §3.5.
- **Del diseño 1 · el reloj correcto.** Los 15 s de timeout del Data Connector **no son la
  restricción**: `Webhook1` tiene `options: {}` y responde «Workflow got started.» en milisegundos.
  Quien espera es el `wait_for_callback`, y su límite es DESCONOCIDO. El presupuesto de latencia del
  proyecto está escrito contra el reloj equivocado.
- **Del diseño 3 · el tope estructural.** El límite de turnos no es un contador que alguien tiene
  que acordarse de poner: es **un botón que no existe**. En etapa 1 el tope es 1 y se cumple porque
  no hay ningún camino de vuelta al paso de la pregunta.
- **Del diseño 3 · el gate de orden de construcción.** Nada se cablea hasta que el paso anterior
  está medido. El orden está en §9.

---

## 2 · El flujo de etapa 1, de punta a punta

```
CANVAS (Intercom)                                  n8n · beckham_bot
─────────────────                                  ─────────────────
menú → «Tengo preguntas»
   ↓
Z1 · mensaje de entrada + DISCLAIMER
   ↓
Z2 · Collect data (Text): la pregunta
   ↓
Z3 · Data Connector `beckham_faq_es`  ──────────►  Webhook_FAQ  (POST /<uuid>, 200 inmediato)
     con wait_for_callback                              ↓
                                                   Preparar_Prompt_FAQ  (code, NUEVO, ~4 KB)
                                                        ↓
                                                   Langsmith Prompt FAQ  (bot_mobility_prompt · prod)
                                                        ↓                     └─[error]─┐
                                                   AI AGENT FAQ  (0 aristas ai_tool)     │
                                                        ↓         └─[error]──────────────┤
                                                        │                                ↓
                                                        │                     Mensaje_Fallback_FAQ
                                                        │                                ↓
Z4 · Reply  «{{mensajeUsuario}}»  ◄──────────────  Callback_Intercom_FAQ  ◄──────────────┘
   ↓                                                    └─[error]─► Avisar_FAQ_Sin_Publicar
Z5 · Reply buttons:
     [Quiero empezar mi solicitud] → F1 de su cadena
     [Hablar con una persona]      → path de humano
     [Volver al menú]              → menú
```

**Trece pasos en n8n para el intake; cinco para el FAQ.** El turno del FAQ no tiene `Wait2`, no
llama a la API de Intercom para traerse el hilo, no consulta Airtable y hace **una** llamada al
modelo. El único turno real medido del intake (ejecución `8129120`) son 24,2 s con tres llamadas al
modelo, una tool y 3 s de `Wait2`; del turno del FAQ se espera bastante menos, pero **no está
medido** y es lo primero que hay que cronometrar (§8, P2).

### 2.1 · El paso que nadie contó: `Z4 · Reply`

**El callback REANUDA el paso; NO publica el mensaje.** Está medido y escrito en
`plan/historico/sesion_2026-07-21.md:79-80`: «el texto viaja por el callback asíncrono… **Intercom
solo lee `data.mensajeUsuario`**» y «**Gap confirmado**: tras "Wait for webhook" no hay paso "Reply
to customer" que renderice `mensajeUsuario`. **Sin él, el callback no se ve**». Ese hueco se cerró
en su día **para el intake** añadiendo el paso Reply en el reusable `n8n_BOT_mobility`
(`plan/historico/Trabajo.md:538`: «Path A: DC → Wait webhook → **Reply** → END»).

El bot de hoy solo habla porque ese paso existe. **El FAQ es un `wait_for_callback` nuevo y necesita
el suyo.** Ninguno de los tres diseños lo incluía: los tres decían «la respuesta no es un paso del
canvas». Si se construye sin él, el cliente pregunta, espera, y lo siguiente que ve es la botonera —
sin respuesta — **con la ejecución de n8n en verde y `wait_for_callback_webhook_received` en la traza
de Intercom**. Los cinco pasos del runbook del turno mudo salen verdes mientras el cliente no ha
leído una palabra.

### 2.2 · El callback deja de estar soldado

`Callback_Intercom` (el del intake) lleva la URL **fija**:
`…/trigger_step/q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015/{conversation_id}`. El `q3bhdtoi` de
delante es el **app id del workspace viejo**, y el canvas nuevo (Custom Bot `«Mobility Bot (OnClick)» (68617004)`) vive en
**`s1hap599`**. Está escrito en `docs/intercom-construir-2026-08-27.md:119` con su consecuencia
literal: «**El agente no publica nada. El cliente escribe y no recibe respuesta**», y en la línea
140: «el app id ya sabemos que es otro».

**Ese es el fallo que mataba a los tres diseños**, y los tres lo daban por hecho o no lo nombraban.

**La solución no es cambiar la constante: es dejar de tener una constante.** El Data Connector manda
el token de su propio paso como una clave más del Body, y el nodo lo usa:

```
URL de Callback_Intercom_FAQ:
https://api.intercom.io/hooks/workflows/trigger_step/{{ $('Webhook_FAQ').first().json.body.callback_token }}/{{ $('Webhook_FAQ').first().json.body.conversation_id }}
```

Consecuencias, y son las tres buenas:

1. **El FAQ funciona en los dos workspaces a la vez.** Cada conector declara su token. No hay que
   elegir entre `q3bhdtoi` y `s1hap599`, ni sacrificar el entorno donde el mecanismo está medido.
2. **Desbloquea la Fase 0 entera**, no solo el FAQ: el día que el intake se migre a `s1hap599`, su
   `Callback_Intercom` se arregla con la misma línea y una clave más en el DC 461046, en lugar de
   con una edición irreversible que rompe el camino de vuelta.
3. Si el token viene vacío, `Preparar_Prompt_FAQ` corta el turno con un error explícito **antes** de
   gastar una llamada al modelo, en vez de generar una respuesta que no se puede publicar.

**DESCONOCIDO, y es el check que hay que hacer antes de nada** (`B1b`): si el `2af9679b-…` identifica
el **conector** o el **paso**. Etapa 1 necesita **dos conectores** en cualquiera de los dos casos
(uno por idioma, un paso cada uno). Lo que cambia es el precio de la etapa 2: si es por paso, tres
turnos × dos idiomas son **seis** conectores. Es una consulta de dos minutos en la pantalla del
conector y **sizea la etapa 2 entera**.

---

## 3 · Las piezas de n8n · lo que construyo yo

Todo va **a mano en la UI**. `beckham_bot` (`nhOwpiGxikeU5DLR`) no se toca con `update_workflow`:
reenvía los 55 nodos y **borra las credenciales**. Son **cinco nodos nuevos** y **cero
modificaciones** en los 48 nodos de lógica que ya existen.

### 3.1 · `Webhook_FAQ` — nodo nuevo

`n8n-nodes-base.webhook` tv2, **método POST**, **`responseMode` por defecto** (contesta «Workflow got
started.» en milisegundos, igual que `Webhook1`: el DC recibe su 200 y no consume sus 15 s).

**El `path` es un UUID generado, no un nombre legible.** `Webhook1` ya usa ese patrón
(`22de1fbd-bada-40b3-a120-41e519442139`) y los otros dos usan nombres (`beckham-upsert-expediente`,
`beckham-get-expediente`). Aquí manda el UUID: el webhook es público y sin auth, y `/beckham-faq`
es adivinable. **Esto es oscuridad, no seguridad** — la seguridad de verdad es WP-203 y sigue
pendiente (§7, R5).

`alwaysOutputData: true`. Sin `onError`.

**Body que recibe (6 claves):**

```json
{ "conversation_id": "215475581167582",
  "user_id":         "eu-west-1:d59e6f8e-…",
  "message":         "¿cuántos años dura el régimen?",
  "idioma":          "es",
  "callback_token":  "s1hap599_xxxxxxxx-xxxx-…",
  "punto":           "faq_entrada" }
```

`user_id` puede llegar **vacío y no pasa nada**: el FAQ es la puerta anónima del embudo y no lee
Airtable. `punto` no lo consume nadie en etapa 1; va porque es el contrato de WP-210 y cuesta una
línea. No se manda `conversationPartId`, ni `conversation_part_id_debounce`, ni `user_email`, ni
`First Message ID`: el FAQ no ejecuta `If2` ni `Formatear_conversacion1`, así que ninguna tendría
consumidor, y `user_email` es PII que no hace falta.

### 3.2 · `Preparar_Prompt_FAQ` — nodo `code` NUEVO, ~4 KB

Fuente: **`docs/nodo-preparar-prompt-faq-2026-08-28.js`**. Puerta:
**`docs/test-preparar-prompt-faq.js`**. Es el único pegado del diseño, y es de un nodo que no existe:
no puede romper nada al pegarse mal.

Qué hace, en orden:

1. **Valida y corta barato.** Si falta `conversation_id` o `callback_token`, o si `message` viene
   vacío, o si pasa de **2.000 caracteres**, devuelve un `output` fijo y **no llama al modelo**. Es
   el único freno de coste que existe hoy en el lado servidor (§7, R5).
2. **Enmascara la PII del texto libre.** Reutiliza **verbatim** el bloque `PATRONES_PII` del v4
   (`docs/nodo-preparar-prompt-DOS-AGENTES-2026-08-27.js:166-172`), que ya está escrito, razonado y
   probado: email, IBAN, NIF/NIE y teléfono, **en ese orden** (si el patrón de teléfono va antes se
   come trozos del IBAN y quedan restos reconocibles). Guarda **cuántos**, nunca **cuáles**.
3. **Monta `contexto`**, que es lo que la plantilla de LangSmith recibe y lo **último** que lee el
   modelo antes del turno del usuario (`{contexto}` es la línea 775 de las 774+1 del v14). Tres
   bloques y nada más:
   - `--- MODO DE ESTE TURNO: FAQ ---`, **el texto literal de `PROMPT_MODO.faq_regimen` del v4**
     (líneas 213-220). Una sola fuente para ese texto: si se cambia, se cambia ahí.
   - `Idioma de este turno: español|inglés. Ya está decidido: NO lo preguntes.` — necesario, y está
     explicado en §7, R2.
   - `Situacion: el cliente ha entrado por el FAQ y todavia no ha dado ningun dato.`
4. **Monta `prompt`** (el turno del usuario), enmarcado:
   `[MODO FAQ · SOLO INFORMACION] Pregunta del cliente: <texto enmascarado>`.
5. Devuelve `{ contexto, prompt, callback_token, conversation_id, idioma, _pii }`.

**Lo que NO hace, y cada ausencia es la solución a un fallo mortal del adversario:** no lee Airtable,
no lee Intercom, no lee `chat_history`, no toca `Preparar_Prompt`, no consulta ni escribe nada.

### 3.3 · `Langsmith Prompt FAQ` — nodo nuevo

`CUSTOM.langSmithPrompt` tv1. **`promptName: bot_mobility_prompt`, `promptTag: prod`** — exactamente
los mismos que el nodo del intake. `inputParameters`: `contexto = {{ $json.contexto }}` y
`current_date = {{ $now.setZone('Europe/Madrid').toFormat('dd/MM/yyyy') }}`.

**Se crea duplicando el nodo existente en la UI** (copiar/pegar dentro del mismo workflow), que es lo
que arrastra la credencial: el nodo de LangSmith es **CUSTOM** y no se recrea por MCP.

`onError: continueErrorOutput` → `Mensaje_Fallback_FAQ`. **A propósito no se enchufa al
`Prompt_De_Respaldo`**: la copia local de la Data Table guarda el prompt **ya renderizado con el
`contexto` del último turno**, así que servirla en un turno de FAQ significa contestar preguntas
fiscales con un prompt caducado que lleva dentro el contexto de otra persona. Si LangSmith se cae, el
FAQ **se disculpa y ofrece una persona**. Es la respuesta correcta para un canal que hace
afirmaciones normativas.

> **La deriva que queda, y cómo se mide.** Son dos escalares. `promptName` y `promptTag` idénticos
> entre los dos nodos, comprobado con un diff de dos campos por MCP (§8, P4). Es infinitamente menos
> que el nodo `Set` con una copia del texto que pedía WP-218 §5: **ese habría sido el MF5 que el
> propio WP quería evitar**, porque el `prompt_base` no vive en n8n.

### 3.4 · `AI AGENT FAQ` y `Mensaje_Fallback_FAQ` — nodos nuevos

**`AI AGENT FAQ`**: `@n8n/n8n-nodes-langchain.agent` **tv3.1**, copia exacta del vivo salvo tres
cosas.

| Campo | Valor | Por qué |
|---|---|---|
| `promptType` | `define` | igual que el vivo |
| `text` | `{{ $('Preparar_Prompt_FAQ').first().json.prompt }}` | el turno del usuario |
| `options.systemMessage` | `{{ $json.bot_mobility_prompt }}` | igual que el vivo |
| `maxIterations` | **2** | sin tools basta una llamada; el 2 es el tope, no el objetivo |
| **aristas `ai_tool`** | **CERO** | **la defensa** |
| aristas `ai_languageModel` | **1**, desde el mismo `David Beckham` | mismo modelo, sin deriva |
| `onError` | `continueErrorOutput` → `Mensaje_Fallback_FAQ` | el vivo no tiene ninguno |

**`Mensaje_Fallback_FAQ`**: `code`, cuatro líneas, devuelve un `output` fijo bilingüe según
`$('Preparar_Prompt_FAQ').first().json.idioma`. Recibe la rama de error de LangSmith y la del agente,
y sale a `Callback_Intercom_FAQ`. **El cliente siempre recibe algo.**

> **DESCONOCIDO que hay que medir ANTES de clicar nada: ¿arranca un `agent` v3.1 con cero aristas
> `ai_tool`?** No está medido en ningún sitio del repo y **toda la capa 1 depende de ese cero**. Es
> la prueba P0 de §8 y se hace en un workflow desechable, sin tocar `beckham_bot`. Si el nodo exige
> al menos una tool, el sustituto es `Basic LLM Chain`, **y entonces hay que saber que emite `text`,
> no `output`**: `Callback_Intercom_FAQ` publica `$json.output`, así que haría falta un `Set` que
> renombre. Con la prueba P0 esto cuesta cinco minutos; descubierto en producción, cuesta un turno
> mudo indistinguible de los otros cuatro.

`David Beckham` alimentando dos agentes: en n8n un sub-nodo admite varios consumidores, pero **no
está medido aquí**. Si no dejara, se duplica el nodo de modelo con configuración idéntica y la deriva
son dos campos (`model`, `options`), comprobables por MCP.

### 3.5 · `Callback_Intercom_FAQ`, la alerta, y las dos correcciones de repo

**`Callback_Intercom_FAQ`**: `httpRequest` tv4.2, POST a la URL de §2.2, `jsonBody =
{{ { "data": { "mensajeUsuario": $json.output.replace(/<[^>]+>/g, '') } } }}`, **sin credencial** (el
token va en la URL), `retryOnFail: true` y —a diferencia del vivo— **`onError: continueErrorOutput` →
`Avisar_FAQ_Sin_Publicar`**, que apunta al subworkflow de alertas de siempre
(`BJfExmwu1fI1aPpY`) con `tipo_alerta: faq_sin_publicar`. Es la única señal que distingue «el modelo
falló» de «el modelo contestó y el cliente no lo vio», que son los dos turnos mudos y desde fuera se
ven idénticos.

**Dos correcciones en `docs/`, gratis, que no son opcionales:**

1. **Arreglar la puerta del v4 y meterla en el corredor.** Reproducido hoy:
   `node docs/test-preparar-prompt-dos-agentes.js` muere en la comprobación **4 de 74** con
   `ReferenceError: sinComentarios is not defined` (línea 199) — y **sale con `exit 0`**, así que ni
   siquiera se ve como roja. Y `docs/pasos.sh` lista **catorce** pruebas y **esa no está**. Las 70
   que no se han ejecutado nunca incluyen la de `contexto_base` idéntico entre modos, que es *la*
   comprobación antideriva del §5 de WP-218. Se define el helper (una función que quita comentarios)
   y se añade a `pasos.sh`. **Una puerta roja que nadie corre es peor que no tener puerta.**
2. **Quitar el `''` de la matriz de la guarda.** `docs/nodo-guarda-punto-modo-2026-08-27.js:40` dice
   `faq_regimen: ['', 'faq_entrada', 'autodescarte_declarado']`, y ese `''` significa «llamada sin
   `punto`», que es **exactamente la forma de una llamada de `guardar_datos_cliente`**. En modo FAQ no
   hay ninguna escritura legítima sin `punto`: las dos que habrá declaran el suyo. Un carácter, y con
   él la guarda pasa de no ver nada a devolver **400 `modo_no_permitido`** con su aviso de Slack.
   Se corrige hoy aunque la guarda no entre en producción hasta la etapa 2.

**Nada de esto se pega en `Preparar_Prompt` ni en `Validar y Normalizar` en etapa 1.**

---

## 4 · Los pasos del canvas · lo que hace el usuario

### 4.0 · Antes de tocar el canvas, tres cosas

1. **Duplicar el Custom Bot** `«Mobility Bot (OnClick)» (68617004)` como `OnClick Mobility — BACKUP 20260828`. Se trabaja en
   **`s1hap599` = TaxDown PRODUCCIÓN** y el duplicado **es la única vuelta atrás que existe**: un
   canvas publicado mal no se revierte, se restaura a mano. Lo que hoy protege producción es el
   estado `Draft`, no un entorno aparte.
2. **Check `B1b`**: abrir el conector y anotar si el token del callback identifica el **conector** o
   el **paso**. Es lo que sizea la etapa 2 (§2.2).
3. **Abrir el `END` que hay detrás de `Z. FAQ`** y anotar qué lleva dentro **antes** de tocarlo. Los
   **11 `END`** del canvas están sin auditar y no se sabe cuál cierra de verdad. Si lleva
   `Close conversation`, hoy quien pulsa «tengo preguntas» no solo se queda sin respuesta: **se queda
   sin hilo**.

### 4.1 · Dos Data Connectors nuevos

`beckham_faq_es` y `beckham_faq_en`, idénticos salvo dos literales.

- **Método/URL:** `POST https://es.synapse.rentax.es/webhook/<el UUID de Webhook_FAQ>`
- **Modo:** con `wait_for_callback`.
- **Object mapping: NINGUNO.** La respuesta vuelve por el callback; mapear algo aquí pisaría
  atributos.
- **Data inputs (3, con `Let Fin collect`, Name a mano y en minúsculas):**

| Name | Required | Fuente |
|---|:--:|---|
| `conversation_id` | **ON** | chip Conversation ID |
| `user_id` | **OFF** | chip External ID |
| `pregunta` | **ON** | chip de la respuesta del `Collect data` |

- **Body** (los chips se insertan con «Add data», **nunca se teclean**: tecleado se pinta como pill y
  resuelve a `null`):

```
{ "conversation_id": «chip conversation_id»,
  "user_id":         «chip user_id»,
  "message":         «chip pregunta»,
  "idioma":          "es",
  "callback_token":  "<el token del paso, copiado de Intercom>",
  "punto":           "faq_entrada" }
```

**`conversation_id` Required ON y `user_id` Required OFF, y las dos son decisiones.** `Required` es
una **condición de ejecución**: si falta el valor, el conector no arranca, no hay callback y el
cliente se queda mirando el chat **sin ningún error visible**. `conversation_id` es el único campo
cuya ausencia DEBE parar el DC (sin él no hay dónde publicar). `user_id` en OFF porque un visitante
anónimo del Messenger no tiene External ID, **y el FAQ es la primera pantalla del embudo**: con
Required ON, el FAQ estaría muerto justo para su usuario típico — y para el método de prueba, que es
«Messenger en incógnito».

> **Por qué dos conectores y no uno con un chip `idioma_bot`.** Con el literal soldado en el Body no
> hay ningún paso `Set` que se pueda olvidar en una de las dos cadenas, y `idioma_bot` **todavía no
> existe en `s1hap599`**. El precio está declarado y es real: **dos Body que deben ser idénticos
> salvo dos valores, en el único sitio del sistema sin export, sin diff y sin grep.** Es la misma
> factura que T075 y que el script del correo inglés duplicado. Se paga porque el Body del FAQ son
> seis claves y no va a crecer en etapa 1, y porque el `callback_token` **es distinto por cadena de
> todos modos**, así que un conector único tampoco se salvaría.

### 4.2 · Los cinco pasos de `Z. FAQ`, por cadena

| # | Paso | Tipo | Contenido |
|---|---|---|---|
| **Z1** | Mensaje de entrada | Message | «Pregúntame lo que quieras sobre el régimen. **Te doy información general sobre la Ley Beckham; no es asesoramiento personalizado.** Escríbeme tu pregunta y te contesto en unos segundos.» |
| **Z2** | La pregunta | `Collect data` **Text** | «Escribe tu pregunta. Tardo unos segundos en contestarte.» |
| **Z3** | La llamada | Data Connector `beckham_faq_es` con `wait_for_callback` | Map action inputs: los tres chips |
| **Z4** | **La respuesta** | **Reply** | **`{{mensajeUsuario}}`** — §2.1. Sin este paso no se ve nada |
| **Z5** | La salida | Reply buttons | `[Quiero empezar mi solicitud]` · `[Hablar con una persona]` · `[Volver al menú]` |

**El disclaimer de Z1 es el entregable 4 de WP-220** («información general sobre el régimen y no
asesoramiento personalizado»), una decisión cerrada que **no aparecía en ninguno de los tres
diseños**. Va en la primera pantalla del único canal donde el bot hace afirmaciones normativas a
desconocidos.

**Ningún paso del FAQ cierra la conversación.** `Close conversation` sigue solo en `D` y `N`.

**Y todo esto DOS VECES**, ESP y ENG. **DESCONOCIDO si existe rama de FAQ en la cadena inglesa**: la
auditoría no leyó las salidas de `C. Introducción ENG` (paths `AA` y `Q`). Si no existe, son los
cinco pasos enteros otra vez. Método obligatorio: **punto por punto en las dos cadenas, ninguna
casilla marcada hasta que las dos lo estén.** La firma de este fallo es siempre la misma —funciona en
español, falla en inglés— y el proyecto ya la ha pagado dos veces.

### 4.3 · Lo que NO se crea

**Cero atributos nuevos.** Ni `faq_turnos_bot` (el tope de 1 es la topología), ni `idioma_bot` (el
literal va en el Body), ni `modo_bot` (T081: transporte B puro, no se persiste). Eso son **seis pasos
`Set` y dos atributos** que el plan presupuestaba y que aquí no hacen falta. `docs/intercom-construir-2026-08-27.md`
§2.3 avisa de que los `Set` desenrollados son donde más se disparan los clics.

**Cero escrituras desde el canvas.** No hay DC del escritor, no hay traza de lead y no hay
autodescarte en etapa 1 (§5).

---

## 5 · Lo que se descartó, y por qué

| Descartado | Por qué |
|---|---|
| **Enrutar el FAQ con `modo` en el `body`** (los tres diseños) | El webhook es público: un `curl` con `modo=solicitud` llegaría al agente con las tres tools. Y la polaridad no tiene solución buena: fail-open escribe hipotéticos, fail-closed apaga el intake en silencio. **Se sustituye por la URL.** |
| **Pegar `Preparar_Prompt` (11 KB) y `Validar y Normalizar` (76 KB)** en etapa 1 | Son la ruta caliente de todas las conversaciones de un workflow `active=true`, sin staging, con la puerta del primero rota y sin backup previo en el procedimiento. El 21/08 un pegado por trozos metió una línea de prosa dentro del código. **El sidecar no los necesita.** |
| **El DC del escritor en la entrada del FAQ** (`beckham_upsert_faq_entrada`) | Es **síncrono** (el webhook del escritor es `responseMode: responseNode`), corre contra los 15 s del DC detrás de `Validar y Normalizar` + un search + `Decidir_Status` + el upsert, y **el escritor rechaza `user_id` vacío** (`nodo-validar-normalizar-COMPLETO.js:190`), que es el caso normal de un visitante anónimo. Resultado: cero trazas y una alerta de Slack por visitante, en el canal donde vive `modo_ausente`. **Espera a la etapa 2 y a que se cierre U3.** |
| **El autodescarte declarado (WP-215) escribiendo** | `autodescarte_declarado` deriva `Descarte: 'Otro/Incompleto'` (`nodo-validar-normalizar-COMPLETO.js:219`) y `Decidir_Status` lo sube a **`14. Descartado`**, el último peldaño. Un cliente que **sí** cualifica y se asusta leyendo una respuesta queda descartado con un clic y cero datos — contra dos decisiones cerradas del proyecto («el salario NUNCA descarta» y «cerrar por autoevaluación sin datos quema un lead»). **Es una decisión del usuario, no mía**: §10. |
| **Quitar el `END` de detrás de `Z. FAQ`** | Antes hay que abrirlo. Puede que no haya que quitarlo, sino dejarlo sin `Close`. Se decide con el dato. |
| **Un nodo `Set` con el `prompt_base` compartido** (WP-218 §5) | El `prompt_base` **no vive en n8n**: sale de LangSmith. Un `Set` con una copia crearía exactamente la deriva (MF5) que el WP quería evitar. |
| **Enchufar el FAQ al `Prompt_De_Respaldo`** | La copia local guarda el prompt **ya renderizado**, con el `contexto` del último turno dentro. Servirla en el FAQ es contestar normativa con un prompt caducado que lleva datos de otra persona. |
| **`registrar_optout` y `escalar_humano` como tools en etapa 1** | No se pueden construir: `registrar_optout` toca `recordatorio_optout`, que **no está entre las 99 columnas** de Airtable (WP-225), y `escalar_humano` necesita la asignación real a `Ops_Mobility` (WP-223). El botón cubre la iniciativa del cliente desde el día uno y el v14 remite a `support@taxdown.es` en 18 sitios. **Cero es el número más fácil de verificar que existe.** |
| **`buscar_contexto_fiscal`** | Descartada el 07/08 (WP-220): conocimiento inline, sin corpus externo. El gate del 10/08 prohíbe que el prompt nombre una tool no cableada. |
| **`Pass to <reusable>` para el FAQ** | Handoff sin retorno (medido el 04/08). El FAQ vive dentro del mismo canvas. |
| **Relanzamiento por trigger para el salto a la solicitud** | Choca con el cooldown de 2 minutos justo cuando el usuario dice «sí, quiero empezar». |
| **Multi-turno en etapa 1** | §6. |

---

## 6 · Qué espera a la etapa 2, y por qué exactamente

**Etapa 1 es un turno. No por prudencia: porque el segundo turno se apoya en un mecanismo que no
está medido.** Lo único medido es **un** turno (ejecución `8129120`) y un multi-turno que llegó por
el **trigger de mensaje** (las 59 ejecuciones encadenadas de Iciar) — que es justo el camino que este
diseño no usa. El log del 04/08 dejó la incógnita escrita: «si el turno 2 llega y no hay ningún paso
esperando, ese callback puede no entregar nada». Desenrollar tres turnos sin medir eso es construir
doce pasos (3 × 2 cadenas × 2 pasos) sobre una suposición.

**La prueba que abre la etapa 2 es `T-TURNO2`** (§8, P8): un segundo `Collect data` + DC +
`wait_for_callback` + Reply en el mismo path, y comprobar que el segundo callback reanuda. Es media
hora y decide si el multi-turno cuesta doce pasos o hay que replantearlo.

Lo que entra en la etapa 2, en orden de dependencia:

1. **`T-TURNO2` y `B1b`.** Sin las dos no se presupuesta nada.
2. **El desenrollado a 3 turnos**, con el **tope estructural**: el bloque 3 no tiene botón «otra
   pregunta». El tope no es un branch ni un atributo: es un camino que no está cableado.
3. **El `chat_history`.** Sin `Traer_Conversacion_intercom1`, el turno 2 no recuerda el 1. La
   respuesta **no** es volver a llamar a Intercom (eso reabre el composer, los adjuntos y la carrera
   del debounce): es **WP-222**, `faq_resumen_bot` (≤400 car.) fijado al salir de cada turno.
4. **WP-222 completo**: corte de contexto y enmascarado, que es lo único que corta la contaminación
   FAQ → solicitud (§7, R1).
5. **La traza del lead** (`punto=faq_entrada`) y **el autodescarte**, con U3 cerrada y **con la
   matriz de la guarda ya corregida** (§3.5) y el `modo` del escritor por expresión fija.
6. **`escalar_humano` y `registrar_optout`**, cuando existan la columna y el team.
7. **WP-218 dentro de la cadena del intake**, si algún día hace falta un modo distinto de
   `solicitud` por `Webhook1`. Para eso están **ya escritos y con puerta**
   `docs/nodo-resolver-modo-2026-08-27.js` (86 verdes) y
   `docs/nodo-preparar-prompt-DOS-AGENTES-2026-08-27.js`. **Este diseño no los tira: los deja donde
   estaban** y arregla su puerta hoy. El sidecar no los necesita porque no enruta por el body.

---

## 7 · Riesgos vivos · lo que este diseño NO resuelve

**R1 · El FAQ contamina la solicitud, y el corte no está construido.** El FAQ y el intake comparten
el hilo de Intercom. `Formatear_conversacion1` reinyecta `chat_history` entero (no hay nodo de
Memory), así que la pregunta del FAQ la lee después el agente **de solicitud**, que sí tiene
`guardar_datos_cliente` con 35 parámetros por `$fromAI`. **El escenario:** «¿y si ganase 45.000?» →
«Quiero empezar» → el turno siguiente escribe `Salario=45000`. Nada aborta: es un dato válido y
falso, y de ahí salen el `.030` que un fiscal sube a la AEAT y el PDF que se le manda al cliente.
**Lo que sí acota hoy:** el enmascarado de PII del turno del FAQ (los `[NIF]`, `[IBAN]`, `[EMAIL]`,
`[TELEFONO]` no llegan al modelo), el tope de **un** turno, y el mensaje de Z1 que anuncia que los
datos se piden después. **Lo que NO:** el texto crudo sigue en el hilo de Intercom y el intake lo
leerá. **El arreglo tiene nombre y es WP-222**, y es la primera pieza de la etapa 2 por esto.

**R2 · El v14 le ordena al agente lo contrario de lo que el FAQ necesita.** Medido en
`docs/prompt-final-2026-08-26-v14.txt`: la **regla 7** (línea 764) dice «Tienes TRES herramientas y
hay que usarlas… `guardar_datos_cliente` **cada vez que llegue un dato nuevo**», y la línea 5 dice
«el idioma es **LO PRIMERO** que se pregunta (D0), antes de cualquier otro dato». Contra eso, el
bloque de modo son seis líneas sobre 66.020 caracteres. **El agente no puede escribir** (no tiene la
arista), así que el daño no es una fila falsa: es que **prometa** haber guardado, o que abra pidiendo
el idioma. **Mitigaciones que sí están:** el bloque de modo va en `contexto`, que es **lo último**
que lee el modelo; la línea de idioma es explícita y dice «ya está decidido, NO lo preguntes»; y el
turno viene enmarcado `[MODO FAQ · SOLO INFORMACION]`. **Es medible y es lo que mide la tanda de las
33** (§8, P1). **El arreglo de verdad es un prompt de FAQ propio**, y eso choca con la decisión del
05/08 («el mismo prompt, el mismo»): **si la tanda enseña que el bot pide datos, la decisión hay que
reabrirla con ese dato en la mano** — §10.

**R3 · El hilo zombi.** El FAQ no cierra (D10) y el Messenger **reanuda el hilo abierto** (R8). Un
cliente que lee la respuesta y no pulsa ningún botón deja un hilo abierto y sin asignar; cuando
vuelve, el Messenger le reanuda ese hilo, donde el bot ya no gobierna nada, y lo que escriba **no
dispara nada** (WP-10, y el distribuidor sigue pausado). Los pasos de reply buttons esperan
indefinidamente y **no hay rama de timeout en Intercom**. **Mitigación disponible: operativa, no
técnica** — una vista/filtro del Inbox para los hilos abiertos sin asignar de la rama FAQ, y
cerrarlos a mano. **No hay arreglo técnico dentro de las primitivas verificadas.**

**R4 · Los botones no impiden el composer** (medido) y el cliente acaba de ser entrenado a escribir
(el `Collect data`). Si escribe en Z5 en vez de pulsar, el paso sigue esperando. En el sidecar ese
texto **no llega al modelo del FAQ** (no se lee la conversación), pero **sí queda en el hilo** y lo
leerá el intake después — o sea que cae en R1. Mitigación de coste cero: Z5 termina con «Pulsa uno
de los botones». **Y `T-COMPOSER` (§8, P7) hay que medirlo**: DESCONOCIDO si en `s1hap599` hay un
distribuidor real que se lleve ese mensaje a la cola humana mientras el canvas espera su callback.

**R5 · Webhook público, sin auth y sin rate limit, y el FAQ es la puerta anónima.** Cada POST
dispara una llamada con **~66.020 caracteres de systemMessage** (del orden de 17-20k tokens),
facturada antes de que el callback exista o falle. El FAQ es rama **hermana** del menú, o sea antes
de F1-F3: lo paga todo el que entra, cualifique o no. **Frenos que sí hay:** `maxIterations: 2`, el
tope de 2.000 caracteres en la pregunta, el corte barato antes de llamar al modelo, y el path UUID
(oscuridad, no seguridad). **Freno que no hay:** ninguno por IP, por conversación o por ventana. **El
arreglo es WP-203** y sigue pendiente. Nota honesta: `Webhook1` ya está igual de expuesto **y ese sí
llega al agente con las tres tools**; el FAQ **no empeora** esa superficie, porque su webhook solo
puede alcanzar al agente sin tools.

**R6 · La expiración del `wait_for_callback` es DESCONOCIDA**, y es el reloj que manda. Los 15 s del
DC no muerden (`Webhook_FAQ` contesta en milisegundos), pero `executionTimeout` es **120 s** y un
timeout de ejecución **cancela la ejecución entera: las salidas de error de nodo NO corren**, así que
`Mensaje_Fallback_FAQ` no se ejecutaría y el cliente se quedaría mudo. El turno del FAQ debería estar
muy por debajo (una llamada al modelo, sin Wait2, sin Intercom, sin Airtable), pero **no está
medido**: P2 lo cronometra.

**R7 · La asimetría entre idiomas no la detecta nada.** Dos cadenas, dos conectores, dos Body, y el
MCP de Intercom **no expone Custom Bots**: no hay export, ni diff, ni grep. La única auditoría es un
humano leyendo dos cadenas en el navegador. Y las 33 preguntas doradas **están escritas en español**:
no hay juego equivalente en inglés, así que la mitad inglesa se entrega sin puerta de contenido.

**R8 · Las 33 preguntas doradas no están pasadas contra el prompt vivo.** Están escritas contra el
**v9** y hoy corre el **v14**; lo único registrado son **5 de 5** el 17/08. WP-220 no cierra sin esa
tanda, y WP-221 y WP-222 comparten el mismo gate. **Este diseño abarata la tanda de 15-20
conversaciones a 33 `curl`** (§8, P1), pero no la hace por sí solo.

**R9 · `Leer_Expediente_Para_Prompt` casa filas ajenas con `user_id` vacío — en el INTAKE.** No es un
riesgo del FAQ (que no lee Airtable), pero lo he medido hoy y no está apuntado en ningún sitio: el
filtro es `{UserId} = '<user_id>'` con `limit 2`, y con el valor vacío queda `{UserId} = ''`, que
**hoy casa con dos filas reales**. Si un cliente entra al intake sin External ID, el bloque «DATOS
QUE YA CONOCEMOS» de su systemMessage puede llevar el nombre, el NIF y el salario de otra persona.
**El arreglo es una línea** en la fórmula (que un `user_id` vacío no case con nada) y **no es parte
de este diseño**: se apunta para que exista.

---

## 8 · Matriz de verificación

**El principio: cada prueba dice UNA cosa, y se dice cuál.** Ninguna de estas pruebas «valida el
FAQ»; cada una sostiene una afirmación concreta.

| # | Prueba | Quién | Qué afirmación sostiene | Número que tiene que salir |
|---|---|---|---|---|
| **P0** | `agent` v3.1 con **cero** aristas `ai_tool` en un workflow desechable, ejecutado | yo (MCP, workflow nuevo, **no** `beckham_bot`) | **La capa 1 es construible.** Es el DESCONOCIDO del que depende todo | La ejecución sale `success` y emite `output`. Si no, plan B `Basic LLM Chain` + `Set output` |
| **P1** | **Las 33 preguntas doradas por `curl`** contra `Webhook_FAQ` con `modo` de FAQ, leyendo el `output` en cada ejecución de n8n | usuario o yo | **El contenido.** Cada pregunta cae en su etiqueta (24 RESPONDE · 5 NO CUBIERTO · 4 ESCALA) y **cero afirmaciones normativas fuera del prompt** | 33/33 en su etiqueta. **Una respuesta correcta con una afirmación inventada de propina SUSPENDE** |
| **P2** | **Una** conversación real desde el Messenger **en incógnito**, por cadena | usuario | **El transporte.** La respuesta **se ve** (o sea, el paso Reply está bien), el hilo NO se cierra, el idioma es el de la rama | Respuesta publicada. Y el cronómetro: `wait_for_callback_started` → `..._received` |
| **P3** | Los **10 prompts adversarios** por `curl` en modo FAQ | yo | **El aislamiento, desde fuera.** | **CERO** ejecuciones de `Webhook_Upsert_Expediente` en la ventana. Se cuentan ejecuciones, no lo que el bot conteste |
| **P4** | Conteo de aristas y diff por MCP | yo | **El aislamiento, desde dentro.** | `AI AGENT FAQ`: aristas `ai_tool` = **0**, `ai_languageModel` = **1**. Diff `promptName`/`promptTag` entre los dos nodos de LangSmith = **idéntico** |
| **P5** | **No-regresión del intake**: una conversación de intake completa | usuario | **Que no he roto lo que funciona.** | Se escribe la fila en Airtable, y `Preparar_Prompt` sigue con **10.945** caracteres y `Validar y Normalizar` con **76.156** |
| **P6** | `bash docs/pasos.sh test` | cualquiera | **Las puertas del repo.** | Verde, ahora con **la del v4 arreglada y dentro del corredor** más `test-preparar-prompt-faq.js` |
| **P7** | **T-COMPOSER** y **T-BOTONES** desde el Messenger | usuario | Qué hace Intercom con el texto tecleado en un paso de botones, y cuántos reply buttons caben de verdad | Se anota lo que pase. De P7 depende si el aviso textual basta |
| **P8** | **T-TURNO2**: un segundo `Collect data`+DC+callback+Reply en el mismo path | usuario | **Si el multi-turno desenrollado funciona.** Abre o cierra la etapa 2 | El segundo callback reanuda y el segundo Reply publica |

**El desbloqueo de P1, que es lo que más vale de este diseño.** El turno del FAQ **no lee Intercom ni
Airtable**: entra por `body.message` y sale por el callback. Así que un `curl` al webhook reproduce el
turno **byte a byte** — el mismo prompt de LangSmith, el mismo modelo, el mismo `contexto`. Lo único
que no ejercita es la publicación en Intercom, y eso lo cubre P2 con **una** conversación. Preview y
Simulation mockean y no valen; **un `curl` a producción no mockea nada**. La tanda pasa de 15-20
sesiones de incógnito a 33 peticiones que se pueden repetir cada vez que cambie el prompt.

> **Y el corolario que hay que decir en voz alta:** `exit 0` no dice que un script haya hecho su
> trabajo. La puerta del v4 lleva un día muriéndose en la comprobación 4 de 74 **y saliendo con
> `exit 0`**. Por eso P6 exige que esté **dentro** de `pasos.sh`, no que «se vea si se corre suelta».

---

## 9 · Orden de construcción · qué desatasca qué

**Nada se cablea hasta que el paso anterior está medido.** El orden importa porque dos de estos
pasos son irreversibles en producción.

| # | Paso | Bloquea a | Reversible |
|---|---|---|---|
| 1 | **P0** · agente sin tools en un workflow desechable | todo | sí |
| 2 | **Check B1b** · el token del callback, ¿conector o paso? | el sizing de la etapa 2 y los Body | sí (es mirar) |
| 3 | **Abrir el `END`** de detrás de `Z. FAQ` y anotar qué lleva | el paso 8 | sí (es mirar) |
| 4 | **Duplicar el Custom Bot** → `BACKUP 20260828` | el paso 8 | — es *la* reversibilidad |
| 5 | **Repo**: `nodo-preparar-prompt-faq` + su puerta, arreglar `sinComentarios`, meter las dos en `pasos.sh`, quitar el `''` de la matriz | el paso 6 | sí |
| 6 | **n8n**: los 5 nodos nuevos y sus aristas. **`beckham_bot` sigue sirviendo el intake sin enterarse** | los pasos 7 y 9 | sí (borrar 5 nodos) |
| 7 | **P4** (aristas) y **P1** (33 por `curl`) | el paso 8 | sí |
| 8 | **Canvas**: los dos DC y los cinco pasos de `Z. FAQ`, **las dos cadenas**, y publicar | el paso 9 | solo con el paso 4 |
| 9 | **P2**, **P5**, **P3**, **P7** | la etapa 2 | — |
| 10 | **P8 (T-TURNO2)** | la etapa 2 entera | sí |

**Lo que rompe producción si se hace mal:** solo el paso 8 (publicar el canvas). Los pasos 5, 6 y 7
son aditivos: cinco nodos nuevos que nadie invoca hasta que exista el conector del otro lado.

---

## 10 · Lo que decide el usuario, no yo

1. **El autodescarte (WP-215) marca `Descarte` → `Status 14. Descartado`.** Medido en
   `nodo-validar-normalizar-COMPLETO.js:219` y `nodo-decidir-status-2026-08-28.js:175`. Un cliente
   que sí cualifica y se asusta queda descartado con un clic y cero datos. Eso choca con «el salario
   NUNCA descarta» y con la razón por la que «no creo que cumplo» se sacó del menú. **¿El botón
   marca `Descarte`, o solo deja una señal blanda?** En etapa 1 no escribe nada, así que hay tiempo.
2. **Si P1 enseña que el bot pide datos o pregunta el idioma en modo FAQ** (R2), la decisión del
   05/08 —«el FAQ usa el mismo prompt que el agente, el mismo»— hay que reabrirla **con ese dato
   delante**. No antes.
3. **D10 dice «Cierra: NO» en todos los pasos del FAQ**, y eso produce el hilo zombi de R3. La
   alternativa es cerrar en el terminal real. **No la tomo yo**: D10 está escrita y el remedio tiene
   su propio precio (el cliente pierde el hilo y el trigger es un clic en la web).
4. **La rama inglesa**: si `C. Introducción ENG` no tiene su `Z. FAQ`, son cinco pasos más y hay que
   decidir si la etapa 1 sale con las dos cadenas o solo con la española. **Salir solo con una es
   exactamente la asimetría que el proyecto ya ha pagado dos veces** — pero salir con las dos sin
   juego de preguntas doradas en inglés es entregar media puerta sin candado.

---

## 11 · Resumen de piezas

**n8n · 5 nodos nuevos, 0 modificados** — `Webhook_FAQ` · `Preparar_Prompt_FAQ` ·
`Langsmith Prompt FAQ` · `AI AGENT FAQ` · `Mensaje_Fallback_FAQ` · `Callback_Intercom_FAQ` ·
`Avisar_FAQ_Sin_Publicar` (los dos últimos son el par de publicación y su alerta). Un solo pegado
Cmd+A, de ~4 KB, de un nodo que no existía.

**Repo · 3 ficheros nuevos y 3 correcciones** (`docs/` sigue **plana**) —
`nodo-preparar-prompt-faq-2026-08-28.js` · `test-preparar-prompt-faq.js` · `curl-faq.sh` (el runner
de las 33) · arreglar `sinComentarios` en `test-preparar-prompt-dos-agentes.js` · meter esa y la
nueva en `docs/pasos.sh` · quitar el `''` de la matriz de `nodo-guarda-punto-modo-2026-08-27.js`.

**Intercom · 2 conectores y 10 pasos** — `beckham_faq_es` y `beckham_faq_en` (6 claves de Body,
3 data inputs) · 5 pasos × 2 cadenas · **0 atributos nuevos** · 0 pasos `Set` · 0 cambios en el DC
461046 ni en el reusable.

**Cero** en Airtable. **Cero** en LangSmith (no hay v15). **Cero** tools nuevas. **Cero** columnas
nuevas, así que no se dispara la regla de los cinco sitios ni el sexto.
