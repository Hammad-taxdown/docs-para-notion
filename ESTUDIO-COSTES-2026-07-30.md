# Estudio de costes y dimensionamiento · Bot Beckham

> **Para la presentación del 31/07.** Material de apoyo, no un compromiso de precios.
> Todas las cifras de proveedor llevan fuente y fecha. Todo lo que es estimación está marcado como
> **ESCENARIO**. Lo que no se ha podido verificar está marcado como **DATO NO DISPONIBLE** y no se ha
> rellenado con un número inventado.
> **No contiene ningún dato personal.** Los volúmenes son el escenario de 500–1.000 clientes/año que
> fijó el equipo.
> **Nuevo el 31/07:** el apartado 2 añade **facturación real**, leída de la herramienta de facturación y del
> dashboard de OpenAI. Es **gasto de uso general de toda la empresa TaxDown, NO del bot Beckham**, y está
> marcado como tal en todos los sitios donde aparece. No se mezcla con las estimaciones de coste del bot.

---

## 1. Resumen para la diapositiva

**El coste de operar el bot es marginal frente al ingreso que gestiona, y la decisión de arquitectura
que más dinero ahorra ya está tomada: no usar Fin.**

| | Escenario 500 clientes/año | Escenario 1.000 clientes/año |
|---|---|---|
| Coste del modelo de lenguaje (agente propio) | **≈ 23 $/año** | **≈ 46 $/año** |
| Lo mismo servido con outcomes de Fin, como *resolución* | ≈ 495 $/año | ≈ 990 $/año |
| Lo mismo servido con outcomes de Fin, como *lead qualification* | ≈ 4.995 $/año | ≈ **9.990 $/año** |
| Ejecuciones de n8n consumidas | ≈ 2.500/año (≈ 8 % del plan Starter) | ≈ 5.000/año (≈ 17 %) |

**Titular:** construir el agente en n8n en vez de delegarlo en Fin ahorra entre **≈ 950 y ≈ 9.950 $/año**
a volumen de 1.000 clientes, y el coste de tokens se queda en dos cifras de dólares al año.

**Segundo titular, el que importa de verdad:** a 300 €/cliente y 750 clientes, hablamos de **≈ 225.000 €
de ingreso anual gestionado por un stack cuyo coste variable no llega al 0,1 %**. El riesgo del proyecto
nunca ha sido el coste. Es la fiabilidad: hoy, con el bug del content-type, **el 100 % de las escrituras
en Airtable falla**.

**Tercer titular, el nuevo (apartado 2):** la stack **ya cuesta dinero de verdad a nivel empresa**
—151.717,46 € de facturación documentada en n8n + Airtable + OpenAI, de los cuales 130.324,11 € pendientes
de recibir— y el presupuesto de OpenAI está configurado en **2.000 $/mes** con un gasto de julio de
**11.632,54 $**, es decir **5,8× por encima**. Ahí hay un techo que ya se está cruzando. **Esas facturas son
de uso general de TODA la empresa, NO del bot**, y precisamente por eso el argumento es de eficiencia:
sobre una base que ya es cara, este bot es la opción que **baja** el coste, no la que lo sube.

---

## 2. La base ya es cara · facturación REAL de la stack, a nivel EMPRESA

> ### ⚠️ AVISO 1 · ESTO NO ES COSTE DEL BOT
> Todas las cifras de este apartado son **costes de uso general de TODA la empresa TaxDown** en las
> herramientas del stack (n8n, Airtable, OpenAI). **NO son coste del proyecto Beckham** y no se pueden
> presentar como tal. El coste variable del bot es el del apartado 4: **dos cifras de dólares al año**.
> Presentar estas facturas como coste del proyecto lo **infla en dos órdenes de magnitud**.
> Sirven para dos cosas, y solo dos:
> **(a)** dar la **escala real del gasto que ya existe** en la stack sobre la que construimos;
> **(b)** sostener el argumento de **eficiencia y escasez**: cada decisión de diseño del bot suma sobre una
> base que ya es cara.

