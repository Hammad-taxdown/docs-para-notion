# INTERCOMDOC — Documentación de Intercom para el proyecto Beckham

> Fuente de verdad sobre cómo funciona Intercom en este proyecto. Aportada por el usuario.
> Al retomar el trabajo: leer PRIMERO la Parte A (documentación) y solo después la Parte B
> (preguntas que siguen abiertas y que esta documentación NO responde).
>
> **Revisión del 2026-08-02:** se ha purgado la información que la práctica demostró falsa.
> Dos correcciones que mandan sobre cualquier otra cosa de este fichero:
> 1. **El bug de F3 está ARREGLADO desde el 28/07** vía `Object mapping` (pestaña `2 Data` del DC)
>    → el branch lee `veredicto_f2` bajo el encabezado `Conversation`. La causa raíz real era que
>    **los outputs de un Data Connector son locales al path donde vive el connector**. La antigua
>    Parte D (3 hipótesis) queda eliminada: todas murieron.
> 2. **Las "Simulations" son de Fin, NO del editor de Custom Bots.** No existe ruta de UI para
>    simular `OnClick Mobility`. Lo único que valida un Custom Bot es publicar y usar el
>    **Messenger real** como cliente, con verificación cruzada por MCP.

---

# PARTE A — Manual Técnico de Arquitectura y Depuración de Workflows de Intercom

Este documento detalla la infraestructura de automatización de Intercom, analizando la lógica de ejecución de Workflows, la integración técnica de Data Connectors y los protocolos de diagnóstico para entornos de nivel empresarial.

## 1. Arquitectura de Workflows y Jerarquía de Ejecución

### Análisis del Motor de Automatización

El motor de Workflows de Intercom opera como un entorno de ejecución lógica basado en nodos. La arquitectura distingue dos tipos de flujos según su visibilidad y propósito:

* **Customer-facing workflows:** Automatizaciones interactivas (mensajes, botones de respuesta rápida) que mantienen el estado de la conversación. Solo puede ejecutarse uno a la vez; el flujo retiene su "slot" de ejecución incluso mientras espera el input del usuario.
* **Background workflows:** Operaciones asíncronas que se ejecutan silenciosamente para la gestión de metadatos (etiquetado de conversaciones, enrutamiento mediante lógica booleana o cierre de hilos). A diferencia de los interactivos, múltiples background workflows pueden ejecutarse simultáneamente sobre el mismo evento.

### Priorización y Resolución de Conflictos

El sistema procesa la lógica siguiendo una jerarquía Top-to-Bottom en la lista de configuración del workspace. Los Workflows poseen prioridad de evaluación ante el motor de intenciones de Fin: Intercom evalúa los triggers de los Workflows antes de que Fin determine si debe ejecutar una Procedure.

### Interferencia de Fin Simple Deploy

La configuración de "Simple Deploy" actúa como un override global. Si está activa para la misma audiencia, Fin responderá directamente, bloqueando el disparo de Workflows personalizados. Protocolo de diagnóstico para solapamientos:

1. **Validación de Audiencia:** Verificar si existe un mismatch entre Lead vs. User. Un error común es configurar el Workflow para "Users" mientras el visitante es categorizado como "Lead".
2. **Exclusividad Lógica:** Ajustar la lógica booleana de las reglas de audiencia para garantizar la exclusividad mutua entre Simple Deploy y el Workflow.
3. **Habilitación de Agente AI:** Si deben coexistir, el Workflow debe integrar explícitamente el nodo "Let Fin handle" para ceder el control al agente AI tras la recolección de datos inicial.

### Triggers y Snapshots de Perfil

Los disparadores se segmentan por estado (First message, Any message, Reopened). Es crítico notar que los triggers customer-facing poseen un **cooldown de 2 minutos por cliente**; si se inicia una nueva conversación dentro de este margen, el trigger no se reactivará. Durante la transición de "Visitor" a "Lead", el motor utiliza un **snapshot estático del perfil** capturado al momento del disparo, manteniendo esa referencia de datos hasta la conclusión del flujo.

