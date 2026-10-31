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

  const modal = document.getElementById('loginModal');
  const campoNome = document.getElementById('loginUser');
  const campoSenha = document.getElementById('loginPass');
  const botaoLogin = modal.querySelector('.btn.amarelo');

  // ITENS PERMANENTES DA LOJINHA
  const IDs_LOJINHA = [
    'bone',
    'cordao',
    'relogio',
    'glock',
    'pit',
    'moto'
  ];

  // CONVERTE O INVENTÁRIO PARA OBJETO
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

  // JUNTA INVENTÁRIOS SEM PERDER NÍVEIS
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
    if (!currentUser) return null;
    return 'lojinha_permanente_' + currentUser;
  }

  // RECUPERA E JUNTA INVENTÁRIO ATUAL E LOCAL
  function obterInventarioAtual() {
    const chave = chaveInventario();

    let inventarioLocal = {};

    if (chave) {
      inventarioLocal = converterInventario(
        localStorage.getItem(chave)
      );
    }

    const inventario = mesclarInventarios(
      inv,
      inventarioLocal
    );

    inv = inventario;

    if (chave) {
      localStorage.setItem(
        chave,
        JSON.stringify(inventario)
      );
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
    botaoCadastro.style.cssText =
      'width:100%;margin-top:8px';

    botaoLogin.insertAdjacentElement(
      'afterend',
      botaoCadastro
    );
  }

  // DADOS DO JOGO
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

      // Agora fica salvo como objeto, não como texto.
      lojinhaPermanente: inventario
    };
  }

  // SALVAR NA NUVEM SEM APAGAR ITENS EXISTENTES
  async function salvarNuvem() {
    if (!usuarioId || !carregamentoConcluido) return;

    try {
      const { data: registro, error: erroLeitura } = await sb
        .from('game_saves')
        .select('game_data')
        .eq('user_id', usuarioId)
        .maybeSingle();

      if (erroLeitura) throw erroLeitura;

      const dadosAtuais = dadosDoJogo();
      const dadosNuvem = registro?.game_data || {};

      // Junta o inventário do dispositivo com o da nuvem.
      const inventarioFinal = mesclarInventarios(
        dadosNuvem.inv,
        dadosNuvem.lojinhaPermanente,
        dadosAtuais.inv,
        dadosAtuais.lojinhaPermanente
      );

      // Atualiza o inventário global e o armazenamento local.
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

      if (typeof renderSlots === 'function') {
        renderSlots();
      }

      console.log(
        'PROGRESSO SINCRONIZADO. INVENTÁRIO PRESERVADO:',
        inventarioFinal
      );

    } catch (erro) {
      console.error('Erro ao salvar na nuvem:', erro);
    }
  }

  function agendarSalvamentoNuvem() {
    if (!usuarioId || !carregamentoConcluido) return;

    if (saveTimer) clearTimeout(saveTimer);

    saveTimer = setTimeout(salvarNuvem, 1500);
  }

  // SALVAMENTO LOCAL E NA NUVEM
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

  // SINCRONIZAÇÃO APÓS COMPRAR ITEM
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

  // ABRIR JOGO
  async function abrirJogo(usuario, nome) {
    usuarioId = usuario.id;
    nomeJogador = nome || usuario.email.split('@')[0];
    currentUser = nomeJogador;

    localStorage.setItem('currentUser', currentUser);

    campoNome.value = nomeJogador;
    atualizarMenu();

    carregamentoConcluido = false;
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

    // INVENTÁRIO QUE JÁ EXISTE NESTE DISPOSITIVO
    const inventarioLocal = chave
      ? converterInventario(localStorage.getItem(chave))
      : {};

    // INVENTÁRIO QUE JÁ EXISTE NO SAVE LOCAL
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

      // INVENTÁRIO DA NUVEM
      const inventarioNuvem = mesclarInventarios(
        progresso.inv,
        progresso.lojinhaPermanente
      );

      // JUNTA OS TRÊS INVENTÁRIOS
      const inventarioFinal = mesclarInventarios(
        inventarioNuvem,
        inventarioSaveLocal,
        inventarioLocal,
        inv
      );

      inv = inventarioFinal;

      if (chave) {
        localStorage.setItem(
          chave,
          JSON.stringify(inventarioFinal)
        );
      }

      // Corrige os dados antes de carregar o save.
      progresso.inv = inventarioFinal;
      progresso.lojinhaPermanente = inventarioFinal;

      localStorage.setItem(
        'save_' + currentUser,
        JSON.stringify(progresso)
      );

      if (typeof carregarSave === 'function') {
        carregarSave();
      }

      // Garante que o carregamento não apagou os itens.
      inv = mesclarInventarios(
        inv,
        inventarioFinal,
        obterInventarioAtual()
      );

      if (chave) {
        localStorage.setItem(
          chave,
          JSON.stringify(inv)
        );
      }

      if (typeof renderSlots === 'function') {
        renderSlots();
      }

      console.log(
        'INVENTÁRIO CARREGADO:',
        inv
      );

    } else {
      // CONTA SEM SAVE NA NUVEM
      inv = mesclarInventarios(
        inventarioSaveLocal,
        inventarioLocal,
        inv
      );

      if (chave) {
        localStorage.setItem(
          chave,
          JSON.stringify(inv)
        );
      }

      if (typeof novo === 'function') novo();
      if (typeof check === 'function') check();
    }

    carregamentoConcluido = true;

    modal.style.display = 'none';
    limparMensagem();

    // Envia o progresso inicial ou o inventário recuperado.
    await salvarNuvem();

    console.log('Jogador conectado:', nomeJogador);
  }

  // ENTRAR
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

  // VERIFICA SESSÃO EXISTENTE
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
