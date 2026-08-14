// ── 13/08 · Tabla PAIS -> ISO 3166-1 alfa-2, para el fichero .030 ──────────────
//
// PARA QUE ES: el fichero .030 de la AEAT guarda la nacionalidad (casilla 205) y
// el pais de nacimiento (casilla 216) en DOS LETRAS, y Airtable los guarda con el
// NOMBRE LARGO. Esta tabla traduce de uno a otro.
//
// LA CLAVE ES EL NOMBRE EXACTO DE LA OPCION DE AIRTABLE, tal cual: mayusculas sin
// acentos SALVO 'ESPAÑA', 'CURAÇAO' y 'PAISES BAJOS (PARTE CARIBEÑA)', y con las
// comas invertidas de 'CHECA, REPUBLICA' o 'SALVADOR, EL'. NO se normaliza aqui:
// el valor entra tal como sale de la celda.
//
// Cubre las 245 opciones de los tres singleSelect de paises -- Nacionalidad
// (fldfqTiY9Oq6Qjo21), PaisNacimiento (fldCzml10hcjgw7F9) y UltimoPaisResidencia
// (fld80wAfTQMgK0gJF) --, que comparten exactamente la misma lista.
// Comprobado el 13/08: 245 de 245, cero sin mapear y cero sobrantes.
//
// ── TRES ENTRADAS SIN CODIGO, A PROPOSITO ────────────────────────────────────
// 'BANCO CENTRAL EUROPEO', 'ORGANISMOS INTERNACIONALES' y 'OTROS PAISES NO
// RELACIONADOS' NO SON PAISES y no tienen ISO-2. Devuelven cadena vacia. Si algun
// dia una fila trae uno de esos en la nacionalidad, el .030 NO SE PUEDE GENERAR
// tal cual: hay que preguntar. Por eso paisISO() devuelve null y no ''.
//
// ── UN CODIGO REPETIDO, TAMBIEN A PROPOSITO ──────────────────────────────────
// 'LUXEMBURGO' y 'LUXEMBURGO (DI)' comparten LU. El sufijo (DI) es una distincion
// interna de la lista de la AEAT, no otro pais.
//
// ── DOS QUE CONVIENE MIRAR SI ALGUN DIA FALLAN ───────────────────────────────
// 'SAN MARTIN' -> MF (la parte francesa). La parte neerlandesa es SX y NO esta en
//   la lista, asi que se asume MF. Si Fiscal dice lo contrario, se cambia aqui.
// 'MACEDONIA' -> MK y 'SUAZILANDIA' -> SZ: los nombres de la lista son los viejos
//   (hoy Macedonia del Norte y Esuatini), pero el codigo ISO no cambio.
//
// ── TRES MAPAS SOBRE LA MISMA LISTA DE 245 CLAVES ────────────────────────────
// PAIS_ISO / paisISO()                        -> las dos letras para el .030 (Hacienda)
// PAIS_PRESENTACION / paisPresentacion()      -> el nombre escrito en espanol, para el
//                                                informe Mobility en PDF (14/08)
// PAIS_PRESENTACION_EN / paisPresentacionEn() -> el nombre en ingles, §8.3 del contrato,
//                                                para el informe con Idioma = Ingles
// Comparten claves a proposito: una sola lista de paises en todo el proyecto.

