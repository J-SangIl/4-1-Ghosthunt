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

export type GameMode = 'easy' | 'normal';
export type GameStatus = 'idle' | 'playing' | 'gameover';

export interface ScoreState {
  easyHighScore: number;
  easyScore: number;
  normalHighScore: number;
  normalScore: number;
}
