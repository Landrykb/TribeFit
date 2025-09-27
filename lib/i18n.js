// TribeFit Internationalization System
// Supports English, French, and Japanese

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
    
    // Short Action Words (Better for buttons)
    join: 'Join',
    create: 'Create', 
    upgrade: 'Upgrade',
    vote: 'Vote',
    view: 'View',
    request: 'Request',
    start: 'Start',
    generate: 'Generate',
    
    // Welcome & Authentication
    welcome_back: 'Welcome back, {name}!',
    ready_goals: 'Ready to crush today\'s goals?',
    tribecoins: 'TribeCoins',
    day_streak: 'Day Streak',
    founders_tribe: 'Founders Tribe',
    schedule: 'Schedule',
    app_tagline: 'Stronger Together. One Tribe, One Pact.',
    get_started: 'Get Started',
    join_thousands: 'Join thousands building fitness habits together',
    
    // Workout System
    start_workout: 'Start Workout',
    shrink_workout: 'Shrink Workout',
    skip_workout: 'Skip Workout',
    todays_plan: 'Today\'s Plan',
    ai_generate: 'AI Generate',
    workout_started: 'Workout started! Let\'s crush it! 💪',
    workout_complete: 'Workout Complete! Amazing work! 🏆',
    share_progress: 'Share Today\'s Progress',
    no_workout_planned: 'No workout planned for today',
    generate_ai_workout: 'Generate AI Workout Plan',
    workout_shrunk: 'Workout adjusted to {minutes} minutes! Starting now...',
    failed_start_workout: 'Failed to start workout',
    failed_shrink_workout: 'Failed to shrink workout',
    
    // Skip System & Snitch Messages
    skip_workout_question: 'Skip Today\'s Workout?',
    choose_skip_method: 'Choose how to skip:',
    pay_to_skip: 'Pay 100 TC to Skip',
    watch_ad_skip: 'Watch Ad to Skip (Free)',
    skip_pay_success: 'Workout skipped! 100 TC added to tribe pact 💰',
    skip_ad_success: 'Workout skipped! Ad watched successfully 📺',
    skip_failed: 'Skip failed',
    ad_playing: 'Ad Playing...',
    ad_will_finish: 'Ad will finish in',
    seconds: 'seconds',
    snitch_alert: '🚨 Tribe Alert',
    
    // Skip Messages (Funny/Entertaining)
    skip_messages: {
      lazy: '{name} is getting a bit lazy today! 😴 Your friend is spending money instead of working out!',
      couch_potato: '{name} chose the couch over gains! 🛋️ Money over muscle today!',
      netflix: '{name} is probably binge-watching instead of lifting! 📺 Cash over cardio!',
      pizza: '{name} picked pizza over push-ups! 🍕 Paid their way out of gains!',
      bed: '{name} hit snooze on their fitness goals! 😪 Wallet got lighter, not their body!',
      excuse: '{name} found a creative excuse to skip today! 🎭 TribeCoins talking louder than motivation!',
      hibernation: '{name} has entered hibernation mode! 🐻 Spending coins instead of burning calories!',
      gravity: '{name} was defeated by gravity today! 🌍 And by the urge to pay instead of play!',
      motivation: '{name}\'s motivation went on vacation! 🏖️ But their money stayed to skip workouts!',
      tomorrow: '{name} will "definitely" do it tomorrow! 📅 Today\'s workout sponsored by their wallet!',
      watched_ad: '{name} watched an ad to skip 📺. Still training tomorrow?',
      // NEW: Ad abuse messages
      ad_addict: '🚨 {name} is becoming an ad-watching champion! 📺 {count} ads this week instead of workouts!',
      binge_watcher: '{name} has watched {count} ads this week to skip! 📺 Netflix training harder than their muscles!',
      commercial_break: 'Breaking: {name} prefers commercials over crunches! 📺 {count} ads and counting this week!',
      ad_marathon: '{name} is marathon-watching ads instead of marathon-training! 🏃‍♂️📺 {count} skips this week!',
      screen_time: '{name}\'s screen time is higher than their rep count! 📱 {count} ad skips this week!'
    },

    // NEW: Deal Split Messages
    skip_deal_skipper: 'You skipped—{names} just powered up +{amount} TC 🔥',
    skip_deal_recipient: '{skipper} skipped. You received +{amount} TC.',
    
    // Wishlist & Shopping
    wishlist: 'Wishlist',
    add_to_wishlist: 'Add to Wishlist',
    buy_with_balance: 'Buy with my balance',
    pledge: 'Pledge',
    target_amount: 'Target Amount',
    pledged_amount: 'Pledged Amount',
    
    // Donations
    propose_donation: 'Propose donation',
    donation_vote: 'Vote on donation: {label} ({amount} TC)',
    approve: 'Approve',
    decline: 'Decline',
    
    // Calendar
    calendar_connect: 'Connect Calendar',
    workout_reminder: 'Workout starts now. Start / Start in 10 / Skip?',
    
    // Reactions
    reactions: 'Reactions',
    send_reaction: 'Send Reaction',
    
    // Coach System
    become_coach: 'Become a Coach',
    hire_coach: 'Hire Coach',
    rate_coach: 'Rate Coach',
    coaches: 'Coaches',
    no_coaches: 'No coaches available',
    be_first_coach: 'Be the first coach in your area! 🏆',
    certified: 'Certified',
    professional_coach_bio: 'Professional fitness coach specializing in strength training',
    per_session: 'per session',
    coach_hired: 'Coach hired successfully! 🎯',
    coach_application: 'Coach application submitted! We\'ll review it soon. 🏆',
    coach_rating_success: 'Coach rating submitted! ⭐',
    failed_hire_coach: 'Failed to hire coach',
    failed_coach_application: 'Failed to submit coach application',
    failed_rate_coach: 'Failed to rate coach',
    
    // Squad & Tribe System
    pact_wallet: 'Pact Wallet',
    deal_vault: 'Deal Vault',
    pact_balance: 'Pact Balance',
    squads_and_tribes: 'Squads & Tribes',
    squad: 'Squad',
    tribe: 'Tribe',
    create_squad: 'Create Squad',
    join_squad: 'Join Squad',
    upgrade_to_tribe: 'Upgrade to Tribe',
    squad_ready_upgrade: 'Squad Ready for Upgrade!',
    donate_to_gym: 'Donate to Gym',
    pending_votes: 'Pending Votes',
    approve: 'Approve',
    reject: 'Reject',
    voting_center: 'Voting Center',
    vote_now: 'Vote Now',
    vote_approve: 'Vote to Approve',
    vote_reject: 'Vote to Reject',
    equipment_request: 'Equipment request submitted for tribe voting! 🗳️',
    donation_request: 'Donation request submitted for tribe voting! 🗳️',
    voting_progress: 'Voting Progress',
    needed_to_approve: 'needed to approve',
    request_approved: 'Request Approved!',
    request_rejected: 'Request Rejected',
    no_pending_votes: 'No pending votes',
    vote_description: 'When tribe members request equipment or donations, you\'ll see them here',
    vote_success: 'Vote {vote} successful! 🗳️',
    failed_vote: 'Failed to vote',
    failed_equipment_request: 'Failed to submit equipment request',
    failed_donation_request: 'Failed to submit donation request',
    requested_by: 'Requested by',
    
    // Social & Feed
    tribe_feed: 'Tribe Feed',
    post: 'Post',
    share: 'Share',
    no_posts: 'No posts yet',
    share_first_workout: 'Share your first workout! 💪',
    time_ago: '2 hours ago',
    workout_photo: 'Workout Photo',
    default_workout_caption: 'Just finished an awesome workout! 💪',
    sharing_awesome_workout: 'Sharing this awesome workout!',
    post_liked: 'Post liked! ❤️',
    post_shared_success: 'Post shared to feed! 🎉',
    failed_share_post: 'Failed to share post',
    create_post: 'Create Post',
    whats_happening: 'What\'s happening?',
    share_workout_placeholder: 'Share your workout progress, achievements, or motivation...',
    share_post: 'Share Post',
    share_progress_caption: 'Share today\'s progress! 💪',
    tip_friend: 'Tip Friend',
    tip_tc: 'Tip TC',
    tip_sent_success: 'TribeCoins sent successfully! 🪙',
    failed_send_tip: 'Failed to send tip',
    
    // Tribe & Leaderboard
    pact_wallet: 'Pact Wallet',
    pact_balance: 'Pact Balance',
    members: 'members',
    days: 'days',
    tribe_leaderboard: 'Tribe Leaderboard',
    tribe_members_rank: '{members} members • Rank #{rank}',
    viewing_tribe: 'Viewing tribe details',
    keep_it_up: 'Keep it up',
    
    // Profile & Settings
    customize: 'Customize',
    language: 'Language',
    sign_out: 'Sign Out',
    
    // Notifications
    no_notifications: 'No notifications yet',
    stay_active_message: 'Stay active and you\'ll see updates here!',
    
    // Calendar & Scheduling
    schedule_workout: 'Schedule Workout',
    workout_calendar: 'Workout Calendar',
    tribe_workout_calendar: 'Tribe Workout Calendar',
    select_date: 'Select Date',
    select_time: 'Select Time',
    choose_workout: 'Choose Workout',
    ai_generate_workout: 'AI Generate Workout',
    create_personalized: 'Create a personalized workout plan',
    custom_workout: 'Custom Workout',
    visibility: 'Visibility',
    share_with_tribe: 'Share with tribe',
    keep_private: 'Keep private',
    workout_summary: 'Workout Summary',
    schedule_today: 'Schedule Today',
    workout_scheduled: 'Workout scheduled successfully! 📅',
    workout_plan_generated: 'AI workout plan generated! 🤖💪',
    
    // Ad abuse warnings
    ad_warning_approaching: 'You\'ve watched 2 ads this week. One more and your tribe gets notified!',
    ad_warning_exceeded: 'You\'ve watched {count} ads this week! Your tribe will be notified of excessive ad watching.',
    
    // Equipment & Voting
    spend_on_gear: 'Spend on Gear',
    donate_to_gym: 'Donate to Gym',
    pending_votes: 'Pending Votes',
    approve: 'Approve',
    reject: 'Reject',
    voting_center: 'Voting Center',
    vote_approve: 'Vote to Approve',
    vote_reject: 'Vote to Reject',
    equipment_request: 'Equipment request submitted for tribe voting! 🗳️',
    voting_progress: 'Voting Progress',
    needed_to_approve: 'needed to approve',
    request_approved: 'Request Approved!',
    request_rejected: 'Request Rejected',
    no_pending_votes: 'No pending votes',
    vote_description: 'When tribe members request equipment or donations, you\'ll see them here',
    
    // Calendar & Scheduling
    schedule_workout: 'Schedule Workout',
    workout_calendar: 'Workout Calendar',
    tribe_workout_calendar: 'Tribe Workout Calendar',
    select_date: 'Select Date',
    select_time: 'Select Time',
    choose_workout: 'Choose Workout',
    ai_generate_workout: 'AI Generate Workout',
    create_personalized: 'Create a personalized workout plan',
    custom_workout: 'Custom Workout',
    visibility: 'Visibility',
    share_with_tribe: 'Share with tribe',
    keep_private: 'Keep private',
    workout_summary: 'Workout Summary',
    schedule_today: 'Schedule Today',
    workout_scheduled: 'Workout scheduled successfully! 📅',
    
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
    feed: 'Flux',
    tribe: 'Tribu',
    coach: 'Coach',
    profile: 'Profil',
    notifications: 'Notifications',
    settings: 'Paramètres',
    back: 'Retour',
    cancel: 'Annuler',
    save: 'Sauver',
    continue: 'Continuer',
    close: 'Fermer',
    loading: 'Chargement...',
    
    // Short Action Words (Better for buttons)
    join: 'Rejoindre',
    create: 'Créer', 
    upgrade: 'Améliorer',
    vote: 'Voter',
    view: 'Voir',
    request: 'Demander',
    start: 'Démarrer',
    generate: 'Générer',
    
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
    
    // Skip Messages (Français amusant)
    skip_messages: {
      lazy: '{name} devient un peu paresseux aujourd\'hui! 😴 Votre ami dépense de l\'argent au lieu de s\'entraîner!',
      couch_potato: '{name} a choisi le canapé plutôt que les gains! 🛋️ L\'argent avant les muscles aujourd\'hui!',
      netflix: '{name} regarde probablement des séries au lieu de soulever! 📺 L\'argent avant le cardio!',
      pizza: '{name} a choisi la pizza plutôt que les pompes! 🍕 Il a payé pour éviter les gains!',
      bed: '{name} a appuyé sur snooze sur ses objectifs fitness! 😪 Le portefeuille s\'allège, pas son corps!',
      excuse: '{name} a trouvé une excuse créative pour éviter aujourd\'hui! 🎭 Les TribeCoins parlent plus fort que la motivation!',
      hibernation: '{name} est entré en mode hibernation! 🐻 Dépenser des pièces au lieu de brûler des calories!',
      gravity: '{name} a été vaincu par la gravité aujourd\'hui! 🌍 Et par l\'envie de payer plutôt que de jouer!',
      motivation: 'La motivation de {name} est partie en vacances! 🏖️ L\'entraînement d\'aujourd\'hui sponsorisé par son portefeuille!',
      tomorrow: '{name} le fera "définitivement" demain! 📅 L\'entraînement d\'aujourd\'hui sponsorisé par son portefeuille!',
      watched_ad: '{name} a regardé une pub pour éviter 📺. Toujours en formation demain?',
      // NEW: Messages d'abus de pub
      ad_addict: '🚨 {name} devient champion de regarder des pubs! 📺 {count} pubs cette semaine au lieu d\'entraînements!',
      binge_watcher: '{name} a regardé {count} pubs cette semaine pour éviter! 📺 Netflix s\'entraîne plus dur que ses muscles!',
      commercial_break: 'Breaking: {name} préfère les pubs aux abdos! 📺 {count} pubs et ça continue cette semaine!',
      ad_marathon: '{name} fait un marathon de pubs au lieu de marathon d\'entraînement! 🏃‍♂️📺 {count} évitements cette semaine!',
      screen_time: 'Le temps d\'écran de {name} est plus élevé que son nombre de répétitions! 📱 {count} évitements de pub cette semaine!'
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
    voting_center: 'Centre de Vote',
    vote_approve: 'Voter pour Approuver',
    vote_reject: 'Voter pour Rejeter',
    equipment_request: 'Demande d\'équipement soumise au vote de la tribu! 🗳️',
    voting_progress: 'Progrès du Vote',
    needed_to_approve: 'nécessaire pour approuver',
    request_approved: 'Demande Approuvée!',
    request_rejected: 'Demande Rejetée',
    no_pending_votes: 'Aucun vote en attente',
    vote_description: 'Quand les membres de la tribu demandent de l\'équipement ou des dons, vous les verrez ici',
    
    // Calendar & Scheduling
    schedule_workout: 'Programmer l\'Entraînement',
    workout_calendar: 'Calendrier d\'Entraînement',
    tribe_workout_calendar: 'Calendrier d\'Entraînement de la Tribu',
    select_date: 'Sélectionner la Date',
    select_time: 'Sélectionner l\'Heure',
    choose_workout: 'Choisir l\'Entraînement',
    ai_generate_workout: 'Générer l\'Entraînement IA',
    create_personalized: 'Créer un plan d\'entraînement personnalisé',
    custom_workout: 'Entraînement Personnalisé',
    visibility: 'Visibilité',
    share_with_tribe: 'Partager avec la tribu',
    keep_private: 'Garder privé',
    workout_summary: 'Résumé de l\'Entraînement',
    schedule_today: 'Programmer Aujourd\'hui',
    workout_scheduled: 'Entraînement programmé avec succès! 📅',
    
    // Avertissements d'abus de pub
    ad_warning_approaching: 'Vous avez regardé 2 pubs cette semaine. Une de plus et votre tribu sera notifiée!',
    ad_warning_exceeded: 'Vous avez regardé {count} pubs cette semaine! Votre tribu sera notifiée de la visualisation excessive de publicités.',
    
    // Settings & Notifications
    notification_settings: 'Paramètres de Notification',
    skip_notifications: 'Notifications de Saut',
    skip_notification_desc: 'Être notifié quand les membres de la tribu sautent les entraînements',
    custom_skip_message: 'Message de Saut Personnalisé',
    choose_skip_message: 'Choisissez votre style de message de saut',
    sign_out: 'Se Déconnecter',
    
    // NEW: Deal Split Messages
    skip_deal_skipper: 'Tu as zappé—{names} vient de gagner +{amount} TC 🔥',
    skip_deal_recipient: '{skipper} a zappé. Tu reçois +{amount} TC.',
    
    // Wishlist & Shopping
    wishlist: 'Liste de souhaits',
    add_to_wishlist: 'Ajouter aux souhaits',
    buy_with_balance: 'Acheter avec mon solde',
    pledge: 'Promettre',
    target_amount: 'Montant cible',
    pledged_amount: 'Montant promis',
    
    // Donations
    propose_donation: 'Proposer don',
    donation_vote: 'Vote pour don : {label} ({amount} TC)',
    approve: 'Approuver',
    decline: 'Refuser',
    
    // Calendar
    calendar_connect: 'Connecter calendrier',
    workout_reminder: 'Séance maintenant. Démarrer / Dans 10 min / Zapper ?',
    
    // Reactions
    reactions: 'Réactions',
    send_reaction: 'Envoyer réaction'
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
    
    // Short Action Words (Better for buttons)
    join: '参加',
    create: '作成', 
    upgrade: '昇格',
    vote: '投票',
    view: '表示',
    request: '申請',
    start: '開始',
    generate: '生成',
    
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
    
    // Skip Messages (面白い日本語)
    skip_messages: {
      lazy: '{name}今日はちょっと怠けてる! 😴 友達はワークアウトの代わりにお金を使ってる!',
      couch_potato: '{name}筋肉よりソファを選んだ! 🛋️ 今日はお金が筋肉より大事!',
      netflix: '{name}たぶん筋トレの代わりにNetflix見てる! 📺 有酸素よりお金!',
      pizza: '{name}腕立て伏せよりピザを選んだ! 🍕 筋肉の代わりにお金を払った!',
      bed: '{name}フィットネス目標にスヌーズボタンを押した! 😪 体じゃなくて財布が軽くなった!',
      excuse: '{name}今日は創造的な言い訳を見つけた! 🎭 やる気よりトライブコインの方が声が大きい!',
      hibernation: '{name}冬眠モードに入った! 🐻 カロリー燃焼の代わりにコインを消費!',
      gravity: '{name}今日は重力に負けた! 🌍 そして運動よりお金を払う誘惑に!',
      motivation: '{name}のやる気がバカンスに行った! 🏖️ 今日のワークアウトは財布がスポンサー!',
      tomorrow: '{name}明日は"絶対"やる! 📅 今日のワークアウトは財布がスポンサー!',
      watched_ad: '{name}スキップのために広告を見た 📺 明日はトレーニングする?',
      // NEW: 広告乱用メッセージ
      ad_addict: '🚨 {name}広告視聴チャンピオンになってる! 📺 今週ワークアウトの代わりに{count}個の広告!',
      binge_watcher: '{name}今週スキップのために{count}個の広告を見た! 📺 筋肉よりNetflixが頑張ってる!',
      commercial_break: 'ニュース速報: {name}腹筋よりCMを好む! 📺 今週{count}個の広告とまだ続く!',
      ad_marathon: '{name}トレーニングマラソンの代わりに広告マラソンをしてる! 🏃‍♂️📺 今週{count}回スキップ!',
      screen_time: '{name}のスクリーン時間が筋トレ回数より多い! 📱 今週{count}回の広告スキップ!'
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
    voting_center: '投票センター',
    vote_approve: '承認投票',
    vote_reject: '拒否投票',
    equipment_request: '器具リクエストをトライブ投票に提出しました！🗳️',
    voting_progress: '投票進捗',
    needed_to_approve: '承認に必要',
    request_approved: 'リクエスト承認！',
    request_rejected: 'リクエスト拒否',
    no_pending_votes: '保留中の投票なし',
    vote_description: 'トライブメンバーが器具や寄付をリクエストした時、ここに表示されます',
    
    // Calendar & Scheduling
    schedule_workout: 'ワークアウト予約',
    workout_calendar: 'ワークアウトカレンダー',
    tribe_workout_calendar: 'トライブワークアウトカレンダー',
    select_date: '日付選択',
    select_time: '時間選択',
    choose_workout: 'ワークアウト選択',
    ai_generate_workout: 'AIワークアウト生成',
    create_personalized: 'パーソナライズされたワークアウトプランを作成',
    custom_workout: 'カスタムワークアウト',
    visibility: '表示設定',
    share_with_tribe: 'トライブと共有',
    keep_private: 'プライベート',
    workout_summary: 'ワークアウト概要',
    schedule_today: '今日予約',
    workout_scheduled: 'ワークアウトが正常に予約されました！📅',
    
    // 広告乱用警告
    ad_warning_approaching: '今週2個の広告を見ました。もう1個でトライブに通知されます！',
    ad_warning_exceeded: '今週{count}個の広告を見ました！過度な広告視聴がトライブに通知されます。',
    
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

// Create global instance
export const i18n = new I18n();