const PAIS_ISO = {
  'AFGANISTAN':'AF', 'ALBANIA':'AL', 'ALEMANIA':'DE',
  'ANDORRA':'AD', 'ANGOLA':'AO', 'ANGUILA':'AI',
  'ANTARTIDA':'AQ', 'ANTIGUA Y BARBUDA':'AG', 'ARABIA SAUDI':'SA',
  'ARGELIA':'DZ', 'ARGENTINA':'AR', 'ARMENIA':'AM',
  'ARUBA':'AW', 'AUSTRALIA':'AU', 'AUSTRIA':'AT',
  'AZERBAIYAN':'AZ', 'BAHAMAS':'BS', 'BAHREIN':'BH',
  'BANCO CENTRAL EUROPEO':'', 'BANGLADESH':'BD', 'BARBADOS':'BB',
  'BELGICA':'BE', 'BELICE':'BZ', 'BENIN':'BJ',
  'BERMUDAS':'BM', 'BIELORRUSIA':'BY', 'BOLIVIA':'BO',
  'BOSNIA-HERZEGOVINA':'BA', 'BOTSUANA':'BW', 'BOUVET, ISLA':'BV',
  'BRASIL':'BR', 'BRUNEI':'BN', 'BULGARIA':'BG',
  'BURKINA FASO':'BF', 'BURUNDI':'BI', 'BUTAN':'BT',
  'CABO VERDE, REPUBLICA DE':'CV', 'CAIMAN, ISLAS':'KY', 'CAMBOYA':'KH',
  'CAMERUN':'CM', 'CANADA':'CA', 'CATAR':'QA',
  'CENTROAFRICANA, REPUBLICA':'CF', 'CHAD':'TD', 'CHECA, REPUBLICA':'CZ',
  'CHILE':'CL', 'CHINA':'CN', 'CHIPRE':'CY',
  'COCOS':'CC', 'COLOMBIA':'CO', 'COMORAS':'KM',
  'CONGO':'CG', 'CONGO, REPUBLICA DEMOCRATICA':'CD', 'COOK, ISLAS':'CK',
  'COREA DEL NORTE':'KP', 'COREA DEL SUR':'KR', 'COSTA DE MARFIL':'CI',
  'COSTA RICA':'CR', 'CROACIA':'HR', 'CUBA':'CU',
  'CURAÇAO':'CW', 'DINAMARCA':'DK', 'DOMINICA':'DM',
  'DOMINICANA, REPUBLICA':'DO', 'ECUADOR':'EC', 'EGIPTO':'EG',
  'EMIRATOS ARABES UNIDOS':'AE', 'ERITREA':'ER', 'ESLOVAQUIA':'SK',
  'ESLOVENIA':'SI', 'ESPAÑA':'ES', 'ESTADOS UNIDOS DE AMERICA':'US',
  'ESTONIA':'EE', 'ETIOPIA':'ET', 'FEROE, ISLAS':'FO',
  'FILIPINAS':'PH', 'FINLANDIA':'FI', 'FIYI':'FJ',
  'FRANCIA':'FR', 'GABON':'GA', 'GAMBIA':'GM',
  'GEORGIA':'GE', 'GEORGIA DEL SUR':'GS', 'GHANA':'GH',
  'GIBRALTAR':'GI', 'GRANADA':'GD', 'GRECIA':'GR',
  'GROENLANDIA':'GL', 'GUAM':'GU', 'GUATEMALA':'GT',
  'GUERNESEY':'GG', 'GUINEA':'GN', 'GUINEA ECUATORIAL':'GQ',
  'GUINEA-BISSAU':'GW', 'GUYANA':'GY', 'HAITI':'HT',
  'HEARD Y MCDONALD, ISLAS':'HM', 'HONDURAS':'HN', 'HONG-KONG':'HK',
  'HUNGRIA':'HU', 'INDIA':'IN', 'INDONESIA':'ID',
  'IRAN':'IR', 'IRAQ':'IQ', 'IRLANDA':'IE',
  'ISLA DE MAN':'IM', 'ISLANDIA':'IS', 'ISRAEL':'IL',
  'ITALIA':'IT', 'JAMAICA':'JM', 'JAPON':'JP',
  'JERSEY':'JE', 'JORDANIA':'JO', 'KAZAJSTAN':'KZ',
  'KENIA':'KE', 'KIRGUISTAN':'KG', 'KIRIBATI':'KI',
  'KUWAIT':'KW', 'LAOS':'LA', 'LESOTHO':'LS',
  'LETONIA':'LV', 'LIBANO':'LB', 'LIBERIA':'LR',
  'LIBIA':'LY', 'LIECHTENSTEIN':'LI', 'LITUANIA':'LT',
  'LUXEMBURGO':'LU', 'LUXEMBURGO (DI)':'LU', 'MACAO':'MO',
  'MACEDONIA':'MK', 'MADAGASCAR':'MG', 'MALASIA':'MY',
  'MALAWI':'MW', 'MALDIVAS':'MV', 'MALI':'ML',
  'MALTA':'MT', 'MALVINAS, ISLAS':'FK', 'MARIANAS DEL NORTE, ISLAS':'MP',
  'MARRUECOS':'MA', 'MARSHALL, ISLAS':'MH', 'MAURICIO':'MU',
  'MAURITANIA':'MR', 'MAYOTTE':'YT', 'MENORES ALEJADAS EE.UU, ISLAS':'UM',
  'MEXICO':'MX', 'MICRONESIA':'FM', 'MOLDAVIA':'MD',
  'MONACO':'MC', 'MONGOLIA':'MN', 'MONTENEGRO':'ME',
  'MONTSERRAT':'MS', 'MOZAMBIQUE':'MZ', 'MYANMAR':'MM',
  'NAMIBIA':'NA', 'NAURU':'NR', 'NAVIDAD, ISLA':'CX',
  'NEPAL':'NP', 'NICARAGUA':'NI', 'NIGER':'NE',
  'NIGERIA':'NG', 'NIUE, ISLA':'NU', 'NORFOLK, ISLA':'NF',
  'NORUEGA':'NO', 'NUEVA CALEDONIA':'NC', 'NUEVA ZELANDA':'NZ',
  'OCEANO INDICO, TERRI.BRITANICO':'IO', 'OMAN':'OM', 'ORGANISMOS INTERNACIONALES':'',
  'OTROS PAISES NO RELACIONADOS':'', 'PAISES BAJOS':'NL', 'PAISES BAJOS (PARTE CARIBEÑA)':'BQ',
  'PAKISTAN':'PK', 'PALAU':'PW', 'PANAMA':'PA',
  'PAPUA NUEVA GUINEA':'PG', 'PARAGUAY':'PY', 'PERU':'PE',
  'PITCAIRN':'PN', 'POLINESIA FRANCESA':'PF', 'POLONIA':'PL',
  'PORTUGAL':'PT', 'PUERTO RICO':'PR', 'REINO UNIDO':'GB',
  'RUANDA':'RW', 'RUMANIA':'RO', 'RUSIA':'RU',
  'SAHARA OCCIDENTAL':'EH', 'SALOMON, ISLAS':'SB', 'SALVADOR, EL':'SV',
  'SAMOA':'WS', 'SAMOA AMERICANA':'AS', 'SAN CRISTOBAL Y NIEVES':'KN',
  'SAN MARINO':'SM', 'SAN MARTIN':'MF', 'SAN PEDRO Y MIQUELON':'PM',
  'SAN VICENTE Y LAS GRANADINAS':'VC', 'SANTA ELENA':'SH', 'SANTA LUCIA':'LC',
  'SANTO TOME Y PRINCIPE':'ST', 'SENEGAL':'SN', 'SERBIA':'RS',
  'SEYCHELLES':'SC', 'SIERRA LEONA':'SL', 'SINGAPUR':'SG',
  'SIRIA':'SY', 'SOMALIA':'SO', 'SRI LANKA':'LK',
  'SUAZILANDIA':'SZ', 'SUDAFRICA':'ZA', 'SUDAN':'SD',
  'SUDAN DEL SUR':'SS', 'SUECIA':'SE', 'SUIZA':'CH',
  'SURINAM':'SR', 'TAILANDIA':'TH', 'TAIWAN':'TW',
  'TANZANIA':'TZ', 'TAYIKISTAN':'TJ', 'TERRITORIO PALESTINO OCUPADO':'PS',
  'TIERRAS AUSTRALES FRANCESAS':'TF', 'TIMOR LESTE':'TL', 'TOGO':'TG',
  'TOKELAU, ISLAS':'TK', 'TONGA':'TO', 'TRINIDAD Y TOBAGO':'TT',
  'TUNEZ':'TN', 'TURCAS Y CAICOS, ISLAS':'TC', 'TURKMENISTAN':'TM',
  'TURQUIA':'TR', 'TUVALU':'TV', 'UCRANIA':'UA',
  'UGANDA':'UG', 'URUGUAY':'UY', 'UZBEKISTAN':'UZ',
  'VANUATU':'VU', 'VATICANO, CIUDAD DEL':'VA', 'VENEZUELA':'VE',
  'VIETNAM':'VN', 'VIRGENES BRITANICAS, ISLAS':'VG', 'VIRGENES DE LOS EE.UU, ISLAS':'VI',
  'WALLIS Y FUTUNA, ISLAS':'WF', 'YEMEN':'YE', 'YIBUTI':'DJ',
  'ZAMBIA':'ZM', 'ZIMBABUE':'ZW'
};

