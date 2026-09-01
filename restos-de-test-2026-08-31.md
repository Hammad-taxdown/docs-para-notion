# Restos del workspace de TEST en n8n · auditoría del 31/08/2026

> Auditados los **once** workflows (los 8 de siempre + los 3 nuevos), nodo a nodo, con `jq` sobre los
> exports. **Solo lectura: cero escrituras.** Siete restos reales, cada uno verificado verbatim en el
> borrador y en el publicado. El primer pase miró solo `beckham_bot`; el verificador encontró tres más.

## Lo primero, porque cambia la expectativa

**La credencial `intercomApi` la usan SOLO DOS nodos de los 66** de `beckham_bot`:
`Traer_Conversacion_intercom1` y `Cerrar_Conversacion`. Cambiar el token de la credencial arregla
**esos dos y nada más**.

**Los cuatro callbacks NO llevan credencial** (`Callback_Intercom`, `Callback_Intercom_FAQ`, `FAQ1`,
`FAQ2`): se autentican con el token que va **dentro de la URL**. Por eso el cambio de credencial no
los toca.

---

## 🔴 ROMPEN · fallan con error visible

| # | Workflow / nodo | Campo | Ahora | Nuevo |
|---|---|---|---|---|
| 1 | `beckham_bot` / `Callback_Intercom` | URL | `…/trigger_step/`**`q3bhdtoi_2af9679b-84e9-4911-8466-fd10cf269015`**`/…` | el token del canvas de PRODUCCIÓN (empieza por `s1hap599_`) |
| 2 | `BECKHAM_escalar_humano` / `Team de Ops` | `team_id_ops` | **cadena vacía** | **`6628493`** |
| 3 | `BECKHAM_escalar_humano` / `Team de Ops` | `admin_id_bot` | `4418209` | el admin del bot en `s1hap599` — DESCONOCIDO |

**El 1 es el peor: es la única vía por la que el bot publica su respuesta** en la rama principal. Con
el token del workspace viejo, el bot **no puede hablar**. `retryOnFail=true` y sin `onError`, así que
la ejecución acaba en rojo y dispara `beckham_alertas` — ruidoso, pero el cliente no recibe nada.

**Y hay un arreglo mejor que copiar el token, que además lo cierra para siempre:** el sidecar del FAQ
ya lo hace bien — sus tres callbacks leen el token de
`$('Preparar_Prompt_FAQ').first().json.callback_token`, que sale de `body.callback_token`. Si se añade
`callback_token` al Body del Data Connector del canvas de producción y aquí se pone la misma
expresión, **este resto no vuelve a existir en ningún workspace**. Medido: `body.callback_token`
aparece exactamente una vez en el workflow, y es la del FAQ; `Preparar_Prompt` lee
`$('Webhook1').first().json.body` y nunca `callback_token`.

## 🟡 SILENCIOSOS · no fallan, hacen algo inútil

| # | Workflow / nodo | Campo | Qué pasa |
|---|---|---|---|
| 4 | `beckham_bot` / `Cerrar_Conversacion` | `jsonBody` → `admin_id:"4418209"` | Intercom rechaza un `admin_id` que no es del workspace autenticado, **y el nodo tiene `onError: continueRegularOutput`: se traga el error**. La conversación **no se cierra nunca**, no hay ejecución roja y no salta alerta. Efecto de rebote: el Messenger reanuda el hilo abierto — el mecanismo que ya rompió el D0 del idioma |
| 5 | `beckham_alertas` / `Slack_Aviso` | `parameters.text` (expresión) | el enlace es `app.intercom.com/a/apps/`**`q3bhdtoi`**`/conversations/…`. Los cinco `Avisar_*` de `beckham_bot` pasan `conversation_id`, así que **ese enlace sale en toda alerta de negocio** y lleva al workspace viejo. Un solo token que cambiar |

## 🟠 DE ESQUEMA, no de credencial · el que puede doler de verdad

| # | Workflow / nodo | Qué |
|---|---|---|
| 6 | `beckham_bot` / `Preparar_Prompt` (líneas 125-127) y `guardar_datos_cliente` | Leen tres **custom attributes de Intercom**: **`fecha_alta_ss_f2`**, **`veredicto_f2`**, **`fecha_limite_f2`**. No son ids ni tokens: son **esquema del workspace**, y viven en la configuración de `q3bhdtoi`. Si en `s1hap599` alguno no existe o se llama distinto, llega `undefined`, `dato()`/`fechaEs()` devuelven vacío y el bloque «DATOS QUE YA CONOCEMOS» **pierde la fecha de alta, el veredicto y la fecha límite SIN FALLAR** |

