# Contexto del proyecto · Beckham (Mobility, TaxDown)

## Perfil
Hammad Bellachhab (hammad.bellachhab@taxdown.es). Dueño técnico y único constructor del bot
Beckham. Trabaja directamente sobre n8n, Airtable e Intercom, sin equipo de desarrollo detrás.
Nivel alto: pide código entero y verificación real, no explicaciones de concepto.

## Stack y herramientas
- **n8n** en **`https://es.synapse.rentax.es`** (acceso por MCP `n8n-mcp`, que es el **servidor MCP
  integrado de n8n**, no un API key personal). Todo está en `.spartax/config.json`: URL, los cuatro
  workflow ids y las dos URLs de webhook. Workflow principal: **`beckham_bot`** = `nhOwpiGxikeU5DLR`.
  Satélites: `beckham_alertas` (`BJfExmwu1fI1aPpY`, errorWorkflow), `beckham_f2_plazo.`
  (`wdOOF0ecCkgFOUjt`), `beckham_hypatia`, `Sync status_renta - Beckham`.
- **Airtable** (MCP). Tabla `Empleados` = el expediente del cliente. El escritor único acepta
  **57 columnas** y ninguna más (20 hasta el 6/08, 45 hasta el 7/08, 56 hasta el 14/08; la tool
  `guardar_datos_cliente` va por **40 parámetros** desde el 19/08, al salir `fecha_llamada`): lo que no está en el contrato no se pierde por
  un bug, NO EXISTE EL CAMINO (el escritor ignora claves desconocidas y devuelve `ok:true`).
  El nodo `Airtable Upser Expediente` va con **`typecast: true`, y eso NO se apaga**: `ponerFecha`
  produce un datetime y las columnas son de solo fecha, así que typecast es lo que hace que Airtable
  las acepte. Apagarlo se intentó y se revirtió **dos veces** (01/08 y 06/08). Lo que protege la base
  son **las whitelists**, no el typecast.
- **Intercom** (MCP). Custom Bot `OnClick Mobility` con 4 puntos de disparo **D/H/G/N**. Filtros F1–F3
  en el canvas, F2 (plazo de 6 meses) delegado a n8n.
- **LangSmith**: fuente de verdad del prompt. `promptName: bot_mobility_prompt`, `promptTag: prod`.
  **Manda el tag `prod`, no el último commit.**
  Versión vigente: **v13** (21/08, 65.848 car., `docs/prompt-final-2026-08-21-v13.txt`), pegada y con
  el tag `prod` movido, verificada turno a turno en la conversación `215475581167582`. Su puerta es
  `docs/test-prompt-v13.js`, 103 comprobaciones. Copias en `docs/prompt-langsmith-prod-*.txt`. **Nunca arrastrar a
  una publicación un parche que el log marque como no verificado**: el v5 iba sin validar, entró
  dentro del v6 y metió un bucle infinito en la pregunta del idioma.
- **Slack** (MCP) para los avisos de negocio y de error.

## Estado al 01/09/2026 · EL PIVOTE CONVERSACIONAL, CABLEADO Y VIVO

**El cambio de arquitectura más grande del proyecto, y está en producción.** La lógica sale de
Intercom: donde había un Custom Bot de **32 caminos** con botones cerrados, ahora hay **un solo agente
conversacional en n8n** que se presenta, contesta preguntas sin límite, hace los tres filtros en
conversación y sigue con el expediente.

### El workflow

**`beckham_bot_conversacional` = `n1jx7z9NtXWCD4VC`**, proyecto personal `XbyRcOSCxcL1TkeG`.
**Activo y publicado** (`activeVersionId == versionId`), 49 nodos de lógica, **cuatro** aristas
`ai_tool`: `guardar_datos_cliente` · `leer_expediente` · **`calcular_plazo`** · `analizar_documento`.

Nació de una copia de `beckham_bot`, y el diff es exactamente:
- **se van 9**: los 8 del sidecar del FAQ (ya no hay dos agentes que aislar) y `Callback_Intercom`
- **entran 2**: `calcular_plazo` (era el Data Connector `beckham_plazo_f2` de Intercom) y
  `Responder_Intercom`
- **los otros 47 son idénticos**, con el mismo `onError`, `retryOnFail` y `alwaysOutputData`

**Sin `callback_token` no hay canal de salida**, así que `Responder_Intercom` publica con la API
normal: `POST /conversations/{id}/reply`, `message_type=comment`, `admin_id 4418209`, credencial
`Intercom Spain PROD` (`fcMMohGbwXVY9sLk`). Los saltos de línea van a `<br>`.

**Los paths llevan sufijo `-v2`** (`beckham-upsert-expediente-v2`, `beckham-get-expediente-v2`, UUID
`179cb7ee-…`) porque dos workflows no pueden registrar el mismo path y `beckham_bot` sigue activo.

### Lo verificado con datos, no leído

- Los cuatro nodos de código **pegados con su contador exacto**: `Formatear_conversacion1` 11.288 ·
  `Preparar_Prompt` **20.569** · `Validar y Normalizar` 76.156 · `Decidir_Status` 13.206
- Settings completos: `errorWorkflow=beckham_alertas` · `executionTimeout=120` ·
  `saveExecutionProgress` · `callerPolicy=workflowsFromSameOwner`
- **LangSmith devuelve el prompt**: `¿Prompt vacio?` sale por la rama de «no vacío», no entra el respaldo
- **`Responder_Intercom` publica**: `success` en 611 ms
- El agente **llama a sus tools**: `leer_expediente` corre en su propia ejecución
- Los 6 links correctos y las 4 aristas `ai_tool` exactas

### El prompt v15, y una consecuencia que hay que recordar

**86.548 caracteres** (+20.528 sobre el v14). Puerta `test-prompt-v15.js`: **206 verdes**, hereda las
107 comprobaciones del v14 midiendo el v15. El bloque de conocimiento fiscal es **byte a byte** el del
v14 y la puerta lo comprueba.

**Está en `bot_mobility_prompt` tag `prod`, con el MISMO nombre** (decisión del usuario, ya ejecutada).
Efecto bueno: el nodo del workflow nuevo ya apuntaba ahí. **Efecto latente: `beckham_bot` lee ese mismo
tag y NO tiene `calcular_plazo`**, que el v15 nombra 14 veces. Hoy no muerde porque ese workflow no
recibe tráfico desde el 31/08 a las 11:00, pero sigue `active=true`. Se cierra despublicándolo.

### El transporte de Intercom: el bloqueante que queda

**Solo un workflow customer-facing corre por evento, y gana el de más arriba de la lista.** Los dos del
proyecto no compiten entre sí (un clic no es un mensaje); la carrera es contra los demás workflows del
workspace con el trigger del mensaje. **Un workflow arriba con audiencia estrecha es inofensivo; con
audiencia amplia secuestra el soporte entero.**

Dos salidas que no tocan el orden, y la A es un paso menos: **(A)** que el workflow deje de ser
customer-facing quitándole el paso de mensaje del reusable —el bot ya contesta desde n8n—; **(B)** una
suscripción de webhook al topic `conversation.user.replied`, que no es un workflow y no compite.

### El fallo ABIERTO

