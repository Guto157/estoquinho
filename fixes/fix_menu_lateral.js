
// ============================================
// BOTÃO X PARA FECHAR TELAS E MODAIS
// Usa a mesma função do botão FECHAR original
// ============================================

(function () {
  if (window.fixFecharTelasAtivo) return;
  window.fixFecharTelasAtivo = true;

  function adicionarX(tela) {
    if (!tela) return;

    const botaoFechar = Array.from(
      tela.querySelectorAll('button, .btn, .menuItem')
    ).find(el => /fechar/i.test(el.textContent.trim()));

    if (!botaoFechar) return;

    const conteudo = tela.firstElementChild || tela;

    if (conteudo.querySelector('.botaoXFechar')) return;

    if (getComputedStyle(conteudo).position === 'static') {
      conteudo.style.position = 'relative';
    }

    const x = document.createElement('button');
    x.className = 'botaoXFechar';
    x.type = 'button';
    x.innerHTML = '&times;';
    x.title = 'Fechar';
    x.setAttribute('aria-label', 'Fechar tela');

    x.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 2px solid #111;
      border-radius: 9px;
      background: #FF5252;
      color: white;
      font-size: 28px;
      font-weight: 900;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
    `;

    x.addEventListener('click', function (e) {
      e.stopPropagation();
      botaoFechar.click();
    });

    conteudo.appendChild(x);
  }

  function verificarTelas() {
    document.querySelectorAll('[id$="Modal"]').forEach(tela => {
      if (getComputedStyle(tela).display !== 'none') {
        adicionarX(tela);
      }
    });
  }

  const observador = new MutationObserver(verificarTelas);

  function iniciar() {
    verificarTelas();

    observador.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  console.log('FIX MENU LATERAL: botão X carregado.');
})();
