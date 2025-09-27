'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, Rss, Wallet, Users, User, Bell, Plus, Coins, 
  ShoppingCart, Heart, Clock, Target, Trophy, Zap,
  Play, SkipForward, Share, Gift, Star, UserPlus, X,
  Settings, LogOut, Camera, Vote, TrendingUp, Award,
  Dumbbell, Calendar, Moon, Sun
} from 'lucide-react';

// Import new components
import { ToastProvider, useToast } from '../components/ui/Toast';
import { AuthProvider, useAuth } from '../components/auth/AuthProvider';
import { LoginModal } from '../components/auth/LoginModal';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { WorkoutGenerator, WorkoutPlanModal } from '../components/WorkoutGenerator';
import { WorkoutSession } from '../components/WorkoutSession';
import { ShrinkWorkoutModal } from '../components/ShrinkWorkoutModal';
import { WorkoutCalendar } from '../components/WorkoutCalendar';
import { WorkoutScheduler } from '../components/WorkoutScheduler';
import { EquipmentCatalog } from '../components/ui/EquipmentCatalog';
import { DonationModal } from '../components/ui/DonationModal';
import { CoachRating, StarDisplay } from '../components/ui/CoachRating';
import { TipModal } from '../components/ui/TipModal';
import { VotingModal } from '../components/ui/VotingModal';
import { SquadCard } from '../components/ui/SquadCard';
import { SquadUpgradeModal } from '../components/ui/SquadUpgradeModal';
import { SquadLeaderboards } from '../components/ui/SquadLeaderboards';
import { SquadCreationModal } from '../components/ui/SquadCreationModal';
import { SquadDetailsModal } from '../components/ui/SquadDetailsModal';
import { ProfileCustomization } from '../components/ProfileCustomization';
import { useTranslation } from '../lib/i18n-hooks';
import { Features } from '../lib/feature-flags';
import { SquadProgression } from '../lib/squad-progression';

