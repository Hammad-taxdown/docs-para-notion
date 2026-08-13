# Especificación de montaje · Informe Mobility (memoria fiscal) · 13/08/2026

> **Qué es esto.** El contrato de montaje del informe de memoria fiscal que se genera al cerrar el
> expediente: de dónde sale cada uno de los 17 marcadores, con qué formato se imprime, y cómo se
> elige el bloque de texto. Es el paso de `WP-236` de *spec* a *construible*.
>
> **Continúa la ficha `WP-236` de `docs/prds/fase2/map.html`** y el PRD
> `docs/prds/fase2/WP-236-informe-mobility.md`. Lo que allí ya está decidido no se repite:
> el montaje es **cabecera + bloque del año de desplazamiento + bloque del año siguiente**, los tres
> bloques son **A) Residente fiscal · B) No residente fiscal · C) Régimen especial (Beckham)**, y
> `{{paisOrigen}}` = `Nacionalidad` (decisión del usuario del 11/08).

**Plantilla analizada:** `[MOB] Bloques informe Mobility (1).docx`.
**Recuento exacto, contado sobre `word/document.xml`: 17 marcadores distintos en 19 apariciones.**
`{{anio}}` aparece **dos** veces (una en el Bloque A y otra en el B) y `{{anioSiguiente}}` **dos**
veces (cabecera y Bloque A, modelo 720). Eso no es cosmético: ver §1.1.

**Convención de este documento.** `VERIFICADO` = nombre de columna leído en un documento del
proyecto que cita la lectura por MCP del esquema vivo, con su `fld…` cuando consta.
`INFERENCIA` = lo deduzco y **hay que comprobarlo contra el esquema antes de construir**.
`FALTA` = no existe origen.

---

## 1 · Los 17 marcadores

### 1.1 Regla previa: dos marcadores dependen de *dónde* se imprimen, no del cliente

`{{anio}}` y `{{anioSiguiente}}` **no son constantes del documento**: se resuelven contra la
instancia de bloque en la que están.

| Marcador | Dónde aparece | Qué vale ahí |
|---|---|---|
| `{{anio}}` | dentro del bloque (A y B) | el año **de esa instancia**: `anioDesplazamiento` en el primer bloque, `anioSiguiente` en el segundo |
| `{{anioSiguiente}}` | cabecera (fila «Situación en …») | `anioDesplazamiento + 1` |
| `{{anioSiguiente}}` | Bloque A, plazo del modelo 720 | **el año siguiente al `{{anio}}` de esa instancia**, o sea `anioDesplazamiento + 2` si el Bloque A se montó como segundo bloque |

**Si el renderizador hace una sustitución global sobre el documento entero, el plazo del 720 sale mal
en la mitad de los casos.** La sustitución tiene que ser **por ámbito de bloque**: primero se
resuelven los marcadores de cada instancia de bloque con su año, y después los de la cabecera.

### 1.2 Tabla de origen y formato

