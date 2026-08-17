// ============================================================================
// GENERADOR DEL FICHERO .030 · WP-235 · 14/08/2026
// ----------------------------------------------------------------------------
// Construye el fichero posicional que la sede de la AEAT acepta como borrador
// del Modelo 030. Sustituye a una persona rellenando el formulario a mano.
//
// EL FICHERO:
//   2700 bytes EXACTOS. Dos registros pegados, SIN salto de linea entre ellos
//   y SIN salto de linea final:
//     <T030010> 1481 caracteres </T030010><T030020> 1181 caracteres </T030020>
//   Nombre del fichero: <NIF>.030
//
// LA CODIFICACION ES ISO-8859-1 (latin-1), NO UTF-8. Comprobado en las muestras:
//   0xD1 = Ñ, 0xD3 = Ó, 0xC8 = È, todos a UN byte. Si esto se escribe en UTF-8,
//   cada acento ocupa DOS posiciones y DESPLAZA todo el registro a partir de ahi.
//   El fichero seguiria pareciendo correcto al abrirlo y Hacienda lo rechazaria.
//   Por eso `construir030` devuelve tambien los bytes ya codificados.
//
// DE DONDE SALEN LAS POSICIONES:
//   De cinco ficheros reales. Cuatro son de 2026 (mayo, julio y dos de agosto) y
//   son identicos en estructura. El quinto (Z0589116E, PIÑA) es de la version
//   antigua `20190101`: pesa 3373 bytes, lleva un sobre extra <T030000000A0000>
//   con <AUX> y <VECTOR>, y saltos \r\n. NO se genera esa version.
//   El esqueleto de constantes de mas abajo se saco comparando los cuatro buenos
//   posicion a posicion: solo 190 de 1481 varian entre ellos.
//
// LO QUE NO SE HA PODIDO DESCIFRAR, dicho aqui y no escondido:
//   - Posiciones 784 y 790 (dentro de la "zona gris" del domicilio): son DOS
//     subcampos mas, probablemente escalera y portal. Solo UNA de las 16 muestras
//     los usa (Z3520584W del 17/08, con '3' en 784 y 'A' en 790); las otras 15 los
//     dejan en blanco, y en blanco se dejan. No hay columna en Airtable ni pregunta
//     del bot para ellos.
//     EL RESTO DE LA ZONA GRIS YA NO ES GRIS, y esta resuelto con 16 muestras:
//     793-794 planta (dos caracteres, a la izquierda: 61078714Y lleva '04'),
//     796-797 puerta (dos caracteres, a la izquierda: Z4447237P lleva '14') y
//     787 bloque (uno). Ver el comentario de escribirDomicilio, que explica ademas
//     el mapa alternativo que se probo el 17/08 y por que es FALSO.
//   - Posicion 1406 del lienzo (absoluta 1415): un caracter suelto. Lleva '4' en
//     13 de las 14 muestras de la version 20250203 y blanco en dos (Z3520584W y
//     Z4871333F). MANDA EL '4' por recuento 13 a 1, y esas dos muestras son las dos
//     unicas diferencias que dejan las pruebas. Ojo: la muestra NUEVA del 17/08 del
//     mismo Z3520584W SI lleva '4', o sea que la eleccion se confirma.
//   - Posiciones 627-639 y 670-671 (T030010) y 379-388, 419-423 y 642-656
//     (T030020): identicas en las cuatro muestras y sin significado conocido.
//     Se copian tal cual.
//
// Depende de: tabla-paises-iso2-2026-08-13.js y tabla-provincias-030-2026-08-13.js
// ============================================================================

'use strict';

// ---------------------------------------------------------------------------
// 1 · ESQUELETO
// ---------------------------------------------------------------------------
// Todo lo que es identico en las cuatro muestras. Lo que no aparece aqui va en
// blanco. Formato [posicion (empezando en 1), texto].
//
// OJO: algunos de estos tramos son CONSTANTES FALSAS — coinciden en las cuatro
// muestras solo por casualidad (los cuatro nacieron en un mes de un solo digito,
// los cuatro se presentaron en 2026...). Todos ellos caen DENTRO de un campo que
// se sobrescribe mas abajo, asi que no hacen dano. Van marcados uno a uno.

