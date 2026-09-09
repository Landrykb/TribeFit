import { loadDB, saveDB as saveDBToFile } from './fsdb';

// Simple in-memory store for dev/testing. Resets on server restart.

function getDB() {
  if (!globalThis.__DB__) {
    const persisted = loadDB();
    if (persisted && typeof persisted === 'object') {
      globalThis.__DB__ = persisted;
    } else {
      globalThis.__DB__ = {
        users: {},
        groups: {},
        usageByUser: {},
        votesByGroup: {},
        schedulesByUser: {}, // { [userId]: [{ id, groupId, title, start_at, duration_min } ...] }
        googleTokensByUser: {}, // { [userId]: { access_token, refresh_token, expiry_date } }
        calendarSettingsByUser: {}, // { [userId]: { calendars: string[], keywords: string } }
        calendarByUser: {}, // { [userId]: { [YYYY-MM-DD]: [ { id, user_id, user_name, time, workout, type, shared, duration, ai_plan? } ] } }
        progressByUser: {}, // { [userId]: [ { id, date, title, duration_sec, completed_sets } ] }
        creditsByUser: {}, // { [userId]: [ { id, created_at, expires_at } ] }
        missedWorkoutsByUser: {}, // { [userId]: [ { id, date, title, type, ai_plan } ] }
      };

      // Seed with default SQUADS only (tribes are evolved from squads)
      const alphaSquadId = '10000000-0000-0000-0000-000000000001';
      const betaSquadId = '10000000-0000-0000-0000-000000000002';
      
      // Alpha Squad - empty, ready for members to join
      globalThis.__DB__.groups[alphaSquadId] = {
        id: alphaSquadId,
        name: 'Alpha Squad',
        description: 'The original fitness crew',
        type: 'squad',
        group_type: 'squad',
        members: [],
        member_count: 0,
        streak_days: 0,
        participation_rate: 0,
        donors: [],
        pact_balance_tc: 0,
      };
      
      // Beta Squad - empty, ready for new members
      globalThis.__DB__.groups[betaSquadId] = {
        id: betaSquadId,
        name: 'Beta Squad',
        description: 'Join us and start your journey!',
        type: 'squad',
        group_type: 'squad',
        members: [],
        member_count: 0,
        streak_days: 0,
        participation_rate: 0,
        donors: [],
        pact_balance_tc: 0,
      };

      // Seed test users (NOT in any group - they join manually)
      ['u_alice', 'u_bob', 'u_carol', 'u_david', 'u_emily', 'u_frank', 'u_grace', 'u_henry'].forEach((uid, i) => {
        globalThis.__DB__.users[uid] = {
          id: uid,
          name: uid.replace('u_', '').replace(/\b\w/g, c => c.toUpperCase()),
          wallet_balance_tc: 500 + i * 25,
          snatched_balance_tc: 0,
          streak: 0,
          total_workouts: 0,
          group_id: null,
          group_type: null,
        };
      });
      saveDBToFile(globalThis.__DB__);
    }

    // Ensure new fields exist when loading older DBs
    if (!globalThis.__DB__.users) globalThis.__DB__.users = {};
    if (!globalThis.__DB__.groups) globalThis.__DB__.groups = {};
    if (!globalThis.__DB__.usageByUser) globalThis.__DB__.usageByUser = {};
    if (!globalThis.__DB__.votesByGroup) globalThis.__DB__.votesByGroup = {};
    if (!globalThis.__DB__.schedulesByUser) globalThis.__DB__.schedulesByUser = {};
    if (!globalThis.__DB__.googleTokensByUser) globalThis.__DB__.googleTokensByUser = {};
    if (!globalThis.__DB__.calendarSettingsByUser) globalThis.__DB__.calendarSettingsByUser = {};
    if (!globalThis.__DB__.calendarByUser) globalThis.__DB__.calendarByUser = {};
    if (!globalThis.__DB__.progressByUser) globalThis.__DB__.progressByUser = {};
    if (!globalThis.__DB__.creditsByUser) globalThis.__DB__.creditsByUser = {};
    if (!globalThis.__DB__.missedWorkoutsByUser) globalThis.__DB__.missedWorkoutsByUser = {};
  }
  // Always ensure required containers exist (hot-reload safe)
  if (!globalThis.__DB__.users) globalThis.__DB__.users = {};
  if (!globalThis.__DB__.groups) globalThis.__DB__.groups = {};
  if (!globalThis.__DB__.schedulesByUser) globalThis.__DB__.schedulesByUser = {};
  if (!globalThis.__DB__.googleTokensByUser) globalThis.__DB__.googleTokensByUser = {};
  if (!globalThis.__DB__.calendarSettingsByUser) globalThis.__DB__.calendarSettingsByUser = {};
  if (!globalThis.__DB__.calendarByUser) globalThis.__DB__.calendarByUser = {};
  if (!globalThis.__DB__.progressByUser) globalThis.__DB__.progressByUser = {};

  return globalThis.__DB__;
}

// ---- Google Tokens ----
export function getGoogleToken(userId) {
  const db = getDB();
  if (!db.googleTokensByUser || typeof db.googleTokensByUser !== 'object') db.googleTokensByUser = {};
  return db.googleTokensByUser[userId] || null;
}

export function setGoogleToken(userId, token) {
  const db = getDB();
  if (!db.googleTokensByUser || typeof db.googleTokensByUser !== 'object') db.googleTokensByUser = {};
  db.googleTokensByUser[userId] = { ...(db.googleTokensByUser[userId] || {}), ...(token || {}) };
  saveDBToFile(db);
  return db.googleTokensByUser[userId];
}

export function getUser(userId) {
  const db = getDB();
  if (!db.users || typeof db.users !== 'object') db.users = {};
  if (!db.users[userId]) {
    db.users[userId] = {
      id: userId,
      name: userId,
      wallet_balance_tc: 500,
      snatched_balance_tc: 0,
      streak: 0,
      total_workouts: 0,
      group_id: null,
      group_type: null,
    };
  }
  // Ensure all fields exist for existing users
  if (!db.users[userId].streak) db.users[userId].streak = 0;
  if (!db.users[userId].total_workouts) db.users[userId].total_workouts = 0;
  if (!db.users[userId].group_id) db.users[userId].group_id = null;
  if (!db.users[userId].group_type) db.users[userId].group_type = null;
  
  return db.users[userId];
}

