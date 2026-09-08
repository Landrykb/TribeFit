'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Users, Trophy, TrendingUp, Zap, Bell, Settings, 
  Globe, Moon, Sun, LogOut, Plus, Heart, Share, Camera, 
  Vote, CheckCircle, XCircle, Clock, Play, Pause, SkipForward, FastForward,
  UserPlus, Award, Star, Crown, Flame, ArrowUp, Coins, Gift,
  MapPin, Target, Dumbbell, Timer, Check, X, Tv, Home, Rss, User, CalendarClock, Shield, Bot, Sparkles,
  Feather as FeatherIcon, Crosshair, Footprints, Bike, MonitorPlay, Waves
} from 'lucide-react';

// Import new components
import { ToastProvider, useToast } from '../components/ui/Toast';
import { AuthProvider, useAuth } from '../components/auth/AuthProvider';
import { LoginModal } from '../components/auth/LoginModal';
import { Button } from '../components/ui/button';
import { Skeleton, SkeletonCard, SkeletonList, SkeletonStats } from '../components/ui/skeleton';
import { Tribeling } from '../components/Tribeling';
import { PowerUps } from '../components/PowerUps';
import { Modal } from '../components/ui/Modal';
// Removed Link/Router; using in-page modal for Catch-Up Credits
import { WorkoutGenerator, WorkoutPlanModal } from '../components/WorkoutGenerator';
import { MyWorkoutsManager } from '../components/MyWorkoutsManager';
import { EnhancedWorkoutGenerator } from '../components/EnhancedWorkoutGenerator';
import { WorkoutSession } from '../components/WorkoutSession';
import { ShrinkWorkoutModal } from '../components/ShrinkWorkoutModal';
import { WorkoutCalendar } from '../components/WorkoutCalendar';
import { WorkoutScheduler } from '../components/WorkoutScheduler';
import { EquipmentCatalog } from '../components/ui/EquipmentCatalog';
import { DonationModal } from '../components/ui/DonationModal';
import { TopUpModal } from '../components/ui/TopUpModal';
import { CoachRating, StarDisplay } from '../components/ui/CoachRating';
import { TipModal } from '../components/ui/TipModal';
import { VotingModal } from '../components/ui/VotingModal';
import { SquadCard } from '../components/ui/SquadCard';
import { SquadUpgradeModal } from '../components/ui/SquadUpgradeModal';
import { SquadLeaderboards } from '../components/ui/SquadLeaderboards';
import { SquadCreationModal } from '../components/ui/SquadCreationModal';
import { SquadDetailsModal } from '../components/ui/SquadDetailsModal';
import { ReactionsPanel } from '../components/ui/ReactionsPanel';
import { ProfileCustomization } from '../components/ProfileCustomization';
import { AvatarStudio } from '../components/AvatarStudio';
import { DailyVersus } from '../components/DailyVersus';
import { ReactionGlyph } from '../components/ReactionIcons';
import { CoachMarketplace } from '../components/CoachMarketplace';
import { DevControls } from '../components/DevControls';
import { StatusBadgeWithProgress } from '../components/StatusBadge';
import { GroupSettingsModal } from '../components/GroupSettingsModal';
import { useTranslation } from '../lib/i18n-hooks';
import { Features } from '../lib/feature-flags';
import { SquadProgression } from '../lib/squad-progression';
import { CalendarConnectModal } from '../components/CalendarConnectModal';

