// test-preparar-prompt-dos-agentes.js — 27/08/2026 · WP-218 + WP-222
// node docs/test-preparar-prompt-dos-agentes.js
//
// LA PUERTA DE `Preparar_Prompt` v4. EJECUTA el nodo con un $ de mentira, no
// compara su texto: es la unica forma de probar un nodo de codigo de un workflow
// que NO se puede desplegar por API (`beckham_bot` reenviado por MCP borra las
// credenciales de sus 55 nodos).
//
// Y la no-regresion no se mide contra una copia local: se mide EJECUTANDO EL
// CODIGO VIVO del export (`proyecto-mobility/workflows-n8n/beckham_bot.json`,
// 10.945 car., identico al nodo vivo comprobado por MCP hoy) con el MISMO $ de
// mentira, y comparando salida contra salida.
//
// `process.stdout.write` y NUNCA console.log: node 26 colorea la salida aunque
// escriba a una tuberia, y los codigos ANSI corrompen los recuentos.
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const RUTA_V4 = path.join(__dirname, 'nodo-preparar-prompt-DOS-AGENTES-2026-08-27.js');
const RUTA_MONTADOR = path.join(__dirname, 'montar-nodo-preparar-prompt.py');
const RUTA_EXPORT = path.join(RAIZ, 'proyecto-mobility', 'workflows-n8n', 'beckham_bot.json');

let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const c = (cond, s) => cond ? V(s) : X(s);

function morir(msg) {
  process.stdout.write('\n  FALLA ' + msg + '\n\n  0 verdes, 1 rojas\n');
  process.exit(1);
}

if (!fs.existsSync(RUTA_V4)) morir('no existe el nodo montado. Corre primero: python3 docs/montar-nodo-preparar-prompt.py');
if (!fs.existsSync(RUTA_EXPORT)) morir('no existe el export ' + RUTA_EXPORT);

const CODIGO_V4 = fs.readFileSync(RUTA_V4, 'utf8');
const MONTADOR = fs.readFileSync(RUTA_MONTADOR, 'utf8');
const WF = JSON.parse(fs.readFileSync(RUTA_EXPORT, 'utf8'));

const nodoVivo = WF.nodes.filter(n => n.name === 'Preparar_Prompt');
if (nodoVivo.length !== 1) morir('en el export hay ' + nodoVivo.length + " nodos 'Preparar_Prompt'");
const CODIGO_V3 = nodoVivo[0].parameters.jsCode;

// Las aristas `ai_tool` del grafo: la unica fuente honesta de «que tools tiene
// cableadas el agente». WP-218 §5 lo pide asi, contando aristas y no leyendo el
// prompt.
const ARISTAS_AI_TOOL = Object.keys(WF.connections)
  .filter(src => WF.connections[src].ai_tool)
  .sort();

// ── el $ de mentira ─────────────────────────────────────────────────────────
// Un nodo que no esta en la tabla REVIENTA, igual que en n8n: es exactamente el
// caso «Resolver_Modo todavia no esta pegado», y el v4 tiene que sobrevivirlo.
function hacerDollar(nodos) {
  return function (nombre) {
    if (!Object.prototype.hasOwnProperty.call(nodos, nombre)) {
      throw new Error("Referenced node doesn't exist: " + nombre);
    }
    const items = nodos[nombre];
    return {
      first: () => { if (!items.length) throw new Error('no data: ' + nombre); return items[0]; },
      last: () => items[items.length - 1],
      all: () => items
    };
  };
}

// ── los datos de mentira ────────────────────────────────────────────────────
// El mensaje lleva A PROPOSITO las cuatro clases de PII de WP-222 y las cuatro
// cifras que NO se pueden tocar (un importe con puntos, uno sin, una fecha y un
// ano). Las dos cosas en la misma cadena, porque el riesgo declarado del WP no es
// que falte el enmascarado: es que se coma el texto de la pregunta.
const NIE = 'X1234567L';
const DNI = '12345678Z';
const EMAIL = 'ana.garcia@example.com';
const TEL_ES = '600123456';
const TEL_INT = '+34 611 22 33 44';
const IBAN = 'ES91 2100 0418 4502 0005 1332';

