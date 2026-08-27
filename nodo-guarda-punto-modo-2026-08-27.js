// ── WP-207 + WP-219 capa 3 · LA GUARDA DEL ESCRITOR UNICO ─────────────────────
// Es el PRIMER nodo despues del trigger A PROPOSITO: si un valor no esta en la
// lista, se para aqui y NO se llega a tocar Airtable. Tres listas cerradas:
//   1. `punto` — la misma whitelist que el validador (esa es la del contrato,
//      esta es la capa 3; se repiten a proposito, es defensa en profundidad).
//   2. `modo`  — los seis valores del transporte B (26/08). No existe modo_bot.
//   3. la MATRIZ punto x modo — que es lo unico que solo vive aqui.
// Y una cuarta que no es una lista de valores sino de NOMBRES: el contrato
// declara additionalProperties:false, asi que una clave que no este en el
// contrato es schema_error, no un dato que se ignora en silencio.
//
// HONESTIDAD OBLIGATORIA (WP-219 §, y esta escrito para que nadie lo olvide):
// esta capa y la topologica COMPARTEN ORIGEN — las dos leen la salida del
// resolver. Protege contra errores de CABLEADO, no contra un resolver
// equivocado. La defensa independiente es que la arista ai_tool no exista.
'use strict';
const _t0 = Date.now();
const entrada = $input.first().json || {};

// ── las tres listas cerradas ──────────────────────────────────────────────────
const PUNTOS = ['cualifica', 'lead', 'descarte_plazo', 'descarte_residencia',
  'autodescarte_declarado', 'faq_entrada'];

const MODOS = ['menu', 'solicitud', 'faq_regimen', 'calculadora', 'lead_potencial', 'humano'];

// MATRIZ modo -> puntos permitidos.  '' = llamada SIN punto (solo campos), que es
// como llama la tool `guardar_datos_cliente`: no declara `punto` a proposito.
// Sacada del mapa del canvas (docs/canvas-desde-cero-2026-08-27.md §1.1), rama a
// rama, no de memoria:
//   RAMA SOLICITUD -> D descarte_residencia · H lead · G cualifica · N descarte_plazo
//   tras H el hilo queda ABIERTO en modo=lead_potencial y P/R enriquecen la MISMA
//   fila -> solo campos, sin punto
//   RAMA FAQ -> faq_entrada, y el autodescarte de WP-215 (NUNCA Descarte a pelo)
//   RAMA CALCULADORA -> invariante explicita del canvas: «no escribe expediente»
//   RAMA HUMANO -> WP-223 asigna a Ops_Mobility; no escribe expediente
//   MENU -> ninguna salida del menu escribe
const MATRIZ = {
  solicitud:      ['', 'cualifica', 'lead', 'descarte_plazo', 'descarte_residencia'],
  lead_potencial: [''],
  faq_regimen:    ['', 'faq_entrada', 'autodescarte_declarado'],
  calculadora:    [],
  humano:         [],
  menu:           []
};

// Las 49 claves que el subworkflow acepta: las 46 del contrato v1 mas las tres
// del transporte (`modo`, `corr_id`, `idem_key`). Cualquier otra -> schema_error.
const CONTRATO = ['user_id', 'intercom_conversation_id', 'punto', 'modo', 'corr_id', 'idem_key',
  'Descarte', 'adjuntos', 'alta_ss', 'apellido_primero', 'apellido_segundo', 'apellidos',
  'calle', 'codigo_postal', 'conyuge_quiere_acogerse', 'discrepancia_fecha_alta', 'email',
  'estado_civil', 'fecha_alta_ss', 'fecha_desplazamiento', 'fecha_limite_plazo',
  'fecha_nacimiento', 'fecha_prevista_alta', 'hijos', 'idioma', 'inversiones', 'lead_potencial',
  'motivo_cierre', 'municipio_nacimiento', 'municipio_residencia', 'nacionalidad', 'nif',
  'nombre', 'numero', 'pais_nacimiento', 'planta', 'propiedades', 'provincia_nacimiento',
  'puerta', 'quiere_acogerse', 'resumen', 'salario', 'senales_complejidad', 'sexo', 'telefono',
  'tipo_beckham', 'tipo_documento', 'tipo_via', 'ultimo_pais_residencia'];

// ── EL INTERRUPTOR DEL MODO AUSENTE ───────────────────────────────────────────
// Mientras el webhook publico siga DELEGANDO en este subworkflow sin mandar el
// modo (hoy no lo manda: el modo va como input del DC, nunca en el body del
// webhook), exigirlo aqui dejaria al usuario sin respuesta. Asi que un modo
// vacio PASA y se emite el evento `modo_ausente`, que es la senal que pide
// WP-219 §6 y la alerta 3 de las cinco de WP-231.
// CUANDO la tabla de cobertura de WP-210 §2.2 este firmada y TODOS los DC manden
// el modo: poner esto a true, y nada mas. Es la unica linea que cambia.
const _EXIGIR_MODO = false;

