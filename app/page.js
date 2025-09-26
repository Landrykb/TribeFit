'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { 
  Home, Rss, Users, TrophyIcon, User, 
  Zap, Play, SkipForward, Coins, 
  Settings, Bell, ChevronRight,
  DollarSign, Clock, Target
} from 'lucide-react';
import { t, formatTC, showLocalEquivalent, getUserLocale } from '@/lib/i18n';

export default function TribeFitApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [pactWallet, setPactWallet] = useState(null);
  const [pactTransactions, setPactTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [locale, setLocale] = useState('en');
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const { toast } = useToast();

  // Load data on mount
  useEffect(() => {
    loadUserData();
    loadPactData();
    loadNotifications();
    setLocale(getUserLocale());
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/current');
      const data = await response.json();
      setUser(data.user);
      setWalletBalance(data.user.wallet_balance_tc);
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Fallback to mock data for demo
      const mockUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo1@tribefit.app',
        name: 'Alex Chen',
        wallet_balance_tc: 500,
        settings: { snitch: true, privacy: 'friends' }
      };
      setUser(mockUser);
      setWalletBalance(mockUser.wallet_balance_tc);
    }
  };

  const loadPactData = async () => {
    try {
      // Load pact wallet
      const walletResponse = await fetch('/api/pact/wallet?tribe_id=10000000-0000-0000-0000-000000000001');
      const walletData = await walletResponse.json();
      setPactWallet(walletData);
      
      // Load transactions 
      const txResponse = await fetch('/api/pact/transactions?wallet_id=20000000-0000-0000-0000-000000000001');
      const txData = await txResponse.json();
      setPactTransactions(txData);
    } catch (error) {
      console.error('Failed to load pact data:', error);
      // Fallback to mock data
      setPactWallet({
        id: '20000000-0000-0000-0000-000000000001',
        tribe_id: '10000000-0000-0000-0000-000000000001',
        balance_tc: 300,
        goal_label: 'Dumbbells 20kg Set'
      });
      setPactTransactions([
        {
          id: '30000000-0000-0000-0000-000000000001',
          user_name: 'Jordan Kim',
          type: 'skip',
          amount_tc: 100,
          meta: { method: 'pay' },
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '30000000-0000-0000-0000-000000000002',
          user_name: 'Alex Chen',
          type: 'skip',
          amount_tc: 100,
          meta: { method: 'ad' },
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleSkip = async (method) => {
    if (method === 'ad') {
      // Simulate ad playback
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
          return prev + 5; // 5% every 100ms = 2 second ad
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
          tribeId: '10000000-0000-0000-0000-000000000001'
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setWalletBalance(result.new_balance);
        setPactWallet(prev => ({ ...prev, balance_tc: result.pact_balance }));
        setShowSkipModal(false);
        
        toast({
          title: method === 'pay' ? t('skip.paid_success', {}, locale) : t('skip.ad_success', {}, locale),
          description: result.notification || (method === 'pay' ? 
            `Paid ${process.env.SKIP_FEE_TC || 100} TC to skip` : 
            'Watched ad successfully!'
          )
        });
        
        // Reload data
        loadPactData();
        loadNotifications();
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
    try {
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, amountTc: amount })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setWalletBalance(result.new_balance);
        toast({
          title: 'Top-up Successful',
          description: `Added ${formatTC(amount)} to your wallet`
        });
      }
    } catch (error) {
      console.error('Top-up failed:', error);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common.loading', {}, locale)}</p>
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
          <CardDescription>Full Body Strength • 45 min</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {t('workout.start', {}, locale)}
            </Button>
            <Button variant="outline" size="lg">
              <Clock className="w-4 h-4 mr-2" />
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
            <div className="text-2xl font-bold">Founders</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif, idx) => (
                <div key={idx} className="text-sm p-2 bg-muted rounded">
                  {notif.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPact = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('pact.title', {}, locale)}</h1>
      </div>

      {/* Pact Wallet Overview */}
      {pactWallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Founders Tribe</span>
              <Badge variant="secondary">{formatTC(pactWallet.balance_tc)}</Badge>
            </CardTitle>
            <CardDescription>
              {t('pact.goal', { goal: pactWallet.goal_label }, locale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button className="flex-1">
                <DollarSign className="w-4 h-4 mr-2" />
                {t('pact.spend_on_gear', {}, locale)}
              </Button>
              <Button variant="outline">
                Donate to Gym
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pactTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{tx.user_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {tx.type === 'skip' ? (
                      tx.meta?.method === 'ad' ? 'Watched ad to skip' : 'Paid to skip'
                    ) : tx.type}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">+{formatTC(tx.amount_tc)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('nav.profile', {}, locale)}</h1>
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
                  onClick={() => handleTopUp(amount)}
                >
                  +{formatTC(amount)}
                </Button>
              ))}
            </div>
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
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.coach', {}, locale)}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.profile', {}, locale)}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">{renderHome()}</TabsContent>
          <TabsContent value="feed">
            <div className="text-center py-12">
              <Rss className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Feed Coming Soon</h3>
              <p className="text-muted-foreground">Share your workouts and see your tribe's progress</p>
            </div>
          </TabsContent>
          <TabsContent value="pact">{renderPact()}</TabsContent>
          <TabsContent value="coach">
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Coach Marketplace Coming Soon</h3>
              <p className="text-muted-foreground">Find certified coaches and earn by training others</p>
            </div>
          </TabsContent>
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

      <Toaster />
    </div>
  );
}