**El DC manda en `message` el saludo del propio bot.** `{{last_conversation_part.body}}` coge la última
parte del hilo, y en la entrada por clic esa parte es lo que acaba de escribir el canvas. Medido en las
ejecuciones `8159910` y `8159914`. Consecuencia: `cold_start` sale `false` y **el agente contesta a su
propio saludo**. Arreglo escrito y sin hacer: si `conversationPartId == First Message ID` es la primera
parte del hilo, o sea arranque en frío — y ese dato **ya llega en el body**.

### Cinco cosas que resultaron falsas, y las cinco las corrigió el usuario mirando la pantalla

1. **No hay casilla `wait_for_callback`** que quitar en el paso del reusable.
2. **No existe un paso `End` en Intercom**: el `END` del canvas es una etiqueta, no una instrucción.
3. **La audiencia no era el bloqueante**: el team sí se asigna. Faltaba **crear** el workflow del mensaje.
4. El workflow **`distribuidor - usuario envia mensaje` era de TEST**: no aplica en producción.
5. **Solo había DOS Data Connectors**, no seis: el escritor **nunca** tuvo DC, escribe el agente.

**Van cinco veces esta semana que doy pasos sobre una capacidad de Intercom que no existe.** La regla
que queda: **antes de dar pasos sobre Intercom, mirar Intercom** — o pedir una captura.

### Decisiones nuevas

- **En el bot conversacional se enmascara SOLO el IBAN.** El NIF y el email **son el contrato** (están
  entre los 40 parámetros de `guardar_datos_cliente` y el `.030` aborta sin NIF): enmascararlos deja al
  agente guardando `[NIF]` o preguntando en bucle. Comprobado antes de decidirlo: `iban` sale **cero**
  veces como campo en el validador y cero en el v15.
- **El freno de coste sí se rescata, y ampliado a dos topes:** el mensaje del turno a 4.000 car. **por
  la cabeza** y `chat_history` a 24.000 **por la cola**. Se recorta **antes** de enmascarar.
- **El agente ya no se presenta.** La bienvenida la manda el canvas y el cliente recibía dos
  presentaciones seguidas. La UI de Intercom no deja dejar un paso sin texto, así que el arreglo vive
  en `Preparar_Prompt`: arranca por la primera pregunta, el idioma (D0).

### Las puertas: 22, y la puerta de las puertas ya no miente

Dos nuevas: `test-prompt-v15.js` (206) y `test-preparar-prompt-conversacional.js` (**62**, la del único
código nuevo del cambio). Y **`bash docs/pasos.sh test` salía con `exit 0` aunque las 22 estuvieran
rojas** — imprimía FALLA en rojo y devolvía el código del último `printf`. Arreglado y medido en los dos
sentidos: verde → 0, una puerta mutada → 1.

**Y la lección más cara de la semana:** una puerta se ancla en la **línea operativa**, nunca en la prosa
de aviso. El ataque adversarial al v15 encontró tres falsos verdes del mismo tipo, y uno permitía
**invertir la polaridad del filtro que descarta en duro** con `exit 0`.

### Los pasos

`bash docs/pasos-conversacional.sh estado` — qué está hecho y qué falta, auditado por MCP.
`bash docs/pasos-conversacional.sh` — los pasos con su comando y su contador esperado.
`bash docs/pasos.sh test` — las 22 puertas.
Diseño completo: **`docs/conversacional-2026-08-31.md`**.

---

## Estado al 26/08/2026 · EL DÍA DE LOS CONTRATOS Y DE LOS DOS TRACKERS QUE MENTÍAN

### La escalera de Status se renumeró (la renumeró Iciar) y se adaptó en SIETE sitios
Trece peldaños. Nuestros cinco nombres cambiaron y entró uno nuevo, `2. Pte agendar llamada`.
`Decidir_Status` pasa a **11.975 car.** y su puerta a **30** comprobaciones. **Y apareció un SEXTO
sitio que no estaba en ninguna lista:** un nodo de Airtable de n8n **guarda la lista de opciones del
`singleSelect` y valida contra su propia copia** (`parameters.columns.schema[].options`), así que el
bot devolvía `persistencia_fallida` **antes de llamar a la API**. Se arregla refrescando la lista de
campos del nodo en la UI. Solo afecta a los nodos que **escriben** (`upsert`), no a los `search`.

### Los dos entregables nuevos son CONTRATOS, y los dos tienen puerta
- **`docs/contrato-upsert-expediente-v1.json`** · las **46 claves** de entrada del escritor,
  **extraídas del nodo vivo** (73.081 car.), no escritas de memoria. Puerta de **25** que compara
  schema contra nodo **en los dos sentidos**, probada rompiéndola dos veces.
- **`docs/nodo-validar-normalizar-COMPLETO.js`** · **76.156 car.**, el nodo del escritor **con el
  `corr_id` y el `Log_Evento`**, listo para Cmd+A. **Tercer montador del proyecto**
  (`montar-nodo-validar.sh`), que monta **desde el código vivo del export y por anclas de texto**: si
  un ancla desaparece, **aborta**. Su puerta **ejecuta el nodo** con un `$input` de mentira — 35
  comprobaciones, y **seis son de PII**.

### El `corr_id` no necesitaba nada nuevo, y eso desbloqueó `WP-208`
Medido en el body real de la ejecución `8129120`: `conversation_id` y `conversationPartId` **ya
llegan**. `corr_id = 215475581167582:52219039912`. **Tres claves para dos cosas:**
`conversationPartId` es camelCase y `conversation_part_id_debounce` trae el **mismo valor** (es la
única que lee `If2`). Y el body lleva `message` y `user_email`, que es **por qué** el `Log_Evento`
tiene 6 campos: `dropped` guarda **nombres** y tira los valores.

### DOS TRACKERS MENTÍAN, y los dos me habían hecho contar mal
- **`WP-203`** estaba en `building` con `critical: true` pero se cerró **sin construir** (`T053`). El
  vocabulario de estados **no tiene «descartado»**, así que se contaba como trabajo **listo** en todos
  los recuentos, incluidos los míos de ese día. Pasa a `done` con la cabecera que lo explica.
- **`WP-223`** tenía `external: ""   # M6 DECIDIDO…`. YAML trata el `#` como comentario, **pero mi
  parser lo leía como valor**, y el WP aparecía bloqueado por una decisión ya tomada.

### El push mentía también, y en verde
`push-cierre.sh` copiaba `docs/` con `find -maxdepth 1`, así que **los subdirectorios se ignoraban en
silencio**. Dos víctimas: `docs/contratos/` de ese día, y `docs/backup-automatizaciones-20260812/`,
**catorce días sin subirse**, con el código de los `customScript` de Airtable — los que
`readOnlyNodeType` impide leer por API, o sea **el único backup que existía, en un solo portátil**.
Ahora aborta. **Un push en verde no prueba que subiera lo que creías: hay que mirar el remoto.**

### Las TRECE puertas
`test-decidir-status` 30 · `test-validador-2026-08-19` 31 · `test-prompt-v10` 35 · `v12` 77 ·
`v13` 103 · **`v14` 110** · `test-lector-expediente` 14 · `test-v2-preparar-informe` 74 ·
**`test-contrato-upsert` 25** · **`test-log-evento` 25** · `montar-nodo-030` ·
`montar-nodo-informe` · **`montar-nodo-validar` 35**. `bash docs/pasos.sh test` las pasa todas.

### Reglas nuevas, las dos con número detrás
- **Antes de renombrar un nodo, contar sus referencias separando las de nodos `code` de las de
  expresiones.** n8n reescribe `connections` y las expresiones; **dentro de un `code` no reescribe
  nada**. `If2`, `Wait2` y `Airtable Upser Expediente` tienen **cero** y son gratis; **`Webhook1`
  tiene 13, y 2 viven en `code`** — una es `Preparar_Prompt`, así que el síntoma sería **el peor del
  proyecto**.
