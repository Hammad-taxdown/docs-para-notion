# Prompt para la sesión de noche · 11/08/2026

Pégalo tal cual al abrir la sesión.

---

```
/spartax Sesión de noche de Beckham. Lee .spartax/log.md (entradas del 11/08), state.json y
.spartax/context.md antes de proponer nada.

Estado al cerrar la tarde:
- beckham_bot en versionId d09044fe, 51 nodos, 52 columnas, tool de 36 parámetros, prompt
  v7 con tag prod. Cero .item, typecast en true. Auth OFF a propósito: es lo ÚLTIMO.
- Se publicaron WP-238 (el Status depende de motivo_cierre) y WP-239 (ResumenBot = ficha +
  prosa) y NINGUNO está probado en conversación. Es la única deuda de verificación viva.
- Los 39 PRD y las 54 fichas del mapa están sincronizados: cero desfases.
- Quedan 38 paquetes. El modelo 030 se entrega como fichero .030 posicional, NO como PDF.

Voy a por el máximo esta noche. Trabajamos en este orden:

1. ONE-SHOT, todo lo que sale en 30 minutos o menos y no depende de nadie:
   - Verificar de una vez WP-238 y WP-239 con UNA conversación completa.
   - WP-237: la automatización del salto de Status 7 -> 8.
   - T041: comprobar de verdad que Airtable descarga el adjunto antes de que caduque la URL.
   - WP-234: la señal de complejidad del caso, que hoy se queda en la conversación.
   - WP-232: runbook e inventario.

2. RÁPIDAS, justo después: WP-220 (el corpus de Alina al prompt), WP-210, WP-215, WP-204.

3. MUST-DO, la cadena de las tools del agente, que acaba en el DC:
   WP-207 -> WP-208 -> WP-211 -> WP-218 -> WP-219, y luego WP-235, WP-236, WP-221,
   WP-222, WP-223, WP-224, WP-225, WP-226, y al final WP-06 (los DC).

4. PROD-DAY, todo el canvas y el auth juntos en un día, no a trozos:
   WP-216, WP-212 (+T052), WP-213, WP-214, WP-217, WP-227, WP-203 (auth, lo último de
   todo), WP-08 y WP-233.

Empieza por la auditoría por MCP de beckham_bot y dime si algo ha cambiado desde las 13:21.
Luego arranca por el 1 sin preguntarme entre tareas: modo autónomo hasta que algo falle
dos veces o toque una decisión de negocio.
```

---

## Lo que necesito de ti en algún momento de la noche

1. **¿Matamos `WP-209`?** La sonda desechable pierde sentido si el canvas ya es implementación
   directa en producción.
2. **¿Un `4.3 Confirmo el 030 pero necesito modificar el 149` cuenta como confirmado?** Bloquea
   `WP-237`. La fila de ICIAR está justo en ese caso.
3. **Segunda muestra `.030`**, mejor de alguien con dos apellidos y de otra provincia. Bloquea
   `WP-235`.

## Chuletas para el asistente

**Decisiones cerradas el 11/08 — no reabrir:** solo el 030 · el bot no toca la AEAT ni presenta ·
el cónyuge no se rellena · las causas son 107/103/105 · `{{paisOrigen}}` = `Nacionalidad` · el auth
es lo último · U2 autorizada y su premisa caducó · el canvas es producción directa.

**Lo que muerde:**
- `map.html` **no se regenera desde el frontmatter**. `/prd:map` lo destruiría. Backup:
  `map.html.bak-20260811`.
- La escalera de `Status` **solo sube**. Por eso el bot y las automatizaciones de Airtable conviven.
- Con `typecast: true`, un nombre de opción mal escrito **crea una opción nueva** en vez de fallar.
- En nodos de código, **nunca `$('X').item`**, siempre `.first()`.
- Campo nuevo = **tres sitios**: tool + validador + mapeo de Airtable.
- El prompt **solo se comprueba leyendo la traza** de una ejecución del agente.
- **No arrastrar a una publicación parches sin validar.** El v5 sin probar entró en el v6 y metió un
  bucle infinito en producción.

**Verificaciones pendientes declaradas:** WP-238 y WP-239 sin probar · el aviso de discrepancia de
fecha de alta sin probar · la cuarta marca de la posición 172 del `.030` sin identificar · la
cabecera `20250203` sin identificar.

**Deuda:** token de los webhooks quemado en la terminal, generar otro antes de producción ·
`Empleados-Grid view*.csv` con PII sigue en el historial de git · si el cliente no contesta al
«¿alguna duda?» la conversación se queda abierta para siempre · peldaños 4, 5 y 6 del `Status`
huérfanos · comentario obsoleto en las líneas 338-339 de `Validar y Normalizar`.

**Y lo de siempre: recordarle que tiene una pregunta importante que hacerme.**
