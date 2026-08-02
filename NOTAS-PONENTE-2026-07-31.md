# Notas de ponente · Sesión Mobility · 31 de julio de 2026

> Acompañan a `presentacion-mobility-2026-07-31.html` (34 pantallas: 7 separadores de bloque + 27 de contenido).
> Navegación: flechas ← → , espacio, o clic en el tercio derecho. `Home` / `End` para saltar a los extremos.
> **Duración objetivo:** 50 minutos de exposición + 10 de preguntas.
>
> **Tres reglas que no se rompen al hablar:**
> 1. Distinguir siempre **diagnosticado** / **arreglado** / **arreglado y verificado en producción**.
> 2. Las facturas de la stack son **gasto de empresa, no del bot** — decirlo en la misma frase, siempre.
> 3. Cero datos personales en voz alta: ni correos, ni identificadores de usuario, ni nombres de clientes.

---

## Bloque 0 · portada

**Pantalla 1 · «El bot ya guarda. Y hoy sabemos exactamente qué falta.»**
- Abrir con el titular, no con la agenda: «Traigo dos noticias. La primera es que el bloqueo que llevaba semanas parado se resolvió esta mañana y está verificado contra el sistema real. La segunda es que sé exactamente qué falta, y una parte no es nuestra.»
- Anunciar la regla de honestidad de entrada: «Voy a decir en cada cosa si está diagnosticada, arreglada, o arreglada y verificada. No son lo mismo y en este proyecto confundirlo ya nos ha costado días.»
- Prometer el cierre: «Al final os pido cinco cosas concretas, con nombre.»

---

## Bloque 1 · por qué existe este proyecto

**Pantalla 2 · separador**
- «Tres diapositivas para dejar una sola idea. Lo que vendemos aquí no es una conversación: es un plazo que nadie te recuerda.»

**Pantalla 3 · el régimen vale seis años de ahorro**
- Leer los cuatro números y parar: 24 % fijo, hasta 600.000 €, seis ejercicios. «Frente a la escala progresiva del IRPF, eso es mucho dinero para el perfil de cliente que tenemos.»
- Señalar explícitamente el bullet gris: no hay estadística pública de la AEAT sobre cuántos modelos 149 se presentan al año. «Es un número que alguien pregunta de dónde sale, así que no lo doy. Está marcado como dato pendiente.»

**Pantalla 4 · el plazo de seis meses**
- Las tres palabras son el guion: corto, silencioso, improrrogable. Detenerse en «silencioso»: «Nadie le avisa. No hay carta, no hay recordatorio oficial, no hay aviso en la app. Y el trámite que arranca el reloj —el alta en la Seguridad Social— el cliente no lo asocia con Hacienda.»
- Cerrar con el argumento de negocio que ya validó el equipo: son clientes que ya pagan desde 300 €/año, así que avisarles de su propio plazo es asesoramiento, no comunicación comercial.

**Pantalla 5 · el plazo es el producto**
- Contrastar las dos tarjetas en voz alta y explicar por qué importa: «Si esto fuera un chatbot de soporte, mi prioridad estas semanas habría sido que hablase mejor. Como es un producto de plazo, mi prioridad ha sido que **guarde**.»
- «Esa es la razón por la que todo el trabajo reciente parece invisible: iba a la persistencia.»

### ❓ Pregunta más probable del bloque 1: «¿Esto no es un caso de uso muy de nicho para tanto esfuerzo?»
> «Es de nicho en volumen y de altísimo valor por cliente. El escenario que fijó el equipo son 500 a 1.000 clientes al año a partir de 300 € — del orden de 225.000 € de ingreso anual gestionado. Y lo que evita no es una molestia: es que un cliente pierda seis años de régimen por un plazo del que nadie le avisó. Cuántos solicitantes hay en España en total no lo sé y no lo voy a estimar: no hay estadística pública.»

---

## Bloque 2 · dónde estábamos

**Pantalla 6 · separador**
- «Sin dramatizar y sin adornar. Lo que costó caro, y la regla que nos dejó.»

