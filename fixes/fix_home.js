// fixes/fix_home.js - FINANCEIRO, DIÁLOGOS, GIROFLEX E CLIENTE PERSISTENTE
console.log("FIX HOME - SISTEMA COMPLETO ATUALIZADO");

// =====================================================
// SISTEMA DE XP E LEVEL
// =====================================================

window.xpAtual = Math.max(0, Number(window.xpAtual) || 0);

window.xpNecessarioProximoNivel = function(){
 let L = Math.max(1, Number(level) || 1);
 return 5 * L * (L + 1) / 2;
};

window.atualizarBarraXP = function(){
 let nivel = Math.max(1, Number(level) || 1);
 let xp = Math.max(0, Number(window.xpAtual) || 0);
 let maximo = 1000;

 let referencia = null;

 // Procura o elemento LEVEL existente sem substituir seu conteúdo.
 const seletores = [
  '#level',
  '#levelDisplay',
  '#level-display',
  '#playerLevel',
  '#player-level',
  '.level'
 ];

 for(const seletor of seletores){
  const el = document.querySelector(seletor);
  if(el){
   referencia = el;
   break;
  }
 }

 if(!referencia){
  const elementos = document.querySelectorAll('body *');

  for(const el of elementos){
   if(el.id === 'barraXP' || el.closest('#barraXP'))continue;
   if(el.children.length > 2)continue;

   const texto = (el.textContent || '').trim();

   if(/^LEVEL\s*[:#-]?\s*\d+/i.test(texto)){
    referencia = el;
    break;
   }
  }
 }

 if(!referencia)return;

 let barra = document.getElementById('barraXP');

 if(!barra){
  barra = document.createElement('div');
  barra.id = 'barraXP';

  barra.style.cssText = [
   'height:9px',
   'width:100%',
   'max-width:180px',
   'margin:3px 0 5px',
   'border-radius:20px',
   'background:#333',
   'border:1px solid #555',
   'overflow:hidden',
   'position:relative',
   'box-sizing:border-box',
   'font-size:7px',
   'line-height:7px'
  ].join(';');

  barra.innerHTML = `
   <div id="barraXPPreenchimento" style="
    height:100%;
    width:0%;
    background:linear-gradient(90deg,#00c853,#aaff00);
    border-radius:20px;
    transition:width .25s;
   "></div>
   <span id="barraXPTexto" style="
    position:absolute;
    inset:0;
    display:flex;
    align-items:center;
    justify-content:center;
    color:#fff;
    font-size:7px;
    font-weight:900;
    text-shadow:0 1px 2px #000;
    white-space:nowrap;
   "></span>
  `;

  referencia.insertAdjacentElement('afterend',barra);
 }

 // Mantém a barra junto ao elemento LEVEL caso a interface seja recriada.
 if(barra.previousElementSibling !== referencia){
  referencia.insertAdjacentElement('afterend',barra);
 }

 const preenchimento = document.getElementById('barraXPPreenchimento');
 const texto = document.getElementById('barraXPTexto');

 if(nivel >= maximo){
  if(preenchimento)preenchimento.style.width = '100%';
  if(texto)texto.textContent = 'MÁXIMO';
  return;
 }

 const necessario = window.xpNecessarioProximoNivel();
 const percentual = necessario > 0
  ? Math.min(100,(xp / necessario) * 100)
  : 0;

 if(preenchimento)preenchimento.style.width = percentual + '%';

 if(texto){
  texto.textContent = Math.floor(xp) + '/' + necessario;
 }
};

window.alterarXP = function(quantidade, motivo){
 let valor = Number(quantidade) || 0;

 if(!valor)return;

 let nivelAtual = Math.max(1,Number(level) || 1);

 if(nivelAtual >= 1000){
  level = 1000;
  window.xpAtual = 0;
  window.atualizarBarraXP();
  return;
 }

 window.xpAtual = Math.max(0,(Number(window.xpAtual) || 0) + valor);

 // Aproveita todo o XP excedente nos próximos níveis.
 while(level < 1000){
  const necessario = window.xpNecessarioProximoNivel();

  if(window.xpAtual < necessario)break;

  window.xpAtual -= necessario;
  level++;
 }

 if(level >= 1000){
  level = 1000;
  window.xpAtual = 0;
 }

 window.atualizarBarraXP();

 console.log('XP ALTERADO:',{
  quantidade:valor,
  motivo:motivo || '',
  xp:window.xpAtual,
  level:level
 });

 // Salva localmente e solicita sincronização com a nuvem.
 if(typeof window.saveGame === 'function'){
  window.saveGame();
 }
};

// Atualiza a barra quando o LEVEL ou a tela forem recriados.
(function(){
 function iniciarAtualizacaoXP(){
  window.atualizarBarraXP();

  if(window.observadorXP)return;

  window.observadorXP = new MutationObserver(function(){
   window.atualizarBarraXP();
  });

  window.observadorXP.observe(document.body,{
   childList:true,
   subtree:true,
   characterData:true
  });
 }

 if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded',iniciarAtualizacaoXP);
 }else{
  iniciarAtualizacaoXP();
 }
})();

