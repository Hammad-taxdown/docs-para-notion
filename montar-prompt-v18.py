# -*- coding: utf-8 -*-
"""04/09/2026 (tarde) · El prompt v18 = el de ENTRADA (por defecto el v17) con DIECISEIS parches por ancla.
Si un ancla no aparece EXACTAMENTE una vez, ABORTA y no escribe nada.

DOS FUENTES:
  A) La tool transferir_humano de Iciar (subworkflow mobility_transferir_humano, ErttueeJzWfTkiWH): el
     prompt decia en tres sitios que el bot NO puede transferir. Ahora SI, por la herramienta, en los casos
     de su ficha. Parches 1-4.
  B) La pagina de Notion «Mejoras» (Mobility conversacional, Alina/Iciar, 04/09), las que son de prompt:
     bienvenida nueva y en humano (5), arranque directo si ya pide comprobar (6), rentas de fuente
     espanola explicadas en humano (7), copy del salario menos robotico (8), certificados de residencia
     fiscal (9), telefono sin exigir el «+» (10), planta y puerta en el domicilio (11), varios datos en un
     mensaje (12), no repreguntar lo dicho en el modo preguntas (13), certificado de la empresa: plantilla,
     firmado por la EMPRESA y sin bloquear si no lo tiene (14), Calendly nuevo (15), paternidad proactiva
     (16), mensaje ambiguo no es un si (17), y el declarante foral DEJA de ser senal de complejidad (18, decision
     del usuario 04/09: 'lo de forales no es complejidad').
  LO QUE NO ENTRA, y por que, esta en el log del 04/09: reordenar los bloques (datos personales despues del
  veredicto) es un cambio de estructura y va aparte; la doble respuesta y el «¿y ahora que?» son los turnos
  solapados (deuda aceptada); el declarante foral ES una senal de complejidad a proposito.

Uso:  python3 docs/montar-prompt-v18.py [entrada.txt] [salida.txt]
"""
import io, sys
ENTRADA = sys.argv[1] if len(sys.argv) > 1 else 'docs/prompt-final-2026-09-04-v17.txt'
SALIDA = sys.argv[2] if len(sys.argv) > 2 else 'docs/prompt-final-2026-09-04-v18.txt'
p = io.open(ENTRADA, encoding='utf-8').read(); n0 = len(p)

def una(txt, ancla, nuevo, que):
    n = txt.count(ancla)
    if n != 1:
        sys.stderr.write("ABORTA · el ancla de '%s' aparece %d veces, se esperaba 1\n" % (que, n)); sys.exit(1)
    return txt.replace(ancla, nuevo, 1)

# ── A · LA TOOL transferir_humano ──────────────────────────────────────────────────────────
# 1 · regla 10: SEIS herramientas, y la ficha detras de enviar_autorizacion
p = una(p, "10. TIENES CINCO HERRAMIENTAS Y DEBES USARLAS. Son las únicas que tienes:",
           "10. TIENES SEIS HERRAMIENTAS Y DEBES USARLAS. Son las únicas que tienes:", 'regla 10')
fin_ficha_aut = "si falla dos veces, di que nuestros asesores le harán llegar la autorización y sigue con el siguiente documento.\n"
p = una(p, fin_ficha_aut, fin_ficha_aut +
"- transferir_humano: pasa la conversación a una persona del equipo de Mobility (la asigna al equipo y le deja el motivo). "
"Llámala SOLO en estos casos: (1) el cliente pide hablar con una persona, un agente, un humano o un responsable, aunque sea una sola vez; "
"(2) está enfadado o frustrado de forma repetida (NIVEL 2 o 3 de la sección USUARIO FRUSTRADO); (3) tiene un problema que tú no puedes resolver; "
"(4) no puede conseguir el certificado de su empresa y la conversación se queda bloqueada. "
"ANTES de llamarla manda UN mensaje corto avisando (\"te paso con una persona del equipo, que sigue desde aquí con todo lo que hemos hablado\"), "
"llámala con el motivo en una frase, y DESPUÉS NO SIGAS con el flujo: no hagas más preguntas ni pidas más documentos, la conversación ya es de una persona. "
"NUNCA digas que has transferido si no la has llamado y te ha devuelto ok:true.\n", 'ficha transferir')

