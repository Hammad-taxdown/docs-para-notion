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

1. **Auditar por MCP al empezar**: `beckham_bot` (`nhOwpiGxikeU5DLR`), `beckham_generar_030`
   (`OoJ2l7PmxSHLxXA4`), `beckham_informe_mobility` (`Us5sFgXD9qVxJvxO`). Comprobar `versionId`,
   número de nodos y que `activeVersionId == versionId` (si difieren, hay cambios sin publicar).
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

# Las cuatro puertas nacidas el 19/08 (node plano, exit 1 si algo esta rojo)
node docs/test-decidir-status.js        # la escalera de Status: 15 comprobaciones
node docs/test-validador-2026-08-19.js  # gentilicios, umbral, estado civil: 31
node docs/test-prompt-v10.js           # los 17 cambios del prompt v10: 35
node docs/test-lector-expediente.js    # el lector de 47 claves: 14

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
        ├─► beckham_informe_mobility (cada 15 min, Status 3 o 4)  → PDF → Status 4 + InformeListo → automatización 5 → correo
        └─► beckham_generar_030      (cada 15 min, Status 3 o 4)  → fichero .030 → un fiscal lo sube a la AEAT
```

**El acoplamiento clave: `Status` no es un campo informativo, es el disparador.** Cambiar quién
escribe un peldaño enciende o apaga media entrega, y ya ha pasado **dos veces**:

- **17/08** — el bot escribía el `3` y los dos generadores filtraban solo por el `4`: **ni el informe
  ni el `.030` se generaron nunca en 3 días**, con 297 ejecuciones verdes de medio segundo.
- **18/08** — el bot escribió el `4` correctamente y **el informe tampoco salió**, porque la
  automatización `3b` de Airtable metía el `4` en su rama «Status del 1 al 6 o vacío» y subía la fila
  al `7` **antes de que llegara el tick de 15 minutos**. La ventana era más corta que el tick.

**EL REPARTO VIGENTE, desde el 19/08 (son CINCO sitios, no uno):**

| Peldaño | Quién lo escribe | Cuándo |
|---|---|---|
| **3. Pte hacer informe** | el bot, en `Decidir_Status` | `MotivoCierre='Expediente completo'` |
| **4. Informe enviado** | `beckham_informe_mobility`, en `Marcar InformeListo` | cuando el PDF ya está subido |

Y los dos generadores filtran **`OR(Status=3, Status=4)`**, no solo uno: los dos schedule van con 18
segundos de diferencia, y si filtrasen solo el `3` un `.030` que hubiera fallado **no reintentaría
jamás**. `Marcar InformeListo` no puede hacer retroceder el peldaño **porque ese filtro no deja
entrar una fila en el 7**: si alguien amplía el filtro, el nodo empieza a poder bajarlo. Van atados.
De la rama del `3b` **se quitó el `3`** (el `4` se queda: 4 → 7 es el paso normal).

**La escalera de Status solo sube.** El bot escribe únicamente si el peldaño propuesto es mayor que
el actual. Los peldaños **5 y 6 no los escribe nadie** y el 10 no existe.

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
- **El recuento de un pegado va en CARACTERES, no en bytes.** `wc -c` da bytes; el editor de n8n
  cuenta caracteres. El `COMPLETO` lleva ~1.500 acentos y los dos números se separan casi 3.000.
- **`typecast: true` en el Upser NO SE APAGA.** Se intentó y se revirtió dos veces (01/08 y 06/08).
  Lo que protege la base son **las whitelists**, no el typecast.
- **Campo nuevo = CINCO sitios:** la tool, el validador, el mapeo del Upser, el prompt **y el
  lector**. Si falta el quinto, el dato se guarda bien y **el bot lo vuelve a preguntar**.
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
- **Workspace TEST. Preview nunca y Simulation tampoco. Nunca escribir desde el Inbox** — desde el
  Inbox es un mensaje de admin y no dispara nada.
- **El Messenger REANUDA el hilo abierto.** Para probar desde cero hace falta incógnito o cerrar los
  hilos: es el mecanismo que rompió el D0 del idioma.
- **Valores para pegar en n8n: sin el `=` inicial y sin salto de línea final.**
- **Un cambio de Status son CINCO sitios** (19/08): `Decidir_Status`, el filtro del `.030`, el filtro
  del informe, `Marcar InformeListo` y la automatización **`3b` de Airtable**. Si falta el quinto, una
  fila marcada con `EnviarBorradores` se escapa de la ventana antes del tick. Ya pasó el 18/08.
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
- **El bot solo genera el `.030`, no el 149.** El 149 lo rehace un fiscal a mano.
- **El correo del informe lo manda Airtable, no n8n**, porque `sendEmail` adjunta desde un campo de
  adjunto y eso ya funciona en producción. **Cero credenciales nuevas**, que es el muro que bloquea
  este proyecto en tres sitios.
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
| `docs/prompt-final-*.txt` | Copias versionadas del prompt. **La fuente de verdad es LangSmith**, `bot_mobility_prompt` tag `prod` |
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
