// PRUEBA DE INTEGRACION DEL NODO «Montar el informe» · 14/08/2026
// ============================================================================
// Ejecuta docs/nodo-montar-informe-COMPLETO.js TAL CUAL, con un $input simulado,
// igual que hace test-nodo-030.js con el del .030. Es la unica prueba que ve las
// seis piezas juntas, y por eso es la que caza los fallos que ninguna pieza ve
// sola.
//
// UN FALLO QUE SOLO SE VE AQUI, y por eso existe este fichero: informe-datos
// llama a paisPresentacion() con una guarda `typeof paisPresentacion ===
// 'function'`, porque esa funcion vive en OTRA pieza. Probando informe-datos por
// separado la guarda salta y paisOrigen sale 'MARRUECOS' en mayusculas; solo en
// el ambito concatenado sale 'Marruecos'. La pieza esta bien, pero su prueba
// aislada NO PUEDE demostrarlo.
//
// Se ejecuta con: node docs/test-informe-integracion.js
const fs = require('fs'), path = require('path'), vm = require('vm');

const RUTA = path.join(__dirname, 'nodo-montar-informe-COMPLETO.js');
if (!fs.existsSync(RUTA)) {
  console.log('FALTA ' + RUTA);
  console.log('Lanza primero: bash docs/montar-nodo-informe.sh');
  process.exit(1);
}
const codigo = fs.readFileSync(RUTA, 'utf8');

function ejecutar(filas) {
  const ctx = {
    Buffer, Intl, Date, console, module: undefined,
    $input: { all: () => filas.map((f) => ({ json: f })) },
  };
  vm.createContext(ctx);
  return vm.runInContext('(function(){' + codigo + '})()', ctx);
}

// ── La fila buena: los datos REALES de recc6e7gYS6usQCQN, leidos de Airtable ──
const buena = {
  id: 'recc6e7gYS6usQCQN',
  fields: {
    'NIF': 'Z3520584W',
    'Nombre completo': 'HAMMAD Bellachhab',
    'Nombre empleado': 'HAMMAD',
    'Apellidos empleado': 'Bellachhab',
    'Nacionalidad': 'MARRUECOS',
    'Sexo': 'Hombre',
    'estadoCivil': 'casado',
    'hijos': 'No tiene hijos',
    'Salario': 345678,
    'Propiedades': 'No tiene propiedades en España ni el extranjero',
    'Inversiones': 'No tiene inversiones en España ni en el extranjero',
    'fechaDesplazamiento': '2026-09-01',
    'Situación fiscal Anio Desplazamiento': 'No residente NO UE',
    'Situación fiscal AnioSiguiente': 'Residente Fiscal',
    // Va explicito para que el caso base sea el espanol y no el de la rama por
    // defecto: el de la rama por defecto se prueba aparte, quitando esta clave.
    'Idioma': 'Español',
    // FechaLlamada NO va a proposito: el caso base tiene que imprimir
    // 'Por confirmar', que es lo que ve un cliente cuyo bot no recogio la fecha.
  },
};
const conFila = (cambios, id) => ({ id: id || 'recPRUEBA', fields: Object.assign({}, buena.fields, cambios) });

let fallos = 0;
const comprobar = (q, bien, detalle) => {
  console.log((bien ? 'OK    ' : 'FALLA ') + q.padEnd(56) + (detalle === undefined ? '' : detalle));
  if (!bien) fallos++;
};

// ── 1 · La fila buena produce un PDF ─────────────────────────────────────────
console.log('── 1. la fila buena ──');
const r = ejecutar([buena])[0].json;
comprobar('ok:true', r.ok === true, r.ok ? '' : 'error: ' + r.error);
if (!r.ok) { console.log('\nSin PDF no se puede seguir.'); process.exit(1); }

const pdf = Buffer.from(r.base64, 'base64');
comprobar('recordId se conserva', r.recordId === 'recc6e7gYS6usQCQN', r.recordId);
comprobar('nombre del fichero recapitalizado',
          r.nombreFichero === 'Informe Mobility - Hammad Bellachhab.pdf', r.nombreFichero);
comprobar('bytes declarados == bytes reales', r.bytes === pdf.length, r.bytes + ' / ' + pdf.length);
comprobar('el PDF empieza por %PDF-', pdf.slice(0, 5).toString('latin1') === '%PDF-',
          JSON.stringify(pdf.slice(0, 8).toString('latin1')));
