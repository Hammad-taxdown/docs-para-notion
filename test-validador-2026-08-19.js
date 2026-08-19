// Puerta del nodo «Validar y Normalizar» · 19/08/2026
// Cinco cambios: gentilicios tanda 2, fuera la senal del 1 de julio, umbral de la
// senal de salario a 50.000, estado civil a tres, y fuera FechaLlamada.
// `node docs/test-validador-2026-08-19.js`
const fs = require('fs');
const path = require('path');

const NUEVO  = path.join(__dirname, 'nodo-validar-y-normalizar-2026-08-19.js');
const VIEJO  = path.join(__dirname, 'BACKUP-validar-y-normalizar-antes-del-19-08.js');
const codigo = fs.readFileSync(NUEVO, 'utf8');

function correr(body, cual) {
  const src = fs.readFileSync(cual || NUEVO, 'utf8');
  const $input = { first: () => ({ json: { body } }), all: () => [{ json: { body } }] };
  return new Function('$input', src)($input)[0].json;
}
const campos = (body) => correr(body).fields;
const desc   = (body) => correr(body)._fechas_descartadas;

let ok = 0, mal = 0;
const comp = (n, c, d) => { if (c) { console.log(`verde ${n}`); ok++; } else { console.log(`ROJO  ${n}${d ? '\n      ' + d : ''}`); mal++; } };
const BASE = { user_id: 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac', intercom_conversation_id: '215475521433349' };

// ── 1 · GENTILICIOS · una muestra ancha de la tanda nueva ───────────────────
const GENT = [
  ['maltés',        'MALTA'],            ['Maltese',       'MALTA'],
  ['chipriota',     'CHIPRE'],           ['Cypriot',       'CHIPRE'],
  ['Sri Lankan',    'SRI LANKA'],        ['ceilanés',      'SRI LANKA'],
  ['bangladesí',    'BANGLADESH'],       ['Bangladeshi',   'BANGLADESH'],
  ['luxemburguesa', 'LUXEMBURGO'],       ['Luxembourgish', 'LUXEMBURGO'],
  ['taiwanesa',     'TAIWAN'],           ['Taiwanese',     'TAIWAN'],
  ['nepalí',        'NEPAL'],            ['Nepalese',      'NEPAL'],
  ['jordana',       'JORDANIA'],         ['Jordanian',     'JORDANIA'],
  ['catarí',        'CATAR'],            ['Qatari',        'CATAR'],
  ['bielorrusa',    'BIELORRUSIA'],      ['Belarusian',    'BIELORRUSIA'],
  ['puertorriqueña','PUERTO RICO'],      ['boricua',       'PUERTO RICO'],
  ['jamaicana',     'JAMAICA'],          ['Jamaican',      'JAMAICA'],
  ['zimbabuense',   'ZIMBABUE'],         ['Zimbabwean',    'ZIMBABUE'],
  ['birmana',       'MYANMAR'],          ['Burmese',       'MYANMAR'],
  ['palestina',     'TERRITORIO PALESTINO OCUPADO'],
  ['ugandesa',      'UGANDA'],           ['Ugandan',       'UGANDA'],
  ['malgache',      'MADAGASCAR'],       ['somalí',        'SOMALIA'],
  ['omaní',         'OMAN'],             ['kuwaití',       'KUWAIT'],
  ['eswatini',      'SUAZILANDIA'],      ['East Timorese', 'TIMOR LESTE'],
];
let gOk = 0, gMal = [];
for (const [dicho, esperado] of GENT) {
  const r = campos({ ...BASE, nacionalidad: dicho }).Nacionalidad;
  if (r === esperado) gOk++; else gMal.push(`${dicho} -> ${r} (esperado ${esperado})`);
}
comp(`gentilicios tanda 2: ${gOk}/${GENT.length} resuelven al pais exacto`, gMal.length === 0, gMal.join('\n      '));

comp('el femenino funciona igual que el masculino',
     campos({ ...BASE, nacionalidad: 'maltés' }).Nacionalidad === campos({ ...BASE, nacionalidad: 'maltesa' }).Nacionalidad);

comp('NO REGRESION · los gentilicios de la tanda 1 siguen',
     ['marroquí','española','French','holandés','estadounidense','brasileña']
       .every(g => typeof campos({ ...BASE, nacionalidad: g }).Nacionalidad === 'string'));

comp('un gentilicio inventado NO crea opcion: se descarta con su texto',
     campos({ ...BASE, nacionalidad: 'wakandiano' }).Nacionalidad === undefined
     && /wakandiano/.test(desc({ ...BASE, nacionalidad: 'wakandiano' })));

comp('el pais de nacimiento usa la misma tabla',
     campos({ ...BASE, pais_nacimiento: 'Maltese' }).PaisNacimiento === 'MALTA');

// ── 2 · EL 1 DE JULIO SALE DE LAS SEÑALES ──────────────────────────────────
const s1julio = { ...BASE, senales_complejidad: 'Llegada posterior al 1 de julio' };
comp('la senal del 1 de julio ya no se escribe',
     (campos(s1julio).SenalesComplejidad || []).length === 0,
     JSON.stringify(campos(s1julio).SenalesComplejidad));
comp('y queda dicha en descartados en vez de crear opcion',
     /1 de julio/.test(desc(s1julio)) && /no reconocida/.test(desc(s1julio)), desc(s1julio));
comp('el v anterior SI la escribia (o sea que el cambio es real)',
     (correr(s1julio, VIEJO).fields.SenalesComplejidad || []).includes('Llegada posterior al 1 de julio'));

comp('NO REGRESION · las otras cinco senales siguen cazandose',
     JSON.stringify(campos({ ...BASE, senales_complejidad: 'teletrabajo, no dispone de carta, salario no definido, el conyuge tambien quiere, foral' }).SenalesComplejidad || [])
       === JSON.stringify(['Vía de acceso distinta del contrato español','No dispone de carta o documento de la empresa','Salario no definido o en el límite','El cónyuge también quiere acogerse','Declarante foral u otras particularidades']),
     JSON.stringify(campos({ ...BASE, senales_complejidad: 'teletrabajo, no dispone de carta, salario no definido, el conyuge tambien quiere, foral' }).SenalesComplejidad));

// ── 3 · EL UMBRAL DE LA SEÑAL DE SALARIO ───────────────────────────────────
for (const dicho of ['salario por debajo de 50.000', 'menos de 50000', 'inferior a 50.000']) {
  comp(`«${dicho}» -> senal de 50.000`,
       (campos({ ...BASE, senales_complejidad: dicho }).SenalesComplejidad || [])[0] === 'Salario por debajo de 50.000',
       JSON.stringify(campos({ ...BASE, senales_complejidad: dicho }).SenalesComplejidad));
}
comp('la cifra vieja (55.000) sigue cazando, por si el agente la dice',
     (campos({ ...BASE, senales_complejidad: 'menos de 55000' }).SenalesComplejidad || [])[0] === 'Salario por debajo de 50.000');
comp('cero apariciones del literal viejo «por debajo de 55.000»',
     !codigo.includes("'Salario por debajo de 55.000'"));

// ── 4 · ESTADO CIVIL A TRES ────────────────────────────────────────────────
const EC = [
  ['soltero','soltero'], ['soltera','soltero'], ['single','soltero'],
  ['casado','casado'], ['casada','casado'], ['married','casado'],
  ['divorciado','divorciado'], ['divorced','divorciado'],
  ['pareja de hecho','casado'], ['union de hecho','casado'], ['domestic partner','casado'],
  ['viudo','soltero'], ['viuda','soltero'], ['widowed','soltero'],
  ['separado','divorciado'],
];
let eOk = 0, eMal = [];
for (const [dicho, esperado] of EC) {
  const r = campos({ ...BASE, estado_civil: dicho }).estadoCivil;
  if (r === esperado) eOk++; else eMal.push(`${dicho} -> ${r} (esperado ${esperado})`);
}
comp(`estado civil: ${eOk}/${EC.length} caen en las tres opciones`, eMal.length === 0, eMal.join('\n      '));
{
  // El invariante NO es que las palabras no aparezcan -- siguen apareciendo, y hacen
  // falta, como PATRONES de entrada. Lo que no puede haber es una ETIQUETA DE SALIDA
  // distinta de las tres. Se saca el bloque de estadoCivil y se leen las etiquetas,
  // que son el primer elemento de cada regla.
  const bloque = codigo.slice(codigo.indexOf("ponerSelect('estadoCivil'"));
  const cuerpo = bloque.slice(0, bloque.indexOf('], {'));
  const etiquetas = [...cuerpo.matchAll(/^\s*\['([^']+)',/gm)].map((m) => m[1]);
  comp('las etiquetas de salida de estadoCivil son exactamente las tres',
       JSON.stringify(etiquetas.sort()) === JSON.stringify(['casado', 'divorciado', 'soltero']),
       'encontradas: ' + JSON.stringify(etiquetas));
  comp('«pareja de hecho» y «viudo» siguen como PATRON de entrada (hacen falta)',
       cuerpo.includes("'pareja de hecho'") && cuerpo.includes("'viudo'"));
}

// ── 5 · FUERA FechaLlamada ─────────────────────────────────────────────────
comp('fecha_llamada ya no escribe FechaLlamada',
     campos({ ...BASE, fecha_llamada: '22/08/2026' }).FechaLlamada === undefined);
comp('el v anterior SI la escribia',
     correr({ ...BASE, fecha_llamada: '22/08/2026' }, VIEJO).fields.FechaLlamada === '2026-08-22T12:00:00.000Z');
comp('y no ensucia _hay_fechas_descartadas al ignorarla',
     correr({ ...BASE, fecha_llamada: '22/08/2026' })._hay_fechas_descartadas === false);
comp('NO REGRESION · las otras cinco fechas siguen funcionando',
     (() => { const f = campos({ ...BASE, fecha_alta_ss: '01/06/2026', fecha_nacimiento: '25/04/2007', fecha_desplazamiento: '15/05/2026' });
              return f.fecha_alta_ss === '2026-06-01T12:00:00.000Z' && f.FechaNacimiento === '2007-04-25T12:00:00.000Z' && f.fechaDesplazamiento === '2026-05-15T12:00:00.000Z'; })());

// ── NO REGRESION GENERAL · el contrato entero con un payload real ──────────
const REAL = { user_id: 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac', nombre: 'Hamad', apellidos: 'Bellachhab Ghoul',
  nif: 'Z3520584W', telefono: '+34663175816', tipo_via: 'CALLE', calle: 'Gaztabide', numero: '18',
  planta: '2', puerta: 'C', codigo_postal: '28015', fecha_nacimiento: '25/04/2007',
  email: 'x@taxdown.es', intercom_conversation_id: '215475521433349', fecha_alta_ss: '2026-06-01', fecha_desplazamiento: '15/05/2026',
  salario: '80000', municipio_nacimiento: 'Chicago', provincia_nacimiento: 'Illinois',
  sexo: 'Hombre', idioma: 'Español', hijos: 'Tiene hijos', estado_civil: 'casado',
  tipo_beckham: 'Empresa española', pais_nacimiento: 'Estados Unidos', nacionalidad: 'Marroquí',
  ultimo_pais_residencia: 'Marruecos', propiedades: 'ninguno', inversiones: 'solo_extranjero',
  quiere_acogerse: 'si', conyuge_quiere_acogerse: 'si', motivo_cierre: 'expediente completo',
  apellido_primero: 'Bellachhab', apellido_segundo: 'Ghoul', municipio_residencia: 'Madrid' };
const r = campos(REAL);
comp('payload real: el NIF valida su letra de control', r.NIF === 'Z3520584W');
comp('payload real: MotivoCierre normaliza a «Expediente completo»', r.MotivoCierre === 'Expediente completo');
comp('payload real: ConyugeQuiereAcogerse llega como true', r.ConyugeQuiereAcogerse === true);
comp('payload real: AplicaBeckham llega como true', r.AplicaBeckham === true);
comp('payload real: la nacionalidad y el pais de nacimiento resuelven',
     r.Nacionalidad === 'MARRUECOS' && r.PaisNacimiento === 'ESTADOS UNIDOS DE AMERICA');
comp('payload real: cero fechas descartadas', correr(REAL)._hay_fechas_descartadas === false, correr(REAL)._fechas_descartadas);
comp('payload real: no aparece FechaLlamada', r.FechaLlamada === undefined);
const nCampos = Object.keys(r).length;
comp(`payload real: escribe ${nCampos} columnas (antes ${Object.keys(correr(REAL, VIEJO).fields).length})`,
     nCampos === Object.keys(correr(REAL, VIEJO).fields).length);

comp('cero $(...).item en el nodo', !/\)\s*\.item\b/.test(codigo));
comp('el nodo devuelve el contrato de siempre',
     ['_invalid','fields','_hay_fechas_descartadas','_fechas_descartadas','_formula_userid']
       .every(k => k in correr(REAL)));

const car = (s) => [...s].length;
console.log(`\n${ok} verdes, ${mal} rojas`);
console.log(`nodo nuevo = ${car(codigo)} caracteres, ${codigo.split('\n').length} lineas (antes ${car(fs.readFileSync(VIEJO,'utf8'))})`);
process.exit(mal ? 1 : 0);
