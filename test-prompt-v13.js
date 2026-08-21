// Puerta del prompt v13 · 21/08/2026
// HEREDA las 77 comprobaciones de test-prompt-v12.js, pero medidas SOBRE EL v13:
// heredar midiendo el fichero viejo no prueba nada (la trampa del 19/08 con el
// COMPLETO del informe). Las referencias PFn van ACTUALIZADAS a la numeracion
// nueva -- se corrige la PRUEBA, no el prompt. Al final, los cuatro cambios del
// v13, nacidos de la conversacion 3 (215475580835251, el caso al limite).
// `node docs/test-prompt-v13.js`.
const fs = require('fs');
const path = require('path');

const V13 = path.join(__dirname, 'prompt-final-2026-08-21-v13.txt');
const V12 = path.join(__dirname, 'prompt-final-2026-08-20-v12.txt');
const V11 = path.join(__dirname, 'prompt-final-2026-08-20-v11.txt');
const V10 = path.join(__dirname, 'prompt-final-2026-08-19-v10.txt');
const V9  = path.join(__dirname, 'prompt-final-2026-08-17-v9.txt');
const p   = fs.readFileSync(V13, 'utf8');   // el que se mide
const v12 = fs.readFileSync(V12, 'utf8');   // el anterior inmediato, para contrastes
const v11 = fs.readFileSync(V11, 'utf8');   // el anterior inmediato
const v10 = fs.readFileSync(V10, 'utf8');   // el de ayer, para el contraste de P1
const v9  = fs.readFileSync(V9,  'utf8');   // solo para probar que un cambio viejo fue real

let ok = 0, mal = 0;
const comp = (nombre, condicion, detalle) => {
  if (condicion) { console.log(`verde ${nombre}`); ok++; }
  else { console.log(`ROJO  ${nombre}${detalle ? '\n      ' + detalle : ''}`); mal++; }
};
const cuenta = (s, aguja) => s.split(aguja).length - 1;

// ── 1 · EL UMBRAL pasa de 55.000 a 50.000 ────────────────────────────────────
comp('cero 55.000 en el prompt', !/55\.?000/.test(p),
     'quedan: ' + (p.match(/.*55\.?000.*/g) || []).join(' | '));
comp('aparece el tramo de 50.000', cuenta(p, '50.000') >= 4,
     'apariciones de 50.000: ' + cuenta(p, '50.000'));
comp('el 60.000 sigue siendo el techo del tramo', p.includes('Salario superior a 60.000 € → suele ser favorable'));
comp('el tramo intermedio es 50.000-60.000', p.includes('Entre 50.000 € y 60.000 € → está en el límite'));
comp('por debajo de 50.000 NO descarta, es llamada',
     /Por debajo de 50\.000 €[\s\S]{0,220}NO ES UN DESCARTE/.test(p));
comp('sigue en pie la regla dura EL SALARIO NUNCA DESCARTA', p.includes('EL SALARIO NUNCA DESCARTA'));

// ── 2 · EL 1 DE JULIO sale del ENRUTADO, pero no del calculo fiscal ──────────
const casoClaro   = p.slice(p.indexOf('CASO CLARO'),   p.indexOf('→ Si se cumplen todas'));
const casoComplejo= p.slice(p.indexOf('CASO COMPLEJO'), p.indexOf('Mensaje modelo para el caso complejo'));
comp('CASO CLARO ya no exige llegada anterior al 1 de julio', !casoClaro.includes('1 de julio'),
     casoClaro);
comp('CASO COMPLEJO ya no lista la llegada posterior al 1 de julio', !casoComplejo.includes('1 de julio'));
comp('CASO CLARO conserva sus otros cuatro requisitos',
     ['PF4 = Contrato con una empresa española','Carta o documento de la empresa','Salario en un rango claro','El cónyuge NO se acoge']
       .every(x => casoClaro.includes(x)));
comp('CASO COMPLEJO conserva sus cinco señales restantes',
     ['Vía de acceso distinta','No dispone de la carta','Salario no definido','El cónyuge también quiere acogerse','Declarante foral']
       .every(x => casoComplejo.includes(x)));
comp('la nota del 1 de julio se queda como DATO, no como señal',
     /NO una señal de complejidad: no enrutes a llamada por esto/.test(p));
comp('F1 ya no se justifica por el corte del Bloque 6', !p.includes('el corte del 1 de julio'));