- **`docs/` es plana y ahora el push lo impone**, no lo confía.

### Estado de la Fase 2 al cerrar
**39 paquetes · 14 cerrados · 25 pendientes · 4 empezables** (`WP-207`, `WP-210`, `WP-216`,
`WP-220`) · 2 bloqueados fuera (`WP-225`, `WP-230`, por M1/M2/M3). Camino crítico **peso 21**, primer
no hecho **`WP-207`**, y **no pasa por el menú**: la cadena larga es la del FAQ. `WP-210` reescrito con
**transporte B**, lo que desbloqueó 17 PRDs; `WP-212` y `WP-227` escritos para **las dos ramas de
`T081`**, que es la única decisión de diseño pendiente.

## Estado al 21/08/2026 · EL DÍA DEL PELDAÑO 2 Y DE LA PRUEBA DE LAS DOS FILAS

### Lo que quedó cerrado
- **T064, con la prueba que la distingue.** El `.first()` de `Subir el PDF a Airtable` del informe
  v1 está parcheado, publicado (`versionId == activeVersionId == a80561ef`) y probado con **dos
  filas en el mismo tick** (ejecución `8128203`): `recIvWrCD6PcsE10p` recibió su PDF de 33.114 bytes
  y `recp0TwCJ7RPzhwbA` el suyo de 33.094, **un solo adjunto cada una y tamaños distintos**. Era la
  única prueba que separa `.item` de `.first()` y no se había hecho nunca: hasta hoy siempre había
  una sola fila pendiente.
- **El informe v1 vuelve a estar publicado.** Decisión del usuario: el v2 espera a que **Alina**
  vuelva de vacaciones a conectar la credencial de Google, y eso son días, no horas.
- **Los textos de no residente del v2 ya no se calculan cuando no aplican.** Un caso Beckham de
  Alemania producía «Alemania está fuera de la Unión Europea» — falso dos veces. Verificado en la
  ejecución `8128159`: los cuatro marcadores salen vacíos en `BCK+BCK|ES`.

### El peldaño 2 pasa a escribirse AL OFRECER la llamada
Decisión del usuario del 21/08, tomada con la conversación 3 delante. Antes el `2. Pendiente llamada
TD` exigía `motivo_cierre='Llamada agendada'`, y ese motivo el prompt solo lo manda si el cliente
confirma **dos cosas más**: que ya reservó en Calendly y que no le queda ninguna duda. **La cola del
fiscal dependía de que el cliente contestase dos veces más.** Medido en la conversación
`215475580835251` (52.000 €, caso al límite): el bot dio el enlace, el cliente no contestó, y la
fila se quedó en `1. Interesado` — un caso que necesita llamada y que el fiscal no ve.

**Ahora basta con que `SenalesComplejidad` no esté vacío**, que llega en la misma llamada que el
salario. Cero campos nuevos, o sea que no hay que recorrer los cinco sitios. **Efecto aceptado a
propósito: el 2 se escribe a mitad de conversación y el fiscal verá casos incompletos.** La escalera
sigue subiendo sola, así que un caso que luego se complete pasa al 3 sin que nadie lo baje.

### El reparto de Status queda así

> **SUPERADO EL 26/08 · la escalera se renumeró en Airtable (13 peldaños):** hoy son
> `3. Pendiente llamada TD` / `4. Pte hacer informe` / `5. Informe enviado` — el mapeo completo está
> en `docs/pasos-2026-08-26-renumeracion.sh`. La tabla de abajo queda con la numeración vieja como historia.
| Peldaño | Quién lo escribe | Cuándo |
|---|---|---|
| **2. Pendiente llamada TD** | el bot, en `Decidir_Status` | `SenalesComplejidad` no vacío, o `MotivoCierre='Llamada agendada'`, o `AplicaBeckham` |
| **3. Pte hacer informe** | el bot, en `Decidir_Status` | `MotivoCierre='Expediente completo'` |
| **4. Informe enviado** | `beckham_informe_mobility`, en `Marcar InformeListo` | cuando el PDF ya está subido |

### Prompt v13 · PEGADO y con el tag `prod` movido (65.848 caracteres, puerta de 103 comprobaciones)
1. **D3 pide «NIF o NIE» y ya no nombra el pasaporte.** El 21/08 el cliente dijo `XDA123456`, el
   agente lo mandó como `PasaporteNumero` y la columna `NIF` quedó vacía — y sin NIF no hay `.030`,
   porque el fichero se llama `<NIF>.030`. Si no tiene ninguno de los dos se le pide el pasaporte y
   se sigue: no se bloquea la conversación.
2. **Las inversiones van pegadas a los inmuebles.** Orden nuevo: PF1 salario · PF2 inmuebles ·
   PF3 inversiones · PF4 motivo · PF5 documentación · PF6a/b/c familia · PF7 hijos · PF8
   observaciones. **Y OJO: el bot no había desordenado nada** — seguía el prompt al pie de la letra,
   que tenía el patrimonio partido por tres preguntas. Esto es diseño nuevo, no un arreglo.
3. **PF7 y PF8 dejan de estar del revés.**
4. **El mensaje del Calendly ya no termina en el enlace:** pide que avise al reservar y pregunta por
   dudas, y se le prohíbe insistir si el cliente no vuelve.

### Tres trampas nuevas, medidas
- **Un parche por trozos se puede pegar de más.** El del v2 acabó con la línea de prosa «Cambio 2 —
  las cuatro últimas líneas del return:» **dentro** del código y un `SyntaxError`. Desde hoy: si un
  cambio toca dos sitios de un nodo de código, **se entrega el nodo entero y se pega con Cmd+A**.
- **`console.log` de node 26 colorea la salida aunque escriba a una tubería.** Los códigos ANSI se
  colaban en la variable de `montar-nodo-informe.sh` y corrompían justo el número de caracteres que
  sirve para comprobar el pegado, además de reventar una resta. **El script seguía acabando en
  `exit 0`**: la puerta parecía verde mientras mentía. Arreglado con `process.stdout.write`.
- **Airtable omite las celdas vacías en la respuesta**, así que si pides tres campos y te devuelve
  una sola clave, **esa clave no dice cuál es**. Hay que resolver el `fld` id antes de interpretar.
  Por saltarme esto conclui que alguien había tocado dos casillas y no era verdad.

### Estado de los cuatro workflows al cerrar
`beckham_bot` publicado (**`c4e05e77`**, 55 nodos), `beckham_informe_mobility` publicado con el
parche (`a80561ef`, 9 nodos), `beckham_generar_030` publicado (`94b353cd`, 8 nodos),
`beckham_informe_mobility_v2` (`4892b872`, 14 nodos) **sin publicar y bloqueado** por la credencial
`googleDriveOAuth2Api` `6926ysfsHBouOgnM`, que necesita a Alina — y hacen falta **dos**, Drive y
Docs, de la misma cuenta.

> **Corrección del 24/08:** aquí figuraba `6266c993` como versión publicada del bot. **Es falso**:
> el `versionId` vivo es `c4e05e77`, y `activeVersionId` coincide. Comprobado por MCP.

## Estado al 20/08/2026 · EL DÍA EN QUE EL CAMINO AUTOMÁTICO FUNCIONÓ

