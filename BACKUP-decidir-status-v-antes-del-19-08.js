// ── 7/08 · Decide Status y Empresa leyendo lo que ya hay en Airtable ───────────
// SIEMPRE .first(), NUNCA .item: este nodo acaba de meterse en medio de la cadena
// y un .item aqui rompe el paired item. Asi se cayo el bot el 6/08 a las 17:20.
const base = $('Validar y Normalizar').first().json;
const fields = Object.assign({}, base.fields);

// ── 10/08 · WP-205b · guarda de UNICIDAD de UserId ─────────────────────────────
// Leer_Status_Actual va con alwaysOutputData:true, asi que cuando NO encuentra
// nada emite un item VACIO. Por eso no se puede contar $input.all().length a
// secas: hay que contar solo los items que traen un record id de Airtable.
// count==0 -> cliente nuevo, el upsert lo crea (comportamiento de siempre)
// count==1 -> actualiza esa fila (comportamiento de siempre)
// count>1  -> AMBIGUO: no se escribe nada y se avisa. Hasta hoy se cogia la
//             primera EN SILENCIO y el upsert actualizaba una cualquiera, asi
//             que el bot podia LEER de una fila y ESCRIBIR en la otra.
const encontradas = $input.all()
  .map(i => i.json || {})
  .filter(f => typeof f.id === 'string' && f.id.startsWith('rec'));
const nFilas = encontradas.length;

const leido = encontradas[0] || $input.first().json || {};

// Si la LECTURA fallo, no se toca ni Status ni Empresa. Preferimos dejarlos como
// esten antes que decidir a ciegas: una fila vacia y una lectura fallida se
// parecen mucho, y confundirlas pisaria el trabajo de una persona.
const lecturaFallo = leido.error !== undefined;

// Airtable devuelve los singleSelect a veces como cadena y a veces como objeto
// con name, y a veces planos y a veces dentro de fields. Se aceptan las cuatro
// combinaciones, igual que hace 'Formatear Respuesta Expediente' desde el 27/07.
const crudo = leido.fields ? leido.fields : leido;
function leerSelect(v) {
  if (v === undefined || v === null || v === '') return '';
  if (typeof v === 'object' && v.name !== undefined) return String(v.name);
  return String(v);
}
const statusActual = leerSelect(crudo.Status);
const empresaActual = leerSelect(crudo.Empresa);

// ── 10/08 · WP-205b slice B · HUELLA de la escritura (idempotencia) ────────────
// Se calcula sobre 'base.fields', o sea sobre lo que MANDA el bot, y NO sobre los
// fields finales con Status y Empresa ya decididos. El motivo importa: tras la
// primera escritura el Status ya ha avanzado, asi que un reintento calcularia un
// Status distinto, la huella cambiaria y el dedup NO DISPARARIA NUNCA.
// Y NO se usa user_id|punto|conversation_id como decia el PRD, porque el bot
// guarda de forma INCREMENTAL: en una conversacion normal manda esos tres valores
// IDENTICOS muchas veces con campos distintos, y esa huella habria descartado el
// segundo y el tercer guardado, perdiendo el NIF y el telefono.
// Las claves se ORDENAN antes de serializar: sin eso, el mismo contenido en otro
// orden daria otra huella.
function canonico(o) {
  const claves = Object.keys(o).sort();
  return JSON.stringify(claves.map(function (k) { return [k, o[k]]; }));
}
function huella(txt) {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < txt.length; i++) {
    const c = txt.charCodeAt(i);
    h1 = ((h1 ^ c) * 0x01000193) >>> 0;
    h2 = (((h2 + c) >>> 0) * 0x85ebca6b) >>> 0;
    h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  }
  // Dos hashes distintos MAS la longitud: una colision aqui saltaria una
  // escritura legitima, asi que se paga el doble para que sea improbable.
  return ('0000000' + h1.toString(16)).slice(-8)
       + ('0000000' + h2.toString(16)).slice(-8)
       + '-' + txt.length;
}
const idemKey = huella(canonico(base.fields || {}));
const idemActual = leerSelect(crudo.last_idem_key);

// Solo se deduplica con UNA fila: con cero no hay nada que comparar, y con dos
// manda la guarda de unicidad, que es mas grave.
const dedup = !lecturaFallo && nFilas === 1 && idemActual !== '' && idemActual === idemKey;

fields.last_idem_key = idemKey;

