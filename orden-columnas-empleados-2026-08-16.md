# Orden lógico de las columnas de `Empleados`

> **Leído por MCP el 16/08/2026.** Base `app5K8OnSObqwWweS`, tabla `tblTWCWu5nQXNOMR1`.
> **93 columnas**, no 64 como decía la documentación: corregido.

## Por qué esto es un documento y no un cambio ya hecho

**El orden de las columnas NO se puede cambiar por API.** En Airtable el orden de campos es una
propiedad **de la vista**, no de la tabla, y la Metadata API no expone ningún endpoint para
reordenarlos: `create_field` los añade **siempre al final**, y `update_field` solo toca nombre,
descripción y opciones de fórmula. Tampoco hay forma de crear una vista nueva ya ordenada.

**Se arrastran a mano en la UI, una vez, y se quedan así.** Esta es la lista para hacerlo de un
tirón.

---

## El orden propuesto · 11 grupos

El criterio: **primero lo que miras a diario, después lo que rellena el cliente, después lo que
produce el sistema, y al final lo técnico.**

### ① Identidad y estado del expediente — 14

Lo que quieres ver sin desplazarte.

| # | Columna | Nota |
|---:|---|---|
| 1 | `Nombre completo` | Campo principal, fórmula. No se puede mover: siempre va el primero |
| 2 | `UserId` | **La clave de negocio.** Es por lo que hace `upsert` el escritor |
| 3 | `Status` | La escalera 1 → 12 |
| 4 | `Descarte` | |
| 5 | `MotivoCierre` | Dispara el cierre de la conversación en Intercom |
| 6 | `AplicaBeckham` | |
| 7 | `TipoBeckham` | |
| 8 | `lead_potencial` | |
| 9 | `SenalesComplejidad` | El *porqué* del caso complejo |
| 10 | `Idioma` | Decide el idioma del informe y de los correos |
| 11 | `email` | |
| 12 | `emailcorrectosinespacios` | Fórmula |
| 13 | `NumeroTelefono` | |
| 14 | `intercom_conversation_id` | |

### ② Datos personales — 16

| # | Columna |
|---:|---|
| 15 | `NIF` |
| 16 | `Nombre empleado` |
| 17 | `Apellidos empleado` |
| 18 | `ApellidoPrimero` |
| 19 | `ApellidoSegundo` |
| 20 | `PasaporteNumero` |
| 21 | `FechaNacimiento` |
| 22 | `fechaNacimientocorrecta` |
| 23 | `Sexo` |
| 24 | `estadoCivil` |
| 25 | `hijos` |
| 26 | `Nacionalidad` |
| 27 | `PaisNacimiento` |
| 28 | `Provincia de Nacimiento / Province of Birth` |
| 29 | `Municipio de Nacimiento / Birth Municipality` |
| 30 | `UltimoPaisResidencia` |

> Las tres de país van juntas **a propósito**: hoy están separadas por media tabla y es imposible
> ver de un vistazo si son coherentes entre sí.

### ③ Domicilio en España — 7

Las siete casillas del `.030`, juntas. Hoy están repartidas y con un `LinkFormulario030149` en medio.

| # | Columna |
|---:|---|
| 31 | `Tipo de vía / Type of road` |
| 32 | `Nombre de la calle / Name of street` |
| 33 | `Número de tu domicilio / House Number` |
| 34 | `Planta` |
| 35 | `Puerta` |
| 36 | `Codigo Postal` |
| 37 | `MunicipioResidencia` |

### ④ Empleo, desplazamiento y plazos — 14

| # | Columna | Nota |
|---:|---|---|
| 38 | `Empresa` | |
| 39 | `NombreEmpleador` | IA |
| 40 | `CIFEmpleador` | IA |
| 41 | `Salario` | |
| 42 | `fechaDesplazamiento` | |
| 43 | `fechaDesplazamientocorrecta` | Fórmula |
| 44 | `AnioDesplazamiento` | IA. Es la cabecera del informe |
| 45 | `alta_ss` | Lo declara el cliente (F2) |
| 46 | `fecha_alta_ss` | Lo declara el cliente |
| 47 | `FechaAlta` | **Lo lee la IA del documento.** Va al lado a propósito |
| 48 | `DiscrepanciaFechaAlta` | **La comparación de las dos anteriores.** Solo tiene sentido aquí |
| 49 | `fecha_prevista_alta` | Lead potencial |
| 50 | `fecha_limite_plazo` | Calculado por `beckham_f2_plazo.` |
| 51 | `FechaLlamada` | |

> `fecha_alta_ss`, `FechaAlta` y `DiscrepanciaFechaAlta` **tienen que verse a la vez**. Hoy están en
> las posiciones 66, 37 y 79: la columna que existe para comparar dos fechas está a 40 columnas de
> distancia de las dos que compara.

### ⑤ Patrimonio y situación fiscal — 5

| # | Columna |
|---:|---|
| 52 | `Propiedades` |
| 53 | `Inversiones` |
| 54 | `ConyugeQuiereAcogerse` |
| 55 | `Situación fiscal Anio Desplazamiento` |
| 56 | `Situación fiscal AnioSiguiente` |

