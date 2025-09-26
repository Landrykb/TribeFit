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
let supabaseAdmin = null;

if (!MOCK_MODE) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    // Client-side Supabase (anon key)
    realSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    );

    // Server-side Supabase (service role key)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && typeof window === 'undefined') {
      supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    }
  } catch (error) {
    console.warn('Supabase client creation failed, using mock mode:', error.message);
  }
}

export const supabase = MOCK_MODE ? mockSupabase : realSupabase;
export const supabaseAdmin = MOCK_MODE ? mockSupabase : (supabaseAdmin || realSupabase);
export const isUsingMockData = MOCK_MODE;

// Helper functions for common queries - Production Ready
export const getCurrentUser = async () => {
  if (MOCK_MODE) {
    return mockData.users[0]; // Return first user as current user
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    // Get user profile from our users table
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUserById = async (userId) => {
  if (MOCK_MODE) {
    return mockData.users.find(u => u.id === userId);
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

export const adjustWalletTc = async (userId, amountTc, operation = 'add') => {
  if (MOCK_MODE) {
    const user = mockData.users.find(u => u.id === userId);
    if (user) {
      if (operation === 'add') {
        user.wallet_balance_tc += amountTc;
      } else if (operation === 'subtract') {
        user.wallet_balance_tc = Math.max(0, user.wallet_balance_tc - amountTc);
      }
    }
    return user;
  }
  
  try {
    const client = supabaseAdmin || supabase;
    const increment = operation === 'add' ? amountTc : -amountTc;
    
    const { data, error } = await client
      .from('users')
      .update({ 
        wallet_balance_tc: operation === 'add' 
          ? supabase.raw(`wallet_balance_tc + ${amountTc}`)
          : supabase.raw(`greatest(wallet_balance_tc - ${amountTc}, 0)`)
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adjusting wallet TC:', error);
    throw error;
  }
};

export const getOrCreateTribeWallet = async (tribeId) => {
  if (MOCK_MODE) {
    return mockData.pact_wallets.find(w => w.tribe_id === tribeId);
  }
  
  try {
    // First try to get existing wallet
    let { data: wallet, error } = await supabase
      .from('pact_wallets')
      .select('*')
      .eq('tribe_id', tribeId)
      .single();
    
    // If no wallet exists, create one
    if (error && error.code === 'PGRST116') {
      const { data: newWallet, error: createError } = await (supabaseAdmin || supabase)
        .from('pact_wallets')
        .insert({
          tribe_id: tribeId,
          balance_tc: 0,
          goal_label: 'Equipment Fund'
        })
        .select()
        .single();
        
      if (createError) throw createError;
      return newWallet;
    }
    
    if (error) throw error;
    return wallet;
  } catch (error) {
    console.error('Error getting/creating tribe wallet:', error);
    throw error;
  }
};

export const insertPactTx = async (walletId, userId, type, amountTc, meta = {}) => {
  if (MOCK_MODE) {
    const tx = {
      id: `tx-${Date.now()}`,
      wallet_id: walletId,
      user_id: userId,
      type,
      amount_tc: amountTc,
      meta,
      created_at: new Date().toISOString()
    };
    mockData.pact_tx.push(tx);
    return tx;
  }
  
  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from('pact_tx')
      .insert({
        wallet_id: walletId,
        user_id: userId,
        type,
        amount_tc: amountTc,
        meta
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error inserting pact transaction:', error);
    throw error;
  }
};

export const getUserTribes = async (userId) => {
  if (MOCK_MODE) {
    return mockData.tribes.map(t => ({
      ...t,
      role: 'admin' // Mock role
    }));
  }
  
  try {
    const { data, error } = await supabase
      .from('tribe_members')
      .select(`
        role,
        joined_at,
        tribes (
          id,
          name,
          description,
          owner_id,
          invite_code,
          created_at
        )
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    return data?.map(item => ({
      ...item.tribes,
      role: item.role,
      joined_at: item.joined_at
    })) || [];
  } catch (error) {
    console.error('Error getting user tribes:', error);
    return [];
  }
};

export const listTribeMembers = async (tribeId) => {
  if (MOCK_MODE) {
    return mockData.users.map(u => ({ ...u, role: 'member' }));
  }
  
  try {
    const { data, error } = await supabase
      .from('tribe_members')
      .select(`
        role,
        joined_at,
        users (
          id,
          name,
          email,
          avatar_url,
          wallet_balance_tc
        )
      `)
      .eq('tribe_id', tribeId);
      
    if (error) throw error;
    return data?.map(item => ({
      ...item.users,
      role: item.role,
      joined_at: item.joined_at
    })) || [];
  } catch (error) {
    console.error('Error listing tribe members:', error);
    return [];
  }
};

export const createTribe = async (ownerId, name, description = '') => {
  if (MOCK_MODE) {
    const tribe = {
      id: `tribe-${Date.now()}`,
      name,
      description,
      owner_id: ownerId,
      invite_code: Math.random().toString(36).substr(2, 8),
      created_at: new Date().toISOString()
    };
    mockData.tribes.push(tribe);
    return tribe;
  }
  
  try {
    const client = supabaseAdmin || supabase;
    
    // Create tribe
    const { data: tribe, error: tribeError } = await client
      .from('tribes')
      .insert({
        name,
        description,
        owner_id: ownerId
      })
      .select()
      .single();
      
    if (tribeError) throw tribeError;
    
    // Add owner as admin member
    const { error: memberError } = await client
      .from('tribe_members')
      .insert({
        tribe_id: tribe.id,
        user_id: ownerId,
        role: 'admin'
      });
      
    if (memberError) throw memberError;
    
    return tribe;
  } catch (error) {
    console.error('Error creating tribe:', error);
    throw error;
  }
};

export const joinByCode = async (userId, inviteCode) => {
  if (MOCK_MODE) {
    const tribe = mockData.tribes.find(t => t.invite_code === inviteCode);
    return tribe || null;
  }
  
  try {
    // Find tribe by invite code
    const { data: tribe, error: tribeError } = await supabase
      .from('tribes')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();
      
    if (tribeError) throw tribeError;
    
    // Add user as member
    const { data: membership, error: memberError } = await (supabaseAdmin || supabase)
      .from('tribe_members')
      .insert({
        tribe_id: tribe.id,
        user_id: userId,
        role: 'member'
      })
      .select()
      .single();
      
    if (memberError) {
      // Check if already a member
      if (memberError.code === '23505') {
        return { ...tribe, alreadyMember: true };
      }
      throw memberError;
    }
    
    return tribe;
  } catch (error) {
    console.error('Error joining tribe by code:', error);
    throw error;
  }
};

export const getPactWallet = async (tribeId) => {
  if (MOCK_MODE) {
    return mockData.pact_wallets.find(w => w.tribe_id === tribeId);
  }
  
  try {
    const { data, error } = await supabase
      .from('pact_wallets')
      .select('*')
      .eq('tribe_id', tribeId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting pact wallet:', error);
    return null;
  }
};

export const getPactTransactions = async (walletId) => {
  if (MOCK_MODE) {
    return mockData.pact_tx
      .filter(tx => tx.wallet_id === walletId)
      .map(tx => ({
        ...tx,
        user_name: mockData.users.find(u => u.id === tx.user_id)?.name || 'Unknown'
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  
  try {
    const { data, error } = await supabase
      .from('pact_tx')
      .select(`
        *,
        users (
          name,
          avatar_url
        )
      `)
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data?.map(tx => ({
      ...tx,
      user_name: tx.users?.name || 'Unknown User'
    })) || [];
  } catch (error) {
    console.error('Error getting pact transactions:', error);
    return [];
  }
};