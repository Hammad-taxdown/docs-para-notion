// PRUEBA DEL MOTOR DEL PDF · 14/08/2026
// ============================================================================
// El motor NO se puede probar con require() a secas: exige que
// metrica-helvetica-2026-08-14.js vaya concatenada delante, y si no esta lanza
// "PDF: no encuentro la metrica de Helvetica-Bold". Eso es lo correcto (falla en
// voz alta en vez de medir 0 y solapar el texto), pero obliga a montar el ambito
// concatenado con vm, igual que hara el nodo de n8n.
//
// QUE COMPRUEBA, y por que cada cosa:
//   1. Los ayudantes sueltos: escapar, aWinAnsi, cortarEnLineas, anchoTexto.
//   2. La ESTRUCTURA del PDF: la xref apunta byte a byte a cada objeto. Si un
//      offset esta mal por UNO, el lector no abre el fichero y no hay aviso.
//   3. El TEXTO DE VUELTA: se extrae de los operadores Tj y se decodifica de
//      WinAnsi. Es el equivalente al cmp byte a byte del .030: que "parezca" un
//      PDF no vale, hay que poder volver a leer lo que se escribio.
//   4. Que un LECTOR DE PDF DE VERDAD lo abre. Se usa qlmanage de macOS, que
//      renderiza con Quartz. Es la unica comprobacion que no depende de mis
//      propias expresiones regulares.
//
// Se ejecuta con: node docs/test-pdf-motor.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const { execFileSync } = require('child_process');

