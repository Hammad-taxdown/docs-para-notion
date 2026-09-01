// Extrae el jsCode de un nodo del SDK del optout, con el interruptor como se pida.
const fs=require('fs');
const f='docs/wf-223-registrar-optout-sdk-2026-08-31.js';
const s=fs.readFileSync(f,'utf8');
const nodo=process.argv[2], enc=process.argv[3]==='true';
const i=s.indexOf("name: '"+nodo+"'");
if(i<0){process.stderr.write('no encuentro el nodo\n');process.exit(1);}
const j=s.indexOf('jsCode: `',i)+9;
let k=j,out='';
while(k<s.length){const c=s[k];
  if(c==='\\'&&s[k+1]==='`'){out+='`';k+=2;continue;}
  if(c==='`')break; out+=c;k++;}
if(enc)out=out.replace('const COLUMNA_EXISTE = false;','const COLUMNA_EXISTE = true; ');
process.stdout.write(out.replace(/\n$/,''));
