# Arreglos de las automatizaciones de Airtable · 12/08/2026

> **⚰️ SUPERADO — 27/08/2026.** Los arreglos se hicieron **el 24/08/2026 en la parte NATIVA** de las
> automatizaciones, **sin tocar los scripts** (el `customScript` es intocable salvo para los
> colaboradores del secreto `n8nApi`), y con una estructura de **TRES ramas** distinta de la
> propuesta aquí en A.1 (no hay rama `Else` como la que pide este doc: la rama inglesa se partió en
> dos al nivel de arriba). **No pegar ninguno de estos scripts**: seguir este documento hoy
> desmontaría la estructura publicada, y A.4 («quita `Status` del Update record») eliminaría la
> subida a «Pte confirmación usuario». Además, la tabla ORDEN de abajo usa la **numeración vieja**
> de la escalera (renumerada el 26/08: equivalencias en `docs/pasos-2026-08-26-renumeracion.sh`).
> Lo vigente y el porqué de cada decisión está en
> `docs/correcciones-automatizaciones-airtable-2026-08-21.md` y en `CLAUDE.md` §6
> («SE QUEDAN LAS AUTOMATIZACIONES DE ICIAR»).

Auditoría de las cuatro automatizaciones desplegadas de `Mobility_2026`. **Seis fallos**, dos de
ellos serios. Aquí van los scripts corregidos, listos para pegar.

> **Por qué a mano y no por MCP:** intenté aplicarlos con `update_automation` y **el clasificador de
> permisos lo bloqueó**. No he rodeado el bloqueo. Da igual para el resultado: se pega y ya.
>
> **Nada de esto está aplicado.** Las automatizaciones siguen exactamente como estaban.

---

## Resumen

| | Automatización | Fallo | Gravedad |
|---|---|---|---|
| 1 | `3. Envio borradores` | **Sin rama por defecto**: con `Idioma` vacío no manda nada y no da error | 🔴 |
| 2 | `3. Envio borradores` | **El `Status` retrocede**: escribe 7 sin condición | 🔴 |
| 3 | `3. Envio borradores` | La rama inglesa lee el enlace de un sitio distinto que la española | 🟠 |
| 4 | `3. Envio borradores` | `Modificacion M149` se recoge y **nunca se usa** | 🟠 |
| 5 | `Crear Check out` | El `wait()` es un **bucle en vacío** de hasta 125 s | 🔴 |
| 6 | `2. Formulario` | `NO_COPIAR` obsoleto y sin proteger campos técnicos | 🟡 |

---

# Arreglo A · `3. Envio borradores 030 y 149`

Resuelve los fallos **1, 2, 3 y 4**.

## A.1 · Cambio de estructura (esto va en la UI, no es código)

Hoy el bloque condicional tiene **dos ramas con condición** y ninguna por defecto:

```
si Idioma = Español  → correo ES
si Idioma = Inglés   → correo EN
(nada más)           → SILENCIO
```

Hay que dejarlo así:

```
si Idioma = Inglés   → correo EN
en cualquier otro caso → correo ES        ← rama "Else"
```

**Cómo:** en la rama de español, quítale la condición y conviértela en la rama **Else** (la última).
Deja la de inglés como la única con condición. **El orden importa**: la Else va al final.

Con eso, un `Idioma` vacío ya no cae en un agujero: sale en español, que es el idioma del trámite.

## A.2 · Script de la rama **ESPAÑOL** (ahora rama por defecto)

Sustituye el script entero:

```js
let inputConfig = input.config();
const urlWebhook = 'https://es.synapse.rentax.es/webhook/a6a3ebaa-0d63-4edf-baef-30effc5fdf60';

// A rellenar por Ops
const table = base.getTable("Empleados");
const apiKey = input.secret("n8nApi");
const transactionalIDCustomer = 54;
const notif = "NOTIF_Mobility_BorradorM030";

// ── 12/08 · ARREGLO 1 · ESTA ES AHORA LA RAMA POR DEFECTO ─────────────────────
// Antes habia DOS ramas con condicion (Espanol e Ingles) y NINGUNA por defecto:
// si Idioma venia vacio -- fila creada a mano, o conversacion que no llego a la
// pregunta del idioma -- no se mandaba el correo, no se movia el Status y NO
// HABIA NI ERROR. Silencio total.

const triggerRecord = await table.selectRecordAsync(inputConfig.recordId);

const borrador030 = triggerRecord.getCellValue("Borrador030") || [];
const borrador149 = triggerRecord.getCellValue("Borrador149") || [];

let processedAttachments = [];
for (const f of borrador030) {
    processedAttachments.push({ url: f.url, filename: f.filename, tipo: "borrador" });
}
for (const f of borrador149) {
    processedAttachments.push({ url: f.url, filename: f.filename, tipo: "borrador" });
}

// El enlace se lee del CAMPO DEL REGISTRO, no de la variable de entrada.
const linkConfirmacionModelos = triggerRecord.getCellValueAsString("Linkconfirmacionmodelos");

// ── 12/08 · ARREGLO 4 · Modificacion M149 se recogia y NO SE USABA NUNCA ──────
// Solo se pintaba el comentario del 030. Lo que un fiscal escribiera sobre el
// 149 no llegaba al cliente jamas.
const c030 = triggerRecord.getCellValueAsString("Modificacion M030") || "";
const c149 = triggerRecord.getCellValueAsString("Modificacion M149") || "";
let comentarios = "";
if (c030) comentarios += "<b>Sobre el modelo 030:</b><br>" + c030 + "<br><br>";
if (c149) comentarios += "<b>Sobre el modelo 149:</b><br>" + c149 + "<br><br>";

const cuerpo =
    "Hola,<br>" +
    "<br>" +
    "Ya hemos preparado los borradores de tus modelos **030** y **149**, los dos trámites que necesitamos para avanzar con tu solicitud del régimen especial de impatriados (el conocido como **régimen Beckham**):<br>" +
    "<br>" +
    "**Modelo 030:** comunica a la Agencia Tributaria tu llegada a España.<br>" +
    "**Modelo 149:** solicita formalmente la aplicación del régimen.<br>" +
    "<br>" +
    comentarios +
    "Los tienes adjuntos a este correo para que puedas revisarlos con calma. Cuando lo hayas hecho, solo tienes que confirmarlos (o indicarnos los cambios que veas) a través de este formulario:<br>" +
    "<br>" +
    "[Formulario de confirmación](" + linkConfirmacionModelos + "){: .btn}<br>" +
    "<br>" +
    "Un pequeño aviso para que no te preocupes: por una incidencia técnica de la Agencia Tributaria, en el borrador del modelo 030 el nombre y los apellidos aparecen en una misma casilla. Es solo un error de descarga y no afecta en nada a la presentación.<br>" +
    "<br>" +
    "Cualquier duda, aquí nos tienes.<br>" +
    "<br>" +
    "Un saludo,<br>" +
    "**El equipo Mobility de TaxDown**";

const emailData = {
    "subject": "Tus borradores de los modelos 030 y 149 ya están listos: necesitamos tu confirmación",
    "body": cuerpo
};

const record = {
    "emailUser": inputConfig.emailUser,
    "transactionalIDCustomer": transactionalIDCustomer,
    "recordId": inputConfig.recordId
};

if (processedAttachments.length > 0) {
    record.attachments = processedAttachments;
}

const payload = {
    "base": base.id,
    "table": table.id,
    "record": record,
    "emailData": emailData,
    "attachments": processedAttachments,
    "notif": notif
};

console.log(JSON.stringify(payload));

try {
    const response = await fetch(urlWebhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-make-apikey': apiKey },
        body: JSON.stringify(payload)
    });
    console.log(response);
} catch (error) {
    console.log(error);
}

// ── 12/08 · ARREGLO 2 · EL STATUS SOLO SUBE ──────────────────────────────────
// Antes se escribia '7. Pte confirmacion usuario' SIN CONDICION, en el nodo
// Update record. Asi que una fila en 8, 9 u 11 RETROCEDIA a 7 al reenviar
// borradores. Eso rompia la invariante que el bot respeta en Decidir_Status:
// la escalera SOLO SUBE.
// Los nombres van copiados LITERAL de Airtable, acentos incluidos.
const ORDEN = {
    '1. Interesado': 1,
    '2. Pendiente llamada TD': 2,
    '3. Pte hacer informe': 3,
    '4. Informe enviado': 4,
    '5. Pte formulario usuario': 5,
    '6. Pte hacer TD': 6,
    '7. Pte confirmación usuario': 7,
    '8. Confirmado': 8,
    '9. Finalizado': 9,
    '10.Pendiente resolución': 10,
    '11. Concedido': 11,
    '12. Descartado': 12
};
const statusActual = triggerRecord.getCellValueAsString("Status") || "";
if ((ORDEN[statusActual] || 0) < 7) {
    await table.updateRecordAsync(inputConfig.recordId, {
        "Status": { name: "7. Pte confirmación usuario" }
    });
} else {
    console.log("Status ya en '" + statusActual + "', no se baja a 7.");
}
```

