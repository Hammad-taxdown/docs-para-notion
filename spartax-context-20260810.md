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
