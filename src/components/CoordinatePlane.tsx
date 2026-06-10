import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, BulletEffect, Coordinate, GameMode, GameStatus } from '../types';

interface CoordinatePlaneProps {
  ghosts: Ghost[];
  activeBullet: BulletEffect | null;
  currentMode: GameMode;
  gameStatus: GameStatus;
  showCursorLabel: boolean; // Show mouse coordinate tracking
}

export default function CoordinatePlane({
  ghosts,
  activeBullet,
  currentMode,
  gameStatus,
  showCursorLabel,
}: CoordinatePlaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCoord, setHoverCoord] = useState<Coordinate | null>(null);

  // Convert game coordinate (-10 to 10) to SVG viewbox (0 to 400)
  const toSvgX = (x: number) => 200 + x * 20;
  const toSvgY = (y: number) => 200 - y * 20;

  // Convert mouse client coordinates to game coordinate relative to the grid container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || gameStatus !== 'playing') return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    // Convert pixels to -10 to 10
    const rawX = ((relativeX / rect.width) * 20) - 10;
    const rawY = 10 - ((relativeY / rect.height) * 20);

    // Snap based on difficulty (if show decimals, we snap to 0.5, else round to integer)
    // To make user hovering friendly, let's show nearest 0.5 coordinate
    const snappedX = Math.round(rawX * 2) / 2;
    const snappedY = Math.round(rawY * 2) / 2;

    // Bound coordinates between -10 and 10
    const finalX = Math.max(-10, Math.min(10, snappedX));
    const finalY = Math.max(-10, Math.min(10, snappedY));

    setHoverCoord({ x: finalX, y: finalY });
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  // Generate ticks for label rendering (All integers from -9 to 9 excluding 0 to prevent cutoff at edges)
  const ticks = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-square max-w-[calc(100vh-145px)] bg-white rounded-3xl border-4 border-teal-600 shadow-xl overflow-hidden cursor-crosshair select-none"
        id="coordinate-grid-wrapper"
      >
        {/* SVG Game Grid */}
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full bg-white"
        >
          {/* Subtle Grid Lines */}
          {Array.from({ length: 21 }).map((_, i) => {
            const coord = i - 10;
            const svgPos = toSvgX(coord);
            const isCenter = coord === 0;

            return (
              <React.Fragment key={`grid-${coord}`}>
                {/* Vertical Grid Line */}
                <line
                  x1={svgPos}
                  y1={0}
                  x2={svgPos}
                  y2={400}
                  stroke={isCenter ? '#0284c7' : '#bae6fd'}
                  strokeWidth={isCenter ? 1.5 : 0.75}
                />
                {/* Horizontal Grid Line */}
                <line
                  x1={0}
                  y1={svgPos}
                  x2={400}
                  y2={svgPos}
                  stroke={isCenter ? '#0284c7' : '#bae6fd'}
                  strokeWidth={isCenter ? 1.5 : 0.75}
                />
              </React.Fragment>
            );
          })}

          {/* X and Y axes arrowhead triangles */}
          {/* X axis arrowhead pointing right */}
          <polygon points="400,200 388,194 388,206" fill="#0284c7" />
          
          {/* Y axis arrowhead pointing up */}
          <polygon points="200,0 194,12 206,12" fill="#0284c7" />

          {/* Red Glowing Origin Dot (0,0) */}
          <circle 
            cx={200} 
            cy={200} 
            r={5.5} 
            fill="#ef4444" 
            stroke="#ffffff" 
            strokeWidth={1} 
            className="drop-shadow-[0_0_4px_rgba(239,68,68,0.9)]" 
          />

          {/* Grid Ticks & Labels */}
          {ticks.map((val) => {
            const svgX = toSvgX(val);
            const svgY = toSvgY(val);

            return (
              <React.Fragment key={`label-${val}`}>
                {/* X-axis tick */}
                <line x1={svgX} y1={200 - 3} x2={svgX} y2={200 + 3} stroke="#0284c7" strokeWidth={1.5} />
                <text
                  x={svgX}
                  y={200 + 15}
                  fill="#334155"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  className="font-bold select-none"
                >
                  {val}
                </text>

                {/* Y-axis tick */}
                <line x1={200 - 3} y1={svgY} x2={200 + 3} y2={svgY} stroke="#0284c7" strokeWidth={1.5} />
                <text
                  x={200 - 8}
                  y={svgY + 3}
                  fill="#334155"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                  className="font-bold select-none"
                >
                  {val}
                </text>
              </React.Fragment>
            );
          })}

          {/* Origin Label (O) */}
          <text
            x={184}
            y={215}
            fill="#0284c7"
            fontSize="12"
            fontFamily="Jua"
            className="font-bold select-none"
          >
            O
          </text>

          {/* X and Y labels */}
          <text
            x={392}
            y={187}
            fill="#0284c7"
            fontSize="14"
            fontFamily="JetBrains Mono"
            textAnchor="end"
            className="font-extrabold italic select-none"
          >
            x
          </text>
          <text
            x={215}
            y={15}
            fill="#0284c7"
            fontSize="14"
            fontFamily="JetBrains Mono"
            className="font-extrabold italic select-none"
          >
            y
          </text>
        </svg>

        {/* Absolute DOM Overlays for Ghosts, Lasers, Trajectories and Explosions */}
        <div className="absolute inset-0 pointer-events-none">
          
          {/* Firing Laser Stream / Bullet Motion */}
          {activeBullet && (
            <>
              {/* Bullet animation */}
              <AnimatePresence>
                {activeBullet.status === 'flying' && (() => {
                  const angleScreen = Math.atan2(-activeBullet.y, activeBullet.x) * (180 / Math.PI);
                  const rotationAngle = angleScreen + 45;
                  return (
                    <motion.div
                      className="absolute text-2xl -ml-3 -mt-3 z-10"
                      initial={{ left: '50%', top: '50%', scale: 0.2, rotate: rotationAngle }}
                      animate={{ 
                        left: `${50 + activeBullet.x * 5}%`, 
                        top: `${50 - activeBullet.y * 5}%`,
                        scale: [0.2, 1.2, 1],
                        rotate: rotationAngle
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      🚀
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Explosion animation */}
              <AnimatePresence>
                {activeBullet.status === 'exploding' && (
                  <motion.div
                    className="absolute -ml-8 -mt-8 flex flex-col items-center justify-center z-20"
                    style={{ 
                      left: `${50 + activeBullet.x * 5}%`, 
                      top: `${50 - activeBullet.y * 5}%` 
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: [0, 1.5, 1.2], opacity: [1, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-4xl">💥</span>
                    <span className="text-[10px] font-mono font-bold bg-black/80 text-amber-400 px-1 py-0.5 mt-1 rounded">
                      ({activeBullet.x}, {activeBullet.y})
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Renders Active Ghosts */}
          {gameStatus === 'playing' && ghosts.map((ghost) => {
            const leftPercent = 50 + ghost.x * 5;
            const topPercent = 50 - ghost.y * 5;

            // Is the ghost coordinate decimal (has 0.5)? Let's style differently to notice
            const isDecimal = ghost.x % 1 !== 0 || ghost.y % 1 !== 0;

            return (
              <div
                key={ghost.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 transition-all duration-300"
                style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              >
                {/* Floating motion ghost (Y-axis bobbing removed to keep center perfectly matching target y) */}
                <motion.div
                  animate={{ 
                    scale: isDecimal ? [0.95, 1.05, 0.95] : [1, 1.08, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: isDecimal ? 1.4 : 2, 
                    ease: "easeInOut" 
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  {/* Highlight aura if decimal targeting is needed */}
                  {isDecimal && (
                    <span className="absolute -inset-1.5 rounded-full bg-rose-500/25 blur-sm animate-ping duration-1000" />
                  )}

                  {/* Pacman Red Ghost SVG: 13px wide, 20.8px tall (vertical ratio adjusted to 0.8x) */}
                  <svg 
                    viewBox="0 0 32 32" 
                    className="w-[13px] h-[20.8px] drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)] select-none"
                    preserveAspectRatio="none"
                  >
                    {/* Ghost Red Body */}
                    <path 
                      d="M16,2 C8.27,2 2,8.27 2,16 L2,28 L6.5,24 L11,28 L16,24 L21,28 L25.5,24 L30,28 L30,16 C30,8.27 23.73,2 16,2 Z" 
                      fill={isDecimal ? "#f43f5e" : "#ef4444"} 
                    />
                    {/* Left Eye Whites */}
                    <ellipse cx="11" cy="13" rx="3.5" ry="4.5" fill="#ffffff" />
                    {/* Left Eye Pupil (looking slightly rightward) */}
                    <circle cx="12" cy="13" r="1.8" fill="#000000" />
                    {/* Right Eye Whites */}
                    <ellipse cx="21" cy="13" rx="3.5" ry="4.5" fill="#ffffff" />
                    {/* Right Eye Pupil (looking slightly rightward) */}
                    <circle cx="22" cy="13" r="1.8" fill="#000000" />
                  </svg>
                </motion.div>

                {/* Normal Mode Survivor Progress/Timer Bar absolute to prevent shifting */}
                {currentMode === 'normal' && (
                  <div className="absolute top-[48px] left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-700/80 rounded-full overflow-hidden shadow-inner border border-slate-600/50">
                    <div 
                      className={`h-full transition-all duration-100 ${
                        (ghost.timeLeft / ghost.maxTime) > 0.5 
                          ? 'bg-emerald-500' 
                          : (ghost.timeLeft / ghost.maxTime) > 0.25 
                            ? 'bg-amber-400' 
                            : 'bg-rose-500 animate-pulse'
                      }`}
                      style={{ width: `${(ghost.timeLeft / ghost.maxTime) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Mouse Hover Snapping Visualized */}
          {hoverCoord && gameStatus === 'playing' && (
            <div
              className="absolute w-6 h-6 border-2 border-dashed border-rose-400 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
              style={{ 
                left: `${50 + hoverCoord.x * 5}%`, 
                top: `${50 - hoverCoord.y * 5}%` 
              }}
            >
              <div className="w-1 h-1 bg-rose-400 rounded-full" />
              {showCursorLabel && (
                <span className="absolute left-7 bg-indigo-950/95 text-cyan-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow border border-cyan-800">
                  {`(${hoverCoord.x}, ${hoverCoord.y})`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
