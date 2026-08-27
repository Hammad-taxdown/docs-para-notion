// nodo-resolver-modo-2026-08-27.js — WP-211 · `Resolver_Modo`
//
// PIEZA FUENTE PARA PEGAR A MANO. Nodo de codigo de n8n dentro de `beckham_bot`
// (`nhOwpiGxikeU5DLR`), modo **Run Once for All Items**, colocado JUSTO DESPUES de
// `Webhook1` y ANTES de `If2`. `beckham_bot` NO se toca con `update_workflow` del
// MCP: exige reenviar el workflow entero y BORRA las credenciales de los nodos.
// Se pega con Cmd+A en el editor del nodo.
//
// Puerta: `node docs/test-resolver-modo.js` (ejecuta ESTE fichero con un $input de
// mentira; no compara su texto).
//
// ── QUE HACE, Y QUE NO ───────────────────────────────────────────────────────
// HACE cuatro cosas y ninguna de ellas escribe en ningun sitio:
//   1. valida el input `modo` de la llamada del Data Connector contra la whitelist
//      cerrada de WP-210 §2.1 y devuelve `{modo, origen, corr_id, part_id}`;
//   2. fail-closed EN MEMORIA: modo ausente o desconocido -> `faq_regimen`
//      (minimo privilegio), `origen='fail_closed'`, evento `modo_ausente` y
//      contador diario. **El modo inventado no se persiste en ninguna parte**;
//   3. DEDUPE por `conversation_part_id`: descarta toda part con id <= el ultimo
//      procesado de esa conversacion;
//   4. deriva `cold_start` de `modo` + `punto`, y deja de calcularlo como
//      `!last_message_content`.
//
// NO HACE: leer ningun atributo persistido de Intercom (transporte B, WP-210
// reescrito el 26/08: el modo viaja como input obligatorio de cada llamada al DC,
// y `modo_bot` desaparece del contrato salvo que T081 salga «B hibrida»). NO
// escribe en Airtable. NO llama a la API de Intercom. NO responde al usuario.
//
// ── POR QUE EL MODO NO PUEDE VENIR DEL BODY DEL WEBHOOK PUBLICO ──────────────
// El webhook es publico y falsificable: cualquiera puede golpearlo declarando
// `modo=solicitud`. El canal del canvas es el Data Connector, y ese es el unico
// que este nodo considera procedencia legitima (WP-210 §2.4 invariante 3). Un
// tercero que golpee el webhook sin la forma de una llamada de DC cae en
// fail-closed y se queda en `faq_regimen`, que no escribe expediente.
//
// ── EL WAIT2 DE 3 SEGUNDOS NO SE QUITA CON ESTO. LEER ANTES DE TOCARLO ───────
// Hoy `If2` NO es un dedupe: es la puerta de un DEBOUNCE. Su unica condicion es
// `$json.body.conversation_part_id_debounce` **notEmpty**, y ese campo LLEGA
// SIEMPRE (medido en el body real de la ejecucion 8129120), asi que `If2` pasa
// siempre por la rama true y `Wait2` espera sus 3 segundos en cada turno. Esos 3
// segundos hacen un trabajo que este dedupe NO hace: dejan que una RAFAGA de
// mensajes distintos del cliente se junte en un solo turno, porque
// `Formatear_conversacion1` vuelve a leer la conversacion entera de Intercom y
// recoge todas las parts pendientes de golpe.
//
// Este dedupe mata el caso «MISMA part dos veces» (reentrega de Intercom,
// reintento del webhook, doble clic). NO mata la rafaga: parts 100, 101 y 102 son
// tres ids CRECIENTES, ninguna es <= la anterior procesada, y salen tres turnos.
// Conclusion operativa, y es la razon del comentario: **el `Wait2` de 3 s solo se
// puede quitar CUANDO este dedupe este verificado en vivo Y se haya medido que la
// rafaga no produce respuestas duplicadas** — no antes, y nunca en el mismo
// movimiento que el pegado de este nodo. Un cambio, una prueba.
//
// ── DONDE VIVE «EL ULTIMO PART PROCESADO» ────────────────────────────────────
// En `$getWorkflowStaticData('global')`, que es el unico almacen que un nodo de
// codigo tiene entre ejecuciones sin inventar un campo nuevo. Limitaciones
// asumidas y escritas a proposito, porque marcan hasta donde llega esta garantia:
//   · se guarda al TERMINAR la ejecucion, asi que dos ejecuciones simultaneas de
//     la misma part pueden colarse las dos (otra razon por la que el `Wait2` se
//     queda hasta medirlo);
//   · es por workflow, no se comparte entre instancias de n8n;
//   · se poda a 500 conversaciones (LRU) para que no crezca sin limite.
// NO se usa Airtable (llegaria tarde) ni un Conversation attribute nuevo (WP-210
// §2.3 cierra la lista en cinco y `ultimo_part` no esta).
//
// ── EL CABLEADO QUE FALTA (no es parte de este pegado) ───────────────────────
//   · `Preparar_Prompt` tiene que leer `cold_start` de AQUI
//     (`$('Resolver_Modo').first().json.cold_start`) en vez de calcularlo con
//     `!last_message_content`. Es un cambio en OTRO nodo de codigo, con su propia
//     prueba: no se mete en el mismo pegado.
//   · la rama de aviso: `evento.resultado === 'modo_ausente'` -> `errorWorkflow` /
//     `Notificaciones_error` (WP-231, alerta 3). El contador diario ya viaja en
//     `fail_closed_hoy`.
//   · este nodo devuelve `body` tal cual, asi que `If2` sigue funcionando sin
//     tocar su expresion (`$json.body.conversation_part_id_debounce`) y el nodo se
//     puede insertar sin romper el debounce actual.

