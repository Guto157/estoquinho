
// ============================================
// FIX DESAFIOS - 500 DESAFIOS
// 5 dificuldades, 10 categorias e 10 etapas
// ============================================

(function () {
  if (window.fixDesafios500Ativo) return;
  window.fixDesafios500Ativo = true;

  console.log("FIX DESAFIOS 500 CARREGADO");

  const categorias = [
    {
      tipo: "caixa",
      nome: "Caixa",
      descricao: meta => `Mantenha R$${meta} no caixa`,
      base: [5000, 10000, 20000, 40000, 80000, 120000, 180000, 250000, 350000, 500000]
    },
    {
      tipo: "totalEmp",
      nome: "Empréstimos",
      descricao: meta => `Conclua ${meta} empréstimos`,
      base: [5, 10, 20, 35, 50, 75, 100, 150, 200, 300]
    },
    {
      tipo: "lucroTotal",
      nome: "Lucros",
      descricao: meta => `Acumule R$${meta} de lucro`,
      base: [1000, 2500, 5000, 10000, 20000, 35000, 50000, 75000, 100000, 150000]
    },
    {
      tipo: "jurosTotal",
      nome: "Juros",
      descricao: meta => `Cobre juros ${meta} vezes`,
      base: [3, 5, 10, 15, 20, 30, 40, 60, 80, 100]
    },
    {
      tipo: "negar",
      nome: "Decisões",
      descricao: meta => `Negue ${meta} empréstimos`,
      base: [3, 5, 10, 15, 20, 30, 40, 60, 80, 100]
    },
    {
      tipo: "fama",
      nome: "Fama",
      descricao: meta => `Alcance ${meta} de fama`,
      base: [5, 8, 12, 16, 20, 25, 30, 40, 50, 60]
    },
    {
      tipo: "seq",
      nome: "Sequência",
      descricao: meta => `Faça ${meta} pagamentos seguidos sem calote`,
      base: [3, 5, 8, 12, 15, 20, 25, 35, 45, 60]
    },
    {
      tipo: "dia",
      nome: "Experiência",
      descricao: meta => `Chegue ao dia ${meta}`,
      base: [10, 20, 35, 50, 75, 100, 150, 200, 300, 500]
    },
    {
      tipo: "videos",
      nome: "Vídeos",
      descricao: meta => `Assista e conclua ${meta} vídeos recompensados`,
      base: [1, 2, 3, 5, 7, 10, 15, 20, 30, 50]
    },
    {
      tipo: "recAnuncios",
      nome: "Recuperação",
      descricao: meta => `Recupere R$${meta} através de vídeos`,
      base: [100, 250, 500, 1000, 1500, 2500, 4000, 6000, 10000, 15000]
    }
  ];

  const dificuldades = [
    { estrelas: 1, nome: "FÁCIL", multiplicador: 1 },
    { estrelas: 2, nome: "FÁCIL / INTERMEDIÁRIO", multiplicador: 2 },
    { estrelas: 3, nome: "MÉDIO", multiplicador: 4 },
    { estrelas: 4, nome: "DIFÍCIL", multiplicador: 8 },
    { estrelas: 5, nome: "MUITO DIFÍCIL", multiplicador: 15 }
  ];

  function gerar500Desafios() {
    const lista = [];

    for (let nivel = 0; nivel < 5; nivel++) {
      for (let etapa = 0; etapa < 100; etapa++) {
        const categoria = categorias[etapa % categorias.length];
        const indice = Math.floor(etapa / categorias.length);
        const dificuldade = dificuldades[nivel];

        const meta = Math.ceil(
          categoria.base[indice] * dificuldade.multiplicador
        );

        const id = nivel * 100 + etapa + 1;

        lista.push({
          id,
          t: `${categoria.nome} ${String(indice + 1).padStart(2, "0")} - ${categoria.descricao(meta)}`,
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

  function obterProgresso(d) {
    if (d.tipo === "caixa") return Math.max(0, money || 0);
    if (d.tipo === "totalEmp") return totalEmp || 0;
    if (d.tipo === "lucroTotal") return totalLucro || 0;
    if (d.tipo === "jurosTotal") return jurosCount || 0;
    if (d.tipo === "negar") return negarCount || 0;
    if (d.tipo === "fama") return fame || 0;
    if (d.tipo === "seq") return seq || 0;
    if (d.tipo === "dia") return day || 1;
    if (d.tipo === "videos") return usado?._videosAssistidos || 0;
    if (d.tipo === "recAnuncios") return usado?._dinheiroAnuncios || 0;
    return 0;
  }

  // Gera os 500 desafios
  const novosDesafios = gerar500Desafios();

  // Preserva os desafios que já estavam ativos e seus progressos
  const antigosAtivos = Array.isArray(ativasDesafios)
    ? ativasDesafios
    : [];

  const idsAtivos = antigosAtivos.map(d => d.id);

  window.todosDesafios = novosDesafios;

  // Atualiza a variável global lexical criada pelo jogo
  todosDesafios.splice(0, todosDesafios.length, ...novosDesafios);

  ativasDesafios = idsAtivos.length
    ? idsAtivos.map(id => novosDesafios.find(d => d.id === id)).filter(Boolean)
    : novosDesafios.slice(0, 3);

  // Mantém três desafios ativos
  while (ativasDesafios.length < 3 && proxDesafioIdx < 500) {
    const proximo = novosDesafios[proxDesafioIdx];
    if (proximo) ativasDesafios.push(proximo);
    proxDesafioIdx++;
  }

  if (!Number.isFinite(proxDesafioIdx) || proxDesafioIdx < 3) {
    proxDesafioIdx = 3;
  }

  function atualizarDesafios() {
    ativasDesafios.forEach(d => {
      d.prog = obterProgresso(d);
    });

    desafiosParaColetar = ativasDesafios.filter(
      d => d.prog >= d.meta
    );

    if (typeof renderColeta === "function") renderColeta();
    if (typeof atualizarNotificacoes === "function") atualizarNotificacoes();
  }

  // Exibe os desafios ativos
  window.openDesafios = function () {
    atualizarDesafios();

    let html = `
      <div class="card" style="text-align:center;background:#111;color:#FFD600">
        <b>🏆 DESAFIOS DO MORRO</b>
        <div style="font-size:12px;margin-top:5px">
          ${Math.min(proxDesafioIdx - 3, 497)} / 500 etapas liberadas
        </div>
      </div>
    `;

    ativasDesafios.forEach(d => {
      const pct = Math.min(100, Math.floor(d.prog / d.meta * 100));
      const cor = ["#9E9E9E", "#4CAF50", "#2196F3", "#FF9800", "#FFD600"][d.estrelas - 1];

      html += `
        <div class="card" style="border-left:6px solid ${cor};padding:10px">
          <div style="display:flex;justify-content:space-between;gap:5px">
            <b>${d.t}</b>
            <span style="background:${cor};color:#fff;padding:3px 7px;border-radius:8px;white-space:nowrap">
              ${"★".repeat(d.estrelas)}
            </span>
          </div>
          <small>${d.dif}</small>
          <div class="progress">
            <div class="bar" style="background:${cor};width:${pct}%"></div>
          </div>
          <small>${Math.floor(d.prog)} / ${d.meta} (${pct}%)</small>
          <br>
          <small>🎁 Recompensa: ${d.premioDolar} 💲</small>
          ${
            d.prog >= d.meta
              ? `<button class="btn roxo" onclick="coletarDesafio(${d.id})">✅ COLETAR ${d.premioDolar} 💲</button>`
              : ""
          }
        </div>
      `;
    });

    document.getElementById("listaDesafios").innerHTML = html;
    document.getElementById("desafiosModal").style.display = "flex";
  };

  // Coleta e libera o próximo desafio
  window.coletarDesafio = function (id) {
    const idx = ativasDesafios.findIndex(d => d.id === id);
    if (idx < 0) return;

    const desafio = ativasDesafios[idx];
    desafio.prog = obterProgresso(desafio);

    if (desafio.prog < desafio.meta) return;

    dolar += desafio.premioDolar;

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

  // Registra vídeos somente quando a recompensa é realmente liberada
  const recompensaOriginal = window.recompensaLiberada;

  if (typeof recompensaOriginal === "function") {
    window.recompensaLiberada = function (...args) {
      const tipo = pendenteTipo;
      const dinheiroAntes = Number(money) || 0;

      recompensaOriginal.apply(this, args);

      if (tipo) {
        usado._videosAssistidos = (usado._videosAssistidos || 0) + 1;

        if (tipo === "salvar") {
          usado._videosSalvar = (usado._videosSalvar || 0) + 1;
        }

        const ganho = Math.max(0, (Number(money) || 0) - dinheiroAntes);

        if (ganho > 0) {
          usado._dinheiroAnuncios = (usado._dinheiroAnuncios || 0) + ganho;
        }

        atualizarDesafios();

        if (typeof check === "function") check();
        if (typeof saveGame === "function") saveGame();
      }
    };
  }

  // Atualiza o progresso sempre que o jogo atualizar os dados
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
