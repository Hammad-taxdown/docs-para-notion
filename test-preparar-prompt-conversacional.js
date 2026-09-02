// test-preparar-prompt-conversacional.js — 31/08/2026
//   node docs/test-preparar-prompt-conversacional.js
//
// LA PUERTA QUE LE FALTABA AL UNICO CODIGO NUEVO DEL CAMBIO CONVERSACIONAL.
// `nodo-preparar-prompt-CONVERSACIONAL-2026-08-31.js` es el nodo que sustituye la
// fuente muerta (los custom attributes `*_f2` que escribia el canvas de Intercom) y
// monta el bloque «DATOS QUE YA CONOCEMOS». Es la pieza mas arriesgada del cambio:
// si lo monta mal, el sintoma es el peor del proyecto — el bot repreguntando lo que
// el cliente ya conto — y no da error.
//
// EJECUTA el nodo con un `$()` de mentira, no compara su texto. Y solo se le
// inyectan `$` y `console`: si el nodo tocara `$now`, `$json`, `$input` o
// `$getWorkflowStaticData`, esto revienta con un ReferenceError. O sea que el
// aislamiento no se comprueba leyendo: se comprueba ejecutando.
//
// `process.stdout.write` y NUNCA console.log: node 26 colorea la salida aunque
// escriba a una tuberia y los codigos ANSI se cuelan dentro de las variables.
'use strict';
const fs = require('fs');
const path = require('path');

const RUTA = path.join(__dirname, 'nodo-preparar-prompt-CONVERSACIONAL-2026-08-31.js');
const RUTA_VALIDADOR = path.join(__dirname, 'nodo-validar-normalizar-COMPLETO.js');
const CODIGO = fs.readFileSync(RUTA, 'utf8');

let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const c = (cond, s) => cond ? V(s) : X(s);