**Pantalla 7 · el bot hablaba pero no guardaba nada**
- Ser directo con el 100 %: «Hasta esta mañana, cada vez que el bot intentaba dejar un expediente en Airtable, la petición se rechazaba entera. Cero filas escritas.»
- Explicar el efecto de embudo: no era un fallo entre muchos, era **el** fallo. Diez paquetes de trabajo esperando lo mismo, y quince líneas de código en medio.
- Mencionar la lección de método: en n8n «ejecución correcta» no significa «funciona» — hubo cinco ejecuciones marcadas como correctas con el circuito roto.

**Pantalla 8 · el aprendizaje más caro (cinco días, cinco hipótesis)**
- Contarlo como historia, sin jerga. La analogía del recado: «Le pides a una pieza de Intercom que nos pregunte algo. Nos lo pregunta y se trae la respuesta. Pero esa respuesta se la queda **en su bolsillo**: dos pasos más adelante, en otra rama del flujo, ese dato no existe. Y no da error — llega vacío.»
- Enumerar las cinco hipótesis muertas para que se entienda el coste: formato, tipo, operador, configuración del campo, orden de los pasos.
- El experimento que lo cerró es el momento clave de la charla: cambiar la condición a «¿tiene algún valor?». Siguió fallando, y con eso murieron de golpe todas las hipótesis sobre *qué* valor era.

**Pantalla 9 · la regla: «¿hay algo?» antes de «¿es correcto?»**
- «Un fallo por ausencia se disfraza de fallo por formato. El formato tiene infinitas hipótesis; la ausencia tiene una. Preguntar primero por la ausencia es gratis.»
- Aterrizarla en la práctica: un cambio, una prueba, y nada se da por bueno sin evidencia en el sistema real.
- Anunciar el corolario que se va a ver dos diapositivas más adelante: cuando le preguntas lo correcto a la herramienta, la herramienta te da la respuesta.

### ❓ Pregunta más probable del bloque 2: «¿Por qué ha tardado tanto?» *(también en la lista obligatoria — respuesta larga abajo)*
> Ver la sección **«Las cuatro preguntas obligatorias»** al final. Resumen para decir aquí: «Porque el fallo era invisible y silencioso, y porque tres piezas de esto no son nuestras. El día que dejamos de adivinar y empezamos a medir, cinco bloqueos cayeron en una mañana.»

---

## Bloque 3 · qué hemos superado hoy

**Pantalla 10 · separador**
- «Cinco diapositivas. Cuatro de cosas cerradas y verificadas contra el sistema real, y una —obligatoria— de lo que sigue abierto.»

**Pantalla 11 · el bot ya guarda**
- La analogía del sobre es la única explicación que hace falta: «Intercom nos mandaba los datos en un sobre que nuestro sistema no sabía abrir. El contenido estaba bien; el envoltorio, no. Nuestro lado miraba dentro del sobre, no encontraba nada y rechazaba la petición entera.»
- Insistir en el estado: **arreglado y verificado en producción**. 20 comprobaciones automáticas lanzadas contra el sistema real, no contra una simulación.
- Cerrar con el efecto de cadena: se desbloquean de golpe las cuatro ramas de captura y los seis paquetes de la Fase 2.

**Pantalla 12 · ya no puede inventarse categorías**
- Esta es la que más interesa a Alina e Iciar: hablar de su tabla. «Antes, si el bot escribía el motivo de descarte con una errata de una letra, la base **creaba una opción nueva en silencio** en el desplegable. Sin error, sin aviso, en la tabla real con datos reales.»
- La verificación es la parte buena y hay que decirla así: «No me creí que funcionara: conté las opciones antes y después de lanzarle una errata a propósito. Eran 4 y siguen siendo 4.»
- Declarar el dato pendiente sin esconderlo: qué campo escribe exactamente cada punto del flujo es hoy una **propuesta**, no una decisión cerrada. Lo verificado son los 4 motivos y los 6 puntos.

**Pantalla 13 · tres cierres más**
- Ir tarjeta a tarjeta rápido, y detenerse en la del medio: «Es la única vez en este proyecto que medir algo ha **quitado** trabajo del plan en lugar de añadirlo.»
- La tercera tarjeta interesa especialmente a Paula: «El agente recibía literalmente el texto "fecha de hoy" sin resolver. Hablaba de un plazo improrrogable **sin saber qué día era**. Hoy, en el mensaje que salió al modelo, se lee "Fecha de hoy: 31/07/2026".»

