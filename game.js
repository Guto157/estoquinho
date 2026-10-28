const clients=[
{name:"Dona Maria",emoji:"👵",frase:"Minha aposentadoria sai dia 5!",calote:0.1},
{name:"Seu João",emoji:"👨‍🌾",frase:"Tô liso, anota aí...",calote:0.8},
{name:"Cléber da moto",emoji:"😎",frase:"Depois te pago com juros, confia",calote:0.6},
{name:"Ana da venda",emoji:"💅",frase:"É pro meu salão, vai voltar em dobro",calote:0.3}
];
let day=1,money=0,lives=3,streak=0,cur=null;
function newClient(){
 cur=clients[Math.floor(Math.random()*clients.length)];
 cur.valor=[20,35,50,80,120][Math.floor(Math.random()*5)];
 document.getElementById('client').innerText=cur.emoji;
 document.getElementById('clientName').innerText=cur.name;
 document.getElementById('bubble').innerText=`"${cur.frase} R$ ${cur.valor}"`;
 setTimeout(()=>{
  document.getElementById('bubble').innerText=`Quanto ${cur.name} fiou?`;
  let c=document.getElementById('choices');c.innerHTML="";
  [cur.valor,cur.valor+15,cur.valor-10].sort(()=>Math.random()-0.5).forEach(v=>{
   let b=document.createElement('button');b.innerText="R$ "+v;
   b.onclick=()=>check(v);c.appendChild(b);
  })
 },2000)
}
function check(v){
 if(v===cur.valor){money+=cur.valor;streak++;document.getElementById('bubble').innerText=streak>=3?`🔥 ${streak} ACERTOS SEGUIDOS! +R$50 BÔNUS!`:"✅ Pagou!"; if(streak%3==0)money+=50;}
 else{ lives--; streak=0; if(Math.random()<cur.calote){money=Math.max(0,money-cur.valor);document.getElementById('bubble').innerText=`💸 CALOTE! ${cur.name} não pagou e você perdeu R$ ${cur.valor}!`;} else document.getElementById('bubble').innerText=`❌ Errou! Era R$ ${cur.valor}`;}
 day++; if(day%7==0){document.getElementById('bubble').innerText="😱 AGIO CHEGOU! -R$ 80"; money=Math.max(0,money-80);}
 document.getElementById('day').innerText=day;document.getElementById('money').innerText=money;document.getElementById('lives').innerText="❤️".repeat(lives);
 if(lives<=0){alert(`💀 FALIU! Sobreviveu ${day} dias e fez R$ ${money}. Tenta de novo?`); day=1;money=0;lives=3;streak=0;}
 setTimeout(newClient,1500);
}
document.getElementById('btnAd').onclick=()=>{lives=3;money+=20;document.getElementById('lives').innerText="❤️".repeat(lives);document.getElementById('money').innerText=money;alert("🎬 Você assistiu e ganhou 3 vidas + R$20! (aqui entra seu AdMob ca-pub-5655976483764863)");}
document.getElementById('btnRemoveAds').onclick=()=>{alert("PIX R$4,90 - aqui vai seu link");};
newClient();