// ── 3 · ESTADO CIVIL a tres opciones ────────────────────────────────────────
comp('PF6a ofrece exactamente soltero, casado o divorciado',
     p.includes('¿Cuál es tu estado civil: soltero, casado o divorciado?'));
comp('PF6b ya solo depende de casado', p.includes('PF6b — (condicional, solo si es casado):'));
comp('la lista cerrada de validacion son tres', p.includes('lista cerrada (soltero · casado · divorciado)'));
{
  // El invariante: «pareja de hecho» y «viudo» solo pueden aparecer en lineas que
  // sean REGLA DE MAPEO («pásalo como…» / «se pasa como…»). En ninguna otra, y
  // sobre todo en ninguna pregunta al cliente.
  const sospechosas = p.split('\n')
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => /pareja de hecho|viud/i.test(l))
    .filter(([, l]) => !/pásalo como|se pasa como/i.test(l));
  comp('«pareja de hecho» y «viudo» solo salen como regla de mapeo',
       sospechosas.length === 0,
       sospechosas.map(([n, l]) => `L${n}: ${l.trim()}`).join('\n      '));
  comp('las dos reglas de mapeo estan escritas',
       /pásalo como casado/.test(p) && /pásalo como soltero/.test(p));
  comp('ninguna pregunta al cliente las ofrece',
       !/¿Cuál es tu estado civil[^\n]*(pareja de hecho|viudo)/i.test(p));
}

// ── 4 · FUERA la pregunta de la fecha de la llamada ─────────────────────────
comp('cero apariciones del parametro fecha_llamada', !p.includes('fecha_llamada'),
     'quedan ' + cuenta(p, 'fecha_llamada'));
comp('se le dice explicitamente que NO la pregunte', /NO PREGUNTES NUNCA LA FECHA DE LA LLAMADA/.test(p));
comp('el v9 si la pedia (o sea que el cambio es real)', v9.includes('fecha_llamada'));

// ── 5, 6, 7 · LOS TRES ENLACES, enteros y una sola vez cada uno ─────────────
const LINKS = {
  'autorización de TaxDown': 'https://cdn.prod.website-files.com/6978bfbe89b459a3e1a62fcf/6a2a765e65fd996c085d2c3a_Autorizacion_Generica.docx',
  'portal de la AEAT':       'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/ZN01.shtml',
  'Calendly (ya estaba)':    'https://calendly.com/d/csbw-2wr-fq4/movilidad-internacional',
};
for (const [nombre, url] of Object.entries(LINKS)) {
  comp(`link ${nombre}: exactamente 1 vez y entero`, cuenta(p, url) === 1,
       'apariciones: ' + cuenta(p, url));
}
comp('el SLA de 24-48 h esta en los dos mensajes al cliente y en la ficha de la AEAT',
     cuenta(p, '24-48') >= 3, 'apariciones: ' + cuenta(p, '24-48'));
comp('ya no se dice «lo antes posible» al recibir la documentacion',
     !p.includes('La revisaremos lo antes posible'));

// ── NO REGRESION · lo que estaba verificado y no se toca ────────────────────
comp('GATE 10/08 · no nombra ninguna tool no cableada', !p.includes('buscar_contexto_fiscal'));
comp('GATE 10/08 · nombra las tres tools reales',
     ['leer_expediente','guardar_datos_cliente','analizar_documento'].every(t => p.includes(t)));
comp('el bloque fiscal del v9 sigue entero (WP-220)',
     p.includes('MODELOS (para tu referencia)') && p.includes('EJEMPLO 1'));
comp('la paternidad sigue tributando (decision cerrada del 17/08)',
     /prestación por paternidad \(y la de maternidad\) de la Seguridad Social SÍ tributa/.test(p));
comp('la salvedad del 720/721 sigue en su sitio', p.includes('Modelos 720 (bienes en el extranjero) ni 721'));
comp('los marcadores de plantilla siguen ahi', p.includes('{contexto}') && p.includes('{current_date}'));
comp('siguen los dos parametros que antes se perdian',
     p.includes('conyuge_quiere_acogerse') && p.includes('discrepancia_fecha_alta'));
comp('sigue la regla de no afirmar lo que no se sabe', p.includes('NO AFIRMES NADA QUE NO SEPAS'));
comp('el tamano es coherente (no se ha truncado)', p.length > v11.length && p.length < v11.length + 4000,
     `v11=${v11.length} v12=${p.length}`);