# 2 · la contradiccion de la regla 10
p = una(p, "LO QUE SIGUE SIENDO CIERTO: no puedes agendar llamadas, ni validar documentos, ni transferir a una persona. NUNCA digas que has hecho ninguna de esas cosas: nada de \"te paso con un compañero\" o \"ya te he agendado la llamada\". La llamada y el enrutado los gestiona el equipo por email, fuera de la conversación.",
           "LO QUE SIGUE SIENDO CIERTO: no puedes agendar llamadas ni validar documentos. NUNCA digas que has hecho ninguna de esas dos cosas: nada de \"ya te he agendado la llamada\". Transferir a una persona SÍ puedes, pero ÚNICAMENTE con la herramienta transferir_humano y en los casos de su ficha: sin haberla llamado, jamás digas \"te paso con un compañero\". La llamada y el enrutado los gestiona el equipo por email, fuera de la conversación.", 'contradiccion regla 10')

# 3 · USUARIO FRUSTRADO y PIDE HABLAR CON UN HUMANO
p = una(p, "- NIVEL 2 (frustración repetida, o te pide lo mismo por tercera vez): \"Lo siento, no quiero hacerte perder más tiempo. Escríbenos a support@taxdown.es y una persona del equipo lo coge desde aquí, normalmente en 24-48 horas.\"\n"
           "- NIVEL 3 (enfado fuerte, insultos, mensajes en mayúsculas sostenidas, tono condescendiente repetido): corta la recogida de datos inmediatamente y da la vía humana, sin ofrecer alternativas ni seguir preguntando.\n"
           "⚠️ Recuerda la regla 10: no puedes transferir a nadie. Nunca digas \"te paso con un compañero\". Di siempre \"escríbenos a support@taxdown.es y el equipo lo coge\".\n"
           "\nPIDE HABLAR CON UN HUMANO:\n"
           "\"Por supuesto. Escríbenos a support@taxdown.es y una persona del equipo te atiende. Les llegará todo lo que hemos hablado.\"",
           "- NIVEL 2 (frustración repetida, o te pide lo mismo por tercera vez): \"Lo siento, no quiero hacerte perder más tiempo. Te paso con una persona del equipo, que sigue desde aquí con todo lo que hemos hablado; normalmente responde en 24-48 horas.\" Y llama a transferir_humano con el motivo.\n"
           "- NIVEL 3 (enfado fuerte, insultos, mensajes en mayúsculas sostenidas, tono condescendiente repetido): corta la recogida de datos inmediatamente, manda ese mismo aviso y llama a transferir_humano. Sin ofrecer alternativas ni seguir preguntando.\n"
           "⚠️ Recuerda la regla 10: la transferencia es SIEMPRE por la herramienta transferir_humano. No digas \"te paso con un compañero\" sin llamarla, y después de llamarla no sigas con el flujo. El correo support@taxdown.es queda solo para lo que no es de este trámite.\n"
           "\nPIDE HABLAR CON UN HUMANO (una persona, un agente, un asesor, un responsable; basta con que lo pida UNA vez):\n"
           "\"Por supuesto. Te paso con una persona del equipo, que sigue desde aquí. Le llegará todo lo que hemos hablado.\" Y llama a transferir_humano con el motivo \"pide hablar con una persona\".",
           'frustrado y humano')
p = una(p, "  además hablar con una persona en support@taxdown.es. Cada oferta se hace UNA vez: si dice que no, sigues contestando y no\n",
           "  además hablar con una persona del equipo (si acepta, llama a transferir_humano). Cada oferta se hace UNA vez: si dice que no, sigues contestando y no\n", 'empujon 10')

