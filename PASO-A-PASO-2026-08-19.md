# Paso a paso · TODOS los cambios del 19/08/2026

**13 pasos.** Airtable (2 de los 4) ya está hecho y verificado. Cada paso dice **workflow · nodo ·
casilla · valor**.

## Ya hecho y comprobado por MCP (no supuesto)

| Qué | Comprobación |
|---|---|
| `SenalesComplejidad` · opción renombrada | `seltUAhJWITkOhsE0` = **«Salario por debajo de 50.000»**. Conserva el `id`: las filas que la tuvieran siguen apuntando a ella |
| Automatización **3b** | `selc7DwpMePvALjtj` (el 3) fuera de **las dos** ramas · `seloL0ipNAsEQ4i80` (el 4) sigue · `deployed`, sin borrador pendiente |

## Las seis puertas · todas en verde ahora mismo

```bash
cd /Users/hammad/Documents/Taxdown/Proyecto_Mobility_Beckham/Beckham__v0.12
node docs/test-decidir-status.js           # 15 verdes, 0 rojas
node docs/test-validador-2026-08-19.js     # 31 verdes, 0 rojas
node docs/test-prompt-v10.js               # 35 verdes, 0 rojas
node docs/test-lector-expediente.js        # 14 verdes, 0 rojas
bash docs/montar-nodo-030.sh               # exit 0
bash docs/montar-nodo-informe.sh           # exit 0
```

**95 comprobaciones, 0 rojas.** Si alguna sale con `exit 1`, para y dímelo.

---

# BLOQUE A · workflow `beckham_informe_mobility`

`Us5sFgXD9qVxJvxO` · `https://es.synapse.rentax.es/workflow/Us5sFgXD9qVxJvxO`

## Paso 1 · nodo `Buscar filas pendientes` · casilla **Filter By Formula**

Es el segundo nodo, detrás de `Cada 15 minutos`. Airtable `typeVersion 2.2`,
**Operation = Search**. La casilla está en el panel principal, **no** dentro de *Options*.

**Lo que tiene que decir ahora** (si dice otra cosa, para y dímelo):
```
AND({Status}="4. Informe enviado", OR({RegenerarInforme}=1, {InformePdf}=BLANK()))
```

Clic dentro → `Cmd+A` → `Delete` → pegar:
```
AND(OR({Status}="3. Pte hacer informe",{Status}="4. Informe enviado"), OR({RegenerarInforme}=1, {InformePdf}=BLANK()))
```
```bash
printf '%s' 'AND(OR({Status}="3. Pte hacer informe",{Status}="4. Informe enviado"), OR({RegenerarInforme}=1, {InformePdf}=BLANK()))' | pbcopy
```
**Sin `=` delante, sin salto de línea al final.** Si aparece un `=` gris a la izquierda de la
casilla, n8n lo ha tomado como expresión: quítalo.

## Paso 2 · nodo `Marcar InformeListo` · **casilla nueva `Status`**

Último nodo de la rama buena, detrás de `Subir el PDF a Airtable`. Airtable
**Operation = Update**, *Mapping Column Mode* = **Map Each Column Manually**.

Ahora escribe cuatro casillas (más el `id`, que **no se toca**):

| Casilla | Valor actual |
|---|---|
| `id` | `{{ $('Montar el informe').item.json.recordId }}` ← **no tocar** |
| `InformeListo` | `{{ true }}` |
| `RegenerarInforme` | `{{ false }}` |
| `ErrorInforme` | `{{ '' }}` |
| `InformeEnviadoEl` | `{{ $now.toISO() }}` |

**Añade la quinta:** en la lista de columnas busca **`Status`**, actívala, y escribe como **texto
plano, sin `=`**:
```
4. Informe enviado
```
```bash
printf '%s' '4. Informe enviado' | pbcopy
```

⚠️ El nodo lleva `typecast: true`. Si escribes `4.Informe enviado` o `4. informe enviado`
**no falla: CREA UNA OPCIÓN NUEVA** en la columna `Status`. Es cuatro, punto, **un** espacio,
`Informe enviado` con I mayúscula.

**Esto no puede bajar el Status, y la razón es el filtro del paso 1:** una fila en el 7 no entra
nunca al workflow. Los pasos 1 y 2 van **atados**.

## Paso 3 · **Settings del workflow** · casilla **Error Workflow**

Menú de tres puntos arriba a la derecha → **Settings**.

| Casilla | Valor |
|---|---|
| **Error Workflow** | `beckham_alertas` (`BJfExmwu1fI1aPpY`) |

