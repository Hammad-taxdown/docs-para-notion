// test-escalar-humano.js — LA PUERTA DE WP-223 A · BECKHAM_escalar_humano (m8GmgA2ot05foDBd)
//
// NO compara texto: EJECUTA el nodo `Guarda de la escalada` con un $input de mentira, que es
// lo unico que se puede probar sin credencial de Intercom y sin el team de Ops.
// Lee el jsCode de docs/wf-223-escalar-humano-sdk-2026-08-31.js cargandolo con un SDK falso,
// asi que mide LA FUENTE, no una copia.
//
// En los scripts: process.stdout.write, NUNCA console.log — el console.log de node 26 colorea
// aunque escriba a una tuberia y los codigos ANSI se cuelan dentro de las variables.
'use strict';

const fs = require('fs');
const path = require('path');

const FUENTE = path.join(__dirname, 'wf-223-escalar-humano-sdk-2026-08-31.js');

// ── cargar la fuente con un SDK de mentira y quedarse con los parametros ─────
function leerNodos() {
  let src = fs.readFileSync(FUENTE, 'utf8')
    .replace(/^import .*$/m, '')
    .replace(/^export default/m, 'const _wf =');
  const nodos = [];
  const api = { to: () => api, onError: () => api, onTrue: () => api, onFalse: () => api, input: () => api, output: () => api };
  const rec = (o) => { nodos.push(o); return api; };
  const wf = () => ({ add: function () { return this; }, to: function () { return this; } });
  const fn = new Function('workflow', 'node', 'trigger', 'ifElse', 'newCredential', 'expr', src + '\nreturn true;');
  fn(wf, rec, rec, rec, (n) => ({ cred: n }), (s) => '=' + s);
  const out = {};
  for (const n of nodos) { const c = n.config || {}; out[c.name] = c.parameters || {}; }
  return out;
}

const P = leerNodos();
const guardaSrc = (P['Guarda de la escalada'] || {}).jsCode;

let verdes = 0, rojos = 0;
function comp(nombre, real, esperado) {
  if (JSON.stringify(real) === JSON.stringify(esperado)) {
    verdes += 1;
    process.stdout.write('  OK    ' + nombre + ' = ' + JSON.stringify(real) + '\n');
  } else {
    rojos += 1;
    process.stdout.write('  FALLA ' + nombre + ' = ' + JSON.stringify(real) + ' (esperado ' + JSON.stringify(esperado) + ')\n');
  }
}

if (!guardaSrc) {
  process.stdout.write('FALLA · no encuentro el jsCode de `Guarda de la escalada` en ' + FUENTE + '\n');
  process.exit(1);
}

function correr(item) {
  const $input = { first: () => ({ json: item }) };
  return new Function('$input', guardaSrc)($input)[0].json;
}

const BASE = {
  conversation_id: '215475581167582',
  user_id: 'eu-west-1:abc-123',
  corr_id: '215475581167582:52219039912',
  motivo: 'Quiere hablar con una persona.',
  team_id_ops: '',
  admin_id_bot: '4418209'
};
const con = (extra) => Object.assign({}, BASE, extra);

// ── 1 · el team, que es el motivo de que exista este bloque ──────────────────
// Hasta el 31/08 se llamaba a la API de Intercom con el 11098265 del canvas VIEJO y se
// dependia de que la API lo rechazase. Ahora se para aqui y NO se llama.
process.stdout.write('1 · team VACIO, que es como sale el Set hoy\n');
let r = correr(con({}));
comp('resultado', r.resultado, 'team_sin_configurar');
comp('ok', r.ok, false);
comp('campos', r.campos, ['team_id_ops']);

process.stdout.write('2 · team = 11098265 (el del workspace viejo: es NUMERICO, se rechaza por VALOR)\n');
comp('resultado', correr(con({ team_id_ops: '11098265' })).resultado, 'team_sin_configurar');

process.stdout.write('3 · team no numerico\n');
comp('resultado', correr(con({ team_id_ops: 'Ops_Mobility' })).resultado, 'team_sin_configurar');

process.stdout.write('4 · admin_id vacio (Intercom exige quien FIRMA la asignacion)\n');
r = correr(con({ team_id_ops: '7654321', admin_id_bot: '' }));
comp('resultado', r.resultado, 'team_sin_configurar');
comp('campos', r.campos, ['admin_id_bot']);

process.stdout.write('5 · un objeto donde deberia ir texto (singleSelect {id,name,color} o celda de IA en error)\n');
comp('resultado', correr(con({ team_id_ops: { id: 'x', name: '7654321' } })).resultado, 'team_sin_configurar');

// ── 6 · el conversation_id, que se pega DENTRO de la URL de la API ───────────
process.stdout.write('6 · conversation_id con / y ? (se saldria del path)\n');
r = correr(con({ team_id_ops: '7654321', conversation_id: '2154/parts?x=1' }));
comp('resultado', r.resultado, 'schema_error');
comp('campos', r.campos, ['conversation_id']);

process.stdout.write('7 · conversation_id vacio\n');
comp('resultado', correr(con({ team_id_ops: '7654321', conversation_id: '' })).resultado, 'schema_error');

