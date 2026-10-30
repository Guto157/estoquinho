// fixes/fix_desafios.js - SÓ CORRIGE BADGE
(function(){
  // limpa cards que foram pra home por causa do código anterior
  function limparHome(){
    let modalAberto = [...document.querySelectorAll('div')].some(d => d.innerText && d.innerText.includes('DESAFIOS DO MORRO'));
    if(modalAberto) return;
    document.querySelectorAll('div').forEach(c=>{
      if(c.style.borderRadius === '14px' && c.innerText && c.innerText.match(/LVL 68|Pagar 115x|Juntar R\$/)){
        // se não está dentro do modal, remove da home
        let dentro = c.closest('div');
        let p = c;
        let isModal = false;
        while(p){
          if(p.innerText && p.innerText.includes('DESAFIOS DO MORRO')){ isModal = true; break; }
          p = p.parentElement;
        }
        if(!isModal && c.parentElement && c.parentElement.children.length > 5){
          // não faz nada, deixa o original do jogo renderizar
          // só remove se foi duplicado por mim
          if(c.dataset.criado){ c.remove(); }
        }
      }
    });
  }

  function fixBadge(){
    document.querySelectorAll('div, span').forEach(el=>{
      if(el.innerText && el.innerText.trim() === 'undefined'){
        let pai = el.parentElement;
        if(pai && pai.innerText && pai.innerText.includes('/')){
          el.innerText = 'FÁCIL ★';
          el.style.background = '#BDBDBD';
          el.style.color = '#444';
          el.style.fontSize = '11px';
          el.style.fontWeight = '900';
          el.style.padding = '4px 10px';
          el.style.borderRadius = '12px';
        }
      }
    });
  }

  setInterval(()=>{
    limparHome();
    fixBadge();
  }, 500);
})();
