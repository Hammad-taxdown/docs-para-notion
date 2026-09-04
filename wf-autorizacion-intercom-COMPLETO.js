import { workflow, node, trigger, sticky, newCredential, ifElse, expr } from '@n8n/workflow-sdk';

const llamada = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.1,
  config: {
    name: 'Llamada_desde_el_bot',
    position: [0, 300],
    parameters: {
      inputSource: 'workflowInputs',
      workflowInputs: { values: [
        { name: 'user_id', type: 'string' },
        { name: 'conversation_id', type: 'string' },
        { name: 'idioma', type: 'string' }
      ] }
    }
  },
  output: [{ user_id: '68b1c2d3e4f5a6b7c8d9e0f1', conversation_id: '215475755624195', idioma: 'es' }]
});

const buscar = node({
  type: 'n8n-nodes-base.airtable',
  version: 2.2,
  config: {
    name: 'Buscar_Expediente',
    position: [240, 300],
    alwaysOutputData: true,
    parameters: {
      resource: 'record',
      operation: 'search',
      base: { __rl: true, mode: 'id', value: 'app5K8OnSObqwWweS' },
      table: { __rl: true, mode: 'id', value: 'tblTWCWu5nQXNOMR1' },
      filterByFormula: expr("{{ ($json.user_id || '').trim() ? \"{UserId} = '\" + $json.user_id.replaceAll(\"'\", \"\") + \"'\" : \"FALSE()\" }}"),
      returnAll: false,
      limit: 1,
      options: {}
    },
    credentials: { airtableTokenApi: newCredential('Airtable') }
  },
  output: [{ id: 'recmx3MpupPdctmkB', 'Nombre completo': 'Jorge Botija', NIF: '78757480Y', Idioma: 'Español' }]
});

