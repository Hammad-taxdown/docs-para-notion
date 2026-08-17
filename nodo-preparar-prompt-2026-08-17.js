// Preparar_Prompt · v3 · 17/08/2026
//
// QUE CAMBIA Y POR QUE. Hasta hoy el bloque "DATOS QUE YA CONOCEMOS" se armaba con
// SEIS campos y ninguno venia de Airtable: salian del body del Data Connector y de
// los custom attributes de la conversacion de Intercom. Resultado medido en la
// conversacion 215475520917125: al agente le llegaron CUATRO datos (email, fecha de
// alta en la SS, veredicto del plazo y fecha limite) y volvio a preguntar la fecha
// de llegada, la nacionalidad y el pais de nacimiento, QUE ESTABAN GUARDADOS EN
// AIRTABLE desde la conversacion anterior.
//
// El expediente entraba en la conversacion solo si el agente decidia llamar a la
// tool leer_expediente. Eso es una decision del LLM, o sea que no es una garantia.
// AHORA EL EXPEDIENTE VIENE DE AIRTABLE Y ENTRA SIEMPRE, en el systemMessage, sin
// que el agente tenga que hacer nada.
//
// ── LA LECTURA NO PUEDE TUMBAR LA CONVERSACION ────────────────────────────────
// El nodo Leer_Expediente_Para_Prompt va con alwaysOutputData:true y
// onError:continueRegularOutput, igual que Leer_Status_Actual y Leer_MotivoCierre.
// Si Airtable falla o no encuentra fila, emite un item vacio y aqui se trata como
// "cliente nuevo". Un cliente nuevo NO PUEDE quedarse sin respuesta porque su
// expediente todavia no exista.
//
// ── POR QUE NO SE USA $json ───────────────────────────────────────────────────
// Al meter el nodo de Airtable en medio, $json ya NO es la salida de
// Formatear_conversacion1: es la fila de Airtable. Los datos de la conversacion se
// leen EXPLICITAMENTE con $('Formatear_conversacion1').first(), que ademas deja el
// nodo inmune a que alguien vuelva a cambiar el orden de la cadena.
// Y es .first(), NUNCA .item: en un nodo de codigo el .item cuelga el task runner
// hasta el timeout (regla del proyecto, con prueba).

const conv0 = $('Formatear_conversacion1').first().json || {};
const body = $('Webhook1').first().json.body || {};
const conv = $('Traer_Conversacion_intercom1').first().json || {};
const attrs = conv.custom_attributes || {};

// La fila de Airtable. Con alwaysOutputData puede llegar {} o sin `fields`.
const filaCruda = $('Leer_Expediente_Para_Prompt').all()
  .map(function (i) { return i.json || {}; })
  .filter(function (x) { return typeof x.id === 'string' && x.id.startsWith('rec'); });
const nFilas = filaCruda.length;
const fila = filaCruda[0] || {};
const e = fila.fields ? fila.fields : {};
const existe = typeof fila.id === 'string' && fila.id.startsWith('rec');

const raw = conv0.last_message_content;
const cold = !raw || String(raw).trim() === '';

// dato() RECHAZA CUALQUIER OBJETO a proposito. Una celda de texto de Airtable nunca
// es un objeto: si llega uno, es un singleSelect (va por sel()), un adjunto (va por
// tiene()) o UNA CELDA EN ERROR, del tipo {state:'error', errorType:'emptyDependency'}
// que devuelven las columnas de IA y de formula cuando les falta una dependencia.
// Sin esta guarda, String() de eso escribe '[object Object]' EN EL PROMPT y el agente
// se lo cree y se lo dice al cliente. Probado: la columna AnioDesplazamiento de la
// fila real esta hoy mismo en ese estado.
const dato = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'object') return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

// Un numero puede ser 0 y 0 es valido, asi que no vale el truco de `v || null`.
const numTxt = (v) => {
  if (v === undefined || v === null || v === '' || typeof v === 'object') return null;
  const n = Number(v);
  return isNaN(n) ? null : String(n);
};

