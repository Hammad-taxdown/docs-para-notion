// Puerta del nodo Preparar_la_autorizacion (mobility_autorizacion_intercom) · 04/09/2026.
// EJECUTA el Code con un $input y un $() de mentira, no compara texto.
//   node docs/test-autorizacion-preparar.js
const fs = require('fs'); const path = require('path');
const codigo = fs.readFileSync(path.join(__dirname, 'nodo-autorizacion-preparar-2026-09-04.js'), 'utf8');
let ok = 0, mal = 0;
const comp = (n, c, d) => { if (c) { process.stdout.write(`verde ${n}\n`); ok++; } else { process.stdout.write(`ROJO  ${n}${d ? '\n      ' + d : ''}\n`); mal++; } };

function correr(fila, llamada) {
  const $input = { item: { json: fila } };
  const $ = (nombre) => { if (nombre !== 'Llamada_desde_el_bot') throw new Error('nodo desconocido ' + nombre); return { first: () => ({ json: llamada }) }; };
  const fn = new Function('$input', '$', codigo);
  return fn($input, $).json;
}
const LL = { user_id: 'u1', conversation_id: '215475755624195', idioma: 'es' };
const filaBase = { id: 'recAAA', 'Nombre completo': 'Jorge Botija', NIF: '78757480Y', Idioma: { name: 'Español' } };

// 1 · errores
let r = correr({}, LL);
comp('sin fila -> error y modo error', r.modo === 'error' && /No encuentro el expediente/.test(r.error), r.error);
r = correr({ id: 'recAAA', 'Nombre completo': 'Jorge Botija' }, LL);
comp('sin NIF -> error que manda pedir el NIE y dice que el pasaporte NO vale', r.modo === 'error' && /NIF/.test(r.error) && /pasaporte NO vale/.test(r.error), r.error);
r = correr({ id: 'recAAA', NIF: '78757480Y' }, LL);
comp('sin nombre -> error', r.modo === 'error' && /nombre/.test(r.error), r.error);
r = correr(filaBase, { user_id: 'u1', idioma: 'es' });
comp('sin conversation_id -> error', r.modo === 'error' && /conversation_id/.test(r.error), r.error);
// fila cruda {id, fields}
r = correr({ id: 'recBBB', fields: { 'Nombre completo': 'Ana Ruiz', NIF: 'X1234567L' } }, LL);
comp('acepta la fila CRUDA {id, fields}', r.modo === 'generar' && r.recordId === 'recBBB' && r.m_NIF === 'X1234567L');

// 2 · generar, espanol
r = correr(filaBase, LL);
comp('generar: modo, plantilla ES, fichero con el NIF', r.modo === 'generar' && r.plantilla === '1xs51w9aVU79sXeyWDicMcWq8zAezc39XfNtwKQ0XrqU' && r.nombreFichero === 'Autorizacion-AEAT-78757480Y.pdf', JSON.stringify(r));
comp('generar: mensaje de Intercom en espanol y con el clip', /^📎 Aquí tienes la autorización/.test(r.mensaje_intercom) && /firmarla/.test(r.mensaje_intercom));
comp('generar: sin domicilio -> bloque vacio y lugarFecha arranca por "A "', r.m_BloqueDomicilio === '' && /^A \d{1,2} de [a-z]+ de 20\d\d$/.test(r.m_LugarFecha) && /sin domicilio/.test(r._sinDomicilio), r.m_LugarFecha);
comp('generar: conversation_id viaja en la salida', r.conversation_id === '215475755624195');
comp('generar: urlExistente vacio y sin aviso de plantilla de reserva', r.urlExistente === '' && r._plantillaDeReserva === '');

// 3 · domicilio completo
const filaDom = { ...filaBase, 'Tipo de vía / Type of road': 'CALLE', 'Nombre de la calle / Name of street': 'Balmes', 'Número de tu domicilio / House Number': '12', Planta: '3', Puerta: 'B', 'Codigo Postal': '08008', MunicipioResidencia: 'Barcelona' };
r = correr(filaDom, LL);
comp('domicilio: etiqueta + via + numero + CP municipio (sin repetir la provincia si es el municipio)',
  r.m_BloqueDomicilio === 'DOMICILIO A EFECTOS DE NOTIFICACIONES: Calle Balmes, nº 12, planta 3, puerta B - 08008 Barcelona', r.m_BloqueDomicilio);
