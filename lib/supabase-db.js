// Async Supabase-backed data layer for legacy db.js features.
// This is the foundation for the full relational migration.

import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from './supabase';

function uuid() {
  return randomUUID();
}

function now() {
  return new Date().toISOString();
}

// ---------- Users ----------

export async function getUser(userId) {
  if (!userId) return null;
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return {
    ...data,
    owned_skins: data.owned_skins || ['ember'],
    owned_accessories: data.owned_accessories || [],
    streak: data.streak || 0,
    total_workouts: data.total_workouts || 0,
    wallet_balance_tc: Number(data.wallet_balance_tc || 0),
    snatched_balance_tc: Number(data.snatched_balance_tc || 0),
  };
}

export async function listAllUsers() {
  const { data, error } = await supabaseAdmin.from('users').select('*');
  if (error) throw error;
  return (data || []).map(u => ({
    ...u,
    owned_skins: u.owned_skins || ['ember'],
    owned_accessories: u.owned_accessories || [],
    streak: u.streak || 0,
    total_workouts: u.total_workouts || 0,
    wallet_balance_tc: Number(u.wallet_balance_tc || 0),
    snatched_balance_tc: Number(u.snatched_balance_tc || 0),
  }));
}

export async function createTestUser(name, userId, initialData = {}) {
  const id = userId || uuid();
  const email = initialData?.email || `${id}@tribefit.app`;
  const payload = {
    id,
    email,
    name: name || email.split('@')[0],
    wallet_balance_tc: Number(initialData?.wallet_balance_tc ?? 500),
    snatched_balance_tc: Number(initialData?.snatched_balance_tc ?? 0),
    streak: initialData?.streak ?? 0,
    total_workouts: initialData?.total_workouts ?? 0,
    group_id: initialData?.group_id ?? null,
    group_type: initialData?.group_type ?? null,
    owned_skins: initialData?.owned_skins ?? ['ember'],
    owned_accessories: initialData?.owned_accessories ?? [],
    avatar_icon: initialData?.avatar_icon ?? null,
    avatar_state: initialData?.avatar_state ?? {},
    settings: initialData?.settings ?? { snitch: true, privacy: 'friends' },
    created_at: now(),
    updated_at: now(),
  };
  const { data, error } = await supabaseAdmin.from('users').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateUserStats(userId, updates) {
  const allowed = {};
  for (const key of [
    'name', 'wallet_balance_tc', 'snatched_balance_tc', 'streak', 'total_workouts',
    'group_id', 'group_type', 'owned_skins', 'owned_accessories', 'avatar_icon',
    'ads_week_key', 'avatar_state', 'settings'
  ]) {
    if (updates[key] !== undefined) allowed[key] = updates[key];
  }
  if (Object.keys(allowed).length === 0) return getUser(userId);
  allowed.updated_at = now();
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(allowed)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return getUser(userId);
}

// ---------- Tribes / Groups ----------

export async function getGroup(groupId) {
  if (!groupId) return null;
  const { data, error } = await supabaseAdmin
    .from('tribes')
    .select('*, tribe_members(*), pact_wallets(*)')
    .eq('id', groupId)
    .single();
  if (error || !data) return null;

  const members = (data.tribe_members || []).map(m => m.user_id);
  const wallet = data.pact_wallets?.[0];

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    type: data.group_type || 'tribe',
    group_type: data.group_type || 'tribe',
    members,
    member_count: members.length,
    streak_days: data.streak_days || 0,
    participation_rate: Number(data.participation_rate || 0),
    donors: [],
    pact_balance_tc: Number(wallet?.balance_tc || 0),
    skip_mode: data.settings?.skip_mode || 'teammate_boost',
    last_mode_change_at: data.updated_at,
    settings: {
      active_window_days: 7,
      vote_duration_hours: 72,
      vote_majority_percent: 50,
      teammate_boost_pct_members: 80,
      teammate_boost_pct_vault: 20,
      catch_up_credit_per_skip: 1,
      streak_shield_cap_per_month: 2,
      skip_cost_tc: 10,
      snitch_ad_threshold: 3,
      require_vote_for_mode_change: true,
      ...(data.settings || {}),
    },
    owner_id: data.owner_id,
    isPrivate: data.settings?.isPrivate || false,
  };
}

export async function listGroups() {
  const { data, error } = await supabaseAdmin
    .from('tribes')
    .select('*, tribe_members(*), pact_wallets(*)');
  if (error) throw error;

  return (data || []).map(t => {
    const members = (t.tribe_members || []).map(m => m.user_id);
    const wallet = t.pact_wallets?.[0];
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      type: t.group_type || 'tribe',
      group_type: t.group_type || 'tribe',
      members,
      member_count: members.length,
      streak_days: t.streak_days || 0,
      participation_rate: Number(t.participation_rate || 0),
      donors: [],
      pact_balance_tc: Number(wallet?.balance_tc || 0),
      pact_balance: Number(wallet?.balance_tc || 0),
      owner_id: t.owner_id,
      isPrivate: t.settings?.isPrivate || false,
    };
  });
}

export async function getAllGroups() {
  return listGroups();
}

export async function createGroup({ id, name, description, group_type = 'squad', owner_id }) {
  const groupId = id || uuid();
  const payload = {
    id: groupId,
    name,
    description,
    group_type,
    owner_id,
    settings: {},
  };
  const { data, error } = await supabaseAdmin.from('tribes').insert(payload).select().single();
  if (error) throw error;
  return getGroup(groupId);
}

