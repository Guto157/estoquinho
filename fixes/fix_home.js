
// fixes/fix_home.js - XP + REGRESSAO + ALERTA POLICIA
console.log("FIX HOME - XP, REGRESSAO E ALERTA POLICIA");

function fb(v,t){
 var m=document.getElementById('money');
 if(!m)return;
 var e=document.createElement('div');
 e.style.cssText='position:fixed;right:15px;top:85px;font-weight:900;font-size:22px;z-index:9999;padding:8px 14px;border-radius:10px;background:#111;border:2px solid;transition:all 1.5s';
 e.innerText=t=='g'?'+R$'+v:'-R$'+v;
 e.style.color=t=='g'?'#00E676':'#FF5252';
 e.style.borderColor=e.style.color;
 document.body.appendChild(e);
 setTimeout(function(){e.style.transform='translateY(-70px)';e.style.opacity='0'},1200);
 setTimeout(function(){e.remove()},2200);
}

// =====================================
// SISTEMA DE XP E NIVEIS
// =====================================

window.levelXP = Number(window.levelXP) || Number(window.level) || 1;
window.xpAtual = Number(window.xpAtual) || 0;

function xpNecessario(nivel){
 return 5*nivel*(nivel+1)/2;
}

window.atualizarNivelXP=function(){
 window.levelXP=Math.max(1,Math.min(1000,Number(window.levelXP)||1));
 window.xpAtual=Math.max(0,Number(window.xpAtual)||0);

 while(window.levelXP<1000 && window.xpAtual>=xpNecessario(window.levelXP)){
  window.xpAtual-=xpNecessario(window.levelXP);
  window.levelXP++;
 }

 window.level=window.levelXP;
 level=window.levelXP;

 var el=document.getElementById('lvl');
 if(el){
  el.innerText=window.levelXP;

  var barra=document.getElementById('barraXP');
  if(!barra){
   barra=document.createElement('div');
   barra.id='barraXP';
   barra.style.cssText='width:110px;height:13px;background:#222;border:1px solid #777;border-radius:10px;overflow:hidden;position:relative;margin-top:3px;font-size:9px;line-height:11px;text-align:center;color:white;';
   var pai=el.parentElement;
   if(pai)pai.appendChild(barra);
  }

  if(window.levelXP>=1000){
   barra.innerHTML='<div style="width:100%;height:100%;background:#FFD700"></div><span style="position:absolute;inset:0">MAXIMO</span>';
  }else{
   var necessario=xpNecessario(window.levelXP);
   var porcentagem=Math.min(100,(window.xpAtual/necessario)*100);
   barra.innerHTML='<div style="width:'+porcentagem+'%;height:100%;background:linear-gradient(90deg,#00C853,#B2FF59)"></div><span style="position:absolute;inset:0">'+window.xpAtual+'/'+necessario+'</span>';
  }
 }
};

window.alterarXP=function(valor){
 valor=Number(valor)||0;

 var novoXP=window.xpAtual+valor;

 while(novoXP<0 && window.levelXP>1){
  window.levelXP--;
  novoXP=xpNecessario(window.levelXP)+novoXP;
 }

 window.xpAtual=Math.max(0,novoXP);

 window.atualizarNivelXP();

 var usuario=window.currentUser||'local';
 try{
  localStorage.setItem('xpAtual_'+usuario,String(window.xpAtual));
  localStorage.setItem('levelXP_'+usuario,String(window.levelXP));
 }catch(e){}

 if(typeof window.saveGame==='function'){
  window.saveGame();
 }
};

// Recuperacao do XP salvo localmente
(function(){
 try{
  var usuario=window.currentUser||'local';
  var xpSalvo=localStorage.getItem('xpAtual_'+usuario);
  var nivelSalvo=localStorage.getItem('levelXP_'+usuario);

  if(xpSalvo!==null)window.xpAtual=Number(xpSalvo)||0;
  if(nivelSalvo!==null)window.levelXP=Number(nivelSalvo)||1;

  window.atualizarNivelXP();
 }catch(e){
  console.log('Nao foi possivel recuperar XP local:',e);
 }
})();

// Protege o nivel de XP contra alteracoes feitas pelo check original
(function(){
 var checkOriginal=window.check;

 if(typeof checkOriginal==='function' && !window.checkXPInstalado){
  window.checkXPInstalado=true;

  window.check=function(){
   var nivelCorreto=window.levelXP;
   var salvarOriginal=window.saveGame;

   window.saveGame=function(){};

   try{
    return checkOriginal.apply(this,arguments);
   }finally{
    window.levelXP=nivelCorreto;
    window.level=nivelCorreto;
    level=nivelCorreto;
    window.saveGame=salvarOriginal;

    window.atualizarNivelXP();

    if(typeof salvarOriginal==='function'){
     salvarOriginal.call(window);
    }
   }
  };
 }
})();

