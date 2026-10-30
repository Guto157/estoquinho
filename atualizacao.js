// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// ATUALIZACAO V20 - 22:15 - FIX NOMES + CONTAGEM
// =========================================
console.log("V20 FIX NOMES + CONTAGEM");

// 1. NOMES ORIGINAIS QUE ESTAVAM FUNCIONANDO
window.gerarMissoes=function(){
 let nomesOriginais = {
  1:"Calote da Tia", 2:"Na Marra", 3:"Corrente", 4:"Juros Boteco", 5:"Teste de Fogo",
  6:"Fila do Fluxo", 7:"Vapor Sumiu", 8:"Dívida da Laje", 9:"Giro da Quebrada", 10:"Patrão Chegou"
 };
 let arr=[];
 for(let i=1;i<=50;i++){
  let tipo=i%5;
  let nome = nomesOriginais[i] || nomesOriginais[(i%5)+1] || `Missão ${i}`;
  let titulo = `${i}. ${nome}`;
  if(tipo==0){ let meta=6+Math.floor(i*0.9); arr.push({id:i,t:titulo,meta,premio:35,prog:0,tipo:"emp",obj:`Faça ${meta} empréstimos`}); }
  if(tipo==1){ let meta=900+i*280; arr.push({id:i,t:titulo,meta,premio:40,prog:0,tipo:"lucro",obj:`Acumule R$ ${meta} de lucro`}); }
  if(tipo==2){ let meta=8+Math.floor(i/1.6); arr.push({id:i,t:titulo,meta,premio:45,prog:0,tipo:"fama",obj:`Ganhe ${meta} de fama`}); }
  if(tipo==3){ let meta=6+Math.floor(i/2); arr.push({id:i,t:titulo,meta,premio:50,prog:0,tipo:"seq",obj:`Faça sequência de ${meta}`}); }
  if(tipo==4){ let meta=5+Math.floor(i/2.5); arr.push({id:i,t:titulo,meta,premio:55,prog:0,tipo:"juros",obj:`Cobre juros ${meta}x`}); }
 }
 return arr;
};

// Reseta só se tiver bugado
(function(){
 let ativas=window.ativasMissoes||[];
 let bugada=ativas.length>=3 && ativas.every(m=>m.tipo===ativas[0].tipo);
 if(bugada || ativas.length===0 || ativas[0].t.includes("Seq 15")){
  let todas=window.gerarMissoes();
  window.todasMissoes=todas;
  window.ativasMissoes=[todas.find(m=>m.id===5),todas.find(m=>m.id===1),todas.find(m=>m.id===2),todas.find(m=>m.id===3),todas.find(m=>m.id===4)];
  window.proxMissaoIdx=6;
  try{saveGame();}catch(e){}
 }
})();

// 2. CONTADOR PRÓPRIO QUE NÃO DEPENDE DO JOGO
window._mCont = JSON.parse(localStorage.getItem('p1p2_cont')||'{"emp":0,"lucro":0,"fama":0,"seq":0,"seqAtual":0,"juros":0}');

window.atualizarProgress=function(){
 if(!window.ativasMissoes) return;
 window.ativasMissoes.forEach(m=>{
  if(m.tipo==="emp") m.prog = window._mCont.emp;
  if(m.tipo==="lucro") m.prog = window._mCont.lucro;
  if(m.tipo==="fama") m.prog = window._mCont.fama;
  if(m.tipo==="seq") m.prog = window._mCont.seq;
  if(m.tipo==="juros") m.prog = window._mCont.juros;
  if(m.prog>m.meta) m.prog=m.meta;
 });
 try{localStorage.setItem('p1p2_cont', JSON.stringify(window._mCont));}catch(e){}
 try{saveGame();}catch(e){}
};

// 3. ENVOLVE O JOGAR PRA CONTAR DE VERDADE
(function(){
 if(typeof window.jogar!=='function') return;
 let orig=window.jogar;
 window.jogar=function(tipo){
  let curAntes = window.cur ? {...window.cur} : null;
  let r = orig.apply(this, arguments);
  
  // tipo 0=EMPRESTAR, 1=NEGAR, 2=JUROS (pelo seu jogo)
  if(tipo===0 || tipo==='emprestar'){
   window._mCont.emp++;
   if(curAntes) window._mCont.lucro += (curAntes.volta - curAntes.pede);
   window._mCont.seqAtual++;
   window._mCont.fama++;
   if(window._mCont.seqAtual > window._mCont.seq) window._mCont.seq = window._mCont.seqAtual;
  }else if(tipo===2 || tipo==='juros'){
   window._mCont.juros++;
   if(curAntes) window._mCont.lucro += (curAntes.juros - curAntes.pede);
   window._mCont.seqAtual++;
   if(window._mCont.seqAtual > window._mCont.seq) window._mCont.seq = window._mCont.seqAtual;
  }else if(tipo===1){
   window._mCont.seqAtual = 0; // negou quebrou sequência
  }
  
  window.atualizarProgress();
  if(document.getElementById('missoesModal')?.style.display==='flex') window.openMissoes();
  return r;
 };
})();

window.openMissoes=function(){
 let html='';
 (window.ativasMissoes||[]).forEach(m=>{
  let pct=Math.min(100,Math.floor((m.prog/m.meta*100)||0));
  html+=`<div class="card"><b>${m.t}</b><br><small>${m.obj} | ${m.tipo}</small><div class="progress"><div class="bar" style="width:${pct}%"></div></div><small>${m.prog}/${m.meta} ${pct}%</small>${m.prog>=m.meta?`<button class="btn verde" onclick="coletarMissao(${m.id})">COLETAR</button>`:''}</div>`;
 });
 document.getElementById('listaMissoes').innerHTML=html;
 document.getElementById('missoesModal').style.display='flex';
};

window.atualizarProgress();
console.log("Contadores atuais:", window._mCont);
