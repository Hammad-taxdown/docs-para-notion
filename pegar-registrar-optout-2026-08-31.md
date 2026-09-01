# Cablear `BECKHAM_registrar_optout` · 31/08/2026

`N6aIm7mY4J7zvhmH` · inactivo · **16 nodos** · `versionId 395e7564-69c5-4c85-9f16-6d3b66acf814`
Puerta: `node docs/test-registrar-optout.js` → **96 verdes, 0 rojas**

---

## 0 · QUE SE HA CAMBIADO HOY, Y POR QUE

**El problema:** el workflow escribía en `recordatorio_optout`, **una columna que no existe** entre
las 99 de `Empleados`. Cada baja terminaba en un `422 UNKNOWN_FIELD_NAME` de Airtable envuelto en un
`persistencia_fallida` — un error ajeno, y encima gastando una llamada de escritura para averiguar
algo que ya sabíamos.

**La decisión: OPCIÓN B.** No se reusa ninguna columna viva, porque **ninguna encaja**, y el
workflow ahora **no llama a la API de escritura**: responde

```
{ ok:false, resultado:"columna_no_existe",
  detalle:"crear recordatorio_optout como casilla en Empleados",
  record_id:"rec…", n_filas:1, corr_id:"…", campo:"recordatorio_optout" }
```

El `record_id` va dentro **a propósito**: es el dato que hace falta para marcar la baja a mano
mientras la columna no exista.

### Por qué ninguna de las 99 columnas sirve (medido hoy por MCP)

**Quién consume el dato manda sobre todo lo demás:** `WP-225` define la vista `Leads potenciales`
como `lead_potencial=true AND Descarte vacío AND recordatorio_optout=false`. El consumidor es un
**filtro de vista**, así que el campo tiene que ser **filtrable y booleano**. Eso descarta de entrada
cualquier columna de texto libre.

- **Los 12 checkbox de la tabla están los 12 ocupados** (no 14: en el briefing
  `EnviarModelosPresentados` estaba contado **tres** veces — dos por su nombre y una mas por su
  `fld6tzcu8Ek4omMCF`, que es el mismo campo). Y **cuatro de ellos disparan una automatización DESPLEGADA que
  le manda un correo al cliente** al ponerse en `true`:
  `EnviarBorradores` → «1. Envio borradores 030 y 149» · `CrearCheckout` → «Crear Check out» ·
  `Enviarformulario030149` → «3. Envio email formularios» · `EnviarModelosPresentados` →
  «3. Envio documentos presentados».
  Registrar «no me contactéis» marcando una casilla que **manda un correo** es el peor resultado
  posible de este WP.
- `Descarte` — **aparece en el MISMO filtro de WP-225 como una condición DISTINTA**: usarlo para la
  baja fusiona dos condiciones independientes y la vista deja de poder escribirse. Y `Decidir_Status`
  sube cualquier `Descarte` a **`14. Descartado`** (comprobado contra la escalera VIVA, que tiene 14
  peldaños), el último: la baja quedaría como descarte fiscal para siempre.
- `MotivoCierre` — es el disparador de `¿Cerrar conversacion?` (un `notEmpty`): escribirlo **cierra
  el hilo de Intercom**.
- `ResumenBot` — cada envío SUSTITUYE al anterior y es la base del informe que se manda al cliente.
- `Comentarios adicionales` (`fldZWvGd0cQZNt14V`) — la única casilla de texto sin dueño y sin
  descripción, y **no está en las 57 líneas del mapeo del Upser** (comprobado). Pero es texto libre:
  **no se puede filtrar por `=false`**, y un PATCH sustituye la celda, así que borraría lo que un
  fiscal hubiera escrito ahí.

### Y lo que hace BARATO crear la columna

De las **nueve** automatizaciones de la base, la única con disparador de tabla entera es
«1. Envio mensaje agendar llamada», y es **`recordCreated`** — **un PATCH no crea fila**. Las demás
miran columnas concretas por su `fld` id. Una columna **nueva** no está en la condición de ningún
disparador: **crearla, y escribir solo ella, no dispara nada.**

---

## 1 · PASO 1 · CREAR LA COLUMNA EN AIRTABLE · A MANO, Y COMO **CASILLA**

Esto **no** se puede hacer desde bash (no hay `N8N_API_KEY` ni token de Airtable en el entorno).

