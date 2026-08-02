# Parches para el nodo `Validar y Normalizar` de `beckham_bot`

Nodo: `beckham_bot` (`nhOwpiGxikeU5DLR`) → **`Validar y Normalizar`** (nodo Code).
Rollback: versión actual antes de tocar = la que tengas tras WP-204 (`Publish` crea versión nueva;
apunta el `versionId` antes de cada parche).

**Un parche por vez. Publicar, probar, y solo entonces el siguiente.**
El bloque de WP-201 (el `JSON.parse` defensivo), `toIsoDate` y `toBool` **no se tocan en ninguno de los dos**.

---

## PARCHE 1 · WP-206 · whitelist de `punto` y de `Descarte`

Prueba: `./scripts/contract-test.sh --wp206` (8 comprobaciones)

### 1.1 — Añadir, justo DEBAJO de estas líneas que ya existen:

```js
if (!userId || !body.intercom_conversation_id) {
  return [{ json: { _invalid: true, error: 'user_id_or_conversation_id_missing' } }];
}

const fields = { UserId: userId, intercom_conversation_id: body.intercom_conversation_id };
```

pega esto:

```js
// ── WP-206 · whitelist de `punto` y de `Descarte` ─────────────────────────────
// Cero constantes de negocio en Intercom (decisión del Council, opción A):
// n8n deriva alta_ss / lead_potencial / Descarte desde `punto`.
// Los 4 nombres de opción se leyeron del esquema real de Airtable el 31/07/2026
// (campo Descarte = fldcEq4ts2Vyqzg5b), no de memoria.
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
  return [{ json: { _invalid: true, error: 'punto_desconocido' } }];
}
if (body.Descarte && DESCARTES.indexOf(String(body.Descarte).trim()) === -1) {
  return [{ json: { _invalid: true, error: 'descarte_desconocido' } }];
}
// ──────────────────────────────────────────────────────────────────────────────
```

### 1.2 — Sustituir el final del nodo

Localiza estos dos trozos que ya existen (están separados por las asignaciones de fechas):

```js
const altaSs = toBool(body.alta_ss);
if (altaSs !== null) fields.alta_ss = altaSs;

const leadPot = toBool(body.lead_potencial);
if (leadPot !== null) fields.lead_potencial = leadPot;
```

```js
if (body.Descarte) fields.Descarte = body.Descarte;
```

**Borra el segundo** (el de `Descarte`) y **sustituye el primero** por:

```js
// El body explícito solo se usa cuando NO viene `punto`; `punto` manda siempre.
const altaSs = toBool(body.alta_ss);
if (altaSs !== null) fields.alta_ss = altaSs;

const leadPot = toBool(body.lead_potencial);
if (leadPot !== null) fields.lead_potencial = leadPot;

if (body.Descarte) fields.Descarte = String(body.Descarte).trim();

if (punto) Object.assign(fields, DERIVA[punto]);
```

### 1.3 — Guardar, publicar, y probar

```bash
./scripts/contract-test.sh --wp206
```

Esperado: los 6 `punto` válidos → `ok:true` · `punto:"inventado"` → 400 · errata en `Descarte` → 400.
Después yo cuento por MCP las opciones del single-select: deben seguir siendo **4**. Si hay 5, la
whitelist no cortó y `typecast:true` creó una opción nueva en producción.

### 1.4 — Lo que NO va en este parche

- **`typecast:false`** en el nodo de Airtable. Es un segundo cambio y va DESPUÉS, con la whitelist ya
  verificada (WP-206b). Ponerlo antes convierte errores de dato en errores duros.
- Cambiar la forma del error a `{resultado:"schema_error"}` como pide el PRD: exige editar el nodo
  `Respond Error`. Queda anotado para WP-207.

### 1.5 — Decisión de negocio pendiente en este parche

La tabla `DERIVA` es una **propuesta**. Verificado de verdad son los 4 nombres de opción y los 6
valores de `punto`. Qué campo pone cada `punto` lo inferí del flujo. En particular: **`lead` escribe
`alta_ss = false`**. Si eso no es lo que se quiere, cambiarlo ANTES de publicar.
`Menos de 55 salario` existe en el single-select y **ningún `punto` la usa** — a propósito, no se le
inventó disparador.

