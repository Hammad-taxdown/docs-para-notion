'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const D=__dirname;
let ok=0,ko=0;
const V=s=>{process.stdout.write('  OK   '+s+'\n');ok++;};
const X=s=>{process.stdout.write('  FALLA '+s+'\n');ko++;};
const c=(cond,s)=>cond?V(s):X(s);

const guarda=fs.readFileSync(path.join(D,'nodo-guarda-punto-modo-2026-08-27.js'),'utf8');
const valid=fs.readFileSync(path.join(D,'nodo-validar-normalizar-SUBWORKFLOW-COMPLETO.js'),'utf8');

function correr(code,entrada,extra){
  const logs=[];
  const ctx=Object.assign({
    $input:{first:()=>({json:entrada}),all:()=>[{json:entrada}]},
    console:{log:(...a)=>logs.push(a.join(' ')),error:()=>{},warn:()=>{}},
    Date,JSON,String,Number,Object,Array,Boolean,Math,RegExp,isNaN,parseInt,parseFloat
  },extra||{});
  const s=vm.runInNewContext('(function(){'+code+'})()',ctx,{timeout:8000});
  return {salida:s&&s[0]?s[0].json:null,logs};
}
const UID='eu-west-1:00000000-0000-4000-8000-0000000000c1';
const CORR='215475581167582:52219039912';
const B=e=>Object.assign({user_id:UID,intercom_conversation_id:'215475581167582',corr_id:CORR},e);

// ══ A · lo que PASA ═══════════════════════════════════════════════════════════
let r=correr(guarda,B({modo:'solicitud',punto:'cualifica'}));
c(r.salida._guarda==='ok','A · solicitud + cualifica pasa');
c(r.salida.body.corr_id===CORR,'A · el corr_id viaja dentro del body para el validador');
r=correr(guarda,B({modo:'solicitud'}));
c(r.salida._guarda==='ok','A · solicitud SIN punto pasa (es la tool guardar_datos_cliente)');
r=correr(guarda,B({modo:'lead_potencial'}));
c(r.salida._guarda==='ok','A · lead_potencial sin punto pasa (P/R enriquecen la misma fila)');
r=correr(guarda,B({modo:'faq_regimen',punto:'faq_entrada'}));
c(r.salida._guarda==='ok','A · faq_regimen + faq_entrada pasa');
r=correr(guarda,B({modo:'faq_regimen',punto:'autodescarte_declarado'}));
c(r.salida._guarda==='ok','A · faq_regimen + autodescarte_declarado pasa (WP-215)');
r=correr(guarda,B({}));
c(r.salida._guarda==='ok','A · modo VACIO pasa mientras _EXIGIR_MODO sea false');
c(r.logs.join(' ').indexOf('modo_ausente')!==-1,'A · y emite el evento modo_ausente');

// ══ B · lo que NO pasa ════════════════════════════════════════════════════════
r=correr(guarda,B({modo:'faq_regimen',punto:'cualifica'}));
c(r.salida.resultado==='modo_no_permitido','B · EL CASO DEL PRD: cualifica con faq_regimen se rechaza');
c(r.salida.ok===false&&r.salida.campos.join(',')==='modo,punto','B · y dice los dos campos');
r=correr(guarda,B({modo:'calculadora',punto:'cualifica'}));
c(r.salida.resultado==='modo_no_permitido','B · calculadora no escribe expediente (invariante del canvas)');
r=correr(guarda,B({modo:'calculadora'}));
c(r.salida.resultado==='modo_no_permitido','B · calculadora sin punto tampoco escribe');
r=correr(guarda,B({modo:'humano'}));
c(r.salida.resultado==='modo_no_permitido','B · humano no escribe expediente (WP-223)');
r=correr(guarda,B({modo:'menu'}));
c(r.salida.resultado==='modo_no_permitido','B · menu no escribe');
r=correr(guarda,B({modo:'modo_bot'}));
c(r.salida.resultado==='modo_no_permitido'&&r.salida.campos.join()==='modo','B · modo_bot NO EXISTE (transporte B puro)');
r=correr(guarda,B({modo:'solicitud',punto:'inventado'}));
c(r.salida.resultado==='punto_desconocido','B · punto fuera de la whitelist -> punto_desconocido');
r=correr(guarda,B({modo:'solicitud',punto:'faq_entrada'}));
c(r.salida.resultado==='modo_no_permitido','B · faq_entrada NO se acepta en modo solicitud');
r=correr(guarda,B({modo:'faq_regimen',punto:'lead'}));
c(r.salida.resultado==='modo_no_permitido','B · lead NO se acepta en modo faq_regimen');
r=correr(guarda,B({modo:'solicitud',Descarte:'Otro/Incompleto',clave_inventada:'x'}));
c(r.salida.resultado==='schema_error'&&r.salida.campos.join()==='clave_inventada','B · clave fuera del contrato -> schema_error con su nombre');
r=correr(guarda,B({modo:'solicitud',zzz:1,aaa:2}));
c(r.salida.campos.join()==='aaa,zzz','B · varias claves intrusas salen ordenadas');

