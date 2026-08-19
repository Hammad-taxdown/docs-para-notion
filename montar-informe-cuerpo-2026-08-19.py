# -*- coding: utf-8 -*-
# informe-cuerpo: version del 19/08. La CABECERA pasa a ser NOMBRE + APELLIDOS +
# FECHA DE ALTA, y se va la seccion «Notas e informacion proporcionada» entera.
# Los bloques fiscales y la tabla resumen SE QUEDAN.
import sys
ORIGEN='informe-cuerpo-2026-08-14.js'; DESTINO='informe-cuerpo-2026-08-19.js'
s=open(ORIGEN,encoding='utf-8').read(); ini=len(s); cambios=[]
def sust(e,v,n):
    global s
    c=s.count(v)
    if c!=1: print(f'ABORTA · {e}: aparece {c} veces'); sys.exit(1)
    s=s.replace(v,n); cambios.append((e,len(n)-len(v)))

# 1 · Etiquetas nuevas en la bolsa ESPAÑOLA. Las viejas se quedan sin borrar: son
#     cadenas inertes y borrarlas solo añade riesgo de romper una prueba por nada.
sust('etiquetas es',
"  campoNombre: 'Nombre',\n  campoPaisOrigen: 'País de origen',",
"  campoNombre: 'Nombre',\n"
"  // 19/08/2026 · las dos de la cabecera nueva.\n"
"  campoApellidos: 'Apellidos',\n"
"  campoFechaAlta: 'Fecha de alta en la Seguridad Social',\n"
"  campoPaisOrigen: 'País de origen',")

# 2 · Etiquetas nuevas en la bolsa INGLESA (§8.2).
sust('etiquetas en',
"  campoNombre: 'Name',\n  campoPaisOrigen: 'Country of origin',",
"  campoNombre: 'Name',\n"
"  // 19/08/2026 · las dos de la cabecera nueva.\n"
"  campoApellidos: 'Surname',\n"
"  campoFechaAlta: 'Social Security registration date',\n"
"  campoPaisOrigen: 'Country of origin',")

# 3 · LA CABECERA. Tres campos, y fuera la seccion de Notas entera.
sust('cabecera nueva y fuera las Notas',
"""  return [
    { tipo: 'campo', etiqueta: t.campoNombre, valor: marcador(datos, 'nombreCompleto') },
    { tipo: 'campo', etiqueta: t.campoPaisOrigen, valor: marcador(datos, 'paisOrigen') },
    { tipo: 'campo', etiqueta: t.campoFechaDesplazamiento, valor: marcador(datos, 'fechaDesplazamiento') },
    // La plantilla la llama "Fecha de la reunion". La columna FechaLlamada existe
    // desde el §8.5; si esta vacia, la pieza 3 manda 'Por confirmar' / 'To be
    // confirmed' y el informe SIGUE saliendo.
    { tipo: 'campo', etiqueta: t.campoFechaReunion, valor: marcador(datos, 'fechaLlamada') },

    { tipo: 'titulo2', texto: t.tituloNotas },
    { tipo: 'parrafo', texto: t.introNotas },

    // Las seis vinetas de la plantilla. El texto fijo (" euros.", los dos puntos)
    // es de la plantilla; lo variable son los marcadores ya formateados y YA EN
    // EL IDIOMA de datos.idioma (§8.2: el cuerpo no traduce datos).
    { tipo: 'lista', items: [
      t.notaEstadoCivil + marcador(datos, 'estadoCivil') + '.',
      t.notaHijos + marcador(datos, 'hijos') + '.',
      t.notaSalario + marcador(datos, 'salarioBrutoAnual') + t.notaSalarioSufijo,
      t.notaResidencia + marcador(datos, 'residenciaFiscal5Anios') + '.',
      t.notaPropiedades + marcador(datos, 'sumaPropiedades') + '.',
      t.notaInversiones + marcador(datos, 'sumaInversiones') + '.'
    ] },
""",
"""  // ── 19/08/2026 · LA CABECERA SE QUEDA EN TRES CAMPOS ──────────────────────────
  // Peticion del usuario: «solo que aparezca nombre apellido y fecha alta, y los
  // bloques estos de la info ya esta». Asi que de la cabecera salen:
  //   - Pais de origen
  //   - Fecha de desplazamiento (el dato SIGUE calculandose: de el salen el anio de
  //     la tabla y el de los bloques, y su ausencia sigue abortando el informe)
  //   - Fecha de la reunion (ya no se pregunta ni se guarda desde el 19/08)
  //   - Y la seccion «Notas e informacion proporcionada» ENTERA: el titulo, la
  //     frase de entrada y las SEIS vinetas (estado civil, hijos, salario,
  //     residencia fiscal, propiedades e inversiones).
  // SE QUEDAN la tabla «Resumen» y los bloques fiscales, que son «la info».
  // Las etiquetas y los marcadores de lo que sale NO se borran: siguen en la bolsa
  // de textos y en `datos`, inertes, para que volver a poner cualquiera de ellos
  // sea una linea y no una arqueologia.
  return [
    { tipo: 'campo', etiqueta: t.campoNombre, valor: marcador(datos, 'nombre') },
    { tipo: 'campo', etiqueta: t.campoApellidos, valor: marcador(datos, 'apellidos') },
    // No aborta nunca: si falta o viene rara, la pieza 3 manda 'Por confirmar' /
    // 'To be confirmed' y el informe sale igual. Es la regla del §8.5, conservada.
    { tipo: 'campo', etiqueta: t.campoFechaAlta, valor: marcador(datos, 'fechaAlta') },
""")

open(DESTINO,'w',encoding='utf-8').write(s)
print(f'{ORIGEN} -> {DESTINO}')
print(f'{ini} -> {len(s)} caracteres ({len(s)-ini:+d})')
for e,d in cambios: print(f'   {d:+6d}  {e}')
