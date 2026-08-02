---
id: WP-204
title: "Prerrequisito P3: systemMessage como expresión y purga de las tools fantasma del prompt"
status: specified
size: S
depends_on: []
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-204 — P3: el prompt deja de mentir

> HECHOS VERIFICADOS (2026-07-29): (1) el `systemMessage` del `AI Agent` **no es expresión** (no
> empieza por `=`) → `{{contexto}}`, `{{current_date}}` y `{{user_plan_tax_return}}` llegan
> **literales** al modelo; (2) el prompt **nombra tres tools que no existen**
> (`guardar_datos_airtable`, `agendar_llamada`, `transferir_humano`) → el agente **promete acciones
> que nadie ejecuta**; (3) el prompt se contradice sobre HTML; (4) el `AI Agent` vivo tiene **cero
> aristas `ai_tool`** → coste de migración del aislamiento: cero.
>
> Sin esto, un fallo de allowlist es **indistinguible** de una alucinación, y el modo FAQ es
> inauditable e impublicable.

## 1. Objetivo

Que el prompt final que recibe el modelo sea observable en el log, con las variables resueltas, y que
no mencione ninguna acción que el agente no pueda ejecutar.

## 2. Alcance

**In:**
- `systemMessage` a expresión (prefijo `=`) en el nodo de agente vivo.
- Purga de las tres tools inexistentes del texto del prompt.
- Resolver la contradicción del HTML (una sola instrucción de formato, coherente con el `replace` del
  callback).
- `maxIterations` fijado explícitamente.

**Out:**
- El segundo nodo de agente y el `prompt_base` compartido → WP-218.
- Construcción de tools reales → WP-219, WP-220, WP-223.
- `returnIntermediateSteps`: **no** se activa aquí (reintroduce PII en logs, ver WP-231).

## 3. Dependencias

Ninguna. Cambio único con su prueba (sesión 2 de la secuencia aprobada).

## 4. Entregables

1. `systemMessage` como expresión, con `current_date` resuelto.
2. Prompt sin menciones a tools no conectadas.
3. `maxIterations` con valor explícito anotado en la bitácora.

## 5. Verificación

- En el log de una ejecución **no-Preview**, el prompt final muestra la fecha real y el bloque de
  contexto **resuelto**, no `{{current_date}}`.
- `grep` del prompt: cero apariciones de `guardar_datos_airtable`, `agendar_llamada`,
  `transferir_humano`.
- Conteo de aristas `ai_tool` del nodo por MCP = número de tools nombradas en el prompt.

## 6. Riesgo

Medio: una expresión mal escrita rompe el agente entero (el nodo falla o el prompt queda vacío) y el
agente **sigue contestando de forma plausible**. Detección: leer el prompt final en el log, no la
respuesta al usuario.

## 7. Rollback

`versionId` anotado antes del cambio; el `systemMessage` anterior se pega íntegro en la bitácora.
