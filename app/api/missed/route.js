import { NextResponse } from 'next/server';
import { addMissedWorkout, getMissedWorkouts } from '../_store/db';
import { runWithStore } from '@/app/api/_store/db';

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'dev_user';
    const list = getMissedWorkouts(userId);
    return NextResponse.json({ success: true, missed: list });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get missed workouts' }, { status: 500 });
  }
  });
}

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const body = await request.json();
    const userId = body.userId || 'dev_user';
    const item = addMissedWorkout({ userId, id: body.id, date: body.date, title: body.title, type: body.type, ai_plan: body.ai_plan });
    return NextResponse.json({ success: true, missed: item });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add missed workout' }, { status: 500 });
  }
  });
}
