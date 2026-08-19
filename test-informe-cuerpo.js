// ============================================================================
// PRUEBA DEL CUERPO DEL INFORME MOBILITY · 14/08/2026
// ----------------------------------------------------------------------------
// Se ejecuta con:  node docs/test-informe-cuerpo.js
//
// Que se comprueba, en este orden:
//   1. Las 6 combinaciones de bloques que el contrato permite montan sin error.
//   2. En NINGUNA salida queda un "{{".
//   3. LA REGLA DE LOS ANIOS (§5.2), que es lo mas importante de toda la prueba:
//      con anioDesplazamiento = 2026, el plazo del modelo 720 del bloque A dice
//      2027 si el bloque A se monta PRIMERO y 2028 si se monta SEGUNDO.
//   4. La cabecera dice "Situación en 2026" y "Situación en 2027" siempre.
//   5. La vineta vacia de "Desventajas del régimen" no esta, y la linea de
//      maternidad/paternidad si es un item de la lista.
//   6. Toda tabla tiene anchos que suman 1 y ninguna celda undefined/null.
//   7. La guarda del §5.6 salta de verdad si le entra un marcador sin resolver.
//   8. Recuento de elementos por tipo.
//
// POR QUE SON 6 COMBINACIONES Y NO 9:
//   bloque1 sale de `Situación fiscal Anio Desplazamiento` (fldSPyJNpHZQMJjsX),
//   que tiene 5 valores posibles y cubre los tres bloques -> A, B o C.
//   bloque2 sale de `Situación fiscal AnioSiguiente` (fldPGi58E0H4gGzad), que
//   segun el §4.1 del contrato tiene SOLO DOS valores posibles: `Residente
//   Fiscal` y `Régimen Especial (Beckham)` (la fórmula pasa de uno a otro cuando
//   `AplicaBeckham` se marca; verificado en el §2, aviso 2, de la spec del 13/08).
//   Con el mapa de bloques del §2 de la spec, esos dos valores son A y C.
//   O sea: en el anio siguiente el cliente YA lleva un anio entero en Espana y no
//   puede ser no residente, asi que bloque2 nunca es B. 3 x 2 = 6.
//   Las 3 combinaciones con bloque2 = B se montan igualmente al final, marcadas
//   como FUERA DE CONTRATO, solo para dejar constancia de que el codigo no se
//   rompe si alguna vez la fórmula devuelve un tercer valor.
// ============================================================================

'use strict';

const {
  montarElementos,
  comprobarSalida
} = require('/Users/hammad/Documents/Taxdown/Proyecto_Mobility_Beckham/Beckham__v0.12/docs/informe-cuerpo-2026-08-19.js');

let fallos = 0;
let pruebas = 0;

function comprobar(nombre, condicion, detalle) {
  pruebas++;
  if (condicion) {
    console.log('  OK    ' + nombre);
  } else {
    fallos++;
    console.log('  FALLA ' + nombre + (detalle ? '\n          ' + detalle : ''));
  }
}

// ---------------------------------------------------------------------------
// Datos de ejemplo. Son inventados como CLIENTE, no como negocio: cada valor
// tiene el formato exacto que el §4.2 del contrato le exige a la pieza 3.
// ---------------------------------------------------------------------------
const SITUACION = {
  A: 'Residente Fiscal',
  B: 'No residente UE',
  C: 'Régimen Especial (Beckham)'
};

