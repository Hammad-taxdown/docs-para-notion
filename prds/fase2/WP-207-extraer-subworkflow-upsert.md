---
id: WP-207
title: "Prerrequisito P6: extraer BECKHAM_upsert_expediente a subworkflow propio"
status: specified
size: M
depends_on: [WP-201, WP-205, WP-206]
milestone: "Fase 2 conversacional — Prerrequisitos"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-207 — P6: `BECKHAM_upsert_expediente` como subworkflow

> Tres beneficios concretos (DECISIÓN APROBADA, síntesis §2 P6): vuelve el upsert **editable por
> MCP** (hoy imposible por las credenciales del workflow monolítico), permite que las tools sean
> `Call n8n Workflow Tool` — que **no pasan por HTTP urlencoded**, esquivando la clase de bug de
> WP-201 — y evita la reentrada del workflow sobre sí mismo.

> **26/08/2026 · EL ENTREGABLE 3 ESTÁ HECHO; LOS OTROS DOS ESPERAN AL CABLEADO.**
>
> **Hecho:** `docs/contratos/upsert_expediente.v1.json` — JSON Schema de las **46 claves de entrada**,
> **extraído del nodo vivo** `Validar y Normalizar` (73.081 car., 1.478 líneas) leyendo sus `body.X`,
> no escrito de memoria. Con su puerta `docs/test-contrato-upsert.js` — **25 comprobaciones, la
> undécima puerta** — que compara schema contra nodo **en los dos sentidos** y se probó rompiéndola a
> propósito dos veces: quitando una clave del contrato (caza `nif`) y relajando la whitelist de
> `Descarte` (caza la opción inventada). Sin esa puerta, el contrato sería otro documento mío citado
> como fuente, que es la trampa documentada del proyecto.
>
> **Tres cosas que salieron de extraerlo, y ninguna estaba escrita:**
> 1. **Los dos caminos de entrada están separados, y ahora está contado:** la tool
>    `guardar_datos_cliente` declara **40** parámetros y el validador lee **46**. Las 4 de diferencia
>    —`alta_ss`, `lead_potencial`, `fecha_prevista_alta`, `fecha_limite_plazo`— vienen del **canvas**,
>    porque salen del cálculo F2 y de los filtros, no de la conversación. La tool **no declara `punto`
>    ni `Descarte`**: el LLM no puede derivar campos ni descartar a nadie. Eso ya es una comprobación
>    de la puerta, no una observación.
> 2. **`'Menos de 55 salario'` sigue existiendo** como opción del `singleSelect` `fldcEq4ts2Vyqzg5b`
>    (verificado por MCP hoy: las 4 opciones coinciden exactas con la whitelist del código). Fui a
>    buscarla creyendo que el renombrado del 19/08 la había desincronizado — **no: ese renombrado fue
>    en `SenalesComplejidad`, otro campo.** Lo que sí es cierto es que es **residuo inerte**: ningún
>    `punto` la escribe y la tool no declara el parámetro, así que **no hay camino** para descartar por
>    salario, que es la decisión cerrada. No se borra —cosmética con riesgo—, pero la puerta vigila que
>    el camino no nazca.
> 3. **El `resultado`/`dropped[]` que pide §2 no existe todavía.** Hoy la respuesta usa `error` (los
>    cuatro rechazos) y `descartados`. Renombrarlos toca `Respond OK`, `Respond Error`,
>    `¿Fechas descartadas?`, `Avisar_Fecha_Invalida` **y los dos `contract-test`**: es el contrato de
>    **salida** y va con el cableado, no antes.
>
> **Por qué los entregables 1 y 2 no se hacen hoy:** el 2 es *«`beckham_bot` llamando al subworkflow»*,
> y por MCP eso significa **reenviar el workflow entero** — 55 nodos con dos de código de 198 y 241 KB.
> Es el mismo riesgo que hoy me hizo descartar hacer por MCP algo tan pequeño como rellenar la
> `description`. El 1 sin el 2 deja **dos escritores** sobre `Empleados`, que es exactamente el error
> del informe v1/v2 documentado en `CLAUDE.md`. Van en el mismo movimiento o no van.

> **26/08 · Y EL CABLEADO YA ESTÁ ESCRITO, para pegar con Cmd+A.** Reconsiderando lo de arriba: lo que
> no se puede hacer por MCP es *que yo lo publique*, no *entregarlo listo*.
> `docs/nodo-validar-normalizar-COMPLETO.js` — **76.156 car.** (el vivo: 73.081) — se monta con
> `bash docs/montar-nodo-validar.sh` **desde el código vivo del export**, por anclas de texto: si un
> ancla desaparece porque alguien tocó el nodo, **aborta** en vez de generar un COMPLETO mal montado.
> Su puerta **ejecuta el nodo** con un `$input` de mentira — **35 comprobaciones**, mitad no-regresión
> (los 4 rechazos, `DERIVA`, el `T12:00:00.000Z`, el domicilio atómico, `AplicaBeckham`) y mitad lo
> nuevo. Es el paso 4 de `docs/pasos.sh`.

## 1. Objetivo

Un único escritor de `Empleados`, invocable como subworkflow, con contrato versionado y sin pasar por
HTTP para las llamadas internas.

## 2. Alcance

**In:**
- Subworkflow `BECKHAM_upsert_expediente` con `description` no vacía (dueño + PRD dentro).
- Entrada por `workflowInputs.defineBelow`: `user_id`, `intercom_conversation_id`, `punto`, `modo`,
  `corr_id`, `idem_key` + los campos de expediente.
- Contrato en `docs/contratos/upsert_expediente.v1.json` (JSON Schema) y versión en el path (`/v1`).
- El webhook público sigue existiendo para el DC, y **delega** en el subworkflow: una sola
  implementación de la lógica.
- Enum cerrado de `resultado` y campo `dropped[]` en la respuesta (ningún `ok:true` que signifique
  "no hice nada").

**Out:**
- Guarda de `modo` en el borde de las tools → WP-219.
- Semántica de reset por `punto` → WP-226.

## 3. Dependencias

WP-201, WP-205, WP-206 (se extrae ya saneado, no se extrae y luego se arregla).

## 4. Entregables

1. Subworkflow creado, activo, con `errorWorkflow` enchufado.
2. `beckham_bot` llamando al subworkflow en lugar de escribir directamente.
3. JSON Schema del contrato en el repo.

## 5. Verificación

- `contract-test.sh` (6 curls: 4 puntos + `lead` + `faq_entrada`, incluido el caso urlencoded y un
  `punto` desconocido que debe dar 400) **verde** contra el nuevo camino.
- Una llamada directa al subworkflow por `execute_workflow` con un body inválido devuelve
  `400 {ok:false, resultado:"schema_error", campos:[...]}`.
- MCP puede leer y actualizar el subworkflow (comprobado con `get_workflow_details`).

## 6. Riesgo

Medio-alto: es el WP que toca la ruta de escritura completa. Riesgo de quedarse con **dos**
implementaciones (la vieja en `beckham_bot` y la nueva) → habría dos escritores, que es exactamente
lo que el diseño prohíbe. Mitigación: los nodos viejos quedan `disabled`, no borrados, y el gate
exige que el `contract-test.sh` pase por el camino nuevo.

## 7. Rollback

Rehabilitar los nodos `disabled` de `beckham_bot` y despublicar el subworkflow. `versionId` anotado
de los dos workflows.
