#!/usr/bin/env bash
# push-cierre.sh — el push de cierre de sesión, en un solo comando.
#
# POR QUÉ EXISTE ESTE SCRIPT Y NO UN `git push` NORMAL:
# el directorio de trabajo NO es un repo de git, y el remoto tiene la carpeta
# `docs/` APLANADA en la raíz (`prds/`, `prompt-langsmith-*.txt`, `scripts/`
# viven arriba, no dentro de `docs/`). Hacer `git init` aquí produce ~70
# borrados falsos, y commitearlos borraría el `prds/` del repo y el README.
# Decisión del usuario del 5/08: respetar la estructura plana, opción B.
# Por eso el método es: clonar en el scratchpad, copiar a rutas planas,
# commitear desde el clon.
#
# Uso:
#   ./scripts/push-cierre.sh                 # enseña qué haría, NO sube nada
#   ./scripts/push-cierre.sh --push          # sube de verdad
#   ./scripts/push-cierre.sh --push -m "..."  # con mensaje propio
set -euo pipefail

TRABAJO="/Users/hammad/Documents/Taxdown/Proyecto_Mobility_Beckham/Beckham__v0.12"
REPO="https://github.com/Hammad-taxdown/docs-para-notion.git"
CLON="$(mktemp -d)/docs-para-notion"
SUBIR="no"
MENSAJE=""

while [ $# -gt 0 ]; do
  case "$1" in
    --push) SUBIR="si"; shift ;;
    -m) MENSAJE="${2:-}"; shift 2 ;;
    *) echo "Opción desconocida: $1"; exit 1 ;;
  esac
done

echo "== 1 · Clonando el repo en el scratchpad =="
git clone --quiet "$REPO" "$CLON"
cd "$CLON"

echo "== 2 · Copiando a rutas PLANAS =="
# docs/prds/  ->  prds/   (el remoto no tiene la carpeta docs/)
if [ -d "$TRABAJO/docs/prds" ]; then
  mkdir -p prds
  rsync -a --delete --exclude=".DS_Store" "$TRABAJO/docs/prds/" "prds/"
  echo "   docs/prds/            -> prds/"
fi

# El resto de docs/*  ->  raíz
find "$TRABAJO/docs" -maxdepth 1 -type f -print0 2>/dev/null | while IFS= read -r -d '' f; do
  cp "$f" "./$(basename "$f")"
done
echo "   docs/*.md|.txt|.js     -> raíz"

# Planes, runbooks y notas.
#
# OJO — 16/08/2026: el directorio de trabajo se REORGANIZÓ y estos ficheros YA NO
# están en la raíz. El REMOTO SIGUE SIENDO PLANO (decisión del 5/08, opción B), así
# que se siguen copiando a la raíz del clon: cambia el origen, no el destino.
#   PLAN-*, ARRANQUE-*, REANUDAR-*, DECISIONES-ABIERTAS-*, Trabajo.md, sesion_*  -> plan/
#   ESTUDIO-COSTES-*, NOTAS-PONENTE-*                                            -> informes/
#   INTERCOMDOC.md                                                               -> docs/ (ya lo copia el bloque de arriba)
#   RUNBOOK-*, contexto_proyecto_beckham.md, ARQUITECTURA_bloque1.md             -> _archivo/
#
# Los de _archivo/ se siguen subiendo A PROPÓSITO: ya están en el remoto y quitarlos
# de la copia no los borraría de allí, solo dejaría versiones viejas sin su banner de
# «documento histórico». Se suben para que el remoto lleve el banner puesto.
for origen in "$TRABAJO/plan" "$TRABAJO/plan/historico" "$TRABAJO/informes" "$TRABAJO/_archivo"; do
  [ -d "$origen" ] || continue
  find "$origen" -maxdepth 1 -type f -name "*.md" -print0 2>/dev/null | while IFS= read -r -d '' f; do
    nombre="$(basename "$f")"
    # Un LEEME.md suelto en la raíz PLANA del remoto no dice de qué carpeta habla.
    # Se le pone delante el nombre de la carpeta de origen.
    if [ "$nombre" = "LEEME.md" ]; then
      nombre="LEEME-$(basename "$origen" | tr -d '_').md"
    fi
    cp "$f" "./$nombre"
  done
done
echo "   plan, informes, archivo -> raíz"

# README del proyecto. En el remoto NO se llama README.md: ese nombre ya lo ocupa el
# README propio del repo, y pisarlo borraría su portada.
[ -f "$TRABAJO/README.md" ] && cp "$TRABAJO/README.md" "./LEEME-PROYECTO.md" \
  && echo "   README.md              -> LEEME-PROYECTO.md"

# 19/08/2026 · El CLAUDE.md, que vive en la RAIZ y no en docs/, y que hasta hoy no
# se subia nunca. Es el documento que se carga en cada sesion -- la rutina, las
# reglas con prueba y las decisiones cerradas -- asi que dejarlo solo en el portatil
# no tiene sentido. No expone nada nuevo: context.md y arquitectura-completa, que ya
# estaban en el remoto, llevan los mismos IDs y la misma URL de webhook.
[ -f "$TRABAJO/CLAUDE.md" ] && cp "$TRABAJO/CLAUDE.md" "./CLAUDE.md" \
  && echo "   CLAUDE.md              -> raíz"

# Los scripts de prueba
if [ -d "$TRABAJO/scripts" ]; then
  mkdir -p scripts
  cp "$TRABAJO"/scripts/*.sh scripts/ 2>/dev/null || true
  echo "   scripts/*.sh           -> scripts/"
fi

# La bitácora y el estado
mkdir -p .spartax
cp "$TRABAJO/.spartax/log.md"     .spartax/log.md
cp "$TRABAJO/.spartax/state.json" .spartax/state.json
cp "$TRABAJO/.spartax/context.md" .spartax/context.md
echo "   .spartax/              -> .spartax/"

find . -name ".DS_Store" -not -path "./.git/*" -delete 2>/dev/null || true

echo "== 3 · GUARDIA DE PII: el CSV de empleados NUNCA sube =="
# Lleva NIF y emails reales. Está en .gitignore del directorio de trabajo, pero
# aquí se comprueba otra vez porque el repo fue PÚBLICO del 3 al 5/08 y el CSV
# sigue en el historial: no se le añade ni una copia más.
ENCONTRADO="$(find . -name 'Empleados-Grid view*.csv' -not -path './.git/*' | head)"
if [ -n "$ENCONTRADO" ]; then
  echo "   *** ABORTADO: hay un CSV de empleados en el clon ***"
  echo "$ENCONTRADO"
  exit 1
fi
echo "   OK, ningún CSV de empleados"

echo
echo "== 4 · Lo que cambiaría =="
git add -A
git --no-pager status --short

if [ "$SUBIR" != "si" ]; then
  echo
  echo "SIMULACRO. No se ha subido nada."
  echo "Para subir de verdad:  ./scripts/push-cierre.sh --push"
  echo "Clon en: $CLON"
  exit 0
fi

if git diff --cached --quiet; then
  echo "No hay cambios que subir."
  exit 0
fi

[ -n "$MENSAJE" ] || MENSAJE="Sesión $(date +%Y-%m-%d): bitácora, planes y documentos al día"
git commit --quiet -m "$MENSAJE"
git push --quiet origin main
echo
echo "SUBIDO a main: $MENSAJE"
