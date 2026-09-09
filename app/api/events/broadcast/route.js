import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { broadcastToGroup } from '../route';

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const { groupId = 'default', type, data = {}, originUserId } = await request.json();
    if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 });

    broadcastToGroup({
      groupId,
      originUserId,
      payload: { type, ...data, ts: Date.now() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 });
  }
  });
}
