// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// ATUALIZACAO: Nomes das missões V4 - FIX CACHE + FECHAR
// =========================================
console.log("ATUALIZACAO V4 CARREGADA");

function gerarMissoesNovas(){
const nomes=[
"Teste de Fogo na Laje","O Calote da Tia do Zé","Respeito é na Marra","Corrente de Pagamento","Juros do Boteco",
"Ronda do Madrugadão","O Cofre Tá Seco","Nome Pesado no Morro","Fluxo de Cobrança","Taxa do Atrasadinho",
"Giro da Madrugada","O Troco da Birosca","Quem Não Paga Se Explica","Fila de Devedor","Multa de Otário",
"Giro no Campinho","Lucro Suado da Laje","Voz no Baile Funk","Sequência Braba","Juros do Padrinho",
"Rastreando Caloteiros","Grana da Festa","Moral na Comunidade","Cobrança Sem Pena","Corre do Agiota",
"Plantão 24h","Troco do Role","Respeito do Dono","Fila Quilométrica","Juros da Esquina",
"Patrulha da Laje","Cofre Cheio","Nome no Muro","Rajadão de Grana","Tarifa de Calote",
"Giro na Feira","Lucro do Fluxo","Moral na Boca","Pix na Hora","Juros da Madrugada",
"Ronda no Beco","Grana do Baile","Voz no Paredão","Linha de Cobrança","Juros do Caloteiro",
"Corre do Patrão","Caixa Lotado","Lenda da Laje","Combo Final","Último Juros"
];
let arr=[];
for(let i=1;i<=50;i++){
let tipo=i%5,meta,premio,tipoStr,nome=nomes[i-1];
if(tipo==0){meta=6+Math.floor(i*0.9);premio=35+Math.floor(i*2.5);tipoStr="emp";arr.push({id:i,t:`${i}. ${nome} - Emprestar ${meta}x`,meta,premio,prog:0,tipo:tipoStr});}
if(tipo==1){meta=900+i*280;premio=40+Math.floor(i*3);tipoStr="lucro";arr.push({id:i,t:`${i}. ${nome} - Lucrar R$${meta}`,meta,premio,prog:0,tipo:tipoStr});}
if(tipo==2){meta=8+Math.floor(i/1.6);premio=45+Math.floor(i*2.8);tipoStr="fama";arr.push({id:i,t:`${i}. ${nome} - Fama ${meta}`,meta,premio,prog:0,tipo:tipoStr});}
if(tipo==3){meta=6+Math.floor(i/2);premio=50+Math.floor(i*3);tipoStr="seq";arr.push({id:i,t:`${i}. ${nome} - Sequência ${meta} pagamentos`,meta,premio,prog:0,tipo:tipoStr});}
if(tipo==4){meta=5+Math.floor(i/2.5);premio=55+Math.floor(i*3.2);tipoStr="juros";arr.push({id:i,t:`${i}. ${nome} - Cobrar Juros ${meta}x`,meta,premio,prog:0,tipo:tipoStr});}
}
return arr;
}

window.gerarMissoes = gerarMissoesNovas;
window.todasMissoes = gerarMissoesNovas();

const intervalo = setInterval(()=>{
  if(window.ativasMissoes && window.ativasMissoes.length>0){
    window.ativasMissoes.forEach(m=>{
      let n = window.todasMissoes.find(x=>x.id===m.id);
      if(n) m.t = n.t;
    });
    console.log("NOMES CORRIGIDOS", window.ativasMissoes);
    if(typeof saveGame==='function') saveGame();
    clearInterval(intervalo);
  }
}, 500);
