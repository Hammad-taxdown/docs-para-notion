---
id: WP-215
title: "Autodescarte declarado: traza punto=autodescarte_declarado sin escribir Descarte ni cerrar"
status: specified
size: S
depends_on: [WP-207, WP-213]
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-215 — Autodescarte declarado

> POSIBLE ERROR DEL FLUJO PROPUESTO corregido (nodo `C`): cerrar al usuario por una **autoevaluación
> sin ningún dato** y sin dejar traza. DECISIÓN APROBADA: no es terminal. Mensaje + traza
> `punto=autodescarte_declarado` — **nunca** `Descarte`, que es el veredicto del filtro — y oferta de
> FAQ o calculadora. Pendiente de confirmación del usuario (decisión abierta U4).

## 1. Objetivo

No perder al usuario que se autodescarta, y dejar traza distinguible de un descarte real.

## 2. Alcance

**In:**
- Rama accesible **desde el FAQ**, no desde el menú (la opción se retiró de `AOPT`).
- Llamada al escritor único con `punto=autodescarte_declarado`.
- Mensaje + reply buttons: FAQ, calculadora, volver al menú. Hilo abierto, **sin `Close`**.

**Out:**
- Escribir `Descarte` o cualquier `*_f2`: **prohibido** por la invariante de WP-210.

## 3. Dependencias

WP-207 (escritor con el nuevo `punto` en whitelist, WP-206), WP-213.

## 4. Entregables

1. Rama publicada.
2. `punto=autodescarte_declarado` en la whitelist y en el `contract-test.sh`.

## 5. Verificación

- Recorrido no-Preview: existe fila en Airtable con la traza del punto, y el campo `Descarte` de esa
  fila **sigue vacío** (diff antes/después).
- La conversación queda abierta y `ticket` sin cambios.

## 6. Riesgo

Bajo. Riesgo de dato: si el escritor no distingue `autodescarte_declarado` de un descarte, contamina
los informes → cubierto por la whitelist (WP-206) y la semántica de reset por `punto` (WP-226).

## 7. Rollback

Backup del canvas; el `punto` se retira de la whitelist.