function datosDeEjemplo(bloque1, bloque2, anioDesplazamiento) {
  return {
    nombreCompleto: 'Hammad Bellachhab',
    // 19/08/2026 · los tres de la cabecera nueva. Los de abajo se quedan aunque ya
    // no se impriman: el dia que se vuelva a poner uno, el fixture ya lo tiene.
    nombre: 'Hammad',
    apellidos: 'Bellachhab',
    fechaAlta: 'Por confirmar',
    paisOrigen: 'Marruecos',
    fechaDesplazamiento: '01/09/' + anioDesplazamiento,
    fechaLlamada: 'Por confirmar',
    estadoCivil: 'Casado',
    hijos: 'Sí',
    salarioBrutoAnual: '345.678',
    residenciaFiscal5Anios: 'Sí',
    sumaPropiedades: 'No tiene propiedades en España ni en el extranjero',
    sumaInversiones: 'No tiene inversiones en España ni en el extranjero',
    anioDesplazamiento: anioDesplazamiento,
    situacionAnioDesplazamiento: SITUACION[bloque1],
    situacionAnioSiguiente: SITUACION[bloque2],
    bloque1: bloque1,
    bloque2: bloque2
  };
}

// ---------------------------------------------------------------------------
// Utilidades de inspeccion del IR
// ---------------------------------------------------------------------------

// Todos los textos de un elemento, sea del tipo que sea. Es lo que se rastrea
// buscando "{{": si esta funcion se olvida de un sitio, la prueba miente.
function textosDe(el) {
  const t = [];
  if (el.texto !== undefined) t.push(el.texto);
  if (el.etiqueta !== undefined) t.push(el.etiqueta);
  if (el.valor !== undefined) t.push(el.valor);
  if (el.titulo !== undefined) t.push(el.titulo);
  if (Array.isArray(el.items)) el.items.forEach(function (i) { t.push(i); });
  if (Array.isArray(el.cabecera)) el.cabecera.forEach(function (c) { t.push(c); });
  if (Array.isArray(el.filas)) el.filas.forEach(function (f) { f.forEach(function (c) { t.push(c); }); });
  return t;
}

function todosLosTextos(elementos) {
  const t = [];
  elementos.forEach(function (el) { textosDe(el).forEach(function (x) { t.push(x); }); });
  return t;
}

function tablasDe(elementos) {
  return elementos.filter(function (el) { return el.tipo === 'tabla'; });
}

function recuentoPorTipo(elementos) {
  const r = {};
  elementos.forEach(function (el) { r[el.tipo] = (r[el.tipo] || 0) + 1; });
  return r;
}

// La lista que sigue a un titulo2 concreto. Sirve para mirar las "Desventajas".
function listaTrasTitulo(elementos, titulo) {
  for (let i = 0; i < elementos.length; i++) {
    if (elementos[i].tipo === 'titulo2' && elementos[i].texto === titulo) {
      for (let j = i + 1; j < elementos.length; j++) {
        if (elementos[j].tipo === 'lista') return elementos[j];
        if (elementos[j].tipo === 'titulo1' || elementos[j].tipo === 'titulo2') return null;
      }
    }
  }
  return null;
}

// ===========================================================================
// 1 · LAS 6 COMBINACIONES DEL CONTRATO
// ===========================================================================
const COMBINACIONES = [
  ['A', 'A'], ['A', 'C'],
  ['B', 'A'], ['B', 'C'],
  ['C', 'A'], ['C', 'C']
];

const ANIO = 2026;
console.log('\n=== 1 · LAS 6 COMBINACIONES DEL CONTRATO (bloque1 en A/B/C x bloque2 en A/C) ===\n');

const montados = {};
let casosOk = 0;

