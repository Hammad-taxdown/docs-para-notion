# Automatizaciones de la base `Mobility_2026` · correcciones y por qué · 21/08/2026

Hola Iciar,

He auditado las automatizaciones de la base y hay **seis cosas** que conviene arreglar antes de que
las tuyas sustituyan a las que había. No van de estilo: cinco de las seis son fallos que ya
ocurrieron una vez, y por eso están donde están.

Todo lo de abajo está leído de la **configuración actual** de las automatizaciones, no de memoria.

---

## REESCRITO EL 24/08/2026 · SE QUEDAN LAS AUTOMATIZACIONES DE ICIAR, y hay un motivo técnico

**Decisión: las de Iciar son las que se quedan.** Y al leer su script entero se ve que no es una
preferencia, es lo correcto: **su `customScript` no manda el correo**. Hace `POST` a
`https://es.synapse.rentax.es/webhook/a6a3ebaa-0d63-4edf-baef-30effc5fdf60` con
`notif: "NOTIF_Mobility_BorradorM030"`, `transactionalIDCustomer: 54` y el `x-make-apikey` del
secreto `n8nApi` — o sea que **el correo sale por el sistema transaccional de TaxDown**, no por
Airtable.

Nuestras `3b` y `5` usan `sendEmail` **de Airtable**. Son otro canal: otra plantilla, otro remitente,
otra trazabilidad, y fuera de lo que Marketing y Ops ven. Por eso:

- **La `3b` se queda en `undeployed` PARA SIEMPRE.** No es que sea peor — es que manda por el canal
  equivocado. Si alguien la vuelve a publicar, el cliente recibe **dos correos** por el mismo hito,
  uno de cada canal. Que quede escrito aquí para que nadie repita el análisis.
- **La `5` sigue aparcada**, y ahora se entiende del todo: «las comunicaciones al cliente irán por
  otra vía» **es este webhook**. Que el informe no salga hoy desde Airtable no es un fallo.

### HECHO Y PUBLICADO EL 24/08/2026

Los tres arreglos están dentro y en vivo. `configurationStatus: valid`, `deploymentStatus: deployed`,
`deployedVersion: null` (el desplegado no difiere del borrador). El grupo condicional queda con
**tres** ramas, porque **Airtable no deja crear un grupo anidado dentro de una rama** y la inglesa
hubo que partirla en dos al nivel de arriba:

| Rama | Condición | Qué hace |
|---|---|---|
| 1 | `Idioma != Ingles` (entra el vacío) | script ES → grupo anidado: `Status ∈ {1,2,4,5,6}` → `7` + `Estado030149` · else → **solo** `Estado030149` |
| 2 | `Idioma = Ingles` **y** `Status ∈ {1,2,4,5,6}` | script EN → `7` + `Estado030149` |
| 3 | **else** | script EN → **solo** `Estado030149` |

Los cuatro casos cubiertos y **el mismo comportamiento en los dos idiomas**: un cliente ya
confirmado sigue recibiendo el reenvío y no pierde el peldaño.

**La llave fue que `Grupo duplicado` está en gris en la rama española y habilitado en la inglesa** —
el gris no era por el script, era por el grupo anidado que la española ya tenía dentro.

**El precio: el script inglés existe ahora DOS VECES** (`wacPpABiplv5tO7OM` y `wac2hg1IZkE0yOxMF`).
Si se cambia el texto del correo inglés **hay que cambiarlo en los dos**.

**Y el motivo real de que el script sea intocable no es el tipo de nodo, es el secreto:** «Los
colaboradores de todos los secretos añadidos son los únicos que pueden hacer ediciones». El secreto
es `n8nApi` (`eacbfZbyDYjL9UWCW`). **Quien sea colaborador de ese secreto sí puede editarlo**, así
que lo de `comentarios149` es un permiso, no un imposible.

---

### El por qué de cada arreglo, que es lo que hay que leer antes de tocarlo otra vez

Esto es la buena noticia. Los fallos graves **no están dentro del script** — están en el trigger, en
las condiciones de las ramas y en los `updateRecord`, que son acciones nativas y **sí se editan en la
UI**. El script se queda intacto, no hay que tocar ni una línea.

**A · La guarda del `Status`. Es la grave, y hay que hacerla en las dos ramas.**

Hoy el `updateRecord` de cada rama escribe, sin ningún condicional alrededor:

```
Status        → "7. Pte confirmación usuario"   (sel1oCLW0XPLZNZz7)
Estado030149  → "3. Pendiente confirmación"     (selBhjx9YrZGJUSz0)
```

