// PRUEBA DE LA METRICA DE TIMES · 14/08/2026
// Se ejecuta con:  node docs/test-metrica-times.js
//
// Los ocho primeros casos son la tabla de invariantes del §9.1 del contrato,
// copiada tal cual. No son casos inventados: son los valores del estandar de las 14
// fuentes base, y si uno falla la tabla esta mal, no la prueba.
//
// LOS INVARIANTES DE TIMES NO SON LOS DE HELVETICA, y ese es el fallo que esta
// prueba existe para pillar: el §9.1 cambia la fuente pero el motor podria seguir
// midiendo con la tabla vieja y el PDF abriria igual, con TODOS los cortes de linea
// desplazados. Por eso hay un caso que comprueba explicitamente que esta tabla NO
// es la de Helvetica.
//
// Ademas se comprueban las tres cosas que no se ven mirando un caracter suelto:
// que los diez digitos midan lo mismo (si no, las columnas de numeros bailan), que
// ningun ancho sea negativo, y que las dos tablas tengan los 256 codigos.
const { ANCHOS_TIMES, ANCHOS_TIMES_BOLD, GLIFOS_WINANSI_TIMES } =
  require('./metrica-times-2026-08-14.js');

let mal = 0, total = 0;
function comprobar(etiqueta, condicion, detalle) {
  total++;
  if (!condicion) mal++;
  console.log((condicion ? 'OK   ' : 'FALLA') + '  ' + etiqueta.padEnd(46) +
              (detalle === undefined ? '' : detalle));
}

// ── 1 · Los invariantes del §9.1 del contrato ─────────────────────────────────
// SIETE DE LOS OCHO VAN COPIADOS TAL CUAL DEL CONTRATO. El octavo, la 'é' en
// negrita, NO, y hay que leer el §1b de aqui abajo antes de "arreglarlo".
console.log('── invariantes del §9.1 del contrato ──');
const invariantes = [
  ['espacio', 32, 250, 250],
  ['A', 65, 722, 722],
  ['a', 97, 444, 500],
  ['i', 105, 278, 278],
  ['W', 87, 944, 1000],
  ['N con virgulilla (0xD1)', 209, 722, 722],
  // El contrato pone 444/500 aqui. LA NEGRITA ES 444, NO 500: ver el §1b.
  ['e con tilde (0xE9)', 233, 444, 444]
];
for (const [nombre, codigo, esperadoReg, esperadoBold] of invariantes) {
  const reg = ANCHOS_TIMES[codigo], bold = ANCHOS_TIMES_BOLD[codigo];
  comprobar(nombre + ' (' + codigo + ') = ' + esperadoReg + '/' + esperadoBold,
            reg === esperadoReg && bold === esperadoBold,
            'obtenido ' + reg + '/' + bold + '  glifo=' + GLIFOS_WINANSI_TIMES[codigo]);
}
// El §9.1 lo pone en la misma tabla: cualquier digito, 500 en las dos fuentes.
let digitosBien = true, detalleDigitos = '';
for (let codigo = 48; codigo <= 57; codigo++) {
  if (ANCHOS_TIMES[codigo] !== 500 || ANCHOS_TIMES_BOLD[codigo] !== 500) {
    digitosBien = false;
    detalleDigitos += ' ' + String.fromCharCode(codigo) + '=' +
                      ANCHOS_TIMES[codigo] + '/' + ANCHOS_TIMES_BOLD[codigo];
  }
}
comprobar('cualquier digito 0-9 = 500/500', digitosBien, detalleDigitos || '48..57');

