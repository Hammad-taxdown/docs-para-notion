// PRUEBA DEL GENERADOR DEL .030 · 14/08/2026
// Extrae los datos de las cuatro muestras reales, las regenera con el generador
// y compara byte a byte contra el fichero original. Se ejecuta con: node docs/test-generador-030.js
// Las muestras viven en ~/Downloads y NO se suben al repo: llevan datos reales.
const fs=require('fs'), path=require('path');
const {construir030}=require('/Users/hammad/Documents/Taxdown/Proyecto_Mobility_Beckham/Beckham__v0.12/docs/generador-030-2026-08-14.js');
// Las muestras se movieron a ~/Downloads/nuevos030 el 14/08: se busca en los dos sitios.
const DIRS=['/Users/hammad/Downloads','/Users/hammad/Downloads/nuevos030'];
const DIR='';
const donde=f=>{ for(const d of DIRS){ const p=path.join(d,f); if(fs.existsSync(p)) return p; } return null; };
const buenos=['48013946C (1).030','Z3520584W (2).030','Z4447237P (1).030','Z4871333F.030'];
const sub=(s,a,b)=>s.slice(a-1,b);
let fallos=0;
for(const f of buenos){
  const p=donde(f);
  if(!p){ console.log(`SALTA ${f.padEnd(20)} no esta en ninguna de las dos carpetas`); continue; }
  const orig=fs.readFileSync(p).toString('latin1');
  const A=orig.match(/<T030010>([\s\S]*?)<\/T030010>/)[1];
  const B=orig.match(/<T030020>([\s\S]*?)<\/T030020>/)[1];
  const d={
    nif: sub(A,226,234).trim(),
    apellidoPrimero: sub(A,236,285).trim(),
    apellidoSegundo: sub(A,286,335).trim(),
    nombre: sub(A,336,360).trim(),
    nacionalidadISO2: sub(A,223,224),
    sexo: sub(A,225,225),
    fechaNacimiento: sub(A,361,368),
    ineMunicipioNacimiento: sub(A,369,373),
    municipioNacimiento: sub(A,374,403).trim(),
    codProvinciaNacimiento: sub(A,404,405),
    provinciaNacimiento: sub(A,406,435).trim(),
    paisNacimientoISO2: sub(A,436,437),
    residenteFiscal: sub(A,172,172),
    tipoVia: sub(A,704,708).trim(),
    nombreVia: sub(A,714,763).trim(),
    numero: sub(A,767,771),
    bloque: sub(A,778,778).trim(),
    planta: sub(A,784,785).trim(),   // DOS caracteres: 61078714Y lleva '04'
    puerta: sub(A,787,788).trim(),
    cp: sub(A,860,864),
    ineMunicipioResidencia: sub(A,865,869),
    municipioResidencia: sub(A,870,899).trim(),
    fechaEfectos: sub(A,1390,1397),
    fechaPresentacion: sub(B,697,704),
  };
  const r=construir030(d);
  const esperadoNombre = d.nif+'.030';
  if(r.texto===orig){ console.log(`OK    ${f.padEnd(20)} 2700 bytes identicos  ->  ${r.nombreFichero}`); continue; }
  fallos++;
  console.log(`FALLA ${f}`);
  const dif=[];
  for(let i=0;i<Math.max(r.texto.length,orig.length);i++) if(r.texto[i]!==orig[i]) dif.push(i);
  // agrupar
  const rangos=[]; for(const i of dif){ if(rangos.length&&i===rangos.at(-1)[1]+1) rangos.at(-1)[1]=i; else rangos.push([i,i]); }
  for(const [x,y] of rangos) console.log(`   offset ${x+1}-${y+1}: generado ${JSON.stringify(r.texto.slice(x,y+1))} vs real ${JSON.stringify(orig.slice(x,y+1))}`);
}
console.log(fallos? `\n${fallos} de 4 fallan`: '\nLAS CUATRO REGENERADAS BYTE A BYTE');