// =====================================================
// ANIMAÇÃO DE DINHEIRO
// =====================================================

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

// =====================================================
// DIÁLOGOS DOS CLIENTES
// =====================================================

const dialogosClientes = [
 "Estou precisando de uma força. É só até o fim da semana!",
 "Tive um imprevisto e fiquei sem dinheiro. Pode me ajudar?",
 "Prometo que pago certinho. Não costumo atrasar!",
 "Meu pagamento ainda não caiu. Preciso resolver uma coisa.",
 "Apareceu uma conta que eu não estava esperando.",
 "Estou numa situação complicada. Você consegue quebrar essa?",
 "Preciso de dinheiro para resolver um problema urgente.",
 "É um empréstimo rápido. Logo você recebe de volta.",
 "Estou esperando receber um dinheiro. Só preciso de uma ajuda.",
 "Não queria pedir, mas hoje realmente estou precisando.",
 "Tive um gasto inesperado e meu orçamento foi embora.",
 "Me ajuda dessa vez? Na próxima semana eu acerto tudo.",
 "É uma oportunidade que apareceu e não posso perder.",
 "Estou apertado hoje, mas tenho como pagar depois.",
 "Pode confiar. Quero resolver isso sem deixar ninguém na mão."
];

// =====================================================
// DIÁLOGOS DOS POLICIAIS
// =====================================================

const dialogosPoliciais = [
 "Preciso de um dinheiro para resolver um assunto na delegacia...",
 "Você costuma emprestar dinheiro para pessoas que fazem perguntas?",
 "Estou trabalhando numa investigação e surgiu um imprevisto.",
 "Meu documento está aqui, mas prefiro não mostrar agora.",
 "Você sabe se tem alguma câmera funcionando por aqui?",
 "Preciso levantar umas informações antes de continuar.",
 "Esse lugar costuma receber muita gente durante o dia?",
 "Estou com uma ocorrência para resolver e preciso de dinheiro.",
 "Não se preocupe, estou acostumado a lidar com situações assim.",
 "Você conhece alguém que trabalha na segurança pública?",
 "Estou fazendo umas verificações por aqui. É coisa de rotina.",
 "Depois talvez eu precise fazer algumas perguntas. Por enquanto, só preciso de ajuda.",
 "Você sempre empresta dinheiro sem perguntar muita coisa?",
 "Estou acompanhando uma situação suspeita aqui na região.",
 "Melhor não comentar muito sobre meu trabalho. Pode me ajudar?"
];

// =====================================================
// ESTILO DO BALÃO E GIROFLEX
// =====================================================

(function(){
 if(document.getElementById('fix-dialogos-style'))return;

 const style=document.createElement('style');
 style.id='fix-dialogos-style';

 style.textContent=`
  #bubble {
    display:block !important;
    position:relative;
    background:#fff !important;
    color:#222 !important;
    border:2px solid #ddd !important;
    border-radius:16px !important;
    padding:14px 16px !important;
    margin:12px 5px 18px !important;
    font-size:15px !important;
    font-weight:600 !important;
    line-height:1.5 !important;
    text-align:left !important;
    box-shadow:0 3px 8px rgba(0,0,0,.15);
    min-height:45px;
  }

  #bubble:before {
    content:"";
    position:absolute;
    top:-10px;
    left:24px;
    width:16px;
    height:16px;
    background:#fff;
    border-top:2px solid #ddd;
    border-left:2px solid #ddd;
    transform:rotate(45deg);
  }

  #hist {
    display:none !important;
  }

  #giroflex-policial {
    position:fixed;
    inset:0;
    z-index:99998;
    pointer-events:none;
    animation:giroflexFlash .18s infinite alternate;
  }

  #giroflex-policial .giroflex-luzes {
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:13px;
    display:flex;
  }

  #giroflex-policial .luz-azul {
    width:50%;
    background:#0066ff;
    box-shadow:0 0 30px 12px #0066ff;
    animation:luzAzul .25s infinite alternate;
  }

  #giroflex-policial .luz-vermelha {
    width:50%;
    background:#ff0000;
    box-shadow:0 0 30px 12px #ff0000;
    animation:luzVermelha .25s infinite alternate;
  }

  @keyframes giroflexFlash {
    0% {background:rgba(0,70,255,.10)}
    100% {background:rgba(255,0,0,.10)}
  }

  @keyframes luzAzul {
    0% {opacity:1}
    100% {opacity:.25}
  }

  @keyframes luzVermelha {
    0% {opacity:.25}
    100% {opacity:1}
  }
 `;

 document.head.appendChild(style);
})();

