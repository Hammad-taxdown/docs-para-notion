// ============================================================================
// CUERPO DEL INFORME MOBILITY · Pieza 4 · §5 y §8 del contrato del 14/08/2026
// ----------------------------------------------------------------------------
// montarElementos(datos) -> array plano de elementos del IR (§1 del contrato).
//
// Esta pieza NO SABE NADA DE PDF. Solo produce el IR; dibujar es cosa del motor
// (docs/pdf-motor-2026-08-14.js). Y no lee de Airtable: los 17 marcadores le
// llegan ya resueltos y formateados por la pieza 3 (resolverDatos).
//
// EL TEXTO ESPANOL ES LITERAL de docs/plantilla-informe-mobility-texto-2026-08-14.md.
// No se reescribe, no se resume, no se mejora el estilo, no se cambia una cifra.
// Es texto fiscal que el cliente se va a guardar. Las unicas tres desviaciones
// respecto a la plantilla son las tres del §5.4 y van comentadas donde ocurren.
//
// DOS IDIOMAS (§8.2). `datos.idioma` vale 'es' o 'en' y decide QUE BOLSA DE TEXTO
// se monta. La ESTRUCTURA es UNA SOLA: hay una unica montarCabecera y un unico
// bloqueA/B/C, y reciben la bolsa de textos por parametro. Por eso el orden, los
// tipos de elemento, los anchos de las tablas y el numero de filas son
// necesariamente identicos en los dos idiomas: no hay dos montajes que se puedan
// separar en silencio, solo dos diccionarios.
//
// LA TRAMPA DE TODO EL MONTAJE (§5.2), y la razon de que las funciones de bloque
// reciban los DOS anios por parametro en vez de leerlos de `datos`:
//   {{anio}} y {{anioSiguiente}} NO son constantes del documento. Valen cosas
//   distintas segun DONDE esten:
//     cabecera            -> {{anioSiguiente}} = anioDesplazamiento + 1
//     bloque montado 1.o  -> anio = anioDesp,     anioSiguiente = anioDesp + 1
//     bloque montado 2.o  -> anio = anioDesp + 1, anioSiguiente = anioDesp + 2
//   El {{anioSiguiente}} del plazo del modelo 720 vive DENTRO del bloque A. Si el
//   bloque A se monta como segundo, ese plazo es anioDesp + 2. Una sustitucion
//   global sobre el documento ya montado lo deja mal en la mitad de los casos,
//   asi que aqui NO HAY NINGUNA SUSTITUCION FINAL: cada bloque se monta con su
//   propio par de anios y sale ya resuelto. Esto vale IGUAL en los dos idiomas.
//
// Los bloques A, B y C son EXCLUYENTES y se montan DOS VECES (uno por anio). Si
// bloque1 === bloque2 se montan LOS DOS IGUAL: son dos anios distintos y el
// cliente tiene que ver los dos. No se deduplica (§5.1).
//
// Se prueba con: node docs/test-informe-cuerpo.js
// ============================================================================

'use strict';