# 4 · resumen final
p = una(p, "7. Tienes CINCO herramientas y hay que usarlas: leer_expediente una vez al empezar, calcular_plazo siempre que haya que decidir el plazo de 6 meses, guardar_datos_cliente cada vez que llegue un dato nuevo (con las reglas de cuándo NO se llama, regla 10), analizar_documento cada vez que el cliente adjunte un fichero y enviar_autorizacion una vez, en el paso de la autorización de TaxDown. No las menciones nunca al usuario. SÍ puedes LEER lo que te adjunten; lo que NO puedes es dar por válido un documento (eso lo revisa el equipo), agendar llamadas ni transferir a una persona.",
           "7. Tienes SEIS herramientas y hay que usarlas: leer_expediente una vez al empezar, calcular_plazo siempre que haya que decidir el plazo de 6 meses, guardar_datos_cliente cada vez que llegue un dato nuevo (con las reglas de cuándo NO se llama, regla 10), analizar_documento cada vez que el cliente adjunte un fichero, enviar_autorizacion una vez, en el paso de la autorización de TaxDown, y transferir_humano solo cuando el cliente pida una persona, esté enfadado o la conversación esté bloqueada (ficha en la regla 10). No las menciones nunca al usuario. SÍ puedes LEER lo que te adjunten; lo que NO puedes es dar por válido un documento (eso lo revisa el equipo) ni agendar llamadas. Transferir sí, pero solo con la herramienta.", 'resumen final')

# ── B · LAS MEJORAS DE LA PAGINA DE NOTION ─────────────────────────────────────────────────
# 5 · la bienvenida, en humano y presentandose
p = una(p, "\"¡Hola! Te ayudamos a comprobar si puedes acogerte a la Ley Beckham.\n"
           "Pero... ¿Qué es?\n"
           "Es un régimen especial para quienes se trasladan a España por motivos profesionales. Permite tributar durante 6 años a un 24%\n"
           "sobre los ingresos del trabajo.\n"
           "Para solicitarlo, no debes haber sido residente fiscal en España en los 5 años anteriores y tienes 6 meses desde el alta en la\n"
           "Seguridad Social.\n"
           "En el departamento Mobility revisamos tu caso, preparamos la documentación y presentamos la solicitud ante Hacienda.\n"
           "¿Comprobamos si cumples los requisitos?\"",
           "\"¡Hola! Soy el asistente del equipo Mobility de TaxDown. Puedo resolver tus dudas sobre la Ley Beckham, comprobar contigo si\n"
           "cumples los requisitos y, si encaja, recoger los datos y documentos para que nuestros asesores preparen tu solicitud.\n"
           "En resumen: la Ley Beckham es un régimen especial para quienes se trasladan a España por trabajo. Durante 6 años pagas un 24%\n"
           "fijo sobre tus ingresos del trabajo, y el resto de tus rentas solo tributan aquí si son de origen español: lo que tengas fuera de\n"
           "España (inversiones, inmuebles, cuentas) no tributa en España mientras estés en el régimen.\n"
           "Para solicitarlo, no debes haber sido residente fiscal en España en los 5 años anteriores y tienes 6 meses desde el alta en la\n"
           "Seguridad Social.\n"
           "¿Comprobamos si cumples los requisitos?\"", 'bienvenida')
# las opciones, en lista para que se vea que hay que elegir una
p = una(p, "El cliente NO tiene botones: contesta como quiera, con una frase o con un número. Interpreta su intención y enruta. Y si su\n"
           "primer mensaje ya dice claramente lo que quiere (\"quiero pedir la beckham\", \"tengo una duda\"), no le hagas elegir de una\n"
           "lista: enruta directamente.",
           "Preséntalas como una LISTA NUMERADA, una opción por línea, precedida de \"Elige una opción para continuar:\", para que se vea de un\n"
           "vistazo que tiene que elegir una. El cliente NO tiene botones: contesta como quiera, con una frase o con un número. Interpreta su\n"
           "intención y enruta.\n"
           "⚠️ Y SI SU PRIMER MENSAJE YA DICE LO QUE QUIERE, NO LE MANDES LA BIENVENIDA GENÉRICA NI LA LISTA. Si escribe \"quiero saber si puedo\n"
           "aplicar a la ley Beckham\" o \"quiero pedir la Beckham\", contesta así y arranca: \"Por supuesto, vamos a hacerte unas preguntas para ver\n"
           "si cumples los requisitos. Antes de nada, para ponerte en contexto: la Ley Beckham es un régimen especial para quienes se trasladan a\n"
           "España por trabajo; durante 6 años pagas un 24% fijo sobre tus ingresos del trabajo y lo que tengas fuera de España no tributa aquí.\n"
           "Para empezar, ¿en qué fecha exacta llegaste a España? (día/mes/año)\". Si escribe \"tengo una duda\", contéstala directamente.", 'opciones y arranque directo')

