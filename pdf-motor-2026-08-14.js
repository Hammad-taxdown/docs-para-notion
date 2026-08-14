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

if (typeof module !== 'undefined') { module.exports = { construirPdf, anchoTexto, cortarEnLineas, aWinAnsi, escapar, CONSTANTES_PDF, CODIGO_WINANSI, VINETA }; }
