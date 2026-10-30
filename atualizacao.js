// ATUALIZACAO.JS - FIX TOTAL (2x/3x + calote + caixa + missões)
console.log("FIX TOTAL");

const REGRAS = { multEmp:2, multJuros:3, maxCaixa:0.8, chanceMax:92, chanceMaxJuros:78 };

// --- NOVO() : 2x, 3x e nunca pede mais que caixa ---
const _novo = window.novo;
window.novo = function(){
  let lista = Math.random()<0.15 ? policiaisDisfarcados : personagensComuns;
  let disp = lista.filter(p=>!usado[p.n]||usado[p.n]<4);
  if(disp.length==0){usado={};disp=lista}
  let novoPers = disp[Math.floor(Math.random()*disp.length)];
  cur=novoPers;
  usado[cur.n]=(usado[cur.n]||0)+1;
  document.getElementById('clienteAvatar').innerText=cur.sig;
  document.getElementById('clienteAvatar').style.background=cur.cor;
  let corBorda=cur.r=='BAIXO'?'#00E676':cur.r=='MÉDIO'?'#FFD600':'#FF5252';
  document.getElementById('clienteBox').style.borderColor=corBorda;
  document.getElementById('nome').innerText=cur.n;
  document.getElementById('tag').innerText=cur.r;
  document.getElementById('tag').style.background=corBorda;
  document.getElementById('hist').innerText=cur.falas[Math.floor(Math.random()*cur.falas.length)];

  let levelFactor = 1 + (level * 0.10) + (day * 0.02);
  let pedeCalc = Math.floor(cur.p * levelFactor * (cur.r=='BAIXO'?1:cur.r=='MÉDIO'?1.4:2));
  if(money>0 && pedeCalc > money){ pedeCalc = Math.floor(money*REGRAS.maxCaixa); if(pedeCalc<10 && money>=10) pedeCalc=10; }
  let bonusLucro=getTotalLucroBonus();
  cur.pedeAtual = pedeCalc;
  cur.voltaAtual = Math.floor(pedeCalc * REGRAS.multEmp * (1+bonusLucro/100));
  cur.chanceAtual = Math.max(5, cur.c - Math.floor(level*0.7+day*0.15));

  document.getElementById('pede').innerText='R$'+cur.pedeAtual;
  document.getElementById('volta').innerText='R$'+cur.voltaAtual;
  document.getElementById('chance').innerText=cur.chanceAtual+'%';

  let div=document.getElementById('choices'); div.innerHTML='';
  let jurosPreview = Math.floor(pedeCalc * REGRAS.multJuros * (1+bonusLucro/100));
  [{t:`💵 EMPRESTAR R$${pedeCalc}`,d:`Recebe R$${cur.voltaAtual} (2x)`,c:'amarelo',a:'pagar'},{t:`❌ NEGAR`,d:`Paga R$${valorNegar}`,c:'branco',a:'negar'},{t:`😈 JUROS R$${jurosPreview}`,d:`Recebe 3x | -30% chance`,c:'preto',a:'juros'}].forEach(o=>{
    let b=document.createElement('button'); b.className='btn '+o.c; b.innerHTML=o.t+`<small>${o.d}</small>`; b.onclick=()=>{ jogar(o.a); }; div.appendChild(b);
  });
}

