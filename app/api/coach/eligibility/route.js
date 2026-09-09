export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getCoachEligibility } from '@/lib/supabase-db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const result = await getCoachEligibility(userId);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 });
  }
}
