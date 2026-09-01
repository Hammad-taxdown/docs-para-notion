// Preparar_Prompt_FAQ · 28/08/2026 · el SIDECAR del FAQ
//
// Nodo `code` NUEVO de `beckham_bot` (nhOwpiGxikeU5DLR), runOnceForAllItems.
// Diseno: docs/faq-diseno-2026-08-28.md §3.2. Puerta: docs/test-preparar-prompt-faq.js.
//
// ── QUE ES ESTE NODO ─────────────────────────────────────────────────────────
// El segundo de los SIETE del sidecar (31/08: son SIETE, no cinco -- entra el IF
// del corte y se cae Avisar_FAQ_Sin_Publicar, que lo hace el errorWorkflow):
//   Webhook_FAQ -> [Preparar_Prompt_FAQ] -> ¿Cortar_FAQ?
//        rama false -> Langsmith Prompt FAQ -> AI Agent FAQ -> Callback_Intercom_FAQ
//        rama true  -> Callback_Intercom_FAQ                  (0 tokens)
//   y Mensaje_Fallback_FAQ colgado de las DOS ramas de error, hacia el callback.
// No comparte NADA con la cadena del intake. Y lo que NO hace es la mitad del
// diseno, asi que se dice aqui arriba: no lee Airtable, no lee Intercom, no lee
// `chat_history`, no toca `Preparar_Prompt` ni `Validar y Normalizar`, no escribe
// en ningun sitio. La pregunta entra por `body.message` y nada mas. Cada una de
// esas ausencias es la solucion a un fallo mortal de los tres disenos que
// murieron (§1 del diseno), no una simplificacion.
//
// ── LO QUE SI HACE, EN ORDEN ─────────────────────────────────────────────────
//   1. Parsea el body defensivamente (el Data Connector manda form-urlencoded).
//   2. CORTA BARATO, antes de gastar una llamada al modelo. Son cuatro cortes.
//   3. Enmascara la PII del texto libre (WP-222), reutilizando el bloque
//      PATRONES_PII del v4 VERBATIM.
//   4. Monta `contexto` (tres bloques) y `prompt` (el turno del usuario).
//
// ── EL CORTE BARATO NECESITA UN NODO PROPIO, Y HAY QUE DECIRLO ───────────────
// Este nodo NO PUEDE, por si solo, evitar la llamada al modelo: en n8n un nodo de
// codigo no elige a que rama sale. Devuelve `_cortado: true` y el `output` ya
// escrito, y quien se salta el modelo es un IF de una linea entre este nodo y
// `Langsmith Prompt FAQ`:
//
//     ¿Cortar_FAQ?   condicion (boolean, is true):  {{ $json._cortado }}
//        true  -> Callback_Intercom_FAQ     (publica el `output` de aqui, 0 tokens)
//        false -> Langsmith Prompt FAQ      (el turno normal)
//
// Sin ese IF el nodo sigue siendo correcto y el cliente sigue recibiendo una
// respuesta, pero el corte deja de ahorrar la llamada: o sea que el unico freno
// de coste del lado servidor (§7 R5 del diseno) desaparece EN SILENCIO. Por eso
// va escrito aqui y como paso propio en docs/pasos-faq.sh.
//
// ── REGLAS DE LA CASA QUE SE CUMPLEN AQUI ────────────────────────────────────
// `$input.first()`, NUNCA `$('X').item` ni `$input.item`: el `.item` cuelga el
// task runner hasta el timeout. Y se devuelve UN item, no uno por entrada.

// ── PARSEO DEFENSIVO DEL BODY · copiado del escritor y de Resolver_Modo ──────
// El Data Connector de Intercom manda application/x-www-form-urlencoded con el
// JSON entero como UNICA CLAVE del body. Verificado en las ejecuciones 8052012 y
// 8052018 (27/07). Sin este bloque `body.message` saldria undefined y TODAS las
// preguntas caerian en el corte de "pregunta vacia": el FAQ contestaria siempre
// lo mismo, con la ejecucion en verde. Se parsea IGUAL que alli a proposito.
const _entrada = $input.first().json || {};
let body = (_entrada.body !== undefined) ? (_entrada.body || {}) : _entrada;