const preparar = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Preparar_la_autorizacion',
    position: [480, 300],
    parameters: { mode: 'runOnceForEachItem', language: 'javaScript', jsCode: "// Nodo «Preparar_la_autorizacion» de mobility_autorizacion_intercom · 04/09/2026.\n// MODO DEL NODO: Run Once for Each Item.\n//\n// Es la version TOOL del «Preparar la autorizacion» de mobility_autorizacion_prerrellenada\n// (C3lKxKwi1bRyokf7, el del fiscal, que va por reloj cada 15 min). Este lo llama el agente\n// conversacional en el paso de la autorizacion, y decide UNA de tres cosas:\n//   - error:    falta la fila, el NIF o el nombre -> el agente lee el motivo y no promete nada.\n//   - reenviar: la fila YA tiene AutorizacionPrerrellenada -> se manda esa, sin regenerar.\n//   - generar:  se monta el PDF desde la plantilla de Google Docs y se sube a Airtable.\n// En los dos ultimos casos el PDF viaja a Intercom como attachment_files (base64) de una\n// respuesta de admin: dentro del chat, sin enlace que caduque.\n//\n// LAS PLANTILLAS ESTAN DUPLICADAS AQUI Y EN EL WORKFLOW DEL FISCAL. Si se cambia una, cambiar\n// las dos (misma trampa que el script ingles de Airtable, que existe dos veces).\n// Regla de la casa (01/09/2026): el dato que tenemos se imprime y el que NO tenemos no aparece.\n\nconst PLANTILLAS = {\n    ES: \"1xs51w9aVU79sXeyWDicMcWq8zAezc39XfNtwKQ0XrqU\",\n    EN: \"PON_AQUI_EL_ID_DE_LA_PLANTILLA_EN\"\n};\n\n// En nodos de codigo SIEMPRE .first(), nunca .item (cuelga el task runner).\nconst llamada = $('Llamada_desde_el_bot').first().json || {};\nconst bruto = $input.item.json || {};\nconst r = bruto.fields ? { ...bruto.fields, id: bruto.id } : bruto;\nconst txt = v => (v && typeof v === \"object\" && v.name !== undefined) ? v.name : v;\nconst s = clave => String(txt(r[clave]) || \"\").trim();\n\nconst conversationId = String(llamada.conversation_id || \"\").trim();\nconst idFila = r.id || r.recordId;\n\nconst para = motivo => ({ json: { error: motivo, modo: \"error\", recordId: idFila || \"\", conversation_id: conversationId } });\n\nif (!conversationId) return para(\"No me ha llegado el conversation_id: no se a que conversacion mandar la autorizacion.\");\nif (!idFila) return para(\"No encuentro el expediente de este cliente en Airtable. Guarda primero su nombre y su NIF con guardar_datos_cliente y vuelve a intentarlo.\");\n\nconst nombre = s(\"Nombre completo\") ||\n               [s(\"Nombre empleado\"), s(\"Apellidos empleado\")].filter(Boolean).join(\" \");\nconst nif = s(\"NIF\");\n\nif (!nombre) return para(\"Falta el nombre del empleado en el expediente. Guardalo con guardar_datos_cliente y vuelve a intentarlo.\");\nif (!nif) return para(\"Falta el NIF/NIE en el expediente. Sin NIF la autorizacion no sirve ante la AEAT: pideselo, guardalo y vuelve a intentarlo. Un pasaporte NO vale.\");\n\n// Idioma: manda el de la conversacion (lo pasa el agente). Si no llega, el de la fila.\n// \"Ingles\" es el caso EXPLICITO y todo lo demas, incluido el vacio, sale en espanol.\nconst idiomaLlamada = String(llamada.idioma || \"\").trim().toLowerCase();\nlet idioma;\nif (idiomaLlamada.startsWith(\"en\") || idiomaLlamada === \"ingles\" || idiomaLlamada === \"inglés\") idioma = \"EN\";\nelse if (idiomaLlamada.startsWith(\"es\") || idiomaLlamada === \"castellano\") idioma = \"ES\";\nelse idioma = s(\"Idioma\").toLowerCase() === \"ingles\" ? \"EN\" : \"ES\";\n\nconst MENSAJE = {\n    ES: \"📎 Aquí tienes la autorización para que TaxDown actúe en tu nombre ante la AEAT, ya rellena con tus datos. Solo tienes que firmarla y adjuntarla aquí, en este mismo chat.\",\n    EN: \"📎 Here is the authorisation for TaxDown to act on your behalf before the Spanish Tax Agency (AEAT), already filled in with your details. You only need to sign it and attach it here, in this same chat.\"\n};\n\n// YA EXISTE: la fila trae la autorizacion (la genero el fiscal por reloj, o este mismo\n// workflow en un turno anterior). Se reenvia tal cual, sin tocar Airtable ni Drive.\nconst adj = Array.isArray(r.AutorizacionPrerrellenada) ? r.AutorizacionPrerrellenada : [];\nif (adj.length && adj[0] && adj[0].url) {\n    return { json: {\n        error: \"\", modo: \"reenviar\", recordId: idFila, conversation_id: conversationId, idioma: idioma,\n        urlExistente: adj[0].url,\n        nombreFichero: adj[0].filename || (\"Autorizacion-AEAT-\" + nif + \".pdf\"),\n        mensaje_intercom: MENSAJE[idioma],\n        _plantillaDeReserva: \"\"\n    } };\n}\n\n// Mientras no exista la plantilla EN se cae a la ES: parar dejaria al cliente ingles sin documento.\nconst sinConfigurar = v => !v || String(v).indexOf(\"PON_AQUI\") === 0;\nlet plantilla = PLANTILLAS[idioma];\nlet idiomaUsado = idioma;\nif (sinConfigurar(plantilla)) { plantilla = PLANTILLAS.ES; idiomaUsado = \"ES\"; }\nif (sinConfigurar(plantilla)) return para(\"No hay ninguna plantilla de autorizacion configurada en el nodo.\");\n\n// La provincia NO tiene columna: son los dos primeros digitos del CP. Sin CP no se inventa.\nconst PROVINCIAS = {\n    \"01\": \"Araba/Alava\", \"02\": \"Albacete\", \"03\": \"Alicante\", \"04\": \"Almeria\",\n    \"05\": \"Avila\", \"06\": \"Badajoz\", \"07\": \"Illes Balears\", \"08\": \"Barcelona\",\n    \"09\": \"Burgos\", \"10\": \"Caceres\", \"11\": \"Cadiz\", \"12\": \"Castellon\",\n    \"13\": \"Ciudad Real\", \"14\": \"Cordoba\", \"15\": \"A Coruna\", \"16\": \"Cuenca\",\n    \"17\": \"Girona\", \"18\": \"Granada\", \"19\": \"Guadalajara\", \"20\": \"Gipuzkoa\",\n    \"21\": \"Huelva\", \"22\": \"Huesca\", \"23\": \"Jaen\", \"24\": \"Leon\", \"25\": \"Lleida\",\n    \"26\": \"La Rioja\", \"27\": \"Lugo\", \"28\": \"Madrid\", \"29\": \"Malaga\", \"30\": \"Murcia\",\n    \"31\": \"Navarra\", \"32\": \"Ourense\", \"33\": \"Asturias\", \"34\": \"Palencia\",\n    \"35\": \"Las Palmas\", \"36\": \"Pontevedra\", \"37\": \"Salamanca\",\n    \"38\": \"Santa Cruz de Tenerife\", \"39\": \"Cantabria\", \"40\": \"Segovia\",\n    \"41\": \"Sevilla\", \"42\": \"Soria\", \"43\": \"Tarragona\", \"44\": \"Teruel\",\n    \"45\": \"Toledo\", \"46\": \"Valencia\", \"47\": \"Valladolid\", \"48\": \"Bizkaia\",\n    \"49\": \"Zamora\", \"50\": \"Zaragoza\", \"51\": \"Ceuta\", \"52\": \"Melilla\"\n};\n\nconst cp = s(\"Codigo Postal\");\nconst municipio = s(\"MunicipioResidencia\");\nconst provincia = PROVINCIAS[cp.slice(0, 2)] || \"\";\n\nlet tipoVia = s(\"Tipo de vía / Type of road\");\nconst calle = s(\"Nombre de la calle / Name of street\");\nif (tipoVia) {\n    tipoVia = tipoVia.charAt(0) + tipoVia.slice(1).toLowerCase();\n    if (calle.toLowerCase().indexOf(tipoVia.toLowerCase()) === 0) tipoVia = \"\";\n}\nconst via = [tipoVia, calle].filter(Boolean).join(\" \");\n\nconst numero = [\n    s(\"Número de tu domicilio / House Number\") ? \"nº \" + s(\"Número de tu domicilio / House Number\") : \"\",\n    s(\"Planta\") ? \"planta \" + s(\"Planta\") : \"\",\n    s(\"Puerta\") ? \"puerta \" + s(\"Puerta\") : \"\"\n].filter(Boolean).join(\", \");\n\nconst linea1 = [via, numero].filter(Boolean).join(\", \");\nlet linea2 = [cp, municipio].filter(Boolean).join(\" \");\nif (provincia && provincia.toLowerCase() !== municipio.toLowerCase()) {\n    linea2 = [linea2, provincia].filter(Boolean).join(\", \");\n}\nconst domicilio = [linea1, linea2].filter(Boolean).join(\" - \");\n\n// La ETIQUETA va DENTRO del marcador: Google Docs no puede borrar un parrafo, asi que sin\n// domicilio el marcador va vacio y la linea desaparece entera. Separador \": \" y NO tabulador.\nconst etiquetaDomicilio = idiomaUsado === \"EN\" ? \"ADDRESS FOR NOTIFICATIONS\" : \"DOMICILIO A EFECTOS DE NOTIFICACIONES\";\nconst bloqueDomicilio = domicilio ? etiquetaDomicilio + \": \" + domicilio : \"\";\n\n// EN HORA DE MADRID: los nodos corren en UTC y un envio a las 00:30 caeria en el dia anterior.\nconst hoyMadrid = new Intl.DateTimeFormat(\"en-CA\", {\n    timeZone: \"Europe/Madrid\", year: \"numeric\", month: \"2-digit\", day: \"2-digit\"\n}).format(new Date());\nconst partes = hoyMadrid.split(\"-\").map(Number);\nconst anio = partes[0], mes = partes[1], dia = partes[2];\nconst MESES_ES = [\"enero\", \"febrero\", \"marzo\", \"abril\", \"mayo\", \"junio\", \"julio\", \"agosto\", \"septiembre\", \"octubre\", \"noviembre\", \"diciembre\"];\nconst MESES_EN = [\"January\", \"February\", \"March\", \"April\", \"May\", \"June\", \"July\", \"August\", \"September\", \"October\", \"November\", \"December\"];\n\n// Sin municipio la linea arranca por la fecha, en vez de dejar un \"En ____\" colgando.\nlet lugarFecha;\nif (idiomaUsado === \"EN\") {\n    const f = dia + \" \" + MESES_EN[mes - 1] + \" \" + anio;\n    lugarFecha = municipio ? \"In \" + municipio + \", on \" + f : \"On \" + f;\n} else {\n    const f = dia + \" de \" + MESES_ES[mes - 1] + \" de \" + anio;\n    lugarFecha = municipio ? \"En \" + municipio + \", a \" + f : \"A \" + f;\n}\n\nreturn { json: {\n    error: \"\", modo: \"generar\", recordId: idFila, conversation_id: conversationId,\n    plantilla: plantilla, idioma: idiomaUsado, _idiomaPedido: idioma,\n    _plantillaDeReserva: idiomaUsado === idioma ? \"\" : \"OJO: cliente \" + idioma + \" con plantilla ES (falta la plantilla EN en el nodo)\",\n    nombreFichero: \"Autorizacion-AEAT-\" + nif + \".pdf\",\n    mensaje_intercom: MENSAJE[idioma],\n    urlExistente: \"\",\n    m_NombreCompleto: nombre, m_NIF: nif, m_BloqueDomicilio: bloqueDomicilio, m_LugarFecha: lugarFecha,\n    _sinDomicilio: domicilio ? \"\" : \"OJO: sin domicilio, esa linea no sale\"\n} };\n" }
  },
  output: [{ error: '', modo: 'generar', recordId: 'recmx3MpupPdctmkB', plantilla: '1xs51w9aVU79sXeyWDicMcWq8zAezc39XfNtwKQ0XrqU', idioma: 'ES', nombreFichero: 'Autorizacion-AEAT-78757480Y.pdf', mensaje_intercom: 'Aqui tienes tu autorizacion', urlExistente: '', m_NombreCompleto: 'Jorge Botija', m_NIF: '78757480Y', m_BloqueDomicilio: '', m_LugarFecha: 'A 4 de septiembre de 2026' }]
});

