---
id: WP-01
title: "Filtro F1–F3: cualificación conversacional del régimen Beckham en Intercom"
status: done
size: M
depends_on: []
milestone: "Fase 1 — Filtro conversacional"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-01 — Filtro F1–F3: cualificación conversacional del régimen Beckham en Intercom

> **Done.** Documentado por completitud del mapa del proyecto — ya construido, verificado y publicado.

## 1. Objective

Cualificar automáticamente, dentro de una conversación de Intercom (`OnClick Mobility`), si un usuario puede acogerse al régimen fiscal Beckham, evaluando en orden: residencia fiscal en España en los últimos 5 años (descarte duro), alta en la Seguridad Social (Sí/No), y si tiene alta, si la fecha de alta sigue dentro del plazo de 6 meses. El resultado determina si el usuario avanza, se descarta con un motivo, o pasa a la rama de "lead potencial" (sin alta SS todavía, pero sin perder el contacto).

## 2. Scope

**In:**
- Flujo `OnClick Mobility` (Intercom, id 66243731) con el orden Residencia → Alta SS → Fecha.
- Cálculo real del plazo F2 vía Data Connector `beckham_plazo_f2` → workflow n8n `beckham_f2_plazo` (webhook, parseo de fecha, veredicto `en_plazo`/`fuera_plazo`).
- Rama "lead potencial" (Alta SS = No) conectada al path final para no perder el lead.
- Tag `jarry_ignore` para silenciar al bot Jarry durante este flujo.
- Paso "Reply" + fallback en `n8n_BOT_mobility` (gap de respuesta al usuario resuelto).

**Out:**
- Mostrar fecha límite y días pasados en el mensaje de descarte por plazo vencido — bug activo, ver WP-04.
- Persistencia de los datos recogidos en Airtable — WP-05.
- Captura de la fecha prevista de alta del lead potencial — WP-03.

## 3. Open questions

Ninguna — WP cerrado y publicado en producción (Set changes live hecho).