const ESQUELETO_010 = [
  [2,    '20250203'],          // version del formato. NO es constante de verdad:
                               // la muestra vieja trae '20190101'. Es la vigente.
  [160,  'S S S'],             // casillas 107 / 103 / 105, las tres causas
  [363,  '0'],                 // FALSA: mes de nacimiento -> lo pisa fechaNacimiento
  [371,  '0'],                 // FALSA: dentro del INE de nacimiento
  [627,  '0000000000000'],     // sin descifrar, identico en las cuatro
  [670,  '00'],                // sin descifrar, identico en las cuatro
  [704,  'C'],                 // FALSA: dentro del tipo de via
  [709,  '00000'],             // relleno fijo entre el tipo de via y la via
  [764,  'NUM00'],             // 'NUM' + los dos primeros ceros del numero
  [862,  '0'],                 // FALSA: dentro del codigo postal
  [871,  'A'],                 // FALSA: dentro del municipio de residencia
  [1390, '0 0'],               // FALSA: dentro de la fecha de efectos
  [1395, '0'],                 // FALSA: dentro de la fecha de efectos
  [1398, '00000000'],          // segunda fecha, a ceros en las cuatro muestras
];

const ESQUELETO_020 = [
  [2,   'C'],                  // FALSA: dentro del tipo de via
  [7,   '00000'],
  [62,  'NUM00'],
  [160, '0'],                  // FALSA: dentro del codigo postal
  [169, 'A'],                  // FALSA: dentro del municipio
  [379, '0000000000'],         // sin descifrar
  [419, '00000'],              // sin descifrar
  [642, '000000 00000000'],    // sin descifrar
  [699, '0 2026'],             // FALSA: dentro de la fecha de presentacion
];

// El bloque de direccion de T030020 es el mismo que el de T030010 desplazado 702
// posiciones hacia atras. Comprobado en las cuatro muestras, campo a campo.
const DESPLAZAMIENTO_020 = 702;

// ---------------------------------------------------------------------------
// 2 · UTILIDADES DE ESCRITURA POSICIONAL
// ---------------------------------------------------------------------------

// Lienzo de espacios. La posicion 1 del formato es el indice 0 del array.
function lienzo(largo) {
  return new Array(largo).fill(' ');
}

// Escribe `texto` empezando en `pos` (base 1) ocupando exactamente `ancho`.
// Recorta por la derecha si sobra y rellena con espacios si falta. Nunca se sale
// del campo: eso es lo que impide que un apellido largo pise el campo siguiente.
function poner(lienzo_, pos, ancho, texto) {
  const t = String(texto == null ? '' : texto).slice(0, ancho).padEnd(ancho, ' ');
  for (let i = 0; i < ancho; i++) lienzo_[pos - 1 + i] = t[i];
}

// Igual pero rellenando con ceros por la izquierda. Para numeros de portal y
// codigos: '18' con ancho 5 -> '00018'.
function ponerNum(lienzo_, pos, ancho, valor) {
  const t = String(valor == null ? '' : valor).replace(/\D/g, '').slice(-ancho).padStart(ancho, '0');
  for (let i = 0; i < ancho; i++) lienzo_[pos - 1 + i] = t[i];
}

function aplicarEsqueleto(lienzo_, tramos) {
  for (const [pos, texto] of tramos) {
    for (let i = 0; i < texto.length; i++) lienzo_[pos - 1 + i] = texto[i];
  }
}

// ---------------------------------------------------------------------------
// 3 · LIMPIEZA DE TEXTO
// ---------------------------------------------------------------------------
// El fichero admite acentos y Ñ porque va en latin-1 (BENICARLÓ, VALÈNCIA y
// PEYROLÓN aparecen tal cual en las muestras). Lo que NO cabe en latin-1 hay que
// convertirlo o el byte se pierde: nombres polacos, turcos, checos, chinos.
// Se transcribe a su letra base; lo que no tenga letra base se cae.

