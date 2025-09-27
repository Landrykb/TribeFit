// Squad → Tribe Progression System
// Non-breaking extension to existing TribeFit functionality

import { FeatureFlags } from './feature-flags';

export class SquadProgressionSystem {
  
  // Check if squad is eligible for tribe upgrade
  static isSquadEligibleForUpgrade(squad) {
    if (!FeatureFlags.TRIBE_UPGRADE) return false;
    
    const {
      streak_days = 0,
      member_count = 0,
      participation_rate = 0,
      type = 'squad'
    } = squad;
    
    const minStreak = FeatureFlags.SQUAD_UPGRADE_STREAK_DAYS;
    const minParticipation = FeatureFlags.SQUAD_UPGRADE_PARTICIPATION_THRESHOLD;
    
    return (
      type === 'squad' &&
      streak_days >= minStreak &&
      participation_rate >= minParticipation &&
      member_count >= 3 // Minimum viable tribe size
    );
  }
  
  // Calculate squad progression status
  static getProgressionStatus(squad) {
    if (!FeatureFlags.SQUADS) return null;
    
    const minStreak = FeatureFlags.SQUAD_UPGRADE_STREAK_DAYS;
    const minParticipation = FeatureFlags.SQUAD_UPGRADE_PARTICIPATION_THRESHOLD;
    
    const streakProgress = Math.min(100, (squad.streak_days / minStreak) * 100);
    const participationProgress = Math.min(100, (squad.participation_rate / minParticipation) * 100);
    
    return {
      streakProgress,
      participationProgress,
      overallProgress: (streakProgress + participationProgress) / 2,
      isEligible: this.isSquadEligibleForUpgrade(squad),
      requirements: {
        streakDays: {
          current: squad.streak_days,
          required: minStreak,
          met: squad.streak_days >= minStreak
        },
        participation: {
          current: squad.participation_rate,
          required: minParticipation,
          met: squad.participation_rate >= minParticipation
        }
      }
    };
  }
  
  // Get upgrade rewards for tribe
  static getUpgradeRewards() {
    if (!FeatureFlags.PROGRESSION_REWARDS) return {};
    
    return {
      bonusTC: FeatureFlags.TRIBE_UPGRADE_BONUS_TC,
      perks: [
        'Custom tribe logo and banner',
        'Exclusive tribe color themes',
        'Priority coach booking',
        'Tribe milestone rewards',
        'Enhanced leaderboard status'
      ],
      unlocks: [
        'Tribe customization panel',
        'Advanced analytics dashboard',
        'Tribe achievement badges',
        'Exclusive tribe challenges'
      ]
    };
  }
  
  // Squad vs Tribe feature differences
  static getFeatureDifferences() {
    return {
      squad: {
        icon: '🔥',
        maxMembers: FeatureFlags.SQUAD_MAX_MEMBERS,
        features: [
          'Deal Vault sharing',
          'Skip notifications',
          'Basic leaderboards',
          'Group challenges'
        ],
        restrictions: [
          'Basic customization only',
          'Standard rewards',
          'Weekly leaderboards only'
        ]
      },
      tribe: {
        icon: '🪶',
        maxMembers: FeatureFlags.TRIBE_MAX_MEMBERS,
        features: [
          'All Squad features',
          'Custom logos & banners',
          'Color theme selection',
          'Priority coach access',
          'Enhanced rewards',
          'Seasonal leaderboards',
          'Tribe achievements'
        ],
        perks: [
          'Milestone bonus rewards',
          'Exclusive challenges',
          'Advanced analytics',
          'Custom tribe name lock'
        ]
      }
    };
  }
  
  // Generate upgrade celebration message
  static getUpgradeCelebrationMessage(squadName, language = 'en') {
    const messages = {
      en: `🎉 Congratulations! ${squadName} has evolved into a Tribe! Your dedication and teamwork have unlocked exclusive perks and customization options. Welcome to the next level of fitness accountability! 🪶`,
      fr: `🎉 Félicitations! ${squadName} a évolué en Tribu! Votre dévouement et votre travail d'équipe ont débloqué des avantages exclusifs et des options de personnalisation. Bienvenue au niveau supérieur de responsabilité fitness! 🪶`,
      ja: `🎉 おめでとうございます！${squadName}がトライブに進化しました！あなたの献身とチームワークが特別な特典とカスタマイズオプションを解除しました。フィットネス責任の次のレベルへようこそ！🪶`
    };
    
    return messages[language] || messages.en;
  }
  
  // Streak bonus calculation for squads
  static calculateStreakBonus(streakDays) {
    if (!FeatureFlags.PROGRESSION_REWARDS) return 0;
    
    const baseBonus = FeatureFlags.SQUAD_STREAK_BONUS_TC;
    const milestones = [7, 14, 30, 60, 90]; // Weekly milestones
    
    let bonus = 0;
    milestones.forEach(milestone => {
      if (streakDays >= milestone) {
        bonus += baseBonus * (milestone / 7); // Scaling bonus
      }
    });
    
    return bonus;
  }
  
  // Check if user can create squad vs tribe
  static getGroupCreationOptions(userLevel = 'new') {
    const options = [];
    
    if (FeatureFlags.SQUADS) {
      options.push({
        type: 'squad',
        title: 'Create Squad',
        subtitle: 'Start your fitness journey with friends',
        icon: '🔥',
        requirements: 'None - Join instantly!',
        maxMembers: FeatureFlags.SQUAD_MAX_MEMBERS,
        features: this.getFeatureDifferences().squad.features
      });
    }
    
    // Tribes can be created directly if feature enabled, or through upgrade
    if (FeatureFlags.TRIBE_UPGRADE) {
      options.push({
        type: 'tribe',
        title: 'Create Tribe',
        subtitle: 'Premium group with advanced features',
        icon: '🪶',
        requirements: userLevel === 'experienced' ? 'Available for experienced users' : 'Upgrade from Squad after 30-day streak',
        maxMembers: FeatureFlags.TRIBE_MAX_MEMBERS,
        features: this.getFeatureDifferences().tribe.features
      });
    }
    
    return options;
  }
}

// Export for easy use
export const SquadProgression = SquadProgressionSystem;