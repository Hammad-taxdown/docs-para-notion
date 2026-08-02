---
id: WP-206
title: "Prerrequisito P5: whitelist de punto y de Descarte en n8n, y typecast a false"
status: specified
size: S
depends_on: [WP-201]
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-206 — P5: whitelist de `punto` y de `Descarte`

> HECHO VERIFICADO: el nodo de Airtable usa `typecast:true` → una errata en un single-select **crea
> una opción nueva** y Airtable no avisa. HECHO VERIFICADO: `Descarte` ya incluye `Otro/Incompleto`
> (corrige WP-02, que lo daba como pendiente).

## 1. Objetivo

Que ningún valor no listado pueda entrar en la taxonomía, y que el escritor lo rechace con 400 en
lugar de inventarse una opción.

## 2. Alcance

**In:**
- Whitelist de `punto`: `descarte_residencia | lead | cualifica | descarte_plazo | faq_entrada |
  autodescarte_declarado`. Valor no listado → **400** `{ok:false, resultado:"schema_error"}`.
- Whitelist de los valores válidos de `Descarte` (leídos del esquema real, no inventados).
- `typecast:false` **después** de que la whitelist esté activa.

**Out:**
- Nuevos valores de `punto` para funcionalidades pospuestas: se añaden en el WP que los necesite,
  nunca "por si acaso" (criterio anti-scope-creep nº3).

## 3. Dependencias

WP-201.

## 4. Entregables

1. Whitelist de `punto` y de `Descarte` en el escritor.
2. `typecast:false`.
3. Dos curls nuevos en `contract-test.sh` (punto desconocido, errata en `Descarte`).

## 5. Verificación

- `punto=inventado` → **400**, sin escritura.
- Errata en `Descarte` → **400**, y el recuento de opciones del single-select es **idéntico** antes y
  después de la sesión de pruebas.
- Los 6 `punto` válidos siguen devolviendo `ok:true`.

## 6. Riesgo

Bajo. Riesgo real: poner `typecast:false` **antes** de la whitelist convierte errores de dato en
errores de nodo sin mensaje claro. Orden obligatorio: whitelist primero.

## 7. Rollback

Volver a `typecast:true` y desactivar la whitelist; `versionId` anotado.
