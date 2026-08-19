#!/bin/bash
# Regenera docs/nodo-montar-informe-COMPLETO.js a partir de sus cinco piezas.
#
# POR QUE EXISTE ESTE SCRIPT: el equivalente del .030 (montar-nodo-030.sh) decia que
# concatenaba y NO CONCATENABA NADA, solo lanzaba dos pruebas. Los arreglos del 14/08
# hubo que aplicarlos A MANO en los dos ficheros, con el riesgo de que se separaran.
# Aqui no: una sola fuente de verdad y el COMPLETO se genera.
#
# ORDEN DE CONCATENACION: importa. Cada pieza usa lo anterior.
#   1. logo-taxdown          -> el JPEG del logo en base64. VA PRIMERA
#   2. metrica-helvetica     -> anchos de Helvetica (respaldo)
#   3. metrica-times         -> anchos de Times, que es la fuente que se usa
#   4. pdf-motor             -> usa la metrica y el logo
#   5. tabla-paises-iso2     -> paisPresentacion() y paisPresentacionEn()
#   6. informe-datos         -> usa paisPresentacion()
#   7. informe-cuerpo        -> usa los datos que produce el anterior
#   8. el pegamento del nodo -> lee la fila de Airtable y llama a todo lo demas
#
# GATE: si alguna prueba falla, NO se regenera. Un COMPLETO con una prueba en rojo es
# peor que no tener COMPLETO, porque se pega en produccion creyendo que esta probado.
set -u
cd "$(dirname "$0")"

PIEZAS=(
  logo-taxdown-2026-08-14.js
  metrica-helvetica-2026-08-14.js
  metrica-times-2026-08-14.js
  pdf-motor-2026-08-14.js
  tabla-paises-iso2-2026-08-13.js
  informe-datos-2026-08-19.js
  informe-cuerpo-2026-08-19.js
  nodo-informe-glue-2026-08-14.js
)
PRUEBAS=(
  test-metrica-helvetica.js
  test-metrica-helvetica-cotejo-sistema.js
  # La metrica de Times (§9.1) ya esta escrita y probada, pero metrica-times NO
  # esta todavia en PIEZAS: hasta que el motor cambie sus dos constantes de fuente
  # seria codigo muerto dentro del nodo. Sus pruebas SI entran en el gate desde
  # ahora, porque una prueba que no esta en el gate se pudre sin que nadie lo note.
  test-metrica-times.js
  test-metrica-times-cotejo-sistema.js
  test-pdf-motor.js
  test-paises-presentacion.js
  test-informe-datos.js
  test-informe-cuerpo.js
)
# Esta va DESPUES de concatenar, porque necesita el COMPLETO para existir.
# Es la unica que ve las seis piezas juntas.
PRUEBA_FINAL=test-informe-integracion.js
SALIDA=nodo-montar-informe-COMPLETO.js
# El temporal TIENE que acabar en .js: node --check rechaza cualquier otra extension.
TMP=.montar-informe-en-curso.js

echo "── Comprobando que estan las ocho piezas ──"
faltan=0
for p in "${PIEZAS[@]}"; do
  if [ -f "$p" ]; then printf '   OK    %s\n' "$p"
  else printf '   FALTA %s\n' "$p"; faltan=1; fi
done
[ "$faltan" -eq 1 ] && { echo "FALTAN PIEZAS: no se regenera."; exit 1; }

# COMO SE DECIDE SI UNA PRUEBA ESTA EN ROJO. La primera version de esta funcion
# buscaba "FALLA|FAIL|Error:" en cualquier parte de la salida, y marco en rojo una
# prueba que pasaba 223 de 223: la palabra "ERROR:" aparecia en un TITULO de la
# propia prueba ("FORMULA EN ERROR: VIENE COMO OBJETO"). O sea, la guarda fallaba
# por su expectativa, no por el dato — el mismo patron que ya ha pasado cuatro
# veces esta semana. Ahora se mira el VEREDICTO, no palabras sueltas:
#   - node sale con codigo != 0
#   - una linea EMPIEZA por FALLA (asi imprimen los fallos todas las pruebas)
#   - aparece "FALLAN <n>" con n distinto de cero
lineas_de_fallo() {
  printf '%s\n' "$1" | grep -E "^[[:space:]]*FALLA[[:space:]]|^[[:space:]]*FALLA$|FALLAN[[:space:]]+[1-9]"
}

