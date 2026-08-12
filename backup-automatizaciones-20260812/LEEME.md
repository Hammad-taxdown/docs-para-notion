# Copia de seguridad de las automatizaciones de Airtable · 12/08/2026

Estado **tal y como estaban antes de tocar nada**, capturado por MCP el 12/08/2026.
Base `app5K8OnSObqwWweS` (*Mobility_2026*), tabla `Empleados` (`tblTWCWu5nQXNOMR1`).

Se guarda porque el usuario va a **desactivar y rehacer**. Esto es la red.

## Qué hay aquí

| Fichero | Automatización | id |
|---|---|---|
| `02-formulario-confirmacion.js` | 2. Usuario completa el formulario de confirmación M030 | `wflo1oMmSWlcYsO3V` |
| `03-envio-borradores-ES.js` | 3. Envio borradores · rama español | `wflx5iCN4pXuwPAvO` |
| `03-envio-borradores-EN.js` | 3. Envio borradores · rama inglés | `wflx5iCN4pXuwPAvO` |
| `crear-checkout.js` | Crear Check out · script principal | `wflfiMbXabZqYnAzr` |
| `crear-checkout-comunicacion-cio.js` | Crear Check out · rama "Comunicación CIO" | `wflfiMbXabZqYnAzr` |

## Los disparadores, que no están en los .js

| Automatización | Trigger |
|---|---|
| 2 | `formSubmitted` sobre la vista `viwjxT8e1uLg7K4OC` (*Confirmación modelos*) |
| 3 | `recordMatchesConditions`: `EnviarBorradores` (`fldGSgXLLCf2okzvB`) `= true` |
| Crear Check out | `recordMatchesConditions`: `CrearCheckout` (`fldiWl4wywp1YCK2S`) `= true` |

## Los nodos que NO son script

- **3**, las dos ramas, tras el script: `updateRecord` → `Status` = `7. Pte confirmación usuario`
  (`sel1oCLW0XPLZNZz7`) y `Estado030149` = `3. Pendiente confirmación` (`selBhjx9YrZGJUSz0`).
- **Crear Check out**, rama else: `updateRecord` → `Checkout Error` (`flddzcBTfWZt9QaGB`) `= true`.

## LOS SECRETOS · esto es lo que bloquea rehacer

| Secreto | Cuenta externa | Lo usa |
|---|---|---|
| `n8nApi` | `eacbfZbyDYjL9UWCW` | Automatizaciones 2, 3 y la rama CIO de Crear Check out |
| `crear checkout BPM` | `eacfUyKjpY6C9pTqT` | Crear Check out |

**Airtable NO devuelve el valor de un secreto por API, solo su referencia.** Así que esta copia
**no incluye los tokens**. Para rehacer desde cero hay que poder volver a introducirlos.

## Dependencias externas que hay que respetar al rehacer

- Webhook de notificaciones: `https://es.synapse.rentax.es/webhook/a6a3ebaa-0d63-4edf-baef-30effc5fdf60`,
  con cabecera `x-make-apikey`.
- Plantillas: `transactionalIDCustomer` **54** con `notif` `NOTIF_Mobility_BorradorM030` (borradores),
  y **80** con `NOTIF_B2B_EnvioFactura` (factura).
- `Crear Check out` escribe en **otra base**: `apphWvef8YWoq7vux`, tablas `tblaDVRZhjzVfB2HZ`
  (checkout) y `tblLWN32v7ALduV3u` (líneas), con el producto `recVanegneAVwUr15`.
