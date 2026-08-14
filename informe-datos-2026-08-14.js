// ============================================================================
// DATOS Y MARCADORES DEL INFORME MOBILITY · Pieza 3 · §4 del contrato del 14/08
// ----------------------------------------------------------------------------
// resolverDatos(fila) -> { ok:true, datos } | { ok:false, error:'motivo en cristiano' }
//
// `fila` es el objeto `fields` de un registro de Airtable, con los NOMBRES de
// columna como claves (no los fld...), que es lo que entrega el nodo Airtable.
//
// ESTA PIEZA ES LA UNICA QUE MIRA AIRTABLE. La pieza 4 (el cuerpo) recibe los
// marcadores ya formateados y no vuelve a tocar la fila; el motor del PDF no
// sabe ni que existe Airtable. Todo lo que huela a "esto viene de una celda"
// tiene que estar aqui.
//
// LA REGLA QUE MANDA SOBRE TODAS: NUNCA SE ELIGE UN BLOQUE POR DEFECTO. Si la
// situacion fiscal no se reconoce, no llega o llega en error, se PARA con un
// motivo legible. Un informe con el regimen fiscal equivocado es peor que no
// mandar informe, porque el cliente se lo va a guardar y lo va a creer.
//
// ── EL ADDENDUM DEL 14/08 (TARDE): §8.2 IDIOMA Y §8.5 FechaLlamada ──────────
// Esta pieza pasa a resolver TAMBIEN el idioma, y devuelve `datos.idioma` con
// 'es' o 'en'. La regla es la de la automatizacion 3b de Airtable: la opcion
// `Ingles` de la columna `Idioma` es el caso EXPLICITO y el espanol es la RAMA
// POR DEFECTO. Un `Idioma` vacio, ausente o con una opcion nueva sale en
// espanol, que es lo que hoy ya recibe cualquiera que no pidiera ingles; lo
// contrario (una rama por defecto en ingles) mandaria una memoria fiscal en un
// idioma que el cliente no eligio.
//
// Y TODOS los valores de presentacion salen YA en el idioma que toque, porque
// el §8.2 dice que la pieza 4 no traduce nada: solo elige que bloque de texto
// monta. Lo que cambia con el idioma esta en la tabla del §8.2 y en la §6 de
// este fichero. Lo que NO cambia, y es facil de traducir por inercia:
//   - fechaDesplazamiento y fechaLlamada van en DD/MM/AAAA en LOS DOS idiomas:
//     el cliente vive en Espana y va a cotejar el informe con papeles espanoles.
//     Un 09/01/2026 leido a la americana son ocho meses de diferencia.
//   - los anios siguen siendo NUMEROS y sin separador de miles en los dos.
//   - bloque1 y bloque2 siguen siendo 'A'/'B'/'C': el regimen fiscal no depende
//     del idioma del documento.
// Y lo que SI cambia y no se ve a simple vista: el separador de miles del
// salario (punto en es, coma en en) y que el estado civil en ingles NO se
// concuerda con `Sexo` ('Married' vale para los dos). La concordancia de genero
// es una regla del espanol, no del informe.
//
// ── LAS SEIS COSAS QUE SE ROMPEN EN SILENCIO, Y DONDE SE TAPAN ──────────────
// 1. Una formula en error NO viene como texto, viene como OBJETO:
//      { state:'error', errorType:'emptyDependency', value:null, isStale:false }
//    Se detecta ANTES de cualquier trim(): String(objeto) da '[object Object]',
//    que pasaria por "situacion fiscal desconocida" en vez de por "columna en
//    error", y son dos motivos distintos que se arreglan de forma distinta.
//    -> esCeldaEnError(), llamada primero en leerSituacion().
// 2. `Situación fiscal Anio Desplazamiento` tiene CINCO valores, no tres. El
//    quinto ('No residente NO UE') es la MAYORIA del embudo y no esta en la
//    spec del 13/08. Leido de la formula viva el 14/08 (fldSPyJNpHZQMJjsX).
//    -> SITUACION_A_BLOQUE, con los cuatro literales + el vacio que aborta.
// 3. Valor desconocido -> ok:false. Jamas un bloque por defecto.
//    -> leerSituacion(), ultimo caso.
// 4. La fecha llega como '2026-09-01' O como '2026-09-01T12:00:00.000Z' (el
//    escritor manda datetime porque las columnas van con typecast). Y NO se usa
//    new Date(x).getFullYear(): con una fecha sin hora, el desplazamiento de
//    zona puede restar un dia y cambiar el ANIO en un 1 de enero. Se parsean
//    los digitos.  -> partirFecha().
// 5. El salario lleva separador de miles y el anio NO. 345678 -> '345.678',
//    pero 2026 -> 2026 y nunca '2.026'.  -> formatearMiles() solo se llama para
//    el salario; los anios salen como NUMERO y se imprimen con String().
// 6. El nombre viene en mayusculas de la celda ('HAMMAD') y hay que
//    recapitalizarlo, con las particulas en minuscula y respetando el guion de
//    los apellidos compuestos.  -> recapitalizarNombre().
//
// ── COMPROBADO CONTRA EL ESQUEMA VIVO EL 14/08 (MCP, base app5K8OnSObqwWweS,
//    tabla Empleados tblTWCWu5nQXNOMR1) ──────────────────────────────────────
//   fldSPyJNpHZQMJjsX `Situación fiscal Anio Desplazamiento` devuelve
//     '' | 'No residente UE' | 'No residente NO UE' | 'Régimen Especial (Beckham)'
//     | 'Residente Fiscal'.  Son los cinco, no hay un sexto.
//   fldPGi58E0H4gGzad `Situación fiscal AnioSiguiente` es
//     IF(AplicaBeckham=TRUE(), 'Régimen Especial (Beckham)', 'Residente Fiscal'):
//     solo esos dos, y NUNCA vacio... salvo que la columna no venga en la fila.
//   Propiedades (fldE0kXJeoIHAEZCJ): 4 opciones, la errata sigue ahi.
//   Inversiones (fld5J9AqQ0vTbKTku): 4 opciones, las cuatro bien escritas.
//   estadoCivil (fld6yynlRua4Q3pCc): 5 opciones, 'pareja de hecho' ya existe.
//   hijos, Sexo, Nacionalidad, fechaDesplazamiento, Salario, Nombre empleado y
//   Apellidos empleado: existen con ese nombre exacto.
//   Idioma (fld7z0pL1bjC8tTZd): singleSelect, la opcion inglesa se llama
//     `Ingles` SIN TILDE (selB0lkXu3bmepNM3). Es la que ya usa la 3b.
//   FechaLlamada (fldv69piH32yZP89O): columna NUEVA del §8.5, tipo fecha con
//     formato europeo. Antes del 14/08 no habia ninguna columna de fecha de
//     reunion en toda la base, y por eso el §6 imprimia 'Por confirmar' fijo.
//
// OJO CON UN DETALLE DE AIRTABLE QUE NO SE VE: cuando una formula devuelve
// cadena vacia, el API NO MANDA LA CLAVE. O sea que "formula vacia" llega como
// `undefined`, no como ''. Los dos casos tienen que dar el MISMO motivo, y aqui
// lo dan porque textoCelda() convierte los dos en ''.
//
// AnioDesplazamiento (fld5zk8QWItUnbeyM) NO SE USA A PROPOSITO: es aiText, no
// formula, y esta en state:'error'/emptyDependency. El anio sale de la fecha.
// `Nombre completo` (fldMa94F3bspmKHI6) tampoco se usa tal cual: es un
// CONCATENATE que hereda las mayusculas de la celda ('HAMMAD Bellachhab').
//
// Depende de: tabla-paises-iso2-2026-08-13.js (paisPresentacion y, para el
// ingles, paisPresentacionEn del §8.3), que va concatenada ANTES en el nodo. Si
// no estuviera, el pais se imprime en mayusculas y el informe SIGUE SALIENDO:
// la capitalizacion de un pais es cosmetica y no justifica tumbar una memoria
// fiscal (§4.3 del contrato).
//
// Se prueba con: node docs/test-informe-datos.js
// ============================================================================

