// ─────────────────────────────────────────────────────────────────────────────
// BECKHAM_registrar_optout · N6aIm7mY4J7zvhmH
// Fuente del subworkflow-tool de la baja (WP-223 B). Se pega por MCP con
// update_workflow. NO es beckham_bot: este si se puede reescribir por API.
//
// REVISION DEL 31/08/2026 · «ALINEAR CON LO QUE HAY EN AIRTABLE»
// Antes de esta revision el workflow hacia el PATCH a pelo y se comia un
// 422 UNKNOWN_FIELD_NAME de Airtable, porque `recordatorio_optout` NO EXISTE
// entre las 99 columnas de Empleados. Ahora no llama a la API de escritura:
// responde {ok:false, resultado:'columna_no_existe', detalle:'crear
// recordatorio_optout como casilla en Empleados'}. Un error propio y legible
// vale mas que un 422 ajeno.
// Version anterior del workflow, por si hay que volver: dc13b885-74d0-4f7c-a8b8-6bd307f68a0b
//
// LA GUARDA DEL user_id NO SE HA TOCADO NI UNA COMA: es la que cierra la fuga
// de PII del 28/08 ({UserId} = '' casa con las filas sin UserId, y hoy hay dos
// con PII real dentro).
// ─────────────────────────────────────────────────────────────────────────────
import { workflow, node, trigger, ifElse, newCredential, expr } from '@n8n/workflow-sdk';

const entrada = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.1,
  config: {
    name: 'Entrada del optout',
    parameters: {
      inputSource: 'workflowInputs',
      workflowInputs: { values: [{"name": "user_id", "type": "string"}, {"name": "corr_id", "type": "string"}] }
    },
    position: [-780, 0]
  },
  output: [{"user_id": "eu-west-1:00000000-0000-4000-8000-0000000000c1", "corr_id": "215475581167582:52219039912"}]
});

// ─── LA GUARDA · INTACTA, NI UNA COMA ────────────────────────────────────────
const guarda = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Guarda del user_id',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `// ── WP-223 B · LA GUARDA DEL user_id, Y POR QUE VA ANTES DE LA BUSQUEDA ───────
// LA FUGA MEDIDA EL 31/08/2026: \`filterByFormula: {UserId} = ""\` NO devuelve
// «nada» — CASA con las filas que tienen el UserId en blanco, y hoy hay DOS con
// PII real dentro. O sea que un user_id vacio no falla: encuentra el expediente
// de otra persona y le escribiriamos el optout. Por eso esta guarda va ANTES de
// tocar Airtable y por eso la formula se monta AQUI y no en el nodo de busqueda.
//
// Segunda red, para cuando alguien toque esto: el nodo de busqueda va con
// limit:2, asi que una formula vacia (que en Airtable significa «todas las
// filas») devuelve DOS y el resolvedor la manda a multi_match. Fail-closed por
// construccion, no por confianza.
'use strict';

const inp = $input.first().json || {};

function txt(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return '';
  return String(v).trim();
}

const userId = txt(inp.user_id);
const corrId = txt(inp.corr_id);

// Forma del UserId: es el external_id del contacto de Intercom, del tipo
// 'eu-west-1:00000000-0000-4000-8000-0000000000c1'. La whitelist es CERRADA y
// deja fuera la comilla doble y la barra invertida: sin ellas no hay forma de
// cerrar la cadena de la formula y colar un OR(), que en este campo seria leer
// —y marcar— el expediente de cualquiera.
const FORMA_USER_ID = /^[A-Za-z0-9:_.@-]{8,200}$/;

const campos = [];
let guarda = 'ok';
if (userId === '') {
  guarda = 'schema_error';
  campos.push('user_id');
} else if (!FORMA_USER_ID.test(userId)) {
  guarda = 'user_id_forma_invalida';
  campos.push('user_id');
}

// La formula solo existe si la guarda ha pasado. Se monta por concatenacion
// porque la whitelist ya garantiza que no hay comillas que escapar.
const formula = (guarda === 'ok') ? '{UserId} = "' + userId + '"' : '';

