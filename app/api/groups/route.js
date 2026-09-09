import { NextResponse } from 'next/server';
import { listGroups } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const groups = await listGroups();
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('List groups error:', error);
    return NextResponse.json({
      success: false,
      groups: []
    }, { status: 500 });
  }
}
