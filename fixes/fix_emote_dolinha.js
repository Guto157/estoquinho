
// ============================================
// FIX EMOTE DOLINHA
// Notificações por categoria
// ============================================

(function () {
  if (window.fixEmoteDolinhaAtivo) return;
  window.fixEmoteDolinhaAtivo = true;

  console.log("FIX EMOTE DOLINHA CARREGADO");

  function elemento(id) {
    return document.getElementById(id);
  }

  function exibir(id, ativo) {
    const el = elemento(id);
    if (el) el.style.display = ativo ? "flex" : "none";
  }

  function atualizarEmotes() {
    const temMissao = Array.isArray(missaoParaColetar) &&
      missaoParaColetar.length > 0;

    const temDesafio = Array.isArray(desafiosParaColetar) &&
      desafiosParaColetar.length > 0;

    const conquistasProntas = typeof conquistas !== "undefined"
      ? conquistas.filter(c =>
          !conquistasColetadas[c.id] &&
          getProgConquista(c) >= c.meta
        )
      : [];

    const temConquista = conquistasProntas.length > 0;

    let temTituloLevel = false;

    if (typeof titulosLevel !== "undefined") {
      temTituloLevel = titulosLevel.some(t =>
        level >= t.l && tituloEscolhido !== t.n
      );
    }

    const temTituloConquista = conquistasProntas.some(c =>
      Boolean(c.premioTitulo)
    );

    const temTitulo = temTituloLevel || temTituloConquista;

    exibir("notifMissoes", temMissao);
    exibir("notifDesafios", temDesafio);
    exibir("notifConquistasMenu", temConquista);
    exibir("notifAbertas", temConquista);
    exibir("notifTitulosMenu", temTitulo);
    exibir("notifTituloHud", temTitulo);

    const temAlguma = temMissao || temDesafio || temConquista || temTitulo;

    exibir("notifMenuGeral", temAlguma);

    const btnMissoes = elemento("btnMissoes");
    const btnDesafios = elemento("btnDesafios");

    if (btnMissoes) btnMissoes.classList.toggle("btnNotif", temMissao);
    if (btnDesafios) btnDesafios.classList.toggle("btnNotif", temDesafio);
  }

  // Substitui a atualização antiga das notificações
  window.atualizarNotificacoes = atualizarEmotes;

  // Atualiza quando missões e desafios forem coletados
  const coletarMissaoOriginal = window.coletarMissao;

  if (typeof coletarMissaoOriginal === "function") {
    window.coletarMissao = function (...args) {
      const resultado = coletarMissaoOriginal.apply(this, args);
      atualizarEmotes();
      return resultado;
    };
  }

  const selecionarTituloOriginal = window.selecionarTitulo;

  if (typeof selecionarTituloOriginal === "function") {
    window.selecionarTitulo = function (...args) {
      const resultado = selecionarTituloOriginal.apply(this, args);
      atualizarEmotes();
      return resultado;
    };
  }

  const coletarConquistaOriginal = window.coletarConquista;

  if (typeof coletarConquistaOriginal === "function") {
    window.coletarConquista = function (...args) {
      const resultado = coletarConquistaOriginal.apply(this, args);
      atualizarEmotes();
      return resultado;
    };
  }

  // Recalcula notificações periodicamente para refletir desbloqueios
  // sem depender de recarregar a página.
  setInterval(atualizarEmotes, 1000);

  atualizarEmotes();

})();
