# Los 44 arrastres que quedan · columnas de `Empleados`

> Orden real leido por MCP el **17/08/2026**. Las **posiciones 1 a 30 ya estan bien**
> (grupos (1) IDENTIDAD y (2) PERSONALES completos): no las toques. De la 31 en adelante hay que rehacer.
>
> Estos 44 arrastres, **en este orden**, dejan la tabla exactamente en el orden de
> `docs/orden-columnas-empleados-2026-08-16.md`. **Verificado por simulacion**: aplicando los 44
> a la secuencia real, el resultado es identico al objetivo, columna por columna.

**Como:** en la vista de cuadricula, arrastra la CABECERA de la columna. Cada linea dice donde
soltarla. El ancla **ya esta colocada** cuando llegas a su paso, asi que nunca hay que contar
posiciones ni volver atras.

**Por que 44 y no 63:** 49 de las 93 columnas ya guardan entre si el orden relativo correcto.
Solo se mueven las que lo rompen (subsecuencia creciente maxima).

| # | Arrastra esta columna | Sueltala justo DETRAS de | Queda en la posicion |
|---:|---|---|---:|
| 1 | `Tipo de vía / Type of road` | `UltimoPaisResidencia` | 31 |
| 2 | `MunicipioResidencia` | `Codigo Postal` | 37 |
| 3 | `Empresa` | `MunicipioResidencia` | 38 |
| 4 | `NombreEmpleador` | `Empresa` | 39 |
| 5 | `CIFEmpleador` | `NombreEmpleador` | 40 |
| 6 | `fechaDesplazamiento` | `Salario` | 42 |
| 7 | `fechaDesplazamientocorrecta` | `fechaDesplazamiento` | 43 |
| 8 | `AnioDesplazamiento` | `fechaDesplazamientocorrecta` | 44 |
| 9 | `alta_ss` | `AnioDesplazamiento` | 45 |
| 10 | `fecha_alta_ss` | `alta_ss` | 46 |
| 11 | `FechaAlta` | `fecha_alta_ss` | 47 |
| 12 | `DiscrepanciaFechaAlta` | `FechaAlta` | 48 |
| 13 | `fecha_prevista_alta` | `DiscrepanciaFechaAlta` | 49 |
| 14 | `fecha_limite_plazo` | `fecha_prevista_alta` | 50 |
| 15 | `FechaLlamada` | `fecha_limite_plazo` | 51 |
| 16 | `ConyugeQuiereAcogerse` | `Inversiones` | 54 |
| 17 | `Situación fiscal Anio Desplazamiento` | `ConyugeQuiereAcogerse` | 55 |
| 18 | `Situación fiscal AnioSiguiente` | `Situación fiscal Anio Desplazamiento` | 56 |
| 19 | `DNI` | `Situación fiscal AnioSiguiente` | 57 |
| 20 | `Pasaporte` | `DNI` | 58 |
| 21 | `Contratotrabajo` | `Pasaporte` | 59 |
| 22 | `AltaSeguridadSocial` | `Contratotrabajo` | 60 |
| 23 | `AutorizacionEmpleado` | `AltaSeguridadSocial` | 61 |
| 24 | `AutorizacionEmpresa` | `AutorizacionEmpleado` | 62 |
| 25 | `CertificadoEnisa` | `AutorizacionEmpresa` | 63 |
| 26 | `Apostilla` | `CertificadoEnisa` | 64 |
| 27 | `Visado` | `Apostilla` | 65 |
| 28 | `ResumenBot` | `Visado` | 66 |
| 29 | `InformePdf` | `ResumenBot` | 67 |
| 30 | `InformeListo` | `InformePdf` | 68 |
| 31 | `RegenerarInforme` | `InformeListo` | 69 |
| 32 | `ErrorInforme` | `RegenerarInforme` | 70 |
| 33 | `InformeEnviadoEl` | `ErrorInforme` | 71 |
| 34 | `Fichero030` | `InformeEnviadoEl` | 72 |
| 35 | `Regenerar030` | `Fichero030` | 73 |
| 36 | `Error030` | `Regenerar030` | 74 |
| 37 | `Estado030149` | `Error030` | 75 |
| 38 | `Modificacion M030` | `EnviarBorradores` | 79 |
| 39 | `Modificacion M149` | `Modificacion M030` | 80 |
| 40 | `Linkconfirmacionmodelos` | `Modificacion M149` | 81 |
| 41 | `LinkFormulario030149` | `Linkconfirmacionmodelos` | 82 |
| 42 | `Checkout_Url` | `Checkout_Linked` | 86 |
| 43 | `recordId` | `Checkout Error` | 91 |
| 44 | `RecordID Formulario` | `recordId` | 92 |

## Al terminar

Las tres tecnicas (`recordId`, `RecordID Formulario`, `last_idem_key`) quedan al final y
**se pueden ocultar** en la vista de trabajo. Ocultar no afecta a la API: el escritor sigue
escribiendo `last_idem_key` aunque no se vea.

Y recuerda el limite: **el orden es propiedad DE LA VISTA, no de la tabla.** Si manana creas una
vista nueva, nace con el orden por defecto y hay que repetir esto en ella.
