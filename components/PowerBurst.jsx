'use client';
import React, { useMemo } from 'react';
import { motion } from 'motion/react';

// PowerBurst: spring-physics celebration — expanding rings, radial beams,
// orbiting sparks and a center flash, all with real spring motion.
const SPARK_COLORS = ['#7C5CFF', '#FF5436', '#FFD166', '#2EC4B6'];

export function PowerBurst() {
  const sparks = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * 360 + (Math.random() * 20 - 10),
      dist: 70 + Math.random() * 60,
      size: 3 + Math.random() * 6,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      delay: Math.random() * 0.12,
    })), []);

  const beams = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * 360 + 22,
      len: 44 + Math.random() * 34,
      width: 3 + Math.random() * 3,
    })), []);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-50 overflow-hidden" aria-hidden="true">
      {/* center flash */}
      <motion.div
        className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-primary to-accent"
        initial={{ scale: 0, opacity: 0.9, filter: 'blur(20px)' }}
        animate={{ scale: [0, 1.5, 1.9], opacity: [0.9, 0.4, 0] }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* expanding rings — spring overshoot */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: 70, height: 70, border: `2.5px solid ${SPARK_COLORS[i]}` }}
          initial={{ scale: 0.1, opacity: 1 }}
          animate={{ scale: 4.4, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 12, delay: i * 0.12 }}
        />
      ))}
      {/* radial beams */}
      {beams.map((b, i) => (
        <motion.div
          key={`b${i}`}
          className="absolute"
          style={{ rotate: b.angle }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 0], y: -b.len }}
          transition={{ duration: 0.75, ease: 'easeOut', delay: 0.05 }}
        >
          <div
            className="rounded-full"
            style={{ width: b.width, height: b.len, background: `linear-gradient(to top, #FF5436, transparent)` }}
          />
        </motion.div>
      ))}
      {/* orbiting sparks — spring out then fade */}
      {sparks.map((s, i) => (
        <motion.div
          key={`s${i}`}
          className="absolute"
          initial={{ x: 0, y: 0, scale: 0.3, opacity: 1 }}
          animate={{
            x: Math.cos((s.angle * Math.PI) / 180) * s.dist,
            y: Math.sin((s.angle * Math.PI) / 180) * s.dist,
            scale: [0.3, 1.2, 0.6],
            opacity: [1, 1, 0],
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: s.delay }}
        >
          <div
            className="rounded-full"
            style={{ width: s.size, height: s.size, background: s.color, boxShadow: `0 0 10px ${s.color}` }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default PowerBurst;