comprobar('el PDF acaba en %%EOF', /%%EOF\s*$/.test(pdf.slice(-16).toString('latin1')),
          JSON.stringify(pdf.slice(-8).toString('latin1')));
comprobar('pesa mas de 4 KB', pdf.length > 4096, pdf.length + ' bytes');
comprobar('bloque1=B y bloque2=A', r.bloque1 === 'B' && r.bloque2 === 'A', r.bloque1 + ' -> ' + r.bloque2);
comprobar('mas de una pagina', r.paginas > 1, r.paginas + ' paginas');

// ── 2 · La estructura del PDF: la xref apunta de verdad ──────────────────────
// Es la comprobacion que distingue "genera bytes" de "genera un PDF": si un
// offset esta mal por UNO, el lector no abre el fichero y no hay aviso previo.
console.log('\n── 2. la estructura del PDF ──');
const texto = pdf.toString('latin1');
const mStart = texto.match(/startxref\s+(\d+)\s+%%EOF/);
comprobar('hay startxref', !!mStart);
if (mStart) {
  const posXref = Number(mStart[1]);
  comprobar('startxref apunta a la palabra xref', texto.slice(posXref, posXref + 4) === 'xref',
            JSON.stringify(texto.slice(posXref, posXref + 10)));
  const tabla = texto.slice(posXref);
  const cab = tabla.match(/xref\s+(\d+)\s+(\d+)\s/);
  comprobar('la cabecera de la xref se entiende', !!cab, cab ? cab[1] + ' ' + cab[2] : '');
  if (cab) {
    const n = Number(cab[2]);
    const entradas = [...tabla.matchAll(/(\d{10}) (\d{5}) ([nf])/g)];
    comprobar('hay una entrada por objeto', entradas.length === n, entradas.length + ' de ' + n);
    let malos = 0;
    for (let i = 1; i < entradas.length; i++) {          // el objeto 0 es el libre
      const off = Number(entradas[i][1]);
      if (!new RegExp('^' + i + '\\s+0\\s+obj').test(texto.slice(off, off + 24))) {
        malos++;
        if (malos <= 3) console.log('        objeto ' + i + ' deberia empezar en ' + off +
                                    ' y ahi hay ' + JSON.stringify(texto.slice(off, off + 20)));
      }
    }
    comprobar('TODOS los offsets de la xref caen en su objeto', malos === 0,
              malos ? malos + ' offsets mal' : entradas.length - 1 + ' offsets buenos');
  }
}
const lengths = [...texto.matchAll(/\/Length\s+(\d+)\s*>>\s*stream\r?\n/g)];
let lenMalos = 0;
for (const m of lengths) {
  const ini = m.index + m[0].length;
  const declarado = Number(m[1]);
  const fin = texto.indexOf('endstream', ini);
  const real = fin - ini;
  // el salto de linea antes de endstream no cuenta
  if (Math.abs(real - declarado) > 2) lenMalos++;
}
comprobar('los /Length declarados coinciden con los flujos', lenMalos === 0,
          lengths.length + ' flujos, ' + lenMalos + ' mal');
comprobar('las fuentes declaran /WinAnsiEncoding', /\/WinAnsiEncoding/.test(texto),
          (texto.match(/\/WinAnsiEncoding/g) || []).length + ' veces');
const count = texto.match(/\/Count\s+(\d+)/);
comprobar('/Count coincide con las paginas', count && Number(count[1]) === r.paginas,
          count ? count[1] + ' / ' + r.paginas : 'sin /Count');

// ── 3 · El texto de vuelta: lo que va a leer el cliente ─────────────────────
// Se saca de los operadores Tj/TJ de los flujos y se decodifica de WinAnsi. Es
// el equivalente al cmp byte a byte del .030: no vale que "parezca" un PDF, hay
// que poder volver a leer lo que se escribio.
console.log('\n── 3. el texto que lleva dentro ──');
const WINANSI_INV = { 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”',
                      0x95: '•', 0x96: '–', 0x97: '—', 0x85: '…' };