## 2. Especificaciones Técnicas de Data Connectors

Para crear o modificar conectores, el arquitecto debe poseer los permisos de "Can access developer hub" y "Can manage workspace data".

### Gestión de Payloads y Protocolos

Los conectores soportan nativamente payloads JSON. En caso de recibir respuestas XML, la infraestructura realiza una conversión automática a JSON. El tiempo de retención de logs es de 7 días (estándar) o 14 días (extended logs).

### Headers y Métodos HTTP

| Método | Propósito | Payload |
|---|---|---|
| GET | Recuperación de recursos. | No permitido. |
| POST | Creación/Envío de datos. | Requerido (application/json). |
| PUT | Reemplazo total de recurso. | Requerido (application/json). |
| PATCH | Actualización parcial. | Requerido (application/json). |
| DELETE | Eliminación de recurso. | Opcional. |

**Advertencia de Seguridad:** Todo request con cuerpo JSON exige el header `Content-Type: application/json`. Sin este, el endpoint receptor fallará al parsear los campos, resultando en rechazos de validación de esquema.

### Restricción y Transformación de Datos (Python Sandbox)

Se utiliza un entorno de ejecución limitado de Python para transformar respuestas y mitigar alucinaciones de la IA por exceso de tokens (payloads >1000 registros). Módulos permitidos: `math`, `json`, `datetime`, `datetime.timezone`, `re`, `decimal`, `random`, `time`.

```python
# Ejemplo de transformación: Filtrado de pedidos activos y formateo de fecha
import json
from datetime import datetime, timezone

def transform(response):
    data = json.loads(response)
    # Filtrar solo pedidos con estado 'active'
    active_orders = [
        {
            "id": order["external_id"],
            "status": order["status"],
            "date": datetime.fromisoformat(order["created_at"]).replace(tzinfo=timezone.utc).isoformat()
        }
        for order in data["orders"] if order["status"] == "active"
    ]
    return {"filtered_orders": active_orders[:5]} # Limitar a 5 para optimizar el contexto de Fin
```

### Límites de Latencia y Timeout

* Default: 15 segundos.
* Fin Procedures: 30 segundos.

**Limitación MCP/SSE:** Fin no puede procesar de manera confiable flujos de Server-Sent Events (SSE). Si un servidor MCP envía dos respuestas distintas en un mismo stream, Fin solo podrá utilizar la última.

## 3. Implementación de Custom Objects y Referencias en el Inbox

### Modelado y Mapeo

Los Custom Objects (Orders, Subscriptions) requieren un esquema definido con un atributo `external_id` obligatorio. El mapeo se realiza vinculando campos de la respuesta API a propiedades del objeto mediante atributos de referencia.

### Interfaz del Agente e Interactividad

* **Sidebar del Inbox:** Los objetos vinculados aparecen en "User Data" (perfil) y "Conversation Details" (contexto del hilo actual).
* **Interactive Buttons:** El Messenger renderiza hasta 25 botones dinámicos basados en objetos. El ordenamiento es determinista, basado en el atributo `external_updated_at` (descendente).

## 4. Protocolos de Seguridad Avanzada

* **Autenticación JWT:** Obligatoria para usuarios registrados para prevenir la suplantación de identidad mediante manipulación de `user_id` o `email` en el cliente.
* **Email OTP (One-Time Passcode):** Protocolo para visitantes o canales no autenticados. El conector se bloquea hasta que el usuario valida el código enviado a su correo.
* **Control de Mutabilidad:** Se debe activar "Prevent updates via the Messenger" en Settings > Data > People para atributos sensibles, evitando inyecciones de datos desde la consola del navegador.

## 5. Guía de Troubleshooting y Diagnóstico de Errores

### Análisis de Códigos de Estado HTTP

* **400 (Bad Request):** Indica sintaxis JSON malformada o parámetros inválidos.

```json
{
  "error": "invalid_payload",
  "message": "The required field 'customer_id' is missing or null."
}
```