// ══════════════════════════════════════════════════════════════════════════════
// LOS CINCO PARCHES DEL v11 · cada uno con su cicatriz de hoy
// ══════════════════════════════════════════════════════════════════════════════

// ── P1 · D5 pide el MUNICIPIO. Era el quinto sitio AL REVES: municipio_residencia
//        estaba en la tool, en el validador y en el lector, y NO en el prompt, asi
//        que MunicipioResidencia salio vacio y el .030 no se puede generar.
comp('P1 · el prompt menciona el parametro municipio_residencia', p.includes('municipio_residencia'),
     'el v10 tenia ' + cuenta(v10, 'municipio_residencia'));
comp('P1 · y el v10 NO lo mencionaba (o sea que el parche es real)',
     !v10.includes('municipio_residencia'));
comp('P1 · dice que es obligatorio para el 030',
     /EL MUNICIPIO ES OBLIGATORIO Y VA EN SU PROPIO PARÁMETRO/.test(p));
comp('P1 · prohibe deducirlo del codigo postal',
     /ese código NO se deduce del código postal/.test(p) && /No lo adivines por el código postal/.test(p));
comp('P1 · manda el nombre a secas, sin provincia ni CP',
     /con el nombre del municipio A SECAS/.test(p) && p.includes('nunca "28046 Madrid"'));
comp('P1 · da la repregunta literal por si no viene en el domicilio',
     p.includes('"¿en qué municipio está ese domicilio?"'));
comp('P1 · el parche vive dentro de D5, antes de D6',
     p.indexOf('municipio_residencia') > p.indexOf('- D5 — Domicilio de notificaciones') &&
     p.indexOf('municipio_residencia') < p.indexOf('- D6 — Fecha de nacimiento'));

// ── P2 · el recordatorio 10b, para que no se pierda entre 900 lineas ─────────
comp('P2 · existe el recordatorio 10b con municipio_residencia',
     /^10b\. .*municipio_residencia/m.test(p));
comp('P2 · el 10 sigue intacto con sus dos parametros de siempre',
     p.includes('10. DOS DATOS QUE ANTES SE PERDÍAN') &&
     /^10\. [\s\S]{0,400}conyuge_quiere_acogerse[\s\S]{0,200}discrepancia_fecha_alta/m.test(p));
comp('P2 · y el 11b de la fecha de la llamada no se ha movido',
     p.includes('11b. NO PREGUNTES NUNCA LA FECHA DE LA LLAMADA'));

// ── P3 · PF3 (inversiones) no se vuelve a preguntar si ya lo dijo. Hoy pregunto las inversiones
//        DOS VECES: el cliente las adelanto en PF2 (parte 035) y el bot volvio a
//        preguntar de cero en la 044.
comp('P3 · la guarda de precedencia esta escrita',
     /ANTES DE FORMULAR PF3, PARA Y COMPRUEBA/.test(p));
comp('P3 · sigue diciendo que NO formule la pregunta si ya lo dijo',
     /Si ya lo ha dicho, NO formules la pregunta/.test(p));
comp('P3 · la guarda esta DENTRO de PF3, no suelta por ahi',
     p.indexOf('ANTES DE FORMULAR PF3') > p.indexOf('- PF3 — INVERSIONES') &&
     p.indexOf('ANTES DE FORMULAR PF3') < p.indexOf('- PF4 — Motivo del traslado'));
comp('P3 · sigue en pie el aviso viejo de las inversiones (no se ha sustituido)',
     p.includes('SON DOS PREGUNTAS DISTINTAS Y NO SE MEZCLAN NUNCA EN UNA'));

// ── P4 y P5 · la discrepancia de fecha ya no mata el turno NI los entregables.
//        Hoy: aviso en la parte 062 sin ninguna pregunta detras, el cliente
//        preguntando "necesitas algo mas?", y cierre en 'llamada agendada' con el
//        expediente COMPLETO -> Status 2 -> cero informe y cero .030 para siempre.
comp('P4 · le prohibe cerrar el turno con el aviso',
     /NO CIERRES EL TURNO CON EL AVISO/.test(p));
comp('P4 · cubre el caso de que la discrepancia salga con el ULTIMO documento',
     /si la discrepancia sale con EL ÚLTIMO documento y ya no queda ninguno, pasa al cierre normal/.test(p));
