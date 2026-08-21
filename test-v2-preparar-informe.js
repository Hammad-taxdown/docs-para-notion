// Puerta del nodo "Preparar el informe" de beckham_informe_mobility_v2.
// Node plano, sin framework: exit 1 si algo esta rojo.
//
// POR QUE EXISTE: el v2 esta bloqueado por la credencial de Google, asi que la unica
// forma de probar su logica es ejecutar el nodo aqui. El nodo es JavaScript puro y no
// toca ninguna API: solo lee la fila y calcula. Se carga el MISMO fichero que se pega
// en n8n, envuelto en un $input falso, para que la prueba no pueda desviarse del nodo.

const fs = require("fs");
const path = require("path");
const FICHERO = path.join(__dirname, "nodo-v2-preparar-informe-2026-08-21.js");
const codigo = fs.readFileSync(FICHERO, "utf8");

// El nodo va en modo runOnceForEachItem: usa $input.item.json y hace return {json}.
const correr = fila => new Function("$input", codigo)({ item: { json: fila } });

let ok = 0, mal = 0;
const comp = (titulo, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (bien) { ok++; console.log("  OK   " + titulo); }
  else { mal++; console.log("  MAL  " + titulo + "\n         esperado: " + JSON.stringify(esperado) + "\n         real:     " + JSON.stringify(real)); }
};
const contiene = (titulo, texto, trozo) => {
  const bien = String(texto).includes(trozo);
  if (bien) { ok++; console.log("  OK   " + titulo); }
  else { mal++; console.log("  MAL  " + titulo + "\n         no encuentro: " + trozo + "\n         en: " + texto); }
};

// Fila base: el caso que se midio en vivo el 21/08 (recp0TwCJ7RPzhwbA).
const base = {
  id: "recTEST0000000001",
  "Nombre completo": "MAXIMILIAN BOSSERT",
  fechaDesplazamiento: "2026-04-27",
  fechaDesplazamientocorrecta: "27 de abril de 2026",
  Salario: 66000,
  Idioma: "Español",
  UltimoPaisResidencia: "ALEMANIA",
  "Situación fiscal Anio Desplazamiento": "Régimen Especial (Beckham)",
  "Situación fiscal AnioSiguiente": "Régimen Especial (Beckham)"
};
const con = extra => ({ ...base, ...extra });

console.log("\n1 · BCK+BCK espanol: los cuatro textos de no residente VACIOS");
{
  const r = correr(con({})).json;
  comp("error vacio", r.error, "");
  comp("clave", r.clave, "BCK+BCK|ES");
  comp("plantilla", r.plantilla, "1sPIUyAN60H7sNGYjxckfiFhbAh2pwAm06UO9khhd_9E");
  comp("m_TipoNR vacio", r.m_TipoNR, "");
  comp("m_NotaTipoNR vacio", r.m_NotaTipoNR, "");
  comp("m_FraseTipoNR vacio", r.m_FraseTipoNR, "");
  comp("m_FraseAlquilerNR vacio", r.m_FraseAlquilerNR, "");
  comp("nombre capitalizado", r.m_NombreCompleto, "Maximilian Bossert");
  comp("nombre del fichero", r.nombreFichero, "Informe Mobility - Maximilian Bossert.pdf");
  comp("recordId de r.id", r.recordId, "recTEST0000000001");
  comp("salario con punto de miles", r.m_SalarioBruto, "66.000");
  comp("anio 0", r.m_Anio0, "2026");
  comp("anio 1", r.m_Anio1, "2027");
  comp("beckham termina 5 anios despues del de llegada", r.m_BeckhamFin, "2031");
  comp("720 al anio siguiente al primero de residencia", r.m_Anio720, "2027");
  comp("dia con dos cifras", r.m_DiaLlegada, "27");
  comp("mes y anio abreviados en espanol", r.m_MesAnioLlegada, "ABR 2026");
  comp("llegada larga de la formula de Airtable", r.m_LlegadaLarga, "27 de abril de 2026");
  comp("pais capitalizado", r.m_UltimoPais, "Alemania");
}

