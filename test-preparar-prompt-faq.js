// test-preparar-prompt-faq.js — 28/08/2026 · la puerta del nodo del SIDECAR DEL FAQ
//   node docs/test-preparar-prompt-faq.js
//
// EJECUTA el nodo con un $input de mentira, no compara su texto: es la unica forma
// de probar un nodo de codigo que no se puede desplegar por API.
// `process.stdout.write` y NUNCA console.log: node 26 colorea la salida aunque
// escriba a una tuberia, los codigos ANSI se cuelan dentro de las variables de los
// montadores y corrompen justo el numero que sirve para comprobar un pegado.
const fs = require('fs');
const path = require('path');

const RUTA = path.join(__dirname, 'nodo-preparar-prompt-faq-2026-08-28.js');
const RUTA_V4 = path.join(__dirname, 'nodo-preparar-prompt-DOS-AGENTES-2026-08-27.js');
const CODIGO = fs.readFileSync(RUTA, 'utf8');
const CODIGO_V4 = fs.readFileSync(RUTA_V4, 'utf8');

let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const c = (cond, s) => cond ? V(s) : X(s);

// Corre el nodo igual que n8n. SOLO se le inyectan `$input` y `console`: si el nodo
// tocara cualquier otro nodo del workflow (`$('X')`), `$now`, `$json` o
// `$getWorkflowStaticData`, esto reventaria con un ReferenceError. O sea que el
// aislamiento no se comprueba solo leyendo el codigo: se comprueba ejecutandolo.
function correr(body, opciones) {
  const o = opciones || {};
  const items = o.items || [{ json: { body: body } }];
  const $input = {
    first: () => items[0] || { json: {} },
    last: () => items[items.length - 1] || { json: {} },
    all: () => items
  };
  const lineas = [];
  const consola = { log: (...a) => { lineas.push(a.map(String).join(' ')); } };
  const fn = new Function('$input', 'console', CODIGO);
  const salida = fn($input, consola);
  return {
    salida: salida,
    json: (salida && salida[0]) ? salida[0].json : null,
    lineas: lineas
  };
}

// El body de un turno de FAQ tal cual lo manda el Data Connector `beckham_faq_es`
// (las 6 claves del §3.1 del diseno).
const REAL = {
  conversation_id: '215475581167582',
  user_id: 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac',
  message: '¿cuantos anos dura el regimen?',
  idioma: 'es',
  callback_token: 's1hap599_2af9679b-84e9-4911-8466-fd10cf269015',
  punto: 'faq_entrada'
};
const con = (extra) => Object.assign({}, REAL, extra);
const sinClave = (k) => { const b = con({}); delete b[k]; return b; };

// El quitacomentarios que le falta a la puerta del v4 (alli es `sinComentarios` y
// no esta definido: la puerta muere en la comprobacion 4 de 74 Y SALE CON exit 0).
// Quita las lineas que EMPIEZAN por `//` y los comentarios de final de linea
// escritos como ` // `. No usa un regex generico a proposito: un `//` dentro de un
// literal de regex se llevaria por delante la mitad de PATRONES_PII.
function sinComentarios(txt) {
  return txt.split('\n')
    .filter(l => l.trim().indexOf('//') !== 0)
    .map(l => { const i = l.indexOf(' // '); return i === -1 ? l : l.slice(0, i); })
    .join('\n');
}
const LIMPIO = sinComentarios(CODIGO);

process.stdout.write('\n── 1 · el contrato de salida (§3.2 del diseno) ──\n');
const r0 = correr(REAL);
c(Array.isArray(r0.salida) && r0.salida.length === 1, 'devuelve UN item (no uno por entrada)');
for (const k of ['contexto', 'prompt', 'callback_token', 'conversation_id', 'idioma', '_pii']) {
  c(r0.json && Object.prototype.hasOwnProperty.call(r0.json, k), 'la salida lleva `' + k + '`');
}
c(r0.json.callback_token === REAL.callback_token, 'el callback_token viaja tal cual (la URL del callback lo lee de aqui)');
c(r0.json.conversation_id === REAL.conversation_id, 'el conversation_id viaja tal cual');

