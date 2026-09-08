import { NextResponse } from 'next/server';
import { addCoachRating, getCoachProfile } from '../../_store/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { hireId, coachId, clientId, stars, text = '' } = body;

    if (!coachId || !clientId || !stars) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const starValue = Number(stars);
    if (starValue < 1 || starValue > 5) {
      return NextResponse.json({ error: 'Stars must be between 1 and 5' }, { status: 400 });
    }

    const coachProfile = getCoachProfile(coachId);
    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const rating = addCoachRating({
      hireId,
      coachId,
      clientId,
      stars: starValue,
      text: text || ''
    });

    // Get updated coach profile with new average rating
    const updatedProfile = getCoachProfile(coachId);

    return NextResponse.json({
      success: true,
      rating,
      coach: updatedProfile,
      message: `Thank you for rating ${coachProfile.name}!`
    }, { status: 201 });
  } catch (error) {
    console.error('Coach rating error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
