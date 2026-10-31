// SUPABASE: LOGIN E SINCRONIZACAO COMPLETA
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

  const modal = document.getElementById('loginModal');
  const campoNome = document.getElementById('loginUser');
  const campoSenha = document.getElementById('loginPass');
  const botaoLogin = modal.querySelector('.btn.amarelo');

  const IDs_LOJINHA = [
    'bone',
    'cordao',
    'relogio',
    'glock',
    'pit',
    'moto'
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

    if (typeof dados !== 'object' || dados === null) {
      return {};
    }

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
    return currentUser
      ? 'lojinha_permanente_' + currentUser
      : null;
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
    const el = document.getElementById('loginErro');
    el.style.display = 'none';
  }

  function atualizarMenu() {
    document.getElementById('menuUser').innerText =
      nomeJogador || '-';
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

  let botaoCadastro =
    document.getElementById('botaoCadastroSupabase');

  if (!botaoCadastro) {
    botaoCadastro = document.createElement('button');
    botaoCadastro.id = 'botaoCadastroSupabase';
    botaoCadastro.className = 'btn preto';
    botaoCadastro.textContent = 'CRIAR CONTA';
    botaoCadastro.style.cssText = 'width:100%;margin-top:8px';
    botaoLogin.insertAdjacentElement('afterend', botaoCadastro);
  }

  // MONTA OS DADOS ATUAIS DO JOGO
  function dadosDoJogo() {
    const inventario = obterInventarioAtual();

    return {
      day,
      money,
      fame,
      level,
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

  // APLICA DIRETAMENTE O PROGRESSO RECEBIDO DA NUVEM
  function aplicarProgresso(progresso, inventarioFinal) {
    day = progresso.day ?? 1;
    money = progresso.money ?? 500;
    fame = progresso.fame ?? 1;
    level = progresso.level ?? 1;
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

    // Atualiza a interface sem chamar carregarSave() ou novo().
    if (typeof renderSlots === 'function') {
      renderSlots();
    }

    if (typeof atualizarTituloAvatar === 'function') {
      atualizarTituloAvatar();
    }

    if (typeof check === 'function') {
      check();
    }

    console.log('PROGRESSO APLICADO DIRETAMENTE:', {
      day,
      money,
      level,
      fame,
      dolar,
      inv
    });
  }

  // SALVAR NA NUVEM
  async function salvarNuvem() {
    if (
      !usuarioId ||
      !carregamentoConcluido ||
      salvamentoEmAndamento
    ) {
      return;
    }

    salvamentoEmAndamento = true;

    try {
      const { data: registro, error: erroLeitura } = await sb
        .from('game_saves')
        .select('game_data')
        .eq('user_id', usuarioId)
        .maybeSingle();

      if (erroLeitura) throw erroLeitura;

      // Confere se o usuário continua sendo o mesmo.
      if (!usuarioId || !currentUser) return;

      const dadosAtuais = dadosDoJogo();
      const dadosNuvem = registro?.game_data || {};

      // Protege os itens permanentes.
      const inventarioFinal = mesclarInventarios(
        dadosNuvem.inv,
        dadosNuvem.lojinhaPermanente,
        dadosAtuais.inv,
        dadosAtuais.lojinhaPermanente
      );

      inv = inventarioFinal;

      const chave = chaveInventario();

      if (chave) {
        localStorage.setItem(
          chave,
          JSON.stringify(inventarioFinal)
        );
      }

      dadosAtuais.inv = inventarioFinal;
      dadosAtuais.lojinhaPermanente = inventarioFinal;

      const { error } = await sb
        .from('game_saves')
        .upsert({
          user_id: usuarioId,
          game_data: dadosAtuais,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      localStorage.setItem(
        'save_' + nomeJogador,
        JSON.stringify(dadosAtuais)
      );

      console.log('SALVAMENTO NA NUVEM CONCLUÍDO:', {
        money: dadosAtuais.money,
        day: dadosAtuais.day,
        level: dadosAtuais.level,
        inventario: inventarioFinal
      });

    } catch (erro) {
      console.error('Erro ao salvar na nuvem:', erro);
    } finally {
      salvamentoEmAndamento = false;
    }
  }

  function agendarSalvamentoNuvem() {
    if (!usuarioId || !carregamentoConcluido) return;

    if (saveTimer) clearTimeout(saveTimer);

    saveTimer = setTimeout(salvarNuvem, 1500);
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

  // SINCRONIZA APÓS COMPRAR ITEM
  if (typeof window.comprarItem === 'function') {
    const comprarItemAnterior = window.comprarItem;

    window.comprarItem = function () {
      const resultado = comprarItemAnterior.apply(
        this,
        arguments
      );

      agendarSalvamentoNuvem();

      return resultado;
    };
  }

  // CARREGAMENTO PRINCIPAL
  async function abrirJogo(usuario, nome) {
    usuarioId = usuario.id;
    nomeJogador = nome || usuario.email.split('@')[0];
    currentUser = nomeJogador;

    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    carregamentoConcluido = false;
    salvamentoEmAndamento = false;

    localStorage.setItem('currentUser', currentUser);

    campoNome.value = nomeJogador;
    atualizarMenu();

    mensagem('Carregando seu progresso...');

    const { data, error } = await sb
      .from('game_saves')
      .select('game_data')
      .eq('user_id', usuarioId)
      .maybeSingle();

    if (error) {
      console.error(error);
      mensagem('Erro ao carregar seu progresso. Tente novamente.');
      return;
    }

    const chave = chaveInventario();

    // LÊ O INVENTÁRIO LOCAL SEM USÁ-LO PARA SUBSTITUIR O PROGRESSO.
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
      // A NUVEM É A FONTE DO PROGRESSO.
      const progresso = data.game_data;

      const inventarioNuvem = mesclarInventarios(
        progresso.inv,
        progresso.lojinhaPermanente
      );

      // Mescla somente o inventário permanente.
      const inventarioFinal = mesclarInventarios(
        inventarioNuvem,
        inventarioSaveLocal,
        inventarioLocal
      );

      if (chave) {
        localStorage.setItem(
          chave,
          JSON.stringify(inventarioFinal)
        );
      }

      // NÃO CHAMA carregarSave() AQUI.
      // Aplica os valores remotos diretamente.
      aplicarProgresso(progresso, inventarioFinal);

      // Grava localmente exatamente o progresso carregado.
      const dadosCarregados = dadosDoJogo();

      localStorage.setItem(
        'save_' + currentUser,
        JSON.stringify(dadosCarregados)
      );

      if (typeof renderSlots === 'function') {
        renderSlots();
      }

    } else {
      // CONTA SEM PROGRESSO NA NUVEM.
      // Nesse caso, aproveita o save local, se existir.
      if (saveLocal && Object.keys(saveLocal).length > 0) {
        const inventarioFinal = mesclarInventarios(
          inventarioSaveLocal,
          inventarioLocal
        );

        aplicarProgresso(saveLocal, inventarioFinal);
      } else {
        inv = mesclarInventarios(
          inventarioLocal,
          inventarioSaveLocal
        );

        if (typeof novo === 'function') {
          novo();
        }

        if (typeof check === 'function') {
          check();
        }
      }

      if (chave) {
        localStorage.setItem(
          chave,
          JSON.stringify(obterInventarioAtual())
        );
      }
    }

    // SÓ LIBERA O SALVAMENTO DEPOIS DE TERMINAR O CARREGAMENTO.
    carregamentoConcluido = true;

    modal.style.display = 'none';
    limparMensagem();

    console.log('JOGO CARREGADO:', {
      jogador: nomeJogador,
      money,
      day,
      level,
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

    await abrirJogo(
      data.user,
      data.user.user_metadata?.username
    );
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

    await sb.auth.signOut();

    usuarioId = null;
    nomeJogador = null;
    carregamentoConcluido = false;
    currentUser = null;

    localStorage.removeItem('currentUser');

    modal.style.display = 'flex';
    campoSenha.value = '';
    campoEmail.value = '';

    atualizarMenu();

    if (typeof closeMenu === 'function') {
      closeMenu();
    }
  };

  // IGNORA LOGIN ANTIGO
  currentUser = null;
  localStorage.removeItem('currentUser');
  modal.style.display = 'flex';

  // VERIFICA SESSÃO
  const { data: sessao, error: erroSessao } =
    await sb.auth.getSession();

  if (erroSessao) {
    console.error(erroSessao);
    mensagem(
      'Não foi possível verificar sua sessão. Atualize a página.'
    );
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
      modal.style.display = 'flex';
    }
  });

})();
