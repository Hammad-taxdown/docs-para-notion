// ── 14/08 · PIEZA 1 · Metrica de Helvetica y Helvetica-Bold ───────────────────
//
// PARA QUE ES: el motor del PDF (pieza 2, §3 del contrato) tiene que cortar las
// lineas por MEDIDA REAL, no por numero de caracteres. Para eso necesita saber
// cuanto mide cada glifo. Esta tabla es ese dato y nada mas: aqui no se dibuja,
// no se corta y no se sabe nada del informe.
//
// UNIDADES: milesimas de em (1/1000). El ancho en puntos es
//     ancho / 1000 * tamanoEnPuntos
// Ejemplo: la 'A' de Helvetica a 10.5 pt mide 667 / 1000 * 10.5 = 7.0035 pt.
//
// INDICE: el CODIGO DE BYTE de WinAnsiEncoding, 0..255, que es el mismo byte que
// el motor va a escribir dentro del PDF. Asi el motor mide exactamente lo que
// imprime, sin traducciones intermedias. Los 256 codigos estan cubiertos.
// Son Arrays de 256 posiciones: un Array es un objeto indexado por entero, que es
// lo que pide el §2 del contrato -- ANCHOS_HELVETICA[65] === 667.
//
// LOS CODIGOS SIN GLIFO VALEN 0, y son exactamente estos 38:
//   0..31 (los de control), 127, 129, 141, 143, 144 y 157.
// Un 0 aqui NO es "no lo se": es "en WinAnsiEncoding ese byte no imprime nada".
// El motor no debe emitir esos bytes (regla 4 del §3), pero si se le cuela, mide 0
// y no desplaza nada, que es el mismo criterio que aLatin1 del .030.
//
// ── DE DONDE SALEN LOS NUMEROS ────────────────────────────────────────────────
// Son los del estandar de las 14 fuentes base de PostScript / PDF (los AFM de
// Adobe para Helvetica y Helvetica-Bold), que es lo que exige el §2 del contrato.
// EN ESTA MAQUINA NO HAY NINGUN .afm: se busco en todo el disco y no hay
// ghostscript, ni texlive, ni fontforge, ni NimbusSans. Asi que los valores no se
// pudieron parsear de un AFM.
//
// LO QUE SI SE HIZO, para no dejarlos sin comprobar contra nada: se extrajeron los
// anchos reales de /System/Library/Fonts/Helvetica.ttc (Apple, upem 2048, caras
// "Helvetica" y "Helvetica Bold") leyendo sus tablas cmap y hmtx, y se escalaron a
// 1/1000. De los 218 codigos de WinAnsi que tienen glifo, 214 coinciden EXACTOS
// con esta tabla, en las dos fuentes. Las cuatro diferencias son estas, y en las
// cuatro manda el AFM porque el PDF va a declarar /Helvetica base-14 (sin fuente
// incrustada) y el visor mide con la metrica del estandar:
//
//   codigo  glifo       aqui (AFM)        Helvetica.ttc de Apple
//   0x80    Euro        556 / 556         744 / 744   <- el simbolo del euro se
//                                                        anadio a Helvetica en 1997
//                                                        y las versiones modernas lo
//                                                        dibujan mas ancho
//   0xB1    plusminus   584 / 584         549 / 549
//   0xB5    mu          556 / 611         576 / 576
//   0xF7    divide      584 / 584         549 / 549
//
// NINGUNO DE LOS CUATRO APARECE EN EL TEXTO DEL INFORME. Comprobado sobre
// docs/plantilla-informe-mobility-texto-2026-08-14.md: los unicos caracteres no
// ASCII de la plantilla son  o' n~ e' i' a' u' N~ E' U'  mas  – (endash),
// — (emdash) y · (periodcentered), y los diez estan en la tabla y coinciden con la
// fuente real. El salario se imprime SIN el simbolo € (§4.2 del contrato: '345.678'
// y la palabra 'euros' va escrita en la plantilla), asi que el 0x80 no se usa hoy.
// Si algun dia se imprime un €, la linea puede medir hasta 1.97 pt menos de lo que
// el visor dibuje a 10.5 pt. Queda dicho.
//
// PROHIBIDO aqui: require (salvo Buffer), import, disco y red. Este fichero acaba
// concatenado en el nodo de codigo de n8n. El module.exports del final es solo
// para poder probarlo con node.
//
// ── AVISO PARA QUIEN TOQUE ESTO ───────────────────────────────────────────────
// Las mayusculas acentuadas miden lo que su letra base ('Á' = 'A' = 667) y las
// minusculas acentuadas tambien ('é' = 'e' = 556), PERO LA 'i' ES LA EXCEPCION:
// 'i' mide 222 en Helvetica y 'í' mide 278, porque el glifo acentuado se construye
// sobre 'dotlessi', que es mas ancha que la 'i'. En Helvetica-Bold las dos miden
// 278. No es una errata: la Helvetica real de esta maquina dice lo mismo.
// ──────────────────────────────────────────────────────────────────────────────

