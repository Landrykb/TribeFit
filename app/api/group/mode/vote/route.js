import { NextResponse } from 'next/server';
import { getModeVoteWithTotals } from '../../../_store/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const vt = getModeVoteWithTotals(groupId);
    if (!vt) return NextResponse.json({ success: true, vote: null, totals: null });
    return NextResponse.json({ success: true, ...vt });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get vote' }, { status: 500 });
  }
}
