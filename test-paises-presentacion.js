// PRUEBA DE LOS DOS MAPAS DE PRESENTACION DE PAISES · 14/08/2026
// Se ejecuta con:  node docs/test-paises-presentacion.js
//
// QUE PROTEGE ESTA PRUEBA: PAIS_PRESENTACION y PAIS_PRESENTACION_EN son 245 + 245
// nombres escritos a mano. Un mapa asi es el sitio ideal para colar un pais que no
// existe, o para que se cuele un dedazo que nadie vuelve a mirar. La prueba NO
// comprueba que el nombre sea "bonito": lo ata a algo de fuera.
//
//   - En ESPANOL el ancla es la propia clave: el valor tiene que ser LA MISMA CLAVE
//     con acentos y minusculas, ni una palabra mas ni una menos.
//   - En INGLES son otras palabras, asi que de la clave no se deriva nada. El ancla
//     es ISO 3166-1: cada valor tiene que ser el nombre corto en ingles del codigo
//     alfa-2 que PAIS_ISO ya tiene para esa clave. La tabla codigo -> nombre esta
//     ESCRITA AQUI ABAJO, aparte del mapa de presentacion, y se comparan las dos
//     pasando por PAIS_ISO. Escribir el nombre ingles dos veces y comparar una
//     consigo misma no probaria nada.
//
// Las claves NO se escriben aqui: se sacan de PAIS_ISO, que es la lista verificada
// contra las 245 opciones reales de Airtable. Si un dia Airtable cambia, la prueba
// falla por la puerta correcta.
//
// Y AL FINAL, LA COMPROBACION QUE MAS IMPORTA (bloque 10): que la prueba MUERDE.
// Se mutan copias de los dos mapas y de la lista de excepciones y se comprueba que
// cada mutacion produce un fallo. Un invariante que no falla nunca no es un
// invariante, es decoracion.
const fs = require('fs');
const path = require('path');
const { PAIS_ISO, paisISO, PAIS_PRESENTACION, paisPresentacion,
        PAIS_PRESENTACION_EN, paisPresentacionEn } =
  require('./tabla-paises-iso2-2026-08-13.js');

// Quita tildes y dieresis y NADA MAS. La Ñ y la Ç se dejan intactas a proposito:
// tres claves de Airtable las llevan de verdad ('ESPAÑA', 'CURAÇAO' y 'PAISES
// BAJOS (PARTE CARIBEÑA)'), asi que normalizarlas romperia esas tres para siempre.
const ACENTOS = {
  'Á':'A', 'À':'A', 'Ä':'A', 'Â':'A',
  'É':'E', 'È':'E', 'Ë':'E', 'Ê':'E',
  'Í':'I', 'Ì':'I', 'Ï':'I', 'Î':'I',
  'Ó':'O', 'Ò':'O', 'Ö':'O', 'Ô':'O',
  'Ú':'U', 'Ù':'U', 'Ü':'U', 'Û':'U'
};
function quitarAcentos(texto) {
  let salida = '';
  for (const caracter of texto) salida += (ACENTOS[caracter] || caracter);
  return salida;
}
function canonizar(texto) {
  return quitarAcentos(String(texto).toUpperCase());
}

// Multiset de palabras: se ordenan para poder comparar, y se cuenta cada
// repeticion. Si solo comparasemos conjuntos, 'ISLAS ISLAS COOK' pasaria.
function palabrasOrdenadas(texto) {
  return texto.split(/\s+/).filter(function (p) { return p !== ''; }).sort();
}
function mismasPalabras(a, b) {
  return a.length === b.length && a.every(function (p, i) { return p === b[i]; });
}

// JSON.stringify(undefined) devuelve undefined, no la cadena "undefined", y eso
// reventaba el propio log de la prueba en el caso de undefined. Se envuelve.
function mostrar(valor) {
  return String(JSON.stringify(valor));
}

let mal = 0;
function falla(mensaje) {
  mal++;
  console.log('FALLA  ' + mensaje);
}

// ── LA LISTA DE EXCEPCIONES DEL ESPANOL · §8.4 del contrato ──────────────────
//
// POR QUE EXISTE: el invariante del espanol prohibe anadir palabras, y estas
// cuatro claves de la AEAT necesitan un articulo (o desabreviar) para poder
// escribirse en espanol correcto. Decision del usuario el 14/08: se escriben
// bien, y la excepcion se declara AQUI en vez de aflojar el invariante para las
// 245. Las otras 241 siguen con la regla estricta, que es lo unico que impide
// colar un pais inventado.
//
// LA EXCEPCION NO ES UN PERMISO PARA ESCRIBIR CUALQUIER COSA: se declara el valor
// EXACTO que se espera, asi que un dedazo dentro de la excepcion sigue fallando.
// Y el bloque 2b comprueba que la lista tiene EXACTAMENTE estas cuatro claves,
// para que nadie pueda colar una quinta como excepcion sin que se vea.
const EXCEPCIONES_ES = {
  'CONGO, REPUBLICA DEMOCRATICA': {
    valor: 'República Democrática del Congo',
    motivo: 'anade «del»: la desinversion literal daba «República Democrática Congo», que no es espanol'
  },
  'OCEANO INDICO, TERRI.BRITANICO': {
    valor: 'Territorio Británico del Océano Índico',
    motivo: 'anade «del» y desabrevia «TERRI.» de la clave de la AEAT'
  },
  'NAVIDAD, ISLA': {
    valor: 'Isla de Navidad',
    motivo: 'anade «de»: el nombre en espanol de Christmas Island lleva preposicion'
  },
  'MENORES ALEJADAS EE.UU, ISLAS': {
    valor: 'Islas Menores Alejadas de EE.UU.',
    motivo: 'anade «de» y el punto final de la abreviatura EE.UU., que la clave se come'
  }
};

