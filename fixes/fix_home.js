// fixes/fix_home.js - Corrige valor do empréstimo pra não pedir mais que o caixa
console.log("FIX HOME CARREGADO");

window.novo_original = window.novo;

window.novo = function() {
  window.novo_original();

  if(!cur) return;

  // Se pede mais do que tem, limita
  if(cur.pedeAtual > money){
    cur.pedeAtual = Math.max(10, Math.floor(money * 0.8));
    cur.voltaAtual = Math.floor(cur.pedeAtual * 2 * (1 + getTotalLucroBonus()/100));
    
    // Atualiza na tela
    document.getElementById('pede').innerText = 'R$' + cur.pedeAtual;
    document.getElementById('volta').innerText = 'R$' + cur.voltaAtual;
    
    // Atualiza os botões
    let div = document.getElementById('choices');
    if(div && div.children[0]){
      div.children[0].innerHTML = `💵 EMPRESTAR R$${cur.pedeAtual}<small>Recebe R$${cur.voltaAtual} | Chance ${cur.chanceAtual.toFixed(0)}% (+${getTotalChanceBonus()}% itens)</small>`;
      div.children[2].innerHTML = `😈 JUROS R$${cur.voltaAtual+80}<small>Lucro +80 mas chance -30%</small>`;
    }
  }

  // Se caixa muito baixo, força cliente BAIXO
  if(money < 100 && cur.r === 'ALTO'){
    window.novo_original();
  }
}
