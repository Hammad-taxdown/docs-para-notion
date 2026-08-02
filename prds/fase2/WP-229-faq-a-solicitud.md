---
id: WP-229
title: "FAQ → solicitud: iniciar_solicitud con relanzamiento del reusable (V1) o intake por el agente (V2)"
status: skeleton
size: M
depends_on: [WP-209, WP-221, WP-222]
milestone: "Fase 2 conversacional — Pospuesto"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-229 — FAQ → solicitud

> POSIBLE ERROR DEL FLUJO PROPUESTO corregido (`RESUME → nodo B`): **no existe GOTO ni
> subrutina-con-retorno** en las primitivas verificadas de Intercom (reply buttons, `Collect data`,
> branch, `Set <atributo>`, `Apply rules`, DC con wait-for-callback, assign, close,
> `Pass to <reusable>`). El campo `retorno_nodo` se elimina. **No hay retorno: hay salto hacia
> delante.**
> DESCONOCIDO (incógnita 6): si `Pass to <reusable>` devuelve el control al padre. Toda la evidencia
> local es de handoffs **sin** retorno. Por eso este WP queda `skeleton`: la variante se elige con
> evidencia, no antes.

## 1. Objetivo

Que el usuario que termina sus preguntas entre en el flujo de solicitud sin perder el hilo ni arrastrar
el contexto del FAQ.

## 2. Alcance

**In (una de las dos, según evidencia):**
- **V1 (preferida):** extraer `B…` a un **reusable** y hacer `Pass to` desde `WDONE=ya está` — salto
  hacia delante. Tool `iniciar_solicitud()`: escribe `modo_bot=solicitud`, fija `corte_contexto_bot` y
  `faq_resumen_bot`, y relanza el reusable.
- **V2 (si `Pass to` no es viable):** el agente conduce el intake por mensajes en `modo=solicitud`,
  llamando a `beckham_f2_plazo` como tool. Coste aceptado y escrito: las **preguntas** quedan en dos
  sitios; el **cálculo** sigue en uno.

**Out:**
- "Relanzamiento por trigger": **descartado explícitamente** — chocaría con el cooldown de 2 min justo
  cuando el usuario dice "sí, quiero empezar".
- V2 depende además de que el multi-turno funcione → WP-228 / WP-10.

## 3. Dependencias

WP-209 y una prueba dedicada con dos reusables encadenados (cierra la incógnita 6), WP-221, WP-222.

## 4. Entregables

Por definir en `/prd:fill` tras elegir variante. Mínimo: la variante elegida con la evidencia que la
justifica, y la otra registrada como descartada.

## 5. Verificación

- Recorrido no-Preview: pulsar `WDONE=ya está` lleva a la primera pregunta de `B` **en la misma
  conversación**, con `modo_bot=solicitud` y `corte_contexto_bot` fijado.
- El prompt del primer turno de solicitud **no contiene** las parts anteriores al corte.
- Si se elige V2: el `beckham_f2_plazo` se llama **una sola vez** por fecha aportada.

## 6. Riesgo

Medio: V1 depende de una capacidad no verificada de Intercom; V2 duplica el lugar donde se hacen las
preguntas, que es la clase de duplicación que este proyecto ya paga en cinco sitios. Se acepta por
escrito, no en silencio.

## 7. Rollback

`WDONE=ya está` muestra un mensaje pidiendo al usuario que vuelva al menú y pulse "Comprobar si
cumplo" — peor experiencia, cero riesgo técnico.
