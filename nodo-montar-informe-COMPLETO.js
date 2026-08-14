// ============================================================================
// NODO 'Montar el informe' de beckham_informe_mobility · GENERADO, NO SE EDITA
// ============================================================================
// Generado por docs/montar-nodo-informe.sh a partir de las seis piezas.
// SI HAY QUE CAMBIAR ALGO, se toca la pieza y se vuelve a lanzar el script.
// Editar este fichero a mano hace que las piezas y el nodo se separen en silencio,
// que es exactamente lo que paso con el nodo del .030 el 14/08.
//
// Contrato de montaje: docs/contrato-informe-mobility-2026-08-14.md
// Los 17 marcadores:   docs/spec-informe-mobility-2026-08-13.md
// Texto de plantilla:  docs/plantilla-informe-mobility-texto-2026-08-14.md
// ============================================================================


// ==================== logo-taxdown-2026-08-14.js ====================
// ── 14/08 · PIEZA 0 · El logo de TaxDown para la cabecera del informe ────────
//
// QUE ES: el logo, en JPEG BASELINE, metido aqui en base64. Se dibuja en la
// cabecera del informe como un XObject de imagen del PDF.
//
// POR QUE JPEG Y NO EL WEBP ORIGINAL, ni un PNG:
//   - El original es imagen_logo_taxdown.webp, 1920x379, VP8 lossy y SIN CANAL
//     ALFA. Un PDF no sabe leer WebP, asi que hay que convertirlo de todas formas.
//   - Un JPEG BASELINE se mete en un PDF con /Filter /DCTDecode Y NADA MAS: el
//     flujo son los bytes del JPEG TAL CUAL, sin comprimir, sin predictor y sin
//     descomprimir nada. Es el unico camino que no necesita libreria, y en el nodo
//     de n8n no hay ninguna.
//   - UN PNG NO SERVIRIA: su IDAT va en deflate y para separar el canal alfa
//     habria que INFLARLO, o sea zlib, o sea una libreria. Y con transparencia
//     haria falta ademas un /SMask, que es otro flujo comprimido. Por eso el
//     original SIN ALFA es una suerte y hay que aprovecharla.
//   - Progresivo NO VALE: /DCTDecode solo lee baseline. Comprobado que el fichero
//     es SOF0 (baseline) leyendo sus marcadores, no fiandose de la extension.
//
// COMO SE REGENERA si cambia el logo (macOS, sin instalar nada):
//   sips -s format jpeg -s formatOptions 85 -Z 400 imagen_logo_taxdown.webp --out /tmp/logo.jpg
//   y luego se vuelca en base64 aqui, junto con el ancho y el alto REALES del
//   JPEG resultante. Si el ancho y el alto no cuadran con la imagen, el PDF sale
//   con el logo estirado y NO da ningun error.
//
// TAMANO: 400x79 pixeles, 12.183 bytes de JPEG, 16244 caracteres de base64. A 400
// pixeles hay resolucion de sobra para imprimirlo a 150 pt de ancho (unos 5 cm).

const LOGO_ANCHO_PX = 400;
const LOGO_ALTO_PX = 79;
// Ancho con el que se dibuja en el PDF, en puntos. El alto se calcula solo para
// no deformarlo NUNCA: alto = ancho * LOGO_ALTO_PX / LOGO_ANCHO_PX.
const LOGO_ANCHO_PT = 132;

const LOGO_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQA' +
  'AAABAAABkKADAAQAAAABAAAATwAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmA' +
  'CZjs+EJ+/8AAEQgATwGQAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQE' +
  'AAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldY' +
  'WVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk' +
  '5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMR' +
  'BAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdo' +
  'aWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz' +
  '9PX29/j5+v/bAEMAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBgQEBAQEBgcGBgYGBgYHBwcHBwcHBwgICAgICAkJCQkJCwsLCwsLCwsL' +
  'C//bAEMBAgICAwMDBQMDBQsIBggLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLC//dAAQA' +
  'Gf/aAAwDAQACEQMRAD8A/u8+Inj3wV8K/CF5468c3UVhptgm+WV/0VR1ZmPCqOSa/Da0/wCCpXi9vjw3ia901f8AhBHxbDTAi/aE' +
  'iB/4+N/ebuUzt2/L1+avFf8AgoR8W/jZ4z+MFx4I+J1nJoml6Q27TtOV98ToeBcbxgSs4/iHC/dABzn4EHK/NScrOyP4t8U/G/Nl' +
  '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';

// ==================== metrica-helvetica-2026-08-14.js ====================
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

// ==================== metrica-times-2026-08-14.js ====================
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

// ==================== pdf-motor-2026-08-14.js ====================
// ── 14/08 · PIEZA 2 · Motor del PDF ──────────────────────────────────────────
//
// QUE ES: el §3 del contrato (docs/contrato-informe-mobility-2026-08-14.md).
// Recibe el IR del §1 -- un array plano de elementos -- y devuelve los bytes de
// un PDF. Y NADA MAS: este fichero no sabe que existe un informe Mobility, ni
// quien es el cliente, ni que es un bloque A. Si aqui aparece la palabra
// "Beckham" alguien ha cruzado la frontera del §0.
//
//     construirPdf(elementos, opciones) -> { bytes: Buffer, paginas: number }
//
// LAS CUATRO COSAS QUE HACEN QUE ESTO SEA DELICADO, y por que se resuelven asi:
//
//  1. LOS OFFSETS DE LA XREF SON POSICIONES EN BYTES, NO EN CARACTERES.
//     El contenido lleva bytes > 127 (WinAnsi: la N con virgulilla es 0xD1) y la
//     cabecera lleva el comentario binario de cuatro bytes altos. Un
//     `string.length` daria un numero distinto del real en cuanto haya un acento,
//     y el PDF no abriria. Por eso todo el ensamblado final se hace sobre Buffers
//     y el offset de cada objeto se toma del acumulado de BYTES ya escritos.
//     Ver §7 de este fichero: hay un solo contador y cuenta bytes.
//
//  2. UN BYTE POR CARACTER, SIEMPRE.
//     El texto se pasa a WinAnsi con aWinAnsi(), que devuelve Buffer. El paso
//     intermedio por un string 'latin1' es 1 byte <-> 1 caracter EXACTO, asi que
//     el escapado trabaja sobre los bytes finales y no puede correr nada. Nunca
//     se hace Buffer.from(texto) a secas: eso seria UTF-8 y dos bytes por acento.
//
//  3. LA MEDIDA SE HACE SOBRE LOS BYTES QUE SE VAN A IMPRIMIR.
//     anchoTexto() no mide el string de entrada: mide el Buffer que sale de
//     aWinAnsi(). Asi lo que se mide y lo que se dibuja son lo mismo, incluso
//     cuando un caracter se cae por no caber en WinAnsi. Es la regla que pide la
//     cabecera de la pieza 1.
//
//  4. LOS FLUJOS VAN SIN COMPRIMIR (§3: nada de zlib) y con /Length en BYTES.
//
// TODO EL CODIGO DE ESTE FICHERO ES ASCII PURO. Los caracteres no ASCII que
// necesita (la vineta, el guion largo, los cuatro bytes altos de la cabecera)
// se construyen con String.fromCharCode a partir de su punto de codigo, NUNCA
// escritos sueltos dentro de una cadena. Motivo concreto: este fichero se pega
// en un nodo de n8n por el portapapeles y viaja entre editores; los 27
// caracteres del tramo 0x80..0x9F de WinAnsi son justo los que se destrozan en
// ese viaje. Con fromCharCode(0x2014) no hay portapapeles que lo cambie. En los
// COMENTARIOS si van escritos, porque un comentario roto no rompe nada.
//
// PROHIBIDO aqui: require (salvo Buffer, que en el nodo de n8n es global),
// import, librerias, disco y red. El module.exports de la ultima linea es lo
// unico que depende de node, y esta en UNA SOLA LINEA a proposito:
// montar-nodo-informe.sh lo borra con un grep de linea entera, y si el bloque
// ocupara varias lineas el fichero generado se quedaria con los nombres
// exportados sueltos y no compilaria.
//
// DEPENDE DE LA PIEZA DE METRICA: ANCHOS_TIMES y ANCHOS_TIMES_BOLD desde el §9.1,
// y ANCHOS_HELVETICA / ANCHOS_HELVETICA_BOLD como respaldo. En el nodo llegan por
// ambito (las piezas de metrica van concatenadas delante). Al probar con node las
// deja la prueba en el ambito del vm. Se resuelven EN EL MOMENTO DE USARLAS, no al
// cargar, para que lo unico que importe sea el orden de concatenacion.
//
// Y DEPENDE, OPCIONALMENTE, DE LA PIEZA DEL LOGO (§9.3): LOGO_JPEG_BASE64,
// LOGO_ANCHO_PX, LOGO_ALTO_PX y LOGO_ANCHO_PT. Si NO estan en el ambito, el
// elemento 'logo' se salta SIN LANZAR. Es al contrario que la metrica, y a
// proposito: un informe sin logo es un informe; uno que no se genera, no. Sin
// anchos, en cambio, no se puede ni medir una linea, y medir 0 solapa el texto.
// ──────────────────────────────────────────────────────────────────────────────

'use strict';

// ---------------------------------------------------------------------------
// 1 · CONSTANTES DE PAGINA (§3 del contrato, tabla «Constantes de pagina»)
// ---------------------------------------------------------------------------
// Estan aqui y en un solo sitio porque el contrato dice literalmente «fijadas
// aqui para que no las decida nadie por su cuenta». Si alguien quiere cambiar un
// margen, se cambia el contrato primero.

const PDF_PAG_ANCHO = 595.28;   // A4 en puntos
const PDF_PAG_ALTO  = 841.89;
const PDF_MARGEN    = 56;       // los cuatro, ~2 cm
const PDF_ANCHO_UTIL = PDF_PAG_ANCHO - 2 * PDF_MARGEN;   // 483.28

// ── LA FUENTE, EN DOS CONSTANTES Y EN NINGUN OTRO SITIO (§9.1) ───────────────
// De aqui salen LAS DOS COSAS que dependen de la fuente: el /BaseFont que se
// escribe en el PDF y la TABLA DE ANCHOS con la que se mide. Nada mas en este
// fichero nombra una fuente. Volver a Helvetica es cambiar estas dos lineas y los
// cinco tamanos de abajo; si hubiera que tocar diez sitios, estaria mal hecho.
//
// Times-Roman y Times-Bold son dos de las 14 fuentes base del PDF, igual que
// Helvetica: NO SE INCRUSTA NADA, solo hace falta su tabla de anchos.
const PDF_FUENTE_REGULAR = 'Times-Roman';
const PDF_FUENTE_NEGRITA = 'Times-Bold';

// ── LOS CINCO TAMANOS (§9.1) ─────────────────────────────────────────────────
// Times tiene la altura de la x mas pequena que Helvetica, asi que al mismo cuerpo
// se lee mas pequena: por eso estos numeros son los de la tabla del §9.1 y no los
// de Helvetica (que eran 10.5/14, 18, 14, 11.5 y 9.5/12).
const PDF_CUERPO_TAM   = 11;    // era 10.5 con Helvetica
const PDF_CUERPO_INTER = 15;    // era 14

const PDF_T0_TAM = 19;          // titulo0: el TITULO DEL DOCUMENTO, uno por informe
const PDF_T0_ARRIBA = 0;        // no lleva aire encima: abre la pagina
const PDF_T0_ABAJO = 14;
const PDF_T1_TAM = 14.5;        // titulo1, en negrita
const PDF_T1_ARRIBA = 18;
const PDF_T1_ABAJO = 8;

const PDF_T2_TAM = 12;          // titulo2, en negrita
const PDF_T2_ARRIBA = 12;
const PDF_T2_ABAJO = 5;

const PDF_CELDA_TAM     = 9.5;  // celdas de tabla (la cabecera, en negrita)
const PDF_CELDA_INTER   = 12.5; // era 12
const PDF_CELDA_RELLENO = 4;

// ── Lo que el §3 NO fija y hay que decidir para poder dibujar ────────────────
// Queda dicho aqui, junto y con su motivo, y esta en el informe de entrega. No
// es dato de negocio: es tipografia. Si Fiscal quiere otra cosa, es cambiar una
// constante y volver a lanzar la prueba.
// Las interlineas de los titulos SE CALCULAN del tamano, con el mismo factor 1.2
// que ya llevaban escrito a mano (22 para 18, 17 para 14, 14 para 11.5). Se
// derivan y no se escriben porque el §9.1 pide que cambiar la fuente sea cambiar
// las dos constantes de fuente y los cinco tamanos: con numeros a mano habria que
// acordarse de tres mas, y olvidarse no da ningun error, solo titulos apretados.
const PDF_T0_INTER = PDF_T0_TAM * 1.2;   // 22.8 con 19
const PDF_T1_INTER = PDF_T1_TAM * 1.2;   // 17.4 con 14.5
const PDF_T2_INTER = PDF_T2_TAM * 1.2;   // 14.4 con 12
const PDF_PARRAFO_ABAJO = 6;    // aire entre parrafos. Sin esto se pegan.
// Aire debajo del logo (§9.3). El contrato NO lo fija: es tipografia, como las
// interlineas de arriba. 10 pt es lo justo para que el titulo0 no se pegue al
// logo y no tanto como para dejar la cabecera flotando.
const PDF_CAMPO_ABAJO = 2;      // los 4 campos de la cabecera van casi seguidos
const PDF_LISTA_SANGRIA = 14;   // de la vineta al texto, y sangria francesa
const PDF_LISTA_ITEM_ABAJO = 2;
const PDF_LISTA_ABAJO = 6;
const PDF_LOGO_ABAJO = 16;      // aire entre el logo y el titulo del documento
const PDF_TABLA_ARRIBA = 6;
const PDF_TABLA_ABAJO = 8;
const PDF_TABLA_TITULO_ABAJO = 4;   // del titulo de la tabla a la primera fila
const PDF_GRIS_LINEA = 0.65;    // reticula de las tablas
const PDF_GRIS_CABECERA = 0.92; // fondo de la fila de cabecera
const PDF_GROSOR_LINEA = 0.5;

