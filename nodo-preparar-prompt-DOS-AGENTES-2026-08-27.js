// Preparar_Prompt · v4 · 27/08/2026 · WP-218 + WP-222
//
// EL v3 ENTERO SE QUEDA TAL CUAL DEBAJO. Lo de arriba es lo que se le anade hoy, y
// se anade en CINCO sitios por ancla de texto con
// `python3 docs/montar-nodo-preparar-prompt.py`. Puerta:
// `node docs/test-preparar-prompt-dos-agentes.js`.
//
// ── QUE ENTRA HOY ────────────────────────────────────────────────────────────
//   (a) LEE EL MODO de `Resolver_Modo` (WP-211) y deriva a que nodo de agente le
//       toca el turno (`agente`), que es lo que enruta el IF de WP-218.
//   (b) MONTA EL BLOQUE `prompt_modo`, corto, y lo pega AL FINAL del `contexto`.
//   (c) EN MODO faq_regimen ENMASCARA la PII del texto libre (email, IBAN,
//       NIE/DNI, telefono) ANTES de que entre en el prompt. Eso es WP-222, y vive
//       aqui porque es este nodo el que arma el texto que ve el modelo.
//
// ── EL prompt_base NO SE DUPLICA, Y NO HACE FALTA NINGUN NODO Set ─────────────
// WP-218 §2 pedia «un nodo Set como unica fuente del prompt_base». MEDIDO HOY
// CONTRA EL WORKFLOW VIVO: el prompt_base NO esta en n8n. Sale de LangSmith
// (`bot_mobility_prompt`, tag `prod`) por el nodo `Langsmith Prompt`, que ya es UN
// SOLO NODO y ya esta AGUAS ARRIBA del IF, asi que los dos nodos de agente reciben
// el MISMO `$json.bot_mobility_prompt` en el mismo item. Meter un Set con una copia
// del prompt_base crearia exactamente la deriva (MF5) que el WP quiere evitar: dos
// textos que hay que cambiar a la vez. Asi que el invariante se cumple por
// topologia, y la comprobacion es la del §5 del WP: `contexto_base` IDENTICO en los
// dos modos, y `contexto = contexto_base + prompt_modo`. Lo verifica la puerta.
// Corolario que hay que respetar al cablear: `Langsmith Prompt` va ANTES del IF.
// Si algun dia se duplica ese nodo, vuelve la deriva por otra puerta.
//
// ── SIN `Resolver_Modo` ESTE NODO SE COMPORTA EXACTAMENTE COMO EL v3 ──────────
// Y no es una comodidad: es lo unico seguro. Si el resolver todavia no esta pegado
// no existe el IF, asi que el agente sigue siendo UNO con sus tres tools
// cableadas. Caer al minimo privilegio (`faq_regimen`) le meteria a ESE agente el
// bloque «no estas haciendo el intake», y el bot dejaria de pedir datos EN
// PRODUCCION sin que nada fallara. Asi que sin resolver: `modo=''`,
// `modo_origen='sin_resolver'`, `prompt_modo=''`, cero enmascarado, `contexto`
// byte a byte el del v3 y NI UNA LINEA de log nueva. La puerta lo compara contra
// la salida del codigo vivo del export, no contra una copia.
//
// ── LO QUE NO ENTRA HOY, Y POR QUE ───────────────────────────────────────────
// `cold_start` SIGUE saliendo de `!last_message_content`. El sticky de
// `Resolver_Modo` pide que salga de ahi (es determinista y el actual es el
// sintoma), pero eso cambia CUANDO se presenta el bot y se mide en conversacion,
// no en una puerta: un cambio, una prueba. Va con su propio pegado.
// Preparar_Prompt · v3 · 17/08/2026
//
// QUE CAMBIA Y POR QUE. Hasta hoy el bloque "DATOS QUE YA CONOCEMOS" se armaba con
// SEIS campos y ninguno venia de Airtable: salian del body del Data Connector y de
// los custom attributes de la conversacion de Intercom. Resultado medido en la
// conversacion 215475520917125: al agente le llegaron CUATRO datos (email, fecha de
// alta en la SS, veredicto del plazo y fecha limite) y volvio a preguntar la fecha
// de llegada, la nacionalidad y el pais de nacimiento, QUE ESTABAN GUARDADOS EN
// AIRTABLE desde la conversacion anterior.
//
// El expediente entraba en la conversacion solo si el agente decidia llamar a la
// tool leer_expediente. Eso es una decision del LLM, o sea que no es una garantia.
// AHORA EL EXPEDIENTE VIENE DE AIRTABLE Y ENTRA SIEMPRE, en el systemMessage, sin
// que el agente tenga que hacer nada.
//
// ── LA LECTURA NO PUEDE TUMBAR LA CONVERSACION ────────────────────────────────
// El nodo Leer_Expediente_Para_Prompt va con alwaysOutputData:true y
// onError:continueRegularOutput, igual que Leer_Status_Actual y Leer_MotivoCierre.
// Si Airtable falla o no encuentra fila, emite un item vacio y aqui se trata como
// "cliente nuevo". Un cliente nuevo NO PUEDE quedarse sin respuesta porque su
// expediente todavia no exista.
//
// ── POR QUE NO SE USA $json ───────────────────────────────────────────────────
// Al meter el nodo de Airtable en medio, $json ya NO es la salida de
// Formatear_conversacion1: es la fila de Airtable. Los datos de la conversacion se
// leen EXPLICITAMENTE con $('Formatear_conversacion1').first(), que ademas deja el
// nodo inmune a que alguien vuelva a cambiar el orden de la cadena.
// Y es .first(), NUNCA .item: en un nodo de codigo el .item cuelga el task runner
// hasta el timeout (regla del proyecto, con prueba).

