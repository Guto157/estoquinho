// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// =========================================

// --- CORREÇÃO: VALOR PEDIDO NUNCA MAIOR QUE CAIXA ---
(function(){
  let _cur = window.cur;
  Object.defineProperty(window,'cur',{
    get(){return _cur},
    set(v){
      if(v && v.pede){
        let caixa = window.money||0;
        if(caixa>0 && v.pede>caixa){
          let np = Math.floor(caixa*0.8);
          if(np<10) np = Math.min(10, caixa);
          v.pede = v.valor = np;
        }
        v.volta = Math.floor(v.pede*2);
        v.juros = Math.floor(v.pede*2.1);
      }
      _cur = v;
    },
    configurable:true
  });
})();