'use strict';

// ---------------------------------------------------------------------------
// 1 · CONSTANTES DE NEGOCIO
// ---------------------------------------------------------------------------

// Los dos idiomas del informe, §8.2. El espanol es la rama por defecto.
const IDIOMA_ES = 'es';
const IDIOMA_EN = 'en';

// La opcion de la columna `Idioma` que activa el ingles. Se compara CONTRA ESTE
// LITERAL EXACTO, sin normalizar mayusculas ni acentos, porque es el nombre de
// la opcion del select (`Ingles`, sin tilde, selB0lkXu3bmepNM3) y es el mismo
// literal que mira la automatizacion 3b. Si un dia alguien crea a mano una
// opcion 'Inglés' o 'English', el informe saldra en espanol: es la rama por
// defecto y es la que no sorprende a nadie. Que aparezca una opcion nueva es un
// problema de la columna, y se arregla en la columna.
const OPCION_IDIOMA_INGLES = 'Ingles';

// §8.5: la fecha de la reunion YA tiene columna (`FechaLlamada`), pero puede
// estar vacia. Cuando lo esta se imprime esto y EL INFORME SIGUE SALIENDO: no
// se aborta una memoria fiscal por la fecha de una reunion. NO se inventa una
// fecha ni se pone la de hoy.
const FECHA_LLAMADA_PENDIENTE = { es: 'Por confirmar', en: 'To be confirmed' };

// Decision 7 del 14/08: todo el que llega al informe ya paso el filtro F3 (no
// residente los ultimos cinco anios), asi que es constante. El dato no esta en
// ninguna columna: si algun dia se guarda, estas dos lineas son lo unico que
// cambia.
const RESIDENCIA_FISCAL_5_ANIOS = { es: 'Sí', en: 'Yes' };

// El separador de miles del salario, §8.2. En es punto y en en coma: 345678 sale
// '345.678' o '345,678'. NO es cosmetico -- '345,678' en un documento espanol se
// lee como trescientos cuarenta y cinco euros con setenta y ocho centimos.
const SEPARADOR_MILES = { es: '.', en: ',' };

// Los CINCO valores de `Situación fiscal Anio Desplazamiento`. El vacio no esta
// aqui porque no es un caso de negocio: es que el dato aun no ha llegado.
//
// LOS LITERALES SE COPIAN BYTE A BYTE DE LA FORMULA VIVA. Un acento o un
// parentesis de diferencia y no compara: 'Régimen Especial (Beckham)' lleva
// tilde en la 'e' y parentesis, no corchetes. Aqui NO se normaliza nada a
// proposito -- si un dia la formula cambia de literal, esto tiene que PARAR y
// que alguien lo mire, no adivinar por parecido.
const SITUACION_A_BLOQUE = {
  'Residente Fiscal': 'A',
  'No residente UE': 'B',
  // El que falta en la spec del 13/08 y es la mayoria del embudo. Mismo bloque
  // que el comunitario: el Bloque B cubre UE y extra-UE en la misma tabla.
  'No residente NO UE': 'B',
  'Régimen Especial (Beckham)': 'C'
};

// §4.4, decision 3 del 14/08. La columna guarda el masculino en minuscula y el
// genero no esta en ella: se cruza con `Sexo`.
// 'pareja de hecho' ES INVARIABLE y no se concuerda.
const ESTADO_CIVIL_CONCORDADO = {
  'soltero':         { masculino: 'Soltero',         femenino: 'Soltera' },
  'casado':          { masculino: 'Casado',          femenino: 'Casada' },
  'divorciado':      { masculino: 'Divorciado',      femenino: 'Divorciada' },
  'viudo':           { masculino: 'Viudo',           femenino: 'Viuda' },
  'pareja de hecho': { masculino: 'Pareja de hecho', femenino: 'Pareja de hecho' }
};

// §4.2: el select guarda dos frases, no un si/no.
const HIJOS_A_TEXTO = {
  'Tiene hijos': 'Sí',
  'No tiene hijos': 'No'
};

// §4.5, decision 2 del 14/08: la errata se tapa EN PRESENTACION y no se toca
// Airtable, porque corregir la opcion son tres sitios (opcion + whitelist del
// validador + filas existentes) y esto es reversible.
// Solo hay UNA entrada: las otras tres opciones estan bien escritas y se
// imprimen tal cual. `Inversiones` no lleva mapa, sus cuatro estan bien.
const PROPIEDADES_PRESENTACION = {
  'No tiene propiedades en España ni el extranjero':
    'No tiene propiedades en España ni en el extranjero'   // le falta el «en»
};

