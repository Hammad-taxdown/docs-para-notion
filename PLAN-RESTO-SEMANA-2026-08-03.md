# Plan del resto de la semana · reescrito el 3/08 al cierre

> Sustituye al plan de días 4-7 de `PLAN-SEMANA-2026-08-03.md`. Cambia porque el lunes no salió
> como estaba escrito: **el A/B se aplaza al paso a producción** (decisión del usuario) y
> **Langsmith se cerró un día antes de lo previsto**, con lo que el martes queda libre para las tools.

---

## Lo que quedó cerrado el lunes 3

| | Estado |
|---|---|
| Limpieza de 21 nodos muertos (52 → 31) | ✅ publicado y verificado |
| Cadena conversacional rota a mediodía | ✅ detectada y desmutada sin llegar a ningún cliente |
| Contrato del escritor, 9 → 20 campos | ✅ **19/19** verificado campo a campo en Airtable |
| Langsmith como fuente del prompt | ✅ integrado y verificado con el `systemMessage` resuelto |
| Reestructura A/B | ⏸️ **aplazada al 10/08**, a propósito |

**Versión en producción al cerrar:** `1aa241a3-9ee0-4d63-8e31-9538a0b857c6`, 32 nodos.

---

## Lo que separa hoy de "agente conversacional completo"

**Una sola cosa: el agente conversa y no guarda.** `AI Agent` tiene cero conexiones `ai_tool`.
El escritor está montado, probado y ahora acepta 20 campos — pero nadie le llama desde la
conversación. Ése es el trabajo del martes y es el riesgo nº1 de la fecha del viernes.

---

## MARTES 4 · el día que importa

**Tipo:** n8n de mañana, navegador al final. **Entregable: el bot guarda lo que recoge hablando.**

### Bloque 0 · Limpiezas de un minuto (10')
- Quitar el pin de datos de `Webhook1` (lleva `Nombre: 1`; no afecta a producción, pero envenena
  cualquier prueba manual futura).
- Archivar el workflow `Llamada BotMobility`, que ya no se usa.

### Bloque 1 · Las dos tools (2 h)
- `guardar_datos_cliente` → HTTP Request Tool contra `/webhook/beckham-upsert-expediente`.
  Rellena el modelo: `nombre`, `apellidos`, `nif`, `telefono`, `tipo_via`, `calle`, `numero`,
  `codigo_postal`, `planta`, `puerta`, `fecha_nacimiento`.
  **Inyectados por n8n, el modelo no los ve:** `user_id`, `intercom_conversation_id`, `email`.
- `leer_expediente` → HTTP Request Tool contra `/webhook/beckham-get-expediente`. Cero parámetros
  del modelo, `user_id` inyectado.
- **La prueba estructural es un número: `ai_tool` hacia `AI Agent` tiene que pasar de 0 a 2.**
  Si tras publicar sigue en 0, la tool está en el canvas pero no conectada al agente, y el bot se
  comporta igual que hoy.

### Bloque 2 · `fecha_alta_ss_f2` (15')
Una fila más en el `Object mapping` del DC `beckham_plazo_f2` (pestaña `2 Data`), promocionando
`fecha_alta_norm` a un Conversation attribute de texto. Es el mismo mecanismo que arregló el bug de
F3. **No tocar las 3 filas que ya están.** Luego la tool lo inyecta y la fecha de alta empieza a
guardarse sin depender del DC de persistencia.

### Bloque 3 · Primera prueba real en el Messenger (1 h)
Una conversación completa **como cliente, nunca desde el Inbox**. Preview no, Simulation no.
Criterio de éxito, las tres cosas o no vale:
1. Conversación **no-Preview** verificada por MCP.
2. Ejecución correlativa en n8n con `runData` **en el nodo de Airtable** — hoy sale vacío, verlo
   con contenido es la señal de que el cable existe.
3. La fila en Airtable con los campos que le diste.

**Y de paso queda verificado lo que hoy no se pudo probar:** que `veredicto_f2` y `fecha_limite_f2`
llegan al agente. Solo lo prueba una conversación que haya pasado por F2.

---

## MIÉRCOLES 5

### Bloque 1 · Red de seguridad de Langsmith (1 h) — **no es opcional**
Hoy Langsmith es dependencia en tiempo real del bot. El 404 de mediodía dejó la cadena caída: el
riesgo ya se materializó una vez, con la demo a dos días. Dos opciones:
- **Rápida:** `onError: Continue` en el nodo + resolver `bot_mobility_prompt || <prompt local>`.
- **Buena:** un workflow `beckham_prompt_sync` que lea Langsmith y guarde el texto en una Data Table
  de n8n; `beckham_bot` lee de ahí. Langsmith sigue siendo la fuente de verdad y una caída suya no
  calla al bot.

### Bloque 2 · DC de persistencia en D/G/N (2 h, canvas)
Es lo único que captura los **descartes que mueren en la fase de filtros**, donde el agente nunca
arranca. Las tools no lo sustituyen. Invariantes: `Close` solo en D y N, ninguna rama toca
`ticket.state`, el lead se persiste en H.

### Bloque 3 · Pasaporte (30')
El prompt ya lo pide (bloque D3: *"tu NIF, NIE o número de pasaporte"*) y el escritor lo rechaza:
incoherencia nuestra. La columna `Pasaporte` de Airtable es de **adjuntos**, así que hace falta una
columna de texto nueva y un campo más en el contrato.

---

## JUEVES 6 · colchón

- **WP-205b:** `UserId` no es único en `Empleados` y los formularios no lo rellenan. Un empleado ya
  registrado que hable con el bot puede acabar en fila duplicada.
- Colchón para lo que se haya complicado el martes o el miércoles. **No se planifica al 100%
  a propósito:** cada día de esta semana se ha comido algo imprevisto.

---

## VIERNES 7 · congelación

- e2e de los 4 caminos.
- `contract-test.sh` + `contract-test-ampliado.sh` en verde.
- Demo desde el workspace TEST.
- **Nada se publica.**

---

## Riesgos vivos

1. **Las tools son el único día que separa "conversa" de "completo".** Si el martes se complica, el
   viernes se demuestra un bot que habla y no guarda.
2. **La demo del viernes enseña el flujo VIEJO**, con las preguntas redundantes que la reunión del
   31/07 pidió quitar, porque el A/B se aplazó. **Hay que avisar a Paula y Alina antes**, no que lo
   descubran en la demo.
3. **Langsmith sin red** hasta el miércoles.
4. `beckham-upsert-expediente` sigue público y sin auth (WP-203, precondición del 10/08).

## Fuera de esta semana, a propósito

WP-203 (auth de los webhooks), separación de entornos y borrado de las filas de prueba. Son
precondiciones del **paso a producción del 10/08**, no de la demo del 7.

## Que hay que comunicar

- **A Paula e Iciar:** en el bot manda el **tag `prod`**, no el último commit. Si Paula guarda algo
  y nadie mueve el tag, no entra en producción. Y su versión del prompt asume tools que aún no
  existen; cuando existan, buena parte de su texto se recupera de su commit tal cual.
- **A Paula y Alina:** lo del flujo viejo en la demo.