const FUERA_DE_LATIN1 = {
  'Ł': 'L', 'ł': 'l', 'Đ': 'D', 'đ': 'd', 'Ħ': 'H', 'ħ': 'h', 'Ŀ': 'L', 'ŀ': 'l',
  'Œ': 'OE', 'œ': 'oe', 'Ŋ': 'N', 'ŋ': 'n', 'Ŧ': 'T', 'ŧ': 't', 'ẞ': 'SS',
};

function aLatin1(texto) {
  if (texto == null) return '';
  let t = String(texto);
  for (const [de, a] of Object.entries(FUERA_DE_LATIN1)) t = t.split(de).join(a);
  // Descompone y quita las tildes que latin-1 no tiene (ǎ, ő, ș...), dejando
  // intactas las que si tiene porque ya vienen compuestas del paso anterior.
  t = t.normalize('NFD').replace(/[̀-ͯ]/g, (tilde, i, s) => {
    const base = s[i - 1];
    const compuesto = (base + tilde).normalize('NFC');
    return compuesto.length === 1 && compuesto.charCodeAt(0) < 256 ? tilde : '';
  }).normalize('NFC');
  // Cualquier cosa que siga sin caber, fuera. Mejor un hueco que un byte que
  // desplaza el registro entero.
  return t.split('').filter((c) => c.charCodeAt(0) < 256).join('');
}

// Todo el fichero va en MAYUSCULAS: las cuatro muestras, sin excepcion.
function mayus(texto) {
  return aLatin1(texto).toUpperCase();
}

// ---------------------------------------------------------------------------
// 4 · EL CONSTRUCTOR
// ---------------------------------------------------------------------------
// Recibe un objeto ya normalizado (los codigos ISO y de provincia se resuelven
// ANTES de llamar aqui, con las dos tablas de conversion) y devuelve
//   { nombreFichero, texto, bytes }
// o lanza un error si falta algo sin lo cual el fichero seria invalido.
//
// LA REGLA DE ORO, la misma que la tabla de provincias: si un dato obligatorio
// no se conoce, ESTO PARA. No se rellena con ceros ni con blancos "a ver si
// cuela". Un fichero mal montado va a Hacienda y nadie se entera hasta que
// vuelve rechazado.

const OBLIGATORIOS = [
  ['nif',                     'el NIF o NIE'],
  ['apellidoPrimero',         'el primer apellido'],
  ['nombre',                  'el nombre'],
  ['nacionalidadISO2',        'la nacionalidad en ISO-2'],
  ['sexo',                    'el sexo'],
  ['fechaNacimiento',         'la fecha de nacimiento'],
  ['municipioNacimiento',     'el municipio de nacimiento'],
  ['provinciaNacimiento',     'la provincia (o region) de nacimiento'],
  ['codProvinciaNacimiento',  'el codigo de provincia de nacimiento'],
  ['paisNacimientoISO2',      'el pais de nacimiento en ISO-2'],
  ['ineMunicipioNacimiento',  'el codigo INE del municipio de nacimiento'],
  ['nombreVia',               'el nombre de la via del domicilio'],
  ['numero',                  'el numero del domicilio'],
  ['cp',                      'el codigo postal'],
  ['municipioResidencia',     'el municipio de residencia'],
  ['ineMunicipioResidencia',  'el codigo INE del municipio de residencia'],
  ['fechaPresentacion',       'la fecha de presentacion'],
];