> ### ⚠️ AVISO 2 · DATO A CONFIRMAR, NO RESUELTO
> Las facturas de OpenAI de julio suman **≈ 71.334,93 €** y el «July spend» del dashboard de consumo de la
> organización marca **11.632,54 $**. **Son magnitudes que no cuadran** (ver 2.4). No está resuelto de dónde
> viene la diferencia. **No presentar ninguna de las dos como «el gasto de OpenAI» sin decir que hay una
> discrepancia abierta.**

*Origen de los datos: facturas leídas por el usuario de la herramienta de facturación interna, y dashboard
de uso de OpenAI (organización TaxDown), ambos consultados el 2026-07-31. Sin datos personales.*

### 2.1 Facturas documentadas · todas en euros

| Proveedor | Documento | Fecha | Importe | Estado | Pendiente |
|---|---|---|---:|---|---:|
| n8n GmbH | 001574 | 26/05/2026 | 15.933,88 € | pago manual / reembolso, conciliado | 0,00 € |
| Airtable (FORMAGRID INC DBA AIRTABLE) | INV10049098 | 02/07/2026 | 59.400,30 € | **pendiente de recibir** | 59.400,30 € |
| Airtable (FORMAGRID INC DBA AIRTABLE) | INV10045971 | 08/04/2026 | 5.048,35 € | pago manual (reembolso) | 0,00 € |
| OpenAI | INV-WPQA1L2W-000003 | 03/07/2026 | 70.904,80 € | **pendiente de recibir** | 70.904,80 € |
| OPENAI, LLC | B271846C-0020 | 17/07/2026 | 200,00 € | conciliado | 0,00 € |
| OpenAI | M6TFYCPR-0008 | 12/07/2026 | 85,12 € | conciliado | 0,00 € |
| OpenAI | FWKUFTHJ-0003 | 11/07/2026 | 103,00 € | ticket, conciliado | 0,00 € |
| OpenAI | 7EB0QN6N-0011 | 11/07/2026 | 19,01 € | **pendiente de recibir** | 19,01 € |
| OpenAI | PND4VT8F-0006 | 06/07/2026 | 23,00 € | ticket, conciliado | 0,00 € |
| **Total documentado** | | | **151.717,46 €** | | **130.324,11 €** |

Aritmética del total:
- OpenAI, julio: `70.904,80 + 200,00 + 85,12 + 103,00 + 19,01 + 23,00 = 71.334,93 €`
- Airtable: `59.400,30 + 5.048,35 = 64.448,65 €`
- n8n: `15.933,88 €`
- Total: `71.334,93 + 64.448,65 + 15.933,88 = 151.717,46 €`
- Pendiente de recibir: `59.400,30 + 70.904,80 + 19,01 = 130.324,11 €` → **85,9 %** del total documentado
  (`130.324,11 ÷ 151.717,46 = 0,8590`)
- Conciliado: `151.717,46 − 130.324,11 = 21.393,35 €`

> **Nota de lectura:** «pendiente de recibir» es un estado del documento en la herramienta de facturación,
> **no** una afirmación sobre si el servicio está pagado o no. Y las tres partidas cubren periodos
> distintos (n8n es de mayo; Airtable, abril y julio; OpenAI, julio), así que **el total NO es un gasto
> mensual**: es la suma de lo documentado que se ha aportado. **DESCONOCIDO:** el gasto mensual normalizado
> por proveedor, y si estas facturas son mensuales, anuales o compromisos plurianuales.

### 2.2 Peso relativo de cada proveedor

Sobre el total documentado (151.717,46 €):

| Proveedor | Importe | Peso | Aritmética |
|---|---:|---:|---|
| OpenAI | 71.334,93 € | **47,0 %** | `71.334,93 ÷ 151.717,46 = 0,4702` |
| Airtable | 64.448,65 € | **42,5 %** | `64.448,65 ÷ 151.717,46 = 0,4248` |
| n8n | 15.933,88 € | **10,5 %** | `15.933,88 ÷ 151.717,46 = 0,1050` |

Sobre lo facturado **solo en julio de 2026** (130.735,23 €, que es `71.334,93 + 59.400,30`):

| Proveedor | Importe julio | Peso | Aritmética |
|---|---:|---:|---|
| OpenAI | 71.334,93 € | **54,6 %** | `71.334,93 ÷ 130.735,23 = 0,5456` |
| Airtable | 59.400,30 € | **45,4 %** | `59.400,30 ÷ 130.735,23 = 0,4544` |
| n8n | 0,00 € | 0,0 % | su única factura aportada es de mayo |

