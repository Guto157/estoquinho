
// ATUALIZADOR CENTRAL DO JOGO
(function () {
  const fixes = [
    'fixes/fix_emote_dolinha.js',
    'fixes/fix_menu_lateral.js',
    'fixes/fix_home.js',
    'fixes/fix_missoes.js',
    'fixes/fix_desafios.js',
    'fixes/fix_lojinha.js'
  ];

  async function carregarAtualizacoes() {
    for (const src of fixes) {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src + '?v=' + Date.now();

          s.onload = resolve;
          s.onerror = () => reject(new Error('Erro ao carregar: ' + src));

          document.body.appendChild(s);
        });

        console.log('ATUALIZAÇÃO CARREGADA:', src);

      } catch (erro) {
        console.error(erro);
      }
    }

    console.log('TODAS AS ATUALIZAÇÕES PROCESSADAS');
  }

  carregarAtualizacoes();
})();
