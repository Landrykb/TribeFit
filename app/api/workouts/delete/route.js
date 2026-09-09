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

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const { userId, workoutId } = await request.json();

    if (!userId || !workoutId) {
      return NextResponse.json({ error: 'userId and workoutId required' }, { status: 400 });
    }

    // Get user's existing workouts
    const userWorkouts = getUserWorkoutsStore();
    const workouts = userWorkouts.get(userId) || [];
    
    // Filter out the workout to delete
    const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
    
    userWorkouts.set(userId, updatedWorkouts);

    return NextResponse.json({ 
      success: true,
      message: 'Workout deleted',
      count: updatedWorkouts.length
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
  });
}
