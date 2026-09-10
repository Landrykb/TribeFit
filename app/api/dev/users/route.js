import { NextResponse } from 'next/server';
import { getUser, listAllUsers, createTestUser, updateUserStats } from '@/lib/supabase-db';

export async function GET(request) {
  try {
    const users = await listAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Failed to list users:', error);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, name, email, updates, initialData } = body;

    if (action === 'create') {
      const merged = { ...initialData, ...(email ? { email } : {}) };
      const user = await createTestUser(name, userId, merged);
      return NextResponse.json({ success: true, user });
    }

    if (action === 'update') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }
      const user = await updateUserStats(userId, updates || {});
      return NextResponse.json({ success: true, user });
    }

    if (action === 'get') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }
      const user = await getUser(userId);
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('User operation failed:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
