// Puerta del nodo 'Calcular el plazo' de beckham_f2_plazo. · 03/09/2026
// EJECUTA el codigo con un $json de mentira. Mide el plazo de siempre y la discrepancia
// nueva con el documento (7 dias). `node docs/test-f2-plazo.js`
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const code = fs.readFileSync(path.join(__dirname, 'nodo-f2-calcular-plazo-2026-09-03.js'), 'utf8');
let ok = 0, ko = 0;
const c = (cond, s, d) => { if (cond) { process.stdout.write('  OK   ' + s + '\n'); ok++; } else { process.stdout.write('  FALLA ' + s + (d ? '\n        ' + d : '') + '\n'); ko++; } };
function correr(body) {
  const ctx = { $json: { body }, Date, Math, String, Number, isNaN, JSON };
  return vm.runInNewContext('(function(){' + code + '})()', ctx, { timeout: 2000 })[0].json;
}
const p = n => String(n).padStart(2, '0');
const ddmm = f => p(f.getUTCDate()) + '/' + p(f.getUTCMonth() + 1) + '/' + f.getUTCFullYear();
const hoy = new Date(); hoy.setUTCHours(0, 0, 0, 0);
const dias = (f, n) => { const x = new Date(f); x.setUTCDate(x.getUTCDate() + n); return x; };
const meses = (f, n) => { const x = new Date(f); x.setUTCMonth(x.getUTCMonth() + n); return x; };
const reciente = dias(hoy, -40);                 // alta hace 40 dias: en plazo de sobra
const alLimite = dias(meses(hoy, -6), 2);        // alta hace 6 meses menos 2 dias: en plazo por 2 dias

// ── A · lo de siempre no cambia ──────────────────────────────────────────────
let r = correr({ fecha_alta_ss: ddmm(reciente) });
c(r.veredicto === 'en_plazo' && r.fecha_alta_ddmmaaaa === ddmm(reciente) && r.fecha_limite === ddmm(meses(reciente, 6)) && r.dias_pasados === 0, 'A · en_plazo con las claves de siempre (veredicto, fecha_alta_ddmmaaaa, fecha_limite, dias_pasados)');
c(['veredicto','fecha_alta_norm','fecha_alta_ddmmaaaa','fecha_limite','fecha_limite_iso','dias_pasados'].every(k => k in r), 'A · las seis claves antiguas siguen existiendo con su nombre');
r = correr({ fecha_alta_ss: ddmm(meses(hoy, -8)) });
c(r.veredicto === 'fuera_plazo' && r.dias_pasados > 50, 'A · fuera_plazo con dias_pasados > 0');
c(correr({ fecha_alta_ss: 'no lo se' }).veredicto === 'no_valida', 'A · texto sin fecha -> no_valida');
c(correr({ fecha_alta_ss: '2026-06-01' }).fecha_alta_ddmmaaaa === '01/06/2026' && correr({ fecha_alta_ss: '1/6/26' }).fecha_alta_ddmmaaaa === '01/06/2026' && correr({ fecha_alta_ss: '1 de junio de 2026' }).fecha_alta_ddmmaaaa === '01/06/2026', 'A · las cuatro formas de la descripcion de la tool se siguen entendiendo');
c(correr({ fecha_alta_ss: '9th of August 2026' }).fecha_alta_ddmmaaaa === '09/08/2026', 'A · y ahora tambien el ingles («9th of August 2026», medido en la conversacion del 02/09)');
c(correr({ fecha_alta_ss: '31/02/2026' }).veredicto === 'no_valida', 'A · una fecha que no existe en el calendario -> no_valida');
c(correr({ fecha_alta_ss: ddmm(reciente) }).discrepancia === 'sin_documento', 'A · sin fecha_documento la discrepancia es «sin_documento» (y nada mas cambia)');

// ── B · la discrepancia con el documento ─────────────────────────────────────
r = correr({ fecha_alta_ss: ddmm(reciente), fecha_documento: ddmm(reciente) });
c(r.discrepancia === 'ninguna' && r.dias_diferencia === 0 && r.doc_fecha_ddmmaaaa === ddmm(reciente), 'B · misma fecha -> ninguna, 0 dias');
r = correr({ fecha_alta_ss: ddmm(reciente), fecha_documento: ddmm(dias(reciente, 5)) });
c(r.discrepancia === 'leve' && r.dias_diferencia === 5 && r.doc_veredicto === 'en_plazo' && r.doc_fecha_limite === ddmm(meses(dias(reciente, 5), 6)), 'B · 5 dias -> leve, con la fecha limite del DOCUMENTO para guardarla');
r = correr({ fecha_alta_ss: ddmm(reciente), fecha_documento: ddmm(dias(reciente, -7)) });
c(r.discrepancia === 'leve' && r.dias_diferencia === 7, 'B · 7 dias (hacia atras) -> leve: el umbral es INCLUSIVO y el sentido da igual');
r = correr({ fecha_alta_ss: ddmm(reciente), fecha_documento: ddmm(dias(reciente, 8)) });
c(r.discrepancia === 'grave' && r.dias_diferencia === 8, 'B · 8 dias -> grave (llamada, como hasta hoy)');
r = correr({ fecha_alta_ss: ddmm(reciente), fecha_documento: ddmm(dias(reciente, 60)) });
c(r.discrepancia === 'grave' && r.dias_diferencia === 60, 'B · 60 dias -> grave');
r = correr({ fecha_alta_ss: ddmm(alLimite), fecha_documento: ddmm(dias(alLimite, -5)) });
c(r.discrepancia === 'grave' && r.dias_diferencia === 5 && r.doc_veredicto === 'fuera_plazo' && r.veredicto === 'en_plazo', 'B · 5 dias PERO el documento deja al cliente FUERA DE PLAZO -> grave, no leve (la fecha del documento manda el plazo)');
r = correr({ fecha_alta_ss: ddmm(reciente), fecha_documento: 'ilegible' });
c(r.discrepancia === 'documento_no_valido' && r.doc_fecha_ddmmaaaa === null && r.veredicto === 'en_plazo', 'B · documento ilegible -> documento_no_valido, y el plazo del cliente sigue calculandose');
r = correr({ fecha_alta_ss: 'no lo se', fecha_documento: ddmm(reciente) });
c(r.discrepancia === 'grave' && r.doc_fecha_ddmmaaaa === ddmm(reciente) && r.veredicto === 'no_valida', 'B · sin fecha declarada valida pero con documento -> grave (no hay con que comparar) y se devuelve la del documento');
c(correr({ fecha_alta_ss: ddmm(reciente), fecha_documento: '' }).discrepancia === 'sin_documento', 'B · fecha_documento vacia -> sin_documento');
r = correr({ fecha_alta_ss: ddmm(reciente), fecha_documento: ddmm(dias(reciente, 3)) });
c(r.fecha_alta_ddmmaaaa === ddmm(reciente) && r.fecha_limite === ddmm(meses(reciente, 6)), 'B · contraprueba: la fecha del documento NO pisa las claves del cliente (el agente decide cual guardar)');
c(['doc_fecha_ddmmaaaa','doc_veredicto','doc_fecha_limite','dias_diferencia','discrepancia'].every(k => k in r), 'B · las cinco claves nuevas existen siempre');
process.stdout.write('\n' + ok + ' verdes, ' + ko + ' rojas\n');
if (ko) process.exit(1);