echo
echo "── Pasando las pruebas antes de tocar el COMPLETO ──"
rojas=0
for t in "${PRUEBAS[@]}"; do
  if [ ! -f "$t" ]; then printf '   FALTA  %s\n' "$t"; rojas=1; continue; fi
  if ! salida=$(node "$t" 2>&1); then
    printf '   ROJA   %s (node ha salido con error)\n' "$t"
    printf '%s\n' "$salida" | tail -6 | sed 's/^/            /'
    rojas=1
    continue
  fi
  malas=$(lineas_de_fallo "$salida")
  if [ -n "$malas" ]; then
    printf '   ROJA   %s\n' "$t"
    printf '%s\n' "$malas" | head -6 | sed 's/^/            /'
    rojas=1
  else
    printf '   VERDE  %s\n' "$t"
  fi
done
[ "$rojas" -eq 1 ] && { echo; echo "PRUEBAS EN ROJO O QUE FALTAN: NO se regenera $SALIDA."; exit 1; }

echo
echo "── Concatenando ──"
{
  echo "// ============================================================================"
  echo "// NODO 'Montar el informe' de beckham_informe_mobility · GENERADO, NO SE EDITA"
  echo "// ============================================================================"
  echo "// Generado por docs/montar-nodo-informe.sh a partir de las seis piezas."
  echo "// SI HAY QUE CAMBIAR ALGO, se toca la pieza y se vuelve a lanzar el script."
  echo "// Editar este fichero a mano hace que las piezas y el nodo se separen en silencio,"
  echo "// que es exactamente lo que paso con el nodo del .030 el 14/08."
  echo "//"
  echo "// Contrato de montaje: docs/contrato-informe-mobility-2026-08-14.md"
  echo "// Los 17 marcadores:   docs/spec-informe-mobility-2026-08-13.md"
  echo "// Texto de plantilla:  docs/plantilla-informe-mobility-texto-2026-08-14.md"
  echo "// ============================================================================"
  echo
  for p in "${PIEZAS[@]}"; do
    echo
    echo "// ==================== $p ===================="
    # Fuera el bloque `if (typeof module !== 'undefined') { module.exports = {...} }`
    # ENTERO: en n8n no existe `module` y el nodo reventaria. Y fuera los require:
    # las piezas se ven entre si porque van en el mismo ambito.
    #
    # ESTO NO SE PUEDE HACER CON grep -v LINEA A LINEA, y la primera version de este
    # script lo intento: los export ocupan VARIAS lineas, asi que borrar la linea del
    # `module.exports` dejaba sueltos el listado de nombres y las llaves de cierre, y
    # lo concatenado no compilaba ("Unexpected token '}'"). Hay que contar llaves.
    python3 -c '
import sys, re
lineas = open(sys.argv[1], encoding="utf-8").read().split("\n")
fuera, i = [], 0
while i < len(lineas):
    l = lineas[i]
    if re.match(r"^\s*if \(typeof module\b", l):
        # se salta el bloque entero, contando llaves desde esta linea
        prof = 0
        while i < len(lineas):
            prof += lineas[i].count("{") - lineas[i].count("}")
            i += 1
            if prof <= 0:
                break
        continue
    if re.match(r"^\s*(const|let|var)\s+.*=\s*require\(", l) or re.match(r"^\s*//\s*eslint", l):
        i += 1
        continue
    fuera.append(l)
    i += 1
sys.stdout.write("\n".join(fuera).rstrip("\n") + "\n")
' "$p"
  done
} > "$TMP"

# Comprobacion final: que lo generado es JavaScript valido y no lleva rastros de node.
if ! node --check "$TMP" 2>/dev/null; then
  echo "   LO GENERADO NO COMPILA. No se sustituye $SALIDA."
  node --check "$TMP" 2>&1 | head -5 | sed 's/^/      /'
  rm -f "$TMP"
  exit 1
