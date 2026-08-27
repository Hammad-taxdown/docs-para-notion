# PEGAR · arreglo del `.first()` del informe · 20/08/2026

> **HECHO Y VERIFICADO EL 20/08 · lápida del 27/08/2026. NO PEGUES NADA DE ESTE FICHERO.** El
> arreglo se aplicó y se verificó el 20/08: el nodo vivo ya lleva `.item` en las dos casillas.
> Queda como registro del qué y del porqué. Ojo además con la comprobación 3 de abajo: «DOS
> filas en Status 3» era la numeración VIEJA — tras la renumeración del 26/08 el «3» es
> «Pendiente llamada TD» y NO dispara el generador; hoy los generadores filtran
> `OR(Status=4, Status=5)`. Los valores vigentes están en
> `docs/pasos-2026-08-26-renumeracion.sh`.

**Workflow:** `beckham_informe_mobility` (`Us5sFgXD9qVxJvxO`) · **Nodo:** `Subir el PDF a Airtable`

El nodo sube el PDF a `$('Montar el informe').first()`, o sea SIEMPRE a la primera fila del lote.
Con dos o mas filas pendientes, todos los PDF caen en la primera con el nombre de la primera, y
las demas se quedan sin informe y reentran en cada tick. Su propio sticky ya lo prohibia.

Cambia `.first()` por `.item` en DOS casillas. Nada mas.

## Casilla 1 · URL

https://content.airtable.com/v0/app5K8OnSObqwWweS/{{ $('Montar el informe').item.json.recordId }}/fld4QLLBlaYhPjCYR/uploadAttachment

## Casilla 2 · Body (JSON)

{{ JSON.stringify({ contentType: "application/pdf", filename: $('Montar el informe').item.json.nombreFichero, file: $('Montar el informe').item.json.base64 }) }}

## Comprobacion despues de pegar

1. El nodo NO debe tener ni un `.first()`. Cmd+F en el editor del nodo.
2. Publicar y comprobar por MCP que `versionId == activeVersionId`.
3. Con DOS filas en Status 3 a la vez, cada una tiene que acabar con SU PDF y con SU nombre.
   Esa es la prueba que nunca se ha hecho: hasta hoy siempre habia una sola fila pendiente.
