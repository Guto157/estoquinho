// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// =========================================

// =========================================
// BLOCO DE ATUALIZAÇÕES E CORREÇÕES (v1.2)
// =========================================

// Interceptando a função jogar para corrigir o valor antes de qualquer ação
if (typeof jogar === 'function') {
    const originalJogar = jogar;
    jogar = function(tipo) {
        // Se a variável 'cur' (cliente atual) existir e tiver um valor maior que o caixa (money)
        if (cur && typeof cur === 'object') {
            // Procura por propriedades comuns de valor (ex: cur.valor, cur.quant, cur.money)
            const chaves = ['valor', 'quant', 'money', 'valorPedido', 'emprestimo'];
            chaves.forEach(chave => {
                if (cur[chave] && cur[chave] > money) {
                    cur[chave] = Math.floor(money * 0.8); // Limita a 80% do caixa
                    if (cur[chave] < 10) cur[chave] = 10;
                }
            });
        }
        // Executa a função original do mapa
        return originalJogar(tipo);
    };
}

// Interceptando também a função check para garantir que o cliente já nasça corrigido na tela
if (typeof check === 'function') {
    const originalCheck = check;
    check = function() {
        if (cur && typeof cur === 'object') {
            const chaves = ['valor', 'quant', 'money', 'valorPedido', 'emprestimo'];
            chaves.forEach(chave => {
                if (cur[chave] && cur[chave] > money) {
                    cur[chave] = Math.floor(money * 0.8);
                    if (cur[chave] < 10) cur[chave] = 10;
                }
            });
        }
        return originalCheck();
    };
}