if (body && typeof body === 'object' && !Array.isArray(body) && body.message === undefined) {
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
        // no era JSON: se deja el body tal cual y el corte barato decidira
      }
    }
  }
}

const conversationId = String(body.conversation_id || '').trim();
const callbackToken = String(body.callback_token || '').trim();
const userId = String(body.user_id || '').trim();   // puede venir VACIO: es normal
const punto = String(body.punto || '').trim();      // en etapa 1 no lo consume nadie
const mensajeCrudo = (body.message === undefined || body.message === null) ? '' : String(body.message);

// El idioma lo decide el Data Connector (uno por cadena) y viene soldado en su
// Body. Cualquier cosa que no sea `en` es `es`: el FAQ no adivina idiomas.
const idioma = (String(body.idioma || '').trim().toLowerCase() === 'en') ? 'en' : 'es';

// ── LOS CUATRO CORTES BARATOS ────────────────────────────────────────────────
// El tope de 2.000 caracteres es del diseno §3.2: el systemMessage del v14 son
// ~66.020 caracteres y el webhook es publico, sin auth y sin rate limit, asi que
// esto y `maxIterations: 2` son los unicos frenos que existen hoy.
const TOPE_PREGUNTA = 2000;
const mensajeRecortado = mensajeCrudo.trim();

// Los textos que se publican sin pasar por el modelo. Bilingues, y con el SLA y
// el buzon del prompt v14 (24-48 horas, support@taxdown.es): si aqui dijeran otra
// cosa, el cliente veria dos promesas distintas en el mismo hilo.
const TEXTOS = {
  sin_destino: {
    es: 'Ha habido un problema tecnico y no he podido procesar tu pregunta. Escribenos a support@taxdown.es y te responde una persona en 24-48 horas.',
    en: 'Something went wrong on our side and I could not process your question. Write to support@taxdown.es and someone will reply within 24-48 hours.'
  },
  vacia: {
    es: 'No me ha llegado ninguna pregunta. Vuelve a escribirla y te contesto.',
    en: 'I did not receive any question. Please type it again and I will answer.'
  },
  larga: {
    es: 'Tu pregunta es demasiado larga para este canal. Resumela en unas pocas lineas, o escribenos a support@taxdown.es y te responde una persona en 24-48 horas.',
    en: 'Your question is too long for this channel. Please shorten it to a few lines, or write to support@taxdown.es and someone will reply within 24-48 hours.'
  }
};

let motivoCorte = '';
if (conversationId === '') motivoCorte = 'sin_conversation_id';
else if (callbackToken === '') motivoCorte = 'sin_callback_token';
else if (mensajeRecortado === '') motivoCorte = 'pregunta_vacia';
else if (mensajeRecortado.length > TOPE_PREGUNTA) motivoCorte = 'pregunta_demasiado_larga';

// El texto que toca por motivo. Los dos primeros cortes son el MISMO caso desde
// fuera -- no hay donde publicar -- y su `output` no lo va a leer nadie; se
// rellena igual para que la clave exista siempre y `Callback_Intercom_FAQ` no
// tenga que preguntar.
const CORTE_TEXTO = {
  sin_conversation_id: 'sin_destino',
  sin_callback_token: 'sin_destino',
  pregunta_vacia: 'vacia',
  pregunta_demasiado_larga: 'larga'
};