**Pantalla 14 · los tickets que se abrían solos**
- Contarlo como el thriller que fue: el síntoma era que cualquier conversación acabase convertida en un ticket de pruebas, y ese ticket **mandaba un correo al cliente**.
- El giro es de método: «Intenté archivar ese tipo de ticket, y al hacerlo **Intercom me dijo qué tres bots lo estaban usando**. La herramienta tenía la respuesta desde el principio; lo que faltaba era preguntarle lo correcto.»
- Y la parte honesta que hay que decir sin que nadie la pida: durante dos días dijimos «el síntoma no se reproduce». No había cambiado nada en el sistema — **el workflow culpable estaba pausado por nosotros mismos**. La precondición de la prueba y el bug eran el mismo objeto. Además se tocaron tres cosas a la vez, así que la causa no está aislada al 100 %.

**Pantalla 15 · tres estados, no dos**
- Esta pantalla es la que compra credibilidad para todo lo demás. Recorrer las tres columnas de izquierda a derecha, no al revés.
- **Turno 2 (diagnosticado):** «Hoy el cliente puede tener **un** intercambio con el agente. Un segundo mensaje no llega. La causa raíz apareció hoy con la cita literal que el propio sistema deja en la conversación: ese workflow de reparto sale "sin haber distribuido el mensaje a ningún agente", y **nada vuelve a llamar al agente**. No es un misterio, es un hueco de diseño localizado, y el arreglo está identificado.»
- **La regresión (arreglado y revertido):** contarla voluntariamente. «Un cambio mío de hoy rompió la escritura: al cerrar del todo la validación, la base empezó a rechazar las fechas. Se revirtió en minutos, se reverificó, 20 de 20 otra vez en verde, **cero datos dañados**. Lo cuento porque es el método funcionando: una prueba por cambio.»
- El aprendizaje vale más que el incidente: una opción de configuración que parecía decorativa estaba **sosteniendo** el formato de las fechas. El plan la trataba como un cambio suelto de una línea; eran dos cambios acoplados.

### ❓ Pregunta más probable del bloque 3: «Entonces, ¿ya funciona o no?»
> «Depende de qué parte, y por eso insisto en los tres estados. **La cañería de datos funciona y está verificada**: escribe, no duplica, valida y no puede corromper la tabla, con 20 comprobaciones en verde contra producción. **La conversación de varios turnos no funciona todavía**: la causa raíz se encontró hoy y el arreglo está identificado, pero es construir en Intercom y no cabía hoy. Si mañana enchufásemos esto a un cliente real, guardaría bien su expediente y le respondería una vez. Eso no es el producto que hemos acordado.»

---

## Bloque 4 · qué decidimos ayer

**Pantalla 16 · separador**
- «46 de 47 decisiones cerradas en una mañana. Seis de ellas reescriben el plan, y dos lo hacen **más pequeño**.»

**Pantalla 17 · 46 de 47, y dos quitan trabajo**
- Empezar por el agradecimiento operativo: «Esa mañana desbloqueó más plan que cualquier semana de código.»
- **Follow-up en Airtable:** «La automatización de los avisos vive en Airtable y la montan Alina e Iciar, que son las expertas. Nuestro trabajo se reduce a que el dato llegue completo de Intercom a Airtable. Eso **cancela un bloque de trabajo entero** y toda su cadena.»
- **El corpus es el prompt de Paula:** «No hay que escribir un documento nuevo ni construir un buscador de documentos. Desaparece esa pieza y su coste, y el paquete pasa de grande y bloqueado a pequeño y desbloqueado. Es el cambio que libera el camino crítico.»

**Pantalla 18 · seguridad por topología**
- Plantear la tensión primero: «Se pidió que el mismo agente atienda las preguntas y la solicitud. Y hay un requisito duro: quien solo está preguntando dudas no debe poder provocar que le creemos o modifiquemos un expediente. Las dos cosas chocaban.»
- La solución en una frase: «Dos puestos del mismo agente. Mismo modelo, mismo prompt, misma identidad. Al puesto de preguntas **no le llega el cable de escritura**. No es que no quiera escribir: no puede.»
- El titular que hay que dejar caer despacio: «Con esto, "el modo preguntas no puede escribir" pasa de ser una promesa del prompt a ser una **comprobación mecánica** que se hace contando conexiones. Y la letra pequeña la declaro por escrito: las capas 2 y 3 protegen contra errores de cableado; la defensa independiente es la topológica.»

