---
id: WP-04
title: "Fix: branch de Intercom no detecta el veredicto del connector F2/F3 (cae siempre a reintento)"
status: done
size: S
depends_on: []
milestone: "Fase 2 — Persistencia"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-04 — Fix: branch de Intercom no detecta el veredicto del connector F2/F3

> ## ✅ RESUELTO Y VERIFICADO (2026-07-28)
>
> **Causa raíz real:** los outputs de un Data Connector son atributos **locales del path del connector** y **no son legibles desde otro path**. El branch `I. Path` vivía en un path distinto al del connector (`F`), así que leía vacío. Confirmado con el experimento decisivo: cambiar la condición a **`has any value`** y seguir cayendo al `else` — si el atributo tuviera cualquier valor, habría entrado.
>
> **Solución aplicada:** `Object mapping`, al final de la pestaña **`2 Data`** del Data Connector. Permite mapear campos de la respuesta a atributos **reales de Intercom**:
> - `Intercom object` = **Conversation** · `API object` = **Root**
> - 3 filas de `+ New attribute mapping` (atributo de Intercom a la izquierda, campo de la API a la derecha): `veredicto_f2`←`veredicto`, `fecha_limite_f2`←`fecha_limite`, `dias_pasados_f2`←`dias_pasados`
> - Los 3 atributos se crearon como **Conversation attributes de tipo Text** (`dias_pasados_f2` también Text a propósito, para no arriesgar un desajuste de tipo con un número).
> - En el workflow: las dos condiciones de `I. Path` pasan a leer **`veredicto_f2`** (aparece bajo el encabezado `Conversation`), y los chips del mensaje `N` a `fecha_limite_f2`/`dias_pasados_f2`.
>
> **Verificación (conversaciones reales, `Workflow: Preview` = false, lanzadas desde `development.app.rentax.es`, comprobadas por MCP en los `custom_attributes`):**
>
> | Conversación | `veredicto_f2` | `fecha_limite_f2` | `dias_pasados_f2` | Resultado |
> |---|---|---|---|---|
> | `215475260434281` | `fuera_plazo` | `21/12/2025` | `219` | Mensaje de plazo pasado → cerrada |
> | `215475260478265` | `en_plazo` | `01/10/2026` | `0` | Asignada al team `11098265` (= `G`) |
>
> **Hipótesis descartadas por el camino, todas falsas:** Pill Conversion Error · atributos duplicados a nivel de app · desajuste de tipo · el operador `contains` · "algo del workspace TEST". Tampoco servían el paso `Set <atributo>` (su caja de valor solo acepta texto literal, no chips) ni el diálogo `Edit data attribute` de la pestaña `2 Data` (solo da forma al output).
>
> **Efectos colaterales:** (1) `M. Path` (la re-llamada redundante al connector) deja de tener sentido — se puede eliminar en un cambio aparte. (2) Queda resuelto el bloqueo del 24/07 de que `fecha_limite`/`dias_pasados` no aparecían en el selector del mensaje `G`: misma causa. (3) **Para WP-06:** esos valores son ahora atributos de conversación, así que en el DC de persistencia se declaran con `Data source = Select data attribute` y se autorrellenan, sin mapeo paso a paso.
>
> **Pendiente menor:** al mensaje de `N. Path` le faltan espacios alrededor de los chips (`21/12/2025y han pasado: 219días`).

> **Specified (2026-07-27, sesión de auditoría por MCP + Chrome).** Causa raíz confirmada con evidencia directa (log del Data Connector + conversación real), no solo hipótesis. Ya no requiere diagnóstico de IT — el fix es un cambio de un solo chip en el editor de Intercom. Pendiente de ejecutar y publicar.

## 1. Objective

Restaurar el mensaje de descarte por plazo vencido ("tu plazo terminó el {fecha_limite}, hace {dias_pasados} días…") mostrando la fecha límite real y los días pasados, en vez de caer siempre en el mensaje de reintento ("no he entendido la fecha"). El cálculo en n8n ya está correcto y verificado por curl — el problema está exclusivamente en cómo Intercom lee el resultado del Data Connector.

