// ORIGINAL · automatizacion "Crear Check out" · rama "Comunicacion CIO"
// wflfiMbXabZqYnAzr · nodo wac3BNSFyGdEjL4Ve · capturado por MCP el 12/08/2026.
//
// Se ejecuta cuando la salida "Checkout_Url (from Checkout_Linked)" del script principal
// NO esta vacia. Secreto: n8nApi -> eacbfZbyDYjL9UWCW
// Entradas: recordId, linkFactura ($ref al script principal), emailUser (fldUJQlJ5cyYTgHdu)

let inputConfig = input.config();
const urlWebhook = 'https://es.synapse.rentax.es/webhook/a6a3ebaa-0d63-4edf-baef-30effc5fdf60'; // Webhook estático

/******************************************************************
 * A rellenar por Ops
 ******************************************************************/

const table = base.getTable("Empleados"); // Título exacto de la tabla
const apiKey = input.secret("n8nApi");   // Secreto en la automatización
const transactionalIDCustomer = 80;          // ID de la plantilla de Customer.io
const notif = "NOTIF_B2B_EnvioFactura"

// Obtenemos el record completo del trigger
const triggerRecord = await table.selectRecordAsync(inputConfig.recordId);

// Aquí la información del email
const emailData = {
    "subject": `TaxDown - Envío Factura `,
    "body": `Hola,<br>

Muchas gracias por solicitar el trámite.<br>

Para poder continuar, necesitaríamos que abones la siguiente factura, y una vez realizado el pago, procederemos con los borradores. Te adjuntaremos los mismos para tu revisión, una vez los tengamos listos.<br>

[Enlace al pago](${inputConfig.linkFactura}){: .btn} <br>

Quedamos a la espera,<br>

    Un saludo,`
};

/******************************************************************
 * No tocar a partir de aquí. Esta es la llamada al webhook.
 ******************************************************************/

const record = {
    "emailUser": `${inputConfig.emailUser}`,
    "transactionalIDCustomer": transactionalIDCustomer,
     "recordId": `${inputConfig.recordId}`
};

const payload = {
    "base": base.id,
    "table": table.id,
    "record": record,
    "emailData": emailData,
    // También lo mandamos en raíz por comodidad en n8n
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
