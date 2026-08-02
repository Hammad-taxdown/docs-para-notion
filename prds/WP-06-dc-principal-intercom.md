---
id: WP-06
title: "F5: Data Connector principal en Intercom + conexión en los 4 puntos de disparo"
status: specified
size: M
depends_on: [WP-05]
milestone: "Fase 2 — Persistencia"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-06 — F5: Data Connector principal en Intercom + conexión en los 4 puntos de disparo

> **Specified (2026-07-27, replanteado desde cero tras auditoría MCP + Chrome).** El bloque anterior (DC `beckham_upsert_expediente` en borrador) se descarta como base de partida — se rehace desde cero apoyándose en la estructura real verificada de `OnClick Mobility` y en INTERCOMDOC.md. No implementado todavía.

## 1. Objective

Conectar el flujo conversacional de Intercom con el nodo de persistencia (WP-05): cada vez que un usuario cualifica, se descarta (por residencia o por plazo), o pasa a lead potencial, Intercom debe llamar al webhook `beckham-upsert-expediente` con los datos disponibles en ese momento.

## 2. Estructura real de `OnClick Mobility` (verificada 27/07 vía Chrome, sustituye cualquier nota anterior)

```
A. Bienvenida → B. F1 Residencia fiscal last 5 years
                   ├─ Sí → D. Fue residente (descarte duro, motivo "No residente ultimos 5 años") → Close
                   └─ No → E. Alta SS
                              ├─ No → H. No descartar aún... (lead potencial, recogida F4 ya montada) → Close
                              └─ Sí → F. Fecha Alta SS (Collect data texto + DC beckham_plazo_f2)
                                         → I. Path (branch veredicto)
                                              en_plazo    → G. Enviar a n8n (cualifica)
                                              fuera_plazo → M. Path (re-llama DC) → N. Path (descarte
                                                            por plazo, motivo "Alta en SS mas de 6 meses")
                                              else        → K. Path → retry a F (bug de WP-04, ver ahí)
```

**Cuatro puntos de conexión reales** (no 3 como decía la versión anterior de este WP — el descarte por residencia y el descarte por plazo son puntos distintos):

1. **D. Fue residente** — descarte por F1 (residencia).
2. **H. No descartar aún...** — lead potencial (ya tiene la recogida de `fecha_prevista_alta` montada, WP-03).
3. **G. Enviar a n8n** — cualifica (veredicto `en_plazo`).
4. **N. Path** — descarte por plazo vencido (veredicto `fuera_plazo`, alcanzado vía `M. Path`).

No existe una rama separada de descarte por salario ("Menos de 55 salario") en el canvas actual pese a que esa opción existe en el single-select `Descarte` de Airtable — queda para verificar si se añade en el futuro o es un valor legacy.

## 3. Scope

**In:**
- Nuevo Data Connector en Intercom que llama a `beckham-upsert-expediente` (el webhook de WP-05, ya publicado y verificado).
- **Los 9 Data inputs en modo "Let Fin collect"** (no "People attribute" ni "Custom value" — ver justificación en INTERCOMDOC C.2/C.3: los valores cambian por rama, así que un atributo vinculado o un valor fijo no sirven). `Required` **OFF** en los 9 salvo posiblemente ninguno (ver más abajo), `Fallback value` vacío en todos (el Code node de WP-05 ya descarta campos vacíos sin pisar datos).
- Los 9 inputs, todos tipo **Text** (el body de un DC manda todo entre comillas; WP-05 ya normaliza booleanos y fechas como texto).
- La clave del body debe ser exactamente **`"Descarte"`** (D mayúscula, igual que el campo de Airtable), aunque el Name del input sea `descarte`.
- Un solo DC, body con plantilla fija de 9 campos; en cada uno de los 4 puntos se mapean ("Map action inputs") solo los valores que esa rama conoce, el resto quedan vacíos y el Code node de WP-05 los omite sin pisar Airtable.
- Conectar el DC en los 4 puntos de disparo confirmados arriba.
- Todo en borrador, sin publicar hasta WP-08.

**Out:**
- Prueba end-to-end y publicación — WP-08.
- `get_expediente` / reentrada — WP-07.
- El fix del bug de F3 (branch `I. Path`) — WP-04, ya diagnosticado con causa raíz confirmada; los puntos 3 y 4 de este WP (los que dependen del veredicto) no se pueden probar de extremo a extremo hasta que WP-04 esté corregido y publicado.

## 4. Open questions

- **Crítica, sigue abierta:** confirmar en el editor que el token `{{user_id}}` (External ID) resuelve con valor real en el contexto de `OnClick Mobility` — solo se ha visto funcionando en el DC 461046 (`reuse_mobility`). Si no resolviera, el webhook devolvería 400 y no se guardaría nada. Verificar con una Simulation antes de conectar el DC en los 4 puntos.
- ¿"Map action inputs" en un paso de workflow admite escribir un valor **literal** (`true`, `No residente ultimos 5 años`) para un input en modo "Let Fin collect", o solo permite insertar chips de atributo? Si solo admite chips, hace falta crear un atributo temporal por rama con ese valor literal antes de mapear. Bloqueante para el diseño exacto de los puntos 1, 2 y 4 (los que mandan constantes como `alta_ss`/`descarte`).
- ¿Qué debe pasar en la conversación si el DC devuelve `ok:false`? Hoy el error no se mostraría al usuario ni quedaría registrado — propuesta: tag `beckham_persistencia_fallida` + mismo mensaje de cierre, a decidir.
