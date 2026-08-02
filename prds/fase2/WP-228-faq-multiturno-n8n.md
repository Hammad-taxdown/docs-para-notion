---
id: WP-228
title: "FAQ multi-turno en n8n detrás del trigger de mensaje (pospuesto hasta que cierre WP-10)"
status: skeleton
size: L
depends_on: [WP-10, WP-221, WP-222, WP-227]
milestone: "Fase 2 conversacional — Pospuesto"
owner: "Hammad"
external: "Adri / Fer (dueños del distribuidor y del ticket type) vía WP-10"
critical: true
issue: ""
---

# PRD · WP-228 — FAQ multi-turno en n8n

> **BLOQUEADO por WP-10.** HECHO VERIFICADO: sobre un `Customer ticket` **no se disparan los triggers
> "customer sends any message"** → el turno 2 nunca llega a n8n. HECHO VERIFICADO: pasar el ticket a
> `Submitted` **manda un correo al cliente**.
> Condición de entrada escrita (nada se pospone sin condición): **este WP se abre cuando WP-10 esté
> cerrado con su gate** — conversación nueva con `ticket: null`, dos ejecuciones (una por turno) sin
> intervención manual, el contacto sin correo, y el causante del ticket **nombrado** en la bitácora
> (si se apagan cinco cosas y funciona, el gate **no** pasa).
> Queda `skeleton` a propósito: especificarlo antes de WP-10 sería especificar sobre una plataforma
> cuyo comportamiento no está verificado.

## 1. Objetivo

Mover el FAQ entero a n8n detrás del trigger de mensaje, dejando en el canvas solo la entrada en frío.

## 2. Alcance

**In (cuando se abra):**
- Turnos 2..N por trigger de mensaje, con dedupe por `conversation_part_id`.
- Historial reconstruido de la API con corte por `corte_contexto_bot`.
- Tope de turnos con salida a humano o a solicitud.
- El bucle desenrollado en el canvas se **descarta definitivamente** cuando esto funcione.

**Out:**
- El bucle `W → WDONE → W` del flujo propuesto: rechazado como diseño primario. Plan B condicionado
  (N=3 desenrollado en el canvas) **solo** si WP-10 resulta imposible de cerrar, aceptando por escrito
  que la mitigación es **probabilística** (los reply buttons no impiden escribir en el composer).

## 3. Dependencias

**WP-10** (bloqueante externo), WP-221, WP-222, WP-227.

## 4. Entregables

Por definir en `/prd:fill` cuando se abra. Mínimo: rama de turnos 2..N, dedupe, corte de historial,
tope de turnos.

## 5. Verificación

- Dos turnos consecutivos del usuario producen **dos ejecuciones** de `beckham_bot` sin intervención
  manual, y el contacto **no recibe correo**.
- Antes de configurar nada: demostrar en conversación no-Preview que una respuesta a `Collect data`
  **no** dispara el distribuidor **y** que un mensaje tecleado en el composer con colector activo
  **tampoco**. Si lo segundo falla, se aprueba WP-10 primero.

## 6. Riesgo

Crítico si se construye antes de WP-10: media Fase 2 quedaría sin sentido. El riesgo de coste también
está declarado: sin Memory el historial se reenvía cada turno y el modo FAQ es el más largo, así que es
donde el coste crece más.

## 7. Rollback

Se vuelve al FAQ de un turno (WP-221), que **no depende de WP-10** y usa el mecanismo verificado.