// ── El ambito concatenado, igual que el nodo ─────────────────────────────────
const ctx = { console, Buffer, Intl, module: { exports: {} } };
vm.createContext(ctx);
for (const f of ['metrica-helvetica-2026-08-14.js', 'pdf-motor-2026-08-14.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx);
}
const llamar = (expr) => { ctx.__r = undefined; vm.runInContext('__r = ' + expr, ctx); return ctx.__r; };

let fallos = 0;
const comprobar = (q, bien, detalle) => {
  console.log((bien ? 'OK    ' : 'FALLA ') + q.padEnd(58) + (detalle === undefined ? '' : detalle));
  if (!bien) fallos++;
};

// ── 1 · Los ayudantes ────────────────────────────────────────────────────────
console.log('── 1. los ayudantes ──');
const C = llamar('CONSTANTES_PDF');
comprobar('A4 = 595.28 x 841.89', C.PAG_ANCHO === 595.28 && C.PAG_ALTO === 841.89,
          C.PAG_ANCHO + ' x ' + C.PAG_ALTO);
comprobar('margen 56 y ancho util 483.28', C.MARGEN === 56 && C.ANCHO_UTIL === 483.28,
          C.MARGEN + ' / ' + C.ANCHO_UTIL);
// §9.1: al pasar a Times se subio el cuerpo de 10.5/14 a 11/15, porque la Times
// tiene la altura de la x mas pequena y al mismo cuerpo se lee mas pequena.
comprobar('cuerpo 11 con interlinea 15 (Times, §9.1)',
          C.CUERPO_TAM === 11 && C.CUERPO_INTER === 15, C.CUERPO_TAM + ' / ' + C.CUERPO_INTER);

// escapar: sin esto, un parentesis del texto parte el fichero entero.
ctx.__t = 'con (parentesis) y barra \\ dentro';
comprobar('escapar tapa ( ) y la barra invertida',
          llamar('escapar(__t)') === 'con \\(parentesis\\) y barra \\\\ dentro',
          JSON.stringify(llamar('escapar(__t)')));

// aWinAnsi: OJO, no es latin-1. En 0x80-0x9F WinAnsi lleva tipograficos, y el
// informe usa el guion largo y las comillas curvas.
const pares = [['Ñ', 0xD1], ['á', 0xE1], ['é', 0xE9], ['ó', 0xF3], ['ü', 0xFC], ['ç', 0xE7],
               ['º', 0xBA], ['—', 0x97], ['–', 0x96], ['“', 0x93], ['”', 0x94], ['·', 0xB7]];
let winMal = [];
for (const [ch, esperado] of pares) {
  ctx.__c = ch;
  const b = llamar('aWinAnsi(__c)');
  if (!(b.length === 1 && b[0] === esperado)) winMal.push(ch + '->' + [...b].map((x) => '0x' + x.toString(16)));
}
comprobar('aWinAnsi: cada acento y tipografico en UN byte', winMal.length === 0,
          winMal.length ? winMal.join(' ') : pares.length + ' caracteres, uno cada uno');
// LO QUE NO CABE EN WinAnsi: hay DOS comportamientos distintos y los dos son los
// buenos, los mismos que aLatin1() del .030. Mi primera version de esta prueba
// esperaba que se cayera TODO, y estaba mal:
//   - Letra latina con una tilde que WinAnsi no tiene -> SE QUITA LA TILDE y se
//     queda la letra. Mejor una 'z' legible que un hueco en la palabra.
//   - Lo que no es representable de ninguna manera (un ideograma) -> se cae.
ctx.__c = 'ż';
comprobar('una tilde que no cabe se quita y la letra se queda',
          llamar('aWinAnsi(__c)').toString('latin1') === 'z',
          JSON.stringify(llamar('aWinAnsi(__c)').toString('latin1')));
ctx.__c = 'ǎőș';
comprobar('varias tildes que no caben: quedan las letras',
          llamar('aWinAnsi(__c)').toString('latin1') === 'aos',
          JSON.stringify(llamar('aWinAnsi(__c)').toString('latin1')));
ctx.__c = '中';
comprobar('lo irrepresentable se cae y NO desplaza', llamar('aWinAnsi(__c)').length === 0,
          llamar('aWinAnsi(__c)').length + ' bytes');

comprobar('cadena vacia da una linea vacia',
          JSON.stringify(llamar('cortarEnLineas("", false, 10.5, 60)')) === '[""]');
comprobar('una palabra mas larga que el ancho se corta a lo bruto',
          llamar('cortarEnLineas("palabrainterminablequenocabedeningunamanera", false, 10.5, 60)').length > 1,
          llamar('cortarEnLineas("palabrainterminablequenocabedeningunamanera", false, 10.5, 60)').length + ' lineas');
comprobar('los dobles espacios se juntan',
          llamar('cortarEnLineas("dos  espacios  seguidos", false, 10.5, 400)')[0] === 'dos espacios seguidos');
const ancho = llamar('anchoTexto("Hammad", false, 10.5)');
comprobar('anchoTexto("Hammad", 10.5) = 42.588 pt', Math.abs(ancho - 42.588) < 0.001, ancho + ' pt');
comprobar('ninguna linea cortada pasa del ancho pedido', (() => {
  const ls = llamar('cortarEnLineas("' + 'palabra '.repeat(60).trim() + '", false, 10.5, 200)');
  for (const l of ls) { ctx.__l = l; if (llamar('anchoTexto(__l, false, 10.5)') > 200.5) return false; }
  return true;
})());

// ── 2 · Un PDF de verdad, con los siete tipos del IR ────────────────────────
console.log('\n── 2. la estructura del PDF ──');
ctx.__els = [
  { tipo: 'titulo1', texto: 'BLOQUE DE PRUEBA — ÑÁÉÍÓÚ ü ç' },
  { tipo: 'campo', etiqueta: 'Nombre', valor: 'Hammad Bellachhab' },
  { tipo: 'campo', etiqueta: 'País de origen', valor: 'Marruecos' },
  { tipo: 'titulo2', texto: 'Un apartado con tilde en tributación' },
  { tipo: 'parrafo', texto: 'Parrafo con (parentesis), una barra \\ invertida, comillas “curvas”, ' +
    'un guion largo — y una tilde. ' + 'Relleno para forzar varias lineas. '.repeat(14) },
  { tipo: 'lista', items: ['Primero', 'Segundo con Ñ', 'Tercero con (parentesis)'] },
  { tipo: 'tabla', titulo: 'Resumen', cabecera: ['Concepto', 'Situación'], anchos: [0.38, 0.62],
    filas: Array.from({ length: 46 }, (_, i) => ['Situación en ' + (2000 + i),
      'No residente NO UE, con una celda larga que obliga a cortar la linea dentro de la propia celda']) },
  { tipo: 'saltoPagina' },
  { tipo: 'titulo1', texto: 'DESPUES DEL SALTO DE PAGINA' },
  { tipo: 'parrafo', texto: 'Esto tiene que caer en una pagina nueva.' },
];
const r = llamar('construirPdf(__els, { titulo: "Prueba del motor", autor: "TaxDown Mobility" })');
const pdf = r.bytes;
const t = pdf.toString('latin1');

comprobar('devuelve bytes y paginas', Buffer.isBuffer(pdf) && typeof r.paginas === 'number',
          pdf.length + ' bytes, ' + r.paginas + ' paginas');
comprobar('empieza por %PDF-', t.startsWith('%PDF-'), JSON.stringify(t.slice(0, 8)));
comprobar('acaba en %%EOF', /%%EOF\s*$/.test(t.slice(-16)));
comprobar('el salto de pagina forzado produce mas de una pagina', r.paginas >= 4, r.paginas + ' paginas');

const mStart = t.match(/startxref\s+(\d+)\s+%%EOF/);
comprobar('hay startxref', !!mStart);
const posXref = mStart ? Number(mStart[1]) : -1;
comprobar('startxref apunta a la palabra xref', t.slice(posXref, posXref + 4) === 'xref',
          JSON.stringify(t.slice(posXref, posXref + 10)));
const cab = t.slice(posXref).match(/xref\s+(\d+)\s+(\d+)\s/);
const entradas = [...t.slice(posXref).matchAll(/(\d{10}) (\d{5}) ([nf])/g)];
comprobar('una entrada de xref por objeto', cab && entradas.length === Number(cab[2]),
          entradas.length + ' de ' + (cab ? cab[2] : '?'));
let offMal = 0;
for (let i = 1; i < entradas.length; i++) {
  const off = Number(entradas[i][1]);
  if (!new RegExp('^' + i + '\\s+0\\s+obj').test(t.slice(off, off + 24))) {
    offMal++;
    if (offMal <= 3) console.log('        objeto ' + i + ' deberia empezar en ' + off + ' y hay ' +
                                 JSON.stringify(t.slice(off, off + 18)));
  }
}
comprobar('TODOS los offsets de la xref caen en su objeto', offMal === 0,
          offMal ? offMal + ' mal' : (entradas.length - 1) + ' offsets buenos');

let lenMal = 0, flujos = 0;
for (const m of t.matchAll(/\/Length\s+(\d+)\s*>>\s*stream\r?\n/g)) {
  flujos++;
  const ini = m.index + m[0].length;
  const real = t.indexOf('endstream', ini) - ini;
  if (Math.abs(real - Number(m[1])) > 2) lenMal++;
}
comprobar('los /Length coinciden con el largo real del flujo', lenMal === 0,
          flujos + ' flujos, ' + lenMal + ' mal');
comprobar('las dos fuentes declaran /WinAnsiEncoding',
          (t.match(/\/WinAnsiEncoding/g) || []).length === 2,
          (t.match(/\/WinAnsiEncoding/g) || []).length + ' veces');
comprobar('/Count coincide con las paginas',
          Number((t.match(/\/Count\s+(\d+)/) || [])[1]) === r.paginas);
comprobar('no hay ni un require ni zlib: flujos sin comprimir', !/FlateDecode/.test(t));
// EL /Info NO LLEVA EL TEXTO EN CLARO, y eso es lo correcto: el motor escribe
// /Title y /Author en HEXADECIMAL UTF-16BE con BOM (FEFF), porque una cadena
// literal en /Info se interpreta como PDFDocEncoding y los acentos y la raya
// larga del titulo saldrian mal en la ventana del lector. Mi primera version de
// esta prueba buscaba el texto en claro y por eso fallaba.
const hexes = [...t.matchAll(/\/(Title|Author)\s+<([0-9A-Fa-f]+)>/g)];
comprobar('/Title y /Author van en hexadecimal', hexes.length === 2,
          hexes.map((h) => h[1]).join(' , '));
const deHexUtf16 = (hex) => {
  const b = Buffer.from(hex, 'hex');
  let s = '';
  for (let i = 2; i + 1 < b.length; i += 2) s += String.fromCharCode((b[i] << 8) | b[i + 1]);
  return s;
};
comprobar('llevan el BOM FEFF delante',
          hexes.length === 2 && hexes.every((h) => h[2].toUpperCase().startsWith('FEFF')),
          hexes.map((h) => h[2].slice(0, 4)).join(' , '));
comprobar('descodificados dan el titulo y el autor de verdad',
          hexes.length === 2 && deHexUtf16(hexes[0][2]) === 'Prueba del motor' &&
          deHexUtf16(hexes[1][2]) === 'TaxDown Mobility',
          hexes.length === 2 ? JSON.stringify(deHexUtf16(hexes[0][2])) + ' , ' +
                               JSON.stringify(deHexUtf16(hexes[1][2])) : '');
comprobar('el trailer apunta al /Info', /trailer[\s\S]{0,120}\/Info\s+\d+\s+0\s+R/.test(t));

// ── 3 · El texto de vuelta ───────────────────────────────────────────────────
console.log('\n── 3. el texto que lleva dentro ──');
const INV = { 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”',
              0x95: '•', 0x96: '–', 0x97: '—', 0x85: '…' };
let dentro = '';
for (const m of t.matchAll(/\(((?:\\.|[^\\()])*)\)\s*Tj/g)) {
  const crudo = m[1].replace(/\\([\\()])/g, '$1');
  let s = '';
  for (const b of Buffer.from(crudo, 'latin1')) s += INV[b] || String.fromCharCode(b);
  dentro += s + '\n';
}
comprobar('se recupera texto', dentro.length > 1500, dentro.length + ' caracteres');
for (const [q, aguja] of [
  ['la N con virgulilla', 'ÑÁÉÍÓÚ'],
  ['la u con dieresis y la c con cedilla', 'ü ç'],
  ['una tilde dentro de una palabra', 'tributación'],
  ['los parentesis del texto, sin escapar', '(parentesis)'],
  ['la barra invertida', '\\'],
  ['las comillas curvas', '“curvas”'],
  ['el guion largo', '—'],
  ['la cabecera de la tabla', 'Situación'],
  ['el texto de despues del salto de pagina', 'DESPUES DEL SALTO DE PAGINA'],
]) comprobar(q, dentro.includes(aguja), JSON.stringify(aguja));

// La cabecera de la tabla se repite en cada pagina que la tabla ocupa.
const veces = (dentro.match(/Concepto/g) || []).length;
comprobar('la cabecera de la tabla se REPITE al pasar de pagina', veces >= 2, veces + ' veces');

// ── 4 · Lo abre un lector de PDF de verdad ──────────────────────────────────
console.log('\n── 4. lo abre un lector de PDF de verdad ──');
const ruta = '/tmp/test-pdf-motor.pdf';
fs.writeFileSync(ruta, pdf);
try {
  execFileSync('/usr/bin/qlmanage', ['-t', '-s', '200', '-o', '/tmp'], { stdio: 'pipe' });
} catch (e) { /* el primer aviso de qlmanage no importa */ }
try {
  const salida = execFileSync('/usr/bin/qlmanage', ['-t', '-s', '200', '-o', '/tmp', ruta],
                              { stdio: 'pipe' }).toString();
  const png = '/tmp/test-pdf-motor.pdf.png';
  comprobar('qlmanage (Quartz) lo renderiza', /produced one thumbnail/.test(salida) && fs.existsSync(png),
            fs.existsSync(png) ? fs.statSync(png).size + ' bytes de PNG' : salida.trim().slice(0, 60));
} catch (e) {
  console.log('SALTA qlmanage no esta disponible: ' + (e.message || '').slice(0, 60));
}

console.log('\nPDF de la prueba en ' + ruta + ' (' + pdf.length + ' bytes, ' + r.paginas + ' paginas).');
console.log(fallos ? '\n' + fallos + ' FALLAN' : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
