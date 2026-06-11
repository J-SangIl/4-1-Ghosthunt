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
import { Coordinate, Ghost, BulletEffect, GameMode, GameStatus, ScoreState, ConditionTargetPoint, MissionCondition } from './types';
import CoordinatePlane from './components/CoordinatePlane';
import ScoreBoard from './components/ScoreBoard';
import GameControls from './components/GameControls';
import GameOverModal from './components/GameOverModal';

// Helper function to generate missions dynamically based on score
const generateMission = (score: number): MissionCondition => {
  // (0점~4점): 좌표로 제시
  if (score <= 4) {
    const targetX = Math.floor(Math.random() * 15) - 7; // -7 to 7
    let targetY = Math.floor(Math.random() * 15) - 7;
    // avoid origin (0,0) too much
    if (targetX === 0 && targetY === 0) targetY = 2;
    return {
      text: `좌표가 (${targetX}, ${targetY})인 점`,
      check: (x, y) => x === targetX && y === targetY
    };
  }

  // (5점~6점): x축 위의 점, y축 위의 점
  if (score <= 6) {
    const isX = Math.random() > 0.5;
    if (isX) {
      return { text: "x축 위에 있는 점", check: (x, y) => y === 0 && x !== 0 };
    } else {
      return { text: "y축 위에 있는 점", check: (x, y) => x === 0 && y !== 0 };
    }
  }

  // (7점~9점): 사분면에 대한 조건('제1사분면 위에 있는 점' 등)
  if (score <= 9) {
    const roll = Math.floor(Math.random() * 4);
    if (roll === 0) {
      return { text: "제1사분면 위에 있는 점", check: (x, y) => x > 0 && y > 0 };
    } else if (roll === 1) {
      return { text: "제2사분면 위에 있는 점", check: (x, y) => x < 0 && y > 0 };
    } else if (roll === 2) {
      return { text: "제3사분면 위에 있는 점", check: (x, y) => x < 0 && y < 0 };
    } else {
      return { text: "제4사분면 위에 있는 점", check: (x, y) => x > 0 && y < 0 };
    }
  }

  // (10점~15점): x좌표 또는 y좌표가 일정한 점들 ('x좌표가 ~~인 점', '(2, -3.5)와 y좌표가 같은 점' 등)
  if (score <= 15) {
    const subType = Math.floor(Math.random() * 3);
    if (subType === 0) {
      const value = Math.floor(Math.random() * 13) - 6; // -6 to 6
      return {
        text: `x좌표가 ${value}인 점`,
        check: (x, y) => x === value
      };
    } else if (subType === 1) {
      const value = Math.floor(Math.random() * 13) - 6; // -6 to 6
      return {
        text: `y좌표가 ${value}인 점`,
        check: (x, y) => y === value
      };
    } else {
      const refX = Math.floor(Math.random() * 13) - 6;
      const refY = (Math.floor(Math.random() * 13) - 6) * 0.5; // Supports decimals in layout
      const isY = Math.random() > 0.5;
      if (isY) {
        return {
          text: `(${refX}, ${refY})와 y좌표가 같은 점`,
          check: (x, y) => y === refY
        };
      } else {
        return {
          text: `(${refX}, ${refY})와 x좌표가 같은 점`,
          check: (x, y) => x === refX
        };
      }
    }
  }

  // (16점~): 모든 종류(일차함수형 대각선 관계 포함)
  let poolType: number;
  if (score > 30) {
    poolType = Math.floor(Math.random() * 6);
  } else {
    // 3번('합이' 조건) 제외: [0, 1, 2, 4, 5] 중 무작위 선택
    const allowedPools = [0, 1, 2, 4, 5];
    poolType = allowedPools[Math.floor(Math.random() * allowedPools.length)];
  }

  if (poolType === 0) {
    return {
      text: "x좌표와 y좌표가 같은 점",
      check: (x, y) => x === y
    };
  } else if (poolType === 1) {
    if (Math.random() > 0.5) {
      return {
        text: "x좌표가 y좌표의 2배인 점",
        check: (x, y) => x === y * 2
      };
    } else {
      return {
        text: "y좌표가 x좌표의 2배인 점",
        check: (x, y) => y === x * 2
      };
    }
  } else if (poolType === 2) {
    const products = [6, 12, -6, -12, 8, -8];
    const prod = products[Math.floor(Math.random() * products.length)];
    return {
      text: `x좌표와 y좌표의 곱이 ${prod}인 점`,
      check: (x, y) => x * y === prod
    };
  } else if (poolType === 3) {
    const sums = [2, 4, -2, -4, 0];
    const sum = sums[Math.floor(Math.random() * sums.length)];
    return {
      text: `x좌표와 y좌표의 합이 ${sum}인 점`,
      check: (x, y) => x + y === sum
    };
  } else if (poolType === 4) {
    // any from 10~15
    const value = Math.floor(Math.random() * 13) - 6;
    if (Math.random() > 0.5) {
      return {
        text: `y좌표가 ${value}인 점`,
        check: (x, y) => y === value
      };
    } else {
      return {
        text: `x좌표가 ${value}인 점`,
        check: (x, y) => x === value
      };
    }
  } else {
    // any from 7~9
    const roll = Math.floor(Math.random() * 4);
    if (roll === 0) return { text: "제1사분면 위에 있는 점", check: (x, y) => x > 0 && y > 0 };
    if (roll === 1) return { text: "제2사분면 위에 있는 점", check: (x, y) => x < 0 && y > 0 };
    if (roll === 2) return { text: "제3사분면 위에 있는 점", check: (x, y) => x < 0 && y < 0 };
    return { text: "제4사분면 위에 있는 점", check: (x, y) => x > 0 && y < 0 };
  }
};

