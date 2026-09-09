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
      member_count >= 5 // Squads become tribes at 5+ members
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

  // Get upgrade rewards for tribe (NO TC BONUS - fun & community model)
  static getUpgradeRewards() {
    return {
      bonusTC: 0, // No upfront bonus - value through features

      // Core Economic Advantages (Yen-Based: 1 TC = 100 yen)
      economicPerks: [
        ' Unlock "Tribe Fund" mode (100% to vault)',
        ' Democratic voting on vault distribution',
        ' 15% bonus on all vault contributions',
        ' Skip cost: 1 TC (100 yen vs 200 yen for squads)'
      ],

      // Social & Governance
      socialPerks: [
        ' Vote on equipment & donation requests',
        ' Invite-only privacy control',
        '🪶 Verified tribe badge & protected name'
      ],

      // Coach Marketplace Integration (Tribe-Exclusive, Yen-Based)
      coachPerks: [
        ' Exclusive coach access (tribes only)',
        ' Tiered coach pricing: 10-20 TC (¥1,000-2,000)',
        ' Tribe members can become coaches',
        ' Group coach sessions available'
      ],

      // Status & Achievement
      statusPerks: [
        ' Access to exclusive "Tribe Elite" leaderboard',
        ' Tribe-exclusive achievement badges',
        ' Advanced analytics dashboard',
        ' Streak multipliers (1.1x-1.3x TC rewards)'
      ],

      // Growth & Capacity + Community Events (Yen-Based)
      capacityPerks: [
        ' Increased capacity: 15 members (vs 8 for squads)',
        ' Exclusive tribe-only challenges',
        ' Tribe vs Tribe competitions (5-10 TC = ¥500-1,000)',
        ' Community charity events (10 TC = ¥1,000)',
        ' Inter-tribe social good projects',
        ' Enhanced equipment voting system',
        ' Milestone bonuses at vault thresholds'
      ],

      // All perks combined for modal display (Yen-Based: 1 TC = 100 yen)
      perks: [
        'Unlock "Tribe Fund" mode (100% to vault)',
        'Democratic voting on all major decisions',
        '15% bonus on vault contributions',
        'Skip cost: 1 TC (¥100 vs ¥200 for squads)',
        'Exclusive coach access (tribes only)',
        'Tiered coach pricing: 10-20 TC (¥1,000-2,000)',
        'Tribe members can become coaches',
        'Tribe vs Tribe competitions (5-10 TC = ¥500-1,000)',
        'Community charity events (10 TC = ¥1,000)',
        'Inter-tribe social good projects',
        'Access to Tribe Elite leaderboard',
        'Exclusive achievement badges',
        'Advanced analytics dashboard',
        'Increased capacity (15 members)',
        'Verified tribe badge & name protection'
      ],

      // Feature unlocks
      unlocks: [
        'Advanced tribe settings panel',
        'Vault mode voting system',
        'Equipment voting & proposals',
        'Group coach sessions',
        'Analytics & insights dashboard',
        'Tribe customization options',
        'Member performance reports',
        'Exclusive challenge access'
      ]
    };
  }

  // Squad vs Tribe feature differences
  static getFeatureDifferences() {
    return {
      squad: {
        icon: '',
        maxMembers: FeatureFlags.SQUAD_MAX_MEMBERS,
        features: [
          'Shared goals (Tribe Vault on upgrade)',
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
      en: ` Congratulations! ${squadName} has evolved into a Tribe! Your dedication and teamwork have unlocked exclusive perks and customization options. Welcome to the next level of fitness accountability! 🪶`,
      fr: ` Félicitations! ${squadName} a évolué en Tribu! Votre dévouement et votre travail d'équipe ont débloqué des avantages exclusifs et des options de personnalisation. Bienvenue au niveau supérieur de responsabilité fitness! 🪶`,
      ja: ` おめでとうございます！${squadName}がトライブに進化しました！あなたの献身とチームワークが特別な特典とカスタマイズオプションを解除しました。フィットネス責任の次のレベルへようこそ！🪶`
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

  // TRIBE ADVANTAGE: Streak multipliers for TC rewards
  static getStreakMultiplier(group) {
    if (!group || group.group_type !== 'tribe') return 1.0;

    const streakDays = group.streak_days || 0;

    // Progressive multipliers (sustainable, not excessive)
    if (streakDays >= 90) return 1.3; // 30% boost for 90+ day streaks
    if (streakDays >= 60) return 1.2; // 20% boost for 60+ day streaks
    if (streakDays >= 30) return 1.1; // 10% boost for 30+ day streaks

    return 1.0; // No boost for <30 days
  }

  // TRIBE ADVANTAGE: Milestone bonuses
  static getMilestoneBonus(vaultBalance) {
    const milestones = [
      { threshold: 10000, bonus: 200, label: '10K Vault Milestone' },
      { threshold: 5000, bonus: 100, label: '5K Vault Milestone' },
      { threshold: 1000, bonus: 50, label: '1K Vault Milestone' }
    ];

    for (const milestone of milestones) {
      if (vaultBalance >= milestone.threshold) {
        return milestone;
      }
    }

    return null;
  }

  // Get tribe-specific advantages summary (Yen-Based: 1 TC = 100 yen)
  static getTribeAdvantages(group) {
    if (!group || group.group_type !== 'tribe') {
      return null;
    }

    return {
      skipCost: 1, // 1 TC (¥100) vs 2 TC (¥200) for squads
      skipCostYen: '¥100',
      skipDiscount: '50%',
      coachAccess: 'exclusive', // tribes only
      coachPriceRange: '10-20 TC', // ¥1,000-2,000
      coachPriceYen: '¥1,000-2,000',
      vaultBonus: '15%',
      streakMultiplier: this.getStreakMultiplier(group),
      maxMembers: FeatureFlags.TRIBE_MAX_MEMBERS || 15,
      hasVoting: true,
      hasVerifiedBadge: true,
      hasAdvancedSettings: true,
      hasCommunityEvents: true,
      hasTribeCompetitions: true
    };
  }

  // Check if user can create squad vs tribe
  static getGroupCreationOptions(userLevel = 'new') {
    const options = [];

    if (FeatureFlags.SQUADS) {
      options.push({
        type: 'squad',
        title: 'Create Squad',
        subtitle: 'Start your fitness journey with friends',
        icon: '',
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