const CONSTANTES_PDF = {
  PAG_ANCHO: PDF_PAG_ANCHO, PAG_ALTO: PDF_PAG_ALTO, MARGEN: PDF_MARGEN,
  ANCHO_UTIL: PDF_ANCHO_UTIL,
  // Las dos del §9.1, expuestas para que la prueba compruebe la fuente sin tener
  // que leerse el /BaseFont del fichero generado.
  FUENTE_REGULAR: PDF_FUENTE_REGULAR, FUENTE_NEGRITA: PDF_FUENTE_NEGRITA,
  CUERPO_TAM: PDF_CUERPO_TAM, CUERPO_INTER: PDF_CUERPO_INTER,
  T0_TAM: PDF_T0_TAM, T0_ARRIBA: PDF_T0_ARRIBA, T0_ABAJO: PDF_T0_ABAJO,
  T1_TAM: PDF_T1_TAM, T1_ARRIBA: PDF_T1_ARRIBA, T1_ABAJO: PDF_T1_ABAJO,
  T2_TAM: PDF_T2_TAM, T2_ARRIBA: PDF_T2_ARRIBA, T2_ABAJO: PDF_T2_ABAJO,
  CELDA_TAM: PDF_CELDA_TAM, CELDA_INTER: PDF_CELDA_INTER,
  CELDA_RELLENO: PDF_CELDA_RELLENO
};

// ---------------------------------------------------------------------------
// 2 · WINANSI: DE TEXTO A UN BYTE POR CARACTER
// ---------------------------------------------------------------------------
// MISMO CRITERIO QUE aLatin1() DEL .030: primero se mapea lo mapeable, luego se
// quitan las tildes que no caben, y lo que siga sin caber SE CAE. Nunca se emite
// un byte que desplace nada.
//
// PERO WINANSI NO ES LATIN-1. En el tramo 0x80..0x9F, donde latin-1 tiene
// caracteres de control, WinAnsi mete las comillas tipograficas, el guion largo,
// la vineta, los puntos suspensivos y el simbolo del euro. Y ESO IMPORTA AQUI:
// el texto del informe lleva 20 guiones cortos, 6 largos, comillas tipograficas
// y el punto medio. Con la tabla de latin-1 esos caracteres se caerian TODOS y el
// cliente leeria «BLOQUE A  RESIDENTE FISCAL» sin la raya, y «Situacion en 2026»
// con las comillas comidas. Por eso la tabla de abajo, y por eso la prueba
// comprueba el 0x96 y el 0x97 uno a uno.

const CODIGO_WINANSI = {};

// ASCII imprimible (0x20..0x7E) y latin-1 alto (0xA0..0xFF): ahi WinAnsi y
// Unicode coinciden, el punto de codigo ES el byte. El 0xA0 es el espacio duro y
// el 0xAD el guion blando; los dos tienen glifo en WinAnsi (space y hyphen), asi
// que se dejan pasar en vez de tirarlos.
for (let c = 0x20; c <= 0x7E; c++) CODIGO_WINANSI[String.fromCharCode(c)] = c;
for (let c = 0xA0; c <= 0xFF; c++) CODIGO_WINANSI[String.fromCharCode(c)] = c;

// El tramo de Windows: [byte de WinAnsi, punto de codigo Unicode, nombre del
// glifo en la pieza 1]. Son 27; los codigos 129, 141, 143, 144 y 157 no existen
// en WinAnsiEncoding y por eso no estan.
const _WINANSI_TRAMO_WINDOWS = [
  [0x80, 0x20AC, 'Euro'],            // euro
  [0x82, 0x201A, 'quotesinglbase'],
  [0x83, 0x0192, 'florin'],
  [0x84, 0x201E, 'quotedblbase'],
  [0x85, 0x2026, 'ellipsis'],        // puntos suspensivos
  [0x86, 0x2020, 'dagger'],
  [0x87, 0x2021, 'daggerdbl'],
  [0x88, 0x02C6, 'circumflex'],
  [0x89, 0x2030, 'perthousand'],
  [0x8A, 0x0160, 'Scaron'],
  [0x8B, 0x2039, 'guilsinglleft'],
  [0x8C, 0x0152, 'OE'],              // ligadura OE: WinAnsi SI la tiene
  [0x8E, 0x017D, 'Zcaron'],
  [0x91, 0x2018, 'quoteleft'],       // comilla simple de apertura
  [0x92, 0x2019, 'quoteright'],      // comilla simple de cierre / apostrofo
  [0x93, 0x201C, 'quotedblleft'],    // comilla doble de apertura
  [0x94, 0x201D, 'quotedblright'],   // comilla doble de cierre
  [0x95, 0x2022, 'bullet'],          // la vineta de las listas
  [0x96, 0x2013, 'endash'],          // guion corto: 20 veces en la plantilla
  [0x97, 0x2014, 'emdash'],          // guion largo: 6 veces en la plantilla
  [0x98, 0x02DC, 'tilde'],
  [0x99, 0x2122, 'trademark'],
  [0x9A, 0x0161, 'scaron'],
  [0x9B, 0x203A, 'guilsinglright'],
  [0x9C, 0x0153, 'oe'],
  [0x9E, 0x017E, 'zcaron'],
  [0x9F, 0x0178, 'Ydieresis']
];
for (const t of _WINANSI_TRAMO_WINDOWS) {
  CODIGO_WINANSI[String.fromCharCode(t[1])] = t[0];
}

// La vineta de las listas, por su nombre. Es el 0x95 y mide 350 milesimas.
const VINETA = String.fromCharCode(0x2022);

// Lo que NO tiene sitio en WinAnsi ni quitandole la tilde, y se transcribe a su
// letra base: [punto de codigo, con que se sustituye].
// Es la misma lista que FUERA_DE_LATIN1 del .030 MENOS la ligadura OE y oe, que
// en WinAnsi SI existen (0x8C y 0x9C) y por eso aqui NO se parten en 'OE'/'oe'.
// Se anaden los espacios y guiones raros de los procesadores de texto: si el
// texto llega de un .docx, el guion no separable y el espacio fino aparecen, y
// tirarlos a secas pegaria dos palabras.
const _TRANSCRIPCIONES = [
  [0x0141, 'L'], [0x0142, 'l'],    // L con barra
  [0x0110, 'D'], [0x0111, 'd'],    // D con barra
  [0x0126, 'H'], [0x0127, 'h'],    // H con barra
  [0x013F, 'L'], [0x0140, 'l'],    // L con punto medio (catalan)
  [0x014A, 'N'], [0x014B, 'n'],    // eng
  [0x0166, 'T'], [0x0167, 't'],    // T con barra
  [0x1E9E, 'SS'],                  // eszett mayuscula
  [0x2010, '-'], [0x2011, '-'], [0x2212, '-'],   // guion, no separable, menos
  [0x2044, '/'],                                 // barra de fraccion
  [0x2007, ' '], [0x2009, ' '], [0x202F, ' '],   // espacio de cifra, fino, fino duro
  [0x200B, ''], [0xFEFF, '']                     // ancho cero y BOM: sin hueco
];
const FUERA_DE_WINANSI = {};
for (const t of _TRANSCRIPCIONES) {
  FUERA_DE_WINANSI[String.fromCharCode(t[0])] = t[1];
}

// Los diacriticos combinantes de Unicode (0x0300..0x036F). El rango se construye
// con fromCharCode y no se escribe dentro de la expresion regular: escrito, es
// invisible en el editor y cualquiera lo rompe sin darse cuenta.
const _DIACRITICOS = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036F) + ']', 'g');

// Los caracteres de control se convierten en ESPACIO, no se tiran. Dos motivos:
// si un texto trae un salto de linea y lo tiramos quedan dos palabras pegadas, y
// un salto de linea crudo dentro de una cadena de un flujo de contenido cuenta
// como fin de linea del PDF, o sea que tampoco se puede dejar pasar tal cual.
// Va con un bucle y no con una expresion regular para no meter bytes de control
// en el codigo fuente de este fichero.
function _sinControles(t) {
  let s = '';
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    s += (c < 0x20 || c === 0x7F) ? ' ' : t.charAt(i);
  }
  return s;
}

function aWinAnsi(texto) {
  if (texto == null) return Buffer.alloc(0);
  let t = _sinControles(String(texto));

  // 1 · mapear lo mapeable
  for (const de in FUERA_DE_WINANSI) {
    if (t.indexOf(de) !== -1) t = t.split(de).join(FUERA_DE_WINANSI[de]);
  }

  // 2 · quitar las tildes que WinAnsi no tiene (a con caron, o con doble acento,
  // s con coma...), dejando las que si tiene. Se descompone, se mira si
  // base+tilde recompone en algo que EXISTA en WinAnsi, y si no, la tilde se cae
  // y queda la letra base. Es exactamente el criterio de aLatin1 del .030.
  t = t.normalize('NFD').replace(_DIACRITICOS, function (tilde, i, s) {
    const base = s.charAt(i - 1);
    if (i === 0) return '';
    const compuesto = (base + tilde).normalize('NFC');
    return compuesto.length === 1 && CODIGO_WINANSI[compuesto] !== undefined ? tilde : '';
  }).normalize('NFC');

  // 3 · a bytes. Lo que siga sin caber, fuera: mejor un hueco que un byte que
  // desplaza. Se recorre por PUNTOS DE CODIGO (for...of) para que un emoji con
  // pareja subrogada se caiga entero y no medio.
  const bytes = [];
  for (const ch of t) {
    const c = CODIGO_WINANSI[ch];
    if (c !== undefined) bytes.push(c);
  }
  return Buffer.from(bytes);
}

// ---------------------------------------------------------------------------
// 3 · ESCAPADO DEL PDF (§3.5)
// ---------------------------------------------------------------------------
// Tres caracteres y ninguno mas: la barra invertida PRIMERO (si no, se escaparian
// las barras que acabamos de meter y saldrian dobles) y luego los dos
// parentesis. Sin esto, un parentesis en el texto cierra la cadena antes de
// tiempo y rompe el fichero ENTERO, no solo esa linea.
function escapar(texto) {
  if (texto == null) return '';
  return String(texto)
    .split('\\').join('\\\\')
    .split('(').join('\\(')
    .split(')').join('\\)');
}

// Una cadena lista para un flujo de contenido: bytes WinAnsi, escapados, entre
// parentesis. El viaje por 'latin1' es 1 byte <-> 1 caracter, asi que el escapado
// trabaja sobre los bytes finales.
function _cadenaFlujo(texto) {
  return '(' + escapar(aWinAnsi(texto).toString('latin1')) + ')';
}

// ---------------------------------------------------------------------------
// 4 · MEDIDA Y CORTE DE LINEAS (§3.1)
// ---------------------------------------------------------------------------

// La tabla de anchos de UNA fuente base, por su nombre. Se busca al usarla y no al
// cargar el fichero: asi lo unico que importa es el orden de concatenacion.
// El switch por nombre es el que hace que PDF_FUENTE_REGULAR y PDF_FUENTE_NEGRITA
// sean de verdad el unico sitio donde se elige la fuente. No se puede resolver con
// un objeto ANCHOS[nombre] montado arriba: el fichero se carga ANTES que las
// piezas de metrica en algunos ordenes y el objeto se quedaria con nulos.
function _anchosDeFuente(nombre) {
  if (nombre === 'Times-Roman')    return typeof ANCHOS_TIMES !== 'undefined' ? ANCHOS_TIMES : null;
  if (nombre === 'Times-Bold')     return typeof ANCHOS_TIMES_BOLD !== 'undefined' ? ANCHOS_TIMES_BOLD : null;
  if (nombre === 'Helvetica')      return typeof ANCHOS_HELVETICA !== 'undefined' ? ANCHOS_HELVETICA : null;
  if (nombre === 'Helvetica-Bold') return typeof ANCHOS_HELVETICA_BOLD !== 'undefined' ? ANCHOS_HELVETICA_BOLD : null;
  return null;
}

// La tabla con la que se mide, elegida POR LAS CONSTANTES DE FUENTE del §9.1.
//
// RESPALDO DECLARADO: si la metrica de la fuente elegida no esta en el ambito, se
// mide con la de Helvetica. Medir Times con los anchos de Helvetica desplaza los
// cortes de linea (las lineas salen mas cortas de lo que podrian), pero el PDF sale
// y se lee. Lo que NO se hace nunca es medir 0: eso apila todo el texto en la misma
// x y el informe queda ilegible sin dar ningun error. Si no hay NINGUNA de las dos,
// se lanza: sin anchos no se puede medir una linea.
function _tablaAnchos(negrita) {
  const nombre = negrita ? PDF_FUENTE_NEGRITA : PDF_FUENTE_REGULAR;
  let tabla = _anchosDeFuente(nombre);
  if (!tabla || tabla.length !== 256) tabla = _anchosDeFuente(negrita ? 'Helvetica-Bold' : 'Helvetica');
  if (!tabla || tabla.length !== 256) {
    throw new Error('PDF: no encuentro la metrica de ' + nombre +
                    ' ni la de Helvetica de respaldo. La pieza de metrica ' +
                    '(metrica-times-2026-08-14.js o metrica-helvetica-2026-08-14.js) tiene que ir ' +
                    'concatenada delante de esta.');
  }
  return tabla;
}

// Ancho en PUNTOS del texto tal y como se va a imprimir. Se mide sobre los bytes
// WinAnsi: si un caracter se ha caido, no mide, que es lo correcto.
function anchoTexto(texto, negrita, tamano) {
  const tabla = _tablaAnchos(negrita);
  const bytes = aWinAnsi(texto);
  let milesimas = 0;
  for (let i = 0; i < bytes.length; i++) milesimas += tabla[bytes[i]];
  return milesimas / 1000 * tamano;
}

// Corta una palabra que no cabe ni ella sola. A lo bruto, por caracteres, que es
// lo que pide el §3.1: mejor partir un identificador larguisimo que desbordar el
// margen. Garantiza avance: si ni un caracter cabe, se emite igual, porque si no
// esto seria un bucle infinito.
function _cortarPalabra(palabra, negrita, tamano, anchoMax) {
  const trozos = [];
  let actual = '';
  let anchoActual = 0;
  for (const ch of palabra) {
    const a = anchoTexto(ch, negrita, tamano);
    if (actual !== '' && anchoActual + a > anchoMax) {
      trozos.push(actual);
      actual = ch;
      anchoActual = a;
    } else {
      actual += ch;
      anchoActual += a;
    }
  }
  trozos.push(actual);
  return trozos;
}

