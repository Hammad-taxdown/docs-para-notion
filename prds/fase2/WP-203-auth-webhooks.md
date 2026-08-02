---
id: WP-203
title: "Prerrequisito P2: autenticación en los dos webhooks y rotación del path a UUID"
status: specified
size: S
depends_on: []
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-203 — P2: auth en `Webhook1` y en `beckham-upsert-expediente`

> HECHO VERIFICADO: ambos webhooks son públicos **sin autenticación** y escriben o leen datos reales
> de empleados. `Webhook1` es POST sin auth → cualquier campo que llegue en el body es falsificable.

## 1. Objetivo

Que ninguna llamada anónima pueda escribir en el expediente ni provocar una respuesta del agente.

## 2. Alcance

**In:**
- Autenticación por header en `Webhook1` y en `beckham-upsert-expediente` (credencial de n8n, secreto
  configurado también en el Data Connector).
- Rotar el path adivinable `beckham-upsert-expediente` a un UUID.
- Invariante escrita: **el `modo` nunca se lee del body del webhook**; se deriva server-side (WP-211).

**Out:**
- El resolver de modo → WP-211.
- Recorte de PII en logs y desactivación del guardado de datos de ejecuciones exitosas → WP-231.

## 3. Dependencias

Ninguna, pero **cambiar el path obliga a reconfigurar el DC en Intercom**, que es la superficie sin
curl: hacerlo antes de conectar cualquier DC nuevo de la Fase 2.

## 4. Entregables

1. Header auth activo en los dos webhooks.
2. Path del upsert rotado a UUID y actualizado en el DC.
3. Nota en el PRD maestro con la invariante "el modo no viaja en el body".

## 5. Verificación

- `curl` anónimo (sin header) a los dos endpoints devuelve **401** y **no** aparece ejecución con
  escritura en Airtable.
- `curl` con el header correcto devuelve `ok:true`.
- El path viejo devuelve **404**.

## 6. Riesgo

Medio: si el DC no se actualiza con el nuevo path o el nuevo header, **toda la persistencia deja de
funcionar** desde Intercom. Mitigación: cambiar path y header en un solo paso y probar
inmediatamente con una conversación no-Preview.

## 7. Rollback

Reactivar el path anterior en paralelo (dos webhooks) hasta confirmar el DC, y luego retirar el viejo.
Anotar `versionId`.
