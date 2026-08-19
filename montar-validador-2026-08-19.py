# -*- coding: utf-8 -*-
# Monta el nodo «Validar y Normalizar» del 19/08 a partir del vivo.
# Cinco cambios, cada uno con assert de coincidencia unica.
import sys

ORIGEN  = 'BACKUP-validar-y-normalizar-antes-del-19-08.js'
DESTINO = 'nodo-validar-y-normalizar-2026-08-19.js'
s = open(ORIGEN, encoding='utf-8').read()
inicial = len(s)
cambios = []

def sust(etq, viejo, nuevo):
    global s
    n = s.count(viejo)
    if n != 1:
        print(f'ABORTA · {etq}: el texto de partida aparece {n} veces'); sys.exit(1)
    s = s.replace(viejo, nuevo); cambios.append((etq, len(nuevo)-len(viejo)))

# ── 1 · LOS 501 GENTILICIOS NUEVOS ──────────────────────────────────────────
tanda2 = open('gentilicios-tanda-2-2026-08-19.txt', encoding='utf-8').read().rstrip('\n')
sust('gentilicios · tanda 2',
     "const GENTILICIOS = {",
     "const GENTILICIOS = {\n" + tanda2 + "\n  // ── fin de la tanda del 19/08 ─────────────────────────────────────────────")

# ── 2 · EL 1 DE JULIO YA NO ES SEÑAL DE COMPLEJIDAD ─────────────────────────
# Sale del ENRUTADO. La logica fiscal del 1 de julio NO se toca: fechaEfectos()
# del .030 y las formulas de Airtable siguen igual.
sust('senal · fuera la llegada posterior al 1 de julio',
"""  ['Llegada posterior al 1 de julio',
   [/posterior/, /despues del 1/, /1 de julio/, /segundo semestre/, /no residente el primer/]],
""",
"""  // 19/08/2026 · FUERA 'Llegada posterior al 1 de julio', por decision del usuario:
  // llegar despues del 1 de julio ya NO enruta a llamada. Sigue siendo un dato del
  // expediente (y el .030 sigue calculando la fecha de efectos con ese corte), pero
  // no es una senal de complejidad. Si el agente la manda de todas formas, cae en
  // 'descartados' con su texto y NO crea una opcion nueva en la columna.
""")

# ── 3 · EL UMBRAL DE LA SEÑAL DE SALARIO: 55.000 -> 50.000 ──────────────────
sust('senal · umbral del salario a 50.000',
"""  ['Salario por debajo de 55.000',
   [/debajo/, /menos de 55/, /inferior a 55/, /55 000/, /55000/]]""",
"""  // 19/08/2026 · el umbral pasa a 50.000. OJO: este literal tiene que existir
  // TAL CUAL como opcion de la columna SenalesComplejidad de Airtable. Con
  // typecast:true, si no existe NO FALLA: crea una opcion nueva. Hay que renombrar
  // la opcion en Airtable ANTES de pegar esto. Se dejan los patrones de 55 porque
  // el agente puede seguir diciendo la cifra vieja durante un rato.
  ['Salario por debajo de 50.000',
   [/debajo/, /menos de 50/, /inferior a 50/, /50 000/, /50000/,
    /menos de 55/, /inferior a 55/, /55 000/, /55000/]]""")

# ── 4 · ESTADO CIVIL A TRES OPCIONES ────────────────────────────────────────
sust('estado civil · tres opciones',
"""ponerSelect('estadoCivil', body.estado_civil, [
  ['soltero',         ['soltero', 'soltera', 'single']],
  ['casado',          ['casado', 'casada', 'married']],
  ['pareja de hecho', ['pareja de hecho', 'pareja', 'union de hecho', 'unión de hecho', 'domestic partner', 'civil partnership']],
  ['divorciado',      ['divorciado', 'divorciada', 'divorced']],
  ['viudo',           ['viudo', 'viuda', 'widowed']]
], { rechazarSiNiega: true });""",
"""// 19/08/2026 · TRES OPCIONES, no cinco. Para Hacienda solo cuenta si esta o no en
// pareja, asi que 'pareja de hecho' se PLIEGA sobre casado y 'viudo' sobre soltero.
// Las dos opciones viejas siguen existiendo en la columna de Airtable y en las filas
// que ya las tuvieran: no se borran, simplemente el bot deja de escribirlas.
// El orden importa: 'pareja de hecho' va ANTES que casado y que soltero para que la
// frase entera se cace aqui y no por la palabra suelta.
ponerSelect('estadoCivil', body.estado_civil, [
  ['casado',     ['pareja de hecho', 'union de hecho', 'unión de hecho', 'domestic partner',
                  'civil partnership', 'registered partnership',
                  'casado', 'casada', 'married', 'pareja']],
  ['soltero',    ['soltero', 'soltera', 'single', 'viudo', 'viuda', 'widowed', 'widow', 'widower']],
  ['divorciado', ['divorciado', 'divorciada', 'divorced', 'separado', 'separada', 'separated']]
], { rechazarSiNiega: true });""")

# ── 5 · FUERA FechaLlamada ──────────────────────────────────────────────────
sust('fuera FechaLlamada',
"ponerFecha('FechaLlamada', body.fecha_llamada);\n",
"""// 19/08/2026 · FUERA FechaLlamada. Ya no se pregunta: cuando el cliente reserva en
// Calendly le llega la cita con su fecha, asi que preguntarla no aportaba nada.
// La columna de Airtable se queda huerfana a proposito (borrarla se lleva los datos
// de las filas que ya la tienen) y el parametro fecha_llamada sale de la tool.
""")

open(DESTINO, 'w', encoding='utf-8').write(s)
print(f'{ORIGEN} -> {DESTINO}')
print(f'{inicial} -> {len(s)} caracteres ({len(s)-inicial:+d})  ·  {len(s.splitlines())} lineas')
for e, d in cambios: print(f'   {d:+7d}  {e}')