function construir030(d) {
  // --- 4.1 · Comprobaciones que paran el proceso -------------------------
  const faltan = OBLIGATORIOS
    .filter(([campo]) => d[campo] == null || String(d[campo]).trim() === '')
    .map(([, texto]) => texto);
  if (faltan.length) {
    throw new Error('No se genera el .030: falta ' + faltan.join(', ') + '.');
  }
  if (!/^[VM]$/.test(d.sexo)) {
    throw new Error("No se genera el .030: el sexo tiene que ser 'V' o 'M', llego '" + d.sexo + "'.");
  }
  for (const campo of ['fechaNacimiento', 'fechaPresentacion']) {
    if (!/^\d{8}$/.test(String(d[campo]))) {
      throw new Error('No se genera el .030: ' + campo + ' tiene que ser DDMMAAAA, llego "' + d[campo] + '".');
    }
  }
  if (!/^\d{5}$/.test(String(d.cp))) {
    throw new Error('No se genera el .030: el codigo postal tiene que ser 5 digitos, llego "' + d.cp + '".');
  }
  // El INE de residencia empieza SIEMPRE por el codigo de provincia, y ese
  // codigo son los dos primeros digitos del codigo postal. Si no casan, uno de
  // los dos esta mal y el fichero iria a la provincia equivocada.
  const provinciaResidencia = String(d.cp).slice(0, 2);
  if (String(d.ineMunicipioResidencia).slice(0, 2) !== provinciaResidencia) {
    throw new Error(
      'No se genera el .030: el codigo INE de residencia (' + d.ineMunicipioResidencia +
      ') no empieza por la provincia del codigo postal (' + provinciaResidencia + ').'
    );
  }

  const nif = mayus(d.nif).replace(/\s/g, '');
  const ap1 = mayus(d.apellidoPrimero);
  const ap2 = mayus(d.apellidoSegundo || '');
  const nom = mayus(d.nombre);
  const apellidosJuntos = (ap1 + ' ' + ap2).trim();

  // --- 4.2 · Registro T030010 --------------------------------------------
  const a = lienzo(1481);
  aplicarEsqueleto(a, ESQUELETO_010);

  poner(a, 2,   8,   '20250203');                    // version del formato
  poner(a, 10,  9,   nif);                           // NIF de cabecera
  poner(a, 20,  100, apellidosJuntos);               // los dos apellidos juntos
  poner(a, 120, 40,  nom);                           // nombre de cabecera
  poner(a, 172, 1,   d.residenteFiscal === 'S' ? 'S' : ' '); // casilla 201
  poner(a, 223, 2,   mayus(d.nacionalidadISO2));
  poner(a, 225, 1,   d.sexo);
  poner(a, 226, 9,   nif);
  poner(a, 236, 50,  ap1);                           // primer apellido, separado
  poner(a, 286, 50,  ap2);                           // segundo apellido, separado
  poner(a, 336, 25,  nom);
  poner(a, 361, 8,   String(d.fechaNacimiento));     // DDMMAAAA
  poner(a, 369, 5,   String(d.ineMunicipioNacimiento));
  poner(a, 374, 30,  mayus(d.municipioNacimiento));
  poner(a, 404, 2,   String(d.codProvinciaNacimiento));
  poner(a, 406, 30,  mayus(d.provinciaNacimiento));
  poner(a, 436, 2,   mayus(d.paisNacimientoISO2));

  escribirDomicilio(a, 0, d);

  poner(a, 1390, 8, /^\d{8}$/.test(String(d.fechaEfectos || '')) ? String(d.fechaEfectos) : '00000000');
  poner(a, 1398, 8, '00000000');
  // El caracter sin descifrar de la 1406. Sigue sin saberse QUE significa, pero ya
  // se sabe QUE VALOR lleva: '4' en 13 de las 14 muestras de la version 20250203
  // (las 12 nuevas del 14/08 mas 48013946C y Z4447237P). Las dos unicas en blanco
  // son Z3520584W y Z4871333F. Antes se puso blanco por seguir a esas dos; con 14
  // muestras el recuento es 13 a 1 y manda el '4'.
  poner(a, 1406, 1, '4');

  // --- 4.3 · Registro T030020 --------------------------------------------
  const b = lienzo(1181);
  aplicarEsqueleto(b, ESQUELETO_020);

  escribirDomicilio(b, -DESPLAZAMIENTO_020, d);
  poner(b, 697, 8, String(d.fechaPresentacion));     // DDMMAAAA

  // --- 4.4 · Montaje ------------------------------------------------------
  const texto = '<T030010>' + a.join('') + '</T030010><T030020>' + b.join('') + '</T030020>';
  if (texto.length !== 2700) {
    throw new Error('No se genera el .030: han salido ' + texto.length + ' caracteres y tienen que ser 2700.');
  }

  return {
    nombreFichero: nif + '.030',
    texto,
    bytes: typeof Buffer !== 'undefined' ? Buffer.from(texto, 'latin1') : null,
  };
}

