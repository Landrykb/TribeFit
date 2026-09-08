import { NextResponse } from 'next/server';
import { getUser } from '../../_store/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const user = getUser(userId);
    return NextResponse.json({ balance_tc: user.snatched_balance_tc });
  } catch (e) {
    return NextResponse.json({ balance_tc: 0 });
  }
}
