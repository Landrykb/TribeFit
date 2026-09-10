import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Dumbbell, Hand, Laugh, Zap, Heart, Smile, HelpCircle,
  ThumbsUp, Eye, Skull, MoonStar, Feather, Annoyed, Drama, Bot,
  Brain, Angry, Snowflake
} from 'lucide-react';

export const REACTION_TYPES = [
  { type: 'fire',    label: 'Fire',    Icon: Flame,     color: 'text-accent',       bg: 'bg-accent/20',       ring: 'ring-accent/50' },
  { type: 'flex',    label: 'Flex',    Icon: Dumbbell,  color: 'text-success',      bg: 'bg-success/20',      ring: 'ring-success/50' },
  { type: 'clap',    label: 'Clap',    Icon: Hand,      color: 'text-primary-300',  bg: 'bg-primary-300/20',  ring: 'ring-primary-300/50' },
  { type: 'lol',     label: 'LOL',     Icon: Laugh,     color: 'text-warning',      bg: 'bg-warning/20',      ring: 'ring-warning/50' },
  { type: 'go',      label: 'Go!',     Icon: Zap,       color: 'text-yellow-400',   bg: 'bg-yellow-400/20',   ring: 'ring-yellow-400/50' },
  { type: 'heart',   label: 'Love',    Icon: Heart,     color: 'text-danger',       bg: 'bg-danger/20',       ring: 'ring-danger/50' },
  { type: 'wow',     label: 'Wow',     Icon: Smile,     color: 'text-info',         bg: 'bg-info/20',         ring: 'ring-info/50' },
  { type: 'thinking', label: 'Hmm',    Icon: HelpCircle, color: 'text-surface-300',  bg: 'bg-surface-300/20',  ring: 'ring-surface-300/50' },
];

export const REACTION_TYPE_MAP = Object.fromEntries(REACTION_TYPES.map(r => [r.type, r]));

export function getReactionMeta(type) {
  return REACTION_TYPE_MAP[type] || REACTION_TYPES[0];
}

export function ReactionGlyph({ type, size = 16, className = '' }) {
  const meta = getReactionMeta(type);
  if (!meta) return null;
  return (
    <motion.span
      className={`inline-flex ${meta.color} ${className}`}
      whileHover={{ scale: 1.25, rotate: [0, -8, 8, 0] }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 14 }}
    >
      <meta.Icon size={size} />
    </motion.span>
  );
}
