# Changelog

## [24/03/2026]
- Implementação da regra clássica do Ultimate Tic-Tac-Toe: variável activeMicro determina o micro obrigatório com base na posição jogada
- Restrição de cliques ao micro ativo (validação no handler e na renderização)
- Feedback visual do micro ativo: borda verde/brilho nos micros permitidos, opacidade reduzida nos bloqueados
- IA adaptada à regra clássica: respeita activeMicro e avalia heuristicamente o destino de cada jogada
- Seletor de regra (Clássica vs Livre) na interface, preservando o comportamento original como opção
- Documentação atualizada para refletir as duas regras disponíveis

## [18/06/2025]
- Refino da IA heurística: prioriza continuidade em micros já iniciados, formação de linhas no macro e evita dispersão

## [12/06/2025]
- Criação do projeto base (HTML, CSS, JS)
- Implementação do modo 2 jogadores
- Implementação do modo contra IA (aleatória)
- Melhoria da IA: agora tenta vencer, bloquear ou faz jogada aleatória
- Adição de seletor de modo de jogo na interface
- Criação da pasta docs para documentação
- Implementação da alternância automática de símbolos: X e O se alternam como primeiro jogador a cada partida, mas X sempre inicia a primeira partida
- Documentação atualizada para futura expansão ao modo "Jogo da Velha 2.0" (macro/micro tabuleiros)
- Início da implementação do Jogo da Velha 2.0: todos os micros ativos simultaneamente, macro atualizado conforme micros vencidos, IA básica inicial
- Substituição da IA básica por IA heurística baseada em regras para o modo macro/micro
- IA heurística aprimorada: agora prioriza vencer e formar linhas no macro tabuleiro