const conv0 = $('Formatear_conversacion1').first().json || {};
const body = $('Webhook1').first().json.body || {};
const conv = $('Traer_Conversacion_intercom1').first().json || {};
const attrs = conv.custom_attributes || {};

// La fila de Airtable. Con alwaysOutputData puede llegar {} o sin `fields`.
const filaCruda = $('Leer_Expediente_Para_Prompt').all()
  .map(function (i) { return i.json || {}; })
  .filter(function (x) { return typeof x.id === 'string' && x.id.startsWith('rec'); });
const nFilas = filaCruda.length;
const fila = filaCruda[0] || {};
const e = fila.fields ? fila.fields : {};
const existe = typeof fila.id === 'string' && fila.id.startsWith('rec');

// ── WP-218 · DE QUE MODO ES ESTE TURNO ───────────────────────────────────────
// La whitelist es la MISMA de `Resolver_Modo` y del `Guarda de punto y modo` del
// subworkflow escritor. Se repite a proposito (defensa en profundidad), pero si un
// dia cambia, cambia en los TRES sitios.
const MODOS = ['menu', 'solicitud', 'faq_regimen', 'calculadora', 'lead_potencial', 'humano'];
const MODO_MINIMO = 'faq_regimen';

// Los dos nodos de agente de WP-218, y que modos van a cada uno. El corte es el
// mismo que la MATRIZ del escritor: los modos que ESCRIBEN expediente van al nodo
// que tiene cableadas las tools de intake; los que no escriben, al que no las
// tiene. `lead_potencial` va con `solicitud` porque tras el punto H el hilo sigue
// abierto y P/R enriquecen la MISMA fila (canvas §1.1), o sea que guarda datos.
const MODOS_AGENTE_SOLICITUD = ['solicitud', 'lead_potencial'];

// LAS TOOLS QUE CADA NODO TIENE CABLEADAS DE VERDAD, hoy 27/08. Medido por MCP en
// las aristas `ai_tool` del grafo, no leido de un PRD: `guardar_datos_cliente`,
// `leer_expediente` y `analizar_documento` cuelgan del unico `AI Agent` que hay.
// El nodo FAQ nace con CERO tools, y eso es la capa 1 de WP-219: la arista no
// existe, asi que no hay nada que el LLM pueda desobedecer.
// AL AÑADIR UNA TOOL (WP-223: escalar_humano, registrar_optout) SE TOCAN DOS
// SITIOS: la arista en n8n y esta tabla. Si solo se toca la tabla, el prompt
// nombra una tool que no existe y el agente promete algo que no puede hacer.
const TOOLS_POR_AGENTE = {
  solicitud: ['guardar_datos_cliente', 'leer_expediente', 'analizar_documento'],
  faq:       [],
  unico:     ['guardar_datos_cliente', 'leer_expediente', 'analizar_documento']
};

