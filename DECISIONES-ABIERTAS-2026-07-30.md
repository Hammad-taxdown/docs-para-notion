# Decisiones abiertas · Bot Beckham · sesión del 2026-07-30

> **Cómo usar este fichero.** Cada bloque es una pregunta. Debajo de cada una hay dos huecos:
> `RESPUESTA:` y `NOTAS:`. Escribe en el primero lo que decides (con la letra de la opción basta,
> pero si quieres matizar, mejor) y en el segundo cualquier cosa que quieras que tenga en cuenta.
> Si una pregunta no es tuya (manager, legal, Adri/Fer), pon `PREGUNTAR` y a quién, y sigo sin ella
> hasta donde se pueda. Si algo no lo entiendes, pon `NO ENTIENDO` y te lo explico de otra forma.
>
> Cuando termines, dime **"carga el archivo"** y lo leo entero.

**Etiquetas:** `[TÚ]` la decides tú · `[MANAGER]` no es tuya · `[TERCERO]` depende de Adri/Fer o de legal ·
`[MEDIR]` no se decide, se mide con un experimento (solo necesito que autorices el experimento).

**Total: 47 puntos** — 6 del manager (M), 7 tuyas de producto (U), 18 técnicas (T), 16 nuevas que he
encontrado hoy (N).

---

# A · DECISIONES DEL MANAGER

Estas seis no las puede tomar el equipo técnico. Cada una bloquea Work Packages concretos: mientras no
haya respuesta, esos WP no se construyen (no es burocracia — es que construirlos requiere saber la
respuesta).

---

## M1 · ¿Los recordatorios a leads potenciales entran en nuestro alcance o no? `[MANAGER]`

**Por qué pregunto.** Hay una contradicción documentada entre dos partes del propio proyecto, y no la
puedo resolver yo. El `WP-03` dice, literalmente y desde el 22/07, que los recordatorios **los monta otra
persona** y que nuestro alcance se limita a "dejar el dato bien guardado en Airtable". En cambio el diseño
de la Fase 2 incluye un scheduler de recordatorios como pieza propia (`WP-230`). Alguien decidió una cosa
y luego se pidió la otra, y nadie ha anulado la primera.

**Qué es un "lead potencial", para contexto.** Es alguien que llega al bot, dice que **todavía no** está
de alta en la Seguridad Social, y por tanto no puede solicitar el régimen aún — pero podrá en el futuro.
Hoy el bot le pregunta para cuándo prevé darse de alta, y ahí se acaba todo. Nadie le vuelve a escribir.

**Opciones reales:**
- **(a) Los construimos nosotros.** Workflow programado en n8n que consulta Airtable y envía el
  recordatorio cuando toca. Implica ser dueños de un canal de comunicación al cliente, con su cadencia,
  su tope de intentos y su opt-out.
- **(b) Solo registro, vista y consentimiento.** Guardamos la fecha prevista con su precisión, el opt-in y
  el opt-out, y creamos una vista de Airtable (`Leads potenciales`) desde la que un tercero monta los
  envíos con la herramienta que quiera. Nosotros no enviamos nada.
- **(c) Fuera de alcance total.** Ni scheduler, ni vista, ni campos de consentimiento. El dato se guarda y
  punto.

**Mi recomendación: (b).** Deja el dato completo y legalmente utilizable sin que nos convirtamos en
dueños de una comunicación comercial que nadie nos ha asignado formalmente, y respeta lo que ya dice
WP-03 sin perder la intención de la Fase 2.

**Qué desbloquea:** `WP-230` (hoy bloqueado del todo) y fija el alcance final de `WP-225`.

**RESPUESTA:**
(a), Lo construimos nosotros, y ademas habria que hacer hacerlo nosotros y tambien la b, es decir crealos nosotros y configurar todo. AUNQUE QUE QUEDE CLARO, 
ESA AUTOMATIZACION VIVE EN AIRTABLE, ES DECIR SOLO HAY QUE TRANSLADAR ESOS DATOS DE INTERCOM A AIRTABLE Y DE ESO SE ENCARGA ALINA Y ICIAR QUE SON PROS EN AIRTABLE, 
OSEA NUESTRO TRABAJO ES HACER QUE VAYA EL DATO DE INTERCOM A AIRTABLE, YA SEA POR DATACONNECTOR Y N8N O COMO CREAS QUE SE TENGA QUE HACER

**NOTAS:**
Un lead potencial es aquel que dice todavia no y tambien aquel que sabe una fecha aproximada, ya que aun que no este dado de alta en la ss
siempre les preguntamos si saben una fecha aprox, y ahi o nos la dan o dicen que no saben  tampoco y en los dos casos los guardamos, para enviarles mensajes de
follow up

---

## M2 · ¿Quién es, con nombre y apellidos, el dueño del seguimiento de leads? `[MANAGER]`

**Por qué pregunto.** Si M1 sale (a) o (b), alguien tiene que mirar esa vista o ese proceso y actuar. Si
la respuesta es "el equipo", en la práctica no lo mira nadie. No es un temor teórico: en esta misma base
de Airtable ya hay una automatización ajena (`wflo1oMmSWlcYsO3V`) que crea filas hijas y las borra, con
dos ramas que no hacen nada y dejan filas zombis — es exactamente el resultado de una automatización sin
dueño.

**Opciones reales:**
- **(a) Una persona concreta**, nombrada, que sabe que es suyo.
- **(b) Un equipo** (`Ops_Mobility`) como responsable colectivo.
- **(c) Todavía nadie**, y se decide más adelante.

**Mi recomendación: (a).** Una vista de Airtable sin una persona que la abra cada semana es un cementerio
de leads con buena presentación.

**Qué desbloquea:** `WP-225` no se puede cerrar sin esto · `WP-230`.

**RESPUESTA:**
Es un equipo el de Ops_Mobility, pero los mensajes de follow up tienen que estar automatizados, y eso sera en airtable,
el guardado en at tambien. Asi que si que eso lo lleva un equipo por el tema de que siempre que haber ese asesoramiento humano.

**NOTAS:**



---

## M3 · Base legal, opt-in y retención de los recordatorios `[MANAGER / TERCERO — legal]`

**Por qué pregunto.** Escribirle dentro de seis meses a alguien que un día dijo "todavía no estoy de
alta" es, con bastante probabilidad, **comunicación comercial**, no la continuación de una gestión que él
pidió. Eso cambia qué necesitamos guardar: si hace falta consentimiento explícito, hay que pedirlo en la
conversación y guardar **cuándo** y **en qué conversación** se dio. Eso son campos y una pregunta más en
el flujo — es decir, trabajo que depende de esta respuesta, no algo que se pueda añadir después.

**Qué necesito concretamente saber, en tres partes:**
1. **Base legal:** ¿consentimiento explícito, o interés legítimo?
2. **Mecanismo:** ¿opt-in (no se le escribe salvo que diga sí) u opt-out (se le escribe salvo que diga
   no)?
3. **Retención:** ¿cuánto tiempo guardamos el dato de un lead que nunca se dio de alta?

**Opciones reales:**
- **(a) Opt-in explícito + retención definida** (ej. 12 o 24 meses y se borra).
- **(b) Interés legítimo con opt-out** en cada envío.
- **(c) Sin recordatorios**, y esta pregunta desaparece.

