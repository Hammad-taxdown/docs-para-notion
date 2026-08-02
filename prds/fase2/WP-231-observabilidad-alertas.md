---
id: WP-231
title: "Observabilidad: alertas accionables, métricas etiquetadas con corr_id y PII fuera de los logs"
status: specified
size: M
depends_on: [WP-208]
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-231 — Observabilidad y alertas

> Todas las métricas de este WP son **PROPUESTA**: hoy **no se mide nada de esto** y no hay línea base.
> Ninguna cifra objetivo se fija aquí — la fijaría el manager. **No se cita ningún límite de plan o de
> API sin fuente**: los planes contratados de Intercom, n8n y Airtable son DESCONOCIDO.

## 1. Objetivo

Que los cinco modos de fallo caros del diseño sean detectables sin leer conversaciones a mano, y que
ningún log contenga PII.

## 2. Alcance

**In — alertas accionables (no ruido):**
- Fallo de escritura · `multi_match` · **`modo_ausente`** (el detector del fail-closed silencioso) ·
  `wait_for_callback` expirado · fallo del scheduler si llega a existir.

**In — métricas [PROPUESTA], todas etiquetadas con `corr_id`:**
- Recorridos que llegan a estado terminal declarado (cualifica/descarte/lead/humano) frente a abandonos.
- Reparto de entradas por opción de `AOPT`.
- Turnos medios en modo FAQ y % que agota el tope de 3.
- % de respuestas FAQ con cita frente a `no_cubierto` frente a escalado.
- % de escalados y tiempo hasta primera respuesta humana — **requiere un SLA de `Ops_Mobility`, hoy
  DESCONOCIDO** (M6).
- `tokens_in/out` por turno y por modo (proxy de coste; el coste en euros es DESCONOCIDO sin conocer
  modelo y plan).
- Recuento de `modo_ausente`, de `multi_match` y de filas sin `UserId`.
- p95 entre `wait_for_callback_started` y `..._received` (margen contra el timeout de 15 s).

**In — PII:**
- Desactivar el guardado de datos de ejecuciones exitosas en n8n.
- `returnIntermediateSteps` **no** se activa: reintroduce PII en los logs. La PII de `Respond OK` está
  *movida*, no resuelta.

**Out:**
- Tracing tipo LangSmith: DESCONOCIDO si está disponible en esta instancia (incógnita 17).

## 3. Dependencias

WP-208 (`corr_id` y `Log_Evento`).

## 4. Entregables

1. Las cinco alertas configuradas sobre `Notificaciones_error`.
2. Panel o consulta con las métricas propuestas.
3. Guardado de datos de ejecuciones exitosas desactivado.

## 5. Verificación

- Provocar cada uno de los cinco casos de alerta: **cinco** notificaciones, cada una identificable por
  su `corr_id`.
- Inspección de una ejecución exitosa: **no** se conservan datos de nodos, y ningún log contiene NIE,
  IBAN, teléfono, email ni el registro completo de Airtable.
- Cada métrica se puede calcular a partir de `Log_Evento` sin abrir una conversación.

## 6. Riesgo

Bajo, con una trampa: activar trazabilidad del agente reintroduce PII. Declarado, y por eso
`returnIntermediateSteps` queda fuera.

## 7. Rollback

Las alertas se desactivan una a una; nada depende de ellas para funcionar.