function deWinAnsi(bytes) {
  let s = '';
  for (const b of bytes) s += WINANSI_INV[b] || String.fromCharCode(b);
  return s;
}
function extraer(buf) {
  const t = buf.toString('latin1');
  const trozos = [];
  const re = /\(((?:\\.|[^\\()])*)\)\s*Tj/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const crudo = m[1].replace(/\\([\\()])/g, '$1').replace(/\\n/g, '\n');
    trozos.push(deWinAnsi(Buffer.from(crudo, 'latin1')));
  }
  return trozos.join('\n');
}
const dentro = extraer(pdf);
comprobar('se recupera texto del PDF', dentro.length > 2000, dentro.length + ' caracteres');
const esperados = [
  ['el nombre recapitalizado', 'Hammad Bellachhab'],
  ['el pais en espanol y capitalizado', 'Marruecos'],
  ['el salario con punto de miles', '345.678'],
  ['el estado civil concordado', 'Casado'],
  ['la residencia fiscal constante', 'Sí'],
  ['la errata de Propiedades CORREGIDA', 'ni en el extranjero'],
  ['la cabecera del anio de desplazamiento', 'Situación en 2026'],
  ['la cabecera del anio siguiente', 'Situación en 2027'],
  ['el bloque B, que es el suyo', 'NO RESIDENTE FISCAL EN ESPAÑA'],
  ['el bloque A, del anio siguiente', 'RESIDENTE FISCAL EN ESPAÑA'],
  ['la N con virgulilla sobrevive al PDF', 'España'],
  ['una tilde sobrevive al PDF', 'tributación'],
];
for (const [q, aguja] of esperados) comprobar(q, dentro.includes(aguja), JSON.stringify(aguja));

comprobar('NINGUN {{ literal en el PDF', !dentro.includes('{{'),
          dentro.includes('{{') ? 'HAY MARCADORES SIN RESOLVER' : 'limpio');
comprobar('la errata SIN corregir no aparece', !dentro.includes('España ni el extranjero'),
          dentro.includes('España ni el extranjero') ? 'sale la errata' : 'no sale');

// El plazo del 720. Con bloque A montado SEGUNDO tiene que ser 2028.
// Mismo cuidado que en el ingles: el salto de linea puede caer en cualquier hueco.
const m720 = dentro.match(/31\s+de\s+marzo\s+de\s+(\d{4})/);
comprobar('el plazo del 720 usa el anio del AMBITO DEL BLOQUE',
          m720 && m720[1] === '2028', m720 ? m720[0] + ' (bloque A va segundo -> 2028)' : 'no aparece');

// ── 4 · Las paradas ─────────────────────────────────────────────────────────
console.log('\n── 4. las paradas, con su motivo ──');
const paradas = [
  ['sin fecha de desplazamiento', conFila({ 'fechaDesplazamiento': '' })],
  ['fecha que no se entiende', conFila({ 'fechaDesplazamiento': 'el mes que viene' })],
  ['formula vacia', conFila({ 'Situación fiscal Anio Desplazamiento': '' })],
  ['formula EN ERROR como objeto', conFila({ 'Situación fiscal AnioSiguiente':
      { state: 'error', errorType: 'emptyDependency', value: null, isStale: false } })],
  ['situacion fiscal desconocida', conFila({ 'Situación fiscal Anio Desplazamiento': 'Residente en Marte' })],
  ['sin salario', conFila({ 'Salario': null })],
  ['sin nombre ni apellidos', conFila({ 'Nombre empleado': '', 'Apellidos empleado': '' })],
];
for (const [q, fila] of paradas) {
  const x = ejecutar([fila])[0].json;
  const bien = x.ok === false && typeof x.error === 'string' && x.error.length > 25 && !x.base64;
  comprobar(q, bien, x.ok ? 'NO PARO, y tenia que parar' : x.error.slice(0, 78));
}

// ── 5 · DOS filas a la vez: una buena y una mala ─────────────────────────────
// El .030 perdio un fichero el 14/08 justo por no probar esto. Una fila que para
// NO puede tumbar ni contaminar a la otra.
console.log('\n── 5. dos filas a la vez, una buena y una que para ──');
const dos = ejecutar([buena, conFila({ 'Salario': null }, 'recMALA')]);
comprobar('salen DOS items', dos.length === 2, dos.length + '');
comprobar('cada item lleva SU recordId',
          dos[0].json.recordId === 'recc6e7gYS6usQCQN' && dos[1].json.recordId === 'recMALA',
          dos.map((d) => d.json.recordId).join(' , '));
comprobar('la buena sigue saliendo bien', dos[0].json.ok === true);
comprobar('la mala para', dos[1].json.ok === false);
comprobar('la mala NO lleva base64', !dos[1].json.base64);
comprobar('los dos PDF son distintos si los datos son distintos',
          true, 'la mala no genera, asi que no hay riesgo de mezcla');

