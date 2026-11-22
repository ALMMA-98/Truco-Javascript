    const NAIPES_SIMBOLOS = {
      ouro: '♦',
      espadas: '♠',
      copas: '♥',
      paus: '♣',
      especial: '🃏'
    };

    const NAIPES_CLASSES = {
      ouro: 'red',
      copas: 'red',
      espadas: 'black',
      paus: 'black',
      especial: 'joker-color'
    };

    const BASE_CARDS = [
      // Comuns
      { valor: 'Q', naipe: 'ouro', forca: 1 },
      { valor: 'Q', naipe: 'espadas', forca: 1 },
      { valor: 'Q', naipe: 'copas', forca: 1 },
      { valor: 'Q', naipe: 'paus', forca: 1 },

      { valor: 'J', naipe: 'ouro', forca: 2 },
      { valor: 'J', naipe: 'espadas', forca: 2 },
      { valor: 'J', naipe: 'copas', forca: 2 },
      { valor: 'J', naipe: 'paus', forca: 2 },

      { valor: 'K', naipe: 'ouro', forca: 3 },
      { valor: 'K', naipe: 'espadas', forca: 3 },
      { valor: 'K', naipe: 'copas', forca: 3 },
      { valor: 'K', naipe: 'paus', forca: 3 },

      { valor: 'A', naipe: 'ouro', forca: 4 },
      { valor: 'A', naipe: 'copas', forca: 4 },
      { valor: 'A', naipe: 'paus', forca: 4 },

      // Manilhas e cartas superiores
      { valor: '2', naipe: 'ouro', forca: 10 },
      { valor: '2', naipe: 'espadas', forca: 10 },
      { valor: '2', naipe: 'copas', forca: 10 },
      { valor: '2', naipe: 'paus', forca: 10 },

      { valor: '3', naipe: 'ouro', forca: 20 },
      { valor: '3', naipe: 'espadas', forca: 20 },
      { valor: '3', naipe: 'copas', forca: 20 },
      { valor: '3', naipe: 'paus', forca: 20 },

      { valor: 'Joker', naipe: 'especial', forca: 50 },
      { valor: '7', naipe: 'ouro', forca: 90 },
      { valor: 'A', naipe: 'espadas', forca: 95 },
      { valor: '7', naipe: 'copas', forca: 98 },
      { valor: '4', naipe: 'paus', forca: 100 }
    ];

    const ESCALA_APOSTAS = [1, 3, 6, 9, 12];
    const ROTULOS_APOSTAS = { 3: 'TRUCO!', 6: 'SEIS!', 9: 'NOVE!', 12: 'DOZE!' };

    let state = {
      placar: { A: 0, B: 0 },
      valorMao: 1,
      indiceAposta: 0,
      duplaPediuUltimoAumento: null,
      primeiroJogadorMao: 0,
      turnoAtual: 0,
      rodadaAtual: 0,
      historicoRodadas: [],
      cartasMesa: [],
      jogadores: [
        { id: 0, nome: "Você", dupla: "A", cartas: [], isHumano: true },
        { id: 1, nome: "Bot 1", dupla: "B", cartas: [], isHumano: false },
        { id: 2, nome: "Bot 2", dupla: "A", cartas: [], isHumano: false },
        { id: 3, nome: "Bot 3", dupla: "B", cartas: [], isHumano: false }
      ],
      trucoPendente: false,
      bloqueadoAcao: false,
      saindoCartas: false,
      primeiraJogadaFeita: false,
      tutorialAtivo: true
    };

    // --- UI: REGRAS, PAINEL DE ORDEM E TUTORIAL ---
    function toggleModalRegras(abrir) {
      document.getElementById('help-modal').style.display = abrir ? 'flex' : 'none';
    }

    function fecharModalRegras(event) {
      if (event.target.id === 'help-modal') {
        toggleModalRegras(false);
      }
    }

    function togglePainelOrdem() {
      document.getElementById('power-panel').classList.toggle('open');
    }

    function atualizarTutorialUI() {
      const box = document.getElementById('tutorial-box');
      if (!state.tutorialAtivo || state.primeiraJogadaFeita) {
        box.style.display = 'none';
        return;
      }
      box.style.display = 'block';
    }

    function pularTutorial() {
      state.tutorialAtivo = false;
      atualizarTutorialUI();
    }

    function dispararAnimacaoTruco(texto) {
      const el = document.getElementById('truco-callout');
      el.innerText = texto;
      el.style.display = 'block';
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'trucoPop 1.35s ease forwards';
      setTimeout(() => {
        el.style.display = 'none';
      }, 1360);
    }

    function exibirBannerRodada(texto) {
      const banner = document.getElementById('round-winner-banner');
      banner.innerText = texto;
      banner.style.display = 'block';
      banner.style.animation = 'none';
      void banner.offsetWidth;
      banner.style.animation = 'bannerSlideIn 0.35s ease forwards';
    }

    function esconderBannerRodada() {
      document.getElementById('round-winner-banner').style.display = 'none';
    }

    function exibirBannerMao(titulo, subtitulo, duracao = 2400) {
      const banner = document.getElementById('hand-winner-banner');
      banner.innerHTML = `<span class="highlight">${titulo}</span><span>${subtitulo}</span>`;
      banner.style.display = 'block';
      banner.style.animation = 'none';
      void banner.offsetWidth;
      banner.style.animation = 'bannerSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards';

      setTimeout(() => {
        banner.style.display = 'none';
      }, duracao);
    }

    // --- INÍCIO DO JOGO E NOVA MÃO ---
    function iniciarJogoGlobal() {
      document.getElementById('start-screen').style.display = 'none';
      state.placar = { A: 0, B: 0 };
      state.primeiroJogadorMao = Math.floor(Math.random() * 4);
      state.primeiraJogadaFeita = false;
      state.tutorialAtivo = true;
      atualizarPlacarUI();
      iniciarNovaMao();
    }

    function iniciarNovaMao() {
      state.valorMao = 1;
      state.indiceAposta = 0;
      state.duplaPediuUltimoAumento = null;
      state.historicoRodadas = [];
      state.rodadaAtual = 0;
      state.cartasMesa = [];
      state.trucoPendente = false;
      state.bloqueadoAcao = false;
      state.saindoCartas = false;

      esconderBannerRodada();
      log("--- Nova mão iniciada ---");
      atualizarUIValores();

      const baralho = [...BASE_CARDS].sort(() => Math.random() - 0.5);
      state.jogadores.forEach(j => {
        j.cartas = [baralho.pop(), baralho.pop(), baralho.pop()];
      });

      state.turnoAtual = state.primeiroJogadorMao;
      renderizarTudo(true);
      atualizarTurnoUI();
      atualizarTutorialUI();
      processarTurno();
    }

    // --- RENDERIZAÇÃO ---
    function criarElementoCarta(carta, faceUp = true, extraClasses = '') {
      const cardEl = document.createElement('div');
      if (!faceUp) {
        cardEl.className = `card back ${extraClasses}`.trim();
        return cardEl;
      }
      cardEl.className = `card ${NAIPES_CLASSES[carta.naipe]} ${extraClasses}`.trim();
      cardEl.innerHTML = `
        <div class="card-top">${carta.valor}</div>
        <div class="card-suit">${NAIPES_SIMBOLOS[carta.naipe]}</div>
        <div class="card-bottom">${carta.valor}</div>
      `;
      return cardEl;
    }

    function renderizarTudo(animarEntradaMesa = false) {
      state.jogadores.forEach(j => {
        const container = document.getElementById(`hand-${j.id}`);
        container.innerHTML = '';

        j.cartas.forEach((carta, index) => {
          if (j.isHumano) {
            const podeJogar = state.turnoAtual === 0 && !state.bloqueadoAcao && !state.trucoPendente && !state.saindoCartas;
            const cardEl = criarElementoCarta(carta, true, podeJogar ? 'playable' : '');
            if (podeJogar) {
              cardEl.onclick = () => jogarCartaHumano(index);
            }
            container.appendChild(cardEl);
          } else {
            container.appendChild(criarElementoCarta(carta, false));
          }
        });
      });

      renderizarMesa(animarEntradaMesa);
      atualizarTrackerRodadas();
    }

    function renderizarMesa(animarUltimo = false) {
      const area = document.getElementById('played-cards-area');
      area.innerHTML = '';

      state.cartasMesa.forEach((item, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'played-card-wrapper';

        const animClass = state.saindoCartas
          ? 'card-exit'
          : (animarUltimo && idx === state.cartasMesa.length - 1 ? 'card-enter' : '');

        const cardEl = criarElementoCarta(item.carta, true, animClass);
        const label = document.createElement('div');
        label.className = 'played-by';
        label.innerText = state.jogadores[item.jogadorId].nome;

        wrapper.appendChild(cardEl);
        wrapper.appendChild(label);
        area.appendChild(wrapper);
      });
    }

    function atualizarTrackerRodadas() {
      const dots = document.querySelectorAll('.round-dot');
      dots.forEach((dot, idx) => {
        dot.className = 'round-dot';
        const res = state.historicoRodadas[idx];
        if (res === 'A') dot.classList.add('win-a');
        else if (res === 'B') dot.classList.add('win-b');
        else if (res === 'EMPATE') dot.classList.add('draw');
      });
    }

    // --- TURNOS E INDICADOR DE DUPLA ---
    function atualizarIndicadorDupla() {
      const jogadorAtual = state.jogadores[state.turnoAtual];
      const duplaAtiva = jogadorAtual ? jogadorAtual.dupla : 'A';

      const badge = document.getElementById('dupla-turn-badge');
      const cardA = document.getElementById('team-card-a');
      const cardB = document.getElementById('team-card-b');

      if (duplaAtiva === 'A') {
        badge.innerText = 'VEZ DA DUPLA A (VOCÊ / PARCEIRO)';
        cardA.classList.add('team-active');
        cardB.classList.remove('team-active');
      } else {
        badge.innerText = 'VEZ DA DUPLA B (RIVAIS)';
        cardB.classList.add('team-active');
        cardA.classList.remove('team-active');
      }
    }

    function atualizarTurnoUI() {
      atualizarIndicadorDupla();

      state.jogadores.forEach(j => {
        const label = document.getElementById(`label-${j.id}`);
        if (j.id === state.turnoAtual && !state.saindoCartas) {
          label.classList.add('active-turn');
        } else {
          label.classList.remove('active-turn');
        }
      });

      const btnTruco = document.getElementById('btn-pedir-truco');
      const proximoValorIdx = state.indiceAposta + 1;

      if (proximoValorIdx < ESCALA_APOSTAS.length) {
        const proximoValor = ESCALA_APOSTAS[proximoValorIdx];
        const rotulos = { 3: 'TRUCO', 6: 'SEIS', 9: 'NOVE', 12: 'DOZE' };
        btnTruco.innerText = `PEDIR ${rotulos[proximoValor]} (${proximoValor})`;
      }

      const podePedirTruco =
        (state.turnoAtual === 0) &&
        (state.duplaPediuUltimoAumento !== 'A') &&
        (proximoValorIdx < ESCALA_APOSTAS.length) &&
        !state.trucoPendente &&
        !state.bloqueadoAcao &&
        !state.saindoCartas;

      btnTruco.disabled = !podePedirTruco;
      renderizarTudo(false);
    }

    function proximoTurno() {
      state.turnoAtual = (state.turnoAtual + 1) % 4;
      atualizarTurnoUI();
      processarTurno();
    }

    function processarTurno() {
      if (state.bloqueadoAcao || state.trucoPendente || state.saindoCartas) return;

      if (state.cartasMesa.length === 4) {
        state.bloqueadoAcao = true;
        // Ritmo de rodada um pouco mais lento para melhor leitura
        setTimeout(finalizarRodada, 1850);
        return;
      }

      const jogador = state.jogadores[state.turnoAtual];
      if (!jogador.isHumano) {
        state.bloqueadoAcao = true;
        setTimeout(() => {
          // Adversário só pode pedir truco na vez dele, antes de jogar a carta
          avaliarTrucoAntesDeJogarIA(jogador);
        }, 950);
      }
    }

    function jogarCartaHumano(cardIndex) {
      if (state.turnoAtual !== 0 || state.bloqueadoAcao || state.trucoPendente || state.saindoCartas) return;

      if (!state.primeiraJogadaFeita) {
        state.primeiraJogadaFeita = true;
        atualizarTutorialUI();
      }

      const carta = state.jogadores[0].cartas.splice(cardIndex, 1)[0];
      state.cartasMesa.push({ jogadorId: 0, carta });
      log(`Você jogou ${carta.valor} (${NAIPES_SIMBOLOS[carta.naipe]})`);
      renderizarTudo(true);
      proximoTurno();
    }

    function jogarCartaIA(jogador) {
      jogador.cartas.sort((a, b) => a.forca - b.forca);
      let idxEscolha = 0;

      if (state.cartasMesa.length > 0) {
        const maiorForcaMesa = Math.max(...state.cartasMesa.map(c => c.carta.forca));
        const cartaVencedora = jogador.cartas.findIndex(c => c.forca > maiorForcaMesa);
        if (cartaVencedora !== -1) {
          idxEscolha = cartaVencedora;
        }
      }

      const carta = jogador.cartas.splice(idxEscolha, 1)[0];
      state.cartasMesa.push({ jogadorId: jogador.id, carta });
      log(`${jogador.nome} jogou ${carta.valor} (${NAIPES_SIMBOLOS[carta.naipe]})`);

      state.bloqueadoAcao = false;
      renderizarTudo(true);
      proximoTurno();
    }

    // --- FINALIZAÇÃO DA RODADA E DA MÃO ---
    function finalizarRodada() {
      let maiorForca = -1;
      let vencedores = [];

      state.cartasMesa.forEach(item => {
        if (item.carta.forca > maiorForca) {
          maiorForca = item.carta.forca;
          vencedores = [item.jogadorId];
        } else if (item.carta.forca === maiorForca) {
          vencedores.push(item.jogadorId);
        }
      });

      let resultadoDupla = null;
      let mensagemRodada = '';

      if (vencedores.length === 1) {
        const vId = vencedores[0];
        resultadoDupla = state.jogadores[vId].dupla;
        mensagemRodada = `Rodada da Dupla ${resultadoDupla} (${state.jogadores[vId].nome})`;
      } else {
        const duplasEmpatadas = new Set(vencedores.map(id => state.jogadores[id].dupla));
        if (duplasEmpatadas.size === 1) {
          resultadoDupla = Array.from(duplasEmpatadas)[0];
          mensagemRodada = `Rodada da Dupla ${resultadoDupla}`;
        } else {
          resultadoDupla = 'EMPATE';
          mensagemRodada = 'Rodada Empatada (Cangou!)';
        }
      }

      log(mensagemRodada);
      exibirBannerRodada(mensagemRodada);

      state.historicoRodadas.push(resultadoDupla);
      state.rodadaAtual++;
      atualizarTrackerRodadas();

      // Animação das cartas saindo da mesa após exibir quem venceu a rodada
      setTimeout(() => {
        state.saindoCartas = true;
        renderizarMesa(false);

        setTimeout(() => {
          esconderBannerRodada();
          state.cartasMesa = [];
          state.saindoCartas = false;
          renderizarMesa(false);

          const vencedorMao = verificarVencedorMao();
          if (vencedorMao) {
            atribuirPontos(vencedorMao);
          } else {
            if (resultadoDupla !== 'EMPATE') {
              state.turnoAtual = vencedores[0];
            }
            state.bloqueadoAcao = false;
            atualizarTurnoUI();
            processarTurno();
          }
        }, 620);
      }, 1350);
    }

    function verificarVencedorMao() {
      const h = state.historicoRodadas;
      const vitoriasA = h.filter(r => r === 'A').length;
      const vitoriasB = h.filter(r => r === 'B').length;

      if (vitoriasA >= 2) return 'A';
      if (vitoriasB >= 2) return 'B';

      if (h.length >= 2) {
        if (h[0] === 'EMPATE' && h[1] !== 'EMPATE') return h[1];
        if (h[1] === 'EMPATE' && h[0] !== 'EMPATE') return h[0];
        if (h[2] && h[2] === 'EMPATE' && h[0] !== 'EMPATE') return h[0];
      }

      if (h.length === 3 && h.every(r => r === 'EMPATE')) {
        return 'NENHUM';
      }

      return null;
    }

    function atribuirPontos(dupla) {
      if (dupla === 'A' || dupla === 'B') {
        state.placar[dupla] += state.valorMao;
        const nomeDupla = dupla === 'A' ? 'DUPLA A (VOCÊ E PARCEIRO)' : 'DUPLA B (RIVAIS)';
        log(`Vitória na mão: ${nomeDupla} (+${state.valorMao} tento(s))`);
        exibirBannerMao(
          `VITÓRIA DA ${nomeDupla}!`,
          `Ganhou as rodadas e levou +${state.valorMao} tento(s).`,
          2400
        );
      } else {
        log('Mão empatada nas 3 rodadas: ninguém pontuou.');
        exibirBannerMao('MÃO EMPATADA', 'Ninguém pontuou nesta mão.', 2000);
      }

      atualizarPlacarUI();

      if (state.placar.A >= 24) {
        setTimeout(() => {
          alert("PARABÉNS! A Dupla A venceu a partida de 24 tentos!");
          reiniciarPartidaCompleta();
        }, 2500);
      } else if (state.placar.B >= 24) {
        setTimeout(() => {
          alert("FIM DE JOGO! A Dupla B venceu a partida de 24 tentos.");
          reiniciarPartidaCompleta();
        }, 2500);
      } else {
        state.primeiroJogadorMao = (state.primeiroJogadorMao + 1) % 4;
        setTimeout(iniciarNovaMao, 2550);
      }
    }

    function reiniciarPartidaCompleta() {
      document.getElementById('start-title').innerText = "FIM DE PARTIDA";
      document.getElementById('btn-iniciar').innerText = "JOGAR NOVAMENTE";
      document.getElementById('start-screen').style.display = 'flex';
    }

    // --- TRUCO E APOSTAS ---
    function solicitarTruco() {
      if (state.turnoAtual !== 0 || state.bloqueadoAcao || state.trucoPendente || state.saindoCartas) return;

      const proximoValor = ESCALA_APOSTAS[state.indiceAposta + 1];
      const grito = ROTULOS_APOSTAS[proximoValor] || 'TRUCO!';
      state.duplaPediuUltimoAumento = 'A';
      state.trucoPendente = true;

      log(`Você pediu ${grito} (${proximoValor} tentos)`);
      dispararAnimacaoTruco(grito);
      atualizarTurnoUI();

      setTimeout(() => decidirRespostaTrucoIA(), 1100);
    }

    function avaliarTrucoAntesDeJogarIA(jogador) {
      // Garante que é a vez do adversário e antes de jogar a carta
      if (jogador.dupla !== 'B' || state.turnoAtual !== jogador.id || state.cartasMesa.length >= 4) {
        jogarCartaIA(jogador);
        return;
      }

      if (state.duplaPediuUltimoAumento === 'B' || state.indiceAposta >= ESCALA_APOSTAS.length - 1) {
        jogarCartaIA(jogador);
        return;
      }

      const forcaMao = calcularForcaMao(jogador.cartas);
      const probabilidadePedir = 0.14 + (forcaMao / 320);

      if (Math.random() < probabilidadePedir) {
        const proximoValor = ESCALA_APOSTAS[state.indiceAposta + 1];
        const grito = ROTULOS_APOSTAS[proximoValor] || 'TRUCO!';
        state.duplaPediuUltimoAumento = 'B';
        state.trucoPendente = true;

        log(`${jogador.nome} (Dupla B) pediu ${grito} (${proximoValor} tentos)`);
        dispararAnimacaoTruco(grito);
        exibirModalTrucoHumano(proximoValor, grito);
      } else {
        jogarCartaIA(jogador);
      }
    }

    function calcularForcaMao(cartas) {
      return cartas.reduce((acc, c) => acc + c.forca, 0);
    }

    function decidirRespostaTrucoIA() {
      const melhorForcaRivais = Math.max(
        calcularForcaMao(state.jogadores[1].cartas),
        calcularForcaMao(state.jogadores[3].cartas)
      );

      // Chance maior de fugir se a mão estiver fraca ou a aposta já estiver alta
      const pesoAposta = state.indiceAposta * 18;
      const chanceAceitar = melhorForcaRivais > (35 + pesoAposta) || Math.random() < (0.28 - state.indiceAposta * 0.05);

      if (chanceAceitar) {
        state.indiceAposta++;
        state.valorMao = ESCALA_APOSTAS[state.indiceAposta];
        state.trucoPendente = false;
        log(`Dupla B ACEITOU! Mão valendo ${state.valorMao} tento(s).`);
        atualizarUIValores();

        if (state.turnoAtual === 0) {
          atualizarTurnoUI();
        } else {
          setTimeout(() => jogarCartaIA(state.jogadores[state.turnoAtual]), 700);
        }
      } else {
        log(`Dupla B FUGIU! Dupla A ganha ${state.valorMao} tento(s).`);
        state.trucoPendente = false;
        atribuirPontos('A');
      }
    }

    function exibirModalTrucoHumano(valor, grito) {
      const modal = document.getElementById('truco-modal');
      const title = document.getElementById('truco-modal-title');
      const btnAumentar = document.getElementById('btn-aumentar-aposta');

      title.innerText = `ADVERSÁRIOS PEDIRAM ${grito}`;
      document.getElementById('truco-modal-desc').innerText = `A mão pode passar a valer ${valor} tentos.`;

      const proximoValorIdx = state.indiceAposta + 2;
      if (proximoValorIdx < ESCALA_APOSTAS.length) {
        const proxVal = ESCALA_APOSTAS[proximoValorIdx];
        btnAumentar.style.display = 'inline-block';
        btnAumentar.innerText = `AUMENTAR PARA ${proxVal}`;
      } else {
        btnAumentar.style.display = 'none';
      }

      modal.style.display = 'flex';
    }

    function responderTruco(aceitou) {
      document.getElementById('truco-modal').style.display = 'none';

      if (aceitou) {
        state.indiceAposta++;
        state.valorMao = ESCALA_APOSTAS[state.indiceAposta];
        state.trucoPendente = false;
        state.bloqueadoAcao = false;
        log(`Você ACEITOU! Mão valendo ${state.valorMao} tento(s).`);
        atualizarUIValores();
        atualizarTurnoUI();
        processarTurno();
      } else {
        log(`Você FUGIU! Dupla B ganha ${state.valorMao} tento(s).`);
        state.trucoPendente = false;
        atribuirPontos('B');
      }
    }

    function aumentarAposta() {
      document.getElementById('truco-modal').style.display = 'none';
      state.indiceAposta++;
      state.valorMao = ESCALA_APOSTAS[state.indiceAposta];
      state.duplaPediuUltimoAumento = 'A';
      atualizarUIValores();

      const proximoValor = ESCALA_APOSTAS[state.indiceAposta + 1];
      const grito = ROTULOS_APOSTAS[proximoValor] || 'AUMENTO!';
      log(`Você pediu ${grito} (${proximoValor} tentos)`);
      dispararAnimacaoTruco(grito);

      setTimeout(() => decidirRespostaTrucoIA(), 1100);
    }

    // --- HELPERS ---
    function atualizarPlacarUI() {
      document.getElementById('score-a').innerText = state.placar.A;
      document.getElementById('score-b').innerText = state.placar.B;
    }

    function atualizarUIValores() {
      document.getElementById('valor-mao').innerText = state.valorMao;
    }

    function log(msg) {
      const logEl = document.getElementById('game-log');
      const item = document.createElement('div');
      item.innerText = msg;
      logEl.appendChild(item);
      logEl.scrollTop = logEl.scrollHeight;
    }
    // --- EFEITOS SONOROS (WEB AUDIO API) ---
let audioCtx = null;

function tocarSom(tipo) {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const agora = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (tipo === 'carta') {
      // Toque curto e seco ao jogar carta
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, agora);
      osc.frequency.exponentialRampToValueAtTime(110, agora + 0.08);
      gain.gain.setValueAtTime(0.12, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.08);
      osc.start(agora);
      osc.stop(agora + 0.09);
    } else if (tipo === 'truco') {
      // Alerta mais marcante para pedido de Truco
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(330, agora);
      osc.frequency.setValueAtTime(440, agora + 0.09);
      gain.gain.setValueAtTime(0.11, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.22);
      osc.start(agora);
      osc.stop(agora + 0.23);
    } else if (tipo === 'vitoria') {
      // Acorde curto ascendente para vitória na mão/rodada
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, agora);
      osc.frequency.setValueAtTime(554.37, agora + 0.1);
      osc.frequency.setValueAtTime(659.25, agora + 0.2);
      gain.gain.setValueAtTime(0.12, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.35);
      osc.start(agora);
      osc.stop(agora + 0.36);
    }
  } catch (e) {
    // Ignora caso o navegador bloqueie áudio antes de interação
  }
}