export default function App() {
  // 튜토리얼 진행 상태
  const [activeTutorialMode, setActiveTutorialMode] = useState<'sniper' | 'sweeper' | null>(null);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [sniperTutorialCompleted, setSniperTutorialCompleted] = useState<boolean>(false);
  const [sweeperTutorialCompleted, setSweeperTutorialCompleted] = useState<boolean>(false);
  const [sweeperStepSuccess, setSweeperStepSuccess] = useState<boolean>(false);

  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [currentMode, setCurrentMode] = useState<GameMode>('easy');
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const setMode = (mode: GameMode) => {
    if (gameStatus === 'playing' && mode !== currentMode) {
      setPendingMode(mode);
      setShowConfirmModal(true);
    } else {
      setCurrentMode(mode);
      // 서바이벌 모드로 전환하면 튜토리얼이 자동 종료되게 함
      if (mode === 'normal' || mode === 'condition_survival') {
        setActiveTutorialMode(null);
      }
    }
  };

  const confirmModeChange = (newMode: GameMode) => {
    // 1. Save and conclude score of previous mode
    let prevScore = 0;
    if (currentMode === 'easy') prevScore = scores.easyScore;
    else if (currentMode === 'normal') prevScore = scores.normalScore;
    else if (currentMode === 'condition_practice') prevScore = scores.conditionPracticeScore;
    else if (currentMode === 'condition_survival') prevScore = scores.conditionSurvivalScore;

    triggerHighScoreSave(currentMode, prevScore);

    // 2. Set the new mode
    setCurrentMode(newMode);
    setShowConfirmModal(false);
    setPendingMode(null);

    // 서바이벌 모드로 전환하면 튜토리얼이 자동 종료되게 함
    if (newMode === 'normal' || newMode === 'condition_survival') {
      setActiveTutorialMode(null);
    }

    // 3. Set up the state as if starting a new game in that new mode
    setLives(3);
    setMissCount(0);
    setInputValue('');
    setInputError(null);
    setHitMessage({
      text: "🔄 새로운 작전 모드로 안전하게 전환되어 작전을 원점(0점)부터 다시 시작합니다!",
      type: 'success'
    });

    // Reset scores for all playing modes
    setScores(prev => ({
      ...prev,
      easyScore: 0,
      normalScore: 0,
      conditionScore: 0,
      conditionPracticeScore: 0,
      conditionSurvivalScore: 0,
    }));

    setGameStatus('playing');

    const isConditionMode = newMode === 'condition_practice' || newMode === 'condition_survival';
    if (isConditionMode) {
      setGhosts([]);
      setActiveBullet(null);
      setTimeout(() => {
        setupConditionRound(0);
      }, 50);
    } else {
      setCurrentMission(null);
      setConditionPoints([]);

      setTimeout(() => {
        const initialScore = 0;
        const x = getRandomCoordinateValue(initialScore);
        const y = getRandomCoordinateValue(initialScore);
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
    }
  };

  const [lives, setLives] = useState<number>(3);
  const [missCount, setMissCount] = useState<number>(0);
  
  // Scoring
  const [scores, setScores] = useState<ScoreState>({
    easyHighScore: 0,
    easyScore: 0,
    normalHighScore: 0,
    normalScore: 0,
    conditionHighScore: 0,
    conditionScore: 0,
    conditionPracticeHighScore: 0,
    conditionPracticeScore: 0,
    conditionSurvivalHighScore: 0,
    conditionSurvivalScore: 0,
  });

  // Active actors
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [activeBullet, setActiveBullet] = useState<BulletEffect | null>(null);

  // Condition Matching Mode state
  const [conditionPoints, setConditionPoints] = useState<ConditionTargetPoint[]>([]);
  const [currentMission, setCurrentMission] = useState<MissionCondition | null>(null);
  const [conditionGameState, setConditionGameState] = useState<'selecting' | 'firing' | 'revealed' | 'animating'>('selecting');
  const [activeExplosions, setActiveExplosions] = useState<Coordinate[]>([]);
  const [conditionTimeLeft, setConditionTimeLeft] = useState<number>(10);
  
  // Controls & Inputs
  const [inputValue, setInputValue] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showCursorLabel, setShowCursorLabel] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  
  // Feedback alerts
  const [hitMessage, setHitMessage] = useState<{ text: string; type: 'success' | 'fail' | 'warn' } | null>(null);

  // Load high scores on mounting
  useEffect(() => {
    try {
      const easyHigh = localStorage.getItem('coord_game_easy_high') || '0';
      const normalHigh = localStorage.getItem('coord_game_normal_high') || '0';
      const conditionHigh = localStorage.getItem('coord_game_condition_high') || '0';
      const condPracticeHigh = localStorage.getItem('coord_game_cond_practice_high') || '0';
      const condSurvivalHigh = localStorage.getItem('coord_game_cond_survival_high') || '0';
      
      const sniperDone = localStorage.getItem('coord_game_sniper_tutorial_completed') === 'true';
      const sweeperDone = localStorage.getItem('coord_game_sweeper_tutorial_completed') === 'true';
      setSniperTutorialCompleted(sniperDone);
      setSweeperTutorialCompleted(sweeperDone);

      setScores(prev => ({
        ...prev,
        easyHighScore: parseInt(easyHigh, 10),
        normalHighScore: parseInt(normalHigh, 10),
        conditionHighScore: parseInt(conditionHigh, 10),
        conditionPracticeHighScore: parseInt(condPracticeHigh, 10),
        conditionSurvivalHighScore: parseInt(condSurvivalHigh, 10),
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
      } else if (mode === 'normal') {
        if (currentScore > scores.normalHighScore) {
          localStorage.setItem('coord_game_normal_high', currentScore.toString());
          setScores(prev => ({ ...prev, normalHighScore: currentScore }));
        }
      } else if (mode === 'condition_practice') {
        if (currentScore > scores.conditionPracticeHighScore) {
          localStorage.setItem('coord_game_cond_practice_high', currentScore.toString());
          setScores(prev => ({ ...prev, conditionPracticeHighScore: currentScore }));
        }
      } else if (mode === 'condition_survival') {
        if (currentScore > scores.conditionSurvivalHighScore) {
          localStorage.setItem('coord_game_cond_survival_high', currentScore.toString());
          setScores(prev => ({ ...prev, conditionSurvivalHighScore: currentScore }));
        }
      } else {
        if (currentScore > scores.conditionHighScore) {
          localStorage.setItem('coord_game_condition_high', currentScore.toString());
          setScores(prev => ({ ...prev, conditionHighScore: currentScore }));
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

  // Setup round specifically for condition matching mode
  const setupConditionRound = (scoreForDiff: number) => {
    let mission = generateMission(scoreForDiff);
    let allCorrectCoords: {x: number, y: number}[] = [];
    let allIncorrectCoords: {x: number, y: number}[] = [];
    let maxCorrect = 1;

    // Guarantee that if the mission is NOT a single coordinate matching mission, there are at least 3 possible correct targets dynamically.
    // Try up to 50 times to fetch a qualifying mission.
    for (let attempt = 0; attempt < 50; attempt++) {
      allCorrectCoords = [];
      allIncorrectCoords = [];
      mission = generateMission(scoreForDiff);
      const isCoordinateTarget = mission.text.includes("좌표가 (");

      for (let xi = -18; xi <= 18; xi++) {
        const x = xi * 0.5;
        for (let yi = -18; yi <= 18; yi++) {
          const y = yi * 0.5;
          if (mission.check(x, y)) {
            allCorrectCoords.push({ x, y });
          } else {
            allIncorrectCoords.push({ x, y });
          }
        }
      }

      maxCorrect = isCoordinateTarget ? 1 : Math.floor(Math.random() * 3) + 3; // 3, 4, or 5 targets

      if (isCoordinateTarget || allCorrectCoords.length >= maxCorrect) {
        break; // Found a qualifying mission satisfying the condition
      }
    }

    setCurrentMission(mission);
    setConditionGameState('selecting');
    setActiveExplosions([]);

    const pointsList: ConditionTargetPoint[] = [];
    const coordsSet = new Set<string>();

    const addPoint = (x: number, y: number, isCorrect: boolean, enforceDistance = true) => {
      const key = `${x},${y}`;
      if (coordsSet.has(key)) return false;

      // Enforce Euclidean distance to keep points visible and clickable
      if (enforceDistance) {
        const minDistance = 1.5; // Always keep a safe selection distance
        for (const pt of pointsList) {
          const dist = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
          if (dist < minDistance) {
            return false;
          }
        }
      }

      coordsSet.add(key);

      const civilianOptions = ["🧍", "🧍‍♂️", "🧍‍♀️"];
      const randomCivilian = civilianOptions[Math.floor(Math.random() * civilianOptions.length)];

      pointsList.push({
        id: `pt-${Date.now()}-${Math.random()}`,
        x,
        y,
        isCorrect,
        selected: false,
        isGhost: isCorrect,
        civilianEmoji: randomCivilian,
      });
      return true;
    };

    // Shuffle the possible coordinates to pick randomly
    const shuffledCorrect = allCorrectCoords.sort(() => Math.random() - 0.5);
    const shuffledIncorrect = allIncorrectCoords.sort(() => Math.random() - 0.5);

    if (maxCorrect > shuffledCorrect.length) {
      maxCorrect = shuffledCorrect.length;
    }

    // 1st pass: add correct points with standard distance check (1.5)
    let correctCount = 0;
    for (const coord of shuffledCorrect) {
      if (correctCount >= maxCorrect) break;
      if (addPoint(coord.x, coord.y, true, true)) {
        correctCount++;
      }
    }

    // 2nd pass: fallback with slightly smaller distance (1.05)
    if (correctCount < maxCorrect) {
      for (const coord of shuffledCorrect) {
        if (correctCount >= maxCorrect) break;
        const key = `${coord.x},${coord.y}`;
        if (coordsSet.has(key)) continue;

        let farEnough = true;
        for (const pt of pointsList) {
          const dist = Math.sqrt(Math.pow(pt.x - coord.x, 2) + Math.pow(pt.y - coord.y, 2));
          if (dist < 1.05) farEnough = false;
        }

        if (farEnough) {
          if (addPoint(coord.x, coord.y, true, false)) {
            correctCount++;
          }
        }
      }
    }

    // 3rd pass: absolute fallback with no distance check to guarantee matching coordinates exist
    if (correctCount < maxCorrect) {
      for (const coord of shuffledCorrect) {
        if (correctCount >= maxCorrect) break;
        if (addPoint(coord.x, coord.y, true, false)) {
          correctCount++;
        }
      }
    }

    // Now fill up up to a random count of 12 to 15 points total with incorrect coordinates
    const targetPointsCount = Math.floor(Math.random() * 4) + 12; // Generates 12, 13, 14, or 15

    // 1st pass: incorrect points with standard distance check (1.5)
    for (const coord of shuffledIncorrect) {
      if (pointsList.length >= targetPointsCount) break;
      addPoint(coord.x, coord.y, false, true);
    }

    // 2nd pass: incorrect points with slightly smaller distance check (1.05)
    if (pointsList.length < targetPointsCount) {
      for (const coord of shuffledIncorrect) {
        if (pointsList.length >= targetPointsCount) break;
        const key = `${coord.x},${coord.y}`;
        if (coordsSet.has(key)) continue;

        let farEnough = true;
        for (const pt of pointsList) {
          const dist = Math.sqrt(Math.pow(pt.x - coord.x, 2) + Math.pow(pt.y - coord.y, 2));
          if (dist < 1.05) farEnough = false;
        }

        if (farEnough) {
          addPoint(coord.x, coord.y, false, false);
        }
      }
    }

    // 3rd pass: absolute fallback incorrect points with no distance check
    if (pointsList.length < targetPointsCount) {
      for (const coord of shuffledIncorrect) {
        if (pointsList.length >= targetPointsCount) break;
        addPoint(coord.x, coord.y, false, false);
      }
    }

    // Shuffle the final exact points list
    const shuffledPoints = pointsList.slice(0, targetPointsCount).sort(() => Math.random() - 0.5);
    setConditionPoints(shuffledPoints);
  };

  // 튜토리얼 기동 및 설정 도구들
  const startSniperTutorial = () => {
    setActiveTutorialMode('sniper');
    setGhosts([]);
    setConditionPoints([]);
    setCurrentMission(null);
    setupSniperTutorialStep(0); // 0단계는 안내문 보기
  };

  const startSweeperTutorial = () => {
    setActiveTutorialMode('sweeper');
    setGhosts([]);
    setConditionPoints([]);
    setCurrentMission(null);
    setupSweeperTutorialStep(0); // 0단계는 안내문 보기
  };

  const handleStartSniperTutorial = () => {
    setGameStatus('playing');
    setMode('easy');
    startSniperTutorial();
  };

  const handleStartSweeperTutorial = () => {
    setGameStatus('playing');
    setMode('condition_practice');
    startSweeperTutorial();
  };

  const setupSniperTutorialStep = (step: number) => {
    setTutorialStep(step);
    setInputValue('');
    setInputError(null);
    setHitMessage(null);
    setActiveBullet(null);
    
    if (step === 1) {
      const g: Ghost = {
        id: `tutorial-ghost-1`,
        x: 5,
        y: 4,
        timeLeft: 9999,
        maxTime: 9999,
        spawnedAt: Date.now(),
      };
      setGhosts([g]);
    } else if (step === 2) {
      const g: Ghost = {
        id: `tutorial-ghost-2`,
        x: -3,
        y: 2,
        timeLeft: 9999,
        maxTime: 9999,
        spawnedAt: Date.now(),
      };
      setGhosts([g]);
    } else if (step === 3) {
      const g: Ghost = {
        id: `tutorial-ghost-3`,
        x: 5,
        y: -2,
        timeLeft: 9999,
        maxTime: 9999,
        spawnedAt: Date.now(),
      };
      setGhosts([g]);
    } else {
      setGhosts([]);
    }
  };

  const setupSweeperTutorialStep = (step: number) => {
    setTutorialStep(step);
    setInputValue('');
    setInputError(null);
    setHitMessage(null);
    setConditionGameState('selecting');
    setActiveExplosions([]);
    setSweeperStepSuccess(false);

    if (step === 1) {
      // 1-1. Mission: 좌표가 (3, -2)인 유령
      setCurrentMission({
        text: "좌표가 (3, -2)인 점",
        check: (x, y) => x === 3 && y === -2
      });
      setConditionPoints([
        { id: 'sw-1-1', x: 3, y: -2, isCorrect: true, selected: false, isGhost: true },
        { id: 'sw-1-2', x: -1, y: 5, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍" },
        { id: 'sw-1-3', x: 4, y: 4, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍‍♂️" },
        { id: 'sw-1-4', x: -5, y: -3, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍‍♀️" },
        { id: 'sw-1-5', x: 2, y: 1, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍" },
      ]);
    } else if (step === 2) {
      // 1-2. Mission: 좌표가 (-4, 3)인 유령
      setCurrentMission({
        text: "좌표가 (-4, 3)인 점",
        check: (x, y) => x === -4 && y === 3
      });
      setConditionPoints([
        { id: 'sw-2-1', x: -4, y: 3, isCorrect: true, selected: false, isGhost: true },
        { id: 'sw-2-2', x: 5, y: 2, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍‍♀️" },
        { id: 'sw-2-3', x: -2, y: -2, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍" },
        { id: 'sw-2-4', x: 1, y: -5, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍‍♂️" },
        { id: 'sw-2-5', x: 3, y: 3, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍" },
      ]);
    } else if (step === 3) {
      // 1-3. Mission: Y축 위에 배치된 모든 유령
      setCurrentMission({
        text: "y축 위에 있는 점",
        check: (x, y) => x === 0 && y !== 0
      });
      setConditionPoints([
        { id: 'sw-3-1', x: 0, y: 5, isCorrect: true, selected: false, isGhost: true },
        { id: 'sw-3-2', x: 0, y: -3, isCorrect: true, selected: false, isGhost: true },
        { id: 'sw-3-3', x: 0, y: 1, isCorrect: true, selected: false, isGhost: true },
        { id: 'sw-3-4', x: 4, y: 2, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍" },
        { id: 'sw-3-5', x: -3, y: -4, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍‍♂️" },
        { id: 'sw-3-6', x: 3, y: -2, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍‍♀️" },
      ]);
    } else if (step === 4) {
      // 1-4. Mission: 제2사분면 위에 숨어있는 모든 유령
      setCurrentMission({
        text: "제2사분면 위에 있는 점",
        check: (x, y) => x < 0 && y > 0
      });
      setConditionPoints([
        { id: 'sw-4-1', x: -5, y: 4, isCorrect: true, selected: false, isGhost: true },
        { id: 'sw-4-2', x: -2, y: 2, isCorrect: true, selected: false, isGhost: true },
        { id: 'sw-4-3', x: -4, y: 5, isCorrect: true, selected: false, isGhost: true },
        { id: 'sw-4-4', x: 3, y: 3, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍" },
        { id: 'sw-4-5', x: -4, y: -2, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍‍♂️" },
        { id: 'sw-4-6', x: 2, y: -4, isCorrect: false, selected: false, isGhost: false, civilianEmoji: "🧍‍♀️" },
      ]);
    } else {
      setConditionPoints([]);
      setCurrentMission(null);
    }
  };

  // Spawns a new ghost at valid target coordinates (Easy/Normal Modes)
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
      conditionScore: 0,
      conditionPracticeScore: 0,
      conditionSurvivalScore: 0,
    }));

    setGameStatus('playing');
    
    const isConditionMode = currentMode === 'condition_practice' || currentMode === 'condition_survival';
    if (isConditionMode) {
      if (currentMode === 'condition_practice' && !sweeperTutorialCompleted) {
        startSweeperTutorial();
      } else {
        setActiveTutorialMode(null);
        setTimeout(() => {
          setupConditionRound(0);
        }, 50);
      }
    } else {
      if (currentMode === 'easy' && !sniperTutorialCompleted) {
        startSniperTutorial();
      } else {
        setActiveTutorialMode(null);
        setTimeout(() => {
          const initialScore = 0;
          const x = getRandomCoordinateValue(initialScore);
          const y = getRandomCoordinateValue(initialScore);
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
      }
    }
  };

  // Resets sessions and returns to welcome dashboard
  const handleResetGame = () => {
    setGameStatus('idle');
    setGhosts([]);
    setConditionPoints([]);
    setCurrentMission(null);
    setActiveBullet(null);
    setActiveExplosions([]);
    setInputValue('');
    setMissCount(0);
    setInputError(null);
    setHitMessage(null);
  };

  // Toggle selection of a point in condition matchmaking mode
  const handleTogglePoint = (id: string) => {
    if (conditionGameState !== 'selecting') return;
    setConditionPoints(prev => prev.map(pt => 
      pt.id === id ? { ...pt, selected: !pt.selected } : pt
    ));
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
      if (activeTutorialMode === 'sniper') {
        setInputError('가로 방향 위치와 세로 방향 위치를 쉼표(,)로 구분해 두 자리 입력해 보세요! 예) 3, -4');
      } else {
        setInputError('X와 Y 좌표를 쉼표(,)로 구분해 꼭 두 자리 입력해줘! 예) 3, -4');
      }
      return;
    }

    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);

    if (isNaN(x) || isNaN(y)) {
      if (activeTutorialMode === 'sniper') {
        setInputError('올바른 정수 또는 소수를 입력해 보세요! 예) 5, 4');
      } else {
        setInputError('올바른 정수 또는 소수를 입력해줘! 예) 2.5, -4');
      }
      return;
    }

    if (x < -10 || x > 10 || y < -10 || y > 10) {
      if (activeTutorialMode === 'sniper') {
        setInputError('조준 범위를 초과했습니다! 숫자는 -10에서 10 사이여야 합니다.');
      } else {
        setInputError('좌표 범위를 초과했어! X와 Y 숫자는 -10에서 10 사이여야 해.');
      }
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

      // 튜토리얼 중 저격 동작 검출
      if (activeTutorialMode === 'sniper') {
        if (isMatched) {
          if (tutorialStep === 1) {
            setHitMessage({
              text: "🎯 대성공! 가로 방향 5, 세로 방향 4 지점에 잠복해 있던 표적을 완벽하게 관통 사격했습니다! (잠시 후 2단계 훈련으로 이동합니다)",
              type: 'success'
            });
            setTimeout(() => {
              setupSniperTutorialStep(2);
            }, 1800);
          } else if (tutorialStep === 2) {
            setHitMessage({
              text: "🎯 정밀 타격 명중! 왼쪽 가로 -3, 위쪽 세로 2 지점인 (-3, 2) 위치의 표적을 제압했습니다! (잠시 후 3단계 훈련으로 이동합니다)",
              type: 'success'
            });
            setTimeout(() => {
              setupSniperTutorialStep(3);
            }, 1800);
          } else if (tutorialStep === 3) {
            setHitMessage({
              text: "🎯 조준 훈련 최종 완수! 오른쪽 가로 5, 아래쪽 세로 -2 범위인 (5, -2) 지점까지 멋지게 소탕에 성공했습니다! (사격 훈련 종료)",
              type: 'success'
            });
            setTimeout(() => {
              setSniperTutorialCompleted(true);
              localStorage.setItem('coord_game_sniper_tutorial_completed', 'true');
              setActiveTutorialMode(null);
              setHitMessage({
                text: "🎉 축하합니다! 이제 실전 서바이벌 저격 모드에 참여하실 자격을 획득하셨습니다!",
                type: 'success'
              });
              setTimeout(() => {
                const initialScore = 0;
                const x = getRandomCoordinateValue(initialScore);
                const y = getRandomCoordinateValue(initialScore);
                const maxTime = 12;
                setGhosts([{
                  id: `ghost-${Date.now()}`,
                  x,
                  y,
                  timeLeft: maxTime,
                  maxTime,
                  spawnedAt: Date.now(),
                }]);
              }, 1200);
            }, 1800);
          }
        } else {
          // Missed in tutorial (no lives penalty or score modifications)
          if (tutorialStep === 1) {
            setInputError("조준선이 비껴갔습니다! 중심에서 가로 방향 오른쪽으로 5칸, 세로 방향 위쪽으로 4칸 위치이므로 `5, 4`를 정직하게 채워 보세요!");
          } else if (tutorialStep === 2) {
            setInputError("조준선이 비껴갔습니다! 중심에서 가로 방향 왼쪽으로 3칸(-3), 세로 방향 위쪽으로 2칸(2) 위치이므로 `-3, 2`를 적어 보세요!");
          } else if (tutorialStep === 3) {
            setInputError("조준선이 비껴갔습니다! 중심에서 가로 방향 오른쪽으로 5칸, 세로 방향 아래쪽으로 2칸(-2) 위치이므로 `5, -2`를 마력 사격해 보세요!");
          }
        }
        return;
      }

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

  // 10-second condition limit countdown for Condition Survival mode
  useEffect(() => {
    if (gameStatus !== 'playing' || currentMode !== 'condition_survival') return;
    if (conditionGameState !== 'selecting') return;

    // Reset timer to 10s upon round start
    setConditionTimeLeft(10);

    const interval = setInterval(() => {
      setConditionTimeLeft(prev => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(interval);
          handleConditionTimeout();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameStatus, currentMode, currentMission, conditionGameState]);

  const handleConditionTimeout = () => {
    // Force transition to revealed
    setConditionGameState('revealed');
    setSweeperStepSuccess(false);
    setHitMessage({
      text: "⏱️ 시간 초과! (제한 시간 10초가 지나 작전에 실패하고 체력이 1 깎였습니다!)",
      type: 'warn'
    });
    const nextLives = lives - 1;
    setLives(nextLives);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 400);
  };

  // Skip to another problem in practice mode
  const handleConditionSkip = () => {
    if (currentMode !== 'condition_practice' || conditionGameState !== 'selecting') return;
    setupConditionRound(scores.conditionPracticeScore);
    setHitMessage(null);
  };

  // Condition mode bullet firing sequence
  const handleConditionFire = () => {
    if (conditionGameState !== 'selecting') return;

    const selectedPoints = conditionPoints.filter(p => p.selected);
    
    // 1단계: 미사일 낙하 애니메이션 (firing 상태 변환)
    setConditionGameState('firing');
    const explosions = selectedPoints.map(p => ({ x: p.x, y: p.y }));
    setActiveExplosions(explosions);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 400);

    // 1초 동안 낙하 및 폭발 이펙트 진행
    setTimeout(() => {
      // 2단계: 정체 확인 및 결과 표시 (revealed 상태 변환)
      setConditionGameState('revealed');
      setActiveExplosions([]);

      // 3단계: 판정 및 결과 확인 대기
      const hasMissedGhost = conditionPoints.some(p => p.isCorrect && !p.selected);
      const hasInjuredCivilian = conditionPoints.some(p => !p.isCorrect && p.selected);
      const isPerfect = !hasMissedGhost && !hasInjuredCivilian;

       // 튜토리얼 소탕 조건 특수 체크
      if (activeTutorialMode === 'sweeper') {
        if (isPerfect) {
          setSweeperStepSuccess(true);
          if (tutorialStep === 1) {
            setHitMessage({
              text: "🎯 정밀 폭격 완료! 지정한 (3, -2) 지점의 표적 유령을 안전하게 격치했습니다! [훈련 속개 ➡️]",
              type: 'success'
            });
          } else if (tutorialStep === 2) {
            setHitMessage({
              text: "🎯 완벽한 타격! 지정한 (-4, 3) 지점의 잠복한 유령을 정확하게 제거했습니다! [훈련 속개 ➡️]",
              type: 'success'
            });
          } else if (tutorialStep === 3) {
            setHitMessage({
              text: "🎯 일괄 처리 완벽! 세로 실선형 축(y축) 상에 놓인 유령 세 마리를 동시에 단숨에 폭격했습니다! [훈련 속개 ➡️]",
              type: 'success'
            });
          } else if (tutorialStep === 4) {
            setHitMessage({
              text: "🎯 최종 미션 성공! 제2사분면(좌상단 구역) 영역 안에 숨어있던 모든 교란 유령들을 완전하게 섬멸했습니다!",
              type: 'success'
            });
          }
        } else {
          setSweeperStepSuccess(false);
          let clue = "💥 전술 오인! 조건에 상응하는 붉은 점들만 안전하게 지정해야 합니다. ";
          if (tutorialStep === 1) {
            clue += "오른쪽으로 3칸, 아래로 2칸 지점인 (3, -2) 좌표의 붉은 점을 마킹해 미사일을 발사해 보세요.";
          } else if (tutorialStep === 2) {
            clue += "왼쪽으로 4칸, 위로 3칸 지점인 (-4, 3) 좌표의 붉은 점만 골라 보세요.";
          } else if (tutorialStep === 3) {
            clue += "가로 위치가 0인 세로선 축(y축) 상에 가로질러 정렬한 세 붉은 유령 점을 빼놓지 말고 동시 선택해 보세요.";
          } else if (tutorialStep === 4) {
            clue += "제2사분면(중심축 기준 왼쪽 위 영역) 안에 들어서 있는 세 붉은 유령 마크를 한 마리도 빠짐없이 체크해 주세요!";
          }
          setHitMessage({ text: clue, type: 'warn' });
        }
        return;
      }

      if (isPerfect) {
        setSweeperStepSuccess(true);
        setHitMessage({
          text: "🎯 완벽해요! 모든 유령을 처치하고 시민들을 구했습니다! (+1점)",
          type: 'success'
        });
        
        if (currentMode === 'condition_survival') {
          const nextScore = scores.conditionSurvivalScore + 1;
          setScores(prev => ({ ...prev, conditionSurvivalScore: nextScore }));
          triggerHighScoreSave('condition_survival', nextScore);
        } else {
          const nextScore = scores.conditionPracticeScore + 1;
          setScores(prev => ({ ...prev, conditionPracticeScore: nextScore }));
          triggerHighScoreSave('condition_practice', nextScore);
        }

      } else {
        setSweeperStepSuccess(false);
        let failMessage = "💥 작전 실패! ";
        if (hasMissedGhost && hasInjuredCivilian) {
          failMessage += "유령을 놓쳤고, 무고한 시민까지 공격했습니다!";
        } else if (hasMissedGhost) {
          failMessage += "미션 조건에 맞는 유령을 놓쳤습니다!";
        } else {
          failMessage += "유령이 아닌 시민을 실수로 공격했습니다!";
        }

        if (currentMode === 'condition_survival') {
          failMessage += " (체력 -1) 😢";
          setHitMessage({ text: failMessage, type: 'warn' });

          const nextLives = lives - 1;
          setLives(nextLives);
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 400);
        } else {
          failMessage += " (연습 모드이므로 체력은 차감되지 않습니다!) 🌱";
          setHitMessage({ text: failMessage, type: 'warn' });
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 400);
        }
      }
    }, 1000);
  };

  // Move to next mission or end the game based on the manual Next button click
  const handleConditionNext = () => {
    if (activeTutorialMode === 'sweeper') {
      if (sweeperStepSuccess) {
        if (tutorialStep < 4) {
          setupSweeperTutorialStep(tutorialStep + 1);
        } else {
          // Complete sweeper tutorial
          setSweeperTutorialCompleted(true);
          localStorage.setItem('coord_game_sweeper_tutorial_completed', 'true');
          setActiveTutorialMode(null);
          setHitMessage({
            text: "🎉 축하합니다! 모든 소탕 조작 훈련 과정을 전면 이수하셨습니다. 이제 서바이벌 모드가 완전히 해제되었습니다!",
            type: 'success'
          });
          setTimeout(() => {
            setupConditionRound(0);
          }, 800);
        }
      } else {
        // Retry the current step
        setupSweeperTutorialStep(tutorialStep);
      }
      return;
    }

    if (currentMode === 'condition_survival') {
      if (lives <= 0) {
        setGameStatus('gameover');
        triggerHighScoreSave('condition_survival', scores.conditionSurvivalScore);
      } else {
        setupConditionRound(scores.conditionSurvivalScore);
        setHitMessage(null);
      }
    } else {
      setupConditionRound(scores.conditionPracticeScore);
      setHitMessage(null);
    }
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
          /* Multi-Box Mode Layout Split into Side-by-Side emerald cards */
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in my-4">
            <div className="text-center flex flex-col gap-1">
              <h2 className="text-3xl font-black text-slate-900 font-jua flex justify-center items-center gap-1.5 pt-2">
                <span>게임 모드 선택</span>
              </h2>
            </div>

            {/* Two big independent panels aligned side-to-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* 유령 저격 모드 Green Box Card */}
              <div 
                className={`rounded-3xl border-4 p-5 sm:p-6 shadow-xl flex flex-col justify-between gap-5 transition-all bg-white relative ${
                  currentMode === 'easy' || currentMode === 'normal'
                    ? 'border-emerald-500 ring-4 ring-emerald-100 shadow-emerald-100'
                    : 'border-slate-300 hover:border-slate-400 opacity-95'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-amber-900 border-b border-amber-100 pb-2 text-base sm:text-lg font-black font-jua">
                    <span>🎯</span>
                    <span>유령 저격 모드</span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    유령의 정확한 좌표를 입력해 저격하세요!
                  </p>
 
                  <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                    <button 
                      onClick={() => setMode('easy')}
                      className={`py-3 px-2 rounded-xl border-2 font-jua text-sm transition-all text-center cursor-pointer flex flex-col justify-center items-center gap-1 min-h-[74px] ${
                        currentMode === 'easy'
                          ? 'bg-amber-100/60 border-amber-400 text-amber-900 font-bold shadow-md ring-2 ring-amber-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-black whitespace-nowrap">🌱 저격 연습 모드</span>
                      {currentMode === 'easy' && <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full font-sans">선택됨</span>}
                    </button>
                    
                    <button 
                      disabled={!sniperTutorialCompleted}
                      onClick={() => {
                        if (sniperTutorialCompleted) {
                          setMode('normal');
                        }
                      }}
                      className={`py-3 px-2 rounded-xl border-2 font-jua text-sm transition-all text-center flex flex-col justify-center items-center gap-1 min-h-[74px] ${
                        !sniperTutorialCompleted
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                          : currentMode === 'normal'
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-bold shadow-md ring-2 ring-indigo-200 cursor-pointer'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 cursor-pointer'
                      }`}
                      title={!sniperTutorialCompleted ? "저격 연습 모드 튜토리얼을 완료해 주세요!" : ""}
                    >
                      <span className="text-xs sm:text-sm font-black whitespace-nowrap">
                        {!sniperTutorialCompleted ? "🔒 저격 서바이벌" : "⏱️ 저격 서바이벌"}
                      </span>
                      {!sniperTutorialCompleted ? (
                        <span className="text-[8px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded-full font-sans">훈련 필요</span>
                      ) : (
                        currentMode === 'normal' && <span className="text-[9px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded-full font-sans">선택됨</span>
                      )}
                    </button>
                  </div>
                </div>
 
                <div className="w-full flex flex-col gap-2">
                  {(currentMode === 'easy' || currentMode === 'normal') ? (
                    <button
                      onClick={handleStartGame}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-jua text-base rounded-xl cursor-pointer shadow-lg hover:scale-[1.01] transition-all text-center border-b-4 border-emerald-800 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white animate-pulse" />
                      <span>저격 도전 시작!</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3.5 bg-slate-100 text-slate-400 font-jua text-sm rounded-xl border-b-4 border-slate-300 flex flex-col items-center justify-center gap-0.5 opacity-90 cursor-not-allowed"
                    >
                      <span>저격 도전 시작!</span>
                      <span className="text-[10px] font-sans text-slate-400">위의 저격 연습/서바이벌 모드를 선택하세요.</span>
                    </button>
                  )}

                  <button
                    onClick={handleStartSniperTutorial}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-805 border border-amber-300 font-jua text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
                  >
                    <span>🔄 저격 조준 훈련(튜토리얼) 다시 진행</span>
                  </button>
                </div>
              </div>
 
              {/* 유령 소탕 모드 Green Box Card */}
              <div 
                className={`rounded-3xl border-4 p-5 sm:p-6 shadow-xl flex flex-col justify-between gap-5 transition-all bg-white relative ${
                  currentMode === 'condition_practice' || currentMode === 'condition_survival'
                    ? 'border-teal-500 ring-4 ring-teal-100 shadow-teal-100'
                    : 'border-slate-300 hover:border-slate-400 opacity-95'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-teal-900 border-b border-teal-100 pb-2 text-base sm:text-lg font-black font-jua">
                    <span>💥</span>
                    <span>유령 소탕 모드</span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    조건을 만족하는 모든 유령들을 한번에 소탕하세요!
                  </p>
 
                  <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                    <button 
                      onClick={() => setMode('condition_practice')}
                      className={`py-3 px-2 rounded-xl border-2 font-jua text-sm transition-all text-center cursor-pointer flex flex-col justify-center items-center gap-1 min-h-[74px] ${
                        currentMode === 'condition_practice'
                          ? 'bg-teal-50 border-teal-400 text-teal-850 font-bold shadow-md ring-2 ring-teal-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-black whitespace-nowrap">🌱 소탕 연습 모드</span>
                      {currentMode === 'condition_practice' && <span className="text-[9px] bg-teal-200 text-teal-950 font-bold px-2 py-0.5 rounded-full font-sans">선택됨</span>}
                    </button>
 
                    <button 
                      disabled={!sweeperTutorialCompleted}
                      onClick={() => {
                        if (sweeperTutorialCompleted) {
                          setMode('condition_survival');
                        }
                      }}
                      className={`py-3 px-2 rounded-xl border-2 font-jua text-sm transition-all text-center flex flex-col justify-center items-center gap-1 min-h-[74px] ${
                        !sweeperTutorialCompleted
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                          : currentMode === 'condition_survival'
                            ? 'bg-rose-50 border-rose-300 text-rose-850 font-bold shadow-md ring-2 ring-rose-200 cursor-pointer'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650 cursor-pointer'
                      }`}
                      title={!sweeperTutorialCompleted ? "소탕 연습 모드 튜토리얼을 완료해 주세요!" : ""}
                    >
                      <span className="text-xs sm:text-sm font-black whitespace-nowrap">
                        {!sweeperTutorialCompleted ? "🔒 소탕 서바이벌" : "⏱️ 소탕 서바이벌"}
                      </span>
                      {!sweeperTutorialCompleted ? (
                        <span className="text-[8px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded-full font-sans">훈련 필요</span>
                      ) : (
                        currentMode === 'condition_survival' && <span className="text-[9px] bg-rose-200 text-rose-950 font-bold px-2.5 py-0.5 rounded-full font-sans">선택됨</span>
                      )}
                    </button>
                  </div>
                </div>
 
                <div className="w-full flex flex-col gap-2">
                  {(currentMode === 'condition_practice' || currentMode === 'condition_survival') ? (
                    <button
                      onClick={handleStartGame}
                      className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-jua text-base rounded-xl cursor-pointer shadow-lg hover:scale-[1.01] transition-all text-center border-b-4 border-emerald-800 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white animate-pulse" />
                      <span>소탕 도전 시작!</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3.5 bg-slate-100 text-slate-400 font-jua text-sm rounded-xl border-b-4 border-slate-300 flex flex-col items-center justify-center gap-0.5 opacity-90 cursor-not-allowed"
                    >
                      <span>소탕 도전 시작!</span>
                      <span className="text-[10px] font-sans text-slate-400">위의 소탕 연습/서바이벌 모드를 선택하세요.</span>
                    </button>
                  )}

                  <button
                    onClick={handleStartSweeperTutorial}
                    className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 font-jua text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
                  >
                    <span>🔄 소탕 훈련(튜토리얼) 다시 진행</span>
                  </button>
                </div>
              </div>

            </div>
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
                activeTutorialMode={activeTutorialMode}
                
                // 조건 맞추기 모드용 Props 추가
                conditionPoints={conditionPoints}
                onTogglePoint={handleTogglePoint}
                conditionGameState={conditionGameState}
                activeExplosions={activeExplosions}

                // 튜토리얼 점선 가이드 좌표 추가
                tutorialHighlightCoord={
                  activeTutorialMode === 'sniper' && tutorialStep > 0 && ghosts.length > 0
                    ? { x: ghosts[0].x, y: ghosts[0].y }
                    : null
                }
              />
            </div>

            {/* Right side: Information and operation dashboards (takes 4 columns in lg size) */}
            <div className="lg:col-span-4 flex flex-col gap-4 w-full justify-start">
              


              {/* Score states */}
              <ScoreBoard
                scoreState={scores}
                currentMode={currentMode}
                lives={lives}
                missCount={missCount}
                onSelectMode={setMode}
                sniperTutorialCompleted={sniperTutorialCompleted}
                sweeperTutorialCompleted={sweeperTutorialCompleted}
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
 
                // 조건 맞추기 모드용 Props 추가
                currentMission={currentMission}
                conditionPoints={conditionPoints}
                conditionGameState={conditionGameState}
                onConditionFire={handleConditionFire}
                onConditionNext={handleConditionNext}
                onConditionSkip={handleConditionSkip}
                conditionTimeLeft={conditionTimeLeft}

                // 튜토리얼용 Props 추가
                activeTutorialMode={activeTutorialMode}
                tutorialStep={tutorialStep}
                sweeperStepSuccess={sweeperStepSuccess}
                onSetupSniperStep={setupSniperTutorialStep}
                onSetupSweeperStep={setupSweeperTutorialStep}
              />
              
              {/* Gameplay Screen footer at the bottom of the right side column */}
              <div className="text-center mt-2 flex justify-center">
                <footer className="text-center text-xs text-teal-800 font-medium bg-teal-50 px-4 py-2 rounded-full border border-teal-100 shadow-inner w-fit">
                  © 2026 석관중학교 JSI
                </footer>
              </div>
              
            </div>
 
          </div>
        )}
 
        {/* Informative footer for lobby screen only */}
        {gameStatus === 'idle' && (
          <footer className="text-center text-xs text-teal-800 mt-2 font-medium bg-teal-50 inline-block mx-auto px-4 py-2 rounded-full border border-teal-100 shadow-inner">
            © 2026 석관중학교 JSI
          </footer>
        )}
      </div>
 
      {showConfirmModal && pendingMode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-amber-300 shadow-2xl flex flex-col gap-4 text-center"
          >
            <div className="text-4xl">🚨</div>
            <h3 className="text-xl font-black font-jua text-amber-950">작전 모드 전환 확인</h3>
            <p className="text-xs sm:text-sm text-slate-650 font-sans leading-relaxed">
              현재 진행 중인 <span className="font-bold text-amber-900">{
                currentMode === 'easy' 
                  ? '연습 모드' 
                  : currentMode === 'normal' 
                    ? '서바이벌 모드' 
                    : currentMode === 'condition_practice' 
                      ? '소탕 연습 모드' 
                      : '소탕 서바이벌 모드'
              }</span>를 종료하시겠습니까? <br />
              <span className="font-bold text-teal-700">이전까지 획득한 점수가 정산되어 최고 기록에 저장되며,</span><br />
              새로운 모드(<span className="font-bold text-indigo-750">{
                pendingMode === 'easy' 
                  ? '연습 모드' 
                  : pendingMode === 'normal' 
                    ? '서바이벌 모드' 
                    : pendingMode === 'condition_practice' 
                      ? '소탕 연습 모드' 
                      : '소탕 서바이벌 모드'
              }</span>)가 처음부터 신규 작전으로 시작됩니다.
            </p>
            
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingMode(null);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-750 font-jua text-sm rounded-xl transition-all border border-slate-300 cursor-pointer"
              >
                계속 플레이하기
              </button>
              <button
                onClick={() => {
                  confirmModeChange(pendingMode);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-jua text-sm rounded-xl transition-all shadow-md border-b-4 border-emerald-800 cursor-pointer"
              >
                정리 후 전환하기
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Game Over modal overlay */}
      <GameOverModal
        isOpen={gameStatus === 'gameover'}
        score={
          currentMode === 'easy' 
            ? scores.easyScore 
            : currentMode === 'normal' 
              ? scores.normalScore 
              : currentMode === 'condition_survival'
                ? scores.conditionSurvivalScore
                : scores.conditionPracticeScore
        }
        highScore={
          currentMode === 'easy' 
            ? scores.easyHighScore 
            : currentMode === 'normal' 
              ? scores.normalHighScore 
              : currentMode === 'condition_survival'
                ? scores.conditionSurvivalHighScore
                : scores.conditionPracticeHighScore
        }
        currentMode={currentMode}
        onRestart={handleStartGame}
      />
    </div>
  );
}

