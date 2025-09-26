'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, Rss, Wallet, Users, User, Bell, Plus, Coins, 
  ShoppingCart, Heart, Clock, Target, Trophy, Zap,
  Play, SkipForward, Share, Gift, Star, UserPlus
} from 'lucide-react';

// Import new components
import { EquipmentCatalog } from '../components/ui/EquipmentCatalog';
import { DonationModal } from '../components/ui/DonationModal';
import { CoachRating, StarDisplay } from '../components/ui/CoachRating';
import { TipModal } from '../components/ui/TipModal';

export default function TribeFitApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showAdVideo, setShowAdVideo] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [walletBalance, setWalletBalance] = useState(500);
  const [pactBalance, setPactBalance] = useState(300);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // States for new post modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [showEquipmentCatalog, setShowEquipmentCatalog] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showCoachRating, setShowCoachRating] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedHire, setSelectedHire] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load user data
      const userResponse = await fetch('/api/user/current');
      const userData = await userResponse.json();
      setUser(userData.user);

      // Load wallet balance
      const walletResponse = await fetch('/api/wallet/balance');
      const walletData = await walletResponse.json();
      setWalletBalance(walletData.balance_tc);

      // Load workout plan
      const workoutResponse = await fetch('/api/workout/today');
      const workoutData = await workoutResponse.json();
      setWorkoutPlan(workoutData);

      // Load coaches
      const coachResponse = await fetch('/api/coach/list');
      const coachData = await coachResponse.json();
      setCoaches(coachData);

      // Load feed posts
      const postsResponse = await fetch('/api/posts/feed');
      const postsData = await postsResponse.json();
      setPosts(postsData);

      // Load notifications
      const notifResponse = await fetch('/api/notifications');
      const notifData = await notifResponse.json();
      setNotifications(notifData);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
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
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Skip failed:', error);
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

  // Handler for equipment catalog submission
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
        alert('Equipment request submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Equipment request failed:', error);
      alert('Failed to submit request');
    }
  };

  // Handler for donation submission
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
        alert('Donation request submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Donation request failed:', error);
      alert('Failed to submit request');
    }
  };

  // Handler for becoming a coach
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
      console.log('Coach apply response:', data);

      if (response.ok) {
        alert('Coach application submitted! We\'ll review it soon. 🏆');
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Coach application failed:', error);
      alert('Failed to submit application: ' + error.message);
    }
  };

  // Handler for hiring a coach
  const handleHireCoach = async (coach) => {
    console.log('Hiring coach:', coach);
    try {
      const response = await fetch('/api/coach/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user?.id,
          coachId: coach.user_id || coach.id,
          offeringId: null, // Could be selected from offerings
          priceTc: coach.pricing?.['1on1'] || 200
        })
      });

      const data = await response.json();
      console.log('Coach hire response:', data);

      if (response.ok) {
        alert(`Coach ${coach.name || 'Coach'} hired successfully! 🎯`);
        // Update wallet balance
        setWalletBalance(prev => prev - (coach.pricing?.['1on1'] || 200));
        setSelectedHire(data.hire);
      } else {
        alert(data.error || 'Failed to hire coach');
      }
    } catch (error) {
      console.error('Coach hire failed:', error);
      alert('Failed to hire coach: ' + error.message);
    }
  };

  // Handler for rating a coach
  const handleRateCoach = async (ratingData) => {
    try {
      const response = await fetch('/api/coach/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });

      if (response.ok) {
        alert('Coach rating submitted!');
        // Reload coaches to get updated rating
        const coachResponse = await fetch('/api/coach/list');
        const coachData = await coachResponse.json();
        setCoaches(coachData);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Coach rating failed:', error);
      alert('Failed to submit rating');
    }
  };

  // Handler for starting workout
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
      console.log('Workout start response:', data);

      if (response.ok) {
        alert('Workout started! Let\'s crush it! 💪');
      } else {
        alert(data.error || 'Failed to start workout');
      }
    } catch (error) {
      console.error('Start workout failed:', error);
      alert('Failed to start workout: ' + error.message);
    }
  };

  // Handler for shrinking workout
  const handleShrinkWorkout = async () => {
    console.log('Shrinking workout...');
    const minutes = prompt('How many minutes do you have?', '30');
    if (!minutes) return;

    try {
      const response = await fetch('/api/workout/shrink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: parseInt(minutes) })
      });

      const data = await response.json();
      console.log('Shrink response:', data);

      if (response.ok) {
        alert(`Workout adjusted to ${minutes} minutes! Starting now...`);
        handleStartWorkout();
      } else {
        alert(data.error || 'Failed to shrink workout');
      }
    } catch (error) {
      console.error('Shrink workout failed:', error);
      alert('Failed to shrink workout: ' + error.message);
    }
  };

  // Handler for sharing posts
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
      console.log('Post create response:', data);

      if (response.ok) {
        alert('Post shared to feed! 🎉');
        // Reload posts
        const postsResponse = await fetch('/api/posts/feed');
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } else {
        alert(data.error || 'Failed to share post');
      }
    } catch (error) {
      console.error('Post share failed:', error);
      alert('Failed to share post: ' + error.message);
    }
  };

  // Handler for liking posts
  const handleLikePost = async (postId) => {
    // For now, just update local state
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes_count: (post.likes_count || 0) + 1 }
        : post
    ));
  };

  // Handler for tipping TribeCoins
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
        alert('TribeCoins sent successfully!');
        setWalletBalance(prev => prev - tipData.amountTc);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send tip');
      }
    } catch (error) {
      console.error('Tip failed:', error);
      alert('Failed to send tip');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading your profile...</div>
      </div>
    );
  }

  const renderHome = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back!</h2>
            <p className="opacity-90">Ready to crush today's workout?</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{walletBalance}</div>
            <div className="text-sm opacity-90">TribeCoins</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <Trophy size={20} />
              <span className="font-medium">7 Day Streak</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <Users size={20} />
              <span className="font-medium">Founders Tribe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Plan */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Today's Plan</h3>
        {workoutPlan?.program ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">{workoutPlan.program.title}</span>
              <span className="text-blue-400">45 min</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={handleStartWorkout}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-4 flex flex-col items-center space-y-2 transition-all"
              >
                <Play size={24} />
                <span className="text-sm font-medium">Start</span>
              </button>
              <button 
                onClick={handleShrinkWorkout}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl p-4 flex flex-col items-center space-y-2 transition-all"
              >
                <Clock size={24} />
                <span className="text-sm font-medium">Shrink</span>
              </button>
              <button 
                onClick={() => setShowSkipModal(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl p-4 flex flex-col items-center space-y-2 transition-all"
              >
                <SkipForward size={24} />
                <span className="text-sm font-medium">Skip</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No workout planned for today</div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleSharePost('Share today\'s progress! 💪')}
          className="bg-green-600 hover:bg-green-500 text-white rounded-xl p-4 flex items-center justify-center space-x-2 transition-all"
        >
          <Share size={20} />
          <span>Share Today's Progress</span>
        </button>
        <button 
          onClick={() => setShowTipModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl p-4 flex items-center justify-center space-x-2 transition-all"
        >
          <Gift size={20} />
          <span>Tip Friend</span>
        </button>
      </div>
    </div>
  );

  const renderFeed = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tribe Feed</h2>
        <button
          onClick={() => setShowPostModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg p-2 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No posts yet</div>
          <button
            onClick={handleSharePost}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 transition-all"
          >
            Share your first workout! 💪
          </button>
        </div>
      ) : (
        posts.map((post, index) => (
          <div key={index} className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{post.user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <div className="text-white font-medium">{post.user?.name || 'User'}</div>
                <div className="text-gray-400 text-sm">2 hours ago</div>
              </div>
            </div>
            
            {post.media_url && (
              <div className="bg-gray-700 rounded-xl h-48 mb-4 flex items-center justify-center">
                <span className="text-gray-400">📷 Workout Photo</span>
              </div>
            )}
            
            <p className="text-gray-300 mb-4">{post.caption || 'Just finished an awesome workout! 💪'}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Heart size={20} />
                  <span>{post.likes_count || 0}</span>
                </button>
                <button 
                  onClick={() => handleSharePost('Sharing this awesome workout!')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Share size={20} />
                  <span>Share</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedPost({ ...post, post_id: post.id });
                  setShowTipModal(true);
                }}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg transition-all"
              >
                <Coins size={16} />
                <span>Tip TC</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderPact = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Pact Wallet</h2>
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white mb-6">
          <div className="text-3xl font-bold">{pactBalance} TC</div>
          <div className="opacity-90">Tribe Balance</div>
          <div className="mt-2 text-sm opacity-75">Goal: Dumbbells 20kg Set (800 TC)</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowEquipmentCatalog(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-4 flex flex-col items-center space-y-2 transition-all"
          >
            <ShoppingCart size={24} />
            <span className="font-medium">Spend on Gear</span>
          </button>
          <button
            onClick={() => setShowDonationModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl p-4 flex flex-col items-center space-y-2 transition-all"
          >
            <Heart size={24} />
            <span className="font-medium">Donate to Gym</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm">Alex Chen skipped (paid)</div>
                <div className="text-gray-400 text-xs">Yesterday</div>
              </div>
            </div>
            <div className="text-green-400 font-medium">+100 TC</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Coaches</h2>
        <button
          onClick={handleBecomeCoach}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center space-x-2 transition-all"
        >
          <UserPlus size={16} />
          <span>Become a Coach</span>
        </button>
      </div>

      {coaches.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No coaches available</div>
          <button
            onClick={handleBecomeCoach}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 transition-all"
          >
            Be the first coach in your area! 🏆
          </button>
        </div>
      ) : (
        coaches.map((coach, index) => (
          <div key={index} className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {coach.user?.name?.charAt(0) || coach.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-bold">{coach.user?.name || coach.name || 'Coach'}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {coach.tier || 'Certified'}
                    </span>
                    <StarDisplay rating={coach.rating_avg || 0} size={14} />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{coach.bio || 'Professional fitness coach'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold">{coach.pricing?.['1on1'] || 200} TC</div>
                <div className="text-gray-400 text-sm">per session</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleHireCoach(coach)}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 flex-1 transition-all"
              >
                Hire Coach
              </button>
              <button
                onClick={() => {
                  setSelectedCoach(coach);
                  setSelectedHire({ id: 'demo-hire', client_id: user?.id });
                  setShowCoachRating(true);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 flex items-center space-x-2 transition-all"
              >
                <Star size={16} />
                <span>Rate</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No notifications yet</div>
          <p className="text-sm text-gray-500">Stay active and you'll see updates here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">{notification.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{notification.body}</p>
                  <div className="text-gray-500 text-xs mt-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{user?.name?.charAt(0) || 'A'}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.name || 'Alex Chen'}</h2>
            <p className="text-gray-400">{user?.email || 'demo@tribefit.app'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{walletBalance}</div>
            <div className="text-gray-400 text-sm">TribeCoins</div>
          </div>
          <div className="bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">7</div>
            <div className="text-gray-400 text-sm">Day Streak</div>
          </div>
        </div>
      </div>

      <button className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl p-4 transition-all">
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-sm mx-auto bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">TribeFit</h1>
          </div>
          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
          >
            <Bell size={20} className="text-gray-400" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 pb-32">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'feed' && renderFeed()}
          {activeTab === 'pact' && renderPact()}
          {activeTab === 'coach' && renderCoach()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'notifications' && renderNotifications()}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-gray-800 border-t border-gray-700">
          <div className="grid grid-cols-5 gap-1 p-2">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'feed', icon: Rss, label: 'Feed' },
              { id: 'pact', icon: Wallet, label: 'Pact' },
              { id: 'coach', icon: Users, label: 'Coach' },
              { id: 'profile', icon: User, label: 'Profile' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center py-3 px-2 rounded-lg transition-all ${
                  activeTab === id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skip Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Skip Today's Workout?</h3>
              <p className="text-gray-400">Choose how to skip:</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleSkip('pay')}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-xl p-4 transition-all"
              >
                Pay 100 TC to Skip
              </button>
              <button
                onClick={startAdWatch}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-4 transition-all"
              >
                Watch Ad to Skip (Free)
              </button>
              <button
                onClick={() => setShowSkipModal(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-xl p-4 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Video Modal */}
      {showAdVideo && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="w-64 h-36 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-lg">📺 Ad Playing...</span>
            </div>
            <div className="w-64 bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-150" 
                style={{ width: `${adProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">Ad will finish in {Math.ceil((100 - adProgress) / 5 * 0.15)} seconds</p>
          </div>
        </div>
      )}

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-sm w-full">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Create Post</h2>
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setPostCaption('');
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  What's happening?
                </label>
                <textarea
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your workout progress, achievements, or motivation..."
                  rows={4}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setPostCaption('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (postCaption.trim()) {
                      handleSharePost(postCaption.trim());
                      setShowPostModal(false);
                      setPostCaption('');
                    }
                  }}
                  disabled={!postCaption.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-all"
                >
                  Share Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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