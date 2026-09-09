import { NextResponse } from 'next/server';
import { getBalances, ensureMembership } from '../../_store/db';
import { runWithStore } from '@/app/api/_store/db';

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const groupId = searchParams.get('groupId') || 'default';
    ensureMembership(groupId, userId);
    const balances = getBalances({ userId, groupId });
    return NextResponse.json({ success: true, balances });
  } catch (e) {
    return NextResponse.json({ success: false, balances: { wallet: 0, snatched: 0, pact: 0 } }, { status: 500 });
  }
  });
}
