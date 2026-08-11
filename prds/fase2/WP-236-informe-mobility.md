---
id: WP-236
title: "Informe Mobility: memoria fiscal montada por bloques"
status: specified
size: L
depends_on: [WP-235]
milestone: "Fase 2 conversacional — Expediente y documentos"
owner: "Hammad"
external: "Fiscal (ambigüedad de paisOrigen)"
critical: true
issue: ""
---

# PRD · WP-236 — Informe Mobility: memoria fiscal montada por bloques

> **LA PLANTILLA YA EXISTE desde el 11/08.** Este WP decía «conseguir la plantilla, que hoy no
> existe»; el usuario entregó `[MOB] Bloques informe Mobility.docx`. Deja de ser un WP sin contrato y
> **resucita la tool `generar_informe`**, que se había descartado precisamente por no tenerlo.

## 1. Objetivo
Al terminar el procedimiento, generar el **informe de memoria fiscal** del cliente y enviárselo.

## 2. Cómo se monta
**Cabecera + bloque del año de desplazamiento + bloque del año siguiente.** Tres bloques excluyentes:
**A)** Residente fiscal · **B)** No residente fiscal · **C)** Régimen especial (Beckham).

**Encajan uno a uno con dos columnas de fórmula que YA existen**: `Situación fiscal Anio
Desplazamiento` y `Situación fiscal AnioSiguiente`, cuyos valores vivos son *Régimen Especial
(Beckham)* / *Residente Fiscal* / *No residente UE*. El documento se arma leyendo esas dos.

## 3. Los 17 marcadores
**Diez salen de columnas que ya existen:** `nombreCompleto`, `fechaDesplazamiento`, `estadoCivil`,
`hijos`, `salarioBrutoAnual`, `sumaPropiedades`, `sumaInversiones`, `situacionAnioDesplazamiento`,
`situacionAnioSiguiente`, y `anio`/`anioSiguiente` por derivación.

**`{{paisOrigen}} = `Nacionalidad`**, decidido por el usuario el 11/08. Coincide con la casilla 205
del modelo 030.

**Cuatro huecos:** `{{fechaLlamada}}` (no hay columna de fecha de reunión), `{{residenciaFiscal5Anios}}`
(solo existe como opción de `Descarte`, no como dato), `{{rentasSujetas}}` y `{{modeloYPlazo}}` — estos
dos se derivan del bloque elegido, no del cliente, así que pueden ser tabla fija en código.

## 4. Verificar antes de construir
La fórmula **`AnioDesplazamiento` es `aiText`, no fórmula**, y se ha visto en
`state:"error", errorType:"emptyDependency"`. Si el informe la usa y está rota, el documento sale con
un hueco.

## 5. Coherencia con WP-239
El `ResumenBot` lleva una ficha con casi las mismas etiquetas que estos marcadores. **Si divergen,
habrá dos verdades.** Alimentar los dos del mismo sitio.

## 6. Verificación
Un recorrido completo genera el informe con el bloque correcto según las dos columnas de fórmula, los
17 marcadores resueltos y **ningún `{{...}}` literal** en el resultado.

## 7. Riesgo
Requiere **aprobación humana antes de enviarse**: es un documento que el cliente va a guardar.
