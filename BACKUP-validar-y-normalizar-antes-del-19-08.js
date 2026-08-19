// ── WP-201 · parseo defensivo del body ────────────────────────────────────────
// El Data Connector de Intercom manda application/x-www-form-urlencoded con el
// JSON entero como ÚNICA CLAVE del body, así que body.user_id sale undefined.
// Verificado en las ejecuciones 8052012 y 8052018 (27/07).
let body = $input.first().json.body || {};

if (body && typeof body === 'object' && !Array.isArray(body) && body.user_id === undefined) {
  const keys = Object.keys(body);
  if (keys.length === 1) {
    const candidatos = [keys[0], keys[0] + '=' + body[keys[0]]];
    for (const c of candidatos) {
      try {
        const parsed = JSON.parse(c);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          body = parsed;
          break;
        }
      } catch (e) {
        // no era JSON: se deja el body tal cual y la validación decidirá
      }
    }
  }
}
// ──────────────────────────────────────────────────────────────────────────────
function toIsoDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  let iso = null;
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) iso = dmy[3] + '-' + dmy[2] + '-' + dmy[1];
  else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) iso = s;
  if (!iso) return null;
  // La fecha tiene que EXISTIR en el calendario, no solo tener el formato bueno.
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7), d = +iso.slice(8, 10);
  const f = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(f) || f.getUTCFullYear() !== y || (f.getUTCMonth() + 1) !== m || f.getUTCDate() !== d) return null;
  return iso + 'T12:00:00.000Z';
}

function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (s === 'true' || s === 'si' || s === 'sí' || s === 'yes' || s === '1') return true;
  if (s === 'false' || s === 'no' || s === '0') return false;
  return null;
}

// ── 3/08 · helpers del contrato ampliado ──────────────────────────────────────
function limpio(v) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/\s+/g, ' ').trim();
}

// NIF: valida la LETRA DE CONTROL, no solo la forma. DNI y NIE.
function nifValido(s) {
  const t = s.toUpperCase().replace(/[\s-]/g, '');
  const m = t.match(/^([XYZ]?)(\d{7,8})([A-Z])$/);
  if (!m) return null;
  let num = m[2];
  if (m[1]) {
    if (num.length !== 7) return null;
    num = String('XYZ'.indexOf(m[1])) + num;
  } else if (num.length !== 8) {
    return null;
  }
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  if (letras[parseInt(num, 10) % 23] !== m[3]) return null;
  return t;
}

// Telefono: los impatriados acaban de llegar a España, MUCHOS TIENEN NUMERO
// EXTRANJERO -> exigir 9 digitos españoles a todos seria un bug.
// OJO AL ORDEN (bug corregido el 3/08 al probar la funcion): si el caso
// extranjero se evalua antes, '+3466175816' casa como internacional y se
// acepta. Un numero marcado como español se juzga SOLO con la regla española.
function telefonoValido(s) {
  const t = s.replace(/[\s().-]/g, '');
  const marcado = t.match(/^(?:\+34|0034)(\d+)$/);
  if (marcado) return /^[6-9]\d{8}$/.test(marcado[1]) ? '+34' + marcado[1] : null;
  if (/^\d{9}$/.test(t)) return /^[6-9]/.test(t) ? '+34' + t : null;
  const m34 = t.match(/^34(\d{9})$/);
  if (m34) return /^[6-9]/.test(m34[1]) ? '+34' + m34[1] : null;
  if (/^\+[1-9]\d{6,14}$/.test(t)) return t;
  return null;
}

// CP: 5 digitos y provincia real (01-52)
function cpValido(s) {
  const t = s.replace(/\s/g, '');
  if (!/^\d{5}$/.test(t)) return null;
  const prov = parseInt(t.slice(0, 2), 10);
  if (prov < 1 || prov > 52) return null;
  return t;
}

// Tipo de via: singleSelect en Airtable -> whitelist obligatoria.
// Leida del esquema real de Airtable el 3/08 (fld0A4dWkZia1yTcw, 93 opciones).
const TIPOS_VIA = ['ACEQUIA','ACERA','ALAMEDA','ALDEA','AMPLIACION','ANGOSTA','APARTADO DE CORREOS',
'APARTAMENTOS','ATAJO','AVENIDA','BAJADA','BARRANCO','BARRIADA','BARRIO','BLOQUES','BULEVAR','CALLE',
'CALLEJA','CALLEJON','CALLEJUELA','CALZADA','CAMINO','CARRERA','CARRETERA','CASERIO','CHALET',
'COLONIA','COOPERATIVA','CORRAL','COSTANILLA','CUESTA','EDIFICIO','ESCALA','ESCALERA','ESCALINATA',
'ESTRADA','GLORIETA','GRUPO','LLANO','LUGAR','MANZANA','MERCADO','MONTAÑA','MUNICIPIO','OTROS',
'PARAJE','PARQUE','PARTICULAR','PARTIDA','PASADIZO','PASAJE','PASEO','PASEO ALTO','PASEO BAJO',
'PASILLO','PASO','PASSEIG','PATIO','PLACETA','PLAZA','PLAZOLETA','PLAZUELA','POBLADO','POLIGONO',
'PORTALES','PRIVADA','PROLONGACION','RAMAL','RAMBLA','RAMPA','RESIDENCIA','RESIDENCIAL','RIBERA',
'RINCON','RINCONADA','RONDA','RÚA','SECTOR','SENDA','SENDERO','SIN DATOS DOMICILIAR','SUBIDA','TORRE',
'TORRENTE','TRANSVERSAL','TRASERA','TRAVESIA','URBANIZACION','VIA','VILLAS','VIVIENDAS','ZONA'];

const ALIAS_VIA = { 'C/':'CALLE','C':'CALLE','CL':'CALLE','AV':'AVENIDA','AVDA':'AVENIDA',
'AVD':'AVENIDA','PZ':'PLAZA','PLZ':'PLAZA','PL':'PLAZA','PS':'PASEO','PSO':'PASEO','CTRA':'CARRETERA',
'CRA':'CARRETERA','CMNO':'CAMINO','TRV':'TRAVESIA','GTA':'GLORIETA','RBLA':'RAMBLA','URB':'URBANIZACION' };

function tipoViaValido(s) {
  let t = s.toUpperCase().replace(/\./g, '').trim();
  if (ALIAS_VIA[t]) t = ALIAS_VIA[t];
  return TIPOS_VIA.indexOf(t) === -1 ? null : t;
}
// ──────────────────────────────────────────────────────────────────────────────

