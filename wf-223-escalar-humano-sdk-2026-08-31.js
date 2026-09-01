import { workflow, node, trigger, ifElse, newCredential, expr } from '@n8n/workflow-sdk';

const entrada = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.1,
  config: {
    name: 'Entrada de la escalada',
    parameters: {
      inputSource: 'workflowInputs',
      workflowInputs: { values: [{"name": "conversation_id", "type": "string"}, {"name": "user_id", "type": "string"}, {"name": "motivo", "type": "string"}, {"name": "corr_id", "type": "string"}] }
    },
    position: [-880, 0]
  },
  output: [{"conversation_id": "215475581167582", "user_id": "eu-west-1:00000000-0000-4000-8000-0000000000c1", "motivo": "Tiene dos contratos y quiere hablar con una persona.", "corr_id": "215475581167582:52219039912"}]
});

const setTeam = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Team de Ops (VALOR A CONFIRMAR)',
    parameters: {
      mode: 'manual',
      assignments: { assignments: [
        { id: 't1', name: 'team_id_ops', value: '', type: 'string' },
        { id: 't2', name: 'admin_id_bot', value: '4418209', type: 'string' }
      ] },
      includeOtherFields: true,
      include: 'all',
      options: {}
    },
    position: [-660, 0]
  },
  output: [{"team_id_ops": "", "admin_id_bot": "4418209", "conversation_id": "215475581167582", "user_id": "eu-west-1:00000000-0000-4000-8000-0000000000c1", "motivo": "Tiene dos contratos y quiere hablar con una persona.", "corr_id": "215475581167582:52219039912"}]
});