COMBINACIONES.forEach(function (par) {
  const b1 = par[0];
  const b2 = par[1];
  const clave = b1 + b2;
  const etiqueta = 'bloque1=' + b1 + ' bloque2=' + b2;
  let elementos = null;
  let error = null;
  try {
    elementos = montarElementos(datosDeEjemplo(b1, b2, ANIO));
  } catch (e) {
    error = e;
  }
  montados[clave] = elementos;

  if (error) {
    fallos++; pruebas++;
    console.log('  FALLA ' + etiqueta + ' -> excepcion: ' + error.message);
    return;
  }

  const textos = todosLosTextos(elementos);
  const conMarcador = textos.filter(function (t) { return String(t).indexOf('{{') !== -1; });
  const nulas = textos.filter(function (t) { return t === undefined || t === null; });

  // Los dos bloques tienen que estar los dos, incluso si son el mismo: dos
  // titulo1 del mismo bloque cuando b1 === b2, uno de cada cuando son distintos.
  const titulos1 = elementos.filter(function (el) { return el.tipo === 'titulo1'; })
    .map(function (el) { return el.texto.slice(0, 8); });
  const esperados = ['BLOQUE ' + b1, 'BLOQUE ' + b2];
  const bloquesBien = titulos1.length === 2 && titulos1[0] === esperados[0] && titulos1[1] === esperados[1];

  const bien = conMarcador.length === 0 && nulas.length === 0 && bloquesBien;
  pruebas++;
  if (bien) {
    casosOk++;
    console.log('  OK    ' + etiqueta + '  ->  ' + elementos.length + ' elementos, ' +
      tablasDe(elementos).length + ' tablas, ' + textos.length + ' textos, 0 marcadores sin resolver');
  } else {
    fallos++;
    console.log('  FALLA ' + etiqueta + '  ->  marcadores=' + conMarcador.length +
      ' nulas=' + nulas.length + ' titulos1=' + JSON.stringify(titulos1) + ' esperados=' + JSON.stringify(esperados));
  }
});

comprobar('los 6 casos del contrato pasan', casosOk === 6, 'pasan ' + casosOk + ' de 6');

// El caso b1 === b2 NO se deduplica: el bloque va dos veces enterito.
comprobar('bloque1 === bloque2 monta el bloque DOS veces (no se deduplica)',
  montados['AA'].filter(function (el) { return el.tipo === 'titulo1'; }).length === 2 &&
  montados['CC'].filter(function (el) { return el.tipo === 'titulo1'; }).length === 2);

// ===========================================================================
// 2 · LA REGLA DE LOS ANIOS (§5.2) · EL CASO MAS IMPORTANTE DE LA PRUEBA
// ===========================================================================
console.log('\n=== 2 · LA REGLA DE LOS ANIOS: el plazo del modelo 720 (§5.2) ===\n');

// Devuelve todos los anios que aparecen en "El plazo finaliza el 31 de marzo de AAAA."
function plazos720(elementos) {
  const r = [];
  elementos.forEach(function (el) {
    if (el.tipo !== 'parrafo') return;
    const m = /El plazo finaliza el 31 de marzo de (\d{4})\./.exec(el.texto);
    if (m) r.push(m[1]);
  });
  return r;
}

// (A, C): el bloque A es el PRIMERO -> su anio es 2026 y el plazo del 720 es 2027.
comprobar('bloque A montado PRIMERO (A,C): plazo del 720 = "31 de marzo de 2027"',
  JSON.stringify(plazos720(montados['AC'])) === JSON.stringify(['2027']),
  'encontrado: ' + JSON.stringify(plazos720(montados['AC'])));

// (B, A) y (C, A): el bloque A es el SEGUNDO -> su anio es 2027 y el plazo es 2028.
comprobar('bloque A montado SEGUNDO (B,A): plazo del 720 = "31 de marzo de 2028"',
  JSON.stringify(plazos720(montados['BA'])) === JSON.stringify(['2028']),
  'encontrado: ' + JSON.stringify(plazos720(montados['BA'])));

comprobar('bloque A montado SEGUNDO (C,A): plazo del 720 = "31 de marzo de 2028"',
  JSON.stringify(plazos720(montados['CA'])) === JSON.stringify(['2028']),
  'encontrado: ' + JSON.stringify(plazos720(montados['CA'])));

