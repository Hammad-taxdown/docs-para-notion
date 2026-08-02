---
id: WP-201
title: "Prerrequisito P0: parsear el body urlencoded del Data Connector en el escritor único"
status: specified
size: S
depends_on: []
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-201 — P0: parseo del body urlencoded en el escritor único

> **Bloqueante absoluto de la Fase 2.** HECHO VERIFICADO (2026-07-29, dos agentes de forma
> independiente citando el código): `Validar y Normalizar` de `beckham_bot` empieza con
> `const body = $input.first().json.body || {};` y **no hay ni un `JSON.parse` en ningún nodo Code
> del workflow**. Las llamadas del DC llegan como `application/x-www-form-urlencoded` con el JSON
> **como clave** del body → `body.user_id` es `undefined` → `Respond Error`.
> Consecuencia (INFERENCIA directa del hecho anterior): hoy fallan las 4 ramas de WP-06 y también
> todas las ramas de persistencia de la Fase 2 (`punto=lead`, `punto=faq_entrada`,
> `punto=autodescarte_declarado`).

## 1. Objetivo

Que una llamada del DC con `Content-Type: application/x-www-form-urlencoded` y el JSON como clave
única del body sea aceptada por el escritor único y devuelva `ok:true` con `record_id`.

## 2. Alcance

**In:**
- En `Validar y Normalizar`: si `$input.first().json.body` tiene **una sola clave** y esa clave parsea
  como JSON, usar el resultado del `JSON.parse`; si no, usar `body` tal cual (fallback a JSON nativo).
- Devolver `400` con `{ok:false, resultado:"schema_error", campos:[...]}` cuando falten `user_id` o
  `intercom_conversation_id` tras el parseo.
- Un solo cambio, con su prueba, sin tocar ningún otro nodo.

**Out:**
- Whitelist de `punto` → WP-206. Guarda de unicidad → WP-205. Auth → WP-203.
- Extracción a subworkflow → WP-207 (este WP se aplica sobre el nodo donde vive hoy).

## 3. Dependencias

Ninguna. Es el primer paso de la secuencia aprobada (DECISIÓN APROBADA, síntesis §13.1).

## 4. Entregables

1. Nodo `Validar y Normalizar` con el parseo defensivo.
2. `scripts/contract-test.sh` con los 2 curls mínimos (json y urlencoded) y su salida esperada.
3. Entrada de bitácora con un cambio y su prueba.

## 5. Verificación

- `curl -H 'Content-Type: application/x-www-form-urlencoded' --data '{"user_id":"…","intercom_conversation_id":"…","punto":"lead"}'`
  devuelve **`ok:true`** con `record_id`, y **no** `user_id_or_conversation_id_missing`.
- El mismo payload con `Content-Type: application/json` sigue devolviendo `ok:true` (no regresión).
- Un body sin `user_id` devuelve **400** con `resultado:"schema_error"`.

## 6. Riesgo

Bajo y acotado a n8n. Riesgo real: aplicar este cambio junto con otro y no saber cuál arregló qué
(mecanismo anti-reincidencia nº6: dos cambios y una sola prueba ⇒ la prueba no cuenta).

## 7. Rollback

Anotar el `versionId` de `nhOwpiGxikeU5DLR` antes de tocar y restaurarlo. El nodo original no se
borra: se conserva su código en la entrada de bitácora.