// ── WP-201 · parseo defensivo del body ────────────────────────────────────────
// El Data Connector de Intercom manda application/x-www-form-urlencoded con el
// JSON entero como UNICA CLAVE del body, asi que `body.modo` saldria undefined y
// TODOS los turnos caerian en fail-closed. Verificado en las ejecuciones 8052012 y
// 8052018 (27/07). Es el mismo bloque del escritor, a proposito: si aqui se parsea
// distinto que alli, el mismo turno tendria dos modos.
const _entrada = $input.first().json || {};
let body = (_entrada.body !== undefined) ? (_entrada.body || {}) : _entrada;

if (body && typeof body === 'object' && !Array.isArray(body) && body.modo === undefined) {
  const keys = Object.keys(body);
  if (keys.length === 1) {
    const candidatos = [keys[0], keys[0] + '=' + body[keys[0]]];
    for (const c of candidatos) {
      try {
        const parsed = JSON.parse(c);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          body = parsed;
          break;
        }
      } catch (e) {
        // no era JSON: se deja el body tal cual y la validacion decidira
      }
    }
  }
}

// ── WP-208 · corr_id y reloj · copiado TAL CUAL del escritor ─────────────────
// Los dos trozos YA LLEGAN en el body real (ejecucion 8129120), asi que esto no
// necesita ningun campo nuevo de Intercom:
//   conversation_id 215475581167582  ·  conversationPartId 52219039912
// Y son TRES claves para DOS cosas: `conversationPartId` (camelCase) y
// `conversation_part_id_debounce` traen el MISMO valor; la segunda es la unica que
// lee `If2`, y aqui va de respaldo por si el DC le cambia el nombre.
const _t0 = Date.now();
const _conversationId = String(body.conversation_id || '').trim();
const _partId = String(body.conversationPartId || body.conversation_part_id_debounce || '').trim();
const _corrId = (function () {
  if (!_conversationId || !_partId) return '(sin-corr-id)';   // no se inventa uno a medias
  const n = Number(body.intento) || 1;
  return _conversationId + ':' + _partId + (n > 1 ? ':' + n : '');
})();

// ── WP-208 · Log_Evento · EXACTAMENTE 6 campos, y por una razon ───────────────
// El body lleva `message` y `user_email`. Volcar el body a un log mete la FRASE
// DEL CLIENTE Y SU CORREO en las ejecuciones de n8n, que se guardan y las ve
// cualquiera con acceso a la instancia. Minimo privilegio, no formato: `dropped`
// guarda NOMBRES de campo y TIRA los valores.
// Aqui se usa console.log a proposito: `process.stdout.write` es la regla de los
// SCRIPTS locales, no de un nodo de n8n, donde el log de la ejecucion es console.
//
// El enum es el del escritor MAS UN VALOR: `modo_ausente`. No es un capricho de
// formato — WP-231 nombra la alerta 3 con esa cadena exacta, y un `fail_closed`
// generico no se distingue del resto de fallos al montar el filtro.
const _RESULTADOS = ['ok', 'schema_error', 'punto_desconocido', 'descarte_desconocido',
  'user_id_forma_invalida', 'user_id_or_conversation_id_missing', 'dedup', 'multi_match',
  'persistencia_fallida', 'fail_closed', 'modo_ausente'];

