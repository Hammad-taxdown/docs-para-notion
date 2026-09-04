// Recorre los items UNO A UNO con su indice. El fallo del 02/09/2026 fue usar
// getBinaryDataBuffer(0, ...) con el 0 fijo: en una pasada con varias filas TODAS
// recibian el fichero de la primera, y el nombre salia bien, asi que no se veia.
// pairedItem mantiene el emparejamiento para los nodos de detras.
// MODO DEL NODO: Run Once for All Items. Es el MISMO codigo en Fichero_a_base64 y en Documento_a_base64.
const entrada = $input.all();
const salida = [];
for (let i = 0; i < entrada.length; i++) {
    const buffer = await this.helpers.getBinaryDataBuffer(i, 'data');
    if (!buffer || !buffer.length) {
        throw new Error('El documento del elemento ' + i + ' ha llegado vacio.');
    }
    salida.push({
        json: { base64: buffer.toString('base64'), bytes: buffer.length },
        pairedItem: { item: i }
    });
}
return salida;
