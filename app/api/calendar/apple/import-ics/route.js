import { NextResponse } from 'next/server';
import { addCalendarEntry, listCalendar, getCalendarSettings } from '../../../_store/db';

function parseICS(icsText) {
  // Very small ICS parser for DTSTART, SUMMARY
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
        current.DTSTART = val; // e.g., 20250115T173000Z or 20250115
      } else if (line.startsWith('SUMMARY')) {
        const parts = line.split(':');
        current.SUMMARY = (parts.slice(1).join(':') || '').trim();
      }
    }
  }
  return events;
}

function icsDateToLocal(val) {
  // Handles YYYYMMDD or YYYYMMDDTHHMMSSZ or local time without Z
  if (!val) return null;
  if (/^\d{8}$/.test(val)) {
    const y = val.slice(0,4), m = val.slice(4,6), d = val.slice(6,8);
    const dt = new Date(`${y}-${m}-${d}T00:00:00`);
    return dt;
  }
  // If Z -> UTC, otherwise treat as local
  if (val.endsWith('Z')) {
    const y = val.slice(0,4), m = val.slice(4,6), d = val.slice(6,8), hh = val.slice(9,11) || '00', mm = val.slice(11,13) || '00';
    const dt = new Date(Date.UTC(Number(y), Number(m)-1, Number(d), Number(hh), Number(mm)));
    return dt;
  }
  // Local naive
  const m = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (m) {
    const dt = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`);
    return dt;
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body?.userId || 'anon';
    const settings = getCalendarSettings(userId);
    const icsUrl = body?.icsUrl || settings?.apple_ics_url || '';
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

    const existing = listCalendar({ userId });
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
      addCalendarEntry({ userId, date: dateStr, time: timeStr, workout: title, shared: false, duration: '45 min' });
      imported++;
    }

    return NextResponse.json({ imported });
  } catch (e) {
    return NextResponse.json({ error: 'Apple ICS import failed' }, { status: 500 });
  }
}
