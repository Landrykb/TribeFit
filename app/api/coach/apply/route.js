import { NextResponse } from 'next/server';
import { getCoachProfile, getCoachApplication, createCoachApplication, approveCoachApplication, getUser } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, name, tribeId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const existingProfile = await getCoachProfile(userId);
    if (existingProfile && existingProfile.status === 'active') {
      return NextResponse.json({ error: 'Already a coach' }, { status: 400 });
    }

    const existingApp = await getCoachApplication(userId);
    if (existingApp && existingApp.status === 'pending') {
      return NextResponse.json({ error: 'Application already pending' }, { status: 400 });
    }

    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const REQUIREMENTS = { minStreak: 14, minWorkouts: 30, mustBeInTribe: true };
    const eligible =
      user.group_type === 'tribe' &&
      (user.streak || 0) >= REQUIREMENTS.minStreak &&
      (user.total_workouts || 0) >= REQUIREMENTS.minWorkouts;

    if (!eligible) {
      return NextResponse.json({
        error: 'Not eligible to become a coach',
        requirements: REQUIREMENTS,
        userStats: {
          groupType: user.group_type,
          streak: user.streak || 0,
          totalWorkouts: user.total_workouts || 0
        }
      }, { status: 403 });
    }

    const application = await createCoachApplication({
      userId,
      name: name || user.name,
      tribeId: tribeId || user.group_id
    });

    const coachLevel = Math.min(Math.floor((user.total_workouts || 30) / 50), 10);
    const sessionPrice = 10 + coachLevel;

    const { profile } = await approveCoachApplication(userId, { per_session: sessionPrice });

    return NextResponse.json({
      success: true,
      application,
      profile,
      message: 'Coach application approved!'
    }, { status: 201 });

  } catch (error) {
    console.error('Coach application error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process application' }, { status: 500 });
  }
}
