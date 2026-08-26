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
