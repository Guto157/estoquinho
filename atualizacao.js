// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// ATUALIZACAO V21 - 22:20 - FIX COLETAR + FALÊNCIA
// =========================================
console.log("V21 FIX COLETAR");

// Mantém contador da V20
window._mCont = JSON.parse(localStorage.getItem('p1p2_cont')||'{"emp":0,"lucro":0,"fama":0,"seq":0,"seqAtual":0,"juros":0}');

// COLETAR QUE FUNCIONA MESMO DEPOIS DE FALÊNCIA
window.coletarMissao = function(id){
  if(!window.ativasMissoes) return;
  let idx = window.ativasMissoes.findIndex(m=>m.id==id);
  if(idx===-1) return;
  let m = window.ativasMissoes[idx];
  
  if(m.prog < m.meta){
    alert(`Ainda não completou: ${m.prog}/${m.meta}`);
    return;
  }
  
  // Paga prêmio
  let premio = m.premio||50;
  if(typeof money!=='undefined') money += premio;
  else if(window.money!=null) window.money += premio;
  
  // Tira essa e puxa a próxima da fila
  window.ativasMissoes.splice(idx,1);
  if(window.todasMissoes && window.proxMissaoIdx < window.todasMissoes.length){
    let proxima = window.todasMissoes[window.proxMissaoIdx];
    // Reseta progresso da próxima com base no contador atual
    if(proxima.tipo==="emp") proxima.prog = window._mCont.emp;
    if(proxima.tipo==="lucro") proxima.prog = window._mCont.lucro;
    if(proxima.tipo==="fama") proxima.prog = window._mCont.fama;
    if(proxima.tipo==="seq") proxima.prog = window._mCont.seq;
    if(proxima.tipo==="juros") proxima.prog = window._mCont.juros;
    window.ativasMissoes.push(proxima);
    window.proxMissaoIdx++;
  }
  
  try{saveGame();}catch(e){}
  try{localStorage.setItem('p1p2_cont', JSON.stringify(window._mCont));}catch(e){}
  
  // Atualiza tela
  try{renderSlots();}catch(e){}
  window.openMissoes();
  console.log(`Missão ${m.t} coletada +R$${premio}`);
};

// FIX FALÊNCIA NÃO ZERAR O CONTADOR
(function(){
  // Se o jogo tem função de falência / game over
  if(typeof window.check==='function'){
    let origCheck = window.check;
    window.check = function(){
      let r = origCheck.apply(this, arguments);
      // Se faliu (money <=0) NÃO apaga _mCont
      if((typeof money!=='undefined' && money<=0) || (window.money!=null && window.money<=0)){
        console.log("Faliu mas mantendo progresso das missões", window._mCont);
        try{localStorage.setItem('p1p2_cont', JSON.stringify(window._mCont));}catch(e){}
      }
      return r;
    };
  }
})();

// Garante que atualizarProgress não zera na falência
window.atualizarProgress = function(){
  if(!window.ativasMissoes) return;
  window.ativasMissoes.forEach(m=>{
    // Só atualiza se contador atual for MAIOR que o prog salvo (não deixa voltar pra trás)
    let valorAtual = 0;
    if(m.tipo==="emp") valorAtual = window._mCont.emp;
    if(m.tipo==="lucro") valorAtual = window._mCont.lucro;
    if(m.tipo==="fama") valorAtual = window._mCont.fama;
    if(m.tipo==="seq") valorAtual = window._mCont.seq;
    if(m.tipo==="juros") valorAtual = window._mCont.juros;
    
    if(valorAtual > m.prog) m.prog = valorAtual;
    if(m.prog > m.meta) m.prog = m.meta;
  });
  try{saveGame();}catch(e){}
};

window.openMissoes();