console.log("\n2 · RF+RF ingles: NR vacios tambien, y el idioma manda");
{
  const r = correr(con({
    Idioma: "Ingles",
    "Situación fiscal Anio Desplazamiento": "Residente Fiscal",
    "Situación fiscal AnioSiguiente": "Residente Fiscal"
  })).json;
  comp("clave", r.clave, "RF+RF|EN");
  comp("plantilla inglesa", r.plantilla, "1NezPFmuCYsJJJYWtUXX-FGP4zbB1dR3EYIjXusDN2gs");
  comp("m_TipoNR vacio", r.m_TipoNR, "");
  comp("m_NotaTipoNR vacio", r.m_NotaTipoNR, "");
  comp("mes abreviado en ingles", r.m_MesAnioLlegada, "APR 2026");
  comp("llegada larga en ingles, sin la formula espanola", r.m_LlegadaLarga, "27 April 2026");
  comp("salario con coma de miles", r.m_SalarioBruto, "66,000");
}

console.log("\n3 · LA CONTRAPRUEBA: NRF+BCK con pais de la UE, los cuatro textos SI salen");
{
  const r = correr(con({
    UltimoPaisResidencia: "FRANCIA",
    fechaDesplazamiento: "2026-09-10",
    fechaDesplazamientocorrecta: "10 de septiembre de 2026",
    "Situación fiscal Anio Desplazamiento": "No residente UE",
    "Situación fiscal AnioSiguiente": "Régimen Especial (Beckham)"
  })).json;
  comp("clave", r.clave, "NRF+BCK|ES");
  comp("plantilla", r.plantilla, "1Nxvb-9wA7tMBaMkKALiXck-dSdv2Yjr4G2HGCB2DlGs");
  comp("tipo de la UE", r.m_TipoNR, "19 %");
  contiene("la nota nombra el pais", r.m_NotaTipoNR, "Francia");
  contiene("la nota dice que es tipo de la UE", r.m_NotaTipoNR, "Unión Europea");
  contiene("la frase deduce la Seguridad Social", r.m_FraseTipoNR, "deducir el gasto de Seguridad Social");
  contiene("el alquiler va al 19 %", r.m_FraseAlquilerNR, "19 %");
  comp("el primer anio de residencia es el SIGUIENTE", r.m_BeckhamFin, "2032");
  comp("720 al anio siguiente al primero de residencia", r.m_Anio720, "2028");
}

console.log("\n4 · NRF+RF con pais de FUERA de la UE: el 24 % y el aviso");
{
  const r = correr(con({
    UltimoPaisResidencia: "ESTADOS UNIDOS DE AMERICA",
    fechaDesplazamiento: "2026-09-10",
    fechaDesplazamientocorrecta: "10 de septiembre de 2026",
    "Situación fiscal Anio Desplazamiento": "No residente NO UE",
    "Situación fiscal AnioSiguiente": "Residente Fiscal"
  })).json;
  comp("clave", r.clave, "NRF+RF|ES");
  comp("tipo de fuera de la UE", r.m_TipoNR, "24 %");
  contiene("la nota dice que esta fuera", r.m_NotaTipoNR, "está fuera de la Unión Europea");
  contiene("la frase niega la deduccion", r.m_FraseTipoNR, "sin derecho a deducir gastos");
  contiene("el alquiler va al 24 %", r.m_FraseAlquilerNR, "24 %");
  comp("el 720 cae DOS anios despues del de llegada", r.m_Anio720, "2028");
}

console.log("\n5 · EL FRENO DEL ANIO 2: si el anio siguiente sale no residente, se para");
{
  const r = correr(con({ "Situación fiscal AnioSiguiente": "No residente UE" })).json;
  contiene("para y lo explica", r.error, "no puede ser");
  comp("no monta plantilla", r.plantilla, undefined);
  comp("devuelve el recordId para poder escribir el motivo", r.recordId, "recTEST0000000001");
}