// Un singleSelect de Airtable llega como {id,name,color}. Sin esto saldria
// '[object Object]' en el prompt SIN FALLAR, que es el peor de los dos mundos.
const sel = (v) => {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'object' && !Array.isArray(v) && v.name !== undefined) return String(v.name);
  if (typeof v === 'object') return null;
  return String(v);
};
const multi = (v) => {
  if (!Array.isArray(v) || v.length === 0) return null;
  return v.map(function (x) { return (x && typeof x === 'object' && x.name !== undefined) ? String(x.name) : String(x); }).join(', ');
};
const tiene = (v) => (Array.isArray(v) && v.length > 0);

// 4/08 · fecha_alta_ss_f2 llega en ISO (viene de fecha_alta_norm de F2) y el
// RESUMEN del prompt lo escribe en DD/MM/AAAA. Se traduce aqui para que el agente
// no tenga que reformatear nada al hablar.
const fechaEs = (v) => {
  const s = dato(v);
  if (!s) return null;
  const m = String(s).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : s;
};

// ── Los datos, por grupos y en el orden en que el bot los pregunta ────────────
// El nombre y el telefono se prefieren DE AIRTABLE y solo se cae al body del DC si
// la fila no los tiene: lo de Airtable es lo que el cliente confirmo hablando.
const nombreAirtable = [dato(e['Nombre empleado']), dato(e['Apellidos empleado'])].filter(Boolean).join(' ');

const pares = [
  ['Nombre', nombreAirtable || dato(body.nombre_apellidos)],
  ['Email', dato(e.email) || dato(body.user_email) || dato(conv0.user_email)],
  ['Telefono', dato(e.NumeroTelefono) || dato(body.telefono)],
  ['NIF/NIE', dato(e.NIF)],
  ['Numero de pasaporte', dato(e.PasaporteNumero)],
  ['Fecha de nacimiento', fechaEs(e.FechaNacimiento)],
  ['Sexo', sel(e.Sexo)],
  ['Estado civil', sel(e.estadoCivil)],
  ['Hijos', sel(e.hijos)],
  ['Nacionalidad', sel(e.Nacionalidad)],
  ['Pais de nacimiento', sel(e.PaisNacimiento)],
  ['Provincia de nacimiento', dato(e['Provincia de Nacimiento / Province of Birth'])],
  ['Municipio de nacimiento', dato(e['Municipio de Nacimiento / Birth Municipality'])],
  ['Ultimo pais de residencia', sel(e.UltimoPaisResidencia)],

  ['Domicilio en Espana', [
    sel(e['Tipo de vía / Type of road']),
    dato(e['Nombre de la calle / Name of street']),
    dato(e['Número de tu domicilio / House Number']),
    dato(e.Planta) ? 'planta ' + dato(e.Planta) : null,
    dato(e.Puerta) ? 'puerta ' + dato(e.Puerta) : null
  ].filter(Boolean).join(' ') || null],
  ['Codigo postal', dato(e['Codigo Postal'])],
  ['Municipio de residencia', dato(e.MunicipioResidencia)],

  ['Fecha de llegada a Espana', fechaEs(e.fechaDesplazamiento)],
  ['Fecha de alta en la Seguridad Social', fechaEs(e.fecha_alta_ss) || fechaEs(attrs.fecha_alta_ss_f2)],
  ['Veredicto del plazo', dato(attrs.veredicto_f2)],
  ['Fecha limite para solicitar', dato(attrs.fecha_limite_f2) || fechaEs(e.fecha_limite_plazo)],
  ['Salario bruto anual', numTxt(e.Salario)],
  ['Empresa', sel(e.Empresa)],
  ['Motivo del desplazamiento', sel(e.TipoBeckham)],
  ['Propiedades', sel(e.Propiedades)],
  ['Inversiones', sel(e.Inversiones)],
  ['El conyuge tambien quiere acogerse', e.ConyugeQuiereAcogerse === true ? 'si' : null],
  ['Idioma de atencion', sel(e.Idioma)]
].filter(function (p) { return p[1] !== null && p[1] !== ''; });

// ── Documentos: SOLO si los tiene. Booleanos, nunca URLs: las firmadas de
// Airtable caducan el mismo dia y un enlace roto es peor que ninguno.
const docs = [
  ['DNI o NIE', tiene(e.DNI)],
  ['pasaporte', tiene(e.Pasaporte)],
  ['contrato de trabajo', tiene(e.Contratotrabajo)],
  ['justificante de alta en la SS', tiene(e.AltaSeguridadSocial)],
  ['autorizacion del empleado', tiene(e.AutorizacionEmpleado)],
  ['autorizacion de la empresa', tiene(e.AutorizacionEmpresa)],
  ['certificado ENISA', tiene(e.CertificadoEnisa)],
  ['apostilla', tiene(e.Apostilla)],
  ['visado', tiene(e.Visado)]
].filter(function (d) { return d[1]; }).map(function (d) { return d[0]; });