// =====================================
// ALERTA VISUAL DA POLICIA
// =====================================

window.alertaPolicia=function(){
 if(document.getElementById('alertaPolicia'))return;

 var overlay=document.createElement('div');
 overlay.id='alertaPolicia';

 overlay.style.cssText='position:fixed;inset:0;z-index:99998;pointer-events:none;animation:sirenePolicia 0.22s infinite alternate;';

 var estilo=document.createElement('style');
 estilo.id='estiloSirenePolicia';

 estilo.textContent=`
 @keyframes sirenePolicia{
  0%{
   background:rgba(0,70,255,0.38);
   box-shadow:inset 0 0 100px 35px rgba(0,70,255,0.9);
  }
  100%{
   background:rgba(255,0,0,0.38);
   box-shadow:inset 0 0 100px 35px rgba(255,0,0,0.9);
  }
 }
 `;

 document.head.appendChild(estilo);
 document.body.appendChild(overlay);

 setTimeout(function(){
  overlay.remove();
  estilo.remove();
 },3000);
};

// =====================================
// CONFIGURACOES
// =====================================

window.taxaNegarAtual=0;
window.incNegar=5;
window.vezNegar=0;
window.travado=false;

// =====================================
// NOVO CLIENTE
// =====================================

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
 let vcJuros=Math.floor(pc*2*1.1*(1+bl/100));

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

 let tn=window.vezNegar===0?'❌ NEGAR<small>Grátis</small>':'❌ NEGAR<small>Paga R$'+window.taxaNegarAtual+'</small>';

 let ops=[
  {t:'💵 EMPRESTAR R$'+pc,d:'Recebe R$'+vc,c:'amarelo',a:'emprestar'},
  {t:tn,d:'Evita calote',c:'branco',a:'negar'},
  {t:'😈 JUROS R$'+vcJuros,d:'Recebe R$'+vcJuros,c:'preto',a:'juros'}
 ];

 ops.forEach(o=>{
  let b=document.createElement('button');
  b.className='btn '+o.c;
  b.innerHTML=o.t+'<small>'+o.d+'</small>';
  b.onclick=()=>{jogar(o.a)};
  div.appendChild(b);
 });
};

// =====================================
// JOGAR
// =====================================

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

 // NEGAR: -1 XP
 if(tipo=='negar'){
  window.alterarXP(-1);

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
  seq=0;
  day++;

  log('❌ Negou '+cur.n+' -'+(desc==0?'Grátis':'R$'+desc));
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

 // POLICIA: sirene em emprestar e juros, -2 XP
 if(cur.policia){
  if(tipo==='emprestar'||tipo==='juros'){
   window.alertaPolicia();
  }

  window.alterarXP(-2);

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

 // O principal nao e descontado antes do resultado.
 // No sucesso, entra apenas o lucro liquido.
 // No calote, a perda e tratada pelas funcoes originais do index.

 let pagou=Math.random()*100<ch;

 if(pagou){
  let lucro=de-peBase;

  money+=lucro;
  fb(lucro,'g');

  // XP: pagamento normal +3, juros +5
  window.alterarXP(tipo=='juros'?5:3);

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
  // CALOTE: -1 XP
  window.alterarXP(-1);

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

  // Mantem a tela de recuperacao aberta.
  window.travado=false;
  if(c)c.style.pointerEvents='auto';
 }
};

// =====================================
// FALENCIA
// =====================================

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

// =====================================
// REINICIO COMPLETO
// =====================================

window.restartFull=function(){
 day=1;
 money=500;
 fame=1;
 level=1;
 usado={};

 window.levelXP=1;
 window.xpAtual=0;

 window.travado=false;
 window.taxaNegarAtual=0;
 window.incNegar=5;
 window.vezNegar=0;
 valorNegar=25;

 let usuario=window.currentUser||'local';

 try{
  localStorage.removeItem('xpAtual_'+usuario);
  localStorage.removeItem('levelXP_'+usuario);
 }catch(e){}

 let c=document.getElementById('choices');
 if(c)c.style.pointerEvents='auto';

 window.atualizarNivelXP();

 document.getElementById('gameOver').style.display='none';

 check();
 novo();
};

window.atualizarNivelXP();

novo();
