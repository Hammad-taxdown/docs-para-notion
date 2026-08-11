# Contrato del fichero `.030` de la AEAT · 11/08/2026

Sustituye al enfoque de «rellenar un PDF», que **queda descartado**: el modelo se presenta como
**fichero `.030`**, el fiscal lo sube a la sede de Hacienda y **es Hacienda quien genera el PDF**.
El PDF nunca fue el entregable.

## Qué es el formato

**No es XML.** Es el formato **posicional de ancho fijo** clásico de la AEAT, envuelto en dos
etiquetas. Dos registros, rellenos de espacios hasta su longitud exacta:

```
<T030010>…1481 caracteres…</T030010><T030020>…1181 caracteres…</T030020>
```

Sin saltos de línea. Fichero completo: 2.700 bytes. Nombre del fichero: `<NIF>.030`.

**Prueba estructural de que el troceado es correcto:** el bloque de domicilio aparece en los dos
registros con un **desplazamiento constante de 702 posiciones**, y las seis subposiciones encajan
exactamente (704→2, 764→62, 778→76, 787→85, 860→158, 900→198). Eso no sale por casualidad.

Contrastado además contra el PDF de prueba que devuelve Hacienda: coincide campo a campo.

---

## Registro 1 · `T030010` (1481 caracteres)

| Pos. | Largo | Contenido | Casilla | Origen en `Empleados` |
|---|---|---|---|---|
| 2–9 | 8 | `20250203` · cabecera/versión del modelo | — | **constante** ⚠️ confirmar |
| 10–18 | 9 | NIF del declarante | 01 | `NIF` |
| 20–119 | 100 | Apellidos ⚠️ probablemente **2×50** | 02 | `Apellidos empleado` |
| 120–159 | 40 | Nombre | 03 | `Nombre empleado` |
| **160** | 1 | Causa · marca `S` | **107** | constante `S` |
| **162** | 1 | Causa · marca `S` | **103** | constante `S` |
| **164** | 1 | Causa · marca `S` | **105** | constante `S` |
| **172** | 1 | Marca `S` | **201** residente fiscal ⚠️ | derivable |
| 223–224 | 2 | **Nacionalidad, código ISO-2** (`MA`) | 205 | `Nacionalidad` **+ tabla** |
| 225 | 1 | **Sexo** (`V`) | 206 | `Sexo` **+ tabla** |
| 226–234 | 9 | NIF del interesado | 207 | `NIF` |
| 236–285 | 50 | **Primer apellido** | 208 | ⚠️ hueco |
| 286–335 | 50 | **Segundo apellido** | 209 | ⚠️ hueco |
| 336–360 | 25 | Nombre | 210 | `Nombre empleado` |
| 361–368 | 8 | Fecha de nacimiento `DDMMAAAA` | 211/212/213 | `FechaNacimiento` |
| 369–373 | 5 | **Código INE del municipio de nacimiento** (`00000` si extranjero) | — | ⚠️ tabla |
| 374–403 | 30 | Municipio de nacimiento | 214 | `Municipio de Nacimiento` |
| 404–405 | 2 | **Código de provincia de nacimiento** (`00` si extranjero) | — | ⚠️ tabla |
| 406–435 | 30 | Provincia de nacimiento | 215 | `Provincia de Nacimiento` |
| 436–437 | 2 | **País de nacimiento, ISO-2** (`MA`) | 216 | `PaisNacimiento` **+ tabla** |
| 704–708 | 5 | Tipo de vía (`CALLE`) | 411 | `Tipo de vía` **+ tabla** |
| 709–713 | 5 | Código de tipo de vía | — | ⚠️ tabla |
| 714–763 | 50 | Nombre de la vía | 412 | `Nombre de la calle` |
| 764–766 | 3 | Tipo de numeración (`NUM`) | 413 | constante |
| 767–771 | 5 | Número, con ceros a la izquierda (`00018`) | 414 | `Número de tu domicilio` |
| 778 | 1 | Planta | 419 | `Planta` |
| 787 | 1 | Puerta | 420 | `Puerta` |
| 860–864 | 5 | Código postal | 423 | `Codigo Postal` |
| 865–869 | 5 | **Código INE del municipio** (`28079`) | — | ⚠️ hueco + tabla |
| 870–899 | 30 | Nombre del municipio | 424 | ⚠️ hueco |
| 900–901 | 2 | **Código de provincia** (`28`) | 425 | ⚠️ hueco + tabla |
| 1390–1397 | 8 | **Fecha de efectos residencia fiscal** `DDMMAAAA` | 217 | **derivada**, ver abajo |

