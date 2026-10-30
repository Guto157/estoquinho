// =========================================
// MAPA ORIGINAL - PEGA 1 PAGA 2 v1.0
// Variaveis: money, dolar, day, level, fame, inv, usado, totalEmp, totalLucro, seq, jurosCount, negarCount, cur, ativasMissoes, todasMissoes, proxMissaoIdx
// Funcoes: novo(), jogar(tipo), check(), saveGame(), renderSlots(), gerarMissoes(), openMissoes(), coletarMissao(), atualizarProgress(), atualizarNotificacoes()
// =========================================

// =========================================
// BLOCO DE ATUALIZAÇÕES E CORREÇÕES (v1.1)
// =========================================

// Correção do Bug: Impedir cliente de pedir valor acima do Caixa (money)
const originalGerarMissoes = gerarMissoes;
gerarMissoes = function() {
    // Executa a função original do seu mapa
    originalGerarMissoes();
    
    // Trava de segurança: se o valor do cliente atual (cur) pedir mais do que o Caixa (money)
    if (cur && cur.valor > money) {
        cur.valor = Math.floor(money * 0.85); // Limita o pedido a 85% do caixa atual
        if (cur.valor < 10) cur.valor = 10;   // Garante um valor mínimo de R$10
        
        // Atualiza o texto do balão (bubble) com o valor corrigido
        const bubble = document.getElementById('bubble');
        if (bubble) {
            bubble.innerText = `Me empresta R$${cur.valor}?`;
        }
    }
};
