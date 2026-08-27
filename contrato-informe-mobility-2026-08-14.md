# Contrato de montaje del informe Mobility · 14/08/2026

> **SUPERADO — 27/08/2026.** Contrato del informe **v1** tal y como estaba el 14/08. Remite a
> `informe-datos-2026-08-14.js` e `informe-cuerpo-2026-08-14.js`, y las piezas vigentes son las
> **`-2026-08-19`**: el 19/08 el informe se recortó a nombre, apellidos y fecha de alta, así que el
> juego de 17 marcadores de aquí ya no es el vigente; y el 20/08 se decidió que el motor pasa a
> `beckham_informe_mobility_v2` (8 plantillas de Google Docs). Lo vigente: `CLAUDE.md` §4 y §6.
> **El IR y la regla de fronteras entre las cuatro piezas siguen valiendo como diseño.**

> **Qué es esto.** El contrato que fija las fronteras entre las cuatro piezas de código del informe,
> para que cada una se pueda escribir y probar por separado y encajen sin tocarse. Continúa
> `docs/spec-informe-mobility-2026-08-13.md` (los 17 marcadores) y
> `docs/plantilla-informe-mobility-texto-2026-08-14.md` (el texto literal).
>
> **Nada de lo que hay aquí es opinable.** Todos los nombres de columna, ids de campo y valores de
> select están leídos del esquema vivo el 14/08 por MCP. Si una pieza necesita un dato que no está
> aquí, **se pregunta, no se inventa**.

---

## 0 · Por qué cuatro piezas y no una

El nodo de código de n8n va a llevar las cuatro concatenadas, igual que el del `.030`. Se separan
porque cada una se prueba con un tipo de prueba distinto:

| Pieza | Fichero | Se prueba con |
|---|---|---|
| Métrica de Helvetica | `docs/metrica-helvetica-2026-08-14.js` | invariantes conocidos del estándar |
| Motor del PDF | `docs/pdf-motor-2026-08-14.js` | el PDF abre y el texto se puede volver a extraer |
| Datos y marcadores | `docs/informe-datos-2026-08-14.js` | filas reales y filas rotas a propósito |
| Cuerpo del informe | `docs/informe-cuerpo-2026-08-14.js` | ningún `{{` en la salida, y los tres bloques |

**Regla de oro:** el motor del PDF **no sabe nada** del informe, y el cuerpo del informe **no sabe
nada** de PDF. Se hablan solo por la representación intermedia del §1.

---

## 1 · La representación intermedia (el IR)

Un informe es un **array plano de elementos**. Es lo único que cruza la frontera entre el cuerpo y
el motor.

```js
{ tipo: 'titulo1',    texto: 'BLOQUE A — RESIDENTE FISCAL EN ESPAÑA (RÉGIMEN GENERAL)' }
{ tipo: 'titulo2',    texto: 'Rendimientos del trabajo' }
{ tipo: 'parrafo',    texto: 'Los residentes fiscales en España...' }
{ tipo: 'campo',      etiqueta: 'Nombre', valor: 'Hammad Bellachhab' }
{ tipo: 'lista',      items: ['No se aplican las deducciones...', '...'] }
{ tipo: 'tabla',      titulo: 'Resumen', cabecera: ['Concepto', 'Situación'],
                      anchos: [0.38, 0.62],
                      filas: [['Situación en 2026', 'No residente NO UE'], ...] }
{ tipo: 'saltoPagina' }
```

Reglas del IR, todas obligatorias:

- **`anchos` son fracciones del ancho útil y suman 1.** Nunca puntos ni milímetros.
- **`cabecera` puede ser `null`** si la tabla no lleva fila de encabezado.
- **`titulo` de la tabla es opcional.** Si va, se dibuja encima de la tabla en negrita.
- **Ninguna celda puede ser `undefined` ni `null`.** Cadena vacía sí.
- El array es **plano**: no hay elementos anidados. Una tabla dentro de otra no existe.

---

## 2 · Pieza 1 · Métrica de Helvetica

`docs/metrica-helvetica-2026-08-14.js`

```js
ANCHOS_HELVETICA        // objeto: codigo de byte WinAnsi (0..255) -> ancho en unidades/1000
ANCHOS_HELVETICA_BOLD   // idem para Helvetica-Bold
```