### Lo que se consiguió, y nunca se había visto

**Un tick de 15 minutos encontró una fila y produjo los dos entregables.** Conversación cerrada a
las 11:51:57 con `MotivoCierre='Expediente completo'` → el bot escribió el `3` → **no se tocó nada**
→ tick de las 12:00: `8125154` (`.030`) y `8125157` (informe), **las dos `mode=trigger`**, con los
18 segundos de separación de los dos schedule.

| Salida | Medida real, con el fichero descargado |
|---|---|
| `.030` | 2.700 bytes · cabecera `<T030010> 20250203Z3520584W BELLACHHAB` · `fechaEfectos` 01012026 · **INE 28079 dentro** |
| PDF | 33.089 bytes · «Nombre: Hammad», «Apellidos: Bellachhab», «Fecha de alta…: 01/04/2026» · cero `{{` · cero «Notas e información» |
| Fila | `InformeListo=true` · `InformeEnviadoEl=12:00:43` · **Status 4** · `Error030` y `ErrorInforme` vacíos |

Las 289 ejecuciones `trigger` anteriores habían corrido **siempre en vacío**, y las 5 generaciones
que existían eran `mode=manual`. La escalera del 19/08 funciona entera.

### Tres conversaciones y dos prompts nuevos

**Conversación 1** (10:38–11:01, prompt v10). Cerró en `Llamada agendada` con el expediente
**completo**: Status 2, cero entregables. Tres fallos, los tres de prompt.

**v11** (62.725 car., 5 parches): `municipio_residencia` en D5 · recordatorio 10b · precedencia en
PF6 · la discrepancia no mata el turno · y no cambia el `motivo_cierre` (repetido en CIERRE).

**Conversación 2** (11:25–11:52, prompt v11). Llegó al Status 3 y **disparó**. P1 funcionó en vivo:
dirección sin ciudad → «¿En qué municipio está ese domicilio?» → «Madrid» → `MunicipioResidencia`
→ INE 28079 en el fichero. Dos defectos nuevos, uno de ellos **culpa de mi propio parche**: el v11
hacía la confirmación de PF6 **obligatoria** y el bot la soltó descolgada, y encima preguntó los
hijos justo después de «soltero, sin hijos».

**v12** (63.932 car., 3 parches): confirmación de PF6 **opcional** y seguir por el dato que falte ·
PF8 no se pregunta si ya lo dijo en PF5a · el SLA de 24-48 h una sola vez.

**Puertas:** `test-prompt-v11.js` 60 verdes y `test-prompt-v12.js` **77 verdes, 0 rojas**. No son
copias que miden el fichero viejo: se generan sustituyendo la ruta para que las heredadas midan el
fichero NUEVO, y cada tanda lleva su comprobación de contraste contra el anterior («el v11 SÍ
ordenaba pasar a PF8»), que es lo único que prueba que el parche entró.

### El bug que habría reventado la prueba aunque todo lo demás fuera bien

`municipio_residencia` estaba en la tool, el validador, el mapeo y el lector — **y no en el
prompt**. Nadie lo preguntaba, `MunicipioResidencia` salía vacío, y son 2 de los 17 `OBLIGATORIOS`
del `.030`. Medido: `ineMunicipio('Madrid','28046')` → `28079`, `ineMunicipio('','28046')` → `null`.

### WP-204 cerrado, con los cinco criterios

Los dos ❌ del 5/08 resueltos (`maxIterations`=6, aristas `ai_tool` 3 y 3) y el quinto, que solo se
ve en una traza, cerrado con la ejecución **8125098**: el `contexto` llega resuelto con los 24 datos
del expediente. De propina prueba que el **lector de 47 claves** hace su trabajo.

**Tracker: 39 WPs · 12 cerrados · 27 abiertos · 50 puntos.** Camino crítico 21 puntos, primer
eslabón sin cerrar **WP-207**.

### La decisión del final del día: el informe cambia de motor

**`beckham_informe_mobility_v2`** (`snoDqB063jMSgzUq`) **es el que se va a usar.** Lo construye
Iciar; 13 nodos; hoy `active=false` y sin publicar. Copia una de **ocho plantillas de Google Docs**
(4 regímenes × 2 idiomas), rellena 14 marcadores y descarga el PDF, en lugar de escribirlo byte a
byte. Usa `.item` en todo, vacía `InformePdf` antes de subir, para y explica el motivo si falta un
dato, y saca el id de `r.id` porque la columna `recordId` viene vacía en las filas creadas por API.

> **CORREGIDO EL 24/08 contra el workflow vivo:** su `Marcar InformeListo` **SÍ escribe el `Status`**
> (hoy `5. Informe enviado`, renumerado el 26/08); esa parte de T065 estaba mal aquí. Y T073 (la
> plantilla fija) se cerró el 24/08: el nodo vive con `{{ $json.plantilla }}`.

**Cuatro cosas que hay que resolver al cablearlo** (T065): ~~su `Marcar InformeListo` no escribe el
`Status`~~ (falso, ver arriba); su filtro es idéntico al del v1, así que el viejo se
despublica en el mismo movimiento; no tiene `errorWorkflow`; y el informe pasa a depender de
credenciales de Google.

**Efecto colateral bueno:** el bug del `.first()` que apareció hoy en el v1 (T064) **muere con él**
si el v2 entra. Ese arreglo solo hace falta mientras el v1 siga publicado.

### Filas de prueba: siete, tres neutralizadas

Para que el bot no reconozca al cliente se le pone al `UserId` el prefijo `ARCHIVADA-<fecha>`: es el
**único** enganche (el Upser matchea por `UserId`, y `Leer_Expediente_Para_Prompt` y la tool
`leer_expediente` filtran por él). Reversible, y conserva la fila como evidencia. **No** se borra
ninguna sin pedirlo.

## Estado al 19/08/2026 · EL DÍA DE LOS 14 CAMBIOS, TODOS PEGADOS Y VERIFICADOS

Los tres workflows **publicados** (`versionId == activeVersionId`) y con `errorWorkflow` puesto:
`beckham_bot` **55 nodos** (48 de lógica + 7 sticky), `beckham_informe_mobility` `74aa294c`,
`beckham_generar_030` `94b353cd`. Los tres apuntan a `beckham_alertas` (`BJfExmwu1fI1aPpY`) — hasta
hoy los dos generadores lo tenían **vacío**, así que si se caían nadie se enteraba.

### La escalera de Status, rehecha

| Peldaño | Quién lo escribe |
|---|---|
| **3. Pte hacer informe** | el bot, `Decidir_Status` (antes escribía el 4) |
| **4. Informe enviado** | `beckham_informe_mobility`, `Marcar InformeListo` (antes nadie) |

Los dos generadores filtran **`OR(Status=3, Status=4)`**. Y de la rama «Status del 1 al 6 o vacío» de
la automatización `3b` se quitó el **`3`** — el `4` se queda, que 4 → 7 es el paso normal.

**El bug que esto cierra, y es distinto del del 17/08:** el 18/08 el bot **sí** escribió el `4`
(ejecución `8118002`, 11:02:25) y el informe **no salió**. El `.030` sí, pero por una ejecución
**manual** 25 s después. El tick del informe de las 11:15:41 devolvió `data.main=[[]]`: `3b` había
subido la fila al `7` en menos de 13 minutos. **La ventana era más corta que el tick.**

### Los 14 cambios del día