// Devuelve el ISO-2 o null. NULL significa "no se puede generar el .030 con esto":
// o el pais no esta en la lista, o es una de las tres entradas que no son paises.
// Nunca devuelve '' silenciosamente, porque un codigo de pais vacio en un fichero
// que va a Hacienda es exactamente el genero de fallo que este proyecto persigue.
function paisISO(nombrePais) {
  if (nombrePais === undefined || nombrePais === null) return null;
  const clave = String(nombrePais).trim();
  if (!clave) return null;
  const iso = PAIS_ISO[clave];
  if (!iso) return null;
  return iso;
}

// ── 14/08 · Mapa de presentacion, §4.3 del contrato del informe Mobility ──────
//
// PARA QUE ES: el .030 quiere dos letras, pero el informe en PDF que el cliente
// se va a guardar quiere el nombre escrito como se escribe en espanol. La celda
// guarda 'MARRUECOS' y en un documento formal eso se lee como un grito.
//
// SE ANADE AQUI Y NO EN OTRO FICHERO porque este ya tiene las 245 claves exactas
// de las opciones de Airtable, comprobadas contra el esquema vivo. Tener dos
// listas de paises en dos ficheros es garantizar que un dia se desincronicen.
//
// PAIS_ISO Y paisISO() NO SE TOCAN: alimentan el fichero que va a Hacienda y
// estan probados 245/245. Esto es solo cosmetica y va aparte.
//
// ── LA REGLA QUE HACE ESTO COMPROBABLE ───────────────────────────────────────
// Un mapa de 245 nombres escritos a mano es un sitio perfecto para colar un pais
// que no existe sin que nadie lo note. Por eso el valor NO es texto libre: tiene
// que ser la MISMA clave con acentos y minusculas, nada mas.
//   - Claves sin coma (219): quitarAcentos(mayusculas(valor)) === clave, exacto.
//   - Claves con coma (26): se desinvierten, y el conjunto de PALABRAS de
//     quitarAcentos(mayusculas(valor)) es el mismo que el de la clave sin coma.
// Asi 'CHECA, REPUBLICA' -> 'Republica Checa' pasa y 'Republica Checa y
// Eslovaquia' no. Lo comprueba docs/test-paises-presentacion.js sobre las 245.
//
// OJO: quitarAcentos quita tildes y dieresis pero NO toca la Ñ ni la Ç, porque
// tres claves las llevan de verdad ('ESPAÑA', 'CURAÇAO' y 'PAISES BAJOS (PARTE
// CARIBEÑA)') y si se normalizasen esas tres no cuadrarian nunca.
//
// ── CUATRO QUE ROMPEN LA REGLA A PROPOSITO (§8.4, decidido el 14/08) ─────────
// Estas cuatro claves necesitan un 'del' o un 'de' que la clave no tiene, y una
// de ellas necesita ademas desabreviar 'TERRI.'. El usuario decide que se
// escriban bien, aunque eso rompa el invariante de "mismo conjunto de palabras":
//   'CONGO, REPUBLICA DEMOCRATICA'    -> 'Republica Democratica del Congo'
//   'OCEANO INDICO, TERRI.BRITANICO'  -> 'Territorio Britanico del Oceano Indico'
//   'NAVIDAD, ISLA'                   -> 'Isla de Navidad'
//   'MENORES ALEJADAS EE.UU, ISLAS'   -> 'Islas Menores Alejadas de EE.UU.'
// (los valores de verdad llevan sus acentos; aqui van sin ellos porque este
// comentario se lee tambien en sitios que no respetan el UTF-8)
//
// EL INVARIANTE NO SE AFLOJA EN GENERAL. Las otras 241 siguen con la regla
// estricta, que es lo unico que impide colar un pais inventado. Estas cuatro
// viven en una LISTA DE EXCEPCIONES EXPLICITA dentro de
// docs/test-paises-presentacion.js, con su motivo escrito y con el valor exacto
// que se espera: si alguien cambia una coma, la prueba sigue fallando. Y la
// prueba comprueba ademas que la lista tiene EXACTAMENTE estas cuatro claves,
// para que no se pueda colar una quinta como excepcion.
//
// ── LAS TRES QUE NO SON PAISES ───────────────────────────────────────────────
// 'BANCO CENTRAL EUROPEO', 'ORGANISMOS INTERNACIONALES' y 'OTROS PAISES NO
// RELACIONADOS' SI tienen presentacion, al contrario que su ISO. Aqui no hay
// nada que se pueda declarar mal: es texto para leer.

