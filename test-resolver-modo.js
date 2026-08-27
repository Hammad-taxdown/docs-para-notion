// test-resolver-modo.js — 27/08/2026 · WP-211 · la puerta de `Resolver_Modo`
// node docs/test-resolver-modo.js
//
// EJECUTA el nodo con un $input de mentira, no compara su texto: es la unica forma
// de probar un nodo de codigo que no se puede desplegar por API.
// `process.stdout.write` y NUNCA console.log: node 26 colorea la salida aunque
// escriba a una tuberia y los codigos ANSI corrompen los recuentos.
const fs = require('fs');
const path = require('path');

const RUTA = path.join(__dirname, 'nodo-resolver-modo-2026-08-27.js');
const CODIGO = fs.readFileSync(RUTA, 'utf8');

let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const c = (cond, s) => cond ? V(s) : X(s);

// Corre el nodo igual que n8n: $input, $getWorkflowStaticData y console inyectados.
// `console` se captura para poder mirar el evento SIN que sus lineas se mezclen con
// las de la puerta.
function correr(bodies, estatico) {
  const lista = Array.isArray(bodies) ? bodies : [bodies];
  const items = lista.map(b => ({ json: { body: b } }));
  const $input = {
    first: () => items[0] || { json: {} },
    last: () => items[items.length - 1] || { json: {} },
    all: () => items
  };
  const raiz = estatico || {};
  const $getWorkflowStaticData = () => raiz;
  const lineas = [];
  const consola = { log: (...a) => { lineas.push(a.map(String).join(' ')); } };
  const fn = new Function('$input', '$getWorkflowStaticData', 'console', CODIGO);
  const salida = fn($input, $getWorkflowStaticData, consola);
  return {
    salida,
    json: (salida && salida[0]) ? salida[0].json : null,
    lineas,
    estatico: raiz,
    almacen: (raiz.resolver_modo || {})
  };
}

// El body REAL de la ejecucion 8129120, tal cual llego, mas el input `modo` del
// transporte B. Lleva `message` y `user_email` A PROPOSITO: son la PII que el
// evento no puede filtrar.
const REAL = {
  conversation_id: '215475581167582',
  user_id: 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac',
  conversationPartId: '52219039912',
  message: 'Sí, confirmar',
  user_email: 'hammad.bellachhab@taxdown.es',
  conversation_part_id_debounce: '52219039912',
  'First Message ID': '3903053638',
  modo: 'solicitud',
  punto: 'cualifica'
};
const con = (extra) => Object.assign({}, REAL, extra);

process.stdout.write('\n── 1 · los 6 modos validos de la whitelist (WP-210 §2.1) ──\n');
const MODOS = ['menu', 'solicitud', 'faq_regimen', 'calculadora', 'lead_potencial', 'humano'];
for (const m of MODOS) {
  // sin punto: el punto no vale para todos los modos y aqui se prueba el modo solo
  const r = correr(con({ modo: m, punto: '' }), {});
  c(r.json && r.json.modo === m && r.json.origen === 'input_dc',
    'modo="' + m + '" pasa tal cual con origen=input_dc');
}
c(correr(con({ modo: '  MENU ' }), {}).json.modo === 'menu',
  'el modo se normaliza (espacios y mayusculas): " MENU " -> menu');
c(correr(con({ modo: '  MENU ' }), {}).json.origen === 'input_dc',
  'un modo normalizado NO cuenta como fail-closed');

process.stdout.write('\n── 2 · fail-closed en memoria: minimo privilegio ──\n');
const sinModo = con({}); delete sinModo.modo;
const rSin = correr(sinModo, {});
c(rSin.json.modo === 'faq_regimen', 'modo AUSENTE -> faq_regimen (minimo privilegio)');
c(rSin.json.origen === 'fail_closed', 'modo ausente -> origen=fail_closed');
c(rSin.json.modo_ausente === true, 'modo ausente -> modo_ausente=true en el item');
c(rSin.json.reoferta_menu === true, 'fail-closed -> reoferta_menu=true (se le vuelve a ofrecer el menu)');