**Mi recomendación: (a).** Es lo único defendible si alguien pregunta, y además hace que el opt-out sea
trazable en vez de un "creo que dijo que no".

**Qué desbloquea:** `WP-225`, `WP-230`.

**RESPUESTA:**

1. **Base legal:** No es promocional, estos clientes pagan 1 año por 300 euros lo mínimo que se les  puede hacer es asesorar y que sepan sus plazos 
en tiempo
2. **Mecanismo:** No, lo que les diremos al final del mensaje es, te iremos avisando cuando se acerque tu plazo
3. **Retención:** si sabe una fecha aprox esa fecha + 6 meses; que es el limite del plazo y luego si no sabe plazo ir enviando cada 1-2 meses un recordatorio

**NOTAS:**

---

## M4 · ¿Quién aprueba el corpus fiscal del modo FAQ, y qué contiene? `[MANAGER]`

**Por qué pregunto — y por qué esto es lo más importante de la lista.** El modo FAQ es que el usuario
pueda preguntar dudas sobre el régimen Beckham y el agente le responda. Para que un LLM responda dudas
fiscales sin inventarse nada, tiene que tener una fuente cerrada de la que citar: un documento aprobado,
versionado, del que el agente **no puede salirse**. Ese documento **hoy no existe**. Y no hay decisión
técnica que lo sustituya: sin corpus, el FAQ no es publicable con ninguna arquitectura, porque la
alternativa es un modelo respondiendo de memoria sobre plazos y requisitos fiscales.

Esto es lo que corta el camino crítico de toda la Fase 2. No lo corta el código: lo corta un documento.

**Opciones reales:**
- **(a) Alguien con criterio fiscal escribe y aprueba un corpus** versionado (puede ser un documento de
  10-20 preguntas y respuestas, no hace falta un tratado).
- **(b) Puente:** usar como corpus las 5-8 respuestas fiscales **que ya están escritas hoy** en los
  mensajes del bot (los textos de bienvenida, descarte y plazo, que ya pasaron algún filtro), con el FAQ
  cerrado a esos temas y respondiendo "esto no lo cubro, te paso con una persona" a todo lo demás.
- **(c) FAQ fuera del MVP** y se construye todo lo demás.

**Mi recomendación: (b) ahora y (a) en paralelo.** Permite construir hoy toda la cañería del FAQ (que es
donde está el trabajo técnico real) contra un corpus mínimo ya aprobado de facto, sin esperar semanas a
un documento nuevo — y cuando llegue el corpus bueno, es sustituir un fichero.

**Qué desbloquea:** `WP-220` → y con él `WP-221`, `WP-222`, `WP-233`.

**RESPUESTA:**
Ese corpus, es el prompt con el que viene entrenado el agente de IA que vive en n8n, ese esta escrito por Paula, Alina y Iciar, lo estan testeando y refinando y yo me lo pasan
y lo pego en la parte de System Prompt del ia agent, por ahora ya hay uno que es con el que he estado trabajando.
**NOTAS:**

---

## M5 · "El mismo agente": ¿lectura literal o funcional? `[MANAGER]`

**Por qué pregunto.** El manager pidió que el FAQ y la solicitud los atienda **el mismo agente**. Al mismo
tiempo hay un requisito duro de seguridad: el agente en modo FAQ **no debe poder escribir en Airtable**
(alguien preguntando dudas no debe poder provocar que le creemos o modifiquemos un expediente). Esas dos
cosas chocan, y cómo se resuelven depende de qué signifique "el mismo agente".

**El dato técnico que manda aquí (verificado):** el nodo `AI Agent` de n8n **no tiene ningún parámetro
para elegir qué tools puede usar**. Las tools son **aristas del grafo**: una tool está disponible si está
cableada a ese nodo, y no lo está si no lo está. No existe una lista blanca dinámica. Por tanto solo hay
dos formas de que el FAQ no pueda escribir:

- **(a) Lectura funcional — dos nodos `AI Agent`.** Misma identidad (el mismo `prompt_base` compartido y
  versionado), el mismo sub-nodo de modelo, el mismo hilo de conversación, el mismo conocimiento. Lo
  único distinto: al nodo de FAQ **no le llega el cable** de la tool de escritura. "El FAQ no puede
  escribir" se demuestra contando aristas en el grafo, no leyendo un prompt.
- **(b) Lectura literal — un solo nodo `AI Agent`.** Todas las tools cableadas al mismo nodo, y un
  "gateway" en medio que rechaza las llamadas que no correspondan al modo. Funciona, pero tiene un coste
  real: el modelo **ve las descripciones de todas las tools** aunque no pueda usarlas, así que puede
  prometerle al usuario acciones que luego serán rechazadas (es exactamente el defecto que hoy tenemos
  vivo: el prompt nombra tres tools que no existen y el agente promete cosas que nadie ejecuta). Si se
  elige esto, hay que aceptar esa fuga **por escrito**.

**Coste de migración: cero en ambos casos.** Verificado: el `AI Agent` que está vivo hoy tiene **cero**
tools conectadas.

**Mi recomendación: (a).** Es la única en la que el requisito de seguridad es verificable con una
comprobación mecánica en vez de con confianza en el prompt.

**Qué desbloquea:** `WP-218` (define su patrón), `WP-219`.

**RESPUESTA:**
Seguimos con esta:

- **(a) Lectura funcional — dos nodos `AI Agent`.** Misma identidad (el mismo `prompt_base` compartido y
  versionado), el mismo sub-nodo de modelo, el mismo hilo de conversación, el mismo conocimiento. Lo
  único distinto: al nodo de FAQ **no le llega el cable** de la tool de escritura. "El FAQ no puede
  escribir" se demuestra contando aristas en el grafo, no leyendo un prompt.


**NOTAS:**
Serian 2 agentes, mismo modelo, mismo prompt, solo que distintas partes del flujo, distintas tools y instrucciones de respuesta en el caso del agente FAQ y el agente el otro es el que escribe y rellena y tal no?
---

## M6 · SLA, horario y capacidad de `Ops_Mobility` `[MANAGER]`

**Por qué pregunto.** "Escalar a un humano" es el destino final de **todas** las ramas de error del
diseño: fallo técnico, pregunta no cubierta, usuario que lo pide, fecha que no se entiende dos veces. Si
detrás de ese escalado no hay un equipo con horario y capacidad, "escalar" es en realidad "abandonar al
usuario en un hilo que nadie mira".

**Y hay un problema vivo ahora mismo, no futuro:** el nodo `Mensaje_fallback` de producción le dice al
usuario *"un compañero te escribirá"* y **no asigna la conversación a nadie**. Es una promesa falsa que ya
se está enviando.

**Qué necesito saber:** ¿qué equipo o persona recibe los escalados, en qué horario, y con qué compromiso
de respuesta (si hay alguno)?

