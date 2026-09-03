// test-nodo-validar-completo.js — 26/08/2026 · WP-207 + WP-208
//
// LA PUERTA DEL COMPLETO. No comprueba texto: EJECUTA el nodo con un `$input` de
// mentira, asi que mide comportamiento y no parecido. Dos mitades:
//   A · NO REGRESION: el nodo sigue haciendo todo lo que hacia el vivo.
//   B · LO NUEVO: corr_id, el Log_Evento de 6 campos y que no se cuele PII.
//
// node docs/test-nodo-validar-completo.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname;
let ok = 0, ko = 0;
const V = s => { process.stdout.write('  OK   ' + s + '\n'); ok++; };
const X = s => { process.stdout.write('  FALLA ' + s + '\n'); ko++; };
const c = (cond, s) => cond ? V(s) : X(s);

const code = fs.readFileSync(path.join(D, 'nodo-validar-normalizar-COMPLETO.js'), 'utf8');

// ── el arnes: ejecuta el nodo y devuelve {salida, logs} ─────────────────────
function correr(body) {
  const logs = [];
  const ctx = {
    $input: { first: () => ({ json: { body } }) },
    console: { log: (...a) => logs.push(a.join(' ')), error: () => {}, warn: () => {} },
    Date, JSON, String, Number, Object, Array, Boolean, Math, RegExp, isNaN, parseInt, parseFloat
  };
  // el nodo hace `return` a nivel de raiz, que es lo normal en un Code node de n8n
  const salida = vm.runInNewContext('(function(){' + code + '})()', ctx, { timeout: 8000 });
  return { salida: salida && salida[0] ? salida[0].json : null, logs };
}
const UID = 'eu-west-1:00000000-0000-4000-8000-0000000000c1';
const BASE = { user_id: UID, intercom_conversation_id: '215475581167582',
  conversation_id: '215475581167582', conversationPartId: '52219039912' };

// ══ A · NO REGRESION ═══════════════════════════════════════════════════════
let r = correr(BASE);
c(r.salida && r.salida._invalid === false, 'A · un body minimo valido sigue pasando');
c(r.salida.fields && r.salida.fields.UserId === UID, 'A · UserId sigue llegando a fields');
c(typeof r.salida._formula_userid === 'string' && r.salida._formula_userid.indexOf('{UserId} =') === 0,
  'A · _formula_userid se sigue construyendo (lo lee el nodo de Airtable)');
c('_hay_fechas_descartadas' in r.salida && '_fechas_descartadas' in r.salida,
  'A · las dos claves de fechas descartadas siguen existiendo con su nombre');

// los cuatro rechazos, uno a uno
c(correr({}).salida.error === 'user_id_or_conversation_id_missing', 'A · rechazo sin user_id');
c(correr({ user_id: 'pepe', intercom_conversation_id: 'x' }).salida.error === 'user_id_forma_invalida',
  'A · rechazo por forma del user_id');
c(correr(Object.assign({}, BASE, { punto: 'inventado' })).salida.error === 'punto_desconocido',
  'A · rechazo por punto fuera de la whitelist');
c(correr(Object.assign({}, BASE, { Descarte: 'Salario bajo' })).salida.error === 'descarte_desconocido',
  'A · rechazo por Descarte fuera de la whitelist');

// DERIVA: los puntos siguen escribiendo lo suyo
const lead = correr(Object.assign({}, BASE, { punto: 'lead' })).salida.fields;
c(lead.lead_potencial === true && lead.alta_ss === false, 'A · punto=lead sigue derivando sus dos campos');
const dp = correr(Object.assign({}, BASE, { punto: 'descarte_plazo' })).salida.fields;
c(dp.Descarte === 'Alta en SS mas de 6 meses', 'A · punto=descarte_plazo sigue escribiendo su Descarte');

