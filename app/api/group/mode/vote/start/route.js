import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { startModeVote } from '../../../../_store/db';
import { broadcastToGroup } from '../../../../events/route';

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const { groupId = 'default', proposerId, targetMode } = await request.json();
    if (!proposerId) return NextResponse.json({ error: 'Missing proposerId' }, { status: 400 });
    if (!['teammate_boost', 'tribe_fund'].includes(targetMode)) {
      return NextResponse.json({ error: 'Invalid targetMode' }, { status: 400 });
    }
    const vote = startModeVote({ groupId, proposerId, targetMode, cooldownDays: 0 });
    try {
      broadcastToGroup({
        groupId,
        originUserId: proposerId,
        payload: { type: 'vote_started', vote }
      });
    } catch {}
    return NextResponse.json({ success: true, vote });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to start vote' }, { status: 400 });
  }
  });
}
