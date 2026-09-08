import { NextResponse } from 'next/server';
import { listCatchUpCredits, getMissedWorkouts, consumeCatchUpCredit, removeMissedWorkout } from '../_store/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || searchParams.get('user_id') || 'dev_user';
    const credits = listCatchUpCredits(userId);
    const missed = getMissedWorkouts(userId);
    return NextResponse.json({ success: true, count: credits.length, credits, missed });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get credits' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body.userId || 'dev_user';
    const action = body.action || 'consume';
    if (action === 'consume') {
      const ok = consumeCatchUpCredit(userId);
      if (!ok) return NextResponse.json({ error: 'No credits available' }, { status: 400 });
      if (body.missedId) {
        try { removeMissedWorkout(userId, body.missedId); } catch {}
      }
      const credits = listCatchUpCredits(userId);
      const missed = getMissedWorkouts(userId);
      return NextResponse.json({ success: true, count: credits.length, credits, missed });
    }
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
  }
}