// Corta por palabras midiendo de verdad. Los anchos son aditivos (este modelo no
// tiene kerning), asi que se acumula el ancho en vez de volver a medir la linea
// entera con cada palabra: con 30 paginas de texto eso es la diferencia entre
// milisegundos y segundos, porque medir implica un normalize() por llamada.
//
// CADENA VACIA -> [''], UNA linea vacia y no cero lineas. Es a proposito: una
// celda de tabla vacia tiene que seguir ocupando su fila (el §1 permite celdas
// con cadena vacia), y devolviendo [] la fila mediria solo el relleno y la tabla
// saldria descuadrada.
function cortarEnLineas(texto, negrita, tamano, anchoMax) {
  const t = String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim();
  if (t === '') return [''];
  // Un ancho no positivo no se puede satisfacer, y cortando por caracteres daria
  // una linea por letra. Se devuelve de una pieza y que se vea el desbordamiento.
  if (!(anchoMax > 0)) return [t];

  const anchoEspacio = anchoTexto(' ', negrita, tamano);
  const palabras = t.split(' ');
  const lineas = [];
  let actual = '';
  let anchoActual = 0;

  for (const palabra of palabras) {
    const anchoPalabra = anchoTexto(palabra, negrita, tamano);
    const anchoCandidata = actual === '' ? anchoPalabra : anchoActual + anchoEspacio + anchoPalabra;

    if (anchoCandidata <= anchoMax) {
      actual = actual === '' ? palabra : actual + ' ' + palabra;
      anchoActual = anchoCandidata;
      continue;
    }
    // No cabe: se cierra la linea en curso...
    if (actual !== '') { lineas.push(actual); actual = ''; anchoActual = 0; }
    // ...y se decide sobre la palabra sola.
    if (anchoPalabra <= anchoMax) {
      actual = palabra;
      anchoActual = anchoPalabra;
    } else {
      const trozos = _cortarPalabra(palabra, negrita, tamano, anchoMax);
      for (let i = 0; i < trozos.length - 1; i++) lineas.push(trozos[i]);
      actual = trozos[trozos.length - 1];
      anchoActual = anchoTexto(actual, negrita, tamano);
    }
  }
  if (actual !== '') lineas.push(actual);
  if (lineas.length === 0) lineas.push('');
  return lineas;
}

// ---------------------------------------------------------------------------
// 5 · NUMEROS PARA EL PDF
// ---------------------------------------------------------------------------
// Dos decimales y sin notacion exponencial: un '1e-7' dentro de un flujo de
// contenido NO es un numero valido del PDF y el visor se planta en esa pagina.
function _num(v) {
  if (typeof v !== 'number' || !isFinite(v)) {
    throw new Error('PDF: coordenada no finita (' + v + '). Es un fallo de maquetacion, no del dato.');
  }
  let s = (Math.round(v * 100) / 100).toFixed(2);
  s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}

// ---------------------------------------------------------------------------
// 5b · EL LOGO (§9.3)
// ---------------------------------------------------------------------------
// Devuelve los datos del logo listos para dibujar, o null SI NO ESTA EN EL AMBITO.
// NO LANZA, y eso es deliberado y distinto de la metrica: un informe sin logo es un
// informe; un informe que no se genera, no. Sin anchos, en cambio, no se puede ni
// medir una linea, y por eso _tablaAnchos() si lanza.
//
// Hacen falta las CUATRO constantes de la pieza: con LOGO_JPEG_BASE64 pero sin
// LOGO_ANCHO_PX no se puede calcular el alto sin deformarlo, y deformar el logo no
// da ningun error, solo un informe con el logo estirado.
function _logoDisponible() {
  if (typeof LOGO_JPEG_BASE64 === 'undefined' || !LOGO_JPEG_BASE64) return null;
  if (typeof LOGO_ANCHO_PX === 'undefined' || typeof LOGO_ALTO_PX === 'undefined' ||
      typeof LOGO_ANCHO_PT === 'undefined') return null;
  if (!(LOGO_ANCHO_PX > 0) || !(LOGO_ALTO_PX > 0) || !(LOGO_ANCHO_PT > 0)) return null;

  const bytes = Buffer.from(LOGO_JPEG_BASE64, 'base64');
  // Que sea de verdad un JPEG: SOI al principio (FFD8) y EOI al final (FFD9). Un
  // base64 truncado decodifica sin protestar y el visor se planta en esa pagina;
  // mejor un informe sin logo que un informe que no abre.
  if (bytes.length < 4 || bytes[0] !== 0xFF || bytes[1] !== 0xD8 ||
      bytes[bytes.length - 2] !== 0xFF || bytes[bytes.length - 1] !== 0xD9) return null;

  return {
    bytes: bytes,
    anchoPx: LOGO_ANCHO_PX,
    altoPx: LOGO_ALTO_PX,
    anchoPt: LOGO_ANCHO_PT,
    // El alto SIEMPRE calculado, nunca escrito: es lo que garantiza que el logo no
    // se deforme si algun dia cambia el fichero.
    altoPt: LOGO_ANCHO_PT * LOGO_ALTO_PX / LOGO_ANCHO_PX
  };
}

// ---------------------------------------------------------------------------
// 6 · MAQUETACION: DEL IR A LAS PAGINAS
// ---------------------------------------------------------------------------
// El modelo vertical, en una frase: `y` es el BORDE SUPERIOR del hueco libre.
// Una linea de tamano `tam` e interlinea `inter` que empieza en `y` pone su linea
// base en `y - tam` y deja el cursor en `y - inter`. Con 11/15 quedan 4 pt por
// debajo de la base, de sobra para el descendente de Times (2.4 pt a 11), asi que
// las lineas no se muerden.
//
// CABE LA LINEA SI  y - inter >= MARGEN. Se comprueba ANTES de dibujar cada
// linea, nunca despues: eso es lo que hace que el salto de pagina sea automatico
// y que ninguna linea acabe pisando el margen inferior.

