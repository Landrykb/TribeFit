import { NextResponse } from 'next/server';
import { listSchedules, addSchedule, ensureMembership } from '../../_store/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const groupIdRaw = searchParams.get('groupId');
    const groupFilter = groupIdRaw && groupIdRaw !== 'all' ? groupIdRaw : undefined;
    if (groupFilter) ensureMembership(groupFilter, userId);
    const schedules = listSchedules({ userId, groupId: groupFilter });
    return NextResponse.json({ success: true, schedules });
  } catch (e) {
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
    ensureMembership(groupId, userId);
    const schedule = addSchedule({ userId, groupId, title, start_at, duration_min });
    return NextResponse.json({ success: true, schedule });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to add schedule' }, { status: 500 });
  }
}