| # | Marcador | Origen | Estado | Formato de salida |
|---|---|---|---|---|
| 1 | `{{nombreCompleto}}` | `Nombre completo` | **INFERENCIA** | Texto tal cual. Ver nota A |
| 2 | `{{paisOrigen}}` | `Nacionalidad` (`fldfqTiY9Oq6Qjo21`, singleSelect, 245 opciones) | VERIFICADO | **Capitalizar**. La celda guarda `MARRUECOS`, no `Marruecos`. Ver nota B |
| 3 | `{{fechaDesplazamiento}}` | `fechaDesplazamiento` (Date) | VERIFICADO | **DD/MM/AAAA**. La celda es fecha; el escritor la manda como `AAAA-MM-DDT12:00:00.000Z` |
| 4 | `{{fechaLlamada}}` | — | **FALTA** | DD/MM/AAAA (propuesto). Ver §4 |
| 5 | `{{estadoCivil}}` | `estadoCivil` (singleSelect) | VERIFICADO | **Capitalizar inicial**. La celda guarda `casado` en minúscula y en masculino. Ver nota C |
| 6 | `{{hijos}}` | `hijos` (singleSelect: `Tiene hijos` / `No tiene hijos`) | VERIFICADO | **Traducir a `Sí` / `No`**. Ver nota D |
| 7 | `{{salarioBrutoAnual}}` | `Salario` (Number) | VERIFICADO | **Número con separador de miles por punto, sin decimales y SIN símbolo.** El « euros» ya está escrito en la plantilla: `{{salarioBrutoAnual}} euros` |
| 8 | `{{residenciaFiscal5Anios}}` | — | **FALTA** | Texto de frase. Ver §4 y nota E |
| 9 | `{{sumaPropiedades}}` | `Propiedades` (singleSelect, **4** opciones) | VERIFICADO | **Lleva errata en una opción.** Ver nota F |
| 10 | `{{sumaInversiones}}` | `Inversiones` (singleSelect, **4** opciones) | VERIFICADO | Bien escrita, se imprime tal cual |
| 11 | `{{anioDesplazamiento}}` | **derivado**: `year(fechaDesplazamiento)` | VERIFICADO como derivación | **Cuatro dígitos, SIN separador de miles** (`2026`, nunca `2.026`). Ver nota G |
| 12 | `{{situacionAnioDesplazamiento}}` | `Situación fiscal Anio Desplazamiento` (`fldSPyJNpHZQMJjsX`, fórmula) | VERIFICADO | Literal de la fórmula, sin tocar |
| 13 | `{{anioSiguiente}}` | **derivado**: ver §1.1 | derivación | Cuatro dígitos, sin separador |
| 14 | `{{situacionAnioSiguiente}}` | `Situación fiscal AnioSiguiente` (fórmula) | VERIFICADO | Literal de la fórmula, sin tocar |
| 15 | `{{anio}}` | **derivado**: ver §1.1 | derivación | Cuatro dígitos, sin separador |
| 16 | `{{rentasSujetas}}` | **derivado del bloque elegido** (tabla fija, §3) | derivación | Texto de celda de tabla |
| 17 | `{{modeloYPlazo}}` | **derivado del bloque elegido** (tabla fija, §3) | derivación | Texto de celda de tabla |

**Recuento: 13 con origen (11 de columna o derivación de columna, 2 de tabla fija en código) · 2 sin
origen (`{{fechaLlamada}}`, `{{residenciaFiscal5Anios}}`) · 2 pendientes de confirmar el nombre
exacto de columna (`{{nombreCompleto}}`, y la semántica de `{{sumaPropiedades}}`/`{{sumaInversiones}}`,
nota F).**

#### Notas

**A · `Nombre completo` es inferencia, no está verificado.**
La auditoría del CSV de `Empleados` del 21/07 lista una columna llamada **`Nombre completo`** como
primera del grupo de identidad, pero **ningún documento posterior la vuelve a citar** y el escritor
no la escribe: escribe `Nombre empleado` y `Apellidos empleado` (contrato del 03/08, verificado).
Es muy probable que `Nombre completo` sea el *primary field* y/o una fórmula de concatenación, pero
**no lo he verificado contra el esquema vivo y no lo doy por bueno.**
**Regla segura hasta comprobarlo:** `{{nombreCompleto}} = trim(Nombre empleado + " " + Apellidos empleado)`,
que sí son dos columnas verificadas y las escribe el bot. Si al comprobar resulta que
`Nombre completo` existe y viene relleno, se usa esa y se ahorra la concatenación.

**B · La `Nacionalidad` está en mayúsculas y esto es una decisión, no un detalle.**
Las 245 opciones se guardan en **mayúsculas sin acentos, salvo tres excepciones literales:
`ESPAÑA`, `CURAÇAO` y `PAISES BAJOS (PARTE CARIBEÑA)`** (verificado el 13/08 al construir
`docs/tabla-paises-iso2-2026-08-13.js`). Imprimir `País de origen: MARRUECOS` en un documento que el
cliente va a guardar es feo. Capitalizar bien requiere una tabla de presentación (`PAISES BAJOS` →
`Países Bajos`, con sus tildes), **que no existe hoy**. Opciones: (a) imprimir en mayúscula tal cual,
coste cero; (b) añadir una columna de presentación a `docs/tabla-paises-iso2-2026-08-13.js`, que ya
tiene las 245 claves exactas y es el sitio natural. **Es decisión de negocio, no técnica.**

