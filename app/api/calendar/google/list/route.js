import { NextResponse } from 'next/server';
import { getGoogleToken, setGoogleToken } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

async function refreshAccessToken(token) {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!token?.refresh_token || !client_id || !client_secret) return null;
  const body = new URLSearchParams();
  body.set('client_id', client_id);
  body.set('client_secret', client_secret);
  body.set('refresh_token', token.refresh_token);
  body.set('grant_type', 'refresh_token');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) return null;
  return {
    ...token,
    access_token: data.access_token,
    expiry_date: Date.now() + (Number(data.expires_in || 3600) * 1000),
    refresh_token: token.refresh_token,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    let token = await getGoogleToken(userId);
    if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

    if (token.expiry_date && token.expiry_date - Date.now() < 60000) {
      const refreshed = await refreshAccessToken(token);
      if (refreshed) {
        token = refreshed;
        await setGoogleToken(userId, refreshed);
      }
    }

    let calRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });

    if (calRes.status === 401) {
      const refreshed = await refreshAccessToken(token);
      if (refreshed) {
        await setGoogleToken(userId, refreshed);
        token = refreshed;
        calRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
          headers: { Authorization: `Bearer ${token.access_token}` }
        });
      }
    }

    const data = await calRes.json();
    if (!calRes.ok) return NextResponse.json({ error: 'Google API error', details: data }, { status: 500 });

    const calendars = Array.isArray(data.items) ? data.items.map((c) => ({
      id: c.id,
      summary: c.summary,
      primary: !!c.primary,
      selected: !!c.selected,
    })) : [];

    return NextResponse.json({ calendars });
  } catch (e) {
    console.error('Google list error:', e);
    return NextResponse.json({ error: 'List calendars failed' }, { status: 500 });
  }
}
