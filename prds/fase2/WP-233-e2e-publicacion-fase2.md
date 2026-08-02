---
id: WP-233
title: "Prueba end-to-end de la Fase 2 y publicación del canvas"
status: specified
size: M
depends_on: [WP-213, WP-214, WP-215, WP-216, WP-217, WP-221, WP-224, WP-227, WP-231, WP-232]
milestone: "Fase 2 conversacional — FAQ"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-233 — E2E y publicación

> Último WP del MVP. No se publica en Intercom si falta el backup, falta el par (conversación
> no-Preview, ejecución) o `contract-test.sh` no está verde.
> Prohibido probar con contactos reales mientras `Submitted` mande correo: **solo**
> `beckham-e2e@taxdown.es`, fuera de la audiencia de Fin.

## 1. Objetivo

Demostrar que los cuatro recorridos del menú y los cuatro escenarios de reentrada funcionan en
conversación real, y publicar.

## 2. Alcance

**In:**
- Matriz de **4 recorridos** del menú (comprobar requisitos · calculadora · preguntas · humano), cada
  uno con su par (`conversation_id` no-Preview, `execution_id`).
- Matriz de **4 escenarios de reentrada** (hilo abierto · hilo cerrado · dentro del cooldown de 2 min ·
  vuelta a los 3 días).
- Recorridos de dato: `en_plazo`, `fuera_plazo`, fecha no parseable ×2 intentos, `H` con abandono, `H`
  con "en marzo".
- Backup `OnClick Mobility — BACKUP AAAAMMDD` antes de publicar.
- Bandeja del contacto de e2e revisada tras cada recorrido.

**Out:**
- Multi-turno → WP-228. Recordatorios → WP-230. Reincorporación de leads → WP-07.

## 3. Dependencias

Todos los WP del MVP listados en `depends_on`.

## 4. Entregables

1. Tabla de 8 escenarios con sus pares (conversación, ejecución) en la bitácora.
2. Canvas publicado con backup registrado.
3. PRD maestro actualizado con las invariantes descubiertas y las hipótesis muertas anotadas.

## 5. Verificación

El WP cierra solo si **todo** lo siguiente es cierto, con evidencia pegada:
1. Los 8 escenarios tienen su par (`conversation_id` no-Preview, `execution_id`) y
   `x-intercom-source-dataconnector-id` no vacía donde aplique.
2. `contract-test.sh` verde.
3. En **ningún** escenario cambia `ticket.state`, y el contacto de e2e **no recibe ningún correo**.
4. Todo recorrido que pasa por `H` tiene fila con `lead_potencial=true` y
   `precision_fecha_prevista` no vacía.
5. `corr_id` presente en Intercom, n8n y Airtable para el mismo caso.
6. Backup del canvas listado en la entrada de bitácora **antes** de publicar.

## 6. Riesgo

Alto por acumulación: es donde aparecen las interacciones entre ramas que cada WP probó por separado.
Mitigación: la matriz completa, y la regla de que un escenario sin par registrado **no cuenta como
probado**.

## 7. Rollback

Republicar el backup `OnClick Mobility — BACKUP AAAAMMDD`. En n8n, `versionId` anotado de cada workflow
tocado en la sesión.