const guarda = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Guarda de la escalada',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// ── WP-223 A · LA GUARDA DE LA ESCALADA ───────────────────────────────────────\n// Es el PRIMER nodo de logica despues del Set del team A PROPOSITO: aqui se para\n// TODO lo que no puede acabar en una asignacion buena, y no se llama a la API.\n//\n// DOS PORQUES, los dos medidos el 31/08 contra el sistema vivo:\n//   1) `conversation_id` se pega DENTRO de la URL de la API. Sin comprobar su\n//      forma, un `/` o un `?` se sale del path.\n//   2) `team_id_ops` es el destino de la asignacion y HOY NO EXISTE: el 11098265\n//      del canvas viejo es de OTRO workspace. Antes se llamaba a Intercom con ese\n//      id y se dependia de que la API lo rechazara. Ahora NO SE LLAMA: se responde\n//      {ok:false, resultado:'team_sin_configurar'} y se ve en el sitio.\n//\n// WP-219: `conversation_id` NUNCA lo elige el LLM (nada de fromAI). No decide a\n// quien se escala; el id lo pasa por expresion el nodo que ya lo tiene. Lo unico\n// que redacta el modelo es `motivo`, que es texto y no direcciona nada.\n'use strict';\n\nconst inp = $input.first().json || {};\n\n// Un singleSelect de Airtable llega como {id,name,color} y una celda de IA en\n// error como {state:'error'}: String() de eso escribe '[object Object]' SIN\n// fallar. Aqui no viene de Airtable, pero la regla es la misma para todo lo que\n// entra de fuera: un objeto no es una cadena, y se trata como ausente.\nfunction txt(v) {\n  if (v === null || v === undefined) return '';\n  if (typeof v === 'object') return '';\n  return String(v).trim();\n}\n\nconst conversationId = txt(inp.conversation_id);\nconst userId = txt(inp.user_id);\nconst corrId = txt(inp.corr_id);\n\n// Los dos ids de Intercom llegan del nodo Set de arriba, no del llamante: el LLM\n// no puede elegir a quien se asigna ni con que admin se firma.\nconst teamId = txt(inp.team_id_ops);\nconst adminId = txt(inp.admin_id_bot);\n\n// Forma de un id de conversacion de Intercom: digitos (215475581167582). Se\n// aceptan tambien guion y subrayado por si el formato cambia, pero NUNCA `/`,\n// `?`, `#`, `.` ni espacios: este valor se pega dentro de la URL de la API y esos\n// son los caracteres con los que se sale del path.\nconst FORMA_CONVERSACION = /^[A-Za-z0-9_-]{5,64}$/;\n\n// Un team_id y un admin_id de Intercom son SOLO digitos. Nada de `{{ }}` a medio\n// resolver, nada de 'TODO', nada de un nombre de equipo.\nconst FORMA_ID_INTERCOM = /^[0-9]{1,20}$/;\n\n// El id del canvas VIEJO. Es numerico, asi que la comprobacion de forma no lo\n// caza: hay que rechazarlo por valor o volveria a colarse una asignacion a otro\n// workspace. Si algun dia el team de Ops de produccion fuera justo este numero,\n// se quita esta linea; hasta entonces vale mas caro un falso negativo.\nconst TEAM_DE_OTRO_WORKSPACE = '11098265';\n\nconst campos = [];\nlet guarda = 'ok';\n\n// PRIMERO el contrato de entrada: un conversation_id que falta es un fallo del\n// llamante y se responde con el mismo enum que el escritor, `schema_error`.\nif (conversationId === '' || !FORMA_CONVERSACION.test(conversationId)) {\n  guarda = 'schema_error';\n  campos.push('conversation_id');\n}\n\n// DESPUES la configuracion. Van en este orden porque un `schema_error` lo arregla\n// quien llama y un `team_sin_configurar` lo arregla quien monta: son dos duenos\n// distintos y conviene no taparse el uno al otro.\nif (guarda === 'ok') {\n  if (teamId === '' || !FORMA_ID_INTERCOM.test(teamId) || teamId === TEAM_DE_OTRO_WORKSPACE) {\n    guarda = 'team_sin_configurar';\n    campos.push('team_id_ops');\n  }\n  // El `admin_id` es OBLIGATORIO en la asignacion de Intercom: es quien firma el\n  // movimiento, ademas del `assignee_id` que lo recibe. Sin el la llamada tampoco\n  // vale, asi que comparte resultado y se distingue por `campos`.\n  if (adminId === '' || !FORMA_ID_INTERCOM.test(adminId)) {\n    guarda = 'team_sin_configurar';\n    campos.push('admin_id_bot');\n  }\n}\n\n// ── ENMASCARADO DE PII DEL TEXTO LIBRE · bloque de WP-222 ────────────────────\n// `motivo` lo redacta el modelo y de aqui va a DOS sitios que quedan escritos: la\n// nota interna de la conversacion y el log de ejecuciones de n8n. Es la misma\n// regla de minimo privilegio del Log_Evento: se guarda CUANTOS, nunca QUE. Ops no\n// pierde nada, porque tiene la conversacion entera delante.\n//\n// UNICA DIFERENCIA CON EL BLOQUE ORIGINAL: alli el enmascarado depende de\n// MODOS_ENMASCARADOS porque en `solicitud` el NIE y el telefono SON el dato que\n// hay que recoger. Aqui no se recoge nada, asi que va siempre encendido.\n//\n// El ORDEN IMPORTA: email e IBAN antes que telefono, o el patron de telefono se\n// come trozos de un IBAN y quedan restos reconocibles. Y NIF antes que telefono,\n// porque un DNI de 8 digitos + letra no es un telefono.\n// Los falsos positivos que se aceptan a proposito, para no tener que descubrirlos\n// otra vez: un importe de 9 cifras escrito con puntos (987.654.321) sale como\n// [TELEFONO]. Lo que NO se toca: 50.000, 60000, un ano (2026) y una fecha\n// (02/03/2026).\nconst PATRONES_PII = [\n  ['email',    /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+/g,               '[EMAIL]'],\n  ['iban',     /\\b[A-Za-z]{2}[0-9]{2}(?:[ -]?[A-Za-z0-9]{4}){3,6}(?:[ -]?[A-Za-z0-9]{1,4})?\\b/g, '[IBAN]'],\n  ['nif',      /\\b(?:[XYZxyz][ -]?[0-9]{7}[ -]?[A-Za-z]|[0-9]{8}[ -]?[A-Za-z])\\b/g,   '[NIF]'],\n  ['telefono', /\\+[0-9]{1,3}[ .\\-]?[0-9](?:[ .\\-]?[0-9]){7,13}/g,                    '[TELEFONO]'],\n  ['telefono', /(?<![0-9])[6-9][0-9]{2}[ .\\-]?[0-9]{3}[ .\\-]?[0-9]{3}(?![0-9])/g,     '[TELEFONO]']\n];\n\n// Contadores. Guardan CUANTOS, nunca QUE: el valor enmascarado no puede volver a\n// aparecer en el item ni en el log, o el enmascarado no serviria de nada.\nconst pii = { email: 0, iban: 0, nif: 0, telefono: 0 };\n\nfunction enmascararTexto(v) {\n  if (typeof v !== 'string' || v === '') return v;\n  let s = v;\n  for (const [nombre, re, marca] of PATRONES_PII) {\n    s = s.replace(re, function () { pii[nombre] += 1; return marca; });\n  }\n  return s;\n}\n\n// ── POR QUE SE LIMPIAN LAS COMILLAS AQUI Y NO EN EL NODO HTTP ────────────────\n// Los dos nodos HTTP mandan el body con la MISMA FORMA que el nodo vivo\n// `Cerrar_Conversacion` de beckham_bot: un JSON de texto, no un objeto de\n// JavaScript. Esa forma es la de la casa y no se cambia — pero un `\"` dentro de\n// un texto libre partiria ese JSON, y el motivo lo escribe el modelo. Asi que el\n// texto sale de aqui ya apto para meterse entre comillas: cero comillas, cero\n// barras, cero saltos de linea, cero caracteres de control.\nfunction limpiarParaJson(v) {\n  if (typeof v !== 'string' || v === '') return '';\n  return v\n    .replace(/[\\r\\n\\t]+/g, ' · ')\n    .replace(/[\"\\\\]/g, '')\n    .replace(/[\\u0000-\\u001F\\u007F]/g, '')\n    .trim();\n}\n\n// El motivo no puede tumbar la escalada: si viene vacio se pone uno neutro, y se\n// recorta a 400 caracteres porque es una nota, no un informe.\nconst MOTIVO_MAX = 400;\nlet motivo = limpiarParaJson(enmascararTexto(txt(inp.motivo)));\nif (motivo.length > MOTIVO_MAX) motivo = motivo.slice(0, MOTIVO_MAX - 1) + '…';\nif (motivo === '') motivo = 'El cliente ha pedido hablar con una persona.';\n\n// EL SLA ES EL QUE PROMETE EL PROMPT, LITERAL: «24-48 horas». Comprobado el\n// 31/08 contra docs/prompt-final-2026-08-26-v14.txt, donde aparece en SEIS\n// lineas (105, 363, 364, 367, 430 y 468) y es el UNICO plazo de respuesta\n// que el bot tiene permitido dar. Aqui NO se inventa otro, y si algun dia cambia\n// se cambia en los dos sitios a la vez.\nconst SLA = '24-48 horas';\n\n// El texto de la nota interna se arma AQUI, no en el nodo HTTP: asi el plazo y el\n// SLA viven en el mismo sitio que la constante y no hay dos redacciones que se\n// puedan separar. La nota es INTERNA por definicion de Intercom: el cliente no la\n// ve.\nconst notaBody = 'Escalado por el bot Beckham. SLA prometido al cliente: ' + SLA +\n  '. UserId: ' + (limpiarParaJson(userId) || 'sin user_id') +\n  '. corr_id: ' + (limpiarParaJson(corrId) || 'sin corr_id') +\n  '. Motivo (con la PII enmascarada): ' + motivo;\n\nreturn [{\n  json: {\n    _guarda: guarda,\n    ok: guarda === 'ok',\n    resultado: guarda,\n    campos: campos,\n    conversation_id: conversationId,\n    user_id: userId,\n    corr_id: corrId,\n    motivo: motivo,\n    nota_body: notaBody,\n    team_id_ops: teamId,\n    admin_id_bot: adminId,\n    pii: pii,\n    sla: SLA\n  }\n}];\n" },
    position: [-440, 0]
  },
  output: [{"_guarda": "team_sin_configurar", "ok": false, "resultado": "team_sin_configurar", "campos": ["team_id_ops"], "conversation_id": "215475581167582", "user_id": "eu-west-1:00000000-0000-4000-8000-0000000000c1", "corr_id": "215475581167582:52219039912", "motivo": "Tiene dos contratos y quiere hablar con una persona.", "nota_body": "Escalado por el bot Beckham. SLA prometido al cliente: 24-48 horas. UserId: eu-west-1:00000000-0000-4000-8000-0000000000c1. corr_id: 215475581167582:52219039912. Motivo (con la PII enmascarada): Tiene dos contratos y quiere hablar con una persona.", "team_id_ops": "", "admin_id_bot": "4418209", "pii": {"email": 0, "iban": 0, "nif": 0, "telefono": 0}, "sla": "24-48 horas"}]
});

