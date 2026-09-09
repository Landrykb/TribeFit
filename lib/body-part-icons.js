import React from 'react';
import {
  Dumbbell, Shield, Layers, Zap, Footprints, Target, HeartPulse, Flame, LayoutGrid
} from 'lucide-react';

export const BODY_PART_ICONS = {
  all: LayoutGrid,
  chest: Dumbbell,
  back: Shield,
  shoulders: Layers,
  arms: Zap,
  legs: Footprints,
  core: Target,
  cardio: HeartPulse,
  fullbody: Flame,
};

export function BodyPartIcon({ id, size = 16, className = '' }) {
  const Icon = BODY_PART_ICONS[id] || Dumbbell;
  return <Icon size={size} className={className} />;
}
