# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Todo en español, incluidos los comentarios de código. Horas siempre en hora de Madrid.

---

## 1 · Qué es esto y por qué no se parece a un repo normal

Bot conversacional que cualifica candidatos a la **Ley Beckham** y construye su expediente. Produce
dos entregables: un **informe de memoria fiscal en PDF** y un **fichero `.030` posicional** para la
sede de la AEAT.

**Intercom** (conversación) → **n8n** (toda la lógica) → **Airtable** (expediente y bus de eventos).

**EL HECHO QUE MANDA SOBRE TODO LO DEMÁS: no hay código fuente desplegable. El sistema *es* su
configuración**, y vive en tres SaaS. Esta carpeta es documentación, piezas fuente de los dos
generadores, y pruebas. **Editar un fichero de aquí no cambia nada en producción** hasta que el
usuario lo pega en n8n o en LangSmith.

Consecuencias prácticas:
- **La verdad está en los sistemas vivos, leídos por MCP** — no en estos ficheros, que pueden ir por
  detrás. Ante una duda: auditar, no leer.
- **Yo no publico.** Preparo el código o el prompt y **él lo pega**. Los nodos de código pesan 198 KB
  y 239 KB.
- **Fecha de entrega: 31/08/2026, alcance completo, sin recortes.** Decisión cerrada el 5/08, no se
  reabre.

---

## 2 · Rutina obligatoria de cada sesión

1. **Auditar por MCP al empezar. Son CUATRO workflows, no tres**: `beckham_bot`
   (`nhOwpiGxikeU5DLR`), `beckham_generar_030` (`OoJ2l7PmxSHLxXA4`), `beckham_informe_mobility`
   (`Us5sFgXD9qVxJvxO`) y **`beckham_informe_mobility_v2` (`snoDqB063jMSgzUq`)**. Comprobar
   `versionId`, número de nodos y que `activeVersionId == versionId` (si difieren, hay cambios sin
   publicar). **El v2 entra en la rutina porque lo tocan otras manos**: el 21/08 apareció con una
   plantilla fija que nadie había pedido, y no se detecta si no se mira.
2. **Leer `.spartax/log.md`** (las entradas del último día) y `.spartax/context.md`.
3. **Tras cerrar cada bloque, dar la tabla de pendientes sin que la pida.**
4. **Logs al día sobre la marcha**, no al final: `python3 ~/.claude/skills/spartax/scripts/state.py log "..."`.
5. **Al cerrar: push a GitHub** (`./scripts/push-cierre.sh --push`). Se dice **UNA sola vez**. Si ya
   lo ha hecho o dice que lo hace él, no se vuelve a mencionar en esa sesión.
6. **Al cerrar: recordarle que tiene una pregunta importante que hacerme.** No sé cuál es; él quiere
   que se lo recuerde.

### `get_workflow_details` revienta el límite de lectura
El harness guarda la respuesta en un fichero. **Se audita con `jq` o `python` desde bash**, nunca
leyendo el fichero entero. Y **el MCP devuelve `credentials={}` en TODOS los nodos**, también en los
que funcionan: para comprobar una credencial hay que **ejecutar el workflow**.

---

## 3 · Comandos

```bash
# Las 4 pruebas del .030 + verificador de consistencia con el nodo COMPLETO
bash docs/montar-nodo-030.sh

# Las 9 pruebas del informe, mas 8 comprobaciones de presencia de piezas. ES UNA
# PUERTA: exit 1 si alguna está roja, no regenera el COMPLETO, y REVIERTE al
# COMPLETO anterior si falla la de integración
bash docs/montar-nodo-informe.sh

# Una prueba suelta (todas son node plano, sin framework)
node docs/test-generador-030.js
node docs/test-informe-integracion.js

# LAS CATORCE PUERTAS: once de node plano mas los tres montadores. `bash docs/pasos.sh test`
# las pasa las catorce de una vez. Todas exit 1 si algo esta rojo.
node docs/test-decidir-status.js        # la escalera de Status: 30 comprobaciones
node docs/test-validador-2026-08-19.js  # gentilicios, umbral, estado civil: 31
node docs/test-prompt-v10.js           # los 17 cambios del prompt v10: 35
node docs/test-prompt-v12.js           # el prompt v12, 77 (hereda las 60 del v11)
node docs/test-prompt-v13.js           # el v13 VIVO con el tag prod, 103 (hereda las 77 del v12)
node docs/test-lector-expediente.js    # el lector de 47 claves: 14
node docs/test-v2-preparar-informe.js  # el nodo del informe v2: 74
node docs/test-contrato-upsert.js      # el contrato del escritor contra el nodo vivo: 25
node docs/test-prompt-v14.js           # el v14 local (66.020 car., PENDIENTE de pegar): 110
node docs/test-log-evento.js           # el corr_id y el Log_Evento de 6 campos: 25
node docs/test-diagramas-mermaid.js    # los .mmd.md del repo publico: 28

# Los pasos de un cambio, EN LA TERMINAL (no en un .md que hay que abrir)
bash docs/pasos.sh          # las puertas + los pasos con workflow, nodo y casilla
bash docs/pasos.sh 6        # un paso suelto, Y lo copia al portapapeles
bash docs/pasos.sh test     # solo las puertas

# Contratos del escritor y del lector contra los webhooks vivos
bash scripts/contract-test.sh
bash scripts/contract-test-ampliado.sh

# Estado del proyecto
python3 ~/.claude/skills/spartax/scripts/state.py log "..."
python3 ~/.claude/skills/spartax/scripts/state.py task update T0NN --status done --note "..."

# Push de cierre (simulacro sin --push)
./scripts/push-cierre.sh --push -m "mensaje"

# El TERCER montador (26/08): el nodo del escritor CON el corr_id y el Log_Evento.
# Monta desde el codigo VIVO del export, por anclas de texto: si un ancla desaparece
# ABORTA en vez de generar un COMPLETO mal montado. Su puerta EJECUTA el nodo con un
# $input de mentira (35 comprobaciones), no compara su texto.
bash docs/montar-nodo-validar.sh
```

**NO HAY `npm test` NI `package.json`.** Node v26 instalado en la máquina; las pruebas son ficheros
sueltos que se ejecutan con `node`.

