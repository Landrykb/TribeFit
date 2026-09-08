import { NextResponse } from 'next/server';
import { getCalendarSettings, setCalendarSettings } from '../../../_store/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const settings = getCalendarSettings(userId);
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body?.userId || 'anon';
    const calendars = Array.isArray(body?.calendars) ? body.calendars : [];
    const keywords = typeof body?.keywords === 'string' ? body.keywords : undefined;
    const saved = setCalendarSettings(userId, { calendars, keywords });
    return NextResponse.json({ settings: saved });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
