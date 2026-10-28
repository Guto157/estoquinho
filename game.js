if(lives<=0){
  let rec = localStorage.getItem('rec')||0;
  if(day>rec) localStorage.setItem('rec',day);
  if(confirm(`💀 FALIU! ${day} dias, R$${money} no caixa. Recorde: ${rec} dias. Compartilhar no Zap?`)){
    window.open(`https://wa.me/?text=Meu recorde no PEGA 1 PAGA 2 foi ${day} dias com R$${money}! Consegue bater? https://guto157.github.io/estoquinho/`);
  }
  day=1;money=100;lives=3;
}
