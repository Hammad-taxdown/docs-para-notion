// COTEJO INDEPENDIENTE DE LA TABLA DE ANCHOS DE HELVETICA · 14/08/2026
// ============================================================================
// POR QUE EXISTE. Los anchos de docs/metrica-helvetica-2026-08-14.js son los del
// estandar de las 14 fuentes base de PDF, y se escribieron DE MEMORIA: en esta
// maquina no hay ningun .afm (se busco en todo el disco: no hay ghostscript, ni
// texlive, ni fontforge, ni NimbusSans). Una tabla de anchos escrita de memoria
// no rompe el PDF, pero desplaza los cortes de linea, y eso sale en un documento
// que el cliente guarda.
//
// QUE HACE. Coteja la tabla contra la Helvetica de macOS, que es una fuente de
// datos COMPLETAMENTE INDEPENDIENTE: /System/Library/Fonts/Helvetica.ttc, con
// Helvetica y Helvetica-Bold de verdad. Parser TTF minimo escrito aqui (head,
// hhea, hmtx y cmap formato 4). Sin librerias: instalar algo dejaria de ser una
// comprobacion independiente y pasaria a ser otra dependencia.
//
// RESULTADO DEL 14/08, y es la razon de que la tabla se de por buena:
//   214 de 218 codigos coinciden EXACTO en las dos fuentes.
//   Las 4 diferencias son divergencias reales entre el diseno de Apple y el AFM
//   de Adobe, y en las cuatro NUESTRO VALOR ES EL DE ADOBE, que es el que usa un
//   lector de PDF cuando la fuente no va incrustada:
//     € (128)  nuestro 556  Apple 744
//     ± (177)  nuestro 584  Apple 549
//     ÷ (247)  nuestro 584  Apple 549
//     µ (181)  nuestro 556/611  Apple 576
//   NINGUNO DE LOS CUATRO APARECE EN EL INFORME (comprobado sobre la plantilla y
//   sobre el cuerpo montado: cero apariciones). El salario se imprime '345.678' y
//   la plantilla escribe 'euros' con letras, no con el simbolo.
//
// SI ESTA PRUEBA SE PONE ROJA algun dia, lo primero que hay que mirar es si Apple
// ha cambiado su Helvetica, no si nuestra tabla esta mal: manda el AFM de Adobe.
// Se ejecuta con: node docs/test-metrica-helvetica-cotejo-sistema.js
const fs = require('fs');
const { ANCHOS_HELVETICA, ANCHOS_HELVETICA_BOLD } = require('./metrica-helvetica-2026-08-14.js');

const RUTA = '/System/Library/Fonts/Helvetica.ttc';
const TOLERADAS = { 128: '€ Adobe 556 vs Apple 744', 177: '± Adobe 584 vs Apple 549',
                    181: 'µ Adobe 556/611 vs Apple 576', 247: '÷ Adobe 584 vs Apple 549' };

// --- Parser TTF, lo minimo para sacar anchos ---------------------------------
const u16 = (b, o) => b.readUInt16BE(o);
const s16 = (b, o) => b.readInt16BE(o);
const u32 = (b, o) => b.readUInt32BE(o);

function fuentesDelFichero(b) {
  // Un .ttc es una coleccion: cabecera 'ttcf' y luego los desplazamientos.
  if (b.slice(0, 4).toString('latin1') === 'ttcf') {
    const n = u32(b, 8);
    return Array.from({ length: n }, (_, i) => u32(b, 12 + 4 * i));
  }
  return [0];
}

function tablasDe(b, off) {
  const num = u16(b, off + 4);
  const t = {};
  for (let i = 0; i < num; i++) {
    const p = off + 12 + i * 16;
    t[b.slice(p, p + 4).toString('latin1')] = u32(b, p + 8);
  }
  return t;
}

// El nombre va en utf-16 BIG endian y node solo trae el little: se arma por pares.
function utf16be(buf) {
  let s = '';
  for (let i = 0; i + 1 < buf.length; i += 2) s += String.fromCharCode((buf[i] << 8) | buf[i + 1]);
  return s;
}

function nombreBueno(b, t) {
  if (!t.name) return '?';
  const off = t.name, cuenta = u16(b, off + 2), zona = off + u16(b, off + 4);
  for (let i = 0; i < cuenta; i++) {
    const p = off + 6 + i * 12;
    if (u16(b, p + 6) !== 6) continue;
    const largo = u16(b, p + 8), desp = u16(b, p + 10);
    const cru = b.slice(zona + desp, zona + desp + largo);
    const txt = cru.includes(0) ? utf16be(cru) : cru.toString('latin1');
    if (txt) return txt;
  }
  return '?';
}