const rInv = correr(con({ modo: 'admin' }), {});
c(rInv.json.modo === 'faq_regimen' && rInv.json.origen === 'fail_closed',
  'modo INVENTADO ("admin") cae en faq_regimen, no se propaga');
c(correr(con({ modo: '' }), {}).json.origen === 'fail_closed',
  'modo cadena vacia -> fail_closed (con el transporte B no hay "vacio significa menu")');
c(correr(con({ modo: '   ' }), {}).json.origen === 'fail_closed',
  'modo solo espacios -> fail_closed');
c(correr(con({ modo: 'solicitud; DROP' }), {}).json.modo === 'faq_regimen',
  'un modo falsificado con basura pegada NO se parte por el prefijo: cae entero');

process.stdout.write('\n── 3 · el fail-closed NO ESCRIBE NADA ──\n');
const estFC = {};
const rFC = correr(sinModo, estFC);
const textoEstatico = JSON.stringify(estFC);
c(textoEstatico.indexOf('faq_regimen') === -1,
  'el modo inventado NO aparece en el almacen persistido');
c(MODOS.every(m => textoEstatico.indexOf(m) === -1),
  'NINGUN modo se persiste: el almacen solo guarda part ids y un contador');
c(!Object.prototype.hasOwnProperty.call(rFC.json, 'fields'),
  'la salida no lleva ninguna clave `fields`: ningun escritor puede consumirla');
c(!/modo_bot/.test(JSON.stringify(rFC.json)),
  'no existe `modo_bot` en la salida (transporte B: no hay atributo persistido)');
c(rFC.json.evento.resultado === 'modo_ausente',
  'el evento del fail-closed es resultado=modo_ausente (la cadena de la alerta 3 de WP-231)');
c(JSON.stringify(rFC.json.evento.dropped) === JSON.stringify(['modo']),
  'dropped lleva el NOMBRE del campo que falto ("modo"), no su valor');

process.stdout.write('\n── 4 · el contador diario del fail-closed ──\n');
// OJO: parts DISTINTAS y CRECIENTES, o el dedupe se come el segundo turno — que es
// justo lo que hace, y esta probado abajo.
const estCont = {};
const sinModoEn = (p) => { const b = con({ conversationPartId: p, conversation_part_id_debounce: p }); delete b.modo; return b; };
correr(sinModoEn('201'), estCont);
const r2 = correr(sinModoEn('202'), estCont);
c(r2.json.fail_closed_hoy === 2, 'dos fail-closed seguidos -> contador 2 (hoy: ' + r2.json.fail_closed_hoy + ')');
const r3 = correr(con({ modo: 'solicitud', punto: 'cualifica', conversationPartId: '203', conversation_part_id_debounce: '203' }), estCont);
c(r3.json.fail_closed_hoy === 2, 'un turno VALIDO no incrementa el contador');
const estViejo = { resolver_modo: { partes: {}, orden: [], fail_closed: { dia: '1999-01-01', n: 77 } } };
c(correr(sinModo, estViejo).json.fail_closed_hoy === 1,
  'al cambiar el dia el contador se reinicia a 1, no arrastra el 77 de ayer');

process.stdout.write('\n── 5 · DEDUPE por conversation_part_id ──\n');
const estD = {};
const p1 = correr(con({ conversationPartId: '100', conversation_part_id_debounce: '100' }), estD);
c(p1.salida.length === 1, 'la primera part de una conversacion PASA');
c(estD.resolver_modo.partes['215475581167582'] === '100',
  'el almacen guarda el ultimo part procesado');
const p1bis = correr(con({ conversationPartId: '100', conversation_part_id_debounce: '100' }), estD);
c(p1bis.salida.length === 0,
  'la MISMA part reenviada devuelve salida vacia: no produce respuesta al usuario');