// El universo de nombres de tool que existen o estan planificados. Solo sirve para
// la guarda de abajo: cazar un nombre de tool colado en la prosa de un bloque.
const TOOLS_UNIVERSO = ['guardar_datos_cliente', 'leer_expediente', 'analizar_documento',
  'escalar_humano', 'registrar_optout', 'generar_informe', 'enviar_reporte'];

let modo = '';
let modoOrigen = 'sin_resolver';
let corrId = '(sin-corr-id)';

// `$('Resolver_Modo')` REVIENTA si el nodo no existe todavia, y tambien si existe
// pero no ha emitido nada. Las dos cosas significan lo mismo aqui -- no hay
// resolver -- y las dos tienen que dejar el nodo comportandose como el v3.
try {
  const _r = $('Resolver_Modo').first().json || {};
  const _m = String(_r.modo === undefined || _r.modo === null ? '' : _r.modo).trim().toLowerCase();
  corrId = String(_r.corr_id || '(sin-corr-id)');
  if (MODOS.indexOf(_m) !== -1) {
    modo = _m;
    modoOrigen = 'resolver';
  } else {
    // El resolver ESTA y no manda modo: eso ya no es «no hay topologia nueva», es
    // un resolver roto. Aqui si toca minimo privilegio, igual que en el resolver.
    modo = MODO_MINIMO;
    modoOrigen = 'resolver_sin_modo';
  }
} catch (e) {
  modo = '';
  modoOrigen = 'sin_resolver';
}

const agente = (modo === '')
  ? 'unico'
  : (MODOS_AGENTE_SOLICITUD.indexOf(modo) !== -1 ? 'solicitud' : 'faq');
const toolsModo = TOOLS_POR_AGENTE[agente] || [];

// ── WP-222 · ENMASCARADO DE PII DEL TEXTO LIBRE ──────────────────────────────
// Solo en los modos de esta lista, y hoy es UNO. En `solicitud` el NIE, el
// telefono y el email SON EL DATO que hay que recoger: enmascararlos ahi romperia
// el intake. En `menu`, `calculadora` y `humano` no hay texto libre del cliente
// (son botones), asi que no hace falta; si algun dia lo hay, se anaden aqui.
const MODOS_ENMASCARADOS = ['faq_regimen'];
const ENMASCARAR = MODOS_ENMASCARADOS.indexOf(modo) !== -1;

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

// Devuelve lo que no es cadena TAL CUAL (null, undefined, numeros): asi con
// ENMASCARAR=false esta funcion es la identidad y el v3 no cambia en nada.
function enmascararTexto(v) {
  if (!ENMASCARAR) return v;
  if (typeof v !== 'string' || v === '') return v;
  let s = v;
  for (const [nombre, re, marca] of PATRONES_PII) {
    s = s.replace(re, function () { pii[nombre] += 1; return marca; });
  }
  return s;
}