comp('P4 · dice que la discrepancia NO cambia el motivo de cierre',
     /LA DISCREPANCIA NO CAMBIA EL MOTIVO DE CIERRE/.test(p));
comp('P4 · y que con todo recogido es "expediente completo" aunque haya discrepancia',
     /`motivo_cierre` es "expediente completo" AUNQUE HAYA DISCREPANCIA/.test(p));
comp('P5 · la misma regla esta TAMBIEN donde se decide el cierre',
     /una discrepancia en la fecha de alta NO convierte esto en "llamada agendada"/.test(p));
comp('P5 · y el punto de "expediente completo" sigue entero',
     p.includes('"expediente completo": se ha recogido todo, documentos incluidos, y no queda nada pendiente.'));
comp('P4+P5 · la regla anade EXACTAMENTE dos «expediente completo», uno por sitio',
     cuenta(p, 'expediente completo') === cuenta(v10, 'expediente completo') + 2,
     `v10=${cuenta(v10, 'expediente completo')} v11=${cuenta(p, 'expediente completo')}`);

// ── NO REGRESION de lo de hoy: lo que la conversacion SI hizo bien no se toca ──
comp('sigue sin preguntarse la fecha de la llamada', !p.includes('fecha_llamada'));
comp('sigue el aviso de la discrepancia con su formato exacto',
     p.includes('"Declarada DD/MM/AAAA vs documento DD/MM/AAAA"'));
comp('sigue diciendo que la discrepancia NO BLOQUEA NADA', p.includes('Esto NO BLOQUEA NADA'));
comp('los cinco documentos siguen listados en su orden',
     ['NIE o pasaporte','Contrato de trabajo','Autorización de TaxDown','Autorización de la empresa','Documento de alta en la Seguridad Social']
       .every(d => p.includes(d)));


// ══════════════════════════════════════════════════════════════════════════════
// LOS TRES PARCHES DEL v12 · de la conversacion 2, la que SI llego al Status 3
// ══════════════════════════════════════════════════════════════════════════════

// ── P6 · la confirmacion de las inversiones es OPCIONAL. El v11 la hacia OBLIGATORIA y el bot
//        la solto descolgada ("Me habias indicado que tienes inversiones fuera de
//        España, lo dejo asi. ¿Tienes hijos?") justo despues de "soltero, sin hijos".
comp('P6 · la confirmacion queda declarada OPCIONAL',
     /LA CONFIRMACIÓN ES OPCIONAL, NO OBLIGATORIA/.test(p));
comp('P6 · dice cuando SI decirla (hace varios mensajes o ambiguo)',
     /dila solo si lo mencionó hace ya varios mensajes o si quedó ambiguo/.test(p));
comp('P6 · y cuando NO: si acaba de decirlo, no se dice nada',
     /Si acaba de decirlo y está claro, NO digas nada de las inversiones/.test(p));
comp('P6 · ya NO ordena pasar a PF8 a secas, sino al dato QUE FALTE',
     !p.includes('pasa directamente a PF8') && /sigue con el siguiente dato QUE TE FALTE/.test(p));
comp('P6 · y el v11 SI ordenaba pasar a PF8 (o sea que el parche es real)',
     v11.includes('pasa directamente a PF8'));
comp('P6 · sigue viviendo dentro de PF3',
     p.indexOf('LA CONFIRMACIÓN ES OPCIONAL') > p.indexOf('- PF3 — INVERSIONES') &&
     p.indexOf('LA CONFIRMACIÓN ES OPCIONAL') < p.indexOf('- PF4 — Motivo del traslado'));

// ── P7 · los hijos no se preguntan si ya lo contesto en el estado civil ("soltero, sin hijos")
comp('P7 · la guarda de los hijos esta escrita',
     /a PF6a la gente contesta "soltero, sin hijos" o "casado y con dos hijos"/.test(p));
comp('P7 · dice que NO se pregunte y se pase a las observaciones',
     /Si ya te lo ha dicho, NO preguntes PF7[\s\S]{0,120}sigue con PF8/.test(p));
comp('P7 · la guarda esta pegada a la pregunta de los hijos, no suelta',
     p.indexOf('MUY FRECUENTE, Y HAY QUE MIRARLO ANTES DE PREGUNTAR') > p.indexOf('- PF7 — Hijos') &&
     p.indexOf('MUY FRECUENTE, Y HAY QUE MIRARLO ANTES DE PREGUNTAR') < p.indexOf('- PF8 — Observaciones'));
