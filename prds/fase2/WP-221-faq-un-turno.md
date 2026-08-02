---
id: WP-221
title: "FAQ de un turno: Collect data + DC punto=faq_entrada + callback + botones WDONE"
status: specified
size: L
depends_on: [WP-211, WP-213, WP-218, WP-219, WP-220]
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-221 — FAQ de un turno

> DECISIÓN APROBADA (conflicto (b)): **el FAQ se construye, no se difiere**, pero en dos etapas
> medidas por evidencia. Etapa 1 = **FAQ de un turno por DC**, con el mecanismo **ya verificado en
> producción** (`Collect data` + DC + `wait_for_callback`, idéntico a `F`). Etapa 2 = multi-turno tras
> WP-10 (→ WP-228). Ambas comparten el mismo contrato de modo, así que no hay retrabajo.
> El bucle `W → WDONE → W` del flujo propuesto se **rechaza como diseño primario**: HECHO VERIFICADO,
> solo puede ejecutarse **un** workflow customer-facing a la vez y `wait_for_callback` es **un**
> callback por paso; y los reply buttons **no impiden** escribir en el composer, así que la mitigación
> sería probabilística.

## 1. Objetivo

Que el usuario pueda hacer una pregunta sobre el régimen, recibir respuesta del mismo agente sin
ninguna tool de escritura de expediente, y elegir explícitamente qué hacer después.

## 2. Alcance

**In:**
- `Set modo_bot=faq_regimen` (ya escrito por `AOPT`, WP-213).
- `Collect data` con la pregunta libre.
- DC con `punto=faq_entrada` y `wait_for_callback`.
- Respuesta del nodo FAQ del agente, con `buscar_contexto_fiscal`, `escalar_humano` y
  `registrar_optout` como únicas tools.
- Reply buttons `WDONE`: *otra pregunta* · *ya está, quiero empezar* · *hablar con una persona*.
  `WDONE` es un **botón**, nunca intención inferida por el LLM ni tool que fije el estado: si el LLM
  decide, elige su propio nivel de privilegio. El agente puede *proponer* (`sugerencia_modo` en su
  salida), no decidir.
- `faq_turnos_bot` incrementado por turno; `>= 3` → oferta de humano o de solicitud, y **no se sigue
  respondiendo**.

**Out:**
- Multi-turno por trigger de mensaje → WP-228 (depende de WP-10).
- El salto FAQ→solicitud → WP-229.
- Corte de contexto y enmascarado de PII → WP-222 (se construye inmediatamente después).

## 3. Dependencias

WP-211, WP-213, WP-218, WP-219, y **WP-220** (sin corpus aprobado el modo no es publicable).

## 4. Entregables

1. Rama FAQ publicada en el canvas con su DC.
2. Nodo FAQ del agente cableado con exactamente sus tres tools.
3. `faq_turnos_bot` con su tope.

## 5. Verificación

- Recorrido no-Preview completo: pregunta → respuesta del agente con cita → botones `WDONE`, con par
  (`conversation_id`, `execution_id`) y `x-intercom-source-dataconnector-id` no vacía.
- **10 prompts adversarios**: cero peticiones al webhook de upsert (gate compartido con WP-219).
- 30 preguntas doradas con el resultado esperado (gate compartido con WP-220).
- Al tercer turno FAQ, la respuesta es la oferta de humano/solicitud y no una respuesta más.
- `ticket.state` sin cambios en todo el recorrido.

## 6. Riesgo

Alto y de dos clases. Técnico: la cadena Intercom→n8n→API Intercom→LLM→callback contra el **timeout de
15 s del DC** (HECHO VERIFICADO), con un `Wait2 3s` ya dentro → medir p95 entre
`wait_for_callback_started` y `..._received`, responder 200 al webhook de inmediato y publicar por
callback. Legal: respuestas sin fuente → cubierto por WP-220.

## 7. Rollback

El IF de routing y la opción del menú son el feature flag: se retira la opción "Tengo preguntas" y la
rama queda inerte. Backup del canvas antes de publicar.