**Fallos tolerados y documentados de las pruebas del `.030`** — no son rojo:
`test-generador-030.js` deja 2 de 4 y `test-generador-030-muestras-nuevas.js` 2 de 14. Son el
**offset 1415** (escribimos `4`, dos muestras llevan blanco; 13 de 14 llevan `4`) y `Z2900111T`
(mete el nombre en el campo de apellidos). **12 de 14 muestras reales salen byte a byte.**

> **`1415` y `1406` son EL MISMO BYTE, y no hay que «corregir» ninguno de los dos.** El código
> escribe `poner(a, 1406, 1, '4')`, o sea la posición **1406 del bloque A**; el bloque A empieza en
> el offset 9 del fichero, así que cae en el **offset 1415 del fichero**. `1415 - 1406 = 9`.
> `test-generador-030.js` lo reporta en coordenadas de fichero (`offset 1415-1415`) y
> `test-generador-030-muestras-nuevas.js` en coordenadas de bloque (`A 1406-1406`). El 19/08 di por
> errata el 1415 y **me equivoqué**: los dos son correctos, cada uno en su sistema.

---

## 4 · Arquitectura, lo que hay que entender de varios ficheros a la vez

```
Intercom canvas «OnClick Mobility»  (4 puntos de disparo D/H/G/N, filtros F1-F3)
        │  Data Connectors, wait_for_callback
        ▼
beckham_bot (n8n, 55 nodos: 48 de logica + 7 sticky)  ── AI Agent + ESCRITOR + LECTOR
        │
        ▼
Airtable «Empleados» (93 columnas)  ── expediente Y bus de eventos: la columna Status dispara todo
        │
        ├─► beckham_informe_mobility (cada 15 min, Status 4 o 5)  → PDF → Status 5 + InformeListo → canal transaccional (webhook synapse) → correo
        └─► beckham_generar_030      (cada 15 min, Status 4 o 5)  → fichero .030 → un fiscal lo sube a la AEAT
```

**El acoplamiento clave: `Status` no es un campo informativo, es el disparador.** Cambiar quién
escribe un peldaño enciende o apaga media entrega, y ya ha pasado **dos veces**:

- **17/08** — el bot escribía el `3` y los dos generadores filtraban solo por el `4`: **ni el informe
  ni el `.030` se generaron nunca en 3 días**, con 297 ejecuciones verdes de medio segundo.
- **18/08** — el bot escribió el `4` correctamente y **el informe tampoco salió**, porque la
  automatización `3b` de Airtable metía el `4` en su rama «Status del 1 al 6 o vacío» y subía la fila
  al `7` **antes de que llegara el tick de 15 minutos**. La ventana era más corta que el tick.

**EL REPARTO VIGENTE — renumerado el 26/08: la escalera pasa a 13 peldaños (todo lo que iba del 2
para arriba sube +1, y entra el `2. Pte agendar llamada` de Iciar, que el bot NO escribe):**

| Peldaño | Quién lo escribe | Cuándo |
|---|---|---|
| **3. Pendiente llamada TD** | el bot, en `Decidir_Status` | **`SenalesComplejidad` no vacío** (21/08), o `MotivoCierre='Llamada agendada'`, o `AplicaBeckham` |
| **4. Pte hacer informe** | el bot, en `Decidir_Status` | `MotivoCierre='Expediente completo'` |
| **5. Informe enviado** | `beckham_informe_mobility`, en `Marcar InformeListo` | cuando el PDF ya está subido |

**El peldaño de llamada (hoy `3`) se escribe AL OFRECER la llamada, no al confirmarla** (21/08, decisión del usuario con datos).
Antes exigía `motivo_cierre='Llamada agendada'`, y el prompt solo manda ese motivo si el cliente
confirma **dos cosas más**: que reservó en Calendly y que no tiene dudas. La cola del fiscal
dependía de que el cliente contestase dos veces más — y medido en la conversación `215475580835251`
(52.000 €), no contestó: la fila se quedó en el `1` y **el fiscal no la veía**. `AplicaBeckham` no
salva esto: un caso complejo no lo marca nunca, a propósito. Se resolvió con `SenalesComplejidad`,
que ya llega en la misma llamada, así que **cero campos nuevos**. A cambio, el peldaño de llamada aparece a mitad de
conversación y el fiscal ve casos incompletos: es deliberado.

Y los dos generadores filtran **`OR(Status=4, Status=5)`** (nombres del 26/08), no solo uno: los dos
schedule van con 18 segundos de diferencia, y si filtrasen solo el `4` un `.030` que hubiera fallado
**no reintentaría jamás**. `Marcar InformeListo` no puede hacer retroceder el peldaño **porque ese
filtro no deja entrar una fila en el 8**: si alguien amplía el filtro, el nodo empieza a poder
bajarlo. Van atados. De la rama del `3b` **se quitó el peldaño de hacer-informe** (el de
informe-enviado se queda: 5 → 8 es el paso normal) — y la `3b` está `undeployed` para siempre (24/08).

**La escalera de Status solo sube.** El bot escribe únicamente si el peldaño propuesto es mayor que
el actual. Los peldaños **6 y 7 no los escribe nadie** (`Pte formulario usuario` y `Pte hacer TD`);
con la escalera de 13 (26/08) ya no hay número sin opción.

### Los dos caminos por los que el bot conoce al cliente
1. **`Preparar_Prompt`** arma el bloque «DATOS QUE YA CONOCEMOS» que va al `systemMessage`. Lee el
   webhook, los custom attributes de Intercom **y (desde el 17/08) la fila de Airtable** vía el nodo
   `Leer_Expediente_Para_Prompt`. **Esta vía es determinista y es la que importa.**
2. **La tool `leer_expediente`** (rama `GET EXPEDIENTE`, webhook `beckham-get-expediente`). Solo se
   ejecuta **si el LLM decide llamarla**. **ARREGLADO EL 19/08:** devolvía 21 claves contra las 57
   que escribe el Upser, y ese hueco de 36 hacía que el bot **volviera a preguntar datos ya
   guardados**. Ahora devuelve **47 claves** de primer nivel más los 9 documentos como **booleanos**
   (nunca URLs: las de Airtable caducan el mismo día), y se **vació la whitelist** de `options.fields`
   del nodo `Buscar Expediente en Airtable` — los dos cambios van atados, porque un nodo de código no
   puede formatear lo que Airtable no le ha mandado. Fuente: `docs/nodo-lector-expediente-2026-08-19.js`,
   puerta `docs/test-lector-expediente.js`.

