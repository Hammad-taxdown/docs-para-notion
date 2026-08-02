---
id: WP-232
title: "Runbook, inventario de automatizaciones y gates anti-reincidencia en el repo"
status: specified
size: S
depends_on: []
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-232 — Runbook, inventario y gates

> Los 18 mecanismos anti-reincidencia del Council no valen nada si viven solo en un documento de
> síntesis. Este WP los pone en el repo, donde se usan.
> Ejemplo de coste real de no tener el inventario con **capa**: `distribuidor - usuario envia mensaje`
> **no existe en n8n** — es un workflow de **Intercom** — y averiguarlo costó tiempo (HECHO VERIFICADO).

## 1. Objetivo

Que el diagnóstico, la publicación y el cierre de un WP sigan un procedimiento escrito, y que ninguna
automatización quede huérfana.

## 2. Alcance

**In:**
- `scripts/contract-test.sh` con los **6 curls** (4 puntos + `lead` + `faq_entrada`), incluido el caso
  `x-www-form-urlencoded` y un `punto` desconocido que debe dar 400. Es el único mecanismo que ha cazado
  bugs en este proyecto.
- `docs/runbook-turno-mudo.md` con 5 pasos en orden y la llamada MCP exacta de cada uno: 1) ¿`ticket ==
  null`? 2) ¿`Workflow: Preview == false`? 3) ¿ejecución en n8n con `corr_id`? 4) ¿el DC devolvió 200?
  5) ¿`wait_for_callback_webhook_received`?
- `docs/inventario-automatizaciones.md` con las **4 capas** (workflows de n8n — HECHO VERIFICADO: 289 en
  la instancia —, workflows de Intercom, Data Connectors, automatizaciones de Airtable) y, por pieza:
  id, dueño, activo, para qué y **capa**.
- Convención de nombres: prefijo `BECKHAM_` en n8n, `beckham_*` en DCs, sufijo `_bot` para estado
  conversacional y `_f2` para el cálculo, letra+punto en paths de Intercom. Renombrar
  `beckham_f2_plazo.`, `Airtable Upser Expediente`, `Webhook1`, `If2`, `Wait2`.
- `description` no vacía con dueño + PRD en cada workflow del bot (hoy `beckham_bot` la tiene `null`).
- Reglas de bitácora: un cambio + su prueba por entrada; hipótesis muertas; **regla 3×90** (3
  iteraciones o 90 min sin evidencia nueva → se ejecuta el experimento discriminante más barato);
  gate de dos fuentes; checklist de publicación.

**Out:**
- Ejecutar `/prd:map` o regenerar `docs/prds/map.html`: **fuera de alcance de este paquete**.

## 3. Dependencias

Ninguna.

## 4. Entregables

Los cuatro ficheros citados, más la convención y las reglas de bitácora en el PRD maestro.

## 5. Verificación

- `contract-test.sh` se ejecuta sin navegador y **falla** en rojo si se rompe el contrato (se comprueba
  rompiéndolo a propósito una vez).
- Consulta por MCP: **cero** workflows `BECKHAM_*` con `description` vacía, y ningún nombre fuera de la
  convención.
- El inventario indica la **capa** de cada pieza tocada en la sesión.
- Un diagnóstico real se cierra anotando **en qué paso del runbook falló**.

## 6. Riesgo

Bajo. El riesgo es que el runbook se escriba y no se use; el contrapeso es que el gate de cierre de
cualquier WP exige el paso anotado.

## 7. Rollback

No aplica: son documentos y un script. No tocan ningún sistema.
