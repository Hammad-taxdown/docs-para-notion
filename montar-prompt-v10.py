# -*- coding: utf-8 -*-
# Monta el prompt v10 a partir del v9 vivo. Cada cambio va con assert: si el
# texto de partida no aparece EXACTAMENTE una vez, el script para y no escribe
# nada. Asi no se publica un prompt a medias.
import sys

ORIGEN  = 'prompt-final-2026-08-17-v9.txt'
DESTINO = 'prompt-final-2026-08-19-v10.txt'
s = open(ORIGEN, encoding='utf-8').read()
inicial = len(s)
cambios = []

def sust(etiqueta, viejo, nuevo):
    global s
    n = s.count(viejo)
    if n != 1:
        print(f'ABORTA · «{etiqueta}»: el texto de partida aparece {n} veces, se esperaba 1')
        sys.exit(1)
    s = s.replace(viejo, nuevo)
    cambios.append((etiqueta, len(nuevo) - len(viejo)))

# ─────────────────────────────────────────────────────────────────────────────
# 1 · EL UMBRAL: 55.000 -> 50.000. Los tramos quedan <50.000 llamada,
#     50.000-60.000 al limite, >60.000 favorable.
# ─────────────────────────────────────────────────────────────────────────────
sust('umbral · resumen del regimen',
 '- Compensa, orientativamente, a partir de unos 55.000-60.000 € de salario.',
 '- Compensa, orientativamente, a partir de unos 50.000-60.000 € de salario.')

sust('umbral · PF1',
 '  (Anclado a los umbrales del régimen: 24% hasta 600.000 €, 47% el exceso; compensa desde ~55.000 €.)\n'
 '  EL SALARIO NUNCA DESCARTA. Por debajo de 55.000 € el régimen está en el límite y eso es motivo de LLAMADA, nunca de descarte: en la llamada el fiscal le dice si le compensa.',
 '  (Anclado a los umbrales del régimen: 24% hasta 600.000 €, 47% el exceso; compensa desde ~50.000 €.)\n'
 '  EL SALARIO NUNCA DESCARTA. Por debajo de 50.000 € el régimen ya no suele salir rentable, y eso es motivo de LLAMADA, nunca de descarte: en la llamada el fiscal le dice si le compensa.')

sust('umbral · mensaje del caso complejo',
 'Mensaje modelo para el caso complejo (y también cuando el salario esté por debajo de 55.000 €):',
 'Mensaje modelo para el caso complejo (y también cuando el salario esté por debajo de 50.000 €):')

sust('umbral · tramos de si le compensa',
 '- Salario superior a 60.000 € → suele ser favorable; puedes decírselo con seguridad.\n'
 '- Entre 55.000 € y 60.000 €, o inferior → está en el límite y conviene estudiar su caso concreto. Recuérdale que el régimen dura 6 años y que hay que solicitarlo ya (plazo de 6 meses desde el alta): si espera que su salario suba, puede compensarle solicitarlo aunque algún año esté más justo.\n'
 '- Nunca des el cálculo exacto de la cuota.',
 '- Salario superior a 60.000 € → suele ser favorable; puedes decírselo con seguridad.\n'
 '- Entre 50.000 € y 60.000 € → está en el límite y conviene estudiar su caso concreto. Recuérdale que el régimen dura 6 años y que hay que solicitarlo ya (plazo de 6 meses desde el alta): si espera que su salario suba, puede compensarle solicitarlo aunque algún año esté más justo.\n'
 '- Por debajo de 50.000 € → por debajo de esa cifra el régimen normalmente ya no sale rentable. PERO ESO NO ES UN DESCARTE Y NO SE LO DICES TÚ: es motivo de LLAMADA, y quien le dice si le compensa es el fiscal. No le digas nunca que no le compensa.\n'
 '- Nunca des el cálculo exacto de la cuota.')

