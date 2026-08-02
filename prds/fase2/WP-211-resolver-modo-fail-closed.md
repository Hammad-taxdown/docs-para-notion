---
id: WP-211
title: "Resolver_Modo: derivación server-side del modo, fail-closed en memoria y evento modo_ausente"
status: specified
size: M
depends_on: [WP-208, WP-210]
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-211 — `Resolver_Modo`

> DECISIÓN APROBADA: el modo se **deriva server-side** de la API de Intercom con credencial, nunca del
> body del webhook (HECHO VERIFICADO: público y falsificable). Ante modo ausente o desconocido se
> aplican **dos cosas a la vez**: allowlist de mínimo privilegio (`faq_regimen`) en memoria y
> re-oferta del menú al usuario, más un evento estructurado `modo_ausente`. **El fail-closed nunca se
> escribe en el atributo.**

## 1. Objetivo

Un único punto en n8n que determine el modo de cada turno, de forma determinista, auditable y sin
poder ser falsificado desde fuera.

## 2. Alcance

**In:**
- Nodo/subworkflow `Resolver_Modo`: lee `custom_attributes` por API (mecanismo ya verificado con
  `veredicto_f2`), devuelve `{modo, origen, corr_id, part_id}`.
- Fail-closed **en memoria** + evento `modo_ausente` al `errorWorkflow`, con contador diario.
- **Dedupe** por `conversation_part_id` (hoy `If2` es un *debounce*, no un dedupe: HECHO VERIFICADO) y
  descarte de toda part con id ≤ el último procesado.
- `cold_start` deja de calcularse como `!last_message_content` y pasa a derivarse de `modo_bot` +
  `punto`.

**Out:**
- Escritura del modo por el canvas → WP-212, WP-213.
- El IF de routing entre nodos de agente → WP-218.

## 3. Dependencias

WP-210 (contrato), WP-208 (`corr_id` para el log del evento).

## 4. Entregables

1. `Resolver_Modo` implementado y llamado antes del ensamblador de prompt.
2. Evento `modo_ausente` visible en `Notificaciones_error`.
3. Dedupe por `conversation_part_id` activo.

## 5. Verificación

- Conversación con `modo_bot` **ausente**: el log muestra `modo=faq_regimen`, `origen=fail_closed`,
  aparece el evento `modo_ausente`, y el atributo **sigue vacío** después (comprobado por
  `get_conversation`).
- Conversación con `modo_bot=solicitud`: el log muestra `origen=atributo`.
- Body del webhook con `modo=solicitud` falsificado y atributo `faq_regimen`: el resolver devuelve
  **`faq_regimen`**.
- Reenviar el mismo `conversation_part_id` dos veces: la segunda no produce respuesta al usuario.

## 6. Riesgo

El fail-closed puede **atrapar a usuarios legítimos** en modo FAQ: cualifican, el bot responde con
normalidad y el expediente nunca se escribe (modo de fallo silencioso MF2). Es exactamente la razón
por la que el fail-closed **emite aviso**: sin el evento no hay detección. Mitigación operativa:
revisión diaria del contador las primeras 2 semanas.

## 7. Rollback

Dejar `Resolver_Modo` `disabled` y volver al comportamiento actual (un solo modo de facto, agente sin
tools). `versionId` anotado.
