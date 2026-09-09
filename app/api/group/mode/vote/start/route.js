import { NextResponse } from 'next/server';
import { startModeVote } from '@/lib/supabase-db';
import { broadcastToGroup } from '../../../../events/route';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { groupId = 'default', proposerId, targetMode } = await request.json();
    if (!proposerId) return NextResponse.json({ error: 'Missing proposerId' }, { status: 400 });
    if (!['teammate_boost', 'tribe_fund'].includes(targetMode)) {
      return NextResponse.json({ error: 'Invalid targetMode' }, { status: 400 });
    }
    const vote = await startModeVote({ groupId, proposerId, targetMode, cooldownDays: 0 });
    try {
      broadcastToGroup({
        groupId,
        originUserId: proposerId,
        payload: { type: 'vote_started', vote }
      });
    } catch {}
    return NextResponse.json({ success: true, vote });
  } catch (e) {
    console.error('Mode vote start error:', e);
    return NextResponse.json({ error: e.message || 'Failed to start vote' }, { status: 400 });
  }
}
