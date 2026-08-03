# Contrato ampliado del escritor — `Validar y Normalizar` · 3/08/2026

> Amplía el contrato del webhook `beckham-upsert-expediente` de **9 campos a 19**, para que los datos
> que el agente recoge hablando (nombre, apellidos, NIF, teléfono, domicilio, fecha de nacimiento)
> se guarden en Airtable. Es la pieza de la que dependen las dos tools del agente.
>
> **Se edita a mano en el editor de n8n.** La regla del proyecto prohíbe `update_workflow` por MCP
> sobre `beckham_bot` (borra las credenciales de los ~10 nodos que las tienen).
>
> **Punto de rollback antes de tocar:** `versionId = 58fda5ba-1bcb-49ae-8693-1bcf4b7805c1`, 31 nodos.

---

## 1. Qué cambia y qué NO cambia

### No cambia nada de lo que ya funciona

- Los 9 campos actuales, con su comportamiento exacto.
- El parseo urlencoded de WP-201, la validación de forma del `UserId` (WP-205a), la whitelist de
  `punto` y `Descarte` (WP-206a), la comprobación de fechas imposibles y `T12:00:00.000Z`.
- **Las claves de salida `_hay_fechas_descartadas` y `_fechas_descartadas` se conservan con el mismo
  nombre**, para que el nodo `¿Fechas descartadas?` y `Avisar_Fecha_Invalida` sigan funcionando sin
  tocarlos. Ahora pueden llevar además rechazos que no son de fecha.
- Los 4 `return rechazar(...)` y sus códigos de error.

### Se añaden 10 campos

| Campo del contrato | Columna en Airtable | Tipo | Validación en n8n |
|---|---|---|---|
| `nombre` | `Nombre empleado` | texto | no vacío, ≤ 100 |
| `apellidos` | `Apellidos empleado` | texto | no vacío, ≤ 100 |
| `nif` | `NIF` | texto | **DNI/NIE con letra de control** |
| `telefono` | `NumeroTelefono` | texto | ES: 9 dígitos y empieza por 6/7/9 · extranjero: `+` y 7–15 dígitos |
| `tipo_via` | `Tipo de vía / Type of road` | singleSelect | **whitelist de 93 opciones** |
| `calle` | `Nombre de la calle / Name of street` | texto | va en bloque con `numero` y `codigo_postal` |
| `numero` | `Número de tu domicilio / House Number` | texto | idem |
| `codigo_postal` | `Codigo Postal` | texto | 5 dígitos, provincia 01–52 |
| `planta` | `Planta` | texto | opcional, suelto |
| `puerta` | `Puerta` | texto | opcional, suelto |
| `fecha_nacimiento` | `FechaNacimiento` | date | mismo `toIsoDate` que las otras 3 fechas |

### Las tres decisiones de diseño que importan

**a) El domicilio es atómico: `calle` + `numero` + `codigo_postal`, los tres o ninguno.**
Éste es el arreglo real del defecto de no determinismo del 1/08 (conv A exigió calle+CP+población,
conv B tragó `Calle Miguiel Hernandez 56` a secas). Ahora **da igual lo que decida el modelo**: si
faltan piezas, el domicilio no se escribe y se avisa. Es un dato que va a Hacienda; medio domicilio
es peor que ninguno, porque parece bueno.
`planta` y `puerta` van sueltos porque muchos domicilios no los tienen.

**b) El teléfono se valida según sea español o extranjero.**
Rechazar todo lo que no sean 9 dígitos españoles sería un bug: **los impatriados del régimen Beckham
acaban de llegar a España y muchos tienen número extranjero.** Regla: si empieza por `+34` o son 9
dígitos → tiene que empezar por 6, 7 o 9. Si empieza por otro `+` → se acepta con 7–15 dígitos.
Sin `+` y sin 9 dígitos → se rechaza. Esto mata los dos casos del 1/08: `+3466175816` (8 dígitos
tras el +34) y `+34 234876459` (empieza por 2).

**c) El NIF se valida con la letra de control, no solo con la forma.**
DNI = 8 dígitos + letra de `TRWAGMYFPDXBNJZSQVHLCKE[n % 23]`. NIE = X/Y/Z → 0/1/2 y misma cuenta.
Un NIF con forma buena y letra mala es un NIF inexistente.

**Y la regla general, que ya era la del nodo:** un campo que llega mal **no se escribe y se avisa**;
nunca se escribe un valor de relleno. Un campo ausente no pisa la celda (verificado en T8).

