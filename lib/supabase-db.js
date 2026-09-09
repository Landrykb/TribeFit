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

export async function listUserTribes(userId) {
  const { data, error } = await supabaseAdmin
    .from('tribe_members')
    .select('tribe_id, tribes(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.tribe_id,
    group_type: row.tribes?.group_type || 'squad',
    name: row.tribes?.name,
  }));
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

export async function getGroupSettings(groupId) {
  const group = await getGroup(groupId);
  return group?.settings || {};
}

export async function setGroupSettings(groupId, partial = {}) {
  const group = await getGroup(groupId);
  const next = { ...group.settings, ...partial };
  await updateGroupStats(groupId, { settings: next });
  return next;
}

export async function getGroupSkipMode(groupId) {
  const group = await getGroup(groupId);
  return group?.settings?.skip_mode || 'teammate_boost';
}

export async function setGroupSkipMode(groupId, mode) {
  const group = await getGroup(groupId);
  const next = { ...group.settings, skip_mode: mode };
  await updateGroupStats(groupId, { settings: next });
  return { ...group, settings: next, skip_mode: mode };
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

export async function recordPurchase({ userId, groupId, amountTc, from_snatched = 0, from_wallet = 0 }) {
  await ensureMembership(groupId, userId);
  const user = await getUser(userId);
  if (!user) throw new Error('User not found');

  const fs = Math.max(0, Number(from_snatched || 0));
  const fw = Math.max(0, Number(from_wallet || 0));

  await updateUserStats(userId, {
    snatched_balance_tc: Math.max(0, user.snatched_balance_tc - fs),
    wallet_balance_tc: Math.max(0, user.wallet_balance_tc - fw),
  });

  const balances = await getBalances({ userId, groupId });
  return { balances, amount: Number(amountTc) };
}

export async function upgradeSquad(squadId, upgradedBy) {
  const group = await getGroup(squadId);
  if (!group) throw new Error('Squad not found');

  const updated = await updateGroupStats(squadId, {
    group_type: 'tribe',
    settings: {
      ...group.settings,
      upgraded_at: new Date().toISOString(),
      upgraded_by: upgradedBy,
      max_members: 15,
    }
  });

  return {
    success: true,
    message: 'Squad successfully upgraded to Tribe!',
    upgradedSquad: {
      id: squadId,
      previousType: 'squad',
      newType: 'tribe',
      upgradedAt: updated.settings.upgraded_at,
      upgradedBy,
      bonusRewards: {
        bonusTC: 0,
        newFeatures: ['Tribe voting', 'Advanced challenges', 'Verified badge'],
        memberBenefits: 'All members get tribe perks'
      }
    },
    celebration: {
      title: 'Tribe Upgrade Complete! 🏆',
      message: 'Your squad has evolved into a mighty tribe! Unlock new features and lead your community to greatness.',
      effects: ['confetti', 'fanfare', 'tribal_horn']
    }
  };
}

// ---- Items and effects ----

export const ITEM_CATALOG = {
  snatch: { id: 'snatch', name: 'Snatch', price_tc: 25, rarity: 'rare', description: "Whack a rival - halves their latest workout's progress" },
  shield: { id: 'shield', name: 'Streak Shield', price_tc: 30, rarity: 'epic', description: 'Auto-protects your streak on your next missed workout' },
  boost:  { id: 'boost',  name: 'TC Boost',   price_tc: 20, rarity: 'common', description: 'Your next logged workout earns +10 bonus TC' },
};

export const CARD_PACK = { price_tc: 15, cards: 3 };

function rollCard() {
  const r = Math.random();
  if (r < 0.15) return 'shield';
  if (r < 0.45) return 'snatch';
  return 'boost';
}

function nowIso() {
  return new Date().toISOString();
}

export async function getItems(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_items')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(i => ({ id: i.id, type: i.item_id, acquired_at: i.created_at, count: i.count }));
}

export async function countItems(userId) {
  const items = await getItems(userId);
  const counts = {};
  items.forEach(i => { counts[i.type] = (counts[i.type] || 0) + i.count; });
  return counts;
}

export async function grantItem(userId, itemId, count = 1) {
  const { data: existing } = await supabaseAdmin
    .from('user_items')
    .select('id, count')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .single();

  if (existing?.id) {
    const { error } = await supabaseAdmin
      .from('user_items')
      .update({ count: existing.count + count })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from('user_items')
      .insert({ user_id: userId, item_id: itemId, count });
    if (error) throw error;
  }

  return getItems(userId);
}

export async function consumeItem(userId, itemId) {
  const { data, error } = await supabaseAdmin
    .from('user_items')
    .select('*')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .gt('count', 0)
    .single();

  if (error || !data) return null;

  if (data.count <= 1) {
    await supabaseAdmin.from('user_items').delete().eq('id', data.id);
  } else {
    await supabaseAdmin.from('user_items').update({ count: data.count - 1 }).eq('id', data.id);
  }

  return { id: data.id, type: itemId, acquired_at: data.created_at };
}

export async function openCardPack(userId) {
  const cards = Array.from({ length: CARD_PACK.cards }, rollCard);
  for (const id of cards) {
    await grantItem(userId, id, 1);
  }
  return cards;
}

export async function getEffects(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_effects')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;

  const fx = { shield: false, boost: false };
  (data || []).forEach(row => { fx[row.key] = row.value; });
  return fx;
}

export async function setEffect(userId, key, value) {
  const { data: existing } = await supabaseAdmin
    .from('user_effects')
    .select('id')
    .eq('user_id', userId)
    .eq('key', key)
    .single();

  if (existing?.id) {
    await supabaseAdmin.from('user_effects').update({ value }).eq('id', existing.id);
  } else {
    await supabaseAdmin.from('user_effects').insert({ user_id: userId, key, value });
  }

  return getEffects(userId);
}

// ---- Missed workouts ----

export async function getMissedWorkouts(userId) {
  const { data, error } = await supabaseAdmin
    .from('missed_workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(m => ({
    id: m.id,
    date: m.date,
    title: m.title,
    type: m.type,
    ai_plan: m.ai_plan,
  }));
}

