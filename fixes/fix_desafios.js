// fixes/fix_desafios.js - LÓGICA FINAL DESAFIOS
(function(){
  console.log("FIX DESAFIOS LOGICA");

  function getDesafios(){
    return window.desafios || window.listaDesafios || window.DESAFIOS || null;
  }

  function atualizarContadorGeral(){
    let lista = getDesafios();
    if(!lista) return;
    
    let concluidos = lista.filter(d => d.feito || d.concluido || d.atual >= d.meta).length;
    let total = lista.length;

    // Procura o titulo DESAFIOS DO MORRO
    let titulo = document.evaluate("//*[contains(text(),'DESAFIOS DO MORRO')]", document, null, 9, null).singleNodeValue;
    if(titulo){
      let header = titulo.parentElement;
      let contador = document.getElementById('contadorGeralDesafios');
      if(!contador){
        contador = document.createElement('div');
        contador.id = 'contadorGeralDesafios';
        contador.style.cssText = 'font-size:14px;font-weight:900;color:#000;background:#FFD600;padding:2px 10px;border-radius:10px;margin-left:10px;display:inline-block';
        titulo.appendChild(contador);
        titulo.style.display = 'flex';
        titulo.style.alignItems = 'center';
        titulo.style.flexWrap = 'wrap';
      }
      contador.innerText = `${concluidos}/${total}`;
    }
  }

  function loop(){
    let lista = getDesafios();
    if(!lista) return;

    // 1. Se concluiu, esconde
    lista.forEach((d,i)=>{
      if((d.atual >= d.meta || d.feito) && !d._sumiu){
        d._sumiu = true; // marca pra não contar 2x
        // tenta achar o card na tela pra sumir
        setTimeout(()=>{
          let cards = document.querySelectorAll('div');
          cards.forEach(c=>{
            if(c.innerText.includes(d.nome || d.titulo || '') && c.innerText.includes(`${d.atual}/${d.meta}`)){
              c.style.display = 'none';
            }
          });
        },200);
      }
    });

    atualizarContadorGeral();

    // 2. Conserta undefined -> FÁCIL
    document.querySelectorAll('*').forEach(el=>{
      if(el.innerText === 'undefined'){
        el.innerText = 'FÁCIL ★';
        el.style.background = '#aaa';
      }
    });
  }

  // 3. SE FALIR, RESETA TUDO
  function resetarTudoSeFalir(){
    // Hook na função de falir se existir
    let funcs = ['falir','gameOver','perdeu','quebrou','faliu'];
    funcs.forEach(nome=>{
      if(window[nome]){
        let old = window[nome];
        window[nome] = function(){
          console.log("FALIU - RESETANDO DESAFIOS");
          let lista = getDesafios();
          if(lista){
            lista.forEach(d=>{ d.atual = 0; d.feito = false; d.concluido = false; d._sumiu = false; });
            if(window.salvarDesafios) window.salvarDesafios();
            localStorage.removeItem('desafios');
            localStorage.removeItem('desafiosDoMorro');
          }
          return old.apply(this, arguments);
        }
      }
    });

    // Segurança: se dinheiro for < -5000 considera falência
    setInterval(()=>{
      if(window.money !== undefined && window.money < -100){
        // só reseta uma vez
        if(!window._jaFaliu){
          window._jaFaliu = true;
          let lista = getDesafios();
          if(lista){
            lista.forEach(d=>{ d.atual = 0; d.feito = false; });
          }
          setTimeout(()=>{ window._jaFaliu = false; }, 5000);
        }
      }
    },1000);
  }

  resetarTudoSeFalir();
  setInterval(loop, 1000);
  setTimeout(loop, 500);
})();
