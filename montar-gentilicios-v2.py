# -*- coding: utf-8 -*-
# Genera las entradas nuevas de GENTILICIOS para el validador.
# Las claves van SIN ACENTOS y en minusculas porque normSel() los quita antes de
# buscar. Los valores son el nombre EXACTO del pais en la whitelist de 245.
import re, sys, unicodedata

def sinac(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower())
                   if unicodedata.category(c) != 'Mn')

# pais exacto de la whitelist -> lista de formas que puede decir una persona
NUEVOS = {
 'AFGANISTAN': ['afgano','afgana','afghan','afghanistan'],
 'ANDORRA': ['andorrano','andorrana','andorran'],
 'ANGUILA': ['anguilano','anguilana','anguillan','anguilla'],
 'ANTIGUA Y BARBUDA': ['antiguano','antiguana','antiguan','antigua','barbuda'],
 'ARUBA': ['arubeno','arubena','aruban'],
 'BAHAMAS': ['bahames','bahamesa','bahamian','bahameno','bahamena'],
 'BAHREIN': ['bahreini','bahraini','bahrain'],
 'BANGLADESH': ['bangladesi','bangladeshi','bengali'],
 'BARBADOS': ['barbadense','barbadian'],
 'BELICE': ['beliceno','belicena','belizean','belize'],
 'BENIN': ['benines','beninesa','beninese'],
 'BERMUDAS': ['bermudeno','bermudena','bermudian','bermuda'],
 'BIELORRUSIA': ['bielorruso','bielorrusa','belarusian','belarus','belorrusia'],
 'BOTSUANA': ['botsuano','botsuana','botswanan','botswana'],
 'BRUNEI': ['bruneano','bruneana','bruneian'],
 'BURKINA FASO': ['burkines','burkinesa','burkinabe','burkina'],
 'BURUNDI': ['burundes','burundesa','burundian'],
 'BUTAN': ['butanes','butanesa','bhutanese','bhutan'],
 'CABO VERDE, REPUBLICA DE': ['caboverdiano','caboverdiana','cape verdean','cabo verde','cape verde'],
 'CAIMAN, ISLAS': ['caimanes','caymanian','islas caiman','cayman islands','cayman'],
 'CAMBOYA': ['camboyano','camboyana','cambodian','cambodia'],
 'CATAR': ['catari','qatari','qatar'],
 'CENTROAFRICANA, REPUBLICA': ['centroafricano','centroafricana','central african','republica centroafricana'],
 'CHAD': ['chadiano','chadiana','chadian'],
 'CHIPRE': ['chipriota','cypriot','cyprus'],
 'COMORAS': ['comorense','comorian','comoros','islas comoras'],
 'CONGO': ['congoles','congolesa','congolese','republica del congo'],
 'CONGO, REPUBLICA DEMOCRATICA': ['republica democratica del congo','rd congo','congo kinshasa','zaire','drc'],
 'COOK, ISLAS': ['islas cook','cook islands'],
 'COREA DEL NORTE': ['norcoreano','norcoreana','north korean','north korea','corea del norte'],
 'CURAÇAO': ['curazoleno','curazolena','curacao','curazao'],
 'DOMINICA': ['dominiques','dominiquesa','dominican commonwealth','isla de dominica'],
 'ERITREA': ['eritreo','eritrea','eritrean'],
 'FEROE, ISLAS': ['feroes','faroese','islas feroe','faroe islands'],
 'FIYI': ['fiyiano','fiyiana','fijian','fiji'],
 'GABON': ['gabones','gabonesa','gabonese'],
 'GAMBIA': ['gambiano','gambiana','gambian'],
 'GIBRALTAR': ['gibraltareno','gibraltarena','gibraltarian'],
 'GRANADA': ['granadino','granadina','grenadian','grenada'],
 'GROENLANDIA': ['groenlandes','groenlandesa','greenlandic','greenland'],
 'GUAM': ['guameno','guamena','guamanian'],
 'GUERNESEY': ['guernesiano','guernsey'],
 'GUINEA': ['guineano','guineana','guinean'],
 'GUINEA ECUATORIAL': ['ecuatoguineano','ecuatoguineana','equatorial guinean','equatorial guinea'],
 'GUINEA-BISSAU': ['guineano de bissau','bissau guinean','guinea bissau'],
 'GUYANA': ['guyanes','guyanesa','guyanese'],
 'HAITI': ['haitiano','haitiana','haitian'],
 'HONG-KONG': ['hongkones','hongkonesa','hong konger','hong kong','hongkong'],
 'ISLA DE MAN': ['manes','manx','isle of man'],
 'JAMAICA': ['jamaicano','jamaicana','jamaican'],
 'JERSEY': ['jerseyes','jersiais'],
 'JORDANIA': ['jordano','jordana','jordanian','jordan'],
 'KIRGUISTAN': ['kirguis','kirguiso','kirguisa','kyrgyz','kyrgyzstan'],
 'KIRIBATI': ['kiribatiano','kiribatiana','i kiribati'],
 'KUWAIT': ['kuwaiti','kuwaitiana','kuwaitian'],
 'LAOS': ['laosiano','laosiana','laotian','lao'],
 'LESOTHO': ['lesothense','basotho','lesotho'],
 'LIBERIA': ['liberiano','liberiana','liberian'],
 'LIBIA': ['libio','libia','libyan','libya'],
 'LIECHTENSTEIN': ['liechtensteiniano','liechtensteiniana','liechtensteiner'],
 'LUXEMBURGO': ['luxemburgues','luxemburguesa','luxembourgish','luxembourg'],
 'MACAO': ['macaense','macanese','macau'],
 'MADAGASCAR': ['malgache','madagascan','malagasy'],
 'MALAWI': ['malaui','malauiano','malauiana','malawian'],
 'MALDIVAS': ['maldivo','maldiva','maldivian','maldives'],
 'MALI': ['maliense','malian'],
 'MALTA': ['maltes','maltesa','maltese'],
 'MALVINAS, ISLAS': ['malvinense','falkland islander','islas malvinas','falkland islands','falklands'],
 'MARIANAS DEL NORTE, ISLAS': ['marianas del norte','northern mariana islands','northern marianas'],
 'MARSHALL, ISLAS': ['marshales','marshallese','islas marshall','marshall islands'],
 'MAURICIO': ['mauriciano','mauriciana','mauritian','isla mauricio','mauritius'],
 'MAURITANIA': ['mauritano','mauritana','mauritanian'],
 'MAYOTTE': ['mayotense','mahoran'],
 'MICRONESIA': ['micronesio','micronesia','micronesian'],
 'MONACO': ['monegasco','monegasca','monegasque','monaco'],
 'MONGOLIA': ['mongol','mongola','mongolian'],
 'MONTSERRAT': ['montserratense','montserratian'],
 'MYANMAR': ['birmano','birmana','burmese','birmania','burma','myanmar'],
 'NAMIBIA': ['namibio','namibia','namibian'],
 'NAURU': ['nauruano','nauruana','nauruan'],
 'NEPAL': ['nepali','nepales','nepalesa','nepalese'],
 'NIGER': ['nigerino','nigerina','nigerien'],
 'NUEVA CALEDONIA': ['neocaledonio','neocaledonia','new caledonian','new caledonia'],
 'OMAN': ['omani','omanesa','omanian'],
 'PALAU': ['palauano','palauana','palauan'],
 'PAPUA NUEVA GUINEA': ['papu','papuano','papuana','papua new guinean','papua new guinea','papua'],
 'POLINESIA FRANCESA': ['polinesio','polinesia','french polynesian','french polynesia','tahiti'],
 'PUERTO RICO': ['puertorriqueno','puertorriquena','boricua','puerto rican'],
 'RUANDA': ['ruandes','ruandesa','rwandan','rwanda'],
 'SAHARA OCCIDENTAL': ['sahariano','sahariana','saharaui','sahrawi','western sahara'],
 'SALOMON, ISLAS': ['salomonense','solomon islander','islas salomon','solomon islands'],
 'SAMOA': ['samoano','samoana','samoan'],
 'SAMOA AMERICANA': ['samoano americano','american samoan','american samoa'],
 'SAN CRISTOBAL Y NIEVES': ['sancristobaleno','kittitian','nevisian','saint kitts and nevis','st kitts'],
 'SAN MARINO': ['sanmarinense','sammarinese'],
 'SAN MARTIN': ['sanmartinense','saint martin','sint maarten'],
 'SAN PEDRO Y MIQUELON': ['saint pierre and miquelon','san pedro y miquelon'],
 'SAN VICENTE Y LAS GRANADINAS': ['sanvicentino','vincentian','saint vincent and the grenadines','st vincent'],
 'SANTA ELENA': ['santa elena','saint helena','st helena'],
 'SANTA LUCIA': ['santalucense','saint lucian','saint lucia','st lucia'],
 'SANTO TOME Y PRINCIPE': ['santotomense','sao tomean','sao tome and principe','santo tome'],
 'SEYCHELLES': ['seychellense','seychellois','islas seychelles'],
 'SIERRA LEONA': ['sierraleones','sierraleonesa','sierra leonean','sierra leone'],
 'SOMALIA': ['somali','somalies','somalian'],
 'SRI LANKA': ['ceilanes','esrilanques','sri lankan','ceilan','ceylon'],
 'SUAZILANDIA': ['suazi','swazi','eswatini','swaziland'],
 'SUDAN': ['sudanes','sudanesa','sudanese'],
 'SUDAN DEL SUR': ['sursudanes','south sudanese','south sudan','sudan del sur'],
 'SURINAM': ['surinames','surinamesa','surinamese','suriname'],
 'TAIWAN': ['taiwanes','taiwanesa','taiwanese','formosa'],
 'TANZANIA': ['tanzano','tanzana','tanzanian'],
 'TAYIKISTAN': ['tayiko','tayika','tajik','tajikistan'],
 'TERRITORIO PALESTINO OCUPADO': ['palestino','palestina','palestinian','palestine'],
 'TIMOR LESTE': ['timorense','east timorese','east timor','timor oriental'],
 'TOGO': ['togoles','togolesa','togolese'],
 'TONGA': ['tongano','tongana','tongan'],
 'TRINIDAD Y TOBAGO': ['trinitense','trinidadian','tobagonian','trinidad and tobago','trinidad'],
 'TURCAS Y CAICOS, ISLAS': ['turquescaiqueno','turks and caicos islander','turks and caicos'],
 'TURKMENISTAN': ['turcomano','turcomana','turkmen'],
 'TUVALU': ['tuvaluano','tuvaluana','tuvaluan'],
 'UGANDA': ['ugandes','ugandesa','ugandan'],
 'VANUATU': ['vanuatuense','ni vanuatu','vanuatuan'],
 'VATICANO, CIUDAD DEL': ['vaticano','vatican','holy see','ciudad del vaticano','santa sede'],
 'VIRGENES BRITANICAS, ISLAS': ['islas virgenes britanicas','british virgin islands','bvi'],
 'VIRGENES DE LOS EE.UU, ISLAS': ['islas virgenes americanas','us virgin islands','usvi'],
 'WALLIS Y FUTUNA, ISLAS': ['wallisiano','wallis and futuna','wallis y futuna'],
 'YEMEN': ['yemeni','yemenita','yemenite'],
 'YIBUTI': ['yibutiano','yibutiana','djiboutian','djibouti'],
 'ZAMBIA': ['zambiano','zambiana','zambian'],
 'ZIMBABUE': ['zimbabuense','zimbabwean','zimbabwe'],
 'ANTARTIDA': ['antartico','antarctic','antarctica'],
 'COCOS': ['islas cocos','cocos islands','keeling islands'],
 'NAVIDAD, ISLA': ['isla de navidad','christmas island'],
 'NORFOLK, ISLA': ['isla norfolk','norfolk island'],
 'NIUE, ISLA': ['niuano','niuean','isla niue'],
 'PITCAIRN': ['pitcairnes','pitcairn islander','islas pitcairn'],
 'TOKELAU, ISLAS': ['tokelauano','tokelauan','islas tokelau'],
 'GEORGIA DEL SUR': ['georgia del sur','south georgia'],
 'BOUVET, ISLA': ['isla bouvet','bouvet island'],
 'HEARD Y MCDONALD, ISLAS': ['islas heard y mcdonald','heard island'],
 'OCEANO INDICO, TERRI.BRITANICO': ['territorio britanico del oceano indico','british indian ocean territory','diego garcia'],
 'TIERRAS AUSTRALES FRANCESAS': ['tierras australes francesas','french southern territories'],
 'MENORES ALEJADAS EE.UU, ISLAS': ['islas menores alejadas de estados unidos','us minor outlying islands'],
 'PAISES BAJOS (PARTE CARIBEÑA)': ['caribe neerlandes','caribbean netherlands','bonaire','saba','san eustaquio'],
}