**Opciones reales:**
- **(a) SLA y horario concretos**, y el bot los dice ("te responderemos en menos de 24 h laborables").
- **(b) El mecanismo se construye y asigna de verdad, pero el texto no promete plazo** ("un compañero lo
  revisará").
- **(c) Sin escalado a humano** — que implica reescribir los mensajes para no prometerlo.

**Mi recomendación: (b) hoy y (a) antes de producción.** El mecanismo de asignación se puede construir ya
mismo; lo que no se puede publicar es un plazo que nadie ha firmado.

**Qué desbloquea:** `WP-223`.

**RESPUESTA:**
- **(a) SLA y horario concretos**, y el bot los dice ("te responderemos en menos de 24 h laborables").
Seria esta pero estos tienen un trato mas rapido, no se cuanto pero como son full vip, dejamos ahi solo como pendiente cuanto tiempo exacto,
pero implementamos el a
**NOTAS:**

---

# B · DECISIONES TUYAS (producto y operativa)

---

## U1 · ¿Aceptas que la Fase 2 no se construye antes de los 9 prerrequisitos? `[TÚ]`

**Por qué pregunto.** El plan de la Fase 2 tiene 33 Work Packages, y los nueve primeros (`WP-201` a
`WP-209`) no construyen nada nuevo: arreglan la cañería que ya existe. El más pequeño de todos, `WP-201`,
es lo que hoy hace que **toda escritura en Airtable devuelva 400**. Es decir: si construimos ramas nuevas
antes de arreglarlo, construimos ramas que no guardan nada y no podemos probar.

**Opciones reales:**
- **(a) Sí**, prerrequisitos primero, y la Fase 2 después.
- **(b) Adelantar algo de Fase 2 en paralelo** (por ejemplo el menú o la calculadora, que no escriben en
  Airtable).

**Mi recomendación: (a), con un matiz.** La calculadora y el menú son las dos únicas piezas que se pueden
adelantar sin depender de la cañería. Si quieres ver progreso visible pronto, esas dos son el sitio.

**RESPUESTA:**
- **(a) Sí**, prerrequisitos primero, y la Fase 2 después.
Hacemos primero la a
**NOTAS:**

---

## U2 · ¿Autorizas la "conversación sonda"? Es la decisión que más desbloquea hoy `[TÚ]`

**Qué es.** Una conversación real (no Preview) en la que, en lugar de probar el flujo de negocio, el bot
te hace pasar por 6-8 pasos diseñados **solo para observar el mecanismo**: escribir un atributo con un
paso `Set` y leerlo dos pasos después, probar si acepta un valor literal, probar si acepta cadena vacía,
responder a un colector para ver si eso dispara el turno 2, etc. Cada paso responde a una incógnita que
hoy bloquea el diseño.

**Por qué importa tanto.** Cierra de golpe **nueve** incógnitas técnicas (T1, T2, T3, T4, T7, T9, T10,
T12 y, con suerte, T5 — el ticket). Hoy esas nueve están bloqueando la máquina de estados completa de la
Fase 2: si la nº1 sale mal, hay que reescribir dos apartados enteros del PRD. Sin la sonda estaríamos
diseñando sobre supuestos.

**Y es también lo que desbloquea WP-10 (los tickets).** Ayer por la tarde hubo dos conversaciones reales
que **no** se convirtieron en ticket, así que ahora mismo no tenemos el síntoma reproducido. Sin síntoma,
desactivar candidatos de uno en uno no prueba nada. La sonda llega al turno 2 y nos dice si el fallo
sigue vivo.

**El riesgo, dicho claro.** Si durante la sonda la conversación se convierte en ticket y pasa a estado
`Submitted`, **Intercom manda un correo al contacto** ("hemos recibido tu solicitud"). Es exactamente lo
que pasó el 28/07.

**Opciones reales:**
- **(a) Sí, con un contacto de pruebas dedicado** (no tu cuenta de trabajo). Mismo valor probatorio, y el
  correo cae en un buzón que da igual.
- **(b) Sí, con tu cuenta**, asumiendo que puede llegarte ese correo.
- **(c) No** — y entonces la Fase 2 se diseña sobre supuestos y WP-10 se queda como está.

**Mi recomendación: (a).**

**Si dices (a), necesito de ti:** qué contacto usamos (email o `external_id`), y si ese contacto está
logueado en la app (importa: un visitante anónimo no tiene `user_id` y arruina la mitad de las
observaciones).

**RESPUESTA:**
Lo que pasa es que sigue en test todo, no esta en prod aun asi que la unica forma seria con mi cuenta, y lo del correo es que hay que pausar algun workflow que esta activo por ahi que alguien
creo para hacer cosas de test, esto todo sigue en test
**NOTAS:**

---

## U3 · ¿Qué hacemos cuando no hay `user_id`? Hoy el lead se pierde entero `[TÚ]`

**Por qué pregunto.** La clave con la que guardamos cada expediente en Airtable es `UserId`, el ID interno
de TaxDown. Llega desde Intercom con el token `{{user_id}}`, y **solo existe si el usuario está
logueado**. Un visitante anónimo no lo tiene. Hoy, cuando falta, nuestro webhook devuelve `400` y **no
guarda absolutamente nada**: ese lead desaparece sin traza.

**Esto ya ha pasado de verdad:** en la tabla hay una fila con `lead_potencial = true` y **sin** `UserId`
(`recSop5rTn99Qft0o`), que es irrecuperable por la clave de upsert.

**El riesgo de la opción fácil.** No se puede simplemente "guardar con `UserId` vacío": el upsert busca la
fila cuyo `UserId` coincide, y si el valor de búsqueda está vacío podría hacer match con **otra** fila que
también lo tenga vacío y sobrescribirla. En la tabla hay 3 filas de 6 sin `UserId`. Por eso hoy hay una
salvaguarda que devuelve 400.

**Opciones reales:**
- **(a) Dejarlo como está:** 400, y el lead se pierde. Simple, y no corrompe nada.
- **(b) Fallback al email** si existe: guardar con `email` como clave cuando no haya `UserId`. Problema:
  vuelve a tener dos claves distintas, que es justo lo que se decidió eliminar el 27/07.
- **(c) Clave sintética marcada:** guardar con `UserId = anon:{conversation_id}`. Nunca hace match con una
  fila real, es identificable a simple vista, es filtrable, y si más adelante ese usuario se loguea se
  puede reconciliar.

**Mi recomendación: (c).** Un visitante anónimo que dice "me interesa pero aún no estoy de alta" es
exactamente el lead que no quieres tirar a la basura, y el prefijo hace la fila trivial de encontrar y de
limpiar.

**Qué desbloquea:** `WP-224` (registro del lead) y toda la rama de leads.

**RESPUESTA:**
Te explico, para acceder al tramite, SI O SI TIENES QUE ESTAR LOGUEADO
porque ademas para poder acceder al tramite tienes que ser FULL vip, asi que los leads son full vips que aun no estan dados de alta en la ss y que o 
quieren ir preparando la llegada a españa o pensar que documentos tienen que ir recogiendo o pedirle a la empresa etc
**NOTAS:**

---

## U4 · ¿Quitamos del menú la opción "No creo que cumpla los requisitos"? `[TÚ]`

**Por qué pregunto.** Esa opción existe hoy en el menú de bienvenida (la vi en el timeline de las
conversaciones de ayer: es una de las cuatro respuestas rápidas). Si el usuario la pulsa, el bot **cierra
la conversación**. El problema: el usuario está autoevaluándose **sin que le hayamos preguntado nada** —
no sabemos si es residente, ni si está de alta, ni la fecha. Mucha gente cree que no cumple y cumple. Y
al cerrar, no queda traza de que ese lead pasó por aquí.

**Opciones reales:**
- **(a) Retirarla del menú.** Se queda con las otras tres.
- **(b) Dejarla, pero que no sea terminal.** Mensaje del tipo "muchos creen que no cumplen y sí lo hacen,
  ¿lo comprobamos en 3 preguntas?" + dejar traza (`punto = autodescarte_declarado`, que **no** es un
  descarte real en Airtable) + ofrecerle el FAQ o la calculadora.
