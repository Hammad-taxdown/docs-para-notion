# Parche · `FechaLlamada`, el marcador 17 del informe · 14/08/2026

> **⚰️ SUPERADO — 27/08/2026.** Este parche quedó anulado por la decisión del **19/08/2026**: la
> fecha de la llamada **NO se pregunta** (al reservar en Calendly el cliente ya recibe la cita con su
> fecha). `fecha_llamada` se **eliminó de los cinco sitios** — el prompt (incluido el recordatorio
> `11b`), el parámetro de la tool (41 → 40), el validador, el lector y el PDF — y la columna
> `FechaLlamada` quedó **huérfana a propósito** (no se borra: se llevaría el dato de las filas que ya
> lo tienen). **No reponer nada de este documento**: los pasos marcados «pendiente» ya no son
> pendientes, son cosas que se decidió no hacer. Además, la regla vigente de un campo nuevo son
> **CINCO sitios** (el quinto es el lector), no los cuatro que cuenta este doc. Lo vigente está en
> `CLAUDE.md` §6 («La fecha de la llamada NO SE PREGUNTA») y en `.spartax/log.md` del 19/08.

> **Qué cierra.** `{{fechaLlamada}}` era el único de los 17 marcadores del informe Mobility **sin
> origen**: la plantilla lo llama «Fecha de la reunión» y se imprimía `Por confirmar`. Comprobado el
> 14/08 campo por campo contra el esquema vivo: **no existía ninguna columna de fecha de reunión** en
> toda la base (las que hay son `fecha_alta_ss`, `fecha_prevista_alta`, `fecha_limite_plazo` y
> `FechaNacimiento`, y ninguna es esto).
>
> **Por qué lo recoge el bot y no una persona.** El bot ya cierra la conversación con
> `MotivoCierre = 'Llamada agendada'`, o sea que **la fecha se dice en la conversación** y hasta hoy
> se tiraba. Es el patrón que ya ha costado cuatro incidentes en este proyecto: el camino existe y
> nadie lo usa.

## Los cuatro sitios

Un campo nuevo en este proyecto son **cuatro sitios**, y si falta uno **no falla nada**: el escritor
ignora las claves que no conoce y devuelve `ok:true`. El dato simplemente no llega.

| # | Sitio | Estado |
|---|---|---|
| 1 | Columna de Airtable | **HECHO** — `FechaLlamada`, `fldv69piH32yZP89O` |
| 2 | Parámetro de la tool `guardar_datos_cliente` | pendiente, UI de n8n |
| 3 | Whitelist de `Validar y Normalizar` | pendiente, UI de n8n |
| 4 | Línea del prompt en LangSmith | pendiente |

---

## 2 · Parámetro de la tool `guardar_datos_cliente`

Workflow `beckham_bot` → nodo `guardar_datos_cliente` → **Body Parameters** → *Add Parameter*.
Queda el **41**, detrás de `municipio_residencia`.

**Name:**
```
fecha_llamada
```

**Value** (modo Expression):
```
{{ $fromAI('fecha_llamada', `Fecha de la reunion o llamada que el cliente ha agendado con el equipo fiscal, en formato DD/MM/AAAA con barras. Ejemplo: 22/08/2026. SOLO se rellena si el cliente dice la fecha; si dice que ya la ha agendado pero no dice cuando, se deja VACIO y no se inventa. NO la confundas con la fecha de llegada a Espana ni con la fecha de alta en la Seguridad Social: son tres datos distintos.`, 'string') }}
```

Los acentos van fuera a propósito en la descripción del `$fromAI`, igual que en
`municipio_residencia`: es texto que viaja por el portapapeles hasta un nodo de n8n.

---

## 3 · Whitelist de `Validar y Normalizar`

Mismo workflow → nodo `Validar y Normalizar` → `Cmd+F` y busca:

```
ponerFecha('fechaDesplazamiento', body.fecha_desplazamiento);
```

Hay **una sola** coincidencia (línea 221). Añade **debajo** una línea:

```js
ponerFecha('FechaLlamada', body.fecha_llamada);
```

Y ya está: `ponerFecha` hace todo lo demás. Normaliza la fecha con `toIsoDate`, y si no la entiende
**no escribe nada y la mete en `descartadas`**, que es el bucle por el que el agente vuelve a pedir un
dato inválido. No hay que tocar nada más del validador.

---

## 4 · Columna en `Airtable Upser Expediente`

Mismo workflow → nodo `Airtable Upser Expediente` → añade la columna `FechaLlamada` con el mismo
patrón que las otras:

```
{{ $json.fields.FechaLlamada }}
```

La tabla del escritor pasa de **56 a 57 columnas**.

**No hace falta tocar `typecast`**: ya está en `true`, y es justo lo que hace que Airtable acepte el
datetime que produce `ponerFecha` en una columna de solo fecha.

---

## 5 · Línea del prompt (LangSmith, `bot_mobility_prompt`, tag `prod`)

**Este es el sitio que se olvida.** El 13/08 pasó con las tres columnas del `.030`: se publicaron la
tool, el validador y el mapeo, y quedó anotado *«falta el cuarto sitio: el prompt»*.

Donde el prompt habla del cierre y de agendar la llamada, añadir:

> Si el cliente te dice la fecha de la reunión o llamada que ha agendado con el equipo fiscal,
> guárdala en `fecha_llamada` en formato DD/MM/AAAA. **Si no la dice, no la pidas y no la inventes**:
> se deja vacía y el informe sale igual. No la confundas con la fecha de llegada a España ni con la
> del alta en la Seguridad Social.

**Nunca arrastrar a una publicación un parche que el log marque como no verificado** (la lección del
v5 dentro del v6, que metió un bucle infinito en la pregunta del idioma).

---

## Cómo se comprueba que ha llegado

1. En una conversación de prueba, decirle una fecha de reunión.
2. Mirar la columna `FechaLlamada` de esa fila.
3. Marcar `RegenerarInforme` y comprobar que el PDF dice esa fecha en «Fecha de la reunión» en vez de
   `Por confirmar`.

**Si la columna se queda vacía, el sitio que falta es el 5**, el prompt: el agente no sabe que tiene
que recoger el dato. Es el fallo silencioso por diseño de este proyecto.