fi
# Nada de node dentro del nodo. LA COMPROBACION VA SOBRE EL CODIGO, NO SOBRE LOS
# COMENTARIOS: la primera version usaba `grep` a pelo y salto en las lineas que
# EXPLICAN por que no puede haber `module.exports`. Es el mismo error que ya hizo
# fallar el gate de las pruebas: buscar palabras en vez de mirar lo que importa.
if ! python3 -c '
import sys, re
mal = []
for n, l in enumerate(open(sys.argv[1], encoding="utf-8"), 1):
    codigo = re.sub(r"//.*$", "", l)          # fuera el comentario de linea
    for p in ("require(", "module.exports", "process.exit", "readFileSync", "import "):
        if p in codigo:
            mal.append((n, p, l.strip()[:90]))
if mal:
    for n, p, l in mal[:6]:
        print("      linea %d lleva %r: %s" % (n, p, l))
    sys.exit(1)
' "$TMP"; then
  echo "   LO GENERADO LLEVA COSAS DE NODE QUE EN EL NODO DE n8n NO EXISTEN (arriba, en codigo)."
  rm -f "$TMP"
  exit 1
fi

# Se guarda el anterior por si la prueba de integracion sale roja: entonces se
# vuelve atras. Un COMPLETO nuevo y roto es peor que el viejo que funcionaba.
[ -f "$SALIDA" ] && cp "$SALIDA" "$SALIDA.anterior"
mv "$TMP" "$SALIDA"
CAR=$(wc -c < "$SALIDA" | tr -d ' ')
echo "   $SALIDA regenerado: $CAR bytes"

echo
echo "── Prueba de integracion, la que ve las seis piezas juntas ──"
if [ -f "$PRUEBA_FINAL" ]; then
  salida=$(node "$PRUEBA_FINAL" 2>&1); codigo=$?
  malas=$(lineas_de_fallo "$salida")
  if [ "$codigo" -eq 0 ] && [ -z "$malas" ]; then
    printf '   VERDE  %s\n' "$PRUEBA_FINAL"
    printf '%s\n' "$salida" | tail -3 | sed 's/^/            /'
    rm -f "$SALIDA.anterior"
  else
    printf '   ROJA   %s\n' "$PRUEBA_FINAL"
    printf '%s\n' "${malas:-$salida}" | head -8 | sed 's/^/            /'
    if [ -f "$SALIDA.anterior" ]; then
      # 19/08/2026 · El candidato que ha fallado SE GUARDA antes de revertir. Hasta
      # hoy el mv lo machacaba y no habia forma de mirar QUE se habia montado mal:
      # solo se podia volver a montarlo a ciegas. La puerta sigue haciendo lo mismo
      # -- el nodo bueno vuelve a su sitio -- pero deja la evidencia al lado.
      cp "$SALIDA" "$SALIDA.rechazado"
      mv "$SALIDA.anterior" "$SALIDA"
      echo "   SE HA VUELTO ATRAS: $SALIDA es otra vez el de antes."
      echo "   El candidato rechazado queda en $SALIDA.rechazado para poder mirarlo."
    else
      rm -f "$SALIDA"
      echo "   BORRADO $SALIDA: no habia version anterior a la que volver."
    fi
    exit 1
  fi
else
  echo "   FALTA $PRUEBA_FINAL — el COMPLETO queda SIN probar de punta a punta."
fi

echo
echo "── Lo que va pegado en el nodo 'Montar el informe' ──"
echo "   El fichero ENTERO."
# OJO CON LA UNIDAD, que ya provoco un susto el 14/08. `wc -c` cuenta BYTES y el
# editor de n8n cuenta CARACTERES. Este fichero lleva ~1.500 caracteres acentuados
# y en UTF-8 cada uno ocupa DOS bytes, asi que los dos numeros se separan casi
# 3.000. Dar el numero en bytes hace creer que el pegado se ha quedado corto y que
# hay que repegar 190 KB para nada. Se da EN CARACTERES, que es lo que se compara.
CARACT=$(node -e 'const c=require("fs").readFileSync(process.argv[1],"utf8");console.log(c.length)' "$SALIDA")
echo "   COMPROBACION: el nodo tiene que tener $CARACT CARACTERES (no bytes)."
echo "   Para verlo: en el editor del nodo, Cmd+A y mira el contador de seleccion."
echo "   ($CAR bytes en disco: la diferencia de $((CAR - CARACT)) son los acentos,"
echo "    que en UTF-8 ocupan dos bytes. NO falta nada.)"