const hayError = ifElse({
  version: 2.3,
  config: {
    name: 'Hay_error?',
    position: [720, 300],
    parameters: { conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
      conditions: [{ leftValue: expr('{{ $json.error }}'), rightValue: '', operator: { type: 'string', operation: 'notEmpty', singleValue: true } }] } }
  }
});

const devolverError = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Devolver_Error',
    position: [960, 120],
    parameters: { mode: 'raw', jsonOutput: expr('{{ JSON.stringify({ ok: false, enviado: false, error: $json.error }) }}'), options: {} }
  },
  output: [{ ok: false, enviado: false, error: 'Falta el NIF.' }]
});

const yaExiste = ifElse({
  version: 2.3,
  config: {
    name: 'Ya_existe?',
    position: [960, 400],
    parameters: { conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
      conditions: [{ leftValue: expr('{{ $json.modo }}'), rightValue: 'reenviar', operator: { type: 'string', operation: 'equals' } }] } }
  }
});

const descargarExistente = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Descargar_la_existente',
    position: [1200, 240],
    parameters: { method: 'GET', url: expr('{{ $json.urlExistente }}'), options: { response: { response: { responseFormat: 'file', outputPropertyName: 'data' } } } }
  },
  output: [{ data: 'binary' }]
});

const ficheroBase64 = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Fichero_a_base64',
    position: [1440, 240],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Recorre los items UNO A UNO con su indice. El fallo del 02/09/2026 fue usar\n// getBinaryDataBuffer(0, ...) con el 0 fijo: en una pasada con varias filas TODAS\n// recibian el fichero de la primera, y el nombre salia bien, asi que no se veia.\n// pairedItem mantiene el emparejamiento para los nodos de detras.\n// MODO DEL NODO: Run Once for All Items. Es el MISMO codigo en Fichero_a_base64 y en Documento_a_base64.\nconst entrada = $input.all();\nconst salida = [];\nfor (let i = 0; i < entrada.length; i++) {\n    const buffer = await this.helpers.getBinaryDataBuffer(i, 'data');\n    if (!buffer || !buffer.length) {\n        throw new Error('El documento del elemento ' + i + ' ha llegado vacio.');\n    }\n    salida.push({\n        json: { base64: buffer.toString('base64'), bytes: buffer.length },\n        pairedItem: { item: i }\n    });\n}\nreturn salida;\n" }
  },
  output: [{ base64: 'JVBERi0x', bytes: 56270 }]
});

