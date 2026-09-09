import { NextResponse } from 'next/server';
import { recordPaidSkip } from '../../_store/db';
import { broadcastToGroup } from '../../events/route';
import { runWithStore } from '@/app/api/_store/db';

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const { userId, userName, groupId = 'default', costTc = 10 } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const result = recordPaidSkip({ userId, userName, groupId, costTc });
    const eventId = `ev_${Date.now()}_${Math.floor(Math.random()*1e6)}`;

    // Broadcast to group so other members update
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
    return NextResponse.json({ error: 'skip/pay failed' }, { status: 500 });
  }
  });
}