Una fila en `8. Confirmado`, en `9` o en `11` a la que alguien marque `EnviarBorradores` **baja al
7**. Hay que **envolver el `updateRecord` en un grupo condicional** (el script se queda fuera, antes
del grupo):

| Rama | Condición sobre `Status` | Qué escribe |
|---|---|---|
| Peldaño bajo o vacío | es cualquiera de **1, 2, 4, 5, 6** o está vacío | `Status = 7` **y** `Estado030149` |
| Ya en 7 o más | el resto | **solo** `Estado030149` |

**En esa lista va el `4` y NO va el `3`.** No es un detalle: el 18/08 una fila llegó al peldaño `3`,
alguien marcó `EnviarBorradores`, esto la subió al `7` **antes del tick de 15 minutos**, y el informe
**no se generó nunca** — los dos generadores solo miran las filas en `3` o en `4`. Con el `4` sí es
seguro, porque a esa altura el informe y el `.030` ya están subidos: `4 → 7` es el paso normal.

> **⚠️ RENUMERACIÓN — 27/08/2026.** Todos los números de peldaño de esta sección (la lista
> `{1, 2, 4, 5, 6}`, «va el `4` y NO va el `3`», «baja al `7`») son de la escalera **anterior al
> 26/08**, que ese día se renumeró (+1 desde «Pendiente llamada TD»; equivalencias en
> `docs/pasos-2026-08-26-renumeracion.sh`). En la numeración de hoy: los generadores filtran
> `OR(Status=4, Status=5)`, en la lista de la guarda **va el `5` («Informe enviado») y NO va el `4`
> («Pte hacer informe»)**, y el destino es el `8` («Pte confirmación usuario»). Quien reconstruya la
> guarda con los números viejos mete el `4` nuevo en la lista y reproduce exactamente el bug del
> 18/08.

Y la guarda va **duplicada dentro de cada rama de idioma**, porque Airtable no deja poner ningún nodo
después de un grupo condicional.

**B · Un `Idioma` vacío hoy no manda nada, y la ejecución sale verde.**

Las dos ramas comparan con un valor exacto: `Idioma = Español` (`selpK6kadMNE60g0g`) y
`Idioma = Ingles` (`selB0lkXu3bmepNM3`). `Idioma` es un `singleSelect` de solo esas dos opciones,
así que **con la celda vacía no entra en ninguna rama**: no sale correo, no hay error, y la
automatización se marca como correcta. Es el mismo fallo silencioso de la clase «pasa desapercibido».

**Corrección de un solo clic:** cambiar la condición de la rama española de `Idioma es Español` a
**`Idioma no es Ingles`**. En Airtable el `is not` de un `singleSelect` **sí incluye las celdas
vacías**, así que el español pasa a ser la rama por defecto sin tocar el orden ni la rama inglesa.

**C · El trigger no exige que los borradores existan.**

Hoy pide `EnviarBorradores` marcada y **`Borrador030` no vacío** (`fldZ6RNPfTbK2S3MR`). No pide
`Borrador149` (`fldHucVawayh0zYvk`) — y los dos scripts adjuntan los dos, y el correo dice
literalmente «los dos trámites». Hay que **añadir `Borrador149` no vacío** al trigger. Es la misma
tercera condición que lleva la `3b`.

### Lo que NO se puede arreglar sin tocar el script, y qué hacer

**`comentarios149` se recibe y se tira.** El `inputObj` de los dos scripts pasa
`comentarios149` (`fldQ3T7KtPYTZeYcK`), y el cuerpo del correo **solo usa `comentarios030`**:

```js
const comentarios = inputConfig.comentarios030 ? inputConfig.comentarios030 + "<br><br>" : "";
```

O sea que si un fiscal escribe una observación en `comentarios149`, **el cliente no la ve nunca** y
nada avisa. Como el script no se toca, hay dos salidas y son las dos de producto, no técnicas:
escribir siempre en `comentarios030`, o **ocultar o renombrar la columna `comentarios149`** para que
nadie escriba ahí creyendo que viaja. ~~Decisión pendiente.~~ **DECIDIDO Y HECHO el 24/08/2026:
mitigado renombrando las dos columnas** — `fldRb66vq77ugTYUo` → «Comentarios al cliente (SÍ se
envía)» y `fldQ3T7KtPYTZeYcK` → «Notas internas 149 (NO se envía)», las dos con descripción. Es
seguro porque sus consumidores las reciben por ID de campo (anotado el 27/08/2026).

