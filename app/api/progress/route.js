import { NextResponse } from 'next/server';
import { addProgress, listProgress } from '../_store/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id') || 'anon';
    const limit = Number(url.searchParams.get('limit') || 20);
    const list = listProgress({ userId, limit });
    return NextResponse.json({ progress: list });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, title, duration_sec, completed_sets, date, type, distance_m } = body || {};
    if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    const entry = addProgress({ userId: user_id, title, duration_sec, completed_sets, date, type, distance_m });
    return NextResponse.json({ success: true, entry });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 });
  }
}
