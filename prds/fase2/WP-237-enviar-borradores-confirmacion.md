---
id: WP-237
title: "Enviar borradores y confirmación: solo falta el salto de Status 7 a 8"
status: specified
size: S
depends_on: [WP-235]
milestone: "Fase 2 conversacional — Expediente y documentos"
owner: "Hammad"
external: "Decisión de negocio (¿4.3 confirma?)"
critical: true
issue: ""
---

# PRD · WP-237 — Enviar borradores y confirmación: solo falta el salto de Status 7 a 8

> **AUDITADO POR MCP EL 11/08 ANTES DE ESCRIBIR NADA, Y CASI TODO ESTABA HECHO.** Nació como `M` de
> construcción y bajó a `S`. Es la **quinta** vez en este proyecto que pasa lo mismo: *el camino existe
> y nadie lo usa.*

## 1. Lo que YA existe y funciona
- **El botón:** `EnviarBorradores` (`fldGSgXLLCf2okzvB`), checkbox.
- **La automatización `3. Envio borradores 030 y 149`** (`wflx5iCN4pXuwPAvO`, desplegada): dos ramas
  **por idioma** (Español / Inglés según `Idioma`), adjunta `Borrador030` y `Borrador149`, manda el
  correo por el webhook `a6a3ebaa…` de n8n con `NOTIF_Mobility_BorradorM030`, incluye
  `Linkconfirmacionmodelos`, y después escribe `Status = 7. Pte confirmación usuario` y
  `Estado030149 = 3. Pendiente confirmación`.
- **El bucle de vuelta:** `2. Usuario completa el formulario de confirmación M030`
  (`wflo1oMmSWlcYsO3V`) se dispara al enviar el formulario, que crea una fila nueva; el script la
  **fusiona en la original** por `recordId`, copia todo lo no computado y no vacío y **borra el
  duplicado**. Evidencia en la fila de ICIAR.

## 2. El único hueco
**Nadie mueve `Status` de `7. Pte confirmación usuario` a `8. Confirmado`.** La automatización 2 solo
fusiona, no toca `Status`. Eso es todo lo que hay que construir.

## 3. La decisión que lo bloquea
`Estado030149` tiene **cuatro** respuestas del cliente, no dos: `4.1 Confirmo todo` ·
`4.2 Necesito modificar ambos` · `4.3 Confirmo el 030 pero necesito modificar el 149` ·
`4.4 Confirmo el 149 pero necesito modificar el 030`.

Con `4.1` es sí y con `4.2` es no. **Las dos del medio son la duda**, y con el 149 hecho a mano por los
fiscales un `4.3` significa *«lo del bot está bien, falta trabajo humano»*. **La fila de ICIAR está
ahora mismo en ese caso exacto.**

## 4. Sin colisión con el bot, comprobado
`Decidir_Status` solo escribe si `nPropuesto > nActual`, así que con la fila en 7 el bot nunca la baja
a 3. Los dos escritores conviven **porque la escalera solo sube**.

## 5. Hueco de escalera fichado
Los peldaños **4, 5 y 6** (`4. Informe enviado`, `5. Pte formulario usuario`, `6. Pte hacer TD`) **no
los escribe nadie**. El 4 será de `WP-236` cuando genere el informe.

## 6. Verificación
Marcar `EnviarBorradores` → correo con adjuntos → formulario confirmado → `Status = 8. Confirmado`,
sin que el bot y la automatización se pisen.