### Los dos generadores
No se editan en n8n. Se tocan las piezas fuente, se concatenan con su script, y **se pega el
`COMPLETO` entero** en el nodo:

| Entregable | Piezas | Nodo | Vive en |
|---|---|---|---|
| `.030` (2700 bytes, **ISO-8859-1**) | `generador-030-*.js` · `tabla-municipios-ine-*.js` · `nodo-030-glue-*.js` | `nodo-montar-030-COMPLETO.js`, **198.509 car.** (el nodo vivo tiene 197.924: los 585 de diferencia son **solo comentarios**) | `beckham_generar_030` |
| Informe PDF | `metrica-helvetica-*.js` · `pdf-motor-*.js` · `informe-datos-2026-08-19.js` · `informe-cuerpo-2026-08-19.js` · `nodo-informe-glue-*.js` | `nodo-montar-informe-COMPLETO.js`, **241.272 car.** (19/08: local y nodo vivo IDÉNTICOS) | `beckham_informe_mobility` |

| Nodo `Validar y Normalizar` (el escritor) **con `corr_id`** | se monta del **código vivo del export**, por anclas | `nodo-validar-normalizar-COMPLETO.js`, **76.156 car.** (el vivo: 73.081, +3.075) | `beckham_bot` |
El PDF **se monta a mano byte a byte**, no se rellena un `.docx`: de los 17 marcadores, **15 están
partidos entre varios `<w:r>`** del XML de Word, así que un buscar-y-reemplazar sustituiría 2 de 19
apariciones y dejaría 17 `{{...}}` literales en el documento del cliente, **sin fallar**.

---

## 5 · Reglas con prueba. Romper una de estas ya costó una sesión

- **En nodos de código NUNCA `$('X').item`, siempre `$('X').first()`.** El `.item` cuelga el task
  runner hasta el timeout.
- **En expresiones de nodos normales es AL REVÉS:** `.item` es el item emparejado y `.first()`
  devuelve siempre el primero. Con dos filas pendientes, `.first()` le sube el fichero de la primera
  a las dos.
  **Y EL 20/08 SE ENCONTRÓ VIVO EN EL INFORME, seis días después de arreglarlo en el `.030`:**
  `Subir el PDF a Airtable` usaba `.first()` en la URL (`recordId`) y en el `filename`, con el `file`
  en `.item`. Con nueve filas pendientes, los nueve PDF fueron a la **primera** fila con el nombre de
  la primera (medido: 9 adjuntos de tamaños distintos en una, y cero en cuatro), y las que se
  quedaban sin PDF **reentraban en cada tick para siempre**. En producción eso le manda a un cliente
  **el informe fiscal de otro**, porque la automatización `5` adjunta lo que haya en `InformePdf`.
  Lo prohibía el sticky del propio nodo. **Al arreglar esta clase de bug, revisar los DOS
  generadores**, no solo aquel donde apareció.
- **Un parche que toca DOS sitios de un nodo de código se entrega ENTERO, para pegar con Cmd+A.**
  El 21/08 entregué el arreglo del v2 como «busca esta línea y sustituye por estas otras» y el
  pegado acabó con la línea de prosa «Cambio 2 — las cuatro últimas líneas del return:» **dentro**
  del código, las cuatro líneas nuevas en medio del fichero y el `return` de abajo sin tocar:
  `SyntaxError: Unexpected number`. Un parche por trozos se puede pegar de más; un fichero completo
  con Cmd+A, no.
- **`console.log` de node 26 COLOREA la salida aunque escriba a una tubería.** Los códigos ANSI se
  colaron dentro de una variable de `montar-nodo-informe.sh` y corrompieron justo el número de
  caracteres que sirve para comprobar un pegado de 241 KB, además de reventar la resta de la línea
  siguiente. **Y el script seguía saliendo con `exit 0`**: la puerta parecía verde mientras mentía.
  En scripts, `process.stdout.write(String(x))`, nunca `console.log`. Corolario: **un `exit 0` no
  dice que el script haya hecho su trabajo, solo que no abortó.**
- **UN NODO DE AIRTABLE DE n8n GUARDA LA LISTA DE OPCIONES DEL `singleSelect` Y VALIDA CONTRA SU
  PROPIA COPIA, NO CONTRA AIRTABLE.** Vive en `parameters.columns.schema[].options`. El 26/08 la
  escalera de `Status` se renumeró en Airtable, se actualizaron los cinco sitios de siempre, y el bot
  seguía devolviendo `{ok:false, error:'persistencia_fallida'}`: `Airtable Upser Expediente` tenía
  **12 opciones cacheadas con los nombres viejos** y rechazaba el valor nuevo **antes de llamar a la
  API** (`Invalid input for 'Status'. 'Status' expects one of the following values: […] but we got
  '3. Pendiente llamada TD'`). Se arregla **refrescando la lista de campos del nodo en la UI**, no
  tocando código. **Es el SEXTO sitio de un cambio de Status** y no estaba en ninguna lista.
  - **Solo afecta a los nodos que ESCRIBEN.** Los de `operation=search` no llevan `columns.schema`.
    En `beckham_bot` el único es `Airtable Upser Expediente` (`upsert`); los otros cuatro son search.
  - **Y desmiente lo que creíamos del `typecast`:** con `typecast: true` se esperaba que el bot
    creara opciones fantasma y partiera la escalera en dos numeraciones **en silencio**. Es falso:
    no llega ni a Airtable. **El fallo es ruidoso y no escribe nada**, así que no deja basura.
  - **AL REFRESCAR, n8n PUEDE REACTIVAR CAMPOS QUE ESTABAN QUITADOS A PROPÓSITO.** Ese nodo mapea
    **57** y deja **36 fuera** — fórmulas, campos de IA, lo que rellena un fiscal a mano
    (`Borrador030`, `EnviarBorradores`, las dos columnas de comentarios) y lo que escriben los
    generadores (`InformePdf`, `InformeListo`, `Fichero030`…). **Un campo reactivado se escribe
    VACÍO en cada llamada**, y el bot escribe varias veces por conversación: le borraría al fiscal
    su comentario, o los ficheros ya generados. La lista buena está en
    `docs/upser-campos-mapeados-2026-08-26.txt` y se comprueba por MCP contra `columns.value`.