- **(c) Dejarla exactamente como está.**

**Mi recomendación: (b).** Conserva la libertad del usuario de irse, deja de quemar leads en silencio, y
nos da un dato nuevo: cuánta gente se autodescarta sin motivo.

**Qué desbloquea:** `WP-215`, `WP-213`.

**RESPUESTA:**
- **(b) Dejarla, pero que no sea terminal.** Mensaje del tipo "muchos creen que no cumplen y sí lo hacen,
  ¿lo comprobamos en 3 preguntas?" + dejar traza (`punto = autodescarte_declarado`, que **no** es un
  descarte real en Airtable) + ofrecerle el FAQ o la calculadora.
esta es una buena idea
**NOTAS:**

---

## U5 · Si hay recordatorios, ¿por qué canal? `[TÚ]` *(solo aplica si M1 = (a) o (b))*

**Por qué pregunto.** Cambia qué hay que guardar y quién lo envía. Un email necesita una dirección válida
(y hoy el `email` es un dato que a veces no tenemos). Un mensaje de Intercom llega solo si el usuario
vuelve a abrir el chat, o requiere un canal de salida configurado.

**Opciones:** (a) email · (b) Messenger / push de Intercom · (c) ambos.

**Mi recomendación: (a) email**, y solo si M3 está resuelto.

**RESPUESTA:**
a, email
**NOTAS:**

---

## U6 · Las imágenes / la tabla de notas amarillas `[TÚ]`

**Por qué pregunto.** En el diseño de la Fase 2 que describiste hay notas (las "notas amarillas" del
diagrama) que contienen requisitos que **no están en ningún otro sitio**. Nunca se han aportado como
imagen. He construido todo el PRD sin ellas y he dejado declarado que faltan, precisamente para no
inventarme su contenido. Pero eso significa que cualquier requisito que solo viva ahí, hoy no está
cubierto.

**Opciones:**
- **(a) Me las envías hoy** y las incorporo antes de empezar.
- **(b) Las declaras definitivamente no disponibles**, y seguimos con lo que hay documentado, aceptando
  que puede faltar algo.
- **(c) Me las cuentas por escrito** en el hueco de abajo, sin imagen.

**Mi recomendación: (a) o (c)**, lo que te sea más rápido.

**RESPUESTA:**
Son solo notas de lo que he pensado de que tiene que ir ahi
Aqui esta lo que pone, el de la calculadora:
Esto tiene que redirigir a la calculadora de Beckham que hizo Alina, aun no sabemos como esta implementada si vive en la app de Taxdown o fuera no sabemos, dejar como pendiente pero no es urgente.

**Esto pone en el de las preguntas al bot, es lo que habia pensado, puede que veas contradicciones porque eran solo notas de lo que estaba pensando**
Aqui tendriamos que dirigirle al bot, y que venga flageado que este no ha pasado por el primer filtro de las 3 preguntas y que primero respondamos a sus preguntas y ya luego volvera al flujo, aqui las preguntas son; ¿Como hacemos que venga "flaggeado"?, ¿Como hacemos que el agente de IA que vive en n8n no le pregunte las preguntas personales y de perfil fiscal? y la mas importante, como hacemos que una vez que ya no tenga dudas vuelva al flujo normal; Pensé en algo como que en cada mensaje que le responda el bot venga abajo "Tienes mas preguntas? SI no escribeme "No, quiero comprobar si cuento con los requisitos" y avanzaremos a ver si puedes pedir el régimen" Despues de hacer esto, hacemos que vuelva a l path B, la cosa es que el usuario puede hacer x preguntas siempre hay que seguir hasta que pida pasar al flujo, Y algo importante es hacer un pequeño metodo de triaje dentro del bot que si empieza el usuario a cambiar de mood, es decir insultar, usar mayusculas muchas en el sentido de gritar, repetir palabras en el sentido como si fuera el bot un niño pequeño asignar a la bandeja de OPS_Mobility donde le atendera un humano

y esta nota la puse cuando guarda la fecha prevista:
Aqui hay que ver como guardar ese dato , para luego usarlo. Hay que ver como sera la presistencia de datos en airtable y como implemenyaremos lo del recall o lead follow up "CUIDADO CON LOS ATRIBUTOS ESTOS A VER SI ROMPEMOS OTRA VEZ EL DATA CONNECTOR"



**NOTAS:**

---

## U7 · ¿Entra `WP-07` (`get_expediente`) en el plan? `[TÚ]`

**Por qué pregunto.** `get_expediente` es el workflow que, dado un usuario, busca en Airtable si ya tiene
expediente y qué datos tiene. Existe en n8n (`PAGK9sof3bfTdbRB`) pero está **desactivado y nunca se ha
ejecutado** (`active: false`, `triggerCount: 0`), probablemente porque le falta la credencial de Airtable.

**Qué cambia según la respuesta.** Sin él:
- Un lead que vuelve meses después **empieza de cero** y el bot le vuelve a preguntar todo lo que ya sabe.
- El agente no tiene forma de saber qué datos ya tenemos, así que "DATOS QUE YA CONOCEMOS" solo puede
  alimentarse del hilo de conversación, no del expediente real.
- La tool `get_expediente` del agente no se puede montar.

**Opciones:**
- **(a) Sí:** se revisa, se le asigna la credencial y se prueba. Es trabajo pequeño (configuración, no
  construcción).
- **(b) No:** se acepta explícitamente que no hay reincorporación de leads en esta fase.

**Mi recomendación: (a).** Es barato y es la diferencia entre un bot que te reconoce y uno que te
interroga otra vez.

**RESPUESTA:**
Si haria - **(a) Sí:** se revisa, se le asigna la credencial y se prueba. Es trabajo pequeño (configuración, no
  construcción)., pero donde esta lo de get_expediente? No se donde esta eso? si te refieres a lo de arriba de traza,
  eso es solo de guia para mi para ir acordandome de cosas a a no olvidar e inspiracion, y si ya esta ahi solo que no lo estoy viendo si hcemos la 
  opcion (a)
**NOTAS:**

---

# C · INCÓGNITAS TÉCNICAS

**Lee esto primero y te ahorras 8 preguntas.** Ocho de las dieciocho se cierran **todas de golpe** con la
conversación sonda de `U2`. No necesito que las respondas una por una: si autorizas la sonda, las mido.
Te las listo para que sepas qué estamos midiendo y por qué, no para que decidas.

---

## T1–T4, T7, T9, T10, T12 · Las que cierra la sonda `[MEDIR]`

- **T1 · ¿Un atributo escrito con un paso `Set` se puede leer después, en otro path y desde n8n?**
  *Bloquea toda la máquina de estados de la Fase 2.* Sabemos que la **lectura** funciona (es lo que
  arregló el bug de F3: el atributo `veredicto_f2` se escribe con `Object mapping` y se lee desde otro
  path y desde n8n). Lo que **no** sabemos es si un atributo escrito con un paso `Set` se propaga igual.
  Todo el transporte del "modo" del bot depende de esto. Si sale que no, hay que rediseñar dos apartados
  del PRD.