## 2. Estructura real confirmada (auditoría 27/07, vía Chrome sobre el editor de `OnClick Mobility`)

Los nombres de los paths NO coinciden con los que tenía la memoria del proyecto (esa memoria queda corregida por esta auditoría):

```
F. Fecha Alta SS  (Collect data, atributo texto + bloque del Data Connector beckham_plazo_f2)
   → I. Path  (Branch: condiciones sobre "veredicto")
        veredicto contains en_plazo    → G. Enviar a n8n        (rama cualifica)
        veredicto contains fuera_plazo → M. Path (re-llama beckham_plazo_f2 con el mismo
                                          fecha_alta_ss; redundante pero no roto) → éxito → N.Path
                                          (mensaje "tu plazo ya se ha pasado" con {fecha_limite}/
                                          {dias_pasados}) · fallo de conexión → O.Path (escalar a humano)
        else                            → K. Path → vuelve a F (reintento "no he entendido la fecha")
```

El branch real se llama **I. Path**, no "J. Path" como decía la memoria previa. Solo hay UNA condición de 2 (`en_plazo`, `fuera_plazo`) más `else`; no hay una tercera condición para "no_valida" — cualquier veredicto que no sea exactamente esas dos cadenas (incluyendo `no_valida` o vacío) cae en `else`.

## 3. Causa raíz — CONFIRMADA con evidencia directa (no inferencia)

Verificado el 27/07 combinando dos fuentes independientes, ambas de la MISMA conversación real:

1. **Log del Data Connector** `beckham_plazo_f2` (Settings → Integrations → Data connectors → beckham_plazo_f2 → Logs), ejecución `24 jul 2026, 18:42:24`, `Source: Conversation (ID: 215475219542253)`, `Executed in: Custom Bot: OnClick Mobility`: respuesta 200, cuerpo transformado
   ```json
   { "veredicto": "en_plazo", "fecha_alta_norm": "2026-03-03", "fecha_alta_ddmmaaaa": "03/03/2026",
     "fecha_limite": "03/09/2026", "fecha_limite_iso": "2026-09-03", "dias_pasados": 0 }
   ```
   con el estado **"Response processing: API attributes mapped successfully"** (Intercom confirma que mapeó bien el output).
2. **La conversación real** (`215475219542253`), abierta en el Inbox: el mensaje siguiente del bot, timestamp exacto **18:42:26** (2 segundos después de la llamada exitosa), es la repetición de "¿Qué día te diste de alta en la Seguridad Social?" — el mensaje de reintento de la rama `else`/K, NO el de la rama `en_plazo`/G.

Esto **descarta definitivamente**:
- Que el problema esté en n8n o en el cálculo (el connector devolvió el valor correcto).
- Que el problema sea el mapeo del connector (Intercom confirma "mapped successfully").
- La hipótesis de **atributos duplicados a nivel de app**: verificado en el selector de atributos de la propia condición (buscando "veredicto") que existe **un único** atributo con ese nombre en todo el workspace, agrupado bajo el encabezado `beckham_plazo_f2`. No hay ningún homónimo de People/Conversation con el que pueda confundirse.

**Causa más probable, ahora respaldada por evidencia de ejecución real (antes solo era la hipótesis documental más barata):** el chip `veredicto` usado en la condición de `I. Path` no está correctamente vinculado a la instancia del output del connector — visualmente aparece como un chip válido (agrupado bajo `beckham_plazo_f2` al reinsertarlo desde cero), pero en tiempo de ejecución la comparación `contains en_plazo` no matchea contra un valor que sabemos, por el log, que SÍ llegó como `"en_plazo"`. Es el patrón exacto de un **Pill Conversion Error** (INTERCOMDOC §5): el chip se ve bien en el editor pero resuelve a `null`/vacío en tiempo real.

## 3-bis. ⚠️ FIX APLICADO — RESULTADO **NO CONCLUYENTE** (2026-07-28). La hipótesis 1 NO está refutada.

