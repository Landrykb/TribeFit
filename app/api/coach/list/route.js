export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { listCoaches } from '@/lib/supabase-db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tribeId = searchParams.get('tribeId');

    const filters = tribeId ? { tribeId } : {};
    const coaches = await listCoaches(filters);

    return NextResponse.json({
      success: true,
      coaches,
      count: coaches.length
    });
  } catch (error) {
    console.error('List coaches error:', error);
    return NextResponse.json({ error: 'Failed to list coaches' }, { status: 500 });
  }
}