// ── 1 · Las claves son exactamente las mismas que las de PAIS_ISO ─────────────
const clavesISO = Object.keys(PAIS_ISO);
console.log('--- 1. mismas claves que PAIS_ISO ---');
function comprobarClaves(nombre, mapa) {
  const claves = Object.keys(mapa);
  console.log('PAIS_ISO: ' + clavesISO.length + ' claves · ' + nombre + ': ' + claves.length);
  const faltan = clavesISO.filter(function (k) { return !(k in mapa); });
  const sobran = claves.filter(function (k) { return !(k in PAIS_ISO); });
  if (faltan.length) falla(nombre + ': faltan ' + faltan.length + ' claves: ' + faltan.join(' | '));
  if (sobran.length) falla(nombre + ': sobran ' + sobran.length + ' claves: ' + sobran.join(' | '));
  if (!faltan.length && !sobran.length) {
    console.log('OK     ' + nombre + ': 245 = 245, cero que falten y cero que sobren');
  }
}
comprobarClaves('PAIS_PRESENTACION', PAIS_PRESENTACION);
comprobarClaves('PAIS_PRESENTACION_EN', PAIS_PRESENTACION_EN);

// ── 2 · El invariante del espanol, clave por clave ───────────────────────────
// Sin coma: canonizar(presentacion) === clave, exacto.
// Con coma: mismo multiset de palabras que la clave sin la coma (se desinvierte).
// Excepcion declarada: el valor tiene que ser IGUAL al declarado en EXCEPCIONES_ES.
//
// Se escribe como funcion sobre una tabla que se pasa por parametro para poder
// lanzarla luego sobre copias mutadas (bloque 10). Devuelve la lista de fallos en
// vez de imprimirlos, para que las mutaciones no ensucien la salida.
function comprobarEs(tabla, excepciones) {
  const fallos = [];
  const detalle = { sinComa: 0, totalSinComa: 0, conComa: 0, totalConComa: 0,
                    excepciones: 0, desinvertidas: [] };
  for (const clave of clavesISO) {
    const presentacion = tabla[clave];
    if (typeof presentacion !== 'string' || presentacion === '') {
      fallos.push(clave + ' -> presentacion vacia o no es texto');
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(excepciones, clave)) {
      // Exenta del invariante de palabras, PERO con el valor clavado.
      const esperado = excepciones[clave].valor;
      const igual = presentacion === esperado;
      if (igual) detalle.excepciones++;
      else fallos.push('EXCEPCION ' + clave + ' -> "' + presentacion +
                       '" y la excepcion declara "' + esperado + '"');
      detalle.desinvertidas.push([clave, presentacion, igual, true]);
      continue;
    }
    const canon = canonizar(presentacion);
    if (clave.indexOf(',') === -1) {
      detalle.totalSinComa++;
      if (canon === clave) detalle.sinComa++;
      else fallos.push('SIN COMA  ' + clave + ' -> "' + presentacion +
                       '"  canoniza a "' + canon + '"');
    } else {
      detalle.totalConComa++;
      const claveSinComa = clave.replace(/,/g, ' ');
      const esperado = palabrasOrdenadas(claveSinComa);
      const obtenido = palabrasOrdenadas(canon);
      const igual = mismasPalabras(esperado, obtenido);
      if (igual) detalle.conComa++;
      else fallos.push('CON COMA  ' + clave + ' -> "' + presentacion + '"  palabras {' +
                       obtenido.join(',') + '} vs {' + esperado.join(',') + '}');
      detalle.desinvertidas.push([clave, presentacion, igual, false]);
    }
  }
  return { fallos, detalle };
}

console.log('\n--- 2. invariante del espanol sobre las 245 ---');
const resEs = comprobarEs(PAIS_PRESENTACION, EXCEPCIONES_ES);
for (const f of resEs.fallos) falla(f);
const dEs = resEs.detalle;
console.log('sin coma: ' + dEs.sinComa + '/' + dEs.totalSinComa +
            ' · con coma: ' + dEs.conComa + '/' + dEs.totalConComa +
            ' · excepciones §8.4: ' + dEs.excepciones + '/' + Object.keys(EXCEPCIONES_ES).length +
            ' · TOTAL ' + (dEs.sinComa + dEs.conComa + dEs.excepciones) + '/' + clavesISO.length);
if (dEs.totalConComa !== 22) {
  falla('se esperaban 22 claves con coma bajo el invariante estricto (26 menos las 4 ' +
        'excepciones) y hay ' + dEs.totalConComa);
}

