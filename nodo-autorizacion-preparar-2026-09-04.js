// Nodo «Preparar_la_autorizacion» de mobility_autorizacion_intercom · 04/09/2026.
// MODO DEL NODO: Run Once for Each Item.
//
// Es la version TOOL del «Preparar la autorizacion» de mobility_autorizacion_prerrellenada
// (C3lKxKwi1bRyokf7, el del fiscal, que va por reloj cada 15 min). Este lo llama el agente
// conversacional en el paso de la autorizacion, y decide UNA de tres cosas:
//   - error:    falta la fila, el NIF o el nombre -> el agente lee el motivo y no promete nada.
//   - reenviar: la fila YA tiene AutorizacionPrerrellenada -> se manda esa, sin regenerar.
//   - generar:  se monta el PDF desde la plantilla de Google Docs y se sube a Airtable.
// En los dos ultimos casos el PDF viaja a Intercom como attachment_files (base64) de una
// respuesta de admin: dentro del chat, sin enlace que caduque.
//
// LAS PLANTILLAS ESTAN DUPLICADAS AQUI Y EN EL WORKFLOW DEL FISCAL. Si se cambia una, cambiar
// las dos (misma trampa que el script ingles de Airtable, que existe dos veces).
// Regla de la casa (01/09/2026): el dato que tenemos se imprime y el que NO tenemos no aparece.

const PLANTILLAS = {
    ES: "1xs51w9aVU79sXeyWDicMcWq8zAezc39XfNtwKQ0XrqU",
    EN: "PON_AQUI_EL_ID_DE_LA_PLANTILLA_EN"
};

// En nodos de codigo SIEMPRE .first(), nunca .item (cuelga el task runner).
const llamada = $('Llamada_desde_el_bot').first().json || {};
const bruto = $input.item.json || {};
const r = bruto.fields ? { ...bruto.fields, id: bruto.id } : bruto;
const txt = v => (v && typeof v === "object" && v.name !== undefined) ? v.name : v;
const s = clave => String(txt(r[clave]) || "").trim();

const conversationId = String(llamada.conversation_id || "").trim();
const idFila = r.id || r.recordId;

const para = motivo => ({ json: { error: motivo, modo: "error", recordId: idFila || "", conversation_id: conversationId } });

if (!conversationId) return para("No me ha llegado el conversation_id: no se a que conversacion mandar la autorizacion.");
if (!idFila) return para("No encuentro el expediente de este cliente en Airtable. Guarda primero su nombre y su NIF con guardar_datos_cliente y vuelve a intentarlo.");

const nombre = s("Nombre completo") ||
               [s("Nombre empleado"), s("Apellidos empleado")].filter(Boolean).join(" ");
const nif = s("NIF");

if (!nombre) return para("Falta el nombre del empleado en el expediente. Guardalo con guardar_datos_cliente y vuelve a intentarlo.");
if (!nif) return para("Falta el NIF/NIE en el expediente. Sin NIF la autorizacion no sirve ante la AEAT: pideselo, guardalo y vuelve a intentarlo. Un pasaporte NO vale.");

// Idioma: manda el de la conversacion (lo pasa el agente). Si no llega, el de la fila.
// "Ingles" es el caso EXPLICITO y todo lo demas, incluido el vacio, sale en espanol.
const idiomaLlamada = String(llamada.idioma || "").trim().toLowerCase();
let idioma;
if (idiomaLlamada.startsWith("en") || idiomaLlamada === "ingles" || idiomaLlamada === "inglés") idioma = "EN";
else if (idiomaLlamada.startsWith("es") || idiomaLlamada === "castellano") idioma = "ES";
else idioma = s("Idioma").toLowerCase() === "ingles" ? "EN" : "ES";

const MENSAJE = {
    ES: "📎 Aquí tienes la autorización para que TaxDown actúe en tu nombre ante la AEAT, ya rellena con tus datos. Solo tienes que firmarla y adjuntarla aquí, en este mismo chat.",
    EN: "📎 Here is the authorisation for TaxDown to act on your behalf before the Spanish Tax Agency (AEAT), already filled in with your details. You only need to sign it and attach it here, in this same chat."
};

// YA EXISTE: la fila trae la autorizacion (la genero el fiscal por reloj, o este mismo
// workflow en un turno anterior). Se reenvia tal cual, sin tocar Airtable ni Drive.
const adj = Array.isArray(r.AutorizacionPrerrellenada) ? r.AutorizacionPrerrellenada : [];
if (adj.length && adj[0] && adj[0].url) {
    return { json: {
        error: "", modo: "reenviar", recordId: idFila, conversation_id: conversationId, idioma: idioma,
        urlExistente: adj[0].url,
        nombreFichero: adj[0].filename || ("Autorizacion-AEAT-" + nif + ".pdf"),
        mensaje_intercom: MENSAJE[idioma],
        _plantillaDeReserva: ""
    } };
}

