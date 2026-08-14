// PRUEBA DE LA METRICA DE HELVETICA · 14/08/2026
// Se ejecuta con:  node docs/test-metrica-helvetica.js
//
// Los ocho primeros casos son la tabla de invariantes del §2 del contrato, copiada
// tal cual. No son casos inventados: son los valores del estandar de las 14 fuentes
// base, y si uno falla la tabla esta mal, no la prueba.
//
// Ademas se comprueban las tres cosas que no se ven mirando un caracter suelto:
// que los diez digitos midan lo mismo (si no, las columnas de numeros bailan), que
// ningun ancho sea negativo, y que las dos tablas tengan los 256 codigos.
const { ANCHOS_HELVETICA, ANCHOS_HELVETICA_BOLD, GLIFOS_WINANSI } =
  require('./metrica-helvetica-2026-08-14.js');

let mal = 0, total = 0;
function comprobar(etiqueta, condicion, detalle) {
  total++;
  if (!condicion) mal++;
  console.log((condicion ? 'OK   ' : 'FALLA') + '  ' + etiqueta.padEnd(46) +
              (detalle === undefined ? '' : detalle));
}

// ── 1 · Los invariantes del §2 del contrato ───────────────────────────────────
console.log('── invariantes del §2 del contrato ──');
const invariantes = [
  ['espacio', 32, 278, 278],
  ['A', 65, 667, 722],
  ['a', 97, 556, 556],
  ['i', 105, 222, 278],
  ['W', 87, 944, 944],
  ['N con virgulilla (0xD1)', 209, 722, 722],
  ['e con tilde (0xE9)', 233, 556, 556]
];
for (const [nombre, codigo, esperadoReg, esperadoBold] of invariantes) {
  const reg = ANCHOS_HELVETICA[codigo], bold = ANCHOS_HELVETICA_BOLD[codigo];
  comprobar(nombre + ' (' + codigo + ') = ' + esperadoReg + '/' + esperadoBold,
            reg === esperadoReg && bold === esperadoBold,
            'obtenido ' + reg + '/' + bold + '  glifo=' + GLIFOS_WINANSI[codigo]);
}
// El §2 lo pone en la misma tabla: cualquier digito, 556 en las dos fuentes.
let digitosBien = true, detalleDigitos = '';
for (let codigo = 48; codigo <= 57; codigo++) {
  if (ANCHOS_HELVETICA[codigo] !== 556 || ANCHOS_HELVETICA_BOLD[codigo] !== 556) {
    digitosBien = false;
    detalleDigitos += ' ' + String.fromCharCode(codigo) + '=' +
                      ANCHOS_HELVETICA[codigo] + '/' + ANCHOS_HELVETICA_BOLD[codigo];
  }
}
comprobar('cualquier digito 0-9 = 556/556', digitosBien, detalleDigitos || '48..57');

// ── 2 · Los diez digitos miden LO MISMO dentro de cada fuente ─────────────────
// Es distinto del caso anterior: aqui no importa cuanto midan, importa que sean
// todos iguales. Si el '1' fuese mas estrecho que el '0', una columna de importes
// alineada a la izquierda saldria con los digitos descuadrados fila a fila.
console.log('── los diez digitos, iguales entre si ──');
for (const [nombreFuente, tabla] of [['Helvetica', ANCHOS_HELVETICA],
                                     ['Helvetica-Bold', ANCHOS_HELVETICA_BOLD]]) {
  const anchos = [];
  for (let codigo = 48; codigo <= 57; codigo++) anchos.push(tabla[codigo]);
  const distintos = anchos.filter((a, i) => a !== anchos[0]).length;
  comprobar('digitos de ' + nombreFuente + ' todos iguales', distintos === 0,
            '[' + anchos.join(',') + ']');
}