// §5.3 y §8.2. Las dos frases de la tabla «Resumen» que NO son datos del
// cliente: salen del bloque, y de bloque1 (el del anio de desplazamiento) aunque
// el segundo bloque sea otro, porque la tabla del resumen solo tiene una fila
// para cada una. Es la decision 6 del 14/08.
//
// POR QUE ESTAN AQUI Y NO SOLO EN LA PIEZA 4: el §8.2 dice que la pieza 4 NO
// TRADUCE NADA, y estos dos textos cambian con el idioma. Si se quedasen alli
// habria que meterle el idioma al cuerpo solo para esto. El riesgo de tener el
// texto espanol en dos ficheros (aqui y en TEXTO_RENTAS_SUJETAS del cuerpo) esta
// tapado en la prueba: test-informe-datos coteja los tres valores de cada tabla
// contra los del cuerpo dentro del MISMO ambito concatenado, asi que si alguien
// cambia uno y no el otro, la prueba se pone roja. Los literales espanoles se
// copian del §5.3 del contrato, que es la fuente.
const RENTAS_SUJETAS = {
  es: {
    A: 'Renta mundial: todos los ingresos obtenidos en el año, con independencia del lugar en el que se hayan generado o pagado.',
    B: 'Únicamente las rentas obtenidas en España.',
    C: 'Rendimientos del trabajo desde la llegada; intereses, dividendos, ganancias patrimoniales y arrendamientos de fuente española. Las propiedades e inversiones situadas en el extranjero no tributan.'
  },
  en: {
    A: 'Worldwide income: all income obtained during the year, regardless of where it was generated or paid.',
    B: 'Only income obtained in Spain.',
    C: 'Employment income from the date of arrival; interest, dividends, capital gains and rental income of Spanish source. Properties and investments located abroad are not taxed.'
  }
};

// Texto largo a proposito (decision 10 del 14/08), y SIGUE SIENDO LARGO EN
// INGLES: el del bloque B enumera un plazo por tipo de renta y resumirlo seria
// quitarle al cliente el unico sitio donde ve su plazo. No se acorta al traducir.
const MODELO_Y_PLAZO = {
  es: {
    A: 'Modelo 100, entre los meses de abril y junio del año siguiente.',
    B: 'Modelo 210. El plazo depende del tipo de renta: salario, hasta el 20 de abril del año siguiente si sale a pagar; alquileres, hasta el 20 de abril del año siguiente; imputación de rentas, hasta el 31 de diciembre del año siguiente; transmisión de inmuebles, cuatro meses desde la transmisión.',
    C: 'Modelo 151, entre los meses de abril y junio del año siguiente. La solicitud del régimen se presenta con los modelos 030 y 149, dentro de los seis meses siguientes al alta en la Seguridad Social.'
  },
  en: {
    A: 'Form 100, between the months of April and June of the following year.',
    B: 'Form 210. The deadline depends on the type of income: salary, until 20 April of the following year if there is tax to pay; rental income, until 20 April of the following year; imputed income, until 31 December of the following year; transfer of real estate, four months from the transfer.',
    C: 'Form 151, between the months of April and June of the following year. The application for the regime is filed with forms 030 and 149, within the six months following registration with the Spanish Social Security.'
  }
};

// ---------------------------------------------------------------------------
// 1b · LOS TEXTOS EN INGLES (§8.2)
// ---------------------------------------------------------------------------
// ###########################################################################
// ##  AVISO: ESTA TRADUCCION NO ESTA REVISADA POR FISCAL.                  ##
// ##                                                                       ##
// ##  Todo el texto en ingles de este fichero (y los de RENTAS_SUJETAS.en  ##
// ##  y MODELO_Y_PLAZO.en, justo arriba) es una TRADUCCION del texto        ##
// ##  espanol, no un texto redactado ni validado por el equipo Fiscal.     ##
// ##  Va marcado asi para que se pueda revisar sin buscarlo: es el aviso   ##
// ##  que exige el §8.2 del contrato.                                      ##
// ##                                                                       ##
// ##  Lo que hay que mirar cuando se revise, que es donde una traduccion   ##
// ##  literal se equivoca:                                                 ##
// ##   - «Modelo 100/210/151» -> «Form»: son formularios espanoles y en la ##
// ##     version inglesa se deja el NUMERO, que es lo que identifica al    ##
// ##     modelo ante la AEAT.                                              ##
// ##   - «Régimen Especial (Beckham)» es el nombre de un regimen legal, no ##
// ##     una descripcion: se traduce, pero se conserva «(Beckham)».        ##
// ##   - los cuatro literales de situacion fiscal salen de una FORMULA de  ##
// ##     Airtable; la clave del mapa es el literal espanol EXACTO y no se  ##
// ##     puede tocar, solo el valor.                                       ##
// ###########################################################################

// §8.2: en ingles el estado civil NO SE CONCUERDA CON `Sexo`. 'Married' vale
// para hombre y para mujer, asi que la tabla no tiene dos columnas: la
// concordancia de genero es una regla del espanol y solo se aplica alli.
const ESTADO_CIVIL_EN = {
  'soltero':         'Single',
  'casado':          'Married',
  'divorciado':      'Divorced',
  'viudo':           'Widowed',
  'pareja de hecho': 'Registered partnership'
};

const HIJOS_EN = {
  'Tiene hijos': 'Yes',
  'No tiene hijos': 'No'
};

// Las CUATRO frases de `Propiedades`, con la clave copiada byte a byte del
// esquema vivo. OJO: la tercera clave lleva la ERRATA de Airtable (le falta el
// «en»), porque la clave es lo que hay guardado en la celda; el valor ingles ya
// esta bien escrito, que es la version corregida que pide el §8.2.
const PROPIEDADES_EN = {
  'Tiene propiedades en España y no tiene propiedades en el extranjero':
    'Owns property in Spain and does not own property abroad',
  'Tiene propiedades en el extranjero y no tiene propiedades en España':
    'Owns property abroad and does not own property in Spain',
  'No tiene propiedades en España ni el extranjero':
    'Does not own property in Spain or abroad',
  'Tiene propiedades en España y en el extranjero':
    'Owns property in Spain and abroad'
};