**Lectura:** los dos proveedores que dominan el gasto son justamente los dos donde el bot toca de verdad
—el modelo de lenguaje y la base de datos—, y n8n, que es donde vive toda la lógica del bot, es la partida
**más pequeña de las tres**. Es un argumento a favor de la arquitectura elegida: la orquestación es la
parte barata.

### 2.3 Consumo medido de OpenAI · dashboard de la organización

Ventana del dashboard: **16/07/2026 – 31/07/2026**. Organización TaxDown, **uso general de empresa**.

| Métrica | Valor |
|---|---:|
| Total Spend en la ventana | 4.981,67 $ |
| Día de mayor gasto (pico) | 610,47 $ |
| «July spend» (mes completo) | 11.632,54 $ |
| Presupuesto configurado | 2.000,00 $ / mes |
| Total tokens | 11.364.925.066 |
| Total requests | 348.043 |

**Derivadas, con la aritmética a la vista** (todas en dólares, sin convertir: **no se declara ningún tipo
de cambio, así que no se convierte nada**):

| Derivada | Cálculo | Resultado |
|---|---|---:|
| Coste medio por request | `4.981,67 $ ÷ 348.043` | **≈ 0,0143 $** (1,43 centavos) |
| Coste medio por millón de tokens | `4.981,67 $ ÷ 11.364,925 M tok.` | **≈ 0,4383 $ / 1M** |
| Tokens por request | `11.364.925.066 ÷ 348.043` | **≈ 32.654 tokens** |
| Gasto medio por día en la ventana | `4.981,67 $ ÷ 16 días` | **≈ 311,35 $/día** |
| El pico frente a la media | `610,47 ÷ 311,35` | **≈ 1,96×** |
| Sobrepaso del presupuesto en julio | `11.632,54 ÷ 2.000,00` | **≈ 5,82× (581,6 %)** |
| Exceso sobre el presupuesto, en dólares | `11.632,54 − 2.000,00` | **9.632,54 $ por encima** |
| El pico de un solo día vs. el presupuesto **del mes** | `610,47 ÷ 2.000,00` | **30,5 %** |

> **Supuesto declarado:** la ventana 16/07–31/07 se cuenta como **16 días** (ambos extremos incluidos). Si
> el dashboard la contara como 15 días, la media diaria sería `4.981,67 ÷ 15 = 332,11 $/día` y el ratio
> pico/media, `1,84×`. La conclusión no cambia en ninguno de los dos casos.

> **LECTURA (inferencia, no dato):** 0,4383 $ por millón de tokens combinados está **muy por debajo** del
> precio de entrada de GPT-4o (2,50 $/1M) y por debajo incluso de la entrada de GPT-4.1 mini (0,40 $/1M) si
> se cuenta salida. Eso apunta a que el consumo agregado de la empresa está dominado por **modelos mini y/o
> entrada cacheada**. Es una inferencia a partir de dos agregados, **no una medición de la mezcla de
> modelos**, y no debe presentarse como un hecho.

### 2.4 La discrepancia de OpenAI · DATO A CONFIRMAR

| Fuente | Cifra | Divisa |
|---|---:|---|
| Facturas de OpenAI de julio de 2026 (6 documentos) | 71.334,93 € | € |
| «July spend» del dashboard de consumo de la API | 11.632,54 $ | $ |

**No cuadran, y no se pueden comparar directamente:** están en divisas distintas y **no se dispone del tipo
de cambio aplicado (DESCONOCIDO)**, así que no se convierte. Pero la diferencia es de **un factor ≈ 6×**, y
ningún tipo de cambio €/$ plausible explica un factor 6.

Dónde está concentrada la diferencia, que es el dato útil:

- La factura **INV-WPQA1L2W-000003** (03/07, 70.904,80 €) es por sí sola el **99,4 %** del importe facturado
  por OpenAI en julio (`70.904,80 ÷ 71.334,93 = 0,9940`).
- Las **otras cinco** facturas de julio suman `200,00 + 85,12 + 103,00 + 19,01 + 23,00 = 430,13 €`, el 0,6 %.
- **Ese resto de 430,13 € sí es del orden de magnitud** de un consumo mensual de API como el que describe el
  dashboard. La factura grande no lo es.