process.stdout.write('\n── 2 · los cuatro cortes baratos, ANTES de llamar al modelo ──\n');
const rSinConv = correr(sinClave('conversation_id'));
c(rSinConv.json._cortado === true, 'sin conversation_id -> _cortado=true');
c(rSinConv.json._motivo_corte === 'sin_conversation_id', 'sin conversation_id -> motivo sin_conversation_id');
c(rSinConv.json.output.length > 0, 'sin conversation_id -> `output` ya escrito, sin gastar una llamada');

const rSinTok = correr(sinClave('callback_token'));
c(rSinTok.json._cortado === true, 'sin callback_token -> _cortado=true');
c(rSinTok.json._motivo_corte === 'sin_callback_token', 'sin callback_token -> motivo sin_callback_token');

const rVacia = correr(con({ message: '' }));
c(rVacia.json._cortado === true && rVacia.json._motivo_corte === 'pregunta_vacia', 'message vacio -> pregunta_vacia');
c(correr(con({ message: '   \n\t ' })).json._motivo_corte === 'pregunta_vacia', 'message de solo espacios -> pregunta_vacia');
const rNula = correr(con({ message: null }));
c(rNula.json._motivo_corte === 'pregunta_vacia', 'message null -> pregunta_vacia (y no revienta)');

const larga = 'a'.repeat(2001);
const rLarga = correr(con({ message: larga }));
c(rLarga.json._cortado === true && rLarga.json._motivo_corte === 'pregunta_demasiado_larga', '2.001 caracteres -> pregunta_demasiado_larga');
c(rLarga.json._car_pregunta === 2001, 'y el numero de caracteres sale en `_car_pregunta`');
const rTope = correr(con({ message: 'a'.repeat(2000) }));
c(rTope.json._cortado === false, 'la frontera EXACTA (2.000) NO corta: el tope es "pasa de 2.000"');
c(rTope.json._tope_pregunta === 2000, 'el tope viaja en el item, para que no haya que leer el codigo para saberlo');

c(r0.json._cortado === false, 'un turno normal NO corta');
c(r0.json.output === '', 'un turno normal deja `output` vacio (lo rellena el agente)');
const rPrio = correr(Object.assign(sinClave('conversation_id'), { message: '' }));
c(rPrio.json._motivo_corte === 'sin_conversation_id', 'sin destino gana sobre pregunta vacia: primero se mira DONDE se publica');
c(correr(con({ message: '', idioma: 'en' })).json.output.indexOf('question') !== -1, 'el texto del corte sale en INGLES si la cadena es inglesa');
c(rVacia.json.output.indexOf('pregunta') !== -1, 'y en espanol si la cadena es espanola');
c(rLarga.json.output.indexOf('support@taxdown.es') !== -1, 'el corte por longitud remite a support@taxdown.es (el buzon del v14)');
c(rLarga.json.output.indexOf('24-48') !== -1, 'y con el SLA de 24-48 horas, el mismo que promete el prompt');

process.stdout.write('\n── 3 · el enmascarado de PII (WP-222), reutilizado VERBATIM del v4 ──\n');
const rMail = correr(con({ message: 'escribeme a juan.perez@ejemplo.com y te cuento' }));
c(rMail.json.prompt.indexOf('[EMAIL]') !== -1, 'un email sale como [EMAIL]');
c(rMail.json.prompt.indexOf('juan.perez@ejemplo.com') === -1, 'y el email NO aparece en el prompt');
c(rMail.json._pii.email === 1, 'el contador de email es 1 (cuenta CUANTOS, nunca CUALES)');

const rIban = correr(con({ message: 'mi cuenta es ES9121000418450200051332' }));
c(rIban.json.prompt.indexOf('[IBAN]') !== -1, 'un IBAN sale como [IBAN]');
c(rIban.json.prompt.indexOf('0200051332') === -1, 'y no quedan restos reconocibles del IBAN');
c(rIban.json._pii.iban === 1, 'el contador de iban es 1');

