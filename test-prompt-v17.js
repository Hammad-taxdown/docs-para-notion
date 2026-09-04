// Puerta del prompt v17 · 04/09/2026 (HEREDA las 265 del v16 medidas sobre el v17, mas las nuevas)
//
// EL CAMBIO DEL v17 (decision del usuario del 04/09): la autorizacion de TaxDown deja de ser un
// enlace a un .docx generico y pasa a ser la tool `enviar_autorizacion` (subworkflow
// mobility_autorizacion_intercom, wMdJ0PRsXdWWdXL4), que deja en el chat el PDF ya relleno.
//
// TRES COMPROBACIONES HEREDADAS SE RE-BASELINAN A PROPOSITO, Y SE DICE AQUI:
//   (a) 'link autorización de TaxDown: exactamente 1 vez' -> ahora CERO veces (el enlace se va), y
//       se comprueba que en el v16 SI estaba, para que el cambio sea real.
//   (b) 'la regla 10 dice CUATRO herramientas' -> CINCO.
//   (c) 'el recordatorio final tambien dice CUATRO' -> CINCO, y nombra enviar_autorizacion.
// Ninguna otra comprobacion se toca. `p` es SIEMPRE el v17.
//
// ── LO QUE SIGUE ES LA CABECERA HEREDADA DEL v16 ──────────────────────────────
//
// HEREDA LAS 110 COMPROBACIONES DE test-prompt-v14.js, PERO MEDIDAS SOBRE EL v15.
// Heredar midiendo el fichero viejo no prueba nada (la trampa del 19/08 con el
// COMPLETO del informe), asi que aqui `p` es SIEMPRE el v15 y los ficheros
// anteriores solo se usan para probar que un cambio fue real.
//
// EL CAMBIO DEL v15 ES DE ARQUITECTURA, no un parche: se quita la logica de
// Intercom y TODO el recorrido pasa a un solo agente conversacional. El bot ya no
// entra a mitad de una conversacion con el cliente pre-filtrado por un canvas de
// botones: recibe el primer mensaje sin saber nada, se presenta, contesta las
// preguntas que traiga, hace los tres filtros hablando y sigue con el expediente.
//
// UNA SOLA COMPROBACION HEREDADA SE RE-BASELINA, Y SE DICE AQUI PARA QUE NO PASE
// INADVERTIDA: la del tamano. En el v14 era «p.length entre v11 y v11+4000», una
// ventana pensada para parches. El v15 crece ~20.000 caracteres A PROPOSITO
// (decision del usuario del 31/08: «eso da igual que sea largo»). Se conserva su
// INTENCION -- cazar un fichero truncado -- con la referencia puesta en el v14 y
// un techo nuevo. Ninguna otra comprobacion se toca ni se relaja.
//
// AVISO DEL PROYECTO QUE JUSTIFICA ESTE FICHERO: el v5 se escribio sin probar,
// entro dentro del v6 y metio un BUCLE INFINITO en la pregunta del idioma EN
// PRODUCCION. Cada cosa nueva del v15 tiene aqui su comprobacion.
//
// `node docs/test-prompt-v15.js`
const fs = require('fs');
const path = require('path');

const V17 = path.join(__dirname, 'prompt-final-2026-09-04-v17.txt');
const V16 = path.join(__dirname, 'prompt-final-2026-09-03-v16.txt');
const V15 = path.join(__dirname, 'prompt-final-2026-08-31-v15.txt');
const V14 = path.join(__dirname, 'prompt-final-2026-08-26-v14.txt');
const V13 = path.join(__dirname, 'prompt-final-2026-08-21-v13.txt');
const V12 = path.join(__dirname, 'prompt-final-2026-08-20-v12.txt');
const V11 = path.join(__dirname, 'prompt-final-2026-08-20-v11.txt');
const V10 = path.join(__dirname, 'prompt-final-2026-08-19-v10.txt');
const V9  = path.join(__dirname, 'prompt-final-2026-08-17-v9.txt');
const p   = fs.readFileSync(V17, 'utf8');   // EL QUE SE MIDE
const v16 = fs.readFileSync(V16, 'utf8');   // el anterior inmediato
const v15 = fs.readFileSync(V15, 'utf8');   // el anterior inmediato
const v14 = fs.readFileSync(V14, 'utf8');   // el anterior inmediato
const v13 = fs.readFileSync(V13, 'utf8');
const v12 = fs.readFileSync(V12, 'utf8');
const v11 = fs.readFileSync(V11, 'utf8');
const v10 = fs.readFileSync(V10, 'utf8');
const v9  = fs.readFileSync(V9,  'utf8');

let ok = 0, mal = 0;
// process.stdout.write, NUNCA console.log: el console.log de node 26 COLOREA la
// salida aunque escriba a una tuberia, y esos codigos ANSI se colaron una vez
// dentro de una variable de un montador y corrompieron el recuento de un pegado.
const comp = (nombre, condicion, detalle) => {
  if (condicion) { process.stdout.write(`verde ${nombre}\n`); ok++; }
  else { process.stdout.write(`ROJO  ${nombre}${detalle ? '\n      ' + detalle : ''}\n`); mal++; }
};
const cuenta = (s, aguja) => s.split(aguja).length - 1;
const car = (s) => [...s].length;   // puntos de codigo, no unidades UTF-16


// ══════════════════════════════════════════════════════════════════════════════
// PARTE 1 · LAS 110 HEREDADAS, MEDIDAS SOBRE EL v15
// ══════════════════════════════════════════════════════════════════════════════

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
  const sospechosas = p.split('\n')
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => /pareja de hecho|viud/i.test(l))
    .filter(([, l]) => !/pásalo como|se pasa como/i.test(l));
  comp('«pareja de hecho» y «viudo» solo salen como regla de mapeo',
       sospechosas.length === 0,
       sospechosas.map(([n, l]) => `L${n}: ${l.trim()}`).join('\n      '));
  // 03/09 · RE-BASELINE EXPLICITO: la pareja de hecho pasa a SOLTERO (decision del usuario), asi que
  // «pásalo como casado» desaparece y «pásalo como soltero» aparece DOS veces (pareja de hecho y viudo).
  comp('las dos reglas de mapeo estan escritas, y las dos van a soltero (03/09)',
       !/pásalo como casado/.test(p) && cuenta(p, 'pásalo como soltero') === 2 && /pásalo como casado/.test(v15),
       'pásalo como soltero x' + cuenta(p, 'pásalo como soltero'));
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
  if (nombre === 'autorización de TaxDown') {
    // RE-BASELINE v17 (a): el enlace al .docx generico SE VA. Cero apariciones, y en el v16 habia una.
    comp(`link ${nombre}: CERO veces en el v17 (RE-BASELINE v17: lo sustituye la tool) y 1 en el v16`,
         cuenta(p, url) === 0 && cuenta(v16, url) === 1, 'apariciones v17: ' + cuenta(p, url) + ', v16: ' + cuenta(v16, url));
    continue;
  }
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
// RE-BASELINADA: ver la cabecera. La intencion es la misma (cazar un truncado);
// la referencia pasa del v11 al v14 porque el v15 crece a proposito.
comp('el tamano es coherente (no se ha truncado)',
     p.length > v14.length && p.length < v14.length + 40000 && p.length > v11.length,
     `v11=${v11.length} v14=${v14.length} v15=${p.length}`);


// ══════════════════════════════════════════════════════════════════════════════
// LOS CINCO PARCHES DEL v11 · cada uno con su cicatriz
// ══════════════════════════════════════════════════════════════════════════════

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

comp('P2 · existe el recordatorio 10b con municipio_residencia',
     /^10b\. .*municipio_residencia/m.test(p));
comp('P2 · el 10 sigue intacto con sus dos parametros de siempre',
     p.includes('10. DOS DATOS QUE ANTES SE PERDÍAN') &&
     /^10\. [\s\S]{0,400}conyuge_quiere_acogerse[\s\S]{0,200}discrepancia_fecha_alta/m.test(p));
comp('P2 · y el 11b de la fecha de la llamada no se ha movido',
     p.includes('11b. NO PREGUNTES NUNCA LA FECHA DE LA LLAMADA'));

comp('P3 · la guarda de precedencia esta escrita',
     /ANTES DE FORMULAR PF3, PARA Y COMPRUEBA/.test(p));
comp('P3 · sigue diciendo que NO formule la pregunta si ya lo dijo',
     /Si ya lo ha dicho, NO formules la pregunta/.test(p));
comp('P3 · la guarda esta DENTRO de PF3, no suelta por ahi',
     p.indexOf('ANTES DE FORMULAR PF3') > p.indexOf('- PF3 — INVERSIONES') &&
     p.indexOf('ANTES DE FORMULAR PF3') < p.indexOf('- PF4 — Motivo del traslado'));
