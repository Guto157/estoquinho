let day=1,money=100,lives=3;
let rec=localStorage.getItem('rec')||0;
document.getElementById('rec').innerText=rec;
const devs=[
 {n:"Beto da Laje",e:"😰",f:"Minha filha tá doente, libera R$50?"},
 {n:"Magrão da 12",e:"😎",f:"Confia pai, vou pagar dobrado!"},
 {n:"Tia da Coxinha",e:"👩‍🍳",f:"Minha venda foi fraca hoje..."},
 {n:"Nego do Corte",e:"💈",f:"Preciso comprar lâmina, me ajuda?"}
];
let cur;
function newClient(){
 cur=devs[Math.floor(Math.random()*devs.length)];
 document.getElementById('clienteNome').innerText=cur.n;
 document.getElementById('cliente').innerText=cur.e;
 document.getElementById('bubble').innerText=cur.f;
 let c=document.getElementById('choices'); c.innerHTML="";
 let b1=document.createElement('button'); b1.innerText="💸 LIBERAR R$50 -> COBRAR R$100"; b1.style.background="#2ecc71"; b1.onclick=()=>cobrar();
 let b2=document.createElement('button'); b2.innerText="❌ NEGAR"; b2.style.background="#fff"; b2.onclick=()=>{document.getElementById('bubble').innerText="Cagão! Perdeu o cliente..."; setTimeout(newClient,1000)};
 c.appendChild(b1); c.appendChild(b2);
}
function cobrar(){
 let ag=document.getElementById('agiota');
 let paga=Math.random()>0.45;
 let c=document.getElementById('choices'); c.innerHTML="";
 document.getElementById('bubble').innerText=paga?"Tá na mão patrão! 💵":"Vish... não tenho agora 😭";
 let btn=document.createElement('button');
 if(paga){
   btn.innerText="✅ RECEBEU R$100! Lucro +R$50";
   btn.style.background="#2ecc71";
   btn.onclick=()=>{
     money+=50; day++;
     ag.innerText="🤑"; document.getElementById('bubble').innerText="ESSE É MEU PATRÃO! 🔥";
     atualiza(); setTimeout(newClient,1200);
   }
 } else {
   btn.innerText="💀 DEU CALOTE! -R$50 -1 VIDA";
   btn.style.background="#e74c3c"; btn.style.color="#fff";
   btn.onclick=()=>{
     money-=50; lives--; day++;
     ag.innerText="🤬"; ag.classList.add('bravo');
     document.getElementById('bubble').innerText="ME PAGA PORRA!!!";
     setTimeout(()=>{ag.classList.remove('bravo'); ag.innerText="🤑";},1000);
     atualiza(); setTimeout(newClient,1200);
   }
 }
 c.appendChild(btn);
}
function atualiza(){
 document.getElementById('day').innerText=day;
 document.getElementById('money').innerText=money;
 document.getElementById('lives').innerText="❤️".repeat(lives)+"🖤".repeat(3-lives);
 if(lives<=0 || money<=0){
   if(day>rec){localStorage.setItem('rec',day); rec=day;}
   setTimeout(()=>{
     if(confirm(`💀 QUEBROU! Fez ${day} dias com R$${money}. Recorde ${rec} dias. Compartilhar?`)){
       window.open(`https://wa.me/?text=Meu recorde no PEGA 1 PAGA 2 foi ${day} dias com R$${money}! Bate ai: https://guto157.github.io/estoquinho/`);
     }
     day=1; money=100; lives=3; atualiza(); newClient();
   },300);
 }
}
document.getElementById('btnAd').onclick=()=>{money+=100; atualiza(); document.getElementById('bubble').innerText="+R$100 do anúncio! Bora emprestar mais!";};
newClient(); atualiza();
