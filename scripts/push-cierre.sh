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

# Planes, runbooks y notas de la raíz del directorio de trabajo
for f in PLAN-*.md PLAN-RESTO-*.md RUNBOOK-*.md DECISIONES-ABIERTAS-*.md \
         ESTUDIO-COSTES-*.md NOTAS-PONENTE-*.md INTERCOMDOC.md \
         contexto_proyecto_beckham.md ARQUITECTURA_bloque1.md; do
  for real in "$TRABAJO"/$f; do
    [ -e "$real" ] && cp "$real" "./$(basename "$real")"
  done
done
echo "   planes y runbooks      -> raíz"

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