// --- JOGAR() : 2x / 3x certo + calote só do emprestado ---
const _jogar = window.jogar;
window.jogar = function(tipo){
  if(tipo=='negar'){ money-=valorNegar; negarCount++; valorNegar=Math.floor(25+(negarCount*8)+(money*0.02)); fame=Math.max(0,fame-0.5); seq=0; day++; log(`❌ Negou ${cur.n}`); check(); novo(); return; }
  if(cur.policia){ let f=Math.floor(money*0.5); if(f<100)f=100; money-=f; log(`🚨 POLÍCIA! -R$${f}`); seq=0; day++; check(); novo(); return; }
  let ch = (cur.chanceAtual??cur.c) - (tipo=='pagar'?8:30) + getTotalChanceBonus();
  if(tipo=='pagar' && ch>REGRAS.chanceMax) ch=REGRAS.chanceMax;
  if(tipo=='juros' && ch>REGRAS.chanceMaxJuros) ch=REGRAS.chanceMaxJuros;
  if(ch<5) ch=5;
  let pe = cur.pedeAtual??cur.p;
  let mult = tipo=='pagar'?REGRAS.multEmp:REGRAS.multJuros;
  let de = Math.floor(pe*mult*(1+getTotalLucroBonus()/100));
  if(Math.random()*100<ch){ money+=de-pe; fame+=1; totalEmp++; totalLucro+=de-pe; seq++; if(tipo=='juros') jurosCount++; log(`✅ ${cur.n} pagou R$${de}`); day++; check(); novo(); }
  else{ pendentePerda=pe; document.getElementById('adText').innerText=cur.n+` calote R$${pe}`; document.getElementById('adSave').style.display='flex'; check(); }
}

// --- ACEITAR PERDA + MISSÕES ATUALIZANDO ---
window.aceitarPerda = function(){ document.getElementById('adSave').style.display='none'; let rec=getRecuperacaoBonus(); let perda=rec>0?Math.floor(pendentePerda*(1-rec/100)):pendentePerda; money-=perda; if(money<0)money=0; pendentePerda=0; day++; check(); novo(); }

window.gerarMissoes = function(){
  const nomes=["1. Primeiro Giro na Laje","2. Troco do Beco","3. Respeito na Quebrada","4. Sequência de Cobrança","5. Juros do Bar do Seu Zé","6. Ronda na Comunidade","7. Lucro da Banca","8. Moral no Morro","9. Embalo da Cobrança","10. Taxa do Atraso"];
  let arr=[]; for(let i=1;i<=50;i++){
    let tipo=i%5, meta, premio, tipoStr, nome=nomes[(i-1)%10]+` ${i}`;
    if(tipo==0){meta=6+Math.floor(i*0.9);premio=35+Math.floor(i*2.5);tipoStr="emp";arr.push({id:i,t:`${nome} - Emprestar ${meta}x`,meta,premio,prog:0,tipo:tipoStr});}
    if(tipo==1){meta=900+i*280;premio=40+Math.floor(i*3);tipoStr="lucro";arr.push({id:i,t:`${nome} - Lucrar R$${meta}`,meta,premio,prog:0,tipo:tipoStr});}
    if(tipo==2){meta=8+Math.floor(i/1.6);premio=45+Math.floor(i*2.8);tipoStr="fama";arr.push({id:i,t:`${nome} - Fama ${meta}`,meta,premio,prog:0,tipo:tipoStr});}
    if(tipo==3){meta=6+Math.floor(i/2);premio=50+Math.floor(i*3);tipoStr="seq";arr.push({id:i,t:`${nome} - Seq ${meta}`,meta,premio,prog:0,tipo:tipoStr});}
    if(tipo==4){meta=5+Math.floor(i/2.5);premio=55+Math.floor(i*3.2);tipoStr="juros";arr.push({id:i,t:`${nome} - Juros ${meta}x`,meta,premio,prog:0,tipo:tipoStr});}
  } return arr;
}

window.atualizarProgress = function(){
  ativasMissoes.forEach(m=>{
    if(m.tipo=="emp") m.prog=totalEmp;
    if(m.tipo=="lucro") m.prog=totalLucro;
    if(m.tipo=="fama") m.prog=fame;
    if(m.tipo=="seq") m.prog=seq;
    if(m.tipo=="juros") m.prog=jurosCount;
    if(m.prog>m.meta) m.prog=m.meta;
  });
  missaoParaColetar=ativasMissoes.filter(m=>m.prog>=m.meta);
  renderColeta(); saveGame(); atualizarNotificacoes();
  if(document.getElementById('missoesModal').style.display=='flex'){openMissoes();}
}