Ahora está **vacía**. `beckham_bot` sí lo tiene puesto; estos dos no, así que **si un generador se
cae, nadie se entera**. `beckham_alertas` tiene un *Error Trigger* esperando justo eso.

**Guarda y publica el workflow.** Los pasos 1, 2 y 3 van en la misma publicación.

---

# BLOQUE B · workflow `beckham_generar_030`

`OoJ2l7PmxSHLxXA4` · `https://es.synapse.rentax.es/workflow/OoJ2l7PmxSHLxXA4`

## Paso 4 · nodo `Buscar filas pendientes` · casilla **Filter By Formula**

**Lo que tiene que decir ahora:**
```
AND({Status}="4. Informe enviado", OR({Regenerar030}=1, {Fichero030}=BLANK()))
```
`Cmd+A` → `Delete` → pegar:
```
AND(OR({Status}="3. Pte hacer informe",{Status}="4. Informe enviado"), OR({Regenerar030}=1, {Fichero030}=BLANK()))
```
```bash
printf '%s' 'AND(OR({Status}="3. Pte hacer informe",{Status}="4. Informe enviado"), OR({Regenerar030}=1, {Fichero030}=BLANK()))' | pbcopy
```

**Por qué los dos peldaños y no solo el 3:** los dos schedule van cada 15 min con 18 segundos de
diferencia (el `.030` en el `:23`, el informe en el `:41`). Con solo el 3, el informe escribe el 4 y
**un `.030` que hubiera fallado no reintenta jamás**.

## Paso 5 · **Settings del workflow** · casilla **Error Workflow**

| Casilla | Valor |
|---|---|
| **Error Workflow** | `beckham_alertas` (`BJfExmwu1fI1aPpY`) |

**Guarda y publica.**

---

# BLOQUE C · workflow `beckham_bot`

`nhOwpiGxikeU5DLR` · `https://es.synapse.rentax.es/workflow/nhOwpiGxikeU5DLR`

Los cinco pasos de este bloque van en **una sola publicación, al final**.

## Paso 6 · nodo `Validar y Normalizar` · el **editor de código**

Nodo de código, detrás de `Webhook_Upsert_Expediente`.

```bash
pbcopy < docs/nodo-validar-y-normalizar-2026-08-19.js
```
Doble clic → clic en el editor → `Cmd+A` → `Delete` (**que quede vacío del todo**) → `Cmd+V`.

**El contador tiene que decir 73.081 caracteres.** Antes: **40.317**.
Si te sale **75.205**, eso son **bytes**: la tabla nueva va llena de acentos y ñ. La cifra buena es
73.081.

**No ejecutes el nodo suelto:** sin el webhook delante no tiene `body` y da `_invalid: true`. Ya está
probado en local con 31 casos.

| Cambio | Efecto |
|---|---|
| **+501 gentilicios** (+32.231 car) | de resolver **97 de 245** países a **241**. Los 4 que quedan no son países: Banco Central Europeo, Organismos Internacionales, Otros países no relacionados, y el duplicado `LUXEMBURGO (DI)` |
| **fuera el 1 de julio** | `Llegada posterior al 1 de julio` sale de la lista cerrada de `SenalesComplejidad`. Si el agente la manda, cae en `descartados` con su texto y **no crea opción** |
| **umbral a 50.000** | escribe `Salario por debajo de 50.000` (la opción que ya renombraste). Se dejan los patrones de 55 por si el agente sigue diciendo la cifra vieja |
| **estado civil a tres** | `pareja de hecho` → **casado**, `viudo` → **soltero**. Las palabras siguen dentro **como patrón de entrada**: hacen falta para reconocer lo que dice la gente |
| **fuera `FechaLlamada`** | deja de escribirse esa columna |

## Paso 7 · nodo `guardar_datos_cliente` · **Body Parameters**

*HTTP Request Tool*, cuelga del `AI Agent`. Baja a **Body Parameters**: hay **41**.

Busca la fila **`fecha_llamada`** y **bórrala** con su papelera. **Tienen que quedar 40.**

Si no lo quitas no rompe nada — el validador ya lo ignora — pero deja el prompt y la tool
contradiciéndose, y eso es lo que hace que alguien lo reponga en tres semanas.

## Paso 8 · nodo `Buscar Expediente en Airtable` · **Options → Fields** y **Settings**

Airtable **Operation = Search**, en la rama del LECTOR (detrás de `user_id valido?`).