// las fechas, con el unico cuadrante que funciona
const f = correr(Object.assign({}, BASE, { fecha_alta_ss: '02/03/2026' })).salida;
c(f.fields.fecha_alta_ss === '2026-03-02T12:00:00.000Z',
  'A · la fecha sigue saliendo ISO + T12:00:00.000Z · ' + f.fields.fecha_alta_ss);
const mala = correr(Object.assign({}, BASE, { fecha_alta_ss: '32/13/2026' })).salida;
c(mala._hay_fechas_descartadas === true && !('fecha_alta_ss' in mala.fields),
  'A · una fecha imposible NO se escribe y enciende el aviso');
// el domicilio atomico
const medio = correr(Object.assign({}, BASE, { calle: 'Gran Via', numero: '1' })).salida;
c(!('Calle' in medio.fields) || !medio.fields.CodigoPostal,
  'A · medio domicilio sigue sin escribirse (atomico)');
// AplicaBeckham solo con un si expreso
c(correr(Object.assign({}, BASE, { quiere_acogerse: 'si' })).salida.fields.AplicaBeckham === true,
  'A · quiere_acogerse=si sigue marcando AplicaBeckham');
c(!('AplicaBeckham' in correr(BASE).salida.fields),
  'A · sin decirlo, AplicaBeckham NO se toca');

// ══ B · LO NUEVO ══════════════════════════════════════════════════════════
r = correr(BASE);
c(r.salida.corr_id === '215475581167582:52219039912',
  'B · el corr_id sale en la salida · ' + r.salida.corr_id);
c(correr(Object.assign({}, BASE, { intento: 2 })).salida.corr_id === '215475581167582:52219039912:2',
  'B · un reintento reutiliza el corr_id con :2');
const soloDeb = correr({ user_id: UID, intercom_conversation_id: 'x',
  conversation_id: 'A', conversation_part_id_debounce: 'B' }).salida;
c(soloDeb.corr_id === 'A:B', 'B · conversation_part_id_debounce vale de respaldo');
c(correr({ user_id: UID, intercom_conversation_id: 'x' }).salida.corr_id === '(sin-corr-id)',
  'B · sin las dos piezas se marca (sin-corr-id), no se inventa uno');
c(correr({}).salida.corr_id === '(sin-corr-id)', 'B · un rechazo tambien lleva corr_id');

// el evento: 6 campos exactos
c(r.logs.length === 1, 'B · se emite UN evento por ejecucion (hoy: ' + r.logs.length + ')');
const ev = JSON.parse(r.logs[0].slice(r.logs[0].indexOf('{')));
const claves = Object.keys(ev).sort();
c(JSON.stringify(claves) === JSON.stringify(['corr_id', 'dropped', 'modo', 'ms', 'punto', 'resultado']),
  'B · el evento tiene los 6 campos y solo esos · ' + claves.join(', '));
c(r.logs[0].indexOf('[215475581167582:52219039912]') === 0,
  'B · la linea va prefijada con el corr_id (es lo que la hace buscable)');
c(ev.resultado === 'ok' && typeof ev.ms === 'number', 'B · resultado=ok y ms es numerico');
c(correr({}).logs.length === 1 &&
  JSON.parse(correr({}).logs[0].slice(correr({}).logs[0].indexOf('{'))).resultado
    === 'user_id_or_conversation_id_missing',
  'B · un rechazo se loguea con SU resultado, no con ok');
const conPunto = correr(Object.assign({}, BASE, { punto: 'cualifica', modo: 'solicitud' }));
const ev2 = JSON.parse(conPunto.logs[0].slice(conPunto.logs[0].indexOf('{')));
c(ev2.punto === 'cualifica' && ev2.modo === 'solicitud', 'B · punto y modo viajan en el evento');
c(JSON.parse(correr(BASE).logs[0].slice(correr(BASE).logs[0].indexOf('{'))).modo === '',
  'B · sin modo el campo sale vacio, no revienta (WP-210 aun no lo manda)');

