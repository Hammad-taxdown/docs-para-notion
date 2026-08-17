---
id: WP-209
title: "MUERTA (14/08/2026) · Experimento sonda: duplicado desechable de OnClick Mobility que cierra nueve incógnitas"
status: done
size: M
depends_on: []
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-209 — Conversación sonda

> **Punto de decisión de la Fase 2: hasta aquí no se construye nada.** Es la fusión de los tres
> experimentos que A1, A2 y A3 propusieron por separado; los tres apuntaban a la misma incógnita raíz.
> Requiere autorización explícita del usuario (decisión abierta U2): si la conversación se convierte
> en ticket y pasa a `Submitted`, el contacto de e2e **recibe un correo** (HECHO VERIFICADO).

## 1. Objetivo

Responder con una sola conversación no-Preview si un Conversation attribute escrito con un paso `Set`
se propaga, si `Set` admite literales y cadena vacía, y si el texto libre dispara el distribuidor.

## 2. Alcance

**In:**
- Duplicar `OnClick Mobility` como `SONDA AAAAMMDD` (el duplicado es además el rollback que Intercom
  no ofrece por API).
- Crear el Conversation attribute **`modo_bot` (Text)** — es el definitivo, no de laboratorio.
- Pasos de sonda: `Set modo_bot = sonda_a` (literal) → branch en el **mismo** path
  (`MISMO_PATH_OK`/`FALLA`) → `Collect data` de texto libre → branch en **otro** path
  (`OTRO_PATH_OK`/`FALLA`) → `Set modo_bot = ""` → branch `has any value`
  (`RESET_FALLA`/`RESET_OK`).
- Publicar **solo el duplicado**, audiencia restringida a `beckham-e2e@taxdown.es`, entrando por el
  launcher real, tras cerrar sus conversaciones abiertas y esperar el cooldown de 2 minutos.
- Teclear además un segundo mensaje en el composer con el colector activo.
- Lectura por MCP: `custom_attributes`, `ticket`, `Workflow: Preview`, timeline completo de parts, y
  la ejecución de n8n con `x-intercom-source-dataconnector-id` no vacía.

**Out:**
- Cualquier cambio en producción. La sonda no toca `OnClick Mobility`, ni n8n, ni Airtable.
- Pruebas con contactos reales: prohibidas mientras `Submitted` mande correo.

## 3. Dependencias

Ninguna técnica. Dependencia de autorización: **U2**.

## 4. Entregables

1. Duplicado `SONDA AAAAMMDD` publicado y luego borrado.
2. Tabla de nueve observaciones con su señal y su respuesta, pegada en la bitácora.
3. Par (`conversation_id` no-Preview, `execution_id`) por cada observación que lo permita.

## 5. Verificación

El WP se cierra cuando las **nueve** observaciones tienen respuesta escrita, cada una con su señal
literal (`MISMO_PATH_OK`, `OTRO_PATH_OK`, `RESET_OK`, tipo de la part, `ticket == null`, primera part
`admin_initiated`, cabecera de DC presente). Una observación sin señal registrada **no cuenta como
respondida**, y el WP no cierra.

## 6. Riesgo

Alto en un solo aspecto: el correo al contacto de e2e si la conversación se convierte en ticket.
Declarado antes de ejecutar. Riesgo secundario: publicar el duplicado con audiencia mal restringida y
alcanzar a un usuario real → comprobar la audiencia **antes** de publicar.

## 7. Rollback

Despublicar y borrar el duplicado `SONDA`. Los pasos de sonda no existen en producción. `modo_bot` se
conserva porque es el atributo definitivo.