Hipótesis a verificar, **ninguna confirmada**:
1. La factura grande es un **compromiso anual / plurianual o una licencia de plataforma** (p. ej. ChatGPT
   Enterprise o un committed spend), no consumo de API del mes.
2. Son **cuentas u organizaciones distintas**: la facturada y la del dashboard consultado.
3. Diferencia de **criterio temporal**: factura emitida en julio por un periodo anterior o posterior.

**Cómo cerrarlo:** abrir el detalle de líneas de INV-WPQA1L2W-000003 y comprobar el concepto y el periodo.
Hasta entonces, en la presentación esto se dice como pregunta abierta, no como cifra.

### 2.5 El ángulo: de por sí ya es caro, y queremos bajarlo

1. **La stack ya cuesta dinero de verdad a nivel empresa.** Hay **151.717,46 €** de facturación documentada
   en las tres herramientas sobre las que se construye el bot, con **130.324,11 € todavía pendientes de
   recibir**. Cada decisión de diseño del bot suma sobre una base que **ya es cara**.
2. **El techo del presupuesto ya se está cruzando.** El presupuesto de OpenAI está configurado en
   **2.000,00 $/mes** y el gasto de julio es **11.632,54 $**: lo multiplica por **5,8**. La barra del
   dashboard sale en naranja. Esto es **dato medido, no estimación** — y es lo que convierte «optimizar
   coste» de buena práctica en restricción real.
3. **Por eso la decisión de no usar Fin es la decisión económica del proyecto.** Fin cobra **0,99 $ por
   resolución** y **9,99 $ por lead qualification** — que es literalmente lo que hace este bot. No usarlo
   ahorra **≈ 950 – 9.950 $/año** a 1.000 clientes (apartado 4.4). Y el coste de tokens de nuestro agente
   propio es de **dos cifras de dólares al año**: **irrelevante** al lado de las facturas de arriba.
4. **El mensaje, en una frase: queremos bajar el coste, no subirlo.** El bot no es una línea nueva de gasto
   material; es la alternativa barata a una línea de gasto que sí lo habría sido.
5. **Y el único techo que no se compra con dinero sigue siendo el mismo:** los **5 peticiones/segundo por
   base** de Airtable, idénticos en todos los planes, compartidos con una automatización ajena de la misma
   base. Ese no se arregla pagando más (apartado 3.4).

---

## 3. Precios de proveedor verificados (julio 2026)

### 3.1 Modelo de lenguaje · OpenAI

| Modelo | Entrada / 1M tokens | Salida / 1M tokens |
|---|---|---|
| GPT-4o | 2,50 $ | 10,00 $ |
| GPT-4o mini | 0,15 $ | 0,60 $ |
| GPT-4.1 | 2,00 $ | 8,00 $ |
| GPT-4.1 mini | 0,40 $ | 1,60 $ |

Dos descuentos que aplican directamente a nuestro caso:
- **Prompt caching:** lectura de entrada cacheada a 0,10 $/1M en GPT-4.1 mini, un **75 % de descuento**
  sobre la entrada estándar.
- **Batch API:** 50 % de descuento, pero **no nos sirve** para el agente conversacional (es asíncrono).
  Sí serviría para procesos nocturnos.

> **DATO NO DISPONIBLE:** el modelo exacto configurado hoy en el sub-nodo `David Beckham` de
> `beckham_bot`. La API de n8n no lo expone en el detalle que se ha consultado, así que **los cálculos de
> abajo se dan para tres modelos** en vez de afirmar uno. Confirmarlo es abrir el nodo: 10 segundos.

### 3.2 Intercom

| Concepto | Precio |
|---|---|
| Asiento Essential (facturación anual) | 29 $/persona/mes |
| Asiento Advanced | 85 $/persona/mes |
| Asiento Expert | 132 $/persona/mes |
| **Fin · resolución, handoff a procedure o descalificación** | **0,99 $ por outcome** |
| **Fin · lead qualification** | **9,99 $ por outcome** |

