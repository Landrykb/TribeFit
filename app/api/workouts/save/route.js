import { NextResponse } from 'next/server';
import { saveWorkout } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { userId, workout } = await request.json();

    if (!userId || !workout) {
      return NextResponse.json({ error: 'userId and workout required' }, { status: 400 });
    }

    const saved = await saveWorkout(userId, workout);

    return NextResponse.json({
      success: true,
      workout: saved,
      message: workout.id && !String(workout.id).startsWith('temp') ? 'Workout updated' : 'Workout saved'
    });
  } catch (error) {
    console.error('Save workout error:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