const PAIS_PRESENTACION = {
  'AFGANISTAN':'Afganistán', 'ALBANIA':'Albania',
  'ALEMANIA':'Alemania', 'ANDORRA':'Andorra',
  'ANGOLA':'Angola', 'ANGUILA':'Anguila',
  'ANTARTIDA':'Antártida', 'ANTIGUA Y BARBUDA':'Antigua y Barbuda',
  'ARABIA SAUDI':'Arabia Saudí', 'ARGELIA':'Argelia',
  'ARGENTINA':'Argentina', 'ARMENIA':'Armenia',
  'ARUBA':'Aruba', 'AUSTRALIA':'Australia',
  'AUSTRIA':'Austria', 'AZERBAIYAN':'Azerbaiyán',
  'BAHAMAS':'Bahamas', 'BAHREIN':'Bahréin',
  'BANCO CENTRAL EUROPEO':'Banco Central Europeo', 'BANGLADESH':'Bangladesh',
  'BARBADOS':'Barbados', 'BELGICA':'Bélgica',
  'BELICE':'Belice', 'BENIN':'Benín',
  'BERMUDAS':'Bermudas', 'BIELORRUSIA':'Bielorrusia',
  'BOLIVIA':'Bolivia', 'BOSNIA-HERZEGOVINA':'Bosnia-Herzegovina',
  'BOTSUANA':'Botsuana', 'BOUVET, ISLA':'Isla Bouvet',
  'BRASIL':'Brasil', 'BRUNEI':'Brunéi',
  'BULGARIA':'Bulgaria', 'BURKINA FASO':'Burkina Faso',
  'BURUNDI':'Burundi', 'BUTAN':'Bután',
  'CABO VERDE, REPUBLICA DE':'República de Cabo Verde', 'CAIMAN, ISLAS':'Islas Caimán',
  'CAMBOYA':'Camboya', 'CAMERUN':'Camerún',
  'CANADA':'Canadá', 'CATAR':'Catar',
  'CENTROAFRICANA, REPUBLICA':'República Centroafricana', 'CHAD':'Chad',
  'CHECA, REPUBLICA':'República Checa', 'CHILE':'Chile',
  'CHINA':'China', 'CHIPRE':'Chipre',
  'COCOS':'Cocos', 'COLOMBIA':'Colombia',
  'COMORAS':'Comoras', 'CONGO':'Congo',
  'CONGO, REPUBLICA DEMOCRATICA':'República Democrática del Congo', 'COOK, ISLAS':'Islas Cook',
  'COREA DEL NORTE':'Corea del Norte', 'COREA DEL SUR':'Corea del Sur',
  'COSTA DE MARFIL':'Costa de Marfil', 'COSTA RICA':'Costa Rica',
  'CROACIA':'Croacia', 'CUBA':'Cuba',
  'CURAÇAO':'Curaçao', 'DINAMARCA':'Dinamarca',
  'DOMINICA':'Dominica', 'DOMINICANA, REPUBLICA':'República Dominicana',
  'ECUADOR':'Ecuador', 'EGIPTO':'Egipto',
  'EMIRATOS ARABES UNIDOS':'Emiratos Árabes Unidos', 'ERITREA':'Eritrea',
  'ESLOVAQUIA':'Eslovaquia', 'ESLOVENIA':'Eslovenia',
  'ESPAÑA':'España', 'ESTADOS UNIDOS DE AMERICA':'Estados Unidos de América',
  'ESTONIA':'Estonia', 'ETIOPIA':'Etiopía',
  'FEROE, ISLAS':'Islas Feroe', 'FILIPINAS':'Filipinas',
  'FINLANDIA':'Finlandia', 'FIYI':'Fiyi',
  'FRANCIA':'Francia', 'GABON':'Gabón',
  'GAMBIA':'Gambia', 'GEORGIA':'Georgia',
  'GEORGIA DEL SUR':'Georgia del Sur', 'GHANA':'Ghana',
  'GIBRALTAR':'Gibraltar', 'GRANADA':'Granada',
  'GRECIA':'Grecia', 'GROENLANDIA':'Groenlandia',
  'GUAM':'Guam', 'GUATEMALA':'Guatemala',
  'GUERNESEY':'Guernesey', 'GUINEA':'Guinea',
  'GUINEA ECUATORIAL':'Guinea Ecuatorial', 'GUINEA-BISSAU':'Guinea-Bissau',
  'GUYANA':'Guyana', 'HAITI':'Haití',
  'HEARD Y MCDONALD, ISLAS':'Islas Heard y McDonald', 'HONDURAS':'Honduras',
  'HONG-KONG':'Hong-Kong', 'HUNGRIA':'Hungría',
  'INDIA':'India', 'INDONESIA':'Indonesia',
  'IRAN':'Irán', 'IRAQ':'Iraq',
  'IRLANDA':'Irlanda', 'ISLA DE MAN':'Isla de Man',
  'ISLANDIA':'Islandia', 'ISRAEL':'Israel',
  'ITALIA':'Italia', 'JAMAICA':'Jamaica',
  'JAPON':'Japón', 'JERSEY':'Jersey',
  'JORDANIA':'Jordania', 'KAZAJSTAN':'Kazajstán',
  'KENIA':'Kenia', 'KIRGUISTAN':'Kirguistán',
  'KIRIBATI':'Kiribati', 'KUWAIT':'Kuwait',
  'LAOS':'Laos', 'LESOTHO':'Lesotho',
  'LETONIA':'Letonia', 'LIBANO':'Líbano',
  'LIBERIA':'Liberia', 'LIBIA':'Libia',
  'LIECHTENSTEIN':'Liechtenstein', 'LITUANIA':'Lituania',
  'LUXEMBURGO':'Luxemburgo', 'LUXEMBURGO (DI)':'Luxemburgo (DI)',
  'MACAO':'Macao', 'MACEDONIA':'Macedonia',
  'MADAGASCAR':'Madagascar', 'MALASIA':'Malasia',
  'MALAWI':'Malawi', 'MALDIVAS':'Maldivas',
  'MALI':'Malí', 'MALTA':'Malta',
  'MALVINAS, ISLAS':'Islas Malvinas', 'MARIANAS DEL NORTE, ISLAS':'Islas Marianas del Norte',
  'MARRUECOS':'Marruecos', 'MARSHALL, ISLAS':'Islas Marshall',
  'MAURICIO':'Mauricio', 'MAURITANIA':'Mauritania',
  'MAYOTTE':'Mayotte', 'MENORES ALEJADAS EE.UU, ISLAS':'Islas Menores Alejadas de EE.UU.',
  'MEXICO':'México', 'MICRONESIA':'Micronesia',
  'MOLDAVIA':'Moldavia', 'MONACO':'Mónaco',
  'MONGOLIA':'Mongolia', 'MONTENEGRO':'Montenegro',
  'MONTSERRAT':'Montserrat', 'MOZAMBIQUE':'Mozambique',
  'MYANMAR':'Myanmar', 'NAMIBIA':'Namibia',
  'NAURU':'Nauru', 'NAVIDAD, ISLA':'Isla de Navidad',
  'NEPAL':'Nepal', 'NICARAGUA':'Nicaragua',
  'NIGER':'Níger', 'NIGERIA':'Nigeria',
  'NIUE, ISLA':'Isla Niue', 'NORFOLK, ISLA':'Isla Norfolk',
  'NORUEGA':'Noruega', 'NUEVA CALEDONIA':'Nueva Caledonia',
  'NUEVA ZELANDA':'Nueva Zelanda', 'OCEANO INDICO, TERRI.BRITANICO':'Territorio Británico del Océano Índico',
  'OMAN':'Omán', 'ORGANISMOS INTERNACIONALES':'Organismos internacionales',
  'OTROS PAISES NO RELACIONADOS':'Otros países no relacionados', 'PAISES BAJOS':'Países Bajos',
  'PAISES BAJOS (PARTE CARIBEÑA)':'Países Bajos (parte caribeña)', 'PAKISTAN':'Pakistán',
  'PALAU':'Palau', 'PANAMA':'Panamá',
  'PAPUA NUEVA GUINEA':'Papúa Nueva Guinea', 'PARAGUAY':'Paraguay',
  'PERU':'Perú', 'PITCAIRN':'Pitcairn',
  'POLINESIA FRANCESA':'Polinesia Francesa', 'POLONIA':'Polonia',
  'PORTUGAL':'Portugal', 'PUERTO RICO':'Puerto Rico',
  'REINO UNIDO':'Reino Unido', 'RUANDA':'Ruanda',
  'RUMANIA':'Rumanía', 'RUSIA':'Rusia',
  'SAHARA OCCIDENTAL':'Sáhara Occidental', 'SALOMON, ISLAS':'Islas Salomón',
  'SALVADOR, EL':'El Salvador', 'SAMOA':'Samoa',
  'SAMOA AMERICANA':'Samoa Americana', 'SAN CRISTOBAL Y NIEVES':'San Cristóbal y Nieves',
  'SAN MARINO':'San Marino', 'SAN MARTIN':'San Martín',
  'SAN PEDRO Y MIQUELON':'San Pedro y Miquelón', 'SAN VICENTE Y LAS GRANADINAS':'San Vicente y las Granadinas',
  'SANTA ELENA':'Santa Elena', 'SANTA LUCIA':'Santa Lucía',
  'SANTO TOME Y PRINCIPE':'Santo Tomé y Príncipe', 'SENEGAL':'Senegal',
  'SERBIA':'Serbia', 'SEYCHELLES':'Seychelles',
  'SIERRA LEONA':'Sierra Leona', 'SINGAPUR':'Singapur',
  'SIRIA':'Siria', 'SOMALIA':'Somalia',
  'SRI LANKA':'Sri Lanka', 'SUAZILANDIA':'Suazilandia',
  'SUDAFRICA':'Sudáfrica', 'SUDAN':'Sudán',
  'SUDAN DEL SUR':'Sudán del Sur', 'SUECIA':'Suecia',
  'SUIZA':'Suiza', 'SURINAM':'Surinam',
  'TAILANDIA':'Tailandia', 'TAIWAN':'Taiwán',
  'TANZANIA':'Tanzania', 'TAYIKISTAN':'Tayikistán',
  'TERRITORIO PALESTINO OCUPADO':'Territorio Palestino Ocupado', 'TIERRAS AUSTRALES FRANCESAS':'Tierras Australes Francesas',
  'TIMOR LESTE':'Timor Leste', 'TOGO':'Togo',
  'TOKELAU, ISLAS':'Islas Tokelau', 'TONGA':'Tonga',
  'TRINIDAD Y TOBAGO':'Trinidad y Tobago', 'TUNEZ':'Túnez',
  'TURCAS Y CAICOS, ISLAS':'Islas Turcas y Caicos', 'TURKMENISTAN':'Turkmenistán',
  'TURQUIA':'Turquía', 'TUVALU':'Tuvalu',
  'UCRANIA':'Ucrania', 'UGANDA':'Uganda',
  'URUGUAY':'Uruguay', 'UZBEKISTAN':'Uzbekistán',
  'VANUATU':'Vanuatu', 'VATICANO, CIUDAD DEL':'Ciudad del Vaticano',
  'VENEZUELA':'Venezuela', 'VIETNAM':'Vietnam',
  'VIRGENES BRITANICAS, ISLAS':'Islas Vírgenes Británicas', 'VIRGENES DE LOS EE.UU, ISLAS':'Islas Vírgenes de los EE.UU',
  'WALLIS Y FUTUNA, ISLAS':'Islas Wallis y Futuna', 'YEMEN':'Yemen',
  'YIBUTI':'Yibuti', 'ZAMBIA':'Zambia',
  'ZIMBABUE':'Zimbabue'
};

