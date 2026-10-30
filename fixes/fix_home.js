// fixes/fix_home.js - VERSÃO CORRIGIDA UNIFICADA
console.log("FIX HOME - UNIFICADO");

if(window._fixHomeAplicado) {
  console.log("fix já aplicado");
} else {
  window._fixHomeAplicado = true;

  if(window.taxaNegar === undefined) window.taxaNegar = 5;

  // guarda originais só uma vez
  window._novoOriginal = window.novo;
  window._emprestarOriginal = window.emprestar;

  window.novo = function(){
    cur = null;
    window._novoOriginal();

    if(cur && cur.pedeAtual > money){
      cur.pedeAtual = Math.max(10, Math.floor(money * 0.8));
      cur.voltaAtual = Math.floor(cur.pedeAtual * 2 * (1 + getTotalLucroBonus()/100));
      let elPede = document.getElementById('pede');
      let elVolta = document.getElementById('volta');
      if(elPede) elPede.innerText = 'R$' + cur.pedeAtual;
      if(elVolta) elVolta.innerText = 'R$' + cur.voltaAtual;
      
      let div = document.getElementById('choices');
      if(div && div.children[0]){
        div.children[0].innerHTML = `💵 EMPRESTAR R$${cur.pedeAtual}<small>Recebe R$${cur.voltaAtual}</small>`;
      }
    }
    // atualiza texto do negar
    let btnNegar = document.querySelector("#choices button:nth-child(2)");
    if(btnNegar){
      btnNegar.innerHTML = `❌ NEGAR<small>Paga R$${window.taxaNegar}</small>`;
    }
  }

  window.negar = function(){
    money -= window.taxaNegar;
    window.taxaNegar = Math.min(50, window.taxaNegar + 5);
    if(money <= 0){ falencia(); return; }
    if(window.save) save();
    if(window.addXp) addXp(1);
    if(document.getElementById('money')) document.getElementById('money').innerText = 'R$' + money;
    window._novoOriginal();
    // reaplica limite após negar
    if(cur && cur.pedeAtual > money){
      cur.pedeAtual = Math.max(10, Math.floor(money * 0.8));
      cur.voltaAtual = Math.floor(cur.pedeAtual * 2);
    }
    novo();
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

  // aplica já
  novo();
}
