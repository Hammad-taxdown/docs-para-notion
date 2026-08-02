---
id: WP-03
title: "F4: captura de la fecha prevista de alta para leads potenciales"
status: done
size: S
depends_on: [WP-02]
milestone: "Fase 2 — Persistencia"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-03 — F4: captura de la fecha prevista de alta para leads potenciales

> **Done.** Documentado por completitud del mapa del proyecto — recogida montada en Intercom, en borrador sin publicar (depende de WP-05/06 para tener sentido en producción).

## 1. Objective

Para los usuarios en la rama "lead potencial" (sin alta en Seguridad Social todavía), recoger de forma opcional la fecha en la que prevén darse de alta, para que quien gestiona el seguimiento de leads (fuera del alcance de este bot) tenga ese dato disponible en Airtable.

## 2. Scope

**In:**
- Step "Collect data" en el path "I. No descartar aún…" de `OnClick Mobility`.
- Atributo temporal de **texto** (no date+time, para evitar el bug de F2) `fecha prevista de alta`, formato pedido DD/MM/AAAA, opción de continuar sin saberlo.
- Mensaje de cierre + Close al final del path.

**Out:**
- Guardar el dato en Airtable (`fecha_prevista_alta`) — WP-05 (la recogida es independiente de F5, pero no tiene efecto real hasta que exista el upsert).
- Gestión de recordatorios al lead — fuera de alcance de todo el proyecto, lo hace otra persona.

## 3. Open questions

Ninguna — recogida cerrada en el editor, pendiente solo de publicación conjunta con WP-06.
