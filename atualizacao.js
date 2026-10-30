// PATCH - MISSÕES
console.log("PATCH MISSÕES");

// 1. CORRIGE NOMES - 50 nomes da quebrada
window.gerarMissoes = function(){
  const nomes=["1. Primeiro Giro na Laje","2. Troco do Beco","3. Respeito na Quebrada","4. Sequência de Cobrança","5. Juros do Bar do Seu Zé","6. Ronda na Comunidade","7. Lucro da Banca","8. Moral no Morro","9. Embalo da Cobrança","10. Taxa do Atraso","11. Corre da Madrugada","12. Caixa da Birosca","13. Nome na Rua","14. Fio de Cobrança","15. Multa do Calote","16. Giro no Campinho","17. Lucro da Laje","18. Fama no Baile","19. Sequência no Beco","20. Juros do Padrinho","21. Rastreio na Favela","22. Grana da Festa","23. Voz na Comunidade","24. Corrente de Pagamento","25. Corre do Agiota","26. Plantão na Quebrada","27. Troco do Rolezinho","28. Respeito do Dono","29. Fila de Cobrança","30. Juros do Esquina","31. Patrulha do Morro","32. Cofre da Laje","33. Nome no Muro","34. Rajada de Recebimento","35. Tarifa do Atraso","36. Giro na Feira","37. Lucro do Fluxo","38. Moral na Boca","39. Sequência de Pix","40. Juros da Noite","41. Ronda do Beco","42. Grana do Baile","43. Voz do Paredão","44. Linha de Cobrança","45. Juros do Caloteiro","46. Corre do Patrão","47. Caixa Cheia da Laje","48. Lenda da Quebrada","49. Combo de Cobrança","50. Juros Final do Morro"];
  let arr=[];
  for(let i=1;i<=50;i++){
    let tipo=i%5, meta, premio, tipoStr;
    if(tipo==0){meta=6+Math.floor(i*0.9);premio=35+Math.floor(i*2.5);tipoStr="emp";arr.push({id:i,t:`${nomes[i-1]} - Emprestar ${meta}x`,meta,premio,prog:0,tipo:tipoStr});}
    if(tipo==1){meta=900+i*280;premio=40+Math.floor(i*3);tipoStr="lucro";arr.push({id:i,t:`${nomes[i-1]} - Lucrar R$${meta}`,meta,premio,prog:0,tipo:tipoStr});}
    if(tipo==2){meta=8+Math.floor(i/1.6);premio=45+Math.floor(i*2.8);tipoStr="fama";arr.push({id:i,t:`${nomes[i-1]} - Fama ${meta}`,meta,premio,prog:0,tipo:tipoStr});}
    if(tipo==3){meta=6+Math.floor(i/2);premio=50+Math.floor(i*3);tipoStr="seq";arr.push({id:i,t:`${nomes[i-1]} - Seq ${meta} pagamentos`,meta,premio,prog:0,tipo:tipoStr});}
    if(tipo==4){meta=5+Math.floor(i/2.5);premio=55+Math.floor(i*3.2);tipoStr="juros";arr.push({id:i,t:`${nomes[i-1]} - Cobrar Juros ${meta}x`,meta,premio,prog:0,tipo:tipoStr});}
  }
  return arr;
}

// 2. CORRIGE ATUALIZAÇÃO EM TEMPO REAL
window.atualizarProgress = function(){
  ativasMissoes.forEach(m=>{
    if(m.tipo=="emp") m.prog=totalEmp;
    if(m.tipo=="lucro") m.prog=totalLucro;
    if(m.tipo=="fama") m.prog=fame;
    if(m.tipo=="seq") m.prog=seq;
    if(m.tipo=="juros") m.prog=jurosCount;
    if(m.prog>m.meta) m.prog=m.meta;
  });
  missaoParaColetar=ativasMissoes.filter(m=>m.prog>=m.meta);
  renderColeta();
  saveGame();
  atualizarNotificacoes();
  if(document.getElementById('missoesModal').style.display=='flex'){openMissoes();}
}

// Recarrega missões com nomes novos
todasMissoes = gerarMissoes();
if(ativasMissoes.length>0){
  let idsAtivos = ativasMissoes.map(m=>m.id);
  ativasMissoes = idsAtivos.map(id=> todasMissoes.find(x=>x.id==id)).filter(Boolean);
}
atualizarProgress();
