# 🃏 Jogo de Truco (HTML, CSS & JavaScript)

Aplicação web interativa de **Truco em 2 duplas** desenvolvida em um único arquivo HTML/CSS/JS, com baralho personalizado, hierarquia fixa de manilhas, sistema de apostas (até 12 tentos por mão e 24 tentos para vencer), animações de mesa, efeitos sonoros via Web Audio API e bots adversários/parceiro.

---

## ✨ Funcionalidades

* **2 Duplas (4 Jogadores):** Você e o **Bot 2** formam a **Dupla A**, enfrentando os **Bots 1 e 3** (**Dupla B**). Apenas as suas cartas ficam visíveis.
* **Baralho e Poder Personalizados:** Sem as cartas comuns `4`, `5`, `6` e `7`, com sequência de poder do menor para o maior:
  1. **Q** (Dama)
  2. **J** (Valete)
  3. **K** (Rei)
  4. **Ás** (`♦`, `♥`, `♣`)
  5. **2** (todos os naipes)
  6. **3** (todos os naipes)
  7. **Joker** (Coringa)
  8. **7 de Ouro**
  9. **Espadilha** (Ás de Espadas)
  10. **7 de Copas**
  11. **Zap** (4 de Paus — carta máxima)
* **Sistema de Apostas (Tentos):** Começa valendo `1` tento e pode evoluir para `3` (**Truco**), `6`, `9` e `12` (máximo). Aceitar aumenta o valor; fugir entrega os tentos atuais à dupla desafiante.
* **Regra de Empate (Cangar):** Se houver empate na rodada, vence a mão a dupla que fizer a primeira rodada válida após o empate (ou quem venceu a 1ª rodada em empates posteriores, conforme configurado em `verificarVencedorMao`).
* **Interface e Experiência:**
  * Botão **`?`** para consulta rápida de regras e instruções.
  * Aba retrátil **Ordem das Cartas** para conferir a hierarquia durante a partida.
  * Caixa de registro com rolagem para acompanhar o histórico de jogadas e apostas.
  * Indicador visual da dupla da vez, banner de vencedor de rodada, destaque da carta vencedora, animações de entrada/saída de cartas e chamada de **Truco!**.
  * Dica de tutorial exibida apenas na primeira jogada, com opção de pular.

---

## 🚀 Como Executar

1. Salve o código do jogo como `index.html` em uma pasta local.
2. Abra o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).
3. Clique em **INICIAR JOGO** para começar a partida até **24 tentos**.

---

## 🛠️ Estrutura do Código

* **Estilos (`<style>`):** Layout de mesa em grid, animações (`cardEnter`, `cardExit`, `trucoPop`, `bannerSlideIn`, `responsePop`), destaque de cartas e responsividade.
* **Estado e Regras (`<script>`):**
  * `BASE_CARDS`: define o baralho e a pontuação numérica (`forca`) de cada carta.
  * `iniciarJogoGlobal()` e `iniciarNovaMao()`: gerenciam o placar geral (24 tentos), distribuição de 3 cartas e início das mãos.
  * `jogarCartaHumano()` e `jogarCartaIA()`: controlam descartes, turnos e decisões dos bots.
  * `finalizarRodada()`, `verificarVencedorMao()` e `atribuirPontos()`: apuram a maior carta da mesa, aplicam as regras de empate e somam os tentos.
  * `solicitarTruco()`, `avaliarTrucoAntesDeJogarIA()`, `responderTruco()` e `aumentarAposta()`: controlam o ciclo de pedidos, respostas e aumentos de aposta respeitando a vez do jogador.

---

## 📌 Observações

* O jogo roda inteiramente no cliente (`client-side`), sem necessidade de servidor ou dependências externas.
* Efeitos sonoros via **Web Audio API** dependem de interação prévia do usuário na página para desbloquear o contexto de áudio do navegador.