# ─────────────────────────────────────────────────────────────────────────────
# 2 · EL 1 DE JULIO DEJA DE SER SEÑAL DE COMPLEJIDAD.
#     OJO: solo sale del ENRUTADO. El calculo fiscal NO se toca -- fechaEfectos()
#     del .030 y las formulas de situacion fiscal de Airtable siguen igual.
# ─────────────────────────────────────────────────────────────────────────────
sust('1 de julio · nota de residencia del primer año',
 '- Nota de residencia el primer año: si llegó antes del 1 de julio, suele ser residente fiscal ese año (bien para el régimen). Si llegó después del 1 de julio, es posible que el primer año sea NO residente (tributaría con el Modelo 210, con fechas distintas): en ese caso márcalo como caso a revisar en la llamada (complejo).',
 '- Nota de residencia el primer año: si llegó antes del 1 de julio, suele ser residente fiscal ese año. Si llegó después, es posible que el primer año sea NO residente (tributaría con el Modelo 210, con fechas distintas). Es un DATO del expediente, NO una señal de complejidad: no enrutes a llamada por esto.')

sust('1 de julio · fuera de CASO CLARO',
 '- El cónyuge NO se acoge también al régimen, o no aplica (PF5b), y\n'
 '- Llegada anterior al 1 de julio, que le hace residente fiscal el primer año (F1).',
 '- El cónyuge NO se acoge también al régimen, o no aplica (PF5b).')

sust('1 de julio · fuera de CASO COMPLEJO',
 '- El cónyuge también quiere acogerse al régimen.\n'
 '- Llegada posterior al 1 de julio (posible no residente el primer año → Modelo 210, fechas distintas).\n'
 '- Declarante foral u otras particularidades.',
 '- El cónyuge también quiere acogerse al régimen.\n'
 '- Declarante foral u otras particularidades.')

# ─────────────────────────────────────────────────────────────────────────────
# 3 · ESTADO CIVIL: tres opciones. Para Hacienda solo cuenta si esta en pareja.
# ─────────────────────────────────────────────────────────────────────────────
sust('estado civil · PF5a',
 '- PF5a — Estado civil (opción cerrada): "¿Cuál es tu estado civil: soltero, casado, pareja de hecho, divorciado o viudo?" Pásalo tal cual te lo diga; el sistema lo normaliza.\n'
 '- PF5b — (condicional, solo si es casado o pareja de hecho): "¿Tu cónyuge o pareja también quiere acogerse al régimen Beckham?"',
 '- PF5a — Estado civil (opción cerrada): "¿Cuál es tu estado civil: soltero, casado o divorciado?" Pásalo tal cual te lo diga; el sistema lo normaliza.\n'
 '  Para Hacienda solo cuenta si está o no en pareja, así que la lista es esa y no hay más. Si te dice "pareja de hecho", pásalo como casado. Si te dice "viudo", pásalo como soltero. No le ofrezcas esas dos opciones y no las nombres.\n'
 '- PF5b — (condicional, solo si es casado): "¿Tu cónyuge o pareja también quiere acogerse al régimen Beckham?"')

sust('estado civil · nota de conyuge_quiere_acogerse',
 'Si no has llegado a preguntarlo porque no está casado ni tiene pareja de hecho, NO mandes ese parámetro.',
 'Si no has llegado a preguntarlo porque no está casado, NO mandes ese parámetro.')

sust('estado civil · lista cerrada de validacion',
 '- Estado civil: lista cerrada (soltero · casado · pareja de hecho · divorciado · viudo).',
 '- Estado civil: lista cerrada (soltero · casado · divorciado). "Pareja de hecho" se pasa como casado y "viudo" como soltero: para Hacienda solo cuenta si está o no en pareja.')

# ─────────────────────────────────────────────────────────────────────────────
# 4 · FUERA LA PREGUNTA DE LA FECHA DE LA LLAMADA. Si la llamada esta agendada
#     en Calendly, el cliente ya la tiene delante: preguntarla no aporta nada.
# ─────────────────────────────────────────────────────────────────────────────
sust('fuera la pregunta de fecha_llamada',
 '   - "llamada agendada": el caso era complejo (o el salario está por debajo de 55.000), le has dado\n'
 '     el enlace de Calendly Y el cliente te ha confirmado que ya ha reservado la llamada.\n'
 '     ⚠️ EN ESE MOMENTO, Y SOLO EN ESE MOMENTO, pregúntale para qué día la ha reservado y guarda la\n'
 '     fecha en `fecha_llamada`, en formato DD/MM/AAAA. Ejemplo: "Perfecto. ¿Para qué día la has\n'
 '     cogido?" → `fecha_llamada: 22/08/2026`. Si no te la dice o no la sabe, NO INSISTAS y NO LA\n'
 '     INVENTES: se queda vacía y no pasa nada. No la confundas con la fecha de llegada a España ni\n'
 '     con la del alta en la Seguridad Social: son tres datos distintos.',
 '   - "llamada agendada": el caso era complejo (o el salario está por debajo de 50.000), le has dado\n'
 '     el enlace de Calendly Y el cliente te ha confirmado que ya ha reservado la llamada.\n'
 '     NO le preguntes para qué día la ha cogido. Al reservar en Calendly ya le llega la cita con su\n'
 '     fecha y hora, así que preguntarla no aporta nada y alarga el cierre.')

