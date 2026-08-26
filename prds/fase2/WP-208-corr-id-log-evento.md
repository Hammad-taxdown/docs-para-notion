---
id: WP-208
title: "Prerrequisito P7: corr_id de extremo a extremo y nodo Log_Evento de 6 campos"
status: specified
size: M
depends_on: [WP-207]
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-208 — P7: `corr_id` en todo

> HECHO VERIFICADO: ningún artefacto lleva identificador de correlación; cruzar Intercom con n8n se
> hace **a ojo por timestamps**. INFERENCIA declarada: con el número de ramas que añade la Fase 2, la
> arquitectura nueva sería *más* difícil de depurar que la actual sin esto.

> **26/08/2026 · EL BLOQUEO QUE ESTE PRD DABA POR SUPUESTO NO EXISTE.** El `corr_id` **se construye
> hoy, sin pedirle nada nuevo a Intercom ni tocar el canvas.** Medido en el body real de la ejecución
> `8129120` (entrada de `Webhook1`):
>
> ```json
> { "conversation_id": "215475581167582", "conversationPartId": "52219039912",
>   "conversation_part_id_debounce": "52219039912", "message": "Sí, confirmar",
>   "user_id": "eu-west-1:…", "user_email": "…" }
> ```
>
> Los dos trozos ya llegan → `corr_id = 215475581167582:52219039912`. **Y cuidado con los nombres, que
> son tres claves para dos cosas:** `conversation_id` (el hilo), `conversationPartId` (**camelCase**, el
> mensaje) y `conversation_part_id_debounce` (**mismo valor**, y la única que lee `If2`).
>
> **De paso se desmintió una sospecha mía, y conviene que quede escrito porque parecía sólida:** creí
> que `conversation_part_id_debounce` no llegaba nunca y que el debounce estaba muerto cayendo siempre
> al `else`. **Llega**, y `Wait2` espera sus 3 s. La pista que me había convencido —`waitTill: null` en
> **200** ejecuciones— **no vale**: n8n no persiste una espera de 3 s, la mantiene en memoria. Un `null`
> ahí no dice que nadie esperara.
>
> **Entregado hoy:** `docs/nodo-log-evento-2026-08-26.js` (pieza fuente, **sin pegar**) con
> `construirCorrId` y `Log_Evento` de 6 campos, y su puerta `docs/test-log-evento.js` — **25
> comprobaciones, la duodécima puerta**, que prueba el `corr_id` **contra ese body real, no contra uno
> inventado**.
>
> **Y una razón para los 6 campos que este PRD no daba:** ese mismo body lleva `message` y
> `user_email`. Volcar el body a un log mete **la frase del cliente y su correo** en las ejecuciones de
> n8n, que se guardan y las ve cualquiera con acceso a la instancia. Así que los 6 campos son
> **mínimo privilegio, no formato**: `dropped` guarda **nombres** de campo y tira los valores, y la
> puerta lo comprueba con una fecha inválida, un «no sé» y un correo — ninguno de los tres aparece en
> el evento.
>
> **Lo que NO se hace hoy y por qué:** `Set_Corr` en cada rama y `last_corr_id` en la fila tocan
> `beckham_bot` y el escritor, o sea el reenvío de 55 nodos de `WP-207`. **Y la columna `last_corr_id`
> no se crea todavía a propósito:** sin quien la escriba sería una columna huérfana más, y este
> proyecto ya arrastra `FechaLlamada` así.

> **26/08 · ENTREGADO PARA PEGAR.** El `corr_id` y el `Log_Evento` ya están **dentro** del nodo del
> escritor: `docs/nodo-validar-normalizar-COMPLETO.js`, paso 4 de `docs/pasos.sh`. Tres inserciones y
> ninguna toca lo existente — la clave `corr_id` **se añade** a la salida, y los nodos de abajo leen
> `_invalid`, `fields`, `_hay_fechas_descartadas`, `_fechas_descartadas` y `_formula_userid`, para los
> que una clave de más es inerte.
>
> **`last_corr_id` va apagado a propósito** (`_ESCRIBIR_LAST_CORR_ID = false`): encenderlo exige la
> columna en Airtable **y** refrescar la lista de campos del nodo `Airtable Upser Expediente`, que es
> el **sexto sitio** de un campo nuevo y puede reactivar los 36 que se quitaron. Cuando la columna
> exista, el cambio es ese `false` a `true` y nada más.
>
> Lo que sigue pendiente de este PRD: `Set_Corr` como primer nodo de **cada** rama (esto lo pone en
> una), la cabecera `X-Beckham-Corr-Id`, la nota interna en Intercom y el atributo `corr_id_bot`.

## 1. Objetivo

Que desde una fila de Airtable se llegue a la ejecución de n8n y a la conversación de Intercom **sin
buscar por hora**.

## 2. Alcance

**In:**
- `corr_id = {conversation_id}:{conversation_part_id}` (+`:{intento}` en reintentos). El reintento
  **reutiliza** el mismo `corr_id`; sirve además de clave de dedupe.
- Presencia obligatoria en: input del DC, cabecera `X-Beckham-Corr-Id`, nodo `Set_Corr` como primer
  nodo de cada rama, prefijo de todo `console.log`, campo `last_corr_id` de la fila, nota interna de
  Intercom.
- Nodo `Log_Evento` con **exactamente 6 campos**: `{corr_id, modo, punto, resultado, ms, dropped[]}`.
  **Prohibido** loguear el registro completo de Airtable o el body entero.
- Atributo `corr_id_bot` en la conversación.

**Out:**
- Alertas y métricas agregadas → WP-231.
- Desactivación del guardado de datos de ejecuciones exitosas → WP-231.

## 3. Dependencias

WP-207 (el escritor ya extraído es donde vive `last_corr_id`).

## 4. Entregables

1. `Set_Corr` en cada rama y `Log_Evento` de 6 campos.
2. `last_corr_id` escrito en la fila.
3. Nota interna en Intercom con el `corr_id` del turno.

## 5. Verificación

- Tomar **una** fila de Airtable modificada en la sesión y, con solo su `last_corr_id`, localizar la
  ejecución de n8n y la conversación de Intercom. Sin usar la hora.
- Inspección del log de una ejecución: aparecen los 6 campos y **no** aparece ningún objeto completo
  ni PII.
- En un reintento, el `corr_id` es el mismo con sufijo `:2`.

## 6. Riesgo

Bajo técnicamente; el riesgo es de disciplina: si una rama nueva se construye sin `Set_Corr`, la
trazabilidad se degrada en silencio. Mitigación: el gate de cierre de cualquier WP exige el `corr_id`
presente en los tres sistemas para el mismo caso.

## 7. Rollback

Los nodos `Set_Corr` y `Log_Evento` se pueden dejar `disabled` sin afectar a la lógica; `versionId`
anotado.
