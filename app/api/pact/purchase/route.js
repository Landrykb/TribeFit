import { NextResponse } from 'next/server';
import { broadcastToGroup } from '../../events/route';
import { recordPurchase } from '../../_store/db';

export async function POST(request) {
  try {
    const { item_id, specs = {}, amount_tc, from_snatched = 0, from_wallet = 0, userId, groupId = 'default' } = await request.json();

    if (!item_id || !amount_tc || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Record purchase in in-memory db
    const rec = recordPurchase({ userId, groupId, amountTc: amount_tc, from_snatched, from_wallet });

    // Broadcast purchase event
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
    return NextResponse.json({ error: 'purchase failed' }, { status: 500 });
  }
}