**8a · Vaciar la whitelist.** En **Options → Fields** hay **21 campos** listados:
`UserId, email, alta_ss, fecha_alta_ss, Descarte, lead_potencial, fecha_prevista_alta,
fecha_limite_plazo, Status, intercom_conversation_id, Nombre empleado, Apellidos empleado, NIF,
NumeroTelefono, FechaNacimiento, Nombre de la calle / Name of street, Tipo de vía / Type of road,
Planta, Puerta, Codigo Postal, Número de tu domicilio / House Number`

**Quita la opción `Fields` entera** (la X de la opción), para que devuelva **todas** las columnas.
Si dejas la whitelist, el paso 9 no sirve para nada: el nodo de código no puede formatear un campo
que Airtable no le ha mandado.

**8b · Las guardas.** Pestaña **Settings** del nodo. Es la **única** de las cinco lecturas de
Airtable del workflow que va sin ellas:

| Casilla | Ponerla en |
|---|---|
| **On Error** | `Continue (using regular output)` |
| **Retry On Fail** | activado |
| **Always Output Data** | ya está activado, dejarlo |

Así queda igual que `Leer_Status_Actual`, `Leer_MotivoCierre` y `Leer_Expediente_Para_Prompt`.

## Paso 9 · nodo `Formatear Respuesta Expediente` · el **editor de código**

```bash
pbcopy < docs/nodo-lector-expediente-2026-08-19.js
```
`Cmd+A` → `Delete` → `Cmd+V`.

- **7.621 caracteres**, 149 líneas
- Pasa de devolver **21 claves** a **47** de primer nivel, más los **9 documentos como booleanos**

**Por qué importa:** el escritor guarda 57 columnas y el lector devolvía 21. Ese hueco de 36 hacía
que **el bot volviera a preguntar datos que ya estaban guardados** — medido en la conversación
`215475520917125`: pidió otra vez la fecha de llegada, la nacionalidad y el país de nacimiento.

Los documentos van como **booleanos, nunca URLs**: las URLs de adjunto de Airtable **caducan el
mismo día**. Y `fecha_llamada` ya **no** se devuelve, por coherencia con el paso 6.

**Los pasos 8 y 9 van atados.** Sin vaciar la whitelist del 8, el 9 devuelve vacíos.

## Paso 10 · nodo `Decidir_Status` · el **editor de código**

**El último de n8n, y va después de los pasos 1, 2 y 4.** Si lo pegas antes de que los filtros
acepten el 3, una fila que cierre se queda clavada en el 3 y **no la recoge nadie**.

```bash
pbcopy < docs/nodo-decidir-status-2026-08-19.js
```
`Cmd+A` → `Delete` → `Cmd+V`. **El contador: 8.977 caracteres.** Antes: **8.082**.

Cambia **una** línea de comportamiento:
`propuesto = '4. Informe enviado'` → `propuesto = '3. Pte hacer informe'`.
Los otros +895 caracteres son comentarios con el reparto de peldaños y los cinco sitios.

**Guarda y publica `beckham_bot`** con los pasos 6, 7, 8, 9 y 10 de una sola vez.

---

# BLOQUE D · Airtable · lo que queda

## Paso 11 · automatización `3b` · **la guarda de adjuntos en el trigger**

`wflbayW4R4IvjHLTQ` → **When record matches conditions**.

Ahora la condición es **una sola**:
```
EnviarBorradores (fldGSgXLLCf2okzvB)  is  checked
```

**Añadir dos más, con `AND`:**

| Casilla | Condición |
|---|---|
| `Borrador030` (`fldZ6RNPfTbK2S3MR`) | **is not empty** |
| `Borrador149` (`fldHucVawayh0zYvk`) | **is not empty** |

Es exactamente el patrón que **ya tiene la automatización 5**, que exige
`InformeListo is checked` **AND** `InformePdf is not empty` para no mandar nunca un correo sin el PDF
dentro.

**Por qué:** 3b manda el correo diciendo «te adjuntamos los borradores del 030 y del 149» **sin
comprobar que existan**. Ya ha pasado: hay una fila donde el correo salió con `Borrador030` y
`Borrador149` **los dos vacíos**, y encima `Estado030149` quedó en «3. Pendiente confirmación», o
sea que se le pidió al cliente que confirmara unos documentos que no iban en el correo.

> Si el 149 a veces va vacío a propósito (lo rehace un fiscal a mano), pon **solo** la de
> `Borrador030` y dímelo, que lo dejo escrito.

**Publica la automatización.**

## Paso 12 · automatizaciones `2` y `2b` · **DECIDES TÚ, no lo toco**

Están **al revés** de lo documentado:

| Automatización | Estado hoy | Qué hace |
|---|---|---|
| **`2`** `wflo1oMmSWlcYsO3V` | **`deployed`** (viva) | `customScript`: copia **TODOS** los campos no computados y no vacíos de la fila del formulario al expediente, y luego **borra** la fila del formulario |
| **`2b`** `wflvsvULr5SUHcgPN` | **`undeployed`** (apagada) | nativa: copia **solo tres** campos explícitos (`Estado030149`, `Modificacion M030`, `Modificacion M149`). **No borra** la fila del formulario |

El riesgo que 2b venía a cerrar sigue abierto: **el día que alguien añada un campo al formulario de
confirmación, ese campo empezará a sobrescribir el expediente real** sin que nadie lo haya decidido.
Y la 2 **no se puede editar** ni por API ni desde la UI (`customScript`, `readOnlyNodeType`).

**El intercambio:** si apagas la 2 y enciendes la 2b ganas la whitelist de tres campos, pero
**pierdes el borrado automático** de la fila duplicada del formulario (Airtable no tiene acción
nativa de borrar). Se limpian a mano con la vista de huérfanas. Eso ya lo aceptaste el 13/08 cuando
se escribió la 2b — solo no se llegó a hacer el cambio.

**Dime sí y te doy los dos clics.** No lo toco por mi cuenta: cambia el comportamiento de producción
y acumula filas.

---

# BLOQUE E · LangSmith

## Paso 13 · prompt `bot_mobility_prompt` · tag `prod`

```bash
pbcopy < docs/prompt-final-2026-08-19-v10.txt
```
`Cmd+A` → `Delete` → `Cmd+V`. **60.328 caracteres** (v9 eran **59.708**, `+620`).

**Guardar Y poner el tag `prod`.** Sin el tag, el bot sigue leyendo el v9 y no cambia nada.

Va el último: es lo único reversible en un clic.

**Los 17 cambios:**

| # | Qué |
|---|---|
| 1-4 | **Umbral a 50.000.** `<50.000` → llamada · `50.000-60.000` → al límite · `>60.000` → favorable. **Cero** apariciones de 55.000 en todo el prompt. Se mantiene la regla dura: el salario **nunca** descarta, y quien dice si compensa es el fiscal |
| 5-7 | **El 1 de julio sale del enrutado.** Fuera de `CASO CLARO` (queda con 4 requisitos) y fuera de `CASO COMPLEJO` (queda con 5 señales). Se queda como **dato**, con un «NO una señal de complejidad: no enrutes a llamada por esto» explícito |
| 8-10 | **Estado civil a tres**: «¿soltero, casado o divorciado?», con la regla de mapeo escrita, y `PF5b` ya solo depende de `casado` |
| 11-12 | **Fuera la pregunta de la fecha de la llamada**, incluido el recordatorio `11b` del final del prompt, que era el que más se le pegaba |
| 13 | **Link de la autorización de TaxDown**, con el guion de cómo dárselo |
| 14 | **Link del portal de la AEAT** para las preguntas de plazo y de cuánto tarda |
| 15-16 | **24-48 h** en los dos mensajes al cliente: al recibir la documentación y en el cierre |
| 17 | `F1` deja de justificarse por «el corte del 1 de julio», que ya no existe |

**Lo que NO se ha tocado, y lo comprueba la puerta:** el bloque fiscal de `WP-220` entero, la
paternidad tributando, la salvedad del 720/721, los marcadores `{contexto}` y `{current_date}`, los
dos parámetros que antes se perdían, la regla de no afirmar lo que no se sabe, y el gate del 10/08
(no nombra ninguna tool que no esté cableada).

---

# La escalera, después de todo esto

| Peldaño | Quién lo escribe | Cuándo |
|---|---|---|
| 1 Interesado | bot · `Decidir_Status` | arranque |
| **2** Pendiente llamada TD | bot · `Decidir_Status` | `MotivoCierre='Llamada agendada'` o caso complejo |
| **3** Pte hacer informe | **bot · `Decidir_Status`** | `MotivoCierre='Expediente completo'` |
| **4** Informe enviado | **`beckham_informe_mobility` · `Marcar InformeListo`** | el PDF ya está subido |
| 7 Pte confirmación | Airtable · `3b` | `EnviarBorradores` + los dos borradores presentes |
| 8 Confirmado | Airtable · `4` | el cliente confirma |

Los peldaños **5 y 6 no los escribe nadie**, igual que antes.

# Cuando acabes, dímelo y audito por MCP

Sin que me lo cuentes puedo comprobar: los tres `versionId == activeVersionId`, los dos filtros
literales, que `Marcar InformeListo` escribe 5 casillas con el `Status` exacto, que `Decidir_Status`
no asigna el 4 por ningún camino, que el validador tiene 1.478 líneas, que la tool tiene 40
parámetros, que el lector no lleva whitelist y devuelve 47 claves, y que los dos generadores tienen
`errorWorkflow`.

