---
id: WP-217
title: "Handoff en frío de G: inputs de último mensaje a Optional y asignación al team del bot"
status: specified
size: M
depends_on: [WP-216]
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-217 — Handoff en frío de `G`

> HECHO VERIFICADO (conv. `215475260478265`): el DC `n8n_bot_mobility` **FALLÓ** con
> `Request validation error: Last comment: Body, Conversation part: Id missing`, y hubo **cero
> ejecuciones** en n8n. HECHO VERIFICADO: `Required` en un input de DC es **condición de ejecución**, y
> un input **no textual no puede ser opcional** en Intercom.
> El flujo propuesto da este handoff por bueno; no lo es. El problema no es el orden de
> `Pass to n8n` y `Assign`, es el **contrato de inputs contra `Required`**.

## 1. Objetivo

Que el handoff funcione en arranque en frío, cuando todavía no existe un "último mensaje" del usuario.

## 2. Alcance

**In:**
- Inputs de "último mensaje" a **`Optional`**, con paso previo Number→Text donde el tipo lo impida.
- Alternativa si `Optional` no es posible: **DC dedicado de arranque en frío**, con su propio contrato.
- Asignar al **team del bot**, no a Ops, salvo escalado explícito.
- Invariante: **`G`/`GEND` no cierra** — el hilo sigue abierto para el resto de la solicitud.

**Out:**
- El escalado humano → WP-223.
- Multi-turno posterior al handoff → WP-228.

## 3. Dependencias

WP-216 (canvas ya saneado).

## 4. Entregables

1. Inputs del DC reconfigurados (o DC de arranque en frío creado).
2. Asignación al team del bot.
3. Contrato de inputs escrito en el PRD maestro.

## 5. Verificación

- Recorrido `en_plazo` no-Preview desde cero (sin ningún mensaje previo del usuario): el DC devuelve
  **success**, aparece **una ejecución en n8n** con `x-intercom-source-dataconnector-id` no vacía, y el
  agente publica su mensaje.
- `get_conversation`: la conversación **no está cerrada** y está asignada al team del bot.

## 6. Riesgo

Medio: si ni `Optional` ni el DC dedicado resuelven el caso, el arranque en frío sigue roto y el modo
solicitud no llega al agente. En ese caso el WP se cierra como BLOQUEO con la evidencia, no con un
apaño.

## 7. Rollback

Backup del canvas; el DC anterior se conserva sin conectar.