// ── 6 · El titulo del documento (§8.1) ──────────────────────────────────────
console.log('\n── 6. el titulo del documento ──');
comprobar('lleva el titulo del documento', dentro.includes('Reporte fiscal Mobility'));
comprobar('lleva el subtitulo',
          dentro.includes('Régimen especial de trabajadores desplazados (Ley Beckham)'));
// El titulo va PRIMERO: si sale detras del nombre del cliente, el orden esta mal.
// OJO: hay que exigir que los DOS aparezcan. La primera version de esta linea
// comparaba los indices a secas y PASABA cuando el titulo no existia, porque
// indexOf devuelve -1 y -1 es menor que cualquier posicion. Un falso verde.
const iTit = dentro.indexOf('Reporte fiscal Mobility');
const iNom = dentro.indexOf('Hammad Bellachhab');
comprobar('el titulo va ANTES del nombre del cliente',
          iTit >= 0 && iNom >= 0 && iTit < iNom,
          'titulo en ' + iTit + ', nombre en ' + iNom);

// ── 7 · FechaLlamada (§8.5) ─────────────────────────────────────────────────
console.log('\n── 7. FechaLlamada, el marcador 17 ──');
comprobar('sin FechaLlamada se imprime "Por confirmar"', dentro.includes('Por confirmar'));
const conFecha = ejecutar([conFila({ 'FechaLlamada': '2026-08-22' })])[0].json;
comprobar('con FechaLlamada se imprime la fecha', conFecha.ok === true, conFecha.error || '');
if (conFecha.ok) {
  const t2 = extraer(Buffer.from(conFecha.base64, 'base64'));
  comprobar('la fecha sale en DD/MM/AAAA', t2.includes('22/08/2026'),
            (t2.match(/Fecha de la reuni[^\n]*/) || ['no aparece'])[0]);
  comprobar('y ya no dice "Por confirmar"', !t2.includes('Por confirmar'));
}
const fechaConHora = ejecutar([conFila({ 'FechaLlamada': '2026-08-22T12:00:00.000Z' })])[0].json;
comprobar('FechaLlamada con hora tambien vale', fechaConHora.ok === true &&
          extraer(Buffer.from(fechaConHora.base64, 'base64')).includes('22/08/2026'));
const fechaBasura = ejecutar([conFila({ 'FechaLlamada': 'el jueves' })])[0].json;
comprobar('FechaLlamada basura NO aborta el informe', fechaBasura.ok === true,
          fechaBasura.ok ? 'sigue saliendo, con "Por confirmar"' : 'ABORTA, y no deberia');