// `logo` es lo que devuelve _logoDisponible(), o null. Se recibe por parametro y
// no se resuelve aqui dentro para que el ensamblado y la maquetacion vean
// EXACTAMENTE el mismo logo: si uno lo viera y el otro no, el PDF llevaria un
// '/Logo Do' sin objeto de imagen (o al contrario) y no abriria.
function _maquetar(elementos) {
  const paginas = [];
  let ops = null;
  // Se pone a true solo si un elemento 'logo' llega a dibujarse de verdad. De eso
  // depende que se emita el objeto de imagen y que /Resources declare el XObject:
  // sin esta bandera, un PDF sin logo llevaria un objeto suelto y la xref un hueco.
  let hayLogo = false;
  let y = 0;
  // Si se dibuja el logo aunque sea una vez, hay que declarar el /XObject y crear
  // el objeto de imagen. Si no, no: un /XObject vacio es un objeto de mas en la
  // xref por nada.
  let usaLogo = false;

  function abrirPagina() {
    ops = [];
    paginas.push(ops);
    y = PDF_PAG_ALTO - PDF_MARGEN;
  }
  function paginaVacia() { return ops.length === 0; }

  abrirPagina();

  function texto(x, yBase, tam, negrita, cadena) {
    ops.push('BT /' + (negrita ? 'F2' : 'F1') + ' ' + _num(tam) + ' Tf 1 0 0 1 ' +
             _num(x) + ' ' + _num(yBase) + ' Tm ' + _cadenaFlujo(cadena) + ' Tj ET');
  }
  function rect(x, yAbajo, w, h) {
    return _num(x) + ' ' + _num(yAbajo) + ' ' + _num(w) + ' ' + _num(h) + ' re';
  }
  // q/Q alrededor de la reticula: sin eso, el gris de relleno se quedaria puesto
  // en el estado grafico y el TEXTO de la fila siguiente saldria gris claro.
  function rellenar(rects, gris) {
    ops.push('q ' + _num(gris) + ' g ' + rects.join(' ') + ' f Q');
  }
  function bordear(rects) {
    ops.push('q ' + _num(PDF_GROSOR_LINEA) + ' w ' + _num(PDF_GRIS_LINEA) + ' G ' +
             rects.join(' ') + ' S Q');
  }

  // Dibuja lineas ya cortadas, saltando de pagina cuando no cabe la siguiente.
  // `x` es la sangria de la primera linea y `xResto` la de las demas: eso es la
  // sangria francesa de las listas y de los campos.
  // `centrar` es el §9.2. Se centra CADA LINEA por separado, con su propio ancho:
  // centrar el bloque entero dejaria la segunda linea de un titulo descuadrada
  // respecto a la primera. Sin la bandera, la x es la de siempre y NADA se mueve.
  function dibujarLineas(lineas, x, xResto, tam, inter, negrita, centrar) {
    for (let i = 0; i < lineas.length; i++) {
      if (y - inter < PDF_MARGEN) abrirPagina();
      const xi = centrar
        ? PDF_MARGEN + (PDF_ANCHO_UTIL - anchoTexto(lineas[i], negrita, tam)) / 2
        : (i === 0 ? x : xResto);
      texto(xi, y - tam, tam, negrita, lineas[i]);
      y -= inter;
    }
  }

  function comoTexto(v, donde) {
    // El §1 dice que ninguna celda ni ningun texto puede ser undefined ni null.
    // Se para en vez de escribir la palabra 'undefined' en un documento que el
    // cliente va a guardar.
    if (v === undefined || v === null) {
      throw new Error('PDF: ' + donde + ' llega ' + String(v) +
                      '. El §1 del contrato lo prohibe: cadena vacia si, ausente no.');
    }
    return String(v);
  }

  for (let iEl = 0; iEl < elementos.length; iEl++) {
    const el = elementos[iEl];
    if (!el || typeof el !== 'object') {
      throw new Error('PDF: el elemento ' + iEl + ' no es un objeto.');
    }
    const donde = 'el elemento ' + iEl + ' (' + el.tipo + ')';

    // ── saltoPagina ─────────────────────────────────────────────────────────
    // ── logo (§9.3) ─────────────────────────────────────────────────────────
    if (el.tipo === 'logo') {
      // SI LOS DATOS NO ESTAN EN EL AMBITO, SE SALTA SIN LANZAR. Es al contrario
      // que la metrica, que si lanza: sin anchos no se puede ni medir una linea,
      // pero un informe sin logo sigue siendo un informe, y uno que no se genera
      // no lo es. Pasa al probar el motor solo, sin la pieza del logo delante.
      if (typeof LOGO_JPEG_BASE64 === 'undefined' ||
          typeof LOGO_ANCHO_PX === 'undefined' || typeof LOGO_ALTO_PX === 'undefined') {
        continue;
      }
      const anchoLogo = (typeof LOGO_ANCHO_PT !== 'undefined' ? LOGO_ANCHO_PT : 132);
      // El alto SIEMPRE se calcula: si se pusiera a mano, un logo nuevo con otra
      // proporcion saldria estirado y NO daria ningun error.
      const altoLogo = anchoLogo * LOGO_ALTO_PX / LOGO_ANCHO_PX;
      if (y - altoLogo < PDF_MARGEN) abrirPagina();
      const xLogo = PDF_MARGEN + (PDF_ANCHO_UTIL - anchoLogo) / 2;   // centrado
      // La matriz `cm` coloca la imagen: ancho y alto en puntos, y x/y del vertice
      // INFERIOR IZQUIERDO. Va entre q/Q para no dejar la matriz puesta y torcer
      // todo lo que venga detras.
      ops.push('q ' + _num(anchoLogo) + ' 0 0 ' + _num(altoLogo) + ' ' +
               _num(xLogo) + ' ' + _num(y - altoLogo) + ' cm /Logo Do Q');
      y -= altoLogo + PDF_LOGO_ABAJO;
      hayLogo = true;
      continue;
    }

    if (el.tipo === 'saltoPagina') {
      // Si la pagina esta vacia no se abre otra: dos saltos seguidos, o un salto
      // justo detras de un salto automatico, no meten una hoja en blanco en
      // medio de una memoria fiscal.
      if (!paginaVacia()) abrirPagina();
      continue;
    }

    // ── titulo0, titulo1 y titulo2 ──────────────────────────────────────────
    // titulo0 es el TITULO DEL DOCUMENTO, uno por informe y en la primera linea.
    // Existe porque sin el, el nombre del documento se dibujaba igual que un
    // 'BLOQUE B — ...' y no se distinguia el titulo de un encabezado de bloque.
    // No lleva aire por encima: abre la pagina.
    if (el.tipo === 'titulo0' || el.tipo === 'titulo1' || el.tipo === 'titulo2') {
      const esCero = el.tipo === 'titulo0';
      const esUno = el.tipo === 'titulo1';
      const tam = esCero ? PDF_T0_TAM : esUno ? PDF_T1_TAM : PDF_T2_TAM;
      const inter = esCero ? PDF_T0_INTER : esUno ? PDF_T1_INTER : PDF_T2_INTER;
      const arriba = esCero ? PDF_T0_ARRIBA : esUno ? PDF_T1_ARRIBA : PDF_T2_ARRIBA;
      const abajo = esCero ? PDF_T0_ABAJO : esUno ? PDF_T1_ABAJO : PDF_T2_ABAJO;

      const lineas = cortarEnLineas(comoTexto(el.texto, donde + ' texto'), true, tam, PDF_ANCHO_UTIL);
      // El aire de encima no se pone si el titulo abre pagina: dejaria una
      // sangria rara pegada al borde superior.
      if (!paginaVacia()) y -= arriba;
      // Un titulo NO se queda solo al final de una pagina: si no cabe el titulo
      // mas una linea de lo que venga detras, se salta.
      // INTERPRETACION: el §3 solo exige no partir filas de tabla, pero un
      // titulo huerfano en un documento que el cliente guarda se ve igual de mal.
      const necesario = lineas.length * inter + abajo + PDF_CUERPO_INTER;
      if (y - necesario < PDF_MARGEN && !paginaVacia()) abrirPagina();
      dibujarLineas(lineas, PDF_MARGEN, PDF_MARGEN, tam, inter, true, el.centrado === true);
      y -= abajo;
      continue;
    }

    // ── parrafo ─────────────────────────────────────────────────────────────
    if (el.tipo === 'parrafo') {
      const lineas = cortarEnLineas(comoTexto(el.texto, donde + ' texto'), false,
                                    PDF_CUERPO_TAM, PDF_ANCHO_UTIL);
      dibujarLineas(lineas, PDF_MARGEN, PDF_MARGEN, PDF_CUERPO_TAM, PDF_CUERPO_INTER, false, el.centrado === true);
      y -= PDF_PARRAFO_ABAJO;
      continue;
    }

    // ── campo: etiqueta en negrita y valor en redonda, misma linea base ─────
    if (el.tipo === 'campo') {
      const etiqueta = comoTexto(el.etiqueta, donde + ' etiqueta') + ': ';
      const valor = comoTexto(el.valor, donde + ' valor');
      const anchoEtq = anchoTexto(etiqueta, true, PDF_CUERPO_TAM);
      const lineas = cortarEnLineas(valor, false, PDF_CUERPO_TAM, PDF_ANCHO_UTIL - anchoEtq);

      if (y - PDF_CUERPO_INTER < PDF_MARGEN) abrirPagina();
      texto(PDF_MARGEN, y - PDF_CUERPO_TAM, PDF_CUERPO_TAM, true, etiqueta);
      texto(PDF_MARGEN + anchoEtq, y - PDF_CUERPO_TAM, PDF_CUERPO_TAM, false, lineas[0]);
      y -= PDF_CUERPO_INTER;
      // Un valor largo sigue sangrado al ancho de la etiqueta, para que se lea
      // como una columna y no como un parrafo nuevo.
      for (let i = 1; i < lineas.length; i++) {
        if (y - PDF_CUERPO_INTER < PDF_MARGEN) abrirPagina();
        texto(PDF_MARGEN + anchoEtq, y - PDF_CUERPO_TAM, PDF_CUERPO_TAM, false, lineas[i]);
        y -= PDF_CUERPO_INTER;
      }
      y -= PDF_CAMPO_ABAJO;
      continue;
    }

    // ── lista: vineta (WinAnsi 0x95) y sangria francesa ─────────────────────
    if (el.tipo === 'lista') {
      if (!Array.isArray(el.items)) {
        throw new Error('PDF: ' + donde + ' no trae array items.');
      }
      for (let i = 0; i < el.items.length; i++) {
        const item = comoTexto(el.items[i], donde + ' item ' + i);
        const lineas = cortarEnLineas(item, false, PDF_CUERPO_TAM,
                                      PDF_ANCHO_UTIL - PDF_LISTA_SANGRIA);
        if (y - PDF_CUERPO_INTER < PDF_MARGEN) abrirPagina();
        // La vineta va en su propia cadena, en el margen, y el texto sangrado:
        // asi las lineas de continuacion no se meten debajo de la vineta.
        texto(PDF_MARGEN, y - PDF_CUERPO_TAM, PDF_CUERPO_TAM, false, VINETA);
        texto(PDF_MARGEN + PDF_LISTA_SANGRIA, y - PDF_CUERPO_TAM, PDF_CUERPO_TAM, false, lineas[0]);
        y -= PDF_CUERPO_INTER;
        for (let j = 1; j < lineas.length; j++) {
          if (y - PDF_CUERPO_INTER < PDF_MARGEN) abrirPagina();
          texto(PDF_MARGEN + PDF_LISTA_SANGRIA, y - PDF_CUERPO_TAM, PDF_CUERPO_TAM, false, lineas[j]);
          y -= PDF_CUERPO_INTER;
        }
        y -= PDF_LISTA_ITEM_ABAJO;
      }
      y -= PDF_LISTA_ABAJO;
      continue;
    }

    // ── tabla ───────────────────────────────────────────────────────────────
    if (el.tipo === 'tabla') {
      if (!Array.isArray(el.anchos) || el.anchos.length === 0) {
        throw new Error('PDF: ' + donde + ' no trae anchos.');
      }
      if (!Array.isArray(el.filas)) {
        throw new Error('PDF: ' + donde + ' no trae filas.');
      }
      const nCol = el.anchos.length;
      // Los anchos son FRACCIONES que suman 1 (§1). Se comprueba aqui tambien,
      // aunque el cuerpo ya lo valide, porque una tabla con anchos que suman 1.4
      // se sale del papel sin avisar y eso no se ve en ninguna prueba de texto.
      let suma = 0;
      for (let i = 0; i < nCol; i++) {
        if (typeof el.anchos[i] !== 'number' || !(el.anchos[i] > 0)) {
          throw new Error('PDF: ' + donde + ' tiene el ancho ' + i + ' = ' + el.anchos[i] +
                          '. Son fracciones del ancho util y tienen que ser positivas.');
        }
        suma += el.anchos[i];
      }
      if (Math.abs(suma - 1) > 1e-6) {
        throw new Error('PDF: ' + donde + ' tiene anchos que suman ' + suma +
                        ' y tienen que sumar 1 (son fracciones del ancho util, §1).');
      }

      const anchosPt = [];
      const xs = [];
      let acc = PDF_MARGEN;
      for (let i = 0; i < nCol; i++) {
        anchosPt.push(el.anchos[i] * PDF_ANCHO_UTIL);
        xs.push(acc);
        acc += anchosPt[i];
      }

      // Cortar las celdas de una fila y saber cuanto mide de alto. Se hace UNA
      // vez por fila y se guarda: la altura hay que conocerla ANTES de dibujar
      // para poder decidir si la fila cabe, y volver a cortar seria medir dos
      // veces lo mismo.
      const prepararFila = function (celdas, negrita, queEs) {
        if (!Array.isArray(celdas) || celdas.length !== nCol) {
          throw new Error('PDF: ' + donde + ', ' + queEs + ' tiene ' +
                          (Array.isArray(celdas) ? celdas.length : '?') + ' celdas y hay ' +
                          nCol + ' columnas.');
        }
        const porCelda = [];
        let maxLineas = 1;
        for (let i = 0; i < nCol; i++) {
          const lineas = cortarEnLineas(comoTexto(celdas[i], donde + ', ' + queEs + ', celda ' + i),
                                        negrita, PDF_CELDA_TAM,
                                        anchosPt[i] - 2 * PDF_CELDA_RELLENO);
          porCelda.push(lineas);
          if (lineas.length > maxLineas) maxLineas = lineas.length;
        }
        // Todas las celdas de una fila comparten alto: el de la mas alta.
        return { porCelda: porCelda, altura: maxLineas * PDF_CELDA_INTER + 2 * PDF_CELDA_RELLENO };
      };

      const dibujarFila = function (prep, negrita, conFondo) {
        const arriba = y;
        const abajo = y - prep.altura;
        const rects = [];
        for (let i = 0; i < nCol; i++) rects.push(rect(xs[i], abajo, anchosPt[i], prep.altura));
        if (conFondo) rellenar(rects, PDF_GRIS_CABECERA);
        bordear(rects);
        for (let i = 0; i < nCol; i++) {
          const lineas = prep.porCelda[i];
          for (let j = 0; j < lineas.length; j++) {
            texto(xs[i] + PDF_CELDA_RELLENO,
                  arriba - PDF_CELDA_RELLENO - j * PDF_CELDA_INTER - PDF_CELDA_TAM,
                  PDF_CELDA_TAM, negrita, lineas[j]);
          }
        }
        y = abajo;
      };

      const tieneCabecera = el.cabecera !== null && el.cabecera !== undefined;
      const prepCab = tieneCabecera ? prepararFila(el.cabecera, true, 'la cabecera') : null;
      const prepFilas = [];
      for (let f = 0; f < el.filas.length; f++) {
        prepFilas.push(prepararFila(el.filas[f], false, 'la fila ' + f));
      }

      y -= PDF_TABLA_ARRIBA;

      // Titulo de la tabla (§1: opcional, en negrita, encima de la tabla). NO es
      // un titulo2: no lleva su tamano ni su aire, va al tamano del cuerpo en
      // negrita, que es lo que hace la plantilla con «Resumen».
      if (el.titulo !== undefined && el.titulo !== null && String(el.titulo) !== '') {
        const lineasTit = cortarEnLineas(String(el.titulo), true, PDF_CUERPO_TAM, PDF_ANCHO_UTIL);
        // El titulo tampoco se queda solo: tiene que caber con la cabecera y la
        // primera fila detras.
        const conElloDetras = lineasTit.length * PDF_CUERPO_INTER + PDF_TABLA_TITULO_ABAJO +
                              (prepCab ? prepCab.altura : 0) +
                              (prepFilas.length ? prepFilas[0].altura : 0);
        if (y - conElloDetras < PDF_MARGEN && !paginaVacia()) abrirPagina();
        dibujarLineas(lineasTit, PDF_MARGEN, PDF_MARGEN, PDF_CUERPO_TAM, PDF_CUERPO_INTER, true);
        y -= PDF_TABLA_TITULO_ABAJO;
      }

      // La cabecera no se dibuja sola al final de una pagina: se exige que quepa
      // con la primera fila detras.
      if (prepCab) {
        const conPrimera = prepCab.altura + (prepFilas.length ? prepFilas[0].altura : 0);
        if (y - conPrimera < PDF_MARGEN && !paginaVacia()) abrirPagina();
        dibujarFila(prepCab, true, true);
      }

      for (let f = 0; f < prepFilas.length; f++) {
        // UNA FILA NO SE PARTE (§3.2): si no cabe entera, salta de pagina...
        if (y - prepFilas[f].altura < PDF_MARGEN && !paginaVacia()) {
          abrirPagina();
          // ...Y LA CABECERA SE REPITE (§3.3). Sin esto, la segunda mitad de una
          // tabla de tipos impositivos son numeros sin decir de que.
          if (prepCab) dibujarFila(prepCab, true, true);
        }
        // LIMITE CONOCIDO: si una sola fila fuera mas alta que la pagina util
        // entera (729.89 pt, o sea mas de 58 lineas en una celda) desbordaria,
        // porque el §3 prohibe partirla y no hay a donde saltar. Con la plantilla
        // de hoy la fila mas alta son 4 lineas. Queda dicho.
        dibujarFila(prepFilas[f], false, false);
      }
      y -= PDF_TABLA_ABAJO;
      continue;
    }

    throw new Error('PDF: no se dibujar el tipo "' + el.tipo + '" (' + donde + '). Los del §1 son: ' +
                    'titulo0, titulo1, titulo2, parrafo, campo, lista, tabla, saltoPagina.');
  }

  // Un saltoPagina al final, o un bloque que acabo justo en el borde, puede
  // dejar una pagina sin nada. Una hoja en blanco al final de una memoria fiscal
  // parece un fichero truncado, asi que se quita.
  while (paginas.length > 1 && paginas[paginas.length - 1].length === 0) paginas.pop();

  // Se devuelve TAMBIEN si el logo llego a dibujarse. El ensamblado esta en otra
  // funcion y en otro ambito, asi que la bandera tiene que viajar: de eso depende
  // que se emita el objeto de imagen y que /Resources declare el XObject.
  return { paginas: paginas, hayLogo: hayLogo };
}

// ---------------------------------------------------------------------------
// 7 · ENSAMBLADO DEL FICHERO
// ---------------------------------------------------------------------------
// AQUI ESTA EL PUNTO EN EL QUE ESTO SE ROMPE O NO. Todo lo que sigue trabaja con
// Buffers y con un unico contador de BYTES. Nadie mide con .length de un string.

// Las cadenas del diccionario /Info van en HEXADECIMAL UTF-16BE con BOM, no como
// cadena literal. MOTIVO CONCRETO: una cadena literal en /Info se interpreta en
// PDFDocEncoding, que NO es WinAnsi en el tramo 0x80..0x9F (ahi el guion largo es
// 0x8C y no 0x97), y el titulo que manda el nodo lleva un guion largo:
// 'Informe de memoria fiscal - Nombre' con raya. En hexadecimal UTF-16BE no hay
// ambiguedad posible, y de paso todos los bytes de esa parte del fichero quedan
// en ASCII.
function _cadenaInfo(texto) {
  const s = String(texto == null ? '' : texto);
  let hex = 'FEFF';
  for (let i = 0; i < s.length; i++) {
    hex += s.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0');
  }
  return '<' + hex + '>';
}

function _fechaPdf(d) {
  function p(n) { return String(n).padStart(2, '0'); }
  // En UTC, para que no dependa del huso de la maquina que ejecute n8n.
  return 'D:' + d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) +
         p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) +
         'Z00' + String.fromCharCode(39) + '00' + String.fromCharCode(39);
}