// Nombre de glifo de cada codigo de byte de WinAnsiEncoding (Anexo D del PDF).
// null = ese byte no imprime nada. Esta tabla existe para que los anchos de abajo
// se puedan leer por NOMBRE y no por numero: '722 en el 209' no se puede auditar,
// 'Ntilde: 722' si.
const GLIFOS_WINANSI = new Array(256).fill(null);

// Coloca una tirada de nombres consecutivos. Revienta si pisa un codigo ya puesto:
// un solapamiento silencioso desplazaria media tabla y todas las lineas del PDF.
function _metricaTirada(desde, nombres) {
  const lista = nombres.trim().split(/\s+/);
  for (let i = 0; i < lista.length; i++) {
    const codigo = desde + i;
    if (codigo > 255) throw new Error('METRICA: la tirada que empieza en ' + desde + ' se sale de 255');
    if (GLIFOS_WINANSI[codigo] !== null) throw new Error('METRICA: codigo ' + codigo + ' asignado dos veces');
    GLIFOS_WINANSI[codigo] = lista[i];
  }
}

// 32..126 · el ASCII imprimible
_metricaTirada(32, `
  space exclam quotedbl numbersign dollar percent ampersand quotesingle
  parenleft parenright asterisk plus comma hyphen period slash
  zero one two three four five six seven eight nine
  colon semicolon less equal greater question at
  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
  bracketleft backslash bracketright asciicircum underscore grave
  a b c d e f g h i j k l m n o p q r s t u v w x y z
  braceleft bar braceright asciitilde
`);

// 128..159 · el bloque de Windows, que TIENE HUECOS: 129, 141, 143, 144 y 157 no
// existen en WinAnsiEncoding. Por eso van uno a uno y no en tirada.
GLIFOS_WINANSI[128] = 'Euro';           // €
GLIFOS_WINANSI[130] = 'quotesinglbase'; // ‚
GLIFOS_WINANSI[131] = 'florin';         // ƒ
GLIFOS_WINANSI[132] = 'quotedblbase';   // „
GLIFOS_WINANSI[133] = 'ellipsis';       // …
GLIFOS_WINANSI[134] = 'dagger';         // †
GLIFOS_WINANSI[135] = 'daggerdbl';      // ‡
GLIFOS_WINANSI[136] = 'circumflex';     // ˆ
GLIFOS_WINANSI[137] = 'perthousand';    // ‰
GLIFOS_WINANSI[138] = 'Scaron';         // Š
GLIFOS_WINANSI[139] = 'guilsinglleft';  // ‹
GLIFOS_WINANSI[140] = 'OE';             // Œ
GLIFOS_WINANSI[142] = 'Zcaron';         // Ž
GLIFOS_WINANSI[145] = 'quoteleft';      // ‘
GLIFOS_WINANSI[146] = 'quoteright';     // ’
GLIFOS_WINANSI[147] = 'quotedblleft';   // “
GLIFOS_WINANSI[148] = 'quotedblright';  // ”
GLIFOS_WINANSI[149] = 'bullet';         // •  <- la vineta de las listas del informe
GLIFOS_WINANSI[150] = 'endash';         // –  <- 20 veces en la plantilla
GLIFOS_WINANSI[151] = 'emdash';         // —  <- 6 veces en la plantilla
GLIFOS_WINANSI[152] = 'tilde';          // ˜
GLIFOS_WINANSI[153] = 'trademark';      // ™
GLIFOS_WINANSI[154] = 'scaron';         // š
GLIFOS_WINANSI[155] = 'guilsinglright'; // ›
GLIFOS_WINANSI[156] = 'oe';             // œ
GLIFOS_WINANSI[158] = 'zcaron';         // ž
GLIFOS_WINANSI[159] = 'Ydieresis';      // Ÿ

