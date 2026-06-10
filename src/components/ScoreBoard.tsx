import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { GameMode, ScoreState } from '../types';

interface ScoreBoardProps {
  scoreState: ScoreState;
  currentMode: GameMode;
  lives: number;
  missCount: number; // 0, 1, or 2 consecutive misses
}

export default function ScoreBoard({
  scoreState,
  currentMode,
  lives,
  missCount,
}: ScoreBoardProps) {
  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-emerald-200 shadow-sm">
      {/* Target stats layer */}
      <div className="grid grid-cols-2 gap-3">
        {/* Easy Mode Card */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          currentMode === 'easy' 
            ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200' 
            : 'bg-slate-50/50 border-slate-200 opacity-60'
        }`}>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-750 mb-1">
            <Trophy className="w-3 h-3" />
            <span className="font-jua">연습 모드</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-lg md:text-xl font-jua text-amber-950">
              {scoreState.easyScore}<span className="text-xs font-sans font-medium text-amber-800 ml-0.5">점</span>
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-600 bg-white px-1 py-0.5 rounded border border-amber-200">
              최고 {scoreState.easyHighScore}점
            </span>
          </div>
        </div>

        {/* Normal Mode Card */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          currentMode === 'normal' 
            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200' 
            : 'bg-slate-50/50 border-slate-200 opacity-60'
        }`}>
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-750 mb-1">
            <Flame className="w-3 h-3" />
            <span className="font-jua">일반 모드</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-lg md:text-xl font-jua text-indigo-950">
              {scoreState.normalScore}<span className="text-xs font-sans font-medium text-indigo-850 ml-0.5">점</span>
            </span>
            <span className="text-[9px] font-mono font-bold text-indigo-600 bg-white px-1 py-0.5 rounded border border-indigo-200">
              최고 {scoreState.normalHighScore}점
            </span>
          </div>
        </div>
      </div>

      {/* Middle Line: Health Tracker & Consecutive Miss */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Hearts Life counter (No '체력:' text as requested) */}
        <div className="flex items-center gap-1 bg-rose-50/50 px-2.5 py-1 rounded-full border border-rose-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <span 
              key={`heart-${i}`} 
              className={`text-lg transition-all duration-300 ${
                i < lives 
                  ? 'inline-block drop-shadow-[0_1.5px_3px_rgba(239,68,68,0.3)] scale-100 animate-pulse' 
                  : 'grayscale opacity-25 scale-90'
              }`}
            >
              ❤️
            </span>
          ))}
        </div>

        {/* Consecutive Miss Progress Bubble */}
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
          {[1, 2, 3].map((slot) => {
            const isActive = missCount >= slot;
            return (
              <div
                key={`miss-slot-${slot}`}
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-rose-500 border-rose-600 text-[8px] text-white font-bold animate-bounce' 
                    : 'bg-slate-200 border-slate-300'
                }`}
                title={`${slot}단 오답기록`}
              >
                {isActive && "⚠️"}
              </div>
            );
          })}
          <span className="text-[9px] font-bold text-slate-500 font-mono pl-0.5">
            ({missCount}/3)
          </span>
        </div>
      </div>
    </div>
  );
}
