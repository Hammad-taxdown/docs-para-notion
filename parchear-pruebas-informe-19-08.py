# -*- coding: utf-8 -*-
# Las tres pruebas del informe codificaban el documento VIEJO. Se actualizan a la
# cabecera nueva. Se corrige la PRUEBA, no el codigo: cada assert nuevo comprueba
# lo mismo que el viejo pero sobre el documento que existe ahora.
import sys
def parche(f, subs):
    s = open(f, encoding='utf-8').read()
    for etq, v, n in subs:
        c = s.count(v)
        if c != 1:
            print(f'ABORTA · {f} · {etq}: aparece {c} veces'); sys.exit(1)
        s = s.replace(v, n); print(f'  ok  {f} · {etq}')
    open(f, 'w', encoding='utf-8').write(s)

# ── test-informe-datos ──────────────────────────────────────────────────────
parche('test-informe-datos.js', [
 ('fechaLlamada -> fechaAlta, y nombre/apellidos por separado',
  "  igual('   fechaLlamada (no hay columna)', real.fechaLlamada, 'Por confirmar');",
  "  // 19/08/2026 · la cabecera es nombre + apellidos + fecha de alta. FILA_REAL no\n"
  "  // lleva fecha_alta_ss, asi que tiene que salir el literal de pendiente y NO abortar.\n"
  "  igual('   fechaAlta (FILA_REAL no lleva fecha_alta_ss)', real.fechaAlta, 'Por confirmar');\n"
  "  igual('   nombre suelto, recapitalizado', real.nombre, 'Hammad');\n"
  "  igual('   apellidos sueltos, recapitalizados', real.apellidos, 'Bellachhab');\n"
  "  igual('   fechaLlamada YA NO existe como marcador', real.fechaLlamada, undefined);"),
 ('el nombre ya va en dos lineas, no en una',
  "  comprobar('   y el nombre recapitalizado esta dentro', todo.indexOf('Hammad Bellachhab') !== -1);",
  "  // 19/08/2026 · nombre y apellidos van en DOS campos distintos de la cabecera, asi\n"
  "  // que ya no aparecen pegados en el texto plano. Se comprueban por separado.\n"
  "  comprobar('   y el nombre y los apellidos estan dentro, cada uno en su campo',\n"
  "    todo.indexOf('Hammad') !== -1 && todo.indexOf('Bellachhab') !== -1);"),
])