// ── WP-218 · EL BLOQUE prompt_modo ───────────────────────────────────────────
// CORTO a proposito: el prompt_base son 65.848 caracteres y esto es lo unico que
// cambia entre los dos nodos. Cada bloque dice tres cosas -- que se hace en este
// turno, que NO se hace, y que herramientas hay -- y la linea de herramientas se
// monta desde TOOLS_POR_AGENTE, para que no exista una segunda lista que se
// desincronice.
const PROMPT_MODO = {
  solicitud: [
    '--- MODO DE ESTE TURNO: SOLICITUD ---',
    'Estas completando el expediente de este cliente. Pregunta UNA cosa cada vez y no vuelvas a pedir nada que aparezca arriba en DATOS QUE YA CONOCEMOS.',
    'Guarda cada dato EN CUANTO el cliente lo confirme, sin esperar a tenerlos todos: una conversacion que se abandona a mitad se pierde entera.'
  ],
  lead_potencial: [
    '--- MODO DE ESTE TURNO: LEAD ---',
    'Este cliente TODAVIA NO esta de alta en la Seguridad Social, asi que hoy no puede presentar la solicitud y no hay ningun plazo corriendo. No le metas prisa.',
    'Lo unico que interesa hoy es cuando prevee empezar a trabajar en Espana, aunque sea aproximado. Si te dice que no lo sabe, guardalo como desconocido y NO insistas.',
    'No le pidas documentos ni le hables de la solicitud como si fuera inmediata.'
  ],
  faq_regimen: [
    '--- MODO DE ESTE TURNO: FAQ ---',
    'Este turno es SOLO para contestar una pregunta sobre el regimen. NO estas haciendo el intake.',
    'No le pidas ningun dato personal. Si te da uno por su cuenta, dile que todavia no te hace falta, y NO lo repitas ni lo confirmes.',
    'En este turno no puedes guardar nada ni consultar su expediente: no le digas que has guardado ni que has mirado nada.',
    'Contesta UNA sola pregunta con lo que hay en este prompt. Si la respuesta no esta aqui, dilo y ofrecele hablar con una persona del equipo, que le responde en 24-48 horas.',
    'Puede que veas marcas como [EMAIL], [IBAN], [NIF] o [TELEFONO] en lo que ha escrito: son datos que se han ocultado a proposito. No los interpretes, no los adivines y no los pidas.'
  ],
  menu: [
    '--- MODO DE ESTE TURNO: MENU ---',
    'El cliente esta en la entrada. Saluda, di en una linea que puedes ayudarle con el regimen de Beckham y ofrecele las opciones. No le pidas ningun dato.'
  ],
  calculadora: [
    '--- MODO DE ESTE TURNO: CALCULADORA ---',
    'El cliente ha pedido calcular su ahorro. El calculo NO lo haces tu y no tienes los tipos ni las tablas: no des ninguna cifra propia ni la estimes.',
    'Si te pregunta, dilo con naturalidad y ofrecele volver al menu o hablar con una persona del equipo.'
  ],
  humano: [
    '--- MODO DE ESTE TURNO: ESCALADO A UNA PERSONA ---',
    'El cliente ha pedido hablar con una persona. Confirmaselo en una linea, dile que el equipo le responde en 24-48 horas y no le pidas ningun dato mas.'
  ]
};

// La guarda del §5 de WP-218: «el prompt de cada modo NO nombra ninguna tool no
// conectada a su nodo». Se comprueba en la puerta, y TAMBIEN aqui en caliente,
// porque el dia que alguien edite la prosa de un bloque y nombre una tool que no
// esta cableada, el sintoma seria el agente prometiendo algo que no puede hacer.
// No revienta el turno (eso dejaria al cliente sin respuesta): tacha el nombre y
// lo saca en `_tools_ajenas`, que se ve en el item y en el log.
let toolsAjenas = [];

function construirPromptModo() {
  if (modo === '' || !PROMPT_MODO[modo]) return '';
  const lineas = PROMPT_MODO[modo].slice();
  lineas.push(toolsModo.length
    ? 'Herramientas disponibles en este turno: ' + toolsModo.join(', ') + '.'
    : 'Herramientas disponibles en este turno: ninguna.');
  let txt = lineas.join('\n');
  for (const t of TOOLS_UNIVERSO) {
    if (toolsModo.indexOf(t) !== -1) continue;
    if (txt.indexOf(t) === -1) continue;
    toolsAjenas.push(t);
    txt = txt.split(t).join('[HERRAMIENTA NO DISPONIBLE]');
  }
  return txt;
}

// LOS DOS CAMPOS DE TEXTO LIBRE SE ENMASCARAN UNA SOLA VEZ, AQUI. Y no es
// cosmetica: `enmascararTexto` CUENTA lo que tapa, asi que llamarla dos veces
// sobre el mismo campo doblaria `pii_enmascarada` y el numero dejaria de servir
// para nada. Todo lo de abajo -- el prompt, el historial y la salida -- se deriva
// de `conv0Salida`, nunca de `conv0`.
// Con ENMASCARAR=false esto es `conv0` tal cual, sin copia y sin recorrer nada.
const conv0Salida = ENMASCARAR
  ? { ...conv0,
      last_message_content: enmascararTexto(conv0.last_message_content),
      chat_history: enmascararTexto(conv0.chat_history) }
  : conv0;

// `rawCrudo` es el texto tal cual llego, y es el que decide si el turno es un
// arranque en frio: el enmascarado nunca vacia un texto, pero el que manda para
// eso es el original, no el resultado de un replace.
const rawCrudo = conv0.last_message_content;
const raw = conv0Salida.last_message_content;
const cold = !rawCrudo || String(rawCrudo).trim() === '';

