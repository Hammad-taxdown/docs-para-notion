// ── 13/08 · Provincias españolas para el fichero .030 ─────────────────────────
//
// PARA QUE ES: el fichero .030 guarda la provincia de nacimiento en DOS campos --
// el codigo de dos digitos (pos. 404-405) y el nombre (pos. 406-435) -- y Airtable
// guarda solo un texto libre que escribe una persona. Esto traduce de uno a otro.
//
// OJO, NO CONFUNDIR CON LA PROVINCIA DE RESIDENCIA: esa NO necesita tabla. Su
// codigo (pos. 900-901) son LOS DOS PRIMEROS DIGITOS DEL CODIGO POSTAL, verificado
// en las cinco muestras del 12/08 (28015->28, 43002->43, 46021->46, 08038->08,
// 28045->28). Esta tabla es solo para el LUGAR DE NACIMIENTO.
//
// SI EL NACIMIENTO ES EN EL EXTRANJERO no se usa: el codigo va a '00' y el nombre
// se copia tal cual del campo de Airtable. Asi salia en las muestras: '00RABAT',
// '00MARACAY'. La tabla solo entra cuando el codigo NO es 00.
//
// LAS CLAVES VAN NORMALIZADAS -- sin acentos, en mayusculas, sin barras ni guiones,
// espacios colapsados -- porque el campo de Airtable lo teclea una persona y no hay
// whitelist que la sujete. Por eso hay alias: la muestra 2 del .030 traia
// 'CASTELLON DE LA PLANA' donde el nombre oficial es 'Castellón/Castelló'.
// 52 provincias, 97 formas de escribirlas, cero colisiones. Comprobado por script.

const PROV_NOMBRE = {
  '01': 'Araba/Álava',
  '02': 'Albacete',
  '03': 'Alicante/Alacant',
  '04': 'Almería',
  '05': 'Ávila',
  '06': 'Badajoz',
  '07': 'Illes Balears',
  '08': 'Barcelona',
  '09': 'Burgos',
  '10': 'Cáceres',
  '11': 'Cádiz',
  '12': 'Castellón/Castelló',
  '13': 'Ciudad Real',
  '14': 'Córdoba',
  '15': 'A Coruña',
  '16': 'Cuenca',
  '17': 'Girona',
  '18': 'Granada',
  '19': 'Guadalajara',
  '20': 'Gipuzkoa',
  '21': 'Huelva',
  '22': 'Huesca',
  '23': 'Jaén',
  '24': 'León',
  '25': 'Lleida',
  '26': 'La Rioja',
  '27': 'Lugo',
  '28': 'Madrid',
  '29': 'Málaga',
  '30': 'Murcia',
  '31': 'Navarra',
  '32': 'Ourense',
  '33': 'Asturias',
  '34': 'Palencia',
  '35': 'Las Palmas',
  '36': 'Pontevedra',
  '37': 'Salamanca',
  '38': 'Santa Cruz de Tenerife',
  '39': 'Cantabria',
  '40': 'Segovia',
  '41': 'Sevilla',
  '42': 'Soria',
  '43': 'Tarragona',
  '44': 'Teruel',
  '45': 'Toledo',
  '46': 'Valencia/València',
  '47': 'Valladolid',
  '48': 'Bizkaia',
  '49': 'Zamora',
  '50': 'Zaragoza',
  '51': 'Ceuta',
  '52': 'Melilla'
};

