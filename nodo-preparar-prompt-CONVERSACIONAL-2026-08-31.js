// Preparar_Prompt · v4 CONVERSACIONAL · 31/08/2026
// Nodo del workflow beckham_bot_conversacional (proyecto personal).
// NO es el de beckham_bot: ese sigue en v3 y NO SE TOCA.
//
// ── QUE CAMBIA RESPECTO AL v3, Y POR QUE ──────────────────────────────────────
// El v3 leia CUATRO custom attributes de la conversacion de Intercom
// (veredicto_f2, fecha_limite_f2, dias_pasados_f2, fecha_alta_ss_f2). Los
// escribia el Data Connector `beckham_f2_plazo` del Custom Bot. Con el diseno
// conversacional el canvas desaparece y NADIE los escribe: leerlos devolveria
// undefined en cada turno, para siempre y sin fallar.
//
// DECISION (31/08): EL NODO DEJA DE LEERLOS. Los tres motivos, por orden de peso:
//   1. El plazo NO es un dato, es una FUNCION de (fecha_alta_ss, hoy). Un atributo
//      guardado se pudre solo: `dias_pasados` cambia cada dia sin que nadie
//      escriba nada, y `en_plazo` se convierte en `fuera_plazo` a medianoche. El
//      unico valor correcto es el recalculado en el turno.
//   2. Ya existe UN sitio que implementa la regla de los 6 meses: el workflow
//      `beckham_f2_plazo` (wdOOF0ecCkgFOUjt). Ahora entra como tool
//      `calcular_plazo`. Escribir aqui una segunda implementacion seria dos
//      fuentes para la misma regla, que es la clase de fallo que este proyecto ya
//      ha pagado dos veces.
//   3. Lo que SI hay que persistir entre sesiones ya se persiste, y en Airtable:
//      `fecha_alta_ss` y `fecha_limite_plazo` son columnas que el escritor mapea.
//      Escribir ademas custom attributes en Intercom seria un segundo almacen del
//      mismo dato, con una superficie de escritura nueva por turno.
// Consecuencia asumida: el veredicto NO viaja en el prompt. Lo trae la respuesta
// de la tool dentro del turno. Este nodo se limita a decirselo al agente.
//
// Ademas:
//   · Mueren `body.nombre_apellidos` y `body.telefono`: los ponia el Data
//     Connector. Airtable los cubre en cuanto el cliente los diga.
//   · Sobrevive el email: sale de `conv0.user_email`, que es
//     `conv.source.author.email` y sigue llegando.
//   · `cold` ya NO es "no hay texto". Ver el bloque ARRANQUE mas abajo.
//
// ── REGLAS DEL PROYECTO QUE ESTE NODO CUMPLE ──────────────────────────────────
// `.first()` y NUNCA `.item`: en un nodo de codigo el `.item` cuelga el task
// runner hasta el timeout.
// No se usa `$json` porque el predecesor inmediato es el nodo de Airtable, no
// `Formatear_conversacion1`: los datos de la conversacion se leen explicitamente.

const conv0 = $('Formatear_conversacion1').first().json || {};
const body = $('Webhook1').first().json.body || {};

// La fila de Airtable. Con alwaysOutputData puede llegar {} o sin `fields`.
const filaCruda = $('Leer_Expediente_Para_Prompt').all()
  .map(function (i) { return i.json || {}; })
  .filter(function (x) { return typeof x.id === 'string' && x.id.startsWith('rec'); });
const nFilas = filaCruda.length;
const fila = filaCruda[0] || {};
const e = fila.fields ? fila.fields : {};
const existe = typeof fila.id === 'string' && fila.id.startsWith('rec');

