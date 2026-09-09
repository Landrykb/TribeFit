import { NextResponse } from 'next/server';
import { deleteWorkout } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { userId, workoutId } = await request.json();

    if (!userId || !workoutId) {
      return NextResponse.json({ error: 'userId and workoutId required' }, { status: 400 });
    }

    await deleteWorkout(userId, workoutId);

    return NextResponse.json({
      success: true,
      message: 'Workout deleted'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
