// fixes/fix_desafios.js - SÓ VISUAL, NÃO QUEBRA NADA
(function(){
  console.log("FIX DESAFIOS VISUAL");

  function atualizar(){
    const container = document.getElementById('desafiosTab') || document.getElementById('listaDesafios') || document.querySelector('#desafios');
    if(!container) return;

    const cards = container.children;
    for(let card of cards){
      if(card.querySelector('.barra-fix')) continue; // já tem

      // Tenta pegar meta do texto do card
      let txt = card.innerText;
      let atual = window.totalEmp || 0;
      let meta = 100;

      if(txt.match(/10\b/) && !txt.match(/100/)) meta = 10;
      if(txt.match(/100\b/)) meta = 100;
      if(txt.includes('1000')) meta = 1000;

      let pct = Math.min(100, Math.floor((atual/meta)*100));

      let barra = document.createElement('div');
      barra.className = 'barra-fix';
      barra.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:900;margin-bottom:3px">
          <span>PROGRESSO</span><span style="color:#FFD600">${atual}/${meta}</span>
        </div>
        <div style="width:100%;height:8px;background:#111;border-radius:10px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:#FFD600"></div>
        </div>
      `;
      barra.style.marginBottom = '8px';
      card.insertBefore(barra, card.firstChild);
    }
  }

  setInterval(atualizar, 1000);
})();