// ── 1b · LA UNICA DISCREPANCIA CON LA TABLA DEL §9.1, Y POR QUE MANDA LA TABLA ─
// El §9.1 del contrato dice que la 'é' mide 444 en Times-Roman y 500 en Times-Bold.
// LOS 444 SON CORRECTOS; LOS 500 NO: en Times-Bold la 'é' mide 444, igual que la
// 'e'. Aqui manda el estandar y no el contrato, con dos pruebas independientes:
//
//   1. LA REGLA DEL AFM. En las 14 fuentes base toda minuscula acentuada mide
//      EXACTAMENTE lo que su letra base. La 'e' de Times-Bold mide 444 (la negrita
//      engorda la b, la d y la h a 556, pero deja la c y la e en 444), asi que la
//      'é' mide 444. Esta prueba verifica esa regla en 12 pares mas abajo (§8) y
//      la fuente del sistema la cumple en LAS 27 acentuadas de Latin-1, sin una
//      sola excepcion.
//   2. LA TIMES REAL DE macOS. /System/Library/Fonts/Times.ttc da 444/444 para el
//      codigo 233 y 444/444 para el 101. Lo comprueba, glifo a glifo y para los
//      218 codigos, docs/test-metrica-times-cotejo-sistema.js.
//
// DE DONDE SALE EL 500 DEL CONTRATO: de la fila de al lado. La 'a' SI es 444/500,
// y la tabla del §9.1 se escribio adaptando la de Helvetica (donde 'a' y 'é' miden
// las dos 556/556, o sea el mismo par en las dos filas). Al pasar a Times la 'a'
// se corrigio a 444/500 y la 'é' se quedo con la negrita de la 'a'.
//
// NO SE ARREGLA CAMBIANDO LA TABLA. Poner 500 en eacute meteria 56 milesimas de em
// de error en cada 'é' en negrita, y la 'é' sale 16 veces en la plantilla del
// informe. Lo que hay que corregir es la fila del §9.1 del contrato.
console.log('── la e con tilde en negrita: 444, no 500 (§1b) ──');
comprobar("é en negrita = e en negrita = 444",
          ANCHOS_TIMES_BOLD[0xE9] === 444 && ANCHOS_TIMES_BOLD[101] === 444,
          'eacute=' + ANCHOS_TIMES_BOLD[0xE9] + '  e=' + ANCHOS_TIMES_BOLD[101] +
          '  (el §9.1 del contrato dice 500: es una errata del contrato)');

// ── 2 · Esta tabla NO es la de Helvetica ──────────────────────────────────────
// El error mas probable de todo el §9.1: cambiar el /BaseFont a Times-Roman y
// seguir midiendo con ANCHOS_HELVETICA. Times es mas estrecha, asi que el motor
// creeria que caben mas palabras por linea y el visor las dibujaria desbordadas
// por el margen derecho. Se comprueba con los cuatro anchos que mas se usan.
console.log('── no es la tabla de Helvetica disfrazada ──');
const NO_SON_DE_HELVETICA = [
  ['espacio', 32, 278], ['digito 0', 48, 556], ['a', 97, 556], ['A', 65, 667]
];
for (const [nombre, codigo, valorDeHelvetica] of NO_SON_DE_HELVETICA) {
  comprobar(nombre + ': NO vale ' + valorDeHelvetica + ' (eso es Helvetica)',
            ANCHOS_TIMES[codigo] !== valorDeHelvetica,
            'vale ' + ANCHOS_TIMES[codigo]);
}

// ── 3 · Los diez digitos miden LO MISMO dentro de cada fuente ─────────────────
// Es distinto del caso anterior: aqui no importa cuanto midan, importa que sean
// todos iguales. Si el '1' fuese mas estrecho que el '0', una columna de importes
// alineada a la izquierda saldria con los digitos descuadrados fila a fila.
console.log('── los diez digitos, iguales entre si ──');
for (const [nombreFuente, tabla] of [['Times-Roman', ANCHOS_TIMES],
                                     ['Times-Bold', ANCHOS_TIMES_BOLD]]) {
  const anchos = [];
  for (let codigo = 48; codigo <= 57; codigo++) anchos.push(tabla[codigo]);
  const distintos = anchos.filter((a) => a !== anchos[0]).length;
  comprobar('digitos de ' + nombreFuente + ' todos iguales', distintos === 0,
            '[' + anchos.join(',') + ']');
}

// ── 4 · Ningun ancho negativo (ni NaN, ni undefined, ni fraccionario) ─────────
// Un ancho negativo haria retroceder el cursor y superpondria texto; un NaN
// envenena la suma entera y cortarEnLineas dejaria de cortar.
console.log('── anchos sanos ──');
for (const [nombreFuente, tabla] of [['Times-Roman', ANCHOS_TIMES],
                                     ['Times-Bold', ANCHOS_TIMES_BOLD]]) {
  const malos = [];
  for (let codigo = 0; codigo < 256; codigo++) {
    const a = tabla[codigo];
    if (typeof a !== 'number' || !isFinite(a) || a < 0 || Math.floor(a) !== a) {
      malos.push(codigo + '=' + a);
    }
  }
  comprobar('ningun ancho negativo/NaN/fraccionario en ' + nombreFuente,
            malos.length === 0, malos.length ? malos.join(' ') : '256 enteros >= 0');
}

// ── 5 · Las dos tablas tienen los 256 codigos ─────────────────────────────────
console.log('── cobertura de los 256 codigos ──');
for (const [nombreFuente, tabla] of [['Times-Roman', ANCHOS_TIMES],
                                     ['Times-Bold', ANCHOS_TIMES_BOLD]]) {
  comprobar(nombreFuente + ': 256 codigos definidos',
            tabla.length === 256 && Object.keys(tabla).length === 256,
            'length=' + tabla.length + ' claves=' + Object.keys(tabla).length);
}

