const clients = ["Seu João","Dona Maria","Marcos","Ana","Pedrão","Cléber"]
let day=1, money=0, lives=3, currentFiado=0, currentClient=""
let adsRemoved = false

function newClient(){
  currentClient = clients[Math.floor(Math.random()*clients.length)]
  currentFiado = [20,35,50,80,120,150][Math.floor(Math.random()*6)]
  document.getElementById('clientName').innerText = currentClient
  document.getElementById('fiadoValue').innerText = "???"
  document.getElementById('bubble').innerText = `${currentClient}: "Anota R$ ${currentFiado} aí pra mim?"`
  setTimeout(()=>{
    document.getElementById('fiadoValue').innerText = "???"
    document.getElementById('bubble').innerText = `Quanto que ${currentClient} fiou?`
    const choices = document.getElementById('choices')
    choices.innerHTML=""
    let opts = [currentFiado, currentFiado+15, currentFiado-10].sort(()=>0.5-Math.random())
    opts.forEach(v=>{
      const b=document.createElement('button')
      b.innerText = `R$ ${v}`
      b.onclick=()=>check(v)
      choices.appendChild(b)
    })
  }, 2000)
}

function check(val){
  if(val===currentFiado){
    money+=currentFiado
    document.getElementById('bubble').innerText="Boa! Pagou certinho."
  }else{
    lives--
    document.getElementById('bubble').innerText=`Errou! Era R$ ${currentFiado}. Levou calote.`
  }
  updateHUD()
  if(lives<=0){alert(`Faliu! Fez R$ ${money} em ${day} dias`); reset()}
  else {day++; setTimeout(newClient,1500)}
}

function updateHUD(){
  document.getElementById('day').innerText=day
  document.getElementById('money').innerText=money
  document.getElementById('lives').innerText="❤️".repeat(lives)
}

function reset(){day=1;money=0;lives=3;updateHUD();newClient()}

document.getElementById('btnAd').onclick=()=>{
  if(adsRemoved) return alert("Você já tirou anúncios!")
  // AQUI você cola seu código AdMob Rewarded
  alert("[ANÚNCIO PREMIADO] - usuário assistiu, ganhando vida + R$10")
  lives=Math.min(3,lives+1)
  money+=10
  updateHUD()
}
document.getElementById('btnRemoveAds').onclick=()=>{
  // AQUI você coloca seu link de PIX ou Stripe R$4,90
  const pixLink = prompt("Cole seu link de pagamento PIX R$4,90 ou digite OK pra simular")
  adsRemoved=true
  document.getElementById('btnAd').style.display="none"
  alert("Anúncios removidos! Obrigado pelo apoio.")
}

updateHUD()
newClient()
