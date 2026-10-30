// fixes/fix_dolinha.js - MOEDA PREMIUM DOLINHA
// Compra com PIX real + Recompensas

const DolinhaFix = {
  // Evita duplicar compra do PIX
  pixJaProcessado: new Set(),

  // Adicionar dolinha com segurança
  addDols: function(userId, qtd, origem, pixId = null) {
    // Se for PIX, verifica se já não foi creditado
    if (pixId && this.pixJaProcessado.has(pixId)) {
      console.log("PIX já creditado:", pixId);
      return false;
    }

    // Aqui entra sua função original de dar saldo
    // Ex: darDols(userId, qtd)

    if (pixId) this.pixJaProcessado.add(pixId);
    
    console.log(`+${qtd} dols para ${userId} | origem: ${origem}`);
    return true;
  },

  // Verifica saldo antes de gastar
  podeGastar: function(userSaldo, custo) {
    return userSaldo >= custo && userSaldo > 0;
  }
};

console.log("fix_dolinha PREMIUM carregado");
