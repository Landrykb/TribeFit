import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';

// Simple in-memory store (replace with database in production)
// Use global to persist across hot reloads
function getUserWorkoutsStore() {
  if (!global.userWorkoutsStore) {
    global.userWorkoutsStore = new Map();
  }
  return global.userWorkoutsStore;
}

export async function GET(request) {
  return runWithStore(async () => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const userWorkouts = getUserWorkoutsStore();
  const workouts = userWorkouts.get(userId) || [];
  
  return NextResponse.json({ workouts, count: workouts.length });
  });
}
