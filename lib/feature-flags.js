// TribeFit Feature Flags System
// Safe toggling of new features without breaking existing functionality

export class FeatureFlags {
  static get SQUADS() {
    return process.env.FEATURE_SQUADS === 'true';
  }
  
  static get TRIBE_UPGRADE() {
    return process.env.FEATURE_TRIBE_UPGRADE === 'true';
  }
  
  static get SQUAD_LEADERBOARDS() {
    return process.env.FEATURE_SQUAD_LEADERBOARDS === 'true';
  }
  
  static get TRIBE_CUSTOMIZATION() {
    return process.env.FEATURE_TRIBE_CUSTOMIZATION === 'true';
  }
  
  static get PROGRESSION_REWARDS() {
    return process.env.FEATURE_PROGRESSION_REWARDS === 'true';
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