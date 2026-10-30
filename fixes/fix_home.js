// fixes/fix_home.js - SUBSTITUI JOGAR E NEGAR
console.log("FIX HOME - LOGICA NOVA NEGAR");

// zera a lógica antiga
window.taxaNegarAtual = 0;
window.incNegar = 5;
window.vezNegar = 0;

window.novo = function(){
  let lista = Math.random()<0.15 ? policiaisDisfarcados : personagensComuns;
  let disp = lista.filter(p=>!usado[p.n]||usado[p.n]<4);
  if(disp.length==0){usado={};disp=lista}
  let novoPers = disp[Math.floor(Math.random()*disp.length)];
  if(usado._ultimo && disp.length>1){
    let t=0; while(novoPers.n===usado._ultimo && t<10){novoPers=disp[Math.floor(Math.random()*disp.length)]; t++}
  }
  cur=novoPers;
  usado[cur.n]=(usado[cur.n]||0)+1;
  usado._ultimo=cur.n;
  document.getElementById('clienteAvatar').innerText=cur.sig;
  document.getElementById('clienteAvatar').style.background=cur.cor;
  let corBorda=cur.r=='BAIXO'?'#00E676':cur.r=='MÉDIO'?'#FFD600':'#FF5252';
  document.getElementById('clienteBox').style.borderColor=corBorda;
  document.getElementById('nome').innerText=cur.n;
  document.getElementById('tag').innerText=cur.r;
  document.getElementById('tag').style.background=corBorda;
  let fala=cur.falas[Math.floor(Math.random()*cur.falas.length)];
  document.getElementById('hist').innerText=fala;
  document.getElementById('bubble').innerText=cur.n+': "'+fala+'"';
  let levelFactor = 1 + (level * 0.10) + (day * 0.02);
  let riscoMult = cur.r=='BAIXO'?1 : cur.r=='MÉDIO'?1.4 : 2.0;
  let difChance = Math.floor(level*0.7 + day*0.15);
  let pedeCalc = Math.floor(cur.p * levelFactor * riscoMult);
  let bonusLucro=getTotalLucroBonus();
  let voltaCalc = Math.floor(pedeCalc * 2 * (1+bonusLucro/100));
  let chanceCalc = Math.max(5, cur.c - difChance);
  // TRAVA PEDIDO NO CAIXA
  if(pedeCalc > money) pedeCalc = Math.max(10, Math.floor(money * 0.8));
  cur.pedeAtual = pedeCalc;
  cur.voltaAtual = voltaCalc;
  cur.chanceAtual = chanceCalc;
  document.getElementById('pede').innerText='R$'+pedeCalc;
  document.getElementById('volta').innerText='R$'+voltaCalc;
  document.getElementById('chance').innerText=chanceCalc+'%';
  let div=document.getElementById('choices');
  div.innerHTML='';
  let txtNegar = window.taxaNegarAtual===0 ? `❌ NEGAR<small>Grátis</small>` : `❌ NEGAR<small>Paga R$${window.taxaNegarAtual}</small>`;
  let opcoes=[
    {t:`💵 EMPRESTAR R$${pedeCalc}`,d:`Recebe R$${voltaCalc} | Chance ${chanceCalc}% (+${getTotalChanceBonus()}% itens)`,c:'amarelo',a:'pagar'},
    {t:txtNegar,d:`Evita calote`,c:'branco',a:'negar'},
    {t:`😈 JUROS R$${voltaCalc+80}`,d:`Lucro +80 mas chance -30%`,c:'preto',a:'juros'}
  ];
  opcoes.forEach(o=>{
    let b=document.createElement('button');
    b.className='btn '+o.c;
    b.innerHTML=o.t+`<small>${o.d}</small>`;
    b.onclick=()=>{ jogar(o.a); };
    div.appendChild(b);
  });
}

window.jogar = function(tipo){
  if(!cur){novo(); return;}
  
  if(tipo=='negar'){
    let desconto = (window.vezNegar===0) ? 0 : window.taxaNegarAtual;
    money -= desconto;
    negarCount++;
    
    if(window.vezNegar===0){
      window.taxaNegarAtual = 5;
      window.incNegar = 10;
    } else {
      window.taxaNegarAtual += window.incNegar;
      window.incNegar += 5;
    }
    if(window.taxaNegarAtual > 100) window.taxaNegarAtual = 100;
    window.vezNegar++;

    fame=Math.max(0,fame-0.5);
    seq=0;
    day++;
    log(`❌ Negou ${cur.n} -${desconto==0?'Grátis':'R$'+desconto}`);
    check();
    novo();
    return;
  }

  // se EMPRESTOU, diminui a taxa 5 por 5
  if(window.taxaNegarAtual > 0){
    window.taxaNegarAtual = Math.max(0, window.taxaNegarAtual - 5);
    window.incNegar = Math.max(5, window.incNegar - 5);
    if(window.taxaNegarAtual===0){
      window.vezNegar=0;
      window.incNegar=5;
    }
  }

  if(cur.policia){
    usado._policia=(usado._policia||0)+1;
    let fianca=Math.floor(money*0.5);
    if(fianca<100) fianca=100;
    money-=fianca;
    log(`🚨 POLÍCIA! -R$${fianca}`);
    fame=Math.max(0,fame-0.5);
    seq=0;
    day++;
    check();
    novo();
    return;
  }

  let ch=cur.chanceAtual ?? cur.c;
  let pe=cur.pedeAtual ?? cur.p;
  let de=cur.voltaAtual ?? cur.d;
  if(tipo=='pagar'){pe=pe*2;de=pe*2;ch-=8;}
  if(tipo=='juros'){de+=80;ch-=30;jurosCount++;}
  ch+=getTotalChanceBonus();
  if(cur.r=='ALTO'){ ch+=getGlockBonusVsAlto(); }
  if(tipo=='juros'){ if(ch>78) ch=78; } else { if(ch>92) ch=92; }
  if(ch<5) ch=5;
  let pagou=Math.random()*100<ch;
  if(pagou){
    let lucro=de-pe;
    money+=lucro;
    fame+=1;
    totalEmp++;
    totalLucro+=lucro;
    seq++;
    document.getElementById('bubble').innerText=`✅ ${cur.n} pagou R$${de}! (${ch.toFixed(0)}% chance)`;
    log(`✅ ${cur.n} pagou R$${de} [${ch.toFixed(0)}%]`);
    day++;
    check();
    novo();
  }else{
    fame=Math.max(0,fame-0.5);
    seq=0;
    pendentePerda=pe;
    let rec=getRecuperacaoBonus();
    if(rec>0){document.getElementById('adText').innerText=cur.n+` calote R$${pe} - Moto recupera ${rec}%`;}
    else {document.getElementById('adText').innerText=cur.n+` calote R$${pe} - chance era ${ch.toFixed(0)}%`;}
    document.getElementById('adSave').style.display='flex';
    check();
  }
}

window.falencia = function(){
  money=100;
  window.taxaNegarAtual=0;
  window.incNegar=5;
  window.vezNegar=0;
  valorNegar=25;
  localStorage.removeItem('save_'+currentUser);
  alert("💸 FALÊNCIA! Resetado R$100");
  location.reload();
}

console.log("FIX aplicado - teste: Grátis, 5, 15, 30, 50");
novo();