1. Los dos filtros a `OR(3,4)` · 2. `Marcar InformeListo` escribe el `Status` · 3 y 5. `errorWorkflow`
en los dos generadores · 4. el filtro del `.030` · 6. **validador de 73.081 car** con **729
gentilicios** (228 + 501 nuevos: de resolver 97 países de 245 a **241**), umbral a 50.000, estado
civil a tres y fuera el 1 de julio · 7. la tool de 41 a **40** parámetros · 8. **vaciada la whitelist
de 21 campos** del lector + `onError`/`retryOnFail` · 9. **lector de 47 claves** (antes 21) · 10.
`Decidir_Status` de 8.977 car · 11. la guarda de adjuntos de `3b` · 12. el intercambio `2` ↔ `2b` ·
13. **prompt v10, 60.328 car**, tag `prod`, con 17 cambios · 14. **informe PDF a nombre + apellidos +
fecha de alta**, `COMPLETO` de **241.272 car**.

### Las siete puertas (de entonces; al 26/08 son TRECE)

`test-decidir-status.js` 15 · `test-validador-2026-08-19.js` 31 · `test-prompt-v10.js` 35 ·
`test-lector-expediente.js` 14 · `test-informe-datos.js` 226 · `test-informe-cuerpo.js` ·
`montar-nodo-030.sh` y `montar-nodo-informe.sh` en `exit 0`. **Cero rojas.**

### Lo único que NO se pudo verificar

**El prompt v10.** No se ve ni por MCP ni por API: solo leyendo la traza de una ejecución del agente.
Desde que se publicó el bot (14:11 de Madrid) hay **cero ejecuciones**. La misma traza cierra
`WP-204`, que ya cumple 4 de sus 5 criterios medidos.

### Y lo que sigue sin verse funcionar NUNCA

**Ningún tick de 15 minutos ha producido nada.** Las 5 generaciones que existen son `mode=manual`
lanzadas desde la UI. La prueba pendiente es: cerrar con «expediente completo», **no tocar nada**, y
comprobar que en ≤15 min salen el `.030` y el PDF con dos ejecuciones **`mode=trigger`**.

### Tres correcciones a cosas que yo mismo había afirmado

- **`AnioDesplazamiento` no es el año de la cabecera del informe.** Dije que había que ver con qué año
  salió el PDF. Es falso: el código dice desde el 14/08 que **no se usa a propósito** y el año sale de
  `fechaDesplazamiento`. Probado con los dos `aiText` en `state:'error'`: da 2026 y 2027.
- **El `1415` y el `1406` del `.030` son el MISMO byte**, en dos sistemas de coordenadas (bloque A vs
  fichero; `1415 − 1406 = 9`). Di el `1415` por errata y no lo era.
- **Las pruebas del informe son 9**, no 14, más 8 comprobaciones de presencia de piezas.

## Estado al 16/08/2026 (sesión de madrugada, domingo)

**Nada del bot se ha tocado.** Toda la sesión fue documentación, orden y metadatos. `beckham_bot`
sigue en `d15a8da8` con 54 nodos, y los tres workflows principales están auditados y sin deriva.

- **`docs/arquitectura-completa-2026-08-16.md`** — la arquitectura entera de punta a punta, con
  5 diagramas Mermaid (los 5 pasan `mermaid.parse()` de Mermaid v11, el mismo parser que usa GitHub)
  y las 14 decisiones de arquitectura con su porqué.
- **`proyecto-mobility/`** — la carpeta lista para el repo nuevo: `README.md` de 894 líneas con el
  banner y los 7 diagramas en PNG, y `workflows-n8n/` con **los 7 workflows exportados**, que es la
  primera vez que están todos. `beckham_adjuntos_huerfanos` no tenía export hasta hoy.
- **La carpeta de trabajo, reorganizada.** De 34 ficheros sueltos en la raíz a 1. Estructura nueva:
  `plan/`, `informes/`, `referencia/`, `_archivo/`, `_externo/`. **`push-cierre.sh` actualizado**,
  porque copiaba de la raíz por nombre y esas rutas ya no existían.
- **Airtable: las 93 columnas de `Empleados` ya tienen descripción**, las 60 que faltaban escritas
  por MCP. Cada una lleva delante su grupo (`① IDENTIDAD`, `② PERSONALES`…).

### Tres correcciones a la documentación, cazadas esta sesión

1. **La tabla `Empleados` tiene 93 columnas, no 64.** Estaba mal en tres sitios. Corregido.
2. **NO es cierto que «no haya tests»**, y lo decían el README y el doc de arquitectura. Hay **14
   ficheros de prueba y 3.609 líneas**, y `montar-nodo-informe.sh` los usa **como puerta**: `exit 1`
   si alguna está roja, y revierte al `COMPLETO` anterior si falla la de integración. La frase venía
   arrastrada del briefing del 12/08, que era cierto **antes** de que existieran los generadores.
3. **«Campo nuevo = CUATRO sitios»**, no tres: la tool, el validador, el mapeo de Airtable **y el
   prompt**. El doc seguía diciendo tres.

### `AIRTABLE NO DEJA REORDENAR COLUMNAS POR API`

El orden de campos es una propiedad **de la vista**, no de la tabla, y la Metadata API no expone
ningún endpoint para reordenar. Comprobado contra el MCP: `create_field` añade **siempre al final**,
`update_field` solo toca nombre/descripción/fórmula, y no hay `create_view`. **Se arrastra a mano en
la UI.** El orden propuesto, en 11 grupos y con las 93 columnas numeradas, está en
`docs/orden-columnas-empleados-2026-08-16.md`. El usuario hizo la mitad el 16/08.

### Sin decidir, no se ha tocado nada

`PaisNacimiento`, `Nacionalidad` y `UltimoPaisResidencia` llevan **la lista entera de 245 países
volcada dentro del campo descripción**, lo que deja el popup de información inservible. Se preguntó
si limpiarlas y no hubo respuesta. **No se han tocado.**

### Lo siguiente, en este orden

1. **Probar `FechaLlamada` en conversación real** — es lo único del 15/08 que quedó sin empezar.
   Decirle al bot una fecha de reunión, ver que llega a la columna, marcar `RegenerarInforme` y
   comprobar que el PDF la imprime en «Fecha de la reunión» en vez de «Por confirmar». Si llega
   vacía, el sitio que falla es el prompt.
2. **WP-220: el corpus fiscal al prompt.** Desbloquea el FAQ (`WP-221`), cuyo gate son las **30 preguntas doradas**. Ya extraído en
   `docs/corpus-fiscal-beckham-2026-08-13.md`. Falta meter que **la prestación por paternidad de la
   SS SÍ tributa**.

## Estado al 14/08/2026

- **`WP-235` CERRADO Y PROBADO DE PUNTA A PUNTA.** El fichero `.030` se genera solo.
- **`beckham_bot`**: `versionId` = **`d15a8da8`**, **54 nodos**, y desde el 14/08 por la tarde
  **57 columnas** en el Upser y **41 parámetros** en la tool (entró `fecha_llamada`). Los 2 nodos de más respecto al 13/08 son **sticky notes que puso el usuario**
  (confirmado por él el 14/08). Todo lo demás auditado e intacto: 56 columnas, tool de 40 parámetros,
  validador de 950 líneas (con `ponerFecha('FechaLlamada'…)` en la 222), `Decidir_Status` con el
  parche de WP-238, typecast true, cero `.item` **en nodos de código**,
  promptTag `prod`.
