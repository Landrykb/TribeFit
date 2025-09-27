'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { SquadProgression } from '../../lib/squad-progression';
import { 
  Crown, Star, Trophy, Zap, Users, Gift, 
  CheckCircle, ArrowRight, Sparkles, Award
} from 'lucide-react';

export function SquadUpgradeModal({ isOpen, onClose, squad, onConfirmUpgrade }) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  if (!squad) return null;
  
  const rewards = SquadProgression.getUpgradeRewards();
  const progressionStatus = SquadProgression.getProgressionStatus(squad);
  
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
      title="🎉 Squad → Tribe Upgrade" 
      size="lg"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
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

        {/* Upgrade Rewards */}
        <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
          <h3 className="font-bold text-surface-50 mb-3 flex items-center space-x-2">
            <Gift size={16} className="text-accent" />
            <span>Tribe Upgrade Rewards</span>
          </h3>
          
          <div className="space-y-3">
            {/* Bonus TribeCoins */}
            <div className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <Zap size={20} className="text-accent" />
              </div>
              <div>
                <div className="font-medium text-accent">+{rewards.bonusTC} TribeCoins</div>
                <div className="text-surface-400 text-xs">Instant reward for all members</div>
              </div>
            </div>
            
            {/* Perks List */}
            <div className="grid grid-cols-1 gap-2">
              {rewards.perks.map((perk, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Star size={12} className="text-primary flex-shrink-0" />
                  <span className="text-surface-300">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exclusive Unlocks */}
        <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
          <h3 className="font-bold text-surface-50 mb-3 flex items-center space-x-2">
            <Sparkles size={16} className="text-primary" />
            <span>Exclusive Tribe Features</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-2">
            {rewards.unlocks.map((unlock, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Award size={12} className="text-success flex-shrink-0" />
                <span className="text-surface-300">{unlock}</span>
              </div>
            ))}
          </div>
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