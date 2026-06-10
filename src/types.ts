export interface Coordinate {
  x: number;
  y: number;
}

export interface Ghost {
  id: string;
  x: number;
  y: number;
  timeLeft: number; // remaining seconds (only for normal mode)
  maxTime: number;  // initial seconds given (e.g., 5 seconds)
  spawnedAt: number; // timestamp
}

export interface BulletEffect {
  id: string;
  x: number;
  y: number;
  status: 'flying' | 'exploding' | 'finished';
  isHit: boolean;
  timestamp: number;
}

export type GameMode = 'easy' | 'normal' | 'condition_practice' | 'condition_survival';
export type GameStatus = 'idle' | 'playing' | 'gameover';

export interface ScoreState {
  easyHighScore: number;
  easyScore: number;
  normalHighScore: number;
  normalScore: number;
  conditionHighScore: number;
  conditionScore: number;
  conditionPracticeHighScore: number;
  conditionPracticeScore: number;
  conditionSurvivalHighScore: number;
  conditionSurvivalScore: number;
}

export interface ConditionTargetPoint {
  id: string;
  x: number;
  y: number;
  isCorrect: boolean; // 미션 조건에 부합하는 정답(유령 역할을 할 점)인지 여부
  selected: boolean;   // 플레이어가 클릭하여 선택했는지 여부
  isGhost: boolean;    // 정제가 밝혀졌을 때 진짜 유령이었는지 (isCorrect와 사실상 동일하거나, 정답 여부에 직접 사용됨)
  civilianEmoji?: string; // 시민 캐릭터용 이모지 (🧍, 🧍‍♂️, 🧍‍♀️ 등)
}

export interface MissionCondition {
  text: string;
  check: (x: number, y: number) => boolean;
}
