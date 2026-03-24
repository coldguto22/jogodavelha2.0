document.addEventListener('DOMContentLoaded', function() {
    // Estrutura para o Jogo da Velha 2.0 (macro/micro)
    // Cada célula do macro é um micro tabuleiro 3x3
    const boardElement = document.getElementById('game-board');
    const statusElement = document.getElementById('game-status');
    const restartBtn = document.getElementById('restart-btn');
    const modeSelect = document.getElementById('mode-select');
    const ruleSelect = document.getElementById('rule-select');

    const macroBoard = Array.from({ length: 9 }, () => ({
        board: Array(9).fill(null), // micro tabuleiro
        winner: null, // 'X', 'O' ou 'E' (empate)
        finished: false
    }));
    let macroStatus = Array(9).fill(null); // 'X', 'O', 'E' (empate) ou null
    let currentPlayer = 'X';
    let gameActive = true;
    let activeMicro = null; // null = qualquer micro, 0-8 = micro específico
    let mode = modeSelect ? modeSelect.value : 'human';
    let ruleMode = ruleSelect ? ruleSelect.value : 'classic';

    // Retorna o activeMicro efetivo: null no modo livre, valor real no modo clássico
    function getActiveMicro() {
        return ruleMode === 'free' ? null : activeMicro;
    }

    function renderMacroBoard() {
        boardElement.innerHTML = '';
        macroBoard.forEach((micro, macroIdx) => {
            const microDiv = document.createElement('div');
            microDiv.className = 'micro-board';
            if (micro.finished) microDiv.classList.add('finished');
            // Highlight do micro ativo
            if (!micro.finished && gameActive) {
                if (getActiveMicro() === null || getActiveMicro() === macroIdx) {
                    microDiv.classList.add('active-micro');
                } else {
                    microDiv.classList.add('inactive-micro');
                }
            }
            // Indicação visual do vencedor do micro
            if (micro.finished && micro.winner && micro.winner !== 'E') {
                const winnerSpan = document.createElement('span');
                winnerSpan.className = 'macro-winner';
                winnerSpan.textContent = micro.winner;
                microDiv.appendChild(winnerSpan);
            }
            micro.board.forEach((cell, microIdx) => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'cell';
                cellDiv.textContent = cell || '';
                const isAllowed = getActiveMicro() === null || getActiveMicro() === macroIdx;
                if (!micro.finished && !cell && gameActive && isAllowed) {
                    cellDiv.addEventListener('click', () => handleMicroCellClick(macroIdx, microIdx));
                }
                microDiv.appendChild(cellDiv);
            });
            boardElement.appendChild(microDiv);
        });
    }

    function handleMicroCellClick(macroIdx, microIdx) {
        // Verificar se o macro clicado é permitido pelo activeMicro
        if (getActiveMicro() !== null && getActiveMicro() !== macroIdx) return;
        const micro = macroBoard[macroIdx];
        if (micro.finished || micro.board[microIdx]) return;
        micro.board[microIdx] = currentPlayer;
        // Verifica vitória/empate no micro
        if (checkWinner(micro.board)) {
            micro.winner = currentPlayer;
            micro.finished = true;
            macroStatus[macroIdx] = currentPlayer;
        } else if (micro.board.every(cell => cell)) {
            micro.winner = 'E';
            micro.finished = true;
            macroStatus[macroIdx] = 'E';
        }
        // Calcula o próximo activeMicro com base na posição jogada
        const nextMicro = microIdx; // a posição dentro do micro determina o próximo macro
        if (macroBoard[nextMicro].finished) {
            activeMicro = null; // micro de destino já finalizado → jogo livre
        } else {
            activeMicro = nextMicro;
        }
        // Verifica vitória/empate no macro
        if (checkWinner(macroStatus)) {
            statusElement.textContent = `Jogador ${currentPlayer} venceu o tabuleiro macro!`;
            gameActive = false;
            activeMicro = null;
        } else if (macroStatus.every(cell => cell)) {
            statusElement.textContent = 'Empate no tabuleiro macro!';
            gameActive = false;
            activeMicro = null;
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusElement.textContent = `Vez do jogador ${currentPlayer}`;
            renderMacroBoard();
            if (mode === 'ai' && currentPlayer === 'O' && gameActive) {
                setTimeout(aiMoveMacro, 400);
            }
            return;
        }
        renderMacroBoard();
    }

    function aiMoveMacro() {
        // IA heurística com regra clássica: respeita activeMicro e avalia destino do oponente
        const macroWinPatterns = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        const options = [];
        macroBoard.forEach((micro, macroIdx) => {
            // Respeitar activeMicro: só considerar micros permitidos
            if (getActiveMicro() !== null && getActiveMicro() !== macroIdx) return;
            if (!micro.finished) {
                micro.board.forEach((cell, microIdx) => {
                    if (!cell) {
                        let score = 0;
                        // 1. Priorizar vencer o micro
                        const tempMicro = micro.board.slice();
                        tempMicro[microIdx] = 'O';
                        if (checkWinner(tempMicro)) {
                            score += 100;
                            // Bônus extra se vencer o micro fecha uma linha no macro
                            const tempMacro = macroStatus.slice();
                            tempMacro[macroIdx] = 'O';
                            if (checkWinner(tempMacro)) score += 500;
                        }
                        // 2. Bloquear o adversário no micro
                        tempMicro[microIdx] = 'X';
                        if (checkWinner(tempMicro)) score += 80;
                        // 3. Evitar micros quase perdidos
                        const xCount = micro.board.filter(v => v === 'X').length;
                        const oCount = micro.board.filter(v => v === 'O').length;
                        if (xCount - oCount >= 2) score -= 10;
                        // 4. Priorizar micros já iniciados pela IA
                        if (oCount > 0) score += 20;
                        // 5. Priorizar micros que contribuem para linha no macro
                        macroWinPatterns.forEach(pattern => {
                            if (pattern.includes(macroIdx)) {
                                const countO = pattern.filter(idx => macroStatus[idx] === 'O').length;
                                if (countO > 0) score += 30;
                            }
                        });
                        // 6. Penalizar micros onde o adversário domina
                        if (xCount > oCount) score -= 10;
                        // 7. Heurística de destino: avaliar para qual micro estamos mandando o oponente
                        const destMicro = macroBoard[microIdx];
                        if (!destMicro.finished) {
                            // Penalizar se o oponente (X) está perto de vencer o micro de destino
                            const destBoard = destMicro.board;
                            const destXCount = destBoard.filter(v => v === 'X').length;
                            const destOCount = destBoard.filter(v => v === 'O').length;
                            if (destXCount >= 2 && destXCount > destOCount) score -= 40;
                            // Bônus se mandamos para micro que já dominamos
                            if (destOCount >= 2 && destOCount > destXCount) score += 25;
                            // Penalizar se vencer o micro de destino daria vitória macro ao oponente
                            const tempMacroX = macroStatus.slice();
                            tempMacroX[microIdx] = 'X';
                            if (checkWinner(tempMacroX)) score -= 60;
                        }
                        // Bônus se mandamos para micro já finalizado (oponente fica livre, mas não ganha nada)
                        // Esse caso é neutro, sem ajuste extra
                        options.push({ macroIdx, microIdx, score });
                    }
                });
            }
        });
        if (options.length === 0) return;
        const maxScore = Math.max(...options.map(o => o.score));
        const bestMoves = options.filter(o => o.score === maxScore);
        let move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        handleMicroCellClick(move.macroIdx, move.microIdx);
    }

    function checkWinner(board) {
        const winPatterns = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        return winPatterns.some(pattern => {
            const [a,b,c] = pattern;
            return board[a] && board[a] === board[b] && board[a] === board[c];
        });
    }

    function restartGame() {
        for (let i = 0; i < 9; i++) {
            macroBoard[i].board = Array(9).fill(null);
            macroBoard[i].winner = null;
            macroBoard[i].finished = false;
            macroStatus[i] = null;
        }
        if (typeof restartGame.lastStarter === 'undefined') {
            restartGame.lastStarter = 'O';
        }
        currentPlayer = restartGame.lastStarter === 'X' ? 'O' : 'X';
        restartGame.lastStarter = currentPlayer;
        gameActive = true;
        activeMicro = null;
        statusElement.textContent = `Vez do jogador ${currentPlayer}`;
        renderMacroBoard();
        if (mode === 'ai' && currentPlayer === 'O') {
            setTimeout(aiMoveMacro, 400);
        }
    }

    modeSelect && modeSelect.addEventListener('change', (e) => {
        mode = e.target.value;
        restartGame();
    });

    ruleSelect && ruleSelect.addEventListener('change', (e) => {
        ruleMode = e.target.value;
        restartGame();
    });

    restartBtn.addEventListener('click', restartGame);

    // Inicialização
    restartGame();
});
