---
id: WP-202
title: "Prerrequisito P1: enchufar la red de errores (errorWorkflow, retryOnFail, onError)"
status: specified
size: S
depends_on: []
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-202 — P1: red de errores enchufada

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