// El bloque de direccion, identico en los dos registros salvo el desplazamiento.
function escribirDomicilio(lienzo_, desp, d) {
  poner(lienzo_,    704 + desp, 5,  mayus(d.tipoVia || 'C'));   // 'CALLE', 'C', 'AVDA'...
  poner(lienzo_,    709 + desp, 5,  '00000');
  poner(lienzo_,    714 + desp, 50, mayus(d.nombreVia));
  poner(lienzo_,    764 + desp, 3,  'NUM');
  ponerNum(lienzo_, 767 + desp, 5,  d.numero);

  // ── 17/08/2026 · LA ZONA GRIS, REVISADA CON 16 MUESTRAS Y CONFIRMADA ────────
  // Llego una muestra nueva (Z3520584W del 17/08) con SEIS subcampos del domicilio
  // rellenos a la vez, la primera que los tiene. Se reviso todo el tramo y la
  // conclusion es que ESTO YA ESTABA BIEN. Se deja escrito para no volver a dudar:
  //
  //   793-794  PLANTA, dos caracteres, ALINEADA A LA IZQUIERDA.
  //            61078714Y lleva '0' en 793 y '4' en 794, o sea planta '04'.
  //   796-797  PUERTA, dos caracteres, ALINEADA A LA IZQUIERDA.
  //            Z4447237P lleva '1' en 796 y '4' en 797, o sea puerta '14'.
  //            Las demas llevan una sola letra en 796: B, C, A.
  //   787      BLOQUE, un caracter. 14263945N lo lleva con planta 3 y puerta B.
  //
  // SE PROBO A LEERLO COMO CINCO CAMPOS DE 3 ALINEADOS A LA DERECHA y ES FALSO:
  // con ese mapa, Z4447237P sale '14 ' donde el fichero real dice ' 14', y
  // 61078714Y pierde el '4' de su planta. Las pruebas contra las 16 muestras lo
  // cazaron en el primer intento. NO SE VUELVE A INTENTAR sin una muestra que lo
  // contradiga byte a byte.
  //
  // LO QUE SIGUE SIN ESCRIBIRSE, y es correcto no escribirlo: las posiciones 784 y
  // 790 existen y son OTROS DOS subcampos (probablemente escalera y portal). Solo
  // UNA de las 16 muestras los usa -- la del 17/08, que llevaba '3' en 784 y 'A' en
  // 790 -- y las otras 15 los dejan en blanco. No hay columna en Airtable para
  // ellos y el bot no los pregunta, asi que van en blanco como en las 15.
  //
  // ANOMALIA DE UNA MUESTRA, dicha y no tapada: Z3520584W(2) lleva su '2' de
  // "Gaztambide 18, 2o C" en el BLOQUE (787) y no en la planta. Quien rellenó ese
  // formulario en la sede metio el piso en la casilla equivocada. Es un error de
  // tecleo de esa muestra, no del mapa.
  poner(lienzo_,    778 + desp, 1,  mayus(d.bloque || ''));
  poner(lienzo_,    784 + desp, 2,  mayus(d.planta || ''));
  poner(lienzo_,    787 + desp, 2,  mayus(d.puerta || ''));
  poner(lienzo_,    860 + desp, 5,  String(d.cp));
  poner(lienzo_,    865 + desp, 5,  String(d.ineMunicipioResidencia));
  poner(lienzo_,    870 + desp, 30, mayus(d.municipioResidencia));
  poner(lienzo_,    900 + desp, 2,  String(d.cp).slice(0, 2));
}

if (typeof module !== 'undefined') {
  module.exports = { construir030, aLatin1, mayus, poner, ponerNum };
}