* **401 (Unauthorized):** Token expirado o inválido. Mecánica interna: Intercom realiza un reintento automático. Verifique la pestaña "Logs" para confirmar si se intentó un refresh del token.
* **404 (Not Found / URL Malformada):** Generalmente causado por el **"Pill Conversion Error"**. Si el administrador escribe manualmente `{{user.id}}`, el editor lo convierte visualmente en un "pill", pero al no ser seleccionado desde el Attribute Inserter, el sistema lo trata como texto plano que resuelve a `null`, rompiendo la estructura de la URL.
  * **Importante:** Diferenciar entre `user.id` (Contact ID interno de Intercom) y `user_id` (External ID definido por la empresa).
* **Attribute Type Mismatch:** Ocurre cuando un procedimiento intenta guardar un string en un atributo definido como tipo `list` (o viceversa). Esto provoca **fallos de persistencia silenciosos** en el Inbox.

### Depuración de Lógica y Latencia

Utilice "Fin's thoughts" en el debugger para trazar la interpretación de intenciones.

* **Turn Limitation:** Fin solo permite una llamada a conector por turno. No es posible encadenar múltiples APIs en una sola respuesta sin interacción del usuario.

### Validación mediante Simulaciones

A diferencia de "Preview" (que puede exponer mensajes a usuarios reales si el flujo está live), las **Simulations** ejecutan la lógica en el backend. Son la herramienta definitiva para probar ramas de fallo (inyectando JSON de error) sin afectar métricas de producción.

> ⛔ **NO APLICA A ESTE PROYECTO (verificado el 28/07, corregido por el usuario).** Las Simulations
> son una herramienta de **Fin**, no del editor de **Custom Bots**. No hay ruta de UI para simular
> `OnClick Mobility` ni `reuse_mobility`. **No volver a recomendar "validar con Simulation" para
> estos flujos.** El único método de validación válido para un Custom Bot es:
> 1. Publicar (`Set changes live`).
> 2. Escribir desde el **Messenger real como cliente** — nunca desde el Inbox, que es un mensaje de
>    admin, no dispara "when customer sends any message" y además asigna la conversación.
> 3. Verificar por MCP: conversación **no-Preview** (`custom_attributes["Workflow: Preview"] != true`)
>    **+** ejecución correlativa en n8n. Ambas cosas, o la conclusión no vale.
>
> Preview sigue estando prohibido por otro motivo distinto: usa **respuestas mock** de los Data
> Connectors y ya ha invalidado dos diagnósticos (23/07 y 28/07).

---

# PARTE B — Qué resuelve esta documentación y qué sigue abierto

> ⚠️ **Las "preguntas abiertas" de esta Parte B están RESUELTAS en la Parte C** (respuestas
> obtenidas con NotebookLM sobre la documentación de Intercom, 27/07). Se conserva la lista
> como registro de qué se preguntó y por qué.

## Lo que esta documentación YA aclara (aplicable a nuestros problemas)

1. **"Pill Conversion Error"** — si un token se escribe a mano en lugar de insertarse desde el
   Attribute Inserter, el editor lo pinta como pill pero el sistema lo trata como texto plano que
   resuelve a `null`. Sigue siendo cierto como mecanismo general de Intercom y por eso se conserva.
   ⛔ **Pero NO era la causa del bug de F3, y esa hipótesis está MUERTA desde el 28/07.** Lo que
   mató a todas las hipótesis a la vez fue cambiar la condición a `has any value` y ver que
   **seguía fallando**: no había *nada* que leer, así que daba igual el chip, el valor, el tipo o
   el operador. La causa real está en el punto 1 del encabezado de este fichero.
   **Técnica a reutilizar: preguntar "¿hay algo?" antes de "¿es correcto?".**
2. **`user.id` ≠ `user_id`** — `user.id` es el Contact ID interno de Intercom; `user_id` es el
   External ID de la empresa. Coincide con lo que confirmaron los ingenieros: nuestro `UserId`
   (clave de negocio del expediente en Airtable) es el External ID de TaxDown.
