# Prompt para Claude Design · regenerar SOLO el diagrama 07 · 26/08/2026

> Pégalo entero. Está escrito para ejecutarse sin más preguntas.

---

Necesito que rehagas **un solo archivo de imagen** de la documentación de un proyecto real de
automatización fiscal. Existe y está desactualizado: la escalera de estados que dibuja tenía **doce
peldaños y ahora tiene trece**.

## Dónde se guarda (exacto, no lo cambies)

```
proyecto-mobility/assets/diagramas/07-escalera-status.png
```

El README lo referencia con esa ruta relativa. Si cambias el nombre, la imagen deja de aparecer.
**Mismo nombre, misma ruta**, para que al hacer push sustituya al viejo.

## El lenguaje visual, que ya me vale y hay que mantener

Diagrama Mermaid renderizado a PNG, fondo blanco. Cajas azules para lo de Intercom, rosas para n8n,
verde agua para Airtable, amarillo anaranjado para destinos externos, y un badge morado redondeado
con el número del diagrama arriba a la izquierda junto al título en negrita. Subgrafos con relleno
amarillo pálido cuando agrupan por sistema.

Requisitos duros, que en la tanda anterior fallaron:

1. **Ninguna etiqueta recortada.** Si un texto es largo, ensancha la caja o pártelo en dos líneas,
   pero no lo cortes. En la versión vieja se leían cosas como «Cliente en el Messenge».
2. **Reparte el peso.** Que no quede todo pegado a un lado con la mitad vacía.
3. **Sin aristas que se cruzen sin necesidad**, y ninguna etiqueta de arista encima de otra caja.
4. **Legible en GitHub**: se ve a ~900 px de ancho en el README. Exporta a **~2000 px de ancho** y
   no bajes de **14 px** de tipografía efectiva.

Fondo claro. Español de España. Sin emojis decorativos salvo los que ya se usan como iconos.

---

# QUÉ TIENE QUE DECIR EL DIAGRAMA

Es la columna `Status` de una tabla de Airtable llamada `Empleados`. Cada fila es el expediente de un
cliente, y esa columna **no es informativa: es el disparador de todo el sistema**. Los trece peldaños,
en vertical y en este orden exacto, con los nombres tal cual:

| # | Peldaño | Quién lo escribe | Cuándo |
|---|---|---|---|
| 1 | `1. Interesado` | **el bot** (nodo `Decidir_Status`) | al arrancar la conversación |
| 2 | `2. Pte agendar llamada` | **automatización** `1. Envio mensaje agendar llamada` | al crearse la fila, y **solo si `Empresa` no es `TaxDown`** |
| 3 | `3. Pendiente llamada TD` | **el bot** | **AL OFRECER** la llamada, sin esperar a que el cliente confirme |
| 4 | `4. Pte hacer informe` | **el bot** | al cerrar con «Expediente completo». **DISPARA LOS DOS ENTREGABLES** |
| 5 | `5. Informe enviado` | **generador** `beckham_informe_mobility` | cuando el PDF ya está subido y comprobado |
| 6 | `6. Pte formulario usuario` | *nadie* | — |
| 7 | `7. Pte hacer TD` | *nadie* | — |
| 8 | `8. Pte confirmación usuario` | **automatización** `1. Envio borradores 030 y 149` | al mandarle los borradores, y solo si venía de un peldaño más bajo |
| 9 | `9. Confirmado` | **automatización** `3. El cliente confirma los modelos` | cuando el cliente confirma por formulario |
| 10 | `10. Finalizado` | *nadie* | — |
| 11 | `11.Pendiente resolución` | *nadie* | — |
| 12 | `12. Concedido` | *nadie* | — |
| 13 | `13. Descartado` | **el bot** | si el caso se descarta, y solo si no iba ya avanzado |

## Las cinco cosas que tienen que quedar clarísimas

1. **LA ESCALERA SOLO SUBE.** Es la regla que sostiene todo: nadie escribe un peldaño si el actual ya
   es mayor. Sin eso, un expediente ya confirmado retrocedería y se perdería el rastro. Hazlo visible
   —una flecha ascendente que recorra la columna, o algo equivalente—, no una nota al pie.
2. **Concurren CUATRO escritores automáticos y además personas**: el bot, el generador del informe, y
   dos automatizaciones de Airtable, más un fiscal que puede moverlo a mano. Un color por **tipo** de
   escritor, con su leyenda.
3. **Cinco peldaños no los escribe nadie hoy: el 6, el 7, el 10, el 11 y el 12.** Márcalos apagados
   (gris, o contorno discontinuo). Son para el trabajo manual del equipo.
4. **El peldaño 4 es el único que dispara entregables.** De ahí salen las dos ramas que hay que ver
   sin leer: el **informe de memoria fiscal en PDF** para el cliente y el **fichero `.030`** para la
   sede electrónica de la AEAT. Los dos generadores corren cada 15 minutos y **filtran por el 4 O el
   5**, no por uno solo: si un fichero fallara, en el 5 sigue reintentando. Que se vea que los dos
   peldaños entran en esa ventana.
5. **El 3 se escribe AL OFRECER la llamada, no al confirmarla.** Es una decisión deliberada y
   contraintuitiva: así el fiscal ve el caso en su cola aunque el cliente no vuelva a escribir. El
   precio aceptado es que ve expedientes aún incompletos.

## Y un aviso que quiero dentro del diagrama, no fuera

El 26/08/2026 alguien insertó el peldaño 2 y Airtable **renumeró todos los de detrás**. El bot y los
dos generadores comparan **por nombre de opción**, no por id, y no hay alternativa técnica. Durante
unas horas los dos generadores corrieron **en vacío, en verde y en medio segundo**, sin que nada
fallara a la vista.

Quiero una nota destacada, tipo aviso, que diga en una línea: **renumerar o renombrar un peldaño de
esta columna es un cambio de contrato entre siete sitios, no un retoque cosmético.**

---

# CÓMO QUIERO QUE TRABAJES

1. Un solo archivo. Enséñamelo antes de darlo por bueno.
2. Si algo de arriba no te cuadra o te falta un dato, **pregúntame antes de inventarlo**: este
   diagrama va a la documentación que lee el equipo, y un peldaño mal atribuido manda a alguien a
   buscar el fallo al sitio equivocado.
3. No añadas peldaños, escritores ni flechas que no estén en la tabla de arriba.