### Y una corrección a lo que yo mismo escribí el 21/08

Dije que **la rama inglesa lee el enlace de la variable en vez del registro**, y es verdad
literalmente pero **no es un fallo**: la variable `linkConfirmacion030` está enlazada a
`fldraDKaVYKWXqiSq`, que **es** `Linkconfirmacionmodelos`, el mismo campo que la rama española lee
con `getCellValueAsString`. Y esa fórmula solo depende de nombre, apellidos, NIF y `RECORD_ID()`, así
que la foto del trigger y la lectura fresca dan lo mismo. **No hay nada que arreglar aquí, y menos
tocando un script que no se puede tocar.** Queda como diferencia de estilo entre las dos ramas.

### La `2` y la `2b` sí siguen chocando, y esto necesita tu decisión

> **✅ DECIDIDO — 24/08/2026 (anotado el 27/08/2026). NO SE REABRE.** El usuario decidió que **la
> `2` y la `2b` se quedan LAS DOS en `deployed`**, y no hay conflicto real: leído el script de la
> `2`, las dos escriben **los mismos valores en los mismos campos de la misma fila** (el formulario
> son tres respuestas más nombre, apellidos y NIF, prefijados), así que el orden da igual. A cambio
> vuelve el borrado automático de la fila huérfana (la `2`) y la `2b` queda de red. El precio
> asumido: la whitelist deja de proteger, y un campo nuevo en el formulario se copiará al expediente
> sin que nadie lo decida. **No apagar ninguna.** El análisis de abajo queda como registro de por
> qué se planteó la decisión.

`2. Usuario completa el formulario de confirmación M030` (`wflo1oMmSWlcYsO3V`, `customScript`) y
`2b` (`wflvsvULr5SUHcgPN`, nativa) están **las dos en `deployed` sobre el mismo formulario**
(`viwjxT8e1uLg7K4OC`). Son **dos escritores** sobre la misma fila.

Aquí el argumento del canal **no aplica**: la `2` no manda nada al cliente, solo fusiona la respuesta
del formulario en el expediente. Y las dos hacen cosas distintas:

| | `2` (de Iciar, script) | `2b` (nuestra, nativa) |
|---|---|---|
| Qué copia | **todo lo no computado y no vacío** — las 93 columnas, con lista negra de 5 | **tres campos**, explícitos, con whitelist |
| Borra la fila del formulario | **sí** | no (Airtable no tiene acción nativa de borrar) |
| Editable | no | sí |

Con las dos publicadas, **la whitelist del 19/08 está de hecho anulada**: la `2` sobrescribe igual.
Hay que apagar una, y cuál depende de si pesa más el borrado automático de la fila huérfana (la `2`)
o que un campo nuevo en el formulario no pueda sobrescribir el expediente sin que nadie lo decida
(la `2b`).

---

## La `5` (envío del informe) queda APARCADA — decisión del usuario, 21/08/2026

**No hay que arreglarla ni republicarla.** Las comunicaciones al cliente van a pasar a otra vía, así
que la `5. Envío del informe Mobility` se queda en `undeployed` a propósito. Lo que sigue vale como
registro de lo que hacía y de las dos condiciones que tendrá que cumplir el mecanismo nuevo, sea el
que sea: el PDF **adjunto y nunca por enlace** (las URLs de adjunto de Airtable caducan el mismo
día), y un disparador que exija que el PDF exista antes de mandar nada.

<details>
<summary>Lo que hacía la 5, por si hace falta recuperarlo</summary>

## Lo primero, porque corre prisa: ahora mismo el cliente no recibe su informe

La automatización **`5. Envío del informe Mobility`** está en **`undeployed`**.

El workflow de n8n sigue generando el PDF, lo sube al campo `InformePdf` y marca `InformeListo`. Esa
casilla era el disparador del correo. Con la `5` apagada, **el informe se produce y no sale de la
base**, y en Airtable todo parece correcto: el adjunto está ahí, la casilla marcada. No hay error en
ninguna parte.

Si tu versión va a sustituirla, necesita dos cosas:

- Disparador: **`InformeListo` marcada Y `InformePdf` no vacío**. La segunda es una guarda para que
  nunca salga un correo sin el PDF dentro.
- El PDF **adjunto al correo, nunca por enlace**. Las URLs de adjunto de Airtable están firmadas y
  **caducan el mismo día**: medido el 14/08, una URL generada a las 10:26 estaba muerta a las 14:00.
  Un enlace le deja al cliente un documento inservible por la tarde.

