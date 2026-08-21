# Automatizaciones de la base `Mobility_2026` · correcciones y por qué · 21/08/2026

Hola Iciar,

He auditado las automatizaciones de la base y hay **seis cosas** que conviene arreglar antes de que
las tuyas sustituyan a las que había. No van de estilo: cinco de las seis son fallos que ya
ocurrieron una vez, y por eso están donde están.

Todo lo de abajo está leído de la **configuración actual** de las automatizaciones, no de memoria.

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
