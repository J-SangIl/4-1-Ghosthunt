import React, { useRef, useEffect } from 'react';
import { Play, RotateCcw, AlertCircle, Crosshair, HelpCircle, Flame } from 'lucide-react';
import { GameMode, GameStatus, MissionCondition, ConditionTargetPoint } from '../types';

interface GameControlsProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  onFire: (input: string) => void;
  gameStatus: GameStatus;
  onStartGame: () => void;
  onResetGame: () => void;
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
  showCursorLabel: boolean;
  setShowCursorLabel: (show: boolean) => void;
  inputError: string | null;
  setInputError: (error: string | null) => void;

  // 조건 맞추기 모드용 Props
  currentMission?: MissionCondition | null;
  conditionPoints?: ConditionTargetPoint[];
  conditionGameState?: 'selecting' | 'firing' | 'revealed' | 'animating';
  onConditionFire?: () => void;
  onConditionNext?: () => void;
  onConditionSkip?: () => void;
  conditionTimeLeft?: number;
}

export default function GameControls({
  inputValue,
  setInputValue,
  onFire,
  gameStatus,
  onStartGame,
  onResetGame,
  currentMode,
  setMode,
  showCursorLabel,
  setShowCursorLabel,
  inputError,
  setInputError,
  currentMission,
  conditionPoints = [],
  conditionGameState = 'selecting',
  onConditionFire,
  onConditionNext,
  onConditionSkip,
  conditionTimeLeft = 10,
}: GameControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const isConditionMode = currentMode === 'condition_practice' || currentMode === 'condition_survival';

  // Maintain focus on the input box after firing or when playing (Easy & Normal modes only)
  useEffect(() => {
    if (!isConditionMode && gameStatus === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus, inputValue, currentMode, isConditionMode]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Regular expression: only allow digits, comma, dot, minus, and space
    const filtered = val.replace(/[^0-9.,\- ]/g, '');
    
    setInputValue(filtered);
    if (inputError) setInputError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameStatus !== 'playing') {
      setInputError('전투를 시작하려면 먼저 [게임 시작] 버튼을 눌러줘!');
      return;
    }
    
    onFire(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const selectedPoints = conditionPoints.filter(p => p.selected);
  const selectedCount = selectedPoints.length;

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-5 border-2 border-teal-200 shadow-md flex flex-col gap-4">
      
      {isConditionMode ? (
        /* Condition Matchmaking Mode Mission Condition Panel */
        <div className="flex flex-col gap-3">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-300 p-4 rounded-xl flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center gap-1.5 border-b border-teal-100 pb-1.5">
              <span className="text-xl">🏆</span>
              <span className="text-xs font-black text-teal-800 font-jua">유령의 위치</span>
            </div>
            
            {/* Condition statement text box */}
            <div className="py-3 px-3 bg-white border border-teal-200 rounded-lg text-center shadow-sm relative overflow-hidden">
              <div className="text-base sm:text-lg font-black font-jua text-teal-950 leading-relaxed">
                {currentMission ? currentMission.text : '미션 생성 중...'}
              </div>

              {/* Survival Mode Time Limit and Remaining Time progress bar */}
              {currentMode === 'condition_survival' && gameStatus === 'playing' && conditionGameState === 'selecting' && (
                <div className="mt-2.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                    <span className="text-rose-500 animate-pulse flex items-center gap-1">⏱️ 제한 시간</span>
                    <span className="font-mono text-rose-600">{Math.max(0, conditionTimeLeft).toFixed(1)}초</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all duration-100 ease-linear ${
                        conditionTimeLeft < 3 ? 'bg-rose-500 animate-pulse' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, (conditionTimeLeft / 10) * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Condition mode action firing button */}
          {conditionGameState === 'revealed' ? (
            <button
              onClick={() => onConditionNext?.()}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm sm:text-base font-jua rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-b-4 border-emerald-800 animate-pulse"
            >
              <span>다음 작전지로 이동 ➡️</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onConditionFire?.()}
                disabled={gameStatus !== 'playing' || conditionGameState !== 'selecting' || selectedCount === 0}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-red-650 hover:from-rose-600 hover:to-red-700 text-white disabled:from-slate-200 disabled:to-slate-350 disabled:text-slate-500 text-sm sm:text-base font-jua rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-b-4 border-red-800 disabled:border-slate-400"
              >
                <Flame className="w-5 h-5 fill-white" />
                <span>
                  {conditionGameState === 'firing'
                    ? '미사일 포격 진행 중... 🚀'
                    : `유령 소탕 미사일 폭격! (${selectedCount}개 선택됨)`}
                </span>
              </button>

              {/* 다른 문제 버튼 (연습 모드 전용) */}
              {currentMode === 'condition_practice' && conditionGameState === 'selecting' && (
                <button
                  type="button"
                  onClick={() => onConditionSkip?.()}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs sm:text-sm font-jua rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 shadow-sm"
                >
                  <span>🔄 다른 문제로 변경 (연습)</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Easy / Normal Modes Traditional Form Box */
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col items-center justify-center py-2 bg-teal-50/40 rounded-2xl border border-teal-100 p-2 relative">
            
            <div className="text-center mb-1 flex items-center gap-1 justify-center">
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-[11px] font-bold text-teal-800 font-jua">좌표 발사대: ( X축 숫자, Y축 숫자 )</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 w-full">
              {/* Giant Left bracket */}
              <span className="text-5xl md:text-6xl text-teal-600/90 font-extrabold select-none tracking-tight font-gaegu">(</span>
              
              {/* Real Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                disabled={gameStatus !== 'playing'}
                placeholder="예: 3, -4"
                className="text-center w-40 sm:w-52 h-14 bg-white disabled:bg-slate-100 text-teal-950 font-mono text-xl sm:text-2xl font-extrabold border-2 border-teal-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-200 focus:border-teal-500 shadow-inner px-2 tracking-wide placeholder:text-slate-300 transition-all"
                id="coordinate-shooting-input"
              />

              {/* Giant Right bracket */}
              <span className="text-5xl md:text-6xl text-teal-600/90 font-extrabold select-none tracking-tight font-gaegu">)</span>
            </div>

            {/* Quick Clear Hint */}
            {inputValue && gameStatus === 'playing' && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-4 bottom-5 text-[10px] font-bold text-slate-400 hover:text-slate-600 underline font-jua cursor-pointer"
              >
                지우기
              </button>
            )}
          </div>

          {/* Action Fire Button */}
          <button
            type="submit"
            disabled={gameStatus !== 'playing' || !inputValue.trim()}
            className="w-full mt-1 py-3.5 sm:py-4 bg-rose-500 hover:bg-rose-600 text-white disabled:bg-slate-300 disabled:text-slate-500 text-base md:text-lg font-jua rounded-2xl shadow-lg border-b-4 border-rose-700 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:border-slate-400"
            id="coordinate-fire-button"
          >
            <Crosshair className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>미사일 발사! 💥</span>
          </button>
        </form>
      )}

      {/* Input parsing guidelines & inputErrors alerts */}
      {inputError && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 text-red-700 text-xs font-medium animate-pulse">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
          <span className="leading-tight">{inputError}</span>
        </div>
      )}

      {/* Utility Area: Positioned beautifully at the bottom-right */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-1">
        {/* 마우스로 좌표 확인하기 Toggle */}
        <label className="flex items-center gap-2 px-3 py-2 bg-sky-50 hover:bg-sky-100/70 rounded-xl border border-sky-100 cursor-pointer transition-all justify-center sm:justify-start">
          <input
            type="checkbox"
            checked={showCursorLabel}
            onChange={(e) => setShowCursorLabel(e.target.checked)}
            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-sky-800 font-jua">
              🎯 마우스로 좌표 확인
            </span>
          </div>
        </label>

        {/* 처음으로 Button */}
        <button
          type="button"
          onClick={onResetGame}
          className="px-4 py-2.5 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-jua text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>처음으로</span>
        </button>
      </div>
    </div>
  );
}
