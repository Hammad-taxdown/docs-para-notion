// VERIFICADOR DEL NODO DEL .030 CONTRA SUS PIEZAS · 14/08/2026
// ============================================================================
// POR QUE EXISTE. `montar-nodo-030.sh` dice en su cabecera «Regenera
// docs/nodo-montar-030-COMPLETO.js a partir de sus cinco piezas» y NO CONCATENA
// NADA: solo lanza dos pruebas. Encontrado el 14/08. Consecuencia real: los dos
// arreglos de ese dia (la planta de dos caracteres y el '4' de la 1406) hubo que
// aplicarlos A MANO en el fichero fuente Y en el COMPLETO, y nada garantizaba que
// siguieran diciendo lo mismo.
//
// POR QUE VERIFICA Y NO REGENERA. El COMPLETO del .030 ya esta pegado en n8n y
// comprobado byte a byte contra el nodo. Regenerarlo cambiaria el fichero (aunque
// solo fuera un comentario) y obligaria a repegar 198 KB sin ninguna necesidad.
// Asi que este script NO TOCA NADA: solo dice si las piezas y el COMPLETO siguen
// diciendo lo mismo.
//
// COMO COMPARA. Extrae de cada pieza sus declaraciones de primer nivel (function
// X, const X, let X) y comprueba que el MISMO cuerpo aparece dentro del COMPLETO,
// ignorando comentarios y espacios. Lo que este en la pieza y NO en el COMPLETO se
// avisa como DESAJUSTE, no como error: es el caso legitimo de PAIS_PRESENTACION,
// que se anadio el 14/08 para el informe y que el nodo del .030 no necesita.
//
// Se ejecuta con: node docs/verificar-nodo-030.js
const fs = require('fs'), path = require('path');

const PIEZAS = [
  'tabla-paises-iso2-2026-08-13.js',
  'tabla-provincias-030-2026-08-13.js',
  'tabla-municipios-ine-2026-08-14.js',
  'generador-030-2026-08-14.js',
  'nodo-030-glue-2026-08-14.js',
];
const COMPLETO = 'nodo-montar-030-COMPLETO.js';

// Quita comentarios de linea y de bloque, y aplasta los espacios. Lo que queda es
// la LOGICA: asi un comentario nuevo en una pieza no da un falso desajuste.
function soloLogica(t) {
  const fuera = [];
  for (const linea of t.split('\n')) {
    // El `//` dentro de una cadena no es un comentario, pero en estas piezas no
    // hay ninguno: se comprueba y se avisa si aparece.
    fuera.push(/'\/\/|"\/\//.test(linea) ? linea : linea.replace(/\/\/.*$/, ''));
  }
  return fuera.join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
}

// Declaraciones de primer nivel: las que empiezan en la columna 0.
function declaraciones(t) {
  const lineas = t.split('\n');
  const fuera = [];
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/);
    if (!m) continue;
    // Se acumula hasta que las llaves, los corchetes y los parentesis cierran.
    let prof = 0, trozo = [], cerrado = false;
    for (let j = i; j < lineas.length; j++) {
      trozo.push(lineas[j]);
      for (const ch of lineas[j]) {
        if ('{[('.includes(ch)) prof++;
        else if ('}])'.includes(ch)) prof--;
      }
      if (prof <= 0 && /[;}]\s*$/.test(lineas[j])) { cerrado = true; break; }
      if (j - i > 4000) break;                 // guarda: nada mide tanto
    }
    if (cerrado) fuera.push({ nombre: m[1], linea: i + 1, cuerpo: trozo.join('\n') });
  }
  return fuera;
}

const dir = __dirname;
const completo = fs.readFileSync(path.join(dir, COMPLETO), 'utf8');
const logicaCompleto = soloLogica(completo);

let errores = 0, desajustes = 0, iguales = 0;
console.log('── Cada declaracion de cada pieza, buscada dentro del COMPLETO ──\n');

for (const p of PIEZAS) {
  const ruta = path.join(dir, p);
  if (!fs.existsSync(ruta)) { console.log('FALTA  ' + p); errores++; continue; }
  const src = fs.readFileSync(ruta, 'utf8');
  const decls = declaraciones(src).filter((d) => d.nombre !== 'module');
  const fuera = [];
  let dentro = 0;
  for (const d of decls) {
    if (logicaCompleto.includes(soloLogica(d.cuerpo))) dentro++;
    else fuera.push(d.nombre + ' (linea ' + d.linea + ')');
  }
  iguales += dentro;
  if (fuera.length === 0) {
    console.log('OK     ' + p.padEnd(38) + dentro + ' de ' + decls.length + ' declaraciones idénticas');
  } else {
    desajustes += fuera.length;
    console.log('AVISO  ' + p.padEnd(38) + dentro + ' de ' + decls.length +
                ' idénticas · ' + fuera.length + ' NO están en el COMPLETO');
    for (const f of fuera) console.log('           ' + f);
  }
}

console.log('\n── Lo que el COMPLETO no puede llevar ──');
for (const prohibido of ['require(', 'module.exports', 'process.exit', 'readFileSync']) {
  let n = 0;
  for (const l of completo.split('\n')) if (l.replace(/\/\/.*$/, '').includes(prohibido)) n++;
  console.log((n === 0 ? 'OK     ' : 'FALLA  ') + prohibido.padEnd(20) + n + ' veces en código');
  if (n) errores++;
}

console.log('\n' + iguales + ' declaraciones idénticas · ' + desajustes + ' desajustes · ' +
            errores + ' errores');
if (desajustes) {
  console.log('\nUN DESAJUSTE NO ES SIEMPRE UN FALLO. Lo esperado el 14/08 es que');
  console.log('tabla-paises-iso2 tenga PAIS_PRESENTACION, paisPresentacion,');
  console.log('PAIS_PRESENTACION_EN y paisPresentacionEn, que se anadieron para el INFORME');
  console.log('y que el nodo del .030 NO necesita. Cualquier otro nombre en esta lista');
  console.log('significa que la pieza y el nodo se han separado: mirar por que.');
}
process.exit(errores ? 1 : 0);
