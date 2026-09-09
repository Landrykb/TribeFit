import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Database is persisted in Supabase. No local JSON store to reset. Use Supabase Dashboard or per-user dev controls to manage data.'
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