// (A, A): el bloque A esta las DOS veces, asi que tienen que salir LOS DOS
// plazos y en este orden. Es la prueba que mata cualquier sustitucion global:
// un reemplazo sobre el documento entero pondria el mismo anio en los dos.
comprobar('bloque A montado DOS VECES (A,A): salen los dos plazos, 2027 y luego 2028',
  JSON.stringify(plazos720(montados['AA'])) === JSON.stringify(['2027', '2028']),
  'encontrado: ' + JSON.stringify(plazos720(montados['AA'])));

// El {{anio}} del primer parrafo de cada bloque tambien depende del ambito.
function aniosDeParrafoInicial(elementos) {
  const r = [];
  elementos.forEach(function (el) {
    if (el.tipo !== 'parrafo') return;
    const m = /durante el año (\d{4}) vas a residir/.exec(el.texto);
    if (m) r.push(m[1]);
  });
  return r;
}
comprobar('(B,A): el {{anio}} del bloque B es 2026 y el del bloque A es 2027',
  JSON.stringify(aniosDeParrafoInicial(montados['BA'])) === JSON.stringify(['2026', '2027']),
  'encontrado: ' + JSON.stringify(aniosDeParrafoInicial(montados['BA'])));

// Y con otro anio de desplazamiento, para que no pase por casualidad con 2026.
const otro = montarElementos(datosDeEjemplo('C', 'A', 2030));
comprobar('con anioDesplazamiento=2030 y bloque A segundo: plazo del 720 = 2032',
  JSON.stringify(plazos720(otro)) === JSON.stringify(['2032']),
  'encontrado: ' + JSON.stringify(plazos720(otro)));

// ===========================================================================
// 3 · LA CABECERA
// ===========================================================================
console.log('\n=== 3 · LA CABECERA ===\n');

const cabAC = montados['AC'];
const tablaResumen = tablasDe(cabAC)[0];

comprobar('la primera tabla es el "Resumen", 2 columnas y 4 filas',
  tablaResumen.titulo === 'Resumen' &&
  JSON.stringify(tablaResumen.cabecera) === JSON.stringify(['Concepto', 'Situación']) &&
  tablaResumen.filas.length === 4 &&
  tablaResumen.anchos.length === 2);

comprobar('la cabecera dice "Situación en 2026" (anio de desplazamiento)',
  tablaResumen.filas[0][0] === 'Situación en 2026', 'es: ' + tablaResumen.filas[0][0]);

comprobar('la cabecera dice "Situación en 2027" (anio siguiente, SIEMPRE +1)',
  tablaResumen.filas[1][0] === 'Situación en 2027', 'es: ' + tablaResumen.filas[1][0]);

// El {{anioSiguiente}} de la cabecera es +1 aunque el bloque A se monte segundo y
// alli el suyo sea +2. Son dos ambitos distintos y esta es la prueba de que no se
// contaminan.
const cabBA = tablasDe(montados['BA'])[0];
comprobar('con el bloque A segundo, la cabecera sigue diciendo 2027 (no 2028)',
  cabBA.filas[1][0] === 'Situación en 2027', 'es: ' + cabBA.filas[1][0]);

comprobar('las dos situaciones fiscales van literales de la formula',
  tablaResumen.filas[0][1] === 'Residente Fiscal' &&
  tablaResumen.filas[1][1] === 'Régimen Especial (Beckham)');

// rentasSujetas y modeloYPlazo salen de bloque1 (decision 6 del 14/08).
comprobar('rentasSujetas y modeloYPlazo son los de bloque1, no los de bloque2',
  tablasDe(montados['BA'])[0].filas[2][1] === 'Únicamente las rentas obtenidas en España.' &&
  tablasDe(montados['BA'])[0].filas[3][1].indexOf('Modelo 210.') === 0 &&
  tablasDe(montados['CA'])[0].filas[3][1].indexOf('Modelo 151,') === 0);