Mientras no exista la sustituta, lo más seguro es **volver a publicar la `5`**: es un clic y es
reversible.

</details>

---

## 1 · La automatización `3` hace **retroceder** el `Status`

**Qué he visto.** En la `3. Envio borradores 030 y 149`, ahora en `deployed`, el nodo `updateRecord`
de **las dos ramas** escribe:

```
Status         → "7. Pte confirmación usuario"    (sel1oCLW0XPLZNZz7)
Estado030149   → "3. Pendiente confirmacion"      (selBhjx9YrZGJUSz0)
```

y **no tiene ningún grupo condicional alrededor**: se escribe siempre.

**Por qué importa.** El `Status` de esta base **solo puede subir**. Es la regla que impide que un
expediente ya trabajado vuelva atrás, y el bot la respeta: solo escribe si el peldaño propuesto es
mayor que el actual. Con la `3` tal cual, una fila en **8. Confirmado**, en 9 o en 11 a la que
alguien marque `EnviarBorradores` **baja a 7**, y con ella se pierde el rastro de que el cliente ya
había confirmado.

**La corrección.** No es de código: ese nodo es un `updateRecord` nativo. Hay que **envolverlo en un
grupo condicional** con dos ramas:

| Rama | Condición | Qué escribe |
|---|---|---|
| Status del 1 al 6, o vacío | `Status` es cualquiera de: 1, 2, 3, 4, 5, 6, vacío | `Status = 7` **y** `Estado030149` |
| Status ya en 7 o más | el resto | **solo** `Estado030149`, el `Status` no se toca |

**Y un detalle del rango que parece menor y no lo es: en esa lista tiene que estar el `4` y NO el
`3`.** El 18/08 pasó esto: una fila llegó al peldaño 3 («pendiente de hacer el informe»), alguien
marcó `EnviarBorradores`, la automatización la subió al 7 **antes de que llegara el tick de 15
minutos** del generador, y el informe **no se generó nunca**, porque el generador solo mira las filas
en 3 o en 4. La ventana era más corta que el reloj.

> Nota práctica: la guarda hay que **duplicarla dentro de cada rama de idioma**, porque Airtable no
> permite poner ningún nodo después de un grupo condicional.

---

## 2 · Con el idioma vacío no se manda nada, y no salta ningún error

**Qué he visto.** Las dos ramas de la `3` comparan el campo `Idioma` con un valor exacto:

```
rama 1:  Idioma = "Español"   (selpK6kadMNE60g0g)
rama 2:  Idioma = "Ingles"    (selB0lkXu3bmepNM3)
```

**Por qué importa.** Si `Idioma` está **vacío** —y se queda vacío más a menudo de lo que parece—
ninguna de las dos condiciones se cumple, así que **no se manda el correo y la automatización se
marca como ejecutada correctamente**. El cliente se queda esperando y nadie se entera.

**La corrección.** Que el **inglés sea el caso explícito** y el español sea la **rama por defecto**:

| Rama | Condición |
|---|---|
| Inglés | `Idioma` = `Ingles` |
| Español y cualquier otro (por defecto) | *sin condición* |

Así un `Idioma` vacío, o cualquier valor nuevo que se añada al desplegable en el futuro, sale en
español en vez de no salir. Es la misma regla en los tres sitios que usan el idioma (el workflow del
informe y las dos automatizaciones de correo), y conviene que siga siendo la misma en los tres.

---

## 3 · El correo de borradores puede salir **sin los borradores**

**Qué he visto.** El disparador de la `3` es solo:

```
EnviarBorradores = true
```

**Por qué importa.** `Borrador030` y `Borrador149` los sube **un fiscal a mano**. Si alguien marca la
casilla antes de haberlos subido, el correo sale igual, sin adjuntos, diciéndole al cliente que
revise unos borradores que no están.

**La corrección.** Añadir dos condiciones al disparador:

```
EnviarBorradores = true
Y  Borrador030 no está vacío
Y  Borrador149 no está vacío
```

---

## 4 · Corrección de código: la rama inglesa lee el enlace del sitio equivocado

En el script de la rama **española**:

```js
// lee el enlace del propio registro
const linkConfirmacionModelos = triggerRecord.getCellValueAsString("Linkconfirmacionmodelos");
```

En el script de la rama **inglesa**:

```js
// lee el enlace de la variable de entrada
const linkConfirmacionModelos = inputConfig.linkConfirmacion030;
```

