---
id: WP-11
title: "Método de triaje de casos (a definir con Alina)"
status: skeleton
size: M
depends_on: [WP-09]
milestone: "Fase 3 — Agente IA"
owner: "Hammad, Alina"
external: "Alina (negocio)"
critical: false
issue: ""
---

# PRD · WP-11 — Método de triaje de casos

> **Skeleton (2026-07-28).** Anotado al cierre de la sesión a petición del usuario: *"implementar el método de triaje que se habló con Alina"*. El detalle se recoge en la próxima sesión — **no hay que empezar a construir nada hasta entonces.**

## 1. Objective (provisional)

Clasificar los casos que llegan al bot para que cada uno siga el camino que le corresponde, en vez de tratarlos todos igual. Hoy el flujo solo distingue **cualifica / descarta / lead potencial**, y todo lo que cualifica va al mismo sitio.

## 2. Qué se sabe hoy

- Es un método acordado **con Alina**, o sea que las reglas son **de negocio**, no técnicas: hay que recogerlas de ella, no inventarlas.
- Encaja después del agente conversacional (WP-09), porque el triaje presumiblemente usa lo que el agente recopila.
- **No confundir con el filtro F1–F3** (WP-01), que ya está hecho y decide si el usuario *puede* acogerse al régimen. El triaje es sobre qué hacer con los que sí pueden.

## 3. Preguntas a resolver en la próxima sesión

1. **¿Qué categorías** tiene el triaje y cómo se llaman exactamente?
2. **¿Con qué criterios** se asigna cada categoría, y de dónde sale cada dato (lo pregunta el agente, está en Airtable, lo aporta el empleador…)?
3. **¿Quién decide**: reglas deterministas, el agente IA, o una persona que revisa?
4. **¿Qué cambia** según la categoría: el camino en Intercom, la prioridad, el equipo asignado, la documentación que se pide, el `Status` de Airtable…
5. **¿Dónde se persiste** la categoría — ¿un campo nuevo en `Empleados`, o el `Status` que ya existe y que hoy el bot no escribe?
6. **¿Es visible para el cliente** o es puramente interno?

## 4. Dependencias y avisos

- Si el triaje va a escribir en Airtable, **debe pasar por el único escritor** (el upsert de WP-05, vía el discriminador `punto`). Ninguna pieza nueva debe escribir directamente en `Empleados`.
- Si el triaje introduce categorías que hay que representar en Airtable, revisar primero el campo **`Status`** (single-select operativo que ya existe y que hoy nadie del bot rellena) antes de crear un campo nuevo.
- Recordar el agujero abierto de WP-06: **ninguna rama limpia las marcas de otra**. Si el triaje puede reclasificar un caso, hay que definir qué se borra al cambiar de categoría.

## 5. Open questions

Todas. Este PRD se completa con `/prd:fill` después de hablar con Alina.
