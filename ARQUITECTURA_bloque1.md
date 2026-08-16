> ⚠️ **DOCUMENTO HISTÓRICO · última verdad el 20/07/2026. NO es el estado actual.**
>
> Lo sustituye: **`docs/arquitectura-completa-2026-08-16.md`**.
>
> Describia solo el Bloque 1 y una arquitectura en la que los filtros F1/F2/F3 vivian en n8n. Desde finales de julio los filtros estan en el canvas de Intercom, asi que el reparto de responsabilidades que cuenta este fichero YA NO ES CIERTO.
>
> *Banner añadido el 16/08/2026 al ordenar el repositorio.*

---

# Bot Régimen Beckham — Callback, Fallback y Arquitectura (Bloque ①)

Documento explicativo del mecanismo de comunicación Intercom↔n8n y de la arquitectura
implementada en el **Bloque ① (filtros eliminatorios)** del workflow `beckham_bot`
(id `nhOwpiGxikeU5DLR`).

Fecha: 2026-07-20 · Estado: Bloque ① completo, verificado, **en borrador (sin publicar)**.

---

## 1. El *callback* — cómo n8n le devuelve el mensaje a Intercom

El bot **vive en Intercom**, pero la lógica (decidir qué contestar) corre en **n8n**. El
problema: n8n tarda en calcular, e Intercom no puede quedarse esperando de forma síncrona.
Se resuelve en **dos tiempos**:

1. **Ida (síncrona):** el cliente escribe → un workflow de Intercom llama al **webhook de
   n8n** (vía el *Data Connector*). n8n responde de inmediato un simple "ok, recibido"
   (*ack*). Intercom queda **esperando** en un paso "Wait for webhook".
2. **Vuelta (asíncrona = el callback):** n8n hace su lógica con calma y, al terminar, hace un
   **POST de vuelta** a una URL especial de Intercom:
   ```
   POST https://api.intercom.io/hooks/workflows/trigger_step/q3bhdtoi_.../<CONVERSATION_ID>
   body: { "data": { "mensajeUsuario": "<texto a mostrar>" } }
   ```
   Esa URL lleva un **token embebido** → no hace falta ni autenticación ni `admin_id`. Ese
   POST es **el callback**: "oye Intercom, ya tengo la respuesta, es este texto". Intercom
   reanuda la conversación y muestra `mensajeUsuario` al cliente.

En nuestro workflow, ese POST lo hace el nodo **`Callback_Intercom`**, y el texto que envía
es `{{ $json.message }}` (el campo `message` que cada nodo `Set_*` fija). Por eso **todas
las ramas convergen** antes en `Callback_Intercom`: hay un único punto de salida hacia
Intercom (y es el punto que un día sustituirá el AI Agent de Paula).

> Se descartó la alternativa "n8n llama a la API de conversaciones de Intercom con
> `admin_id`" — el callback es más simple y sin credenciales.

---

## 2. El *fallback* — la salida "por defecto" del Switch

`Filtro_Eliminatorio1` es un nodo **Switch**: enruta según `pregunta_pendiente`
(F1 / F2 / F3). El **fallback** es una **4ª salida extra** (`fallbackOutput: "extra"`) que se
activa **cuando ningún caso coincide**.

¿Cuándo pasa eso? Cuando `pregunta_pendiente = "completo"` — es decir, el cliente **ya
respondió F1, F2 y F3**. En ese caso no hay más filtros que hacer, así que el fallback lo
lleva a `Set_Fallback_continuar` (mensaje "continuar") → hacia el futuro **Bloque ②**.

> Hoy es **código inalcanzable**: como Airtable está desactivado, no se guardan las
> respuestas entre turnos y `pregunta_pendiente` siempre vale `"F1"`. El fallback solo se
> activará cuando se cablee la persistencia. Ya queda bien conectado
> (`out3 → Set_Fallback_continuar → Converger`).

---

## 3. Arquitectura implementada (Bloque ① — filtros)

### Visión de conjunto (Intercom ↔ n8n)
```
Cliente escribe en Intercom
   → workflow Intercom (reuse_mobility → n8n_BOT_mobility)
   → Data Connector llama al Webhook de n8n   ── ida síncrona (ack) ──►
   → n8n calcula (filtros F1/F2/F3)
   → n8n POST callback a Intercom { data:{ mensajeUsuario } }  ── vuelta asíncrona ──►
   → Intercom muestra el mensaje al cliente
```

### Dentro de n8n (lo construido)
```
Webhook1 → … → Determinar_Pregunta_Pendiente1 → Filtro_Eliminatorio1 (Switch)
   ├ out0 (F1) → Interpretar_F1      → Ruta_F1 ┬ avanza  → Set: message = pregunta F2
   │                                            ├ descarta→ Set: message = sin_alta_ss
   │                                            └ reintento→ Set: message = "no te entendí"
   ├ out1 (F2) → Calcular_Plazo_F2   → Ruta_F2 ┬ avanza  → Set: message = pregunta F3
   │            (parsea fecha libre,            ├ descarta→ Set: message = plazo_vencido
   │             fecha+6m ≥ hoy?)               └ reintento→ Set: message = "no leí la fecha"
   ├ out2 (F3) → Interpretar_F3      → Ruta_F3 ┬ avanza  → Set: message = continuar (Bloque②)
   │            (invertido:                     ├ descarta→ Set: message = residente_5_anios
   │             NO cualifica, SÍ descarta)     └ reintento→ Set: message = "no te entendí"
   └ out3 (fallback = "completo") → Set_Fallback_continuar → (message = continuar)
                                                                        │
   ┌────────────────── los 10 Set_* convergen ─────────────────────────┘
   └► Converger_Bloque1 (NoOp) ─► Callback_Intercom ─► POST a Intercom
```

### Ideas clave del diseño
- **Interpretación determinista** (nodos *Code*, sin IA): palabras clave sí/no y parseo de
  fecha. Reproducible y barato.
- **3 desenlaces por filtro**: `avanza` / `descarta` / `reintento` (respuesta ambigua →
  repregunta, nunca descarte).
- **Cada `Set_*` es intercambiable**: fija solo el `message`. Mañana ese texto lo puede
  generar un AI Agent sin tocar el cableado.
- **Un único punto de salida** (`Converger → Callback_Intercom`): toda la lógica desemboca
  ahí; es la "junta" limpia hacia Intercom.

### Lógica de cada filtro (resumen)
| Filtro | Pregunta | avanza | descarta | reintento |
|---|---|---|---|---|
| **F1** | ¿Alta en la Seguridad Social? | Sí → F2 | No → `sin_alta_ss` | ambiguo |
| **F2** | ¿Qué día te diste de alta? | `fecha+6m ≥ hoy` → F3 | `fecha+6m < hoy` → `plazo_vencido` | no se parsea fecha |
| **F3** (invertido) | ¿Residente fiscal últimos 5 años? | **No** → continuar | **Sí** → `residente_5_anios` | ambiguo |

---

## 4. Estado y siguiente

- **Bloque ① completo, verificado por MCP y guardado en borrador — SIN publicar.**
  Producción sigue con la versión anterior hasta que se decida publicar.
- **Pendientes** (ver `Trabajo.md` → "RETOMAR AQUÍ"): paso "Reply" en Intercom,
  persistencia Airtable (desbloquea el multi-turno y el fallback), test end-to-end,
  y sustituir los textos placeholder por los redactados finales.
