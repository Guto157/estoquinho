
(function () {
  if (window.fixDesafios500Ativo) return;
  window.fixDesafios500Ativo = true;

  console.log("FIX DESAFIOS 500 - CORRIGIDO");

  const categorias = [
    {
      tipo: "caixa",
      nome: "Caixa",
      descricao: m => `Mantenha R$${m} no caixa`,
      base: [5000,10000,20000,40000,80000,120000,180000,250000,350000,500000]
    },
    {
      tipo: "totalEmp",
      nome: "Empréstimos",
      descricao: m => `Conclua ${m} empréstimos`,
      base: [5,10,20,35,50,75,100,150,200,300]
    },
    {
      tipo: "lucroTotal",
      nome: "Lucros",
      descricao: m => `Acumule R$${m} de lucro`,
      base: [1000,2500,5000,10000,20000,35000,50000,75000,100000,150000]
    },
    {
      tipo: "jurosTotal",
      nome: "Juros",
      descricao: m => `Cobre juros ${m} vezes`,
      base: [3,5,10,15,20,30,40,60,80,100]
    },
    {
      tipo: "negar",
      nome: "Decisões",
      descricao: m => `Negue ${m} empréstimos`,
      base: [3,5,10,15,20,30,40,60,80,100]
    },
    {
      tipo: "fama",
      nome: "Fama",
      descricao: m => `Alcance ${m} de fama`,
      base: [5,8,12,16,20,25,30,40,50,60]
    },
    {
      tipo: "seq",
      nome: "Sequência",
      descricao: m => `Faça ${m} pagamentos seguidos sem calote`,
      base: [3,5,8,12,15,20,25,35,45,60]
    },
    {
      tipo: "dia",
      nome: "Experiência",
      descricao: m => `Chegue ao dia ${m}`,
      base: [10,20,35,50,75,100,150,200,300,500]
    },
    {
      tipo: "videos",
      nome: "Vídeos",
      descricao: m => `Conclua ${m} vídeos recompensados`,
      base: [1,2,3,5,7,10,15,20,30,50]
    },
    {
      tipo: "recAnuncios",
      nome: "Recuperação",
      descricao: m => `Recupere R$${m} através de vídeos`,
      base: [100,250,500,1000,1500,2500,4000,6000,10000,15000]
    }
  ];

  const dificuldades = [
    { estrelas: 1, nome: "FÁCIL", multiplicador: 1 },
    { estrelas: 2, nome: "FÁCIL / INTERMEDIÁRIO", multiplicador: 2 },
    { estrelas: 3, nome: "MÉDIO", multiplicador: 4 },
    { estrelas: 4, nome: "DIFÍCIL", multiplicador: 8 },
    { estrelas: 5, nome: "MUITO DIFÍCIL", multiplicador: 15 }
  ];

  function gerarDesafios() {
    const lista = [];

    for (let nivel = 0; nivel < 5; nivel++) {
      for (let etapa = 0; etapa < 100; etapa++) {
        const categoria = categorias[etapa % categorias.length];
        const indice = Math.floor(etapa / categorias.length);
        const dificuldade = dificuldades[nivel];

        const meta = Math.ceil(
          categoria.base[indice] * dificuldade.multiplicador
        );

        lista.push({
          id: nivel * 100 + etapa + 1,
          t: `${categoria.nome} ${String(indice + 1).padStart(2, "0")}`,
          objetivo: categoria.descricao(meta),
          meta: meta,
          premioDolar: dificuldade.estrelas,
          estrelas: dificuldade.estrelas,
          dif: dificuldade.nome,
          prog: 0,
          tipo: categoria.tipo
        });
      }
    }

    return lista;
  }

  function obterProgresso(d) {
    switch (d.tipo) {
      case "caixa":
        return Number(money) || 0;

      case "totalEmp":
        return Number(totalEmp) || 0;

      case "lucroTotal":
        return Number(totalLucro) || 0;

      case "jurosTotal":
        return Number(jurosCount) || 0;

      case "negar":
        return Number(negarCount) || 0;

      case "fama":
        return Number(fame) || 0;

      case "seq":
        return Number(seq) || 0;

      case "dia":
        return Number(day) || 1;

      case "videos":
        return Number(usado && usado._videosAssistidos) || 0;

      case "recAnuncios":
        return Number(usado && usado._dinheiroAnuncios) || 0;

      default:
        return 0;
    }
  }

  function obterDescricao(d) {
    if (d.objetivo) return d.objetivo;

    const categoria = categorias.find(c => c.tipo === d.tipo);

    if (categoria) {
      return categoria.descricao(d.meta);
    }

    return d.t || "Complete este desafio";
  }

  const novosDesafios = gerarDesafios();

  // Preserva os IDs dos desafios que já estavam ativos.
  const idsAntigos = Array.isArray(ativasDesafios)
    ? ativasDesafios.map(d => Number(d.id))
    : [];

  todosDesafios.splice(
    0,
    todosDesafios.length,
    ...novosDesafios
  );

  ativasDesafios = idsAntigos
    .map(id => novosDesafios.find(d => d.id === id))
    .filter(Boolean);

  if (ativasDesafios.length === 0) {
    ativasDesafios = novosDesafios.slice(0, 3);
    proxDesafioIdx = 3;
  }

  if (!Number.isFinite(proxDesafioIdx) || proxDesafioIdx < 3) {
    proxDesafioIdx = 3;
  }

  if (proxDesafioIdx > 500) {
    proxDesafioIdx = 500;
  }

  // Atualiza progresso e notificações sem abrir a tela.
  function atualizarDesafios() {
    if (!Array.isArray(ativasDesafios)) return;

    ativasDesafios.forEach(d => {
      d.prog = obterProgresso(d);
      d.objetivo = obterDescricao(d);
    });

    desafiosParaColetar = ativasDesafios.filter(
      d => d.prog >= d.meta
    );

    // Atualiza somente os avisos do Dolinha.
    if (typeof atualizarNotificacoes === "function") {
      atualizarNotificacoes();
    }

    // Mantém a área de coleta atualizada.
    if (typeof renderColeta === "function") {
      renderColeta();
    }

    // Só redesenha os cartões se o jogador já abriu o modal.
    const modal = document.getElementById("desafiosModal");

    if (modal && modal.style.display === "flex") {
      renderizarLista();
    }
  }

  // Layout dos desafios seguindo o padrão das conquistas.
  function renderizarLista() {
    let html = `
      <div class="conquistaCard">
        <b>🏆 DESAFIOS</b><br>
        <small>Progresso: ${Math.min(500, proxDesafioIdx - 3)} / 500</small>
      </div>
    `;

    ativasDesafios.forEach((d, i) => {
      const meta = Math.max(1, Number(d.meta) || 1);
      const prog = Math.max(0, Number(d.prog) || 0);
      const pct = Math.min(100, Math.floor(prog / meta * 100));
      const feito = prog >= meta;

      html += `
        <div class="conquistaCard ${feito ? "feita" : ""}">
          <b>${i + 1}. ${d.t || "Desafio"} ${feito ? "💲" : ""}</b><br>
          <small>🎯 ${obterDescricao(d)}</small><br>
          <small>⭐ ${"★".repeat(Math.max(1, Number(d.estrelas) || 1))} | ${d.dif || "DESAFIO"}</small><br>
          <small>🎁 💲${Number(d.premioDolar) || 0}</small>

          <div class="progress">
            <div class="bar" style="width:${pct}%"></div>
          </div>

          <small>${Math.floor(prog)}/${meta} ${pct}%</small>

          ${
            feito
              ? `<button class="btn verde" onclick="coletarDesafio(${d.id})">✅ RESGATAR 💲${d.premioDolar}</button>`
              : ""
          }
        </div>
      `;
    });

    const lista = document.getElementById("listaDesafios");

    if (lista) {
      lista.innerHTML = html;
    }
  }

  // Só abre quando o jogador clicar no botão Desafios.
  window.openDesafios = function () {
    atualizarDesafios();
    renderizarLista();

    document.getElementById("desafiosModal").style.display = "flex";
  };

  // Coleta a recompensa e libera o próximo desafio.
  window.coletarDesafio = function (id) {
    const idx = ativasDesafios.findIndex(
      d => Number(d.id) === Number(id)
    );

    if (idx < 0) return;

    const d = ativasDesafios[idx];

    d.prog = obterProgresso(d);

    if (d.prog < d.meta) return;

    dolar += Number(d.premioDolar) || 0;

    ativasDesafios.splice(idx, 1);

    if (proxDesafioIdx < todosDesafios.length) {
      ativasDesafios.push(todosDesafios[proxDesafioIdx]);
      proxDesafioIdx++;
    }

    atualizarDesafios();

    if (typeof check === "function") {
      check();
    }

    if (typeof saveGame === "function") {
      saveGame();
    }

    renderizarLista();
  };

  // Atualização automática depois das ações do jogo.
  const checkOriginal = window.check;

  if (typeof checkOriginal === "function") {
    window.check = function (...args) {
      const resultado = checkOriginal.apply(this, args);
      atualizarDesafios();
      return resultado;
    };
  }

  const progressOriginal = window.atualizarProgress;

  if (typeof progressOriginal === "function") {
    window.atualizarProgress = function (...args) {
      const resultado = progressOriginal.apply(this, args);
      atualizarDesafios();
      return resultado;
    };
  }

  // Conta vídeos somente quando a recompensa é liberada.
  const recompensaOriginal = window.recompensaLiberada;

  if (typeof recompensaOriginal === "function") {
    window.recompensaLiberada = function (...args) {
      const tipo = pendenteTipo;
      const dinheiroAntes = Number(money) || 0;

      const resultado = recompensaOriginal.apply(this, args);

      if (tipo) {
        usado._videosAssistidos =
          (usado._videosAssistidos || 0) + 1;

        const ganho = Math.max(
          0,
          (Number(money) || 0) - dinheiroAntes
        );

        if (ganho > 0) {
          usado._dinheiroAnuncios =
            (usado._dinheiroAnuncios || 0) + ganho;
        }

        atualizarDesafios();

        if (typeof saveGame === "function") {
          saveGame();
        }
      }

      return resultado;
    };
  }

  // Primeira atualização, sem abrir qualquer modal.
  atualizarDesafios();

})();
