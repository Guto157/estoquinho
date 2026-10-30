
/* =========================================
   FIX LOJINHA
   INVENTARIO PERMANENTE POR USUARIO
========================================= */

console.log("FIX LOJINHA CARREGADO");

(function(){

  if(window.fixLojinhaAtivo) return;
  window.fixLojinhaAtivo = true;

  function chaveInventario(){
    if(!window.currentUser) return null;
    return "lojinha_permanente_" + currentUser;
  }

  function obterInventarioSalvo(){
    let chave = chaveInventario();
    if(!chave) return {};

    try{
      return JSON.parse(localStorage.getItem(chave) || "{}");
    }catch(e){
      console.error("Erro ao ler inventário da lojinha:",e);
      return {};
    }
  }

  function salvarInventario(){
    let chave = chaveInventario();
    if(!chave) return;

    try{
      localStorage.setItem(chave,JSON.stringify(inv || {}));
    }catch(e){
      console.error("Erro ao salvar inventário da lojinha:",e);
    }
  }

  function recuperarInventario(){
    if(!window.currentUser) return;

    let salvo = obterInventarioSalvo();

    if(typeof inv !== "object" || inv === null){
      inv = {};
    }

    Object.keys(salvo).forEach(id=>{
      let nivelSalvo = Number(salvo[id]);

      if(!Number.isInteger(nivelSalvo)) return;

      if(inv[id] === undefined || nivelSalvo > inv[id]){
        inv[id] = nivelSalvo;
      }
    });

    salvarInventario();

    if(typeof renderSlots === "function"){
      renderSlots();
    }

    console.log("Inventário permanente recuperado:",inv);
  }

  if(typeof window.saveGame === "function"){
    const saveOriginal = window.saveGame;

    window.saveGame = function(){
      saveOriginal.apply(this,arguments);
      salvarInventario();
    };
  }

  if(typeof window.carregarSave === "function"){
    const carregarOriginal = window.carregarSave;

    window.carregarSave = function(){
      carregarOriginal.apply(this,arguments);
      recuperarInventario();
    };
  }

  window.comprarItem = function(id,rIdx,preco){

    let item = lojaItens.find(x=>x.id === id);

    if(!item){
      console.error("Item não encontrado:",id);
      return;
    }

    rIdx = Number(rIdx);
    preco = Number(preco);

    if(!Number.isInteger(rIdx) || rIdx < 0 || rIdx >= raridades.length){
      alert("Upgrade inválido.");
      return;
    }

    let atual = inv[id];
    let esperado = atual === undefined ? 0 : atual + 1;

    if(rIdx !== esperado){
      alert("Esse upgrade não está disponível.");
      return;
    }

    if(!Number.isFinite(preco) || preco < 0){
      alert("Preço inválido.");
      return;
    }

    if(dolar < preco){
      alert("Sem Dolinha");
      return;
    }

    dolar -= preco;
    inv[id] = rIdx;

    salvarInventario();

    if(typeof renderSlots === "function"){
      renderSlots();
    }

    if(typeof check === "function"){
      check();
    }

    salvarInventario();

    if(typeof openShop === "function"){
      openShop();
    }
  };

  if(window.currentUser){
    recuperarInventario();
  }

})();