// ── 6 · Los ceros son EXACTAMENTE los codigos sin glifo ───────────────────────
// Esta es la que pilla el error de verdad: un 0 en un codigo que si tiene glifo
// significa que ese caracter mide cero y el texto se solapa, sin avisar de nada.
console.log('── los ceros son solo los codigos sin glifo ──');
const SIN_GLIFO = [];
for (let codigo = 0; codigo <= 31; codigo++) SIN_GLIFO.push(codigo);
SIN_GLIFO.push(127, 129, 141, 143, 144, 157);
const esperadoSinGlifo = SIN_GLIFO.join(',');
comprobar('GLIFOS_WINANSI_TIMES: los 38 huecos del Anexo D',
          GLIFOS_WINANSI_TIMES.map((g, c) => g === null ? c : -1).filter(c => c >= 0).join(',') ===
          esperadoSinGlifo, '0..31 127 129 141 143 144 157');
for (const [nombreFuente, tabla] of [['Times-Roman', ANCHOS_TIMES],
                                     ['Times-Bold', ANCHOS_TIMES_BOLD]]) {
  const ceros = [];
  for (let codigo = 0; codigo < 256; codigo++) if (tabla[codigo] === 0) ceros.push(codigo);
  comprobar(nombreFuente + ': los ceros son los 38 sin glifo',
            ceros.join(',') === esperadoSinGlifo,
            ceros.length + ' ceros');
}

// ── 7 · Los caracteres que este proyecto NO puede perder ──────────────────────
// El §2 los nombra uno a uno: sin Ñ, vocales acentuadas, ü, ç y º "esto no sirve
// para este proyecto". Se comprueba ademas la vineta y las rayas, que salen en la
// plantilla del informe.
console.log('── los caracteres del §2 y de la plantilla ──');
const IMPRESCINDIBLES = [
  ['Ñ', 0xD1], ['ñ', 0xF1], ['á', 0xE1], ['é', 0xE9], ['í', 0xED], ['ó', 0xF3],
  ['ú', 0xFA], ['ü', 0xFC], ['ç', 0xE7], ['º', 0xBA], ['Á', 0xC1], ['É', 0xC9],
  ['Ú', 0xDA], ['· periodcentered', 0xB7], ['– endash', 0x96], ['— emdash', 0x97],
  ['• bullet', 0x95], ['€ Euro', 0x80]
];
for (const [nombre, codigo] of IMPRESCINDIBLES) {
  const reg = ANCHOS_TIMES[codigo], bold = ANCHOS_TIMES_BOLD[codigo];
  comprobar(nombre + ' (0x' + codigo.toString(16).toUpperCase() + ') tiene ancho > 0',
            reg > 0 && bold > 0, reg + '/' + bold + '  glifo=' + GLIFOS_WINANSI_TIMES[codigo]);
}

// ── 8 · Las acentuadas miden lo que su letra base, la i TAMBIEN ───────────────
// Regla del estandar. En Times NO hay excepcion con la 'i': alli donde Helvetica
// mide 222 la 'i' y 278 la 'í', Times mide 278 las dos. Se comprueba para que
// nadie traiga la excepcion de Helvetica a esta tabla "por coherencia".
console.log('── acentuadas contra su letra base ──');
const IGUAL_A_SU_BASE = [
  ['Á = A', 0xC1, 65], ['É = E', 0xC9, 69], ['Ó = O', 0xD3, 79], ['Ú = U', 0xDA, 85],
  ['Ñ = N', 0xD1, 78], ['á = a', 0xE1, 97], ['é = e', 0xE9, 101], ['ó = o', 0xF3, 111],
  ['ú = u', 0xFA, 117], ['ü = u', 0xFC, 117], ['ñ = n', 0xF1, 110],
  ['í = i', 0xED, 105]
];
for (const [nombre, codigo, base] of IGUAL_A_SU_BASE) {
  comprobar(nombre, ANCHOS_TIMES[codigo] === ANCHOS_TIMES[base] &&
                    ANCHOS_TIMES_BOLD[codigo] === ANCHOS_TIMES_BOLD[base],
            ANCHOS_TIMES[codigo] + '/' + ANCHOS_TIMES_BOLD[codigo]);
}
comprobar('la i de Times mide 278 en las dos, no 222',
          ANCHOS_TIMES[105] === 278 && ANCHOS_TIMES_BOLD[105] === 278,
          'i=' + ANCHOS_TIMES[105] + '/' + ANCHOS_TIMES_BOLD[105]);