// ── WP-222 · ENMASCARADO DE PII DEL TEXTO LIBRE ──────────────────────────────
// VERBATIM del v4 (docs/nodo-preparar-prompt-DOS-AGENTES-2026-08-27.js:166-172).
// Aqui no hay `MODOS_ENMASCARADOS` porque el sidecar tiene UN modo y siempre
// enmascara: el FAQ es la puerta anonima del embudo y no necesita ni un dato.
//
// El ORDEN IMPORTA: email e IBAN antes que telefono, o el patron de telefono se
// come trozos de un IBAN y quedan restos reconocibles. Y NIF antes que telefono,
// porque un DNI de 8 digitos + letra no es un telefono.
// Los falsos positivos que se aceptan a proposito, para no tener que descubrirlos
// otra vez: un importe de 9 cifras escrito con puntos (987.654.321) sale como
// [TELEFONO]. Lo que NO se toca, y lo comprueba la puerta: 50.000, 60000, un ano
// (2026) y una fecha (02/03/2026).
const PATRONES_PII = [
  ['email',    /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g,               '[EMAIL]'],
  ['iban',     /\b[A-Za-z]{2}[0-9]{2}(?:[ -]?[A-Za-z0-9]{4}){3,6}(?:[ -]?[A-Za-z0-9]{1,4})?\b/g, '[IBAN]'],
  ['nif',      /\b(?:[XYZxyz][ -]?[0-9]{7}[ -]?[A-Za-z]|[0-9]{8}[ -]?[A-Za-z])\b/g,   '[NIF]'],
  // 31/08 · EL PREFIJO 00, QUE FALTABA Y SE COLABA ENTERO. Medido: '0034612345678'
  // atravesaba los dos patrones de abajo INTACTO. El de '+' exige el signo, y el
  // nacional lleva (?<![0-9]) -- que es justo lo que lo bloquea, porque el 6 va
  // precedido del 4 del '0034'. Este va ANTES para comerse el prefijo completo y
  // no dejar '00 34' de resto. Falsos positivos: ningun importe, año ni CP español
  // empieza por 00 seguido de 9 o mas digitos.
  ['telefono', /(?<![0-9])00[ .\-]?[0-9]{1,3}[ .\-]?[0-9](?:[ .\-]?[0-9]){7,13}/g,   '[TELEFONO]'],
  ['telefono', /\+[0-9]{1,3}[ .\-]?[0-9](?:[ .\-]?[0-9]){7,13}/g,                    '[TELEFONO]'],
  ['telefono', /(?<![0-9])[6-9][0-9]{2}[ .\-]?[0-9]{3}[ .\-]?[0-9]{3}(?![0-9])/g,     '[TELEFONO]'],
  // 31/08 · EL AGRUPADO 3-2-2-2 ('600 12 34 56'), que es como lo dicta la gente por
  // telefono. El patron de arriba exige grupos de 3+3 y este no encaja. Exige los
  // separadores (sin ellos son 9 digitos seguidos y ya los coge el de arriba).
  ['telefono', /(?<![0-9])[6-9][0-9]{2}[ .\-][0-9]{2}[ .\-][0-9]{2}[ .\-][0-9]{2}(?![0-9])/g, '[TELEFONO]']
];

// Contadores. Guardan CUANTOS, nunca QUE: el valor enmascarado no puede volver a
// aparecer en el item ni en el log, o el enmascarado no serviria de nada.
const pii = { email: 0, iban: 0, nif: 0, telefono: 0 };

function enmascararTexto(v) {
  if (typeof v !== 'string' || v === '') return v;
  let s = v;
  for (const [nombre, re, marca] of PATRONES_PII) {
    s = s.replace(re, function () { pii[nombre] += 1; return marca; });
  }
  return s;
}

// Se enmascara UNA SOLA VEZ. Llamar dos veces sobre el mismo texto doblaria los
// contadores y el numero dejaria de servir para nada.
const preguntaLimpia = enmascararTexto(mensajeRecortado);