**C · `estadoCivil` guarda `soltero` / `casado` / `divorciado` / `viudo`, todo en minúscula y en
masculino** (verificado por MCP el 06/08). Para el informe hay que capitalizar la inicial. **El
género no se puede arreglar desde el dato** — la columna no lo distingue — aunque `Sexo` sí existe:
si se quiere «Casada», es una regla de presentación que cruza `estadoCivil` con `Sexo`. Decisión de
negocio.
**Aviso adicional:** el 10/08 se añadió `pareja de hecho` a la whitelist del validador, pero el log
del 06/08 dice que esa opción **no existía en el singleSelect de Airtable**. Con `typecast: true`
encendido, el primer cliente con pareja de hecho **crea la opción sola**. No es un problema del
informe, pero el informe la va a imprimir.

**D · `hijos` es un select de dos frases, no un número.**
La plantilla dice `– Hijos: {{hijos}}.` → sustituido en crudo sale **«Hijos: Tiene hijos.»**.
La regla mínima es `Tiene hijos → Sí` / `No tiene hijos → No`. **El número de hijos no está en
ninguna columna**: el 07/08 el cliente dijo «Si, 3» y en la celda quedó `Tiene hijos`; el 3 se
perdió. Si el informe debe decir cuántos, es columna nueva.

**E · `{{residenciaFiscal5Anios}}` no tiene dato, solo tiene *motivo de descarte*.**
Lo único que existe es la opción `'No residente ultimos 5 años'` del singleSelect **`Descarte`**
(`fldcEq4ts2Vyqzg5b`), verificada en `docs/parches-validar-normalizar-2026-07-31.md`.
**No sirve como origen, y no es una cuestión de nombre**: `Descarte` solo se rellena cuando el
cliente **se cae del embudo**, y el informe se genera precisamente para los que **no** se cayeron.
En una fila que llega al informe esa columna está vacía por diseño. Es campo nuevo. Ver §4.

**F · `sumaPropiedades` / `sumaInversiones` se llaman «suma» pero el dato no es una suma.**
`Propiedades` e `Inversiones` son **singleSelect de frases cerradas**, no importes
(verificado por MCP el 06/08). **No existe ninguna columna con el valor económico de las propiedades
ni de las inversiones** — no la he encontrado en ningún inventario del proyecto. Dos lecturas
posibles y hay que zanjarla antes de construir:
1. El marcador está mal nombrado y lo que se espera es la frase (`Tiene propiedades en España y en
   el extranjero`). **Es lo único construible hoy** y encaja con el texto de la plantilla
   («– Propiedades: {{sumaPropiedades}}.»).
2. Se esperaba un importe agregado. Entonces son **dos columnas nuevas** y dos preguntas nuevas del
   bot.
   Asumo la lectura 1 en el resto del documento, **marcada como inferencia**.

   **Trampa de dato que hay que respetar al imprimir. CORREGIDO EL 13/08 CONTRA EL ESQUEMA VIVO:**

   > La primera redacción de esta sección decía que la errata estaba en `Inversiones`, que las dos
   > columnas tenían **5 opciones** y que había **espacios parásitos** al principio y al final.
   > **Las tres cosas eran falsas.** Comprobado con `get_table_schema` el 13/08: las dos columnas
   > tienen **4 opciones**, sin espacios sobrantes, y la errata está en la OTRA columna.

   - **`Propiedades` SÍ tiene una errata**, y se imprimiría tal cual en el documento del cliente:

     | Opción | |
     |---|---|
     | `No tiene propiedades en España ni el extranjero` | ❌ **falta el «en»** |

   - **`Inversiones` está bien escrita**: `No tiene inversiones en España ni en el extranjero`.

   - **Ninguna de las dos tiene espacios sobrantes.** El `trim()` no hace daño, pero no es
     obligatorio por este motivo.

   Para la errata de `Propiedades`, dos salidas: arreglar la opción en Airtable —acción de UI, y
   hay que cambiar **a la vez** la whitelist del validador o se rompe— o un mapa de presentación en
   el renderizador. **Recomiendo el mapa de presentación**: no toca producción y es reversible.
   - **La opción huérfana ya no existe.** Esta sección decía que había **5 opciones** y que
     `selY2sxAXSQyCwq3Q` duplicaba a otra. Eso venía del log del 10/08, cuando era cierto (era la
     tarea `T046`). **Contra el esquema vivo del 13/08 hay 4 y solo 4**, así que la huérfana se
     borró en algún momento y el renderizador solo tiene que cubrir esas cuatro.
   - Curiosidad sin consecuencia: `Propiedades` e `Inversiones` **comparten los cuatro identificadores
     de opción** (`selazWCDvrSgE2j8r`, `selCOjF1LVk4szFcS`, `selqDGh5vS0lYp8yL`, `selLNxM6jD0Gn5mjs`),
     señal de que una se creó duplicando la otra. No afecta a nada, pero explica de dónde salió la
     errata: se copió el texto y se cambió «propiedades» por «inversiones» a mano, y en la opción
     equivocada se perdió el «en».