**Esto es lo más relevante de todo el estudio.** Los asientos se pagan igual, porque el Inbox se usa para
el trabajo humano. Lo que es **opcional** es el consumo de Fin — y nuestra arquitectura no lo usa: el bot
son **Custom Bots / Workflows** de Intercom más un agente propio en n8n, y los Workflows van incluidos en
el asiento.

Y hay un detalle de tarifa que encaja incómodamente bien con nuestro caso de uso: **cualificar un lead es
el outcome más caro de Fin (9,99 $)**, y cualificar leads es literalmente lo que hace este bot. Si esto se
hubiera montado sobre Fin, el precio habría escalado por la vía más cara de su tarifa.

### 3.3 n8n Cloud

| Plan | Precio | Ejecuciones/mes |
|---|---|---|
| Starter | 24 €/mes | 2.500 |
| Pro | 60 €/mes | 10.000 |
| Business | 800 €/mes | 40.000 |

Desde abril de 2026 n8n quitó el límite de workflows activos en todos los planes: **solo se paga por
ejecuciones**, y los usuarios y workflows son ilimitados. Eso significa que extraer subworkflows
(`WP-207`) **no cuesta más dinero por existir**, solo por ejecutarse — un argumento a favor de la
arquitectura modular que ya habíamos elegido por otras razones.

### 3.4 Airtable

| Concepto | Precio / límite |
|---|---|
| Asiento Team (anual) | 20 $/persona/mes |
| Asiento Business (anual) | 45 $/persona/mes |
| **Límite de API** | **5 peticiones/segundo por base** (todos los planes) |
| Límite por token de acceso personal | 50 peticiones/segundo |
| Al excederlo | HTTP 429 y hay que esperar **30 segundos** |

**El límite de 5 req/s por base es el techo técnico más bajo de todo el stack, y es el único que no se
puede comprar.** Es igual en todos los planes. Y es **por base**, no por integración: lo compartimos con
la automatización ajena `wflo1oMmSWlcYsO3V` y con los formularios que escriben en `Empleados`.

Consecuencia directa para el diseño, que ya está recogida en `WP-202`: el nodo de Airtable **no tiene
`retryOnFail` ni `onError`** hoy, y `beckham_bot` no tiene `errorWorkflow`. Un 429 mata la ejecución en
silencio, sin responder al Data Connector y sin avisar a nadie. A volumen bajo casi nunca pasará; el día
que pase, se perderá un expediente sin traza.

---

## 4. Cálculo del coste por conversación · ESCENARIO

### 4.1 Supuestos, declarados

| Supuesto | Valor | Fundamento |
|---|---|---|
| Llamadas al modelo por conversación | 4 | 1 de cualificación + 2 de FAQ (tope 3 turnos) + 1 de cierre |
| Tokens de entrada por llamada | 3.000 | System prompt (≈ 2.000) + historial reconstruido + bloque de datos conocidos |
| Tokens de salida por llamada | 400 | Respuestas de chat, en texto plano |
| Ejecuciones de n8n por conversación | 5 | 1 por Data Connector + 1 por turno del agente |
| Escrituras en Airtable por conversación | 2 | Un `punto` de registro + un enriquecimiento |

> Los tokens de entrada son el supuesto más frágil: **no hay instrumentación de tokens hoy**, así que esto
> es una estimación de diseño, no una medición. Instrumentarlo es parte de `WP-231`. Si el System Prompt
> de Paula crece mucho (y en un FAQ sin RAG **crecerá**, porque todo el conocimiento fiscal va inline),
> este número sube de forma lineal. Es el único parámetro que merece vigilancia.

### 4.2 Coste por conversación, por modelo

| Modelo | Entrada (12k tok) | Salida (1,6k tok) | **Total/conversación** |
|---|---|---|---|
| GPT-4o | 0,0300 $ | 0,0160 $ | **≈ 0,046 $** |
| GPT-4.1 | 0,0240 $ | 0,0128 $ | **≈ 0,037 $** |
| GPT-4.1 mini | 0,0048 $ | 0,0026 $ | **≈ 0,0074 $** |
| GPT-4o mini | 0,0018 $ | 0,0010 $ | **≈ 0,0028 $** |
| GPT-4.1 mini **con prompt caching** | 0,0012 $ | 0,0026 $ | **≈ 0,0038 $** |

### 4.3 Coste anual del modelo, por volumen