function TribeFitApp({ isDarkMode, setIsDarkMode }) {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const toast = useToast();
  const { t, language, setLanguage, availableLanguages, getRandomSkipMessage } = useTranslation();
  
  
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(!isAuthenticated);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showAdVideo, setShowAdVideo] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [walletBalance, setWalletBalance] = useState(user?.wallet_balance_tc || 500);
  // User's Snatched TCs (earned from others paying to skip)
  const [snatchedBalance, setSnatchedBalance] = useState(0);
  // Group vault (small share of skip fees) - synced with selected tribe's pact_balance_tc
  const [pactBalance, setPactBalance] = useState(0);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tribes, setTribes] = useState([]);
  const [squads, setSquads] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedTribe, setSelectedTribe] = useState('10000000-0000-0000-0000-000000000001'); // Alpha Squad ID
  const [wishlistProgress, setWishlistProgress] = useState({
    currentItem: 'Resistance Bands Set',
    targetAmount: 150,
    currentAmount: 85,
    nextNeeded: 65
  });
  // Dev-only: user override for multi-profile testing in separate tabs
  const [devUserId, setDevUserId] = useState('');
  const [devUserName, setDevUserName] = useState('');
  const effectiveUserId = devUserId || user?.id;
  const effectiveUserName = devUserName || user?.name || 'You';
  const [tribeling, setTribeling] = useState(null);
  const isSelectedTribe = useMemo(() => {
    const all = [...tribes, ...squads];
    const g = all.find(t => t.id === selectedTribe);
    return g?.group_type === 'tribe';
  }, [selectedTribe, tribes, squads]);
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWorkoutSession, setShowWorkoutSession] = useState(false);
  const [showShrinkModal, setShowShrinkModal] = useState(false);
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);
  const [showMyWorkouts, setShowMyWorkouts] = useState(false);
  const [showEnhancedGenerator, setShowEnhancedGenerator] = useState(false);
  const [showWorkoutPlan, setShowWorkoutPlan] = useState(false);
  const [showWorkoutCalendar, setShowWorkoutCalendar] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showEquipmentCatalog, setShowEquipmentCatalog] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showCoachRating, setShowCoachRating] = useState(false);
  const [showCoachMarketplace, setShowCoachMarketplace] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedHire, setSelectedHire] = useState(null);
  const [showProfileCustomization, setShowProfileCustomization] = useState(false);
  const [showAvatarStudio, setShowAvatarStudio] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const [showReactionsPanel, setShowReactionsPanel] = useState(false);
  const [reactionTarget, setReactionTarget] = useState(null);
  const [showSquadUpgradeModal, setShowSquadUpgradeModal] = useState(false);
  const [selectedSquadForUpgrade, setSelectedSquadForUpgrade] = useState(null);
  const [showSquadCreationModal, setShowSquadCreationModal] = useState(false);
  const [showSquadDetailsModal, setShowSquadDetailsModal] = useState(false);
  const [selectedSquadForDetails, setSelectedSquadForDetails] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [adSkipsThisWeek, setAdSkipsThisWeek] = useState(0);
  const [donationPool, setDonationPool] = useState(0);
  const [showDonors, setShowDonors] = useState(false);
  const [snatchedContributors, setSnatchedContributors] = useState([]);
  const [progressHistory, setProgressHistory] = useState([]);
  const [customWorkouts, setCustomWorkouts] = useState([]); // User's custom workouts from My Workouts
  const [activeMembers, setActiveMembers] = useState({}); // { [userId]: { name, startedAt } }
  // Skip mode & credits
  const [skipMode, setSkipMode] = useState('teammate_boost');
  const [catchUpCredits, setCatchUpCredits] = useState(0);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [missedWorkouts, setMissedWorkouts] = useState([]);
  const [modeVote, setModeVote] = useState(null);
  const [modeVoteTotals, setModeVoteTotals] = useState(null);
  const [showModeChangeModal, setShowModeChangeModal] = useState(false);
  const [modeTarget, setModeTarget] = useState('tribe_fund');
  // Tribe settings state
  const [tribeSettings, setTribeSettings] = useState(null);
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [showTribeSettings, setShowTribeSettings] = useState(false);
  // Skip perks modal state
  const [showSkipPerksModal, setShowSkipPerksModal] = useState(false);
  const [perksShieldApplied, setPerksShieldApplied] = useState(false);
  const [perksCreditsAdded, setPerksCreditsAdded] = useState(0);
  const [perksAdSavedPercent, setPerksAdSavedPercent] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  // Developer controls - hidden by default, activated by 5-tap on logo
  const [devMode, setDevMode] = useState(false);
  const [testUsers, setTestUsers] = useState([]);
  const [testGroups, setTestGroups] = useState([]);
  const devTapCountRef = useRef(0);
  const devTapTimerRef = useRef(null);
  const handleLogoTap = () => {
    devTapCountRef.current += 1;
    if (devTapTimerRef.current) clearTimeout(devTapTimerRef.current);
    if (devTapCountRef.current >= 5) {
      devTapCountRef.current = 0;
      setDevMode(prev => {
        const next = !prev;
        toast.info(next ? 'Developer mode enabled' : 'Developer mode disabled');
        return next;
      });
    } else {
      devTapTimerRef.current = setTimeout(() => { devTapCountRef.current = 0; }, 1500);
    }
  };
  // Notifications reactions
  const [notifReactions, setNotifReactions] = useState({}); // { [notifId]: { [emoji]: { count, my } } }
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null); // notifId or null
  const defaultReactions = ['👍','😂','👀','💀','🔥','😴','🪶'];
  const [reactionBurst, setReactionBurst] = useState(null); // { id, emoji, ts }
  // Schedules and reminder state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const scheduleTimersRef = useRef({}); // { [scheduleId]: { pre?: number, start?: number } }
  const [clockTick, setClockTick] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [calendarToday, setCalendarToday] = useState([]); // entries for today's date from /api/calendar
  const [activeWorkoutData, setActiveWorkoutData] = useState(null);
  const [icsUrl, setIcsUrl] = useState('');

  // Helper: update group mode (dev control)
  const updateGroupMode = async (mode) => {
    try {
      const res = await fetch('/api/group/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedTribe || 'default', mode })
      });
      const js = await res.json();
      if (res.ok) {
        setSkipMode(js.skipMode);
        toast.success(`Skip mode set to ${js.skipMode === 'tribe_fund' ? 'Tribe Fund' : 'Teammate Boost'}`);
      } else {
        toast.error(js.error || 'Failed to set mode');
      }
    } catch (e) {
      toast.error('Failed to set mode');
    }
  };

  // Use a credit immediately to start a generic 15m catch-up session (no missed selection)
  const useCreditNow = async () => {
    try {
      const uid = effectiveUserId || devUserId || 'dev_user';
      const res = await fetch('/api/credits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, action: 'consume' })
      });
      const js = await res.json();
      if (!res.ok) { toast.error(js.error || 'No credits available'); return; }
      setCatchUpCredits(Number(js.count) || 0);
      setMissedWorkouts(Array.isArray(js.missed) ? js.missed : []);
      setShowCreditsModal(false);
      // Start a generic 15-min catch-up session
      const schedLike = { workout: 'Catch-Up Session', duration: '15 min', ai_plan: null };
      const data = generatePlanFromSchedule(schedLike);
      setActiveWorkoutData(data);
      setShowWorkoutSession(true);
      toast.success('Catch-Up Credit used: 15m compressed plan started');
    } catch (e) {
      toast.error('Failed to use credit');
    }
  };

  // Simulate watching a short ad then perform skip('ad')
  const startAdWatch = () => {
    try {
      setShowSkipModal(false);
      setShowAdVideo(true);
      setAdProgress(0);
      const step = 5; // % per tick
      const intervalMs = 150;
      const timer = setInterval(() => {
        setAdProgress((p) => {
          const next = Math.min(100, p + step);
          if (next >= 100) {
            clearInterval(timer);
            setTimeout(async () => {
              setShowAdVideo(false);
              await handleSkip('ad');
            }, 200);
          }
          return next;
        });
      }, intervalMs);
    } catch (_) {}
  };

  // ---- Catch-Up Credits (persistent) ----
  const fetchCreditsData = async () => {
    try {
      setCreditsLoading(true);
      const uid = effectiveUserId || devUserId || 'dev_user';
      const res = await fetch(`/api/credits?userId=${encodeURIComponent(uid)}`);
      const js = await res.json().catch(() => ({}));
      if (res.ok) {
        if (typeof js.count === 'number') setCatchUpCredits(js.count);
        if (Array.isArray(js.missed)) setMissedWorkouts(js.missed);
      } else {
        try { toast.error(js.error || 'Failed to load Catch-Up Credits'); } catch (_) {}
      }
    } catch (_) {} finally { setCreditsLoading(false); }
  };

  const openCreditsModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toast.info('Loading Catch-Up Credits...');
    setShowCreditsModal(true);
    fetchCreditsData();
  };

  const startCatchUpFromMissed = (miss) => {
    try {
      const title = miss?.title || 'Catch-Up Workout';
      const schedLike = { workout: title, duration: '15 min', ai_plan: miss?.ai_plan || null };
      const data = generatePlanFromSchedule(schedLike);
      setActiveWorkoutData(data);
      setShowWorkoutSession(true);
    } catch (_) {}
  };

  const useCreditOnMissed = async (miss) => {
    try {
      const uid = effectiveUserId || devUserId || 'dev_user';
      const res = await fetch('/api/credits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, action: 'consume', missedId: miss?.id })
      });
      const js = await res.json();
      if (!res.ok) { toast.error(js.error || 'No credits available'); return; }
      setCatchUpCredits(Number(js.count) || 0);
      setMissedWorkouts(Array.isArray(js.missed) ? js.missed : []);
      setShowCreditsModal(false);
      startCatchUpFromMissed(miss);
      toast.success('Catch-Up Credit used: 15m compressed plan started');
    } catch (e) {
      toast.error('Failed to use credit');
    }
  };

  const useCreditForCurrentReminder = async () => {
    try {
      const uid = effectiveUserId || devUserId || 'dev_user';
      const res = await fetch('/api/credits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, action: 'consume' })
      });
      const js = await res.json();
      if (!res.ok) { toast.error(js.error || 'No credits available'); return; }
      setCatchUpCredits(Number(js.count) || 0);
      // Build plan from current reminder or today's schedule
      const title = (currentReminder?.title) || (todaySchedule?.schedule?.workout) || 'Workout';
      const schedLike = { workout: title, duration: '15 min', ai_plan: todaySchedule?.schedule?.ai_plan || null };
      const data = generatePlanFromSchedule(schedLike);
      setActiveWorkoutData(data);
      setShowWorkoutSession(true);
      toast.success('Catch-Up Credit used: 15m compressed plan started');
    } catch (e) {
      toast.error('Failed to use credit');
    }
  };

  useEffect(() => { fetchCreditsData(); }, [effectiveUserId]);

  // Removed URL-param catch-up handler; modal flow only

  // Toggle reaction on a notification (Slack-like)
  const toggleReaction = async (notifId, emoji) => {
    const myId = effectiveUserId || 'anon';
    const hasMy = !!notifReactions?.[notifId]?.[emoji]?.my;
    const action = hasMy ? 'remove' : 'add';
    setNotifReactions((prev) => {
      const p = { ...(prev || {}) };
      const row = { ...(p[notifId] || {}) };
      const entry = { count: (row[emoji]?.count || 0), my: !!row[emoji]?.my };
      if (action === 'add') { entry.count += 1; entry.my = true; } else { entry.count = Math.max(0, entry.count - 1); entry.my = false; }
      row[emoji] = entry; p[notifId] = row; return p;
    });
    try {
      // fun burst animation
      setReactionBurst({ id: notifId, emoji, ts: Date.now() });
      setTimeout(() => setReactionBurst(null), 700);
      await fetch('/api/events/broadcast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedTribe || 'default', type: 'notif_reaction', originUserId: myId, data: { notificationId: notifId, emoji, action } })
      });
    } catch (_) {}
  };

  // Catch-Up credit quick-use
  const useCatchUpCredit = async () => {
    if ((catchUpCredits || 0) <= 0) {
      toast.error('No Catch-Up Credits available');
      return;
    }
    try {
      await useCreditForCurrentReminder();
      setShowSkipPerksModal(false);
    } catch (_) {}
  };

  // Governance helpers
  const startModeChange = async (targetMode) => {
    try {
      const res = await fetch('/api/group/mode/vote/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedTribe || 'default', proposerId: effectiveUserId || 'anon', targetMode })
      });
      const js = await res.json();
      if (res.ok) {
        setModeVote(js.vote);
        setModeVoteTotals(null);
        toast.success('Vote started');
      } else {
        toast.error(js.error || 'Failed to start vote');
      }
    } catch (e) {
      toast.error('Failed to start vote');
    }
  };

  const castModeChange = async (support) => {
    try {
      const res = await fetch('/api/group/mode/vote/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedTribe || 'default', userId: effectiveUserId || 'anon', support: !!support })
      });
      const js = await res.json();
      if (res.ok) {
        setModeVote(js.vote);
        setModeVoteTotals(js.totals || null);
        if (js.finalized) {
          setModeVote(null);
          setModeVoteTotals(null);
        }
      } else {
        toast.error(js.error || 'Failed to vote');
      }
    } catch (e) {
      toast.error('Failed to vote');
    }
  };
  
  // Governance UI helpers
  const openProposeMode = () => {
    const opposite = skipMode === 'tribe_fund' ? 'teammate_boost' : 'tribe_fund';
    setModeTarget(opposite);
    setShowModeChangeModal(true);
  };

  const confirmProposeMode = async () => {
    await startModeChange(modeTarget);
    setShowModeChangeModal(false);
  };

  // Tribe Settings helpers
  const openTribeSettings = () => {
    setSettingsDraft(tribeSettings ? { ...tribeSettings } : {
      active_window_days: 7,
      vote_duration_hours: 72,
      vote_majority_percent: 50,
      teammate_boost_pct_members: 80,
      teammate_boost_pct_vault: 20,
      catch_up_credit_per_skip: 1,
      streak_shield_cap_per_month: 2,
      skip_cost_tc: 10,
      snitch_ad_threshold: 3,
      require_vote_for_mode_change: true,
    });
    setShowTribeSettings(true);
  };

  const openCurrentTribeDetails = () => {
    try {
      const id = selectedTribe || '10000000-0000-0000-0000-000000000001';
      const all = [...tribes, ...squads];
      let tribe = all.find((t) => t.id === id);
      if (!tribe) {
        // Fallbacks: your member tribe, else first tribe, else first squad
        tribe = tribes.find(t => t.is_member) || tribes[0] || squads[0];
      }
      if (tribe) {
        setSelectedSquadForDetails(tribe);
        setShowSquadDetailsModal(true);
      } else {
        toast.info('No tribe available to view');
      }
    } catch (_) {}
  };

  const onSettingsChange = (field, value) => {
    setSettingsDraft((prev) => {
      const next = { ...(prev || {}) };
      if (['active_window_days','vote_duration_hours','vote_majority_percent','teammate_boost_pct_members','teammate_boost_pct_vault','catch_up_credit_per_skip','streak_shield_cap_per_month','skip_cost_tc','snitch_ad_threshold'].includes(field)) {
        const n = Number(value);
        next[field] = Number.isFinite(n) ? n : prev?.[field] || 0;
        if (field === 'teammate_boost_pct_members') {
          next.teammate_boost_pct_members = Math.max(0, Math.min(100, next.teammate_boost_pct_members));
          next.teammate_boost_pct_vault = 100 - next.teammate_boost_pct_members;
        }
        if (field === 'teammate_boost_pct_vault') {
          next.teammate_boost_pct_vault = Math.max(0, Math.min(100, next.teammate_boost_pct_vault));
          next.teammate_boost_pct_members = 100 - next.teammate_boost_pct_vault;
        }
      } else if (field === 'require_vote_for_mode_change') {
        next[field] = Boolean(value);
      }
      return next;
    });
  };

  const saveTribeSettings = async () => {
    try {
      const res = await fetch('/api/group/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedTribe || 'default', settings: settingsDraft })
      });
      const js = await res.json();
      if (res.ok) {
        setTribeSettings(js.settings);
        setShowTribeSettings(false);
        toast.success('Settings saved');
      } else {
        toast.error(js.error || 'Failed to save settings');
      }
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };
  const [showCalSettings, setShowCalSettings] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [calList, setCalList] = useState([]);
  const [calSelected, setCalSelected] = useState([]);
  const [calKeywords, setCalKeywords] = useState('workout,gym,run,exercise');
  const [showCalendarConnect, setShowCalendarConnect] = useState(false);

  // Derive today's next/ongoing schedule from /api/calendar entries
  const todaySchedule = useMemo(() => {
    const list = Array.isArray(calendarToday) ? calendarToday.slice() : [];
    const now = Date.now();
    // Local date string (avoid UTC off-by-one)
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    // Helper: to absolute timestamps
    const toTs = (item) => {
      const start = new Date(`${dateStr}T${item.time || '00:00'}:00`).getTime();
      const durMin = (() => {
        const m = String(item.duration || '45 min').match(/(\d+)/);
        return m ? Number(m[1]) : 45;
      })();
      const end = start + durMin * 60 * 1000;
      return { start, end };
    };

    // Ongoing first
    for (const s of list) {
      const { start, end } = toTs(s);
      if (start <= now && now <= end) {
        return { schedule: s, status: 'ongoing' };
      }
    }
    // Upcoming today
    const todays = list.slice().sort((a, b) => {
      const ta = toTs(a).start;
      const tb = toTs(b).start;
      return ta - tb;
    });
    for (const s of todays) {
      if (toTs(s).start >= now) {
        return { schedule: s, status: 'upcoming' };
      }
    }
    return null;
  }, [calendarToday, clockTick]);

  // Presence helpers for Virtual Gym
  const addActiveMember = (id, name) => {
    if (!id) return;
    setActiveMembers((prev) => ({ ...prev, [id]: { name: name || 'Member', startedAt: Date.now() } }));
  };
  const removeActiveMember = (id) => {
    if (!id) return;
    setActiveMembers((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };
  useEffect(() => {
    const iv = setInterval(() => {
      setActiveMembers((prev) => {
        const now = Date.now();
        const next = {};
        Object.entries(prev || {}).forEach(([id, info]) => {
          if (now - (info?.startedAt || 0) < 2 * 60 * 60 * 1000) next[id] = info; // keep < 2h
        });
        return next;
      });
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  // Load Tribeling avatar state (streak/mood/stage/skin) for the home hero + profile
  const refreshAvatar = () => {
    if (!effectiveUserId) return;
    fetch(`/api/avatar?userId=${encodeURIComponent(effectiveUserId)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.avatar) setTribeling(d.avatar); })
      .catch(() => {});
  };
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshAvatar();
  }, [effectiveUserId, isAuthenticated]);

  // Create Stripe PaymentIntent or mock top-up
  const handleCreateTopUpCheckout = async ({ amount, currency, estimatedTc }) => {
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountTc: estimatedTc ?? amount, amount, currency, userId: effectiveUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        // If Stripe configured, we get client_secret. For now we surface a message.
        if (data?.client_secret) {
          toast.info('Stripe intent created. Complete payment in the integrated UI (not enabled in this demo).');
        }
        // Mock mode credits immediately and returns new_balance
        if (data?.success || typeof data?.new_balance === 'number') {
          const credited = Number(estimatedTc || amount) || amount;
          setWalletBalance(typeof data.new_balance === 'number' ? data.new_balance : (prev) => prev + credited);
          setShowTopUpModal(false);
          toast.success(`Wallet topped up by +${credited} TC`);
          addNotification({ title: 'Wallet top-up', body: `+${credited} TC credited`, type: 'topup' });
        }
        return data;
      } else {
        toast.error('Failed to create checkout');
        return null;
      }
    } catch (e) {
      toast.error('Top-up failed: ' + e.message);
      return null;
    }
  };

  const openCalendarSettings = async () => {
    try {
      setCalLoading(true);
      const uid = effectiveUserId || devUserId || 'dev_user';
      const [listRes, setRes] = await Promise.all([
        fetch(`/api/calendar/google/list?userId=${encodeURIComponent(uid)}`),
        fetch(`/api/calendar/google/settings?userId=${encodeURIComponent(uid)}`)
      ]);
      const listJson = await listRes.json();
      const setJson = await setRes.json();
      if (listRes.ok) setCalList(Array.isArray(listJson.calendars) ? listJson.calendars : []);
      if (setRes.ok) {
        setCalSelected(Array.isArray(setJson?.settings?.calendars) ? setJson.settings.calendars : []);
        if (typeof setJson?.settings?.keywords === 'string') setCalKeywords(setJson.settings.keywords);
      }
      setShowCalSettings(true);
    } catch (e) {
      toast.error('Failed to load calendar settings');
    } finally {
      setCalLoading(false);
    }
  };

  const toggleCalendarSelect = (id) => {
    setCalSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveCalendarSettings = async () => {
    try {
      const uid = effectiveUserId || devUserId || 'dev_user';
      const res = await fetch('/api/calendar/google/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, calendars: calSelected, keywords: calKeywords })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'save failed');
      toast.success('Calendar settings saved');
      setShowCalSettings(false);
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };

  const checkGoogleConnected = async () => {
    try {
      const uid = effectiveUserId || devUserId || 'dev_user';
      const res = await fetch(`/api/calendar/google/connected?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setGoogleConnected(!!data?.connected);
    } catch (_) {
      setGoogleConnected(false);
    }
  };

  const ensureNotificationPermission = async () => {
    try {
      if (typeof Notification === 'undefined') return false;
      if (Notification.permission === 'granted') { setNotificationsEnabled(true); return true; }
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        const ok = perm === 'granted';
        setNotificationsEnabled(ok);
        return ok;
      }
      return false;
    } catch {
      return false;
    }
  };

  const notifyNative = async (title, body) => {
    try {
      if (typeof Notification === 'undefined') return;
      if (Notification.permission !== 'granted') {
        const ok = await ensureNotificationPermission();
        if (!ok) return;
      }
      new Notification(title, { body });
    } catch {}
  };

  // ===== Developer Control Handlers =====
  const loadDevData = async () => {
    try {
      const [usersRes, groupsRes] = await Promise.all([
        fetch('/api/dev/users'),
        fetch('/api/dev/groups')
      ]);
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setTestUsers(usersData.users || []);
      }
      
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setTestGroups(groupsData.groups || []);
      }
    } catch (error) {
      console.error('Failed to load dev data:', error);
    }
  };

  const devCreateUser = async (name) => {
    try {
      const res = await fetch('/api/dev/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(`Created user: ${data.user.name}`);
        await loadDevData();
        return data.user;
      }
    } catch (error) {
      toast.error('Failed to create user');
      console.error(error);
    }
  };

  const devSwitchUser = async (userId) => {
    try {
      const res = await fetch('/api/dev/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', userId })
      });
      
      if (res.ok) {
        const data = await res.json();
        const switchedUser = data.user;
        
        // Update dev override
        setDevUserId(switchedUser.id);
        setDevUserName(switchedUser.name);
        
        // Update auth user to reflect the switched user
        updateUser({
          id: switchedUser.id,
          name: switchedUser.name,
          email: switchedUser.email || `${switchedUser.id}@tribefit.app`,
          streak: switchedUser.streak || 0,
          total_workouts: switchedUser.total_workouts || 0,
          wallet_balance_tc: switchedUser.wallet_balance_tc || 0,
          snatched_balance_tc: switchedUser.snatched_balance_tc || 0,
          group_id: switchedUser.group_id,
          group_type: switchedUser.group_type
        });
        
        // Update local balances
        setWalletBalance(switchedUser.wallet_balance_tc || 0);
        setSnatchedBalance(switchedUser.snatched_balance_tc || 0);
        
        toast.success(`Switched to ${switchedUser.name}`);
        loadInitialData();
      }
    } catch (error) {
      toast.error('Failed to switch user');
      console.error(error);
    }
  };

  const devUpdateStats = async (updates) => {
    if (!effectiveUserId) {
      toast.error('No user selected');
      return;
    }
    
    try {
      const res = await fetch('/api/dev/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          userId: effectiveUserId,
          updates 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Update local state immediately for responsive UI
        if (updates.wallet_balance_tc !== undefined) {
          setWalletBalance(updates.wallet_balance_tc);
        }
        if (updates.snatched_balance_tc !== undefined) {
          setSnatchedBalance(updates.snatched_balance_tc);
        }
        
        // Update auth user object if it's the current user
        if (user && user.id === effectiveUserId) {
          updateUser({
            ...updates,
            streak: updates.streak !== undefined ? updates.streak : user.streak,
            total_workouts: updates.total_workouts !== undefined ? updates.total_workouts : user.total_workouts
          });
        }
        
        toast.success('Stats updated!');
        await loadDevData();
        loadInitialData();
      }
    } catch (error) {
      toast.error('Failed to update stats');
      console.error(error);
    }
  };

  const devUpdateSquadStats = async (groupId, updates) => {
    if (!groupId) {
      toast.error('No squad selected');
      return;
    }
    
    try {
      const res = await fetch('/api/dev/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_stats', 
          groupId,
          updates 
        })
      });
      
      if (res.ok) {
        toast.success('Squad stats updated!');
        await loadDevData();
        loadInitialData();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update squad stats');
      }
    } catch (error) {
      toast.error('Failed to update squad stats');
      console.error(error);
    }
  };

  const devAddToGroup = async (groupId, groupType) => {
    if (!effectiveUserId) {
      toast.error('No user selected');
      return null;
    }
    
    try {
      const payload = { userId: effectiveUserId, groupId };
      const res = await fetch('/api/dev/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        return data;
      } else {
        const error = await res.json();
        console.error('devAddToGroup API error:', error);
        return null;
      }
    } catch (error) {
      console.error('devAddToGroup failed:', error);
      return null;
    }
  };

  const devTriggerSkip = () => {
    const now = new Date().toISOString();
    const skipNotif = {
      id: `skip_${Date.now()}`,
      type: 'paid_skip',
      title: 'Teammate Paid Skip',
      body: `${effectiveUserName} PAID to skip! 💸 Your tribe is stronger than excuses.`,
      message: `${effectiveUserName} PAID to skip! 💸 Your tribe is stronger than excuses.`,
      created_at: now,
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prev => [skipNotif, ...prev]);
    toast.info('Skip notification triggered');
  };

  const devTriggerSnatch = (amount) => {
    setSnatchedBalance(prev => prev + amount);
    
    // Get a random user name from testUsers or use a fun name
    const skipperNames = testUsers && testUsers.length > 0 
      ? testUsers.filter(u => u.id !== effectiveUserId).map(u => u.name)
      : ['Sarah', 'Mike', 'Jessica', 'Tom', 'Emily', 'David'];
    const skipperName = skipperNames[Math.floor(Math.random() * skipperNames.length)] || 'Teammate';
    
    // Fun sarcastic messages
    const funMessages = [
      `💸 Cha-ching! You snatched ${amount} TC from ${skipperName}'s guilt skip. Thanks for the donation! 😏`,
      `🎉 ${skipperName} paid ${amount} TC to avoid sweating. Your wallet says thanks! 💰`,
      `😎 ${skipperName} bought their way out for ${amount} TC. You're welcome for making them feel guilty!`,
      `🤑 Ka-ching! ${skipperName} dropped ${amount} TC for you. Skipping never felt so expensive!`,
      `💪 While ${skipperName} rested, you earned ${amount} TC. Capitalism at its finest!`,
      `🎊 ${skipperName}'s laziness = Your ${amount} TC. The tribe thanks you for your sacrifice... I mean, their sacrifice!`,
      `😂 ${skipperName} paid ${amount} TC to skip. Meanwhile, you're here grinding. Enjoy their money!`
    ];
    
    const message = funMessages[Math.floor(Math.random() * funMessages.length)];
    toast.success(`+${amount} TC snatched from ${skipperName}! 💰`);
    
    const now = new Date().toISOString();
    const snatchNotif = {
      id: `snatch_${Date.now()}`,
      type: 'snatch',
      title: `Snatched ${amount} TC from ${skipperName}`,
      body: message,
      message: message,
      created_at: now,
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prev => [snatchNotif, ...prev]);
  };

  const devAddBalance = (amount) => {
    setWalletBalance(prev => Math.max(0, prev + amount));
    if (amount > 0) {
      toast.success(`+${amount} TC added to wallet`);
    } else {
      toast.info(`${amount} TC deducted from wallet`);
    }
  };

  const devAddProgress = async (count) => {
    if (!effectiveUserId) {
      toast.error('No user selected');
      return;
    }

    try {
      // Generate fake workout sessions
      const workoutTypes = ['Push Day', 'Pull Day', 'Leg Day', 'Full Body', 'HIIT', 'Cardio', 'Core Blast'];
      const sessions = [];
      
      for (let i = 0; i < count; i++) {
        const daysAgo = Math.floor(Math.random() * 30); // Random date in last 30 days
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        sessions.push({
          id: `prog_${Date.now()}_${i}`,
          user_id: effectiveUserId,
          date: date.toISOString(),
          title: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
          duration_sec: 1800 + Math.floor(Math.random() * 1800), // 30-60 minutes
          completed_sets: 8 + Math.floor(Math.random() * 8) // 8-15 sets
        });
      }

      // Add to progressHistory state
      setProgressHistory(prev => [...sessions, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));

      toast.success(`Added ${count} workout sessions!`);
    } catch (error) {
      toast.error('Failed to add progress');
      console.error(error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, effectiveUserId]); // Reload when user switches

  // Handle invite links from URL parameters
  useEffect(() => {
    if (typeof window === 'undefined' || !squads.length) return;
    
    const params = new URLSearchParams(window.location.search);
    const squadId = params.get('squad');
    
    if (squadId) {
      const invitedSquad = squads.find(s => s.id === squadId);
      
      if (invitedSquad) {
        // Auto-open squad details modal
        setSelectedSquadForDetails(invitedSquad);
        setShowSquadDetailsModal(true);
        
        // Show friendly toast
        if (!invitedSquad.is_member) {
          toast.success(`🎉 You've been invited to join ${invitedSquad.name}!`, { duration: 5000 });
        }
        
        // Clean URL (remove squad parameter)
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [squads]);

  // Load initial groups, balances, donors, and persisted notifications
  const loadInitialData = async () => {
    try {
      // 1) Load groups
      const gRes = await fetch('/api/groups');
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData?.groups) {
          // Show all groups together (squads evolve into tribes)
          // Check if current user is member of each group
          const allGroups = gData.groups.map(g => ({
            ...g,
            is_member: g.members?.includes(effectiveUserId) // Only check members array
          }));
          
          setSquads(allGroups); // Put all in squads array for display
          setTribes([]); // Clear tribes array
          
          // Sync pactBalance with selected tribe's vault
          const currentTribe = allGroups.find((g) => g.id === selectedTribe);
          if (currentTribe) {
            const vaultBalance = currentTribe.pact_balance_tc ?? currentTribe.pact_balance ?? 0;
            setPactBalance(vaultBalance);
          } else if (selectedTribe) {
            // Selected tribe not found in loaded groups
          }
          
          if (!allGroups.find((g) => g.id === selectedTribe) && allGroups.length > 0) {
            const firstTribe = allGroups[0];
            setSelectedTribe(firstTribe.id);
            const firstVault = firstTribe.pact_balance_tc ?? firstTribe.pact_balance ?? 0;
            setPactBalance(firstVault);
          }
        }
      }

      // 2) Load balances for current user/group
      if (effectiveUserId && selectedTribe) {
        await refreshBalances();
      }

      // 3) Load donors list
      await refreshDonors();

      // 4) Load notifications from localStorage
      loadPersistedNotifications();
    } catch (_) {}
  };

  const refreshBalances = async () => {
    try {
      // Only load vault if we have a valid selectedTribe
      if (!selectedTribe) {
        return;
      }
      
      const bRes = await fetch(`/api/wallet/balances?userId=${encodeURIComponent(effectiveUserId || 'anon')}&groupId=${encodeURIComponent(selectedTribe)}`);
      if (bRes.ok) {
        const bData = await bRes.json();
        const b = bData?.balances || {};
        if (typeof b.wallet === 'number') setWalletBalance(b.wallet);
        if (typeof b.snatched === 'number') setSnatchedBalance(b.snatched);
        if (typeof b.pact === 'number') {
          setPactBalance(b.pact);
        }
      }
    } catch (err) {
      console.error('Balance refresh error:', err);
    }
  };

  const refreshDonors = async () => {
    try {
      const res = await fetch(`/api/wallet/snatched-contributors?groupId=${encodeURIComponent(selectedTribe || '')}`);
      if (res.ok) {
        const data = await res.json();
        setSnatchedContributors(Array.isArray(data?.contributors) ? data.contributors : []);
      }
    } catch (_) {}
  };

  const notificationsKey = () => `tribefit_notifications_${effectiveUserId || 'anon'}_${selectedTribe || 'default'}`;
  const loadPersistedNotifications = () => {
    try {
      const raw = localStorage.getItem(notificationsKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
    } catch (_) {}
  };

  useEffect(() => {
    // When user or group changes, reload balances, donors, and notifications
    (async () => {
      if (!effectiveUserId || !selectedTribe) return;
      await refreshBalances();
      await refreshDonors();
      loadPersistedNotifications();
      await fetchProgressHistory();
      
      // Sync vault balance from squads array
      const currentTribe = squads.find(s => s.id === selectedTribe);
      if (currentTribe) {
        const vaultBalance = currentTribe.pact_balance_tc ?? currentTribe.pact_balance ?? 0;
        setPactBalance(vaultBalance);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId, selectedTribe]);

  // Load progress when switching to Progress tab
  useEffect(() => {
    if (activeTab === 'progress') {
      fetchProgressHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    // Persist notifications for this user+group
    try {
      localStorage.setItem(notificationsKey(), JSON.stringify(notifications));
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  // Persist dev overrides
  useEffect(() => {
    try {
      const id = localStorage.getItem('dev_user_id');
      const nm = localStorage.getItem('dev_user_name');
      const gid = localStorage.getItem('dev_group_id');
      if (id) setDevUserId(id);
      if (nm) setDevUserName(nm);
      if (gid) setSelectedTribe(gid);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dev_user_id', devUserId || '');
      localStorage.setItem('dev_user_name', devUserName || '');
      localStorage.setItem('dev_group_id', selectedTribe || '');
    } catch {}
  }, [devUserId, devUserName, selectedTribe]);

  // Load dev data on mount
  useEffect(() => {
    if (devMode) {
      loadDevData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devMode]);

  // Load group skip mode whenever tribe changes
  useEffect(() => {
    const loadMode = async () => {
      try {
        if (!selectedTribe) return;
        const res = await fetch(`/api/group/mode?groupId=${encodeURIComponent(selectedTribe)}`);
        const js = await res.json();
        if (res.ok && js?.skipMode) setSkipMode(js.skipMode);
      } catch (_) {}
    };
    loadMode();
  }, [selectedTribe]);

  // Load current mode vote status whenever tribe changes
  useEffect(() => {
    const loadVote = async () => {
      try {
        if (!selectedTribe) return;
        const res = await fetch(`/api/group/mode/vote?groupId=${encodeURIComponent(selectedTribe)}`);
        const js = await res.json();
        if (res.ok && js?.vote) {
          setModeVote(js.vote);
          setModeVoteTotals(js.totals || null);
        } else {
          setModeVote(null);
          setModeVoteTotals(null);
        }
      } catch (_) {}
    };
    loadVote();
  }, [selectedTribe]);

  // Load tribe settings whenever tribe changes
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!selectedTribe) return;
        const res = await fetch(`/api/group/settings?groupId=${encodeURIComponent(selectedTribe)}`);
        const js = await res.json();
        if (res.ok && js?.settings) setTribeSettings(js.settings);
      } catch (_) {}
    };
    loadSettings();
  }, [selectedTribe]);

  // SSE: subscribe to group events for real-time updates across tabs/users
  useEffect(() => {
    if (!selectedTribe) return;
    const gid = selectedTribe || 'default';
    const uid = effectiveUserId || 'anon';
    let es;
    try {
      es = new EventSource(`/api/events?groupId=${encodeURIComponent(gid)}&userId=${encodeURIComponent(uid)}`);
      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data || '{}');
          if (!msg?.type) return;
          if (msg.type === 'paid_skip') {
            // Ignore self event; handled already on client flow
            if (msg.skipper_id !== effectiveUserId) {
              // New format: split_results array
              const splitResults = Array.isArray(msg.split_results) ? msg.split_results : [];
              const myShare = splitResults.find(r => r.member_id === effectiveUserId);
              
              if (myShare && myShare.amount_received > 0) {
                setSnatchedBalance(prev => prev + myShare.amount_received);
                addNotification({ 
                  title: `${msg.skipper_name || 'Member'} paid to skip`, 
                  body: `+${myShare.amount_received.toFixed(1)} TC snatched`, 
                  type: 'snatched' 
                });
                toast.success(`\ud83c\udf81 ${msg.skipper_name} skipped! You got ${myShare.amount_received.toFixed(1)} TC!`);
              }
              
              // Update vault balance with new total
              if (msg.vault_balance) {
                setPactBalance(msg.vault_balance);
                // Also update squads array to keep in sync
                setSquads(prev => prev.map(s => 
                  s.id === selectedTribe 
                    ? { ...s, pact_balance_tc: msg.vault_balance, pact_balance: msg.vault_balance }
                    : s
                ));
              }
            }
            return;
          }
          if (msg.type === 'mode_changed') {
            setSkipMode(msg.skipMode);
            setModeVote(null);
            setModeVoteTotals(null);
            toast.info(`Skip mode changed to ${msg.skipMode === 'tribe_fund' ? 'Tribe Fund' : 'Teammate Boost'}`);
            return;
          }
          if (msg.type === 'vote_started') {
            setModeVote(msg.vote);
            setModeVoteTotals(null);
            toast.info('A vote to change skip mode has started');
            return;
          }
          if (msg.type === 'vote_cast') {
            setModeVote(msg.vote);
            setModeVoteTotals(msg.totals || null);
            return;
          }
          if (msg.type === 'settings_changed') {
            if (msg.settings) setTribeSettings(msg.settings);
            toast.info('Tribe settings updated');
            return;
          }
          if (msg.type === 'snitch') {
            const id = msg.eventId || `sn_${Date.now()}`;
            addNotification({ id, title: 'Too many ad skips', body: `${msg.originUserName || 'Member'} is watching too many ads to skip`, type: 'snitch' });
            return;
          }
          if (msg.type === 'notif_reaction') {
            const { notificationId, emoji, action } = msg;
            setNotifReactions((prev) => {
              const p = { ...(prev || {}) };
              const row = { ...(p[notificationId] || {}) };
              const entry = { count: (row[emoji]?.count || 0), my: !!row[emoji]?.my };
              if (action === 'add') entry.count += 1; else entry.count = Math.max(0, entry.count - 1);
              row[emoji] = entry; p[notificationId] = row; return p;
            });
            return;
          }
          if (msg.type === 'workout_started') {
            if (msg.originUserId !== effectiveUserId) {
              addActiveMember(msg.originUserId, msg.originUserName || 'Member');
              addNotification({ title: `${msg.originUserName || 'Member'} started a workout`, body: 'Cheer them on! 💪', type: 'activity' });
            }
            return;
          }
          if (msg.type === 'workout_completed') {
            if (msg.originUserId !== effectiveUserId) {
              removeActiveMember(msg.originUserId);
              addNotification({ title: `${msg.originUserName || 'Member'} finished a workout`, body: '👏 Great job!', type: 'activity' });
            }
            return;
          }
          if (msg.type === 'snitch') {
            if (msg.originUserId !== effectiveUserId) {
              const name = msg.originUserName || 'Member';
              addNotification({ title: 'Snitch alert', body: `${name} watched too many ads to skip workouts`, type: 'snitch' });
            }
            return;
          }
          if (msg.type === 'purchase') {
            addNotification({ title: 'Purchase event', body: `Item ${msg.item_id} purchased (${msg.amount_tc} TC)`, type: 'purchase' });
            return;
          }
        } catch (_) {}
      };
    } catch (_) {}
    return () => {
      try { es && es.close(); } catch (_) {}
    };
  }, [selectedTribe, effectiveUserId]);

  // ---- Calendar Today (fetch + timers) ----
  // Local date helper (avoid UTC off-by-one)
  const localDateStr = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  // Build a simple workout plan from a scheduled item when no AI plan exists
  const generatePlanFromSchedule = (sched, targetMinutes = null) => {
    try {
      if (!sched) return null;
      const title = sched.workout || 'Scheduled Workout';
      const m = String(sched.duration || '').match(/(\d+)/);
      const originalDuration = m ? Number(m[1]) : 45;
      
      // Use target minutes if provided (for shrinking), otherwise use original
      const durationMin = targetMinutes || originalDuration;
      
      // Adjust blocks based on target duration
      const block = Math.max(5, Math.round(durationMin / 4));
      const warmupTime = Math.max(3, Math.round(durationMin * 0.15)); // 15% warmup
      const cooldownTime = Math.max(2, Math.round(durationMin * 0.10)); // 10% cooldown
      
      const ex = [
        { name: 'Warm-up', sets: 1, reps: `${warmupTime} min`, restTime: 30, instructions: 'Light cardio + mobility' },
        { name: title, sets: targetMinutes ? Math.max(2, Math.round(3 * (durationMin / originalDuration))) : 3, reps: 12, restTime: 60, instructions: 'Main movement. Focus on form.' },
        { name: 'Accessory Circuit', sets: targetMinutes ? Math.max(1, Math.round(2 * (durationMin / originalDuration))) : 2, reps: 15, restTime: 45, instructions: 'Two light movements back-to-back' },
        { name: 'Cooldown', sets: 1, reps: `${cooldownTime} min`, restTime: 0, instructions: 'Stretching and breathing' }
      ];
      return { title: targetMinutes ? `${title} (${durationMin} min)` : title, durationMin, exercises: ex };
    } catch { return null; }
  };
  const fetchCalendarToday = async () => {
    try {
      const uid = effectiveUserId || devUserId || 'dev_user';
      const dateStr = localDateStr();
      const res = await fetch(`/api/calendar?user_id=${encodeURIComponent(uid)}&date=${encodeURIComponent(dateStr)}`);
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      const list = Array.isArray(data?.workouts) ? data.workouts : [];
      setCalendarToday(list);
      scheduleCalendarTimersFromList(list);
    } catch (_) {}
  };

  // Progress history (moved out of useMemo)
  const fetchProgressHistory = async () => {
    try {
      const uid = effectiveUserId || devUserId || 'dev_user';
      const res = await fetch(`/api/progress?user_id=${encodeURIComponent(uid)}&limit=30`);
      if (!res.ok) return;
      const data = await res.json();
      setProgressHistory(Array.isArray(data?.progress) ? data.progress : []);
    } catch (_) {}
  };

  // Fetch custom workouts
  const fetchCustomWorkouts = async () => {
    try {
      const uid = effectiveUserId || devUserId || 'dev_user';
      const res = await fetch(`/api/workouts/my?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return;
      const data = await res.json();
      setCustomWorkouts(Array.isArray(data?.workouts) ? data.workouts : []);
    } catch (_) {}
  };

  const clearTimers = (id) => {
    const entry = scheduleTimersRef.current[id];
    if (entry?.pre) clearTimeout(entry.pre);
    if (entry?.start) clearTimeout(entry.start);
    delete scheduleTimersRef.current[id];
  };

  

  const scheduleCalendarTimersFromList = (list) => {
    // Clear timers for removed/changed schedules
    const knownIds = new Set(list.map(s => s.id));
    Object.keys(scheduleTimersRef.current).forEach((id) => {
      if (!knownIds.has(id)) clearTimers(id);
    });
    list.forEach(scheduleCalendarReminderForOne);
  };

  const scheduleCalendarReminderForOne = (item) => {
    try { clearTimers(item.id); } catch (_) {}
    const now = Date.now();
    const dateStr = localDateStr();
    const startTs = new Date(`${dateStr}T${item.time || '00:00'}:00`).getTime();
    if (!isFinite(startTs) || startTs <= now) return; // only schedule future events
    const preTs = startTs - 60 * 1000; // 1 minute before
    const entry = {};
    if (preTs > now) {
      entry.pre = setTimeout(() => {
        addNotification({ title: 'Workout reminder', body: `${item.workout || 'Workout'} starts in 1 min`, type: 'reminder' });
        toast.info(`Reminder: ${item.workout || 'Workout'} starts in 1 min`);
        notifyNative('Workout reminder', `${item.workout || 'Workout'} starts in 1 min`);
      }, preTs - now);
    }
    entry.start = setTimeout(() => {
      addNotification({ title: 'Time to workout', body: `${item.workout || 'Workout'} is starting now`, type: 'reminder' });
      setCurrentReminder({ title: item.workout });
      setShowReminderModal(true);
      setClockTick((c) => c + 1);
      notifyNative('Time to workout', `${item.workout || 'Workout'} is starting now`);
    }, Math.max(0, startTs - now));
    scheduleTimersRef.current[item.id] = entry;
  };

  useEffect(() => {
    // Fetch calendar when user/group changes
    fetchCalendarToday();
    fetchProgressHistory();
    fetchCustomWorkouts();
    checkGoogleConnected();
    // Periodic clock tick to refresh ongoing/upcoming status
    const iv = setInterval(() => setClockTick((c) => c + 1), 5000);
    // Poll schedules to capture changes made elsewhere (calendar UI, other tabs)
    const poll = setInterval(() => fetchCalendarToday(), 60000);
    // Refresh when regaining focus or visibility
    const onVis = () => { 
      if (!document.hidden) {
        fetchCalendarToday();
        fetchCustomWorkouts();
      }
    };
    try { document.addEventListener('visibilitychange', onVis); window.addEventListener('focus', onVis); } catch {}
    // Cleanup timers on unmount
    return () => {
      Object.keys(scheduleTimersRef.current).forEach((id) => clearTimers(id));
      clearInterval(iv);
      clearInterval(poll);
      try { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', onVis); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId, selectedTribe]);

  

  // Load sources that fueled your Snatched TCs (who paid to skip)
  useEffect(() => {
    let cancelled = false;
    async function fetchContributors() {
      try {
        const res = await fetch(`/api/wallet/snatched-contributors?groupId=${encodeURIComponent(selectedTribe || '')}`);
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (!cancelled) setSnatchedContributors(Array.isArray(data?.contributors) ? data.contributors : []);
      } catch (_) {
        if (!cancelled) {
          // Graceful fallback demo data
          setSnatchedContributors([
            { id: 'u1', name: 'Alex', amount_tc: 20 },
            { id: 'u2', name: 'Maya', amount_tc: 15 },
            { id: 'u3', name: 'Kenji', amount_tc: 12 },
          ]);
        }
      }
    }
    fetchContributors();
    return () => { cancelled = true; };
  }, [selectedTribe]);


  const loadTribesAndLeaderboard = async () => {
    // Enhanced mock tribe and squad data with progression system
    const mockTribes = [
      { 
        id: '1', 
        name: 'Founders Tribe', 
        description: 'Elite fitness community of founding members',
        group_type: 'tribe',
        members: 15, 
        member_count: 15,
        streak_days: 45, 
        participation_rate: 89.5,
        balance: 1250, 
        pact_balance: 1250,
        rank: 1,
        is_member: true,
        owner_id: user?.id,
        customization_data: { theme_color: 'indigo', logo_url: '/tribe-logos/founders.png' }
      },
      { 
        id: '2', 
        name: 'Elite Warriors', 
        description: 'Premium tribe for dedicated athletes',
        group_type: 'tribe',
        members: 12, 
        member_count: 12,
        streak_days: 38, 
        participation_rate: 92.0,
        balance: 980, 
        pact_balance: 980,
        rank: 2,
        is_member: false,
        owner_id: 'other-user',
        customization_data: { theme_color: 'red', logo_url: '/tribe-logos/warriors.png' }
      },
      { 
        id: '30000000-0000-0000-0000-000000000001', 
        name: 'Morning Legends', 
        description: 'Early bird workout tribe (auto-upgraded from squad)',
        group_type: 'tribe',
        members: 6, 
        member_count: 6,
        streak_days: 32, 
        participation_rate: 85.5,
        balance: 450, 
        pact_balance: 450,
        rank: 3,
        is_member: true,
        owner_id: user?.id,
        upgraded_from_squad: true
      },
      { 
        id: '30000000-0000-0000-0000-000000000002', 
        name: 'Iron Hearts', 
        description: 'Strength training tribe (auto-upgraded)',
        group_type: 'tribe',
        members: 8, 
        member_count: 8,
        streak_days: 28, 
        participation_rate: 78.0,
        balance: 680, 
        pact_balance: 680,
        rank: 4,
        is_member: false,
        owner_id: 'other-user',
        upgraded_from_squad: true
      },
      { 
        id: '30000000-0000-0000-0000-000000000003', 
        name: 'Cardio Crushers', 
        description: 'High-energy cardio squad (ready to upgrade)',
        group_type: 'squad',
        members: 4, 
        member_count: 4,
        streak_days: 25, 
        participation_rate: 88.0,
        balance: 320, 
        pact_balance: 320,
        rank: 5,
        is_member: false,
        owner_id: 'other-user',
        ready_for_upgrade: true
      },
      { 
        id: '30000000-0000-0000-0000-000000000004', 
        name: 'Fitness Rookies', 
        description: 'Beginner-friendly fitness squad',
        group_type: 'squad',
        members: 4, 
        member_count: 4,
        streak_days: 12, 
        participation_rate: 65.0,
        balance: 180, 
        pact_balance: 180,
        rank: 6,
        is_member: false,
        owner_id: 'other-user'
      },
      { 
        id: '3', 
        name: 'Zen Masters', 
        description: 'Mindful fitness and meditation tribe',
        group_type: 'tribe',
        members: 10, 
        member_count: 10,
        streak_days: 35, 
        participation_rate: 75.0,
        balance: 750, 
        pact_balance: 750,
        rank: 7,
        is_member: false,
        owner_id: 'other-user',
        customization_data: { theme_color: 'green', logo_url: '/tribe-logos/zen.png' }
      }
    ];
    
    setTribes(mockTribes.filter(t => t.group_type === 'tribe'));
    setSquads(mockTribes.filter(t => t.group_type === 'squad'));
    setLeaderboard(mockTribes);
  };

  const loadPendingRequests = async () => {
    try {
      // 1) Fetch pact ledger to get spend requests for the active tribe
      const tribeId = selectedTribe;
      const ledgerRes = await fetch(`/api/pact/ledger?tribe_id=${encodeURIComponent(tribeId)}`);
      if (!ledgerRes.ok) {
        setPendingRequests([]);
        return;
      }
      const ledger = await ledgerRes.json();
      // Capture donation pool if available in ledger response
      const pool = ledger?.wallet?.donation_pool_tc ?? ledger?.donation_pool_tc ?? ledger?.donation_pool ?? 0;
      if (!Number.isNaN(Number(pool))) setDonationPool(Number(pool));
      const spendRequests = Array.isArray(ledger?.spend_requests) ? ledger.spend_requests : [];

      // 2) Keep only donation requests that are still pending/requested
      const donationRequests = spendRequests.filter(r => (r.type === 'donation' || r.type === 'DONATION') && (r.status === 'requested' || r.status === 'pending'));

      // 3) For each donation request, fetch vote tallies
      const enriched = await Promise.all(donationRequests.map(async (req) => {
        try {
          const voteRes = await fetch(`/api/pact/vote?request_id=${encodeURIComponent(req.id)}`);
          let approve = 0, reject = 0, totalMembers = 0, status = req.status;
          if (voteRes.ok) {
            const v = await voteRes.json();
            approve = v.approve_count ?? 0;
            reject = v.reject_count ?? 0;
            totalMembers = v.total_members ?? 0;
            status = v.status || req.status;
          }

          return {
            id: req.id,
            type: 'donation',
            label: req.label || 'Donation',
            amount: Number(req.amount_tc) || 0,
            requestedBy: req.created_by || 'Member',
            description: req.gym_name ? `Gym: ${req.gym_name}` : undefined,
            totalMembers,
            status,
            votes: { approve, reject }
          };
        } catch (e) {
          return null;
        }
      }));

      setPendingRequests(enriched.filter(Boolean));
    } catch (error) {
      console.error('Failed to load pending requests:', error);
      setPendingRequests([]);
    }
  };

  // Enhanced handlers with toast notifications
  const handleStartWorkout = () => {
    // Use the scheduled workout (todaySchedule) to start
    const sched = todaySchedule?.schedule;
    const data = sched?.ai_plan || generatePlanFromSchedule(sched);
    setActiveWorkoutData(data);
    setShowWorkoutSession(true);
    toast.success(t('workout_started'));
    // Presence + broadcast
    try {
      addActiveMember(effectiveUserId, effectiveUserName);
      fetch('/api/events/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedTribe || 'default',
          type: 'workout_started',
          originUserId: effectiveUserId,
          data: { originUserName: effectiveUserName }
        })
      });
    } catch (_) {}
  };

  const handleShrinkWorkout = async () => {
    setShowShrinkModal(true);
  };

  const handleShrinkAndStart = (minutes) => {
    // Generate a compressed workout based on user-selected time
    const sched = todaySchedule?.schedule;
    
    // Generate compressed plan
    const compressedPlan = generatePlanFromSchedule(sched, minutes);
    
    setActiveWorkoutData(compressedPlan);
    setShowWorkoutSession(true);
    setShowShrinkModal(false);
    
    toast.success(`🎯 ${minutes}-min compressed workout started!`);
  };

  const handleSkip = async (method) => {
    try {
      // Calculate skip cost: 1 TC for tribes, 2 TC for squads (yen-based: 1 TC = ¥100)
      const skipCost = isSelectedTribe ? 1 : 2;
      
      let response, data;
      if (method === 'pay') {
        response = await fetch('/api/skip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: effectiveUserId || user?.id || '00000000-0000-0000-0000-000000000001',
            method: 'pay',
            tribeId: selectedTribe || '10000000-0000-0000-0000-000000000001'
          })
        });
        data = await response.json();
      } else {
        // Ad path does not call server
        response = { ok: true };
        data = {};
      }
      
      if (response.ok) {
        if (method === 'pay' && data?.balances) {
          setWalletBalance(Number(data.balances.wallet) || 0);
          const newVaultBalance = Number(data.balances.pact) || 0;
          setPactBalance(newVaultBalance);
          
          // Update squads array to keep vault in sync
          setSquads(prev => prev.map(s => 
            s.id === selectedTribe 
              ? { ...s, pact_balance_tc: newVaultBalance, pact_balance: newVaultBalance }
              : s
          ));
          
          // Update snatched balance if we received a split
          if (data.split_results) {
            const myShare = data.split_results.find(r => r.member_id === effectiveUserId);
            if (myShare && myShare.amount_received > 0) {
              setSnatchedBalance(prev => prev + myShare.amount_received);
            }
          }
        }
        setShowSkipModal(false);
        // Remove today's scheduled workout from list to prevent infinite skipping
        try {
          const sid = todaySchedule?.schedule?.id;
          const missedSched = todaySchedule?.schedule;
          if (sid) {
            setCalendarToday((prev) => (Array.isArray(prev) ? prev.filter((w) => w.id !== sid) : prev));
            try { clearTimers(sid); } catch (_) {}
            try {
              const uid = effectiveUserId || devUserId || 'dev_user';
              await fetch(`/api/calendar?user_id=${encodeURIComponent(uid)}&id=${encodeURIComponent(sid)}`, { method: 'DELETE' });
            } catch (_) {}
            setClockTick((c) => c + 1);
          }
          // Record missed workout for later catch-up
          try {
            const uid = effectiveUserId || devUserId || 'dev_user';
            if (missedSched) {
              await fetch('/api/missed', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: uid,
                  id: missedSched.id,
                  date: new Date().toISOString(),
                  title: missedSched.workout || 'Workout',
                  type: missedSched.type || 'general',
                  ai_plan: missedSched.ai_plan || null,
                })
              });
              fetchCreditsData();
            }
          } catch (_) {}
        } catch (_) {}
        
        
        if (method === 'ad') {
          // Track ad skips and check for abuse
          const newAdSkips = adSkipsThisWeek + 1;
          setAdSkipsThisWeek(newAdSkips);
          
          setShowAdVideo(false);
          setAdProgress(0);
          toast.success(t('skip_ad_success'));
          
          // Deal Breaker Alert on 3rd ad skip - TRIGGER REACTIONS
          if (newAdSkips >= 3 && Features.REACTIONS) {
            toast.error(t('deal_breaker_alert', { count: newAdSkips }));
            
            // Auto-trigger reactions panel for tribe members to react
            setReactionTarget(user);
            setShowReactionsPanel(true);
            
            // Show celebration message encouraging reactions
            setTimeout(() => {
              toast.info('📺 Deal Breaker Alert! Tribe members can now send reactions 🔥💪😅');
            }, 1000);
          }
          
          // Send snitch notification with ad count
          sendSnitchNotification(user?.name || 'User', method, newAdSkips);
        } else if (method === 'pay') {
          // Show success message with actual fee from API
          const actualFee = data.fee_tc || (user.group_type === 'tribe' ? 1 : 2);
          toast.success(`Paid ${actualFee} TC to skip workout`);
          
          // Show split info if available
          if (data.split_results && data.split_results.length > 0) {
            const perMember = data.split_results[0]?.amount_received || 0;
            const vaultAmount = Math.round(actualFee * 0.20 * 10) / 10;
            setTimeout(() => {
              toast.info(`💰 Split: ${data.split_results.length} members got ${perMember.toFixed(1)} TC each`);
              toast.info(`🏛️ Vault: +${vaultAmount} TC`);
            }, 500);
          }

          // Streak Shield + Catch-Up Credit
          if (data.streakShield) {
            toast.success('Streak protected by Skip Shield');
          }
          if (Number(data.catchUpCredit) > 0) {
            setCatchUpCredits((c) => c + Number(data.catchUpCredit));
            toast.info('Catch-Up Credit added for this week');
          }
          if (data.streakShield || Number(data.catchUpCredit) > 0) {
            setPerksShieldApplied(!!data.streakShield);
            setPerksCreditsAdded(Number(data.catchUpCredit) || 0);
            setShowSkipPerksModal(true);
          }
          
          // Optional: Allow reactions for paid skips too
          if (Features.REACTIONS && Math.random() > 0.7) { // 30% chance
            setTimeout(() => {
              setReactionTarget(user);
              setShowReactionsPanel(true);
            }, 2000);
          }
          
          // Send snitch notification for payment
          sendSnitchNotification(user?.name || 'User', method);

          // Keep donors list and peers in sync: refresh donors and broadcast SSE
          try {
            await refreshDonors();
          } catch (_) {}
          // No client broadcast; server already broadcasts paid_skip
        }
        
        // Split distribution is handled server-side and pushed via SSE to members
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Skip failed:', error);
      toast.error(t('skip_failed') + ': ' + error.message);
    }
  };

  // Enhanced snitch notification system with ad tracking
  const sendSnitchNotification = async (userName, method, adSkipsThisWeek = 0) => {
    let snitchMessage;
    
    if (method === 'pay') {
      snitchMessage = getRandomSkipMessage(userName);
    } else if (method === 'ad') {
      // Check if user is watching too many ads this week
      const AD_THRESHOLD = (tribeSettings && Number.isFinite(Number(tribeSettings.snitch_ad_threshold))) ? Number(tribeSettings.snitch_ad_threshold) : 3; // Configurable
      
      if (adSkipsThisWeek >= AD_THRESHOLD) {
        // Send special ad abuse notification
        const adAbuseMessages = [
          'ad_addict', 'binge_watcher', 'commercial_break', 
          'ad_marathon', 'screen_time'
        ];
        const randomAdMessage = adAbuseMessages[Math.floor(Math.random() * adAbuseMessages.length)];
        snitchMessage = t(`skip_messages.${randomAdMessage}`, { 
          name: userName, 
          count: adSkipsThisWeek 
        });
        // Broadcast to group
        try {
          await fetch('/api/events/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              groupId: selectedTribe || 'default',
              type: 'snitch',
              originUserId: effectiveUserId,
              data: { originUserName: userName }
            })
          });
        } catch (_) {}
      } else {
        snitchMessage = t('skip_messages.watched_ad', { name: userName });
      }
    }
    
    // Add to local notifications
    const newNotification = {
      id: `snitch-${Date.now()}`,
      title: t('snitch_alert'),
      body: snitchMessage,
      created_at: new Date().toISOString(),
      read: false,
      type: 'snitch'
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast with snitch message
    const toastDuration = adSkipsThisWeek >= 3 ? 7000 : 5000; // longer for ad abuse
    toast.warning(snitchMessage, { duration: toastDuration });
  };

  const handleSharePost = async (caption = 'Just completed my workout! 💪') => {
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          tribeId: '10000000-0000-0000-0000-000000000001',
          caption
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('post_shared_success'));
        // Reload posts
        const postsResponse = await fetch('/api/posts/feed');
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } else {
        toast.error(data.error || t('failed_share_post'));
      }
    } catch (error) {
      console.error('Post share failed:', error);
      toast.error(t('failed_share_post') + ': ' + error.message);
    }
  };

  const handleLikePost = async (postId) => {
    const encouragingMessages = [
      '🔥 Your support fuels the tribe!',
      '💪 Spreading the motivation!',
      '⚡ Like sent - tribe energy rising!',
      '🎯 Positive vibes activated!',
      '🚀 Tribe member encouraged!'
    ];
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes_count: (post.likes_count || 0) + 1, liked: true }
        : post
    ));
    
    const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    toast.success(randomMessage);
  };

  const handleBecomeCoach = async () => {
    const coachMessages = [
      '🏆 Coach application submitted! Time to inspire others!',
      '💪 Ready to lead the tribe! Application processing...',
      '🎯 From member to mentor! Coach journey begins!',
      '⚡ Application sent! Prepare to transform lives!',
      '🚀 Coach mode activated! Tribe leadership awaits!'
    ];
    
    try {
      const response = await fetch('/api/coach/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          name: effectiveUserName,
          tribeId: selectedTribe
        })
      });

      const data = await response.json();
      if (response.ok) {
        const randomMessage = coachMessages[Math.floor(Math.random() * coachMessages.length)];
        toast.success(randomMessage);
        
        // Show delayed celebration
        setTimeout(() => {
          const celebrationMessages = [
            '🎉 Tribe celebrates a new coach!',
            '💫 Leadership skills unlocked!',
            '🌟 Your coaching journey has begun!'
          ];
          toast.success(celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)]);
        }, 1500);
      } else {
        const errorMsg = data.error || t('failed_coach_application');
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Coach application failed:', error);
      const errorMsg = error.message || t('failed_coach_application');
      if (!error.message || error.message === 'Failed to fetch') {
        toast.error('Network error. Please check your connection and try again.');
      } else if (!toast.error.toString().includes(errorMsg)) {
        // Only show toast if we haven't already
        toast.error(errorMsg);
      }
      throw error;
    }
  };

  const handleHireCoach = async (coach) => {
    const hireMessages = [
      `🎯 ${coach.name} is now your coach! Time to level up!`,
      `💪 Welcome to Team ${coach.name}! Let's crush those goals!`,
      `🚀 Coach ${coach.name} locked in! Your transformation begins now!`,
      `⚡ ${coach.name} is ready to guide you to greatness!`,
      `🏆 Perfect match! ${coach.name} will help you dominate!`,
      `🔥 Coach ${coach.name} activated! Prepare for epic gains!`
    ];
    
    try {
      const response = await fetch('/api/coach/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: effectiveUserId,
          coachId: coach.user_id || coach.id,
          priceTc: coach.pricing?.per_session || 15 // Default mid-tier: 15 TC (¥1,500)
        })
      });

      const data = await response.json();

      if (response.ok) {
        const randomMessage = hireMessages[Math.floor(Math.random() * hireMessages.length)];
        toast.success(randomMessage);
        
        // Update wallet balance
        if (data.balances) {
          setWalletBalance(data.balances.wallet);
        }
        
        setSelectedHire(data.hire);
        
        // Add celebration animation
        setTimeout(() => {
          toast.success('🎉 Your tribe is cheering for this amazing decision!');
        }, 2000);
      } else {
        toast.error(data.error || t('failed_hire_coach'));
      }
    } catch (error) {
      console.error('Coach hire failed:', error);
      toast.error(t('failed_hire_coach') + ': ' + error.message);
    }
  };

  const handleRateCoach = async (ratingData) => {
    const ratingMessages = {
      5: ['⭐⭐⭐⭐⭐ Outstanding! Your coach is a legend!', '🌟 Perfect rating! This coach is pure gold!', '🏆 5 stars! Champion-level coaching right here!'],
      4: ['⭐⭐⭐⭐ Excellent work! Great coaching session!', '👏 4 stars! Your coach is doing amazing!', '💫 Solid performance! Keep it up!'],
      3: ['⭐⭐⭐ Good session! Room for growth together!', '👍 3 stars! Decent coaching, building momentum!', '📈 Good foundation! Progress is progress!'],
      2: ['⭐⭐ Thanks for the feedback! Growth opportunity noted!', '🤝 2 stars! Every coach learns and improves!', '💪 Feedback received! Better sessions ahead!'],
      1: ['⭐ Feedback appreciated! Let\'s work together to improve!', '🔄 1 star! Time to level up the coaching game!', '📝 Thanks for honesty! Improvement starts now!']
    };
    
    try {
      const response = await fetch('/api/coach/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });

      if (response.ok) {
        const rating = ratingData.rating || 5;
        const messages = ratingMessages[rating] || ratingMessages[5];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        toast.success(randomMessage);
        
        const coachResponse = await fetch('/api/coach/list');
        const coachData = await coachResponse.json();
        setCoaches(coachData);
        
        // Add tribe reaction for high ratings
        if (rating >= 4) {
          setTimeout(() => {
            toast.success('🎉 Your tribe loves seeing great coaching partnerships!');
          }, 1500);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || t('failed_rate_coach'));
      }
    } catch (error) {
      console.error('Coach rating failed:', error);
      toast.error(t('failed_rate_coach') + ': ' + error.message);
    }
  };

  const handleTipUser = async (tipData) => {
    const tipMessages = [
      `💰 ${tipData.amountTc} TC sent to ${tipData.toUserName || 'tribe member'}! Generosity rocks!`,
      `✨ Tip delivered! ${tipData.toUserName || 'Your friend'} just got ${tipData.amountTc} TC richer!`,
      `🎉 ${tipData.amountTc} TC tip sent! Spreading the wealth like a champion!`,
      `🚀 Tip blast! ${tipData.toUserName || 'Squad member'} received ${tipData.amountTc} TC!`,
      `👏 Amazing! You just made ${tipData.toUserName || 'someone'}'s day with ${tipData.amountTc} TC!`,
      `⚡ Lightning tip! ${tipData.amountTc} TC zapped to ${tipData.toUserName || 'your buddy'}!`
    ];
    
    const celebrationMessages = [
      '🎆 The tribe loves your generous spirit!',
      '💖 Kindness like this makes our community stronger!',
      '🌟 Your generosity is inspiring others!',
      '🔥 This is what tribe unity looks like!'
    ];
    
    try {
      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tipData,
          fromUser: user?.id
        })
      });

      if (response.ok) {
        const randomTipMessage = tipMessages[Math.floor(Math.random() * tipMessages.length)];
        toast.success(randomTipMessage);
        setWalletBalance(prev => prev - tipData.amountTc);
        
        // Add celebration for larger tips
        if (tipData.amountTc >= 100) {
          setTimeout(() => {
            const randomCelebration = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
            toast.success(randomCelebration);
          }, 2000);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || t('failed_send_tip'));
      }
    } catch (error) {
      console.error('Tip failed:', error);
      toast.error(t('failed_send_tip') + ': ' + error.message);
    }
  };

  const handleEquipmentRequest = async (requestData) => {
    const equipmentMessages = [
      `🏋️ Equipment request submitted! Your tribe will decide soon!`,
      `💪 Gear request sent! Let's see what the tribe thinks!`,
      `⚙️ Equipment proposal in the works! Democracy in action!`,
      `🎆 Request submitted! Your tribe has your back!`,
      `🚀 Gear upgrade request launched! Tribe voting begins!`
    ];
    
    try {
      const response = await fetch('/api/pact/spend/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestData,
          userId: user?.id
        })
      });

      if (response.ok) {
        const randomMessage = equipmentMessages[Math.floor(Math.random() * equipmentMessages.length)];
        toast.success(randomMessage);
        loadPendingRequests(); // Refresh pending requests
        
        // Add encouraging follow-up
        setTimeout(() => {
          toast.success('🤝 Your tribe members are reviewing your request!');
        }, 3000);
      } else {
        const error = await response.json();
        toast.error(error.error || t('failed_equipment_request'));
      }
    } catch (error) {
      console.error('Equipment request failed:', error);
      toast.error(t('failed_equipment_request') + ': ' + error.message);
    }
  };

  const handleDonationRequest = async (requestData) => {
    const donationMessages = [
      `💖 Donation proposal submitted! Your tribe's generosity awaits!`,
      `✨ Charitable request sent! Let's make a difference together!`,
      `🌍 Donation request in motion! Tribe unity for good causes!`,
      `🙏 Proposal submitted! Your tribe believes in giving back!`,
      `🎆 Donation request launched! Community impact incoming!`
    ];
    
    try {
      const response = await fetch('/api/pact/spend/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestData,
          userId: user?.id
        })
      });

      if (response.ok) {
        const randomMessage = donationMessages[Math.floor(Math.random() * donationMessages.length)];
        toast.success(randomMessage);
        loadPendingRequests(); // Refresh pending requests
        
        // Add inspiring follow-up
        setTimeout(() => {
          toast.success('🌟 Together we can make a real impact!');
        }, 2500);
      } else {
        const error = await response.json();
        toast.error(error.error || t('failed_donation_request'));
      }
    } catch (error) {
      console.error('Donation request failed:', error);
      toast.error(t('failed_donation_request') + ': ' + error.message);
    }
  };

  // Direct purchase using Deal Vault (snatched) + Wallet TCs
  const handlePurchaseGear = async ({ item, specs, amount_tc, from_snatched, from_wallet }) => {
    try {
      // Guards
      if (from_wallet > walletBalance) {
        toast.error('Insufficient wallet balance');
        return;
      }
      if (from_snatched > snatchedBalance) {
        toast.error('Insufficient Snatched TCs');
        return;
      }

      const response = await fetch('/api/pact/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.slug,
          specs,
          amount_tc,
          from_snatched,
          from_wallet,
          userId: effectiveUserId,
          groupId: selectedTribe || 'default',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const b = data?.balances;
        if (b) {
          typeof b.wallet === 'number' && setWalletBalance(b.wallet);
          typeof b.snatched === 'number' && setSnatchedBalance(b.snatched);
          typeof b.pact === 'number' && setPactBalance(b.pact);
        } else {
          // Fallback to local deduction
          setWalletBalance((prev) => prev - from_wallet);
          setSnatchedBalance((prev) => Math.max(0, prev - from_snatched));
        }

        addNotification({ title: 'Purchase successful', body: `${item.title} −${amount_tc} TC (Snatched ${from_snatched}, Wallet ${from_wallet})`, type: 'purchase' });

        if (item.title === wishlistProgress.currentItem) {
          setWishlistProgress((prev) => {
            const newAmount = Math.min(prev.targetAmount, prev.currentAmount + amount_tc);
            return {
              ...prev,
              currentAmount: newAmount,
              nextNeeded: Math.max(0, prev.targetAmount - newAmount),
            };
          });
        }

        toast.success('✅ Purchase successful!');
        setShowEquipmentCatalog(false);
      } else {
        const error = await response.json().catch(() => ({ error: 'Purchase failed' }));
        toast.error(error.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed: ' + error.message);
    }
  };

  const handleVote = async (requestId, vote) => {
    const voteMessages = {
      approve: [
        '👍 Vote cast! Supporting tribe decisions like a champion!',
        '✅ Approved! Your tribe values your positive voice!',
        '🎆 Yes vote submitted! Democracy in action!',
        '🚀 Approved! Moving the tribe forward together!',
        '✨ Positive vote cast! Building tribe consensus!'
      ],
      reject: [
        '👎 Vote recorded! Sometimes tough decisions are necessary!',
        '❌ Rejected! Your tribe appreciates thoughtful consideration!',
        '🤔 No vote cast! Critical thinking keeps the tribe strong!',
        '🛡️ Rejected! Protecting tribe resources wisely!',
        '⚠️ Careful vote cast! Tribe guardianship matters!'
      ]
    };
    
    const decisionMessages = {
      approved: [
        '🎉 Request APPROVED! Tribe consensus achieved!',
        '🏆 APPROVED! Your tribe has spoken positively!',
        '✅ SUCCESS! Request approved by tribe vote!',
        '🚀 APPROVED! Tribe unity makes it happen!'
      ],
      rejected: [
        '🛡️ Request REJECTED! Tribe protection activated!',
        '❌ REJECTED! Tribe wisdom prevails!',
        '🤔 REJECTED! Thoughtful tribe decision made!',
        '⚠️ REJECTED! Tribe resources protected!'
      ]
    };
    
    try {
      const response = await fetch('/api/pact/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          vote,
          user_id: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setPendingRequests(prev => prev.map(req => {
          if (req.id === requestId) {
            return {
              ...req,
              // Normalize API response to component shape
              votes: {
                approve: data.approve_count ?? req.votes?.approve ?? 0,
                reject: data.reject_count ?? req.votes?.reject ?? 0
              },
              status: data.status
            };
          }
          return req;
        }));
        
        // Show vote confirmation message
        const voteConfirmations = voteMessages[vote] || voteMessages.approve;
        const randomVoteMessage = voteConfirmations[Math.floor(Math.random() * voteConfirmations.length)];
        toast.success(randomVoteMessage);
        
        // If request was approved or rejected, show decision message
        if (data.status === 'approved' || data.status === 'rejected') {
          setTimeout(() => {
            const decisionConfirmations = decisionMessages[data.status] || decisionMessages.approved;
            const randomDecisionMessage = decisionConfirmations[Math.floor(Math.random() * decisionConfirmations.length)];
            toast.success(randomDecisionMessage);
            loadPendingRequests();
          }, 1500);
        }
        
        // Add tribe unity message for close votes
        if (data.approve_count > 0 && data.reject_count > 0) {
          setTimeout(() => {
            toast.success('🤝 Healthy debate makes our tribe stronger!');
          }, 3000);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || t('failed_vote'));
      }
    } catch (error) {
      console.error('Vote failed:', error);
      toast.error(t('failed_vote') + ': ' + error.message);
    }
  };

  // Workout completion celebration with tribe reactions
  const handleWorkoutCompletion = async (workoutData) => {
    const completionMessages = [
      '🔥 Workout CRUSHED! Your tribe is cheering you on!',
      '💪 Beast mode activated! Tribe pride is through the roof!',
      '⚡ Workout dominated! Your tribe feels the energy!',
      '🏆 Champion performance! Tribe motivation is contagious!',
      '🚀 Workout destroyed! Your tribe is inspired by your dedication!',
      '🎯 Target eliminated! Your tribe loves your consistency!',
      '💥 Explosive workout! Your tribe is pumped up!'
    ];

    const tribeReactions = [
      '🎉 Your tribe is doing a virtual victory dance!',
      '👏 Standing ovation from your entire tribe!',
      '🔥 Your tribe is on fire with motivation!',
      '💫 Tribe energy levels just went through the roof!',
      '🌟 Your dedication is lighting up the whole tribe!',
      '⚡ Electric vibes spreading through your tribe!'
    ];

    const randomCompletion = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    toast.success(randomCompletion);

    // Add tribe reaction after a delay
    setTimeout(() => {
      const randomReaction = tribeReactions[Math.floor(Math.random() * tribeReactions.length)];
      toast.success(randomReaction);
    }, 2000);

    // Add TribeCoin reward notification
    setTimeout(() => {
      const coinReward = Math.floor(Math.random() * 50) + 25; // 25-75 TC
      toast.success(`💰 +${coinReward} TC earned! Consistency pays off!`);
      setWalletBalance(prev => prev + coinReward);
    }, 4000);

    // Chance for special tribe milestone message
    if (Math.random() < 0.3) { // 30% chance
      setTimeout(() => {
        const milestoneMessages = [
          '🏅 Tribe fitness streak is building momentum!',
          '📈 Your tribe\'s collective progress is amazing!',
          '🎊 Tribe workout completion rate is soaring!',
          '🔥 Your tribe is becoming unstoppable!'
        ];
        const randomMilestone = milestoneMessages[Math.floor(Math.random() * milestoneMessages.length)];
        toast.success(randomMilestone);
      }, 6000);
    }
  };

  // New member welcome celebration
  const handleNewMemberWelcome = async (memberData) => {
    const welcomeMessages = [
      `🎉 Welcome ${memberData.name} to the tribe! Let's grow stronger together!`,
      `🚀 ${memberData.name} just joined the squad! Tribe power activated!`,
      `⚡ New tribe member ${memberData.name} is ready to dominate!`,
      `🏆 ${memberData.name} joined the family! Tribe unity intensifies!`,
      `🔥 Fresh energy incoming! Welcome ${memberData.name} to the tribe!`,
      `💪 ${memberData.name} is now part of the tribe! Let's achieve greatness!`
    ];

    const tribeGrowthMessages = [
      '📈 Tribe strength just leveled up!',
      '🌟 Our tribe community is expanding!',
      '🎯 More accountability partners = more success!',
      '💫 Tribe synergy is getting stronger!',
      '🔥 The tribe momentum is unstoppable!'
    ];

    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    toast.success(randomWelcome, { duration: 6000 });

    // Add tribe growth message
    setTimeout(() => {
      const randomGrowth = tribeGrowthMessages[Math.floor(Math.random() * tribeGrowthMessages.length)];
      toast.success(randomGrowth);
    }, 3000);

    // Welcome bonus for existing members
    setTimeout(() => {
      const welcomeBonus = 25;
      toast.success(`💰 +${welcomeBonus} TC welcome bonus! Growing the tribe pays off!`);
      setWalletBalance(prev => prev + welcomeBonus);
    }, 5000);
  };

  // Achievement celebration with tribe recognition
  const handleAchievementUnlock = async (achievementData) => {
    const achievementMessages = [
      `🏆 ACHIEVEMENT UNLOCKED: ${achievementData.title}! Your tribe is so proud!`,
      `⭐ ${achievementData.title} achieved! Tribe legend status activated!`,
      `🎯 ${achievementData.title} conquered! Your tribe feels the victory!`,
      `💥 ${achievementData.title} demolished! Tribe inspiration levels maxed!`,
      `🚀 ${achievementData.title} completed! Your tribe is celebrating!`
    ];

    const tribeRecognitionMessages = [
      '👑 Your tribe recognizes your dedication!',
      '🎊 Tribe celebration mode activated!',
      '💫 Your achievement inspires the whole tribe!',
      '🔥 Tribe motivation just went through the roof!',
      '⚡ Your success energizes every tribe member!'
    ];

    const randomAchievement = achievementMessages[Math.floor(Math.random() * achievementMessages.length)];
    toast.success(randomAchievement, { duration: 8000 });

    // Add tribe recognition
    setTimeout(() => {
      const randomRecognition = tribeRecognitionMessages[Math.floor(Math.random() * tribeRecognitionMessages.length)];
      toast.success(randomRecognition);
    }, 3000);

    // Achievement bonus
    setTimeout(() => {
      const achievementBonus = achievementData.reward || 100;
      toast.success(`💎 +${achievementBonus} TC achievement bonus! Excellence rewarded!`);
      setWalletBalance(prev => prev + achievementBonus);
    }, 5000);
  };

  // Squad → Tribe progression handlers
  const handleSquadUpgrade = async (squadId) => {
    try {
      const response = await fetch('/api/squad/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          squadId,
          upgradedBy: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show upgrade celebration
        const upgradedSquad = squads.find(s => s.id === squadId);
        const celebrationMessage = SquadProgression.getUpgradeCelebrationMessage(
          upgradedSquad?.name || 'Your squad', 
          language
        );
        
        toast.success(celebrationMessage, { duration: 8000 });
        
        // Reload data from server to ensure consistency
        await loadDevData();
        await loadInitialData();
        
        setShowSquadUpgradeModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upgrade squad');
      }
    } catch (error) {
      console.error('Squad upgrade failed:', error);
      toast.error('Failed to upgrade squad: ' + error.message);
    }
  };

  const handleJoinSquad = async (squad) => {
    try {
      const isCurrentlyMember = squad.is_member;
      
      if (isCurrentlyMember) {
        // Check if user is owner or admin (only block if these fields are actually set)
        const isOwner = squad.owner_id && squad.owner_id === effectiveUserId;
        const isAdmin = squad.admin_ids && Array.isArray(squad.admin_ids) && squad.admin_ids.includes(effectiveUserId);
        
        if (isOwner || isAdmin) {
          const roleText = isOwner ? 'owner' : 'admin';
          toast.error(`Cannot leave - you are the ${roleText} of ${squad.name}. Transfer ownership or delete the ${squad.group_type === 'tribe' ? 'tribe' : 'squad'} first.`);
          return;
        }
        
        // Leave squad - Update server first
        if (effectiveUserId && squad.id) {
          await devAddToGroup(null, null);
        }
        
        toast.success(`Left ${squad.name}. See you later! 👋`);
        setSelectedTribe('');
        setShowSquadDetailsModal(false);
      } else {
        // Join squad - Update server first
        if (effectiveUserId && squad.id) {
          await devAddToGroup(squad.id, squad.group_type);
        }
        
        toast.success(`Joined ${squad.name}! Welcome to the ${squad.group_type}! 🎉`);
        setSelectedTribe(squad.id);
      }
      
      // Wait a moment for database to save, then reload everything
      await new Promise(resolve => setTimeout(resolve, 200));
      await loadDevData();
      await loadInitialData();
    } catch (error) {
      console.error('Join/Leave failed:', error);
      toast.error('Failed to join/leave: ' + error.message);
    }
  };

  const handleViewSquad = (squad) => {
    setSelectedSquadForDetails(squad);
    setShowSquadDetailsModal(true);
  };

  const handleDeleteSquad = async (squad) => {
    
    const memberCount = squad.member_count || 1;
    const hasOtherMembers = memberCount > 1;
    
    // Different flow if squad has other members
    if (hasOtherMembers) {
      const confirmed = window.confirm(
        `⚠️ Delete ${squad.name}?\n\n` +
        `This squad has ${memberCount} member${memberCount > 1 ? 's' : ''}.\n\n` +
        `All members will receive a notification and have 48 hours to:\n` +
        `📊 Download Squad Resume (proof of commitment)\n` +
        `🌟 Claim Reputation Token (verified credibility)\n` +
        `👥 See member list (invite via @username to new squad)\n` +
        `📈 Save performance stats (track progress)\n\n` +
        `After 48 hours, the squad will be permanently deleted.\n\n` +
        `Continue with deletion notice?`
      );
      
      if (!confirmed) return;
      
      try {
        const res = await fetch('/api/dev/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'initiate_deletion', 
            groupId: squad.id,
            ownerId: effectiveUserId,
            ownerName: effectiveUserName
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          
          // Notify all members via SSE
          if (squad.members && squad.members.length > 1) {
            await fetch('/api/events/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'squad_deletion_notice',
                groupId: squad.id,
                title: '⚠️ Squad Deletion Notice',
                message: `${effectiveUserName} has initiated deletion of ${squad.name}. You have 48 hours before permanent deletion.`,
                data: {
                  squadName: squad.name,
                  ownerName: effectiveUserName,
                  deletionDate: data.deletion_scheduled_at,
                  hoursRemaining: 48
                }
              })
            });
          }
          
          toast.success(
            `🔔 Deletion notice sent to all ${memberCount} members!\n\n` +
            `${squad.name} will be deleted in 48 hours.`,
            { duration: 8000 }
          );
          
          // Reload data
          await loadDevData();
          await loadInitialData();
          
          setShowSquadDetailsModal(false);
        } else {
          const error = await res.json();
          toast.error(error.message || 'Failed to initiate deletion');
        }
      } catch (error) {
        console.error('Delete initiation failed:', error);
        toast.error('Failed to initiate deletion: ' + error.message);
      }
    } else {
      // Only owner, can delete immediately
      const confirmed = window.confirm(
        `⚠️ Delete ${squad.name}?\n\n` +
        `You're the only member. This squad will be deleted immediately and cannot be recovered.\n\n` +
        `Continue?`
      );
      
      if (!confirmed) return;
      
      try {
        const res = await fetch('/api/dev/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'delete_group', 
            groupId: squad.id 
          })
        });
        
        if (res.ok) {
          toast.success(`${squad.name} deleted successfully! 🗑️`);
          
          // Reload data
          await loadDevData();
          await loadInitialData();
          
          setShowSquadDetailsModal(false);
        } else {
          const error = await res.json();
          toast.error(error.message || 'Failed to delete squad');
        }
      } catch (error) {
        console.error('Delete squad failed:', error);
        toast.error('Failed to delete squad: ' + error.message);
      }
    }
  };

  const handleCreateSquad = async (formData) => {
    
    try {
      const res = await fetch('/api/dev/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create_group',
          name: formData.name,
          description: formData.description,
          type: formData.type,
          ownerId: effectiveUserId,
          ownerName: effectiveUserName,
          isPrivate: formData.isPrivate || false
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(
          `${formData.type === 'squad' ? 'Squad' : 'Tribe'} "${formData.name}" created successfully! 🎉`,
          { duration: 5000 }
        );
        
        // Reload data to show new squad
        await loadDevData();
        await loadInitialData();
        
        setShowSquadCreationModal(false);
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to create squad');
      }
    } catch (error) {
      console.error('❌ Creation failed:', error);
      toast.error('Failed to create squad: ' + error.message);
      throw error;
    }
  };

  const handleWorkoutPlanGenerated = (plan) => {
    setGeneratedPlan(plan);
    setShowWorkoutPlan(true);
    toast.success(t('workout_plan_generated'));
  };

  const handleSkipWorkout = (method) => {
    if (method === 'pay') {
      // Use unified Supabase-backed skip route
      handleSkip('pay');
    } else if (method === 'ad') {
      // Open ad modal; completion will call handleSkip('ad')
      setShowAdModal(true);
    }
  };

  const handleWatchAdToSkip = () => {
    setIsWatchingAd(true);
    setAdProgress(0);
    
    const adRewardMessages = [
      '📺 Ad watched! Free skip earned - tribe still judges you! 😏',
      '🎬 Commercial complete! No payment but tribe knows you skipped!',
      '📺 15 seconds of ads = 1 free skip! Tribe gets notification anyway!',
      '🎆 Ad reward unlocked! Skip granted but social pressure remains!'
    ];
    
    // Simulate 15-second ad for workout skip
    const adInterval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(adInterval);
          setIsWatchingAd(false);
          setShowAdModal(false);
          
          const randomMessage = adRewardMessages[Math.floor(Math.random() * adRewardMessages.length)];
          addNotification({ title: 'Ad watched', body: `You watched an ad to skip your workout`, type: 'ad' });
          toast.success(randomMessage);

          // Count the ad toward avatar couch-potato state
          if (effectiveUserId) {
            fetch('/api/avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'ad_watched', userId: effectiveUserId }),
            }).then(() => refreshAvatar()).catch(() => {});
          }

          // Hit unified skip route for 'ad' (no TC movement) and then increment counters/snitch
          try {
            handleSkip('ad');
          } catch (_) {}

          // Increment weekly ad skips and snitch to group if threshold exceeded
          setAdSkipsThisWeek(prev => {
            const next = (prev || 0) + 1;
            const threshold = (tribeSettings && Number.isFinite(Number(tribeSettings.snitch_ad_threshold))) ? Number(tribeSettings.snitch_ad_threshold) : 3;
            if (next > threshold) {
              try {
                const evId = `ev_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
                fetch('/api/events/broadcast', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    groupId: selectedTribe || 'default',
                    type: 'snitch',
                    originUserId: effectiveUserId,
                    data: {
                      eventId: evId,
                      originUserName: user?.name || 'Member'
                    }
                  })
                });
              } catch (_) {}
            }
            return next;
          });

          // Show streak save perk for ad path (20%)
          setPerksShieldApplied(false);
          setPerksCreditsAdded(0);
          setPerksAdSavedPercent(20);
          setShowSkipPerksModal(true);
          
          // No TC changes from ads
          
          setTimeout(() => {
            toast.success('Workout marked as completed! 🏆');
          }, 3000);
          
          return 100;
        }
        return prev + 6.67; // 15 seconds = 100/15 per second
      });
    }, 1000);
  };

  // Local notifications helper (real-time badge updates)
  const addNotification = (n) => {
    setNotifications(prev => [
      {
        id: `${Date.now()}_${Math.floor(Math.random()*1e6)}`,
        read: false,
        created_at: new Date().toISOString(),
        ...n
      },
      ...prev
    ]);
  };

  // Dev/test helpers to simulate peers behavior
  const simulatePeerPaidSkip = () => {
    const skipCost = 10;
    const membersSharePct = 0.8;
    const vaultSharePct = 0.2;
    const received = Math.floor((skipCost * membersSharePct) / 3);
    const vaultShare = parseFloat((skipCost * vaultSharePct).toFixed(1));
    setSnatchedBalance(prev => prev + received);
    setSnatchedContributors(prev => [
      { id: 'peer_' + Math.floor(Math.random()*1000), name: 'Alex', amount_tc: vaultShare },
      ...prev
    ]);
    addNotification({ title: 'Peer paid to skip', body: `You received +${received} Snatched TC`, type: 'snatched' });
    toast.info(`Peer paid to skip → you got +${received} Snatched TC`);
  };

  const simulatePeerWatchedAd = () => {
    addNotification({ title: 'Peer watched ad', body: `Peer watched an ad to skip (no TC change)`, type: 'ad' });
    // Optionally broadcast a snitch event for testing
    try {
      fetch('/api/events/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedTribe || 'default',
          type: 'snitch',
          originUserId: `peer_${Math.floor(Math.random()*1000)}`,
          data: {
            originUserName: 'Alex'
          }
        })
      });
    } catch (_) {}
  };

  // Mark notifications as read when viewing the Notifications tab
  useEffect(() => {
    if (activeTab === 'notifications') {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [activeTab]);

  const updateWishlistProgress = (amount) => {
    setWishlistProgress(prev => {
      const newAmount = prev.currentAmount + amount;
      const isComplete = newAmount >= prev.targetAmount;
      
      if (isComplete) {
        toast.success(`🎉 ${prev.currentItem} fully funded! Ready to purchase!`);
        
        // Move to next item or clear progress
        return {
          currentItem: 'Yoga Mat Premium',
          targetAmount: 120,
          currentAmount: 0,
          nextNeeded: 120
        };
      } else {
        const remaining = prev.targetAmount - newAmount;
        toast.info(`+${amount} TC → ${prev.currentItem} progress! ${remaining} TC remaining 🎯`);
        
        return {
          ...prev,
          currentAmount: newAmount,
          nextNeeded: remaining
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 tribal-pattern">
        <div className="container-narrow pt-6 pb-24 space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          {/* Hero card skeleton */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
            <SkeletonStats count={3} />
          </div>
          <SkeletonList count={3} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center tribal-pattern">
        <div className="max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-tribal rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-50 mb-2">TribeFit</h1>
            <p className="text-surface-400">{t('app_tagline')}</p>
          </div>
          
          {/* Language Selector */}
          <div className="mb-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-50"
            >
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={() => setShowLoginModal(true)}
            variant="primary"
            className="w-full h-12 mb-4 text-base font-bold whitespace-nowrap"
          >
            {t('get_started')}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-surface-500">
              {t('join_thousands')}
            </p>
          </div>
        </div>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    );
  }

  // Main App Render Functions
  const renderHome = () => (
    <div className="space-y-4 animate-fade-in">
      {/* Hero Section */}
      <div className="card aurora">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tribeling && (
              <motion.button whileTap={{ scale: 0.85, scaleY: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} onClick={() => setShowAvatarStudio(true)} className="hover:scale-105 transition-transform" title="Open Avatar Studio">
                <Tribeling
                  mood={tribeling.mood}
                  energy={tribeling.energy}
                  streak={tribeling.streak}
                  stage={tribeling.stage?.id}
                  skin={tribeling.skin}
                  accessory={tribeling.accessory}
                  size={88}
                />
              </motion.button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-surface-50">
                {t('welcome_back', { name: effectiveUserName })}
              </h2>
              <p className="text-surface-300 mt-1">{t('ready_goals')}</p>
            </div>
          </div>
          <div className="text-right">
            <div>
              <div className="text-3xl font-bold number-display text-primary flex items-center gap-2 justify-end">
                <Coins size={24} className="text-accent" />
                {walletBalance}
              </div>
              <div className="text-sm text-surface-400">{t('tribecoins')}</div>
              {snatchedBalance > 0 && (
                <div className="text-xs text-accent font-medium mt-1">
                  <Crosshair size={11} className="inline -mt-0.5" /> +{snatchedBalance.toFixed(1)} Snatched TC
                </div>
              )}
            </div>
            <div className="mt-2">
              <Button
                onClick={() => setShowTopUpModal(true)}
                variant="ghost"
                size="sm"
                className="h-8 px-3 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-primary"
              >
                Top up
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          <button 
            onClick={() => toast.success(`🔥 ${user?.streak || 0} ${t('day_streak')}! ${t('keep_it_up')}!`)}
            className="bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 rounded-xl p-3 transition-all duration-200 border border-accent/30 hover:border-accent/50 hover-elevate min-h-[90px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center space-y-1 w-full">
              <Trophy size={18} className="text-accent flex-shrink-0" />
              <div className="text-center w-full">
                <div className="font-bold text-accent text-sm">{user?.streak || 0}</div>
                <div className="text-xs text-surface-300 leading-tight break-words">{t('day_streak')}</div>
              </div>
            </div>
          </button>
          <button 
            onClick={() => {
              setActiveTab('tribe');
              toast.info(t('viewing_tribe'));
            }}
            className="bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 rounded-xl p-3 transition-all duration-200 border border-primary/30 hover:border-primary/50 hover-elevate min-h-[90px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center space-y-1 w-full">
              <Users size={18} className="text-primary flex-shrink-0" />
              <div className="text-center w-full">
                <div className="font-bold text-primary text-sm">Tribe</div>
                <div className="text-xs text-surface-300 leading-tight break-words">{Features.SQUADS ? 'Squads & Tribes' : 'Community'}</div>
              </div>
            </div>
          </button>
          <button 
            onClick={() => setShowWorkoutCalendar(true)}
            className="bg-gradient-to-br from-success/20 to-success/10 hover:from-success/30 hover:to-success/20 rounded-xl p-3 transition-all duration-200 border border-success/30 hover:border-success/50 hover-elevate min-h-[90px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center space-y-1 w-full">
              <Calendar size={18} className="text-gray-300 flex-shrink-0" />
              <div className="text-center w-full">
                <div className="font-bold text-gray-200 text-sm">Schedule</div>
                <div className="text-xs text-gray-300 leading-tight break-words">{t('schedule')}</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Daily Versus - today's group competition for the TC pot */}
      <DailyVersus groupId={selectedTribe || user?.group_id} userId={effectiveUserId} />

      {/* Power-Ups (Stompers-style items & card packs) */}
      <PowerUps userId={effectiveUserId} onWalletChange={setWalletBalance} />

      {/* Workout Plan */}
      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-surface-50">{t("todays_plan")}</h3>
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 px-2.5 flex items-center gap-1 bg-primary/10 border-primary/30 hover:bg-primary/20 whitespace-nowrap min-w-0"
              onClick={() => setShowMyWorkouts(true)}
            >
              <Dumbbell size={14} className="flex-shrink-0" />
              <span className="text-xs text-primary light:text-blue-600 font-semibold leading-none">{t('my_workouts')}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 px-2.5 flex items-center gap-1 bg-success/10 border-success/30 hover:bg-success/20 whitespace-nowrap min-w-0"
              onClick={() => setShowEnhancedGenerator(true)}
            >
              <Bot size={14} className="text-success light:text-green-600 flex-shrink-0" />
              <span className="text-xs text-success light:text-green-600 font-semibold leading-none">{t('ai_generate')}</span>
            </Button>
          </div>
        </div>
        
        {todaySchedule ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-surface-300 light:text-gray-700">{todaySchedule.schedule?.workout || t('todays_plan')}</span>
              <div className="flex items-center gap-2">
                <span className="text-primary">{String(todaySchedule.schedule?.duration || '45 min')}</span>
              </div>
            </div>
            {todaySchedule.status === 'upcoming' && (
              <div className="text-xs text-surface-400">Starts at {todaySchedule.schedule.time}</div>
            )}

            {todaySchedule.status !== 'completed' && (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={handleStartWorkout}
                  variant="success"
                  className="h-14 flex flex-col items-center justify-center gap-1 text-xs font-semibold"
                >
                  <Play size={18} className="flex-shrink-0" />
                  <span className="leading-tight">Start</span>
                </Button>
                <Button
                  onClick={() => setShowSkipModal(true)}
                  variant="danger"
                  className="h-14 flex flex-col items-center justify-center gap-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white border-red-500"
                >
                  <FastForward size={18} className="flex-shrink-0" />
                  <span className="leading-tight">Skip</span>
                </Button>
                <Button
                  onClick={() => {
                    setShowShrinkModal(true);
                  }}
                  variant="primary"
                  className="h-14 flex flex-col items-center justify-center gap-1 text-xs font-semibold"
                >
                  <Zap size={18} className="flex-shrink-0" />
                  <span className="leading-tight">Shrink</span>
                </Button>
              </div>
            )}

            {todaySchedule.status === 'completed' && (
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
                <CheckCircle size={18} className="text-success" />
                <span className="text-sm text-success font-semibold">Workout Completed!</span>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-sm text-surface-400 light:text-gray-500">
              {t('no_workout_scheduled')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  const renderFeed = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{t('tribe_feed')}</h2>
            <p className="text-surface-300 mt-1">Share your fitness journey with your tribe</p>
          </div>
          <Button
            onClick={() => setShowPostModal(true)}
            variant="primary"
            size="default"
            className="min-w-[100px] h-11 px-4 text-base font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            {t('post')}
          </Button>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-12 card">
          <Camera size={72} className="text-primary mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-surface-100 mb-3">{t('no_posts')}</h3>
          <p className="text-surface-300 mb-8 text-lg">Be the first to share your workout progress!</p>
          <Button
            onClick={() => setShowPostModal(true)}
            variant="primary"
            size="lg"
            className="min-w-[200px] h-12 px-6 text-base font-semibold flex items-center gap-3 whitespace-nowrap"
          >
            <Camera size={20} />
            {t('share_first_workout')}
          </Button>
        </div>
      ) : (
        posts.map((post, index) => (
          <div key={index} className="card hover-elevate animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-14 h-14 bg-gradient-tribal rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{post.user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <div className="text-surface-100 font-bold text-lg">{post.user?.name || 'User'}</div>
                <div className="text-surface-300 text-sm font-medium">{t('time_ago')}</div>
              </div>
            </div>
            
            {post.media_url && (
              <div className="bg-gradient-to-br from-surface-700/50 to-surface-800/50 border border-surface-600/50 rounded-2xl h-56 mb-5 flex items-center justify-center">
                <span className="text-surface-300 text-lg font-medium"><Camera size={16} className="inline -mt-0.5" /> {t('workout_photo')}</span>
              </div>
            )}
            
            <p className="text-surface-200 mb-5 text-base leading-relaxed">{post.caption || t('default_workout_caption')}</p>
            
            <div className="flex items-center justify-between pt-2 border-t border-surface-700/50">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-2 py-2 px-3 rounded-xl transition-all duration-200 hover-elevate min-w-[60px] whitespace-nowrap ${
                    post.liked 
                      ? 'text-red-400 bg-red-400/10 border border-red-400/30' 
                      : 'text-surface-300 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30 border border-surface-600'
                  }`}
                >
                  <Heart size={18} className={post.liked ? 'fill-current' : ''} />
                  <span className="font-medium">{post.likes_count || 0}</span>
                </button>
                <button 
                  onClick={() => handleSharePost(t('sharing_awesome_workout'))}
                  className="flex items-center space-x-2 py-2 px-3 rounded-xl border border-surface-600 text-surface-300 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 hover-elevate min-w-[80px] whitespace-nowrap"
                >
                  <Share size={18} />
                  <span className="font-medium">{t('share')}</span>
                </button>
              </div>
              {Features.TIPS && (
                <Button
                  onClick={() => {
                    setSelectedPost({ ...post, post_id: post.id });
                    setShowTipModal(true);
                  }}
                  variant="accent"
                  size="sm"
                  className="h-9 px-3 flex items-center gap-2 min-w-[80px] whitespace-nowrap"
                >
                  <Coins size={14} />
                  <span className="font-medium text-sm">{t('tip_tc')}</span>
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTribe = () => (
    <div className="space-y-4 animate-fade-in">
      {/* Enhanced Tribe/Squad Header */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-16 h-16 bg-gradient-tribal rounded-full flex items-center justify-center shadow-lg">
            {Features.SQUADS && (squads.length > 0 || tribes.length > 0) ? (
              <div className="flex">
                <Flame size={26} className="text-accent" />
                <FeatherIcon size={26} className="text-primary-300 -ml-1" />
              </div>
            ) : (
              <Trophy size={32} className="text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-surface-50">
              {Features.SQUADS ? 'Squads & Tribes' : t('founders_tribe')}
            </h2>
            <p className="text-surface-300">
              {Features.SQUADS 
                ? `${squads.length} squads • ${tribes.length} tribes` 
                : t('tribe_members_rank', { members: 15, rank: 1 })
              }
            </p>
          </div>
          {/* Removed header View Details button (squad/tribe modal) per request */}
        </div>
        
        {/* Current Group Stats (if member) */}
        {(tribes.some(t => t.is_member) || squads.some(s => s.is_member)) && (
          <div className="grid gap-4 grid-cols-3">
            <div className="text-center p-3 bg-surface-700 rounded-xl border border-surface-600">
              <div className="text-2xl font-bold text-primary number-display">{pactBalance}</div>
              <div className="text-xs text-surface-300 font-medium">Vault TC</div>
            </div>
            <div className="text-center p-3 bg-surface-700 rounded-xl border border-surface-600">
              <div className="text-2xl font-bold text-accent number-display">{user?.streak || 0}</div>
              <div className="text-xs text-surface-300 font-medium">{t('day_streak')}</div>
            </div>
            <div className="text-center p-3 bg-surface-700 rounded-xl border border-surface-600">
              <div className="text-2xl font-bold text-success number-display">{testUsers?.length || 0}</div>
              <div className="text-xs text-surface-300 font-medium">{t('members')}</div>
            </div>
          </div>
        )}

        {/* Governance notice + Catch-Up credits */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-1 gap-3">
          <div className="bg-surface-700 border border-surface-600 rounded-xl p-3 pointer-events-auto">
            <div className="flex items-start justify-between pointer-events-auto">
              <div>
                <div className="text-sm text-surface-300">Catch-Up Credits</div>
                <div className="text-xl font-bold text-surface-50">{catchUpCredits}</div>
              </div>
              <Button 
                type="button" 
                onClick={(e) => {
                  openCreditsModal(e);
                }} 
                variant="ghost" 
                className="h-8 px-3 text-xs pointer-events-auto relative z-10 cursor-pointer"
              >
                View Details
              </Button>
            </div>
            <div className="text-[11px] text-surface-400">Banked for later. Use from Catch-Up Credits to run a 15m compressed plan and clear missed workouts.</div>
          </div>
        </div>

        {modeVote && (
          <div className="mt-2 bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/30 rounded-xl p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-warning font-semibold">Vote in progress</div>
                <div className="text-surface-100 text-sm">
                  Change skip mode to <span className="font-semibold">{modeVote.targetMode === 'tribe_fund' ? 'Tribe Fund' : 'Teammate Boost'}</span>
                </div>
                {modeVoteTotals && (
                  <div className="text-[11px] text-surface-400 mt-1">
                    Yes: {modeVoteTotals.yes} • No: {modeVoteTotals.no} • Required: {modeVoteTotals.required}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => castModeChange(true)} variant="success" className="h-8 px-3 text-xs">Yes</Button>
                <Button onClick={() => castModeChange(false)} variant="danger" className="h-8 px-3 text-xs">No</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tribe Vault Actions - Only show for TRIBES (not squads) */}
      {squads.find(s => s.id === selectedTribe)?.group_type === 'tribe' && (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent flex items-center space-x-2">
            <TrendingUp size={24} className="text-accent" />
            <span>Tribe Vault</span>
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{pactBalance} TC</div>
            <div className="text-xs text-surface-400">Community Fund</div>
          </div>
        </div>
        
        {/* Vault Info */}
        <div className="mb-4 p-3 bg-surface-700 border border-surface-600 rounded-lg">
          <div className="text-sm text-surface-300 light:text-gray-600 space-y-1">
            <div className="flex items-center justify-between">
              <span>💰 Skip Mode:</span>
              <span className="font-semibold text-surface-100 light:text-gray-900">
                {skipMode === 'tribe_fund' ? 'Tribe Fund (100%)' : 'Teammate Boost (80/20)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>👥 Active Members:</span>
              <span className="font-semibold text-surface-100 light:text-gray-900">
                {testUsers?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>🏛️ Vault Usage:</span>
              <span className="font-semibold text-surface-100 light:text-gray-900">
                Community gear & donations
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 items-stretch">
          {/* Priority Wishlist Item (Compact) */}
          <div className="bg-surface-700 border border-surface-600 rounded-xl p-4 flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2">
              <Gift size={18} className="text-accent" />
              <span className="text-surface-50 font-semibold text-sm">Next Goal</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-surface-100 font-medium truncate" title={wishlistProgress.currentItem}>{wishlistProgress.currentItem}</span>
                <span className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 text-accent px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap">{wishlistProgress.targetAmount} TC</span>
              </div>

              {/* Simplified: hide contribution breakdown to keep card focused */}

              <div className="flex items-center justify-between text-xs text-surface-400">
                <span>Progress</span>
                <span className="font-medium">
                  {wishlistProgress.currentAmount}/{wishlistProgress.targetAmount} TC ({Math.round((wishlistProgress.currentAmount / wishlistProgress.targetAmount) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-accent to-accent-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((wishlistProgress.currentAmount / wishlistProgress.targetAmount) * 100, 100)}%` }}
                />
              </div>

              {wishlistProgress.nextNeeded > 0 ? (
                <div className="text-xs text-surface-300 font-medium">Remaining: <span className="text-accent font-bold">+{wishlistProgress.nextNeeded} TC</span></div>
              ) : (
                <div className="text-xs text-success font-semibold">🎉 Ready to purchase!</div>
              )}

              {/* Simplified: hide donors list and dev/test controls to keep card focused */}

              {/* Marketplace CTA */}
              <div className="pt-1">
                <Button
                  onClick={() => setShowEquipmentCatalog(true)}
                  variant="primary"
                  size="sm"
                  className="w-full h-9 px-3 text-xs font-semibold"
                >
                  <Dumbbell size={14} />
                  Spend on Next Gear
                </Button>
              </div>
            </div>
          </div>

          {/* Donate to Gym (compact card, unified style) */}
          <div className="bg-surface-700 border border-surface-600 rounded-xl p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart size={18} className="text-accent" />
                <span className="text-surface-50 font-semibold text-sm">{t('donate_to_gym')}</span>
              </div>
              <p className="text-xs text-surface-400">Support local gym gear</p>
            </div>
            <div className="pt-3">
              <Button
                onClick={() => setShowDonationModal(true)}
                variant="accent"
                size="sm"
                className="w-full h-9"
              >
                <Heart size={14} />
                Donate Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Squads Section (if feature enabled) */}
      {Features.SQUADS && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-surface-50 flex items-center space-x-3">
              <Flame size={26} className="text-accent" />
              <span>Squads</span>
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={() => { const el = document.getElementById('squad-leaderboard'); el?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                variant="ghost"
                className="h-9 px-3 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary flex items-center gap-1"
              >
                <Users size={16} />
                <span className="text-sm font-medium">Join Squad</span>
              </Button>
              <Button
                onClick={() => setShowSquadCreationModal(true)}
                variant="primary"
                className="h-9 px-3 flex items-center gap-1"
              >
                <Plus size={16} />
                <span className="text-sm font-bold">Create</span>
              </Button>
            </div>
          </div>
          
          {/* Separate Tribes and Squads */}
          {(() => {
            const tribes = squads.filter(s => s.group_type === 'tribe' || s.type === 'tribe');
            const onlySquads = squads.filter(s => s.group_type === 'squad' || s.type === 'squad');
            
            return (
              <>
                {/* Tribes Section */}
                {tribes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Crown size={20} className="text-yellow-500" />
                      <h3 className="text-lg font-bold text-surface-50">Tribes</h3>
                      <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500">{tribes.length}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {tribes.map((squad) => (
                        <SquadCard
                          key={squad.id}
                          squad={squad}
                          onJoin={handleJoinSquad}
                          onUpgrade={(squad) => {
                            setSelectedSquadForUpgrade(squad);
                            setShowSquadUpgradeModal(true);
                          }}
                          onView={handleViewSquad}
                          isOwner={squad.is_member && squad.owner_id === effectiveUserId}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Squads Section */}
                {onlySquads.length > 0 && (
                  <div className="space-y-4" id="squad-leaderboard">
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-primary" />
                      <h3 className="text-lg font-bold text-surface-50">Squads</h3>
                      <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">{onlySquads.length}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {onlySquads.map((squad) => (
                        <SquadCard
                          key={squad.id}
                          squad={squad}
                          onJoin={handleJoinSquad}
                          onUpgrade={(squad) => {
                            setSelectedSquadForUpgrade(squad);
                            setShowSquadUpgradeModal(true);
                          }}
                          onView={handleViewSquad}
                          isOwner={squad.is_member && squad.owner_id === effectiveUserId}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Empty State */}
                {tribes.length === 0 && onlySquads.length === 0 && (
                  <div className="text-center py-12 card">
                    <Flame size={72} className="text-accent mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-surface-100 mb-3">No squads yet</h3>
                    <p className="text-surface-300 mb-6">Start your fitness journey with a squad!</p>
                    <Button
                      onClick={() => setShowSquadCreationModal(true)}
                      variant="primary"
                      className="h-12 px-6 text-base font-bold bg-gradient-to-br from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-primary/25"
                    >
                      <Plus size={20} className="mr-2" />
                      Create Your First Squad
                    </Button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}


      {/* Wishlist removed: duplicate and add flow not working. Use Tribe Vault > Buy CTA instead. */}

      {/* Pending Votes */}
      {pendingRequests.length > 0 && (
        <div className="card hover-elevate animate-fade-in">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Vote size={16} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-surface-50">{t('pending_votes')}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                  {Math.round(donationPool)} TC
                </span>
                <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                  {pendingRequests.length}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowDonationModal(true)}
                variant="accent"
                size="sm"
                className="h-8 px-3 text-xs bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 transition-all duration-200"
              >
                <Gift size={12} className="mr-1" />
                Propose
              </Button>
              <Button
                onClick={() => setShowVotingModal(true)}
                variant="primary"
                size="sm"
                className="h-8 px-3 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-all duration-200"
              >
                <Vote size={12} className="mr-1" />
                Vote
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {pendingRequests.slice(0, 2).map((request) => (
              <div key={request.id} className="bg-gradient-to-br from-surface-700/50 to-surface-800/50 border border-surface-600/50 rounded-xl p-4 hover-elevate transition-all duration-200">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-surface-100 text-sm truncate">{request.label}</h4>
                        <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                          request.type === 'gear' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-accent/20 text-accent'
                        }`}>
                          {request.type}
                        </span>
                      </div>
                      <p className="text-xs text-surface-400">
                        <span className="font-medium text-surface-300">{request.amount} TC</span> • {request.requestedBy}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="text-xs text-surface-400 flex-shrink-0">
                        <span className="font-medium text-surface-300">{request.votes.approve}</span>/{Math.ceil(request.totalMembers / 2)}
                      </div>
                      <div className="flex-1 bg-surface-600/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-success to-green-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (request.votes.approve / Math.ceil(request.totalMembers / 2)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleVote(request.id, 'approve')}
                        variant="success"
                        size="sm"
                        className="h-7 px-2 text-xs bg-success/20 hover:bg-success/30 text-success border border-success/30 transition-all duration-200"
                      >
                        <CheckCircle size={10} className="mr-1" />
                        ✓
                      </Button>
                      <Button
                        onClick={() => handleVote(request.id, 'reject')}
                        variant="danger"
                        size="sm"
                        className="h-7 px-2 text-xs bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30 transition-all duration-200"
                      >
                        <XCircle size={10} className="mr-1" />
                        ✗
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Leaderboard with Squad/Tribe separation - ALWAYS SHOW */}
      <SquadLeaderboards
        squads={squads}
        tribes={tribes}
        onSquadClick={handleViewSquad}
        onJoinSquad={handleJoinSquad}
        user={user}
      />
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="card">
        <div className="text-center py-12">
          <Award size={56} className="text-success mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-surface-50 mb-3">
            {t('coaches')}
          </h2>
          <p className="text-surface-400 light:text-gray-600 mb-6 max-w-xl mx-auto">
            Get personalized training from certified coaches or become one yourself!
          </p>
          <Button
            onClick={() => setShowCoachMarketplace(true)}
            variant="success"
            size="lg"
            className="min-w-[240px] h-14"
          >
            <Award size={20} className="mr-2" />
            Open Coach Marketplace
          </Button>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <motion.button whileTap={{ scale: 0.85, scaleY: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} onClick={() => setShowAvatarStudio(true)} className="relative hover:scale-105 transition-transform" title="Open Avatar Studio">
            {tribeling ? (
              <Tribeling
                mood={tribeling.mood}
                energy={tribeling.energy}
                streak={tribeling.streak}
                stage={tribeling.stage?.id}
                skin={tribeling.skin}
                accessory={tribeling.accessory}
                size={100}
                showLabel={false}
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-tribal rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">{effectiveUserName?.charAt(0) || 'A'}</span>
              </div>
            )}
            {tribeling?.stage && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary-300 whitespace-nowrap">
                {tribeling.stage.name}
              </span>
            )}
          </motion.button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-surface-50">{effectiveUserName}</h2>
            <p className="text-surface-300">{user?.email || `${effectiveUserId}@tribefit.app`}</p>
            {devUserId && devUserId !== user?.id && (
              <div className="text-xs text-warning light:text-yellow-600 mt-1">
                Dev Mode: {effectiveUserId}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 bg-primary/10 border-primary/30 hover:bg-primary/20 whitespace-nowrap"
                onClick={() => setShowAvatarStudio(true)}
              >
                <Sparkles size={16} className="text-primary mr-1" />
                <span className="text-primary text-sm">Avatar</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 bg-surface-700/50 border-surface-600 hover:bg-surface-700 whitespace-nowrap"
                onClick={() => setShowProfileCustomization(true)}
              >
                <Settings size={16} className="text-surface-300 mr-1" />
                <span className="text-surface-200 text-sm">{t('customize')}</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="mb-4 p-3 bg-surface-700 border border-surface-600 rounded-xl">
          <StatusBadgeWithProgress 
            streak={user?.streak || 0} 
            totalWorkouts={user?.total_workouts || 0} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-700 border border-surface-600 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary number-display">{walletBalance}</div>
            <div className="text-surface-300 text-sm font-medium">{t('tribecoins')}</div>
          </div>
          <div className="bg-surface-700 border border-surface-600 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent number-display">{user?.streak || 0}</div>
            <div className="text-surface-300 text-sm font-medium">{t('day_streak')}</div>
          </div>
        </div>
      </div>

      {/* Theme & Language Settings */}
      <div className="card">
        <h3 className="text-xl font-bold text-surface-50 mb-4">Settings</h3>
        
        {/* Dark/Light Mode Toggle */}
        <div className="flex items-center justify-between mb-4 p-4 bg-surface-700 border border-surface-600 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              {isDarkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-accent" />}
            </div>
            <div>
              <div className="text-surface-50 text-sm font-bold">Theme</div>
              <div className="text-surface-300 text-xs">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</div>
            </div>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 shadow-md ${
              isDarkMode ? 'bg-primary shadow-primary/25' : 'bg-accent shadow-accent/25'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="card">
        <h3 className="text-xl font-bold text-surface-50 mb-4">{t('language')}</h3>
        <div className="grid grid-cols-3 gap-3">
          {availableLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-4 rounded-xl border text-center transition-all hover-elevate min-h-[80px] flex flex-col items-center justify-center ${
                language === lang.code
                  ? 'border-primary bg-primary/20 text-primary shadow-lg'
                  : 'border-surface-600 bg-surface-700 text-surface-300 hover:border-surface-500 hover:bg-surface-600'
              }`}
            >
              <div className="text-2xl mb-2">{lang.flag}</div>
              <div className="text-xs font-medium whitespace-nowrap">{lang.name}</div>
            </button>
          ))}
        </div>
      </div>

      <Button 
        onClick={logout}
        variant="danger"
        size="default"
        className="w-full h-12 flex items-center justify-center gap-2 whitespace-nowrap text-base font-semibold"
      >
        <LogOut size={18} />
        {t('sign_out')}
      </Button>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="card">
        <h2 className="text-2xl font-bold text-surface-50 flex items-center space-x-3">
          <Bell size={28} className="text-primary" />
          <span>{t('notifications')}</span>
        </h2>
        <p className="text-surface-300 mt-2">Stay updated with your tribe's activities</p>
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12 card">
          <Bell size={72} className="text-primary mx-auto mb-6" />
          <h3 className="text-xl font-bold text-surface-100 mb-3">{t('no_notifications')}</h3>
          <p className="text-surface-300 text-lg">{t('stay_active_message')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const isReactable = notification.type === 'paid_skip' || notification.type === 'snitch';
            const rid = notification.id;
            return (
              <div key={notification.id} className={`card ${notification.type === 'snitch' ? 'border-l-4 border-l-warning' : ''} relative`}>
                {reactionBurst && reactionBurst.id === rid && (
                  <div className="absolute -top-2 right-2 pointer-events-none">
                    <div className="animate-bounce drop-shadow"><ReactionGlyph emoji={reactionBurst.emoji} size={24} /></div>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-surface-100">{notification.title}</h3>
                    <p className="text-surface-300 text-base mt-2 leading-relaxed">{notification.body}</p>
                    <div className="bg-surface-700 text-surface-300 text-sm mt-3 px-3 py-1 rounded-lg inline-block">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </div>
                    {isReactable && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {defaultReactions.map((emoji) => {
                          const stat = (notifReactions?.[rid]?.[emoji]) || { count: 0, my: false };
                          return (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(rid, emoji)}
                              className={`px-2 py-1 text-xs rounded-full border transition-colors transition-transform duration-150 active:scale-90 hover:scale-105 flex items-center gap-1 ${stat.my ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-surface-700 border-surface-600 text-surface-300 hover:bg-surface-600'}`}
                            >
                              <ReactionGlyph emoji={emoji} size={14} />
                              {stat.count > 0 && <span className="font-medium">{stat.count}</span>}
                            </button>
                          );
                        })}
                        <Button size="xs" variant="ghost" className="h-7 px-2 text-[11px] border border-surface-700" onClick={() => setShowEmojiPickerFor(rid)}>
                          + Reaction
                        </Button>
                      </div>
                    )}
                    {showEmojiPickerFor === rid && (
                      <div className="mt-2 p-2 rounded-lg border border-surface-600 bg-surface-700 flex items-center gap-2 flex-wrap">
                        {['👏','🙄','🤡','🤖','💪','🧠','😡','🥶','😅','🪶'].map((e) => (
                          <button key={e} onClick={() => { toggleReaction(rid, e); setShowEmojiPickerFor(null); }} className="px-2 py-1.5 rounded border border-surface-600 hover:bg-surface-600 flex items-center">
                            <ReactionGlyph emoji={e} size={16} />
                          </button>
                        ))}
                        <Button size="xs" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => setShowEmojiPickerFor(null)}>Close</Button>
                      </div>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg ml-4 flex-shrink-0"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProgress = () => {
    // Simple analytics
    const totalSecs = progressHistory.reduce((s, p) => s + (Number(p.duration_sec) || 0), 0);
    const totalMins = Math.round(totalSecs / 60);
    const workouts = progressHistory.length;
    // Workouts this week (last 7 days)
    const now = Date.now();
    const weekCount = progressHistory.filter(p => (now - new Date(p.date).getTime()) <= 7*24*60*60*1000).length;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card">
          <h3 className="text-xl font-bold text-surface-50">Progress</h3>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-surface-700 rounded-xl border border-surface-600">
              <div className="text-2xl font-bold text-primary number-display">{workouts}</div>
              <div className="text-xs text-surface-300 font-medium">Workouts</div>
            </div>
            <div className="text-center p-3 bg-surface-700 rounded-xl border border-surface-600">
              <div className="text-2xl font-bold text-success number-display">{totalMins}</div>
              <div className="text-xs text-surface-300 font-medium">Total minutes</div>
            </div>
            <div className="text-center p-3 bg-surface-700 rounded-xl border border-surface-600">
              <div className="text-2xl font-bold text-accent number-display">{weekCount}</div>
              <div className="text-xs text-surface-300 font-medium">This week</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-lg font-bold text-surface-100 mb-3">Recent Sessions</h4>
          <div className="space-y-2">
            {progressHistory.length === 0 && (
              <div className="text-surface-400 text-sm">No sessions yet. Start a workout to track progress.</div>
            )}
            {progressHistory.map((p) => {
              const ACT_ICONS = {
                workout: Dumbbell, run_outdoor: Footprints, run_treadmill: MonitorPlay,
                walk: Footprints, cycle: Bike, sports: Trophy, swim: Waves, other: Zap,
              };
              const ActIcon = ACT_ICONS[p.type] || Dumbbell;
              return (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-700 border border-surface-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <ActIcon size={15} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-surface-100">{p.title || 'Workout'}</div>
                    <div className="text-xs text-surface-400">{new Date(p.date).toLocaleString()}{p.type && p.type !== 'workout' ? ` · ${p.type.replace(/_/g, ' ')}` : ''}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-surface-200">{Math.round((Number(p.duration_sec)||0)/60)} min</div>
                  <div className="text-xs text-surface-500">{p.completed_sets} sets</div>
                </div>
              </div>
            );})}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="max-w-md mx-auto bg-surface-950 min-h-screen shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700 bg-surface-900">
          <button onClick={handleLogoTap} className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-tribal rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-surface-50">TribeFit</h1>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2 hover:bg-surface-800 rounded-xl transition-colors relative"
          >
            <Bell size={20} className="text-surface-400" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-soft">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Main Content — spring slide between tabs */}
        <div className="px-4 py-5 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            >
              {activeTab === 'home' && renderHome()}
              {activeTab === 'feed' && renderFeed()}
              {activeTab === 'tribe' && renderTribe()}
              {activeTab === 'coach' && renderCoach()}
              {activeTab === 'progress' && renderProgress()}
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'notifications' && renderNotifications()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-700 safe-area-pb">
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-6 gap-0 p-2">
              {[
                { id: 'home', icon: Home, label: t('home') },
                { id: 'feed', icon: Rss, label: t('feed') },
                { id: 'tribe', icon: Users, label: Features.SQUADS ? 'Groups' : t('tribe') },
                { id: 'coach', icon: Dumbbell, label: t('coach') },
                { id: 'progress', icon: TrendingUp, label: 'Progress' },
                { id: 'profile', icon: User, label: t('profile') }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 relative min-h-[56px] ${
                    activeTab === id 
                      ? 'text-primary' 
                      : 'text-surface-400 hover:text-surface-200'
                  }`}
                >
                  {activeTab === id && (
                    <div className="absolute inset-0 bg-surface-800 border border-primary/30 rounded-xl" />
                  )}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                    <Icon size={20} className={`${activeTab === id ? 'text-primary' : ''} flex-shrink-0 mb-1`} />
                    <span className={`text-xs font-medium leading-tight text-center break-words max-w-full ${
                      activeTab === id ? 'text-primary' : 'text-surface-400'
                    }`}>{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Reminder Decision Modal */}
      <Modal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} title="Workout Reminder">
        <div className="space-y-3">
          <div className="text-surface-200 text-sm">It's time for: <span className="font-semibold">{currentReminder?.title || 'Workout'}</span></div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => { setShowReminderModal(false); handleStartWorkout(); }} variant="primary" className="h-10">Start now</Button>
            <Button onClick={() => { setShowReminderModal(false); handleShrinkWorkout(); }} variant="ghost" className="h-10">Shrink</Button>
            <Button onClick={() => { setShowReminderModal(false); handleSkip('ad'); }} variant="accent" className="h-10">Watch Ad to Skip</Button>
            <Button onClick={() => { setShowReminderModal(false); handleSkip('pay'); }} variant="danger" className="h-10">Pay to Skip</Button>
          </div>
          {/* Removed immediate use of credits from reminder. Credits are banked for later use via Catch-Up Credits modal. */}
        </div>
      </Modal>
      {/* Skip Modal */}
      {showSkipModal && (() => {
        const skipCost = isSelectedTribe ? 1 : 2; // 1 TC (¥100) for tribes, 2 TC (¥200) for squads
        const skipYen = skipCost * 100;
        
        return (
        <Modal isOpen={showSkipModal} onClose={() => setShowSkipModal(false)} title={t('skip_workout_question')}>
          <p className="text-surface-400 mb-6">{t('choose_skip_method')}</p>
          
          {/* Ad watch warning */}
          {adSkipsThisWeek >= 2 && (
            <div className="bg-warning/20 border border-warning/30 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-warning">⚠️</span>
                <p className="text-warning text-sm">
                  {adSkipsThisWeek === 2 ? 
                    "You've watched 2 ads this week. One more and your tribe gets notified!" :
                    `You've watched ${adSkipsThisWeek} ads this week! Your tribe will be notified of excessive ad watching.`
                  }
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button
              onClick={() => handleSkip('pay')}
              variant="accent"
              className="w-full"
            >
              Pay {skipCost} TC to Skip
            </Button>
            <Button
              onClick={startAdWatch}
              variant="primary"
              className="w-full"
            >
              {t('watch_ad_skip')} {adSkipsThisWeek > 0 && `(${adSkipsThisWeek} this week)`}
            </Button>
            <Button
              onClick={() => setShowSkipModal(false)}
              variant="ghost"
              className="w-full"
            >
              {t('cancel')}
            </Button>
          </div>
        </Modal>
        );
      })()}

      {/* Ad Video Modal */}
      {showAdVideo && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="w-64 h-36 bg-surface-800 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-lg">📺 {t('ad_playing')}</span>
            </div>
            <div className="w-64 bg-surface-700 rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-150" 
                style={{ width: `${adProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-surface-400">
              {t('ad_will_finish')} {Math.ceil((100 - adProgress) / 5 * 0.15)} {t('seconds')}
            </p>
          </div>
        </div>
      )}

      {/* Post Creation Modal */}
      {showPostModal && (
        <Modal 
          isOpen={showPostModal} 
          onClose={() => {
            setShowPostModal(false);
            setPostCaption('');
          }}
          title={t('create_post')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-2">
                {t('whats_happening')}
              </label>
              <textarea
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder={t('share_workout_placeholder')}
                rows={4}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setShowPostModal(false);
                  setPostCaption('');
                }}
                variant="ghost"
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => {
                  if (postCaption.trim()) {
                    handleSharePost(postCaption.trim());
                    setShowPostModal(false);
                    setPostCaption('');
                  }
                }}
                disabled={!postCaption.trim()}
                variant="primary"
                className="flex-1"
              >
                {t('share_post')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* All other modals */}
      <WorkoutGenerator
        isOpen={showWorkoutGenerator}
        onClose={() => setShowWorkoutGenerator(false)}
        onPlanGenerated={handleWorkoutPlanGenerated}
      />

      <WorkoutPlanModal
        isOpen={showWorkoutPlan}
        onClose={() => setShowWorkoutPlan(false)}
        plan={generatedPlan}
        onSaveToCalendar={async (plan) => {
          try {
            const uid = effectiveUserId || devUserId || 'dev_user';
            const now = new Date();
            // Local date string (avoid UTC off-by-one)
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            // Round to next 15 minutes (local)
            const mins = now.getMinutes();
            const next = new Date(now);
            next.setMinutes(mins + (15 - (mins % 15 || 15)), 0, 0);
            const hh = String(next.getHours()).padStart(2, '0');
            const mm = String(next.getMinutes()).padStart(2, '0');
            const title = plan?.workoutPlan?.title || plan?.workoutPlan?.goals || 'AI Workout';
            const res = await fetch('/api/calendar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: dateStr,
                time: `${hh}:${mm}`,
                workout_name: String(title),
                workout_type: 'ai-generated',
                user_id: uid,
                user_name: user?.name || 'You',
                shared: false,
                duration: `${plan?.workoutPlan?.duration || 45} min`,
                ai_plan: plan
              })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'save failed');
            toast.success('Saved to calendar');
            // Refresh calendar and force UI update
            await fetchCalendarToday();
            setClockTick(c => c + 1); // Force todaySchedule memo to recalculate
          } catch (e) {
            toast.error('Failed to save to calendar');
          }
        }}
      />

      <WorkoutSession
        isOpen={showWorkoutSession}
        onClose={() => setShowWorkoutSession(false)}
        workoutData={activeWorkoutData || generatedPlan}
        userId={effectiveUserId || devUserId || 'dev_user'}
        groupId={selectedTribe || 'default'}
        userName={effectiveUserName}
      />

      <ShrinkWorkoutModal
        isOpen={showShrinkModal}
        onClose={() => setShowShrinkModal(false)}
        onShrink={handleShrinkAndStart}
      />

      <WorkoutCalendar
        isOpen={showWorkoutCalendar}
        onClose={() => setShowWorkoutCalendar(false)}
        user={user}
        userId={effectiveUserId || devUserId || 'dev_user'}
        onChanged={fetchCalendarToday}
        customWorkouts={customWorkouts}
      />

      <CalendarConnectModal
        isOpen={showCalendarConnect}
        onClose={() => setShowCalendarConnect(false)}
        userId={effectiveUserId || devUserId || 'dev_user'}
        onImported={fetchCalendarToday}
        onOpenSettings={() => { setShowCalendarConnect(false); openCalendarSettings(); }}
      />

      <AvatarStudio
        isOpen={showAvatarStudio}
        onClose={() => { setShowAvatarStudio(false); refreshAvatar(); }}
        userId={effectiveUserId}
        onWalletChange={setWalletBalance}
      />

      <ProfileCustomization
        isOpen={showProfileCustomization}
        onClose={() => setShowProfileCustomization(false)}
      />

      <EquipmentCatalog
        isOpen={showEquipmentCatalog}
        onClose={() => setShowEquipmentCatalog(false)}
        onSubmitRequest={handleEquipmentRequest}
        onPurchase={handlePurchaseGear}
        availableSnatchedTc={snatchedBalance}
        walletBalance={walletBalance}
        highlightTitle={wishlistProgress.currentItem}
        prefillAmount={wishlistProgress.nextNeeded}
        autoSelectHighlight={true}
        wishlistTarget={wishlistProgress.targetAmount}
        wishlistCurrent={wishlistProgress.currentAmount}
      />

      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSubmitRequest={handleDonationRequest}
      />

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onCreateCheckout={handleCreateTopUpCheckout}
      />

      <CoachRating
        isOpen={showCoachRating}
        onClose={() => setShowCoachRating(false)}
        coach={selectedCoach}
        hire={selectedHire}
        onSubmitRating={handleRateCoach}
      />

      <CoachMarketplace
        isOpen={showCoachMarketplace}
        onClose={() => setShowCoachMarketplace(false)}
        userId={effectiveUserId}
        userName={effectiveUserName}
        userTribeId={selectedTribe}
        userStreak={user?.streak || 0}
        userTotalWorkouts={user?.total_workouts || 0}
        isInTribe={isSelectedTribe}
        onHireCoach={handleHireCoach}
        onBecomeCoach={handleBecomeCoach}
        walletBalance={walletBalance}
      />

      {Features.TIPS && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          recipient={selectedPost}
          onSubmitTip={handleTipUser}
        />
      )}

      <VotingModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        pendingRequests={pendingRequests}
        onVote={handleVote}
      />

      <ReactionsPanel
        isOpen={showReactionsPanel}
        onClose={() => setShowReactionsPanel(false)}
        targetUser={reactionTarget}
        tribeId={selectedTribe || '10000000-0000-0000-0000-000000000001'}
        currentUser={user}
        onReactionSent={(reaction) => {
          // Optionally update UI or show notification
        }}
      />

      {/* Squad Upgrade Modal */}
      <SquadUpgradeModal
        isOpen={showSquadUpgradeModal}
        onClose={() => setShowSquadUpgradeModal(false)}
        squad={selectedSquadForUpgrade}
        onConfirmUpgrade={handleSquadUpgrade}
      />

      {/* Squad Creation Modal */}
      <SquadCreationModal
        isOpen={showSquadCreationModal}
        onClose={() => setShowSquadCreationModal(false)}
        onCreateSquad={handleCreateSquad}
      />

      {/* Squad Details Modal */}
      <SquadDetailsModal
        isOpen={showSquadDetailsModal}
        onClose={() => setShowSquadDetailsModal(false)}
        squad={selectedSquadForDetails}
        user={{ ...user, id: effectiveUserId }} // Use effectiveUserId for dev controls
        onJoin={handleJoinSquad}
        onDeleteSquad={handleDeleteSquad}
        onUpgrade={(squad) => {
          setSelectedSquadForUpgrade(squad);
          setShowSquadUpgradeModal(true);
        }}
        skipMode={skipMode}
        onOpenTribeSettings={openTribeSettings}
        allUsers={testUsers}
      />

      {/* Group Settings Modal */}
      <GroupSettingsModal
        isOpen={showTribeSettings}
        onClose={() => setShowTribeSettings(false)}
        groupType={user?.group_type || 'tribe'}
        settings={{
          ...tribeSettings,
          skip_mode: skipMode
        }}
        onSave={saveTribeSettings}
        canEdit={true}
      />

      {/* Propose Mode Change Modal */}
      <Modal isOpen={showModeChangeModal} onClose={() => setShowModeChangeModal(false)} title="Propose Skip Mode Change">
        <div className="space-y-3">
          <div className="text-sm text-surface-300">Current: <span className="font-semibold text-surface-50">{skipMode === 'tribe_fund' ? 'Tribe Fund' : 'Teammate Boost'}</span></div>
          <div>
            <label className="text-sm text-surface-300 block mb-1">Target Mode</label>
            <select
              value={modeTarget}
              onChange={(e) => setModeTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-800 text-surface-50"
            >
              <option value="teammate_boost">Teammate Boost (80% active, 20% Tvault)</option>
              <option value="tribe_fund">Tribe Fund (100% Tvault)</option>
            </select>
          </div>
          <div className="text-[11px] text-surface-400">
            A vote among active members will run for up to 72 hours or until a majority approves.
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowModeChangeModal(false)} variant="ghost" className="h-10 flex-1">Cancel</Button>
            <Button onClick={confirmProposeMode} variant="primary" className="h-10 flex-1">Start Vote</Button>
          </div>
        </div>
      </Modal>

      {/* Catch-Up Credits Modal */}
      <Modal isOpen={showCreditsModal} onClose={() => setShowCreditsModal(false)} title="Catch-Up Credits">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-surface-300">Available</div>
            <div className="text-base font-semibold text-surface-50">{catchUpCredits}</div>
          </div>
          <div className="text-[11px] text-surface-400">Credits expire at the end of this calendar week.</div>
          {creditsLoading ? (
            <div suppressHydrationWarning className="text-surface-400 text-sm">Loading...</div>
          ) : (
            <>
              {missedWorkouts.length === 0 ? (
                <div className="text-surface-400 text-sm">No missed workouts recorded.</div>
              ) : (
                <div className="space-y-2">
                  {missedWorkouts.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded border border-surface-600 bg-surface-700">
                      <div>
                        <div className="text-surface-100 text-sm">{m.title || 'Workout'}</div>
                        <div className="text-[11px] text-surface-500">{new Date(m.date).toLocaleString()}</div>
                      </div>
                      <Button size="xs" variant="primary" disabled={(catchUpCredits || 0) <= 0} onClick={() => useCreditOnMissed(m)} className="h-7 px-2 text-[11px]">
                        {(catchUpCredits || 0) > 0 ? 'Use Credit' : 'No Credits'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="flex gap-2">
            <Button onClick={() => setShowCreditsModal(false)} variant="ghost" className="h-9 flex-1">Close</Button>
            <Button onClick={useCreditNow} disabled={(catchUpCredits || 0) <= 0} variant="success" className="h-9 flex-1">Start 15m Catch-Up</Button>
          </div>
        </div>
      </Modal>

      {/* My Workouts Manager */}
      <MyWorkoutsManager
        isOpen={showMyWorkouts}
        onClose={() => {
          setShowMyWorkouts(false);
          fetchCustomWorkouts(); // Reload workouts after closing
        }}
        userId={effectiveUserId || devUserId || 'dev_user'}
        onSelectWorkout={(workout) => {
          setActiveWorkoutData(workout);
          setShowWorkoutSession(true);
        }}
      />

      {/* Enhanced AI Workout Generator */}
      <EnhancedWorkoutGenerator
        isOpen={showEnhancedGenerator}
        onClose={() => setShowEnhancedGenerator(false)}
        userId={effectiveUserId || devUserId || 'dev_user'}
        workoutHistory={progressHistory}
        onGenerate={(workout) => {
          setActiveWorkoutData(workout);
          setShowWorkoutSession(true);
        }}
      />

      {/* Removed duplicate overlay modals for Skip/Ad viewing in favor of unified Modal + showAdVideo flow */}

      {/* Developer Controls - activated by 5-tap on logo */}
      {devMode && (
        <DevControls
          user={{
            id: effectiveUserId,
            name: effectiveUserName,
            streak: user?.streak || 0,
            total_workouts: user?.total_workouts || 0,
            wallet_balance_tc: walletBalance,
            snatched_balance_tc: snatchedBalance,
            group_id: selectedTribe,
            group_type: user?.group_type
          }}
          onCreateUser={devCreateUser}
          onSwitchUser={devSwitchUser}
          onUpdateStats={devUpdateStats}
          onUpdateSquadStats={devUpdateSquadStats}
          onAddToGroup={devAddToGroup}
          onTriggerSkip={devTriggerSkip}
          onTriggerSnatch={devTriggerSnatch}
          onAddBalance={devAddBalance}
          onAddProgress={devAddProgress}
          onRefreshData={() => {
            loadInitialData();
            fetchProgressHistory();
            loadDevData();
            refreshAvatar();
          }}
          testUsers={testUsers}
          groups={testGroups}
          squads={squads}
        />
      )}
    </div>
  );
}

// Wrap with providers
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('tribefit_theme');
      if (stored === 'dark' || stored === 'light') {
        return stored === 'dark';
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  });

  // Sync theme to <html> class and persist
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
        root.classList.remove('light');
        localStorage.setItem('tribefit_theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        localStorage.setItem('tribefit_theme', 'light');
      }
    }
  }, [isDarkMode]);

  return (
    <div suppressHydrationWarning className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-surface-950 text-surface-50' 
        : 'bg-white text-gray-900'
    }`} data-theme={isDarkMode ? 'dark' : 'light'}>
      <ToastProvider>
        <AuthProvider>
          <TribeFitApp isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        </AuthProvider>
      </ToastProvider>
    </div>
  );
}