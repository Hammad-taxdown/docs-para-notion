# -*- coding: utf-8 -*-
"""03/09/2026 · Cuatro parches al nodo `Validar y Normalizar`, por ANCLAS de texto.

Parte del codigo VIVO (el export beckham_bot_conversacional.json, que el 02/09 quedo
byte a byte igual que el nodo en produccion) y escribe el COMPLETO nuevo. Si un ancla
no aparece EXACTAMENTE una vez, ABORTA: nunca deja un COMPLETO montado a medias.

Los cuatro parches, cada uno medido en la conversacion 215475755624195 del 02/09:
  1. VIAS EN CATALAN. 'Carrer', 'Passeig' y 'Avinguda' (y sus abreviaturas) se guardan
     como CALLE, PASEO y AVENIDA, tanto en tipo_via como si vienen delante del nombre
     de la calle ("Carrer de Balmes" -> "Calle de Balmes").
  2. GENTILICIOS CON ERRATA. 'algerino' no estaba (solo 'argelino') y el bot tuvo que
     repreguntar. Se anaden las cuatro formas y, ademas, un fallback por distancia de
     edicion (1 letra en 6-7 letras, 2 en 8+) contra gentilicios y nombres de pais,
     que solo acepta si hay UN candidato claro: un empate devuelve null.
  3. AVISO DE PASAPORTE. El cliente dio un pasaporte al pedirle el NIF/NIE, el nodo lo
     guardo bien en PasaporteNumero y el bot siguio sin pedir el NIE: el .030 no se
     puede generar sin NIF. El nodo ahora devuelve `aviso_pasaporte` en descartados
     para que el prompt pida el NIE UNA vez.
  4. PAREJA DE HECHO -> SOLTERO (decision del usuario del 03/09: ante Hacienda, a estos
     efectos, cuenta como soltero, aunque en Espana tenga otros beneficios). Hasta hoy
     se plegaba sobre casado y disparaba la pregunta del conyuge.

Uso:  python3 docs/montar-validador-2026-09-03.py [origen.js] destino.js
      sin origen, lee el nodo vivo del export del repo publico.
"""
import io, json, sys

if len(sys.argv) == 3:
    code = io.open(sys.argv[1], encoding='utf-8').read(); destino = sys.argv[2]
elif len(sys.argv) == 2:
    wf = json.load(io.open('proyecto-mobility/workflows-n8n/beckham_bot_conversacional.json', encoding='utf-8'))
    code = next(n['parameters']['jsCode'] for n in wf['nodes'] if n['name'] == 'Validar y Normalizar')
    destino = sys.argv[1]
else:
    sys.stderr.write('uso: montar-validador-2026-09-03.py [origen.js] destino.js\n'); sys.exit(2)
original = len(code)

def una(txt, ancla, nuevo, que):
    n = txt.count(ancla)
    if n != 1:
        sys.stderr.write("ABORTA · el ancla de '%s' aparece %d veces, se esperaba 1\n" % (que, n)); sys.exit(1)
    return txt.replace(ancla, nuevo, 1)

# ── 1 · VIAS EN CATALAN ───────────────────────────────────────────────────────
A1 = "'CRA':'CARRETERA','CMNO':'CAMINO','TRV':'TRAVESIA','GTA':'GLORIETA','RBLA':'RAMBLA','URB':'URBANIZACION' };"
B1 = """'CRA':'CARRETERA','CMNO':'CAMINO','TRV':'TRAVESIA','GTA':'GLORIETA','RBLA':'RAMBLA','URB':'URBANIZACION',
// 03/09 · vias en CATALAN: Hacienda recibe la direccion en castellano, asi que 'Carrer',
// 'Passeig' y 'Avinguda' (y sus abreviaturas) se guardan como CALLE, PASEO y AVENIDA.
// 'PASSEIG' sigue en TIPOS_VIA porque es una opcion de Airtable, pero el alias gana
// antes de mirar la lista, asi que ya no se escribe nunca.
'CARRER':'CALLE','CR':'CALLE','PASSEIG':'PASEO','PG':'PASEO','AVINGUDA':'AVENIDA','AVGDA':'AVENIDA',
'AVG':'AVENIDA','PLACA':'PLAZA','PLAÇA':'PLAZA','PÇA':'PLAZA','RONDA':'RONDA','TRAVESSERA':'TRAVESIA' };"""
code = una(code, A1, B1, 'ALIAS_VIA catalan')

A1b = "const dCalle = limpio(body.calle);"
B1b = """// 03/09 · si el nombre de la calle trae la via en catalan delante ("Carrer de Balmes",
// "Passeig de Gracia"), se traduce solo esa primera palabra. El resto va tal cual.
const VIA_CATALANA = { carrer: 'Calle', passeig: 'Paseo', avinguda: 'Avenida', 'plaça': 'Plaza', placa: 'Plaza', travessera: 'Travesia' };
const dCalle = limpio(body.calle).replace(/^(carrer|passeig|avinguda|plaça|placa|travessera)(?=\\s|$)/i,
  function (m) { return VIA_CATALANA[m.toLowerCase()] || m; });"""
code = una(code, A1b, B1b, 'dCalle catalan')

# ── 2 · GENTILICIOS: las formas de 'algerino' y el fallback por distancia ─────
A2 = "  'argelino': 'ARGELIA',\n  'argelina': 'ARGELIA',\n"
B2 = A2 + """  // 03/09 · medido: un cliente escribio 'Algerino' (del frances/ingles) y el bot repregunto
  'algerino': 'ARGELIA',
  'algerina': 'ARGELIA',
  'algeriano': 'ARGELIA',
  'algeriana': 'ARGELIA',
"""
code = una(code, A2, B2, 'gentilicio algerino')