const copiar = node({
  type: 'n8n-nodes-base.googleDrive',
  version: 3,
  config: {
    name: 'Copiar_la_plantilla',
    position: [1200, 560],
    parameters: {
      resource: 'file', operation: 'copy',
      fileId: { __rl: true, mode: 'id', value: expr('{{ $json.plantilla }}') },
      name: expr('Autorizacion AEAT - {{ $json.m_NombreCompleto }}'),
      sameFolder: false,
      driveId: { __rl: true, mode: 'list', value: 'My Drive' },
      folderId: { __rl: true, mode: 'id', value: '1ulqDSw-xLlst2UBNq0E8td11GDprUcq1' },
      options: {}
    },
    credentials: { googleDriveOAuth2Api: newCredential('Google Drive') }
  },
  output: [{ id: '1AbCdEf', name: 'Autorizacion AEAT - Jorge Botija' }]
});

const rellenar = node({
  type: 'n8n-nodes-base.googleDocs',
  version: 2,
  config: {
    name: 'Rellenar_los_huecos',
    position: [1440, 560],
    parameters: {
      resource: 'document', operation: 'update',
      documentURL: expr('{{ $json.id }}'),
      actionsUi: { actionFields: [
        { object: 'text', action: 'replaceAll', text: '{{NombreCompleto}}', replaceText: expr("{{ $('Preparar_la_autorizacion').item.json.m_NombreCompleto }}"), matchCase: true },
        { object: 'text', action: 'replaceAll', text: '{{NIF}}', replaceText: expr("{{ $('Preparar_la_autorizacion').item.json.m_NIF }}"), matchCase: true },
        { object: 'text', action: 'replaceAll', text: '{{BloqueDomicilio}}', replaceText: expr("{{ $('Preparar_la_autorizacion').item.json.m_BloqueDomicilio }}"), matchCase: true },
        { object: 'text', action: 'replaceAll', text: '{{LugarFecha}}', replaceText: expr("{{ $('Preparar_la_autorizacion').item.json.m_LugarFecha }}"), matchCase: true }
      ] }
    },
    credentials: { googleDocsOAuth2Api: newCredential('Google Docs') }
  },
  output: [{ documentId: '1AbCdEf' }]
});

