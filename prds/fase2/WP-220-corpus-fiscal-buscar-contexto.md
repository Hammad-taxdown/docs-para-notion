---
id: WP-220
title: "Corpus fiscal aprobado y tool buscar_contexto_fiscal con respuesta no_cubierto"
status: skeleton
size: M
depends_on: []
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: "Aprobador con criterio fiscal (decisión M4, sin nombrar)"
critical: true
issue: ""
---

# PRD · WP-220 — Corpus fiscal y `buscar_contexto_fiscal`

> **BLOQUEADO por la decisión abierta M4.** El corpus fiscal aprobado **no existe todavía como
> corpus** y sin él el modo FAQ **no es publicable, sea cual sea la arquitectura**. Ninguna decisión
> técnica lo sustituye, y debe aprobarlo alguien con criterio fiscal, no el equipo técnico.
> Este WP queda `skeleton` a propósito: especificarlo sin el corpus sería inventar su contenido.

## 1. Objetivo

Que el agente en modo FAQ solo pueda afirmar lo que está en un corpus aprobado y versionado, y diga
`no_cubierto` en cualquier otro caso.

## 2. Alcance

**In:**
- Corpus aprobado, **versionado** en el repo, con fuente por afirmación.
- Tool `buscar_contexto_fiscal(consulta)`: lectura sobre el corpus; devuelve **cita** o
  `no_cubierto`. Disponible en los tres modos.
- Disclaimer fijo: "información general, no asesoramiento personalizado".
- Regla: sin fuente → `no_cubierto` → oferta de humano.

**Out:**
- Redacción del contenido fiscal: no la hace el equipo técnico.
- Cualquier búsqueda web o fuente no aprobada.

## 3. Dependencias

Ninguna técnica. Dependencia **de negocio**: M4 (corpus aprobado) y la aprobación del disclaimer.

## 4. Entregables

1. Corpus versionado con su fecha y su aprobador.
2. Tool implementada como subworkflow de lectura.
3. Set de **30 preguntas doradas** etiquetadas *responde / no cubierto / escala*.

## 5. Verificación

- Sobre las 30 preguntas doradas: **cero** afirmaciones normativas sin cita del corpus. Cada respuesta
  cae en una de las tres etiquetas y coincide con la esperada.
- Una pregunta deliberadamente fuera del corpus devuelve `no_cubierto` y ofrece humano.
- El corpus tiene versión y aprobador registrados; una respuesta permite reconstruir de qué versión
  salió.

## 6. Riesgo

**Crítico legal:** el agente dando asesoramiento fiscal personalizado sin base normativa. Detección:
muestreo de conversaciones con `modo_bot=faq_regimen` y ratio de respuestas sin cita. Contingencia:
retirar el modo FAQ — el IF de routing es el feature flag.

## 7. Rollback

El IF de routing deja de enrutar a `faq_regimen` y el menú retira la opción "Tengo preguntas".
