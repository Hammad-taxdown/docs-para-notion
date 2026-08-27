# Texto literal de la plantilla del informe Mobility · extraido el 14/08/2026

> **SUPERADO — 27/08/2026.** Extracción histórica de la plantilla `.docx`. Este texto **ya no es** el
> cuerpo que hay que reproducir: la cabecera extendida («Fecha de la reunión: {{fechaLlamada}}», el
> país de origen) y la sección «Notas e información proporcionada» **salieron del informe el 19/08**
> (queda solo nombre, apellidos y fecha de alta), y el **20/08** el motor pasa al v2 de 8 plantillas
> de Google Docs. Lo vigente: `CLAUDE.md` §6. **El AVISO DE MÉTODO de abajo sigue siendo válido**
> (15 de 17 marcadores partidos entre `<w:r>`): es la razón por la que el v1 no rellena el `.docx`,
> y hay que conservarlo.

> Fuente: `[MOB] Bloques informe Mobility (1).docx`, `word/document.xml` (71.729 caracteres).
> Extraido con python+zipfile, sin reescribir nada. Es el cuerpo que hay que reproducir en el
> documento que se le manda al cliente. **Las tablas van celda a celda y en orden.**
>
> **AVISO DE METODO, y es el hallazgo mas importante de esta extraccion:** de los 17 marcadores,
> **15 estan partidos entre varios `<w:r>`** dentro del XML. Solo `{{hijos}}` y
> `{{residenciaFiscal5Anios}}` aparecen enteros en un unico run. Un buscar-y-reemplazar sobre
> `word/document.xml` sustituiria **2 de las 19 apariciones** y dejaria 17 `{{...}}` literales en
> el documento del cliente. Por eso el informe NO se monta rellenando el .docx.

MEMORIA FISCAL — BLOQUES DE CONTENIDO

Documento interno. El informe de cada cliente se monta con la cabecera, el bloque correspondiente a su situación en el año de desplazamiento y el bloque correspondiente a su situación en el año siguiente. La numeración de los apartados se asigna al montar el documento.

Bloques disponibles: A) Residente fiscal · B) No residente fiscal · C) Régimen especial (Ley Beckham).

CABECERA

Nombre: {{nombreCompleto}}

País de origen: {{paisOrigen}}

Fecha de desplazamiento: {{fechaDesplazamiento}}

Fecha de la reunión: {{fechaLlamada}}

Notas e información proporcionada

Según la información que nos has facilitado:

– Estado civil: {{estadoCivil}}.

– Hijos: {{hijos}}.

– Salario bruto anual: {{salarioBrutoAnual}} euros.

– Residencia fiscal en los cinco años anteriores: {{residenciaFiscal5Anios}}.

– Propiedades: {{sumaPropiedades}}.

– Inversiones: {{sumaInversiones}}.

Resumen

**Tabla 1:**

| Concepto | Situación |
| Situación en {{anioDesplazamiento}} | {{situacionAnioDesplazamiento}} |
| Situación en {{anioSiguiente}} | {{situacionAnioSiguiente}} |
| Rentas sujetas a tributación en España | {{rentasSujetas}} |
| Declaración y plazo | {{modeloYPlazo}} |

BLOQUE A — RESIDENTE FISCAL EN ESPAÑA (RÉGIMEN GENERAL)

Según la información que nos has facilitado, durante el año {{anio}} vas a residir en España más de 183 días, por lo que serás considerado residente fiscal en España.

Los residentes fiscales en España están obligados a declarar y pagar impuestos por su renta mundial, esto es, por todos los ingresos obtenidos en el año con independencia del lugar en el que se hayan generado o pagado. En caso de haber tributado por esas mismas rentas en el extranjero, el Convenio de Doble Imposición suscrito entre España y el país de origen de la renta permite deducir el impuesto pagado fuera, con los límites que el propio Convenio establezca.

El periodo impositivo coincide con el año natural y el impuesto se devenga el 31 de diciembre. La declaración es el modelo 100 y se presenta entre los meses de abril y junio del año siguiente.

Rendimientos del trabajo

Tributa la totalidad del salario, con independencia del lugar en el que se haya generado. En caso de desplazamientos al extranjero, el artículo 7.p de la Ley del IRPF permite dejar exentos los primeros 60.100 euros del salario correspondiente al trabajo realizado fuera de España, siempre que se cumplan los requisitos previstos. Su aplicación requiere un análisis individual.

