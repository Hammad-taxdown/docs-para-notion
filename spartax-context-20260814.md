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
  **52 columnas** y ninguna más (eran 20 hasta el 6/08 y 45 hasta el 7/08; la tool
  `guardar_datos_cliente` va por **36 parámetros**): lo que no está en el contrato no se pierde por
  un bug, NO EXISTE EL CAMINO (el escritor ignora claves desconocidas y devuelve `ok:true`).
  El nodo `Airtable Upser Expediente` va con **`typecast: true`, y eso NO se apaga**: `ponerFecha`
  produce un datetime y las columnas son de solo fecha, así que typecast es lo que hace que Airtable
  las acepte. Apagarlo se intentó y se revirtió **dos veces** (01/08 y 06/08). Lo que protege la base
  son **las whitelists**, no el typecast.
- **Intercom** (MCP). Custom Bot `OnClick Mobility` con 4 puntos de disparo **D/H/G/N**. Filtros F1–F3
  en el canvas, F2 (plazo de 6 meses) delegado a n8n.
- **LangSmith**: fuente de verdad del prompt. `promptName: bot_mobility_prompt`, `promptTag: prod`.
  **Manda el tag `prod`, no el último commit.**
  Versión vigente: **v7** (10/08). Copias en `docs/prompt-langsmith-prod-*.txt`. **Nunca arrastrar a
  una publicación un parche que el log marque como no verificado**: el v5 iba sin validar, entró
  dentro del v6 y metió un bucle infinito en la pregunta del idioma.
- **Slack** (MCP) para los avisos de negocio y de error.

## Estado al 14/08/2026

- **`WP-235` CERRADO Y PROBADO DE PUNTA A PUNTA.** El fichero `.030` se genera solo.
- **Workflow nuevo `beckham_generar_030`** = `OoJ2l7PmxSHLxXA4`, **activo**, cada 15 minutos.
  Filtro: `AND({Status}="4. Informe enviado", OR({Regenerar030}=1, {Fichero030}=BLANK()))`.
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

Umbral: **NO SE TOCA**, los tramos de 55.000 y 60.000 del prompt son correctos (rectifica lo del
13/08). Errata de `Propiedades`: no se toca, mapa de presentacion. `paisOrigen` capitalizado.
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
- **Lector** = `/webhook/beckham-get-expediente`, devuelve 21 claves.
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