const siGuarda = ifElse({
  version: 2.2,
  config: {
    name: '¿Guarda superada?',
    parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 }, conditions: [{ id: 'g1', leftValue: '={{ $json._guarda }}', rightValue: 'ok', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
    position: [-220, 0]
  }
});

const asignar = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Asignar la conversacion al team de Ops',
    parameters: {
      method: 'POST',
      url: expr("https://api.intercom.io/conversations/{{ $('Guarda de la escalada').item.json.conversation_id }}/parts"),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'intercomApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{\"message_type\":\"assignment\",\"type\":\"admin\",\"admin_id\":\"{{ $('Guarda de la escalada').item.json.admin_id_bot }}\",\"assignee_id\":\"{{ $('Guarda de la escalada').item.json.team_id_ops }}\"}"),
      options: { timeout: 15000 }
    },
    credentials: { intercomApi: newCredential('Intercom Beckham') },
    onError: 'continueErrorOutput',
    alwaysOutputData: false,
    position: [20, -120]
  },
  output: [{"type": "conversation", "id": "215475581167582", "admin_assignee_id": null, "team_assignee_id": 0}]
});

const nota = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Nota interna con el motivo',
    parameters: {
      method: 'POST',
      url: expr("https://api.intercom.io/conversations/{{ $('Guarda de la escalada').item.json.conversation_id }}/parts"),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'intercomApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{\"message_type\":\"note\",\"type\":\"admin\",\"admin_id\":\"{{ $('Guarda de la escalada').item.json.admin_id_bot }}\",\"body\":\"{{ $('Guarda de la escalada').item.json.nota_body }}\"}"),
      options: { timeout: 15000 }
    },
    credentials: { intercomApi: newCredential('Intercom Beckham') },
    onError: 'continueErrorOutput',
    alwaysOutputData: false,
    position: [260, -120]
  },
  output: [{"type": "conversation", "id": "215475581167582"}]
});

