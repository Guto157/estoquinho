
// ============================================
// CORREÇÃO DE LAYOUT DO CLIENTE
// Avatar menor ao lado do nome e diálogo abaixo
// ============================================

(function () {
  function aplicarLayoutCliente() {
    const info = document.getElementById('info');
    const h3 = info?.querySelector('h3');
    const clienteBox = document.getElementById('clienteBox');
    const bubble = document.getElementById('bubble');
    const hist = document.getElementById('hist');
    const stats = info?.querySelector('.stats');

    if (!info || !h3 || !clienteBox || !bubble || !stats) {
      console.warn('LAYOUT CLIENTE: elementos não encontrados.');
      return;
    }

    // Evita aplicar a correção mais de uma vez
    if (document.getElementById('clienteCabecalho')) return;

    // Cria o cabeçalho do cliente
    const cabecalho = document.createElement('div');
    cabecalho.id = 'clienteCabecalho';

    // Move o avatar e o nome para o novo cabeçalho
    info.insertBefore(cabecalho, h3);
    cabecalho.appendChild(clienteBox);
    cabecalho.appendChild(h3);

    // Move o balão para dentro da área de informações
    info.insertBefore(bubble, stats);

    // Evita duplicação do diálogo
    if (hist) {
      hist.style.display = 'none';
    }

    // Estilos do novo layout
    const estilo = document.createElement('style');
    estilo.id = 'estiloLayoutCliente';

    estilo.textContent = `
      #clienteCabecalho {
        display: flex;
        align-items: center;
        gap: 9px;
        width: 100%;
        min-width: 0;
        margin-bottom: 4px;
      }

      #clienteCabecalho #clienteBox {
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        flex: 0 0 44px;
        border-width: 2px !important;
        margin: 0 !important;
      }

      #clienteCabecalho #clienteAvatar {
        font-size: 14px !important;
      }

      #clienteCabecalho h3 {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
        min-width: 0;
        margin: 0 !important;
        font-size: 16px;
        line-height: 1.2;
      }

      #info #bubble {
        display: block;
        width: 100%;
        box-sizing: border-box;
        margin: 3px 0 7px;
      }

      #info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      #info #hist {
        display: none !important;
      }

      @media (max-width: 400px) {
        #clienteCabecalho #clienteBox {
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          min-height: 40px !important;
          flex-basis: 40px;
        }

        #clienteCabecalho h3 {
          font-size: 14px;
        }
      }
    `;

    document.head.appendChild(estilo);

    console.log('LAYOUT CLIENTE: correção aplicada.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarLayoutCliente);
  } else {
    aplicarLayoutCliente();
  }
})();
