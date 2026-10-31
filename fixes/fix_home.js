// fixes/fix_home.js - FINANCEIRO, DIÁLOGOS, GIROFLEX, XP E CLIENTE PERSISTENTE
console.log("FIX HOME - SISTEMA COMPLETO ATUALIZADO");

// =====================================================
// SISTEMA XP E LEVEL
// =====================================================

if (typeof window.xpAtual !== 'number') {
 window.xpAtual = 0;
}

window.xpNecessarioNivel = function(nivel){
 return Math.floor(5 * nivel * (nivel + 1) / 2);
};

window.atualizarNivelXP = function(){
 if (typeof window.xpAtual !== 'number' || !Number.isFinite(window.xpAtual)) {
  window.xpAtual = 0;
 }

 window.xpAtual = Math.max(0, Math.floor(window.xpAtual));

 if (typeof level !== 'number' || !Number.isFinite(level)) {
  level = 1;
 }

 level = Math.max(1, Math.min(1000, Math.floor(level)));

 while (
  level < 1000 &&
  window.xpAtual >= window.xpNecessarioNivel(level)
 ) {
  window.xpAtual -= window.xpNecessarioNivel(level);
  level++;
 }

 window.atualizarBarraXP();
};

window.atualizarBarraXP = function(){
 const elementoNivel = document.getElementById('lvl');
 if (!elementoNivel) return;

 let barra = document.getElementById('barraXP');

 if (!barra) {
  barra = document.createElement('div');
  barra.id = 'barraXP';

  barra.style.cssText = `
   display:block;
   position:relative;
   width:110px;
   height:13px;
   margin:3px 0 0 auto;
   border:1px solid rgba(255,255,255,.65);
   border-radius:10px;
   background:rgba(0,0,0,.35);
   overflow:hidden;
   box-sizing:border-box;
   font-size:9px;
   line-height:11px;
   text-align:center;
   font-weight:900;
   color:#fff;
   text-shadow:0 1px 2px #000;
   z-index:2;
  `;

  const preenchimento = document.createElement('div');
  preenchimento.id = 'barraXPPreenchimento';

  preenchimento.style.cssText = `
   position:absolute;
   top:0;
   left:0;
   height:100%;
   width:0%;
   background:linear-gradient(90deg,#00c853,#76ff03);
   transition:width .25s ease;
   border-radius:10px;
  `;

  const texto = document.createElement('span');
  texto.id = 'textoXP';

  texto.style.cssText = `
   position:absolute;
   inset:0;
   display:flex;
   align-items:center;
   justify-content:center;
   z-index:2;
   white-space:nowrap;
  `;

  barra.appendChild(preenchimento);
  barra.appendChild(texto);
  elementoNivel.insertAdjacentElement('afterend', barra);
 }

 const preenchimento = document.getElementById('barraXPPreenchimento');
 const texto = document.getElementById('textoXP');

 if (!preenchimento || !texto) return;

 if (level >= 1000) {
  preenchimento.style.width = '100%';
  texto.textContent = 'LEVEL MÁXIMO';
  return;
 }

 const necessario = window.xpNecessarioNivel(level);
 const atual = Math.min(window.xpAtual, necessario);
 const porcentagem = necessario > 0
  ? Math.min(100, (atual / necessario) * 100)
  : 0;

 preenchimento.style.width = porcentagem + '%';
 texto.textContent = atual + '/' + necessario;
};

window.alterarXP = function(valor){
 valor = Math.floor(Number(valor) || 0);

 if (valor < 0) {
  window.xpAtual = Math.max(0, window.xpAtual + valor);
 } else {
  window.xpAtual += valor;
 }

 window.atualizarNivelXP();

 console.log('XP ALTERADO:', {
  xp: window.xpAtual,
  level: level,
  alteracao: valor
 });
};

// =====================================================
// INTEGRAÇÃO COM O CHECK ORIGINAL
// =====================================================

(function(){
 const checkOriginalXP = window.check;

 if (typeof checkOriginalXP !== 'function') {
  console.error('Não foi possível localizar a função check original.');
  return;
 }

 window.check = function(){
  window.atualizarNivelXP();

  const resultado = checkOriginalXP.apply(this, arguments);

  // O check original calculava LEVEL pela fama.
  // Aqui o LEVEL volta a ser controlado pelo XP.
  window.atualizarNivelXP();

  const elementoNivel = document.getElementById('lvl');

  if (elementoNivel) {
   elementoNivel.innerText = level;
  }

  window.atualizarBarraXP();

  // Salva novamente com o LEVEL correto.
  if (typeof window.saveGame === 'function') {
   window.saveGame();
  }

  return resultado;
 };
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

  window.salvarClienteAtual();
 }

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
  window.alterarXP(-1);

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

 window.limparClienteAtual();

 if(window.taxaNegarAtual>0){
  window.taxaNegarAtual=Math.max(0,window.taxaNegarAtual-5);
  window.incNegar=Math.max(5,window.incNegar-5);

  if(window.taxaNegarAtual===0){
   window.vezNegar=0;
   window.incNegar=5;
  }
 }

 // POLICIAL: NÃO GANHA NEM PERDE XP
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

  // PAGAMENTO NORMAL +3 XP / PAGAMENTO COM JUROS +5 XP
  window.alterarXP(tipo=='juros'?5:3);

  document.getElementById('bubble').innerText='✅ Pagou R$'+de;
  log('✅ '+cur.n+' pagou R$'+de+' - lucro R$'+lucro);

  day++;
  check();
  novo();

 }else{
  // CALOTE: -1 XP
  window.alterarXP(-1);

  fame=Math.max(0,fame-0.5);
  seq=0;
  pendentePerda=peBase;

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
// NÃO ALTERA XP
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
// NÃO ALTERA XP
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
 window.xpAtual=0;
 usado={};

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
 novo();
};

// =====================================================
// CARREGAMENTO DO SAVE
// =====================================================

window.carregarSave=function(){
 let raw=localStorage.getItem('save_'+currentUser);

 if(!raw){
  window.xpAtual=0;
  level=1;
  novo();
  check();
  return;
 }

 try{
  let s=JSON.parse(raw);

  day=s.day ?? 1;
  money=s.money ?? 500;
  fame=s.fame ?? 1;

  // Mantém o nível antigo de quem ainda não tem XP salvo.
  level=s.level ?? 1;
  window.xpAtual=s.xpAtual ?? 0;

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

  if(s.ativasMissoes)ativasMissoes=s.ativasMissoes;
  if(s.ativasDesafios)ativasDesafios=s.ativasDesafios;

  window.atualizarNivelXP();

  renderSlots();
  atualizarTituloAvatar();
  novo();
  check();

 }catch(e){
  console.error('Erro ao carregar save:',e);
  novo();
  check();
 }
};

// =====================================================
// INICIALIZAÇÃO
// =====================================================

if(currentUser){
 window.carregarSave();
}else{
 window.xpAtual=0;
 level=1;
 novo();
 check();
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