const respOk = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Respuesta OK',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// ── WP-223 A · LA RESPUESTA ───────────────────────────────────────────────────\n// «Ningun ok:true que signifique no hice nada.» Este nodo NO firma el ok por\n// haber llegado hasta aqui: exige que la llamada de ASIGNACION haya devuelto una\n// conversacion con su id. Si no lo devuelve -> asignacion_fallida, el mismo enum\n// que la rama de error del nodo HTTP.\n//\n// En nodos de codigo SIEMPRE $('X').first(), nunca $('X').item: el .item cuelga\n// el task runner hasta el timeout.\n'use strict';\n\nconst g = $('Guarda de la escalada').first().json || {};\n\n// La asignacion es la accion que importa y va DOS nodos atras (la nota interna es\n// la que entra por $input). Se lee explicitamente por nombre.\nlet asig = {};\ntry {\n  asig = $('Asignar la conversacion al team de Ops').first().json || {};\n} catch (e) {\n  asig = {};\n}\n\nconst nota = $input.first().json || {};\n\nconst idAsignacion = (asig && asig.id !== undefined && asig.id !== null) ? String(asig.id) : '';\nconst asignada = idAsignacion !== '';\nconst notaPuesta = !!(nota && nota.id);\n\nreturn [{\n  json: {\n    ok: asignada,\n    resultado: asignada ? 'asignada' : 'asignacion_fallida',\n    corr_id: g.corr_id || '',\n    conversation_id: g.conversation_id || '',\n    team_id: String(g.team_id_ops || ''),\n    sla: g.sla || '24-48 horas',\n    nota_interna: notaPuesta,\n    pii_enmascarada: g.pii || {}\n  }\n}];\n" },
    position: [500, -120]
  },
  output: [{"ok": true, "resultado": "asignada", "corr_id": "215475581167582:52219039912", "conversation_id": "215475581167582", "team_id": "0000000", "sla": "24-48 horas", "nota_interna": true, "pii_enmascarada": {"email": 0, "iban": 0, "nif": 0, "telefono": 0}}]
});