comp('P3 · sigue en pie el aviso viejo de las inversiones (no se ha sustituido)',
     p.includes('SON DOS PREGUNTAS DISTINTAS Y NO SE MEZCLAN NUNCA EN UNA'));

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
// 03/09 tarde · RE-BASELINE EXPLICITO: el v16 anade UNA aparicion mas (la regla de D3 que prohibe
// mandar motivo_cierre="expediente completo" sin NIF/NIE), asi que son v10 + 3, y v15 + 1.
comp('P4+P5 · la regla del 20/08 anade dos «expediente completo» y la de D3 del 03/09 una mas: v10+3, v15+1',
     cuenta(p, 'expediente completo') === cuenta(v10, 'expediente completo') + 3 && cuenta(p, 'expediente completo') === cuenta(v15, 'expediente completo') + 1,
     `v10=${cuenta(v10, 'expediente completo')} v15=${cuenta(p, 'expediente completo')}`);

comp('sigue sin preguntarse la fecha de la llamada', !p.includes('fecha_llamada'));
// 03/09 tarde · RE-BASELINE EXPLICITO: el formato del aviso lleva ahora el TRAMO (leve/grave).
comp('sigue el aviso de la discrepancia con su formato exacto, ahora con el tramo (03/09)',
     p.includes('"Declarada DD/MM/AAAA vs documento DD/MM/AAAA (leve, se toma la del documento)"') &&
     p.includes('"Declarada DD/MM/AAAA vs documento DD/MM/AAAA (grave, llamada)"') && v15.includes('"Declarada DD/MM/AAAA vs documento DD/MM/AAAA"'));
comp('sigue diciendo que la discrepancia NO BLOQUEA NADA', p.includes('Esto NO BLOQUEA NADA'));
comp('los cinco documentos siguen listados en su orden',
     ['NIE o pasaporte','Contrato de trabajo','Autorización de TaxDown','Autorización de la empresa','Documento de alta en la Seguridad Social']
       .every(d => p.includes(d)));


// ══════════════════════════════════════════════════════════════════════════════
// LOS TRES PARCHES DEL v12
// ══════════════════════════════════════════════════════════════════════════════

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

comp('P7 · la guarda de los hijos esta escrita',
     /a PF6a la gente contesta "soltero, sin hijos" o "casado y con dos hijos"/.test(p));
comp('P7 · dice que NO se pregunte y se pase a las observaciones',
     /Si ya te lo ha dicho, NO preguntes PF7[\s\S]{0,120}sigue con PF8/.test(p));
comp('P7 · la guarda esta pegada a la pregunta de los hijos, no suelta',
     p.indexOf('MUY FRECUENTE, Y HAY QUE MIRARLO ANTES DE PREGUNTAR') > p.indexOf('- PF7 — Hijos') &&
     p.indexOf('MUY FRECUENTE, Y HAY QUE MIRARLO ANTES DE PREGUNTAR') < p.indexOf('- PF8 — Observaciones'));
comp('P7 · el v11 no la tenia', !v11.includes('MUY FRECUENTE, Y HAY QUE MIRARLO ANTES DE PREGUNTAR'));

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

comp('P1 sigue entero: la repregunta del municipio funciono en vivo',
     p.includes('"¿en qué municipio está ese domicilio?"'));
comp('el municipio sigue siendo obligatorio y sin deducir del CP',
     /EL MUNICIPIO ES OBLIGATORIO Y VA EN SU PROPIO PARÁMETRO/.test(p) &&
     /ese código NO se deduce del código postal/.test(p));


// ══════════════════════════════════════════════════════════════════════════════
// LOS CUATRO CAMBIOS DEL v13 (conversacion 215475580835251)
// ══════════════════════════════════════════════════════════════════════════════

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
// 03/09 tarde · RE-BASELINE EXPLICITO: el pasaporte se sigue guardando pero YA NO es salida valida
// como sustituto del NIE (decision del usuario: NIF/NIE obligatorio, si o si).
comp('C1 · el pasaporte se guarda pero NO sustituye al NIE (03/09); el v15 si lo daba por bueno',
     /EL NIF O EL NIE ES OBLIGATORIO, SÍ O SÍ/.test(p) && /un pasaporte NO sustituye al NIE/.test(p) &&
     !/pídele entonces el número de pasaporte, guárdalo y sigue/.test(p) && /pídele entonces el número de pasaporte, guárdalo y sigue/.test(v15));
// 03/09 tarde · RE-BASELINE EXPLICITO: la frase cambia (el NIE pasa a ser obligatorio) pero la
// conversacion sigue sin bloquearse: se sigue con D4 y se pide el NIE al cerrar.
// 03/09 (2a vuelta) · RE-BASELINE EXPLICITO E INVERTIDO: sin NIE la conversacion NO AVANZA. El v15 decia
// «no insistas ni le bloquees»; ahora se bloquea a proposito (decision del usuario: si o si).
comp('C1 · 03/09: sin NIE la conversacion NO avanza (el v15 decia lo contrario)',
     /SI TE DICE QUE AÚN NO LO TIENE, LA CONVERSACIÓN NO AVANZA/.test(p) && !/no le bloquees/.test(p) && /no insistas ni le bloquees la conversación/.test(v15));
comp('C1 · sigue prohibido que el agente valide el identificador',
     /NO valides el dato ni juzgues si es correcto/.test(p));
comp('C1 · y tampoco decide el si es NIE o pasaporte',
     /NO DEDUZCAS TÚ si lo que te ha dado es un NIE o un pasaporte/.test(p));

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

comp('C3 · hijos es PF7 y observaciones es PF8',
     p.includes('- PF7 — Hijos:') && p.includes('- PF8 — Observaciones'));
comp('C3 · y en el fichero PF7 va ANTES que PF8, no como en el v12',
     p.indexOf('- PF7 — Hijos:') < p.indexOf('- PF8 — Observaciones') &&
     v12.indexOf('- PF8 — Hijos:') < v12.indexOf('- PF7 — Observaciones'));

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

// ── EL CAMBIO DEL v14 · EL SLA DEL ESCALADO (M6, 26/08) ─────────────────────
comp('SLA · la regla 11 dice el plazo al remitir a support',
     /support@taxdown\.es, diciendo que el equipo responde en 24-48 horas/.test(p),
     'la regla 11 tiene que decir el plazo, no solo el correo');
comp('SLA · y acota que ese es el UNICO plazo que puede dar',
     /el ÚNICO plazo de respuesta que puedes dar es ese/.test(p));
comp('SLA · el NIVEL 2 del escalado tambien lo dice',
     /lo coge desde aquí, normalmente en 24-48 horas/.test(p));
comp('SLA · el v13 NO lo decia en la regla 11 (el cambio es real)',
     !/diciendo que el equipo responde en 24-48 horas/.test(v13));
comp('SLA · el v13 NO lo decia en el NIVEL 2 (el cambio es real)',
     !/normalmente en 24-48 horas/.test(v13));
comp('SLA · sigue habiendo 4 promesas de REVISION del expediente, ni una mas',
     cuenta(p, 'revisa') >= 3 && cuenta(p, 'en 24-48 horas') === cuenta(v13, 'en 24-48 horas') + 2,
     `el v15 tiene ${cuenta(p, 'en 24-48 horas')} y el v13 ${cuenta(v13, 'en 24-48 horas')}: esperado +2`);
comp('SLA · no se ha colado ningun otro plazo inventado',
     !/(72|24) ?h(oras)? h[aá]biles/.test(p) && !/en un plazo de \d+ d[ií]as/.test(p));


// ══════════════════════════════════════════════════════════════════════════════
// PARTE 2 · LO NUEVO DEL v15 · UN SOLO AGENTE CONVERSACIONAL
// Cada cosa que se anade, aqui tiene su comprobacion. Sin excepcion.
// ══════════════════════════════════════════════════════════════════════════════

