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
// 26/08/2026 · LA ESCALERA SE RENUMERO Y ESTE MAPA ES EL CONTRATO.
// Iciar inserto '2. Pte agendar llamada' en la posicion 2 y Airtable renumero
// TODO lo de detras conservando los MISMOS ids de opcion. Los nombres de aqui
// estan COPIADOS DEL SCHEMA VIVO, uno a uno, incluidas sus rarezas:
// '11.Pendiente resolución' NO lleva espacio detras del punto.
//
// POR QUE ESTO VA POR NOMBRE Y NO POR ID, que seria mas robusto: no se puede.
// El nodo de Airtable escribe el singleSelect por nombre, y el filterByFormula
// de los dos generadores solo ve el nombre -- una formula sobre un singleSelect
// NO da acceso al id de la opcion. Asi que renombrar un peldano es un CAMBIO DE
// CONTRATO entre cinco sitios, no un retoque cosmetico.
const ORDEN = {
  '1. Interesado': 1,
  '2. Pte agendar llamada': 2,
  '3. Pendiente llamada TD': 3,
  '4. Pte hacer informe': 4,
  '5. Informe enviado': 5,
  '6. Pte formulario usuario': 6,
  '7. Pte hacer TD': 7,
  '8. Pte confirmación usuario': 8,
  '9. Confirmado': 9,
  '10. Finalizado': 10,
  '11.Pendiente resolución': 11,
  '12. Concedido': 12,
  '13. Descartado': 13
};

// ── 11/08 · WP-238 · El Status depende de COMO se cierra, no solo de que quiera ─
// ANTES: AplicaBeckham===true daba SIEMPRE '3. Pendiente llamada TD'. Un
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

// ── 21/08 · EL PELDANO 2 LLEGA AL OFRECER LA LLAMADA, NO AL CONFIRMARLA ────────
// Decision del usuario del 21/08/2026, tomada con la conversacion 3 delante.
//
// ANTES el 2 exigia motivo_cierre='Llamada agendada', y ese motivo el prompt solo
// lo manda si el cliente confirma DOS cosas mas: que ya ha reservado en Calendly y
// que no le queda ninguna duda. O sea que la cola del fiscal dependia de que el
// cliente contestase dos veces mas. Medido en la conversacion 215475580835251
// (52.000 euros, caso al limite): el bot dio el enlace, el cliente no contesto, y
// la fila se quedo en '1. Interesado' -- un caso que necesita llamada y que el
// fiscal NO VE. AplicaBeckham tampoco salva esto: un caso complejo no lo marca
// nunca a proposito (WP-238).
//
// AHORA basta con que el caso TENGA SENALES DE COMPLEJIDAD: tener senales es, por
// definicion, "hay que llamar". Llegan en la misma llamada que el salario, asi que
// NO hace falta ningun campo nuevo -- y esto importa, porque un campo nuevo son
// cinco sitios y aqui no hacia falta ninguno.
//
// EFECTO QUE HAY QUE CONOCER: el 2 se escribe en cuanto el cliente dice un salario
// al limite, o sea A MITAD de la conversacion, no al final. El fiscal vera en su
// cola casos todavia incompletos. Es deliberado: es mejor que ver de menos.
// La escalera sigue subiendo sola, asi que un caso que luego se complete pasa al 3
// sin que nadie tenga que bajarlo del 2.
function leerMulti(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map(function (x) {
      return (x && typeof x === 'object' && x.name !== undefined) ? String(x.name) : String(x);
    })
    .filter(function (s) { return s !== ''; });
}
// Lo que llega en ESTA llamada manda; si no trae senales, se mira lo que ya hay en
// la fila, porque el bot guarda de forma INCREMENTAL y las senales pueden haberse
// escrito en un turno anterior. Es el mismo criterio que se usa con MotivoCierre.
const senalesEnviadas = leerMulti(fields.SenalesComplejidad);
const senales = senalesEnviadas.length ? senalesEnviadas : leerMulti(crudo.SenalesComplejidad);
const requiereLlamada = senales.length > 0;

let propuesto;
if (fields.Descarte) {
  propuesto = '13. Descartado';
} else if (motivoCierre === 'Expediente completo') {
  // 19/08/2026 · LA ESCALERA VUELVE A PASAR POR EL 3, por decision del usuario.
  // El 17/08 aqui se escribia el peldano de 'Informe enviado' porque los dos generadores
  // filtraban SOLO por ese peldano y con el 3 no arrancaban jamas. Ahora cada
  // peldano significa lo que dice su nombre y el reparto es este:
  //   3 = expediente cerrado y el informe PENDIENTE de hacer -> lo escribe el bot,
  //       aqui mismo.
  //   4 = el informe YA esta hecho y subido a la fila        -> lo escribe el nodo
  //       'Marcar InformeListo' de beckham_informe_mobility.
  // Y los dos generadores filtran ahora OR(Status=3, Status=4), asi que da igual
  // cual de los dos schedule llegue primero y un .030 que haya fallado puede
  // reintentar en el tick siguiente.
  //
  // SI SE VUELVE A TOCAR ESTO SON CINCO SITIOS, NO UNO: esta linea, el filtro de
  // 'Buscar filas pendientes' de beckham_generar_030, el mismo filtro de
  // beckham_informe_mobility, el nodo 'Marcar InformeListo' y la automatizacion
  // 3b de Airtable -- que hasta el 19/08 metia el 3 en su rama 'Status del 1 al 6
  // o vacio' y por eso una fila marcada con EnviarBorradores se escapaba de la
  // ventana antes de que el tick de 15 minutos generase el informe. Fue justo lo
  // que paso el 18/08 con recIvWrCD6PcsE10p: peldano 4 a las 11:02:25, .030
  // generado a mano a las 11:02:50, y el tick del informe de las 11:15:41 ya no
  // encontro la fila.
  propuesto = '4. Pte hacer informe';
} else if (motivoCierre === 'Llamada agendada' || fields.AplicaBeckham === true || requiereLlamada) {
  propuesto = '3. Pendiente llamada TD';
} else {
  propuesto = '1. Interesado';
}
const nActual = ORDEN[statusActual] || 0;
const nPropuesto = ORDEN[propuesto] || 0;
let escribirStatus = !lecturaFallo && nPropuesto > nActual;

// El descarte solo vale al principio. Si el equipo ya esta trabajando el caso
// (3 o mas), un descarte del bot seria un error suyo, no un dato nuevo.
if (propuesto === '13. Descartado' && nActual > 3) escribirStatus = false;

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
  _dedup: dedup,
  _requiere_llamada: requiereLlamada,
  _senales: senales
} }];
