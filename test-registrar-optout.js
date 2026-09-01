// Puerta de BECKHAM_registrar_optout (N6aIm7mY4J7zvhmH · WP-223 B)
// `node docs/test-registrar-optout.js`
//
// QUE PRUEBA Y COMO: no compara texto, EJECUTA los cuatro nodos de codigo del
// SDK con un $input de mentira. Los extrae de docs/wf-223-registrar-optout-sdk-2026-08-31.js
// POR ANCLAS DE TEXTO y ABORTA si un ancla desaparece, en vez de dar verdes
// sobre una cadena vacia (la leccion del extractor de PDF del 19/08: «un
// extractor que no encuentra nada devuelve falsos verdes en cascada»).
//
// LAS DOS COSAS QUE ESTA PUERTA EXISTE PARA DEFENDER:
//   1. LA GUARDA DEL user_id, que cierra la fuga de PII del 28/08. `{UserId} = ''`
//      CASA con las filas que tienen el UserId en blanco, y hoy hay dos con PII
//      real dentro. 13 entradas hostiles aqui abajo, mas el caso del numero.
//   2. QUE NO SE LLAME A LA API DE ESCRITURA mientras `recordatorio_optout` no
//      exista en Empleados. El 31/08 la respuesta paso de un 422 crudo de
//      Airtable a un `columna_no_existe` propio.
'use strict';
const fs = require('fs');
const path = require('path');

const FUENTE = path.join(__dirname, 'wf-223-registrar-optout-sdk-2026-08-31.js');
const sdk = fs.readFileSync(FUENTE, 'utf8');

// ── EL EXTRACTOR · por anclas, y aborta si no las encuentra ──────────────────
function extraer(nombreNodo) {
  const ancla = "name: '" + nombreNodo + "'";
  const i = sdk.indexOf(ancla);
  if (i === -1) {
    process.stdout.write('ABORTA: no encuentro el nodo «' + nombreNodo + '» en ' + FUENTE + '\n');
    process.exit(1);
  }
  const j = sdk.indexOf('jsCode: `', i);
  if (j === -1) {
    process.stdout.write('ABORTA: el nodo «' + nombreNodo + '» no tiene jsCode\n');
    process.exit(1);
  }
  let k = j + 'jsCode: `'.length;
  let out = '';
  while (k < sdk.length) {
    const c = sdk[k];
    if (c === '\\' && sdk[k + 1] === '`') { out += '`'; k += 2; continue; }
    if (c === '`') break;
    out += c;
    k++;
  }
  if (k >= sdk.length) {
    process.stdout.write('ABORTA: el jsCode de «' + nombreNodo + '» no cierra\n');
    process.exit(1);
  }
  if (out.length < 200) {
    process.stdout.write('ABORTA: el jsCode de «' + nombreNodo + '» son ' + out.length + ' car., demasiado corto para ser el de verdad\n');
    process.exit(1);
  }
  return out;
}

const CODIGO = {
  guarda: extraer('Guarda del user_id'),
  resolver: extraer('Resolver la fila'),
  respOk: extraer('Respuesta OK'),
  respErr: extraer('Respuesta persistencia fallida'),
};

// ── EL CORREDOR · $input y $() de mentira ────────────────────────────────────
function correr(codigo, items, nodos) {
  const lista = (items || []).map((j) => ({ json: j }));
  const $input = {
    all: () => lista,
    first: () => lista[0] || { json: {} },
  };
  const $ = (n) => {
    if (!nodos || !(n in nodos)) throw new Error('nodo no simulado: ' + n);
    return { first: () => ({ json: nodos[n] }) };
  };
  const r = new Function('$', '$input', codigo)($, $input);
  return r[0].json;
}

const USER = 'eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac';
const CORR = '215475581167582:52219039912';
const guarda = (u, c) => correr(CODIGO.guarda, [{ user_id: u, corr_id: c === undefined ? CORR : c }], {});
const resolver = (filas, g, codigo) =>
  correr(codigo || CODIGO.resolver, filas, { 'Guarda del user_id': g || { user_id: USER, corr_id: CORR } });

let ok = 0, mal = 0;
const comp = (n, c, d) => {
  if (c) { process.stdout.write('verde ' + n + '\n'); ok++; }
  else { process.stdout.write('ROJO  ' + n + (d ? '\n      ' + d : '') + '\n'); mal++; }
};