Tributación de bienes inmuebles

**Tabla 2:**

| Alquilado | Vacío o segunda residencia | Vivienda habitual |
| Se declara el alquiler, de corta o de larga duración, con independencia de dónde esté situado el inmueble. | Se declaran todos los inmuebles vacíos, situados en España o en el extranjero. | Únicamente se admite una vivienda habitual, junto con un máximo de dos garajes adquiridos en la misma fecha. |
| Se tributa por el rendimiento neto: ingresos menos gastos deducibles. | Se tributa sobre el valor catastral: el 1,1 % si está revisado y el 2 % en caso contrario. | Se incluye en la declaración, pero no afecta al resultado. |

Rendimientos de intereses, dividendos y acciones

**Tabla 3:**

| Entidad española | Entidad extranjera |
| Se incorporan automáticamente a los Datos Fiscales. | Tributan en los mismos términos, al declararse la renta mundial. Es necesario que nos facilites la información. |

Tipos impositivos

Los tipos impositivos se dividen en base imponible general y base imponible del ahorro. La base general, que incluye los rendimientos del trabajo y del arrendamiento de bienes inmuebles, tributa a un tipo progresivo que parte del 19 % y alcanza el 54 % según la comunidad autónoma de residencia. La base del ahorro, que incluye los intereses, los dividendos y las ganancias derivadas de transmisiones patrimoniales, tributa entre el 19 % y el 30 %.

Otras obligaciones fiscales

Modelo 030. A tu llegada a España es necesario tramitarlo para comunicar tu llegada a la Agencia Tributaria y facilitar un domicilio a efectos de notificaciones.

Modelo 720. Declaración informativa anual de bienes y derechos situados en el extranjero. Es obligatoria cuando, a 31 de diciembre, su valor supere los 50.000 euros en cualquiera de estos tres grupos: cuentas bancarias situadas fuera de España; valores, derechos y depósitos situados fuera de España; e inmuebles y derechos sobre los mismos situados fuera de España. No conlleva pago, dado que se trata de una obligación informativa. El plazo finaliza el 31 de marzo de {{anioSiguiente}}.

Modelo 721. Declaración informativa anual de monedas virtuales situadas en el extranjero. Es obligatoria cuando, a 31 de diciembre, su valor supere los 50.000 euros. Tiene el mismo carácter informativo y el mismo plazo de presentación.

BLOQUE B — NO RESIDENTE FISCAL EN ESPAÑA

Según la información que nos has facilitado, durante el año {{anio}} vas a residir en España menos de 183 días, por lo que no serás considerado residente fiscal en España.

Los contribuyentes no residentes tributan únicamente por las rentas obtenidas en España.

Rendimientos del trabajo

Queda sujeto a tributación el salario correspondiente al trabajo desarrollado físicamente en España para una empresa española. Si la actividad se realiza desde España en beneficio de una empresa extranjera, con carácter general no queda sujeta a tributación en España; en ese supuesto es necesario analizar el Convenio de Doble Imposición aplicable para asegurar el correcto cumplimiento de las obligaciones fiscales.

Tipo de gravamen

**Tabla 4:**

| Residentes en la Unión Europea | Residentes fuera de la Unión Europea |
| 19 %, con derecho a deducir gastos —entre ellos, la Seguridad Social— tanto en el modelo 210 de rendimientos del trabajo como en el de arrendamientos. | 24 %, sin derecho a deducir gasto alguno. En rendimientos del trabajo, sobre el salario bruto. En arrendamientos, sobre el ingreso íntegro. |

Rendimientos del capital inmobiliario

**Tabla 5:**

| Alquilado | Vacío o segunda residencia |
| Se declara el rendimiento del alquiler mediante el modelo 210. | Se tributa por la renta imputada: el 1,1 % del valor catastral si está revisado y el 2 % en caso contrario. |

Como no residente no resulta aplicable el concepto de vivienda habitual: ninguna vivienda situada en España queda exenta por este motivo.

Ingresos por intereses, dividendos y acciones

Únicamente tributan en España los de fuente española. Las inversiones situadas fuera de España no se declaran en España.

Obligaciones de declaración como no residente

Todas las declaraciones se presentan mediante el modelo 210. El plazo depende del tipo de renta:

**Tabla 6:**

