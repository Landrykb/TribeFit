'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './button';
import { 
  Users, Flame, Crown, Star, Trophy, TrendingUp, 
  Calendar, Settings, UserPlus, LogOut, Copy,
  ArrowUp, Gift, Target, Clock, Trash2, Link, QrCode, Share2, Coins, Sparkles, Swords, Feather, Heart, Zap, MessageSquare
} from 'lucide-react';
import { SquadProgression } from '../../lib/squad-progression';

export function SquadDetailsModal({ isOpen, onClose, squad, user, onJoin, onLeave, onUpgrade, skipMode = 'teammate_boost', onOpenTribeSettings, onDeleteSquad, allUsers = [] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isJoining, setIsJoining] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  if (!squad) return null;

  const progressionStatus = SquadProgression.getProgressionStatus(squad);
  const isOwner = squad.owner_id === user?.id;
  const isMember = squad.is_member;
  const canUpgrade = progressionStatus?.isEligible && isOwner && squad.group_type === 'squad';
  
  // Generate invite link
  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}?squad=${squad.id}` 
    : '';
  
  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };
  
  const handleDeleteSquad = () => {
    if (window.confirm(`Delete ${squad.name}?\n\nThis will permanently delete the squad and cannot be undone.`)) {
      onDeleteSquad?.(squad);
      onClose();
    }
  };

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
    ...(isOwner ? [{ id: 'invite', label: 'Invite', icon: Share2 }] : []),
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4 text-center">
          <Users size={20} className="text-surface-400 mx-auto mb-2" />
          <div className="font-bold text-surface-50">{squad.member_count}</div>
          <div className="text-xs text-surface-400">Members</div>
        </div>
        <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4 text-center">
          <Flame size={20} className="text-orange-500 mx-auto mb-2" />
          <div className="font-bold text-orange-500">{squad.streak_days}</div>
          <div className="text-xs text-surface-400">Day Streak</div>
        </div>
        <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4 text-center">
          <Trophy size={20} className="text-accent mx-auto mb-2" />
          <div className="font-bold text-accent">{Math.round(squad.participation_rate || 0)}%</div>
          <div className="text-xs text-surface-400">Active</div>
        </div>
      </div>

      {/* Tribe Advantages (tribes only) */}
      {squad.group_type === 'tribe' && (() => {
        const advantages = SquadProgression.getTribeAdvantages(squad);
        return (
          <div className="space-y-3">
            {/* Tribe Vault */}
            <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={18} className="text-accent" />
                  <h4 className="font-medium text-surface-50">Tribe Vault</h4>
                </div>
                <div className="text-accent font-bold">{(squad.pact_balance_tc ?? squad.pact_balance ?? 0)} TC</div>
              </div>
              <div className="text-xs text-surface-300">
                Shared fund for equipment & donations • 15% vault bonus active
              </div>
            </div>

            {/* Active Tribe Benefits */}
            <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Crown size={16} className="text-yellow-400" />
                <h4 className="font-medium text-yellow-400 text-sm flex items-center gap-1"><Feather size={13} /> Active Tribe Benefits</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <div className="text-green-400 font-medium flex items-center gap-1"><Coins size={12} /> Skip: 1 TC</div>
                  <div className="text-surface-400">(vs 2 TC)</div>
                </div>
                <div className="text-xs">
                  <div className="text-primary font-medium">Coach: 10-20 TC</div>
                  <div className="text-surface-400">(exclusive)</div>
                </div>
                <div className="text-xs">
                  <div className="text-primary font-medium flex items-center gap-1"><Coins size={12} /> Vault: +15%</div>
                  <div className="text-surface-400">Bonus TC</div>
                </div>
                <div className="text-xs">
                  <div className="text-yellow-400 font-medium flex items-center gap-1"><Zap size={12} /> Streak: {advantages.streakMultiplier}x</div>
                  <div className="text-surface-400">TC rewards</div>
                </div>
              </div>
              
              {/* Community Events */}
              <div className="mt-3 pt-3 border-t border-yellow-500/20">
                <div className="text-xs text-yellow-300 font-medium mb-2 flex items-center gap-1"><Sparkles size={12} /> Community Events</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs">
                    <div className="text-surface-200 flex items-center gap-1"><Swords size={11} /> Tribe vs Tribe</div>
                    <div className="text-surface-400">(5-10 TC)</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-surface-200 flex items-center gap-1"><Heart size={11} /> Charity</div>
                    <div className="text-surface-400">(10 TC)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Description */}
      {squad.description && (
        <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
          <h4 className="font-medium text-surface-50 mb-2">About</h4>
          <p className="text-surface-300 text-sm">{squad.description}</p>
        </div>
      )}

      {/* Upgrade Status for Squads */}
      {squad.group_type === 'squad' && progressionStatus && (
        <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
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

  const renderMembers = () => {
    // Show real members if available, otherwise show empty state
    const memberIds = squad.members || [];
    
    if (memberIds.length === 0) {
      return (
        <div className="text-center py-8 text-surface-400">
          <Users size={48} className="mx-auto mb-3 opacity-50" />
          <p>No members yet</p>
          <p className="text-sm mt-1">Be the first to join!</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {memberIds.map((memberId, index) => {
          const isOwnerMember = memberId === squad.owner_id;
          
          // Look up actual user name from allUsers array
          const userObj = allUsers.find(u => u.id === memberId);
          const memberName = userObj?.name || memberId.replace('u_', '').replace(/\b\w/g, c => c.toUpperCase());
          
          return (
            <div key={memberId} className="flex items-center justify-between p-3 bg-surface-800 rounded-lg border border-surface-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{memberName.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-surface-50">{memberName}</span>
                    {isOwnerMember && (
                      <Crown size={12} className="text-yellow-500" />
                    )}
                  </div>
                  <div className="text-xs text-surface-400">
                    Member #{index + 1}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderInvite = () => (
    <div className="space-y-4">
      {/* Invite Link */}
      <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-surface-50 flex items-center gap-2">
            <Link size={18} />
            Invite Link
          </h4>
        </div>
        <div className="bg-surface-900 rounded p-3 mb-3 border border-surface-600">
          <code className="text-xs text-accent break-all">{inviteLink}</code>
        </div>
        <Button
          onClick={handleCopyInviteLink}
          variant={inviteLinkCopied ? "success" : "primary"}
          className="w-full"
        >
          {inviteLinkCopied ? (
            <>
              <Copy size={16} className="text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy Invite Link
            </>
          )}
        </Button>
        <p className="text-xs text-surface-400 mt-2 text-center">
          Share this link with friends to invite them to your squad
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-surface-50 flex items-center gap-2">
            <QrCode size={18} />
            QR Code
          </h4>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg mb-3">
            <div className="w-48 h-48 flex items-center justify-center">
              {/* QR Code placeholder - you can integrate a QR code library */}
              <div className="text-center">
                <QrCode size={120} className="text-surface-800 mx-auto mb-2" />
                <p className="text-xs text-surface-600">Scan to join</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-surface-400 text-center">
            Show this QR code for quick in-person invites
          </p>
        </div>
      </div>

      {/* Share Options */}
      <div className="bg-surface-800/60 border border-surface-700/60 rounded-2xl p-4">
        <h4 className="font-medium text-surface-50 mb-3">Quick Share</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Join ${squad.name}`,
                  text: `Join my fitness squad: ${squad.name}!`,
                  url: inviteLink
                });
              } else {
                handleCopyInviteLink();
              }
            }}
            variant="outline"
            size="sm"
          >
            <Share2 size={14} />
            Share
          </Button>
          <Button
            onClick={() => {
              window.open(`sms:?&body=Join my fitness squad: ${squad.name}! ${inviteLink}`, '_blank');
            }}
            variant="outline"
            size="sm"
          >
            SMS
          </Button>
        </div>
      </div>
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
          <div className="w-20 h-20 bg-surface-800 border-2 border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {getGroupIcon()}
          </div>
          <h2 className="text-xl font-bold text-surface-50 mb-2">{squad.name}</h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm border ${
              squad.group_type === 'tribe'
                ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                : 'bg-primary/20 text-primary border-primary/30'
            }`}>
              {squad.group_type === 'tribe' ? <span className="inline-flex items-center gap-1"><Feather size={13} /> Tribe</span> : <span className="inline-flex items-center gap-1"><Flame size={13} /> Squad</span>}
            </span>
          </div>
        </div>

        {/* Deletion Pending Warning */}
        {squad.deletion_pending && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-pulse-soft">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle size={20} className="text-red-400" />
              <span className="font-bold text-red-400">Deletion Scheduled</span>
            </div>
            <p className="text-sm text-red-300 mb-2">
              <strong>{squad.deletion_initiated_by_name || 'The owner'}</strong> has initiated deletion of this squad. 
            </p>
            <p className="text-sm text-red-300 mb-3">
              You have <strong>48 hours</strong> to download your Squad Resume, claim Reputation Token, and invite members to a new squad (all in-app).
            </p>
            {squad.deletion_scheduled_at && (
              <div className="flex items-center space-x-2 text-sm text-red-300 bg-red-500/20 px-3 py-2 rounded">
                <Clock size={16} />
                <span>Deletes: <strong>{new Date(squad.deletion_scheduled_at).toLocaleString()}</strong></span>
              </div>
            )}
            <div className="mt-3 text-xs text-red-200/80">
              Use this time to save important information and find a new squad to join.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-surface-900 rounded-2xl p-1 border border-surface-700/60">
          {tabs.slice(0, isMember ? tabs.length : 2).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-surface-950'
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
          {activeTab === 'invite' && renderInvite()}
          {activeTab === 'progress' && renderOverview()} {/* For now, same as overview */}
          {activeTab === 'settings' && isMember && (
            <div className="space-y-3">
              {squad.group_type === 'tribe' ? (
                <>
                  <div className="p-3 rounded-lg border border-surface-700 bg-surface-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-accent" />
                        <div>
                          <div className="text-xs text-surface-300">Skip Mode</div>
                          <div className="text-sm font-semibold text-surface-50">{skipMode === 'tribe_fund' ? 'Tribe Fund' : 'Teammate Boost'}</div>
                          <div className="text-[11px] text-surface-400">
                            {skipMode === 'tribe_fund' ? '100% to Tvault; skipper gets perks' : '80% to active members (weighted by streak), 20% to Tvault'}
                          </div>
                        </div>
                      </div>
                      {onOpenTribeSettings && (
                        <Button 
                          onClick={() => {
                            onClose(); // Close this modal first
                            onOpenTribeSettings(); // Then open settings
                          }} 
                          variant="ghost" 
                          className="h-8 px-3 text-xs"
                        >
                          Open Tribe Settings
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-surface-700 bg-surface-800/50">
                    <div className="text-xs text-surface-300 mb-1">Tribe Vault</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-accent">{(squad.pact_balance_tc ?? squad.pact_balance ?? 0)} TC</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-surface-400">
                  <Settings size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Settings are available after upgrading to a Tribe.</p>
                </div>
              )}
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
          <>
            {isOwner ? (
              <>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={handleDeleteSquad}
                  variant="ghost"
                  className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                  Delete {squad.group_type === 'squad' ? 'Squad' : 'Tribe'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (window.confirm(`Leave ${squad.name}?`)) {
                      onLeave ? onLeave(squad) : onJoin(squad);
                      onClose();
                    }
                  }}
                  variant="ghost"
                  className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <LogOut size={16} />
                  Leave {squad.group_type === 'squad' ? 'Squad' : 'Tribe'}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}