// 160..255 · Latin-1, sin huecos. El 160 es el espacio duro (mide como el espacio)
// y el 173 es el guion blando (mide como el guion). Aqui estan la Ñ (209), la ñ
// (241), las vocales acentuadas, la ü (252), la ç (231) y el º (186), que son los
// que este proyecto no puede perder.
_metricaTirada(160, `
  space exclamdown cent sterling currency yen brokenbar section
  dieresis copyright ordfeminine guillemotleft logicalnot hyphen registered macron
  degree plusminus twosuperior threesuperior acute mu paragraph periodcentered
  cedilla onesuperior ordmasculine guillemotright onequarter onehalf threequarters questiondown
  Agrave Aacute Acircumflex Atilde Adieresis Aring AE Ccedilla
  Egrave Eacute Ecircumflex Edieresis Igrave Iacute Icircumflex Idieresis
  Eth Ntilde Ograve Oacute Ocircumflex Otilde Odieresis multiply
  Oslash Ugrave Uacute Ucircumflex Udieresis Yacute Thorn germandbls
  agrave aacute acircumflex atilde adieresis aring ae ccedilla
  egrave eacute ecircumflex edieresis igrave iacute icircumflex idieresis
  eth ntilde ograve oacute ocircumflex otilde odieresis divide
  oslash ugrave uacute ucircumflex udieresis yacute thorn ydieresis
`);

// ── Anchos de Helvetica, por nombre de glifo (AFM de Adobe) ───────────────────
const _ANCHOS_GLIFO_HELVETICA = {
  space: 278, exclam: 278, quotedbl: 355, numbersign: 556, dollar: 556,
  percent: 889, ampersand: 667, quotesingle: 191, parenleft: 333, parenright: 333,
  asterisk: 389, plus: 584, comma: 278, hyphen: 333, period: 278, slash: 278,
  // Los diez digitos miden lo mismo, 556, y eso es lo que mantiene alineada una
  // columna de importes. Si alguien cambia uno solo, las tablas de numeros bailan.
  zero: 556, one: 556, two: 556, three: 556, four: 556,
  five: 556, six: 556, seven: 556, eight: 556, nine: 556,
  colon: 278, semicolon: 278, less: 584, equal: 584, greater: 584,
  question: 556, at: 1015,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278,
  J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  bracketleft: 278, backslash: 278, bracketright: 278, asciicircum: 469,
  underscore: 556, grave: 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222,
  j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333,
  s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  braceleft: 334, bar: 260, braceright: 334, asciitilde: 584,
  // Bloque de Windows (128..159)
  Euro: 556, quotesinglbase: 222, florin: 556, quotedblbase: 333, ellipsis: 1000,
  dagger: 556, daggerdbl: 556, circumflex: 333, perthousand: 1000, Scaron: 667,
  guilsinglleft: 333, OE: 1000, Zcaron: 611, quoteleft: 222, quoteright: 222,
  quotedblleft: 333, quotedblright: 333, bullet: 350, endash: 556, emdash: 1000,
  tilde: 333, trademark: 1000, scaron: 500, guilsinglright: 333, oe: 944,
  zcaron: 500, Ydieresis: 667,
  // Latin-1 (160..255)
  exclamdown: 333, cent: 556, sterling: 556, currency: 556, yen: 556,
  brokenbar: 260, section: 556, dieresis: 333, copyright: 737, ordfeminine: 370,
  guillemotleft: 556, logicalnot: 584, registered: 737, macron: 333, degree: 400,
  plusminus: 584, twosuperior: 333, threesuperior: 333, acute: 333, mu: 556,
  paragraph: 537, periodcentered: 278, cedilla: 333, onesuperior: 333,
  ordmasculine: 365, guillemotright: 556, onequarter: 834, onehalf: 834,
  threequarters: 834, questiondown: 611,
  // Las mayusculas acentuadas miden lo que su base: A=667, E=667, I=278, O=778,
  // U=722, y la Ntilde lo que la N, 722.
  Agrave: 667, Aacute: 667, Acircumflex: 667, Atilde: 667, Adieresis: 667,
  Aring: 667, AE: 1000, Ccedilla: 722,
  Egrave: 667, Eacute: 667, Ecircumflex: 667, Edieresis: 667,
  Igrave: 278, Iacute: 278, Icircumflex: 278, Idieresis: 278,
  Eth: 722, Ntilde: 722,
  Ograve: 778, Oacute: 778, Ocircumflex: 778, Otilde: 778, Odieresis: 778,
  multiply: 584, Oslash: 778,
  Ugrave: 722, Uacute: 722, Ucircumflex: 722, Udieresis: 722,
  Yacute: 667, Thorn: 667, germandbls: 611,
  agrave: 556, aacute: 556, acircumflex: 556, atilde: 556, adieresis: 556,
  aring: 556, ae: 889, ccedilla: 500,
  egrave: 556, eacute: 556, ecircumflex: 556, edieresis: 556,
  // Ojo: la 'i' mide 222 pero las acentuadas 278. Ver el aviso de la cabecera.
  igrave: 278, iacute: 278, icircumflex: 278, idieresis: 278,
  eth: 556, ntilde: 556,
  ograve: 556, oacute: 556, ocircumflex: 556, otilde: 556, odieresis: 556,
  divide: 584, oslash: 611,
  ugrave: 556, uacute: 556, ucircumflex: 556, udieresis: 556,
  yacute: 500, thorn: 556, ydieresis: 500
};