// ── 2b · La lista de excepciones tiene EXACTAMENTE esas cuatro claves ────────
// SIN ESTO la lista de excepciones seria una puerta abierta: bastaria meter un
// pais inventado ahi para que el invariante dejara de mirarlo. Se clavan las
// cuatro claves permitidas, y se comprueba que todas existen de verdad en la
// lista de paises (una excepcion para una clave que no existe seria un aviso de
// que la lista de Airtable ha cambiado).
console.log('\n--- 2b. la lista de excepciones son exactamente cuatro ---');
const EXCEPCIONES_ES_PERMITIDAS = [
  'CONGO, REPUBLICA DEMOCRATICA',
  'OCEANO INDICO, TERRI.BRITANICO',
  'NAVIDAD, ISLA',
  'MENORES ALEJADAS EE.UU, ISLAS'
];
function comprobarExcepciones(excepciones) {
  const fallos = [];
  const declaradas = Object.keys(excepciones);
  if (declaradas.length !== EXCEPCIONES_ES_PERMITIDAS.length) {
    fallos.push('la lista de excepciones tiene ' + declaradas.length +
                ' claves y solo se permiten ' + EXCEPCIONES_ES_PERMITIDAS.length +
                ' (§8.4): ' + declaradas.join(' | '));
  }
  for (const k of EXCEPCIONES_ES_PERMITIDAS) {
    if (!Object.prototype.hasOwnProperty.call(excepciones, k)) {
      fallos.push('falta la excepcion declarada en el §8.4: ' + k);
    }
  }
  for (const k of declaradas) {
    if (EXCEPCIONES_ES_PERMITIDAS.indexOf(k) === -1) {
      fallos.push('excepcion NO autorizada por el §8.4: ' + k +
                  ' — o se cambia el contrato o se escribe el nombre con la regla estricta');
    }
    if (!(k in PAIS_ISO)) {
      fallos.push('la excepcion ' + k + ' no es una clave de PAIS_ISO');
    }
    const e = excepciones[k] || {};
    if (typeof e.valor !== 'string' || e.valor === '') {
      fallos.push('la excepcion ' + k + ' no declara el valor exacto que se espera');
    }
    if (typeof e.motivo !== 'string' || e.motivo === '') {
      fallos.push('la excepcion ' + k + ' no lleva motivo escrito');
    }
  }
  return fallos;
}
const fallosExc = comprobarExcepciones(EXCEPCIONES_ES);
for (const f of fallosExc) falla(f);
if (!fallosExc.length) {
  console.log('OK     4 excepciones, las cuatro del §8.4, todas con valor y motivo:');
  for (const k of EXCEPCIONES_ES_PERMITIDAS) {
    console.log('       ' + k.padEnd(32) + ' -> ' + EXCEPCIONES_ES[k].valor);
    console.log('       ' + ' '.repeat(32) + '    motivo: ' + EXCEPCIONES_ES[k].motivo);
  }
}

// ── 3 · Las 26 con coma, una por linea, para poder leerlas ──────────────────
console.log('\n--- 3. las 26 con coma, desinvertidas (EXCEP = excepcion del §8.4) ---');
for (const [clave, presentacion, igual, esExcepcion] of dEs.desinvertidas) {
  console.log((igual ? (esExcepcion ? 'EXCEP' : 'OK   ') : 'FALLA') + '  ' +
              clave.padEnd(32) + ' -> ' + presentacion);
}

// ── 4 · paisPresentacion(): casos de uso y el que NO esta en el mapa ─────────
console.log('\n--- 4. paisPresentacion() ---');
const casosPresentacion = [
  ['MARRUECOS',                     'Marruecos'],
  ['PAISES BAJOS',                  'Países Bajos'],
  ['ESPAÑA',                        'España'],
  ['CURAÇAO',                       'Curaçao'],
  ['CHECA, REPUBLICA',              'República Checa'],
  ['SALVADOR, EL',                  'El Salvador'],
  ['BANCO CENTRAL EUROPEO',         'Banco Central Europeo'],
  ['ORGANISMOS INTERNACIONALES',    'Organismos internacionales'],
  ['OTROS PAISES NO RELACIONADOS',  'Otros países no relacionados'],
  ['  MARRUECOS  ',                 'Marruecos'],                 // se recorta como paisISO
  // --- las cuatro del §8.4, por el camino de verdad y no por la tabla ---
  ['CONGO, REPUBLICA DEMOCRATICA',  'República Democrática del Congo'],
  ['OCEANO INDICO, TERRI.BRITANICO','Territorio Británico del Océano Índico'],
  ['NAVIDAD, ISLA',                 'Isla de Navidad'],
  ['MENORES ALEJADAS EE.UU, ISLAS', 'Islas Menores Alejadas de EE.UU.'],
  // --- lo que NO esta en el mapa sale tal cual, y el informe sigue adelante ---
  ['WAKANDA',                       'WAKANDA'],
  ['Marruecos',                     'Marruecos'],                 // no es la forma canonica: tal cual
  ['marruecos',                     'marruecos'],                 // idem, y NO se inventa nada
  ['',                              ''],
  [null,                            ''],
  [undefined,                       '']
];
for (const [entrada, esperado] of casosPresentacion) {
  const obtenido = paisPresentacion(entrada);
  const ok = obtenido === esperado;
  if (!ok) falla('paisPresentacion(' + mostrar(entrada) + ') = ' +
                 mostrar(obtenido) + ' y se esperaba ' + mostrar(esperado));
  else console.log('OK     ' + mostrar(entrada).padEnd(34) + ' -> ' + mostrar(obtenido));
}
// Nunca null ni undefined: eso es lo que permite meterlo en una celda del IR.
for (const entrada of ['MARRUECOS', 'WAKANDA', '', null, undefined, 0, 123]) {
  const r = paisPresentacion(entrada);
  if (r === null || r === undefined || typeof r !== 'string') {
    falla('paisPresentacion(' + mostrar(entrada) + ') no devolvio texto: ' + String(r));
  }
}

// ── 5 · NO REGRESION: paisISO sigue devolviendo lo de antes ──────────────────
// Diez de muestra, con los valores que ya tenia el fichero antes de anadir nada.
// Si esto falla, se ha tocado lo que alimenta el .030 y hay que revertir.
console.log('\n--- 5. no regresion de paisISO (10 de muestra) ---');
const casosISO = [
  ['MARRUECOS',                     'MA'],
  ['ESPAÑA',                        'ES'],
  ['CURAÇAO',                       'CW'],
  ['PAISES BAJOS (PARTE CARIBEÑA)', 'BQ'],
  ['CHECA, REPUBLICA',              'CZ'],
  ['SALVADOR, EL',                  'SV'],
  ['LUXEMBURGO (DI)',               'LU'],
  ['VENEZUELA',                     'VE'],
  ['ZIMBABUE',                      'ZW'],
  ['ORGANISMOS INTERNACIONALES',    null]   // no es un pais: para el .030 se para
];
for (const [entrada, esperado] of casosISO) {
  const obtenido = paisISO(entrada);
  const ok = obtenido === esperado;
  if (!ok) falla('paisISO(' + mostrar(entrada) + ') = ' + String(obtenido) +
                 ' y se esperaba ' + String(esperado));
  else console.log('OK     ' + entrada.padEnd(32) + ' -> ' + String(obtenido));
}