**G · `{{anioDesplazamiento}}` NO se lee de la columna `AnioDesplazamiento`. Este es el punto más
peligroso de todo el montaje.**
`AnioDesplazamiento` **es un campo `aiText`, no una fórmula**, y se ha visto en
`state:"error", errorType:"emptyDependency"` porque lee de adjuntos vacíos (verificado el 10/08 y
recogido en `REANUDAR-2026-08-12.md` y en el propio PRD de WP-236). Un campo de IA en error **no
devuelve un valor, devuelve un objeto de error**, y el informe saldría con un hueco o con basura.
**Regla: `{{anioDesplazamiento}} = year(fechaDesplazamiento)`**, que es una columna Date verificada,
que escribe el bot y que ya alimenta a las dos fórmulas de situación fiscal. `AnioDesplazamiento`
**no se usa en el informe**.

---

## 2 · La regla de elección de bloque

Dos columnas de fórmula, un bloque cada una, en este orden: primero el del año de desplazamiento,
después el del año siguiente.

```
FUNCIÓN elegirBloque(valorSituacion):
    v = trim(texto(valorSituacion))

    SI v == ""  O  v es null  O  esError(valorSituacion):
        DEVOLVER BLOQUE_INDETERMINADO          // no se monta nada: se aborta, ver abajo

    SEGÚN v:
        "Régimen Especial (Beckham)"  -> DEVOLVER BLOQUE_C   // régimen especial
        "Residente Fiscal"            -> DEVOLVER BLOQUE_A   // residente fiscal
        "No residente UE"             -> DEVOLVER BLOQUE_B   // no residente
        cualquier otro                -> DEVOLVER BLOQUE_DESCONOCIDO


PROCEDIMIENTO montarInforme(fila):
    // ── 0. Precondiciones. Si falla alguna, NO se genera el documento. ──────────
    SI fila.fechaDesplazamiento está vacía:
        ABORTAR("sin fecha de desplazamiento no hay años ni bloques")

    anioDesp = year(fila.fechaDesplazamiento)
    anioSig  = anioDesp + 1

    b1 = elegirBloque(fila["Situación fiscal Anio Desplazamiento"])
    b2 = elegirBloque(fila["Situación fiscal AnioSiguiente"])

    SI b1 es INDETERMINADO o DESCONOCIDO  O  b2 es INDETERMINADO o DESCONOCIDO:
        ABORTAR + AVISAR a Slack vía beckham_alertas con el recordId,
                 los dos valores crudos y cuál de los dos falló.
        // NUNCA elegir un bloque por defecto. Un informe con el régimen fiscal
        // equivocado es peor que no mandar informe: el cliente lo va a guardar.

    // ── 1. Cabecera ─────────────────────────────────────────────────────────────
    render(CABECERA, {
        anioDesplazamiento: anioDesp,
        anioSiguiente:      anioSig,          // aquí SÍ es anioDesp + 1
        ...los 8 marcadores de datos del cliente...
        rentasSujetas: TABLA_RENTAS[b1],      // ver §3 y el aviso de más abajo
        modeloYPlazo:  TABLA_MODELO[b1]
    })

    // ── 2. Los dos bloques, cada uno con SU año ────────────────────────────────
    render(bloque(b1), { anio: anioDesp, anioSiguiente: anioDesp + 1 })
    render(bloque(b2), { anio: anioSig,  anioSiguiente: anioSig  + 1 })

    // ── 3. Guarda final, la que exige la verificación de WP-236 ────────────────
    SI el documento resultante contiene la subcadena "{{":
        ABORTAR + AVISAR    // ningún {{...}} literal puede llegar al cliente

    // ── 4. Aprobación humana antes de enviar (riesgo declarado en el PRD) ──────
    dejar en estado "pendiente de revisión", NO enviar automáticamente
```

