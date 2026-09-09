export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import {
  getUser, updateUserStats,
  getAvatarState, recordAdWatch,
  AVATAR_SKINS, AVATAR_ACCESSORIES,
} from '@/lib/supabase-db';

function thisWeekKey() {
  const today = new Date();
  const onejan = new Date(today.getFullYear(), 0, 1);
  const week = Math.ceil((((today - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${today.getFullYear()}-W${week}`;
}

async function readAvatarState(userId) {
  const user = await getUser(userId);
  return { ...(user?.avatar_state || {}), owned_skins: user?.owned_skins || ['ember'], owned_accessories: user?.owned_accessories || ['none'] };
}

async function mergeAvatarState(userId, partial) {
  const current = await readAvatarState(userId);
  const next = { ...current, ...partial };
  await updateUserStats(userId, { avatar_state: next });
  return next;
}

// GET /api/avatar?userId=... → full avatar state + catalogs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await getUser(userId);
    const avatar = await getAvatarState(userId);

    return NextResponse.json({
      avatar,
      skins: AVATAR_SKINS,
      accessories: AVATAR_ACCESSORIES,
      wallet_balance_tc: user?.wallet_balance_tc || 0,
    });
  } catch (error) {
    console.error('Avatar GET error:', error);
    return NextResponse.json({ error: 'Failed to load avatar' }, { status: 500 });
  }
}

// POST /api/avatar { action, userId, skin?, accessory? }
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, skin, accessory } = body;
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await getUser(userId);
    const ownedSkins = user?.owned_skins || ['ember'];
    const ownedAccessories = user?.owned_accessories || ['none'];

    const respond = async (extra = {}) => {
      const u = await getUser(userId);
      const avatar = await getAvatarState(userId);
      return NextResponse.json({ success: true, avatar, wallet_balance_tc: u?.wallet_balance_tc || 0, ...extra });
    };

    switch (action) {
      case 'buy_skin': {
        const def = AVATAR_SKINS[skin];
        if (!def) return NextResponse.json({ error: 'Unknown skin' }, { status: 400 });
        if (ownedSkins.includes(skin)) return respond({ already_owned: true });
        if ((user?.wallet_balance_tc || 0) < def.price_tc) {
          return NextResponse.json({ error: 'Insufficient TribeCoins', needed: def.price_tc, current: user?.wallet_balance_tc || 0 }, { status: 402 });
        }
        await updateUserStats(userId, {
          wallet_balance_tc: (user?.wallet_balance_tc || 0) - def.price_tc,
          owned_skins: [...ownedSkins, skin],
        });
        return respond({ unlocked: def });
      }

      case 'select_skin': {
        if (!AVATAR_SKINS[skin]) return NextResponse.json({ error: 'Unknown skin' }, { status: 400 });
        if (!ownedSkins.includes(skin)) return NextResponse.json({ error: 'Skin not owned' }, { status: 400 });
        await mergeAvatarState(userId, { skin });
        return respond();
      }

      case 'buy_accessory': {
        const def = AVATAR_ACCESSORIES[accessory];
        if (!def) return NextResponse.json({ error: 'Unknown accessory' }, { status: 400 });
        if (ownedAccessories.includes(accessory)) return respond({ already_owned: true });
        if ((user?.wallet_balance_tc || 0) < def.price_tc) {
          return NextResponse.json({ error: 'Insufficient TribeCoins', needed: def.price_tc, current: user?.wallet_balance_tc || 0 }, { status: 402 });
        }
        await updateUserStats(userId, {
          wallet_balance_tc: (user?.wallet_balance_tc || 0) - def.price_tc,
          owned_accessories: [...ownedAccessories, accessory],
        });
        return respond({ unlocked: def });
      }

      case 'select_accessory': {
        if (!AVATAR_ACCESSORIES[accessory]) return NextResponse.json({ error: 'Unknown accessory' }, { status: 400 });
        if (!ownedAccessories.includes(accessory)) return NextResponse.json({ error: 'Accessory not owned' }, { status: 400 });
        await mergeAvatarState(userId, { accessory });
        return respond();
      }

      case 'set_custom': {
        const c = body.custom;
        if (!c || typeof c !== 'object') return NextResponse.json({ error: 'custom required' }, { status: 400 });
        const clean = {};
        for (const k of ['body', 'hair', 'hairStyle', 'shirt', 'shorts', 'shoes', 'cheek']) {
          if (typeof c[k] === 'string') clean[k] = c[k].slice(0, 40);
        }
        clean.enabled = c.enabled !== false;
        await mergeAvatarState(userId, { custom: clean });
        return respond();
      }

      case 'set_part': {
        const { part, idx } = body;
        if (!part || typeof idx !== 'number') return NextResponse.json({ error: 'part and idx required' }, { status: 400 });
        const current = await readAvatarState(userId);
        const parts = { ...(current.parts || {}), [part]: idx };
        await mergeAvatarState(userId, { parts });
        return respond();
      }

      case 'clear_part': {
        const { part } = body;
        if (!part) return NextResponse.json({ error: 'part required' }, { status: 400 });
        const current = await readAvatarState(userId);
        const parts = { ...(current.parts || {}) };
        delete parts[part];
        await mergeAvatarState(userId, { parts });
        return respond();
      }

      case 'set_preset': {
        const p = body.preset;
        if (typeof p !== 'number' && typeof p !== 'string') return NextResponse.json({ error: 'preset required' }, { status: 400 });
        await mergeAvatarState(userId, { preset: p });
        return respond();
      }

      case 'clear_preset': {
        await mergeAvatarState(userId, { preset: null });
        return respond();
      }

      case 'toggle_custom': {
        const current = await readAvatarState(userId);
        const custom = current.custom || {
          body: '#A3E635', hair: '#2EC4B6', hairStyle: 'leaf',
          shirt: '#FFFFFF', shorts: '#2B3A55', shoes: '#2EC4B6',
          cheek: '#FF8A75', enabled: false,
        };
        custom.enabled = body.enabled !== false;
        await mergeAvatarState(userId, { custom });
        return respond();
      }

      case 'ad_watched': {
        const count = await recordAdWatch(userId);
        return respond({ ads_this_week: count });
      }

      case 'update_profile': {
        const updates = {};
        if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim().slice(0, 40);
        if (typeof body.avatar_icon === 'string') updates.avatar_icon = body.avatar_icon;
        if (!Object.keys(updates).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
        await updateUserStats(userId, updates);
        return respond({ profile: { name: (await getUser(userId)).name, avatar_icon: (await getUser(userId)).avatar_icon } });
      }

      case 'debug_set': {
        const updates = {};
        if (body.workouts !== undefined) updates.total_workouts = Number(body.workouts);
        if (body.streak !== undefined) updates.streak = Number(body.streak);
        if (Object.keys(updates).length) await updateUserStats(userId, updates);
        if (body.ads !== undefined) {
          await mergeAvatarState(userId, { ads_week_key: thisWeekKey(), ads_this_week: Number(body.ads) });
        }
        return respond({ debug: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Avatar POST error:', error);
    return NextResponse.json({ error: 'Failed', message: error.message }, { status: 500 });
  }
}