// ── WP-205a · validación de FORMA del UserId ──────────────────────────────────
const userId = body.user_id ? String(body.user_id).trim() : '';

function rechazar(err) {
  return [{ json: {
    _invalid: true,
    error: err,
    _user_id_visto: userId,
    _conversation_id_visto: body.intercom_conversation_id || ''
  } }];
}

const FORMA_USER_ID = /^[a-z]{2}-[a-z]+-\d+:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (userId && !FORMA_USER_ID.test(userId)) {
  return rechazar('user_id_forma_invalida');
}

if (!userId || !body.intercom_conversation_id) {
  return rechazar('user_id_or_conversation_id_missing');
}

const fields = { UserId: userId, intercom_conversation_id: body.intercom_conversation_id };

// Acumula todo lo que llego con valor pero se DESCARTO por invalido.
// Mismas claves de salida que antes -> `¿Fechas descartadas?` y
// `Avisar_Fecha_Invalida` siguen funcionando sin tocarlos.
const descartadas = [];

// 6/08 · SOLO las fechas encienden la alerta de Slack. Desde las tandas A y B
// aqui tambien caen salarios y selects, y sin este flag cada 'no se' del cliente
// mandaria un aviso con la etiqueta equivocada. El agente sigue viendo TODOS los
// descartes por la respuesta del webhook (`Respond OK` devuelve `descartados`).
let hayFechaDescartada = false;

// ── WP-206 · whitelist de `punto` y de `Descarte` ─────────────────────────────
const DESCARTES = [
  'No residente ultimos 5 años',
  'Menos de 55 salario',
  'Alta en SS mas de 6 meses',
  'Otro/Incompleto'
];

const DERIVA = {
  cualifica:              { alta_ss: true },
  lead:                   { alta_ss: false, lead_potencial: true },
  descarte_plazo:         { alta_ss: true, Descarte: 'Alta en SS mas de 6 meses' },
  descarte_residencia:    { Descarte: 'No residente ultimos 5 años' },
  autodescarte_declarado: { Descarte: 'Otro/Incompleto' },
  faq_entrada:            {}
};

const punto = body.punto ? String(body.punto).trim() : '';
if (punto && !Object.prototype.hasOwnProperty.call(DERIVA, punto)) {
  return rechazar('punto_desconocido');
}
if (body.Descarte && DESCARTES.indexOf(String(body.Descarte).trim()) === -1) {
  return rechazar('descarte_desconocido');
}
// ──────────────────────────────────────────────────────────────────────────────

if (body.email) fields.email = String(body.email).trim();

const altaSs = toBool(body.alta_ss);
if (altaSs !== null) fields.alta_ss = altaSs;

const leadPot = toBool(body.lead_potencial);
if (leadPot !== null) fields.lead_potencial = leadPot;

// ── 6/08 · Confirmacion expresa del cliente de que quiere acogerse ─────────────
// Marca el checkbox AplicaBeckham, que es lo que configura el formulario despues.
// OJO CON LO QUE SIGNIFICA: ese checkbox lo leen DOS formulas de clasificacion
// fiscal (Situación fiscal Anio Desplazamiento y AnioSiguiente): marcado = 'Régimen
// Especial (Beckham)', sin marcar = 'Residente Fiscal'. Asi que aqui solo se marca
// con un SI EXPRESO del cliente, nunca por suposicion del agente.
const quiere = toBool(body.quiere_acogerse);
if (quiere !== null) fields.AplicaBeckham = quiere;

// ── 10/08 · El CONYUGE tambien quiere acogerse ─────────────────────────────────
// Hasta hoy el bot preguntaba esto, el cliente contestaba y el dato SE TIRABA
// porque no existia columna. Es una senal para que Mobility contacte al conyuge:
// NO toca AplicaBeckham, que es del cliente del expediente y lo leen las dos
// formulas de clasificacion fiscal.
const conyuge = toBool(body.conyuge_quiere_acogerse);
if (conyuge !== null) fields.ConyugeQuiereAcogerse = conyuge;

if (body.Descarte) fields.Descarte = String(body.Descarte).trim();

if (punto) Object.assign(fields, DERIVA[punto]);

// ── Fechas ────────────────────────────────────────────────────────────────────
function ponerFecha(nombre, valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') return;
  const iso = toIsoDate(valor);
  if (iso) fields[nombre] = iso;
  else { descartadas.push(nombre + '=' + String(valor).trim()); hayFechaDescartada = true; }
}
ponerFecha('fecha_alta_ss', body.fecha_alta_ss);
ponerFecha('fecha_prevista_alta', body.fecha_prevista_alta);
ponerFecha('fecha_limite_plazo', body.fecha_limite_plazo);
ponerFecha('FechaNacimiento', body.fecha_nacimiento);
ponerFecha('fechaDesplazamiento', body.fecha_desplazamiento);
ponerFecha('FechaLlamada', body.fecha_llamada);
// ── 3/08 · campos que recoge el AGENTE hablando ───────────────────────────────
function ponerTexto(columna, valor, max) {
  const v = limpio(valor);
  if (!v) return;
  if (v.length > (max || 100)) { descartadas.push(columna + '=' + v.slice(0, 40) + '…(demasiado largo)'); return; }
  fields[columna] = v;
}
ponerTexto('Nombre empleado', body.nombre, 100);
ponerTexto('Apellidos empleado', body.apellidos, 100);
ponerTexto('Planta', body.planta, 20);
ponerTexto('Puerta', body.puerta, 20);

// ── 6/08 · Tanda A · sin whitelist ────────────────────────────────────────────
ponerTexto('Municipio de Nacimiento / Birth Municipality', body.municipio_nacimiento, 100);
ponerTexto('Provincia de Nacimiento / Province of Birth', body.provincia_nacimiento, 100);

// ── 13/08 · WP-235 · Los tres campos que pide el fichero .030 ─────────────────
// APELLIDOS SEPARADOS: el .030 los quiere en DOS casillas (208 y 209, 50 cada
// una). No se parte 'Apellidos empleado' por el primer espacio porque falla con
// 'GARCIA GONZALEZ' (dos) frente a 'DE LA TORRE' (uno con espacios) o un apellido
// extranjero unico. Lo pregunta el bot.
// Y OJO: 'Apellidos empleado' NO SE SUSTITUYE. En la CABECERA del fichero los dos
// van JUNTOS y en el apartado 2 van SEPARADOS: el mismo dato, dos formas, mismo
// fichero. Hacen falta las tres columnas.
ponerTexto('ApellidoPrimero', body.apellido_primero, 50);
ponerTexto('ApellidoSegundo', body.apellido_segundo, 50);

