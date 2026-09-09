import { NextResponse } from 'next/server';
import { getWorkouts } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const workouts = await getWorkouts(userId);
    return NextResponse.json({ workouts, count: workouts.length });
  } catch (e) {
    console.error('My workouts error:', e);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}
