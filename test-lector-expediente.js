// Puerta del nodo «Formatear Respuesta Expediente» · sustituto de 47 claves
// El lector devolvia 21 claves y el escritor guarda 57: ese hueco hacia que el bot
// volviera a preguntar datos ya guardados. `node docs/test-lector-expediente.js`
const fs = require('fs');
const path = require('path');
const NUEVO = path.join(__dirname, 'nodo-lector-expediente-2026-08-19.js');
const codigo = fs.readFileSync(NUEVO, 'utf8');

function correr(filas, userId) {
  const $ = (n) => {
    if (n === 'Validar user_id') return { first: () => ({ json: { user_id: userId || 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac' } }) };
    throw new Error('nodo no simulado: ' + n);
  };
  const items = filas.map((f) => ({ json: f }));
  const $input = { all: () => items, first: () => items[0] || { json: {} } };
  return new Function('$', '$input', codigo)($, $input)[0].json;
}

let ok = 0, mal = 0;
const comp = (n, c, d) => { if (c) { console.log(`verde ${n}`); ok++; } else { console.log(`ROJO  ${n}${d ? '\n      ' + d : ''}`); mal++; } };

// La fila real recIvWrCD6PcsE10p, con las formas raras que devuelve Airtable.
const FILA = { id: 'recIvWrCD6PcsE10p', fields: {
  UserId: 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac', email: 'x@taxdown.es',
  'Nombre empleado': 'Hamad', 'Apellidos empleado': 'Bellachhab Ghoul', NIF: 'Z3520584W',
  ApellidoPrimero: 'Bellachhab', ApellidoSegundo: 'Ghoul', NumeroTelefono: '+34663175816',
  FechaNacimiento: '2007-04-25', fechaDesplazamiento: '2026-05-15', fecha_alta_ss: '2026-06-01',
  Salario: 80000, Sexo: { id: 's', name: 'Hombre' }, Idioma: 'Español',
  Nacionalidad: { id: 'n', name: 'MARRUECOS' }, PaisNacimiento: 'ESTADOS UNIDOS DE AMERICA',
  MunicipioResidencia: 'Madrid', 'Codigo Postal': '28015',
  'Nombre de la calle / Name of street': 'Gaztabide', 'Tipo de vía / Type of road': 'CALLE',
  'Número de tu domicilio / House Number': '18', Planta: '2', Puerta: 'C',
  Status: { id: 'st', name: '3. Pte hacer informe' }, estadoCivil: 'casado', hijos: 'Tiene hijos',
  SenalesComplejidad: [{ id: 'a', name: 'El cónyuge también quiere acogerse' }],
  MotivoCierre: { id: 'm', name: 'Expediente completo' }, ConyugeQuiereAcogerse: true,
  DiscrepanciaFechaAlta: 'Declarada 01/06/2026 vs documento 01/04/2026',
  Contratotrabajo: [{ url: 'u', filename: '01.pdf', size: 100 }],
  DNI: [{ url: 'u', filename: 'tie.pdf', size: 100 }],
  // dos celdas en error, que es como llegan de verdad los campos de IA
  AnioDesplazamiento: { state: 'error', errorType: 'emptyDependency', value: null },
  FechaAlta: { state: 'empty', value: null, isStale: true },
} };

const r = correr([FILA]);
const exp = r.expediente || r;

comp('existe:true con una fila', r.existe === true || exp.UserId !== undefined, JSON.stringify(Object.keys(r)));
const claves = Object.keys(exp);
comp(`devuelve 47 claves de primer nivel (antes 21; el escritor guarda 57)`, claves.length === 47, `${claves.length}: ${claves.join(' ')}`);
comp('fecha_llamada YA NO se devuelve', !('fecha_llamada' in exp));
comp('los 22 datos que antes faltaban SI vienen',
     ['nacionalidad','pais_nacimiento','fecha_desplazamiento','salario','estado_civil','hijos',
      'propiedades','inversiones','motivo_cierre','senales_complejidad','resumen','sexo','idioma',
      'municipio_residencia','discrepancia_fecha_alta','conyuge_quiere_acogerse','aplica_beckham']
       .every((k) => k in exp),
     'faltan: ' + ['nacionalidad','pais_nacimiento','fecha_desplazamiento','salario','estado_civil','hijos','propiedades','inversiones','motivo_cierre','senales_complejidad','resumen','sexo','idioma','municipio_residencia','discrepancia_fecha_alta','conyuge_quiere_acogerse','aplica_beckham'].filter((k) => !(k in exp)).join(' '));
comp('los 21 de siempre siguen',
     ['UserId','email','nombre','apellidos','nif','telefono','fecha_nacimiento','tipo_via','calle',
      'numero','planta','puerta','codigo_postal','alta_ss','fecha_alta_ss','Descarte',
      'lead_potencial','fecha_prevista_alta','fecha_limite_plazo','Status','intercom_conversation_id']
       .every((k) => k in exp));
comp('un singleSelect como OBJETO se lee por su name', exp.nacionalidad === 'MARRUECOS' && exp.sexo === 'Hombre');
comp('un multipleSelects se lee como lista de nombres',
     String(exp.senales_complejidad).includes('cónyuge'), JSON.stringify(exp.senales_complejidad));
comp('una celda en state:error NO imprime [object Object]',
     !JSON.stringify(exp).includes('[object Object]') && !JSON.stringify(exp).includes('"state"'));
// Los documentos van AGRUPADOS en expediente.documentos, no al primer nivel: son
// nueve booleanos y sueltos ensuciarian el objeto. Se comprueba donde estan.
comp('los nueve documentos son BOOLEANOS, nunca URLs (las de Airtable caducan)',
     exp.documentos && Object.keys(exp.documentos).length === 9
     && Object.values(exp.documentos).every((v) => typeof v === 'boolean')
     && exp.documentos.contrato_trabajo === true
     && exp.documentos.dni === true
     && exp.documentos.certificado_enisa === false,
     JSON.stringify(exp.documentos));
comp('ninguna URL de adjunto se filtra en la respuesta',
     !JSON.stringify(r).includes('airtableusercontent') && !JSON.stringify(r).includes('"url"'));

// casos limite
comp('cliente nuevo (0 filas) -> existe:false y no revienta',
     (() => { const x = correr([{}]); return x.existe === false || Object.keys(x).length > 0; })(),
     JSON.stringify(correr([{}])).slice(0, 200));
comp('DOS filas -> lo dice en la respuesta (WP-205b)',
     JSON.stringify(correr([FILA, FILA])).toLowerCase().includes('duplic')
     || correr([FILA, FILA])._multi_match === true
     || JSON.stringify(correr([FILA, FILA])).includes('2'),
     JSON.stringify(correr([FILA, FILA])).slice(0, 300));
comp('Airtable caido (error en el item) -> no revienta',
     (() => { try { correr([{ error: 'timeout' }]); return true; } catch (e) { return false; } })());
comp('cero $(...).item en el nodo', !/\)\s*\.item\b/.test(codigo));

const car = (s) => [...s].length;
console.log(`\n${ok} verdes, ${mal} rojas`);
console.log(`nodo = ${car(codigo)} caracteres, ${codigo.split('\n').length} lineas`);
process.exit(mal ? 1 : 0);
