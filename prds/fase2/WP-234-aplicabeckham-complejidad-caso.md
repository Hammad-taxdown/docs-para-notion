---
id: WP-234
title: "AplicaBeckham y complejidad del caso, escritos por el agente"
status: done
size: M
depends_on: []
milestone: "Fase 2 conversacional — Expediente y documentos"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-234 — AplicaBeckham y complejidad del caso, escritos por el agente

> **SUPERADO (27/08/2026) — cerrado del todo, no «medio hecho».** La señal de complejidad **sí se
> persiste** desde el **12/08** en la columna **`SenalesComplejidad`** (`fldosgrMoor8q8PiK`,
> `multipleSelects` con las 7 señales del Bloque 6): la escribe el validador, y desde el **21/08** es
> la que dispara el peldaño «Pendiente llamada TD» al **ofrecer** la llamada. Las frases de abajo
> («la parte de complejidad NO está hecha», «no se persiste en ninguna columna») describen el estado
> anterior al 12/08 y quedan como historia. Lo vigente: el reparto de Status de `CLAUDE.md` §4 y la
> bitácora `.spartax/log.md`.

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