return [{
  json: {
    _guarda: guarda,
    _formula: formula,
    ok: guarda === 'ok',
    resultado: guarda,
    campos: campos,
    user_id: userId,
    corr_id: corrId
  }
}];
` },
    position: [-560, 0]
  },
  output: [{"_guarda": "ok", "_formula": "{UserId} = \"eu-west-1:00000000-0000-4000-8000-0000000000c1\"", "ok": true, "resultado": "ok", "campos": [], "user_id": "eu-west-1:00000000-0000-4000-8000-0000000000c1", "corr_id": "215475581167582:52219039912"}]
});

const siGuarda = ifElse({
  version: 2.2,
  config: {
    name: '¿Guarda superada?',
    parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 }, conditions: [{ id: 'g1', leftValue: '={{ $json._guarda }}', rightValue: 'ok', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
    position: [-340, 0]
  }
});

const buscar = node({
  type: 'n8n-nodes-base.airtable',
  version: 2.2,
  config: {
    name: 'Buscar la fila por UserId',
    parameters: {
      resource: 'record',
      operation: 'search',
      authentication: 'airtableTokenApi',
      base: {"__rl": true, "value": "app5K8OnSObqwWweS", "mode": "list", "cachedResultName": "Mobility_2026", "cachedResultUrl": "https://airtable.com/app5K8OnSObqwWweS"},
      table: {"__rl": true, "value": "tblTWCWu5nQXNOMR1", "mode": "list", "cachedResultName": "Empleados", "cachedResultUrl": "https://airtable.com/app5K8OnSObqwWweS/tblTWCWu5nQXNOMR1"},
      filterByFormula: expr("{{ $('Guarda del user_id').item.json._formula }}"),
      returnAll: false,
      limit: 2,
      options: { fields: ['UserId'] }
    },
    credentials: { airtableTokenApi: newCredential('Airtable Mobility_2026') },
    onError: 'continueErrorOutput',
    alwaysOutputData: true,
    position: [-100, -140]
  },
  output: [{"id": "recAAAAAAAAAAAAAA", "createdTime": "2026-08-27T10:00:00.000Z", "fields": {"UserId": "eu-west-1:00000000-0000-4000-8000-0000000000c1"}}]
});

// ─── EL RESOLVEDOR · AQUI VIVE EL UNICO INTERRUPTOR ──────────────────────────
const resolver = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Resolver la fila',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `// ── WP-223 B · RESOLVER LA FILA, Y COMPROBAR QUE LA COLUMNA EXISTE ───────────
//
//   ###########################################################################
//   #  EL UNICO INTERRUPTOR DE ESTE WORKFLOW ES LA CONSTANTE COLUMNA_EXISTE   #
//   #  DE AQUI ABAJO. El dia que 'recordatorio_optout' exista en Empleados    #
//   #  COMO CASILLA, se pone en true y el PATCH empieza a hacerse. No hay     #
//   #  NADA MAS que tocar en ningun sitio.                                    #
//   ###########################################################################
'use strict';

const COLUMNA = 'recordatorio_optout';
const COLUMNA_EXISTE = false;   // 31/08/2026 · MEDIDO: no esta entre las 99 columnas

