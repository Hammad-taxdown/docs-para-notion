// Elige la plantilla y calcula los 14 huecos. NO decide nada por defecto: si algo
// falta, devuelve error y el informe no se monta.
// Los motivos los lee una PERSONA en la columna ErrorInforme, asi que van escritos
// en castellano correcto y diciendo que dato falta.
// El nodo de Airtable puede devolver la fila CRUDA ({id, createdTime, fields}) o ya
// aplanada, segun como este configurado. Se aceptan las dos formas.
const bruto = $input.item.json;
const r = bruto.fields ? { ...bruto.fields, id: bruto.id } : bruto;
const txt = v => (v && typeof v === "object" && v.name !== undefined) ? v.name : v;

// El id de la fila. La columna de texto "recordId" existe pero NO se rellena sola:
// las filas creadas por API la traen vacia. El id bueno es el que devuelve el nodo
// de Airtable en r.id; recordId queda solo como respaldo.
const idFila = r.id || r.recordId;
if (!idFila) throw new Error("La fila no trae id. Sin id no se puede escribir en Airtable.");

const PLANTILLAS = {
  "BCK+BCK|ES": "1sPIUyAN60H7sNGYjxckfiFhbAh2pwAm06UO9khhd_9E",
  "NRF+BCK|ES": "1Nxvb-9wA7tMBaMkKALiXck-dSdv2Yjr4G2HGCB2DlGs",
  "RF+RF|ES":   "1JJLD8gamfimpkjYiXIZwfgSzcGZH902IiIKjJ74sTPs",
  "NRF+RF|ES":  "1TkPbLuAvpCCsRhy5F7HqzzoaSqvlrcjPKL92J3ib_l4",
  "BCK+BCK|EN": "13s52KT-u_QnuPm-5cxozzueIzwFaiQdpjDSIHAPEj8M",
  "NRF+BCK|EN": "18NOxrideWRfy1NoBW_bajYu_Ji0M37BoIqd_dZuYJgo",
  "RF+RF|EN":   "1NezPFmuCYsJJJYWtUXX-FGP4zbB1dR3EYIjXusDN2gs",
  "NRF+RF|EN":  "1aoaCvKCWhR5oD3TFKkBoB_p2ZXA9ceqs43vMOvU3hu4"
};

// Los valores que devuelven las dos formulas de Airtable, comparados sin tildes
// para que un cambio de acentuacion en la formula no rompa el mapeo.
const REGIMEN = {
  "Regimen Especial (Beckham)": "BCK",
  "Residente Fiscal": "RF",
  "No residente UE": "NRF",
  "No residente NO UE": "NRF"
};
const sinTildes = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const regimen = s => REGIMEN[sinTildes(s).trim()];
const para = motivo => ({ json: { error: motivo, recordId: idFila } });

const nombre = txt(r["Nombre completo"]);
const fecha = txt(r.fechaDesplazamiento);
const salario = r.Salario;
// OJO: estos dos campos se parecen y es facil cruzarlos. El de DESPLAZAMIENTO es el
// año 0; el de SIGUIENTE es el año 1.
const sit0 = txt(r["Situacion fiscal Anio Desplazamiento"]) || txt(r["Situación fiscal Anio Desplazamiento"]);
const sit1 = txt(r["Situacion fiscal AnioSiguiente"]) || txt(r["Situación fiscal AnioSiguiente"]);

if (!nombre) return para("Falta el nombre completo.");
if (!fecha) return para("Falta la fecha de desplazamiento.");
if (salario === undefined || salario === null || salario === "") return para("Falta el salario bruto anual.");
if (!sit0) return para("La situación fiscal del año de desplazamiento está vacía.");
if (!sit1) return para("La situación fiscal del año siguiente está vacía.");

const b0 = regimen(sit0);
const b1 = regimen(sit1);
if (!b0) return para('La situación fiscal del año de desplazamiento no la reconozco: "' + sit0 + '".');
if (!b1) return para('La situación fiscal del año siguiente no la reconozco: "' + sit1 + '".');

// EL FRENO DEL AÑO 2. Comprobacion defensiva: el año siguiente la persona reside el
// año completo, asi que No residente es imposible. Las formulas funcionan bien
// (verificado el 20/08/2026); esto existe para el dia en que alguien las toque.
if (b1 === "NRF") return para('El año siguiente sale como "' + sit1 + '", y eso no puede ser: el segundo año la persona reside el año completo. Hay que revisar la fórmula de situación fiscal en Airtable.');

const esUE = sinTildes(sit0).trim() === "No residente UE";
// Los cuatro textos de no residente solo tienen sentido si el año 0 ES no residente.
// Sin esta guarda, un caso Beckham de Alemania calculaba "Alemania esta fuera de la
// Union Europea" (medido el 21/08/2026 en la ejecucion 8127865).
const esNR = (b0 === "NRF");
const idioma = (sinTildes(txt(r.Idioma)).trim().toLowerCase() === "ingles") ? "EN" : "ES";
const clave = b0 + "+" + b1 + "|" + idioma;
const plantilla = PLANTILLAS[clave];
if (!plantilla) return para("No hay plantilla para la combinación " + clave + ".");