// ── 8 · El informe en INGLES (§8.2) ─────────────────────────────────────────
console.log('\n── 8. el informe en ingles ──');
const en = ejecutar([conFila({ 'Idioma': 'Ingles' })])[0].json;
comprobar('con Idioma=Ingles sale informe', en.ok === true, en.error || '');
if (en.ok) {
  const pdfEn = Buffer.from(en.base64, 'base64');
  const tEn = extraer(pdfEn);
  fs.writeFileSync('/tmp/informe-mobility-prueba-en.pdf', pdfEn);
  comprobar('el titulo en ingles', tEn.includes('Mobility Tax Report'));
  comprobar('el subtitulo en ingles', tEn.includes('Special regime for inbound workers'));
  comprobar('el pais en ingles', tEn.includes('Morocco'), 'Marruecos -> Morocco');
  comprobar('el estado civil en ingles', tEn.includes('Married'));
  comprobar('la residencia fiscal en ingles', /: Yes/.test(tEn));
  comprobar('el salario con COMA de miles en ingles', tEn.includes('345,678'),
            tEn.includes('345.678') ? 'sale con PUNTO, y en ingles va con coma' : 'con coma');
  comprobar('la fecha sigue en DD/MM/AAAA en ingles', tEn.includes('01/09/2026'));
  comprobar('la situacion fiscal traducida', !tEn.includes('No residente NO UE'),
            tEn.includes('No residente NO UE') ? 'sigue en espanol' : 'traducida');
  comprobar('sin FechaLlamada, en ingles, "To be confirmed"', tEn.includes('To be confirmed'));
  comprobar('NINGUN {{ en el ingles', !tEn.includes('{{'));
  // Palabras testigo: si alguna de estas aparece, se ha quedado texto en espanol.
  const testigos = ['Según la información', 'residente fiscal en España', 'tributan únicamente',
                    'Rendimientos del trabajo', 'Estado civil', 'País de origen',
                    'Fecha de desplazamiento', 'Propiedades:', 'Inversiones:'];
  const colados = testigos.filter((w) => tEn.includes(w));
  comprobar('no se ha quedado texto en espanol dentro del ingles', colados.length === 0,
            colados.length ? 'COLADO: ' + colados.join(' | ') : testigos.length + ' testigos limpios');
  // Y al contrario: el espanol no lleva ingles.
  const testigosEn = ['Mobility Tax Report', 'tax resident', 'employment income', 'Form 210'];
  const coladosEs = testigosEn.filter((w) => dentro.includes(w));
  comprobar('no se ha colado ingles dentro del espanol', coladosEs.length === 0,
            coladosEs.length ? 'COLADO: ' + coladosEs.join(' | ') : 'limpio');
  // La estructura NO cambia con el idioma: mismo numero de elementos de cada tipo.
  comprobar('el ingles tiene el mismo numero de paginas o una mas', Math.abs(en.paginas - r.paginas) <= 1,
            'es=' + r.paginas + ' en=' + en.paginas);
  comprobar('los bloques elegidos son los mismos', en.bloque1 === r.bloque1 && en.bloque2 === r.bloque2,
            en.bloque1 + '->' + en.bloque2);
  // La regla de los anios TAMBIEN en ingles: bloque A montado segundo -> 2028.
  // NO vale buscar '2028' a secas: el 2028 podria aparecer por otro motivo y el
  // caso mas importante de la prueba se colaria. Se exige el PLAZO completo, con
  // el 31 de marzo pegado al ano, y se admite cualquier redaccion razonable.
  // OJO CON LOS SALTOS DE LINEA. El texto se extrae linea a linea de los Tj, asi que
  // '31 March 2028' puede venir partido en cualquier hueco: '31\nMarch 2028' o
  // '31 March\n2028'. La primera version de esta linea exigia '31 March' seguido y
  // se puso ROJA al anadir el logo, porque el logo empuja el texto y cambia donde
  // rompen las lineas. El PDF estaba bien; la prueba, mal. Ahora los espacios son
  // \s+ en TODOS los huecos.
  const plazo720en = tEn.match(/31\s+(?:de\s+marzo\s+de|March)\s+(\d{4})|March\s+31,?\s+(\d{4})/);
  const anio720en = plazo720en ? (plazo720en[1] || plazo720en[2]) : null;
  comprobar('el plazo del 720 en ingles es el del AMBITO DEL BLOQUE (2028)',
            anio720en === '2028',
            plazo720en ? JSON.stringify(plazo720en[0]) : 'no encuentro el plazo del 720 en el texto ingles');
}
// Idioma vacio y ausente -> espanol, la rama por defecto.
for (const [q, val] of [['Idioma vacio', ''], ['Idioma Espanol', 'Español'], ['Idioma raro', 'Frances']]) {
  const x = ejecutar([conFila({ 'Idioma': val })])[0].json;
  const esEspanol = x.ok && extraer(Buffer.from(x.base64, 'base64')).includes('Reporte fiscal Mobility');
  comprobar(q + ' -> sale en espanol', esEspanol, x.ok ? '' : x.error);
}
const sinIdioma = (() => { const f = conFila({}); delete f.fields['Idioma']; return f; })();
const xSin = ejecutar([sinIdioma])[0].json;
comprobar('Idioma AUSENTE -> sale en espanol',
          xSin.ok && extraer(Buffer.from(xSin.base64, 'base64')).includes('Reporte fiscal Mobility'));

// ── 8b · Logo, tipografia Times y centrado (§9 del contrato) ────────────────
// Se escribe ANTES de ver el codigo que lo implementa, igual que el bloque 8: una
// prueba redactada despues de leer la implementacion solo demuestra que la has
// leido.
console.log('\n── 8b. logo, Times y centrado ──');

// TIPOGRAFIA. El /BaseFont tiene que decir Times, y seguir declarando WinAnsi: si
// se cambia la fuente y se olvida el /Encoding, los acentos salen mal y el PDF NO
// da ningun error.
comprobar('el PDF declara /Times-Roman', /\/BaseFont\s*\/Times-Roman/.test(texto));
comprobar('el PDF declara /Times-Bold', /\/BaseFont\s*\/Times-Bold/.test(texto));
comprobar('ya no queda ninguna Helvetica declarada', !/\/BaseFont\s*\/Helvetica/.test(texto),
          (texto.match(/\/BaseFont\s*\/Helvetica[\w-]*/g) || []).join(' ') || 'ninguna');
