export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import {
  getUser, updateUserStats, getDB, saveDB,
  getAvatarState, recordAdWatch,
  AVATAR_SKINS, AVATAR_ACCESSORIES,
} from '../_store/db';

// GET /api/avatar?userId=... → full avatar state + catalogs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    return NextResponse.json({
      avatar: getAvatarState(userId),
      skins: AVATAR_SKINS,
      accessories: AVATAR_ACCESSORIES,
      wallet_balance_tc: getUser(userId).wallet_balance_tc,
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

    const db = getDB();
    const user = getUser(userId);
    if (!user.owned_skins) user.owned_skins = ['ember'];
    if (!user.owned_accessories) user.owned_accessories = ['none'];

    const respond = (extra = {}) =>
      NextResponse.json({ success: true, avatar: getAvatarState(userId), wallet_balance_tc: getUser(userId).wallet_balance_tc, ...extra });

    switch (action) {
      case 'buy_skin': {
        const def = AVATAR_SKINS[skin];
        if (!def) return NextResponse.json({ error: 'Unknown skin' }, { status: 400 });
        if (user.owned_skins.includes(skin)) return respond({ already_owned: true });
        if (user.wallet_balance_tc < def.price_tc) {
          return NextResponse.json({ error: 'Insufficient TribeCoins', needed: def.price_tc, current: user.wallet_balance_tc }, { status: 402 });
        }
        updateUserStats(userId, { wallet_balance_tc: user.wallet_balance_tc - def.price_tc });
        getUser(userId).owned_skins.push(skin);
        saveDB(db);
        return respond({ unlocked: def });
      }

      case 'select_skin': {
        if (!AVATAR_SKINS[skin]) return NextResponse.json({ error: 'Unknown skin' }, { status: 400 });
        if (!user.owned_skins.includes(skin)) return NextResponse.json({ error: 'Skin not owned' }, { status: 400 });
        user.avatar_skin = skin;
        saveDB(db);
        return respond();
      }

      case 'buy_accessory': {
        const def = AVATAR_ACCESSORIES[accessory];
        if (!def) return NextResponse.json({ error: 'Unknown accessory' }, { status: 400 });
        if (user.owned_accessories.includes(accessory)) return respond({ already_owned: true });
        if (user.wallet_balance_tc < def.price_tc) {
          return NextResponse.json({ error: 'Insufficient TribeCoins', needed: def.price_tc, current: user.wallet_balance_tc }, { status: 402 });
        }
        updateUserStats(userId, { wallet_balance_tc: user.wallet_balance_tc - def.price_tc });
        getUser(userId).owned_accessories.push(accessory);
        saveDB(db);
        return respond({ unlocked: def });
      }

      case 'select_accessory': {
        if (!AVATAR_ACCESSORIES[accessory]) return NextResponse.json({ error: 'Unknown accessory' }, { status: 400 });
        if (!user.owned_accessories.includes(accessory)) return NextResponse.json({ error: 'Accessory not owned' }, { status: 400 });
        user.avatar_accessory = accessory;
        saveDB(db);
        return respond();
      }

      case 'set_custom': {
        // Save a flat customizable-avatar config and enable it
        const c = body.custom;
        if (!c || typeof c !== 'object') return NextResponse.json({ error: 'custom required' }, { status: 400 });
        const clean = {};
        for (const k of ['body', 'hair', 'hairStyle', 'shirt', 'shorts', 'shoes', 'cheek']) {
          if (typeof c[k] === 'string') clean[k] = c[k].slice(0, 40);
        }
        clean.enabled = c.enabled !== false;
        user.avatar_custom = clean;
        saveDB(db);
        return respond();
      }

      case 'toggle_custom': {
        if (!user.avatar_custom) {
          user.avatar_custom = {
            body: '#A3E635', hair: '#2EC4B6', hairStyle: 'leaf',
            shirt: '#FFFFFF', shorts: '#2B3A55', shoes: '#2EC4B6',
            cheek: '#FF8A75', enabled: false,
          };
        }
        user.avatar_custom.enabled = body.enabled !== false;
        saveDB(db);
        return respond();
      }

      case 'ad_watched': {
        const count = recordAdWatch(userId);
        return respond({ ads_this_week: count });
      }

      case 'update_profile': {
        const updates = {};
        if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim().slice(0, 40);
        if (typeof body.avatar_icon === 'string') updates.avatar_icon = body.avatar_icon;
        if (!Object.keys(updates).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
        updateUserStats(userId, updates);
        return respond({ profile: { name: getUser(userId).name, avatar_icon: getUser(userId).avatar_icon } });
      }

      // Dev/testing: set stats to preview avatar states (mock store only)
      case 'debug_set': {
        const updates = {};
        if (body.workouts !== undefined) updates.total_workouts = Number(body.workouts);
        if (body.streak !== undefined) updates.streak = Number(body.streak);
        if (Object.keys(updates).length) updateUserStats(userId, updates);
        if (body.ads !== undefined) {
          const u = getUser(userId);
          u.ads_week_key = `${new Date().getFullYear()}-W${Math.ceil((((new Date()) - new Date(new Date().getFullYear(),0,1)) / 86400000 + new Date(new Date().getFullYear(),0,1).getDay() + 1) / 7)}`;
          u.ads_this_week = Number(body.ads);
          saveDB(db);
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