**Qué pasa si una fórmula viene vacía o en error: se aborta y se avisa. No hay bloque por defecto.**
La razón es concreta y está en el log: el 05/08 `Situación fiscal Anio Desplazamiento` devolvía
**cadena vacía** mientras `fechaDesplazamiento` estaba sin rellenar, y empezó a devolver
`Residente Fiscal` en cuanto llegó la fecha. O sea, **el vacío de esa fórmula es un dato que aún no
ha llegado**, no un caso de negocio. Montar un bloque «por defecto» ahí es fabricar un dictamen
fiscal a partir de una celda vacía.

**Dos avisos sobre la elección de bloque que no están cerrados:**

1. **Solo conozco tres valores vivos** — `Régimen Especial (Beckham)`, `Residente Fiscal`,
   `No residente UE` — y los tres son los que cita el PRD. **No he verificado si la fórmula puede
   devolver un cuarto valor** para el no residente extracomunitario. La plantilla no lo necesita
   (el Bloque B cubre UE y extra-UE en la misma tabla de tipos), pero `elegirBloque` tiene que
   reconocerlo o abortará con un caso legítimo. **Comprobar la definición de las dos fórmulas antes
   de construir.**
2. **`Situación fiscal AnioSiguiente` depende de `AplicaBeckham`, y `AplicaBeckham` lo mueve el
   checkbox «quiero acogerme»** (verificado: `quiere_acogerse='si'` → `AplicaBeckham` marcado → la
   fórmula pasa de `Residente Fiscal` a `Régimen Especial (Beckham)`). **Si el informe se genera
   antes de que el cliente conteste esa pregunta, sale el bloque equivocado.** El informe se genera
   en `3. Pte hacer informe`, que es posterior, así que el orden es correcto — pero es una dependencia
   real y hay que dejarla escrita.

---

## 3 · Las tablas fijas de `{{rentasSujetas}}` y `{{modeloYPlazo}}`

**Estos dos marcadores no son del cliente: son del bloque.** Van en código, no en Airtable. Los
textos de abajo están **extraídos del propio cuerpo de la plantilla**, no redactados de nuevo: cada
uno cita la frase de su bloque.

### `{{rentasSujetas}}`

| Bloque | Valor |
|---|---|
| **A · Residente fiscal** | «Renta mundial: todos los ingresos obtenidos en el año, con independencia del lugar en el que se hayan generado o pagado.» |
| **B · No residente** | «Únicamente las rentas obtenidas en España.» |
| **C · Régimen especial (Beckham)** | «Rendimientos del trabajo desde la llegada; intereses, dividendos, ganancias patrimoniales y arrendamientos **de fuente española**. Las propiedades e inversiones situadas en el extranjero no tributan.» |

*Fuente literal en la plantilla: A → «obligados a declarar y pagar impuestos por su renta mundial,
esto es, por todos los ingresos obtenidos en el año con independencia del lugar en el que se hayan
generado o pagado»; B → «Los contribuyentes no residentes tributan únicamente por las rentas
obtenidas en España»; C → tabla «Rentas sujetas y tipos aplicables» + «Si tienes propiedades o
inversiones en el extranjero, no tributan bajo este régimen especial».*

