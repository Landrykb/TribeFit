'use client';
import React from 'react';
import { motion } from 'motion/react';

// Animated circular progress ring around the avatar — fills toward next streak milestone.
export function StreakRing({ streak = 0, goal = 7, size = 96, children, active = false }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(1, (streak || 0) / goal);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A3E635" />
            <stop offset="100%" stopColor="#FF5436" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#3B3B4F" strokeWidth={stroke} opacity="0.4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#streakGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - progress) }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          style={active ? { filter: 'drop-shadow(0 0 6px rgba(163,230,53,0.7))' } : undefined}
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default StreakRing;