- **Airtable OMITE las celdas vacías en la respuesta.** Si pides tres campos y te devuelve una sola
  clave, esa clave **no dice cuál es**: hay que resolver el `fld` id antes de interpretar. El 21/08
  leí un `true` de `InformeListo` como si fuera `RegenerarInforme` y concluí que alguien había
  tocado dos casillas. No era verdad.
- **`docs/` es plana, y desde el 26/08 el push lo IMPONE en vez de confiar.** `push-cierre.sh` copiaba
  `docs/` con `find -maxdepth 1`, así que **cualquier subdirectorio se quedaba fuera en silencio y el
  push salía en verde**. Pasó dos veces: `docs/contratos/` creado hoy, y `docs/backup-automatizaciones-20260812/`,
  que llevaba **catorce días sin subirse** — y contenía el código de los `customScript` de Airtable,
  **los únicos que no se pueden leer por API**, o sea el único backup del mundo, en un solo portátil.
  Ahora el script **aborta** si aparece un subdirectorio nuevo. Corolario del corolario: `exit 0` no
  dice que el script hiciera su trabajo, y **un push «correcto» tampoco dice que subiera lo que creías.**
- **El recuento de un pegado va en CARACTERES, no en bytes.** `wc -c` da bytes; el editor de n8n
  cuenta caracteres. El `COMPLETO` lleva ~1.500 acentos y los dos números se separan casi 3.000.
- **`typecast: true` en el Upser NO SE APAGA.** Se intentó y se revirtió dos veces (01/08 y 06/08).
  Lo que protege la base son **las whitelists**, no el typecast.
- **Campo nuevo = CINCO sitios:** la tool, el validador, el mapeo del Upser, el prompt **y el
  lector**. Si falta el quinto, el dato se guarda bien y **el bot lo vuelve a preguntar**.
  **Y funciona AL REVÉS igual de mal** (20/08): `municipio_residencia` estaba en la tool, en el
  validador, en el mapeo y en el lector, y **no estaba en el prompt** — nadie se lo preguntaba al
  cliente, así que `MunicipioResidencia` salía vacío y el `.030` **abortaba**, porque
  `municipioResidencia` e `ineMunicipioResidencia` son 2 de sus 17 `OBLIGATORIOS`. Y el código
  postal **no salva la papeleta**: `ineMunicipio(nombre, cp)` busca por NOMBRE normalizado y el CP
  solo aporta las dos cifras de provincia (`ineMunicipio('Madrid','28046')` → `28079`;
  `ineMunicipio('','28046')` → `null`). Al añadir un campo, recorrer los cinco **en los dos
  sentidos**.
- **Antes de renombrar un nodo, contar sus referencias SEPARANDO las de nodos `code` de las de
  expresiones.** n8n reescribe `connections` y las expresiones de nodos normales al renombrar; **dentro
  de un nodo `code` no reescribe nada**, y la referencia rota no da error hasta que se ejecuta. Medido
  el 26/08: `If2`, `Wait2` y `Airtable Upser Expediente` tienen **cero** referencias en expresiones y
  se renombran gratis; **`Webhook1` tiene 13, y 2 viven en nodos `code`** —
  `Formatear_conversacion1` y **`Preparar_Prompt`**. Renombrarlo sin repegar esos dos deja
  `Preparar_Prompt` apuntando a un nodo inexistente, y el síntoma es **el peor del proyecto: el bot
  vuelve a preguntar lo que el cliente ya contó.** Un renombrado cosmético puede producirlo. El
  comando que da el número está en la §30.2 del PRD maestro.
- **El escritor ignora las claves que no conoce y devuelve `ok:true`.** Lo que no está en el contrato
  no se pierde por un bug: **no existe el camino**.
- **`uploadAttachment` de Airtable AÑADE adjunto, no lo reemplaza.** Hay que vaciar el campo antes.
- **Las URLs de adjunto de Airtable caducan el mismo día** (medido: una de las 10:26 estaba muerta a
  las 14:00). Nunca devolver enlaces: booleanos.
- **Airtable NO deja reordenar columnas por API.** El orden es propiedad **de la vista** y no hay
  endpoint. Se arrastra a mano.
- **Airtable NO deja crear ni editar acciones `customScript` por API** (`readOnlyNodeType`), y **no
  devuelve el valor de un secreto**.
- **Un `singleSelect` de Airtable llega como `{id,name,color}`.** `String()` de eso escribe
  `[object Object]` **sin fallar**. Y una celda de IA o fórmula en error llega como
  `{state:'error'}`. Hay que guardar los dos casos.
- **Para un aviso de Slack no vale el `status`: vale el `ok:true` y verlo en pantalla.**
- **Workspace: TaxDown PRODUCCION** (27/08, decisión del usuario: la norma del workspace TEST queda
  derogada). **Preview nunca y Simulation tampoco. Nunca escribir desde el Inbox** — desde el
  Inbox es un mensaje de admin y no dispara nada. Y en prod, el backup antes de publicar deja de ser
  higiene: es la única vuelta atrás.
- **El Messenger REANUDA el hilo abierto.** Para probar desde cero hace falta incógnito o cerrar los
  hilos: es el mecanismo que rompió el D0 del idioma.
- **Valores para pegar en n8n: sin el `=` inicial y sin salto de línea final.**
- **EL CAMINO AUTOMÁTICO ESTÁ PROBADO PUNTA A PUNTA (20/08), y es la primera vez.** (Los números
  de este bullet son pre-renumeración del 26/08: hoy el bot escribe el `4. Pte hacer informe` y el
  informe deja el `5. Informe enviado`.) Cerrar con
  `MotivoCierre='Expediente completo'` → el bot escribe el `3` → **sin tocar nada** → en el tick
  siguiente salen los dos: `8125154` (`.030`) y `8125157` (informe), **las dos `mode=trigger`**, con
  los 18 segundos de separación de los dos schedule. Resultado medido: `.030` de 2.700 bytes con el
  INE `28079` dentro, PDF de 33.089 bytes con la fecha de alta impresa, `InformeListo=true` y Status
  `4`. Las 289 ejecuciones `trigger` anteriores habían corrido **siempre en vacío**. Si algún día
  vuelve a no salir, esto es la referencia de que el mecanismo funciona: el fallo estará en el dato
  o en el Status, no en el reloj.