// =====================================================
// GIROFLEX POLICIAL
// =====================================================

window.giroflexPolicial=function(){
 let antigo=document.getElementById('giroflex-policial');
 if(antigo)antigo.remove();

 let giro=document.createElement('div');
 giro.id='giroflex-policial';

 giro.innerHTML=`
  <div class="giroflex-luzes">
   <div class="luz-azul"></div>
   <div class="luz-vermelha"></div>
  </div>
 `;

 document.body.appendChild(giro);

 setTimeout(function(){
  giro.remove();
 },2200);
};

// =====================================================
// SISTEMA DE DIÁLOGOS
// =====================================================

window.obterDialogo=function(personagem){
 let lista=personagem.policia?dialogosPoliciais:dialogosClientes;

 if(!personagem._dialogosFixHome){
  let originais=Array.isArray(personagem.falas)?personagem.falas:[];
  let base=lista.slice();

  originais.forEach(function(f){
   if(typeof f==='string' && f.trim() && !base.includes(f)){
    base.push(f);
   }
  });

  let nome=personagem.n || 'Cliente';

  let personalizadas=base.map(function(f){
   return f.replace(/\{nome\}/g,nome);
  });

  for(let i=personalizadas.length-1;i>0;i--){
   let j=Math.floor(Math.random()*(i+1));
   [personalizadas[i],personalizadas[j]]=
   [personalizadas[j],personalizadas[i]];
  }

  personagem._dialogosFixHome=personalizadas.slice(0,15);
 }

 let falas=personagem._dialogosFixHome;
 let ultima=personagem._ultimaFalaFixHome;
 let disponiveis=falas.filter(f=>f!==ultima);

 if(disponiveis.length===0)disponiveis=falas;

 let escolhida=disponiveis[Math.floor(Math.random()*disponiveis.length)];
 personagem._ultimaFalaFixHome=escolhida;

 return escolhida;
};

// =====================================================
// MEMORIZAR O CLIENTE ATUAL
// =====================================================

window.chaveClienteAtual=function(){
 return 'cliente_atual_'+currentUser;
};

window.salvarClienteAtual=function(){
 if(!cur)return;

 let dados={
  nome:cur.n,
  policia:!!cur.policia,
  dialogo:window.dialogoAtual,
  pedeAtual:cur.pedeAtual,
  voltaAtual:cur.voltaAtual,
  voltaJurosAtual:cur.voltaJurosAtual,
  chanceAtual:cur.chanceAtual
 };

 localStorage.setItem(
  window.chaveClienteAtual(),
  JSON.stringify(dados)
 );
};

window.limparClienteAtual=function(){
 localStorage.removeItem(window.chaveClienteAtual());
};

// =====================================================
// CONTROLES GERAIS
// =====================================================

window.taxaNegarAtual=0;
window.incNegar=5;
window.vezNegar=0;
window.travado=false;

// =====================================================
// NOVO CLIENTE COM RECUPERAÇÃO APÓS F5
// =====================================================

