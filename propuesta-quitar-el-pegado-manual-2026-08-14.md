# Propuesta · Quitar el pegado manual de los nodos de código · 14/08/2026

> **Qué es.** No es una tarea del alcance del 31/08. Es la recomendación que salió al preguntarme el
> usuario «¿vamos bien?» el 14/08, apuntada porque él pidió que se apuntara. **Decide él si entra.**

## El problema, medido

Los dos nodos de código de este proyecto pesan lo que pesan por **datos**, no por lógica:

| Nodo | Workflow | Caracteres | Cuánto es dato |
|---|---|---|---|
| `Montar el .030` | `beckham_generar_030` | **197.924** | ~160 KB son la tabla del INE (8.132 municipios) |
| `Montar el informe` | `beckham_informe_mobility` | **239.131** | ~16 KB el logo en base64 + ~40 KB las cuatro tablas de anchos |

**Lo que cuesta un cambio hoy**, aunque sea de una línea:

1. Tocar la pieza en `docs/`.
2. `bash docs/montar-nodo-informe.sh`.
3. Abrir n8n, borrar el nodo entero y **pegar 239.131 caracteres**.
4. Elegir credencial si el nodo es nuevo.
5. Guardar y publicar.

Y **no se puede hacer por MCP**: `update_workflow` exige reenviar el workflow completo, y eso incluye
los 200 KB del nodo de código. Por eso todo cambio en estos dos nodos es manual, siempre.

## Lo que ha costado de verdad, el 14/08

No es teoría. En un solo día, con este flujo:

- La URL del nodo de subida **se pegó dos veces** (`…uploadAttachmenthttps://…uploadAttachment`).
  Habría roto la subida. Se cazó contando apariciones de `uploadAttachment`, no leyéndola a ojo.
- La misma URL, en el segundo intento, **se quedó sin cambiar** mientras el JSON del mismo nodo sí
  se cambió. El `.first()` sobrevivió al arreglo.
- Yo di el recuento de comprobación **en bytes en vez de caracteres**, y pareció que al pegado le
  faltaban 2.979 caracteres cuando estaba completo. Casi le cuesta repegar 190 KB para nada.

Tres incidentes en un día, todos en el mismo punto: **la superficie manual**. Ninguno es descuido;
son el precio de que cada cambio pase por un pegado de 200 KB.

## La propuesta

**Sacar los datos del nodo y meterlos en Data Tables de n8n.** No es una técnica nueva aquí:
`beckham_bot` ya usa dos nodos `n8n-nodes-base.dataTable` (`Prompt_De_Respaldo` y
`Refrescar_Respaldo`) para el prompt de respaldo, así que el mecanismo está probado en este proyecto.

| Qué sale del nodo | A dónde | Cuánto baja |
|---|---|---|
| `tabla-municipios-ine` (8.132 municipios) | Data Table, una fila por municipio | −160 KB |
| `LOGO_JPEG_BASE64` | Data Table de una fila, o un adjunto de Airtable | −16 KB |
| `metrica-helvetica` y `metrica-times` | Data Table, o se dejan (son 40 KB y no cambian nunca) | −40 KB opcional |

**Resultado:** los dos nodos de código bajan de ~200 KB a **~20 KB**, y con eso:

- **`update_workflow` por MCP vuelve a ser posible.** Se acaba el pegado manual, y con él los tres
  incidentes de arriba.
- **La auditoría por MCP deja de reventar el límite de lectura** en cada sesión.
- Un cambio de una línea pasa a ser un cambio de una línea.

## Lo que hay que mirar antes de decidir

Esto no es gratis y conviene saberlo antes, no después:

1. **Una lectura de Data Table por ejecución.** El `.030` busca UN municipio por fila; hoy la tabla
   está en memoria y la búsqueda es instantánea. Con Data Table hay que leer, y hay que comprobar
   que se puede filtrar por clave sin traerse las 8.132 filas.
2. **Los alias.** La tabla del INE tiene 9.620 claves para 8.132 municipios (bilingües con barra,
   artículos detrás). El modelo de la Data Table tiene que soportar eso, o se pierde la búsqueda por
   alias, que es lo que hace que «Donostia» y «San Sebastián» encuentren el mismo código.
3. **Cargar 8.132 filas en una Data Table** hay que hacerlo por API y por tandas, y comprobar que
   entran todas. Es donde se puede perder un municipio en silencio.
4. **Las pruebas locales.** Hoy `docs/test-nodo-030.js` corre el nodo entero con `vm` y un `$input`
   simulado, sin tocar nada externo. Con Data Tables habría que simularlas también, o la prueba
   deja de probar el nodo de verdad.
5. **La regla del proyecto sigue mandando:** un cambio, una prueba. La migración se hace con el
   `.030` comparando byte a byte contra las 14 muestras reales ANTES de tocar el nodo vivo, y con
   `docs/verificar-nodo-030.js` diciendo que el nodo y sus piezas siguen coincidiendo.

## Coste y cuándo

**Medio día**, y se paga solo en lo que queda de proyecto: cada cambio posterior en esos dos nodos
deja de costar un pegado de 200 KB.

**No entra antes del 31/08 salvo que el usuario lo diga.** El alcance del 31/08 está cerrado desde el
5/08 y esto no está dentro. Va apuntado para que exista cuando se decida, no para colarlo.