**Clic a clic:**
1. Airtable → base **`Mobility_2026`** (`app5K8OnSObqwWweS`) → tabla **`Empleados`**
   (`tblTWCWu5nQXNOMR1`).
2. Al final de las columnas, `+` → **nombre exacto** (sin mayúsculas, con guión bajo):

```sh
printf 'recordatorio_optout' | pbcopy
```

3. **Tipo de campo: `Checkbox` / `Casilla`.** Es un **desplegable de tipos**, no un texto.
   **No vale ningún otro tipo:** `Respuesta OK` exige ver `recordatorio_optout === true` en la
   respuesta del PATCH, así que una columna de texto o un `singleSelect` devolverían algo distinto de
   `true` y el workflow contestaría `persistencia_fallida`. Es a propósito.
4. Descripción sugerida (campo de texto, opcional pero recomendable):

```sh
printf 'El cliente ha pedido que NO se le contacte mas. La marca el subworkflow BECKHAM_registrar_optout (N6aIm7mY4J7zvhmH) con un PATCH de UN SOLO campo, desde el modo FAQ del bot. NO la escribe guardar_datos_cliente y NO esta en el mapeo del nodo Airtable Upser Expediente: no la anadas ahi. La consume el filtro de la vista Leads potenciales (WP-225): lead_potencial=true AND Descarte vacio AND recordatorio_optout=false.' | pbcopy
```

### ⚠️ EL AVISO DE LOS CINCO SITIOS — Y AQUÍ **NO APLICAN**

La regla de la casa es que un campo nuevo son **cinco sitios**: la tool, el validador, el mapeo del
Upser, el prompt y **el lector**. **Esta columna no entra en ninguno de los cinco**, y es importante
no «completarlos» por costumbre: los cinco sitios son el camino de `guardar_datos_cliente`, y esta
baja **no va por ahí** — la escribe este subworkflow con su propio PATCH, que es justo lo que la hace
segura.

### ⚠️ Y EL SEXTO SITIO: **NO SE REFRESCA EL SCHEMA DEL UPSER**

**No abras `Airtable Upser Expediente` a refrescar la lista de campos.** Ese refresco es el que puede
**reactivar los campos que están quitados a propósito** — hoy **42**: las 57 líneas mapeadas de
`docs/upser-campos-mapeados-2026-08-26.txt` frente a los **99** campos de la tabla. (`CLAUDE.md` dice
«36 fuera», que era cierto cuando la tabla tenía 93 columnas; hay que actualizarlo.) Y **un campo
reactivado se escribe VACÍO en cada llamada del bot**: le borraría al fiscal sus comentarios, o los
ficheros ya generados. El mapeo **se queda en 57 líneas**.

El sexto sitio solo hace falta cuando el **bot** tiene que escribir la columna con el nodo de
Airtable. Aquí no: el PATCH va por HTTP con un body de un solo campo, y **por eso no necesita que la
columna exista en ningún caché**.

**Verificación del paso 1** — la hago yo por MCP y se dice: `get_table_schema` sobre
`tblTWCWu5nQXNOMR1` tiene que pasar de **99 a 100 campos**, con el nuevo de tipo `checkbox`.

---

## 2 · PASO 2 · ENCENDER EL INTERRUPTOR EN n8n

`Resolver la fila` lleva **una sola constante** que decide todo:

```js
const COLUMNA_EXISTE = false;   // 31/08/2026 · MEDIDO: no esta entre las 99 columnas
```

**No se edita esa línea a mano.** La regla de la casa es que un nodo de código se entrega **entero,
para pegar con Cmd+A** — el 21/08 un parche por trozos acabó con una línea de prosa dentro del código
y un `SyntaxError`. El comando deja el nodo **completo y ya con el interruptor en `true`** en el
portapapeles:

```sh
cd /Users/hammad/Documents/Taxdown/Proyecto_Mobility_Beckham/Beckham__v0.12 && node docs/extraer-nodo-optout.js 'Resolver la fila' true | pbcopy
```

**Clic a clic:**
1. n8n → workflow **`BECKHAM_registrar_optout`** → nodo **`Resolver la fila`**.
2. Clic en el cuadro de código (es un **editor de texto**, no un desplegable) → **Cmd+A** → **Cmd+V**.
3. Guardar el workflow.

