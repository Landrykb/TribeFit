'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from './Button';
import { 
  Trophy, TrendingUp, Users, Flame, Crown, 
  Medal, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { Features } from '../../lib/feature-flags';

export function SquadLeaderboards({ squads = [], tribes = [] }) {
  const [activeTab, setActiveTab] = useState('squads');
  const [expanded, setExpanded] = useState(false);
  
  if (!Features.SQUAD_LEADERBOARDS) return null;

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
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    isTop3 
                      ? 'bg-gradient-to-r from-surface-800 to-surface-700 border-primary/30' 
                      : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-surface-50 truncate">{group.name}</h4>
                      <div className={`px-2 py-0.5 rounded-full text-xs border ${
                        type === 'tribe'
                          ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                          : 'bg-primary/20 text-primary border-primary/30'
                      }`}>
                        {type}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users size={12} className="text-surface-400" />
                        <span className="text-surface-300">{group.member_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Flame size={12} className="text-orange-500" />
                        <span className="text-orange-500 font-medium">{group.streak_days || 0}d</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp size={12} className="text-accent" />
                        <span className="text-accent">{Math.round(group.participation_rate || 0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Deal Vault */}
                  <div className="text-right">
                    <div className="font-bold text-surface-50">{group.pact_balance || 0}</div>
                    <div className="text-surface-400 text-xs">TC</div>
                  </div>

                  {/* Special indicators */}
                  {isTop3 && (
                    <div className="flex-shrink-0">
                      <Star size={16} className="text-accent" />
                    </div>
                  )}
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
        
        <div className="flex bg-surface-800 rounded-lg p-1 border border-surface-700">
          <button
            onClick={() => setActiveTab('squads')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              activeTab === 'squads'
                ? 'bg-primary text-white'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            Squads
          </button>
          <button
            onClick={() => setActiveTab('tribes')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              activeTab === 'tribes'
                ? 'bg-primary text-white'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            Tribes
          </button>
        </div>
      </div>

      {activeTab === 'squads' && renderLeaderboard(squads, 'Squad Rankings', 'squad')}
      {activeTab === 'tribes' && renderLeaderboard(tribes, 'Tribe Rankings', 'tribe')}

      {/* Legend */}
      <div className="border-t border-surface-700 pt-4">
        <div className="text-surface-400 text-xs mb-2">Ranking based on:</div>
        <div className="flex items-center space-x-4 text-xs text-surface-500">
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