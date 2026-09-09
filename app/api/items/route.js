export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import {
  getUser, updateUserStats,
  getItems, grantItem, consumeItem, openCardPack,
  getEffects, setEffect, getTribelingState, snatchProgress,
  ITEM_CATALOG, CARD_PACK,
} from '@/lib/supabase-db';

async function countItems(userId) {
  const items = await getItems(userId);
  const counts = {};
  items.forEach(i => { counts[i.type] = (counts[i.type] || 0) + i.count; });
  return counts;
}

// GET /api/items?userId=... → inventory, effects, catalog, tribeling state, snatch targets
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await getUser(userId);
    const inventory = await getItems(userId);
    const effects = await getEffects(userId);
    const tribeling = await getTribelingState(userId);

    let targets = [];
    if (user?.group_id) {
      const { getGroup } = await import('@/lib/supabase-db');
      const group = await getGroup(user.group_id);
      const otherUserIds = (group?.members || []).filter(id => id !== userId);
      const users = await Promise.all(otherUserIds.map(id => getUser(id)));
      targets = users.filter(Boolean).map(u => ({ id: u.id, name: u.name, streak: u.streak || 0 }));
    }

    const counts = await countItems(userId);

    return NextResponse.json({
      inventory,
      counts,
      effects,
      tribeling,
      catalog: ITEM_CATALOG,
      card_pack: CARD_PACK,
      wallet_balance_tc: user?.wallet_balance_tc || 0,
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

    const user = await getUser(userId);

    const charge = async (tc) => {
      if ((user?.wallet_balance_tc || 0) < tc) {
        return { ok: false, res: NextResponse.json({ error: 'Insufficient TribeCoins', needed: tc, current: user?.wallet_balance_tc || 0 }, { status: 402 }) };
      }
      await updateUserStats(userId, { wallet_balance_tc: (user?.wallet_balance_tc || 0) - tc });
      return { ok: true };
    };

    switch (action) {
      case 'buy_item': {
        const def = ITEM_CATALOG[item];
        if (!def) return NextResponse.json({ error: 'Unknown item' }, { status: 400 });
        const c = await charge(def.price_tc);
        if (!c.ok) return c.res;
        await grantItem(userId, item);
        return NextResponse.json({ success: true, item: def, counts: await countItems(userId), wallet_balance_tc: (await getUser(userId)).wallet_balance_tc });
      }

      case 'open_pack': {
        const c = await charge(CARD_PACK.price_tc);
        if (!c.ok) return c.res;
        const cards = await openCardPack(userId);
        return NextResponse.json({
          success: true,
          cards: cards.map(id => ITEM_CATALOG[id]),
          counts: await countItems(userId),
          wallet_balance_tc: (await getUser(userId)).wallet_balance_tc,
        });
      }

      case 'use_item': {
        const def = ITEM_CATALOG[item];
        if (!def) return NextResponse.json({ error: 'Unknown item' }, { status: 400 });

        if (item === 'snatch') {
          if (!targetUserId) return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });
          const target = await getUser(targetUserId);
          if (!target) return NextResponse.json({ error: 'Target not found' }, { status: 404 });

          if (!(await consumeItem(userId, 'snatch'))) {
            return NextResponse.json({ error: 'You do not own a Snatch' }, { status: 400 });
          }

          const result = await snatchProgress(targetUserId, userId);

          return NextResponse.json({
            success: true,
            message: `Snatched ${target.name}! Their latest workout progress was halved.`,
            counts: await countItems(userId),
            ...result,
          });
        }

        if (item === 'shield') {
          if (!(await consumeItem(userId, 'shield'))) {
            return NextResponse.json({ error: 'You do not own a Streak Shield' }, { status: 400 });
          }
          await setEffect(userId, 'shield', true);
          return NextResponse.json({ success: true, message: 'Streak Shield armed - your next miss is protected.', counts: await countItems(userId) });
        }

        if (item === 'boost') {
          if (!(await consumeItem(userId, 'boost'))) {
            return NextResponse.json({ error: 'You do not own a TC Boost' }, { status: 400 });
          }
          await setEffect(userId, 'boost', true);
          return NextResponse.json({ success: true, message: 'TC Boost armed - your next workout earns +10 TC.', counts: await countItems(userId) });
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