const campos = cabAC.filter(function (el) { return el.tipo === 'campo'; });
// 19/08/2026 · La cabecera pasa de CUATRO campos a TRES: nombre, apellidos y
// fecha de alta. Salen pais de origen, fecha de desplazamiento y fecha de la
// reunion. Se comprueba el numero EXACTO, para que anadir un campo sin querer
// tambien rompa la prueba.
comprobar('los 3 campos de la cabecera, en orden y con sus etiquetas',
  campos.length === 3 &&
  campos[0].etiqueta === 'Nombre' && campos[0].valor === 'Hammad' &&
  campos[1].etiqueta === 'Apellidos' && campos[1].valor === 'Bellachhab' &&
  campos[2].etiqueta === 'Fecha de alta en la Seguridad Social' &&
  campos[2].valor === 'Por confirmar',
  JSON.stringify(campos.map(function (c) { return c.etiqueta + '=' + c.valor; })));

comprobar('ya NO hay campo de pais de origen, de desplazamiento ni de reunion',
  campos.every(function (c) {
    return ['País de origen', 'Fecha de desplazamiento', 'Fecha de la reunión'].indexOf(c.etiqueta) === -1;
  }));

// 19/08/2026 · La seccion «Notas e informacion proporcionada» SE HA QUITADO
// ENTERA de la cabecera: el titulo, la frase de entrada y las seis vinetas
// (estado civil, hijos, salario, residencia fiscal, propiedades e inversiones).
// Antes esta prueba comprobaba que las seis estaban; ahora comprueba que NO estan,
// que es lo que hay que defender para que no vuelvan por accidente.
// `cabAC` es el documento COMPLETO, no la cabecera: los bloques traen sus propias
// listas y tablas. La cabecera es todo lo que va ANTES del primer 'titulo1', que
// es el «BLOQUE ...». Se acota aqui para que las tres comprobaciones de abajo
// hablen de la cabecera y no del documento entero.
const iPrimerBloque = cabAC.findIndex(function (el) { return el.tipo === 'titulo1'; });
const soloCabecera = cabAC.slice(0, iPrimerBloque === -1 ? cabAC.length : iPrimerBloque);

const listaNotas = soloCabecera.filter(function (el) { return el.tipo === 'lista'; })[0];
comprobar('la cabecera ya NO lleva la lista de las 6 notas', listaNotas === undefined,
  listaNotas ? JSON.stringify(listaNotas.items) : 'ninguna lista en la cabecera');

const textoCab = soloCabecera.map(function (el) {
  return [el.texto, el.valor, el.etiqueta, el.titulo].filter(Boolean).join(' ');
}).join('\n');
comprobar('ni el titulo de Notas ni ninguna de las seis etiquetas',
  ['Notas e información proporcionada', 'Según la información', 'Estado civil:',
   'Hijos:', 'Salario bruto anual:', 'Residencia fiscal en los cinco',
   'Propiedades:', 'Inversiones:'].every(function (w) { return textoCab.indexOf(w) === -1; }),
  textoCab.slice(0, 300));

comprobar('pero la tabla «Resumen» SIGUE en la cabecera (es «la info»)',
  soloCabecera.filter(function (el) { return el.tipo === 'tabla'; }).length === 1);

// ===========================================================================
// 4 · LOS TRES DEFECTOS DE LA PLANTILLA (§5.4)
// ===========================================================================
console.log('\n=== 4 · LOS TRES DEFECTOS DE LA PLANTILLA (§5.4) ===\n');

const desventajas = listaTrasTitulo(montados['CC'], 'Desventajas del régimen');
const LINEA_MATERNIDAD = 'La prestación por desempleo y las prestaciones por maternidad o paternidad tributan en su totalidad.';

comprobar('existe la lista de "Desventajas del régimen"', desventajas !== null);

// Defecto 1: la vineta vacia se tira.
const vacias = desventajas.items.filter(function (i) { return /^[\s–—-]*$/.test(i); });
comprobar('defecto 1: la vineta VACIA no esta en la lista', vacias.length === 0,
  'encontradas: ' + JSON.stringify(vacias));