// ── el corr_id ────────────────────────────────────────────────────────────────
// Aqui NO se recalcula: en el subworkflow llega montado por workflowInputs. Si no
// llega, se marca fail-closed en vez de inventar uno a medias, que es la misma
// regla del nodo `Validar y Normalizar`.
const corrId = String(entrada.corr_id || '').trim() || '(sin-corr-id)';

const punto = String(entrada.punto === undefined || entrada.punto === null ? '' : entrada.punto).trim();
const modo  = String(entrada.modo  === undefined || entrada.modo  === null ? '' : entrada.modo).trim();
const idem  = String(entrada.idem_key === undefined || entrada.idem_key === null ? '' : entrada.idem_key).trim();

// ── el evento · LOS MISMOS 6 CAMPOS que `Validar y Normalizar` ────────────────
// Y por la misma razon: el body lleva la frase del cliente y su correo, y las
// ejecuciones de n8n se guardan y las ve cualquiera con acceso a la instancia.
// `campos` guarda NOMBRES; ningun valor viaja.
const _RESULTADOS = ['ok', 'schema_error', 'punto_desconocido', 'modo_no_permitido',
  'descarte_desconocido', 'user_id_forma_invalida', 'user_id_or_conversation_id_missing',
  'dedup', 'multi_match', 'persistencia_fallida', 'fail_closed'];

function _logEvento(resultado, campos) {
  const r = _RESULTADOS.indexOf(resultado) === -1 ? 'fail_closed' : resultado;
  const ev = {
    corr_id: corrId,
    modo: modo,
    punto: punto,
    resultado: r,
    ms: Date.now() - _t0,
    dropped: (Array.isArray(campos) ? campos : []).map(function (d) {
      return String(d).split('=')[0];
    })
  };
  console.log('[' + corrId + '] ' + JSON.stringify(ev));
  return ev;
}

// Un rechazo de la guarda ES la respuesta del subworkflow: sale por la rama falsa
// del If y no pasa por Airtable. Trae ya el enum cerrado y `campos[]`.
function rechazar(resultado, campos) {
  _logEvento(resultado, campos);
  return [{ json: {
    _guarda: 'rechazo',
    ok: false,
    resultado: resultado,
    campos: campos,
    dropped: [],
    corr_id: corrId,
    punto: punto,
    modo: modo,
    idem_key: idem
  } }];
}

// ── 1 · claves fuera del contrato (additionalProperties:false) ────────────────
const intrusas = Object.keys(entrada).filter(function (k) {
  return CONTRATO.indexOf(k) === -1;
});
if (intrusas.length) return rechazar('schema_error', intrusas.sort());

// ── 2 · whitelist de `punto` ──────────────────────────────────────────────────
if (punto && PUNTOS.indexOf(punto) === -1) return rechazar('punto_desconocido', ['punto']);

// ── 3 · whitelist de `modo` ───────────────────────────────────────────────────
if (modo && MODOS.indexOf(modo) === -1) return rechazar('modo_no_permitido', ['modo']);
if (!modo && _EXIGIR_MODO) return rechazar('modo_no_permitido', ['modo']);
if (!modo) console.log('[' + corrId + '] ' + JSON.stringify({
  corr_id: corrId, evento: 'modo_ausente', punto: punto
}));

// ── 4 · la matriz punto x modo ────────────────────────────────────────────────
// El caso que verifica el PRD: punto=cualifica con modo=faq_regimen -> rechazo.
if (modo && MATRIZ[modo].indexOf(punto) === -1) {
  return rechazar('modo_no_permitido', ['modo', 'punto']);
}

// ── PASA · se monta el `body` que espera `Validar y Normalizar` ───────────────
// Se llama `body` a proposito: asi el nodo del validador es el COMPLETO de
// `beckham_bot` SIN TOCAR una linea de su logica (lee $input.first().json.body).
//
// Y SE TIRAN LOS VACIOS. workflowInputs rellena con '' o null lo que el llamante
// no manda, y un '' que llega hasta el Upser con typecast:true es una escritura
// de verdad: BORRARIA el dato bueno de la fila. La incognita 8 de WP-226 (¿pisa
// el undefined?) no se resuelve aqui, se ESQUIVA: lo que no viene, no viaja.
// Ojo con lo que SI tiene que sobrevivir: `false` y el 0.
const body = {};
for (const k of CONTRATO) {
  const v = entrada[k];
  if (v === undefined || v === null) continue;
  if (typeof v === 'string' && v.trim() === '') continue;
  if (Array.isArray(v) && v.length === 0) continue;
  body[k] = v;
}
body.corr_id = corrId;

return [{ json: { _guarda: 'ok', body: body, _corr_id: corrId, _idem_key: idem } }];
