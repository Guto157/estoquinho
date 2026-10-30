// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// ATUALIZACAO V16 - 29/10 21:55 - FIX MULTIPLICADOR FIXO + MISSOES ATUALIZANDO
// =========================================
console.log("V16 FIX 2x / 2.1x + MISSÕES");

(function(){
  function getCaixa(){ return (typeof money!=='undefined'?money:(window.money||500)); }
  
  function fixValores(){
    if(!window.cur) return;
    let caixa = getCaixa();
    let pede = window.cur.pede || window.cur.valor || 0;
    
    // Trava no caixa - não pode pedir mais que tem
    if(pede > caixa) pede = Math.floor(caixa * 0.8);

    // REGRA FIXA
    let volta = Math.floor(pede * 2);      // Emprestar X = Recebe X*2
    let juros = Math.floor(pede * 2.1);    // Juros X = Recebe X*2.1

    window.cur.pede = window.cur.valor = window.cur.v = pede;
    window.cur.volta = window.cur.retorno = volta;
    window.cur.juros = window.cur.valorJuros = juros;
  }

  // 1. Envolve novo() pra corrigir na criação do cliente
  if(typeof window.novo==='function'){
    let origNovo = window.novo;
    window.novo = function(){ let r=origNovo.apply(this,arguments); fixValores(); try{renderSlots();}catch(e){} return r; };
    fixValores();
  }

  // 2. Envolve jogar() pra missões atualizarem
  if(typeof window.jogar==='function'){
    let origJogar = window.jogar;
    window.jogar = function(tipo){
      let r = origJogar.apply(this,arguments);
      // Força atualizar missões depois de cada jogada
      setTimeout(()=>{
        try{ if(typeof atualizarProgress==='function') atualizarProgress(); }catch(e){}
        try{ if(typeof atualizarNotificacoes==='function') atualizarNotificacoes(); }catch(e){}
        try{ if(typeof saveGame==='function') saveGame(); }catch(e){}
        // Se tiver missão pronta, atualiza o modal se estiver aberto
        let modal = document.getElementById('missoesModal');
        if(modal && modal.style.display==='flex'){
          try{ if(typeof openMissoes==='function'){ 
            // re-render sem fechar
            let html=''; (window.ativasMissoes||[]).forEach(m=>{
              let pct=Math.min(100,Math.floor((m.prog/m.meta*100)));
              html+=`<div class="card"><b>${m.t} ${m.prog>=m.meta?'💲':''}</b><small style="display:block;opacity:0.8;margin:4px 0">${m.obj||''}</small><div class="progress"><div class="bar" style="width:${pct}%"></div></div><small>${m.prog}/${m.meta} ${pct}%</small>${m.prog>=m.meta?`<button class="btn verde" onclick="coletarMissao(${m.id})">COLETAR 💲</button>`:''}</div>`;
            });
            document.getElementById('listaMissoes').innerHTML=html;
          } }catch(e){}
        }
      },100);
      return r;
    };
    console.log("FIX jogar() aplicado");
  }
})();