function construirPdf(elementos, opciones) {
  if (!Array.isArray(elementos)) {
    throw new Error('PDF: construirPdf necesita el array de elementos del §1, llego ' +
                    typeof elementos + '.');
  }
  const op = opciones || {};

  const maquetado = _maquetar(elementos);
  const paginas = maquetado.paginas;
  const hayLogo = maquetado.hayLogo;
  const nPag = paginas.length;

  // ── Numeracion de objetos. Fija y explicita para que la xref se pueda auditar
  // a mano:  1 Catalog · 2 Pages · 3 Helvetica · 4 Helvetica-Bold · 5 Info
  // y luego, por cada pagina i (0..n-1):  6 + 2i = /Page   y   7 + 2i = su flujo
  const OBJ_CATALOGO = 1, OBJ_PAGINAS = 2, OBJ_F1 = 3, OBJ_F2 = 4, OBJ_INFO = 5;
  const numPagina = function (i) { return 6 + 2 * i; };
  const numFlujo = function (i) { return 7 + 2 * i; };
  // El objeto del logo va EL ULTIMO a proposito: asi las paginas y sus flujos
  // conservan su numeracion (6+2i y 7+2i) y no hay que tocar nada mas. Si se
  // metiera en medio, cambiarian todos los numeros y todos los offsets.
  const OBJ_LOGO = hayLogo ? 6 + 2 * nPag : 0;
  const nObj = 5 + 2 * nPag + (hayLogo ? 1 : 0);

  // cuerpos[n] = el cuerpo del objeto n como string 'latin1', o sea 1 caracter
  // por byte. En el momento de escribir se convierte a Buffer con 'latin1' y no
  // con el UTF-8 por defecto, que es lo que duplicaria los acentos.
  const cuerpos = new Array(nObj + 1).fill(null);

  const kids = [];
  for (let i = 0; i < nPag; i++) kids.push(numPagina(i) + ' 0 R');

  cuerpos[OBJ_CATALOGO] = '<< /Type /Catalog /Pages ' + OBJ_PAGINAS + ' 0 R >>';
  cuerpos[OBJ_PAGINAS] = '<< /Type /Pages /Count ' + nPag + ' /Kids [' + kids.join(' ') + '] >>';
  // /Encoding /WinAnsiEncoding NO ES OPCIONAL (§3.4 y punto 4 del encargo): sin
  // eso el visor interpreta los bytes con StandardEncoding, y la N con virgulilla
  // (0xD1) sale dibujada como otra cosa aunque el byte sea correcto.
  // El /BaseFont sale de las DOS constantes del §9.1, no escrito aqui. Estaba fijo
  // a Helvetica y eso dejaba el motor MIDIENDO CON TIMES Y DIBUJANDO CON HELVETICA,
  // que es peor que cualquiera de los dos estados puros: las lineas se miden con
  // unos anchos y se pintan con otros, asi que desbordan el margen sin dar error.
  cuerpos[OBJ_F1] = '<< /Type /Font /Subtype /Type1 /BaseFont /' + PDF_FUENTE_REGULAR +
                    ' /Encoding /WinAnsiEncoding >>';
  cuerpos[OBJ_F2] = '<< /Type /Font /Subtype /Type1 /BaseFont /' + PDF_FUENTE_NEGRITA +
                    ' /Encoding /WinAnsiEncoding >>';

  // La fecha se puede fijar por opciones para que una prueba pueda comparar dos
  // PDF byte a byte; si no se da, la de ahora.
  const fecha = op.fechaCreacion instanceof Date ? op.fechaCreacion : new Date();
  cuerpos[OBJ_INFO] = '<< /Title ' + _cadenaInfo(op.titulo == null ? '' : op.titulo) +
                      ' /Author ' + _cadenaInfo(op.autor == null ? '' : op.autor) +
                      ' /Producer ' + _cadenaInfo('TaxDown - motor PDF del informe Mobility') +
                      ' /CreationDate (' + escapar(_fechaPdf(fecha)) + ') >>';

  const cajaMedios = '[0 0 ' + _num(PDF_PAG_ANCHO) + ' ' + _num(PDF_PAG_ALTO) + ']';
  for (let i = 0; i < nPag; i++) {
    cuerpos[numPagina(i)] =
      '<< /Type /Page /Parent ' + OBJ_PAGINAS + ' 0 R /MediaBox ' + cajaMedios +
      ' /Resources << /Font << /F1 ' + OBJ_F1 + ' 0 R /F2 ' + OBJ_F2 + ' 0 R >>' +
      (hayLogo ? ' /XObject << /Logo ' + OBJ_LOGO + ' 0 R >>' : '') + ' >>' +
      ' /Contents ' + numFlujo(i) + ' 0 R >>';

    // El flujo, SIN COMPRIMIR (§3: no hay zlib). /Length en BYTES, tomado del
    // Buffer y no del string, porque el flujo lleva bytes WinAnsi > 127.
    const flujo = Buffer.from(paginas[i].join('\n'), 'latin1');
    cuerpos[numFlujo(i)] = '<< /Length ' + flujo.length + ' >>\nstream\n' +
                           flujo.toString('latin1') + '\nendstream';
  }

  // ── El logo, un solo objeto de imagen para todo el PDF (§9.3) ─────────────
  // /DCTDecode significa "el flujo es un JPEG TAL CUAL". Ni se comprime, ni se
  // filtra, ni hace falta predictor: es el unico camino que no necesita libreria,
  // y en el nodo de n8n no hay ninguna. El JPEG tiene que ser BASELINE, porque
  // /DCTDecode no lee progresivo.
  if (hayLogo) {
    const jpg = Buffer.from(LOGO_JPEG_BASE64, 'base64');
    cuerpos[OBJ_LOGO] = '<< /Type /XObject /Subtype /Image /Width ' + LOGO_ANCHO_PX +
                        ' /Height ' + LOGO_ALTO_PX + ' /ColorSpace /DeviceRGB' +
                        ' /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length +
                        ' >>\nstream\n' + jpg.toString('latin1') + '\nendstream';
  }

  // ── Escritura, contando bytes ─────────────────────────────────────────────
  const trozos = [];
  let posicion = 0;              // BYTES escritos hasta ahora
  const offsets = new Array(nObj + 1).fill(0);

  function escribir(str) {
    const b = Buffer.from(str, 'latin1');
    trozos.push(b);
    posicion += b.length;        // <- el unico contador que cuenta, y cuenta BYTES
  }

  escribir('%PDF-1.4\n');
  // Segunda linea: un comentario con cuatro bytes > 127. Esta en el estandar para
  // que las herramientas que copian ficheros lo traten como binario y no le
  // toquen los fines de linea. Y de paso obliga a que los offsets se cuenten en
  // bytes desde el principio: si alguien los contara con string.length, aqui ya
  // iria desviado por cuatro.
  escribir('%' + String.fromCharCode(0xE2, 0xE3, 0xCF, 0xD3) + '\n');

  for (let n = 1; n <= nObj; n++) {
    if (cuerpos[n] === null) throw new Error('PDF: el objeto ' + n + ' se ha quedado sin cuerpo.');
    offsets[n] = posicion;       // se apunta ANTES de escribir 'n 0 obj'
    escribir(n + ' 0 obj\n' + cuerpos[n] + '\nendobj\n');
  }

  // ── La xref (§3.6) ────────────────────────────────────────────────────────
  // Cada entrada mide EXACTAMENTE 20 bytes: 10 de offset + espacio + 5 de
  // generacion + espacio + 1 de tipo + 2 de fin de linea. Por eso el fin de
  // linea de las entradas es '\r\n' y no '\n': con un solo byte la entrada
  // mediria 19, y hay visores estrictos que entonces rechazan el fichero.
  const posXref = posicion;
  let xref = 'xref\n0 ' + (nObj + 1) + '\n';
  xref += '0000000000 65535 f\r\n';
  for (let n = 1; n <= nObj; n++) {
    xref += String(offsets[n]).padStart(10, '0') + ' 00000 n\r\n';
  }
  escribir(xref);
  escribir('trailer\n<< /Size ' + (nObj + 1) + ' /Root ' + OBJ_CATALOGO + ' 0 R /Info ' +
           OBJ_INFO + ' 0 R >>\n');
  escribir('startxref\n' + posXref + '\n%%EOF\n');

  return { bytes: Buffer.concat(trozos), paginas: nPag };
}

// ==================== tabla-paises-iso2-2026-08-13.js ====================
// ── 13/08 · Tabla PAIS -> ISO 3166-1 alfa-2, para el fichero .030 ──────────────
//
// PARA QUE ES: el fichero .030 de la AEAT guarda la nacionalidad (casilla 205) y
// el pais de nacimiento (casilla 216) en DOS LETRAS, y Airtable los guarda con el
// NOMBRE LARGO. Esta tabla traduce de uno a otro.
//
// LA CLAVE ES EL NOMBRE EXACTO DE LA OPCION DE AIRTABLE, tal cual: mayusculas sin
// acentos SALVO 'ESPAÑA', 'CURAÇAO' y 'PAISES BAJOS (PARTE CARIBEÑA)', y con las
// comas invertidas de 'CHECA, REPUBLICA' o 'SALVADOR, EL'. NO se normaliza aqui:
// el valor entra tal como sale de la celda.
//
// Cubre las 245 opciones de los tres singleSelect de paises -- Nacionalidad
// (fldfqTiY9Oq6Qjo21), PaisNacimiento (fldCzml10hcjgw7F9) y UltimoPaisResidencia
// (fld80wAfTQMgK0gJF) --, que comparten exactamente la misma lista.
// Comprobado el 13/08: 245 de 245, cero sin mapear y cero sobrantes.
//
// ── TRES ENTRADAS SIN CODIGO, A PROPOSITO ────────────────────────────────────
// 'BANCO CENTRAL EUROPEO', 'ORGANISMOS INTERNACIONALES' y 'OTROS PAISES NO
// RELACIONADOS' NO SON PAISES y no tienen ISO-2. Devuelven cadena vacia. Si algun
// dia una fila trae uno de esos en la nacionalidad, el .030 NO SE PUEDE GENERAR
// tal cual: hay que preguntar. Por eso paisISO() devuelve null y no ''.
//
// ── UN CODIGO REPETIDO, TAMBIEN A PROPOSITO ──────────────────────────────────
// 'LUXEMBURGO' y 'LUXEMBURGO (DI)' comparten LU. El sufijo (DI) es una distincion
// interna de la lista de la AEAT, no otro pais.
//
// ── DOS QUE CONVIENE MIRAR SI ALGUN DIA FALLAN ───────────────────────────────
// 'SAN MARTIN' -> MF (la parte francesa). La parte neerlandesa es SX y NO esta en
//   la lista, asi que se asume MF. Si Fiscal dice lo contrario, se cambia aqui.
// 'MACEDONIA' -> MK y 'SUAZILANDIA' -> SZ: los nombres de la lista son los viejos
//   (hoy Macedonia del Norte y Esuatini), pero el codigo ISO no cambio.
//
// ── TRES MAPAS SOBRE LA MISMA LISTA DE 245 CLAVES ────────────────────────────
// PAIS_ISO / paisISO()                        -> las dos letras para el .030 (Hacienda)
// PAIS_PRESENTACION / paisPresentacion()      -> el nombre escrito en espanol, para el
//                                                informe Mobility en PDF (14/08)
// PAIS_PRESENTACION_EN / paisPresentacionEn() -> el nombre en ingles, §8.3 del contrato,
//                                                para el informe con Idioma = Ingles
// Comparten claves a proposito: una sola lista de paises en todo el proyecto.