// dato() RECHAZA CUALQUIER OBJETO a proposito. Una celda de texto de Airtable nunca
// es un objeto: si llega uno, es un singleSelect (va por sel()), un adjunto (va por
// tiene()) o UNA CELDA EN ERROR, del tipo {state:'error', errorType:'emptyDependency'}
// que devuelven las columnas de IA y de formula cuando les falta una dependencia.
// Sin esta guarda, String() de eso escribe '[object Object]' EN EL PROMPT y el agente
// se lo cree y se lo dice al cliente. Probado: la columna AnioDesplazamiento de la
// fila real esta hoy mismo en ese estado.
const dato = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'object') return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

// Un numero puede ser 0 y 0 es valido, asi que no vale el truco de `v || null`.
const numTxt = (v) => {
  if (v === undefined || v === null || v === '' || typeof v === 'object') return null;
  const n = Number(v);
  return isNaN(n) ? null : String(n);
};

// Un singleSelect de Airtable llega como {id,name,color}. Sin esto saldria
// '[object Object]' en el prompt SIN FALLAR, que es el peor de los dos mundos.
const sel = (v) => {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'object' && !Array.isArray(v) && v.name !== undefined) return String(v.name);
  if (typeof v === 'object') return null;
  return String(v);
};
const multi = (v) => {
  if (!Array.isArray(v) || v.length === 0) return null;
  return v.map(function (x) { return (x && typeof x === 'object' && x.name !== undefined) ? String(x.name) : String(x); }).join(', ');
};
const tiene = (v) => (Array.isArray(v) && v.length > 0);

// 4/08 · fecha_alta_ss_f2 llega en ISO (viene de fecha_alta_norm de F2) y el
// RESUMEN del prompt lo escribe en DD/MM/AAAA. Se traduce aqui para que el agente
// no tenga que reformatear nada al hablar.
const fechaEs = (v) => {
  const s = dato(v);
  if (!s) return null;
  const m = String(s).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : s;
};

// ── Los datos, por grupos y en el orden en que el bot los pregunta ────────────
// El nombre y el telefono se prefieren DE AIRTABLE y solo se cae al body del DC si
// la fila no los tiene: lo de Airtable es lo que el cliente confirmo hablando.
const nombreAirtable = [dato(e['Nombre empleado']), dato(e['Apellidos empleado'])].filter(Boolean).join(' ');

const pares = [
  ['Nombre', nombreAirtable || dato(body.nombre_apellidos)],
  ['Email', dato(e.email) || dato(body.user_email) || dato(conv0.user_email)],
  ['Telefono', dato(e.NumeroTelefono) || dato(body.telefono)],
  ['NIF/NIE', dato(e.NIF)],
  ['Numero de pasaporte', dato(e.PasaporteNumero)],
  ['Fecha de nacimiento', fechaEs(e.FechaNacimiento)],
  ['Sexo', sel(e.Sexo)],
  ['Estado civil', sel(e.estadoCivil)],
  ['Hijos', sel(e.hijos)],
  ['Nacionalidad', sel(e.Nacionalidad)],
  ['Pais de nacimiento', sel(e.PaisNacimiento)],
  ['Provincia de nacimiento', dato(e['Provincia de Nacimiento / Province of Birth'])],
  ['Municipio de nacimiento', dato(e['Municipio de Nacimiento / Birth Municipality'])],
  ['Ultimo pais de residencia', sel(e.UltimoPaisResidencia)],

  ['Domicilio en Espana', [
    sel(e['Tipo de vía / Type of road']),
    dato(e['Nombre de la calle / Name of street']),
    dato(e['Número de tu domicilio / House Number']),
    dato(e.Planta) ? 'planta ' + dato(e.Planta) : null,
    dato(e.Puerta) ? 'puerta ' + dato(e.Puerta) : null
  ].filter(Boolean).join(' ') || null],
  ['Codigo postal', dato(e['Codigo Postal'])],
  ['Municipio de residencia', dato(e.MunicipioResidencia)],

  ['Fecha de llegada a Espana', fechaEs(e.fechaDesplazamiento)],
  ['Fecha de alta en la Seguridad Social', fechaEs(e.fecha_alta_ss) || fechaEs(attrs.fecha_alta_ss_f2)],
  ['Veredicto del plazo', dato(attrs.veredicto_f2)],
  ['Fecha limite para solicitar', dato(attrs.fecha_limite_f2) || fechaEs(e.fecha_limite_plazo)],
  ['Salario bruto anual', numTxt(e.Salario)],
  ['Empresa', sel(e.Empresa)],
  ['Motivo del desplazamiento', sel(e.TipoBeckham)],
  ['Propiedades', sel(e.Propiedades)],
  ['Inversiones', sel(e.Inversiones)],
  ['El conyuge tambien quiere acogerse', e.ConyugeQuiereAcogerse === true ? 'si' : null],
  ['Idioma de atencion', sel(e.Idioma)]
].filter(function (p) { return p[1] !== null && p[1] !== ''; });