// ── 6 · NO REGRESION DEL .030: PAIS_ISO contra la copia congelada ────────────
// El nodo del .030 lleva una copia concatenada de PAIS_ISO dentro de
// nodo-montar-030-COMPLETO.js. Si las dos se separan, el .030 de produccion
// manda a Hacienda un codigo distinto del que dice esta tabla y nadie se enteraria
// hasta que Hacienda lo rechace. Se exige CERO diferencias en las 245.
// Si el COMPLETO no esta (repo recien clonado), se avisa y no se falla.
console.log('\n--- 6. PAIS_ISO contra la copia congelada del nodo del .030 ---');
const rutaCompleto030 = path.join(__dirname, 'nodo-montar-030-COMPLETO.js');
if (!fs.existsSync(rutaCompleto030)) {
  console.log('AVISO  no esta nodo-montar-030-COMPLETO.js: no se puede cotejar');
} else {
  const fuente030 = fs.readFileSync(rutaCompleto030, 'utf8');
  // Se recorta el literal del objeto y se lee con Function, no con require: el
  // COMPLETO entero no se puede cargar (usa $input, que aqui no existe).
  const desde = fuente030.indexOf('const PAIS_ISO = {');
  const hasta = fuente030.indexOf('};', desde);
  if (desde === -1 || hasta === -1) {
    falla('no se encuentra el literal de PAIS_ISO dentro del nodo del .030');
  } else {
    const literal = fuente030.slice(desde + 'const PAIS_ISO = '.length, hasta + 1);
    const congelada = Function('return ' + literal)();
    const dif = [];
    for (const k of Object.keys(PAIS_ISO)) {
      if (congelada[k] !== PAIS_ISO[k]) {
        dif.push(k + ': tabla="' + PAIS_ISO[k] + '" nodo="' + String(congelada[k]) + '"');
      }
    }
    for (const k of Object.keys(congelada)) {
      if (!(k in PAIS_ISO)) dif.push(k + ': esta en el nodo y no en la tabla');
    }
    if (dif.length) falla('la copia del .030 se ha separado en ' + dif.length +
                          ' claves: ' + dif.slice(0, 5).join(' · '));
    else console.log('OK     ' + Object.keys(congelada).length +
                     ' claves identicas, 0 diferencias');
  }
}