window.novo=function(){
 window.travado=false;

 let c=document.getElementById('choices');
 if(c)c.style.pointerEvents='auto';

 let salvo=null;

 try{
  salvo=JSON.parse(
   localStorage.getItem(window.chaveClienteAtual())
  );
 }catch(e){
  salvo=null;
 }

 let np=null;

 // Tenta recuperar o mesmo cliente.
 if(salvo){
  let lista=salvo.policia?policiaisDisfarcados:personagensComuns;

  np=lista.find(p=>p.n===salvo.nome);

  if(np){
   cur=np;

   cur.pedeAtual=salvo.pedeAtual;
   cur.voltaAtual=salvo.voltaAtual;
   cur.voltaJurosAtual=salvo.voltaJurosAtual;
   cur.chanceAtual=salvo.chanceAtual;

   window.dialogoAtual=salvo.dialogo;
  }
 }

 // Se não encontrou cliente salvo, sorteia um novo.
 if(!np){
  let l=Math.random()<0.15?policiaisDisfarcados:personagensComuns;

  let d=l.filter(p=>!usado[p.n]||usado[p.n]<4);

  if(d.length==0){
   usado={};
   d=l;
  }

  np=d[Math.floor(Math.random()*d.length)];

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

  let f=window.obterDialogo(cur);
  window.dialogoAtual=f;

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
  let vcJuros=Math.floor(pc*2*1.10*(1+bl/100));

  let df=Math.floor(level*0.7+day*0.15);
  let cc=Math.max(5,cur.c-df);

  cur.pedeAtual=pc;
  cur.voltaAtual=vc;
  cur.voltaJurosAtual=vcJuros;
  cur.chanceAtual=cc;

  // Salva cliente, diálogo e valores para sobreviver ao F5.
  window.salvarClienteAtual();
 }

 // Atualiza a apresentação.
 document.getElementById('clienteAvatar').innerText=cur.sig;
 document.getElementById('clienteAvatar').style.background=cur.cor;

 let cb=cur.r=='BAIXO'?'#00E676':cur.r=='MÉDIO'?'#FFD600':'#FF5252';

 document.getElementById('clienteBox').style.borderColor=cb;
 document.getElementById('nome').innerText=cur.n;
 document.getElementById('tag').innerText=cur.r;
 document.getElementById('tag').style.background=cb;

 document.getElementById('hist').innerText=window.dialogoAtual;
 document.getElementById('bubble').innerText='"'+window.dialogoAtual+'"';

 document.getElementById('pede').innerText='R$'+cur.pedeAtual;
 document.getElementById('volta').innerText='R$'+cur.voltaAtual;
 document.getElementById('chance').innerText=cur.chanceAtual+'%';

 let div=document.getElementById('choices');
 div.innerHTML='';

 let tn=window.vezNegar===0
  ?'❌ NEGAR<small>Grátis</small>'
  :'❌ NEGAR<small>Paga R$'+window.taxaNegarAtual+'</small>';

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
};

// =====================================================
// SISTEMA DE JOGO
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

 // NEGAR CLIENTE: -1 XP
 if(tipo=='negar'){
  window.limparClienteAtual();

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

  window.alterarXP(-1,'Negou cliente');

  check();
  novo();
  return;
 }

 // A PARTIR DAQUI O JOGADOR ESCOLHEU EMPRESTAR.
 // O CLIENTE ANTERIOR NÃO DEVE VOLTAR APÓS ATUALIZAR.
 window.limparClienteAtual();

 if(window.taxaNegarAtual>0){
  window.taxaNegarAtual=Math.max(0,window.taxaNegarAtual-5);
  window.incNegar=Math.max(5,window.incNegar-5);

  if(window.taxaNegarAtual===0){
   window.vezNegar=0;
   window.incNegar=5;
  }
 }

 // POLICIAL DISFARÇADO
 // Polícia não concede nem retira XP.
 if(cur.policia){
  window.giroflexPolicial();

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

 // CLIENTE COMUM
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

 // Desconta o valor emprestado apenas uma vez.
 money-=peBase;
 fb(peBase,'c');

 let pagou=Math.random()*100<ch;

 if(pagou){
  money+=de;
  fb(de,'g');

  let lucro=de-peBase;
  fame+=1;
  totalEmp++;
  totalLucro+=lucro;
  seq++;

  document.getElementById('bubble').innerText='✅ Pagou R$'+de;
  log('✅ '+cur.n+' pagou R$'+de+' - lucro R$'+lucro);

  // Pagamento normal: +3 XP. Pagamento com juros: +5 XP.
  window.alterarXP(tipo=='juros'?5:3,tipo=='juros'?'Pagamento com juros':'Pagamento normal');

  day++;
  check();
  novo();

 }else{
  fame=Math.max(0,fame-0.5);
  seq=0;
  pendentePerda=peBase;

  // Calote: -1 XP. Aceitar perda ou recuperar pelo anúncio não altera XP.
  window.alterarXP(-1,'Calote');

  let recMoto=getRecuperacaoBonus();

  document.getElementById('adText').innerText=
   cur.n+' deu calote de R$'+peBase+
   ' - Anúncio recupera 50% (R$'+Math.floor(peBase*0.5)+')'+
   (recMoto>0?' | Moto recupera '+recMoto+'% se aceitar a perda':'');

  document.getElementById('adSave').style.display='flex';

  check();
  window.travado=false;
  if(c)c.style.pointerEvents='auto';
 }
};