function _logEvento(resultado, modo, punto, dropped) {
  const r = _RESULTADOS.indexOf(resultado) === -1 ? 'fail_closed' : resultado;
  const ev = {
    corr_id: _corrId,
    modo: String(modo || ''),
    punto: String(punto || ''),
    resultado: r,
    ms: Date.now() - _t0,
    dropped: (Array.isArray(dropped) ? dropped : []).map(function (d) {
      return String(d).split('=')[0];         // el nombre; el valor NO viaja
    })
  };
  console.log('[' + _corrId + '] ' + JSON.stringify(ev));
  return ev;
}

// ── WP-210 §2.1 · la whitelist del modo, CERRADA ─────────────────────────────
// `menu` es un VALOR, no una ausencia (esa es la diferencia con el contrato viejo:
// antes el menu era el atributo vacio, y por eso habia algo que resetear).
const MODOS = ['menu', 'solicitud', 'faq_regimen', 'calculadora', 'lead_potencial', 'humano'];

// Minimo privilegio: el modo al que se cae cuando no hay modo declarado. `faq_regimen`
// contesta preguntas y NO escribe expediente, asi que un turno atrapado aqui es
// visible (el evento) y no ensucia la base.
const MODO_MINIMO = 'faq_regimen';

// WP-206 · la whitelist de `punto`, la misma del escritor. Aqui NO se rechaza un
// punto desconocido: este nodo no escribe nada y el rechazo con 400 es trabajo del
// escritor (`punto_desconocido`). Solo se usa para derivar `cold_start` y para
// avisar de una pareja modo/punto incoherente.
const PUNTOS = ['descarte_residencia', 'lead', 'cualifica', 'descarte_plazo',
  'faq_entrada', 'autodescarte_declarado'];

// WP-210 §2.2 · la tabla de cobertura, como dato. Cadena vacia = ese modo puede
// llegar sin punto (el menu, la calculadora, el humano, y el turno de la fecha).
const PARES = {
  menu:           [''],
  solicitud:      ['', 'descarte_residencia', 'cualifica', 'descarte_plazo'],
  lead_potencial: ['lead'],
  faq_regimen:    ['', 'faq_entrada', 'autodescarte_declarado'],
  calculadora:    [''],
  humano:         ['']
};

// ── #4 · cold_start SE DERIVA DE modo + punto, NO de last_message_content ────
// `cold_start=true` significa una sola cosa: **el bot tiene que abrir el turno
// porque el cliente no ha escrito nada que responder**. Antes se adivinaba con
// `!last_message_content`, que es el sintoma y no la causa: un handoff en frio con
// un `message` de relleno salia false, y un turno normal con el mensaje aun no
// indexado en Intercom salia true. Con la tabla es determinista.
const COLD_POR_PUNTO = {
  cualifica:              true,   // G · handoff en frio (WP-217): el bot se presenta
  lead:                   true,   // H · el DC se llama ANTES de preguntar nada (WP-224)
  descarte_residencia:    true,   // D · el bot da el mensaje de descarte y cierra
  descarte_plazo:         true,   // N · idem
  autodescarte_declarado: true,   // viene de un boton del FAQ, no de texto libre
  faq_entrada:            false   // el cliente ACABA de escribir su pregunta
};
const COLD_POR_MODO = {
  menu:           true,   // la bienvenida y el menu los abre el bot
  calculadora:    true,   // mensaje con el enlace, sin turno del cliente
  humano:         true,   // la escalada la redacta el bot
  lead_potencial: true,
  solicitud:      false,  // F/DC1: el cliente acaba de dar la fecha
  faq_regimen:    false   // turno de FAQ en curso
};

// ── el almacen del dedupe ────────────────────────────────────────────────────
const LIMITE_CONVERSACIONES = 500;

// Si esto sale false, el almacen es un objeto de usar y tirar: el dedupe NO
// sobrevive entre ejecuciones. En n8n `$getWorkflowStaticData` existe siempre, asi
// que solo puede pasar ejecutando el fichero fuera de n8n — y se dice en la salida
// en vez de dejar que `dedupe_aplicado:true` prometa una garantia que no hay.
const ALMACEN_PERSISTENTE = (typeof $getWorkflowStaticData === 'function');

