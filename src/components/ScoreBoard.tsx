import React from 'react';
import { Flame, Trophy, Crosshair, HelpCircle } from 'lucide-react';
import { GameMode, ScoreState } from '../types';

interface ScoreBoardProps {
  scoreState: ScoreState;
  currentMode: GameMode;
  lives: number;
  missCount: number; // 0, 1, or 2 consecutive misses
  onSelectMode?: (mode: GameMode) => void;
}

export default function ScoreBoard({
  scoreState,
  currentMode,
  lives,
  missCount,
  onSelectMode,
}: ScoreBoardProps) {
  const isCondition = currentMode === 'condition_practice' || currentMode === 'condition_survival';

  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-emerald-200 shadow-sm flex flex-col gap-3">
      {/* Target stats layer with Dynamic Columns based on Game Mode */}
      <div className="grid grid-cols-2 gap-2">
        {(currentMode === 'easy' || currentMode === 'normal') && (
          <>
            {/* 저격 연습 모드 Card Button */}
            <button
              type="button"
              onClick={() => onSelectMode?.('easy')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] select-none flex flex-col justify-between h-full ${
                currentMode === 'easy' 
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-sm' 
                  : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-90 hover:bg-amber-50/20'
              }`}
              title="클릭하여 저격 연습 모드로 전환"
            >
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-900 mb-1">
                <Trophy className="w-3 h-3 flex-shrink-0" />
                <span className="font-jua break-keep">저격 연습</span>
              </div>
              <div className="flex flex-col w-full">
                <span className="text-base sm:text-lg font-black font-jua text-amber-950">
                  {scoreState.easyScore}<span className="text-[10px] font-sans font-medium text-amber-800 ml-0.5">점</span>
                </span>
                <span className="text-[8px] font-mono font-bold text-amber-600 bg-white px-1 py-0.5 mt-1 rounded border border-amber-200 text-center">
                  최고 {scoreState.easyHighScore}점
                </span>
              </div>
            </button>

            {/* 저격 서바이벌 모드 Card Button */}
            <button
              type="button"
              onClick={() => onSelectMode?.('normal')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] select-none flex flex-col justify-between h-full ${
                currentMode === 'normal' 
                  ? 'bg-indigo-50 border-indigo-350 ring-2 ring-indigo-200 shadow-sm' 
                  : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-90 hover:bg-indigo-50/20'
              }`}
              title="클릭하여 저격 서바이벌 모드로 전환"
            >
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-indigo-900 mb-1">
                <Flame className="w-3 h-3 flex-shrink-0" />
                <span className="font-jua break-keep">저격 서바이벌</span>
              </div>
              <div className="flex flex-col w-full">
                <span className="text-base sm:text-lg font-black font-jua text-indigo-950">
                  {scoreState.normalScore}<span className="text-[10px] font-sans font-medium text-indigo-850 ml-0.5">점</span>
                </span>
                <span className="text-[8px] font-mono font-bold text-indigo-600 bg-white px-1 py-0.5 mt-1 rounded border border-indigo-200 text-center">
                  최고 {scoreState.normalHighScore}점
                </span>
              </div>
            </button>
          </>
        )}

        {isCondition && (
          <>
            {/* 소탕 연습 모드 Card Button */}
            <button
              type="button"
              onClick={() => onSelectMode?.('condition_practice')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] select-none flex flex-col justify-between h-full ${
                currentMode === 'condition_practice' 
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-sm' 
                  : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-90 hover:bg-amber-50/20'
              }`}
              title="클릭하여 소탕 연습 모드로 전환"
            >
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-900 mb-1">
                <Trophy className="w-3 h-3 flex-shrink-0" />
                <span className="font-jua break-keep">소탕 연습</span>
              </div>
              <div className="flex flex-col w-full">
                <span className="text-base sm:text-lg font-black font-jua text-amber-950">
                  {scoreState.conditionPracticeScore}<span className="text-[10px] font-sans font-medium text-amber-800 ml-0.5">점</span>
                </span>
                <span className="text-[8px] font-mono font-bold text-amber-600 bg-white px-1 py-0.5 mt-1 rounded border border-amber-200 text-center">
                  최고 {scoreState.conditionPracticeHighScore}점
                </span>
              </div>
            </button>

            {/* 소탕 서바이벌 모드 Card Button */}
            <button
              type="button"
              onClick={() => onSelectMode?.('condition_survival')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] select-none flex flex-col justify-between h-full ${
                currentMode === 'condition_survival' 
                  ? 'bg-indigo-50 border-indigo-350 ring-2 ring-indigo-200 shadow-sm' 
                  : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-90 hover:bg-indigo-50/20'
              }`}
              title="클릭하여 소탕 서바이벌 모드로 전환"
            >
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-indigo-900 mb-1">
                <Flame className="w-3 h-3 flex-shrink-0" />
                <span className="font-jua break-keep">소탕 서바이벌</span>
              </div>
              <div className="flex flex-col w-full">
                <span className="text-base sm:text-lg font-black font-jua text-indigo-950">
                  {scoreState.conditionSurvivalScore}<span className="text-[10px] font-sans font-medium text-indigo-850 ml-0.5">점</span>
                </span>
                <span className="text-[8px] font-mono font-bold text-indigo-600 bg-white px-1 py-0.5 mt-1 rounded border border-indigo-200 text-center">
                  최고 {scoreState.conditionSurvivalHighScore}점
                </span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Middle Line: Health Tracker & Consecutive Miss */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Hearts Life counter */}
        {currentMode === 'condition_practice' ? (
          <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 text-amber-800 font-jua text-[10px]">
            <span>🌱 연습 모드 (체력 무제한)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-rose-50/50 px-2.5 py-1 rounded-full border border-rose-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <span 
                key={`heart-${i}`} 
                className={`text-lg transition-all duration-350 ${
                  i < lives 
                    ? 'inline-block drop-shadow-[0_1.5px_3px_rgba(239,68,68,0.3)] scale-100 animate-pulse' 
                    : 'grayscale opacity-25 scale-90'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
        )}

        {/* Informative Side-Tag or Consecutive Miss Progress Bubble */}
        {isCondition ? (
          <div className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-100 rounded-full select-none">
            <span className="text-[10px] font-black font-jua">🎯 정답 일제 다중 타격 작전</span>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