Y esto **no** resuelve que ninguna rama limpie las marcas de otra (quien fue `lead` y luego
`cualifica` se queda con `lead_potencial = true`). Eso es **WP-226** y sigue abierto.

---

## PARCHE 2 · WP-205a · validación de forma del `UserId`

Solo la validación de forma. **La guarda de unicidad (contar matches y abortar si ≠1) NO va aquí**:
necesita un nodo Airtable Search nuevo + un If antes de la escritura. Eso es **WP-205b**, a mano en
el editor, y no se hace con prisa.

### 2.1 — Sustituir esta línea que ya existe:

```js
const userId = body.user_id ? String(body.user_id).trim() : '';
```

por:

```js
// ── WP-205a · validación de FORMA del UserId ──────────────────────────────────
// Formato real confirmado el 30/07: `eu-west-1:<uuid>` (Cognito AWS = ID interno
// de TaxDown). Verificado en vivo el 31/07 en la ejecución 8068072:
// eu-west-1:d59e6f8e-17e4-c48f-92b3-ee0f609c6dac
// Se valida la forma, no solo "no vacío": un ID mal formado no debe llegar a ser
// valor de matchingColumns en una tabla con datos de empleados reales.
const userId = body.user_id ? String(body.user_id).trim() : '';

const FORMA_USER_ID = /^[a-z]{2}-[a-z]+-\d+:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (userId && !FORMA_USER_ID.test(userId)) {
  return [{ json: { _invalid: true, error: 'user_id_forma_invalida' } }];
}
// ──────────────────────────────────────────────────────────────────────────────
```

La región (`eu-west-1`) se deja genérica a propósito: si algún día el usuario viene de otra región
de AWS, el ID sigue siendo válido y no rompemos la escritura por un prefijo.

### 2.2 — Probar

```bash
BASE=https://es.synapse.rentax.es
URL=$BASE/webhook/beckham-upsert-expediente

# Debe dar 400 con user_id_forma_invalida, SIN escribir nada
curl -sS -w '\n%{http_code}\n' -X POST -H 'Content-Type: application/json' \
  --data '{"user_id":"no-soy-un-id","intercom_conversation_id":"TEST-205a-malo"}' "$URL"

# Debe seguir dando 200 ok:true (no regresión con la forma buena)
curl -sS -w '\n%{http_code}\n' -X POST -H 'Content-Type: application/json' \
  --data '{"user_id":"eu-west-1:00000000-0000-4000-8000-00000000ct01","intercom_conversation_id":"TEST-205a-bueno"}' "$URL"
```

Y después `./scripts/contract-test.sh --wp206` completo, para confirmar que el parche 2 no rompió
nada del parche 1.

### 2.3 — Ojo con el UserId de las pruebas

Los `UserId` de `contract-test.sh` terminan en `ct01` / `ct08` / `c206`, o sea que **NO son uuid
hexadecimales válidos** en su último grupo (`ct` y `c2` no son hex). Con el parche 2 activo esos
curls empezarían a devolver 400 y el script daría FAIL en todo.

Antes de aplicar el parche 2 hay que cambiar los tres `UserId` del script a hex puro, por ejemplo:

- `eu-west-1:00000000-0000-4000-8000-0000000000c1` (era `...ct01`)
- `eu-west-1:00000000-0000-4000-8000-0000000000c8` (era `...ct08`)
- `eu-west-1:00000000-0000-4000-8000-000000000206` (era `...c206`)

Siguen siendo identificables y filtrables, y ahora sí pasan la validación de forma.
**Esto crea filas nuevas** (son UserId distintos de los ya usados). Ninguna se borra.

---

## Lo que queda fuera hoy

- **WP-202** · workflow de errores. Bloqueado: `Notificaciones_error` (`TXVWRUzc1G5HXHjZ`) devuelve
  *"Workflow is not available in MCP. Enable MCP access in workflow settings"*, así que no se sabe qué
  credencial de Slack ni de email existe. Además hay que tocar `settings.errorWorkflow` de
  `beckham_bot` a mano.
- **WP-205b** · guarda de unicidad de `UserId` (nodo Airtable Search + If antes de escribir).
- **WP-206b** · `typecast:false` en el nodo de Airtable, una vez la whitelist esté verificada.