// ── 3 · Ningun ancho negativo (ni NaN, ni undefined, ni fraccionario) ─────────
// Un ancho negativo haria retroceder el cursor y superpondria texto; un NaN
// envenena la suma entera y cortarEnLineas dejaria de cortar.
console.log('── anchos sanos ──');
for (const [nombreFuente, tabla] of [['Helvetica', ANCHOS_HELVETICA],
                                     ['Helvetica-Bold', ANCHOS_HELVETICA_BOLD]]) {
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

// ── 4 · Las dos tablas tienen los 256 codigos ─────────────────────────────────
console.log('── cobertura de los 256 codigos ──');
for (const [nombreFuente, tabla] of [['Helvetica', ANCHOS_HELVETICA],
                                     ['Helvetica-Bold', ANCHOS_HELVETICA_BOLD]]) {
  comprobar(nombreFuente + ': 256 codigos definidos',
            tabla.length === 256 && Object.keys(tabla).length === 256,
            'length=' + tabla.length + ' claves=' + Object.keys(tabla).length);
}

// ── 5 · Los ceros son EXACTAMENTE los codigos sin glifo ───────────────────────
// Esta es la que pilla el error de verdad: un 0 en un codigo que si tiene glifo
// significa que ese caracter mide cero y el texto se solapa, sin avisar de nada.
console.log('── los ceros son solo los codigos sin glifo ──');
const SIN_GLIFO = [];
for (let codigo = 0; codigo <= 31; codigo++) SIN_GLIFO.push(codigo);
SIN_GLIFO.push(127, 129, 141, 143, 144, 157);
const esperadoSinGlifo = SIN_GLIFO.join(',');
comprobar('GLIFOS_WINANSI: los 38 huecos son los del Anexo D',
          GLIFOS_WINANSI.map((g, c) => g === null ? c : -1).filter(c => c >= 0).join(',') ===
          esperadoSinGlifo, '0..31 127 129 141 143 144 157');
for (const [nombreFuente, tabla] of [['Helvetica', ANCHOS_HELVETICA],
                                     ['Helvetica-Bold', ANCHOS_HELVETICA_BOLD]]) {
  const ceros = [];
  for (let codigo = 0; codigo < 256; codigo++) if (tabla[codigo] === 0) ceros.push(codigo);
  comprobar(nombreFuente + ': los ceros son los 38 sin glifo',
            ceros.join(',') === esperadoSinGlifo,
            ceros.length + ' ceros');
}

// ── 6 · Los caracteres que este proyecto NO puede perder ──────────────────────
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
  const reg = ANCHOS_HELVETICA[codigo], bold = ANCHOS_HELVETICA_BOLD[codigo];
  comprobar(nombre + ' (0x' + codigo.toString(16).toUpperCase() + ') tiene ancho > 0',
            reg > 0 && bold > 0, reg + '/' + bold + '  glifo=' + GLIFOS_WINANSI[codigo]);
}

// ── 7 · Las acentuadas miden lo que su letra base, salvo la i ─────────────────
// Regla del estandar, y la excepcion de la 'i' esta documentada en la cabecera del
// modulo. Se comprueba para que nadie la "arregle" pensando que es una errata.
console.log('── acentuadas contra su letra base ──');
const IGUAL_A_SU_BASE = [
  ['Á = A', 0xC1, 65], ['É = E', 0xC9, 69], ['Ó = O', 0xD3, 79], ['Ú = U', 0xDA, 85],
  ['Ñ = N', 0xD1, 78], ['á = a', 0xE1, 97], ['é = e', 0xE9, 101], ['ó = o', 0xF3, 111],
  ['ú = u', 0xFA, 117], ['ü = u', 0xFC, 117], ['ñ = n', 0xF1, 110]
];
for (const [nombre, codigo, base] of IGUAL_A_SU_BASE) {
  comprobar(nombre, ANCHOS_HELVETICA[codigo] === ANCHOS_HELVETICA[base] &&
                    ANCHOS_HELVETICA_BOLD[codigo] === ANCHOS_HELVETICA_BOLD[base],
            ANCHOS_HELVETICA[codigo] + '/' + ANCHOS_HELVETICA_BOLD[codigo]);
}
comprobar('í (222+56) NO mide lo que la i en la regular',
          ANCHOS_HELVETICA[0xED] === 278 && ANCHOS_HELVETICA[105] === 222,
          'i=' + ANCHOS_HELVETICA[105] + ' i-acentuada=' + ANCHOS_HELVETICA[0xED]);
