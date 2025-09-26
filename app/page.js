'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { 
  Home, Rss, Users, TrophyIcon, User, 
  Zap, Play, SkipForward, Coins, 
  Settings, Bell, ChevronRight,
  DollarSign, Clock, Target, Plus,
  Gift, Share2, Timer, Dumbbell,
  Award, UserCheck, LogOut, Copy,
  CheckCircle, Camera, Send
} from 'lucide-react';
import { t, formatTC, showLocalEquivalent, getUserLocale } from '@/lib/i18n';
import { supabase, isUsingMockData } from '@/lib/supabase';
import AuthForm from '@/components/auth/AuthForm';

export default function TribeFitApp() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // App state
  const [currentTab, setCurrentTab] = useState('home');
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [tribes, setTribes] = useState([]);
  const [activeTribe, setActiveTribe] = useState(null);
  const [pactWallet, setPactWallet] = useState(null);
  const [pactTransactions, setPactTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [posts, setPosts] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [locale, setLocale] = useState('en');
  
  // Modal states
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showTribeModal, setShowTribeModal] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showSpendModal, setShowSpendModal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Form states
  const [tribeName, setTribeName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [topUpAmount, setTopUpAmount] = useState(100);
  const [spendAmount, setSpendAmount] = useState('');
  const [spendLabel, setSpendLabel] = useState('');
  const [gymName, setGymName] = useState('');
  const [shrinkMinutes, setShrinkMinutes] = useState(30);
  const [shareCaption, setShareCaption] = useState('');
  
  // Workout state
  const [activeSession, setActiveSession] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [repsCompleted, setRepsCompleted] = useState('');
  const [todayPlan, setTodayPlan] = useState(null);
  
  // UI state
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [loading, setLoading] = useState({});
  
  const { toast } = useToast();

  // Check authentication on load
  useEffect(() => {
    checkAuth();
    setLocale(getUserLocale());
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAppData();
    }
  }, [isAuthenticated, user]);

  const checkAuth = async () => {
    try {
      if (isUsingMockData) {
        // In mock mode, automatically sign in
        setIsAuthenticated(true);
        loadUserData();
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        await loadUserData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/current');
      const data = await response.json();
      setUser(data.user);
      setWalletBalance(data.user.wallet_balance_tc);
      
      // Set active tribe from settings
      const activeTribeId = data.user.settings?.active_tribe_id;
      if (activeTribeId) {
        await loadTribeData(activeTribeId);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadAppData = async () => {
    try {
      await Promise.all([
        loadTribes(),
        loadNotifications(),
        loadPosts(),
        loadTodayPlan(),
        loadCoaches()
      ]);
    } catch (error) {
      console.error('Failed to load app data:', error);
    }
  };

  const loadTribes = async () => {
    try {
      const response = await fetch('/api/tribes');
      const data = await response.json();
      setTribes(data || []);
      
      // Set first tribe as active if none set
      if (data?.length > 0 && !activeTribe) {
        await loadTribeData(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load tribes:', error);
    }
  };

  const loadTribeData = async (tribeId) => {
    try {
      const [walletResponse, txResponse] = await Promise.all([
        fetch(`/api/pact/wallet?tribe_id=${tribeId}`),
        fetch(`/api/pact/ledger?tribe_id=${tribeId}`)
      ]);
      
      const walletData = await walletResponse.json();
      const ledgerData = await txResponse.json();
      
      setPactWallet(walletData);
      setPactTransactions(ledgerData.transactions || []);
      
      // Find and set active tribe
      const tribe = tribes.find(t => t.id === tribeId) || { id: tribeId, name: 'Founders Tribe' };
      setActiveTribe(tribe);
    } catch (error) {
      console.error('Failed to load tribe data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const tribeId = activeTribe?.id || user?.settings?.active_tribe_id;
      const url = tribeId ? `/api/posts/feed?tribe_id=${tribeId}` : '/api/posts/feed';
      const response = await fetch(url);
      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const loadTodayPlan = async () => {
    try {
      const response = await fetch('/api/workout/today');
      const data = await response.json();
      setTodayPlan(data);
    } catch (error) {
      console.error('Failed to load today plan:', error);
    }
  };

  const loadCoaches = async () => {
    try {
      const response = await fetch('/api/coach/list');
      const data = await response.json();
      setCoaches(data || []);
    } catch (error) {
      console.error('Failed to load coaches:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      if (!isUsingMockData) {
        await supabase.auth.signOut();
      }
      setIsAuthenticated(false);
      setUser(null);
      setTribes([]);
      setActiveTribe(null);
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully'
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleSkip = async (method) => {
    if (method === 'ad') {
      setIsAdPlaying(true);
      setAdProgress(0);
      
      const adInterval = setInterval(() => {
        setAdProgress(prev => {
          if (prev >= 100) {
            clearInterval(adInterval);
            setIsAdPlaying(false);
            completeSkip('ad');
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return;
    }
    
    completeSkip(method);
  };

  const completeSkip = async (method) => {
    try {
      const response = await fetch('/api/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          method,
          tribeId: activeTribe?.id
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setWalletBalance(result.new_balance);
        setPactWallet(prev => ({ ...prev, balance_tc: result.pact_balance }));
        setShowSkipModal(false);
        
        toast({
          title: method === 'pay' ? 'Skip Payment Complete' : 'Ad Watched',
          description: result.notification || `Successfully ${method === 'pay' ? 'paid to' : 'watched ad to'} skip workout`
        });
        
        await Promise.all([loadTribeData(activeTribe?.id), loadNotifications()]);
      } else {
        toast({
          title: 'Skip Failed',
          description: result.error || 'Something went wrong',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Skip failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to process skip',
        variant: 'destructive'
      });
    }
  };

  const handleTopUp = async (amount) => {
    setLoading({ ...loading, topup: true });
    try {
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountTc: amount })
      });
      
      const result = await response.json();
      
      if (result.success || result.client_secret) {
        if (result.mock_mode) {
          setWalletBalance(result.new_balance);
          toast({
            title: 'Top-up Successful',
            description: `Added ${formatTC(amount)} to your wallet (Demo Mode)`
          });
        } else {
          toast({
            title: 'Payment Processing',
            description: 'Redirecting to payment...'
          });
          // In real app, integrate Stripe Elements here
        }
        setShowTopUpModal(false);
      }
    } catch (error) {
      console.error('Top-up failed:', error);
      toast({
        title: 'Top-up Failed',
        description: 'Failed to process top-up',
        variant: 'destructive'
      });
    } finally {
      setLoading({ ...loading, topup: false });
    }
  };

  const handleCreateTribe = async () => {
    if (!tribeName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a tribe name',
        variant: 'destructive'
      });
      return;
    }

    setLoading({ ...loading, createTribe: true });
    try {
      const response = await fetch('/api/tribe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tribeName.trim() })
      });
      
      const result = await response.json();
      
      if (result.tribe) {
        await loadTribes();
        await loadTribeData(result.tribe.id);
        
        toast({
          title: 'Tribe Created!',
          description: `Welcome to ${result.tribe.name}! Invite code: ${result.invite_code || result.tribe.invite_code}`
        });
        
        setShowTribeModal('');
        setTribeName('');
        setCurrentTab('pact');
      }
    } catch (error) {
      console.error('Create tribe failed:', error);
      toast({
        title: 'Failed to Create Tribe',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setLoading({ ...loading, createTribe: false });
    }
  };

  const handleJoinTribe = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter an invite code',
        variant: 'destructive'
      });
      return;
    }

    setLoading({ ...loading, joinTribe: true });
    try {
      const response = await fetch('/api/tribe/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() })
      });
      
      const result = await response.json();
      
      if (result.tribe) {
        await loadTribes();
        await loadTribeData(result.tribe.id);
        
        toast({
          title: result.already_member ? 'Already a Member' : 'Joined Tribe!',
          description: `Welcome to ${result.tribe.name}!`
        });
        
        setShowTribeModal('');
        setInviteCode('');
        setCurrentTab('pact');
      }
    } catch (error) {
      console.error('Join tribe failed:', error);
      toast({
        title: 'Failed to Join Tribe',
        description: error.response?.data?.error || 'Invalid invite code',
        variant: 'destructive'
      });
    } finally {
      setLoading({ ...loading, joinTribe: false });
    }
  };

  const handleStartWorkout = async () => {
    if (!todayPlan?.program) {
      toast({
        title: 'No Workout Plan',
        description: 'No workout plan available for today',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/workout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: todayPlan.program.id })
      });
      
      const result = await response.json();
      
      if (result.session) {
        setActiveSession(result.session);
        const exercises = todayPlan.program.days[todayPlan.day]?.exercises || [];
        if (exercises.length > 0) {
          const firstExercise = todayPlan.exercises.find(ex => ex.id === exercises[0].exercise_id);
          setCurrentExercise({ ...firstExercise, ...exercises[0] });
          setCurrentSet(1);
        }
        setShowWorkoutModal('active');
        
        toast({
          title: 'Workout Started!',
          description: 'Ready to get stronger with your tribe'
        });
      }
    } catch (error) {
      console.error('Start workout failed:', error);
      toast({
        title: 'Failed to Start Workout',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const handleLogSet = async () => {
    if (!repsCompleted) {
      toast({
        title: 'Missing Reps',
        description: 'Please enter the number of reps completed',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/workout/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          exerciseId: currentExercise.id,
          reps_done: parseInt(repsCompleted)
        })
      });
      
      const result = await response.json();
      
      if (result.set) {
        toast({ title: `Set ${currentSet} Logged!`, description: `${repsCompleted} reps completed` });
        
        // Move to next set or exercise
        if (currentSet < currentExercise.sets) {
          setCurrentSet(currentSet + 1);
          setRepsCompleted('');
        } else {
          // Move to next exercise or finish
          const exercises = todayPlan.program.days[todayPlan.day]?.exercises || [];
          const currentIndex = exercises.findIndex(ex => ex.exercise_id === currentExercise.id);
          
          if (currentIndex < exercises.length - 1) {
            const nextExercise = todayPlan.exercises.find(ex => ex.id === exercises[currentIndex + 1].exercise_id);
            setCurrentExercise({ ...nextExercise, ...exercises[currentIndex + 1] });
            setCurrentSet(1);
            setRepsCompleted('');
          } else {
            // Workout complete
            await handleFinishWorkout();
          }
        }
      }
    } catch (error) {
      console.error('Log set failed:', error);
      toast({
        title: 'Failed to Log Set',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const handleFinishWorkout = async () => {
    try {
      const response = await fetch('/api/workout/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          duration_s: 2700, // 45 minutes mock
          kcal: 300
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowWorkoutModal('complete');
        setActiveSession(null);
        setCurrentExercise(null);
        
        toast({
          title: 'Workout Complete! 💪',
          description: 'Great job staying strong with your tribe!'
        });
      }
    } catch (error) {
      console.error('Finish workout failed:', error);
    }
  };

  const handleShrinkWorkout = async () => {
    try {
      const response = await fetch('/api/workout/shrink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: shrinkMinutes })
      });
      
      const result = await response.json();
      
      if (result.shrunk_plan) {
        // Start workout with shrunken plan
        setShowWorkoutModal('');
        toast({
          title: 'Workout Shrunk!',
          description: `Adapted to ${shrinkMinutes} minutes. Let's do this!`
        });
        await handleStartWorkout();
      }
    } catch (error) {
      console.error('Shrink workout failed:', error);
      toast({
        title: 'Shrink Failed',
        description: 'Could not adapt workout',
        variant: 'destructive'
      });
    }
  };

  const handleShareWorkout = async () => {
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tribeId: activeTribe?.id,
          caption: shareCaption || `Just completed ${todayPlan?.program?.title}! 💪 #TribeFit`
        })
      });
      
      const result = await response.json();
      
      if (result.post) {
        await loadPosts();
        setShowShareModal(false);
        setShowWorkoutModal('');
        setShareCaption('');
        
        toast({
          title: 'Workout Shared!',
          description: 'Your tribe can see your progress'
        });
        
        setCurrentTab('feed');
      }
    } catch (error) {
      console.error('Share workout failed:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share workout',
        variant: 'destructive'
      });
    }
  };

  const handleSpendRequest = async (type) => {
    if (!spendLabel.trim() || !spendAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/pact/spend/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          label: spendLabel.trim(),
          amount_tc: parseFloat(spendAmount),
          gym_name: type === 'donation' ? gymName.trim() : null
        })
      });
      
      const result = await response.json();
      
      if (result.request) {
        await loadTribeData(activeTribe?.id);
        setShowSpendModal('');
        setSpendLabel('');
        setSpendAmount('');
        setGymName('');
        
        toast({
          title: 'Request Submitted!',
          description: `${type === 'gear' ? 'Gear purchase' : 'Gym donation'} request sent to tribe admins`
        });
        
        setCurrentTab('pact');
      }
    } catch (error) {
      console.error('Spend request failed:', error);
      toast({
        title: 'Request Failed',
        description: 'Could not submit request',
        variant: 'destructive'
      });
    }
  };

  const toggleSnitchMode = async () => {
    const newSetting = !user?.settings?.snitch;
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snitch: newSetting })
      });
      
      setUser(prev => ({
        ...prev,
        settings: { ...prev.settings, snitch: newSetting }
      }));
      
      toast({
        title: newSetting ? 'Snitch Mode ON' : 'Snitch Mode OFF',
        description: newSetting ? 'Your tribe will be notified when you skip' : 'Skip notifications disabled'
      });
    } catch (error) {
      console.error('Failed to toggle snitch mode:', error);
    }
  };

  // Show auth form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common.loading', {}, locale)}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={() => { setIsAuthenticated(true); checkAuth(); }} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const renderHome = () => (
    <div className="space-y-6">
      {/* Header with Wallet */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.home', {}, locale)}</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
          {activeTribe && (
            <p className="text-sm text-muted-foreground">Active tribe: {activeTribe.name}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">{t('wallet.balance', {}, locale)}</div>
          <div className="text-lg font-semibold">{formatTC(walletBalance, locale)}</div>
          <div className="text-xs text-muted-foreground">{showLocalEquivalent(walletBalance, locale)}</div>
        </div>
      </div>

      {/* Today's Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t('workout.today_plan', {}, locale)}
          </CardTitle>
          <CardDescription>
            {todayPlan?.program?.title || 'Full Body Strength'} • {todayPlan?.program?.description || '45 min'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button size="lg" className="flex-1" onClick={handleStartWorkout}>
              <Play className="w-4 h-4 mr-2" />
              {t('workout.start', {}, locale)}
            </Button>
            <Button variant="outline" size="lg" onClick={() => setShowWorkoutModal('shrink')}>
              <Timer className="w-4 h-4 mr-2" />
              {t('workout.shrink', {}, locale)}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowSkipModal(true)}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <div className="text-2xl font-bold">7 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Tribe</span>
            </div>
            <div className="text-2xl font-bold">{activeTribe?.name || 'No Tribe'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="text-sm p-2 bg-muted rounded">
                  <div className="font-medium">{notif.title}</div>
                  <div>{notif.body || notif.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFeed = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('nav.feed', {}, locale)}</h1>
        <Button onClick={() => setShowShareModal(true)}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Update
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Rss className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete a workout and share it with your tribe!
            </p>
            <Button onClick={() => setCurrentTab('home')}>
              <Dumbbell className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">{post.users?.name || 'User'}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{post.caption}</p>
                {post.media_url && (
                  <div className="mt-3 bg-muted rounded-lg h-48 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    <Zap className="w-4 h-4 mr-1" />
                    {post.likes_count || 0}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    {post.comments_count || 0}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Gift className="w-4 h-4 mr-1" />
                    Tip TC
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPact = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('pact.title', {}, locale)}</h1>
        {!activeTribe && (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setShowTribeModal('create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Tribe
            </Button>
            <Button onClick={() => setShowTribeModal('join')}>
              Join Tribe
            </Button>
          </div>
        )}
      </div>

      {!activeTribe ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Join or Create a Tribe</h3>
            <p className="text-muted-foreground mb-4">
              Tribes keep you accountable and pool skip fees for gear!
            </p>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setShowTribeModal('create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Tribe
              </Button>
              <Button onClick={() => setShowTribeModal('join')}>
                Join Tribe
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pact Wallet Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{activeTribe.name}</span>
                <Badge variant="secondary">{formatTC(pactWallet?.balance_tc || 0)}</Badge>
              </CardTitle>
              <CardDescription>
                {t('pact.goal', { goal: pactWallet?.goal_label || 'Equipment Fund' }, locale)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => setShowSpendModal('gear')}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t('pact.spend_on_gear', {}, locale)}
                </Button>
                <Button variant="outline" onClick={() => setShowSpendModal('donation')}>
                  <Gift className="w-4 h-4 mr-2" />
                  Donate to Gym
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pactTransactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No transactions yet. Skip a workout to fund the pact!
                  </p>
                ) : (
                  pactTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{tx.user_name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {tx.type === 'skip' ? (
                            tx.meta?.method === 'ad' ? 'Watched ad to skip' : 'Paid to skip'
                          ) : tx.type === 'spend' ? 'Gear purchase' : tx.type === 'donate' ? 'Gym donation' : tx.type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${tx.amount_tc > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount_tc > 0 ? '+' : ''}{formatTC(Math.abs(tx.amount_tc))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('nav.coach', {}, locale)}</h1>
        <Button variant="outline">
          <UserCheck className="w-4 h-4 mr-2" />
          Become a Coach
        </Button>
      </div>

      {coaches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Coach Marketplace</h3>
            <p className="text-muted-foreground mb-4">
              Find certified coaches or apply to become one yourself!
            </p>
            <Button>
              <UserCheck className="w-4 h-4 mr-2" />
              Apply to Coach
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coaches.map((coach) => (
            <Card key={coach.user_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold">{coach.user?.name || coach.users?.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {coach.tier} Coach • ⭐ {coach.rating_avg?.toFixed(1) || 'New'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={coach.tier === 'pro' ? 'default' : 'secondary'}>
                    {coach.tier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {coach.bio || 'Certified fitness coach specializing in strength training'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Languages:</span> {coach.languages?.join(', ') || 'English'}
                  </div>
                  <Button size="sm">
                    <Coins className="w-4 h-4 mr-1" />
                    Hire Coach
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('nav.profile', {}, locale)}</h1>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Wallet Balance */}
            <div className="flex justify-between items-center">
              <span>Wallet Balance</span>
              <div className="text-right">
                <div className="font-semibold">{formatTC(walletBalance)}</div>
                <div className="text-sm text-muted-foreground">{showLocalEquivalent(walletBalance, locale)}</div>
              </div>
            </div>
            
            {/* Top-up Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000].map(amount => (
                <Button 
                  key={amount}
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setTopUpAmount(amount);
                    setShowTopUpModal(true);
                  }}
                >
                  +{formatTC(amount)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tribes */}
      <Card>
        <CardHeader>
          <CardTitle>My Tribes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tribes.length === 0 ? (
              <p className="text-muted-foreground text-center">No tribes joined yet</p>
            ) : (
              tribes.map((tribe) => (
                <div key={tribe.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{tribe.name}</div>
                    <div className="text-sm text-muted-foreground">Role: {tribe.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTribe?.id === tribe.id && (
                      <Badge variant="default">Active</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Snitch Mode Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Snitch Mode</div>
                <div className="text-sm text-muted-foreground">
                  Notify your tribe when you skip workouts
                </div>
              </div>
              <Switch 
                checked={user.settings?.snitch || false}
                onCheckedChange={toggleSnitchMode}
              />
            </div>
            
            {/* Language Selector */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Language</div>
                <div className="text-sm text-muted-foreground">
                  App display language
                </div>
              </div>
              <div className="flex gap-2">
                {['en', 'fr', 'ja'].map(lang => (
                  <Button
                    key={lang}
                    variant={locale === lang ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setLocale(lang);
                      localStorage.setItem('tribefit_locale', lang);
                    }}
                  >
                    {lang.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-lg">{t('app.name', {}, locale)}</div>
                <div className="text-xs text-muted-foreground">{t('app.tagline', {}, locale)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                {formatTC(walletBalance)}
              </Badge>
              {notifications.filter(n => !n.read).length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
                  <Bell className="w-4 h-4" />
                  <Badge variant="destructive" className="ml-1 px-1 text-xs">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.home', {}, locale)}</span>
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Rss className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.feed', {}, locale)}</span>
            </TabsTrigger>
            <TabsTrigger value="pact" className="flex items-center gap-2">
              <TrophyIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.pact', {}, locale)}</span>
            </TabsTrigger>
            <TabsTrigger value="coach" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.coach', {}, locale)}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.profile', {}, locale)}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">{renderHome()}</TabsContent>
          <TabsContent value="feed">{renderFeed()}</TabsContent>
          <TabsContent value="pact">{renderPact()}</TabsContent>
          <TabsContent value="coach">{renderCoach()}</TabsContent>
          <TabsContent value="profile">{renderProfile()}</TabsContent>
        </Tabs>
      </main>

      {/* Skip Modal - Core "Aha" Feature */}
      <Dialog open={showSkipModal} onOpenChange={setShowSkipModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('skip.title', {}, locale)}</DialogTitle>
            <DialogDescription>
              {t('skip.prompt', {}, locale)}
            </DialogDescription>
          </DialogHeader>
          
          {isAdPlaying ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <p className="font-medium">Playing Advertisement...</p>
                <p className="text-sm text-muted-foreground">Please wait for the ad to complete</p>
              </div>
              <Progress value={adProgress} className="w-full" />
              <p className="text-center text-sm">{Math.round(adProgress)}% complete</p>
            </div>
          ) : (
            <DialogFooter className="flex-col sm:flex-col space-y-2">
              <Button 
                onClick={() => handleSkip('pay')}
                className="w-full"
                disabled={walletBalance < parseInt(process.env.SKIP_FEE_TC || '100')}
              >
                <Coins className="w-4 h-4 mr-2" />
                {t('skip.pay_button', {}, locale)}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSkip('ad')}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                {t('skip.watch_ad_button', {}, locale)}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowSkipModal(false)}
                className="w-full"
              >
                {t('skip.cancel', {}, locale)}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Tribe Modals */}
      <Dialog open={!!showTribeModal} onOpenChange={() => setShowTribeModal('')}>
        <DialogContent>
          {showTribeModal === 'create' ? (
            <>
              <DialogHeader>
                <DialogTitle>Create Tribe</DialogTitle>
                <DialogDescription>
                  Start your own fitness tribe and invite friends to stay accountable together.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tribe-name">Tribe Name</Label>
                  <Input
                    id="tribe-name"
                    placeholder="e.g., Morning Warriors"
                    value={tribeName}
                    onChange={(e) => setTribeName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTribeModal('')}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTribe} disabled={loading.createTribe}>
                  {loading.createTribe ? 'Creating...' : 'Create Tribe'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Join Tribe</DialogTitle>
                <DialogDescription>
                  Enter an invite code to join an existing tribe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="e.g., FOUNDERS"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTribeModal('')}>
                  Cancel
                </Button>
                <Button onClick={handleJoinTribe} disabled={loading.joinTribe}>
                  {loading.joinTribe ? 'Joining...' : 'Join Tribe'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Top-up Modal */}
      <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up TribeCoins</DialogTitle>
            <DialogDescription>
              Add TribeCoins to your wallet for skips, tips, and coach payments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[100, 500, 1000].map(amount => (
                <Button
                  key={amount}
                  variant={topUpAmount === amount ? 'default' : 'outline'}
                  onClick={() => setTopUpAmount(amount)}
                  className="flex-col h-16"
                >
                  <span className="font-bold">{formatTC(amount)}</span>
                  <span className="text-xs">{showLocalEquivalent(amount, locale)}</span>
                </Button>
              ))}
            </div>
            <div>
              <Label htmlFor="custom-amount">Custom Amount</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopUpModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleTopUp(topUpAmount)} disabled={loading.topup}>
              {loading.topup ? 'Processing...' : `Top Up ${formatTC(topUpAmount)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spend Modal */}
      <Dialog open={!!showSpendModal} onOpenChange={() => setShowSpendModal('')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showSpendModal === 'gear' ? 'Request Gear Purchase' : 'Request Gym Donation'}</DialogTitle>
            <DialogDescription>
              Request to spend pact wallet funds on {showSpendModal === 'gear' ? 'equipment' : 'gym donation'}.
              Tribe admins will need to approve this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="spend-label">{showSpendModal === 'gear' ? 'Equipment Description' : 'Donation Purpose'}</Label>
              <Input
                id="spend-label"
                placeholder={showSpendModal === 'gear' ? 'e.g., Dumbbells 20kg set' : 'e.g., Local gym equipment fund'}
                value={spendLabel}
                onChange={(e) => setSpendLabel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="spend-amount">Amount (TC)</Label>
              <Input
                id="spend-amount"
                type="number"
                placeholder="Enter amount"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
              />
            </div>
            {showSpendModal === 'donation' && (
              <div>
                <Label htmlFor="gym-name">Gym Name (Optional)</Label>
                <Input
                  id="gym-name"
                  placeholder="e.g., Gold's Gym Downtown"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSpendModal('')}>
              Cancel
            </Button>
            <Button onClick={() => handleSpendRequest(showSpendModal)}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workout Modals */}
      <Dialog open={!!showWorkoutModal} onOpenChange={() => setShowWorkoutModal('')}>
        <DialogContent className="max-w-md">
          {showWorkoutModal === 'shrink' ? (
            <>
              <DialogHeader>
                <DialogTitle>Shrink Workout</DialogTitle>
                <DialogDescription>
                  How many minutes do you have? We'll adapt the workout to fit your schedule.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shrink-minutes">Available Minutes</Label>
                  <Select value={shrinkMinutes.toString()} onValueChange={(value) => setShrinkMinutes(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWorkoutModal('')}>
                  Cancel
                </Button>
                <Button onClick={handleShrinkWorkout}>
                  <Timer className="w-4 h-4 mr-2" />
                  Shrink & Start
                </Button>
              </DialogFooter>
            </>
          ) : showWorkoutModal === 'active' && currentExercise ? (
            <>
              <DialogHeader>
                <DialogTitle>{currentExercise.name}</DialogTitle>
                <DialogDescription>
                  Set {currentSet} of {currentExercise.sets} • Target: {currentExercise.reps_target} reps
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {currentExercise.cues?.[0] || 'Focus on proper form'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="reps-completed">Reps Completed</Label>
                  <Input
                    id="reps-completed"
                    type="number"
                    placeholder={`Target: ${currentExercise.reps_target}`}
                    value={repsCompleted}
                    onChange={(e) => setRepsCompleted(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWorkoutModal('')}>
                  End Workout
                </Button>
                <Button onClick={handleLogSet}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Log Set
                </Button>
              </DialogFooter>
            </>
          ) : showWorkoutModal === 'complete' ? (
            <>
              <DialogHeader>
                <DialogTitle>Workout Complete! 🎉</DialogTitle>
                <DialogDescription>
                  Great job staying strong with your tribe! Share your progress?
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <p className="font-medium mb-2">Workout Summary</p>
                <p className="text-sm text-muted-foreground">
                  Duration: 45 minutes • Calories: ~300 • Exercises: 3
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWorkoutModal('')}>
                  Done
                </Button>
                <Button onClick={() => { setShowWorkoutModal(''); setShowShareModal(true); }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share with Tribe
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share with Tribe</DialogTitle>
            <DialogDescription>
              Share your workout progress with your tribe to keep everyone motivated!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="share-caption">Caption</Label>
              <Input
                id="share-caption"
                placeholder="Just completed Full Body Strength! 💪 #TribeFit"
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Camera className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1 text-sm text-muted-foreground">
                Photo upload coming soon
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareWorkout}>
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Stay updated with your tribe's activity
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No notifications yet
              </p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-3 border rounded ${notif.read ? 'bg-muted/50' : 'bg-background'}`}>
                  <div className="font-medium text-sm">{notif.title}</div>
                  <div className="text-sm text-muted-foreground">{notif.body || notif.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowNotifications(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}