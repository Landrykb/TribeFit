import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { getCalendarSettings, setAppleCalendarSettings } from '../../../_store/db';

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const settings = getCalendarSettings(userId);
    return NextResponse.json({ apple_ics_url: settings.apple_ics_url || '' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get Apple settings' }, { status: 500 });
  }
  });
}

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const body = await request.json();
    const userId = body?.userId || 'anon';
    const icsUrl = body?.icsUrl || '';
    const saved = setAppleCalendarSettings(userId, { icsUrl });
    return NextResponse.json({ apple_ics_url: saved.apple_ics_url || '' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save Apple settings' }, { status: 500 });
  }
  });
}
