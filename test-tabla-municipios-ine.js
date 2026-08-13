// PRUEBA DE LA TABLA DE MUNICIPIOS DEL INE · 14/08/2026
// Se ejecuta con:  node docs/test-tabla-municipios-ine.js
// Los cinco primeros casos son los codigos que aparecen DENTRO de los ficheros
// .030 reales: no son casos inventados, son la unica verdad disponible.
const { ineMunicipio, ineMunicipioSinProvincia } = require('./tabla-municipios-ine-2026-08-14.js');

const casos = [
  // --- sacados de los .030 reales ---
  ['Tarragona',            '43002', '43148'],
  ['MADRID',               '28015', '28079'],
  ['València',             '46021', '46250'],
  ['BARCELONA',            '08038', '08019'],
  ['Benicarló',            '12580', '12027'],
  // --- el cliente escribe sin acentos ---
  ['Valencia',             '46021', '46250'],
  ['Benicarlo',            '12',    '12027'],
  // --- articulo delante, como lo escribe una persona ---
  ['La Iglesuela del Cid', '44',    '44126'],
  ['Iglesuela del Cid',    '44',    '44126'],
  // --- nombres bilingues, por las dos mitades ---
  ['Donostia',             '20',    '20069'],
  ['San Sebastián',        '20',    '20069'],
  // --- la Ñ separa dos municipios de la MISMA provincia ---
  ['El Pinar',             '18',    '18910'],
  ['Piñar',                '18',    '18159'],
  // --- lo que no se reconoce devuelve null y PARA el .030 ---
  ['Gotham City',          '28',    null],
  ['',                     '28',    null],
  [null,                   '28',    null],
  ['Madrid',               '08',    null],   // existe, pero no en esa provincia
];

let mal = 0;
for (const [nombre, cp, esperado] of casos) {
  const obtenido = ineMunicipio(nombre, cp);
  const ok = obtenido === esperado;
  if (!ok) mal++;
  console.log((ok ? 'OK   ' : 'FALLA') + '  ' + String(nombre).padEnd(22) +
              ' cp=' + String(cp).padEnd(6) + ' -> ' + String(obtenido) +
              (ok ? '' : '   ESPERADO ' + String(esperado)));
}

// La busqueda sin provincia solo responde si el nombre es unico en toda Espana.
console.log('--- sin provincia (solo si es unico) ---');
for (const [n, esp] of [['Benicarló', '12027'], ['Móstoles', '28092'], ['Villanueva', null]]) {
  const g = ineMunicipioSinProvincia(n);
  const ok = g === esp;
  if (!ok) mal++;
  console.log((ok ? 'OK   ' : 'FALLA') + '  ' + n.padEnd(12) + ' -> ' + String(g));
}

console.log(mal ? '\n' + mal + ' FALLOS' : '\nTODAS PASAN');
process.exit(mal ? 1 : 0);
