const userId = $('Validar user_id').first().json.user_id;

// ── 10/08 · WP-205b · el lector detecta el UserId duplicado ────────────────────
// Buscar Expediente iba con limit:1, asi que la API truncaba y era IMPOSIBLE
// enterarse de que habia dos filas. Con limit:2 se puede contar. El lector sigue
// devolviendo UNA (la primera) porque el agente necesita algo con lo que seguir
// la conversacion, pero ahora lo dice en la respuesta. Sin esto pasaba lo peor:
// el agente leia de la fila A, el escritor escribia en la B, y el bot volvia a
// preguntar datos que el cliente ya habia dado.
//
// ── 17/08 · EL LECTOR DEVOLVIA 21 CLAVES Y EL ESCRITOR GUARDA 57 ──────────────
// Ese hueco de 36 columnas era un bug silencioso: el dato se guardaba bien y el
// bot LO VOLVIA A PREGUNTAR en la conversacion siguiente, porque esta respuesta
// no se lo contaba. Medido en la conversacion 215475520917125: el lector se
// llamo a los 4 segundos y devolvio existe:true con nombre, NIF, telefono y
// domicilio, y el bot pidio otra vez la FECHA DE LLEGADA, la NACIONALIDAD y el
// PAIS DE NACIMIENTO, que estaban en Airtable y no en las 21 claves.
//
// LA REGLA QUE SALE DE AQUI: un campo nuevo son CINCO sitios, no cuatro. La
// tool, el validador, el mapeo del Upser, el prompt Y ESTE NODO. Si falta el
// quinto no falla nada: el bot repite la pregunta y parece tonto.
//
// DOS COSAS QUE NO SE DEVUELVEN A PROPOSITO:
//   - last_idem_key: es la huella de deduplicacion del escritor. Al agente no le
//     sirve de nada y ocupa contexto.
//   - Las URLs de los adjuntos: las URLs firmadas de Airtable CADUCAN EL MISMO
//     DIA (medido: una de las 10:26 estaba muerta a las 14:00), asi que devolver
//     un enlace roto es peor que no devolverlo. Va un booleano por documento,
//     que es lo unico que el agente necesita: saber si lo tiene que pedir o no.
const encontradas = $input.all()
  .map(i => i.json || {})
  .filter(x => typeof x.id === 'string' && x.id.startsWith('rec'));
const nFilas = encontradas.length;
const raw = encontradas[0] || {};

const f = raw.fields ? raw.fields : raw;
const recordId = raw.id || null;
if (!recordId) { return [{ json: { ok: true, existe: false, duplicado: false, filas: 0, user_id: userId, record_id: null, expediente: null } }]; }

function txt(v) { if (v === undefined || v === null || v === '') { return null; } if (typeof v === 'object' && v.name !== undefined) { return String(v.name); } return String(v); }
function bool(v) { return v === true; }
function fecha(v) { if (v === undefined || v === null || v === '') { return null; } return String(v).slice(0, 10); }

// Un multipleSelects llega como array, y cada elemento puede ser una cadena o un
// objeto {id,name,color}. Con txt() saldria '[object Object]' SIN FALLAR, que es
// justo la clase de error que este proyecto ya ha pagado antes.
function lista(v) {
  if (!Array.isArray(v) || v.length === 0) { return []; }
  return v.map(function (x) { return (x && typeof x === 'object' && x.name !== undefined) ? String(x.name) : String(x); });
}

// Un numero de Airtable puede llegar como 0, y 0 es un valor valido: no se puede
// usar el truco de `v || null` porque convertiria el 0 en null.
function num(v) { if (v === undefined || v === null || v === '') { return null; } const n = Number(v); return isNaN(n) ? null : n; }

// Un adjunto de Airtable es un array de objetos. Vacio o ausente = no lo tiene.
function tiene(v) { return Array.isArray(v) && v.length > 0; }

// Una celda de formula o de IA puede venir en error: {state:'error', ...}. Si no
// se comprueba, txt() devuelve '[object Object]' y el agente se lo cree.
function enError(v) { return !!(v && typeof v === 'object' && !Array.isArray(v) && v.state === 'error'); }
function txtSeguro(v) { return enError(v) ? null : txt(v); }

