let day=1,money=0,lives=3,streak=0;
const clients=[
{n:"Dona Maria",e:"👵",c:0.1},
{n:"Seu João",e:"👨‍🌾",c:0.8},
{n:"Cleber",e:"😎",c:0.6}
];
let cur=null;
function newClient(){
 cur=clients[Math.floor(Math.random()*clients.length)];
 cur.v=[20,35,50,80,120][Math.floor(Math.random()*5)];
 document.getElementById('client').innerText=cur.e;
 document.getElementById('clientName').innerText=cur.n;
 document.getElementById('bubble').innerText=cur.n+" fiou R$ "+cur.v;
 setTimeout(showChoices,1000);
}
function showChoices(){
 document.getElementById('bubble').innerText="Quanto "+cur.n+" fiou?";
 let ch=document.getElementById('choices');
 ch.innerHTML="";
 let opts=[cur.v,cur.v+20,cur.v-10];
 opts.sort(()=>Math.random()-0.5);
 opts.forEach(v=>{
  let b=document.createElement('button');
  b.innerText="R$ "+v;
  b.onclick=function(){check(v);};
  ch.appendChild(b);
 });
}
function check(v){
 if(v===cur.v){
  money+=cur.v;
  streak++;
  document.getElementById('bubble').innerText="✅ Acertou! +R$"+cur.v;
 }else{
  lives--;
  streak=0;
  document.getElementById('bubble').innerText="❌ Errou! Era R$ "+cur.v+" - calote!";
  money=Math.max(0,money-20);
 }
 day++;
 document.getElementById('day').innerText=day;
 document.getElementById('money').innerText=money;
 document.getElementById('streak').innerText=streak;
 document.getElementById('lives').innerText="❤️".repeat(lives);
 if(lives<=0){
  alert("Faliu! Fez R$ "+money+" em "+day+" dias");
  day=1;money=0;lives=3;streak=0;
  document.getElementById('day').innerText=day;
  document.getElementById('money').innerText=money;
  document.getElementById('lives').innerText="❤️❤️❤️";
 }
 setTimeout(newClient,1500);
}
newClient();
document.getElementById('btnAd').onclick=function(){lives=3;document.getElementById('lives').innerText="❤️❤️❤️";alert("+3 vidas");};
