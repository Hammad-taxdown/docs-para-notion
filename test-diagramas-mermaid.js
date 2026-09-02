// test-diagramas-mermaid.js — 26/08/2026
// Comprueba la sintaxis de los .mmd.md del repo antes de subirlos: que el tipo de
// diagrama sea valido, que todo nodo listado en un `class` exista, que todo classDef
// usado este definido, y que ningun nodo se quede sin color (los subgraph NO cuentan
// como nodos: eso me dio un falso rojo la primera vez).
//   node docs/test-diagramas-mermaid.js
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../proyecto-mobility/assets/diagramas');
let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const c = (b, s) => b ? V(s) : X(s);
const TIPOS = ['flowchart', 'graph', 'sequenceDiagram', 'stateDiagram-v2', 'erDiagram', 'gantt'];

for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.mmd.md')).sort()) {
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  const bloques = [...s.matchAll(/```mermaid\n([\s\S]*?)```/g)].map(m => m[1]);
  c(bloques.length > 0, f + ' · tiene al menos un bloque mermaid (' + bloques.length + ')');
  bloques.forEach((b, i) => {
    const n = f.split('-')[0] + '.d' + (i + 1);
    // el tipo es la primera linea que NO sea comentario (%%) ni este vacia:
    // leer b.split[0] a secas daba un falso rojo en el 07, que abre con un comentario.
    const tipo = (b.split('\n').map(x => x.trim())
      .find(x => x && !x.startsWith('%%')) || '').split(/\s+/)[0];
    c(TIPOS.includes(tipo), n + ' · tipo valido: ' + tipo);
    if (tipo === 'sequenceDiagram') {
      const parts = new Set([...b.matchAll(/participant\s+(\w+)/g)].map(m => m[1]));
      const usados = new Set();
      for (const m of b.matchAll(/^\s*(\w+)\s*-?->>?\s*(\w+):/gm)) { usados.add(m[1]); usados.add(m[2]); }
      for (const m of b.matchAll(/Note over ([\w,\s]+):/g))
        m[1].split(',').forEach(x => usados.add(x.trim()));
      const falta = [...usados].filter(x => !parts.has(x));
      c(falta.length === 0, n + ' · participantes declarados' + (falta.length ? ' · FALTAN: ' + falta : ''));
      return;
    }
    // los subgraph no son nodos
    const sub = new Set([...b.matchAll(/subgraph\s+(\w+)/g)].map(m => m[1]));
    // fuera los comentarios antes de buscar nodos, o un %% con corchetes cuenta como nodo
    b = b.split('\n').filter(x => !x.trim().startsWith('%%')).join('\n');
    const nodos = new Set([...b.matchAll(/(?:^|\s|>)([A-Za-z]\w*)\s*[[{(]/g)]
      .map(m => m[1]).filter(x => !sub.has(x)));
    const defs = new Set([...b.matchAll(/classDef\s+(\w+)/g)].map(m => m[1]));
    const refs = new Set(), usadas = new Set();
    for (const m of b.matchAll(/^\s*class\s+([\w,\s]+?)\s+(\w+)\s*$/gm)) {
      m[1].split(',').forEach(x => x.trim() && refs.add(x.trim())); usadas.add(m[2]);
    }
    const huerf = [...refs].filter(x => !nodos.has(x));
    c(huerf.length === 0, n + ' · los nodos de class existen' + (huerf.length ? ' · NO EXISTEN: ' + huerf : ''));
    const sinDef = [...usadas].filter(x => !defs.has(x));
    c(sinDef.length === 0, n + ' · classDef definidos' + (sinDef.length ? ' · SIN DEFINIR: ' + sinDef : ''));
    const sinColor = [...nodos].filter(x => !refs.has(x));
    c(sinColor.length === 0, n + ' · todos los nodos con color' + (sinColor.length ? ' · SIN COLOR: ' + sinColor : ''));
  });
}

// ── 02/09/2026 · CONTENIDO LITERAL de los diagramas vigentes ─────────────────
// La sintaxis no basta: un diagrama puede parsear y mentir (el 07 dijo «13 peldaños»
// y «beckham_informe_mobility» durante días). Cada fichero vigente tiene que nombrar
// los nodos y workflows con su nombre LITERAL y llevar las cifras medidas del 02/09.
const REQ = {
  '07-escalera-status.mmd.md': ['14 peldaños', '9. Confirmado', '10. Pte modificación', '14. Descartado', 'beckham_informe_mobility_v2', 'Decidir_Status'],
  '08-arquitectura-completa.mmd.md': ['beckham_bot_conversacional', '105 columnas', 'catorce peldaños', '14 · Descartado', '10 · Pte modificacion', 'HISTORIA'],
  '09-agente-conversacional.mmd.md': ['8 claves', 'beckham_informe_mobility_v2', 'Responder_Intercom', 'calcular_plazo', '68939819'],
  '10-vista-sistema.mmd.md': ['beckham_bot_conversacional', 'beckham_generar_030', 'beckham_informe_mobility_v2', 'beckham_f2_plazo.', 'beckham_analizar_documento', 'beckham_alertas', 'beckham_adjuntos_huerfanos', '514525', '68617004', '68939819', '105 columnas', '57', '14 peldaños', 'Status=4, Status=5', '15 min', '2.700 bytes', 'bot_mobility_prompt'],
  '11-turno-conversacion.mmd.md': ['Webhook1', 'Traer_Conversacion_intercom1', 'Formatear_conversacion1', 'Leer_Expediente_Para_Prompt', 'Preparar_Prompt', 'Langsmith Prompt', 'Prompt_De_Respaldo', 'AI Agent', 'Responder_Intercom', 'Leer_MotivoCierre', 'Cerrar_Conversacion', 'Webhook_Upsert_Expediente', 'Validar y Normalizar', 'Decidir_Status', 'Airtable Upser Expediente', 'Webhook_Get_Expediente', '47 claves', '514525'],
  '12-agente-herramientas.mmd.md': ['guardar_datos_cliente', 'leer_expediente', 'calcular_plazo', 'analizar_documento', '40 parámetros', '47 claves', '57 columnas', '82.539', 'Validar y Normalizar', 'Decidir_Status', 'Airtable Upser Expediente', 'Buscar Expediente en Airtable', 'Formatear Respuesta Expediente', '14 peldaños'],
  '13-escalera-status-quien-escribe.mmd.md': ['1. Interesado', '2. Pte agendar llamada', '3. Pendiente llamada TD', '4. Pte hacer informe', '5. Informe enviado', '6. Pte formulario usuario', '7. Pte hacer TD', '8. Pte confirmación usuario', '9. Confirmado', '10. Pte modificación', '11. Finalizado', '12.Pendiente resolución', '13. Concedido', '14. Descartado', 'Status=4 o Status=5', 'Marcar InformeListo', '1. Envio borradores 030 y 149', 'opciones-status-airtable-2026-09-02.txt'],
  '14-generadores.mmd.md': ['Buscar filas pendientes', 'Preparar el informe', 'Se puede montar?', 'Copiar la plantilla', 'Rellenar los huecos', 'Descargar como PDF', 'PDF a base64', 'Vaciar InformePdf', 'Subir el PDF a Airtable', 'Marcar InformeListo', 'Escribir el motivo en ErrorInforme', 'Montar el .030', 'Se ha podido generar?', 'Vaciar Fichero030', 'Subir el fichero a Airtable', 'Limpiar Regenerar030 y Error030', 'Escribir el motivo en Error030', '8 plantillas', '14 huecos', '2.700 bytes', 'ISO-8859-1', '17 datos obligatorios', 'Status=4 o Status=5', '15 min'],
  '15-como-se-hace-un-cambio.mmd.md': ['21 puertas', 'pasos.sh test', 'Cmd+A', 'montar-nodo-030.sh', 'montar-nodo-informe.sh', 'montar-nodo-validar.sh', 'push-cierre.sh', 'proyecto-mobility-2026', 'docs-para-notion', 'pbcopy'],
  '16-antes-despues.mmd.md': ['32 caminos', '46.878', '86.548', '49 nodos', '21 puertas', '2.700 bytes', 'Responder_Intercom', 'calcular_plazo', '57 columnas', '47 claves']
};
// Y lo que los vigentes NO pueden decir: los nombres que ya no existen
const PROHIBIDO = {
  '07-escalera-status.mmd.md': ['13. Descartado', '10. Finalizado', '13 peldaños', 'beckham_informe_mobility<'],
  '10-vista-sistema.mmd.md': ['callback_token', '93 columnas', '55 nodos', '13 peldaños'],
  '13-escalera-status-quien-escribe.mmd.md': ['9. Pte modificación', '10. Confirmado', '13. Descartado'],
  // el 14 nombra 'byte a byte' y '.first()' a proposito, como leccion del 20/08: no se prohiben
  '12-agente-herramientas.mmd.md': ['76.156']
};
for (const f of Object.keys(REQ)) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) { X(f + ' · NO EXISTE'); continue; }
  const s = fs.readFileSync(p, 'utf8');
  const faltan = REQ[f].filter(t => !s.includes(t));
  c(faltan.length === 0, f + ' · lleva los ' + REQ[f].length + ' literales' + (faltan.length ? ' · FALTAN: ' + faltan.join(' | ') : ''));
  const sobran = (PROHIBIDO[f] || []).filter(t => s.includes(t));
  c(sobran.length === 0, f + ' · sin nombres muertos' + (sobran.length ? ' · APARECEN: ' + sobran.join(' | ') : ''));
  const abre = (s.match(/```mermaid/g) || []).length, cierra = (s.match(/```/g) || []).length;
  c(cierra === abre * 2, f + ' · cada bloque mermaid abre y cierra');
  c(/02\/09\/2026|2 de septiembre/.test(s), f + ' · lleva la fecha del estado (02/09/2026)');
}
const leeme = path.join(dir, 'LEEME.md');
c(fs.existsSync(leeme) && /Historia/.test(fs.readFileSync(leeme, 'utf8')), 'LEEME.md de la carpeta separa vigentes de historia');

process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
