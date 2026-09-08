import React, { useMemo } from 'react';

const COLORS = ['#A3E635', '#FF5436', '#FFD166', '#2EC4B6', '#F72585', '#8CE99A'];

// Lightweight CSS confetti burst - no dependencies.
export function Confetti({ count = 40 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 0.9 + Math.random() * 0.8,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
    round: Math.random() > 0.5,
  })), [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