// ---------------------------------------------------------------------------
// 1 · LA BOLSA DE TEXTOS EN ESPANOL
// ---------------------------------------------------------------------------
// Todo el texto fijo del informe, en un solo sitio. Las claves son las MISMAS en
// las dos bolsas: si falta una, el informe sale con "undefined" y la guarda del
// §5.6 no lo caza (undefined no lleva "{{"), asi que la prueba compara las dos
// listas de claves. Los tres unicos sitios donde entra un anio son funciones, y
// reciben el anio por parametro por lo del §5.2.
//
// rentasSujetas y modeloYPlazo (§5.3) viven aqui y no en Airtable porque no son
// datos del cliente: son del bloque. Los dos se toman de bloque1, el del anio de
// desplazamiento (decision 6 del 14/08), aunque el segundo bloque sea otro: la
// tabla del resumen solo tiene una fila para cada uno. El agujero esta declarado
// en el §3 de la spec.
const TEXTOS_ES = {
  idioma: 'es',

  // §8.1 · El documento lleva titulo y subtitulo. El titulo del /Info del PDF NO
  // es este: ese lo pone el pegamento del nodo y sigue siendo el de siempre.
  titulo: 'Reporte fiscal Mobility',
  subtitulo: 'Régimen especial de trabajadores desplazados (Ley Beckham) y obligaciones fiscales',

  // --- Cabecera (§5.1) ---
  campoNombre: 'Nombre',
  campoPaisOrigen: 'País de origen',
  campoFechaDesplazamiento: 'Fecha de desplazamiento',
  campoFechaReunion: 'Fecha de la reunión',
  tituloNotas: 'Notas e información proporcionada',
  introNotas: 'Según la información que nos has facilitado:',
  notaEstadoCivil: 'Estado civil: ',
  notaHijos: 'Hijos: ',
  notaSalario: 'Salario bruto anual: ',
  notaSalarioSufijo: ' euros.',
  notaResidencia: 'Residencia fiscal en los cinco años anteriores: ',
  notaPropiedades: 'Propiedades: ',
  notaInversiones: 'Inversiones: ',
  tituloResumen: 'Resumen',
  cabeceraResumen: ['Concepto', 'Situación'],
  filaSituacionEn: function (anio) { return 'Situación en ' + String(anio); },
  filaRentasSujetas: 'Rentas sujetas a tributación en España',
  filaDeclaracionYPlazo: 'Declaración y plazo',

  rentasSujetas: {
    A: 'Renta mundial: todos los ingresos obtenidos en el año, con independencia del lugar en el que se hayan generado o pagado.',
    B: 'Únicamente las rentas obtenidas en España.',
    C: 'Rendimientos del trabajo desde la llegada; intereses, dividendos, ganancias patrimoniales y arrendamientos de fuente española. Las propiedades e inversiones situadas en el extranjero no tributan.'
  },
  // Texto largo a proposito (decision 10 del 14/08). El del bloque B es mas largo
  // que los otros dos porque el plazo del no residente depende del tipo de renta
  // y la celda del resumen solo admite una frase; el detalle esta en la tabla 6.
  modeloYPlazo: {
    A: 'Modelo 100, entre los meses de abril y junio del año siguiente.',
    B: 'Modelo 210. El plazo depende del tipo de renta: salario, hasta el 20 de abril del año siguiente si sale a pagar; alquileres, hasta el 20 de abril del año siguiente; imputación de rentas, hasta el 31 de diciembre del año siguiente; transmisión de inmuebles, cuatro meses desde la transmisión.',
    C: 'Modelo 151, entre los meses de abril y junio del año siguiente. La solicitud del régimen se presenta con los modelos 030 y 149, dentro de los seis meses siguientes al alta en la Seguridad Social.'
  },

  // --- Bloque A · residente fiscal, regimen general ---
  A: {
    titulo: 'BLOQUE A — RESIDENTE FISCAL EN ESPAÑA (RÉGIMEN GENERAL)',
    p1: function (anio) {
      return 'Según la información que nos has facilitado, durante el año ' + String(anio) + ' vas a residir en España más de 183 días, por lo que serás considerado residente fiscal en España.';
    },
    p2: 'Los residentes fiscales en España están obligados a declarar y pagar impuestos por su renta mundial, esto es, por todos los ingresos obtenidos en el año con independencia del lugar en el que se hayan generado o pagado. En caso de haber tributado por esas mismas rentas en el extranjero, el Convenio de Doble Imposición suscrito entre España y el país de origen de la renta permite deducir el impuesto pagado fuera, con los límites que el propio Convenio establezca.',
    p3: 'El periodo impositivo coincide con el año natural y el impuesto se devenga el 31 de diciembre. La declaración es el modelo 100 y se presenta entre los meses de abril y junio del año siguiente.',

    tituloTrabajo: 'Rendimientos del trabajo',
    pTrabajo: 'Tributa la totalidad del salario, con independencia del lugar en el que se haya generado. En caso de desplazamientos al extranjero, el artículo 7.p de la Ley del IRPF permite dejar exentos los primeros 60.100 euros del salario correspondiente al trabajo realizado fuera de España, siempre que se cumplan los requisitos previstos. Su aplicación requiere un análisis individual.',

    tituloInmuebles: 'Tributación de bienes inmuebles',
    cabeceraInmuebles: ['Alquilado', 'Vacío o segunda residencia', 'Vivienda habitual'],
    inmuebles: [
      ['Se declara el alquiler, de corta o de larga duración, con independencia de dónde esté situado el inmueble.',
       'Se declaran todos los inmuebles vacíos, situados en España o en el extranjero.',
       'Únicamente se admite una vivienda habitual, junto con un máximo de dos garajes adquiridos en la misma fecha.'],
      ['Se tributa por el rendimiento neto: ingresos menos gastos deducibles.',
       'Se tributa sobre el valor catastral: el 1,1 % si está revisado y el 2 % en caso contrario.',
       'Se incluye en la declaración, pero no afecta al resultado.']
    ],

    tituloIntereses: 'Rendimientos de intereses, dividendos y acciones',
    cabeceraIntereses: ['Entidad española', 'Entidad extranjera'],
    intereses: [
      ['Se incorporan automáticamente a los Datos Fiscales.',
       'Tributan en los mismos términos, al declararse la renta mundial. Es necesario que nos facilites la información.']
    ],

    tituloTipos: 'Tipos impositivos',
    pTipos: 'Los tipos impositivos se dividen en base imponible general y base imponible del ahorro. La base general, que incluye los rendimientos del trabajo y del arrendamiento de bienes inmuebles, tributa a un tipo progresivo que parte del 19 % y alcanza el 54 % según la comunidad autónoma de residencia. La base del ahorro, que incluye los intereses, los dividendos y las ganancias derivadas de transmisiones patrimoniales, tributa entre el 19 % y el 30 %.',

    tituloOtras: 'Otras obligaciones fiscales',
    p030: 'Modelo 030. A tu llegada a España es necesario tramitarlo para comunicar tu llegada a la Agencia Tributaria y facilitar un domicilio a efectos de notificaciones.',
    p720: function (anioSiguiente) {
      return 'Modelo 720. Declaración informativa anual de bienes y derechos situados en el extranjero. Es obligatoria cuando, a 31 de diciembre, su valor supere los 50.000 euros en cualquiera de estos tres grupos: cuentas bancarias situadas fuera de España; valores, derechos y depósitos situados fuera de España; e inmuebles y derechos sobre los mismos situados fuera de España. No conlleva pago, dado que se trata de una obligación informativa. El plazo finaliza el 31 de marzo de ' + String(anioSiguiente) + '.';
    },
    p721: 'Modelo 721. Declaración informativa anual de monedas virtuales situadas en el extranjero. Es obligatoria cuando, a 31 de diciembre, su valor supere los 50.000 euros. Tiene el mismo carácter informativo y el mismo plazo de presentación.'
  },

  // --- Bloque B · no residente fiscal ---
  B: {
    titulo: 'BLOQUE B — NO RESIDENTE FISCAL EN ESPAÑA',
    p1: function (anio) {
      return 'Según la información que nos has facilitado, durante el año ' + String(anio) + ' vas a residir en España menos de 183 días, por lo que no serás considerado residente fiscal en España.';
    },
    p2: 'Los contribuyentes no residentes tributan únicamente por las rentas obtenidas en España.',

    tituloTrabajo: 'Rendimientos del trabajo',
    pTrabajo: 'Queda sujeto a tributación el salario correspondiente al trabajo desarrollado físicamente en España para una empresa española. Si la actividad se realiza desde España en beneficio de una empresa extranjera, con carácter general no queda sujeta a tributación en España; en ese supuesto es necesario analizar el Convenio de Doble Imposición aplicable para asegurar el correcto cumplimiento de las obligaciones fiscales.',

    tituloGravamen: 'Tipo de gravamen',
    cabeceraGravamen: ['Residentes en la Unión Europea', 'Residentes fuera de la Unión Europea'],
    // Los guiones largos de "—entre ellos, la Seguridad Social—" son los de la
    // plantilla y se quedan: WinAnsi los tiene (0x97).
    gravamen: [
      ['19 %, con derecho a deducir gastos —entre ellos, la Seguridad Social— tanto en el modelo 210 de rendimientos del trabajo como en el de arrendamientos.',
       '24 %, sin derecho a deducir gasto alguno. En rendimientos del trabajo, sobre el salario bruto. En arrendamientos, sobre el ingreso íntegro.']
    ],

    tituloInmobiliario: 'Rendimientos del capital inmobiliario',
    cabeceraInmobiliario: ['Alquilado', 'Vacío o segunda residencia'],
    inmobiliario: [
      ['Se declara el rendimiento del alquiler mediante el modelo 210.',
       'Se tributa por la renta imputada: el 1,1 % del valor catastral si está revisado y el 2 % en caso contrario.']
    ],
    pViviendaHabitual: 'Como no residente no resulta aplicable el concepto de vivienda habitual: ninguna vivienda situada en España queda exenta por este motivo.',

    tituloIntereses: 'Ingresos por intereses, dividendos y acciones',
    pIntereses: 'Únicamente tributan en España los de fuente española. Las inversiones situadas fuera de España no se declaran en España.',

    tituloObligaciones: 'Obligaciones de declaración como no residente',
    pObligaciones: 'Todas las declaraciones se presentan mediante el modelo 210. El plazo depende del tipo de renta:',
    cabeceraPlazos: ['Tipo de renta', 'Plazo de presentación'],
    // OJO, DEFECTO NUMERO 4 DE LA PLANTILLA Y NO ESTA EN EL §5.4: la primera
    // celda de plazo sale de TRES parrafos dentro de una misma celda del .docx y
    // la extraccion los pego sin separador ("...siguiente.A devolver:..."). Se
    // copia LITERAL, y la traduccion inglesa reproduce el mismo pegote, porque el
    // contrato solo autoriza tapar tres defectos y este no es uno de ellos. Si
    // hay que separarlos, es una linea aqui: decision del usuario, no del codigo.
    plazos: [
      ['Salario', 'A pagar: hasta el 20 de abril del año siguiente.A devolver: desde el 1 de febrero del año siguiente y dentro de los cuatro años posteriores.Resultado nulo: no es obligatoria la presentación.'],
      ['Alquileres de inmuebles', 'Anual, hasta el 20 de abril del año siguiente.'],
      ['Imputación de rentas (inmueble vacío)', 'Hasta el 31 de diciembre del año siguiente.'],
      ['Transmisión de inmuebles', 'Cuatro meses desde la fecha de transmisión.'],
      ['Sin rentas de fuente española, o con las retenciones ya practicadas', 'No hay obligación de presentar declaración.']
    ],
    p030: 'Modelo 030. A tu llegada a España es necesario tramitarlo para comunicar tu llegada a la Agencia Tributaria y facilitar un domicilio a efectos de notificaciones.'
  },

  // --- Bloque C · regimen especial (Ley Beckham) ---
  C: {
    titulo: 'BLOQUE C — RÉGIMEN ESPECIAL (LEY BECKHAM)',
    p1: 'Según la información que nos has facilitado, cumples los requisitos para acogerte al régimen especial aplicable a los trabajadores desplazados a territorio español. Tu cónyuge y tus hijos menores de veinticinco años pueden acogerse al mismo régimen si se desplazan contigo y cumplen las condiciones establecidas.',
    // El umbral de 50.000 euros va LITERAL (§5.5, decision 5 del 14/08). No es el
    // umbral de enrutado del bot y no se reabre aqui.
    p2: 'Se trata de un régimen opcional: en lugar de tributar por la renta mundial a tipos progresivos, se tributa en términos similares a los de un no residente y a tipo fijo. Con carácter general resulta ventajoso a partir de unos 50.000 euros brutos anuales.',
    p3: 'El régimen se aplica durante el año del desplazamiento y los cinco ejercicios siguientes, seis en total. Transcurrido ese plazo se tributa conforme al régimen general. La declaración anual es el modelo 151 y se presenta entre los meses de abril y junio del año siguiente.',

    tituloRentas: 'Rentas sujetas y tipos aplicables',
    cabeceraRentas: ['Tipo de renta', 'Sujeción en España', 'Tipo aplicable'],
    rentas: [
      ['Rendimientos del trabajo', 'Sujeción en España desde el momento de la llegada', '24 % – 47 %'],
      ['Intereses y dividendos de fuente española', 'Sí', '19 % – 30 %'],
      ['Ganancias por transmisión de elementos patrimoniales situados en España', 'Sí', '19 % – 30 %'],
      ['Arrendamiento de inmuebles situados en España', 'Sí', '24 %, sin deducción de gastos'],
      ['Propiedades e inversiones situadas en el extranjero', 'No', 'No tributan']
    ],
    pExtranjero: 'Si tienes propiedades o inversiones en el extranjero, no tributan bajo este régimen especial: únicamente se declaran las situadas en España.',

    tituloEscala: 'Escala aplicable a los rendimientos del trabajo',
    cabeceraEscala: ['Rendimientos del trabajo', 'Tipo aplicable'],
    escala: [
      ['De 0 a 600.000 euros', '24 %'],
      ['Desde 600.001 euros en adelante', '47 %']
    ],
    pSalario: 'Se incluye la totalidad del salario del periodo, salvo el correspondiente a la actividad desarrollada con anterioridad a la fecha de desplazamiento a España. No es deducible la Seguridad Social, y las aportaciones que la empresa realice a un plan de pensiones en tu nombre tributan como mayor salario.',

    tituloDesventajas: 'Desventajas del régimen',
    // AQUI SE TAPAN LOS TRES DEFECTOS DEL §5.4, y solo estos tres:
    //   1. La plantilla tiene una CUARTA vineta VACIA ("-" sola) entre "conjunta
    //      con el conyuge" y "indemnizacion por despido". Se tira: una vineta en
    //      blanco en un documento del cliente parece un dato que falta.
    //   2. "La prestacion por desempleo y las prestaciones por maternidad o
    //      paternidad tributan en su totalidad." SE QUEDO SIN VINETA en el .docx
    //      (quedo como parrafo aparte, detras de la lista). Va como item, que es
    //      donde le corresponde: es una desventaja mas.
    //   3. "La indemnizacion por despido no esta exenta" NO LLEVA PUNTO FINAL en
    //      la plantilla. Se le pone, porque las otras cuatro si lo llevan.
    // Los tres se tapan IGUAL en ingles: la lista inglesa tiene los mismos cinco
    // items, en el mismo orden.
    desventajas: [
      'No se aplican las deducciones de carácter general.',
      'No se admite la tributación conjunta con el cónyuge.',
      'La indemnización por despido no está exenta.',
      'La prestación por desempleo y las prestaciones por maternidad o paternidad tributan en su totalidad.',
      'No existe el concepto de vivienda habitual: la vivienda tributa por su valor catastral y, en caso de arrendamiento, sin deducir gastos.'
    ],
    // "al 24%" va sin espacio antes del % porque asi esta en la plantilla, aunque
    // el resto del documento escriba "24 %". No se uniforma: es texto literal, y
    // la traduccion respeta la misma rareza para que se vea que viene de origen.
    pAunAsi: 'Aun con estas limitaciones, al tributar a un tipo fijo al 24% generalmente, el régimen especial suele resultar igualmente más favorable que optar por el régimen general.',

    tituloRequisitos: 'Requisitos de acceso',
    requisitos: [
      'No haber sido residente fiscal en España durante los cinco años anteriores al desplazamiento.',
      'Que el desplazamiento se produzca por contrato de trabajo con una empresa española; por contrato de trabajo con una empresa extranjera, manteniendo la Seguridad Social en el país de origen; o por la condición de administrador de una sociedad en la que no se ostente participación o esta no supere el 25 %.',
      'No obtener rentas en España a través de un establecimiento permanente.'
    ],
    pSolicitud: 'El régimen se solicita mediante los modelos 030 y 149, dentro de los seis meses siguientes al alta en la Seguridad Social. TaxDown prepara y presenta ambos.',

    tituloExclusion: 'Causas de exclusión',
    exclusion: [
      'El ejercicio de una actividad económica por cuenta propia o la obtención de rentas calificadas como derivadas de un establecimiento permanente en España.',
      'La pérdida de la residencia fiscal en España, que implica la exclusión inmediata.',
      'La finalización de la relación laboral seguida de un periodo prolongado de inactividad, en torno a doce meses. El cambio de empresa y los periodos breves de inactividad no suponen exclusión.'
    ]
  }
};