// ── el arnes ─────────────────────────────────────────────────────────────────
// Tres nodos de entrada, los tres con la forma REAL: `Formatear_conversacion1` y
// `Webhook1` se leen con `.first().json`, y `Leer_Expediente_Para_Prompt` con
// `.all()`, que es el que puede devolver dos filas (WP-205b) o ninguna.
function correr(o) {
  const opt = o || {};
  const conv = Object.assign({
    last_message_content: 'hola, quiero acogerme a la ley beckham',
    chat_history: 'Usuario: hola\nBot: hola, en que puedo ayudarte'
  }, opt.conv || {});
  const body = Object.assign({ user_id: 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac' }, opt.body || {});
  const filas = opt.filas === undefined
    ? [{ json: { id: 'recABC123', fields: opt.fields || {} } }]
    : opt.filas;
  const nodos = {
    Formatear_conversacion1: [{ json: conv }],
    Webhook1: [{ json: { body: body } }],
    Leer_Expediente_Para_Prompt: filas
  };
  const $ = (n) => {
    if (!Object.prototype.hasOwnProperty.call(nodos, n)) {
      throw new Error('el nodo referencia $(\'' + n + '\'), que no esta en el arnes');
    }
    const items = nodos[n];
    return {
      first: () => items[0] || { json: {} },
      last: () => items[items.length - 1] || { json: {} },
      all: () => items
    };
  };
  const lineas = [];
  const consola = { log: (...a) => { lineas.push(a.map(String).join(' ')); } };
  const fn = new Function('$', 'console', CODIGO);
  const salida = fn($, consola);
  return { salida: salida, json: (salida && salida.json) ? salida.json : null, lineas: lineas };
}

process.stdout.write('\n── 1 · el contrato de salida ──\n');
const r0 = correr({});
c(!!r0.json, 'el nodo devuelve un item con json');
for (const k of ['prompt', 'contexto', 'cold_start', 'mensaje_perdido', 'idioma_canvas', '_arranque', '_pii', '_recortes',
                 '_expediente_existe', '_expediente_filas', '_expediente_record_id']) {
  c(r0.json && Object.prototype.hasOwnProperty.call(r0.json, k), 'la salida lleva `' + k + '`');
}
c(r0.json.last_message_content === 'hola, quiero acogerme a la ley beckham',
  'devuelve conv0 ENTERO (los nodos de despues siguen esperando last_message_content)');
c(r0.json._expediente_existe === true && r0.json._expediente_record_id === 'recABC123',
  'resuelve el record id de la fila');

process.stdout.write('\n── 2 · la fuente muerta: cero rastro de los custom attributes del canvas ──\n');
const SIN_COMENT = CODIGO.split('\n').filter(l => l.trim().indexOf('//') !== 0).join('\n');
for (const k of ['veredicto_f2', 'fecha_limite_f2', 'dias_pasados_f2', 'fecha_alta_ss_f2', 'custom_attributes']) {
  c(SIN_COMENT.indexOf(k) === -1, 'no lee `' + k + '` (lo escribia el canvas, que ha muerto)');
}
c(/EL PLAZO NO LO CALCULAS TU/.test(r0.json.contexto),
  'el bloque que SUSTITUYE a veredicto_f2 va en el contexto');
c(/calcular_plazo/.test(r0.json.contexto), 'y nombra la tool calcular_plazo');
c(/no hay formulario previo/.test(r0.json.contexto),
  'y le dice que NADIE ha filtrado antes (si no, el bot da por hechos los filtros)');

process.stdout.write('\n── 3 · las reglas de la casa ──\n');
c(SIN_COMENT.indexOf('$(\'') !== -1 && !/\$\([^)]*\)\s*\.item\b/.test(SIN_COMENT),
  'CERO `$().item` en un nodo de codigo (el .item cuelga el task runner)');
c((SIN_COMENT.match(/\$\('([A-Za-z_0-9 ]+)'\)/g) || [])
    .every(m => /Formatear_conversacion1|Webhook1|Leer_Expediente_Para_Prompt/.test(m)),
  'solo referencia los tres nodos que existen aguas arriba');
c(SIN_COMENT.indexOf('Webhook1') !== -1,
  'usa el nombre literal `Webhook1` (renombrarlo rompe este nodo y n8n no lo reescribe)');

process.stdout.write('\n── 4 · arranque en frio vs mensaje que no ha llegado ──\n');
const rFrio = correr({ conv: { last_message_content: '', chat_history: '' } });
c(rFrio.json.cold_start === true && rFrio.json.mensaje_perdido === false, 'sin texto y sin historial = arranque en frio');
c(/ARRANQUE_EN_FRIO/.test(rFrio.json.prompt), 'y el prompt lleva la instruccion de arranque');
// 01/09 · LA BIENVENIDA LA MANDA EL CANVAS, ASI QUE EL AGENTE NO SE PRESENTA. Estas
// cuatro son la puerta de ese cambio: sin ellas, alguien devuelve el «presentate» y el
// cliente recibe DOS saludos seguidos sin que nada falle.
c(/NO te presentes/.test(rFrio.json.prompt) && /YA SE LE HA SALUDADO/.test(rFrio.json.prompt),
  'le PROHIBE presentarse: la bienvenida ya la mando el canvas');
c(!/Presentate en una sola frase/.test(rFrio.json.prompt),
  'y no queda rastro de la instruccion vieja de presentarse');
c(/idioma de atencion \(D0\)/.test(rFrio.json.prompt),
  'le manda arrancar por la PRIMERA pregunta, que es el idioma (D0)');
c(/sin preambulo/.test(rFrio.json.prompt),
  'y sin preambulo, para que no cuele un saludo por la puerta de atras');
const rPerdido = correr({ conv: { last_message_content: '', chat_history: 'Usuario: hola\nBot: dime' } });
c(rPerdido.json.cold_start === false && rPerdido.json.mensaje_perdido === true,
  'sin texto pero CON turno de usuario = mensaje perdido, NO arranque en frio');
c(/MENSAJE_NO_RECIBIDO/.test(rPerdido.json.prompt) && !/ARRANQUE_EN_FRIO/.test(rPerdido.json.prompt),
  'y el prompt le PROHIBE presentarse (presentarse a mitad de hilo es el fallo visible)');
const rVacio = correr({ conv: { last_message_content: '', chat_history: 'Bot: hola' } });
c(rVacio.json.cold_start === true,
  'un historial con SOLO turnos del bot sigue siendo arranque en frio');

process.stdout.write('\n── 4b · el canvas de dos botones: el DC manda el texto del PROPIO canvas (02/09) ──\n');
// Fixture VERBATIM de la ejecucion 8160900 (02/09 10:14, conversacion 215475750921547):
// message es la confirmacion del paso B, el historial lleva la bienvenida de A, el
// boton pulsado y la confirmacion, y conversationPartId != First Message ID.
const HIST_CANVAS_ES = 'Agente: 🇪🇸 Español\n¡Hola! 👋 Soy el Mobility Bot del equipo de TaxDown y estoy aquí para ayudarte con tu solicitud al régimen Beckham.\n\n¿En qué idioma quieres que continuemos?\n\n🇬🇧/🇺🇸 English\nHi! 👋 I’m the TaxDown Mobility Team Bot, and I’m here to help you with your Beckham regime application.\n\nWhich language would you like to continue in?\nUsuario: 🇪🇸 Español\nAgente: 🇪🇸 Perfecto, seguimos en español.\n';
const BODY_CANVAS = { conversationPartId: '53026457386', 'First Message ID': '3929836526' };
const rEs = correr({ conv: { last_message_content: '🇪🇸 Perfecto, seguimos en español.', chat_history: HIST_CANVAS_ES }, body: BODY_CANVAS });
c(rEs.json.cold_start === true && rEs.json.mensaje_perdido === false,
  'la confirmacion «Perfecto, seguimos en español» del canvas = ARRANQUE EN FRIO, aunque conversationPartId != First Message ID');
c(rEs.json.idioma_canvas === 'Español', 'y saca el idioma del texto del canvas: Español');
c(rEs.json._arranque.confirmacion_canvas === true && rEs.json._arranque.primera_parte === false && rEs.json._arranque.turnos_reales === 0,
  '_arranque dice POR QUE: confirmacion_canvas=true, primera_parte=false, turnos_reales=0 (el boton no es un turno)');
c(/^\[ARRANQUE_EN_FRIO\]/.test(rEs.json.prompt), 'el prompt arranca por [ARRANQUE_EN_FRIO], no por el texto del canvas');
c(!/^🇪🇸 Perfecto, seguimos en español\./m.test(rEs.json.prompt.split('--- HISTORIAL')[0]),
  'y la confirmacion del canvas NO viaja como si fuera el mensaje del cliente');
// Las lineas OPERATIVAS, ancladas literal y contadas (regla del 31/08: la rama, no el aviso).
c((rEs.json.prompt.match(/IDIOMA YA ELEGIDO: Español\./g) || []).length === 1,
  'dice UNA vez «IDIOMA YA ELEGIDO: Español.»');
c(/La pregunta D0 esta RESPONDIDA: NO la hagas y NO mandes los dos mensajes del idioma\./.test(rEs.json.prompt),
  'y la rama operativa: «D0 esta RESPONDIDA: NO la hagas y NO mandes los dos mensajes»');
c(!/Empieza DIRECTAMENTE por la primera pregunta del recorrido, que es el idioma de atencion \(D0\)/.test(rEs.json.prompt),
  'y NO queda la orden vieja de arrancar preguntando D0 (seria el bucle del idioma)');
c(/parametro idioma = Español\./.test(rEs.json.prompt), 'le manda guardar el idioma con guardar_datos_cliente (idioma = Español)');
c(/apertura del BLOQUE 0 en español/.test(rEs.json.prompt) && /cuatro opciones de arranque/.test(rEs.json.prompt),
  'y arrancar por la apertura del BLOQUE 0 en español con sus cuatro opciones');
c(/NO te presentes/.test(rEs.json.prompt) && /YA SE LE HA SALUDADO/.test(rEs.json.prompt),
  'sigue PROHIBIDO presentarse: la bienvenida ya la mando el canvas');
c(/Situacion: primer turno, el cliente solo ha pulsado el boton del idioma \(Español\)/.test(rEs.json.contexto),
  'y la Situacion del contexto lo dice');

// El paso C, en ingles, con el apostrofo tipografico (’) que usa Intercom y con el recto.
const HIST_CANVAS_EN = HIST_CANVAS_ES.replace('Usuario: 🇪🇸 Español\nAgente: 🇪🇸 Perfecto, seguimos en español.', 'Usuario: 🇬🇧/🇺🇸 English\nAgente: 🇬🇧/🇺🇸 Perfect, let’s continue in English.');
const rEn = correr({ conv: { last_message_content: '🇬🇧/🇺🇸 Perfect, let’s continue in English.', chat_history: HIST_CANVAS_EN }, body: BODY_CANVAS });
c(rEn.json.cold_start === true && rEn.json.idioma_canvas === 'Ingles', 'la confirmacion inglesa (con ’) = arranque en frio con idioma Ingles');
c((rEn.json.prompt.match(/IDIOMA YA ELEGIDO: Ingles\./g) || []).length === 1 && /Toda la conversacion va en inglés\./.test(rEn.json.prompt),
  'y le dice que TODA la conversacion va en inglés');
const rEn2 = correr({ conv: { last_message_content: "Perfect, let's continue in English", chat_history: HIST_CANVAS_EN }, body: BODY_CANVAS });
c(rEn2.json.idioma_canvas === 'Ingles', 'con apostrofo recto, sin bandera y sin punto tambien casa');
// La regla del 01/09 sigue viva para un canvas de UN paso (fixture de la 8159910).
const BIENVENIDA = '🇪🇸 Español ¡Hola! 👋 Soy el Mobility Bot del equipo de TaxDown y estoy aquí para ayudarte con tu solicitud al régimen Beckham. \n 🇬🇧 English Hi! 👋 I’m the TaxDown Mobility Team Bot, and I’m here to help you with your Beckham regime application.';
const rAyer = correr({ conv: { last_message_content: BIENVENIDA, chat_history: 'Agente: ' + BIENVENIDA + '\n' }, body: { conversationPartId: '3928679626', 'First Message ID': '3928679626' } });
c(rAyer.json.cold_start === true && rAyer.json.idioma_canvas === null,
  'la bienvenida bilingue de A (01/09, misma parte que la primera) = arranque en frio SIN idioma');
c(/idioma de atencion \(D0\)/.test(rAyer.json.prompt) && !/IDIOMA YA ELEGIDO/.test(rAyer.json.prompt),
  'y ahi SI pregunta D0, porque nadie ha elegido idioma');
const rAyerSinIds = correr({ conv: { last_message_content: BIENVENIDA, chat_history: '' }, body: {} });
c(rAyerSinIds.json.cold_start === true && rAyerSinIds.json._arranque.bienvenida_canvas === true,
  'la bienvenida se reconoce por sus DOS frases de presentacion aunque el body no traiga los ids');
// La regla de los ids SOLA: ni frase fija, ni bienvenida, ni rebote (el historial dice otra cosa).
const rSoloIds = correr({ conv: { last_message_content: 'Bienvenido a TaxDown', chat_history: 'Agente: Bienvenido a TaxDown Mobility\n' }, body: { conversationPartId: '777', 'First Message ID': '777' } });
c(rSoloIds.json.cold_start === true && rSoloIds.json._arranque.primera_parte === true && rSoloIds.json._arranque.rebotado === false,
  'conversationPartId == First Message ID sigue bastando por si solo (canvas de un paso)');
// Red de seguridad: nuestro propio texto rebotado, con una frase que no es ninguna de las fijas.
const rRebote = correr({ conv: { last_message_content: 'Genial, vamos allá.', chat_history: 'Agente: bienvenida\nUsuario: 🇪🇸 Español\nAgente: Genial, vamos allá.\n' }, body: BODY_CANVAS });
c(rRebote.json.cold_start === true && rRebote.json._arranque.rebotado === true && rRebote.json.idioma_canvas === 'Español',
  'si cambian el texto de B, la ultima linea del Agente == message lo caza igual, y el idioma sale del BOTON del historial');

// Y LO QUE NO DEBE SER ARRANQUE: el cliente escribe de verdad.
const rTurno2 = correr({ conv: { last_message_content: 'Sí, quiero comprobar si cuento con los requisitos', chat_history: HIST_CANVAS_ES + 'Usuario: Sí, quiero comprobar si cuento con los requisitos\n' }, body: { conversationPartId: '53026487356', 'First Message ID': '3929836526' } });
c(rTurno2.json.cold_start === false && rTurno2.json.mensaje_perdido === false && rTurno2.json._arranque.turnos_reales === 1,
  'el turno 2 real (fixture de la 8160903) NO es arranque: el mensaje del cliente viaja tal cual');
c(rTurno2.json.prompt.split('\n')[0] === 'Sí, quiero comprobar si cuento con los requisitos', 'y va en la primera linea del prompt');
const rImita = correr({ conv: { last_message_content: 'perfecto, seguimos en español', chat_history: HIST_CANVAS_ES + 'Usuario: hola tengo una duda\nAgente: dime\nUsuario: perfecto, seguimos en español\n' }, body: { conversationPartId: '99', 'First Message ID': '1' } });
c(rImita.json.cold_start === false, 'un cliente que ESCRIBE la frase del canvas a mitad de hilo NO reinicia la conversacion');
const rPerdido2 = correr({ conv: { last_message_content: '', chat_history: HIST_CANVAS_ES + 'Usuario: llegue el 1/6/2026\n' }, body: BODY_CANVAS });
c(rPerdido2.json.cold_start === false && rPerdido2.json.mensaje_perdido === true,
  'texto vacio con un turno real detras del boton = MENSAJE PERDIDO, no arranque');
const rSoloBoton = correr({ conv: { last_message_content: '', chat_history: 'Agente: bienvenida\nUsuario: 🇬🇧/🇺🇸 English\n' }, body: {} });
c(rSoloBoton.json.cold_start === true && rSoloBoton.json.mensaje_perdido === false && rSoloBoton.json.idioma_canvas === 'Ingles',
  'texto vacio y en el historial SOLO el boton = arranque en frio con el idioma del boton');
// El aislamiento ($json/$now/$input) ya lo prueba el arnes EJECUTANDO: correr() solo
// inyecta $ y console. Una comprobacion por texto aqui anclaria en la prosa de los
// comentarios, que si nombran $json para explicar por que no se usa.

process.stdout.write('\n── 5 · el freno de coste: los dos topes ──\n');
const LARGO = 'a'.repeat(9000);
const rCorte = correr({ conv: { last_message_content: LARGO } });
c(rCorte.json._recortes.mensaje === true, 'un mensaje de 9.000 car se marca como recortado');
c(rCorte.json.prompt.indexOf('a'.repeat(4000)) !== -1 && rCorte.json.prompt.indexOf('a'.repeat(4001)) === -1,
  'y se recorta a 4.000 exactos, ni uno mas');
c(/mensaje recortado por longitud/.test(rCorte.json.prompt), 'con su marca visible para el agente');
c(rCorte.json.prompt.indexOf(LARGO) === -1, 'el texto entero NO viaja al modelo');
const rCorto = correr({});
c(rCorto.json._recortes.mensaje === false && !/mensaje recortado/.test(rCorto.json.prompt),
  'un mensaje normal NO se marca ni se toca');

const HIST = 'Usuario: viejo\n' + 'x'.repeat(30000) + '\nUsuario: ESTO ES LO ULTIMO QUE DIJO';
const rHist = correr({ conv: { chat_history: HIST } });
c(rHist.json._recortes.historial === true, 'un historial de 30.000 car se marca como recortado');
c(/ESTO ES LO ULTIMO QUE DIJO/.test(rHist.json.prompt),
  'SE QUEDA LA COLA: el ultimo turno del cliente sobrevive');
c(!/Usuario: viejo/.test(rHist.json.prompt),
  'y se va la CABEZA (recortar al reves dejaria la presentacion y perderia las 3 ultimas respuestas)');
c(/turnos antiguos recortados/.test(rHist.json.prompt), 'con su marca, que remite a DATOS QUE YA CONOCEMOS');
c(correr({}).json._recortes.historial === false, 'un historial normal NO se marca');

process.stdout.write('\n── 6 · el enmascarado: SOLO el IBAN, y esto es la decision ──\n');
const rIban = correr({ conv: { last_message_content: 'mi cuenta es ES9121000418450200051332, cobrame ahi' } });
c(!/ES9121000418450200051332/.test(rIban.json.prompt), 'un IBAN pegado en el chat NO llega al modelo');
c(/\[IBAN\]/.test(rIban.json.prompt) && rIban.json._pii.iban === 1, 'sale como [IBAN] y el contador lo cuenta');
const rIbanEsp = correr({ conv: { last_message_content: 'ES91 2100 0418 4502 0005 1332' } });
c(/\[IBAN\]/.test(rIbanEsp.json.prompt), 'tambien con espacios, que es como lo pega la gente');
const rIbanHist = correr({ conv: { chat_history: 'Usuario: te paso ES9121000418450200051332\nBot: ok' } });
c(!/ES9121000418450200051332/.test(rIbanHist.json.prompt) && rIbanHist.json._pii.iban === 1,
  'y tambien si lo pego TRES turnos antes: el historial pasa por el mismo filtro');

// LO QUE NO SE ENMASCARA, Y ES A PROPOSITO. Estas cuatro son las que impiden que
// alguien «arregle» esto restaurando el enmascarado del sidecar: si estas cuatro se
// ponen rojas, el intake esta roto y el bot repregunta en bucle.
const rPasa = correr({ conv: { last_message_content: 'soy X1234567L, ana@correo.es, 612345678, naci el 02/03/1990' } });
c(/X1234567L/.test(rPasa.json.prompt), 'el NIE PASA TAL CUAL: es el contrato, el .030 aborta sin el');
c(/ana@correo\.es/.test(rPasa.json.prompt), 'el email PASA TAL CUAL: es un parametro de guardar_datos_cliente');
c(/612345678/.test(rPasa.json.prompt), 'el telefono PASA TAL CUAL: es NumeroTelefono en Airtable');
c(/02\/03\/1990/.test(rPasa.json.prompt), 'una fecha no se confunde con nada');
c(!/\[NIF\]|\[EMAIL\]|\[TELEFONO\]/.test(rPasa.json.prompt),
  'cero marcas de las tres del sidecar: aqui NO se enmascaran');
c(Object.keys(rPasa.json._pii).length === 1 && rPasa.json._pii.iban === 0,
  '_pii tiene UNA sola clave (iban) y en un turno limpio vale 0');
// El motivo de la decision, comprobado contra el validador vivo y no de memoria.
const VAL = fs.readFileSync(RUTA_VALIDADOR, 'utf8');
c(!/\biban\b/i.test(VAL.replace(/LIBANO|libanes\w*/gi, '')),
  'el validador de 76.156 car NO tiene ningun campo iban (por eso taparlo es gratis)');
const rNumeros = correr({ conv: { last_message_content: 'gano 60.000 euros, llegue en 2026, mi CP es 28046' } });
c(/60\.000/.test(rNumeros.json.prompt) && /2026/.test(rNumeros.json.prompt) && /28046/.test(rNumeros.json.prompt),
  'ni un importe, ni un ano, ni un CP se comen por el patron');

process.stdout.write('\n── 7 · el orden: recortar ANTES de enmascarar ──\n');
// Un IBAN justo en el corte. Si se enmascarase primero, el recorte podria partir la
// marca `[IBAN]`; recortando primero, el IBAN partido ya no encaja en el patron y
// LO QUE IMPORTA es que ni la mitad reconocible ni el numero entero sobrevivan.
const rBorde = correr({ conv: { last_message_content: 'b'.repeat(3990) + 'ES9121000418450200051332 fin' } });
c(rBorde.json.prompt.indexOf('ES9121000418450200051332') === -1,
  'un IBAN a caballo del corte no sobrevive entero');
c(!/\[IBA$|\[IB$|\[I$/.test(rBorde.json.prompt.split('\n')[0]),
  'y no queda una marca [IBAN] partida a la mitad');

process.stdout.write('\n── 8 · las guardas que ya tenia y no se han roto ──\n');
const rObj = correr({ fields: { 'Nombre empleado': { state: 'error', errorType: 'emptyDependency' } } });
c(!/\[object Object\]/.test(rObj.json.contexto), 'una celda en error NO escribe [object Object] en el prompt');
// La clave es `estadoCivil` con e minuscula, tal cual esta en Airtable. Con
// `EstadoCivil` esta comprobacion sale roja y NO es el nodo: es el nombre.
const rSel = correr({ fields: { estadoCivil: { id: 'sel1', name: 'casado', color: 'blue' } } });
c(/casado/.test(rSel.json.contexto) && !/object Object/.test(rSel.json.contexto),
  'un singleSelect {id,name,color} se lee por .name');
const rDos = correr({ filas: [{ json: { id: 'recA', fields: {} } }, { json: { id: 'recB', fields: {} } }] });
c(rDos.json._expediente_filas === 2 && /AVISO TECNICO/.test(rDos.json.contexto),
  'con DOS filas del mismo UserId avisa de que no se puede guardar (WP-205b)');
const rCero = correr({ filas: [] });
c(rCero.json._expediente_existe === false && rCero.json._expediente_filas === 0 && !!rCero.json.contexto,
  'sin fila no revienta y sigue montando contexto');
const rBasura = correr({ filas: [{ json: {} }] });
c(rBasura.json._expediente_existe === false, 'un item sin `id` no se cuela como fila (alwaysOutputData)');
c(/EL PLAZO NO LO CALCULAS TU/.test(rCero.json.contexto),
  'y el bloque del plazo va SIEMPRE, exista fila o no');

process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
