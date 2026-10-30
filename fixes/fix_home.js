// fixes/fix_home.js - CORRIGIDO DESCONTO
console.log("FIX NEGAR FINAL");

if(!window._fixHomeAplicado){
  window._fixHomeAplicado = true;
  
  window.taxaNegarAtual = 0;
  window.incrementoNegar = 5;
  window.vezesNegou = 0;

  window._novoOriginal = window.novo;
  window._emprestarOriginal = window.emprestar;

  function getMoneyNum(){
    let m = money;
    if(typeof m === 'string') m = m.replace('R$','').replace(/\D/g,'');
    return Number(m) || 500;
  }

  window.novo = function(){
    cur = null;
    window._novoOriginal();
    if(cur && cur.pedeAtual > getMoneyNum()){
      cur.pedeAtual = Math.max(10, Math.floor(getMoneyNum() * 0.8));
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
    money = getMoneyNum();
    let desconto = Number(window.taxaNegarAtual);
    
    console.log(`NEGAR #${window.vezesNegou+1} - Caixa: ${money} - Desconto: ${desconto}`);

    if(window.vezesNegou > 0){ // primeira vez não desconta
      money -= desconto;
    }

    window.vezesNegou++;
    
    // calcula próxima
    if(window.vezesNegou === 1){
      window.taxaNegarAtual = 5;
      window.incrementoNegar = 10;
    } else {
      window.taxaNegarAtual += window.incrementoNegar;
      window.incrementoNegar += 5;
    }
    if(window.taxaNegarAtual > 100) window.taxaNegarAtual = 100;

    if(money <= 0){ falencia(); return; }
    
    document.getElementById('money').innerText = 'R$' + money;
    if(window.save) save();
    if(window.addXp) addXp(1);
    
    window._novoOriginal();
    let btn = document.querySelector("#choices button:nth-child(2)");
    if(btn){
      btn.innerHTML = `❌ NEGAR<small>Paga R$${window.taxaNegarAtual}</small>`;
    }
  }

  window.emprestar = function(tipo){
    // abaixa 5 por 5
    if(window.taxaNegarAtual > 0){
      window.taxaNegarAtual = Math.max(0, window.taxaNegarAtual - 5);
      window.incrementoNegar = Math.max(5, window.incrementoNegar - 5);
      if(window.taxaNegarAtual === 0){
        window.vezesNegou = 0;
        window.incrementoNegar = 5;
      }
    }
    window._emprestarOriginal(tipo);
  }

  window.falencia = function(){
    money = 100;
    window.taxaNegarAtual = 0;
    window.incrementoNegar = 5;
    window.vezesNegou = 0;
    localStorage.removeItem('save');
    alert("💸 FALÊNCIA! Resetado");
    location.reload();
  }

  novo();
}