- **T2 · ¿Un paso `Set` y el "Map action inputs" aceptan un valor literal** (escribir `lead` a mano) **o
  solo permiten insertar atributos?** Hay una **contradicción en nuestra propia documentación**: unas
  notas dicen DESCONOCIDO, el log del 28/07 dice que se verificó en pantalla que **sí** acepta literales.
  Importa porque de ahí depende cómo mandamos el discriminador `punto` (qué rama del flujo escribió) y
  cómo se entra al FAQ.
- **T3 · ¿`Set conversation data` acepta una cadena vacía?** Es la forma de **resetear** el modo al
  empezar una conversación nueva. Si no acepta vacío, hay que usar un valor centinela.
- **T4 · ¿Responder a un `Collect data`, o escribir un mensaje mientras hay un colector activo, dispara
  el trigger de "el cliente envía un mensaje"?** *Bloquea el diseño del multi-turno.* Es la mitad del
  misterio del turno 2.
- **T7 · ¿`{{user_id}}` resuelve con valor real dentro de `OnClick Mobility`?** Verificado el 28/07 que
  sí. La sonda lo reconfirma gratis.
- **T9 · ¿Cuántos reply buttons acepta, y cómo se ven en móvil?** Decide si el menú lleva 3 o 4 opciones.
- **T10 · ¿Es observable el click en el enlace de la calculadora?** Decide si tenemos métrica de
  conversión o no.
- **T12 · ¿Un `Close` con un callback pendiente deja el callback huérfano?** Riesgo real: es lo que puede
  estar pasando hoy en la rama de error de la fecha.

**Nada que responder aquí.** Solo: **¿autorizas la sonda?** → está en `U2`.
Mira lo que respondí en el U2
**NOTAS (si quieres añadir alguna observación a la sonda):**

---

## T5 · ¿Qué convierte las conversaciones en `Customer ticket`? — "los tickets que se abren solos" `[TÚ + TERCERO]`

**El problema, en una frase.** El 28/07 el agente conversacional funcionó **un solo turno**: el usuario
respondió y su mensaje no llegó nunca a n8n. La causa: la conversación era un `Customer ticket` (tipo
`Prueba Fer`) desde que nació, y **sobre un ticket no se disparan los triggers de "el cliente envía un
mensaje"**. Y al pasar el ticket a `Submitted`, Intercom **manda un correo al cliente**, que en producción
es inaceptable.

**Lo que sabíamos:** entre las 19:04 y las 19:19 del 28/07 algo cambió en el workspace. La de 19:04 tenía
`ticket: null` y funcionó; las de 19:19 en adelante son ticket. **No fue trabajo de este proyecto.** La API
pública de Intercom no dice quién lo hizo.

**Lo que cambió ayer y por eso te lo replanteo hoy:** el 29/07 a las 17:27 y 17:28 hubo dos conversaciones
reales (no Preview) y **las dos nacieron con `ticket: null`**. El síntoma **no se reprodujo**. Pero
tampoco se puede cantar victoria: en las dos nadie respondió al menú, se cerraron solas por inactividad a
los 3 minutos, y no hubo turno 2. Así que sabemos que el ticket no se crea *al nacer*; **no** sabemos si se
crea *al responder*.

**Por qué esto cambia el método.** El PRD de WP-10 dice "desactivar candidatos de uno en uno y probar
entre medias". Eso solo funciona si el fallo se reproduce: si desactivas algo y la prueba sale bien, sin
síntoma de partida no sabes si lo arreglaste o si simplemente hoy no pasaba. **Primero hay que reproducir,
luego desactivar.**

**Plan que propongo:**
1. Sonda que llegue al **turno 2** (responder al menú y luego escribir un mensaje).
2. Si aparece el ticket → tenemos síntoma reproducible → entonces sí, checklist de uno en uno (Fin sobre
   el Messenger · ticket type `Prueba Fer` · config del Messenger · workflows Live con trigger de mensaje ·
   simple automations · reglas del Inbox · la app `adri-app-test`).
3. Si **no** aparece → WP-10 se cierra como "se resolvió por un cambio externo", se documenta, y se pide a
   Fer que archive el ticket type para que no vuelva.

**Qué necesito de ti:** ¿de acuerdo con reproducir antes de desactivar? ¿Y tienes hoy un rato para hacer
la conversación del turno 2 tú mismo en el Messenger?

**RESPUESTA:**
Si lo que tu propongas pero algo me dice que es otro WF de intercom que sigue activo porque la gente en el entorno de test va probando cosas
antes de ponerlo en produccion, el plan este que recomeindas damelo en escrito tamvien en el entregable final y para tu info tengo catedra para desacrivar cosas como estoy en test y soy dev
**NOTAS:**

---

## T6 · ¿`Pass to <reusable>` devuelve el control al flujo que llamó? `[MEDIR]`

**Por qué importa.** En el diseño de la Fase 2 hay un caso: el usuario está preguntando dudas (modo FAQ) y
dice "vale, ya quiero solicitarlo". Idealmente volvería al punto del flujo donde se comprueban los
requisitos. Pero **en Intercom no existe un "GOTO"** ni una subrutina con retorno, según toda la evidencia
que tenemos: los `Pass to` que hemos visto son handoffs **sin vuelta**.

Si `Pass to` no devuelve el control, la transición FAQ→solicitud tiene que ser un **relanzamiento** (se
lanza el flujo de solicitud desde el principio, conservando lo que ya sabemos en atributos), no una
reanudación. Cambia el diseño, no solo la implementación.

**Cómo se cierra:** prueba con dos reusables encadenados. 10 minutos.

**Nada que decidir.** Solo saber si quieres que lo mida en la misma sesión de la sonda o después.

**RESPUESTA:**
Si hagamos eso ponlo en las cosas todo y to test
**NOTAS:**

---

## T8 · ¿Un campo que no mandamos **borra** lo que ya había en Airtable? `[TÚ — decide si se mide ya]`

**Por qué pregunto, y por qué es más grave de lo que parecía.** El diseño dice "solo escribimos los campos
presentes, nunca pisamos con vacío". Eso lo garantiza el código que valida y normaliza los datos. **Pero
hoy he verificado el nodo de Airtable y no se comporta así:** mapea **los nueve campos siempre**, con una
expresión por campo. Cuando un campo no viene, la expresión resuelve a `undefined`. Y el nodo tiene
`typecast: true` activado, que hace que Airtable intente convertir lo que le llegue.

Traducido: **no sabemos si guardar una fecha nueva borra el email que ya estaba**. Se ha probado por curl
y no pareció pasar, pero eso no es lo mismo que haberlo medido campo a campo. Y afecta a las seis ramas
que van a escribir.

**Opciones:**
- **(a) Medirlo ahora**, pegado al arreglo de `WP-201`: son 3-4 curls más en el mismo script, se hace sin
  navegador, y cierra la duda para siempre.
- **(b) Asumir que sí pisa** y cambiar el nodo para que solo mapee lo presente. Más seguro, más trabajo.
- **(c) Dejarlo y confiar en lo que se vio por curl.**

**Mi recomendación: (a).** Es la incógnita más barata de cerrar de toda la lista y la que puede corromper
datos reales de empleados.