const p0 = correr(con({ conversationPartId: '99', conversation_part_id_debounce: '99' }), estD);
c(p0.salida.length === 0, 'una part MENOR que la ultima procesada se descarta');
const p2 = correr(con({ conversationPartId: '101', conversation_part_id_debounce: '101' }), estD);
c(p2.salida.length === 1, 'una part MAYOR pasa');
c(estD.resolver_modo.partes['215475581167582'] === '101', 'y el almacen avanza al 101');
const estD2 = {};
correr(con({ conversationPartId: '100' }), estD2);
const otraConv = correr(con({ conversation_id: 'OTRA', conversationPartId: '100' }), estD2);
c(otraConv.salida.length === 1,
  'el mismo part id en OTRA conversacion pasa: la clave del dedupe es la conversacion');
const dedEv = JSON.parse(p0.lineas[0].slice(p0.lineas[0].indexOf('{')));
c(dedEv.resultado === 'dedup', 'el descarte emite resultado=dedup');
// Un duplicado SIN modo no puede contar como modo_ausente: si contara, el contador
// de la alerta se llenaria de reentregas de Intercom y dejaria de significar nada.
const estD3 = {};
correr(con({ conversationPartId: '100' }), estD3);
const sinModoDup = con({ conversationPartId: '100' }); delete sinModoDup.modo;
const dup = correr(sinModoDup, estD3);
c(dup.salida.length === 0, 'un duplicado se descarta aunque le falte el modo');
c(Number(estD3.resolver_modo.fail_closed.n || 0) === 0,
  'un duplicado NO incrementa el contador de fail-closed');
c(dup.lineas.length === 1, 'un turno emite EXACTAMENTE UN evento, tambien el duplicado');
const estD4 = { resolver_modo: { partes: { '215475581167582': '100' }, orden: ['215475581167582'], fail_closed: { dia: '', n: 0 } } };
correr(con({ conversationPartId: '50' }), estD4);
c(estD4.resolver_modo.partes['215475581167582'] === '100',
  'un descarte NO retrocede el almacen: el ultimo procesado sigue siendo el 100');
// Los part id de Intercom pasan de lo que un Number aguanta sin perder precision.
const estBig = {};
correr(con({ conversationPartId: '9007199254740993' }), estBig);
const big = correr(con({ conversationPartId: '9007199254740992' }), estBig);
c(big.salida.length === 0,
  'la comparacion es BigInt: 9007199254740992 <= 9007199254740993 se descarta (con Number serian iguales)');

process.stdout.write('\n── 6 · corr_id, copiado del escritor (WP-208) ──\n');
c(correr(REAL, {}).json.corr_id === '215475581167582:52219039912',
  'el corr_id sale del body REAL, sin pedir ningun campo nuevo a Intercom');
c(correr(con({ intento: 2, conversationPartId: '52219039913' }), {}).json.corr_id
  === '215475581167582:52219039913:2',
  'un reintento reutiliza el corr_id y le pone :2');
const soloDebounce = { conversation_id: 'A', conversation_part_id_debounce: 'B', modo: 'menu' };
c(correr(soloDebounce, {}).json.corr_id === 'A:B',
  'si solo llega conversation_part_id_debounce se usa de respaldo');
const sinPart = { conversation_id: 'A', modo: 'menu' };
const rSinPart = correr(sinPart, {});
c(rSinPart.json.corr_id === '(sin-corr-id)',
  'sin part id el corr_id es "(sin-corr-id)", no uno a medias');
c(rSinPart.salida.length === 1 && rSinPart.json.dedupe_aplicado === false,
  'sin part id el turno PASA con dedupe_aplicado=false (no se corta al cliente por eso)');
c(correr({ conversation_id: 'A', conversationPartId: 'part_abc', modo: 'menu' }, {}).json.dedupe_estricto === false,
  'un part id no numerico marca dedupe_estricto=false en vez de fingir garantia de orden');