- Los anchos son los del estándar de las 14 fuentes base, en **unidades de 1/1000 de em**. El ancho
  real en puntos es `ancho / 1000 * tamañoEnPuntos`.
- Deben cubrir **los 256 códigos de WinAnsiEncoding**, no solo el ASCII. Sin `Ñ`, `á`, `é`, `í`, `ó`,
  `ú`, `ü`, `ç` y `º` esto no sirve para este proyecto.
- Los códigos sin glifo valen `0`.

**Invariantes de la prueba** (valores del estándar, no negociables):

| Carácter | Helvetica | Helvetica-Bold |
|---|---|---|
| espacio (32) | 278 | 278 |
| `A` (65) | 667 | 722 |
| `a` (97) | 556 | 556 |
| `i` (105) | 222 | 278 |
| `W` (87) | 944 | 944 |
| cualquier dígito `0`-`9` | 556 | 556 |
| `Ñ` (0xD1, 209) | 722 | 722 |
| `é` (0xE9, 233) | 556 | 556 |

Y dos comprobaciones más: **los diez dígitos miden lo mismo** (si no, las tablas de números bailan),
y **ningún ancho es negativo**.

---

## 3 · Pieza 2 · Motor del PDF

`docs/pdf-motor-2026-08-14.js`

```js
construirPdf(elementos, opciones) -> { bytes: Buffer, paginas: number }
```

`opciones`: `{ titulo, autor }`. Ambos van al diccionario `/Info` del PDF.

**Constantes de página**, fijadas aquí para que no las decida nadie por su cuenta:

| Qué | Valor |
|---|---|
| Tamaño | A4 = `595.28 x 841.89` puntos |
| Márgenes | 56 pt los cuatro (≈ 2 cm) |
| Ancho útil | `595.28 - 112 = 483.28` pt |
| Cuerpo | Helvetica 10.5 pt, interlínea 14 pt |
| `titulo1` | Helvetica-Bold 14 pt, 18 pt de aire encima y 8 debajo |
| `titulo2` | Helvetica-Bold 11.5 pt, 12 encima y 5 debajo |
| Celdas de tabla | Helvetica 9.5 pt, interlínea 12, relleno 4 pt |
| Cabecera de tabla | Helvetica-Bold 9.5 pt |

**Lo que tiene que resolver el motor y no puede delegar:**

1. **Salto de línea por medida real**, usando la métrica de la pieza 1. Cortar por palabras; una
   palabra más larga que el ancho útil se corta a lo bruto en vez de desbordar.
2. **Salto de página automático** cuando ya no cabe la siguiente línea. Una fila de tabla **no se
   parte entre páginas**: si no cabe entera, salta.
3. **La cabecera de una tabla se repite** si la tabla continúa en la página siguiente.
4. **`WinAnsiEncoding`**: pasar el texto a bytes de un solo byte. Lo que no quepa en WinAnsi se cae,
   nunca se emite un byte que desplace nada. Es la misma regla que `aLatin1` del `.030`.