// LO QUE MAS IMPORTA: que no se cuele PII en el log
const pii = correr(Object.assign({}, BASE, {
  message: 'Me llamo Juan y gano 48000', user_email: 'juan@ejemplo.com',
  fecha_alta_ss: '32/13/2026', salario: 'no se', nombre: 'Juan' }));
const linea = pii.logs[0];
c(!/Juan/.test(linea), 'B · el nombre del cliente NO aparece en el log');
c(!/juan@ejemplo\.com/.test(linea), 'B · su correo NO aparece en el log');
c(!/48000|Me llamo/.test(linea), 'B · lo que escribio NO aparece en el log');
c(!/32\/13\/2026/.test(linea), 'B · el valor de la fecha descartada NO aparece');
const evp = JSON.parse(linea.slice(linea.indexOf('{')));
c(evp.dropped.indexOf('fecha_alta_ss') !== -1,
  'B · pero SI aparece el NOMBRE del campo descartado · dropped=[' + evp.dropped.join(', ') + ']');
c(evp.dropped.every(d => d.indexOf('=') === -1), 'B · ningun elemento de dropped lleva un valor');

// last_corr_id sigue apagado a proposito
c(!('last_corr_id' in correr(BASE).salida.fields),
  'B · last_corr_id NO se escribe todavia (la columna no existe)');
c(/_ESCRIBIR_LAST_CORR_ID = false/.test(code),
  'B · el interruptor de last_corr_id esta a false en el codigo');

// ══ E · 02/09 · PAISES Y GENTILICIOS EN INGLES (T093) ═════════════════════════
// Medido el 02/09: 'Moldova' y 'Moldovia' se rechazaban y el agente decia «el equipo
// revisara el pais». Se anadieron 179 claves a GENTILICIOS. Estas comprobaciones
// EJECUTAN el nodo con los tres campos de pais y miran lo que escribe en fields.
r = correr(Object.assign({}, BASE, { pais_nacimiento: 'Moldova', nacionalidad: 'american', ultimo_pais_residencia: 'United Kingdom' }));
c(r.salida && r.salida.fields.PaisNacimiento === 'MOLDAVIA', 'E · pais_nacimiento=Moldova -> MOLDAVIA');
c(r.salida && r.salida.fields.Nacionalidad === 'ESTADOS UNIDOS DE AMERICA', 'E · nacionalidad=american -> ESTADOS UNIDOS DE AMERICA');
c(r.salida && r.salida.fields.UltimoPaisResidencia === 'REINO UNIDO', 'E · ultimo_pais_residencia=United Kingdom -> REINO UNIDO');
r = correr(Object.assign({}, BASE, { pais_nacimiento: 'Morocco', nacionalidad: 'moldava', ultimo_pais_residencia: 'Ivory Coast' }));
c(r.salida && r.salida.fields.PaisNacimiento === 'MARRUECOS', 'E · Morocco -> MARRUECOS');
c(r.salida && r.salida.fields.Nacionalidad === 'MOLDAVIA', 'E · el femenino moldava -> MOLDAVIA (faltaba)');
c(r.salida && r.salida.fields.UltimoPaisResidencia === 'COSTA DE MARFIL', 'E · Ivory Coast -> COSTA DE MARFIL');
r = correr(Object.assign({}, BASE, { pais_nacimiento: 'Czechia', nacionalidad: 'qatari', ultimo_pais_residencia: 'Philippines' }));
c(r.salida && r.salida.fields.PaisNacimiento === 'CHECA, REPUBLICA', 'E · Czechia -> CHECA, REPUBLICA');
c(r.salida && r.salida.fields.Nacionalidad === 'CATAR', 'E · qatari -> CATAR (el nombre de la opcion es CATAR, no QATAR)');
c(r.salida && r.salida.fields.UltimoPaisResidencia === 'FILIPINAS', 'E · Philippines -> FILIPINAS');
// y lo que NO debe cambiar: un pais que no existe sigue rechazandose, no se inventa
r = correr(Object.assign({}, BASE, { pais_nacimiento: 'Narnia' }));
c(r.salida && r.salida.fields.PaisNacimiento === undefined, 'E · un pais inexistente sigue SIN escribirse (no se inventa opcion)');


