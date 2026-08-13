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
