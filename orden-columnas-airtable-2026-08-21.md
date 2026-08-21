# Orden propuesto para las columnas de `Empleados` · 21/08/2026

**Airtable NO deja reordenar columnas por API**: el orden es propiedad **de la vista** y no hay
endpoint. Esto se arrastra a mano. Hazlo en una **vista Grid nueva** («Expediente completo») para no
romperle la vista a nadie, y cuando te guste, aplica el mismo orden a la principal.

## Los seis criterios que he usado

1. **Lo que se mira a diario, primero.** `Status` es lo segundo que se ve tras el nombre: es el
   disparador de medio sistema.
2. **El dato y su fórmula, pegados.** `email` con `emailcorrectosinespacios`, `FechaNacimiento` con
   `fechaNacimientocorrecta`, `fechaDesplazamiento` con su versión formateada. Si están lejos, se
   edita la fórmula por error.
3. **El domicilio, en el orden del `.030`.** Así se puede revisar de un tirón contra el fichero
   posicional, que es lo que se hace cuando la AEAT devuelve algo.
4. **Fichero + Regenerar + Error, siempre juntos.** Si algo falla, el motivo está en la celda de al
   lado y no a treinta columnas.
5. **Los documentos, en el orden en que los pide el bot.** Revisar un expediente es recorrerlos.
6. **Lo técnico al final,** para poder ocultarlo de golpe y no volver a verlo.

---

## ① Identidad y estado — lo primero que se ve
| # | Columna | Por qué aquí |
|---|---|---|
| 1 | **Nombre completo** | primary field, Airtable lo fija a la izquierda: no se puede mover |
| 2 | **Status** | el disparador de los dos generadores y de tres automatizaciones |
| 3 | MotivoCierre | explica el Status |
| 4 | Descarte | y esto explica el 12 |
| 5 | AplicaBeckham | |
| 6 | TipoBeckham | |
| 7 | SenalesComplejidad | desde el 21/08 es lo que mete el caso en el peldaño 2 |
| 8 | Idioma | decide el idioma del informe y de los correos |
| 9 | lead_potencial | |
| 10 | UserId | la clave de negocio del upsert; se mira poco pero cuando se mira, urge |

## ② Contacto
| # | Columna |
|---|---|
| 11 | email |
| 12 | emailcorrectosinespacios |
| 13 | NumeroTelefono |
| 14 | intercom_conversation_id |

## ③ Personales
| # | Columna |
|---|---|
| 15 | **NIF** |
| 16 | PasaporteNumero |
| 17 | Nombre empleado |
| 18 | Apellidos empleado |
| 19 | ApellidoPrimero |
| 20 | ApellidoSegundo |
| 21 | FechaNacimiento |
| 22 | fechaNacimientocorrecta |
| 23 | Sexo |
| 24 | estadoCivil |
| 25 | hijos |
| 26 | ConyugeQuiereAcogerse |
| 27 | Nacionalidad |
| 28 | PaisNacimiento |
| 29 | Provincia de Nacimiento / Province of Birth |
| 30 | Municipio de Nacimiento / Birth Municipality |
| 31 | UltimoPaisResidencia |

Los tres apellidos van seguidos **a propósito**: el `.030` escribe el mismo dato de las dos formas,
juntos en la cabecera y separados en el apartado 2, así que verlos juntos evita «arreglar» uno.

## ④ Domicilio en España — en el orden del `.030`
| # | Columna |
|---|---|
| 32 | Tipo de vía / Type of road |
| 33 | Nombre de la calle / Name of street |
| 34 | Número de tu domicilio / House Number |
| 35 | Planta |
| 36 | Puerta |
| 37 | Codigo Postal |
| 38 | MunicipioResidencia |

`Codigo Postal` justo antes de `MunicipioResidencia` porque **hacen el mismo trabajo**: sus dos
primeros dígitos son el código de provincia del fichero, y el municipio se busca por nombre.

