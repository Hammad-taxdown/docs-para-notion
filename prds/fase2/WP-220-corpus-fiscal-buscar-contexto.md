---
id: WP-220
title: "System Prompt como fuente única de conocimiento fiscal (sin corpus externo ni tool de búsqueda)"
status: building
size: S
depends_on: []
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-220 — El conocimiento fiscal va en el prompt

> **DESBLOQUEADO. El corpus fiscal está aprobado por Alina desde el 11/08/2026.** Deja de ser una
> espera externa y pasa a ser trabajo de teclado.

## 0. Qué cambió, y por qué este fichero estaba mintiendo

Este PRD estuvo hasta el 11/08/2026 describiendo un diseño que **ya se había descartado el 07/08**,
y contradecía al mapa durante cuatro días. Queda escrito para que nadie reconstruya lo viejo:

| | Versión vieja (07/08 y anterior) | Versión vigente |
|---|---|---|
| Estado | `skeleton`, **bloqueado por M4** | `specified`, desbloqueado |
| Tamaño | `M` | `S` |
| Arquitectura | Corpus externo versionado + tool `buscar_contexto_fiscal(consulta)` que devuelve cita o `no_cubierto` | **Conocimiento inline en el `systemMessage`**. Sin corpus externo, sin vector store, **sin tool de búsqueda** |
| Bloqueo | Decisión abierta M4, aprobador fiscal sin nombrar | Ninguno. Corpus aprobado por **Alina, 11/08/2026** |

**Se elimina del diseño la tool `buscar_contexto_fiscal`.** No se implementa. Si aparece
mencionada en cualquier otro documento, ese documento está desactualizado.

**Why:** era el WP que bloqueaba el camino crítico del FAQ, y lo bloqueaba por una dependencia
de negocio, no técnica. Meter el conocimiento en el prompt lo convierte en un cambio de texto.

## 1. Objetivo

Que el agente solo pueda afirmar cosas de fiscalidad que estén **escritas en su propio prompt**, y
que diga que no lo sabe y ofrezca humano en cualquier otro caso.

## 2. Alcance

**Dentro:**
- El contenido fiscal aprobado, pegado en el `systemMessage` del `prompt_base`.
- **Versionado en el repo** (`docs/prompt-langsmith-prod-*.txt`), para poder diferenciar cambios de
  conocimiento de cambios de comportamiento.
- **Regla dura**: si algo no está en las instrucciones, decirlo y ofrecer humano. Sin esta regla el
  agente no tiene forma de saber cuándo se sale de lo que sabe.
- Disclaimer fijo: «información general, no asesoramiento personalizado».

**Fuera:**
- Redactar el contenido fiscal. **No lo hace el equipo técnico.** Ya está aprobado por Alina.
- Cualquier búsqueda web o fuente no aprobada.
- La tool `buscar_contexto_fiscal`, **descartada**.

## 3. Dependencias

Ninguna, técnica ni de negocio. `depends_on: []` y ya no hay `external`.

## 4. Entregables

1. El bloque de conocimiento fiscal dentro del prompt vigente, con su fecha y su aprobador anotados
   en el log.
2. La regla dura de «si no está aquí, no lo sé» redactada.
3. Set de **30 preguntas doradas** etiquetadas *responde / no cubierto / escala*.

## 5. Verificación

- Sobre las 30 preguntas doradas: cada respuesta cae en una de las tres etiquetas y coincide con la
  esperada. **Cero** afirmaciones normativas que no estén en el prompt.
- Una pregunta deliberadamente fuera del corpus → el agente dice que no lo cubre y ofrece humano,
  **sin inventar**.
- **Gate del 10/08, que aquí aplica igual:** el prompt no nombra ninguna tool que no esté cableada.
  Como `buscar_contexto_fiscal` se ha descartado, **no puede aparecer en el prompt**.

## 6. Cómo se publica, y el error que no se repite

Se construye **sobre el prompt vivo y validado**, nunca sobre un borrador. La fuente es LangSmith,
`bot_mobility_prompt` **tag `prod`** — no un número de versión fijado aquí. Vigente al 27/08: **v13**,
65.848 caracteres (v14 local pendiente de pegar), y **el corpus fiscal va inline en el prompt desde
el v9**: este WP está a medio hacer, no por empezar. (Cuando se escribió esto el vigente era el v7,
46.319 caracteres, verificado el 11/08 leyendo la traza de una ejecución real; actualizado el 27/08.)

**Regla nacida de un fallo real:** no arrastrar a una publicación parches que el log marque como no
verificados. El v5 estaba escrito y sin probar, entró dentro del v6 y metió un bucle infinito en la
pregunta del idioma, en producción. O se validan aparte, o se quedan fuera.

Y el prompt **solo se puede comprobar leyendo la traza de una ejecución del agente**: ni un curl ni
la API lo enseñan.

## 7. Riesgo

**Crítico legal:** el agente dando asesoramiento fiscal personalizado sin base. Detección: muestreo
de conversaciones con `modo_bot=faq_regimen`. Contingencia: retirar el modo FAQ — el `If` de routing
es el interruptor.

**Riesgo nuevo de esta arquitectura, y hay que declararlo:** al ir inline, **el conocimiento fiscal
engorda el prompt de todos los modos**, no solo el del FAQ, y el prompt ya va por 65.848 caracteres
(v13; eran 46.319 cuando se escribió esto — actualizado el 27/08).
Si crece de más, se parte en dos nodos de agente con `prompt_base` compartido — que es exactamente
lo que hace **WP-218**.

## 8. Rollback

El `If` de routing deja de enrutar a `faq_regimen` y el menú retira la opción «Tengo preguntas».
El bloque de conocimiento puede quedarse en el prompt sin daño: sin ruta que lo use, no se ejerce.