**RESPUESTA:**
- **(a) Medirlo ahora**, pegado al arreglo de `WP-201`: son 3-4 curls más en el mismo script, se hace sin
  navegador, y cierra la duda para siempre. * encontrar una solucion óptima
**NOTAS:**

---

## T11, T13–T17 · Las que necesitan un dato de fuera, no una decisión `[TÚ — consígueme el dato]`

- **T11 · ¿Cuánto tiempo puede esperar un workflow de Intercom a que n8n responda?** El límite por defecto
  documentado es 15 segundos. Necesito saber el plan de Intercom contratado para confirmarlo. Decide
  cuánto trabajo puede hacer n8n mientras el usuario espera.
- **T13 · Estado real (live / paused) de los workflows de Intercom y de los ticket types.** La API pública
  **no lo expone**: hay que mirarlo en la UI. Es lo que bloquea saber si Fin está activo sobre el
  Messenger, que es el candidato nº1 de los tickets. Con una captura de pantalla de la lista de workflows
  filtrada por "Live" me vale.
- **T14 · Límites y coste de los planes contratados** (Intercom y n8n). No voy a citar cifras sin fuente.
- **T15 · Coste real por turno del LLM.** Depende del modelo configurado en el sub-nodo `David Beckham` y
  del tamaño del prompt. Sin esto, cualquier estimación de coste que te dé sería inventada.
- **T16 · Volumen esperado en producción** (conversaciones/mes). Decide si Airtable sigue siendo
  suficiente como almacén o hay que plantear otra cosa.
- **T17 · ¿Hay LangSmith o algún tracing disponible en esta instancia de n8n?** Vi un workflow
  (`UTIL_actualizar_dataset_langsmith_desde_airtable`) que sugiere que sí se usa en la empresa. Decide con
  qué mecanismo trazamos las llamadas del agente.

**RESPUESTA (los datos que puedas dar, o "no lo sé / pregunto a X"):**
Esto es irrelevante, si quiers ponerlo como solo algo que mencionar al final de la reunino, pero costes ahora no vamos a entrar
en eso, seria algo que discutir al final de la reunion y vuscariamos solo una forma de optimizar costes y mencionar que es algo que hay qye tener en cuenta,
luego usare claude.ia para hacer mi prresentacion, para ello usare todos los entregabkes que me des, entonces haz una bsuquyeda sobre todos esos puntos 
y hariamos un pueño estudio de mercado, no incluyas datos perspnales, solo info de la web y haz un aprox de entre 500-1000 cleintes que soliciten beckham, hazz el coste y tal. Luego lo del estado real eso esta en live
pero en el ENTORNO DE TEST. Asi que para la T11, T14,15,16 haz un estudio de mercado como te he indicado. T17 por ahora nada dejalo apuntado y ya
**NOTAS:**

---

## T18 · La tabla de notas amarillas

Es la misma que `U6`. Respóndela allí.
LEE LA U6
---

# D · PUNTOS NUEVOS QUE HE ENCONTRADO Y NO ESTABAN EN NINGUNA LISTA

---

## N1 · El CONTENT-TYPE: ¿lo arreglamos en n8n, en el Data Connector, o en los dos? `[TÚ]`

**Contexto.** Este es el bloqueo nº1: hoy **toda** escritura en Airtable devuelve 400. La causa está
verificada: el Data Connector de Intercom manda la petición como `application/x-www-form-urlencoded` con
**el JSON entero metido como si fuera el nombre de un campo**. Nuestro código lee `body.user_id`, que en
ese formato no existe → `undefined` → 400.

**La contradicción que he encontrado hoy.** El fichero `INTERCOMDOC.md` (que es nuestra fuente de verdad
sobre Intercom) dice en dos sitios que los Data Connectors mandan `application/json` y que *"confirmado
que nuestro DC lo lleva"*. Las ejecuciones reales de n8n (`8052012`, `8052018`) dicen `urlencoded`. **Uno
de los dos está mal**, y merece saberse porque afecta a cómo se arregla.

**Opciones:**
- **(a) Parseo defensivo en n8n** (lo que decidió el Council): si el body tiene una sola clave y esa clave
  parsea como JSON, se usa ese resultado; si no, se usa el body tal cual. Un cambio de un nodo, probable
  por curl, sin navegador.
- **(b) Arreglar el header en el Data Connector** desde la UI de Intercom.
- **(c) Las dos cosas.**

**Mi recomendación: (a) hoy, (b) cuando toques el DC de todas formas.** (a) se prueba en 2 minutos por
curl y nos protege incluso si el DC cambia mañana; (b) sola nos deja frágiles ante cualquier cliente
futuro que mande el body de otra forma.

**RESPUESTA:**
- **(a) Parseo defensivo en n8n** (lo que decidió el Council): si el body tiene una sola clave y esa clave
  parsea como JSON, se usa ese resultado; si no, se usa el body tal cual. Un cambio de un nodo, probable
  por curl, sin navegador.

  y si te fias arriba, en los nodos desactivados del proyecto de traza, puedes ver lo de User id asi peudes ver como se hizo y como se escribio, otra cosa puede ser
  que este mal configurado el airtable, pero bueno haz el a, y ya ahi sacamos conclusiones
**NOTAS:**

---

## N2 · Las 4 filas de prueba que hay en Airtable: ¿se borran? `[TÚ]`

**Contexto.** En la tabla `Empleados` hay 6 filas: 2 preexistentes reales y 4 de nuestras pruebas del
27/07 (`recKZg6HkEYxLocIz`, `recSop5rTn99Qft0o`, `reckt17pB8TvbuCCZ`, `rec1PBEQCqLYeZ1ZO`). Decidiste en su
momento no borrarlas.

**Por qué lo reabro.** Una de ellas (`recKZg6HkEYxLocIz`) tiene simultáneamente `alta_ss = true`,
`Descarte = "Alta en SS mas de 6 meses"` **y** `fecha_prevista_alta = 2027-03-15`. Eso es un estado
imposible: es alguien que a la vez está de alta, está descartado por plazo, y es un lead que prevé darse de
alta en el futuro. Es la **única prueba real** de que ninguna rama limpia las marcas de las otras — el
problema que motivó `WP-226`.

**Opciones:**
- **(a) Borrarlas** antes de las pruebas end-to-end, para partir de una tabla limpia.
- **(b) Dejarlas y documentarlas como casos de regresión**, y borrarlas solo cuando `WP-226` tenga su
  test.
- **(c) Dejarlas y no documentar nada.**

**Mi recomendación: (b).** Es evidencia real de un bug real; borrarla es perder la única prueba que
tenemos de él.

**RESPUESTA:**
si dejalas asi leugo en la presenyacion que tengo mañana, comentamos como estaba el proyecto antes y tal y errores encontrados
**NOTAS:**

---

## N3 · El lead sin `UserId`: ¿se recupera o se declara pérdida? `[TÚ]`

**Contexto.** `recSop5rTn99Qft0o` tiene `lead_potencial = true` y **no** tiene `UserId`. La clave de upsert
no lo encontrará nunca, así que si esa persona vuelve, crearemos una fila duplicada.

**Opciones:** (a) identificarla y rellenar el `UserId` a mano · (b) declararla pérdida y documentarlo.