// =====================================================
// ACEITAR PERDA
// =====================================================

window.aceitarPerda=function(){
 document.getElementById('adSave').style.display='none';

 let recMoto=getRecuperacaoBonus();
 let recuperado=Math.floor((pendentePerda||0)*recMoto/100);

 if(recuperado>0){
  money+=recuperado;
  fb(recuperado,'g');
  log('🏍️ Moto recuperou R$'+recuperado+' ('+recMoto+'%)');
 }

 pendentePerda=0;
 pendenteTipo=null;

 day++;
 check();
 novo();
};

// =====================================================
// RECOMPENSA DO ANÚNCIO
// =====================================================

window.recompensaLiberada=function(){
 document.getElementById('adModal').style.display='none';

 if(pendenteTipo=='salvar'){
  let recuperado=Math.floor((pendentePerda||0)*0.5);

  if(recuperado>0){
   money+=recuperado;
   fb(recuperado,'g');
   log('📺 Anúncio recuperou 50%: R$'+recuperado);
  }

  pendentePerda=0;
  fame+=1;
  totalEmp++;
  seq++;
  day++;

  check();
  novo();
 }

 if(pendenteTipo=='banco'){
  money+=pendenteBanco;
  check();
 }

 if(pendenteTipo=='gameoverBanco'){
  money=300;
  document.getElementById('gameOver').style.display='none';
  check();
  novo();
 }

 pendenteTipo=null;
};

// =====================================================
// FALÊNCIA
// =====================================================

window.falencia=function(){
 money=100;
 window.taxaNegarAtual=0;
 window.incNegar=5;
 window.vezNegar=0;
 window.travado=false;
 valorNegar=25;

 window.limparClienteAtual();

 let c=document.getElementById('choices');
 if(c)c.style.pointerEvents='auto';

 localStorage.removeItem('save_'+currentUser);
 alert('💸 FALÊNCIA! Resetado R$100');
 location.reload();
};

// =====================================================
// REINICIAR JOGO
// =====================================================

window.restartFull=function(){
 day=1;
 money=500;
 fame=1;
 level=1;
 usado={};

 // Reinicia o XP junto com o jogo.
 window.xpAtual=0;
 window.atualizarBarraXP();

 window.limparClienteAtual();

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

 if(typeof window.saveGame==='function')window.saveGame();

 novo();
};

// =====================================================
// CARREGAMENTO DO SAVE
// =====================================================

window.carregarSave=function(){
 let raw=localStorage.getItem('save_'+currentUser);

 if(!raw){
  window.xpAtual=0;
  novo();
  check();
  window.atualizarBarraXP();
  return;
 }

 try{
  let s=JSON.parse(raw);

  day=s.day ?? 1;
  money=s.money ?? 500;
  fame=s.fame ?? 1;
  level=s.level ?? 1;
  dolar=s.dolar ?? 0;
  inv=s.inv ?? {};
  usado=s.usado ?? {};
  totalEmp=s.totalEmp ?? 0;
  totalLucro=s.totalLucro ?? 0;
  jurosCount=s.jurosCount ?? 0;
  negarCount=s.negarCount ?? 0;
  conquistasColetadas=s.conquistasColetadas ?? {};
  tituloEscolhido=s.tituloEscolhido ?? null;
  proxMissaoIdx=s.proxMissaoIdx ?? 3;
  proxDesafioIdx=s.proxDesafioIdx ?? 3;

  // Recupera o XP salvo.
  window.xpAtual=Math.max(0,Number(s.xpAtual) || 0);

  if(s.ativasMissoes)ativasMissoes=s.ativasMissoes;
  if(s.ativasDesafios)ativasDesafios=s.ativasDesafios;

  renderSlots();
  atualizarTituloAvatar();
  novo();
  check();
  window.atualizarBarraXP();

 }catch(e){
  console.error('Erro ao carregar save:',e);
  window.xpAtual=0;
  novo();
  check();
  window.atualizarBarraXP();
 }
};

// =====================================================
// INICIALIZAÇÃO
// =====================================================

if(currentUser){
 window.carregarSave();
}else{
 novo();
}

// =====================================================
// JOGO OCUPA TODA A LARGURA NO NOTEBOOK
// =====================================================

(function(){
 const style = document.createElement('style');
 style.id = 'fix-game-desktop-width';

 style.textContent = `
  @media (min-width: 600px) {
    #game {
      width: 100vw !important;
      max-width: none !important;
    }
  }
 `;

 document.head.appendChild(style);
})();
