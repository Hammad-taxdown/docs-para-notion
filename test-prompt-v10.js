// Puerta del prompt v10 · 19/08/2026
// Comprueba los siete cambios del 19/08 y, sobre todo, que no se haya roto nada
// de lo que ya estaba verificado. Se ejecuta con `node docs/test-prompt-v10.js`.
const fs = require('fs');
const path = require('path');

const V10 = path.join(__dirname, 'prompt-final-2026-08-19-v10.txt');
const V9  = path.join(__dirname, 'prompt-final-2026-08-17-v9.txt');
const p  = fs.readFileSync(V10, 'utf8');
const v9 = fs.readFileSync(V9, 'utf8');

let ok = 0, mal = 0;
const comp = (nombre, condicion, detalle) => {
  if (condicion) { console.log(`verde ${nombre}`); ok++; }
  else { console.log(`ROJO  ${nombre}${detalle ? '\n      ' + detalle : ''}`); mal++; }
};
const cuenta = (s, aguja) => s.split(aguja).length - 1;

// ── 1 · EL UMBRAL pasa de 55.000 a 50.000 ────────────────────────────────────
comp('cero 55.000 en el prompt', !/55\.?000/.test(p),
     'quedan: ' + (p.match(/.*55\.?000.*/g) || []).join(' | '));
comp('aparece el tramo de 50.000', cuenta(p, '50.000') >= 4,
     'apariciones de 50.000: ' + cuenta(p, '50.000'));
comp('el 60.000 sigue siendo el techo del tramo', p.includes('Salario superior a 60.000 € → suele ser favorable'));
comp('el tramo intermedio es 50.000-60.000', p.includes('Entre 50.000 € y 60.000 € → está en el límite'));
comp('por debajo de 50.000 NO descarta, es llamada',
     /Por debajo de 50\.000 €[\s\S]{0,220}NO ES UN DESCARTE/.test(p));
comp('sigue en pie la regla dura EL SALARIO NUNCA DESCARTA', p.includes('EL SALARIO NUNCA DESCARTA'));

// ── 2 · EL 1 DE JULIO sale del ENRUTADO, pero no del calculo fiscal ──────────
const casoClaro   = p.slice(p.indexOf('CASO CLARO'),   p.indexOf('→ Si se cumplen todas'));
const casoComplejo= p.slice(p.indexOf('CASO COMPLEJO'), p.indexOf('Mensaje modelo para el caso complejo'));
comp('CASO CLARO ya no exige llegada anterior al 1 de julio', !casoClaro.includes('1 de julio'),
     casoClaro);
comp('CASO COMPLEJO ya no lista la llegada posterior al 1 de julio', !casoComplejo.includes('1 de julio'));
comp('CASO CLARO conserva sus otros cuatro requisitos',
     ['PF3 = Contrato con una empresa española','Carta o documento de la empresa','Salario en un rango claro','El cónyuge NO se acoge']
       .every(x => casoClaro.includes(x)));
comp('CASO COMPLEJO conserva sus cinco señales restantes',
     ['Vía de acceso distinta','No dispone de la carta','Salario no definido','El cónyuge también quiere acogerse','Declarante foral']
       .every(x => casoComplejo.includes(x)));
comp('la nota del 1 de julio se queda como DATO, no como señal',
     /NO una señal de complejidad: no enrutes a llamada por esto/.test(p));
comp('F1 ya no se justifica por el corte del Bloque 6', !p.includes('el corte del 1 de julio'));

// ── 3 · ESTADO CIVIL a tres opciones ────────────────────────────────────────
comp('PF5a ofrece exactamente soltero, casado o divorciado',
     p.includes('¿Cuál es tu estado civil: soltero, casado o divorciado?'));
