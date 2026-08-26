---
id: WP-210
title: "Contrato del modo: el modo viaja como input del Data Connector, no como atributo persistido"
status: specified
size: S
depends_on: []
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-210 — Contrato del modo

> **REESCRITO EL 26/08/2026 · TRANSPORTE B, decidido por el usuario.** El modo **viaja como input
> explícito y obligatorio de cada llamada al Data Connector**. Ya **no** es un Conversation attribute
> persistido.
>
> **Por qué se cambió:** la versión anterior hacía del modo un atributo `Text` escrito con pasos `Set`,
> y todo el contrato dependía de dos incógnitas que solo la **conversación sonda (`WP-209`)** podía
> cerrar — si `Set` propaga, y si `Set` admite cadena vacía para poder resetearlo. **`WP-209` se
> declaró MUERTA el 14/08/2026** con sus nueve incógnitas sin resolver, así que ese contrato quedó
> bloqueado indefinidamente y con él **diecisiete PRDs**. El propio PRD anterior ya contemplaba esta
> salida: *«si la sonda devuelve `OTRO_PATH_FALLA`, este contrato cambia de transporte y hay que
> reescribirlo antes de construir»*. Esto es esa reescritura.
>
> **Lo que NO cambia:** el modo sigue sin ir a Airtable (llegaría tarde y desincronizado, unanimidad
> A1/A2/A3/A4) y sigue sin ir en la memoria del agente (HECHO VERIFICADO: no existe nodo de Memory).
> La convención de nombres se mantiene: sufijo `_bot` para estado conversacional, `_f2` reservado al
> cálculo.

## 1. Objetivo

Que cualquier rama del canvas sepa **qué modo tiene que declarar y cómo**, y que n8n pueda determinar
el modo de cada turno sin leer estado persistido y sin poder ser engañado desde fuera.

## 2. Alcance

### 2.1 · El transporte

**El modo es un input del Data Connector.** Cada llamada al escritor o al agente lo lleva dentro, junto
al `punto` que ya viaja hoy:

| Campo | Tipo | Obligatorio | Valores |
|---|---|:--:|---|
| `modo` | Text | **sí** | `menu` · `solicitud` · `faq_regimen` · `calculadora` · `lead_potencial` · `humano` |
| `punto` | Text | sí | la whitelist cerrada de `WP-206`, sin cambios |

**Diferencia con la versión anterior, y es la que importa:** antes `menu` era *implícito* y se
representaba con el atributo vacío. **Ahora `menu` es un valor explícito como los demás.** No hay
estado vacío, no hay «vacío significa menú», y por tanto **no hay nada que resetear**.

### 2.2 · Quién declara el modo en cada punto

Esto **no es una nota, es una tabla de comprobación**: un punto que no pase el modo manda un turno sin
modo, `Resolver_Modo` corta, y el usuario se queda sin respuesta. Se audita punto por punto.

| Punto del canvas | `modo` que declara | `punto` |
|---|---|---|
| `A` bienvenida → menú | `menu` | *(no persiste)* |
| `B` filtro F1 → descarte | `solicitud` | `descarte_residencia` |
| `E` filtro F3 → sin alta | `lead_potencial` | `lead` |
| `F` / `DC1` fecha de alta | `solicitud` | *(cálculo F2)* |
| `I` → cualifica | `solicitud` | `cualifica` |
| `I` → fuera de plazo | `solicitud` | `descarte_plazo` |
| menú → calculadora | `calculadora` | *(no escribe expediente)* |
| menú / FAQ → preguntas | `faq_regimen` | `faq_entrada` |
| FAQ → autodescarte | `faq_regimen` | `autodescarte_declarado` |
| cualquier rama → humano | `humano` | *(no escribe expediente)* |

### 2.3 · Los atributos que SÍ siguen existiendo

El modo sale de la lista, pero estos cinco siguen siendo Conversation attributes de tipo **Text**,
porque son **contadores y acarreos entre turnos**, no la fuente de verdad de nada:

`corte_contexto_bot` · `faq_resumen_bot` · `faq_turnos_bot` · `intentos_fecha_bot` · `corr_id_bot`

