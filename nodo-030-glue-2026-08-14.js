// ============================================================================
// NODO «Montar el .030» · workflow beckham_generar_030 · 14/08/2026
// ----------------------------------------------------------------------------
// Este es el trozo que traduce las columnas de Airtable a lo que espera
// construir030(). Va DETRAS de las cuatro piezas que se concatenan delante:
//   tabla-paises-iso2 · tabla-provincias-030 · tabla-municipios-ine · generador
//
// UNA ENTRADA POR FILA DE AIRTABLE, UNA SALIDA POR FILA. La salida nunca lanza
// excepcion: si algo falta, sale {ok:false, error:'...'} y el resto del workflow
// se encarga de escribirlo en Error030 y avisar. Que una fila no se pueda
// generar NO puede tumbar las demas.
// ============================================================================

// --- Tipo de via: la columna guarda la palabra entera y la casilla mide 5 -----
// 'AVENIDA' truncado a 5 seria 'AVENI', que no es nada. Estas son las
// abreviaturas que usa la AEAT para las vias frecuentes. Lo que no este aqui y
// pase de 5 caracteres se corta y se deja constancia en el aviso de la fila.
const ABREV_VIA = {
  'CALLE': 'CALLE', 'AVENIDA': 'AVDA', 'PLAZA': 'PLAZA', 'PASEO': 'PASEO',
  'CARRETERA': 'CTRA', 'CAMINO': 'CMNO', 'TRAVESIA': 'TRVA', 'RONDA': 'RONDA',
  'GLORIETA': 'GLTA', 'RAMBLA': 'RMBLA', 'POLIGONO': 'POLIG', 'URBANIZACION': 'URB',
  'BULEVAR': 'BULEV', 'CALLEJON': 'CLLON', 'CALLEJA': 'CLLJA', 'PASAJE': 'PSJE',
  'BARRIO': 'BARRI', 'AVDA': 'AVDA', 'CUESTA': 'CUEST', 'BAJADA': 'BAJAD',
  'SUBIDA': 'SUBID', 'PARQUE': 'PARQU', 'SECTOR': 'SECTO', 'GRUPO': 'GRUPO',
  'EDIFICIO': 'EDIF', 'RESIDENCIAL': 'RESID', 'PARTIDA': 'PTDA', 'LUGAR': 'LUGAR',
  'BARRIADA': 'BARDA', 'COLONIA': 'COLON', 'PASSEIG': 'PASEO', 'RÚA': 'RUA',
  'VIA': 'VIA', 'ZONA': 'ZONA', 'MUNICIPIO': 'MUNIC', 'OTROS': 'OTROS',
};

function abreviarVia(tipo) {
  const t = mayus(tipo || 'CALLE').trim();
  if (!t) return 'CALLE';
  if (ABREV_VIA[t]) return ABREV_VIA[t];
  return t.slice(0, 5);
}

// --- Fechas -----------------------------------------------------------------
// Airtable devuelve las fechas como 'AAAA-MM-DD'. El fichero las quiere DDMMAAAA.
function aDDMMAAAA(iso) {
  if (!iso) return null;
  const m = String(iso).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[3] + m[2] + m[1] : null;
}

// Hoy en HORA DE MADRID. Nunca UTC: a partir de las 22:00 de verano, UTC ya
// esta en el dia siguiente y la declaracion saldria fechada manana.
function hoyMadridDDMMAAAA() {
  const partes = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(new Date());
  const p = {};
  for (const x of partes) p[x.type] = x.value;
  return p.day + p.month + p.year;
}