const respAsig = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Respuesta asignacion fallida',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// ── WP-223 A · la rama de ERROR de la ASIGNACION ──────────────────────────────\n// Sin esta rama un fallo de la API de Intercom revienta el subworkflow y el\n// llamante recibe una excepcion en vez de una respuesta del contrato.\n//\n// LO QUE YA NO SALTA POR AQUI: el team sin configurar. Desde el 31/08 eso lo caza\n// la guarda ANTES de llamar a la API (`team_sin_configurar`), asi que si esta\n// rama se enciende es que Intercom ha dicho no a un id que SI tiene forma buena:\n// credencial mala, team borrado, conversacion inexistente o la API caida.\n'use strict';\n\nconst g = $('Guarda de la escalada').first().json || {};\nconst e = $input.first().json || {};\n\n// `detalle` lleva el mensaje del error, NUNCA el motivo ni el body: el body de la\n// nota trae texto del cliente y las ejecuciones se guardan.\nlet detalle = '';\ntry {\n  detalle = String((e && e.error && e.error.message) || (e && e.message) || 'la API de Intercom no acepto la asignacion');\n} catch (err) {\n  detalle = 'la API de Intercom no acepto la asignacion';\n}\n\nreturn [{\n  json: {\n    ok: false,\n    resultado: 'asignacion_fallida',\n    corr_id: g.corr_id || '',\n    conversation_id: g.conversation_id || '',\n    team_id: String(g.team_id_ops || ''),\n    sla: g.sla || '24-48 horas',\n    detalle: detalle.slice(0, 300)\n  }\n}];\n" },
    position: [260, 100]
  },
  output: [{"ok": false, "resultado": "asignacion_fallida", "corr_id": "215475581167582:52219039912", "conversation_id": "215475581167582", "team_id": "0000000", "sla": "24-48 horas", "detalle": "Not Found"}]
});

const respSinNota = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Respuesta asignada sin nota',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// ── WP-223 A · la rama de ERROR de la NOTA INTERNA ────────────────────────────\n// La asignacion YA SE HA HECHO cuando se llega aqui: la nota va DESPUES a\n// proposito, para que un fallo de la nota no se lleve por delante la escalada.\n// Por eso esta respuesta es ok:TRUE con un resultado que dice lo que falta, y no\n// un ok:false que haria que el bot le dijera al cliente que no se ha escalado.\n'use strict';\n\nconst g = $('Guarda de la escalada').first().json || {};\n\nreturn [{\n  json: {\n    ok: true,\n    resultado: 'asignada_sin_nota',\n    corr_id: g.corr_id || '',\n    conversation_id: g.conversation_id || '',\n    team_id: String(g.team_id_ops || ''),\n    sla: g.sla || '24-48 horas',\n    nota_interna: false,\n    pii_enmascarada: g.pii || {}\n  }\n}];\n" },
    position: [500, 100]
  },
  output: [{"ok": true, "resultado": "asignada_sin_nota", "corr_id": "215475581167582:52219039912", "conversation_id": "215475581167582", "team_id": "0000000", "sla": "24-48 horas", "nota_interna": false, "pii_enmascarada": {"email": 0, "iban": 0, "nif": 0, "telefono": 0}}]
});

const respGuarda = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Respuesta rechazo de la guarda',
    parameters: {
      mode: 'raw',
      jsonOutput: expr("{{ { ok: false, resultado: $json.resultado, campos: $json.campos, corr_id: $json.corr_id, conversation_id: $json.conversation_id, team_id: $json.team_id_ops, sla: $json.sla, error: $json.resultado } }}"),
      options: {}
    },
    position: [20, 220]
  },
  output: [{"ok": false, "resultado": "team_sin_configurar", "campos": ["team_id_ops"], "corr_id": "215475581167582:52219039912", "conversation_id": "215475581167582", "team_id": "", "sla": "24-48 horas", "error": "team_sin_configurar"}]
});