export function getGroup(groupId) {
  const db = getDB();
  if (!db.groups || typeof db.groups !== 'object') db.groups = {};
  if (!db.groups[groupId]) {
    db.groups[groupId] = {
      id: groupId,
      name: `Group ${groupId.slice(0, 4)}`,
      type: 'tribe',
      members: [],
      donors: [],
      pact_balance_tc: 300,
      skip_mode: 'teammate_boost',
      last_mode_change_at: new Date().toISOString(),
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
      },
    };
  }
  return db.groups[groupId];
}

export function listGroups() {
  const db = getDB();
  return Object.values(db.groups);
}

export function ensureMembership(groupId, userId) {
  const group = getGroup(groupId);
  if (!group.members.includes(userId)) {
    group.members.unshift(userId);
    group.member_count = group.members.length;
  }
  return group;
}

export function addDonor(groupId, userId, name, amountTc) {
  const group = getGroup(groupId);
  group.donors.unshift({ id: userId, name: name || userId, amount_tc: Number(amountTc) });
  group.donors = group.donors.slice(0, 25);
  return group.donors;
}

export function getDonors(groupId) {
  const group = getGroup(groupId);
  return group.donors;
}

export function getBalances({ userId, groupId }) {
  const user = getUser(userId);
  const group = getGroup(groupId);
  return {
    wallet: user.wallet_balance_tc,
    snatched: user.snatched_balance_tc,
    pact: group.pact_balance_tc,
  };
}

// ---- Group Mode & Activity ----
export function setGroupSkipMode(groupId, mode) {
  const group = getGroup(groupId);
  const next = (mode === 'tribe_fund') ? 'tribe_fund' : 'teammate_boost';
  group.skip_mode = next;
  group.last_mode_change_at = new Date().toISOString();
  saveDB(getDB());
  return group;
}

export function getGroupSkipMode(groupId) {
  const group = getGroup(groupId);
  return group.skip_mode || 'teammate_boost';
}

export function listActiveMembers(groupId) {
  const db = getDB();
  const group = getGroup(groupId);
  const wnd = Math.max(1, Number(group?.settings?.active_window_days || 7));
  const cutoff = Date.now() - wnd * 24 * 60 * 60 * 1000;
  const isActive = (uid) => {
    const list = (db.progressByUser && db.progressByUser[uid]) || [];
    for (const p of list) {
      const ts = new Date(p.date).getTime();
      if (!Number.isNaN(ts) && ts >= cutoff) return true;
    }
    return false;
  };
  return (group.members || []).filter((m) => isActive(m));
}

// ---- Streak helpers ----
function dateKey(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hasProgressOnDay(db, userId, d) {
  const dayKey = dateKey(d);
  const list = (db.progressByUser && db.progressByUser[userId]) || [];
  return list.some((p) => dateKey(p.date) === dayKey && Number(p.duration_sec || 0) > 0);
}

export function computeCurrentStreakDays(userId) {
  const db = getDB();
  let streak = 0;
  const now = new Date();
  // Count consecutive days ending today
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    if (hasProgressOnDay(db, userId, d)) streak += 1; else break;
  }
  return streak;
}

// ---- Catch-Up Credits (expire end of calendar week) ----
function endOfCalendarWeek(d = new Date()) {
  const dt = new Date(d);
  const day = dt.getDay(); // 0=Sun ... 6=Sat
  const diff = 6 - day; // end on Saturday 23:59:59 (or change to 0 for Sunday)
  const end = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + diff, 23, 59, 59, 999);
  return end.toISOString();
}

export function listCatchUpCredits(userId) {
  const db = getDB();
  if (!db.creditsByUser || typeof db.creditsByUser !== 'object') db.creditsByUser = {};
  const now = Date.now();
  const all = db.creditsByUser[userId] || [];
  const valid = all.filter((c) => new Date(c.expires_at).getTime() > now);
  // Purge expired
  db.creditsByUser[userId] = valid;
  saveDBToFile(db);
  return valid.slice();
}

export function grantCatchUpCredits(userId, count = 1) {
  const db = getDB();
  if (!db.creditsByUser || typeof db.creditsByUser !== 'object') db.creditsByUser = {};
  if (!db.creditsByUser[userId]) db.creditsByUser[userId] = [];
  const expires_at = endOfCalendarWeek();
  for (let i = 0; i < (Number(count) || 0); i++) {
    db.creditsByUser[userId].push({ id: `cred_${Date.now()}_${Math.floor(Math.random()*1e6)}`, created_at: new Date().toISOString(), expires_at });
  }
  saveDBToFile(db);
  return listCatchUpCredits(userId).length;
}

export function consumeCatchUpCredit(userId) {
  const db = getDB();
  const list = listCatchUpCredits(userId);
  if (list.length === 0) return false;
  // remove oldest
  const oldestId = list[0].id;
  db.creditsByUser[userId] = (db.creditsByUser[userId] || []).filter((c) => c.id !== oldestId);
  saveDBToFile(db);
  return true;
}

// ---- Missed Workouts ----
export function addMissedWorkout({ userId, id, date, title, type, ai_plan }) {
  const db = getDB();
  if (!db.missedWorkoutsByUser || typeof db.missedWorkoutsByUser !== 'object') db.missedWorkoutsByUser = {};
  if (!db.missedWorkoutsByUser[userId]) db.missedWorkoutsByUser[userId] = [];
  db.missedWorkoutsByUser[userId].unshift({ id: id || `miss_${Date.now()}`, date: date || new Date().toISOString(), title: title || 'Workout', type: type || 'general', ai_plan: ai_plan || null });
  // cap list
  db.missedWorkoutsByUser[userId] = db.missedWorkoutsByUser[userId].slice(0, 50);
  saveDBToFile(db);
  return db.missedWorkoutsByUser[userId];
}

export function getMissedWorkouts(userId) {
  const db = getDB();
  if (!db.missedWorkoutsByUser || typeof db.missedWorkoutsByUser !== 'object') db.missedWorkoutsByUser = {};
  return (db.missedWorkoutsByUser[userId] || []).slice();
}

export function popLatestMissedWorkout(userId) {
  const db = getDB();
  if (!db.missedWorkoutsByUser || typeof db.missedWorkoutsByUser !== 'object') db.missedWorkoutsByUser = {};
  const list = db.missedWorkoutsByUser[userId] || [];
  const item = list.shift() || null;
  db.missedWorkoutsByUser[userId] = list;
  saveDBToFile(db);
  return item;
}

