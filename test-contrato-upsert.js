// test-contrato-upsert.js — 26/08/2026 · WP-207
//
// LA PUERTA QUE IMPIDE QUE EL CONTRATO SE VUELVA DOCUMENTACION RANCIA.
// No comprueba que el contrato sea bonito: comprueba que sigue siendo VERDAD.
// Lee el JSON Schema y el nodo `Validar y Normalizar` del export, y falla si
// divergen en cualquiera de los dos sentidos:
//   - una clave en el codigo que no esta en el contrato -> el contrato miente por omision
//   - una clave en el contrato que el codigo ya no lee  -> el contrato promete algo muerto
// Los dos son el mismo fallo del proyecto: un documento mio citado como fuente.
//
// node docs/test-contrato-upsert.js
'use strict';
const fs = require('fs'), path = require('path');
const D = __dirname;
let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const comprobar = (cond, s) => cond ? V(s) : X(s);

const schema = JSON.parse(fs.readFileSync(path.join(D, 'contratos/upsert_expediente.v1.json'), 'utf8'));
const wf = JSON.parse(fs.readFileSync(path.join(D, '../proyecto-mobility/workflows-n8n/beckham_bot.json'), 'utf8'));
const nodo = wf.nodes.find(n => n.name === 'Validar y Normalizar');
comprobar(!!nodo, 'el nodo "Validar y Normalizar" sigue existiendo en el export');
if (!nodo) { process.stdout.write('\n  sin nodo no hay nada que comparar\n'); process.exit(1); }
const code = nodo.parameters.jsCode;

// ── 1 · las claves de entrada, en los DOS sentidos ────────────────────────────
const enCodigo = [...new Set((code.match(/body\.([A-Za-z_][A-Za-z0-9_]*)/g) || [])
  .map(s => s.slice(5)))].sort();
const enContrato = Object.keys(schema.properties).sort();

const soloCodigo = enCodigo.filter(k => !enContrato.includes(k));
const soloContrato = enContrato.filter(k => !enCodigo.includes(k));
comprobar(soloCodigo.length === 0,
  'toda clave que el codigo lee esta en el contrato' + (soloCodigo.length ? ' · SOBRAN EN EL CODIGO: ' + soloCodigo.join(', ') : ''));
comprobar(soloContrato.length === 0,
  'toda clave del contrato la sigue leyendo el codigo' + (soloContrato.length ? ' · MUERTAS EN EL CONTRATO: ' + soloContrato.join(', ') : ''));
comprobar(enCodigo.length === 46, 'siguen siendo 46 claves de entrada (hoy: ' + enCodigo.length + ')');

// ── 2 · los cuatro rechazos, ni uno mas ni uno menos ─────────────────────────
const rech = [...new Set((code.match(/rechazar\('([a-z_0-9]+)'/g) || [])
  .map(s => s.slice(10, -1)))].sort();
const rechC = [...schema['x-rechazos'].enum].sort();
comprobar(JSON.stringify(rech) === JSON.stringify(rechC),
  'los rechazos del codigo son exactamente los del contrato · codigo: [' + rech.join(', ') + ']');

// ── 3 · la whitelist de punto, y que DERIVA no cambie sin avisar ─────────────
const puntosC = schema.properties.punto.enum.slice().sort();
const bloque = (code.match(/const DERIVA = \{[\s\S]*?\n\};/) || [''])[0];
comprobar(bloque.length > 0, 'el bloque DERIVA se localiza en el codigo');
const puntosCod = [...new Set((bloque.match(/^\s{2}([a-z_]+):/gm) || [])
  .map(s => s.trim().replace(':', '')))].sort();
comprobar(JSON.stringify(puntosCod) === JSON.stringify(puntosC),
  'los 6 punto del contrato son los 6 de DERIVA · codigo: [' + puntosCod.join(', ') + ']');
for (const p of puntosC) {
  const esperado = schema['x-deriva'][p];
  comprobar(esperado !== undefined, 'x-deriva documenta el punto "' + p + '"');
}
// lead es el unico que enciende lead_potencial: si eso cambia, media Fase 2 cambia
comprobar(/lead:\s*\{[^}]*lead_potencial:\s*true/.test(bloque),
  'el punto "lead" sigue escribiendo lead_potencial=true');
comprobar(/descarte_plazo:\s*\{[^}]*Descarte:\s*'Alta en SS mas de 6 meses'/.test(bloque),
  'el punto "descarte_plazo" sigue escribiendo su Descarte exacto');

// ── 4 · la whitelist de Descarte contra el codigo ────────────────────────────
const desBloque = (code.match(/const DESCARTES = \[[\s\S]*?\];/) || [''])[0];
const desCod = (desBloque.match(/'([^']+)'/g) || []).map(s => s.slice(1, -1)).sort();
const desC = schema.properties.Descarte.enum.slice().sort();
comprobar(JSON.stringify(desCod) === JSON.stringify(desC),
  'las 4 opciones de Descarte del contrato son las del codigo');

// ── 5 · EL SALARIO NUNCA DESCARTA · que el camino siga sin existir ───────────
// Es una decision cerrada (19/08) y su unica defensa real es que la tool NO
// declare el parametro. Si alguien lo anade, esta comprobacion salta.
const tool = wf.nodes.find(n => n.name === 'guardar_datos_cliente');
comprobar(!!tool, 'la tool guardar_datos_cliente sigue existiendo');
const sTool = JSON.stringify(tool ? tool.parameters : {});
comprobar(!/"name"\s*:\s*"Descarte"/.test(sTool),
  'la tool NO declara "Descarte": el LLM no puede descartar a nadie');
comprobar(!/"name"\s*:\s*"punto"/.test(sTool),
  'la tool NO declara "punto": el LLM no puede derivar campos');

// ── 6 · las dos obligatorias, y que nada mas lo sea ──────────────────────────
comprobar(JSON.stringify(schema.required) === JSON.stringify(['user_id', 'intercom_conversation_id']),
  'las obligatorias siguen siendo user_id + intercom_conversation_id');
comprobar(schema.additionalProperties === false,
  'additionalProperties=false · el contrato es cerrado');
// y que la forma del user_id del contrato es la del codigo
const forma = (code.match(/const FORMA_USER_ID = \/(.+?)\/i;/) || [])[1];
comprobar(!!forma && schema.properties.user_id.pattern.replace(/\\\\/g, '\\') === forma,
  'el pattern del user_id es el regex FORMA_USER_ID del codigo');

// ── 7 · las decisiones cerradas que el contrato cita ────────────────────────
comprobar(/toBool\(body\.quiere_acogerse\)/.test(code),
  'quiere_acogerse sigue siendo el unico que marca AplicaBeckham');
comprobar(/T12:00:00\.000Z/.test(code),
  'las fechas siguen saliendo con T12:00:00.000Z (el unico cuadrante que funciona)');
comprobar(/ponerMultiSelect\('SenalesComplejidad'/.test(code),
  'SenalesComplejidad sigue siendo multiSelect (es lo que dispara el peldano 3)');

process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) { process.stdout.write('  el contrato y el nodo vivo se han separado. Uno de los dos miente.\n'); process.exit(1); }
