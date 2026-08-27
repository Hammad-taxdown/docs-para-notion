# Estructura canónica de los documentos del bot Beckham

> **T050 / precondición de T036 (WP-235, rellenar los modelos 030 y 149).**
> Escrito el **10/08/2026** leyendo el estado real: el subworkflow `beckham_analizar_documento`
> (`ONhveViBeiI6GXWd`), el bloque de documentos de `Validar y Normalizar` (líneas 719-754) y el
> esquema de `Empleados` (`app5K8OnSObqwWweS` / `tblTWCWu5nQXNOMR1`).
> No es un diseño nuevo: es **poner por escrito el contrato que ya existe**, cerrar sus huecos y
> dejar dicho qué se valida en cada documento para que se valide siempre igual.

## Por qué hace falta

Hoy cada documento se trata de una forma distinta y esa forma **solo vive en el prompt del lector**.
Consecuencias que ya han pasado, las dos con fecha:

- **07/08 mañana** — `AutorizacionEmpresa` quedó vacía porque el agente etiquetó el anexo como
  `contrato`. El validador no podía cazarlo: `contrato` es un tipo válido y el fichero era bueno.
  Lo que estaba mal era **la intención**, no el dato, y devolvió `ok:true` con `descartados:null`.
- **07/08 mediodía** — el bot detectó que la fecha de alta del documento (13/07/2026) no cuadraba con
  la declarada (01/04/2026), lo dijo en voz alta y **no quedó escrito en ninguna parte**.
  (Cerrado el 10/08 con la columna `DiscrepanciaFechaAlta`.)

Sin una estructura canónica, la pieza 3 del diseño de documentos —rellenar los modelos— tendría que
adivinar de dónde sale cada campo.

## Las tres piezas, y dónde encaja esto

1. **Leer** → `beckham_analizar_documento`, tool del agente. Devuelve **texto**.
2. **Guardar** → el adjunto va a su columna según `tipo_documento` (opción B: se reutilizan las
   columnas de fichero que ya existen).
3. **Rellenar** → los modelos 030 y 149. **No construido** (T036 / WP-235).

Este documento define el contrato de **1** y **2** para que **3** sea posible.

---

## 1 · Los 9 tipos canónicos

`tipo_documento` es la clave que manda el agente. La whitelist está en `Validar y Normalizar`
línea 723 (`COLUMNA_POR_TIPO`) y **solo acepta estas nueve**. Lo que no esté aquí se descarta con
`tipo_documento=<valor> (tipo desconocido)`.

| `tipo_documento` | Columna de Airtable | Formato real que llega | Cómo se lee |
|---|---|---|---|
| `dni` | `DNI` | PNG / foto, a veces PDF | Visión (`imageDetail: high`) |
| `pasaporte` | `Pasaporte` | PNG / foto | Visión |
| `contrato` | `Contratotrabajo` | PDF | Responses API, mensaje `file` |
| `alta_ss` | `AltaSeguridadSocial` | PDF | Responses API |
| `autorizacion_empleado` | `AutorizacionEmpleado` | **DOCX** o PDF | DOCX **no se lee**; PDF sí |
| `autorizacion_empresa` | `AutorizacionEmpresa` | PDF | Responses API |
| `enisa` | `CertificadoEnisa` | PDF | Responses API |
| `apostilla` | `Apostilla` | PDF | Responses API |
| `visado` | `Visado` | PDF o imagen | Según extensión |

**Regla del DOCX, decidida el 6/08 y se mantiene:** no se intenta leer. Su contenido es la plantilla
propia de TaxDown y ya se conoce. Se guarda, se agradece y **no se vuelve a pedir**.

---

## 2 · Qué se extrae de cada documento

Lo que hoy pide el lector (idéntico en `Leer_PDF` y `Leer_Imagen`), formalizado. La regla general
es **no transcribir lo que el cliente ya ha dicho**: el número de documento, el domicilio y el
teléfono ya están en el expediente y releerlos solo puede introducir errores en datos correctos.

| Documento | Campos a extraer | Para qué sirve |
|---|---|---|
| `contrato` | Nombre de la empresa · CIF · fecha de inicio · salario si consta | Alimenta `NombreEmpleador`, `CIFEmpleador` |
| `alta_ss` | **La fecha de alta** | Es el dato que decide el plazo de 6 meses (F2/F3). Alimenta `FechaAlta` y se contrasta con `fecha_alta_ss` |
| `autorizacion_empleado` | Si está **firmada** o no | Requisito de tramitación |
| `autorizacion_empresa` | Si está **firmada** o no · fecha de inicio · lugar de trabajo | Requisito de tramitación |
| `dni` · `pasaporte` | **Solo nombre y apellidos.** El número NO | Comprobar que el documento es del cliente |
| `enisa` · `apostilla` · `visado` | Solo identificación del documento | Prueba de la vía de acceso |

**Regla de lo ilegible, y no se negocia:** si un dato está borroso, cortado o no aparece, se escribe
`ILEGIBLE` o `NO CONSTA`. **Nunca se adivina.** Un dato inventado en un documento que va a Hacienda
es peor que un hueco.

---

## 3 · Criterio de aceptación y de rechazo

Esto es lo que hoy **no estaba escrito** y es la causa del fallo del 07/08.

**Se acepta** cuando la etiqueta que devuelve el lector **coincide con el documento que se acaba de
pedir**. No basta con que el fichero sea legítimo.

**Se rechaza** cuando la etiqueta no coincide. Y al rechazar:

1. Se dice con suavidad y se pide el correcto, nombrando los dos:
   *"esto parece un contrato de trabajo; para este paso necesito el documento de alta en la
   Seguridad Social"*.