export function removeMissedWorkout(userId, id) {
  const db = getDB();
  if (!db.missedWorkoutsByUser || typeof db.missedWorkoutsByUser !== 'object') db.missedWorkoutsByUser = {};
  const list = db.missedWorkoutsByUser[userId] || [];
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const [removed] = list.splice(idx, 1);
  db.missedWorkoutsByUser[userId] = list;
  saveDBToFile(db);
  return removed || null;
}

// ---- Group Settings helpers ----
export function getGroupSettings(groupId) {
  const g = getGroup(groupId);
  return { ...(g.settings || {}) };
}

export function setGroupSettings(groupId, partial = {}) {
  const g = getGroup(groupId);
  const s = { ...(g.settings || {}) };
  const coerceInt = (v, def) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : def;
  };
  const coercePct = (v, def) => Math.min(100, Math.max(0, coerceInt(v, def)));
  const next = {
    active_window_days: coerceInt(partial.active_window_days ?? s.active_window_days, s.active_window_days),
    vote_duration_hours: coerceInt(partial.vote_duration_hours ?? s.vote_duration_hours, s.vote_duration_hours),
    vote_majority_percent: coercePct(partial.vote_majority_percent ?? s.vote_majority_percent, s.vote_majority_percent),
    teammate_boost_pct_members: coercePct(partial.teammate_boost_pct_members ?? s.teammate_boost_pct_members, s.teammate_boost_pct_members),
    teammate_boost_pct_vault: coercePct(partial.teammate_boost_pct_vault ?? s.teammate_boost_pct_vault, s.teammate_boost_pct_vault),
    catch_up_credit_per_skip: coerceInt(partial.catch_up_credit_per_skip ?? s.catch_up_credit_per_skip, s.catch_up_credit_per_skip),
    streak_shield_cap_per_month: coerceInt(partial.streak_shield_cap_per_month ?? s.streak_shield_cap_per_month, s.streak_shield_cap_per_month),
    skip_cost_tc: coerceInt(partial.skip_cost_tc ?? s.skip_cost_tc, s.skip_cost_tc),
    snitch_ad_threshold: coerceInt(partial.snitch_ad_threshold ?? s.snitch_ad_threshold, s.snitch_ad_threshold),
    require_vote_for_mode_change: Boolean(partial.require_vote_for_mode_change ?? s.require_vote_for_mode_change),
  };
  // Normalize teammate_boost percentages if sum out of 100
  const sum = next.teammate_boost_pct_members + next.teammate_boost_pct_vault;
  if (sum !== 100) {
    // Scale proportionally or fallback to 80/20
    if (sum > 0) {
      next.teammate_boost_pct_members = Math.round((next.teammate_boost_pct_members / sum) * 100);
      next.teammate_boost_pct_vault = 100 - next.teammate_boost_pct_members;
    } else {
      next.teammate_boost_pct_members = 80;
      next.teammate_boost_pct_vault = 20;
    }
  }
  g.settings = next;
  saveDB(getDB());
  return getGroupSettings(groupId);
}

// ---- Governance: Mode Voting ----
export function getModeVote(groupId) {
  const db = getDB();
  if (!db.votesByGroup || typeof db.votesByGroup !== 'object') db.votesByGroup = {};
  const v = db.votesByGroup[groupId] || null;
  if (!v) return null;
  return { ...v, votes: { ...(v.votes || {}) } };
}

