import { NextResponse } from 'next/server';
import { getGoogleToken } from '../../../_store/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const token = getGoogleToken(userId);
    const connected = !!(token && (token.access_token || token.refresh_token));
    return NextResponse.json({ connected });
  } catch (e) {
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
