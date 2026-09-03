// beckham_f2_plazo. · 03/09/2026 · plazo de 6 meses + discrepancia con el documento
// El agente NO cuenta dias ni meses: los cuenta esto. Se le pasa la fecha TAL CUAL.
const body = $json.body || $json;

const MESES = { enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6, julio:7, agosto:8, septiembre:9, setiembre:9, octubre:10, noviembre:11, diciembre:12,
  january:1, february:2, march:3, april:4, may:5, june:6, july:7, august:8, september:9, october:10, november:11, december:12 };

// Entiende: timestamp, AAAA-MM-DD, DD/MM/AAAA (con / . -), y "1 de junio de 2026" / "9th of August 2026".
function parsear(raw) {
  raw = (raw === null || raw === undefined) ? '' : raw.toString().trim();
  if (!raw) return null;
  let d = null, m = null, y = null;
  if (/^\d{9,13}$/.test(raw)) { let ts = +raw; if (raw.length <= 10) ts *= 1000; const f = new Date(ts); if (!isNaN(f)) { y = f.getUTCFullYear(); m = f.getUTCMonth() + 1; d = f.getUTCDate(); } }
  if (d === null) { const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (iso) { y = +iso[1]; m = +iso[2]; d = +iso[3]; } }
  if (d === null) { const mm = raw.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/); if (mm) { d = +mm[1]; m = +mm[2]; y = +mm[3]; if (y < 100) y += 2000; } }
  if (d === null) {
    const t = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const dm = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s*(?:de|of)?\s*([a-z]+)\s*(?:de|of)?\s*,?\s*(\d{4})/);
    if (dm && MESES[dm[2]]) { d = +dm[1]; m = MESES[dm[2]]; y = +dm[3]; }
  }
  if (!(d && m && y)) return null;
  const fecha = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(fecha) || fecha.getUTCDate() !== d || (fecha.getUTCMonth() + 1) !== m) return null;
  return fecha;
}
const p = n => String(n).padStart(2, '0');
const ddmm = f => p(f.getUTCDate()) + '/' + p(f.getUTCMonth() + 1) + '/' + f.getUTCFullYear();
const hoy = new Date(); hoy.setUTCHours(0, 0, 0, 0);
function plazo(fecha) {
  const limite = new Date(fecha); limite.setUTCMonth(limite.getUTCMonth() + 6);
  const dentro = limite >= hoy;
  return { veredicto: dentro ? 'en_plazo' : 'fuera_plazo', fecha_limite: ddmm(limite), fecha_limite_iso: limite.toISOString().slice(0, 10), dias_pasados: dentro ? 0 : Math.floor((hoy - limite) / 86400000) };
}

// 1 · la fecha declarada por el cliente (lo de siempre; las claves no cambian)
const fecha = parsear(body.fecha_alta_ss);
const out = { veredicto: 'no_valida', fecha_alta_norm: null, fecha_alta_ddmmaaaa: null, fecha_limite: null, fecha_limite_iso: null, dias_pasados: null };
if (fecha) {
  const pz = plazo(fecha);
  out.veredicto = pz.veredicto; out.fecha_alta_norm = fecha.toISOString().slice(0, 10); out.fecha_alta_ddmmaaaa = ddmm(fecha);
  out.fecha_limite = pz.fecha_limite; out.fecha_limite_iso = pz.fecha_limite_iso; out.dias_pasados = pz.dias_pasados;
}

// 2 · 03/09 · la fecha que trae el DOCUMENTO de alta, si el agente la manda.
// Decision del usuario: 7 dias o menos y el documento sigue en plazo -> 'leve', se
// toma la del documento y se sigue; mas de 7, o el documento deja al cliente fuera
// de plazo, o no se lee -> 'grave', llamada con el asesor (lo que ya se hacia).
out.doc_fecha_ddmmaaaa = null; out.doc_veredicto = null; out.doc_fecha_limite = null; out.dias_diferencia = null;
out.discrepancia = 'sin_documento';
const rawDoc = (body.fecha_documento === null || body.fecha_documento === undefined) ? '' : String(body.fecha_documento).trim();
if (rawDoc) {
  const fdoc = parsear(rawDoc);
  if (!fdoc) {
    out.discrepancia = 'documento_no_valido';
  } else {
    const pzd = plazo(fdoc);
    out.doc_fecha_ddmmaaaa = ddmm(fdoc); out.doc_veredicto = pzd.veredicto; out.doc_fecha_limite = pzd.fecha_limite;
    if (!fecha) {
      out.discrepancia = 'grave';
    } else {
      out.dias_diferencia = Math.round(Math.abs(fdoc - fecha) / 86400000);
      if (out.dias_diferencia === 0) out.discrepancia = 'ninguna';
      else if (out.dias_diferencia <= 7 && pzd.veredicto === 'en_plazo') out.discrepancia = 'leve';
      else out.discrepancia = 'grave';
    }
  }
}
return [{ json: out }];