const expediente = {
  // ── Las 21 de siempre, con LOS MISMOS NOMBRES DE CLAVE. No se renombra
  // ninguna: el agente ya sabe leerlas y renombrar seria una regresion gratis.
  UserId: txt(f.UserId),
  email: txt(f.email),
  nombre: txt(f['Nombre empleado']),
  apellidos: txt(f['Apellidos empleado']),
  nif: txt(f.NIF),
  telefono: txt(f.NumeroTelefono),
  fecha_nacimiento: fecha(f.FechaNacimiento),
  tipo_via: txt(f['Tipo de vía / Type of road']),
  calle: txt(f['Nombre de la calle / Name of street']),
  numero: txt(f['Número de tu domicilio / House Number']),
  planta: txt(f.Planta),
  puerta: txt(f.Puerta),
  codigo_postal: txt(f['Codigo Postal']),
  alta_ss: bool(f.alta_ss),
  fecha_alta_ss: fecha(f.fecha_alta_ss),
  Descarte: txt(f.Descarte),
  lead_potencial: bool(f.lead_potencial),
  fecha_prevista_alta: fecha(f.fecha_prevista_alta),
  fecha_limite_plazo: fecha(f.fecha_limite_plazo),
  Status: txt(f.Status),
  intercom_conversation_id: txt(f.intercom_conversation_id),

  // ── Identidad que faltaba ────────────────────────────────────────────────────
  // Los dos apellidos separados EXISTEN ADEMAS de 'apellidos' juntos, porque el
  // fichero .030 escribe el mismo dato de las dos formas. No es duplicado.
  apellido_primero: txt(f.ApellidoPrimero),
  apellido_segundo: txt(f.ApellidoSegundo),
  pasaporte_numero: txt(f.PasaporteNumero),
  sexo: txt(f.Sexo),
  nacionalidad: txt(f.Nacionalidad),
  pais_nacimiento: txt(f.PaisNacimiento),
  provincia_nacimiento: txt(f['Provincia de Nacimiento / Province of Birth']),
  municipio_nacimiento: txt(f['Municipio de Nacimiento / Birth Municipality']),
  ultimo_pais_residencia: txt(f.UltimoPaisResidencia),
  idioma: txt(f.Idioma),

  // ── Domicilio: faltaba el municipio, que es OTRA COSA que el de nacimiento ──
  municipio_residencia: txt(f.MunicipioResidencia),

  // ── Empleo, desplazamiento y plazos ─────────────────────────────────────────
  // fechaDesplazamiento es la que el bot volvio a preguntar el 17/08.
  fecha_desplazamiento: fecha(f.fechaDesplazamiento),
  salario: num(f.Salario),
  empresa: txt(f.Empresa),
  tipo_beckham: txt(f.TipoBeckham),
  discrepancia_fecha_alta: txt(f.DiscrepanciaFechaAlta),

  // ── Perfil y patrimonio ─────────────────────────────────────────────────────
  estado_civil: txt(f.estadoCivil),
  hijos: txt(f.hijos),
  propiedades: txt(f.Propiedades),
  inversiones: txt(f.Inversiones),
  conyuge_quiere_acogerse: bool(f.ConyugeQuiereAcogerse),

  // ── Enrutado y cierre. Con esto el agente sabe si el caso YA se cerro, por
  // que, y si hay una llamada agendada: sin ello vuelve a enrutar desde cero.
  aplica_beckham: bool(f.AplicaBeckham),
  motivo_cierre: txt(f.MotivoCierre),
  senales_complejidad: lista(f.SenalesComplejidad),
  fecha_llamada: fecha(f.FechaLlamada),

  // ── El resumen que el propio bot escribio. Es lo que mas continuidad da: de
  // un golpe sabe todo el caso en sus propias palabras.
  resumen: txtSeguro(f.ResumenBot),

  // ── Documentos: booleanos, NUNCA URLs (caducan el mismo dia) ────────────────
  documentos: {
    dni: tiene(f.DNI),
    pasaporte: tiene(f.Pasaporte),
    contrato_trabajo: tiene(f.Contratotrabajo),
    justificante_alta_ss: tiene(f.AltaSeguridadSocial),
    autorizacion_empleado: tiene(f.AutorizacionEmpleado),
    autorizacion_empresa: tiene(f.AutorizacionEmpresa),
    certificado_enisa: tiene(f.CertificadoEnisa),
    apostilla: tiene(f.Apostilla),
    visado: tiene(f.Visado)
  }
};

return [{ json: { ok: true, existe: true, duplicado: nFilas > 1, filas: nFilas, user_id: userId, record_id: recordId, expediente: expediente } }];