- **Un cambio de Status son SEIS sitios** (19/08, el sexto encontrado el 26/08): `Decidir_Status`,
  el filtro del `.030`, el filtro del informe, `Marcar InformeListo`, la automatización **`3b` de
  Airtable** y **el schema cacheado del nodo `Airtable Upser Expediente`** (se refresca en la UI,
  vigilando que no reactive los 36 campos quitados — §5). Si falta el quinto, una fila marcada con
  `EnviarBorradores` se escapa de la ventana antes del tick (pasó el 18/08); si falta el sexto, el
  bot devuelve `persistencia_fallida` en cada escritura (pasó el 26/08).
- **`montar-nodo-informe.sh` REVIERTE el `COMPLETO` si falla la de integración**, y la de integración
  lee **el `COMPLETO` del disco**, no las piezas. Así que si cambias una pieza *y* su prueba a la vez,
  la primera pasada revierte y la prueba sigue midiendo el nodo viejo: parece que tu cambio no ha
  entrado. Desde el 19/08 el candidato rechazado se guarda en `.rechazado` para poder mirarlo.
- **Un extractor de texto de PDF que no encuentra streams devuelve falsos verdes en cascada.** Este
  PDF **no lleva streams comprimidos**: el texto va en operadores `Tj` en claro. El extractor bueno es
  el de `test-informe-integracion.js`; el mío de `zlib` dio diez «OK» sobre una cadena vacía.
- **Una prueba que ensucia un marcador que ya no se imprime no prueba nada.** El 19/08
  `test-informe-cuerpo` comprobaba la guarda del §5.6 sobre `nombreCompleto`, que había salido de la
  cabecera: pasaba en verde sin ejercer la guarda. Al quitar un campo del documento, hay que mirar qué
  pruebas lo usaban **como vehículo** y no como objeto.

---

## 6 · Decisiones cerradas. No se reabren

- **El umbral quedó FIJADO EL 19/08 por el usuario, y ya estaba hablado con Fiscal:** por debajo de
  **50.000 € → llamada** · **50.000-60.000 € → al límite** · **más de 60.000 € → favorable**. Cero
  apariciones de 55.000 en el prompt v10. Se mantiene la regla dura: **el salario NUNCA descarta**, y
  quien dice si compensa es el fiscal, no el bot. La opción `Salario por debajo de 55.000` de
  `SenalesComplejidad` **se renombró** a 50.000 (renombrada, conserva su `id` `seltUAhJWITkOhsE0`).
- **La prestación por paternidad TRIBUTA** en Beckham, igual que la de maternidad. El 17/08 se aportó
  un documento que concluía lo contrario y **se descartó**.
- **La llegada posterior al 1 de julio YA NO ES SEÑAL DE COMPLEJIDAD** (19/08). Sale de `CASO CLARO`
  y de `CASO COMPLEJO` del Bloque 6 y de la lista cerrada de `SenalesComplejidad`. **OJO Y NO
  CONFUNDIR: la lógica FISCAL del 1 de julio no se toca** — `fechaEfectos()` del `.030` sigue con
  llegada ≤ 30/06 → 01/01 del mismo año y ≥ 01/07 → 01/01 del siguiente, y las fórmulas de situación
  fiscal de Airtable siguen igual. Lo que se cayó es el **enrutado**, no el cálculo.
- **El estado civil son TRES opciones** (19/08): `soltero`, `casado`, `divorciado`. «Pareja de hecho»
  se pliega sobre **casado** y «viudo» sobre **soltero**, porque para Hacienda solo cuenta si está o
  no en pareja. Las dos palabras siguen en el validador **como patrón de entrada**: hacen falta para
  reconocer lo que dice la gente. El `.030` no usa el estado civil y el informe ya no lo imprime.
- **La fecha de la llamada NO SE PREGUNTA** (19/08). Al reservar en Calendly el cliente ya recibe la
  cita con su fecha. Salió del prompt (incluido el recordatorio `11b`), del parámetro de la tool
  (41 → 40), del validador, del lector y del PDF. **La columna `FechaLlamada` se queda huérfana a
  propósito**: borrarla se lleva el dato de las filas que ya lo tienen.
- **El informe PDF lleva SOLO nombre, apellidos y fecha de alta** (19/08). Salieron el país de origen,
  la fecha de desplazamiento, la fecha de la reunión y la sección «Notas e información proporcionada»
  entera con sus seis viñetas. **La tabla «Resumen» y los bloques A/B/C se quedan**: son «la info».
  La fecha de alta sale de **`fecha_alta_ss`** (la que declara el cliente y valida el bot), **no** de
  `FechaAlta`, que es `aiText` y está en `state:'error'` en las cuatro filas. Y **no aborta nunca**:
  si falta, imprime «Por confirmar». `fechaDesplazamiento` **sigue calculándose** aunque no se imprima,
  porque de él salen el año de la tabla y el de los bloques. **Habrá más PDF**, sin especificar aún.
- **`AnioDesplazamiento` y `FechaAlta` (los dos `aiText`) están en error o rancios en las cuatro filas
  y NO PASA NADA.** El informe no los usa: el año sale de `fechaDesplazamiento`. Está escrito en el
  código desde el 14/08 («AnioDesplazamiento NO SE USA A PROPOSITO») y comprobado el 19/08 corriendo
  `resolverDatos` con los dos en `state:'error'`: devuelve 2026 y 2027. **No es un problema que haya
  que arreglar; no volver a abrirlo.**
- **Las automatizaciones `2` y `2b` se intercambiaron el 19/08** y está probado en vivo: la `2`
  (`customScript`, copiaba las 93 columnas con lista negra de 5 y no se podía editar) a `undeployed`,
  y la `2b` nativa (whitelist de 3 campos) a `deployed`. **A cambio se pierde el borrado automático**
  de la fila del formulario: Airtable no tiene acción nativa de borrar, así que se acumulan huérfanas
  y se barren con la vista `Filas huerfanas del formulario` (`viwg0qUDTQVZvuadi`). Son inofensivas —
  desde el 13/08 el enlace no prefija `UserId`, y sin `UserId` el bot no las ve.