3. ~~**Simulations en lugar de Preview.**~~ ⛔ **FALSO PARA ESTE PROYECTO, no ejecutar.** Las
   Simulations son de **Fin**, no del editor de Custom Bots: no hay ruta de UI para simular
   `OnClick Mobility`. Ver el recuadro de la Parte A §5. Lo que sí queda en pie de este punto es
   la mitad negativa: **Preview no vale**, porque usa mocks de los Data Connectors.
   El método real de validación es Messenger real + verificación cruzada por MCP.
4. **Logs del Data Connector** con retención de 7 días (14 en extended): sirve para ver qué se
   envió y qué se recibió realmente en cada llamada, sin depender de las ejecuciones de n8n.
5. **`Content-Type: application/json` es obligatorio** en POST con cuerpo JSON. Confirmado que
   nuestro DC lo lleva.
6. **Timeout por defecto de 15 s.** Nuestro upsert en Airtable responde muy por debajo, sin
   riesgo.
7. **Cooldown de 2 minutos** en triggers customer-facing: a tener en cuenta al hacer pruebas
   encadenadas — si una prueba no dispara el flujo, puede ser esto y no un fallo de config.
8. **Snapshot estático del perfil** al disparar el flujo: relevante para `email` y `user_id`.
   Si el contacto era un Visitor sin datos al inicio, el flujo puede arrastrar ese snapshot
   vacío hasta el final, aunque el perfil se enriquezca después.

## Lo que esta documentación NO responde y sigue abierto

1. **Modos exactos del campo `Data source`** de un Data input y su semántica. Observado en
   pantalla: al enlazar a un atributo, Intercom bloquea el `Name` y lo deriva de este
   (`conversation.id`); con "Let Fin collect" el `Name` es libre. La documentación no cubre
   este comportamiento.
2. **Si un input enlazado a atributo puede recibir un valor distinto desde "Map action inputs"**
   en un paso de workflow, o si el enlace al atributo manda siempre.
3. ~~**Si en "Map action inputs" se pueden escribir valores literales**~~ ✅ **RESUELTO (28/07).**
   La caja de valor del paso **`Set <atributo>`** acepta **solo texto literal** y **no admite
   chips**. ⇒ Las constantes por rama (`alta_ss`, `lead_potencial`, `descarte`) se pueden fijar con
   pasos `Set …` sin depender de `Custom value`. Ojo: esto es lo contrario de lo que hacía falta
   para el otro problema (el paso `Set` **no** servía para propagar el output del connector).
