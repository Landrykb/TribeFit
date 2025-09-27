'use client';
import React from 'react';
import { Button } from './Button';
import { Card } from './card';
import { 
  Users, Trophy, TrendingUp, Zap, Crown, 
  Star, ChevronRight, Flame, ArrowUp
} from 'lucide-react';
import { SquadProgression } from '../../lib/squad-progression';

export function SquadCard({ squad, onJoin, onUpgrade, onView, isOwner = false }) {
  const progressionStatus = SquadProgression.getProgressionStatus(squad);
  const isSquad = squad.group_type === 'squad';
  const canUpgrade = progressionStatus?.isEligible && isOwner;
  
  const getGroupIcon = (type, streak) => {
    if (type === 'tribe') return <Crown size={20} className="text-yellow-500" />;
    if (streak >= 30) return <Flame size={20} className="text-orange-500" />;
    return <Zap size={20} className="text-primary" />;
  };

  const getGroupBadge = (type) => {
    if (type === 'tribe') {
      return (
        <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs border border-yellow-500/30">
          <Crown size={12} />
          <span className="font-medium">Tribe</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 bg-primary/20 text-primary px-2 py-1 rounded-full text-xs border border-primary/30">
        <Flame size={12} />
        <span className="font-medium">Squad</span>
      </div>
    );
  };

  return (
    <Card className="card-interactive hover:border-primary/40 transition-all">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-12 h-12 bg-gradient-tribal rounded-xl flex items-center justify-center flex-shrink-0">
              {getGroupIcon(squad.group_type, squad.streak_days)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-surface-50 truncate">{squad.name}</h3>
                {getGroupBadge(squad.group_type)}
              </div>
              <p className="text-surface-400 text-sm line-clamp-2">{squad.description}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Users size={16} className="text-surface-400" />
              <span className="font-bold text-surface-50">{squad.member_count || 0}</span>
            </div>
            <div className="text-xs text-surface-500">members</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Flame size={16} className="text-orange-500" />
              <span className="font-bold text-orange-500">{squad.streak_days || 0}</span>
            </div>
            <div className="text-xs text-surface-500">streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Trophy size={16} className="text-accent" />
              <span className="font-bold text-accent">{Math.round(squad.participation_rate || 0)}%</span>
            </div>
            <div className="text-xs text-surface-500">active</div>
          </div>
        </div>

        {/* Progression Status (for squads only) */}
        {isSquad && progressionStatus && (
          <div className="bg-surface-800 rounded-lg p-3 border border-surface-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-surface-200">Tribe Upgrade Progress</span>
              <span className="text-xs text-surface-400">
                {Math.round(progressionStatus.overallProgress)}%
              </span>
            </div>
            
            {/* Progress bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-surface-400 mb-1">
                  <span>Streak: {squad.streak_days}/30 days</span>
                  <span>{Math.round(progressionStatus.streakProgress)}%</span>
                </div>
                <div className="w-full bg-surface-700 rounded-full h-1.5">
                  <div 
                    className="bg-orange-500 h-1.5 rounded-full transition-all" 
                    style={{ width: `${progressionStatus.streakProgress}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-surface-400 mb-1">
                  <span>Participation: {squad.participation_rate}%/70%</span>
                  <span>{Math.round(progressionStatus.participationProgress)}%</span>
                </div>
                <div className="w-full bg-surface-700 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all" 
                    style={{ width: `${progressionStatus.participationProgress}%` }}
                  />
                </div>
              </div>
            </div>
            
            {progressionStatus.isEligible && (
              <div className="mt-2 flex items-center space-x-2 text-success text-xs">
                <Star size={12} />
                <span className="font-medium">Ready for Tribe upgrade!</span>
              </div>
            )}
          </div>
        )}

        {/* Deal Vault Balance */}
        <div className="flex items-center justify-between bg-surface-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-accent" />
            </div>
            <div>
              <div className="text-surface-400 text-xs">Deal Vault</div>
              <div className="font-bold text-surface-50">{squad.pact_balance || 0} TC</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {canUpgrade ? (
            <Button
              onClick={() => onUpgrade?.(squad)}
              variant="success"
              className="flex-1 animate-pulse-soft"
            >
              <ArrowUp size={16} />
              Upgrade to Tribe
            </Button>
          ) : (
            <Button
              onClick={() => onView?.(squad)}
              variant="primary"
              className="flex-1"
            >
              <ChevronRight size={16} />
              {squad.is_member ? 'View Details' : 'Join ' + (isSquad ? 'Squad' : 'Tribe')}
            </Button>
          )}
          
          {!squad.is_member && (
            <Button
              onClick={() => onJoin?.(squad)}
              variant="ghost"
              size="sm"
            >
              <Users size={16} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}