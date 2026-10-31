
// fixes/fix_home.js - SEQUÊNCIA CORRIGIDA + CLIENTE PERSISTENTE
console.log("FIX HOME - SEQUÊNCIA CORRIGIDA + CLIENTE PERSISTENTE");

function fb(v,t){
 var m=document.getElementById('money');
 if(!m)return;
 var e=document.createElement('div');
 e.style.cssText='position:fixed;right:15px;top:85px;font-weight:900;font-size:22px;z-index:9999;padding:8px 14px;border-radius:10px;background:#111;border:2px solid;transition:all 1.5s';
 e.innerText=t=='g'?'+R$'+v:'-R$'+v;
 e.style.color=t=='g'?'#00E676':'#FF5252';e.style.borderColor=e.style.color;
 document.body.appendChild(e);
 setTimeout(function(){e.style.transform='translateY(-70px)';e.style.opacity='0'},1200);
 setTimeout(function(){e.remove()},2200);
}

window.taxaNegarAtual=0;window.incNegar=5;window.vezNegar=0;window.travado=false;

// =====================================================
// ALERTA VISUAL DA POLÍCIA
// =====================================================

window.alertaPolicia=function(){
 let anterior=document.getElementById('alertaPoliciaVisual');
 if(anterior)anterior.remove();

 let alerta=document.createElement('div');
 alerta.id='alertaPoliciaVisual';

 alerta.style.cssText=`
  position:fixed;
  inset:0;
  z-index:999999;
  pointer-events:none;
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(0,0,0,0.15);
  animation:policiaPisca 0.35s infinite alternate;
 `;

 alerta.innerHTML=`
  <div style="
   position:absolute;
   inset:0;
   border:12px solid #1565FF;
   box-shadow:inset 0 0 55px #1565FF,0 0 35px #1565FF;
  "></div>
  <div style="
   position:relative;
   background:#111;
   color:#fff;
   border:4px solid #FF1744;
   border-radius:18px;
   padding:22px 35px;
   font-size:clamp(25px,7vw,48px);
   font-weight:1000;
   text-align:center;
   text-shadow:0 0 12px #FF1744;
   box-shadow:0 0 35px #FF1744;
  ">
   🚨 POLÍCIA! 🚨
  </div>
 `;

 let estilo=document.getElementById('estiloAlertaPolicia');

 if(!estilo){
  estilo=document.createElement('style');
  estilo.id='estiloAlertaPolicia';
  estilo.textContent=`
   @keyframes policiaPisca{
    0%{
     background:rgba(0,60,255,0.42);
     box-shadow:inset 0 0 100px #0055ff;
    }
    50%{
     background:rgba(255,0,30,0.42);
     box-shadow:inset 0 0 100px #ff002f;
    }
    100%{
     background:rgba(0,60,255,0.42);
     box-shadow:inset 0 0 100px #0055ff;
    }
   }
  `;
  document.head.appendChild(estilo);
 }

 document.body.appendChild(alerta);

 setTimeout(function(){
  if(alerta.parentNode)alerta.remove();
 },3000);
};

// =====================================================
// SALVA O CLIENTE ATUAL SEM ALTERAR O RESTANTE DO SAVE
// =====================================================

window.persistirClienteAtual=function(){
 if(!cur || !currentUser)return;

 try{
  let chave='save_'+currentUser;
  let dados={};

  try{
   dados=JSON.parse(localStorage.getItem(chave)||'{}');
  }catch(e){
   dados={};
  }

  dados.clienteAtual=JSON.parse(JSON.stringify(cur));

  localStorage.setItem(chave,JSON.stringify(dados));

  if(typeof window.saveGame==='function'){
   window.saveGame();
  }
 }catch(erro){
  console.error('Erro ao salvar cliente atual:',erro);
 }
};

// =====================================================
// EXIBE O CLIENTE ATUAL SEM SORTEAR OUTRO
// =====================================================