**El síntoma es el peor del proyecto: el bot vuelve a preguntar lo que el cliente ya contó.** Y por
esta vía, que es la determinista, no por la tool.

⚠️ **`fecha_alta_ss_f2` no estaba en la lista de atributos a crear.** La lista que se dio el 31/08
llevaba `veredicto_f2`, `fecha_limite_f2` y `dias_pasados_f2`. **Falta el cuarto**, y es de donde sale
la fecha de alta hacia el expediente: `guardar_datos_cliente` manda `fecha_alta_ss` desde
`custom_attributes?.fecha_alta_ss_f2 || ''`. Si no existe, se manda cadena vacía, el upsert devuelve
`ok:true` **sin el dato**, y el informe imprime «Por confirmar» para siempre y sin ruido.

## ⚪ MENORES

| # | Qué |
|---|---|
| 7 | Tres nodos de Airtable con el `columns.schema` del `Status` **cacheado con las 12 opciones viejas**: `beckham_generar_030` (`Limpiar Regenerar030 y Error030`, `Escribir el motivo en Error030`) y `beckham_informe_mobility` (`Escribir el motivo en ErrorInforme`). Hoy inofensivo porque los valores que escriben existen en las dos listas, pero es el **sexto sitio** rancio |
| 8 | `beckham_informe_mobility_v2` / `Copiar la plantilla`: sigue sin `sameFolder: true` |

## Dos negativos que valen

- **`beckham_f2_plazo.`, `beckham_analizar_documento` y `beckham_adjuntos_huerfanos` están limpios**
  de Intercom, y por construcción: ninguno le habla.
- **Los tres generadores también**: cero apariciones de `q3bhdtoi`, `s1hap599`, `trigger_step`,
  `admin_id`, `team_id`, `4418209` ni `11098265` en sus 26 nodos.

## Una trampa desactivada, para que nadie la «arregle»

El `11098265` **sigue apareciendo** en `BECKHAM_escalar_humano`, pero dentro de
`const TEAM_DE_OTRO_WORKSPACE = '11098265'` en el `jsCode` de `Guarda de la escalada`. **Es una lista
negra, no un resto.** Cambiarlo por `6628493` desactivaría la guarda que impide escalar al team
equivocado. **No se toca.**

---

# CÓMO SE HACE · los enlaces y de dónde sale cada dato

## Los enlaces directos a cada workflow de n8n

| Workflow | Enlace |
|---|---|
| `beckham_bot` | https://es.synapse.rentax.es/workflow/nhOwpiGxikeU5DLR |
| `beckham_alertas` | https://es.synapse.rentax.es/workflow/BJfExmwu1fI1aPpY |
| `BECKHAM_escalar_humano` | https://es.synapse.rentax.es/workflow/m8GmgA2ot05foDBd |
| `BECKHAM_registrar_optout` | https://es.synapse.rentax.es/workflow/N6aIm7mY4J7zvhmH |
| `BECKHAM_upsert_expediente` | https://es.synapse.rentax.es/workflow/1BaSgHfQzuzC9sw1 |
| `beckham_generar_030` | https://es.synapse.rentax.es/workflow/OoJ2l7PmxSHLxXA4 |
| `beckham_informe_mobility` | https://es.synapse.rentax.es/workflow/Us5sFgXD9qVxJvxO |
| `beckham_informe_mobility_v2` | https://es.synapse.rentax.es/workflow/snoDqB063jMSgzUq |

Dentro de un workflow, el nodo se encuentra con **`Cmd+F`** y su nombre. `beckham_bot` tiene 66 nodos
y algunos están muy abajo en el lienzo (`Leer_Expediente_Para_Prompt` está en la posición `[64, 3088]`).

## Los enlaces de Intercom que hacen falta

| Para qué | Enlace |
|---|---|
| Los atributos de conversación (punto 6) | https://app.intercom.com/a/apps/s1hap599/settings/data/conversation-data |
| Los teammates, para el `admin_id` | https://app.intercom.com/a/apps/s1hap599/settings/workspace/teammates |
| Los teams, para confirmar el `6628493` | https://app.intercom.com/a/apps/s1hap599/settings/workspace/teams |
| Los Data Connectors | https://app.intercom.com/a/apps/s1hap599/settings/app-settings/data-connectors |
| El Custom Bot «Mobility Bot (OnClick)» | https://app.intercom.com/a/apps/s1hap599/automation/workflows/68617004 |