const rNie = correr(con({ message: 'mi NIE es X1234567L, sirve?' }));
c(rNie.json.prompt.indexOf('[NIF]') !== -1, 'un NIE sale como [NIF]');
c(rNie.json.prompt.indexOf('X1234567L') === -1, 'y el NIE no aparece en el prompt');
const rDni = correr(con({ message: 'mi DNI 12345678Z esta caducado' }));
c(rDni.json.prompt.indexOf('[NIF]') !== -1, 'un DNI de 8 digitos + letra sale como [NIF]');
c(rDni.json._pii.nif === 1, 'el contador de nif es 1');

const rTelInt = correr(con({ message: 'llamame al +34 600 123 456' }));
c(rTelInt.json.prompt.indexOf('[TELEFONO]') !== -1, 'un telefono internacional sale como [TELEFONO]');
c(rTelInt.json.prompt.indexOf('600 123 456') === -1, 'y no queda el numero detras del prefijo');
const rTelEs = correr(con({ message: 'mi movil es 600123456' }));
c(rTelEs.json.prompt.indexOf('[TELEFONO]') !== -1, 'un movil espanol de 9 digitos sale como [TELEFONO]');
c(rTelEs.json._pii.telefono === 1, 'el contador de telefono es 1');

// ── 31/08 · LOS DOS HUECOS DE COBERTURA QUE ENCONTRO EL VERIFICADOR ───────────
// Las 103 comprobaciones anteriores no tenian NI UN caso con prefijo `0034` ni el
// NIE en minusculas, y por ese hueco se colaba un movil espanol ENTERO al prompt.
// El patron de `+` exige el signo, y el nacional lleva (?<![0-9]), que es justo lo
// que lo bloquea: el 6 va precedido del 4 del `0034`. Se arreglo anadiendo un
// patron para el prefijo 00 y otro para el agrupado 3-2-2-2, en ESTE fichero y en
// el v4, que heredaba el mismo agujero. Estas comprobaciones son la puerta que
// habria mordido: si alguien las quita, el agujero vuelve sin que nadie lo vea.
[
  ['0034612345678',   'movil con prefijo 00 pegado, el que se colaba'],
  ['00 34 612 345 678', 'prefijo 00 con espacios'],
  ['0034-612-345-678', 'prefijo 00 con guiones'],
  ['600 12 34 56',    'agrupado 3-2-2-2, como lo dicta la gente'],
  ['612.34.56.78',    'agrupado 3-2-2-2 con puntos'],
  ['+34 612 345 678', 'internacional con + (no regresion)'],
  ['612345678',       'nacional pegado (no regresion)']
].forEach(function (par) {
  var r = correr(con({ message: 'llamame al ' + par[0] + ' cuando puedas' }));
  c(r.json.prompt.indexOf(par[0]) === -1 && r.json.prompt.indexOf('[TELEFONO]') !== -1,
    'TELEFONO tapado · ' + par[1] + ' (' + par[0] + ')');
});

// El NIE en MINUSCULAS: antes solo se probaba X1234567L en mayusculas.
[['x1234567l', 'NIE minusculas'], ['z2900111t', 'NIE con Z minuscula'],
 ['12345678z', 'DNI con letra minuscula']].forEach(function (par) {
  var r = correr(con({ message: 'mi documento es ' + par[0] }));
  c(r.json.prompt.indexOf(par[0]) === -1 && r.json.prompt.indexOf('[NIF]') !== -1,
    'NIF tapado · ' + par[1] + ' (' + par[0] + ')');
});

// Y lo que NO se toca aunque se parezca: un importe que empieza por 00 y es corto.
var rNoTel = correr(con({ message: 'el importe era 0034 euros y el CP 28046' }));
c(rNoTel.json.prompt.indexOf('0034 euros') !== -1 && rNoTel.json.prompt.indexOf('28046') !== -1,
  'un importe corto que empieza por 00 y un CP NO se tapan');

