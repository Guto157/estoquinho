// SUPABASE: LOGIN E SALVAMENTO NA NUVEM
(async function () {
  const SUPABASE_URL = 'https://zhcckqekuzatugimezlk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Bd-vtxSYz23BH0L8k744SA_9t12A4dv';

  // Carrega a biblioteca do Supabase
  function carregarBiblioteca() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) return resolve();

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Não foi possível carregar o Supabase.'));
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

  // Adiciona o campo de e-mail sem precisar alterar o index.html
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
  campoSenha.autocomplete = 'current-password';
  botaoLogin.textContent = 'ENTRAR';

  // Botão separado para criar conta
  let botaoCadastro = document.getElementById('botaoCadastroSupabase');

  if (!botaoCadastro) {
    botaoCadastro = document.createElement('button');
    botaoCadastro.id = 'botaoCadastroSupabase';
    botaoCadastro.className = 'btn preto';
    botaoCadastro.textContent = 'CRIAR CONTA';
    botaoCadastro.style.cssText = 'width:100%;margin-top:8px';
    botaoLogin.insertAdjacentElement('afterend', botaoCadastro);
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
    document.getElementById('menuUser').innerText = nomeJogador || '-';
  }

  function dadosDoJogo() {
    return {
      day, money, fame, level, dolar, inv, usado,
      totalEmp, totalLucro, jurosCount, negarCount,
      conquistasColetadas, tituloEscolhido,
      proxMissaoIdx, proxDesafioIdx,
      ativasMissoes, ativasDesafios
    };
  }

  function aplicarDados(dados) {
    if (!dados) return;

    try {
      if (dados.day !== undefined) day = dados.day;
      if (dados.money !== undefined) money = dados.money;
      if (dados.fame !== undefined) fame = dados.fame;
      if (dados.level !== undefined) level = dados.level;
      if (dados.dolar !== undefined) dolar = dados.dolar;
      if (dados.inv !== undefined) inv = dados.inv;
      if (dados.usado !== undefined) usado = dados.usado;
      if (dados.totalEmp !== undefined) totalEmp = dados.totalEmp;
      if (dados.totalLucro !== undefined) totalLucro = dados.totalLucro;
      if (dados.jurosCount !== undefined) jurosCount = dados.jurosCount;
      if (dados.negarCount !== undefined) negarCount = dados.negarCount;
      if (dados.conquistasColetadas !== undefined) conquistasColetadas = dados.conquistasColetadas;
      if (dados.tituloEscolhido !== undefined) tituloEscolhido = dados.tituloEscolhido;
      if (dados.proxMissaoIdx !== undefined) proxMissaoIdx = dados.proxMissaoIdx;
      if (dados.proxDesafioIdx !== undefined) proxDesafioIdx = dados.proxDesafioIdx;
      if (dados.ativasMissoes !== undefined) ativasMissoes = dados.ativasMissoes;
      if (dados.ativasDesafios !== undefined) ativasDesafios = dados.ativasDesafios;
    } catch (erro) {
      console.error('Erro ao aplicar o progresso:', erro);
    }

    try {
      if (typeof renderSlots === 'function') renderSlots();
      if (typeof atualizarTituloAvatar === 'function') atualizarTituloAvatar();
      if (typeof novo === 'function') novo();
      if (typeof check === 'function') check();
    } catch (erro) {
      console.error('Erro ao atualizar a tela:', erro);
    }
  }

  async function salvarNuvem() {
    if (!usuarioId || !carregamentoConcluido) return;

    try {
      const dados = dadosDoJogo();

      const { error } = await sb
        .from('game_saves')
        .upsert({
          user_id: usuarioId,
          game_data: dados,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      localStorage.setItem('save_' + nomeJogador, JSON.stringify(dados));
      console.log('Progresso sincronizado com a nuvem.');
    } catch (erro) {
      console.error('Erro ao salvar na nuvem:', erro);
    }
  }

  // Substitui o salvamento local por salvamento local + nuvem
  window.saveGame = function () {
    if (!currentUser) return;

    try {
      const dados = dadosDoJogo();
      localStorage.setItem('save_' + currentUser, JSON.stringify(dados));
      localStorage.setItem('currentUser', currentUser);
    } catch (erro) {
      console.error('Erro no salvamento local:', erro);
    }

    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(salvarNuvem, 1500);
  };

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

    if (data?.game_data) {
      localStorage.setItem('save_' + currentUser, JSON.stringify(data.game_data));
      aplicarDados(data.game_data);
    } else {
      // Conta nova: começa com o progresso inicial do jogo
      if (typeof novo === 'function') novo();
      if (typeof check === 'function') check();
    }

    carregamentoConcluido = true;
    modal.style.display = 'none';
    limparMensagem();

    // Salva imediatamente a primeira partida da conta nova
    if (!data?.game_data) await salvarNuvem();

    console.log('Jogador conectado:', nomeJogador);
  }

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
      mensagem('Conta criada! Confira seu e-mail e clique no link de confirmação para entrar.');
    }
  };

  // Sai também da conta do Supabase
  window.logout = async function () {
    if (saveTimer) clearTimeout(saveTimer);
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

    if (typeof closeMenu === 'function') closeMenu();
  };

  // Impede que uma sessão antiga do login local seja aceita
  currentUser = null;
  localStorage.removeItem('currentUser');
  modal.style.display = 'flex';

  // Verifica se já existe uma sessão válida no Supabase
  const { data: sessao, error: erroSessao } = await sb.auth.getSession();

  if (erroSessao) {
    console.error(erroSessao);
    mensagem('Não foi possível verificar sua sessão. Atualize a página.');
    return;
  }

  if (sessao.session) {
    const usuario = sessao.session.user;
    await abrirJogo(usuario, usuario.user_metadata?.username);
  } else {
    console.log('Aguardando login do jogador.');
  }

  sb.auth.onAuthStateChange((evento, sessaoAtual) => {
    if (evento === 'SIGNED_OUT') {
      usuarioId = null;
      nomeJogador = null;
      carregamentoConcluido = false;
      currentUser = null;
      modal.style.display = 'flex';
    }
  });
})();
