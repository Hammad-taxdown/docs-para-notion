# -*- coding: utf-8 -*-
"""Monta `nodo-preparar-prompt-DOS-AGENTES-2026-08-27.js` desde el codigo VIVO de
`Preparar_Prompt`, insertandole el modo, el bloque `prompt_modo` y el enmascarado
de PII de WP-222.

    python3 docs/montar-nodo-preparar-prompt.py            # monta y verifica
    python3 docs/montar-nodo-preparar-prompt.py --recuento  # solo dice cuanto sale

POR QUE POR ANCLAS Y NO A MANO (es la misma razon que `montar-nodo-validar.py`):
`beckham_bot` NO se toca con `update_workflow` del MCP -- exige reenviar los 55
nodos y BORRA las credenciales -- asi que el nodo se pega a mano con Cmd+A. Un
fichero transcrito a mano parece el bueno y no lo es. Aqui las cinco inserciones
son quirurgicas y se hacen por ANCLA DE TEXTO, nunca por numero de linea: si el
codigo vivo cambia y un ancla desaparece o aparece dos veces, esto ABORTA en vez
de escribir un fichero silenciosamente mal montado.

EL RECUENTO SE COMPRUEBA ANTES DE ESCRIBIR, no despues. Se comprueban DOS:
  1. el del codigo VIVO de partida (10.945 car.): si no cuadra, el export esta
     rancio o alguien toco el nodo, y el parche se estaria aplicando a otra cosa;
  2. el del fichero montado (ESPERADO): si no cuadra, el parche cambio y hay que
     actualizar el numero A PROPOSITO, en este script, en la misma linea en la que
     se ve por que.
Solo cuando los dos cuadran y `node --check` dice que parsea, se escribe el
destino. Un `exit 0` de un script no dice que haya hecho su trabajo.
"""
import io
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(RAIZ, 'proyecto-mobility', 'workflows-n8n', 'beckham_bot.json')
DESTINO = os.path.join(RAIZ, 'docs', 'nodo-preparar-prompt-DOS-AGENTES-2026-08-27.js')
TMP = os.path.join(RAIZ, 'docs', '.nodo-preparar-prompt-en-curso.js')

# El nodo VIVO, medido por MCP el 27/08/2026 a las 15:5x (versionId
# 5b31d761-fb06-4d94-823a-20e6ab7742b0, activeVersionId igual). El export del 26/08
# es IDENTICO al vivo, comprobado con diff. El de referencia/exports-n8n/ NO: es del
# 16/08, tiene 54 nodos y su Preparar_Prompt son 2.976 car. (la version anterior al
# 17/08). Ese esta RANCIO y no se usa aqui.
VIVO_CAR = 10945

# El montado. Si cambias un bloque, este numero cambia: actualizalo aqui a mano,
# porque es lo unico que permite comprobar un pegado de Cmd+A en n8n contando
# caracteres (el editor cuenta CARACTERES, no bytes).
ESPERADO = 26362


def aborta(msg):
    sys.stderr.write('ABORTA · ' + msg + '\n')
    sys.exit(1)


def sustituir_una(txt, ancla, nuevo, que):
    n = txt.count(ancla)
    if n != 1:
        aborta("el ancla de '%s' aparece %d veces, se esperaba 1.\n"
               "           El codigo vivo de Preparar_Prompt ha cambiado: hay que\n"
               "           volver a leerlo por MCP y rehacer el ancla." % (que, n))
    return txt.replace(ancla, nuevo, 1)


# ─────────────────────────────────────────────────────────────────────────────
# 1 · el codigo vivo de partida
# ─────────────────────────────────────────────────────────────────────────────
if not os.path.exists(EXPORT):
    aborta('no existe el export %s' % EXPORT)

wf = json.load(io.open(EXPORT, encoding='utf-8'))
nodos = [n for n in wf.get('nodes', []) if n.get('name') == 'Preparar_Prompt']
if len(nodos) != 1:
    aborta("en el export hay %d nodos llamados 'Preparar_Prompt', se esperaba 1" % len(nodos))

code = nodos[0]['parameters']['jsCode']
original = len(code)
if original != VIVO_CAR:
    aborta('el Preparar_Prompt del export son %d caracteres y se esperaban %d.\n'
           '           O el export esta rancio, o alguien toco el nodo vivo. Auditar\n'
           '           por MCP (nhOwpiGxikeU5DLR) ANTES de montar nada.' % (original, VIVO_CAR))


# ─────────────────────────────────────────────────────────────────────────────
# 2 · ANCLA 1 · la cabecera: sube a v4 y dice lo que entra
# ─────────────────────────────────────────────────────────────────────────────
ANCLA1 = '// Preparar_Prompt · v3 · 17/08/2026'
BLOQUE1 = '''// Preparar_Prompt · v4 · 27/08/2026 · WP-218 + WP-222
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
''' + ANCLA1
code = sustituir_una(code, ANCLA1, BLOQUE1, 'cabecera v4')


# ─────────────────────────────────────────────────────────────────────────────
# 3 · ANCLA 2 · el modo, el agente, el enmascarado y la tabla de bloques
# ─────────────────────────────────────────────────────────────────────────────
ANCLA2 = """const raw = conv0.last_message_content;
const cold = !raw || String(raw).trim() === '';"""