// ── N0 · LO QUE MANDA SOBRE TODO: el conocimiento fiscal NO SE HA TOCADO ─────
// Es la mitad del encargo y la unica parte aprobada por Fiscal (Alina, 11/08).
// No se compara «que siga estando»: se compara BYTE A BYTE contra el v14.
{
  const INI = 'CONOCIMIENTO FISCAL DEL RÉGIMEN (lo único que puedes afirmar sobre normativa)';
  const FIN = 'EJEMPLO 1 — CASO CLARO';
  const bloque15 = p.slice(p.indexOf(INI), p.indexOf(FIN));
  const bloque14 = v14.slice(v14.indexOf(INI), v14.indexOf(FIN));
  comp('N0 · el bloque de conocimiento fiscal existe y se localiza igual en los dos',
       p.indexOf(INI) > 0 && v14.indexOf(INI) > 0 && bloque15.length > 12000,
       `v15=${bloque15.length} car., v14=${bloque14.length} car.`);
  // 03/09 · el bloque fiscal ya NO es byte a byte el del v14: lleva TRES parches de copy (la regla 1,
  // la paternidad y el disclaimer), y ninguno toca una afirmacion normativa. La puerta aplica esos
  // tres parches al bloque del v15 (que SI era byte a byte el del v14) y exige igualdad exacta: un
  // cuarto cambio, o un parche distinto, la pone en rojo.
  const PARCHES_FISCAL = [
    ["1. No des asesoramiento personalizado ni cálculos de cuota concretos. Puedes explicar el régimen y\n   sus umbrales generales; el número de cada caso lo da el equipo.",
     "1. No des cálculos de cuota concretos ni prometas un resultado. Puedes explicar el régimen y\n   sus umbrales generales; el número de cada caso lo dan nuestros asesores al preparar los borradores.\n   Y no le digas al cliente que «no es asesoramiento»: tú hablas por el equipo de asesores."],
    ["  al régimen. SÍ TRIBUTAN, y si preguntan se dice claro. (Ya está dicho en el resumen del régimen del\n  principio; aquí va el motivo, que es la diferencia entre IRPF e IRNR.)",
     "  al régimen. SÍ TRIBUTAN, y si preguntan se dice claro: la baja por paternidad NO exime de pagar el 24 %\n  del régimen, aunque compañeros suyos le hayan dicho lo contrario; se sigue pagando sobre ella. (Ya está\n  dicho en el resumen del régimen del principio; aquí va el motivo, que es la diferencia entre IRPF e IRNR.)"],
    ["DISCLAIMER, y va en cuanto expliques normativa\n\nCuando des una explicación de este bloque, deja claro una vez —sin repetirlo en cada mensaje— que es\ninformación general sobre el régimen y no asesoramiento personalizado sobre su caso.",
     "CÓMO HABLAR DE NORMATIVA: EN NOMBRE DEL EQUIPO DE ASESORES\n\nCuando des una explicación de este bloque, NO digas que «es información general» ni que «no es\nasesoramiento personalizado»: eso aleja al cliente y le quita confianza. Habla como parte del equipo\nde asesores de TaxDown. Si la duda depende de su caso concreto, di que nuestros asesores lo revisan al\npreparar sus borradores y que se lo confirmarán ahí. Lo que no está escrito en este bloque sigue sin\ncontestarse (regla 11), pero sin la coletilla."]
  ];
  const bloqueV15 = v15.slice(v15.indexOf(INI), v15.indexOf(FIN));
  comp('N0 · el bloque fiscal del v15 era byte a byte el del v14 (la base de la comparacion)', bloqueV15 === bloque14);
  let esperado = bloqueV15, anclasOk = true;
  for (const [a, b] of PARCHES_FISCAL) { if (cuenta(esperado, a) !== 1) anclasOk = false; esperado = esperado.replace(a, b); }
  comp('N0 · los tres parches del 03/09 anclan exactamente una vez en el bloque del v15', anclasOk);
  comp('N0 · el bloque de conocimiento fiscal es BYTE A BYTE el del v14 + los TRES parches de copy del 03/09',
       bloque15 === esperado,
       'primera divergencia en el caracter ' + (() => {
         for (let i = 0; i < Math.max(esperado.length, bloque15.length); i++) {
           if (esperado[i] !== bloque15[i]) return i + ' → esperado:' + JSON.stringify(esperado.slice(i, i + 60)) + ' v16:' + JSON.stringify(bloque15.slice(i, i + 60));
         }
         return 'ninguna (solo cambia la longitud)';
       })());
  comp('N0 · y sus dos reglas de cabecera siguen mandando sobre el bloque',
       /LA ÚNICA fuente de la que puedes sacar/.test(p) &&
       /NO DEDUZCAS OBLIGACIONES DE DECLARAR A PARTIR DE REGLAS DE TRIBUTAR/.test(p));
  comp('N0 · los cuatro casos de la DGT y el 720/721 siguen dentro',
       ['DEDUCCIÓN POR MADRE TRABAJADORA','CV 1662-23','V2126-23','BIENES EN EL EXTRANJERO (Modelos 720 y 721)']
         .every(x => p.includes(x)));
  // 03/09 · RE-BASELINE EXPLICITO: el disclaimer se RETIRA por decision del usuario (el bot no dice
  // que «no es asesoramiento»); en su lugar va la seccion de como hablar en nombre del equipo.
  comp('N0 · el disclaimer del bloque fiscal HA DESAPARECIDO (03/09) y el v15 si lo tenia',
       !/no asesoramiento personalizado sobre su caso/.test(p) && /no asesoramiento personalizado sobre su caso/.test(v15));
  comp('N0 · en su lugar esta CÓMO HABLAR DE NORMATIVA: EN NOMBRE DEL EQUIPO DE ASESORES',
       cuenta(p, 'CÓMO HABLAR DE NORMATIVA: EN NOMBRE DEL EQUIPO DE ASESORES') === 1 && !/DISCLAIMER, y va en cuanto expliques normativa/.test(p));
}

// ── N1 · EL BLOQUE DE APERTURA ──────────────────────────────────────────────
comp('N1 · existe el BLOQUE 0 · APERTURA y ya no se llama INTRODUCCIÓN',
     p.includes('BLOQUE 0 · APERTURA (el primer mensaje ya eres tú)') &&
     !p.includes('BLOQUE 0 · INTRODUCCIÓN'));
comp('N1 · dice que el bot lleva la conversacion desde el primer mensaje',
     /LLEVAS LA CONVERSACIÓN ENTERA, DESDE EL PRIMER MENSAJE/.test(p));
comp('N1 · la bienvenida es la REAL del canvas, no una inventada',
     p.includes('"¡Hola! Te ayudamos a comprobar si puedes acogerte a la Ley Beckham.') &&
     p.includes('Pero... ¿Qué es?'));
comp('N1 · con las dos lineas de que es el regimen, literales',
     p.includes('Es un régimen especial para quienes se trasladan a España por motivos profesionales.') &&
     p.includes('sobre los ingresos del trabajo.'));
comp('N1 · y con los dos requisitos y el departamento Mobility, literales',
     p.includes('no debes haber sido residente fiscal en España en los 5 años anteriores y tienes 6 meses desde el alta en la') &&
     p.includes('En el departamento Mobility revisamos tu caso, preparamos la documentación y presentamos la solicitud ante Hacienda.'));
comp('N1 · termina con la pregunta de arranque del canvas',
     p.includes('¿Comprobamos si cumples los requisitos?"'));
comp('N1 · el v14 NO tenia la bienvenida del canvas (el cambio es real)',
     !v14.includes('Te ayudamos a comprobar si puedes acogerte a la Ley Beckham'));
comp('N1 · y su mensaje de arranque viejo ha desaparecido',
     !p.includes('¡Hola! Te ayudo a comprobar en unos minutos si puedes acogerte al régimen Beckham') &&
     v14.includes('¡Hola! Te ayudo a comprobar en unos minutos si puedes acogerte al régimen Beckham'));
comp('N1 · la guarda de la doble presentacion (Intercom manda el mismo texto)',
     /SI LA BIENVENIDA YA ESTÁ EN EL HISTORIAL, NO LA REPITAS/.test(p));
comp('N1 · le dice al cliente que puede preguntar lo que quiera',
     /pregúntame\nlo que quieras antes de empezar; no hay límite/.test(p) ||
     /pregúntame lo que quieras antes de empezar; no hay límite/.test(p));
comp('N1 · la exencion del maximo de frases para la bienvenida',
     /EXCEPCIÓN, Y ES LA ÚNICA: el mensaje de bienvenida del BLOQUE 0 va entero/.test(p));
comp('N1 · si el primer mensaje viene en ingles, se atiende en ingles desde ahi',
     /SI SU PRIMER MENSAJE YA VIENE EN INGLÉS/.test(p));

// ── N2 · LAS CUATRO INTENCIONES DEL MENU, que en el v14 no existian ─────────
{
  const OPCIONES = [
    'Sí, quiero comprobar si cuento con los requisitos',
    'No, no creo que cumpla los requisitos',
    'Tengo más preguntas',
    'Quiero calcular cuánto me beneficiaría la Ley Beckham',
  ];
  comp('N2 · las cuatro opciones de arranque estan con sus palabras literales',
       OPCIONES.every(o => p.includes(o)),
       'faltan: ' + OPCIONES.filter(o => !p.includes(o)).join(' | '));
  comp('N2 · y el v14 no tenia ninguna de las cuatro',
       OPCIONES.every(o => !v14.includes(o)));
}
comp('N2 · dice que el cliente NO tiene botones y que hay que interpretar',
     /El cliente NO tiene botones/.test(p));
comp('N2 · el autodescarte declarado NO es un descarte y no cierra nada',
     /NO ES UN DESCARTE Y NO CIERRAS NADA/.test(p) &&
     /NO mandes `motivo_cierre`, NO llames a guardar_datos_cliente y NO le digas que le descartamos/.test(p));
comp('N2 · la calculadora: no hay enlace y no se inventa',
     /no tenemos ninguna calculadora que darle y NO TE INVENTES UN\s+ENLACE \(regla 12\)/.test(p));