const PAIS_ISO = {
  'AFGANISTAN':'AF', 'ALBANIA':'AL', 'ALEMANIA':'DE',
  'ANDORRA':'AD', 'ANGOLA':'AO', 'ANGUILA':'AI',
  'ANTARTIDA':'AQ', 'ANTIGUA Y BARBUDA':'AG', 'ARABIA SAUDI':'SA',
  'ARGELIA':'DZ', 'ARGENTINA':'AR', 'ARMENIA':'AM',
  'ARUBA':'AW', 'AUSTRALIA':'AU', 'AUSTRIA':'AT',
  'AZERBAIYAN':'AZ', 'BAHAMAS':'BS', 'BAHREIN':'BH',
  'BANCO CENTRAL EUROPEO':'', 'BANGLADESH':'BD', 'BARBADOS':'BB',
  'BELGICA':'BE', 'BELICE':'BZ', 'BENIN':'BJ',
  'BERMUDAS':'BM', 'BIELORRUSIA':'BY', 'BOLIVIA':'BO',
  'BOSNIA-HERZEGOVINA':'BA', 'BOTSUANA':'BW', 'BOUVET, ISLA':'BV',
  'BRASIL':'BR', 'BRUNEI':'BN', 'BULGARIA':'BG',
  'BURKINA FASO':'BF', 'BURUNDI':'BI', 'BUTAN':'BT',
  'CABO VERDE, REPUBLICA DE':'CV', 'CAIMAN, ISLAS':'KY', 'CAMBOYA':'KH',
  'CAMERUN':'CM', 'CANADA':'CA', 'CATAR':'QA',
  'CENTROAFRICANA, REPUBLICA':'CF', 'CHAD':'TD', 'CHECA, REPUBLICA':'CZ',
  'CHILE':'CL', 'CHINA':'CN', 'CHIPRE':'CY',
  'COCOS':'CC', 'COLOMBIA':'CO', 'COMORAS':'KM',
  'CONGO':'CG', 'CONGO, REPUBLICA DEMOCRATICA':'CD', 'COOK, ISLAS':'CK',
  'COREA DEL NORTE':'KP', 'COREA DEL SUR':'KR', 'COSTA DE MARFIL':'CI',
  'COSTA RICA':'CR', 'CROACIA':'HR', 'CUBA':'CU',
  'CURAÇAO':'CW', 'DINAMARCA':'DK', 'DOMINICA':'DM',
  'DOMINICANA, REPUBLICA':'DO', 'ECUADOR':'EC', 'EGIPTO':'EG',
  'EMIRATOS ARABES UNIDOS':'AE', 'ERITREA':'ER', 'ESLOVAQUIA':'SK',
  'ESLOVENIA':'SI', 'ESPAÑA':'ES', 'ESTADOS UNIDOS DE AMERICA':'US',
  'ESTONIA':'EE', 'ETIOPIA':'ET', 'FEROE, ISLAS':'FO',
  'FILIPINAS':'PH', 'FINLANDIA':'FI', 'FIYI':'FJ',
  'FRANCIA':'FR', 'GABON':'GA', 'GAMBIA':'GM',
  'GEORGIA':'GE', 'GEORGIA DEL SUR':'GS', 'GHANA':'GH',
  'GIBRALTAR':'GI', 'GRANADA':'GD', 'GRECIA':'GR',
  'GROENLANDIA':'GL', 'GUAM':'GU', 'GUATEMALA':'GT',
  'GUERNESEY':'GG', 'GUINEA':'GN', 'GUINEA ECUATORIAL':'GQ',
  'GUINEA-BISSAU':'GW', 'GUYANA':'GY', 'HAITI':'HT',
  'HEARD Y MCDONALD, ISLAS':'HM', 'HONDURAS':'HN', 'HONG-KONG':'HK',
  'HUNGRIA':'HU', 'INDIA':'IN', 'INDONESIA':'ID',
  'IRAN':'IR', 'IRAQ':'IQ', 'IRLANDA':'IE',
  'ISLA DE MAN':'IM', 'ISLANDIA':'IS', 'ISRAEL':'IL',
  'ITALIA':'IT', 'JAMAICA':'JM', 'JAPON':'JP',
  'JERSEY':'JE', 'JORDANIA':'JO', 'KAZAJSTAN':'KZ',
  'KENIA':'KE', 'KIRGUISTAN':'KG', 'KIRIBATI':'KI',
  'KUWAIT':'KW', 'LAOS':'LA', 'LESOTHO':'LS',
  'LETONIA':'LV', 'LIBANO':'LB', 'LIBERIA':'LR',
  'LIBIA':'LY', 'LIECHTENSTEIN':'LI', 'LITUANIA':'LT',
  'LUXEMBURGO':'LU', 'LUXEMBURGO (DI)':'LU', 'MACAO':'MO',
  'MACEDONIA':'MK', 'MADAGASCAR':'MG', 'MALASIA':'MY',
  'MALAWI':'MW', 'MALDIVAS':'MV', 'MALI':'ML',
  'MALTA':'MT', 'MALVINAS, ISLAS':'FK', 'MARIANAS DEL NORTE, ISLAS':'MP',
  'MARRUECOS':'MA', 'MARSHALL, ISLAS':'MH', 'MAURICIO':'MU',
  'MAURITANIA':'MR', 'MAYOTTE':'YT', 'MENORES ALEJADAS EE.UU, ISLAS':'UM',
  'MEXICO':'MX', 'MICRONESIA':'FM', 'MOLDAVIA':'MD',
  'MONACO':'MC', 'MONGOLIA':'MN', 'MONTENEGRO':'ME',
  'MONTSERRAT':'MS', 'MOZAMBIQUE':'MZ', 'MYANMAR':'MM',
  'NAMIBIA':'NA', 'NAURU':'NR', 'NAVIDAD, ISLA':'CX',
  'NEPAL':'NP', 'NICARAGUA':'NI', 'NIGER':'NE',
  'NIGERIA':'NG', 'NIUE, ISLA':'NU', 'NORFOLK, ISLA':'NF',
  'NORUEGA':'NO', 'NUEVA CALEDONIA':'NC', 'NUEVA ZELANDA':'NZ',
  'OCEANO INDICO, TERRI.BRITANICO':'IO', 'OMAN':'OM', 'ORGANISMOS INTERNACIONALES':'',
  'OTROS PAISES NO RELACIONADOS':'', 'PAISES BAJOS':'NL', 'PAISES BAJOS (PARTE CARIBEÑA)':'BQ',
  'PAKISTAN':'PK', 'PALAU':'PW', 'PANAMA':'PA',
  'PAPUA NUEVA GUINEA':'PG', 'PARAGUAY':'PY', 'PERU':'PE',
  'PITCAIRN':'PN', 'POLINESIA FRANCESA':'PF', 'POLONIA':'PL',
  'PORTUGAL':'PT', 'PUERTO RICO':'PR', 'REINO UNIDO':'GB',
  'RUANDA':'RW', 'RUMANIA':'RO', 'RUSIA':'RU',
  'SAHARA OCCIDENTAL':'EH', 'SALOMON, ISLAS':'SB', 'SALVADOR, EL':'SV',
  'SAMOA':'WS', 'SAMOA AMERICANA':'AS', 'SAN CRISTOBAL Y NIEVES':'KN',
  'SAN MARINO':'SM', 'SAN MARTIN':'MF', 'SAN PEDRO Y MIQUELON':'PM',
  'SAN VICENTE Y LAS GRANADINAS':'VC', 'SANTA ELENA':'SH', 'SANTA LUCIA':'LC',
  'SANTO TOME Y PRINCIPE':'ST', 'SENEGAL':'SN', 'SERBIA':'RS',
  'SEYCHELLES':'SC', 'SIERRA LEONA':'SL', 'SINGAPUR':'SG',
  'SIRIA':'SY', 'SOMALIA':'SO', 'SRI LANKA':'LK',
  'SUAZILANDIA':'SZ', 'SUDAFRICA':'ZA', 'SUDAN':'SD',
  'SUDAN DEL SUR':'SS', 'SUECIA':'SE', 'SUIZA':'CH',
  'SURINAM':'SR', 'TAILANDIA':'TH', 'TAIWAN':'TW',
  'TANZANIA':'TZ', 'TAYIKISTAN':'TJ', 'TERRITORIO PALESTINO OCUPADO':'PS',
  'TIERRAS AUSTRALES FRANCESAS':'TF', 'TIMOR LESTE':'TL', 'TOGO':'TG',
  'TOKELAU, ISLAS':'TK', 'TONGA':'TO', 'TRINIDAD Y TOBAGO':'TT',
  'TUNEZ':'TN', 'TURCAS Y CAICOS, ISLAS':'TC', 'TURKMENISTAN':'TM',
  'TURQUIA':'TR', 'TUVALU':'TV', 'UCRANIA':'UA',
  'UGANDA':'UG', 'URUGUAY':'UY', 'UZBEKISTAN':'UZ',
  'VANUATU':'VU', 'VATICANO, CIUDAD DEL':'VA', 'VENEZUELA':'VE',
  'VIETNAM':'VN', 'VIRGENES BRITANICAS, ISLAS':'VG', 'VIRGENES DE LOS EE.UU, ISLAS':'VI',
  'WALLIS Y FUTUNA, ISLAS':'WF', 'YEMEN':'YE', 'YIBUTI':'DJ',
  'ZAMBIA':'ZM', 'ZIMBABUE':'ZW'
};

// Devuelve el ISO-2 o null. NULL significa "no se puede generar el .030 con esto":
// o el pais no esta en la lista, o es una de las tres entradas que no son paises.
// Nunca devuelve '' silenciosamente, porque un codigo de pais vacio en un fichero
// que va a Hacienda es exactamente el genero de fallo que este proyecto persigue.
function paisISO(nombrePais) {
  if (nombrePais === undefined || nombrePais === null) return null;
  const clave = String(nombrePais).trim();
  if (!clave) return null;
  const iso = PAIS_ISO[clave];
  if (!iso) return null;
  return iso;
}

// ── 14/08 · Mapa de presentacion, §4.3 del contrato del informe Mobility ──────
//
// PARA QUE ES: el .030 quiere dos letras, pero el informe en PDF que el cliente
// se va a guardar quiere el nombre escrito como se escribe en espanol. La celda
// guarda 'MARRUECOS' y en un documento formal eso se lee como un grito.
//
// SE ANADE AQUI Y NO EN OTRO FICHERO porque este ya tiene las 245 claves exactas
// de las opciones de Airtable, comprobadas contra el esquema vivo. Tener dos
// listas de paises en dos ficheros es garantizar que un dia se desincronicen.
//
// PAIS_ISO Y paisISO() NO SE TOCAN: alimentan el fichero que va a Hacienda y
// estan probados 245/245. Esto es solo cosmetica y va aparte.
//
// ── LA REGLA QUE HACE ESTO COMPROBABLE ───────────────────────────────────────
// Un mapa de 245 nombres escritos a mano es un sitio perfecto para colar un pais
// que no existe sin que nadie lo note. Por eso el valor NO es texto libre: tiene
// que ser la MISMA clave con acentos y minusculas, nada mas.
//   - Claves sin coma (219): quitarAcentos(mayusculas(valor)) === clave, exacto.
//   - Claves con coma (26): se desinvierten, y el conjunto de PALABRAS de
//     quitarAcentos(mayusculas(valor)) es el mismo que el de la clave sin coma.
// Asi 'CHECA, REPUBLICA' -> 'Republica Checa' pasa y 'Republica Checa y
// Eslovaquia' no. Lo comprueba docs/test-paises-presentacion.js sobre las 245.
//
// OJO: quitarAcentos quita tildes y dieresis pero NO toca la Ñ ni la Ç, porque
// tres claves las llevan de verdad ('ESPAÑA', 'CURAÇAO' y 'PAISES BAJOS (PARTE
// CARIBEÑA)') y si se normalizasen esas tres no cuadrarian nunca.
//
// ── CUATRO QUE ROMPEN LA REGLA A PROPOSITO (§8.4, decidido el 14/08) ─────────
// Estas cuatro claves necesitan un 'del' o un 'de' que la clave no tiene, y una
// de ellas necesita ademas desabreviar 'TERRI.'. El usuario decide que se
// escriban bien, aunque eso rompa el invariante de "mismo conjunto de palabras":
//   'CONGO, REPUBLICA DEMOCRATICA'    -> 'Republica Democratica del Congo'
//   'OCEANO INDICO, TERRI.BRITANICO'  -> 'Territorio Britanico del Oceano Indico'
//   'NAVIDAD, ISLA'                   -> 'Isla de Navidad'
//   'MENORES ALEJADAS EE.UU, ISLAS'   -> 'Islas Menores Alejadas de EE.UU.'
// (los valores de verdad llevan sus acentos; aqui van sin ellos porque este
// comentario se lee tambien en sitios que no respetan el UTF-8)
//
// EL INVARIANTE NO SE AFLOJA EN GENERAL. Las otras 241 siguen con la regla
// estricta, que es lo unico que impide colar un pais inventado. Estas cuatro
// viven en una LISTA DE EXCEPCIONES EXPLICITA dentro de
// docs/test-paises-presentacion.js, con su motivo escrito y con el valor exacto
// que se espera: si alguien cambia una coma, la prueba sigue fallando. Y la
// prueba comprueba ademas que la lista tiene EXACTAMENTE estas cuatro claves,
// para que no se pueda colar una quinta como excepcion.
//
// ── LAS TRES QUE NO SON PAISES ───────────────────────────────────────────────
// 'BANCO CENTRAL EUROPEO', 'ORGANISMOS INTERNACIONALES' y 'OTROS PAISES NO
// RELACIONADOS' SI tienen presentacion, al contrario que su ISO. Aqui no hay
// nada que se pueda declarar mal: es texto para leer.

