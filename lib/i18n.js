// TribeFit Internationalization (EN/FR/JP)
// Multilingual support for social accountability features

export const translations = {
  // App branding
  'app.name': {
    en: 'TribeFit',
    fr: 'TribeFit', 
    ja: 'TribeFit'
  },
  'app.tagline': {
    en: 'Stronger together. One tribe, one pact.',
    fr: 'Plus forts ensemble. Une tribu, un pacte.',
    ja: '仲間と強く。ひとつの部族、ひとつの約束。'
  },

  // Skip flow - core "aha" feature
  'skip.title': {
    en: 'Skip Today?',
    fr: 'Zapper aujourd\'hui ?',
    ja: '今日はスキップ？'
  },
  'skip.prompt': {
    en: 'Skip today? Pay 100 TC or watch an ad.',
    fr: 'Tu veux zapper aujourd\'hui ? Paie 100 TC ou regarde une pub.',
    ja: '今日のトレーニングをスキップしますか？100 TCを支払うか、広告を見てください。'
  },
  'skip.pay_button': {
    en: 'Pay 100 TC 💸',
    fr: 'Payer 100 TC 💸',
    ja: '100 TC支払う 💸'
  },
  'skip.watch_ad_button': {
    en: 'Watch Ad 📺',
    fr: 'Regarder pub 📺', 
    ja: '広告を見る 📺'
  },
  'skip.cancel': {
    en: 'Back to Workout',
    fr: 'Retour à l\'entraînement',
    ja: 'ワークアウトに戻る'
  },

  // Snitch notifications - social accountability
  'snitch.paid': {
    en: '{{name}} PAID to skip 💸. Your tribe is stronger than excuses.',
    fr: '{{name}} a PAYÉ pour zapper 💸. La tribu est plus forte que les excuses.',
    ja: '{{name}} はお金でスキップしました 💸。部族は言い訳より強い。'
  },
  'snitch.watched_ad': {
    en: '{{name}} watched an ad to skip 📺. Still training tomorrow?',
    fr: '{{name}} a regardé une pub pour zapper 📺. Toujours d\'accord pour demain ?',
    ja: '{{name}} は広告を見てスキップしました 📺。明日はトレーニングしますか？'
  },

  // Wallet & TribeCoins
  'wallet.balance': {
    en: 'Balance',
    fr: 'Solde',
    ja: '残高'
  },
  'wallet.topup': {
    en: 'Top Up',
    fr: 'Recharger',
    ja: 'チャージ'
  },
  'wallet.insufficient': {
    en: 'Insufficient TribeCoins',
    fr: 'TribeCoins insuffisants',
    ja: 'TribeCoinが不足しています'
  },

  // Pact Wallet
  'pact.title': {
    en: 'Pact Wallet',
    fr: 'Portefeuille Pacte',
    ja: 'パクト ウォレット'
  },
  'pact.goal': {
    en: 'Goal: {{goal}}',
    fr: 'Objectif : {{goal}}',
    ja: '目標: {{goal}}'
  },
  'pact.spend_on_gear': {
    en: 'Spend on Gear',
    fr: 'Acheter du matériel',
    ja: '用具を購入'
  },

  // Tribes
  'tribe.create': {
    en: 'Create Tribe',
    fr: 'Créer une tribu',
    ja: '部族を作成'
  },
  'tribe.join': {
    en: 'Join Tribe',
    fr: 'Rejoindre une tribu', 
    ja: '部族に参加'
  },
  'tribe.members': {
    en: 'Members',
    fr: 'Membres',
    ja: 'メンバー'
  },

  // Workouts
  'workout.start': {
    en: 'Start Workout',
    fr: 'Commencer l\'entraînement',
    ja: 'ワークアウト開始'
  },
  'workout.shrink': {
    en: 'Shrink Workout',
    fr: 'Raccourcir l\'entraînement',
    ja: 'ワークアウト短縮'
  },
  'workout.today_plan': {
    en: 'Today\'s Plan',
    fr: 'Plan d\'aujourd\'hui',
    ja: '今日のプラン'
  },

  // Navigation
  'nav.home': {
    en: 'Home',
    fr: 'Accueil',
    ja: 'ホーム'
  },
  'nav.feed': {
    en: 'Feed',
    fr: 'Fil',
    ja: 'フィード'
  },
  'nav.pact': {
    en: 'Pact',
    fr: 'Pacte',
    ja: 'パクト'
  },
  'nav.coach': {
    en: 'Coach',
    fr: 'Coach',
    ja: 'コーチ'
  },
  'nav.profile': {
    en: 'Profile',
    fr: 'Profil',
    ja: 'プロフィール'
  },

  // Common actions
  'common.save': {
    en: 'Save',
    fr: 'Sauvegarder',
    ja: '保存'
  },
  'common.cancel': {
    en: 'Cancel',
    fr: 'Annuler',
    ja: 'キャンセル'
  },
  'common.confirm': {
    en: 'Confirm',
    fr: 'Confirmer',
    ja: '確認'
  },
  'common.loading': {
    en: 'Loading...',
    fr: 'Chargement...',
    ja: '読み込み中...'
  }
};

// Get user's preferred locale
export const getUserLocale = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tribefit_locale');
    if (stored && ['en', 'fr', 'ja'].includes(stored)) {
      return stored;
    }
    // Detect from browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('ja')) return 'ja';
  }
  return process.env.APP_DEFAULT_LOCALE || 'en';
};

// Translation function with interpolation
export const t = (key, params = {}, locale = null) => {
  const currentLocale = locale || getUserLocale();
  const translation = translations[key]?.[currentLocale] || translations[key]?.en || key;
  
  // Simple interpolation for {{variable}} patterns
  return translation.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return params[variable] || match;
  });
};

// Currency formatting with TC display
export const formatTC = (amount, locale = null) => {
  const currentLocale = locale || getUserLocale();
  const formatted = new Intl.NumberFormat(currentLocale === 'ja' ? 'ja-JP' : currentLocale === 'fr' ? 'fr-FR' : 'en-US').format(amount);
  return `${formatted} TC`;
};

// Show local currency equivalents (mock FX rates)
export const showLocalEquivalent = (tcAmount, locale = null) => {
  const currentLocale = locale || getUserLocale();
  const usdAmount = tcAmount * parseFloat(process.env.COIN_USD_PEG || 1.0);
  
  // Mock FX rates (in real app, get from Stripe)
  const rates = { USD: 1.0, EUR: 0.85, JPY: 110 };
  
  if (currentLocale === 'fr') {
    return `≈ €${(usdAmount * rates.EUR).toFixed(2)}`;
  } else if (currentLocale === 'ja') {
    return `≈ ¥${Math.round(usdAmount * rates.JPY)}`;
  }
  return `≈ $${usdAmount.toFixed(2)}`;
};

export default { t, formatTC, showLocalEquivalent, getUserLocale };