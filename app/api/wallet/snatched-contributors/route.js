import { NextResponse } from 'next/server';
import { getDonors } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const contributors = await getDonors(groupId);
    return NextResponse.json({ groupId, contributors });
  } catch (e) {
    console.error('Snatched contributors error:', e);
    return NextResponse.json({ contributors: [] });
  }
}
