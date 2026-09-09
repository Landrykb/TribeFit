import { NextResponse } from 'next/server';
import { addCalendarEntry, listCalendar, getCalendarSettings } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

function parseICS(icsText) {
  const events = [];
  const lines = icsText.split(/\r?\n/);
  let current = null;
  for (let raw of lines) {
    const line = raw.trim();
    if (line === 'BEGIN:VEVENT') {
      current = {};
    } else if (line === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      if (line.startsWith('DTSTART')) {
        const parts = line.split(':');
        const val = parts[1] || '';
        current.DTSTART = val;
      } else if (line.startsWith('SUMMARY')) {
        const parts = line.split(':');
        current.SUMMARY = (parts.slice(1).join(':') || '').trim();
      }
    }
  }
  return events;
}

function icsDateToLocal(val) {
  if (!val) return null;
  if (/^\d{8}$/.test(val)) {
    const y = val.slice(0,4), m = val.slice(4,6), d = val.slice(6,8);
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }
  if (val.endsWith('Z')) {
    const y = val.slice(0,4), m = val.slice(4,6), d = val.slice(6,8), hh = val.slice(9,11) || '00', mm = val.slice(11,13) || '00';
    return new Date(Date.UTC(Number(y), Number(m)-1, Number(d), Number(hh), Number(mm)));
  }
  const m = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (m) {
    return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`);
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body?.userId || 'anon';
    const settings = await getCalendarSettings(userId);
    const icsUrl = body?.icsUrl || settings?.ics_url || '';
    const icsText = body?.icsText;
    if (!icsUrl && !icsText) return NextResponse.json({ error: 'Provide icsUrl or icsText (or save Apple ICS URL in settings first)' }, { status: 400 });

    let text = icsText;
    if (icsUrl) {
      const fetchUrl = icsUrl.startsWith('webcal://')
        ? 'https://' + icsUrl.slice('webcal://'.length)
        : icsUrl;
      const res = await fetch(fetchUrl);
      text = await res.text();
    }
    if (!text) return NextResponse.json({ error: 'No ICS content' }, { status: 400 });

    const keywords = String(settings?.keywords || 'workout,gym,run,exercise')
      .split(',').map(s => s.trim()).filter(Boolean);
    const regex = keywords.length ? new RegExp(keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') : null;

    const existing = await listCalendar({ userId });
    const hasDuplicate = (dateStr, timeStr, workout) => {
      const day = existing[dateStr] || [];
      return day.some(w => w.time === timeStr && w.workout === workout);
    };

    const evs = parseICS(text);
    let imported = 0;
    const now = new Date();
    const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()-1);
    const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()+60);

    for (const ev of evs) {
      const dt = icsDateToLocal(ev.DTSTART);
      if (!dt) continue;
      if (dt < minDate || dt > maxDate) continue;
      const title = ev.SUMMARY || 'Workout';
      if (regex && !regex.test(`${title}`)) continue;
      const dateStr = dt.toISOString().split('T')[0];
      const hh = `${dt.getHours()}`.padStart(2,'0');
      const mm = `${dt.getMinutes()}`.padStart(2,'0');
      const timeStr = `${hh}:${mm}`;
      if (hasDuplicate(dateStr, timeStr, title)) continue;
      await addCalendarEntry({ userId, date: dateStr, time: timeStr, workout: title, type: 'general', shared: false, duration: '45 min' });
      imported++;
    }

    return NextResponse.json({ imported });
  } catch (e) {
    console.error('Apple ICS import error:', e);
    return NextResponse.json({ error: 'Apple ICS import failed' }, { status: 500 });
  }
}