// ── Documentos: SOLO si los tiene. Booleanos, nunca URLs: las firmadas de
// Airtable caducan el mismo dia y un enlace roto es peor que ninguno.
const docs = [
  ['DNI o NIE', tiene(e.DNI)],
  ['pasaporte', tiene(e.Pasaporte)],
  ['contrato de trabajo', tiene(e.Contratotrabajo)],
  ['justificante de alta en la SS', tiene(e.AltaSeguridadSocial)],
  ['autorizacion del empleado', tiene(e.AutorizacionEmpleado)],
  ['autorizacion de la empresa', tiene(e.AutorizacionEmpresa)],
  ['certificado ENISA', tiene(e.CertificadoEnisa)],
  ['apostilla', tiene(e.Apostilla)],
  ['visado', tiene(e.Visado)]
].filter(function (d) { return d[1]; }).map(function (d) { return d[0]; });

// ── Lo que ya se decidio del caso. Sin esto el agente vuelve a enrutar desde cero
// un expediente que ya estaba cerrado, y le pide otra vez la fecha de la llamada.
const decidido = [];
if (sel(e.Status)) decidido.push('- Estado del expediente: ' + sel(e.Status));
if (sel(e.MotivoCierre)) decidido.push('- Ya se cerro una conversacion anterior por: ' + sel(e.MotivoCierre));
if (multi(e.SenalesComplejidad)) decidido.push('- El caso ya se enruto como COMPLEJO por: ' + multi(e.SenalesComplejidad));
if (fechaEs(e.FechaLlamada)) decidido.push('- Ya tiene llamada con el equipo fiscal agendada para el ' + fechaEs(e.FechaLlamada) + ' (NO se la vuelvas a preguntar)');
if (e.AplicaBeckham === true) decidido.push('- El cliente ya confirmo que quiere acogerse al regimen');
if (sel(e.Descarte)) decidido.push('- Motivo de descarte anotado: ' + sel(e.Descarte));
if (dato(e.DiscrepanciaFechaAlta)) decidido.push('- AVISO ya detectado: ' + dato(e.DiscrepanciaFechaAlta));

const trozos = [];

if (!existe) {
  trozos.push('--- DATOS QUE YA CONOCEMOS ---');
  trozos.push('(ninguno: es la primera vez que hablamos con este cliente)');
} else {
  trozos.push('--- DATOS QUE YA CONOCEMOS (no los vuelvas a preguntar) ---');
  trozos.push(pares.map(function (p) { return '- ' + p[0] + ': ' + p[1]; }).join('\n'));
  if (docs.length) {
    trozos.push('');
    trozos.push('--- DOCUMENTOS QUE YA NOS HA ENVIADO (no los vuelvas a pedir) ---');
    trozos.push('- ' + docs.join('\n- '));
  }
  if (decidido.length) {
    trozos.push('');
    trozos.push('--- LO QUE YA SE DECIDIO DE ESTE CASO ---');
    trozos.push(decidido.join('\n'));
  }
  if (dato(e.ResumenBot)) {
    trozos.push('');
    trozos.push('--- RESUMEN QUE TU MISMO ESCRIBISTE LA VEZ ANTERIOR ---');
    trozos.push(dato(e.ResumenBot));
  }
}