# Y luego, la prueba que nunca se ha hecho

Ningún tick de 15 minutos ha producido nada **nunca**: las 5 generaciones que existen son
`mode=manual` lanzadas desde la UI.

1. Conversación nueva → cerrar con «expediente completo» → la fila queda en **3**.
2. **No tocar nada.** No lanzar los workflows a mano. **No marcar `EnviarBorradores`.**
3. En ≤15 min: `Fichero030` con un `.030` de 2.700 bytes, `InformePdf` con el PDF, `InformeListo`
   marcado, y el `Status` **en 4**.
4. En n8n, que las dos ejecuciones sean **`mode=trigger`**, no `manual`.

Y de paso, tres cosas de lo que se cambia hoy:

- que el bot **no** pregunte la fecha de la llamada al cerrar un caso complejo;
- que a alguien que llegue **después del 1 de julio** el bot **no** lo mande a llamada por eso;
- que a alguien con salario de **52.000** el bot lo trate como «al límite» y no lo descarte.

---

# Lo que queda apuntado y NO va en este pase

| Qué | Por qué no ahora |
|---|---|
| **El informe PDF a nombre + apellido + fecha de alta** (`T059`) | Lo pediste como «solo apúntalo». La línea de «Fecha de la reunión» desaparece con esa reescritura, así que no toco 239 KB dos veces. **Pásame cómo son los PDF nuevos y lo hago de una vez** |
| La columna `FechaLlamada` de Airtable | Queda huérfana. **No la borro**: borrarla se lleva el dato de las filas que ya lo tienen. Bórrala tú cuando quieras |
| Automatización **`Crear Check out`** | `undeployed`. La casilla `CrearCheckout` no hace nada y `Checkout Error` no la marca nadie. Puede ser a propósito en TEST, pero no hay nada en la base que lo diga |
| Tres de los cuatro formularios sin automatización detrás | `Formulario 030 y 149`, `Formulario Globant empleados` y `Formulario Globant empresa`: lo que se envíe por ahí crea una fila suelta que nadie fusiona |
| Las **4 filas de prueba** | Hay que limpiarlas antes de producción. Se reconocen por el correo |
| `DiscrepanciaFechaAlta` no impide cerrar como «Expediente completo» | La línea 322 del prompt dice que una discrepancia de fecha de alta es motivo de **llamada** aunque el caso sea claro, y `Decidir_Status` no mira esa columna. Pasó en la ejecución `8118002`. **Sin decidir: dime si el cierre debe forzarse a `Llamada agendada`** |
| `WP-203` / `T053` · auth de los dos webhooks | Es lo último de todo, por decisión tuya |

## Dos correcciones a cosas que te dije yo

- **`AnioDesplazamiento` y `FechaAlta` en `state:'error'` NO afectan al informe.** Te dije que
  `AnioDesplazamiento` era el año de la cabecera y que había que ver con qué año salió el PDF. **Es
  falso.** El código lo dice desde el 14/08 (`AnioDesplazamiento NO SE USA A PROPOSITO`) y lo he
  probado: con los dos campos en error, `resolverDatos` devuelve `anioDesplazamiento: 2026` y
  `anioSiguiente: 2027`, sacados de `fechaDesplazamiento`. No hay nada que arreglar ahí.
- **El `1415` y el `1406` son el mismo byte.** Te dije que el `1415` del `CLAUDE.md` era una errata.
  No lo era: `poner(a, 1406, …)` escribe en la posición 1406 **del bloque A**, y el bloque A empieza
  en el offset 9, así que cae en el offset **1415 del fichero**. `1415 − 1406 = 9`. Los dos tests lo
  reportan en coordenadas distintas. Queda escrito en el `CLAUDE.md` para que nadie lo «corrija».

## Corregido en el repo, sin que haya que pegar nada

- **`docs/montar-nodo-030.sh`** ya no declara los 197.924 caracteres a mano: **los calcula**. Decía
  la cifra del nodo vivo y el `COMPLETO` local va por 198.509, así que quien pegara hoy y comprobara
  contra el script creería haber pegado mal.
- **`CLAUDE.md`**: `54 nodos` → **55** (48 de lógica + 7 sticky) · «14 pruebas del informe» → **9**,
  más 8 comprobaciones de piezas · los dos `COMPLETO` ahora distinguen el tamaño **local** del
  **desplegado** y dicen que la diferencia son solo comentarios · añadida la nota del `1415`/`1406`.
