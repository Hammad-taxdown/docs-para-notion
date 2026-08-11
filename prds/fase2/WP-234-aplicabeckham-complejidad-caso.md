---
id: WP-234
title: "AplicaBeckham y complejidad del caso, escritos por el agente"
status: building
size: M
depends_on: []
milestone: "Fase 2 conversacional — Expediente y documentos"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-234 — AplicaBeckham y complejidad del caso, escritos por el agente

> **MEDIO HECHO.** `AplicaBeckham` se cerró el 06/08 y funciona: lo escribe el validador solo con un
> **sí expreso** del cliente (`quiere_acogerse`), nunca por suposición del agente. **La parte de
> complejidad del caso NO está hecha.**

## 1. Objetivo
Que el expediente diga, escrito por el agente, si el cliente quiere acogerse y **cómo de complejo es
su caso**, para que Mobility priorice sin leerse la conversación entera.

## 2. Lo que ya está
`AplicaBeckham` (checkbox `fldm2Ebceab4IJeb7`). **Cuidado con lo que significa:** ese checkbox lo leen
**dos fórmulas de clasificación fiscal** (`Situación fiscal Anio Desplazamiento` y `AnioSiguiente`) —
marcado = *Régimen Especial (Beckham)*, sin marcar = *Residente Fiscal*. Por eso solo se marca con un
sí expreso.

## 3. Lo que falta
La señal de **complejidad del caso**. Hoy el prompt ya distingue «caso complejo» (que significa **una
llamada con el fiscal, NO descartar**), pero eso **no se persiste en ninguna columna**: se queda en la
conversación. Es el patrón de siempre — el dato existe y no llega a ninguna parte.

## 4. Verificación
Una conversación de caso complejo deja la señal en su columna, y una de caso simple no la deja.
Comprobado **en la celda**, no en el `ok:true`.

## 5. Riesgo
Campo nuevo = **tres sitios** (tool + validador + mapeo de Airtable). Olvidar el tercero falla en
silencio devolviendo `ok:true`.