// ═════════════════════════════════════════════════════════════════════════════
// 1 · LA GUARDA DEL user_id · LA FUGA DE PII DEL 28/08
// ═════════════════════════════════════════════════════════════════════════════
process.stdout.write('\n── 1 · la guarda del user_id (la fuga de PII) ──\n');

const gOk = guarda(USER);
comp('user_id bueno pasa la guarda', gOk._guarda === 'ok' && gOk.ok === true, JSON.stringify(gOk));
comp('la formula sale montada y con el UserId dentro',
     gOk._formula === '{UserId} = "' + USER + '"', gOk._formula);
comp('el corr_id se propaga', gOk.corr_id === CORR, gOk.corr_id);

// LAS 13 ENTRADAS HOSTILES. Ninguna debe producir formula.
const HOSTILES = [
  ['vacio', ''],
  ['solo espacios', '   '],
  ['undefined', undefined],
  ['null', null],
  ['objeto', { a: 1 }],
  ['array', ['x']],
  ['comilla doble sola', 'eu-west-1:aaaa"bbbb'],
  ['barra invertida', 'eu-west-1:aaaa\\bbbb'],
  ['cierre de cadena + OR', 'x" , OR({UserId}!="'],
  ['OR() entero', 'a" ) , OR( 1 , 1 ) , ("'],
  ['comilla simple', "eu-west-1:aaaa'bbbb"],
  ['llave de campo', 'eu-west-1:{UserId}'],
  ['demasiado corto', 'abc'],
];
HOSTILES.forEach(function (h) {
  const r = guarda(h[1]);
  const paro = r.ok === false &&
               (r.resultado === 'schema_error' || r.resultado === 'user_id_forma_invalida') &&
               r._formula === '';
  comp('la guarda PARA: ' + h[0], paro, JSON.stringify(r));
});

// UN NUMERO NO ES UNA HOSTIL, Y CONVIENE DEJARLO ESCRITO. `txt()` convierte a
// cadena todo lo que no sea objeto, asi que un 12345678 pasa la forma y monta
// `{UserId} = "12345678"`. NO ES LA FUGA: la fuga era `{UserId} = ""`, que casa
// con las filas de UserId en blanco. Una cadena de digitos no casa con ninguna
// fila real (los UserId son 'eu-west-1:<uuid>'), asi que muere abajo en
// `sin_fila` sin tocar el expediente de nadie. Fallo seguro, no fuga.
const gNum = guarda(12345678);
comp('un numero se convierte a sus digitos y NO produce la formula que fuga',
     gNum._formula === '{UserId} = "12345678"' && gNum._formula !== '{UserId} = ""', gNum._formula);
comp('el numero muere abajo en sin_fila, no en el expediente de otro',
     resolver([], { user_id: '12345678', corr_id: CORR }).resultado === 'sin_fila');

comp('el vacio sale como schema_error', guarda('').resultado === 'schema_error');
comp('la forma rara sale como user_id_forma_invalida',
     guarda('eu-west-1:aaaa"bbbb').resultado === 'user_id_forma_invalida');
comp('el rechazo dice QUE campo falla',
     JSON.stringify(guarda('').campos) === '["user_id"]', JSON.stringify(guarda('').campos));
comp('un user_id de 200 car. limpio pasa', guarda('a'.repeat(200))._guarda === 'ok');
comp('uno de 201 NO pasa', guarda('a'.repeat(201))._guarda === 'user_id_forma_invalida');
comp('el user_id se recorta antes de la formula',
     guarda('  ' + USER + '  ')._formula === '{UserId} = "' + USER + '"');
comp('NINGUNA hostil deja una formula con OR dentro',
     HOSTILES.every((h) => !/OR/i.test(guarda(h[1])._formula)));
comp('un corr_id ausente no revienta la guarda', guarda(USER, undefined).corr_id === CORR);
comp('un corr_id objeto se neutraliza a cadena vacia',
     correr(CODIGO.guarda, [{ user_id: USER, corr_id: { x: 1 } }], {}).corr_id === '');

