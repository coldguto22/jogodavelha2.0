# Jogo da Velha 2.0

Este é um projeto web de Jogo da Velha 2.0, onde cada célula do tabuleiro principal é, na verdade, um novo jogo da velha 3x3 (micro tabuleiro). O objetivo é conquistar três micros em linha, coluna ou diagonal no tabuleiro macro.

## Como funciona
- O tabuleiro principal (macro) é 3x3.
- Cada célula do macro é um micro tabuleiro 3x3 independente.
- Todos os micros estão ativos simultaneamente: o jogador pode jogar em qualquer micro ainda em andamento.
- O vencedor de cada micro define o valor da célula macro correspondente.
- O jogo termina quando alguém vence o macro (3 micros vencidos em linha, coluna ou diagonal) ou todos os micros terminam empatados.
- Dois modos: 2 jogadores ou contra IA (básica).

## Como rodar
1. Abra o link `https://coldguto22.github.io/jogodavelha2.0/` em seu navegador.
2. Escolha o modo de jogo e jogue!

## Estrutura do Projeto
- `index.html`: Estrutura da página.
- `style.css`: Estilos do tabuleiro macro/micro.
- `script.js`: Lógica do jogo macro/micro e IA básica.
- `docs/`: Documentação detalhada do sistema, funcionalidades e expansões.

## Expansão
O código está modularizado para facilitar melhorias, como IA mais sofisticada, placar, animações, tabuleiros maiores, etc.
