export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getUser, getCoachProfile, getCoachApplication } from '../../_store/db';
import { runWithStore } from '@/app/api/_store/db';

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const user = getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already a coach
    const coachProfile = getCoachProfile(userId);
    if (coachProfile && coachProfile.status === 'active') {
      return NextResponse.json({
        eligible: true,
        isCoach: true,
        applicationPending: false,
        reason: 'Already a coach'
      });
    }

    // Check for pending application
    const application = getCoachApplication(userId);
    if (application && application.status === 'pending') {
      return NextResponse.json({
        eligible: false,
        isCoach: false,
        applicationPending: true,
        reason: 'Application under review'
      });
    }

    // Check eligibility requirements
    const REQUIREMENTS = {
      minStreak: 14,
      minWorkouts: 30,
      mustBeInTribe: true
    };

    const checks = {
      inTribe: user.group_type === 'tribe',
      streak: (user.streak || 0) >= REQUIREMENTS.minStreak,
      workouts: (user.total_workouts || 0) >= REQUIREMENTS.minWorkouts
    };

    const eligible = checks.inTribe && checks.streak && checks.workouts;

    return NextResponse.json({
      eligible,
      isCoach: false,
      applicationPending: false,
      checks,
      requirements: REQUIREMENTS,
      userStats: {
        streak: user.streak || 0,
        totalWorkouts: user.total_workouts || 0,
        groupType: user.group_type
      }
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 });
  }
  });
}