// Mientras no exista la plantilla EN se cae a la ES: parar dejaria al cliente ingles sin documento.
const sinConfigurar = v => !v || String(v).indexOf("PON_AQUI") === 0;
let plantilla = PLANTILLAS[idioma];
let idiomaUsado = idioma;
if (sinConfigurar(plantilla)) { plantilla = PLANTILLAS.ES; idiomaUsado = "ES"; }
if (sinConfigurar(plantilla)) return para("No hay ninguna plantilla de autorizacion configurada en el nodo.");

// La provincia NO tiene columna: son los dos primeros digitos del CP. Sin CP no se inventa.
const PROVINCIAS = {
    "01": "Araba/Alava", "02": "Albacete", "03": "Alicante", "04": "Almeria",
    "05": "Avila", "06": "Badajoz", "07": "Illes Balears", "08": "Barcelona",
    "09": "Burgos", "10": "Caceres", "11": "Cadiz", "12": "Castellon",
    "13": "Ciudad Real", "14": "Cordoba", "15": "A Coruna", "16": "Cuenca",
    "17": "Girona", "18": "Granada", "19": "Guadalajara", "20": "Gipuzkoa",
    "21": "Huelva", "22": "Huesca", "23": "Jaen", "24": "Leon", "25": "Lleida",
    "26": "La Rioja", "27": "Lugo", "28": "Madrid", "29": "Malaga", "30": "Murcia",
    "31": "Navarra", "32": "Ourense", "33": "Asturias", "34": "Palencia",
    "35": "Las Palmas", "36": "Pontevedra", "37": "Salamanca",
    "38": "Santa Cruz de Tenerife", "39": "Cantabria", "40": "Segovia",
    "41": "Sevilla", "42": "Soria", "43": "Tarragona", "44": "Teruel",
    "45": "Toledo", "46": "Valencia", "47": "Valladolid", "48": "Bizkaia",
    "49": "Zamora", "50": "Zaragoza", "51": "Ceuta", "52": "Melilla"
};

const cp = s("Codigo Postal");
const municipio = s("MunicipioResidencia");
const provincia = PROVINCIAS[cp.slice(0, 2)] || "";

let tipoVia = s("Tipo de vía / Type of road");
const calle = s("Nombre de la calle / Name of street");
if (tipoVia) {
    tipoVia = tipoVia.charAt(0) + tipoVia.slice(1).toLowerCase();
    if (calle.toLowerCase().indexOf(tipoVia.toLowerCase()) === 0) tipoVia = "";
}
const via = [tipoVia, calle].filter(Boolean).join(" ");

const numero = [
    s("Número de tu domicilio / House Number") ? "nº " + s("Número de tu domicilio / House Number") : "",
    s("Planta") ? "planta " + s("Planta") : "",
    s("Puerta") ? "puerta " + s("Puerta") : ""
].filter(Boolean).join(", ");

const linea1 = [via, numero].filter(Boolean).join(", ");
let linea2 = [cp, municipio].filter(Boolean).join(" ");
if (provincia && provincia.toLowerCase() !== municipio.toLowerCase()) {
    linea2 = [linea2, provincia].filter(Boolean).join(", ");
}
const domicilio = [linea1, linea2].filter(Boolean).join(" - ");

// La ETIQUETA va DENTRO del marcador: Google Docs no puede borrar un parrafo, asi que sin
// domicilio el marcador va vacio y la linea desaparece entera. Separador ": " y NO tabulador.
const etiquetaDomicilio = idiomaUsado === "EN" ? "ADDRESS FOR NOTIFICATIONS" : "DOMICILIO A EFECTOS DE NOTIFICACIONES";
const bloqueDomicilio = domicilio ? etiquetaDomicilio + ": " + domicilio : "";

// EN HORA DE MADRID: los nodos corren en UTC y un envio a las 00:30 caeria en el dia anterior.
const hoyMadrid = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());
const partes = hoyMadrid.split("-").map(Number);
const anio = partes[0], mes = partes[1], dia = partes[2];
const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Sin municipio la linea arranca por la fecha, en vez de dejar un "En ____" colgando.
let lugarFecha;
if (idiomaUsado === "EN") {
    const f = dia + " " + MESES_EN[mes - 1] + " " + anio;
    lugarFecha = municipio ? "In " + municipio + ", on " + f : "On " + f;
} else {
    const f = dia + " de " + MESES_ES[mes - 1] + " de " + anio;
    lugarFecha = municipio ? "En " + municipio + ", a " + f : "A " + f;
}

return { json: {
    error: "", modo: "generar", recordId: idFila, conversation_id: conversationId,
    plantilla: plantilla, idioma: idiomaUsado, _idiomaPedido: idioma,
    _plantillaDeReserva: idiomaUsado === idioma ? "" : "OJO: cliente " + idioma + " con plantilla ES (falta la plantilla EN en el nodo)",
    nombreFichero: "Autorizacion-AEAT-" + nif + ".pdf",
    mensaje_intercom: MENSAJE[idioma],
    urlExistente: "",
    m_NombreCompleto: nombre, m_NIF: nif, m_BloqueDomicilio: bloqueDomicilio, m_LugarFecha: lugarFecha,
    _sinDomicilio: domicilio ? "" : "OJO: sin domicilio, esa linea no sale"
} };
