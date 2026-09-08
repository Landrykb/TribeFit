import { NextResponse } from 'next/server';

// Simple in-memory store (replace with database in production)
// Note: In production, replace this with a real database (PostgreSQL, MongoDB, etc.)
let userWorkoutsStore = null;

function getUserWorkoutsStore() {
  if (!userWorkoutsStore) {
    // Use global to persist across hot reloads in development
    if (global.userWorkoutsStore) {
      userWorkoutsStore = global.userWorkoutsStore;
    } else {
      userWorkoutsStore = new Map();
      global.userWorkoutsStore = userWorkoutsStore;
    }
  }
  return userWorkoutsStore;
}

export async function POST(request) {
  try {
    const { userId, workout } = await request.json();

    if (!userId || !workout) {
      return NextResponse.json({ error: 'userId and workout required' }, { status: 400 });
    }

    // Get user's existing workouts
    const userWorkouts = getUserWorkoutsStore();
    const workouts = userWorkouts.get(userId) || [];
    
    // Check if updating existing workout
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    
    if (existingIndex >= 0) {
      // Update existing
      workouts[existingIndex] = {
        ...workout,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new
      workouts.push({
        ...workout,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    userWorkouts.set(userId, workouts);

    return NextResponse.json({ 
      success: true, 
      workout,
      message: existingIndex >= 0 ? 'Workout updated' : 'Workout saved'
    });
  } catch (error) {
    console.error('Save workout error:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