// ══ C · 03/09 · LOS CUATRO PARCHES DE LA CONVERSACION 215475755624195 ═══════
// Cada uno se mide EJECUTANDO el nodo, y cada uno lleva su contraprueba (lo que NO
// debe cambiar), porque un parche que solo se comprueba por el lado bueno no es puerta.
const F = b => (correr(Object.assign({}, BASE, b)).salida || {}).fields || {};
const DESC = b => (correr(Object.assign({}, BASE, b)).salida || {})._fechas_descartadas || '';
// C1 · aviso de pasaporte
r = correr(Object.assign({}, BASE, { nif: 'AB1234567' }));
c(r.salida._invalid === false && r.salida.fields.PasaporteNumero === 'AB1234567', 'C1 · el pasaporte se sigue guardando en PasaporteNumero y el body NO se rechaza');
c(!('NIF' in r.salida.fields), 'C1 · y NIF sigue vacio');
c(/^aviso_pasaporte=AB1234567 guardado como PASAPORTE/.test(r.salida._fechas_descartadas), 'C1 · descartados lleva el aviso_pasaporte, que es lo que lee el prompt v16');
c(/UNA sola vez/.test(r.salida._fechas_descartadas), 'C1 · el aviso dice UNA sola vez (la instruccion viaja en el propio aviso)');
c(r.salida._hay_fechas_descartadas === false, 'C1 · el aviso NO enciende la rama de fechas descartadas');
c(F({ nif: '12345678Z' }).NIF === '12345678Z' && DESC({ nif: '12345678Z' }) === '', 'C1 · contraprueba: un DNI valido va a NIF sin ningun aviso');
c(/NIF\/Pasaporte=12345678A/.test(DESC({ nif: '12345678A' })) && !/aviso_pasaporte/.test(DESC({ nif: '12345678A' })), 'C1 · contraprueba: un DNI con la letra mal sigue siendo rechazo, no aviso');
// C2 · gentilicios: las formas de 'algerino' y el fallback por errata
c(F({ nacionalidad: 'Algerino' }).Nacionalidad === 'ARGELIA', 'C2 · «Algerino» -> ARGELIA (medido: el bot lo repregunto el 02/09)');
c(F({ nacionalidad: 'soy algeriana' }).Nacionalidad === undefined || true, 'C2 · (informativo) una frase entera no se resuelve: la resuelve el agente');
c(F({ nacionalidad: 'marroqi' }).Nacionalidad === 'MARRUECOS', 'C2 · errata de una letra en 7 letras («marroqi») -> MARRUECOS');
c(F({ nacionalidad: 'colmbia' }).Nacionalidad === 'COLOMBIA', 'C2 · «colmbia» -> COLOMBIA');
c(F({ pais_nacimiento: 'venezolno' }).PaisNacimiento === 'VENEZUELA', 'C2 · el fallback vale para los tres campos de pais (pais_nacimiento)');
c(F({ ultimo_pais_residencia: 'estadounidnse' }).UltimoPaisResidencia === 'ESTADOS UNIDOS DE AMERICA', 'C2 · y para ultimo_pais_residencia, con 2 erratas en 13 letras');
c(F({ nacionalidad: 'irlandia' }).Nacionalidad === undefined && /Nacionalidad=irlandia/.test(DESC({ nacionalidad: 'irlandia' })), 'C2 · contraprueba: un EMPATE (irlandia: IRLANDA e ISLANDIA a 1) se descarta, no se adivina');
c(F({ nacionalidad: 'itali' }).Nacionalidad === undefined, 'C2 · contraprueba: con 5 letras o menos no hay fallback («itali» se descarta)');
c(F({ nacionalidad: 'xyzabc' }).Nacionalidad === undefined, 'C2 · contraprueba: un texto inventado sigue descartandose');
c(F({ nacionalidad: 'austria' }).Nacionalidad === 'AUSTRIA' && F({ nacionalidad: 'australia' }).Nacionalidad === 'AUSTRALIA', 'C2 · contraprueba: austria/australia siguen exactas, el fallback no las toca');
// C3 · vias en catalan
c(F({ tipo_via: 'Carrer' })['Tipo de vía / Type of road'] === 'CALLE', 'C3 · Carrer -> CALLE');
c(F({ tipo_via: 'Passeig' })['Tipo de vía / Type of road'] === 'PASEO', 'C3 · Passeig -> PASEO (y ya no se escribe PASSEIG nunca)');
c(F({ tipo_via: 'Avinguda' })['Tipo de vía / Type of road'] === 'AVENIDA', 'C3 · Avinguda -> AVENIDA');
c(F({ tipo_via: 'Plaça' })['Tipo de vía / Type of road'] === 'PLAZA' && F({ tipo_via: 'PG' })['Tipo de vía / Type of road'] === 'PASEO', 'C3 · Plaça -> PLAZA y PG -> PASEO');
c(F({ calle: 'Carrer de Balmes', numero: '10', codigo_postal: '08008' })['Nombre de la calle / Name of street'] === 'Calle de Balmes', 'C3 · «Carrer de Balmes» -> «Calle de Balmes» en el nombre de la calle');
c(F({ calle: 'Passeig de Gràcia', numero: '10', codigo_postal: '08008' })['Nombre de la calle / Name of street'] === 'Paseo de Gràcia', 'C3 · «Passeig de Gràcia» -> «Paseo de Gràcia»');
c(F({ calle: 'Carrera de San Jeronimo', numero: '1', codigo_postal: '28014' })['Nombre de la calle / Name of street'] === 'Carrera de San Jeronimo', 'C3 · contraprueba: «Carrera» NO se toca (solo casa la palabra entera)');
c(F({ calle: 'Gaztambide', numero: '18', codigo_postal: '28015' })['Nombre de la calle / Name of street'] === 'Gaztambide', 'C3 · contraprueba: una calle normal sale intacta');
c(F({ tipo_via: 'C/' })['Tipo de vía / Type of road'] === 'CALLE' && F({ tipo_via: 'Avda.' })['Tipo de vía / Type of road'] === 'AVENIDA', 'C3 · contraprueba: los alias castellanos de siempre siguen');
// C4 · pareja de hecho -> soltero
c(F({ estado_civil: 'pareja de hecho' }).estadoCivil === 'soltero', 'C4 · «pareja de hecho» -> soltero (decision del 03/09; el 19/08 era casado)');
c(F({ estado_civil: 'domestic partner' }).estadoCivil === 'soltero' && F({ estado_civil: 'civil partnership' }).estadoCivil === 'soltero', 'C4 · las formas inglesas de pareja tambien -> soltero');
c(F({ estado_civil: 'tengo pareja' }).estadoCivil === 'soltero', 'C4 · «pareja» a secas -> soltero');
c(F({ estado_civil: 'casado' }).estadoCivil === 'casado' && F({ estado_civil: 'married' }).estadoCivil === 'casado', 'C4 · contraprueba: casado/married siguen siendo casado');
c(F({ estado_civil: 'viudo' }).estadoCivil === 'soltero' && F({ estado_civil: 'divorciado' }).estadoCivil === 'divorciado', 'C4 · contraprueba: viudo -> soltero y divorciado -> divorciado, como antes');
c(F({ estado_civil: 'no estoy casado' }).estadoCivil === undefined, 'C4 · contraprueba: una negacion sigue descartandose');
c(!/\['casado',\s*\['pareja de hecho'/.test(code), 'C4 · en el codigo, pareja de hecho ya NO esta en la lista de casado');

process.stdout.write('\n  ' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
