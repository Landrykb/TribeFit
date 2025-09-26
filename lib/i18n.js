// TribeFit Internationalization System
// Supports English, French, and Japanese
import { useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation & Common
    home: 'Home',
    feed: 'Feed', 
    tribe: 'Tribe',
    coach: 'Coach',
    profile: 'Profile',
    notifications: 'Notifications',
    settings: 'Settings',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    continue: 'Continue',
    close: 'Close',
    loading: 'Loading...',
    
    // Welcome & Authentication
    welcome_back: 'Welcome back, {name}!',
    ready_goals: 'Ready to crush today\'s goals?',
    tribecoins: 'TribeCoins',
    day_streak: 'Day Streak',
    founders_tribe: 'Founders Tribe',
    schedule: 'Schedule',
    
    // Workout System
    start_workout: 'Start Workout',
    shrink_workout: 'Shrink Workout',
    skip_workout: 'Skip Workout',
    todays_plan: 'Today\'s Plan',
    workout_started: 'Workout started! Let\'s crush it! 💪',
    workout_complete: 'Workout Complete! Amazing work! 🏆',
    share_progress: 'Share Today\'s Progress',
    
    // Skip Messages (Funny/Entertaining)
    skip_messages: {
      lazy: '{name} is getting a bit lazy today! 😴',
      couch_potato: '{name} chose the couch over gains! 🛋️',
      netflix: '{name} is probably binge-watching instead of lifting! 📺',
      pizza: '{name} picked pizza over push-ups! 🍕',
      bed: '{name} hit snooze on their fitness goals! 😪',
      excuse: '{name} found a creative excuse to skip today! 🎭',
      hibernation: '{name} has entered hibernation mode! 🐻',
      gravity: '{name} was defeated by gravity today! 🌍',
      motivation: '{name}\'s motivation went on vacation! 🏖️',
      tomorrow: '{name} will "definitely" do it tomorrow! 📅'
    },
    
    // Coach System
    become_coach: 'Become a Coach',
    hire_coach: 'Hire Coach',
    rate_coach: 'Rate Coach',
    coach_hired: 'Coach hired successfully! 🎯',
    coach_application: 'Coach application submitted! We\'ll review it soon. 🏆',
    
    // Equipment & Voting
    spend_on_gear: 'Spend on Gear',
    donate_to_gym: 'Donate to Gym',
    pending_votes: 'Pending Votes',
    approve: 'Approve',
    reject: 'Reject',
    equipment_request: 'Equipment request submitted for tribe voting! 🗳️',
    
    // Settings & Notifications
    notification_settings: 'Notification Settings',
    skip_notifications: 'Skip Notifications',
    skip_notification_desc: 'Get notified when tribe members skip workouts',
    custom_skip_message: 'Custom Skip Message',
    choose_skip_message: 'Choose your skip message style',
    sign_out: 'Sign Out'
  },

  fr: {
    // Navigation & Common
    home: 'Accueil',
    feed: 'Fil',
    tribe: 'Tribu',
    coach: 'Coach', 
    profile: 'Profil',
    notifications: 'Notifications',
    settings: 'Paramètres',
    back: 'Retour',
    cancel: 'Annuler',
    save: 'Sauvegarder',
    continue: 'Continuer',
    close: 'Fermer',
    loading: 'Chargement...',
    
    // Welcome & Authentication
    welcome_back: 'Bon retour, {name}!',
    ready_goals: 'Prêt à écraser tes objectifs aujourd\'hui?',
    tribecoins: 'TribeCoins',
    day_streak: 'Série de jours',
    founders_tribe: 'Tribu des Fondateurs',
    schedule: 'Horaire',
    
    // Workout System
    start_workout: 'Commencer l\'Entraînement',
    shrink_workout: 'Raccourcir l\'Entraînement', 
    skip_workout: 'Sauter l\'Entraînement',
    todays_plan: 'Plan d\'Aujourd\'hui',
    workout_started: 'Entraînement commencé! Allons-y! 💪',
    workout_complete: 'Entraînement Terminé! Excellent travail! 🏆',
    share_progress: 'Partager les Progrès d\'Aujourd\'hui',
    
    // Skip Messages (Funny/Entertaining)
    skip_messages: {
      lazy: '{name} devient un peu paresseux aujourd\'hui! 😴',
      couch_potato: '{name} a choisi le canapé plutôt que les gains! 🛋️',
      netflix: '{name} regarde probablement Netflix au lieu de s\'entraîner! 📺',
      pizza: '{name} a préféré la pizza aux pompes! 🍕',
      bed: '{name} a appuyé sur "snooze" sur ses objectifs fitness! 😪',
      excuse: '{name} a trouvé une excuse créative pour sauter aujourd\'hui! 🎭',
      hibernation: '{name} est entré en mode hibernation! 🐻',
      gravity: '{name} a été vaincu par la gravité aujourd\'hui! 🌍',
      motivation: 'La motivation de {name} est partie en vacances! 🏖️',
      tomorrow: '{name} va "définitivement" le faire demain! 📅'
    },
    
    // Coach System
    become_coach: 'Devenir Coach',
    hire_coach: 'Engager un Coach',
    rate_coach: 'Évaluer le Coach',
    coach_hired: 'Coach engagé avec succès! 🎯',
    coach_application: 'Candidature de coach soumise! Nous l\'examinerons bientôt. 🏆',
    
    // Equipment & Voting
    spend_on_gear: 'Dépenser pour l\'Équipement',
    donate_to_gym: 'Faire un Don au Gym',
    pending_votes: 'Votes en Attente',
    approve: 'Approuver',
    reject: 'Rejeter',
    equipment_request: 'Demande d\'équipement soumise au vote de la tribu! 🗳️',
    
    // Settings & Notifications
    notification_settings: 'Paramètres de Notification',
    skip_notifications: 'Notifications de Saut',
    skip_notification_desc: 'Être notifié quand les membres de la tribu sautent les entraînements',
    custom_skip_message: 'Message de Saut Personnalisé',
    choose_skip_message: 'Choisissez votre style de message de saut',
    sign_out: 'Se Déconnecter'
  },

  ja: {
    // Navigation & Common  
    home: 'ホーム',
    feed: 'フィード',
    tribe: 'トライブ',
    coach: 'コーチ',
    profile: 'プロフィール',
    notifications: '通知',
    settings: '設定',
    back: '戻る',
    cancel: 'キャンセル',
    save: '保存',
    continue: '続行',
    close: '閉じる',
    loading: '読み込み中...',
    
    // Welcome & Authentication
    welcome_back: 'おかえりなさい、{name}さん！',
    ready_goals: '今日の目標を達成する準備はできていますか？',
    tribecoins: 'トライブコイン',
    day_streak: '連続日数',
    founders_tribe: 'ファウンダーズ・トライブ',
    schedule: 'スケジュール',
    
    // Workout System
    start_workout: 'ワークアウト開始',
    shrink_workout: 'ワークアウト短縮',
    skip_workout: 'ワークアウトスキップ',
    todays_plan: '今日のプラン',
    workout_started: 'ワークアウト開始！頑張りましょう！💪',
    workout_complete: 'ワークアウト完了！素晴らしい頑張り！🏆',
    share_progress: '今日の進捗をシェア',
    
    // Skip Messages (Funny/Entertaining)
    skip_messages: {
      lazy: '{name}さんが今日は少しサボり気味です！😴',
      couch_potato: '{name}さんが筋トレよりソファを選びました！🛋️',
      netflix: '{name}さんはトレーニングの代わりにNetflixを見ているかも！📺',
      pizza: '{name}さんが腕立て伏せよりピザを選びました！🍕',
      bed: '{name}さんがフィットネス目標にスヌーズを押しました！😪',
      excuse: '{name}さんが今日スキップする創造的な言い訳を見つけました！🎭',
      hibernation: '{name}さんが冬眠モードに入りました！🐻',
      gravity: '{name}さんが今日は重力に負けました！🌍',
      motivation: '{name}さんのモチベーションが休暇に出かけました！🏖️',
      tomorrow: '{name}さんは明日「絶対に」やると言ってます！📅'
    },
    
    // Coach System  
    become_coach: 'コーチになる',
    hire_coach: 'コーチを雇う',
    rate_coach: 'コーチを評価',
    coach_hired: 'コーチの雇用が成功しました！🎯',
    coach_application: 'コーチ申請を提出しました！すぐに審査いたします。🏆',
    
    // Equipment & Voting
    spend_on_gear: '器具に使う',
    donate_to_gym: 'ジムに寄付',
    pending_votes: '保留中の投票',
    approve: '承認',
    reject: '拒否',
    equipment_request: '器具リクエストをトライブ投票に提出しました！🗳️',
    
    // Settings & Notifications
    notification_settings: '通知設定',
    skip_notifications: 'スキップ通知',
    skip_notification_desc: 'トライブメンバーがワークアウトをスキップした時に通知を受け取る',
    custom_skip_message: 'カスタムスキップメッセージ',
    choose_skip_message: 'スキップメッセージのスタイルを選択',
    sign_out: 'サインアウト'
  }
};

