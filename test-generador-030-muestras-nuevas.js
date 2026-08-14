// PRUEBA DEL GENERADOR DEL .030 CONTRA LAS 15 MUESTRAS NUEVAS · 14/08/2026
// Mismo metodo que test-generador-030.js: se extraen los datos del fichero real,
// se regeneran con el generador y se compara BYTE A BYTE contra el original.
// Las muestras viven en ~/Downloads/nuevos030 y NO se suben al repo: son datos reales.
// Se ejecuta con: node docs/test-generador-030-muestras-nuevas.js
const fs = require('fs'), path = require('path');
const { construir030 } = require('/Users/hammad/Documents/Taxdown/Proyecto_Mobility_Beckham/Beckham__v0.12/docs/generador-030-2026-08-14.js');
const DIR = '/Users/hammad/Downloads/nuevos030';
const sub = (s, a, b) => s.slice(a - 1, b);

const ficheros = fs.readdirSync(DIR).filter(f => f.endsWith('.030')).sort();
let ok = 0, fallos = 0, saltados = 0;
const resumen = [];

for (const f of ficheros) {
  const orig = fs.readFileSync(path.join(DIR, f)).toString('latin1');
  if (orig.length !== 2700 || !orig.startsWith('<T030010>')) {
    console.log(`SALTA ${f.padEnd(24)} ${orig.length} bytes, version antigua`);
    saltados++;
    continue;
  }
  const A = orig.match(/<T030010>([\s\S]*?)<\/T030010>/)[1];
  const B = orig.match(/<T030020>([\s\S]*?)<\/T030020>/)[1];
  const d = {
    nif: sub(A, 226, 234).trim(),
    apellidoPrimero: sub(A, 236, 285).trim(),
    apellidoSegundo: sub(A, 286, 335).trim(),
    nombre: sub(A, 336, 360).trim(),
    nacionalidadISO2: sub(A, 223, 224),
    sexo: sub(A, 225, 225),
    fechaNacimiento: sub(A, 361, 368),
    ineMunicipioNacimiento: sub(A, 369, 373),
    municipioNacimiento: sub(A, 374, 403).trim(),
    codProvinciaNacimiento: sub(A, 404, 405),
    provinciaNacimiento: sub(A, 406, 435).trim(),
    paisNacimientoISO2: sub(A, 436, 437),
    residenteFiscal: sub(A, 172, 172),
    tipoVia: sub(A, 704, 708).trim(),
    nombreVia: sub(A, 714, 763).trim(),
    numero: sub(A, 767, 771),
    bloque: sub(A, 778, 778).trim(),
    planta: sub(A, 784, 785).trim(),   // DOS caracteres: 61078714Y lleva '04'
    puerta: sub(A, 787, 788).trim(),
    cp: sub(A, 860, 864),
    ineMunicipioResidencia: sub(A, 865, 869),
    municipioResidencia: sub(A, 870, 899).trim(),
    fechaEfectos: sub(A, 1390, 1397),
    fechaPresentacion: sub(B, 697, 704),
  };
  const r = construir030(d);
  if (r.texto === orig) {
    console.log(`OK    ${f.padEnd(24)} 2700 bytes identicos  ->  ${r.nombreFichero}`);
    ok++;
    continue;
  }
  fallos++;
  const dif = [];
  for (let i = 0; i < Math.max(r.texto.length, orig.length); i++) if (r.texto[i] !== orig[i]) dif.push(i);
  const rangos = [];
  for (const i of dif) {
    if (rangos.length && i === rangos.at(-1)[1] + 1) rangos.at(-1)[1] = i; else rangos.push([i, i]);
  }
  console.log(`FALLA ${f.padEnd(24)} ${dif.length} bytes distintos de 2700`);
  for (const [x, y] of rangos) {
    console.log(`   fichero ${x + 1}-${y + 1} (A ${x - 8}-${y - 8}): generado ${JSON.stringify(r.texto.slice(x, y + 1))} vs real ${JSON.stringify(orig.slice(x, y + 1))}`);
    resumen.push(`${x - 8}-${y - 8}`);
  }
}
console.log(`\n${ok} exactas · ${fallos} con diferencias · ${saltados} saltadas (version antigua)`);
if (resumen.length) {
  const cuenta = {};
  for (const r of resumen) cuenta[r] = (cuenta[r] || 0) + 1;
  console.log('Tramos que fallan, por frecuencia (coordenadas A):');
  for (const [k, v] of Object.entries(cuenta).sort((a, b) => b[1] - a[1])) console.log(`   A ${k}  ->  ${v} ficheros`);
}
