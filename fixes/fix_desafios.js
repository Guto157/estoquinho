// fixes/fix_desafios.js - FINAL SEM ALERTA
(function(){
  console.log("FIX DESAFIOS FINAL");

  function aplicar(){
    // 1. CONSERTA TODO undefined -> FÁCIL ★
    document.querySelectorAll('*').forEach(el=>{
      if(el.childNodes.length === 1 && el.innerText === 'undefined'){
        // só os selos amarelos
        if(el.parentElement && el.parentElement.innerHTML.includes('Pagar') || el.parentElement.innerHTML.includes('LVL')){
          el.innerText = 'FÁCIL ★';
          el.style.background = '#aaa';
          el.style.color = '#fff';
        } else {
          el.innerText = 'FÁCIL ★';
        }
      }
    });

    // 2. CONTADOR 0/100 NO TOPO
    let titulo = Array.from(document.querySelectorAll('*')).find(e=>e.innerText && e.innerText.includes('DESAFIOS DO MORRO'));
    if(titulo && !document.getElementById('contadorGeral')){
      let total = document.querySelectorAll('[class*="FECHAR"]').length ? 5 : document.querySelectorAll('div').length; 
      // pega total real de cards
      let cards = Array.from(document.querySelectorAll('div')).filter(d=>d.innerText.includes('/68') || d.innerText.includes('/115') || d.innerText.includes('Juntar'));
      let concluidos = cards.filter(c=> c.innerText.includes('100%')).length;
      
      let span = document.createElement('span');
      span.id = 'contadorGeral';
      span.style.cssText = 'background:#FFD600;color:#000;font-size:13px;padding:2px 10px;border-radius:10px;margin-left:10px;font-weight:900';
      span.innerText = `${concluidos}/${cards.length || 5} Concluídos`;
      titulo.appendChild(span);
      titulo.style.display = 'flex';
      titulo.style.alignItems = 'center';
      titulo.style.flexWrap = 'wrap';
    }

    // 3. SE CONCLUIU, SOME DA LISTA
    document.querySelectorAll('div').forEach(card=>{
      if(card.innerText.includes('100% 1 $') || card.innerText.includes('100% 2 $')){
        if(card.style.border && card.innerText.includes('/')){
          card.style.display = 'none';
        }
      }
    });
  }

  // 4. SE FALIR, RESETA DESAFIOS
  window.resetarDesafiosAoFalir = function(){
    localStorage.removeItem('desafios');
    localStorage.removeItem('desafiosDoMorro');
    localStorage.removeItem('desafiosProgresso');
    console.log("DESAFIOS RESETADOS PÓS-FALÊNCIA");
  };

  // Hooka na falência se existir
  ['falir','gameOver','perdeu','faliu','quebrar'].forEach(nome=>{
    if(window[nome]){
      let original = window[nome];
      window[nome] = function(){
        window.resetarDesafiosAoFalir();
        return original.apply(this, arguments);
      }
    }
  });

  setInterval(aplicar, 800);
})();