// ---------------------------------------------------------------------------
// 2 · LA BOLSA DE TEXTOS EN INGLES (§8.2)
// ---------------------------------------------------------------------------
// ####################################################################
// #  AVISO · ESTE TEXTO ES UNA TRADUCCION, NO UN TEXTO REVISADO POR  #
// #  FISCAL. Se traduce frase a frase del espanol de la plantilla,   #
// #  sin resumir, sin reordenar y sin anadir ni quitar ninguna        #
// #  frase, pero NADIE DE FISCAL LO HA VALIDADO todavia. Antes de    #
// #  mandarselo a un cliente en ingles tiene que pasar revision.     #
// #  El texto espanol, que si viene del .docx de Fiscal, esta en     #
// #  TEXTOS_ES y NO se toca al revisar este.                         #
// ####################################################################
//
// REGLAS DE LA TRADUCCION, para que quien revise sepa que se ha hecho:
//   · Terminologia fijada por el encargo del 14/08: modelo N -> 'Form N';
//     IRPF -> 'Personal Income Tax'; Convenio de Doble Imposicion -> 'Double
//     Taxation Treaty'; residente fiscal -> 'tax resident'; renta mundial ->
//     'worldwide income'; base imponible general / del ahorro -> 'general /
//     savings taxable base'; rendimientos del trabajo -> 'employment income';
//     valor catastral -> 'cadastral value'; vivienda habitual -> 'primary
//     residence'; imputacion de rentas -> 'deemed income'; Seguridad Social ->
//     'Social Security'; Agencia Tributaria -> 'Spanish Tax Agency';
//     establecimiento permanente -> 'permanent establishment'; arrendamiento ->
//     'letting'; ganancias patrimoniales -> 'capital gains'; comunidad autonoma
//     -> 'autonomous region'.
//   · LAS CIFRAS SON LAS MISMAS. Solo cambia como se escriben: los miles con
//     COMA y los decimales con PUNTO (60.100 -> 60,100 · 1,1 % -> 1.1 %).
//   · El 50.000 del bloque C sigue siendo 50.000 (50,000). Decision cerrada del
//     usuario el 14/08 (§5.5): no es el umbral de enrutado del bot.
//   · Se conservan las rarezas de la plantilla que estan documentadas: el "24%"
//     sin espacio del bloque C y el pegote sin separador de la tabla 6.
//   · Ortografia britanica ('favourable', 'analysed', 'fulfilment'), porque el
//     destinatario es un cliente de una empresa espanola, no de EE.UU.
const TEXTOS_EN = {
  idioma: 'en',

  titulo: 'Mobility Tax Report',
  subtitulo: 'Special regime for inbound workers (Beckham Law) and tax obligations',

  // --- Header ---
  campoNombre: 'Name',
  campoPaisOrigen: 'Country of origin',
  campoFechaDesplazamiento: 'Date of relocation',
  campoFechaReunion: 'Date of the meeting',
  tituloNotas: 'Notes and information provided',
  introNotas: 'Based on the information you have provided:',
  notaEstadoCivil: 'Marital status: ',
  notaHijos: 'Children: ',
  notaSalario: 'Annual gross salary: ',
  notaSalarioSufijo: ' euros.',
  notaResidencia: 'Tax residence in the five preceding years: ',
  notaPropiedades: 'Properties: ',
  notaInversiones: 'Investments: ',
  tituloResumen: 'Summary',
  cabeceraResumen: ['Item', 'Situation'],
  filaSituacionEn: function (anio) { return 'Situation in ' + String(anio); },
  filaRentasSujetas: 'Income subject to taxation in Spain',
  filaDeclaracionYPlazo: 'Tax return and deadline',

  rentasSujetas: {
    A: 'Worldwide income: all income obtained during the year, regardless of where it was generated or paid.',
    B: 'Only income obtained in Spain.',
    C: 'Employment income from the arrival; Spanish-source interest, dividends, capital gains and lettings. Properties and investments located abroad are not taxed.'
  },
  modeloYPlazo: {
    A: 'Form 100, between the months of April and June of the following year.',
    B: 'Form 210. The deadline depends on the type of income: salary, until 20 April of the following year if the return results in a payment; lettings, until 20 April of the following year; deemed income, until 31 December of the following year; transfer of real estate, four months from the transfer.',
    C: 'Form 151, between the months of April and June of the following year. The application for the regime is filed with Forms 030 and 149, within the six months following registration with the Social Security.'
  },

  // --- Block A · tax resident, general regime ---
  A: {
    titulo: 'BLOCK A — TAX RESIDENT IN SPAIN (GENERAL REGIME)',
    p1: function (anio) {
      return 'Based on the information you have provided, during the year ' + String(anio) + ' you will reside in Spain for more than 183 days, and you will therefore be considered a tax resident in Spain.';
    },
    p2: 'Tax residents in Spain are required to declare and pay tax on their worldwide income, that is, on all income obtained during the year regardless of where it was generated or paid. Where tax has already been paid on that same income abroad, the Double Taxation Treaty signed between Spain and the country of source of the income allows the tax paid abroad to be deducted, subject to the limits established by the Treaty itself.',
    p3: 'The tax period coincides with the calendar year and the tax accrues on 31 December. The tax return is Form 100 and is filed between the months of April and June of the following year.',

    tituloTrabajo: 'Employment income',
    pTrabajo: 'The entire salary is taxed, regardless of where it was generated. In the case of assignments abroad, article 7.p of the Personal Income Tax Act allows the first 60,100 euros of the salary corresponding to work carried out outside Spain to be exempt, provided that the requirements laid down are met. Its application requires an individual analysis.',

    tituloInmuebles: 'Taxation of real estate',
    cabeceraInmuebles: ['Let', 'Vacant or second home', 'Primary residence'],
    inmuebles: [
      ['The letting is declared, whether short-term or long-term, regardless of where the property is located.',
       'All vacant properties are declared, whether located in Spain or abroad.',
       'Only one primary residence is allowed, together with a maximum of two garages acquired on the same date.'],
      ['Tax is paid on the net income: revenue less deductible expenses.',
       'Tax is paid on the cadastral value: 1.1 % if it has been revised and 2 % otherwise.',
       'It is included in the tax return, but it does not affect the outcome.']
    ],

    tituloIntereses: 'Income from interest, dividends and shares',
    cabeceraIntereses: ['Spanish entity', 'Foreign entity'],
    intereses: [
      ['They are automatically included in the Tax Data.',
       'They are taxed on the same terms, since worldwide income is declared. You will need to provide us with the information.']
    ],

    tituloTipos: 'Tax rates',
    pTipos: 'Tax rates are divided into the general taxable base and the savings taxable base. The general base, which includes employment income and income from the letting of real estate, is taxed at a progressive rate starting at 19 % and reaching 54 % depending on the autonomous region of residence. The savings base, which includes interest, dividends and gains arising from transfers of assets, is taxed at between 19 % and 30 %.',

    tituloOtras: 'Other tax obligations',
    p030: 'Form 030. On your arrival in Spain it must be filed in order to notify your arrival to the Spanish Tax Agency and to provide an address for notification purposes.',
    p720: function (anioSiguiente) {
      return 'Form 720. Annual informative return of assets and rights located abroad. It is mandatory when, as at 31 December, their value exceeds 50,000 euros in any of these three groups: bank accounts located outside Spain; securities, rights and deposits located outside Spain; and real estate and rights over real estate located outside Spain. It does not involve any payment, since it is an informative obligation. The deadline ends on 31 March ' + String(anioSiguiente) + '.';
    },
    p721: 'Form 721. Annual informative return of virtual currencies located abroad. It is mandatory when, as at 31 December, their value exceeds 50,000 euros. It has the same informative nature and the same filing deadline.'
  },

  // --- Block B · non-tax resident ---
  B: {
    titulo: 'BLOCK B — NON-TAX RESIDENT IN SPAIN',
    p1: function (anio) {
      return 'Based on the information you have provided, during the year ' + String(anio) + ' you will reside in Spain for fewer than 183 days, and you will therefore not be considered a tax resident in Spain.';
    },
    p2: 'Non-resident taxpayers are taxed only on the income obtained in Spain.',

    tituloTrabajo: 'Employment income',
    pTrabajo: 'The salary corresponding to work physically carried out in Spain for a Spanish company is subject to taxation. If the activity is carried out from Spain for the benefit of a foreign company, as a general rule it is not subject to taxation in Spain; in that case the applicable Double Taxation Treaty must be analysed in order to ensure the correct fulfilment of tax obligations.',

    tituloGravamen: 'Tax rate',
    cabeceraGravamen: ['Residents in the European Union', 'Residents outside the European Union'],
    gravamen: [
      ['19 %, with the right to deduct expenses —among them, the Social Security— both in the Form 210 for employment income and in the one for lettings.',
       '24 %, with no right to deduct any expense. For employment income, on the gross salary. For lettings, on the gross revenue.']
    ],

    tituloInmobiliario: 'Income from real estate capital',
    cabeceraInmobiliario: ['Let', 'Vacant or second home'],
    inmobiliario: [
      ['The income from the letting is declared through Form 210.',
       'Tax is paid on the deemed income: 1.1 % of the cadastral value if it has been revised and 2 % otherwise.']
    ],
    pViviendaHabitual: 'As a non-resident, the concept of primary residence does not apply: no dwelling located in Spain is exempt on this ground.',

    tituloIntereses: 'Income from interest, dividends and shares',
    pIntereses: 'Only those of Spanish source are taxed in Spain. Investments located outside Spain are not declared in Spain.',

    tituloObligaciones: 'Filing obligations as a non-resident',
    pObligaciones: 'All returns are filed through Form 210. The deadline depends on the type of income:',
    cabeceraPlazos: ['Type of income', 'Filing deadline'],
    // El pegote sin separador de la primera celda se reproduce IGUAL que en
    // espanol ("...year.Refundable:..."): es el defecto 4 de la plantilla y el
    // contrato no autoriza taparlo.
    plazos: [
      ['Salary', 'Payable: until 20 April of the following year.Refundable: from 1 February of the following year and within the four subsequent years.Nil result: filing is not mandatory.'],
      ['Lettings of real estate', 'Annual, until 20 April of the following year.'],
      ['Deemed income (vacant property)', 'Until 31 December of the following year.'],
      ['Transfer of real estate', 'Four months from the date of transfer.'],
      ['No Spanish-source income, or with the withholdings already applied', 'There is no obligation to file a return.']
    ],
    p030: 'Form 030. On your arrival in Spain it must be filed in order to notify your arrival to the Spanish Tax Agency and to provide an address for notification purposes.'
  },

  // --- Block C · special regime (Beckham Law) ---
  C: {
    titulo: 'BLOCK C — SPECIAL REGIME (BECKHAM LAW)',
    p1: 'Based on the information you have provided, you meet the requirements to opt for the special regime applicable to workers relocated to Spanish territory. Your spouse and your children under twenty-five years of age may opt for the same regime if they relocate with you and meet the conditions laid down.',
    p2: 'This is an optional regime: instead of being taxed on worldwide income at progressive rates, tax is paid on terms similar to those of a non-resident and at a flat rate. As a general rule it is advantageous from around 50,000 euros gross per year.',
    p3: 'The regime applies during the year of the relocation and the five following tax years, six in total. Once that period has elapsed, tax is paid under the general regime. The annual return is Form 151 and is filed between the months of April and June of the following year.',

    tituloRentas: 'Income subject to tax and applicable rates',
    cabeceraRentas: ['Type of income', 'Subject to tax in Spain', 'Applicable rate'],
    rentas: [
      ['Employment income', 'Subject to tax in Spain from the moment of arrival', '24 % – 47 %'],
      ['Interest and dividends of Spanish source', 'Yes', '19 % – 30 %'],
      ['Capital gains on the transfer of assets located in Spain', 'Yes', '19 % – 30 %'],
      ['Letting of real estate located in Spain', 'Yes', '24 %, with no deduction of expenses'],
      ['Properties and investments located abroad', 'No', 'Not taxed']
    ],
    pExtranjero: 'If you have properties or investments abroad, they are not taxed under this special regime: only those located in Spain are declared.',

    tituloEscala: 'Scale applicable to employment income',
    cabeceraEscala: ['Employment income', 'Applicable rate'],
    escala: [
      ['From 0 to 600,000 euros', '24 %'],
      ['From 600,001 euros onwards', '47 %']
    ],
    pSalario: 'The entire salary for the period is included, except for that corresponding to the activity carried out prior to the date of relocation to Spain. The Social Security is not deductible, and the contributions that the company makes to a pension plan on your behalf are taxed as additional salary.',

    tituloDesventajas: 'Disadvantages of the regime',
    // Los tres defectos del §5.4, tapados igual que en espanol: no hay item
    // vacio, la linea de desempleo/maternidad/paternidad ES un item (la tercera
    // del .docx quedo sin vineta) y la del despido lleva punto final.
    desventajas: [
      'The general deductions do not apply.',
      'Joint taxation with the spouse is not allowed.',
      'Severance pay on dismissal is not exempt.',
      'Unemployment benefit and maternity or paternity benefits are taxed in full.',
      'The concept of primary residence does not exist: the dwelling is taxed on its cadastral value and, in the case of letting, without deducting expenses.'
    ],
    pAunAsi: 'Even with these limitations, since tax is generally paid at a flat rate of 24%, the special regime is usually still more favourable than opting for the general regime.',

    tituloRequisitos: 'Access requirements',
    requisitos: [
      'Not having been a tax resident in Spain during the five years preceding the relocation.',
      'That the relocation takes place under an employment contract with a Spanish company; under an employment contract with a foreign company, maintaining the Social Security in the country of origin; or by reason of being a director of a company in which no shareholding is held or in which the shareholding does not exceed 25 %.',
      'Not obtaining income in Spain through a permanent establishment.'
    ],
    pSolicitud: 'The regime is applied for through Forms 030 and 149, within the six months following registration with the Social Security. TaxDown prepares and files both.',

    tituloExclusion: 'Grounds for exclusion',
    exclusion: [
      'Carrying out a self-employed economic activity or obtaining income classified as deriving from a permanent establishment in Spain.',
      'The loss of tax residence in Spain, which entails immediate exclusion.',
      'The termination of the employment relationship followed by a prolonged period of inactivity, of around twelve months. A change of company and short periods of inactivity do not give rise to exclusion.'
    ]
  }
};

