(function () {
  if (window.fixEmoteDolinhaAtivo) return;
  window.fixEmoteDolinhaAtivo = true;

  console.log("FIX EMOTE DOLINHA - NOTIFICAÇÕES SINCRONIZADAS");

  function el(id) {
    return document.getElementById(id);
  }

  function exibir(id, ativo) {
    const item = el(id);
    if (item) item.style.display = ativo ? "flex" : "none";
  }

  function chaveTitulo() {
    const usuario = typeof currentUser !== "undefined" && currentUser
      ? String(currentUser)
      : "visitante";

    return "titulosVisualizados_" + usuario;
  }

  function titulosDesbloqueados() {
    const lista = [];

    if (typeof titulosLevel !== "undefined") {
      titulosLevel.forEach(t => {
        if (level >= t.l) {
          lista.push("LEVEL:" + t.n);
        }
      });
    }

    if (
      typeof conquistas !== "undefined" &&
      typeof conquistasColetadas !== "undefined"
    ) {
      conquistas.forEach(c => {
        if (conquistasColetadas[c.id] && c.premioTitulo) {
          lista.push("EXCLUSIVO:" + c.premioTitulo);
        }
      });
    }

    return lista.sort();
  }

  function assinaturaTitulos() {
    return JSON.stringify(titulosDesbloqueados());
  }

  function tituloJaVisualizado() {
    try {
      return localStorage.getItem(chaveTitulo()) === assinaturaTitulos();
    } catch (e) {
      return false;
    }
  }

  function marcarTitulosVisualizados() {
    try {
      localStorage.setItem(chaveTitulo(), assinaturaTitulos());
    } catch (e) {}

    atualizarEmotes();
  }

  function atualizarEmotes() {
    const temMissao =
      typeof missaoParaColetar !== "undefined" &&
      missaoParaColetar.length > 0;

    const temDesafio =
      typeof desafiosParaColetar !== "undefined" &&
      desafiosParaColetar.length > 0;

    let conquistasProntas = [];

    if (
      typeof conquistas !== "undefined" &&
      typeof conquistasColetadas !== "undefined" &&
      typeof getProgConquista === "function"
    ) {
      conquistasProntas = conquistas.filter(c =>
        !conquistasColetadas[c.id] &&
        getProgConquista(c) >= c.meta
      );
    }

    const temConquista = conquistasProntas.length > 0;

    const temTitulo =
      titulosDesbloqueados().length > 0 &&
      !tituloJaVisualizado();

    // Avisos individuais.
    exibir("notifMissoes", temMissao);
    exibir("notifDesafios", temDesafio);
    exibir("notifConquistasMenu", temConquista);
    exibir("notifAbertas", temConquista);
    exibir("notifTitulosMenu", temTitulo);
    exibir("notifTituloHud", temTitulo);

    // Aviso geral.
    const temAlgum =
      temMissao ||
      temDesafio ||
      temConquista ||
      temTitulo;

    exibir("notifMenuGeral", temAlgum);

    // Destaque nos botões.
    const btnMissoes = el("btnMissoes");
    const btnDesafios = el("btnDesafios");

    if (btnMissoes) {
      btnMissoes.classList.toggle("btnNotif", temMissao);
    }

    if (btnDesafios) {
      btnDesafios.classList.toggle("btnNotif", temDesafio);
    }
  }

  window.atualizarNotificacoes = atualizarEmotes;

  // Reconhece os títulos já visualizados.
  const selecionarOriginal = window.selecionarTitulo;

  if (typeof selecionarOriginal === "function") {
    window.selecionarTitulo = function (...args) {
      const resultado = selecionarOriginal.apply(this, args);
      marcarTitulosVisualizados();
      return resultado;
    };
  }

  // Atualiza depois de coletar conquistas.
  const conquistaOriginal = window.coletarConquista;

  if (typeof conquistaOriginal === "function") {
    window.coletarConquista = function (...args) {
      const resultado = conquistaOriginal.apply(this, args);
      atualizarEmotes();
      return resultado;
    };
  }

  // Atualiza depois de coletar missões.
  const missaoOriginal = window.coletarMissao;

  if (typeof missaoOriginal === "function") {
    window.coletarMissao = function (...args) {
      const resultado = missaoOriginal.apply(this, args);
      atualizarEmotes();
      return resultado;
    };
  }

  // Verifica novos avisos periodicamente.
  setInterval(atualizarEmotes, 1000);

  atualizarEmotes();

})();