**Pantalla 19 · todos full VIP**
- El par simplifica/encarece: «Que todos lleguen logueados y full VIP nos ahorra una capa entera de complejidad, porque el identificador existe siempre. Pero también significa que **cada fallo le pasa a un cliente que ya paga**. No hay ni un usuario anónimo al que perder sin consecuencias.»
- La fila del triaje interesa al manager: detectar cambio de tono y pasar a una persona deja de ser una reunión pendiente y pasa a ser una regla construible. Anticipar que en el bloque 7 le pido el plazo.

**Pantalla 20 · alcance nuevo**
- Presentarlo como decisión aceptada, no como queja: «Ayer se aceptó alcance que no existía en ningún plan: rellenar los modelos 030 y 149 y entregar un PDF-resguardo al cliente.»
- Los dos avisos hay que decirlos hoy, no en septiembre: **(1)** esos modelos tocan campos que ya gobierna otro proceso, y escribir ahí nos convierte en segundo escritor — el patrón que ya costó dos errores; **(2)** las plantillas **no existen todavía**.
- Enlazar con el cierre: «Por eso este bloque va al final del plan y con la firmeza más baja de los tres hitos. Y por eso la última frase de la presentación es la que es.»

**Pantalla 21 · revisar el prompt**
- **Tono: es una victoria del proceso, no un reproche.** Decirlo literalmente: «Esto no es un descuido de Paula. Son contradicciones que solo aparecen cuando cruzas un texto con decisiones que se tomaron **después** de escribirlo.»
- La importante es de negocio y hay que darle peso: «Quien todavía no está de alta en la Seguridad Social se estaba tratando como **descartado**. Y la decisión de ayer dice exactamente lo contrario: es un lead que hay que conservar y al que hay que avisar cuando se acerque su plazo. Eso es el corazón del producto, y lo habríamos perdido en silencio.»
- Cerrar el marco: «El contenido fiscal es de Paula; cruzarlo con las decisiones de producto es mi trabajo. Por eso el prompt está versionado en el repositorio.»

### ❓ Pregunta más probable del bloque 4: «¿Y si Paula cambia el prompt otra vez, se rompe todo?»
> «No se rompe, pero hay que revisarlo, y ese es justamente el proceso que ayer demostró que hace falta. El prompt está versionado en el repositorio, así que puedo ver exactamente qué cambió entre dos versiones. Y hay una comprobación fija antes de publicar cualquier versión nueva: que el prompt no prometa ninguna acción que el agente no tenga conectada, porque hoy mismo prometía tres que no existían. Lo que pido es que las versiones nuevas me lleguen a mí antes de ir al sistema, no después.»

---

## Bloque 5 · la arquitectura

**Pantalla 22 · separador**
- «Cuatro diapositivas, cero jerga. Tres piezas, cada una con un trabajo, y un contrato entre ellas que se puede comprobar.»

**Pantalla 23 · tres límites**
- Usar la analogía y repetirla: «Intercom es el mostrador de recepción. n8n es el despacho donde se piensa y se decide. Airtable es el archivador.»
- El remate: «La recepción no rellena expedientes y el archivador no opina. **Cada vez que en este proyecto hemos cruzado esa línea, hemos pagado un error.**»
- Señalar el cambio de ayer en el carril de Airtable: el follow-up vive ahí, con dueñas.

**Pantalla 24 · un solo escritor**
- Una frase y una prueba: «Solo una pieza en todo el sistema puede escribir en la ficha del cliente. Todo lo demás le pide a ella que escriba.»
- La prueba es una ficha real: «Tenemos una ficha que dice a la vez "está de alta", "está descartado" y "tiene fecha prevista de alta". Es un estado imposible, y es lo que pasa cuando dos piezas escriben el mismo campo. La conservamos a propósito como caso de prueba.»
- Declarar lo que falta: la comprobación de duplicados. Hoy el identificador de cliente **no es único** en la tabla porque los formularios no lo rellenan.