comp('P7 · el v11 no la tenia', !v11.includes('MUY FRECUENTE, Y HAY QUE MIRARLO ANTES DE PREGUNTAR'));

// ── P8 · el SLA de 24-48 h no se dice dos veces seguidas. El 20/08 el bot mando
//        LOS DOS mensajes modelo pegados en el mismo turno (parte 064).
comp('P8 · prohibe mandar juntos el de documentacion y el de cierre',
     /ESTE MENSAJE Y EL DE CIERRE NO SE MANDAN NUNCA JUNTOS/.test(p));
comp('P8 · dice cual de los dos sobrevive: SOLO el de CIERRE',
     /manda SOLO el de CIERRE y sáltate este/.test(p));
comp('P8 · deja dicho cuando SI vale el de documentacion',
     /únicamente cuando después de los documentos todavía queda algo pendiente/.test(p));
comp('P8 · la guarda esta pegada al mensaje que regula',
     p.indexOf('NO SE MANDAN NUNCA JUNTOS') > p.indexOf('TRAS RECIBIR LA DOCUMENTACIÓN:') &&
     p.indexOf('NO SE MANDAN NUNCA JUNTOS') < p.indexOf('CIERRE (cuando la captura esté completa)'));
comp('P8 · los DOS mensajes modelo siguen existiendo (no se ha borrado ninguno)',
     p.includes('Te confirmo que hemos recibido tu documentación') &&
     p.includes('Ya tengo todo lo necesario para preparar tus Modelos 030 y 149'));

// ── NO REGRESION de lo que la conversacion 2 SI hizo bien ────────────────────
comp('P1 sigue entero: la repregunta del municipio funciono en vivo',
     p.includes('"¿en qué municipio está ese domicilio?"'));
comp('el municipio sigue siendo obligatorio y sin deducir del CP',
     /EL MUNICIPIO ES OBLIGATORIO Y VA EN SU PROPIO PARÁMETRO/.test(p) &&
     /ese código NO se deduce del código postal/.test(p));

const car = (s) => [...s].length;   // puntos de codigo, no unidades UTF-16
// ══════════════════════════════════════════════════════════════════════════════
// LOS CUATRO CAMBIOS DEL v13 · 21/08/2026, nacidos de la conversacion 3
// (215475580835251, 52.000 euros, el caso al limite)
// ══════════════════════════════════════════════════════════════════════════════

// ── C1 · D3 pide NIF o NIE y NO ofrece el pasaporte de entrada ────────────────
// El 21/08 el cliente dijo "XDA123456" a la pregunta "¿Cuál es tu NIF, NIE o
// número de pasaporte?" y el agente lo mando como PasaporteNumero: la columna NIF
// quedo vacia y el .030 no se puede generar sin ella.
comp('C1 · D3 pregunta por el NIF o el NIE',
     /- D3 — NIF o NIE: "¿Cuál es tu NIF o NIE\?"/.test(p));
comp('C1 · D3 ya NO ofrece el pasaporte en la pregunta',
     !/¿Cuál es tu NIF, NIE o número de pasaporte\?/.test(p));
comp('C1 · y el v12 SI lo ofrecia (o sea que el cambio es real)',
     v12.includes('¿Cuál es tu NIF, NIE o número de pasaporte?'));
comp('C1 · dice explicitamente que no nombre el pasaporte',
     /NO NOMBRES EL PASAPORTE EN ESTA PREGUNTA/.test(p));
comp('C1 · explica el porque: el .030 se llama con el NIF',
     /no se puede generar sin él/.test(p));
comp('C1 · el pasaporte sigue siendo salida valida si no tiene ninguno',
     /SI TE DICE QUE NO TIENE NINGUNO DE LOS DOS[\s\S]{0,200}pídele entonces el número de pasaporte/.test(p));
comp('C1 · y NO bloquea la conversacion por esto',
     /no insistas ni le bloquees la conversación/.test(p));
comp('C1 · sigue prohibido que el agente valide el identificador',
     /NO valides el dato ni juzgues si es correcto/.test(p));
comp('C1 · y tampoco decide el si es NIE o pasaporte',
     /NO DEDUZCAS TÚ si lo que te ha dado es un NIE o un pasaporte/.test(p));

