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

> **CORREGIDO 27/08/2026 — transporte B (WP-210 §2.2, reescrito el 26/08).** El `Set
> modo_bot=calculadora` y la vuelta a vacío/centinela eran transporte A. Vigente: la rama declara
> `modo=calculadora` como input de su llamada al Data Connector (tabla §2.2 de WP-210), y «`menu` es
> un valor, no una ausencia» (WP-210 §2.1) — no existe el vacío/centinela ni nada que resetear: el
> paso del menú declara `modo=menu` en su propia llamada. T081 (abierta, B pura recomendada): con
> **B pura** no hay atributo; con **B híbrida** solo cubriría la reentrada. Corregidos abajo §2 y §5.

## 1. Objetivo

Ofrecer la calculadora sin perder al usuario ni cerrar la conversación.

## 2. Alcance

**In:**
- Mensaje con el **enlace** a la calculadora + reply buttons de vuelta al menú.
- La rama declara `modo=calculadora` como input de su llamada al DC (tabla §2.2 de WP-210); fin de
  workflow, hilo abierto, **sin `Close`** (corregido 27/08/2026; antes: `Set modo_bot=calculadora`).
- Vuelta al menú: no se reescribe ningún atributo — el paso del menú declara `modo=menu` en su propia
  llamada (corregido 27/08/2026; antes: reescribía `modo_bot` a vacío/centinela, que con WP-210 §2.1
  ya no existe).

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

- Recorrido no-Preview: la ejecución de n8n recibe `modo=calculadora` como input tras pulsar,
  `ticket` sin cambios, y la conversación **sigue abierta** (`state` distinto de `closed` en
  `get_conversation`) (corregido 27/08/2026; antes se leía `modo_bot=calculadora` por atributo — el
  `state` sí se sigue comprobando por `get_conversation`).
- Pulsar "volver al menú" vuelve a mostrar `AOPT` y la siguiente llamada al DC declara `modo=menu`
  (corregido 27/08/2026; antes: dejaba `modo_bot` vacío/centinela, que ya no existe).

## 6. Riesgo

Bajo. Riesgo de producto: si el enlace abre en la misma pestaña, el usuario pierde el Messenger →
comprobar el comportamiento real del enlace en la prueba visual.

## 7. Rollback

Backup del canvas antes de publicar.
