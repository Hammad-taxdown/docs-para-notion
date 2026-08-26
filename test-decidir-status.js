// Puerta del nodo «Decidir_Status» · 19/08/2026, ampliada el 21/08/2026
// Comprueba la escalera nueva: el bot escribe el 3 (expediente cerrado, informe
// pendiente) y el 4 lo escribe el generador del informe, no este nodo.
// Se ejecuta con `node docs/test-decidir-status.js`. Sin framework, como el resto.
const fs = require('fs');
const path = require('path');

const RUTA = path.join(__dirname, 'nodo-decidir-status-2026-08-26.js');
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
// 21/08 · Lo que manda el bot en cuanto el cliente dice un salario al limite: las
// senales llegan SIN motivo de cierre y sin AplicaBeckham, y eso ya es "hay que
// llamar". Es el caso exacto de la conversacion 215475580835251.
const SENAL    = { fields: { UserId: 'u1', Salario: 52000, SenalesComplejidad: ['Salario no definido o en el límite'] } };
const SENAL_2  = { fields: { UserId: 'u1', SenalesComplejidad: ['Salario no definido o en el límite', 'Cónyuge quiere acogerse'] } };
const SENAL_0  = { fields: { UserId: 'u1', Salario: 80000, SenalesComplejidad: [] } };
// Airtable devuelve los multipleSelects como objetos, igual que los singleSelect.
const filaSenal = (status, senales) => ({ id: 'recX', fields: { Status: status, Empresa: 'TaxDown', SenalesComplejidad: senales.map(n => ({ id: 'sel' + n.length, name: n, color: 'redLight2' })) } });

// Una fila de Airtable tal y como la devuelve Leer_Status_Actual.
const fila = (status) => ({ id: 'recX', fields: { Status: status, Empresa: 'TaxDown' } });
// Airtable tambien devuelve el singleSelect como objeto: hay que aceptar las dos.
const filaObj = (status) => ({ id: 'recX', fields: { Status: { id: 's', name: status }, Empresa: 'TaxDown' } });

const CASOS = [
  ['expediente completo desde el 2 -> escribe el 3',
   { enviado: COMPLETO, filas: [fila('3. Pendiente llamada TD')] }, '4. Pte hacer informe'],

  ['expediente completo con el singleSelect como OBJETO -> escribe el 3',
   { enviado: COMPLETO, filas: [filaObj('3. Pendiente llamada TD')] }, '4. Pte hacer informe'],

  ['cliente nuevo (0 filas) y expediente completo -> escribe el 3',
   { enviado: COMPLETO, filas: [{}] }, '4. Pte hacer informe'],

  ['llamada agendada desde el 1 -> escribe el 2',
   { enviado: LLAMADA, filas: [fila('1. Interesado')] }, '3. Pendiente llamada TD'],

  ['NO REGRESION: ya en el 3 y vuelve a cerrar -> no escribe',
   { enviado: COMPLETO, filas: [fila('4. Pte hacer informe')] }, null],

  ['NO REGRESION: el informe ya se hizo (4) -> no baja al 3',
   { enviado: COMPLETO, filas: [fila('5. Informe enviado')] }, null],

  ['NO REGRESION: ya en el 8 (borradores enviados) -> no baja al 4',
   { enviado: COMPLETO, filas: [fila('8. Pte confirmación usuario')] }, null],

  // 26/08 · EL PELDANO NUEVO DE ICIAR. Una fila que el flujo de partners dejo en
  // '2. Pte agendar llamada' tiene que poder seguir subiendo: si el mapa ORDEN no
  // lo conociera, nActual saldria 0 y la escalera dejaria de proteger esa fila.
  ['el peldano 2 NUEVO (Pte agendar llamada) sube al 4 al cerrar completo',
   { enviado: COMPLETO, filas: [fila('2. Pte agendar llamada')] }, '4. Pte hacer informe'],

  ['el peldano 2 NUEVO sube al 3 si solo hay senal de complejidad',
   { enviado: SENAL, filas: [fila('2. Pte agendar llamada')] }, '3. Pendiente llamada TD'],

  ['descarte al principio -> escribe el 12',
   { enviado: DESCARTE, filas: [fila('1. Interesado')] }, '13. Descartado'],

  ['descarte con el equipo ya trabajando el caso (3) -> NO escribe',
   { enviado: DESCARTE, filas: [fila('4. Pte hacer informe')] }, null],

  ['sin motivo de cierre y sin AplicaBeckham -> se queda en el 1',
   { enviado: SUELTO, filas: [{}] }, '1. Interesado'],

  ['la lectura de Airtable fallo -> no se toca el Status',
   { enviado: COMPLETO, filas: [{ error: 'timeout' }] }, null],

  // ── 21/08 · el 2 al OFRECER la llamada, no al confirmarla ────────────────────
  ['SENALES sin motivo de cierre desde el 1 -> escribe el 2 (el fallo de la conv 3)',
   { enviado: SENAL, filas: [fila('1. Interesado')] }, '3. Pendiente llamada TD'],

  ['SENALES con el cliente nuevo (0 filas) -> escribe el 2',
   { enviado: SENAL, filas: [{}] }, '3. Pendiente llamada TD'],

  ['DOS senales -> el 2 igual, no hace falta que sean del salario',
   { enviado: SENAL_2, filas: [fila('1. Interesado')] }, '3. Pendiente llamada TD'],

  ['senales VACIAS con el cliente nuevo -> el 1, no basta con que exista la clave',
   { enviado: SENAL_0, filas: [{}] }, '1. Interesado'],

  ['senales VACIAS y la fila YA en el 1 -> no reescribe: la escalera sube ESTRICTO',
   { enviado: SENAL_0, filas: [fila('1. Interesado')] }, null],

  ['las senales ya estaban en la FILA y este turno no las manda -> el 2 igual',
   { enviado: { fields: { UserId: 'u1', NumeroTelefono: '+34600' } },
     filas: [filaSenal('1. Interesado', ['Salario no definido o en el límite'])] }, '3. Pendiente llamada TD'],

  ['NO REGRESION: senales con la fila ya en el 3 -> NO baja al 2',
   { enviado: SENAL, filas: [fila('4. Pte hacer informe')] }, null],

  ['NO REGRESION: senales con la fila ya en el 4 -> NO baja al 2',
   { enviado: SENAL, filas: [fila('5. Informe enviado')] }, null],

  ['NO REGRESION: senales Y expediente completo -> manda el 3, no el 2',
   { enviado: { fields: { UserId: 'u1', MotivoCierre: 'Expediente completo', SenalesComplejidad: ['Salario no definido o en el límite'] } },
     filas: [fila('3. Pendiente llamada TD')] }, '4. Pte hacer informe'],

  ['NO REGRESION: senales Y descarte -> manda el descarte',
   { enviado: { fields: { UserId: 'u1', Descarte: true, SenalesComplejidad: ['Salario no definido o en el límite'] } },
     filas: [fila('1. Interesado')] }, '13. Descartado'],

  ['SENALES con la lectura fallida -> no se toca el Status',
   { enviado: SENAL, filas: [{ error: 'timeout' }] }, null],

];