**Mi recomendación: (b)** — es una fila de prueba; su valor está en que justifica `U3`, no en recuperarla.
Pero si resulta que es una persona real, cambia la respuesta: dímelo.

**RESPUESTA:**
Usa tu juicio, solo ten en cuneta que todos los leads tienen user id
**NOTAS:**

---

## N4 · ¿Quién lanzó las dos conversaciones de ayer a las 17:27? `[TÚ]`

**Contexto.** El 29/07 a las 17:27 y 17:28 (después de que cerraras la sesión) alguien lanzó el bot dos
veces desde el launcher, con el contacto `6a6a1ba0bc0a8c3c88a154ef` (`external_id`
`eu-west-1:d59e6f8e-17d7-…`). **No es el contacto de pruebas que teníamos documentado.** Las dos
conversaciones se abandonaron sin responder al menú.

**Por qué importa.** Si hay más gente probando el bot en el mismo workspace, cualquier medición nuestra
queda contaminada: no sabremos si un ticket que aparece lo provocó nuestra prueba o la de otro. Y con el
método "un solo cambio entre pruebas", eso invalida el método.

**Qué necesito:** ¿fuiste tú desde otra sesión/navegador? ¿Es otra persona? ¿Podemos acordar que hoy el
launcher lo toca solo una persona?

**RESPUESTA:**
Soy yo que las lance, no te preocupes
**NOTAS:**

---

## N5 · El workflow `distribuidor - usuario envia mensaje` sigue PAUSADO `[TÚ / TERCERO]`

**Contexto.** Es un workflow **de Intercom** (no de n8n — lo busqué y no existe en n8n), y se pausó el
28/07 intentando arreglar el problema del ticket. **No arregló nada** (el ticket ya existía antes) y sigue
pausado. Su estado live/paused no lo expone la API pública de Intercom, así que no lo puedo verificar yo.

**El problema.** Es el workflow que reparte los mensajes entrantes. Pausado, **no reparte los mensajes de
nadie en todo el workspace** — no solo los nuestros. Es un daño colateral que lleva dos días activo.

**Qué necesito saber:** ¿lo pausaste tú y lo puedes reactivar, o es de Adri/Fer y hay que pedírselo?

**Mi recomendación: reactivarlo hoy**, tenga o no que ver con nuestro problema. Y si estaba pausado desde
antes por otra razón, saber cuál.

**RESPUESTA:**
lo pause como solucion a parte de esos errores de ticket y correo, da igual es inutil ese esta en test y no afecta nada
**NOTAS:**

---

## N6 · El ticket type `Prueba Fer`: ¿pedimos que se archive? `[TERCERO — Fer]`

**Contexto.** Es el tipo de ticket con el que nacían las conversaciones el 28/07 y que rompió el turno 2.
Ayer no se reprodujo, pero **es configuración ajena que puede volver en cualquier momento** — y no
tenemos ni visibilidad ni control sobre cuándo cambia.

**Opciones:** (a) pedir a Fer que lo archive o le quite "customer-facing" mientras dure la Fase 2 ·
(b) pedir solo que nos avise si lo cambia · (c) no pedir nada y asumir el riesgo.

**Mi recomendación: (a), por escrito y hoy.** Es la única forma de que el suelo deje de moverse debajo de
las pruebas.

**RESPUESTA:**

**NOTAS:**

---

## N7 · El correo automático del estado `Submitted` `[TERCERO — Adri/Fer]`

**Contexto.** Cuando un ticket pasa a `Submitted`, Intercom envía al cliente un correo del tipo "hemos
recibido tu solicitud". Verificado el 28/07. Mientras eso siga activo:
- cualquier prueba que se convierta en ticket **manda un correo a una persona real**, y
- en producción, un usuario a mitad de conversación con el bot recibiría un correo de soporte que nadie
  pidió, diciéndole que le contestarán por otro canal.

**Opciones:** (a) pedir que se quite el email de esa plantilla mientras dure la Fase 2 · (b) convivir con
él y usar siempre un contacto de pruebas desechable · (c) nada.

**Mi recomendación: (a), y (b) mientras llegue.**

**RESPUESTA:**
Lo voy a desactivar, dime donde puedo hacerlo tipo donde buscarlo
**NOTAS:**

---

## N8 · ¿Seguimos solo en el workspace TEST? ¿Hay fecha de producción? `[TÚ]`

**Contexto.** Todo el trabajo va sobre el workspace de Intercom **TEST** (`q3bhdtoi`). Pero los dos
webhooks de n8n (`beckham-upsert-expediente` y el del agente) son **POST públicos, sin ninguna
autenticación, con paths adivinables**, y escriben en una tabla de Airtable con **datos reales de
empleados**. Hoy eso es una deuda; el día que esto mire a producción es un incidente.

**Qué necesito:** una fecha objetivo, aunque sea aproximada. Eso decide si `WP-203` (auth en los webhooks
+ paths a UUID + JWT en el Messenger) es "prerrequisito ordenado" o "lo primero después del
CONTENT-TYPE".

**RESPUESTA:**
Pues una vez que todo este montado en TEST, rpimero se monta tooodoen test y luego se envia a produccion
**NOTAS:**

---

## N9 · `Notificaciones_error`: ¿a dónde notifica y quién lo lee? `[TÚ]`

**Contexto.** Existe un workflow `Notificaciones_error` (`TXVWRUzc1G5HXHjZ`, activo). Eso es una buena
noticia: enchufar la red de errores de `beckham_bot` es **configuración, no construcción** (hoy
`beckham_bot` no tiene `errorWorkflow` configurado, así que un error de Airtable mata la ejecución en
silencio, sin responder a Intercom y sin avisar a nadie).

**Pero antes de enchufarlo:** ¿a dónde escribe? ¿Un canal de Slack? ¿Un email? ¿Y alguien lo lee?

**Por qué pregunto.** Un `errorWorkflow` que escribe en un sitio que nadie mira no es observabilidad, es
teatro: nos deja tranquilos sin cambiar nada.

**RESPUESTA:**
Vamos a crear uno desde 0, no enchufarlo al que existe, y a que errores te refieres? si son de dev que sea a slack y si es 
algun error de usuario o algo que falta o por ejemplo documentacion invalida o no se seria por email
**NOTAS:**

---

## N10 · ¿El bot debe escribir `AplicaBeckham`, `Status` o `Estado030149`? `[TÚ]`

**Contexto.** La tabla `Empleados` tiene 68 campos. El bot escribe 9. Entre los que **no** toca hay tres
que suenan a que quizá debería: `AplicaBeckham` (checkbox), `Status` (single-select) y `Estado030149`.
Nadie ha decidido nunca si el bot debe tocarlos. Cuando el bot cualifica a alguien, ¿debería marcar
`AplicaBeckham`?

**El riesgo de decir sí.** Esos campos los gobiernan otros procesos (formularios, revisión manual, la
automatización `wflo1oMmSWlcYsO3V`). Escribir en ellos nos convierte en un **segundo escritor** sobre
campos ajenos — que es exactamente el patrón que ya nos costó dos bugs en este proyecto.

**Opciones:** (a) no, el bot solo escribe sus 9 campos · (b) sí, marcar `AplicaBeckham` al cualificar ·
(c) crear un campo de estado propio del bot (`estado_bot`) y no tocar los ajenos.