comp('domicilio: lugarFecha "En Barcelona, a ..."', /^En Barcelona, a \d/.test(r.m_LugarFecha), r.m_LugarFecha);
r = correr({ ...filaDom, 'Codigo Postal': '28046', MunicipioResidencia: 'Pozuelo de Alarcon' }, LL);
comp('domicilio: provincia distinta del municipio -> se anade "Madrid"', /28046 Pozuelo de Alarcon, Madrid$/.test(r.m_BloqueDomicilio), r.m_BloqueDomicilio);
r = correr({ ...filaDom, 'Nombre de la calle / Name of street': 'Calle Balmes' }, LL);
comp('domicilio: si la calle ya trae el tipo de via, no se duplica', /: Calle Balmes, nº 12/.test(r.m_BloqueDomicilio) && !/Calle Calle/.test(r.m_BloqueDomicilio), r.m_BloqueDomicilio);

// 4 · idioma
r = correr(filaBase, { ...LL, idioma: 'en' });
comp('idioma en -> mensaje en ingles', /^📎 Here is the authorisation/.test(r.mensaje_intercom));
comp('idioma en -> SIN plantilla EN cae a la ES y lo AVISA (idioma ES, _idiomaPedido EN)', r.idioma === 'ES' && r._idiomaPedido === 'EN' && /plantilla EN/.test(r._plantillaDeReserva) && r.plantilla === '1xs51w9aVU79sXeyWDicMcWq8zAezc39XfNtwKQ0XrqU', JSON.stringify(r._plantillaDeReserva));
comp('idioma en con plantilla ES -> el documento sale en ESPANOL (etiqueta y fecha ES)', /^A \d/.test(r.m_LugarFecha));
r = correr({ ...filaBase, Idioma: { name: 'Ingles' } }, { ...LL, idioma: '' });
comp('idioma vacio en la llamada -> manda la fila (Ingles -> mensaje EN)', /^📎 Here/.test(r.mensaje_intercom) && r._idiomaPedido === 'EN');
r = correr({ ...filaBase, Idioma: { name: 'Ingles' } }, { ...LL, idioma: 'es' });
comp('idioma de la llamada MANDA sobre el de la fila (fila Ingles, llamada es -> ES)', /^📎 Aquí/.test(r.mensaje_intercom) && r._idiomaPedido === 'ES');
r = correr(filaBase, { ...LL, idioma: 'English' });
comp('idioma "English" -> EN', r._idiomaPedido === 'EN');

// 5 · reenviar
const filaCon = { ...filaBase, AutorizacionPrerrellenada: [{ id: 'att1', url: 'https://v5.airtableusercontent.com/x/y.pdf', filename: 'Autorizacion-AEAT-78757480y.pdf', size: 56270, type: 'application/pdf' }] };
r = correr(filaCon, LL);
comp('ya existe -> modo reenviar con la url y el nombre del adjunto, SIN plantilla', r.modo === 'reenviar' && r.urlExistente === 'https://v5.airtableusercontent.com/x/y.pdf' && r.nombreFichero === 'Autorizacion-AEAT-78757480y.pdf' && r.plantilla === undefined, JSON.stringify(r));
comp('ya existe -> mensaje en el idioma de la llamada', /^📎 Aquí/.test(r.mensaje_intercom));
r = correr({ ...filaCon, NIF: '' }, LL);
comp('ya existe pero SIN NIF -> error igual (el NIF manda, aunque haya PDF viejo)', r.modo === 'error' && /NIF/.test(r.error));
r = correr({ ...filaBase, AutorizacionPrerrellenada: [] }, LL);
comp('adjunto vacio [] -> generar', r.modo === 'generar');

process.stdout.write(`\n${ok} verdes, ${mal} rojas\n`);
process.exit(mal ? 1 : 0);
