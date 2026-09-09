import { NextResponse } from 'next/server';
import { addMissedWorkout, getMissedWorkouts } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'dev_user';
    const list = await getMissedWorkouts(userId);
    return NextResponse.json({ success: true, missed: list });
  } catch (e) {
    console.error('Missed GET error:', e);
    return NextResponse.json({ error: 'Failed to get missed workouts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body.userId || 'dev_user';
    const item = await addMissedWorkout({
      userId,
      id: body.id,
      date: body.date,
      title: body.title,
      type: body.type,
      ai_plan: body.ai_plan
    });
    return NextResponse.json({ success: true, missed: item });
  } catch (e) {
    console.error('Missed POST error:', e);
    return NextResponse.json({ error: 'Failed to add missed workout' }, { status: 500 });
  }
}