// ── ARRANQUE EN FRIO vs MENSAJE QUE NO HA LLEGADO ─────────────────────────────
// En el v3 `cold = sin texto`, y con el canvas eso solo pasaba una vez: al saltar
// del Custom Bot al agente. Aqui NO. `Formatear_conversacion1` cae a
// `body.message` cuando no encuentra mensajes de usuario pendientes (su linea
// 234); si el trigger nuevo de Intercom no manda una clave llamada `message`, el
// texto sale vacio EN CUALQUIER TURNO, y con la regla vieja el bot se volveria a
// presentar en mitad de la conversacion.
// Asi que se separan los dos casos con el historial, que es el dato que los
// distingue: sin historial de usuario es la primera vez; con historial es un
// mensaje que no nos ha llegado, y ahi el bot NO se presenta: pide que lo repita.
//
// 02/09 · EL DC MANDA EN `message` TEXTO DEL PROPIO CANVAS, NO DEL CLIENTE.
// `{{last_conversation_part.body}}` coge la ULTIMA parte del hilo, y en la entrada
// por clic esa parte es lo que acaba de escribir el canvas. Medido dos veces:
//   · 01/09, ejecucion 8159910: message = la bienvenida bilingue del paso A, y
//     conversationPartId == First Message ID (era la primera parte del hilo).
//   · 02/09, ejecucion 8160900, ya con el canvas de dos botones (A -> B/C -> D):
//     message = '🇪🇸 Perfecto, seguimos en español.', y conversationPartId
//     53026457386 != First Message ID 3929836526, porque ahora hay TRES partes
//     antes (bienvenida, boton del cliente, confirmacion). O sea que la regla
//     «misma parte que la primera» del 01/09 sola YA NO SIRVE.
// Con `cold=false` el agente contestaba a su propio texto: una vez con el pitch
// entero, otra preguntando el idioma que el cliente acababa de pulsar.
// Lo que SI es fijo es el texto de B y C del canvas, y lleva el IDIOMA dentro:
// es la unica fuente determinista del idioma desde que el canvas lo elige con
// botones (decision del 28/08: el idioma lo declara la rama, no el LLM).
const raw = conv0.last_message_content;
const sinTexto = !raw || String(raw).trim() === '';
const historialCrudo = typeof conv0.chat_history === 'string' ? conv0.chat_history : '';