- **Workflow `beckham_generar_030`** = `OoJ2l7PmxSHLxXA4`, **activo**, cada 15 minutos,
  **8 nodos**, `versionId` = `b9653e09`. Filtro:
  `AND({Status}="4. Informe enviado", OR({Regenerar030}=1, {Fichero030}=BLANK()))`.
- **LOS CUATRO FALLOS DEL `.030` DEL 14/08, ARREGLADOS Y PROBADOS CON BYTES.** El cuarto es el
  `.first()` del nodo de subida, cerrado al final del día y **probado con DOS filas pendientes a la
  vez** (ejecución 8109532): cada fila con su fichero, los dos con su NIF dentro y difiriendo en 102
  de 2700 bytes. Con `.first()` habrían sido idénticos y una fila se habría quedado vacía, que es lo
  que pasó por la mañana. `versionId` del `.030` = `b9653e09`.
- **Los tres primeros fallos del `.030`, arreglados y verificados** (ejecución 8108631, fichero
  descargado y leído byte a byte): planta de **2** caracteres en A784-785, A1406 = **`4`**, y nodo
  nuevo `Vaciar Fichero030` (httpRequest PATCH con `{"fields":{"Fichero030":[]}}`) porque
  `uploadAttachment` **añade** adjunto, no lo reemplaza. El nodo de limpieza ya mapea
  `Regenerar030=false` y `Error030=''`: antes solo llevaba `id` y **no limpiaba nada**.
- **`latin-1` PROBADO EN VIVO**: 2700 bytes exactos con 8 bytes no-ascii. En UTF-8 serían 2708.

### `WP-236` · el informe Mobility — **FUNCIONANDO EN PRODUCCIÓN** el 14/08

Probado con tres ejecuciones reales (8109089 español, 8109100 inglés, 8109104 vuelta al estado real)
y **los tres correos llegaron**.

- **Workflow** `beckham_informe_mobility` = `Us5sFgXD9qVxJvxO`, 9 nodos, **activo y publicado**.
- **Automatización** `5. Envío del informe Mobility` = `wflZuMqIE5YYdnU8l`, **encendida y publicada**.
- **Dos idiomas**: `Idioma = Ingles` → inglés, **todo lo demás incluido vacío** → español.
- **`FechaLlamada`** (`fldv69piH32yZP89O`) creada. Pero **el origen bueno es Calendly**, no el bot:
  el prompt le prohíbe al bot decir que ha agendado, y el cliente reserva en
  `calendly.com/d/csbw-2wr-fq4/movilidad-internacional`. Lo que salva el parche del prompt es que
  para cerrar con `motivo_cierre='llamada agendada'` **el cliente ya confirma en el chat que ha
  reservado**: ahí se le pregunta el día. Al 100% sería un webhook `invitee.created` de Calendly.
- **Prompt final**: `docs/prompt-final-2026-08-14-v8.txt`, 542 líneas, **46.878 caracteres**.
  Generado parcheando el v7, no reescribiéndolo: el diff son dos añadidos y nada más.

**LA UNIDAD DEL RECUENTO IMPORTA.** `wc -c` da **bytes**; el editor de n8n cuenta **caracteres**. El
`COMPLETO` lleva ~1.500 acentos y en UTF-8 cada uno son dos bytes, así que los dos números se separan
casi 3.000 y parece que el pegado se ha quedado corto. **Siempre en caracteres.**

**El MCP de n8n devuelve `credentials={}` en TODOS los nodos**, también en los que funcionan. No se
puede comprobar por MCP si una credencial está puesta: la única forma es **ejecutar**.
- **El código a pegar**: `docs/nodo-montar-informe-COMPLETO.js`, **239.131 CARACTERES**
  (243.054 bytes: la diferencia son los acentos). Se genera con `bash docs/montar-nodo-informe.sh`.
  El nodo vivo tiene 238.809: le faltan 322 caracteres **de comentario** del cierre del 14/08, y
  eso entra con el siguiente cambio de verdad. **No es deriva.**
- **Once pruebas verdes**, y el script **no regenera** el `COMPLETO` si alguna está roja; la de
  integración corre **después** de concatenar y **revierte** al `COMPLETO` anterior si falla.
- **La prueba que más vale:** `qlmanage` de macOS **renderiza el PDF con Quartz**. No depende de
  ninguna expresión regular mía. El informe de la fila real sale a **3 páginas**, y con el logo pesa **29.639 bytes** en Airtable.



**Se monta un PDF a mano, no se rellena el `.docx`.** Razón, medida: de los 17 marcadores,
**15 están partidos entre varios `<w:r>`** del XML de Word. Un buscar-y-reemplazar sobre
`word/document.xml` sustituiría **2 de las 19 apariciones** y dejaría 17 `{{...}}` literales en el
documento del cliente, sin fallar.

**La cadena, y el correo NO lo manda n8n:**
```
beckham_bot cierra el chat  ->  Status = '4. Informe enviado'
beckham_informe_mobility (n8n, cada 15 min)  ->  monta el PDF, lo sube, marca InformeListo
Automatización Airtable wflZuMqIE5YYdnU8l  ->  correo con el PDF ADJUNTO
```

**Por qué el correo va por Airtable y no por n8n:** la acción nativa `sendEmail` **adjunta ficheros
desde un campo de adjunto** (`spread`), y eso ya está funcionando en producción en la automatización
`3b` con los borradores del 030 y del 149. **Cero credenciales nuevas**, que es el muro que bloquea
este proyecto en tres sitios. Y el PDF va **adjunto, no por enlace**, porque las URLs de adjunto de
Airtable **caducan el mismo día** (medido: una URL de las 10:26 caducaba a las 14:00).

**Columnas nuevas (la tabla va por 64):** `InformePdf` (`fld4QLLBlaYhPjCYR`) ·
`RegenerarInforme` (`fldTy5NrX11t7UetQ`) · `ErrorInforme` (`fldVeGnGp3QiBe0en`) ·
`InformeListo` (`fldG6lJfbNCTn6Lg3`, **dispara el correo**) · `InformeEnviadoEl` (`fldBrcZeiZR2Fv77h`).

**Las piezas** (contrato en `docs/contrato-informe-mobility-2026-08-14.md`):

| Fichero | Qué es |
|---|---|
| `docs/metrica-helvetica-2026-08-14.js` | anchos de Helvetica y Helvetica-Bold, 256 códigos WinAnsi |
| `docs/pdf-motor-2026-08-14.js` | el PDF byte a byte: objetos, `xref`, `WinAnsiEncoding` |
| `docs/informe-datos-2026-08-14.js` | los 17 marcadores y la elección de bloque |
| `docs/informe-cuerpo-2026-08-14.js` | la plantilla literal convertida al IR |
| `docs/nodo-informe-glue-2026-08-14.js` | de la fila de Airtable al PDF |
| `docs/montar-nodo-informe.sh` | **concatena de verdad** y no regenera si una prueba está roja |

**`elegirBloque` acepta CUATRO valores, no tres.** `Situación fiscal Anio Desplazamiento` devuelve
`No residente NO UE` además de `No residente UE`, y **los dos van al Bloque B**. El regex de la
fórmula solo reconoce UE + Islandia, Liechtenstein y Noruega: Reino Unido, EEUU, México, Argentina,
Colombia y Marruecos son todos `No residente NO UE`, o sea **la mayoría del embudo**. Sin esto el
informe abortaba con casos legítimos. `Situación fiscal AnioSiguiente` solo devuelve dos valores, así
que **el segundo bloque nunca es B**.

