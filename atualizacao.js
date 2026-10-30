// atualizacao.js
(function(){
  const fixes = [
    'fixes/fix_emote_dolinha.js',
    'fixes/fix_menu_lateral.js',
    'fixes/fix_home.js',
    'fixes/fix_missoes.js',
    'fixes/fix_desafios.js'
  ];

  fixes.forEach(src => {
    let s = document.createElement('script');
    s.src = src + '?v=' + Date.now();
    document.body.appendChild(s);
  });

  console.log("PATCH CARREGADO");
})();
