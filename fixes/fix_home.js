// fixes/fix_home.js - CALOTE E RECEBIMENTO CORRIGIDOS
console.log("FIX HOME - SISTEMA FINANCEIRO CORRIGIDO");

function fb(v,t){
 var m=document.getElementById('money');
 if(!m)return;

 var e=document.createElement('div');
 e.style.cssText='position:fixed;right:15px;top:85px;font-weight:900;font-size:22px;z-index:9999;padding:8px 14px;border-radius:10px;background:#111;border:2px solid;transition:all 1.5s';

 e.innerText=t=='g'?'+R$'+v:'-R$'+v;
 e.style.color=t=='g'?'#00E676':'#FF5252';
 e.style.borderColor=e.style.color;

 document.body.appendChild(e);

 setTimeout(function(){
  e.style.transform='translateY(-70px)';
  e.style.opacity='0';
 },1200);

 setTimeout(function(){
  e.remove();
 },2200);
}

window.taxaNegarAtual=0;
window.incNegar=5;
window.vezNegar=0;
window.travado=false;

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

 document.getElementById('clienteAvatar').innerText=cur.sig;
 document.getElementById('clienteAvatar').style.background=cur.cor;

 let cb=cur.r=='BAIXO'?'#00E676':cur.r=='MÉDIO'?'#FFD600':'#FF5252';

 document.getElementById('clienteBox').style.borderColor=cb;
 document.getElementById('nome').innerText=cur.n;
 document.getElementById('tag').innerText=cur.r;
 document.getElementById('tag').style.background=cb;

 let f=cur.falas[Math.floor(Math.random()*cur.falas.length)];

 document.getElementById('hist').innerText=f;
 document.getElementById('bubble').innerText=cur.n+': "'+f+'"';

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

 // Juros: dobro do empréstimo + 10%
 let vcJuros=Math.floor(pc*2*1.10*(1+bl/100));

 let df=Math.floor(level*0.7+day*0.15);

 let cc=Math.max(5,cur.c-df);

 cur.pedeAtual=pc;
 cur.voltaAtual=vc;
 cur.voltaJurosAtual=vcJuros;
 cur.chanceAtual=cc;

 document.getElementById('pede').innerText='R$'+pc;
 document.getElementById('volta').innerText='R$'+vc;
 document.getElementById('chance').innerText=cc+'%';

 let div=document.getElementById('choices');

 div.innerHTML='';

 let tn=window.vezNegar===0
  ?'❌ NEGAR<small>Grátis</small>'
  :'❌ NEGAR<small>Paga R$'+window.taxaNegarAtual+'</small>';

 let ops=[
  {
   t:'💵 EMPRESTAR R$'+pc,
   d:'Recebe R$'+vc,
   c:'amarelo',
   a:'emprestar'
  },
  {
   t:tn,
   d:'Evita calote',
   c:'branco',
   a:'negar'
  },
  {
   t:'😈 JUROS R$'+vcJuros,
   d:'Recebe R$'+vcJuros,
   c:'preto',
   a:'juros'
  }
 ];

 ops.forEach(o=>{
  let b=document.createElement('button');

  b.className='btn '+o.c;
  b.innerHTML=o.t+'<small>'+o.d+'</small>';

  b.onclick=()=>{jogar(o.a)};

  div.appendChild(b);
 });
};

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

 // NEGAR CLIENTE
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

  if(window.taxaNegarAtual>100){
   window.taxaNegarAtual=100;
  }

  window.vezNegar++;

  fame=Math.max(0,fame-0.5);
  seq=0;
  day++;

  log('❌ Negou '+cur.n+' -'+(desc==0?'Grátis':'R$'+desc));

  check();
  novo();

  return;
 }

 // REDUZ TAXA DE NEGAR
 if(window.taxaNegarAtual>0){

  window.taxaNegarAtual=Math.max(0,window.taxaNegarAtual-5);

  window.incNegar=Math.max(5,window.incNegar-5);

  if(window.taxaNegarAtual===0){
   window.vezNegar=0;
   window.incNegar=5;
  }
 }

 // POLÍCIA
 if(cur.policia){

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

 // VALORES DO EMPRÉSTIMO
 let peBase=cur.pedeAtual;

 let de=cur.voltaAtual;

 // OPÇÃO COM JUROS
 if(tipo=='juros'){

  de=cur.voltaJurosAtual;

  cur.chanceAtual-=30;

  jurosCount++;
 }

 let ch=cur.chanceAtual+getTotalChanceBonus();

 if(cur.r=='ALTO'){
  ch+=getGlockBonusVsAlto();
 }

 if(tipo=='juros'){
  if(ch>78)ch=78;
 }else{
  if(ch>92)ch=92;
 }

 if(ch<5)ch=5;

 // DESCONTA O EMPRÉSTIMO UMA ÚNICA VEZ
 money-=peBase;

 fb(peBase,'c');

 // VERIFICA SE O CLIENTE PAGOU
 let pagou=Math.random()*100<ch;

 if(pagou){

  // RECEBE O VALOR TOTAL PROMETIDO
  money+=de;

  fb(de,'g');

  let lucro=de-peBase;

  fame+=1;
  totalEmp++;
  totalLucro+=lucro;
  seq++;

  document.getElementById('bubble').innerText=
   '✅ Pagou R$'+de;

  log(
   '✅ '+cur.n+
   ' pagou R$'+de+
   ' - lucro R$'+lucro
  );

  day++;

  check();
  novo();

 }else{

  // CALOTE: O VALOR JÁ FOI DESCONTADO.
  // NÃO DESCONTAR NOVAMENTE.

  fame=Math.max(0,fame-0.5);

  seq=0;

  pendentePerda=peBase;

  let rec=getRecuperacaoBonus();

  if(rec>0){

   document.getElementById('adText').innerText=
    cur.n+' deu calote de R$'+peBase+
    ' - Moto recupera '+rec+'%';

  }else{

   document.getElementById('adText').innerText=
    cur.n+' deu calote de R$'+peBase+
    ' - chance era '+ch.toFixed(0)+'%';
  }

  document.getElementById('adSave').style.display='flex';

  check();

  window.travado=false;

  if(c)c.style.pointerEvents='auto';
 }
};

