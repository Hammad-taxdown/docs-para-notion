# -*- coding: utf-8 -*-
"""03/09/2026 (tarde) · Segundo parche al nodo `Validar y Normalizar`, por ancla.

Parte del nodo VIVO (el export, que a las 10:36Z ya llevaba los cuatro parches de la
manana) y cambia SOLO el texto del aviso de pasaporte: el usuario decidio que el NIF o
el NIE es OBLIGATORIO, si o si. El pasaporte se guarda igual, pero el aviso ya no dice
"si no lo tiene, sigue con el pasaporte": dice que sin NIE el expediente no se cierra.
Si el ancla no aparece exactamente una vez, ABORTA.

Uso:  python3 docs/montar-validador-2026-09-03b.py [origen.js] destino.js
"""
import io, json, sys
if len(sys.argv) == 3:
    code = io.open(sys.argv[1], encoding='utf-8').read(); destino = sys.argv[2]
elif len(sys.argv) == 2:
    wf = json.load(io.open('proyecto-mobility/workflows-n8n/beckham_bot_conversacional.json', encoding='utf-8'))
    code = next(n['parameters']['jsCode'] for n in wf['nodes'] if n['name'] == 'Validar y Normalizar')
    destino = sys.argv[1]
else:
    sys.stderr.write('uso: montar-validador-2026-09-03b.py [origen.js] destino.js\n'); sys.exit(2)
A = "descartadas.push('aviso_pasaporte=' + pas + ' guardado como PASAPORTE; el NIF/NIE sigue vacio: pide el NIE UNA sola vez y, si todavia no lo tiene, sigue con el pasaporte');"
B = "descartadas.push('aviso_pasaporte=' + pas + ' guardado como PASAPORTE; el NIF/NIE sigue VACIO y es OBLIGATORIO para presentar los Modelos 030 y 149: pide el NIE ahora; si aun no lo tiene, sigue con los demas datos pero NO cierres el expediente como completo hasta tenerlo');"
n = code.count(A)
if n != 1:
    sys.stderr.write('ABORTA · el ancla del aviso_pasaporte aparece %d veces, se esperaba 1\n' % n); sys.exit(1)
code = code.replace(A, B, 1)
# y el comentario de arriba deja de prometer lo que ya no se hace
code = code.replace("// por `descartados` para que pida el NIE UNA sola vez (lo dice el prompt v16).", "// por `descartados` para que pida el NIE: es OBLIGATORIO y sin el no se cierra (prompt v16).", 1)
io.open(destino, 'w', encoding='utf-8', newline='').write(code)
sys.stdout.write('montado %s: %d caracteres\n' % (destino, len(code)))
