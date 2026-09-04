## mobility_autorizacion_intercom · la tool `enviar_autorizacion` del agente (04/09/2026)

La llama el AI Agent de beckham_bot_conversacional en el paso de la AUTORIZACION DE TAXDOWN, en
vez de darle al cliente el enlace al .docx generico. Manda a la conversacion de Intercom el PDF
de la autorizacion YA RELLENO con nombre, NIF, domicilio y lugar/fecha: el cliente solo firma.

### Como decide
1. Busca la fila por UserId. Sin fila, sin nombre o sin NIF -> devuelve `ok:false` con el motivo
   y el agente lo lee. Un pasaporte NO vale (decision del 03/09: sin NIF/NIE no se avanza).
2. Si la fila YA tiene AutorizacionPrerrellenada (la hizo el fiscal por reloj, o esta tool en un
   turno anterior) -> la reenvia tal cual. No regenera.
3. Si no -> copia la plantilla de Google Docs, rellena los 4 huecos, la baja como PDF, la sube a
   AutorizacionPrerrellenada y la manda a Intercom.

### Como viaja a Intercom
Respuesta de ADMIN (admin_id 4418209, el mismo que Responder_Intercom) con `attachment_files`
en base64. Es una respuesta aparte, con su frase; el agente NO repite el enlace ni adjunta nada.
NUNCA un enlace de Airtable: sus URLs caducan el mismo dia.

### Es un DUPLICADO del workflow del fiscal (mobility_autorizacion_prerrellenada, C3lKxKwi1bRyokf7)
Mismas plantillas, mismo texto, mismo domicilio. Si se cambia una plantilla o un marcador,
cambiarlo EN LOS DOS. La plantilla EN sigue sin configurar en los dos: un cliente ingles recibe el
documento en espanol con el mensaje en ingles, y la tool lo avisa en `aviso`.

### Consecuencia sobre el circuito del fiscal
Como escribe en la MISMA columna, cuando el fiscal marque Enviarformulario030149 el workflow por
reloj vera la columna llena y no regenerara: el correo del formulario saldra con el PDF que se
genero en el chat (fecha del dia del chat).

### Credenciales
Cada reescritura por API borra las credenciales. Un cambio pequeno se hace A MANO en la UI.