## Registro 2 · `T030020` (1181 caracteres)

Repite el bloque de domicilio con el mismo troceado (posiciones −702) y añade:

| Pos. | Largo | Contenido |
|---|---|---|
| 697–704 | 8 | Fecha de la declaración `DDMMAAAA` |

---

## La casilla 217, explicada por el usuario (11/08)

Eres residente fiscal si pasas **más de 183 días** en España, o sea si te desplazas **antes del
1 de julio**. Si te desplazas **después**, entras en el ejercicio siguiente.

- `fechaDesplazamiento` ≤ 30/06/AAAA → residente ese mismo año.
- `fechaDesplazamiento` ≥ 01/07/AAAA → **casilla 217 = `0101` + (AAAA+1)**.

En la muestra: desplazamiento en el segundo semestre de 2026 → **`01012027`**. Encaja.

**Ojo:** la columna `Situación fiscal Anio Desplazamiento` ya tiene esta misma regla dentro
(su descripción cita «183 días / 1 de julio»). **Hay que leer esa fórmula y reutilizar su lógica,
no escribir una segunda**, o habrá dos verdades que se contradigan.

---

## Lo que de verdad cuesta: el fichero quiere CÓDIGOS, Airtable guarda NOMBRES

Este es el hallazgo que cambia el tamaño de WP-235. No es «faltan columnas», es que **hacen falta
tablas de conversión**:

| Dato | Airtable | El `.030` quiere |
|---|---|---|
| Nacionalidad | `MARRUECOS` (245 opciones) | `MA` · **ISO-2** |
| País de nacimiento | `RUSIA` (245 opciones) | ISO-2 |
| Sexo | `Hombre` | `V` |
| Municipio de residencia | *no existe* | nombre **+ código INE de 5 dígitos** (`28079`) |
| Provincia de residencia | *no existe* | **código de 2 dígitos** (`28`) |
| Tipo de vía | `CALLE` | nombre + **código** |

La tabla de países son **245 filas × 3 listas**. La de municipios son **más de 8.000 códigos INE**
y no se inventa: se descarga del INE.

## Lo que YA NO hace falta

- **Apartado 3, el cónyuge: no se rellena.** Decisión del usuario del 11/08. Se cae el hueco de
  17 campos.
- **Apartado 4, teléfono y correo: no aparecen en el fichero.** Se cae el hueco del teléfono
  partido en prefijo y número.
- **Casillas 413, 415–418, 421, 422, 428, 430:** vacías en la muestra real.

## Huecos que quedan vivos

1. **208/209 · primer y segundo apellido.** Dos campos de 50. Confirmado por el fichero, no
   inferido. Sigue siendo el defecto que el correo de la automatización le cuenta hoy al cliente
   como «incidencia de la Agencia Tributaria».
2. **424 · municipio de residencia**, y su código INE. No existe en `Empleados`.
3. Las **tablas de conversión** de la sección anterior.

### Un hueco que se cae solo: la provincia (casilla 425)

**No hace falta columna.** En España los **dos primeros dígitos del código postal son el código
de provincia**, y la muestra lo confirma: `28015` → `28` = Madrid, que es exactamente lo que lleva
la posición 900–901. Se deriva de `Codigo Postal`, que ya existe. Un hueco menos.

Con el municipio no vale el mismo truco: un código postal puede abarcar varios municipios y un
municipio varios códigos postales, así que ni el nombre ni el código INE se deducen del CP.

## Lo que falta para poder construir sin adivinar

**Un segundo fichero `.030` con datos distintos**, y a ser posible de alguien con **dos
apellidos** y de **otra provincia**. Con una sola muestra no se puede distinguir el borde de un
campo del relleno de espacios: el troceado de arriba está apoyado en la repetición del bloque de
domicilio y en el PDF, pero los anchos exactos de apellidos y nombre son **inferencia**.
Con dos muestras se cierran por diferencia y sin margen de error.

Pendiente también de confirmar: qué es la cabecera `20250203` y a qué casilla corresponde la
cuarta marca de la posición 172 (la hipótesis es la 201, residente fiscal).
