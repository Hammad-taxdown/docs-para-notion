#!/usr/bin/env python3
# montar-nodo-validar-subworkflow.py — 27/08/2026 · WP-207
#
# Monta `nodo-validar-normalizar-SUBWORKFLOW-COMPLETO.js` a partir del COMPLETO de
# `beckham_bot`, POR ANCLAS DE TEXTO. Si un ancla desaparece porque alguien toco el
# nodo, ABORTA en vez de generar un COMPLETO mal montado.
#
# Son DOS parches y nada mas. El resto del fichero es byte a byte el de produccion.
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
ORIGEN  = os.path.join(D, 'nodo-validar-normalizar-COMPLETO.js')
DESTINO = os.path.join(D, 'nodo-validar-normalizar-SUBWORKFLOW-COMPLETO.js')

src = open(ORIGEN, encoding='utf-8').read()
orig = len(src)

def parche(s, ancla, nuevo, n):
    if s.count(ancla) != 1:
        sys.stderr.write('ABORTA · el ancla %d no aparece EXACTAMENTE una vez (%d veces).\n'
                         '         Alguien ha tocado %s: revisar a mano antes de montar.\n'
                         % (n, s.count(ancla), os.path.basename(ORIGEN)))
        sys.exit(1)
    return s.replace(ancla, nuevo)

# ── PARCHE 1 · el corr_id llega por workflowInputs, ya montado ────────────────
A1 = """const _corrId = (function () {
  const c = String(body.conversation_id || '').trim();"""
B1 = """const _corrId = (function () {
  // WP-207 · en el subworkflow el corr_id llega por workflowInputs, ya montado.
  // Si viene, MANDA: no se recalcula ni se inventa uno a medias.
  const dado = String(body.corr_id || '').trim();
  if (dado) return dado;
  const c = String(body.conversation_id || '').trim();"""
src = parche(src, A1, B1, 1)

# ── PARCHE 2 · `_dropped` como array, para el dropped[] del contrato ─────────
A2 = """return [{ json: {
  _invalid: false,
  corr_id: _corrId,
  fields,"""
B2 = """return [{ json: {
  _invalid: false,
  corr_id: _corrId,
  // WP-207 · el array crudo para montar `dropped[]` sin volver a partir la cadena.
  // Es una clave AÑADIDA: los nodos que leen `_fechas_descartadas` siguen igual.
  _dropped: descartadas,
  fields,"""
src = parche(src, A2, B2, 2)

# SE COMPRUEBA ANTES DE ESCRIBIR, y por una razon aprendida a golpes: si el
# recuento se comprueba DESPUES, un fallo sale con exit 1 pero ya ha dejado un
# COMPLETO malo en el disco, y el siguiente que pase lo pega. Un `exit 1` no
# deshace un fichero ya escrito. Los numeros van en CARACTERES, no en bytes:
# `wc -c` da bytes y el editor de n8n cuenta caracteres (~1.500 acentos de
# diferencia).
sys.stdout.write('origen  (beckham_bot): ' + str(orig) + ' car.\n')
sys.stdout.write('destino (subworkflow): ' + str(len(src)) + ' car.  (+' + str(len(src) - orig) + ')\n')
sys.stdout.write('ESPERADO: 76156 -> 76569 (+413)\n')
if (orig, len(src)) != (76156, 76569):
    sys.stderr.write('ABORTA · los numeros no son los esperados y NO se ha escrito nada.\n'
                     '         El COMPLETO de origen ha cambiado: mirar por que antes de montar.\n')
    sys.exit(1)

open(DESTINO, 'w', encoding='utf-8').write(src)
sys.stdout.write('OK\n')