**Por qué importa.** `Linkconfirmacionmodelos` es un campo de **fórmula**, y su valor se recalcula.
Leerlo del registro en el momento del envío da siempre el enlace bueno; leerlo de la variable de
entrada lo deja a merced de cómo esté mapeada esa entrada, que es otra cosa que puede
desconfigurarse por su cuenta. Además, tener las dos ramas haciendo lo mismo de dos formas distintas
garantiza que cuando una se arregle, la otra se olvide.

**La corrección** — en la rama inglesa, cambia esa línea por la de la española:

```js
const linkConfirmacionModelos = triggerRecord.getCellValueAsString("Linkconfirmacionmodelos");
```

---

## 5 · Corrección de código: lo que el cliente pide cambiar del **149** no le llega

**Qué he visto.** El script recibe los dos campos de modificaciones:

```js
"comentarios030": … fldRb66vq77ugTYUo   // Modificacion M030
"comentarios149": … fldQ3T7KtPYTZeYcK   // Modificacion M149
```

pero en el cuerpo del correo **solo se usa el primero**, en las dos ramas:

```js
const comentarios = inputConfig.comentarios030 ? inputConfig.comentarios030 + "<br><br>" : "";
```

`comentarios149` se recibe y **se tira**.

**Por qué importa.** Cuando el fiscal escribe una nota en `Modificacion M149`, cree que se la está
mandando al cliente. No llega. Y como el correo sale bien, nadie lo nota.

**La corrección** — usa los dos, cada uno con su etiqueta para que se entienda a qué modelo se
refiere:

```js
// Comentarios opcionales: cada uno solo si su campo tiene contenido.
// Van etiquetados porque si no, el cliente no sabe a qué modelo se refiere cada nota.
let comentarios = "";
if (inputConfig.comentarios030) {
    comentarios += "**Sobre el modelo 030:** " + inputConfig.comentarios030 + "<br><br>";
}
if (inputConfig.comentarios149) {
    comentarios += "**Sobre el modelo 149:** " + inputConfig.comentarios149 + "<br><br>";
}
```

(En la rama inglesa, `**About Form 030:**` y `**About Form 149:**`.)

---

## 6 · Hay **dos** automatizaciones respondiendo al mismo formulario

`2. Usuario completa el formulario de confirmación M030` y
`2b. El cliente confirma los modelos → fusionar en su expediente` están **las dos en `deployed`** y
comparten disparador: `formSubmitted` sobre la vista `viwjxT8e1uLg7K4OC`.

**Por qué importa.** La `2` copia **todo** lo que la fila del formulario tenga no computado y no
vacío; la `2b` copia **tres campos explícitos** (`Estado030149`, `Modificacion M030`,
`Modificacion M149`). Con las dos activas, la `2` puede sobrescribir campos del expediente que nadie
ha decidido que se sobrescriban, y el día que alguien añada un campo al formulario empezará a pisar
ese campo también, sin que nadie lo haya pedido.

**La corrección.** Dejar **una sola activa**. Si te quedas con una versión con script, quítale la
copia genérica y déjala en los tres campos.

---

## Una limitación de Airtable que conviene saber antes de decidir

**Las acciones `customScript` no se pueden crear ni editar por API** (`readOnlyNodeType`), y Airtable
tampoco devuelve el valor de un secreto. En la práctica:

- Las automatizaciones con script **solo se tocan a mano desde la interfaz**, y no se pueden revisar
  por API ni versionar en ningún sitio.
- Por eso las tres nativas (`2b`, `3b`, `5`) se rehicieron sin una línea de código: se pueden leer,
  auditar y corregir sin depender de que alguien recuerde qué hay dentro del script.

No es un argumento contra tu versión — es solo el motivo por el que las nativas están escritas así.
Si las tuyas llevan script, todo lo de arriba sigue valiendo; lo único que cambia es que habrá que
comprobarlo abriéndolas.

---

## Resumen

| # | Qué | Dónde se corrige |
|---|---|---|
| 1 | El `Status` retrocede del 8 al 7 | grupo condicional alrededor del `updateRecord`; en el rango, el `4` **sí** y el `3` **no** |
| 2 | Con `Idioma` vacío no se manda nada | inglés explícito, español por defecto |
| 3 | Correo sin adjuntos | el disparador exige los dos borradores |
| 4 | La rama inglesa lee el enlace de la variable | una línea de código |
| 5 | La `Modificacion M149` no le llega al cliente | usar `comentarios149` en el cuerpo |
| 6 | Dos automatizaciones en el mismo disparador | dejar una |

Cualquier duda de por qué está algo así, pregúntame: casi todo tiene una fecha y un caso real detrás.
