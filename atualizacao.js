// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// ATUALIZACAO V7 - 29/10 21:18 - Força exibição dos nomes novos sem mexer no index
// =========================================
console.log("V7 MAPA PRESERVADO CARREGADO");

const NOMES_NOVOS = {
15:"15. Chapa Quente na Laje",
17:"17. Calote da Tia do Zé",
20:"20. Rastreio Brabo no Beco",
22:"22. Grana da Festa",
25:"25. Corre do Agiota",
6:"6. Nome Pesado no Morro",7:"7. Fluxo de Cobrança",8:"8. Taxa do Atrasadinho",9:"9. Giro da Madrugada",10:"10. Troco da Birosca",
11:"11. Quem Não Paga Se Explica",12:"12. Fila de Devedor",13:"13. Multa de Otário",14:"14. Giro no Campinho",
16:"16. Lucro Suado da Laje",18:"18. Voz no Baile Funk",19:"19. Sequência Braba",21:"21. Juros do Padrinho",
23:"23. Moral na Comunidade",24:"24. Cobrança Sem Pena",26:"26. Plantão 24h"
};

const _openOriginal = window.openMissoes;

window.openMissoes = function(){
  let html='';
  (window.ativasMissoes||[]).forEach(m=>{
    let pct=Math.min(100, Math.floor((m.prog/m.meta)*100));
    let nomeExibir = NOMES_NOVOS[m.id] || m.t;
    // se for missão de Seq, adiciona a meta pra ficar igual print
    if(m.t && m.t.toLowerCase().includes("seq")){
      nomeExibir = (NOMES_NOVOS[m.id] || "Seq "+m.id) + " - Sequência " + m.meta;
    }
    html+=`<div class="card"><b>${nomeExibir} ${m.prog>=m.meta?'💲':''}</b><div class="progress"><div class="bar" style="width:${pct}%"></div></div><small>${m.prog}/${m.meta} ${pct}%</small>${m.prog>=m.meta?`<button class="btn verde" onclick="coletarMissao(${m.id})">COLETAR 💲</button>`:''}</div>`;
  });
  document.getElementById('listaMissoes').innerHTML=html;
  document.getElementById('missoesModal').style.display='flex';
};

window.closeMissoes = function(){
  document.getElementById('missoesModal').style.display='none';
};

// tenta salvar nome novo pro futuro
setTimeout(()=>{
  try{
    (window.ativasMissoes||[]).forEach(m=>{ if(NOMES_NOVOS[m.id]) m.t = NOMES_NOVOS[m.id]+" - Sequência "+m.meta; });
    if(typeof saveGame==='function') saveGame();
  }catch(e){}
}, 1200);
