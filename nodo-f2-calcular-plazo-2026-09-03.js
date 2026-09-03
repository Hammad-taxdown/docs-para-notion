const body = $json.body || $json;
let raw = body.fecha_alta_ss;
raw = (raw === null || raw === undefined) ? '' : raw.toString().trim();
// 03/09 · el identificador del cliente viaja con la fecha para poder escribir la fecha
// limite en su contacto de Intercom (atributo fecha_limite_bot). Es OPCIONAL: si no
// llega, el calculo es exactamente el de siempre y no se escribe nada.
const user_id = (body.user_id === null || body.user_id === undefined) ? '' : body.user_id.toString().trim();
let d=null,m=null,y=null;
if (/^\d{9,13}$/.test(raw)) { let ts=+raw; if(raw.length<=10) ts*=1000; const f=new Date(ts); if(!isNaN(f)){ y=f.getUTCFullYear(); m=f.getUTCMonth()+1; d=f.getUTCDate(); } }
if (d===null){ const iso=raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if(iso){ y=+iso[1]; m=+iso[2]; d=+iso[3]; } }
if (d===null){ const mm=raw.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/); if(mm){ d=+mm[1]; m=+mm[2]; y=+mm[3]; if(y<100) y+=2000; } }
if (d===null){ const meses={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12,january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12}; const t=raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); const dm=t.match(/(\d{1,2})(?:st|nd|rd|th)?\s*(?:de|of)?\s*([a-z]+)\s*(?:de|of)?\s*,?\s*(\d{4})/); if(dm&&meses[dm[2]]){ d=+dm[1]; m=meses[dm[2]]; y=+dm[3]; } }
let veredicto='no_valida', fecha_alta_norm=null, fecha_alta_ddmmaaaa=null, fecha_limite=null, fecha_limite_iso=null, dias_pasados=null;
if (d&&m&&y){
  const fecha=new Date(Date.UTC(y,m-1,d));
  if(!isNaN(fecha)&&fecha.getUTCDate()===d&&(fecha.getUTCMonth()+1)===m){
    const p=function(n){return String(n).padStart(2,'0');};
    fecha_alta_norm=fecha.toISOString().slice(0,10);
    fecha_alta_ddmmaaaa=p(d)+'/'+p(m)+'/'+y;
    const limite=new Date(fecha); limite.setUTCMonth(limite.getUTCMonth()+6);
    fecha_limite_iso=limite.toISOString().slice(0,10);
    fecha_limite=p(limite.getUTCDate())+'/'+p(limite.getUTCMonth()+1)+'/'+limite.getUTCFullYear();
    const hoy=new Date(); hoy.setUTCHours(0,0,0,0);
    if(limite>=hoy){ veredicto='en_plazo'; dias_pasados=0; }
    else { veredicto='fuera_plazo'; dias_pasados=Math.floor((hoy-limite)/86400000); }
  }
}
return [{ json:{ veredicto, fecha_alta_norm, fecha_alta_ddmmaaaa, fecha_limite, fecha_limite_iso, dias_pasados, user_id } }];