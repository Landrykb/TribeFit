'use client';

import React, { useState } from 'react';
import { X, Settings, Users, Zap, Calendar, Vote, Shield, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

export function GroupSettingsModal({ 
  isOpen, 
  onClose, 
  groupType, // 'tribe' or 'squad'
  settings,
  onSave,
  canEdit = true
}) {
  const [draft, setDraft] = useState(settings || {});
  const [showVoteWarning, setShowVoteWarning] = useState(false);

  if (!isOpen) return null;

  const isTribe = groupType === 'tribe';

  const handleSave = () => {
    if (isTribe && settings && draft.skip_mode !== settings.skip_mode) {
      // Skip mode change requires vote
      setShowVoteWarning(true);
      return;
    }
    onSave(draft);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-800 light:bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-surface-700 light:border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-accent p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-white" />
            <h2 className="text-2xl font-bold text-white">
              {isTribe ? 'Tribe' : 'Squad'} Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning for vote requirement */}
          {showVoteWarning && (
            <div className="p-4 bg-warning/10 light:bg-yellow-50 border border-warning/30 light:border-yellow-300 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-warning light:text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-bold text-warning light:text-yellow-700">Vote Required</div>
                  <div className="text-sm text-surface-300 light:text-gray-600 mt-1">
                    Skip mode changes require a tribe vote. Please propose this change to your tribe members.
                  </div>
                  <Button
                    onClick={() => {
                      onClose();
                      // This should trigger a vote proposal
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    Propose Vote
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Read-only warning for non-editable settings */}
          {!canEdit && (
            <div className="p-4 bg-primary/10 light:bg-blue-50 border border-primary/30 light:border-blue-300 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-primary light:text-blue-600 mt-0.5" />
                <div className="text-sm text-surface-300 light:text-gray-600">
                  Settings are read-only. Only tribe/squad admins can modify settings.
                </div>
              </div>
            </div>
          )}

          {/* Active Window */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-surface-200 light:text-gray-700 font-medium">
              <Calendar size={18} className="text-primary" />
              <span>Active Member Window</span>
            </div>
            <div className="text-sm text-surface-400 light:text-gray-600 mb-2">
              Members are considered active if they've worked out in the last N days
            </div>
            <input
              type="number"
              min="1"
              max="30"
              value={draft.active_window_days || 7}
              onChange={(e) => setDraft({...draft, active_window_days: parseInt(e.target.value)})}
              disabled={!canEdit}
              className="w-full px-4 py-2 rounded-lg border border-surface-700 light:border-gray-300 bg-surface-900 light:bg-white text-surface-100 light:text-gray-900 disabled:opacity-50"
            />
            <div className="text-xs text-surface-500 light:text-gray-500">
              Current: {draft.active_window_days || 7} days
            </div>
          </div>

          {/* Tribe-specific settings */}
          {isTribe && (
            <>
              {/* Skip Mode */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-surface-200 light:text-gray-700 font-medium">
                  <Zap size={18} className="text-accent" />
                  <span>Skip Payment Distribution</span>
                </div>
                <div className="text-sm text-surface-400 light:text-gray-600 mb-2">
                  How should TCs from paid skips be distributed?
                </div>
                <select
                  value={draft.skip_mode || 'teammate_boost'}
                  onChange={(e) => setDraft({...draft, skip_mode: e.target.value})}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 rounded-lg border border-surface-700 light:border-gray-300 bg-surface-900 light:bg-white text-surface-100 light:text-gray-900 disabled:opacity-50"
                >
                  <option value="teammate_boost">🤝 Teammate Boost (80% to active members, 20% to vault)</option>
                  <option value="tribe_fund">🏛️ Tribe Fund (100% to vault for community causes)</option>
                </select>
                {settings && draft.skip_mode !== settings.skip_mode && (
                  <div className="text-xs text-warning light:text-yellow-600 mt-1">
                    ⚠️ Changing skip mode requires a tribe vote
                  </div>
                )}
              </div>

              {/* Voting Settings */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-surface-200 light:text-gray-700 font-medium">
                  <Vote size={18} className="text-success" />
                  <span>Voting Rules</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-surface-400 light:text-gray-600 block mb-1">
                      Vote Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="24"
                      max="168"
                      value={draft.vote_duration_hours || 72}
                      onChange={(e) => setDraft({...draft, vote_duration_hours: parseInt(e.target.value)})}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 rounded-lg border border-surface-700 light:border-gray-300 bg-surface-900 light:bg-white text-surface-100 light:text-gray-900 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-surface-400 light:text-gray-600 block mb-1">
                      Majority Required (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={draft.vote_majority_percent || 50}
                      onChange={(e) => setDraft({...draft, vote_majority_percent: parseInt(e.target.value)})}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 rounded-lg border border-surface-700 light:border-gray-300 bg-surface-900 light:bg-white text-surface-100 light:text-gray-900 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Skip Cost */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-surface-200 light:text-gray-700 font-medium">
                  <Zap size={18} className="text-warning" />
                  <span>Skip Cost (TribeCoins)</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={draft.skip_cost_tc || 10}
                  onChange={(e) => setDraft({...draft, skip_cost_tc: parseInt(e.target.value)})}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 rounded-lg border border-surface-700 light:border-gray-300 bg-surface-900 light:bg-white text-surface-100 light:text-gray-900 disabled:opacity-50"
                />
                <div className="text-xs text-surface-500 light:text-gray-500">
                  How many TC does it cost to skip a workout?
                </div>
              </div>

              {/* Snitch Threshold */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-surface-200 light:text-gray-700 font-medium">
                  <AlertCircle size={18} className="text-danger" />
                  <span>Ad Watch Snitch Threshold</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={draft.snitch_ad_threshold || 3}
                  onChange={(e) => setDraft({...draft, snitch_ad_threshold: parseInt(e.target.value)})}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 rounded-lg border border-surface-700 light:border-gray-300 bg-surface-900 light:bg-white text-surface-100 light:text-gray-900 disabled:opacity-50"
                />
                <div className="text-xs text-surface-500 light:text-gray-500">
                  After how many ad skips should the tribe be notified?
                </div>
              </div>
            </>
          )}

          {/* Squad-specific settings */}
          {!isTribe && (
            <>
              <div className="p-4 bg-primary/10 light:bg-blue-50 border border-primary/30 light:border-blue-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <Users size={20} className="text-primary light:text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-bold text-primary light:text-blue-700">Squad Settings</div>
                    <div className="text-sm text-surface-300 light:text-gray-600 mt-1">
                      Squads have simplified settings. Evolve to a Tribe to unlock advanced features like skip mode and voting.
                    </div>
                  </div>
                </div>
              </div>

              {/* Skip Cost (Squads) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-surface-200 light:text-gray-700 font-medium">
                  <Zap size={18} className="text-warning" />
                  <span>Skip Cost (TribeCoins)</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={draft.skip_cost_tc || 10}
                  onChange={(e) => setDraft({...draft, skip_cost_tc: parseInt(e.target.value)})}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 rounded-lg border border-surface-700 light:border-gray-300 bg-surface-900 light:bg-white text-surface-100 light:text-gray-900 disabled:opacity-50"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-800 light:bg-gray-50 p-6 border-t border-surface-700 light:border-gray-200 flex gap-3 rounded-b-2xl">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1"
          >
            Cancel
          </Button>
          {canEdit && (
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              Save Settings
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