| Volumen | GPT-4o | GPT-4.1 mini | GPT-4o mini |
|---|---|---|---|
| 500 conversaciones | 23 $ | 3,70 $ | 1,40 $ |
| 1.000 conversaciones | 46 $ | 7,40 $ | 2,80 $ |
| 5.000 conversaciones (10× el escenario alto) | 230 $ | 37 $ | 14 $ |

**Lectura honesta: el coste del modelo es irrelevante a este volumen, incluso con el modelo más caro.**
Optimizar el modelo para ahorrar 40 $/año sería una mala decisión si cuesta calidad de respuesta en un
producto de 300 €/cliente. **La recomendación es la contraria de lo que suele salir en estos estudios:
usar el modelo bueno.** El sitio donde optimizar no es el precio por token.

### 4.4 Lo mismo, servido con Fin

| Volumen | Como resolución (0,99 $) | Como lead qualification (9,99 $) |
|---|---|---|
| 500 | 495 $ | 4.995 $ |
| 1.000 | 990 $ | 9.990 $ |
| 5.000 | 4.950 $ | 49.950 $ |

**El diferencial no está en el modelo: está en el modelo de negocio del proveedor.** Fin cobra por
resultado; nosotros pagamos por token. A este volumen, la arquitectura propia es entre **20 y 200 veces
más barata** en la parte variable — y la diferencia crece con el volumen, no se diluye.

Con una condición que hay que decir en voz alta: **esa ventaja se paga en trabajo de ingeniería y en
riesgo operativo.** Fin funciona el día 1; nuestro bot lleva semanas y hoy no escribe en Airtable. El
ahorro es real, pero no es gratis, y la comparación honesta incluye el coste de las horas.

---

## 5. Consumo de infraestructura · ESCENARIO

| Recurso | 500 conv./año | 1.000 conv./año | Techo del plan | Margen |
|---|---|---|---|---|
| Ejecuciones n8n | ≈ 2.500 | ≈ 5.000 | 30.000/año (Starter) | **6× a 12×** |
| Escrituras Airtable | ≈ 1.000 | ≈ 2.000 | 5 req/s por base | Holgadísimo en media |
| Asientos Intercom | Sin cambio | Sin cambio | — | El bot no consume asientos |
| Outcomes de Fin | **0** | **0** | — | No se usa |

**Conclusión de dimensionamiento: el plan Starter de n8n sobra**, incluso en el escenario alto y con un
factor de seguridad de 6×. Lo que **no** se dimensiona por volumen medio es el límite de Airtable: los 5
req/s son un techo **instantáneo**, así que lo que hay que vigilar son los picos de concurrencia, no el
total mensual. A este volumen no habrá picos; el riesgo es que otro proceso de la misma base los provoque.

---

## 6. Dónde optimizar de verdad (por impacto, no por precio)

Ordenado por lo que realmente mueve la aguja:

1. **Prompt caching de la parte estable del prompt.** El System Prompt de Paula es idéntico en cada
   llamada y es la mayor parte de la entrada. Cachearlo baja la entrada un 75 % con **cero** pérdida de
   calidad. Es la única optimización de coste que no tiene contrapartida.
2. **`corte_contexto_bot` (WP-222) no es solo higiene, es coste.** Sin corte de contexto el historial
   crece sin techo y la entrada crece con él en cada turno. Un WP que ya estaba planificado por calidad
   resulta que también es el que evita que el coste crezca de forma no lineal.
3. **Modelo distinto por tarea.** El agente conversacional merece el modelo bueno. La detección de tono
   del triaje (`WP-223`) y la clasificación de complejidad (`WP-234`) son tareas de clasificación:
   funcionan con un modelo mini a una fracción del precio. Mismo agente para el usuario, modelo distinto
   para las tareas mecánicas.
4. **No añadir RAG que no hace falta.** Al confirmarse que el corpus fiscal es el System Prompt, se cae
   la tool `buscar_contexto_fiscal` y con ella el vector store y su coste de embeddings y almacenamiento.
   Esta decisión de hoy ya ha ahorrado una línea de coste entera.
5. **Cero reintentos ciegos de escritura.** Reintentar sobre un 429 sin backoff multiplica peticiones
   contra un límite que no se puede comprar. La guarda `count==1` de `WP-205` va **antes** de cualquier
   reintento, por diseño.