const TEXTOS = { es: TEXTOS_ES, en: TEXTOS_EN };

// ---------------------------------------------------------------------------
// 3 · UTILIDADES
// ---------------------------------------------------------------------------

// El ingles es el caso EXPLICITO y el espanol la rama por defecto, igual que en
// la automatizacion 3b y en el §8.2: si `Idioma` viene vacio o con cualquier otra
// cosa, el informe sale en espanol. Aqui NO se para el informe por el idioma
// (a diferencia del bloque): un idioma raro es cosmetico y el espanol es la
// version que Fiscal ha revisado, asi que es el sitio seguro al que caer.
function normalizarIdioma(valor) {
  return String(valor == null ? '' : valor).trim().toLowerCase() === 'en' ? 'en' : 'es';
}

function textosDeIdioma(valor) {
  return TEXTOS[normalizarIdioma(valor)];
}

// Los bloques se identifican por una sola letra. Se acepta tanto 'A' como
// 'BLOQUE_A' o 'bloque a' porque la pieza 3 y el pseudocodigo de la spec usan
// nombres distintos para lo mismo, y una frontera que se rompe por el prefijo del
// identificador es un fallo tonto. Lo que NO se hace es elegir un bloque por
// defecto: un informe con el regimen fiscal equivocado es peor que no mandarlo.
function normalizarBloque(valor) {
  const letra = String(valor == null ? '' : valor)
    .toUpperCase()
    .replace(/BLOQUE/g, '')
    .replace(/[^ABC]/g, '');
  if (letra.length !== 1) {
    throw new Error('No se monta el informe: no reconozco el bloque ' + JSON.stringify(valor) + '. Solo hay A, B y C.');
  }
  return letra;
}

