import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isUsingMockData } from '@/lib/supabase';
import { 
  getCurrentUser, getUserById, adjustWalletTc, getOrCreateTribeWallet,
  insertPactTx, getUserTribes, listTribeMembers, createTribe, joinByCode,
  getPactWallet, getPactTransactions
} from '@/lib/supabase';
import { i18n } from '@/lib/i18n';
import Stripe from 'stripe';

// Initialize Stripe (only if keys are provided)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && 
    !process.env.STRIPE_SECRET_KEY.includes('placeholder') && 
    !process.env.STRIPE_SECRET_KEY.includes('your_secret_key_here')) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20'
  });
}

// Mock data for demo (fallback)
let mockData = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo1@tribefit.app', 
      name: 'Alex Chen',
      wallet_balance_tc: 400, // Updated from previous skip
      settings: { snitch: true, privacy: 'friends', active_tribe_id: '10000000-0000-0000-0000-000000000001' }
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'demo2@tribefit.app',
      name: 'Jordan Kim', 
      wallet_balance_tc: 250,
      settings: { snitch: true, privacy: 'friends', active_tribe_id: '10000000-0000-0000-0000-000000000001' }
    }
  ],
  tribes: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Founders Tribe',
      description: 'The original TribeFit crew',
      owner_id: '00000000-0000-0000-0000-000000000001',
      invite_code: 'FOUNDERS',
      created_at: new Date().toISOString()
    }
  ],
  pact_wallets: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      tribe_id: '10000000-0000-0000-0000-000000000001',
      balance_tc: 500, // Updated from skips
      goal_label: 'Dumbbells 20kg Set',
      goal_amount_tc: 800
    }
  ],
  pact_tx: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      wallet_id: '20000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      type: 'skip',
      amount_tc: 100,
      meta: { method: 'pay' },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '30000000-0000-0000-0000-000000000002', 
      wallet_id: '20000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      type: 'skip',
      amount_tc: 100,
      meta: { method: 'pay' },
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      user_id: '00000000-0000-0000-0000-000000000002',
      type: 'snitch',
      title: 'Tribe Update',
      body: 'Alex Chen PAID to skip 💸. Your tribe is stronger than excuses.',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: false
    }
  ],
  exercises: [
    {
      id: 'ex-1',
      name: 'Push-up',
      category: 'bodyweight',
      equipment: 'none',
      muscles: ['chest', 'triceps', 'shoulders'],
      cues: ['Keep core tight', 'Full range of motion'],
      difficulty_level: 2
    },
    {
      id: 'ex-2',
      name: 'Squat',
      category: 'bodyweight',
      equipment: 'none', 
      muscles: ['quads', 'glutes', 'hamstrings'],
      cues: ['Chest up', 'Knees track over toes'],
      difficulty_level: 2
    },
    {
      id: 'ex-3',
      name: 'Plank',
      category: 'bodyweight',
      equipment: 'none',
      muscles: ['core', 'shoulders'],
      cues: ['Straight line from head to toe'],
      difficulty_level: 1
    }
  ],
  programs: [
    {
      id: 'prog-1',
      title: 'Full Body Strength',
      description: '45-minute full body workout',
      days: {
        monday: {
          exercises: [
            { exercise_id: 'ex-1', sets: 3, reps_target: 10, rest_s: 60 },
            { exercise_id: 'ex-2', sets: 3, reps_target: 15, rest_s: 60 },
            { exercise_id: 'ex-3', sets: 2, reps_target: 30, rest_s: 30 }
          ]
        }
      },
      difficulty_level: 2,
      public: true
    }
  ],
  posts: [],
  sessions: [],
  pact_spend_requests: [],
  coach_profiles: [
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      tier: 'certified',
      bio: 'Certified trainer specializing in strength and conditioning',
      specialties: ['strength', 'bodyweight'],
      languages: ['en', 'fr'],
      pricing: { '1on1': 50, 'plan': 25 },
      rating_avg: 4.8,
      rating_count: 24
    }
  ],
  coach_offerings: [
    {
      id: 'offer-1',
      coach_id: '00000000-0000-0000-0000-000000000001',
      type: '1on1',
      title: 'Personal Training (4 weeks)',
      description: 'Customized workout plan with weekly check-ins',
      price_tc: 200,
      duration_weeks: 4
    }
  ],
  coach_hires: [],
  coach_ratings: [],
  catalog_items: [
    { slug: 'dumbbell', title: 'Dumbbells', category: 'strength', icon: 'dumbbell', specs: { weights: [5,10,15,20,25,30] }, price_tc: 80 },
    { slug: 'barbell', title: 'Barbell', category: 'strength', icon: 'barbell', specs: { types: ['olympic','curl'] }, price_tc: 150 },
    { slug: 'kettlebell', title: 'Kettlebells', category: 'strength', icon: 'circle-dot', specs: { weights: [8,12,16,24] }, price_tc: 70 },
    { slug: 'bands', title: 'Resistance Bands', category: 'strength', icon: 'link', specs: { levels: ['light','medium','heavy'] }, price_tc: 30 },
    { slug: 'jumprope', title: 'Jump Rope', category: 'cardio', icon: 'rope', specs: { types: ['speed','weighted'] }, price_tc: 20 },
    { slug: 'foamroller', title: 'Foam Roller', category: 'recovery', icon: 'circle', specs: { sizes: ['30cm','60cm'] }, price_tc: 25 },
    { slug: 'yogamat', title: 'Yoga Mat', category: 'recovery', icon: 'layout', specs: { thickness: ['5mm','10mm'] }, price_tc: 40 },
    { slug: 'gloves', title: 'Lifting Gloves', category: 'accessories', icon: 'hand', specs: { sizes: ['S','M','L'] }, price_tc: 25 },
    { slug: 'shaker', title: 'Protein Shaker', category: 'accessories', icon: 'bottle', specs: { sizes: ['500ml','1L'] }, price_tc: 15 },
    { slug: 'protein', title: 'Whey Protein', category: 'nutrition', icon: 'cup-soda', specs: { flavors: ['vanilla','chocolate','strawberry'] }, price_tc: 40 }
  ]
};

