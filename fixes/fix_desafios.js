// fixes/fix_desafios.js - DESBUGAR DESAFIOS TRAVADOS PÓS-FALÊNCIA
(function(){
  console.log("FIX DESAFIOS TRAVADO");

  function fixar(){
    const modal = document.querySelector('[class*="DESAFIOS"]')?.parentElement || document.body;
    const cards = document.querySelectorAll('div[style*="border"]'); // pega os cards do print

    // Procura os cards de desafio pelo texto
    document.querySelectorAll('*').forEach(el=>{
      if(!el.innerText) return;
      if(el.innerText.includes('LVL') || el.innerText.includes('Pagar') || el.innerText.includes('Juntar R$')){
        let card = el.closest('div[style*="border"]') || el.parentElement?.parentElement;
        if(!card || card.dataset.fixed) return;

        // 1. CONSERTA O undefined -> FÁCIL ★
        let selo = card.querySelector('*');
        if(card.innerText.includes('undefined')){
          card.innerHTML = card.innerHTML.replace(/undefined/g, 'FÁCIL ★');
        }

        // 2. PEGA O PROGRESSO REAL DE BAIXO ex: 607/15200 3%
        let match = card.innerText.match(/(\d+)\/(\d+)\s*(\d+)?%/);
        if(match){
          let atual = parseInt(match[1]);
          let meta = parseInt(match[2]);
          let pct = match[3] ? parseInt(match[3]) : Math.floor((atual/meta)*100);

          // 3. ATUALIZA O PROGRESSO DE CIMA 0/100 -> pct/100
          let progressoTop = card.querySelector('div');
          let labels = card.querySelectorAll('div');
          labels.forEach(l=>{
            if(l.innerText === 'PROGRESSO'){
              let valEl = l.nextElementSibling || l.parentElement.querySelector('span');
              // acha o 0/100 do lado do PROGRESSO
              let texto = l.parentElement.innerHTML;
              if(texto.includes('0/100')){
                l.parentElement.innerHTML = l.parentElement.innerHTML.replace(/0\/100/g, `${pct}/100`);
              }
              // atualiza a barra preta de cima
              let barra = l.nextElementSibling;
              if(barra && barra.tagName === 'DIV'){
                barra.innerHTML = `<div style="width:${pct}%;height:8px;background:#FFD600;border-radius:10px"></div>`;
                barra.style.background = '#222';
                barra.style.height = '8px';
                barra.style.borderRadius = '10px';
                barra.style.overflow = 'hidden';
              }
            }
          });
        }
        card.dataset.fixed = '1';
      }
    });
  }

  // 4. FUNÇÃO PRA DESBRAVAR OS TRAVADOS - limpa save bugado
  window.resetarDesafiosTravados = function(){
    // Limpa só os desafios bugados do localStorage
    for(let k in localStorage){
      if(k.toLowerCase().includes('desafio')){
        let val = localStorage.getItem(k);
        if(val && val.includes('undefined')){
          localStorage.removeItem(k);
        }
      }
    }
    // Se tiver array global, destrava
    if(window.desafios){
      window.desafios.forEach(d=>{
        if(d.atual === 0 && d.feito) d.feito = false;
        if(d.dificuldade === undefined) d.dificuldade = 'FÁCIL';
      });
    }
    location.reload();
  }

  setInterval(fixar, 800);

  // Adiciona botão discreto pra resetar se ainda ficar travado
  setTimeout(()=>{
    let btnFechar = document.querySelector('button') || document.body;
    if(!document.getElementById('btnResetTravado')){
      let b = document.createElement('div');
      b.id = 'btnResetTravado';
      b.innerText = '↻ Destravar LVL/Pagar';
      b.style.cssText = 'font-size:10px;text-align:center;margin-top:6px;color:#888;text-decoration:underline;cursor:pointer';
      b.onclick = window.resetarDesafiosTravados;
      let fechar = Array.from(document.querySelectorAll('*')).find(e=>e.innerText==='FECHAR');
      if(fechar) fechar.parentElement.before(b);
    }
  },1500);
})();
