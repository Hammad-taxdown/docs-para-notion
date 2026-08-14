// ── 14/08 · PIEZA 1b · Metrica de Times-Roman y Times-Bold ────────────────────
//
// PARA QUE ES: el §9.1 del contrato cambia la tipografia del informe de Helvetica
// a Times, porque un documento fiscal se lee mejor con serifa. Times-Roman y
// Times-Bold son dos de las 14 fuentes base del PDF igual que Helvetica, asi que
// NO SE INCRUSTA NADA: lo unico que hace falta es su tabla de anchos, que es este
// fichero. Aqui no se dibuja, no se corta y no se sabe nada del informe.
//
// UNIDADES: milesimas de em (1/1000). El ancho en puntos es
//     ancho / 1000 * tamanoEnPuntos
// Ejemplo: la 'A' de Times a 11 pt mide 722 / 1000 * 11 = 7.942 pt.
//
// INDICE: el CODIGO DE BYTE de WinAnsiEncoding, 0..255, que es el mismo byte que
// el motor va a escribir dentro del PDF. Asi el motor mide exactamente lo que
// imprime, sin traducciones intermedias. Los 256 codigos estan cubiertos.
// Son Arrays de 256 posiciones: un Array es un objeto indexado por entero, que es
// lo que pide el §2 del contrato -- ANCHOS_TIMES[65] === 722.
//
// LOS CODIGOS SIN GLIFO VALEN 0, y son exactamente estos 38:
//   0..31 (los de control), 127, 129, 141, 143, 144 y 157.
// Un 0 aqui NO es "no lo se": es "en WinAnsiEncoding ese byte no imprime nada".
// El motor no debe emitir esos bytes (regla 4 del §3), pero si se le cuela, mide 0
// y no desplaza nada, que es el mismo criterio que aLatin1 del .030.
//
// ── ESTO NO ES LA TABLA DE HELVETICA CON OTRO NOMBRE ──────────────────────────
// Times es una fuente MAS ESTRECHA y de anchos mucho mas variados. Ninguno de los
// numeros de la pieza de Helvetica sirve aqui:
//     espacio 250 y no 278 · digitos 500 y no 556 · 'a' 444 y no 556
//     'W' 944/1000 y no 944/944  ·  'A' 722/722 y no 667/722
// Por eso el motor tiene que elegir la tabla junto con el /BaseFont y en UN SOLO
// SITIO (§9.1): declarar /Times-Roman y medir con los anchos de Helvetica daria un
// PDF que abre, se lee y tiene TODOS los cortes de linea mal. No falla: miente.
//
// ── DE DONDE SALEN LOS NUMEROS ────────────────────────────────────────────────
// Son los del estandar de las 14 fuentes base de PostScript / PDF (los AFM de
// Adobe para Times-Roman y Times-Bold), que es lo que exige el §2 del contrato.
// EN ESTA MAQUINA NO HAY NINGUN .afm (ya se busco para la pieza de Helvetica: no
// hay ghostscript, ni texlive, ni fontforge, ni NimbusRoman), asi que los valores
// no se pudieron parsear de un AFM.
//
// LO QUE SI SE HIZO, para no dejarlos sin comprobar contra nada: se extrajeron los
// anchos reales de /System/Library/Fonts/Times.ttc (Apple, upem 2048, caras que se
// llaman literalmente "Times-Roman" y "Times-Bold") leyendo sus tablas cmap y
// hmtx, y se escalaron a 1/1000. De los 218 codigos de WinAnsi que tienen glifo,
// 214 coinciden EXACTOS con esta tabla, en las dos fuentes. Las cuatro diferencias
// son estas, y en las cuatro manda el AFM porque el PDF va a declarar /Times-Roman
// base-14 (sin fuente incrustada) y el visor mide con la metrica del estandar:
//
//   codigo  glifo       aqui (AFM)        Times.ttc de Apple
//   0x80    Euro        500 / 500         744 / 744   <- el simbolo del euro se
//                                                        anadio en 1997; el AFM le
//                                                        dio el ancho del digito
//                                                        (500) y Apple lo dibuja
//                                                        mucho mas ancho
//   0xB1    plusminus   564 / 570         549 / 549
//   0xB5    mu          500 / 556         576 / 576
//   0xF7    divide      564 / 570         549 / 549
//
// SON LOS MISMOS CUATRO CODIGOS QUE DIVERGEN EN HELVETICA, y por la misma razon:
// en el AFM de Adobe ±, ÷ y × son glifos de ancho "matematico" (564 en la regular
// y 570 en la negrita, igual que + - = < >), mientras que Apple los trae de su
// juego de simbolos con otro ancho. Ojo al detalle que lo confirma: el × (0xD7)
// SI coincide, 564/570 en las dos fuentes, porque ahi Apple uso el mismo criterio.
//
// NINGUNO DE LOS CUATRO APARECE EN EL TEXTO DEL INFORME. Comprobado sobre
// docs/plantilla-informe-mobility-texto-2026-08-14.md: los unicos caracteres no
// ASCII de la plantilla son  o' n~ e' i' a' u' N~ E' U'  mas  – (endash),
// — (emdash) y · (periodcentered), y los doce estan en la tabla y coinciden con la
// fuente real. El salario se imprime SIN el simbolo € (§4.2 del contrato:
// '345.678' y la palabra 'euros' va escrita en la plantilla), asi que el 0x80 no
// se usa hoy. Si algun dia se imprime un €, la linea puede medir hasta 2.68 pt
// menos de lo que el visor dibuje a 11 pt. Queda dicho.
//
// PROHIBIDO aqui: require (salvo Buffer), import, disco y red. Este fichero acaba
// concatenado en el nodo de codigo de n8n. El module.exports del final es solo
// para poder probarlo con node.
//
// ── AVISO PARA QUIEN TOQUE ESTO ───────────────────────────────────────────────
// 1) EN TIMES LA 'i' NO ES LA EXCEPCION QUE ES EN HELVETICA. Alli 'i' mide 222 y
//    'í' 278; aqui las dos miden 278 en las dos fuentes, porque la 'i' de Times ya
//    es tan ancha como su 'dotlessi'. Quien venga de la pieza de Helvetica no debe
//    "arreglar" esto.
// 2) LA NEGRITA DE TIMES NO ES SIEMPRE MAS ANCHA. Cinco glifos ADELGAZAN al pasar
//    a negrita: { } ~ © ®. Y la @, que en Helvetica es la unica que adelgaza
//    (1015 -> 975), aqui ENGORDA (921 -> 930). Comprobado contra la Times real del
//    sistema, que dice exactamente lo mismo. No son erratas.
// 3) ESTA TABLA SE APARTA DEL §9.1 DEL CONTRATO EN UN VALOR, A PROPOSITO. El §9.1
//    da la 'é' como 444 / 500; aqui es 444 / 444, porque en Times-Bold la 'e' mide
//    444 y toda minuscula acentuada mide lo que su base. El 500 del contrato es la
//    negrita de la 'a' (444/500) copiada una fila mas abajo. Lo confirma la Times
//    del sistema: codigo 233 = 444/444. El razonamiento entero, con las dos pruebas
//    independientes, esta en el §1b de docs/test-metrica-times.js. HAY QUE CORREGIR
//    LA FILA DEL CONTRATO, no esta tabla: la 'é' sale 16 veces en la plantilla.
// ──────────────────────────────────────────────────────────────────────────────

