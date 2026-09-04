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
    parameters: { mode: 'runOnceForEachItem', language: 'javaScript', jsCode: '__PREPARAR__' }
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
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: '__BASE64__' }
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
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: '__BASE64__' }
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
  .add(sticky('__STICKY__', [llamada, buscar, preparar], { color: 4 }))
  .add(llamada)
  .to(buscar)
  .to(preparar)
  .to(hayError
    .onTrue(devolverError)
    .onFalse(yaExiste
      .onTrue(descargarExistente.to(ficheroBase64.to(enviarIntercom.to(devolverOk))))
      .onFalse(copiar.to(rellenar.to(descargarPdf.to(documentoBase64.to(subirAirtable.to(recuperarBase64.to(enviarIntercom)))))))));
