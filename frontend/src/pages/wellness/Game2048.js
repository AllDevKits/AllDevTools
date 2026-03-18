import React, { useState, useEffect, useCallback } from 'react';
import { FiRotateCcw, FiPlay, FiPause } from 'react-icons/fi';
import './Game2048.css';

const Game2048 = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(parseInt(localStorage.getItem('game2048-bestScore') || '0'));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  function createEmptyGrid() {
    return Array(4).fill().map(() => Array(4).fill(0));
  }

  function addRandomTile(grid) {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) {
          emptyCells.push({ i, j });
        }
      }
    }
    if (emptyCells.length === 0) return grid;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = grid.map(row => [...row]);
    newGrid[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }

  const initializeGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setIsPlaying(true);
  }, []);

  function moveLeft(grid) {
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let scoreIncrease = 0;

    for (let i = 0; i < 4; i++) {
      // Remove zeros and compact
      let row = newGrid[i].filter(cell => cell !== 0);

      // Merge tiles
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          scoreIncrease += row[j];
          row[j + 1] = 0;
          if (row[j] === 2048) setWon(true);
        }
      }

      // Remove zeros again and pad with zeros
      row = row.filter(cell => cell !== 0);
      while (row.length < 4) row.push(0);

      if (JSON.stringify(newGrid[i]) !== JSON.stringify(row)) moved = true;
      newGrid[i] = row;
    }

    return { grid: newGrid, moved, scoreIncrease };
  }

  function moveRight(grid) {
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let scoreIncrease = 0;

    for (let i = 0; i < 4; i++) {
      let row = newGrid[i].filter(cell => cell !== 0);

      for (let j = row.length - 1; j > 0; j--) {
        if (row[j] === row[j - 1]) {
          row[j] *= 2;
          scoreIncrease += row[j];
          row[j - 1] = 0;
          if (row[j] === 2048) setWon(true);
        }
      }

      row = row.filter(cell => cell !== 0);
      while (row.length < 4) row.unshift(0);

      if (JSON.stringify(newGrid[i]) !== JSON.stringify(row)) moved = true;
      newGrid[i] = row;
    }

    return { grid: newGrid, moved, scoreIncrease };
  }

  function moveUp(grid) {
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let scoreIncrease = 0;

    for (let j = 0; j < 4; j++) {
      let column = [];
      for (let i = 0; i < 4; i++) {
        column.push(newGrid[i][j]);
      }
      column = column.filter(cell => cell !== 0);

      for (let i = 0; i < column.length - 1; i++) {
        if (column[i] === column[i + 1]) {
          column[i] *= 2;
          scoreIncrease += column[i];
          column[i + 1] = 0;
          if (column[i] === 2048) setWon(true);
        }
      }

      column = column.filter(cell => cell !== 0);
      while (column.length < 4) column.push(0);

      for (let i = 0; i < 4; i++) {
        if (newGrid[i][j] !== column[i]) moved = true;
        newGrid[i][j] = column[i];
      }
    }

    return { grid: newGrid, moved, scoreIncrease };
  }

  function moveDown(grid) {
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let scoreIncrease = 0;

    for (let j = 0; j < 4; j++) {
      let column = [];
      for (let i = 0; i < 4; i++) {
        column.push(newGrid[i][j]);
      }
      column = column.filter(cell => cell !== 0);

      for (let i = column.length - 1; i > 0; i--) {
        if (column[i] === column[i - 1]) {
          column[i] *= 2;
          scoreIncrease += column[i];
          column[i - 1] = 0;
          if (column[i] === 2048) setWon(true);
        }
      }

      column = column.filter(cell => cell !== 0);
      while (column.length < 4) column.unshift(0);

      for (let i = 0; i < 4; i++) {
        if (newGrid[i][j] !== column[i]) moved = true;
        newGrid[i][j] = column[i];
      }
    }

    return { grid: newGrid, moved, scoreIncrease };
  }

  function canMove(grid) {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) return true;
      }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = grid[i][j];
        if (j < 3 && current === grid[i][j + 1]) return true;
        if (i < 3 && current === grid[i + 1][j]) return true;
      }
    }

    return false;
  }

  const handleKeyPress = useCallback((e) => {
    if (!isPlaying || gameOver || won) return;

    let result;
    switch (e.key) {
      case 'ArrowLeft':
        result = moveLeft(grid);
        break;
      case 'ArrowRight':
        result = moveRight(grid);
        break;
      case 'ArrowUp':
        result = moveUp(grid);
        break;
      case 'ArrowDown':
        result = moveDown(grid);
        break;
      default:
        return;
    }

    if (result.moved) {
      const newGrid = addRandomTile(result.grid);
      setGrid(newGrid);
      setScore(prev => prev + result.scoreIncrease);

      if (!canMove(newGrid)) {
        setGameOver(true);
        setIsPlaying(false);
      }
    }
  }, [grid, isPlaying, gameOver, won]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('game2048-bestScore', score.toString());
    }
  }, [score, bestScore]);

  const getTileClass = (value) => {
    if (value === 0) return 'tile-empty';
    return `tile-${value}`;
  };

  return (
    <div className="game2048">
      <div className="game-header">
        <h1>2048</h1>
        <div className="score-container">
          <div className="score">
            <div className="score-label">SCORE</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="score">
            <div className="score-label">BEST</div>
            <div className="score-value">{bestScore}</div>
          </div>
        </div>
      </div>

      <div className="game-controls">
        <button onClick={initializeGame} className="control-btn">
          <FiPlay /> New Game
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="control-btn">
          {isPlaying ? <FiPause /> : <FiPlay />} {isPlaying ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className="game-board">
        {grid.map((row, i) => (
          <div key={i} className="grid-row">
            {row.map((cell, j) => (
              <div key={`${i}-${j}`} className={`grid-cell ${getTileClass(cell)}`}>
                {cell !== 0 && cell}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="game-instructions">
        <p><strong>HOW TO PLAY:</strong> Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one!</p>
      </div>

      {(gameOver || won) && (
        <div className="game-overlay">
          <div className="game-message">
            <h2>{won ? 'You Win!' : 'Game Over!'}</h2>
            <p>{won ? 'Congratulations! You reached 2048!' : 'No more moves available.'}</p>
            <button onClick={initializeGame} className="play-again-btn">
              <FiRotateCcw /> Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game2048;