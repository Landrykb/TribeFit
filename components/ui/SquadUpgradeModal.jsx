'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './button';
import { SquadProgression } from '../../lib/squad-progression';
import { 
  Crown, Star, Trophy, Zap, Users, Gift, Coins, GraduationCap, Vote, TrendingUp,
  CheckCircle, ArrowRight, Sparkles, Award
} from 'lucide-react';

export function SquadUpgradeModal({ isOpen, onClose, squad, onConfirmUpgrade }) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  if (!squad) return null;
  
  const rewards = SquadProgression.getUpgradeRewards();
  const progressionStatus = SquadProgression.getProgressionStatus(squad);
  
  // Handle case where rewards might be empty object
  const safeRewards = {
    bonusTC: 0, // No TC bonus - sustainable model
    perks: rewards.perks || [],
    unlocks: rewards.unlocks || [],
    economicPerks: rewards.economicPerks || [],
    socialPerks: rewards.socialPerks || [],
    coachPerks: rewards.coachPerks || [],
    statusPerks: rewards.statusPerks || [],
    capacityPerks: rewards.capacityPerks || []
  };
  
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onConfirmUpgrade(squad.id);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Squad → Tribe Upgrade" 
      size="lg"
    >
      <div className="space-y-6 max-h-[600px] overflow-y-auto">
        {/* Celebration Header */}
        <div className="text-center bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-6 border border-primary/30">
          <div className="w-16 h-16 bg-gradient-tribal rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={32} className="text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-surface-50 mb-2">
            {squad.name} is Ready to Evolve!
          </h2>
          <p className="text-surface-300 text-sm">
            Your squad has achieved the requirements to upgrade to a Tribe with exclusive perks and features.
          </p>
        </div>

        {/* Achievement Summary */}
        <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
          <h3 className="font-bold text-surface-50 mb-3 flex items-center space-x-2">
            <Trophy size={16} className="text-accent" />
            <span>Achievement Unlocked</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-success" />
              <div>
                <div className="text-surface-200 text-sm font-medium">{squad.streak_days} Day Streak</div>
                <div className="text-surface-400 text-xs">Required: 30 days</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-success" />
              <div>
                <div className="text-surface-200 text-sm font-medium">{squad.participation_rate}% Participation</div>
                <div className="text-surface-400 text-xs">Required: 70%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tribe Advantages - Comprehensive List */}
        <div className="space-y-4">
          {/* Economic Advantages */}
          {safeRewards.economicPerks.length > 0 && (
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-4 border border-green-500/20">
              <h3 className="font-bold text-green-400 mb-3 flex items-center space-x-2 text-sm">
                <Coins size={14} /> Economic Advantages
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {safeRewards.economicPerks.map((perk, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <CheckCircle size={12} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-surface-200">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coach Marketplace Integration */}
          {safeRewards.coachPerks.length > 0 && (
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg p-4 border border-purple-500/20">
              <h3 className="font-bold text-purple-400 mb-3 flex items-center space-x-2 text-sm">
                <GraduationCap size={14} /> Coach Marketplace
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {safeRewards.coachPerks.map((perk, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <CheckCircle size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-surface-200">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social & Governance */}
          {safeRewards.socialPerks.length > 0 && (
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-4 border border-blue-500/20">
              <h3 className="font-bold text-blue-400 mb-3 flex items-center space-x-2 text-sm">
                <Vote size={14} /> Social & Governance
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {safeRewards.socialPerks.map((perk, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <CheckCircle size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-surface-200">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status & Achievement */}
          {safeRewards.statusPerks.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="font-bold text-yellow-400 mb-3 flex items-center space-x-2 text-sm">
                <Trophy size={14} /> Status & Achievement
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {safeRewards.statusPerks.map((perk, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <CheckCircle size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-surface-200">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Growth & Capacity */}
          {safeRewards.capacityPerks.length > 0 && (
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-lg p-4 border border-orange-500/20">
              <h3 className="font-bold text-orange-400 mb-3 flex items-center space-x-2 text-sm">
                <TrendingUp size={14} /> Growth & Capacity
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {safeRewards.capacityPerks.map((perk, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <CheckCircle size={12} className="text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-surface-200">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transformation Preview */}
        <div className="bg-gradient-to-r from-surface-800 to-surface-700 rounded-lg p-4 border border-surface-600">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                <Zap size={20} className="text-primary" />
              </div>
              <div className="text-surface-400 text-xs">Squad</div>
            </div>
            
            <ArrowRight size={20} className="text-surface-400" />
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-tribal rounded-lg flex items-center justify-center mb-2">
                <Crown size={20} className="text-yellow-500" />
              </div>
              <div className="text-yellow-500 text-xs font-medium">Tribe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-6 border-t border-surface-700">
        <Button
          onClick={onClose}
          variant="ghost"
          className="flex-1"
          disabled={isUpgrading}
        >
          Maybe Later
        </Button>
        
        <Button
          onClick={handleUpgrade}
          variant="success"
          className="flex-1"
          disabled={isUpgrading}
        >
          {isUpgrading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Upgrading...
            </>
          ) : (
            <>
              <Crown size={16} />
              Upgrade to Tribe
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}