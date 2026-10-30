// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// ATUALIZACAO V17 - 29/10 22:00 - FIX MISSÕES REPETIDAS
// =========================================
console.log("V17 FIX MISSÕES");

window.gerarMissoes=function(){
 let arr=[];
 let nomes=["","Teste de Fogo","Calote da Tia","Na Marra","Corrente","Juros Boteco"];
 for(let i=1;i<=50;i++){
  let tipo=i%5;
  let meta, premio, tipoStr, obj;
  let nome = nomes[(i%5)+1] || "Missão "+i;
  let titulo = `${i}. ${nome}`;
  if(tipo==0){meta=6+Math.floor(i*0.9);premio=35+Math.floor(i*2.5);tipoStr="emp";obj=`Faça ${meta} empréstimos`;arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr,obj});}
  if(tipo==1){meta=900+i*280;premio=40+Math.floor(i*3);tipoStr="lucro";obj=`Acumule R$ ${meta} de lucro`;arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr,obj});}
  if(tipo==2){meta=8+Math.floor(i/1.6);premio=45+Math.floor(i*2.8);tipoStr="fama";obj=`Ganhe ${meta} de fama`;arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr,obj});}
  if(tipo==3){meta=6+Math.floor(i/2);premio=50+Math.floor(i*3);tipoStr="seq";obj=`Faça sequência de ${meta}`;arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr,obj});}
  if(tipo==4){meta=5+Math.floor(i/2.5);premio=55+Math.floor(i*3.2);tipoStr="juros";obj=`Cobre juros ${meta}x`;arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr,obj});}
 }
 return arr;
};

window.resetMissoesBugadas=function(){
 let ativas = window.ativasMissoes||[];
 let todosIguais = ativas.length>=3 && ativas.every(m=>m.tipo===ativas[0].tipo);
 if(todosIguais || ativas.length===0){
   console.log("Resetando missões bugadas");
   let todas = window.gerarMissoes();
   window.todasMissoes = todas;
   // Pega 1 de cada tipo pra ficar diverso
   let emp = todas.filter(m=>m.tipo==="emp")[0];
   let lucro = todas.filter(m=>m.tipo==="lucro")[0];
   let fama = todas.filter(m=>m.tipo==="fama")[0];
   let seq = todas.filter(m=>m.tipo==="seq")[0];
   let juros = todas.filter(m=>m.tipo==="juros")[0];
   window.ativasMissoes = [emp,lucro,fama,seq,juros].filter(Boolean);
   window.proxMissaoIdx = 5;
   try{saveGame();}catch(e){}
 }
};

window.openMissoes=function(){
 window.resetMissoesBugadas();
 let html='';
 (window.ativasMissoes||[]).forEach(m=>{
  let pct=Math.min(100,Math.floor((m.prog/m.meta*100)));
  html+=`<div class="card"><b>${m.t}</b><small style="display:block;opacity:0.8;margin:4px 0">${m.obj} | ${m.tipo}</small><div class="progress"><div class="bar" style="width:${pct}%"></div></div><small>${m.prog}/${m.meta} ${pct}%</small>${m.prog>=m.meta?`<button class="btn verde" onclick="coletarMissao(${m.id})">COLETAR 💲</button>`:''}</div>`;
 });
 document.getElementById('listaMissoes').innerHTML=html;
 document.getElementById('missoesModal').style.display='flex';
};

// Mantém o FIX 2x / 2.1x que já corrigimos
(function(){
  function fixValores(){ if(!window.cur) return; let caixa=(typeof money!=='undefined'?money:(window.money||500)); let pede=window.cur.pede||window.cur.valor||0; if(pede>caixa) pede=Math.floor(caixa*0.8); let volta=Math.floor(pede*2); let juros=Math.floor(pede*2.1); window.cur.pede=window.cur.valor=pede; window.cur.volta=volta; window.cur.juros=juros; }
  if(typeof window.novo==='function'){ let o=window.novo; window.novo=function(){ let r=o.apply(this,arguments); fixValores(); try{renderSlots();}catch(e){} return r; }; }
})();

window.resetMissoesBugadas();