// ═════════════════════════════════════════════════════════════════════════════
// 2 · RESOLVER LA FILA · Y EL INTERRUPTOR DE LA COLUMNA
// ═════════════════════════════════════════════════════════════════════════════
process.stdout.write('\n── 2 · resolver la fila y el interruptor ──\n');

const FILA = { id: 'recIvWrCD6PcsE10p', createdTime: 'x', fields: { UserId: USER } };
const FILA2 = { id: 'recOTRAOTRAOTRAOT', createdTime: 'x', fields: { UserId: USER } };

const r1 = resolver([FILA]);
comp('1 fila + columna inexistente -> columna_no_existe', r1.resultado === 'columna_no_existe', JSON.stringify(r1));
comp('columna_no_existe va con ok:false', r1.ok === false);
comp('el detalle dice EXACTAMENTE que hay que crear',
     r1.detalle === 'crear recordatorio_optout como casilla en Empleados', r1.detalle);
comp('devuelve el record_id para poder marcarla a mano', r1.record_id === 'recIvWrCD6PcsE10p', r1.record_id);
comp('el campo va nombrado en la respuesta', r1.campo === 'recordatorio_optout');
comp('n_filas dice 1', r1.n_filas === 1);
comp('el corr_id llega desde la guarda', r1.corr_id === CORR);

const r0 = resolver([]);
comp('0 filas -> sin_fila', r0.resultado === 'sin_fila', JSON.stringify(r0));
comp('sin_fila NO devuelve record_id', r0.record_id === '', r0.record_id);
comp('sin_fila tiene su propio detalle', /ninguna fila/.test(r0.detalle), r0.detalle);

const rVacio = resolver([{}]);
comp('el item {} de alwaysOutputData NO cuenta como fila',
     rVacio.resultado === 'sin_fila' && rVacio.n_filas === 0, JSON.stringify(rVacio));

const rDos = resolver([FILA, FILA2]);
comp('2 filas -> multi_match', rDos.resultado === 'multi_match', JSON.stringify(rDos));
comp('multi_match NO devuelve record_id (no se escribe en ninguna)', rDos.record_id === '', rDos.record_id);
comp('multi_match nombra la guarda de unicidad WP-205b', /WP-205b/.test(rDos.detalle), rDos.detalle);

// EL ORDEN: primero el problema de la FILA, despues el de la COLUMNA
comp('0 filas gana a columna_no_existe (el orden de los hechos)', r0.resultado === 'sin_fila');
comp('2 filas gana a columna_no_existe', rDos.resultado === 'multi_match');

// EL INTERRUPTOR: es lo UNICO que hay que tocar el dia que exista la columna
const ENCENDIDO = CODIGO.resolver.replace('const COLUMNA_EXISTE = false;', 'const COLUMNA_EXISTE = true;');
comp('el interruptor existe con ese texto exacto', ENCENDIDO !== CODIGO.resolver,
     'no encuentro «const COLUMNA_EXISTE = false;» en Resolver la fila');
const rEnc = resolver([FILA], null, ENCENDIDO);
comp('con COLUMNA_EXISTE=true y 1 fila -> ok (el PATCH se haria)',
     rEnc.resultado === 'ok' && rEnc.ok === true && rEnc._estado === 'ok', JSON.stringify(rEnc));
comp('con el interruptor encendido el record_id sigue viniendo', rEnc.record_id === 'recIvWrCD6PcsE10p');
comp('el interruptor NO se salta la guarda de 0 filas',
     resolver([], null, ENCENDIDO).resultado === 'sin_fila');
comp('el interruptor NO se salta la guarda de multi_match',
     resolver([FILA, FILA2], null, ENCENDIDO).resultado === 'multi_match');

// EL PATCH ES INALCANZABLE HOY. El if «¿Una sola fila?» solo va a la rama del
// PATCH si _estado === 'ok', asi que basta con que ningun caso lo produzca.
const CASOS = [[], [{}], [FILA], [FILA, FILA2], [FILA, FILA2, FILA]];
comp('HOY el PATCH es INALCANZABLE: ningun caso devuelve _estado ok',
     CASOS.every((c) => resolver(c)._estado !== 'ok'),
     CASOS.map((c) => resolver(c)._estado).join(' '));
comp('y con el interruptor encendido SI es alcanzable con 1 fila',
     resolver([FILA], null, ENCENDIDO)._estado === 'ok');

