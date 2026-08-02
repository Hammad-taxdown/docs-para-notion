---
id: WP-218
title: "Aislamiento topológico: dos nodos AI Agent con prompt_base y modelo compartidos"
status: specified
size: M
depends_on: [WP-204, WP-211]
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-218 — Dos nodos, un solo agente

> DECISIÓN APROBADA: **un mismo agente, aislamiento por topología** (patrón P2). HECHO VERIFICADO: el
> nodo `agent` v3.1 **no expone ningún parámetro de selección de tools** — las tools son aristas
> `ai_tool` del grafo, así que **no existe allowlist dinámica**. "Mismo agente" se cumple como misma
> identidad: bloque `prompt_base` único y versionado, mismo sub-nodo de modelo (`David Beckham`,
> `lmChatOpenAi`), mismo conocimiento, mismo hilo. Lo único que cambia es el **conjunto de aristas
> `ai_tool`** y un bloque corto `prompt_modo`.
> Sujeto a la decisión abierta **M5** (lectura literal o funcional de "el mismo agente"): si el manager
> exige un solo nodo, se degrada a P3 puro **documentando por escrito la fuga de intención**.

## 1. Objetivo

Que el modo determine qué tools **existen** para el agente, sin depender de que el LLM obedezca.

## 2. Alcance

**In:**
- Un nodo `Set` como **única fuente** del `prompt_base`, leído por los dos nodos de agente.
- Nodo FAQ y nodo Solicitud, con el mismo sub-nodo de modelo.
- IF sobre `modo_bot` (salida de `Resolver_Modo`) que elige el nodo.
- `maxIterations` fijado **explícitamente en los dos**.
- `systemMessage` como expresión en **los dos** (extiende WP-204).

**Out:**
- Las tools en sí → WP-219, WP-220, WP-223.
- El corte de contexto → WP-222.

## 3. Dependencias

WP-204 (prompt saneado), WP-211 (el IF necesita el resolver).

## 4. Entregables

1. Los dos nodos de agente cableados desde el IF.
2. `prompt_base` en un solo nodo `Set`, versionado en el repo.
3. Diff automático del bloque común documentado como comprobación.

## 5. Verificación

- **Conteo de aristas `ai_tool` del grafo** por MCP: coincide con la matriz de tools por modo. Se
  verifica contando aristas, **no leyendo el prompt**.
- El prompt final de **ambos** nodos aparece en el log con las variables resueltas.
- El prompt de cada modo **no nombra ninguna tool no conectada a su nodo** (`grep` cruzado con el
  conteo de aristas).
- Con `modo_bot=faq_regimen` la ejecución pasa por el nodo FAQ; con `solicitud`, por el otro.

## 6. Riesgo

**Deriva de prompt entre los dos nodos** (modo de fallo MF5): se cambia uno y no el otro, y el que
queda roto **sigue contestando de forma plausible**. Mitigación: `prompt_base` en un solo nodo `Set`,
un solo fichero fuente versionado y diff automático del bloque común. Contingencia: volver a un solo
nodo (P3 puro) aceptando la fuga de intención por escrito.

## 7. Rollback

El nodo Solicitud se deja `disabled` y el IF pasa todo al nodo FAQ (mínimo privilegio).
`versionId` anotado.
