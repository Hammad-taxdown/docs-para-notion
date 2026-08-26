# -*- coding: utf-8 -*-
"""Inserta el corr_id y el Log_Evento en el codigo VIVO de `Validar y Normalizar`.

Las tres inserciones son quirurgicas y se hacen por ancla de texto, no por numero
de linea: si el codigo vivo cambia y el ancla desaparece, esto ABORTA en vez de
generar un COMPLETO silenciosamente mal montado.
"""
import io, json, sys, re

destino = sys.argv[1]
wf = json.load(io.open('proyecto-mobility/workflows-n8n/beckham_bot.json', encoding='utf-8'))
nodo = [n for n in wf['nodes'] if n['name'] == 'Validar y Normalizar']
if not nodo:
    sys.stderr.write("no se encuentra el nodo 'Validar y Normalizar' en el export\n"); sys.exit(1)
code = nodo[0]['parameters']['jsCode']
original = len(code)

def sustituir_una(txt, ancla, nuevo, que):
    if txt.count(ancla) != 1:
        sys.stderr.write("ABORTA · el ancla de '%s' aparece %d veces, se esperaba 1\n"
                         % (que, txt.count(ancla)))
        sys.exit(1)
    return txt.replace(ancla, nuevo, 1)

# ── 1 · la cabecera: corr_id y el reloj, justo despues del parseo del body ────
ANCLA1 = "// ── WP-205a · validación de FORMA del UserId ──────────────────────────────────"
BLOQUE1 = '''// ── WP-208 · corr_id y reloj · 26/08/2026 ─────────────────────────────────────
// Verificado en el body real de la ejecucion 8129120: los dos trozos YA LLEGAN,
// asi que esto no necesita ningun campo nuevo de Intercom.
//   conversation_id 215475581167582  ·  conversationPartId 52219039912
// Y son TRES claves para DOS cosas: `conversationPartId` (camelCase) y
// `conversation_part_id_debounce` traen el MISMO valor; la segunda es la unica
// que lee `If2`, y aqui va de respaldo por si el DC le cambia el nombre.
const _t0 = Date.now();
const _corrId = (function () {
  const c = String(body.conversation_id || '').trim();
  const p = String(body.conversationPartId || body.conversation_part_id_debounce || '').trim();
  if (!c || !p) return '(sin-corr-id)';   // fail-closed: no se inventa uno a medias
  const n = Number(body.intento) || 1;
  return c + ':' + p + (n > 1 ? ':' + n : '');
})();

// ── WP-208 · Log_Evento · EXACTAMENTE 6 campos, y por una razon ───────────────
// Ese mismo body lleva `message` y `user_email`. Volcar el body a un log mete la
// FRASE DEL CLIENTE Y SU CORREO en las ejecuciones de n8n, que se guardan y las ve
// cualquiera con acceso a la instancia. Asi que esto es minimo privilegio, no
// formato: `dropped` guarda NOMBRES de campo y TIRA los valores.
// Aqui se usa console.log a proposito: `process.stdout.write` es la regla de los
// SCRIPTS locales, no de un nodo de n8n, donde el log de la ejecucion es console.
const _RESULTADOS = ['ok', 'schema_error', 'punto_desconocido', 'descarte_desconocido',
  'user_id_forma_invalida', 'user_id_or_conversation_id_missing', 'dedup', 'multi_match',
  'persistencia_fallida', 'fail_closed'];
function _logEvento(resultado, dropped) {
  const r = _RESULTADOS.indexOf(resultado) === -1 ? 'fail_closed' : resultado;
  const ev = {
    corr_id: _corrId,
    modo: String(body.modo || ''),            // WP-210: hoy puede venir vacio
    punto: String(body.punto || ''),
    resultado: r,
    ms: Date.now() - _t0,
    dropped: (Array.isArray(dropped) ? dropped : []).map(function (d) {
      return String(d).split('=')[0];         // el nombre; el valor NO viaja
    })
  };
  console.log('[' + _corrId + '] ' + JSON.stringify(ev));
  return ev;
}

// ── WP-208 · last_corr_id · APAGADO A PROPOSITO ───────────────────────────────
// Escribirlo exige la columna en Airtable Y refrescar la lista de campos del nodo
// `Airtable Upser Expediente`, que es el SEXTO sitio de un campo nuevo y puede
// reactivar los 36 campos que se quitaron a proposito. Cuando la columna exista:
// poner esto a true, y nada mas.
const _ESCRIBIR_LAST_CORR_ID = false;

''' + ANCLA1
code = sustituir_una(code, ANCLA1, BLOQUE1, 'cabecera corr_id')

# ── 2 · rechazar(): que el rechazo tambien se loguee y lleve el corr_id ──────
ANCLA2 = """function rechazar(err) {
  return [{ json: {
    _invalid: true,
    error: err,"""
BLOQUE2 = """function rechazar(err) {
  _logEvento(err, []);                        // WP-208: un rechazo tambien es un evento
  return [{ json: {
    _invalid: true,
    error: err,
    corr_id: _corrId,"""
code = sustituir_una(code, ANCLA2, BLOQUE2, 'rechazar()')

# ── 3 · el return final: corr_id en la salida y el evento de exito ───────────
ANCLA3 = """return [{ json: {
  _invalid: false,
  fields,"""
BLOQUE3 = """if (_ESCRIBIR_LAST_CORR_ID) fields.last_corr_id = _corrId;
_logEvento('ok', descartadas);

// La clave `corr_id` se AÑADE, no sustituye a nada: los nodos de abajo leen
// `_invalid`, `fields`, `_hay_fechas_descartadas`, `_fechas_descartadas` y
// `_formula_userid`, y una clave de mas es inerte para ellos.
return [{ json: {
  _invalid: false,
  corr_id: _corrId,
  fields,"""
code = sustituir_una(code, ANCLA3, BLOQUE3, 'return final')

io.open(destino, 'w', encoding='utf-8').write(code)
sys.stdout.write("  montado desde el nodo vivo: %d -> %d caracteres (+%d)\n"
                 % (original, len(code), len(code) - original))
