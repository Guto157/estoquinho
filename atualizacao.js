// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// ATUALIZACAO V19 - 22:10 - FIX BARRA DE MISSÃO NÃO SOBE
// =========================================
console.log("V19 BARRA MISSÃO");

// FORÇA O CONTADOR USAR AS VARIAVEIS REAIS DO JOGO
window.atualizarProgress = function(){
  if(!window.ativasMissoes) return;
  let totalEmp = (typeof totalEmp!=='undefined'?totalEmp:(window.totalEmp||0));
  let totalLucro = (typeof totalLucro!=='undefined'?totalLucro:(window.totalLucro||0));
  let fame = (typeof fame!=='undefined'?fame:(window.fame||0));
  let seq = (typeof seq!=='undefined'?seq:(window.seq||0));
  let jurosCount = (typeof jurosCount!=='undefined'?jurosCount:(window.jurosCount||0));

  window.ativasMissoes.forEach(m=>{
    if(m.tipo==="emp") m.prog = totalEmp;
    if(m.tipo==="lucro") m.prog = totalLucro;
    if(m.tipo==="fama") m.prog = fame;
    if(m.tipo==="seq") m.prog = seq;
    if(m.tipo==="juros") m.prog = jurosCount;
    if(m.prog > m.meta) m.prog = m.meta;
  });

  try{ if(typeof atualizarNotificacoes==='function') atualizarNotificacoes(); }catch(e){}
  try{ if(typeof saveGame==='function') saveGame(); }catch(e){}
  
  // Se o modal estiver aberto, atualiza na hora
  let lista = document.getElementById('listaMissoes');
  if(lista && document.getElementById('missoesModal').style.display==='flex'){
    window.openMissoes();
  }
};

// Garante que jogar() chama o progresso
(function(){
  if(typeof window.jogar==='function'){
    let orig = window.jogar;
    window.jogar = function(tipo){
      let r = orig.apply(this, arguments);
      setTimeout(()=>{ window.atualizarProgress(); }, 50);
      return r;
    };
  }
})();

// Mantém o fix do CAIXA que já funcionou
setInterval(()=>{
 if(!window.cur || !window.money) return;
 let caixa = window.money;
 let pede = window.cur.pede||0;
 if(pede>caixa){
  let novoPede=Math.floor(caixa*0.8);
  if(novoPede<10) novoPede=10;
  window.cur.pede=window.cur.valor=novoPede;
  window.cur.volta=Math.floor(novoPede*2);
  window.cur.juros=Math.floor(novoPede*2.1);
  try{renderSlots();}catch(e){}
 }
}, 500);

window.atualizarProgress();
