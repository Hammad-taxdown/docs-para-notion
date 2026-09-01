---
id: WP-228
title: "FAQ multi-turno en n8n detrás del trigger de mensaje"
status: specified
size: L
depends_on: [WP-221, WP-222, WP-227]
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-228 — FAQ multi-turno en n8n

> ## 🔄 SUPERADO EN SU PREMISA · 31/08/2026 · EL MULTI-TURNO NO NECESITA WP-10
>
> Este PRD daba por hecho que el multi-turno del FAQ tenía que salir del canvas y vivir detrás del
> trigger de mensaje, y que por eso estaba **bloqueado por `WP-10`** (sobre un `Customer ticket` no se
> disparan los triggers «customer sends any message»).
>
> **El diseño del 31/08 lo resuelve sin salir del canvas** y por tanto sin `WP-10`:
> `docs/faq-multiturno-2026-08-31.md`. El botón `[Otra pregunta]` de `Z5` vuelve al `Collect data` de
> `Z2` — **preguntas ilimitadas con una sola arista**. El turno 2 entra por el **mismo paso** que el
> turno 1, así que:
>
> - no hace falta enrutar por modo (la posición del canvas ES el router)
> - el `callback_token` es **el mismo** en todas las pasadas, así que el literal soldado vale
> - el turno 2 **nunca** pasa por el agente del intake, que es el que tiene las 3 tools
>
> **Lo que este PRD rechazaba con razón sigue rechazado:** el bucle `W → WDONE → W` como diseño
> primario **con contención por botones**. La diferencia es que ahora la contención no depende de los
> botones: el paso que espera **dentro** del turno es un `Collect data` (que sí espera una respuesta),
> y el que espera **al final** es un botón. Ese es el reparto que lo hace viable.
>
> **Queda pendiente UNA medición antes de construir** (`T-ARISTA`, 2 minutos): que un reply button
> pueda apuntar a un paso **anterior** del canvas. Si no puede, el Plan B del diseño nuevo sí vuelve a
> necesitar el trigger de mensaje, y entonces `WP-10` vuelve a bloquear.

> **NOTA DEL 11/08/2026 · **BLOQUEADO**, no `skeleton`: depende de `WP-10`, `WP-221`, `WP-222` y `WP-227`. No es que falte escribirlo, es que no se puede empezar. Frontmatter sincronizado el 11/08.**

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
