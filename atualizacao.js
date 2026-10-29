// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// FIX: FORÇAR NOVOS NOMES DE MISSÃO
// =========================================

function gerarMissoesNovas(){
const nomesMissoes=[
"Teste de Fogo na Laje","O Calote da Tia do Zé","Respeito é na Marra","Corrente de Pagamento","Juros do Boteco",
"Ronda do Madrugadão","O Cofre Tá Seco","Nome Pesado no Morro","Fluxo de Cobrança","Taxa do Atrasadinho",
"Giro da Madrugada","O Troco da Birosca","Quem Não Paga Se Explica","Fila de Devedor","Multa de Otário",
"Giro no Campinho","Lucro Suado da Laje","Voz no Baile Funk","Sequência Braba","Juros do Padrinho",
"Rastreiando os Caloteiros","Grana da Festa do Morro","Moral na Comunidade","Cobrança Sem Pena","O Corre do Agiota",
"Plantão 24h na Quebrada","Troco do Role","Respeito do Dono da Boca","Fila Quilométrica","Juros da Esquina",
"Patrulha da Laje","O Cofre Cheio","Nome Pichado no Muro","Rajadão de Recebimento","Tarifa de Calote",
"Giro na Feira da Favela","Lucro do Fluxo Noturno","Moral na Boca de Fumo","Sequência de Pix na Hora","Juros da Madrugada",
"Ronda no Beco Escuro","Grana do Baile da DZ7","Voz Alta no Paredão","Linha de Cobrança Ativa","Juros do Caloteiro Famoso",
"Corre Pesado do Patrão","Caixa Lotado da Quebrada","Lenda Viva da Laje","Combo Final do Agiota","O Último Juros do Morro"
];
let arr=[];
for(let i=1;i<=50;i++){
let tipo=i%5,meta,premio,tipoStr;
let nomeBase=nomesMissoes[i-1];
if(tipo==0){meta=6+Math.floor(i*0.9);premio=35+Math.floor(i*2.5);tipoStr="emp";arr.push({id:i,t:`${i}. ${nomeBase} - Emprestar ${meta}x`,meta,premio,prog:0,tipo:tipoStr});}
if(tipo==1){meta=900+i*280;premio=40+Math.floor(i*3);tipoStr="lucro";arr.push({id:i,t:`${i}. ${nomeBase} - Lucrar R$${meta}`,meta,premio,prog:0,tipo:tipoStr});}
if(tipo==2){meta=8+Math.floor(i/1.6);premio=45+Math.floor(i*2.8);tipoStr="fama";arr.push({id:i,t:`${i}. ${nomeBase} - Fama ${meta}`,meta,premio,prog:0,tipo:tipoStr});}
if(tipo==3){meta=6+Math.floor(i/2);premio=50+Math.floor(i*3);tipoStr="seq";arr.push({id:i,t:`${i}. ${nomeBase} - Sequência ${meta} pagamentos`,meta,premio,prog:0,tipo:tipoStr});}
if(tipo==4){meta=5+Math.floor(i/2.5);premio=55+Math.floor(i*3.2);tipoStr="juros";arr.push({id:i,t:`${i}. ${nomeBase} - Cobrar Juros ${meta}x`,meta,premio,prog:0,tipo:tipoStr});}
}
return arr;
}

// Sobrescreve a função original
gerarMissoes = gerarMissoesNovas;

// Função que atualiza tudo, mesmo com save velho
function forcarAtualizacaoMissoes(){
  let novas = gerarMissoesNovas();
  todasMissoes = novas;
  // Atualiza as 3 ativas pelo ID
  ativasMissoes.forEach(mAtiva => {
    let nova = novas.find(n => n.id === mAtiva.id);
    if(nova) mAtiva.t = nova.t;
  });
  console.log("MISSOES FORÇADAS:", ativasMissoes.map(m=>m.t));
  // Salva pra não voltar o nome velho
  if(typeof saveGame === 'function') saveGame();
}

// Roda 1s depois do carregamento pra garantir que o save já carregou
setTimeout(forcarAtualizacaoMissoes, 1000);

console.log("atualizacao.js carregado - fix de missoes aplicado");
