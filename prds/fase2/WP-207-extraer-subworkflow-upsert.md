---
id: WP-207
title: "Prerrequisito P6: extraer BECKHAM_upsert_expediente a subworkflow propio"
status: specified
size: M
depends_on: [WP-201, WP-205, WP-206]
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-207 — P6: `BECKHAM_upsert_expediente` como subworkflow

> Tres beneficios concretos (DECISIÓN APROBADA, síntesis §2 P6): vuelve el upsert **editable por
> MCP** (hoy imposible por las credenciales del workflow monolítico), permite que las tools sean
> `Call n8n Workflow Tool` — que **no pasan por HTTP urlencoded**, esquivando la clase de bug de
> WP-201 — y evita la reentrada del workflow sobre sí mismo.

## 1. Objetivo

Un único escritor de `Empleados`, invocable como subworkflow, con contrato versionado y sin pasar por
HTTP para las llamadas internas.

## 2. Alcance

**In:**
- Subworkflow `BECKHAM_upsert_expediente` con `description` no vacía (dueño + PRD dentro).
- Entrada por `workflowInputs.defineBelow`: `user_id`, `intercom_conversation_id`, `punto`, `modo`,
  `corr_id`, `idem_key` + los campos de expediente.
- Contrato en `docs/contratos/upsert_expediente.v1.json` (JSON Schema) y versión en el path (`/v1`).
- El webhook público sigue existiendo para el DC, y **delega** en el subworkflow: una sola
  implementación de la lógica.
- Enum cerrado de `resultado` y campo `dropped[]` en la respuesta (ningún `ok:true` que signifique
  "no hice nada").

**Out:**
- Guarda de `modo` en el borde de las tools → WP-219.
- Semántica de reset por `punto` → WP-226.

## 3. Dependencias

WP-201, WP-205, WP-206 (se extrae ya saneado, no se extrae y luego se arregla).

## 4. Entregables

1. Subworkflow creado, activo, con `errorWorkflow` enchufado.
2. `beckham_bot` llamando al subworkflow en lugar de escribir directamente.
3. JSON Schema del contrato en el repo.

## 5. Verificación

- `contract-test.sh` (6 curls: 4 puntos + `lead` + `faq_entrada`, incluido el caso urlencoded y un
  `punto` desconocido que debe dar 400) **verde** contra el nuevo camino.
- Una llamada directa al subworkflow por `execute_workflow` con un body inválido devuelve
  `400 {ok:false, resultado:"schema_error", campos:[...]}`.
- MCP puede leer y actualizar el subworkflow (comprobado con `get_workflow_details`).

## 6. Riesgo

Medio-alto: es el WP que toca la ruta de escritura completa. Riesgo de quedarse con **dos**
implementaciones (la vieja en `beckham_bot` y la nueva) → habría dos escritores, que es exactamente
lo que el diseño prohíbe. Mitigación: los nodos viejos quedan `disabled`, no borrados, y el gate
exige que el `contract-test.sh` pase por el camino nuevo.

## 7. Rollback

Rehabilitar los nodos `disabled` de `beckham_bot` y despublicar el subworkflow. `versionId` anotado
de los dos workflows.