// POR QUE UN INTERRUPTOR A MANO Y NO UNA COMPROBACION AUTOMATICA:
// (1) preguntarle el schema a Airtable seria una llamada mas por cada baja; y
// (2) LEER la fila no sirve para saberlo — Airtable OMITE las celdas vacias en
//     la respuesta, asi que una casilla SIN MARCAR y una casilla QUE NO EXISTE
//     se leen EXACTAMENTE IGUAL: las dos, ausentes. Lo unico que las distingue
//     es el error de la ESCRITURA, y provocar un 422 para enterarse es
//     precisamente lo que esta revision viene a quitar.
//
// ── LAS SALIDAS, y ninguna es un error de programa ───────────────────────────
//   0 filas  -> sin_fila           (un visitante que nunca llego a expediente)
//   2 filas  -> multi_match        (guarda de unicidad WP-205b: con el UserId
//                                   duplicado NO se escribe nada y se avisa)
//   1 fila   -> se mira la columna: ok | columna_no_existe
// limit:1 NO serviria: la API trunca y seria IMPOSIBLE enterarse de que hay dos.
//
// Con alwaysOutputData:true el caso de 0 filas llega como un item {} — por eso se
// filtra por la presencia de 'id' en vez de contar items.
//
// EL ORDEN IMPORTA, y es el orden real de los hechos: primero el problema de la
// FILA, despues el de la COLUMNA. El 422 de Airtable solo habria llegado DESPUES
// de resolver la fila, y a quien llama le sirve mas 'sin_fila' que taparlo con
// 'columna_no_existe'.

const g = $('Guarda del user_id').first().json || {};

const filas = $input.all().filter(function (i) {
  return i && i.json && i.json.id;
});

let estado = 'ok';
let detalle = '';

if (filas.length === 0) {
  estado = 'sin_fila';
  detalle = 'ninguna fila de Empleados tiene ese UserId';
} else if (filas.length > 1) {
  estado = 'multi_match';
  detalle = 'hay dos o mas filas de Empleados con ese UserId: la guarda de unicidad WP-205b no deja escribir en ninguna';
} else if (!COLUMNA_EXISTE) {
  estado = 'columna_no_existe';
  detalle = 'crear ' + COLUMNA + ' como casilla en Empleados';
}

// El record_id se devuelve tambien cuando la columna falta: asi la respuesta
// dice QUE FILA se habria marcado, que es el dato que hace falta para marcarla
// a mano mientras la columna no exista.
return [{
  json: {
    _estado: estado,
    ok: estado === 'ok',
    resultado: estado === 'ok' ? 'ok' : estado,
    record_id: filas.length === 1 ? String(filas[0].json.id) : '',
    n_filas: filas.length,
    detalle: detalle,
    campo: COLUMNA,
    user_id: g.user_id || '',
    corr_id: g.corr_id || ''
  }
}];
` },
    position: [140, -140]
  },
  output: [{"_estado": "columna_no_existe", "ok": false, "resultado": "columna_no_existe", "record_id": "recAAAAAAAAAAAAAA", "n_filas": 1, "detalle": "crear recordatorio_optout como casilla en Empleados", "campo": "recordatorio_optout", "user_id": "eu-west-1:00000000-0000-4000-8000-0000000000c1", "corr_id": "215475581167582:52219039912"}]
});

const siFila = ifElse({
  version: 2.2,
  config: {
    name: '¿Una sola fila?',
    parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 }, conditions: [{ id: 'f1', leftValue: '={{ $json._estado }}', rightValue: 'ok', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
    position: [360, -140]
  }
});

const patch = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'PATCH del recordatorio_optout',
    parameters: {
      method: 'PATCH',
      url: expr("https://api.airtable.com/v0/app5K8OnSObqwWweS/tblTWCWu5nQXNOMR1/{{ $('Resolver la fila').item.json.record_id }}"),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'airtableTokenApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{{ { fields: { recordatorio_optout: true } } }}"),
      options: { timeout: 15000 }
    },
    credentials: { airtableTokenApi: newCredential('Airtable Mobility_2026') },
    onError: 'continueErrorOutput',
    alwaysOutputData: false,
    position: [600, -260]
  },
  output: [{"id": "recAAAAAAAAAAAAAA", "createdTime": "2026-08-27T10:00:00.000Z", "fields": {"recordatorio_optout": true}}]
});

const respOk = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Respuesta OK',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `// ── WP-223 B · LA RESPUESTA BUENA ────────────────────────────────────────────
// «Ningun ok:true que signifique no hice nada.» El PATCH de Airtable devuelve el
// registro actualizado con sus fields, asi que aqui se EXIGE ver
// recordatorio_optout === true en la respuesta.
//
// LO QUE SIGUE CAZANDO despues de la revision del 31/08: que la columna exista
// pero NO SEA UNA CASILLA. Si se crea como texto, o como singleSelect, el valor
// vuelve distinto de true y esto responde persistencia_fallida en vez de decir
// que se guardo. Es a proposito, y es el motivo de que el paso 1 de la nota
// diga CASILLA en mayusculas.
//
// El caso «la columna no existe» ya NO llega hasta aqui: lo para el interruptor
// de 'Resolver la fila' antes de tocar la API.
'use strict';

