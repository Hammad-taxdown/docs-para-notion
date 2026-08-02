---
id: WP-210
title: "Contrato del modo: familia de atributos *_bot y tabla de transiciones con dueño único"
status: specified
size: S
depends_on: [WP-209]
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-210 — Contrato del modo (`modo_bot`)

> DECISIÓN APROBADA: la fuente de verdad del modo es **`modo_bot`, Conversation attribute de tipo
> Text**, con **un dueño único por transición** (no un escritor único global). No va a Airtable
> (llegaría tarde y desincronizado, unanimidad A1/A2/A3/A4), no va en la memoria del agente (HECHO
> VERIFICADO: no existe nodo de Memory), no va en el body del webhook (público y falsificable).
> Convención: sufijo `_bot` para estado conversacional, `_f2` reservado al cálculo.

## 1. Objetivo

Escribir y publicar el contrato del modo, para que cualquier rama nueva sepa qué puede escribir, quién
lo escribe y cuándo, **antes** de que exista la primera rama.

## 2. Alcance

**In:**
- Atributos: `modo_bot`, `corte_contexto_bot`, `faq_resumen_bot`, `faq_turnos_bot`,
  `intentos_fecha_bot`, `corr_id_bot` — todos **Text**.
- Valores de `modo_bot`: `faq_regimen | solicitud | lead_potencial | calculadora | humano | cerrado`,
  y *(vacío = menu)*. `menu` es implícito y **no se persiste nunca**.
- Tabla de transiciones con dueño por transición: el **canvas** escribe con pasos `Set` mientras posee
  el slot; **n8n** escribe por API solo en los turnos que llegan por trigger de mensaje o `Reopened`.
  Regla de cierre: n8n **no** escribe modo mientras un DC espera callback; el canvas **no** escribe
  fuera de su slot; el fail-closed **nunca** se persiste.
- Invariante: **ninguna transición de modo escribe `Descarte` ni los `*_f2`**.

**Out:**
- La implementación del resolver → WP-211. El reset → WP-212.
- Cualquier atributo nuevo no listado aquí: requiere modificar este contrato primero.

## 3. Dependencias

WP-209: si la sonda devuelve `OTRO_PATH_FALLA`, **este contrato cambia de transporte** (el modo pasa a
ser input explícito y obligatorio de cada llamada al DC) y hay que reescribirlo antes de construir.

## 4. Entregables

1. Los seis atributos creados en Intercom, tipo Text.
2. Tabla de transiciones publicada en el PRD maestro y firmada.
3. Convención de nombres añadida al PRD maestro.

## 5. Verificación

- Auditoría de la tabla: **cada valor posible de `modo_bot` tiene exactamente un escritor por
  transición**, y no hay ninguna transición sin dueño.
- Los seis atributos existen y son de tipo Text, comprobado por lectura de la conversación de la sonda.
- `grep` de la tabla: cero transiciones que escriban `Descarte` o un `*_f2`.

## 6. Riesgo

El contrato entero depende de que un atributo escrito con `Set` propague (incógnita 1). Riesgo de
escribir el contrato antes de la sonda: quedarse con un documento inválido. Por eso `depends_on` es
WP-209.

## 7. Rollback

Documental: se revierte el fichero. Los atributos creados no se borran (son inertes si nadie los
escribe).
