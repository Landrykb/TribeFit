'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { 
  Users, Flame, Crown, Star, Trophy, TrendingUp, 
  Calendar, Settings, UserPlus, LogOut, Copy,
  ArrowUp, Gift, Target, Clock
} from 'lucide-react';
import { SquadProgression } from '../../lib/squad-progression';

export function SquadDetailsModal({ isOpen, onClose, squad, user, onJoin, onLeave, onUpgrade }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isJoining, setIsJoining] = useState(false);
  
  if (!squad) return null;

  const progressionStatus = SquadProgression.getProgressionStatus(squad);
  const isOwner = squad.owner_id === user?.id;
  const isMember = squad.is_member;
  const canUpgrade = progressionStatus?.isEligible && isOwner && squad.group_type === 'squad';

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await onJoin(squad);
    } finally {
      setIsJoining(false);
    }
  };

  const handleUpgrade = () => {
    onUpgrade(squad);
    onClose();
  };

  const getGroupIcon = () => {
    if (squad.group_type === 'tribe') return <Crown size={32} className="text-yellow-500" />;
    if (squad.streak_days >= 30) return <Flame size={32} className="text-orange-500" />;
    return <Users size={32} className="text-primary" />;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-800 rounded-lg p-4 text-center border border-surface-700">
          <Users size={20} className="text-surface-400 mx-auto mb-2" />
          <div className="font-bold text-surface-50">{squad.member_count}</div>
          <div className="text-xs text-surface-400">Members</div>
        </div>
        <div className="bg-surface-800 rounded-lg p-4 text-center border border-surface-700">
          <Flame size={20} className="text-orange-500 mx-auto mb-2" />
          <div className="font-bold text-orange-500">{squad.streak_days}</div>
          <div className="text-xs text-surface-400">Day Streak</div>
        </div>
        <div className="bg-surface-800 rounded-lg p-4 text-center border border-surface-700">
          <Trophy size={20} className="text-accent mx-auto mb-2" />
          <div className="font-bold text-accent">{Math.round(squad.participation_rate || 0)}%</div>
          <div className="text-xs text-surface-400">Active</div>
        </div>
      </div>

      {/* Deal Vault */}
      <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-surface-50">Deal Vault</h4>
          <div className="text-accent font-bold">{squad.pact_balance || 0} TC</div>
        </div>
        <div className="text-sm text-surface-400">
          Shared fund for equipment purchases and gym donations
        </div>
      </div>

      {/* Description */}
      {squad.description && (
        <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
          <h4 className="font-medium text-surface-50 mb-2">About</h4>
          <p className="text-surface-300 text-sm">{squad.description}</p>
        </div>
      )}

      {/* Upgrade Status for Squads */}
      {squad.group_type === 'squad' && progressionStatus && (
        <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-surface-50">Tribe Upgrade Progress</h4>
            <span className="text-xs text-surface-400">
              {Math.round(progressionStatus.overallProgress)}% Complete
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-surface-400 mb-1">
                <span>Streak: {squad.streak_days}/30 days</span>
                <span className={progressionStatus.requirements.streakDays.met ? 'text-success' : ''}>
                  {progressionStatus.requirements.streakDays.met ? '✓' : Math.round(progressionStatus.streakProgress)}%
                </span>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all" 
                  style={{ width: `${progressionStatus.streakProgress}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-surface-400 mb-1">
                <span>Participation: {squad.participation_rate}%/70%</span>
                <span className={progressionStatus.requirements.participation.met ? 'text-success' : ''}>
                  {progressionStatus.requirements.participation.met ? '✓' : Math.round(progressionStatus.participationProgress)}%
                </span>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${progressionStatus.participationProgress}%` }}
                />
              </div>
            </div>
          </div>

          {canUpgrade && (
            <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center space-x-2 text-success text-sm">
                <Star size={14} />
                <span className="font-medium">Ready for Tribe upgrade!</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-3">
      {/* Mock members data */}
      {[
        { name: 'Alex Chen', role: 'owner', streak: 32, status: 'active' },
        { name: 'Jordan Kim', role: 'member', streak: 28, status: 'active' },
        { name: 'Sarah Wilson', role: 'member', streak: 15, status: 'active' },
        { name: 'Mike Torres', role: 'member', streak: 8, status: 'inactive' }
      ].map((member, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-surface-800 rounded-lg border border-surface-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-tribal rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{member.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-surface-50">{member.name}</span>
                {member.role === 'owner' && (
                  <Crown size={12} className="text-yellow-500" />
                )}
              </div>
              <div className="text-xs text-surface-400">
                {member.streak}-day streak • {member.status}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${member.status === 'active' ? 'text-success' : 'text-surface-400'}`}>
              {member.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title=""
      size="lg"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-tribal rounded-full flex items-center justify-center mx-auto mb-4">
            {getGroupIcon()}
          </div>
          <h2 className="text-xl font-bold text-surface-50 mb-2">{squad.name}</h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm border ${
              squad.group_type === 'tribe'
                ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                : 'bg-primary/20 text-primary border-primary/30'
            }`}>
              {squad.group_type === 'tribe' ? '🪶 Tribe' : '🔥 Squad'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-800 rounded-lg p-1 border border-surface-700">
          {tabs.slice(0, isMember ? tabs.length : 2).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'members' && renderMembers()}
          {activeTab === 'progress' && renderOverview()} {/* For now, same as overview */}
          {activeTab === 'settings' && isMember && (
            <div className="text-center py-8 text-surface-400">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <p>Settings coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-6 border-t border-surface-700">
        {canUpgrade ? (
          <>
            <Button
              onClick={onClose}
              variant="ghost"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={handleUpgrade}
              variant="success"
              className="flex-1 animate-pulse-soft"
            >
              <ArrowUp size={16} />
              Upgrade to Tribe
            </Button>
          </>
        ) : !isMember ? (
          <>
            <Button
              onClick={onClose}
              variant="ghost"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={handleJoin}
              variant="primary"
              className="flex-1"
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Join {squad.group_type === 'squad' ? 'Squad' : 'Tribe'}
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Close
          </Button>
        )}
      </div>
    </Modal>
  );
}