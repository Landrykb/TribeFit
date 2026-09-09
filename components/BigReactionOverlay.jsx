'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactionGlyph, getReactionMeta } from './ReactionTypes';

export function BigReactionOverlay({ reaction, onDone }) {
  const [visible, setVisible] = useState(true);
  const meta = reaction ? getReactionMeta(reaction.type) : null;

  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 400);
    }, 2400);
    return () => clearTimeout(t);
  }, [reaction, onDone]);

  return (
    <AnimatePresence>
      {visible && reaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          {/* ambient glow orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full blur-3xl opacity-30 ${meta.bg}`}
                initial={{ scale: 0, x: '50%', y: '50%' }}
                animate={{
                  scale: [1, 1.6, 1],
                  x: [`${20 + i * 15}%`, `${70 - i * 10}%`, `${20 + i * 15}%`],
                  y: [`${20 + i * 10}%`, `${60 - i * 8}%`, `${20 + i * 10}%`],
                }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 240, height: 240 }}
              />
            ))}
          </div>

          {/* center card */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.2, opacity: 0, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            className="relative z-10 flex flex-col items-center text-center px-8"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1.6, repeat: 2, ease: 'easeInOut' }}
              className={`relative p-10 rounded-full ${meta.bg} ring-[6px] ${meta.ring} shadow-2xl`}
            >
              <ReactionGlyph type={reaction.type} size={120} className="drop-shadow-2xl" />

              {/* orbiting sparks */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-white/80"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
                  style={{
                    x: '-50%',
                    y: '-50%',
                    transformOrigin: `${80 + i * 12}px center`,
                  }}
                />
              ))}
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-8 text-3xl font-black text-white drop-shadow-lg"
            >
              {reaction.from_user_name || 'Someone'} sent {reaction.to_user_name || 'you'} a {meta.label}!
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-lg text-surface-200 font-medium"
            >
              Tribe energy is flowing.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