// Devuelve el nombre para imprimir. NUNCA null y NUNCA lanza: al contrario que
// paisISO(), aqui no hay nada que Hacienda pueda leer mal. Si el pais no esta en
// el mapa se devuelve la clave tal cual -- feo, en mayusculas, pero legible --
// porque abortar una memoria fiscal entera por la capitalizacion de un pais
// seria cambiar un problema cosmetico por uno de verdad.
function paisPresentacion(nombrePais) {
  // Cadena vacia y no null: el IR del informe prohibe null/undefined en celdas
  // (§1 del contrato), y este valor va derecho a una celda de tabla.
  if (nombrePais === undefined || nombrePais === null) return '';
  const clave = String(nombrePais).trim();
  if (!clave) return '';
  const presentacion = PAIS_PRESENTACION[clave];
  return presentacion !== undefined ? presentacion : clave;
}

// ── 14/08 · Mapa de presentacion en INGLES, §8.3 del contrato ────────────────
//
// PARA QUE ES: el informe se monta en dos idiomas (§8.2). Cuando la columna
// Idioma vale 'Ingles', el pais de origen tiene que salir en ingles. La celda de
// Airtable sigue guardando 'MARRUECOS', asi que hace falta un segundo mapa sobre
// las MISMAS 245 claves.
//
// ── EL INVARIANTE NO ES EL DEL ESPANOL, Y ES MEJOR ───────────────────────────
// En espanol el valor tiene que ser la misma clave con acentos, o sea que la
// prueba puede derivarlo de la propia clave. En ingles son OTRAS PALABRAS
// ('MARRUECOS' -> 'Morocco'), asi que de la clave no se deriva nada y una tabla
// de 245 nombres escritos a mano volveria a ser el sitio perfecto para colar un
// pais que no existe.
//
// Por eso el valor se ata a un ESTANDAR y no al gusto de nadie: cada valor es el
// NOMBRE CORTO EN INGLES DE ISO 3166-1 para el codigo alfa-2 que PAIS_ISO ya
// tiene para esa clave. La prueba lleva su propia tabla codigo -> nombre, ESCRITA
// APARTE de esta, y compara las dos pasando por PAIS_ISO. Si un nombre se escribe
// mal aqui, la prueba lo ve.
//
// SE RESPETA EL NOMBRE DEL ESTANDAR AUNQUE SUENE RARO EN UN PDF: 'Venezuela
// (Bolivarian Republic of)', 'Taiwan, Province of China', 'Korea, Republic of'.
// No se "arreglan" porque en el momento en que se empieza a arreglar a mano, el
// invariante deja de comprobar nada. Si Fiscal quiere otro nombre comercial para
// alguno, se anade como excepcion explicita en la prueba, igual que las cuatro
// del §8.4 en espanol, y se deja escrito el motivo.
//
// ── LAS DOS COSAS QUE NO SALEN DEL ESTANDAR ──────────────────────────────────
// 1. 'LUXEMBURGO (DI)' comparte el codigo LU con 'LUXEMBURGO'. El sufijo (DI) es
//    una distincion interna de la lista de la AEAT, no otro pais, asi que se
//    arrastra tal cual: 'Luxembourg (DI)'. La prueba lo trata como excepcion
//    declarada, no como fallo.
// 2. Las TRES que no son paises no tienen ISO y quedan EXENTAS del invariante.
//    Se traducen a mano y la prueba comprueba el literal:
//      'BANCO CENTRAL EUROPEO'        -> 'European Central Bank'
//      'ORGANISMOS INTERNACIONALES'   -> 'International organisations'
//      'OTROS PAISES NO RELACIONADOS' -> 'Other countries not listed'