// ── STATUS: el bot solo AVANZA, nunca retrocede ────────────────────────────────
// Los nombres van COPIADOS LITERAL de Airtable, con sus acentos y con el 10 sin
// espacio tras el punto. Un nombre mal escrito aqui, con typecast:true, CREARIA
// UNA OPCION NUEVA en la columna en vez de fallar.
const ORDEN = {
  '1. Interesado': 1,
  '2. Pendiente llamada TD': 2,
  '3. Pte hacer informe': 3,
  '4. Informe enviado': 4,
  '5. Pte formulario usuario': 5,
  '6. Pte hacer TD': 6,
  '7. Pte confirmación usuario': 7,
  '8. Confirmado': 8,
  '9. Finalizado': 9,
  '10.Pendiente resolución': 10,
  '11. Concedido': 11,
  '12. Descartado': 12
};

// ── 11/08 · WP-238 · El Status depende de COMO se cierra, no solo de que quiera ─
// ANTES: AplicaBeckham===true daba SIEMPRE '2. Pendiente llamada TD'. Un
// expediente completo se quedaba clavado en 'pendiente llamada' aunque no
// hubiera ninguna llamada que hacer. Evidencia: conversacion 215475438827585
// del 11/08, 5 de 5 documentos, MotivoCierre='Expediente completo', Status en 2.
//
// Se mira PRIMERO lo que llega en esta llamada y, si no viene, lo que ya hay en
// la fila: el bot guarda de forma INCREMENTAL y el motivo puede haberse escrito
// en un turno anterior. leerSelect() ya sabe leer las cuatro formas en que
// Airtable devuelve un singleSelect, asi que se reutiliza y no se duplica.
//
// OJO CON LA GRAFIA: estos dos nombres van copiados LITERAL de Airtable, igual
// que los de ORDEN. Con typecast:true un nombre mal escrito NO FALLA: crea una
// opcion nueva en la columna.
const motivoCierre = leerSelect(fields.MotivoCierre) || leerSelect(crudo.MotivoCierre);

let propuesto;
if (fields.Descarte) {
  propuesto = '12. Descartado';
} else if (motivoCierre === 'Expediente completo') {
  // 17/08/2026 · WP-236 YA genera el informe en produccion desde el 14/08, asi que
  // este caso salta directo al peldano que lo dispara. El '3. Pte hacer informe'
  // quedo obsoleto el 13/08 y no lo escribe nadie: la escalera va del 2 al 4.
  // PROBADO HOY EN CONVERSACION REAL: con Status 3 ni beckham_informe_mobility ni
  // beckham_generar_030 arrancan JAMAS, porque los dos filtran por
  // {Status}="4. Informe enviado". El informe del 14/08 salio porque la fila se
  // puso a mano en 4, no porque el bot lo escribiera.
  propuesto = '4. Informe enviado';
} else if (motivoCierre === 'Llamada agendada' || fields.AplicaBeckham === true) {
  propuesto = '2. Pendiente llamada TD';
} else {
  propuesto = '1. Interesado';
}
const nActual = ORDEN[statusActual] || 0;
const nPropuesto = ORDEN[propuesto] || 0;
let escribirStatus = !lecturaFallo && nPropuesto > nActual;

// El descarte solo vale al principio. Si el equipo ya esta trabajando el caso
// (3 o mas), un descarte del bot seria un error suyo, no un dato nuevo.
if (propuesto === '12. Descartado' && nActual > 2) escribirStatus = false;

if (escribirStatus) fields.Status = propuesto;

// ── EMPRESA: TaxDown SOLO si la celda esta vacia ────────────────────────────────
// La columna tiene otras cuatro opciones (Globant y Factorial, interno y externo)
// y las pone una PERSONA a mano. Si el bot escribiera TaxDown en cada guardado,
// borraria ese trabajo en CADA turno de la conversacion. Solo se rellena el hueco.
// OJO CON LA GRAFIA: es 'TaxDown' con D MAYUSCULA.
const escribirEmpresa = !lecturaFallo && !empresaActual;
if (escribirEmpresa) fields.Empresa = 'TaxDown';

// Se devuelve la MISMA FORMA que Validar y Normalizar para que los 51 mapeos del
// nodo de Airtable sigan funcionando sin tocar ni uno.
return [{ json: {
  _invalid: false,
  fields,
  _hay_fechas_descartadas: base._hay_fechas_descartadas,
  _fechas_descartadas: base._fechas_descartadas,
  _lectura_fallo: lecturaFallo,
  _status_actual: statusActual,
  _status_propuesto: propuesto,
  _status_escrito: escribirStatus ? propuesto : null,
  _empresa_actual: empresaActual,
  _empresa_escrita: escribirEmpresa ? 'TaxDown' : null,
  _n_filas: nFilas,
  _multi_match: !lecturaFallo && nFilas > 1,
  _user_id: String(fields.UserId || ''),
  _idem_key: idemKey,
  _idem_actual: idemActual,
  _dedup: dedup
} }];
