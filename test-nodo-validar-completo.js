// test-nodo-validar-completo.js — 26/08/2026 · WP-207 + WP-208
//
// LA PUERTA DEL COMPLETO. No comprueba texto: EJECUTA el nodo con un `$input` de
// mentira, asi que mide comportamiento y no parecido. Dos mitades:
//   A · NO REGRESION: el nodo sigue haciendo todo lo que hacia el vivo.
//   B · LO NUEVO: corr_id, el Log_Evento de 6 campos y que no se cuele PII.
//
// node docs/test-nodo-validar-completo.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname;
let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const c = (cond, s) => cond ? V(s) : X(s);

const code = fs.readFileSync(path.join(D, 'nodo-validar-normalizar-COMPLETO.js'), 'utf8');

// ── el arnes: ejecuta el nodo y devuelve {salida, logs} ─────────────────────
function correr(body) {
  const logs = [];
  const ctx = {
    $input: { first: () => ({ json: { body } }) },
    console: { log: (...a) => logs.push(a.join(' ')), error: () => {}, warn: () => {} },
    Date, JSON, String, Number, Object, Array, Boolean, Math, RegExp, isNaN, parseInt, parseFloat
  };
  // el nodo hace `return` a nivel de raiz, que es lo normal en un Code node de n8n
  const salida = vm.runInNewContext('(function(){' + code + '})()', ctx, { timeout: 8000 });
  return { salida: salida && salida[0] ? salida[0].json : null, logs };
}
const UID = 'eu-west-1:00000000-0000-4000-8000-0000000000c1';
const BASE = { user_id: UID, intercom_conversation_id: '215475581167582',
  conversation_id: '215475581167582', conversationPartId: '52219039912' };

// ══ A · NO REGRESION ═══════════════════════════════════════════════════════
let r = correr(BASE);
c(r.salida && r.salida._invalid === false, 'A · un body minimo valido sigue pasando');
c(r.salida.fields && r.salida.fields.UserId === UID, 'A · UserId sigue llegando a fields');
c(typeof r.salida._formula_userid === 'string' && r.salida._formula_userid.indexOf('{UserId} =') === 0,
  'A · _formula_userid se sigue construyendo (lo lee el nodo de Airtable)');
c('_hay_fechas_descartadas' in r.salida && '_fechas_descartadas' in r.salida,
  'A · las dos claves de fechas descartadas siguen existiendo con su nombre');

// los cuatro rechazos, uno a uno
c(correr({}).salida.error === 'user_id_or_conversation_id_missing', 'A · rechazo sin user_id');
c(correr({ user_id: 'pepe', intercom_conversation_id: 'x' }).salida.error === 'user_id_forma_invalida',
  'A · rechazo por forma del user_id');
c(correr(Object.assign({}, BASE, { punto: 'inventado' })).salida.error === 'punto_desconocido',
  'A · rechazo por punto fuera de la whitelist');
c(correr(Object.assign({}, BASE, { Descarte: 'Salario bajo' })).salida.error === 'descarte_desconocido',
  'A · rechazo por Descarte fuera de la whitelist');

// DERIVA: los puntos siguen escribiendo lo suyo
const lead = correr(Object.assign({}, BASE, { punto: 'lead' })).salida.fields;
c(lead.lead_potencial === true && lead.alta_ss === false, 'A · punto=lead sigue derivando sus dos campos');
const dp = correr(Object.assign({}, BASE, { punto: 'descarte_plazo' })).salida.fields;
c(dp.Descarte === 'Alta en SS mas de 6 meses', 'A · punto=descarte_plazo sigue escribiendo su Descarte');

// las fechas, con el unico cuadrante que funciona
const f = correr(Object.assign({}, BASE, { fecha_alta_ss: '02/03/2026' })).salida;
c(f.fields.fecha_alta_ss === '2026-03-02T12:00:00.000Z',
  'A · la fecha sigue saliendo ISO + T12:00:00.000Z · ' + f.fields.fecha_alta_ss);
const mala = correr(Object.assign({}, BASE, { fecha_alta_ss: '32/13/2026' })).salida;
c(mala._hay_fechas_descartadas === true && !('fecha_alta_ss' in mala.fields),
  'A · una fecha imposible NO se escribe y enciende el aviso');
// el domicilio atomico
const medio = correr(Object.assign({}, BASE, { calle: 'Gran Via', numero: '1' })).salida;
c(!('Calle' in medio.fields) || !medio.fields.CodigoPostal,
  'A · medio domicilio sigue sin escribirse (atomico)');
