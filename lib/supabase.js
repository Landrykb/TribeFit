// Production Supabase client with fallback to mock mode
// To use real database: Replace credentials in .env with your actual Supabase project details

const MOCK_MODE = !process.env.SUPABASE_URL || 
                  process.env.SUPABASE_URL.includes('your-project') ||
                  process.env.SUPABASE_ANON_KEY?.includes('placeholder');

// Mock data store (in-memory for demo)
let mockData = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo1@tribefit.app',
      name: 'Alex Chen',
      avatar_url: null,
      locale: 'en',
      wallet_balance_tc: 500,
      settings: { snitch: true, privacy: 'friends' },
      created_at: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000002', 
      email: 'demo2@tribefit.app',
      name: 'Jordan Kim',
      avatar_url: null,
      locale: 'en',
      wallet_balance_tc: 250,
      settings: { snitch: true, privacy: 'friends' },
      created_at: new Date().toISOString()
    }
  ],
  tribes: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Founders Tribe',
      owner_id: '00000000-0000-0000-0000-000000000001',
      created_at: new Date().toISOString()
    }
  ],
  tribe_members: [
    {
      tribe_id: '10000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      role: 'admin',
      joined_at: new Date().toISOString()
    },
    {
      tribe_id: '10000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      role: 'member',
      joined_at: new Date().toISOString()
    }
  ],
  pact_wallets: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      tribe_id: '10000000-0000-0000-0000-000000000001',
      balance_tc: 300,
      goal_label: 'Dumbbells 20kg Set',
      rules: {},
      created_at: new Date().toISOString()
    }
  ],
  pact_tx: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      wallet_id: '20000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      type: 'skip',
      amount_tc: 100,
      meta: { reason: 'work_meeting' },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      wallet_id: '20000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      type: 'skip',
      amount_tc: 100,
      meta: { reason: 'ad_watched' },
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  notifications: []
};

// Mock Supabase client
const mockSupabase = {
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => Promise.resolve({
        data: mockData[table]?.filter(row => row[column] === value) || [],
        error: null
      }),
      data: mockData[table] || [],
      error: null
    }),
    insert: (data) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newRow = Array.isArray(data) ? data.map(d => ({ ...d, id })) : { ...data, id };
      if (Array.isArray(newRow)) {
        mockData[table] = [...(mockData[table] || []), ...newRow];
      } else {
        mockData[table] = [...(mockData[table] || []), newRow];
      }
      return Promise.resolve({ data: newRow, error: null });
    },
    update: (data) => ({
      eq: (column, value) => {
        const updated = mockData[table]?.map(row => 
          row[column] === value ? { ...row, ...data } : row
        ) || [];
        mockData[table] = updated;
        return Promise.resolve({ data: updated.filter(row => row[column] === value), error: null });
      }
    }),
    delete: () => ({
      eq: (column, value) => {
        mockData[table] = mockData[table]?.filter(row => row[column] !== value) || [];
        return Promise.resolve({ error: null });
      }
    })
  }),
  auth: {
    getUser: () => Promise.resolve({
      data: { user: mockData.users[0] },
      error: null
    }),
    signInWithPassword: ({ email, password }) => Promise.resolve({
      data: { user: mockData.users.find(u => u.email === email) || mockData.users[0] },
      error: null
    }),
    signUp: ({ email, password, options }) => Promise.resolve({
      data: { user: { email, ...options?.data } },
      error: null
    })
  }
};

// Real Supabase client (will be used when keys are provided)
let realSupabase = null;
if (!MOCK_MODE) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    realSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  } catch (error) {
    console.warn('Supabase client creation failed, using mock mode:', error.message);
  }
}

export const supabase = MOCK_MODE ? mockSupabase : realSupabase;
export const isUsingMockData = MOCK_MODE;

// Helper functions for common queries
export const getCurrentUser = async () => {
  if (MOCK_MODE) {
    return mockData.users[0]; // Return first user as current user
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  return user;
};

export const getUserTribes = async (userId) => {
  const { data } = await supabase
    .from('tribe_members')
    .select(`
      *,
      tribes (*)
    `)
    .eq('user_id', userId);
  return data || [];
};

export const getPactWallet = async (tribeId) => {
  const { data } = await supabase
    .from('pact_wallets')
    .select('*')
    .eq('tribe_id', tribeId)
    .single();
  return data;
};

export const getPactTransactions = async (walletId) => {
  const { data } = await supabase
    .from('pact_tx')
    .select(`
      *,
      users (name)
    `)
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false });
  return data || [];
};