# Prompt para Claude Design · regenerar los diagramas del repo Beckham · 21/08/2026

> Pégalo entero. Está escrito para que se pueda ejecutar sin hacerte más preguntas.

---

Necesito que regeneres los **ocho archivos de imagen** de la documentación de un proyecto real de
automatización fiscal. Ya existen y están desactualizados: hay que rehacerlos con los datos de abajo,
**con los mismos nombres de archivo y en la misma ruta**, para que al hacer push sustituyan a los
viejos sin tocar el README.

## Dónde se guardan (exacto, no lo cambies)

```
proyecto-mobility/assets/banner-beckham.png
proyecto-mobility/assets/diagramas/01-vista-sistema.png
proyecto-mobility/assets/diagramas/02-canvas-intercom.png
proyecto-mobility/assets/diagramas/03-n8n-beckham-bot.png
proyecto-mobility/assets/diagramas/04-n8n-satelites.png
proyecto-mobility/assets/diagramas/05-airtable.png
proyecto-mobility/assets/diagramas/06-secuencia-conversacion.png
proyecto-mobility/assets/diagramas/07-escalera-status.png
```

El README los referencia con esas rutas relativas. Si cambias un nombre, la imagen deja de aparecer.

## Cómo son los actuales y qué falla en ellos

Son diagramas Mermaid renderizados a PNG: fondo blanco, subgrafos con relleno amarillo pálido por
sistema, cajas azules para Intercom, rosas para n8n, verde agua para Airtable, amarillo anaranjado
para los destinos externos, y un badge morado redondeado con el número del diagrama arriba a la
izquierda junto al título en negrita. **Ese lenguaje visual me vale: mantenlo.** Lo que hay que
corregir es esto:

1. **Texto cortado.** En el diagrama 1 se lee «Cliente en el Messenge», «app5K8OnSObqwWwe»,
   «AEAT · fichero 03(» y «es.synapse.rentax.e». Las cajas no crecen con su contenido. **Ninguna
   etiqueta puede quedar recortada**: si un identificador es largo, ensancha la caja o pártelo en
   dos líneas, pero no lo cortes.
2. **Peso visual desequilibrado.** En el diagrama 1 casi todo está pegado a la derecha y la mitad
   izquierda está vacía. Reparte.
3. **Aristas que se cruzan sin necesidad** y etiquetas de arista que caen encima de otras cajas.
4. **Legibilidad en GitHub.** Se ven a ~900 px de ancho en el README: el texto más pequeño tiene que
   seguir leyéndose ahí. Exporta a **2000 px de ancho aproximadamente** y no bajes de 14 px de
   tipografía efectiva.

Fondo claro (el README se lee en claro). Español de España en todas las etiquetas. Sin emojis
decorativos salvo los que ya se usan como iconos de sistema.

---

# EL SISTEMA, PARA QUE LOS DIAGRAMAS DIGAN LA VERDAD

Bot conversacional que cualifica candidatos a la **Ley Beckham** (régimen fiscal especial para
trabajadores desplazados a España) y construye su expediente. Produce **dos entregables**: un
**informe de memoria fiscal en PDF** para el cliente y un **fichero `.030` posicional** para la sede
electrónica de la AEAT.

**Tres sistemas SaaS y ni una línea de código desplegable:** el sistema *es* su configuración.

```
Intercom (conversación)  →  n8n (toda la lógica)  →  Airtable (expediente y bus de eventos)
```

Fecha de entrega: **31/08/2026**.

## Capa 1 · Intercom

- Workspace **TEST**. Custom Bot **`OnClick Mobility`**.
- **Tres filtros eliminatorios**: `F1` residencia fiscal en España los últimos 5 años (descarta),
  `F2` plazo de 6 meses desde el alta en la Seguridad Social (**delegado a n8n**, que hace el
  cálculo y devuelve el veredicto en línea), `F3` alta en la Seguridad Social.
- **Cuatro puntos de persistencia: D, H, G, N.** D y N son descartes y cierran la conversación;
  H es el lead potencial (aún sin alta, se guarda para el futuro); G es el paso a la conversación
  con el agente.
- Habla con n8n por **Data Connectors** y se queda esperando en un **`wait_for_callback`**.
- El Messenger **reanuda el hilo abierto**: para probar de cero hace falta incógnito.

## Capa 2 · n8n (`es.synapse.rentax.es`)

**`beckham_bot`** — 55 nodos, 48 de lógica y 7 sticky, en cuatro bloques que casi no se hablan:

1. **El agente.** Un AI Agent cuyo prompt vive en **LangSmith** (`bot_mobility_prompt`, tag `prod`,
   hoy la **v13**, 65.848 caracteres). Si LangSmith no responde, un nodo desvía a una **Data Table
   de n8n** (`beckham_prompt_respaldo`) que guarda la última versión buena.
2. **El escritor**, único y con contrato cerrado: un validador que acepta **57 columnas** y ninguna
   más, y hace **upsert por `UserId`** contra Airtable. Lo que no está en el contrato no se pierde
   por un bug: **no existe el camino**. Lleva **guarda de unicidad** (dos filas con el mismo
   `UserId` ⇒ no escribe y avisa) e **idempotencia** por huella del contenido (`last_idem_key`).
3. **El lector**, que devuelve **47 claves** del expediente más los **9 documentos como booleanos**
   — nunca URLs, porque las de Airtable caducan el mismo día.
4. **Tres herramientas del agente**: `guardar_datos_cliente` (**40 parámetros**), `leer_expediente`
   y `analizar_documento` (lee el adjunto y dice **qué documento es**, para no archivarlo en la
   columna equivocada).

**Los satélites**, independientes de la conversación:

- **`beckham_f2_plazo`** — síncrono: recibe la fecha de alta, calcula el plazo de 6 meses y devuelve
  veredicto, fecha límite y días pasados. Es el que hace posible el filtro F2 del canvas.
- **`beckham_analizar_documento`** — identifica y extrae del adjunto. No transcribe números de
  identidad.
- **`beckham_alertas`** — avisos a **Slack**. Dos entradas: un Error Trigger (el bot se cae) y
  avisos de negocio desde el propio bot.
- **`beckham_adjuntos_huerfanos`** — cada hora busca adjuntos que Airtable aceptó pero nunca llegó a
  descargar (se quedan sin `size`) y avisa. Caza el fallo silencioso de la URL caducada.
- **`beckham_generar_030`** — cada 15 minutos.
- **`beckham_informe_mobility`** — cada 15 minutos, 18 segundos después del anterior.

## Capa 3 · Airtable (`Mobility_2026`, tabla `Empleados`)

**93 columnas**, y es dos cosas a la vez: **el expediente del cliente** y **el bus de eventos** del
sistema. La columna **`Status` no es informativa: es el disparador.**

**La escalera de `Status`, del 1 al 12, solo sube.** El bot escribe únicamente si el peldaño
propuesto es mayor que el actual. Quién escribe qué:

| Peldaño | Quién | Cuándo |
|---|---|---|
| `1. Interesado` | el bot | por defecto |
| `2. Pendiente llamada TD` | el bot | **cuando hay señales de complejidad** — o sea al ofrecer la llamada, sin esperar a que el cliente confirme nada |
| `3. Pte hacer informe` | el bot | el expediente se cierra completo |
| `4. Informe enviado` | **el generador del informe** | cuando el PDF ya está subido a la fila |
| `7. Pte confirmación usuario` | una automatización de Airtable | al mandarle los borradores |
| `8. Confirmado` | una automatización de Airtable | cuando el cliente confirma |
| `12. Descartado` | el bot | descarte en los filtros |
| 5, 6, 9, 10, 11 | **nadie los escribe hoy** | — |

Sobre esa columna concurren **cinco escritores**: el bot, tres automatizaciones nativas y un fiscal
a mano. Es el punto más delicado del sistema y conviene que el diagrama 7 lo deje ver.

**Cuatro automatizaciones nativas** de Airtable. Una de ellas manda **el correo al cliente con el
informe adjunto** — el correo lo manda Airtable, **no n8n**, porque adjuntar desde un campo de
adjunto ya funciona y no hace falta ninguna credencial nueva.

## Los dos entregables y las cuatro salidas

- **Fichero `.030`** — texto posicional de **2.700 bytes exactos**, codificado en **ISO-8859-1** (en
  UTF-8 un acento ocupa dos posiciones y desplaza el registro entero). Se llama `<NIF>.030`. Lo
  genera n8n y **lo sube a la sede de la AEAT un fiscal, a mano**. Si falta cualquier dato
  obligatorio, el generador **para y escribe el motivo**; nunca rellena con ceros, porque un código
  de municipio inventado produce un fichero que la AEAT **acepta** y que manda el expediente al
  municipio equivocado.
- **Informe de memoria fiscal en PDF** — hoy se **monta byte a byte** sin librerías, y lleva nombre,
  apellidos y fecha de alta en la Seguridad Social, más una tabla de resumen y tres bloques
  fiscales. Se sube a la fila y **el correo lo manda Airtable**.
- **Borradores de los modelos 030 y 149** — los sube **un fiscal a mano** y se le mandan al cliente
  para que confirme. El bot **solo genera el `.030`**; el **149 lo rehace un fiscal**.
- **Avisos a Slack** — errores y avisos de negocio.

## Lo que está en marcha y NO está cerrado — márcalo como tal en los diagramas

El motor del informe **va a cambiar**: un workflow nuevo (`beckham_informe_mobility_v2`) dejará de
escribir el PDF byte a byte y pasará a **copiar una de ocho plantillas de Google Docs** (cuatro
combinaciones de régimen fiscal × dos idiomas), rellenar **14 marcadores**, descargarla como PDF y
subirla. **Está construido y bloqueado**: necesita credenciales de Google Drive **y** Google Docs de
la misma cuenta, y quien las tiene está de vacaciones. **No sabemos aún cuándo entra.**

Dibújalo, pero **claramente como futuro**: caja con **borde discontinuo** y una etiqueta tipo
«pendiente de credenciales · no en producción». No lo mezcles con el flujo vivo: quien lea el
diagrama tiene que ver de un golpe qué corre hoy y qué no.

---

# LOS OCHO ARCHIVOS

## `banner-beckham.png` — cabecera del README
Ancho completo, proporción aproximada 4:1. Texto: **«Ley Beckham · Automatización Tax Operations»**
y debajo, más pequeño, **«Intercom → n8n → Airtable»**. Sobrio y corporativo, sin stock art ni
personas. Los tres logotipos de sistema puedes sugerirlos con formas o color, no hace falta que sean
las marcas exactas.

## `01-vista-sistema.png` — «Vista de sistema: las tres capas, por dónde cruzan los datos y las cuatro salidas»
Las tres capas como subgrafos, el cliente en el Messenger arriba, y **las cuatro salidas abajo**:
AEAT, correos al cliente, Slack, y el fiscal que sube el fichero a mano. Marca **qué cruces son
síncronos** (el veredicto de F2 vuelve en línea) y cuáles van **por lotes cada 15 minutos**. Que se
lea que Airtable es a la vez almacén y disparador. **Reparte el peso: este es el que hoy está todo
apelotonado a la derecha.**

## `02-canvas-intercom.png` — «Intercom · el embudo»
El canvas completo con sus ramas: la entrada, los tres filtros en orden, las dos salidas de descarte
(D y N, que cierran la conversación), el lead potencial (H) y el paso al agente (G). Marca los
**cuatro puntos donde se persiste** con un distintivo igual en los cuatro, y deja ver que **F2 sale
a n8n y vuelve**. Que se entienda por dónde se cae la gente.

## `03-n8n-beckham-bot.png` — «n8n · dónde vive la lógica»
Los **cuatro bloques** de `beckham_bot` como grupos separados, con las flechas entre ellos y **poco
detalle interno**: el valor está en que se vea que casi no se hablan. Marca de dónde sale el prompt
(LangSmith, tag `prod`) y su **respaldo** en la Data Table. Señala el **escritor único** como el
único punto por el que se escribe en Airtable, y las **tres herramientas** del agente.

## `04-n8n-satelites.png` — «Los satélites»
Los seis workflows independientes, cada uno con **su disparador**: síncrono desde el canvas, cada
hora, cada 15 minutos, Error Trigger. Que se vea de un golpe **qué es reloj y qué es reacción**, y
los **18 segundos** de separación entre los dos generadores.

## `05-airtable.png` — «Airtable · expediente y bus de eventos»
La tabla con sus **bloques de columnas** (identidad y estado, contacto, personales, domicilio,
empleo y plazos, patrimonio, documentos, salidas del bot, modelos 030/149, facturación, técnica) —
**no las 93 una a una**. Encima, los **escritores** (el bot con su whitelist de 57, los formularios,
las automatizaciones, las personas) y debajo **lo que dispara**: las cuatro automatizaciones y los
dos generadores que la miran cada 15 minutos. La idea a transmitir: **una tabla haciendo de bus.**

## `06-secuencia-conversacion.png` — «El recorrido de una conversación»
Diagrama de secuencia en el tiempo: cliente, canvas, n8n, Airtable, generadores, correo. Los actores
en carriles. Lo que **tiene que notarse**: el informe y el `.030` aparecen **abajo del todo, después
de que la conversación se haya cerrado** — el cliente ya no está en el chat cuando le llega su PDF.
Marca los dos tramos de espera: el `wait_for_callback` de cada turno, y el tick de 15 minutos.

## `07-escalera-status.png` — «La escalera de estados»
Los doce peldaños en vertical, y para cada uno **quién lo escribe** (bot, automatización, generador,
persona) con un color por tipo de escritor. Tres cosas que tienen que quedar claras:
1. **La escalera solo sube.**
2. Los peldaños **5, 6, 9, 10 y 11 no los escribe nadie** hoy: márcalos apagados.
3. El **2** se escribe **al ofrecer la llamada**, no al confirmarla.
Y un aviso visible de que sobre esta columna concurren **cinco escritores**.

---

# CÓMO QUIERO QUE TRABAJES

1. **Un archivo a la vez**, en el orden 01 → 07 y el banner al final.
2. Guarda cada uno **en su ruta exacta**, sobrescribiendo el que hay.
3. Antes de pasar al siguiente, **enséñame el resultado** y dime en una línea qué has cambiado
   respecto al viejo.
4. Si un dato de arriba te parece contradictorio o insuficiente para dibujarlo, **pregúntame en vez
   de inventarlo**. Estos diagramas los leen personas que van a tocar producción.
5. Prioriza **que se entienda a 900 px** sobre meter todo el detalle. Si un diagrama no cabe legible,
   dime qué quitarías antes de apretar la tipografía.
