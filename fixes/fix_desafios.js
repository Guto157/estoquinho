// fixes/fix_desafios.js - DESAFIOS COM BARRA 12/100
console.log("FIX DESAFIOS CARREGADO");

window.desafios = [
  { id: 'emp10', nome: 'Agiota Iniciante', desc: 'Faça 10 empréstimos', meta: 10, atual: 0, premio: 200 },
  { id: 'emp100', nome: 'Agiota Profissional', desc: 'Faça 100 empréstimos', meta: 100, atual: 0, premio: 2000 },
  { id: 'lucro5k', nome: 'Primeiro Lucro', desc: 'Lucre R$ 5.000', meta: 5000, atual: 0, premio: 500 },
  { id: 'lucro50k', nome: 'Patrão', desc: 'Lucre R$ 50.000', meta: 50000, atual: 0, premio: 5000 },
  { id: 'juros10', nome: 'Juros é Vida', desc: 'Use juros 10x', meta: 10, atual: 0, premio: 300 },
  { id: 'seq5', nome: 'Sequência Quente', desc: '5 pagamentos seguidos', meta: 5, atual: 0, premio: 400 },
  { id: 'day30', nome: 'Sobrevivente', desc: 'Chegue no dia 30', meta: 30, atual: 0, premio: 1000 }
];

window.carregarDesafios = function(){
  let salvo = localStorage.getItem('desafios_'+currentUser);
  if(salvo){
    try{
      let data = JSON.parse(salvo);
      data.forEach(s=>{
        let d = window.desafios.find(x=>x.id===s.id);
        if(d) d.atual = s.atual;
      });
    }catch(e){}
  }
}

window.salvarDesafios = function(){
  localStorage.setItem('desafios_'+currentUser, JSON.stringify(window.desafios.map(d=>({id:d.id, atual:d.atual}))));
}

window.renderDesafios = function(){
  let container = document.getElementById('desafiosContainer');
  if(!container){
    // cria o container se não existir
    container = document.createElement('div');
    container.id = 'desafiosContainer';
    container.style.cssText = 'padding:10px;display:flex;flex-direction:column;gap:10px';
    let parent = document.getElementById('desafiosTab') || document.body;
    parent.appendChild(container);
  }
  container.innerHTML = '';
  window.desafios.forEach(d=>{
    let pct = Math.min(100, Math.floor((d.atual/d.meta)*100));
    let completo = d.atual >= d.meta;
    let div = document.createElement('div');
    div.style.cssText = 'background:#1a1a1a;border:1px solid '+(completo?'#00E676':'#333')+';border-radius:10px;padding:10px';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-weight:900;font-size:13px">
        <span>${completo?'✅ ':''}${d.nome}</span>
        <span style="color:${completo?'#00E676':'#FFD600'}">${d.atual}/${d.meta}</span>
      </div>
      <div style="font-size:11px;color:#888;margin:3px 0">${d.desc} - Prêmio R$${d.premio}</div>
      <div style="background:#000;height:10px;border-radius:10px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${completo?'#00E676':'#FFD600'};transition:width 0.5s"></div>
      </div>
    `;
    container.appendChild(div);
  });
}

window.atualizarDesafios = function(){
  // atualiza os valores com base no jogo
  window.desafios.forEach(d=>{
    if(d.id.startsWith('emp')) d.atual = totalEmp || 0;
    if(d.id==='emp10') d.atual = Math.min(d.meta, totalEmp||0);
    if(d.id==='emp100') d.atual = Math.min(d.meta, totalEmp||0);
    if(d.id.startsWith('lucro')) d.atual = Math.min(d.meta, totalLucro||0);
    if(d.id==='juros10') d.atual = Math.min(d.meta, jurosCount||0);
    if(d.id==='seq5') d.atual = Math.min(d.meta, seq||0);
    if(d.id==='day30') d.atual = Math.min(d.meta, day||1);
  });

  // verifica se completou
  window.desafios.forEach(d=>{
    if(d.atual >= d.meta && !d.entregue){
      d.entregue = true;
      money += d.premio;
      fb(d.premio,'g');
      log(`🏆 Desafio completo: ${d.nome} +R$${d.premio}`);
      alert(`🏆 DESAFIO COMPLETO!\n${d.nome}\n+ R$${d.premio}`);
    }
  });

  salvarDesafios();
  renderDesafios();
}

// Hook para contar automaticamente quando empresta
let _oldCheck = window.check;
window.check = function(){
  if(_oldCheck) _oldCheck();
  atualizarDesafios();
}

carregarDesafios();
setTimeout(()=>{renderDesafios(); atualizarDesafios();}, 500);
