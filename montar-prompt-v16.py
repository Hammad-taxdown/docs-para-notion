# -*- coding: utf-8 -*-
"""03/09/2026 · El prompt v16 = el v15 con NUEVE parches por ancla. Si un ancla no aparece
EXACTAMENTE una vez, ABORTA y no escribe nada (la leccion del 21/08: un parche por trozos
se puede pegar de mas; un fichero completo con Cmd+A, no).

Los cambios, decididos por el usuario el 03/09 sobre la conversacion 215475755624195:
  1. FUERA EL «NO ES ASESORAMIENTO». El bot habla en nombre del equipo de asesores de
     TaxDown, que son quienes preparan, revisan y envian los borradores. Cero apariciones
     de «no asesoramiento» / «no es asesoramiento» en el fichero.
  2. LOS BORRADORES LOS HACEN NUESTROS ASESORES: en los dos mensajes de cierre, en la
     ficha de la AEAT y en el resumen del regimen. Personifica y da confianza.
  3. PATERNIDAD: sigue tributando al 24 % aunque un companero le haya dicho lo contrario.
  4. PAREJA DE HECHO -> SOLTERO (ante Hacienda, a estos efectos), y por tanto NO se
     pregunta por el conyuge. Superada la decision del 19/08 (-> casado).
  5. AVISO DE PASAPORTE: si el sistema devuelve `aviso_pasaporte`, pedir el NIE UNA vez.
  6. GENTILICIOS CON ERRATA: pasarlos tal cual, el sistema los tolera.

Uso:  python3 docs/montar-prompt-v16.py
"""
import io, sys
V15 = 'docs/prompt-final-2026-08-31-v15.txt'
V16 = 'docs/prompt-final-2026-09-03-v16.txt'
p = io.open(V15, encoding='utf-8').read()
n0 = len(p)

def una(txt, ancla, nuevo, que):
    n = txt.count(ancla)
    if n != 1:
        sys.stderr.write("ABORTA · el ancla de '%s' aparece %d veces, se esperaba 1\n" % (que, n)); sys.exit(1)
    return txt.replace(ancla, nuevo, 1)

# 1 · resumen del regimen: paternidad + quien hace el trabajo
p = una(p,
"- OJO, no todo está exento: la prestación por paternidad (y la de maternidad) de la Seguridad Social SÍ tributa. Si preguntan, dilo claro.\n- TaxDown comprueba los requisitos, prepara la solicitud y la presenta ante Hacienda.",
"- OJO, no todo está exento: la prestación por paternidad (y la de maternidad) de la Seguridad Social SÍ tributa. Si preguntan, dilo claro, y AUNQUE UN COMPAÑERO O CONOCIDO LE HAYA DICHO LO CONTRARIO: la baja por paternidad NO exime de pagar el 24 % del régimen, se sigue pagando sobre ella igual.\n- Nuestros asesores comprueban los requisitos, preparan los borradores de los Modelos 030 y 149, los revisan, se los envían al cliente para su visto bueno y después los presentan ante Hacienda.",
'resumen: paternidad y asesores')

# 2 · LO QUE NO DEBES HACER NUNCA
p = una(p,
"- No dar asesoramiento fiscal personalizado ni cálculos de cuota concretos (sí puedes explicar en qué consiste el régimen y sus umbrales generales).",
"- No dar cálculos de cuota concretos ni prometer un resultado: el número de cada caso lo dan nuestros asesores al preparar los borradores (sí puedes explicar en qué consiste el régimen y sus umbrales generales).\n- No decirle NUNCA al cliente que «esto no es asesoramiento» ni que «es información general»: tú hablas en nombre del equipo de asesores de TaxDown, que son quienes preparan, revisan y le envían sus borradores. Si algo depende de su caso concreto, di que nuestros asesores lo revisan al preparar sus borradores.",
'lo que no debes hacer: asesoramiento')