// ── 7 · LA TABLA ANCLA DEL INGLES: codigo alfa-2 -> nombre corto de ISO 3166-1 ─
//
// ESTA TABLA ESTA ESCRITA APARTE A PROPOSITO, y por codigo, no por nombre espanol.
// Es la que convierte el invariante del ingles en algo comprobable: si se escribiera
// el nombre ingles otra vez con la clave espanola al lado, se estaria comparando la
// tabla consigo misma y la prueba no valdria nada. Aqui la unica cosa que une los
// dos lados es PAIS_ISO, que es dato verificado y que NO se toca.
//
// Son los nombres cortos EN INGLES de ISO 3166-1, tal cual, con sus comas y sus
// parentesis ('Korea, Republic of', 'Venezuela (Bolivarian Republic of)'). No se
// "mejoran" aqui: el dia que se empieza a mejorar, el ancla deja de ser un estandar
// y pasa a ser la opinion de quien edito el fichero.
const ISO_EN = {
  'AD':'Andorra', 'AE':'United Arab Emirates', 'AF':'Afghanistan',
  'AG':'Antigua and Barbuda', 'AI':'Anguilla', 'AL':'Albania',
  'AM':'Armenia', 'AO':'Angola', 'AQ':'Antarctica',
  'AR':'Argentina', 'AS':'American Samoa', 'AT':'Austria',
  'AU':'Australia', 'AW':'Aruba', 'AZ':'Azerbaijan',
  'BA':'Bosnia and Herzegovina', 'BB':'Barbados', 'BD':'Bangladesh',
  'BE':'Belgium', 'BF':'Burkina Faso', 'BG':'Bulgaria',
  'BH':'Bahrain', 'BI':'Burundi', 'BJ':'Benin',
  'BM':'Bermuda', 'BN':'Brunei Darussalam', 'BO':'Bolivia (Plurinational State of)',
  'BQ':'Bonaire, Sint Eustatius and Saba', 'BR':'Brazil', 'BS':'Bahamas',
  'BT':'Bhutan', 'BV':'Bouvet Island', 'BW':'Botswana',
  'BY':'Belarus', 'BZ':'Belize', 'CA':'Canada',
  'CC':'Cocos (Keeling) Islands', 'CD':'Congo, Democratic Republic of the',
  'CF':'Central African Republic', 'CG':'Congo', 'CH':'Switzerland',
  'CI':'Côte d\'Ivoire', 'CK':'Cook Islands', 'CL':'Chile',
  'CM':'Cameroon', 'CN':'China', 'CO':'Colombia',
  'CR':'Costa Rica', 'CU':'Cuba', 'CV':'Cabo Verde',
  'CW':'Curaçao', 'CX':'Christmas Island', 'CY':'Cyprus',
  'CZ':'Czechia', 'DE':'Germany', 'DJ':'Djibouti',
  'DK':'Denmark', 'DM':'Dominica', 'DO':'Dominican Republic',
  'DZ':'Algeria', 'EC':'Ecuador', 'EE':'Estonia',
  'EG':'Egypt', 'EH':'Western Sahara', 'ER':'Eritrea',
  'ES':'Spain', 'ET':'Ethiopia', 'FI':'Finland',
  'FJ':'Fiji', 'FK':'Falkland Islands (Malvinas)', 'FM':'Micronesia (Federated States of)',
  'FO':'Faroe Islands', 'FR':'France', 'GA':'Gabon',
  'GB':'United Kingdom of Great Britain and Northern Ireland', 'GD':'Grenada',
  'GE':'Georgia', 'GG':'Guernsey', 'GH':'Ghana',
  'GI':'Gibraltar', 'GL':'Greenland', 'GM':'Gambia',
  'GN':'Guinea', 'GQ':'Equatorial Guinea', 'GR':'Greece',
  'GS':'South Georgia and the South Sandwich Islands', 'GT':'Guatemala',
  'GU':'Guam', 'GW':'Guinea-Bissau', 'GY':'Guyana',
  'HK':'Hong Kong', 'HM':'Heard Island and McDonald Islands', 'HN':'Honduras',
  'HR':'Croatia', 'HT':'Haiti', 'HU':'Hungary',
  'ID':'Indonesia', 'IE':'Ireland', 'IL':'Israel',
  'IM':'Isle of Man', 'IN':'India', 'IO':'British Indian Ocean Territory',
  'IQ':'Iraq', 'IR':'Iran (Islamic Republic of)', 'IS':'Iceland',
  'IT':'Italy', 'JE':'Jersey', 'JM':'Jamaica',
  'JO':'Jordan', 'JP':'Japan', 'KE':'Kenya',
  'KG':'Kyrgyzstan', 'KH':'Cambodia', 'KI':'Kiribati',
  'KM':'Comoros', 'KN':'Saint Kitts and Nevis',
  'KP':'Korea (Democratic People\'s Republic of)', 'KR':'Korea, Republic of',
  'KW':'Kuwait', 'KY':'Cayman Islands', 'KZ':'Kazakhstan',
  'LA':'Lao People\'s Democratic Republic', 'LB':'Lebanon', 'LC':'Saint Lucia',
  'LI':'Liechtenstein', 'LK':'Sri Lanka', 'LR':'Liberia',
  'LS':'Lesotho', 'LT':'Lithuania', 'LU':'Luxembourg',
  'LV':'Latvia', 'LY':'Libya', 'MA':'Morocco',
  'MC':'Monaco', 'MD':'Moldova, Republic of', 'ME':'Montenegro',
  'MF':'Saint Martin (French part)', 'MG':'Madagascar', 'MH':'Marshall Islands',
  'MK':'North Macedonia', 'ML':'Mali', 'MM':'Myanmar',
  'MN':'Mongolia', 'MO':'Macao', 'MP':'Northern Mariana Islands',
  'MR':'Mauritania', 'MS':'Montserrat', 'MT':'Malta',
  'MU':'Mauritius', 'MV':'Maldives', 'MW':'Malawi',
  'MX':'Mexico', 'MY':'Malaysia', 'MZ':'Mozambique',
  'NA':'Namibia', 'NC':'New Caledonia', 'NE':'Niger',
  'NF':'Norfolk Island', 'NG':'Nigeria', 'NI':'Nicaragua',
  'NL':'Netherlands', 'NO':'Norway', 'NP':'Nepal',
  'NR':'Nauru', 'NU':'Niue', 'NZ':'New Zealand',
  'OM':'Oman', 'PA':'Panama', 'PE':'Peru',
  'PF':'French Polynesia', 'PG':'Papua New Guinea', 'PH':'Philippines',
  'PK':'Pakistan', 'PL':'Poland', 'PM':'Saint Pierre and Miquelon',
  'PN':'Pitcairn', 'PR':'Puerto Rico', 'PS':'Palestine, State of',
  'PT':'Portugal', 'PW':'Palau', 'PY':'Paraguay',
  'QA':'Qatar', 'RO':'Romania', 'RS':'Serbia',
  'RU':'Russian Federation', 'RW':'Rwanda', 'SA':'Saudi Arabia',
  'SB':'Solomon Islands', 'SC':'Seychelles', 'SD':'Sudan',
  'SE':'Sweden', 'SG':'Singapore',
  'SH':'Saint Helena, Ascension and Tristan da Cunha', 'SI':'Slovenia',
  'SK':'Slovakia', 'SL':'Sierra Leone', 'SM':'San Marino',
  'SN':'Senegal', 'SO':'Somalia', 'SR':'Suriname',
  'SS':'South Sudan', 'ST':'Sao Tome and Principe', 'SV':'El Salvador',
  'SY':'Syrian Arab Republic', 'SZ':'Eswatini', 'TC':'Turks and Caicos Islands',
  'TD':'Chad', 'TF':'French Southern Territories', 'TG':'Togo',
  'TH':'Thailand', 'TJ':'Tajikistan', 'TK':'Tokelau',
  'TL':'Timor-Leste', 'TM':'Turkmenistan', 'TN':'Tunisia',
  'TO':'Tonga', 'TR':'Türkiye', 'TT':'Trinidad and Tobago',
  'TV':'Tuvalu', 'TW':'Taiwan, Province of China', 'TZ':'Tanzania, United Republic of',
  'UA':'Ukraine', 'UG':'Uganda', 'UM':'United States Minor Outlying Islands',
  'US':'United States of America', 'UY':'Uruguay', 'UZ':'Uzbekistan',
  'VA':'Holy See', 'VC':'Saint Vincent and the Grenadines',
  'VE':'Venezuela (Bolivarian Republic of)', 'VG':'Virgin Islands (British)',
  'VI':'Virgin Islands (U.S.)', 'VN':'Viet Nam', 'VU':'Vanuatu',
  'WF':'Wallis and Futuna', 'WS':'Samoa', 'YE':'Yemen',
  'YT':'Mayotte', 'ZA':'South Africa', 'ZM':'Zambia',
  'ZW':'Zimbabwe'
};

