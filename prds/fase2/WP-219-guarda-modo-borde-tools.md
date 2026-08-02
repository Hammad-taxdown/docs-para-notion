---
id: WP-219
title: "Guarda de modo en el borde de cada tool de escritura (capa 2) y whitelist en el escritor (capa 3)"
status: specified
size: M
depends_on: [WP-207, WP-211, WP-218]
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-219 — Guarda en el borde de las tools de escritura

> Tres capas. Capa 1 = la arista `ai_tool` **no existe** (WP-218). Capa 2 = guarda en el primer nodo
> del subworkflow-tool, con `modo` y `conversation_id` fijados por `workflowInputs.defineBelow` y
> **jamás por `$fromAI`**. Capa 3 = whitelist de `punto` **y** `modo` en el escritor único, 400 ante
> desconocido.
> Se declara honestamente que las capas 2 y 3 **comparten origen** con la 1 (la salida del resolver):
> protegen contra **errores de cableado**, no contra un resolver equivocado. La defensa realmente
> independiente es la topológica.

## 1. Objetivo

Que ninguna tool de escritura pueda ejecutarse con un modo que no la tiene permitida, ni con
parámetros que el LLM haya podido elegir.

## 2. Alcance

**In:**
- Primer nodo de cada tool de escritura: comprueba `modo ∈ allowlist` y aborta con
  `{ok:false, resultado:"modo_no_permitido"}`.
- `modo` y `conversation_id` como `workflowInputs.defineBelow`, **nunca `$fromAI`**.
- El escritor único valida `punto` **y** `modo`, y devuelve 400 ante combinación no listada.
- Las tools se montan como `Call n8n Workflow Tool` sobre `BECKHAM_upsert_expediente`, **nunca HTTP al
  propio webhook** (evita la reentrada y el problema del content-type).

**Out:**
- `generar_informe` / `enviar_reporte`: **no se montan en Fase 2** (contrato sin cerrar, WP-09 §4).
- `pedir_datos_personales`: **no es una tool** — preguntar es escribir un mensaje; modelarlo como tool
  convertiría el prompt en la allowlist, que es justo lo prohibido.

## 3. Dependencias

WP-207, WP-211, WP-218.

## 4. Entregables

1. Guarda implementada en cada tool de escritura.
2. Matriz `punto × modo` en el escritor.
3. Script de los **10 prompts adversarios** en el repo.

## 5. Verificación

- **10 prompts adversarios** en modo FAQ intentando que escriba → **cero** peticiones al webhook de
  upsert (contadas en las ejecuciones de n8n, no en la respuesta al usuario).
- Llamada manual a una tool de escritura con `modo=faq_regimen` → `modo_no_permitido`, sin escritura
  (diff de la fila).
- `punto=cualifica` con `modo=faq_regimen` → **400** en el escritor.

## 6. Riesgo

Medio: la guarda puede dar falsa confianza. El riesgo declarado es un **resolver equivocado**, contra
el que ninguna de las tres capas protege. Mitigación: el evento `modo_ausente` y la auditoría del
dueño único por transición (WP-210, WP-211).

## 7. Rollback

Dejar la guarda en modo "solo log" no es aceptable: si la guarda se retira, se retira también la tool.
`versionId` anotado.
