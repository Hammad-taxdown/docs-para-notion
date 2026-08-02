---
id: WP-205
title: "Prerrequisito P4: guarda de unicidad de UserId (count==0 crea · ==1 actualiza · >1 multi_match)"
status: specified
size: M
depends_on: [WP-201]
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-205 — P4: guarda de unicidad de `UserId`

> HECHOS VERIFICADOS: `UserId` **no es único** en `Empleados`; el nodo usa
> `matchingColumns:["UserId"]` con `typecast:true`; hay **3 de 6 filas sin `UserId`**, y
> `recSop5rTn99Qft0o` es `lead_potencial=true` **sin `UserId`** (ya irrecuperable por la clave).
> DECISIÓN APROBADA (unanimidad A1/A4/A5): la guarda es **prerrequisito de habilitar cualquier
> reintento de escritura**, no una mejora posterior.

## 1. Objetivo

Que ninguna escritura pueda actualizar la fila equivocada ni crear un duplicado, y que el caso
ambiguo sea visible en lugar de silencioso.

## 2. Alcance

**In:**
- `search` por `UserId` normalizado antes de escribir: `count==0` → crea · `count==1` → actualiza ·
  `count>1` → devuelve `{ok:false, resultado:"multi_match"}` y **no escribe**.
- `idem_key = sha1(user_id | punto | conversation_id)` guardada en `last_idem_key`; si coincide,
  `{ok:true, dedup:true}` **sin escribir**.
- Dos campos nuevos en `Empleados`: `last_idem_key`, `last_corr_id`.

**Out:**
- Deduplicación histórica de la base y dueño de la automatización ajena `wflo1oMmSWlcYsO3V` (que
  HECHO VERIFICADO reacciona a escrituras creando filas hijas) → fuera del bot, con dueño asignado.
- Identidad de reserva sin `user_id` → **decisión abierta U3** (bloquea el caso, no este WP).

## 3. Dependencias

WP-201 (sin body parseado no hay `user_id` que buscar).

## 4. Entregables

1. Guarda implementada en el escritor.
2. Campos `last_idem_key` y `last_corr_id` creados en `Empleados`.
3. Caso `multi_match` añadido a `contract-test.sh`.

## 5. Verificación

- Con un `user_id` presente en **dos** filas: la respuesta es `multi_match` y el
  **revision history de Airtable no registra ninguna escritura** en esa ventana.
- Con un `user_id` en una sola fila: actualiza esa fila y ninguna otra (diff campo a campo).
- Repetir el mismo payload dos veces: la segunda devuelve `dedup:true` y no cambia ninguna celda.

## 6. Riesgo

Medio: una normalización distinta a la que usa Airtable (espacios, mayúsculas) produciría
`count==0` y crearía duplicados justo en el WP que existe para evitarlos. Mitigación: fijar la
normalización por escrito y probarla con los `UserId` reales existentes.

## 7. Rollback

`versionId` anotado; se vuelve al `upsert` con `matchingColumns` sin guarda, dejando los reintentos
de escritura **desactivados**.