### `{{modeloYPlazo}}`

| Bloque | Valor |
|---|---|
| **A · Residente fiscal** | «Modelo 100, entre los meses de abril y junio del año siguiente.» |
| **B · No residente** | «Modelo 210. El plazo depende del tipo de renta: salario, hasta el 20 de abril del año siguiente si sale a pagar; alquileres, hasta el 20 de abril del año siguiente; imputación de rentas, hasta el 31 de diciembre del año siguiente; transmisión de inmuebles, cuatro meses desde la transmisión.» |
| **C · Régimen especial (Beckham)** | «Modelo 151, entre los meses de abril y junio del año siguiente. La solicitud del régimen se presenta con los modelos 030 y 149, dentro de los seis meses siguientes al alta en la Seguridad Social.» |

*Fuente literal: A → «La declaración es el modelo 100 y se presenta entre los meses de abril y junio
del año siguiente»; B → «Todas las declaraciones se presentan mediante el modelo 210» + la tabla
«Tipo de renta / Plazo de presentación»; C → «La declaración anual es el modelo 151 y se presenta
entre los meses de abril y junio del año siguiente» + «El régimen se solicita mediante los modelos
030 y 149, dentro de los seis meses siguientes al alta en la Seguridad Social».*

> **El caso B no cabe en una línea y eso es un problema de diseño, no de redacción.** La plantilla
> resuelve el plazo del no residente con una tabla de cinco filas dentro del bloque; la celda de la
> cabecera solo admite una frase. El texto de arriba es un resumen fiel pero **es más largo que las
> otras dos celdas**. Si el equipo fiscal prefiere una línea corta («Modelo 210, plazo según el tipo
> de renta — ver el detalle más abajo»), es cambio de una constante. **Decisión de negocio.**

### El agujero de la cabecera: una sola fila para dos años

La cabecera tiene **una** fila de «Rentas sujetas» y **una** de «Declaración y plazo», pero el
informe monta **dos** bloques que pueden ser bloques distintos (el caso típico: `No residente UE` en
el año de llegada y `Régimen Especial (Beckham)` en el siguiente). **La plantilla no dice cuál de los
dos va en el resumen.**

El pseudocódigo de §2 usa `b1` (el año de desplazamiento) porque es el orden en que se lee el
documento, **pero es una elección mía, no una regla verificada**. Las tres salidas posibles:
(a) el del año de desplazamiento; (b) el del año siguiente, que es el régimen «de crucero» y el que
más le importa al cliente; (c) las dos, con la fila partida en dos y el año delante de cada una —
que es lo que hacen las dos filas de «Situación en …» justo encima. **Recomiendo (c) por coherencia
con la propia tabla, pero lo decide Fiscal.**

---

## 4 · Qué falta para poder construirlo

### 4.1 Columna nueva (= tres sitios: tool + validador + mapeo de Airtable)

| Qué | Para qué marcador | Nota |
|---|---|---|
| **`FechaLlamada`** (Date), nombre propuesto | `{{fechaLlamada}}` | La plantilla la llama «Fecha de la reunión». No existe ninguna columna de fecha de reunión. **Antes de crearla, comprobar si la fecha de la llamada agendada ya vive en el sistema de agenda** — el bot cierra con `MotivoCierre = Llamada agendada`, y si el hueco lo asigna un calendario externo, la fecha puede llegar de ahí en vez de preguntarse. |
| **`ResidenciaFiscal5Anios`** (singleSelect o texto), nombre propuesto | `{{residenciaFiscal5Anios}}` | El bot **ya hace la pregunta** (es el filtro F3, y de ahí sale la opción `'No residente ultimos 5 años'` de `Descarte`), pero **la respuesta no se guarda en ninguna parte cuando el cliente pasa el filtro**. Es exactamente el patrón que ya ha costado cuatro incidentes en este proyecto: el camino existe y nadie lo usa. **Es el único marcador que requiere columna nueva de verdad**, porque el dato ya se pronuncia en la conversación. |

