import { NextResponse } from 'next/server';
import { getBalances, ensureMembership } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const groupId = searchParams.get('groupId') || 'default';
    await ensureMembership(groupId, userId);
    const balances = await getBalances({ userId, groupId });
    return NextResponse.json({ success: true, balances });
  } catch (e) {
    console.error('Wallet balances error:', e);
    return NextResponse.json({ success: false, balances: { wallet: 0, snatched: 0, pact: 0 } }, { status: 500 });
  }
}
