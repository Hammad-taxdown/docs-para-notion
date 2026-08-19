// ============================================================================
// PRUEBA DE DATOS Y MARCADORES DEL INFORME MOBILITY · Pieza 3 · 14/08/2026
// ----------------------------------------------------------------------------
// Se ejecuta con:  node docs/test-informe-datos.js
//
// COMO SE CARGA EL CODIGO, y por que no con require():
//   informe-datos llama a paisPresentacion(), que vive en otro fichero y en el
//   nodo de n8n es un global porque las piezas van CONCATENADAS. Con require()
//   la funcion no existiria y la prueba pasaria por el camino de emergencia sin
//   enterarse: 'MARRUECOS' se imprimiria en mayusculas y nadie lo veria.
//   Aqui se montan las tres piezas en un contexto de vm EN EL MISMO ORDEN que
//   el nodo, que es la unica forma de probar de verdad la frontera entre ellas.
//   Es el mismo truco que docs/test-nodo-030.js.
//
// Que se comprueba:
//   1. La fila REAL leida de Airtable hoy, marcador por marcador.
//   2. Los 5 valores de `Situación fiscal Anio Desplazamiento` y los 2 de
//      `Situación fiscal AnioSiguiente`, incluidos los que abortan.
//   3. La formula en error como OBJETO: motivo "en error", NO "desconocido".
//   4. Los acentos y el parentesis de los literales de situacion fiscal.
//   5. Fechas: sin fecha, con hora, basura, y EL 1 DE ENERO EN CUATRO ZONAS
//      HORARIAS DE VERDAD, relanzando este mismo fichero con TZ distinta.
//   6. Salario, nombre, sexo, propiedades, inversiones, pais.
//   7. Que la salida encaja con la pieza 4: montarElementos(datos) monta sin
//      lanzar y sin dejar ningun '{{'. Es la prueba de la frontera.
// ============================================================================

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

// --- Las piezas, en el orden del nodo --------------------------------------
const PIEZAS = [
  'tabla-paises-iso2-2026-08-13.js',   // paisPresentacion()
  'informe-datos-2026-08-19.js',       // lo que se prueba
  'informe-cuerpo-2026-08-19.js'       // solo para la prueba de frontera (7)
];

const codigo = PIEZAS
  .map(function (p) { return fs.readFileSync(path.join(__dirname, p), 'utf8'); })
  .join('\n');

// `module: undefined` para que los pies de los ficheros no hagan nada, igual
// que en el nodo de n8n.
const contexto = vm.createContext({ console: console, module: undefined });
const api = vm.runInContext(
  '(function(){' + codigo + '\n; return { resolverDatos, leerSituacion, partirFecha, formatearFecha,' +
  ' formatearMiles, leerSalario, recapitalizarNombre, estadoCivilConcordado, presentarHijos,' +
  ' presentarPropiedades, presentarPais, esCeldaEnError, montarElementos, PAIS_PRESENTACION }; })()',
  contexto
);

// ---------------------------------------------------------------------------
// LA FILA REAL, leida de Airtable el 14/08/2026. No se toca.
// ---------------------------------------------------------------------------
const FILA_REAL = {
  'Nombre empleado': 'HAMMAD',
  'Apellidos empleado': 'Bellachhab',
  'Nacionalidad': 'MARRUECOS',
  'fechaDesplazamiento': '2026-09-01',
  'estadoCivil': 'casado',
  'Sexo': 'Hombre',
  'hijos': 'No tiene hijos',
  'Salario': 345678,
  'Propiedades': 'No tiene propiedades en España ni el extranjero',
  'Inversiones': 'No tiene inversiones en España ni en el extranjero',
  'Situación fiscal Anio Desplazamiento': 'No residente NO UE',
  'Situación fiscal AnioSiguiente': 'Residente Fiscal'
};

// Copia de la fila real con algunos campos cambiados. `undefined` BORRA la
// clave, para poder simular lo que hace Airtable cuando una celda esta vacia:
// no manda la clave, no manda ''.
function conFila(cambios) {
  const fila = {};
  for (const k in FILA_REAL) fila[k] = FILA_REAL[k];
  for (const k in cambios) {
    if (cambios[k] === undefined) delete fila[k];
    else fila[k] = cambios[k];
  }
  return fila;
}

// ---------------------------------------------------------------------------
// El caso del 1 de enero, aparte, porque se relanza con otra zona horaria.
// ---------------------------------------------------------------------------
// SI ALGUIEN CAMBIA partirFecha() POR new Date(x).getFullYear(), esto falla en
// Pacific/Midway (-11): '2026-01-01' es medianoche UTC, o sea el 31/12/2025 a
// las 13:00 alli, y el informe diria "Situación en 2025".
function casoPrimeroDeEnero() {
  const sinHora = api.resolverDatos(conFila({ 'fechaDesplazamiento': '2026-01-01' }));
  const conHora = api.resolverDatos(conFila({ 'fechaDesplazamiento': '2026-01-01T00:30:00.000Z' }));
  return {
    zona: process.env.TZ || '(la del sistema)',
    sinHoraFecha: sinHora.ok ? sinHora.datos.fechaDesplazamiento : 'ERROR: ' + sinHora.error,
    sinHoraAnio: sinHora.ok ? sinHora.datos.anioDesplazamiento : null,
    sinHoraSiguiente: sinHora.ok ? sinHora.datos.anioSiguiente : null,
    conHoraFecha: conHora.ok ? conHora.datos.fechaDesplazamiento : 'ERROR: ' + conHora.error,
    conHoraAnio: conHora.ok ? conHora.datos.anioDesplazamiento : null
  };
}

