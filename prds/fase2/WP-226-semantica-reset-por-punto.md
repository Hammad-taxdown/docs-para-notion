---
id: WP-226
title: "Semántica de reset por punto: qué pone y qué borra a propósito cada punto de escritura"
status: specified
size: L
depends_on: [WP-207, WP-215, WP-224]
milestone: "Fase 2 conversacional — Leads"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-226 — Semántica de reset por `punto`

> HECHO VERIFICADO: **ninguna rama limpia las marcas de otra**. `recKZg6HkEYxLocIz` tiene
> `alta_ss=true` + `Descarte` + `fecha_prevista_alta` **simultáneos**. Sin esta semántica, ese estado
> es **el normal, no la excepción**.
> DESCONOCIDO (incógnita 8): si el `undefined` de un campo no mapeado **pisa** la celda en Airtable —
> avalado solo por curl, no por diseño. **Hasta medirlo se trata como que sí pisa.**

## 1. Objetivo

Que cada `punto` declare explícitamente qué campos pone y qué campos borra, y que ninguna rama pise
datos de otra por omisión.

## 2. Alcance

**In:**
- Tabla `punto × campo` con tres valores por celda: *escribe* · *borra a propósito* · *no toca*.
  Para los 6 puntos: `descarte_residencia`, `lead`, `cualifica`, `descarte_plazo`, `faq_entrada`,
  `autodescarte_declarado`.
- Implementación en el escritor único: los campos "no toca" **no se envían**; los "borra a propósito"
  se envían vacíos explícitamente.
- Medición de la incógnita 8: matriz de curls por punto sobre una fila **precargada**, con diff campo a
  campo antes/después.
- Invariante: `dias_pasados` **no se persiste** — es un derivado que caduca cada día, y persistirlo
  garantiza un dato falso; el mensaje de `N` lo recalcula.

**Out:**
- Deduplicación histórica de la base → fuera del bot, con dueño asignado.
- Idempotencia (`idem_key`, guarda `count==1`) → WP-205, ya cerrado antes.

## 3. Dependencias

WP-207, WP-215, WP-224 (los seis puntos deben existir para poder declarar su semántica).

## 4. Entregables

1. Tabla `punto × campo` publicada en el PRD maestro.
2. Escritor único que la respeta.
3. Resultado medido de la incógnita 8, escrito en la bitácora.

## 5. Verificación

- Matriz de curls: para cada `punto`, el diff campo a campo de una fila precargada coincide
  **exactamente** con la tabla. Cualquier campo modificado que la tabla marque "no toca" hace fallar
  el WP.
- Caso `recKZg6HkEYxLocIz`: tras aplicar `punto=cualifica`, la fila **no** queda con `Descarte` y
  `alta_ss=true` a la vez.
- Ninguna respuesta contiene `dias_pasados` persistido.

## 6. Riesgo

Alto: es el WP con más superficie de dato y el que puede **borrar** `fecha_alta_ss` de quien ya
cualificó si se declara mal una celda. Mitigación: se mide antes de implementar, y la contingencia es
el revision history de Airtable.

## 7. Rollback

El escritor vuelve a enviar solo los campos mapeados (comportamiento actual), y la tabla queda como
documento. `versionId` anotado.
