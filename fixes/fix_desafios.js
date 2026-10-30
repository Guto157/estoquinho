// TESTE DE CARGA
console.log(">>> FIX DESAFIOS TESTE <<<");
alert("FIX DESAFIOS CARREGOU");

(function(){
  setInterval(()=>{
    document.querySelectorAll('*').forEach(el=>{
      if(el.innerText === 'undefined' && el.parentElement.innerText.includes('LVL')){
        el.innerText = 'TESTE OK ★';
        el.style.background = 'red';
        el.style.color = 'white';
      }
    });
  },500);
})();