| Tipo de renta | Plazo de presentación |
| Salario | A pagar: hasta el 20 de abril del año siguiente.A devolver: desde el 1 de febrero del año siguiente y dentro de los cuatro años posteriores.Resultado nulo: no es obligatoria la presentación. |
| Alquileres de inmuebles | Anual, hasta el 20 de abril del año siguiente. |
| Imputación de rentas (inmueble vacío) | Hasta el 31 de diciembre del año siguiente. |
| Transmisión de inmuebles | Cuatro meses desde la fecha de transmisión. |
| Sin rentas de fuente española, o con las retenciones ya practicadas | No hay obligación de presentar declaración. |

Modelo 030. A tu llegada a España es necesario tramitarlo para comunicar tu llegada a la Agencia Tributaria y facilitar un domicilio a efectos de notificaciones.

BLOQUE C — RÉGIMEN ESPECIAL (LEY BECKHAM)

Según la información que nos has facilitado, cumples los requisitos para acogerte al régimen especial aplicable a los trabajadores desplazados a territorio español. Tu cónyuge y tus hijos menores de veinticinco años pueden acogerse al mismo régimen si se desplazan contigo y cumplen las condiciones establecidas.

Se trata de un régimen opcional: en lugar de tributar por la renta mundial a tipos progresivos, se tributa en términos similares a los de un no residente y a tipo fijo. Con carácter general resulta ventajoso a partir de unos 50.000 euros brutos anuales.

El régimen se aplica durante el año del desplazamiento y los cinco ejercicios siguientes, seis en total. Transcurrido ese plazo se tributa conforme al régimen general. La declaración anual es el modelo 151 y se presenta entre los meses de abril y junio del año siguiente.

Rentas sujetas y tipos aplicables

**Tabla 7:**

| Tipo de renta | Sujeción en España | Tipo aplicable |
| Rendimientos del trabajo | Sujeción en España desde el momento de la llegada | 24 % – 47 % |
| Intereses y dividendos de fuente española | Sí | 19 % – 30 % |
| Ganancias por transmisión de elementos patrimoniales situados en España | Sí | 19 % – 30 % |
| Arrendamiento de inmuebles situados en España | Sí | 24 %, sin deducción de gastos |
| Propiedades e inversiones situadas en el extranjero | No | No tributan |

Si tienes propiedades o inversiones en el extranjero, no tributan bajo este régimen especial: únicamente se declaran las situadas en España.

Escala aplicable a los rendimientos del trabajo

**Tabla 8:**

| Rendimientos del trabajo | Tipo aplicable |
| De 0 a 600.000 euros | 24 % |
| Desde 600.001 euros en adelante | 47 % |

Se incluye la totalidad del salario del periodo, salvo el correspondiente a la actividad desarrollada con anterioridad a la fecha de desplazamiento a España. No es deducible la Seguridad Social, y las aportaciones que la empresa realice a un plan de pensiones en tu nombre tributan como mayor salario.

Desventajas del régimen

– No se aplican las deducciones de carácter general.

– No se admite la tributación conjunta con el cónyuge.

–

– La indemnización por despido no está exenta

La prestación por desempleo y las prestaciones por maternidad o paternidad tributan en su totalidad.

– No existe el concepto de vivienda habitual: la vivienda tributa por su valor catastral y, en caso de arrendamiento, sin deducir gastos.

Aun con estas limitaciones, al tributar a un tipo fijo al 24% generalmente, el régimen especial suele resultar igualmente más favorable que optar por el régimen general.

Requisitos de acceso

– No haber sido residente fiscal en España durante los cinco años anteriores al desplazamiento.

– Que el desplazamiento se produzca por contrato de trabajo con una empresa española; por contrato de trabajo con una empresa extranjera, manteniendo la Seguridad Social en el país de origen; o por la condición de administrador de una sociedad en la que no se ostente participación o esta no supere el 25 %.

– No obtener rentas en España a través de un establecimiento permanente.

El régimen se solicita mediante los modelos 030 y 149, dentro de los seis meses siguientes al alta en la Seguridad Social. TaxDown prepara y presenta ambos.

Causas de exclusión

– El ejercicio de una actividad económica por cuenta propia o la obtención de rentas calificadas como derivadas de un establecimiento permanente en España.

– La pérdida de la residencia fiscal en España, que implica la exclusión inmediata.

– La finalización de la relación laboral seguida de un periodo prolongado de inactividad, en torno a doce meses. El cambio de empresa y los periodos breves de inactividad no suponen exclusión.

