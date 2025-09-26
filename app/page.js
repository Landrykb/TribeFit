'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, Rss, Wallet, Users, User, Bell, Plus, Coins, 
  ShoppingCart, Heart, Clock, Target, Trophy, Zap,
  Play, SkipForward, Share, Gift, Star, UserPlus, X,
  Settings, LogOut, Camera, Vote, TrendingUp, Award,
  Dumbbell, Calendar
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
import { ProfileCustomization } from '../components/ProfileCustomization';

function TribeFitApp() {
  const { user, logout, isAuthenticated } = useAuth();
  const toast = useToast();
  
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
  const [pendingRequests, setPendingRequests] = useState([]);

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

      // Load tribes and leaderboard
      loadTribesAndLeaderboard();

      // Load pending requests for voting
      loadPendingRequests();

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTribesAndLeaderboard = async () => {
    // Mock tribe data with leaderboard
    const mockTribes = [
      { id: '1', name: 'Founders Tribe', members: 15, streak: 28, balance: 1250, rank: 1 },
      { id: '2', name: 'Iron Warriors', members: 23, streak: 21, balance: 980, rank: 2 },
      { id: '3', name: 'Fit Legends', members: 18, streak: 19, balance: 750, rank: 3 },
      { id: '4', name: 'Strength Squad', members: 12, streak: 14, balance: 650, rank: 4 },
    ];
    setTribes(mockTribes);
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
        toast.success('Opening workout session! 💪');
      } else {
        toast.error(data.error || 'Failed to start workout');
      }
    } catch (error) {
      console.error('Start workout failed:', error);
      toast.error('Failed to start workout: ' + error.message);
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
        toast.success(`Workout adjusted to ${minutes} minutes! Starting now...`);
        setShowWorkoutSession(true);
      } else {
        toast.error(data.error || 'Failed to shrink workout');
      }
    } catch (error) {
      console.error('Shrink workout failed:', error);
      toast.error('Failed to shrink workout: ' + error.message);
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
          setShowAdVideo(false);
          setAdProgress(0);
          toast.success('Workout skipped! Ad watched successfully 📺');
        } else {
          toast.success('Workout skipped! 100 TC added to tribe pact 💰');
        }
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Skip failed:', error);
      toast.error('Skip failed: ' + error.message);
    }
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
        toast.success('Post shared to feed! 🎉');
        // Reload posts
        const postsResponse = await fetch('/api/posts/feed');
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } else {
        toast.error(data.error || 'Failed to share post');
      }
    } catch (error) {
      console.error('Post share failed:', error);
      toast.error('Failed to share post: ' + error.message);
    }
  };

  const handleLikePost = async (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes_count: (post.likes_count || 0) + 1, liked: true }
        : post
    ));
    toast.success('Post liked! ❤️');
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
        toast.success('Coach application submitted! We\'ll review it soon. 🏆');
      } else {
        toast.error(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Coach application failed:', error);
      toast.error('Failed to submit application: ' + error.message);
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
        toast.success(`Coach ${coach.name || 'Coach'} hired successfully! 🎯`);
        setWalletBalance(prev => prev - (coach.pricing?.['1on1'] || 200));
        setSelectedHire(data.hire);
      } else {
        toast.error(data.error || 'Failed to hire coach');
      }
    } catch (error) {
      console.error('Coach hire failed:', error);
      toast.error('Failed to hire coach: ' + error.message);
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
        toast.success('Coach rating submitted! ⭐');
        const coachResponse = await fetch('/api/coach/list');
        const coachData = await coachResponse.json();
        setCoaches(coachData);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Coach rating failed:', error);
      toast.error('Failed to submit rating: ' + error.message);
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
        toast.success('TribeCoins sent successfully! 🪙');
        setWalletBalance(prev => prev - tipData.amountTc);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send tip');
      }
    } catch (error) {
      console.error('Tip failed:', error);
      toast.error('Failed to send tip: ' + error.message);
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
        toast.success('Equipment request submitted for tribe voting! 🗳️');
        loadPendingRequests(); // Refresh pending requests
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Equipment request failed:', error);
      toast.error('Failed to submit request: ' + error.message);
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
        toast.success('Donation request submitted for tribe voting! 🗳️');
        loadPendingRequests(); // Refresh pending requests
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Donation request failed:', error);
      toast.error('Failed to submit request: ' + error.message);
    }
  };

  const handleVote = async (requestId, vote) => {
    // Simulate voting
    setPendingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const newVotes = { ...req.votes };
        newVotes[vote] = newVotes[vote] + 1;
        return { ...req, votes: newVotes };
      }
      return req;
    }));
    
    toast.success(`Vote ${vote === 'approve' ? 'approved' : 'rejected'}! 🗳️`);
  };

  const handleWorkoutPlanGenerated = (plan) => {
    setGeneratedPlan(plan);
    setShowWorkoutPlan(true);
    toast.success('AI workout plan generated! 🤖💪');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-surface-100 animate-pulse">Loading your profile...</div>
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
            <p className="text-surface-400">Stronger Together. One Tribe, One Pact.</p>
          </div>
          
          <Button
            onClick={() => setShowLoginModal(true)}
            variant="primary"
            className="w-full mb-4"
          >
            Get Started
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-surface-500">
              Join thousands building fitness habits together
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
            <h2 className="text-xl font-bold">Welcome back, {user?.name}!</h2>
            <p className="text-surface-300">Ready to crush today's goals?</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold number-display text-primary">{walletBalance}</div>
            <div className="text-sm text-surface-400">TribeCoins</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-3">
          <button 
            onClick={() => toast.success(`🔥 ${user?.streak_days || 7} day streak! Keep it up!`)}
            className="bg-surface-700/50 hover:bg-surface-700 rounded-xl p-3 transition-colors border border-surface-600 hover:border-primary/50"
          >
            <div className="flex items-center space-x-2">
              <Trophy size={16} className="text-accent" />
              <span className="font-medium text-xs">{user?.streak_days || 7} Day Streak</span>
            </div>
          </button>
          <button 
            onClick={() => {
              setActiveTab('tribe');
              toast.info('Viewing tribe details');
            }}
            className="bg-surface-700/50 hover:bg-surface-700 rounded-xl p-3 transition-colors border border-surface-600 hover:border-primary/50"
          >
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-primary" />
              <span className="font-medium text-xs">Founders Tribe</span>
            </div>
          </button>
          <button 
            onClick={() => setShowWorkoutCalendar(true)}
            className="bg-surface-700/50 hover:bg-surface-700 rounded-xl p-3 transition-colors border border-surface-600 hover:border-primary/50"
          >
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-success" />
              <span className="font-medium text-xs">Schedule</span>
            </div>
          </button>
        </div>
      </div>

      {/* Workout Plan */}
      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-surface-50">Today's Plan</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowWorkoutGenerator(true)}
          >
            <Zap size={16} />
            AI Generate
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
                <span className="text-xs">Start</span>
              </Button>
              <Button 
                onClick={handleShrinkWorkout}
                variant="ghost"
                className="flex-col h-16"
              >
                <Clock size={20} />
                <span className="text-xs">Shrink</span>
              </Button>
              <Button 
                onClick={() => setShowSkipModal(true)}
                variant="accent"
                className="flex-col h-16"
              >
                <SkipForward size={20} />
                <span className="text-xs">Skip</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={48} className="text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 mb-4">No workout planned for today</p>
            <Button 
              onClick={() => setShowWorkoutGenerator(true)}
              variant="primary"
            >
              Generate AI Workout Plan
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => handleSharePost('Share today\'s progress! 💪')}
          variant="success"
          className="h-14 flex-col"
        >
          <Share size={20} />
          <span className="text-sm">Share Progress</span>
        </Button>
        <Button 
          onClick={() => {
            setSelectedPost(null);
            setShowTipModal(true);
          }}
          variant="accent"
          className="h-14 flex-col"
        >
          <Gift size={20} />
          <span className="text-sm">Tip Friend</span>
        </Button>
      </div>
    </div>
  );

  const renderFeed = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-surface-50">Tribe Feed</h2>
        <Button
          onClick={() => setShowPostModal(true)}
          variant="primary"
          size="sm"
        >
          <Plus size={16} />
          Post
        </Button>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-12 card">
          <Camera size={48} className="text-surface-600 mx-auto mb-4" />
          <div className="text-surface-400 mb-4">No posts yet</div>
          <Button
            onClick={() => setShowPostModal(true)}
            variant="primary"
          >
            Share your first workout! 💪
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
                <div className="text-surface-400 text-sm">2 hours ago</div>
              </div>
            </div>
            
            {post.media_url && (
              <div className="bg-surface-800 rounded-xl h-48 mb-4 flex items-center justify-center">
                <span className="text-surface-400">📷 Workout Photo</span>
              </div>
            )}
            
            <p className="text-surface-300 mb-4">{post.caption || 'Just finished an awesome workout! 💪'}</p>
            
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
                  onClick={() => handleSharePost('Sharing this awesome workout!')}
                  className="flex items-center space-x-2 text-surface-400 hover:text-primary transition-colors"
                >
                  <Share size={20} />
                  <span>Share</span>
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
                Tip TC
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTribe = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Tribe Header */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-tribal rounded-full flex items-center justify-center">
            <Trophy size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-50">Founders Tribe</h2>
            <p className="text-surface-400">15 members • Rank #1</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary number-display">{pactBalance}</div>
            <div className="text-xs text-surface-400">Pact Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent number-display">28</div>
            <div className="text-xs text-surface-400">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success number-display">15</div>
            <div className="text-xs text-surface-400">Members</div>
          </div>
        </div>
      </div>

      {/* Pact Actions */}
      <div className="card">
        <h3 className="text-lg font-bold text-surface-50 mb-4">Pact Wallet</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowEquipmentCatalog(true)}
            variant="primary"
            className="h-16 flex-col"
          >
            <ShoppingCart size={24} />
            <span className="text-sm">Spend on Gear</span>
          </Button>
          <Button
            onClick={() => setShowDonationModal(true)}
            variant="accent"
            className="h-16 flex-col"
          >
            <Heart size={24} />
            <span className="text-sm">Donate to Gym</span>
          </Button>
        </div>
      </div>

      {/* Pending Votes */}
      {pendingRequests.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Vote size={20} className="text-primary" />
            <h3 className="text-lg font-bold text-surface-50">Pending Votes</h3>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
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
                    {request.votes.approve} / {Math.ceil(request.totalMembers / 2)} needed
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

      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={20} className="text-accent" />
          <h3 className="text-lg font-bold text-surface-50">Tribe Leaderboard</h3>
        </div>
        <div className="space-y-3">
          {leaderboard.map((tribe, index) => (
            <div key={tribe.id} className="flex items-center justify-between p-3 bg-surface-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-amber-600 text-white' :
                  'bg-surface-700 text-surface-300'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-surface-100">{tribe.name}</div>
                  <div className="text-sm text-surface-400">{tribe.members} members</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{tribe.streak} days</div>
                <div className="text-xs text-surface-400">{tribe.balance} TC</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-surface-50">Coaches</h2>
        <Button
          onClick={handleBecomeCoach}
          variant="primary"
          size="sm"
        >
          <UserPlus size={16} />
          Become Coach
        </Button>
      </div>

      {coaches.length === 0 ? (
        <div className="text-center py-12 card">
          <Award size={48} className="text-surface-600 mx-auto mb-4" />
          <div className="text-surface-400 mb-4">No coaches available</div>
          <Button
            onClick={handleBecomeCoach}
            variant="primary"
          >
            Be the first coach in your area! 🏆
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
                      {coach.tier || 'Certified'}
                    </span>
                    <StarDisplay rating={coach.rating_avg || 0} size={12} />
                  </div>
                  <p className="text-surface-400 text-xs line-clamp-2 leading-tight">
                    {coach.bio || 'Professional fitness coach specializing in strength training'}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="text-accent font-bold text-sm">{coach.pricing?.['1on1'] || 200} TC</div>
                <div className="text-surface-400 text-xs">per session</div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleHireCoach(coach)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Hire Coach
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
              Customize
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary number-display">{walletBalance}</div>
            <div className="text-surface-400 text-sm">TribeCoins</div>
          </div>
          <div className="bg-surface-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent number-display">{user?.streak_days || 7}</div>
            <div className="text-surface-400 text-sm">Day Streak</div>
          </div>
        </div>
      </div>

      <Button 
        onClick={logout}
        variant="danger"
        className="w-full"
      >
        <LogOut size={16} />
        Sign Out
      </Button>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold text-surface-50">Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12 card">
          <Bell size={48} className="text-surface-600 mx-auto mb-4" />
          <div className="text-surface-400 mb-4">No notifications yet</div>
          <p className="text-sm text-surface-500">Stay active and you'll see updates here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="card-interactive">
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
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'feed', icon: Rss, label: 'Feed' },
              { id: 'tribe', icon: Users, label: 'Tribe' },
              { id: 'coach', icon: Dumbbell, label: 'Coach' },
              { id: 'profile', icon: User, label: 'Profile' }
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
        <Modal isOpen={showSkipModal} onClose={() => setShowSkipModal(false)} title="Skip Today's Workout?">
          <p className="text-surface-400 mb-6">Choose how to skip:</p>
          
          <div className="space-y-3">
            <Button
              onClick={() => handleSkip('pay')}
              variant="accent"
              className="w-full"
            >
              Pay 100 TC to Skip
            </Button>
            <Button
              onClick={startAdWatch}
              variant="primary"
              className="w-full"
            >
              Watch Ad to Skip (Free)
            </Button>
            <Button
              onClick={() => setShowSkipModal(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}

      {/* Ad Video Modal */}
      {showAdVideo && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="w-64 h-36 bg-surface-800 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-lg">📺 Ad Playing...</span>
            </div>
            <div className="w-64 bg-surface-700 rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-150" 
                style={{ width: `${adProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-surface-400">
              Ad will finish in {Math.ceil((100 - adProgress) / 5 * 0.15)} seconds
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
          title="Create Post"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-2">
                What's happening?
              </label>
              <textarea
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Share your workout progress, achievements, or motivation..."
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
                Cancel
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
                Share Post
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Workout Generator */}
      <WorkoutGenerator
        isOpen={showWorkoutGenerator}
        onClose={() => setShowWorkoutGenerator(false)}
        onPlanGenerated={handleWorkoutPlanGenerated}
      />

      {/* Workout Plan Modal */}
      <WorkoutPlanModal
        isOpen={showWorkoutPlan}
        onClose={() => setShowWorkoutPlan(false)}
        plan={generatedPlan}
      />

      {/* Workout Session Modal */}
      <WorkoutSession
        isOpen={showWorkoutSession}
        onClose={() => setShowWorkoutSession(false)}
        workoutData={generatedPlan}
      />

      {/* Shrink Workout Modal */}
      <ShrinkWorkoutModal
        isOpen={showShrinkModal}
        onClose={() => setShowShrinkModal(false)}
        onShrink={handleShrinkAndStart}
      />

      {/* Workout Calendar Modal */}
      <WorkoutCalendar
        isOpen={showWorkoutCalendar}
        onClose={() => setShowWorkoutCalendar(false)}
      />

      {/* Profile Customization Modal */}
      <ProfileCustomization
        isOpen={showProfileCustomization}
        onClose={() => setShowProfileCustomization(false)}
      />

      {/* Equipment Catalog Modal */}
      <EquipmentCatalog
        isOpen={showEquipmentCatalog}
        onClose={() => setShowEquipmentCatalog(false)}
        onSubmitRequest={handleEquipmentRequest}
      />

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSubmitRequest={handleDonationRequest}
      />

      {/* Coach Rating Modal */}
      <CoachRating
        isOpen={showCoachRating}
        onClose={() => setShowCoachRating(false)}
        coach={selectedCoach}
        hire={selectedHire}
        onSubmitRating={handleRateCoach}
      />

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        recipient={selectedPost}
        onSubmitTip={handleTipUser}
      />
    </div>
  );
}

// Wrap with providers
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TribeFitApp />
      </AuthProvider>
    </ToastProvider>
  );
}