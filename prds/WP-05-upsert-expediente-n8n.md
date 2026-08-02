---
id: WP-05
title: "F5: nodo de persistencia upsert_expediente dentro de beckham_bot"
status: done
size: M
depends_on: [WP-02]
milestone: "Fase 2 — Persistencia"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-05 — F5: nodo de persistencia upsert_expediente dentro de beckham_bot

> **Done (2026-07-27).** Construido a mano en el editor de n8n (no vía MCP, por riesgo de reescritura de credenciales sobre un workflow de producción con agente langchain), publicado y **verificado por curl** contra el webhook de producción: crea, actualiza sin duplicar, devuelve 400 sin email, tolera fechas inválidas sin romper ni borrar datos, y las 3 fechas se guardan en el día correcto.
>
> **Bug encontrado y resuelto durante el test:** una fecha `YYYY-MM-DD` se interpretaba como medianoche en hora local y, al convertirse a UTC, caía al día anterior en los campos de solo fecha de Airtable (`21/07/2026` se guardaba como `2026-07-20`). Se confirmó que la causa estaba después del Code node porque `fecha_limite_plazo`, que viajaba sin normalizar, también se desplazaba. Fix: el Code node emite ahora `YYYY-MM-DDT12:00:00.000Z` (mediodía UTC, inmune a desplazamientos de ±12h) y `fecha_limite_plazo` también pasa por la normalización.

## 1. Objective

Guardar en Airtable (`Empleados`), de forma idempotente por email, los datos que el bot recoge en cada conversación (alta SS, fecha de alta, descarte, lead potencial, fecha prevista de alta, fecha límite de plazo, ID de usuario de TaxDown), para que exista un expediente persistente y consultable más allá de la conversación puntual de Intercom.

## 2. Scope

**In:**
- Cadena nueva e independiente dentro del workflow `beckham_bot` (no conectada al flujo `Webhook1` existente): `Webhook_Upsert_Expediente → Validar y Normalizar (Code) → ¿Datos Válidos? (If) → Airtable Upsert Expediente / Respond Error → Respond OK`.
- Contrato de datos: **`user_id` + `intercom_conversation_id` (requeridos)**; `email`, `alta_ss`, `fecha_alta_ss`, `Descarte`, `lead_potencial`, `fecha_prevista_alta`, `fecha_limite_plazo` (todos opcionales, upsert parcial — solo se escribe lo que llega).
- **Clave de negocio = `UserId`** (ID interno de TaxDown, sincronizado con Intercom vía token `{{user_id}}`). Decisión del usuario del 2026-07-27, sustituye a la decisión previa de usar `email`: el `UserId` es estable y el email puede cambiar. Verificado antes del cambio que la tabla solo tenía 2 filas preexistentes y ninguna con `UserId`, por lo que no había datos heredados en riesgo. **Sin fallback a email** (una lógica de doble clave es justo donde se cuelan los duplicados).
- Salvaguarda obligatoria: `user_id` vacío o ausente → HTTP 400 sin escribir nada. Necesaria porque existen filas con `UserId` vacío y un upsert con valor de match vacío podría sobrescribir una fila ajena.
- Normalización en el Code node: fechas `DD/MM/AAAA` o ISO → `YYYY-MM-DDT12:00:00.000Z`; booleanos que llegan **como texto** (`"true"`/`"false"`/`"si"`/`"no"`) → booleano real, porque el body de un Data Connector de Intercom manda todo entre comillas; `trim` en `user_id` para que un espacio no genere fila nueva.
- Upsert por `UserId` como columna de match, con `typecast: true`.
- Credencial Airtable propia (Personal Access Token nuevo, ya que la credencial OAuth2 existente en `beckham_bot` no daba acceso a la base `Empleados`).

**Out:**
- El Data Connector de Intercom que llama a este webhook — WP-06.
- `get_expediente` (consulta de reentrada) — WP-07.
- Prueba end-to-end en Messenger real y publicación — WP-08.

## 3. Open questions

Ninguna pendiente de decisión — contrato ya acordado. Queda pendiente terminar la construcción manual (falta el nodo `Respond OK`) y probar por curl antes de pasar a WP-06.