const MENSAJE = 'Hola, mi NIE es ' + NIE + ' y el DNI de mi mujer es ' + DNI +
  '. Escribidme a ' + EMAIL + ' o al ' + TEL_ES + ', o al ' + TEL_INT +
  '. Mi IBAN es ' + IBAN + '. Cobro 50.000 euros al ano y 60000 el que viene.' +
  ' Llegue el 02/03/2026 y en 2026 no presente nada. Compensa el regimen?';

const HISTORIAL = 'cliente: mi telefono es 611223344\nbot: gracias\ncliente: y mi correo es otro.correo@taxdown.es';

const CONV0 = {
  last_message_content: MENSAJE,
  chat_history: HISTORIAL,
  user_email: EMAIL,
  attachments_list: [{ name: 'contrato.pdf', url: 'https://x/y.pdf' }],
  files_analysis_blocks: []
};

const BODY = {
  user_id: 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac',
  conversation_id: '215475581167582',
  nombre_apellidos: 'Ana Garcia Lopez',
  telefono: '600999888',
  user_email: EMAIL
};

const ATTRS = {
  veredicto_f2: 'en_plazo',
  fecha_limite_f2: '30/06/2026',
  fecha_alta_ss_f2: '2026-03-02'
};

// La fila de Airtable. Lleva un singleSelect ({id,name,color}), un multiple, dos
// adjuntos y UNA CELDA EN ERROR ({state:'error'}), que es el caso real de
// AnioDesplazamiento: si la guarda `dato()` se rompiera, saldria [object Object]
// en el prompt y esta puerta lo veria como una diferencia contra el v3.
const FILA = {
  id: 'recAAAA1111',
  fields: {
    'Nombre empleado': 'Ana',
    'Apellidos empleado': 'Garcia Lopez',
    email: EMAIL,
    NumeroTelefono: TEL_ES,
    NIF: NIE,
    FechaNacimiento: '1990-05-04',
    Sexo: { id: 'sel1', name: 'Mujer', color: 'blueLight2' },
    estadoCivil: { id: 'sel2', name: 'casado', color: 'greenLight2' },
    Nacionalidad: { id: 'sel3', name: 'Britanica', color: 'redLight2' },
    PaisNacimiento: { id: 'sel4', name: 'Reino Unido', color: 'redLight2' },
    MunicipioResidencia: 'Madrid',
    'Codigo Postal': '28046',
    'Tipo de vía / Type of road': { id: 'sel5', name: 'CALLE', color: 'grayLight2' },
    'Nombre de la calle / Name of street': 'Gran Via',
    'Número de tu domicilio / House Number': '3',
    fechaDesplazamiento: '2026-02-15',
    fecha_alta_ss: '2026-03-02',
    Salario: 52000,
    Empresa: { id: 'sel6', name: 'TaxDown', color: 'blueLight2' },
    TipoBeckham: { id: 'sel7', name: 'Trabajador por cuenta ajena', color: 'blueLight2' },
    Idioma: { id: 'sel8', name: 'Espanol', color: 'blueLight2' },
    Status: { id: 'sel9', name: '3. Pendiente llamada TD', color: 'yellowLight2' },
    SenalesComplejidad: [{ id: 'seltUAhJWITkOhsE0', name: 'Salario por debajo de 50.000' }],
    ResumenBot: 'El cliente llego en febrero y esta de alta desde marzo.',
    DNI: [{ url: 'https://x/dni.pdf' }],
    Contratotrabajo: [{ url: 'https://x/contrato.pdf' }],
    AnioDesplazamiento: { state: 'error', errorType: 'emptyDependency' },
    FechaAlta: { state: 'error', errorType: 'emptyDependency' }
  }
};