// Las CUATRO de `Inversiones`. Aqui las cuatro claves estan bien escritas en
// Airtable: no hay errata que corregir, solo traduccion.
const INVERSIONES_EN = {
  'Tiene inversiones en España y no tiene inversiones en el extranjero':
    'Holds investments in Spain and does not hold investments abroad',
  'Tiene inversiones en el extranjero y no tiene inversiones en España':
    'Holds investments abroad and does not hold investments in Spain',
  'No tiene inversiones en España ni en el extranjero':
    'Does not hold investments in Spain or abroad',
  'Tiene inversiones en España y en el extranjero':
    'Holds investments in Spain and abroad'
};

// Los CUATRO literales de las dos formulas de situacion fiscal (los cinco del
// §4.1 menos el vacio, que no es un valor de negocio y aborta). La clave es el
// literal espanol EXACTO de la formula, con su tilde en 'Régimen' y sus
// parentesis: es la misma clave que SITUACION_A_BLOQUE y si no coincide byte a
// byte, no compara.
//
// Cada valor conserva la capitalizacion de su original ('Residente Fiscal' con
// las dos en mayuscula, 'No residente UE' solo la primera), porque estos textos
// van a una celda de la tabla «Resumen» al lado de la version espanola de otros
// informes y saltaria a la vista.
const SITUACION_EN = {
  'Residente Fiscal': 'Tax Resident',
  'No residente UE': 'Non-resident (EU)',
  'No residente NO UE': 'Non-resident (non-EU)',
  'Régimen Especial (Beckham)': 'Special Regime (Beckham)'
};

// ---------------------------------------------------------------------------
// 1c · LO QUE NO DEPENDE DEL IDIOMA
// ---------------------------------------------------------------------------

// §4.2: particulas que van en minuscula DENTRO del nombre, no si van primeras.
// La lista es la del contrato y solo la del contrato: son particulas
// espanolas y portuguesas. No se anaden 'van', 'von' ni 'di' porque el
// contrato no las nombra y no me toca decidir como se escribe un apellido
// holandes en un documento fiscal.
const PARTICULAS_NOMBRE = ['de', 'del', 'la', 'las', 'los', 'y', 'da', 'dos'];

// Nombres de columna, en un solo sitio. Si Airtable renombra una, se cambia
// aqui y no en seis expresiones distintas.
const COL = {
  nombre: 'Nombre empleado',
  apellidos: 'Apellidos empleado',
  nacionalidad: 'Nacionalidad',
  fecha: 'fechaDesplazamiento',
  estadoCivil: 'estadoCivil',
  sexo: 'Sexo',
  hijos: 'hijos',
  salario: 'Salario',
  propiedades: 'Propiedades',
  inversiones: 'Inversiones',
  situacion1: 'Situación fiscal Anio Desplazamiento',   // tilde en Situación, SIN tilde en Anio
  situacion2: 'Situación fiscal AnioSiguiente',
  idioma: 'Idioma',                                     // §8.2
  fechaLlamada: 'FechaLlamada'                          // §8.5, columna nueva, sin espacio
};

// ---------------------------------------------------------------------------
// 2 · LECTURA DE CELDAS
// ---------------------------------------------------------------------------

// LA COMPROBACION MAS IMPORTANTE DEL FICHERO, y la que hay que hacer PRIMERO.
// Airtable entrega una formula (o un campo de IA) en error como un OBJETO:
//   { state:'error', errorType:'emptyDependency', value:null, isStale:false }
// Si se le hace String() sale '[object Object]' y ese texto pasaria por un
// valor de situacion fiscal desconocido. Son dos averias distintas: una es
// "arregla la formula" y la otra es "hay un valor nuevo que no conozco".
function esCeldaEnError(valor) {
  return !!valor && typeof valor === 'object' && !Array.isArray(valor) &&
         (valor.state === 'error' || valor.errorType !== undefined);
}

// Texto de una celda, ya recortado. null, undefined y la clave que no viene
// (Airtable NO manda las claves vacias) dan todos ''.
// NO se llama a esto sobre una celda sin comprobar antes esCeldaEnError().
function textoCelda(valor) {
  if (valor === undefined || valor === null) return '';
  if (typeof valor === 'number') return String(valor);
  if (typeof valor === 'string') return valor.trim();
  // Un multipleSelects llega como array; ninguna columna de este informe lo es,
  // pero si algun dia una lo fuera, esto es mejor que '[object Object]'.
  if (Array.isArray(valor)) return valor.map(textoCelda).filter(Boolean).join(', ').trim();
  // UN singleSelect PUEDE LLEGAR DE DOS FORMAS SEGUN EL CAMINO: el nodo Airtable
  // de n8n lo entrega como texto ('Ingles'), pero la API con cellFormat json y
  // los datos de entrada de una automatizacion lo entregan como objeto
  // ({ id:'sel...', name:'Ingles', color:'...' }). Sin esta linea, el mismo
  // registro daria idioma 'es' por un camino y 'en' por el otro, y lo mismo
  // pasaria con estadoCivil, Propiedades, Inversiones, hijos y Sexo. Se lee el
  // `name`, que es el literal que compara con los mapas de este fichero.
  if (typeof valor === 'object' && typeof valor.name === 'string') return valor.name.trim();
  return '';
}

// §8.2. 'Ingles' -> 'en'; TODO LO DEMAS -> 'es', incluido vacio, ausente, un
// objeto de select con otro nombre y una opcion que no conocemos.
//
// EL ORDEN DE LAS RAMAS NO ES CASUAL: el ingles es el caso explicito y el
// espanol el por defecto, igual que en la automatizacion 3b. Escrito al reves
// ("si no es espanol, ingles") un `Idioma` vacio mandaria una memoria fiscal en
// ingles a un cliente que no lo pidio.
function leerIdioma(valor) {
  return textoCelda(valor) === OPCION_IDIOMA_INGLES ? IDIOMA_EN : IDIOMA_ES;
}

// ---------------------------------------------------------------------------
// 3 · FECHAS
// ---------------------------------------------------------------------------