const descargarPdf = node({
  type: 'n8n-nodes-base.googleDrive',
  version: 3,
  config: {
    name: 'Descargar_como_PDF',
    position: [1680, 560],
    parameters: {
      resource: 'file', operation: 'download',
      fileId: { __rl: true, mode: 'id', value: expr("{{ $('Copiar_la_plantilla').item.json.id }}") },
      options: { binaryPropertyName: 'data', googleFileConversion: { conversion: { docsToFormat: 'application/pdf' } }, fileName: expr("{{ $('Preparar_la_autorizacion').item.json.nombreFichero }}") }
    },
    credentials: { googleDriveOAuth2Api: newCredential('Google Drive') }
  },
  output: [{ id: '1AbCdEf', name: 'Autorizacion-AEAT-78757480Y.pdf' }]
});

const documentoBase64 = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Documento_a_base64',
    position: [1920, 560],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Recorre los items UNO A UNO con su indice. El fallo del 02/09/2026 fue usar\n// getBinaryDataBuffer(0, ...) con el 0 fijo: en una pasada con varias filas TODAS\n// recibian el fichero de la primera, y el nombre salia bien, asi que no se veia.\n// pairedItem mantiene el emparejamiento para los nodos de detras.\n// MODO DEL NODO: Run Once for All Items. Es el MISMO codigo en Fichero_a_base64 y en Documento_a_base64.\nconst entrada = $input.all();\nconst salida = [];\nfor (let i = 0; i < entrada.length; i++) {\n    const buffer = await this.helpers.getBinaryDataBuffer(i, 'data');\n    if (!buffer || !buffer.length) {\n        throw new Error('El documento del elemento ' + i + ' ha llegado vacio.');\n    }\n    salida.push({\n        json: { base64: buffer.toString('base64'), bytes: buffer.length },\n        pairedItem: { item: i }\n    });\n}\nreturn salida;\n" }
  },
  output: [{ base64: 'JVBERi0x', bytes: 56270 }]
});