window.renderizarClienteAtual=function(){
 if(!cur)return false;

 let avatar=document.getElementById('clienteAvatar');
 let box=document.getElementById('clienteBox');
 let nome=document.getElementById('nome');
 let tag=document.getElementById('tag');
 let hist=document.getElementById('hist');
 let bubble=document.getElementById('bubble');
 let pede=document.getElementById('pede');
 let volta=document.getElementById('volta');
 let chance=document.getElementById('chance');
 let div=document.getElementById('choices');

 if(!avatar || !box || !nome || !tag || !hist || !bubble || !pede || !volta || !chance || !div){
  return false;
 }

 avatar.innerText=cur.sig;
 avatar.style.background=cur.cor;

 let cb=cur.r=='BAIXO'?'#00E676':cur.r=='MÉDIO'?'#FFD600':'#FF5252';

 box.style.borderColor=cb;
 nome.innerText=cur.n;
 tag.innerText=cur.r;
 tag.style.background=cb;

 let f=cur.falaAtual || cur.falas?.[0] || '';

 hist.innerText=f;
 bubble.innerText=cur.n+': "'+f+'"';

 pede.innerText='R$'+cur.pedeAtual;
 volta.innerText='R$'+cur.voltaAtual;
 chance.innerText=cur.chanceAtual+'%';

 window.travado=false;
 div.style.pointerEvents='auto';
 div.innerHTML='';

 let tn=window.vezNegar===0?'❌ NEGAR<small>Grátis</small>':'❌ NEGAR<small>Paga R$'+window.taxaNegarAtual+'</small>';

 let ops=[
  {t:'💵 EMPRESTAR R$'+cur.pedeAtual,d:'Recebe R$'+cur.voltaAtual,c:'amarelo',a:'emprestar'},
  {t:tn,d:'Evita calote',c:'branco',a:'negar'},
  {t:'😈 JUROS R$'+cur.voltaJurosAtual,d:'Recebe R$'+cur.voltaJurosAtual,c:'preto',a:'juros'}
 ];

 ops.forEach(o=>{
  let b=document.createElement('button');
  b.className='btn '+o.c;
  b.innerHTML=o.t+'<small>'+o.d+'</small>';
  b.onclick=()=>{jogar(o.a)};
  div.appendChild(b);
 });

 return true;
};

// =====================================================
// GERA UM NOVO CLIENTE
// =====================================================

window.novo=function(){
 window.travado=false;

 let c=document.getElementById('choices');
 if(c)c.style.pointerEvents='auto';

 let l=Math.random()<0.15?policiaisDisfarcados:personagensComuns;
 let d=l.filter(p=>!usado[p.n]||usado[p.n]<4);

 if(d.length==0){
  usado={};
  d=l;
 }

 let np=d[Math.floor(Math.random()*d.length)];

 if(usado._ultimo&&d.length>1){
  let t=0;
  while(np.n===usado._ultimo&&t<10){
   np=d[Math.floor(Math.random()*d.length)];
   t++;
  }
 }

 cur=np;
 usado[cur.n]=(usado[cur.n]||0)+1;
 usado._ultimo=cur.n;

 let base=40+(level*18)+(day*2);
 let rm=cur.r=='BAIXO'?0.9:cur.r=='MÉDIO'?1.15:1.35;
 let vr=0.85+Math.random()*0.3;
 let pc=Math.floor(base*rm*vr);

 let max=Math.floor(money*0.7);
 if(max<20)max=20;
 if(pc>max)pc=max;
 if(pc<15)pc=15;

 let bl=getTotalLucroBonus();
 let vc=Math.floor(pc*2*(1+bl/100));
 let vcJuros=Math.floor(pc*2*1.1*(1+bl/100));

 let df=Math.floor(level*0.7+day*0.15);
 let cc=Math.max(5,cur.c-df);

 cur.pedeAtual=pc;
 cur.voltaAtual=vc;
 cur.voltaJurosAtual=vcJuros;
 cur.chanceAtual=cc;
 cur.falaAtual=cur.falas[Math.floor(Math.random()*cur.falas.length)];

 window.renderizarClienteAtual();
 window.persistirClienteAtual();
};

// =====================================================
// AÇÕES DO JOGO
// =====================================================