# ── comprobaciones ──────────────────────────────────────────────────────────
val = open('/tmp/val.js', encoding='utf-8').read()
existentes = dict(re.findall(r"'([^']+)'\s*:\s*'([^']+)'",
                  re.search(r"const GENTILICIOS = \{(.*?)\n\};", val, re.S).group(1)))
m = None
for mm in re.finditer(r"const (\w+)\s*=\s*\[(.*?)\];", val, re.S):
    if mm.group(2).count("'") > 200:
        m = mm; break
whitelist = set(re.findall(r"'([^']+)'", m.group(2)))

errores = []
for pais in NUEVOS:
    if pais not in whitelist:
        errores.append(f'PAIS FUERA DE LA WHITELIST: {pais!r}')

nuevas, colisiones, vistas = [], [], {}
for pais, formas in NUEVOS.items():
    for f in formas:
        k = sinac(f)
        if k != f:
            errores.append(f'CLAVE CON ACENTO O MAYUSCULA: {f!r} en {pais}')
            k = k
        if k in existentes:
            colisiones.append(f'{k!r} ya existe -> {existentes[k]!r} (se queria {pais!r})')
            continue
        if k in vistas:
            colisiones.append(f'{k!r} duplicada entre {vistas[k]!r} y {pais!r}')
            continue
        vistas[k] = pais
        nuevas.append((k, pais))

