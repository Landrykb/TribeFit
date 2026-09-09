import { NextResponse } from 'next/server';
import { getDonors } from '../../_store/db';
import { runWithStore } from '@/app/api/_store/db';

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const contributors = getDonors(groupId) || [];
    return NextResponse.json({ groupId, contributors });
  } catch (e) {
    return NextResponse.json({ contributors: [] });
  }
  });
}
