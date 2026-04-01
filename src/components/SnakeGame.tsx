import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCcw, Play } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 120;

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string };

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  return newFood;
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    direction: { x: 0, y: -1 },
    nextDirection: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    score: 0,
    highScore: 0,
    gameOver: false,
    isPaused: true,
    hasStarted: false,
    particles: [] as Particle[],
    shake: 0,
    lastMoveTime: 0
  });

  const [uiState, setUiState] = useState({
    score: 0,
    highScore: 0,
    gameOver: false,
    isPaused: true,
    hasStarted: false,
  });

  const syncUI = useCallback(() => {
    setUiState({
      score: state.current.score,
      highScore: state.current.highScore,
      gameOver: state.current.gameOver,
      isPaused: state.current.isPaused,
      hasStarted: state.current.hasStarted,
    });
  }, []);

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      state.current.particles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: Math.random() * 20 + 10,
        color
      });
    }
  };

  const resetGame = () => {
    state.current = {
      ...state.current,
      snake: [{ x: 10, y: 10 }],
      direction: { x: 0, y: -1 },
      nextDirection: { x: 0, y: -1 },
      score: 0,
      gameOver: false,
      isPaused: false,
      hasStarted: true,
      particles: [],
      shake: 0
    };
    state.current.food = generateFood(state.current.snake);
    syncUI();
  };

  const togglePause = () => {
    if (state.current.gameOver || !state.current.hasStarted) return;
    state.current.isPaused = !state.current.isPaused;
    syncUI();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === ' ' && state.current.hasStarted) {
      togglePause();
      return;
    }

    const currentDir = state.current.direction;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (currentDir.y !== 1) state.current.nextDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (currentDir.y !== -1) state.current.nextDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (currentDir.x !== 1) state.current.nextDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (currentDir.x !== -1) state.current.nextDirection = { x: 1, y: 0 };
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameLoop = useCallback((time: number) => {
    const s = state.current;
    
    if (!s.isPaused && !s.gameOver && s.hasStarted) {
      const speed = Math.max(50, INITIAL_SPEED - s.score * 2);
      if (time - s.lastMoveTime >= speed) {
        s.direction = s.nextDirection;
        const head = s.snake[0];
        const newHead = { x: head.x + s.direction.x, y: head.y + s.direction.y };
        
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE || 
            s.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          s.gameOver = true;
          s.shake = 20;
          syncUI();
        } else {
          s.snake.unshift(newHead);
          if (newHead.x === s.food.x && newHead.y === s.food.y) {
            s.score += 10;
            if (s.score > s.highScore) s.highScore = s.score;
            s.food = generateFood(s.snake);
            s.shake = 5;
            spawnParticles(newHead.x, newHead.y, '#ff00ff');
            syncUI();
          } else {
            s.snake.pop();
          }
        }
        s.lastMoveTime = time;
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00ff';
        ctx.fillRect(s.food.x * CELL_SIZE + 2, s.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        ctx.shadowBlur = 0;

        s.snake.forEach((seg, i) => {
          ctx.fillStyle = i === 0 ? '#ffffff' : '#00ffff';
          ctx.shadowBlur = i === 0 ? 10 : 0;
          ctx.shadowColor = '#00ffff';
          ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        });
        ctx.shadowBlur = 0;

        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          } else {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 1 - (p.life / p.maxLife);
            ctx.fillRect(p.x, p.y, 4, 4);
            ctx.globalAlpha = 1.0;
          }
        }
      }
    }

    if (s.shake > 0) {
      s.shake--;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [syncUI]);

  useEffect(() => {
    state.current.food = generateFood(state.current.snake);
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  const shakeStyle = state.current.shake > 0 ? {
    transform: `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`
  } : {};

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Score Board */}
      <div className="flex gap-8 bg-black p-4 border-4 border-[#00ffff] shadow-[8px_8px_0px_#ff00ff] w-full justify-center relative overflow-hidden">
        <div className="absolute inset-0 scanlines opacity-50"></div>
        <div className="flex flex-col items-center z-10">
          <span className="text-xs text-[#ff00ff] font-pixel tracking-widest mb-1">SCORE_REGISTER</span>
          <span 
            className="text-5xl sm:text-6xl font-digital text-[#00ffff] glitch-effect"
            data-text={uiState.score.toString().padStart(4, '0')}
          >
            {uiState.score.toString().padStart(4, '0')}
          </span>
        </div>
        <div className="w-1 bg-[#ff00ff] z-10"></div>
        <div className="flex flex-col items-center z-10">
          <span className="text-xs text-[#00ffff] font-pixel tracking-widest mb-1 flex items-center gap-1">
            <Trophy size={12} /> MAX_OVERFLOW
          </span>
          <span 
            className="text-5xl sm:text-6xl font-digital text-[#ff00ff] glitch-effect"
            data-text={uiState.highScore.toString().padStart(4, '0')}
          >
            {uiState.highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative bg-black border-4 border-[#ff00ff] shadow-[8px_8px_0px_#00ffff] p-1 w-full aspect-square max-w-[500px]" style={shakeStyle}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full bg-black block"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Overlays */}
        {(!uiState.hasStarted || uiState.gameOver || uiState.isPaused) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <div className="absolute inset-0 scanlines"></div>
            <div className="z-30 flex flex-col items-center">
              {uiState.gameOver ? (
                <>
                  <h2 
                    className="text-5xl sm:text-6xl font-digital text-[#ff00ff] mb-2 glitch-effect"
                    data-text="CRITICAL_FAILURE"
                  >
                    CRITICAL_FAILURE
                  </h2>
                  <p className="text-[#00ffff] mb-6 font-pixel text-sm">DATA_LOST: {uiState.score}</p>
                  <button 
                    onClick={resetGame}
                    className="flex items-center gap-2 px-6 py-3 bg-black border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black font-pixel tracking-wider shadow-[4px_4px_0px_#ff00ff] transition-colors"
                  >
                    <RotateCcw size={16} /> REBOOT_SYSTEM
                  </button>
                </>
              ) : !uiState.hasStarted ? (
                <>
                  <h2 
                    className="text-5xl sm:text-6xl font-digital text-[#00ffff] mb-6 glitch-effect"
                    data-text="INITIALIZING..."
                  >
                    INITIALIZING...
                  </h2>
                  <button 
                    onClick={resetGame}
                    className="flex items-center gap-2 px-8 py-4 bg-black border-2 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black font-pixel tracking-wider shadow-[4px_4px_0px_#00ffff] transition-colors text-sm"
                  >
                    <Play size={16} fill="currentColor" /> EXECUTE_PROGRAM
                  </button>
                </>
              ) : uiState.isPaused ? (
                <>
                  <h2 
                    className="text-5xl sm:text-6xl font-digital text-[#00ffff] mb-6 glitch-effect"
                    data-text="SYSTEM_HALTED"
                  >
                    SYSTEM_HALTED
                  </h2>
                  <button 
                    onClick={togglePause}
                    className="flex items-center gap-2 px-8 py-4 bg-black border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black font-pixel tracking-wider shadow-[4px_4px_0px_#ff00ff] transition-colors text-sm"
                  >
                    <Play size={16} fill="currentColor" /> RESUME_PROCESS
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-[#00ffff] text-xs font-pixel flex flex-col sm:flex-row gap-4 sm:gap-6 items-center mt-2 bg-black p-4 border-2 border-[#ff00ff] shadow-[4px_4px_0px_#00ffff]">
        <span>INPUT_DIR: <kbd className="bg-black px-2 py-1 text-[#ff00ff] border border-[#ff00ff]">W A S D</kbd> / <kbd className="bg-black px-2 py-1 text-[#ff00ff] border border-[#ff00ff]">ARROWS</kbd></span>
        <span className="hidden sm:inline w-2 h-2 bg-[#00ffff]"></span>
        <span>INTERRUPT: <kbd className="bg-black px-2 py-1 text-[#00ffff] border border-[#00ffff]">SPACE</kbd></span>
      </div>
    </div>
  );
}
