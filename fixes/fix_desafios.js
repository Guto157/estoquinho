// fixes/fix_desafios.js - REFEITO DO ZERO
(function(){
  const NOVOS = [
    { t: 'LVL 68', meta: 68, tipo: 'lvl', dif: 'FÁCIL ★', premio: '1 $' },
    { t: 'Pagar 115x', meta: 115, tipo: 'pagar', dif: 'FÁCIL ★', premio: '1 $' },
    { t: 'Juntar R$15200', meta: 15200, tipo: 'juntar', dif: 'FÁCIL ★', premio: '1 $' },
    { t: 'Juntar R$16400', meta: 16400, tipo: 'juntar', dif: 'FÁCIL ★', premio: '1 $' },
    { t: '8. Tarifa Noturna - Juntar R$17600', meta: 17600, tipo: 'juntar', dif: 'FÁCIL ★', premio: '1 $' }
  ];

  function getCaixa(){
    let el = document.body.innerText.match(/CAIXA\s*R\$(\d+)/);
    return el ? parseInt(el[1]) : (window.totalMoney || 392);
  }
  function getLvl(){
    return window.level || window.lvl || 4;
  }
  function getPagos(){
    return window.pagamentos || window.totalPagar || 0;
  }

  function render(){
    // Acha o modal do print
    let titulo = [...document.querySelectorAll('div')].find(d => d.innerText && d.innerText.includes('DESAFIOS DO MORRO'));
    if(!titulo) return;
    let modal = titulo.parentElement;

    // Acha todos os cards brancos dentro do modal
    let cards = [...modal.children].filter(c => c !== titulo && c.innerText && (c.innerText.includes('/') || c.innerText.includes('LVL') || c.innerText.includes('Juntar') || c.innerText.includes('Pagar')));
    
    // Se não achou como filhos, procura dentro
    if(cards.length < 3){
      cards = [...modal.querySelectorAll('div')].filter(c => c.style && c.style.borderRadius && c.innerText.includes('/'));
    }

    // Apaga os antigos
    cards.forEach(c => c.remove());

    let caixa = getCaixa();
    let lvl = getLvl();
    let pagos = getPagos();

    NOVOS.forEach(d => {
      let atual = 0;
      if(d.tipo === 'juntar') atual = caixa;
      if(d.tipo === 'lvl') atual = lvl;
      if(d.tipo === 'pagar') atual = pagos;
      let pct = Math.min(100, Math.floor((atual/d.meta)*100));

      let div = document.createElement('div');
      div.style.cssText = 'background:#fff;border:2px solid #111;border-radius:14px;padding:10px 12px;margin:8px 0;';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:900;font-size:15px;color:#111">${d.t}</span>
          <span style="background:#BDBDBD;color:#444;font-size:11px;font-weight:900;padding:4px 10px;border-radius:12px">${d.dif}</span>
        </div>
        <div style="height:8px;background:#222;border-radius:8px;overflow:hidden;margin:8px 0 4px 0">
          <div style="width:${pct}%;height:100%;background:#222"></div>
        </div>
        <div style="font-size:13px;color:#111">${atual}/${d.meta} ${pct}% <span style="color:#1B8A2A;font-weight:900">${d.premio}</span></div>
      `;
      // insere antes do botão FECHAR
      let fechar = [...modal.children].find(c => c.innerText === 'FECHAR');
      if(fechar) modal.insertBefore(div, fechar);
      else modal.appendChild(div);
    });
  }

  // Roda sempre que abrir o modal
  setInterval(render, 800);

  // Se existir lista global, substitui também
  if(window.desafios) window.desafios = NOVOS;
  if(window.listaDesafios) window.listaDesafios = NOVOS;
})();