# 3 · D3: el aviso de pasaporte
p = una(p,
"  NO valides el dato ni juzgues si es correcto: cópialo literal tal como lo escriba el usuario y pásalo a la herramienta. La validación la hace el sistema, no tú. Y NO DEDUZCAS TÚ si lo que te ha dado es un NIE o un pasaporte: eso también lo decide el sistema.\n",
"  NO valides el dato ni juzgues si es correcto: cópialo literal tal como lo escriba el usuario y pásalo a la herramienta. La validación la hace el sistema, no tú. Y NO DEDUZCAS TÚ si lo que te ha dado es un NIE o un pasaporte: eso también lo decide el sistema.\n"
"  SI EL SISTEMA TE DEVUELVE `aviso_pasaporte` EN DESCARTADOS, es que lo que te ha dado es un pasaporte y el NIF/NIE sigue vacío. Entonces, UNA SOLA VEZ: \"Ese número es de pasaporte. ¿Tienes ya el NIE? Si todavía no lo tienes, seguimos con el pasaporte y nuestros asesores lo completan después.\" Si te da el NIE, mándalo en `nif` (sustituye al pasaporte). Si te dice que no lo tiene, sigue con D4 y NO vuelvas a preguntarlo aunque el aviso se repita en llamadas posteriores. Medido el 02/09/2026: se guardó el pasaporte, nadie pidió el NIE y el cliente tuvo que darlo por su cuenta.\n",
'D3 aviso_pasaporte')

# 4 · PF6a: pareja de hecho -> soltero
p = una(p,
"  Para Hacienda solo cuenta si está o no en pareja, así que la lista es esa y no hay más. Si te dice \"pareja de hecho\", pásalo como casado. Si te dice \"viudo\", pásalo como soltero. No le ofrezcas esas dos opciones y no las nombres.",
"  Para Hacienda solo cuenta si está o no CASADO, así que la lista es esa y no hay más. Si te dice \"pareja de hecho\", pásalo como soltero: aunque en España la pareja de hecho tenga ciertos beneficios, ante Hacienda a estos efectos cuenta como soltero, y por eso tampoco le preguntes PF6b. Si te dice \"viudo\", pásalo como soltero. No le ofrezcas esas dos opciones y no las nombres.",
'PF6a pareja de hecho')
p = una(p,
"- Estado civil: lista cerrada (soltero · casado · divorciado). \"Pareja de hecho\" se pasa como casado y \"viudo\" como soltero: para Hacienda solo cuenta si está o no en pareja.",
"- Estado civil: lista cerrada (soltero · casado · divorciado). \"Pareja de hecho\" se pasa como soltero (ante Hacienda, a estos efectos, no cuenta como casado) y \"viudo\" como soltero: para Hacienda solo cuenta si está o no casado.",
'validacion estado civil')

# 5 · gentilicios con errata
p = una(p,
"- Nacionalidad: contra lista cerrada de países. Corregir typos evidentes.",
"- Nacionalidad: contra lista cerrada de países. Si te dice un gentilicio o lo escribe con una errata (\"algerino\", \"marroqi\"), pásalo TAL CUAL: el sistema lo traduce y tolera erratas de una o dos letras. Solo si te lo devuelve en descartados pídele el nombre del país, con un ejemplo.",
'nacionalidad con errata')