// ── Anchos de Helvetica-Bold, por nombre de glifo (AFM de Adobe) ──────────────
// No es la regular con un factor: la negrita cambia glifo a glifo. La 'A' pasa de
// 667 a 722 pero la 'W' se queda en 944, y la 'a' en 556. Copiar la regular y
// multiplicar por 1.05 seria un error de hasta 60 milesimas por caracter.
const _ANCHOS_GLIFO_HELVETICA_BOLD = {
  space: 278, exclam: 333, quotedbl: 474, numbersign: 556, dollar: 556,
  percent: 889, ampersand: 722, quotesingle: 238, parenleft: 333, parenright: 333,
  asterisk: 389, plus: 584, comma: 278, hyphen: 333, period: 278, slash: 278,
  // Igual que en la regular: los diez, 556. Las cabeceras de tabla van en negrita
  // y tienen que cuadrar con los numeros de debajo.
  zero: 556, one: 556, two: 556, three: 556, four: 556,
  five: 556, six: 556, seven: 556, eight: 556, nine: 556,
  colon: 333, semicolon: 333, less: 584, equal: 584, greater: 584,
  question: 611, at: 975,
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278,
  J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  bracketleft: 333, backslash: 278, bracketright: 333, asciicircum: 584,
  underscore: 556, grave: 333,
  a: 556, b: 611, c: 556, d: 611, e: 556, f: 333, g: 611, h: 611, i: 278,
  j: 278, k: 556, l: 278, m: 889, n: 611, o: 611, p: 611, q: 611, r: 389,
  s: 556, t: 333, u: 611, v: 556, w: 778, x: 556, y: 556, z: 500,
  braceleft: 389, bar: 280, braceright: 389, asciitilde: 584,
  // Bloque de Windows (128..159)
  Euro: 556, quotesinglbase: 278, florin: 556, quotedblbase: 500, ellipsis: 1000,
  dagger: 556, daggerdbl: 556, circumflex: 333, perthousand: 1000, Scaron: 667,
  guilsinglleft: 333, OE: 1000, Zcaron: 611, quoteleft: 278, quoteright: 278,
  quotedblleft: 500, quotedblright: 500, bullet: 350, endash: 556, emdash: 1000,
  tilde: 333, trademark: 1000, scaron: 556, guilsinglright: 333, oe: 944,
  zcaron: 500, Ydieresis: 667,
  // Latin-1 (160..255)
  exclamdown: 333, cent: 556, sterling: 556, currency: 556, yen: 556,
  brokenbar: 280, section: 556, dieresis: 333, copyright: 737, ordfeminine: 370,
  guillemotleft: 556, logicalnot: 584, registered: 737, macron: 333, degree: 400,
  plusminus: 584, twosuperior: 333, threesuperior: 333, acute: 333, mu: 611,
  paragraph: 556, periodcentered: 278, cedilla: 333, onesuperior: 333,
  ordmasculine: 365, guillemotright: 556, onequarter: 834, onehalf: 834,
  threequarters: 834, questiondown: 611,
  // En la negrita la base de la 'A' es 722, no 667: las acentuadas la siguen.
  Agrave: 722, Aacute: 722, Acircumflex: 722, Atilde: 722, Adieresis: 722,
  Aring: 722, AE: 1000, Ccedilla: 722,
  Egrave: 667, Eacute: 667, Ecircumflex: 667, Edieresis: 667,
  Igrave: 278, Iacute: 278, Icircumflex: 278, Idieresis: 278,
  Eth: 722, Ntilde: 722,
  Ograve: 778, Oacute: 778, Ocircumflex: 778, Otilde: 778, Odieresis: 778,
  multiply: 584, Oslash: 778,
  Ugrave: 722, Uacute: 722, Ucircumflex: 722, Udieresis: 722,
  Yacute: 667, Thorn: 667, germandbls: 611,
  agrave: 556, aacute: 556, acircumflex: 556, atilde: 556, adieresis: 556,
  aring: 556, ae: 889, ccedilla: 556,
  egrave: 556, eacute: 556, ecircumflex: 556, edieresis: 556,
  igrave: 278, iacute: 278, icircumflex: 278, idieresis: 278,
  eth: 611, ntilde: 611,
  ograve: 611, oacute: 611, ocircumflex: 611, otilde: 611, odieresis: 611,
  divide: 584, oslash: 611,
  ugrave: 611, uacute: 611, ucircumflex: 611, udieresis: 611,
  yacute: 556, thorn: 611, ydieresis: 556
};

