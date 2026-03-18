import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiVolume2, FiVolumeX } from 'react-icons/fi';
import './RoadFighter.css';

const RoadFighter = () => {
  const canvasRef = useRef(null);
  const [gameActive, setGameActive] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  
  const gameState = useRef({
    playerX: 255,
    playerY: 450,
    playerWidth: 40,
    playerHeight: 60,
    velocityX: 0,
    enemies: [],
    score: 0,
    gameActive: false,
    speedMultiplier: 1,
  });

  const keysPressed = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let spawnRate = 0;

    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const playSound = (frequency, duration) => {
      if (!soundEnabled) return;
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (e) {
        // Audio context not available
      }
    };

    const update = () => {
      const state = gameState.current;
      
      if (!state.gameActive || gamePaused) return;

      // Player movement with keyboard controls
      if (keysPressed.current['arrowleft'] || keysPressed.current['a']) {
        state.velocityX = Math.max(state.velocityX - 2, -6);
      } else if (keysPressed.current['arrowright'] || keysPressed.current['d']) {
        state.velocityX = Math.min(state.velocityX + 2, 6);
      } else {
        state.velocityX *= 0.85;
      }

      state.playerX += state.velocityX;
      state.playerX = Math.max(10, Math.min(state.playerX, canvas.width - state.playerWidth - 10));

      // Spawn enemies
      spawnRate++;
      const spawnInterval = Math.max(40 - Math.floor(state.score / 100), 20);
      if (spawnRate > spawnInterval) {
        const enemyWidth = 40;
        const enemyX = Math.random() * (canvas.width - enemyWidth);
        state.enemies.push({
          x: enemyX,
          y: -60,
          width: enemyWidth,
          height: 60,
          speed: 3 + state.speedMultiplier,
        });
        spawnRate = 0;
      }

      // Update enemies
      state.enemies = state.enemies.filter((enemy) => {
        enemy.y += enemy.speed * state.speedMultiplier;
        
        // Collision detection
        if (
          state.playerX < enemy.x + enemy.width &&
          state.playerX + state.playerWidth > enemy.x &&
          state.playerY < enemy.y + enemy.height &&
          state.playerY + state.playerHeight > enemy.y
        ) {
          setGameOver(true);
          state.gameActive = false;
          playSound(200, 0.3);
          return false;
        }

        // Score point for passing enemy
        if (enemy.y > state.playerY && !enemy.scored) {
          enemy.scored = true;
          state.score += 10;
          setScore(state.score);
          playSound(800, 0.1);
          
          // Increase difficulty
          if (state.score % 100 === 0) {
            state.speedMultiplier += 0.2;
          }
        }

        return enemy.y < canvas.height;
      });
    };

    const draw = () => {
      const state = gameState.current;
      
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road markings
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw player
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 15;
      ctx.fillRect(state.playerX, state.playerY, state.playerWidth, state.playerHeight);
      ctx.shadowBlur = 0;

      // Draw player window
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(state.playerX + 8, state.playerY + 10, 24, 20);

      // Draw enemies
      ctx.fillStyle = '#3b82f6';
      state.enemies.forEach((enemy) => {
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.shadowBlur = 0;

        // Enemy window
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(enemy.x + 8, enemy.y + 10, 24, 20);
        ctx.fillStyle = '#3b82f6';
      });
    };

    const gameLoop = () => {
      if (gameState.current.gameActive) {
        update();
      }
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePaused, soundEnabled]);

  const startGame = () => {
    gameState.current = {
      playerX: 255,
      playerY: 450,
      playerWidth: 40,
      playerHeight: 60,
      velocityX: 0,
      enemies: [],
      score: 0,
      gameActive: true,
      speedMultiplier: 1,
    };
    setScore(0);
    setGameActive(true);
    setGameOver(false);
    setGamePaused(false);
  };

  const togglePause = () => {
    if (gameActive && !gameOver) {
      setGamePaused(!gamePaused);
    }
  };

  const resetGame = () => {
    gameState.current.gameActive = false;
    setGameActive(false);
    setGamePaused(false);
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="road-fighter-container">
      <div className="road-fighter-header">
        <h1>🚗 Road Fighter</h1>
        <p>Navigate through traffic and avoid collisions!</p>
      </div>

      <div className="road-fighter-content">
        <div className="game-wrapper">
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={550}
              height={550}
              className="road-fighter-canvas"
            />
            
            {!gameActive && !gameOver && (
              <div className="start-game-overlay">
                <div className="start-game-content">
                  <h2>🚗 Road Fighter</h2>
                  <p>Navigate through traffic and avoid collisions!</p>
                  <button onClick={startGame} className="btn btn-primary">
                    <FiPlay /> Start Game
                  </button>
                </div>
              </div>
            )}
            
            {gameOver && (
              <div className="game-over-overlay">
                <div className="game-over-content">
                  <h2>Game Over!</h2>
                  <p>Final Score: {score}</p>
                  <button onClick={startGame} className="btn btn-primary">
                    <FiRotateCcw /> Restart Game
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="game-controls">
            {!gameActive ? (
              <button onClick={startGame} className="btn btn-primary">
                <FiPlay /> Start Game
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className={`btn ${gamePaused ? 'btn-success' : 'btn-warning'}`}
                >
                  {gamePaused ? <FiPlay /> : <FiPause />}
                  {gamePaused ? ' Resume' : ' Pause'}
                </button>
                <button onClick={resetGame} className="btn btn-danger">
                  <FiRotateCcw /> Reset
                </button>
              </>
            )}
          </div>
        </div>

        <div className="road-fighter-sidebar">
          <div className="score-display">
            <div className="score-label">Score</div>
            <div className="score-value">{score}</div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-secondary"
          >
            {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
            {soundEnabled ? ' Sound On' : ' Sound Off'}
          </button>

          {gameOver && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <p>Final Score: {score}</p>
            </div>
          )}

          <div className="instructions">
            <h3>How to Play</h3>
            <ul>
              <li>Use ← → Arrow Keys or A/D to move</li>
              <li>Avoid blue cars</li>
              <li>Gain 10 points per car passed</li>
              <li>Game gets harder as you score!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadFighter;