# ── test-informe-cuerpo ─────────────────────────────────────────────────────
parche('test-informe-cuerpo.js', [
 ('el fixture necesita los tres marcadores nuevos',
  "    nombreCompleto: 'Hammad Bellachhab',\n    paisOrigen: 'Marruecos',",
  "    nombreCompleto: 'Hammad Bellachhab',\n"
  "    // 19/08/2026 · los tres de la cabecera nueva. Los de abajo se quedan aunque ya\n"
  "    // no se impriman: el dia que se vuelva a poner uno, el fixture ya lo tiene.\n"
  "    nombre: 'Hammad',\n"
  "    apellidos: 'Bellachhab',\n"
  "    fechaAlta: 'Por confirmar',\n"
  "    paisOrigen: 'Marruecos',"),
 ('la cabecera son 3 campos, no 4',
  """comprobar('los 4 campos de la cabecera, en orden y con sus etiquetas',
  campos.length === 4 &&
  campos[0].etiqueta === 'Nombre' &&
  campos[1].etiqueta === 'País de origen' &&
  campos[2].etiqueta === 'Fecha de desplazamiento' &&
  campos[3].etiqueta === 'Fecha de la reunión' &&
  campos[3].valor === 'Por confirmar');""",
  """// 19/08/2026 · La cabecera pasa de CUATRO campos a TRES: nombre, apellidos y
// fecha de alta. Salen pais de origen, fecha de desplazamiento y fecha de la
// reunion. Se comprueba el numero EXACTO, para que anadir un campo sin querer
// tambien rompa la prueba.
comprobar('los 3 campos de la cabecera, en orden y con sus etiquetas',
  campos.length === 3 &&
  campos[0].etiqueta === 'Nombre' && campos[0].valor === 'Hammad' &&
  campos[1].etiqueta === 'Apellidos' && campos[1].valor === 'Bellachhab' &&
  campos[2].etiqueta === 'Fecha de alta en la Seguridad Social' &&
  campos[2].valor === 'Por confirmar',
  JSON.stringify(campos.map(function (c) { return c.etiqueta + '=' + c.valor; })));

comprobar('ya NO hay campo de pais de origen, de desplazamiento ni de reunion',
  campos.every(function (c) {
    return ['País de origen', 'Fecha de desplazamiento', 'Fecha de la reunión'].indexOf(c.etiqueta) === -1;
  }));"""),
 ('la seccion de Notas ya no existe',
  """const listaNotas = cabAC.filter(function (el) { return el.tipo === 'lista'; })[0];
comprobar('la lista de notas tiene los 6 items de la plantilla, con su punto final',
  listaNotas.items.length === 6 &&
  listaNotas.items[2] === 'Salario bruto anual: 345.678 euros.' &&
  listaNotas.items[3] === 'Residencia fiscal en los cinco años anteriores: Sí.' &&
  listaNotas.items.every(function (i) { return /\\.$/.test(i); }),
  JSON.stringify(listaNotas.items, null, 1));""",
  """// 19/08/2026 · La seccion «Notas e informacion proporcionada» SE HA QUITADO
// ENTERA de la cabecera: el titulo, la frase de entrada y las seis vinetas
// (estado civil, hijos, salario, residencia fiscal, propiedades e inversiones).
// Antes esta prueba comprobaba que las seis estaban; ahora comprueba que NO estan,
// que es lo que hay que defender para que no vuelvan por accidente.
const listaNotas = cabAC.filter(function (el) { return el.tipo === 'lista'; })[0];
comprobar('la cabecera ya NO lleva la lista de las 6 notas', listaNotas === undefined,
  listaNotas ? JSON.stringify(listaNotas.items) : 'ninguna lista en la cabecera');

const textoCab = cabAC.map(function (el) {
  return [el.texto, el.valor, el.etiqueta, el.titulo].filter(Boolean).join(' ');
}).join('\\n');
comprobar('ni el titulo de Notas ni ninguna de las seis etiquetas',
  ['Notas e información proporcionada', 'Según la información', 'Estado civil:',
   'Hijos:', 'Salario bruto anual:', 'Residencia fiscal en los cinco',
   'Propiedades:', 'Inversiones:'].every(function (w) { return textoCab.indexOf(w) === -1; }),
  textoCab.slice(0, 300));

comprobar('pero la tabla «Resumen» SIGUE en la cabecera (es «la info»)',
  cabAC.filter(function (el) { return el.tipo === 'tabla'; }).length === 1);"""),
])

# ── test-informe-integracion ────────────────────────────────────────────────
parche('test-informe-integracion.js', [
 ('el literal de pendiente ahora viene de la fecha de alta',
  """  comprobar('sin FechaLlamada, en ingles, "To be confirmed"', tEn.includes('To be confirmed'));""",
  """  // 19/08/2026 · «To be confirmed» ya no sale de FechaLlamada (que no existe) sino
  // de la FECHA DE ALTA cuando la fila no la trae. Y se comprueba tambien que la
  // etiqueta inglesa de la cabecera nueva esta traducida.
  comprobar('la etiqueta inglesa de la fecha de alta', tEn.includes('Social Security registration date'));
  comprobar('el apellido en ingles lleva su etiqueta', tEn.includes('Surname'));"""),
 ('los testigos que ya no existen se cambian por otros que si',
  """  const testigos = ['Según la información', 'residente fiscal en España', 'tributan únicamente',
                    'Rendimientos del trabajo', 'Estado civil', 'País de origen',
                    'Fecha de desplazamiento', 'Propiedades:', 'Inversiones:'];""",
  """  // 19/08/2026 · Se caen seis testigos porque su contenido YA NO EXISTE en ninguno
  // de los dos idiomas (la seccion de Notas, el pais de origen y la fecha de
  // desplazamiento salieron de la cabecera), y un testigo que nunca puede aparecer
  // no prueba nada: pasaria siempre. Se sustituyen por texto espanol que SI sigue
  // en el documento -- la tabla, los bloques y las etiquetas nuevas -- para que la
  // prueba siga cazando de verdad una fuga de espanol dentro del ingles.
  const testigos = ['residente fiscal en España', 'tributan únicamente',
                    'Rendimientos del trabajo', 'Situación en',
                    'Fecha de alta en la Seguridad Social', 'Apellidos',
                    'Declaración y plazo'];"""),
])
print('\nlas tres pruebas parcheadas')