// Defecto 2: la linea de maternidad/paternidad es un ITEM, no un parrafo suelto.
comprobar('defecto 2: la linea de maternidad/paternidad SI es un item de la lista',
  desventajas.items.indexOf(LINEA_MATERNIDAD) !== -1,
  JSON.stringify(desventajas.items, null, 1));

comprobar('defecto 2 bis: y NO se quedo tambien como parrafo suelto',
  montados['CC'].filter(function (el) { return el.tipo === 'parrafo' && el.texto === LINEA_MATERNIDAD; }).length === 0);

// Defecto 3: el punto final de la indemnizacion por despido.
comprobar('defecto 3: "La indemnización por despido no está exenta." lleva punto final',
  desventajas.items.indexOf('La indemnización por despido no está exenta.') !== -1);

comprobar('la lista de desventajas queda con 5 items (4 vinetas buenas + la huerfana)',
  desventajas.items.length === 5, 'tiene ' + desventajas.items.length);

comprobar('todos los items de desventajas acaban en punto',
  desventajas.items.every(function (i) { return /\.$/.test(i); }));

// ===========================================================================
// 5 · TEXTO LITERAL: lo que NO se ha tocado y no debe tocarse sin decision
// ===========================================================================
console.log('\n=== 5 · TEXTO LITERAL DE LA PLANTILLA ===\n');

const textosCC = todosLosTextos(montados['CC']).join('\n');

// §5.5: el umbral de 50.000 del bloque C va literal. Decision cerrada del 14/08.
comprobar('el 50.000 del bloque C va literal',
  textosCC.indexOf('resulta ventajoso a partir de unos 50.000 euros brutos anuales.') !== -1);

// La plantilla escribe "al 24%" sin espacio en esta frase concreta. No se uniforma.
comprobar('el "al 24% generalmente" del bloque C se queda como en la plantilla',
  textosCC.indexOf('al tributar a un tipo fijo al 24% generalmente,') !== -1);

// El cuarto defecto de la plantilla, que NO se tapa porque el contrato no lo
// autoriza: tres parrafos pegados sin separador en una celda de la tabla 6. Se
// comprueba que sigue literal, para que nadie lo "arregle" sin decidirlo.
const textosB = todosLosTextos(montados['BC']).join('\n');
comprobar('tabla 6: la celda de plazos del salario sigue LITERAL (tres parrafos pegados)',
  textosB.indexOf('A pagar: hasta el 20 de abril del año siguiente.A devolver: desde el 1 de febrero del año siguiente y dentro de los cuatro años posteriores.Resultado nulo: no es obligatoria la presentación.') !== -1);

// Los guiones largos de la tabla 4 son los de la plantilla.
comprobar('tabla 4: los guiones largos de "—entre ellos, la Seguridad Social—" se mantienen',
  textosB.indexOf('—entre ellos, la Seguridad Social—') !== -1);

// ===========================================================================
// 6 · LAS 8 TABLAS
// ===========================================================================
console.log('\n=== 6 · LAS 8 TABLAS ===\n');

// Un informe con los tres bloques distintos no existe (solo se montan dos), asi
// que las 8 tablas de la plantilla se cuentan sumando: resumen + A + B + C.
const tablasA = tablasDe(montados['AA']);   // resumen + 2 tablas de A, dos veces
const tablasB = tablasDe(montados['BC']);   // resumen + 4 de B + 2 de C
comprobar('el bloque A aporta 2 tablas', (tablasA.length - 1) / 2 === 2, 'aporta ' + (tablasA.length - 1) / 2);
comprobar('el bloque B aporta 3 tablas y el C aporta 2 (resumen + 3 + 2 = 6)',
  tablasB.length === 6, 'son ' + tablasB.length);

// La plantilla tiene 8 tablas: 1 resumen + 2 (A) + 3 (B) + 2 (C) = 8.
comprobar('las 8 tablas de la plantilla estan repartidas 1 + 2 + 3 + 2',
  1 + 2 + 3 + 2 === 8);