// La I mayuscula de Times lleva remates y mide 333, no 278 como la de Helvetica.
// Sale en 'IRPF', 'NIF' e 'Impuesto', o sea en casi todas las lineas del informe.
comprobar('la I mayuscula mide 333/389, no 278',
          ANCHOS_TIMES[73] === 333 && ANCHOS_TIMES_BOLD[73] === 389,
          'I=' + ANCHOS_TIMES[73] + '/' + ANCHOS_TIMES_BOLD[73]);

// ── 9 · Las dos tablas son distintas, y cuales adelgazan en negrita ───────────
// Por si alguien copia la regular en las dos constantes: el motor pondria las
// cabeceras de tabla mal medidas y no se notaria hasta ver un PDF con una cabecera
// desbordada.
// EN TIMES ADELGAZAN CINCO GLIFOS, no uno: { } ~ © ®. Y la @, que en Helvetica es
// la unica que adelgaza (1015 -> 975), aqui ENGORDA (921 -> 930). Comprobado
// contra /System/Library/Fonts/Times.ttc, que dice exactamente lo mismo. Si algun
// dia aparece un sexto codigo en esta lista, es que alguien toco un ancho a mano.
console.log('── la negrita es otra tabla ──');
let distintas = 0;
const masEstrecha = [];
for (let codigo = 0; codigo < 256; codigo++) {
  if (ANCHOS_TIMES[codigo] !== ANCHOS_TIMES_BOLD[codigo]) distintas++;
  if (ANCHOS_TIMES_BOLD[codigo] < ANCHOS_TIMES[codigo]) {
    masEstrecha.push(codigo + '(' + GLIFOS_WINANSI_TIMES[codigo] + ')');
  }
}
comprobar('la negrita difiere de la regular en varios codigos', distintas > 50,
          distintas + ' codigos distintos');
comprobar('adelgazan exactamente { } ~ (c) (r)',
          masEstrecha.join(' ') === '123(braceleft) 125(braceright) 126(asciitilde) ' +
                                    '169(copyright) 174(registered)',
          masEstrecha.join(' ') || 'ninguno');
comprobar('@ = 921 regular / 930 negrita (aqui ENGORDA)',
          ANCHOS_TIMES[64] === 921 && ANCHOS_TIMES_BOLD[64] === 930,
          ANCHOS_TIMES[64] + '/' + ANCHOS_TIMES_BOLD[64]);

// ── 10 · Una medida de verdad, de punta a punta ───────────────────────────────
// La formula del §2 (ancho/1000*tamano) sobre una cadena real del informe, al
// cuerpo NUEVO del §9.1 (11 pt, no 10.5), para que el numero se pueda comprobar a
// mano con una regla en el PDF.
console.log('── una medida completa, con la formula del §2 ──');
function anchoDeCadena(texto, tabla, tamano) {
  let milesimas = 0;
  for (let i = 0; i < texto.length; i++) {
    const codigo = texto.charCodeAt(i);
    milesimas += codigo < 256 ? tabla[codigo] : 0;
  }
  return milesimas / 1000 * tamano;
}
// 'Hammad' = H722 + a444 + m778 + m778 + a444 + d500 = 3666 milesimas.
// En Helvetica la misma palabra son 4056: Times ahorra 390 milesimas, casi media
// 'a'. Eso es lo que justifica subir el cuerpo de 10.5 a 11 pt en el §9.1.
const anchoHammad = anchoDeCadena('Hammad', ANCHOS_TIMES, 11);
comprobar("'Hammad' a 11 pt = 40.326 pt",
          Math.abs(anchoHammad - 40.326) < 1e-9, anchoHammad.toFixed(4) + ' pt');
// 'Situación fiscal' con acento, que es la cadena que rompe si la tabla no cubre
// Latin-1: 16 caracteres, y el ancho tiene que caber de sobra en el ancho util.
const anchoSituacion = anchoDeCadena('Situación fiscal', ANCHOS_TIMES_BOLD, 9.5);
comprobar("'Situación fiscal' en negrita a 9.5 pt cabe en 483.28 pt",
          anchoSituacion > 0 && anchoSituacion < 483.28, anchoSituacion.toFixed(4) + ' pt');

console.log('\n' + (total - mal) + ' de ' + total + ' casos pasan');
console.log(mal ? mal + ' FALLOS' : 'TODAS PASAN');
process.exit(mal ? 1 : 0);
