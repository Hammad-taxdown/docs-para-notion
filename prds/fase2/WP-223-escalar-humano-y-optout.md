---
id: WP-223
title: "escalar_humano con asignación real a Ops_Mobility y registrar_optout como única escritura del FAQ"
status: specified
size: M
depends_on: [WP-218, WP-219]
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

> **M6 DECIDIDO el 26/08/2026 por el usuario: el SLA es de 24 a 48 horas.** El bloqueo externo queda
> levantado y `external` vacío. *(El comentario vivía en la propia línea del campo, y aunque YAML lo
> trata como comentario, mi parser lo leía como valor y este WP seguía apareciendo bloqueado.)*

# PRD · WP-223 — Escalado humano y opt-out

> HECHO VERIFICADO: `Mensaje_fallback` dice "un compañero te escribirá" y **solo llama a
> `Callback_Intercom`**: nadie asigna a nadie. Es una promesa falsa.
> DECISIÓN APROBADA: `escalar_humano` existe **como tool y como botón** — el botón cubre la iniciativa
> del usuario, la tool la del sistema cuando no hay fuente aprobada (es el freno legal).
> `registrar_optout` es la **única escritura permitida en modo FAQ**: negarse a procesar una baja
> "porque estamos en FAQ" es indefendible.
> **BLOQUEO PARCIAL:** sin la decisión M6 (SLA, horario y capacidad de `Ops_Mobility`), "escalar a
> humano" es "abandonar" y el mensaje al usuario no se puede redactar honestamente.

## 1. Objetivo

Un único camino de escalado, con una sola redacción, que **asigne de verdad**; y una baja que se pueda
registrar desde cualquier modo.

## 2. Alcance

**In:**
- Un único path `L` con una sola redacción, alcanzable desde todas las ramas de error y desde el botón.
- `escalar_humano(motivo)`: asigna a `Ops_Mobility` de verdad y deja traza con `corr_id`.
- Botón "hablar con una persona" en menú, FAQ y calculadora.
- Corregir `Mensaje_fallback`: o asigna, o cambia el texto.
- `registrar_optout()`: toca **solo** `recordatorio_optout`; pasa por la guarda de WP-219.

**Out:**
- ~~Definir el SLA: es decisión del manager (M6).~~ **M6 DECIDIDO EL 26/08/2026 por el usuario: el
  plazo es de 24 a 48 horas.** El texto ya se puede publicar, y va **en dos sitios**: el mecanismo de
  este WP y **el prompt** (ver `WP-220` y la regla 11), porque el bot lo dice antes de que exista
  ningún escalado real.
- `cerrar_conversacion`: requiere aprobación y solo al completar el expediente → no en este WP.

## 3. Dependencias

WP-218, WP-219. Decisión abierta M6 para publicar el texto.

## 4. Entregables

1. Path `L` unificado.
2. Tools `escalar_humano` y `registrar_optout` con su guarda.
3. `Mensaje_fallback` corregido.

## 5. Verificación

- Recorrido no-Preview con escalado: `get_conversation` muestra la conversación **asignada a
  `Ops_Mobility`** (no `nobody_admin`) y con la traza del `corr_id`.
- `registrar_optout` desde modo FAQ: `recordatorio_optout=true` en la fila y **ningún otro campo
  modificado** (diff campo a campo).
- Provocar el `Mensaje_fallback`: o hay asignación real, o el texto no promete que alguien escriba.

## 6. Riesgo

Alto de experiencia: escalar a un equipo sin cobertura convierte el escalado en un abandono silencioso.
Detección: tiempo hasta primera respuesta humana en conversaciones con tag de escalado.
Contingencia: mensaje que indique el plazo real en vez de "un compañero te escribirá".

## 7. Rollback

El botón se retira del canvas (backup previo) y la tool se deja sin arista `ai_tool`.