const PAIS_PRESENTACION = {
  'AFGANISTAN':'Afganistán', 'ALBANIA':'Albania',
  'ALEMANIA':'Alemania', 'ANDORRA':'Andorra',
  'ANGOLA':'Angola', 'ANGUILA':'Anguila',
  'ANTARTIDA':'Antártida', 'ANTIGUA Y BARBUDA':'Antigua y Barbuda',
  'ARABIA SAUDI':'Arabia Saudí', 'ARGELIA':'Argelia',
  'ARGENTINA':'Argentina', 'ARMENIA':'Armenia',
  'ARUBA':'Aruba', 'AUSTRALIA':'Australia',
  'AUSTRIA':'Austria', 'AZERBAIYAN':'Azerbaiyán',
  'BAHAMAS':'Bahamas', 'BAHREIN':'Bahréin',
  'BANCO CENTRAL EUROPEO':'Banco Central Europeo', 'BANGLADESH':'Bangladesh',
  'BARBADOS':'Barbados', 'BELGICA':'Bélgica',
  'BELICE':'Belice', 'BENIN':'Benín',
  'BERMUDAS':'Bermudas', 'BIELORRUSIA':'Bielorrusia',
  'BOLIVIA':'Bolivia', 'BOSNIA-HERZEGOVINA':'Bosnia-Herzegovina',
  'BOTSUANA':'Botsuana', 'BOUVET, ISLA':'Isla Bouvet',
  'BRASIL':'Brasil', 'BRUNEI':'Brunéi',
  'BULGARIA':'Bulgaria', 'BURKINA FASO':'Burkina Faso',
  'BURUNDI':'Burundi', 'BUTAN':'Bután',
  'CABO VERDE, REPUBLICA DE':'República de Cabo Verde', 'CAIMAN, ISLAS':'Islas Caimán',
  'CAMBOYA':'Camboya', 'CAMERUN':'Camerún',
  'CANADA':'Canadá', 'CATAR':'Catar',
  'CENTROAFRICANA, REPUBLICA':'República Centroafricana', 'CHAD':'Chad',
  'CHECA, REPUBLICA':'República Checa', 'CHILE':'Chile',
  'CHINA':'China', 'CHIPRE':'Chipre',
  'COCOS':'Cocos', 'COLOMBIA':'Colombia',
  'COMORAS':'Comoras', 'CONGO':'Congo',
  'CONGO, REPUBLICA DEMOCRATICA':'República Democrática del Congo', 'COOK, ISLAS':'Islas Cook',
  'COREA DEL NORTE':'Corea del Norte', 'COREA DEL SUR':'Corea del Sur',
  'COSTA DE MARFIL':'Costa de Marfil', 'COSTA RICA':'Costa Rica',
  'CROACIA':'Croacia', 'CUBA':'Cuba',
  'CURAÇAO':'Curaçao', 'DINAMARCA':'Dinamarca',
  'DOMINICA':'Dominica', 'DOMINICANA, REPUBLICA':'República Dominicana',
  'ECUADOR':'Ecuador', 'EGIPTO':'Egipto',
  'EMIRATOS ARABES UNIDOS':'Emiratos Árabes Unidos', 'ERITREA':'Eritrea',
  'ESLOVAQUIA':'Eslovaquia', 'ESLOVENIA':'Eslovenia',
  'ESPAÑA':'España', 'ESTADOS UNIDOS DE AMERICA':'Estados Unidos de América',
  'ESTONIA':'Estonia', 'ETIOPIA':'Etiopía',
  'FEROE, ISLAS':'Islas Feroe', 'FILIPINAS':'Filipinas',
  'FINLANDIA':'Finlandia', 'FIYI':'Fiyi',
  'FRANCIA':'Francia', 'GABON':'Gabón',
  'GAMBIA':'Gambia', 'GEORGIA':'Georgia',
  'GEORGIA DEL SUR':'Georgia del Sur', 'GHANA':'Ghana',
  'GIBRALTAR':'Gibraltar', 'GRANADA':'Granada',
  'GRECIA':'Grecia', 'GROENLANDIA':'Groenlandia',
  'GUAM':'Guam', 'GUATEMALA':'Guatemala',
  'GUERNESEY':'Guernesey', 'GUINEA':'Guinea',
  'GUINEA ECUATORIAL':'Guinea Ecuatorial', 'GUINEA-BISSAU':'Guinea-Bissau',
  'GUYANA':'Guyana', 'HAITI':'Haití',
  'HEARD Y MCDONALD, ISLAS':'Islas Heard y McDonald', 'HONDURAS':'Honduras',
  'HONG-KONG':'Hong-Kong', 'HUNGRIA':'Hungría',
  'INDIA':'India', 'INDONESIA':'Indonesia',
  'IRAN':'Irán', 'IRAQ':'Iraq',
  'IRLANDA':'Irlanda', 'ISLA DE MAN':'Isla de Man',
  'ISLANDIA':'Islandia', 'ISRAEL':'Israel',
  'ITALIA':'Italia', 'JAMAICA':'Jamaica',
  'JAPON':'Japón', 'JERSEY':'Jersey',
  'JORDANIA':'Jordania', 'KAZAJSTAN':'Kazajstán',
  'KENIA':'Kenia', 'KIRGUISTAN':'Kirguistán',
  'KIRIBATI':'Kiribati', 'KUWAIT':'Kuwait',
  'LAOS':'Laos', 'LESOTHO':'Lesotho',
  'LETONIA':'Letonia', 'LIBANO':'Líbano',
  'LIBERIA':'Liberia', 'LIBIA':'Libia',
  'LIECHTENSTEIN':'Liechtenstein', 'LITUANIA':'Lituania',
  'LUXEMBURGO':'Luxemburgo', 'LUXEMBURGO (DI)':'Luxemburgo (DI)',
  'MACAO':'Macao', 'MACEDONIA':'Macedonia',
  'MADAGASCAR':'Madagascar', 'MALASIA':'Malasia',
  'MALAWI':'Malawi', 'MALDIVAS':'Maldivas',
  'MALI':'Malí', 'MALTA':'Malta',
  'MALVINAS, ISLAS':'Islas Malvinas', 'MARIANAS DEL NORTE, ISLAS':'Islas Marianas del Norte',
  'MARRUECOS':'Marruecos', 'MARSHALL, ISLAS':'Islas Marshall',
  'MAURICIO':'Mauricio', 'MAURITANIA':'Mauritania',
  'MAYOTTE':'Mayotte', 'MENORES ALEJADAS EE.UU, ISLAS':'Islas Menores Alejadas de EE.UU.',
  'MEXICO':'México', 'MICRONESIA':'Micronesia',
  'MOLDAVIA':'Moldavia', 'MONACO':'Mónaco',
  'MONGOLIA':'Mongolia', 'MONTENEGRO':'Montenegro',
  'MONTSERRAT':'Montserrat', 'MOZAMBIQUE':'Mozambique',
  'MYANMAR':'Myanmar', 'NAMIBIA':'Namibia',
  'NAURU':'Nauru', 'NAVIDAD, ISLA':'Isla de Navidad',
  'NEPAL':'Nepal', 'NICARAGUA':'Nicaragua',
  'NIGER':'Níger', 'NIGERIA':'Nigeria',
  'NIUE, ISLA':'Isla Niue', 'NORFOLK, ISLA':'Isla Norfolk',
  'NORUEGA':'Noruega', 'NUEVA CALEDONIA':'Nueva Caledonia',
  'NUEVA ZELANDA':'Nueva Zelanda', 'OCEANO INDICO, TERRI.BRITANICO':'Territorio Británico del Océano Índico',
  'OMAN':'Omán', 'ORGANISMOS INTERNACIONALES':'Organismos internacionales',
  'OTROS PAISES NO RELACIONADOS':'Otros países no relacionados', 'PAISES BAJOS':'Países Bajos',
  'PAISES BAJOS (PARTE CARIBEÑA)':'Países Bajos (parte caribeña)', 'PAKISTAN':'Pakistán',
  'PALAU':'Palau', 'PANAMA':'Panamá',
  'PAPUA NUEVA GUINEA':'Papúa Nueva Guinea', 'PARAGUAY':'Paraguay',
  'PERU':'Perú', 'PITCAIRN':'Pitcairn',
  'POLINESIA FRANCESA':'Polinesia Francesa', 'POLONIA':'Polonia',
  'PORTUGAL':'Portugal', 'PUERTO RICO':'Puerto Rico',
  'REINO UNIDO':'Reino Unido', 'RUANDA':'Ruanda',
  'RUMANIA':'Rumanía', 'RUSIA':'Rusia',
  'SAHARA OCCIDENTAL':'Sáhara Occidental', 'SALOMON, ISLAS':'Islas Salomón',
  'SALVADOR, EL':'El Salvador', 'SAMOA':'Samoa',
  'SAMOA AMERICANA':'Samoa Americana', 'SAN CRISTOBAL Y NIEVES':'San Cristóbal y Nieves',
  'SAN MARINO':'San Marino', 'SAN MARTIN':'San Martín',
  'SAN PEDRO Y MIQUELON':'San Pedro y Miquelón', 'SAN VICENTE Y LAS GRANADINAS':'San Vicente y las Granadinas',
  'SANTA ELENA':'Santa Elena', 'SANTA LUCIA':'Santa Lucía',
  'SANTO TOME Y PRINCIPE':'Santo Tomé y Príncipe', 'SENEGAL':'Senegal',
  'SERBIA':'Serbia', 'SEYCHELLES':'Seychelles',
  'SIERRA LEONA':'Sierra Leona', 'SINGAPUR':'Singapur',
  'SIRIA':'Siria', 'SOMALIA':'Somalia',
  'SRI LANKA':'Sri Lanka', 'SUAZILANDIA':'Suazilandia',
  'SUDAFRICA':'Sudáfrica', 'SUDAN':'Sudán',
  'SUDAN DEL SUR':'Sudán del Sur', 'SUECIA':'Suecia',
  'SUIZA':'Suiza', 'SURINAM':'Surinam',
  'TAILANDIA':'Tailandia', 'TAIWAN':'Taiwán',
  'TANZANIA':'Tanzania', 'TAYIKISTAN':'Tayikistán',
  'TERRITORIO PALESTINO OCUPADO':'Territorio Palestino Ocupado', 'TIERRAS AUSTRALES FRANCESAS':'Tierras Australes Francesas',
  'TIMOR LESTE':'Timor Leste', 'TOGO':'Togo',
  'TOKELAU, ISLAS':'Islas Tokelau', 'TONGA':'Tonga',
  'TRINIDAD Y TOBAGO':'Trinidad y Tobago', 'TUNEZ':'Túnez',
  'TURCAS Y CAICOS, ISLAS':'Islas Turcas y Caicos', 'TURKMENISTAN':'Turkmenistán',
  'TURQUIA':'Turquía', 'TUVALU':'Tuvalu',
  'UCRANIA':'Ucrania', 'UGANDA':'Uganda',
  'URUGUAY':'Uruguay', 'UZBEKISTAN':'Uzbekistán',
  'VANUATU':'Vanuatu', 'VATICANO, CIUDAD DEL':'Ciudad del Vaticano',
  'VENEZUELA':'Venezuela', 'VIETNAM':'Vietnam',
  'VIRGENES BRITANICAS, ISLAS':'Islas Vírgenes Británicas', 'VIRGENES DE LOS EE.UU, ISLAS':'Islas Vírgenes de los EE.UU',
  'WALLIS Y FUTUNA, ISLAS':'Islas Wallis y Futuna', 'YEMEN':'Yemen',
  'YIBUTI':'Yibuti', 'ZAMBIA':'Zambia',
  'ZIMBABUE':'Zimbabue'
};

// Devuelve el nombre para imprimir. NUNCA null y NUNCA lanza: al contrario que
// paisISO(), aqui no hay nada que Hacienda pueda leer mal. Si el pais no esta en
// el mapa se devuelve la clave tal cual -- feo, en mayusculas, pero legible --
// porque abortar una memoria fiscal entera por la capitalizacion de un pais
// seria cambiar un problema cosmetico por uno de verdad.
function paisPresentacion(nombrePais) {
  // Cadena vacia y no null: el IR del informe prohibe null/undefined en celdas
  // (§1 del contrato), y este valor va derecho a una celda de tabla.
  if (nombrePais === undefined || nombrePais === null) return '';
  const clave = String(nombrePais).trim();
  if (!clave) return '';
  const presentacion = PAIS_PRESENTACION[clave];
  return presentacion !== undefined ? presentacion : clave;
}

// ── 14/08 · Mapa de presentacion en INGLES, §8.3 del contrato ────────────────
//
// PARA QUE ES: el informe se monta en dos idiomas (§8.2). Cuando la columna
// Idioma vale 'Ingles', el pais de origen tiene que salir en ingles. La celda de
// Airtable sigue guardando 'MARRUECOS', asi que hace falta un segundo mapa sobre
// las MISMAS 245 claves.
//
// ── EL INVARIANTE NO ES EL DEL ESPANOL, Y ES MEJOR ───────────────────────────
// En espanol el valor tiene que ser la misma clave con acentos, o sea que la
// prueba puede derivarlo de la propia clave. En ingles son OTRAS PALABRAS
// ('MARRUECOS' -> 'Morocco'), asi que de la clave no se deriva nada y una tabla
// de 245 nombres escritos a mano volveria a ser el sitio perfecto para colar un
// pais que no existe.
//
// Por eso el valor se ata a un ESTANDAR y no al gusto de nadie: cada valor es el
// NOMBRE CORTO EN INGLES DE ISO 3166-1 para el codigo alfa-2 que PAIS_ISO ya
// tiene para esa clave. La prueba lleva su propia tabla codigo -> nombre, ESCRITA
// APARTE de esta, y compara las dos pasando por PAIS_ISO. Si un nombre se escribe
// mal aqui, la prueba lo ve.
//
// SE RESPETA EL NOMBRE DEL ESTANDAR AUNQUE SUENE RARO EN UN PDF: 'Venezuela
// (Bolivarian Republic of)', 'Taiwan, Province of China', 'Korea, Republic of'.
// No se "arreglan" porque en el momento en que se empieza a arreglar a mano, el
// invariante deja de comprobar nada. Si Fiscal quiere otro nombre comercial para
// alguno, se anade como excepcion explicita en la prueba, igual que las cuatro
// del §8.4 en espanol, y se deja escrito el motivo.
//
// ── LAS DOS COSAS QUE NO SALEN DEL ESTANDAR ──────────────────────────────────
// 1. 'LUXEMBURGO (DI)' comparte el codigo LU con 'LUXEMBURGO'. El sufijo (DI) es
//    una distincion interna de la lista de la AEAT, no otro pais, asi que se
//    arrastra tal cual: 'Luxembourg (DI)'. La prueba lo trata como excepcion
//    declarada, no como fallo.
// 2. Las TRES que no son paises no tienen ISO y quedan EXENTAS del invariante.
//    Se traducen a mano y la prueba comprueba el literal:
//      'BANCO CENTRAL EUROPEO'        -> 'European Central Bank'
//      'ORGANISMOS INTERNACIONALES'   -> 'International organisations'
//      'OTROS PAISES NO RELACIONADOS' -> 'Other countries not listed'