export function startModeVote({ groupId, proposerId, targetMode, durationHours = 72, cooldownDays = 30 }) {
  const db = getDB();
  if (!db.votesByGroup || typeof db.votesByGroup !== 'object') db.votesByGroup = {};
  const group = getGroup(groupId);
  // Ensure proposer is a member
  if (proposerId) ensureMembership(groupId, proposerId);
  const now = new Date();
  // Cooldown: 30 days since last change
  const last = group.last_mode_change_at ? new Date(group.last_mode_change_at) : null;
  if (last && now.getTime() - last.getTime() < cooldownDays * 24 * 60 * 60 * 1000) {
    throw new Error('Mode change cooldown active');
  }
  if (db.votesByGroup[groupId] && !db.votesByGroup[groupId].finalized) {
    throw new Error('A vote is already in progress');
  }
  const durHrs = Number.isFinite(Number(durationHours)) ? Number(durationHours) : Number(group?.settings?.vote_duration_hours || 72);
  const openedAt = now.toISOString();
  const closesAt = new Date(now.getTime() + durHrs * 60 * 60 * 1000).toISOString();
  const vote = {
    id: `vote_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
    groupId,
    proposerId,
    targetMode: (targetMode === 'tribe_fund') ? 'tribe_fund' : 'teammate_boost',
    opened_at: openedAt,
    closes_at: closesAt,
    votes: {}, // { [userId]: true|false }
    finalized: false,
  };
  db.votesByGroup[groupId] = vote;
  saveDBToFile(db);
  return getModeVote(groupId);
}

export function castModeVote({ groupId, userId, support }) {
  const db = getDB();
  if (userId) ensureMembership(groupId, userId);
  const vote = getModeVote(groupId);
  if (!vote) throw new Error('No active vote');
  if (vote.finalized) return { vote, totals: computeVoteTotals(groupId, vote) };
  const now = new Date();
  if (new Date(vote.closes_at).getTime() <= now.getTime()) {
    const fin = finalizeModeVote(groupId);
    return { vote: fin.vote, finalized: true, passed: fin.passed, newMode: fin.newMode, totals: fin.totals };
  }
  vote.votes[userId] = !!support;
  db.votesByGroup[groupId] = vote;
  saveDBToFile(db);
  // Check immediate majority of active members
  const totals = computeVoteTotals(groupId, vote);
  if (totals.yes >= totals.required) {
    const fin = finalizeModeVote(groupId, { forcePass: true });
    return { vote: fin.vote, finalized: true, passed: true, newMode: fin.newMode, totals: fin.totals };
  }
  return { vote, totals };
}

function computeVoteTotals(groupId, vote) {
  const active = listActiveMembers(groupId);
  const eligible = active.length || 0;
  const yes = active.filter((uid) => vote.votes[uid] === true).length;
  const no = active.filter((uid) => vote.votes[uid] === false).length;
  const g = getGroup(groupId);
  const pct = Math.min(100, Math.max(0, Number(g?.settings?.vote_majority_percent || 50)));
  const required = eligible === 0 ? 0 : Math.ceil(eligible * (pct / 100));
  return { yes, no, eligible, required };
}

export function finalizeModeVote(groupId, { forcePass = false } = {}) {
  const db = getDB();
  if (!db.votesByGroup || typeof db.votesByGroup !== 'object') db.votesByGroup = {};
  const vote = getModeVote(groupId);
  if (!vote) throw new Error('No active vote');
  if (vote.finalized) return { vote, passed: false, totals: computeVoteTotals(groupId, vote) };
  let passed = false;
  if (forcePass) {
    passed = true;
  } else {
    const totals = computeVoteTotals(groupId, vote);
    passed = totals.yes >= totals.required;
  }
  let newMode = null;
  if (passed) {
    const g = setGroupSkipMode(groupId, vote.targetMode);
    newMode = g.skip_mode;
  }
  db.votesByGroup[groupId] = { ...vote, finalized: true, finalized_at: new Date().toISOString() };
  saveDBToFile(db);
  const totals = computeVoteTotals(groupId, vote);
  return { vote: db.votesByGroup[groupId], passed, newMode, totals };
}

export function getModeVoteWithTotals(groupId) {
  const vote = getModeVote(groupId);
  if (!vote) return null;
  const totals = computeVoteTotals(groupId, vote);
  return { vote, totals };
}

// ---- Usage limits (streak shield caps) ----
function monthKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getUsage(userId) {
  const db = getDB();
  if (!db.usageByUser || typeof db.usageByUser !== 'object') db.usageByUser = {};
  if (!db.usageByUser[userId]) db.usageByUser[userId] = {};
  return db.usageByUser[userId];
}

function saveUsage(userId, usage) {
  const db = getDB();
  if (!db.usageByUser || typeof db.usageByUser !== 'object') db.usageByUser = {};
  db.usageByUser[userId] = { ...(db.usageByUser[userId] || {}), ...(usage || {}) };
  saveDBToFile(db);
}

export function applyStreakShield(userId, capPerMonth = 2) {
  const key = monthKey();
  const u = getUsage(userId);
  if (u.streakShieldMonth !== key) {
    u.streakShieldMonth = key;
    u.streakShieldUsed = 0;
  }
  if ((u.streakShieldUsed || 0) >= capPerMonth) {
    saveUsage(userId, u);
    return false;
  }
  u.streakShieldUsed = (u.streakShieldUsed || 0) + 1;
  saveUsage(userId, u);
  return true;
}

// ---- Schedules ----
export function listSchedules({ userId, groupId }) {
  const db = getDB();
  if (!db.schedulesByUser || typeof db.schedulesByUser !== 'object') db.schedulesByUser = {};
  const list = db.schedulesByUser[userId] || [];
  const filtered = groupId ? list.filter((s) => s.groupId === groupId) : list;
  return filtered.slice().sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
}

export function addSchedule({ userId, groupId, title, start_at, duration_min = 30 }) {
  const db = getDB();
  if (!db.schedulesByUser || typeof db.schedulesByUser !== 'object') db.schedulesByUser = {};
  if (!db.schedulesByUser[userId]) db.schedulesByUser[userId] = [];
  const schedule = {
    id: `sch_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
    userId,
    groupId,
    title: title || 'Scheduled Workout',
    start_at,
    duration_min: Number(duration_min) || 30,
  };
  db.schedulesByUser[userId].push(schedule);
  saveDBToFile(db);
  return schedule;
}

export function setBalances({ userId, groupId, wallet, snatched, pact }) {
  const user = getUser(userId);
  const group = getGroup(groupId);
  if (wallet != null) user.wallet_balance_tc = Number(wallet);
  if (snatched != null) user.snatched_balance_tc = Number(snatched);
  if (pact != null) group.pact_balance_tc = Number(pact);
  const b = getBalances({ userId, groupId });
  saveDB(getDB());
  return b;
}

export function recordPaidSkip({ userId, userName, groupId, costTc }) {
  ensureMembership(groupId, userId);
  const group = getGroup(groupId);
  const payer = getUser(userId);

  const settings = group.settings || {};
  const cost = Number.isFinite(Number(costTc)) ? Number(costTc) : Number(settings.skip_cost_tc || 10);
  const mode = group.skip_mode || 'teammate_boost';

  // Deduct from payer wallet (upfront)
  payer.wallet_balance_tc = Math.max(0, payer.wallet_balance_tc - cost);

  let distributionPerMember = 0;
  let vaultShare = 0;
  let recipients = [];
  const distributionByMember = {};

  if (mode === 'tribe_fund') {
    // 100% to Tvault
    vaultShare = cost;
    recipients = [];
  } else {
    // teammate_boost: members share (weighted), remainder to Tvault
    const allActive = listActiveMembers(groupId).filter((m) => m !== userId);
    const membersSharePct = Math.min(1, Math.max(0, Number((settings.teammate_boost_pct_members ?? 80)) / 100));
    const vaultSharePct = 1 - membersSharePct;
    const membersShare = Math.round(cost * membersSharePct);
    const weights = allActive.map((m) => {
      const streak = computeCurrentStreakDays(m);
      const w = 1 + (streak >= 7 ? 0.1 : 0);
      return { m, w };
    });
    const totalW = weights.reduce((s, x) => s + x.w, 0);
    if (allActive.length > 0 && totalW > 0) {
      let allocated = 0;
      // initial floor allocation
      weights.forEach(({ m, w }) => {
        const amt = Math.floor((w / totalW) * membersShare);
        distributionByMember[m] = amt;
        allocated += amt;
      });
      // distribute remainder
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
    } else {
      // No active recipients: route members' share to vault
      vaultShare += membersShare;
    }
    vaultShare += Math.round(cost * vaultSharePct);
  }

  // Credit recipients
  recipients.forEach((mid) => {
    const mu = getUser(mid);
    const amt = distributionByMember[mid] != null ? distributionByMember[mid] : distributionPerMember;
    mu.snatched_balance_tc += amt;
  });

  // Credit Tvault and donors list
  if (vaultShare > 0) {
    group.pact_balance_tc += vaultShare;
    addDonor(groupId, userId, userName || payer.name, vaultShare);
  }

  // Grant catch-up credit(s) to payer
  const creditCount = Math.max(0, Number(settings.catch_up_credit_per_skip || 0));
  if (creditCount > 0) {
    grantCatchUpCredits(userId, creditCount);
  }

  const result = {
    skipMode: mode,
    recipients,
    distributionPerMember,
    distributionByMember,
    vaultShare,
    streakShield: applyStreakShield(userId, Math.max(0, Number(settings.streak_shield_cap_per_month || 2))),
    catchUpCredit: creditCount,
    balances: getBalances({ userId, groupId }),
  };
  saveDB(getDB());
  return result;
}

