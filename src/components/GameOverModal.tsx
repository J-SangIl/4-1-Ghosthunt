import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Heart, RotateCcw } from 'lucide-react';
import { GameMode } from '../types';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  currentMode: GameMode;
  onRestart: () => void;
}

export default function GameOverModal({
  isOpen,
  score,
  highScore,
  currentMode,
  onRestart,
}: GameOverModalProps) {
  if (!isOpen) return null;

  // Personalized encouraging/motivational review based on students' performance
  const getFeedback = (points: number) => {
    if (points >= 20) {
      return {
        title: "🌌 우주 좌표 정령 마스터!",
        desc: "대단해! 소수점 좌표까지 자와 각도기처럼 정밀하게 파악하는 좌표계의 전설이 되었어! 중학교 1학년 수학 전교 1등은 따놓은 당상이야! 🏆",
        emoji: "👑"
      };
    } else if (points >= 11) {
      return {
        title: "✨ 베테랑 어드벤처러!",
        desc: "소수점(0.5) 단위 유령들까지 무찔렀구나! 음수와 양수의 방향을 헷갈리지 않고 정확히 저격했어. 정말 훌륭한 실력이야! 🏹",
        emoji: "⭐"
      };
    } else if (points >= 5) {
      return {
        title: "👦 장난꾸러기 초급 포수!",
        desc: "좌표평면의 양수(+), 음수(-) 성질을 잘 이해하고 있어! 소수점 좌표도 조금만 조심해서 눈금을 읽어보면 곧 만점을 받을 수 있을 거야! 화이팅! 🌱",
        emoji: "🎯"
      };
    } else {
      return {
        title: "🥚 귀여운 수학 아기병아리!",
        desc: "괜찮아! 원점(0,0)에서 출발해서 가로는 X축, 세로는 Y축이란 사실 하나만 확실하게 기억해도 절반은 성공이야! 다시 한번 가이드선을 보며 복습할까? 🐥",
        emoji: "📖"
      };
    }
  };

  const review = getFeedback(score);
  const isNewRecord = score >= highScore && score > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-4 border-teal-500 flex flex-col"
        >
          {/* Decorative Header Canvas */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-center text-white relative">
            <div className="absolute top-2 right-4 text-white/10 text-8xl font-black select-none pointer-events-none">
              (x,y)
            </div>
            
            <motion.div 
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"
            >
              <span className="text-5xl">{review.emoji}</span>
            </motion.div>
            
            <h2 className="text-2xl font-black font-jua tracking-wide">
              {review.title}
            </h2>
            <p className="text-teal-100 text-xs font-mono font-bold mt-1">
              GAME OVER - {currentMode === 'easy' ? '쉬운 모드 (연습)' : '일반 모드 (서바이벌)'}
            </p>
          </div>

          {/* Core Score Panel */}
          <div className="p-6 flex flex-col items-center gap-5">
            
            {/* High score celebratory tag */}
            {isNewRecord && (
              <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 animate-bounce flex items-center gap-1 font-jua">
                🎉 축하해! 개인 최고 기록 달성!
              </span>
            )}

            <div className="grid grid-cols-2 gap-4 w-full">
              {/* Acquired Score */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-slate-500 mb-1 font-jua">미사일 명중 점수</span>
                <span className="text-3xl font-black text-rose-500 font-jua">
                  {score} <span className="text-sm font-medium text-slate-600 font-sans">점</span>
                </span>
              </div>

              {/* High Score History */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-slate-500 mb-1 font-jua">모드 최고 기록</span>
                <span className="text-3xl font-black text-emerald-600 font-jua">
                  {highScore} <span className="text-sm font-medium text-slate-600 font-sans">점</span>
                </span>
              </div>
            </div>

            {/* Motivational detailed feedback for Middle schoolers */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/80 text-left">
              <span className="text-xs font-bold text-teal-800 font-jua block mb-1">📝 소탕 작전 평가 보고서:</span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {review.desc}
              </p>
            </div>

            {/* Quick Summary Info */}
            <div className="flex gap-4 text-xs font-bold text-slate-500 font-jua">
              <span className="flex items-center gap-1">❤️ 하트 잔량: 0 / 3</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">👾 적 대형: 중1 좌표평면</span>
            </div>

            {/* CTA action to restart */}
            <button
              onClick={onRestart}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-jua text-lg rounded-2xl cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-b-4 border-emerald-800"
            >
              <RotateCcw className="w-5 h-5" />
              <span>좌표평면 유령 잡으러 다시 가기!</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
