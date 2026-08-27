# Auditoría del canvas nuevo · `Mobility Bot (OnClick)` · 27/08/2026

Leído **abriéndolo en el navegador**, no de memoria: el MCP de Intercom no expone Custom Bots.
Workflow `68617004`, workspace `s1hap599` = **TaxDown, PRODUCCIÓN** (confirmado por el usuario el
27/08: se trabaja en prod y la norma del workspace TEST queda derogada). Estado: **Draft**. Trigger: **When customer clicks a
website element**. Audiencia: `Users` + 2 más.

## 1 · Lo que hay: 32 paths

`A` … `AF`, con **11 finales (END)**. Solo cuatro están nombrados: `A. Selección Idioma`,
`B. Introducción ESP`, `C. Introducción ENG` y `Z. FAQ`. **Los otros 28 se llaman «Path»** — con 32
paths y sin nombre, nadie va a saber cuál es cuál dentro de una semana (y renombrar un path es
gratis: no rompe nada).

Estructura medida:

```
[When customer clicks a website element]
└─► A. Selección Idioma  ── reply buttons [🇪🇸 Español] [🇬🇧/🇺🇸 English]
    ├─► B. Introducción ESP ─┬─► D. Path ──► E. Path ──[END]──► G. Path ──► I. Path ⚠️ ──► J …
    │                        └─► Z. FAQ  ──[END]──► F. Path ──► H. Path ──► N. Path ──► K …
    └─► C. Introducción ENG ─┬─► AA. Path ─[END]──► R. Path ─[END]──► T. Path ──► W. Path ⚠️ ─► L …
                             └─► Q. Path ──────────► S. Path ────────► V. Path ──► AC. Path ─► O …
```

**El flujo está duplicado por idioma** (ESP y ENG en paralelo), que es una decisión de diseño que el
plan no contemplaba: el plan asumía un solo flujo y el idioma como atributo. Duplicar funciona, pero
**cada arreglo hay que hacerlo dos veces** — es la misma trampa que ya paga el script del correo
inglés de Airtable, que existe dos veces y hay que cambiarlo en los dos sitios.

## 2 · LOS DOS ERRORES QUE INTERCOM YA MARCA

`I. Path` y `W. Path` llevan ⚠️ rojo. El tooltip, literal:

> **«Branches don't have a value, make sure you add at least one condition»**

Abierto `I. Path`: tiene un paso **Branches** con **dos ramas, las dos con «Missing condition»**, más
el `else`. Es decir: **las dos ramas están vacías y todo cae al `else`.**

Y eso importa mucho, porque `I` es el branch del veredicto de F2 (`en_plazo` / `fuera_plazo`) y el
`else` es el que **cierra la conversación**. Es exactamente el modo de fallo que costó cinco días en
julio, con otra causa: entonces el atributo se leía del encabezado del DC y venía vacío; ahora la
condición no está escrita.

**No es un descuido: es el orden.** No se pueden escribir esas condiciones todavía, porque la
condición es `veredicto_f2 contains en_plazo` y **el atributo `veredicto_f2` no existe en este
workspace hasta que exista el Data Connector con su Object mapping.** Primero el DC, después las
condiciones.

## 3 · Qué falta, en orden de ejecución

| # | Qué | Por qué en este orden |
|---|---|---|
| 1 | **Los 3 atributos del cálculo**: `veredicto_f2`, `fecha_limite_f2`, `dias_pasados_f2` (Conversation, **Text** los tres — `dias_pasados_f2` Text a propósito, para no arriesgar desajuste de tipo) | Sin ellos el Object mapping no tiene destino |
| 2 | **Los 5 atributos nuevos**: `corte_contexto_bot`, `faq_resumen_bot`, `faq_turnos_bot`, `intentos_fecha_bot`, `corr_id_bot` (Conversation, Text). **`modo_bot` NO se crea** | `intentos_fecha_bot` lo necesita la rama de fecha no parseable |
| 3 | **DC `beckham_plazo_f2`** con su **Object mapping** de 3 filas (pestaña «2 Data», Intercom object = `Conversation`, API object = `Root`) | Es lo que RELLENA los atributos del punto 1 |
| 4 | **Volver a `I. Path` y `W. Path`** y escribir las condiciones. En `I`: `veredicto_f2` **contains** `en_plazo` / **contains** `fuera_plazo`, insertando el chip **desde el encabezado `Conversation`**, nunca desde el encabezado con el nombre del DC | Los ⚠️ desaparecen aquí, no antes |
| 5 | **DC `beckham_upsert_expediente`** en los 4 puntos de persistencia, cada uno con su `punto` **y su `modo`** desde «Map action inputs» | Sin esto ninguna rama guarda nada |
| 6 | **DC del agente** (`n8n_bot_mobility`) en el punto que cualifica, vía `Pass to` al reusable | Es el que trae al bot conversacional |
| 7 | **DC `beckham_faq`** en `Z. FAQ` (con `wait_for_callback`, `punto=faq_entrada`, `modo=faq_regimen`) | `Z. FAQ` hoy va directo a un END |
| 8 | **Renombrar los 28 «Path»** con su función | Gratis, y es la diferencia entre mantenerlo y no |

## 4 · Dos cosas que revisar en el canvas tal como está

- **`Z. FAQ` acaba en `END`** justo después: si el FAQ tiene que responder, ahí falta el `Collect
  data` + el DC + los botones `WDONE`. Tal cual, un cliente que pulse «tengo preguntas» se queda sin
  respuesta y con el hilo cerrado.
- **Hay 11 END.** El diseño solo admite `Close conversation` en **dos** sitios (descarte duro y
  descarte por plazo). Un `END` de path no es necesariamente un `Close` — pero hay que comprobar uno
  por uno cuáles llevan `Close conversation` de verdad, porque cerrar el hilo en cualquier otra rama
  rompe la reentrada y contradice la invariante.

## 5 · Errata de texto, ya que se está mirando
`A. Selección Idioma` dice **«¿Quieres que te atendamos en españo?»** — falta la `l` de «español».
Es el primer mensaje que ve el cliente.