6. **Instrumentar tokens antes de discutir de coste otra vez.** Todo el apartado 4 es una estimación.
   Con `WP-231` hecho, la próxima conversación sobre coste se tendrá con datos medidos.

---

## 7. Contexto de mercado

### 7.1 Qué es el régimen y por qué el plazo es el eje del producto

El régimen especial para trabajadores desplazados a territorio español —la «Ley Beckham»— permite
tributar a un **tipo fijo del 24 % sobre los rendimientos del trabajo hasta 600.000 € anuales** (45 % en
el exceso) durante un máximo de **6 ejercicios**, en lugar de la escala progresiva del IRPF de residentes.

Requisitos que el bot ya comprueba, en este orden:
1. **No haber sido residente fiscal en España en los 5 años anteriores** (descarte duro).
2. Que el desplazamiento se produzca por motivos laborales.
3. **Presentar el modelo 149 en los 6 meses siguientes al alta en la Seguridad Social.**

**El punto 3 es la razón de existir de todo este producto.** Es un plazo de caducidad corto, silencioso e
improrrogable: quien lo deja pasar pierde el régimen entero, y con él seis años de ahorro fiscal. Un bot
que calcula ese plazo y avisa antes de que venza no es un asistente de soporte — es un producto que evita
una pérdida concreta y cuantificable para el cliente.

Y explica por qué la decisión de hoy sobre los recordatorios (M1/M3) es de producto y no de
infraestructura: **el aviso al lead antes de que se acerque su plazo es el valor, no un extra de
marketing.** Encaja con el argumento del equipo: son clientes que ya han pagado, y avisarles de su propio
plazo es asesoramiento, no comunicación comercial.

### 7.2 Tamaño de mercado

La Ley de Startups (2023) amplió el régimen más allá del trabajador por cuenta ajena clásico: entraron
**emprendedores, nómadas digitales y familiares** del desplazado. Es decir, la base de potenciales
solicitantes creció por norma, no por ciclo económico.

> **DATO NO DISPONIBLE:** no se ha localizado una estadística pública de la Agencia Tributaria con el
> número de modelos 149 presentados por ejercicio. La sede electrónica documenta el procedimiento, pero
> no publica el volumen en las fuentes consultadas. **No se ha estimado una cifra de mercado total**, y
> recomiendo no dar ninguna en la presentación sin fuente: es el tipo de número que alguien pregunta de
> dónde sale.
> Si hace falta, la vía es el portal de estadísticas tributarias de la AEAT o una petición directa.

Lo que sí se puede afirmar con lo que tenemos: el escenario de trabajo son **500–1.000 clientes/año**
fijado por el equipo, y **todos son clientes full VIP ya logueados y ya pagando** — lo que hoy hemos
confirmado que simplifica el diseño (el `user_id` existe siempre) y a la vez sube el coste de un fallo,
porque no hay ni un solo usuario anónimo al que perder sin consecuencias.

---

## 8. Lo que hay que decir sobre coste en la reunión, y lo que no

**Decir:**
- El coste variable del bot es de dos cifras de dólares al año. No es una palanca de decisión.
- La decisión de no usar Fin ahorra entre ≈ 950 y ≈ 9.950 $/año a 1.000 clientes, y se sostiene con la
  tarifa publicada de Intercom.
- El plan Starter de n8n sobra con 6× de margen.
- El único techo que no se puede comprar son los 5 req/s de Airtable, y se comparte con otros procesos.
- Todo lo anterior son escenarios; no hay instrumentación de tokens todavía.
- **La stack ya es cara a nivel empresa: 151.717,46 € documentados en las tres herramientas, 130.324,11 €
  pendientes de recibir. Diciendo siempre, en la misma frase, que es gasto de empresa y no del bot.**
- **El presupuesto de OpenAI está en 2.000 $/mes y julio va por 11.632,54 $: 5,8× por encima. Esto es dato
  medido, no estimación.**
- **Consumo medido de OpenAI a nivel empresa: 348.043 requests y 11.364.925.066 tokens; ≈ 0,0143 $ por
  request y ≈ 0,4383 $ por millón de tokens en la ventana del 16 al 31 de julio.**