// El anio se imprime con cuatro digitos y SIN separador de miles (2026, nunca
// 2.026), asi que se maneja como numero y se pasa a texto con String, jamas con
// toLocaleString. Si lo que llega no es un anio, se para: un 'NaN' en la fila
// "Situacion en NaN" de un documento fiscal es de las cosas que nadie ve hasta
// que lo ve el cliente.
function normalizarAnio(valor) {
  const n = Number(String(valor == null ? '' : valor).trim());
  if (!Number.isInteger(n) || n < 1900 || n > 2999) {
    throw new Error('No se monta el informe: el anio de desplazamiento ' + JSON.stringify(valor) + ' no es un anio de cuatro digitos.');
  }
  return n;
}

// Lee un marcador de `datos` y lo devuelve como texto. Lanza si la clave no
// existe o es null, porque eso NO es un caso de negocio, es que la frontera con
// la pieza 3 esta rota: sin esto, el cliente recibiria "Estado civil: undefined."
// La cadena vacia SI pasa: las paradas de negocio son las siete del §4.6 y las
// decide resolverDatos, no esta pieza.
function marcador(datos, clave) {
  const v = datos[clave];
  if (v === undefined || v === null) {
    throw new Error('No se monta el informe: falta el marcador "' + clave + '" en los datos resueltos.');
  }
  return String(v);
}