// LO QUE NO SE PUEDE ENMASCARAR, y es la mitad del valor de esta puerta: si el
// umbral o un CP salieran como [TELEFONO], el bot contestaria sobre un dato tapado.
const rCifras = correr(con({ message: 'gano 50.000 al ano, o 60000 con bonus; llegue el 02/03/2026 y vivo en el 28046 desde 2026' }));
c(rCifras.json.prompt.indexOf('50.000') !== -1, 'el umbral 50.000 NO se enmascara');
c(rCifras.json.prompt.indexOf('60000') !== -1, 'un salario 60000 NO se enmascara');
c(rCifras.json.prompt.indexOf('02/03/2026') !== -1, 'una fecha 02/03/2026 NO se enmascara');
c(rCifras.json.prompt.indexOf('28046') !== -1, 'un codigo postal NO se enmascara');
c(rCifras.json.prompt.indexOf('2026') !== -1, 'un ano NO se enmascara');
c(rCifras.json._pii.email + rCifras.json._pii.iban + rCifras.json._pii.nif + rCifras.json._pii.telefono === 0,
  'y con solo cifras legitimas los cuatro contadores estan a CERO');

const TODO = 'soy X1234567L, escribeme a a@b.com, mi iban ES9121000418450200051332, movil 600123456, y gano 50.000';
const rTodo = correr(con({ message: TODO }));
c(rTodo.json._pii.email === 1 && rTodo.json._pii.iban === 1 && rTodo.json._pii.nif === 1 && rTodo.json._pii.telefono === 1,
  'las cuatro clases juntas: un 1 en cada contador, ni cero ni dos');
c(rTodo.json.prompt.indexOf('50.000') !== -1, 'y en la misma frase el 50.000 sigue entero');
const SALIDA_ENTERA = JSON.stringify(rTodo.json);
c(SALIDA_ENTERA.indexOf('X1234567L') === -1 && SALIDA_ENTERA.indexOf('a@b.com') === -1
  && SALIDA_ENTERA.indexOf('ES9121000418450200051332') === -1 && SALIDA_ENTERA.indexOf('600123456') === -1,
  'la PII no aparece en NINGUNA clave de la salida, no solo en el prompt');
c(rTodo.lineas.length === 1, 'el nodo escribe UNA linea de log');
c(rTodo.lineas[0].indexOf('X1234567L') === -1 && rTodo.lineas[0].indexOf('a@b.com') === -1,
  'y la linea de log NO lleva PII (ni enmascarada ni cruda)');
c(rTodo.lineas[0].indexOf(TODO) === -1 && rTodo.lineas[0].indexOf('[NIF]') === -1,
  'la linea de log no lleva el texto de la pregunta, ni con marcas');
c(rTodo.lineas[0].indexOf('215475581167582') !== -1, 'la linea de log lleva el conversation_id, para poder cruzarla');

process.stdout.write('\n── 4 · el idioma lo decide el conector, y no se adivina ──\n');
c(correr(con({ idioma: 'es' })).json.idioma === 'es', 'idioma=es -> es');
c(correr(con({ idioma: 'en' })).json.idioma === 'en', 'idioma=en -> en');
c(correr(con({ idioma: ' EN ' })).json.idioma === 'en', 'idioma=" EN " -> en (se normaliza)');
c(correr(sinClave('idioma')).json.idioma === 'es', 'sin idioma -> es (no se adivina, se cae al de la casa)');
c(correr(con({ idioma: 'fr' })).json.idioma === 'es', 'un idioma que no existe en el canvas -> es');