function cmapUnicode(b, t) {
  const off = t.cmap, n = u16(b, off + 2);
  let elegida = null;
  for (let i = 0; i < n; i++) {
    const p = off + 4 + i * 8;
    const plat = u16(b, p), enc = u16(b, p + 2), desp = u32(b, p + 4);
    const par = plat + ':' + enc;
    if (['3:1', '3:10', '0:3', '0:4', '0:6'].includes(par)) {
      elegida = off + desp;
      if (par === '3:1') break;
    }
  }
  const mapa = new Map();
  if (elegida === null || u16(b, elegida) !== 4) return mapa;
  const segX2 = u16(b, elegida + 6), seg = segX2 / 2;
  const fin = elegida + 14, ini = fin + segX2 + 2, delta = ini + segX2, rango = delta + segX2;
  for (let s = 0; s < seg; s++) {
    const e = u16(b, fin + s * 2), i0 = u16(b, ini + s * 2);
    const d = s16(b, delta + s * 2), r = u16(b, rango + s * 2);
    if (i0 > e) continue;
    for (let c = i0; c <= Math.min(e, 0xFFFF); c++) {
      let g;
      if (r === 0) g = (c + d) & 0xFFFF;
      else {
        const dir = rango + s * 2 + r + (c - i0) * 2;
        if (dir + 2 > b.length) continue;
        g = u16(b, dir);
        if (g) g = (g + d) & 0xFFFF;
      }
      if (g) mapa.set(c, g);
    }
  }
  return mapa;
}

function anchosDe(b, t, cmap) {
  const upem = u16(b, t.head + 18);
  const nmetrics = u16(b, t.hhea + 34);
  const an = new Map();
  for (const [c, g] of cmap) {
    const idx = g < nmetrics ? g : nmetrics - 1;
    an.set(c, u16(b, t.hmtx + idx * 4));
  }
  return { upem, an };
}

// --- WinAnsi -> Unicode -------------------------------------------------------
// De 32 a 126 y de 0xA0 a 0xFF es la identidad. EL TRAMO 0x80-0x9F NO ES LATIN-1:
// WinAnsi mete ahi las comillas tipograficas, el guion largo y demas, y el
// informe los usa. Por eso van uno a uno.
const WINANSI = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026, 0x86: 0x2020,
  0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x0152,
  0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022,
  0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A,
  0x9C: 0x0153, 0x9E: 0x017E, 0x9F: 0x0178,
};
const aUnicode = (c) => (c >= 32 && c <= 126) || (c >= 0xA0 && c <= 0xFF) ? c : WINANSI[c];

// --- El cotejo ----------------------------------------------------------------
if (!fs.existsSync(RUTA)) {
  console.log('SALTA: no existe ' + RUTA + '. Este cotejo solo corre en macOS.');
  process.exit(0);
}
const b = fs.readFileSync(RUTA);
const porNombre = {};
for (const off of fuentesDelFichero(b)) {
  const t = tablasDe(b, off);
  if (!(t.head && t.hhea && t.hmtx && t.cmap)) continue;
  porNombre[nombreBueno(b, t)] = t;
}

let fallos = 0;
for (const [fuente, tabla] of [['Helvetica', ANCHOS_HELVETICA], ['Helvetica-Bold', ANCHOS_HELVETICA_BOLD]]) {
  const t = porNombre[fuente];
  if (!t) { console.log('FALLA no encuentro ' + fuente + ' dentro del .ttc'); fallos++; continue; }
  const { upem, an } = anchosDe(b, t, cmapUnicode(b, t));
  let iguales = 0; const inesperadas = [];
  for (let c = 32; c < 256; c++) {
    const u = aUnicode(c);
    if (u === undefined) continue;
    const nuestro = Array.isArray(tabla) ? tabla[c] : tabla[c];
    if (!nuestro) continue;
    if (!an.has(u)) continue;
    const sistema = Math.round(an.get(u) * 1000 / upem);
    if (sistema === nuestro) iguales++;
    else if (!TOLERADAS[c]) inesperadas.push(c + ' ' + JSON.stringify(String.fromCharCode(u)) +
                                             ' nuestro=' + nuestro + ' sistema=' + sistema);
  }
  const marca = inesperadas.length === 0 ? 'OK   ' : 'FALLA';
  if (inesperadas.length) fallos++;
  console.log(marca + ' ' + fuente.padEnd(16) + ' ' + iguales + ' codigos coinciden EXACTO con la ' +
              'fuente del sistema (upem ' + upem + ')');
  for (const x of inesperadas) console.log('        DIFERENCIA NO ESPERADA: ' + x);
}

console.log('');
console.log('Las 4 diferencias toleradas, todas Adobe contra Apple y ninguna presente en el informe:');
for (const [c, texto] of Object.entries(TOLERADAS)) console.log('  codigo ' + c + ': ' + texto);
console.log('');
console.log(fallos ? fallos + ' FUENTES CON DIFERENCIAS NO ESPERADAS' : 'COTEJO LIMPIO');
