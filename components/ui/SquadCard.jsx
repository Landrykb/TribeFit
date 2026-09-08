'use client';
import React from 'react';
import { Button } from './button';
import { Card } from '@/components/ui/card';
import { 
  Users, Trophy, TrendingUp, Zap, Crown, 
  Star, ChevronRight, Flame, ArrowUp, Settings, X, AlertTriangle, Clock, Lock, Feather
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
    <Card className="card hover-elevate">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-14 h-14 bg-primary/15 border-2 border-primary/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              {getGroupIcon(squad.group_type, squad.streak_days)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2 flex-wrap">
                <h3 className="text-lg font-bold text-surface-50 truncate">{squad.name}</h3>
                {getGroupBadge(squad.group_type)}
                {squad.group_type === 'tribe' && (
                  <div className="flex items-center space-x-1 bg-primary/15 text-primary px-2 py-1 rounded-full text-xs border border-primary/30">
                    <span className="font-medium flex items-center gap-1"><Feather size={11} /> Verified</span>
                  </div>
                )}
                {squad.isPrivate && (
                  <div className="flex items-center space-x-1 bg-accent/15 text-accent px-2 py-1 rounded-full text-xs border border-accent/30">
                    <Lock size={10} />
                    <span className="font-medium">Invite Only</span>
                  </div>
                )}
              </div>
              <p className="text-surface-400 text-sm line-clamp-2">{squad.description}</p>
            </div>
          </div>
        </div>

        {/* Deletion Pending Warning */}
        {squad.deletion_pending && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 animate-pulse-soft">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle size={18} className="text-red-400" />
              <span className="font-bold text-red-400 text-sm">Deletion Scheduled</span>
            </div>
            <p className="text-xs text-red-300">
              {squad.deletion_initiated_by_name || 'Owner'} initiated deletion. 
              48 hours to download resume, claim token, and invite members to new squad.
            </p>
            {squad.deletion_scheduled_at && (
              <div className="flex items-center space-x-1 mt-2 text-xs text-red-300">
                <Clock size={12} />
                <span>Deletes: {new Date(squad.deletion_scheduled_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-surface-800/60 rounded-2xl border border-surface-700/60">
            <div className="flex items-center justify-center space-x-1">
              <Users size={16} className="text-primary" />
              <span className="font-bold text-primary">{squad.member_count || 0}</span>
            </div>
            <div className="text-xs text-surface-300 font-medium mt-1">members</div>
          </div>
          <div className="text-center p-3 bg-surface-800/60 rounded-2xl border border-surface-700/60">
            <div className="flex items-center justify-center space-x-1">
              <Flame size={16} className="text-orange-500" />
              <span className="font-bold text-orange-500">{squad.streak_days || 0}</span>
            </div>
            <div className="text-xs text-surface-300 font-medium mt-1">streak</div>
          </div>
          <div className="text-center p-3 bg-surface-800/60 rounded-2xl border border-surface-700/60">
            <div className="flex items-center justify-center space-x-1">
              <Trophy size={16} className="text-accent" />
              <span className="font-bold text-accent">{Math.round(squad.participation_rate || 0)}%</span>
            </div>
            <div className="text-xs text-surface-300 font-medium mt-1">active</div>
          </div>
        </div>

        {/* Progression Status (for squads only) */}
        {isSquad && progressionStatus && (
          <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-success">Tribe Upgrade Progress</span>
              <span className="text-xs text-success bg-success/20 px-2 py-1 rounded-lg">
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
                <div className="w-full bg-surface-700 rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progressionStatus.streakProgress}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-surface-400 mb-1">
                  <span>Participation: {squad.participation_rate}%/70%</span>
                  <span>{Math.round(progressionStatus.participationProgress)}%</span>
                </div>
                <div className="w-full bg-surface-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
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

        {/* Tribe Vault Balance (tribes only) */}
        {squad.group_type === 'tribe' && (
          <div className="flex items-center justify-between bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-accent" />
              </div>
              <div>
                <div className="text-surface-300 text-xs font-medium">Tribe Vault</div>
                <div className="font-bold text-accent text-lg">{(squad.pact_balance_tc ?? squad.pact_balance ?? 0)} TC</div>
              </div>
            </div>
          </div>
        )}

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
          ) : squad.is_member ? (
            <Button
              onClick={() => onView?.(squad)}
              variant="primary"
              className="flex-1"
            >
              <ChevronRight size={16} />
              Details
            </Button>
          ) : squad.isPrivate ? (
            <Button
              variant="ghost"
              className="flex-1 cursor-not-allowed opacity-50"
              disabled
              title="This is a private squad. You need an invitation to join."
            >
              <Lock size={16} />
              Invite Only
            </Button>
          ) : (
            <Button
              onClick={() => onJoin?.(squad)}
              variant="primary"
              className="flex-1"
            >
              <Users size={16} />
              Join {isSquad ? 'Squad' : 'Tribe'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}