import { NextResponse } from 'next/server';
import { getModeVoteWithTotals } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const vt = await getModeVoteWithTotals(groupId);
    if (!vt) return NextResponse.json({ success: true, vote: null, totals: null });
    return NextResponse.json({ success: true, ...vt });
  } catch (e) {
    console.error('Mode vote GET error:', e);
    return NextResponse.json({ error: 'Failed to get vote' }, { status: 500 });
  }
}