comprobar('í SI mide lo que la i en la negrita',
          ANCHOS_HELVETICA_BOLD[0xED] === ANCHOS_HELVETICA_BOLD[105],
          'i=' + ANCHOS_HELVETICA_BOLD[105] + ' i-acentuada=' + ANCHOS_HELVETICA_BOLD[0xED]);

// ── 8 · Las dos tablas son distintas, y el unico glifo que adelgaza es la @ ───
// Por si alguien copia la regular en las dos constantes: el motor pondria las
// cabeceras de tabla mal medidas y no se notaria hasta ver un PDF con una cabecera
// desbordada.
// La @ es la UNICA que mide menos en negrita, 1015 -> 975. No es una errata:
// comprobado contra /System/Library/Fonts/Helvetica.ttc y contra Arial, y las dos
// fuentes reales dicen 1015/975 y ningun otro codigo adelgaza. Si algun dia
// aparece un segundo codigo en esta lista, es que alguien toco un ancho a mano.
console.log('── la negrita es otra tabla ──');
let distintas = 0;
const masEstrecha = [];
for (let codigo = 0; codigo < 256; codigo++) {
  if (ANCHOS_HELVETICA[codigo] !== ANCHOS_HELVETICA_BOLD[codigo]) distintas++;
  if (ANCHOS_HELVETICA_BOLD[codigo] < ANCHOS_HELVETICA[codigo]) {
    masEstrecha.push(codigo + '(' + GLIFOS_WINANSI[codigo] + ')');
  }
}
comprobar('la negrita difiere de la regular en varios codigos', distintas > 50,
          distintas + ' codigos distintos');
comprobar('la @ es el unico glifo mas estrecho en negrita',
          masEstrecha.length === 1 && masEstrecha[0] === '64(at)',
          masEstrecha.join(' ') || 'ninguno');
comprobar('@ = 1015 regular / 975 negrita',
          ANCHOS_HELVETICA[64] === 1015 && ANCHOS_HELVETICA_BOLD[64] === 975,
          ANCHOS_HELVETICA[64] + '/' + ANCHOS_HELVETICA_BOLD[64]);

// ── 9 · Una medida de verdad, de punta a punta ────────────────────────────────
// La formula del §2 (ancho/1000*tamano) sobre una cadena real del informe, para
// que el numero se pueda comprobar a mano con una regla en el PDF.
console.log('── una medida completa, con la formula del §2 ──');
function anchoDeCadena(texto, tabla, tamano) {
  let milesimas = 0;
  for (let i = 0; i < texto.length; i++) {
    const codigo = texto.charCodeAt(i);
    milesimas += codigo < 256 ? tabla[codigo] : 0;
  }
  return milesimas / 1000 * tamano;
}
// 'Hammad' = H722 + a556 + m833 + m833 + a556 + d556 = 4056 milesimas.
const anchoHammad = anchoDeCadena('Hammad', ANCHOS_HELVETICA, 10.5);
comprobar("'Hammad' a 10.5 pt = 42.588 pt",
          Math.abs(anchoHammad - 42.588) < 1e-9, anchoHammad.toFixed(4) + ' pt');
// 'Situación fiscal' con acento, que es la cadena que rompe si la tabla no cubre
// Latin-1: 16 caracteres, y el ancho tiene que caber de sobra en el ancho util.
const anchoSituacion = anchoDeCadena('Situación fiscal', ANCHOS_HELVETICA_BOLD, 9.5);
comprobar("'Situación fiscal' en negrita a 9.5 pt cabe en 483.28 pt",
          anchoSituacion > 0 && anchoSituacion < 483.28, anchoSituacion.toFixed(4) + ' pt');

console.log('\n' + (total - mal) + ' de ' + total + ' casos pasan');
console.log(mal ? mal + ' FALLOS' : 'TODAS PASAN');
process.exit(mal ? 1 : 0);