# ─────────────────────────────────────────────────────────────────────────────
# 5 · EL LINK DE LA AUTORIZACION DE TAXDOWN, para que se la pueda descargar.
# ─────────────────────────────────────────────────────────────────────────────
sust('link de la autorizacion de TaxDown',
 '- Autorización de TaxDown: documento con el que nos autorizan a actuar en su representación; solo tienen que firmarlo.',
 '- Autorización de TaxDown: documento con el que nos autorizan a actuar en su representación; solo\n'
 '  tienen que firmarlo. Dale el enlace para que se la descargue, escrito entero y tal cual:\n'
 '  https://cdn.prod.website-files.com/6978bfbe89b459a3e1a62fcf/6a2a765e65fd996c085d2c3a_Autorizacion_Generica.docx\n'
 '  Dilo así: "te dejo aquí la autorización para que la descargues, la firmes y me la adjuntes en\n'
 '  este mismo paso". Es el ÚNICO enlace que puedes dar para este documento: no inventes otro.')

# ─────────────────────────────────────────────────────────────────────────────
# 6 · CUANTO TARDA EL EQUIPO EN REVISAR: 24-48 horas.
# ─────────────────────────────────────────────────────────────────────────────
sust('SLA 24-48 h · tras recibir la documentacion',
 '"Te confirmo que hemos recibido tu documentación. La revisaremos lo antes posible y, si está todo correcto, preparamos los borradores para que los revises. Si faltara algún documento, te lo comunicamos."',
 '"Te confirmo que hemos recibido tu documentación. El equipo la revisa en 24-48 horas y, si está todo correcto, preparamos los borradores para que los revises. Si faltara algún documento, te lo comunicamos."')

sust('SLA 24-48 h · mensaje de cierre',
 '"¡Perfecto! Ya tengo todo lo necesario para preparar tus Modelos 030 y 149. Nuestro equipo los prepara y los presenta ante Hacienda, y te avisaremos en cuanto estén listos para tu revisión. ¿Te queda alguna duda antes de cerrar?"',
 '"¡Perfecto! Ya tengo todo lo necesario para preparar tus Modelos 030 y 149. El equipo revisa tu expediente en 24-48 horas y te avisamos en cuanto los borradores estén listos para tu revisión. ¿Te queda alguna duda antes de cerrar?"')

# ─────────────────────────────────────────────────────────────────────────────
# 7 · EL PORTAL DE HACIENDA, para las preguntas de plazo y de cuanto tarda.
# ─────────────────────────────────────────────────────────────────────────────
sust('link del portal de la AEAT',
 'RESOLUCIÓN Y SEGUIMIENTO (después de presentar el Modelo 149):\n'
 '- La Agencia Tributaria tiene 6 meses para resolver, aunque lo habitual es entre 1 y 3 meses.',
 'RESOLUCIÓN Y SEGUIMIENTO (después de presentar el Modelo 149):\n'
 '- La Agencia Tributaria tiene 6 meses para resolver, aunque lo habitual es entre 1 y 3 meses.\n'
 '- SI PREGUNTA POR EL PLAZO O POR CUÁNTO TARDA, puedes darle la ficha del procedimiento en la sede\n'
 '  de la Agencia Tributaria, donde están los plazos oficiales. Escríbela entera y tal cual:\n'
 '  https://sede.agenciatributaria.gob.es/Sede/procedimientoini/ZN01.shtml\n'
 '  Y recuérdale la parte que sí depende de nosotros: el equipo revisa su expediente en 24-48 horas.')

open(DESTINO, 'w', encoding='utf-8').write(s)

print(f'{ORIGEN}  ->  {DESTINO}')
print(f'{inicial} caracteres  ->  {len(s)} caracteres  ({len(s)-inicial:+d})')
print(f'{len(cambios)} cambios aplicados, todos con assert de coincidencia unica:')
for e, d in cambios:
    print(f'   {d:+6d}  {e}')