// Las tres entradas que NO SON PAISES no tienen ISO, asi que no hay estandar
// contra el que comprobarlas. Se declaran aqui con su literal y quedan exentas del
// invariante — pero no del control: el valor tiene que ser exactamente este.
const EXENTAS_EN = {
  'BANCO CENTRAL EUROPEO':        'European Central Bank',
  'ORGANISMOS INTERNACIONALES':   'International organisations',
  'OTROS PAISES NO RELACIONADOS': 'Other countries not listed'
};

// Y la unica excepcion del ingles: 'LUXEMBURGO (DI)' comparte el codigo LU con
// 'LUXEMBURGO'. El sufijo (DI) es una distincion interna de la lista de la AEAT y
// no un pais, asi que el valor es el nombre ISO de LU con el sufijo pegado. Se
// declara como formula, no como literal suelto, para que siga atado al estandar.
const EXCEPCIONES_EN = {
  'LUXEMBURGO (DI)': {
    valor: ISO_EN['LU'] + ' (DI)',
    motivo: 'comparte el codigo LU con LUXEMBURGO; el sufijo (DI) es de la AEAT y se arrastra'
  }
};

// ── 8 · El invariante del ingles: cada valor es el nombre ISO de su alfa-2 ────
function comprobarEn(tabla) {
  const fallos = [];
  const detalle = { porISO: 0, totalPorISO: 0, excepciones: 0, exentas: 0 };
  for (const clave of clavesISO) {
    const valor = tabla[clave];
    if (typeof valor !== 'string' || valor === '') {
      fallos.push(clave + ' -> nombre ingles vacio o no es texto');
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(EXENTAS_EN, clave)) {
      if (valor === EXENTAS_EN[clave]) detalle.exentas++;
      else fallos.push('SIN ISO   ' + clave + ' -> "' + valor + '" y se declaro "' +
                       EXENTAS_EN[clave] + '"');
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(EXCEPCIONES_EN, clave)) {
      if (valor === EXCEPCIONES_EN[clave].valor) detalle.excepciones++;
      else fallos.push('EXCEPCION ' + clave + ' -> "' + valor + '" y la excepcion declara "' +
                       EXCEPCIONES_EN[clave].valor + '"');
      continue;
    }
    const codigo = PAIS_ISO[clave];
    if (!codigo) {
      fallos.push(clave + ' no tiene codigo ISO en PAIS_ISO y no esta declarada como exenta');
      continue;
    }
    const esperado = ISO_EN[codigo];
    if (esperado === undefined) {
      fallos.push('el codigo ' + codigo + ' (' + clave + ') no esta en la tabla ancla ISO_EN');
      continue;
    }
    detalle.totalPorISO++;
    if (valor === esperado) detalle.porISO++;
    else fallos.push('ISO 3166-1  ' + clave + ' (' + codigo + ') -> "' + valor +
                     '" y el nombre corto de ISO es "' + esperado + '"');
  }
  return { fallos, detalle };
}

console.log('\n--- 7. la tabla ancla ISO_EN cubre los codigos de PAIS_ISO ---');
// Sin esto, un codigo que faltara en el ancla dejaria su pais sin comprobar.
const codigosUsados = [];
for (const k of clavesISO) {
  const c = PAIS_ISO[k];
  if (c && codigosUsados.indexOf(c) === -1) codigosUsados.push(c);
}
const anclaFaltan = codigosUsados.filter(function (c) { return !(c in ISO_EN); });
const anclaSobran = Object.keys(ISO_EN).filter(function (c) { return codigosUsados.indexOf(c) === -1; });
console.log('codigos distintos en PAIS_ISO: ' + codigosUsados.length +
            ' · en ISO_EN: ' + Object.keys(ISO_EN).length);
if (anclaFaltan.length) falla('ISO_EN no cubre ' + anclaFaltan.length + ' codigos: ' + anclaFaltan.join(' '));
if (anclaSobran.length) falla('ISO_EN lleva ' + anclaSobran.length + ' codigos que no usa nadie: ' + anclaSobran.join(' '));
if (!anclaFaltan.length && !anclaSobran.length) {
  console.log('OK     ' + codigosUsados.length + ' codigos, cobertura exacta');
}

console.log('\n--- 8. invariante del ingles sobre las 245 ---');
const resEn = comprobarEn(PAIS_PRESENTACION_EN);
for (const f of resEn.fallos) falla(f);
const dEn = resEn.detalle;
console.log('por ISO 3166-1: ' + dEn.porISO + '/' + dEn.totalPorISO +
            ' · excepcion (DI): ' + dEn.excepciones + '/' + Object.keys(EXCEPCIONES_EN).length +
            ' · sin ISO (no son paises): ' + dEn.exentas + '/' + Object.keys(EXENTAS_EN).length +
            ' · TOTAL ' + (dEn.porISO + dEn.excepciones + dEn.exentas) + '/' + clavesISO.length);
if (dEn.totalPorISO !== 241) {
  falla('se esperaban 241 claves bajo el invariante de ISO (245 menos las 3 sin ISO y ' +
        'menos LUXEMBURGO (DI)) y hay ' + dEn.totalPorISO);
}