export async function addUserToGroup(userId, groupId) {
  const [user, group] = await Promise.all([getUser(userId), getGroup(groupId)]);
  if (!user || !group) throw new Error('User or group not found');

  const { data: existing } = await supabaseAdmin
    .from('tribe_members')
    .select('user_id')
    .eq('tribe_id', groupId)
    .eq('user_id', userId);

  if (!existing || existing.length === 0) {
    const { error: memberError } = await supabaseAdmin
      .from('tribe_members')
      .insert({ tribe_id: groupId, user_id: userId, role: 'member', status: 'active' });
    if (memberError) throw memberError;
  }

  const updatedUser = await updateUserStats(userId, { group_id: groupId, group_type: group.group_type });
  return { user: updatedUser, group: await getGroup(groupId) };
}

export async function removeUserFromGroup(userId) {
  if (!userId) return null;
  const { error: memberError } = await supabaseAdmin
    .from('tribe_members')
    .delete()
    .eq('user_id', userId);
  if (memberError) throw memberError;

  const updatedUser = await updateUserStats(userId, { group_id: null, group_type: null });
  return updatedUser;
}

export async function deleteGroup(groupId) {
  if (!groupId) return { success: false, message: 'Missing groupId' };

  // Remove members from the group in users table
  const { data: members } = await supabaseAdmin
    .from('tribe_members')
    .select('user_id')
    .eq('tribe_id', groupId);

  const userIds = (members || []).map(m => m.user_id);
  for (const uid of userIds) {
    await updateUserStats(uid, { group_id: null, group_type: null });
  }

  await supabaseAdmin.from('tribe_members').delete().eq('tribe_id', groupId);
  await supabaseAdmin.from('pact_wallets').delete().eq('tribe_id', groupId);
  await supabaseAdmin.from('tribes').delete().eq('id', groupId);

  return { success: true, message: 'Group deleted successfully' };
}

export async function updateGroupStats(groupId, updates) {
  const allowed = {};
  for (const key of ['name', 'description', 'group_type', 'streak_days', 'participation_rate', 'settings']) {
    if (updates[key] !== undefined) allowed[key] = updates[key];
  }
  if (Object.keys(allowed).length === 0) return getGroup(groupId);
  const { error } = await supabaseAdmin.from('tribes').update(allowed).eq('id', groupId);
  if (error) throw error;
  return getGroup(groupId);
}

// ---------- Balances ----------

export async function getBalances({ userId, groupId }) {
  const [user, group] = await Promise.all([getUser(userId), getGroup(groupId)]);
  if (!user) throw new Error('User not found');
  return {
    wallet_balance_tc: user.wallet_balance_tc,
    snatched_balance_tc: user.snatched_balance_tc,
    pact_balance_tc: group ? group.pact_balance_tc : 0,
    donors: group ? group.donors : [],
  };
}

export async function setBalances({ userId, groupId, wallet, snatched, pact }) {
  const updates = [];
  if (userId && (wallet !== undefined || snatched !== undefined)) {
    const u = {};
    if (wallet !== undefined) u.wallet_balance_tc = wallet;
    if (snatched !== undefined) u.snatched_balance_tc = snatched;
    await updateUserStats(userId, u);
  }
  if (groupId && pact !== undefined) {
    const { data: wallet } = await supabaseAdmin
      .from('pact_wallets')
      .select('id')
      .eq('tribe_id', groupId)
      .single();
    if (wallet?.id) {
      await supabaseAdmin.from('pact_wallets').update({ balance_tc: pact, updated_at: now() }).eq('id', wallet.id);
    } else {
      await supabaseAdmin.from('pact_wallets').insert({ tribe_id: groupId, balance_tc: pact, goal_label: 'Equipment Fund' });
    }
  }
  return getBalances({ userId, groupId });
}

export async function ensureMembership(groupId, userId) {
  return addUserToGroup(userId, groupId);
}

export async function addDonor(groupId, userId, name, amountTc) {
  const { data: wallet } = await supabaseAdmin
    .from('pact_wallets')
    .select('*')
    .eq('tribe_id', groupId)
    .single();
  if (!wallet) throw new Error('Pact wallet not found');

  const { error: txError } = await supabaseAdmin.from('pact_tx').insert({
    wallet_id: wallet.id,
    user_id: userId,
    amount_tc: amountTc,
    type: 'donation',
    note: name,
    created_at: now(),
  });
  if (txError) throw txError;

  const { error } = await supabaseAdmin
    .from('pact_wallets')
    .update({ balance_tc: Number(wallet.balance_tc) + Number(amountTc), updated_at: now() })
    .eq('id', wallet.id);
  if (error) throw error;

  return getGroup(groupId);
}

export async function getDonors(groupId) {
  const { data: wallet } = await supabaseAdmin
    .from('pact_wallets')
    .select('id')
    .eq('tribe_id', groupId)
    .single();
  if (!wallet) return [];

  const { data: txs } = await supabaseAdmin
    .from('pact_tx')
    .select('*, users(name)')
    .eq('wallet_id', wallet.id)
    .eq('type', 'donation');

  return (txs || []).map(tx => ({
    userId: tx.user_id,
    name: tx.users?.name || 'Anonymous',
    amountTc: tx.amount_tc,
    created_at: tx.created_at,
  }));
}