5. **Escapado del PDF**: `\` → `\\`, `(` → `\(`, `)` → `\)`. Sin esto, un paréntesis en el texto
   rompe el fichero entero.
6. **La `xref`**: la tabla de posiciones en bytes de cada objeto, con `%%EOF` y `startxref`. **Un
   offset mal por un byte y el PDF no abre.**

**Funciones que además hay que exportar, porque son las que se prueban solas:**

```js
anchoTexto(texto, negrita, tamano) -> number      // en puntos
cortarEnLineas(texto, negrita, tamano, anchoMax) -> string[]
aWinAnsi(texto) -> Buffer
escapar(texto) -> string
```

**Prohibido:** `require()` de cualquier módulo que no sea `Buffer`. El nodo de código de n8n no
tiene librerías. Nada de `zlib`: los flujos de contenido van **sin comprimir**.

---

## 4 · Pieza 3 · Datos y marcadores

`docs/informe-datos-2026-08-14.js`

```js
resolverDatos(fila) -> { ok: true, datos } | { ok: false, error: 'motivo en cristiano' }
```

`fila` es el objeto `fields` de un registro de Airtable, con los **nombres** de columna como claves
(no los `fld…`), que es lo que entrega el nodo Airtable de n8n.

### 4.1 · Las columnas de entrada, leídas del esquema vivo el 14/08

| Columna | id | Tipo | Valores |
|---|---|---|---|
| `Nombre empleado` | `fldbM4GIv1HH8jnJe` | texto | `HAMMAD` |
| `Apellidos empleado` | `fld7YYWr9tyjzHT8T` | texto | `Bellachhab` |
| `Nacionalidad` | `fldfqTiY9Oq6Qjo21` | singleSelect | 245 opciones en mayúsculas |
| `fechaDesplazamiento` | — | fecha | `2026-09-01` |
| `estadoCivil` | `fld6yynlRua4Q3pCc` | singleSelect | `soltero` `casado` `divorciado` `viudo` `pareja de hecho` |
| `Sexo` | `fldyaSIlmx8yPpTYY` | singleSelect | `Hombre` `Mujer` |
| `hijos` | `flduxxXYj7Bj3Dr1T` | singleSelect | `Tiene hijos` `No tiene hijos` |
| `Salario` | — | número | `345678` |
| `Propiedades` | `fldE0kXJeoIHAEZCJ` | singleSelect | 4 opciones, **una con errata** |
| `Inversiones` | `fld5J9AqQ0vTbKTku` | singleSelect | 4 opciones, bien escritas |
| `Situación fiscal Anio Desplazamiento` | `fldSPyJNpHZQMJjsX` | fórmula | **5 valores posibles** |
| `Situación fiscal AnioSiguiente` | `fldPGi58E0H4gGzad` | fórmula | 2 valores posibles |

**`AnioDesplazamiento` (`fld5zk8QWItUnbeyM`) NO SE USA.** Es `aiText`, no fórmula, y está en
`state:"error", errorType:"emptyDependency"`. Comprobado otra vez el 14/08. El año sale de
`year(fechaDesplazamiento)`.

**`Nombre completo` (`fldMa94F3bspmKHI6`) existe** y es
`CONCATENATE({Nombre empleado}, " ", {Apellidos empleado})`, pero devuelve `HAMMAD Bellachhab`:
hereda las mayúsculas de la celda. **No se usa tal cual**, se recapitaliza.

### 4.2 · Los 17 marcadores

| Marcador | De dónde sale | Formato exacto |
|---|---|---|
| `nombreCompleto` | `Nombre empleado` + ` ` + `Apellidos empleado` | Recapitalizado: `Hammad Bellachhab`. Partículas en minúscula (`de`, `del`, `la`, `las`, `los`, `y`, `da`, `dos`) salvo si van primeras |
| `paisOrigen` | `Nacionalidad` | **Capitalizado** con el mapa de presentación del §4.3 |
| `fechaDesplazamiento` | `fechaDesplazamiento` | `DD/MM/AAAA` |
| `fechaLlamada` | **no hay columna** | `Por confirmar`. Ver §6 |
| `estadoCivil` | `estadoCivil` × `Sexo` | Concordado y capitalizado. Ver §4.4 |
| `hijos` | `hijos` | `Tiene hijos` → `Sí` · `No tiene hijos` → `No` |
| `salarioBrutoAnual` | `Salario` | Miles con **punto**, sin decimales, **sin €**: `345.678` |
| `residenciaFiscal5Anios` | **constante** | `Sí`. Decisión 7 del 14/08: todo el que llega al informe pasó F3 |
| `sumaPropiedades` | `Propiedades` | La frase del select, con la **errata corregida** en presentación |
| `sumaInversiones` | `Inversiones` | La frase del select, tal cual |
| `anioDesplazamiento` | `year(fechaDesplazamiento)` | 4 dígitos, **sin separador de miles** |
| `situacionAnioDesplazamiento` | fórmula | Literal, sin tocar |
| `anioSiguiente` | derivado | Ver §5. 4 dígitos sin separador |
| `situacionAnioSiguiente` | fórmula | Literal, sin tocar |
| `anio` | derivado | Ver §5 |
| `rentasSujetas` | tabla fija por `bloque1` | §5.3 |
| `modeloYPlazo` | tabla fija por `bloque1` | §5.3, **texto largo** (decisión 10) |

### 4.3 · Mapa de presentación de países

Se añade a `docs/tabla-paises-iso2-2026-08-13.js` como `PAIS_PRESENTACION`, **sin tocar `PAIS_ISO`**,
que alimenta el `.030` y está probado 245/245.

- Clave: el nombre exacto de la opción de Airtable. Valor: cómo se imprime.
- `MARRUECOS` → `Marruecos` · `PAISES BAJOS` → `Países Bajos` · `ESPAÑA` → `España`
- **Las 26 con coma invertida se desinvierten**: `BOUVET, ISLA` → `Isla Bouvet`,
  `CHECA, REPUBLICA` → `República Checa`, `SALVADOR, EL` → `El Salvador`.
- **Las tres que no son países** (`BANCO CENTRAL EUROPEO`, `ORGANISMOS INTERNACIONALES`,
  `OTROS PAISES NO RELACIONADOS`) se presentan tal cual en minúscula capitalizada.
- Si una nacionalidad no está en el mapa, **se imprime la clave tal cual**. Nunca se aborta el
  informe por la capitalización de un país: es cosmético.

**Invariante de la prueba, y es la que hace que esto sea comprobable:** para las 219 claves sin coma,
`quitarAcentos(mayúsculas(presentación)) === clave`. Para las 26 con coma, el conjunto de palabras
tiene que ser el mismo a los dos lados. Así no se puede colar un país inventado.

### 4.4 · `estadoCivil` concordado con `Sexo`

Decisión 3 del 14/08.

| `estadoCivil` | `Sexo` = Hombre | `Sexo` = Mujer | `Sexo` vacío |
|---|---|---|---|
| `soltero` | Soltero | Soltera | Soltero |
| `casado` | Casado | Casada | Casado |
| `divorciado` | Divorciado | Divorciada | Divorciado |
| `viudo` | Viudo | Viuda | Viudo |
| `pareja de hecho` | Pareja de hecho | Pareja de hecho | Pareja de hecho |

`pareja de hecho` **es invariable** y no se concuerda. Ojo: esa opción **no existía el 06/08** y
ahora sí (`selZjRiXPEOov2bXp`), así que la creó el `typecast` o alguien a mano.

### 4.5 · La errata de `Propiedades`

Decisión 2 del 14/08: **mapa de presentación, no se toca Airtable.** Las cuatro opciones, copiadas
byte a byte del esquema vivo:

| Guardado en Airtable | Se imprime |
|---|---|
| `Tiene propiedades en España y no tiene propiedades en el extranjero` | igual |
| `Tiene propiedades en el extranjero y no tiene propiedades en España` | igual |
| `No tiene propiedades en España ni el extranjero` | `No tiene propiedades en España ni en el extranjero` ← **el «en» que falta** |
| `Tiene propiedades en España y en el extranjero` | igual |

`Inversiones` no lleva mapa: las cuatro están bien escritas.

### 4.6 · Las paradas: cuándo `ok:false`

Con motivo legible en cristiano, como los siete del `.030`. **Nunca se inventa un valor ni se elige
un bloque por defecto.**

| Caso | Motivo |
|---|---|
| `fechaDesplazamiento` vacía | `No se genera el informe: falta la fecha de desplazamiento, y sin ella no hay años ni bloques.` |
| `fechaDesplazamiento` no parseable | `No se genera el informe: la fecha de desplazamiento "X" no se entiende.` |
| Alguna de las dos fórmulas vacía | `No se genera el informe: la columna "…" está vacía. Eso significa que el dato aún no ha llegado, no que el cliente no tenga situación fiscal.` |
| Alguna de las dos fórmulas en `state:"error"` | `No se genera el informe: la columna "…" está en error (…).` |
| Valor de fórmula desconocido | `No se genera el informe: no reconozco la situación fiscal "X". Se para a propósito para no fabricar un dictamen fiscal.` |
| Falta `Nombre empleado` y `Apellidos empleado` | `No se genera el informe: falta el nombre del cliente.` |
| `Salario` vacío | `No se genera el informe: falta el salario bruto anual.` |

**Cómo viene una fórmula en error.** Airtable la entrega como objeto, no como texto:
`{ state: 'error', errorType: 'emptyDependency', value: null, isStale: false }`. Hay que detectarlo
**antes** de hacerle `trim()`, porque `String(objeto)` da `[object Object]` y eso pasaría por un
valor desconocido en vez de por un error.

---

## 5 · Pieza 4 · Cuerpo del informe

`docs/informe-cuerpo-2026-08-14.js`

```js
montarElementos(datos) -> elementos[]     // el IR del §1
```

El texto va **literal** de `docs/plantilla-informe-mobility-texto-2026-08-14.md`. No se reescribe,
no se resume, no se mejora el estilo. Es texto fiscal que va a un cliente.

### 5.1 · El montaje

```
CABECERA
  4 campos: Nombre · País de origen · Fecha de desplazamiento · Fecha de la reunión
  titulo2 'Notas e información proporcionada'
  parrafo 'Según la información que nos has facilitado:'
  lista de 6 items: estado civil, hijos, salario, residencia fiscal, propiedades, inversiones
  tabla 'Resumen' de 2 columnas y 4 filas