const PAIS_PRESENTACION_EN = {
  'AFGANISTAN':'Afghanistan', 'ALBANIA':'Albania',
  'ALEMANIA':'Germany', 'ANDORRA':'Andorra',
  'ANGOLA':'Angola', 'ANGUILA':'Anguilla',
  'ANTARTIDA':'Antarctica', 'ANTIGUA Y BARBUDA':'Antigua and Barbuda',
  'ARABIA SAUDI':'Saudi Arabia', 'ARGELIA':'Algeria',
  'ARGENTINA':'Argentina', 'ARMENIA':'Armenia',
  'ARUBA':'Aruba', 'AUSTRALIA':'Australia',
  'AUSTRIA':'Austria', 'AZERBAIYAN':'Azerbaijan',
  'BAHAMAS':'Bahamas', 'BAHREIN':'Bahrain',
  'BANCO CENTRAL EUROPEO':'European Central Bank', 'BANGLADESH':'Bangladesh',
  'BARBADOS':'Barbados', 'BELGICA':'Belgium',
  'BELICE':'Belize', 'BENIN':'Benin',
  'BERMUDAS':'Bermuda', 'BIELORRUSIA':'Belarus',
  'BOLIVIA':'Bolivia (Plurinational State of)', 'BOSNIA-HERZEGOVINA':'Bosnia and Herzegovina',
  'BOTSUANA':'Botswana', 'BOUVET, ISLA':'Bouvet Island',
  'BRASIL':'Brazil', 'BRUNEI':'Brunei Darussalam',
  'BULGARIA':'Bulgaria', 'BURKINA FASO':'Burkina Faso',
  'BURUNDI':'Burundi', 'BUTAN':'Bhutan',
  'CABO VERDE, REPUBLICA DE':'Cabo Verde', 'CAIMAN, ISLAS':'Cayman Islands',
  'CAMBOYA':'Cambodia', 'CAMERUN':'Cameroon',
  'CANADA':'Canada', 'CATAR':'Qatar',
  'CENTROAFRICANA, REPUBLICA':'Central African Republic', 'CHAD':'Chad',
  'CHECA, REPUBLICA':'Czechia', 'CHILE':'Chile',
  'CHINA':'China', 'CHIPRE':'Cyprus',
  'COCOS':'Cocos (Keeling) Islands', 'COLOMBIA':'Colombia',
  'COMORAS':'Comoros', 'CONGO':'Congo',
  'CONGO, REPUBLICA DEMOCRATICA':'Congo, Democratic Republic of the', 'COOK, ISLAS':'Cook Islands',
  'COREA DEL NORTE':'Korea (Democratic People\'s Republic of)', 'COREA DEL SUR':'Korea, Republic of',
  'COSTA DE MARFIL':'Côte d\'Ivoire', 'COSTA RICA':'Costa Rica',
  'CROACIA':'Croatia', 'CUBA':'Cuba',
  'CURAÇAO':'Curaçao', 'DINAMARCA':'Denmark',
  'DOMINICA':'Dominica', 'DOMINICANA, REPUBLICA':'Dominican Republic',
  'ECUADOR':'Ecuador', 'EGIPTO':'Egypt',
  'EMIRATOS ARABES UNIDOS':'United Arab Emirates', 'ERITREA':'Eritrea',
  'ESLOVAQUIA':'Slovakia', 'ESLOVENIA':'Slovenia',
  'ESPAÑA':'Spain', 'ESTADOS UNIDOS DE AMERICA':'United States of America',
  'ESTONIA':'Estonia', 'ETIOPIA':'Ethiopia',
  'FEROE, ISLAS':'Faroe Islands', 'FILIPINAS':'Philippines',
  'FINLANDIA':'Finland', 'FIYI':'Fiji',
  'FRANCIA':'France', 'GABON':'Gabon',
  'GAMBIA':'Gambia', 'GEORGIA':'Georgia',
  'GEORGIA DEL SUR':'South Georgia and the South Sandwich Islands', 'GHANA':'Ghana',
  'GIBRALTAR':'Gibraltar', 'GRANADA':'Grenada',
  'GRECIA':'Greece', 'GROENLANDIA':'Greenland',
  'GUAM':'Guam', 'GUATEMALA':'Guatemala',
  'GUERNESEY':'Guernsey', 'GUINEA':'Guinea',
  'GUINEA ECUATORIAL':'Equatorial Guinea', 'GUINEA-BISSAU':'Guinea-Bissau',
  'GUYANA':'Guyana', 'HAITI':'Haiti',
  'HEARD Y MCDONALD, ISLAS':'Heard Island and McDonald Islands', 'HONDURAS':'Honduras',
  'HONG-KONG':'Hong Kong', 'HUNGRIA':'Hungary',
  'INDIA':'India', 'INDONESIA':'Indonesia',
  'IRAN':'Iran (Islamic Republic of)', 'IRAQ':'Iraq',
  'IRLANDA':'Ireland', 'ISLA DE MAN':'Isle of Man',
  'ISLANDIA':'Iceland', 'ISRAEL':'Israel',
  'ITALIA':'Italy', 'JAMAICA':'Jamaica',
  'JAPON':'Japan', 'JERSEY':'Jersey',
  'JORDANIA':'Jordan', 'KAZAJSTAN':'Kazakhstan',
  'KENIA':'Kenya', 'KIRGUISTAN':'Kyrgyzstan',
  'KIRIBATI':'Kiribati', 'KUWAIT':'Kuwait',
  'LAOS':'Lao People\'s Democratic Republic', 'LESOTHO':'Lesotho',
  'LETONIA':'Latvia', 'LIBANO':'Lebanon',
  'LIBERIA':'Liberia', 'LIBIA':'Libya',
  'LIECHTENSTEIN':'Liechtenstein', 'LITUANIA':'Lithuania',
  'LUXEMBURGO':'Luxembourg', 'LUXEMBURGO (DI)':'Luxembourg (DI)',
  'MACAO':'Macao', 'MACEDONIA':'North Macedonia',
  'MADAGASCAR':'Madagascar', 'MALASIA':'Malaysia',
  'MALAWI':'Malawi', 'MALDIVAS':'Maldives',
  'MALI':'Mali', 'MALTA':'Malta',
  'MALVINAS, ISLAS':'Falkland Islands (Malvinas)', 'MARIANAS DEL NORTE, ISLAS':'Northern Mariana Islands',
  'MARRUECOS':'Morocco', 'MARSHALL, ISLAS':'Marshall Islands',
  'MAURICIO':'Mauritius', 'MAURITANIA':'Mauritania',
  'MAYOTTE':'Mayotte', 'MENORES ALEJADAS EE.UU, ISLAS':'United States Minor Outlying Islands',
  'MEXICO':'Mexico', 'MICRONESIA':'Micronesia (Federated States of)',
  'MOLDAVIA':'Moldova, Republic of', 'MONACO':'Monaco',
  'MONGOLIA':'Mongolia', 'MONTENEGRO':'Montenegro',
  'MONTSERRAT':'Montserrat', 'MOZAMBIQUE':'Mozambique',
  'MYANMAR':'Myanmar', 'NAMIBIA':'Namibia',
  'NAURU':'Nauru', 'NAVIDAD, ISLA':'Christmas Island',
  'NEPAL':'Nepal', 'NICARAGUA':'Nicaragua',
  'NIGER':'Niger', 'NIGERIA':'Nigeria',
  'NIUE, ISLA':'Niue', 'NORFOLK, ISLA':'Norfolk Island',
  'NORUEGA':'Norway', 'NUEVA CALEDONIA':'New Caledonia',
  'NUEVA ZELANDA':'New Zealand', 'OCEANO INDICO, TERRI.BRITANICO':'British Indian Ocean Territory',
  'OMAN':'Oman', 'ORGANISMOS INTERNACIONALES':'International organisations',
  'OTROS PAISES NO RELACIONADOS':'Other countries not listed', 'PAISES BAJOS':'Netherlands',
  'PAISES BAJOS (PARTE CARIBEÑA)':'Bonaire, Sint Eustatius and Saba', 'PAKISTAN':'Pakistan',
  'PALAU':'Palau', 'PANAMA':'Panama',
  'PAPUA NUEVA GUINEA':'Papua New Guinea', 'PARAGUAY':'Paraguay',
  'PERU':'Peru', 'PITCAIRN':'Pitcairn',
  'POLINESIA FRANCESA':'French Polynesia', 'POLONIA':'Poland',
  'PORTUGAL':'Portugal', 'PUERTO RICO':'Puerto Rico',
  'REINO UNIDO':'United Kingdom of Great Britain and Northern Ireland', 'RUANDA':'Rwanda',
  'RUMANIA':'Romania', 'RUSIA':'Russian Federation',
  'SAHARA OCCIDENTAL':'Western Sahara', 'SALOMON, ISLAS':'Solomon Islands',
  'SALVADOR, EL':'El Salvador', 'SAMOA':'Samoa',
  'SAMOA AMERICANA':'American Samoa', 'SAN CRISTOBAL Y NIEVES':'Saint Kitts and Nevis',
  'SAN MARINO':'San Marino', 'SAN MARTIN':'Saint Martin (French part)',
  'SAN PEDRO Y MIQUELON':'Saint Pierre and Miquelon', 'SAN VICENTE Y LAS GRANADINAS':'Saint Vincent and the Grenadines',
  'SANTA ELENA':'Saint Helena, Ascension and Tristan da Cunha', 'SANTA LUCIA':'Saint Lucia',
  'SANTO TOME Y PRINCIPE':'Sao Tome and Principe', 'SENEGAL':'Senegal',
  'SERBIA':'Serbia', 'SEYCHELLES':'Seychelles',
  'SIERRA LEONA':'Sierra Leone', 'SINGAPUR':'Singapore',
  'SIRIA':'Syrian Arab Republic', 'SOMALIA':'Somalia',
  'SRI LANKA':'Sri Lanka', 'SUAZILANDIA':'Eswatini',
  'SUDAFRICA':'South Africa', 'SUDAN':'Sudan',
  'SUDAN DEL SUR':'South Sudan', 'SUECIA':'Sweden',
  'SUIZA':'Switzerland', 'SURINAM':'Suriname',
  'TAILANDIA':'Thailand', 'TAIWAN':'Taiwan, Province of China',
  'TANZANIA':'Tanzania, United Republic of', 'TAYIKISTAN':'Tajikistan',
  'TERRITORIO PALESTINO OCUPADO':'Palestine, State of', 'TIERRAS AUSTRALES FRANCESAS':'French Southern Territories',
  'TIMOR LESTE':'Timor-Leste', 'TOGO':'Togo',
  'TOKELAU, ISLAS':'Tokelau', 'TONGA':'Tonga',
  'TRINIDAD Y TOBAGO':'Trinidad and Tobago', 'TUNEZ':'Tunisia',
  'TURCAS Y CAICOS, ISLAS':'Turks and Caicos Islands', 'TURKMENISTAN':'Turkmenistan',
  'TURQUIA':'Türkiye', 'TUVALU':'Tuvalu',
  'UCRANIA':'Ukraine', 'UGANDA':'Uganda',
  'URUGUAY':'Uruguay', 'UZBEKISTAN':'Uzbekistan',
  'VANUATU':'Vanuatu', 'VATICANO, CIUDAD DEL':'Holy See',
  'VENEZUELA':'Venezuela (Bolivarian Republic of)', 'VIETNAM':'Viet Nam',
  'VIRGENES BRITANICAS, ISLAS':'Virgin Islands (British)', 'VIRGENES DE LOS EE.UU, ISLAS':'Virgin Islands (U.S.)',
  'WALLIS Y FUTUNA, ISLAS':'Wallis and Futuna', 'YEMEN':'Yemen',
  'YIBUTI':'Djibouti', 'ZAMBIA':'Zambia',
  'ZIMBABUE':'Zimbabwe'
};

// Misma regla de ultima instancia que paisPresentacion(): si el pais no esta en
// el mapa se devuelve la clave tal cual y el informe sigue saliendo. NUNCA null,
// porque este valor va derecho a una celda del IR y el §1 del contrato prohibe
// null y undefined en las celdas.
function paisPresentacionEn(nombrePais) {
  if (nombrePais === undefined || nombrePais === null) return '';
  const clave = String(nombrePais).trim();
  if (!clave) return '';
  const presentacion = PAIS_PRESENTACION_EN[clave];
  return presentacion !== undefined ? presentacion : clave;
}

if (typeof module !== 'undefined') { module.exports = { PAIS_ISO, paisISO, PAIS_PRESENTACION, paisPresentacion, PAIS_PRESENTACION_EN, paisPresentacionEn }; }
