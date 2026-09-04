# -*- coding: utf-8 -*-
"""04/09/2026 · El prompt v17 = el prompt de ENTRADA con CUATRO parches por ancla. Si un ancla no
aparece EXACTAMENTE una vez, ABORTA y no escribe nada.

EL CAMBIO: la autorizacion de TaxDown deja de ser un enlace a un .docx generico y pasa a ser la
tool `enviar_autorizacion`, que manda al chat el PDF ya relleno (nombre, NIF, domicilio, fecha)
para que el cliente solo lo firme. Decision del usuario del 04/09.
  1. Regla 10: CUATRO -> CINCO herramientas, y la ficha de la nueva tool detras de analizar_documento.
  2. El paso «Autorizacion de TaxDown» de DOCUMENTOS A RECOGER: fuera el enlace, dentro la tool.
  3. El resumen final (regla 7 del bloque de recordatorios): CUATRO -> CINCO, con la nueva.

OJO: A PARTIR DE HOY EL PROMPT LO EDITAN TAMBIEN Alina e Iciar en LangSmith. Por eso este montador
NO parte del v16 local por defecto: parte del fichero que se le pase, que tiene que ser el prompt
VIVO (tag prod) copiado de LangSmith. Si las anclas siguen ahi, el parche entra igual.

Uso:  python3 docs/montar-prompt-v17.py [entrada.txt] [salida.txt]
      (por defecto: docs/prompt-final-2026-09-03-v16.txt -> docs/prompt-final-2026-09-04-v17.txt)
"""
import io, sys
ENTRADA = sys.argv[1] if len(sys.argv) > 1 else 'docs/prompt-final-2026-09-03-v16.txt'
SALIDA = sys.argv[2] if len(sys.argv) > 2 else 'docs/prompt-final-2026-09-04-v17.txt'
p = io.open(ENTRADA, encoding='utf-8').read()
n0 = len(p)

def una(txt, ancla, nuevo, que):
    n = txt.count(ancla)
    if n != 1:
        sys.stderr.write("ABORTA · el ancla de '%s' aparece %d veces, se esperaba 1\n" % (que, n)); sys.exit(1)
    return txt.replace(ancla, nuevo, 1)

# 1a · regla 10: cuatro -> cinco
p = una(p, "10. TIENES CUATRO HERRAMIENTAS Y DEBES USARLAS. Son las únicas que tienes:",
           "10. TIENES CINCO HERRAMIENTAS Y DEBES USARLAS. Son las únicas que tienes:", 'regla 10')

# 1b · la ficha de la tool nueva, detras de analizar_documento
ancla_analizar = "- analizar_documento: lee el fichero que el cliente acaba de adjuntar y te dice qué documento es y qué datos contiene. Llámala SIEMPRE que suba un fichero, ANTES de darle las gracias.\n"
ficha = ancla_analizar + (
"- enviar_autorizacion: manda al chat, como fichero adjunto, la autorización de TaxDown YA RELLENA con el nombre, el NIF y el domicilio del cliente, para que solo tenga que firmarla. "
"Llámala UNA vez, en el paso «Autorización de TaxDown» de DOCUMENTOS A RECOGER, y SOLO si el NIF/NIE ya está guardado (sin NIF te devolverá ok:false). "
"Pásale `idioma` = es o en, el idioma en que estás hablando. Ella misma escribe en el chat el mensaje con el PDF: tú NO repitas ningún enlace, NO describas el fichero y NO digas que lo has generado. "
"LEE SU RESPUESTA: si devuelve ok:true, sigue con la frase de este paso (pedir que la firme y la adjunte); si devuelve ok:false, lee el campo error, resuelve lo que diga (normalmente falta el NIF: pídelo y guárdalo) y vuelve a llamarla; si falla dos veces, di que nuestros asesores le harán llegar la autorización y sigue con el siguiente documento.\n")
p = una(p, ancla_analizar, ficha, 'ficha de la tool')

# 2 · el paso de la autorizacion: fuera el enlace, dentro la tool
viejo = ("- Autorización de TaxDown: documento con el que nos autorizan a actuar en su representación; solo\n"
         "  tienen que firmarlo. Dale el enlace para que se la descargue, escrito entero y tal cual:\n"
         "  https://cdn.prod.website-files.com/6978bfbe89b459a3e1a62fcf/6a2a765e65fd996c085d2c3a_Autorizacion_Generica.docx\n"
         "  Dilo así: \"te dejo aquí la autorización para que la descargues, la firmes y me la adjuntes en\n"
         "  este mismo paso\". Es el ÚNICO enlace que puedes dar para este documento: no inventes otro.\n")
nuevo = ("- Autorización de TaxDown: documento con el que nos autorizan a actuar en su representación; solo\n"
         "  tienen que firmarlo. NO le des ningún enlace: llama a la herramienta enviar_autorizacion (con idioma = es\n"
         "  o en) y ella deja en el chat el PDF ya relleno con su nombre y su NIF. Cuando te devuelva ok:true, dilo así:\n"
         "  \"acabo de dejarte aquí arriba la autorización ya rellena con tus datos: solo tienes que firmarla y\n"
         "  adjuntármela en este mismo paso\". Si te devuelve ok:false, haz lo que diga su campo error (casi siempre\n"
         "  es que falta el NIF: pídelo, guárdalo y vuelve a llamarla). NUNCA inventes un enlace ni una plantilla:\n"
         "  la autorización llega SIEMPRE por la herramienta.\n")
p = una(p, viejo, nuevo, 'paso de la autorizacion')

# 3 · el resumen final
p = una(p, "7. Tienes CUATRO herramientas y hay que usarlas: leer_expediente una vez al empezar, calcular_plazo siempre que haya que decidir el plazo de 6 meses, guardar_datos_cliente cada vez que llegue un dato nuevo (con las reglas de cuándo NO se llama, regla 10) y analizar_documento cada vez que el cliente adjunte un fichero.",
           "7. Tienes CINCO herramientas y hay que usarlas: leer_expediente una vez al empezar, calcular_plazo siempre que haya que decidir el plazo de 6 meses, guardar_datos_cliente cada vez que llegue un dato nuevo (con las reglas de cuándo NO se llama, regla 10), analizar_documento cada vez que el cliente adjunte un fichero y enviar_autorizacion una vez, en el paso de la autorización de TaxDown.", 'resumen final')

if 'Autorizacion_Generica' in p:
    sys.stderr.write("ABORTA · el enlace al .docx generico sigue en el prompt\n"); sys.exit(1)
io.open(SALIDA, 'w', encoding='utf-8').write(p)
sys.stdout.write("v17 montado: %d -> %d caracteres (%+d) en %s\n" % (n0, len(p), len(p) - n0, SALIDA))