**Pantalla 25 · el agente no recuerda nada**
- La analogía del asesor nuevo funciona bien con público no técnico: «En cada turno es como un asesor nuevo al que le entregas la carpeta completa antes de que hable. Responde, y se olvida.»
- Vender la ventaja: «No hay un estado escondido que se pueda desincronizar. Si algo va mal, está en la carpeta y se puede leer.»
- El bullet gris es de coste, no de diseño: si el historial crece sin techo, la carpeta crece en cada turno. El corte de contexto estaba planificado por calidad y resulta que también evita que el coste crezca de forma no lineal.

**Pantalla 26 · invariantes como criterios de aceptación**
- Definir «invariante» en una frase antes de leer la lista: «Una frase que tiene que ser verdad siempre y que **se puede comprobar**. La diferencia con una buena intención es que tiene una prueba asociada, y sin esa prueba en verde el trabajo no cuenta como terminado.»
- Cerrar el bloque con la regla de evidencia: «Cada paquete marcado como hecho en el mapa de hoy lleva su evidencia citada: conversación real —no una simulación— y su ejecución correlativa. Si no la lleva, no está hecho.»

### ❓ Pregunta más probable del bloque 5: «¿No es demasiada arquitectura para un bot?»
> «Es la arquitectura mínima que hace que los errores sean **localizables**. Todos los errores caros de este proyecto han sido de límite: un dato que no cruzaba de un camino a otro, dos piezas escribiendo el mismo campo, una constante de negocio metida en la recepción. No es arquitectura por gusto: es la lista de las cosas que ya nos han salido mal, convertida en reglas con prueba. Y en coste no añade nada: n8n cobra por ejecución, no por número de piezas.»

---

## Bloque 6 · costes y dimensionamiento

**Pantalla 27 · separador**
- «Tres capas, en este orden: el marco de escala, la escasez medida y la decisión económica. Y con lo que no sabemos declarado en la propia diapositiva.»

**Pantalla 28 · la base ya es cara — y NO es coste del bot**
- **Decir el aviso ANTES de decir la cifra.** Literalmente: «Voy a dar un número grande y quiero blindarlo primero: esto es gasto de uso general de **toda** la empresa en las tres herramientas del stack. **No es coste del proyecto Beckham.** Presentarlo como coste del proyecto lo infla en dos órdenes de magnitud.»
- Después la cifra: 151.717 € documentados, de los que 130.324 € (85,9 %) siguen pendientes de recibir.
- El detalle que favorece a nuestra arquitectura: «n8n, que es donde vive **toda** la lógica del bot, es la partida más pequeña de las tres. La orquestación es la parte barata.»
- Declarar el dato pendiente: el total no es un gasto mensual, las tres partidas cubren periodos distintos, y el gasto mensual normalizado por proveedor es desconocido.

**Pantalla 29 · el presupuesto ya se está cruzando**
- «Esto sí es dato medido, no estimación: el presupuesto de OpenAI está configurado en 2.000 $ al mes, y julio va por 11.632,54 $. Es 5,82 veces por encima. La barra del panel sale en naranja.»
- El mensaje en una frase, y repetirlo: **queremos bajar el coste, no subirlo.** «El bot no es una línea nueva de gasto: es la alternativa barata a una que sí lo habría sido.»
- Declarar la discrepancia como fuerza, no como debilidad: «Y aquí hay algo que no cuadra y prefiero decirlo yo: las facturas de OpenAI de julio suman unos 71.335 € y el panel de consumo dice 11.632,54 $. Una sola factura es el 99,4 % de julio, así que lo más probable es que sea un compromiso anual y no consumo del mes. **Está sin confirmar.** No convierto de euros a dólares en voz alta porque no tengo el tipo de cambio aplicado.»
- Si alguien insiste: **«lo estamos confirmando»**. Se cierra abriendo el detalle de líneas de esa factura.

