---
id: WP-07
title: "F5: get_expediente — consulta de reentrada por UserId"
status: building
size: S
depends_on: [WP-02]
milestone: "Fase 2 — Persistencia"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-07 — F5: get_expediente — consulta de reentrada por UserId

> ## 🔨 BUILDING — existe un borrador sin verificar (2026-07-28)
>
> **Clave corregida:** la búsqueda es por **`UserId`**, no por email. El título y el cuerpo original de este PRD decían email; queda anulado por la decisión del 27/07 de cambiar la clave de negocio.
>
> **Existe el workflow `beckham_get_expediente` en n8n** (id `PAGK9sof3bfTdbRB`, creado el 28/07 a las 09:42 UTC, **inactivo**). Lo creó un agente por MCP antes de morir por límite de sesión, con esta forma prevista: `Webhook (POST /beckham-get-expediente) → Validar (exige user_id con trim, 400 si falta) → Buscar en Airtable por UserId → Formatear respuesta → Respond`.
>
> ⚠️ **No darlo por hecho:** tiene `triggerCount: 0`, y un workflow con webhook debería tener 1. Probablemente quedó incompleto. Hay que abrirlo, revisarlo nodo por nodo, **seleccionar a mano la credencial de Airtable** (la API de n8n no la devuelve, así que no pudo asignarse) y probarlo por curl antes de considerarlo construido.
>
> **Desviación registrada:** WP-05 se construyó *dentro* de `beckham_bot` por petición del usuario, pero `get_expediente` se creó como **workflow standalone**, porque editar `beckham_bot` por MCP está prohibido (la API no devuelve `credentials` y `update_workflow` reescribe el workflow completo). Queda a decisión del usuario si se consolida más adelante.
>
> **Y este WP tiene ahora un segundo cliente:** el agente conversacional (WP-09) lo necesita como **herramienta de consulta** — es la interpretación más probable de la tool que el usuario describió como "pedir unos datos".

## 1. Objective

Cuando un usuario que ya tiene expediente (por ejemplo, un lead potencial que ya recibió un descarte o cualificación en una conversación anterior) vuelve a escribir, poder consultar su estado guardado en Airtable en vez de tratarlo como un contacto nuevo desde cero.

## 2. Scope

**In:**
- Endpoint (webhook) `get_expediente` que busca por `email` en `Empleados` y devuelve el expediente si existe, o "no existe" si no.
- Definir dónde se engancha esta consulta en el flujo de Intercom (¿al inicio de `OnClick Mobility`, antes del filtro?).

**Out:**
- Qué hacer exactamente con el resultado en Intercom (saltar el filtro, mostrar un mensaje distinto, etc.) — a decidir en `/prd:fill`, puede generar su propio WP si resulta ser más grande de lo esperado.

## 2b. Hallazgo verificado (2026-07-27) — estado real de la cadena de texto libre

La cadena `Webhook1 → If2 → Wait2 → Traer_Conversacion_intercom1 → Formatear_conversacion1 → Existe_Expediente1 → Callback_Intercom` (el camino que atiende cuando el usuario escribe texto libre, vía `reuse_mobility`) está **funcionalmente vacía en su tramo final**. Verificado por MCP:

- **`Existe_Expediente1`** tiene la condición `leftValue: "id"` como **cadena literal**, no como expresión (`={{ $json.id }}`) → evalúa "¿está vacío el texto 'id'?" → siempre `false`. Además **sus dos ramas (`true` y `false`) van al mismo nodo**, así que la bifurcación no distingue nada. Originalmente leía el `id` devuelto por `Search records2` (nodo Airtable eliminado el 2026-07-27), por lo que ahora no tiene fuente de datos.
- **`Callback_Intercom`** envía `{"data":{"mensajeUsuario": $json.message}}`, pero **ningún nodo de esta cadena rellena `$json.message`** (los `Set_*` que lo fijaban eran del Bloque① eliminado). Es decir, probablemente envía `undefined`.

**Decisión: no se toca por ahora** (2026-07-27). No molesta (es un camino aparte del de persistencia F5) y es el esqueleto natural sobre el que construir este WP. Arreglar la condición del If, decidir qué alimenta `$json.message`, y enganchar `get_expediente` es precisamente el trabajo de este Work Package.

## 3. Open questions

- ¿Se engancha ya en esta fase, o se deja completamente para una fase posterior (el propio plan original lo marcaba como "fase 2 opcional")?
- ¿Dónde exactamente en `OnClick Mobility` se debería consultar (antes de qué paso)?
- ¿Qué debe pasar en Intercom si el expediente ya existe: saltar preguntas ya respondidas, mostrar un resumen, o solo registrarlo internamente sin cambiar la conversación?