// El multi-match NO lo frena este nodo: lo frena el IF «¿UserId duplicado?» que va
// justo detras, mirando _multi_match. Este nodo sigue calculando el Status y hace
// bien: si se comprobase aqui, el aviso perderia el dato de que peldano tocaba.
// Se comprueba aparte para no exigirle al nodo algo que no es su trabajo.
const MULTI = [
  ['UserId duplicado (2 filas) -> levanta _multi_match y NO llega al Upser',
   { enviado: COMPLETO, filas: [fila('3. Pendiente llamada TD'), fila('3. Pendiente llamada TD')] }],
  ['una sola fila -> _multi_match en false',
   { enviado: COMPLETO, filas: [fila('3. Pendiente llamada TD')] }],
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
// 26/08 · RENUMERADO: 'Informe enviado' paso del 4 al 5. Lo que este nodo no
// debe asignar NUNCA es ese peldano, porque lo escribe Marcar InformeListo; el
// 4 de ahora es 'Pte hacer informe' y SI lo asigna a proposito.
if (/propuesto\s*=\s*'5\./.test(CODIGO)) { console.log("ROJO  el nodo asigna el peldano 5 (Informe enviado), y eso lo escribe Marcar InformeListo"); mal++; }
else { console.log("verde el nodo NO asigna nunca el peldano 5 (Informe enviado)"); ok++; }

// 21/08 · la traza tiene que poder explicar POR QUE subio al 2: sin estos dos
// campos, un 2 inesperado no se puede depurar sin releer el codigo.
{
  const r = correr({ enviado: SENAL, filas: [fila('1. Interesado')] });
  if (r._requiere_llamada === true && Array.isArray(r._senales) && r._senales.length === 1) {
    console.log("verde la traza lleva _requiere_llamada y _senales"); ok++;
  } else {
    console.log(`ROJO  la traza no explica el 2: _requiere_llamada=${r._requiere_llamada} _senales=${JSON.stringify(r._senales)}`); mal++;
  }
  const r2 = correr({ enviado: SENAL_0, filas: [fila('1. Interesado')] });
  if (r2._requiere_llamada === false) { console.log("verde sin senales, _requiere_llamada en false"); ok++; }
  else { console.log(`ROJO  _requiere_llamada=${r2._requiere_llamada} con senales vacias`); mal++; }
}

// La regla del proyecto: en nodos de codigo, jamas .item
if (/\)\s*\.item\b/.test(CODIGO)) { console.log("ROJO  hay $(...).item en un nodo de codigo"); mal++; }
else { console.log("verde cero $(...).item"); ok++; }

console.log(`\n${ok} verdes, ${mal} rojas`);
process.exit(mal ? 1 : 0);