## ⑤ Empleo y plazos
| # | Columna |
|---|---|
| 39 | Empresa |
| 40 | NombreEmpleador |
| 41 | CIFEmpleador |
| 42 | Salario |
| 43 | fechaDesplazamiento |
| 44 | fechaDesplazamientocorrecta |
| 45 | alta_ss |
| 46 | fecha_alta_ss |
| 47 | FechaAlta |
| 48 | DiscrepanciaFechaAlta |
| 49 | fecha_limite_plazo |
| 50 | fecha_prevista_alta |
| 51 | Situación fiscal Anio Desplazamiento |
| 52 | Situación fiscal AnioSiguiente |
| 53 | AnioDesplazamiento |

**`fecha_alta_ss` · `FechaAlta` · `DiscrepanciaFechaAlta` seguidas, y en ese orden:** lo que dijo el
cliente, lo que pone el papel, y el aviso de que no cuadran. Es el trío que más se confunde del
expediente, y verlo en línea lo explica solo.

## ⑥ Patrimonio
| # | Columna |
|---|---|
| 54 | Propiedades |
| 55 | Inversiones |

## ⑦ Documentos del cliente — en el orden en que los pide el bot
| # | Columna |
|---|---|
| 56 | DNI |
| 57 | Pasaporte |
| 58 | Contratotrabajo |
| 59 | AutorizacionEmpleado |
| 60 | AutorizacionEmpresa |
| 61 | AltaSeguridadSocial |
| 62 | CertificadoEnisa |
| 63 | Apostilla |
| 64 | Visado |

Los tres últimos casi siempre vacíos y **es correcto**: solo aplican a algunas vías de acceso.

## ⑧ Lo que produce el bot
| # | Columna |
|---|---|
| 65 | ResumenBot |
| 66 | InformePdf |
| 67 | InformeListo |
| 68 | InformeEnviadoEl |
| 69 | RegenerarInforme |
| 70 | ErrorInforme |
| 71 | Fichero030 |
| 72 | Regenerar030 |
| 73 | Error030 |

## ⑨ Modelos 030 y 149
| # | Columna |
|---|---|
| 74 | Estado030149 |
| 75 | Borrador030 |
| 76 | Borrador149 |
| 77 | EnviarBorradores |
| 78 | Modificacion M030 |
| 79 | Modificacion M149 |
| 80 | Linkconfirmacionmodelos |
| 81 | LinkFormulario030149 |

`Borrador030` y `Borrador149` **no** van con `Fichero030`: aquel es la entrada que se sube a la AEAT
y estos son la salida en PDF que ve el cliente. Separarlos es justo lo que evita confundirlos.

## ⑩ Facturación
| # | Columna |
|---|---|
| 82 | CrearCheckout |
| 83 | Importe Factura |
| 84 | Checkout_Linked |
| 85 | Checkout_Url |
| 86 | Checkout_unique_Id (from Checkout_Linked) |
| 87 | Payment_Status (from Checkout) |
| 88 | Checkout Error |
| 89 | Checkout_Url (from Checkout_Linked) |

El 89 es **el duplicado** del 85. Decidido que se queda; al final del bloque molesta menos.

## ⑪ Técnica — ocultar de golpe
| # | Columna |
|---|---|
| 90 | recordId |
| 91 | RecordID Formulario |
| 92 | last_idem_key |
| 93 | FechaLlamada |

`FechaLlamada` está **huérfana a propósito** desde el 19/08: ya no se pregunta, y borrarla se
llevaría el dato de las filas que lo tienen. Aquí abajo, y oculta.

---

## Lo que NO haría

- **No tocar los nombres de las columnas.** El escritor, los dos generadores y las automatizaciones
  las nombran literales. Reordenar es gratis; renombrar rompe.
- **No arreglar la errata de la opción de `Propiedades`** («en España ni el extranjero»): el informe
  la traduce con un mapa de presentación y cambiar el texto lo rompe. Decisión cerrada.