process.stdout.write('\n── 5 · el marco y los tres bloques del contexto ──\n');
c(r0.json.prompt.indexOf('[MODO FAQ · SOLO INFORMACION]') === 0, 'el prompt EMPIEZA por el marco [MODO FAQ · SOLO INFORMACION]');
c(r0.json.prompt.indexOf('Pregunta del cliente:') !== -1, 'y sigue con «Pregunta del cliente:»');
c(r0.json.prompt.indexOf(REAL.message) !== -1, 'la pregunta del cliente entra tal cual cuando no lleva PII');
c(r0.json.contexto.indexOf('--- MODO DE ESTE TURNO: FAQ ---') === 0, 'el contexto EMPIEZA por el bloque MODO FAQ');
c(r0.json.contexto.indexOf('Herramientas disponibles en este turno: ninguna.') !== -1, 'y declara CERO herramientas (que es el grafo, no una promesa)');
c(r0.json.contexto.indexOf('Idioma de este turno: español. Ya está decidido: NO lo preguntes.') !== -1, 'en es, la linea de idioma dice español y que NO se pregunte');
c(correr(con({ idioma: 'en' })).json.contexto.indexOf('Idioma de este turno: inglés.') !== -1, 'en en, la linea de idioma dice inglés');
c(r0.json.contexto.indexOf('Situacion: el cliente ha entrado por el FAQ y todavia no ha dado ningun dato.') !== -1, 'y la linea de situacion esta');
c(r0.json.contexto.indexOf('DATOS QUE YA CONOCEMOS') === -1, 'el contexto NO lleva el bloque DATOS QUE YA CONOCEMOS del intake');
c(r0.json.contexto.indexOf('HISTORIAL') === -1, 'el contexto NO lleva historial');
c(r0.json.contexto.split('\n').length === 10, 'el contexto son 10 lineas: 7 del bloque + blanco + idioma + situacion');
c(correr(con({ message: 'X1234567L' })).json.contexto === r0.json.contexto, 'el contexto NO depende de la pregunta: es identico turno a turno');

process.stdout.write('\n── 6 · el bloque MODO FAQ es VERBATIM el del v4 (una sola fuente) ──\n');
const bloqueV4 = (function () {
  // El cierre se busca como `\n  ],` y NO como `],`: la sexta linea del bloque
  // lleva dentro «[EMAIL], [IBAN], [NIF]», o sea tres `],` que cortarian el trozo
  // por la mitad y dejarian la puerta midiendo cinco lineas de seis EN VERDE.
  const i = CODIGO_V4.indexOf('faq_regimen: [');
  const j = CODIGO_V4.indexOf('\n  ],', i);
  const trozo = CODIGO_V4.slice(i, j);
  const re = /'((?:[^'\\]|\\.)*)'/g;
  const out = [];
  let m;
  while ((m = re.exec(trozo)) !== null) out.push(m[1].replace(/\\'/g, "'"));
  return out;
})();
c(bloqueV4.length === 6, 'el v4 tiene 6 lineas en PROMPT_MODO.faq_regimen (si cambia, esta puerta lo dice)');
let iguales = 0;
for (const linea of bloqueV4) if (CODIGO.indexOf(linea) !== -1) iguales++;
c(iguales === bloqueV4.length, 'las 6 lineas del v4 estan verbatim en el nodo del FAQ');
for (const linea of bloqueV4) c(r0.json.contexto.indexOf(linea) !== -1, 'y sale en el contexto: «' + linea.slice(0, 44) + '…»');

process.stdout.write('\n── 7 · lo que el nodo NO hace, que es la mitad del diseno ──\n');
c(LIMPIO.indexOf("$('") === -1, 'no referencia NINGUN otro nodo: cero `$(\'X\')`');
c(LIMPIO.indexOf('.item') === -1, 'no usa `.item` en ningun sitio (el `.item` cuelga el task runner)');
c(/Airtable/i.test(LIMPIO) === false, 'no nombra Airtable: el FAQ no lee el expediente');
c(LIMPIO.indexOf('chat_history') === -1, 'no lee chat_history');
c(LIMPIO.indexOf('Formatear_conversacion') === -1, 'no toca Formatear_conversacion1 (ni sus adjuntos ni sus ZIP)');
c(LIMPIO.indexOf('Leer_Expediente') === -1, 'no toca Leer_Expediente_Para_Prompt (el que casa filas ajenas con user_id vacio)');
c(LIMPIO.indexOf('MotivoCierre') === -1 && LIMPIO.indexOf('Cerrar') === -1, 'no lee MotivoCierre ni cierra la conversacion');
c(LIMPIO.indexOf('fields') === -1, 'no monta ninguna clave `fields`: no hay escritor detras');
c(LIMPIO.indexOf('http') === -1, 'no hay ninguna URL ni llamada saliente dentro del nodo');
c(LIMPIO.indexOf('$now') === -1 && LIMPIO.indexOf('$getWorkflowStaticData') === -1,
  'no usa $now ni memoria estatica: el turno es reproducible con un curl');