Y **un cuarto sitio** para los dos, si se quiere que el bot sea reentrante: el lector
(`Formatear Respuesta Expediente`) devuelve **21 claves de 52**, y ninguna de las que usa este
informe salvo las básicas. Un cliente que vuelve al día siguiente se ve preguntar otra vez lo que ya
dijo (auditoría externa, §3.2).

### 4.2 Decisión de negocio (no se construye hasta que alguien la firme)

| # | Decisión | Quién | Bloquea |
|---|---|---|---|
| 1 | **`{{sumaPropiedades}}` / `{{sumaInversiones}}`: ¿frase del select o importe agregado?** | Fiscal | Si es importe, son **dos columnas nuevas más** y dos preguntas nuevas del bot. Nota F |
| 2 | **La errata de la opción de `Propiedades`** (`'…en España ni el extranjero'`, falta el «en»): ¿se corrige en Airtable o se tapa con un mapa de presentación? | Usuario | Corregirla en Airtable es **tres sitios** (opción + whitelist del validador + comprobar filas existentes). El mapa de presentación no toca producción |
| 3 | **`{{residenciaFiscal5Anios}}`: ¿qué frase se imprime?** | Fiscal | No basta con guardar un sí/no: la plantilla espera una frase que se lee en un documento formal |
| 4 | **Cabecera: ¿el resumen refleja el año de desplazamiento, el siguiente, o los dos?** | Fiscal | §3, agujero de la cabecera |
| 5 | **`{{paisOrigen}}` en mayúsculas o capitalizado** | Usuario | Si capitalizado, hay que añadir una columna de presentación a `docs/tabla-paises-iso2-2026-08-13.js` |
| 6 | **`{{estadoCivil}}`: ¿se concuerda el género cruzando con `Sexo`?** | Usuario | Nota C |
| 7 | **¿Se dice el número de hijos?** | Fiscal | Hoy no está en ninguna columna. Si se dice, es columna nueva |
| 8 | **Texto corto o largo para `{{modeloYPlazo}}` del Bloque B** | Fiscal | §3 |

### 4.3 Verificar contra el esquema vivo antes de escribir una línea de código

Cinco comprobaciones, todas de lectura, todas de un minuto. **Ninguna se puede saltar**: cuatro de
las cinco han producido ya un fallo silencioso en este proyecto.

1. **¿Existe `Nombre completo`, con ese nombre exacto, y viene rellena en las filas que llegan al
   informe?** Si no, concatenar `Nombre empleado` + `Apellidos empleado` (nota A).
2. **Los valores exactos que devuelven las dos fórmulas de situación fiscal.** Leer su definición,
   no una fila de ejemplo: hay que saber si existe un cuarto valor para el no residente extra-UE
   (§2, aviso 1).
3. **`AnioDesplazamiento` sigue en `emptyDependency`** — confirmarlo y dejar por escrito en el
   código que **no se usa** (nota G).
4. **Las 4 opciones literales de `Propiedades` y de `Inversiones`**, copiadas byte a byte al mapa
   de presentación, con la errata de `Propiedades` corregida solo en la presentación (nota F).
5. **Si `pareja de hecho` ya existe como opción de `estadoCivil`** o si la va a crear el `typecast`
   del primer cliente que la diga (nota C).

---

## 5 · Coherencia con `WP-239`, que no es opcional

La descripción del parámetro `resumen` de `guardar_datos_cliente` ya le dice al agente que *«este
texto se reutiliza como base del informe fiscal que se le enviará»*, y `WP-239` va a hacer que
`ResumenBot` lleve una ficha con 18 etiquetas fijas. **Ocho de esas etiquetas son los mismos datos
que los marcadores de este informe** (nacionalidad, fecha de llegada, salario, estado civil, hijos…).

**Si la ficha del resumen y el informe leen de sitios distintos, habrá dos verdades sobre el mismo
cliente en dos documentos que se mandan el mismo día.** La regla es: **el informe lee de las
columnas, siempre; `ResumenBot` no es fuente de nada.** El resumen es prosa generada por un modelo;
las columnas son dato validado por `Validar y Normalizar`. Un informe fiscal no se monta a partir de
la prosa de un LLM.
