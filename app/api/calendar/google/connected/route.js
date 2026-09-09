import { NextResponse } from 'next/server';
import { getGoogleToken } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const token = await getGoogleToken(userId);
    const connected = !!(token && (token.access_token || token.refresh_token));
    return NextResponse.json({ connected });
  } catch (e) {
    console.error('Google connected check error:', e);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
