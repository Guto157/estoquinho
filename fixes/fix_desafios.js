
(function () {
  if (window.fixDesafios500Ativo) return;
  window.fixDesafios500Ativo = true;

  console.log("FIX DESAFIOS 500 CARREGADO");

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
          meta,
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

  function progresso(d) {
    if (d.tipo === "caixa") return Number(money) || 0;
    if (d.tipo === "totalEmp") return Number(totalEmp) || 0;
    if (d.tipo === "lucroTotal") return Number(totalLucro) || 0;
    if (d.tipo === "jurosTotal") return Number(jurosCount) || 0;
    if (d.tipo === "negar") return Number(negarCount) || 0;
    if (d.tipo === "fama") return Number(fame) || 0;
    if (d.tipo === "seq") return Number(seq) || 0;
    if (d.tipo === "dia") return Number(day) || 1;
    if (d.tipo === "videos") return Number(usado?._videosAssistidos) || 0;
    if (d.tipo === "recAnuncios") return Number(usado?._dinheiroAnuncios) || 0;
    return 0;
  }

  const novos = gerarDesafios();

  todosDesafios.splice(0, todosDesafios.length, ...novos);

  const idsAntigos = Array.isArray(ativasDesafios)
    ? ativasDesafios.map(d => d.id)
    : [];

  ativasDesafios = idsAntigos
    .map(id => novos.find(d => d.id === id))
    .filter(Boolean);

  if (!ativasDesafios.length) {
    ativasDesafios = novos.slice(0, 3);
    proxDesafioIdx = 3;
  }

  if (!Number.isFinite(proxDesafioIdx) || proxDesafioIdx < 3) {
    proxDesafioIdx = 3;
  }

  function atualizarDesafios() {
    ativasDesafios.forEach(d => {
      d.prog = progresso(d);
    });

    desafiosParaColetar = ativasDesafios.filter(
      d => d.prog >= d.meta
    );

    if (typeof atualizarNotificacoes === "function") {
      atualizarNotificacoes();
    }

    if (typeof renderColeta === "function") {
      renderColeta();
    }
  }

  // Cartões com o mesmo padrão visual das conquistas.
  window.openDesafios = function () {
    atualizarDesafios();

    let html = `
      <div class="conquistaCard">
        <b>🏆 DESAFIOS</b><br>
        <small>Progresso: ${Math.min(500, proxDesafioIdx - 3)} / 500</small>
      </div>
    `;

    ativasDesafios.forEach((d, i) => {
      const pct = Math.min(
        100,
        Math.floor((d.prog / d.meta) * 100)
      );

      const feito = d.prog >= d.meta;

      html += `
        <div class="conquistaCard ${feito ? "feita" : ""}">
          <b>${i + 1}. ${d.t} ${feito ? "💲" : ""}</b><br>
          <small>🎯 ${d.objetivo || d.t}</small><br>
          <small>⭐ ${"★".repeat(d.estrelas)} | ${d.dif}</small><br>
          <small>🎁 💲${d.premioDolar}</small>
          <div class="progress">
            <div class="bar" style="width:${pct}%"></div>
          </div>
          <small>${Math.floor(d.prog)}/${d.meta} ${pct}%</small>
          ${
            feito
              ? `<button class="btn verde" onclick="coletarDesafio(${d.id})">✅ RESGATAR 💲${d.premioDolar}</button>`
              : ""
          }
        </div>
      `;
    });

    document.getElementById("listaDesafios").innerHTML = html;
    document.getElementById("desafiosModal").style.display = "flex";
  };

  window.coletarDesafio = function (id) {
    const idx = ativasDesafios.findIndex(d => d.id === id);
    if (idx < 0) return;

    const d = ativasDesafios[idx];
    d.prog = progresso(d);

    if (d.prog < d.meta) return;

    dolar += d.premioDolar;
    ativasDesafios.splice(idx, 1);

    if (proxDesafioIdx < todosDesafios.length) {
      ativasDesafios.push(todosDesafios[proxDesafioIdx]);
      proxDesafioIdx++;
    }

    atualizarDesafios();

    if (typeof check === "function") check();
    if (typeof saveGame === "function") saveGame();

    window.openDesafios();
  };

  // Conta somente quando a recompensa do vídeo é liberada.
  const recompensaOriginal = window.recompensaLiberada;

  if (typeof recompensaOriginal === "function") {
    window.recompensaLiberada = function (...args) {
      const tipo = pendenteTipo;
      const dinheiroAntes = Number(money) || 0;

      const resultado = recompensaOriginal.apply(this, args);

      if (tipo) {
        usado._videosAssistidos = (usado._videosAssistidos || 0) + 1;

        const ganho = Math.max(
          0,
          (Number(money) || 0) - dinheiroAntes
        );

        if (ganho > 0) {
          usado._dinheiroAnuncios =
            (usado._dinheiroAnuncios || 0) + ganho;
        }

        atualizarDesafios();

        if (typeof check === "function") check();
        if (typeof saveGame === "function") saveGame();
      }

      return resultado;
    };
  }

  const atualizarOriginal = window.atualizarProgress;

  if (typeof atualizarOriginal === "function") {
    window.atualizarProgress = function (...args) {
      const resultado = atualizarOriginal.apply(this, args);
      atualizarDesafios();
      return resultado;
    };
  }

  atualizarDesafios();

  if (typeof saveGame === "function") saveGame();
})();