export async function addMissedWorkout({ userId, id, date, title, type, ai_plan }) {
  const payload = {
    user_id: userId,
    date,
    title,
    type,
    ai_plan,
  };
  if (id) payload.id = id;

  const { data, error } = await supabaseAdmin
    .from('missed_workouts')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeMissedWorkout(userId, id) {
  const { error } = await supabaseAdmin
    .from('missed_workouts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
  return { success: true };
}

export async function popLatestMissedWorkout(userId) {
  const { data } = await supabaseAdmin
    .from('missed_workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single();
  if (!data) return null;
  await removeMissedWorkout(userId, data.id);
  return data;
}

// ---- Catch-up credits ----

export async function listCatchUpCredits(userId) {
  const { data, error } = await supabaseAdmin
    .from('catch_up_credits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id,
    created_at: c.created_at,
    expires_at: c.expires_at,
  }));
}

export async function grantCatchUpCredits(userId, count = 1) {
  const now = nowIso();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const inserts = Array.from({ length: count }, () => ({
    user_id: userId,
    created_at: now,
    expires_at: expires,
  }));
  const { error } = await supabaseAdmin.from('catch_up_credits').insert(inserts);
  if (error) throw error;
  return listCatchUpCredits(userId);
}

export async function consumeCatchUpCredit(userId) {
  const { data } = await supabaseAdmin
    .from('catch_up_credits')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();
  if (!data) return false;

  const { error } = await supabaseAdmin.from('catch_up_credits').delete().eq('id', data.id);
  if (error) throw error;
  return true;
}

// ---- Tribeling avatar ----

export const AVATAR_SKINS = {
  ember:    { id: 'ember',    name: 'Ember',    price_tc: 0,   body: '#A3E635', belly: '#D4F28F', accent: '#FF5436' },
  solar:    { id: 'solar',    name: 'Solar',    price_tc: 40,  body: '#FF9F1C', belly: '#FFD166', accent: '#EF476F' },
  venom:    { id: 'venom',    name: 'Venom',    price_tc: 40,  body: '#2EC4B6', belly: '#8CE99A', accent: '#FF6B6B' },
  frost:    { id: 'frost',    name: 'Frost',    price_tc: 60,  body: '#4CC9F0', belly: '#BDE0FE', accent: '#F72585' },
  midnight: { id: 'midnight', name: 'Midnight', price_tc: 80,  body: '#3B3B4F', belly: '#6E6E85', accent: '#A3E635' },
  magma:    { id: 'magma',    name: 'Magma',    price_tc: 120, body: '#FF5436', belly: '#FFB4A2', accent: '#FFD166' },
};

export const AVATAR_ACCESSORIES = {
  none:       { id: 'none',       name: 'None',       price_tc: 0 },
  headband:   { id: 'headband',   name: 'Headband',   price_tc: 15 },
  shades:     { id: 'shades',     name: 'Shades',     price_tc: 35 },
  headphones: { id: 'headphones', name: 'Headphones', price_tc: 50 },
  crown:      { id: 'crown',      name: 'Crown',      price_tc: 150 },
};

export const EVOLUTION_STAGES = [
  { id: 'sprout', name: 'Sprout',  min_workouts: 0,  perk: 'Just sprouted' },
  { id: 'rookie', name: 'Rookie',  min_workouts: 1,  perk: '+5% TC on workouts' },
  { id: 'athlete', name: 'Athlete', min_workouts: 5,  perk: '+10% TC on workouts' },
  { id: 'beast',   name: 'Beast',   min_workouts: 15, perk: '+15% TC, skip fees -1 TC' },
  { id: 'legend',  name: 'Legend',  min_workouts: 30, perk: '+20% TC, free weekly shield' },
];

export function getEvolutionStage(totalWorkouts) {
  const n = Number(totalWorkouts || 0);
  let stage = EVOLUTION_STAGES[0];
  for (const s of EVOLUTION_STAGES) if (n >= s.min_workouts) stage = s;
  return stage;
}

function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

export async function hasProgressOnDay(userId, d = new Date()) {
  const dateStr = toISODate(d);
  const { count, error } = await supabaseAdmin
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('date', dateStr)
    .gt('duration_s', 0);

  if (error) throw error;
  return count > 0;
}

export async function recordAdWatch(userId) {
  const user = await getUser(userId);
  if (!user) throw new Error('User not found');

  const today = new Date();
  const onejan = new Date(today.getFullYear(), 0, 1);
  const week = Math.ceil((((today - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  const wk = `${today.getFullYear()}-W${week}`;

  const state = { ...(user.avatar_state || {}) };
  if (state.ads_week_key !== wk) {
    state.ads_week_key = wk;
    state.ads_this_week = 0;
  }
  state.ads_this_week = (state.ads_this_week || 0) + 1;

  await updateUserStats(userId, { avatar_state: state });
  return state.ads_this_week;
}

export async function getAvatarState(userId) {
  const user = await getUser(userId);
  if (!user) throw new Error('User not found');

  const streak = Number(user.streak || 0);
  const totalWorkouts = Number(user.total_workouts || 0);
  const state = user.avatar_state || {};

  const missed = await getMissedWorkouts(userId);
  const today = toISODate(new Date());
  const hasToday = await hasProgressOnDay(userId, new Date());
  const missedToday = missed.some(m => toISODate(m.date) === today);

  const adsWeekKey = `${new Date().getFullYear()}-W${Math.ceil((((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000) + new Date(new Date().getFullYear(), 0, 1).getDay() + 1) / 7)}`;
  const adsThisWeek = state.ads_week_key === adsWeekKey ? (state.ads_this_week || 0) : 0;

  const stage = getEvolutionStage(totalWorkouts);

  let mood = 'steady';
  if (adsThisWeek >= 3) mood = 'couch';
  else if (missedToday || (!hasToday && streak === 0)) mood = 'deflated';
  else if (streak >= 3 || hasToday) mood = 'pumped';

  return {
    mood,
    streak,
    stage,
    stage_progress: {
      current: totalWorkouts,
      next_stage: EVOLUTION_STAGES[EVOLUTION_STAGES.indexOf(stage) + 1] || null,
    },
    has_workout_today: hasToday,
    missed_today: missedToday,
    ads_this_week: adsThisWeek,
    avatar_icon: user.avatar_icon || null,
    skin: state.skin || 'ember',
    accessory: state.accessory || 'none',
    custom: null,
    preset: state.preset || null,
    parts: state.parts || {},
    owned_skins: user.owned_skins || ['ember'],
    owned_accessories: user.owned_accessories || ['none'],
    energy: Math.min(1.3, 0.6 + streak * 0.08 + (hasToday ? 0.15 : 0)),
  };
}

export const getTribelingState = getAvatarState;

// ---- Progress / Sessions ----

export async function listProgress({ userId, limit = 50, from, to }) {
  let query = supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(session => ({
    id: session.id,
    date: session.date,
    title: session.notes || 'Workout',
    duration_sec: session.duration_s || 0,
    completed_sets: session.ai_metrics?.completed_sets || 0,
    type: session.ai_metrics?.type || 'workout',
    distance_m: session.ai_metrics?.distance_m || 0,
    snatched: session.ai_metrics?.snatched || false,
    snatched_by: session.ai_metrics?.snatched_by || null,
  }));
}

export async function addProgress({ userId, title, duration_sec, completed_sets, date, type, distance_m }) {
  const payload = {
    user_id: userId,
    date: date || new Date().toISOString().slice(0, 10),
    duration_s: Number(duration_sec || 0),
    completed: true,
    notes: title || 'Workout',
    ai_metrics: {
      completed_sets: Number(completed_sets || 0),
      type: type || 'workout',
      distance_m: Number(distance_m || 0),
    },
  };

  const { data, error } = await supabaseAdmin.from('sessions').insert(payload).select().single();
  if (error) throw error;

  const currentUser = await getUser(userId);
  const newTotal = (currentUser?.total_workouts || 0) + 1;
  const newStreak = await computeCurrentStreakDays(userId);
  await updateUserStats(userId, { total_workouts: newTotal, streak: newStreak });

  return {
    id: data.id,
    date: data.date,
    title: data.notes,
    duration_sec: data.duration_s,
    completed_sets: data.ai_metrics?.completed_sets || 0,
    type: data.ai_metrics?.type || 'workout',
    distance_m: data.ai_metrics?.distance_m || 0,
  };
}

export async function getLatestProgress(userId) {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    date: data.date,
    title: data.notes || 'Workout',
    duration_sec: data.duration_s || 0,
    completed_sets: data.ai_metrics?.completed_sets || 0,
    type: data.ai_metrics?.type || 'workout',
    distance_m: data.ai_metrics?.distance_m || 0,
    snatched: data.ai_metrics?.snatched || false,
    snatched_by: data.ai_metrics?.snatched_by || null,
  };
}

export async function snatchProgress(targetUserId, snatcherUserId) {
  const target = await getUser(targetUserId);
  if (!target) throw new Error('Target not found');

  const latest = await getLatestProgress(targetUserId);
  if (!latest || !(latest.duration_sec > 0)) {
    throw new Error('Target has no progress to snatch');
  }

  const currentMetrics = await supabaseAdmin
    .from('sessions')
    .select('ai_metrics')
    .eq('id', latest.id)
    .single();

  const metrics = { ...(currentMetrics?.data?.ai_metrics || latest) };
  metrics.snatched = true;
  metrics.snatched_by = snatcherUserId;

  const { error } = await supabaseAdmin
    .from('sessions')
    .update({
      duration_s: Math.floor(latest.duration_sec / 2),
      ai_metrics: metrics,
    })
    .eq('id', latest.id);
  if (error) throw error;

  await updateUserStats(targetUserId, { streak: Math.max(0, (target.streak || 0) - 1) });

  return { success: true, duration_sec: Math.floor(latest.duration_sec / 2) };
}

export async function computeCurrentStreakDays(userId) {
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    if (await hasProgressOnDay(userId, d)) streak += 1; else break;
  }
  return streak;
}

export async function listActiveMembers(groupId) {
  const group = await getGroup(groupId);
  if (!group) return [];
  const wnd = Math.max(1, Number(group?.settings?.active_window_days || 7));
  const cutoff = new Date(Date.now() - wnd * 24 * 60 * 60 * 1000).toISOString();
  const members = group.members || [];
  if (members.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('user_id')
    .in('user_id', members)
    .gte('created_at', cutoff);
  if (error) throw error;

  const activeIds = new Set((data || []).map(s => s.user_id));
  return Array.from(activeIds);
}

// ---- Usage limits (streak shield caps) ----

function monthKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function getUsage(userId, d = new Date()) {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const { data, error } = await supabaseAdmin
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || { user_id: userId, year, month, opens: 0, sessions: 0, streak_shield_used: 0 };
}

export async function saveUsage(userId, usage, d = new Date()) {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const existing = await getUsage(userId, d);
  const payload = {
    user_id: userId,
    year,
    month,
    opens: usage.opens ?? existing.opens ?? 0,
    sessions: usage.sessions ?? existing.sessions ?? 0,
    streak_shield_used: usage.streak_shield_used ?? existing.streak_shield_used ?? 0,
  };
  if (existing?.created_at || existing?.user_id) {
    const { error } = await supabaseAdmin
      .from('user_usage')
      .update(payload)
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin.from('user_usage').insert(payload);
    if (error) throw error;
  }
  return payload;
}

export async function applyStreakShield(userId, capPerMonth = 2) {
  const now = new Date();
  const u = await getUsage(userId, now);
  if ((u.streak_shield_used || 0) >= capPerMonth) {
    return false;
  }
  await saveUsage(userId, { streak_shield_used: (u.streak_shield_used || 0) + 1 }, now);
  return true;
}

export async function recordPaidSkip({ userId, userName, groupId, costTc }) {
  await ensureMembership(groupId, userId);
  const group = await getGroup(groupId);
  const payer = await getUser(userId);
  if (!group) throw new Error('Group not found');
  if (!payer) throw new Error('User not found');

  const settings = group.settings || {};
  const cost = Number.isFinite(Number(costTc)) ? Number(costTc) : Number(settings.skip_cost_tc || 10);
  const mode = group.skip_mode || 'teammate_boost';

  if ((payer.wallet_balance_tc || 0) < cost) throw new Error('Insufficient wallet balance');

  await updateUserStats(userId, { wallet_balance_tc: payer.wallet_balance_tc - cost });

  let distributionPerMember = 0;
  let vaultShare = 0;
  let recipients = [];
  const distributionByMember = {};

  if (mode === 'tribe_fund') {
    vaultShare = cost;
  } else {
    const allActive = (await listActiveMembers(groupId)).filter((m) => m !== userId);
    const membersSharePct = Math.min(1, Math.max(0, Number((settings.teammate_boost_pct_members ?? 80)) / 100));
    const vaultSharePct = 1 - membersSharePct;
    const membersShare = Math.round(cost * membersSharePct);

    const weights = [];
    for (const m of allActive) {
      const streak = await computeCurrentStreakDays(m);
      const w = 1 + (streak >= 7 ? 0.1 : 0);
      weights.push({ m, w });
    }
    const totalW = weights.reduce((s, x) => s + x.w, 0);

    if (allActive.length > 0 && totalW > 0) {
      let allocated = 0;
      weights.forEach(({ m, w }) => {
        const amt = Math.floor((w / totalW) * membersShare);
        distributionByMember[m] = amt;
        allocated += amt;
      });
      let rem = membersShare - allocated;
      const byDesc = weights.slice().sort((a, b) => b.w - a.w);
      let i = 0;
      while (rem > 0 && byDesc.length > 0) {
        const mid = byDesc[i % byDesc.length].m;
        distributionByMember[mid] = (distributionByMember[mid] || 0) + 1;
        rem -= 1;
        i += 1;
      }
      recipients = allActive;
      distributionPerMember = membersShare;
    } else {
      vaultShare += membersShare;
    }
    vaultShare += Math.round(cost * vaultSharePct);
  }

  for (const mid of recipients) {
    const mu = await getUser(mid);
    const amt = distributionByMember[mid] != null ? distributionByMember[mid] : distributionPerMember;
    if (mu) {
      await updateUserStats(mid, { snatched_balance_tc: (mu.snatched_balance_tc || 0) + amt });
    }
  }

  if (vaultShare > 0) {
    await addDonor(groupId, userId, userName || payer.name, vaultShare);
  }

  const creditCount = Math.max(0, Number(settings.catch_up_credit_per_skip || 0));
  if (creditCount > 0) {
    await grantCatchUpCredits(userId, creditCount);
  }

  return {
    skipMode: mode,
    recipients,
    distributionPerMember,
    distributionByMember,
    vaultShare,
    streakShield: await applyStreakShield(userId, Math.max(0, Number(settings.streak_shield_cap_per_month || 2))),
    catchUpCredit: creditCount,
    balances: await getBalances({ userId, groupId }),
  };
}

// ---- User-saved workouts (stored as private programs) ----

export async function saveWorkout(userId, workout) {
  const isUpdate = workout?.id && !String(workout.id).startsWith('temp') && !String(workout.id).startsWith('ai-plan');
  const payload = {
    owner_id: userId,
    title: workout.name || workout.title || 'My Workout',
    description: workout.description || '',
    days: [workout],
    public: false,
  };

  if (isUpdate) {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .update({ ...payload, days: [workout] })
      .eq('id', workout.id)
      .eq('owner_id', userId)
      .select()
      .single();
    if (error) throw error;
    return { ...data.days[0], id: data.id, updatedAt: data.updated_at, createdAt: data.created_at };
  }

  const { data, error } = await supabaseAdmin.from('programs').insert(payload).select().single();
  if (error) throw error;
  return { ...data.days[0], id: data.id, createdAt: data.created_at, updatedAt: data.created_at };
}

export async function getWorkouts(userId) {
  const { data, error } = await supabaseAdmin
    .from('programs')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map(p => {
    const workout = Array.isArray(p.days) ? p.days[0] : p.days || {};
    return {
      ...workout,
      id: p.id,
      name: p.title || workout.name || 'My Workout',
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  });
}

export async function deleteWorkout(userId, workoutId) {
  const { error } = await supabaseAdmin
    .from('programs')
    .delete()
    .eq('id', workoutId)
    .eq('owner_id', userId);
  if (error) throw error;
  return { success: true };
}

// ---- Schedules ----

export async function listSchedules({ userId, groupId }) {
  let query = supabaseAdmin
    .from('user_schedules')
    .select('*')
    .eq('user_id', userId)
    .order('start_at', { ascending: true });
  if (groupId) query = query.eq('group_id', groupId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(s => ({
    id: s.id,
    userId: s.user_id,
    groupId: s.group_id,
    title: s.title,
    start_at: s.start_at,
    duration_min: s.duration_min,
  }));
}

export async function addSchedule({ userId, groupId, title, start_at, duration_min = 30 }) {
  const { data, error } = await supabaseAdmin.from('user_schedules').insert({
    user_id: userId,
    group_id: groupId || null,
    title: title || 'Scheduled Workout',
    start_at,
    duration_min: Number(duration_min) || 30,
  }).select().single();
  if (error) throw error;
  return {
    id: data.id,
    userId: data.user_id,
    groupId: data.group_id,
    title: data.title,
    start_at: data.start_at,
    duration_min: data.duration_min,
  };
}

export async function deleteSchedule(scheduleId, userId) {
  const { error } = await supabaseAdmin
    .from('user_schedules')
    .delete()
    .eq('id', scheduleId)
    .eq('user_id', userId);
  if (error) throw error;
  return { success: true };
}

// ---- Calendar ----

export async function getCalendarEvents(userId) {
  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('time', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getCalendarDay({ userId, date }) {
  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('time', { ascending: true });
  if (error) throw error;
  return (data || []).map(e => ({
    id: e.id,
    user_id: e.user_id,
    user_name: e.user_name,
    date: e.date,
    time: e.time,
    workout: e.workout,
    type: e.type,
    shared: e.shared,
    duration: e.duration,
    ai_plan: e.ai_plan,
    created_at: e.created_at,
  }));
}

export async function listCalendar({ userId }) {
  const events = await getCalendarEvents(userId);
  const schedule = {};
  events.forEach(e => {
    if (!schedule[e.date]) schedule[e.date] = [];
    schedule[e.date].push({
      id: e.id,
      user_id: e.user_id,
      user_name: e.user_name,
      date: e.date,
      time: e.time,
      workout: e.workout,
      type: e.type,
      shared: e.shared,
      duration: e.duration,
      ai_plan: e.ai_plan,
      created_at: e.created_at,
    });
  });
  return schedule;
}

export async function addCalendarEntry({ userId, date, time, workout, type = 'general', shared = false, duration = '45 min', user_name = 'User', ai_plan = null }) {
  const { data, error } = await supabaseAdmin.from('calendar_events').insert({
    user_id: userId,
    date,
    time,
    workout,
    type,
    shared: Boolean(shared),
    duration,
    user_name,
    ai_plan,
  }).select().single();
  if (error) throw error;
  return {
    id: data.id,
    user_id: data.user_id,
    user_name: data.user_name,
    date: data.date,
    time: data.time,
    workout: data.workout,
    type: data.type,
    shared: data.shared,
    duration: data.duration,
    ai_plan: data.ai_plan,
    created_at: data.created_at,
  };
}

export async function updateCalendarEntry({ userId, id, changes = {} }) {
  const allowed = {};
  if (changes.date !== undefined) allowed.date = changes.date;
  if (changes.time !== undefined) allowed.time = changes.time;
  if (changes.workout !== undefined) allowed.workout = changes.workout;
  if (changes.type !== undefined) allowed.type = changes.type;
  if (changes.shared !== undefined) allowed.shared = changes.shared;
  if (changes.duration !== undefined) allowed.duration = changes.duration;
  if (Object.keys(allowed).length === 0) return getCalendarDay({ userId, date: changes.date });

  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .update(allowed)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    user_name: data.user_name,
    date: data.date,
    time: data.time,
    workout: data.workout,
    type: data.type,
    shared: data.shared,
    duration: data.duration,
    ai_plan: data.ai_plan,
    created_at: data.created_at,
  };
}

export async function deleteCalendarEntry({ userId, id }) {
  const { error } = await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) return false;
  return true;
}

// ---- Daily Versus ----

export const VERSUS_POT_PER_WORKOUT = 5;

export async function computeDayStandings(group, dayStr) {
  const members = group?.members || [];
  if (members.length === 0) return [];

  const { data: sessions, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .in('user_id', members)
    .eq('date', dayStr)
    .gt('duration_s', 0)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const byUser = {};
  for (const s of sessions || []) {
    if (!byUser[s.user_id]) byUser[s.user_id] = [];
    byUser[s.user_id].push(s);
  }

  const standings = [];
  for (const uid of Object.keys(byUser)) {
    const entries = byUser[uid];
    const user = await getUser(uid);
    const workouts = entries.length;
    const minutes = Math.round(entries.reduce((sum, e) => sum + (e.duration_s || 0), 0) / 60);
    const stage = getEvolutionStage(user?.total_workouts || 0);
    const state = user?.avatar_state || {};
    standings.push({
      user_id: uid,
      name: user?.name || uid,
      workouts,
      minutes,
      first_at: entries[0]?.created_at || null,
      avatar: { skin: state.skin || 'ember', accessory: state.accessory || 'none', stage: stage.id },
    });
  }

  return standings
    .filter(s => s.workouts > 0)
    .sort((a, b) => b.minutes - a.minutes || new Date(a.first_at) - new Date(b.first_at));
}

export async function getDailyVersus(groupId) {
  const group = await getGroup(groupId);
  if (!group) throw new Error('Group not found');

  const todayStr = toISODate(new Date());
  const yesterdayStr = toISODate(new Date(Date.now() - 86400000));

  // Settle yesterday if not already
  const { data: yesterdayRows } = await supabaseAdmin
    .from('daily_versus')
    .select('*')
    .eq('group_id', groupId)
    .eq('date', yesterdayStr);

  let lastResult = null;
  const yesterdayRow = yesterdayRows?.[0];
  if (yesterdayRow && !yesterdayRow.winner_id) {
    const yStandings = await computeDayStandings(group, yesterdayStr);
    if (yStandings.length > 0) {
      const winner = yStandings[0];
      const pot = yStandings.reduce((s, x) => s + x.workouts, 0) * VERSUS_POT_PER_WORKOUT;
      const wUser = await getUser(winner.user_id);
      if (wUser) {
        await updateUserStats(winner.user_id, { wallet_balance_tc: (wUser.wallet_balance_tc || 0) + pot });
      }
      await supabaseAdmin.from('daily_versus').update({
        winner_id: winner.user_id,
        pot_tc: pot,
        standings: yStandings,
      }).eq('id', yesterdayRow.id);
      lastResult = { day: yesterdayStr, winner_id: winner.user_id, winner_name: winner.name, pot };
    }
  } else if (yesterdayRow?.winner_id) {
    lastResult = {
      day: yesterdayStr,
      winner_id: yesterdayRow.winner_id,
      winner_name: yesterdayRow.standings?.[0]?.name || yesterdayRow.winner_id,
      pot: yesterdayRow.pot_tc,
    };
  }

  // Ensure today's row exists
  const { data: todayRows } = await supabaseAdmin
    .from('daily_versus')
    .select('*')
    .eq('group_id', groupId)
    .eq('date', todayStr);

  const todayStandings = await computeDayStandings(group, todayStr);
  const pot = todayStandings.reduce((s, x) => s + x.workouts, 0) * VERSUS_POT_PER_WORKOUT;

  if (todayRows?.[0]) {
    await supabaseAdmin.from('daily_versus').update({
      pot_tc: pot,
      standings: todayStandings,
    }).eq('id', todayRows[0].id);
  } else {
    await supabaseAdmin.from('daily_versus').insert({
      group_id: groupId,
      date: todayStr,
      pot_tc: pot,
      winner_id: null,
      standings: todayStandings,
    });
  }

  return {
    day: todayStr,
    pot,
    standings: todayStandings,
    last_result: lastResult,
    member_count: group.members.length,
  };
}

// ---- Governance: Mode Voting ----

function serializeVote(row) {
  if (!row) return null;
  return {
    id: row.id,
    groupId: row.group_id,
    proposerId: row.proposer_id,
    targetMode: row.target_mode,
    opened_at: row.started_at,
    closes_at: row.ends_at,
    votes: row.votes || {},
    finalized: row.status !== 'active',
    finalized_at: row.status !== 'active' ? row.created_at : null,
    status: row.status,
    result_mode: row.result_mode,
  };
}

export async function getModeVote(groupId) {
  const { data, error } = await supabaseAdmin
    .from('group_mode_votes')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return serializeVote(data);
}

export async function startModeVote({ groupId, proposerId, targetMode, durationHours = 72, cooldownDays = 30 }) {
  const group = await getGroup(groupId);
  if (!group) throw new Error('Group not found');
  if (proposerId) await ensureMembership(groupId, proposerId);

  const now = new Date();
  const last = group.settings?.upgraded_at || group.settings?.last_mode_change_at;
  if (last && now.getTime() - new Date(last).getTime() < cooldownDays * 24 * 60 * 60 * 1000) {
    throw new Error('Mode change cooldown active');
  }

  const existing = await getModeVote(groupId);
  if (existing && !existing.finalized) throw new Error('A vote is already in progress');

  const durHrs = Number.isFinite(Number(durationHours)) ? Number(durationHours) : Number(group?.settings?.vote_duration_hours || 72);
  const openedAt = now.toISOString();
  const closesAt = new Date(now.getTime() + durHrs * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin.from('group_mode_votes').insert({
    group_id: groupId,
    proposer_id: proposerId,
    target_mode: targetMode === 'tribe_fund' ? 'tribe_fund' : 'teammate_boost',
    votes: {},
    started_at: openedAt,
    ends_at: closesAt,
    status: 'active',
  }).select().single();
  if (error) throw error;

  return serializeVote(data);
}

async function computeVoteTotals(groupId, vote) {
  const active = await listActiveMembers(groupId);
  const eligible = active.length || 0;
  const yes = active.filter((uid) => vote.votes?.[uid] === true).length;
  const no = active.filter((uid) => vote.votes?.[uid] === false).length;
  const g = await getGroup(groupId);
  const pct = Math.min(100, Math.max(0, Number(g?.settings?.vote_majority_percent || 50)));
  const required = eligible === 0 ? 0 : Math.ceil(eligible * (pct / 100));
  return { yes, no, eligible, required };
}

export async function castModeVote({ groupId, userId, support }) {
  if (userId) await ensureMembership(groupId, userId);
  let vote = await getModeVote(groupId);
  if (!vote) throw new Error('No active vote');
  if (vote.finalized) {
    const totals = await computeVoteTotals(groupId, vote);
    return { vote, totals };
  }

  const now = new Date();
  if (new Date(vote.closes_at).getTime() <= now.getTime()) {
    return finalizeModeVote(groupId);
  }

  const nextVotes = { ...vote.votes, [userId]: !!support };
  await supabaseAdmin.from('group_mode_votes').update({ votes: nextVotes }).eq('id', vote.id);
  vote = { ...vote, votes: nextVotes };

  const totals = await computeVoteTotals(groupId, vote);
  if (totals.yes >= totals.required) {
    return finalizeModeVote(groupId, { forcePass: true });
  }
  return { vote, totals };
}

export async function finalizeModeVote(groupId, { forcePass = false } = {}) {
  let vote = await getModeVote(groupId);
  if (!vote) throw new Error('No active vote');
  if (vote.finalized) {
    const totals = await computeVoteTotals(groupId, vote);
    return { vote, passed: false, totals };
  }

  let passed = false;
  if (forcePass) {
    passed = true;
  } else {
    const totals = await computeVoteTotals(groupId, vote);
    passed = totals.yes >= totals.required;
  }

  let newMode = null;
  if (passed) {
    const g = await setGroupSkipMode(groupId, vote.targetMode);
    newMode = g.skip_mode;
  }

  await supabaseAdmin.from('group_mode_votes').update({
    status: passed ? 'passed' : 'failed',
    result_mode: newMode,
  }).eq('id', vote.id);

  const totals = await computeVoteTotals(groupId, vote);
  const updated = { ...vote, finalized: true, finalized_at: new Date().toISOString(), status: passed ? 'passed' : 'failed', result_mode: newMode };
  return { vote: updated, passed, newMode, totals };
}

export async function getModeVoteWithTotals(groupId) {
  const vote = await getModeVote(groupId);
  if (!vote) return null;
  const totals = await computeVoteTotals(groupId, vote);
  return { vote, totals };
}

// ---- Coach System ----

export async function getCoachProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('coach_profiles')
    .select('*, users(name, total_workouts, streak)')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  const user = data.users || {};
  return {
    id: data.user_id,
    user_id: data.user_id,
    name: user.name,
    tier: data.tier,
    status: data.tier === 'candidate' ? 'pending' : 'active',
    tribe_id: null,
    bio: data.bio,
    specialties: data.specialties || [],
    pricing: data.pricing || { per_session: 15 },
    avg_rating: Number(data.rating_avg || 0),
    total_sessions: 0,
    total_earnings_tc: 0,
    clients_count: data.total_clients || 0,
    total_workouts: user.total_workouts,
    streak: user.streak,
    created_at: data.created_at,
  };
}

export async function listCoaches(filters = {}) {
  let query = supabaseAdmin
    .from('coach_profiles')
    .select('*, users(name, total_workouts, streak)')
    .in('tier', ['certified', 'pro']);

  if (filters.tribeId) {
    // Coaches are not bound to a single tribe; filter by clients in tribe? Not stored.
    // For now, no tribe filter.
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(row => {
    const user = row.users || {};
    return {
      id: row.user_id,
      user_id: row.user_id,
      name: user.name,
      tier: row.tier,
      status: row.tier === 'candidate' ? 'pending' : 'active',
      tribe_id: null,
      bio: row.bio,
      specialties: row.specialties || [],
      pricing: row.pricing || { per_session: 15 },
      avg_rating: Number(row.rating_avg || 0),
      total_sessions: row.total_sessions || 0,
      total_earnings_tc: row.total_earnings_tc || 0,
      clients_count: row.total_clients || 0,
      total_workouts: user.total_workouts || 0,
      streak: user.streak || 0,
      created_at: row.created_at,
    };
  }).sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
}

export async function createCoachProfile({ userId, name, tribeId, bio = '', specialties = [], pricing = {} }) {
  const payload = {
    user_id: userId,
    tier: 'certified',
    bio,
    specialties: Array.isArray(specialties) ? specialties : [],
    pricing: pricing?.per_session ? pricing : { per_session: 15 },
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  const { error } = await supabaseAdmin.from('coach_profiles').insert(payload);
  if (error) throw error;
  return getCoachProfile(userId);
}

export async function updateCoachProfile(userId, changes = {}) {
  const allowed = {};
  if (changes.bio !== undefined) allowed.bio = changes.bio;
  if (changes.specialties !== undefined) allowed.specialties = Array.isArray(changes.specialties) ? changes.specialties : [];
  if (changes.pricing !== undefined) allowed.pricing = changes.pricing;
  if (changes.tier !== undefined) allowed.tier = changes.tier;
  if (changes.total_clients !== undefined) allowed.total_clients = changes.total_clients;
  if (changes.rating_avg !== undefined) allowed.rating_avg = changes.rating_avg;
  if (changes.rating_count !== undefined) allowed.rating_count = changes.rating_count;
  if (Object.keys(allowed).length === 0) return getCoachProfile(userId);
  allowed.updated_at = nowIso();
  const { error } = await supabaseAdmin.from('coach_profiles').update(allowed).eq('user_id', userId);
  if (error) throw error;
  return getCoachProfile(userId);
}

export async function getCoachApplication(userId) {
  const { data, error } = await supabaseAdmin
    .from('coach_applications')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createCoachApplication({ userId, name, tribeId }) {
  const { data, error } = await supabaseAdmin.from('coach_applications').insert({
    user_id: userId,
    status: 'pending',
    submitted_at: nowIso(),
  }).select().single();
  if (error) throw error;
  return data;
}

export async function approveCoachApplication(userId, pricing = {}) {
  const app = await getCoachApplication(userId);
  if (!app) return null;
  await supabaseAdmin.from('coach_applications').update({ status: 'approved', reviewed_at: nowIso() }).eq('id', app.id);
  const profile = await createCoachProfile({ userId, name: '', bio: '', specialties: [], pricing });
  return { application: { ...app, status: 'approved' }, profile };
}

export async function getCoachEligibility(userId) {
  const user = await getUser(userId);
  const profile = await getCoachProfile(userId);
  const application = await getCoachApplication(userId);

  if (profile && profile.status === 'active') {
    return { eligible: true, isCoach: true, applicationPending: false, reason: 'Already a coach' };
  }
  if (application && application.status === 'pending') {
    return { eligible: false, isCoach: false, applicationPending: true, reason: 'Application under review' };
  }

  const REQUIREMENTS = { minStreak: 14, minWorkouts: 30, mustBeInTribe: true };
  // Determine group type from tribes user owns or is member of
  const tribes = await listUserTribes(userId);
  const inTribe = tribes.some(g => g.group_type === 'tribe');

  const checks = {
    inTribe,
    streak: (user?.streak || 0) >= REQUIREMENTS.minStreak,
    workouts: (user?.total_workouts || 0) >= REQUIREMENTS.minWorkouts,
  };
  const eligible = checks.inTribe && checks.streak && checks.workouts;
  return {
    eligible,
    isCoach: false,
    applicationPending: false,
    checks,
    requirements: REQUIREMENTS,
    userStats: { streak: user?.streak || 0, totalWorkouts: user?.total_workouts || 0, groupType: inTribe ? 'tribe' : 'squad' },
  };
}

export async function createCoachHire({ clientId, coachId, priceTc }) {
  const { data, error } = await supabaseAdmin.from('coach_hires').insert({
    coach_id: coachId,
    client_id: clientId,
    price_tc: Number(priceTc),
    status: 'active',
    started_at: nowIso(),
  }).select().single();
  if (error) throw error;

  // also create coach_clients record
  await supabaseAdmin.from('coach_clients').insert({
    coach_id: coachId,
    client_id: clientId,
    start_date: toISODate(new Date()),
    status: 'active',
  }).select().maybeSingle();

  await updateCoachProfile(coachId, { total_clients: (await getCoachProfile(coachId)).clients_count + 1 });
  return data;
}

export async function recordCoachSession({ hireId, coachId, clientId, priceTc }) {
  const platformFee = Math.round(Number(priceTc) * 0.1);
  const coachEarnings = Number(priceTc) - platformFee;

  const { data: session, error } = await supabaseAdmin.from('coach_sessions').insert({
    hire_id: hireId,
    coach_id: coachId,
    client_id: clientId,
    price_tc: Number(priceTc),
    status: 'completed',
    completed_at: nowIso(),
  }).select().single();
  if (error) throw error;

  const coachProfile = await getCoachProfile(coachId);
  if (coachProfile) {
    await updateCoachProfile(coachId, {
      total_earnings_tc: (coachProfile.total_earnings_tc || 0) + coachEarnings,
      total_sessions: (coachProfile.total_sessions || 0) + 1,
    });
  }

  return { session, coachEarnings, platformFee };
}

export async function addCoachRating({ hireId, coachId, clientId, stars, text = '' }) {
  const { data: rating, error } = await supabaseAdmin.from('coach_ratings').insert({
    hire_id: hireId,
    coach_id: coachId,
    client_id: clientId,
    stars: Number(stars),
    text,
    created_at: nowIso(),
  }).select().single();
  if (error) throw error;

  const { data: allRatings } = await supabaseAdmin
    .from('coach_ratings')
    .select('stars')
    .eq('coach_id', coachId);
  const avg = (allRatings || []).reduce((s, r) => s + (r.stars || 0), 0) / Math.max(1, (allRatings || []).length);
  await updateCoachProfile(coachId, {
    rating_avg: Math.round(avg * 10) / 10,
    rating_count: (allRatings || []).length,
  });

  return rating;
}

// ---- Calendar settings and Google tokens ----

export async function getCalendarSettings(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_calendar_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || { calendars: [], keywords: '', ics_url: null };
}

export async function setCalendarSettings(userId, { calendars, keywords, ics_url }) {
  const existing = await getCalendarSettings(userId);
  const payload = {
    user_id: userId,
    calendars: calendars !== undefined ? calendars : (existing?.calendars || []),
    keywords: keywords !== undefined ? keywords : (existing?.keywords || ''),
    ics_url: ics_url !== undefined ? ics_url : (existing?.ics_url || null),
    updated_at: nowIso(),
  };

  if (existing?.user_id) {
    const { error } = await supabaseAdmin
      .from('user_calendar_settings')
      .update(payload)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin.from('user_calendar_settings').insert(payload);
    if (error) throw error;
  }
  return getCalendarSettings(userId);
}

export async function setAppleCalendarSettings(userId, { icsUrl }) {
  return setCalendarSettings(userId, { ics_url: icsUrl });
}

export async function getGoogleToken(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    scope: data.scope,
    token_type: data.token_type,
    expiry_date: data.expiry_date,
  };
}

export async function setGoogleToken(userId, tokens) {
  const { data: existing } = await supabaseAdmin
    .from('user_google_tokens')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  const payload = {
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    scope: tokens.scope,
    token_type: tokens.token_type,
    expiry_date: tokens.expiry_date,
    updated_at: nowIso(),
  };

  if (existing?.user_id) {
    const { error } = await supabaseAdmin.from('user_google_tokens').update(payload).eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin.from('user_google_tokens').insert(payload);
    if (error) throw error;
  }
  return tokens;
}