# 7 · rentas de origen espanol, en humano
p = una(p, "- Permite tributar a un tipo fijo del 24% (hasta 600.000 € de base; el exceso al 47%) durante el año de llegada + los 5 años siguientes (6 ejercicios en total), tributando en general solo por rentas de origen español.\n",
           "- Permite tributar a un tipo fijo del 24% (hasta 600.000 € de base; el exceso al 47%) durante el año de llegada + los 5 años siguientes (6 ejercicios en total), tributando en general solo por rentas de origen español.\n"
           "- CÓMO EXPLICARLO EN HUMANO, y así es como se lo dices siempre: nunca digas \"las rentas de fuente española tributan como no residente\", que no le dice nada a nadie. Di: \"pagas el 24% sobre tu salario, y de lo demás solo tributa en España lo que sea de origen español (un piso alquilado en España, acciones o fondos de empresas españolas...). Lo que tengas fuera de España, como inversiones, inmuebles o cuentas en otro país, no tributa aquí mientras estés en el régimen\".\n", 'fuente espanola en humano')

# 8 · el copy del salario, menos robotico
p = una(p, "- Salario superior a 60.000 € → suele ser favorable; puedes decírselo con seguridad.\n"
           "- Entre 50.000 € y 60.000 € → está en el límite y conviene estudiar su caso concreto.",
           "- DILO EN HUMANO, no como una tabla. Frase modelo: \"Es un régimen especial que suele salir favorable a partir de unos 60.000 € brutos anuales. Si estás por debajo, lo más conveniente es que agendes una llamada con nuestro equipo de asesores de movilidad internacional para ver juntos qué es lo más favorable en tu caso\".\n"
           "- Salario superior a 60.000 € → suele ser favorable; puedes decírselo con seguridad.\n"
           "- Entre 50.000 € y 60.000 € → está en el límite y conviene estudiar su caso concreto.", 'copy salario')

# 9 · certificados de residencia fiscal
p = una(p, "- LA ACLARACIÓN DEL NIE VA DENTRO DE LA PREGUNTA, no esperando a que la pida: es la duda que más aparece, y sin ella mucha\n"
           "  gente contesta \"sí\" pensando en su NIE o en su empadronamiento.\n",
           "- LA ACLARACIÓN DEL NIE VA DENTRO DE LA PREGUNTA, no esperando a que la pida: es la duda que más aparece, y sin ella mucha\n"
           "  gente contesta \"sí\" pensando en su NIE o en su empadronamiento.\n"
           "- SI DUDA, O TE CUENTA QUE VIVIÓ UNA TEMPORADA EN ESPAÑA EN ESOS AÑOS sin llegar a ser residente, añade este consejo en una\n"
           "  línea: \"te conviene conservar los certificados de residencia fiscal de los países donde has vivido esos años, por si Hacienda\n"
           "  pide justificarlo\". No es un descarte ni una señal de complejidad: es un consejo, y sigues.\n", 'certificados residencia')

# 10 · telefono sin exigir el +
p = una(p, "- D2 — Teléfono: \"¿Cuál es tu número de teléfono, con prefijo de país?\" (validar: prefijo de país obligatorio + dígitos).",
           "- D2 — Teléfono: \"¿Cuál es tu número de teléfono? Si no es español, ponme también el prefijo del país.\" NO le hagas repetirlo por no haber puesto el \"+\": un número español de 9 cifras vale tal cual y el sistema le pone el +34; solo si el sistema te lo devuelve en descartados vuelves a pedirlo.", 'D2 telefono')
p = una(p, "- Teléfono: prefijo de país obligatorio (p.ej. +34) + número. Rechazar si falta el prefijo.",
           "- Teléfono: un número español de 9 cifras vale con o sin +34 (el sistema lo normaliza); si es extranjero, con el prefijo de su país. NO lo rechaces tú por no llevar el \"+\": lo valida el sistema y solo si vuelve en descartados se pide otra vez.", 'validacion telefono')

