import { NextResponse } from 'next/server';
import { castModeVote } from '@/lib/supabase-db';
import { broadcastToGroup } from '../../../../events/route';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { groupId = 'default', userId, support } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    const res = await castModeVote({ groupId, userId, support: !!support });
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
    console.error('Mode vote cast error:', e);
    return NextResponse.json({ error: e.message || 'Failed to cast vote' }, { status: 400 });
  }
}
