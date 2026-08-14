// ============================================================================
// NODO «Montar el informe» · workflow beckham_informe_mobility · 14/08/2026
// ----------------------------------------------------------------------------
// El trozo que ata las cinco piezas que van concatenadas delante:
//   metrica-helvetica · pdf-motor · tabla-paises-iso2 · informe-datos · informe-cuerpo
//
// UNA ENTRADA POR FILA DE AIRTABLE, UNA SALIDA POR FILA. La salida NUNCA lanza
// excepcion: si algo falta sale {ok:false, error:'...'} y el resto del workflow
// lo escribe en ErrorInforme. Que una fila no se pueda montar NO puede tumbar
// las demas. Es la misma regla que el nodo del .030.
//
// LA CADENA, en tres pasos y en este orden:
//   1. resolverDatos(fila)      -> los 17 marcadores + los dos bloques, o el motivo
//   2. montarElementos(datos)   -> el array de elementos (el IR del contrato §1)
//   3. construirPdf(elementos)  -> los bytes del PDF
// Cada paso puede parar, y cada parada tiene un motivo legible en cristiano.
// ============================================================================

// --- Nombre del fichero -----------------------------------------------------
// Lo ve el cliente en su correo, asi que lleva su nombre y no un identificador.
// SE LIMPIAN LAS BARRAS Y LOS DOS PUNTOS: en un nombre de fichero adjunto una
// barra puede partir la ruta, y hay clientes de correo que se atragantan. Los
// acentos SI se dejan: el nombre del fichero va en UTF-8, no en el PDF, y aqui
// no hay ninguna casilla posicional que se desplace.
function nombreDelFichero(nombreCompleto) {
  const limpio = String(nombreCompleto || '')
    .replace(/[\/\\:*?"<>|]/g, ' ')   // lo que rompe nombres de fichero
    .replace(/\s+/g, ' ')
    .trim();
  return 'Informe Mobility - ' + (limpio || 'sin nombre') + '.pdf';
}

// --- El montaje de una fila -------------------------------------------------
function montarInformeDeFila(fila) {
  const f = fila.fields || fila;

  // 1 · Los datos. Aqui se decide si hay informe o no: sin fecha de
  // desplazamiento no hay años ni bloques, y con una situacion fiscal que no
  // reconozcamos se para A PROPOSITO. Un informe con el regimen fiscal
  // equivocado es peor que no mandar informe, porque el cliente lo va a guardar.
  const r = resolverDatos(f);
  if (!r.ok) return { ok: false, error: r.error };

  // 2 y 3 · El cuerpo y el PDF. Van en el try porque montarElementos LANZA a
  // proposito si se le ha quedado un '{{' sin resolver (la guarda del §5.6 del
  // contrato), y eso tiene que salir como error de la fila, no como caida del
  // nodo entero.
  try {
    const elementos = montarElementos(r.datos);
    const pdf = construirPdf(elementos, {
      titulo: 'Informe de memoria fiscal — ' + r.datos.nombreCompleto,
      autor: 'TaxDown Mobility',
    });

    // Guarda de cordura: un PDF de menos de 1 KB o de una sola pagina significa
    // que el cuerpo ha salido vacio, y eso NO puede llegar a un cliente. Mas
    // vale una fila en error que una memoria fiscal en blanco.
    if (!pdf || !pdf.bytes || pdf.bytes.length < 1024) {
      return { ok: false, error: 'No se genera el informe: el PDF ha salido vacio o truncado (' +
                                 (pdf && pdf.bytes ? pdf.bytes.length : 0) + ' bytes).' };
    }

    return {
      ok: true,
      nombreFichero: nombreDelFichero(r.datos.nombreCompleto),
      // El endpoint de adjuntos de Airtable quiere el fichero en base64.
      // OJO: aqui NO se convierte de latin-1 como en el .030. Los bytes que
      // devuelve el motor YA son los bytes finales del PDF (WinAnsi dentro de
      // los flujos de texto), asi que se pasan a base64 tal cual. Volver a
      // codificarlos romperia el fichero.
      base64: pdf.bytes.toString('base64'),
      bytes: pdf.bytes.length,
      paginas: pdf.paginas,
      // Se devuelven los dos bloques elegidos para poder verlos en la ejecucion
      // sin abrir el PDF. Ha salvado depuraciones enteras en el .030.
      bloque1: r.datos.bloque1,
      bloque2: r.datos.bloque2,
    };
  } catch (e) {
    return { ok: false, error: 'No se genera el informe: ' + (e && e.message ? e.message : String(e)) };
  }
}

// --- Salida del nodo --------------------------------------------------------
const salida = [];
for (const item of $input.all()) {
  const fila = item.json;
  const f = fila.fields || fila;
  const recordId = fila.id || fila.recordId;
  const r = montarInformeDeFila(fila);
  salida.push({
    json: Object.assign({
      recordId: recordId,
      nif: f['NIF'] || '',
      nombre_completo: f['Nombre completo'] || '',
    }, r),
  });
}
return salida;
