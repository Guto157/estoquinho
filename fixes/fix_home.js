// fixes/fix_home.js - Sistema de NEGAR com taxa progressiva
console.log("FIX HOME - NEGAR CORRIGIDO");

if(window.taxaNegar === undefined) window.taxaNegar = 5;

window.negar = function(){
  // Cobra a taxa
  money -= window.taxaNegar;
  
  // Mostra no histórico se tiver
  if(window.addHist) addHist(`🚫 Negou - pagou taxa R$${window.taxaNegar}`, 'neutra');
  
  // Aumenta gradativo: +5 por vez, máx 50
  window.taxaNegar = Math.min(50, window.taxaNegar + 5);
  
  // Se cobrar e falir
  if(money <= 0){
    falencia();
    return;
  }

  save();
  addXp(1);
  novo();
  
  // Atualiza botão com valor atual
  let btnNegar = document.querySelector("#choices button:nth-child(2)");
  if(btnNegar){
    btnNegar.innerHTML = `❌ NEGAR<small>Paga R$${window.taxaNegar} (anti-spam)</small>`;
  }
  document.getElementById('money').innerText = 'R$' + money;
}

window.falencia = function(){
  money = 100;
  window.taxaNegar = 5; // reseta taxa
  localStorage.removeItem('save');
  alert("💸 FALÊNCIA! Recomeçando com R$100 - taxa de negar resetada");
  location.reload();
}

// Zera taxa quando empresta (recompensa quem joga)
let emprestarOriginal = window.emprestar;
window.emprestar = function(tipo){
  window.taxaNegar = 5; // resetou porque jogou
  emprestarOriginal(tipo);
}

// Corrige limite de caixa no novo()
let novoOriginal = window.novo_original || window.novo;
window.novo_original = novoOriginal;
window.novo = function(){
  cur = null;
  novoOriginal();
  if(cur && cur.pedeAtual > money){
    cur.pedeAtual = Math.max(10, Math.floor(money * 0.8));
    cur.voltaAtual = Math.floor(cur.pedeAtual * 2 * (1 + getTotalLucroBonus()/100));
    let elPede = document.getElementById('pede');
    let elVolta = document.getElementById('volta');
    if(elPede) elPede.innerText = 'R$' + cur.pedeAtual;
    if(elVolta) elVolta.innerText = 'R$' + cur.voltaAtual;
  }
}