---

## 2. Código completo del nodo

Reemplaza **todo** el contenido de `Validar y Normalizar` por esto. Es una sola pegada.

```javascript
// ── WP-201 · parseo defensivo del body ────────────────────────────────────────
// El Data Connector de Intercom manda application/x-www-form-urlencoded con el
// JSON entero como ÚNICA CLAVE del body, así que body.user_id sale undefined.
// Verificado en las ejecuciones 8052012 y 8052018 (27/07).
// La guarda `body.user_id === undefined` hace que esto sea un no-op cuando el
// body ya llega como JSON nativo → cero riesgo de regresión.
let body = $input.first().json.body || {};

if (body && typeof body === 'object' && !Array.isArray(body) && body.user_id === undefined) {
  const keys = Object.keys(body);
  if (keys.length === 1) {
    // dos candidatos: la clave sola, y clave=valor por si el JSON llevaba un '='
    const candidatos = [keys[0], keys[0] + '=' + body[keys[0]]];
    for (const c of candidatos) {
      try {
        const parsed = JSON.parse(c);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          body = parsed;
          break;
        }
      } catch (e) {
        // no era JSON: se deja el body tal cual y la validación decidirá
      }
    }
  }
}
// ──────────────────────────────────────────────────────────────────────────────
function toIsoDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  let iso = null;
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) iso = dmy[3] + '-' + dmy[2] + '-' + dmy[1];
  else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) iso = s;
  if (!iso) return null;
  // La fecha tiene que EXISTIR en el calendario, no solo tener el formato bueno.
  // Sin esto, 31/02/2026 colaba y Airtable (typecast) la rodaba a 2026-03-03.
  // Misma comprobacion que ya hace beckham_f2_plazo.
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7), d = +iso.slice(8, 10);
  const f = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(f) || f.getUTCFullYear() !== y || (f.getUTCMonth() + 1) !== m || f.getUTCDate() !== d) return null;
  return iso + 'T12:00:00.000Z';
}

function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (s === 'true' || s === 'si' || s === 'sí' || s === 'yes' || s === '1') return true;
  if (s === 'false' || s === 'no' || s === '0') return false;
  return null;
}

// ── 3/08 · helpers del contrato ampliado ──────────────────────────────────────
// Regla comun a todos: si el valor viene MAL se descarta Y SE AVISA; nunca se
// escribe un valor de relleno. Un campo ausente no pisa la celda (T8).
function limpio(v) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/\s+/g, ' ').trim();
}

// NIF: valida la LETRA DE CONTROL, no solo la forma. DNI y NIE.
function nifValido(s) {
  const t = s.toUpperCase().replace(/[\s-]/g, '');
  const m = t.match(/^([XYZ]?)(\d{7,8})([A-Z])$/);
  if (!m) return null;
  let num = m[2];
  if (m[1]) {
    // NIE: X->0, Y->1, Z->2 y el numero es de 7 digitos
    if (num.length !== 7) return null;
    num = String('XYZ'.indexOf(m[1])) + num;
  } else if (num.length !== 8) {
    return null;
  }
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  if (letras[parseInt(num, 10) % 23] !== m[3]) return null;
  return t;
}

// Telefono: los impatriados acaban de llegar a España, MUCHOS TIENEN NUMERO
// EXTRANJERO -> exigir 9 digitos españoles a todos seria un bug.
// OJO AL ORDEN (bug encontrado y corregido el 3/08 al probar la funcion): si el
// caso extranjero se evalua antes de descartar los marcados como españoles,
// '+3466175816' (8 digitos tras el +34) CASA como extranjero y se acepta. Es
// justo el numero malo de la conv B del 1/08. Un numero marcado como español se
// juzga SOLO con la regla española y no puede caer a la rama de extranjero.
function telefonoValido(s) {
  const t = s.replace(/[\s().-]/g, '');
  // 1) Marcado explicitamente como español (+34 / 0034)
  const marcado = t.match(/^(?:\+34|0034)(\d+)$/);
  if (marcado) return /^[6-9]\d{8}$/.test(marcado[1]) ? '+34' + marcado[1] : null;
  // 2) Nueve digitos sin prefijo -> español
  if (/^\d{9}$/.test(t)) return /^[6-9]/.test(t) ? '+34' + t : null;
  // 3) 34 + 9 digitos sin el '+'
  const m34 = t.match(/^34(\d{9})$/);
  if (m34) return /^[6-9]/.test(m34[1]) ? '+34' + m34[1] : null;
  // 4) Extranjero en E.164: + y de 7 a 15 digitos, sin empezar por 0
  if (/^\+[1-9]\d{6,14}$/.test(t)) return t;
  return null;
}

// CP: 5 digitos y provincia real (01-52)
function cpValido(s) {
  const t = s.replace(/\s/g, '');
  if (!/^\d{5}$/.test(t)) return null;
  const prov = parseInt(t.slice(0, 2), 10);
  if (prov < 1 || prov > 52) return null;
  return t;
}

// Tipo de via: singleSelect en Airtable -> whitelist obligatoria.
// Leida del esquema real de Airtable el 3/08 (fld0A4dWkZia1yTcw, 93 opciones).
const TIPOS_VIA = ['ACEQUIA','ACERA','ALAMEDA','ALDEA','AMPLIACION','ANGOSTA','APARTADO DE CORREOS',
'APARTAMENTOS','ATAJO','AVENIDA','BAJADA','BARRANCO','BARRIADA','BARRIO','BLOQUES','BULEVAR','CALLE',
'CALLEJA','CALLEJON','CALLEJUELA','CALZADA','CAMINO','CARRERA','CARRETERA','CASERIO','CHALET',
'COLONIA','COOPERATIVA','CORRAL','COSTANILLA','CUESTA','EDIFICIO','ESCALA','ESCALERA','ESCALINATA',
'ESTRADA','GLORIETA','GRUPO','LLANO','LUGAR','MANZANA','MERCADO','MONTAÑA','MUNICIPIO','OTROS',
'PARAJE','PARQUE','PARTICULAR','PARTIDA','PASADIZO','PASAJE','PASEO','PASEO ALTO','PASEO BAJO',
'PASILLO','PASO','PASSEIG','PATIO','PLACETA','PLAZA','PLAZOLETA','PLAZUELA','POBLADO','POLIGONO',
'PORTALES','PRIVADA','PROLONGACION','RAMAL','RAMBLA','RAMPA','RESIDENCIA','RESIDENCIAL','RIBERA',
'RINCON','RINCONADA','RONDA','RÚA','SECTOR','SENDA','SENDERO','SIN DATOS DOMICILIAR','SUBIDA','TORRE',
'TORRENTE','TRANSVERSAL','TRASERA','TRAVESIA','URBANIZACION','VIA','VILLAS','VIVIENDAS','ZONA'];

// Sinonimos que el agente escribira en lenguaje natural -> opcion real.
const ALIAS_VIA = { 'C/':'CALLE','C':'CALLE','CL':'CALLE','AV':'AVENIDA','AVDA':'AVENIDA',
'AVD':'AVENIDA','PZ':'PLAZA','PLZ':'PLAZA','PL':'PLAZA','PS':'PASEO','PSO':'PASEO','CTRA':'CARRETERA',
'CRA':'CARRETERA','CMNO':'CAMINO','TRV':'TRAVESIA','GTA':'GLORIETA','RBLA':'RAMBLA','URB':'URBANIZACION' };

function tipoViaValido(s) {
  let t = s.toUpperCase().replace(/\./g, '').trim();
  if (ALIAS_VIA[t]) t = ALIAS_VIA[t];
  return TIPOS_VIA.indexOf(t) === -1 ? null : t;
}
// ──────────────────────────────────────────────────────────────────────────────

// ── WP-205a · validación de FORMA del UserId ──────────────────────────────────
// Formato real: `eu-west-1:<uuid>`. Verificado en la ejecución 8068072.
const userId = body.user_id ? String(body.user_id).trim() : '';

// Los avisos del 400 necesitan saber DE QUIEN se perdio el expediente.
function rechazar(err) {
  return [{ json: {
    _invalid: true,
    error: err,
    _user_id_visto: userId,
    _conversation_id_visto: body.intercom_conversation_id || ''
  } }];
}

const FORMA_USER_ID = /^[a-z]{2}-[a-z]+-\d+:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (userId && !FORMA_USER_ID.test(userId)) {
  return rechazar('user_id_forma_invalida');
}
// ──────────────────────────────────────────────────────────────────────────────

if (!userId || !body.intercom_conversation_id) {
  return rechazar('user_id_or_conversation_id_missing');
}

const fields = { UserId: userId, intercom_conversation_id: body.intercom_conversation_id };

// Acumula todo lo que llego con valor pero se DESCARTO por invalido.
// Mismas claves de salida que antes -> el nodo `¿Fechas descartadas?` y
// `Avisar_Fecha_Invalida` siguen funcionando sin tocarlos.
const descartadas = [];

// ── WP-206 · whitelist de `punto` y de `Descarte` ─────────────────────────────
const DESCARTES = [
  'No residente ultimos 5 años',
  'Menos de 55 salario',
  'Alta en SS mas de 6 meses',
  'Otro/Incompleto'
];

const DERIVA = {
  cualifica:              { alta_ss: true },
  lead:                   { alta_ss: false, lead_potencial: true },
  descarte_plazo:         { alta_ss: true, Descarte: 'Alta en SS mas de 6 meses' },
  descarte_residencia:    { Descarte: 'No residente ultimos 5 años' },
  autodescarte_declarado: { Descarte: 'Otro/Incompleto' },
  faq_entrada:            {}
};

const punto = body.punto ? String(body.punto).trim() : '';
if (punto && !Object.prototype.hasOwnProperty.call(DERIVA, punto)) {
  return rechazar('punto_desconocido');
}
if (body.Descarte && DESCARTES.indexOf(String(body.Descarte).trim()) === -1) {
  return rechazar('descarte_desconocido');
}
// ──────────────────────────────────────────────────────────────────────────────

if (body.email) fields.email = String(body.email).trim();

const altaSs = toBool(body.alta_ss);
if (altaSs !== null) fields.alta_ss = altaSs;

const leadPot = toBool(body.lead_potencial);
if (leadPot !== null) fields.lead_potencial = leadPot;

if (body.Descarte) fields.Descarte = String(body.Descarte).trim();

if (punto) Object.assign(fields, DERIVA[punto]);

// ── Fechas ────────────────────────────────────────────────────────────────────
function ponerFecha(nombre, valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') return;
  const iso = toIsoDate(valor);
  if (iso) fields[nombre] = iso;
  else descartadas.push(nombre + '=' + String(valor).trim());
}
ponerFecha('fecha_alta_ss', body.fecha_alta_ss);
ponerFecha('fecha_prevista_alta', body.fecha_prevista_alta);
ponerFecha('fecha_limite_plazo', body.fecha_limite_plazo);
ponerFecha('FechaNacimiento', body.fecha_nacimiento);

// ── 3/08 · campos que recoge el AGENTE hablando ───────────────────────────────
// Texto simple: se limpia y se corta. Si viene vacio, no se manda (no pisa).
function ponerTexto(columna, valor, max) {
  const v = limpio(valor);
  if (!v) return;
  if (v.length > (max || 100)) { descartadas.push(columna + '=' + v.slice(0, 40) + '…(demasiado largo)'); return; }
  fields[columna] = v;
}
ponerTexto('Nombre empleado', body.nombre, 100);
ponerTexto('Apellidos empleado', body.apellidos, 100);
ponerTexto('Planta', body.planta, 20);
ponerTexto('Puerta', body.puerta, 20);

// Validados: si vienen y NO pasan, se descartan Y SE AVISA.
function ponerValidado(columna, valor, fn) {
  const v = limpio(valor);
  if (!v) return;
  const ok = fn(v);
  if (ok === null) { descartadas.push(columna + '=' + v); return; }
  fields[columna] = ok;
}
ponerValidado('NIF', body.nif, nifValido);
ponerValidado('NumeroTelefono', body.telefono, telefonoValido);
ponerValidado('Tipo de vía / Type of road', body.tipo_via, tipoViaValido);

// ── DOMICILIO ATOMICO: calle + numero + CP, los tres o ninguno ────────────────
// Arregla el no determinismo del 1/08 en el propio escritor, para que deje de
// depender de lo que decida el modelo. Medio domicilio es peor que ninguno:
// parece bueno y va a Hacienda.
const dCalle = limpio(body.calle);
const dNumero = limpio(body.numero);
const dCpRaw = limpio(body.codigo_postal);
if (dCalle || dNumero || dCpRaw) {
  const dCp = dCpRaw ? cpValido(dCpRaw) : null;
  if (dCalle && dNumero && dCp) {
    fields['Nombre de la calle / Name of street'] = dCalle.slice(0, 100);
    fields['Número de tu domicilio / House Number'] = dNumero.slice(0, 20);
    fields['Codigo Postal'] = dCp;
  } else {
    const falta = [];
    if (!dCalle) falta.push('calle');
    if (!dNumero) falta.push('numero');
    if (!dCpRaw) falta.push('codigo_postal');
    else if (!dCp) falta.push('codigo_postal invalido (' + dCpRaw + ')');
    descartadas.push('domicilio incompleto, falta: ' + falta.join(', '));
  }
}
// ──────────────────────────────────────────────────────────────────────────────

return [{ json: {
  _invalid: false,
  fields,
  _hay_fechas_descartadas: descartadas.length > 0,
  _fechas_descartadas: descartadas.join(' · ')
} }];
```

