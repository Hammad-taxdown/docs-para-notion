# -*- coding: utf-8 -*-
"""04/09/2026 · Monta el codigo SDK de mobility_autorizacion_intercom (la tool del agente que
manda la autorizacion prerrellenada a Intercom) incrustando los dos nodos de codigo y el sticky.
Salida: docs/wf-autorizacion-intercom-COMPLETO.js, que es lo que se valida y se crea por MCP.
   python3 docs/montar-wf-autorizacion.py
"""
import io, json, sys
esq = io.open('docs/wf-autorizacion-intercom-2026-09-04.js', encoding='utf-8').read()
prep = io.open('docs/nodo-autorizacion-preparar-2026-09-04.js', encoding='utf-8').read()
b64 = io.open('docs/nodo-autorizacion-base64-2026-09-04.js', encoding='utf-8').read()
sticky = io.open('docs/sticky-autorizacion-intercom-2026-09-04.md', encoding='utf-8').read()
def lit(s):  # literal JS con comillas dobles, escapado por json
    return json.dumps(s, ensure_ascii=False)
for ancla, valor in (("'__PREPARAR__'", lit(prep)), ("'__BASE64__'", lit(b64)), ("'__STICKY__'", lit(sticky))):
    n = esq.count(ancla)
    esperado = 2 if ancla == "'__BASE64__'" else 1
    if n != esperado:
        sys.stderr.write("ABORTA · %s aparece %d veces, se esperaba %d\n" % (ancla, n, esperado)); sys.exit(1)
    esq = esq.replace(ancla, valor)
io.open('docs/wf-autorizacion-intercom-COMPLETO.js', 'w', encoding='utf-8').write(esq)
sys.stdout.write("montado: %d caracteres\n" % len(esq))