- **`DiscrepanciaFechaAlta` NO cambia el `motivo_cierre`** (20/08, decidido con datos). El 20/08 el
  bot cerró como `Llamada agendada` un expediente **completo, con los cinco documentos dentro**,
  solo porque la fecha declarada no cuadraba con la del documento: la fila se quedó en el peldaño
  `2` y **no habría producido jamás ni informe ni `.030`**, que es justo lo que el fiscal necesita
  para esa llamada. La discrepancia y el expediente completo son **ortogonales**: el aviso viaja en
  su columna, la llamada se ofrece igual, y el cierre sigue siendo `Expediente completo`. Está
  escrito en el prompt en **dos sitios** (la ficha del documento de alta y la sección CIERRE),
  porque con uno solo ya falló.
- **EL INFORME PASA A `beckham_informe_mobility_v2`** (`snoDqB063jMSgzUq`), decidido el 20/08. Deja
  de escribirse el PDF **byte a byte** y pasa a copiarse una de **ocho plantillas de Google Docs**
  (4 combinaciones de régimen × 2 idiomas), rellenar 14 marcadores con `replaceAll`, descargarla
  como PDF y subirla. Lo construye Iciar. **Al cablearlo hay que despublicar el v1 en el MISMO
  movimiento** — su filtro es idéntico y dos workflows sobre las mismas filas son dos escritores.
  A cambio del cambio de motor, el informe **pasa a depender de credenciales de Google Drive y
  Docs**, que es justo lo que el motor a mano evitaba, y por eso sigue `active=false`.
  **CORREGIDO EL 24/08 CONTRA EL WORKFLOW VIVO: su `Marcar InformeListo` SÍ escribe el `Status`.**
  Aquí se dio por hecho lo contrario desde el 20/08 y era falso: el nodo manda
  `{Status:'5. Informe enviado', InformeListo:true, RegenerarInforme:false, ErrorInforme:'',
  InformeEnviadoEl:$now.toISO()}` (nombre del peldaño ya renumerado el 26/08). La escalera **no** se rompe por ahí; el quinto sitio de un cambio
  de Status sigue siendo el mismo, pero en el v2 ya está cubierto.
  **Y OJO CON DOS COSAS DE ESTE WORKFLOW:**
  - **Cada reescritura por API BORRA las credenciales de sus 14 nodos.** Lo dice su propio sticky.
    Un cambio pequeño **se hace a mano en la UI**, nunca con `update_workflow` del MCP.
  - **El 21/08 a las 13:46 alguien le puso al nodo `Copiar la plantilla` un ID de documento FIJO**
    (`1DgRGflmdr7_…`, que no es ninguna de las ocho plantillas) en lugar de la expresión
    `{{ $json.plantilla }}`, y se perdió el `sameFolder:true`. Tal cual está, en cuanto la credencial
    de Google funcione **los ocho casos saldrían del mismo documento**, con el régimen y el idioma
    equivocados en siete de cada ocho — y el PDF saldría bien formado, se subiría y se mandaría.
    **RESUELTO EL 24/08 (`T073` cerrado y verificado por MCP): el nodo vivo vuelve a llevar la
    expresión `{{ $json.plantilla }}`.** Queda como historia del fallo silencioso más caro que tuvo
    el sistema; el `sameFolder:true` no se repuso (cosmético: el Doc temporal se borra al final).
- **DOS DEUDAS ACEPTADAS EL 26/08. NO SE ARREGLAN HASTA QUE ROMPAN**, decisión del usuario, y no
  se vuelve a proponer. Están apuntadas **por el síntoma**, que es lo que se verá cuando pase:
  - **`T075` · el fiscal manda los borradores a un cliente ESPAÑOL y `Estado030149` se queda
    vacío.** Solo si la fila ya iba por el peldaño 8 o más. **La firma es la asimetría**: en inglés
    sí se marca. Causa: al fusionar las de partners se quitó la rama `else` del grupo anidado
    `wdemO53kDKIOZowhY` (`wacz1Ex78A9y2q4mu`), creyendo que las dos ramas hacían el trabajo dos
    veces — **son `if`/`else` exclusivos, solo corre una**. La guarda del Status sigue entera, así
    que **no hay riesgo de retroceso**: solo se pierde el marcado.
  - **`T076` · un cliente que ya iba avanzado recibe el correo de BIENVENIDA «agenda tu llamada».**
    Causa: en `1. Envio mensaje agendar llamada` las ramas exigen `Empresa != TaxDown`, y **`!=` es
    verdadero también con la celda VACÍA**. Las filas del formulario de confirmación nacen sin
    `Empresa`. **Hoy se salva POR ACCIDENTE**, no por diseño: esas filas tampoco traen email, así
    que `emailUser` sale vacío y el envío no llega. **El día que alguien añada el prefill del email
    al formulario, o cree una fila a mano sin `Empresa`, el correo sale de verdad.**
  - Lo que **sí** funciona de ese filtro y conviene no romper: `Decidir_Status` escribe
    `Empresa = 'TaxDown'` cuando la celda está vacía, así que **toda fila del bot nace excluida** y
    los leads no reciben ese correo.
- **El bot solo genera el `.030`, no el 149.** El 149 lo rehace un fiscal a mano.
- **SUPERADO EL 24/08 — el correo del informe NO lo manda Airtable.** Aquí decía lo contrario
  («`sendEmail` adjunta desde un campo de adjunto y eso ya funciona»), y era verdad como mecanismo
  pero **no es el canal de la casa**. Las automatizaciones de Iciar no mandan el correo: hacen `POST`
  a `https://es.synapse.rentax.es/webhook/a6a3ebaa-0d63-4edf-baef-30effc5fdf60` con
  `notif: "NOTIF_Mobility_BorradorM030"`, `transactionalIDCustomer: 54` y el `x-make-apikey` del
  secreto `n8nApi` — o sea que **el correo sale por el sistema transaccional de TaxDown**. Eso es
  «la otra vía» de la decisión de aparcar la `5`, y sigue cumpliendo lo de **cero credenciales
  nuevas**, porque el secreto ya está en la base.
