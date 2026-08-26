// ORIGINAL · automatizacion "2. Usuario completa el formulario de confirmacion M030"
// wflo1oMmSWlcYsO3V · capturado por MCP el 12/08/2026, ANTES de tocar nada.
//
// Trigger: formSubmitted sobre la vista viwjxT8e1uLg7K4OC ("Confirmación modelos").
// Entradas del nodo: oldRecords (renderRecordsAsListWithHtml del trigger, campo
// fldjm8KyZK0Op5qFY) y newRecord ($ref trigger .id).
// Secreto declarado: n8nApi -> eacbfZbyDYjL9UWCW  (declarado pero NO usado por el script).

const config = input.config();
const table = base.getTable("Empleados");

const nueva = await table.selectRecordAsync(config.newRecord);
const originalId = nueva ? (nueva.getCellValueAsString("recordId") || "").trim() : "";

if (!originalId || originalId === config.newRecord) {
  console.log("Sin recordId válido; no se toca nada.");
} else {
  const original = await table.selectRecordAsync(originalId);
  if (!original) {
    console.log("El original no existe; no se borra nada.");
  } else {
    const NO_COPIAR = new Set([
      "recordId", "RecordID Formulario", "Nombre completo",
      "Enlace formulario nombre y apellidos", "EnlaceFormulario030149"
    ]);
    const cambios = {};
    for (const campo of table.fields) {
      if (NO_COPIAR.has(campo.name)) continue;
      if (campo.isComputed) continue;
      let valor = nueva.getCellValue(campo.id);
      if (valor === null || valor === undefined) continue;
      if (typeof valor === "string" && valor.trim() === "") continue;
      if (Array.isArray(valor) && valor.length === 0) continue;
      if (campo.type === "singleSelect") cambios[campo.id] = { id: valor.id };
      else if (campo.type === "multipleSelects") cambios[campo.id] = valor.map(v => ({ id: v.id }));
      else cambios[campo.id] = valor;
    }
    await table.updateRecordAsync(originalId, cambios);
    await table.deleteRecordAsync(config.newRecord);
    console.log("✅ Fusionado en " + originalId + " y borrado el duplicado.");
  }
}