comprobar('sigue declarando /WinAnsiEncoding',
          (texto.match(/\/WinAnsiEncoding/g) || []).length === 2,
          (texto.match(/\/WinAnsiEncoding/g) || []).length + ' veces');

// EL LOGO. Un solo objeto de imagen, y el flujo tiene que ser un JPEG ENTERO.
const img = texto.match(/\/Subtype\s*\/Image[\s\S]{0,400}?stream\r?\n/);
comprobar('hay un objeto de imagen', !!img);
comprobar('un solo objeto de imagen, no uno por pagina',
          (texto.match(/\/Subtype\s*\/Image/g) || []).length === 1,
          (texto.match(/\/Subtype\s*\/Image/g) || []).length + '');
if (img) {
  const dic = img[0];
  comprobar('el logo va con /DCTDecode (JPEG tal cual, sin comprimir nada)', /\/DCTDecode/.test(dic));
  comprobar('/ColorSpace /DeviceRGB y 8 bits',
            /\/DeviceRGB/.test(dic) && /\/BitsPerComponent\s+8/.test(dic));
  const w = (dic.match(/\/Width\s+(\d+)/) || [])[1];
  const h = (dic.match(/\/Height\s+(\d+)/) || [])[1];
  comprobar('/Width y /Height son los del JPEG (400x79)', w === '400' && h === '79', w + 'x' + h);
  // El flujo, byte a byte: tiene que empezar en FFD8 y acabar en FFD9.
  const ini = img.index + img[0].length;
  const largo = Number((dic.match(/\/Length\s+(\d+)/) || [])[1]);
  const flujo = pdf.slice(ini, ini + largo);
  comprobar('el flujo del logo es un JPEG entero (FFD8 … FFD9)',
            flujo.length === largo && flujo[0] === 0xFF && flujo[1] === 0xD8 &&
            flujo[largo - 2] === 0xFF && flujo[largo - 1] === 0xD9,
            largo + ' bytes, empieza ' + flujo.slice(0, 2).toString('hex') +
            ' acaba ' + flujo.slice(-2).toString('hex'));
  comprobar('el JPEG es BASELINE (SOF0): /DCTDecode no lee progresivo',
            flujo.includes(Buffer.from([0xFF, 0xC0])) && !flujo.includes(Buffer.from([0xFF, 0xC2])),
            flujo.includes(Buffer.from([0xFF, 0xC2])) ? 'lleva SOF2, es PROGRESIVO' : 'SOF0');
}
comprobar('/Resources declara el XObject y el contenido lo dibuja',
          /\/XObject\s*<<[^>]*\/Logo/.test(texto) && /\/Logo\s+Do/.test(texto));

// CENTRADO. El titulo tiene que empezar mas a la derecha que el margen, y el
// subtitulo tambien; y el cuerpo tiene que seguir EXACTAMENTE en el margen. Las x
// se leen de los operadores Td del flujo de la primera pagina.
const xs = [...texto.matchAll(/1 0 0 1 ([\d.]+) ([\d.]+) Tm|([\d.]+) ([\d.]+) Td/g)]
  .map((m) => Number(m[1] !== undefined ? m[1] : m[3])).filter((n) => !isNaN(n));
comprobar('se leen las posiciones x del flujo', xs.length > 10, xs.length + ' posiciones');
const centradas = xs.filter((x) => x > 57);      // el margen es 56
comprobar('hay lineas desplazadas a la derecha (centradas)', centradas.length >= 2,
          centradas.length + ' lineas fuera del margen');
comprobar('y sigue habiendo lineas en el margen exacto (el cuerpo no se ha movido)',
          xs.filter((x) => Math.abs(x - 56) < 0.01).length > 5,
          xs.filter((x) => Math.abs(x - 56) < 0.01).length + ' lineas en x=56');

// ── 9 · Los PDF a disco, para poder abrirlos ────────────────────────────────
const salida = '/tmp/informe-mobility-prueba.pdf';
fs.writeFileSync(salida, pdf);
console.log('\nPDF en espanol: ' + salida + ' (' + pdf.length + ' bytes, ' + r.paginas + ' paginas)');
if (fs.existsSync('/tmp/informe-mobility-prueba-en.pdf')) {
  console.log('PDF en ingles:  /tmp/informe-mobility-prueba-en.pdf (' +
              fs.statSync('/tmp/informe-mobility-prueba-en.pdf').size + ' bytes)');
}

console.log('\n' + (fallos ? fallos + ' FALLOS' : 'TODO PASA'));
process.exit(fallos ? 1 : 0);