// ══ C · lo que ningun rechazo hace ════════════════════════════════════════════
r=correr(guarda,B({modo:'faq_regimen',punto:'cualifica'}));
c(!('body' in r.salida),'C · un rechazo NO monta body: no hay nada que escribir');
c(r.salida.dropped.length===0&&r.salida.corr_id===CORR,'C · un rechazo lleva dropped[] y corr_id');
const ev=JSON.parse(r.logs[0].slice(r.logs[0].indexOf('{')));
c(Object.keys(ev).sort().join()==='corr_id,dropped,modo,ms,punto,resultado','C · el evento tiene los 6 campos y solo esos');

// ══ D · los vacios se TIRAN, false y 0 SOBREVIVEN ════════════════════════════
r=correr(guarda,B({modo:'solicitud',nombre:'',email:null,adjuntos:[],alta_ss:false,salario:0}));
c(!('nombre' in r.salida.body),'D · un string vacio NO viaja (borraria el dato bueno)');
c(!('email' in r.salida.body),'D · un null NO viaja');
c(!('adjuntos' in r.salida.body),'D · un array vacio NO viaja');
c(r.salida.body.alta_ss===false,'D · false SI viaja');
c(r.salida.body.salario===0,'D · el 0 SI viaja');

// ══ E · guarda + validador, encadenados de verdad ═════════════════════════════
const g=correr(guarda,B({modo:'solicitud',punto:'lead',nombre:'Ana',fecha_alta_ss:'02/03/2026'})).salida;
const v=correr(valid,null,{$input:{first:()=>({json:g})}}).salida;
c(v._invalid===false,'E · el body de la guarda pasa el validador SIN tocar su logica');
c(v.corr_id===CORR,'E · PARCHE 1: el corr_id de workflowInputs MANDA sobre el recalculo');
c(Array.isArray(v._dropped),'E · PARCHE 2: _dropped es un array');
c(v.fields.lead_potencial===true&&v.fields.alta_ss===false,'E · la DERIVA de lead sigue funcionando');
c(v.fields.fecha_alta_ss==='2026-03-02T12:00:00.000Z','E · la fecha sigue con el T12:00:00.000Z');
const g2=correr(guarda,B({modo:'solicitud',punto:'lead',fecha_alta_ss:'32/13/2026'})).salida;
const v2=correr(valid,null,{$input:{first:()=>({json:g2})}}).salida;
c(v2._dropped.length===1&&v2._dropped[0].split('=')[0]==='fecha_alta_ss','E · _dropped trae el nombre del campo descartado');
const g3=correr(guarda,{user_id:'pepe',intercom_conversation_id:'x',modo:'solicitud',corr_id:CORR}).salida;
const v3=correr(valid,null,{$input:{first:()=>({json:g3})}}).salida;
c(v3.error==='user_id_forma_invalida','E · un user_id mal formado lo sigue cazando el validador');

process.stdout.write('\n  '+ok+' verdes, '+ko+' rojas\n');
process.exit(ko?1:0);