// ---------------------------------------------------------------------------
// 4 · TITULO DEL DOCUMENTO (§8.1)
// ---------------------------------------------------------------------------
// El logo va EL PRIMERO de todo el array, y detras el titulo del documento y su
// subtitulo, LOS DOS CENTRADOS (§9.1, §9.2 y §9.3). El motor ya sabe dibujar los
// tres (titulo0 en Times-Bold 19 y el logo como XObject de imagen): esta pieza no
// toca el motor, solo pide los elementos.
//
// EL ELEMENTO 'logo' NO LLEVA DATOS. El motor coge el JPEG de la pieza
// logo-taxdown-2026-08-14.js, que va concatenada la primera, y si no esta en el
// ambito se salta el elemento sin lanzar: un informe sin logo sigue siendo un
// informe. Aqui no hay nada que comprobar.
function montarTitulo(T) {
  return [
    { tipo: 'logo' },
    { tipo: 'titulo0', texto: T.titulo, centrado: true },
    { tipo: 'parrafo', texto: T.subtitulo, centrado: true }
  ];
}

// ---------------------------------------------------------------------------
// 5 · CABECERA (§5.1)
// ---------------------------------------------------------------------------
// El {{anioSiguiente}} de la cabecera es SIEMPRE anioDesplazamiento + 1, pase lo
// que pase con los bloques. Se recibe por parametro y no se recalcula aqui para
// que el ambito de anios de la cabecera sea tan explicito como el de los bloques.
function montarCabecera(datos, anioDesplazamiento, anioSiguiente, T) {
  const t = T || textosDeIdioma(datos.idioma);
  const bloque1 = normalizarBloque(datos.bloque1);

  return [
    { tipo: 'campo', etiqueta: t.campoNombre, valor: marcador(datos, 'nombreCompleto') },
    { tipo: 'campo', etiqueta: t.campoPaisOrigen, valor: marcador(datos, 'paisOrigen') },
    { tipo: 'campo', etiqueta: t.campoFechaDesplazamiento, valor: marcador(datos, 'fechaDesplazamiento') },
    // La plantilla la llama "Fecha de la reunion". La columna FechaLlamada existe
    // desde el §8.5; si esta vacia, la pieza 3 manda 'Por confirmar' / 'To be
    // confirmed' y el informe SIGUE saliendo.
    { tipo: 'campo', etiqueta: t.campoFechaReunion, valor: marcador(datos, 'fechaLlamada') },

    { tipo: 'titulo2', texto: t.tituloNotas },
    { tipo: 'parrafo', texto: t.introNotas },

    // Las seis vinetas de la plantilla. El texto fijo (" euros.", los dos puntos)
    // es de la plantilla; lo variable son los marcadores ya formateados y YA EN
    // EL IDIOMA de datos.idioma (§8.2: el cuerpo no traduce datos).
    { tipo: 'lista', items: [
      t.notaEstadoCivil + marcador(datos, 'estadoCivil') + '.',
      t.notaHijos + marcador(datos, 'hijos') + '.',
      t.notaSalario + marcador(datos, 'salarioBrutoAnual') + t.notaSalarioSufijo,
      t.notaResidencia + marcador(datos, 'residenciaFiscal5Anios') + '.',
      t.notaPropiedades + marcador(datos, 'sumaPropiedades') + '.',
      t.notaInversiones + marcador(datos, 'sumaInversiones') + '.'
    ] },

    // Tabla 1 de la plantilla. El titulo del resumen es titulo de la tabla, no un
    // titulo2.
    { tipo: 'tabla',
      titulo: t.tituloResumen,
      cabecera: t.cabeceraResumen,
      anchos: [0.38, 0.62],
      filas: [
        [t.filaSituacionEn(anioDesplazamiento), marcador(datos, 'situacionAnioDesplazamiento')],
        [t.filaSituacionEn(anioSiguiente), marcador(datos, 'situacionAnioSiguiente')],
        [t.filaRentasSujetas, t.rentasSujetas[bloque1]],
        [t.filaDeclaracionYPlazo, t.modeloYPlazo[bloque1]]
      ] }
  ];
}

