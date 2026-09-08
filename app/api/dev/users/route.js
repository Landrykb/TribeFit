import { NextResponse } from 'next/server';
import { createTestUser, updateUserStats, listAllUsers, getUser } from '../../_store/db';

export async function GET(request) {
  try {
    const users = listAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Failed to list users:', error);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, name, updates, initialData } = body;

    if (action === 'create') {
      const user = createTestUser(name, userId, initialData);
      return NextResponse.json({ success: true, user });
    }

    if (action === 'update') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }
      const user = updateUserStats(userId, updates || {});
      return NextResponse.json({ success: true, user });
    }

    if (action === 'get') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }
      const user = getUser(userId);
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('User operation failed:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
