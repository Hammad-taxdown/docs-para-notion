---
id: WP-238
title: "Fix de Decidir_Status: el Status final depende de motivo_cierre"
status: done
size: S
depends_on: []
milestone: "Fase 2 conversacional — Expediente y documentos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-238 — Fix de Decidir_Status: el Status final depende de motivo_cierre

> **SUPERADO (27/08/2026).** El arreglo de abajo fue real y funcionó, pero el `Decidir_Status`
> vigente lo supera dos veces: el **reparto del 19–21/08** — el peldaño de llamada se escribe
> **al ofrecer** la llamada (`SenalesComplejidad` no vacío), no solo con
> `motivo_cierre='Llamada agendada'` — y la **renumeración del 26/08** (hoy `3. Pendiente llamada
> TD`, `4. Pte hacer informe`, `5. Informe enviado`, con la guarda de solo-subir sobre la escalera
> nueva). Y el informe **ya se genera**: la subida a «Informe enviado» no espera a WP-236 — la hace
> el generador en `Marcar InformeListo`. Lo vigente: `docs/nodo-decidir-status-2026-08-26.js` con su
> puerta `docs/test-decidir-status.js` (28 comprobaciones). La tabla y el texto de abajo quedan
> intactos como historia del bug del 11/08.

> **PUBLICADO EL 11/08 Y SIN VERIFICAR EN CONVERSACIÓN**, por decisión del usuario. El diff estático
> prueba que el código es el que quisimos, **no** que el agente se comporte como esperamos.

## 1. El bug, confirmado
`Decidir_Status` hacía `else if (fields.AplicaBeckham === true) propuesto = '2. Pendiente llamada TD'`
y **no conocía `motivo_cierre`**. Así que **todo** cliente que quiere acogerse acababa en «pendiente
llamada», hubiera llamada o no.

**Evidencia:** conversación `215475438827585` del 11/08 — 5 de 5 documentos,
`MotivoCierre = Expediente completo`, y `Status` clavado en `2. Pendiente llamada TD`.

## 2. El arreglo
| `motivo_cierre` | Status |
|---|---|
| `Llamada agendada` | `2. Pendiente llamada TD` |
| `Expediente completo` | **`3. Pte hacer informe`** |

Sube a **`4. Informe enviado`** en cuanto `WP-236` genere el informe de verdad.

Se lee **primero** lo que llega en la llamada y, si no viene, lo que ya hay en la fila: el bot guarda de
forma **incremental** y el motivo puede haberse escrito en un turno anterior.

## 3. Cuidado al tocar este nodo
La escalera `ORDEN` lleva los nombres **copiados literales de Airtable**. Con `typecast: true` un
nombre mal escrito **no falla: crea una opción nueva** en la columna.

## 4. Lo que este parche NO arregla
La escalera **solo sube**. Un expediente ya cerrado en `2` se queda ahí: no habrá más turnos que lo
muevan. Si aparecen expedientes reales así, hay que subirlos a mano.

## 5. Verificación pendiente
Dos conversaciones: una que agenda llamada queda en `2`, otra que completa expediente queda en `3`.
**Comprobado en la celda, no en el `ok:true`.**
