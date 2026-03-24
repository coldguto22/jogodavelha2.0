# Funcionalidades Implementadas

- Jogo da Velha 2.0: tabuleiro macro 3x3, cada célula é um micro jogo da velha 3x3
- Seletor de regra: **Clássica** (Ultimate Tic-Tac-Toe) ou **Livre** (todos os micros ativos)
- Regra Clássica: a posição jogada dentro de um micro determina o próximo micro obrigatório; se o micro de destino já está finalizado, o jogador escolhe livremente
- Feedback visual do micro ativo: borda verde com brilho nos micros permitidos, opacidade reduzida nos bloqueados
- Dois modos de jogo: 2 jogadores ou contra IA (IA heurística refinada)
- IA heurística adaptada à regra clássica: avalia o destino de cada jogada, penaliza mandar o oponente para micros onde ele domina
- Alternância automática de símbolos: X e O se alternam como primeiro jogador a cada partida, mas X sempre inicia a primeira partida
- Interface web responsiva e clara
- Reinício de partida a qualquer momento
- Código modularizado para facilitar expansões
