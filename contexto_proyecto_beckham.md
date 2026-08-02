# Contexto del proyecto — Automatización expediente Ley Beckham

**Autor:** Hammad (Tax Operations, TaxDown) · con Paula Escudero como coautora
**Objetivo:** automatizar el tramo manual del proceso de solicitud del régimen Beckham (art. 93 LIRPF), desde la captación hasta la preparación del Modelo 149, mediante un bot conversacional (Intercom) + n8n + Airtable.
**Estado:** en construcción activa. El flujo de n8n se está montando manualmente en el editor, nodo a nodo, con guía de Claude. Este documento se actualiza en cada iteración.

---

## 1. Reparto de trabajo

- **Hammad**: diseño y construcción del workflow de n8n (lógica determinista: webhooks, switches, cálculos, escritura en Airtable).
- **Paula**: escribe los prompts del agente conversacional y está creando la tabla de Airtable (`Expediente`) desde cero.
- El agente conversacional de Paula **no se usa todavía** para las preguntas eliminatorias (F1–F3) — ver decisión de arquitectura más abajo.

## 2. El régimen Beckham en una frase (contenido de negocio)

Régimen fiscal especial para quien se traslada a vivir y trabajar a España: 6 años (año de llegada + 5) tributando al 24% fijo hasta 600.000€ (47% el exceso), solo por rentas españolas —salvo las del trabajo, que tributan íntegras—, sin declarar bienes en el extranjero. Requisitos: no residente fiscal los últimos 5 años + traslado motivado. Plazo **improrrogable de 6 meses desde el alta en la SS**. Se solicita con el Modelo 149 (+ Modelo 030 previo). Fuente: `IRPF_TaxDown2025.pdf` del proyecto.

## 3. Historial de esta fase (lo importante para retomar)

- **Intento 1 (abandonado):** se partió de un workflow existente de otro bot (`mobility_bot.json`, en realidad el bot de "Trazabilidad cripto") como plantilla, duplicándolo dentro de n8n. Al generar un JSON completo corregido para pegar, se copiaron por error el `path`/`webhookId` del webhook original → **colisión de webhook con el bot de cripto en producción** (dejó de ejecutarse correctamente). Lección: **nunca reutilizar `webhookId`/`path` de un workflow que ya está en producción**; cualquier webhook nuevo debe crearse desde cero en el editor para que n8n le asigne un ID único.
- **Intento 2 (actual):** se ha construido el flujo desde cero, directamente en el editor de n8n (no vía JSON generado), con nodos con sufijo `1`/`2` para evitar cualquier colisión de IDs con el bot de cripto.
- Se conectó un **MCP de Intercom** (`https://mcp.intercom.com/mcp`) en n8n vía el nodo **MCP Client Tool**, disponible para que el AI Agent (cuando exista) llame acciones de Intercom directamente. De momento no se usa todavía para las preguntas F1–F3 (ver decisión de abajo).

## 4. Decisión de arquitectura: cómo se envían las preguntas F1–F3

Se evaluaron dos opciones (planning):
- **A)** Montar ya el nodo AI Agent (desactivado) a la espera de que Paula defina prompt/tools.
- **B)** Texto fijo desde n8n ahora, migrar a agente más adelante.

**Se eligió la Opción B.** Motivo: el nodo Agente depende de decisiones de Paula (prompt, tools) que aún no existen; montarlo ahora sería trabajo especulativo. Se diseña el punto de envío como **un único nodo intercambiable** (`Enviar_Pregunta` / `Enviar_F1`, `Enviar_F2`, etc.) para que, cuando Paula tenga el agente listo, sea una sustitución de un solo nodo sin tocar el resto del flujo (guardado, avance de pregunta, descartes).

## 5. Estado actual del workflow n8n (nombres reales en el editor)

Cadena construida y funcionando hasta la fecha:

```
Webhook1 → If2 (debounce) → Wait2/directo → Traer_Conversacion_intercom1 → Formatear_conversacion1
        → Search records2 (Airtable, desactivado — tabla de Paula aún no existe)
        → Existe_Expediente1
              ├─ true (ya existe)  → Determinar_Pregunta_Pendiente1 → Filtro_Eliminatorio1 (Switch F1/F2/F3/fallback)
              └─ false (no existe) → Crear_Expediente1 (Airtable, desactivado)
```