window.jogar=function(tipo){
 if(window.travado)return;

 window.travado=true;

 let c=document.getElementById('choices');
 if(c)c.style.pointerEvents='none';

 if(!cur){
  window.travado=false;
  if(c)c.style.pointerEvents='auto';
  novo();
  return;
 }

 if(tipo=='negar'){
  let desc=(window.vezNegar===0)?0:window.taxaNegarAtual;

  money-=desc;
  if(desc>0)fb(desc,'c');

  negarCount++;

  if(window.vezNegar===0){
   window.taxaNegarAtual=5;
   window.incNegar=10;
  }else{
   window.taxaNegarAtual+=window.incNegar;
   window.incNegar+=5;
  }

  if(window.taxaNegarAtual>100)window.taxaNegarAtual=100;

  window.vezNegar++;
  fame=Math.max(0,fame-0.5);
  day++;

  log('❌ Negou '+cur.n+' -'+(desc==0?'Grátis':'R$'+desc));
  check();
  novo();
  return;
 }

 if(cur.policia){
  // Mantém o alerta somente para emprestar ou cobrar juros.
  if(typeof window.alertaPolicia==='function'){
   window.alertaPolicia();
  }

  usado._policia=(usado._policia||0)+1;

  let fi=Math.floor(money*0.5);
  if(fi<100)fi=100;

  money-=fi;
  fb(fi,'c');
  log('🚨 POLÍCIA! -R$'+fi);

  fame=Math.max(0,fame-0.5);
  seq=0;

  day++;
  check();
  novo();
  return;
 }

 if(window.taxaNegarAtual>0){
  window.taxaNegarAtual=Math.max(0,window.taxaNegarAtual-5);
  window.incNegar=Math.max(5,window.incNegar-5);

  if(window.taxaNegarAtual===0){
   window.vezNegar=0;
   window.incNegar=5;
  }
 }

 let peBase=cur.pedeAtual;
 let de=cur.voltaAtual;

 if(tipo=='juros'){
  de=cur.voltaJurosAtual;
  cur.chanceAtual-=30;
  jurosCount++;
 }

 let ch=cur.chanceAtual+getTotalChanceBonus();

 if(cur.r=='ALTO')ch+=getGlockBonusVsAlto();

 if(tipo=='juros'){
  if(ch>78)ch=78;
 }else{
  if(ch>92)ch=92;
 }

 if(ch<5)ch=5;

 let pagou=Math.random()*100<ch;

 if(pagou){
  let lucro=de-peBase;

  money+=lucro;
  fb(lucro,'g');

  fame+=1;
  totalEmp++;
  totalLucro+=lucro;
  seq++;

  document.getElementById('bubble').innerText='✅ Pagou R$'+de;

  log('✅ '+cur.n+' pagou R$'+de+' lucro R$'+lucro);

  day++;
  check();
  novo();

 }else{
  fame=Math.max(0,fame-0.5);
  seq=0;

  pendentePerda=peBase;

  let rec=getRecuperacaoBonus();

  if(rec>0){
   document.getElementById('adText').innerText=cur.n+' calote R$'+peBase+' - Moto recupera '+rec+'%';
  }else{
   document.getElementById('adText').innerText=cur.n+' calote R$'+peBase+' - chance era '+ch.toFixed(0)+'%';
  }

  document.getElementById('adSave').style.display='flex';

  check();

  window.travado=false;
  if(c)c.style.pointerEvents='auto';

  window.persistirClienteAtual();
 }
};

// =====================================================
// FALÊNCIA
// =====================================================

window.falencia=function(){
 money=100;
 window.taxaNegarAtual=0;
 window.incNegar=5;
 window.vezNegar=0;
 valorNegar=25;
 window.travado=false;

 let c=document.getElementById('choices');
 if(c)c.style.pointerEvents='auto';

 localStorage.removeItem('save_'+currentUser);

 alert("💸 FALÊNCIA! Resetado R$100");
 location.reload();
};

// =====================================================
// REINÍCIO COMPLETO
// =====================================================

window.restartFull=function(){
 day=1;
 money=500;
 fame=1;
 level=1;
 usado={};
 window.travado=false;

 window.taxaNegarAtual=0;
 window.incNegar=5;
 window.vezNegar=0;
 valorNegar=25;

 // ZERA TODOS OS ITENS E MELHORIAS DA LOJINHA
 inv={};

 if(typeof window.resetarInventarioLojinha==='function'){
  window.resetarInventarioLojinha();
 }else if(currentUser){
  localStorage.setItem('lojinha_permanente_'+currentUser,'{}');
 }

 let c=document.getElementById('choices');
 if(c)c.style.pointerEvents='auto';

 document.getElementById('gameOver').style.display='none';

 check();
 novo();

 // Garante que o estado reiniciado seja salvo.
 if(typeof window.saveGame==='function'){
  window.saveGame();
 }
};

// =====================================================
// INICIALIZAÇÃO
// =====================================================

novo();
