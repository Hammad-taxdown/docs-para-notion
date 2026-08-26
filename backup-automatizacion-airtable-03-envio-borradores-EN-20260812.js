// ORIGINAL · automatizacion "3. Envio borradores 030 y 149" · RAMA INGLES
// wflx5iCN4pXuwPAvO · nodo wac2hg1IZkE0yOxMF · capturado por MCP el 12/08/2026.
//
// Condicion de esta rama: Idioma (fld7z0pL1bjC8tTZd) = selB0lkXu3bmepNM3 ("Ingles")
// Secreto: n8nApi -> eacbfZbyDYjL9UWCW
// Entradas: recordId, emailUser, comentarios030, comentarios149, linkConfirmacion030
// Nodo siguiente: updateRecord -> Status = sel1oCLW0XPLZNZz7, Estado030149 = selBhjx9YrZGJUSz0
//
// FALLOS CONOCIDOS DE ESTE ORIGINAL:
//   - lee el enlace de inputConfig.linkConfirmacion030 mientras la rama espanola ya lo lee
//     del campo del registro, con un comentario que admite que la variable fallaba.
//   - comentarios149 se recibe y NO se usa.
//   - el updateRecord posterior baja el Status a 7 sin condicion.

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

const linkConfirmacionModelos = inputConfig.linkConfirmacion030;

// Comentario opcional (solo si el campo tiene contenido)
const comentarios = inputConfig.comentarios030 ? inputConfig.comentarios030 + "<br><br>" : "";

// Cuerpo del email (English)
const cuerpo =
    "Hi,<br>" +
    "<br>" +
    "We have prepared the drafts of your Form 030 and Form 149, the two filings we need in order to move forward with your application for the special regime for inbound workers (known as the **Beckham regime**):<br>" +
    "<br>" +
    "**Form 030:** notifies the Spanish Tax Agency of your arrival in Spain.<br>" +
    "**Form 149:** formally requests the application of the regime.<br>" +
    "<br>" +
    comentarios +
    "You will find them attached to this email so you can review them at your own pace. Once you have, all you need to do is confirm them (or let us know any changes) through this form:<br>" +
    "<br>" +
    "[Confirmation form](" + linkConfirmacionModelos + "){: .btn}<br>" +
    "<br>" +
    "Just a quick note so you do not worry: due to a technical issue at the Spanish Tax Agency, the draft of Form 030 shows your first name and surname in the same box. It is only a download display error and does not affect the filing in any way.<br>" +
    "<br>" +
    "If you have any questions, we are here to help.<br>" +
    "<br>" +
    "Best regards,<br>" +
    "**The TaxDown Mobility team**";

const emailData = {
    "subject": "Your draft Forms 030 and 149 are ready: we need your confirmation",
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
