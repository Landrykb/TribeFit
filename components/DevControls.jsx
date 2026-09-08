'use client';

import React, { useState } from 'react';
import { 
  Users, Settings, Zap, Target, Plus, X, ChevronDown, 
  Coins, Dumbbell, Flame, Shield, TrendingUp, RefreshCw, Award, UserPlus, Crown, Star, Trophy
} from 'lucide-react';
import { Button } from './ui/button';

export function DevControls({ 
  user,
  onCreateUser,
  onSwitchUser,
  onUpdateStats,
  onUpdateSquadStats,
  onAddToGroup,
  onTriggerSkip,
  onTriggerSnatch,
  onAddBalance,
  onAddProgress,
  onRefreshData,
  testUsers,
  groups,
  squads
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [selectedUser, setSelectedUser] = useState(user?.id || '');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Quick stat adjustments
  const adjustStreak = (amount) => {
    onUpdateStats({ streak: (user?.streak || 0) + amount });
  };

  const adjustWorkouts = (amount) => {
    onUpdateStats({ total_workouts: (user?.total_workouts || 0) + amount });
  };

  const setMaxStats = () => {
    onUpdateStats({
      streak: 30,
      total_workouts: 100,
      wallet_balance_tc: 1000,
      snatched_balance_tc: 500
    });
  };

  const createTestUser = () => {
    if (!newUserName.trim()) {
      const randomNames = [
        'Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'James Kim',
        'Lisa Thompson', 'David Martinez', 'Jessica Wu', 'Tom Anderson'
      ];
      const name = randomNames[Math.floor(Math.random() * randomNames.length)];
      onCreateUser(name);
      setNewUserName('');
    } else {
      onCreateUser(newUserName);
      setNewUserName('');
    }
  };

  const quickFillCoachRequirements = () => {
    onUpdateStats({
      streak: 14,
      total_workouts: 30,
      group_type: 'tribe'
    });
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="lg"
        >
          <Shield size={20} className="mr-2" />
          Dev Controls
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-surface-800 light:bg-white border border-purple-500/30 light:border-purple-300 rounded-lg shadow-2xl w-96 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-white" />
          <h3 className="font-bold text-white">Developer Controls</h3>
        </div>
        <Button
          onClick={() => setIsExpanded(false)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <ChevronDown size={18} />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Current User Info */}
        <div className="p-3 bg-purple-500/10 light:bg-purple-50 rounded-lg border border-purple-500/30 light:border-purple-200">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-surface-400 light:text-gray-600">Current User</div>
            <div className="flex gap-1">
              {onRefreshData && (
                <Button
                  onClick={onRefreshData}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw size={12} className="mr-1" />
                  Refresh
                </Button>
              )}
              <Button
                onClick={async () => {
                  if (confirm('Reset database to clean state? This will delete all test data.')) {
                    await fetch('/api/dev/reset', { method: 'POST' });
                    window.location.reload();
                  }
                }}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
              >
                <X size={12} className="mr-1" />
                Reset DB
              </Button>
            </div>
          </div>
          <div className="font-bold text-surface-50 light:text-gray-900">{user?.name || user?.id || 'None'}</div>
          <div className="text-xs text-surface-400 light:text-gray-500 mb-1">ID: {user?.id || 'N/A'}</div>
          <div className="text-xs text-surface-300 light:text-gray-600 mt-1">
            🔥 {user?.streak || 0} days • 💪 {user?.total_workouts || 0} workouts
          </div>
          <div className="text-xs text-surface-300 light:text-gray-600">
            💰 {user?.wallet_balance_tc || 0} TC • ⚡ {user?.snatched_balance_tc || 0} Snatched
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="text-sm font-semibold text-surface-200 light:text-gray-700 mb-2">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={setMaxStats}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Zap size={14} className="mr-1" />
              Max Stats
            </Button>
            <Button
              onClick={quickFillCoachRequirements}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Award size={14} className="mr-1" />
              Coach Ready
            </Button>
            <Button
              onClick={() => adjustStreak(7)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Flame size={14} className="mr-1" />
              +7 Streak
            </Button>
            <Button
              onClick={() => adjustWorkouts(10)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Dumbbell size={14} className="mr-1" />
              +10 Workouts
            </Button>
            <Button
              onClick={() => onAddBalance(500)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Coins size={14} className="mr-1" />
              +500 TC
            </Button>
            <Button
              onClick={() => onTriggerSnatch(100)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Target size={14} className="mr-1" />
              +100 Snatch
            </Button>
          </div>
        </div>

        {/* Manual Stat Adjustments */}
        <div>
          <div className="text-sm font-semibold text-surface-200 light:text-gray-700 mb-2">Adjust Stats</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-xs text-surface-400 light:text-gray-600 mb-1">Streak Days</div>
                <div className="flex gap-1">
                  <Button onClick={() => adjustStreak(-1)} variant="outline" size="sm" className="flex-1">-1</Button>
                  <Button onClick={() => adjustStreak(1)} variant="outline" size="sm" className="flex-1">+1</Button>
                  <Button onClick={() => adjustStreak(14)} variant="outline" size="sm" className="flex-1">+14</Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-xs text-surface-400 light:text-gray-600 mb-1">Total Workouts</div>
                <div className="flex gap-1">
                  <Button onClick={() => adjustWorkouts(-5)} variant="outline" size="sm" className="flex-1">-5</Button>
                  <Button onClick={() => adjustWorkouts(5)} variant="outline" size="sm" className="flex-1">+5</Button>
                  <Button onClick={() => adjustWorkouts(30)} variant="outline" size="sm" className="flex-1">+30</Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-xs text-surface-400 light:text-gray-600 mb-1">Wallet TC</div>
                <div className="flex gap-1">
                  <Button onClick={() => onAddBalance(-100)} variant="outline" size="sm" className="flex-1">-100</Button>
                  <Button onClick={() => onAddBalance(100)} variant="outline" size="sm" className="flex-1">+100</Button>
                  <Button onClick={() => onAddBalance(500)} variant="outline" size="sm" className="flex-1">+500</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Squad Evolution Testing */}
        <div className="p-3 bg-accent/5 light:bg-accent-50 rounded-lg border border-accent/20 light:border-accent-200">
          <div className="text-sm font-semibold text-accent light:text-accent-700 mb-2 flex items-center gap-2">
            <Crown size={16} />
            Tribe Evolution Testing
          </div>
          <div className="text-xs text-surface-400 light:text-gray-600 mb-3">
            Requirements: 5+ members, 30+ streak, 70%+ participation
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                const currentSquad = squads?.find(s => s.id === user?.group_id);
                if (!currentSquad) {
                  alert('Join a squad first! Select a squad from the Groups section below.');
                  return;
                }
                onUpdateSquadStats(currentSquad.id, { streak_days: 30 });
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Flame size={14} className="mr-1" />
              Set Squad 30 Streak
            </Button>
            <Button
              onClick={() => {
                const currentSquad = squads?.find(s => s.id === user?.group_id);
                if (!currentSquad) {
                  alert('Join a squad first! Select a squad from the Groups section below.');
                  return;
                }
                onUpdateSquadStats(currentSquad.id, { participation_rate: 80 });
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Trophy size={14} className="mr-1" />
              Set 80% Active
            </Button>
            <Button
              onClick={() => {
                alert('Add 5+ users to squad: Use "Join Group" button below for each user');
              }}
              variant="outline"
              size="sm"
              className="text-xs col-span-2"
            >
              <Users size={14} className="mr-1" />
              Add Members (5+)
            </Button>
          </div>
          <div className="mt-2 text-xs text-surface-400 light:text-gray-600">
            💡 Join a squad first, then use these buttons to trigger evolution
          </div>
        </div>

        {/* User Management */}
        <div>
          <div className="text-sm font-semibold text-surface-200 light:text-gray-700 mb-2">User Management</div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="New user name (or random)"
                className="flex-1 px-3 py-2 text-sm bg-surface-700 light:bg-gray-50 border border-surface-600 light:border-gray-300 rounded text-surface-100 light:text-gray-900 placeholder:text-surface-500 light:placeholder:text-gray-400"
              />
              <Button
                onClick={createTestUser}
                variant="outline"
                size="sm"
              >
                <UserPlus size={14} />
              </Button>
            </div>

            {testUsers && testUsers.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {testUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`p-2 rounded text-xs flex items-center justify-between cursor-pointer transition-all ${
                      u.id === user?.id
                        ? 'bg-purple-500/30 light:bg-purple-100 border-2 border-purple-500 light:border-purple-400 shadow-lg shadow-purple-500/20'
                        : 'bg-surface-700 light:bg-gray-100 hover:bg-surface-600 light:hover:bg-gray-200 border border-transparent'
                    }`}
                    onClick={() => onSwitchUser(u.id)}
                  >
                    <div>
                      <div className="font-semibold text-surface-100 light:text-gray-900">{u.name}</div>
                      <div className="text-surface-400 light:text-gray-600">
                        🔥 {u.streak || 0} • 💪 {u.total_workouts || 0}
                      </div>
                    </div>
                    {u.id === user?.id && (
                      <Crown size={14} className="text-purple-400" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Group Management */}
        {groups && groups.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-surface-200 light:text-gray-700 mb-2">Join Group</div>
            <div className="space-y-2">
              {groups.map((g) => (
                <Button
                  key={g.id}
                  onClick={() => onAddToGroup(g.id, g.group_type)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                >
                  <Users size={14} className="mr-2" />
                  <span className="flex-1 text-left">{g.name}</span>
                  <span className="text-xs opacity-60">
                    {g.group_type === 'tribe' ? '🪶' : '🔥'}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Avatar state tester */}
        <div>
          <div className="text-sm font-semibold text-surface-200 light:text-gray-700 mb-2">Avatar State (Tribeling)</div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: '+1 workout', patch: { __addWorkout: 1 } },
              { label: '+5 workouts', patch: { __addWorkout: 5 } },
              { label: 'Streak → 0', patch: { streak: 0 } },
              { label: 'Streak → 7', patch: { streak: 7 } },
              { label: 'Ads → 0', patch: { ads: 0 } },
              { label: 'Ads → 3 (couch)', patch: { ads: 3 } },
            ].map(({ label, patch }) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                className="justify-start text-xs"
                onClick={async () => {
                  try {
                    const uid = user?.id;
                    if (!uid) return;
                    let body = { action: 'debug_set', userId: uid, ...patch };
                    if (patch.__addWorkout) {
                      const cur = await fetch(`/api/avatar?userId=${encodeURIComponent(uid)}`).then(r => r.json());
                      body.workouts = (cur?.avatar?.stage_progress?.current || 0) + patch.__addWorkout;
                      delete body.__addWorkout;
                    }
                    await fetch('/api/avatar', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body),
                    });
                    onRefreshData?.();
                  } catch (_) {}
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Test Scenarios */}
        <div>
          <div className="text-sm font-semibold text-surface-200 light:text-gray-700 mb-2">Test Scenarios</div>
          <div className="space-y-2">
            <Button
              onClick={() => onTriggerSkip()}
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <Zap size={14} className="mr-2" />
              Trigger Skip Notification
            </Button>
            <Button
              onClick={() => onTriggerSnatch(50)}
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <Target size={14} className="mr-2" />
              Receive Snatched TC (50)
            </Button>
            <Button
              onClick={() => {
                onUpdateStats({ streak: 0 });
                setTimeout(() => {
                  onUpdateStats({ streak: 1 });
                }, 100);
              }}
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs text-red-400 hover:text-red-300"
            >
              <Flame size={14} className="mr-2" />
              Break Streak (Reset to 0)
            </Button>
            {onAddProgress && (
              <>
                <Button
                  onClick={() => onAddProgress(5)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs text-success"
                >
                  <Dumbbell size={14} className="mr-2" />
                  Add 5 Workout Sessions
                </Button>
                <Button
                  onClick={() => onAddProgress(10)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs text-success"
                >
                  <Dumbbell size={14} className="mr-2" />
                  Add 10 Workout Sessions
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Presets */}
        <div>
          <div className="text-sm font-semibold text-surface-200 light:text-gray-700 mb-2">User Presets</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onUpdateStats({
                streak: 5,
                total_workouts: 10,
                wallet_balance_tc: 200,
                group_type: 'squad'
              })}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Star size={14} className="mr-1" />
              Newbie
            </Button>
            <Button
              onClick={() => onUpdateStats({
                streak: 14,
                total_workouts: 30,
                wallet_balance_tc: 500,
                group_type: 'tribe'
              })}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Award size={14} className="mr-1" />
              Coach Ready
            </Button>
            <Button
              onClick={() => onUpdateStats({
                streak: 30,
                total_workouts: 100,
                wallet_balance_tc: 1000,
                group_type: 'tribe'
              })}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Trophy size={14} className="mr-1" />
              Veteran
            </Button>
            <Button
              onClick={() => onUpdateStats({
                streak: 100,
                total_workouts: 500,
                wallet_balance_tc: 5000,
                snatched_balance_tc: 2000,
                group_type: 'tribe'
              })}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Crown size={14} className="mr-1" />
              Legend
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-surface-400 light:text-gray-500 pt-2 border-t border-surface-700 light:border-gray-200">
          💡 Tip: Create multiple users in different browser tabs to test group interactions
        </div>
      </div>
    </div>
  );
}
