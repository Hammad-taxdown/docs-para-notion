# Plan semana 3–7 agosto 2026 · Bot Beckham

> Escrito el domingo 2/08. Objetivo de la semana: **viernes 7/08 = agente conversacional completo,
> demo desde el workspace TEST.**
>
> Premisa que cambia el plan de anoche: **los tres bloques del domingo no se hicieron** (Langsmith,
> prompt v3, borrador A/B). El lunes los absorbe, así que **el A/B se publica el martes, no el lunes.**

---

## Vista de la semana

| Día | Tipo de día | Bloque principal | Se publica |
|---|---|---|---|
| **Lun 3** | Escritorio | Langsmith + prompt v3 + borrador A/B fuera del editor | **No** |
| **Mar 4** | Navegador | Montar A/B en el canvas → publicar → validar en Messenger real | Sí (Intercom) |
| **Mié 5** | n8n | **Tools del agente** — el hueco entre "conversa" y "guarda" | Sí (n8n) |
| **Jue 6** | Mixto | DC de persistencia en los 4 puntos recolocados + WP-205b | Sí |
| **Vie 7** | Congelación | e2e de los 4 caminos + `contract-test.sh` 20/20 + demo | **No** |

### Por qué este orden

1. **El A/B va antes que el DC de persistencia** porque la reestructura *recoloca* los 4 puntos de
   disparo (D/H/G/N). Montar el DC sobre paths que van a moverse es trabajo tirado.
2. **Las tools del agente entran el miércoles**, que se quedó libre al matar WP-206b. Es el mayor
   riesgo de la fecha del 7: hoy el agente tiene **cero conexiones `ai_tool`**, así que conversa
   pero no guarda nada. El upsert y el `get_expediente` ya están construidos y probados por curl
   dentro de `beckham_bot` — es cableado y contrato, no construcción.
3. **El navegador es el recurso escaso** (~1 punto/día contra 3 en n8n). Solo el martes y parte del
   jueves son de navegador; el resto es escritorio y n8n.
4. **Fuera de esta semana, a propósito:** WP-203 (auth de los webhooks), separación de entornos y
   el borrado de las filas de prueba. Son precondiciones del **paso a producción del 10/08**, no de
   la demo del 7, y meterlas aquí rompe "un cambio por prueba".

### Reglas que aplican toda la semana

- Workspace **TEST**. Nada se publica sin decirlo antes.
- **Preview nunca.** Y **Simulation tampoco**: es de Fin, no del editor de Custom Bots. Un Custom
  Bot solo se valida publicando + Messenger real **como cliente** (nunca desde el Inbox) +
  verificación por MCP de conversación no-Preview **y** ejecución correlativa en n8n.
- **Un cambio por prueba.** Si se rompe, se declara antes, no después.
- Antes de diagnosticar nada: **comprobar qué está encendido y qué no.** Ha envenenado dos
  diagnósticos ya.
- **Después de cualquier sesión de canvas, auditar conexiones por MCP.** Salvó dos veces el 1/08.
- Para un aviso de Slack, el `status` de n8n **no vale**: vale el `ok:true` + `message_timestamp`
  y verlo en pantalla. Duración de subejecución < 50 ms = no se envió.
- Antes de llamar roto a algo en Intercom, descartar el **cooldown de 2 min** por cliente.
- El **distribuidor sigue DESACTIVADO** en TEST. No se reactiva.

---

## LUNES 3 DE AGOSTO — detallado

**Tipo:** día de escritorio. **Cero clics en el canvas de Intercom. Cero publicaciones.**
**Duración estimada:** ~5 h. **Entregables:** prompt v3 vivo en Langsmith + borrador A/B revisable.

### Bloque 0 · Reconocimiento de estado — 15 min

Antes de tocar nada, confirmar por MCP que nada se movió el fin de semana:

- `beckham_bot` → `versionId == activeVersionId == 154c9dc6-e468-416c-bd38-95e32b63411a`, **51 nodos**.
- `beckham_alertas` (`BJfExmwu1fI1aPpY`) → `active: true`, en el proyecto **Ops / Fiscal**.
- `beckham_bot.settings.errorWorkflow == "BJfExmwu1fI1aPpY"`.
- Cero ejecuciones nuevas desde el cierre del 1/08.
- El distribuidor de Intercom sigue **apagado**.

