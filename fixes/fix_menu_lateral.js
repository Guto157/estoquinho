
// ============================================
// FIX MENU LATERAL + CONFIGURACOES DE AUDIO
// PEGA 1 PAGA 2
// Mantem o botao X e adiciona musica e efeitos
// Todos os sons sao sintetizados pelo proprio jogo.
// ============================================

(function () {
  if (window.fixMenuAudioAtivo) return;
  window.fixMenuAudioAtivo = true;

  // ============================================
  // 1. BOTAO X PARA FECHAR TELAS E MODAIS
  // ============================================

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
      position:absolute;
      top:8px;
      right:8px;
      width:36px;
      height:36px;
      padding:0;
      border:2px solid #111;
      border-radius:9px;
      background:#FF5252;
      color:white;
      font-size:28px;
      font-weight:900;
      line-height:1;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      z-index:9999;
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

  // ============================================
  // 2. CONFIGURACOES SALVAS
  // ============================================

  const CHAVE = 'pega1paga2_audio_config';

  let configPadrao = {
    musicaAtiva: true,
    efeitosAtivos: true,
    volumeMusica: 12,
    volumeEfeitos: 35
  };

  let config = Object.assign({}, configPadrao);

  try {
    const salva = JSON.parse(localStorage.getItem(CHAVE) || '{}');
    config = Object.assign(config, salva);
  } catch (e) {}

  function salvarConfig() {
    localStorage.setItem(CHAVE, JSON.stringify(config));
  }

  // ============================================
  // 3. MOTOR DE AUDIO ORIGINAL
  // ============================================

  let audioCtx = null;
  let masterMusica = null;
  let masterEfeitos = null;
  let musicaTimer = null;
  let notaAtual = 0;
  let sireneAtiva = false;

  function iniciarAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    if (!audioCtx) {
      audioCtx = new AudioContext();

      masterMusica = audioCtx.createGain();
      masterEfeitos = audioCtx.createGain();

      masterMusica.connect(audioCtx.destination);
      masterEfeitos.connect(audioCtx.destination);

      atualizarVolumes();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    iniciarMusica();
    return true;
  }

  function atualizarVolumes() {
    if (!audioCtx) return;

    masterMusica.gain.setTargetAtTime(
      config.musicaAtiva ? config.volumeMusica / 100 : 0,
      audioCtx.currentTime,
      0.08
    );

    masterEfeitos.gain.setTargetAtTime(
      config.efeitosAtivos ? config.volumeEfeitos / 100 : 0,
      audioCtx.currentTime,
      0.04
    );
  }

  function tom(frequencia, duracao, tipo, volume, destino, inicio) {
    if (!audioCtx || !destino) return;

    const agora = inicio || audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const ganho = audioCtx.createGain();

    osc.type = tipo || 'sine';
    osc.frequency.setValueAtTime(frequencia, agora);

    ganho.gain.setValueAtTime(0.0001, agora);
    ganho.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, volume),
      agora + 0.04
    );
    ganho.gain.exponentialRampToValueAtTime(
      0.0001,
      agora + duracao
    );

    osc.connect(ganho);
    ganho.connect(destino);

    osc.start(agora);
    osc.stop(agora + duracao + 0.03);
  }

  // ============================================
  // 4. MUSICA AMBIENTE ORIGINAL
  // Instrumental sintetizado, discreto e continuo
  // ============================================

  const acordes = [
    [130.81, 164.81, 196.00],
    [110.00, 130.81, 164.81],
    [146.83, 174.61, 220.00],
    [98.00, 123.47, 146.83]
  ];

  function tocarAcorde() {
    if (!audioCtx || !config.musicaAtiva) return;

    const notas = acordes[notaAtual % acordes.length];
    const inicio = audioCtx.currentTime + 0.05;

    notas.forEach((n, i) => {
      tom(n, 3.7, 'sine', 0.12, masterMusica, inicio + i * 0.035);
    });

    // Melodia suave
    const melodia = [261.63, 293.66, 329.63, 392.00, 329.63, 293.66];
    const m = melodia[notaAtual % melodia.length];

    tom(m, 1.1, 'triangle', 0.045, masterMusica, inicio + 0.2);

    notaAtual++;
  }

  function iniciarMusica() {
    if (musicaTimer) return;
    if (!config.musicaAtiva) return;

    tocarAcorde();

    musicaTimer = setInterval(function () {
      if (config.musicaAtiva) tocarAcorde();
    }, 3200);
  }

  function pararMusica() {
    if (musicaTimer) {
      clearInterval(musicaTimer);
      musicaTimer = null;
    }
  }

  // ============================================
  // 5. EFEITOS SONOROS DE INTERACAO
  // ============================================

  function somClique() {
    if (!iniciarAudio() || !config.efeitosAtivos) return;
    const t = audioCtx.currentTime;
    tom(650, 0.08, 'sine', 0.22, masterEfeitos, t);
    tom(880, 0.07, 'sine', 0.12, masterEfeitos, t + 0.045);
  }

  function somConfirmacao() {
    if (!iniciarAudio() || !config.efeitosAtivos) return;
    const t = audioCtx.currentTime;
    tom(523.25, 0.13, 'triangle', 0.25, masterEfeitos, t);
    tom(659.25, 0.16, 'triangle', 0.25, masterEfeitos, t + 0.11);
    tom(783.99, 0.2, 'triangle', 0.22, masterEfeitos, t + 0.22);
  }

  function somErro() {
    if (!iniciarAudio() || !config.efeitosAtivos) return;
    const t = audioCtx.currentTime;
    tom(240, 0.18, 'sawtooth', 0.16, masterEfeitos, t);
    tom(180, 0.22, 'sawtooth', 0.13, masterEfeitos, t + 0.13);
  }

  // ============================================
  // 6. SIRENE POLICIAL ORIGINAL
  // ============================================

  function tocarSirene() {
    if (!iniciarAudio() || !config.efeitosAtivos) return;
    if (sireneAtiva) return;

    sireneAtiva = true;

    const inicio = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const ganho = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, inicio);
    osc.frequency.linearRampToValueAtTime(1050, inicio + 0.45);
    osc.frequency.linearRampToValueAtTime(650, inicio + 0.9);
    osc.frequency.linearRampToValueAtTime(1050, inicio + 1.35);
    osc.frequency.linearRampToValueAtTime(650, inicio + 1.8);
    osc.frequency.linearRampToValueAtTime(1050, inicio + 2.25);
    osc.frequency.linearRampToValueAtTime(650, inicio + 2.8);

    ganho.gain.setValueAtTime(0.0001, inicio);
    ganho.gain.linearRampToValueAtTime(0.28, inicio + 0.08);
    ganho.gain.setValueAtTime(0.28, inicio + 2.7);
    ganho.gain.linearRampToValueAtTime(0.0001, inicio + 3);

    osc.connect(ganho);
    ganho.connect(masterEfeitos);

    osc.start(inicio);
    osc.stop(inicio + 3.05);

    setTimeout(function () {
      sireneAtiva = false;
    }, 3100);
  }

  // Conecta o som à sirene visual que já existe no fix_home.js.
  if (typeof window.alertaPolicia === 'function') {
    const alertaOriginal = window.alertaPolicia;

    window.alertaPolicia = function () {
      alertaOriginal.apply(this, arguments);
      tocarSirene();
    };
  }

  // ============================================
  // 7. TELA DE CONFIGURACOES
  // ============================================

  function criarTelaConfiguracoes() {
    if (document.getElementById('configAudioModal')) return;

    const modal = document.createElement('div');
    modal.id = 'configAudioModal';
    modal.className = 'modal';
    modal.style.zIndex = '300';

    modal.innerHTML = `
      <div class="box" style="position:relative">
        <h2 style="background:#111;color:#FFD600;padding:12px;border-radius:10px;margin-bottom:12px">
          ⚙️ CONFIGURAÇÕES
        </h2>

        <div class="card">
          <b>🎵 MÚSICA AMBIENTE</b>
          <p style="font-size:11px;margin:6px 0">Trilha instrumental de fundo.</p>

          <label style="display:flex;align-items:center;gap:8px;margin:10px 0">
            <input id="cfgMusicaAtiva" type="checkbox" style="width:20px;height:20px">
            <b>Ativar música</b>
          </label>

          <label for="cfgVolumeMusica" style="font-size:11px;font-weight:800">
            Volume da música: <span id="cfgValorMusica">12%</span>
          </label>
          <input id="cfgVolumeMusica" type="range" min="0" max="100" value="12" style="width:100%;margin:8px 0">
        </div>

        <div class="card">
          <b>🔊 EFEITOS SONOROS</b>
          <p style="font-size:11px;margin:6px 0">Cliques, confirmações, animações e sirene policial.</p>

          <label style="display:flex;align-items:center;gap:8px;margin:10px 0">
            <input id="cfgEfeitosAtivos" type="checkbox" style="width:20px;height:20px">
            <b>Ativar efeitos</b>
          </label>

          <label for="cfgVolumeEfeitos" style="font-size:11px;font-weight:800">
            Volume dos efeitos: <span id="cfgValorEfeitos">35%</span>
          </label>
          <input id="cfgVolumeEfeitos" type="range" min="0" max="100" value="35" style="width:100%;margin:8px 0">
        </div>

        <button id="cfgTestarSom" class="btn azul" type="button">
          🔔 TESTAR SOM
        </button>

        <button id="cfgSalvar" class="btn verde" type="button" style="margin-top:7px">
          💾 SALVAR CONFIGURAÇÕES
        </button>

        <button id="cfgFechar" class="btn preto" type="button" style="margin-top:7px">
          FECHAR
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const musica = modal.querySelector('#cfgMusicaAtiva');
    const efeitos = modal.querySelector('#cfgEfeitosAtivos');
    const volMusica = modal.querySelector('#cfgVolumeMusica');
    const volEfeitos = modal.querySelector('#cfgVolumeEfeitos');

    function atualizarTela() {
      musica.checked = config.musicaAtiva;
      efeitos.checked = config.efeitosAtivos;
      volMusica.value = config.volumeMusica;
      volEfeitos.value = config.volumeEfeitos;

      modal.querySelector('#cfgValorMusica').textContent = volMusica.value + '%';
      modal.querySelector('#cfgValorEfeitos').textContent = volEfeitos.value + '%';
    }

    function lerTela() {
      config.musicaAtiva = musica.checked;
      config.efeitosAtivos = efeitos.checked;
      config.volumeMusica = Number(volMusica.value);
      config.volumeEfeitos = Number(volEfeitos.value);

      modal.querySelector('#cfgValorMusica').textContent = volMusica.value + '%';
      modal.querySelector('#cfgValorEfeitos').textContent = volEfeitos.value + '%';

      atualizarVolumes();

      if (config.musicaAtiva) iniciarMusica();
      else pararMusica();
    }

    [musica, efeitos, volMusica, volEfeitos].forEach(el => {
      el.addEventListener('input', lerTela);
      el.addEventListener('change', lerTela);
    });

    modal.querySelector('#cfgTestarSom').addEventListener('click', function () {
      iniciarAudio();
      somConfirmacao();
    });

    modal.querySelector('#cfgSalvar').addEventListener('click', function () {
      lerTela();
      salvarConfig();
      somConfirmacao();
      modal.style.display = 'none';
    });

    modal.querySelector('#cfgFechar').addEventListener('click', function () {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });

    atualizarTela();
  }

  window.abrirConfiguracoesAudio = function () {
    criarTelaConfiguracoes();
    const modal = document.getElementById('configAudioModal');

    modal.querySelector('#cfgMusicaAtiva').checked = config.musicaAtiva;
    modal.querySelector('#cfgEfeitosAtivos').checked = config.efeitosAtivos;
    modal.querySelector('#cfgVolumeMusica').value = config.volumeMusica;
    modal.querySelector('#cfgVolumeEfeitos').value = config.volumeEfeitos;
    modal.querySelector('#cfgValorMusica').textContent = config.volumeMusica + '%';
    modal.querySelector('#cfgValorEfeitos').textContent = config.volumeEfeitos + '%';

    modal.style.display = 'flex';
    iniciarAudio();
  };

  // ============================================
  // 8. BOTAO DE ENGRANAGEM NO MENU LATERAL
  // ============================================

  function adicionarBotaoConfiguracoes() {
    const drawer = document.querySelector('#menuDrawer .drawer');
    if (!drawer) return;

    if (document.getElementById('btnConfiguracoesAudio')) return;

    const botao = document.createElement('div');
    botao.id = 'btnConfiguracoesAudio';
    botao.className = 'menuItem';
    botao.innerHTML = '<span>⚙️ CONFIGURAÇÕES</span><span>🔊</span>';

    botao.addEventListener('click', function () {
      if (typeof window.closeMenu === 'function') window.closeMenu();
      window.abrirConfiguracoesAudio();
    });

    const botaoFechar = Array.from(drawer.querySelectorAll('button, .btn'))
      .find(el => /fechar/i.test(el.textContent));

    if (botaoFechar) drawer.insertBefore(botao, botaoFechar);
    else drawer.appendChild(botao);
  }

  // ============================================
  // 9. SONS NOS BOTOES E INTERACOES
  // ============================================

  document.addEventListener('click', function (e) {
    const alvo = e.target.closest('button, .menuItem, .slot');

    if (!alvo) return;
    if (alvo.id === 'cfgSalvar' || alvo.id === 'cfgTestarSom') return;
    if (alvo.id === 'cfgFechar') return;
    if (alvo.id === 'btnConfiguracoesAudio') return;

    iniciarAudio();

    if (
      /NEGAR|FECHAR|SAIR|CANCELAR|ERRO/i.test(alvo.textContent)
    ) {
      somErro();
    } else {
      somClique();
    }
  }, true);

  // ============================================
  // 10. INICIALIZACAO
  // ============================================

  function iniciar() {
    verificarTelas();
    adicionarBotaoConfiguracoes();
    criarTelaConfiguracoes();

    const observador = new MutationObserver(function () {
      verificarTelas();
      adicionarBotaoConfiguracoes();
    });

    observador.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // O navegador libera o audio apos a primeira interacao.
    document.addEventListener('pointerdown', function primeiraInteracao() {
      iniciarAudio();
    }, { once: true });

    document.addEventListener('keydown', function primeiraTecla() {
      iniciarAudio();
    }, { once: true });

    console.log('FIX MENU + CONFIGURACOES DE AUDIO carregado.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})();
