// =========================================
// MAPA - PEGA 1 PAGA 2 v1.0
// Vars: money,dolar,day,level,fame,inv,usado,totalEmp,totalLucro,seq,jurosCount,cur,ativasMissoes,todasMissoes
// Funcs: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), closeMissoes(), coletarMissao()
// FIX V5: Mostra nome novo mesmo com cache velho - FORÇA DISPLAY
// =========================================
console.log("V5 FORCANDO NOMES NOVOS");

const NOMES_NOVOS = {
15:"15. Teste de Fogo na Laje - Sequência 13",
17:"17. O Calote da Tia do Zé - Sequência 14",
20:"20. Rastreando Caloteiros - Sequência 16",
22:"22. Grana da Festa - Sequência 17",
25:"25. Corre do Agiota - Sequência 18",
6:"6. Nome Pesado no Morro", 7:"7. Fluxo de Cobrança", 8:"8. Taxa do Atrasadinho", 9:"9. Giro da Madrugada", 10:"10. O Troco da Birosca",
11:"11. Quem Não Paga Se Explica",12:"12. Fila de Devedor",13:"13. Multa de Otário",14:"14. Giro no Campinho",
16:"16. Lucro Suado da Laje",18:"18. Voz no Baile Funk",19:"19. Sequência Braba",21:"21. Juros do Padrinho",
23:"23. Moral na Comunidade",24:"24. Cobrança Sem Pena",26:"26. Plantão 24h",27:"27. Troco do Role",
28:"28. Respeito do Dono",29:"29. Fila Quilométrica",30:"30. Juros da Esquina"
};
// completa até 50
for(let i=1;i<=50;i++) if(!NOMES_NOVOS[i]) NOMES_NOVOS[i]= i+". Missão da Laje "+i;

// Sobrescreve só a exibição, não o save
window.openMissoes = function(){
  let html='';
  (window.ativasMissoes||[]).forEach(m=>{
    let pct=Math.min(100,Math.floor((m.prog/m.meta)*100));
    let nomeBonito = NOMES_NOVOS[m.id] || m.t || ("Missão "+m.id);
    // se for seq, mantém o numero da meta
    if(m.t && m.t.toLowerCase().includes("seq")) nomeBonito = nomeBonito.split(" - ")[0] + ` - Sequência ${m.meta}`;
    html+=`<div class="card"><b>${nomeBonito} ${m.prog>=m.meta?'💲':''}</b><div class="progress"><div class="bar" style="width:${pct}%"></div></div><small>${m.prog}/${m.meta} ${pct}%</small>${m.prog>=m.meta?`<button class="btn verde" onclick="coletarMissao(${m.id})">COLETAR 💲</button>`:''}</div>`;
  });
  document.getElementById('listaMissoes').innerHTML=html;
  document.getElementById('missoesModal').style.display='flex';
};

window.closeMissoes = function(){
  document.getElementById('missoesModal').style.display='none';
}

// Também tenta corrigir o save pra próxima vez
setTimeout(()=>{
  try{
    (window.ativasMissoes||[]).forEach(m=>{ if(NOMES_NOVOS[m.id]) m.t = NOMES_NOVOS[m.id]; });
    if(typeof saveGame==='function') saveGame();
    console.log("SAVE CORRIGIDO");
  }catch(e){}
}, 1000);
