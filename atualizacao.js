# MAPA COMPLETO - PEGA 1 PAGA 2 v1.0
# INDEX CONGELADO - NÃO MEXER

## 1. VARIÁVEIS DE ESTADO (save)
- currentUser, day, money, fame, level, dolar
- inv: {bone, cordao, relogio, glock, pit, moto: 0-4 raridade}
- usado: {Beto, Tia, Nego, Ana, _ultimo, _policia}
- totalEmp, totalLucro, seq, jurosCount, negarCount, valorNegar
- tituloEscolhido, conquistasColetadas
- proxMissaoIdx, proxDesafioIdx, ativasMissoes, ativasDesafios
- pendentePerda, pendenteTipo, pendenteBanco

## 2. CONSTANTES FIXAS
- titulosLevel: [{l:1,n:MOLEQUE}...{l:100,CHEFÃO}]
- raridades: [{id:comum,mult:1,preco:5}...{id:ultimate,mult:2.6,preco:90}]
- lojaItens: [{id:bone,slot:s1,baseChance:3}...]
- personagensComuns: Beto(BL 88% BAIXO), Tia(TC 82% BAIXO), Nego(NC 38% ALTO), Ana(AN 75% MÉDIO)
- policiaisDisfarcados: Rafael 92% MÉDIO
- falas: Beto(25), Tia(25), Nego(25), Ana(25)
- todasMissoes (50 geradas), todosDesafios (50 gerados), conquistas (50)

## 3. FUNÇÕES - AUTH / SAVE
- toggleEye(id,btn), mostrarErroLogin(msg), fazerLogin(), carregarSave(), saveGame(), logout()
- openMenu(), closeMenu(), openLoginMenu()

## 4. FUNÇÕES - UI / BUFFS
- getTituloLevel(lvl), getBuffValor(id,rIdx), getTotalChanceBonus(), getTotalLucroBonus()
- getGlockBonusVsAlto(), getRecuperacaoBonus(), getTotalBuffsTexto()
- renderSlots(), atualizarTituloAvatar(), check(), log(t), closeAll()

## 5. FUNÇÕES - CORE GAME (ALVO DO PATCH)
- novo() -> cria cur, calcula pedeAtual, voltaAtual, chanceAtual, renderiza choices
    - cur.pedeAtual, cur.voltaAtual, cur.chanceAtual
    - BUGS CONHECIDOS: pede > caixa, volta 4x
- jogar(tipo) -> 'pagar' | 'negar' | 'juros'
    - BUGS CONHECIDOS: de = pe*2*2, pendentePerda = de ao invés de pe
- atualizarProgress() -> calcula prog das missões/desafios
    - BUGS CONHECIDOS: não trava no meta, não salva
- aceitarPerda(), recompensaLiberada(), salvarComAnuncio()
- pedirBanco(v,t), mostrarAnuncio(t,p), emprestimoBancoVideo(), emprestimoBancoDolar(), restartFull()

## 6. FUNÇÕES - LOJA / MISSÕES
- openShop(), comprarItem(id,rIdx,preco), openBanco(), openMissoes(), openDesafios()
- coletarMissao(id), coletarDesafio(id), renderColeta(), atualizarNotificacoes()
- openTitulos(), selecionarTitulo(nome), openPix(), comprarDolar(q)
- openConquistas(), mostrarAbaConquista(aba), renderConquistasAba(), coletarConquista(id), getProgConquista(c)

## 7. TUTORIAL
- tutPasso, tutPassos[5], forcarTutorial(), verificarTutorial(), mostrarTutorial()
- proximoTutorial(), pularTutorial(), fecharTutorial()

## 8. DOM IDS IMPORTANTES
- #money, #dolar, #day, #lvl, #patrao, #pede, #volta, #chance
- #clienteAvatar, #clienteBox, #nome, #tag, #hist, #bubble, #choices, #areaColeta, #log
- #s1-s6, #buffsLinha, #tituloExclusivo
- Modais: #loginModal, #shopModal, #conquistasModal, #bancoModal, #missoesModal, #desafiosModal, #titulosModal, #pixModal, #adSave, #adModal, #gameOver, #tutorialModal, #menuDrawer