function TribeFitApp({ isDarkMode, setIsDarkMode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const toast = useToast();
  const { t, language, setLanguage, availableLanguages, getRandomSkipMessage } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(!isAuthenticated);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showAdVideo, setShowAdVideo] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [walletBalance, setWalletBalance] = useState(user?.wallet_balance_tc || 500);
  const [pactBalance, setPactBalance] = useState(300);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tribes, setTribes] = useState([]);
  const [squads, setSquads] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWorkoutSession, setShowWorkoutSession] = useState(false);
  const [showShrinkModal, setShowShrinkModal] = useState(false);
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);
  const [showWorkoutPlan, setShowWorkoutPlan] = useState(false);
  const [showWorkoutCalendar, setShowWorkoutCalendar] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showEquipmentCatalog, setShowEquipmentCatalog] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showCoachRating, setShowCoachRating] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedHire, setSelectedHire] = useState(null);
  const [showProfileCustomization, setShowProfileCustomization] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showSquadUpgradeModal, setShowSquadUpgradeModal] = useState(false);
  const [selectedSquadForUpgrade, setSelectedSquadForUpgrade] = useState(null);
  const [showSquadCreationModal, setShowSquadCreationModal] = useState(false);
  const [showSquadDetailsModal, setShowSquadDetailsModal] = useState(false);
  const [selectedSquadForDetails, setSelectedSquadForDetails] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [adSkipsThisWeek, setAdSkipsThisWeek] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      // Load wallet balance
      const walletResponse = await fetch('/api/wallet/balance');
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWalletBalance(walletData.balance_tc);
      }

      // Load workout plan
      const workoutResponse = await fetch('/api/workout/today');
      if (workoutResponse.ok) {
        const workoutData = await workoutResponse.json();
        setWorkoutPlan(workoutData);
      }

      // Load coaches
      const coachResponse = await fetch('/api/coach/list');
      if (coachResponse.ok) {
        const coachData = await coachResponse.json();
        setCoaches(coachData);
      }

      // Load feed posts
      const postsResponse = await fetch('/api/posts/feed');
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }

      // Load notifications
      const notifResponse = await fetch('/api/notifications');
      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        setNotifications(notifData);
      }

      // Load tribes and leaderboard (wait for user data first)
      setTimeout(() => {
        loadTribesAndLeaderboard();
      }, 500);

      // Load pending requests for voting
      loadPendingRequests();

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        description: 'Early bird workout squad ready for upgrade!',
        group_type: 'squad',
        members: 6, 
        member_count: 6,
        streak_days: 32, 
        participation_rate: 85.5,
        balance: 450, 
        pact_balance: 450,
        rank: 3,
        is_member: true,
        owner_id: user?.id
      },
      { 
        id: '30000000-0000-0000-0000-000000000002', 
        name: 'Iron Hearts', 
        description: 'Strength training focused squad',
        group_type: 'squad',
        members: 8, 
        member_count: 8,
        streak_days: 28, 
        participation_rate: 78.0,
        balance: 680, 
        pact_balance: 680,
        rank: 4,
        is_member: false,
        owner_id: 'other-user'
      },
      { 
        id: '30000000-0000-0000-0000-000000000003', 
        name: 'Cardio Crushers', 
        description: 'High-energy cardio squad',
        group_type: 'squad',
        members: 5, 
        member_count: 5,
        streak_days: 25, 
        participation_rate: 88.0,
        balance: 320, 
        pact_balance: 320,
        rank: 5,
        is_member: false,
        owner_id: 'other-user'
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
    // Mock pending requests for voting
    setPendingRequests([
      {
        id: 'req-1',
        type: 'gear',
        label: 'Dumbbells (20kg set)',
        amount: 150,
        requestedBy: 'Alex Chen',
        votes: { approve: 2, reject: 0 },
        totalMembers: 5
      },
      {
        id: 'req-2', 
        type: 'donation',
        label: 'Donation to City Fitness Center',
        amount: 200,
        requestedBy: 'Jordan Kim',
        votes: { approve: 1, reject: 1 },
        totalMembers: 5
      }
    ]);
  };

  // Enhanced handlers with toast notifications
  const handleStartWorkout = async () => {
    console.log('Starting workout...');
    try {
      const response = await fetch('/api/workout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: workoutPlan?.program?.id || 'prog-1',
          userId: user?.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowWorkoutSession(true);
        toast.success(t('workout_started'));
      } else {
        toast.error(data.error || t('failed_start_workout'));
      }
    } catch (error) {
      console.error('Start workout failed:', error);
      toast.error(t('failed_start_workout') + ': ' + error.message);
    }
  };

  const handleShrinkWorkout = async () => {
    setShowShrinkModal(true);
  };

  const handleShrinkAndStart = async (minutes) => {
    console.log('Shrinking workout to', minutes, 'minutes');
    try {
      const response = await fetch('/api/workout/shrink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('workout_shrunk', { minutes }));
        setShowWorkoutSession(true);
      } else {
        toast.error(data.error || t('failed_shrink_workout'));
      }
    } catch (error) {
      console.error('Shrink workout failed:', error);
      toast.error(t('failed_shrink_workout') + ': ' + error.message);
    }
  };

  const handleSkip = async (method) => {
    try {
      const response = await fetch('/api/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || '00000000-0000-0000-0000-000000000001',
          method,
          tribeId: '10000000-0000-0000-0000-000000000001'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setWalletBalance(data.new_balance);
        setPactBalance(data.pact_balance);
        setShowSkipModal(false);
        
        if (method === 'ad') {
          // Track ad skips and check for abuse
          const newAdSkips = adSkipsThisWeek + 1;
          setAdSkipsThisWeek(newAdSkips);
          
          setShowAdVideo(false);
          setAdProgress(0);
          toast.success(t('skip_ad_success'));
          
          // Send snitch notification with ad count
          sendSnitchNotification(user?.name || 'User', method, newAdSkips);
        } else {
          // Enhanced snitch notification for paying to skip
          toast.success(t('skip_pay_success'));
          
          // Send snitch notification for payment
          sendSnitchNotification(user?.name || 'User', method);
        }
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
      const AD_THRESHOLD = 3; // Alert after 3 ads in a week
      
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
    const toastDuration = adSkipsThisWeek >= 3 ? 7000 : 5000; // Longer for ad abuse
    toast.warning(snitchMessage, { duration: toastDuration });
  };

  const startAdWatch = () => {
    setShowAdVideo(true);
    setAdProgress(0);
    
    const interval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          handleSkip('ad');
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleSharePost = async (caption = 'Just completed my workout! 💪') => {
    console.log('Sharing post with caption:', caption);
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
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes_count: (post.likes_count || 0) + 1, liked: true }
        : post
    ));
    toast.success(t('post_liked'));
  };

  const handleBecomeCoach = async () => {
    console.log('Applying to become coach...');
    try {
      const response = await fetch('/api/coach/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('coach_application'));
      } else {
        toast.error(data.error || t('failed_coach_application'));
      }
    } catch (error) {
      console.error('Coach application failed:', error);
      toast.error(t('failed_coach_application') + ': ' + error.message);
    }
  };

  const handleHireCoach = async (coach) => {
    console.log('Hiring coach:', coach);
    try {
      const response = await fetch('/api/coach/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user?.id,
          coachId: coach.user_id || coach.id,
          offeringId: null,
          priceTc: coach.pricing?.['1on1'] || 200
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('coach_hired'));
        setWalletBalance(prev => prev - (coach.pricing?.['1on1'] || 200));
        setSelectedHire(data.hire);
      } else {
        toast.error(data.error || t('failed_hire_coach'));
      }
    } catch (error) {
      console.error('Coach hire failed:', error);
      toast.error(t('failed_hire_coach') + ': ' + error.message);
    }
  };

  const handleRateCoach = async (ratingData) => {
    try {
      const response = await fetch('/api/coach/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });

      if (response.ok) {
        toast.success(t('coach_rating_success'));
        const coachResponse = await fetch('/api/coach/list');
        const coachData = await coachResponse.json();
        setCoaches(coachData);
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
        toast.success(t('tip_sent_success'));
        setWalletBalance(prev => prev - tipData.amountTc);
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
        toast.success(t('equipment_request'));
        loadPendingRequests(); // Refresh pending requests
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
        toast.success(t('donation_request'));
        loadPendingRequests(); // Refresh pending requests
      } else {
        const error = await response.json();
        toast.error(error.error || t('failed_donation_request'));
      }
    } catch (error) {
      console.error('Donation request failed:', error);
      toast.error(t('failed_donation_request') + ': ' + error.message);
    }
  };

  const handleVote = async (requestId, vote) => {
    try {
      const response = await fetch('/api/pact/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          vote,
          userId: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setPendingRequests(prev => prev.map(req => {
          if (req.id === requestId) {
            return {
              ...req,
              votes: data.votes,
              status: data.status
            };
          }
          return req;
        }));
        
        toast.success(t('vote_success', { vote: vote === 'approve' ? t('approve') : t('reject') }));
        
        // If request was approved or rejected, reload pending requests
        if (data.status === 'approved' || data.status === 'rejected') {
          setTimeout(() => {
            loadPendingRequests();
          }, 1000);
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
          upgradedSquad.name, 
          language
        );
        
        toast.success(celebrationMessage, { duration: 8000 });
        
        // Update local state - move squad to tribes
        setSquads(prev => prev.filter(s => s.id !== squadId));
        setTribes(prev => [...prev, { ...upgradedSquad, group_type: 'tribe' }]);
        
        // Award bonus TribeCoins
        setWalletBalance(prev => prev + SquadProgression.getUpgradeRewards().bonusTC);
        
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
      // Mock join functionality for now
      toast.success(`Joined ${squad.name}! Welcome to the ${squad.group_type}! 🎉`);
      
      // Update local state
      if (squad.group_type === 'squad') {
        setSquads(prev => prev.map(s => 
          s.id === squad.id 
            ? { ...s, is_member: true, member_count: s.member_count + 1 }
            : s
        ));
      } else {
        setTribes(prev => prev.map(t => 
          t.id === squad.id 
            ? { ...t, is_member: true, member_count: t.member_count + 1 }
            : t
        ));
      }
    } catch (error) {
      console.error('Join failed:', error);
      toast.error('Failed to join: ' + error.message);
    }
  };

  const handleViewSquad = (squad) => {
    setSelectedSquadForDetails(squad);
    setShowSquadDetailsModal(true);
  };

  const handleCreateSquad = async (formData) => {
    try {
      // Mock creation functionality
      const newSquad = {
        id: `squad-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        group_type: formData.type,
        member_count: 1,
        streak_days: 0,
        participation_rate: 100,
        pact_balance: 0,
        is_member: true,
        owner_id: user?.id,
        isPrivate: formData.isPrivate
      };

      if (formData.type === 'squad') {
        setSquads(prev => [newSquad, ...prev]);
      } else {
        setTribes(prev => [newSquad, ...prev]);
      }

      toast.success(`${formData.type === 'squad' ? 'Squad' : 'Tribe'} "${formData.name}" created successfully! 🎉`);
    } catch (error) {
      console.error('Creation failed:', error);
      throw error;
    }
  };

  const handleWorkoutPlanGenerated = (plan) => {
    setGeneratedPlan(plan);
    setShowWorkoutPlan(true);
    toast.success(t('workout_plan_generated'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-surface-100 animate-pulse">{t('loading')}</div>
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
            className="w-full mb-4"
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
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-surface-800 via-surface-700 to-surface-800 border border-surface-600 rounded-2xl p-6 text-surface-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{t('welcome_back', { name: user?.name })}</h2>
            <p className="text-surface-300">{t('ready_goals')}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold number-display text-primary">{walletBalance}</div>
            <div className="text-sm text-surface-400">{t('tribecoins')}</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-3">
          <button 
            onClick={() => toast.success(`🔥 ${user?.streak_days || 7} ${t('day_streak')}! ${t('keep_it_up')}!`)}
            className="bg-surface-700/50 hover:bg-surface-700 rounded-xl p-3 transition-colors border border-surface-600 hover:border-primary/50"
          >
            <div className="flex items-center space-x-2">
              <Trophy size={16} className="text-accent" />
              <span className="font-medium text-xs">{user?.streak_days || 7} {t('day_streak')}</span>
            </div>
          </button>
          <button 
            onClick={() => {
              setActiveTab('tribe');
              toast.info(t('viewing_tribe'));
            }}
            className="bg-surface-700/50 hover:bg-surface-700 rounded-xl p-3 transition-colors border border-surface-600 hover:border-primary/50"
          >
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-primary" />
              <span className="font-medium text-xs">{Features.SQUADS ? 'Squads & Tribes' : t('founders_tribe')}</span>
            </div>
          </button>
          <button 
            onClick={() => setShowWorkoutCalendar(true)}
            className="bg-surface-700/50 hover:bg-surface-700 rounded-xl p-3 transition-colors border border-surface-600 hover:border-primary/50"
          >
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-success" />
              <span className="font-medium text-xs">{t('schedule')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Workout Plan */}
      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-surface-50">{t('todays_plan')}</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowWorkoutGenerator(true)}
          >
            <Zap size={16} />
            {t('ai_generate')}
          </Button>
        </div>
        
        {workoutPlan?.program ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-surface-300">{workoutPlan.program.title}</span>
              <span className="text-primary">45 min</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                onClick={handleStartWorkout}
                variant="primary"
                className="flex-col h-16"
              >
                <Play size={20} />
                <span className="text-xs">{t('start_workout')}</span>
              </Button>
              <Button 
                onClick={handleShrinkWorkout}
                variant="ghost"
                className="flex-col h-16"
              >
                <Clock size={20} />
                <span className="text-xs">{t('shrink_workout')}</span>
              </Button>
              <Button 
                onClick={() => setShowSkipModal(true)}
                variant="accent"
                className="flex-col h-16"
              >
                <SkipForward size={20} />
                <span className="text-xs">{t('skip_workout')}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={48} className="text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 mb-4">{t('no_workout_planned')}</p>
            <Button 
              onClick={() => setShowWorkoutGenerator(true)}
              variant="primary"
            >
              {t('generate_ai_workout')}
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions - BLUE BUTTONS */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => handleSharePost(t('share_progress_caption'))}
          variant="primary"
          className="h-14 flex-col"
        >
          <Share size={20} />
          <span className="text-sm">{t('share_progress')}</span>
        </Button>
        <Button 
          onClick={() => {
            setSelectedPost(null);
            setShowTipModal(true);
          }}
          variant="primary"
          className="h-14 flex-col"
        >
          <Gift size={20} />
          <span className="text-sm">{t('tip_friend')}</span>
        </Button>
      </div>
    </div>
  );

  const renderFeed = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-surface-50">{t('tribe_feed')}</h2>
        <Button
          onClick={() => setShowPostModal(true)}
          variant="primary"
          size="sm"
        >
          <Plus size={16} />
          {t('post')}
        </Button>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-12 card">
          <Camera size={48} className="text-surface-600 mx-auto mb-4" />
          <div className="text-surface-400 mb-4">{t('no_posts')}</div>
          <Button
            onClick={() => setShowPostModal(true)}
            variant="primary"
          >
            {t('share_first_workout')}
          </Button>
        </div>
      ) : (
        posts.map((post, index) => (
          <div key={index} className="card-interactive animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-tribal rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{post.user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <div className="text-surface-100 font-medium">{post.user?.name || 'User'}</div>
                <div className="text-surface-400 text-sm">{t('time_ago')}</div>
              </div>
            </div>
            
            {post.media_url && (
              <div className="bg-surface-800 rounded-xl h-48 mb-4 flex items-center justify-center">
                <span className="text-surface-400">📷 {t('workout_photo')}</span>
              </div>
            )}
            
            <p className="text-surface-300 mb-4">{post.caption || t('default_workout_caption')}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.liked ? 'text-red-400' : 'text-surface-400 hover:text-red-400'
                  }`}
                >
                  <Heart size={20} className={post.liked ? 'fill-current' : ''} />
                  <span>{post.likes_count || 0}</span>
                </button>
                <button 
                  onClick={() => handleSharePost(t('sharing_awesome_workout'))}
                  className="flex items-center space-x-2 text-surface-400 hover:text-primary transition-colors"
                >
                  <Share size={20} />
                  <span>{t('share')}</span>
                </button>
              </div>
              <Button
                onClick={() => {
                  setSelectedPost({ ...post, post_id: post.id });
                  setShowTipModal(true);
                }}
                variant="accent"
                size="sm"
              >
                <Coins size={16} />
                {t('tip_tc')}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTribe = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Tribe/Squad Header */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-tribal rounded-full flex items-center justify-center">
            {Features.SQUADS && (squads.length > 0 || tribes.length > 0) ? (
              <div className="flex">
                <span className="text-2xl">🔥</span>
                <span className="text-2xl">🪶</span>
              </div>
            ) : (
              <Trophy size={32} className="text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-50">
              {Features.SQUADS ? 'Squads & Tribes' : t('founders_tribe')}
            </h2>
            <p className="text-surface-400">
              {Features.SQUADS 
                ? `${squads.length} squads • ${tribes.length} tribes` 
                : t('tribe_members_rank', { members: 15, rank: 1 })
              }
            </p>
          </div>
        </div>
        
        {/* Current Group Stats (if member) */}
        {(tribes.some(t => t.is_member) || squads.some(s => s.is_member)) && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary number-display">{pactBalance}</div>
              <div className="text-xs text-surface-400">Deal Vault</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent number-display">28</div>
              <div className="text-xs text-surface-400">{t('day_streak')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success number-display">15</div>
              <div className="text-xs text-surface-400">{t('members')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Deal Vault Actions */}
      <div className="card">
        <h3 className="text-lg font-bold text-surface-50 mb-4 flex items-center space-x-2">
          <TrendingUp size={20} className="text-accent" />
          <span>Deal Vault</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowEquipmentCatalog(true)}
            variant="primary"
            className="h-16 flex-col"
          >
            <ShoppingCart size={24} />
            <span className="text-sm">{t('spend_on_gear')}</span>
          </Button>
          <Button
            onClick={() => setShowDonationModal(true)}
            variant="accent"
            className="h-16 flex-col"
          >
            <Heart size={24} />
            <span className="text-sm">{t('donate_to_gym')}</span>
          </Button>
        </div>
      </div>

      {/* Squads Section (if feature enabled) */}
      {Features.SQUADS && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-surface-50 flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <span>Squads</span>
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={() => toast.info('Browse squads in leaderboard below to join')}
                variant="ghost"
                size="sm"
                className="px-3 py-2 flex items-center gap-1"
              >
                <Users size={16} />
                <span className="text-xs">Join</span>
              </Button>
              <Button
                onClick={() => setShowSquadCreationModal(true)}
                variant="primary"
                size="sm"
                className="px-3 py-2 flex items-center gap-1"
              >
                <Plus size={16} />
                <span className="text-xs">Create</span>
              </Button>
            </div>
          </div>
          
          {squads.length === 0 ? (
            <div className="text-center py-8 card">
              <span className="text-6xl mb-4 block">🔥</span>
              <div className="text-surface-400 mb-4">No squads yet</div>
              <Button
                onClick={() => setShowSquadCreationModal(true)}
                variant="primary"
              >
                Create Your First Squad
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {squads.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  onJoin={handleJoinSquad}
                  onUpgrade={(squad) => {
                    setSelectedSquadForUpgrade(squad);
                    setShowSquadUpgradeModal(true);
                  }}
                  onView={handleViewSquad}
                  isOwner={squad.is_member && squad.owner_id === user?.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tribes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-surface-50 flex items-center space-x-2">
            <span className="text-2xl">🪶</span>
            <span>Tribes</span>
          </h3>
          <div className="flex gap-2">
            {Features.SQUADS && (
              <Button
                onClick={() => toast.info('Browse tribes in leaderboard below to request membership')}
                variant="ghost"
                size="sm"
                className="px-3 py-2 flex items-center gap-1"
              >
                <Users size={16} />
                <span className="text-xs">Request</span>
              </Button>
            )}
            <Button
              onClick={() => setShowSquadCreationModal(true)}
              variant="primary"
              size="sm"
              className="px-3 py-2 flex items-center gap-1"
            >
              <Crown size={16} />
              <span className="text-xs">Create</span>
            </Button>
          </div>
        </div>
        
        {tribes.length === 0 ? (
          <div className="text-center py-8 card">
            <span className="text-6xl mb-4 block">🪶</span>
            <div className="text-surface-400 mb-4">No tribes yet</div>
            {Features.SQUADS ? (
              <div className="space-y-2">
                <p className="text-surface-500 text-sm">
                  Create a Squad first, then upgrade it to a Tribe after building a 30-day streak!
                </p>
              </div>
            ) : (
              <Button 
                onClick={() => setShowSquadCreationModal(true)}
                variant="primary"
              >
                Create Your First Tribe
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tribes.map((tribe) => (
              <SquadCard
                key={tribe.id}
                squad={tribe}
                onJoin={handleJoinSquad}
                onView={handleViewSquad}
                isOwner={tribe.is_member && tribe.owner_id === user?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pending Votes */}
      {pendingRequests.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Vote size={20} className="text-primary" />
              <h3 className="text-lg font-bold text-surface-50">{t('pending_votes')}</h3>
            </div>
            <Button
              onClick={() => setShowVotingModal(true)}
              variant="primary"
              size="sm"
            >
              <Vote size={16} />
              Vote Now
            </Button>
          </div>
          <div className="space-y-3">
            {pendingRequests.slice(0, 2).map((request) => (
              <div key={request.id} className="bg-surface-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-surface-100">{request.label}</h4>
                    <p className="text-sm text-surface-400">
                      {request.amount} TC • Requested by {request.requestedBy}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.type === 'gear' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                  }`}>
                    {request.type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-surface-400">
                    {request.votes.approve} / {Math.ceil(request.totalMembers / 2)} needed to approve
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleVote(request.id, 'approve')}
                      variant="success"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleVote(request.id, 'reject')}
                      variant="danger"
                      size="sm"
                    >
                      Reject
                    </Button>
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-surface-50">{t('coaches')}</h2>
        <Button
          onClick={handleBecomeCoach}
          variant="primary"
          size="sm"
        >
          <UserPlus size={16} />
          {t('become_coach')}
        </Button>
      </div>

      {coaches.length === 0 ? (
        <div className="text-center py-12 card">
          <Award size={48} className="text-surface-600 mx-auto mb-4" />
          <div className="text-surface-400 mb-4">{t('no_coaches')}</div>
          <Button
            onClick={handleBecomeCoach}
            variant="primary"
          >
            {t('be_first_coach')}
          </Button>
        </div>
      ) : (
        coaches.map((coach, index) => (
          <div key={index} className="card-interactive animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-tribal rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {coach.user?.name?.charAt(0) || coach.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-surface-50 font-bold text-sm truncate">{coach.user?.name || coach.name || 'Coach'}</h3>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">
                      {coach.tier || t('certified')}
                    </span>
                    <StarDisplay rating={coach.rating_avg || 0} size={12} />
                  </div>
                  <p className="text-surface-400 text-xs line-clamp-2 leading-tight">
                    {coach.bio || t('professional_coach_bio')}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="text-accent font-bold text-sm">{coach.pricing?.['1on1'] || 200} TC</div>
                <div className="text-surface-400 text-xs">{t('per_session')}</div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleHireCoach(coach)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                {t('hire_coach')}
              </Button>
              <Button
                onClick={() => {
                  setSelectedCoach(coach);
                  setSelectedHire({ id: 'demo-hire', client_id: user?.id });
                  setShowCoachRating(true);
                }}
                variant="ghost"
                size="sm"
              >
                <Star size={14} />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-tribal rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{user?.name?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-surface-50">{user?.name || 'Alex Chen'}</h2>
            <p className="text-surface-400">{user?.email || 'demo@tribefit.app'}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => setShowProfileCustomization(true)}
            >
              <Settings size={16} />
              {t('customize')}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary number-display">{walletBalance}</div>
            <div className="text-surface-400 text-sm">{t('tribecoins')}</div>
          </div>
          <div className="bg-surface-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent number-display">{user?.streak_days || 7}</div>
            <div className="text-surface-400 text-sm">{t('day_streak')}</div>
          </div>
        </div>
      </div>

      {/* Theme & Language Settings */}
      <div className="card">
        <h3 className="font-bold text-surface-50 mb-4">Settings</h3>
        
        {/* Dark/Light Mode Toggle */}
        <div className="flex items-center justify-between mb-4 p-3 bg-surface-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              {isDarkMode ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-accent" />}
            </div>
            <div>
              <div className="text-surface-50 text-sm font-medium">Theme</div>
              <div className="text-surface-400 text-xs">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</div>
            </div>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDarkMode ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="card">
        <h3 className="text-lg font-bold text-surface-50 mb-3">{t('language')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {availableLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-3 rounded-lg border text-center transition-all ${
                language === lang.code
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-surface-700 bg-surface-800 text-surface-300 hover:border-surface-600'
              }`}
            >
              <div className="text-2xl mb-1">{lang.flag}</div>
              <div className="text-xs">{lang.name}</div>
            </button>
          ))}
        </div>
      </div>

      <Button 
        onClick={logout}
        variant="danger"
        className="w-full"
      >
        <LogOut size={16} />
        {t('sign_out')}
      </Button>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold text-surface-50">{t('notifications')}</h2>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12 card">
          <Bell size={48} className="text-surface-600 mx-auto mb-4" />
          <div className="text-surface-400 mb-4">{t('no_notifications')}</div>
          <p className="text-sm text-surface-500">{t('stay_active_message')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className={`card-interactive ${notification.type === 'snitch' ? 'border-l-4 border-l-warning' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-surface-100">{notification.title}</h3>
                  <p className="text-surface-300 text-sm mt-1">{notification.body}</p>
                  <div className="text-surface-500 text-xs mt-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-soft"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-950 tribal-pattern">
      <div className="max-w-sm mx-auto bg-surface-950 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-800 glass">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-tribal rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-surface-50">TribeFit</h1>
          </div>
          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2 hover:bg-surface-800 rounded-lg transition-colors relative"
          >
            <Bell size={20} className="text-surface-400" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-soft">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 pb-32">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'feed' && renderFeed()}
          {activeTab === 'tribe' && renderTribe()}
          {activeTab === 'coach' && renderCoach()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'notifications' && renderNotifications()}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm glass border-t border-surface-700">
          <div className="grid grid-cols-5 gap-1 p-2">
            {[
              { id: 'home', icon: Home, label: t('home') },
              { id: 'feed', icon: Rss, label: t('feed') },
              { id: 'tribe', icon: Users, label: Features.SQUADS ? 'Groups' : t('tribe') },
              { id: 'coach', icon: Dumbbell, label: t('coach') },
              { id: 'profile', icon: User, label: t('profile') }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center py-3 px-2 rounded-lg transition-all ${
                  activeTab === id 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Skip Modal */}
      {showSkipModal && (
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
              {t('pay_to_skip')}
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
      )}

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
      />

      <WorkoutSession
        isOpen={showWorkoutSession}
        onClose={() => setShowWorkoutSession(false)}
        workoutData={generatedPlan}
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
      />

      <ProfileCustomization
        isOpen={showProfileCustomization}
        onClose={() => setShowProfileCustomization(false)}
      />

      <EquipmentCatalog
        isOpen={showEquipmentCatalog}
        onClose={() => setShowEquipmentCatalog(false)}
        onSubmitRequest={handleEquipmentRequest}
      />

      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSubmitRequest={handleDonationRequest}
      />

      <CoachRating
        isOpen={showCoachRating}
        onClose={() => setShowCoachRating(false)}
        coach={selectedCoach}
        hire={selectedHire}
        onSubmitRating={handleRateCoach}
      />

      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        recipient={selectedPost}
        onSubmitTip={handleTipUser}
      />

      <VotingModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        pendingRequests={pendingRequests}
        onVote={handleVote}
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
        user={user}
        onJoin={handleJoinSquad}
        onUpgrade={(squad) => {
          setSelectedSquadForUpgrade(squad);
          setShowSquadUpgradeModal(true);
        }}
      />
    </div>
  );
}

// Wrap with providers
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-surface-950 text-surface-50' 
          : 'bg-white text-gray-900'
      }`}>
        <ToastProvider>
          <AuthProvider>
            <TribeFitApp isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </AuthProvider>
        </ToastProvider>
      </div>
    </div>
  );
}