comp('N2 · y esta tambien donde se responde si le compensa',
     /SI TE PIDE UNA CALCULADORA O UN SIMULADOR/.test(p));
comp('N2 · el modo preguntas es ilimitado y con dos empujones, en el 5 y en el 10',
     /NO HAY TOPE DE PREGUNTAS/.test(p) &&
     /unas 5 respuestas sin que haya empezado la solicitud/.test(p) &&
     /Si llegas a unas 10/.test(p));
comp('N2 · y avisa de que el aislamiento del FAQ se ha perdido a proposito',
     /las preguntas las contestaba otro agente que no tenía esta herramienta/.test(p));

// ── N3 · LOS TRES FILTROS, con su orden y su condicion de descarte ──────────
comp('N3 · los tres filtros se llaman A, B y C y estan los tres',
     p.includes('FILTRO A — RESIDENCIA FISCAL EN ESPAÑA EN LOS ÚLTIMOS 5 AÑOS') &&
     p.includes('FILTRO B — ALTA EN LA SEGURIDAD SOCIAL ESPAÑOLA') &&
     p.includes('FILTRO C — FECHA DE ALTA EN LA SEGURIDAD SOCIAL Y PLAZO DE 6 MESES'));
comp('N3 · y en el fichero van en ese orden: A, luego B, luego C',
     p.indexOf('FILTRO A — RESIDENCIA') < p.indexOf('FILTRO B — ALTA') &&
     p.indexOf('FILTRO B — ALTA') < p.indexOf('FILTRO C — FECHA DE ALTA'));
