# -*- coding: utf-8 -*-
# informe-datos: version del 19/08. Cambios de la peticion del usuario:
#   - el PDF solo lleva NOMBRE, APELLIDO y FECHA DE ALTA en la cabecera
#   - fuera FechaLlamada, que ya no se pregunta ni se guarda
# Cada cambio con assert de coincidencia unica.
import sys
ORIGEN='informe-datos-2026-08-14.js'; DESTINO='informe-datos-2026-08-19.js'
s=open(ORIGEN,encoding='utf-8').read(); ini=len(s); cambios=[]
def sust(e,v,n):
    global s
    c=s.count(v)
    if c!=1: print(f'ABORTA · {e}: aparece {c} veces'); sys.exit(1)
    s=s.replace(v,n); cambios.append((e,len(n)-len(v)))

# 1 · COL: entra fechaAlta, sale fechaLlamada.
sust('COL · fechaAlta entra, fechaLlamada sale',
"""  idioma: 'Idioma',                                     // §8.2
  fechaLlamada: 'FechaLlamada'                          // §8.5, columna nueva, sin espacio
};""",
"""  idioma: 'Idioma',                                     // §8.2
  // 19/08/2026 · LA CABECERA PASA A SER NOMBRE + APELLIDO + FECHA DE ALTA.
  // fechaAlta sale de `fecha_alta_ss`, que es la que declara el cliente y el
  // validador normaliza, NO de `FechaAlta`: esa es aiText extraida del documento
  // y esta en state:'error' en las cuatro filas de la tabla.
  fechaAlta: 'fecha_alta_ss'
};

// 19/08/2026 · FUERA `fechaLlamada`. La pregunta se quito del prompt, el parametro
// salio de la tool y el validador ya no escribe la columna, asi que leerla aqui
// solo podia devolver 'Por confirmar' para siempre. La columna se queda huerfana
// en Airtable a proposito: borrarla se lleva el dato de las filas que ya lo tienen.""")

# 2 · El literal de pendiente pasa a servir a la fecha de alta.
sust('literal de pendiente, ahora para la fecha de alta',
"const FECHA_LLAMADA_PENDIENTE = { es: 'Por confirmar', en: 'To be confirmed' };",
"const FECHA_PENDIENTE = { es: 'Por confirmar', en: 'To be confirmed' };")

# 3 · presentarFechaLlamada -> presentarFechaAlta. MISMA REGLA: no aborta nunca.
sust('presentarFechaLlamada -> presentarFechaAlta',
"""function presentarFechaLlamada(valor, idioma) {
  // Una columna de fecha no deberia venir en error nunca, pero si viniera,
  // partirFecha le haria textoCelda al objeto y saldria '' de todas formas. Se
  // comprueba explicito para que se lea la intencion.
  if (esCeldaEnError(valor)) return FECHA_LLAMADA_PENDIENTE[idioma];
  const partes = partirFecha(valor);
  if (!partes) return FECHA_LLAMADA_PENDIENTE[idioma];
  return formatearFecha(partes);
}""",
"""// 19/08/2026 · Era presentarFechaLlamada y ahora es la FECHA DE ALTA en la
// Seguridad Social. Se conserva la regla del §8.5 tal cual, que es la que importa:
// NUNCA ABORTA. Una memoria fiscal no se tira por una fecha administrativa; si
// falta o viene rara, se imprime 'Por confirmar' y el informe sale igual.
function presentarFechaAlta(valor, idioma) {
  // Una columna de fecha no deberia venir en error nunca, pero si viniera,
  // partirFecha le haria textoCelda al objeto y saldria '' de todas formas. Se
  // comprueba explicito para que se lea la intencion.
  if (esCeldaEnError(valor)) return FECHA_PENDIENTE[idioma];
  const partes = partirFecha(valor);
  if (!partes) return FECHA_PENDIENTE[idioma];
  return formatearFecha(partes);
}""")

# 4 · nombre y apellidos por separado, ademas del completo.
sust('nombre y apellidos por separado',
"""  const nombreCompleto = recapitalizarNombre(
    (textoCelda(fila[COL.nombre]) + ' ' + textoCelda(fila[COL.apellidos])).trim()
  );
  if (!nombreCompleto) {
    return { ok: false, error: 'No se genera el informe: falta el nombre del cliente.' };
  }""",
"""  const nombreCompleto = recapitalizarNombre(
    (textoCelda(fila[COL.nombre]) + ' ' + textoCelda(fila[COL.apellidos])).trim()
  );
  if (!nombreCompleto) {
    return { ok: false, error: 'No se genera el informe: falta el nombre del cliente.' };
  }
  // 19/08/2026 · La cabecera nueva los imprime en DOS lineas, asi que hacen falta
  // por separado. `nombreCompleto` SE QUEDA: de el salen el nombre del fichero y
  // el titulo del /Info del PDF, en el glue. La guarda sigue siendo la de arriba,
  // sobre el completo: con un solo apellido el informe se monta igual.
  const soloNombre = recapitalizarNombre(textoCelda(fila[COL.nombre]));
  const soloApellidos = recapitalizarNombre(textoCelda(fila[COL.apellidos]));""")

# 5 · Los marcadores: entran nombre, apellidos y fechaAlta; sale fechaLlamada.
sust('marcadores de la cabecera nueva',
"""      nombreCompleto: nombreCompleto,
      paisOrigen: presentarPais(fila[COL.nacionalidad], idioma),
      // Las dos fechas van en DD/MM/AAAA en LOS DOS idiomas (§8.2): el cliente
      // vive en Espana. Nada de MM/DD/AAAA en el informe ingles.
      fechaDesplazamiento: formatearFecha(partes),
      fechaLlamada: presentarFechaLlamada(fila[COL.fechaLlamada], idioma),""",
"""      nombreCompleto: nombreCompleto,
      // 19/08/2026 · los tres de la cabecera nueva.
      nombre: soloNombre,
      apellidos: soloApellidos,
      fechaAlta: presentarFechaAlta(fila[COL.fechaAlta], idioma),
      paisOrigen: presentarPais(fila[COL.nacionalidad], idioma),
      // Las fechas van en DD/MM/AAAA en LOS DOS idiomas (§8.2): el cliente vive en
      // Espana. Nada de MM/DD/AAAA en el informe ingles.
      // fechaDesplazamiento YA NO SE IMPRIME, pero se queda: de el salen el anio de
      // la tabla y el de los bloques, y su ausencia sigue abortando.
      fechaDesplazamiento: formatearFecha(partes),""")

open(DESTINO,'w',encoding='utf-8').write(s)
print(f'{ORIGEN} -> {DESTINO}')
print(f'{ini} -> {len(s)} caracteres ({len(s)-ini:+d})')
for e,d in cambios: print(f'   {d:+6d}  {e}')