// ── Lo que ya se decidio del caso. Sin esto el agente vuelve a enrutar desde cero
// un expediente que ya estaba cerrado, y le pide otra vez la fecha de la llamada.
const decidido = [];
if (sel(e.Status)) decidido.push('- Estado del expediente: ' + sel(e.Status));
if (sel(e.MotivoCierre)) decidido.push('- Ya se cerro una conversacion anterior por: ' + sel(e.MotivoCierre));
if (multi(e.SenalesComplejidad)) decidido.push('- El caso ya se enruto como COMPLEJO por: ' + multi(e.SenalesComplejidad));
if (fechaEs(e.FechaLlamada)) decidido.push('- Ya tiene llamada con el equipo fiscal agendada para el ' + fechaEs(e.FechaLlamada) + ' (NO se la vuelvas a preguntar)');
if (e.AplicaBeckham === true) decidido.push('- El cliente ya confirmo que quiere acogerse al regimen');
if (sel(e.Descarte)) decidido.push('- Motivo de descarte anotado: ' + sel(e.Descarte));
if (dato(e.DiscrepanciaFechaAlta)) decidido.push('- AVISO ya detectado: ' + dato(e.DiscrepanciaFechaAlta));

const trozos = [];

if (!existe) {
  trozos.push('--- DATOS QUE YA CONOCEMOS ---');
  trozos.push('(ninguno: es la primera vez que hablamos con este cliente)');
} else {
  trozos.push('--- DATOS QUE YA CONOCEMOS (no los vuelvas a preguntar) ---');
  trozos.push(pares.map(function (p) { return '- ' + p[0] + ': ' + p[1]; }).join('\n'));
  if (docs.length) {
    trozos.push('');
    trozos.push('--- DOCUMENTOS QUE YA NOS HA ENVIADO (no los vuelvas a pedir) ---');
    trozos.push('- ' + docs.join('\n- '));
  }
  if (decidido.length) {
    trozos.push('');
    trozos.push('--- LO QUE YA SE DECIDIO DE ESTE CASO ---');
    trozos.push(decidido.join('\n'));
  }
  if (dato(e.ResumenBot)) {
    trozos.push('');
    trozos.push('--- RESUMEN QUE TU MISMO ESCRIBISTE LA VEZ ANTERIOR ---');
    trozos.push(dato(e.ResumenBot));
  }
}

// WP-205b: dos filas con el mismo UserId y el escritor DEJA DE GUARDAR. El agente
// tiene que saberlo para no prometerle al cliente que se ha guardado nada.
if (nFilas > 1) {
  trozos.push('');
  trozos.push('--- AVISO TECNICO ---');
  trozos.push('Hay MAS DE UNA ficha con este identificador, asi que ahora mismo NO se puede guardar nada. No le prometas al cliente que has guardado sus datos y ofrece support@taxdown.es.');
}

trozos.push('');
trozos.push('Situacion: ' + (cold
  ? 'arranque en frio, el usuario todavia no ha escrito nada'
  : 'conversacion en curso'));

const contexto = trozos.join('\n');

const historial = dato(conv0.chat_history) || '(sin historial previo)';

const instruccionArranque = [
  '[ARRANQUE_EN_FRIO]',
  'El usuario acaba de completar la cualificacion para el regimen Beckham y todavia no ha escrito ningun mensaje.',
  'Presentate brevemente, agradece los datos que ya ha aportado y haz UNA sola pregunta para avanzar.',
  'No repitas preguntas ya respondidas en el historial ni pidas datos que ya conocemos.'
].join('\n');

const prompt = [
  cold ? instruccionArranque : String(raw),
  '',
  '--- HISTORIAL DE LA CONVERSACION ---',
  historial
].join('\n');

// Se devuelve conv0 entero y no $json, porque los nodos de despues siguen
// esperando last_message_content, attachments_list y files_analysis_blocks.
return { json: { ...conv0, prompt, contexto, cold_start: cold, _expediente_existe: existe, _expediente_filas: nFilas, _expediente_record_id: fila.id || null } };
