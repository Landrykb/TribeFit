import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { 
  listCalendar,
  getCalendarDay,
  addCalendarEntry,
  updateCalendarEntry,
  deleteCalendarEntry,
  getGroup
} from '../_store/db';

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const userId = url.searchParams.get('user_id') || 'anon';
    const scope = url.searchParams.get('scope') || 'me';
    const groupId = url.searchParams.get('group_id') || '';

    if (date) {
      // Single-day view
      if (scope === 'group' && groupId) {
        try {
          const group = getGroup(groupId);
          const memberIds = Array.isArray(group?.members) ? group.members : [];
          const all = [];
          memberIds.forEach((mid) => {
            const items = getCalendarDay({ userId: mid, date });
            items.forEach((it) => all.push({ ...it, user_id: mid }));
          });
          return NextResponse.json({ workouts: all });
        } catch (_) {
          // Fallback to just current user if any issue
          const workouts = getCalendarDay({ userId, date });
          return NextResponse.json({ workouts });
        }
      } else {
        const workouts = getCalendarDay({ userId, date });
        return NextResponse.json({ workouts });
      }
    }

    const schedule = listCalendar({ userId });
    return NextResponse.json({ schedule });
    
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
  });
}

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const body = await request.json();
    const { date, time, workout_type, workout_name, user_id, user_name, shared = false, duration, ai_plan } = body;

    if (!date || !time || !workout_name || !user_id) {
      return NextResponse.json({ error: 'Missing required fields: date, time, workout_name, user_id' }, { status: 400 });
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:MM' }, { status: 400 });
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Sanitize ai_plan to ensure JSON-safe storage
    let safePlan = null;
    if (ai_plan) {
      try {
        safePlan = JSON.parse(JSON.stringify(ai_plan));
      } catch (_) {
        safePlan = null; // fallback
      }
    }

    // Check conflicts handled client-side; here we just add
    const entry = addCalendarEntry({
      userId: user_id,
      date,
      time,
      workout: workout_name,
      type: workout_type || 'general',
      shared: Boolean(shared),
      duration: duration || '45 min',
      user_name: user_name || 'User',
      ai_plan: safePlan,
    });
    return NextResponse.json({ success: true, workout: entry, message: `Workout scheduled for ${date} at ${time}` }, { status: 201 });
    
  } catch (error) {
    console.error('Error scheduling workout:', error);
    return NextResponse.json({ error: error?.message || 'Failed to schedule workout' }, { status: 500 });
  }
  });
}

export async function PATCH(request) {
  return runWithStore(async () => {
  try {
    const body = await request.json();
    const { user_id, id, date, time, workout_name, workout_type, shared, duration } = body || {};
    if (!user_id || !id) return NextResponse.json({ error: 'Missing user_id or id' }, { status: 400 });
    const changes = {};
    if (date) changes.date = date;
    if (time) changes.time = time;
    if (workout_name) changes.workout = workout_name;
    if (workout_type) changes.type = workout_type;
    if (typeof shared === 'boolean') changes.shared = shared;
    if (duration) changes.duration = duration;
    const updated = updateCalendarEntry({ userId: user_id, id, changes });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, workout: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
  });
}

export async function DELETE(request) {
  return runWithStore(async () => {
  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id') || 'anon';
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const ok = deleteCalendarEntry({ userId: user_id, id });
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
  });
}
