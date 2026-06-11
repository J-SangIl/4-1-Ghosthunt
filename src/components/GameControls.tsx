import React, { useRef, useEffect } from 'react';
import { Play, RotateCcw, AlertCircle, Crosshair, HelpCircle, Flame } from 'lucide-react';
import { GameMode, GameStatus, MissionCondition, ConditionTargetPoint } from '../types';

function FocusGuideIndicator({ text = "다음 단계는 여기를 집중하면 된다! 📍" }: { text?: string }) {
  return (
    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-jua px-2.5 py-1 rounded-lg shadow-lg border border-amber-300 font-bold whitespace-nowrap animate-bounce flex items-center gap-1 z-30 text-[10px] sm:text-xs">
      <span>{text}</span>
    </div>
  );
}

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

  // 튜토리얼용 Props
  activeTutorialMode?: 'sniper' | 'sweeper' | null;
  tutorialStep?: number;
  sweeperStepSuccess?: boolean;
  onSetupSniperStep?: (step: number) => void;
  onSetupSweeperStep?: (step: number) => void;
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
  activeTutorialMode = null,
  tutorialStep = 0,
  sweeperStepSuccess = false,
  onSetupSniperStep,
  onSetupSweeperStep,
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
      
      {/* 튜토리얼 안내 및 진행 대시보드 */}
      {activeTutorialMode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-4 rounded-xl flex flex-col gap-2 shadow-sm text-left">
          <div className="flex justify-between items-center border-b border-amber-200 pb-1.5 gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-black font-jua text-amber-950 flex items-center gap-1.5">
              {activeTutorialMode === 'sniper' ? '🎯 저격 조준 훈련 (튜토리얼)' : '💥 다중 소탕 훈련 (튜토리얼)'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (activeTutorialMode === 'sniper') {
                    onSetupSniperStep?.(0);
                  } else {
                    onSetupSweeperStep?.(0);
                  }
                }}
                className="text-[10px] font-jua bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded cursor-pointer transition-all active:scale-95"
                title="처음부터 다시 학습하기"
              >
                튜토리얼 처음부터 🔄
              </button>
              <span className="text-[9px] font-sans bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                {tutorialStep === 0 ? '준비 훈련' : `실전 단계 ${tutorialStep}`}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
            {activeTutorialMode === 'sniper' ? (
              tutorialStep === 0 ? (
                "유령을 맞추는 조준 훈련입니다.\n가로축과 세로축의 위치를 읽어 타격하는 기초 교육을 시작해 봅시다."
              ) : tutorialStep === 1 ? (
                "우측으로 5칸, 위쪽으로 4칸 위치에 표적이 포착되었습니다. 우측과 위쪽은 양수(+)로 나타냅니다.\n하단 입력란에 `5, 4`를 입력하고 엔터를 눌러 발사하세요!"
              ) : tutorialStep === 2 ? (
                "가로축에서 **좌측은 -(음수)**로 나타냅니다. 따라서 좌측으로 3칸(-3), 위쪽으로 2칸(2) 위치입니다.\n하단 입력란에 `-3, 2`를 입력하고 격멸해 보세요!"
              ) : (
                "세로축에서 **아래쪽은 -(음수)**로 나타냅니다. 따라서 우측으로 5칸(5), 아래쪽으로 2칸(-2) 위치입니다.\n하단 입력란에 `5, -2`를 입력해 사격해 보세요!"
              )
            ) : (
              tutorialStep === 0 ? (
                "조건에 충족되는 목표 유령들을 찾아서 격파하는 훈련입니다.\n시민을 피해 목표 조건에 맞는 유령만 클릭해 보세요."
              ) : tutorialStep === 1 ? (
                "아래에 유령이 숨어있는 위치에 대한 힌트가 나와있습니다.\n힌트에 해당되는 점을 클릭해 마킹한 후 [미사일 폭격!] 버튼을 눌러주세요."
              ) : tutorialStep === 2 ? (
                "**(-4, 3)** 위치의 유령 점을 클릭해 마킹해 보세요.\n체크를 완료한 후 아래의 미사일 폭격 버튼을 누릅니다."
              ) : tutorialStep === 3 ? (
                "Y축(세로선) 위에 있는 유령 점 3개를 모두 클릭해보세요.\n3개의 점을 모두 체크한 후 미사일을 발사하세요."
              ) : (
                "**제2사분면 (왼쪽 위 영역)** 안의 유령 3개를 전부 클릭해 보세요.\n모두 체크한 후 미사일을 발사해 주세요!"
              )
            )}
          </div>

          <div className="flex gap-2 justify-end pt-1 border-t border-amber-200/60 mt-1">
            {activeTutorialMode === 'sniper' && tutorialStep === 0 && (
              <div className="relative inline-block mt-8 mb-1">
                <FocusGuideIndicator text="다음 단계는 여기를 집중하면 된다! 📍" />
                <button
                  type="button"
                  onClick={() => onSetupSniperStep?.(1)}
                  className="px-4 py-1.5 font-jua text-[12px] bg-amber-500 hover:bg-amber-600 text-white rounded-lg cursor-pointer transition-all shadow-sm tutorial-focus-glow"
                >
                  훈련 개시하기 🚀
                </button>
              </div>
            )}
            {activeTutorialMode === 'sweeper' && tutorialStep === 0 && (
              <div className="relative inline-block mt-8 mb-1">
                <FocusGuideIndicator text="다음 단계는 여기를 집중하면 된다! 📍" />
                <button
                  type="button"
                  onClick={() => onSetupSweeperStep?.(1)}
                  className="px-4 py-1.5 font-jua text-[12px] bg-amber-500 hover:bg-amber-600 text-white rounded-lg cursor-pointer transition-all shadow-sm tutorial-focus-glow"
                >
                  훈련 개시하기 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 튜토리얼 0단계 준비 중일 때는 사격 인풋 비활성 플레이스홀더 제공 */}
      {activeTutorialMode && tutorialStep === 0 ? (
        <div className="py-4 px-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-sans">
          위의 훈련 [훈련 개시하기 🚀] 버튼을 물으면 조준 학습이 시작됩니다!
        </div>
      ) : isConditionMode ? (
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
            <div className={`relative w-full ${activeTutorialMode === 'sweeper' && tutorialStep && tutorialStep > 0 ? 'tutorial-focus-glow rounded-xl mt-8' : ''}`}>
              {activeTutorialMode === 'sweeper' && tutorialStep && tutorialStep > 0 && (
                <FocusGuideIndicator text="다음 단계는 여기를 집중하면 된다! 📍" />
              )}
              <button
                onClick={() => onConditionNext?.()}
                className={`w-full py-3.5 bg-gradient-to-r ${
                  activeTutorialMode === 'sweeper' && !sweeperStepSuccess
                    ? 'from-rose-500 to-red-650 hover:from-rose-600 hover:to-red-700 border-red-800'
                    : 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-emerald-800'
                } text-white text-sm sm:text-base font-jua rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-b-4 animate-pulse`}
              >
                <span>
                  {activeTutorialMode === 'sweeper' && !sweeperStepSuccess
                    ? '동일 단계 다시 진행 🔁'
                    : '다음 작전지로 이동 ➡️'}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className={`relative w-full ${activeTutorialMode === 'sweeper' && tutorialStep && tutorialStep > 0 && conditionGameState === 'selecting' && selectedCount > 0 ? 'tutorial-focus-glow rounded-xl mt-8' : ''}`}>
                {activeTutorialMode === 'sweeper' && tutorialStep && tutorialStep > 0 && conditionGameState === 'selecting' && selectedCount > 0 && (
                  <FocusGuideIndicator text="다음 단계는 여기를 집중하면 된다! 📍" />
                )}
                <button
                  onClick={() => onConditionFire?.()}
                  disabled={gameStatus !== 'playing' || conditionGameState !== 'selecting' || selectedCount === 0}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-red-650 hover:from-rose-600 hover:to-red-700 text-white disabled:from-slate-200 disabled:to-slate-350 disabled:text-slate-500 text-sm sm:text-base font-jua rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-b-4 border-red-800 disabled:border-slate-400"
                >
                  <Flame className="w-5 h-5 fill-white" />
                  <span>
                    {conditionGameState === 'firing'
                      ? '미사일 포격 진행 중... 🚀'
                      : `미사일 폭격! (${selectedCount}개 선택됨)`}
                  </span>
                </button>
              </div>

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
              <span className="text-[11px] font-bold text-teal-800 font-jua">유령의 좌표 입력</span>
            </div>

             <div className="flex items-center justify-center gap-1.5 w-full">
              {/* Giant Left bracket */}
              <span className="text-5xl md:text-6xl text-teal-600/90 font-extrabold select-none tracking-tight font-gaegu">(</span>
              
              {/* Real Text Input */}
              <div className={`relative ${activeTutorialMode === 'sniper' && tutorialStep && tutorialStep > 0 ? 'tutorial-focus-glow rounded-xl mt-6' : ''}`}>
                {activeTutorialMode === 'sniper' && tutorialStep && tutorialStep > 0 && (
                  <FocusGuideIndicator text="다음 단계는 여기를 집중하면 된다! 📍" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  disabled={gameStatus !== 'playing'}
                  placeholder=""
                  className="text-center w-40 sm:w-52 h-14 bg-white disabled:bg-slate-100 text-teal-950 font-mono text-xl sm:text-2xl font-extrabold border-2 border-teal-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-200 focus:border-teal-500 shadow-inner px-2 tracking-wide placeholder:text-slate-300 transition-all"
                  id="coordinate-shooting-input"
                />
              </div>

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
        {/* 마우스로 좌표 확인하기 Toggle (소탕모드에서만 표시) */}
        {isConditionMode && (
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
        )}

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