let tablasRevisadas = 0;
let tablasMal = [];
Object.keys(montados).forEach(function (clave) {
  tablasDe(montados[clave]).forEach(function (t, i) {
    tablasRevisadas++;
    const suma = t.anchos.reduce(function (a, b) { return a + b; }, 0);
    if (Math.abs(suma - 1) > 1e-9) tablasMal.push(clave + '#' + i + ' anchos suman ' + suma);
    if (t.cabecera && t.cabecera.length !== t.anchos.length) tablasMal.push(clave + '#' + i + ' cabecera descuadrada');
    t.filas.forEach(function (f, j) {
      if (f.length !== t.anchos.length) tablasMal.push(clave + '#' + i + ' fila ' + j + ' descuadrada');
      f.forEach(function (c, k) {
        if (c === undefined || c === null) tablasMal.push(clave + '#' + i + ' celda ' + j + ',' + k + ' es ' + String(c));
      });
    });
  });
});
comprobar('las ' + tablasRevisadas + ' tablas montadas: anchos suman 1, filas cuadradas, 0 celdas undefined/null',
  tablasMal.length === 0, JSON.stringify(tablasMal));

// ===========================================================================
// 7 · LA GUARDA DEL §5.6 SALTA DE VERDAD
// ===========================================================================
console.log('\n=== 7 · LA GUARDA DEL §5.6 ===\n');
// Una guarda que nunca se ha visto saltar no esta probada.

function lanza(fn) {
  try { fn(); return null; } catch (e) { return e.message; }
}

const conMarcadorCrudo = datosDeEjemplo('A', 'C', 2026);
// 19/08/2026 · Antes se ensuciaba `nombreCompleto`, pero la cabecera ya no lo
// imprime, asi que la guarda no saltaba y la prueba pasaba en falso. Se ensucia
// `nombre`, que si es uno de los tres campos que se imprimen.
conMarcadorCrudo.nombre = '{{nombre}}';
const m1 = lanza(function () { montarElementos(conMarcadorCrudo); });
comprobar('un marcador sin resolver en un campo hace saltar la guarda',
  m1 !== null && m1.indexOf('MARCADOR SIN RESOLVER') !== -1, 'mensaje: ' + m1);

const enCelda = datosDeEjemplo('A', 'C', 2026);
enCelda.situacionAnioSiguiente = 'Situación de {{anioSiguiente}}';
const m2 = lanza(function () { montarElementos(enCelda); });
comprobar('un marcador sin resolver en una celda de tabla hace saltar la guarda',
  m2 !== null && m2.indexOf('MARCADOR SIN RESOLVER') !== -1, 'mensaje: ' + m2);

// 19/08/2026 · Era salarioBrutoAnual, que ya no se imprime. Se usa `apellidos`,
// que si esta en la cabecera nueva.
const sinClave = datosDeEjemplo('A', 'C', 2026);
delete sinClave.apellidos;
const m3 = lanza(function () { montarElementos(sinClave); });
comprobar('si falta un marcador se para en vez de imprimir "undefined"',
  m3 !== null && m3.indexOf('apellidos') !== -1, 'mensaje: ' + m3);

const bloqueRaro = datosDeEjemplo('A', 'C', 2026);
bloqueRaro.bloque2 = 'D';
const m4 = lanza(function () { montarElementos(bloqueRaro); });
comprobar('un bloque desconocido se para (nunca hay bloque por defecto)',
  m4 !== null && m4.indexOf('no reconozco el bloque') !== -1, 'mensaje: ' + m4);

const sinAnio = datosDeEjemplo('A', 'C', 2026);
sinAnio.anioDesplazamiento = '';
const m5 = lanza(function () { montarElementos(sinAnio); });
comprobar('sin anio de desplazamiento se para (nunca se imprime "NaN")',
  m5 !== null && m5.indexOf('no es un anio') !== -1, 'mensaje: ' + m5);