// Parte la fecha EN DIGITOS y devuelve {anio, mes, dia} o null.
//
// POR QUE NO new Date(x).getFullYear(): '2026-01-01' se interpreta como
// medianoche UTC, y en cualquier zona al oeste de Greenwich getFullYear()
// devuelve 2025. El informe diria "Situación en 2025" y las dos formulas de
// Airtable, que si calculan bien, dirian otra cosa. Nadie lo veria hasta que le
// llegase a un cliente que se desplaza el 1 de enero.
//
// Se aceptan las dos formas que manda el escritor -- 'AAAA-MM-DD' y
// 'AAAA-MM-DDThh:mm:ss.sssZ' -- y una instancia de Date, que solo puede venir
// de haber parseado un ISO, asi que se lee con los getters UTC por la misma
// razon de arriba.
function partirFecha(valor) {
  if (valor instanceof Date) {
    if (isNaN(valor.getTime())) return null;
    return { anio: valor.getUTCFullYear(), mes: valor.getUTCMonth() + 1, dia: valor.getUTCDate() };
  }

  const texto = textoCelda(valor);
  if (!texto) return null;

  const trozos = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(texto);
  if (!trozos) return null;

  const anio = Number(trozos[1]);
  const mes = Number(trozos[2]);
  const dia = Number(trozos[3]);

  // Y que la fecha exista de verdad: '2026-02-30' encaja con el patron y no es
  // un dia. Se comprueba en UTC para que la zona no meta mano en la cuenta.
  const prueba = new Date(Date.UTC(anio, mes - 1, dia));
  if (prueba.getUTCFullYear() !== anio || prueba.getUTCMonth() !== mes - 1 || prueba.getUTCDate() !== dia) {
    return null;
  }
  return { anio: anio, mes: mes, dia: dia };
}

// DD/MM/AAAA con los ceros delante. A partir de los digitos ya parseados: aqui
// no se vuelve a construir ningun Date.
function formatearFecha(partes) {
  const dosDigitos = function (n) { return (n < 10 ? '0' : '') + String(n); };
  return dosDigitos(partes.dia) + '/' + dosDigitos(partes.mes) + '/' + String(partes.anio);
}

// §8.5 · La fecha de la reunion. NUNCA ABORTA, y es la unica fecha del informe
// que no lo hace: la de desplazamiento decide los anios y los bloques, y sin
// ella no hay informe; esta es la fecha de una llamada y su hueco se puede
// rellenar con 'Por confirmar' sin que el contenido fiscal cambie ni una coma.
//
// Se acepta lo mismo que en fechaDesplazamiento -- 'AAAA-MM-DD',
// 'AAAA-MM-DDThh:mm:ss.sssZ' y un Date -- porque es la MISMA partirFecha(), con
// el mismo cuidado de no pasar por la zona horaria local: si el 1 de enero se
// leyera con new Date().getFullYear(), la reunion se imprimiria el 31/12 del
// anio anterior.
//
// LO QUE HACE UNA FECHA QUE NO SE ENTIENDE NO LO DICE EL CONTRATO, y aqui se
// decide tratarla como vacia: 'Por confirmar'. Imprimir la basura tal cual
// ('Fecha de la reunión: el jueves que viene') queda peor que decir que esta por
// confirmar, y abortar esta prohibido por el §8.5. Si un dia interesa enterarse
// de que la celda trae basura, el sitio es un aviso aparte, no este marcador.
function presentarFechaLlamada(valor, idioma) {
  // Una columna de fecha no deberia venir en error nunca, pero si viniera,
  // partirFecha le haria textoCelda al objeto y saldria '' de todas formas. Se
  // comprueba explicito para que se lea la intencion.
  if (esCeldaEnError(valor)) return FECHA_LLAMADA_PENDIENTE[idioma];
  const partes = partirFecha(valor);
  if (!partes) return FECHA_LLAMADA_PENDIENTE[idioma];
  return formatearFecha(partes);
}

// ---------------------------------------------------------------------------
// 4 · NUMEROS
// ---------------------------------------------------------------------------

// Separador de miles, sin decimales y sin simbolo: 345678 -> '345.678' en es y
// '345,678' en en (§8.2). El separador se pasa POR PARAMETRO y no se lee del
// idioma aqui dentro para que la funcion siga siendo probable sola con los dos.
//
// A MANO Y NO CON toLocaleString: toLocaleString depende del locale del proceso
// y el del contenedor de n8n no esta garantizado. En un proceso con locale
// ingles 345678 sale '345,678', que en un documento espanol se lee como
// trescientos cuarenta y cinco euros con setenta y ocho centimos. Ese es
// exactamente el fallo que este fichero no puede tener, y con toLocaleString
// dependeria del contenedor en vez de la columna `Idioma`.
//
// ESTA FUNCION NO SE USA PARA LOS ANIOS. 2026 tiene que salir '2026' y no
// '2.026', asi que los anios viajan como numero y se imprimen con String().
function formatearMiles(numero, separador) {
  const sep = separador === undefined ? '.' : separador;
  const entero = Math.round(Math.abs(numero));
  const digitos = String(entero);
  let salida = '';
  for (let i = 0; i < digitos.length; i++) {
    if (i > 0 && (digitos.length - i) % 3 === 0) salida += sep;
    salida += digitos.charAt(i);
  }
  return (numero < 0 ? '-' : '') + salida;
}

// El salario tal como llega de la celda. `Salario` es un campo Number, asi que
// lo normal es un numero; se acepta tambien el texto de digitos porque las
// columnas van con typecast y un dia puede llegar '345678'.
// Devuelve null si no hay salario que imprimir, y NaN si hay algo que no es un
// numero: son dos paradas con motivos distintos.
function leerSalario(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor === 'number') return isFinite(valor) ? valor : NaN;
  const texto = textoCelda(valor);
  if (!texto) return null;
  // Solo digitos, con un separador decimal opcional. NO se intenta adivinar si
  // un punto es de miles o de decimales ('345.678' seria ambiguo): la columna
  // es numerica y esa ambiguedad no se resuelve inventando.
  if (!/^-?\d+(?:[.,]\d+)?$/.test(texto)) return NaN;
  return Number(texto.replace(',', '.'));
}

// ---------------------------------------------------------------------------
// 5 · NOMBRE
// ---------------------------------------------------------------------------