if errores:
    print('ABORTA:'); [print('  ', e) for e in errores]; sys.exit(1)

print(f'paises cubiertos: {len(NUEVOS)}')
print(f'claves nuevas: {len(nuevas)}')
print(f'colisiones descartadas: {len(colisiones)}')
for c in colisiones: print('   ', c)

sin_cubrir = sorted(whitelist - set(existentes.values()) - set(NUEVOS))
print(f'\npaises que SIGUEN sin gentilicio: {len(sin_cubrir)}')
for s in sin_cubrir: print('   ', s)

# ── el trozo a pegar ────────────────────────────────────────────────────────
lineas = ["  // ── 19/08/2026 · segunda tanda de gentilicios ──────────────────────────────",
          "  // Los 228 de la tanda del 6/08 resolvian 97 de los 245 paises. Estas anaden",
          f"  // los {len(NUEVOS)} que quedaban, con masculino, femenino e INGLES, que es por donde",
          "  // mas entran: mucha gente escribe 'Maltese' o 'Sri Lankan' y no el nombre del",
          "  // pais. Las claves van SIN ACENTOS y en minusculas porque normSel() los quita",
          "  // antes de buscar aqui. Sin esto, con typecast:true, cada gentilicio no",
          "  // reconocido CREA UNA OPCION NUEVA en la columna en vez de fallar.",
          ]
ancho = max(len(k) for k, _ in nuevas) + 3
for pais in NUEVOS:
    ks = [k for k, pp in nuevas if pp == pais]
    if not ks: continue
    for k in ks:
        lineas.append(f"  {(chr(39)+k+chr(39)+':').ljust(ancho)} '{pais}',")
open('gentilicios-tanda-2-2026-08-19.txt','w',encoding='utf-8').write('\n'.join(lineas)+'\n')
print(f"\nescrito gentilicios-tanda-2-2026-08-19.txt · {len(lineas)} lineas")
