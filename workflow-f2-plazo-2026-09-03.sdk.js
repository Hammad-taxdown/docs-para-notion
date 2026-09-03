import { workflow, node, trigger, ifElse, newCredential, expr } from '@n8n/workflow-sdk';

const entrada = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: { name: 'Webhook', parameters: { httpMethod: 'POST', path: 'b3c76655-b298-4f5e-9772-48d301f6d925', responseMode: 'responseNode', options: {} }, position: [0, 0] },
  output: [{ body: { fecha_alta_ss: '23/04/2026', user_id: 'eu-west-1:0000' } }]
});

const calcular = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Calcular el plazo', parameters: { mode: 'runOnceForAllItems', jsCode: "const body = $json.body || $json;\nlet raw = body.fecha_alta_ss;\nraw = (raw === null || raw === undefined) ? '' : raw.toString().trim();\n// 03/09 \u00b7 el identificador del cliente viaja con la fecha para poder escribir la fecha\n// limite en su contacto de Intercom (atributo fecha_limite_bot). Es OPCIONAL: si no\n// llega, el calculo es exactamente el de siempre y no se escribe nada.\nconst user_id = (body.user_id === null || body.user_id === undefined) ? '' : body.user_id.toString().trim();\nlet d=null,m=null,y=null;\nif (/^\\d{9,13}$/.test(raw)) { let ts=+raw; if(raw.length<=10) ts*=1000; const f=new Date(ts); if(!isNaN(f)){ y=f.getUTCFullYear(); m=f.getUTCMonth()+1; d=f.getUTCDate(); } }\nif (d===null){ const iso=raw.match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})/); if(iso){ y=+iso[1]; m=+iso[2]; d=+iso[3]; } }\nif (d===null){ const mm=raw.match(/(\\d{1,2})[\\/.\\-](\\d{1,2})[\\/.\\-](\\d{2,4})/); if(mm){ d=+mm[1]; m=+mm[2]; y=+mm[3]; if(y<100) y+=2000; } }\nif (d===null){ const meses={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12,january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12}; const t=raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); const dm=t.match(/(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:de|of)?\\s*([a-z]+)\\s*(?:de|of)?\\s*,?\\s*(\\d{4})/); if(dm&&meses[dm[2]]){ d=+dm[1]; m=meses[dm[2]]; y=+dm[3]; } }\nlet veredicto='no_valida', fecha_alta_norm=null, fecha_alta_ddmmaaaa=null, fecha_limite=null, fecha_limite_iso=null, dias_pasados=null;\nif (d&&m&&y){\n  const fecha=new Date(Date.UTC(y,m-1,d));\n  if(!isNaN(fecha)&&fecha.getUTCDate()===d&&(fecha.getUTCMonth()+1)===m){\n    const p=function(n){return String(n).padStart(2,'0');};\n    fecha_alta_norm=fecha.toISOString().slice(0,10);\n    fecha_alta_ddmmaaaa=p(d)+'/'+p(m)+'/'+y;\n    const limite=new Date(fecha); limite.setUTCMonth(limite.getUTCMonth()+6);\n    fecha_limite_iso=limite.toISOString().slice(0,10);\n    fecha_limite=p(limite.getUTCDate())+'/'+p(limite.getUTCMonth()+1)+'/'+limite.getUTCFullYear();\n    const hoy=new Date(); hoy.setUTCHours(0,0,0,0);\n    if(limite>=hoy){ veredicto='en_plazo'; dias_pasados=0; }\n    else { veredicto='fuera_plazo'; dias_pasados=Math.floor((hoy-limite)/86400000); }\n  }\n}\nreturn [{ json:{ veredicto, fecha_alta_norm, fecha_alta_ddmmaaaa, fecha_limite, fecha_limite_iso, dias_pasados, user_id } }];" }, position: [224, 0] },
  output: [{ veredicto: 'en_plazo', fecha_alta_norm: '2026-04-23', fecha_alta_ddmmaaaa: '23/04/2026', fecha_limite: '23/10/2026', fecha_limite_iso: '2026-10-23', dias_pasados: 0, user_id: 'eu-west-1:0000' }]
});

const responder = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond to Webhook', parameters: { options: {} }, position: [448, 0] },
  output: [{ veredicto: 'en_plazo', fecha_limite: '23/10/2026', user_id: 'eu-west-1:0000' }]
});

const hayUserId = ifElse({
  version: 2.3,
  config: {
    name: 'Hay user_id y fecha limite?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        combinator: 'and',
        conditions: [
          { id: 'c1', leftValue: "={{ $('Calcular el plazo').item.json.user_id }}", rightValue: '', operator: { type: 'string', operation: 'notEmpty', singleValue: true } },
          { id: 'c2', leftValue: "={{ $('Calcular el plazo').item.json.fecha_limite }}", rightValue: '', operator: { type: 'string', operation: 'notEmpty', singleValue: true } }
        ]
      },
      options: {}
    },
    position: [672, 0]
  }
});

const buscarContacto = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Buscar el contacto en Intercom',
    parameters: {
      method: 'POST',
      url: 'https://api.intercom.io/contacts/search',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'intercomApi',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Intercom-Version', value: '2.11' }, { name: 'Accept', value: 'application/json' }] },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: "={{ JSON.stringify({ query: { field: 'external_id', operator: '=', value: $('Calcular el plazo').item.json.user_id } }) }}",
      options: {}
    },
    credentials: { intercomApi: newCredential('Intercom') },
    onError: 'continueRegularOutput',
    position: [896, -96]
  },
  output: [{ total_count: 1, data: [{ id: '66f0c0ffee', external_id: 'eu-west-1:0000' }] }]
});

const encontrado = ifElse({
  version: 2.3,
  config: {
    name: 'Contacto encontrado?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        combinator: 'and',
        conditions: [
          { id: 'c3', leftValue: '={{ $json.total_count }}', rightValue: 0, operator: { type: 'number', operation: 'gt' } }
        ]
      },
      options: {}
    },
    position: [1120, -96]
  }
});

const escribirFechaLimite = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Escribir fecha_limite_bot en el contacto',
    parameters: {
      method: 'PUT',
      url: '=https://api.intercom.io/contacts/{{ $json.data[0].id }}',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'intercomApi',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Intercom-Version', value: '2.11' }, { name: 'Accept', value: 'application/json' }] },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: "={{ JSON.stringify({ custom_attributes: { fecha_limite_bot: $('Calcular el plazo').item.json.fecha_limite } }) }}",
      options: {}
    },
    credentials: { intercomApi: newCredential('Intercom') },
    onError: 'continueRegularOutput',
    position: [1344, -192]
  },
  output: [{ id: '66f0c0ffee', custom_attributes: { fecha_limite_bot: '23/10/2026' } }]
});

export default workflow('wdOOF0ecCkgFOUjt', 'beckham_f2_plazo.')
  .add(entrada)
  .to(calcular)
  .to(responder)
  .to(hayUserId.onTrue(buscarContacto.to(encontrado.onTrue(escribirFechaLimite))));