// Helper to send snitch notification
const sendSnitchNotification = async (actorName, recipientIds, method, locale = 'en') => {
  const key = method === 'pay' ? 'snitch.paid' : 'snitch.watched_ad';
  const message = i18n.t(key, { name: actorName }, locale);
  
  if (isUsingMockData) {
    // Mock mode - just add to array
    const notification = {
      id: `notif-${Date.now()}`,
      user_id: recipientIds[0], // Just add to first recipient for demo
      type: 'snitch',
      title: 'Tribe Update',
      body: message,
      created_at: new Date().toISOString(),
      read: false
    };
    mockData.notifications.unshift(notification);
    return notification;
  } else {
    // Real mode - insert into database
    try {
      const notifications = recipientIds.map(userId => ({
        user_id: userId,
        type: 'snitch',
        title: 'Tribe Update',
        body: message,
        payload: { actor_name: actorName, method }
      }));
      
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('notifications')
        .insert(notifications)
        .select();
        
      if (error) throw error;
      return { message, count: data?.length || 0 };
    } catch (error) {
      console.error('Error sending snitch notification:', error);
      return { message, error: error.message };
    }
  }
};

// Helper to validate webhook events (idempotency)
const processWebhookEvent = async (eventId, eventType, payload) => {
  if (isUsingMockData) return true;
  
  try {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('webhook_events')
      .select('id')
      .eq('id', eventId)
      .single();
      
    if (data) {
      // Event already processed
      return false;
    }
    
    // Record the event
    await client
      .from('webhook_events')
      .insert({
        id: eventId,
        type: eventType,
        payload,
        source: 'stripe'
      });
      
    return true;
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return false;
  }
};