**Verificación del paso 2** — el contador de caracteres del editor de n8n tiene que decir
**3.216 caracteres**. Son los mismos con el interruptor en `false` y en `true` (el reemplazo conserva
la longitud a propósito), así que **el número no distingue los dos estados**: lo que distingue es la
línea `const COLUMNA_EXISTE = true;`, que se lee a simple vista en la línea 12.

Y desde bash, para ver qué se va a pegar antes de pegarlo:

```sh
cd /Users/hammad/Documents/Taxdown/Proyecto_Mobility_Beckham/Beckham__v0.12 && node docs/extraer-nodo-optout.js 'Resolver la fila' true | sed -n '10,14p'
```

---

## 3 · PASO 3 · LAS DOS CREDENCIALES · A MANO, Y NO HAY OTRA FORMA

El MCP devuelve `credentials` **vacío en todos los nodos**, también en los que funcionan, y al
desplegar avisó literalmente: *«HTTP Request nodes (PATCH del recordatorio_optout) were skipped during
credential auto-assignment»*.

**Clic a clic:**
1. Nodo **`Buscar la fila por UserId`** → campo **`Credential to connect with`** (**desplegable**) →
   **`Airtable Mobility_2026`**.
2. Nodo **`PATCH del recordatorio_optout`** → mismo desplegable → **`Airtable Mobility_2026`**
   (va como `predefinedCredentialType` + `airtableTokenApi`, el patrón de la casa).

**Verificación del paso 3:** **no se puede comprobar por MCP ni por bash.** La única forma es
**ejecutar el workflow**, y esto tampoco se puede lanzar desde aquí: el MCP contesta *«Only workflows
with the following trigger nodes can be executed: Schedule, Webhook, Form, Chat, Manual»* y la
entrada es un `executeWorkflowTrigger`. Se ejecuta a mano desde la UI con `user_id` de una fila real
y se mira que salga `sin_fila` / `columna_no_existe` en vez de `lectura_fallida`.

---

## 4 · PASO 4 · CABLEARLO COMO TOOL · **HOY ESTÁ BLOQUEADO, Y HAY QUE SABERLO**

**Medido hoy en `beckham_bot` (60 nodos, `activeVersionId d4ec794a-…`): el agente del FAQ TODAVÍA NO
EXISTE.** La rama del FAQ ya está cableada y termina aquí:

```
Webhook_FAQ → Preparar_Prompt_FAQ → ¿Cortar_FAQ? → Callback_Intercom_FAQ
                                                  → Langsmith Prompt FAQ   ← y se acaba
```

Hay **un solo nodo `AI Agent`** en todo el workflow, con **exactamente tres aristas `ai_tool`**
(`guardar_datos_cliente`, `leer_expediente`, `analizar_documento`) y su modelo `David Beckham`. Ése es
el agente del **intake**.

### ⛔ NO cuelgues `registrar_optout` de ese `AI Agent`

Sería darle al agente del intake una **cuarta tool que no le corresponde**. El PRD es explícito:
`registrar_optout` es la **única escritura permitida en modo FAQ**. Colgarla del agente del intake la
pone al alcance de la conversación de captación, que ya escribe por `guardar_datos_cliente`.

**El orden correcto es:** primero existe el agente del FAQ (WP-218), y **después** se le cuelga esta
tool. Mientras no exista, este paso **no se puede dar**, y no es un olvido.

Cuando exista, el cableado es un nodo **`toolWorkflow`**:
1. n8n → `beckham_bot` → botón `+` de la entrada **`Tool`** del **agente del FAQ**.
2. Tipo **`Call n8n Sub-Workflow Tool`**.
3. Campo **`Name`** (texto):

```sh
printf 'registrar_optout' | pbcopy
```

4. Campo **`Description`** (texto). Es lo que lee el modelo para decidir si la llama:

```sh
printf 'Registra que el cliente NO quiere que se le vuelva a contactar (baja de comunicaciones). Llamala SOLO si el cliente lo pide de forma explicita. No sirve para nada mas: no guarda datos del expediente ni cambia el Status. Devuelve ok:true solo si la baja ha quedado escrita.' | pbcopy
```

5. Campo **`Workflow`** (**desplegable** «From list») → **`BECKHAM_registrar_optout`**
   (`N6aIm7mY4J7zvhmH`).
6. **`Workflow Inputs`**: los dos que declara la entrada, `user_id` y `corr_id`.

