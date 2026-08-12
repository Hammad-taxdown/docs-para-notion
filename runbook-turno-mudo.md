# Runbook · el turno mudo

**Síntoma:** el cliente escribe en el Messenger y **el bot no contesta**. O contesta tarde, o repite
el mensaje anterior.

Es el fallo más caro de diagnosticar del proyecto porque **cinco capas distintas** pueden causarlo y
todas se parecen desde fuera. Este runbook las recorre **en orden**, de la más barata a la más cara.

> **La regla:** no saltes pasos. El 90% de las veces muere en el 1 o en el 2, que son los dos que se
> comprueban sin abrir n8n. Y **anota en qué paso murió** — el gate de cierre de cualquier WP lo pide.

---

## Paso 1 · ¿Es un ticket?

**Por qué primero:** es gratis y es la causa histórica número uno. Si la conversación se convirtió en
ticket, el canvas deja de gobernarla y el bot no vuelve a hablar.

```
mcp__claude_ai_Intercom__get_conversation  →  conversation_id
```

Mira **`ticket`**. Si **no** es `null`, ya está: no es un fallo del bot.

Y de paso mira **`state`**: si es `closed`, el bot cerró la conversación (mira `MotivoCierre` en
Airtable) y el silencio es correcto.

---

## Paso 2 · ¿Es Preview?

**Regla del proyecto: Preview nunca, Simulation tampoco.** En Preview el canvas se comporta distinto y
los Data Connectors no salen de verdad.

Si estabas probando desde el editor del canvas, **el diagnóstico se acaba aquí**. Repite en el
Messenger real antes de seguir.

---

## Paso 3 · ¿Hay ejecución en n8n?

```
mcp__n8n-mcp__search_executions  →  workflowId: nhOwpiGxikeU5DLR, startedAfter: <ISO>
```

| Lo que ves | Qué significa |
|---|---|
| **Ninguna ejecución** | El mensaje **no llegó a n8n**. El problema está en Intercom: el DC no salió, o el canvas no llegó a ese nodo. Salta al paso 4 |
| **Ejecución en `error`** | Ábrela con `get_execution` y `includeData: true`. Ahí está la causa |
| **Ejecución en `success` pero el bot calló** | El caso feo. Sigue leyendo |

**Si hay `success` sin respuesta**, mira estos nodos con `get_execution` y `nodeNames`:

- **`¿Prompt vacio?`** — `out1` es la rama **sana**. Si salió por `out0`, LangSmith falló y entró el
  respaldo. *La condición está escrita en positivo: `out0` es el error.*
- **`Callback_Intercom`** — si no ejecutó, el agente respondió pero nadie se lo dijo a Intercom.
- **`Formatear_conversacion1`** — mira cuántas partes trae. Si vienen de más, el agente está leyendo
  turnos que no son suyos.

> **`corr_id` todavía no existe.** Hoy hay que cruzar n8n con Intercom **a ojo por timestamps**. Eso
> es exactamente lo que resuelve `WP-208`, y es la razón de que este paso sea el más caro.

---

## Paso 4 · ¿El Data Connector devolvió 200?

Si el paso 3 no encontró ejecución, el mensaje murió antes. En Intercom, en la conversación, busca la
llamada del DC y mira su código.

| Código | Causa |
|---|---|
| **403** | El auth de los webhooks está encendido y el DC no manda la cabecera. *Hoy el auth está apagado, así que un 403 significa que alguien lo encendió* |
| **404** | La ruta del webhook no coincide |
| **5xx** | n8n devolvió error; vuelve al paso 3, la ejecución existe |
| **timeout** | El agente tardó más que el DC. Mira `executionTime` de la ejecución |

---

## Paso 5 · ¿Llegó el callback?

El DC va con `wait_for_callback`: Intercom **se queda esperando** hasta que n8n le devuelve la
respuesta por el callback. Si el callback no llega, la conversación se queda muda **aunque todo lo
demás haya ido bien**.

Busca `wait_for_callback_webhook_received` en la conversación. Si no está, el problema es
`Callback_Intercom` (paso 3), no el agente.

---

## Al cerrar

Anota en `.spartax/log.md` **en qué paso murió**. Dos frases bastan. Con cinco o seis diagnósticos
anotados se ve solo cuál es la capa que más falla, y ahí es donde vale la pena invertir.

## Reglas que acompañan a este runbook

- **Regla 3×90** — 3 iteraciones o 90 minutos sin evidencia nueva → se para de teorizar y **se ejecuta
  el experimento discriminante más barato**.
- **Gate de dos fuentes** — nada se da por diagnosticado con una sola observación. Un `ok:true` y una
  traza no son dos fuentes si salen de la misma ejecución.
- **Seguir el dato hasta la celda**, no hasta el primer nodo donde aparece. Costó una falsa alarma el
  07/08 (el `user_email` de operador) y una ficha falsa el 10/08 (`T037`, la nacionalidad).
- **Diagnosticado no es resuelto.** Y **montado no es funcionando**.
