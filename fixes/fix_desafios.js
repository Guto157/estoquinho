// fixes/fix_desafios.js - DESAFIOS NO MODELO DAS MISSÕES
(function(){
  console.log("FIX DESAFIOS = MISSÕES");

  function transformar(){
    // Acha o modal de desafios
    let titulo = document.evaluate("//*[contains(text(),'DESAFIOS DO MORRO')]", document, null, 9, null).singleNodeValue;
    if(!titulo) return;
    let modal = titulo.closest('div[style*="background"]') || titulo.parentElement.parentElement;
    if(!modal || modal.dataset.missoesStyle) return;

    // Acha todos os cards de desafio (os com LVL, Pagar, Juntar)
    let cards = Array.from(modal.querySelectorAll('div')).filter(d => 
      d.style.border && (d.innerText.includes('LVL') || d.innerText.includes('Pagar') || d.innerText.includes('Juntar'))
    );

    if(cards.length === 0) return;

    // 1. CRIA A BARRA PRETA NO TOPO IGUAL MISSÕES 33/50
    if(!document.getElementById('barraDesafiosTop')){
      let barra = document.createElement('div');
      barra.id = 'barraDesafiosTop';
      barra.style.cssText = 'background:#111;color:#FFD600;font-weight:900;text-align:center;padding:8px;border-radius:12px;margin:8px 0;font-size:14px';
      let total = cards.length;
      let concluidos = cards.filter(c=>c.innerText.includes('100%')).length;
      barra.innerHTML = `🏆 ${concluidos}/${total} DESAFIOS`;
      titulo.parentElement.insertBefore(barra, titulo.nextSibling);
    }

    // 2. TRANSFORMA CADA CARD NO MODELO MISSÕES
    cards.forEach(card=>{
      if(card.dataset.transformado) return;
      let texto = card.innerText;

      // Extrai dados: 0/68 0% 1 $
      let m = texto.match(/(\d+)\/(\d+)\s*(\d+)%\s*(\d+)\s*\$/);
      if(!m) return;
      let atual = m[1];
      let meta = m[2];
      let pct = m[3];
      let premio = m[4];

      // Título
      let tituloCard = texto.split('\n')[0].replace('undefined','').replace('TESTE OK ★','').trim();
      // Remove o título da lista pra pegar só
      if(tituloCard.includes('LVL')) tituloCard = tituloCard;
      if(tituloCard.includes('Pagar')) tituloCard = tituloCard;
      if(tituloCard.includes('Juntar')) tituloCard = tituloCard;

      // Descrição diferente por tipo, mas mesmo estilo da missão
      let desc = '';
      if(tituloCard.includes('LVL')) desc = `Alcançar o nível ${meta}`;
      else if(tituloCard.includes('Pagar')) desc = `Realizar ${meta} pagamentos`;
      else if(tituloCard.includes('Juntar')) desc = `Juntar R$${meta}`;
      else desc = `Completar ${meta}`;

      // NOVO VISUAL IGUAL MISSÕES
      card.style.cssText = 'background:#fff;border:2px solid #111;border-radius:14px;padding:12px;margin-bottom:10px';
      card.innerHTML = `
        <div style="font-weight:900;font-size:15px;color:#111;margin-bottom:4px">${tituloCard}</div>
        <div style="font-size:12px;color:#555;display:flex;align-items:center;gap:4px;margin-bottom:8px">
          <span>🎯</span> ${desc}
        </div>
        <div style="width:100%;height:10px;background:#333;border-radius:10px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:#FFD600"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-top:4px;color:#111">
          <span>${atual}/${meta}</span><span>${pct}%</span>
        </div>
      `;
      card.dataset.transformado = '1';
    });

    modal.dataset.missoesStyle = '1';
  }

  setInterval(transformar, 800);
})();
