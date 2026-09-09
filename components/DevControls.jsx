'use client';

import React, { useState } from 'react';
import {
  Users, Settings, Zap, Target, Plus, X, ChevronDown,
  Coins, Dumbbell, Flame, Shield, TrendingUp, RefreshCw, Award,
  UserPlus, Crown, Star, Trophy, Loader2, CircleDollarSign, Calendar,
  Activity, Bell, Wallet
} from 'lucide-react';
import { Button } from './ui/button';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="border-b border-surface-700 light:border-gray-200 pb-4 last:border-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-surface-200 light:text-gray-700 mb-3">
        {Icon && <Icon size={16} />}
        {title}
      </div>
      {children}
    </div>
  );
}

function ActionButton({ onClick, children, disabled, variant = 'outline', className = '', size = 'sm' }) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={`text-xs ${className}`}
    >
      {disabled && <Loader2 size={14} className="mr-1 animate-spin" />}
      {children}
    </Button>
  );
}

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
  const [loading, setLoading] = useState({});

  const setBusy = (key, busy) => setLoading(prev => ({ ...prev, [key]: busy }));

  const withLoading = (key, fn) => async (...args) => {
    setBusy(key, true);
    try {
      await fn(...args);
      onRefreshData?.();
    } finally {
      setBusy(key, false);
    }
  };

  const adjustStreak = withLoading('stats', async (amount) => {
    await onUpdateStats({ streak: Math.max(0, (user?.streak || 0) + amount) });
  });

  const adjustWorkouts = withLoading('stats', async (amount) => {
    await onUpdateStats({ total_workouts: Math.max(0, (user?.total_workouts || 0) + amount) });
  });

  const setMaxStats = withLoading('stats', async () => {
    await onUpdateStats({
      streak: 30,
      total_workouts: 100,
      wallet_balance_tc: 1000,
      snatched_balance_tc: 500
    });
  });

  const createTestUser = withLoading('createUser', async () => {
    const randomNames = [
      'Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'James Kim',
      'Lisa Thompson', 'David Martinez', 'Jessica Wu', 'Tom Anderson'
    ];
    const name = newUserName.trim() || randomNames[Math.floor(Math.random() * randomNames.length)];
    await onCreateUser(name);
    setNewUserName('');
  });

  const quickFillCoachRequirements = withLoading('stats', async () => {
    await onUpdateStats({ streak: 14, total_workouts: 30, group_type: 'tribe' });
  });

  const handlePreset = withLoading('stats', async (updates) => {
    await onUpdateStats(updates);
  });

  const handleAddToGroup = withLoading('join', async (groupId) => {
    await onAddToGroup(groupId);
  });

  const currentGroup = squads?.find(s => s.id === user?.group_id);

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
    <div className="fixed bottom-4 right-4 z-50 bg-surface-800 light:bg-white border border-purple-500/30 light:border-primary-300 rounded-lg shadow-2xl w-96 max-h-[85vh] overflow-y-auto">
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
        <Section title="Current User" icon={Users}>
          <div className="p-3 bg-purple-500/10 light:bg-primary-50 rounded-lg border border-purple-500/30 light:border-primary-200">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-surface-400 light:text-gray-600">Current User</div>
              <div className="flex gap-1">
                {onRefreshData && (
                  <ActionButton onClick={onRefreshData} size="sm" className="h-6 px-2">
                    <RefreshCw size={12} className="mr-1" />
                    Refresh
                  </ActionButton>
                )}
                <ActionButton
                  onClick={async () => {
                    if (confirm('Reset local dev state? Supabase data is not affected.')) {
                      await fetch('/api/dev/reset', { method: 'POST' });
                      window.location.reload();
                    }
                  }}
                  size="sm"
                  className="h-6 px-2 text-red-400 hover:text-red-300"
                >
                  <X size={12} className="mr-1" />
                  Reset
                </ActionButton>
              </div>
            </div>
            <div className="font-bold text-surface-50 light:text-gray-900">{user?.name || user?.id || 'None'}</div>
            <div className="text-xs text-surface-400 light:text-gray-500 mb-1">ID: {user?.id || 'N/A'}</div>
            <div className="text-xs text-surface-300 light:text-gray-600 mt-1 flex items-center gap-1">
              <Flame size={12} /> {user?.streak || 0} days
              <Dumbbell size={12} className="ml-2" /> {user?.total_workouts || 0} workouts
            </div>
            <div className="text-xs text-surface-300 light:text-gray-600 flex items-center gap-1">
              <Coins size={12} /> {user?.wallet_balance_tc || 0} TC
              <Target size={12} className="ml-2" /> {user?.snatched_balance_tc || 0} Snatched
            </div>
          </div>
        </Section>

        <Section title="Quick Actions" icon={Zap}>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton onClick={setMaxStats} disabled={loading.stats}>
              <Zap size={14} className="mr-1" />
              Max Stats
            </ActionButton>
            <ActionButton onClick={quickFillCoachRequirements} disabled={loading.stats}>
              <Award size={14} className="mr-1" />
              Coach Ready
            </ActionButton>
            <ActionButton onClick={() => adjustStreak(7)} disabled={loading.stats}>
              <Flame size={14} className="mr-1" />
              +7 Streak
            </ActionButton>
            <ActionButton onClick={() => adjustWorkouts(10)} disabled={loading.stats}>
              <Dumbbell size={14} className="mr-1" />
              +10 Workouts
            </ActionButton>
            <ActionButton onClick={() => onAddBalance(500)} disabled={loading.balance}>
              <Coins size={14} className="mr-1" />
              +500 TC
            </ActionButton>
            <ActionButton onClick={() => onTriggerSnatch(100)} disabled={loading.snatch}>
              <Target size={14} className="mr-1" />
              +100 Snatch
            </ActionButton>
          </div>
        </Section>

        <Section title="Adjust Stats" icon={TrendingUp}>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-surface-400 light:text-gray-600 mb-1 flex items-center gap-1"><Flame size={12} /> Streak Days</div>
              <div className="flex gap-1">
                <ActionButton onClick={() => adjustStreak(-1)} disabled={loading.stats} className="flex-1">-1</ActionButton>
                <ActionButton onClick={() => adjustStreak(1)} disabled={loading.stats} className="flex-1">+1</ActionButton>
                <ActionButton onClick={() => adjustStreak(14)} disabled={loading.stats} className="flex-1">+14</ActionButton>
              </div>
            </div>
            <div>
              <div className="text-xs text-surface-400 light:text-gray-600 mb-1 flex items-center gap-1"><Dumbbell size={12} /> Total Workouts</div>
              <div className="flex gap-1">
                <ActionButton onClick={() => adjustWorkouts(-5)} disabled={loading.stats} className="flex-1">-5</ActionButton>
                <ActionButton onClick={() => adjustWorkouts(5)} disabled={loading.stats} className="flex-1">+5</ActionButton>
                <ActionButton onClick={() => adjustWorkouts(30)} disabled={loading.stats} className="flex-1">+30</ActionButton>
              </div>
            </div>
            <div>
              <div className="text-xs text-surface-400 light:text-gray-600 mb-1 flex items-center gap-1"><Wallet size={12} /> Wallet TC</div>
              <div className="flex gap-1">
                <ActionButton onClick={() => onAddBalance(-100)} disabled={loading.balance} className="flex-1">-100</ActionButton>
                <ActionButton onClick={() => onAddBalance(100)} disabled={loading.balance} className="flex-1">+100</ActionButton>
                <ActionButton onClick={() => onAddBalance(500)} disabled={loading.balance} className="flex-1">+500</ActionButton>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Tribe Evolution Testing" icon={Crown}>
          <div className="p-3 bg-accent/5 light:bg-accent-50 rounded-lg border border-accent/20 light:border-accent-200">
            <div className="text-xs text-surface-400 light:text-gray-600 mb-3">
              Requirements: 5+ members, 30+ streak, 70%+ participation
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                onClick={() => currentGroup && onUpdateSquadStats(currentGroup.id, { streak_days: 30 })}
                disabled={loading.squad || !currentGroup}
              >
                <Flame size={14} className="mr-1" />
                Set 30 Streak
              </ActionButton>
              <ActionButton
                onClick={() => currentGroup && onUpdateSquadStats(currentGroup.id, { participation_rate: 80 })}
                disabled={loading.squad || !currentGroup}
              >
                <Trophy size={14} className="mr-1" />
                Set 80% Active
              </ActionButton>
              <ActionButton
                onClick={() => alert('Use the Join Group list below to add 5+ members to the squad/tribe.')}
                className="col-span-2"
                disabled={loading.squad}
              >
                <Users size={14} className="mr-1" />
                Add Members (5+)
              </ActionButton>
            </div>
            <div className="mt-2 text-xs text-surface-400 light:text-gray-600 flex items-center gap-1">
              <Crown size={12} />
              {currentGroup ? `Active: ${currentGroup.name}` : 'No active tribe/squad'}
            </div>
          </div>
        </Section>

        <Section title="User Management" icon={UserPlus}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="New user name (or random)"
                className="flex-1 px-3 py-2 text-sm bg-surface-700 light:bg-gray-50 border border-surface-600 light:border-gray-300 rounded text-surface-100 light:text-gray-900 placeholder:text-surface-500 light:placeholder:text-gray-400"
              />
              <ActionButton onClick={createTestUser} disabled={loading.createUser}>
                <UserPlus size={14} />
              </ActionButton>
            </div>

            {testUsers && testUsers.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {testUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u.id)}
                    className={`w-full p-2 rounded text-xs flex items-center justify-between transition-all text-left ${
                      u.id === user?.id
                        ? 'bg-purple-500/30 light:bg-primary-100 border-2 border-purple-500 light:border-primary-400 shadow-lg shadow-purple-500/20'
                        : 'bg-surface-700 light:bg-gray-100 hover:bg-surface-600 light:hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-surface-100 light:text-gray-900">{u.name}</div>
                      <div className="text-surface-400 light:text-gray-600 flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><Flame size={10} /> {u.streak || 0}</span>
                        <span className="flex items-center gap-0.5"><Dumbbell size={10} /> {u.total_workouts || 0}</span>
                      </div>
                    </div>
                    {u.id === user?.id && <Crown size={14} className="text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>

        {groups && groups.length > 0 && (
          <Section title="Join Group" icon={Users}>
            <div className="space-y-2">
              {groups.map((g) => (
                <ActionButton
                  key={g.id}
                  onClick={() => handleAddToGroup(g.id)}
                  disabled={loading.join}
                  className="w-full justify-start"
                >
                  <Users size={14} className="mr-2" />
                  <span className="flex-1 text-left">{g.name}</span>
                  <span className="text-xs opacity-60">
                    {g.group_type === 'tribe' ? 'Tribe' : 'Squad'}
                  </span>
                </ActionButton>
              ))}
            </div>
          </Section>
        )}

        <Section title="Avatar State (Tribeling)" icon={Activity}>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: '+1 workout', patch: { __addWorkout: 1 } },
              { label: '+5 workouts', patch: { __addWorkout: 5 } },
              { label: 'Streak to 0', patch: { streak: 0 } },
              { label: 'Streak to 7', patch: { streak: 7 } },
            ].map(({ label, patch }) => (
              <ActionButton
                key={label}
                onClick={async () => {
                  const uid = user?.id;
                  if (!uid) return;
                  try {
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
                className="justify-start"
              >
                {label}
              </ActionButton>
            ))}
          </div>
        </Section>

        <Section title="Test Scenarios" icon={Bell}>
          <div className="space-y-2">
            <ActionButton onClick={onTriggerSkip} disabled={loading.skip} className="w-full justify-start">
              <Zap size={14} className="mr-2" />
              Trigger Paid Skip (10 TC)
            </ActionButton>
            <ActionButton onClick={() => onTriggerSnatch(50)} disabled={loading.snatch} className="w-full justify-start">
              <Target size={14} className="mr-2" />
              Receive Snatched TC (50)
            </ActionButton>
            <ActionButton
              onClick={withLoading('stats', async () => {
                await onUpdateStats({ streak: 0 });
              })}
              disabled={loading.stats}
              className="w-full justify-start text-red-400 hover:text-red-300"
            >
              <Flame size={14} className="mr-2" />
              Break Streak (Reset to 0)
            </ActionButton>
            {onAddProgress && (
              <>
                <ActionButton onClick={() => onAddProgress(5)} disabled={loading.progress} className="w-full justify-start text-success">
                  <Dumbbell size={14} className="mr-2" />
                  Add 5 Workout Sessions
                </ActionButton>
                <ActionButton onClick={() => onAddProgress(10)} disabled={loading.progress} className="w-full justify-start text-success">
                  <Calendar size={14} className="mr-2" />
                  Add 10 Workout Sessions
                </ActionButton>
              </>
            )}
          </div>
        </Section>

        <Section title="User Presets" icon={Star}>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton onClick={() => handlePreset({ streak: 5, total_workouts: 10, wallet_balance_tc: 200, group_type: 'squad' })} disabled={loading.stats}>
              <Star size={14} className="mr-1" />
              Newbie
            </ActionButton>
            <ActionButton onClick={() => handlePreset({ streak: 14, total_workouts: 30, wallet_balance_tc: 500, group_type: 'tribe' })} disabled={loading.stats}>
              <Award size={14} className="mr-1" />
              Coach Ready
            </ActionButton>
            <ActionButton onClick={() => handlePreset({ streak: 30, total_workouts: 100, wallet_balance_tc: 1000, group_type: 'tribe' })} disabled={loading.stats}>
              <Trophy size={14} className="mr-1" />
              Veteran
            </ActionButton>
            <ActionButton onClick={() => handlePreset({ streak: 100, total_workouts: 500, wallet_balance_tc: 5000, snatched_balance_tc: 2000, group_type: 'tribe' })} disabled={loading.stats}>
              <Crown size={14} className="mr-1" />
              Legend
            </ActionButton>
          </div>
        </Section>

        <div className="text-xs text-surface-400 light:text-gray-500 pt-2 border-t border-surface-700 light:border-gray-200 flex items-start gap-1">
          <Settings size={12} className="mt-0.5 shrink-0" />
          Create users and join them to groups to test tribe interactions.
        </div>
      </div>
    </div>
  );
}
