import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { castModeVote } from '../../../../_store/db';
import { broadcastToGroup } from '../../../../events/route';

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const { groupId = 'default', userId, support } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    const res = castModeVote({ groupId, userId, support: !!support });
    try {
      broadcastToGroup({
        groupId,
        originUserId: userId,
        payload: { type: 'vote_cast', vote: res.vote, totals: res.totals }
      });
      if (res.finalized) {
        broadcastToGroup({
          groupId,
          originUserId: 'system',
          payload: { type: 'mode_changed', skipMode: res.newMode }
        });
      }
    } catch {}
    return NextResponse.json({ success: true, ...res });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to cast vote' }, { status: 400 });
  }
  });
}