// ---- Calendar Settings ----
export function getCalendarSettings(userId) {
  const db = getDB();
  if (!db.calendarSettingsByUser || typeof db.calendarSettingsByUser !== 'object') db.calendarSettingsByUser = {};
  const defaults = { calendars: [], keywords: 'workout,gym,run,exercise', apple_ics_url: '' };
  return { ...defaults, ...(db.calendarSettingsByUser[userId] || {}) };
}

export function setCalendarSettings(userId, settings) {
  const db = getDB();
  if (!db.calendarSettingsByUser || typeof db.calendarSettingsByUser !== 'object') db.calendarSettingsByUser = {};
  const prev = getCalendarSettings(userId);
  const next = {
    calendars: Array.isArray(settings?.calendars) ? settings.calendars.filter(Boolean) : prev.calendars,
    keywords: typeof settings?.keywords === 'string' ? settings.keywords : prev.keywords,
    apple_ics_url: typeof settings?.apple_ics_url === 'string' ? settings.apple_ics_url : prev.apple_ics_url,
  };
  db.calendarSettingsByUser[userId] = next;
  saveDBToFile(db);
  return next;
}

export function setAppleCalendarSettings(userId, { icsUrl }) {
  const db = getDB();
  if (!db.calendarSettingsByUser) db.calendarSettingsByUser = {};
  const prev = getCalendarSettings(userId);
  const next = {
    ...prev,
    apple_ics_url: typeof icsUrl === 'string' ? icsUrl : prev.apple_ics_url
  };
  db.calendarSettingsByUser[userId] = next;
  saveDBToFile(db);
  return next;
}

// ---- Calendar (per user, per date) ----
export function getCalendar(userId) {
  const db = getDB();
  if (!db.calendarByUser || typeof db.calendarByUser !== 'object') db.calendarByUser = {};
  if (!db.calendarByUser[userId]) db.calendarByUser[userId] = {};
  return db.calendarByUser[userId];
}

export function getCalendarDay({ userId, date }) {
  const cal = getCalendar(userId);
  return cal[date] || [];
}

export function listCalendar({ userId }) {
  return getCalendar(userId);
}