// ── 9 · paisPresentacionEn(): casos de uso y el que NO esta en el mapa ───────
console.log('\n--- 9. paisPresentacionEn() ---');
const casosEn = [
  ['MARRUECOS',                     'Morocco'],
  ['ALEMANIA',                      'Germany'],
  ['CHECA, REPUBLICA',              'Czechia'],
  ['PAISES BAJOS',                  'Netherlands'],
  ['ESTADOS UNIDOS DE AMERICA',     'United States of America'],
  ['SUAZILANDIA',                   'Eswatini'],
  ['MACEDONIA',                     'North Macedonia'],
  ['SAN MARTIN',                    'Saint Martin (French part)'],
  ['ESPAÑA',                        'Spain'],
  ['CURAÇAO',                       'Curaçao'],
  ['PAISES BAJOS (PARTE CARIBEÑA)', 'Bonaire, Sint Eustatius and Saba'],
  ['LUXEMBURGO',                    'Luxembourg'],
  ['LUXEMBURGO (DI)',               'Luxembourg (DI)'],
  ['BANCO CENTRAL EUROPEO',         'European Central Bank'],
  ['ORGANISMOS INTERNACIONALES',    'International organisations'],
  ['OTROS PAISES NO RELACIONADOS',  'Other countries not listed'],
  ['  MARRUECOS  ',                 'Morocco'],                   // se recorta igual que las otras dos
  // --- lo que NO esta en el mapa sale tal cual: nunca null, nunca aborta ---
  ['WAKANDA',                       'WAKANDA'],
  ['Morocco',                       'Morocco'],
  ['',                              ''],
  [null,                            ''],
  [undefined,                       '']
];
for (const [entrada, esperado] of casosEn) {
  const obtenido = paisPresentacionEn(entrada);
  const ok = obtenido === esperado;
  if (!ok) falla('paisPresentacionEn(' + mostrar(entrada) + ') = ' +
                 mostrar(obtenido) + ' y se esperaba ' + mostrar(esperado));
  else console.log('OK     ' + mostrar(entrada).padEnd(34) + ' -> ' + mostrar(obtenido));
}
for (const entrada of ['MARRUECOS', 'WAKANDA', '', null, undefined, 0, 123]) {
  const r = paisPresentacionEn(entrada);
  if (r === null || r === undefined || typeof r !== 'string') {
    falla('paisPresentacionEn(' + mostrar(entrada) + ') no devolvio texto: ' + String(r));
  }
}
// Los dos mapas tienen que ser distintos de verdad. Si alguien copiase el mapa
// espanol sobre el ingles, todo lo de arriba seguiria pasando menos esto.
const iguales = clavesISO.filter(function (k) {
  return PAIS_PRESENTACION[k] === PAIS_PRESENTACION_EN[k];
});
// CUANTAS COINCIDENCIAS SON LEGITIMAS: 84, contadas y revisadas UNA A UNA el
// 14/08/2026. Son los paises que se escriben IGUAL en los dos idiomas: Albania,
// Andorra, Angola, Argentina, Armenia, Aruba, Australia, Austria, Bahamas,
// Bangladesh, Barbados, Bulgaria, Burkina Faso, Burundi, Chad, Chile, China,
// Colombia, Congo, Costa Rica, Cuba, Curacao, Dominica, Ecuador, Eritrea,
// Estonia, Gambia, Georgia, Ghana, Gibraltar, Guam, Guatemala, Guinea,
// Guinea-Bissau, Guyana, Honduras, India, Indonesia, Iraq, Israel, Jamaica,
// Jersey, Kiribati, Kuwait, Lesotho, Liberia, Liechtenstein, Macao, Madagascar,
// Malawi, Malta, Mauritania, Mayotte, Mongolia, Montenegro, Montserrat,
// Mozambique, Myanmar, Namibia, Nauru, Nepal, Nicaragua, Nigeria, Palau,
// Paraguay, Pitcairn, Portugal, Puerto Rico, El Salvador, Samoa, San Marino,
// Senegal, Serbia, Seychelles, Somalia, Sri Lanka, Togo, Tonga, Tuvalu, Uganda,
// Uruguay, Vanuatu, Yemen y Zambia.
//
// EL UMBRAL ERA '> 80' Y MARCABA EN ROJO UNA TABLA CORRECTA. Es el mismo error que
// ya se ha repetido varias veces esta semana: la expectativa estaba mal, no el
// dato. Ahora el numero va CLAVADO: si cambia, alguien ha tocado un nombre y hay
// que mirar cual, que es mucho mas util que una heuristica difusa. Y sigue
// cazando una copia entera del mapa, que daria 245.
const COINCIDENCIAS_LEGITIMAS = 84;
if (iguales.length !== COINCIDENCIAS_LEGITIMAS) {
  falla('el mapa ingles coincide con el espanol en ' + iguales.length +
        ' de 245, y las coincidencias legitimas revisadas son ' + COINCIDENCIAS_LEGITIMAS +
        (iguales.length === 245 ? ': ES UNA COPIA DEL MAPA ESPANOL' :
         '. Mira que nombre ha cambiado.'));
} else {
  console.log('OK     coinciden con el espanol solo en ' + iguales.length +
              ' claves, y son nombres que se escriben igual en los dos idiomas');
}

