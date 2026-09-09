import { NextResponse } from 'next/server';
import { recordPaidSkip } from '@/lib/supabase-db';
import { broadcastToGroup } from '../../events/route';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { userId, userName, groupId = 'default', costTc = 10 } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const result = await recordPaidSkip({ userId, userName, groupId, costTc });
    const eventId = `ev_${Date.now()}_${Math.floor(Math.random()*1e6)}`;

    broadcastToGroup({
      groupId,
      originUserId: userId,
      payload: {
        type: 'paid_skip',
        eventId,
        originUserName: userName,
        skipMode: result.skipMode,
        recipients: result.recipients,
        distributionPerMember: result.distributionPerMember,
        vaultShare: result.vaultShare,
        streakShield: result.streakShield,
        catchUpCredit: result.catchUpCredit
      }
    });

    return NextResponse.json({ success: true, eventId, ...result });
  } catch (e) {
    console.error('skip/pay error', e);
    return NextResponse.json({ error: e.message || 'skip/pay failed' }, { status: 500 });
  }
}
