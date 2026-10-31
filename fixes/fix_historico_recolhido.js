
// ============================================
// HISTÓRICO DE MOVIMENTAÇÕES NO MENU LATERAL
// ============================================

(function () {
  function configurarHistorico() {
    const log = document.getElementById('log');
    const drawer = document.querySelector('#menuDrawer .drawer');

    if (!log || !drawer) {
      console.warn('HISTÓRICO: elementos não encontrados.');
      return;
    }

    // Evita duplicar o botão e o painel
    if (document.getElementById('btnHistoricoMenu')) return;

    // Cria o botão do histórico
    const botao = document.createElement('div');
    botao.id = 'btnHistoricoMenu';
    botao.className = 'menuItem';

    botao.innerHTML = `
      <span>📋 HISTÓRICO DE MOVIMENTAÇÕES</span>
      <span id="setaHistorico">＋</span>
    `;

    // Cria a área que contém os registros
    const painel = document.createElement('div');
    painel.id = 'painelHistorico';
    painel.style.display = 'none';

    painel.appendChild(log);

    // Insere o botão antes do botão FECHAR
    const botoes = drawer.querySelectorAll('button');
    const botaoFechar = Array.from(botoes).find(
      b => b.textContent.trim().includes('FECHAR')
    );

    if (botaoFechar) {
      drawer.insertBefore(botao, botaoFechar);
      drawer.insertBefore(painel, botaoFechar);
    } else {
      drawer.appendChild(botao);
      drawer.appendChild(painel);
    }

    // Abre e fecha o histórico
    botao.addEventListener('click', function () {
      const aberto = painel.style.display !== 'none';

      painel.style.display = aberto ? 'none' : 'block';

      document.getElementById('setaHistorico').textContent =
        aberto ? '＋' : '−';
    });

    // Estilos
    const estilo = document.createElement('style');
    estilo.id = 'estiloHistoricoMenu';

    estilo.textContent = `
      #btnHistoricoMenu {
        background: #FFF3B0;
        border-color: #111;
      }

      #painelHistorico {
        background: #fff;
        border: 2px solid #111;
        border-radius: 10px;
        padding: 8px;
        max-height: 45vh;
        overflow-y: auto;
      }

      #painelHistorico #log {
        display: block;
        width: 100%;
        height: auto !important;
        max-height: none !important;
        min-height: 20px;
        overflow: visible !important;
        color: #333;
        font-size: 11px !important;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }

      #painelHistorico #log br {
        display: block;
        content: "";
        margin-bottom: 4px;
      }
    `;

    document.head.appendChild(estilo);

    console.log('HISTÓRICO: integrado ao menu lateral.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarHistorico);
  } else {
    configurarHistorico();
  }
})();
