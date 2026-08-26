// ORIGINAL · automatizacion "Crear Check out" · SCRIPT PRINCIPAL
// wflfiMbXabZqYnAzr · nodo wacfPP9arHDxyXN2Z · capturado por MCP el 12/08/2026.
//
// Trigger: recordMatchesConditions -> CrearCheckout (fldiWl4wywp1YCK2S) = true
// Secreto: "crear checkout BPM" -> eacfUyKjpY6C9pTqT
// Entradas: recordId ($ref trigger .id)
// outputSchema: "Checkout_Url (from Checkout_Linked)" (string)
//
// Despues viene un conditionalGroup:
//   - si esa salida NO esta vacia -> script "Comunicacion CIO" (crear-checkout-comunicacion-cio.js)
//   - else                        -> updateRecord: Checkout Error (flddzcBTfWZt9QaGB) = true
//
// FALLO CONOCIDO Y GRAVE DE ESTE ORIGINAL:
//   wait() es un BUSY-WAIT (while sin dormir) que bloquea el hilo. 25 vueltas x 5000 ms
//   = 125 segundos, muy por encima del limite de ejecucion de un script de automatizacion
//   de Airtable (~30 s). Ademas, cuando lanza el Timeout el script peta y el
//   conditionalGroup NO llega a correr, asi que "Checkout Error" NUNCA se marca en ese caso.

const tablaEmpleados = base.getTable("Empleados");
const tablaMobility = base.getTable("Checkout");

const config = input.config();
const recordIdEmpleado = config.record || config.recordId;
if (!recordIdEmpleado) throw new Error("No se ha recibido recordId en el input.");

const wait = async (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms) {}
};

const registroEmpleado = await tablaEmpleados.selectRecordAsync(recordIdEmpleado);
const importeStr = registroEmpleado.getCellValueAsString("Importe Factura") || "0";
const userId = registroEmpleado.getCellValueAsString("UserId") || "";
const email = registroEmpleado.getCellValueAsString("email") || "";

const productoId = "recVanegneAVwUr15";
const airtable_token = input.secret("crear checkout BPM");
const baseIdDestino = "apphWvef8YWoq7vux";
const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + airtable_token
};

try {
    const checkoutRes = await fetch("https://api.airtable.com/v0/" + baseIdDestino + "/tblaDVRZhjzVfB2HZ", {
        method: "POST",
        headers,
        body: JSON.stringify({ records: [{ fields: {
            "Tax_Down_User_Id": userId,
            "Customer_email": email
        } }] })
    });
    const checkoutData = await checkoutRes.json();
    const remoteId = checkoutData.records[0].id;

    await fetch("https://api.airtable.com/v0/" + baseIdDestino + "/tblLWN32v7ALduV3u", {
        method: "POST",
        headers,
        body: JSON.stringify({ records: [{ fields: {
            "Product_Linked": [productoId],
            "Checkout_Linked": [remoteId],
            "Amount": parseFloat(importeStr.replace(",", ".")) || 0
        } }] })
    });

    await fetch("https://api.airtable.com/v0/" + baseIdDestino + "/tblaDVRZhjzVfB2HZ/" + remoteId, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ fields: { "Checkout_created": true } })
    });

    let syncRecordId = null;
    for (let i = 0; i < 25; i++) {
        const querySync = await tablaMobility.selectRecordsAsync({ fields: ["Checkout_record_id"] });
        const match = querySync.records.find(r => r.getCellValueAsString("Checkout_record_id") === remoteId);
        if (match) {
            syncRecordId = match.id;
            break;
        }
        await wait(5000);
    }

    if (!syncRecordId) throw new Error("Timeout: El registro no se sincronizó a tiempo.");

    await tablaEmpleados.updateRecordAsync(recordIdEmpleado, { "Checkout_Linked": [{ id: syncRecordId }] });

    let finalUrl = null;
    for (let j = 0; j < 6; j++) {
        await wait(2000);
        const registroFresco = await tablaEmpleados.selectRecordAsync(recordIdEmpleado);
        finalUrl = registroFresco.getCellValueAsString("Checkout_Url (from Checkout_Linked)");
        if (finalUrl) break;
    }

    output.set("Checkout_Url (from Checkout_Linked)", finalUrl);

} catch (err) {
    console.error("Error en la automatizacion:", err.message);
    throw err;
}
