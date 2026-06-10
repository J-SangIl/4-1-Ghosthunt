import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  HelpCircle, 
  Target, 
  Sparkles, 
  BookOpen, 
  Play, 
  Settings
} from 'lucide-react';
import { Coordinate, Ghost, BulletEffect, GameMode, GameStatus, ScoreState } from './types';
import CoordinatePlane from './components/CoordinatePlane';
import ScoreBoard from './components/ScoreBoard';
import GameControls from './components/GameControls';
import GameOverModal from './components/GameOverModal';

export default function App() {
  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [currentMode, setMode] = useState<GameMode>('easy');
  const [lives, setLives] = useState<number>(3);
  const [missCount, setMissCount] = useState<number>(0);
  
  // Scoring
  const [scores, setScores] = useState<ScoreState>({
    easyHighScore: 0,
    easyScore: 0,
    normalHighScore: 0,
    normalScore: 0,
  });

  // Active actors
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [activeBullet, setActiveBullet] = useState<BulletEffect | null>(null);
  
  // Controls & Inputs
  const [inputValue, setInputValue] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showCursorLabel, setShowCursorLabel] = useState<boolean>(true);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  
  // Feedback alerts
  const [hitMessage, setHitMessage] = useState<{ text: string; type: 'success' | 'fail' | 'warn' } | null>(null);

  // Load high scores on mounting
  useEffect(() => {
    try {
      const easyHigh = localStorage.getItem('coord_game_easy_high') || '0';
      const normalHigh = localStorage.getItem('coord_game_normal_high') || '0';
      setScores(prev => ({
        ...prev,
        easyHighScore: parseInt(easyHigh, 10),
        normalHighScore: parseInt(normalHigh, 10),
      }));
    } catch (e) {
      console.warn("localStorage is not available: ", e);
    }
  }, []);

  // Update specific high score in localStorage and state
  const triggerHighScoreSave = (mode: GameMode, currentScore: number) => {
    try {
      if (mode === 'easy') {
        if (currentScore > scores.easyHighScore) {
          localStorage.setItem('coord_game_easy_high', currentScore.toString());
          setScores(prev => ({ ...prev, easyHighScore: currentScore }));
        }
      } else {
        if (currentScore > scores.normalHighScore) {
          localStorage.setItem('coord_game_normal_high', currentScore.toString());
          setScores(prev => ({ ...prev, normalHighScore: currentScore }));
        }
      }
    } catch (e) {
      console.warn("localStorage persistence failed: ", e);
    }
  };

  // Helper coordinate generator (Difficulty scales according to current points)
  // Exclude -10 and 10 and 0 since absolute value limit is 9.5 to avoid clipping boundaries.
  const getRandomCoordinateValue = (currentScore: number): number => {
    if (currentScore <= 5) {
      // Spawn only on integer coordinates from -9 to 9 (exclude -10, 10, and 0)
      let value = 0;
      while (value === 0) {
        value = Math.floor(Math.random() * 19) - 9; // -9 to 9
      }
      return value;
    } else {
      // 6 points or above: decimal coordinates allowed from -9.5 to 9.5 (exclude -10, 10, and 0)
      let value = 0;
      while (value === 0) {
        const stepIndex = Math.floor(Math.random() * 39) - 19; // -19 to 19
        value = stepIndex * 0.5; // -9.5 to 9.5 with 0.5 step
      }
      return value;
    }
  };

  // Spawns a new ghost at valid target coordinates
  const spawnNewGhost = (scoreForDiff: number) => {
    const x = getRandomCoordinateValue(scoreForDiff);
    const y = getRandomCoordinateValue(scoreForDiff);
    
    // Normal Mode survival duration scales down as point score increases (harder!)
    const currentScore = currentMode === 'easy' ? scores.easyScore : scores.normalScore;
    const maxTime = Math.max(5, 12 - currentScore * 0.4); // starts at 12s, decreases down to minimum 5s

    const newGhost: Ghost = {
      id: `ghost-${Date.now()}-${Math.random()}`,
      x,
      y,
      timeLeft: maxTime,
      maxTime,
      spawnedAt: Date.now(),
    };

    setGhosts([newGhost]);
  };

  // Starts general game session
  const handleStartGame = () => {
    setLives(3);
    setMissCount(0);
    setInputValue('');
    setInputError(null);
    setHitMessage(null);
    
    // reset current scoring
    setScores(prev => ({
      ...prev,
      easyScore: 0,
      normalScore: 0,
    }));

    // Spawn first target
    const targetScore = 0;
    setGameStatus('playing');
    
    // Use timeout to let state settle before spawning
    setTimeout(() => {
      const initialScore = 0;
      // We read currentMode inside spawn since state is set
      const x = getRandomCoordinateValue(initialScore);
      const y = getRandomCoordinateValue(initialScore);
      const isEasy = currentMode === 'easy';
      const maxTime = 12;

      const newGhost: Ghost = {
        id: `ghost-${Date.now()}`,
        x,
        y,
        timeLeft: maxTime,
        maxTime,
        spawnedAt: Date.now(),
      };
      setGhosts([newGhost]);
    }, 50);
  };

  // Resets sessions and returns to welcome dashboard
  const handleResetGame = () => {
    setGameStatus('idle');
    setGhosts([]);
    setActiveBullet(null);
    setInputValue('');
    setMissCount(0);
    setInputError(null);
    setHitMessage(null);
  };

  // Normal Mode Real-time Timer Tick Interval
  useEffect(() => {
    if (gameStatus !== 'playing' || currentMode !== 'normal') return;

    const timer = setInterval(() => {
      setGhosts(prevGhosts => {
        if (prevGhosts.length === 0) return prevGhosts;

        const activeGhost = prevGhosts[0];
        const nextTime = activeGhost.timeLeft - 0.1;

        if (nextTime <= 0) {
          // Time's up! Ghost survived! Player loses life.
          handleGhostTimeout();
          return [];
        }

        return [{
          ...activeGhost,
          timeLeft: nextTime,
        }];
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameStatus, currentMode, lives]);

  // Handles normal mode timeout trigger
  const handleGhostTimeout = () => {
    // Screen shake on penalty
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 400);

    setHitMessage({
      text: "⏱️ 시간 초과! 유령이 웃으며 도망치고 체력이 1 깎였어!",
      type: 'fail'
    });

    const nextLives = lives - 1;
    setLives(nextLives);

    if (nextLives <= 0) {
      setGameStatus('gameover');
      triggerHighScoreSave('normal', scores.normalScore);
    } else {
      // Spawn standard replacement ghost
      setTimeout(() => {
        spawnNewGhost(scores.normalScore);
      }, 1000);
    }
  };

  // Core ballistic missile/bullet firing trigger
  const handleFire = (input: string) => {
    if (activeBullet) return; // Prevent double trigger during flight

    // 1. Clean input
    const cleaned = input.replace(/[\s()]/g, '');
    const parts = cleaned.split(',');

    if (parts.length !== 2) {
      setInputError('X와 Y 좌표를 쉼표(,)로 구분해 꼭 두 자리 입력해줘! 예) 3, -4');
      return;
    }

    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);

    if (isNaN(x) || isNaN(y)) {
      setInputError('올바른 정수 또는 소수를 입력해줘! 예) 2.5, -4');
      return;
    }

    if (x < -10 || x > 10 || y < -10 || y > 10) {
      setInputError('좌표 범위를 초과했어! X와 Y 숫자는 -10에서 10 사이여야 해.');
      return;
    }

    // Determine current targets
    if (ghosts.length === 0) return;
    const targetGhost = ghosts[0];

    // Decimal matches check - ghost coordinates could be decimal (e.g. 1.5, -3.5)
    const isMatched = targetGhost.x === x && targetGhost.y === y;

    // 2. Set projectile event
    const bulletId = `bullet-${Date.now()}`;
    setActiveBullet({
      id: bulletId,
      x,
      y,
      status: 'flying',
      isHit: isMatched,
      timestamp: Date.now()
    });

    // Reset input text bar
    setInputValue('');

    // 3. Projectile sequence timers
    // Flight period triggers for 400ms
    setTimeout(() => {
      // Transition from flying to exploding
      setActiveBullet(prev => prev ? { ...prev, status: 'exploding' } : null);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400);

      if (isMatched) {
        // Strike HIT!
        setHitMessage({
          text: `🎯 명중! (${x}, ${y}) 좌표의 유령을 소탕했어! 점수 +1점!`,
          type: 'success'
        });
        setMissCount(0); // Reset incorrect consecutive fires

        // Update score based on mode
        if (currentMode === 'easy') {
          const nextScore = scores.easyScore + 1;
          setScores(prev => ({ ...prev, easyScore: nextScore }));
          triggerHighScoreSave('easy', nextScore);
          
          // Respawn instantly
          setTimeout(() => {
            spawnNewGhost(nextScore);
          }, 600);
        } else {
          const nextScore = scores.normalScore + 1;
          setScores(prev => ({ ...prev, normalScore: nextScore }));
          triggerHighScoreSave('normal', nextScore);
          
          // Respawn instantly
          setTimeout(() => {
            spawnNewGhost(nextScore);
          }, 600);
        }

      } else {
        // MISS!
        const nextMissCount = missCount + 1;
        
        if (nextMissCount >= 3) {
          // 3 consecutive misses penalty
          setScores(prev => {
            const currentScore = currentMode === 'easy' ? prev.easyScore : prev.normalScore;
            return prev;
          });

          setHitMessage({
            text: `💥 3번 연속 오답! 눈금 분석 실수로 체력(❤️)이 1 깎였어!`,
            type: 'warn'
          });
          setMissCount(0);
          
          const nextLives = lives - 1;
          setLives(nextLives);

          if (nextLives <= 0) {
            setGameStatus('gameover');
            const finalScore = currentMode === 'easy' ? scores.easyScore : scores.normalScore;
            triggerHighScoreSave(currentMode, finalScore);
          }
        } else {
          // Standard increment miss count
          setMissCount(nextMissCount);
          setHitMessage({
            text: `💨 빗나갔어! 미사일이 다른 엉뚱한 위치인 (${x}, ${y}) 좌표로 떨어졌어! (오답 ${nextMissCount}/3)`,
            type: 'fail'
          });
        }
      }
    }, 400);

    // Fade bullet completely after explosion completes (900ms total)
    setTimeout(() => {
      setActiveBullet(null);
    }, 900);
  };

  return (
    <div className={`min-h-screen text-slate-800 p-3 sm:p-5 flex flex-col md:justify-center items-center relative overflow-x-hidden ${screenShake ? 'shake-animation' : ''}`}>
      
      {/* Decorative stars layer */}
      <div className="absolute top-4 left-6 opacity-20 pointer-events-none select-none hidden lg:block">
        <Sparkles className="w-16 h-16 text-yellow-400 rotate-12" />
      </div>
      <div className="absolute bottom-8 right-8 opacity-20 pointer-events-none select-none hidden lg:block">
        <Compass className="w-24 h-24 text-teal-400 -rotate-45" />
      </div>

      {/* Main Responsive Grid Layout inside standard view port container */}
      <div className="w-full max-w-7xl flex flex-col gap-4 z-10 px-2 sm:px-4">
        
        {/* Playful Educational Header Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-center bg-white/80 backdrop-blur border-b-4 border-teal-500 p-4 rounded-2xl shadow-sm gap-3">
          <div className="flex items-center gap-2">
            <span className="text-4xl animate-bounce">👻</span>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black font-jua text-teal-950 flex items-center gap-1.5 min-w-max">
                좌표평면 유령 잡기
              </h1>
            </div>
          </div>
        </header>

        {/* Action Panel Split (Left: Space Grid Coordinate Board, Right: HUD dashboard Controls) */}
        {gameStatus === 'idle' ? (
          /* Simple Mode Selection Card */
          <div className="max-w-md mx-auto w-full bg-white/95 rounded-3xl border-4 border-emerald-500 p-6 sm:p-8 shadow-2xl text-center flex flex-col gap-6 animate-fade-in my-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-slate-900 font-jua flex justify-center items-center gap-1.5 pt-2">
                <span>게임 난이도 선택</span>
              </h2>
            </div>

            {/* Mode selection buttons */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setMode('easy')}
                className={`py-4 px-4 rounded-2xl border-2 font-jua text-base transition-all text-center cursor-pointer flex justify-between items-center ${
                  currentMode === 'easy'
                    ? 'bg-amber-50 border-amber-400 text-amber-800 font-bold shadow-md ring-2 ring-amber-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>🌱 연습 모드</span>
                {currentMode === 'easy' && <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">선택됨</span>}
              </button>
              <button 
                onClick={() => setMode('normal')}
                className={`py-4 px-4 rounded-2xl border-2 font-jua text-base transition-all text-center cursor-pointer flex justify-between items-center ${
                  currentMode === 'normal'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-bold shadow-md ring-2 ring-indigo-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>⏱️ 일반 시간제한 모드</span>
                {currentMode === 'normal' && <span className="text-xs bg-indigo-200 text-indigo-900 font-bold px-2.5 py-0.5 rounded-full">선택됨</span>}
              </button>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-jua text-lg rounded-2xl cursor-pointer shadow-lg hover:scale-[1.01] transition-all text-center border-b-4 border-emerald-800 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white animate-pulse" />
              <span>게임 시작</span>
            </button>
          </div>
        ) : (
          /* Active Gameplay screen layout Split */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch justify-center">
            
            {/* Left side: Coordinate core plane (takes 8 columns in lg size) */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center gap-3">
              <CoordinatePlane
                ghosts={ghosts}
                activeBullet={activeBullet}
                currentMode={currentMode}
                gameStatus={gameStatus}
                showCursorLabel={showCursorLabel}
              />
            </div>

            {/* Right side: Information and operation dashboards (takes 4 columns in lg size) */}
            <div className="lg:col-span-4 flex flex-col gap-4 w-full justify-start">
              
              {/* Dynamic visual hit message HUD banner alerts inside right column */}
              {hitMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl border font-jua text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-sm ${
                    hitMessage.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                      : hitMessage.type === 'warn'
                        ? 'bg-rose-100 border-rose-300 text-rose-800 animate-pulse'
                        : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                >
                  <span>
                    {hitMessage.type === 'success' ? '🔮' : hitMessage.type === 'warn' ? '🚨' : '💨'}
                  </span>
                  <span className="leading-tight">{hitMessage.text}</span>
                  <button 
                    onClick={() => setHitMessage(null)} 
                    className="text-xs ml-auto underline text-slate-500 opacity-70 hover:opacity-100"
                  >
                    닫기
                  </button>
                </motion.div>
              )}

              {/* Score states */}
              <ScoreBoard
                scoreState={scores}
                currentMode={currentMode}
                lives={lives}
                missCount={missCount}
              />

              {/* Firing, inputs & form controls */}
              <GameControls
                inputValue={inputValue}
                setInputValue={setInputValue}
                onFire={handleFire}
                gameStatus={gameStatus}
                onStartGame={handleStartGame}
                onResetGame={handleResetGame}
                currentMode={currentMode}
                setMode={setMode}
                showCursorLabel={showCursorLabel}
                setShowCursorLabel={setShowCursorLabel}
                inputError={inputError}
                setInputError={setInputError}
              />
              
            </div>

          </div>
        )}

        {/* Informative footer */}
        <footer className="text-center text-xs text-teal-800 mt-2 font-medium bg-teal-50 inline-block mx-auto px-4 py-2 rounded-full border border-teal-100 shadow-inner">
          © 2026 석관중학교 JSI
        </footer>
      </div>

      {/* Game Over modal overlay */}
      <GameOverModal
        isOpen={gameStatus === 'gameover'}
        score={currentMode === 'easy' ? scores.easyScore : scores.normalScore}
        highScore={currentMode === 'easy' ? scores.easyHighScore : scores.normalHighScore}
        currentMode={currentMode}
        onRestart={handleStartGame}
      />
    </div>
  );
}