**Mi recomendación: (a), y (c) si necesitas un estado.**

**RESPUESTA:**
Yo creo que solo tendria que modificar lo de aplica beckham ya que el ai agent sera el que cualifique a la persona , es decir
si vale la pena y si es caso facil o complejo, y tambien el bot tendria que rellenar unas plantillas con los datos perosnales que se le dan al bot
es decir, tiene que rellenar unos pdfs que seran los modelos 030, 149 con los datos colectados
**NOTAS:**

---

## N11 · ¿En qué idioma responde el agente? `[TÚ]`

**Contexto.** El público del régimen Beckham es, por definición, gente que acaba de trasladarse a España
desde otro país. Muchos no hablan español. La tabla tiene un campo `Idioma`. **El PRD de la Fase 2 no dice
absolutamente nada sobre el idioma del agente**, y hoy el prompt está escrito solo en español.

**Opciones:** (a) siempre español · (b) responder en el idioma en que escriba el usuario · (c) español e
inglés, y para el resto ofrecer humano.

**Mi recomendación: (c).** Cabe en el `prompt_base` sin tocar arquitectura, y cubre el caso real sin
prometer 30 idiomas que nadie va a revisar.

**RESPUESTA:**
yo haria que venga un mensajito en el prompt inicial que le diga que puede hablar en inges o escirbire en ingles
y seria en español e ingles y ya
**NOTAS:**

---

## N12 · ¿De dónde sale el `email` que guardamos? `[TÚ]`

**Contexto.** Nuestro contrato de datos escribe el campo `email` en Airtable **si llega en la petición**.
Pero revisando los Data inputs verificados del Data Connector, **ninguno lo aporta**. Es decir: hoy ese
campo probablemente nunca se rellena desde el bot.

**Opciones:** (a) añadirlo al DC como `People attribute` (el email del contacto de Intercom), opcional y
sin valor por defecto · (b) quitarlo del contrato y no guardarlo · (c) dejarlo como está (código muerto).

**Mi recomendación: (a).** Es gratis, y el email es el único dato con el que un humano puede identificar
una fila a ojo. Importante: **sin "fallback value"** — un valor de relleno sí sobrescribiría el email
bueno que ya estuviera guardado.

**RESPUESTA:**
Eso llega de intercom, asi que aplicariamos la a
**NOTAS:**

---

## N13 · Retención de datos personales en los logs `[TÚ / MANAGER]`

**Contexto.** Dos sitios acumulan datos personales:
1. Los **logs de los Data Connectors** de Intercom: 7 días (14 con extended logs).
2. Las **ejecuciones de n8n**: sin política declarada que yo sepa.

Y hay un conflicto directo: para poder depurar el agente (saber qué tools llamó y con qué datos) habría
que activar `returnIntermediateSteps`, y eso **vuelve a meter datos personales en los logs de n8n** — el
mismo problema que ya se corrigió recortando la respuesta del webhook.

**Opciones:** (a) activar la trazabilidad solo en pruebas y desactivarla en producción · (b) activarla
siempre y aceptar el dato en logs · (c) no activarla y depurar a ciegas.

**Mi recomendación: (a).**

**RESPUESTA:**
vale a, y lo de los datos personales da igual porque son cuentas de empresa con politicas de privacidad, todas las erramientas estan con cuentas
de emoresa 
**NOTAS:**

---

## N14 · Las dos preguntas de `WP-09` que llevan abiertas desde el 28/07 `[TÚ]`

**14.1 · La tool de datos del agente: ¿consulta Airtable, pregunta al usuario, o las dos?**
Cuando el agente necesita un dato del expediente (por ejemplo la fecha de alta), puede: consultarlo en
Airtable con `get_expediente`, o preguntárselo al usuario. Hoy el prompt asume que existe una tool
`guardar_datos_airtable` que **no existe**, y el agente promete guardar cosas que nadie guarda.
Opciones: (a) solo consultar · (b) solo preguntar · (c) **consultar primero y preguntar solo lo que
falte**.
→ **Rec: (c)** — es lo que evita el defecto que ya viste el 28/07: el agente volvía a pedir datos que ya
teníamos.

**14.2 · El reporte / informe: ¿quién lo recibe, cómo, cuándo, y qué lo dispara?**
El prompt menciona generar un informe, pero no hay contrato: no se sabe destinatario, formato, momento ni
disparador.
Opciones: (a) definirlo ahora · (b) **no montarlo en la Fase 2** y dejarlo declarado como pendiente.
→ **Rec: (b)** — un entregable sin destinatario definido no se construye.

**RESPUESTA:**
→ **Rec: (c)** — es lo que evita el defecto que ya viste el 28/07: el agente volvía a pedir datos que ya
teníamos.
(b) **no montarlo en la Fase 2** y dejarlo declarado como pendiente., ya que lo que haria la e agente sria relenar un odf y aun no
lo tengo y se envia al usuario al final del procedimiento total, como resguardo, este va a contener los datos que ha ido rellenando en interciom y n8n y unos deberes fiscales
y obligaciones ifscales que tiene que tener en cuenta
**NOTAS:**

---

## N15 · `WP-11` (método de triaje, acordado con Alina): ¿entra hoy? `[TÚ]`

**Contexto.** Hay un PRD esqueleto con las preguntas, pero las reglas de negocio del triaje nunca se
recogieron: hacen falta con Alina delante.

**Mi recomendación: no entra hoy.** No bloquea nada de la Fase 2 y necesita una reunión, no una sesión
técnica.

**RESPUESTA:**
Si porque ademas eso del triaje es lo del que se envia al agente de faq o que detecte que respondio lo del bot 
**NOTAS:**

---

## N16 · El tag `jarry_ignore` y tu ventana de disponibilidad de hoy `[TÚ]`

**16.1 · `jarry_ignore`.** Es el tag que silencia al bot Jarry para que no pise a nuestro bot. Se aplica al
inicio de `OnClick Mobility`. **Confirmar que sigue siendo obligatorio en toda rama nueva** y que lo
convertimos en criterio de aceptación.
→ **Rec: sí, y como criterio de aceptación explícito.**

**16.2 · Tu ventana de hoy.** Las reglas del proyecto son "un solo cambio entre pruebas" y "solo vale una
conversación real, no Preview". Además hay un **cooldown de 2 minutos por contacto** en los triggers de
Intercom. Eso significa que el cuello de botella de hoy **no es el código: eres tú delante del
Messenger**. Necesito saber en qué franjas estás disponible para hacer conversaciones reales, para
ordenar el trabajo y meter en los huecos lo que se puede hacer sin ti (curl, documentación, el mapa).

**RESPUESTA:**
Sigue siendo obligatorio, y para lo de las conversaciones hoy por la tarde 
**NOTAS:**

---

# Y por último: tus preguntas para mí

Dijiste que traías muchas preguntas acumuladas. Escríbelas aquí y las contesto todas antes de tocar nada:

**MIS PREGUNTAS:**

1. Asi es el formato de user id: eu-west-1:0dc0b2b7-f751-cab4-7769-04ed79ff0f45
2.
3.

---

*Fichero generado el 2026-07-30 en la sesión de la mañana. Nada se ha modificado en Intercom, n8n ni
Airtable: toda la información de este documento viene de lectura por MCP y de la documentación del repo.*