comp('PF5b ya solo depende de casado', p.includes('PF5b — (condicional, solo si es casado):'));
comp('la lista cerrada de validacion son tres', p.includes('lista cerrada (soltero · casado · divorciado)'));
{
  // El invariante: «pareja de hecho» y «viudo» solo pueden aparecer en lineas que
  // sean REGLA DE MAPEO («pásalo como…» / «se pasa como…»). En ninguna otra, y
  // sobre todo en ninguna pregunta al cliente.
  const sospechosas = p.split('\n')
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => /pareja de hecho|viud/i.test(l))
    .filter(([, l]) => !/pásalo como|se pasa como/i.test(l));
  comp('«pareja de hecho» y «viudo» solo salen como regla de mapeo',
       sospechosas.length === 0,
       sospechosas.map(([n, l]) => `L${n}: ${l.trim()}`).join('\n      '));
  comp('las dos reglas de mapeo estan escritas',
       /pásalo como casado/.test(p) && /pásalo como soltero/.test(p));
  comp('ninguna pregunta al cliente las ofrece',
       !/¿Cuál es tu estado civil[^\n]*(pareja de hecho|viudo)/i.test(p));
}

// ── 4 · FUERA la pregunta de la fecha de la llamada ─────────────────────────
comp('cero apariciones del parametro fecha_llamada', !p.includes('fecha_llamada'),
     'quedan ' + cuenta(p, 'fecha_llamada'));
comp('se le dice explicitamente que NO la pregunte', /NO PREGUNTES NUNCA LA FECHA DE LA LLAMADA/.test(p));
comp('el v9 si la pedia (o sea que el cambio es real)', v9.includes('fecha_llamada'));

// ── 5, 6, 7 · LOS TRES ENLACES, enteros y una sola vez cada uno ─────────────
const LINKS = {
  'autorización de TaxDown': 'https://cdn.prod.website-files.com/6978bfbe89b459a3e1a62fcf/6a2a765e65fd996c085d2c3a_Autorizacion_Generica.docx',
  'portal de la AEAT':       'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/ZN01.shtml',
  'Calendly (ya estaba)':    'https://calendly.com/d/csbw-2wr-fq4/movilidad-internacional',
};
for (const [nombre, url] of Object.entries(LINKS)) {
  comp(`link ${nombre}: exactamente 1 vez y entero`, cuenta(p, url) === 1,
       'apariciones: ' + cuenta(p, url));
}
comp('el SLA de 24-48 h esta en los dos mensajes al cliente y en la ficha de la AEAT',
     cuenta(p, '24-48') >= 3, 'apariciones: ' + cuenta(p, '24-48'));
comp('ya no se dice «lo antes posible» al recibir la documentacion',
     !p.includes('La revisaremos lo antes posible'));

// ── NO REGRESION · lo que estaba verificado y no se toca ────────────────────
comp('GATE 10/08 · no nombra ninguna tool no cableada', !p.includes('buscar_contexto_fiscal'));
comp('GATE 10/08 · nombra las tres tools reales',
     ['leer_expediente','guardar_datos_cliente','analizar_documento'].every(t => p.includes(t)));
comp('el bloque fiscal del v9 sigue entero (WP-220)',
     p.includes('MODELOS (para tu referencia)') && p.includes('EJEMPLO 1'));
comp('la paternidad sigue tributando (decision cerrada del 17/08)',
     /prestación por paternidad \(y la de maternidad\) de la Seguridad Social SÍ tributa/.test(p));
comp('la salvedad del 720/721 sigue en su sitio', p.includes('Modelos 720 (bienes en el extranjero) ni 721'));
comp('los marcadores de plantilla siguen ahi', p.includes('{contexto}') && p.includes('{current_date}'));
comp('siguen los dos parametros que antes se perdian',
     p.includes('conyuge_quiere_acogerse') && p.includes('discrepancia_fecha_alta'));
comp('sigue la regla de no afirmar lo que no se sabe', p.includes('NO AFIRMES NADA QUE NO SEPAS'));
comp('el tamano es coherente (no se ha truncado)', p.length > v9.length - 500 && p.length < v9.length + 3000,
     `v9=${v9.length} v10=${p.length}`);

const car = (s) => [...s].length;   // puntos de codigo, no unidades UTF-16
console.log(`\n${ok} verdes, ${mal} rojas`);
console.log(`v10 = ${car(p)} caracteres (v9 = ${car(v9)}, ${car(p) - car(v9) >= 0 ? '+' : ''}${car(p) - car(v9)})`);
console.log(`OJO: p.length de JS daria ${p.length} porque cuenta los emoji doble. La cifra buena es la de arriba.`);
process.exit(mal ? 1 : 0);
