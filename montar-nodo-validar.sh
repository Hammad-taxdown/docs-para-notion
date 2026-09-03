#!/usr/bin/env bash
# montar-nodo-validar.sh — 26/08 · WP-207 + WP-208
#
# Monta `nodo-validar-normalizar-COMPLETO.js` a partir del codigo VIVO del export
# de beckham_bot, insertandole el corr_id y el Log_Evento de 6 campos.
#
# NO se edita el COMPLETO a mano: se edita este script o el codigo vivo, y se
# vuelve a montar. Y ES UNA PUERTA: exit 1 si algo esta rojo, y no deja un
# COMPLETO a medias.
#
#   bash docs/montar-nodo-validar.sh
cd "$(dirname "$0")/.." || exit 1
V=$(printf '\033[32m'); R=$(printf '\033[31m'); D=$(printf '\033[2m'); N=$(printf '\033[0m')
DEST=docs/nodo-validar-normalizar-COMPLETO.js
TMP=docs/.nodo-validar-en-curso.js

# 01/09 · YA APLICADO NO ES UN FALLO, Y ANTES LO ERA.
# Este script inserta el corr_id sobre el codigo VIVO del export por anclas de texto.
# El 31/08 el COMPLETO se pego en produccion, y el 01/09 se reexporto beckham_bot.json
# desde el nodo vivo -- asi que el export YA TRAE el corr_id dentro y el ancla que el
# montaje busca ha desaparecido. El script abortaba, la puerta salia roja, y el arreglo
# aparente era revertir el export: justo lo contrario de lo que hay que hacer.
# Asi que antes de montar se comprueba si el codigo vivo ya lo lleva. Si lo lleva, se
# salta el montaje y se VERIFICA el COMPLETO que hay en disco, que es lo que de verdad
# importa: que siga coincidiendo byte a byte con el nodo vivo.
YA=$(python3 - <<'FIN'
import json, io, sys
try:
    wf = json.load(io.open('proyecto-mobility/workflows-n8n/beckham_bot_conversacional.json', encoding='utf-8'))
    cod = next(n['parameters']['jsCode'] for n in wf['nodes'] if n['name'] == 'Validar y Normalizar')
    sys.stdout.write('si' if ('corr_id' in cod and 'Log_Evento' in cod) else 'no')
except Exception:
    sys.stdout.write('no')
FIN
)

if [ "$YA" = "si" ]; then
  printf "  ${D}el codigo vivo del export YA lleva el corr_id y el Log_Evento: no hay nada que montar.${N}\n"
  printf "  ${D}se verifica el COMPLETO del disco contra el nodo vivo, que es lo que importa.${N}\n"
  node --check "$DEST" 2>/dev/null || { printf "  ${R}FALLA${N} el COMPLETO no parsea como JS\n"; exit 1; }
  printf "  ${V}OK${N}   parsea como JavaScript\n"
  python3 - <<'FIN' || exit 1
import json, io, sys, hashlib
wf = json.load(io.open('proyecto-mobility/workflows-n8n/beckham_bot_conversacional.json', encoding='utf-8'))
vivo = next(n['parameters']['jsCode'] for n in wf['nodes'] if n['name'] == 'Validar y Normalizar')
disco = io.open('docs/nodo-validar-normalizar-COMPLETO.js', encoding='utf-8').read()
h = lambda t: hashlib.sha256(t.encode('utf-8')).hexdigest()[:12]
if vivo == disco:
    sys.stdout.write('  \033[32mOK\033[0m   el COMPLETO es BYTE A BYTE el nodo vivo (%d car, sha256 %s)\n' % (len(disco), h(disco)))
elif __import__('subprocess').run(['python3', 'docs/montar-validador-2026-09-03b.py', 'docs/.validador-derivado-del-vivo.js'], capture_output=True).returncode == 0 \
        and io.open('docs/.validador-derivado-del-vivo.js', encoding='utf-8').read() == disco:
    # 03/09 · ESTADO INTERMEDIO LEGITIMO: el COMPLETO es el nodo vivo MAS los cuatro parches del
    # 03/09 montados por anclas, pendiente de pegar. Se acepta SOLO si regenerar el parche desde el
    # export da byte a byte el COMPLETO del disco: un COMPLETO editado a mano seguiria en rojo.
    __import__('os').remove('docs/.validador-derivado-del-vivo.js')
    sys.stdout.write('  \033[32mOK\033[0m   el COMPLETO es el nodo vivo + el parche del 03/09 (tarde) (%d car, sha256 %s) \033[2m· PENDIENTE DE PEGAR\033[0m\n' % (len(disco), h(disco)))
else:
    sys.stdout.write('  \033[31mFALLA\033[0m el COMPLETO y el nodo vivo se han separado: disco %d car (%s) vs vivo %d car (%s)\n'
                     % (len(disco), h(disco), len(vivo), h(vivo)))
    sys.exit(1)
FIN
  node docs/test-nodo-validar-completo.js || { printf "  ${R}FALLA la puerta del COMPLETO${N}\n"; exit 1; }
  CAR=$(python3 -c "import io,sys;sys.stdout.write(str(len(io.open('$DEST',encoding='utf-8').read())))")
  if bash -c "python3 - <<'FIN'
import json,io,sys
wf=json.load(io.open('proyecto-mobility/workflows-n8n/beckham_bot_conversacional.json',encoding='utf-8'))
vivo=next(n['parameters']['jsCode'] for n in wf['nodes'] if n['name']=='Validar y Normalizar')
sys.exit(0 if vivo==io.open('docs/nodo-validar-normalizar-COMPLETO.js',encoding='utf-8').read() else 1)
FIN"; then printf "\n  ${V}%s caracteres${N} ${D}· ya pegado en produccion, nada que hacer${N}\n" "$CAR"; else printf "\n  ${V}%s caracteres${N} ${R}· PENDIENTE DE PEGAR${N} ${D}(bash docs/pasos.sh 6)${N}\n" "$CAR"; fi
  exit 0
fi

python3 docs/montar-nodo-validar.py "$TMP" || { rm -f "$TMP"; printf "  ${R}FALLA el montaje${N}\n"; exit 1; }

# sintaxis antes de nada: un COMPLETO que no parsea no se guarda
node --check "$TMP" 2>/dev/null || { printf "  ${R}FALLA${N} el COMPLETO no parsea como JS\n"; rm -f "$TMP"; exit 1; }
printf "  ${V}OK${N}   parsea como JavaScript\n"

mv "$TMP" "$DEST"
node docs/test-nodo-validar-completo.js || { printf "  ${R}FALLA la puerta del COMPLETO${N}\n"; exit 1; }

# el recuento va en CARACTERES, no en bytes: el editor de n8n cuenta caracteres
CAR=$(python3 -c "import io,sys;sys.stdout.write(str(len(io.open('$DEST',encoding='utf-8').read())))")
BYT=$(wc -c <"$DEST" | tr -d ' ')
printf "\n  ${V}%s caracteres${N} ${D}(%s bytes: la diferencia son los acentos)${N}\n" "$CAR" "$BYT"
printf "  ${D}pegar en n8n con Cmd+A: beckham_bot -> nodo 'Validar y Normalizar'${N}\n"