const subirAirtable = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Subir_la_autorizacion_a_Airtable',
    position: [2160, 560],
    parameters: {
      method: 'POST',
      url: expr("https://content.airtable.com/v0/app5K8OnSObqwWweS/{{ $('Preparar_la_autorizacion').item.json.recordId }}/fld4hba7Ri7viPOc0/uploadAttachment"),
      authentication: 'predefinedCredentialType', nodeCredentialType: 'airtableTokenApi',
      sendBody: true, specifyBody: 'json',
      jsonBody: expr("{{ JSON.stringify({ contentType: 'application/pdf', filename: $('Preparar_la_autorizacion').item.json.nombreFichero, file: $json.base64 }) }}"),
      options: {}
    }
  },
  output: [{ id: 'recmx3MpupPdctmkB' }]
});

const recuperarBase64 = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Recuperar_base64',
    position: [2400, 560],
    parameters: { mode: 'raw', jsonOutput: expr("{{ JSON.stringify({ base64: $('Documento_a_base64').item.json.base64, bytes: $('Documento_a_base64').item.json.bytes, regenerado: true }) }}"), options: {} }
  },
  output: [{ base64: 'JVBERi0x', bytes: 56270, regenerado: true }]
});

const enviarIntercom = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Enviar_a_Intercom',
    position: [2640, 400],
    parameters: {
      method: 'POST',
      url: expr("https://api.intercom.io/conversations/{{ $('Llamada_desde_el_bot').item.json.conversation_id }}/reply"),
      authentication: 'predefinedCredentialType', nodeCredentialType: 'intercomApi',
      sendBody: true, specifyBody: 'json',
      jsonBody: expr("{{ JSON.stringify({ message_type: 'comment', type: 'admin', admin_id: '4418209', body: $('Preparar_la_autorizacion').item.json.mensaje_intercom, attachment_files: [{ content_type: 'application/pdf', data: $json.base64, name: $('Preparar_la_autorizacion').item.json.nombreFichero }] }) }}"),
      options: {}
    }
  },
  output: [{ type: 'conversation', id: '215475755624195' }]
});

