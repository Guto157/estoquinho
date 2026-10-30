// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// ATUALIZACAO V11 - 29/10 21:27 - CORRIGE MODAL VAZIO
// =========================================
console.log("V11 CORRIGINDO VAZIO");

const NOMES=["","Teste de Fogo","Calote da Tia","Na Marra","Corrente","Juros Boteco","Ronda Madrugadão","Cofre Seco","Nome Pesado","Fluxo Cobrança","Taxa Atrasadinho","Giro Madrugada","Troco Birosca","Quem Não Paga Explica","Fila Devedor","Multa Otário","Giro Campinho","Chapa Quente na Laje","Lucro Suado","Calote da Tia do Zé","Voz no Baile","Sequência Braba","Rastreio Brabo no Beco","Juros Padrinho","Grana da Festa","Moral Comunidade","Cobrança Sem Pena","Corre do Agiota","Plantão 24h","Troco do Role","Respeito Dono","Fila Quilométrica","Juros Esquina"];

window.gerarMissoes=function(){
 let arr=[];
 for(let i=1;i<=50;i++){
  let tipo=i%5,meta,premio,tipoStr,nome=NOMES[i]||"Missão "+i;
  let titulo=`${i}. ${nome}`;
  if(tipo==0){meta=6+Math.floor(i*0.9);premio=35+Math.floor(i*2.5);tipoStr="emp";arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr});}
  if(tipo==1){meta=900+i*280;premio=40+Math.floor(i*3);tipoStr="lucro";arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr});}
  if(tipo==2){meta=8+Math.floor(i/1.6);premio=45+Math.floor(i*2.8);tipoStr="fama";arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr});}
  if(tipo==3){meta=6+Math.floor(i/2);premio=50+Math.floor(i*3);tipoStr="seq";arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr});}
  if(tipo==4){meta=5+Math.floor(i/2.5);premio=55+Math.floor(i*3.2);tipoStr="juros";arr.push({id:i,t:titulo,meta,premio,prog:0,tipo:tipoStr});}
 }
 return arr;
};

function garanteMissoes(){
 if(!window.ativasMissoes || window.ativasMissoes.length===0){
  let todas=window.gerarMissoes();
  window.todasMissoes=todas;
  window.ativasMissoes=todas.slice(0,5);
  try{if(typeof saveGame==='function')saveGame();}catch(e){}
 }
}

window.openMissoes=function(){
 garanteMissoes();
 let html='';
 (window.ativasMissoes||[]).forEach(m=>{
  let pct=Math.min(100,Math.floor((m.prog/m.meta*100)));
  html+=`<div class="card"><b>${m.t} ${m.prog>=m.meta?'💲':''}</b><div class="progress"><div class="bar" style="width:${pct}%"></div></div><small>${m.prog}/${m.meta} ${pct}%</small>${m.prog>=m.meta?`<button class="btn verde" onclick="coletarMissao(${m.id})">COLETAR 💲</button>`:''}</div>`;
 });
 document.getElementById('listaMissoes').innerHTML=html||'<div class="card">Sem missões - recarregue</div>';
 document.getElementById('missoesModal').style.display='flex';
};
window.closeMissoes=function(){document.getElementById('missoesModal').style.display='none';};

garanteMissoes();