---

## 3. Pendiente cosmético que queda abierto

`Avisar_Fecha_Invalida` manda `tipo_alerta = 'fecha_invalida_descartada'`. Ahora ese aviso puede
llevar un teléfono o un domicilio, así que la etiqueta se queda **inexacta pero no rota** — el
`detalle_alerta` sí dice qué campo fue. Arreglarlo es cambiar un campo por
`dato_invalido_descartado` en ese nodo. **No lo metas en este publish:** es otro cambio y la regla
es uno por prueba.

---

## 4. Batería de verificación (tras publicar)

Todos contra `https://es.synapse.rentax.es/webhook/beckham-upsert-expediente`, con
`user_id` = `eu-west-1:00000000-0000-4000-8000-0000000000d1` y un `intercom_conversation_id`
cualquiera. **Comprobar cada caso en Airtable por MCP, no solo el `ok:true`.**

### Regresión — que no se haya roto nada (obligatorio)
- `./scripts/contract-test.sh` → tiene que seguir dando **5/5**.
- `./scripts/contract-test.sh --t8` → **2/2**.

### Campos nuevos que deben ESCRIBIRSE
| # | Envío | Esperado en Airtable |
|---|---|---|
| N1 | `nombre=Hammad`, `apellidos=Bellachhab` | las dos columnas escritas |
| N2 | `nif=12345678Z` | `NIF=12345678Z` |
| N3 | `nif=X1234567L` (NIE) | escrito |
| N4 | `telefono=666175816` | `+34666175816` |
| N5 | `telefono=+34 666 17 58 16` | `+34666175816` (normalizado) |
| N6 | `telefono=+447911123456` (UK) | `+447911123456` |
| N7 | `calle=Gaztambide`, `numero=2`, `codigo_postal=28015` | los **tres** escritos |
| N8 | `tipo_via=C/` | `CALLE` |
| N9 | `fecha_nacimiento=29/02/2028` | `2028-02-29` |

