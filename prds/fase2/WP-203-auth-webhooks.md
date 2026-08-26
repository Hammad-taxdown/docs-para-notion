---
id: WP-203
title: "Prerrequisito P2: autenticación en los dos webhooks y rotación del path a UUID"
status: done
size: S
depends_on: []
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

> **CERRADO SIN CONSTRUIR — decisión del usuario al cerrar `T053`. No se reabre.**
>
> Este paquete pasa a `done` **no porque se haya hecho, sino porque se ha cerrado**: el vocabulario de
> estados del tracker (`skeleton · specified · building · done`) no tiene un valor para «descartado», y
> mientras estuvo en `building` **todos los recuentos lo contaban como trabajo listo para empezar** —
> incluidos los míos, hasta el 26/08. `critical` pasa también a `false`: dejaba la ruta crítica
> contaminada con un nodo que nadie va a construir.
>
> Lo que decía este PRD (auth en los dos webhooks y rotación del path a UUID) **sigue siendo cierto
> como riesgo**: los webhooks son públicos y sin autenticar. Lo que cambió es la decisión de gastar
> tiempo en ello antes del 31/08.

# PRD · WP-203 — P2: auth en `Webhook1` y en `beckham-upsert-expediente`

> **NOTA DEL 11/08/2026 · **PROBADO Y DESACTIVADO A PROPÓSITO (10/08).** El auth funciona: 403 sin cabecera y 200 con `X-Beckham-Token`, en el escritor y en el lector. Se apagó por un conflicto de permisos: la credencial `beckham_webhook_auth` **no la ve la identidad del servidor MCP integrado de n8n**, así que con ella puesta la API no puede leer el workflow y **se pierde el diff estático** — que en dos días ha cazado tres fallos silenciosos que ningún curl detecta. La credencial NO se ha borrado: reactivar son cuatro clics. **Decisión del usuario del 11/08: es lo ÚLTIMO que se hace, justo antes de publicar.** Y entonces hay que **generar un token nuevo**, porque el actual ha pasado por la terminal. Frontmatter sincronizado el 11/08.**

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
