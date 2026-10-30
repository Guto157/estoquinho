// fixes/fix_desafios.js - CORREÇÃO CONTAGEM + BARRA 12/100
(function(){
  console.log("FIX DESAFIOS CARREGADO");

  function esperarJogo(cb){
    if(window.totalEmp !== undefined && document.body){
      cb();
    } else {
      setTimeout(()=>esperarJogo(cb), 300);
    }
  }

  esperarJogo(()=>{
    
    // 1. CORREÇÃO DA CONTAGEM - Garante que os contadores existem
    window.totalEmp = window.totalEmp || 0;
    window.totalLucro = window.totalLucro || 0;

    // Hook no check/jogar pra sempre atualizar os desafios
    const originalCheck = window.check;
    window.check = function(){
      if(originalCheck) originalCheck.apply(this, arguments);
      atualizarBarraDesafios();
    }

    // 2. FUNÇÃO QUE INJETA A BARRA 12/100
    window.atualizarBarraDesafios = function(){
      // Tenta achar a lista de desafios do index (varia o nome)
      let lista = window.desafios || window.listaDesafios || window.DESAFIOS || [];
      
      // Se não achou lista global, tenta ler pelos cards na tela
      const container = document.getElementById('desafiosTab') || document.getElementById('listaDesafios') || document.querySelector('.desafios-container');
      if(!container) return;

      // Se a lista existe no JS, atualiza ela
      if(lista.length > 0){
        lista.forEach(d => {
          if(d.id && d.id.includes('emp')) d.atual = window.totalEmp;
          if(d.id && d.id.includes('lucro')) d.atual = window.totalLucro;
          if(d.id && d.id.includes('juros')) d.atual = window.jurosCount || 0;
          if(d.id && d.id.includes('dia')) d.atual = window.day || 1;
        });
        // Salva se tiver função de salvar
        if(window.salvarDesafios) window.salvarDesafios();
      }

      // Injeta a barra visual em cada card
      const cards = container.querySelectorAll(':scope > div, .desafio-card, .card-desafio');
      cards.forEach(card=>{
        // Pega valores do card
        let texto = card.innerText;
        let metaMatch = texto.match(/(\d+)\/(\d+)/); // se já tem 12/100 não duplica
        
        let atual = 0, meta = 100;
        // Tenta pegar dos atributos data-
        if(card.dataset.atual) atual = parseInt(card.dataset.atual);
        if(card.dataset.meta) meta = parseInt(card.dataset.meta);
        
        // Se não tem, usa o totalEmp como padrão
        if(!card.dataset.meta){
          atual = window.totalEmp;
          // tenta descobrir meta pelo título
          if(texto.includes('10') && !texto.includes('100')) meta = 10;
          if(texto.includes('100')) meta = 100;
          if(texto.includes('1000')) meta = 1000;
        }

        let barra = card.querySelector('.barra-progress-fix');
        if(!barra){
          barra = document.createElement('div');
          barra.className = 'barra-progress-fix';
          barra.style.cssText = 'margin-bottom:8px';
          card.prepend(barra);
        }

        let pct = Math.min(100, Math.floor((atual/meta)*100));
        barra.innerHTML = `
          <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:900;color:#fff;margin-bottom:3px">
            <span>PROGRESSO</span>
            <span style="color:#FFD600">${atual}/${meta}</span>
          </div>
          <div style="width:100%;height:10px;background:#000;border-radius:10px;overflow:hidden;border:1px solid #222">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#FFD600,#FFA000);transition:width 0.4s"></div>
          </div>
        `;
      });
    }

    // Roda a cada 1s pra garantir que contabiliza
    setInterval(atualizarBarraDesafios, 1000);
    setTimeout(atualizarBarraDesafios, 800);
    
    console.log("FIX DESAFIOS APLICADO");
  });
})();