// ── el arrancador ───────────────────────────────────────────────────────────
// `o.modo === undefined` significa QUE NO HAY NODO Resolver_Modo, no que el modo
// llegue vacio: son dos casos distintos y los dos se prueban.
function correr(codigo, o) {
  o = o || {};
  const conv0 = Object.assign({}, CONV0, o.conv0 || {});
  const filas = (o.filas === undefined) ? [{ json: FILA }] : o.filas;
  const nodos = {
    'Formatear_conversacion1': [{ json: conv0 }],
    'Webhook1': [{ json: { body: BODY } }],
    'Traer_Conversacion_intercom1': [{ json: { custom_attributes: ATTRS } }],
    'Leer_Expediente_Para_Prompt': filas
  };
  if (o.modo !== undefined) {
    nodos['Resolver_Modo'] = [{ json: {
      modo: o.modo,
      origen: 'input_dc',
      corr_id: '215475581167582:52219039912',
      cold_start: false,
      punto: o.punto || ''
    } }];
  }
  const lineas = [];
  const consola = { log: (...a) => { lineas.push(a.map(String).join(' ')); } };
  const fn = new Function('$', 'console', codigo);
  return { json: fn(hacerDollar(nodos), consola).json, lineas };
}

const MODOS = ['menu', 'solicitud', 'faq_regimen', 'calculadora', 'lead_potencial', 'humano'];
const TOOLS_UNIVERSO = ['guardar_datos_cliente', 'leer_expediente', 'analizar_documento',
  'escalar_humano', 'registrar_optout', 'generar_informe', 'enviar_reporte'];

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 1 · el fichero montado ──\n');
// ─────────────────────────────────────────────────────────────────────────────
let sinResolver = null;
try {
  sinResolver = correr(CODIGO_V4, {});
  V('el nodo se ejecuta sin Resolver_Modo (no revienta al no encontrar el nodo)');
} catch (e) {
  X('el nodo REVIENTA sin Resolver_Modo: ' + e.message);
}
c(/^\/\/ Preparar_Prompt · v4 · 27\/08\/2026 · WP-218 \+ WP-222/.test(CODIGO_V4),
  'la cabecera dice v4 · WP-218 + WP-222');
c(!/\$\('[^']+'\)\.item\b/.test(CODIGO_V4),
  'CERO `$(...).item` en el codigo: en un nodo de codigo cuelga el task runner');
c(CODIGO_V4.indexOf('bot_mobility_prompt') === -1,
  'el nodo NO menciona bot_mobility_prompt: el prompt_base no se duplica aqui');
const mEsp = MONTADOR.match(/^ESPERADO = (\d+)$/m);
c(!!mEsp && CODIGO_V4.length === Number(mEsp[1]),
  'el recuento del fichero (' + CODIGO_V4.length + ' car.) es el ESPERADO del montador' +
  (mEsp ? ' (' + mEsp[1] + ')' : ' (no se encuentra ESPERADO)'));
c(/^VIVO_CAR = 10945$/m.test(MONTADOR) && CODIGO_V3.length === 10945,
  'el codigo vivo de partida son 10.945 car. y el montador exige ese mismo numero');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 2 · NO-REGRESION sin Resolver_Modo, contra el codigo VIVO ──\n');
// ─────────────────────────────────────────────────────────────────────────────
const v3 = correr(CODIGO_V3, {});
c(sinResolver.json.contexto === v3.json.contexto,
  'el `contexto` es IDENTICO al del nodo vivo (' + v3.json.contexto.length + ' car.)');
c(sinResolver.json.prompt === v3.json.prompt, 'el `prompt` es IDENTICO al del nodo vivo');
c(sinResolver.json.cold_start === v3.json.cold_start, 'cold_start identico');
c(sinResolver.json._expediente_existe === v3.json._expediente_existe &&
  sinResolver.json._expediente_filas === v3.json._expediente_filas &&
  sinResolver.json._expediente_record_id === v3.json._expediente_record_id,
  'los tres campos _expediente_* identicos');