// Quita banderas, emojis, la barra de «🇬🇧/🇺🇸» y espacios repetidos, para comparar
// solo las palabras. `\u{FE0F}` es el selector de variante que acompaña a algunos emojis.
const soloPalabras = function (t) {
  return String(t || '')
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\/]/gu, ' ')
    .replace(/[’`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};
const mensajePlano = soloPalabras(raw);

// Los dos textos de confirmacion del canvas (pasos B y C), anclados entero: si
// alguien cambia esa frase en Intercom, esto deja de casar y se vuelve al
// comportamiento de hoy (cold=false), que es ruidoso y se ve en la ejecucion.
const CONFIRMACION_CANVAS = [
  { idioma: 'Español', re: /^perfecto,? seguimos en espa[nñ]ol\.?$/i },
  { idioma: 'Ingles',  re: /^perfect,? let'?s continue in english\.?$/i }
];
const confirmacion = CONFIRMACION_CANVAS.find(function (x) { return x.re.test(mensajePlano); }) || null;

// La bienvenida bilingue del paso A (el caso del 01/09): las dos frases de
// presentacion a la vez solo las escribe el canvas, nunca un cliente.
const esBienvenidaCanvas = /soy el mobility bot/i.test(mensajePlano) && /mobility team bot/i.test(mensajePlano);

// La ultima linea del historial es del agente y dice lo mismo que `message`: es
// nuestro propio texto rebotado. Red de seguridad para el dia en que cambien los
// textos del canvas y las dos reglas de arriba dejen de casar.
const lineasHist = historialCrudo.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
const ultimaLinea = lineasHist.length ? lineasHist[lineasHist.length - 1] : '';
const ultimaEsDelAgente = /^Agente:/.test(ultimaLinea);
const rebotado = ultimaEsDelAgente && mensajePlano !== '' && soloPalabras(ultimaLinea.replace(/^Agente:\s*/, '')) === mensajePlano;

// La regla del 01/09, que sigue valiendo para un canvas de un solo paso.
const partId = body.conversationPartId !== undefined && body.conversationPartId !== null ? String(body.conversationPartId) : '';
const firstId = body['First Message ID'] !== undefined && body['First Message ID'] !== null ? String(body['First Message ID']) : '';
const esPrimeraParte = partId !== '' && firstId !== '' && partId === firstId;

const textoDelCanvas = !!confirmacion || esBienvenidaCanvas || rebotado || esPrimeraParte;

// Turnos REALES del cliente: las lineas `Usuario:` que NO son el boton del idioma.
// Pulsar «🇪🇸 Español» o «🇬🇧/🇺🇸 English» cuenta como parte en Intercom, pero el
// cliente todavia no ha dicho nada, y con la regla vieja eso ya era «hay turno».
const ES_BOTON_IDIOMA = /^(espa[nñ]ol|english)$/i;
const lineasUsuario = lineasHist
  .filter(function (l) { return /^Usuario:/.test(l); })
  .map(function (l) { return soloPalabras(l.replace(/^Usuario:\s*/, '')); });
const turnosReales = lineasUsuario.filter(function (t) { return t !== '' && !ES_BOTON_IDIOMA.test(t); }).length;
const botonHistorial = lineasUsuario.filter(function (t) { return ES_BOTON_IDIOMA.test(t); }).pop() || '';

// El idioma que el cliente ha ELEGIDO con el boton: primero la confirmacion de B/C,
// y si no casa, el propio boton en el historial. Si no hay ninguno, null y el
// agente pregunta D0 como hasta ahora.
const idiomaCanvas = confirmacion
  ? confirmacion.idioma
  : (/^espa/i.test(botonHistorial) ? 'Español' : (/^english$/i.test(botonHistorial) ? 'Ingles' : null));

const cold = (sinTexto || textoDelCanvas) && turnosReales === 0;
const mensajePerdido = sinTexto && turnosReales > 0;

// ── FRENO DE COSTE Y ENMASCARADO PARCIAL ──────────────────────────────────────
// 31/08 · LO QUE SE RESCATA DEL SIDECAR DEL FAQ Y LO QUE NO. La auditoria dijo que
// al no copiar el sidecar se perdian su enmascarado de PII y su tope de longitud, y
// las dos mitades no se resuelven igual:
//
// EL TOPE SE RESCATA Y SE AMPLIA A DOS. Aqui es MAS necesario que en el sidecar, no
// menos: el disenno conversacional le deja preguntar lo que quiera antes de los
// filtros, asi que `chat_history` crece sin techo y viaja ENTERO en cada turno. Sin
// tope, el coste del turno N crece con N y el que paga la cuenta somos nosotros.
// Y no se puede RECHAZAR como en el FAQ (alli un mensaje largo se contesta con
// «resumelo»): en mitad de un intake, cortarle el turno pierde el dato. Asi que se
// RECORTA y se marca, que es distinto.
//   · el mensaje del turno se recorta por la CABEZA (se queda el principio: quien
//     escribe una parrafada pone el dato al principio y la divagacion despues)
//   · el historial se recorta por la COLA (se quedan los turnos RECIENTES: los
//     antiguos ya estan volcados en Airtable y llegan por «DATOS QUE YA CONOCEMOS»,
//     que es la via determinista; el historial solo aporta el hilo inmediato)
// Recortar el historial por la cabeza seria el fallo tipico: dejaria la
// presentacion del bot y se comeria las tres ultimas respuestas del cliente.
//
// EL ENMASCARADO NO SE RESCATA ENTERO, Y ESTO ES UNA DECISION, NO UN OLVIDO.
// El sidecar enmascaraba email, NIF y telefono porque el FAQ es la puerta anonima
// del embudo y no necesita ni un dato. AQUI ES AL CONTRARIO: el NIF y el email SON
// el contrato — `guardar_datos_cliente` los tiene entre sus 40 parametros y el .030
// aborta sin NIF. Enmascararlos le mandaria al agente `[NIF]`, y el agente
// guardaria `[NIF]` o volveria a preguntarlo en bucle. Seria el sintoma peor del
// proyecto provocado por una «mejora» de seguridad.
// Se enmascara SOLO lo que el contrato NUNCA acepta, y de eso hay uno: el IBAN.
// Comprobado antes de decidirlo — `iban` sale CERO veces como campo en el validador
// de 76.156 car y cero en el prompt v15 (los aciertos de `grep -i iban` son
// 'LIBANO', 'libanes' y 'recibaN'). O sea que un numero de cuenta pegado en el chat
// no tiene a donde ir: no se guarda, no se pregunta y no se usa. Va al modelo y al
// log de la ejecucion y ahi se queda para siempre. Ese si se tapa.
// SI ALGUN DIA EL CONTRATO ACEPTA UN IBAN, hay que quitar este patron en el mismo
// movimiento, o el dato llegara enmascarado y nadie sabra por que.
const TOPE_MENSAJE = 4000;
const TOPE_HISTORIAL = 24000;
const MARCA_MENSAJE = '\n[... mensaje recortado por longitud: el cliente escribio mas de lo que cabe en un turno ...]';
const MARCA_HISTORIAL = '[... turnos antiguos recortados por longitud. Lo que el cliente conto antes esta en «DATOS QUE YA CONOCEMOS» ...]\n';

// El patron del IBAN es el del v4 VERBATIM. No se toca sin volver a pasar la puerta:
// exige DOS letras y DOS digitos al principio, y eso es lo que lo hace seguro aqui —
// un NIF ('X1234567L', '12345678Z') no lo cumple, ni un telefono, ni una fecha, ni
// un importe. Ese es el motivo de que se pueda dejar suelto sin comerse el contrato.
const PATRONES_PII = [
  ['iban', /\b[A-Za-z]{2}[0-9]{2}(?:[ -]?[A-Za-z0-9]{4}){3,6}(?:[ -]?[A-Za-z0-9]{1,4})?\b/g, '[IBAN]']
];

// Contadores. Guardan CUANTOS, nunca QUE: el valor enmascarado no puede volver a
// aparecer en el item ni en el log, o el enmascarado no serviria de nada.
const pii = { iban: 0 };
const recortes = { mensaje: false, historial: false };

function enmascararTexto(v) {
  if (typeof v !== 'string' || v === '') return v;
  let s = v;
  for (const [nombre, re, marca] of PATRONES_PII) {
    s = s.replace(re, function () { pii[nombre] += 1; return marca; });
  }
  return s;
}

// Se recorta ANTES de enmascarar. Al reves, el trabajo de enmascarar el trozo que
// se va a tirar se paga igual, y un IBAN cortado a la mitad por el recorte dejaria
// de encajar en el patron y pasaria como resto reconocible.
function porLaCabeza(s, tope, marca, clave) {
  if (typeof s !== 'string' || s.length <= tope) return s;
  recortes[clave] = true;
  return s.slice(0, tope) + marca;
}
function porLaCola(s, tope, marca, clave) {
  if (typeof s !== 'string' || s.length <= tope) return s;
  recortes[clave] = true;
  return marca + s.slice(s.length - tope);
}

// dato() RECHAZA CUALQUIER OBJETO a proposito. Una celda de texto de Airtable nunca
// es un objeto: si llega uno, es un singleSelect (va por sel()), un adjunto (va por
// tiene()) o UNA CELDA EN ERROR, del tipo {state:'error', errorType:'emptyDependency'}
// que devuelven las columnas de IA y de formula cuando les falta una dependencia.
// Sin esta guarda, String() de eso escribe '[object Object]' EN EL PROMPT y el agente
// se lo cree y se lo dice al cliente.
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

// Las fechas de Airtable llegan en ISO y el RESUMEN del prompt las escribe en
// DD/MM/AAAA. Se traducen aqui para que el agente no reformatee nada al hablar.
// (En el v3 este comentario hablaba de `fecha_alta_ss_f2`, que ya no existe.)
const fechaEs = (v) => {
  const s = dato(v);
  if (!s) return null;
  const m = String(s).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : s;
};

// ── Los datos, por grupos y en el orden en que el bot los pregunta ────────────
const nombreAirtable = [dato(e['Nombre empleado']), dato(e['Apellidos empleado'])].filter(Boolean).join(' ');

const pares = [
  ['Nombre', nombreAirtable],
  ['Email', dato(e.email) || dato(body.user_email) || dato(conv0.user_email)],
  ['Telefono', dato(e.NumeroTelefono)],
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
  ['Fecha de alta en la Seguridad Social', fechaEs(e.fecha_alta_ss)],
  ['Fecha limite para solicitar (calculada en una sesion anterior)', fechaEs(e.fecha_limite_plazo)],
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
// un expediente que ya estaba cerrado.
const decidido = [];
if (sel(e.Status)) decidido.push('- Estado del expediente: ' + sel(e.Status));
if (sel(e.MotivoCierre)) decidido.push('- Ya se cerro una conversacion anterior por: ' + sel(e.MotivoCierre));
if (multi(e.SenalesComplejidad)) decidido.push('- El caso ya se enruto como COMPLEJO por: ' + multi(e.SenalesComplejidad));
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

// ── EL BLOQUE QUE SUSTITUYE A `veredicto_f2` ──────────────────────────────────
// Este bloque es OBLIGATORIO y va SIEMPRE, exista fila o no. Es lo que impide que
// el agente se invente el plazo o se lo salte porque en «DATOS QUE YA CONOCEMOS»
// aparezca una fecha limite vieja. La fecha limite guardada es informativa: la
// buena es la que devuelve la tool hoy.
trozos.push('');
trozos.push('--- EL PLAZO NO LO CALCULAS TU ---');
trozos.push('Nadie ha filtrado a este cliente antes de que llegaras tu: aqui no hay formulario previo ni bot anterior. Los filtros los haces TU, en esta conversacion.');
trozos.push('Para el plazo de los 6 meses usa SIEMPRE la herramienta calcular_plazo, y usala en el mismo turno en que el cliente te diga la fecha de alta. No cuentes meses de cabeza y no te fies de una fecha limite guardada de otro dia: hoy puede estar ya vencida.');
trozos.push('Le pasas la fecha TAL CUAL la haya escrito el cliente, sin reformatearla: la herramienta entiende 01/06/2026, 2026-06-01, 1/6/26 y «1 de junio de 2026».');
trozos.push('Te devuelve veredicto (en_plazo, fuera_plazo o no_valida), fecha_limite y dias_pasados. Si veredicto es no_valida es que la fecha no se entiende: pidesela otra vez con un ejemplo. Si la herramienta no contesta o el veredicto viene vacio, NO repreguntes: es un fallo nuestro, discúlpate y ofrece support@taxdown.es.');

// WP-205b: dos filas con el mismo UserId y el escritor DEJA DE GUARDAR. El agente
// tiene que saberlo para no prometerle al cliente que se ha guardado nada.
if (nFilas > 1) {
  trozos.push('');
  trozos.push('--- AVISO TECNICO ---');
  trozos.push('Hay MAS DE UNA ficha con este identificador, asi que ahora mismo NO se puede guardar nada. No le prometas al cliente que has guardado sus datos y ofrece support@taxdown.es.');
}

trozos.push('');
trozos.push('Situacion: ' + (cold
  ? (idiomaCanvas
    ? 'primer turno, el cliente solo ha pulsado el boton del idioma (' + idiomaCanvas + ') y todavia no ha escrito nada'
    : 'primer turno, el usuario todavia no ha escrito nada')
  : (mensajePerdido
    ? 'conversacion en curso, pero el texto del ultimo mensaje del cliente NO nos ha llegado'
    : 'conversacion en curso')));

const contexto = trozos.join('\n');

// El historial pasa por los dos filtros ANTES de entrar en el prompt: recortado por
// la cola (turnos recientes) y con los IBAN tapados. `dato()` sigue delante porque
// sigue haciendo su trabajo: rechazar un objeto o una celda en error.
const historial = enmascararTexto(
  porLaCola(dato(conv0.chat_history), TOPE_HISTORIAL, MARCA_HISTORIAL, 'historial')
) || '(sin historial previo)';

// 01/09 · EL AGENTE YA NO SE PRESENTA, Y NO ES UN OLVIDO.
// El paso `A. Seleccion Idioma` del canvas de Intercom manda la bienvenida ANTES de
// pasar el turno aqui, y esa bienvenida ya dice quien es el bot y para que sirve, en
// español y en ingles. Con la instruccion anterior («presentate en una sola frase») el
// cliente recibia DOS presentaciones seguidas: la del canvas y la del agente.
// Se intento quitar el texto del canvas y la UI de Intercom no deja dejar el paso sin
// contenido, asi que el arreglo vive aqui: el agente ARRANCA POR LA PRIMERA PREGUNTA.
// SI ALGUN DIA SE QUITA LA BIENVENIDA DEL CANVAS, hay que devolver aqui la linea de
// presentarse, o el cliente se encontrara una pregunta a secas sin saber con quien habla.
//
// 02/09 · Y LA PRIMERA PREGUNTA YA NO ES EL IDIOMA CUANDO EL CANVAS LO HA ELEGIDO.
// Con los dos botones de A, D0 llega RESPONDIDA: preguntarla otra vez es el bucle que
// el propio prompt v15 llama «el peor fallo que puedes cometer aqui». Asi que hay dos
// arranques: con idioma (se salta D0, se guarda el idioma y se va a la apertura del
// BLOQUE 0 en ese idioma) y sin idioma (el de siempre: D0).
const NOMBRE_IDIOMA = { 'Español': 'español', 'Ingles': 'inglés' };
const instruccionArranque = (idiomaCanvas
  ? [
    '[ARRANQUE_EN_FRIO]',
    'El cliente todavia no ha escrito ningun mensaje en este hilo: lo unico que ha hecho es pulsar el boton del idioma.',
    'IDIOMA YA ELEGIDO: ' + idiomaCanvas + '. La pregunta D0 esta RESPONDIDA: NO la hagas y NO mandes los dos mensajes del idioma. Toda la conversacion va en ' + NOMBRE_IDIOMA[idiomaCanvas] + '.',
    'Guardalo de inmediato con guardar_datos_cliente, parametro idioma = ' + idiomaCanvas + '.',
    'YA SE LE HA SALUDADO: justo antes de este turno se le ha mandado la bienvenida, que ya dice quien eres y para que sirve esto, en español y en ingles.',
    'Por eso NO te presentes, NO le saludes y NO repitas para que sirve esto: seria el segundo saludo seguido y queda mal.',
    'Empieza DIRECTAMENTE por la apertura del BLOQUE 0 en ' + NOMBRE_IDIOMA[idiomaCanvas] + ': el texto aprobado y las cuatro opciones de arranque, sin el «¡Hola!» del principio, que ya lo ha dado el canvas.',
    'No repitas preguntas ya respondidas en el historial ni pidas datos que ya conocemos.'
  ]
  : [
    '[ARRANQUE_EN_FRIO]',
    'El usuario todavia no ha escrito ningun mensaje en este hilo.',
    'YA SE LE HA SALUDADO: justo antes de este turno se le ha mandado la bienvenida, que ya dice quien eres y para que sirve esto, en español y en ingles.',
    'Por eso NO te presentes, NO le saludes y NO repitas para que sirve esto: seria el segundo saludo seguido y queda mal.',
    'Empieza DIRECTAMENTE por la primera pregunta del recorrido, que es el idioma de atencion (D0). Una sola pregunta, sin preambulo y sin repetir la bienvenida.',
    'No repitas preguntas ya respondidas en el historial ni pidas datos que ya conocemos.'
  ]).join('\n');

// El caso nuevo del diseno conversacional: hay historial pero el texto del turno
// no ha llegado. Presentarse aqui seria el fallo visible.
const instruccionMensajePerdido = [
  '[MENSAJE_NO_RECIBIDO]',
  'El cliente ha escrito algo pero el texto no nos ha llegado por un fallo tecnico.',
  'NO te presentes y NO empieces de cero: la conversacion ya esta en marcha.',
  'Dile en una linea que no te ha llegado su ultimo mensaje y pidele que lo repita.'
].join('\n');

// El texto del cliente, recortado por la cabeza y con los IBAN tapados. Las dos
// ramas de arriba son texto NUESTRO y no pasan por aqui: no hay nada que tapar y
// recortarlas seria recortar nuestras propias instrucciones.
const mensajeLimpio = enmascararTexto(
  porLaCabeza(String(raw), TOPE_MENSAJE, MARCA_MENSAJE, 'mensaje')
);

const turno = cold
  ? instruccionArranque
  : (mensajePerdido ? instruccionMensajePerdido : mensajeLimpio);

const prompt = [
  turno,
  '',
  '--- HISTORIAL DE LA CONVERSACION ---',
  historial
].join('\n');

// Se devuelve conv0 entero y no $json, porque los nodos de despues siguen
// esperando last_message_content, attachments_list y files_analysis_blocks.
// `idioma_canvas` y `_arranque` dicen POR QUE se ha decidido el arranque: si un dia el
// agente vuelve a contestarse a si mismo, ahi se ve cual de las cuatro reglas fallo.
// `_pii` y `_recortes` salen para que se vean en la ejecucion: un turno con
// `_recortes.historial=true` es la senal de que la conversacion se esta yendo de
// largo, y `_pii.iban>0` de que alguien esta pegando datos bancarios en el chat.
return { json: { ...conv0, prompt, contexto, cold_start: cold, mensaje_perdido: mensajePerdido, idioma_canvas: idiomaCanvas, _arranque: { sin_texto: sinTexto, confirmacion_canvas: !!confirmacion, bienvenida_canvas: esBienvenidaCanvas, rebotado: rebotado, primera_parte: esPrimeraParte, turnos_reales: turnosReales }, _pii: pii, _recortes: recortes, _expediente_existe: existe, _expediente_filas: nFilas, _expediente_record_id: fila.id || null } };
