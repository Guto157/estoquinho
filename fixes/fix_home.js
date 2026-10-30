// fixes/fix_home.js - VERSÃO FINAL CORRIGIDA
console.log("FIX HOME - UNIFICADO FINAL");

if(!window._fixHomeAplicado){
  window._fixHomeAplicado = true;
  window.taxaNegar = 5;

  window._novoOriginal = window.novo;
  window._emprestarOriginal = window.emprestar;

  window.novo = function(){
    cur = null;
    window._novoOriginal();
    if(cur && cur.pedeAtual > money){
      cur.pedeAtual = Math.max(10, Math.floor(money * 0.8));
      cur.voltaAtual = Math.floor(cur.pedeAtual * 2 * (1 + (window.getTotalLucroBonus ? getTotalLucroBonus() : 0)/100));
      let elPede = document.getElementById('pede');
      let elVolta = document.getElementById('volta');
      if(elPede) elPede.innerText = 'R$' + cur.pedeAtual;
      if(elVolta) elVolta.innerText = 'R$' + cur.voltaAtual;
    }
    let btnNegar = document.querySelector("#choices button:nth-child(2)");
    if(btnNegar){
      btnNegar.innerHTML = `❌ NEGAR<small>Paga R$${window.taxaNegar}</small>`;
    }
  }

  window.negar = function(){
    money = Number(money) - Number(window.taxaNegar);
    window.taxaNegar = Math.min(50, window.taxaNegar + 5);
    if(money <= 0){ falencia(); return; }
    if(window.save) save();
    if(window.addXp) addXp(1);
    document.getElementById('money').innerText = 'R$' + money;
    window._novoOriginal();
    // reaplica limite
    if(cur && cur.pedeAtual > money){
      cur.pedeAtual = Math.max(10, Math.floor(money * 0.8));
      document.getElementById('pede').innerText = 'R$' + cur.pedeAtual;
    }
    let btnNegar = document.querySelector("#choices button:nth-child(2)");
    if(btnNegar){
      btnNegar.innerHTML = `❌ NEGAR<small>Paga R$${window.taxaNegar}</small>`;
    }
  }

  window.emprestar = function(tipo){
    window.taxaNegar = 5;
    window._emprestarOriginal(tipo);
  }

  window.falencia = function(){
    money = 100;
    window.taxaNegar = 5;
    localStorage.removeItem('save');
    alert("💸 FALÊNCIA! Recomeçando com R$100");
    location.reload();
  }

  novo();
}