c(sinResolver.json.last_message_content === MENSAJE,
  'sin resolver NO se enmascara nada: last_message_content sale literal');
c(sinResolver.json.chat_history === HISTORIAL, 'sin resolver el chat_history sale literal');
c(sinResolver.json.modo === '' && sinResolver.json.modo_origen === 'sin_resolver',
  "sin resolver: modo='' y modo_origen='sin_resolver'");
c(sinResolver.json.prompt_modo === '', 'sin resolver el prompt_modo es cadena vacia');
c(sinResolver.lineas.length === 0,
  'sin resolver NO escribe ni una linea de log (no-regresion tambien en el log)');

const nuevoV3 = correr(CODIGO_V3, { filas: [] });
const nuevoV4 = correr(CODIGO_V4, { filas: [] });
c(nuevoV4.json.contexto === nuevoV3.json.contexto,
  'cliente NUEVO (sin fila en Airtable): contexto identico al del nodo vivo');
c(nuevoV4.json.contexto.indexOf('es la primera vez que hablamos') !== -1,
  'y sigue diciendo que es la primera vez que hablamos');

const dosV3 = correr(CODIGO_V3, { filas: [{ json: FILA }, { json: Object.assign({}, FILA, { id: 'recBBBB2222' }) }] });
const dosV4 = correr(CODIGO_V4, { filas: [{ json: FILA }, { json: Object.assign({}, FILA, { id: 'recBBBB2222' }) }] });
c(dosV4.json.contexto === dosV3.json.contexto,
  'DOS filas con el mismo UserId: contexto identico al del nodo vivo');
c(dosV4.json.contexto.indexOf('--- AVISO TECNICO ---') !== -1,
  'y el AVISO TECNICO de WP-205b sigue saliendo');

const frioV3 = correr(CODIGO_V3, { conv0: { last_message_content: '' } });
const frioV4 = correr(CODIGO_V4, { conv0: { last_message_content: '' } });
c(frioV4.json.prompt === frioV3.json.prompt && frioV4.json.cold_start === true,
  'arranque en frio: prompt identico al del nodo vivo y cold_start=true');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 3 · el bloque DATOS QUE YA CONOCEMOS no se toca ──\n');
// ─────────────────────────────────────────────────────────────────────────────
const porModo = {};
for (const m of MODOS) porModo[m] = correr(CODIGO_V4, { modo: m });

c(porModo.solicitud.json.contexto_base === v3.json.contexto,
  'en modo solicitud el `contexto_base` es el contexto del nodo vivo, byte a byte');
c(porModo.faq_regimen.json.contexto_base === v3.json.contexto,
  'en modo faq_regimen tambien: el bloque comun no depende del modo');
c(MODOS.every(m => porModo[m].json.contexto.indexOf(porModo[m].json.contexto_base) === 0),
  'en los 6 modos el contexto EMPIEZA por el contexto_base (el bloque de modo va al final)');
c(porModo.faq_regimen.json.contexto_base.indexOf('- NIF/NIE: ' + NIE) !== -1,
  'el NIF de AIRTABLE sigue en el bloque (el enmascarado NO toca el expediente)');
c(porModo.faq_regimen.json.contexto_base.indexOf('DOCUMENTOS QUE YA NOS HA ENVIADO') !== -1,
  'el bloque de DOCUMENTOS sigue saliendo');
c(porModo.faq_regimen.json.contexto_base.indexOf('[object Object]') === -1 &&
  porModo.faq_regimen.json.contexto_base.indexOf("state") === -1,
  'ninguna celda en error se cuela como [object Object]');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 4 · el prompt_base es UNO: diff del bloque comun ──\n');
// ─────────────────────────────────────────────────────────────────────────────
const bases = MODOS.map(m => porModo[m].json.contexto_base);
c(bases.every(b => b === bases[0]),
  'el contexto_base es IDENTICO en los 6 modos (cero deriva: MF5 de WP-218)');
