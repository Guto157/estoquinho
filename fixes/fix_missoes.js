// fixes/fix_missoes.js - DESCRIÇÃO NOVA + CONTADOR
console.log("FIX MISSOES CARREGADO");

function limparNomeMissao(texto){
  return texto.replace(/^\d+\.\s*/, '').trim();
}

function formatarDescricaoMissao(m){
  if(m.tipo=="seq") return `Realizar ${m.meta} pagamentos seguidos sem calote`;
  if(m.tipo=="emp") return `Realizar ${m.meta} empréstimos na quebrada`;
  if(m.tipo=="lucro") return `Lucrar R$${m.meta} no total`;
  if(m.tipo=="fama") return `Alcançar ${m.meta} de fama no morro`;
  if(m.tipo=="juros") return `Cobrar juros ${m.meta}x`;
  return m.t;
}

window.openMissoes = function(){
  let total = 50;
  let concluidas = proxMissaoIdx - ativasMissoes.length;
  if(concluidas < 0) concluidas = 0;
  if(concluidas > total) concluidas = total;

  let html = `<div style="background:#111;color:#FFD600;padding:8px 12px;border-radius:10px;font-weight:900;font-size:12px;margin-bottom:8px;text-align:center">🎯 ${concluidas}/${total} MISSÕES</div>`;

  ativasMissoes.forEach(m=>{
    let pct = Math.min(100, Math.floor((m.prog/m.meta)*100));
    let nomeBase = limparNomeMissao(m.t.split(' - ')[0]);
    let desc = formatarDescricaoMissao(m);

    html += `<div class="card" style="padding:10px">
      <b style="font-size:13px;display:block;line-height:1.2">${nomeBase}</b>
      <small style="font-size:11px;color:#444;display:block;margin:4px 0 6px 0;line-height:1.3">🎯 ${desc}</small>
      <div class="progress"><div class="bar" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:3px">
        <small style="font-size:11px">${m.prog}/${m.meta}</small>
        <small style="font-size:11px;font-weight:900">${pct}%</small>
      </div>
      ${m.prog>=m.meta ? `<button class="btn verde" style="margin-top:6px;padding:10px" onclick="coletarMissao(${m.id})">✅ COLETAR R$${m.premio}</button>` : ''}
    </div>`;
  });

  document.getElementById('listaMissoes').innerHTML = html;
  document.getElementById('missoesModal').style.display = 'flex';
}
