# Update de seguimiento — Bot Mobility (Ley Beckham)

**Proyecto:** automatización del alta al régimen Beckham vía bot conversacional (Intercom + n8n + Airtable).
**Última actualización:** 22/07/2026 (sesión de tarde).

---

## 🗓️ Ayer — 21/07/2026

### 🌅 Panorama INICIAL (de dónde partíamos)
- El **filtro eliminatorio F1/F2/F3** (¿alta en SS?, fecha + plazo de 6 meses, ¿residente fiscal últimos 5 años?) estaba construido **dentro de n8n** (Bloque ①), verificado, pero **en borrador**.
- **Problema de fondo:** el bot de Intercom no mostraba la respuesta al cliente — faltaba el paso "Reply". Y la **persistencia en Airtable estaba desconectada**.

### ☀️ Panorama MEDIANO (lo que se decidió y empezó)
- **Análisis completo de la arquitectura** (Intercom / n8n / LangSmith / Airtable): riesgos, plan y mapeo de los 3 workflows de Intercom + el Data Connector. Se aclaró que **LangSmith es observabilidad/evaluación de prompts, NO "entrena" el bot**.
- **GIRO clave (reunión con el manager):** los filtros F1/F2/F3 **salen de n8n y pasan a vivir dentro del bot de Intercom**. n8n queda como orquestación + persistencia + (futuro) agente de IA.
- Se empezó a construir el filtro en el workflow **OnClick Mobility** de Intercom: mensaje de bienvenida con explicación de la ley + "¿quieres acogerte?", y las preguntas F1/F2/F3.
- Se arregló el **gap del "Reply"**: en `n8n_BOT_mobility` se añadió el paso que muestra la respuesta al cliente + un fallback.

### 🌙 Panorama FINAL (cierre del día)
- Se **reordenó** el filtro en Intercom (tras hablarlo con el manager): **1º Residencia fiscal** (descarte directo si aplica) → **2º Alta en SS** → **3º Fecha de alta**. Así se descarta antes y se evitan preguntas de más.
- Nueva idea de negocio: **si el cliente NO está dado de alta, ya no se descarta** — se guarda como **"lead potencial"** para no perder el contacto (podremos ayudarle o retomarlo más adelante).
- Se **auditó el CSV nuevo** de Airtable: aparecen ya los campos de F3 (`Noresidenteultimosanios`) y del motivo de descarte (`Descarte`).
- Se documentó el **diseño del agente de IA** para más adelante (tools, subworkflows, contrato de datos, salida estructurada).

---

## 🗓️ Hoy — 22/07/2026

### 🌅 Sesión de MAÑANA — cómo empezamos y qué hicimos
Retomamos con el filtro ya montado en Intercom. Decisiones y trabajo de la mañana:

- **Limpieza de n8n:** se **borraron los nodos del filtro antiguo** en `beckham_bot` (ya obsoletos), conservando la lógica reutilizable (el cálculo del plazo). Verificado.
- **Decisión sobre F2 (cálculo del plazo de 6 meses):** al ser un **plazo legal**, se decidió calcularlo en **n8n** (cálculo exacto de calendario), no con una aproximación por días en Intercom.
  - Se creó un **mini-workflow de n8n dedicado** (`beckham_f2_plazo`) que recibe la fecha, calcula si está en plazo o fuera, y responde el veredicto. **Probado y funcionando.**
  - Se creó un **Data Connector nuevo** en Intercom (`beckham_plazo_f2`) que conecta el bot con ese cálculo.
  - En el bot, F2 ahora **ramifica automáticamente**: en plazo → sigue; fuera de plazo → descarte; y si la conexión falla → mensaje + derivar a una persona (para no perder el lead).
  - Se corrigió por el camino un **bug de formato de fecha** en el cálculo.
- **Auditoría de Airtable en vivo:** se revisó el esquema real. Hallazgos importantes:
  - Listos: `Noresidenteultimosanios` (F3, checkbox) y `Descarte` (motivo, selección).
  - A tener en cuenta: `FechaAlta` es un **lookup** (dato oficial del empleador, no escribible por el bot) y `AltaSeguridadSocial` es un **adjunto** (documento, no un sí/no).
  - Conclusión: el bot necesita **campos propios escribibles** para sus datos.

### 🌤️ Sesión de TARDE — decisiones nuevas (2ª reunión con Alina) y plan
Tras la reunión de seguimiento con Alina, se añaden **3 cosas** al alcance y se toman decisiones:

1. **Airtable a nuestro gusto:** tenemos libertad para rediseñar el esquema (crear/ajustar campos, `Descarte`, `FechaAlta`…) adaptándolo a lo que necesitan Intercom y n8n.
2. **Bug de la fecha (F2):** el bot pide la fecha mostrando el nombre técnico del campo ("fecha_alta_ss") y pidiendo **fecha + hora** innecesaria. **Evaluado:** el error es de **configuración en Intercom** (el paso de recogida de datos), no de n8n ni del Data Connector. Se arreglará reescribiendo el mensaje y dejando el campo **solo fecha**.
3. **Descarte por plazo vencido:** el bot mostrará al cliente **la fecha límite que tenía Y por cuántos días se ha pasado** (ambos).
4. **Lead potencial (aún sin alta):** el bot preguntará y **guardará la fecha prevista de alta** en Airtable. *(Los recordatorios automáticos los montará otra persona; nosotros solo dejamos el dato bien guardado.)*

**Decisiones tomadas hoy (tarde):**
- Recordatorios lead potencial → **los hace otra persona**; nuestro alcance = **guardar bien la fecha prevista en Airtable**.
- Descarte por plazo → **mostrar fecha límite + días pasados** (ambos).
- `FechaAlta` → **mantener el lookup oficial del empleador** y usar un campo aparte (`fecha_alta_ss`) para la fecha que declara el cliente.

---

## ✅ Estado actual (resumen)
- **Filtro F1/F2/F3 completo y publicado en Intercom**, incluido el **cálculo real del plazo** (vía n8n + Data Connector) y la rama de **lead potencial**.
- **n8n limpio** de la lógica antigua del filtro.
- **Airtable auditado**; pendiente rediseñar el esquema y crear los campos del bot.

## 🔜 Próximos pasos (desde ahora)
1. **Conectar Airtable por MCP** (para trabajar más rápido, sin navegador).
2. **Rediseñar el esquema de Airtable** y crear los campos del bot: `alta_ss`, `fecha_alta_ss` (solo fecha), `intercom_conversation_id`, `lead_potencial`, `fecha_prevista_alta`; alinear las opciones de `Descarte`.
3. **Arreglar el bug de la fecha** en Intercom (mensaje + campo solo fecha).
4. **Mostrar fecha límite + días pasados** en el descarte por plazo vencido.
5. **Guardar la fecha prevista de alta** del lead potencial en Airtable.
6. **Conectar n8n con Airtable** (buscar/crear/actualizar el expediente, sin duplicados).
7. **Agente de IA** (según el diseño ya documentado).