c(MODOS.every(m => porModo[m].json.contexto ===
    porModo[m].json.contexto_base + '\n\n' + porModo[m].json.prompt_modo),
  'contexto === contexto_base + prompt_modo, exacto, en los 6 modos');
const soloDiff = porModo.solicitud.json.contexto.replace(porModo.solicitud.json.prompt_modo, '');
const soloDiffFaq = porModo.faq_regimen.json.contexto.replace(porModo.faq_regimen.json.prompt_modo, '');
c(soloDiff === soloDiffFaq,
  'quitando el prompt_modo, el contexto de solicitud y el de FAQ son la MISMA cadena');
c(MODOS.every(m => porModo[m].json.prompt_modo.length > 0 && porModo[m].json.prompt_modo.length < 1200),
  'el prompt_modo es CORTO en los 6 modos (entre 1 y 1.200 car.), no una copia del prompt');
c(MODOS.every(m => porModo[m].json.prompt_modo.indexOf('--- MODO DE ESTE TURNO:') === 0),
  'los 6 bloques empiezan por la misma cabecera --- MODO DE ESTE TURNO:');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 5 · el modo y el nodo de agente que le toca ──\n');
// ─────────────────────────────────────────────────────────────────────────────
for (const m of MODOS) {
  c(porModo[m].json.modo === m && porModo[m].json.modo_origen === 'resolver',
    'modo="' + m + '" pasa tal cual, con modo_origen=resolver');
}
const raro = correr(CODIGO_V4, { modo: 'admin' });
c(raro.json.modo === 'faq_regimen' && raro.json.modo_origen === 'resolver_sin_modo',
  'un modo INVENTADO con el resolver puesto -> faq_regimen (minimo privilegio)');
const vacio = correr(CODIGO_V4, { modo: '' });
c(vacio.json.modo === 'faq_regimen' && vacio.json.modo_origen === 'resolver_sin_modo',
  'modo vacio CON resolver -> faq_regimen, y NO se confunde con no tener resolver');
c(correr(CODIGO_V4, { modo: '  SOLICITUD ' }).json.modo === 'solicitud',
  'el modo se normaliza (espacios y mayusculas)');
c(porModo.solicitud.json.agente === 'solicitud' && porModo.lead_potencial.json.agente === 'solicitud',
  'solicitud y lead_potencial van al nodo de agente SOLICITUD (los dos escriben)');
c(['menu', 'faq_regimen', 'calculadora', 'humano'].every(m => porModo[m].json.agente === 'faq'),
  'menu, faq_regimen, calculadora y humano van al nodo FAQ (ninguno escribe)');
c(sinResolver.json.agente === 'unico',
  "sin resolver el agente es 'unico': la topologia de hoy, un solo nodo");
c(porModo.faq_regimen.json.corr_id === '215475581167582:52219039912',
  'el corr_id del resolver se propaga al item');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 6 · las tools: el prompt no nombra lo que no esta cableado ──\n');
// ─────────────────────────────────────────────────────────────────────────────
c(JSON.stringify(ARISTAS_AI_TOOL) === JSON.stringify(
    ['analizar_documento', 'guardar_datos_cliente', 'leer_expediente']),
  'las aristas ai_tool del export son las 3 de siempre: ' + ARISTAS_AI_TOOL.join(', '));
c(JSON.stringify(porModo.solicitud.json.tools_modo.slice().sort()) === JSON.stringify(ARISTAS_AI_TOOL),
  'tools_modo del nodo SOLICITUD == las aristas ai_tool del grafo (contadas, no leidas)');
c(porModo.faq_regimen.json.tools_modo.length === 0,
  'tools_modo del nodo FAQ es VACIO: capa 1 de WP-219, la arista no existe');
c(porModo.faq_regimen.json.prompt_modo.indexOf('Herramientas disponibles en este turno: ninguna.') !== -1,
  'el bloque FAQ dice que no hay herramientas');