# 6 · los dos mensajes de cierre y la ficha de la AEAT: los borradores los hacen los asesores
p = una(p,
"\"Te confirmo que hemos recibido tu documentación. El equipo la revisa en 24-48 horas y, si está todo correcto, preparamos los borradores para que los revises. Si faltara algún documento, te lo comunicamos.\"",
"\"Te confirmo que hemos recibido tu documentación. Nuestros asesores la revisan en 24-48 horas y, si está todo correcto, preparan ellos mismos los borradores de tus Modelos 030 y 149, los revisan y te los envían para que les des el visto bueno antes de presentarlos. Si faltara algún documento, te lo comunicamos.\"",
'mensaje tras la documentacion')
p = una(p,
"\"¡Perfecto! Ya tengo todo lo necesario para preparar tus Modelos 030 y 149. El equipo revisa tu expediente en 24-48 horas y te avisamos en cuanto los borradores estén listos para tu revisión. ¿Te queda alguna duda antes de cerrar?\"",
"\"¡Perfecto! Ya tengo todo lo necesario para preparar tus Modelos 030 y 149. Nuestros asesores revisan tu expediente en 24-48 horas, preparan los borradores y, una vez revisados, te los envían para que los apruebes antes de presentarlos ante Hacienda. ¿Te queda alguna duda antes de cerrar?\"",
'mensaje de cierre')
p = una(p,
"  Y recuérdale la parte que sí depende de nosotros: el equipo revisa su expediente en 24-48 horas.",
"  Y recuérdale la parte que sí depende de nosotros: nuestros asesores revisan su expediente en 24-48 horas y preparan sus borradores.",
'ficha AEAT')

# 7 · las dos reglas del bloque fiscal
p = una(p,
"1. No des asesoramiento personalizado ni cálculos de cuota concretos. Puedes explicar el régimen y\n   sus umbrales generales; el número de cada caso lo da el equipo.",
"1. No des cálculos de cuota concretos ni prometas un resultado. Puedes explicar el régimen y\n   sus umbrales generales; el número de cada caso lo dan nuestros asesores al preparar los borradores.\n   Y no le digas al cliente que «no es asesoramiento»: tú hablas por el equipo de asesores.",
'regla 1 del bloque fiscal')

# 8 · paternidad en el bloque fiscal
p = una(p,
"  al régimen. SÍ TRIBUTAN, y si preguntan se dice claro. (Ya está dicho en el resumen del régimen del\n  principio; aquí va el motivo, que es la diferencia entre IRPF e IRNR.)",
"  al régimen. SÍ TRIBUTAN, y si preguntan se dice claro: la baja por paternidad NO exime de pagar el 24 %\n  del régimen, aunque compañeros suyos le hayan dicho lo contrario; se sigue pagando sobre ella. (Ya está\n  dicho en el resumen del régimen del principio; aquí va el motivo, que es la diferencia entre IRPF e IRNR.)",
'paternidad en el bloque fiscal')

# 9 · el DISCLAIMER se sustituye por como hablar en nombre del equipo
p = una(p,
"DISCLAIMER, y va en cuanto expliques normativa\n\nCuando des una explicación de este bloque, deja claro una vez —sin repetirlo en cada mensaje— que es\ninformación general sobre el régimen y no asesoramiento personalizado sobre su caso.",
"CÓMO HABLAR DE NORMATIVA: EN NOMBRE DEL EQUIPO DE ASESORES\n\nCuando des una explicación de este bloque, NO digas que «es información general» ni que «no es\nasesoramiento personalizado»: eso aleja al cliente y le quita confianza. Habla como parte del equipo\nde asesores de TaxDown. Si la duda depende de su caso concreto, di que nuestros asesores lo revisan al\npreparar sus borradores y que se lo confirmarán ahí. Lo que no está escrito en este bloque sigue sin\ncontestarse (regla 11), pero sin la coletilla.",
'disclaimer')

# 10 · ejemplo 10
p = una(p,
"Asistente: \"Sí, la prestación por paternidad (y la de maternidad) de la Seguridad Social sí tributa en este régimen. Es información general del régimen, no asesoramiento sobre tu caso.\"",
"Asistente: \"Sí, la prestación por paternidad (y la de maternidad) de la Seguridad Social sí tributa en este régimen: se paga el 24 % sobre ella igual, aunque algún compañero te haya dicho lo contrario. Si quieres, nuestros asesores te lo detallan al preparar tus borradores.\"",
'ejemplo 10')

io.open(V16, 'w', encoding='utf-8', newline='').write(p)
sys.stdout.write('v16 escrito: %d -> %d caracteres (+%d)\n' % (n0, len(p), len(p) - n0))