function almacenar() {
  // `typeof` sobre un identificador que no existe NO revienta: asi este fichero se
  // puede ejecutar en la puerta y en n8n con el mismo texto.
  const raiz = ALMACEN_PERSISTENTE ? ($getWorkflowStaticData('global') || {}) : {};
  if (!raiz.resolver_modo || typeof raiz.resolver_modo !== 'object') raiz.resolver_modo = {};
  const a = raiz.resolver_modo;
  if (!a.partes || typeof a.partes !== 'object') a.partes = {};
  if (!Array.isArray(a.orden)) a.orden = [];
  if (!a.fail_closed || typeof a.fail_closed !== 'object') a.fail_closed = { dia: '', n: 0 };
  return a;
}

// Hora de Madrid siempre. 'sv-SE' da AAAA-MM-DD sin montar la fecha a mano.
function diaMadrid() {
  try {
    return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

function soloDigitos(id) {
  const s = String(id || '').trim();
  return /^\d+$/.test(s) ? s : null;
}

// Los part id de Intercom son numericos y crecientes (52219039912), pero pasan de
// lo que un Number representa sin perder precision en cuanto crezcan, asi que se
// comparan como BigInt y NUNCA con Number().
function mayorQue(a, b) {
  try { return BigInt(a) > BigInt(b); }
  catch (e) { return a.length > b.length || (a.length === b.length && a > b); }
}

const almacen = almacenar();

// ── 1 · validar el input `modo` ─────────────────────────────────────────────
// Normalizacion, NO invencion: se recortan espacios y se baja a minusculas, porque
// una mayuscula puesta a mano en el canvas mandaria un turno legitimo al
// fail-closed y el sintoma seria «el usuario se queda sin respuesta». Lo que no
// esta en la lista despues de normalizar, no entra.
const modoDeclarado = String(body.modo === undefined || body.modo === null ? '' : body.modo)
  .replace(/\s+/g, ' ').trim().toLowerCase();
const modoValido = MODOS.indexOf(modoDeclarado) !== -1;

const modo = modoValido ? modoDeclarado : MODO_MINIMO;
const origen = modoValido ? 'input_dc' : 'fail_closed';
const modoAusente = !modoValido;

// El punto no se rechaza aqui (no escribimos): se normaliza y se marca si no esta.
const puntoDeclarado = String(body.punto === undefined || body.punto === null ? '' : body.punto)
  .trim().toLowerCase();
const puntoValido = puntoDeclarado === '' || PUNTOS.indexOf(puntoDeclarado) !== -1;
const punto = (puntoDeclarado !== '' && PUNTOS.indexOf(puntoDeclarado) !== -1) ? puntoDeclarado : '';

// Aviso de cobertura (WP-210 §6): la pareja modo/punto que no esta en la tabla de
// §2.2 es una rama del canvas mal cableada. NO se bloquea el turno — solo se marca,
// porque bloquear convertiria un error de cableado en un usuario sin respuesta.
// Solo se evalua si el modo se declaro: en fail-closed el modo no es del canvas.
const parIncoherente = modoValido
  ? (PARES[modo] || []).indexOf(puntoValido ? puntoDeclarado : '__desconocido__') === -1
  : false;

// ── 4 · cold_start ──────────────────────────────────────────────────────────
// El punto manda sobre el modo cuando se conoce: es mas especifico.
// Y EN FAIL-CLOSED SIEMPRE false, aunque el punto que llego dijera `cualifica`: el
// punto viaja por el MISMO canal que el modo, asi que si el modo no es de fiar el
// punto tampoco. Si aqui se dejara mandar al punto, un tercero podria forzar el
// saludo de handoff en frio mandando `punto=cualifica` sin modo. En fail-closed el
// bot contesta lo que le hayan escrito y reofrece el menu: minimo privilegio
// tambien en la forma de abrir el turno.
const coldStart = !modoValido ? false
  : (punto !== '' && Object.prototype.hasOwnProperty.call(COLD_POR_PUNTO, punto))
    ? COLD_POR_PUNTO[punto]
    : (Object.prototype.hasOwnProperty.call(COLD_POR_MODO, modo) ? COLD_POR_MODO[modo] : false);

// ── 3 · DEDUPE por conversation_part_id ─────────────────────────────────────
// Se descarta toda part con id <= el ultimo procesado DE ESA CONVERSACION. La
// clave es la conversacion: dos hilos distintos pueden traer ids que se cruzan.
let dedupeAplicado = false;
let duplicado = false;
const ultimoVisto = String(almacen.partes[_conversationId] || '');

if (_conversationId && _partId) {
  dedupeAplicado = true;
  if (ultimoVisto) {
    const nuevoNum = soloDigitos(_partId);
    const viejoNum = soloDigitos(ultimoVisto);
    if (nuevoNum && viejoNum) {
      duplicado = !mayorQue(nuevoNum, viejoNum);      // nuevo <= ultimo -> fuera
    } else {
      // sin forma numerica no hay orden posible: solo se puede cazar la igualdad,
      // y se dice en el item (`dedupe_estricto: false`) en vez de fingir garantia.
      duplicado = (_partId === ultimoVisto);
    }
  }
}
// Si falta el conversation_id o el part_id no hay dedupe posible. El turno PASA —
// cortarlo aqui dejaria al cliente sin respuesta por un campo que no controla — y
// el `corr_id` sale como '(sin-corr-id)', que es la cadena que se busca en el log.

// Un turno emite EXACTAMENTE UN evento. Un duplicado NO cuenta como `modo_ausente`:
// si contara, el contador de fail-closed se llenaria de reentregas y la alerta de
// WP-231 dejaria de significar «hay una rama del canvas sin modo».
if (duplicado) {
  _logEvento('dedup', modo, puntoDeclarado, ['conversation_part_id']);
  // Salida VACIA: en n8n eso detiene la rama, asi que la segunda entrega de la
  // misma part no produce ninguna respuesta al usuario. Y el almacen NO se toca:
  // el ultimo procesado sigue siendo el que se proceso de verdad.
  return [];
}

// ── el contador diario del fail-closed (WP-211 §6) ──────────────────────────
// Se guarda en el mismo almacen. Lo que se guarda es UN NUMERO, no el modo: el
// fail-closed no se persiste en ninguna parte, ni aqui.
const hoy = diaMadrid();
if (almacen.fail_closed.dia !== hoy) almacen.fail_closed = { dia: hoy, n: 0 };
if (modoAusente) almacen.fail_closed.n = Number(almacen.fail_closed.n || 0) + 1;

// ── el turno se acepta: se avanza el ultimo part procesado ───────────────────
if (dedupeAplicado) {
  almacen.partes[_conversationId] = _partId;
  const i = almacen.orden.indexOf(_conversationId);
  if (i !== -1) almacen.orden.splice(i, 1);
  almacen.orden.push(_conversationId);                    // LRU: el ultimo, al final
  while (almacen.orden.length > LIMITE_CONVERSACIONES) {
    const fuera = almacen.orden.shift();
    delete almacen.partes[fuera];
  }
}

// `dropped` lleva NOMBRES, nunca valores: `modo` es el nombre del campo que no
// llego o que llego mal. El valor invalido NO se escribe en el log.
const evento = _logEvento(modoAusente ? 'modo_ausente' : 'ok', modo, puntoDeclarado,
  modoAusente ? ['modo'] : []);

// ── la salida ────────────────────────────────────────────────────────────────
// WP-211 §2 pide `{modo, origen, corr_id, part_id}`. El resto son campos de
// operacion para el cableado (routing, aviso, contador) y `body` va tal cual para
// que `If2` siga funcionando sin tocar su expresion.
// NO hay ninguna clave `fields` ni nada que un escritor consuma: este nodo no
// escribe, y el fail-closed no deja rastro persistido del modo inventado.
return [{
  json: {
    modo: modo,
    origen: origen,                     // 'input_dc' | 'fail_closed'
    corr_id: _corrId,
    part_id: _partId,
    conversation_id: _conversationId,
    punto: punto,                       // '' si no llego o no esta en la whitelist
    punto_declarado: puntoDeclarado,    // lo que llego, para depurar
    punto_valido: puntoValido,
    par_incoherente: parIncoherente,    // aviso de cobertura, NO bloquea
    cold_start: coldStart,
    modo_ausente: modoAusente,
    reoferta_menu: modoAusente,         // fail-closed: al usuario se le vuelve a ofrecer el menu
    fail_closed_hoy: Number(almacen.fail_closed.n || 0),
    dedupe_aplicado: dedupeAplicado,
    dedupe_estricto: dedupeAplicado && (soloDigitos(_partId) !== null),
    almacen_persistente: ALMACEN_PERSISTENTE,
    ultimo_part_previo: ultimoVisto,
    evento: evento,
    body: body
  }
}];
