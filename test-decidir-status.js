// Puerta del nodo «Decidir_Status» · 19/08/2026
// Comprueba la escalera nueva: el bot escribe el 3 (expediente cerrado, informe
// pendiente) y el 4 lo escribe el generador del informe, no este nodo.
// Se ejecuta con `node docs/test-decidir-status.js`. Sin framework, como el resto.
const fs = require('fs');
const path = require('path');

const RUTA = path.join(__dirname, 'nodo-decidir-status-2026-08-19.js');
const CODIGO = fs.readFileSync(RUTA, 'utf8');

// Corre el nodo con $ y $input simulados, igual que haria n8n.
function correr({ enviado, filas }) {
  const $ = (nombre) => {
    if (nombre === 'Validar y Normalizar') return { first: () => ({ json: enviado }) };
    throw new Error('nodo no simulado: ' + nombre);
  };
  const items = filas.map((f) => ({ json: f }));
  const $input = { all: () => items, first: () => items[0] || { json: {} } };
  const fn = new Function('$', '$input', CODIGO);
  return fn($, $input)[0].json;
}

// Lo que manda el bot en un cierre por expediente completo.
const COMPLETO = { fields: { UserId: 'u1', MotivoCierre: 'Expediente completo' } };
const LLAMADA  = { fields: { UserId: 'u1', MotivoCierre: 'Llamada agendada' } };
const DESCARTE = { fields: { UserId: 'u1', Descarte: true } };
const SUELTO   = { fields: { UserId: 'u1', Salario: 80000 } };

// Una fila de Airtable tal y como la devuelve Leer_Status_Actual.
const fila = (status) => ({ id: 'recX', fields: { Status: status, Empresa: 'TaxDown' } });
// Airtable tambien devuelve el singleSelect como objeto: hay que aceptar las dos.
const filaObj = (status) => ({ id: 'recX', fields: { Status: { id: 's', name: status }, Empresa: 'TaxDown' } });

const CASOS = [
  ['expediente completo desde el 2 -> escribe el 3',
   { enviado: COMPLETO, filas: [fila('2. Pendiente llamada TD')] }, '3. Pte hacer informe'],

  ['expediente completo con el singleSelect como OBJETO -> escribe el 3',
   { enviado: COMPLETO, filas: [filaObj('2. Pendiente llamada TD')] }, '3. Pte hacer informe'],

  ['cliente nuevo (0 filas) y expediente completo -> escribe el 3',
   { enviado: COMPLETO, filas: [{}] }, '3. Pte hacer informe'],

  ['llamada agendada desde el 1 -> escribe el 2',
   { enviado: LLAMADA, filas: [fila('1. Interesado')] }, '2. Pendiente llamada TD'],

  ['NO REGRESION: ya en el 3 y vuelve a cerrar -> no escribe',
   { enviado: COMPLETO, filas: [fila('3. Pte hacer informe')] }, null],

  ['NO REGRESION: el informe ya se hizo (4) -> no baja al 3',
   { enviado: COMPLETO, filas: [fila('4. Informe enviado')] }, null],

  ['NO REGRESION: ya en el 7 (borradores enviados) -> no baja al 3',
   { enviado: COMPLETO, filas: [fila('7. Pte confirmación usuario')] }, null],

  ['descarte al principio -> escribe el 12',
   { enviado: DESCARTE, filas: [fila('1. Interesado')] }, '12. Descartado'],

  ['descarte con el equipo ya trabajando el caso (3) -> NO escribe',
   { enviado: DESCARTE, filas: [fila('3. Pte hacer informe')] }, null],

  ['sin motivo de cierre y sin AplicaBeckham -> se queda en el 1',
   { enviado: SUELTO, filas: [{}] }, '1. Interesado'],

  ['la lectura de Airtable fallo -> no se toca el Status',
   { enviado: COMPLETO, filas: [{ error: 'timeout' }] }, null],

];

// El multi-match NO lo frena este nodo: lo frena el IF «¿UserId duplicado?» que va
// justo detras, mirando _multi_match. Este nodo sigue calculando el Status y hace
// bien: si se comprobase aqui, el aviso perderia el dato de que peldano tocaba.
// Se comprueba aparte para no exigirle al nodo algo que no es su trabajo.
const MULTI = [
  ['UserId duplicado (2 filas) -> levanta _multi_match y NO llega al Upser',
   { enviado: COMPLETO, filas: [fila('2. Pendiente llamada TD'), fila('2. Pendiente llamada TD')] }],
  ['una sola fila -> _multi_match en false',
   { enviado: COMPLETO, filas: [fila('2. Pendiente llamada TD')] }],
];

let ok = 0, mal = 0;
for (const [nombre, entrada, esperado] of CASOS) {
  let r;
  try { r = correr(entrada); }
  catch (e) { console.log(`ROJO  ${nombre}\n      excepcion: ${e.message}`); mal++; continue; }
  const escrito = r._status_escrito;
  const enFields = r.fields.Status === undefined ? null : r.fields.Status;
  if (escrito === esperado && enFields === esperado) {
    console.log(`verde ${nombre}`);
    ok++;
  } else {
    console.log(`ROJO  ${nombre}\n      esperado=${JSON.stringify(esperado)} _status_escrito=${JSON.stringify(escrito)} fields.Status=${JSON.stringify(enFields)}`);
    mal++;
  }
}

for (const [nombre, entrada] of MULTI) {
  const esperado = entrada.filas.length > 1;
  const r = correr(entrada);
  if (r._multi_match === esperado && r._n_filas === entrada.filas.length) {
    console.log(`verde ${nombre}`);
    ok++;
  } else {
    console.log(`ROJO  ${nombre}\n      _multi_match=${r._multi_match} (esperado ${esperado}) _n_filas=${r._n_filas}`);
    mal++;
  }
}

// El 4 no lo puede escribir este nodo por ningun camino: lo escribe el generador.
if (/propuesto\s*=\s*'4\./.test(CODIGO)) { console.log("ROJO  el nodo sigue asignando el peldano 4 a propuesto"); mal++; }
else { console.log("verde el nodo NO asigna nunca el peldano 4 (lo escribe Marcar InformeListo)"); ok++; }

// La regla del proyecto: en nodos de codigo, jamas .item
if (/\)\s*\.item\b/.test(CODIGO)) { console.log("ROJO  hay $(...).item en un nodo de codigo"); mal++; }
else { console.log("verde cero $(...).item"); ok++; }

console.log(`\n${ok} verdes, ${mal} rojas`);
process.exit(mal ? 1 : 0);