- **SE QUEDAN LAS AUTOMATIZACIONES DE ICIAR** (24/08, decisión del usuario, y el canal la respalda).
  Consecuencias, y no se reabren:
  - **La `3b` se queda en `undeployed` PARA SIEMPRE**, y la `5` aparcada. No es que sean peores: usan
    `sendEmail` de Airtable, que es **otro canal**. Publicar la `3b` le manda al cliente **dos
    correos** por el mismo hito, uno por cada vía. Está escrito en
    `docs/correcciones-automatizaciones-airtable-2026-08-21.md` para no repetir el análisis.
  - **La que todos los documentos llaman «la `3`» está RENOMBRADA en la base** como
    `1. Envio borradores 030 y 149` (`wflx5iCN4pXuwPAvO`). Buscarla por el número no la encuentra.
  - **HECHO Y PUBLICADO EL 24/08.** Sus tres fallos graves estaban en la parte NATIVA, no en el
    script, así que se arreglaron sin tocar una línea: (1) el `Status` ya no retrocede; (2) un
    `Idioma` vacío ya no se queda sin correo — la rama española es `Idioma no es Ingles`, que en
    Airtable **incluye las celdas vacías**; (3) el trigger ya exige `Borrador030` **y** `Borrador149`.
    Verificado con `get_automation`: `valid`, `deployed`, `deployedVersion=null`.
  - **CÓMO SE HIZO, porque Airtable pone un muro donde no se espera.** No hay forma de crear un
    grupo condicional **anidado** dentro de una rama: el `+` de la rama solo lista acciones y su
    menú `...` solo añade ramas hermanas. Así que la rama inglesa **se partió en dos al nivel de
    arriba**. El grupo `wdePz0CexeOQUlQZ6` queda con **tres** ramas:
    `Idioma != Ingles` → script ES + grupo anidado [`Status ∈ {1,2,4,5,6}` → `7`+`Estado030149` /
    else → solo `Estado030149`] · `Idioma = Ingles` **y** `Status ∈ {1,2,4,5,6}` → script EN +
    `7`+`Estado030149` · **else** → script EN + solo `Estado030149`. Los cuatro casos cubiertos y
    **el mismo comportamiento en los dos idiomas**: cero cambio de producto.
  - **LA LLAVE: `Grupo duplicado` sale en GRIS en la rama española y HABILITADO en la inglesa.** El
    gris **no era por el `customScript`** — era por el grupo anidado que la española ya tenía dentro.
    Duplicando la rama inglesa sale una copia con su script y su `updateRecord`, y solo hay que
    ponerle la condición a una y el `else` a la otra. **Cero arrastres.** Si vuelve a hacer falta
    anidar en una rama, este es el camino.
  - **EL PRECIO: el script inglés existe DOS VECES**, `wacPpABiplv5tO7OM` (rama 2) y
    `wac2hg1IZkE0yOxMF` (rama 3, el `else`). **Si se cambia el texto del correo inglés hay que
    cambiarlo en los dos.** No se pudo dejar escrito en la `Descripción` del nodo: al abrirse el
    editor de script encima, el texto se pierde.
  - **Y EL MOTIVO REAL DE QUE EL SCRIPT SEA INTOCABLE no es el tipo de nodo, es el SECRETO.** El
    editor lo dice literalmente: «No puedes editar este script. Los colaboradores de todos los
    secretos añadidos son los únicos que pueden hacer ediciones.» El secreto es `n8nApi`
    (`eacbfZbyDYjL9UWCW`). **Quien sea colaborador de ese secreto sí puede editarlo**, así que el
    `comentarios149` no es un imposible eterno: es un permiso.
  - **La API no sirve para NADA en esta automatización.** `update_automation` devuelve
    `isValid:false` con `kind: readOnlyNodeType` — «contains a read-only node (customScript) that
    cannot be edited through the API» — aunque el cambio sea solo en la parte nativa, porque el
    update es un **reemplazo completo**. Todo a mano en la UI.
  - **`comentarios149` se recibe y se tira**: el cuerpo del correo solo usa `comentarios030`. No se
    arregla sin editar el script. **Mitigado el 24/08 renombrando las dos columnas**:
    `fldRb66vq77ugTYUo` → **`Comentarios al cliente (SÍ se envía)`** y `fldQ3T7KtPYTZeYcK` →
    **`Notas internas 149 (NO se envía)`**, las dos con descripción. Es seguro porque sus dos
    consumidores las reciben **por ID de campo**, y porque `comentarios030`/`comentarios149` **no
    aparecen en el validador, ni en el lector, ni en los dos generadores, ni en el prompt**:
    comprobado antes de tocar.
  - **CUATRO NOMBRES QUE NO SE PUEDEN RENOMBRAR NUNCA.** El script lee **por nombre** la tabla
    **`Empleados`** y los campos **`Borrador030`**, **`Borrador149`** y
    **`Linkconfirmacionmodelos`**. Renombrar cualquiera rompe el envío de borradores y **no hay
    forma de arreglarlo desde fuera**. Vale para `T071`: **mover columnas es inofensivo, renombrar
    no.**
  - **LA `2` Y LA `2b` SE QUEDAN LAS DOS ENCENDIDAS** (24/08, decisión del usuario), y no hay nada
    que adaptar. Leído el script de la `2`: copia lo no computado y no vacío con lista negra de
    **cinco nombres** (`recordId`, `RecordID Formulario`, `Nombre completo`, `Enlace formulario
    nombre y apellidos`, `EnlaceFormulario030149`) y acaba en `deleteRecordAsync`, o sea que **sí
    borra la fila del formulario**. Y lo que el formulario recoge son **tres respuestas** más
    nombre, apellidos y NIF, **prefijados desde la fila original**: las dos escriben **los mismos
    valores en los mismos campos de la misma fila**, así que el orden da igual y **no hay
    conflicto**. A cambio **vuelve el borrado automático de la huérfana** que se perdió el 19/08 y
    la `2b` queda de red. El precio asumido: la whitelist deja de proteger, así que **un campo
    nuevo en el formulario se copiará al expediente sin que nadie lo decida**. **No se reabre.**
  - **Lo que yo escribí el 21/08 de que «la rama inglesa lee el enlace de la variable en vez del
    registro» es literalmente cierto y NO es un fallo.** La variable está enlazada a
    `fldraDKaVYKWXqiSq`, que **es** `Linkconfirmacionmodelos`, el mismo campo que lee la rama
    española; y la fórmula solo depende de nombre, apellidos, NIF y `RECORD_ID()`. No hay nada que
    arreglar, y menos tocando un script intocable.