comp('N3 · la SECUENCIA escrita coincide con ese orden',
     /SECUENCIA: fecha de llegada → FILTRO A \(residencia\) → FILTRO B \(alta en la SS\) → FILTRO C \(fecha de alta \+ plazo con/.test(p));
comp('N3 · LA COLISION DE NUMERACION ESTA RESUELTA: cero F1/F2/F3/F4 en todo el prompt',
     !/\bF[1-4]\b/.test(p),
     'quedan: ' + (p.match(/.*\bF[1-4]\b.*/g) || []).slice(0, 6).join(' | '));
comp('N3 · y el v14 SI las usaba (o sea que el cambio es real)',
     /\bF[1-4]\b/.test(v14));
comp('N3 · dice por que se retira la numeracion vieja',
     /SON TRES FILTROS Y SE LLAMAN A, B Y C/.test(p) &&
     /esa numeración se RETIRA a propósito/.test(p));
comp('N3 · la fecha de llegada sigue preguntandose y NO es un filtro',
     /ANTES DE LOS TRES, UN DATO QUE NO ES UN FILTRO · FECHA DE LLEGADA A ESPAÑA/.test(p) &&
     p.includes('"Para empezar, ¿en qué fecha exacta llegaste a España? (día/mes/año)"'));
comp('N3 · FILTRO A: el «si» es el que descarta, y se dice',
     /OJO AL SENTIDO: aquí el "sí" es el que descarta/.test(p));
comp('N3 · FILTRO A: la aclaracion del NIE del canvas, literal y dentro de la pregunta',
     p.includes('disponer de NIE no determina, por sí solo, la residencia\nfiscal: son trámites administrativos independientes del criterio fiscal.') &&
     /LA ACLARACIÓN DEL NIE VA DENTRO DE LA PREGUNTA/.test(p));
comp('N3 · FILTRO A: el mensaje de descarte del canvas, literal',
     p.includes('"Ups... no puedes acogerte al régimen, has sido residente fiscal en los últimos 5 años.'));
comp('N3 · FILTRO A: el v14 no traia ni el NIE ni el «Ups...»',
     !v14.includes('disponer de NIE no determina') && !v14.includes('Ups...'));
comp('N3 · FILTRO B: si NO esta de alta es LEAD POTENCIAL, no descarte',
     /Si NO → NO ES UN DESCARTE\. Es un LEAD POTENCIAL/.test(p) &&
     /Antes tienes que darte de alta en la Seguridad Social\./.test(p));
comp('N3 · FILTRO B: se le pide la fecha prevista, y «no lo sé» vale',
     p.includes('"¿Para cuándo tienes prevista tu alta en la\n     Seguridad Social? Formato DD/MM/AAAA (por ejemplo 15/03/2027)') &&
     /una fecha aproximada, o un "todavía no lo sé"/.test(p));
comp('N3 · FILTRO B: el lead SE GUARDA, y con la marca en `resumen`',
     /GUARDA EL LEAD, y es la única escritura que se hace antes de los tres filtros/.test(p) &&
     p.includes('"LEAD POTENCIAL - sin alta en la Seguridad Social - fecha prevista: DD/MM/AAAA"'));
comp('N3 · FILTRO C: la pregunta de la fecha de alta sigue igual',
     p.includes('"¿En qué fecha te diste de alta en la Seguridad Social? (día/mes/año)"'));
comp('N3 · la PANTALLA DE DESCARTE ya solo la disparan el FILTRO C y el FILTRO A',
     /PANTALLA DE DESCARTE \(solo para el FILTRO C fuera de plazo o el FILTRO A residente\)/.test(p));
comp('N3 · el cierre de cada salida esta escrito, y los descartes NO mandan motivo_cierre',
     /QUÉ SE GUARDA Y QUÉ SE CIERRA EN CADA SALIDA DEL BLOQUE 1/.test(p) &&
     /NO llames a guardar_datos_cliente y NO mandes `motivo_cierre`/.test(p) &&
     /La conversación se queda ABIERTA/.test(p));
comp('N3 · y se dice que no hay ningun otro valor de motivo_cierre',
     /NO HAY NINGÚN OTRO VALOR DE `motivo_cierre`/.test(p) &&
     /cualquier otro te\nlo devuelve en "descartados"/.test(p));

// ── N4 · LA TOOL calcular_plazo ────────────────────────────────────────────
comp('N4 · calcular_plazo se nombra, y varias veces',
     cuenta(p, 'calcular_plazo') >= 8, 'apariciones: ' + cuenta(p, 'calcular_plazo'));
comp('N4 · el v14 no la nombraba (el cambio es real)', !v14.includes('calcular_plazo'));
comp('N4 · esta declarada como herramienta en la regla 10',
     /- calcular_plazo: dice si está dentro de los 6 meses desde el alta/.test(p));
comp('N4 · la regla 10 dice CINCO herramientas (RE-BASELINE v17: eran CUATRO), y ya no TRES',
     /10\. TIENES CINCO HERRAMIENTAS Y DEBES USARLAS/.test(p) && !/TIENES CUATRO HERRAMIENTAS/.test(p) &&
     !/TIENES TRES HERRAMIENTAS/.test(p) &&
     !/Tienes TRES herramientas/.test(p));
comp('N4 · y el recordatorio final tambien dice CINCO (RE-BASELINE v17) y nombra enviar_autorizacion',
     /^7\. Tienes CINCO herramientas y hay que usarlas: leer_expediente una vez al empezar, calcular_plazo/m.test(p) &&
     /analizar_documento cada vez que el cliente adjunte un fichero y enviar_autorizacion una vez, en el paso de la autorización de TaxDown\./.test(p));
comp('N4 · dice que el bot NO calcula plazos de cabeza',
     /EL PLAZO DE 6 MESES NO LO CALCULAS TÚ NUNCA/.test(p) &&
     /EL PLAZO NO LO CALCULAS TÚ, LO CALCULA calcular_plazo/.test(p));
comp('N4 · manda la fecha en crudo, en su parametro, sin reformatearla',
     /Mándale la fecha en el parámetro `fecha_alta_ss` TAL CUAL la haya escrito el cliente/.test(p));
comp('N4 · declara los cuatro campos que devuelve',
     /`veredicto` \(en_plazo, fuera_plazo o no_valida\)/.test(p) &&
     p.includes('`fecha_alta_ddmmaaaa`') && p.includes('`fecha_limite`') && p.includes('`dias_pasados`'));
comp('N4 · los CUATRO casos del veredicto, no tres',
     /QUÉ HACER CON CADA VEREDICTO, Y SON CUATRO CASOS, NO TRES/.test(p) &&
     /^- `en_plazo` → CUALIFICA/m.test(p) &&
     /^- `fuera_plazo` → DESCARTE/m.test(p) &&
     /^- `no_valida` → LA CULPA ES DEL DATO/m.test(p) &&
     /^- SIN VEREDICTO \(la herramienta no contesta, falla, o el veredicto llega vacío\)/m.test(p));
comp('N4 · la politica de reintentos: dos intentos y luego a soporte, sin descartar',
     /DOS INTENTOS COMO MÁXIMO/.test(p) &&
     /no lo\n  intentes una tercera vez/.test(p));
comp('N4 · la distincion no_valida vs sin veredicto es de diseno y esta explicada',
     /La diferencia con\n  `no_valida` es de diseño: repreguntarle al cliente por un fallo nuestro es maltratarle/.test(p));
comp('N4 · usa la fecha limite y los dias pasados DE LA HERRAMIENTA, no los suyos',
     /usando la `fecha_limite` que te ha dado la herramienta y ninguna otra/.test(p) &&
     /nunca los estimes tú/.test(p));
comp('N4 · LA ROTURA MAS CARA TAPADA: la fecha de alta se guarda tras el veredicto',
     /Y EN CUANTO EL VEREDICTO SEA `en_plazo`, GUARDA LA FECHA DE ALTA/.test(p) &&
     /hasta el 31\/08\/2026 esa fecha la escribía el formulario previo y ya no la escribe/.test(p));
// 03/09 · RE-BASELINE EXPLICITO: ahora SI hay parametro (fecha_limite_plazo) y se dice; el v15 decia que no.
comp('N4 · ya dice que la fecha limite tiene parametro (fecha_limite_plazo), y el v15 decia que no habia',
     /la fecha límite va en su propio parámetro, `fecha_limite_plazo`/.test(p) && /No existe ningún parámetro para la fecha límite/.test(v15));
comp('N4 · el veredicto del plazo NO se hereda del contexto: se recalcula',
     /EL VEREDICTO DEL PLAZO NO SE HEREDA NUNCA/.test(p));
comp('N4 · y la mentira del v14 sobre el formulario previo ha desaparecido',
     !p.includes('YA SE HICIERON antes de que llegaras tú, en el formulario previo') &&
     v14.includes('YA SE HICIERON antes de que llegaras tú, en el formulario previo'));
// EL GATE DE WP-220 AL REVES: ninguna tool que no exista. Los tres nombres del
// sidecar muerto y los alias con los que casi se bautizo la del plazo incluidos.
{
  const FANTASMA = ['buscar_contexto_fiscal','comprobar_plazo','escalar_humano','registrar_optout',
                    'beckham_f2_plazo','calcular_ahorro','agendar_llamada','cerrar_conversacion',
                    'consultar_plazo','guardar_documento','analizar_plazo','leer_contexto'];
  comp('N4 · no nombra NINGUNA tool que no este cableada',
       FANTASMA.every(t => !p.includes(t)),
       'aparecen: ' + FANTASMA.filter(t => p.includes(t)).join(', '));
  comp('N4 · y las cuatro que nombra son las cuatro que existen',
       ['leer_expediente','calcular_plazo','guardar_datos_cliente','analizar_documento'].every(t => p.includes(t)));
}

// ── N5 · CUANDO NO SE GUARDA (regla 10) ───────────────────────────────────
comp('N5 · existe la regla de cuando NO se llama a guardar_datos_cliente',
     /CUÁNDO NO SE LLAMA, Y ESTO ES NUEVO DEL 31\/08\/2026/.test(p));
comp('N5 · dice que la primera llamada CREA el expediente',
     /la primera llamada a esta herramienta CREA el expediente del\ncliente/.test(p) ||
     /la primera llamada a esta herramienta CREA el expediente del cliente/.test(p));
comp('N5 · los cuatro casos en los que no se llama estan escritos',
     /mientras el cliente solo esté preguntando cosas del régimen\. Ni una vez\./.test(p) &&
     /antes de que haya contestado los tres filtros, salvo las DOS excepciones/.test(p) &&
     /en un descarte \(FILTRO A residente, o FILTRO C fuera de plazo\): ahí no se guarda nada de nada/.test(p) &&
     /para "dejar constancia" de algo/.test(p));
comp('N5 · la frase que resume el riesgo esta, y en mayusculas',
     /UN CLIENTE QUE SOLO PREGUNTA NO DEBE ACABAR CON EXPEDIENTE ESCRITO/.test(p));
comp('N5 · leer_expediente queda declarada como de solo lectura',
     /Solo LEE, no escribe nada, así que se puede llamar aunque el cliente venga solo a preguntar/.test(p));
comp('N5 · el recordatorio final tambien lo dice',
     /^13\. MIENTRAS SOLO PREGUNTA, NO SE GUARDA NADA/m.test(p));
comp('N5 · y el ejemplo de solo preguntas acaba con cero escrituras',
     /EJEMPLO 10 — SOLO PREGUNTAS \(y no se guarda nada\)/.test(p) &&
     /Cero llamadas a guardar_datos_cliente en toda la conversación/.test(p));

// ── N6 · EL SALTO DE ORDEN ────────────────────────────────────────────────
comp('N6 · existe la seccion del salto de orden',
     p.includes('EL ORDEN, Y LO QUE PASA CUANDO EL CLIENTE SE LO SALTA'));
comp('N6 · y las dos reglas criticas nuevas apuntan a ella',
     /15\. EL ORDEN LO SOSTIENES TÚ, NO EL CLIENTE/.test(p) &&
     cuenta(p, 'EL ORDEN, Y LO QUE PASA CUANDO EL CLIENTE SE LO SALTA') >= 3);
comp('N6 · el tablero de las tres casillas, antes de cada respuesta',
     /TABLERO DE CONTROL\. Antes de cada respuesta tuya, y en silencio/.test(p) &&
     /A · residencia fiscal en los últimos 5 años → contestada \/ sin contestar/.test(p) &&
     /B · alta en la Seguridad Social → contestada \/ sin contestar/.test(p) &&
     /C · fecha de alta y veredicto de calcular_plazo → contestada \/ sin contestar/.test(p));
comp('N6 · LA REGLA DURA: nadie cualificado sin los tres filtros',
     /NO DES POR CUALIFICADO A NADIE SIN LOS TRES FILTROS/.test(p) &&
     /Sin las tres casillas no se pasa al\nBloque 2/.test(p));
comp('N6 · un filtro solo cuenta con respuesta explicita, y da los tres contraejemplos',
     /UN FILTRO SOLO CUENTA CON UNA RESPUESTA EXPLÍCITA SUYA/.test(p) &&
     p.includes('"me mudé el año pasado" no') &&
     p.includes('"ya estoy trabajando" no contesta el FILTRO B') &&
     p.includes('"empecé en junio" no contesta el FILTRO C'));
comp('N6 · caso 1: pregunta antes de contestar → contestar Y retomar en el mismo mensaje',
     /TE PREGUNTA ALGO ANTES DE CONTESTARTE/.test(p) &&
     /CONTESTA Y RETOMA EN EL MISMO\n   MENSAJE/.test(p));
comp('N6 · caso 2: datos a medias o todos de golpe → seguir por la casilla vacia',
     /TE DA LOS DATOS A MEDIAS, O TODOS DE GOLPE/.test(p) &&
     /sigue por la primera casilla del tablero que siga vacía/.test(p) &&
     /NO los guardes\n   todavía/.test(p));
comp('N6 · caso 3: cambia de tema → respuesta corta y vuelta al flujo',
     /CAMBIA DE TEMA/.test(p) && /Respuesta corta y de vuelta al flujo, en el\n   mismo mensaje/.test(p));
comp('N6 · caso 4: contesta con otra pregunta → misma pregunta, mismas palabras',
     /CONTESTA A TU PREGUNTA CON OTRA PREGUNTA/.test(p) &&
     /vuelve a formular LA MISMA pregunta, con las mismas palabras/.test(p));
comp('N6 · y la regla que vale para los cuatro: una sola pregunta por mensaje',
     /UNA SOLA PREGUNTA TUYA POR MENSAJE/.test(p));
comp('N6 · el ejemplo del salto de orden existe y no guarda antes de tiempo',
     /EJEMPLO 8 — EL CLIENTE SE SALTA EL ORDEN \(contestar y retomar\)/.test(p) &&
     /El nombre y el NIE NO se guardan todavía: falta el FILTRO C/.test(p));
comp('N6 · el ejemplo del fallo de la herramienta tambien',
     /EJEMPLO 9 — LA HERRAMIENTA DEL PLAZO NO CONTESTA \(fallo nuestro\)/.test(p) &&
     /NO se repregunta la fecha, NO se calcula a mano, NO se descarta/.test(p));
comp('N6 · el v14 no tenia ninguna de las dos secciones nuevas',
     !v14.includes('TABLERO DE CONTROL') && !v14.includes('EL ORDEN, Y LO QUE PASA CUANDO EL CLIENTE SE LO SALTA'));

// ── N7 · EL INTAKE Y EL RESTO DEL FLUJO SIGUEN ENTEROS ────────────────────
{
  const DATOS = ['- D0 — IDIOMA DE ATENCIÓN','- D1 — Nombre y apellidos','- D2 — Teléfono','- D3 — NIF o NIE',
                 '- D4 — Nacionalidad','- D5 — Domicilio de notificaciones','- D6 — Fecha de nacimiento',
                 '- D7 — País de nacimiento','- D8 — Municipio y provincia de nacimiento',
                 '- D9 — Último país de residencia','- D10 — Sexo'];
  comp('N7 · los once datos del Bloque 2 (D0-D10) siguen los once',
       DATOS.every(d => p.includes(d)),
       'faltan: ' + DATOS.filter(d => !p.includes(d)).join(' | '));
}
comp('N7 · el Bloque 6, el Bloque 8 y el CIERRE siguen en pie y en su orden',
     p.indexOf('BLOQUE 3 · PREGUNTAS DE PERFIL') < p.indexOf('BLOQUE 6 · ENRUTADO FINAL') &&
     p.indexOf('BLOQUE 6 · ENRUTADO FINAL') < p.indexOf('BLOQUE 8 · CAPTURA GUIADA') &&
     p.indexOf('BLOQUE 8 · CAPTURA GUIADA') < p.indexOf('\nCIERRE DE LA CONVERSACIÓN\n'));
comp('N7 · D0 ya no dice que la conversacion venga escrita por un formulario',
     !p.includes('ESOS MENSAJES NO LOS HAS ESCRITO TÚ') &&
     v14.includes('ESOS MENSAJES NO LOS HAS ESCRITO TÚ'));
comp('N7 · D0 sigue siendo la unica fuente del idioma y con su guarda antibucle',
     /esta pregunta es la ÚNICA fuente del dato/.test(p) &&
     /Volver a preguntar el idioma después de/.test(p) &&
     /atrapado en un bucle/.test(p));
comp('N7 · la validacion de la fecha de alta ya no la hace el bot',
     /- Fecha de alta en la SS: NO la valides tú/.test(p));
comp('N7 · los dos motivos de cierre siguen siendo esos dos y solo esos',
     cuenta(p, '"llamada agendada"') >= 1 && cuenta(p, '"expediente completo"') >= 1 &&
     !/motivo_cierre` con "descarte/.test(p));
comp('N7 · el Empresa=TaxDown del escritor no se menciona ni se toca aqui',
     !p.includes("Empresa = 'TaxDown'") && !p.includes('Empresa=TaxDown'));

// ── LOS TRES AGUJEROS QUE ENCONTRO EL ATAQUE ADVERSARIAL DEL 31/08 ───────────
// La verificacion adversarial mutó el prompt 22 veces y esta puerta cazó 19. Los
// tres falsos verdes eran de la MISMA clase, y la clase es la leccion: la puerta
// anclaba en la PROSA DE AVISO (el «⚠️ OJO AL SENTIDO», el «no intentes una tercera
// vez») y NUNCA en la LINEA OPERATIVA que el modelo obedece. O sea que se podia
// invertir la instruccion dejando el aviso intacto, y salia con 198 verdes y exit 0.
// Aqui se ancla la linea operativa, literal.

// AGUJERO 1 · la polaridad del unico filtro que descarta en duro. La mutacion que
// pasaba era `- Si SÍ (fue residente) → DESCARTE` -> `- Si NO (no fue residente) →
// DESCARTE`, que descarta a TODO EL QUE CUMPLE y deja pasar al que no. Es justo la
// trampa contra la que el propio prompt avisa dos lineas antes.
comp('N2 · FILTRO A: la RAMA que descarta es el SI, literal',
     /^- Si SÍ \(fue residente\) → DESCARTE/m.test(p));
comp('N2 · FILTRO A: la rama que continua es el NO, literal',
     /^- Si NO → continuar al FILTRO B\./m.test(p));
comp('N2 · FILTRO A: y no existe la version invertida',
     !/Si NO \(no fue residente\) → DESCARTE/.test(p) &&
     !/Si SÍ.{0,20}→ continuar al FILTRO B/.test(p));

// AGUJERO 2 · la cabecera de cada filtro. La comprobacion N3 miraba el CUERPO del
// FILTRO B, asi que voltear su cabecera a «ESTE DESCARTA:» pasaba: el prompt se
// quedaba contradiciendose a si mismo (cabecera «descarta», cuerpo «no es un
// descarte») y la puerta no lo veia. Se cuentan las tres cabeceras exactas: A y C
// descartan, B no, y ni una mas de cada.
comp('N3 · FILTRO B: la CABECERA dice que NO descarta a nadie',
     /^FILTRO B — .*\. ESTE NO DESCARTA A NADIE:$/m.test(p));
comp('N2 · las cabeceras que SI descartan son exactamente dos, A y C',
     cuenta(p, '. ESTE DESCARTA:') === 2 &&
     /^FILTRO A — .*\. ESTE DESCARTA:$/m.test(p) &&
     /^FILTRO C — .*\. ESTE DESCARTA:$/m.test(p));
comp('N3 · y «ESTE NO DESCARTA A NADIE» aparece UNA vez, la del B',
     cuenta(p, 'ESTE NO DESCARTA A NADIE') === 1);

// AGUJERO 3 · el numero de reintentos. `dos intentos` -> `tres intentos` pasaba
// porque N4 anclaba en la prosa («no intentes una tercera vez») y no en el numero.
// Dos es el numero acordado: al tercero se va a soporte, sin descartar.
comp('N4 · el numero de reintentos es DOS, escrito, en sus dos sitios',
     cuenta(p, 'dos intentos') === 2);
comp('N4 · y no hay ni una aparicion de «tres intentos»',
     !/tres intentos/.test(p));


// ══════════════════════════════════════════════════════════════════════════════
// PARTE 3 · LO NUEVO DEL v16 (03/09/2026), cada cosa con su comprobacion
// Decidido por el usuario sobre la conversacion real 215475755624195 del 02/09.
// Regla de la casa: anclar la LINEA OPERATIVA y CONTAR apariciones, no la prosa de aviso.
// ══════════════════════════════════════════════════════════════════════════════

// ── V16-1 · FUERA EL «NO ES ASESORAMIENTO»: el bot habla por el equipo de asesores ─
comp('V16-1 · cero apariciones de «no asesoramiento» (el v15 tenia 2, mas una partida por salto de linea)',
     cuenta(p, 'no asesoramiento') === 0 && cuenta(v15, 'no asesoramiento') === 2 && cuenta(p.replace(/\n/g, ' '), 'no asesoramiento') === 0,
     `v16=${cuenta(p, 'no asesoramiento')} v15=${cuenta(v15, 'no asesoramiento')}`);
comp('V16-1 · «asesoramiento» solo sobrevive dentro de la prohibicion de decirlo, y en «llamada de asesoramiento»',
     p.split('\n').filter(l => /asesoramiento/.test(l)).every(l => /«[^»]*asesoramiento[^»]*»|llamada de asesoramiento|no es\n?asesoramiento/.test(l) || /^asesoramiento personalizado»/.test(l)),
     p.split('\n').filter(l => /asesoramiento/.test(l) && !/«|llamada de asesoramiento/.test(l)).join(' | '));
comp('V16-1 · «información general» solo aparece entre comillas angulares, como lo que NO hay que decir',
     cuenta(p, 'información general') === 2 && cuenta(p, '«es información general»') === 2);
comp('V16-1 · la prohibicion esta en LO QUE NO DEBES HACER NUNCA',
     /- No decirle NUNCA al cliente que «esto no es asesoramiento» ni que «es información general»/.test(p));
comp('V16-1 · y la regla 1 del bloque fiscal ya no pide «no asesoramiento personalizado»',
     /1\. No des cálculos de cuota concretos ni prometas un resultado\./.test(p) && !/1\. No des asesoramiento personalizado/.test(p));
comp('V16-1 · el ejemplo 10 contesta sin la coletilla',
     /sí tributa en este régimen: se paga el 24 % sobre ella igual, aunque algún compañero te haya dicho lo contrario/.test(p) &&
     !/Es información general del régimen, no asesoramiento sobre tu caso/.test(p));

// ── V16-2 · LOS BORRADORES LOS HACEN NUESTROS ASESORES ─────────────────────────
comp('V16-2 · «nuestros asesores» aparece 7 veces o mas (el v15 tenia 0)',
     cuenta(p, 'uestros asesores') >= 7 && cuenta(v15, 'uestros asesores') === 0, 'x' + cuenta(p, 'uestros asesores'));
comp('V16-2 · el resumen del regimen dice quien hace el trabajo y en que orden',
     /- Nuestros asesores comprueban los requisitos, preparan los borradores de los Modelos 030 y 149, los revisan, se los envían al cliente para su visto bueno y después los presentan ante Hacienda\./.test(p));
comp('V16-2 · el mensaje tras la documentacion: preparan ellos mismos los borradores y los envian para el visto bueno',
     /Nuestros asesores la revisan en 24-48 horas y, si está todo correcto, preparan ellos mismos los borradores de tus Modelos 030 y 149, los revisan y te los envían para que les des el visto bueno antes de presentarlos\./.test(p));
comp('V16-2 · el mensaje de CIERRE: revisan, preparan, envian para aprobar, presentan',
     /Nuestros asesores revisan tu expediente en 24-48 horas, preparan los borradores y, una vez revisados, te los envían para que los apruebes antes de presentarlos ante Hacienda\./.test(p));
comp('V16-2 · la ficha de la AEAT recuerda que los borradores los preparan nuestros asesores',
     /nuestros asesores revisan su expediente en 24-48 horas y preparan sus borradores\./.test(p));
comp('V16-2 · el SLA de 24-48 h no cambia de recuento (los mensajes siguen siendo los mismos)',
     cuenta(p, 'en 24-48 horas') === cuenta(v15, 'en 24-48 horas'));
comp('V16-2 · el mensaje de cierre sigue terminando con la pregunta de dudas',
     /antes de presentarlos ante Hacienda\. ¿Te queda alguna duda antes de cerrar\?"/.test(p));

// ── V16-3 · PATERNIDAD: sigue tributando aunque los compañeros digan lo contrario ─
comp('V16-3 · la decision cerrada del 17/08 se mantiene (SÍ tributa)',
     /prestación por paternidad \(y la de maternidad\) de la Seguridad Social SÍ tributa/.test(p));
comp('V16-3 · el resumen dice que NO exime de pagar el 24 % aunque un compañero diga lo contrario',
     /AUNQUE UN COMPAÑERO O CONOCIDO LE HAYA DICHO LO CONTRARIO: la baja por paternidad NO exime de pagar el 24 % del régimen, se sigue pagando sobre ella igual\./.test(p));
comp('V16-3 · el bloque fiscal lo repite con el mismo sentido',
     /la baja por paternidad NO exime de pagar el 24 %\n  del régimen, aunque compañeros suyos le hayan dicho lo contrario; se sigue pagando sobre ella\./.test(p));
comp('V16-3 · «NO exime» aparece exactamente 2 veces y «SÍ exime» ninguna (caza el volteo)',
     cuenta(p, 'NO exime de pagar el 24 %') === 2 && !/SÍ exime/.test(p) && !/sí exime/.test(p));

// ── V16-4 · PAREJA DE HECHO -> SOLTERO ante Hacienda ───────────────────────────
comp('V16-4 · PF6a: pareja de hecho se pasa como SOLTERO, con el porque, y NO se pregunta PF6b',
     /Si te dice "pareja de hecho", pásalo como soltero: aunque en España la pareja de hecho tenga ciertos beneficios, ante Hacienda a estos efectos cuenta como soltero, y por eso tampoco le preguntes PF6b\./.test(p));
comp('V16-4 · la validacion lo dice igual',
     /"Pareja de hecho" se pasa como soltero \(ante Hacienda, a estos efectos, no cuenta como casado\) y "viudo" como soltero/.test(p));
comp('V16-4 · el v15 decia lo contrario (o sea que el cambio es real)',
     /Si te dice "pareja de hecho", pásalo como casado/.test(v15) && /"Pareja de hecho" se pasa como casado/.test(v15));
comp('V16-4 · ninguna regla dice ya «pareja de hecho ... pásalo/se pasa como casado»',
     !/pareja de hecho[^.\n]*(pásalo|se pasa) como casado/i.test(p) && /pareja de hecho[^.\n]*(pásalo|se pasa) como casado/i.test(v15));
comp('V16-4 · PF6b sigue condicionado SOLO a casado', p.includes('PF6b — (condicional, solo si es casado):'));
comp('V16-4 · la pregunta al cliente sigue ofreciendo solo las tres opciones',
     p.includes('¿Cuál es tu estado civil: soltero, casado o divorciado?'));

// ── V16-5 · AVISO DE PASAPORTE: pedir el NIE una vez ───────────────────────────
comp('V16-5 · D3 explica que hacer con `aviso_pasaporte`',
     /SI EL SISTEMA TE DEVUELVE `aviso_pasaporte` EN DESCARTADOS, es que lo que te ha dado es un pasaporte y el NIF\/NIE sigue vacío\./.test(p));
comp('V16-5 · la pregunta literal al cliente esta escrita, y dice que el NIE es si o si',
     /"Ese número es de pasaporte; lo guardo, pero para presentar la solicitud necesitamos sí o sí tu NIE\. ¿Cuál es\?"/.test(p));
comp('V16-5 · sin NIE: NO sigue con D4, NO pide mas datos ni documentos y NO manda motivo_cierre',
     /NO sigas con D4, NO pidas más datos ni documentos y NO mandes `motivo_cierre`\./.test(p));
comp('V16-5 · la frase literal al cliente esta escrita y deja la conversacion abierta',
     /"Para seguir necesitamos tu NIE\. En cuanto lo tengas, escríbenos aquí mismo y continuamos donde lo dejamos: lo que ya nos has contado queda guardado\."/.test(p) && /Deja la conversación abierta y no preguntes nada más en ese turno\./.test(p));
comp('V16-5 · el prompt sabe que el sistema devuelve cierre_rechazado y que hacer con el',
     /vuelve en descartados como `cierre_rechazado`; si lo ves, pide el NIE/.test(p));
comp('V16-5 · la definicion de «expediente completo» del CIERRE exige NIF o NIE',
     /Y HAY NIF O NIE GUARDADO: con solo un pasaporte el expediente NO está completo \(D3\)/.test(p));
comp('V16-5 · ya no dice «seguimos con el pasaporte» ni «sigue con D4 y NO vuelvas a preguntarlo»',
     !/seguimos con el pasaporte/.test(p) && !/NO vuelvas a preguntarlo aunque el aviso se repita/.test(p));
comp('V16-5 · si insiste, se repite UNA vez y se remite a soporte (caza el bucle)',
     /Si insiste en seguir sin NIE, repíteselo una vez y ofrécele support@taxdown\.es\./.test(p));
comp('V16-5 · si da el NIE, va en `nif` y sustituye al pasaporte',
     /Si te lo da, mándalo en `nif` \(sustituye al pasaporte\)\./.test(p));
comp('V16-5 · «expediente completo» aparece v15+1 (el cierre_rechazado de D3), ni una mas',
     cuenta(p, 'expediente completo') === cuenta(v15, 'expediente completo') + 1);
comp('V16-5 · las reglas de D3 del v15 siguen intactas (no nombrar el pasaporte, no deducir)',
     /NO NOMBRES EL PASAPORTE EN ESTA PREGUNTA/.test(p) && /NO DEDUZCAS TÚ si lo que te ha dado es un NIE o un pasaporte/.test(p));
comp('V16-5 · `aviso_pasaporte` aparece exactamente 1 vez (una sola instruccion, no dos contradictorias)',
     cuenta(p, 'aviso_pasaporte') === 1);

// ── V16-6 · GENTILICIOS CON ERRATA: pasarlos tal cual ──────────────────────────
comp('V16-6 · la nacionalidad con errata se pasa TAL CUAL y el sistema la tolera',
     /Si te dice un gentilicio o lo escribe con una errata \("algerino", "marroqi"\), pásalo TAL CUAL: el sistema lo traduce y tolera erratas de una o dos letras\./.test(p));
comp('V16-6 · solo se repregunta si vuelve en descartados, con un ejemplo',
     /Solo si te lo devuelve en descartados pídele el nombre del país, con un ejemplo\./.test(p));
comp('V16-6 · ya no dice «Corregir typos evidentes» (eso hacia que el agente adivinara)',
     !/Corregir typos evidentes/.test(p) && /Corregir typos evidentes/.test(v15));

// ── V16-8 · LA FECHA LIMITE VA A AIRTABLE por guardar_datos_cliente (03/09) ────
comp('V16-8 · en en_plazo se manda fecha_limite_plazo en la MISMA llamada que fecha_alta_ss',
     /pasa al Bloque 2\. Y EN LA MISMA LLAMADA a guardar_datos_cliente en la que mandes `fecha_alta_ss`, manda también\n  `fecha_limite_plazo` con esa `fecha_limite` TAL CUAL te la ha devuelto la herramienta \(DD\/MM\/AAAA\)/.test(p));
comp('V16-8 · ya no dice que no existe parametro para la fecha limite (el v15 si)',
     !/No existe ningún parámetro para la fecha límite/.test(p) && /No existe ningún parámetro para la fecha límite/.test(v15));
comp('V16-8 · el parametro se nombra y se dice que para DECIDIR se recalcula (regla 14 intacta)',
     /la fecha límite va en su propio parámetro, `fecha_limite_plazo`, siempre copiada de la herramienta/.test(p) &&
     /para DECIDIR el plazo se recalcula en cada sesión \(regla 14\)/.test(p) && /EL PLAZO DE 6 MESES NO LO CALCULAS TÚ NUNCA/.test(p));
comp('V16-8 · `fecha_limite_plazo` aparece exactamente 3 veces (en_plazo, el parametro y la discrepancia leve), ninguna mas',
     cuenta(p, 'fecha_limite_plazo') === 3 && cuenta(v15, 'fecha_limite_plazo') === 0);
comp('V16-8 · sigue prohibido calcularla el mismo', /Nunca la calcules tú ni la copies de otro día\./.test(p));

// ── V16-9 · DISCREPANCIA DE FECHA DE ALTA POR TRAMOS (03/09 tarde) ─────────────
comp('V16-9 · los 7 dias NO los cuenta el modelo: llama a calcular_plazo con fecha_alta_ss y fecha_documento',
     /NO decidas tú cuánto importa: llama a calcular_plazo con `fecha_alta_ss` = la que te dijo el cliente y `fecha_documento` = la que trae el documento, y mira `discrepancia`\./.test(p));
comp('V16-9 · leve: se TOMA la del documento y se sigue, con la frase literal',
     /· `leve` \(7 días o menos, y con la fecha del documento sigue en plazo\): TOMAMOS LA DEL DOCUMENTO Y SEGUIMOS CON ELLA\./.test(p) &&
     /Como la diferencia es de pocos días, nos quedamos con la del documento, el 13\/07\/2026: tu plazo para solicitarlo queda hasta el 13\/01\/2027\. Si no estás de acuerdo, dímelo y lo revisa contigo un asesor\./.test(p));
comp('V16-9 · leve: se guarda la del documento (fecha_alta_ss, fecha_limite_plazo) y NO se ofrece la llamada',
     /manda `fecha_alta_ss` = `doc_fecha_ddmmaaaa`, `fecha_limite_plazo` = `doc_fecha_limite` y `discrepancia_fecha_alta`\. NO le ofrezcas la llamada\./.test(p));
comp('V16-9 · leve: SOLO si el cliente no esta de acuerdo -> llamada, y la fecha ya no se toca',
     /SOLO si el cliente te contesta que no está de acuerdo o que la buena es la suya, entonces sí: ofrécele la llamada como en el caso grave, no cambies más la fecha/.test(p));
comp('V16-9 · grave: mas de 7 dias, o fuera de plazo, o documento_no_valido -> llamada, como hasta hoy',
     /· `grave` \(más de 7 días, o la fecha del documento le deja fuera de plazo, o `documento_no_valido`\): es motivo de LLAMADA con el asesor fiscal aunque su caso fuera CLARO/.test(p) && /NO cambies la fecha guardada\./.test(p));
comp('V16-9 · grave conserva la frase literal de siempre al cliente',
     /No te preocupes, no es un problema: lo revisa el equipo contigo en una llamada, porque de esa fecha depende el plazo\. Seguimos con el resto de los documentos\./.test(p));
comp('V16-9 · ninguna: no se dice nada', /· `ninguna`: coinciden, no digas nada\./.test(p));
comp('V16-9 · «leve» y «grave» aparecen como tramos exactamente una vez cada uno en la regla (caza el volteo)',
     cuenta(p, '· `leve` (') === 1 && cuenta(p, '· `grave` (') === 1 && /`leve`[^\n]*NO le ofrezcas la llamada/.test(p.split('\n').filter(l => l.includes('· `leve` (')).join('')));
comp('V16-9 · el v15 no tenia tramos (el cambio es real)', !/`leve`/.test(v15) && !/fecha_documento/.test(v15));
comp('V16-9 · lo que NO cambia: la discrepancia sigue sin bloquear, sin cambiar el motivo de cierre y sin convertir en llamada agendada',
     /Esto NO BLOQUEA NADA/.test(p) && /LA DISCREPANCIA NO CAMBIA EL MOTIVO DE CIERRE/.test(p) && /una discrepancia en la fecha de alta NO convierte esto en "llamada agendada"/.test(p));

// ── V16-7 · TAMAÑO Y NADA MAS ROTO ─────────────────────────────────────────────
comp('V16-7 · el v16 crece entre 4.000 y 6.500 caracteres sobre el v15 (caza un fichero truncado o inflado; 15 parches)',
     car(p) - car(v15) >= 4000 && car(p) - car(v15) <= 6500, `+${car(p) - car(v15)}`);
comp('V16-7 · las cuatro tools siguen nombradas',
     ['leer_expediente', 'calcular_plazo', 'guardar_datos_cliente', 'analizar_documento'].every(t => p.includes(t)));
comp('V16-7 · el bloque fiscal sigue midiendo mas de 12.000 caracteres',
     p.slice(p.indexOf('CONOCIMIENTO FISCAL DEL RÉGIMEN'), p.indexOf('EJEMPLO 1 — CASO CLARO')).length > 12000);


// ══════════════════════════════════════════════════════════════════════════════
// PARTE V17 · LA TOOL enviar_autorizacion (04/09/2026)
// ══════════════════════════════════════════════════════════════════════════════
// Se ancla en la LINEA OPERATIVA (la ficha de la tool, el paso del documento y el resumen),
// nunca en la prosa de aviso, y se cuentan apariciones para cazar un volteo.
comp('V17-1 · la ficha de la tool esta en la regla 10, detras de analizar_documento',
     /ANTES de darle las gracias\.\n- enviar_autorizacion: manda al chat, como fichero adjunto, la autorización de TaxDown YA RELLENA/.test(p));
comp('V17-1 · la ficha dice UNA vez, en el paso de la autorizacion, y SOLO con el NIF guardado',
     /Llámala UNA vez, en el paso «Autorización de TaxDown» de DOCUMENTOS A RECOGER, y SOLO si el NIF\/NIE ya está guardado \(sin NIF te devolverá ok:false\)/.test(p));
comp('V17-1 · la ficha pide pasar idioma = es o en',
     /Pásale `idioma` = es o en, el idioma en que estás hablando\./.test(p));
comp('V17-1 · la ficha prohibe repetir el enlace, describir el fichero y decir que lo ha generado',
     /tú NO repitas ningún enlace, NO describas el fichero y NO digas que lo has generado\./.test(p));
comp('V17-1 · la ficha dice que leer ok:true / ok:false y que hacer con cada uno',
     /si devuelve ok:true, sigue con la frase de este paso/.test(p) && /si devuelve ok:false, lee el campo error/.test(p) &&
     /si falla dos veces, di que nuestros asesores le harán llegar la autorización y sigue con el siguiente documento/.test(p));
comp('V17-2 · el paso del documento llama a la tool y NO da enlace',
     /- Autorización de TaxDown: documento con el que nos autorizan a actuar en su representación; solo\n  tienen que firmarlo\. NO le des ningún enlace: llama a la herramienta enviar_autorizacion \(con idioma = es\n  o en\)/.test(p));
comp('V17-2 · el paso trae la frase literal para el cliente (ya rellena, solo firmar y adjuntar)',
     /"acabo de dejarte aquí arriba la autorización ya rellena con tus datos: solo tienes que firmarla y\n  adjuntármela en este mismo paso"/.test(p));
comp('V17-2 · el paso dice que la autorizacion llega SIEMPRE por la herramienta y nunca se inventa un enlace',
     /NUNCA inventes un enlace ni una plantilla:\n  la autorización llega SIEMPRE por la herramienta\./.test(p));
comp('V17-2 · ya no queda la frase vieja «te dejo aquí la autorización para que la descargues»',
     !p.includes('te dejo aquí la autorización para que la descargues') && v16.includes('te dejo aquí la autorización para que la descargues'));
comp('V17-2 · ya no queda «Es el ÚNICO enlace que puedes dar para este documento»',
     !p.includes('Es el ÚNICO enlace que puedes dar para este documento') && v16.includes('Es el ÚNICO enlace que puedes dar para este documento'));
comp('V17-3 · enviar_autorizacion aparece EXACTAMENTE 3 veces (ficha, paso, resumen): ni una de mas ni de menos',
     cuenta(p, 'enviar_autorizacion') === 3, 'apariciones: ' + cuenta(p, 'enviar_autorizacion'));
comp('V17-3 · el v16 no la nombraba (el cambio es real)', !v16.includes('enviar_autorizacion'));
comp('V17-3 · CUATRO herramientas ya no aparece en ninguna de sus dos formas',
     !/CUATRO HERRAMIENTAS/.test(p) && !/CUATRO herramientas/.test(p) && cuenta(p, 'CINCO') >= 2);
comp('V17-3 · las cinco tools siguen nombradas',
     ['leer_expediente', 'calcular_plazo', 'guardar_datos_cliente', 'analizar_documento', 'enviar_autorizacion'].every(t => p.includes(t)));
comp('V17-3 · el tipo_documento de la autorizacion FIRMADA que sube el cliente sigue siendo autorizacion_empleado',
     cuenta(p, 'autorizacion_empleado') === cuenta(v16, 'autorizacion_empleado') && cuenta(p, 'autorizacion_empleado') >= 1);
comp('V17-4 · el v17 crece entre 900 y 1.500 caracteres sobre el v16 (caza un fichero truncado o inflado; 4 parches)',
     car(p) - car(v16) >= 900 && car(p) - car(v16) <= 1500, `+${car(p) - car(v16)}`);

process.stdout.write(`\n${ok} verdes, ${mal} rojas\n`);
process.stdout.write(`v17 = ${car(p)} caracteres (v16 = ${car(v16)}, ${car(p) - car(v16) >= 0 ? '+' : ''}${car(p) - car(v16)})\n`);
process.stdout.write(`OJO: p.length de JS daria ${p.length} porque cuenta los emoji doble. La cifra buena es la de arriba.\n`);
process.exit(mal ? 1 : 0);