// Todas las formas en que alguien puede escribir cada provincia -> su codigo.
const PROV_CODIGO = {
  'ALAVA':'01', 'ALAVA ARABA':'01',
  'ARABA':'01', 'ARABA ALAVA':'01',
  'VITORIA':'01', 'ALBACETE':'02',
  'ALACANT':'03', 'ALICANTE':'03',
  'ALICANTE ALACANT':'03', 'ALMERIA':'04',
  'AVILA':'05', 'BADAJOZ':'06',
  'BALEARES':'07', 'IBIZA':'07',
  'ILLES BALEARS':'07', 'ISLAS BALEARES':'07',
  'MALLORCA':'07', 'MENORCA':'07',
  'PALMA DE MALLORCA':'07', 'BARCELONA':'08',
  'BURGOS':'09', 'CACERES':'10',
  'CADIZ':'11', 'CASTELLO':'12',
  'CASTELLO DE LA PLANA':'12', 'CASTELLON':'12',
  'CASTELLON CASTELLO':'12', 'CASTELLON DE LA PLANA':'12',
  'CIUDAD REAL':'13', 'CORDOBA':'14',
  'A CORUNA':'15', 'CORUNA':'15',
  'LA CORUNA':'15', 'CUENCA':'16',
  'GERONA':'17', 'GIRONA':'17',
  'GRANADA':'18', 'GUADALAJARA':'19',
  'DONOSTIA':'20', 'GIPUZKOA':'20',
  'GUIPUZCOA':'20', 'SAN SEBASTIAN':'20',
  'HUELVA':'21', 'HUESCA':'22',
  'JAEN':'23', 'LEON':'24',
  'LERIDA':'25', 'LLEIDA':'25',
  'LA RIOJA':'26', 'LOGRONO':'26',
  'RIOJA':'26', 'LUGO':'27',
  'MADRID':'28', 'MALAGA':'29',
  'MURCIA':'30', 'NAFARROA':'31',
  'NAVARRA':'31', 'PAMPLONA':'31',
  'ORENSE':'32', 'OURENSE':'32',
  'ASTURIAS':'33', 'GIJON':'33',
  'OVIEDO':'33', 'PRINCIPADO DE ASTURIAS':'33',
  'PALENCIA':'34', 'FUERTEVENTURA':'35',
  'GRAN CANARIA':'35', 'LANZAROTE':'35',
  'LAS PALMAS':'35', 'LAS PALMAS DE GRAN CANARIA':'35',
  'PALMAS':'35', 'PONTEVEDRA':'36',
  'VIGO':'36', 'SALAMANCA':'37',
  'EL HIERRO':'38', 'LA GOMERA':'38',
  'LA PALMA':'38', 'SANTA CRUZ DE TENERIFE':'38',
  'TENERIFE':'38', 'CANTABRIA':'39',
  'SANTANDER':'39', 'SEGOVIA':'40',
  'SEVILLA':'41', 'SORIA':'42',
  'TARRAGONA':'43', 'TERUEL':'44',
  'TOLEDO':'45', 'VALENCIA':'46',
  'VALENCIA VALENCIA':'46', 'VALLADOLID':'47',
  'BILBAO':'48', 'BIZKAIA':'48',
  'VIZCAYA':'48', 'ZAMORA':'49',
  'ZARAGOZA':'50', 'CEUTA':'51',
  'MELILLA':'52'
};

function normProv(s) {
  if (s === undefined || s === null) return '';
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().replace(/[\/\-]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// Devuelve {codigo, nombre} de una provincia ESPAÑOLA, o null si no la reconoce.
// NULL no es un error: casi siempre significa que el nacimiento fue en el
// extranjero, y entonces el llamante pone codigo '00' y copia el nombre tal cual.
function provinciaEspanola(texto) {
  const k = normProv(texto);
  if (!k) return null;
  const cod = PROV_CODIGO[k];
  if (!cod) return null;
  return { codigo: cod, nombre: PROV_NOMBRE[cod] };
}

// ── AVISO PARA QUIEN CONSTRUYA EL GENERADOR ───────────────────────────────────
// NULL NO SIGNIFICA "EXTRANJERO". Significa "no lo reconozco".
//
// El campo de provincia de nacimiento lo teclea una persona en la conversacion, y
// esta tabla cubre 97 formas de escribirlo pero NO TODAS. En la prueba del 13/08,
// 'Sta Cruz de Tenerife' devolvio null aunque 'Tenerife' y 'Santa Cruz de
// Tenerife' si funcionan.
//
// Si el generador trata ese null como "extranjero" y emite codigo '00' junto a un
// nombre de provincia ESPAÑOLA, sale una declaracion mal presentada y nadie se
// entera: el fichero se genera, la sede lo acepta y el error viaja hasta Hacienda.
//
// LA REGLA CORRECTA, y hay que implementarla asi:
//   pais de nacimiento == 'ESPAÑA'  y  provinciaEspanola() == null
//        -> NO GENERAR el .030. Parar y avisar.
//   pais de nacimiento != 'ESPAÑA'
//        -> codigo '00' y el nombre copiado tal cual, como en las muestras
//           ('00RABAT', '00MARACAY').
//
// Es el mismo criterio que paisISO(): antes que rellenar a medias un fichero que
// va a Hacienda, se para.
