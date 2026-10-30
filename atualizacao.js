// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// ATUALIZACAO V15 - 29/10 21:52 - TRAVA PEDIDO NO CAIXA
// =========================================
console.log("V15 TRAVA CAIXA");

// --- FIX: CLIENTE NÃO PODE PEDIR MAIS QUE O CAIXA ---
(function(){
 function getCaixa(){ return Math.max(10, (typeof money!=='undefined'?money:(window.money||500))); }
 function getLevel(){ return Math.max(1, (typeof level!=='undefined'?level:(window.level||1))); }
 function aplicarFix(){
   if(!window.cur) return;
   let caixa = getCaixa();
   let maxPede = Math.floor(caixa * 0.8);
   let pedeAtual = window.cur.pede || window.cur.valor || 0;
   if(pedeAtual > maxPede || pedeAtual > caixa){
     let base = Math.min(20 + getLevel()*12 + Math.floor(Math.random()*15), maxPede);
     let ratioVolta = (window.cur.volta||pedeAtual*2.1) / (pedeAtual||1);
     let ratioJuros = (window.cur.juros||pedeAtual*2.25) / (pedeAtual||1);
     window.cur.pede = window.cur.valor = window.cur.v = base;
     window.cur.volta = Math.floor(base * ratioVolta);
     window.cur.juros = Math.floor(base * ratioJuros);
     try{renderSlots();}catch(e){}
   }
 }
 let orig = window.novo;
 if(typeof orig==='function'){
   window.novo = function(){ let r=orig.apply(this,arguments); aplicarFix(); return r; };
 } else {
   let iv=setInterval(()=>{ if(typeof window.novo==='function'){ clearInterval(iv); let o=window.novo; window.novo=function(){ let r=o.apply(this,arguments); aplicarFix(); return r; }; } },300);
 }
})();