## De dónde sale cada dato que hoy es DESCONOCIDO

### 1 · El `admin_id` del bot en producción

Es el admin **en cuyo nombre** el bot cierra conversaciones. Dos formas de sacarlo:

**Por la UI:** `Settings` → `Workspace` → `Teammates` → abre el teammate que corresponda (el bot, la
app, o la persona que quieras que figure como quien cierra) → **el id sale en la URL**, al final:
`…/teammates/`**`1234567`**.

**Por la API**, si prefieres verlos todos de golpe (necesitas el token de producción):
```bash
curl -s https://api.intercom.io/admins \
  -H "Authorization: Bearer TU_TOKEN_DE_PRODUCCION" \
  -H "Intercom-Version: 2.11" | python3 -m json.tool | grep -E '"id"|"name"|"email"'
```

**Cuidado con no confundirlo con el team.** El `6628493` que dio el usuario es un **team** (Ops) y va
en `BECKHAM_escalar_humano`. Para `Cerrar_Conversacion` hace falta un **admin**, que es otra cosa.

### 2 · El token del callback del canvas de producción

**La opción rápida:** en el Custom Bot, abre el paso que llama al Data Connector con
`wait_for_callback` (el que pasa al agente). Ahí Intercom muestra el **token del trigger step**. Es un
`app_id_uuid`, así que empezará por **`s1hap599_`** seguido de un uuid distinto del que hay soldado hoy.

**La opción buena, y es la que recomiendo**, porque cierra el problema para siempre en vez de
cambiarlo de sitio:

1. En el Data Connector del canvas de producción, añade al `Body` una clave más:
   `"callback_token": "«el token de ese paso»"`
2. En `beckham_bot` → `Callback_Intercom` → campo URL, sustituye el token soldado por la expresión:
   `https://api.intercom.io/hooks/workflows/trigger_step/{{ $('Webhook1').first().json.body.callback_token }}/{{ $('Webhook1').first().json.body.conversation_id }}`

Con eso el token deja de vivir dentro de n8n y **el mismo workflow sirve en cualquier workspace**. Es
exactamente lo que ya hace el sidecar del FAQ, y por eso el FAQ no tenía este problema.

### 3 · Los cuatro atributos de conversación

`Settings` → `Data` → **`Conversation data`**. Comprueba que existen, **con el nombre exacto**:

```
veredicto_f2        fecha_limite_f2        dias_pasados_f2        fecha_alta_ss_f2
```

Los cuatro tipo **Text**. Si alguno falta o se llama distinto, el bot pierde ese dato **sin fallar**.

### 4 · El enlace de `Slack_Aviso`

`beckham_alertas` → nodo `Slack_Aviso` → campo **Message Text** (es una expresión). Dentro hay:
`https://app.intercom.com/a/apps/q3bhdtoi/conversations/`. Cambia **solo** `q3bhdtoi` por `s1hap599`.

### 5 · La credencial de Intercom

En n8n, arriba a la derecha (el menú del usuario) → **`Credentials`** → busca la de Intercom → pega el
**Access Token de producción** → `Save`. Un solo sitio, y los dos nodos que la usan cambian de golpe.

El token de producción se saca de Intercom: `Settings` → `Developer Hub` → tu app → `Authentication`
→ el Access Token del workspace `s1hap599`.

## El orden, y por qué importa

1. **Los atributos primero** (punto 3). Son de solo mirar, y si falta alguno lo demás no arregla nada:
   el bot seguiría preguntando lo que el cliente ya contó.
2. **El `admin_id` y el token del callback** (puntos 1 y 2), que son los dos datos que hay que buscar.
3. **La credencial** (punto 5). Al cambiarla, `Cerrar_Conversacion` empieza a fallar contra la API
   hasta que su `admin_id` sea el bueno — pero **falla en silencio** (`onError:
   continueRegularOutput`), así que no verás nada raro: solo conversaciones que no se cierran.
4. **`Callback_Intercom`** (punto 2). Hasta que esté, **el bot no puede hablar** en producción por la
   rama principal. El FAQ sí, porque su callback ya es dinámico.
5. **`escalar_humano`** (`6628493` + el `admin_id`) y **`Slack_Aviso`**, que no bloquean nada.