**Pantalla 30 · la decisión económica**
- «Construir el agente nosotros en vez de usar el agente del proveedor ahorra entre 950 y 9.950 $ al año a 1.000 clientes. El motivo no es técnico: **ellos cobran por resultado y nosotros pagamos por uso.**»
- El detalle que remata el argumento: «Y su resultado más caro, a 9,99 $, es justamente "cualificar leads" — que es literalmente lo único que hace este bot. Si esto se hubiera montado sobre su agente, habríamos entrado por la vía más cara de su tarifa.»
- La medición real de hoy, presentada como lo que es: «Tengo **una** medición instrumentada de verdad, de hoy: una conversación real consumió 8.363 tokens de entrada y 55 de salida con un modelo mini. Es el primer dato medido del proyecto y sostiene que el coste de tokens es de dos cifras de dólares al año. **Todo lo demás de esta diapositiva son escenarios, no mediciones**, y lo digo explícitamente.»
- No esconder el precio del ahorro: «Ese ahorro se paga en horas de ingeniería. Su producto funciona el día 1; el nuestro lleva semanas. El ahorro es real, pero no es gratis.»
- Y el techo que no se compra: 5 peticiones por segundo por base en Airtable, igual en todos los planes, y **compartido con otra automatización ajena** de la misma base. Enlazar con la red de avisos de error, que es una de las piezas que faltan.

### ❓ Pregunta más probable del bloque 6: «¿Cuánto nos cuesta esto al mes?» *(también en la lista obligatoria — respuesta larga abajo)*
> Ver **«Las cuatro preguntas obligatorias»**. Resumen: el coste variable del bot es de dos cifras de dólares **al año**; las facturas grandes son de empresa y no del bot; y las herramientas ya se pagan por otras razones.

---

## Bloque 7 · hacia dónde vamos

**Pantalla 31 · separador**
- «Tres hitos, y los presento con **firmeza distinta a propósito**: uno es un hecho, uno es un compromiso y uno es una estimación con dependencias de terceros.»

**Pantalla 32 · un hecho, un compromiso y una estimación**
- **Hecho (hoy):** «"El bot guarda" era un hito planificado para la semana que viene y su parte comprobable **ya está cumplida**: la cañería escribe, no duplica, valida y no puede corromper la tabla, con 20 comprobaciones automáticas. Es un hecho, no una promesa.»
- Nombrar las tres piezas que quedan de esa cañería sin adornar: la guarda de duplicados, la red de avisos de error —bloqueada porque no puedo leer qué credenciales existen en el sistema— y **el turno 2**, que es el que convierte esto en un bot conversacional de verdad.
- **Compromiso (28 de agosto):** MVP conversacional, sin los documentos oficiales. «Es un compromiso, y va condicionado a las vacaciones de agosto. Lo digo yo antes de que lo pregunte nadie.»
- **Estimación (octubre):** alcance completo. «Va con menos firmeza a propósito: depende de plantillas que todavía no existen y de campos que gobierna otro proceso. Es una estimación con dependencias de terceros, no una fecha firmada.»
- Explicar por qué el turno 2 es el hito real: «Hasta que un segundo mensaje llegue solo al agente, esto es un formulario conversacional, no un bot con el que se conversa.»

**Pantalla 33 · peticiones concretas**
- Ir fila a fila mirando a la persona. No dejar ninguna como «alguien debería».
- Al manager: el SLA exacto de Ops_Mobility. «El mecanismo se construye igual, no espera; lo que necesito es el **texto** que el bot le dice al cliente. Y hay urgencia: hoy hay un mensaje vivo que promete "un compañero te escribirá" y **no asigna la conversación a nadie**. Es una promesa falsa que ya se está enviando.»
- El tipo de ticket de pruebas: «Es la **única de las 47 decisiones que sigue sin respuesta**. Está arreglado por otra vía, pero la pieza que lo permitía sigue ahí y puede volver sin avisar.»
- A Alina e Iciar: el esquema final del campo de complejidad. Yo propongo tres valores; la decisión de esquema es suya.
- A Alina: dónde vive la calculadora. No urgente, pero bloquea el enlace final de la rama de más intención comercial.
- Al dueño del workflow de reparto: **dos avisos, no uno.** Le hemos quitado un paso, para que no lo reponga sin hablar; y su rama de «no distribuido» es un callejón sin salida silencioso. Añadir el dato incómodo: ese workflow **está tocando conversaciones del bot**, no solo las de soporte, porque ninguna de sus ramas comprueba la etiqueta que marca las nuestras.

