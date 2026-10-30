// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// CORREÇÃO V22 - VALOR PEDIDO NUNCA MAIOR QUE CAIXA + 2x / 2.1x FIXO
// =========================================

(function(){
  if(typeof window.novo!=='function') return;
  let origNovo = window.novo;
  window.novo = function(){
    let r = origNovo.apply(this, arguments);
    if(!window.cur) return r;
    let caixa = (typeof money!=='undefined'?money:window.money)||0;
    let pede = window.cur.pede||window.cur.valor||0;
    if(pede > caixa || pede==0){
      let novoPede = Math.floor(caixa*0.8);
      if(novoPede<10) novoPede = Math.min(10, caixa);
      if(novoPede<1) novoPede = 1;
      window.cur.pede = window.cur.valor = window.cur.v = novoPede;
      window.cur.volta = Math.floor(novoPede*2);
      window.cur.retorno = window.cur.volta;
      window.cur.juros = Math.floor(novoPede*2.1);
      window.cur.valorJuros = window.cur.juros;
      try{renderSlots();}catch(e){}
    }
    return r;
  };
  // Corrige o que já está na tela agora
  if(window.cur){
    let caixa = (typeof money!=='undefined'?money:window.money)||0;
    if(window.cur.pede > caixa){
      window.novo();
    }
  }
})();
