import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';

const WIN_CONDITIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],            // Diagonals
];

const COLORS = {
  bg: '#0A0519',
  cardBg: '#17122A',
  cardHover: '#2A2343',
  xColor: '#1892EA',
  oColor: '#A737FF',
  white: '#FFFFFF',
  border: '#2A2343',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH * 0.85, 320);
const CELL_SIZE = (BOARD_SIZE - 24) / 3;

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [selectedPlayer, setSelectedPlayer] = useState('X');
  const [gameMode, setGameMode] = useState('1P'); // '1P' = vs AI, '2P' = vs Player
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningCells, setWinningCells] = useState([]);

  const checkWinner = useCallback((cells, player) => {
    for (const [a, b, c] of WIN_CONDITIONS) {
      if (cells[a] === player && cells[b] === player && cells[c] === player) {
        return [a, b, c];
      }
    }
    return null;
  }, []);

  // ── AI Logic ──────────────────────────────────────────────

  // Minimax algorithm for unbeatable AI (Hard mode)
  const minimax = useCallback((cells, isMaximizing, aiPlayer, humanPlayer) => {
    // Check terminal states
    if (checkWinner(cells, aiPlayer)) return { score: 10 };
    if (checkWinner(cells, humanPlayer)) return { score: -10 };
    const emptyCells = cells.map((c, i) => (c === '' ? i : null)).filter((i) => i !== null);
    if (emptyCells.length === 0) return { score: 0 };

    if (isMaximizing) {
      let best = { score: -Infinity, index: -1 };
      for (const i of emptyCells) {
        const newCells = [...cells];
        newCells[i] = aiPlayer;
        const result = minimax(newCells, false, aiPlayer, humanPlayer);
        if (result.score > best.score) {
          best = { score: result.score, index: i };
        }
      }
      return best;
    } else {
      let best = { score: Infinity, index: -1 };
      for (const i of emptyCells) {
        const newCells = [...cells];
        newCells[i] = humanPlayer;
        const result = minimax(newCells, true, aiPlayer, humanPlayer);
        if (result.score < best.score) {
          best = { score: result.score, index: i };
        }
      }
      return best;
    }
  }, [checkWinner]);

  // Find a winning move for a given player
  const findWinningMove = useCallback((cells, player) => {
    for (const [a, b, c] of WIN_CONDITIONS) {
      const line = [cells[a], cells[b], cells[c]];
      const playerCount = line.filter((v) => v === player).length;
      const emptyCount = line.filter((v) => v === '').length;
      if (playerCount === 2 && emptyCount === 1) {
        return [a, b, c].find((idx) => cells[idx] === '');
      }
    }
    return null;
  }, []);

  // Pick AI move based on difficulty
  const getAiMove = useCallback((currentBoard, aiPlayer, humanPlayer) => {
    const emptyCells = currentBoard
      .map((cell, i) => (cell === '' ? i : null))
      .filter((i) => i !== null);

    if (emptyCells.length === 0) return -1;

    if (difficulty === 'easy') {
      // Easy: pure random
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    if (difficulty === 'medium') {
      // Medium: win if possible → block opponent → take center → take corner → random
      const winMove = findWinningMove(currentBoard, aiPlayer);
      if (winMove !== null && winMove !== undefined) return winMove;

      const blockMove = findWinningMove(currentBoard, humanPlayer);
      if (blockMove !== null && blockMove !== undefined) return blockMove;

      if (currentBoard[4] === '') return 4; // center

      const corners = [0, 2, 6, 8].filter((i) => currentBoard[i] === '');
      if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Hard: minimax (unbeatable)
    const result = minimax(currentBoard, true, aiPlayer, humanPlayer);
    return result.index;
  }, [difficulty, minimax, findWinningMove]);

  // Execute AI move and update board state
  const aiMove = useCallback((newBoard, aiPlayer) => {
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
    const moveIndex = getAiMove(newBoard, aiPlayer, humanPlayer);
    if (moveIndex === -1) return;

    const updatedBoard = [...newBoard];
    updatedBoard[moveIndex] = aiPlayer;

    const winResult = checkWinner(updatedBoard, aiPlayer);
    if (winResult) {
      setBoard(updatedBoard);
      setWinner(aiPlayer);
      setWinningCells(winResult);
      setIsPaused(true);
      return;
    }

    if (updatedBoard.every((cell) => cell !== '')) {
      setBoard(updatedBoard);
      setIsDraw(true);
      setIsPaused(true);
      return;
    }

    setBoard(updatedBoard);
    setCurrentPlayer(humanPlayer);
  }, [checkWinner, getAiMove]);

  const tapCell = useCallback((index) => {
    if (board[index] !== '' || isPaused) return;

    setIsGameStarted(true);
    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    const winResult = checkWinner(newBoard, currentPlayer);
    if (winResult) {
      setBoard(newBoard);
      setWinner(currentPlayer);
      setWinningCells(winResult);
      setIsPaused(true);
      return;
    }

    if (newBoard.every((cell) => cell !== '')) {
      setBoard(newBoard);
      setIsDraw(true);
      setIsPaused(true);
      return;
    }

    setBoard(newBoard);
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);

    // AI move after a short delay (only in 1P mode)
    if (gameMode === '1P') {
      setTimeout(() => {
        aiMove(newBoard, nextPlayer);
      }, 300);
    }
  }, [board, currentPlayer, isPaused, checkWinner, aiMove, gameMode]);

  const choosePlayer = useCallback((player) => {
    if (isGameStarted) return;
    setSelectedPlayer(player);
    setCurrentPlayer(player);
  }, [isGameStarted]);

  const chooseMode = useCallback((mode) => {
    if (isGameStarted) return;
    setGameMode(mode);
  }, [isGameStarted]);

  const restart = useCallback(() => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer(selectedPlayer);
    setIsGameStarted(false);
    setIsPaused(false);
    setWinner(null);
    setIsDraw(false);
    setWinningCells([]);
  }, [selectedPlayer]);

  const getHeaderText = () => {
    if (winner) return `${winner} Wins!`;
    if (isDraw) return 'Draw!';
    if (isGameStarted) return `${currentPlayer}'s Turn`;
    return 'Choose';
  };

  const renderCell = (index) => {
    const cellValue = board[index];
    const isWinning = winningCells.includes(index);
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.cell,
          isWinning && styles.cellWinning,
        ]}
        activeOpacity={0.7}
        onPress={() => tapCell(index)}
      >
        <Text
          style={[
            styles.cellText,
            cellValue === 'X' && styles.xText,
            cellValue === 'O' && styles.oText,
          ]}
        >
          {cellValue}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header - Player Selection */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.playerBtn,
            selectedPlayer === 'X' && styles.playerActive,
          ]}
          activeOpacity={0.7}
          onPress={() => choosePlayer('X')}
        >
          <Text style={[styles.playerText, styles.xText]}>X</Text>
        </TouchableOpacity>

        <Text style={styles.titleHeader}>{getHeaderText()}</Text>

        <TouchableOpacity
          style={[
            styles.playerBtn,
            selectedPlayer === 'O' && styles.playerActive,
          ]}
          activeOpacity={0.7}
          onPress={() => choosePlayer('O')}
        >
          <Text style={[styles.playerText, styles.oText]}>O</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Selection */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeBtn,
            gameMode === '1P' && styles.modeBtnActive,
          ]}
          activeOpacity={0.7}
          onPress={() => chooseMode('1P')}
        >
          <Text style={[
            styles.modeBtnText,
            gameMode === '1P' && styles.modeBtnTextActive,
          ]}>1 Player</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeBtn,
            gameMode === '2P' && styles.modeBtnActive,
          ]}
          activeOpacity={0.7}
          onPress={() => chooseMode('2P')}
        >
          <Text style={[
            styles.modeBtnText,
            gameMode === '2P' && styles.modeBtnTextActive,
          ]}>2 Players</Text>
        </TouchableOpacity>
      </View>

      {/* Difficulty Selection (only in 1P mode) */}
      {gameMode === '1P' && (
        <View style={styles.difficultyRow}>
          <TouchableOpacity
            style={[
              styles.diffBtn,
              difficulty === 'easy' && styles.diffBtnActive,
              difficulty === 'easy' && styles.diffBtnEasy,
            ]}
            activeOpacity={0.7}
            onPress={() => { if (!isGameStarted) setDifficulty('easy'); }}
          >
            <Text style={[
              styles.diffBtnText,
              difficulty === 'easy' && styles.diffBtnTextActive,
            ]}>Easy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.diffBtn,
              difficulty === 'medium' && styles.diffBtnActive,
              difficulty === 'medium' && styles.diffBtnMedium,
            ]}
            activeOpacity={0.7}
            onPress={() => { if (!isGameStarted) setDifficulty('medium'); }}
          >
            <Text style={[
              styles.diffBtnText,
              difficulty === 'medium' && styles.diffBtnTextActive,
            ]}>Medium</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.diffBtn,
              difficulty === 'hard' && styles.diffBtnActive,
              difficulty === 'hard' && styles.diffBtnHard,
            ]}
            activeOpacity={0.7}
            onPress={() => { if (!isGameStarted) setDifficulty('hard'); }}
          >
            <Text style={[
              styles.diffBtnText,
              difficulty === 'hard' && styles.diffBtnTextActive,
            ]}>Hard</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Board */}
      <View style={styles.board}>
        <View style={styles.row}>
          {renderCell(0)}
          {renderCell(1)}
          {renderCell(2)}
        </View>
        <View style={styles.row}>
          {renderCell(3)}
          {renderCell(4)}
          {renderCell(5)}
        </View>
        <View style={styles.row}>
          {renderCell(6)}
          {renderCell(7)}
          {renderCell(8)}
        </View>
      </View>

      {/* Restart Button */}
      {(winner || isDraw) && (
        <TouchableOpacity
          style={styles.restartBtn}
          activeOpacity={0.7}
          onPress={restart}
        >
          <Text style={styles.restartText}>Restart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    width: 235,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  playerBtn: {
    backgroundColor: COLORS.cardBg,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.cardBg,
    opacity: 0.5,
  },
  playerActive: {
    opacity: 1,
    borderColor: COLORS.border,
  },
  playerText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  titleHeader: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    width: 235,
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBg,
    opacity: 0.5,
  },
  modeBtnActive: {
    opacity: 1,
    borderColor: COLORS.border,
  },
  modeBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  modeBtnTextActive: {
    opacity: 1,
  },
  difficultyRow: {
    flexDirection: 'row',
    width: 235,
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  diffBtn: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBg,
    opacity: 0.4,
  },
  diffBtnActive: {
    opacity: 1,
  },
  diffBtnEasy: {
    borderColor: '#2ECC71',
  },
  diffBtnMedium: {
    borderColor: '#F39C12',
  },
  diffBtnHard: {
    borderColor: '#E74C3C',
  },
  diffBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  diffBtnTextActive: {
    opacity: 1,
  },
  board: {
    width: BOARD_SIZE,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  cell: {
    backgroundColor: COLORS.cardBg,
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellWinning: {
    backgroundColor: COLORS.cardHover,
  },
  cellText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  xText: {
    color: COLORS.xColor,
  },
  oText: {
    color: COLORS.oColor,
  },
  restartBtn: {
    marginTop: 30,
    width: 235,
    backgroundColor: COLORS.cardBg,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  restartText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
