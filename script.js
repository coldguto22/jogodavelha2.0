document.addEventListener('DOMContentLoaded', function() {
    // Estrutura para o Jogo da Velha 2.0 (macro/micro)
    // Cada célula do macro é um micro tabuleiro 3x3
    const boardElement = document.getElementById('game-board');
    const statusElement = document.getElementById('game-status');
    const restartBtn = document.getElementById('restart-btn');
    const modeSelect = document.getElementById('mode-select');
    const ruleSelect = document.getElementById('rule-select');
    const difficultySelect = document.getElementById('difficulty-select');

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
    let difficulty = difficultySelect ? difficultySelect.value : 'easy';

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

    // ==================== IA Heurística (modo Fácil) ====================

    function aiMoveHeuristic() {
        const macroWinPatterns = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        const options = [];
        macroBoard.forEach((micro, macroIdx) => {
            if (getActiveMicro() !== null && getActiveMicro() !== macroIdx) return;
            if (!micro.finished) {
                micro.board.forEach((cell, microIdx) => {
                    if (!cell) {
                        let score = 0;
                        const tempMicro = micro.board.slice();
                        tempMicro[microIdx] = 'O';
                        if (checkWinner(tempMicro)) {
                            score += 100;
                            const tempMacro = macroStatus.slice();
                            tempMacro[macroIdx] = 'O';
                            if (checkWinner(tempMacro)) score += 500;
                        }
                        tempMicro[microIdx] = 'X';
                        if (checkWinner(tempMicro)) score += 80;
                        const xCount = micro.board.filter(v => v === 'X').length;
                        const oCount = micro.board.filter(v => v === 'O').length;
                        if (xCount - oCount >= 2) score -= 10;
                        if (oCount > 0) score += 20;
                        macroWinPatterns.forEach(pattern => {
                            if (pattern.includes(macroIdx)) {
                                const countO = pattern.filter(idx => macroStatus[idx] === 'O').length;
                                if (countO > 0) score += 30;
                            }
                        });
                        if (xCount > oCount) score -= 10;
                        const destMicro = macroBoard[microIdx];
                        if (!destMicro.finished) {
                            const destBoard = destMicro.board;
                            const destXCount = destBoard.filter(v => v === 'X').length;
                            const destOCount = destBoard.filter(v => v === 'O').length;
                            if (destXCount >= 2 && destXCount > destOCount) score -= 40;
                            if (destOCount >= 2 && destOCount > destXCount) score += 25;
                            const tempMacroX = macroStatus.slice();
                            tempMacroX[microIdx] = 'X';
                            if (checkWinner(tempMacroX)) score -= 60;
                        }
                        options.push({ macroIdx, microIdx, score });
                    }
                });
            }
        });
        if (options.length === 0) return;
        const maxScore = Math.max(...options.map(o => o.score));
        const bestMoves = options.filter(o => o.score === maxScore);
        const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        handleMicroCellClick(move.macroIdx, move.microIdx);
    }

    // ==================== IA Minimax (modos Médio e Difícil) ====================

    const WIN_PATTERNS = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    // Clona o estado do jogo para simulação no Minimax
    function cloneState() {
        const boards = [];
        const status = macroStatus.slice();
        for (let i = 0; i < 9; i++) {
            boards.push({
                board: macroBoard[i].board.slice(),
                winner: macroBoard[i].winner,
                finished: macroBoard[i].finished
            });
        }
        return { boards, status, active: getActiveMicro() };
    }

    // Aplica uma jogada no estado clonado e retorna o novo estado
    function applyMove(state, macroIdx, microIdx, player) {
        const s = {
            boards: state.boards.map(b => ({
                board: b.board.slice(),
                winner: b.winner,
                finished: b.finished
            })),
            status: state.status.slice(),
            active: state.active
        };
        s.boards[macroIdx].board[microIdx] = player;
        // Verifica vitória/empate no micro
        if (checkWinner(s.boards[macroIdx].board)) {
            s.boards[macroIdx].winner = player;
            s.boards[macroIdx].finished = true;
            s.status[macroIdx] = player;
        } else if (s.boards[macroIdx].board.every(cell => cell)) {
            s.boards[macroIdx].winner = 'E';
            s.boards[macroIdx].finished = true;
            s.status[macroIdx] = 'E';
        }
        // Calcula próximo activeMicro
        if (ruleMode === 'free') {
            s.active = null;
        } else if (s.boards[microIdx].finished) {
            s.active = null;
        } else {
            s.active = microIdx;
        }
        return s;
    }

    // Lista jogadas válidas para um estado
    function getValidMoves(state) {
        const moves = [];
        for (let m = 0; m < 9; m++) {
            if (state.active !== null && state.active !== m) continue;
            if (state.boards[m].finished) continue;
            for (let c = 0; c < 9; c++) {
                if (!state.boards[m].board[c]) {
                    moves.push({ macroIdx: m, microIdx: c });
                }
            }
        }
        return moves;
    }

    // Função de avaliação robusta para o Minimax
    // Retorna score positivo = vantagem para O (IA), negativo = vantagem para X
    function evaluate(state) {
        // Vitória/derrota no macro
        if (checkWinner(state.status)) {
            // Determinar quem venceu checando quais padrões fecharam
            for (const pattern of WIN_PATTERNS) {
                const [a, b, c] = pattern;
                if (state.status[a] && state.status[a] === state.status[b] && state.status[a] === state.status[c]) {
                    return state.status[a] === 'O' ? 10000 : -10000;
                }
            }
        }
        // Empate no macro
        if (state.status.every(s => s)) return 0;

        let score = 0;

        // 1. Micros controlados
        const oMicros = state.status.filter(s => s === 'O').length;
        const xMicros = state.status.filter(s => s === 'X').length;
        score += (oMicros - xMicros) * 150;

        // 2. Proximidade de vitória no macro (2 de 3 numa linha)
        for (const pattern of WIN_PATTERNS) {
            const vals = pattern.map(i => state.status[i]);
            const oCount = vals.filter(v => v === 'O').length;
            const xCount = vals.filter(v => v === 'X').length;
            const emptyCount = vals.filter(v => v === null).length;
            // O tem 2 numa linha com 1 vazio = ameaça forte
            if (oCount === 2 && emptyCount === 1) score += 200;
            if (xCount === 2 && emptyCount === 1) score -= 200;
            // 1 numa linha com 2 vazios = potencial
            if (oCount === 1 && emptyCount === 2) score += 40;
            if (xCount === 1 && emptyCount === 2) score -= 40;
            // Linha bloqueada (ambos têm peças) = sem valor
        }

        // 3. Controle do centro (macro posição 4)
        if (state.status[4] === 'O') score += 80;
        else if (state.status[4] === 'X') score -= 80;
        else if (!state.boards[4].finished) {
            // Avaliar quem domina o micro central
            const centerBoard = state.boards[4].board;
            const oCenter = centerBoard.filter(v => v === 'O').length;
            const xCenter = centerBoard.filter(v => v === 'X').length;
            score += (oCenter - xCenter) * 10;
        }

        // 4. Controle de cantos do macro (posições 0, 2, 6, 8)
        const corners = [0, 2, 6, 8];
        for (const idx of corners) {
            if (state.status[idx] === 'O') score += 30;
            else if (state.status[idx] === 'X') score -= 30;
        }

        // 5. Avaliação interna dos micros não finalizados
        for (let m = 0; m < 9; m++) {
            if (state.boards[m].finished) continue;
            const b = state.boards[m].board;
            for (const pattern of WIN_PATTERNS) {
                const vals = pattern.map(i => b[i]);
                const oCount = vals.filter(v => v === 'O').length;
                const xCount = vals.filter(v => v === 'X').length;
                const emptyCount = vals.filter(v => v === null).length;
                if (oCount === 2 && emptyCount === 1) score += 15;
                if (xCount === 2 && emptyCount === 1) score -= 15;
            }
            // Centro do micro
            if (b[4] === 'O') score += 5;
            else if (b[4] === 'X') score -= 5;
        }

        // 6. Qualidade do micro ativo (para onde o oponente vai jogar)
        if (state.active !== null && !state.boards[state.active].finished) {
            const destBoard = state.boards[state.active].board;
            const destO = destBoard.filter(v => v === 'O').length;
            const destX = destBoard.filter(v => v === 'X').length;
            // Se o oponente é mandado para micro que dominamos, bom para nós
            score += (destO - destX) * 8;
        }

        return score;
    }

    // Ordena jogadas para melhorar a poda alfa-beta
    function orderMoves(moves, state, player) {
        return moves.map(move => {
            let priority = 0;
            const board = state.boards[move.macroIdx].board;
            // Priorizar jogadas que vencem micro
            const temp = board.slice();
            temp[move.microIdx] = player;
            if (checkWinner(temp)) {
                priority += 1000;
                // Priorizar se vence o macro também
                const tempStatus = state.status.slice();
                tempStatus[move.macroIdx] = player;
                if (checkWinner(tempStatus)) priority += 5000;
            }
            // Priorizar bloqueio
            const opp = player === 'O' ? 'X' : 'O';
            temp[move.microIdx] = opp;
            if (checkWinner(temp)) priority += 800;
            // Priorizar centro
            if (move.microIdx === 4) priority += 10;
            if (move.macroIdx === 4) priority += 10;
            return { ...move, priority };
        }).sort((a, b) => b.priority - a.priority);
    }

    // Minimax com poda alfa-beta
    function minimax(state, depth, alpha, beta, isMaximizing) {
        // Terminal: vitória no macro
        if (checkWinner(state.status)) {
            for (const pattern of WIN_PATTERNS) {
                const [a, b, c] = pattern;
                if (state.status[a] && state.status[a] === state.status[b] && state.status[a] === state.status[c]) {
                    return state.status[a] === 'O' ? 10000 + depth : -10000 - depth;
                }
            }
        }
        // Terminal: empate no macro
        if (state.status.every(s => s)) return 0;
        // Profundidade limite: avaliar heuristicamente
        if (depth === 0) return evaluate(state);

        const moves = getValidMoves(state);
        if (moves.length === 0) return evaluate(state);

        const player = isMaximizing ? 'O' : 'X';
        const ordered = orderMoves(moves, state, player);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of ordered) {
                const newState = applyMove(state, move.macroIdx, move.microIdx, 'O');
                const val = minimax(newState, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, val);
                alpha = Math.max(alpha, val);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of ordered) {
                const newState = applyMove(state, move.macroIdx, move.microIdx, 'X');
                const val = minimax(newState, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, val);
                beta = Math.min(beta, val);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    // Seleciona a melhor jogada via Minimax
    function aiMoveMinimax(maxDepth) {
        const state = cloneState();
        const moves = getValidMoves(state);
        if (moves.length === 0) return;

        const ordered = orderMoves(moves, state, 'O');
        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of ordered) {
            const newState = applyMove(state, move.macroIdx, move.microIdx, 'O');
            const score = minimax(newState, maxDepth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }

        const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        handleMicroCellClick(move.macroIdx, move.microIdx);
    }

    // Dispatcher: escolhe IA conforme dificuldade
    function aiMoveMacro() {
        if (difficulty === 'easy') {
            aiMoveHeuristic();
        } else if (difficulty === 'medium') {
            aiMoveMinimax(3);
        } else {
            aiMoveMinimax(5);
        }
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

    difficultySelect && difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
        restartGame();
    });

    restartBtn.addEventListener('click', restartGame);

    // Inicialização
    restartGame();
});