// --- Fecha de efectos de la residencia fiscal (posiciones 1390-1397) ---------
// REGLA DEDUCIDA, NO CONFIRMADA POR FISCAL. Se apoya en la logica que ya usa la
// propia base en la formula 'Situacion fiscal Anio Desplazamiento': quien llega
// antes del 1 de julio pasa mas de 183 dias en Espana y es residente ESE MISMO
// año; quien llega despues, lo es a partir del SIGUIENTE.
//   llegada <= 30/06/AAAA  ->  01/01/AAAA
//   llegada >= 01/07/AAAA  ->  01/01/(AAAA+1)
// Encaja con las cuatro muestras reales. Si Fiscal dice otra cosa, se cambia
// SOLO aqui. Sin fecha de desplazamiento no se inventa: se deja a ceros y la
// casilla 201 en blanco, que es exactamente lo que hace una de las muestras.
function fechaEfectos(fechaDesplazamientoISO) {
  const m = String(fechaDesplazamientoISO || '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const anio = Number(m[1]) + (Number(m[2]) >= 7 ? 1 : 0);
  return '0101' + String(anio);
}

// --- El mapeo ---------------------------------------------------------------
const SEXO = { 'Hombre': 'V', 'Mujer': 'M' };

function montarFila(fila) {
  const f = fila.fields || fila;
  const avisos = [];

  const paisNacimiento = f['PaisNacimiento'];
  const esEspana = mayus(paisNacimiento || '') === 'ESPAÑA';
  const cp = String(f['Codigo Postal'] || '').replace(/\D/g, '');

  // Nacionalidad y pais de nacimiento -> ISO-2. null = no se genera.
  const isoNacionalidad = paisISO(f['Nacionalidad']);
  const isoPaisNacimiento = paisISO(paisNacimiento);
  if (f['Nacionalidad'] && !isoNacionalidad) {
    avisos.push('no reconozco la nacionalidad "' + f['Nacionalidad'] + '"');
  }
  if (paisNacimiento && !isoPaisNacimiento) {
    avisos.push('no reconozco el pais de nacimiento "' + paisNacimiento + '"');
  }

  // Provincia de nacimiento. LA REGLA DE LA TABLA DE PROVINCIAS, tal cual:
  // si nacio en España y no la reconozco, NO SE GENERA. Si nacio fuera, va
  // codigo '00' y el nombre copiado literal, como en las muestras reales.
  const provTexto = f['Provincia de Nacimiento / Province of Birth'];
  let codProvNac, nombreProvNac;
  if (esEspana) {
    const p = provinciaEspanola(provTexto);
    if (!p) {
      avisos.push('nacio en España pero no reconozco la provincia "' + (provTexto || '(vacia)') +
                  '" — se para a proposito, para no mandar una provincia inventada a Hacienda');
      codProvNac = null;
    } else {
      codProvNac = p.codigo;
      nombreProvNac = p.nombre;
    }
  } else {
    codProvNac = '00';
    nombreProvNac = mayus(provTexto || '');
  }

  // Codigo INE del municipio de nacimiento. Solo si nacio en España; fuera van
  // ceros, como en las tres muestras de nacidos en el extranjero.
  const munNac = f['Municipio de Nacimiento / Birth Municipality'];
  let ineNac = '00000';
  if (esEspana) {
    ineNac = (codProvNac ? ineMunicipio(munNac, codProvNac) : null) || ineMunicipioSinProvincia(munNac);
    if (!ineNac) {
      avisos.push('nacio en España pero no encuentro el codigo INE del municipio "' +
                  (munNac || '(vacio)') + '"');
    }
  }

  // Codigo INE del municipio de residencia. ESTE NO ES OPCIONAL NUNCA: va
  // relleno en las cuatro muestras y el cliente siempre vive en España.
  const munRes = f['MunicipioResidencia'];
  const ineRes = ineMunicipio(munRes, cp);
  if (!ineRes) {
    avisos.push('no encuentro el codigo INE del municipio de residencia "' +
                (munRes || '(vacio)') + '" para el codigo postal "' + (cp || '(vacio)') + '"');
  }

  const sexo = SEXO[f['Sexo']];
  if (f['Sexo'] && !sexo) avisos.push('el sexo "' + f['Sexo'] + '" no es Hombre ni Mujer');

  // Tipo de via: si hubo que cortar, que quede dicho.
  const tipoViaOriginal = mayus(f['Tipo de vía / Type of road'] || 'CALLE').trim();
  const tipoVia = abreviarVia(tipoViaOriginal);
  if (tipoViaOriginal.length > 5 && !ABREV_VIA[tipoViaOriginal]) {
    avisos.push('el tipo de via "' + tipoViaOriginal + '" no tiene abreviatura conocida y se ha ' +
                'cortado a "' + tipoVia + '"; revisalo antes de presentar');
  }

  const efectos = fechaEfectos(f['fechaDesplazamiento']);

  const datos = {
    nif: f['NIF'],
    apellidoPrimero: f['ApellidoPrimero'],
    apellidoSegundo: f['ApellidoSegundo'],
    nombre: f['Nombre empleado'],
    nacionalidadISO2: isoNacionalidad,
    sexo: sexo,
    fechaNacimiento: aDDMMAAAA(f['FechaNacimiento']),
    ineMunicipioNacimiento: ineNac,
    municipioNacimiento: munNac,
    codProvinciaNacimiento: codProvNac,
    provinciaNacimiento: nombreProvNac,
    paisNacimientoISO2: isoPaisNacimiento,
    tipoVia: tipoVia,
    nombreVia: f['Nombre de la calle / Name of street'],
    numero: f['Número de tu domicilio / House Number'],
    bloque: '',                       // no hay columna; la zona gris queda en blanco
    planta: f['Planta'],
    puerta: f['Puerta'],
    cp: cp,
    ineMunicipioResidencia: ineRes,
    municipioResidencia: munRes,
    // Casilla 201 y fecha de efectos van atadas: o las dos o ninguna.
    residenteFiscal: efectos ? 'S' : ' ',
    fechaEfectos: efectos || '00000000',
    fechaPresentacion: hoyMadridDDMMAAAA(),
  };

  if (avisos.length) {
    return { ok: false, error: 'No se genera el .030: ' + avisos.join('; ') + '.' };
  }

  try {
    const r = construir030(datos);
    return {
      ok: true,
      nombreFichero: r.nombreFichero,
      // El endpoint de adjuntos de Airtable quiere el fichero en base64. Se
      // codifica en LATIN-1 antes de pasar a base64: en UTF-8 cada acento
      // ocuparia dos bytes y el fichero dejaria de medir 2700.
      base64: Buffer.from(r.texto, 'latin1').toString('base64'),
      bytes: Buffer.byteLength(r.texto, 'latin1'),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// --- Salida del nodo --------------------------------------------------------
const salida = [];
for (const item of $input.all()) {
  const fila = item.json;
  const recordId = fila.id || fila.recordId;
  const r = montarFila(fila);
  salida.push({
    json: Object.assign({
      recordId: recordId,
      nif: (fila.fields || fila)['NIF'] || '',
      nombre_completo: (fila.fields || fila)['Nombre completo'] || '',
    }, r),
  });
}
return salida;