// ---------------------------------------------------------------------------
// 6 · BLOQUE A · RESIDENTE FISCAL (REGIMEN GENERAL)
// ---------------------------------------------------------------------------
// Firma (anio, anioSiguiente, T) a proposito: son los DOS anios del ambito de
// ESTA instancia del bloque, no los del documento. Aqui viven las dos apariciones
// que hacen delicado el montaje: el {{anio}} del primer parrafo y el
// {{anioSiguiente}} del plazo del modelo 720.
function bloqueA(anio, anioSiguiente, T) {
  const t = (T || TEXTOS_ES).A;
  return [
    { tipo: 'titulo1', texto: t.titulo },

    { tipo: 'parrafo', texto: t.p1(anio) },
    { tipo: 'parrafo', texto: t.p2 },
    { tipo: 'parrafo', texto: t.p3 },

    { tipo: 'titulo2', texto: t.tituloTrabajo },
    { tipo: 'parrafo', texto: t.pTrabajo },

    { tipo: 'titulo2', texto: t.tituloInmuebles },
    // Tabla 2 de la plantilla.
    { tipo: 'tabla',
      cabecera: t.cabeceraInmuebles,
      anchos: [0.34, 0.33, 0.33],
      filas: t.inmuebles },

    { tipo: 'titulo2', texto: t.tituloIntereses },
    // Tabla 3 de la plantilla.
    { tipo: 'tabla',
      cabecera: t.cabeceraIntereses,
      anchos: [0.5, 0.5],
      filas: t.intereses },

    { tipo: 'titulo2', texto: t.tituloTipos },
    { tipo: 'parrafo', texto: t.pTipos },

    { tipo: 'titulo2', texto: t.tituloOtras },
    { tipo: 'parrafo', texto: t.p030 },
    // AQUI ESTA LA TRAMPA DEL §5.2. Este {{anioSiguiente}} es el del ambito de
    // ESTE bloque: si el bloque A se monta como segundo, el plazo del 720 cae en
    // anioDesplazamiento + 2, no en +1. Por eso el anio entra por parametro, y por
    // eso da igual el idioma: la regla es de estructura, no de texto.
    { tipo: 'parrafo', texto: t.p720(anioSiguiente) },
    { tipo: 'parrafo', texto: t.p721 }
  ];
}

// ---------------------------------------------------------------------------
// 7 · BLOQUE B · NO RESIDENTE FISCAL
// ---------------------------------------------------------------------------
// Recibe anioSiguiente aunque no lo use: la firma es la misma en los tres
// bloques para que montarBloque no tenga que saber cual usa que. Su unico
// marcador es el {{anio}} del primer parrafo.
function bloqueB(anio, anioSiguiente, T) {
  const t = (T || TEXTOS_ES).B;
  return [
    { tipo: 'titulo1', texto: t.titulo },

    { tipo: 'parrafo', texto: t.p1(anio) },
    { tipo: 'parrafo', texto: t.p2 },

    { tipo: 'titulo2', texto: t.tituloTrabajo },
    { tipo: 'parrafo', texto: t.pTrabajo },

    { tipo: 'titulo2', texto: t.tituloGravamen },
    // Tabla 4 de la plantilla.
    { tipo: 'tabla',
      cabecera: t.cabeceraGravamen,
      anchos: [0.5, 0.5],
      filas: t.gravamen },

    { tipo: 'titulo2', texto: t.tituloInmobiliario },
    // Tabla 5 de la plantilla.
    { tipo: 'tabla',
      cabecera: t.cabeceraInmobiliario,
      anchos: [0.5, 0.5],
      filas: t.inmobiliario },
    { tipo: 'parrafo', texto: t.pViviendaHabitual },

    { tipo: 'titulo2', texto: t.tituloIntereses },
    { tipo: 'parrafo', texto: t.pIntereses },

    { tipo: 'titulo2', texto: t.tituloObligaciones },
    { tipo: 'parrafo', texto: t.pObligaciones },
    // Tabla 6 de la plantilla.
    { tipo: 'tabla',
      cabecera: t.cabeceraPlazos,
      anchos: [0.34, 0.66],
      filas: t.plazos },

    { tipo: 'parrafo', texto: t.p030 }
  ];
}

// ---------------------------------------------------------------------------
// 8 · BLOQUE C · REGIMEN ESPECIAL (LEY BECKHAM)
// ---------------------------------------------------------------------------
// El bloque C NO LLEVA NINGUN MARCADOR: en la plantilla no aparece ni {{anio}} ni
// {{anioSiguiente}} dentro de el. Recibe los dos anios igual que los otros dos
// para que las tres firmas sean identicas y montarBloque no tenga excepciones.
function bloqueC(anio, anioSiguiente, T) {
  const t = (T || TEXTOS_ES).C;
  return [
    { tipo: 'titulo1', texto: t.titulo },

    { tipo: 'parrafo', texto: t.p1 },
    { tipo: 'parrafo', texto: t.p2 },
    { tipo: 'parrafo', texto: t.p3 },

    { tipo: 'titulo2', texto: t.tituloRentas },
    // Tabla 7 de la plantilla.
    { tipo: 'tabla',
      cabecera: t.cabeceraRentas,
      anchos: [0.42, 0.33, 0.25],
      filas: t.rentas },
    { tipo: 'parrafo', texto: t.pExtranjero },

    { tipo: 'titulo2', texto: t.tituloEscala },
    // Tabla 8 de la plantilla.
    { tipo: 'tabla',
      cabecera: t.cabeceraEscala,
      anchos: [0.6, 0.4],
      filas: t.escala },
    { tipo: 'parrafo', texto: t.pSalario },

    { tipo: 'titulo2', texto: t.tituloDesventajas },
    // Los tres defectos del §5.4 estan tapados en la propia bolsa de textos, en
    // los dos idiomas, y alli van comentados uno a uno.
    { tipo: 'lista', items: t.desventajas },
    { tipo: 'parrafo', texto: t.pAunAsi },

    { tipo: 'titulo2', texto: t.tituloRequisitos },
    { tipo: 'lista', items: t.requisitos },
    { tipo: 'parrafo', texto: t.pSolicitud },

    { tipo: 'titulo2', texto: t.tituloExclusion },
    { tipo: 'lista', items: t.exclusion }
  ];
}

// ---------------------------------------------------------------------------
// 9 · MONTAJE DE UN BLOQUE POR SU LETRA
// ---------------------------------------------------------------------------
// Un solo sitio donde se traduce letra -> funcion, para que no haya dos.
function montarBloque(letra, anio, anioSiguiente, T) {
  if (letra === 'A') return bloqueA(anio, anioSiguiente, T);
  if (letra === 'B') return bloqueB(anio, anioSiguiente, T);
  if (letra === 'C') return bloqueC(anio, anioSiguiente, T);
  throw new Error('No se monta el informe: bloque desconocido "' + letra + '".');
}

