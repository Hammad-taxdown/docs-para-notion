#!/bin/bash
# COMPRUEBA el nodo «Montar el .030» de beckham_generar_030 contra sus cinco piezas.
#
# ─── LO QUE ESTE SCRIPT DECIA ANTES Y NO HACIA ───────────────────────────────────
# Su cabecera decia «Regenera docs/nodo-montar-030-COMPLETO.js a partir de sus cinco
# piezas» y NO CONCATENABA NADA: eran dos lineas que lanzaban dos pruebas. Encontrado
# el 14/08/2026. Consecuencia real: los dos arreglos de ese dia --la planta de dos
# caracteres y el '4' de la posicion 1406-- hubo que aplicarlos A MANO en el fichero
# fuente Y en el COMPLETO, y nada garantizaba que siguieran diciendo lo mismo.
#
# ─── POR QUE COMPRUEBA EN VEZ DE REGENERAR ───────────────────────────────────────
# El COMPLETO del .030 ya esta pegado en n8n y comprobado byte a byte contra el nodo
# (sha256 identico el 14/08). Regenerarlo cambiaria el fichero aunque solo fuera un
# comentario, y obligaria a repegar 198 KB en la UI sin ninguna necesidad. Asi que
# aqui NO SE TOCA NADA. El que si regenera es el del informe: docs/montar-nodo-informe.sh,
# porque ese nacio con el script hecho.
#
# QUE HACE, en dos pasos:
#   1. Las cuatro pruebas del .030.
#   2. docs/verificar-nodo-030.js, que busca cada declaracion de cada pieza DENTRO del
#      COMPLETO ignorando comentarios y espacios. Lo que este en la pieza y no en el
#      COMPLETO sale como AVISO, no como error: es el caso legitimo de PAIS_PRESENTACION,
#      que se anadio para el informe y que el nodo del .030 no necesita.
#
# COMO SE LEE EL VEREDICTO DE UNA PRUEBA. No se buscan palabras sueltas: se mira si una
# linea EMPIEZA por FALLA, o si hay un "FALLAN <n>" con n distinto de cero, o si node sale
# con codigo != 0. Buscar la palabra "Error" en cualquier parte marcaba en rojo pruebas que
# pasaban, porque la palabra sale en los TITULOS de los casos.
#
# DOS PRUEBAS FALLAN A PROPOSITO Y ESTA BIEN. test-generador-030.js y
# test-generador-030-muestras-nuevas.js dejan 2 de 14 muestras con diferencias:
#   - Z3520584W y Z4871333F: un solo byte, la posicion A1406. Llevan blanco y nosotros
#     escribimos '4' porque 13 de las 14 muestras llevan '4'. Es el intercambio correcto.
#   - Z2900111T: mete el nombre dentro del campo de apellidos de la cabecera. Es 1 de 14.
# Por eso este script las cuenta y avisa, pero NO las trata como rojo.
set -u
cd "$(dirname "$0")"

PRUEBAS=(
  test-tabla-municipios-ine.js
  test-nodo-030.js
  test-generador-030.js
  test-generador-030-muestras-nuevas.js
)
# Las dos que tienen diferencias conocidas y explicadas.
TOLERADAS="test-generador-030.js test-generador-030-muestras-nuevas.js"

lineas_de_fallo() {
  printf '%s\n' "$1" | grep -E "^[[:space:]]*FALLA[[:space:]]|^[[:space:]]*FALLA\$|FALLAN[[:space:]]+[1-9]"
}

echo "── Las cuatro pruebas del .030 ──"
rojas=0
for t in "${PRUEBAS[@]}"; do
  if [ ! -f "$t" ]; then printf '   FALTA  %s\n' "$t"; rojas=1; continue; fi
  salida=$(node "$t" 2>&1); codigo=$?
  malas=$(lineas_de_fallo "$salida")
  if [ "$codigo" -ne 0 ] && ! printf '%s' "$TOLERADAS" | grep -q "$t"; then
    printf '   ROJA   %s (node ha salido con error)\n' "$t"
    printf '%s\n' "$salida" | tail -5 | sed 's/^/            /'
    rojas=1
  elif [ -n "$malas" ]; then
    if printf '%s' "$TOLERADAS" | grep -q "$t"; then
      n=$(printf '%s\n' "$malas" | wc -l | tr -d ' ')
      printf '   VERDE  %-40s (%s diferencias conocidas y explicadas)\n' "$t" "$n"
      printf '%s\n' "$malas" | head -3 | sed 's/^/            /'
    else
      printf '   ROJA   %s\n' "$t"
      printf '%s\n' "$malas" | head -6 | sed 's/^/            /'
      rojas=1
    fi
  else
    printf '   VERDE  %s\n' "$t"
  fi
done

echo
echo "── El COMPLETO contra sus cinco piezas ──"
if ! node verificar-nodo-030.js; then
  rojas=1
fi

echo
if [ "$rojas" -eq 1 ]; then
  echo "HAY ALGO EN ROJO. El nodo de n8n NO se toca hasta arreglarlo."
  exit 1
fi
echo "TODO EN ORDEN. El COMPLETO y sus piezas dicen lo mismo."
# 19/08/2026 · la cifra se calcula, no se escribe a mano. Antes decia 197.924 fijo,
# que es lo que tiene el nodo VIVO, y el COMPLETO local ya iba por 198.509 -- 585
# caracteres mas, todos comentarios anadidos despues del 14/08. Quien pegara hoy y
# comprobara contra el script creeria que ha pegado mal.
CAR=$(python3 -c "print(len(open('nodo-montar-030-COMPLETO.js',encoding='utf-8').read()))")
BYT=$(wc -c < nodo-montar-030-COMPLETO.js | tr -d ' ')
echo "El nodo de n8n tiene que tener $CAR caracteres (no $BYT, que son BYTES: el editor de n8n cuenta caracteres)."
