// =========================================
// PEGA 1 PAGA 2 - ATUALIZACAO.JS v2.0 FINAL
// MAPA COMPLETO + CORREÇÕES
// INDEX CONGELADO - SÓ MEXER AQUI
// =========================================

/*
MAPA.md RESUMIDO:
- VARIAVEIS: money, day, level, fame, dolar, cur, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount
- FUNÇÕES CORE: novo(), jogar(tipo), atualizarProgress(), aceitarPerda(), check()
- REGRAS: pede 100 = empresta 200 (2x) / juros 300 (3x) / calote perde só o que emprestou / pede nunca > caixa
*/

console.log("PATCH v2.0 MAPA COMPLETO CARREGADO");

const PATCH = {
  versao: "2.0 FINAL",
  
  regras: {
    emprestarMult: 2,
    jurosMult: 3,
    maxPedeDoCaixa: 0.8,
    chanceMaxNormal: 92,
    chanceMaxJuros: 78,
    chanceMin: 5
  },

  // --- 1. NOVO() - CORRIGIDO PEDE <= CAIXA E 2x ---
  novo(){
    let lista = Math.random()<0.15 ? policiaisDisfarcados : personagensComuns;
    let disp = lista.filter(p=>!usado[p.n]||usado[p.n]<4);
    if(disp.length==0){usado={};disp=lista}
    let novoPers = disp[Math.floor(Math.random()*disp.length)];
    if(usado._ultimo && disp.length>1){
      let t=0; while(novoPers.n===usado._ultimo && t<10){
        novoPers=disp[Math.floor(Math.random()*disp.length)]; t++
      }
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
    
    // FIX 1: PEDE NUNCA MAIOR QUE CAIXA
    let caixaAtual = money||0;
    if(caixaAtual>0 && pedeCalc > caixaAtual){
      pedeCalc = Math.floor(caixaAtual * this.regras.maxPedeDoCaixa);
      if(pedeCalc < 10 && caixaAtual >= 10) pedeCalc = 10;
      if(pedeCalc < 1) pedeCalc = Math.max(1, Math.floor(caixaAtual));
    }
    if(pedeCalc < 1) pedeCalc = 1;

    let bonusLucro=getTotalLucroBonus();
    let voltaCalc = Math.floor(pedeCalc * this.regras.emprestarMult * (1+bonusLucro/100));
    let chanceCalc = Math.max(5, cur.c - difChance);
    
    cur.pedeAtual = pedeCalc;
    cur.voltaAtual = voltaCalc;
    cur.chanceAtual = chanceCalc;
    
    document.getElementById('pede').innerText='R$'+pedeCalc;
    document.getElementById('volta').innerText='R$'+voltaCalc;
    document.getElementById('chance').innerText=chanceCalc+'%';
    
    let div=document.getElementById('choices');
    div.innerHTML='';
    let jurosPreview = Math.floor(pedeCalc * this.regras.jurosMult * (1+bonusLucro/100));
    let opcoes=[
      {t:`💵 EMPRESTAR R$${pedeCalc}`,d:`Recebe R$${voltaCalc} (${this.regras.emprestarMult}x) | Chance ${chanceCalc}% (+${getTotalChanceBonus()}%)`,c:'amarelo',a:'pagar'},
      {t:`❌ NEGAR`,d:`Paga R$${valorNegar} - evita calote`,c:'branco',a:'negar'},
      {t:`😈 JUROS R$${jurosPreview}`,d:`Recebe ${this.regras.jurosMult}x | Chance -30%`,c:'preto',a:'juros'}
    ];
    opcoes.forEach(o=>{
      let b=document.createElement('button');
      b.className='btn '+o.c;
      b.innerHTML=o.t+`<small>${o.d}</small>`;
      b.onclick=()=>{ jogar(o.a); };
      div.appendChild(b);
    });
  },

  // --- 2. JOGAR() - CORRIGIDO 2x / 3x ---
  jogar(tipo){
    if(!cur){novo(); return;}
    if(tipo=='negar'){money-=valorNegar;negarCount++;valorNegar=Math.floor(25+(negarCount*8)+(money*0.02));fame=Math.max(0,fame-0.5);seq=0;day++;log(`❌ Negou ${cur.n}`);check();novo();return;}
    if(cur.policia){usado._policia=(usado._policia||0)+1;let fianca=Math.floor(money*0.5);if(fianca<100) fianca=100;money-=fianca;log(`🚨 POLÍCIA! -R$${fianca}`);fame=Math.max(0,fame-0.5);seq=0;day++;check();novo();return;}
    
    let ch=cur.chanceAtual ?? cur.c;
    let pe=cur.pedeAtual ?? cur.p;
    let bonusLucro=getTotalLucroBonus();
    let de=0;
    
    if(tipo=='pagar'){de=Math.floor(pe * this.regras.emprestarMult * (1+bonusLucro/100));ch-=8;}
    if(tipo=='juros'){de=Math.floor(pe * this.regras.jurosMult * (1+bonusLucro/100));ch-=30;jurosCount++;}
    
    ch+=getTotalChanceBonus();
    if(cur.r=='ALTO'){ ch+=getGlockBonusVsAlto(); }
    if(tipo=='juros'){ if(ch>this.regras.chanceMaxJuros) ch=this.regras.chanceMaxJuros; } else { if(ch>this.regras.chanceMaxNormal) ch=this.regras.chanceMaxNormal; }
    if(ch<this.regras.chanceMin) ch=this.regras.chanceMin;
    
    let pagou=Math.random()*100<ch;
    if(pagou){
      let lucro=de-pe;money+=lucro;fame+=1;totalEmp++;totalLucro+=lucro;seq++;
      document.getElementById('bubble').innerText=`✅ ${cur.n} pagou R$${de}! (${ch.toFixed(0)}%)`;
      log(`✅ ${cur.n} pagou R$${de} [${ch.toFixed(0)}%]`);day++;check();novo();
    }else{
      fame=Math.max(0,fame-0.5);seq=0;pendentePerda=pe; // FIX: só o que emprestou
      let rec=getRecuperacaoBonus();
      document.getElementById('adText').innerText=cur.n+` calote R$${pe} - ${rec>0?`Moto recupera ${rec}%`:`chance era ${ch.toFixed(0)}%`}`;
      document.getElementById('adSave').style.display='flex';check();
    }
  },

  // --- 3. ACEITAR PERDA - CORRIGIDO CALOTE ---
  aceitarPerda(){
    document.getElementById('adSave').style.display='none';
    let perda=pendentePerda;
    let rec=getRecuperacaoBonus();
    if(rec>0){perda=Math.floor(perda*(1-rec/100));}
    money-=perda;if(money<0) money=0;
    pendentePerda=0;day++;check();novo();
  },

  // --- 4. ATUALIZAR PROGRESS - CORRIGIDO MISSÕES ---
  atualizarProgress(){
    ativasMissoes.forEach(m=>{
      if(m.tipo=="emp") m.prog=totalEmp;
      if(m.tipo=="lucro") m.prog=totalLucro;
      if(m.tipo=="fama") m.prog=fame;
      if(m.tipo=="seq") m.prog=seq;
      if(m.tipo=="juros") m.prog=jurosCount;
      if(m.prog>m.meta) m.prog=m.meta;
    });
    ativasDesafios.forEach(d=>{
      let v=0;
      if(d.tipo=="caixa") v=money;
      if(d.tipo=="totalEmp") v=totalEmp;
      if(d.tipo=="jurosTotal") v=jurosCount;
      if(d.tipo=="lucroTotal") v=totalLucro;
      d.prog=v;if(d.prog>d.meta) d.prog=d.meta;
    });
    missaoParaColetar=ativasMissoes.filter(m=>m.prog>=m.meta);
    desafiosParaColetar=ativasDesafios.filter(d=>d.prog>=d.meta);
    renderColeta();
    if(document.getElementById('conquistasModal').style.display=='flex'){renderConquistasAba();}
    saveGame();
  }
};

// APLICA O PATCH NO INDEX
window.novo = PATCH.novo.bind(PATCH);
window.jogar = PATCH.jogar.bind(PATCH);
window.aceitarPerda = PATCH.aceitarPerda.bind(PATCH);
window.atualizarProgress = PATCH.atualizarProgress.bind(PATCH);

console.log(`✅ PATCH ${PATCH.versao} APLICADO - Regras:`, PATCH.regras);