// ═════════════════════════════════════════════════════════════════════════════
// 3 · LA RESPUESTA · «ningun ok:true que signifique no hice nada»
// ═════════════════════════════════════════════════════════════════════════════
process.stdout.write('\n── 3 · la respuesta del PATCH ──\n');

const NODOS = {
  'Guarda del user_id': { user_id: USER, corr_id: CORR },
  'Resolver la fila': { record_id: 'recIvWrCD6PcsE10p', corr_id: CORR },
};
const respOk = (payload) => correr(CODIGO.respOk, [payload], NODOS);

const okBueno = respOk({ id: 'recIvWrCD6PcsE10p', fields: { recordatorio_optout: true } });
comp('PATCH que devuelve la casilla en true -> optout_registrado',
     okBueno.ok === true && okBueno.resultado === 'optout_registrado', JSON.stringify(okBueno));
comp('el ok bueno no lleva detalle', okBueno.detalle === '');

const sinClave = respOk({ id: 'recIvWrCD6PcsE10p', fields: {} });
comp('PATCH sin la clave en la respuesta -> persistencia_fallida',
     sinClave.ok === false && sinClave.resultado === 'persistencia_fallida', JSON.stringify(sinClave));
comp('y el detalle avisa de que compruebe que es CASILLA',
     /CASILLA/.test(sinClave.detalle), sinClave.detalle);

comp('la cadena "true" NO cuenta como escrito (columna de texto)',
     respOk({ id: 'r', fields: { recordatorio_optout: 'true' } }).ok === false);
comp('el 1 NO cuenta como escrito',
     respOk({ id: 'r', fields: { recordatorio_optout: 1 } }).ok === false);
comp('un singleSelect {id,name} NO cuenta como escrito',
     respOk({ id: 'r', fields: { recordatorio_optout: { id: 's', name: 'Si' } } }).ok === false);
comp('sin id de registro NO cuenta como escrito',
     respOk({ fields: { recordatorio_optout: true } }).ok === false);
comp('una respuesta vacia NO cuenta como escrito', respOk({}).ok === false);
comp('sin fields NO cuenta como escrito', respOk({ id: 'r' }).ok === false);
comp('el record_id cae al de Resolver la fila si el PATCH no lo trae',
     respOk({}).record_id === 'recIvWrCD6PcsE10p');

const respErr = (payload) => correr(CODIGO.respErr, [payload], NODOS);
const e1 = respErr({ error: { message: 'UNKNOWN_FIELD_NAME: recordatorio_optout' } });
comp('la rama de error responde persistencia_fallida',
     e1.ok === false && e1.resultado === 'persistencia_fallida', JSON.stringify(e1));
comp('la rama de error copia el mensaje de Airtable',
     /UNKNOWN_FIELD_NAME/.test(e1.detalle), e1.detalle);
comp('la rama de error recorta el detalle a 300',
     respErr({ message: 'x'.repeat(1000) }).detalle.length === 300);
comp('la rama de error aguanta un payload vacio', respErr({}).resultado === 'persistencia_fallida');
comp('la rama de error conserva el record_id', e1.record_id === 'recIvWrCD6PcsE10p');

// ═════════════════════════════════════════════════════════════════════════════
// 4 · LAS REGLAS DE LA CASA Y EL CONTRATO
// ═════════════════════════════════════════════════════════════════════════════
process.stdout.write('\n── 4 · reglas de la casa y contrato ──\n');

