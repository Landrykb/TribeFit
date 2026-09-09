export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const client = supabaseAdmin || supabase;
    let query = client
      .from('catalog_items')
      .select('*')
      .eq('active', true)
      .order('category, title');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Catalog fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
    }

    const categories = [...new Set((items || []).map(i => i.category))];

    return NextResponse.json({
      success: true,
      items: items || [],
      categories,
      total: (items || []).length
    });

  } catch (error) {
    console.error('Catalog fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}
