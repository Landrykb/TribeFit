import { NextResponse } from 'next/server';
import { supabase, isUsingMockData } from '@/lib/supabase';
import { t } from '@/lib/i18n';

// Mock data for demo
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

// Helper to simulate notifications
const sendSnitchNotification = (actorName, recipientIds, method, locale = 'en') => {
  const key = method === 'pay' ? 'snitch.paid' : 'snitch.watched_ad';
  const message = t(key, { name: actorName }, locale);
  
  // In mock mode, just add to notifications array
  const notification = {
    id: `notif-${Date.now()}`,
    message,
    timestamp: new Date().toISOString(),
    recipients: recipientIds
  };
  mockData.notifications.push(notification);
  return notification;
};

export async function GET(request, { params }) {
  const path = params.path ? params.path.join('/') : '';
  
  try {
    switch (path) {
      case 'user/current':
        return NextResponse.json({
          user: mockData.users[0], // Current user
          isDemo: isUsingMockData
        });
        
      case 'wallet/balance':
        const currentUser = mockData.users[0];
        return NextResponse.json({
          balance_tc: currentUser.wallet_balance_tc,
          formatted: `${currentUser.wallet_balance_tc} TC`
        });
        
      case 'pact/wallet':
        const { searchParams } = new URL(request.url);
        const tribeId = searchParams.get('tribe_id') || '10000000-0000-0000-0000-000000000001';
        const pactWallet = mockData.pact_wallets.find(w => w.tribe_id === tribeId);
        return NextResponse.json(pactWallet || { balance_tc: 0, goal_label: 'Equipment Fund' });
        
      case 'pact/transactions':
        const walletId = new URL(request.url).searchParams.get('wallet_id') || '20000000-0000-0000-0000-000000000001';
        const transactions = mockData.pact_tx
          .filter(tx => tx.wallet_id === walletId)
          .map(tx => ({
            ...tx,
            user_name: mockData.users.find(u => u.id === tx.user_id)?.name || 'Unknown'
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return NextResponse.json(transactions);
        
      case 'notifications':
        return NextResponse.json(mockData.notifications.slice(-10)); // Recent 10
        
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
        const user = mockData.users.find(u => u.id === userId) || mockData.users[0];
        const pactWallet = mockData.pact_wallets.find(w => w.tribe_id === tribeId);
        
        if (method === 'pay') {
          // Check sufficient balance
          if (user.wallet_balance_tc < feeTc) {
            return NextResponse.json({ 
              error: 'Insufficient TribeCoins',
              needed: feeTc,
              current: user.wallet_balance_tc 
            }, { status: 402 });
          }
          
          // Deduct from user, add to pact wallet
          user.wallet_balance_tc -= feeTc;
          if (pactWallet) pactWallet.balance_tc += feeTc;
        }
        
        // Record transaction
        const transaction = {
          id: `tx-${Date.now()}`,
          wallet_id: pactWallet?.id || '20000000-0000-0000-0000-000000000001',
          user_id: user.id,
          type: 'skip',
          amount_tc: feeTc,
          meta: { method },
          created_at: new Date().toISOString()
        };
        mockData.pact_tx.push(transaction);
        
        // Send snitch notification if enabled
        if (user.settings.snitch) {
          const tribeMembers = ['00000000-0000-0000-0000-000000000002']; // Other member
          const notification = sendSnitchNotification(user.name, tribeMembers, method);
          
          return NextResponse.json({
            success: true,
            transaction,
            notification: notification.message,
            new_balance: user.wallet_balance_tc,
            pact_balance: pactWallet?.balance_tc || 0
          });
        }
        
        return NextResponse.json({
          success: true,
          transaction,
          new_balance: user.wallet_balance_tc,
          pact_balance: pactWallet?.balance_tc || 0
        });
        
      case 'wallet/topup':
        const { amountTc } = body;
        const targetUser = mockData.users.find(u => u.id === body.userId) || mockData.users[0];
        
        // Simulate Stripe payment success
        targetUser.wallet_balance_tc += parseFloat(amountTc);
        
        return NextResponse.json({
          success: true,
          new_balance: targetUser.wallet_balance_tc,
          charged_amount: amountTc,
          payment_method: 'demo_mode'
        });
        
      case 'ad/reward':
        // Simulate successful ad watch
        return NextResponse.json({
          success: true,
          reward_tc: 0, // Ads don't give TC, they just avoid payment
          message: 'Ad watched successfully!',
          can_skip: true
        });
        
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const path = params.path ? params.path.join('/') : '';
  
  try {
    const body = await request.json();
    
    switch (path) {
      case 'user/settings':
        const user = mockData.users[0]; // Current user
        user.settings = { ...user.settings, ...body };
        return NextResponse.json({ success: true, settings: user.settings });
        
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}