- **Que la discrepancia de OpenAI (≈ 71.335 € facturados en julio frente a 11.632,54 $ de «July spend») está
  detectada, acotada al 99,4 % en una sola factura, y pendiente de confirmar. Decirlo como pregunta abierta
  es fuerza, no debilidad.**

**No decir:**
- Ninguna cifra de mercado total de solicitantes del régimen: no hay fuente.
- **Ninguna cifra de cuota de mercado de modelos 149: no existe estadística pública que la sostenga.**
- **Estas facturas NO se presentan como coste del proyecto Beckham.** Son de uso general de toda la empresa.
  Atribuirlas al bot infla su coste en dos órdenes de magnitud, y es el error que hay que evitar a toda costa
  en esta parte de la presentación.
- **No dar por buena ninguna de las dos cifras de OpenAI como «el gasto de OpenAI»** mientras la discrepancia
  esté abierta, ni afirmar la causa (compromiso anual, cuentas distintas): son hipótesis sin verificar.
- **No convertir € a $ ni al revés en voz alta:** no hay tipo de cambio declarado.
- Ningún coste «real» por conversación como si estuviera medido: no lo está.
- Que el ahorro frente a Fin es gratis: se paga en horas de ingeniería, y el proyecto lleva semanas.

---

## Fuentes

**Facturación y consumo real (apartado 2) — fuentes internas, sin URL pública:**

- Herramienta de facturación interna de TaxDown · 9 facturas de n8n GmbH, FORMAGRID INC DBA AIRTABLE y
  OpenAI / OPENAI, LLC · leídas el 2026-07-31. **Gasto de uso general de la empresa, no del proyecto.**
- Dashboard de uso de OpenAI, organización TaxDown · ventana 16/07/2026–31/07/2026 · consultado el
  2026-07-31. **Consumo de toda la organización, no del bot.**

**Precios de lista y contexto:**

- [OpenAI API Pricing In 2026: Every Model Compared — CloudZero](https://www.cloudzero.com/blog/openai-pricing/)
- [OpenAI API Pricing 2026: GPT-4.1 at $2, GPT-5 at $1.25/1M — PE Collective](https://pecollective.com/tools/openai-api-pricing/)
- [GPT-4o mini API Pricing 2026 — PricePerToken](https://pricepertoken.com/pricing-page/model/openai-gpt-4o-mini)
- [Intercom Pricing 2026: Seats, Fin AI & Channel Costs — Chatarmin](https://chatarmin.com/en/blog/intercom-pricing)
- [Intercom Pricing 2026: Seats, Fin AI Outcomes & the Real Total — Drag](https://www.dragapp.com/blog/intercom-pricing/)
- [How Much Does Intercom's Fin AI Cost? 2026 Pricing — Featurebase](https://www.featurebase.app/blog/fin-ai-pricing)
- [n8n Pricing 2026: All Plans & Real Costs — LowCode](https://www.lowcode.agency/blog/n8n-pricing)
- [n8n Pricing 2026: Cloud Plans and Self-Hosting Costs — No Code MBA](https://www.nocode.mba/articles/n8n-pricing)
- [Airtable Pricing 2026: Seats, Records, and the Real Monthly Cost — TinyCommand](https://tinycommand.com/blogs/airtable-pricing-explained)
- [Managing API Call Limits in Airtable — soporte oficial de Airtable](https://support.airtable.com/docs/managing-api-call-limits-in-airtable)
- [API rate limit — documentación oficial de Airtable](https://airtable.com/developers/web/api/rate-limits)
- [Modelo 149. IRPF. Régimen especial aplicable a los trabajadores desplazados — Sede electrónica de la Agencia Tributaria](https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G606.shtml)
- [La Ley Beckham: el régimen especial de tributación — PayFit](https://payfit.com/es/contenido-practico/ley-beckham-regimen-especial-tributacion/)
- [Ley Beckham 2026: requisitos, ventajas y modelos — INEAF](https://www.ineaf.es/tribuna/la-ley-beckham-el-regimen-para-los-impatriados/)

*Precios consultados el 2026-07-30. Los precios de proveedor cambian; volver a verificarlos antes de
usarlos en cualquier documento contractual.*