Si algo no cuadra, **para y se investiga**: el plan del día asume esta línea base.

### Bloque 1 · Langsmith — 45 min, tope duro

Va primero porque **la fuente de verdad del prompt se decide antes de escribir el prompt**. Si el
v3 se escribe en un `.txt` y se migra el martes, hay dos copias toda la semana — que es justo el
problema que esto viene a resolver.

**Paso 1 (5 min) — Decisión de arquitectura, antes de tocar nada.**
¿El nodo `David Beckham` lee de Langsmith **en cada turno** o **se lee una vez y se cachea**?

> **Recomendación: cachear.** Leer por turno convierte Langsmith en dependencia en tiempo real del
> bot, con la demo el viernes. Un fallo suyo pasaría a ser un bot mudo. Además suma latencia a los
> 8–22 s actuales por turno. **Este riesgo estaba declarado y sin decidir desde el 31/07 — no
> descubrirlo el 7/08 delante de la demo.**

**Paso 2 (40 min) — Tanteo de la conexión.**
n8n no tiene nodo nativo de Langsmith ⇒ lo previsible es un HTTP Request a su API con credencial.
Averiguar: endpoint de lectura del prompt, formato de autenticación, y cómo entra el texto en el
`systemMessage` sin romper lo que ya funciona (`$now`, `$json.cold_start`).

**Criterio de parada, en firme:** a los 45 min se para, salga o no salga.
- **Si sale:** se conecta y el martes queda libre. Verificación válida = leer el payload real con
  `get_execution` y `nodeNames:["David Beckham"]`, que devuelve el `systemMessage` **ya resuelto**.
  Es la única prueba de que una expresión resolvió.
- **Si no sale:** se para, el v3 se escribe en Langsmith igual (Paso 3 no depende de esto), y el
  `systemMessage` queda como **copia manual** hasta que se retome. Se anota la deuda.

**No se publica `beckham_bot` en este bloque en ningún caso.**

**Pendiente de terceros:** confirmar con **Paula** que el v3 sale de Langsmith y no de otro sitio.

### Bloque 2 · Prompt v3 — 1 h 30 min

**Se escribe DIRECTAMENTE en Langsmith.** `docs/prompt-paula-v2-2026-07-31.txt` (418 líneas) pasa a
ser histórico y **no se vuelve a editar**.

**Qué entra:**

1. **Triaje de 3 niveles** (fácil / complejo / difícil) dentro del propio agente. Es texto del
   prompt, no lógica de Intercom. Dato bueno de partida: el triaje **ya dispara solo** hoy (sin
   carta de empresa → *"tu caso tiene un matiz, preferimos revisarlo en una llamada"*), así que se
   está formalizando algo que ya funciona, no inventándolo.
2. **SLA de 24 h**, redactado como promesa que el negocio pueda sostener.
3. **Defecto 1 — domicilio no determinista.** En la conv A exigió calle + CP + población; en la
   conv B tragó `Calle Miguiel Hernandez 56` y lo metió incompleto en el RESUMEN. Mismo prompt, dos
   criterios. **Arreglo:** un único criterio explícito y no negociable, con ejemplo de aceptación y
   ejemplo de rechazo. Es un dato que va a Hacienda.
4. **Defecto 2 — validación asimétrica del teléfono.** Rigor con el NIF/NIE pero pasaron
   `+3466175816` (8 dígitos tras el +34) y `+34 234876459` (ningún móvil español empieza por 2).
   **Arreglo:** regla explícita de 9 dígitos y prefijo válido, al mismo nivel de rigor que el NIF.
5. **Quitar la frase `"Tu información queda guardada y podremos retomar justo donde lo dejamos"`.**
   Hoy es falsa por partida doble: no hay tools que guarden, y "retomar" exige además la lectura de
   reentrada. Vuelve cuando el miércoles esté cerrado, no antes.

**Restricciones duras que no se pueden olvidar al redactar:**
- **Texto plano y URLs desnudas.** `Callback_Intercom` borra TODO el HTML: un `<a href>` llega sin
  destino y los `<br>` desaparecen.
- **Regla 10 en pie: "NO TIENES HERRAMIENTAS."** Hasta el miércoles el agente no puede prometer
  guardar, agendar ni transferir. Prometer lo que nadie ejecuta hace indistinguible un fallo real
  de una alucinación.
