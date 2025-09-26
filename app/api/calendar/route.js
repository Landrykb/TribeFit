import { NextResponse } from 'next/server';

// Mock calendar data - in real app this would be in Supabase
let workoutSchedule = {
  '2024-01-15': [
    { id: 'w1', user_id: '00000000-0000-0000-0000-000000000001', user_name: 'Alex Chen', time: '07:00', workout: 'Push/Pull/Legs', shared: true },
    { id: 'w2', user_id: '00000000-0000-0000-0000-000000000002', user_name: 'Jordan Kim', time: '18:30', workout: 'Cardio HIIT', shared: true }
  ],
  '2024-01-16': [
    { id: 'w3', user_id: '00000000-0000-0000-0000-000000000003', user_name: 'Sarah Wilson', time: '06:30', workout: 'Yoga Flow', shared: true },
    { id: 'w4', user_id: '00000000-0000-0000-0000-000000000001', user_name: 'Alex Chen', time: '19:00', workout: 'Upper Body', shared: false }
  ]
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const userId = url.searchParams.get('user_id');
    const tribeId = url.searchParams.get('tribe_id');

    if (date) {
      // Get workouts for specific date
      const dateWorkouts = workoutSchedule[date] || [];
      
      // Filter by user if requested
      if (userId) {
        const userWorkouts = dateWorkouts.filter(w => w.user_id === userId);
        return NextResponse.json({ workouts: userWorkouts });
      }
      
      // Filter by tribe (show only shared workouts from tribe members)
      if (tribeId) {
        const tribeWorkouts = dateWorkouts.filter(w => w.shared);
        return NextResponse.json({ workouts: tribeWorkouts });
      }
      
      return NextResponse.json({ workouts: dateWorkouts });
    }

    // Get all scheduled workouts
    return NextResponse.json({ schedule: workoutSchedule });
    
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, time, workout_type, workout_name, user_id, user_name, shared = false } = body;

    // Validate required fields
    if (!date || !time || !workout_name || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: date, time, workout_name, user_id' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Create new workout schedule entry
    const newWorkout = {
      id: `workout-${Date.now()}`,
      user_id,
      user_name: user_name || 'User',
      time,
      workout: workout_name,
      type: workout_type || 'general',
      shared: Boolean(shared),
      created_at: new Date().toISOString()
    };

    // Add to schedule
    if (!workoutSchedule[date]) {
      workoutSchedule[date] = [];
    }

    // Check for conflicts (same user, same time)
    const hasConflict = workoutSchedule[date].some(w => 
      w.user_id === user_id && w.time === time
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: 'You already have a workout scheduled at this time' },
        { status: 409 }
      );
    }

    workoutSchedule[date].push(newWorkout);

    // Sort workouts by time
    workoutSchedule[date].sort((a, b) => a.time.localeCompare(b.time));

    // In a real app, save to Supabase:
    // const { data, error } = await supabase
    //   .from('workout_schedules')
    //   .insert(newWorkout)
    //   .select()
    //   .single();

    return NextResponse.json({ 
      success: true, 
      workout: newWorkout,
      message: `Workout scheduled for ${date} at ${time}` 
    });
    
  } catch (error) {
    console.error('Error scheduling workout:', error);
    return NextResponse.json(
      { error: 'Failed to schedule workout' },
      { status: 500 }
    );
  }
}