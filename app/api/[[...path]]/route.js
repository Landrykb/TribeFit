import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isUsingMockData } from '@/lib/supabase';
import { 
  getCurrentUser, getUserById, adjustWalletTc, getOrCreateTribeWallet,
  insertPactTx, getUserTribes, listTribeMembers, createTribe, joinByCode,
  getPactWallet, getPactTransactions
} from '@/lib/supabase';
import { t } from '@/lib/i18n';
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
      wallet_balance_tc: 500,
      settings: { snitch: true, privacy: 'friends' }
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'demo2@tribefit.app',
      name: 'Jordan Kim', 
      wallet_balance_tc: 250,
      settings: { snitch: true, privacy: 'friends' }
    }
  ],
  pact_wallets: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      tribe_id: '10000000-0000-0000-0000-000000000001',
      balance_tc: 300,
      goal_label: 'Dumbbells 20kg Set'
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
      meta: { method: 'ad' },
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  notifications: []
};

// Helper to send snitch notification
const sendSnitchNotification = async (actorName, recipientIds, method, locale = 'en') => {
  const key = method === 'pay' ? 'snitch.paid' : 'snitch.watched_ad';
  const message = t(key, { name: actorName }, locale);
  
  if (isUsingMockData) {
    // Mock mode - just add to array
    const notification = {
      id: `notif-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      recipients: recipientIds
    };
    mockData.notifications.push(notification);
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
        const feeTc = parseInt(process.env.SKIP_FEE_TC || '100');
        
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
        
        // Process the skip
        let updatedUser = user;
        if (method === 'pay') {
          // Deduct from user wallet
          updatedUser = await adjustWalletTc(user.id, feeTc, 'subtract');
          
          // Add to pact wallet
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
                metadata: { method: 'pay', tribe_id: tribeId }
              });
          }
        }
        
        // Record pact transaction
        const transaction = await insertPactTx(
          pactWallet.id,
          user.id,
          'skip',
          feeTc,
          { method, tribe_id: tribeId }
        );
        
        // Send snitch notification if enabled
        let notification = null;
        if (user.settings?.snitch) {
          const tribeMembers = await listTribeMembers(tribeId);
          const otherMembers = tribeMembers
            .filter(member => member.id !== user.id)
            .map(member => member.id);
            
          if (otherMembers.length > 0) {
            notification = await sendSnitchNotification(
              user.name,
              otherMembers,
              method,
              user.locale || 'en'
            );
          }
        }
        
        return NextResponse.json({
          success: true,
          transaction,
          notification: notification?.message,
          new_balance: updatedUser?.wallet_balance_tc || user.wallet_balance_tc,
          pact_balance: pactWallet.balance_tc + (method === 'pay' ? feeTc : 0)
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
          return NextResponse.json({ tribe: newTribe });
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