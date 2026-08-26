// nodo-log-evento-2026-08-26.js — WP-208 · `Log_Evento`, EXACTAMENTE 6 campos
//
// PIEZA FUENTE. No esta pegada en n8n todavia: va con el cableado del escritor
// (WP-207 entregables 1 y 2), porque `last_corr_id` lo escribe el escritor.
//
// ── LO QUE SE VERIFICO EL 26/08 ANTES DE ESCRIBIR ESTO ────────────────────────
// El `corr_id` NO necesita ningun campo nuevo de Intercom. Medido en el body real
// de la ejecucion 8129120 (nodo If2, entrada de Webhook1):
//
//   { conversation_id: "215475581167582",
//     conversationPartId: "52219039912",
//     conversation_part_id_debounce: "52219039912",
//     message: "Si, confirmar", user_id: "eu-west-1:...", user_email: "..." }
//
// Los dos trozos del corr_id YA LLEGAN. Y ojo con los nombres, porque son tres
// claves distintas para dos cosas:
//   - `conversation_id`     -> el hilo
//   - `conversationPartId`  -> el mensaje. camelCase, no snake_case.
//   - `conversation_part_id_debounce` -> MISMO VALOR, y es la unica que lee `If2`.
// De paso quedo desmentida una sospecha mia: crei que ese campo no llegaba nunca y
// que el debounce estaba muerto cayendo siempre al else. LLEGA, y `Wait2` espera
// sus 3 segundos. La pista que me habia enganado (`waitTill: null` en 200
// ejecuciones) NO VALE: n8n no persiste una espera de 3 s, la mantiene en memoria.
//
// ── POR QUE 6 CAMPOS Y NI UNO MAS ────────────────────────────────────────────
// Ese mismo body lleva `message` y `user_email`. Volcar el body entero a un log
// mete PII del cliente en las ejecuciones de n8n, que las ve cualquiera con
// acceso a la instancia y que ademas se guardan. Los 6 campos son un contrato de
// MINIMO PRIVILEGIO, no un formato bonito: `dropped` lleva NOMBRES de campo, nunca
// sus valores.
'use strict';

// ── corr_id ──────────────────────────────────────────────────────────────────
// intento>1 en un reintento: mismo corr_id con sufijo, para que el reintento sea
// RASTREABLE como el mismo turno y sirva de clave de dedupe.
function construirCorrId(body, intento) {
  const conv = String((body && body.conversation_id) || '').trim();
  // el debounce y conversationPartId traen el mismo valor; se prefiere el
  // canonico y el otro queda de respaldo por si el DC cambia de nombre.
  const part = String(
    (body && (body.conversationPartId || body.conversation_part_id_debounce)) || ''
  ).trim();
  if (!conv || !part) return null;            // fail-closed: sin corr_id no se inventa uno
  const n = Number(intento) || 1;
  return conv + ':' + part + (n > 1 ? ':' + n : '');
}

// ── Log_Evento · los 6 campos, en orden fijo ─────────────────────────────────
const RESULTADOS = ['ok', 'schema_error', 'punto_desconocido', 'descarte_desconocido',
  'user_id_forma_invalida', 'user_id_or_conversation_id_missing', 'dedup', 'multi_match',
  'persistencia_fallida', 'fail_closed'];

function logEvento(ev) {
  const resultado = RESULTADOS.indexOf(ev.resultado) === -1 ? 'fail_closed' : ev.resultado;
  const linea = {
    corr_id: ev.corr_id || '(sin-corr-id)',
    modo: ev.modo || '',
    punto: ev.punto || '',
    resultado: resultado,
    ms: Number(ev.ms) || 0,
    // SOLO NOMBRES. Un valor aqui es PII en el log.
    dropped: Array.isArray(ev.dropped) ? ev.dropped.map(d => String(d).split('=')[0]) : []
  };
  // prefijo del corr_id en todo console.log, que es lo que hace buscable la ejecucion
  process.stdout.write('[' + linea.corr_id + '] ' + JSON.stringify(linea) + '\n');
  return linea;
}

module.exports = { construirCorrId, logEvento, RESULTADOS };