**`.item` y `.first()` en expresiones: son lo contrario de la regla de los nodos de código.** En un
nodo de código `.item` cuelga el task runner y se usa `.first()`. En una **expresión** de un nodo
normal, `.item` es el item **emparejado** y `.first()` devuelve siempre el primero: con dos filas
pendientes, `.first()` le sube el fichero de la primera fila a las dos.

**Abierto, y no lo decide el código:** `{{fechaLlamada}}` no tiene columna (se imprime
`Por confirmar`), y **la plantilla solo existe en español** mientras `Idioma` tiene opción `Ingles`.
- **Columnas nuevas**: `Fichero030` (`fldRNvuSpdcRLUXQP`), `Regenerar030` (`fld2cRRnvp6gkz5qc`),
  `Error030` (`fldrKUZl4jdgRU7GO`). La tabla va por **59 columnas**.
- **Node v26.7.0** instalado en la maquina. No habia runtime de JS y sin el no se puede probar nada
  fuera de n8n.

### Como esta montado el `.030`

| Fichero | Que es |
|---|---|
| `docs/generador-030-2026-08-14.js` | El constructor posicional. 2700 bytes, **ISO-8859-1** |
| `docs/tabla-municipios-ine-2026-08-14.js` | 8.132 municipios del INE, 9.620 claves |
| `docs/nodo-030-glue-2026-08-14.js` | De las columnas de Airtable al generador |
| `docs/nodo-montar-030-COMPLETO.js` | **Los cinco concatenados = lo que va pegado en el nodo** |
| `docs/test-generador-030.js` · `test-tabla-municipios-ine.js` · `test-nodo-030.js` | Las pruebas |

**El nodo de codigo pesa 198 KB y por eso el `.030` vive en un workflow APARTE**: metido en
`beckham_bot` reventaria la auditoria por MCP de cada sesion.

**Si hay que cambiar algo**, se toca el fichero fuente, se vuelven a concatenar los cinco y se pega
otra vez entero en el nodo `Montar el .030`. No se edita en n8n.

### Lo que sigue sin saberse del `.030`, dicho y no tapado

- **La posicion 1406**: un caracter suelto, `4` en las muestras de mayo y julio y blanco en las de
  agosto. Se pone blanco.
- **Las casillas de bloque/escalera/planta/puerta (772-790)**: hay varias y no se sabe cual es cual.
  El `.030` real de Hammad lleva su planta en la 778 y nosotros la escribimos en la 784; las otras
  dos muestras la llevan donde la ponemos nosotros. **No se resuelve sin una muestra con planta Y
  escalera a la vez, y el usuario dijo el 14/08 que no hay mas muestras.**
- **La fecha de efectos (1390-1397)**: la regla es deduccion nuestra, no la ha firmado Fiscal.
  Se apoya en la logica de la propia base (183 dias / 1 de julio) y encaja con las cuatro muestras.
- **La codificacion latin-1 NO se ha probado en vivo**: el cliente de la prueba no tiene ni un
  acento. La primera fila con una Ñ o una tilde es la que lo prueba.

### Las once decisiones del 14/08 — cerradas, no se reabren

Umbral: ~~NO SE TOCA, los tramos de 55.000 y 60.000 del prompt son correctos~~ **SUPERADO EL 19/08:
el usuario lo fijó con Fiscal en <50.000 → llamada · 50.000-60.000 → al límite · >60.000 →
favorable; cero apariciones de 55.000 desde el prompt v10** (rectifica lo del 13/08 y lo del 14/08). Errata de `Propiedades`: no se toca, mapa de presentacion. `paisOrigen` capitalizado.
`estadoCivil` concuerda genero con `Sexo`. `WP-209` muerta. Cabecera del informe = **año de
desplazamiento**. `residenciaFiscal5Anios` = **'Si' constante, sin columna nueva**. Sumas de
propiedades e inversiones = la frase del select. **Numero de hijos: fuera del informe.**
`modeloYPlazo` = texto largo.

## Estado al 13/08/2026

- **`beckham_bot`**: versionId `2787e0c7`, 52 nodos, **56 columnas**, tool de **40 parámetros**,
  prompt v7 con tag `prod`. Cero `.item`, typecast en true. Auth OFF: es lo último de todo.
- **Verificado en conversación real el 13/08**: `WP-234` (SenalesComplejidad), `WP-238` (el Status
  depende de `motivo_cierre`) y `WP-239` (ResumenBot = ficha + prosa). Cero deuda de verificación.
- **Columnas nuevas del `.030`**: `ApellidoPrimero`, `ApellidoSegundo`, `MunicipioResidencia`.
- **Automatizaciones de Airtable rehechas SIN SCRIPT** y encendidas: `2b` (fusiona la confirmación)
  y `3b` (manda los borradores). Las tres viejas, apagadas.

## Ficheros de referencia nacidos el 13/08

| Fichero | Qué es |
|---|---|
| `docs/tabla-paises-iso2-2026-08-13.js` | 245 países → ISO-2. Casillas 205 y 216 del `.030` |
| `docs/tabla-provincias-030-2026-08-13.js` | 52 provincias, 97 alias. Casillas 404-405 y 406-435 |
| `docs/corpus-fiscal-beckham-2026-08-13.md` | El conocimiento fiscal, del manual IRPF páginas 309-317 |
| `docs/spec-informe-mobility-2026-08-13.md` | Cómo se monta el informe: los 17 marcadores |
| `docs/contrato-fichero-030-2026-08-11.md` | El formato posicional del `.030`, decodificado |

## Cómo se encadena el final del proceso (decidido el 13/08)

El informe se genera y **se envía ANTES de cerrar el chat**, en la cadena del cierre y **no como tool
del agente** — así el agente no puede olvidarlo ni dispararlo antes de tiempo. Consecuencia: el
`Status` pasa directo a **`4. Informe enviado`** y el peldaño `3. Pte hacer informe` deja de aplicar.
El `.030` se genera después, disparado por ese `Status`, más una casilla `Regenerar030` para rehacerlo.

## Trampas de la API de Airtable, aprendidas a base de chocar

- **No deja crear ni editar acciones `customScript` por API** (`readOnlyNodeType`). Solo UI.
- **No devuelve el valor de un secreto**, solo su referencia.
- **No hay acción nativa de borrar registro.** Por eso las filas del formulario se quedan.
- **Compartir una página de interfaz públicamente es SOLO LECTURA.** Un formulario de vista clásica
  es la única forma de que alguien de fuera escriba, y esos siempre crean fila nueva.
- Un grupo condicional **debe ser el último nodo**: no se puede poner nada detrás.
- `isAnyOf` **no vale** en las condiciones de un grupo condicional, aunque sí en el filtro de un
  disparador. Hay que poner las comparaciones una a una con `or`.

## Estado al 13/08/2026

- **`beckham_bot`**: versionId `2787e0c7`, **52 nodos**, **56 columnas**, tool de **40 parámetros**,
  prompt v7 con tag `prod`. Cero `.item`, typecast en true. Auth OFF, es lo último.
- **Verificado hoy en conversación real** (`215475470864164`): `WP-234`, `WP-238` y `WP-239`.
  Ya no queda deuda de verificación de esos tres.