const notaGuarda = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    name: 'Nota · la guarda',
    parameters: { content: "## LA GUARDA · lo que se para AQUI y no llega a la API\n\n**WP-219: `conversation_id` NUNCA lo elige el LLM (nada de `fromAI`).** El LLM no elige a quien se escala. Los cuatro valores entran por `workflowInputs` y el nodo que llame a este subworkflow tiene que pasar el `conversation_id` POR EXPRESION, desde el webhook.\nLo unico que redacta el modelo es `motivo`, que es texto y no direcciona nada.\n\n**La guarda para aqui y NO llama a Intercom si:**\n- `conversation_id` vacio o sin forma de id (`^[A-Za-z0-9_-]{5,64}$`) -> `{ok:false, resultado:'schema_error'}`. Ese valor se pega DENTRO de la URL: sin esto un `/` o un `?` se sale del path.\n- `team_id_ops` o `admin_id_bot` vacios, no numericos, o el team del canvas viejo (`11098265`, de OTRO workspace) -> `{ok:false, resultado:'team_sin_configurar'}`. **Hasta el 31/08 se llamaba a la API con el id ajeno y se confiaba en que Intercom lo rechazara. Ya no: no se llama.** `campos` dice cual de los dos falta.\n\n**El motivo se enmascara** con el bloque PATRONES_PII de WP-222, tal cual, y se recorta a 400 car. Va a una nota que queda escrita y al log de ejecuciones: se guarda CUANTOS, nunca QUE. Y ademas se le quitan comillas, barras y saltos de linea, porque el body de los dos nodos HTTP es **JSON de texto** (la forma del nodo vivo `Cerrar_Conversacion`) y un `\"` en el texto libre lo partiria.\n\n**El SLA es `24-48 horas`**, literal del prompt v14 (seis lineas: 105, 363, 364, 367, 430 y 468 — es el UNICO plazo que el bot tiene permitido dar). Se define UNA vez, en la constante `SLA` de este nodo, y de ahi sale el texto de la nota.", height: 520, width: 620, color: 4 },
    position: [-900, 420]
  },
  output: [{}]
});

const notaTeam = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    name: 'Nota · el team de Ops A CONFIRMAR',
    parameters: { content: "## ⚠️ EL TEAM DE OPS ES UN VALOR A CONFIRMAR\n\n`team_id_ops` sale VACIO a proposito. **Mientras este vacio, este workflow responde `{ok:false, resultado:'team_sin_configurar'}` y no llama a la API de Intercom.** Es lo correcto: no existe el team de Ops_Mobility (WP-223), y el `11098265` del canvas viejo **es de OTRO workspace** — la guarda lo rechaza tambien por valor, no solo por forma.\n\n**PASO 1 · pon el id numerico del team de produccion** en el campo `team_id_ops` de este nodo Set. Es un **texto**, no un desplegable. Se saca en Intercom: Settings -> Teams -> el team -> el numero del final de la URL.\n**PASO 2 · comprueba el `admin_id_bot`**: `4418209` es el admin con el que el bot ya cierra conversaciones en `beckham_bot` (`Cerrar_Conversacion`, medido el 31/08). Intercom exige un `admin_id` que FIRME la asignacion, ademas del `assignee_id` que la recibe.\n**PASO 3 · elige la credencial `intercomApi` a mano** en los dos nodos HTTP. Por MCP las credenciales salen vacias SIEMPRE, tambien en los nodos que funcionan: la unica forma de comprobarlas es EJECUTAR el workflow.\n\n**ESTE NODO YA NO SE LEE POR NOMBRE DESDE NINGUN NODO DE CODIGO** (31/08). Antes `Respuesta OK` y `Respuesta asignada sin nota` hacian `$('Team de Ops (VALOR A CONFIRMAR)').first()`, y n8n **no reescribe las referencias dentro de un nodo `code`** al renombrar: la referencia rota no daba error hasta ejecutarse. Ahora los dos ids viajan dentro del item por `includeOtherFields` y se leen de la guarda. **Renombrar este nodo es gratis.**", height: 520, width: 620, color: 3 },
    position: [-260, 420]
  },
  output: [{}]
});