### ⑥ Documentos que sube el cliente — 9

Los nueve adjuntos que escribe el bot, seguidos. Hoy están en cuatro tandas separadas.

| # | Columna |
|---:|---|
| 57 | `DNI` |
| 58 | `Pasaporte` |
| 59 | `Contratotrabajo` |
| 60 | `AltaSeguridadSocial` |
| 61 | `AutorizacionEmpleado` |
| 62 | `AutorizacionEmpresa` |
| 63 | `CertificadoEnisa` |
| 64 | `Apostilla` |
| 65 | `Visado` |

> **Este grupo es exactamente lo que vigila `beckham_adjuntos_huerfanos`.** Tenerlos juntos permite
> ver de un golpe si a alguno le falta el fichero.

### ⑦ Informe Mobility — 6

| # | Columna | Nota |
|---:|---|---|
| 66 | `ResumenBot` | La materia prima del informe |
| 67 | `InformePdf` | |
| 68 | `InformeListo` | **Dispara el correo.** Al lado del PDF que adjunta |
| 69 | `RegenerarInforme` | |
| 70 | `ErrorInforme` | |
| 71 | `InformeEnviadoEl` | |

### ⑧ Modelo 030 · lo que va a Hacienda — 3

| # | Columna |
|---:|---|
| 72 | `Fichero030` |
| 73 | `Regenerar030` |
| 74 | `Error030` |

### ⑨ Modelos 030 y 149 · lo que va al cliente — 8

| # | Columna |
|---:|---|
| 75 | `Estado030149` |
| 76 | `Borrador030` |
| 77 | `Borrador149` |
| 78 | `EnviarBorradores` |
| 79 | `Modificacion M030` |
| 80 | `Modificacion M149` |
| 81 | `Linkconfirmacionmodelos` |
| 82 | `LinkFormulario030149` |

> `Fichero030` (grupo ⑧) y `Borrador030` (grupo ⑨) **son cosas distintas y hoy están lejísimos**:
> el primero es la ENTRADA que se sube a la sede, el segundo la SALIDA que devuelve Hacienda. Que
> estén en grupos contiguos pero separados es deliberado.

### ⑩ Facturación · Checkout — 8

| # | Columna |
|---:|---|
| 83 | `CrearCheckout` |
| 84 | `Importe Factura` |
| 85 | `Checkout_Linked` |
| 86 | `Checkout_Url` |
| 87 | `Checkout_Url (from Checkout_Linked)` |
| 88 | `Checkout_unique_Id (from Checkout_Linked)` |
| 89 | `Payment_Status (from Checkout)` |
| 90 | `Checkout Error` |

### ⑪ Técnicas · candidatas a ocultar — 3

No las rellena ni las lee ninguna persona.

| # | Columna | Nota |
|---:|---|---|
| 91 | `recordId` | |
| 92 | `RecordID Formulario` | Fórmula |
| 93 | `last_idem_key` | La huella de deduplicación del escritor |

> En la vista de trabajo, **estas tres se pueden ocultar directamente**. Ocultar sí se puede hacer
> desde la UI sin tocar nada, y no afecta a la API: el escritor sigue escribiendo `last_idem_key`
> aunque no se vea.

---

## Lo que se ve mal ahora mismo, en concreto

| Problema | Hoy |
|---|---|
| Los 9 adjuntos del bot | En **cuatro tandas** separadas: posiciones 11-15, 23, 26-28 |
| Las tres fechas de alta | `FechaAlta` en la 37, `fecha_alta_ss` en la 66, `DiscrepanciaFechaAlta` en la 79 |
| Los tres países | 20-22, pero `Provincia`/`Municipio de Nacimiento` en la 42-43 |
| El domicilio | 44-48 y 50, con `LinkFormulario030149` metido en la 49 |
| `UserId`, la clave | En la posición **29** |
| Lo del `.030` y el informe | Todo al final, 84-92, pero mezclado con `Checkout_Url` en la 93 |

---

## Lo que SÍ se puede hacer por MCP

Reordenar no, pero sí **escribir la descripción de cada campo**, y eso hace la tabla navegable
aunque el orden no cambie: al pinchar en la cabecera de la columna, Airtable enseña la descripción.

Propuesta: prefijar cada descripción con su grupo, así —

```
① IDENTIDAD · Clave de negocio. Es el campo por el que hace upsert el escritor del bot.
```

De las 93 columnas, **51 no tienen ninguna descripción hoy**, incluidas `Status`, `UserId`, `NIF`,
`Salario` y los nueve adjuntos.

### Un aviso aparte

`PaisNacimiento`, `Nacionalidad` y `UltimoPaisResidencia` llevan **la lista entera de 245 países
volcada dentro del campo descripción**. Eso deja el popup de información del campo inservible — hay
que hacer scroll por 245 líneas para leer cualquier nota. Si la lista está ahí para consultar los
valores válidos, el sitio bueno es `docs/tabla-paises-iso2-2026-08-13.js`, que ya la tiene y además
con su código ISO-2. **No las he tocado**: dime si las limpio.
