---
id: WP-222
title: "Corte de contexto al salir de FAQ, resumen de 400 caracteres y enmascarado de PII"
status: specified
size: M
depends_on: [WP-221]
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-222 — Corte de contexto y PII

> POSIBLE ERROR DEL FLUJO PROPUESTO corregido (nodo `RESUME`): "reanudar conservando contexto" son dos
> errores en uno — no hay reanudación, y conservar el contexto del FAQ es exactamente lo que contamina
> la solicitud. HECHO VERIFICADO: el agente **no tiene nodo de Memory** y reinyecta el hilo **entero**
> en cada turno. Sin corte: el prompt crece sin techo y los hipotéticos del FAQ se releen como hechos.

## 1. Objetivo

Que al pasar de FAQ a solicitud el agente no arrastre ni el volumen ni las suposiciones de la
conversación anterior, y que la PII del texto libre no entre en el prompt ni en los logs.

## 2. Alcance

**In:**
- Al salir de FAQ: fijar `corte_contexto_bot` (id de la última part) y `faq_resumen_bot` (≤400
  caracteres).
- `Formatear_conversacion1`: descarta las parts anteriores al corte y las sustituye por el resumen.
- `Preparar_Prompt` en modo FAQ: **enmascara** patrones de PII (NIE/DNI, IBAN, teléfono, email).
- El bloque "DATOS QUE YA CONOCEMOS" **nunca** se alimenta de texto libre.
- El agente responde "no necesito tus datos todavía" **sin confirmar el dato**.

**Out:**
- Nodo de Memory: no se añade (si se añadiera, el corte se sustituiría por un reset de sesión).
- Desactivar el guardado de datos de ejecuciones exitosas en n8n → WP-231 (allí vive, pero es
  condición para que este WP tenga sentido).

## 3. Dependencias

WP-221.

## 4. Entregables

1. `corte_contexto_bot` y `faq_resumen_bot` escritos al salir de FAQ.
2. `Formatear_conversacion1` con el corte aplicado.
3. Enmascarado de PII en `Preparar_Prompt`.

## 5. Verificación

- Conversación con 3 turnos de FAQ y luego solicitud: el prompt del primer turno de solicitud
  **no contiene** ninguna de las parts anteriores al corte, y **sí** contiene el resumen (leído del
  log, no inferido).
- Escribir un NIE y un IBAN en modo FAQ: el prompt final del log los muestra **enmascarados**, y no
  aparecen en Airtable (diff de la fila).
- Tokens del prompt del primer turno de solicitud **menores** que los del último turno de FAQ
  (medición con `tokens_in`, WP-231).

## 6. Riesgo

Medio: un resumen mal generado puede **perder** un dato necesario para la solicitud, con la ventaja de
que el intake lo vuelve a preguntar. Riesgo mayor: el enmascarado con falsos positivos que destroce el
texto de la pregunta → probar con las 30 preguntas doradas.

## 7. Rollback

Desactivar el corte deja el comportamiento actual (hilo entero reinyectado). El enmascarado se puede
desactivar por separado. `versionId` anotado.
