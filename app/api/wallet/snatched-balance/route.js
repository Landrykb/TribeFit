import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const user = await getUser(userId);
    return NextResponse.json({ balance_tc: user?.snatched_balance_tc || 0 });
  } catch (e) {
    console.error('Snatched balance error:', e);
    return NextResponse.json({ balance_tc: 0 });
  }
}