const r = $input.first().json || {};
const g = $('Guarda del user_id').first().json || {};
const f = $('Resolver la fila').first().json || {};

const id = (r && r.id !== undefined && r.id !== null) ? String(r.id) : '';
const campos = (r && r.fields && typeof r.fields === 'object') ? r.fields : {};
const escrito = (id !== '' && campos.recordatorio_optout === true);

return [{
  json: {
    ok: escrito,
    resultado: escrito ? 'optout_registrado' : 'persistencia_fallida',
    detalle: escrito ? '' : 'Airtable acepto el PATCH pero no devolvio recordatorio_optout=true: comprueba que la columna es una CASILLA',
    corr_id: g.corr_id || '',
    record_id: id || f.record_id || '',
    campo: 'recordatorio_optout'
  }
}];
` },
    position: [840, -260]
  },
  output: [{"ok": true, "resultado": "optout_registrado", "detalle": "", "corr_id": "215475581167582:52219039912", "record_id": "recAAAAAAAAAAAAAA", "campo": "recordatorio_optout"}]
});

const respPersistencia = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Respuesta persistencia fallida',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `// ── WP-223 B · la rama de ERROR del PATCH ────────────────────────────────────
// Sin esta rama un fallo de Airtable revienta el subworkflow y el llamante recibe
// una excepcion en vez de una respuesta del contrato.
//
// OJO AL CAMBIO DEL 31/08: esta rama YA NO ES la que salta siempre. Antes lo era,
// porque el PATCH se hacia a ciegas contra una columna inexistente y volvia un
// 422 UNKNOWN_FIELD_NAME; ahora ese caso lo para el interruptor de 'Resolver la
// fila' y NI SE LLAMA A LA API. Mientras COLUMNA_EXISTE siga en false esta rama
// es INALCANZABLE: se queda de red para el dia que la columna exista y falle otra
// cosa — token caducado, rate limit de Airtable, red, o la fila borrada entre la
// busqueda y el PATCH.
'use strict';

const g = $('Guarda del user_id').first().json || {};
const f = $('Resolver la fila').first().json || {};
const e = $input.first().json || {};

let detalle = '';
try {
  detalle = String((e && e.error && e.error.message) || (e && e.message) || 'Airtable no acepto el PATCH');
} catch (err) {
  detalle = 'Airtable no acepto el PATCH';
}