c(correr(REAL, {}).json.almacen_persistente === true,
  'con $getWorkflowStaticData disponible, almacen_persistente=true');
// Sin el almacen de n8n el dedupe no sobrevive entre ejecuciones, y el nodo lo DICE
// en vez de prometerlo. Se ejecuta sin inyectar $getWorkflowStaticData a proposito.
const sinAlmacen = (function () {
  const items = [{ json: { body: REAL } }];
  const $input = { first: () => items[0], all: () => items, last: () => items[0] };
  const fn = new Function('$input', 'console', CODIGO);
  return fn($input, { log: () => {} })[0].json;
})();
c(sinAlmacen.almacen_persistente === false,
  'sin $getWorkflowStaticData el nodo NO revienta y marca almacen_persistente=false');
c(sinAlmacen.modo === 'solicitud', 'y el turno se resuelve igual: el modo no depende del almacen');

process.stdout.write('\n── 7 · el evento no lleva PII ──\n');
const rPII = correr(REAL, {});
const ev = rPII.json.evento;
const claves = Object.keys(ev).sort();
c(claves.length === 6, 'el evento tiene exactamente 6 claves (hoy: ' + claves.length + ')');
c(JSON.stringify(claves) === JSON.stringify(['corr_id', 'dropped', 'modo', 'ms', 'punto', 'resultado']),
  'las 6 claves son las del contrato de WP-208: ' + claves.join(', '));
const txtEv = JSON.stringify(ev) + '\n' + rPII.lineas.join('\n');
c(txtEv.indexOf('hammad.bellachhab@taxdown.es') === -1, 'el email del cliente NO aparece en el evento');
c(txtEv.indexOf('Sí, confirmar') === -1, 'lo que el cliente escribio NO aparece en el evento');
c(txtEv.indexOf('eu-west-1:d59e6f8e') === -1, 'el user_id NO aparece en el evento');
c(!/message|user_email|user_id/.test(JSON.stringify(ev)),
  'el evento no arrastra ninguna clave del body');
c(rPII.lineas[0].indexOf('[215475581167582:52219039912]') === 0,
  'la linea de log va prefijada con el corr_id, que es lo que la hace buscable');

process.stdout.write('\n── 8 · cold_start se deriva de modo + punto ──\n');
const cold = (modo, punto, extra) => correr(con(Object.assign({ modo, punto }, extra || {})), {}).json.cold_start;
c(cold('solicitud', 'cualifica') === true, 'punto=cualifica (handoff en frio de G) -> cold_start=true');
c(cold('lead_potencial', 'lead') === true, 'punto=lead (el DC se llama antes de preguntar) -> true');
c(cold('faq_regimen', 'faq_entrada') === false, 'punto=faq_entrada -> false: el cliente acaba de escribir');
c(cold('solicitud', 'descarte_residencia') === true, 'punto=descarte_residencia -> true');
c(cold('solicitud', 'descarte_plazo') === true, 'punto=descarte_plazo -> true');
c(cold('faq_regimen', 'autodescarte_declarado') === true, 'punto=autodescarte_declarado (boton) -> true');
c(cold('menu', '') === true, 'modo=menu sin punto -> true: el menu lo abre el bot');
c(cold('calculadora', '') === true, 'modo=calculadora -> true');
c(cold('humano', '') === true, 'modo=humano -> true');
c(cold('solicitud', '') === false, 'modo=solicitud sin punto (F/DC1, la fecha) -> false');
c(cold('faq_regimen', '') === false, 'modo=faq_regimen sin punto -> false');
// LA COMPROBACION QUE DA NOMBRE AL CAMBIO: ya no depende de last_message_content.
c(cold('solicitud', 'cualifica', { message: 'hola', last_message_content: 'hola' }) === true,
  'cold_start NO cambia aunque llegue last_message_content: ya no se calcula con eso');
c(cold('faq_regimen', 'faq_entrada', { message: '', last_message_content: '' }) === false,
  'cold_start NO cambia aunque last_message_content venga vacio');
