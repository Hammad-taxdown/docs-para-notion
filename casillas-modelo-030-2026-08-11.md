# Casillas del Modelo 030 y de dónde sale cada dato · 11/08/2026

> **SUPERADO EN PARTE, LA MISMA TARDE.** Este documento sigue valiendo como **inventario de las
> casillas del modelo** y de qué columna sale cada dato, pero su sección 4 («la decisión que
> bloquea») ya no aplica: el entregable **no es un PDF**, es el fichero `.030` de texto posicional.
> El contrato bueno para construir está en **`contrato-fichero-030-2026-08-11.md`**. Empieza por ahí.

Cierra **T050b** y desbloquea **WP-235** (`T036`). Alcance recortado por decisión del usuario del
11/08: **solo el 030**. El 149 lo preparan los fiscales a mano y sale del alcance del bot.

## Cómo se ha obtenido

Leyendo el texto de **dos PDF del propio modelo**, no de una fuente de internet: el borrador
generado en producción y el `Modelo_030_vacio.pdf`. Las dos extracciones coinciden casilla a
casilla, así que la lista no depende de una sola lectura.

**HALLAZGO QUE CAMBIA LA ESTRATEGIA: ninguno de los dos PDF es rellenable.** Ni `AcroForm`, ni
`XFA`, ni un solo `/Widget`, ni un solo `/FT`. Son renders planos. **No hay campos que rellenar
programáticamente**, así que "rellenar el PDF" no es una vía posible y WP-235 necesita otra
(ver «La decisión que bloquea» al final).

---

## 1 · Datos que el expediente YA tiene

Cabecera repetida en cada página: **01** NIF · **02** Apellidos · **03** Nombre.

### Apartado 2 · Datos identificativos del interesado

| Casilla | Etiqueta | Columna de `Empleados` | Nota |
|---|---|---|---|
| 201 / 202 | Residente / NO residente fiscal en España | *derivable* | de `Situación fiscal Anio Desplazamiento` |
| 203 | NIF de otros países / CIF Estado residencia | **❌ no existe** | |
| 204 | Nº pasaporte | `PasaporteNumero` | ✅ |
| **205** | **Nacionalidad** | `Nacionalidad` | ✅ Es el `{{paisOrigen}}` del informe Mobility, confirmado por el usuario el 11/08 |
| 206 | Sexo | `Sexo` | ✅ |
| 207 | NIF | `NIF` | ✅ |
| **208** | **Primer apellido** | ⚠️ `Apellidos empleado` | **hueco 1** |
| **209** | **Segundo apellido** | ⚠️ `Apellidos empleado` | **hueco 1** |
| 210 | Nombre | `Nombre empleado` | ✅ |
| 211 / 212 / 213 | Día / Mes / Año de nacimiento | `FechaNacimiento` | ✅ se parte en tres al montar |
| 214 | Municipio de nacimiento | `Municipio de Nacimiento / Birth Municipality` | ✅ |
| 215 | Provincia de nacimiento | `Provincia de Nacimiento / Province of Birth` | ✅ |
| 216 | País de nacimiento | `PaisNacimiento` | ✅ |
| 217 | Fecha de efectos residencia fiscal | ⚠️ | **hueco 4**, decisión fiscal |

### Apartado 5 · Domicilio fiscal en España

| Casilla | Etiqueta | Columna | Nota |
|---|---|---|---|
| 411 | Tipo de vía | `Tipo de vía / Type of road` | ✅ |
| 412 | Nombre de la vía pública | `Nombre de la calle / Name of street` | ✅ |
| 413 | Tipo Num. | ❌ | opcional |
| 414 | Núm. casa | `Número de tu domicilio / House Number` | ✅ |
| 415 | Calif. num. | ❌ | opcional |
| 416 | Bloque | ❌ | opcional |
| 417 | Portal | ❌ | opcional |
| 418 | Escalera | ❌ | opcional |
| 419 | Planta | `Planta` | ✅ |
| 420 | Puerta | `Puerta` | ✅ |
| 421 | Complemento domicilio | ❌ | opcional |
| 422 | Localidad / Población | ❌ | opcional (si difiere del municipio) |
| 423 | C. Postal | `Codigo Postal` | ✅ |
| **424** | **Nombre del Municipio** | **❌ no existe** | **hueco 2** |
| **425** | **Provincia** | **❌ no existe** | **hueco 2** |
| 428 / 430 | Indicador y Referencia catastral | ❌ | no aplica |

### Apartado 4 · Teléfonos y direcciones electrónicas

| Casilla | Etiqueta | Columna | Nota |
|---|---|---|---|
| **426** | **Prefijo país** | ⚠️ `NumeroTelefono` | **hueco 3** |
| **427** | **Tlfo. móvil para avisos** | ⚠️ `NumeroTelefono` | **hueco 3** |
| 429 | Correo electrónico para avisos | `email` | ✅ |