const PAIS_PRESENTACION_EN = {
  'AFGANISTAN':'Afghanistan', 'ALBANIA':'Albania',
  'ALEMANIA':'Germany', 'ANDORRA':'Andorra',
  'ANGOLA':'Angola', 'ANGUILA':'Anguilla',
  'ANTARTIDA':'Antarctica', 'ANTIGUA Y BARBUDA':'Antigua and Barbuda',
  'ARABIA SAUDI':'Saudi Arabia', 'ARGELIA':'Algeria',
  'ARGENTINA':'Argentina', 'ARMENIA':'Armenia',
  'ARUBA':'Aruba', 'AUSTRALIA':'Australia',
  'AUSTRIA':'Austria', 'AZERBAIYAN':'Azerbaijan',
  'BAHAMAS':'Bahamas', 'BAHREIN':'Bahrain',
  'BANCO CENTRAL EUROPEO':'European Central Bank', 'BANGLADESH':'Bangladesh',
  'BARBADOS':'Barbados', 'BELGICA':'Belgium',
  'BELICE':'Belize', 'BENIN':'Benin',
  'BERMUDAS':'Bermuda', 'BIELORRUSIA':'Belarus',
  'BOLIVIA':'Bolivia (Plurinational State of)', 'BOSNIA-HERZEGOVINA':'Bosnia and Herzegovina',
  'BOTSUANA':'Botswana', 'BOUVET, ISLA':'Bouvet Island',
  'BRASIL':'Brazil', 'BRUNEI':'Brunei Darussalam',
  'BULGARIA':'Bulgaria', 'BURKINA FASO':'Burkina Faso',
  'BURUNDI':'Burundi', 'BUTAN':'Bhutan',
  'CABO VERDE, REPUBLICA DE':'Cabo Verde', 'CAIMAN, ISLAS':'Cayman Islands',
  'CAMBOYA':'Cambodia', 'CAMERUN':'Cameroon',
  'CANADA':'Canada', 'CATAR':'Qatar',
  'CENTROAFRICANA, REPUBLICA':'Central African Republic', 'CHAD':'Chad',
  'CHECA, REPUBLICA':'Czechia', 'CHILE':'Chile',
  'CHINA':'China', 'CHIPRE':'Cyprus',
  'COCOS':'Cocos (Keeling) Islands', 'COLOMBIA':'Colombia',
  'COMORAS':'Comoros', 'CONGO':'Congo',
  'CONGO, REPUBLICA DEMOCRATICA':'Congo, Democratic Republic of the', 'COOK, ISLAS':'Cook Islands',
  'COREA DEL NORTE':'Korea (Democratic People\'s Republic of)', 'COREA DEL SUR':'Korea, Republic of',
  'COSTA DE MARFIL':'Côte d\'Ivoire', 'COSTA RICA':'Costa Rica',
  'CROACIA':'Croatia', 'CUBA':'Cuba',
  'CURAÇAO':'Curaçao', 'DINAMARCA':'Denmark',
  'DOMINICA':'Dominica', 'DOMINICANA, REPUBLICA':'Dominican Republic',
  'ECUADOR':'Ecuador', 'EGIPTO':'Egypt',
  'EMIRATOS ARABES UNIDOS':'United Arab Emirates', 'ERITREA':'Eritrea',
  'ESLOVAQUIA':'Slovakia', 'ESLOVENIA':'Slovenia',
  'ESPAÑA':'Spain', 'ESTADOS UNIDOS DE AMERICA':'United States of America',
  'ESTONIA':'Estonia', 'ETIOPIA':'Ethiopia',
  'FEROE, ISLAS':'Faroe Islands', 'FILIPINAS':'Philippines',
  'FINLANDIA':'Finland', 'FIYI':'Fiji',
  'FRANCIA':'France', 'GABON':'Gabon',
  'GAMBIA':'Gambia', 'GEORGIA':'Georgia',
  'GEORGIA DEL SUR':'South Georgia and the South Sandwich Islands', 'GHANA':'Ghana',
  'GIBRALTAR':'Gibraltar', 'GRANADA':'Grenada',
  'GRECIA':'Greece', 'GROENLANDIA':'Greenland',
  'GUAM':'Guam', 'GUATEMALA':'Guatemala',
  'GUERNESEY':'Guernsey', 'GUINEA':'Guinea',
  'GUINEA ECUATORIAL':'Equatorial Guinea', 'GUINEA-BISSAU':'Guinea-Bissau',
  'GUYANA':'Guyana', 'HAITI':'Haiti',
  'HEARD Y MCDONALD, ISLAS':'Heard Island and McDonald Islands', 'HONDURAS':'Honduras',
  'HONG-KONG':'Hong Kong', 'HUNGRIA':'Hungary',
  'INDIA':'India', 'INDONESIA':'Indonesia',
  'IRAN':'Iran (Islamic Republic of)', 'IRAQ':'Iraq',
  'IRLANDA':'Ireland', 'ISLA DE MAN':'Isle of Man',
  'ISLANDIA':'Iceland', 'ISRAEL':'Israel',
  'ITALIA':'Italy', 'JAMAICA':'Jamaica',
  'JAPON':'Japan', 'JERSEY':'Jersey',
  'JORDANIA':'Jordan', 'KAZAJSTAN':'Kazakhstan',
  'KENIA':'Kenya', 'KIRGUISTAN':'Kyrgyzstan',
  'KIRIBATI':'Kiribati', 'KUWAIT':'Kuwait',
  'LAOS':'Lao People\'s Democratic Republic', 'LESOTHO':'Lesotho',
  'LETONIA':'Latvia', 'LIBANO':'Lebanon',
  'LIBERIA':'Liberia', 'LIBIA':'Libya',
  'LIECHTENSTEIN':'Liechtenstein', 'LITUANIA':'Lithuania',
  'LUXEMBURGO':'Luxembourg', 'LUXEMBURGO (DI)':'Luxembourg (DI)',
  'MACAO':'Macao', 'MACEDONIA':'North Macedonia',
  'MADAGASCAR':'Madagascar', 'MALASIA':'Malaysia',
  'MALAWI':'Malawi', 'MALDIVAS':'Maldives',
  'MALI':'Mali', 'MALTA':'Malta',
  'MALVINAS, ISLAS':'Falkland Islands (Malvinas)', 'MARIANAS DEL NORTE, ISLAS':'Northern Mariana Islands',
  'MARRUECOS':'Morocco', 'MARSHALL, ISLAS':'Marshall Islands',
  'MAURICIO':'Mauritius', 'MAURITANIA':'Mauritania',
  'MAYOTTE':'Mayotte', 'MENORES ALEJADAS EE.UU, ISLAS':'United States Minor Outlying Islands',
  'MEXICO':'Mexico', 'MICRONESIA':'Micronesia (Federated States of)',
  'MOLDAVIA':'Moldova, Republic of', 'MONACO':'Monaco',
  'MONGOLIA':'Mongolia', 'MONTENEGRO':'Montenegro',
  'MONTSERRAT':'Montserrat', 'MOZAMBIQUE':'Mozambique',
  'MYANMAR':'Myanmar', 'NAMIBIA':'Namibia',
  'NAURU':'Nauru', 'NAVIDAD, ISLA':'Christmas Island',
  'NEPAL':'Nepal', 'NICARAGUA':'Nicaragua',
  'NIGER':'Niger', 'NIGERIA':'Nigeria',
  'NIUE, ISLA':'Niue', 'NORFOLK, ISLA':'Norfolk Island',
  'NORUEGA':'Norway', 'NUEVA CALEDONIA':'New Caledonia',
  'NUEVA ZELANDA':'New Zealand', 'OCEANO INDICO, TERRI.BRITANICO':'British Indian Ocean Territory',
  'OMAN':'Oman', 'ORGANISMOS INTERNACIONALES':'International organisations',
  'OTROS PAISES NO RELACIONADOS':'Other countries not listed', 'PAISES BAJOS':'Netherlands',
  'PAISES BAJOS (PARTE CARIBEÑA)':'Bonaire, Sint Eustatius and Saba', 'PAKISTAN':'Pakistan',
  'PALAU':'Palau', 'PANAMA':'Panama',
  'PAPUA NUEVA GUINEA':'Papua New Guinea', 'PARAGUAY':'Paraguay',
  'PERU':'Peru', 'PITCAIRN':'Pitcairn',
  'POLINESIA FRANCESA':'French Polynesia', 'POLONIA':'Poland',
  'PORTUGAL':'Portugal', 'PUERTO RICO':'Puerto Rico',
  'REINO UNIDO':'United Kingdom of Great Britain and Northern Ireland', 'RUANDA':'Rwanda',
  'RUMANIA':'Romania', 'RUSIA':'Russian Federation',
  'SAHARA OCCIDENTAL':'Western Sahara', 'SALOMON, ISLAS':'Solomon Islands',
  'SALVADOR, EL':'El Salvador', 'SAMOA':'Samoa',
  'SAMOA AMERICANA':'American Samoa', 'SAN CRISTOBAL Y NIEVES':'Saint Kitts and Nevis',
  'SAN MARINO':'San Marino', 'SAN MARTIN':'Saint Martin (French part)',
  'SAN PEDRO Y MIQUELON':'Saint Pierre and Miquelon', 'SAN VICENTE Y LAS GRANADINAS':'Saint Vincent and the Grenadines',
  'SANTA ELENA':'Saint Helena, Ascension and Tristan da Cunha', 'SANTA LUCIA':'Saint Lucia',
  'SANTO TOME Y PRINCIPE':'Sao Tome and Principe', 'SENEGAL':'Senegal',
  'SERBIA':'Serbia', 'SEYCHELLES':'Seychelles',
  'SIERRA LEONA':'Sierra Leone', 'SINGAPUR':'Singapore',
  'SIRIA':'Syrian Arab Republic', 'SOMALIA':'Somalia',
  'SRI LANKA':'Sri Lanka', 'SUAZILANDIA':'Eswatini',
  'SUDAFRICA':'South Africa', 'SUDAN':'Sudan',
  'SUDAN DEL SUR':'South Sudan', 'SUECIA':'Sweden',
  'SUIZA':'Switzerland', 'SURINAM':'Suriname',
  'TAILANDIA':'Thailand', 'TAIWAN':'Taiwan, Province of China',
  'TANZANIA':'Tanzania, United Republic of', 'TAYIKISTAN':'Tajikistan',
  'TERRITORIO PALESTINO OCUPADO':'Palestine, State of', 'TIERRAS AUSTRALES FRANCESAS':'French Southern Territories',
  'TIMOR LESTE':'Timor-Leste', 'TOGO':'Togo',
  'TOKELAU, ISLAS':'Tokelau', 'TONGA':'Tonga',
  'TRINIDAD Y TOBAGO':'Trinidad and Tobago', 'TUNEZ':'Tunisia',
  'TURCAS Y CAICOS, ISLAS':'Turks and Caicos Islands', 'TURKMENISTAN':'Turkmenistan',
  'TURQUIA':'Türkiye', 'TUVALU':'Tuvalu',
  'UCRANIA':'Ukraine', 'UGANDA':'Uganda',
  'URUGUAY':'Uruguay', 'UZBEKISTAN':'Uzbekistan',
  'VANUATU':'Vanuatu', 'VATICANO, CIUDAD DEL':'Holy See',
  'VENEZUELA':'Venezuela (Bolivarian Republic of)', 'VIETNAM':'Viet Nam',
  'VIRGENES BRITANICAS, ISLAS':'Virgin Islands (British)', 'VIRGENES DE LOS EE.UU, ISLAS':'Virgin Islands (U.S.)',
  'WALLIS Y FUTUNA, ISLAS':'Wallis and Futuna', 'YEMEN':'Yemen',
  'YIBUTI':'Djibouti', 'ZAMBIA':'Zambia',
  'ZIMBABUE':'Zimbabwe'
};

// Misma regla de ultima instancia que paisPresentacion(): si el pais no esta en
// el mapa se devuelve la clave tal cual y el informe sigue saliendo. NUNCA null,
// porque este valor va derecho a una celda del IR y el §1 del contrato prohibe
// null y undefined en las celdas.
function paisPresentacionEn(nombrePais) {
  if (nombrePais === undefined || nombrePais === null) return '';
  const clave = String(nombrePais).trim();
  if (!clave) return '';
  const presentacion = PAIS_PRESENTACION_EN[clave];
  return presentacion !== undefined ? presentacion : clave;
}

// ==================== informe-datos-2026-08-14.js ====================
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

// ==================== informe-cuerpo-2026-08-14.js ====================
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

// ==================== nodo-informe-glue-2026-08-14.js ====================
// ============================================================================
// NODO «Montar el informe» · workflow beckham_informe_mobility · 14/08/2026
// ----------------------------------------------------------------------------
// El trozo que ata las cinco piezas que van concatenadas delante:
//   metrica-helvetica · pdf-motor · tabla-paises-iso2 · informe-datos · informe-cuerpo
//
// UNA ENTRADA POR FILA DE AIRTABLE, UNA SALIDA POR FILA. La salida NUNCA lanza
// excepcion: si algo falta sale {ok:false, error:'...'} y el resto del workflow
// lo escribe en ErrorInforme. Que una fila no se pueda montar NO puede tumbar
// las demas. Es la misma regla que el nodo del .030.
//
// LA CADENA, en tres pasos y en este orden:
//   1. resolverDatos(fila)      -> los 17 marcadores + los dos bloques, o el motivo
//   2. montarElementos(datos)   -> el array de elementos (el IR del contrato §1)
//   3. construirPdf(elementos)  -> los bytes del PDF
// Cada paso puede parar, y cada parada tiene un motivo legible en cristiano.
// ============================================================================

// --- Nombre del fichero -----------------------------------------------------
// Lo ve el cliente en su correo, asi que lleva su nombre y no un identificador.
// SE LIMPIAN LAS BARRAS Y LOS DOS PUNTOS: en un nombre de fichero adjunto una
// barra puede partir la ruta, y hay clientes de correo que se atragantan. Los
// acentos SI se dejan: el nombre del fichero va en UTF-8, no en el PDF, y aqui
// no hay ninguna casilla posicional que se desplace.
function nombreDelFichero(nombreCompleto) {
  const limpio = String(nombreCompleto || '')
    .replace(/[\/\\:*?"<>|]/g, ' ')   // lo que rompe nombres de fichero
    .replace(/\s+/g, ' ')
    .trim();
  return 'Informe Mobility - ' + (limpio || 'sin nombre') + '.pdf';
}

// --- El montaje de una fila -------------------------------------------------
function montarInformeDeFila(fila) {
  const f = fila.fields || fila;

  // 1 · Los datos. Aqui se decide si hay informe o no: sin fecha de
  // desplazamiento no hay años ni bloques, y con una situacion fiscal que no
  // reconozcamos se para A PROPOSITO. Un informe con el regimen fiscal
  // equivocado es peor que no mandar informe, porque el cliente lo va a guardar.
  const r = resolverDatos(f);
  if (!r.ok) return { ok: false, error: r.error };

  // 2 y 3 · El cuerpo y el PDF. Van en el try porque montarElementos LANZA a
  // proposito si se le ha quedado un '{{' sin resolver (la guarda del §5.6 del
  // contrato), y eso tiene que salir como error de la fila, no como caida del
  // nodo entero.
  try {
    const elementos = montarElementos(r.datos);
    const pdf = construirPdf(elementos, {
      titulo: 'Informe de memoria fiscal — ' + r.datos.nombreCompleto,
      autor: 'TaxDown Mobility',
    });

    // Guarda de cordura: un PDF de menos de 1 KB o de una sola pagina significa
    // que el cuerpo ha salido vacio, y eso NO puede llegar a un cliente. Mas
    // vale una fila en error que una memoria fiscal en blanco.
    if (!pdf || !pdf.bytes || pdf.bytes.length < 1024) {
      return { ok: false, error: 'No se genera el informe: el PDF ha salido vacio o truncado (' +
                                 (pdf && pdf.bytes ? pdf.bytes.length : 0) + ' bytes).' };
    }

    return {
      ok: true,
      nombreFichero: nombreDelFichero(r.datos.nombreCompleto),
      // El endpoint de adjuntos de Airtable quiere el fichero en base64.
      // OJO: aqui NO se convierte de latin-1 como en el .030. Los bytes que
      // devuelve el motor YA son los bytes finales del PDF (WinAnsi dentro de
      // los flujos de texto), asi que se pasan a base64 tal cual. Volver a
      // codificarlos romperia el fichero.
      base64: pdf.bytes.toString('base64'),
      bytes: pdf.bytes.length,
      paginas: pdf.paginas,
      // Se devuelven los dos bloques elegidos para poder verlos en la ejecucion
      // sin abrir el PDF. Ha salvado depuraciones enteras en el .030.
      bloque1: r.datos.bloque1,
      bloque2: r.datos.bloque2,
    };
  } catch (e) {
    return { ok: false, error: 'No se genera el informe: ' + (e && e.message ? e.message : String(e)) };
  }
}

// --- Salida del nodo --------------------------------------------------------
const salida = [];
for (const item of $input.all()) {
  const fila = item.json;
  const f = fila.fields || fila;
  const recordId = fila.id || fila.recordId;
  const r = montarInformeDeFila(fila);
  salida.push({
    json: Object.assign({
      recordId: recordId,
      nif: f['NIF'] || '',
      nombre_completo: f['Nombre completo'] || '',
    }, r),
  });
}
return salida;