// Language detection and management
export class I18n {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.listeners = [];
  }

  detectLanguage() {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage?.getItem('tribefit_language');
      if (stored && translations[stored]) {
        return stored;
      }
      
      // Check browser language
      const browserLang = navigator?.language?.substring(0, 2);
      if (translations[browserLang]) {
        return browserLang;
      }
    }
    
    // Default to English
    return 'en';
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLanguage = lang;
      if (typeof window !== 'undefined') {
        localStorage?.setItem('tribefit_language', lang);
      }
      this.notifyListeners();
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' }, 
      { code: 'ja', name: '日本語', flag: '🇯🇵' }
    ];
  }

  translate(key, replacements = {}) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value) {
      // Fallback to English
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    if (!value) {
      return key; // Return key if translation not found
    }
    
    // Replace placeholders
    let result = value;
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      result = result.replace(new RegExp(`{${placeholder}}`, 'g'), replacement);
    });
    
    return result;
  }

  // Alias for shorter usage
  t(key, replacements) {
    return this.translate(key, replacements);
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }

  // Get random skip message
  getRandomSkipMessage(userName) {
    const messages = translations[this.currentLanguage].skip_messages;
    const messageKeys = Object.keys(messages);
    const randomKey = messageKeys[Math.floor(Math.random() * messageKeys.length)];
    return this.translate(`skip_messages.${randomKey}`, { name: userName });
  }
}

// React hook for using i18n
import { useState, useEffect } from 'react';

// Create global instance
export const i18n = new I18n();

export function useTranslation() {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage());
  
  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      setLanguage(newLang);
    };
    
    i18n.addListener(handleLanguageChange);
    
    return () => {
      i18n.removeListener(handleLanguageChange);
    };
  }, []);
  
  return {
    t: i18n.t.bind(i18n),
    language,
    setLanguage: i18n.setLanguage.bind(i18n),
    availableLanguages: i18n.getAvailableLanguages(),
    getRandomSkipMessage: i18n.getRandomSkipMessage.bind(i18n)
  };
}