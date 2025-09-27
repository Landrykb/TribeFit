// TribeFit Feature Flags System
// Safe toggling of new features without breaking existing functionality

export class FeatureFlags {
  static get SQUADS() {
    return (typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_FEATURE_SQUADS === 'true'
      : process.env.FEATURE_SQUADS === 'true');
  }
  
  static get TRIBE_UPGRADE_BY_SIZE() {
    return (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURE_TRIBE_UPGRADE_BY_SIZE === 'true'
      : process.env.FEATURE_TRIBE_UPGRADE_BY_SIZE === 'true');
  }
  
  static get DEAL_SPLIT() {
    return (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURE_DEAL_SPLIT === 'true'
      : process.env.FEATURE_DEAL_SPLIT === 'true');
  }
  
  static get WISHLIST() {
    return (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURE_WISHLIST === 'true'
      : process.env.FEATURE_WISHLIST === 'true');
  }
  
  static get CALENDAR_LINK() {
    return (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURE_CALENDAR_LINK === 'true'
      : process.env.FEATURE_CALENDAR_LINK === 'true');
  }
  
  static get REACTIONS() {
    return (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURE_REACTIONS === 'true'
      : process.env.FEATURE_REACTIONS === 'true');
  }
  
  static get TIPS() {
    return (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURE_TIPS === 'true'
      : process.env.FEATURE_TIPS === 'true');
  }
  
  static get SQUAD_LEADERBOARDS() {
    return (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURE_SQUAD_LEADERBOARDS === 'true'
      : process.env.FEATURE_SQUAD_LEADERBOARDS === 'true');
  }
  
  static get TRIBE_CUSTOMIZATION() {
    return (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURE_TRIBE_CUSTOMIZATION === 'true'
      : process.env.FEATURE_TRIBE_CUSTOMIZATION === 'true');
  }

  // Deal Economics Constants
  static get DEAL_SKIP_FEE_TC() {
    return parseInt(process.env.DEAL_SKIP_FEE_TC || '100');
  }

  static get DEAL_DONATION_PCT() {
    return parseFloat(process.env.DEAL_DONATION_PCT || '0.10');
  }

  static get SQUAD_MIN() {
    return parseInt(process.env.SQUAD_MIN || '3');
  }

  static get SQUAD_MAX() {
    return parseInt(process.env.SQUAD_MAX || '4');
  }

  static get TRIBE_MIN() {
    return parseInt(process.env.TRIBE_MIN || '5');
  }
  
  // Core existing features (always enabled)
  static get SNITCH_MODE() {
    return process.env.FEATURE_SNITCH_MODE !== 'false'; // Default true
  }
  
  static get PACT_WALLET() {
    return process.env.FEATURE_PACT_WALLET !== 'false'; // Default true
  }
  
  static get COACH_MARKETPLACE() {
    return process.env.FEATURE_COACH_MARKETPLACE !== 'false'; // Default true
  }
  
  // Squad → Tribe progression configuration
  static get SQUAD_UPGRADE_STREAK_DAYS() {
    return parseInt(process.env.SQUAD_UPGRADE_STREAK_DAYS) || 30;
  }
  
  static get SQUAD_UPGRADE_PARTICIPATION_THRESHOLD() {
    return parseInt(process.env.SQUAD_UPGRADE_PARTICIPATION_THRESHOLD) || 70;
  }
  
  static get SQUAD_MAX_MEMBERS() {
    return parseInt(process.env.SQUAD_MAX_MEMBERS) || 8;
  }
  
  static get TRIBE_MAX_MEMBERS() {
    return parseInt(process.env.TRIBE_MAX_MEMBERS) || 15;
  }
  
  static get TRIBE_UPGRADE_BONUS_TC() {
    return parseInt(process.env.TRIBE_UPGRADE_BONUS_TC) || 500;
  }
  
  static get SQUAD_STREAK_BONUS_TC() {
    return parseInt(process.env.SQUAD_STREAK_BONUS_TC) || 50;
  }
  
  // Feature combination checks
  static get SQUADS_AND_TRIBES_ENABLED() {
    return this.SQUADS && this.TRIBE_UPGRADE;
  }
  
  static get PROGRESSION_SYSTEM_ENABLED() {
    return this.SQUADS && this.TRIBE_UPGRADE && this.PROGRESSION_REWARDS;
  }
  
  // Debug helper
  static getActiveFeatures() {
    return {
      squads: this.SQUADS,
      tribeUpgrade: this.TRIBE_UPGRADE,
      squadLeaderboards: this.SQUAD_LEADERBOARDS,
      tribeCustomization: this.TRIBE_CUSTOMIZATION,
      progressionRewards: this.PROGRESSION_REWARDS,
      snitchMode: this.SNITCH_MODE,
      pactWallet: this.PACT_WALLET,
      coachMarketplace: this.COACH_MARKETPLACE,
      progressionSystemEnabled: this.PROGRESSION_SYSTEM_ENABLED
    };
  }
  
  // Safe feature enablement check
  static isEnabled(featureName) {
    try {
      return this[featureName] === true;
    } catch (error) {
      console.warn(`Unknown feature flag: ${featureName}`);
      return false;
    }
  }
}

// Export for easy use
export const Features = FeatureFlags;