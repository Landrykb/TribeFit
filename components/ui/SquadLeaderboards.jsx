'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from './button';
import { 
  Trophy, TrendingUp, Users, Flame, Crown, 
  Medal, Star, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import { Features } from '../../lib/feature-flags';

export function SquadLeaderboards({ squads = [], tribes = [], onSquadClick, onJoinSquad, user }) {
  const [activeTab, setActiveTab] = useState('squads');
  const [expanded, setExpanded] = useState(false);
  
  if (!Features.SQUAD_LEADERBOARDS) return null;

  const handleGroupClick = (group) => {
    if (onSquadClick) {
      onSquadClick(group);
    }
  };

  const handleJoinClick = (e, group) => {
    e.stopPropagation(); // Prevent triggering the group click
    if (onJoinSquad) {
      onJoinSquad(group);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown size={20} className="text-yellow-500" />;
      case 2: return <Medal size={20} className="text-gray-400" />;
      case 3: return <Medal size={20} className="text-amber-600" />;
      default: return <div className="w-5 h-5 bg-surface-700 rounded-full flex items-center justify-center text-xs text-surface-400">{rank}</div>;
    }
  };

  const getGroupIcon = (type) => {
    return type === 'tribe' 
      ? <Crown size={16} className="text-yellow-500" />
      : <Flame size={16} className="text-primary" />;
  };

  const renderLeaderboard = (groups, title, type) => {
    const sortedGroups = [...groups].sort((a, b) => {
      // Primary sort: streak days (descending)
      if (b.streak_days !== a.streak_days) {
        return b.streak_days - a.streak_days;
      }
      // Secondary sort: participation rate (descending)
      return b.participation_rate - a.participation_rate;
    });

    const displayGroups = expanded ? sortedGroups : sortedGroups.slice(0, 5);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-surface-50 flex items-center space-x-2">
            {getGroupIcon(type)}
            <span>{title}</span>
          </h3>
          <div className="text-surface-400 text-sm">{sortedGroups.length} total</div>
        </div>

        {displayGroups.length === 0 ? (
          <div className="text-center py-8 text-surface-400">
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p>No {type}s yet</p>
            <p className="text-sm">Be the first to create one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayGroups.map((group, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={group.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    isTop3
                      ? 'bg-surface-800/80 border-primary/30 light:bg-primary-50 light:border-primary/30'
                      : 'bg-surface-800/60 border-surface-700/60 light:bg-white light:border-gray-200'
                  }`}
                  onClick={() => handleGroupClick(group)}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-9 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-surface-50 truncate text-sm">{group.name}</h4>
                      {isTop3 && <Star size={12} className="text-accent flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-surface-400 mt-0.5">
                      <span className="flex items-center gap-1"><Users size={11} />{group.member_count || 0}</span>
                      <span className="flex items-center gap-1 text-accent"><Flame size={11} />{group.streak_days || 0}d</span>
                      <span className="flex items-center gap-1"><TrendingUp size={11} />{Math.round(group.participation_rate || 0)}%</span>
                    </div>
                  </div>

                  {/* Right: TC + status */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <div className="font-bold text-surface-50 text-sm leading-none">{group.pact_balance || 0}<span className="text-[10px] font-medium text-surface-400 ml-0.5">TC</span></div>
                    {group.is_member ? (
                      <span className="inline-flex items-center gap-1 bg-success/15 text-success border border-success/30 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold">
                        <Check size={10} /> Member
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleJoinClick(e, group)}
                        className="bg-primary text-surface-950 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                      >
                        {type === 'squad' ? 'Join' : 'Request'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {sortedGroups.length > 5 && (
              <Button
                onClick={() => setExpanded(!expanded)}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show All ({sortedGroups.length - 5} more)
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-surface-50 flex items-center space-x-2">
          <Trophy size={24} className="text-accent" />
          <span>Leaderboards</span>
        </h2>
        
        <div className="flex bg-surface-800 light:bg-white rounded-lg p-1 border border-surface-700 light:border-gray-200">
          <button
            onClick={() => setActiveTab('squads')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              activeTab === 'squads'
                ? 'bg-primary text-surface-950'
                : 'text-surface-400 hover:text-surface-200 light:text-gray-600 light:hover:text-gray-800'
            }`}
          >
            Squads
          </button>
          <button
            onClick={() => setActiveTab('tribes')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              activeTab === 'tribes'
                ? 'bg-primary text-surface-950'
                : 'text-surface-400 hover:text-surface-200 light:text-gray-600 light:hover:text-gray-800'
            }`}
          >
            Tribes
          </button>
        </div>
      </div>
      {activeTab === 'squads' && renderLeaderboard(squads, 'Squad Rankings', 'squad')}
      {activeTab === 'tribes' && renderLeaderboard(tribes, 'Tribe Rankings', 'tribe')}

      {/* Legend */}
      <div className="border-t border-surface-700 light:border-gray-200 pt-4">
        <div className="text-surface-400 light:text-gray-600 text-xs mb-2">Ranking based on:</div>
        <div className="flex items-center space-x-4 text-xs text-surface-500 light:text-gray-500">
          <div className="flex items-center space-x-1">
            <Flame size={10} className="text-orange-500" />
            <span>Streak Days</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp size={10} className="text-accent" />
            <span>Participation Rate</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={10} className="text-surface-400" />
            <span>Active Members</span>
          </div>
        </div>
      </div>
    </Card>
  );
}