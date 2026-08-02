---
id: WP-214
title: "Rama calculadora: enlace y botones de vuelta al menú, sin cerrar la conversación"
status: specified
size: S
depends_on: [WP-213]
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-214 — Rama calculadora

> POSIBLE ERROR DEL FLUJO PROPUESTO corregido: Intercom **no redirige el navegador** (HECHO
> VERIFICADO); manda un enlace o un botón-link. Y **no se cierra**: es el punto de máxima intención
> comercial, así que `Cerrar recorrido` del diagrama original se sustituye por fin de workflow con el
> hilo abierto y botones de vuelta.

## 1. Objetivo

Ofrecer la calculadora sin perder al usuario ni cerrar la conversación.

## 2. Alcance

**In:**
- Mensaje con el **enlace** a la calculadora + reply buttons de vuelta al menú.
- `Set modo_bot=calculadora`; fin de workflow, hilo abierto, **sin `Close`**.
- Vuelta al menú: reescribe `modo_bot` a vacío/centinela.

**Out:**
- Creación de expediente al usar la calculadora: **no** se crea salvo decisión expresa.
- Métrica de conversión del click: DESCONOCIDO si el click es observable desde el workflow
  (incógnita 10) → no se promete métrica.

## 3. Dependencias

WP-213.

## 4. Entregables

1. Paso de mensaje con enlace y botones de vuelta.
2. URL de la calculadora confirmada por el usuario.

## 5. Verificación

- Recorrido no-Preview: `modo_bot=calculadora` tras pulsar, `ticket` sin cambios, y la conversación
  **sigue abierta** (`state` distinto de `closed` en `get_conversation`).
- Pulsar "volver al menú" deja `modo_bot` vacío/centinela y vuelve a mostrar `AOPT`.

## 6. Riesgo

Bajo. Riesgo de producto: si el enlace abre en la misma pestaña, el usuario pierde el Messenger →
comprobar el comportamiento real del enlace en la prueba visual.

## 7. Rollback

Backup del canvas antes de publicar.
