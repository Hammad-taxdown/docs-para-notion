// ORIGINAL · automatizacion "3. Envio borradores 030 y 149" · RAMA ESPANOL
// wflx5iCN4pXuwPAvO · nodo wacBs8FLjGyvqNTpe · capturado por MCP el 12/08/2026.
//
// Trigger: recordMatchesConditions -> EnviarBorradores (fldGSgXLLCf2okzvB) = true
// Condicion de esta rama: Idioma (fld7z0pL1bjC8tTZd) = selpK6kadMNE60g0g ("Español")
// Secreto: n8nApi -> eacbfZbyDYjL9UWCW
// Entradas: recordId, emailUser (fldUJQlJ5cyYTgHdu), comentarios030 (fldRb66vq77ugTYUo),
//           comentarios149 (fldQ3T7KtPYTZeYcK), linkConfirmacion (fldraDKaVYKWXqiSq)
// Nodo siguiente: updateRecord -> Status = sel1oCLW0XPLZNZz7, Estado030149 = selBhjx9YrZGJUSz0
//
// FALLOS CONOCIDOS DE ESTE ORIGINAL (ver arreglos-automatizaciones-airtable-2026-08-12.md):
//   - comentarios149 se recibe y NO se usa.
//   - el updateRecord posterior baja el Status a 7 sin condicion.
//   - esta rama tiene condicion, y no hay rama else: con Idioma vacio no se manda nada.

let inputConfig = input.config();
const urlWebhook = 'https://es.synapse.rentax.es/webhook/a6a3ebaa-0d63-4edf-baef-30effc5fdf60';

// A rellenar por Ops
const table = base.getTable("Empleados");
const apiKey = input.secret("n8nApi");
const transactionalIDCustomer = 54;
const notif = "NOTIF_Mobility_BorradorM030";

// Record del trigger
const triggerRecord = await table.selectRecordAsync(inputConfig.recordId);

// Adjuntos: borradores del 030 y del 149
const borrador030 = triggerRecord.getCellValue("Borrador030") || [];
const borrador149 = triggerRecord.getCellValue("Borrador149") || [];

let processedAttachments = [];
for (const f of borrador030) {
    processedAttachments.push({ url: f.url, filename: f.filename, tipo: "borrador" });
}
for (const f of borrador149) {
    processedAttachments.push({ url: f.url, filename: f.filename, tipo: "borrador" });
}

// Leemos el enlace directamente del campo del registro (no depende de la variable de entrada)
const linkConfirmacionModelos = triggerRecord.getCellValueAsString("Linkconfirmacionmodelos");

// Comentario opcional (solo si el campo tiene contenido)
const comentarios = inputConfig.comentarios030 ? inputConfig.comentarios030 + "<br><br>" : "";

// Cuerpo del email
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

// Llamada al webhook
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
        headers: {
            'content-type': 'application/json',
            'x-make-apikey': apiKey
        },
        body: JSON.stringify(payload)
    });
    console.log(response);
} catch (error) {
    console.log(error);
}