// WP-205b: dos filas con el mismo UserId y el escritor DEJA DE GUARDAR. El agente
// tiene que saberlo para no prometerle al cliente que se ha guardado nada.
if (nFilas > 1) {
  trozos.push('');
  trozos.push('--- AVISO TECNICO ---');
  trozos.push('Hay MAS DE UNA ficha con este identificador, asi que ahora mismo NO se puede guardar nada. No le prometas al cliente que has guardado sus datos y ofrece support@taxdown.es.');
}

trozos.push('');
trozos.push('Situacion: ' + (cold
  ? 'arranque en frio, el usuario todavia no ha escrito nada'
  : 'conversacion en curso'));

// ── WP-218 · contexto = contexto_base + prompt_modo ─────────────────────────
// `contexto_base` es EXACTAMENTE lo que el v3 llamaba `contexto`, y es lo que
// tiene que salir identico en los dos modos: es la parte comun, la que se
// difunde en la puerta. El bloque de modo va AL FINAL, pegado, y en
// `modo_origen='sin_resolver'` es cadena vacia, asi que `contexto` no cambia ni
// un byte respecto al v3.
const contexto_base = trozos.join('\n');
const prompt_modo = construirPromptModo();
const contexto = prompt_modo ? (contexto_base + '\n\n' + prompt_modo) : contexto_base;

// UNA linea de log por turno, y solo si hay resolver: sin el, este nodo no
// escribe ni una linea nueva (no-regresion tambien en el log). Van CUENTAS de PII
// y NOMBRES de tool; ni un valor del cliente, que es la regla del Log_Evento.
if (modoOrigen !== 'sin_resolver') {
  console.log('[' + corrId + '] ' + JSON.stringify({
    corr_id: corrId,
    modo: modo,
    modo_origen: modoOrigen,
    agente: agente,
    prompt_modo_car: prompt_modo.length,
    pii: pii,
    tools: toolsModo,
    tools_ajenas: toolsAjenas
  }));
}

// El historial lleva los mensajes del cliente de los turnos anteriores, asi que
// es texto libre igual que el ultimo y se enmascara con el mismo criterio. Ya
// viene enmascarado de `conv0Salida` (una sola pasada, arriba); lo unico que
// cambia aqui es DE DONDE se lee. Con ENMASCARAR=false `conv0Salida === conv0` y
// esta linea es la del v3.
const historial = dato(conv0Salida.chat_history) || '(sin historial previo)';

const instruccionArranque = [
  '[ARRANQUE_EN_FRIO]',
  'El usuario acaba de completar la cualificacion para el regimen Beckham y todavia no ha escrito ningun mensaje.',
  'Presentate brevemente, agradece los datos que ya ha aportado y haz UNA sola pregunta para avanzar.',
  'No repitas preguntas ya respondidas en el historial ni pidas datos que ya conocemos.'
].join('\n');

const prompt = [
  cold ? instruccionArranque : String(raw),
  '',
  '--- HISTORIAL DE LA CONVERSACION ---',
  historial
].join('\n');

// Se devuelve conv0 entero y no $json, porque los nodos de despues siguen
// esperando last_message_content, attachments_list y files_analysis_blocks.
// Se devuelve conv0 entero y no $json, porque los nodos de despues siguen
// esperando last_message_content, attachments_list y files_analysis_blocks.
//
// PERO EN MODO FAQ SE DEVUELVEN ENMASCARADOS los dos campos de texto libre. Es
// seguro: MEDIDO HOY sobre el workflow vivo, NADIE lee esos dos campos de la
// salida de este nodo -- `guardar_datos_cliente` y `analizar_documento` leen
// `attachments_list` de `$('Formatear_conversacion1')`, y el `AI Agent` solo lee
// `.prompt` de aqui. Asi que el texto sin enmascarar no viaja mas alla de este
// nodo en modo FAQ, que es justo lo que pide WP-222.
// `conv0Salida` se monto ARRIBA, en una sola pasada: aqui no se vuelve a
// enmascarar nada (si se hiciera, los contadores de `pii_enmascarada` saldrian al
// doble y el numero no valdria para nada).
return { json: { ...conv0Salida, prompt, contexto, contexto_base, prompt_modo,
  modo, modo_origen: modoOrigen, agente, tools_modo: toolsModo,
  pii_enmascarada: pii, _tools_ajenas: toolsAjenas, corr_id: corrId,
  cold_start: cold, _expediente_existe: existe, _expediente_filas: nFilas,
  _expediente_record_id: fila.id || null } };
