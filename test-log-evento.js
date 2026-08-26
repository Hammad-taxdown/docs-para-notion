// test-log-evento.js — 26/08/2026 · WP-208 · la puerta del corr_id y del Log_Evento
// node docs/test-log-evento.js
'use strict';
const { construirCorrId, logEvento, RESULTADOS } = require('./nodo-log-evento-2026-08-26.js');
let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const c = (cond, s) => cond ? V(s) : X(s);

// `logEvento` escribe a stdout a proposito -- es un log. Aqui se silencia para que
// la salida de la puerta sea solo sus lineas, no las del sujeto que prueba.
const real = process.stdout.write.bind(process.stdout);
let mudo = false;
process.stdout.write = (...a) => mudo ? true : real(...a);
const ev = o => { mudo = true; try { return logEvento(o); } finally { mudo = false; } };

// El body REAL de la ejecucion 8129120, tal cual llego. No inventado.
const REAL = {
  conversation_id: '215475581167582',
  user_id: 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac',
  conversationPartId: '52219039912',
  message: 'Sí, confirmar',
  user_email: 'hammad.bellachhab@taxdown.es',
  conversation_part_id_debounce: '52219039912',
  'First Message ID': '3903053638'
};

// ── 1 · el corr_id se construye del body real, sin campos nuevos ─────────────
c(construirCorrId(REAL, 1) === '215475581167582:52219039912',
  'el corr_id sale del body REAL de Intercom, sin pedir nada nuevo');
c(construirCorrId(REAL, 2) === '215475581167582:52219039912:2',
  'un reintento REUTILIZA el corr_id y le pone :2 (sirve de clave de dedupe)');
c(construirCorrId(REAL, 1) === construirCorrId(REAL, undefined),
  'sin numero de intento se asume 1 y no se pone sufijo');

// ── 2 · fail-closed: sin las dos piezas NO se inventa un corr_id ────────────
c(construirCorrId({ conversation_id: '215475581167582' }, 1) === null,
  'sin conversationPartId devuelve null, no un corr_id a medias');
c(construirCorrId({ conversationPartId: '52219039912' }, 1) === null,
  'sin conversation_id devuelve null');
c(construirCorrId({}, 1) === null, 'body vacio devuelve null');
c(construirCorrId({ conversation_id: '  ', conversationPartId: ' ' }, 1) === null,
  'espacios en blanco no cuentan como valor');

// ── 3 · el respaldo del nombre de la clave ──────────────────────────────────
// `conversationPartId` es camelCase y `conversation_part_id_debounce` snake_case,
// y traen el MISMO valor. Si el DC cambia de nombre, el respaldo salva el turno.
const soloDebounce = { conversation_id: 'A', conversation_part_id_debounce: 'B' };
c(construirCorrId(soloDebounce, 1) === 'A:B',
  'si solo llega conversation_part_id_debounce, se usa como respaldo');
const soloCamel = { conversation_id: 'A', conversationPartId: 'B' };
c(construirCorrId(soloCamel, 1) === 'A:B', 'si solo llega conversationPartId, se usa');

// ── 4 · Log_Evento: EXACTAMENTE 6 campos ───────────────────────────────────
const l = ev({ corr_id: 'A:B', modo: 'solicitud', punto: 'cualifica',
  resultado: 'ok', ms: 412, dropped: ['x=1'] });
const claves = Object.keys(l).sort();
c(claves.length === 6, 'el evento tiene exactamente 6 claves (hoy: ' + claves.length + ')');
c(JSON.stringify(claves) === JSON.stringify(['corr_id', 'dropped', 'modo', 'ms', 'punto', 'resultado']),
  'las 6 claves son las del contrato: ' + claves.join(', '));

// ── 5 · LO QUE DE VERDAD IMPORTA: que no se cuele PII ──────────────────────
// El body lleva `message` y `user_email`. Un log con el body entero mete la frase
// del cliente y su correo en las ejecuciones de n8n.
const conPII = ev({ corr_id: 'A:B', resultado: 'ok', ms: 1,
  dropped: ['fecha_alta_ss=32/13/2026', 'salario=no se', 'email=cliente@ejemplo.com'] });
c(JSON.stringify(conPII.dropped) === JSON.stringify(['fecha_alta_ss', 'salario', 'email']),
  'dropped guarda NOMBRES de campo y tira los valores (no viaja PII)');
const s = JSON.stringify(conPII);
c(!/32\/13\/2026/.test(s), 'el valor de una fecha descartada NO aparece en el evento');
c(!/cliente@ejemplo\.com/.test(s), 'un correo descartado NO aparece en el evento');
c(!/no se/.test(s), 'lo que el cliente escribio NO aparece en el evento');
const delBody = ev({ corr_id: 'A:B', resultado: 'ok', ms: 1,
  modo: 'solicitud', punto: 'cualifica', dropped: [] });
c(!/message|user_email|Sí, confirmar/.test(JSON.stringify(delBody)),
  'el evento no arrastra ninguna clave del body');

// ── 6 · el enum de resultado es cerrado y falla HACIA fail_closed ──────────
c(ev({ resultado: 'inventado', ms: 0 }).resultado === 'fail_closed',
  'un resultado fuera del enum se degrada a fail_closed, no se propaga');
c(ev({ resultado: 'ok', ms: 0 }).resultado === 'ok', 'un resultado valido pasa tal cual');
for (const r of ['punto_desconocido', 'descarte_desconocido', 'user_id_forma_invalida',
  'user_id_or_conversation_id_missing']) {
  c(RESULTADOS.indexOf(r) !== -1, 'el enum incluye el rechazo real del escritor "' + r + '"');
}
c(ev({ resultado: 'ok', ms: 'abc' }).ms === 0, 'un ms no numerico se normaliza a 0');
c(Array.isArray(ev({ resultado: 'ok', dropped: 'no-es-array' }).dropped),
  'un dropped que no es array no revienta: sale array vacio');
c(ev({ resultado: 'ok' }).corr_id === '(sin-corr-id)',
  'sin corr_id se marca explicitamente, no se deja vacio y silencioso');

process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
