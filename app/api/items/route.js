export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import {
  getDB, saveDB, getUser, getGroup, updateUserStats,
  getItems, grantItem, consumeItem, openCardPack,
  getEffects, setEffect, getTribelingState,
  ITEM_CATALOG, CARD_PACK, listAllUsers,
} from '../_store/db';

// GET /api/items?userId=... → inventory, effects, catalog, tribeling state, snatch targets
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = getUser(userId);
    const inventory = getItems(userId);
    const effects = getEffects(userId);
    const tribeling = getTribelingState(userId);

    // Snatch targets: other members of the user's group
    let targets = [];
    if (user.group_id) {
      const group = getGroup(user.group_id);
      targets = (group.members || [])
        .filter(id => id !== userId)
        .map(id => {
          const u = getUser(id);
          return { id, name: u.name, streak: u.streak || 0 };
        });
    }

    // Count inventory by type
    const counts = {};
    inventory.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });

    return NextResponse.json({
      inventory,
      counts,
      effects,
      tribeling,
      catalog: ITEM_CATALOG,
      card_pack: CARD_PACK,
      wallet_balance_tc: user.wallet_balance_tc,
      targets,
    });
  } catch (error) {
    console.error('Items GET error:', error);
    return NextResponse.json({ error: 'Failed to load items' }, { status: 500 });
  }
}

// POST /api/items { action, userId, item?, targetUserId? }
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, item, targetUserId } = body;
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = getUser(userId);

    const charge = (tc) => {
      if (user.wallet_balance_tc < tc) {
        return { ok: false, res: NextResponse.json({ error: 'Insufficient TribeCoins', needed: tc, current: user.wallet_balance_tc }, { status: 402 }) };
      }
      updateUserStats(userId, { wallet_balance_tc: user.wallet_balance_tc - tc });
      return { ok: true };
    };

    switch (action) {
      case 'buy_item': {
        const def = ITEM_CATALOG[item];
        if (!def) return NextResponse.json({ error: 'Unknown item' }, { status: 400 });
        const c = charge(def.price_tc);
        if (!c.ok) return c.res;
        grantItem(userId, item);
        return NextResponse.json({ success: true, item: def, counts: countItems(userId), wallet_balance_tc: getUser(userId).wallet_balance_tc });
      }

      case 'open_pack': {
        const c = charge(CARD_PACK.price_tc);
        if (!c.ok) return c.res;
        const cards = openCardPack(userId);
        return NextResponse.json({
          success: true,
          cards: cards.map(id => ITEM_CATALOG[id]),
          counts: countItems(userId),
          wallet_balance_tc: getUser(userId).wallet_balance_tc,
        });
      }

      case 'use_item': {
        const def = ITEM_CATALOG[item];
        if (!def) return NextResponse.json({ error: 'Unknown item' }, { status: 400 });

        if (item === 'snatch') {
          if (!targetUserId) return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });
          const target = getUser(targetUserId);
          if (!target) return NextResponse.json({ error: 'Target not found' }, { status: 404 });

          // Whack: halve the target's most recent progress entry
          const db = getDB();
          const progress = (db.progressByUser && db.progressByUser[targetUserId]) || [];
          const latest = progress[0];
          if (!latest || !(latest.duration_sec > 0)) {
            return NextResponse.json({ error: `${target.name} has no progress to snatch` }, { status: 400 });
          }
          if (!consumeItem(userId, 'snatch')) {
            return NextResponse.json({ error: 'You do not own a Snatch' }, { status: 400 });
          }
          latest.duration_sec = Math.floor(latest.duration_sec / 2);
          latest.snatched = true;
          latest.snatched_by = userId;
          saveDB(db);

          // Reduce their streak by 1 for extra sting
          updateUserStats(targetUserId, { streak: Math.max(0, (target.streak || 0) - 1) });

          return NextResponse.json({
            success: true,
            message: `Snatched ${target.name}! Their latest workout progress was halved.`,
            counts: countItems(userId),
          });
        }

        if (item === 'shield') {
          if (!consumeItem(userId, 'shield')) {
            return NextResponse.json({ error: 'You do not own a Streak Shield' }, { status: 400 });
          }
          setEffect(userId, 'shield', true);
          return NextResponse.json({ success: true, message: 'Streak Shield armed - your next miss is protected.', counts: countItems(userId) });
        }

        if (item === 'boost') {
          if (!consumeItem(userId, 'boost')) {
            return NextResponse.json({ error: 'You do not own a TC Boost' }, { status: 400 });
          }
          setEffect(userId, 'boost', true);
          return NextResponse.json({ success: true, message: 'TC Boost armed - your next workout earns +10 TC.', counts: countItems(userId) });
        }

        return NextResponse.json({ error: 'Item cannot be used directly' }, { status: 400 });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Items POST error:', error);
    return NextResponse.json({ error: 'Failed', message: error.message }, { status: 500 });
  }
}

function countItems(userId) {
  const counts = {};
  getItems(userId).forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
  return counts;
}
