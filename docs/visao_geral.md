# Visão Geral

Este projeto implementa o "Jogo da Velha 2.0":

- O tabuleiro principal (macro) é um jogo da velha 3x3.
- Cada célula do tabuleiro macro é um jogo da velha 3x3 independente (micro).
- O jogo suporta duas regras:
  - **Regra Clássica (Ultimate Tic-Tac-Toe):** a célula escolhida dentro de um micro determina qual micro o próximo jogador deve jogar. Se o micro de destino já foi vencido ou empatado, o jogador pode jogar em qualquer micro ativo.
  - **Regra Livre:** todos os micros estão ativos simultaneamente — o jogador pode jogar em qualquer micro ainda em andamento.
- O vencedor de cada micro define o valor da célula macro correspondente.
- O objetivo é vencer o tabuleiro macro, conquistando três células macro em linha, coluna ou diagonal.
- Feedback visual indica o micro ativo (borda verde/brilho) e os micros bloqueados (opacidade reduzida).
- O sistema mantém a separação entre lógica, interface e estilos, e está estruturado para fácil expansão.
- A IA heurística se adapta à regra selecionada, avaliando o destino de cada jogada no modo clássico.