// ── 10 · LA PRUEBA MUERDE: se mutan copias y tienen que FALLAR ───────────────
// POR QUE ESTE BLOQUE ES EL MAS IMPORTANTE: los nueve de arriba dicen "pasa". Este
// dice "y si estuviera mal, lo veria". Sin el, un invariante mal escrito (comparar
// una tabla consigo misma, por ejemplo) daria 245/245 para siempre.
//
// Se muta una COPIA. Los mapas de verdad no se tocan.
console.log('\n--- 10. verificacion por mutacion: la prueba tiene que morder ---');
function copia(objeto) {
  return Object.assign({}, objeto);
}
function esperaFallo(titulo, fallos) {
  if (fallos.length) {
    console.log('OK     muerde · ' + titulo);
    console.log('         ' + fallos[0]);
  } else {
    falla('LA MUTACION NO SE DETECTA · ' + titulo +
          ' — el invariante no comprueba lo que dice comprobar');
  }
}

// -- mutaciones del mapa ingles --
const mutEn1 = copia(PAIS_PRESENTACION_EN);
mutEn1['MARRUECOS'] = 'Marokko';
esperaFallo('ingles: MARRUECOS -> "Marokko" (no es el nombre ISO de MA)',
            comprobarEn(mutEn1).fallos);

const mutEn2 = copia(PAIS_PRESENTACION_EN);
mutEn2['PAISES BAJOS'] = 'Holland';           // el error humano tipico
esperaFallo('ingles: PAISES BAJOS -> "Holland" en vez de "Netherlands"',
            comprobarEn(mutEn2).fallos);

const mutEn3 = copia(PAIS_PRESENTACION_EN);
mutEn3['CHECA, REPUBLICA'] = 'Czech Republic'; // el nombre viejo, ya no es el de ISO
esperaFallo('ingles: CHECA, REPUBLICA -> "Czech Republic" en vez de "Czechia"',
            comprobarEn(mutEn3).fallos);

const mutEn4 = copia(PAIS_PRESENTACION_EN);
mutEn4['LUXEMBURGO (DI)'] = 'Luxembourg';      // se pierde el sufijo de la AEAT
esperaFallo('ingles: LUXEMBURGO (DI) se queda sin el sufijo (DI)',
            comprobarEn(mutEn4).fallos);

const mutEn5 = copia(PAIS_PRESENTACION_EN);
mutEn5['BANCO CENTRAL EUROPEO'] = 'European Central Bank of Europe';
esperaFallo('ingles: una de las tres sin ISO cambiada (exenta del invariante, NO del control)',
            comprobarEn(mutEn5).fallos);

const mutEn6 = copia(PAIS_PRESENTACION_EN);
delete mutEn6['ZIMBABUE'];
esperaFallo('ingles: falta una clave entera', comprobarEn(mutEn6).fallos);

// La mutacion que de verdad demuestra que las dos tablas son independientes: si
// PAIS_PRESENTACION_EN fuese una copia del mapa espanol, esto tendria que cantar.
const mutEn7 = copia(PAIS_PRESENTACION);
esperaFallo('ingles: se le pasa el mapa ESPANOL entero', comprobarEn(mutEn7).fallos);

// -- mutaciones del mapa espanol --
const mutEs1 = copia(PAIS_PRESENTACION);
mutEs1['MARRUECOS'] = 'Marruecos del Norte';   // pais inventado por adicion
esperaFallo('espanol: MARRUECOS -> "Marruecos del Norte" (palabras de mas)',
            comprobarEs(mutEs1, EXCEPCIONES_ES).fallos);

const mutEs2 = copia(PAIS_PRESENTACION);
mutEs2['CHECA, REPUBLICA'] = 'República Checa y Eslovaquia';
esperaFallo('espanol: CHECA, REPUBLICA -> "República Checa y Eslovaquia"',
            comprobarEs(mutEs2, EXCEPCIONES_ES).fallos);

const mutEs3 = copia(PAIS_PRESENTACION);
mutEs3['NAVIDAD, ISLA'] = 'Isla de la Navidad'; // dentro de una excepcion declarada
esperaFallo('espanol: se toca el valor de una de las cuatro excepciones del §8.4',
            comprobarEs(mutEs3, EXCEPCIONES_ES).fallos);

// -- mutaciones de la propia lista de excepciones --
const mutExc1 = copia(EXCEPCIONES_ES);
mutExc1['WAKANDA, REPUBLICA'] = { valor: 'República de Wakanda', motivo: 'colada a mano' };
esperaFallo('excepciones: se cuela una QUINTA excepcion', comprobarExcepciones(mutExc1));

const mutExc2 = copia(EXCEPCIONES_ES);
delete mutExc2['NAVIDAD, ISLA'];
esperaFallo('excepciones: se quita una de las cuatro', comprobarExcepciones(mutExc2));

const mutExc3 = copia(EXCEPCIONES_ES);
mutExc3['MARRUECOS'] = { valor: 'Marruecos', motivo: 'para saltarse el invariante' };
esperaFallo('excepciones: se declara excepcion un pais que no es de los cuatro',
            comprobarExcepciones(mutExc3));

// Y el caso contrario, que tambien hay que comprobar: una clave que SI se puede
// meter por la puerta de las excepciones dejaria de mirarse. Se demuestra que
// meterla no basta, porque la lista blanca del bloque 2b la rechaza.
const mutExc4 = copia(EXCEPCIONES_ES);
mutExc4['MARRUECOS'] = { valor: 'Marruecos del Norte', motivo: 'pais inventado' };
const mutEs4 = copia(PAIS_PRESENTACION);
mutEs4['MARRUECOS'] = 'Marruecos del Norte';
esperaFallo('excepciones: colar el pais inventado Y su excepcion sigue fallando',
            comprobarExcepciones(mutExc4).concat(comprobarEs(mutEs4, mutExc4).fallos));

console.log(mal ? '\n' + mal + ' FALLOS' : '\nTODAS PASAN');
process.exit(mal ? 1 : 0);