// El primer año de residencia fiscal es el de llegada, salvo que el año 0 sea No
// residente: entonces es el siguiente.
const anio0 = Number(String(fecha).slice(0, 4));
const anio1 = anio0 + 1;
const anioResidencia = (b0 === "NRF") ? anio1 : anio0;
const beckhamFin = anioResidencia + 5;
// El 720 se presenta hasta el 31 de marzo SIGUIENTE al primer año de residencia.
// En NRF+RF eso es anio0+2, no anio0+1. Confundirlo da un plazo ya vencido.
const anio720 = anioResidencia + 1;

const MES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const MES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const ABREV_ES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const ABREV_EN = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const partes = String(fecha).slice(0, 10).split("-");
const mesIdx = Number(partes[1]) - 1;
const dia = Number(partes[2]);

// Airtable ya trae la fecha escrita en fechaDesplazamientocorrecta: se usa esa.
const llegadaLarga = idioma === "ES"
  ? (txt(r.fechaDesplazamientocorrecta) || (dia + " de " + MES_ES[mesIdx] + " de " + anio0))
  : (String(dia) + " " + MES_EN[mesIdx] + " " + anio0);
const mesAnio = (idioma === "ES" ? ABREV_ES : ABREV_EN)[mesIdx] + " " + anio0;

// El nombre llega en MAYUSCULAS de Airtable y el titular va a 27 puntos en serif.
const capitalizar = s => String(s || "").toLowerCase().replace(/(^|[\s'-])([a-záéíóúüñ])/g, (m, a, b) => a + b.toUpperCase());
// El salario llega como numero pelado: 66000 -> 66.000
const miles = n => Number(n).toLocaleString(idioma === "ES" ? "de-DE" : "en-US");

// El unico pais que se imprime. La nacionalidad NO sale en el informe, y la frase del
// Convenio no nombra pais ninguno: el convenio que aplica es el del pais de donde
// viene la renta, que puede no ser este.
const pais = capitalizar(txt(r.UltimoPaisResidencia));

const F = {
  ES: {
    tipo: esUE ? "19 %" : "24 %",
    nota: esUE
      ? "Tipo de la Unión Europea, por residir en " + pais + ". Con gastos deducibles."
      : pais + " está fuera de la Unión Europea. Sobre el bruto, sin deducir gastos.",
    frase: esUE
      ? ". Dado que está en la Unión Europea, tributarás a un 19 % por el salario obtenido de fuente española, con derecho a deducir el gasto de Seguridad Social."
      : ", por lo que tendrás que tributar a un 24 % por el salario obtenido de fuente española, sin derecho a deducir gastos (tampoco el de Seguridad Social).",
    alquiler: esUE
      ? "Declaras el ingreso a través del modelo 210 abonando el 19 %, con derecho a deducir gastos como reparaciones, gastos de comunidad, tasas, tributos, amortización, etc."
      : "Declaras el ingreso bruto abonando el 24 % sobre este a través del modelo 210."
  },
  EN: {
    tipo: esUE ? "19 %" : "24 %",
    nota: esUE
      ? "EU rate, as a resident of " + pais + ". Expenses deductible."
      : pais + " is outside the European Union. On gross income, with no deduction of expenses.",
    frase: esUE
      ? ". Since it is in the European Union, you will be taxed at 19 % on salary from Spanish sources, with the right to deduct the Social Security expense."
      : ", so you will be taxed at 24 % on salary from Spanish sources, with no right to deduct expenses (not even Social Security).",
    alquiler: esUE
      ? "You report the income through Modelo 210 paying 19 %, with the right to deduct expenses such as repairs, service charges, local rates, taxes, depreciation, etc."
      : "You report the gross income paying 24 % on it through Modelo 210."
  }
}[idioma];

const limpio = capitalizar(nombre);

return {
  json: {
    error: "",
    recordId: idFila,
    plantilla: plantilla,
    clave: clave,
    nombreFichero: "Informe Mobility - " + limpio + ".pdf",
    m_NombreCompleto: limpio,
    m_LlegadaLarga: llegadaLarga,
    m_DiaLlegada: String(dia).padStart(2, "0"),
    m_MesAnioLlegada: mesAnio,
    m_UltimoPais: pais,
    m_SalarioBruto: miles(salario),
    m_Anio0: String(anio0),
    m_Anio1: String(anio1),
    m_BeckhamFin: String(beckhamFin),
    m_Anio720: String(anio720),
    m_TipoNR: esNR ? F.tipo : "",
    m_NotaTipoNR: esNR ? F.nota : "",
    m_FraseTipoNR: esNR ? F.frase : "",
    m_FraseAlquilerNR: esNR ? F.alquiler : ""
  }
};
