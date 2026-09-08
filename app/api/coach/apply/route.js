import { NextResponse } from 'next/server';
import { getUser, createCoachApplication, getCoachProfile, getCoachApplication, approveCoachApplication } from '../../_store/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, name, tribeId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Check if already a coach
    const existingProfile = getCoachProfile(userId);
    if (existingProfile && existingProfile.status === 'active') {
      return NextResponse.json({ error: 'Already a coach' }, { status: 400 });
    }

    // Check for pending application
    const existingApp = getCoachApplication(userId);
    if (existingApp && existingApp.status === 'pending') {
      return NextResponse.json({ error: 'Application already pending' }, { status: 400 });
    }

    const user = getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify eligibility
    const REQUIREMENTS = {
      minStreak: 14,
      minWorkouts: 30,
      mustBeInTribe: true
    };

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

    // Create application
    const application = createCoachApplication({
      userId,
      name: name || user.name,
      tribeId: tribeId || user.group_id
    });

    // Auto-approve for now (in production, would require manual review)
    // Tiered pricing: 10 TC (beginner) to 20 TC (expert)
    const coachLevel = Math.min(Math.floor((user.total_workouts || 30) / 50), 10);
    const sessionPrice = 10 + coachLevel; // 10-20 TC based on experience
    
    const { profile } = approveCoachApplication(userId, { per_session: sessionPrice });

    return NextResponse.json({ 
      success: true,
      application,
      profile,
      message: 'Coach application approved!'
    }, { status: 201 });
  } catch (error) {
    console.error('Coach application error:', error);
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 });
  }
}