// ── 8 · EL SLA. El unico plazo que el prompt permite dar es 24-48 horas ──────
process.stdout.write('8 · team bueno -> pasa, y el SLA es EL DEL PROMPT y ningun otro\n');
r = correr(con({ team_id_ops: '7654321' }));
comp('resultado', r.resultado, 'ok');
comp('ok', r.ok, true);
comp('sla', r.sla, '24-48 horas');
comp('la nota lleva el SLA', r.nota_body.indexOf('SLA prometido al cliente: 24-48 horas') > -1, true);
comp('la nota NO promete otro plazo', /(?:24-48 h(?!oras))|(?:\b48 ?h\b)|en breve|inmediat|24 ?horas\b/.test(r.nota_body), false);

// ── 9 · el motivo: lo UNICO que redacta el modelo ────────────────────────────
process.stdout.write('9 · PII y comillas del motivo (el body de los dos nodos HTTP es JSON de TEXTO)\n');
r = correr(con({
  team_id_ops: '7654321',
  motivo: 'Su email es juan@x.com, NIE Y1234567Z, tel 612 345 678 y dijo "no me llameis"\nsegunda linea'
}));
comp('email enmascarado', r.motivo.indexOf('[EMAIL]') > -1, true);
comp('nif enmascarado', r.motivo.indexOf('[NIF]') > -1, true);
comp('telefono enmascarado', r.motivo.indexOf('[TELEFONO]') > -1, true);
comp('contadores pii', r.pii, { email: 1, iban: 0, nif: 1, telefono: 1 });
comp('cero comillas dobles', r.motivo.indexOf('"') === -1, true);
comp('cero saltos de linea', /[\r\n]/.test(r.motivo), false);
let parseable = true;
try {
  JSON.parse('{"message_type":"note","type":"admin","admin_id":"4418209","body":"' + r.nota_body + '"}');
} catch (e) {
  parseable = false;
}
comp('el body de la nota se parsea como JSON', parseable, true);

process.stdout.write('10 · motivo vacio -> uno neutro; el motivo no puede tumbar la escalada\n');
comp('motivo', correr(con({ team_id_ops: '7654321', motivo: '' })).motivo, 'El cliente ha pedido hablar con una persona.');

// ── 11 · el patron de la casa para la API de Intercom, en los DOS nodos HTTP ─
// El del nodo VIVO `Cerrar_Conversacion` de beckham_bot: tv 4.4, predefinedCredentialType +
// intercomApi, POST a /conversations/{id}/parts y el body en JSON de TEXTO, no un objeto de JS.
process.stdout.write('11 · los dos nodos HTTP con el patron del nodo vivo Cerrar_Conversacion\n');
for (const nombre of ['Asignar la conversacion al team de Ops', 'Nota interna con el motivo']) {
  const p = P[nombre] || {};
  comp(nombre + ' · method', p.method, 'POST');
  comp(nombre + ' · auth', p.authentication, 'predefinedCredentialType');
  comp(nombre + ' · credencial', p.nodeCredentialType, 'intercomApi');
  comp(nombre + ' · URL /parts', /^=https:\/\/api\.intercom\.io\/conversations\/\{\{ .* \}\}\/parts$/.test(String(p.url)), true);
  comp(nombre + ' · body JSON de texto', /^=\{"message_type":/.test(String(p.jsonBody)), true);
  comp(nombre + ' · el body NO es un objeto de JS', /^=\{\{/.test(String(p.jsonBody)), false);
}
comp('el message_type de la asignacion', /"message_type":"assignment"/.test(String((P['Asignar la conversacion al team de Ops'] || {}).jsonBody)), true);
comp('el message_type de la nota', /"message_type":"note"/.test(String((P['Nota interna con el motivo'] || {}).jsonBody)), true);

// ── 12 · el team_id_ops NO puede volver a llevar el id del workspace viejo ───
process.stdout.write('12 · el Set del team\n');
const setTeam = (P['Team de Ops (VALOR A CONFIRMAR)'] || {}).assignments || { assignments: [] };
const valores = {};
for (const a of setTeam.assignments) valores[a.name] = a.value;
comp('team_id_ops sale vacio a proposito', valores.team_id_ops, '');
comp('admin_id_bot es el que ya cierra conversaciones', valores.admin_id_bot, '4418209');

// ── 13 · ningun nodo de codigo usa $('X').item ni lee el Set por nombre ──────
process.stdout.write('13 · las reglas de la casa en los nodos de codigo\n');
// SIN LOS COMENTARIOS, y no es un detalle: los cuatro nodos LLEVAN ESCRITO en un comentario
// «SIEMPRE $('X').first(), nunca $('X').item», asi que buscar el patron sobre el fichero entero
// da un rojo falso en el nodo mejor documentado. Una prueba que caza su propia documentacion
// no prueba nada.
function sinComentarios(js) {
  return js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}
for (const nombre of ['Guarda de la escalada', 'Respuesta OK', 'Respuesta asignacion fallida', 'Respuesta asignada sin nota']) {
  const js = sinComentarios(String((P[nombre] || {}).jsCode || ''));
  comp(nombre + ' · cero $("X").item', /\$\((['"]).*?\1\)\s*\.item/.test(js), false);
  comp(nombre + ' · cero console.log', js.indexOf('console.log') === -1, true);
  comp(nombre + ' · no lee el Set por nombre', js.indexOf("$('Team de Ops") === -1, true);
}

process.stdout.write('\nVERDES ' + verdes + ' · ROJOS ' + rojos + '\n');
process.exit(rojos === 0 ? 0 : 1);