2. **Hace falta una subida nueva. Siempre.** La palabra del cliente no sustituye a un fichero.
3. **No se cambia `tipo_documento` para que encaje.** Ese fue exactamente el fallo del 07/08: el
   agente decidió que el anexo "en realidad era un contrato", lo archivó como contrato y le dijo al
   cliente que lo guardaba como documento de empresa. El validador no puede detectarlo.
4. Si el cliente no lo tiene ahora, se deja **PENDIENTE por escrito** y se sigue con el siguiente.

**Discrepancias de fecha:** si la fecha de alta del documento no coincide con la declarada, se avisa
en el chat, se ofrece la llamada **aunque el caso fuera claro**, y se manda
`discrepancia_fecha_alta` con el formato `Declarada DD/MM/AAAA vs documento DD/MM/AAAA`.
**No bloquea, no descarta y no para el flujo.** Quién decide qué fecha vale es una persona.

---

## 4 · Huecos encontrados al escribir esto

Los cuatro son reales y salen de comparar el lector con el escritor. Ninguno estaba fichado.

### 4.1 · El `NIE` no tiene tipo propio · **el más importante**

El lector puede devolver la etiqueta **`NIE`** —está en su lista de once— pero
`COLUMNA_POR_TIPO` **no tiene la clave `nie`**. Solo hay `dni` y `pasaporte`.

Consecuencia: si el agente manda `tipo_documento=nie`, se descarta con *"tipo desconocido"* y
**el fichero no se guarda**, devolviendo `ok:true`. Hoy funciona por casualidad, porque el prompt
habla de "NIE o pasaporte" y el agente ha estado eligiendo `dni`.

**Dos salidas.** Añadir `nie: 'DNI'` a la whitelist (una línea, sin cambio de esquema), o quitar
`NIE` de las etiquetas del lector. **Recomendada la primera:** es más barata y tolera que el agente
sea preciso en vez de castigarlo por ello.

### 4.2 · Dos adjuntos en un turno: uno se pierde en silencio

Tanto el lector (`Elegir_Documento`) como el escritor (línea 746) cogen **el último adjunto**. El
lector al menos avisa en su texto (*"había más de un fichero legible y solo he leído el último"*),
pero **el escritor no dice nada**: guarda el último y el otro desaparece.

### 4.3 · La URL de los adjuntos caduca

Ya fichado como **T041**: las URLs de Intercom llevan `expires` y caducan en ~36 minutos. Hoy
funciona porque Airtable descarga en el instante de la escritura, pero un reintento tardío
encontraría la URL muerta, y **una URL muerta deja la celda vacía devolviendo `ok:true`**.

### 4.4 · La autorización del empleado en DOCX no se puede verificar

Por diseño no se lee, así que **nunca se puede confirmar que esté firmada** — que es justo el único
dato que había que extraer de ella. No es un bug: es el precio de la decisión del 6/08. Queda dicho
para que nadie espere ese dato en el expediente.

---

## 5 · Lo que esto habilita para T036 (modelos 030 y 149)

Campos del expediente que ya existen y de dónde salen. **La primera columna es lo que hay**, no lo
que exige el formulario oficial.

| Dato | Columna | Origen |
|---|---|---|
| Nombre y apellidos | `Nombre empleado` · `Apellidos empleado` | Conversación (D1) |
| NIF / NIE | `NIF` | Conversación (D3), con letra de control validada |
| Pasaporte | `PasaporteNumero` | Conversación (D3) |
| Fecha de nacimiento | `FechaNacimiento` | Conversación (D6) |
| Sexo | `Sexo` | Conversación (D10) |
| Nacionalidad | `Nacionalidad` | Conversación (D4) — distinta de `PaisNacimiento` |
| País de nacimiento | `PaisNacimiento` | Conversación (D7) |
| Municipio y provincia de nacimiento | dos columnas propias | Conversación (D8) |
| Domicilio | `Tipo de vía` · `Nombre de la calle` · `Número` · `Planta` · `Puerta` · `Codigo Postal` | Conversación (D5), atómico: los tres obligatorios o ninguno |
| Último país de residencia | `UltimoPaisResidencia` | Conversación (D9) |
| Fecha de desplazamiento | `fechaDesplazamiento` | Conversación |
| Empleador y CIF | `NombreEmpleador` · `CIFEmpleador` | **Del contrato**, campos de IA |
| Fecha de alta oficial | `FechaAlta` | **Del alta en la SS**, campo de IA |
| Año de desplazamiento | `AnioDesplazamiento` | Campo de IA |

> ⚠️ **Sin verificar, y hay que cerrarlo antes de construir T036:** esta tabla dice qué datos
> **tenemos**, no qué campos **exige** cada formulario. La lista real de casillas de los Modelos 030
> y 149 hay que contrastarla contra los formularios oficiales de la AEAT. Si falta alguna casilla que
> el expediente no recoge, es **campo nuevo = cinco sitios** (corregido el 27/08/2026; aquí decía
> «tres»: la regla probada de `CLAUDE.md` §5 es tool + validador + mapeo del Upser + prompt +
> **lector**, más el caché del `singleSelect` si toca opciones) y toca antes de escribir una línea del
> subworkflow.

## 6 · Pendiente de tu aprobación

1. **El `nie` de 4.1** — ¿se añade `nie: 'DNI'` a la whitelist? Es una línea.
2. **Los dos adjuntos de 4.2** — ¿se avisa cuando llega más de uno, o se acepta perderlo?
3. **Las casillas reales de los 030/149** — hace falta contrastarlas contra los formularios oficiales.