// ACEITAR PERDA
// O VALOR JÁ FOI DESCONTADO NO MOMENTO DO EMPRÉSTIMO.
// ESTA FUNÇÃO NÃO PODE DESCONTAR NOVAMENTE.
window.aceitarPerda=function(){

 document.getElementById('adSave').style.display='none';

 pendentePerda=0;

 pendenteTipo=null;

 day++;

 check();

 novo();
};

// RECUPERAÇÃO POR ANÚNCIO
// Mantém a função original do index e limpa o valor pendente.
const recompensaOriginal=window.recompensaLiberada;

window.recompensaLiberada=function(){

 let tipoAnterior=pendenteTipo;

 recompensaOriginal();

 if(tipoAnterior=='salvar'){
  pendentePerda=0;
 }
};

// FALÊNCIA
window.falencia=function(){

 money=100;

 window.taxaNegarAtual=0;
 window.incNegar=5;
 window.vezNegar=0;
 window.travado=false;

 valorNegar=25;

 let c=document.getElementById('choices');

 if(c)c.style.pointerEvents='auto';

 localStorage.removeItem('save_'+currentUser);

 alert("💸 FALÊNCIA! Resetado R$100");

 location.reload();
};

// REINICIAR
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

 pendentePerda=0;
 pendenteTipo=null;

 let c=document.getElementById('choices');

 if(c)c.style.pointerEvents='auto';

 document.getElementById('gameOver').style.display='none';

 check();

 novo();
};

novo();
