import React from 'react';
import {
  ThumbsUp, Laugh, Eye, Skull, Flame, MoonStar, Feather,
  Hand, Annoyed, Drama, Bot, Dumbbell, Brain, Angry, Snowflake,
  Heart, Zap, Smile, HelpCircle
} from 'lucide-react';

// Emoji → Lucide icon mapping for reactions (keys stay emoji for API/state compat)
export const REACTION_ICONS = {
  '👍': { Icon: ThumbsUp,  className: 'text-primary-300' },
  '😂': { Icon: Laugh,     className: 'text-accent' },
  '👀': { Icon: Eye,       className: 'text-surface-300' },
  '💀': { Icon: Skull,     className: 'text-surface-400' },
  '🔥': { Icon: Flame,     className: 'text-accent' },
  '😴': { Icon: MoonStar,  className: 'text-primary-300' },
  '🪶': { Icon: Feather,   className: 'text-surface-300' },
  '👏': { Icon: Hand,      className: 'text-success' },
  '🙄': { Icon: Annoyed,   className: 'text-surface-400' },
  '🤡': { Icon: Drama,     className: 'text-accent' },
  '🤖': { Icon: Bot,       className: 'text-primary-300' },
  '💪': { Icon: Dumbbell,  className: 'text-success' },
  '🧠': { Icon: Brain,     className: 'text-primary' },
  '😡': { Icon: Angry,     className: 'text-danger' },
  '🥶': { Icon: Snowflake, className: 'text-info' },
  '😅': { Icon: Laugh,     className: 'text-warning' },
  '❤️': { Icon: Heart,     className: 'text-danger' },
  '⚡': { Icon: Zap,       className: 'text-warning' },
  '😮': { Icon: Smile,     className: 'text-warning' },
  '🤔': { Icon: HelpCircle,className: 'text-surface-300' },
};

// Reaction type keys (ReactionsPanel) → emoji key into REACTION_ICONS
export const REACTION_TYPE_EMOJI = {
  fire: '🔥', flex: '💪', clap: '👏', lol: '😅',
  go: '⚡', heart: '❤️', wow: '😮', thinking: '🤔',
};

export function ReactionGlyph({ emoji, size = 16, className = '' }) {
  const meta = REACTION_ICONS[emoji];
  if (!meta) return <span className={className} style={{ fontSize: size }}>{emoji}</span>;
  return <meta.Icon size={size} className={`${meta.className} ${className}`} />;
}