BLOQUE2 = '''// ── WP-218 · DE QUE MODO ES ESTE TURNO ───────────────────────────────────────
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
  ['email',    /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+/g,               '[EMAIL]'],
  ['iban',     /\\b[A-Za-z]{2}[0-9]{2}(?:[ -]?[A-Za-z0-9]{4}){3,6}(?:[ -]?[A-Za-z0-9]{1,4})?\\b/g, '[IBAN]'],
  ['nif',      /\\b(?:[XYZxyz][ -]?[0-9]{7}[ -]?[A-Za-z]|[0-9]{8}[ -]?[A-Za-z])\\b/g,   '[NIF]'],
  ['telefono', /\\+[0-9]{1,3}[ .\\-]?[0-9](?:[ .\\-]?[0-9]){7,13}/g,                    '[TELEFONO]'],
  ['telefono', /(?<![0-9])[6-9][0-9]{2}[ .\\-]?[0-9]{3}[ .\\-]?[0-9]{3}(?![0-9])/g,     '[TELEFONO]']
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
  let txt = lineas.join('\\n');
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
const cold = !rawCrudo || String(rawCrudo).trim() === '';'''
code = sustituir_una(code, ANCLA2, BLOQUE2, 'modo + enmascarado + bloques')


# ─────────────────────────────────────────────────────────────────────────────
# 4 · ANCLA 3 · el historial tambien es texto libre del cliente
# ─────────────────────────────────────────────────────────────────────────────
ANCLA3 = "const historial = dato(conv0.chat_history) || '(sin historial previo)';"
BLOQUE3 = """// El historial lleva los mensajes del cliente de los turnos anteriores, asi que
// es texto libre igual que el ultimo y se enmascara con el mismo criterio. Ya
// viene enmascarado de `conv0Salida` (una sola pasada, arriba); lo unico que
// cambia aqui es DE DONDE se lee. Con ENMASCARAR=false `conv0Salida === conv0` y
// esta linea es la del v3.
const historial = dato(conv0Salida.chat_history) || '(sin historial previo)';"""
code = sustituir_una(code, ANCLA3, BLOQUE3, 'historial')


# ─────────────────────────────────────────────────────────────────────────────
# 5 · ANCLA 4 · el contexto se parte en base + bloque de modo
# ─────────────────────────────────────────────────────────────────────────────
ANCLA4 = "const contexto = trozos.join('\\n');"
BLOQUE4 = """// ── WP-218 · contexto = contexto_base + prompt_modo ─────────────────────────
// `contexto_base` es EXACTAMENTE lo que el v3 llamaba `contexto`, y es lo que
// tiene que salir identico en los dos modos: es la parte comun, la que se
// difunde en la puerta. El bloque de modo va AL FINAL, pegado, y en
// `modo_origen='sin_resolver'` es cadena vacia, asi que `contexto` no cambia ni
// un byte respecto al v3.
const contexto_base = trozos.join('\\n');
const prompt_modo = construirPromptModo();
const contexto = prompt_modo ? (contexto_base + '\\n\\n' + prompt_modo) : contexto_base;

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
}"""
code = sustituir_una(code, ANCLA4, BLOQUE4, 'contexto + prompt_modo')


# ─────────────────────────────────────────────────────────────────────────────
# 6 · ANCLA 5 · la salida
# ─────────────────────────────────────────────────────────────────────────────
ANCLA5 = ("return { json: { ...conv0, prompt, contexto, cold_start: cold, "
          "_expediente_existe: existe, _expediente_filas: nFilas, "
          "_expediente_record_id: fila.id || null } };")
BLOQUE5 = """// Se devuelve conv0 entero y no $json, porque los nodos de despues siguen
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
  _expediente_record_id: fila.id || null } };"""
code = sustituir_una(code, ANCLA5, BLOQUE5, 'return final')


# ─────────────────────────────────────────────────────────────────────────────
# 7 · LOS DOS RECUENTOS Y LA SINTAXIS, ANTES DE ESCRIBIR EL DESTINO
# ─────────────────────────────────────────────────────────────────────────────
montado = len(code)

if '--recuento' in sys.argv:
    sys.stdout.write('  vivo %d -> montado %d caracteres (+%d) · ESPERADO=%d\n'
                     % (original, montado, montado - original, ESPERADO))
    sys.exit(0)

if montado != ESPERADO:
    aborta('el montado son %d caracteres y ESPERADO dice %d.\n'
           '           Si el cambio es a proposito, pon ESPERADO=%d en\n'
           '           docs/montar-nodo-preparar-prompt.py y vuelve a montar.'
           % (montado, ESPERADO, montado))

# `node --check` necesita un fichero, asi que se escribe un temporal OCULTO en
# docs/ (docs es plana: un dotfile no es un subdirectorio) y solo se mueve al
# destino si parsea.
io.open(TMP, 'w', encoding='utf-8').write(code)
r = subprocess.call(['node', '--check', TMP],
                    stdout=subprocess.PIPE, stderr=subprocess.PIPE)
if r != 0:
    subprocess.call(['node', '--check', TMP])
    os.remove(TMP)
    aborta('el fichero montado NO parsea como JavaScript. No se escribe el destino.')

os.rename(TMP, DESTINO)

# process.stdout.write y no print con formato de color: los codigos ANSI dentro de
# una variable de shell corrompen justo el numero que sirve para comprobar un
# pegado. Aqui se escribe el numero pelado.
sys.stdout.write('  OK   las 5 anclas, unicas\n')
sys.stdout.write('  OK   parsea como JavaScript\n')
sys.stdout.write('  OK   recuento: %d caracteres (vivo %d, +%d)\n'
                 % (montado, original, montado - original))
sys.stdout.write('  destino: docs/nodo-preparar-prompt-DOS-AGENTES-2026-08-27.js\n')
sys.stdout.write('  pegar con Cmd+A en beckham_bot -> nodo Preparar_Prompt\n')
