import { NextResponse } from 'next/server';
import { getCalendarSettings, setAppleCalendarSettings } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const settings = await getCalendarSettings(userId);
    return NextResponse.json({ apple_ics_url: settings.ics_url || '' });
  } catch (e) {
    console.error('Apple settings GET error:', e);
    return NextResponse.json({ error: 'Failed to get Apple settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body?.userId || 'anon';
    const icsUrl = body?.icsUrl || '';
    const saved = await setAppleCalendarSettings(userId, { icsUrl });
    return NextResponse.json({ apple_ics_url: saved.ics_url || '' });
  } catch (e) {
    console.error('Apple settings POST error:', e);
    return NextResponse.json({ error: 'Failed to save Apple settings' }, { status: 500 });
  }
}