### Campos malos que deben DESCARTARSE **y avisar**
| # | Envío | Esperado |
|---|---|---|
| M1 | `nif=12345678A` (letra mala) | campo **ausente** + aviso |
| M1b | `nif=12345678H` — **el que el agente ACEPTÓ el 1/08** | **ausente** + aviso (la letra buena es `Z`) |
| M2 | `telefono=+3466175816` (el caso real del 1/08) | **ausente** + aviso |
| M3 | `telefono=+34 234876459` (empieza por 2) | **ausente** + aviso |
| M4 | `calle=Miguiel Hernandez`, `numero=56` (sin CP) | **los tres ausentes** + aviso `domicilio incompleto, falta: codigo_postal` |
| M5 | `codigo_postal=99999` (provincia 99) | domicilio **ausente** + aviso |
| M6 | `tipo_via=RUA DE LA PLATA` | **ausente** + aviso, y el resto del domicilio SÍ escrito |
| M7 | `fecha_nacimiento=31/02/1990` | **ausente** + aviso |

El aviso vale **solo** si se ve el `ok:true` + `message_timestamp` en el output de `Slack_Aviso`
y el mensaje en pantalla. Duración de subejecución < 50 ms = no se envió.

### Que no pise (el invariante T8)
| # | Envío | Esperado |
|---|---|---|
| P1 | Escribir N1+N4+N7, luego mandar **solo** `nombre=Otro` | teléfono y domicilio **intactos** |

---

## 5. Después de esto

1. `guardar_datos_cliente` como **HTTP Request Tool** contra este webhook → el agente hereda toda
   esta validación sin lógica nueva.
2. `leer_expediente` como tool contra `/webhook/beckham-get-expediente` (ya probado, WP-07).
3. Una línea en `Preparar_Prompt` para leer el atributo de la fecha de alta en SS, y que viaje en la
   tool sin necesitar el DC.
4. El DC de persistencia en D/G/N **sigue siendo necesario** para los descartes que mueren en la
   fase de filtros, donde el agente nunca arranca. Es lo único que exige tocar el canvas de Intercom.