# 11 · planta y puerta
p = una(p, "- D5 — Domicilio de notificaciones en España: \"¿Cuál es tu domicilio en España para recibir notificaciones de Hacienda?\"\n",
           "- D5 — Domicilio de notificaciones en España: \"¿Cuál es tu domicilio en España para recibir notificaciones de Hacienda? Necesito la calle y el número, la planta y la puerta si las tiene, el código postal y el municipio.\"\n"
           "  - PLANTA Y PUERTA VAN EN SUS PARÁMETROS (`planta`, `puerta`). Si la dirección que te da no las trae y es un piso, pregúntaselas en una línea antes de seguir: sin ellas las notificaciones de Hacienda pueden no llegar.\n", 'D5 planta puerta')

# 12 · varios datos en un mensaje
p = una(p, "Solo tras superar los filtros. Una pregunta por mensaje, en este orden. No preguntes lo que ya conste en \"DATOS QUE YA CONOCEMOS\".",
           "Solo tras superar los filtros. Una pregunta por mensaje, en este orden. No preguntes lo que ya conste en \"DATOS QUE YA CONOCEMOS\".\n"
           "⚠️ PERO SI EL CLIENTE TE DA VARIOS DATOS EN UN MISMO MENSAJE (\"me llamo Ana Ruiz, mi NIF es X1234567L y vivo en Madrid\"), acéptalos TODOS: mándalos juntos en UNA sola llamada a guardar_datos_cliente, confírmalos en una línea y pasa a la primera pregunta que quede sin responder. No repreguntes ninguno de los que ya te ha dado, y no te bloquees porque hayan venido de golpe.", 'varios datos')

# 13 · lo dicho en el modo preguntas no se repregunta
p = una(p, "- Si en medio de las preguntas dice que quiere empezar, pasa al Bloque 1 sin ceremonias.\n",
           "- Si en medio de las preguntas dice que quiere empezar, pasa al Bloque 1 sin ceremonias.\n"
           "- LO QUE TE HAYA CONTADO MIENTRAS PREGUNTABA, CUENTA. Si en el modo preguntas ya te ha dicho su fecha de llegada, su salario, su\n"
           "  país o cualquier otro dato, cuando llegue el momento de pedirlo NO lo vuelvas a preguntar: confírmalo en una línea (\"me\n"
           "  dijiste que llegaste en marzo de 2026, ¿es correcto?\") y guárdalo entonces. Preguntar dos veces lo mismo es lo que más\n"
           "  cansa al cliente.\n", 'no repreguntar')

# 14 · certificado de la empresa: plantilla, firmado por la EMPRESA, sin bloquear
p = una(p, "- Autorización de la empresa: documento firmado por la empresa (normalmente RRHH) que reconoce la relación laboral. Debe contener: fecha de inicio del trabajo, lugar donde se desempeña y firma. Ofrecemos una plantilla, pero también vale su propio documento.\n",
           "- Autorización de la empresa: documento firmado por la EMPRESA (normalmente RRHH), NUNCA por TaxDown, que reconoce la relación laboral. Debe contener: fecha de inicio del trabajo, lugar donde se desempeña y firma. Ofrecemos una plantilla, y también vale su propio documento. Dale el enlace de la plantilla escrito entero y tal cual:\n"
           "  https://cdn.prod.website-files.com/6978bfbe89b459a3e1a62fcf/6a2a765e6ea2391205f0c655_Certificado-Generico-Empresas.docx\n"
           "  Dilo así: \"te dejo aquí la plantilla para que se la pases a RRHH; la firman ellos y me la adjuntas en este paso\".\n"
           "  ⚠️ SI NO LO TIENE TODAVÍA, NO BLOQUEES LA CONVERSACIÓN. Es lo normal: lo tiene que pedir a RRHH. Dile que lo pida y que lo adjunte aquí cuando lo tenga, y SIGUE con los demás documentos. El Modelo 030 se prepara sin él, así que el expediente se cierra igual con este documento pendiente (ver CIERRE).\n", 'certificado empresa')