export function addCalendarEntry({ userId, date, time, workout, type = 'general', shared = false, duration = '45 min', user_name = 'User', ai_plan }) {
  const db = getDB();
  if (!db.calendarByUser || typeof db.calendarByUser !== 'object') db.calendarByUser = {};
  if (!db.calendarByUser[userId]) db.calendarByUser[userId] = {};
  if (!db.calendarByUser[userId][date]) db.calendarByUser[userId][date] = [];
  const entry = {
    id: `workout-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
    user_id: userId,
    user_name,
    time,
    workout,
    type,
    shared: !!shared,
    duration,
    ai_plan: ai_plan || null,
    created_at: new Date().toISOString(),
  };
  db.calendarByUser[userId][date].push(entry);
  // sort by time
  db.calendarByUser[userId][date].sort((a, b) => String(a.time).localeCompare(String(b.time)));
  saveDBToFile(db);
  return entry;
}

function findCalendarEntry(db, userId, id) {
  if (!db.calendarByUser || typeof db.calendarByUser !== 'object') db.calendarByUser = {};
  const cal = db.calendarByUser[userId] || {};
  for (const [date, list] of Object.entries(cal)) {
    const idx = list.findIndex((w) => w.id === id);
    if (idx !== -1) return { date, idx };
  }
  return null;
}

export function updateCalendarEntry({ userId, id, changes = {} }) {
  const db = getDB();
  const loc = findCalendarEntry(db, userId, id);
  if (!loc) return null;
  const oldDate = loc.date;
  if (!db.calendarByUser || typeof db.calendarByUser !== 'object') db.calendarByUser = {};
  const item = (db.calendarByUser[userId] && db.calendarByUser[userId][oldDate] && db.calendarByUser[userId][oldDate][loc.idx]) || {};
  const newDate = changes.date || oldDate;
  const updated = { ...item, ...changes };
  if (newDate !== oldDate) {
    // move entry to new date bucket
    if (db.calendarByUser[userId] && db.calendarByUser[userId][oldDate]) db.calendarByUser[userId][oldDate].splice(loc.idx, 1);
    if (!db.calendarByUser[userId]) db.calendarByUser[userId] = {};
    if (!db.calendarByUser[userId][newDate]) db.calendarByUser[userId][newDate] = [];
    db.calendarByUser[userId][newDate].push(updated);
    db.calendarByUser[userId][newDate].sort((a, b) => String(a.time).localeCompare(String(b.time)));
  } else {
    if (!db.calendarByUser[userId]) db.calendarByUser[userId] = {};
    if (!db.calendarByUser[userId][oldDate]) db.calendarByUser[userId][oldDate] = [];
    db.calendarByUser[userId][oldDate][loc.idx] = updated;
    db.calendarByUser[userId][oldDate].sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }
  saveDBToFile(db);
  return updated;
}

export function deleteCalendarEntry({ userId, id }) {
  const db = getDB();
  const loc = findCalendarEntry(db, userId, id);
  if (!loc) return false;
  if (!db.calendarByUser || !db.calendarByUser[userId] || !db.calendarByUser[userId][loc.date]) return false;
  db.calendarByUser[userId][loc.date].splice(loc.idx, 1);
  saveDBToFile(db);
  return true;
}

export function recordPurchase({ userId, groupId, amountTc, from_snatched = 0, from_wallet = 0 }) {
  ensureMembership(groupId, userId);
  const user = getUser(userId);
  const group = getGroup(groupId);
  const amount = Number(amountTc);
  const fs = Number(from_snatched || 0);
  const fw = Number(from_wallet || 0);
  user.snatched_balance_tc = Math.max(0, user.snatched_balance_tc - fs);
  user.wallet_balance_tc = Math.max(0, user.wallet_balance_tc - fw);
  // pact unchanged on purchase
  const result = {
    balances: getBalances({ userId, groupId }),
    amount,
  };
  saveDB(getDB());
  return result;
}

// ---- Progress (Workout Session Results) ----
export function addProgress({ userId, title, duration_sec, completed_sets, date, type, distance_m }) {
  const db = getDB();
  if (!db.progressByUser || typeof db.progressByUser !== 'object') db.progressByUser = {};
  if (!db.progressByUser[userId]) db.progressByUser[userId] = [];
  const entry = {
    id: `prog_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
    user_id: userId,
    title: title || 'Workout',
    duration_sec: Number(duration_sec) || 0,
    completed_sets: Number(completed_sets) || 0,
    type: type || 'workout',
    distance_m: Number(distance_m) || 0,
    date: date || new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  db.progressByUser[userId].unshift(entry);
  db.progressByUser[userId] = db.progressByUser[userId].slice(0, 200);
  saveDBToFile(db);
  return entry;
}

export function listProgress({ userId, limit = 20 }) {
  const db = getDB();
  if (!db.progressByUser || typeof db.progressByUser !== 'object') db.progressByUser = {};
  const list = db.progressByUser[userId] || [];
  return list.slice(0, Math.max(1, Number(limit) || 20));
}

// ---- Coach System ----
export function getCoachProfile(userId) {
  const db = getDB();
  if (!db.coachProfiles || typeof db.coachProfiles !== 'object') db.coachProfiles = {};
  return db.coachProfiles[userId] || null;
}

export function createCoachProfile({ userId, name, tribeId, bio = '', specialties = [], pricing = {} }) {
  const db = getDB();
  if (!db.coachProfiles || typeof db.coachProfiles !== 'object') db.coachProfiles = {};
  
  const profile = {
    id: userId,
    user_id: userId,
    name: name || 'Coach',
    tribe_id: tribeId,
    bio,
    specialties: Array.isArray(specialties) ? specialties : [],
    pricing: pricing.per_session ? pricing : { per_session: 15 }, // Tiered: 10-20 TC
    status: 'active',
    avg_rating: 0,
    total_sessions: 0,
    clients_count: 0,
    total_earnings_tc: 0,
    created_at: new Date().toISOString()
  };
  
  db.coachProfiles[userId] = profile;
  saveDBToFile(db);
  return profile;
}

export function updateCoachProfile(userId, changes = {}) {
  const db = getDB();
  if (!db.coachProfiles || !db.coachProfiles[userId]) return null;
  db.coachProfiles[userId] = { ...db.coachProfiles[userId], ...changes };
  saveDBToFile(db);
  return db.coachProfiles[userId];
}

export function listCoaches(filters = {}) {
  const db = getDB();
  if (!db.coachProfiles || typeof db.coachProfiles !== 'object') db.coachProfiles = {};
  let coaches = Object.values(db.coachProfiles).filter(c => c.status === 'active');
  
  if (filters.tribeId) {
    coaches = coaches.filter(c => c.tribe_id === filters.tribeId);
  }
  
  // Add user stats
  coaches = coaches.map(coach => {
    const user = getUser(coach.user_id);
    return {
      ...coach,
      streak: user?.streak || 0,
      total_workouts: user?.total_workouts || 0
    };
  });
  
  return coaches.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
}

export function getCoachApplication(userId) {
  const db = getDB();
  if (!db.coachApplications || typeof db.coachApplications !== 'object') db.coachApplications = {};
  return db.coachApplications[userId] || null;
}

export function createCoachApplication({ userId, name, tribeId }) {
  const db = getDB();
  if (!db.coachApplications || typeof db.coachApplications !== 'object') db.coachApplications = {};
  
  const application = {
    id: `app_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
    user_id: userId,
    name,
    tribe_id: tribeId,
    status: 'pending', // pending, approved, rejected
    created_at: new Date().toISOString()
  };
  
  db.coachApplications[userId] = application;
  saveDBToFile(db);
  return application;
}

export function approveCoachApplication(userId, pricing = {}) {
  const db = getDB();
  const application = getCoachApplication(userId);
  if (!application) return null;
  
  application.status = 'approved';
  application.approved_at = new Date().toISOString();
  
  // Create coach profile
  const user = getUser(userId);
  const profile = createCoachProfile({
    userId,
    name: application.name || user.name,
    tribeId: application.tribe_id,
    bio: '',
    specialties: [],
    pricing: pricing.per_session ? pricing : { per_session: 150 }
  });
  
  saveDBToFile(db);
  return { application, profile };
}

export function createCoachHire({ clientId, coachId, priceTc }) {
  const db = getDB();
  if (!db.coachHires || typeof db.coachHires !== 'object') db.coachHires = {};
  if (!db.coachHires[clientId]) db.coachHires[clientId] = [];
  
  const hire = {
    id: `hire_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
    client_id: clientId,
    coach_id: coachId,
    price_tc: Number(priceTc),
    status: 'active', // active, completed, cancelled
    sessions_count: 0,
    created_at: new Date().toISOString()
  };
  
  db.coachHires[clientId].push(hire);
  
  // Update coach profile
  const coachProfile = getCoachProfile(coachId);
  if (coachProfile) {
    coachProfile.clients_count = (coachProfile.clients_count || 0) + 1;
  }
  
  saveDBToFile(db);
  return hire;
}

export function listCoachHires(userId) {
  const db = getDB();
  if (!db.coachHires || typeof db.coachHires !== 'object') db.coachHires = {};
  return db.coachHires[userId] || [];
}

export function recordCoachSession({ hireId, coachId, clientId, priceTc }) {
  const db = getDB();
  const PLATFORM_FEE_PERCENT = 10;
  
  const platformFee = Math.floor((Number(priceTc) * PLATFORM_FEE_PERCENT) / 100);
  const coachEarnings = Number(priceTc) - platformFee;
  
  // Pay coach
  const coach = getUser(coachId);
  if (coach) {
    coach.wallet_balance_tc = (coach.wallet_balance_tc || 0) + coachEarnings;
  }
  
  // Update coach profile stats
  const coachProfile = getCoachProfile(coachId);
  if (coachProfile) {
    coachProfile.total_sessions = (coachProfile.total_sessions || 0) + 1;
    coachProfile.total_earnings_tc = (coachProfile.total_earnings_tc || 0) + coachEarnings;
  }
  
  // Record session
  if (!db.coachSessions || typeof db.coachSessions !== 'object') db.coachSessions = {};
  if (!db.coachSessions[coachId]) db.coachSessions[coachId] = [];
  
  const session = {
    id: `session_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
    hire_id: hireId,
    coach_id: coachId,
    client_id: clientId,
    price_tc: Number(priceTc),
    platform_fee_tc: platformFee,
    coach_earnings_tc: coachEarnings,
    created_at: new Date().toISOString()
  };
  
  db.coachSessions[coachId].push(session);
  saveDBToFile(db);
  
  return { session, coachEarnings, platformFee };
}

export function addCoachRating({ hireId, coachId, clientId, stars, text = '' }) {
  const db = getDB();
  if (!db.coachRatings || typeof db.coachRatings !== 'object') db.coachRatings = {};
  if (!db.coachRatings[coachId]) db.coachRatings[coachId] = [];
  
  const rating = {
    id: `rating_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
    hire_id: hireId,
    coach_id: coachId,
    client_id: clientId,
    stars: Number(stars),
    text: text || '',
    created_at: new Date().toISOString()
  };
  
  db.coachRatings[coachId].push(rating);
  
  // Update average rating
  const allRatings = db.coachRatings[coachId];
  const avgRating = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;
  
  const coachProfile = getCoachProfile(coachId);
  if (coachProfile) {
    coachProfile.avg_rating = Math.round(avgRating * 10) / 10;
  }
  
  saveDBToFile(db);
  return rating;
}

export function listCoachRatings(coachId) {
  const db = getDB();
  if (!db.coachRatings || typeof db.coachRatings !== 'object') db.coachRatings = {};
  return db.coachRatings[coachId] || [];
}

// ---- Developer Functions ----
export function createTestUser(name, userId, initialData) {
  const db = getDB();
  const id = userId || `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  db.users[id] = initialData || {
    id: id,
    name: name || `Test User ${id.slice(-4)}`,
    wallet_balance_tc: 500,
    snatched_balance_tc: 0,
    streak: 0,
    total_workouts: 0,
    group_id: null,
    group_type: null,
    created_at: new Date().toISOString()
  };
  
  saveDBToFile(db);
  return db.users[id];
}

export function updateUserStats(userId, updates) {
  const db = getDB();
  const user = getUser(userId);
  
  // Apply updates
  if (updates.streak !== undefined) user.streak = Math.max(0, Number(updates.streak));
  if (updates.total_workouts !== undefined) user.total_workouts = Math.max(0, Number(updates.total_workouts));
  if (updates.wallet_balance_tc !== undefined) user.wallet_balance_tc = Math.max(0, Number(updates.wallet_balance_tc));
  if (updates.snatched_balance_tc !== undefined) user.snatched_balance_tc = Math.max(0, Number(updates.snatched_balance_tc));
  if (updates.group_type !== undefined) user.group_type = updates.group_type;
  if (updates.group_id !== undefined) user.group_id = updates.group_id;
  
  saveDBToFile(db);
  return user;
}

export function addUserToGroup(userId, groupId) {
  const db = getDB();
  const user = getUser(userId);
  
  // If groupId is null, remove user from current group
  if (!groupId) {
    const currentGroupId = user.group_id;
    if (currentGroupId && db.groups[currentGroupId]) {
      const currentGroup = db.groups[currentGroupId];
      // Remove user from members array
      currentGroup.members = (currentGroup.members || []).filter(id => id !== userId);
      currentGroup.member_count = currentGroup.members.length;
    }
    user.group_id = null;
    user.group_type = null;
    saveDBToFile(db);
    return { user, group: null };
  }
  
  const group = getGroup(groupId);
  
  // Remove from old group if switching
  if (user.group_id && user.group_id !== groupId && db.groups[user.group_id]) {
    const oldGroup = db.groups[user.group_id];
    oldGroup.members = (oldGroup.members || []).filter(id => id !== userId);
    oldGroup.member_count = oldGroup.members.length;
  }
  
  // Update user's group info
  user.group_id = groupId;
  user.group_type = group.group_type || group.type || 'squad';
  
  // Add user to group members
  ensureMembership(groupId, userId);
  
  // If this is the first member, make them the owner
  if (!group.owner_id || group.members.length === 1) {
    group.owner_id = userId;
  }
  
  saveDBToFile(db);
  return { user, group };
}

export function listAllUsers() {
  const db = getDB();
  return Object.values(db.users || {});
}

export function getAllGroups() {
  const db = getDB();
  return Object.values(db.groups || {});
}

// ---- Power-Up Items (Stompers-style gamification) ----
export const ITEM_CATALOG = {
  snatch: { id: 'snatch', name: 'Snatch', price_tc: 25, rarity: 'rare', description: "Whack a rival - halves their latest workout's progress" },
  shield: { id: 'shield', name: 'Streak Shield', price_tc: 30, rarity: 'epic', description: 'Auto-protects your streak on your next missed workout' },
  boost:  { id: 'boost',  name: 'TC Boost',   price_tc: 20, rarity: 'common', description: 'Your next logged workout earns +10 bonus TC' },
};

export const CARD_PACK = { price_tc: 15, cards: 3 };

function rollCard() {
  const r = Math.random();
  // weights: common 55%, rare 30%, epic 15%
  if (r < 0.15) return 'shield';
  if (r < 0.45) return 'snatch';
  return 'boost';
}

export function getItems(userId) {
  const db = getDB();
  if (!db.itemsByUser || typeof db.itemsByUser !== 'object') db.itemsByUser = {};
  return (db.itemsByUser[userId] || []).slice();
}

export function grantItem(userId, itemId, count = 1) {
  const db = getDB();
  if (!db.itemsByUser) db.itemsByUser = {};
  if (!db.itemsByUser[userId]) db.itemsByUser[userId] = [];
  for (let i = 0; i < count; i++) {
    db.itemsByUser[userId].push({ id: `item_${Date.now()}_${Math.floor(Math.random() * 1e6)}`, type: itemId, acquired_at: new Date().toISOString() });
  }
  saveDBToFile(db);
  return getItems(userId);
}

export function consumeItem(userId, itemId) {
  const db = getDB();
  const list = (db.itemsByUser && db.itemsByUser[userId]) || [];
  const idx = list.findIndex(i => i.type === itemId);
  if (idx === -1) return null;
  const [used] = list.splice(idx, 1);
  db.itemsByUser[userId] = list;
  saveDBToFile(db);
  return used;
}

export function openCardPack(userId) {
  const cards = Array.from({ length: CARD_PACK.cards }, rollCard);
  cards.forEach(id => grantItem(userId, id, 1));
  return cards;
}

// ---- Active effects ----
export function getEffects(userId) {
  const db = getDB();
  if (!db.effectsByUser) db.effectsByUser = {};
  if (!db.effectsByUser[userId]) db.effectsByUser[userId] = { shield: false, boost: false };
  return db.effectsByUser[userId];
}

export function setEffect(userId, key, value) {
  const db = getDB();
  const fx = getEffects(userId);
  fx[key] = value;
  db.effectsByUser[userId] = fx;
  saveDBToFile(db);
  return fx;
}

// ---- Tribeling avatar: skins, evolution stages, accessories ----
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

// Evolution stages by lifetime workouts
export const EVOLUTION_STAGES = [
  { id: 'sprout', name: 'Sprout',  min_workouts: 0,  perk: 'Just sprouted' },
  { id: 'rookie', name: 'Rookie',  min_workouts: 1,  perk: '+5% TC on workouts' },
  { id: 'athlete',name: 'Athlete', min_workouts: 5,  perk: '+10% TC on workouts' },
  { id: 'beast',  name: 'Beast',   min_workouts: 15, perk: '+15% TC, skip fees -1 TC' },
  { id: 'legend', name: 'Legend',  min_workouts: 30, perk: '+20% TC, free weekly shield' },
];

export function getEvolutionStage(totalWorkouts) {
  const n = Number(totalWorkouts || 0);
  let stage = EVOLUTION_STAGES[0];
  for (const s of EVOLUTION_STAGES) if (n >= s.min_workouts) stage = s;
  return stage;
}

function weekKey(d = new Date()) {
  const dt = new Date(d);
  const onejan = new Date(dt.getFullYear(), 0, 1);
  const week = Math.ceil((((dt - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${dt.getFullYear()}-W${week}`;
}

export function recordAdWatch(userId) {
  const db = getDB();
  const user = getUser(userId);
  const wk = weekKey();
  if (user.ads_week_key !== wk) { user.ads_week_key = wk; user.ads_this_week = 0; }
  user.ads_this_week = (user.ads_this_week || 0) + 1;
  saveDBToFile(db);
  return user.ads_this_week;
}

export function getAvatarState(userId) {
  const db = getDB();
  const user = getUser(userId);
  const streak = Number(user.streak || 0);
  const missed = (db.missedWorkoutsByUser && db.missedWorkoutsByUser[userId]) || [];
  const todayKey = dateKey(new Date());
  const hasToday = hasProgressOnDay(db, userId, new Date());
  const missedToday = missed.some(m => dateKey(m.date) === todayKey);
  const adsThisWeek = (user.ads_week_key === weekKey()) ? (user.ads_this_week || 0) : 0;

  const stage = getEvolutionStage(user.total_workouts);

  // Mood precedence: couch potato > deflated > pumped > steady
  let mood = 'steady';
  if (adsThisWeek >= 3) mood = 'couch';
  else if (missedToday || (!hasToday && streak === 0)) mood = 'deflated';
  else if (streak >= 3 || hasToday) mood = 'pumped';

  return {
    mood,
    streak,
    stage,
    stage_progress: {
      current: Number(user.total_workouts || 0),
      next_stage: EVOLUTION_STAGES[EVOLUTION_STAGES.indexOf(stage) + 1] || null,
    },
    has_workout_today: hasToday,
    missed_today: missedToday,
    ads_this_week: adsThisWeek,
    avatar_icon: user.avatar_icon || null,
    skin: user.avatar_skin || 'ember',
    accessory: user.avatar_accessory || 'none',
    custom: user.avatar_custom || null,
    owned_skins: user.owned_skins || ['ember'],
    owned_accessories: user.owned_accessories || ['none'],
    energy: Math.min(1.3, 0.6 + streak * 0.08 + (hasToday ? 0.15 : 0)),
  };
}

// Back-compat alias used by /api/items
export const getTribelingState = getAvatarState;

// ---- Daily Versus: group members compete on today's activity; winner takes the TC pot ----
export const VERSUS_POT_PER_WORKOUT = 5; // TC added to pot per workout logged today

export function getDailyVersus(groupId) {
  const db = getDB();
  const group = getGroup(groupId);
  const today = dateKey(new Date());
  const members = (group.members || []);

  // Lazy settlement: if yesterday's result hasn't been settled, award the pot
  if (!db.versusByGroup) db.versusByGroup = {};
  const v = db.versusByGroup[groupId] || {};
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  let last_result = v.last_result || null;
  if (v.pending_day && v.pending_day !== today && v.pending_day === yesterday) {
    // Settle yesterday
    const standings = computeDayStandings(db, group, v.pending_day);
    if (standings.length > 0) {
      const winner = standings[0];
      const pot = standings.reduce((s, x) => s + x.workouts, 0) * VERSUS_POT_PER_WORKOUT;
      const wUser = getUser(winner.user_id);
      updateUserStats(winner.user_id, { wallet_balance_tc: wUser.wallet_balance_tc + pot });
      last_result = { day: v.pending_day, winner_id: winner.user_id, winner_name: winner.name, pot };
    }
    delete v.pending_day;
    v.last_result = last_result;
    db.versusByGroup[groupId] = v;
    saveDBToFile(db);
  }
  // Mark today as pending so tomorrow it settles
  const todayStandings = computeDayStandings(db, group, today);
  if (todayStandings.length > 0 && v.pending_day !== today) {
    v.pending_day = today;
    db.versusByGroup[groupId] = v;
    saveDBToFile(db);
  }

  return {
    day: today,
    pot: todayStandings.reduce((s, x) => s + x.workouts, 0) * VERSUS_POT_PER_WORKOUT,
    standings: todayStandings,
    last_result,
    member_count: members.length,
  };
}

function computeDayStandings(db, group, dayKeyStr) {
  return (group.members || [])
    .map(uid => {
      const entries = ((db.progressByUser && db.progressByUser[uid]) || [])
        .filter(p => dateKey(p.date) === dayKeyStr && Number(p.duration_sec || 0) > 0);
      const u = getUser(uid);
      return {
        user_id: uid,
        name: u.name || uid,
        workouts: entries.length,
        minutes: Math.round(entries.reduce((s, p) => s + Number(p.duration_sec || 0), 0) / 60),
        first_at: entries.length ? entries[entries.length - 1].date : null, // entries are unshifted → last is earliest
        avatar: { skin: u.avatar_skin || 'ember', accessory: u.avatar_accessory || 'none', stage: getEvolutionStage(u.total_workouts).id },
      };
    })
    .filter(s => s.workouts > 0)
    .sort((a, b) => b.minutes - a.minutes || new Date(a.first_at) - new Date(b.first_at));
}

// Export getDB and saveDB for API routes
export { getDB };
export function saveDB(db) {
  return saveDBToFile(db);
}