- **La errata de la opción `Propiedades`** («en España ni el extranjero») **se deja**: el informe la
  traduce con un mapa de presentación y cambiarla lo rompe.
- **El volcado de 245 países dentro de tres descripciones de Airtable se queda**, y el duplicado
  `Checkout_Url` también. Son cosmética. **Preguntado tres veces: no se vuelve a preguntar.**
- **`WP-209` (la conversación sonda) está MUERTA.** Sus nueve incógnitas quedan sin cerrar.
- **La zona gris del `.030` está resuelta y NO se reintenta:** `793-794` planta y `796-797` puerta,
  **dos caracteres alineados a la izquierda**; `787` bloque, uno. Se probó un mapa alternativo de
  cinco campos de 3 a la derecha el 17/08 y **es falso** — las pruebas contra 16 muestras lo cazaron
  al primer intento.

---

## 7 · Dónde está cada cosa

| Ruta | Qué es |
|---|---|
| **`.spartax/log.md`** | **La bitácora. Aquí está el 80% del conocimiento real**, con los fallos y el porqué de cada decisión |
| `.spartax/context.md` | Resumen vivo: stack, IDs, convenciones, glosario |
| `.spartax/state.json` | Tareas `T0NN` (trabajo diario). El backlog de WPs vive en los PRD |
| `docs/` | **PLANA a propósito.** Los scripts hacen `cd $(dirname $0)` y llaman a las piezas por nombre pelado; hay pruebas con rutas absolutas. **Subdividirla rompe la fabricación del PDF y del `.030`**, y el remoto la tiene aplanada |
| `docs/prds/fase2/` | 39 PRDs `WP-2NN` + `map.html` + `ROADMAP-FASE2.md`. Estados válidos: `skeleton, specified, building, done` |
| `docs/arquitectura-completa-2026-08-16.md` | Punta a punta, 5 diagramas Mermaid, 14 decisiones |
| `docs/corpus-fiscal-beckham-2026-08-13.md` | El conocimiento fiscal aprobado, con su apéndice de desajustes |
| `docs/prompt-final-*.txt` | Copias versionadas del prompt. **La fuente de verdad es LangSmith**, `bot_mobility_prompt` tag `prod`. Vigente: **v13** (21/08, 65.848 car., pegado y verificado en la conversación `215475581167582`), con su puerta `test-prompt-v13.js` de 103 comprobaciones — hereda las 77 del v12 **midiendo el v13**, no el fichero viejo. Sus cuatro cambios, los cuatro medidos turno a turno: D3 pide NIF o NIE sin nombrar el pasaporte · inversiones pegadas a inmuebles · hijos y observaciones en el orden en que se preguntan · el mensaje del Calendly termina preguntando, que es la mitad del arreglo del peldaño 2 |
| `plan/` · `plan/historico/` | Plan maestro, arranques de sesión, reanudaciones |
| `proyecto-mobility/` | La carpeta lista para el repo público: README de 894 líneas y los **7 workflows exportados** |
| `referencia/documentos-test/` | **PII real. Gitignored.** |

---

## 8 · Trampas de mí mismo, comprobadas

- **`plan/ARRANQUE-*.md`, `.spartax/context.md` y `docs/arquitectura-*.md` los escribo yo.** Cuando
  él pega un briefing al empezar, casi siempre está leyéndome de vuelta. **No decirle «lo dijiste
  tú»**, y **no tratar esos ficheros como fuente**.
- El 13/08 escribí «el FAQ son 14 fichas», un número que **no existe en ningún PRD, corpus ni log**.
  Se copió solo a cuatro documentos míos y volvió como dato. El artefacto real son las **30 preguntas
  doradas**. Antes de repetir una cifra, comprobar que está en **los sistemas vivos, los PRD o el
  log**, y no solo en algo que escribí yo.
- **Leer Airtable justo después de una escritura da lecturas prematuras.** El 17/08 informé de un
  `Status` equivocado por leer entre escrituras. Confirmar contra la ejecución de n8n.
- **El tracker se desfasa.** El 17/08 había 6 WPs cerrados marcados como `building`. Reconciliar
  contra el log antes de dar cualquier recuento.

---

## 9 · Preferencias de trabajo

- **Una tarea a la vez.** No adelantar entregables ni encadenar sin que lo pida.
- **«Diagnosticado» no es «resuelto».** Nada se da por cerrado sin verificarlo con datos.
- **Un cambio, una prueba.** Dos cambios y una sola prueba ⇒ la prueba no cuenta.
- **Menos texto.** Va directo al grano y se irrita con las respuestas largas y con que le pregunten
  lo ya decidido.
- **Si plantea una objeción de alcance y él la rechaza, es su decisión: no se vuelve a plantear.**
- Nivel alto: pide **código entero y verificación real**, no explicaciones de concepto.
- **LOS PASOS SE ENTREGAN SIEMPRE ASÍ** (26/08, pedido explícito). No es estilo, es el formato:
  1. **Un comando shell copiable por cada valor que haya que pegar**, listo para su terminal, con
     `pbcopy` — nunca «copia esto de aquí arriba». Si el valor va a un campo de n8n, **sin el `=`
     inicial y sin salto de línea final**.
  2. **Detalle clic a clic**: workflow → nodo → campo exacto → qué dice hoy → qué tiene que decir.
     Decir también **si el campo es un desplegable o un texto**, porque no se tocan igual.
  3. **Un comando de verificación** al final de cada paso, y cuál es el número que tiene que salir
     (contador de caracteres, verdes de la puerta). Lo que no se puede comprobar desde bash —n8n y
     Airtable, porque no hay `N8N_API_KEY` en el entorno— **lo verifico yo por MCP**, y se dice.
  4. **El orden y qué desatasca qué**, separando lo que rompe producción de lo que es cosmético.
  5. Y todo eso **también** en `docs/pasos.sh`, que es donde los busca: `bash docs/pasos.sh N`
     imprime el paso y le deja el valor en el portapapeles.
