// Preparar_Prompt · v2 · 3/08/2026
// CAMBIO: antes devolvia UN solo campo `prompt` que juntaba el turno del usuario,
// el bloque de datos conocidos y el historial. La plantilla de Langsmith tiene un
// hueco propio para el contexto, asi que ahora se devuelven DOS campos:
//   prompt   -> el turno del usuario (o la instruccion de arranque en frio) + historial
//   contexto -> el bloque DATOS QUE YA CONOCEMOS + la situacion (arranque en frio o no)
// `cold_start` se conserva por compatibilidad, aunque el systemMessage ya no lo lee:
// la situacion viaja dentro de `contexto`.

const j = $json;
const body = $('Webhook1').item.json.body || {};
const conv = $('Traer_Conversacion_intercom1').item.json || {};
const attrs = conv.custom_attributes || {};

const raw = j.last_message_content;
const cold = !raw || String(raw).trim() === '';

const dato = (v) => (v === undefined || v === null || String(v).trim() === '') ? null : String(v).trim();

const conocidos = [
  ['Nombre', dato(body.nombre_apellidos)],
  ['Email', dato(body.user_email) || dato(j.user_email)],
  ['Telefono', dato(body.telefono)],
  ['Veredicto del plazo', dato(attrs.veredicto_f2)],
  ['Fecha limite para solicitar', dato(attrs.fecha_limite_f2)]
].filter(function (par) { return par[1] !== null; })
 .map(function (par) { return '- ' + par[0] + ': ' + par[1]; })
 .join('\n');

const bloqueDatos = conocidos
  ? '--- DATOS QUE YA CONOCEMOS (no los vuelvas a preguntar) ---\n' + conocidos
  : '--- DATOS QUE YA CONOCEMOS ---\n(ninguno)';

const historial = dato(j.chat_history) || '(sin historial previo)';

const instruccionArranque = [
  '[ARRANQUE_EN_FRIO]',
  'El usuario acaba de completar la cualificacion para el regimen Beckham y todavia no ha escrito ningun mensaje.',
  'Presentate brevemente, agradece los datos que ya ha aportado y haz UNA sola pregunta para avanzar.',
  'No repitas preguntas ya respondidas en el historial ni pidas datos que ya conocemos.'
].join('\n');

// ── El turno del usuario ──────────────────────────────────────────────────────
const prompt = [
  cold ? instruccionArranque : String(raw),
  '',
  '--- HISTORIAL DE LA CONVERSACION ---',
  historial
].join('\n');

// ── El contexto, que va al systemMessage por la plantilla de Langsmith ────────
const contexto = [
  bloqueDatos,
  '',
  'Situacion: ' + (cold
    ? 'arranque en frio, el usuario todavia no ha escrito nada'
    : 'conversacion en curso')
].join('\n');

return { json: { ...j, prompt, contexto, cold_start: cold } };