const devolverOk = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Devolver_OK',
    position: [2880, 400],
    parameters: { mode: 'raw', jsonOutput: expr("{{ JSON.stringify({ ok: true, enviado: true, fichero: $('Preparar_la_autorizacion').item.json.nombreFichero, regenerado: $('Preparar_la_autorizacion').item.json.modo === 'generar', aviso: $('Preparar_la_autorizacion').item.json._plantillaDeReserva || '' }) }}"), options: {} }
  },
  output: [{ ok: true, enviado: true, fichero: 'Autorizacion-AEAT-78757480Y.pdf', regenerado: true, aviso: '' }]
});

export default workflow('mobility_autorizacion_intercom', 'mobility_autorizacion_intercom')
  .add(sticky("## mobility_autorizacion_intercom · la tool `enviar_autorizacion` del agente (04/09/2026)\n\nLa llama el AI Agent de beckham_bot_conversacional en el paso de la AUTORIZACION DE TAXDOWN, en\nvez de darle al cliente el enlace al .docx generico. Manda a la conversacion de Intercom el PDF\nde la autorizacion YA RELLENO con nombre, NIF, domicilio y lugar/fecha: el cliente solo firma.\n\n### Como decide\n1. Busca la fila por UserId. Sin fila, sin nombre o sin NIF -> devuelve `ok:false` con el motivo\n   y el agente lo lee. Un pasaporte NO vale (decision del 03/09: sin NIF/NIE no se avanza).\n2. Si la fila YA tiene AutorizacionPrerrellenada (la hizo el fiscal por reloj, o esta tool en un\n   turno anterior) -> la reenvia tal cual. No regenera.\n3. Si no -> copia la plantilla de Google Docs, rellena los 4 huecos, la baja como PDF, la sube a\n   AutorizacionPrerrellenada y la manda a Intercom.\n\n### Como viaja a Intercom\nRespuesta de ADMIN (admin_id 4418209, el mismo que Responder_Intercom) con `attachment_files`\nen base64. Es una respuesta aparte, con su frase; el agente NO repite el enlace ni adjunta nada.\nNUNCA un enlace de Airtable: sus URLs caducan el mismo dia.\n\n### Es un DUPLICADO del workflow del fiscal (mobility_autorizacion_prerrellenada, C3lKxKwi1bRyokf7)\nMismas plantillas, mismo texto, mismo domicilio. Si se cambia una plantilla o un marcador,\ncambiarlo EN LOS DOS. La plantilla EN sigue sin configurar en los dos: un cliente ingles recibe el\ndocumento en espanol con el mensaje en ingles, y la tool lo avisa en `aviso`.\n\n### Consecuencia sobre el circuito del fiscal\nComo escribe en la MISMA columna, cuando el fiscal marque Enviarformulario030149 el workflow por\nreloj vera la columna llena y no regenerara: el correo del formulario saldra con el PDF que se\ngenero en el chat (fecha del dia del chat).\n\n### Credenciales\nCada reescritura por API borra las credenciales. Un cambio pequeno se hace A MANO en la UI.\n", [llamada, buscar, preparar], { color: 4 }))
  .add(llamada)
  .to(buscar)
  .to(preparar)
  .to(hayError
    .onTrue(devolverError)
    .onFalse(yaExiste
      .onTrue(descargarExistente.to(ficheroBase64.to(enviarIntercom.to(devolverOk))))
      .onFalse(copiar.to(rellenar.to(descargarPdf.to(documentoBase64.to(subirAirtable.to(recuperarBase64.to(enviarIntercom)))))))));