// LA PRUEBA DE FUEGO DEL AISLAMIENTO, y no es una tautologia: se sabotea una COPIA
// del codigo metiendole una referencia a otro nodo y se comprueba que el arnes de
// esta puerta la caza. Si no la cazara, las diez comprobaciones de arriba serian
// diez «OK» sobre nada -- que es exactamente el falso verde en cascada que ya costo
// una sesion con el extractor de PDF.
let cazado = false;
try {
  const sabotaje = "const _x = $('Webhook_FAQ').first().json;\n" + CODIGO;
  new Function('$input', 'console', sabotaje)({ first: () => ({ json: { body: REAL } }) }, { log: () => {} });
} catch (e) {
  cazado = (e instanceof ReferenceError);
}
c(cazado, 'una copia SABOTEADA con $(\'Webhook_FAQ\') revienta con ReferenceError: el arnes caza las dependencias');

process.stdout.write('\n── 8 · el body del Data Connector (form-urlencoded, UNA sola clave) ──\n');
// Sin el parseo defensivo, `body.message` sale undefined y TODAS las preguntas
// caerian en el corte de «pregunta vacia»: el FAQ contestaria siempre lo mismo con
// la ejecucion en verde. Verificado en las ejecuciones 8052012 y 8052018.
const unaClave = {};
unaClave[JSON.stringify(REAL)] = '';
const rUna = correr(unaClave);
c(rUna.json._cortado === false, 'un body de una sola clave con el JSON dentro se parsea: NO corta');
c(rUna.json.prompt.indexOf(REAL.message) !== -1, 'y la pregunta se recupera del JSON parseado');
c(rUna.json.callback_token === REAL.callback_token, 'y el callback_token tambien');
// El segundo candidato del parseo: si el JSON lleva un `=` dentro (y una pregunta
// del cliente puede llevarlo), el form-urlencoded lo parte ahi y hay que recomponer
// `clave + '=' + valor`. Se reproduce tal cual, no se simula.
const CON_IGUAL = con({ message: 'el 24% se aplica hasta 600.000 = base general?' });
const jsonIgual = JSON.stringify(CON_IGUAL);
const posIgual = jsonIgual.indexOf('=');
const unaClaveIgual = {};
unaClaveIgual[jsonIgual.slice(0, posIgual)] = jsonIgual.slice(posIgual + 1);
c(posIgual !== -1, 'el caso de prueba lleva un `=` dentro del JSON (si no, no probaria nada)');
c(correr(unaClaveIgual).json.prompt.indexOf(CON_IGUAL.message) !== -1, 'tambien si el DC parte el JSON en clave=valor');
c(correr({ 'basura-que-no-es-json': '1' }).json._motivo_corte === 'sin_conversation_id',
  'una clave que no es JSON no revienta el nodo: cae en el corte barato');
c(correr({}).json._cortado === true, 'un body vacio corta y no llama al modelo');

process.stdout.write('\n── 9 · el user_id puede venir VACIO, y es el caso NORMAL ──\n');
// El FAQ es la puerta anonima del embudo: un visitante del Messenger sin External
// ID no tiene user_id. Si eso cortara el turno, el FAQ estaria muerto justo para
// su usuario tipico.
c(correr(sinClave('user_id')).json._cortado === false, 'sin user_id el turno SIGUE (no es un corte)');
c(correr(con({ user_id: '' })).json._cortado === false, 'con user_id vacio tambien');
c(correr(sinClave('punto')).json._cortado === false, 'sin punto el turno sigue (en etapa 1 no lo consume nadie)');

process.stdout.write('\n── 10 · runOnceForAllItems y $input.first() ──\n');
const rMulti = correr(null, { items: [{ json: { body: con({ message: 'la primera' }) } },
                                      { json: { body: con({ message: 'la segunda' }) } }] });
c(rMulti.salida.length === 1, 'con dos entradas sale UN item');
c(rMulti.json.prompt.indexOf('la primera') !== -1, 'y es el de $input.first(), no el ultimo');

process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
