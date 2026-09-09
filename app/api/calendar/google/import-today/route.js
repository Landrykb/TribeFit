import { NextResponse } from 'next/server';
import { getGoogleToken, setGoogleToken, addCalendarEntry, getCalendarSettings, listCalendar } from '@/lib/supabase-db';

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
    if (!token || !token.access_token) {
      return NextResponse.json({ error: 'Not connected' }, { status: 401 });
    }

    if (token.expiry_date && token.expiry_date - Date.now() < 60000) {
      const refreshed = await refreshAccessToken(token);
      if (refreshed) { token = refreshed; await setGoogleToken(userId, refreshed); }
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23,59,59,999);

    const paramsBase = new URLSearchParams();
    paramsBase.set('maxResults', '20');
    paramsBase.set('singleEvents', 'true');
    paramsBase.set('orderBy', 'startTime');
    paramsBase.set('timeMin', startOfDay.toISOString());
    paramsBase.set('timeMax', endOfDay.toISOString());

    const settings = await getCalendarSettings(userId);
    const keywords = String(settings?.keywords || 'workout,gym,run,exercise')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const regex = keywords.length ? new RegExp(keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') : null;
    const calIds = Array.isArray(settings?.calendars) && settings.calendars.length > 0 ? settings.calendars : ['primary'];

    const existing = await listCalendar({ userId });
    const hasDuplicate = (dateStr, timeStr, title) => {
      const day = existing[dateStr] || [];
      return day.some(w => w.time === timeStr && w.workout === title);
    };

    let imported = 0;
    for (const calId of calIds) {
      const calRes1 = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?${paramsBase.toString()}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
      });
      let cal = await calRes1.json();
      if (calRes1.status === 401) {
        const refreshed = await refreshAccessToken(token);
        if (refreshed) {
          token = refreshed; await setGoogleToken(userId, refreshed);
          const calRes2 = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?${paramsBase.toString()}`, {
            headers: { Authorization: `Bearer ${token.access_token}` }
          });
          cal = await calRes2.json();
          if (!calRes2.ok) continue;
        } else {
          continue;
        }
      } else if (!calRes1.ok) {
        continue;
      }

      const events = Array.isArray(cal.items) ? cal.items : [];
      for (const ev of events) {
        const startISO = ev?.start?.dateTime || ev?.start?.date;
        if (!startISO) continue;
        const dt = new Date(startISO);
        const dateStr = dt.toISOString().split('T')[0];
        const hh = String(dt.getHours()).padStart(2,'0');
        const mm = String(dt.getMinutes()).padStart(2,'0');
        const timeStr = `${hh}:${mm}`;
        const title = ev.summary || 'Workout';
        const text = `${title} ${ev.description || ''}`;
        if (regex && !regex.test(text)) continue;
        if (hasDuplicate(dateStr, timeStr, title)) continue;
        await addCalendarEntry({ userId, date: dateStr, time: timeStr, workout: title, type: 'general', duration: '45 min', shared: false });
        imported++;
      }
    }

    return NextResponse.json({ imported });
  } catch (e) {
    console.error('Google import error:', e);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
