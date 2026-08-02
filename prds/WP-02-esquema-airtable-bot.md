---
id: WP-02
title: "Esquema Airtable: campos escribibles del bot en la tabla Empleados"
status: done
size: S
depends_on: []
milestone: "Fase 1 — Filtro conversacional"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-02 — Esquema Airtable: campos escribibles del bot en la tabla Empleados

> **Done.** Documentado por completitud del mapa del proyecto — ya construido y verificado.

## 1. Objective

Dar al bot un lugar propio y escribible donde guardar lo que recoge de cada conversación, separado de los campos oficiales/documentales que ya existían en `Empleados` (muchos de ellos lookups, fórmulas o adjuntos no escribibles desde fuera).

## 2. Scope

**In:**
- Base `Empleados` (`app5K8OnSObqwWweS` / `tblTWCWu5nQXNOMR1`).
- Campos nuevos creados: `alta_ss` (checkbox), `fecha_alta_ss` (date), `intercom_conversation_id` (text), `lead_potencial` (checkbox), `fecha_prevista_alta` (date), `fecha_limite_plazo` (date).
- Verificación de campos reutilizables existentes: `email` (clave de upsert), `Descarte` (single-select, opciones alineadas con los motivos reales del filtro).
- Auditoría de qué campos NO son escribibles (lookups, fórmulas, adjuntos) para no intentar mapearlos luego.

**Out:**
- Escribir efectivamente estos campos desde n8n (upsert) — WP-05.
- Añadir opción "Otro / incompleto" a `Descarte` — pendiente menor, sin WP propio, se hace a mano en Airtable cuando haga falta.

## 3. Open questions

Ninguna — esquema cerrado y en uso.
