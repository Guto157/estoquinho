// fixes/fix_home.js - TAXA NEGAR CUMULATIVA
console.log("FIX NEGAR CUMULATIVO");

if(!window._fixHomeAplicado){
  window._fixHomeAplicado = true;
  
  window.taxaNegarAtual = 0; // o que vai descontar agora
  window.incrementoNegar = 5; // quanto soma na próxima

  window._novoOriginal = window.novo;
  window._emprestarOriginal = window.emprestar;

  window.novo = function(){
    cur = null;
    window._novoOriginal();
    // limite de caixa
    if(cur && cur.pedeAtual > money){
      cur.pedeAtual = Math.max(10, Math.floor(money * 0.8));
      cur.voltaAtual = Math.floor(cur.pedeAtual * 2);
      document.getElementById('pede').innerText = 'R$' + cur.pedeAtual;
      document.getElementById('volta').innerText = 'R$' + cur.voltaAtual;
    }
    let btn = document.querySelector("#choices button:nth-child(2)");
    if(btn){
      btn.innerHTML = window.taxaNegarAtual === 0 ? `❌ NEGAR<small>Grátis</small>` : `❌ NEGAR<small>Paga R$${window.taxaNegarAtual}</small>`;
    }
  }

  window.negar = function(){
    // desconta
    money = Number(money) - Number(window.taxaNegarAtual);
    
    // prepara próxima taxa: soma incremento
    window.taxaNegarAtual += window.incrementoNegar;
    window.incrementoNegar += 5;
    
    // trava em 100 pra não exagerar
    if(window.taxaNegarAtual > 100) window.taxaNegarAtual = 100;
    
    if(money <= 0){ falencia(); return; }
    
    if(window.save) save();
    if(window.addXp) addXp(1);
    document.getElementById('money').innerText = 'R$' + money;
    
    window._novoOriginal();
    if(cur && cur.pedeAtual > money){
      cur.pedeAtual = Math.max(10, Math.floor(money * 0.8));
      document.getElementById('pede').innerText = 'R$' + cur.pedeAtual;
    }
    let btn = document.querySelector("#choices button:nth-child(2)");
    if(btn){
      btn.innerHTML = `❌ NEGAR<small>Paga R$${window.taxaNegarAtual}</small>`;
    }
  }

  window.emprestar = function(tipo){
    // se emprestou, a taxa vai abaixando 5 por 5
    if(window.taxaNegarAtual > 0){
      window.taxaNegarAtual = Math.max(0, window.taxaNegarAtual - 5);
      window.incrementoNegar = Math.max(5, window.incrementoNegar - 5);
    }
    if(window.taxaNegarAtual === 0) window.incrementoNegar = 5;
    
    window._emprestarOriginal(tipo);
  }

  window.falencia = function(){
    money = 100;
    window.taxaNegarAtual = 0;
    window.incrementoNegar = 5;
    localStorage.removeItem('save');
    alert("💸 FALÊNCIA! Resetado");
    location.reload();
  }

  novo();
}