## A.3 · Script de la rama **INGLÉS**

Igual que el anterior pero con el cuerpo en inglés. Los **dos cambios** respecto al actual:

**Cambio 1** — sustituye esta línea:

```js
const linkConfirmacionModelos = inputConfig.linkConfirmacion030;
```

por:

```js
// ── 12/08 · ARREGLO 3 · El enlace SIEMPRE del campo del registro ─────────────
// Esta rama lo leia de la variable de entrada mientras la espanola ya lo leia
// del registro, con un comentario que admitia que la variable fallaba. Si
// fallaba en una, fallaba en las dos: el cliente en ingles podia estar
// recibiendo el correo con el enlace VACIO.
const linkConfirmacionModelos = triggerRecord.getCellValueAsString("Linkconfirmacionmodelos");
```

**Cambio 2** — sustituye el bloque de comentarios por:

```js
const c030 = triggerRecord.getCellValueAsString("Modificacion M030") || "";
const c149 = triggerRecord.getCellValueAsString("Modificacion M149") || "";
let comentarios = "";
if (c030) comentarios += "<b>About Form 030:</b><br>" + c030 + "<br><br>";
if (c149) comentarios += "<b>About Form 149:</b><br>" + c149 + "<br><br>";
```

**Cambio 3** — pega al final el mismo bloque `ORDEN` / `statusActual` del script español.

## A.4 · Los dos nodos `Update record`

En **las dos ramas**, quita **`Status`** del nodo *Update record*. Déjalo solo con:

```
Estado030149 → 3. Pendiente confirmación
```

El `Status` ya lo escribe el script, con la guarda. Si lo dejas también en el nodo, el nodo gana y
vuelves a tener el retroceso.

---

# Arreglo B · `Crear Check out`

Resuelve el fallo **5**, que probablemente ya esté dando guerra.

Sustituye **solo** el bloque del `wait` y el del timeout:

```js
// ── 12/08 · ARREGLO 5 · El wait() era un BUCLE EN VACIO ──────────────────────
// El anterior era: while (Date.now() - start < ms) {}
// Eso NO duerme: gira bloqueando el hilo. Con 25 vueltas de 5 segundos daban
// 125 segundos de giro, MUY por encima del limite de ejecucion de un script de
// automatizacion de Airtable (del orden de 30 s). En cuanto la sincronizacion
// tardaba un poco, el script moria por limite y nadie sabia por que.
// Ahora duerme de verdad si el entorno lo permite, y si no, gira lo minimo.
const wait = (ms) => {
    if (typeof setTimeout === 'function') {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const fin = Date.now() + ms;
    while (Date.now() < fin) {}
    return Promise.resolve();
};
```

Y baja los reintentos para caber en el presupuesto de tiempo:

```js
    let syncRecordId = null;
    // 12/08 · 25 x 5s = 125s no cabia. 8 x 2s = 16s si cabe.
    for (let i = 0; i < 8; i++) {
        const querySync = await tablaMobility.selectRecordsAsync({ fields: ["Checkout_record_id"] });
        const match = querySync.records.find(r => r.getCellValueAsString("Checkout_record_id") === remoteId);
        if (match) { syncRecordId = match.id; break; }
        await wait(2000);
    }

    // ── 12/08 · Si expira, DEJAR RASTRO EN LA FILA ────────────────────────────
    // Antes solo se lanzaba el error. Y como el script petaba, el bloque
    // condicional de abajo NO llegaba a ejecutarse, asi que la casilla
    // 'Checkout Error' NO SE MARCABA NUNCA en este caso. El fallo solo se veia
    // entrando al historial de la automatizacion.
    if (!syncRecordId) {
        await tablaEmpleados.updateRecordAsync(recordIdEmpleado, { "Checkout Error": true });
        throw new Error("Timeout: el registro no se sincronizo a tiempo. Marcado Checkout Error.");
    }
```

Y el segundo bucle, de 6 vueltas a 3:

```js
    let finalUrl = null;
    for (let j = 0; j < 3; j++) {
        await wait(1500);
        const registroFresco = await tablaEmpleados.selectRecordAsync(recordIdEmpleado);
        finalUrl = registroFresco.getCellValueAsString("Checkout_Url (from Checkout_Linked)");
        if (finalUrl) break;
    }
```

Total: **~21 segundos en el peor caso**, dentro del límite.

---

# Arreglo C · `2. Usuario completa el formulario de confirmación M030`

Resuelve el fallo **6**. Sustituye **solo** la definición de `NO_COPIAR`:

```js
    // ── 12/08 · ARREGLO 6 · La lista estaba obsoleta y no protegia lo importante ──
    // Nombraba "Enlace formulario nombre y apellidos" y "EnlaceFormulario030149",
    // que NO EXISTEN entre las 79 columnas (la real es LinkFormulario030149).
    // No hacia dano porque son formulas y las salta isComputed, pero significaba
    // que alguien creia estar protegiendo campos que no protegia.
    //
    // Y faltaban los que de verdad importan: este script copia TODO lo no
    // computado y no vacio de la fila del formulario a la original, asi que el
    // dia que alguien anada un campo al formulario empezaria a sobrescribir sin
    // que nadie lo decida.
    const NO_COPIAR = new Set([
      "recordId", "RecordID Formulario", "Nombre completo",
      "Status",                    // un formulario NO decide el peldano de la escalera
      "last_idem_key",             // si se pisa, se rompe el dedup de WP-205b
      "UserId",                    // va prefijado y oculto: no se reescribe jamas
      "intercom_conversation_id",
      "AplicaBeckham"              // lo marca el bot solo con un SI EXPRESO del cliente
    ]);
```

## Lo que NO he tocado de esta, y por qué

Cuando el formulario llega **sin `recordId` válido**, el script registra en consola y sale, dejando
**la fila duplicada viva**. Como el formulario prefija el `UserId`, acabas con dos filas con el mismo
`UserId`.

**Lo he dejado así a propósito.** Borrar esa fila destruiría la respuesta del cliente, y el daño ya
está contenido: la guarda `WP-205b` detecta el duplicado, **el bot deja de escribir** y avisa a Slack
con `multi_match`. Lo que hay que saber es que **el síntoma sería "el bot dejó de guardar" y la causa
estaría en un formulario** — por eso queda escrito aquí.

---

# Lo que he dejado igual a propósito

**El párrafo del correo que le echa la culpa a la AEAT.** Preguntaste si se quitaba y nunca lo
decidiste, y es texto que va a clientes reales. Sigue en las dos ramas, intacto.

Recordatorio de la evidencia: de las cinco muestras del `.030`, **las cuatro con fecha real** (mayo,
julio y agosto de 2026) son de la versión `20250203` y **separan bien el nombre de los apellidos**. La
única mala es de la versión vieja `20190101` y **no tiene fecha**. O sea que ese aviso ya sobra.

---

# Orden de aplicación sugerido

1. **A** (`3. Envio borradores`) — es la que tiene los dos fallos rojos y afecta a clientes.
2. **B** (`Crear Check out`) — probablemente ya está fallando en silencio.
3. **C** (`2. Formulario`) — endurecimiento, sin urgencia.

Y antes de tocar **A** y **B**: las construyó Iciar. **Conviene avisarla**, aunque sea después.
