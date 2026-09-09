import { NextResponse } from 'next/server';
import { upgradeSquad } from '@/lib/supabase-db';

export async function POST(request) {
  try {
    const { squadId, upgradedBy } = await request.json();

    if (!squadId || !upgradedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: squadId and upgradedBy' },
        { status: 400 }
      );
    }

    const result = await upgradeSquad(squadId, upgradedBy);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Squad upgrade error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade squad to tribe' },
      { status: 500 }
    );
  }
}