export async function GET(request, { params }) {
  const path = params.path ? params.path.join('/') : '';
  
  try {
    switch (path) {
      case 'user/current':
        const user = await getCurrentUser();
        return NextResponse.json({
          user,
          isDemo: isUsingMockData
        });
        
      case 'wallet/balance':
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({
          balance_tc: currentUser.wallet_balance_tc || 0,
          formatted: `${currentUser.wallet_balance_tc || 0} TC`
        });
        
      case 'pact/wallet':
        const { searchParams } = new URL(request.url);
        const tribeId = searchParams.get('tribe_id');
        if (!tribeId) {
          return NextResponse.json({ error: 'tribe_id required' }, { status: 400 });
        }
        
        const pactWallet = await getPactWallet(tribeId);
        return NextResponse.json(pactWallet || { balance_tc: 0, goal_label: 'Equipment Fund' });
        
      case 'pact/transactions':
        const walletId = new URL(request.url).searchParams.get('wallet_id');
        if (!walletId) {
          return NextResponse.json({ error: 'wallet_id required' }, { status: 400 });
        }
        
        const transactions = await getPactTransactions(walletId);
        return NextResponse.json(transactions);
        
      case 'pact/ledger':
        const ledgerTribeId = new URL(request.url).searchParams.get('tribe_id');
        if (!ledgerTribeId) {
          return NextResponse.json({ error: 'tribe_id required' }, { status: 400 });
        }
        
        const wallet = await getPactWallet(ledgerTribeId);
        const txHistory = wallet ? await getPactTransactions(wallet.id) : [];
        
        // Get spend requests
        let spendRequests = [];
        if (isUsingMockData) {
          spendRequests = mockData.pact_spend_requests.filter(r => r.wallet_id === wallet?.id);
        } else {
          const { data } = await supabase
            .from('pact_spend_requests')
            .select('*')
            .eq('wallet_id', wallet?.id)
            .order('created_at', { ascending: false });
          spendRequests = data || [];
        }
        
        return NextResponse.json({
          wallet,
          transactions: txHistory,
          spend_requests: spendRequests
        });
        
      case 'notifications':
        if (isUsingMockData) {
          return NextResponse.json(mockData.notifications.slice(-10));
        }
        
        // Get notifications for current user
        const authUser = await getCurrentUser();
        if (!authUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        return NextResponse.json(notifications || []);
        
      case 'tribes':
        const userForTribes = await getCurrentUser();
        if (!userForTribes) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const userTribes = await getUserTribes(userForTribes.id);
        return NextResponse.json(userTribes);
        
      case 'exercises':
        if (isUsingMockData) {
          return NextResponse.json(mockData.exercises);
        }
        
        const { data: exercises } = await supabase
          .from('exercises')
          .select('*')
          .order('name');
          
        return NextResponse.json(exercises || []);
        
      case 'workout/today':
        // Return today's workout plan
        if (isUsingMockData) {
          return NextResponse.json({
            program: mockData.programs[0],
            exercises: mockData.exercises,
            day: 'monday' // Mock today as Monday
          });
        }
        
        // For real implementation, get user's active program
        // This would typically look at user's current program and day of week
        const { data: defaultPrograms } = await supabase
          .from('programs')
          .select('*')
          .eq('public', true)
          .limit(1);
          
        const { data: allExercises } = await supabase
          .from('exercises')
          .select('*');
        
        return NextResponse.json({
          program: defaultPrograms?.[0] || null,
          exercises: allExercises || [],
          day: 'monday' // Could be computed from current day
        });
        
      case 'posts/feed':
        const feedTribeId = new URL(request.url).searchParams.get('tribe_id');
        
        if (isUsingMockData) {
          return NextResponse.json(mockData.posts);
        }
        
        let postsQuery = supabase
          .from('posts')
          .select(`
            *,
            users (name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (feedTribeId) {
          postsQuery = postsQuery.eq('tribe_id', feedTribeId);
        }
        
        const { data: posts } = await postsQuery;
        return NextResponse.json(posts || []);
        
      case 'coach/list':
        const lang = new URL(request.url).searchParams.get('lang') || 'en';
        const goal = new URL(request.url).searchParams.get('goal');
        
        if (isUsingMockData) {
          let coaches = mockData.coach_profiles.filter(c => c.tier !== 'candidate');
          if (goal) {
            coaches = coaches.filter(c => c.specialties?.includes(goal));
          }
          return NextResponse.json(coaches.map(coach => ({
            ...coach,
            user: mockData.users.find(u => u.id === coach.user_id)
          })));
        }
        
        let coachQuery = supabase
          .from('coach_profiles')
          .select(`
            *,
            users (id, name, avatar_url)
          `)
          .in('tier', ['certified', 'pro'])
          .order('rating_avg', { ascending: false });
          
        if (goal) {
          coachQuery = coachQuery.contains('specialties', [goal]);
        }
        
        const { data: coaches } = await coachQuery;
        return NextResponse.json(coaches || []);
        
      case 'coach/offerings':
        const coachId = new URL(request.url).searchParams.get('coach_id');
        if (!coachId) {
          return NextResponse.json({ error: 'coach_id required' }, { status: 400 });
        }
        
        if (isUsingMockData) {
          const offerings = mockData.coach_offerings.filter(o => o.coach_id === coachId);
          return NextResponse.json(offerings);
        }
        
        const { data: offerings } = await supabase
          .from('coach_offerings')
          .select('*')
          .eq('coach_id', coachId)
          .eq('active', true);
          
        return NextResponse.json(offerings || []);

      case 'catalog/list':
        if (isUsingMockData) {
          return NextResponse.json({ items: mockData.catalog_items });
        }
        
        const { data: catalogItems } = await supabase
          .from('catalog_items')
          .select('*')
          .eq('active', true)
          .order('category, title');
          
        return NextResponse.json({ items: catalogItems || [] });
        
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const path = params.path ? params.path.join('/') : '';
  
  try {
    const body = await request.json();
    
    switch (path) {
      case 'skip':
        const { userId, method, tribeId = '10000000-0000-0000-0000-000000000001' } = body;
        const feeTc = parseInt(process.env.DEAL_SKIP_FEE_TC || process.env.SKIP_FEE_TC || '100');
        const donationPct = parseFloat(process.env.DEAL_DONATION_PCT || '0.10');
        const dealSplitEnabled = process.env.FEATURE_DEAL_SPLIT === 'true';
        
        // Get user and validate
        const user = await getUserById(userId) || (isUsingMockData ? mockData.users[0] : null);
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Check sufficient balance for pay method
        if (method === 'pay' && user.wallet_balance_tc < feeTc) {
          return NextResponse.json({ 
            error: 'Insufficient TribeCoins',
            needed: feeTc,
            current: user.wallet_balance_tc 
          }, { status: 402 });
        }
        
        // Get or create pact wallet
        const pactWallet = await getOrCreateTribeWallet(tribeId);
        if (!pactWallet) {
          return NextResponse.json({ error: 'Could not access pact wallet' }, { status: 500 });
        }

        // Get tribe members for deal split
        const tribeMembers = await listTribeMembers(tribeId);
        const activeMembers = tribeMembers.filter(member => member.id !== user.id); // Exclude skipper
        
        // Process the skip
        let updatedUser = user;
        let splitResults = [];
        
        if (method === 'pay') {
          // Deduct from user wallet
          updatedUser = await adjustWalletTc(user.id, feeTc, 'subtract');
          
          if (dealSplitEnabled && activeMembers.length > 0) {
            // NEW DEAL SPLIT LOGIC
            // Calculate split amounts
            const donationAmount = Math.round(feeTc * donationPct);
            const splitTotal = feeTc - donationAmount;
            const splitPerMember = Math.round(splitTotal / activeMembers.length);
            
            // Add donation amount to donation pool
            if (!isUsingMockData) {
              const client = supabaseAdmin || supabase;
              await client
                .from('pact_wallets')
                .update({ 
                  donation_pool_tc: supabase.raw(`COALESCE(donation_pool_tc, 0) + ${donationAmount}`),
                  updated_at: new Date().toISOString()
                })
                .eq('id', pactWallet.id);
            } else {
              pactWallet.donation_pool_tc = (pactWallet.donation_pool_tc || 0) + donationAmount;
            }
            
            // Split remainder among active members
            for (const member of activeMembers) {
              // Credit each member's private wallet
              await adjustWalletTc(member.id, splitPerMember, 'add');
              
              // Record the split transaction
              await insertPactTx(
                pactWallet.id,
                member.id,
                'skip_split',
                splitPerMember,
                { 
                  from_user: user.id,
                  skipper_name: user.name,
                  method: 'receive_split',
                  tribe_id: tribeId 
                }
              );
              
              splitResults.push({
                member_id: member.id,
                member_name: member.name,
                amount_received: splitPerMember
              });
            }
            
            // Record donation accrual
            await insertPactTx(
              pactWallet.id,
              user.id,
              'donation_accrual',
              donationAmount,
              { method: 'skip_fee_split', tribe_id: tribeId }
            );
            
          } else {
            // LEGACY BEHAVIOR (when deal split disabled)
            // Add to pact wallet (old way)
            if (!isUsingMockData) {
              const client = supabaseAdmin || supabase;
              await client
                .from('pact_wallets')
                .update({ 
                  balance_tc: supabase.raw(`balance_tc + ${feeTc}`),
                  updated_at: new Date().toISOString()
                })
                .eq('id', pactWallet.id);
            } else {
              pactWallet.balance_tc += feeTc;
            }
          }
          
          // Record payment
          if (!isUsingMockData) {
            const client = supabaseAdmin || supabase;
            await client
              .from('payments')
              .insert({
                user_id: user.id,
                type: 'skip',
                amount_tc: feeTc,
                amount_cents: feeTc * 100,
                status: 'succeeded',
                metadata: { method: 'pay', tribe_id: tribeId, deal_split: dealSplitEnabled }
              });
          }
        }
        
        // Record main pact transaction
        const transaction = await insertPactTx(
          pactWallet.id,
          user.id,
          'skip',
          feeTc,
          { method, tribe_id: tribeId, split_enabled: dealSplitEnabled }
        );
        
        // Enhanced notifications for deal split
        let notifications = [];
        if (user.settings?.snitch) {
          if (dealSplitEnabled && method === 'pay' && splitResults.length > 0) {
            // Send enhanced notifications for deal split
            
            // To skipper
            const powerUpNames = splitResults.map(r => r.member_name).join(', ');
            const skipperMsg = i18n.t('skip_deal_skipper', {
              names: powerUpNames,
              amount: splitResults[0]?.amount_received || 0
            }, user.locale || 'en');
            
            notifications.push({
              type: 'skip_split_skipper',
              message: skipperMsg,
              recipients: [user.id]
            });
            
            // To each recipient
            for (const result of splitResults) {
              const recipientMsg = i18n.t('skip_deal_recipient', {
                skipper: user.name,
                amount: result.amount_received
              }, user.locale || 'en');
              
              notifications.push({
                type: 'skip_split_received',
                message: recipientMsg,
                recipients: [result.member_id]
              });
            }
          } else {
            // Legacy snitch notification
            const otherMembers = activeMembers.map(member => member.id);
            if (otherMembers.length > 0) {
              const notification = await sendSnitchNotification(
                user.name,
                otherMembers,
                method,
                user.locale || 'en'
              );
              notifications.push({
                type: 'legacy_snitch',
                message: notification?.message || notification?.body,
                recipients: otherMembers
              });
            }
          }
        }
        
        return NextResponse.json({
          success: true,
          transaction,
          notifications,
          split_results: splitResults,
          deal_split_enabled: dealSplitEnabled,
          new_balance: updatedUser?.wallet_balance_tc || user.wallet_balance_tc,
          pact_balance: pactWallet.balance_tc + (method === 'pay' && !dealSplitEnabled ? feeTc : 0),
          donation_pool: pactWallet.donation_pool_tc || 0
        });
        
      case 'wallet/topup':
        const { amountTc, currency = 'USD' } = body;
        const targetUser = await getCurrentUser();
        
        if (!targetUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (!amountTc || amountTc <= 0) {
          return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }
        
        if (stripe) {
          // Real Stripe integration
          const amountCents = Math.round(Number(amountTc) * 100);
          
          try {
            const paymentIntent = await stripe.paymentIntents.create({
              amount: amountCents,
              currency: currency.toLowerCase(),
              automatic_payment_methods: { enabled: true },
              metadata: { 
                user_id: targetUser.id,
                amount_tc: String(amountTc),
                type: 'topup'
              }
            });
            
            return NextResponse.json({
              client_secret: paymentIntent.client_secret,
              payment_intent_id: paymentIntent.id,
              amount_tc: amountTc,
              amount_cents: amountCents
            });
          } catch (stripeError) {
            console.error('Stripe error:', stripeError);
            return NextResponse.json({ 
              error: 'Payment processing failed',
              message: stripeError.message
            }, { status: 500 });
          }
        } else {
          // Mock mode - simulate successful payment
          const updatedUser = await adjustWalletTc(targetUser.id, parseFloat(amountTc), 'add');
          
          return NextResponse.json({
            success: true,
            new_balance: updatedUser?.wallet_balance_tc || (targetUser.wallet_balance_tc + parseFloat(amountTc)),
            charged_amount: amountTc,
            payment_method: 'demo_mode',
            mock_mode: true
          });
        }
        
      case 'stripe/webhook':
        if (!stripe) {
          return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
        }
        
        const sig = request.headers.get('stripe-signature');
        const rawBody = await request.text();
        
        try {
          const event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
          );
          
          // Check if we've already processed this event
          const shouldProcess = await processWebhookEvent(event.id, event.type, event.data);
          if (!shouldProcess) {
            return NextResponse.json({ received: true, processed: false });
          }
          
          if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const userId = paymentIntent.metadata?.user_id;
            const amountTc = Number(paymentIntent.metadata?.amount_tc || 0);
            
            if (userId && amountTc > 0) {
              // Credit user's wallet
              await adjustWalletTc(userId, amountTc, 'add');
              
              // Record payment
              const client = supabaseAdmin || supabase;
              await client
                .from('payments')
                .insert({
                  user_id: userId,
                  type: 'topup',
                  amount_tc: amountTc,
                  amount_cents: paymentIntent.amount,
                  currency: paymentIntent.currency.toUpperCase(),
                  stripe_payment_intent_id: paymentIntent.id,
                  status: 'succeeded'
                });
            }
          }
          
          return NextResponse.json({ received: true, processed: true });
        } catch (err) {
          console.error('Webhook signature verification failed:', err.message);
          return NextResponse.json({ 
            error: 'Webhook signature verification failed' 
          }, { status: 400 });
        }
        
      case 'tribe/create':
        const { name, description = '' } = body;
        const owner = await getCurrentUser();
        
        if (!owner) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (!name || name.trim().length === 0) {
          return NextResponse.json({ error: 'Tribe name required' }, { status: 400 });
        }
        
        try {
          const newTribe = await createTribe(owner.id, name.trim(), description.trim());
          return NextResponse.json({ tribe: newTribe, invite_code: newTribe.invite_code });
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to create tribe',
            message: error.message
          }, { status: 500 });
        }
        
      case 'tribe/join':
        const { inviteCode } = body;
        const joiner = await getCurrentUser();
        
        if (!joiner) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (!inviteCode) {
          return NextResponse.json({ error: 'Invite code required' }, { status: 400 });
        }
        
        try {
          const result = await joinByCode(joiner.id, inviteCode.trim());
          if (!result) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
          }
          
          return NextResponse.json({ 
            tribe: result,
            already_member: result.alreadyMember || false
          });
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to join tribe',
            message: error.message
          }, { status: 500 });
        }
        
      case 'tribe/switch':
        const { tribeId: switchTribeId } = body;
        const switchUser = await getCurrentUser();
        
        if (!switchUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        try {
          // Update user's active tribe
          const newSettings = { 
            ...switchUser.settings, 
            active_tribe_id: switchTribeId 
          };
          
          if (isUsingMockData) {
            const mockUser = mockData.users.find(u => u.id === switchUser.id);
            if (mockUser) {
              mockUser.settings = newSettings;
            }
          } else {
            await supabase
              .from('users')
              .update({ settings: newSettings })
              .eq('id', switchUser.id);
          }
          
          return NextResponse.json({ success: true, active_tribe_id: switchTribeId });
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to switch tribe',
            message: error.message
          }, { status: 500 });
        }
        
      case 'workout/start':
        const { programId } = body;
        const workoutUser = await getCurrentUser();
        
        if (!workoutUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        try {
          // Create new session
          const sessionData = {
            user_id: workoutUser.id,
            program_id: programId,
            date: new Date().toISOString().split('T')[0],
            completed: false
          };
          
          if (isUsingMockData) {
            const session = {
              id: `session-${Date.now()}`,
              ...sessionData,
              created_at: new Date().toISOString()
            };
            mockData.sessions.push(session);
            return NextResponse.json({ session });
          } else {
            const { data: session, error } = await (supabaseAdmin || supabase)
              .from('sessions')
              .insert(sessionData)
              .select()
              .single();
              
            if (error) throw error;
            return NextResponse.json({ session });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to start workout',
            message: error.message
          }, { status: 500 });
        }
        
      case 'workout/set':
        const { sessionId, exerciseId, load_kg, reps_done, rpe, ai_rep_count } = body;
        
        try {
          const setData = {
            session_id: sessionId,
            exercise_id: exerciseId,
            load_kg: load_kg || null,
            reps_done: parseInt(reps_done),
            rpe: rpe || null,
            ai_rep_count: ai_rep_count || null,
            set_number: 1 // This should be incremented based on existing sets
          };
          
          if (isUsingMockData) {
            const set = {
              id: `set-${Date.now()}`,
              ...setData,
              created_at: new Date().toISOString()
            };
            return NextResponse.json({ set });
          } else {
            const { data: set, error } = await (supabaseAdmin || supabase)
              .from('sets')
              .insert(setData)
              .select()
              .single();
              
            if (error) throw error;
            return NextResponse.json({ set });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to log set',
            message: error.message
          }, { status: 500 });
        }
        
      case 'workout/finish':
        const { sessionId: finishSessionId, duration_s, kcal } = body;
        
        try {
          const updateData = {
            completed: true,
            duration_s: duration_s || null,
            kcal: kcal || null
          };
          
          if (isUsingMockData) {
            return NextResponse.json({ 
              success: true, 
              session: { id: finishSessionId, ...updateData } 
            });
          } else {
            const { data: session, error } = await (supabaseAdmin || supabase)
              .from('sessions')
              .update(updateData)
              .eq('id', finishSessionId)
              .select()
              .single();
              
            if (error) throw error;
            return NextResponse.json({ success: true, session });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to finish workout',
            message: error.message
          }, { status: 500 });
        }
        
      case 'workout/shrink':
        const { minutes } = body;
        
        if (!minutes || minutes <= 0) {
          return NextResponse.json({ error: 'Invalid minutes' }, { status: 400 });
        }
        
        // Simple shrinking algorithm: reduce sets and rest times
        const shrinkFactor = Math.max(0.5, minutes / 45); // Assume 45min default
        
        if (isUsingMockData) {
          const originalPlan = mockData.programs[0].days.monday;
          const shrunkenPlan = {
            ...originalPlan,
            exercises: originalPlan.exercises.map(ex => ({
              ...ex,
              sets: Math.max(1, Math.floor(ex.sets * shrinkFactor)),
              rest_s: Math.floor(ex.rest_s * 0.75) // Reduce rest time
            }))
          };
          
          return NextResponse.json({ 
            original_minutes: 45,
            target_minutes: minutes,
            shrunk_plan: shrunkenPlan
          });
        }
        
        // For real implementation, this would fetch user's current plan and shrink it
        return NextResponse.json({ 
          message: 'Workout shrinking not fully implemented yet',
          target_minutes: minutes
        });
        
      case 'posts/create':
        const { tribeId: postTribeId, media_url, caption } = body;
        const postUser = await getCurrentUser();
        
        if (!postUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        try {
          const postData = {
            user_id: postUser.id,
            tribe_id: postTribeId || null,
            media_url: media_url || null,
            caption: caption || ''
          };
          
          if (isUsingMockData) {
            const post = {
              id: `post-${Date.now()}`,
              ...postData,
              likes_count: 0,
              comments_count: 0,
              created_at: new Date().toISOString()
            };
            mockData.posts.unshift(post);
            return NextResponse.json({ post });
          } else {
            const { data: post, error } = await (supabaseAdmin || supabase)
              .from('posts')
              .insert(postData)
              .select()
              .single();
              
            if (error) throw error;
            return NextResponse.json({ post });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to create post',
            message: error.message
          }, { status: 500 });
        }
        
      case 'pact/spend/request':
        const { type, label, amount_tc, gym_name, item_id, specs } = body;
        const requester = await getCurrentUser();
        
        if (!requester) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (!type || !label || !amount_tc) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // Only allow donation requests when FEATURE_DEAL_SPLIT is enabled
        if (process.env.FEATURE_DEAL_SPLIT === 'true' && type !== 'donation') {
          return NextResponse.json({ 
            error: 'Only donation requests are supported. Gear purchases are now direct buys.',
            redirect: '/api/catalog/buy'
          }, { status: 400 });
        }
        
        // Get user's active tribe wallet
        const activeTribeId = requester.settings?.active_tribe_id || '10000000-0000-0000-0000-000000000001'; // Default to mock tribe
        
        const requestWallet = await getPactWallet(activeTribeId);
        if (!requestWallet) {
          return NextResponse.json({ error: 'Tribe wallet not found' }, { status: 404 });
        }
        
        try {
          const requestData = {
            wallet_id: requestWallet.id,
            type, // 'gear' or 'donation'
            label,
            amount_tc: parseFloat(amount_tc),
            item_id: item_id || null,
            specs: specs || null,
            gym_name: gym_name || null,
            created_by: requester.id,
            status: 'requested'
          };
          
          if (isUsingMockData) {
            const request = {
              id: `req-${Date.now()}`,
              ...requestData,
              created_at: new Date().toISOString()
            };
            mockData.pact_spend_requests.push(request);
            return NextResponse.json({ success: true, request });
          } else {
            const { data: request, error } = await (supabaseAdmin || supabase)
              .from('pact_spend_requests')
              .insert(requestData)
              .select()
              .single();
              
            if (error) throw error;
            return NextResponse.json({ success: true, request });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to create spend request',
            message: error.message
          }, { status: 500 });
        }
        
      case 'pact/spend/approve':
        const { requestId } = body;
        const approver = await getCurrentUser();
        
        if (!approver) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        try {
          // Find the request
          let spendRequest;
          if (isUsingMockData) {
            spendRequest = mockData.pact_spend_requests.find(r => r.id === requestId);
          } else {
            const { data } = await supabase
              .from('pact_spend_requests')
              .select('*')
              .eq('id', requestId)
              .single();
            spendRequest = data;
          }
          
          if (!spendRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
          }
          
          if (spendRequest.status !== 'requested') {
            return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
          }
          
          // Update request status
          if (isUsingMockData) {
            spendRequest.status = 'approved';
            spendRequest.approved_by = approver.id;
            spendRequest.approved_at = new Date().toISOString();
            
            // Deduct from pact wallet
            const wallet = mockData.pact_wallets.find(w => w.id === spendRequest.wallet_id);
            if (wallet) {
              wallet.balance_tc -= spendRequest.amount_tc;
            }
            
            // Add transaction record
            const transaction = {
              id: `tx-${Date.now()}`,
              wallet_id: spendRequest.wallet_id,
              user_id: spendRequest.created_by,
              type: spendRequest.type === 'gear' ? 'spend' : 'donate',
              amount_tc: -spendRequest.amount_tc, // Negative for outgoing
              meta: { 
                request_id: requestId,
                label: spendRequest.label,
                gym_name: spendRequest.gym_name
              },
              created_at: new Date().toISOString()
            };
            mockData.pact_tx.unshift(transaction);
          } else {
            // Update request
            await (supabaseAdmin || supabase)
              .from('pact_spend_requests')
              .update({
                status: 'approved',
                approved_by: approver.id,
                approved_at: new Date().toISOString()
              })
              .eq('id', requestId);
              
            // Deduct from wallet
            await (supabaseAdmin || supabase)
              .from('pact_wallets')
              .update({
                balance_tc: supabase.raw(`balance_tc - ${spendRequest.amount_tc}`)
              })
              .eq('id', spendRequest.wallet_id);
              
            // Add transaction
            await (supabaseAdmin || supabase)
              .from('pact_tx')
              .insert({
                wallet_id: spendRequest.wallet_id,
                user_id: spendRequest.created_by,
                type: spendRequest.type === 'gear' ? 'spend' : 'donate',
                amount_tc: spendRequest.amount_tc,
                meta: {
                  request_id: requestId,
                  label: spendRequest.label,
                  gym_name: spendRequest.gym_name
                }
              });
          }
          
          return NextResponse.json({ success: true });
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to approve request',
            message: error.message
          }, { status: 500 });
        }
        
      case 'coach/apply':
        const applicant = await getCurrentUser();
        
        if (!applicant) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        try {
          // Check eligibility (mock: just check if user exists)
          const applicationData = {
            user_id: applicant.id,
            status: 'pending',
            eligibility_score: 75 // Mock score
          };
          
          if (isUsingMockData) {
            return NextResponse.json({ 
              success: true,
              message: 'Application submitted successfully'
            });
          } else {
            const { data: application, error } = await (supabaseAdmin || supabase)
              .from('coach_applications')
              .insert(applicationData)
              .select()
              .single();
              
            if (error) throw error;
            return NextResponse.json({ application });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to submit application',
            message: error.message
          }, { status: 500 });
        }
        
      case 'coach/approve':
        const { userId: approveUserId } = body;
        const adminUser = await getCurrentUser();
        
        if (!adminUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        try {
          if (isUsingMockData) {
            // Add to coach profiles
            const newCoach = {
              user_id: approveUserId,
              tier: 'certified',
              bio: '',
              specialties: [],
              languages: ['en'],
              pricing: {},
              rating_avg: 0,
              rating_count: 0
            };
            mockData.coach_profiles.push(newCoach);
            return NextResponse.json({ success: true });
          } else {
            // Update application
            await (supabaseAdmin || supabase)
              .from('coach_applications')
              .update({ 
                status: 'approved',
                reviewer_id: adminUser.id,
                reviewed_at: new Date().toISOString()
              })
              .eq('user_id', approveUserId);
              
            // Create coach profile
            await (supabaseAdmin || supabase)
              .from('coach_profiles')
              .insert({
                user_id: approveUserId,
                tier: 'certified'
              });
              
            return NextResponse.json({ success: true });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to approve coach',
            message: error.message
          }, { status: 500 });
        }
        
      case 'ad/reward':
        // Simulate successful ad watch
        return NextResponse.json({
          success: true,
          reward_tc: 0, // Ads don't give TC, they just avoid payment
          message: 'Ad watched successfully!',
          can_skip: true
        });
        
      case 'tip':
        const { fromUserId, toUserId, postId, amount, message = '' } = body;
        
        if (!fromUserId || !toUserId || !amount || amount <= 0) {
          return NextResponse.json({ error: 'Invalid tip parameters' }, { status: 400 });
        }
        
        const fromUser = await getUserById(fromUserId);
        if (!fromUser || fromUser.wallet_balance_tc < amount) {
          return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
        }
        
        try {
          // Deduct from sender
          await adjustWalletTc(fromUserId, amount, 'subtract');
          
          // Add to recipient
          await adjustWalletTc(toUserId, amount, 'add');
          
          // Record tip
          const client = supabaseAdmin || supabase;
          if (!isUsingMockData) {
            await client
              .from('tips')
              .insert({
                from_user_id: fromUserId,
                to_user_id: toUserId,
                post_id: postId,
                amount_tc: amount,
                message
              });
          }
          
          return NextResponse.json({ success: true });
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to send tip',
            message: error.message
          }, { status: 500 });
        }
        
      case 'coach/hire':
        const { clientId, coachId: hireCoachId, offeringId, priceTc } = body;
        const hireClient = await getCurrentUser();
        
        if (!hireClient) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (!hireCoachId || !priceTc) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // Check if client has enough TC
        if (hireClient.wallet_balance_tc < priceTc) {
          return NextResponse.json({ 
            error: 'Insufficient TribeCoins',
            needed: priceTc,
            current: hireClient.wallet_balance_tc 
          }, { status: 402 });
        }
        
        try {
          // Deduct from client wallet
          await adjustWalletTc(hireClient.id, priceTc, 'subtract');
          
          // Credit coach wallet (in real implementation)
          await adjustWalletTc(hireCoachId, priceTc, 'add');
          
          // Create hire record
          if (isUsingMockData) {
            const hire = {
              id: `hire-${Date.now()}`,
              coach_id: hireCoachId,
              client_id: hireClient.id,
              offering_id: offeringId,
              price_tc: priceTc,
              status: 'active',
              started_at: new Date().toISOString()
            };
            mockData.coach_hires.push(hire);
            return NextResponse.json({ success: true, hire });
          } else {
            const { data: hire, error } = await (supabaseAdmin || supabase)
              .from('coach_hires')
              .insert({
                coach_id: hireCoachId,
                client_id: hireClient.id,
                offering_id: offeringId,
                price_tc: priceTc
              })
              .select()
              .single();
              
            if (error) throw error;
            return NextResponse.json({ success: true, hire });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to hire coach',
            message: error.message
          }, { status: 500 });
        }
        
      case 'coach/rate':
        const { hireId, coachId: rateCoachId, clientId: rateClientId, stars, text: ratingText } = body;
        const ratingUser = await getCurrentUser();
        
        if (!ratingUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (!hireId || !rateCoachId || !stars) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        if (stars < 1 || stars > 5) {
          return NextResponse.json({ error: 'Stars must be between 1-5' }, { status: 400 });
        }
        
        try {
          if (isUsingMockData) {
            const rating = {
              id: `rating-${Date.now()}`,
              hire_id: hireId,
              coach_id: rateCoachId,
              client_id: ratingUser.id,
              stars,
              text: ratingText || '',
              created_at: new Date().toISOString()
            };
            mockData.coach_ratings.push(rating);
            
            // Update coach avg rating
            const coachProfile = mockData.coach_profiles.find(p => p.user_id === rateCoachId);
            if (coachProfile) {
              const coachRatings = mockData.coach_ratings.filter(r => r.coach_id === rateCoachId);
              const avgRating = coachRatings.reduce((sum, r) => sum + r.stars, 0) / coachRatings.length;
              coachProfile.rating_avg = Math.round(avgRating * 10) / 10;
              coachProfile.rating_count = coachRatings.length;
            }
            
            return NextResponse.json({ success: true, rating });
          } else {
            const { data: rating, error } = await (supabaseAdmin || supabase)
              .from('coach_ratings')
              .insert({
                hire_id: hireId,
                coach_id: rateCoachId,
                client_id: ratingUser.id,
                stars,
                text: ratingText
              })
              .select()
              .single();
              
            if (error) throw error;
            return NextResponse.json({ success: true, rating });
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to rate coach',
            message: error.message
          }, { status: 500 });
        }
        
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const path = params.path ? params.path.join('/') : '';
  
  try {
    const body = await request.json();
    
    switch (path) {
      case 'user/settings':
        const user = await getCurrentUser();
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Update user settings
        const newSettings = { ...user.settings, ...body };
        
        if (isUsingMockData) {
          const mockUser = mockData.users.find(u => u.id === user.id);
          if (mockUser) {
            mockUser.settings = newSettings;
          }
        } else {
          const { error } = await supabase
            .from('users')
            .update({ settings: newSettings })
            .eq('id', user.id);
            
          if (error) throw error;
        }
        
        return NextResponse.json({ success: true, settings: newSettings });
        
      case 'notifications/read':
        const { notificationIds } = body;
        const notifUser = await getCurrentUser();
        
        if (!notifUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        try {
          if (isUsingMockData) {
            mockData.notifications.forEach(n => {
              if (notificationIds.includes(n.id)) {
                n.read = true;
              }
            });
          } else {
            await supabase
              .from('notifications')
              .update({ read: true })
              .in('id', notificationIds)
              .eq('user_id', notifUser.id);
          }
          
          return NextResponse.json({ success: true });
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to mark notifications as read',
            message: error.message
          }, { status: 500 });
        }
        
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}