// 'HAMMAD' -> 'Hammad'. Capitaliza tambien despues del guion y del apostrofo,
// porque 'GARCIA-LOPEZ' es un apellido compuesto y 'Garcia-lopez' esta mal
// escrito. El apostrofo no lo pide el contrato, pero es el mismo caso
// ("O'BRIEN" -> "O'brien" quedaria igual de mal) y no cambia ninguna otra
// salida.
function capitalizarTrozos(palabra) {
  // El split con grupo de captura conserva los separadores en el array, asi que
  // se pueden volver a pegar sin perder cual era cada uno.
  return palabra.split(/([-'’])/).map(function (trozo) {
    if (trozo === '-' || trozo === "'" || trozo === '’' || !trozo) return trozo;
    return trozo.charAt(0).toUpperCase() + trozo.slice(1).toLowerCase();
  }).join('');
}

// 'HAMMAD' + 'Bellachhab' -> 'Hammad Bellachhab'.
// 'JOSE DE LA TORRE' -> 'Jose de la Torre': las particulas van en minuscula
// SALVO si son la primera palabra ('De la Torre, Jose' se escribiria con 'De').
function recapitalizarNombre(texto) {
  const palabras = String(texto === undefined || texto === null ? '' : texto)
    .trim()
    .split(/\s+/)
    .filter(function (p) { return p.length > 0; });

  return palabras.map(function (palabra, i) {
    const minuscula = palabra.toLowerCase();
    if (i > 0 && PARTICULAS_NOMBRE.indexOf(minuscula) !== -1) return minuscula;
    return capitalizarTrozos(palabra);
  }).join(' ');
}

// ---------------------------------------------------------------------------
// 6 · PRESENTACION DE LOS SELECT
// ---------------------------------------------------------------------------

// El pais, en el idioma del informe. paisPresentacion() y paisPresentacionEn()
// viven en tabla-paises-iso2-2026-08-13.js, que va concatenada ANTES en el nodo.
//
// EL typeof NO ES PARANOIA GRATUITA: si un dia alguien cambia el orden de
// concatenacion, sin esto el nodo entero revienta con "paisPresentacion is not
// defined" y ninguna fila sale. Con esto, el pais se imprime en mayusculas y el
// informe se manda: el §4.3 dice explicitamente que la capitalizacion de un
// pais es cosmetica y no aborta nada. La guarda de paisPresentacionEn (§8.3) es
// la MISMA y por la misma razon: vive en otra pieza.
//
// Y SI paisPresentacionEn NO ESTA, SE CAE AL ESPANOL antes que al literal en
// mayusculas: en un informe en ingles 'Marruecos' se entiende y 'MARRUECOS' se
// lee como un grito. Sigue siendo cosmetico, sigue sin abortar.
function presentarPais(nombrePais, idioma) {
  if (idioma === IDIOMA_EN && typeof paisPresentacionEn === 'function') {
    return paisPresentacionEn(nombrePais);
  }
  if (typeof paisPresentacion === 'function') return paisPresentacion(nombrePais);
  return textoCelda(nombrePais);
}

// Primera letra en mayuscula y el resto TAL CUAL. No se pasa el resto a
// minusculas para no destrozar un valor que un dia venga en mayusculas por el
// typecast: preferimos que se lea raro a perder informacion del dato.
function capitalizarInicial(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// §4.4. Cualquier `Sexo` que no sea exactamente 'Mujer' -- vacio, 'Hombre' o un
// valor nuevo -- usa la forma masculina, que es la que fija la tabla del
// contrato para la columna vacia. El select solo tiene 'Hombre' y 'Mujer'.
//
// UN estadoCivil QUE NO ESTA EN LA TABLA NO PARA EL INFORME: se imprime
// capitalizado tal cual. No es un dato fiscal, es una linea de la ficha del
// cliente, y con typecast encendido una opcion nueva se crea sola (asi aparecio
// 'pareja de hecho'). Las unicas paradas por valor desconocido son las dos
// formulas de situacion fiscal, porque esas SI eligen el regimen.
// EN INGLES NO SE CONCUERDA CON `Sexo` (§8.2): 'Married' vale para hombre y
// para mujer, y por eso la rama inglesa ni mira la columna. Esa es la trampa de
// esta funcion -- copiar la estructura del espanol y buscar un femenino ingles
// que no existe.
function estadoCivilConcordado(estadoCivil, sexo, idioma) {
  const clave = textoCelda(estadoCivil).toLowerCase();
  if (idioma === IDIOMA_EN) {
    const ingles = ESTADO_CIVIL_EN[clave];
    // Un estado civil nuevo (el typecast crea opciones solo: asi aparecio
    // 'pareja de hecho') sale en espanol capitalizado en vez de tumbar el
    // informe. Igual que el pais: se ve raro y se arregla en la columna.
    return ingles !== undefined ? ingles : capitalizarInicial(textoCelda(estadoCivil));
  }
  const formas = ESTADO_CIVIL_CONCORDADO[clave];
  if (!formas) return capitalizarInicial(textoCelda(estadoCivil));
  return textoCelda(sexo) === 'Mujer' ? formas.femenino : formas.masculino;
}

// 'Tiene hijos' -> 'Sí' / 'Yes'. Lo que no este en la tabla se imprime literal:
// es la misma regla que el estado civil.
function presentarHijos(valor, idioma) {
  const texto = textoCelda(valor);
  const tabla = idioma === IDIOMA_EN ? HIJOS_EN : HIJOS_A_TEXTO;
  const traducido = tabla[texto];
  return traducido !== undefined ? traducido : texto;
}

// §4.5 en espanol: solo se cambia la opcion con la errata; las otras tres van
// literales. §8.2 en ingles: las cuatro traducidas, y la traduccion de la que
// lleva la errata ya sale bien escrita.
function presentarPropiedades(valor, idioma) {
  const texto = textoCelda(valor);
  if (idioma === IDIOMA_EN) {
    const ingles = PROPIEDADES_EN[texto];
    // Sin traduccion (opcion nueva) se cae al espanol CON la errata corregida,
    // no al literal de la celda: es lo mismo que hace la rama espanola.
    if (ingles !== undefined) return ingles;
  }
  const corregido = PROPIEDADES_PRESENTACION[texto];
  return corregido !== undefined ? corregido : texto;
}

// `Inversiones` no lleva mapa en espanol -- sus cuatro opciones estan bien
// escritas y se imprimen tal cual --, pero si lleva traduccion (§8.2).
function presentarInversiones(valor, idioma) {
  const texto = textoCelda(valor);
  if (idioma === IDIOMA_EN) {
    const ingles = INVERSIONES_EN[texto];
    if (ingles !== undefined) return ingles;
  }
  return texto;
}

// Los literales de las dos formulas de situacion fiscal. En espanol van TAL CUAL
// (§4.2: "literal, sin tocar") y en ingles traducidos.
//
// SI NO HAY TRADUCCION SE IMPRIME EL LITERAL ESPANOL, no se aborta: llegar aqui
// significa que la formula devolvio un valor que SI esta en SITUACION_A_BLOQUE
// (si no, leerSituacion ya habria parado) pero que no esta en SITUACION_EN, o
// sea que alguien anadio un valor a un mapa y se olvido del otro. El regimen
// fiscal elegido es correcto; lo unico mal es el idioma de una celda de tabla.
function presentarSituacion(literal, idioma) {
  if (idioma === IDIOMA_EN) {
    const ingles = SITUACION_EN[literal];
    if (ingles !== undefined) return ingles;
  }
  return literal;
}

// ---------------------------------------------------------------------------
// 7 · LAS DOS FORMULAS DE SITUACION FISCAL
// ---------------------------------------------------------------------------
// Devuelve { ok:true, bloque:'A'|'B'|'C', literal:'...' } o
//          { ok:false, error:'...' }.
// Los cuatro motivos son los del §4.6, con el nombre de la columna dentro para
// que quien lea ErrorInforme sepa CUAL de las dos falla sin abrir Airtable.
function leerSituacion(valorCelda, nombreColumna) {
  // 1. En error, ANTES de tocar el valor. Si esto no fuera lo primero, el
  //    String(objeto) de mas abajo daria '[object Object]' y el motivo saldria
  //    "no reconozco la situación fiscal", que manda a mirar donde no es.
  if (esCeldaEnError(valorCelda)) {
    const detalle = valorCelda.errorType || valorCelda.state || 'sin detalle';
    return { ok: false, error: 'No se genera el informe: la columna "' + nombreColumna +
                               '" está en error (' + detalle + ').' };
  }

  // 2. Cualquier otro objeto tampoco es un valor de situacion fiscal. No esta
  //    en la tabla del §4.6, pero tratarlo como "desconocido" seria mandar a
  //    alguien a buscar un valor de negocio que no existe.
  if (valorCelda !== null && valorCelda !== undefined &&
      typeof valorCelda === 'object' && !Array.isArray(valorCelda) && !(valorCelda instanceof Date)) {
    return { ok: false, error: 'No se genera el informe: la columna "' + nombreColumna +
                               '" no ha devuelto texto, ha devuelto ' + JSON.stringify(valorCelda) + '.' };
  }

  // 3. Vacia. Incluye el caso en que la clave NO VIENE en la fila, que es como
  //    Airtable entrega una formula que devuelve ''. El vacio de esta columna
  //    es un dato que aun no ha llegado, no un caso de negocio: el 05/08 estaba
  //    vacia mientras faltaba fechaDesplazamiento y empezo a devolver
  //    'Residente Fiscal' en cuanto llego la fecha.
  const literal = textoCelda(valorCelda);
  if (!literal) {
    return { ok: false, error: 'No se genera el informe: la columna "' + nombreColumna +
                               '" está vacía. Eso significa que el dato aún no ha llegado, no que el cliente no tenga situación fiscal.' };
  }

  // 4. Un valor que no conozco. AQUI SE PARA, no se elige bloque.
  const bloque = SITUACION_A_BLOQUE[literal];
  if (!bloque) {
    return { ok: false, error: 'No se genera el informe: no reconozco la situación fiscal "' + literal +
                               '". Se para a propósito para no fabricar un dictamen fiscal.' };
  }

  return { ok: true, bloque: bloque, literal: literal };
}

// ---------------------------------------------------------------------------
// 8 · RESOLVER LOS MARCADORES DE UNA FILA
// ---------------------------------------------------------------------------
// EL ORDEN DE LAS PARADAS NO LO FIJA EL CONTRATO y una fila puede tener dos
// averias a la vez, asi que se devuelve solo la primera. Se comprueba de lo mas
// estructural a lo mas concreto: sin fecha no hay ni anios ni bloques; sin
// bloques no hay informe que montar; el nombre y el salario son de la ficha.
//
// LO QUE NO SALE DE AQUI, A PROPOSITO: {{anio}}. Depende de EN QUE BLOQUE se
// imprime, no del cliente, y la pieza 4 lo resuelve por ambito de bloque (§5.2).
//
// {{rentasSujetas}} y {{modeloYPlazo}} SI salen de aqui desde el §8.2, porque
// cambian con el idioma y la pieza 4 no traduce nada. Se toman de bloque1
// (decision 6). Mientras la pieza 4 siga usando sus propias TEXTO_RENTAS_SUJETAS
// y TEXTO_MODELO_Y_PLAZO para el espanol, el texto espanol esta en dos sitios:
// la prueba coteja las dos copias para que no se separen en silencio.
function resolverDatos(fila) {
  if (!fila || typeof fila !== 'object') {
    return { ok: false, error: 'No se genera el informe: no llega la fila de Airtable.' };
  }

  // --- 0 · El idioma, ANTES DE TODO --------------------------------------
  // Se resuelve primero porque de el dependen todos los valores de presentacion
  // de aqui abajo. NO PUEDE PARAR EL INFORME: cualquier cosa que no sea la
  // opcion `Ingles` es espanol, asi que leerIdioma() siempre devuelve algo.
  const idioma = leerIdioma(fila[COL.idioma]);

  // --- 1 · La fecha de desplazamiento: de ella salen los dos anios ----------
  const celdaFecha = fila[COL.fecha];
  // La columna es de tipo Date y no puede venir en error, pero la comprobacion
  // cuesta una linea y sin ella un objeto de error se leeria como "falta la
  // fecha", que manda a rellenar una celda que ya esta rellena.
  if (esCeldaEnError(celdaFecha)) {
    return { ok: false, error: 'No se genera el informe: la columna "' + COL.fecha +
                               '" está en error (' + (celdaFecha.errorType || celdaFecha.state) + ').' };
  }
  // Un Date no tiene texto, asi que se salta el "esta vacia" y se parsea abajo.
  if (!(celdaFecha instanceof Date) && !textoCelda(celdaFecha)) {
    return { ok: false, error: 'No se genera el informe: falta la fecha de desplazamiento, y sin ella no hay años ni bloques.' };
  }
  const partes = partirFecha(celdaFecha);
  if (!partes) {
    return { ok: false, error: 'No se genera el informe: la fecha de desplazamiento "' +
                               (celdaFecha instanceof Date ? String(celdaFecha) : textoCelda(celdaFecha)) +
                               '" no se entiende.' };
  }

  // --- 2 · Los dos bloques -------------------------------------------------
  const situacion1 = leerSituacion(fila[COL.situacion1], COL.situacion1);
  if (!situacion1.ok) return { ok: false, error: situacion1.error };

  const situacion2 = leerSituacion(fila[COL.situacion2], COL.situacion2);
  if (!situacion2.ok) return { ok: false, error: situacion2.error };

  // --- 3 · El nombre -------------------------------------------------------
  // El contrato para si faltan LAS DOS columnas. Con una sola se monta: hay
  // clientes con un solo apellido y no vamos a dejar de mandar el informe por
  // eso. No se usa `Nombre completo` de Airtable porque hereda las mayusculas.
  const nombreCompleto = recapitalizarNombre(
    (textoCelda(fila[COL.nombre]) + ' ' + textoCelda(fila[COL.apellidos])).trim()
  );
  if (!nombreCompleto) {
    return { ok: false, error: 'No se genera el informe: falta el nombre del cliente.' };
  }

  // --- 4 · El salario ------------------------------------------------------
  const salario = leerSalario(fila[COL.salario]);
  if (salario === null) {
    return { ok: false, error: 'No se genera el informe: falta el salario bruto anual.' };
  }
  // Las dos paradas de abajo NO estan en la tabla del §4.6, que solo contempla
  // el salario vacio. Se anaden porque el marcador va a un documento que el
  // cliente lee: "Salario bruto anual: NaN euros." o "0 euros." no se manda.
  if (isNaN(salario)) {
    return { ok: false, error: 'No se genera el informe: el salario bruto anual "' +
                               textoCelda(fila[COL.salario]) + '" no es un número.' };
  }
  if (salario <= 0) {
    return { ok: false, error: 'No se genera el informe: el salario bruto anual es ' + salario +
                               ', y eso no se puede imprimir en un informe fiscal.' };
  }

  // --- 5 · Los marcadores -------------------------------------------------
  // Los anios son NUMEROS, no textos: asi es imposible que a alguien se le
  // cuele un separador de miles por el camino.
  const anioDesplazamiento = partes.anio;

  return {
    ok: true,
    datos: {
      // El idioma de TODO lo de abajo (§8.2). Va primero porque es la clave que
      // explica por que los demas valores estan escritos como estan.
      idioma: idioma,

      // Los marcadores de esta pieza, en el orden del §4.2 del contrato.
      nombreCompleto: nombreCompleto,
      paisOrigen: presentarPais(fila[COL.nacionalidad], idioma),
      // Las dos fechas van en DD/MM/AAAA en LOS DOS idiomas (§8.2): el cliente
      // vive en Espana. Nada de MM/DD/AAAA en el informe ingles.
      fechaDesplazamiento: formatearFecha(partes),
      fechaLlamada: presentarFechaLlamada(fila[COL.fechaLlamada], idioma),
      estadoCivil: estadoCivilConcordado(fila[COL.estadoCivil], fila[COL.sexo], idioma),
      hijos: presentarHijos(fila[COL.hijos], idioma),
      salarioBrutoAnual: formatearMiles(salario, SEPARADOR_MILES[idioma]),
      residenciaFiscal5Anios: RESIDENCIA_FISCAL_5_ANIOS[idioma],
      sumaPropiedades: presentarPropiedades(fila[COL.propiedades], idioma),
      sumaInversiones: presentarInversiones(fila[COL.inversiones], idioma),
      anioDesplazamiento: anioDesplazamiento,
      situacionAnioDesplazamiento: presentarSituacion(situacion1.literal, idioma),
      anioSiguiente: anioDesplazamiento + 1,
      situacionAnioSiguiente: presentarSituacion(situacion2.literal, idioma),

      // Las dos frases de la tabla «Resumen» que salen del BLOQUE 1, no del
      // cliente (§5.3 y decision 6 del 14/08).
      rentasSujetas: RENTAS_SUJETAS[idioma][situacion1.bloque],
      modeloYPlazo: MODELO_Y_PLAZO[idioma][situacion1.bloque],

      // Y los dos bloques, que no son marcadores pero son lo que decide que
      // texto se monta. La pieza 4 los necesita los dos. NO DEPENDEN DEL IDIOMA:
      // el regimen fiscal es el mismo se escriba el informe como se escriba.
      bloque1: situacion1.bloque,
      bloque2: situacion2.bloque
    }
  };
}

// Solo para poder probar el fichero con node. En el nodo de n8n `module` no
// existe y esta linea no hace nada.
//
// VA TODO EN UNA SOLA LINEA A PROPOSITO, y no es cosmetica: montar-nodo-informe.sh
// quita el pie con `grep -v` linea a linea. Si el module.exports ocupa varias
// lineas, al quitar la primera y la del `module.exports` se quedan dentro del
// nodo las llaves de cierre huerfanas y el fichero generado no compila. Hoy
// (14/08) le pasa a tabla-paises-iso2, metrica-helvetica e informe-cuerpo: el
// `node --check` del script lo caza y se niega a regenerar, asi que el COMPLETO
// no se puede montar hasta que esos tres pies se pongan tambien en una linea.
if (typeof module !== 'undefined') { module.exports = { resolverDatos, leerSituacion, esCeldaEnError, textoCelda, partirFecha, formatearFecha, formatearMiles, leerSalario, recapitalizarNombre, capitalizarTrozos, estadoCivilConcordado, presentarHijos, presentarPropiedades, presentarPais, SITUACION_A_BLOQUE, ESTADO_CIVIL_CONCORDADO, HIJOS_A_TEXTO, PROPIEDADES_PRESENTACION, PARTICULAS_NOMBRE, FECHA_LLAMADA_SIN_COLUMNA, RESIDENCIA_FISCAL_5_ANIOS, COL }; }