4. **Qué significa `Required`** en un input usado desde un workflow (el label dice "Fin must
   collect this parameter", lo que sugiere que solo aplica a Fin).
5. **Qué hace `Fallback value`** en ejecuciones de workflow (no solo con Fin). Importa porque
   un fallback podría sobrescribir datos existentes en Airtable en las ramas donde el campo
   no aplica.
6. ~~**Cómo se referencian los outputs de un Data Connector** fuera de su path~~ ✅ **RESUELTO
   (28/07), y era la causa raíz de F3: NO son visibles fuera de su path.** Son atributos locales.
   Para sacarlos hay que promocionarlos a **Conversation attributes** con `Object mapping`. Y una
   vez son Conversation attributes, sí cruzan de path **y hasta fuera del canvas** (`Preparar_Prompt`
   los lee de `custom_attributes` por la API en cada turno). Ver la Parte D.
7. ~~**Qué ocurre con dos atributos del mismo nombre**~~ ✅ **Resuelto y además irrelevante.** El
   selector distingue el origen por encabezados (`Conversation` / `People` / nombre del Data
   Connector), y se verificó que **nunca hubo atributos duplicados**: al buscar `veredicto` salía un
   único resultado agrupado bajo `beckham_plazo_f2`.
8. **Cómo se comporta el Test de un Data Connector** con inputs enlazados a atributo.
   Observado: no son rellenables y llegan vacíos, por lo que el Test devuelve 400. Sin
   confirmar en la documentación.
9. **Por qué un atributo de tipo `date` en "Collect data" fuerza pedir la hora** (el problema
   de F2, resuelto usando un atributo de texto).

---

# PARTE C — Respuestas a las preguntas abiertas (NotebookLM sobre docs de Intercom, 27/07)

## C.1 Modos de `Data source` y semántica del `Name`

Existen **tres** modos, no dos:

| Modo | Qué hace |
|---|---|
| **Let Fin collect** | Fin lo recoge de la conversación. Requiere Name y Description para que Fin sepa cómo pedirlo. |
| **People attribute** | El valor se extrae de un atributo ya existente en el workspace. |
| **Custom value** | Un valor fijo definido por ti en la propia configuración del conector. |

La documentación no menciona explícitamente el bloqueo del campo `Name` en la UI al elegir un
atributo, pero sí confirma que el valor se extrae de un atributo existente. El bloqueo del
`Name` (observado en pantalla: `conversation.id`) es comportamiento de la UI no documentado.

## C.2 Prioridad en "Map action inputs" vs. atributo vinculado

Los inputs deben recolectarse "durante o antes del workflow". Si el input está vinculado a un
**People attribute**, el sistema intenta extraerlo automáticamente de ahí. La documentación
**no aclara si un mapeo manual en el workflow pisa al atributo vinculado**.

➡️ **Recomendación explícita de la documentación: usar "Let Fin collect" en la definición del
conector cuando el valor vaya a venir dinámicamente del workflow.**

## C.3 Valores literales por rama

La documentación sugiere **"Custom value"** para constantes, y en el editor de workflows insiste
en usar el **Attribute Inserter** en vez de escribir a mano.

⚠️ **Matiz importante para nuestro caso: "Custom value" NO nos sirve para `alta_ss`,
`lead_potencial` ni `descarte`.** Un Custom value se define a nivel de conector y es **único**,
mientras que nosotros necesitamos valores **distintos por rama** (`alta_ss` = `true` en cualifica
y `false` en lead potencial; `descarte` cambia en cada descarte). Con un solo DC, la única vía
es **"Let Fin collect" + mapear el valor en cada paso del workflow** — que además es justo lo
que recomienda C.2. Usar Custom value obligaría a crear un DC por rama, opción que ya
descartamos.

## C.4 Semántica de `Required`

Es una **condición de ejecución**: si está activado y el valor está ausente, **el conector no se
ejecuta**. Aplica a los tres modos:
- Con *Let Fin collect*: Fin debe recoger el parámetro antes de disparar el conector.
- Con *People attribute* / *Custom value*: el parámetro debe tener valor o la llamada al API no
  se realiza.

➡️ Confirma nuestra decisión: `Required` ON solo en `user_id` y `conversation.id`; OFF en el
resto, porque cada rama solo conoce algunos campos y un Required bloquearía la llamada.

## C.5 Función del `Fallback value`

Se usa cuando el valor es nulo o falta, para que el flujo continúe con un valor predecible en
lugar de fallar. La documentación lo señala como crítico en integraciones tipo Airtable "para
evitar que se sobrescriban celdas con valores nulos".

⚠️ **Matiz para nuestro caso: seguimos dejándolo VACÍO en todos los inputs.** El problema de
sobrescribir con nulos ya lo resuelve nuestro Code node en n8n, que descarta los campos vacíos y
solo escribe los presentes (verificado por curl). Poner un fallback sería contraproducente:
enviaría un valor de relleno en las ramas donde el campo no aplica y **eso sí sobrescribiría**
el dato bueno que ya estuviera en Airtable.

## C.6 Referencia a los outputs del conector

- Los resultados son visibles **inmediatamente en el "Success Path"** del workflow.
- Se usan añadiendo un mensaje y eligiendo el dato con el **selector de atributos `{..}`**.
- En Fin Procedures se referencian con la sintaxis `@nombre_del_conector`.
- **Los outputs NO aparecen como atributos de conversación en el Inbox salvo que se mapeen
  explícitamente para guardarlos.**

## C.7 Atributos con nombres duplicados

El selector de atributos **distingue el origen mediante encabezados** en el desplegable:
`Conversation`, `People`, o **el nombre del Data Connector** concreto. Así se diferencia un
atributo de app de un output del conector que se llame igual.

➡️ Es la forma de verificar, en el bug de F3, si el chip usado en el branch viene del connector
o de un atributo de app homónimo.

## C.8 Comportamiento del Test con atributos vinculados

"Test connection" valida la configuración **enviando una llamada real**. Si un parámetro se
escribe manualmente en lugar de seleccionarse con el Attribute Inserter, puede resolver a vacío
en tiempo de ejecución y provocar 400/404.

➡️ Confirma lo observado: los inputs enlazados a atributo llegan vacíos en el Test si no hay
contexto de usuario activo en el editor. **El 400 de nuestro Test no es un fallo de
configuración.**

## C.9 Atributos de tipo Date

Los atributos **Date & Time no se pueden usar en workflows**, porque no se puede validar de
forma fiable la zona horaria del cliente.

➡️ Explica y valida a posteriori la solución que aplicamos en F2 y F4: usar un **atributo de
texto** con formato `DD/MM/AAAA` y normalizar en n8n.

---

# PARTE D — ELIMINADA (el bug de F3 está arreglado desde el 28/07)

> Aquí vivía un plan de diagnóstico con 3 hipótesis ordenadas por probabilidad. **Se ha borrado el
> 2/08 porque las tres eran falsas y seguirlas rompe el arreglo que hoy funciona en producción.**
> Se deja esta lápida en lugar de quitar el apartado entero porque la memoria del proyecto y varios
> PRDs remiten a "INTERCOMDOC Parte D".

## La causa raíz real

**Los outputs de un Data Connector son atributos LOCALES del path donde vive el connector y no son
legibles desde otro path.** El connector estaba en `F` y el branch en `I. Path` → leía vacío.
No era un bug: era una regla de Intercom que no conocíamos.

## La solución, que está viva en producción — no deshacerla

**`Object mapping`**, al final de la pestaña **`2 Data`** del Data Connector
(`Intercom object = Conversation`, `API object = Root`, una fila por campo). Se crearon 3
**Conversation attributes** de tipo **Text** — `veredicto_f2`, `fecha_limite_f2`, `dias_pasados_f2`
(este último Text a propósito aunque sea un número, para no arriesgar desajuste de tipo) — y el
branch pasó a leer **`veredicto_f2` bajo el encabezado `Conversation`**.

⛔ **Trampa a evitar:** reinsertar el chip `veredicto` del connector con el selector `{..}` —que es
justo lo que recomendaba la antigua Parte D— **rompe el arreglo**. El branch NO debe leer
`veredicto` bajo el encabezado `beckham_plazo_f2`.

Verificado en conversaciones reales no-Preview, las dos ramas: `21/06/2025` → `fuera_plazo` /
`21/12/2025` / 219 días; `01/04/2026` → `en_plazo` / `01/10/2026` / 0 días → cualifica y asigna al
team `11098265`. Re-verificado el 1/08 en la conversación `215475300855984`.

## Las cinco hipótesis muertas — NO resucitarlas

1. Atributos duplicados a nivel de app.
2. Pill Conversion Error.
3. Desajuste de tipo.
4. El operador `contains`.
5. "Cosa del entorno TEST".

**El experimento que las mató a todas de golpe:** cambiar la condición a **`has any value`**. Al
seguir fallando quedó claro que no había *nada* que leer, así que daban igual el chip, el valor, el
tipo y el operador. **Técnica a reutilizar: preguntar "¿hay algo?" antes de "¿es correcto?".**

## Corolario que también quedó resuelto
El bloqueo del 24/07 (`fecha_limite` y `dias_pasados` no aparecían en el selector del mensaje `G`)
era el mismo problema y se resolvió con el mismo `Object mapping`.