- **Columnas nuevas del `.030`**: `ApellidoPrimero`, `ApellidoSegundo`, `MunicipioResidencia`.
  Publicadas y auditadas. **Falta el cuarto sitio: el prompt.**
- **Automatizaciones de Airtable rehechas SIN SCRIPT**: `2b` (fusión del formulario) y `3b` (envío de
  borradores), las dos encendidas. Las tres viejas, apagadas.
- **Tablas de conversión del `.030` terminadas**: países ISO-2 (245/245) y provincias (52, 97 alias).
- **Corpus fiscal extraído** del manual y contrastado contra el original.
- **Spec del informe Mobility escrita**, con 13 de 17 marcadores resueltos.

## El lío de las cifras del umbral — CUATRO valores distintos

> **RESUELTO EL 19/08:** umbral fijado en 50.000/60.000 por el usuario, ya hablado con Fiscal. Esta
> sección queda como historia de cómo se detectó el lío.

| Dónde | Dice |
|---|---|
| Manual fiscal (pág. 309) | 55.000 |
| Prompt v7, líneas 22/226/227/290/352 | 55.000 |
| Prompt v7, líneas 22 y 410 | **también 60.000** |
| `.docx` del informe al cliente | 50.000 |
| **Decisión del usuario 13/08** | **«entre 50.000 y 55.000», porque depende de la divisa** |

**No es un buscar-y-reemplazar.** El prompt tiene los tramos montados sobre 60.000 («superior a
60.000 suele ser favorable») y 55.000 («entre 55.000 y 60.000 está en el límite»). Cambiarlo
**reescribe la semántica del enrutado**. No se toca sin Fiscal.

Aplicado hasta ahora: solo el aviso en el corpus, dejando la cita del manual intacta.

## Estado al 12/08/2026

- **`beckham_bot`**: versionId `1da91ade`, 51 nodos, **53 columnas**, tool de **37 parámetros**,
  prompt v7 con tag `prod`. Cero `.item`, typecast en true.
- **Columna nueva `SenalesComplejidad`** (`fldosgrMoor8q8PiK`, multipleSelects, 7 opciones = las siete
  señales del Bloque 6 del prompt). Es WP-234.
- **Workflow nuevo `beckham_adjuntos_huerfanos`** (`9Dh7U9DIxvXvzPxG`), **activo**, cada hora. Detecta
  adjuntos que Airtable aceptó y nunca descargó. Es T041.
- **Automatización nueva de Airtable** `wflYrTfhxYtRaLZkU` (Status 7→8 al confirmar), **encendida**.
  Es WP-237.
- **Tres publicaciones sin verificar en conversación**: WP-234, WP-238 y WP-239.

## Dos límites duros descubiertos el 12/08 — no reintentarlos

- **Airtable NO deja crear ni editar acciones de tipo `customScript` por API.** Devuelve
  `readOnlyNodeType`. Solo desde la UI. Por eso `wflYrTfhxYtRaLZkU` sí se pudo crear: no lleva script.
- **Airtable NO devuelve el valor de un secreto por API**, solo su referencia. Así que un backup por
  API nunca incluye los tokens.

## El patrón de las credenciales ajenas — ya van tres sistemas

El auth de los webhooks en n8n, la credencial de Airtable en n8n, y ahora los secretos de las
automatizaciones de Airtable (`n8nApi` = `eacbfZbyDYjL9UWCW`, `crear checkout BPM` =
`eacfUyKjpY6C9pTqT`). **El proyecto está montado con credenciales que no son del usuario y eso le
bloquea en tres sitios distintos.** Es conversación con Ops, no problema técnico.

## Columnas y guardas añadidas el 10/08/2026

- `ConyugeQuiereAcogerse` (checkbox) · `DiscrepanciaFechaAlta` (texto) · `last_idem_key` (técnica) ·
  `MotivoCierre` (singleSelect: *Llamada agendada* / *Expediente completo*).
- `nie` añadido a `COLUMNA_POR_TIPO`, comparte columna con `dni`. Antes se perdía el fichero con
  `ok:true`.
- **WP-205b cerrada:** `count>1` en `UserId` devuelve `multi_match` y **no escribe**, avisa a Slack;
  y `last_idem_key` deduplica la escritura repetida. La huella se calcula sobre el **contenido** del
  payload, no sobre `user_id|punto|conversation_id` como decía el PRD: el bot guarda de forma
  incremental y esa huella habría descartado el segundo y el tercer guardado.
- **T053 auth de los webhooks: PROBADA Y DESACTIVADA.** Header Auth `beckham_webhook_auth`
  (`chTgEmF0KkSvcivT`) da 403 sin cabecera y 200 con ella, pero mientras está puesta **la API de n8n
  no puede leer el workflow** (`Credential ... could not be found`): la identidad del servidor MCP
  integrado no ve esa credencial. Sin lectura no hay diff, y el diff es lo que caza los fallos
  silenciosos. Se reactiva al terminar de construir. **Antes de producción, token nuevo.**

## Convenciones
- Todo en **español**, incluidos comentarios de código.
- Valores para pegar en n8n: **sin el `=` inicial y sin salto de línea final**.
- El código va **entero en el mensaje, con la ruta del nodo**. Nunca por portapapeles.
- Horas siempre en **hora de Madrid**, nunca UTC.
- Bitácora: cada cambio con su prueba en `.spartax/log.md`. Un cambio, una prueba: dos cambios y una
  sola prueba ⇒ la prueba no cuenta.

## Dominio de negocio
Bot conversacional que cualifica candidatos a la **Ley Beckham** (régimen fiscal especial de
trabajadores desplazados a España) y construye su expediente en Airtable. Filtros: F1 fecha de
llegada, F2 plazo de 6 meses desde el alta en la Seguridad Social, F3 fecha límite. Salidas:
cualifica, descarta, lead potencial. Cliente interno: equipo Mobility (Paula, Alina, Iciar).

## Glosario
- **Escritor** = `/webhook/beckham-upsert-expediente` (`Validar y Normalizar` → `Airtable Upser Expediente`).
- **Lector** = `/webhook/beckham-get-expediente`, devuelve **47 claves** + 9 documentos como booleanos (19/08).
- **DC** = Data Connector de Intercom. **WP-2NN** = work package de Fase 2 (`docs/prds/fase2/`).
- **Descartados** = `_fechas_descartadas`, el bucle por el que el agente vuelve a pedir un dato inválido.
- **M1–M6** = las 6 decisiones de negocio bloqueantes del roadmap de Fase 2.

## Preferencias de trabajo
- **Una tarea a la vez.** No adelantar entregables ni encadenar sin que él lo pida.
- **"Diagnosticado" no es "resuelto".** No dar nada por cerrado sin verificarlo.
- Para un aviso de Slack **no vale el `status`: vale el `ok:true` y verlo en pantalla**.
- **Workspace TEST. Preview nunca y Simulation tampoco. Nunca escribir desde el Inbox.**
- Tras cualquier sesión de canvas, **auditar conexiones por MCP**.
- Reglas con prueba: **en nodos de código NUNCA `$('X').item`, siempre `$('X').first()`** — el `.item`
  cuelga el task runner hasta el timeout.
- Si plantea una objeción de alcance y él la rechaza, **es su decisión: no se vuelve a plantear.**

## Fechas
- **Fecha límite del proyecto entero: 31/08/2026.** Alcance completo, sin recortes (decisión del 5/08).
- Plan maestro vigente: `PLAN-31-08-2026.md`.