// `sinModo` llega CON punto=cualifica, que en un turno legitimo daria true. En
// fail-closed no: el punto viaja por el mismo canal que el modo, asi que un tercero
// no puede forzar el saludo de handoff en frio mandando solo el punto.
c(correr(sinModo, {}).json.cold_start === false,
  'en fail-closed cold_start=false AUNQUE llegue punto=cualifica (el punto tampoco es de fiar)');
const sinModoLead = con({ punto: 'lead' }); delete sinModoLead.modo;
c(correr(sinModoLead, {}).json.cold_start === false,
  'en fail-closed ningun punto puede poner cold_start a true');

process.stdout.write('\n── 9 · punto y pareja modo/punto (aviso de cobertura, NO bloquea) ──\n');
const rPuntoRaro = correr(con({ modo: 'solicitud', punto: 'inventado' }), {});
c(rPuntoRaro.salida.length === 1, 'un punto fuera de whitelist NO corta el turno (eso lo hace el escritor)');
c(rPuntoRaro.json.punto === '' && rPuntoRaro.json.punto_valido === false,
  'un punto fuera de whitelist sale vacio y marcado punto_valido=false');
c(rPuntoRaro.json.punto_declarado === 'inventado', 'y se conserva lo que llego en punto_declarado');
c(correr(con({ modo: 'faq_regimen', punto: 'cualifica' }), {}).json.par_incoherente === true,
  'la pareja modo=faq_regimen + punto=cualifica se marca par_incoherente (WP-210 §2.2)');
c(correr(con({ modo: 'solicitud', punto: 'cualifica' }), {}).json.par_incoherente === false,
  'la pareja de la tabla firmada NO se marca');
c(correr(sinModo, {}).json.par_incoherente === false,
  'en fail-closed no se evalua la pareja: el modo no lo declaro el canvas');

process.stdout.write('\n── 10 · el body del Data Connector (form-urlencoded) ──\n');
// El DC manda el JSON entero como UNICA CLAVE del body: sin este parseo, TODOS los
// turnos caerian en fail-closed. Verificado en las ejecuciones 8052012 y 8052018.
const unaClave = {};
unaClave[JSON.stringify({ conversation_id: 'A', conversationPartId: 'B', modo: 'solicitud', punto: 'cualifica' })] = '';
const rUna = correr(unaClave, {});
c(rUna.json.modo === 'solicitud' && rUna.json.origen === 'input_dc',
  'un body de una sola clave con el JSON dentro se parsea y el modo se recupera');
c(rUna.json.corr_id === 'A:B', 'y el corr_id sale del JSON parseado');
c(correr({ 'basura-que-no-es-json': '1', modo: 'menu' }, {}).json.modo === 'menu',
  'una clave que no es JSON no revienta el nodo: el body se deja tal cual');
c(correr(REAL, {}).json.body.conversation_part_id_debounce === '52219039912',
  'el body se devuelve tal cual, asi que If2 sigue funcionando sin tocar su expresion');
const rMulti = correr([con({ conversationPartId: '1' }), con({ conversationPartId: '2' })], {});
c(rMulti.salida.length === 1 && rMulti.json.part_id === '1',
  'runOnceForAllItems: se usa $input.first() y sale UN item (nunca .item, que cuelga el runner)');

process.stdout.write('\n── 11 · el contrato de salida de WP-211 §2 ──\n');
const rC = correr(REAL, {});
for (const k of ['modo', 'origen', 'corr_id', 'part_id']) {
  c(Object.prototype.hasOwnProperty.call(rC.json, k), 'la salida lleva `' + k + '` (WP-211 §2)');
}
c(rC.json.part_id === '52219039912', 'part_id es el conversation_part_id, no el corr_id entero');
c(['input_dc', 'fail_closed'].indexOf(rC.json.origen) !== -1,
  'origen solo puede ser input_dc o fail_closed');

process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
