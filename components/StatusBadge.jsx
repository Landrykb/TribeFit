'use client';

import React from 'react';
import { Trophy, Award, Star, Crown, Flame, Dumbbell } from 'lucide-react';

export function StatusBadge({ streak, totalWorkouts, size = 'md' }) {
  // Determine status tier
  const getStatus = () => {
    if (streak >= 100 && totalWorkouts >= 500) {
      return {
        name: 'Legend',
        icon: Crown,
        color: 'from-yellow-400 to-amber-600',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400'
      };
    }
    if (streak >= 30 && totalWorkouts >= 100) {
      return {
        name: 'Veteran',
        icon: Trophy,
        color: 'from-purple-400 to-pink-600',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400'
      };
    }
    if (streak >= 14 && totalWorkouts >= 30) {
      return {
        name: 'Coach Ready',
        icon: Award,
        color: 'from-blue-400 to-cyan-600',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400'
      };
    }
    return {
      name: 'Newbie',
      icon: Star,
      color: 'from-green-400 to-emerald-600',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400'
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  const sizes = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 12,
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 14,
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 18,
      text: 'text-base'
    }
  };

  const s = sizes[size];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full ${status.bg} ${status.border} border ${s.container} font-semibold transition-all hover:scale-105`}>
      <Icon size={s.icon} className={status.text} />
      <span className={`bg-gradient-to-r ${status.color} bg-clip-text text-transparent ${s.text}`}>
        {status.name}
      </span>
    </div>
  );
}

export function StatusBadgeWithProgress({ streak, totalWorkouts }) {
  const getNextTier = () => {
    if (streak >= 100 && totalWorkouts >= 500) {
      return null; // Already at max
    }
    if (streak >= 30 && totalWorkouts >= 100) {
      return {
        name: 'Legend',
        streakNeeded: Math.max(0, 100 - streak),
        workoutsNeeded: Math.max(0, 500 - totalWorkouts)
      };
    }
    if (streak >= 14 && totalWorkouts >= 30) {
      return {
        name: 'Veteran',
        streakNeeded: Math.max(0, 30 - streak),
        workoutsNeeded: Math.max(0, 100 - totalWorkouts)
      };
    }
    return {
      name: 'Coach Ready',
      streakNeeded: Math.max(0, 14 - streak),
      workoutsNeeded: Math.max(0, 30 - totalWorkouts)
    };
  };

  const nextTier = getNextTier();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-surface-300 light:text-gray-600">Status:</span>
        <StatusBadge streak={streak} totalWorkouts={totalWorkouts} size="md" />
      </div>
      
      {nextTier && (
        <div className="text-xs text-surface-400 light:text-gray-500 space-y-1">
          <div className="font-medium text-surface-300 light:text-gray-600">
            Next: {nextTier.name}
          </div>
          {nextTier.streakNeeded > 0 && (
            <div className="flex items-center gap-1"><Flame size={12} className="text-accent" /> {nextTier.streakNeeded} more days streak</div>
          )}
          {nextTier.workoutsNeeded > 0 && (
            <div className="flex items-center gap-1"><Dumbbell size={12} className="text-primary-300" /> {nextTier.workoutsNeeded} more workouts</div>
          )}
        </div>
      )}
      
      {!nextTier && (
        <div className="text-xs text-yellow-400 font-medium">
          Maximum status achieved!
        </div>
      )}
    </div>
  );
}