> **CORRECCIÓN (28/07, misma sesión).** Una primera versión de esta sección afirmaba que el fix se había probado "en el Messenger real" y que la hipótesis del Pill Conversion Error quedaba **refutada**. **Eso era falso y queda anulado.** Verificado por MCP de Intercom: las **5 únicas conversaciones** del workspace `q3bhdtoi` creadas o actualizadas el 28/07 son de **Preview** (`"Workflow: Preview": true`, contacto `Preview User` / `preview-user+q3bhdtoi@intercom.io`, `first_contact_reply.url = app.intercom.com/hosted_messenger/.../workflow_preview?preview_only=true`). **No existe ninguna conversación real ese día.**
>
> Y la prueba de Preview es vacía por sí misma: en la conversación `215475256309517` hay `custom_action_finished result:"success"` a las 08:52:18 UTC, pero la última ejecución de `beckham_f2_plazo.` es de las **07:30:49 UTC** — Intercom reportó éxito **sin llamar a n8n**, usando la respuesta mock. Corroboración: en la ejecución real del 24/07 (`8046124`) la cabecera `x-intercom-source-dataconnector-id: 468021` está presente; en las 8 ejecuciones del 28/07 está **vacía** → fueron pulsaciones del botón **Test** del DC, no ejecuciones de workflow.

El fix de la sección 4 **se aplicó** (chip `veredicto` borrado y reinsertado con el selector `{..}` en ambas condiciones de `I. Path`) y se **publicó** (Set changes live). **No se ha validado con ninguna conversación real, así que no se sabe si funciona.**

⇒ **La hipótesis del "Pill Conversion Error" sigue VIVA.** Estado de WP-04: **no concluyente**, no parqueado por refutación.

## 3-ter. Hechos NUEVOS verificados el 28/07 que cambian el diagnóstico

1. **El `else` de `I. Path` NO reintenta: CIERRA la conversación.** Verificado en el timeline: mensaje del `else` a las `08:52:39` → `close` en el mismo segundo → `message_assignment: nobody_admin`. **Toda la documentación del proyecto (memoria, `Trabajo.md`, este PRD, WP-06) decía `else → K.Path → vuelve a F (reintento)`. Es falso.** Con el bug vivo, el 100% de quienes llegan a `F` acaban en un callejón sin salida y sin persistencia.
2. **El texto del `else` es "No he entendido bien la fecha"**, que es un mensaje de **validación de recogida**, no de veredicto. Y el `attribute_collector` de la conversación tiene `created_at 08:52:09` / `updated_at 08:52:17`. **Hipótesis alternativa no considerada hasta ahora:** puede que `K` no cuelgue del `else` del branch sino de una **salida de fallo del Collect data**, y que el branch nunca llegue a evaluarse. Nadie ha comprobado de qué salida cuelga `K`.
3. **Hipótesis alternativa de tipo:** si el output se registró como número/booleano, `contains` sobre un valor no-string devuelve false en silencio (patrón "Attribute Type Mismatch" de INTERCOMDOC §5) — el **mismo** patrón que causó los dos bugs de WP-05 (fechas y `"true"` como texto). Es el modo de fallo recurrente de este proyecto.
4. La hipótesis "los outputs no son legibles desde otro path" **no discrimina**: produce evidencia idéntica a un chip nulo, a un `contains` sobre vacío o a un race. Además, si el branch no estuviera en el Success Path, el selector de atributos no debería ofrecer `veredicto` agrupado bajo `beckham_plazo_f2` — y lo ofrece.

## 3-quater. Experimento que discrimina las 4 hipótesis de una vez (≈5 min)

**Paso previo, gratis:** en el editor, comprobar **de qué salida de `F` cuelgan `I. Path` y `K. Path`**.

Luego: añadir en `K. Path` un mensaje de depuración que contenga **solo los chips `veredicto` y `fecha_limite`** insertados con `{..}`; publicar; y hacer **UNA conversación real** en `https://development.app.rentax.es/procedure/P00027/form` (nunca Preview; respetar el cooldown de 2 min). Después leer la conversación por MCP:

| Resultado | Conclusión |
|---|---|
| El mensaje muestra `en_plazo` | El output SÍ existe en ese contexto ⇒ el fallo es el **operador/tipo**, o `K` no cuelga del branch |
| El mensaje sale vacío | El output no existe ahí ⇒ hipótesis 2 (o la del Collect data) |
| No hay `custom_action_started` con ejecución correlativa en n8n | La llamada nunca ocurrió |

**Regla de oro a partir de ahora: ninguna conclusión sobre este bot se acepta sin (a) conversación NO-Preview y (b) ejecución correlativa en n8n con la cabecera `x-intercom-source-dataconnector-id` rellena.**

**Evidencia adicional obtenida el 28/07 por MCP de Intercom** (timeline de la conversación `215475219542253`, que no hacía falta cruzar con los logs del DC — está todo dentro de Intercom):

```
18:42:22  custom_action_started    → beckham_plazo_f2
18:42:24  custom_action_finished   → result: "success"
18:42:25  note (cuerpo vacío)
18:42:25  "No he entendido bien la fecha, ¿me la escribes así: DD/MM/AAAA"
18:42:26  repite "¿Qué día te diste de alta...?"
```

El connector termina en `success` y un segundo después sale el mensaje del `else`.

**Hipótesis viva (2ª, ahora la principal):** el branch `I. Path` no cuelga del **Success Path** del bloque del connector en `F`, sino de la salida del Collect data — en ese contexto el output `veredicto` no existe y la condición nunca puede matchear. Sospecha adicional del usuario, sin verificar: algo específico del workspace TEST.

**Estado: PARQUEADO** por decisión del usuario (2026-07-28) para priorizar WP-06. Al retomar, empezar por verificar de qué salida del paso `F` cuelga `I. Path`, no por volver a tocar el chip.

**Nota menor pendiente:** el texto del mensaje de reintento tiene una comilla suelta y le falta el cierre de interrogación (`¿me la escribes así: DD/MM/AAAA"`).

## 4. Fix mínimo recomendado (EJECUTADO 28/07 — no resolvió, ver 3-bis)

1. Abrir `OnClick Mobility` (editor, no Preview) → path **I. Path** → condición del branch.
2. Borrar el chip actual de `veredicto` en ambas condiciones (`en_plazo` y `fuera_plazo`).
3. Reinsertarlo **exclusivamente** con el selector de atributos `{..}`, verificando que aparece bajo el encabezado `beckham_plazo_f2` (no bajo `Conversation` ni `People` — no debería haber alternativa, pero confirmar).
4. Guardar (sin publicar todavía).
5. Validar con una **Simulation** (no Preview, que usa mock) inyectando `fecha_alta_ss = 03/03/2026` → debe entrar por `G. Enviar a n8n`, no por `K`.
6. Repetir con una fecha fuera de plazo (`01/06/2025`) → debe entrar por `M.Path` → `N.Path` con `{fecha_limite}`/`{dias_pasados}` reales.
7. Si ambas simulaciones matchean correctamente, publicar (Set changes live) con OK explícito del usuario.

## 5. Hallazgo secundario (no bloqueante, anotado para más adelante)

`M. Path` (rama `fuera_plazo`) vuelve a llamar a `beckham_plazo_f2` con el mismo `fecha_alta_ss` que ya se calculó en `F` — es una segunda llamada redundante al mismo connector con el mismo input, solo para poder mostrar `{fecha_limite}`/`{dias_pasados}` en el mensaje `N`. Funciona, pero duplica latencia y ejecuciones del DC sin necesidad; se podría simplificar reutilizando los outputs de la llamada de `F` si el branch se corrige y esos outputs quedan accesibles en el mismo Success Path. No se toca ahora — el fix del branch es independiente y de mayor prioridad.

## 6. Open questions

Ninguna pendiente de decisión — causa raíz confirmada con evidencia, fix identificado y acotado a un solo cambio (reinsertar el chip). Pendiente solo de ejecución y validación por Simulation.