**Pantalla 34 · cierre**
- Leer la frase entera, despacio, y **no seguir hablando después**. Es la única diapositiva en la que conviene el silencio.
- Si hace falta enmarcarla: «Lo digo hoy, con el alcance recién acordado y con margen para replanificar, y no en septiembre cuando la fecha ya no dé.»
- Cerrar con la síntesis de una línea: «El bot ya guarda. El resto es un plan con tres hitos de firmeza distinta y cinco peticiones con nombre.»

### ❓ Pregunta más probable del bloque 7: «¿El 28 de agosto es realista con las vacaciones?»
> «Es un compromiso condicionado, y por eso lo he separado del hito de hoy. Lo que sostiene la fecha es que el bloqueo estructural cayó esta mañana y que dos decisiones de ayer **quitaron** trabajo del plan: el follow-up se va a Airtable y el corpus fiscal ya existe. Lo que la pone en riesgo son tres cosas concretas, y ninguna es capacidad: el turno 2 se construye en Intercom, la red de avisos de error necesita que alguien me diga qué credenciales existen, y necesito una persona delante del chat para tres pruebas que no se pueden hacer sin navegador. Si alguna de esas tres se atasca más de una semana, os lo digo en cuanto lo sepa, no el 27 de agosto.»

---

# Las cuatro preguntas obligatorias

## 1 · «¿Por qué ha tardado tanto?»

> «Tres razones, y ninguna es que el trabajo fuera mucho.
>
> **Una:** el fallo principal era **invisible y silencioso**. Los datos llegaban en un envoltorio que nuestro lado no sabía abrir, y el síntoma era un rechazo genérico, no un mensaje que dijera qué pasaba. Otro fallo anterior era peor: el dato simplemente **llegaba vacío** en lugar de dar error. Eso son cinco días y cinco hipótesis muertas, y la hipótesis que lo cerró fue dejar de preguntar si el dato era correcto y preguntar si **había** dato.
>
> **Dos:** tres de las cuatro piezas de este sistema **no son nuestras**. El bloqueo de los tickets lo causaba un workflow ajeno de reparto de mensajes que convertía cualquier mensaje del cliente en un ticket de pruebas y le mandaba un correo. Ese tipo de fallo no se arregla con más horas: se arregla encontrando de quién es.
>
> **Y tres:** trabajamos contra una base con **datos reales de empleados**, no contra un entorno de pruebas. Eso obliga a un cambio por prueba y a verificar todo, y hoy mismo eso ha evitado un problema: un cambio mío provocó una regresión y se revirtió en minutos con cero datos dañados.
>
> El dato que enmarca la respuesta: **el 30 de julio se cerraron 46 de 47 decisiones abiertas en una mañana, y el 31 cayeron cinco bloqueos.** El proyecto no ha ido lento de forma uniforme: estuvo atascado en un punto concreto, y en cuanto ese punto se desatascó, el plan se movió de golpe.»

## 2 · «¿Esto se puede usar ya con clientes reales?»

> «No, y quiero ser preciso sobre qué falta, porque no es todo.
>
> **Lo que ya está listo y verificado:** la parte de datos. El bot guarda el expediente, no crea fichas duplicadas, valida el identificador y no puede corromper la tabla. Eso son 20 comprobaciones automáticas en verde contra el sistema real, no contra una simulación.
>
> **Lo que impide abrirlo:** tres cosas. **Una**, el cliente solo puede tener **un** intercambio con el agente; un segundo mensaje no llega. Es el hueco cuya causa raíz encontramos hoy. **Dos**, no hay red de avisos de error: si algo falla, hoy nadie se entera y podemos perder un expediente sin traza. **Tres**, los dos puntos de entrada de datos no tienen autenticación y las direcciones son adivinables — es requisito del salto a producción, no algo opcional.
>
> **Y una cosa que hay que arreglar antes de abrirlo a nadie:** hay un mensaje vivo que le dice al cliente "un compañero te escribirá" y **no asigna la conversación a nadie**. Eso se arregla en el MVP del 28 de agosto.»

## 3 · «¿Cuánto nos cuesta esto al mes?»