// AplicaBeckham solo con un si expreso
c(correr(Object.assign({}, BASE, { quiere_acogerse: 'si' })).salida.fields.AplicaBeckham === true,
  'A · quiere_acogerse=si sigue marcando AplicaBeckham');
c(!('AplicaBeckham' in correr(BASE).salida.fields),
  'A · sin decirlo, AplicaBeckham NO se toca');

// ══ B · LO NUEVO ══════════════════════════════════════════════════════════
r = correr(BASE);
c(r.salida.corr_id === '215475581167582:52219039912',
  'B · el corr_id sale en la salida · ' + r.salida.corr_id);
c(correr(Object.assign({}, BASE, { intento: 2 })).salida.corr_id === '215475581167582:52219039912:2',
  'B · un reintento reutiliza el corr_id con :2');
const soloDeb = correr({ user_id: UID, intercom_conversation_id: 'x',
  conversation_id: 'A', conversation_part_id_debounce: 'B' }).salida;
c(soloDeb.corr_id === 'A:B', 'B · conversation_part_id_debounce vale de respaldo');
c(correr({ user_id: UID, intercom_conversation_id: 'x' }).salida.corr_id === '(sin-corr-id)',
  'B · sin las dos piezas se marca (sin-corr-id), no se inventa uno');
c(correr({}).salida.corr_id === '(sin-corr-id)', 'B · un rechazo tambien lleva corr_id');

// el evento: 6 campos exactos
c(r.logs.length === 1, 'B · se emite UN evento por ejecucion (hoy: ' + r.logs.length + ')');
const ev = JSON.parse(r.logs[0].slice(r.logs[0].indexOf('{')));
const claves = Object.keys(ev).sort();
c(JSON.stringify(claves) === JSON.stringify(['corr_id', 'dropped', 'modo', 'ms', 'punto', 'resultado']),
  'B · el evento tiene los 6 campos y solo esos · ' + claves.join(', '));
c(r.logs[0].indexOf('[215475581167582:52219039912]') === 0,
  'B · la linea va prefijada con el corr_id (es lo que la hace buscable)');
c(ev.resultado === 'ok' && typeof ev.ms === 'number', 'B · resultado=ok y ms es numerico');
c(correr({}).logs.length === 1 &&
  JSON.parse(correr({}).logs[0].slice(correr({}).logs[0].indexOf('{'))).resultado
    === 'user_id_or_conversation_id_missing',
  'B · un rechazo se loguea con SU resultado, no con ok');
const conPunto = correr(Object.assign({}, BASE, { punto: 'cualifica', modo: 'solicitud' }));
const ev2 = JSON.parse(conPunto.logs[0].slice(conPunto.logs[0].indexOf('{')));
c(ev2.punto === 'cualifica' && ev2.modo === 'solicitud', 'B · punto y modo viajan en el evento');
c(JSON.parse(correr(BASE).logs[0].slice(correr(BASE).logs[0].indexOf('{'))).modo === '',
  'B · sin modo el campo sale vacio, no revienta (WP-210 aun no lo manda)');

// LO QUE MAS IMPORTA: que no se cuele PII en el log
const pii = correr(Object.assign({}, BASE, {
  message: 'Me llamo Juan y gano 48000', user_email: 'juan@ejemplo.com',
  fecha_alta_ss: '32/13/2026', salario: 'no se', nombre: 'Juan' }));
const linea = pii.logs[0];
c(!/Juan/.test(linea), 'B · el nombre del cliente NO aparece en el log');
c(!/juan@ejemplo\.com/.test(linea), 'B · su correo NO aparece en el log');
c(!/48000|Me llamo/.test(linea), 'B · lo que escribio NO aparece en el log');
c(!/32\/13\/2026/.test(linea), 'B · el valor de la fecha descartada NO aparece');
const evp = JSON.parse(linea.slice(linea.indexOf('{')));
c(evp.dropped.indexOf('fecha_alta_ss') !== -1,
  'B · pero SI aparece el NOMBRE del campo descartado · dropped=[' + evp.dropped.join(', ') + ']');
c(evp.dropped.every(d => d.indexOf('=') === -1), 'B · ningun elemento de dropped lleva un valor');

// last_corr_id sigue apagado a proposito
c(!('last_corr_id' in correr(BASE).salida.fields),
  'B · last_corr_id NO se escribe todavia (la columna no existe)');
c(/_ESCRIBIR_LAST_CORR_ID = false/.test(code),
  'B · el interruptor de last_corr_id esta a false en el codigo');

process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
