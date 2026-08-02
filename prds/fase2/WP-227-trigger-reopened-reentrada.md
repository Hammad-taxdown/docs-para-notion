---
id: WP-227
title: "Trigger Reopened y matriz de reentrada: hilo abierto, cerrado, cooldown y vuelta a los 3 días"
status: specified
size: M
depends_on: [WP-211, WP-212]
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-227 — Reentrada y trigger `Reopened`

> HECHOS VERIFICADOS: (1) si el contacto tiene una conversación abierta, el Messenger **la reanuda** y
> el usuario **no vuelve a ver el menú**; (2) "Reopened" **no es** el mismo trigger que "customer sends
> any message", y hoy **no existe** ningún workflow con ese trigger; (3) hay un **cooldown de 2
> minutos** en triggers customer-facing, que hace que un reintento inmediato no dispare nada.
> DECISIÓN APROBADA: hay tres caminos de reentrada y **ninguno es el menú por defecto**.

## 1. Objetivo

Que un usuario que vuelve — al rato, al día siguiente o desde un enlace — caiga en el modo correcto y
no en un estado indefinido.

## 2. Alcance

**In:**
- Registrar un workflow de Intercom con trigger **`Reopened`** que lea `modo_bot` y reencamine.
- Reglas de reentrada: `modo_bot` vacío o caducado → menú · `solicitud` con expediente abierto →
  solicitud · `lead_potencial` → lead · ausente/desconocido → **fail-closed en memoria + aviso**
  (nunca persistido).
- Entrada por enlace de recordatorio: **siempre al launcher**, nunca reabriendo el hilo viejo, nunca
  tocando `ticket.state`.
- Matriz de reentrada como parte del e2e: hilo abierto · hilo cerrado · dentro del cooldown de 2 min ·
  vuelta a los 3 días.

**Out:**
- Multi-turno del FAQ → WP-228.
- Reincorporación automática de leads → depende de **WP-07** (HECHO VERIFICADO: `active:false`,
  `triggerCount 0`).

## 3. Dependencias

WP-211 (resolver), WP-212 (reset). Si el reset no es viable, este WP absorbe el TTL como Text ISO.

## 4. Entregables

1. Workflow con trigger `Reopened` registrado y publicado.
2. Reglas de reentrada implementadas en el resolver.
3. Matriz de 4 escenarios documentada con sus pares (conversación, ejecución).

## 5. Verificación

Los **cuatro** escenarios, cada uno con su par (`conversation_id` no-Preview, `execution_id`):
- Hilo abierto: se reanuda, el modo es el que tenía, y queda documentado que el usuario **no ve** el
  menú.
- Hilo cerrado: el mensaje del usuario **reabre** y dispara el workflow `Reopened` (una ejecución).
- Dentro del cooldown de 2 min: **no** dispara nada — verificado como ausencia de ejecución, no
  asumido.
- A los 3 días: cae en el modo esperado según la regla.

Sin los cuatro escenarios, el WP no cierra.

## 6. Riesgo

Alto y silencioso: MF3 (el usuario arrastra el modo viejo). Detección: la matriz de reentrada.
Contingencia: cerrar hilos del contacto de pruebas antes de cada prueba, y TTL como Text ISO parseado
en n8n (los `Date` de Intercom no sirven en workflows, HECHO VERIFICADO).

## 7. Rollback

El workflow `Reopened` se pausa; la reentrada vuelve al comportamiento actual (indefinido, declarado
como deuda).