// MUNICIPIO DE RESIDENCIA, que no es el de nacimiento. Hasta hoy el expediente
// sabia donde NACIO el cliente pero no donde VIVE, y sin eso el 030 no comunica
// el domicilio, que es literalmente su razon de ser.
// La PROVINCIA no necesita campo: son los dos primeros digitos del codigo postal,
// verificado en las cinco muestras del fichero.
ponerTexto('MunicipioResidencia', body.municipio_residencia, 30);

// 6/08 · Salario: la columna de Airtable es NUMERICA (precision 2), no texto.
// Acepta 62000, 62.000, "62.000 €", 62000,50 y 70k. Lo que no parsee cae en descartadas
// y el agente lo vuelve a pedir, igual que las fechas.
function ponerNumero(columna, valor) {
  const bruto = limpio(valor);
  if (!bruto) return;
  let v = bruto.replace(/[€\s]/g, '');
  let mult = 1;
  if (/^[\d.,]+k$/i.test(v)) { mult = 1000; v = v.slice(0, -1); }
  if (v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, '');
  if (!/^\d+(\.\d+)?$/.test(v)) { descartadas.push(columna + '=' + bruto); return; }
  const n = Number(v) * mult;
  if (!isFinite(n) || n < 0 || n > 10000000) { descartadas.push(columna + '=' + bruto); return; }
  fields[columna] = Math.round(n * 100) / 100;
}
ponerNumero('Salario', body.salario);

