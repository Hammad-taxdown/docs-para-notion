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

> **CORREGIDO 27/08/2026 — transporte B (WP-210 §2.2, reescrito el 26/08).** El mecanismo original de
> este PRD era el transporte A: derivar el modo del atributo persistido `modo_bot` leído por API.
> Vigente: el modo viaja como **input obligatorio de cada llamada al Data Connector** (valores
> `menu·solicitud·faq_regimen·calculadora·lead_potencial·humano`) y `Resolver_Modo` **valida ese
> input** contra la whitelist de WP-210 §2.1 — el fail-closed en memoria y el evento `modo_ausente`
> siguen igual, y siguen sin escribirse nunca. T081 (abierta, B pura recomendada): con **B pura** no
> se lee ningún atributo persistido; con **B híbrida** el atributo cubriría solo la reentrada, nunca
> la fuente de verdad del turno. Corregidos abajo §2 y §5.

## 1. Objetivo

Un único punto en n8n que determine el modo de cada turno, de forma determinista, auditable y sin
poder ser falsificado desde fuera.

## 2. Alcance

**In:**
- Nodo/subworkflow `Resolver_Modo`: valida el input `modo` que llega en la llamada del Data
  Connector contra la whitelist de WP-210 §2.1 y devuelve `{modo, origen, corr_id, part_id}`, **sin
  leer ningún atributo persistido** (corregido 27/08/2026; antes: leía `custom_attributes` por API,
  mecanismo verificado con `veredicto_f2` — transporte A. Solo si T081 sale B híbrida se leería el
  atributo, y únicamente para la reentrada).
- Fail-closed **en memoria** + evento `modo_ausente` al `errorWorkflow`, con contador diario.
- **Dedupe** por `conversation_part_id` (hoy `If2` es un *debounce*, no un dedupe: HECHO VERIFICADO) y
  descarte de toda part con id ≤ el último procesado.
- `cold_start` deja de calcularse como `!last_message_content` y pasa a derivarse del input `modo` +
  `punto` de la llamada del DC (corregido 27/08/2026; antes decía derivarse de `modo_bot` — WP-210
  §2.2).

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

- Llamada del DC **sin `modo`** o con valor fuera de la lista: el log muestra `modo=faq_regimen`,
  `origen=fail_closed`, aparece el evento `modo_ausente`, y **no se escribe nada** (corregido
  27/08/2026; antes medía el atributo `modo_bot` ausente y su vacío por `get_conversation` —
  transporte A).
- Llamada del DC con `modo=solicitud`: el log muestra `origen=input_dc` (corregido 27/08/2026; antes:
  `origen=atributo`).
- Llamada **sin procedencia de DC** con `modo=solicitud` falsificado: cae en fail-closed y el resolver
  devuelve **`faq_regimen`** más el evento `modo_ausente` (corregido 27/08/2026; la prueba original
  medía que el atributo ganaba al body falsificado — con el transporte B, las pruebas negativa y de
  falsificación son las ya escritas en WP-210 §5).
- Reenviar el mismo `conversation_part_id` dos veces: la segunda no produce respuesta al usuario.

## 6. Riesgo

El fail-closed puede **atrapar a usuarios legítimos** en modo FAQ: cualifican, el bot responde con
normalidad y el expediente nunca se escribe (modo de fallo silencioso MF2). Es exactamente la razón
por la que el fail-closed **emite aviso**: sin el evento no hay detección. Mitigación operativa:
revisión diaria del contador las primeras 2 semanas.

## 7. Rollback

Dejar `Resolver_Modo` `disabled` y volver al comportamiento actual (un solo modo de facto, agente sin
tools). `versionId` anotado.