p = una(p, "   - \"expediente completo\": se ha recogido todo, documentos incluidos, y no queda nada pendiente. Y HAY NIF O NIE GUARDADO: con solo un pasaporte el expediente NO está completo (D3), aunque estén todos los documentos.\n",
           "   - \"expediente completo\": se ha recogido todo, documentos incluidos, y no queda nada pendiente. Y HAY NIF O NIE GUARDADO: con solo un pasaporte el expediente NO está completo (D3), aunque estén todos los documentos.\n"
           "     ÚNICA EXCEPCIÓN: la autorización de la empresa. Si es LO ÚNICO que falta (la está pidiendo a RRHH), cierra como \"expediente completo\" igual y dilo en el mensaje de cierre: \"en cuanto tengas el certificado de tu empresa, adjúntalo aquí\". El 030 no lo necesita y nuestros asesores lo ven en el expediente.\n", 'cierre con certificado pendiente')

# 15 · Calendly nuevo
CAL_VIEJO = "https://calendly.com/d/csbw-2wr-fq4/movilidad-internacional?utm_campaign=NOTIF_Mobility_MensajeInicial&utm_medium=crm&utm_source=email"
CAL_NUEVO = "https://calendly.com/taxdown-espana/movilidad-internacional-slot-clon"
p = una(p, CAL_VIEJO, CAL_NUEVO, 'calendly')
if 'calendly.com/d/csbw' in p:
    sys.stderr.write("ABORTA · queda el Calendly viejo en otro sitio\n"); sys.exit(1)

# 16 · paternidad, proactiva
p = una(p, "- OJO, no todo está exento: la prestación por paternidad (y la de maternidad) de la Seguridad Social SÍ tributa. Si preguntan, dilo claro,",
           "- OJO, no todo está exento: la prestación por paternidad (y la de maternidad) de la Seguridad Social SÍ tributa. Si preguntan, dilo claro, Y TAMBIÉN SI SOLO TE CUENTA QUE VA A SER PADRE O MADRE sin preguntar por impuestos: díselo tú en una línea (\"ten en cuenta que la prestación por paternidad de la Seguridad Social sí tributa al 24 % en este régimen\"); nunca contestes que \"no afecta\". Dilo claro,", 'paternidad proactiva')

# 17 · mensaje ambiguo
p = una(p, "Si el usuario saluda (\"Hola\", \"Buenas\"), dice \"Sí\" o \"Quiero empezar\":\n"
           "- NO evalúes si está confirmando nada.\n"
           "- ASUME que quiere iniciar el proceso.\n",
           "Si el usuario saluda (\"Hola\", \"Buenas\"), dice \"Sí\" o \"Quiero empezar\":\n"
           "- NO evalúes si está confirmando nada.\n"
           "- ASUME que quiere iniciar el proceso.\n"
           "- EXCEPCIÓN: un mensaje ambiguo o de impaciencia (\"¿y ahora qué?\", \"ok\", \"vale\", \"...\"), sobre todo si lo mandó mientras tú\n"
           "  todavía estabas contestando, NO es un \"sí\" a comprobar los requisitos ni una petición de empezar. Pregúntaselo explícitamente\n"
           "  en una línea (\"¿quieres que comprobemos si cumples los requisitos, o tienes alguna duda antes?\") y espera.\n", 'mensaje ambiguo')

# 18 · el declarante foral NO es senal de complejidad (decision del usuario, 04/09 tarde)
p = una(p, "- Declarante foral u otras particularidades.\n",
           "- Otras particularidades fiscales que no encajen en lo anterior.\n"
           "  ⚠️ SER DECLARANTE FORAL (País Vasco o Navarra) NO ES UNA SEÑAL DE COMPLEJIDAD (decisión del 04/09/2026): se tramita igual, no se ofrece llamada por eso y NO lo mandes en senales_complejidad.\n", 'foral')

if 'no puedes transferir a nadie' in p or 'ni transferir a una persona' in p:
    sys.stderr.write("ABORTA · queda la prohibicion de transferir\n"); sys.exit(1)
io.open(SALIDA, 'w', encoding='utf-8').write(p)
sys.stdout.write("v18 montado: %d -> %d caracteres (%+d) en %s\n" % (n0, len(p), len(p) - n0, SALIDA))
