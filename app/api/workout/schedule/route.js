import { NextResponse } from 'next/server';
import { listSchedules, addSchedule, ensureMembership } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const groupIdRaw = searchParams.get('groupId');
    const groupFilter = groupIdRaw && groupIdRaw !== 'all' ? groupIdRaw : undefined;
    if (groupFilter) await ensureMembership(groupFilter, userId);
    const schedules = await listSchedules({ userId, groupId: groupFilter });
    return NextResponse.json({ success: true, schedules });
  } catch (e) {
    console.error('Schedule GET error:', e);
    return NextResponse.json({ success: false, schedules: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, groupId = 'default', title, start_at, duration_min = 30 } = body || {};
    if (!userId || !start_at) {
      return NextResponse.json({ error: 'Missing userId or start_at' }, { status: 400 });
    }
    await ensureMembership(groupId, userId);
    const schedule = await addSchedule({ userId, groupId, title, start_at, duration_min });
    return NextResponse.json({ success: true, schedule });
  } catch (e) {
    console.error('Schedule POST error:', e);
    return NextResponse.json({ success: false, error: 'Failed to add schedule' }, { status: 500 });
  }
}