console.log("\n6 · Las cinco paradas por dato que falta");
{
  comp("sin nombre", correr(con({ "Nombre completo": "" })).json.error, "Falta el nombre completo.");
  comp("sin fecha", correr(con({ fechaDesplazamiento: "" })).json.error, "Falta la fecha de desplazamiento.");
  comp("sin salario", correr(con({ Salario: "" })).json.error, "Falta el salario bruto anual.");
  comp("salario null", correr(con({ Salario: null })).json.error, "Falta el salario bruto anual.");
  comp("salario 0 SI es valido", correr(con({ Salario: 0 })).json.error, "");
  comp("sit0 vacia", correr(con({ "Situación fiscal Anio Desplazamiento": "" })).json.error, "La situación fiscal del año de desplazamiento está vacía.");
  comp("sit1 vacia", correr(con({ "Situación fiscal AnioSiguiente": "" })).json.error, "La situación fiscal del año siguiente está vacía.");
  contiene("sit0 desconocida", correr(con({ "Situación fiscal Anio Desplazamiento": "Marciano" })).json.error, "no la reconozco");
}

console.log("\n7 · Fila CRUDA de Airtable y fila APLANADA dan lo mismo");
{
  const { id, ...campos } = base;
  const cruda = correr({ id, createdTime: "2026-08-19T08:49:15.000Z", fields: campos }).json;
  const plana = correr(base).json;
  comp("mismo resultado", cruda, plana);
  comp("la cruda saca el id de bruto.id", cruda.recordId, "recTEST0000000001");
}

console.log("\n8 · Un singleSelect llega como objeto {id,name,color} y no como texto");
{
  const r = correr(con({
    Idioma: { id: "selpK6kadMNE60g0g", name: "Español", color: "blueLight2" },
    UltimoPaisResidencia: { id: "selXXX", name: "ALEMANIA", color: "grayLight2" },
    "Situación fiscal Anio Desplazamiento": { id: "selYYY", name: "Régimen Especial (Beckham)", color: "greenLight2" },
    "Situación fiscal AnioSiguiente": { id: "selZZZ", name: "Régimen Especial (Beckham)", color: "greenLight2" }
  })).json;
  comp("resuelve el .name y no escribe [object Object]", r.clave, "BCK+BCK|ES");
  comp("el pais sale bien", r.m_UltimoPais, "Alemania");
}

console.log("\n9 · Sin id no se puede escribir en Airtable: revienta a proposito");
{
  let salto = false;
  try { correr({ ...base, id: undefined }); } catch (e) { salto = /no trae id/.test(e.message); }
  comp("lanza el error del id", salto, true);
}

console.log("\n10 · Las ocho plantillas: 4 regimenes x 2 idiomas, sin repetir id");
{
  const claves = [
    ["Régimen Especial (Beckham)", "Régimen Especial (Beckham)", "BCK+BCK"],
    ["No residente UE", "Régimen Especial (Beckham)", "NRF+BCK"],
    ["Residente Fiscal", "Residente Fiscal", "RF+RF"],
    ["No residente NO UE", "Residente Fiscal", "NRF+RF"]
  ];
  const vistos = [];
  for (const [sit0, sit1, esperada] of claves) {
    for (const [idioma, sufijo] of [["Español", "ES"], ["Ingles", "EN"]]) {
      const r = correr(con({
        Idioma: idioma,
        "Situación fiscal Anio Desplazamiento": sit0,
        "Situación fiscal AnioSiguiente": sit1
      })).json;
      comp("clave " + esperada + "|" + sufijo, r.clave, esperada + "|" + sufijo);
      comp("  tiene plantilla", typeof r.plantilla === "string" && r.plantilla.length > 20, true);
      vistos.push(r.plantilla);
    }
  }
  comp("las ocho plantillas son distintas", new Set(vistos).size, 8);
}

console.log("\n" + "=".repeat(60));
console.log(mal === 0 ? "TODO PASA · " + ok + " comprobaciones" : "HAY " + mal + " EN ROJO de " + (ok + mal));
process.exit(mal === 0 ? 0 : 1);