// ── C2 · las inversiones van PEGADAS a los inmuebles ──────────────────────────
comp('C2 · inmuebles es PF2 e inversiones es PF3',
     p.includes('- PF2 — INMUEBLES.') && p.includes('- PF3 — INVERSIONES.'));
comp('C2 · y van seguidas: entre las dos no hay ninguna otra PF',
     !/- PF\w+ — (?!INVERSIONES)[\s\S]{0,40}/.test(p.slice(p.indexOf('- PF2 — INMUEBLES.') + 10, p.indexOf('- PF3 — INVERSIONES.'))));
comp('C2 · en el v12 estaban separadas por PF3, PF4 y PF5',
     v12.indexOf('- PF6 — INVERSIONES') > v12.indexOf('- PF5a — Estado civil'));
comp('C2 · el orden completo del bloque 3 es el nuevo',
     (p.match(/^- PF\w+ — /gm) || []).join('|') ===
     '- PF1 — |- PF2 — |- PF3 — |- PF4 — |- PF5 — |- PF6a — |- PF6b — |- PF6c — |- PF7 — |- PF8 — ',
     'orden real: ' + (p.match(/^- PF\w+ — /gm) || []).join('|'));
comp('C2 · cero referencias huerfanas a la numeracion vieja',
     !/PF5a|PF5b|PF5c|PF6 — INVERSIONES|PF8 — Hijos/.test(p),
     'quedan: ' + (p.match(/PF5[abc]|PF6 — INVERSIONES|PF8 — Hijos/g) || []).join(', '));

// ── C3 · los hijos van antes de las observaciones, y los numeros lo dicen ─────
comp('C3 · hijos es PF7 y observaciones es PF8',
     p.includes('- PF7 — Hijos:') && p.includes('- PF8 — Observaciones'));
comp('C3 · y en el fichero PF7 va ANTES que PF8, no como en el v12',
     p.indexOf('- PF7 — Hijos:') < p.indexOf('- PF8 — Observaciones') &&
     v12.indexOf('- PF8 — Hijos:') < v12.indexOf('- PF7 — Observaciones'));

// ── C4 · el mensaje del caso complejo TERMINA PREGUNTANDO ─────────────────────
// Es el fallo que dejo el expediente en el peldano 1: el bot daba el enlace y se
// quedaba callado, asi que el cliente no confirmaba nada y el cierre no llegaba.
comp('C4 · pide que avise cuando reserve',
     /Cuando la tengas reservada, dímelo por aquí/.test(p));
comp('C4 · y pregunta por dudas en el mismo mensaje',
     /¿Te queda alguna duda antes de eso\?/.test(p));
comp('C4 · las dos cosas van DENTRO del mensaje modelo, entre comillas',
     /Cuando la tengas reservada, dímelo por aquí\. ¿Te queda alguna duda antes de eso\?"/.test(p));
comp('C4 · el v12 terminaba en el enlace, sin preguntar nada',
     !v12.includes('Cuando la tengas reservada'));
comp('C4 · la regla dura de que no termine en el enlace',
     /ESTE MENSAJE NO TERMINA EN EL ENLACE/.test(p));
comp('C4 · cita la conversacion donde se midio',
     p.includes('215475580835251'));
comp('C4 · y le prohibe insistir si el cliente no vuelve',
     /NO INSISTAS SI NO CONTESTA/.test(p));
comp('C4 · el enlace de Calendly sigue siendo uno y el mismo',
     cuenta(p, 'https://calendly.com/d/csbw-2wr-fq4/movilidad-internacional') === cuenta(v12, 'https://calendly.com/d/csbw-2wr-fq4/movilidad-internacional'));
comp('C4 · la seccion CIERRE avisa de que el peldano ya no depende del cierre',
     /ESTE CIERRE YA NO ES LO QUE METE EL CASO EN LA COLA DEL FISCAL/.test(p));
comp('C4 · y sigue prohibido preguntar la fecha de la llamada',
     /NO le preguntes para qué día la ha cogido/.test(p) && !/fecha_llamada/.test(p));

console.log(`\n${ok} verdes, ${mal} rojas`);
console.log(`v13 = ${car(p)} caracteres (v12 = ${car(v12)}, ${car(p) - car(v12) >= 0 ? '+' : ''}${car(p) - car(v12)})`);
console.log(`OJO: p.length de JS daria ${p.length} porque cuenta los emoji doble. La cifra buena es la de arriba.`);
process.exit(mal ? 1 : 0);