A2b = """function paisValido(s) {
  const k = normSel(s);
  if (!k) return null;"""
B2b = """// 03/09 · ERRATAS DE UNA O DOS LETRAS ('marroqi', 'colmbia', 'algerino' antes de anadirlo).
// Distancia de edicion contra los gentilicios y los nombres de pais. Es el ULTIMO
// recurso de paisValido(): solo entra si nada casa exacto, solo con 6 letras o mas
// (1 errata hasta 7 letras, 2 a partir de 8), y solo si hay UN destino claramente
// mejor. Un empate ('irlandia' esta a 1 de IRLANDA y a 1 de ISLANDIA) devuelve null y
// el agente repregunta: mejor preguntar que guardar el pais equivocado en el .030.
function distanciaEdicion(a, b) {
  const m = a.length, n = b.length;
  let prev = new Array(n + 1), cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const coste = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + coste);
    }
    const t = prev; prev = cur; cur = t;
  }
  return prev[n];
}
function paisAproximado(k) {
  if (k.length < 6) return null;
  const maxD = k.length >= 8 ? 2 : 1;
  let mejor = null, mejorD = maxD + 1, empate = false;
  const mirar = function (clave, destino) {
    if (Math.abs(clave.length - k.length) > maxD) return;
    const d = distanciaEdicion(k, clave);
    if (d < mejorD) { mejorD = d; mejor = destino; empate = false; }
    else if (d === mejorD && destino !== mejor) empate = true;
  };
  for (const c in GENTILICIOS) mirar(c, GENTILICIOS[c]);
  for (const c in PAIS_POR_CLAVE) mirar(c, PAIS_POR_CLAVE[c]);
  return (mejor && !empate && mejorD <= maxD) ? mejor : null;
}

function paisValido(s) {
  const k = normSel(s);
  if (!k) return null;"""
code = una(code, A2b, B2b, 'paisAproximado')

A2c = """  if (PAIS_POR_CLAVE[sinArt]) return PAIS_POR_CLAVE[sinArt];
  if (GENTILICIOS[sinArt]) return GENTILICIOS[sinArt];
  return null;
}"""
B2c = """  if (PAIS_POR_CLAVE[sinArt]) return PAIS_POR_CLAVE[sinArt];
  if (GENTILICIOS[sinArt]) return GENTILICIOS[sinArt];
  // 5 · 03/09 · errata de una o dos letras (ver paisAproximado, justo arriba)
  return paisAproximado(k) || paisAproximado(sinArt);
}"""
code = una(code, A2c, B2c, 'paisValido paso 5')

# ── 3 · AVISO DE PASAPORTE ────────────────────────────────────────────────────
A3 = """    const pas = pasaporteValido(idBruto);
    if (pas) fields.PasaporteNumero = pas;
    else descartadas.push('NIF/Pasaporte=' + idBruto);"""
B3 = """    const pas = pasaporteValido(idBruto);
    if (pas) {
      fields.PasaporteNumero = pas;
      // 03/09 · el agente NO distingue NIE de pasaporte (y no debe: lo decide este nodo).
      // Medido en la conversacion 215475755624195: guardo el pasaporte, no pidio el NIE
      // y siguio con la nacionalidad; sin NIF el .030 no se puede generar. Se le avisa
      // por `descartados` para que pida el NIE UNA sola vez (lo dice el prompt v16).
      // No es un rechazo: el pasaporte queda guardado y _invalid sigue en false.
      descartadas.push('aviso_pasaporte=' + pas + ' guardado como PASAPORTE; el NIF/NIE sigue vacio: pide el NIE UNA sola vez y, si todavia no lo tiene, sigue con el pasaporte');
    }
    else descartadas.push('NIF/Pasaporte=' + idBruto);"""
code = una(code, A3, B3, 'aviso_pasaporte')

# ── 4 · PAREJA DE HECHO -> SOLTERO ────────────────────────────────────────────
A4 = """ponerSelect('estadoCivil', body.estado_civil, [
  ['casado',     ['pareja de hecho', 'union de hecho', 'unión de hecho', 'domestic partner',
                  'civil partnership', 'registered partnership',
                  'casado', 'casada', 'married', 'pareja']],
  ['soltero',    ['soltero', 'soltera', 'single', 'viudo', 'viuda', 'widowed', 'widow', 'widower']],"""
B4 = """// 03/09 · CAMBIO DE CRITERIO (decision del usuario): la PAREJA DE HECHO pasa a SOLTERO.
// Aunque en Espana tenga ciertos beneficios, ante Hacienda a estos efectos cuenta como
// soltero, asi que tampoco dispara la pregunta del conyuge. Hasta hoy se plegaba sobre
// casado (decision del 19/08, superada). 'pareja' a secas tambien va a soltero: quien
// dice "tengo pareja" no esta casado. Sigue yendo ANTES que las palabras sueltas.
ponerSelect('estadoCivil', body.estado_civil, [
  ['soltero',    ['pareja de hecho', 'union de hecho', 'unión de hecho', 'domestic partner',
                  'civil partnership', 'registered partnership', 'pareja',
                  'soltero', 'soltera', 'single', 'viudo', 'viuda', 'widowed', 'widow', 'widower']],
  ['casado',     ['casado', 'casada', 'married']],"""
code = una(code, A4, B4, 'estado civil pareja de hecho')

io.open(destino, 'w', encoding='utf-8', newline='').write(code)
sys.stdout.write('montado %s: %d -> %d caracteres (+%d)\n' % (destino, original, len(code), len(code) - original))
