---
id: WP-08
title: "F5: prueba end-to-end en Messenger real y publicación"
status: skeleton
size: S
depends_on: [WP-06]
milestone: "Fase 2 — Persistencia"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-08 — F5: prueba end-to-end en Messenger real y publicación

> **Skeleton.** Run `/prd:fill WP-08` to specify it before building it. Do not implement from a skeleton.

## 1. Objective

Confirmar que los tres caminos del bot (cualifica, descarta, lead potencial) escriben correctamente en Airtable en una conversación real de Intercom (no en Preview, que usa datos mock y no sirve para validar Data Connectors reales), y publicar (`Set changes live`) tanto `OnClick Mobility` como el estado final de `beckham_bot` con el OK explícito del usuario.

## 2. Scope

**In:**
- 3 conversaciones de prueba reales en el workspace Intercom TEST: una que cualifica, una que se descarta, una que pasa a lead potencial.
- Verificación en Airtable: fila creada/actualizada correctamente, sin duplicados, con exactamente los campos esperados por camino (ni de más ni de menos).
- Publicación final tras confirmación del usuario.

**Out:**
- Cualquier fix de bugs que aparezcan durante la prueba que no sean triviales — si aparece algo grande, se abre su propio WP en vez de meterlo aquí.

## 3. Open questions

- ¿Se prueba primero solo en borrador (sin publicar OnClick Mobility) usando alguna vía de test real, o hace falta publicar antes de poder probar en Messenger real?
- Checklist exacto de qué revisar en Airtable tras cada prueba (qué campos, qué valores esperados por camino).