- Idioma **ES + EN**. No habla de planes ni precios (remite a support).

**Marcar como `PENDIENTE-A/B`** la sección de apertura y handoff: depende del Bloque 3. Así el
bloque no se tira si el flujo cambia.

**No se toca el `systemMessage` de `beckham_bot` hoy.**

### Bloque 3 · Reestructura A/B en borrador — 2 h 30 min

**Se escribe el flujo FUERA del editor**, en un `.md` revisable. **Cero clics en el canvas.**
Reestructurar arrastrando cajas en caliente es exactamente como se desconectó el fallback el 1/08.

**Flujo objetivo (reunión del 31/07):** intro → residencia fiscal → y **solo si el cliente quiere
derivar**, las preguntas de comprobación. **Se eliminan** las preguntas redundantes ("quiero
comprobar los requisitos" / "no quiero comprobar los requisitos" y la de "no").

**El borrador tiene que contener, sí o sí:**

1. **Cada paso con su tipo, su texto literal y de qué path cuelga.** Nombres de path explícitos.
2. **Inventario de arrastre** — lo que ya existe y cuelga de los paths actuales, con qué pasa con
   cada cosa en la estructura nueva:
   - DC **`beckham_plazo_f2`** (468021) y su `Object mapping`.
   - Los 3 Conversation attributes **`veredicto_f2` / `fecha_limite_f2` / `dias_pasados_f2`**
     (Text los tres, `dias_pasados_f2` a propósito). **El branch los lee bajo el encabezado
     `Conversation`. Esto es lo que arregló F3 — no tocarlo, no "mejorarlo".**
   - Atributos de **texto** de F2 (`fecha de alta en la Seguridad Social`) y F4
     (`fecha prevista de alta`). Son de texto a propósito: los Date & Time no se pueden usar en
     workflows.
   - Los **4 puntos de persistencia D/H/G/N**, y dónde caen ahora.
   - Tag **`jarry_ignore`**, que se pone al inicio y no se toca.
3. **Invariantes que el borrador no puede violar:**
   - `Close` **solo** en D y N.
   - **Ninguna rama toca `ticket.state`.**
   - El lead se persiste **en H**, no al final.
   - **No hay GOTO en Intercom:** "volver al path B" no es implementable literal. El botón se
     queda, pero se **relanza** el bloque de filtros.
4. **Plan de validación del martes, escrito dentro del borrador.** Qué se prueba, en qué orden y
   cuál es el criterio de éxito de cada caso. **No puede decir "Simulation".** Criterio de éxito =
   conversación no-Preview + ejecución correlativa en n8n, verificadas por MCP.
5. **Punto de rollback:** anotar el `versionId` activo antes de tocar nada el martes.

**Salida del bloque:** un documento que se pueda leer entero y decir "sí" o "no" antes de abrir el
editor el martes.

### Cierre — 15 min

Entrada en `.spartax/log.md` y actualización de la memoria del proyecto: qué se decidió en
Langsmith, qué quedó del v3 y el estado del borrador A/B.

---

## Lo que NO se hace esta semana, y por qué

- **WP-203 (auth de los webhooks).** Los dos siguen públicos y sin auth sobre la tabla real de
  empleados. Precondición del **10/08**, no del 7.
- **Separación de entornos** (path por entorno o campo `entorno` en Airtable). Sin esto, la batería
  del 10–15/08 mete basura en producción. Se diseña el **8–9/08** con la guía de paso a producción.
- **Borrar las filas de prueba** de `Empleados` (~15 nuevas del 1/08). Va con lo anterior.
- **Reactivar el distribuidor.** Decisión tomada y reafirmada.

## Riesgos vivos de la semana

1. **Las tools del miércoles son el único día que separa "conversa" de "completo".** Si se
   complica, el viernes se demuestra un bot que habla y no guarda. Es el riesgo nº1 de la fecha.
2. **La convivencia del distribuidor encendido con `reuse_mobility` nunca se ha probado.** En TEST
   no muerde porque está apagado; en el workspace principal reaparece.
3. **Langsmith como dependencia en tiempo real** si el lunes se decide leer por turno.
4. **`UserId` no es único en `Empleados`** y los formularios no lo rellenan (WP-205b). Un empleado
   ya registrado que hable con el bot puede acabar en fila duplicada.
