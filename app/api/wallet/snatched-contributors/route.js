import { NextResponse } from 'next/server';
import { getDonors } from '../../_store/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const contributors = getDonors(groupId) || [];
    return NextResponse.json({ groupId, contributors });
  } catch (e) {
    return NextResponse.json({ contributors: [] });
  }
}
