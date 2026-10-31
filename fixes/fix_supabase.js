// SUPABASE: LOGIN, PROTECAO DE VERSAO E SINCRONIZACAO EM TEMPO REAL
(async function () {
  const SUPABASE_URL = 'https://zhcckqekuzatugimezlk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Bd-vtxSYz23BH0L8k744SA_9t12A4dv';

  function carregarBiblioteca() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) return resolve();

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Falha ao carregar Supabase'));
      document.head.appendChild(script);
    });
  }

  try {
    await carregarBiblioteca();
  } catch (erro) {
    console.error(erro);
    alert('Erro ao conectar com o sistema de login. Atualize a página.');
    return;
  }

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.sbClient = sb;

  let usuarioId = null;
  let nomeJogador = null;
  let saveTimer = null;
  let carregamentoConcluido = false;
  let salvamentoEmAndamento = false;

  let versaoNuvem = 0;
  let sincronizacaoBloqueada = false;

  // CONTROLE DAS ALTERACOES LOCAIS
  let alteracoesPendentes = false;
  let revisaoLocal = 0;
  let aplicandoProgresso = false;
  let avisoConflitoExibido = false;

  // REALTIME
  let canalRealtime = null;
  let processandoEvento = false;
  let eventoPendente = false;

  const modal = document.getElementById('loginModal');
  const campoNome = document.getElementById('loginUser');
  const campoSenha = document.getElementById('loginPass');
  const botaoLogin = modal.querySelector('.btn.amarelo');

  const IDs_LOJINHA = [
    'bone', 'cordao', 'relogio', 'glock', 'pit', 'moto'
  ];

  function converterInventario(dados) {
    if (!dados) return {};

    if (typeof dados === 'string') {
      try {
        dados = JSON.parse(dados);
      } catch (e) {
        return {};
      }
    }

    if (typeof dados !== 'object' || dados === null) return {};

    const resultado = {};

    IDs_LOJINHA.forEach(id => {
      const nivel = Number(dados[id]);

      if (
        dados[id] !== undefined &&
        Number.isInteger(nivel) &&
        nivel >= 0 &&
        nivel <= 4
      ) {
        resultado[id] = nivel;
      }
    });

    return resultado;
  }

  function mesclarInventarios(...inventarios) {
    const resultado = {};

    inventarios.forEach(dados => {
      const inventario = converterInventario(dados);

      IDs_LOJINHA.forEach(id => {
        if (inventario[id] === undefined) return;

        if (
          resultado[id] === undefined ||
          inventario[id] > resultado[id]
        ) {
          resultado[id] = inventario[id];
        }
      });
    });

    return resultado;
  }

  function chaveInventario() {
    return currentUser ? 'lojinha_permanente_' + currentUser : null;
  }

  function obterInventarioAtual() {
    const chave = chaveInventario();

    const local = chave
      ? converterInventario(localStorage.getItem(chave))
      : {};

    const inventario = mesclarInventarios(inv, local);

    inv = inventario;

    if (chave) {
      localStorage.setItem(chave, JSON.stringify(inventario));
    }

    return inventario;
  }

  function mensagem(msg) {
    const el = document.getElementById('loginErro');
    el.innerText = msg;
    el.style.display = 'block';
    el.style.background = '#FFF3CD';
    el.style.color = '#664D03';
    el.style.borderColor = '#FFCA2C';
  }

  function limparMensagem() {
    document.getElementById('loginErro').style.display = 'none';
  }

  function atualizarMenu() {
    document.getElementById('menuUser').innerText = nomeJogador || '-';
  }

  if (!document.getElementById('loginEmail')) {
    const email = document.createElement('input');
    email.id = 'loginEmail';
    email.type = 'email';
    email.placeholder = 'Seu e-mail';
    email.autocomplete = 'email';
    email.style.cssText =
      'width:100%;padding:10px;border:2.5px solid #111;border-radius:10px;margin-top:6px;box-sizing:border-box';

    campoNome.parentNode.insertBefore(email, campoNome);
  }

  const campoEmail = document.getElementById('loginEmail');

  campoNome.placeholder = 'Seu nome de jogador';
  campoNome.autocomplete = 'nickname';
  campoSenha.placeholder = 'Senha (mínimo 6 caracteres)';
  botaoLogin.textContent = 'ENTRAR';

  let botaoCadastro = document.getElementById('botaoCadastroSupabase');

  if (!botaoCadastro) {
    botaoCadastro = document.createElement('button');
    botaoCadastro.id = 'botaoCadastroSupabase';
    botaoCadastro.className = 'btn preto';
    botaoCadastro.textContent = 'CRIAR CONTA';
    botaoCadastro.style.cssText = 'width:100%;margin-top:8px';
    botaoLogin.insertAdjacentElement('afterend', botaoCadastro);
  }

  // =====================================================
  // DADOS DO JOGO, INCLUINDO XP
  // =====================================================

  function dadosDoJogo() {
    const inventario = obterInventarioAtual();

    return {
      day,
      money,
      fame,
      level,
      xpAtual: Math.max(0, Number(window.xpAtual) || 0),
      dolar,
      inv: inventario,
      usado,
      totalEmp,
      totalLucro,
      jurosCount,
      negarCount,
      conquistasColetadas,
      tituloEscolhido,
      proxMissaoIdx,
      proxDesafioIdx,
      ativasMissoes,
      ativasDesafios,
      lojinhaPermanente: inventario
    };
  }

  // =====================================================
  // APLICAR PROGRESSO, INCLUINDO XP
  // =====================================================

  function aplicarProgresso(progresso, inventarioFinal) {
    aplicandoProgresso = true;

    try {
      day = progresso.day ?? 1;
      money = progresso.money ?? 500;
      fame = progresso.fame ?? 1;
      level = progresso.level ?? 1;
      window.xpAtual = Math.max(0, Number(progresso.xpAtual) || 0);
      dolar = progresso.dolar ?? 0;

      inv = inventarioFinal;

      usado = progresso.usado ?? {};
      totalEmp = progresso.totalEmp ?? 0;
      totalLucro = progresso.totalLucro ?? 0;
      jurosCount = progresso.jurosCount ?? 0;
      negarCount = progresso.negarCount ?? 0;

      conquistasColetadas = progresso.conquistasColetadas ?? {};
      tituloEscolhido = progresso.tituloEscolhido ?? null;

      proxMissaoIdx = progresso.proxMissaoIdx ?? 3;
      proxDesafioIdx = progresso.proxDesafioIdx ?? 3;

      if (progresso.ativasMissoes !== undefined) {
        ativasMissoes = progresso.ativasMissoes;
      }

      if (progresso.ativasDesafios !== undefined) {
        ativasDesafios = progresso.ativasDesafios;
      }

      if (typeof renderSlots === 'function') renderSlots();
      if (typeof atualizarTituloAvatar === 'function') atualizarTituloAvatar();
      if (typeof check === 'function') check();

      if (typeof window.atualizarBarraXP === 'function') {
        window.atualizarBarraXP();
      }

      console.log('PROGRESSO APLICADO:', {
        day, money, level, xpAtual: window.xpAtual, fame, dolar, inv
      });
    } finally {
      aplicandoProgresso = false;
    }
  }

  function bloquearPorConflito(motivo) {
    sincronizacaoBloqueada = true;
    alteracoesPendentes = true;

    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    console.warn('SINCRONIZACAO BLOQUEADA:', motivo);

    if (!avisoConflitoExibido) {
      avisoConflitoExibido = true;

      alert(
        'Outro dispositivo salvou um progresso mais recente. ' +
        'Este jogo foi protegido para evitar perda de dados. ' +
        'Atualize a página para carregar o progresso mais recente.'
      );
    }
  }

  async function salvarNuvem() {
    if (
      !usuarioId ||
      !carregamentoConcluido ||
      salvamentoEmAndamento ||
      sincronizacaoBloqueada
    ) {
      return;
    }

    salvamentoEmAndamento = true;
    const revisaoSalva = revisaoLocal;

    try {
      const dadosAtuais = dadosDoJogo();

      const inventarioFinal = mesclarInventarios(
        dadosAtuais.inv,
        dadosAtuais.lojinhaPermanente
      );

      dadosAtuais.inv = inventarioFinal;
      dadosAtuais.lojinhaPermanente = inventarioFinal;
      inv = inventarioFinal;

      const { data, error } = await sb.rpc(
        'save_game_if_version',
        {
          p_game_data: dadosAtuais,
          p_expected_version: versaoNuvem
        }
      );

      if (error) throw error;

      const resultado = Array.isArray(data) ? data[0] : data;

      if (!resultado?.saved) {
        bloquearPorConflito({
          versaoLocal: versaoNuvem,
          versaoNuvemAtual: resultado?.current_version
        });
        return;
      }

      versaoNuvem = Number(resultado.current_version);

      const chave = chaveInventario();

      if (chave) {
        localStorage.setItem(chave, JSON.stringify(inventarioFinal));
      }

      localStorage.setItem(
        'save_' + nomeJogador,
        JSON.stringify(dadosAtuais)
      );

      if (revisaoLocal === revisaoSalva) {
        alteracoesPendentes = false;
      }

      console.log('SALVAMENTO CONCLUIDO:', {
        money: dadosAtuais.money,
        day: dadosAtuais.day,
        level: dadosAtuais.level,
        xpAtual: dadosAtuais.xpAtual,
        version: versaoNuvem,
        inventario: inventarioFinal
      });

    } catch (erro) {
      console.error('Erro ao salvar na nuvem:', erro);
    } finally {
      salvamentoEmAndamento = false;

      if (eventoPendente) {
        eventoPendente = false;
        processarAtualizacaoRemota();
      }

      if (
        alteracoesPendentes &&
        !sincronizacaoBloqueada &&
        revisaoLocal !== revisaoSalva
      ) {
        agendarSalvamentoNuvem();
      }
    }
  }

  function agendarSalvamentoNuvem() {
    if (
      !usuarioId ||
      !carregamentoConcluido ||
      sincronizacaoBloqueada ||
      aplicandoProgresso
    ) {
      return;
    }

    alteracoesPendentes = true;
    revisaoLocal++;

    if (saveTimer) clearTimeout(saveTimer);

    saveTimer = setTimeout(salvarNuvem, 1500);
  }

  // RECEBE E APLICA ALTERACOES DE OUTROS DISPOSITIVOS
  async function processarAtualizacaoRemota() {
    if (
      !usuarioId ||
      !carregamentoConcluido ||
      sincronizacaoBloqueada
    ) {
      return;
    }

    if (salvamentoEmAndamento || processandoEvento) {
      eventoPendente = true;
      return;
    }

    processandoEvento = true;

    try {
      const { data, error } = await sb
        .from('game_saves')
        .select('game_data, version')
        .eq('user_id', usuarioId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      const novaVersao = Number(data.version ?? 0);

      if (novaVersao <= versaoNuvem) return;

      // NAO SUBSTITUI ALTERACOES LOCAIS AINDA NAO SALVAS
      if (alteracoesPendentes || salvamentoEmAndamento) {
        bloquearPorConflito({
          motivo: 'Chegou uma atualização enquanto havia alterações locais pendentes.',
          versaoLocal: versaoNuvem,
          versaoRemota: novaVersao
        });
        return;
      }

      const progresso = data.game_data || {};

      const inventarioFinal = mesclarInventarios(
        progresso.inv,
        progresso.lojinhaPermanente
      );

      versaoNuvem = novaVersao;

      const chave = chaveInventario();

      if (chave) {
        localStorage.setItem(chave, JSON.stringify(inventarioFinal));
      }

      aplicarProgresso(progresso, inventarioFinal);

      const dadosCarregados = dadosDoJogo();

      localStorage.setItem(
        'save_' + currentUser,
        JSON.stringify(dadosCarregados)
      );

      alteracoesPendentes = false;

      console.log('ATUALIZACAO AUTOMATICA RECEBIDA:', {
        version: versaoNuvem,
        money,
        day,
        level,
        xpAtual: window.xpAtual,
        inv
      });

    } catch (erro) {
      console.error('Erro ao receber atualização remota:', erro);
    } finally {
      processandoEvento = false;

      if (eventoPendente) {
        eventoPendente = false;
        processarAtualizacaoRemota();
      }
    }
  }

  function configurarRealtime() {
    if (!usuarioId || !carregamentoConcluido) return;

    if (canalRealtime) {
      sb.removeChannel(canalRealtime);
      canalRealtime = null;
    }

    canalRealtime = sb
      .channel('game-saves-' + usuarioId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_saves',
          filter: 'user_id=eq.' + usuarioId
        },
        payload => {
          console.log('ALTERACAO DETECTADA NO SUPABASE:', payload);

          if (salvamentoEmAndamento) {
            eventoPendente = true;
            return;
          }

          processarAtualizacaoRemota();
        }
      )
      .subscribe(status => {
        console.log('STATUS REALTIME:', status);
      });
  }

  // INTERCEPTA O SALVAMENTO ORIGINAL
  const salvarJogoAnterior = window.saveGame;

  window.saveGame = function () {
    if (!currentUser) return;

    if (typeof salvarJogoAnterior === 'function') {
      salvarJogoAnterior.apply(this, arguments);
    }

    try {
      const dados = dadosDoJogo();

      localStorage.setItem(
        'save_' + currentUser,
        JSON.stringify(dados)
      );

      localStorage.setItem('currentUser', currentUser);

    } catch (erro) {
      console.error('Erro no salvamento local:', erro);
    }

    agendarSalvamentoNuvem();
  };

  // SINCRONIZA APOS COMPRAR ITEM
  if (typeof window.comprarItem === 'function') {
    const comprarItemAnterior = window.comprarItem;

    window.comprarItem = function () {
      const resultado = comprarItemAnterior.apply(this, arguments);
      agendarSalvamentoNuvem();
      return resultado;
    };
  }

  // CARREGAMENTO PRINCIPAL
  async function abrirJogo(usuario, nome) {
    usuarioId = usuario.id;
    nomeJogador = nome || usuario.email.split('@')[0];
    currentUser = nomeJogador;

    versaoNuvem = 0;
    sincronizacaoBloqueada = false;
    alteracoesPendentes = false;
    revisaoLocal = 0;
    avisoConflitoExibido = false;

    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    if (canalRealtime) {
      await sb.removeChannel(canalRealtime);
      canalRealtime = null;
    }

    carregamentoConcluido = false;
    salvamentoEmAndamento = false;

    localStorage.setItem('currentUser', currentUser);

    campoNome.value = nomeJogador;
    atualizarMenu();

    mensagem('Carregando seu progresso...');

    const { data, error } = await sb
      .from('game_saves')
      .select('game_data, version')
      .eq('user_id', usuarioId)
      .maybeSingle();

    if (error) {
      console.error(error);
      mensagem('Erro ao carregar seu progresso. Tente novamente.');
      return;
    }

    versaoNuvem = Number(data?.version ?? 0);

    const chave = chaveInventario();

    const inventarioLocal = chave
      ? converterInventario(localStorage.getItem(chave))
      : {};

    let saveLocal = {};

    try {
      saveLocal = JSON.parse(
        localStorage.getItem('save_' + currentUser) || '{}'
      );
    } catch (e) {
      saveLocal = {};
    }

    const inventarioSaveLocal = mesclarInventarios(
      saveLocal.inv,
      saveLocal.lojinhaPermanente
    );

    if (data?.game_data) {
      const progresso = data.game_data;

      const inventarioNuvem = mesclarInventarios(
        progresso.inv,
        progresso.lojinhaPermanente
      );

      const inventarioFinal = mesclarInventarios(
        inventarioNuvem,
        inventarioSaveLocal,
        inventarioLocal
      );

      if (chave) {
        localStorage.setItem(chave, JSON.stringify(inventarioFinal));
      }

      aplicarProgresso(progresso, inventarioFinal);

      const dadosCarregados = dadosDoJogo();

      localStorage.setItem(
        'save_' + currentUser,
        JSON.stringify(dadosCarregados)
      );

      if (typeof renderSlots === 'function') renderSlots();

    } else {
      if (saveLocal && Object.keys(saveLocal).length > 0) {
        const inventarioFinal = mesclarInventarios(
          inventarioSaveLocal,
          inventarioLocal
        );

        aplicarProgresso(saveLocal, inventarioFinal);
      } else {
        inv = mesclarInventarios(inventarioLocal, inventarioSaveLocal);

        // Sem save anterior, começa com XP zerado.
        window.xpAtual = 0;

        if (typeof novo === 'function') novo();
        if (typeof check === 'function') check();
      }

      if (chave) {
        localStorage.setItem(
          chave,
          JSON.stringify(obterInventarioAtual())
        );
      }
    }

    carregamentoConcluido = true;

    if (typeof window.atualizarBarraXP === 'function') {
      window.atualizarBarraXP();
    }

    modal.style.display = 'none';
    limparMensagem();

    configurarRealtime();

    console.log('JOGO CARREGADO:', {
      jogador: nomeJogador,
      money,
      day,
      level,
      xpAtual: window.xpAtual,
      version: versaoNuvem,
      inv
    });
  }

  // LOGIN
  window.fazerLogin = async function () {
    limparMensagem();

    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    if (!email || !email.includes('@')) {
      mensagem('Digite um e-mail válido.');
      return;
    }

    if (senha.length < 6) {
      mensagem('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    botaoLogin.disabled = true;
    botaoLogin.textContent = 'AGUARDE...';

    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password: senha
    });

    botaoLogin.disabled = false;
    botaoLogin.textContent = 'ENTRAR';

    if (error) {
      mensagem('Não foi possível entrar. Confira o e-mail e a senha.');
      console.error(error);
      return;
    }

    await abrirJogo(data.user, data.user.user_metadata?.username);
  };

  // CRIAR CONTA
  botaoCadastro.onclick = async function () {
    limparMensagem();

    const email = campoEmail.value.trim().toLowerCase();
    const nome = campoNome.value.trim();
    const senha = campoSenha.value;

    if (nome.length < 2) {
      mensagem('Digite um nome com pelo menos 2 caracteres.');
      return;
    }

    if (!email || !email.includes('@')) {
      mensagem('Digite um e-mail válido.');
      return;
    }

    if (senha.length < 6) {
      mensagem('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    botaoCadastro.disabled = true;
    botaoCadastro.textContent = 'CRIANDO...';

    const { data, error } = await sb.auth.signUp({
      email,
      password: senha,
      options: {
        data: { username: nome },
        emailRedirectTo: location.origin + location.pathname
      }
    });

    botaoCadastro.disabled = false;
    botaoCadastro.textContent = 'CRIAR CONTA';

    if (error) {
      mensagem('Erro ao criar conta: ' + error.message);
      console.error(error);
      return;
    }

    if (data.session) {
      await abrirJogo(data.user, nome);
    } else {
      mensagem(
        'Conta criada! Confira seu e-mail e clique no link de confirmação para entrar.'
      );
    }
  };

  // SAIR
  window.logout = async function () {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    await salvarNuvem();

    if (canalRealtime) {
      await sb.removeChannel(canalRealtime);
      canalRealtime = null;
    }

    await sb.auth.signOut();

    usuarioId = null;
    nomeJogador = null;
    carregamentoConcluido = false;
    currentUser = null;
    versaoNuvem = 0;
    sincronizacaoBloqueada = false;
    alteracoesPendentes = false;

    localStorage.removeItem('currentUser');

    modal.style.display = 'flex';
    campoSenha.value = '';
    campoEmail.value = '';

    atualizarMenu();

    if (typeof closeMenu === 'function') closeMenu();
  };

  // IGNORA LOGIN ANTIGO
  currentUser = null;
  localStorage.removeItem('currentUser');
  modal.style.display = 'flex';

  // VERIFICA SESSAO
  const { data: sessao, error: erroSessao } =
    await sb.auth.getSession();

  if (erroSessao) {
    console.error(erroSessao);
    mensagem('Não foi possível verificar sua sessão. Atualize a página.');
    return;
  }

  if (sessao.session) {
    const usuario = sessao.session.user;

    await abrirJogo(
      usuario,
      usuario.user_metadata?.username
    );
  } else {
    console.log('Aguardando login do jogador.');
  }

  sb.auth.onAuthStateChange((evento) => {
    if (evento === 'SIGNED_OUT') {
      usuarioId = null;
      nomeJogador = null;
      carregamentoConcluido = false;
      currentUser = null;
      versaoNuvem = 0;
      sincronizacaoBloqueada = false;
      alteracoesPendentes = false;

      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }

      if (canalRealtime) {
        sb.removeChannel(canalRealtime);
        canalRealtime = null;
      }

      modal.style.display = 'flex';
    }
  });

})();