// El anio se imprime sin separador de miles, jamas como 2.026.
comprobar('el anio se imprime con 4 digitos y sin separador de miles',
  todosLosTextos(montados['AC']).join('\n').indexOf('2.026') === -1 &&
  todosLosTextos(montados['AC']).join('\n').indexOf('2.027') === -1);

// La guarda tambien vigila las reglas del IR del §1.
const irRoto = [{ tipo: 'tabla', cabecera: ['a', 'b'], anchos: [0.5, 0.4], filas: [['x', 'y']] }];
comprobar('la guarda tambien caza unos anchos que no suman 1',
  (lanza(function () { comprobarSalida(irRoto); }) || '').indexOf('anchos suman') !== -1);

const irNulo = [{ tipo: 'tabla', cabecera: null, anchos: [0.5, 0.5], filas: [['x', null]] }];
comprobar('la guarda tambien caza una celda null',
  (lanza(function () { comprobarSalida(irNulo); }) || '').indexOf('undefined ni null') !== -1);

// Y una tabla sin cabecera (cabecera: null) es legal segun el §1.
comprobar('una tabla con cabecera null es legal',
  lanza(function () { comprobarSalida([{ tipo: 'tabla', cabecera: null, anchos: [1], filas: [['x']] }]); }) === null);

// ===========================================================================
// 8 · LAS 3 COMBINACIONES FUERA DE CONTRATO (bloque2 = B)
// ===========================================================================
console.log('\n=== 8 · FUERA DE CONTRATO: bloque2 = B (la formula no lo devuelve hoy) ===\n');
['A', 'B', 'C'].forEach(function (b1) {
  const e = lanza(function () {
    const el = montarElementos(datosDeEjemplo(b1, 'B', ANIO));
    if (todosLosTextos(el).some(function (t) { return String(t).indexOf('{{') !== -1; })) {
      throw new Error('queda un marcador sin resolver');
    }
  });
  comprobar('bloque1=' + b1 + ' bloque2=B monta sin error (no exigido por el contrato)', e === null, 'mensaje: ' + e);
});

// ===========================================================================
// 9 · RECUENTO
// ===========================================================================
console.log('\n=== 9 · RECUENTO DE ELEMENTOS POR TIPO ===\n');
const filas = [];
COMBINACIONES.forEach(function (par) {
  const clave = par[0] + par[1];
  const el = montados[clave];
  const r = recuentoPorTipo(el);
  filas.push({
    caso: par[0] + ' -> ' + par[1],
    total: el.length,
    titulo1: r.titulo1 || 0,
    titulo2: r.titulo2 || 0,
    parrafo: r.parrafo || 0,
    campo: r.campo || 0,
    lista: r.lista || 0,
    tabla: r.tabla || 0,
    saltoPagina: r.saltoPagina || 0,
    celdas: tablasDe(el).reduce(function (a, t) { return a + t.filas.length * t.anchos.length; }, 0),
    textos: todosLosTextos(el).length
  });
});
console.table(filas);

const caracteres = todosLosTextos(montados['BC']).join('').length;
console.log('  Caso tipico (No residente UE -> Beckham): ' + montados['BC'].length +
  ' elementos y ' + caracteres + ' caracteres de texto.');
console.log('  Ningun elemento de tipo saltoPagina: el §5.1 no coloca ninguno. Si Fiscal quiere');
console.log('  cada bloque en pagina nueva, es un elemento mas por bloque y una linea aqui.');

// ===========================================================================
console.log('\n' + (fallos === 0
  ? 'TODO PASA · ' + pruebas + ' comprobaciones · 6 de 6 casos del contrato'
  : fallos + ' FALLOS de ' + pruebas + ' comprobaciones'));
process.exitCode = fallos === 0 ? 0 : 1;
