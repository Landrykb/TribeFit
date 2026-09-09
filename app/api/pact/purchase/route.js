import { NextResponse } from 'next/server';
import { broadcastToGroup } from '../../events/route';
import { recordPurchase } from '@/lib/supabase-db';

export async function POST(request) {
  try {
    const { item_id, specs = {}, amount_tc, from_snatched = 0, from_wallet = 0, userId, groupId = 'default' } = await request.json();

    if (!item_id || !amount_tc || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rec = await recordPurchase({ userId, groupId, amountTc: amount_tc, from_snatched, from_wallet });

    broadcastToGroup({
      groupId,
      originUserId: userId,
      payload: {
        type: 'purchase',
        item_id,
        amount_tc,
        from_snatched,
        from_wallet,
        specs
      }
    });

    return NextResponse.json({ success: true, balances: rec.balances });
  } catch (e) {
    console.error('purchase error', e);
    return NextResponse.json({ error: e.message || 'purchase failed' }, { status: 500 });
  }
}