// Nombre de glifo de cada codigo de byte de WinAnsiEncoding (Anexo D del PDF).
// null = ese byte no imprime nada. Esta tabla existe para que los anchos de abajo
// se puedan leer por NOMBRE y no por numero: '722 en el 209' no se puede auditar,
// 'Ntilde: 722' si.
//
// POR QUE LLEVA EL SUFIJO _TIMES aunque la codificacion no dependa de la fuente:
// las piezas se concatenan TODAS EN EL MISMO AMBITO dentro del nodo de n8n. Si
// esta pieza y la de Helvetica llegan a convivir un dia (una migracion a medias,
// una vuelta atras), dos `const GLIFOS_WINANSI` en el mismo ambito son un
// SyntaxError y el nodo entero no arranca. Un nombre propio cuesta nada.
const GLIFOS_WINANSI_TIMES = new Array(256).fill(null);

// Coloca una tirada de nombres consecutivos. Revienta si pisa un codigo ya puesto:
// un solapamiento silencioso desplazaria media tabla y todas las lineas del PDF.
function _metricaTiradaTimes(desde, nombres) {
  const lista = nombres.trim().split(/\s+/);
  for (let i = 0; i < lista.length; i++) {
    const codigo = desde + i;
    if (codigo > 255) throw new Error('METRICA TIMES: la tirada que empieza en ' + desde + ' se sale de 255');
    if (GLIFOS_WINANSI_TIMES[codigo] !== null) throw new Error('METRICA TIMES: codigo ' + codigo + ' asignado dos veces');
    GLIFOS_WINANSI_TIMES[codigo] = lista[i];
  }
}

