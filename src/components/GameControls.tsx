import React, { useRef, useEffect } from 'react';
import { Play, RotateCcw, AlertCircle, Crosshair, HelpCircle } from 'lucide-react';
import { GameMode, GameStatus } from '../types';

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
}: GameControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Maintain focus on the input box after firing or when playing
  useEffect(() => {
    if (gameStatus === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus, inputValue]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Regular expression: only allow digits, comma, dot, minus, and space
    // Strip everything else to enforce coordinates format strictly in real time
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

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-5 border-2 border-teal-200 shadow-md flex flex-col gap-4">
      
      {/* 1. 좌표 입력 공간 with Large Parenthesis ( ) design constraints */}
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

        {/* 2. Action Fire Button */}
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

      {/* Input parsing guidelines & inputErrors alerts */}
      {inputError && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 text-red-700 text-xs font-medium animate-pulse">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
          <span className="leading-tight">{inputError}</span>
        </div>
      )}

      {/* 3. Utility Area: Positioned beautifully at the bottom-right */}
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
