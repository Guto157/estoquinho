const clients = [
  {nome:"Dona Maria", emoji:"👵", fala:["Meu filho, anota aí...", "Pago dia 5 sem falta!"], chanceCalote:0.1},
  {nome:"Seu João", emoji:"👨‍🌾", fala:["Anota aí patrão", "Tô sem nada hoje"], chanceCalote:0.7},
  {nome:"Cléber", emoji:"😎", fala:["Confia!", "Depois te pago com juros"], chanceCalote:0.5},
]
let day=1, money=0, lives=3, current=null, streak=0

function newClient(){
  current = clients[Math.floor(Math.random()*clients.length)]
  current.fiado = [20,50,90,150][Math.floor(Math.random()*4)]
  document.getElementById('client').innerText=current.emoji
  document.getElementById('clientName').innerText=current.nome
  document.getElementById('bubble').innerText=`"${current.fala[0]} R$ ${current.fiado}"`
  
  setTimeout(()=>{
    document.getElementById('bubble').innerText=`Quanto ${current.nome} pediu? Se errar leva calote!`
    const choices=document.getElementById('choices')
    choices.innerHTML=""
    let opts=[current.fiado, current.fiado+20, current.fiado-15].sort(()=>0.5-Math.random())
    opts.forEach(v=>{
      let b=document.createElement('button'); b.innerText=`R$ ${v}`
      b.onclick=()=>check(v); choices.appendChild(b)
    })
  },2200)
}

function check(v){
  if(v===current.fiado){
    money+=v; streak++; 
    document.getElementById('bubble').innerText=streak>=3 ? `🔥 ${streak} SEGUIDOS!` : "Pagou certinho!"
    if(streak%5==0) money+=50 // bônus streak
  }else{
    if(Math.random() < current.chanceCalote){ money=Math.max(0,money-current.fiado); document.getElementById('bubble').innerText=`💸 CALOTE do ${current.nome}! Perdeu R$ ${current.fiado}` }
    lives--; streak=0
  }
  day++; 
  if(day%6==0){ document.getElementById('bubble').innerText="😱 AGIO CHEGOU! Pague R$ 100 ou perde tudo!"; money-=100 }
  updateHUD()
  if(lives<=0){ alert(`Faliu com R$ ${money}. Seu recorde foi dia ${day}`); day=1;money=0;lives=3;streak=0; }
  setTimeout(newClient,1500)
}
function updateHUD(){ 
  document.getElementById('day').innerText=day; 
  document.getElementById('money').innerText=money; 
  document.getElementById('lives').innerText="❤️".repeat(lives) 
}
updateHUD(); newClient()

document.getElementById('btnAd').onclick=()=>{ lives=3; alert("Você viu anúncio e ganhou vidas!"); updateHUD() }
