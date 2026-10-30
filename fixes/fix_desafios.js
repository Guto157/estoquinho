(function(){
  setInterval(()=>{
    document.querySelectorAll('div').forEach(card=>{
      if(!card.style.border) return;
      let t = card.innerText;
      if(!(t.includes('LVL') || t.includes('Pagar') || t.includes('Juntar'))) return;
      let m = t.match(/(\d+)\/(\d+)\s*(\d+)%/);
      if(!m || card.dataset.ok) return;
      
      let atual = m[1], meta = m[2], pct = m[3];
      let nome = t.split('\n')[0].replace('undefined','').trim();
      
      card.style.background='#fff';
      card.style.border='2px solid #111';
      card.style.borderRadius='14px';
      card.style.padding='12px';
      card.innerHTML = `
        <div style="font-weight:900">${nome}</div>
        <div style="font-size:12px;color:#666;margin:4px 0">🎯 ${nome.includes('LVL') ? 'Alcançar nível '+meta : nome.includes('Pagar') ? 'Realizar '+meta+' pagamentos' : 'Juntar R$'+meta}</div>
        <div style="height:8px;background:#222;border-radius:8px;overflow:hidden"><div style="width:${pct}%;height:100%;background:#FFD600"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-top:4px"><span>${atual}/${meta}</span><span>${pct}%</span></div>
      `;
      card.dataset.ok=1;
    });
  },600);
})();