c(ARISTAS_AI_TOOL.every(t => porModo.solicitud.json.prompt_modo.indexOf(t) !== -1),
  'el bloque de SOLICITUD nombra las 3 tools que si tiene');
let ajenasEncontradas = [];
for (const m of MODOS) {
  const permitidas = porModo[m].json.tools_modo;
  for (const t of TOOLS_UNIVERSO) {
    if (permitidas.indexOf(t) === -1 && porModo[m].json.prompt_modo.indexOf(t) !== -1) {
      ajenasEncontradas.push(m + '/' + t);
    }
  }
}
c(ajenasEncontradas.length === 0,
  'NINGUN bloque nombra una tool que su nodo no tenga cableada' +
  (ajenasEncontradas.length ? ' · ' + ajenasEncontradas.join(', ') : ''));
c(MODOS.every(m => porModo[m].json._tools_ajenas.length === 0),
  '_tools_ajenas vacio en los 6 modos (la guarda en caliente no tuvo que tachar nada)');
c(['escalar_humano', 'registrar_optout'].every(t =>
    MODOS.every(m => porModo[m].json.prompt_modo.indexOf(t) === -1)),
  'las tools de WP-223 (escalar_humano, registrar_optout) NO se nombran: aun no existen');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 7 · WP-222 · PII enmascarada en faq_regimen ──\n');
// ─────────────────────────────────────────────────────────────────────────────
const faq = porModo.faq_regimen;
c(faq.json.prompt.indexOf(NIE) === -1 && faq.json.prompt.indexOf('[NIF]') !== -1,
  'el NIE del texto libre sale como [NIF]');
c(faq.json.prompt.indexOf(DNI) === -1, 'el DNI del texto libre tambien sale enmascarado');
c(faq.json.prompt.indexOf('2100 0418') === -1 && faq.json.prompt.indexOf('[IBAN]') !== -1,
  'el IBAN sale como [IBAN]');
c(faq.json.prompt.indexOf(TEL_ES) === -1 && faq.json.prompt.indexOf('[TELEFONO]') !== -1,
  'el telefono espanol de 9 digitos sale como [TELEFONO]');
c(faq.json.prompt.indexOf('611 22 33 44') === -1,
  'el telefono internacional con prefijo tambien');
c(faq.json.prompt.indexOf(EMAIL) === -1 && faq.json.prompt.indexOf('[EMAIL]') !== -1,
  'el email sale como [EMAIL]');
c(faq.json.prompt.indexOf('otro.correo@taxdown.es') === -1 &&
  faq.json.prompt.indexOf('611223344') === -1,
  'el HISTORIAL tambien se enmascara (correo y telefono de turnos anteriores)');
c(faq.json.last_message_content.indexOf(NIE) === -1 && faq.json.chat_history.indexOf('611223344') === -1,
  'la SALIDA del nodo tambien lleva los dos campos enmascarados, no solo el prompt');
c(faq.json.pii_enmascarada.nif === 2 && faq.json.pii_enmascarada.email === 2 &&
  faq.json.pii_enmascarada.iban === 1 && faq.json.pii_enmascarada.telefono === 3,
  'los contadores cuadran: nif 2, email 2, iban 1, telefono 3 · salio ' +
  JSON.stringify(faq.json.pii_enmascarada));
c(faq.json.contexto_base.indexOf('[NIF]') === -1 && faq.json.contexto_base.indexOf('[EMAIL]') === -1,
  'el bloque DATOS QUE YA CONOCEMOS no lleva marcas: no se alimenta de texto libre');
c(faq.json.prompt.indexOf('Compensa el regimen?') !== -1,
  'la PREGUNTA del cliente llega entera: el enmascarado no destroza el texto');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 8 · en solicitud NO se enmascara el dato legitimo ──\n');
