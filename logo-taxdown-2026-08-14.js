// ── 14/08 · PIEZA 0 · El logo de TaxDown para la cabecera del informe ────────
//
// QUE ES: el logo, en JPEG BASELINE, metido aqui en base64. Se dibuja en la
// cabecera del informe como un XObject de imagen del PDF.
//
// POR QUE JPEG Y NO EL WEBP ORIGINAL, ni un PNG:
//   - El original es imagen_logo_taxdown.webp, 1920x379, VP8 lossy y SIN CANAL
//     ALFA. Un PDF no sabe leer WebP, asi que hay que convertirlo de todas formas.
//   - Un JPEG BASELINE se mete en un PDF con /Filter /DCTDecode Y NADA MAS: el
//     flujo son los bytes del JPEG TAL CUAL, sin comprimir, sin predictor y sin
//     descomprimir nada. Es el unico camino que no necesita libreria, y en el nodo
//     de n8n no hay ninguna.
//   - UN PNG NO SERVIRIA: su IDAT va en deflate y para separar el canal alfa
//     habria que INFLARLO, o sea zlib, o sea una libreria. Y con transparencia
//     haria falta ademas un /SMask, que es otro flujo comprimido. Por eso el
//     original SIN ALFA es una suerte y hay que aprovecharla.
//   - Progresivo NO VALE: /DCTDecode solo lee baseline. Comprobado que el fichero
//     es SOF0 (baseline) leyendo sus marcadores, no fiandose de la extension.
//
// COMO SE REGENERA si cambia el logo (macOS, sin instalar nada):
//   sips -s format jpeg -s formatOptions 85 -Z 400 imagen_logo_taxdown.webp --out /tmp/logo.jpg
//   y luego se vuelca en base64 aqui, junto con el ancho y el alto REALES del
//   JPEG resultante. Si el ancho y el alto no cuadran con la imagen, el PDF sale
//   con el logo estirado y NO da ningun error.
//
// TAMANO: 400x79 pixeles, 12.183 bytes de JPEG, 16244 caracteres de base64. A 400
// pixeles hay resolucion de sobra para imprimirlo a 150 pt de ancho (unos 5 cm).

const LOGO_ANCHO_PX = 400;
const LOGO_ALTO_PX = 79;
// Ancho con el que se dibuja en el PDF, en puntos. El alto se calcula solo para
// no deformarlo NUNCA: alto = ancho * LOGO_ALTO_PX / LOGO_ANCHO_PX.
const LOGO_ANCHO_PT = 132;

const LOGO_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQA' +
  'AAABAAABkKADAAQAAAABAAAATwAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmA' +
  'CZjs+EJ+/8AAEQgATwGQAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQE' +
  'AAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldY' +
  'WVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk' +
  '5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMR' +
  'BAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdo' +
  'aWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz' +
  '9PX29/j5+v/bAEMAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBgQEBAQEBgcGBgYGBgYHBwcHBwcHBwgICAgICAkJCQkJCwsLCwsLCwsL' +
  'C//bAEMBAgICAwMDBQMDBQsIBggLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLC//dAAQA' +
  'Gf/aAAwDAQACEQMRAD8A/u8+Inj3wV8K/CF5468c3UVhptgm+WV/0VR1ZmPCqOSa/Da0/wCCpXi9vjw3ia901f8AhBHxbDTAi/aE' +
  'iB/4+N/ebuUzt2/L1+avFf8AgoR8W/jZ4z+MFx4I+J1nJoml6Q27TtOV98ToeBcbxgSs4/iHC/dABzn4EHK/NScrOyP4t8U/G/Nl' +
  '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';

if (typeof module !== 'undefined') { module.exports = { LOGO_ANCHO_PX, LOGO_ALTO_PX, LOGO_ANCHO_PT, LOGO_JPEG_BASE64 }; }
