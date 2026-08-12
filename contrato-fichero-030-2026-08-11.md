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

## ACTUALIZACIÓN DEL 12/08 · tres muestras, casi todo confirmado

Llegaron **dos muestras más** (datos inventados). Las tres miden **exactamente 1481 + 1181**, y el
diff posición a posición cierra casi todas las inferencias. Lo de abajo **ya no es inferencia**.

### Confirmado por las tres muestras

| Qué | Resultado |
|---|---|
| **Cabecera 2–9** | `20250203` **idéntica en las tres → es una constante**, no un dato |
| **Causas, posiciones 160 / 162 / 164** | `S` `S` `S` en las tres → **constantes**. Son las casillas 107, 103 y 105 |
| **Posición 172 + fecha de efectos 1390–1397** | **Van juntas.** Muestras 1 y 3: `S` y fecha (`01012027`, `01012026`). Muestra 2 (nacionalidad `ES`): **sin marca y `00000000`**. Confirma que 172 es la **casilla 201, residente fiscal**, y que 217 solo se rellena si está marcada |
| **Provincia (900–901) = 2 primeros dígitos del CP** | `28015`→`28`, `43002`→`43`, `46021`→`46`. **3 de 3.** No hace falta columna |
| **Código de tipo de vía (709–713)** | `00000` en las tres → **no hace falta tabla de códigos de vía** |

### El primer y segundo apellido, ya sin dudas

La muestra 2 lo zanja: **`PERAIRE`** en 236–285 y **`LORES`** en 286–335. Dos campos de **50**.

**Y hay un detalle que se habría escapado:** en la **cabecera** (pos 20–119) los dos apellidos van
**juntos en un solo campo**, `PERAIRE LORES`; en el **apartado 2** van **separados**. El mismo dato
se escribe de las dos formas en el mismo fichero.

### Tabla de posiciones cerrada

| Pos. | Largo | Contenido | Muestras |
|---|---|---|---|
| 2–9 | 8 | Cabecera, constante | `20250203` |
| 10–18 | 9 | NIF | |
| 20–119 | 100 | Apellidos **juntos** | `PERAIRE LORES` |
| 120–159 | 40 | Nombre | `ALESSANDRO VICENTE` |
| 160/162/164 | 1 | Causas 107/103/105, constantes | `S` |
| 172 | 1 | Casilla 201, residente fiscal | `S` / vacío |
| 223–224 | 2 | Nacionalidad ISO-2 | `MA` `ES` `IT` |
| 225 | 1 | Sexo | `V` `M` `V` |
| 226–234 | 9 | NIF | |
| **236–285** | **50** | **Primer apellido** | `PERAIRE` |
| **286–335** | **50** | **Segundo apellido** | `LORES` |
| 336–360 | 25 | Nombre | |
| 361–368 | 8 | Fecha de nacimiento `DDMMAAAA` | `16041994` |
| 369–373 | 5 | Código INE municipio nacimiento | `12027` Benicarló · `00000` si extranjero |
| 374–403 | 30 | Municipio de nacimiento | `BENICARLÓ` |
| 404–405 | 2 | Código provincia nacimiento | `12` · `00` si extranjero |
| 406–435 | 30 | Provincia de nacimiento | `CASTELLON DE LA PLANA` |
| 436–437 | 2 | País de nacimiento ISO-2 | `MA` `ES` `VE` |
| 704–708 | 5 | Tipo de vía, **texto libre** | `CALLE` · `C` |
| 709–713 | 5 | Código de tipo de vía, **siempre cero** | `00000` |
| 714–763 | 50 | Nombre de la vía | `BARO DE LES IV TORRES` |
| 764–766 | 3 | Constante | `NUM` |
| 767–771 | 5 | Número, ceros a la izquierda | `00017` |
| 860–864 | 5 | Código postal | `43002` |
| 865–869 | 5 | Código INE municipio residencia | `43148` |
| 870–899 | 30 | Municipio de residencia | `TARRAGONA` |
| 900–901 | 2 | Provincia = 2 primeros del CP | `43` |
| 1390–1397 | 8 | Fecha de efectos residencia `DDMMAAAA` | `01012027` |

`T030020` repite el bloque de domicilio con **−702** y lleva la fecha de la declaración en 697–704.

---

## ACTUALIZACIÓN DEL 12/08 (2) · cinco muestras · DOS CORRECCIONES

Llegaron dos muestras más. Con cinco, dos cosas que di por buenas **eran falsas**.

### CORRECCIÓN 1 · la cabecera 2–9 NO es una constante: es la VERSIÓN del formato

Con tres muestras salía `20250203` en las tres y lo declaré constante. **Con cinco no lo es:**

| Muestra | Versión |
|---|---|
| 1, 2, 3, 4 | `20250203` |
| **5** | **`20190101`** |

Es la **versión del diseño del registro**, y hay al menos dos vivas. Antes de generar nada hay que
saber **cuál acepta hoy la sede**.

### CORRECCIÓN 2 · la «incidencia de la Agencia Tributaria» NO es de la Agencia Tributaria

Esto es lo gordo. El correo que la automatización `3. Envio borradores` manda hoy a los clientes dice:

> «por una incidencia técnica de la Agencia Tributaria, en el borrador del modelo 030 **el nombre y
> los apellidos aparecen en una misma casilla**. Es solo un error de descarga y no afecta a la
> presentación.»

**Se puede ver en el fichero, y no es de la AEAT.** Comparando la cabecera de las cinco:

| Muestra | Versión | Apellidos (20–119) | Nombre (120–159) |
|---|---|---|---|
| 1 | `20250203` | `BELLACHHAB` | `HAMMAD` |
| 2 | `20250203` | `PERAIRE LORES` | `CATERINA` |
| 3 | `20250203` | `DI CAPRIO` | `ALESSANDRO VICENTE` |
| 4 | `20250203` | `BOSSERT` | `MAXIMILIAN` |
| **5** | **`20190101`** | **`PIÑA BARRIOS SARA MARGOTH`** | **vacío** |

La muestra 5 mete **apellidos y nombre concatenados en la casilla de apellidos** y deja la de nombre
**vacía**. Las otras cuatro los separan bien.

Y el **apartado 2 está bien en las cinco**, incluida la 5: `PIÑA` / `BARRIOS` / `SARA MARGOTH`.

**Conclusión:** el defecto está **solo en la cabecera** y **solo en la versión `20190101`**. Es del
generador, no de Hacienda, y **desaparece solo** si se emite en `20250203` rellenando 20–119 y
120–159 por separado. Hoy se le está pidiendo perdón al cliente por un fallo propio y evitable.

### Provincia = 2 primeros dígitos del CP · ahora 5 de 5

`28015`→`28` · `43002`→`43` · `46021`→`46` · `08038`→`08` · `28045`→`28`. Sin excepciones.

### La casilla 201 confirmada por la nacionalidad

| Muestra | Nacionalidad | Marca 172 | Fecha de efectos |
|---|---|---|---|
| 1 | `MA` | `S` | `01012027` |
| **2** | **`ES`** | **vacía** | **`00000000`** |
| 3 | `IT` | `S` | `01012026` |
| 4 | `DE` | `S` | `01012026` |
| 5 | `VE` | `S` | `01012023` |

**La única española es la única sin marca y sin fecha.** Van atadas, como se dijo.

### El envoltorio `<T030000000A0000>`, que solo trae la muestra 5

La muestra 5 pesa 3.368 bytes y las otras 2.700. La diferencia **no es un registro más**: es un
**envoltorio** que abre antes de `T030010` y cierra al final:

```
<T030000000A0000>
  <AUX>0000000000000 Z0589116EPIÑ     S …hasta 300…</AUX>
  <VECTOR>010020FIN …relleno…</VECTOR>
  <T030010>…1481…</T030010>
  <T030020>…1181…</T030020>
</T030000000A0000>
```

`<AUX>` lleva el NIF y las tres primeras letras del primer apellido. `<VECTOR>` dice **`010020FIN`**,
que se lee como los **sufijos de los registros presentes** — `010` y `020`, o sea `T0300**10**` y
`T0300**20**` — cerrados por `FIN`.

**Va con la versión vieja:** lo trae la `20190101` y no lo traen las cuatro de `20250203`.
**Pregunta abierta: ¿la sede exige el envoltorio o no?** No se decide por mayoría de muestras.

### La zona del domicilio, ya casi cerrada

| Muestra | Posiciones con dato |
|---|---|
| 1 | `2` en **778**, `C` en **787** |
| 2 | todo en blanco |
| 3 | `5` en **784**, `14` en **787–788** |
| 4 | `2` en **784**, `A` en **787** |
| 5 | `6` en **784**, `D` en **787** |

**787 = Puerta**, y ocupa **al menos 2 caracteres** (la muestra 3 lleva `14`).
**784 = Planta**, un carácter, en tres muestras independientes y en las dos versiones del formato.
**778 = otro subcampo sin identificar** (bloque, portal o escalera): solo lo usa la muestra 1, así que
lo más probable es que ese caso no tenga planta y sí uno de los otros tres.

Para lo que necesitamos basta: **Planta → 784, Puerta → 787**.

### Lo que sigue sin identificar

La posición **1406**: ` `, `4`, `4`, ` `, `1` en las cinco. Varía y no se correlaciona con nada
observado.

### Lo único que sigue sin resolver (redacción anterior, ya superada en parte)

**Las posiciones 772–790**, o sea calificador de número, bloque, portal, escalera, planta y puerta.
No se puede cerrar con estas muestras porque **solo dos tienen algo y usan subcampos distintos**:

- Muestra 1: `2` en **778**, `C` en **787**.
- Muestra 3: `5` en **784**, `14` en **787–788**.
- Muestra 2: todo en blanco.

Lo que sí se deduce: **la puerta empieza en 787 y ocupa al menos 2 caracteres**. Lo de 778 y 784 no
se puede asignar sin equivocarse, y **esto va a Hacienda**, así que no se adivina. Hace falta **una
muestra con planta, puerta, bloque y escalera rellenos a la vez**, o mirar el PDF con las casillas
etiquetadas al lado.

También sigue sin identificar la posición **1406** (`4` en las muestras 2 y 3, vacío en la 1).