// ── 6/08 · Tanda B · los 5 selects con whitelist ──────────────────────────────
// REGLA DURA: Airtable tiene typecast:true, asi que un valor fuera de whitelist
// CREARIA una opcion nueva. Aqui nada sale del mapa: lo que no casa se va a
// `descartadas` y el agente lo vuelve a preguntar. Mejor vacio que basura.
function sinAcentos(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function normSel(s) {
  return sinAcentos(limpio(s)).toLowerCase()
    .replace(/[.,;:!¡?¿"'()]/g, ' ').replace(/\s+/g, ' ').trim();
}
// Busca la palabra SUELTA dentro de la frase: "estoy Soltero" casa con "soltero",
// pero "asoltero" o "presoltero" no.
function contienePalabra(txt, palabra) {
  const p = palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp('(^|\\s)' + p + '(\\s|$)').test(txt);
}
// Las claves de 3 letras o menos ('es', 'h', 'f') se comparan SOLO por igualdad:
// si no, "mi idioma es ingles" casaria con 'es' y guardaria Español.
function ponerSelect(columna, valor, reglas, opciones) {
  const bruto = limpio(valor);
  if (!bruto) return;
  const k = normSel(bruto);
  if (!k) return;
  const cfg = opciones || {};
  if (cfg.rechazarSiNiega && /(^|\s)(no|ni|nunca|tampoco)(\s|$)/.test(k)) {
    descartadas.push(columna + '=' + bruto); return;
  }
  for (const regla of reglas) {
    for (const p of regla[1]) {
      const casa = (p instanceof RegExp)
        ? p.test(k)
        : (p.length <= 3 ? k === p : contienePalabra(k, p));
      if (casa) { fields[columna] = regla[0]; return; }
    }
  }
  descartadas.push(columna + '=' + bruto);
}

ponerSelect('Sexo', body.sexo, [
  ['Hombre', ['hombre', 'varon', 'masculino', 'male', 'h']],
  ['Mujer',  ['mujer', 'femenino', 'femenina', 'female', 'f']]
], { rechazarSiNiega: true });

ponerSelect('Idioma', body.idioma, [
  ['Español', ['espanol', 'espanola', 'castellano', 'spanish', 'es', 'esp']],
  ['Ingles',  ['ingles', 'inglesa', 'english', 'en', 'eng']]
], { rechazarSiNiega: true });

// El orden importa: primero las negaciones explicitas, luego lo positivo.
// "no tengo hijos" -> No tiene hijos · "tengo un hijo, no dos" -> Tiene hijos
ponerSelect('hijos', body.hijos, [
  ['No tiene hijos', [/\bno\b[^.]{0,20}\bhijos?\b/, /\bsin hijos?\b/, /\bningun/, 'no', '0', 'cero']],
  ['Tiene hijos',    [/\bhijos?\b/, /(^|\s)si(\s|$)/, /^[1-9]\d*$/,
                      /(^|\s)(un|uno|una|dos|tres|cuatro|cinco|seis|varios|algunos)(\s|$)/]]
]);

ponerSelect('estadoCivil', body.estado_civil, [
  ['soltero',         ['soltero', 'soltera', 'single']],
  ['casado',          ['casado', 'casada', 'married']],
  ['pareja de hecho', ['pareja de hecho', 'pareja', 'union de hecho', 'unión de hecho', 'domestic partner', 'civil partnership']],
  ['divorciado',      ['divorciado', 'divorciada', 'divorced']],
  ['viudo',           ['viudo', 'viuda', 'widowed']]
], { rechazarSiNiega: true });

// De lo mas especifico a lo mas general: un teletrabajador puede decir
// "teletrabajo para una empresa alemana", y con 'empresa' primero se guardaria
// mal como Empresa española.
ponerSelect('TipoBeckham', body.tipo_beckham, [
  ['Teletrabajador internacional', [/teletrabaj/, /nomada/, /desplazad/, /empresa extranjera/,
                                    /empresa de fuera/, /\bextranjera\b/, /otro pais/]],
  ['Autonomo emprendedor',         [/autonom/, /emprendedor/, /enisa/]],
  ['Empresa española',             ['empresa espanola', 'cuenta ajena', /empresa espanola/,
                                    /\bempresa\b/, /contratad/]],
  ['Otro',                         ['otro', 'otros', 'ninguna de las anteriores', /ningun/]]
], { rechazarSiNiega: true });

// ── 6/08 · Tanda B2 · Propiedades e Inversiones ───────────────────────────────
// Las 5 opciones de cada columna se leyeron del esquema DESPUES de que el usuario
// limpiara los espacios parasitos y la errata 'ni el inversiones' (6/08). Van
// literales: con typecast:true cualquier variante crearia una opcion nueva.
// OJO: cada columna tiene DOS opciones que significan lo mismo ('tiene fuera y no
// en España'); se usa la primera y la otra queda sin uso.
ponerSelect('Propiedades', body.propiedades, [
  ['Tiene propiedades en España y en el extranjero',
   ['ambos', 'los dos', /espana y (en )?el extranjero/, /ambos/]],
  ['Tiene propiedades en España y no tiene propiedades en el extranjero',
   ['solo_espana', 'solo espana', /solo en espana/, /unicamente en espana/]],
  ['Tiene propiedades en el extranjero y no tiene propiedades en España',
   ['solo_extranjero', 'solo extranjero', /solo (en )?el extranjero/, /solo fuera/]],
  ['No tiene propiedades en España ni el extranjero',
   ['ninguno', 'ninguna', 'no', /no tiene/, /ningun inmueble/, /sin inmuebles/]]
]);
ponerSelect('Inversiones', body.inversiones, [
  ['Tiene inversiones en España y en el extranjero',
   ['ambos', 'los dos', /espana y (en )?el extranjero/, /ambos/]],
  ['Tiene inversiones en España y no tiene inversiones en el extranjero',
   ['solo_espana', 'solo espana', /solo en espana/, /unicamente en espana/]],
  ['Tiene inversiones en el extranjero y no tiene inversiones en España',
   ['solo_extranjero', 'solo extranjero', /solo (en )?el extranjero/, /solo fuera/]],
  ['No tiene inversiones en España ni en el extranjero',
   ['ninguno', 'ninguna', 'no', /no tiene/, /ninguna inversion/, /sin inversiones/]]
]);

// ── 10/08 · T049 · motivo del cierre de la conversacion de Intercom ────────────
// El agente lo manda SOLO cuando ha terminado Y el cliente ha confirmado que no
// tiene mas dudas. El cierre NO se hace aqui: se hace en la rama de la
// conversacion, DESPUES de Callback_Intercom, porque en Intercom publicar un
// mensaje en una conversacion cerrada LA REABRE. Cerrar desde el escritor seria
// cerrar antes del mensaje, y no serviria de nada.
// Los descartes de F1 y F3 no pasan por aqui: los cierra el canvas en D y N.
ponerSelect('MotivoCierre', body.motivo_cierre, [
  ['Llamada agendada',
   ['llamada_agendada', 'llamada agendada', /llamada/, /calendly/, /agendad/, /reservad/]],
  ['Expediente completo',
   ['expediente_completo', 'expediente completo', /expediente/, /completo/, /todo recogido/, /terminad/, /finalizad/]]
]);

// ── 12/08 · WP-234 · POR QUE el caso es complejo, no solo QUE lo es ────────────
// Status='2. Pendiente llamada TD' dice que HAY llamada; esto dice QUE MIRAR en
// ella. Vacio = caso claro. Hasta hoy el prompt distinguia claro/complejo y esa
// senal se quedaba en la conversacion sin llegar a ninguna columna.
//
// LISTA CERRADA A PROPOSITO: son las siete senales del Bloque 6 del prompt y ni
// una mas. Con typecast:true un nombre que no este en la columna NO FALLA: CREA
// UNA OPCION NUEVA. Por eso aqui no se escribe nada que no case con la lista, y
// lo que no case se deja en 'descartados' con su texto.
//
// SE PARTE POR COMA ANTES DE NORMALIZAR: normSel() convierte las comas en
// espacios, asi que despues ya no se podria trocear.
function ponerMultiSelect(columna, valor, reglas) {
  const bruto = limpio(valor);
  if (!bruto) return;
  const trozos = String(bruto).split(/[;,|]/);
  const salida = [];
  const noReconocidos = [];
  for (const trozo of trozos) {
    const k = normSel(trozo);
    if (!k) continue;
    let casado = null;
    for (const regla of reglas) {
      for (const p of regla[1]) {
        const casa = (p instanceof RegExp)
          ? p.test(k)
          : (p.length <= 3 ? k === p : contienePalabra(k, p));
        if (casa) { casado = regla[0]; break; }
      }
      if (casado) break;
    }
    if (casado) {
      if (salida.indexOf(casado) === -1) salida.push(casado);
    } else {
      noReconocidos.push(String(trozo).trim());
    }
  }
  if (noReconocidos.length) {
    descartadas.push(columna + '=' + noReconocidos.join(' / ') + ' (senal no reconocida)');
  }
  if (salida.length) fields[columna] = salida;
}

// Los patrones van SIN ACENTOS y en minusculas porque normSel() ya los quita, y
// SIN PUNTOS porque normSel() convierte el punto en espacio: por eso el limite de
// 55.000 se caza con /debajo/ y nunca con /55\.000/, que no casaria jamas.
ponerMultiSelect('SenalesComplejidad', body.senales_complejidad, [
  ['Vía de acceso distinta del contrato español',
   [/via de acceso/, /extranjer/, /teletrabaj/, /autonom/, /emprendedor/, /enisa/, /visado/]],
  ['No dispone de carta o documento de la empresa',
   [/no dispone/, /sin carta/, /falta la carta/, /carta/]],
  ['Salario no definido o en el límite',
   [/no definid/, /sin definir/, /limite/]],
  ['El cónyuge también quiere acogerse',
   [/conyuge/, /pareja/, /esposa/, /esposo/]],
  ['Llegada posterior al 1 de julio',
   [/posterior/, /despues del 1/, /1 de julio/, /segundo semestre/, /no residente el primer/]],
  ['Declarante foral u otras particularidades',
   [/foral/, /particularidad/, /pais vasco/, /navarra/]],
  ['Salario por debajo de 55.000',
   [/debajo/, /menos de 55/, /inferior a 55/, /55 000/, /55000/]]
]);

function ponerValidado(columna, valor, fn) {
  const v = limpio(valor);
  if (!v) return;
  const ok = fn(v);
  if (ok === null) { descartadas.push(columna + '=' + v); return; }
  fields[columna] = ok;
}
// ── 6/08 · Tanda C · los dos paises (whitelist de 245 opciones + gentilicios) ──
// PAISES es la lista EXACTA del singleSelect de Airtable (fld80wAfTQMgK0gJF y
// fldCzml10hcjgw7F9): mayusculas sin acentos SALVO ESPAÑA, CURAÇAO, PAISES BAJOS
// (PARTE CARIBEÑA), y con comas invertidas en 'CHECA, REPUBLICA' o 'SALVADOR, EL'.
// GENTILICIOS traduce lo que dice una persona ('Marroqui') al pais ('MARRUECOS'):
// sin esto, con typecast:true, se crearia una opcion nueva llamada 'Marroqui'.
const PAISES = [
'AFGANISTAN','ALBANIA','ALEMANIA','ANDORRA',
'ANGOLA','ANGUILA','ANTARTIDA','ANTIGUA Y BARBUDA',
'ARABIA SAUDI','ARGELIA','ARGENTINA','ARMENIA',
'ARUBA','AUSTRALIA','AUSTRIA','AZERBAIYAN',
'BAHAMAS','BAHREIN','BANCO CENTRAL EUROPEO','BANGLADESH',
'BARBADOS','BELGICA','BELICE','BENIN',
'BERMUDAS','BIELORRUSIA','BOLIVIA','BOSNIA-HERZEGOVINA',
'BOTSUANA','BOUVET, ISLA','BRASIL','BRUNEI',
'BULGARIA','BURKINA FASO','BURUNDI','BUTAN',
'CABO VERDE, REPUBLICA DE','CAIMAN, ISLAS','CAMBOYA','CAMERUN',
'CANADA','CATAR','CENTROAFRICANA, REPUBLICA','CHAD',
'CHECA, REPUBLICA','CHILE','CHINA','CHIPRE',
'COCOS','COLOMBIA','COMORAS','CONGO',
'CONGO, REPUBLICA DEMOCRATICA','COOK, ISLAS','COREA DEL NORTE','COREA DEL SUR',
'COSTA DE MARFIL','COSTA RICA','CROACIA','CUBA',
'CURAÇAO','DINAMARCA','DOMINICA','DOMINICANA, REPUBLICA',
'ECUADOR','EGIPTO','EMIRATOS ARABES UNIDOS','ERITREA',
'ESLOVAQUIA','ESLOVENIA','ESPAÑA','ESTADOS UNIDOS DE AMERICA',
'ESTONIA','ETIOPIA','FEROE, ISLAS','FILIPINAS',
'FINLANDIA','FIYI','FRANCIA','GABON',
'GAMBIA','GEORGIA','GEORGIA DEL SUR','GHANA',
'GIBRALTAR','GRANADA','GRECIA','GROENLANDIA',
'GUAM','GUATEMALA','GUERNESEY','GUINEA',
'GUINEA ECUATORIAL','GUINEA-BISSAU','GUYANA','HAITI',
'HEARD Y MCDONALD, ISLAS','HONDURAS','HONG-KONG','HUNGRIA',
'INDIA','INDONESIA','IRAN','IRAQ',
'IRLANDA','ISLA DE MAN','ISLANDIA','ISRAEL',
'ITALIA','JAMAICA','JAPON','JERSEY',
'JORDANIA','KAZAJSTAN','KENIA','KIRGUISTAN',
'KIRIBATI','KUWAIT','LAOS','LESOTHO',
'LETONIA','LIBANO','LIBERIA','LIBIA',
'LIECHTENSTEIN','LITUANIA','LUXEMBURGO','LUXEMBURGO (DI)',
'MACAO','MACEDONIA','MADAGASCAR','MALASIA',
'MALAWI','MALDIVAS','MALI','MALTA',
'MALVINAS, ISLAS','MARIANAS DEL NORTE, ISLAS','MARRUECOS','MARSHALL, ISLAS',
'MAURICIO','MAURITANIA','MAYOTTE','MENORES ALEJADAS EE.UU, ISLAS',
'MEXICO','MICRONESIA','MOLDAVIA','MONACO',
'MONGOLIA','MONTENEGRO','MONTSERRAT','MOZAMBIQUE',
'MYANMAR','NAMIBIA','NAURU','NAVIDAD, ISLA',
'NEPAL','NICARAGUA','NIGER','NIGERIA',
'NIUE, ISLA','NORFOLK, ISLA','NORUEGA','NUEVA CALEDONIA',
'NUEVA ZELANDA','OCEANO INDICO, TERRI.BRITANICO','OMAN','ORGANISMOS INTERNACIONALES',
'OTROS PAISES NO RELACIONADOS','PAISES BAJOS','PAISES BAJOS (PARTE CARIBEÑA)','PAKISTAN',
'PALAU','PANAMA','PAPUA NUEVA GUINEA','PARAGUAY',
'PERU','PITCAIRN','POLINESIA FRANCESA','POLONIA',
'PORTUGAL','PUERTO RICO','REINO UNIDO','RUANDA',
'RUMANIA','RUSIA','SAHARA OCCIDENTAL','SALOMON, ISLAS',
'SALVADOR, EL','SAMOA','SAMOA AMERICANA','SAN CRISTOBAL Y NIEVES',
'SAN MARINO','SAN MARTIN','SAN PEDRO Y MIQUELON','SAN VICENTE Y LAS GRANADINAS',
'SANTA ELENA','SANTA LUCIA','SANTO TOME Y PRINCIPE','SENEGAL',
'SERBIA','SEYCHELLES','SIERRA LEONA','SINGAPUR',
'SIRIA','SOMALIA','SRI LANKA','SUAZILANDIA',
'SUDAFRICA','SUDAN','SUDAN DEL SUR','SUECIA',
'SUIZA','SURINAM','TAILANDIA','TAIWAN',
'TANZANIA','TAYIKISTAN','TERRITORIO PALESTINO OCUPADO','TIERRAS AUSTRALES FRANCESAS',
'TIMOR LESTE','TOGO','TOKELAU, ISLAS','TONGA',
'TRINIDAD Y TOBAGO','TUNEZ','TURCAS Y CAICOS, ISLAS','TURKMENISTAN',
'TURQUIA','TUVALU','UCRANIA','UGANDA',
'URUGUAY','UZBEKISTAN','VANUATU','VATICANO, CIUDAD DEL',
'VENEZUELA','VIETNAM','VIRGENES BRITANICAS, ISLAS','VIRGENES DE LOS EE.UU, ISLAS',
'WALLIS Y FUTUNA, ISLAS','YEMEN','YIBUTI','ZAMBIA',
'ZIMBABUE'
];

const GENTILICIOS = {
  'espanol': 'ESPAÑA',
  'espanola': 'ESPAÑA',
  'espana': 'ESPAÑA',
  'spain': 'ESPAÑA',
  'spanish': 'ESPAÑA',
  'marroqui': 'MARRUECOS',
  'maroc': 'MARRUECOS',
  'moroccan': 'MARRUECOS',
  'italiano': 'ITALIA',
  'italiana': 'ITALIA',
  'italian': 'ITALIA',
  'italy': 'ITALIA',
  'frances': 'FRANCIA',
  'francesa': 'FRANCIA',
  'french': 'FRANCIA',
  'france': 'FRANCIA',
  'aleman': 'ALEMANIA',
  'alemana': 'ALEMANIA',
  'german': 'ALEMANIA',
  'germany': 'ALEMANIA',
  'deutschland': 'ALEMANIA',
  'portugues': 'PORTUGAL',
  'portuguesa': 'PORTUGAL',
  'portuguese': 'PORTUGAL',
  'britanico': 'REINO UNIDO',
  'britanica': 'REINO UNIDO',
  'british': 'REINO UNIDO',
  'ingles': 'REINO UNIDO',
  'inglesa': 'REINO UNIDO',
  'inglaterra': 'REINO UNIDO',
  'escoces': 'REINO UNIDO',
  'escocia': 'REINO UNIDO',
  'gales': 'REINO UNIDO',
  'uk': 'REINO UNIDO',
  'england': 'REINO UNIDO',
  'gran bretana': 'REINO UNIDO',
  'irlandes': 'IRLANDA',
  'irlandesa': 'IRLANDA',
  'ireland': 'IRLANDA',
  'estadounidense': 'ESTADOS UNIDOS DE AMERICA',
  'americano': 'ESTADOS UNIDOS DE AMERICA',
  'americana': 'ESTADOS UNIDOS DE AMERICA',
  'norteamericano': 'ESTADOS UNIDOS DE AMERICA',
  'eeuu': 'ESTADOS UNIDOS DE AMERICA',
  'ee uu': 'ESTADOS UNIDOS DE AMERICA',
  'usa': 'ESTADOS UNIDOS DE AMERICA',
  'estados unidos': 'ESTADOS UNIDOS DE AMERICA',
  'united states': 'ESTADOS UNIDOS DE AMERICA',
  'us': 'ESTADOS UNIDOS DE AMERICA',
  'mexicano': 'MEXICO',
  'mexicana': 'MEXICO',
  'mejico': 'MEXICO',
  'mexican': 'MEXICO',
  'argentino': 'ARGENTINA',
  'argentina ': 'ARGENTINA',
  'colombiano': 'COLOMBIA',
  'colombiana': 'COLOMBIA',
  'venezolano': 'VENEZUELA',
  'venezolana': 'VENEZUELA',
  'peruano': 'PERU',
  'peruana': 'PERU',
  'chileno': 'CHILE',
  'chilena': 'CHILE',
  'brasileno': 'BRASIL',
  'brasilena': 'BRASIL',
  'brasil': 'BRASIL',
  'brazil': 'BRASIL',
  'brazilian': 'BRASIL',
  'ecuatoriano': 'ECUADOR',
  'ecuatoriana': 'ECUADOR',
  'cubano': 'CUBA',
  'cubana': 'CUBA',
  'dominicano': 'DOMINICANA, REPUBLICA',
  'dominicana': 'DOMINICANA, REPUBLICA',
  'republica dominicana': 'DOMINICANA, REPUBLICA',
  'uruguayo': 'URUGUAY',
  'uruguaya': 'URUGUAY',
  'paraguayo': 'PARAGUAY',
  'paraguaya': 'PARAGUAY',
  'boliviano': 'BOLIVIA',
  'boliviana': 'BOLIVIA',
  'hondureno': 'HONDURAS',
  'hondurena': 'HONDURAS',
  'guatemalteco': 'GUATEMALA',
  'guatemalteca': 'GUATEMALA',
  'salvadoreno': 'SALVADOR, EL',
  'salvadorena': 'SALVADOR, EL',
  'el salvador': 'SALVADOR, EL',
  'nicaraguense': 'NICARAGUA',
  'costarricense': 'COSTA RICA',
  'panameno': 'PANAMA',
  'panamena': 'PANAMA',
  'chino': 'CHINA',
  'china ': 'CHINA',
  'chinese': 'CHINA',
  'japones': 'JAPON',
  'japonesa': 'JAPON',
  'japan': 'JAPON',
  'coreano': 'COREA DEL SUR',
  'coreana': 'COREA DEL SUR',
  'corea': 'COREA DEL SUR',
  'south korea': 'COREA DEL SUR',
  'indio': 'INDIA',
  'india ': 'INDIA',
  'hindu': 'INDIA',
  'indian': 'INDIA',
  'pakistani': 'PAKISTAN',
  'ruso': 'RUSIA',
  'rusa': 'RUSIA',
  'russia': 'RUSIA',
  'russian': 'RUSIA',
  'ucraniano': 'UCRANIA',
  'ucraniana': 'UCRANIA',
  'ukraine': 'UCRANIA',
  'rumano': 'RUMANIA',
  'rumana': 'RUMANIA',
  'bulgaro': 'BULGARIA',
  'bulgara': 'BULGARIA',
  'polaco': 'POLONIA',
  'polaca': 'POLONIA',
  'poland': 'POLONIA',
  'hungaro': 'HUNGRIA',
  'hungara': 'HUNGRIA',
  'checo': 'CHECA, REPUBLICA',
  'checa': 'CHECA, REPUBLICA',
  'republica checa': 'CHECA, REPUBLICA',
  'chequia': 'CHECA, REPUBLICA',
  'eslovaco': 'ESLOVAQUIA',
  'eslovaca': 'ESLOVAQUIA',
  'esloveno': 'ESLOVENIA',
  'eslovena': 'ESLOVENIA',
  'sueco': 'SUECIA',
  'sueca': 'SUECIA',
  'sweden': 'SUECIA',
  'noruego': 'NORUEGA',
  'noruega ': 'NORUEGA',
  'danes': 'DINAMARCA',
  'danesa': 'DINAMARCA',
  'denmark': 'DINAMARCA',
  'finlandes': 'FINLANDIA',
  'finlandesa': 'FINLANDIA',
  'finland': 'FINLANDIA',
  'holandes': 'PAISES BAJOS',
  'holandesa': 'PAISES BAJOS',
  'holanda': 'PAISES BAJOS',
  'neerlandes': 'PAISES BAJOS',
  'neerlandesa': 'PAISES BAJOS',
  'netherlands': 'PAISES BAJOS',
  'belga': 'BELGICA',
  'belgium': 'BELGICA',
  'suizo': 'SUIZA',
  'suiza ': 'SUIZA',
  'switzerland': 'SUIZA',
  'austriaco': 'AUSTRIA',
  'austriaca': 'AUSTRIA',
  'griego': 'GRECIA',
  'griega': 'GRECIA',
  'greece': 'GRECIA',
  'turco': 'TURQUIA',
  'turca': 'TURQUIA',
  'turkey': 'TURQUIA',
  'egipcio': 'EGIPTO',
  'egipcia': 'EGIPTO',
  'argelino': 'ARGELIA',
  'argelina': 'ARGELIA',
  'tunecino': 'TUNEZ',
  'tunecina': 'TUNEZ',
  'senegales': 'SENEGAL',
  'senegalesa': 'SENEGAL',
  'nigeriano': 'NIGERIA',
  'nigeriana': 'NIGERIA',
  'sudafricano': 'SUDAFRICA',
  'sudafricana': 'SUDAFRICA',
  'australiano': 'AUSTRALIA',
  'australiana': 'AUSTRALIA',
  'neozelandes': 'NUEVA ZELANDA',
  'neozelandesa': 'NUEVA ZELANDA',
  'canadiense': 'CANADA',
  'israeli': 'ISRAEL',
  'libanes': 'LIBANO',
  'libanesa': 'LIBANO',
  'sirio': 'SIRIA',
  'siria ': 'SIRIA',
  'irani': 'IRAN',
  'iraqui': 'IRAQ',
  'saudi': 'ARABIA SAUDI',
  'emirati': 'EMIRATOS ARABES UNIDOS',
  'emiratos arabes': 'EMIRATOS ARABES UNIDOS',
  'filipino': 'FILIPINAS',
  'filipina': 'FILIPINAS',
  'indonesio': 'INDONESIA',
  'indonesia ': 'INDONESIA',
  'vietnamita': 'VIETNAM',
  'tailandes': 'TAILANDIA',
  'tailandesa': 'TAILANDIA',
  'malayo': 'MALASIA',
  'malaya': 'MALASIA',
  'singapurense': 'SINGAPUR',
  'islandes': 'ISLANDIA',
  'islandesa': 'ISLANDIA',
  'leton': 'LETONIA',
  'letona': 'LETONIA',
  'lituano': 'LITUANIA',
  'lituana': 'LITUANIA',
  'estonio': 'ESTONIA',
  'estonia ': 'ESTONIA',
  'croata': 'CROACIA',
  'serbio': 'SERBIA',
  'serbia ': 'SERBIA',
  'bosnio': 'BOSNIA-HERZEGOVINA',
  'bosnia': 'BOSNIA-HERZEGOVINA',
  'albanes': 'ALBANIA',
  'albanesa': 'ALBANIA',
  'macedonio': 'MACEDONIA',
  'montenegrino': 'MONTENEGRO',
  'moldavo': 'MOLDAVIA',
  'georgiano': 'GEORGIA',
  'armenio': 'ARMENIA',
  'azerbaiyano': 'AZERBAIYAN',
  'kazajo': 'KAZAJSTAN',
  'uzbeko': 'UZBEKISTAN',
  'marfileno': 'COSTA DE MARFIL',
  'camerunes': 'CAMERUN',
  'ghanes': 'GHANA',
  'keniata': 'KENIA',
  'etiope': 'ETIOPIA',
  'angolano': 'ANGOLA',
  'mozambiqueno': 'MOZAMBIQUE',
};

// clave normalizada -> nombre EXACTO de la opcion
const PAIS_POR_CLAVE = {};
for (const p of PAISES) PAIS_POR_CLAVE[normSel(p)] = p;

function paisValido(s) {
  const k = normSel(s);
  if (!k) return null;
  // 1 · el nombre tal cual ('marruecos', 'ESPAÑA', 'espana')
  if (PAIS_POR_CLAVE[k]) return PAIS_POR_CLAVE[k];
  // 2 · gentilicio o alias ('marroqui', 'holanda', 'eeuu', 'republica checa')
  if (GENTILICIOS[k]) return GENTILICIOS[k];
  // 3 · forma invertida: "republica dominicana" -> "DOMINICANA, REPUBLICA"
  const partes = k.split(' ');
  if (partes.length === 2) {
    const inv = normSel(partes[1] + ', ' + partes[0]);
    if (PAIS_POR_CLAVE[inv]) return PAIS_POR_CLAVE[inv];
  }
  // 4 · quitar articulos y reintentar ('el salvador' ya esta en GENTILICIOS,
  //     esto cubre 'los paises bajos', 'la india')
  const sinArt = k.replace(/^(el|la|los|las|the) /, '');
  if (PAIS_POR_CLAVE[sinArt]) return PAIS_POR_CLAVE[sinArt];
  if (GENTILICIOS[sinArt]) return GENTILICIOS[sinArt];
  return null;
}
ponerValidado('PaisNacimiento', body.pais_nacimiento, paisValido);
ponerValidado('UltimoPaisResidencia', body.ultimo_pais_residencia, paisValido);
ponerValidado('Nacionalidad', body.nacionalidad, paisValido);

// ── 6/08 · Tanda D · NIF, NIE o PASAPORTE ─────────────────────────────────────
// D3 pregunta los tres en un solo mensaje y el agente los manda todos en `nif`.
// Aqui se decide a que columna va cada uno.
function pasaporteValido(s) {
  const t = s.toUpperCase().replace(/[\s-]/g, '');
  // TRAMPA IMPORTANTE: si TIENE forma de DNI o NIE pero la letra de control esta
  // mal, es un DNI mal escrito, NO un pasaporte. Se descarta para que el agente
  // lo vuelva a pedir; guardarlo como pasaporte seria esconder una errata.
  if (/^[XYZ]?\d{7,8}[A-Z]$/.test(t)) return null;
  if (!/^[A-Z0-9]{5,15}$/.test(t)) return null;
  if (!/\d/.test(t)) return null;     // un pasaporte lleva digitos
  if (!/[A-Z]/.test(t)) return null;  // y al menos una letra
  return t;
}
const idBruto = limpio(body.nif);
if (idBruto) {
  const dni = nifValido(idBruto);
  if (dni) {
    fields.NIF = dni;
  } else {
    const pas = pasaporteValido(idBruto);
    if (pas) fields.PasaporteNumero = pas;
    else descartadas.push('NIF/Pasaporte=' + idBruto);
  }
}

ponerValidado('NumeroTelefono', body.telefono, telefonoValido);
ponerValidado('Tipo de vía / Type of road', body.tipo_via, tipoViaValido);

// ── 6/08 · Documentos: el adjunto va a SU columna segun tipo_documento ─────────
// Opcion B decidida por el usuario: se usan las columnas de fichero que YA existen,
// que es donde se encienden NombreEmpleador, CIFEmpleador, FechaAlta y AnioDesplazamiento.
// La lista de adjuntos la INYECTA la tool desde Formatear_conversacion1; el agente
// solo dice QUE tipo de documento es.
const COLUMNA_POR_TIPO = {
  dni: 'DNI',
  nie: 'DNI',
  pasaporte: 'Pasaporte',
  contrato: 'Contratotrabajo',
  alta_ss: 'AltaSeguridadSocial',
  autorizacion_empleado: 'AutorizacionEmpleado',
  autorizacion_empresa: 'AutorizacionEmpresa',
  enisa: 'CertificadoEnisa',
  apostilla: 'Apostilla',
  visado: 'Visado'
};
// 10/08 · 'nie' comparte columna con 'dni' A PROPOSITO: son el mismo documento de
// identidad a estos efectos y Airtable solo tiene una columna. Antes de hoy la clave
// 'nie' NO existia, asi que si el agente la mandaba -- y puede, porque el lector tiene
// la etiqueta NIE en su lista -- se descartaba con 'tipo desconocido' y EL FICHERO NO
// SE GUARDABA, devolviendo ok:true. Funcionaba de casualidad porque el prompt dice
// 'NIE o pasaporte' y el agente venia eligiendo dni.
const tipoDoc = normSel(body.tipo_documento).replace(/ /g, '_');
if (tipoDoc) {
  const columna = COLUMNA_POR_TIPO[tipoDoc];
  let adjuntos = [];
  try {
    const crudo = body.adjuntos;
    adjuntos = typeof crudo === 'string' ? JSON.parse(crudo || '[]') : (Array.isArray(crudo) ? crudo : []);
  } catch (e) {
    adjuntos = [];
  }
  if (!Array.isArray(adjuntos)) adjuntos = [];
  // El ULTIMO es el que el cliente acaba de subir.
  const ultimo = adjuntos.length ? adjuntos[adjuntos.length - 1] : null;
  if (!columna) {
    descartadas.push('tipo_documento=' + limpio(body.tipo_documento) + ' (tipo desconocido)');
  } else if (!ultimo || !ultimo.url) {
    descartadas.push('tipo_documento=' + tipoDoc + ' (no hay ningun adjunto en la conversacion)');
  } else {
    fields[columna] = [{ url: String(ultimo.url), filename: String(ultimo.name || ultimo.nombre || 'documento') }];
    // 10/08 · VARIOS ADJUNTOS EN EL MISMO TURNO: solo se guarda el ultimo y los demas
    // se perdian EN SILENCIO con ok:true. La lista trae solo los ficheros POSTERIORES al
    // ultimo mensaje del bot (Formatear_conversacion1 recorre desde lastBotWithBodyIndex+1),
    // asi que mas de uno aqui significa de verdad que el cliente subio varios de golpe y
    // NO es una falsa alarma por adjuntos viejos de la conversacion. No se rechaza nada:
    // se guarda el ultimo, como siempre, y se deja RASTRO de lo que no se guardo.
    if (adjuntos.length > 1) {
      const noGuardados = adjuntos
        .slice(0, -1)
        .map(function (a) { return String((a && (a.name || a.nombre)) || 'sin nombre'); })
        .join(', ');
      descartadas.push('adjuntos=' + adjuntos.length + ' en el mismo turno, guardado solo el ultimo (' + String(ultimo.name || ultimo.nombre || 'documento') + '); NO guardados: ' + noGuardados);
    }
  }
}


// ── DOMICILIO ATOMICO: calle + numero + CP, los tres o ninguno ────────────────
// Medio domicilio es peor que ninguno: parece bueno y va a Hacienda.
const dCalle = limpio(body.calle);
const dNumero = limpio(body.numero);
const dCpRaw = limpio(body.codigo_postal);
if (dCalle || dNumero || dCpRaw) {
  const dCp = dCpRaw ? cpValido(dCpRaw) : null;
  if (dCalle && dNumero && dCp) {
    fields['Nombre de la calle / Name of street'] = dCalle.slice(0, 100);
    fields['Número de tu domicilio / House Number'] = dNumero.slice(0, 20);
    fields['Codigo Postal'] = dCp;
  } else {
    const falta = [];
    if (!dCalle) falta.push('calle');
    if (!dNumero) falta.push('numero');
    if (!dCpRaw) falta.push('codigo_postal');
    else if (!dCp) falta.push('codigo_postal invalido (' + dCpRaw + ')');
    descartadas.push('domicilio incompleto, falta: ' + falta.join(', '));
  }
}
// ──────────────────────────────────────────────────────────────────────────────

// ── 7/08 · Resumen del bot ────────────────────────────────────────────────────
// Es la base del informe fiscal que se le enviara al cliente, asi que se guarda
// LITERAL: no se recorta, no se normaliza y no se toca la puntuacion. Cada envio
// SUSTITUYE al anterior, porque el resumen bueno es el ultimo. Lo unico que se
// descarta es un resumen sospechosamente corto: 30 caracteres no son un resumen,
// son un saludo, y guardarlo pisaria el bueno con basura.
const resumenBruto = (body.resumen === undefined || body.resumen === null)
  ? ''
  : String(body.resumen).trim();
if (resumenBruto) {
  if (resumenBruto.length < 80) {
    descartadas.push('resumen=demasiado corto (' + resumenBruto.length + ' caracteres)');
  } else {
    fields.ResumenBot = resumenBruto.slice(0, 100000);
  }
}

// ── 10/08 · Discrepancia de fecha de alta en la SS ─────────────────────────────
// El bot ya detecta que la fecha DECLARADA no cuadra con la del documento y lo
// dice en voz alta, pero hasta hoy no quedaba escrito en ninguna parte y nadie
// del equipo lo veia (caso del 07/08: declarada 01/04/2026 contra 13/07/2026 del
// vida_laboral.pdf). Se guarda como TEXTO, no como fecha: el valor de negocio es
// justamente que NO cuadran, no cual de las dos gana. Eso lo decide una persona.
// La guarda de forma es la del bug silencioso del 03/08: un objeto pasado por
// String().trim() escribe '[object Object]' con ok:true, asi que se rechaza antes.
const discBruta = body.discrepancia_fecha_alta;
const discrepancia = (discBruta === undefined || discBruta === null)
  ? ''
  : (typeof discBruta === 'string' || typeof discBruta === 'number')
    ? String(discBruta).trim()
    : null;
if (discrepancia === null) {
  descartadas.push('discrepancia_fecha_alta=forma invalida (no es texto)');
} else if (discrepancia) {
  if (discrepancia.length > 500) {
    descartadas.push('discrepancia_fecha_alta=demasiado larga (' + discrepancia.length + ' caracteres)');
  } else {
    fields.DiscrepanciaFechaAlta = discrepancia;
  }
}

return [{ json: {
  _invalid: false,
  fields,
  _hay_fechas_descartadas: hayFechaDescartada,
  _fechas_descartadas: descartadas.join(' · '),
  _formula_userid: '{UserId} = ' + String.fromCharCode(39) + String(fields.UserId).replaceAll(String.fromCharCode(39), '') + String.fromCharCode(39)
} }];
