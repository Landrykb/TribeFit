export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDailyVersus, getUser, getGroup } from '../_store/db';

// GET /api/versus?groupId=...&userId=... → today's standings + pot + last result
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');
    if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });

    const data = getDailyVersus(groupId);
    const yourRank = userId ? data.standings.findIndex(s => s.user_id === userId) + 1 : 0;

    return NextResponse.json({ ...data, your_rank: yourRank || null });
  } catch (error) {
    console.error('Versus GET error:', error);
    return NextResponse.json({ error: 'Failed to load versus' }, { status: 500 });
  }
}