`modo_bot` **desaparece del contrato** salvo que se decida la variante híbrida de §2.5.

### 2.4 · Invariantes

1. **Ninguna llamada escribe `Descarte` ni ningún `*_f2` como parte de una transición de modo.**
2. **El fail-closed nunca se persiste.** Si el modo no llega, `Resolver_Modo` corta el turno y avisa;
   no se guarda un modo inventado en ninguna parte.
3. **El modo no viaja en el body del webhook público.** Va como input del Data Connector, que es el
   canal del canvas. Un tercero que golpee el webhook no puede declarar modo: cae en fail-closed.
4. **`menu` es un valor, no una ausencia.**

### 2.5 · La reentrada · DECISIÓN ABIERTA (`T081`)

El transporte B tiene un coste que la versión anterior no tenía: **si el modo no se persiste, un
usuario que vuelve mañana no tiene modo**. `WP-227` está escrito para leer `modo_bot` y reencaminar, y
con B no habría nada que leer.

| | Variante | Consecuencia |
|---|---|---|
| **B pura** *(recomendada)* | La reentrada **siempre cae al menú** | El usuario elige otra vez. `WP-212` se cierra, `WP-227` se reduce a la mitad y desaparece el atributo. El propio `WP-227` ya dice «`modo_bot` vacío o caducado → menú»: con B estaría siempre vacío |
| **B híbrida** | `modo_bot` se persiste **solo para la reentrada**, nunca como fuente de verdad del turno | Recuerda por dónde iba, a cambio de mantener el atributo y su ciclo de vida — y de volver a necesitar saber si `Set` puede vaciarlo |

**Hasta que esto se decida, `WP-227` no se construye.** El resto de este contrato no depende de ello.

## 3. Dependencias

**Ninguna.** Ese es el punto de la reescritura: `depends_on` pasa de `[WP-209]` a `[]`.

## 4. Entregables

1. **La tabla de §2.2 firmada**, con una fila por punto del canvas y ni un punto sin modo declarado.
2. Los **cinco** atributos de §2.3 creados en Intercom, tipo Text. *(`modo_bot` solo si se elige la
   variante híbrida.)*
3. El contrato del input `modo` publicado en el PRD maestro, junto al de `punto`.
4. La convención de nombres `_bot` / `_f2` en el PRD maestro.

## 5. Verificación

- **Auditoría de cobertura:** se recorre el canvas punto por punto contra la tabla de §2.2 y **cada
  punto que llama a un Data Connector declara un modo**. Un solo punto sin modo suspende.
- **Prueba negativa, la que de verdad importa:** una llamada al webhook **sin** `modo` tiene que
  devolver fail-closed y **no escribir nada**. Se comprueba con un `curl` y leyendo la fila después:
  si la fila cambió, suspende.
- **Prueba de falsificación:** una llamada con un `modo` que no está en la lista de §2.1 se rechaza
  igual que un `punto` fuera de whitelist — 400 y `schema_error`, sin inventar valores.
- `grep` sobre la tabla: cero transiciones que escriban `Descarte` o un `*_f2`.
- Los cinco atributos existen y son Text.

## 6. Riesgo

**El riesgo se ha movido de sitio, no ha desaparecido.** Antes el riesgo era escribir el contrato sobre
una incógnita de Intercom. Ahora es **de cobertura**: el contrato es válido, pero se rompe si alguien
añade una rama al canvas y se olvida de pasar el modo. Y ese fallo es silencioso para quien construye
—la rama funciona— y ruidoso para el usuario, que se queda sin respuesta.

Mitigación: la tabla de §2.2 es un **entregable firmado**, no documentación; la auditoría de cobertura
es parte de la verificación; y `Resolver_Modo` cuenta los fail-closed y los manda al `errorWorkflow`
(`WP-211`, `WP-231`), así que un punto olvidado aparece como métrica y no hay que descubrirlo leyendo
conversaciones.

## 7. Rollback

Documental: se revierte el fichero. Los cinco atributos no se borran — son inertes si nadie los
escribe. Y como el modo ya no se persiste, **no hay estado que limpiar** en las conversaciones vivas:
ese es el otro beneficio del transporte B.