return [{
  json: {
    ok: false,
    resultado: 'persistencia_fallida',
    corr_id: g.corr_id || '',
    record_id: f.record_id || '',
    campo: 'recordatorio_optout',
    detalle: detalle.slice(0, 300)
  }
}];
` },
    position: [840, -80]
  },
  output: [{"ok": false, "resultado": "persistencia_fallida", "corr_id": "215475581167582:52219039912", "record_id": "recAAAAAAAAAAAAAA", "campo": "recordatorio_optout", "detalle": "Rate limit"}]
});

// Antes se llamaba 'Respuesta sin fila o multi match'. Se renombra porque desde
// el 31/08 contesta TRES cosas, no dos, y el nombre viejo mentia. Es seguro:
// ningun nodo de codigo la referencia por nombre, solo la conexion del if.
const respNoEscrita = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Respuesta no escrita',
    parameters: { mode: 'raw', jsonOutput: expr("{{ { ok: false, resultado: $json.resultado, detalle: $json.detalle, n_filas: $json.n_filas, record_id: $json.record_id, corr_id: $json.corr_id, campo: 'recordatorio_optout', error: $json.resultado } }}"), includeOtherFields: false, options: {} },
    position: [600, 60]
  },
  output: [{"ok": false, "resultado": "columna_no_existe", "detalle": "crear recordatorio_optout como casilla en Empleados", "n_filas": 1, "record_id": "recAAAAAAAAAAAAAA", "corr_id": "215475581167582:52219039912", "campo": "recordatorio_optout", "error": "columna_no_existe"}]
});

const respLectura = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Respuesta lectura fallida',
    parameters: { mode: 'raw', jsonOutput: expr("{{ { ok: false, resultado: 'lectura_fallida', detalle: 'Airtable no contesto a la busqueda por UserId', corr_id: $('Guarda del user_id').item.json.corr_id, campo: 'recordatorio_optout', error: 'lectura_fallida' } }}"), includeOtherFields: false, options: {} },
    position: [140, 100]
  },
  output: [{"ok": false, "resultado": "lectura_fallida", "detalle": "Airtable no contesto a la busqueda por UserId", "corr_id": "215475581167582:52219039912", "campo": "recordatorio_optout", "error": "lectura_fallida"}]
});

const respGuarda = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Respuesta rechazo de la guarda',
    parameters: { mode: 'raw', jsonOutput: expr("{{ { ok: false, resultado: $json.resultado, detalle: 'el user_id no vale y NO se ha consultado Airtable', campos: $json.campos, corr_id: $json.corr_id, campo: 'recordatorio_optout', error: $json.resultado } }}"), includeOtherFields: false, options: {} },
    position: [-340, 240]
  },
  output: [{"ok": false, "resultado": "schema_error", "detalle": "el user_id no vale y NO se ha consultado Airtable", "campos": ["user_id"], "corr_id": "215475581167582:52219039912", "campo": "recordatorio_optout", "error": "schema_error"}]
});

const notaGuarda = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    name: 'Nota · la guarda y la fuga',
    parameters: { content: "## LA GUARDA · LA FUGA QUE CIERRA\n\n**NO SE TOCA.** Es la unica pieza de este workflow que la revision del 31/08 ha dejado byte a byte como estaba.\n\n**Medido el 31/08/2026:** `filterByFormula: {UserId} = ''` **no devuelve «nada»** — CASA con las filas que tienen el UserId en blanco, y hoy hay **DOS con PII real** dentro. Un `user_id` vacio no falla: encuentra el expediente de otra persona y le marca el optout.\n\nPor eso la guarda va **antes** de tocar Airtable y **la formula se monta en el nodo de codigo**, no en el nodo de busqueda:\n- `user_id` vacio -> `{ok:false, resultado:'schema_error'}` y no se consulta nada\n- `user_id` con forma rara (`^[A-Za-z0-9:_.@-]{8,200}$`) -> `user_id_forma_invalida`. La whitelist deja fuera la comilla doble y la barra invertida: sin ellas no se puede cerrar la cadena de la formula y colar un `OR()`.\n\n**Segunda red, por si alguien toca esto:** la busqueda va con `limit: 2`, asi que una formula vacia (que en Airtable significa TODAS las filas) devuelve dos y el resolvedor la manda a `multi_match`. Fail-closed por construccion.", width: 620, height: 520, color: 4 },
    position: [-800, 400]
  },
  output: [{}]
});

const notaColumna = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    name: 'Nota · la columna NO existe',
    parameters: { content: "## LA COLUMNA `recordatorio_optout` NO EXISTE · Y ESTE WORKFLOW YA LO DICE\n\nMedido por MCP el 31/08/2026 contra `Empleados` (`tblTWCWu5nQXNOMR1`): **99 columnas, ninguna se llama `recordatorio_optout`**, y **ninguna de las 99 sirve de recambio** (ver la nota verde).\n\n**QUE HACE HOY:** el interruptor de `Resolver la fila` para el recorrido antes del PATCH y contesta\n`{ok:false, resultado:'columna_no_existe', detalle:'crear recordatorio_optout como casilla en Empleados', record_id:'rec...'}`.\n**NO se llama a la API de escritura**, asi que ya no hay 422 crudo de Airtable en el log. El `record_id` viene dentro para poder marcar la baja a mano mientras la columna no exista.\n\n**PARA ENCENDERLO, DOS COSAS Y NADA MAS:**\n1. **Crear `recordatorio_optout` en `Empleados` como CASILLA (checkbox).** `Respuesta OK` exige ver `recordatorio_optout === true` en la respuesta del PATCH: si se crea de otro tipo, contesta `persistencia_fallida`. Es a proposito.\n2. **Poner `COLUMNA_EXISTE = true`** en el nodo `Resolver la fila` (esta en la linea 12, justo debajo de `const COLUMNA`). Es el unico interruptor.\n\n## LO QUE **NO** HAY QUE HACER, Y ES LO IMPORTANTE\n\n**Esta columna NO entra en los CINCO SITIOS de un campo nuevo** (tool, validador, mapeo del Upser, prompt, lector). Los cinco sitios son el camino de `guardar_datos_cliente`, y esta baja **no va por ahi**: la escribe este subworkflow con su propio PATCH.\n\n**Y por tanto NO hay que tocar el SEXTO SITIO: no se refresca la lista de campos de `Airtable Upser Expediente`.** Ese refresco puede **reactivar campos quitados a proposito**, y un campo reactivado se escribe VACIO en cada llamada del bot: le borraria al fiscal sus comentarios o los ficheros ya generados. El mapeo bueno son las 57 lineas de `docs/upser-campos-mapeados-2026-08-26.txt` y **se queda en 57**.", width: 620, height: 640, color: 3 },
    position: [-160, 400]
  },
  output: [{}]
});

const notaPorQueNoOtra = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    name: 'Nota · por que ninguna columna viva sirve',
    parameters: { content: "## POR QUE NO SE REUSA UNA DE LAS 99 COLUMNAS QUE YA HAY\n\nSe busco una antes de decidir crear columna. **Medido el 31/08/2026.**\n\n**QUIEN CONSUME EL DATO:** `WP-225` define la vista `Leads potenciales` como\n`lead_potencial=true AND Descarte vacio AND recordatorio_optout=false`. El consumidor es un **filtro de vista**, o sea que el campo tiene que ser **filtrable y booleano**. Eso descarta de entrada cualquier columna de texto libre.\n\n**LOS 12 CHECKBOX DE LA TABLA ESTAN LOS 12 OCUPADOS**, y **CUATRO de ellos son el disparador de una automatizacion desplegada** que le **MANDA UN CORREO AL CLIENTE** al ponerse en `true`:\n`EnviarBorradores` -> «1. Envio borradores 030 y 149» · `CrearCheckout` -> «Crear Check out» · `Enviarformulario030149` -> «3. Envio email formularios» · `EnviarModelosPresentados` -> «3. Envio documentos presentados». Registrar «no me contacteis» marcando una casilla que **manda un correo** es el peor resultado posible de todo este WP.\nLos otros ocho son hechos declarados del cliente (`AplicaBeckham`, `alta_ss`, `ConyugeQuiereAcogerse`), botones de reproceso que n8n desmarca solo (`RegenerarInforme`, `Regenerar030`), una bandera de error (`Checkout Error`), el disparador del informe (`InformeListo`) y **`lead_potencial`, que significa LO CONTRARIO** (quiere que le avisen).\n\n**LOS OTROS CANDIDATOS, UNO A UNO:**\n- `Descarte` (singleSelect) — **aparece en el MISMO filtro de WP-225 como una condicion DISTINTA**: usarlo para la baja fusiona dos condiciones independientes y la vista deja de poder escribirse. Y `Decidir_Status` sube cualquier `Descarte` a «14. Descartado», el ultimo peldano: la baja quedaria como descarte fiscal para siempre.\n- `MotivoCierre` (singleSelect) — es el disparador de `¿Cerrar conversacion?` (un `notEmpty`): escribirlo CIERRA el hilo de Intercom.\n- `ResumenBot` — cada envio SUSTITUYE al anterior y es la base del informe que se manda al cliente.\n- `Comentarios adicionales` (multilineText) — el unico sin dueno y sin descripcion, y **no esta en el mapeo del Upser** (comprobado: las 57 lineas no lo llevan). Pero es texto libre: **no se puede filtrar por `=false`**, y un PATCH SUSTITUYE la celda, asi que borraria lo que un fiscal hubiera escrito ahi.\n\n**Y LO QUE HACE BARATO CREAR LA COLUMNA:** de las nueve automatizaciones de la base, la unica con disparador de tabla entera es «1. Envio mensaje agendar llamada», y es `recordCreated` — **un PATCH no crea fila**. Las otras seis con condiciones miran columnas concretas. Una columna **nueva** no esta en ninguna condicion de ningun disparador: **crearla y escribir solo ella no dispara nada.**", width: 760, height: 700, color: 5 },
    position: [480, 400]
  },
  output: [{}]
});

const notaPatch = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    name: 'Nota · por que un PATCH',
    parameters: { content: "## POR QUE UN PATCH POR HTTP Y NO EL NODO DE AIRTABLE\n\n**El 26/08 se aprendio que un nodo de Airtable que ESCRIBE guarda su propia copia del schema** en `parameters.columns.schema[]`, valida contra ella antes de llamar a la API, y **al refrescarla en la UI puede reactivar campos que estaban quitados a proposito** — que entonces se escriben VACIOS en cada llamada.\n\nEste workflow tiene que tocar **exclusivamente** `recordatorio_optout`. Un `PATCH` con un body de **un solo campo** no puede hacer eso ni por accidente, y ademas no necesita que la columna exista en ningun cache. Sin `typecast`: una casilla acepta `true` tal cual.\n\n**El nodo de busqueda si es el de Airtable**, y es seguro: los de `operation=search` **no llevan `columns.schema`**. Va con la whitelist `fields: ['UserId']` para no arrastrar 99 columnas de PII al log de ejecuciones. **A proposito NO lee `recordatorio_optout`**: hoy pedirlo seria un 422 en la LECTURA, y cuando exista tampoco diria nada util, porque Airtable omite las celdas vacias y una casilla sin marcar se lee igual que una que no existe.\n\n**Las dos credenciales se eligen A MANO** (`Airtable Mobility_2026` en los dos nodos). Por MCP salen vacias SIEMPRE, tambien en los nodos que funcionan: la unica forma de comprobar una credencial es EJECUTAR el workflow.\n\n**EL ENUM DE `resultado`, los OCHO:** `optout_registrado` · `columna_no_existe` · `sin_fila` · `multi_match` · `lectura_fallida` · `persistencia_fallida` · `schema_error` · `user_id_forma_invalida`. Su puerta es `docs/test-registrar-optout.js`.", width: 620, height: 560, color: 6 },
    position: [1280, 400]
  },
  output: [{}]
});

export default workflow('beckham-registrar-optout', 'BECKHAM_registrar_optout', {
  settings: { errorWorkflow: 'BJfExmwu1fI1aPpY', executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: true, saveExecutionProgress: true, executionTimeout: 120 }
})
  .add(entrada)
  .to(guarda)
  .to(siGuarda
    .onTrue(buscar.to(resolver.to(siFila
      .onTrue(patch.to(respOk))
      .onFalse(respNoEscrita))))
    .onFalse(respGuarda))
  .add(buscar.onError(respLectura))
  .add(patch.onError(respPersistencia))
  .add(notaGuarda)
  .add(notaColumna)
  .add(notaPorQueNoOtra)
  .add(notaPatch);