Object.keys(CODIGO).forEach(function (k) {
  comp('en «' + k + '» NUNCA $("X").item, siempre .first()',
       !/\$\((['"])[^'"]+\1\)\s*\.item/.test(CODIGO[k]),
       (CODIGO[k].match(/\$\((['"])[^'"]+\1\)\s*\.item/g) || []).join(' '));
});

comp('HOY el interruptor esta declarado en false',
     /const COLUMNA_EXISTE = false;/.test(CODIGO.resolver));
// El nombre de la columna se escribe UNA sola vez en CODIGO (las comentadas no
// cuentan): asi el dia que se renombre no hay dos sitios que puedan discrepar.
const resolverSinComentarios = CODIGO.resolver
  .split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
comp('el nombre de la columna vive en UNA constante, no repartido por el codigo',
     (resolverSinComentarios.match(/'recordatorio_optout'/g) || []).length === 1,
     (resolverSinComentarios.match(/'recordatorio_optout'/g) || []).length + ' apariciones en codigo');

// El enum de `resultado`, los OCHO. Nada fuera de la lista.
const ENUM = ['optout_registrado', 'columna_no_existe', 'sin_fila', 'multi_match',
              'lectura_fallida', 'persistencia_fallida', 'schema_error', 'user_id_forma_invalida'];
comp('el enum de resultado son OCHO valores', ENUM.length === 8);
const producidos = [
  guarda('').resultado, guarda('a"b').resultado, r0.resultado, rDos.resultado,
  r1.resultado, okBueno.resultado, sinClave.resultado, e1.resultado,
];
comp('todo `resultado` producido esta en el enum',
     producidos.every((p) => ENUM.indexOf(p) !== -1), producidos.join(' '));
comp('la nota del workflow dice OCHO, no siete',
     /EL ENUM DE `resultado`, los OCHO/.test(sdk),
     (sdk.match(/EL ENUM DE `resultado`, los [A-Za-z]+/) || ['no encontrado'])[0]);
ENUM.forEach(function (v) {
  comp('el enum «' + v + '» aparece en el SDK', sdk.indexOf(v) !== -1);
});

// El PATCH toca UNA sola columna. Es la defensa contra el 26/08 (un nodo que
// escribe y arrastra 36 campos vacios).
const cuerpo = (sdk.match(/jsonBody: expr\("\{\{ \{ fields: \{([^}]*)\} \} \}\}"\)/) || [])[1];
comp('el body del PATCH existe y se puede leer', typeof cuerpo === 'string', String(cuerpo));
comp('el body del PATCH toca UNA sola columna',
     typeof cuerpo === 'string' && cuerpo.split(':').length === 2, String(cuerpo));
comp('y esa columna es recordatorio_optout: true',
     typeof cuerpo === 'string' && /^\s*recordatorio_optout:\s*true\s*$/.test(cuerpo), String(cuerpo));
// OJO: no vale buscar «typecast» en todo el fichero, porque la nota lo NOMBRA
// para explicar por que no hace falta. Lo que se comprueba es que no este
// PUESTO como parametro.
comp('el PATCH NO lleva typecast puesto como parametro', !/typecast\s*:/.test(sdk),
     (sdk.match(/typecast\s*:[^,\n]*/g) || []).join(' '));

// La busqueda: whitelist de un campo y limit 2. Las dos cosas son guardas.
comp('la busqueda pide SOLO UserId (no arrastra 99 columnas de PII al log)',
     /fields: \['UserId'\]/.test(sdk));
comp('la busqueda va con limit 2 (limit 1 esconderia el multi_match)',
     /limit: 2,/.test(sdk));
comp('la busqueda NO pide recordatorio_optout (hoy seria un 422 en la LECTURA)',
     !/fields: \[[^\]]*recordatorio_optout/.test(sdk));
comp('la busqueda va con alwaysOutputData (el caso de 0 filas tiene que llegar)',
     /alwaysOutputData: true/.test(sdk));
comp('la busqueda tiene rama de error (lectura_fallida)',
     /buscar\.onError\(respLectura\)/.test(sdk));
comp('el PATCH tiene rama de error (persistencia_fallida)',
     /patch\.onError\(respPersistencia\)/.test(sdk));
comp('el errorWorkflow apunta al subworkflow de alertas BJfExmwu1fI1aPpY',
     /errorWorkflow: 'BJfExmwu1fI1aPpY'/.test(sdk));
comp('la entrada declara user_id y corr_id, y nada mas',
     /values: \[\{"name": "user_id", "type": "string"\}, \{"name": "corr_id", "type": "string"\}\]/.test(sdk));
comp('apunta a la tabla Empleados de Mobility_2026',
     /app5K8OnSObqwWweS/.test(sdk) && /tblTWCWu5nQXNOMR1/.test(sdk));

// ═════════════════════════════════════════════════════════════════════════════
process.stdout.write('\n' + ok + ' verdes, ' + mal + ' rojas\n');
if (mal > 0) { process.stdout.write('PUERTA EN ROJO\n'); process.exit(1); }
process.stdout.write('PUERTA EN VERDE\n');