const notaOrden = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    name: 'Nota · el orden de las dos llamadas',
    parameters: { content: "## EL ORDEN: PRIMERO ASIGNAR, DESPUES LA NOTA\n\nLas dos llamadas van con **el patron de la casa para la API de Intercom**, el del nodo vivo `Cerrar_Conversacion` de `beckham_bot` (y lo confirma tambien `Traer_Conversacion_intercom1`): `httpRequest` **tv 4.4** · `POST` · URL `https://api.intercom.io/conversations/{id}/parts` · `authentication: predefinedCredentialType` + `nodeCredentialType: intercomApi` · body en **JSON de texto**, no un objeto de JavaScript. Cero patrones nuevos: la asignacion de Intercom es EL MISMO endpoint `/parts`, solo cambia el `message_type`.\n\n1. `message_type: assignment` -> la escalada. **Sin `body`**: no esta medido si el body de una asignacion es interno o lo ve el cliente, y equivocarse ahi le ensena texto interno al cliente.\n2. `message_type: note` -> el motivo. **La nota SI es interna por definicion.**\n\nSi falla la nota, la escalada YA ESTA HECHA: la respuesta es `{ok:true, resultado:'asignada_sin_nota'}`, no un `ok:false` que haria que el bot le dijera al cliente que no se ha escalado.\n\n**El enum de `resultado`:** `asignada` · `asignada_sin_nota` · `asignacion_fallida` · `schema_error` · `team_sin_configurar`.\n\nEn las **expresiones** de estos dos nodos va `$('...').item`, no `.first()`: es la regla de la casa al reves que en los nodos de codigo. Aqui coinciden — un subworkflow-tool corre siempre con UN item — y se mantiene `.item` por consistencia.", height: 520, width: 620, color: 5 },
    position: [380, 420]
  },
  output: [{}]
});

const notaPromesa = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    name: 'Nota · la promesa que hoy no cumple nadie',
    parameters: { content: "## ESTE WORKFLOW ES EL QUE CONVIERTE LA PROMESA DEL BOT EN VERDAD\n\nMedido el 31/08 a las 12:00 sobre el export ENTERO de `beckham_bot` — **60 nodos** ya, los 55 mas los 5 de la rama del FAQ que se cableo esta manana: **hoy NADIE asigna la conversacion.** Cero `assignee`, cero `team_id`, cero `Assign`, cero `snoozed`. `/conversations/{id}/parts` aparece **UNA sola vez** en todo el workflow (`Cerrar_Conversacion`) y el unico `admin_id` que existe es el de su cuerpo, o sea el admin que CIERRA, no un asignatario.\n\n**Lo que el bot le dice HOY al cliente cuando se rompe** (`Mensaje_fallback`, nodo `code` de cinco lineas, texto literal, con ñ en «compañero» y sin tildes en «tecnico/revisara/escribira»):\n\n> «Vaya, ahora mismo no puedo continuar por un problema tecnico. Un compañero del equipo lo revisara y te escribira en breve. Disculpa las molestias.»\n\nY la alerta que sale a Slack a la vez (`Avisar_Fallback1`, `tipo_alerta: bot_fallback_sin_humano`) lo admite con letra: **«Nadie ha sido asignado.»**\n\nO sea: **la promesa se hace y no la cumple nada.** Este workflow es lo que la cumple — y hasta que se cablee y se ponga el `team_id_ops`, el bot sigue prometiendo en falso. Los pasos exactos para cablearlo estan en **`docs/pegar-escalar-humano-2026-08-31.md`**, incluido que hacer con `Mensaje_fallback`.\n\n**OJO: `Mensaje_fallback` solo lo dispara la rama de ERROR de `Formatear_conversacion1`.** El `AI Agent` va con `onError: null`, asi que un fallo del agente o del LLM es hoy un turno MUDO: ni mensaje al cliente, ni alerta. Eso es otro agujero y este workflow no lo tapa.", height: 520, width: 620, color: 6 },
    position: [1020, 420]
  },
  output: [{}]
});

export default workflow('beckham-escalar-humano', 'BECKHAM_escalar_humano', {
  settings: { errorWorkflow: 'BJfExmwu1fI1aPpY', executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: true, saveExecutionProgress: true, executionTimeout: 120 }
})
  .add(entrada)
  .to(setTeam)
  .to(guarda)
  .to(siGuarda
    .onTrue(asignar.to(nota.to(respOk)))
    .onFalse(respGuarda))
  .add(asignar.onError(respAsig))
  .add(nota.onError(respSinNota))
  .add(notaGuarda)
  .add(notaTeam)
  .add(notaOrden)
  .add(notaPromesa);
