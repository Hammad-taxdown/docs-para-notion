---
id: WP-202
title: "Prerrequisito P1: enchufar la red de errores (errorWorkflow, retryOnFail, onError)"
status: done
size: S
depends_on: []
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-202 — P1: red de errores enchufada

> **NOTA DEL 11/08/2026 · **CERRADO.** Se dio por hecho el 01/08 y **estaba a 1 de 4**; se completó y se probó de verdad el 06/08. El `errorWorkflow` con avisos a Slack funcionó en real (el 400 de `gpt-5.6-terra` llegó a Slack: el fallo no fue silencioso), y después entraron `onError: continueErrorOutput` en el nodo de Airtable con su rama, el tag `beckham_persistencia_fallida`, `maxTries: 3` y el enum cerrado de `resultado`. **`WP-205` era precondición dura de los reintentos y ya está cerrada.** Frontmatter sincronizado el 11/08.**

> HECHO VERIFICADO: `beckham_bot` no tiene `settings.errorWorkflow`; el nodo de Airtable no tiene
> `retryOnFail` ni `onError`; y `Notificaciones_error` (`TXVWRUzc1G5HXHjZ`) **existe y está activo**.
> Es configuración, no construcción.

## 1. Objetivo

Que ningún fallo de escritura o de lectura de Intercom quede silencioso: todo fallo produce una
notificación y un `resultado` del enum cerrado.

## 2. Alcance

**In:**
- `settings.errorWorkflow = TXVWRUzc1G5HXHjZ` en `beckham_bot` (y, tras WP-207, en el subworkflow).
- `retryOnFail: true` con `maxTries: 3` en el nodo de Airtable y en `Traer_Conversacion_intercom1`.
- `onError: continueErrorOutput` en el nodo de Airtable, con rama que pone el tag
  `beckham_persistencia_fallida` y **no miente al usuario**.
- Enum cerrado `resultado ∈ {ok, dedup, schema_error, no_match, multi_match, airtable_error}`
  devuelto en el body.

**Out:**
- Alertas y métricas agregadas → WP-231.
- Reintentos de **escritura** habilitados: prohibidos hasta WP-205 (guarda `count==1`).

## 3. Dependencias

Ninguna. Se puede hacer en la misma sesión que WP-201, como cambio separado con su prueba.

## 4. Entregables

1. `settings.errorWorkflow` enchufado.
2. `retryOnFail` + `onError` configurados en los dos nodos citados.
3. Rama de error con el tag y el mensaje honesto.

## 5. Verificación

- Provocar un fallo de Airtable (credencial inválida temporal) y comprobar que aparece **una
  ejecución de `Notificaciones_error`** correlacionada por `corr_id` o, si WP-208 aún no está,
  por `execution_id`.
- La respuesta al DC en ese caso trae `resultado:"airtable_error"` y la conversación queda con el tag
  `beckham_persistencia_fallida`.
- Ninguna respuesta con `ok:true` corresponde a una ejecución que no escribió nada.

## 6. Riesgo

Bajo. Riesgo residual: `retryOnFail` sobre una **escritura** con `UserId` no único crearía
duplicados → por eso los reintentos de escritura no se habilitan hasta WP-205.

## 7. Rollback

Quitar los tres campos (`errorWorkflow`, `retryOnFail`, `onError`) y restaurar `versionId`.


---

## 8. Estado real · auditado el 2026-08-05 por MCP

**status: building — 1 de 4 entregables.** Lo auditado en `nhOwpiGxikeU5DLR`:

| Entregable | Estado real |
|---|---|
| `settings.errorWorkflow` | ✅ **enchufado, pero a otro destino**: `BJfExmwu1fI1aPpY` (`beckham_alertas`, construido el 1/08), no `TXVWRUzc1G5HXHjZ`. El PRD queda corregido: el destino válido es `beckham_alertas`, que tiene Error Trigger + Execute Workflow Trigger |
| `retryOnFail` + `maxTries: 3` | ⚠️ **a medias**: `Traer_Conversacion_intercom1` tiene `retryOnFail: true` **sin `maxTries`**. `Airtable Upser Expediente` y `Buscar Expediente en Airtable` **no tienen ninguno de los dos** |
| `onError: continueErrorOutput` + rama con tag `beckham_persistencia_fallida` | ❌ **no existe**. El nodo de Airtable no tiene `onError`. Un fallo de Airtable hoy tumba la ejecución y **no hay rama que avise al usuario sin mentirle** |
| Enum cerrado `resultado` | ❌ **no existe**. `Respond OK` devuelve `{ok:true, action:'upserted', record_id, descartados}` y `Respond Error` devuelve `{ok:false, error}`. No hay campo `resultado` en ninguna respuesta |

**Precondición que sigue vigente:** los reintentos de **escritura** no se habilitan hasta WP-205
(guarda de unicidad de `UserId`), porque `retryOnFail` sobre un upsert con `UserId` no único
duplicaría filas.