> «Hay que separar dos cosas que se confunden mucho, y la confusión infla el número por cien.
>
> **El coste variable del bot es de dos cifras de dólares AL AÑO.** No al mes: al año. En el escenario alto de 1.000 clientes anuales, el modelo de lenguaje cuesta del orden de 46 $ al año con el modelo bueno, y menos de 10 $ con uno mini. Las ejecuciones de automatización consumen un 17 % del plan más pequeño de n8n, que cuesta 24 € al mes y que **ya se paga por otras razones**. El bot **no consume asientos** de Intercom.
>
> **Lo que sí es caro es la base sobre la que construimos, y eso es gasto de TODA la empresa, no del bot.** Hay 151.717 € documentados en las tres herramientas, de los que 130.324 € siguen pendientes de recibir, y el presupuesto de OpenAI está configurado en 2.000 $ al mes con un gasto de julio de 11.632,54 $ — 5,82 veces por encima. **Eso no lo genera este proyecto**, y presentarlo como coste del bot lo infla en dos órdenes de magnitud.
>
> Por eso el argumento es de eficiencia: sobre una base que ya es cara, **este bot es la opción que baja el coste, no la que lo sube.** Construir el agente nosotros ahorra entre 950 y 9.950 $ al año frente a usar el agente del proveedor, porque ellos cobran por resultado y su resultado más caro, a 9,99 $, es justamente cualificar leads — que es lo único que hace este bot.
>
> Y la honestidad que va con esto: **casi todo lo anterior son escenarios.** Tengo **una** medición real, de hoy: 8.363 tokens de entrada y 55 de salida en una conversación real. Instrumentar esto bien está planificado, y la próxima conversación sobre coste la tendremos con datos medidos.»

## 4 · «¿Qué pasa si Intercom vuelve a cambiar algo?»

> «Pasará, y el diseño ya está hecho contando con eso. Tres respuestas.
>
> **Una, dónde vive la lógica.** Intercom solo presenta y enruta: menú, botones y recogida de datos. **Cero cálculo y cero constantes de negocio.** Toda la lógica —fechas, plazos, veredictos, el agente— está en n8n, que es nuestro. Si Intercom cambia mañana, cambia la recepción, no el despacho. Y eso es una decisión reciente y deliberada: los datos de negocio los deduce nuestro lado a partir de un único dato que manda Intercom, que es por qué puerta entró la conversación.
>
> **Dos, no nos creemos lo que nos llega.** El sistema deduce el estado de la conversación **preguntándoselo a Intercom** en cada turno, en lugar de fiarse de lo que viene en la petición. Eso protege de dos cosas a la vez: de un cambio de formato y de una petición falsificada.
>
> **Tres, y es la respuesta más útil: nos enteraríamos.** Lo que ha hecho invisibles estos fallos durante semanas es que no había avisos ni pruebas automáticas. Hoy sí hay 20 comprobaciones que se lanzan en un comando y prueban el camino de datos completo, y la red de avisos de error es una de las tres piezas que faltan. Cuando esas dos estén, un cambio de Intercom pasa de ser cinco días de investigación a ser una prueba en rojo y un mensaje en Slack.
>
> Lo que **no** puedo prometer es que un cambio suyo no nos cueste tiempo. Lo que puedo prometer es que no nos costará **silencio**, que es lo que ha costado caro hasta ahora.»

---

# Anexo · reglas de sala

- **Si alguien pide una cifra de mercado total** (cuántas personas solicitan el régimen al año): «No la tengo y no la voy a estimar. No hay estadística pública de la AEAT en las fuentes consultadas, y es el tipo de número que alguien pregunta de dónde sale.»
- **Si alguien atribuye las facturas al proyecto:** corregir en el momento, con la frase preparada: «Ese gasto es de uso general de toda la empresa; el coste variable del bot es de dos cifras de dólares al año.»
- **Si alguien pregunta la causa de la discrepancia de OpenAI:** «Lo estamos confirmando.» No afirmar «compromiso anual» — es hipótesis.
- **Si alguien pide una demo en vivo:** decir que no. Hay un cooldown de dos minutos entre pruebas en el chat y el turno 2 no funciona; una demo enseñaría justo el hueco. Ofrecer en su lugar la batería de 20 comprobaciones, que se lanza en un comando y sí demuestra lo que se afirma.
- **Nunca en voz alta:** correos, identificadores de usuario, nombres de clientes, ni identificadores técnicos de flujos, ejecuciones o registros. No aportan nada a este público.
