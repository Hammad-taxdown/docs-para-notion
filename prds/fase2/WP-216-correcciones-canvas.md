---
id: WP-216
title: "Correcciones del canvas: borrar M. Path y SAVE, Close solo en D y N, typo veredicto_f2"
status: building
size: M
depends_on: []
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-216 — Correcciones del canvas heredado

> Agrupa las correcciones B1, B2, B7, B8 y B9 del Council. Todas son sobre el canvas actual y ninguna
> depende de la Fase 2: se pueden hacer antes.

## 1. Objetivo

Dejar `OnClick Mobility` sin las piezas que el Council descartó y con los tres verbos de cierre
separados, antes de añadirle ramas nuevas.

## 2. Alcance

**In:**
- **Borrar `M. Path`** (B8): HECHO VERIFICADO, los outputs de un DC son locales al path y su
  `Object mapping` **pisa** el resultado del primero con otro `hoy`; el veredicto ya está en el
  atributo tras `F`. `fuera_plazo` → `N` directo.
- **Borrar `SAVE`** (B9): escribir un atributo en un paso para leerlo en otro es el patrón que costó
  5 días en WP-04. La fecha viaja como input del DC en el mismo path.
- **Tres verbos separados** (B2): `Close conversation` **solo** en `D` y `N`; el resto termina el
  workflow con el hilo abierto; **ninguna rama toca `ticket.state`**.
- **Typo `veredicto_f2`** (B1) corregido en toda la documentación de la Fase 2 (el atributo con "i" no
  existe y un branch sobre él caería siempre al `else`, que **cierra la conversación**: HECHO
  VERIFICADO).
- **Rediseño del `else` de `I. Path`** (B7): separar "fecha no parseable" (repreguntar con
  `intentos_fecha_bot`: `<2` repreguntar con ejemplo literal · `==2` escalar) de "veredicto vacío"
  (fallo de sistema → escalar **sin** repreguntar). Se elimina `K → FRETRY → M`.
- Eliminar `FLAG` y `RESUME → B` del diseño (B3, B4, B5): no se construyen.

**Out:**
- El handoff en frío de `G` → WP-217.
- Reintentos automáticos de escritura: prohibidos hasta WP-205.

## 3. Dependencias

Ninguna. **No** depende de la sonda: son eliminaciones y correcciones de nombres.

## 4. Entregables

1. Canvas sin `M. Path` ni `SAVE`.
2. `else` de `I. Path` rediseñado con `intentos_fecha_bot`.
3. `Close` presente solo en `D` y `N`.

## 5. Verificación

- Recorrido `fuera_plazo` no-Preview: **una sola** ejecución del DC `beckham_plazo_f2` en la
  conversación (antes había dos), mensaje de plazo vencido con `fecha_limite_f2` y `dias_pasados_f2`
  correctos, y `Close`.
- Recorrido con fecha no parseable: repregunta con `intentos_fecha_bot=1`; al segundo intento
  **escala** y la conversación **no se cierra**.
- Recorrido `en_plazo`: la conversación **no se cierra** y `ticket.state` no cambia.
- `grep` del canvas y de los PRD: cero apariciones de `veridicto_f2`.

## 6. Riesgo

Alto por superficie: es la única capa sin curl, donde ya fallaron 3 fixes publicados. Mitigación
obligatoria: **un cambio y su prueba** cada vez, y backup antes de cada publicación.

## 7. Rollback

Duplicado `OnClick Mobility — BACKUP AAAAMMDD` antes de cada publicación. Los pasos borrados se pegan
en la bitácora antes de borrarlos (Intercom no ofrece rollback por API).