// ─────────────────────────────────────────────────────────────────────────────
const sol = porModo.solicitud;
c(sol.json.prompt.indexOf(NIE) !== -1, 'el NIE llega LITERAL al prompt (es el dato que hay que recoger)');
c(sol.json.prompt.indexOf(IBAN) !== -1, 'el IBAN llega literal');
c(sol.json.prompt.indexOf(EMAIL) !== -1 && sol.json.prompt.indexOf(TEL_ES) !== -1,
  'el email y el telefono llegan literales');
c(sol.json.prompt.indexOf('[NIF]') === -1 && sol.json.prompt.indexOf('[TELEFONO]') === -1,
  'no aparece NINGUNA marca de enmascarado en modo solicitud');
c(JSON.stringify(sol.json.pii_enmascarada) === JSON.stringify({ email: 0, iban: 0, nif: 0, telefono: 0 }),
  'los contadores estan a cero en modo solicitud');
c(['menu', 'calculadora', 'humano', 'lead_potencial'].every(m =>
    porModo[m].json.prompt.indexOf(NIE) !== -1),
  'los otros cuatro modos tampoco enmascaran (MODOS_ENMASCARADOS es solo faq_regimen)');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 9 · falsos positivos: lo que NO se puede tocar ──\n');
// ─────────────────────────────────────────────────────────────────────────────
c(faq.json.prompt.indexOf('50.000 euros') !== -1, 'un importe con puntos (50.000) sobrevive');
c(faq.json.prompt.indexOf('60000 el que viene') !== -1, 'un importe sin puntos (60000) sobrevive');
c(faq.json.prompt.indexOf('02/03/2026') !== -1, 'una fecha DD/MM/AAAA sobrevive');
c(faq.json.prompt.indexOf('en 2026 no presente nada') !== -1, 'un ano suelto sobrevive');
const soloCifras = correr(CODIGO_V4, { modo: 'faq_regimen', conv0: {
  last_message_content: 'Gano 55.000 al ano, llegue el 15/01/2026 y tengo 2 hijos. El plazo son 6 meses.',
  chat_history: ''
} });
c(soloCifras.json.prompt.indexOf('Gano 55.000 al ano, llegue el 15/01/2026 y tengo 2 hijos.') !== -1 &&
  JSON.stringify(soloCifras.json.pii_enmascarada) === JSON.stringify({ email: 0, iban: 0, nif: 0, telefono: 0 }),
  'una pregunta con cifras y sin PII sale INTACTA y con los contadores a cero');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n── 10 · el log: una linea, y sin un solo dato del cliente ──\n');
// ─────────────────────────────────────────────────────────────────────────────
c(faq.lineas.length === 1, 'con resolver se escribe UNA sola linea de log (salieron ' + faq.lineas.length + ')');
const linea = faq.lineas[0] || '';
c(linea.indexOf('[215475581167582:52219039912]') === 0, 'la linea empieza por el corr_id entre corchetes');
c([NIE, DNI, EMAIL, TEL_ES, '611223344', '2100 0418', 'Compensa el regimen'].every(s => linea.indexOf(s) === -1),
  'la linea NO lleva el NIE, el DNI, el email, los telefonos, el IBAN ni la frase del cliente');
let ev = null;
try { ev = JSON.parse(linea.slice(linea.indexOf('{'))); } catch (e) { ev = null; }
c(!!ev && ev.modo === 'faq_regimen' && ev.agente === 'faq' && ev.modo_origen === 'resolver',
  'la linea es JSON y lleva modo, agente y modo_origen');
c(!!ev && ev.pii && ev.pii.nif === 2 && Array.isArray(ev.tools) && ev.tools.length === 0,
  'la linea lleva las CUENTAS de PII y los NOMBRES de las tools (ninguna en FAQ)');
c(!!ev && ev.prompt_modo_car === faq.json.prompt_modo.length,
  'la linea dice cuanto mide el bloque de modo, para poder verlo desde la ejecucion');

// ─────────────────────────────────────────────────────────────────────────────
process.stdout.write('\n' + ok + ' verdes, ' + ko + ' rojas\n\n');
if (ko > 0) process.exit(1);