// 32..126 · el ASCII imprimible
_metricaTiradaTimes(32, `
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
GLIFOS_WINANSI_TIMES[128] = 'Euro';           // €
GLIFOS_WINANSI_TIMES[130] = 'quotesinglbase'; // ‚
GLIFOS_WINANSI_TIMES[131] = 'florin';         // ƒ
GLIFOS_WINANSI_TIMES[132] = 'quotedblbase';   // „
GLIFOS_WINANSI_TIMES[133] = 'ellipsis';       // …
GLIFOS_WINANSI_TIMES[134] = 'dagger';         // †
GLIFOS_WINANSI_TIMES[135] = 'daggerdbl';      // ‡
GLIFOS_WINANSI_TIMES[136] = 'circumflex';     // ˆ
GLIFOS_WINANSI_TIMES[137] = 'perthousand';    // ‰
GLIFOS_WINANSI_TIMES[138] = 'Scaron';         // Š
GLIFOS_WINANSI_TIMES[139] = 'guilsinglleft';  // ‹
GLIFOS_WINANSI_TIMES[140] = 'OE';             // Œ
GLIFOS_WINANSI_TIMES[142] = 'Zcaron';         // Ž
GLIFOS_WINANSI_TIMES[145] = 'quoteleft';      // ‘
GLIFOS_WINANSI_TIMES[146] = 'quoteright';     // ’
GLIFOS_WINANSI_TIMES[147] = 'quotedblleft';   // “
GLIFOS_WINANSI_TIMES[148] = 'quotedblright';  // ”
GLIFOS_WINANSI_TIMES[149] = 'bullet';         // •  <- la vineta de las listas del informe
GLIFOS_WINANSI_TIMES[150] = 'endash';         // –  <- 20 veces en la plantilla
GLIFOS_WINANSI_TIMES[151] = 'emdash';         // —  <- 6 veces en la plantilla
GLIFOS_WINANSI_TIMES[152] = 'tilde';          // ˜
GLIFOS_WINANSI_TIMES[153] = 'trademark';      // ™
GLIFOS_WINANSI_TIMES[154] = 'scaron';         // š
GLIFOS_WINANSI_TIMES[155] = 'guilsinglright'; // ›
GLIFOS_WINANSI_TIMES[156] = 'oe';             // œ
GLIFOS_WINANSI_TIMES[158] = 'zcaron';         // ž
GLIFOS_WINANSI_TIMES[159] = 'Ydieresis';      // Ÿ

// 160..255 · Latin-1, sin huecos. El 160 es el espacio duro (mide como el espacio)
// y el 173 es el guion blando (mide como el guion). Aqui estan la Ñ (209), la ñ
// (241), las vocales acentuadas, la ü (252), la ç (231) y el º (186), que son los
// que este proyecto no puede perder.
_metricaTiradaTimes(160, `
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

// ── Anchos de Times-Roman, por nombre de glifo (AFM de Adobe) ─────────────────
const _ANCHOS_GLIFO_TIMES = {
  space: 250, exclam: 333, quotedbl: 408, numbersign: 500, dollar: 500,
  percent: 833, ampersand: 778, quotesingle: 180, parenleft: 333, parenright: 333,
  asterisk: 500, plus: 564, comma: 250, hyphen: 333, period: 250, slash: 278,
  // Los diez digitos miden lo mismo, 500, y eso es lo que mantiene alineada una
  // columna de importes. Si alguien cambia uno solo, las tablas de numeros bailan.
  // En Times el digito mide 500 y no 556: media milesima de em menos por cifra,
  // que en un importe de siete caracteres son 0.4 pt a 11 pt.
  zero: 500, one: 500, two: 500, three: 500, four: 500,
  five: 500, six: 500, seven: 500, eight: 500, nine: 500,
  // Ojo: en Times los dos puntos y el punto y coma miden 278 en la regular pero
  // 333 en la negrita. Salen en cada etiqueta de campo del informe ('Nombre: ').
  colon: 278, semicolon: 278, less: 564, equal: 564, greater: 564,
  question: 444, at: 921,
  A: 722, B: 667, C: 667, D: 722, E: 611, F: 556, G: 722, H: 722, I: 333,
  J: 389, K: 722, L: 611, M: 889, N: 722, O: 722, P: 556, Q: 722, R: 667,
  S: 556, T: 611, U: 722, V: 722, W: 944, X: 722, Y: 722, Z: 611,
  bracketleft: 333, backslash: 278, bracketright: 333, asciicircum: 469,
  underscore: 500, grave: 333,
  a: 444, b: 500, c: 444, d: 500, e: 444, f: 333, g: 500, h: 500, i: 278,
  j: 278, k: 500, l: 278, m: 778, n: 500, o: 500, p: 500, q: 500, r: 333,
  s: 389, t: 278, u: 500, v: 500, w: 722, x: 500, y: 500, z: 444,
  braceleft: 480, bar: 200, braceright: 480, asciitilde: 541,
  // Bloque de Windows (128..159)
  Euro: 500, quotesinglbase: 333, florin: 500, quotedblbase: 444, ellipsis: 1000,
  dagger: 500, daggerdbl: 500, circumflex: 333, perthousand: 1000, Scaron: 556,
  guilsinglleft: 333, OE: 889, Zcaron: 611, quoteleft: 333, quoteright: 333,
  quotedblleft: 444, quotedblright: 444, bullet: 350, endash: 500, emdash: 1000,
  tilde: 333, trademark: 980, scaron: 389, guilsinglright: 333, oe: 722,
  zcaron: 444, Ydieresis: 722,
  // Latin-1 (160..255)
  exclamdown: 333, cent: 500, sterling: 500, currency: 500, yen: 500,
  brokenbar: 200, section: 500, dieresis: 333, copyright: 760, ordfeminine: 276,
  guillemotleft: 500, logicalnot: 564, registered: 760, macron: 333, degree: 400,
  plusminus: 564, twosuperior: 300, threesuperior: 300, acute: 333, mu: 500,
  paragraph: 453, periodcentered: 250, cedilla: 333, onesuperior: 300,
  ordmasculine: 310, guillemotright: 500, onequarter: 750, onehalf: 750,
  threequarters: 750, questiondown: 444,
  // Las mayusculas acentuadas miden lo que su base: A=722, E=611, I=333, O=722,
  // U=722, y la Ntilde lo que la N, 722. Ojo con la I de Times: 333, no 278 como
  // en Helvetica, porque lleva remates arriba y abajo.
  Agrave: 722, Aacute: 722, Acircumflex: 722, Atilde: 722, Adieresis: 722,
  Aring: 722, AE: 889, Ccedilla: 667,
  Egrave: 611, Eacute: 611, Ecircumflex: 611, Edieresis: 611,
  Igrave: 333, Iacute: 333, Icircumflex: 333, Idieresis: 333,
  Eth: 722, Ntilde: 722,
  Ograve: 722, Oacute: 722, Ocircumflex: 722, Otilde: 722, Odieresis: 722,
  multiply: 564, Oslash: 722,
  Ugrave: 722, Uacute: 722, Ucircumflex: 722, Udieresis: 722,
  Yacute: 722, Thorn: 556, germandbls: 500,
  agrave: 444, aacute: 444, acircumflex: 444, atilde: 444, adieresis: 444,
  aring: 444, ae: 667, ccedilla: 444,
  egrave: 444, eacute: 444, ecircumflex: 444, edieresis: 444,
  // A diferencia de Helvetica, aqui la 'i' y las 'i' acentuadas miden LO MISMO,
  // 278. Ver el aviso 1 de la cabecera antes de "corregirlo".
  igrave: 278, iacute: 278, icircumflex: 278, idieresis: 278,
  eth: 500, ntilde: 500,
  ograve: 500, oacute: 500, ocircumflex: 500, otilde: 500, odieresis: 500,
  divide: 564, oslash: 500,
  ugrave: 500, uacute: 500, ucircumflex: 500, udieresis: 500,
  yacute: 500, thorn: 500, ydieresis: 500
};

// ── Anchos de Times-Bold, por nombre de glifo (AFM de Adobe) ──────────────────
// No es la regular con un factor: la negrita cambia glifo a glifo, y en Times mas
// que en Helvetica. La 'A' se queda en 722 pero la 'W' pasa de 944 a 1000, la 'a'
// de 444 a 500 y la 'c' NO se mueve (444). Y hay cinco que ADELGAZAN: { } ~ © ®.
// Copiar la regular y multiplicar por un factor seria un error de hasta 167
// milesimas por caracter (el % pasa de 833 a 1000).
const _ANCHOS_GLIFO_TIMES_BOLD = {
  space: 250, exclam: 333, quotedbl: 555, numbersign: 500, dollar: 500,
  percent: 1000, ampersand: 833, quotesingle: 278, parenleft: 333, parenright: 333,
  asterisk: 500, plus: 570, comma: 250, hyphen: 333, period: 250, slash: 278,
  // Igual que en la regular: los diez, 500. Las cabeceras de tabla van en negrita
  // y tienen que cuadrar con los numeros de debajo.
  zero: 500, one: 500, two: 500, three: 500, four: 500,
  five: 500, six: 500, seven: 500, eight: 500, nine: 500,
  colon: 333, semicolon: 333, less: 570, equal: 570, greater: 570,
  question: 500, at: 930,
  A: 722, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 778, I: 389,
  J: 500, K: 778, L: 667, M: 944, N: 722, O: 778, P: 611, Q: 778, R: 722,
  S: 556, T: 667, U: 722, V: 722, W: 1000, X: 722, Y: 722, Z: 667,
  bracketleft: 333, backslash: 278, bracketright: 333, asciicircum: 581,
  underscore: 500, grave: 333,
  a: 500, b: 556, c: 444, d: 556, e: 444, f: 333, g: 500, h: 556, i: 278,
  j: 333, k: 556, l: 278, m: 833, n: 556, o: 500, p: 556, q: 556, r: 444,
  s: 389, t: 333, u: 556, v: 500, w: 722, x: 500, y: 500, z: 444,
  braceleft: 394, bar: 220, braceright: 394, asciitilde: 520,
  // Bloque de Windows (128..159)
  Euro: 500, quotesinglbase: 333, florin: 500, quotedblbase: 500, ellipsis: 1000,
  dagger: 500, daggerdbl: 500, circumflex: 333, perthousand: 1000, Scaron: 556,
  guilsinglleft: 333, OE: 1000, Zcaron: 667, quoteleft: 333, quoteright: 333,
  quotedblleft: 500, quotedblright: 500, bullet: 350, endash: 500, emdash: 1000,
  tilde: 333, trademark: 1000, scaron: 389, guilsinglright: 333, oe: 722,
  zcaron: 444, Ydieresis: 722,
  // Latin-1 (160..255)
  exclamdown: 333, cent: 500, sterling: 500, currency: 500, yen: 500,
  brokenbar: 220, section: 500, dieresis: 333, copyright: 747, ordfeminine: 300,
  guillemotleft: 500, logicalnot: 570, registered: 747, macron: 333, degree: 400,
  plusminus: 570, twosuperior: 300, threesuperior: 300, acute: 333, mu: 556,
  paragraph: 540, periodcentered: 250, cedilla: 333, onesuperior: 300,
  ordmasculine: 330, guillemotright: 500, onequarter: 750, onehalf: 750,
  threequarters: 750, questiondown: 500,
  // En la negrita la base de la 'A' sigue siendo 722, pero la 'E' pasa a 667, la
  // 'I' a 389 y la 'O' a 778: las acentuadas las siguen una por una.
  Agrave: 722, Aacute: 722, Acircumflex: 722, Atilde: 722, Adieresis: 722,
  Aring: 722, AE: 1000, Ccedilla: 722,
  Egrave: 667, Eacute: 667, Ecircumflex: 667, Edieresis: 667,
  Igrave: 389, Iacute: 389, Icircumflex: 389, Idieresis: 389,
  Eth: 722, Ntilde: 722,
  Ograve: 778, Oacute: 778, Ocircumflex: 778, Otilde: 778, Odieresis: 778,
  multiply: 570, Oslash: 778,
  Ugrave: 722, Uacute: 722, Ucircumflex: 722, Udieresis: 722,
  Yacute: 722, Thorn: 611, germandbls: 556,
  agrave: 500, aacute: 500, acircumflex: 500, atilde: 500, adieresis: 500,
  aring: 500, ae: 722, ccedilla: 444,
  egrave: 444, eacute: 444, ecircumflex: 444, edieresis: 444,
  igrave: 278, iacute: 278, icircumflex: 278, idieresis: 278,
  // Ojo: en la negrita la 'o' mide 500 pero la 'n' 556, asi que la ntilde es 556
  // y la otilde 500. No se puede razonar "todas las de Latin-1 miden 500".
  eth: 500, ntilde: 556,
  ograve: 500, oacute: 500, ocircumflex: 500, otilde: 500, odieresis: 500,
  divide: 570, oslash: 500,
  ugrave: 556, uacute: 556, ucircumflex: 556, udieresis: 556,
  yacute: 500, thorn: 556, ydieresis: 500
};

// Pasa de "ancho por nombre de glifo" a "ancho por codigo de byte", que es lo que
// consume el motor. Revienta si un glifo de la codificacion no tiene ancho: un
// undefined ahi se propagaria como NaN por todas las medidas y el PDF saldria con
// las lineas cortadas al azar. Es preferible que no arranque.
function _metricaPorCodigoTimes(anchosPorGlifo, nombreFuente) {
  const tabla = new Array(256).fill(0);
  for (let codigo = 0; codigo < 256; codigo++) {
    const glifo = GLIFOS_WINANSI_TIMES[codigo];
    if (glifo === null) continue;                 // sin glifo -> 0, a proposito
    const ancho = anchosPorGlifo[glifo];
    if (typeof ancho !== 'number' || !isFinite(ancho)) {
      throw new Error('METRICA TIMES: falta el ancho de "' + glifo + '" (codigo ' + codigo +
                      ') en ' + nombreFuente);
    }
    tabla[codigo] = ancho;
  }
  return tabla;
}

const ANCHOS_TIMES      = _metricaPorCodigoTimes(_ANCHOS_GLIFO_TIMES, 'Times-Roman');
const ANCHOS_TIMES_BOLD = _metricaPorCodigoTimes(_ANCHOS_GLIFO_TIMES_BOLD, 'Times-Bold');

if (typeof module !== 'undefined') { module.exports = { ANCHOS_TIMES, ANCHOS_TIMES_BOLD, GLIFOS_WINANSI_TIMES }; }