**Pendiente inmediato (en construcción ahora mismo):**
- Reconectar `Crear_Expediente1` → nuevo nodo `Enviar_F1_Inicial` (texto fijo, primera pregunta), en vez de seguir hacia `Determinar_Pregunta_Pendiente1` (ese camino es solo para expedientes que ya existían).
- Construir las 3 rutas del Switch `Filtro_Eliminatorio1`:
  - **F1** (¿alta SS? sí/no) → guardar o descartar con mensaje específico, y si continúa, enviar F2.
  - **F2** (fecha de alta SS, calcular si +6 meses) → guardar o descartar con mensaje genérico, y si continúa, enviar F3.
  - **F3** (¿residente fiscal últimos 5 años? sí/no — invertido: "No" cualifica) → guardar o descartar con mensaje genérico. Si cualifica, sigue al bloque ② (datos básicos), aún sin construir.

## 6. Textos exactos de las preguntas y descartes (de `flujo_bot_beckham.html`)

- **F1**: "¿Estás dado de alta en la Seguridad Social española?"
  - Descarte (No): "Antes tienes que darte de alta en la Seguridad Social 📋. Ese es el primer paso: en cuanto tengas tu alta, el plazo de 6 meses empieza a correr y podremos tramitar tu solicitud. Vuelve entonces y seguimos." · `motivo_descarte = sin_alta_ss`
- **F2**: "¿Qué día te diste de alta en la Seguridad Social?" (fecha exacta) → lógica: `fecha_alta_ss + 6 meses >= hoy`
  - Descarte (+6 meses): "Ups… no puedes acogerte al régimen 😕. ¿Te ayudamos con tu declaración? ¿Necesitas ayuda? Contáctanos." · `motivo_descarte = plazo_vencido`
- **F3**: "¿Has sido residente fiscal en España en los últimos 5 años?" (con texto de ayuda sobre qué significa "residente fiscal")
  - "No" → cualifica, continúa. "Sí" → descarta con el mismo mensaje genérico de F2 · `motivo_descarte = residente_5_anios`

## 7. Modelo de datos (Airtable) — referencia, aún no creada por Paula

Tabla única **Expediente**. Campos relevantes ya usados en el flujo actual: `intercom_contact_id`, `email`, `conversation_id`, `estado_expediente` (10 valores: pendiente de hacer llamada · llamada realizada · pendiente de formulario usuario · pendiente de hacer por tax down · pendiente de datos del usuario · pendiente de confirmación del usuario · confirmado · concedido · parado · descartado), `alta_ss`, `fecha_alta_ss`, `residente_5_anios`, `eliminado` (soft delete), `motivo_descarte`, `fecha_descarte`.

**Aviso pendiente:** el modelo E/R (`modelo_er_beckham.html`, v5/v6) tiene un `estado_expediente` de 5 valores antiguo — hay que remapear a los 10 valores nuevos de este documento cuando Paula construya la tabla.

## 8. Pendientes generales (más allá de F1–F3)

- Bloque ② Datos básicos (D1–D5: nombre, teléfono, NIF/NIE/pasaporte, nacionalidad, domicilio) y bloque ③ Perfil (PF1–PF7) — sin empezar.
- Bloque ④ Enrutado (caso claro vs. complejo → Calendly).
- Bloque ⑤ Reporte fiscal (PDF).
- Bloque ⑥ Captura guiada Modelo 030+149.
- Comparador fiscal: fuera del flujo, lead magnet standalone (decisión ya tomada en iteración v0.10, ver documento original del proyecto).
- Sustituir los nodos `Enviar_F1`/`Enviar_F2`/`Enviar_F3` por el agente conversacional de Paula cuando esté listo (diseño ya preparado para que sea una sustitución de un solo nodo).
- Migrar `Search records2` / `Crear_Expediente1` de placeholders (base/tabla vacíos) a la tabla real en cuanto Paula la tenga creada.
- Plan de errores/rate-limits de Airtable y pruebas con casos borde — todavía no abordado (ver fases 3–5 del plan original de planificación).