// Pasa de "ancho por nombre de glifo" a "ancho por codigo de byte", que es lo que
// consume el motor. Revienta si un glifo de la codificacion no tiene ancho: un
// undefined ahi se propagaria como NaN por todas las medidas y el PDF saldria con
// las lineas cortadas al azar. Es preferible que no arranque.
function _metricaPorCodigo(anchosPorGlifo, nombreFuente) {
  const tabla = new Array(256).fill(0);
  for (let codigo = 0; codigo < 256; codigo++) {
    const glifo = GLIFOS_WINANSI[codigo];
    if (glifo === null) continue;                 // sin glifo -> 0, a proposito
    const ancho = anchosPorGlifo[glifo];
    if (typeof ancho !== 'number' || !isFinite(ancho)) {
      throw new Error('METRICA: falta el ancho de "' + glifo + '" (codigo ' + codigo +
                      ') en ' + nombreFuente);
    }
    tabla[codigo] = ancho;
  }
  return tabla;
}

const ANCHOS_HELVETICA      = _metricaPorCodigo(_ANCHOS_GLIFO_HELVETICA, 'Helvetica');
const ANCHOS_HELVETICA_BOLD = _metricaPorCodigo(_ANCHOS_GLIFO_HELVETICA_BOLD, 'Helvetica-Bold');

if (typeof module !== 'undefined') {
  module.exports = {
    ANCHOS_HELVETICA,
    ANCHOS_HELVETICA_BOLD,
    // GLIFOS_WINANSI no lo pide el §2, pero la prueba lo necesita para decir QUE
    // codigo falla en vez de solo su numero.
    GLIFOS_WINANSI
  };
}