// ── EL BLOQUE «MODO FAQ» DEL contexto ────────────────────────────────────────
// VERBATIM de `PROMPT_MODO.faq_regimen` del v4 (lineas 213-220). UNA sola fuente
// para este texto: si hay que cambiarlo, se cambia alli Y aqui en el mismo
// movimiento, y la puerta compara las dos copias linea a linea.
// La ultima linea es fija y no se monta desde ninguna lista: el agente del FAQ
// tiene CERO aristas `ai_tool`, asi que "ninguna" no es una opcion, es el grafo.
const BLOQUE_MODO_FAQ = [
  '--- MODO DE ESTE TURNO: FAQ ---',
  'Este turno es SOLO para contestar una pregunta sobre el regimen. NO estas haciendo el intake.',
  'No le pidas ningun dato personal. Si te da uno por su cuenta, dile que todavia no te hace falta, y NO lo repitas ni lo confirmes.',
  'En este turno no puedes guardar nada ni consultar su expediente: no le digas que has guardado ni que has mirado nada.',
  'Contesta UNA sola pregunta con lo que hay en este prompt. Si la respuesta no esta aqui, dilo y ofrecele hablar con una persona del equipo, que le responde en 24-48 horas.',
  'Puede que veas marcas como [EMAIL], [IBAN], [NIF] o [TELEFONO] en lo que ha escrito: son datos que se han ocultado a proposito. No los interpretes, no los adivines y no los pidas.',
  'Herramientas disponibles en este turno: ninguna.'
].join('\n');

// La linea del idioma es necesaria y esta razonada en §7 R2 del diseno: la linea 5
// del prompt v14 dice que el idioma es LO PRIMERO que se pregunta (D0), y en el
// FAQ ya viene decidido por la cadena del canvas. Sin esta linea el bot abre el
// turno del FAQ preguntando el idioma.
const LINEA_IDIOMA = (idioma === 'en')
  ? 'Idioma de este turno: inglés. Ya está decidido: NO lo preguntes.'
  : 'Idioma de este turno: español. Ya está decidido: NO lo preguntes.';

const LINEA_SITUACION = 'Situacion: el cliente ha entrado por el FAQ y todavia no ha dado ningun dato.';

// `contexto` es lo que recibe la plantilla de LangSmith y es LO ULTIMO que lee el
// modelo antes del turno del usuario (`{contexto}` es la ultima linea del v14).
// Tres bloques y nada mas: ni expediente, ni historial, ni datos conocidos.
const contexto = [BLOQUE_MODO_FAQ, '', LINEA_IDIOMA, LINEA_SITUACION].join('\n');

// El turno del usuario va ENMARCADO. Es la tercera mitigacion de R2: el marco es
// lo primero y lo ultimo que el modelo ve del mensaje.
const MARCO = '[MODO FAQ · SOLO INFORMACION]';
const prompt = MARCO + ' Pregunta del cliente: ' + preguntaLimpia;

// ── LA SALIDA ────────────────────────────────────────────────────────────────
// Contrato del §3.2: { contexto, prompt, callback_token, conversation_id, idioma,
// _pii }. Lo demas se anade porque cuesta una clave y evita un nodo:
//   · `_cortado` / `_motivo_corte` / `output` -> los lee el IF `¿Cortar_FAQ?`.
//   · `idioma` -> lo lee tambien `Mensaje_Fallback_FAQ`.
//   · `_car_pregunta` -> el numero que se mira cuando alguien dice "no contesto".
// El texto SIN enmascarar no sale de este nodo. Es lo que pide WP-222 y es
// comprobable: la puerta busca el NIE, el IBAN y el email en la salida entera.
const cortado = motivoCorte !== '';

// Una linea de log por ejecucion, con CERO datos del cliente: el conversation_id
// (que ya viaja en todos los demas logs), el motivo del corte y los contadores.
// Nunca el texto de la pregunta, ni enmascarado.
console.log('[faq:' + (conversationId || 'sin_conversation_id') + '] ' + JSON.stringify({
  idioma: idioma,
  cortado: cortado,
  motivo_corte: motivoCorte,
  car_pregunta: mensajeRecortado.length,
  pii: pii
}));

return [{ json: {
  contexto: contexto,
  prompt: prompt,
  callback_token: callbackToken,
  conversation_id: conversationId,
  idioma: idioma,
  _pii: pii,
  _cortado: cortado,
  _motivo_corte: motivoCorte,
  output: cortado ? TEXTOS[CORTE_TEXTO[motivoCorte]][idioma] : '',
  _car_pregunta: mensajeRecortado.length,
  _tope_pregunta: TOPE_PREGUNTA,
  user_id: userId,
  punto: punto
} }];