BLOQUE del año de desplazamiento   -> bloque1, con anio = anioDesplazamiento
BLOQUE del año siguiente           -> bloque2, con anio = anioDesplazamiento + 1
```

Si `bloque1 === bloque2` **se montan los dos igual**: son dos años y el cliente tiene que ver los
dos. No se deduplica.

### 5.2 · La regla de los años por ámbito de bloque (§1.1 de la spec)

**Es la trampa principal de todo el montaje.** `{{anio}}` y `{{anioSiguiente}}` valen cosas distintas
según dónde estén:

| Dónde | `{{anio}}` | `{{anioSiguiente}}` |
|---|---|---|
| Cabecera (fila «Situación en …») | — | `anioDesplazamiento + 1` |
| Bloque montado como **primero** | `anioDesplazamiento` | `anioDesplazamiento + 1` |
| Bloque montado como **segundo** | `anioDesplazamiento + 1` | `anioDesplazamiento + 2` |

El `{{anioSiguiente}}` del plazo del modelo 720, que vive dentro del Bloque A, **es el del ámbito de
su bloque**. Si el Bloque A se monta como segundo, ese plazo es `anioDesplazamiento + 2`.

**Una sustitución global sobre el documento entero deja mal ese plazo en la mitad de los casos.** Por
eso `montarElementos` resuelve cada bloque con su propio par de años y **no** hay un reemplazo final
sobre el texto ya montado.

### 5.3 · Las dos tablas fijas, por bloque

`rentasSujetas`:

| Bloque | Valor |
|---|---|
| A | `Renta mundial: todos los ingresos obtenidos en el año, con independencia del lugar en el que se hayan generado o pagado.` |
| B | `Únicamente las rentas obtenidas en España.` |
| C | `Rendimientos del trabajo desde la llegada; intereses, dividendos, ganancias patrimoniales y arrendamientos de fuente española. Las propiedades e inversiones situadas en el extranjero no tributan.` |

`modeloYPlazo` (texto **largo**, decisión 10):

| Bloque | Valor |
|---|---|
| A | `Modelo 100, entre los meses de abril y junio del año siguiente.` |
| B | `Modelo 210. El plazo depende del tipo de renta: salario, hasta el 20 de abril del año siguiente si sale a pagar; alquileres, hasta el 20 de abril del año siguiente; imputación de rentas, hasta el 31 de diciembre del año siguiente; transmisión de inmuebles, cuatro meses desde la transmisión.` |
| C | `Modelo 151, entre los meses de abril y junio del año siguiente. La solicitud del régimen se presenta con los modelos 030 y 149, dentro de los seis meses siguientes al alta en la Seguridad Social.` |

Los dos se toman de `bloque1`, el del año de desplazamiento. Decisión 6 del 14/08.

### 5.4 · Los dos defectos de la plantilla, que se tapan aquí

1. En «Desventajas del régimen» hay una **viñeta vacía** (`–` sola). **Se tira.**
2. La línea `La prestación por desempleo y las prestaciones por maternidad o paternidad tributan en su
   totalidad.` **se quedó sin viñeta** en el `.docx`: es un párrafo aparte. **Se monta como item de
   la lista**, que es donde va.
3. `La indemnización por despido no está exenta` **no lleva punto final**. Se le pone.

### 5.5 · El 50.000 del Bloque C no se toca

El Bloque C dice `resulta ventajoso a partir de unos 50.000 euros brutos anuales`. **Va literal.**
La decisión 5 del 14/08 ya contempló que el `.docx` dice 50.000 y que no manda para el enrutado del
bot. **No se reabre el umbral.**

### 5.6 · La guarda final

`montarElementos` recorre su propia salida y **lanza excepción si encuentra `{{` en cualquier texto**.
Un marcador sin resolver no puede llegar a un cliente.

---

## 6 · Lo que sigue abierto y NO lo decide el código

| # | Qué | Quién | Mientras tanto |
|---|---|---|---|
| 1 | **`{{fechaLlamada}}`** no tiene columna. La plantilla la llama «Fecha de la reunión» | Usuario | Se imprime `Por confirmar` |
| 2 | **El informe solo existe en español** y `Idioma` tiene opción `Ingles` (`selB0lkXu3bmepNM3`), que la automatización `3b` ya usa para mandar los borradores en inglés. Un cliente inglés recibiría una memoria fiscal en español | Fiscal | Se monta el español. El cuerpo se escribe para que quepa una variante sin tocar el motor |

---

## 7 · Salida del nodo de n8n

El nodo `Montar el informe` devuelve **un item por fila**, con esta forma exacta, calcada de la del
`.030` para que los nodos de subida sean iguales:

```js
// si se pudo
{ ok: true, recordId, nombreFichero: 'Informe Mobility - <Nombre Completo>.pdf',
  base64, bytes: <número de bytes del PDF> }
// si no
{ ok: false, recordId, error: 'motivo en cristiano' }
```

`base64` es el PDF entero en base64, que es lo que come el endpoint `uploadAttachment` de Airtable.
`contentType` en la subida: `application/pdf`.

---

## 8 · Addendum del 14/08 (tarde): título, idioma inglés y `FechaLlamada`

Cierra los cuatro puntos que el §6 dejaba abiertos. **Decisiones del usuario, no propuestas.**

### 8.1 · El documento lleva título

Elemento **nuevo** del IR, y el motor ya lo soporta (`titulo0` = Helvetica-Bold 18, sin aire
por encima, 14 pt por debajo):

```js
{ tipo: 'titulo0', texto: 'Reporte fiscal Mobility' }
```

Va **el primero** del array, y detrás un `parrafo` de subtítulo. Los textos exactos:

| Idioma | `titulo0` | subtítulo (`parrafo`) |
|---|---|---|
| `es` | `Reporte fiscal Mobility` | `Régimen especial de trabajadores desplazados (Ley Beckham) y obligaciones fiscales` |
| `en` | `Mobility Tax Report` | `Special regime for inbound workers (Beckham Law) and tax obligations` |

El título del `/Info` del PDF **no cambia**: sigue siendo `Informe de memoria fiscal — <nombre>`.

### 8.2 · Dos idiomas

`resolverDatos` añade **una clave más** a `datos`:

```js
datos.idioma   // 'es' | 'en'
```

Sale de la columna `Idioma` (`fld7z0pL1bjC8tTZd`, singleSelect): **`Ingles` → `'en'`, y CUALQUIER
OTRA COSA, incluido vacío, → `'es'`.** Es la misma regla que la automatización `3b`: el inglés es el
caso explícito y el español la rama por defecto, para que un `Idioma` vacío no se quede sin nada.

**Todos los valores de `datos` salen YA en el idioma de `datos.idioma`.** El cuerpo no traduce nada:
solo elige qué bloque de texto monta. Lo que cambia con el idioma:

| Clave | `es` | `en` |
|---|---|---|
| `estadoCivil` | `Casado` / `Casada` / … | `Married` / `Single` / `Divorced` / `Widowed` / `Registered partnership` |
| `hijos` | `Sí` / `No` | `Yes` / `No` |
| `residenciaFiscal5Anios` | `Sí` | `Yes` |
| `sumaPropiedades` · `sumaInversiones` | las 4 frases del select | traducidas, con la errata ya corregida |
| `situacionAnioDesplazamiento` · `situacionAnioSiguiente` | literal de la fórmula | traducción de los 5 y los 2 valores |
| `paisOrigen` | `PAIS_PRESENTACION` | `PAIS_PRESENTACION_EN` (§8.3) |
| `salarioBrutoAnual` | `345.678` (punto) | `345,678` (**coma**) |
| `rentasSujetas` · `modeloYPlazo` | §5.3 | traducidos |
| `fechaDesplazamiento` · `fechaLlamada` | `DD/MM/AAAA` | **igual**, `DD/MM/AAAA`: el cliente vive en España |

`bloque1` y `bloque2` siguen siendo `'A'`/`'B'`/`'C'` y **no dependen del idioma**.

**AVISO QUE HAY QUE DEJAR ESCRITO EN EL CÓDIGO:** el texto fiscal en inglés es una **traducción, no
un texto revisado por Fiscal**. Va marcado en la cabecera del bloque en inglés para que se pueda
revisar sin buscarlo.

### 8.3 · Nombres de país en inglés

Se añade `PAIS_PRESENTACION_EN` a `docs/tabla-paises-iso2-2026-08-13.js`, con **las mismas 245
claves**, y `paisPresentacionEn(nombre)` con la misma regla de última instancia: si no está, devuelve
la clave tal cual. Nunca `null`.

**El invariante NO puede ser el del §4.3** (quitar acentos y comparar) porque los nombres en inglés
son otras palabras. El invariante es **mejor**: cada valor tiene que ser el **nombre corto en inglés
de ISO 3166-1** para el código alfa-2 que `PAIS_ISO` ya tiene para esa clave. O sea, se verifica
contra un estándar, no contra el gusto de nadie. Las tres entradas sin ISO (`BANCO CENTRAL EUROPEO`,
`ORGANISMOS INTERNACIONALES`, `OTROS PAISES NO RELACIONADOS`) se traducen a mano y quedan exentas.

### 8.4 · Los cuatro nombres de país que necesitan «del» o «de los»

Decisión del usuario: **se ponen**, aunque rompan el invariante de «mismo conjunto de palabras».

| Clave | Antes | Ahora |
|---|---|---|
| `CONGO, REPUBLICA DEMOCRATICA` | `República Democrática Congo` | `República Democrática del Congo` |
| `OCEANO INDICO, TERRI.BRITANICO` | `Terri.Británico Océano Índico` | `Territorio Británico del Océano Índico` |
| `NAVIDAD, ISLA` | `Isla Navidad` | `Isla de Navidad` |
| `MENORES ALEJADAS EE.UU, ISLAS` | `Islas Menores Alejadas EE.UU` | `Islas Menores Alejadas de EE.UU.` |

La prueba **no se relaja en general**: estas cuatro claves van a una lista de excepciones explícita,
con su motivo. Las otras 241 siguen con el invariante estricto, que es lo que impide colar un país
inventado.

### 8.5 · `FechaLlamada`, el marcador 17

Columna nueva: **`FechaLlamada`** (`fldv69piH32yZP89O`, fecha, formato europeo). Comprobado el 14/08
contra el esquema vivo: **no existía ninguna columna de fecha de reunión** en toda la base.

`resolverDatos` la lee y la imprime en `DD/MM/AAAA`. **Si está vacía imprime `Por confirmar` (`To be
confirmed` en inglés) y el informe SIGUE SALIENDO**: no se aborta un informe fiscal por la fecha de
una reunión.

El dato lo recoge el bot. Los otros tres sitios (parámetro de la tool, whitelist del validador y
línea del prompt) van fuera de estas piezas y se aplican en `beckham_bot`.

---

## 9 · Addendum 2 del 14/08: logo, tipografía seria y título centrado

Decisiones del usuario. **El motor cambia; el cuerpo y los datos NO se tocan.**

### 9.1 · Tipografía: se pasa de Helvetica a Times

Un documento fiscal se lee mejor con serifa, y **Times-Roman y Times-Bold son dos de las 14 fuentes
base del PDF**, igual que Helvetica: **no se incrusta nada**. Solo hace falta su tabla de anchos.

Pieza nueva `docs/metrica-times-2026-08-14.js`, calcada de la de Helvetica:
`ANCHOS_TIMES` y `ANCHOS_TIMES_BOLD`, 256 códigos de WinAnsi, unidades de 1/1000 de em.

**Invariantes del estándar** (los de Times, que NO son los de Helvetica):

| Carácter | Times-Roman | Times-Bold |
|---|---|---|
| espacio (32) | 250 | 250 |
| `A` (65) | 722 | 722 |
| `a` (97) | 444 | 500 |
| `i` (105) | 278 | 278 |
| `W` (87) | 944 | 1000 |
| cualquier dígito | 500 | 500 |
| `Ñ` (0xD1) | 722 | 722 |
| `é` (0xE9) | 444 | **444** |
| `e` (101) | 444 | 444 |

> **CORREGIDO SOBRE LA MARCHA, y el error era mío.** La primera versión de esta tabla ponía
> `é = 500` en Times-Bold, porque asumí que la `é` seguía a la `a` (que en Times-Bold **sí**
> mide 500). No: **la `é` mide lo que la `e`**, y la `e` mide 444 en las dos. Comprobado contra
> `/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf`, que da 444 para las dos y
> coincide con el AFM de Adobe en los otros siete invariantes de esta tabla. Si el invariante
> se hubiera escrito con el 500, la prueba habría marcado en rojo una tabla correcta.

Y el mismo cotejo contra la fuente del sistema que ya existe para Helvetica, con
`/System/Library/Fonts/Times.ttc` o `/Library/Fonts/Times New Roman.ttf`.

**Tamaños nuevos.** La Times tiene la altura de la x más pequeña que la Helvetica, así que al mismo
cuerpo se lee más pequeña. Se sube:

| Qué | Antes (Helvetica) | Ahora (Times) |
|---|---|---|
| cuerpo | 10.5 / interlínea 14 | **11 / 15** |
| `titulo0` | Bold 18 | **Bold 19** |
| `titulo1` | Bold 14 | **Bold 14.5** |
| `titulo2` | Bold 11.5 | **Bold 12** |
| celdas | 9.5 / 12 | **9.5 / 12.5** |

**El cambio va en UN SITIO.** El motor selecciona la tabla de anchos y el `/BaseFont` por dos
constantes, no repartido por el código:

```js
const PDF_FUENTE_REGULAR = 'Times-Roman';
const PDF_FUENTE_NEGRITA = 'Times-Bold';
```

Volver a Helvetica tiene que ser cambiar esas dos líneas y las cinco de tamaños. Si hay que tocar
diez sitios, está mal hecho.

### 9.2 · Centrado

Bandera **opcional** en los elementos de texto:

```js
{ tipo: 'titulo0', texto: '...', centrado: true }
{ tipo: 'parrafo', texto: '...', centrado: true }
```

La `x` de cada línea sale de `(ANCHO_UTIL - anchoTexto(linea)) / 2 + MARGEN`, línea a línea, para que
un título de dos líneas quede centrado de verdad y no en bloque. **Sin la bandera, todo sigue
alineado a la izquierda exactamente como está hoy**: el cuerpo del informe no cambia ni un punto.

Solo el `titulo0` y su subtítulo la llevan.

### 9.3 · El logo

Elemento **nuevo** del IR, y va el primero del array, delante del `titulo0`:

```js
{ tipo: 'logo' }
```

Se dibuja **centrado**, a `LOGO_ANCHO_PT` de ancho, con el alto calculado para no deformarlo nunca:
`alto = ancho * LOGO_ALTO_PX / LOGO_ANCHO_PX`.

Los datos están en la pieza `docs/logo-taxdown-2026-08-14.js`, que va **concatenada primera de
todas**: `LOGO_JPEG_BASE64`, `LOGO_ANCHO_PX` (400), `LOGO_ALTO_PX` (79) y `LOGO_ANCHO_PT` (132).

**Cómo se mete en el PDF, y por qué así:**

- Un objeto `/XObject /Subtype /Image` con `/Filter /DCTDecode`, `/ColorSpace /DeviceRGB`,
  `/BitsPerComponent 8`, y **el flujo son los bytes del JPEG TAL CUAL**. Sin comprimir, sin
  predictor, sin inflar nada. Es el único camino que no necesita librería.
- El objeto va en `/Resources /XObject << /Logo 7 0 R >>` de **cada página** (o de un `/Resources`
  compartido), y se dibuja con `q <ancho> 0 0 <alto> <x> <y> cm /Logo Do Q`.
- `/Length` en **bytes**, como los demás flujos.
- **El JPEG tiene que ser BASELINE.** `/DCTDecode` no lee progresivo. El de la pieza es SOF0,
  comprobado leyendo sus marcadores.
- **Un solo objeto de imagen para todo el PDF**, aunque el logo se dibuje una vez: si algún día se
  repite en cada página, no se duplican 12 KB por página.

**Si `LOGO_JPEG_BASE64` no está en el ámbito** (por ejemplo probando el motor solo), el elemento
`logo` **se salta sin lanzar**: un informe sin logo es un informe; un informe que no se genera, no.
Eso es distinto de la métrica, que sí lanza, porque sin anchos no se puede ni medir una línea.