// Cuando este fichero se relanza con TZ puesta, solo imprime el resultado del
// 1 de enero y se calla. Lo lee el proceso padre.
if (process.env.PRUEBA_ZONA_HORARIA) {
  process.stdout.write(JSON.stringify(casoPrimeroDeEnero()));
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Contadores
// ---------------------------------------------------------------------------
let pasan = 0;
let fallan = 0;

function comprobar(nombre, condicion, detalle) {
  if (condicion) {
    pasan++;
    console.log('  OK    ' + nombre);
  } else {
    fallan++;
    console.log('  FALLA ' + nombre + (detalle ? '\n          ' + detalle : ''));
  }
}

function igual(nombre, obtenido, esperado) {
  comprobar(nombre, obtenido === esperado,
    'esperaba ' + JSON.stringify(esperado) + ' y ha salido ' + JSON.stringify(obtenido));
}

// Una fila que tiene que PARAR, con el trozo de motivo que se espera dentro.
function para(nombre, fila, trozoEsperado) {
  const r = api.resolverDatos(fila);
  if (r.ok) {
    fallan++;
    console.log('  FALLA ' + nombre + '\n          NO ha parado: ' + JSON.stringify(r.datos));
    return;
  }
  comprobar(nombre + ' -> ' + r.error, r.error.indexOf(trozoEsperado) !== -1,
    'el motivo no contiene ' + JSON.stringify(trozoEsperado));
}

// Una fila que tiene que salir bien, y devuelve los datos para seguir mirando.
function resuelve(nombre, fila) {
  const r = api.resolverDatos(fila);
  if (!r.ok) {
    fallan++;
    console.log('  FALLA ' + nombre + '\n          ha parado: ' + r.error);
    return null;
  }
  pasan++;
  console.log('  OK    ' + nombre);
  return r.datos;
}

// ===========================================================================
console.log('\n1 · LA FILA REAL DE AIRTABLE (14/08/2026)');
// ===========================================================================
const real = resuelve('la fila real resuelve', FILA_REAL);
if (real) {
  igual('   bloque1 (No residente NO UE -> B)', real.bloque1, 'B');
  igual('   bloque2 (Residente Fiscal -> A)', real.bloque2, 'A');
  igual('   nombreCompleto recapitalizado', real.nombreCompleto, 'Hammad Bellachhab');
  igual('   paisOrigen', real.paisOrigen, 'Marruecos');
  igual('   fechaDesplazamiento', real.fechaDesplazamiento, '01/09/2026');
  // 19/08/2026 · la cabecera es nombre + apellidos + fecha de alta. FILA_REAL no
  // lleva fecha_alta_ss, asi que tiene que salir el literal de pendiente y NO abortar.
  igual('   fechaAlta (FILA_REAL no lleva fecha_alta_ss)', real.fechaAlta, 'Por confirmar');
  igual('   nombre suelto, recapitalizado', real.nombre, 'Hammad');
  igual('   apellidos sueltos, recapitalizados', real.apellidos, 'Bellachhab');
  igual('   fechaLlamada YA NO existe como marcador', real.fechaLlamada, undefined);
  igual('   estadoCivil (casado + Hombre)', real.estadoCivil, 'Casado');
  igual('   hijos', real.hijos, 'No');
  igual('   salarioBrutoAnual', real.salarioBrutoAnual, '345.678');
  igual('   residenciaFiscal5Anios (constante)', real.residenciaFiscal5Anios, 'Sí');
  igual('   sumaPropiedades con el «en» corregido', real.sumaPropiedades,
        'No tiene propiedades en España ni en el extranjero');
  igual('   sumaInversiones tal cual', real.sumaInversiones,
        'No tiene inversiones en España ni en el extranjero');
  igual('   anioDesplazamiento', real.anioDesplazamiento, 2026);
  igual('   anioSiguiente', real.anioSiguiente, 2027);
  igual('   situacionAnioDesplazamiento literal', real.situacionAnioDesplazamiento, 'No residente NO UE');
  igual('   situacionAnioSiguiente literal', real.situacionAnioSiguiente, 'Residente Fiscal');
  // La trampa del §4.2: el anio NUNCA lleva separador de miles.
  igual('   anioDesplazamiento sin separador de miles', String(real.anioDesplazamiento), '2026');
  igual('   anioSiguiente sin separador de miles', String(real.anioSiguiente), '2027');
  // Y ningun marcador puede ser null/undefined: el IR lo prohibe (§1).
  const nulos = Object.keys(real).filter(function (k) { return real[k] === null || real[k] === undefined; });
  comprobar('   ningun marcador null ni undefined', nulos.length === 0, 'nulos: ' + nulos.join(', '));
}

// ===========================================================================
console.log('\n2 · LOS 5 VALORES DE `Situación fiscal Anio Desplazamiento`');
// ===========================================================================
const CINCO = [
  ['Residente Fiscal', 'A'],
  ['No residente UE', 'B'],
  ['No residente NO UE', 'B'],   // el que falta en la spec y es la mayoria
  ['Régimen Especial (Beckham)', 'C']
];
CINCO.forEach(function (par) {
  const d = resuelve('"' + par[0] + '" -> bloque ' + par[1],
                     conFila({ 'Situación fiscal Anio Desplazamiento': par[0] }));
  if (d) igual('   bloque1 es ' + par[1], d.bloque1, par[1]);
});
// El quinto valor es la cadena vacia, y NO es un bloque: es un dato que no ha
// llegado. Las dos formas en que Airtable lo entrega tienen que dar lo mismo.
para('vacia como "" -> aborta',
     conFila({ 'Situación fiscal Anio Desplazamiento': '' }), 'está vacía');
para('vacia porque la clave NO VIENE -> aborta',
     conFila({ 'Situación fiscal Anio Desplazamiento': undefined }), 'está vacía');
para('vacia con espacios -> aborta',
     conFila({ 'Situación fiscal Anio Desplazamiento': '   ' }), 'está vacía');
comprobar('el motivo de vacia explica que el dato aun no ha llegado',
  api.resolverDatos(conFila({ 'Situación fiscal Anio Desplazamiento': '' })).error
    .indexOf('el dato aún no ha llegado') !== -1);
comprobar('el motivo de vacia dice CUAL de las dos columnas es',
  api.resolverDatos(conFila({ 'Situación fiscal Anio Desplazamiento': '' })).error
    .indexOf('Situación fiscal Anio Desplazamiento') !== -1);

// ===========================================================================
console.log('\n3 · LOS 2 VALORES DE `Situación fiscal AnioSiguiente`');
// ===========================================================================
[['Residente Fiscal', 'A'], ['Régimen Especial (Beckham)', 'C']].forEach(function (par) {
  const d = resuelve('"' + par[0] + '" -> bloque2 ' + par[1],
                     conFila({ 'Situación fiscal AnioSiguiente': par[0] }));
  if (d) igual('   bloque2 es ' + par[1], d.bloque2, par[1]);
});
para('la segunda vacia -> aborta',
     conFila({ 'Situación fiscal AnioSiguiente': '' }), 'está vacía');
comprobar('y el motivo nombra la SEGUNDA columna, no la primera',
  api.resolverDatos(conFila({ 'Situación fiscal AnioSiguiente': '' })).error
    .indexOf('Situación fiscal AnioSiguiente') !== -1);
// La segunda formula puede devolver 'No residente UE'? Segun el esquema vivo NO,
// pero si algun dia lo hiciera hay que montar el bloque B, no parar.
const d2b = resuelve('si algun dia devolviera "No residente UE" (fuera de contrato)',
                     conFila({ 'Situación fiscal AnioSiguiente': 'No residente UE' }));
if (d2b) igual('   bloque2 seria B', d2b.bloque2, 'B');

// ===========================================================================
console.log('\n4 · FORMULA EN ERROR: VIENE COMO OBJETO, NO COMO TEXTO');
// ===========================================================================
const ERROR_AIRTABLE = { state: 'error', errorType: 'emptyDependency', value: null, isStale: false };
para('primera formula en error -> motivo "en error"',
     conFila({ 'Situación fiscal Anio Desplazamiento': ERROR_AIRTABLE }), 'está en error');
comprobar('   el motivo lleva el errorType dentro',
  api.resolverDatos(conFila({ 'Situación fiscal Anio Desplazamiento': ERROR_AIRTABLE })).error
    .indexOf('emptyDependency') !== -1);
// LA COMPROBACION QUE JUSTIFICA TODA LA FUNCION esCeldaEnError():
comprobar('   NO se cuela como "[object Object]"',
  api.resolverDatos(conFila({ 'Situación fiscal Anio Desplazamiento': ERROR_AIRTABLE })).error
    .indexOf('[object Object]') === -1);
comprobar('   NO se confunde con "no reconozco la situación fiscal"',
  api.resolverDatos(conFila({ 'Situación fiscal Anio Desplazamiento': ERROR_AIRTABLE })).error
    .indexOf('no reconozco') === -1);
para('segunda formula en error -> motivo "en error"',
     conFila({ 'Situación fiscal AnioSiguiente': ERROR_AIRTABLE }), 'está en error');
comprobar('   y nombra la segunda columna',
  api.resolverDatos(conFila({ 'Situación fiscal AnioSiguiente': ERROR_AIRTABLE })).error
    .indexOf('Situación fiscal AnioSiguiente') !== -1);
para('error con otro errorType (el de un campo aiText)',
     conFila({ 'Situación fiscal Anio Desplazamiento': { state: 'error', errorType: 'aiTextFailed' } }),
     'aiTextFailed');
// Un objeto que no es de error tampoco es una situacion fiscal.
para('un objeto cualquiera tampoco pasa por texto',
     conFila({ 'Situación fiscal Anio Desplazamiento': { specialValue: 'NaN' } }),
     'no ha devuelto texto');
comprobar('   y ese motivo tampoco lleva "[object Object]"',
  api.resolverDatos(conFila({ 'Situación fiscal Anio Desplazamiento': { specialValue: 'NaN' } })).error
    .indexOf('[object Object]') === -1);
comprobar('esCeldaEnError() reconoce el objeto de Airtable', api.esCeldaEnError(ERROR_AIRTABLE) === true);
comprobar('esCeldaEnError() no confunde un texto', api.esCeldaEnError('Residente Fiscal') === false);
comprobar('esCeldaEnError() no confunde null', api.esCeldaEnError(null) === false);

// ===========================================================================
console.log('\n5 · VALOR DESCONOCIDO: SE PARA, NUNCA UN BLOQUE POR DEFECTO');
// ===========================================================================
[
  'No residente',                  // a medias
  'Non-resident EU',               // en ingles
  'residente fiscal',              // en minuscula
  'Regimen Especial (Beckham)',    // SIN la tilde de Régimen
  'Régimen Especial [Beckham]',    // con corchetes
  'Régimen Especial Beckham',      // sin parentesis
  'Régimen Especial (Beckham) ',   // con espacio final: este SI se recorta y pasa
  'Beckham'
].forEach(function (valor) {
  const fila = conFila({ 'Situación fiscal Anio Desplazamiento': valor });
  const r = api.resolverDatos(fila);
  if (valor === 'Régimen Especial (Beckham) ') {
    // El trim() es legitimo: recortar espacios no cambia el valor de negocio.
    comprobar('"' + valor + '" (con espacio) -> se recorta y da C', r.ok && r.datos.bloque1 === 'C',
      r.ok ? 'bloque ' + r.datos.bloque1 : r.error);
  } else {
    para('"' + valor + '" -> aborta', fila, 'no reconozco la situación fiscal');
  }
});
comprobar('el motivo de desconocido dice por que se para',
  api.resolverDatos(conFila({ 'Situación fiscal Anio Desplazamiento': 'Marciano' })).error
    .indexOf('no fabricar un dictamen fiscal') !== -1);
comprobar('y lleva el valor crudo entre comillas para poder buscarlo',
  api.resolverDatos(conFila({ 'Situación fiscal Anio Desplazamiento': 'Marciano' })).error
    .indexOf('"Marciano"') !== -1);

// ===========================================================================
console.log('\n6 · LA FECHA DE DESPLAZAMIENTO');
// ===========================================================================
para('sin fecha (clave ausente)', conFila({ 'fechaDesplazamiento': undefined }),
     'falta la fecha de desplazamiento');
para('sin fecha (cadena vacia)', conFila({ 'fechaDesplazamiento': '' }),
     'falta la fecha de desplazamiento');
para('sin fecha (null)', conFila({ 'fechaDesplazamiento': null }),
     'falta la fecha de desplazamiento');
para('sin fecha (solo espacios)', conFila({ 'fechaDesplazamiento': '   ' }),
     'falta la fecha de desplazamiento');
comprobar('   el motivo explica que sin fecha no hay anios ni bloques',
  api.resolverDatos(conFila({ 'fechaDesplazamiento': '' })).error
    .indexOf('no hay años ni bloques') !== -1);

const conHora = resuelve('fecha con hora "2026-09-01T12:00:00.000Z"',
                         conFila({ 'fechaDesplazamiento': '2026-09-01T12:00:00.000Z' }));
if (conHora) {
  igual('   sale igual que la fecha sin hora', conHora.fechaDesplazamiento, '01/09/2026');
  igual('   y el anio tambien', conHora.anioDesplazamiento, 2026);
}
const conHoraTarde = resuelve('fecha con hora a las 23:59 (el borde del dia)',
                              conFila({ 'fechaDesplazamiento': '2026-09-01T23:59:59.000Z' }));
if (conHoraTarde) igual('   sigue siendo el 1', conHoraTarde.fechaDesplazamiento, '01/09/2026');

const sinCeros = resuelve('fecha sin ceros "2026-9-1"', conFila({ 'fechaDesplazamiento': '2026-9-1' }));
if (sinCeros) igual('   se imprime con los ceros', sinCeros.fechaDesplazamiento, '01/09/2026');

// Un Date de verdad. SE CREA DENTRO DEL vm: un Date del proceso padre no es
// `instanceof Date` dentro del contexto, porque son dos realms distintos.
const fechaDate = vm.runInContext('new Date("2026-09-01T12:00:00.000Z")', contexto);
const conDate = resuelve('fecha como objeto Date', conFila({ 'fechaDesplazamiento': fechaDate }));
if (conDate) igual('   se lee en UTC y da el mismo dia', conDate.fechaDesplazamiento, '01/09/2026');

[
  'mañana',
  '01/09/2026',        // DD/MM/AAAA: NO se acepta a proposito, ver el informe
  '2026-13-01',        // mes 13
  '2026-00-10',        // mes 0
  '2026-02-30',        // no existe
  '2025-02-29',        // 2025 no es bisiesto
  '26-09-01',          // anio de dos digitos
  'null',
  '0'
].forEach(function (basura) {
  para('fecha basura ' + JSON.stringify(basura), conFila({ 'fechaDesplazamiento': basura }),
       'no se entiende');
});
const bisiesto = resuelve('29/02/2028 (bisiesto de verdad)',
                          conFila({ 'fechaDesplazamiento': '2028-02-29' }));
if (bisiesto) igual('   sale 29/02/2028', bisiesto.fechaDesplazamiento, '29/02/2028');

const finDeAnio = resuelve('31/12/2026', conFila({ 'fechaDesplazamiento': '2026-12-31' }));
if (finDeAnio) {
  igual('   fecha', finDeAnio.fechaDesplazamiento, '31/12/2026');
  igual('   anioSiguiente', finDeAnio.anioSiguiente, 2027);
}

// ===========================================================================
console.log('\n7 · EL 1 DE ENERO EN CUATRO ZONAS HORARIAS DE VERDAD');
// ===========================================================================
// No se simula: se relanza ESTE fichero con TZ puesta y se lee lo que imprime.
// Pacific/Kiritimati es +14 y Pacific/Midway -11: entre las dos hay 25 horas,
// asi que cualquier lectura de la fecha que pase por la zona local se rompe.
['UTC', 'Europe/Madrid', 'Pacific/Kiritimati', 'Pacific/Midway'].forEach(function (zona) {
  let salida;
  try {
    salida = JSON.parse(execFileSync(process.execPath, [__filename], {
      env: Object.assign({}, process.env, { TZ: zona, PRUEBA_ZONA_HORARIA: '1' }),
      encoding: 'utf8'
    }));
  } catch (e) {
    fallan++;
    console.log('  FALLA TZ=' + zona + ' no ha podido ejecutarse: ' + e.message);
    return;
  }
  igual('TZ=' + zona + ' · "2026-01-01" -> fecha', salida.sinHoraFecha, '01/01/2026');
  igual('TZ=' + zona + ' · "2026-01-01" -> anio', salida.sinHoraAnio, 2026);
  igual('TZ=' + zona + ' · "2026-01-01" -> anioSiguiente', salida.sinHoraSiguiente, 2027);
  igual('TZ=' + zona + ' · "2026-01-01T00:30:00.000Z" -> fecha', salida.conHoraFecha, '01/01/2026');
  igual('TZ=' + zona + ' · "2026-01-01T00:30:00.000Z" -> anio', salida.conHoraAnio, 2026);
});

// ===========================================================================
console.log('\n8 · EL SALARIO');
// ===========================================================================
para('sin salario (clave ausente)', conFila({ 'Salario': undefined }), 'falta el salario bruto anual');
para('sin salario (cadena vacia)', conFila({ 'Salario': '' }), 'falta el salario bruto anual');
para('sin salario (null)', conFila({ 'Salario': null }), 'falta el salario bruto anual');
para('salario 0', conFila({ 'Salario': 0 }), 'no se puede imprimir');
para('salario negativo', conFila({ 'Salario': -100 }), 'no se puede imprimir');
para('salario que no es numero', conFila({ 'Salario': 'mucho' }), 'no es un número');

[
  [345678, '345.678'],
  [1000, '1.000'],
  [999, '999'],
  [1, '1'],
  [1234567, '1.234.567'],
  [60100, '60.100'],
  [45000.6, '45.001'],     // sin decimales: se redondea
  [50000.4, '50.000'],
  ['345678', '345.678'],   // texto, por si el typecast lo manda asi
  ['45000,50', '45.001']
].forEach(function (par) {
  const d = api.resolverDatos(conFila({ 'Salario': par[0] }));
  if (!d.ok) { fallan++; console.log('  FALLA salario ' + JSON.stringify(par[0]) + ': ' + d.error); return; }
  igual('salario ' + JSON.stringify(par[0]), d.datos.salarioBrutoAnual, par[1]);
});
comprobar('el salario no lleva simbolo de euro ni decimales',
  !/[€,]/.test(api.resolverDatos(FILA_REAL).datos.salarioBrutoAnual));

// ===========================================================================
console.log('\n9 · EL NOMBRE');
// ===========================================================================
para('sin nombre ni apellidos', conFila({ 'Nombre empleado': '', 'Apellidos empleado': '' }),
     'falta el nombre del cliente');
para('sin nombre ni apellidos (claves ausentes)',
     conFila({ 'Nombre empleado': undefined, 'Apellidos empleado': undefined }),
     'falta el nombre del cliente');

const soloNombre = resuelve('solo nombre', conFila({ 'Apellidos empleado': '' }));
if (soloNombre) igual('   nombreCompleto', soloNombre.nombreCompleto, 'Hammad');
const soloApellidos = resuelve('solo apellidos', conFila({ 'Nombre empleado': '' }));
if (soloApellidos) igual('   nombreCompleto', soloApellidos.nombreCompleto, 'Bellachhab');

[
  ['HAMMAD', 'Bellachhab', 'Hammad Bellachhab'],
  ['HAMMAD', 'BELLACHHAB', 'Hammad Bellachhab'],
  ['hammad', 'bellachhab', 'Hammad Bellachhab'],
  ['JOSE MARIA', 'DE LA TORRE', 'Jose Maria de la Torre'],
  ['ANA', 'GARCIA-LOPEZ', 'Ana Garcia-Lopez'],
  ['ANA', 'PEREZ DE LOS SANTOS Y GARCIA', 'Ana Perez de los Santos y Garcia'],
  ['JOAO', 'DA SILVA DOS SANTOS', 'Joao da Silva dos Santos'],
  ['MARIA DEL CARMEN', 'RUIZ', 'Maria del Carmen Ruiz'],
  ['DE LA TORRE', 'JOSE', 'De la Torre Jose'],          // particula primera: va en mayuscula
  ['  HAMMAD   ', '  BELLACHHAB  ', 'Hammad Bellachhab'],  // espacios de sobra
  ['MARY', "O'BRIEN", "Mary O'Brien"],
  ['ANNE', 'SMITH-JONES-BROWN', 'Anne Smith-Jones-Brown']
].forEach(function (caso) {
  const d = api.resolverDatos(conFila({ 'Nombre empleado': caso[0], 'Apellidos empleado': caso[1] }));
  if (!d.ok) { fallan++; console.log('  FALLA nombre ' + caso[0] + '/' + caso[1] + ': ' + d.error); return; }
  igual('nombre ' + JSON.stringify(caso[0] + ' + ' + caso[1]), d.datos.nombreCompleto, caso[2]);
});

// ===========================================================================
console.log('\n10 · ESTADO CIVIL CONCORDADO CON SEXO (§4.4)');
// ===========================================================================
[
  ['soltero', 'Hombre', 'Soltero'], ['soltero', 'Mujer', 'Soltera'], ['soltero', '', 'Soltero'],
  ['casado', 'Hombre', 'Casado'], ['casado', 'Mujer', 'Casada'], ['casado', '', 'Casado'],
  ['divorciado', 'Hombre', 'Divorciado'], ['divorciado', 'Mujer', 'Divorciada'], ['divorciado', '', 'Divorciado'],
  ['viudo', 'Hombre', 'Viudo'], ['viudo', 'Mujer', 'Viuda'], ['viudo', '', 'Viudo'],
  // Invariable: no se concuerda ni con Mujer ni sin Sexo.
  ['pareja de hecho', 'Hombre', 'Pareja de hecho'],
  ['pareja de hecho', 'Mujer', 'Pareja de hecho'],
  ['pareja de hecho', '', 'Pareja de hecho']
].forEach(function (caso) {
  const d = api.resolverDatos(conFila({ 'estadoCivil': caso[0], 'Sexo': caso[1] }));
  if (!d.ok) { fallan++; console.log('  FALLA estadoCivil: ' + d.error); return; }
  igual('estadoCivil ' + caso[0] + ' + Sexo ' + JSON.stringify(caso[1]), d.datos.estadoCivil, caso[2]);
});
// Sexo ausente del todo, no vacio.
const sinSexo = api.resolverDatos(conFila({ 'Sexo': undefined }));
igual('Sexo ausente -> masculino', sinSexo.datos.estadoCivil, 'Casado');
// Un Sexo nuevo que cree el typecast no puede tumbar el informe.
const sexoRaro = api.resolverDatos(conFila({ 'Sexo': 'Otro' }));
igual('Sexo desconocido -> masculino, sin parar', sexoRaro.datos.estadoCivil, 'Casado');
// Un estadoCivil que no esta en la tabla se imprime, no para: no es un dato
// fiscal y con typecast una opcion nueva se crea sola.
const civilRaro = api.resolverDatos(conFila({ 'estadoCivil': 'separado' }));
igual('estadoCivil desconocido -> capitalizado, sin parar', civilRaro.datos.estadoCivil, 'Separado');
const civilVacio = api.resolverDatos(conFila({ 'estadoCivil': '' }));
igual('estadoCivil vacio -> cadena vacia (ver el informe)', civilVacio.datos.estadoCivil, '');

// ===========================================================================
console.log('\n11 · HIJOS');
// ===========================================================================
igual('"Tiene hijos" -> Sí', api.resolverDatos(conFila({ 'hijos': 'Tiene hijos' })).datos.hijos, 'Sí');
igual('"No tiene hijos" -> No', api.resolverDatos(conFila({ 'hijos': 'No tiene hijos' })).datos.hijos, 'No');
igual('hijos vacio -> cadena vacia', api.resolverDatos(conFila({ 'hijos': '' })).datos.hijos, '');
igual('hijos ausente -> cadena vacia', api.resolverDatos(conFila({ 'hijos': undefined })).datos.hijos, '');
igual('hijos con un valor nuevo -> literal, sin parar',
      api.resolverDatos(conFila({ 'hijos': 'Tiene 3 hijos' })).datos.hijos, 'Tiene 3 hijos');

// ===========================================================================
console.log('\n12 · LAS 4 OPCIONES DE PROPIEDADES (una con errata) Y LAS 4 DE INVERSIONES');
// ===========================================================================
[
  ['Tiene propiedades en España y no tiene propiedades en el extranjero',
   'Tiene propiedades en España y no tiene propiedades en el extranjero'],
  ['Tiene propiedades en el extranjero y no tiene propiedades en España',
   'Tiene propiedades en el extranjero y no tiene propiedades en España'],
  // LA ERRATA: en Airtable falta el «en» y aqui se le pone.
  ['No tiene propiedades en España ni el extranjero',
   'No tiene propiedades en España ni en el extranjero'],
  ['Tiene propiedades en España y en el extranjero',
   'Tiene propiedades en España y en el extranjero']
].forEach(function (par) {
  const d = api.resolverDatos(conFila({ 'Propiedades': par[0] }));
  igual('Propiedades ' + JSON.stringify(par[0].slice(0, 45) + '...'), d.datos.sumaPropiedades, par[1]);
});
comprobar('la errata corregida es la UNICA que cambia',
  api.resolverDatos(conFila({ 'Propiedades': 'No tiene propiedades en España ni el extranjero' }))
    .datos.sumaPropiedades.indexOf('ni en el extranjero') !== -1);
igual('Propiedades vacio -> cadena vacia',
      api.resolverDatos(conFila({ 'Propiedades': '' })).datos.sumaPropiedades, '');

[
  'Tiene inversiones en España y no tiene inversiones en el extranjero',
  'Tiene inversiones en el extranjero y no tiene inversiones en España',
  'No tiene inversiones en España ni en el extranjero',
  'Tiene inversiones en España y en el extranjero'
].forEach(function (opcion) {
  const d = api.resolverDatos(conFila({ 'Inversiones': opcion }));
  igual('Inversiones tal cual ' + JSON.stringify(opcion.slice(0, 45) + '...'),
        d.datos.sumaInversiones, opcion);
});
igual('Inversiones vacio -> cadena vacia',
      api.resolverDatos(conFila({ 'Inversiones': '' })).datos.sumaInversiones, '');

// ===========================================================================
console.log('\n13 · EL PAIS DE ORIGEN (frontera con tabla-paises-iso2)');
// ===========================================================================
[
  ['MARRUECOS', 'Marruecos'],
  ['PAISES BAJOS', 'Países Bajos'],
  ['ESPAÑA', 'España'],
  ['CHECA, REPUBLICA', 'República Checa'],
  ['SALVADOR, EL', 'El Salvador'],
  ['ESTADOS UNIDOS DE AMERICA', 'Estados Unidos de América'],
  ['WAKANDA', 'WAKANDA'],   // no esta en el mapa: se imprime la clave, NO se aborta
  ['', '']
].forEach(function (par) {
  const d = api.resolverDatos(conFila({ 'Nacionalidad': par[0] }));
  if (!d.ok) { fallan++; console.log('  FALLA pais ' + par[0] + ': ' + d.error); return; }
  igual('Nacionalidad ' + JSON.stringify(par[0]), d.datos.paisOrigen, par[1]);
});
comprobar('un pais desconocido NO aborta el informe (§4.3, es cosmetico)',
  api.resolverDatos(conFila({ 'Nacionalidad': 'WAKANDA' })).ok === true);
comprobar('sin Nacionalidad tampoco aborta',
  api.resolverDatos(conFila({ 'Nacionalidad': undefined })).ok === true);
comprobar('paisPresentacion() esta de verdad en el contexto (no el camino de emergencia)',
  typeof api.PAIS_PRESENTACION === 'object' && api.PAIS_PRESENTACION['MARRUECOS'] === 'Marruecos');

// ===========================================================================
console.log('\n14 · LA FRONTERA CON LA PIEZA 4: montarElementos(datos)');
// ===========================================================================
// Esta es la prueba que de verdad demuestra que la pieza 3 y la pieza 4 encajan:
// montarElementos() LANZA si le falta un marcador o si queda un '{{'.
const COMBINACIONES = [
  ['No residente NO UE', 'Residente Fiscal', 'B', 'A'],
  ['No residente UE', 'Régimen Especial (Beckham)', 'B', 'C'],
  ['Residente Fiscal', 'Residente Fiscal', 'A', 'A'],
  ['Régimen Especial (Beckham)', 'Régimen Especial (Beckham)', 'C', 'C'],
  ['Residente Fiscal', 'Régimen Especial (Beckham)', 'A', 'C'],
  ['Régimen Especial (Beckham)', 'Residente Fiscal', 'C', 'A']
];
COMBINACIONES.forEach(function (caso) {
  const d = api.resolverDatos(conFila({
    'Situación fiscal Anio Desplazamiento': caso[0],
    'Situación fiscal AnioSiguiente': caso[1]
  }));
  if (!d.ok) { fallan++; console.log('  FALLA ' + caso[0] + ' / ' + caso[1] + ': ' + d.error); return; }
  let elementos;
  try {
    elementos = api.montarElementos(d.datos);
  } catch (e) {
    fallan++;
    console.log('  FALLA la pieza 4 no monta ' + caso[0] + ' / ' + caso[1] + ': ' + e.message);
    return;
  }
  const textos = [];
  elementos.forEach(function (el) {
    ['texto', 'etiqueta', 'valor', 'titulo'].forEach(function (k) { if (el[k] !== undefined) textos.push(el[k]); });
    if (el.items) el.items.forEach(function (t) { textos.push(t); });
    if (el.cabecera) el.cabecera.forEach(function (t) { textos.push(t); });
    if (el.filas) el.filas.forEach(function (f) { f.forEach(function (t) { textos.push(t); }); });
  });
  const todo = textos.join('\n');
  const titulares = elementos.filter(function (el) { return el.tipo === 'titulo1'; });
  comprobar('monta ' + caso[2] + ' + ' + caso[3] + ' (' + elementos.length + ' elementos, sin "{{")',
    todo.indexOf('{{') === -1 &&
    titulares.length === 2 &&
    titulares[0].texto.indexOf('BLOQUE ' + caso[2]) === 0 &&
    titulares[1].texto.indexOf('BLOQUE ' + caso[3]) === 0,
    'titulares: ' + titulares.map(function (t) { return t.texto; }).join(' | '));
  comprobar('   la cabecera dice "Situación en 2026" y "Situación en 2027"',
    todo.indexOf('Situación en 2026') !== -1 && todo.indexOf('Situación en 2027') !== -1);
  // 19/08/2026 · nombre y apellidos van en DOS campos distintos de la cabecera, asi
  // que ya no aparecen pegados en el texto plano. Se comprueban por separado.
  comprobar('   y el nombre y los apellidos estan dentro, cada uno en su campo',
    todo.indexOf('Hammad') !== -1 && todo.indexOf('Bellachhab') !== -1);
  comprobar('   ningun texto lleva "undefined" ni "NaN"',
    todo.indexOf('undefined') === -1 && todo.indexOf('NaN') === -1);
});

// ===========================================================================
console.log('\n15 · COSAS QUE NO PUEDEN CAERSE');
// ===========================================================================
[
  ['fila undefined', undefined],
  ['fila null', null],
  ['fila vacia', {}],
  ['fila que es un texto', 'hola'],
  ['fila que es un numero', 7]
].forEach(function (caso) {
  let r;
  try {
    r = api.resolverDatos(caso[1]);
  } catch (e) {
    fallan++;
    console.log('  FALLA ' + caso[0] + ' ha lanzado: ' + e.message);
    return;
  }
  comprobar(caso[0] + ' -> ok:false con motivo (' + r.error + ')',
    r.ok === false && typeof r.error === 'string' && r.error.length > 0);
});
// Todos los motivos empiezan igual, porque acaban en la columna ErrorInforme y
// se leen en una lista.
const MOTIVOS_DE_MUESTRA = [
  conFila({ 'fechaDesplazamiento': '' }),
  conFila({ 'fechaDesplazamiento': 'mañana' }),
  conFila({ 'Situación fiscal Anio Desplazamiento': '' }),
  conFila({ 'Situación fiscal AnioSiguiente': ERROR_AIRTABLE }),
  conFila({ 'Situación fiscal Anio Desplazamiento': 'Marciano' }),
  conFila({ 'Nombre empleado': '', 'Apellidos empleado': '' }),
  conFila({ 'Salario': '' })
];
comprobar('los 7 motivos del §4.6 empiezan por "No se genera el informe:"',
  MOTIVOS_DE_MUESTRA.every(function (f) {
    const r = api.resolverDatos(f);
    return !r.ok && r.error.indexOf('No se genera el informe:') === 0;
  }));
comprobar('los 7 motivos acaban en punto',
  MOTIVOS_DE_MUESTRA.every(function (f) {
    const r = api.resolverDatos(f);
    return !r.ok && /\.$/.test(r.error);
  }));

// ===========================================================================
console.log('\n' + '='.repeat(70));
console.log('PASAN ' + pasan + ' · FALLAN ' + fallan + ' · TOTAL ' + (pasan + fallan));
console.log('='.repeat(70));
process.exit(fallan ? 1 : 0);
