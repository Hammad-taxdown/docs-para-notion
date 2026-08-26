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
process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
