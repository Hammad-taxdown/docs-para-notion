---
id: WP-208
title: "Prerrequisito P7: corr_id de extremo a extremo y nodo Log_Evento de 6 campos"
status: specified
size: M
depends_on: [WP-207]
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-208 — P7: `corr_id` en todo

> HECHO VERIFICADO: ningún artefacto lleva identificador de correlación; cruzar Intercom con n8n se
> hace **a ojo por timestamps**. INFERENCIA declarada: con el número de ramas que añade la Fase 2, la
> arquitectura nueva sería *más* difícil de depurar que la actual sin esto.

## 1. Objetivo

Que desde una fila de Airtable se llegue a la ejecución de n8n y a la conversación de Intercom **sin
buscar por hora**.

## 2. Alcance

**In:**
- `corr_id = {conversation_id}:{conversation_part_id}` (+`:{intento}` en reintentos). El reintento
  **reutiliza** el mismo `corr_id`; sirve además de clave de dedupe.
- Presencia obligatoria en: input del DC, cabecera `X-Beckham-Corr-Id`, nodo `Set_Corr` como primer
  nodo de cada rama, prefijo de todo `console.log`, campo `last_corr_id` de la fila, nota interna de
  Intercom.
- Nodo `Log_Evento` con **exactamente 6 campos**: `{corr_id, modo, punto, resultado, ms, dropped[]}`.
  **Prohibido** loguear el registro completo de Airtable o el body entero.
- Atributo `corr_id_bot` en la conversación.

**Out:**
- Alertas y métricas agregadas → WP-231.
- Desactivación del guardado de datos de ejecuciones exitosas → WP-231.

## 3. Dependencias

WP-207 (el escritor ya extraído es donde vive `last_corr_id`).

## 4. Entregables

1. `Set_Corr` en cada rama y `Log_Evento` de 6 campos.
2. `last_corr_id` escrito en la fila.
3. Nota interna en Intercom con el `corr_id` del turno.

## 5. Verificación

- Tomar **una** fila de Airtable modificada en la sesión y, con solo su `last_corr_id`, localizar la
  ejecución de n8n y la conversación de Intercom. Sin usar la hora.
- Inspección del log de una ejecución: aparecen los 6 campos y **no** aparece ningún objeto completo
  ni PII.
- En un reintento, el `corr_id` es el mismo con sufijo `:2`.

## 6. Riesgo

Bajo técnicamente; el riesgo es de disciplina: si una rama nueva se construye sin `Set_Corr`, la
trazabilidad se degrada en silencio. Mitigación: el gate de cierre de cualquier WP exige el `corr_id`
presente en los tres sistemas para el mismo caso.

## 7. Rollback

Los nodos `Set_Corr` y `Log_Evento` se pueden dejar `disabled` sin afectar a la lógica; `versionId`
anotado.