// ---------------------------------------------------------------------------
// 10 · LA GUARDA FINAL (§5.6)
// ---------------------------------------------------------------------------
// Recorre la salida y lanza si queda un "{{" en cualquier texto o celda: un
// marcador sin resolver no puede llegar a un cliente. De paso se comprueban las
// reglas del IR del §1 que el motor da por buenas y no vuelve a mirar (celdas
// nunca undefined/null, anchos que suman 1, tantos anchos como columnas): si el
// motor se las encuentra mal, el fallo aparece como un PDF torcido y no como un
// error, y eso cuesta mucho mas de encontrar.
function comprobarSalida(elementos) {
  const vigilar = function (valor, donde) {
    if (valor === undefined || valor === null) {
      throw new Error('IR invalido en ' + donde + ': ninguna celda ni texto puede ser undefined ni null (cadena vacia si).');
    }
    if (String(valor).indexOf('{{') !== -1) {
      throw new Error('MARCADOR SIN RESOLVER en ' + donde + ': ' + JSON.stringify(String(valor)) + '. No se genera el informe.');
    }
  };

  elementos.forEach(function (el, i) {
    const donde = 'elemento ' + i + ' (' + el.tipo + ')';
    if (el.tipo === 'saltoPagina') return;

    if (el.tipo === 'campo') {
      vigilar(el.etiqueta, donde + ' etiqueta');
      vigilar(el.valor, donde + ' valor');
      return;
    }
    if (el.tipo === 'lista') {
      if (!Array.isArray(el.items) || el.items.length === 0) {
        throw new Error('IR invalido en ' + donde + ': una lista sin items no se dibuja, se borra.');
      }
      el.items.forEach(function (it, j) { vigilar(it, donde + ' item ' + j); });
      return;
    }
    if (el.tipo === 'tabla') {
      // El titulo es opcional (§1); la cabecera puede ser null.
      if (el.titulo !== undefined) vigilar(el.titulo, donde + ' titulo');
      const columnas = el.anchos.length;
      const suma = el.anchos.reduce(function (a, b) { return a + b; }, 0);
      if (Math.abs(suma - 1) > 1e-9) {
        throw new Error('IR invalido en ' + donde + ': los anchos suman ' + suma + ' y tienen que sumar 1.');
      }
      if (el.cabecera !== null && el.cabecera !== undefined) {
        if (el.cabecera.length !== columnas) {
          throw new Error('IR invalido en ' + donde + ': ' + el.cabecera.length + ' celdas de cabecera para ' + columnas + ' anchos.');
        }
        el.cabecera.forEach(function (c, j) { vigilar(c, donde + ' cabecera ' + j); });
      }
      el.filas.forEach(function (fila, f) {
        if (fila.length !== columnas) {
          throw new Error('IR invalido en ' + donde + ': la fila ' + f + ' tiene ' + fila.length + ' celdas y hay ' + columnas + ' anchos.');
        }
        fila.forEach(function (c, j) { vigilar(c, donde + ' fila ' + f + ' celda ' + j); });
      });
      return;
    }
    // 'logo' NO LLEVA TEXTO, y es lo unico del IR que no lo lleva: los datos del
    // logo salen de otra pieza y el motor los coge de ahi. Sin esta salida, la
    // guarda del §5.6 lo tomaba por un elemento con el texto a undefined y
    // lanzaba, tumbando el informe entero por el elemento numero cero.
    if (el.tipo === 'logo') return;
    // titulo0, titulo1, titulo2, parrafo
    vigilar(el.texto, donde + ' texto');
  });

  return elementos;
}

// ---------------------------------------------------------------------------
// 11 · MONTAR EL INFORME ENTERO (§5.1 y §8.1)
// ---------------------------------------------------------------------------
// datos: los 17 marcadores ya resueltos por la pieza 3, mas bloque1, bloque2 e
// idioma. Los VALORES ya vienen en el idioma que toca (§8.2): aqui solo se elige
// la bolsa de texto fijo.
//
// OJO CON LAS FILAS DE LAS TABLAS: las cabeceras y las filas fijas salen de la
// bolsa de textos, que es un objeto compartido entre llamadas. Se copian con
// slice() para que el motor (o cualquiera) no pueda mutar la bolsa y contaminar
// el informe siguiente del mismo lote: en n8n el nodo procesa varias filas de
// Airtable en la misma ejecucion y el modulo se carga una sola vez.
function montarElementos(datos) {
  if (!datos || typeof datos !== 'object') {
    throw new Error('No se monta el informe: montarElementos necesita el objeto de datos resueltos.');
  }

  const T = textosDeIdioma(datos.idioma);

  const anioDesplazamiento = normalizarAnio(datos.anioDesplazamiento);
  const anioSiguiente = anioDesplazamiento + 1;

  const bloque1 = normalizarBloque(datos.bloque1);
  const bloque2 = normalizarBloque(datos.bloque2);

  const elementos = [];

  // El titulo del documento y su subtitulo, los primeros del array (§8.1).
  montarTitulo(T).forEach(function (el) { elementos.push(el); });

  // La cabecera SIEMPRE con anioDesplazamiento y anioDesplazamiento + 1.
  montarCabecera(datos, anioDesplazamiento, anioSiguiente, T).forEach(function (el) { elementos.push(el); });

  // Y los dos bloques, cada uno con SU par de anios. Aqui esta todo el §5.2:
  // el segundo bloque va desplazado un anio, incluido el plazo del 720 si el
  // segundo bloque resulta ser el A.
  montarBloque(bloque1, anioDesplazamiento, anioDesplazamiento + 1, T).forEach(function (el) { elementos.push(el); });
  montarBloque(bloque2, anioSiguiente, anioSiguiente + 1, T).forEach(function (el) { elementos.push(el); });
  // Si bloque1 === bloque2 el bloque sale DOS VECES, y esta bien: son dos anios
  // distintos y el cliente tiene que ver los dos (§5.1). No se deduplica.

  return comprobarSalida(desligarDeLaBolsa(elementos));
}

// Copia superficial de las listas y de las tablas que vienen de la bolsa de
// textos. Sin esto, dos informes del mismo lote comparten el MISMO array de
// filas: nadie lo muta hoy, pero un `filas.push()` en cualquier futuro lo
// convertiria en un informe con filas de otro cliente, y eso no salta en
// ninguna prueba.
function desligarDeLaBolsa(elementos) {
  return elementos.map(function (el) {
    if (el.tipo === 'lista') {
      return { tipo: 'lista', items: el.items.slice() };
    }
    if (el.tipo === 'tabla') {
      const copia = {
        tipo: 'tabla',
        cabecera: Array.isArray(el.cabecera) ? el.cabecera.slice() : el.cabecera,
        anchos: el.anchos.slice(),
        filas: el.filas.map(function (f) { return f.slice(); })
      };
      // El titulo es opcional: si no lo lleva, no se inventa una clave.
      if (el.titulo !== undefined) copia.titulo = el.titulo;
      return copia;
    }
    return el;
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    montarElementos,
    montarTitulo,
    montarCabecera,
    bloqueA,
    bloqueB,
    bloqueC,
    montarBloque,
    comprobarSalida,
    normalizarBloque,
    normalizarAnio,
    normalizarIdioma,
    textosDeIdioma,
    TEXTOS,
    TEXTOS_ES,
    TEXTOS_EN
  };
}
