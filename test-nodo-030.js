// PRUEBA DEL NODO COMPLETO «Montar el .030» · 14/08/2026
// Ejecuta el fichero concatenado tal cual, con un $input simulado, y comprueba
// que una fila buena sale de 2700 bytes y que las malas PARAN con un motivo
// legible. Se ejecuta con:  node docs/test-nodo-030.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const codigo = fs.readFileSync(path.join(__dirname, 'nodo-montar-030-COMPLETO.js'), 'utf8');

function ejecutar(filas) {
  const ctx = {
    Buffer, Intl, Date, console, module: undefined,
    $input: { all: () => filas.map((f) => ({ json: f })) },
  };
  vm.createContext(ctx);
  return vm.runInContext('(function(){' + codigo + '})()', ctx);
}

// Fila buena: los datos reales de la muestra Z3520584W.
const buena = {
  id: 'recPRUEBA0000001',
  fields: {
    'NIF': 'Z3520584W', 'Nombre completo': 'HAMMAD BELLACHHAB',
    'Nombre empleado': 'HAMMAD', 'ApellidoPrimero': 'BELLACHHAB', 'ApellidoSegundo': '',
    'Nacionalidad': 'MARRUECOS', 'Sexo': 'Hombre', 'FechaNacimiento': '2007-04-25',
    'PaisNacimiento': 'MARRUECOS',
    'Provincia de Nacimiento / Province of Birth': 'RABAT',
    'Municipio de Nacimiento / Birth Municipality': 'RABAT',
    'Tipo de vía / Type of road': 'CALLE',
    'Nombre de la calle / Name of street': 'GAZTAMBIDE',
    'Número de tu domicilio / House Number': '18', 'Planta': '', 'Puerta': 'C',
    'Codigo Postal': '28015', 'MunicipioResidencia': 'Madrid',
    'fechaDesplazamiento': '2026-09-01',
  },
};

const casos = [
  ['fila completa', buena, true],
  ['sin municipio de residencia', { id: 'r2', fields: { ...buena.fields, 'MunicipioResidencia': '' } }, false],
  ['municipio que no existe', { id: 'r3', fields: { ...buena.fields, 'MunicipioResidencia': 'Gotham' } }, false],
  ['CP de otra provincia', { id: 'r4', fields: { ...buena.fields, 'Codigo Postal': '08038' } }, false],
  ['nacido en España sin provincia', { id: 'r5', fields: { ...buena.fields, 'PaisNacimiento': 'ESPAÑA', 'Provincia de Nacimiento / Province of Birth': 'Sta Cruz de Tenerife' } }, false],
  ['nacido en España, provincia y municipio buenos', { id: 'r6', fields: { ...buena.fields, 'PaisNacimiento': 'ESPAÑA', 'Provincia de Nacimiento / Province of Birth': 'Castellon', 'Municipio de Nacimiento / Birth Municipality': 'Benicarló' } }, true],
  ['sin NIF', { id: 'r7', fields: { ...buena.fields, 'NIF': '' } }, false],
  ['pais que no esta en la lista', { id: 'r8', fields: { ...buena.fields, 'Nacionalidad': 'WAKANDA' } }, false],
];

let mal = 0;
for (const [titulo, fila, esperaOk] of casos) {
  const r = ejecutar([fila])[0].json;
  const ok = r.ok === esperaOk;
  if (!ok) mal++;
  console.log((ok ? 'OK   ' : 'FALLA') + '  ' + titulo.padEnd(42) +
    (r.ok ? r.nombreFichero + '  ' + r.bytes + ' bytes' : r.error));
}

// Y la comprobacion que de verdad importa: la fila buena tiene que producir un
// fichero identico a la muestra real salvo las dos fechas que dependen de hoy.
const r = ejecutar([buena])[0].json;
const generado = Buffer.from(r.base64, 'base64').toString('latin1');
const real = fs.readFileSync(process.env.HOME + '/Downloads/Z3520584W (2).030').toString('latin1');
const dif = [];
for (let i = 0; i < 2700; i++) if (generado[i] !== real[i]) dif.push(i + 1);
const rangos = [];
for (const i of dif) { if (rangos.length && i === rangos.at(-1)[1] + 1) rangos.at(-1)[1] = i; else rangos.push([i, i]); }
console.log('\n--- contra la muestra real Z3520584W ---');
console.log('bytes: ' + r.bytes + (r.bytes === 2700 ? ' (correcto)' : ' (MAL)'));
if (!rangos.length) console.log('identico');
for (const [a, b] of rangos) {
  console.log('  ' + a + '-' + b + ': generado ' + JSON.stringify(generado.slice(a - 1, b)) +
              ' vs real ' + JSON.stringify(real.slice(a - 1, b)));
}
if (r.bytes !== 2700) mal++;
console.log(mal ? '\n' + mal + ' FALLOS' : '\nTODAS PASAN');
process.exit(mal ? 1 : 0);