### Apartado 9 · Estado civil

| Casilla | Etiqueta | Columna | Nota |
|---|---|---|---|
| 801 / 802 / 803 / 804 | Soltero / Casado / Viudo / Divorciado o separado legalmente | `estadoCivil` | ✅ mapeable |
| **805** | **Fecha de adquisición del estado civil actual** | **❌ no existe** | **hueco 6** |

---

## 2 · Los ocho huecos

Todo hueco es **campo nuevo = tres sitios**: tool `guardar_datos_cliente` + validador
`Validar y Normalizar` + mapeo del nodo `Airtable Upser Expediente`. Olvidar el tercero
falla en silencio con `ok:true`.

1. **208 / 209 · Primer y segundo apellido.** Hay **una** columna `Apellidos empleado` y el
   modelo pide **dos casillas**. *Este es exactamente el defecto que el correo de la
   automatización `3. Envio borradores 030 y 149` ya reconoce ante el cliente*: «por una
   incidencia técnica de la Agencia Tributaria, en el borrador del modelo 030 el nombre y los
   apellidos aparecen en una misma casilla». **No es una incidencia de la AEAT: es que se manda
   un campo donde van dos.** Partir por el primer espacio falla con *GARCIA GONZALEZ* frente a
   *DE LA TORRE* o a un apellido único extranjero. Hay que preguntarlo o partirlo con criterio.
2. **424 / 425 · Municipio y provincia del domicilio.** No existen. Solo hay municipio y
   provincia **de nacimiento**, que es otra cosa. Y sin municipio el 030 no comunica el
   domicilio, que es su razón de ser.
3. **426 / 427 · Teléfono partido.** `NumeroTelefono` guarda `+34XXXXXXXXX` junto; el modelo
   quiere prefijo y número en casillas separadas.
4. **217 · Fecha de efectos de la residencia fiscal.** ¿`fechaDesplazamiento` o `fecha_alta_ss`?
   Decisión fiscal, no técnica.
5. **Apartado 1 · qué casilla de causa se marca** (101–112, 115–117). Decisión de negocio y
   condiciona todo lo demás. **AVISO: la correspondencia exacta entre cada número y su etiqueta
   NO se puede afirmar desde el texto extraído**, porque el PDF no conserva el orden visual.
   Las ocho causas presentes son: nueva tarjeta acreditativa del NIF · modificación de datos
   identificativos · modificaciones/cambio de domicilio fiscal · consignación/modificación/baja
   de domicilio de notificaciones · cambio/modificación de estado civil · alta en el censo de
   obligados tributarios · solicitud de NIF por persona física sin DNI/NIE · alta/baja en la
   aplicación móvil AEAT. **Hay que confirmarlo mirando el formulario, no este documento.**
6. **805 · Fecha de adquisición del estado civil.** No existe.
7. **203 · NIF de otros países.** No existe.
8. **Apartado 3 entero · el cónyuge (301–317).** Solo hay `ConyugeQuiereAcogerse`, un checkbox.
   Ni nombre, ni NIF, ni fecha ni lugar de nacimiento. **Si hay que rellenarlo son 17 campos
   nuevos**; si no, cero.

## 3 · Apartados que no tocamos

- **6 · Domicilio en el extranjero** (501–510): en un alta Beckham el domicilio es español.
- **7 · Notificaciones** (600–630): solo si difiere del fiscal.
- **8 · Representante** (701–708): lo rellenaría TaxDown, no el cliente.
- **10 · Fecha y firma.**

---

## 4 · La decisión que bloquea

Como **el PDF no es rellenable**, hay tres vías y la elige el usuario:

- **(a) Formulario oficial rellenable de la sede AEAT**, si existe con campos.
- **(b) Generar nuestro propio PDF** replicando el 030. Control total, pero es un documento
  que acaba en Hacienda.
- **(c) Llamar a lo que ya genera estos borradores.** *Alguien ya los está generando hoy*: el
  borrador de producción es la prueba. Si es así, WP-235 no es «rellenar un PDF» sino «cablear
  lo que ya existe», que es el quinto caso en este proyecto de **el camino existe y nadie lo
  usa**. **Es la vía que más huele a la buena, y la pregunta es quién lo genera.**

## 5 · Aviso de datos personales

El borrador de producción que se usó como primera fuente, nombrado como si fuera del usuario,
contenía en la cabecera de sus dos páginas el NIE, el apellido y el nombre de **otra persona
real**. Queda pendiente de aclarar si fue un fichero equivocado o un incidente del generador.
**Esos datos no se han escrito en este documento ni en el log**, a propósito.