**Y OJO CON EL `user_id` DEL FAQ, que es el punto delicado.** `Preparar_Prompt_FAQ` tiene escrito en
su propio código que el `user_id` **puede venir VACÍO y es normal** (un visitante anónimo preguntando
algo). Cuando eso pase, este subworkflow contesta **`schema_error` sin consultar Airtable**, y **está
bien así**: no hay expediente que dar de baja. Lo que **no** puede pasar es que se «arregle»
relajando la guarda — ver el aviso de abajo.

---

## 5 · ⚠️ LA GUARDA DEL `user_id` NO SE TOCA NUNCA

Es la única pieza que esta revisión ha dejado **byte a byte** como estaba, y la puerta la defiende con
**13 entradas hostiles**.

`filterByFormula: {UserId} = ""` **no devuelve «nada»**: **casa con las filas que tienen el `UserId` en
blanco**, y hoy hay **dos con PII real** dentro. Un `user_id` vacío no fallaría — encontraría el
expediente de otra persona y le marcaría la baja. Por eso:

- la guarda va **antes** de tocar Airtable, y **la fórmula se monta dentro del nodo de código**, no en
  el nodo de búsqueda;
- la whitelist `^[A-Za-z0-9:_.@-]{8,200}$` **deja fuera la comilla doble y la barra invertida**: sin
  ellas no se puede cerrar la cadena de la fórmula y colar un `OR()`;
- y **segunda red**: la búsqueda va con `limit: 2`, así que una fórmula vacía (que en Airtable
  significa TODAS las filas) devolvería dos y el resolvedor la manda a `multi_match`. Fail-closed por
  construcción.

**Un dato que la puerta deja escrito:** un `user_id` **numérico** (`12345678`) sí pasa la forma —
`txt()` lo convierte a sus dígitos. **No es la fuga**: monta `{UserId} = "12345678"`, que no casa con
ninguna fila real (los `UserId` son `eu-west-1:<uuid>`), así que muere abajo en `sin_fila` sin tocar
el expediente de nadie. Fallo seguro, no fuga.

---

## 6 · EL ORDEN, Y QUÉ DESATASCA QUÉ

| # | Paso | Rompe producción si se hace mal | Desatasca |
|---|---|---|---|
| 1 | Crear `recordatorio_optout` como **casilla** | **No.** Una columna nueva no está en ningún disparador | el paso 2 y la vista de WP-225 |
| 2 | Pegar `Resolver la fila` con el interruptor en `true` | No (workflow inactivo y sin cablear) | que el PATCH se haga de verdad |
| 3 | Las dos credenciales de Airtable | No | que se pueda ejecutar y comprobar |
| 4 | Cablear la tool al **agente del FAQ** | **SÍ, si se cuelga del `AI Agent` del intake** | la baja desde la conversación |

**Lo cosmético, y que no bloquea nada:** el motor de layout del SDK **volvió a apilar las cuatro notas
en el mismo punto** (`[784,544]`, las cuatro). Hay que arrastrarlas para poder leerlas. Es el mismo
comportamiento que se apuntó el 31/08 con los dos workflows nuevos.

**Y mientras el paso 1 no se dé, esto no está roto:** contesta `columna_no_existe` con el `record_id`
dentro, no llama a la API de escritura, y no deja un 422 ajeno en el log.

---

## 7 · LA PUERTA

```sh
cd /Users/hammad/Documents/Taxdown/Proyecto_Mobility_Beckham/Beckham__v0.12 && node docs/test-registrar-optout.js
```

→ **96 verdes, 0 rojas** · `PUERTA EN VERDE`

Extrae los cuatro nodos de código del SDK **por anclas de texto** y **aborta si un ancla desaparece**,
en vez de dar verdes sobre una cadena vacía. Cubre: la guarda con 13 entradas hostiles, las cuatro
salidas del resolvedor, **que hoy el PATCH es inalcanzable** (ningún caso produce `_estado === 'ok'`),
que **encendiendo el interruptor sí es alcanzable**, que el body del PATCH toca **una sola columna**,
y que ningún nodo de código usa `$('X').item`.

Ya está cableada en el runner: `bash docs/pasos.sh test` pasa **las VEINTE puertas**.

El enum de `resultado`, los **ocho**: `optout_registrado` · `columna_no_existe` · `sin_fila` ·
`multi_match` · `lectura_fallida` · `persistencia_fallida` · `schema_error` ·
`user_id_forma_invalida`.
