import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const body = await request.json();
    const { tribe_id, amount_tc, label, gym_name, created_by } = body;

    if (!tribe_id || !amount_tc || !label) {
      return NextResponse.json({ error: 'Missing required fields: tribe_id, amount_tc, label' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;

    // Get or create wallet for tribe
    const { data: wallet, error: walletErr } = await client
      .from('pact_wallets')
      .select('*')
      .eq('tribe_id', tribe_id)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: 'Tribe wallet not found' }, { status: 404 });
    }

    const requestRow = {
      wallet_id: wallet.id,
      type: 'donation',
      label,
      amount_tc: parseFloat(amount_tc),
      gym_name: gym_name || null,
      created_by: created_by || null,
      status: 'requested'
    };

    const { data: requestData, error: reqErr } = await client
      .from('pact_spend_requests')
      .insert(requestRow)
      .select()
      .single();

    if (reqErr) {
      return NextResponse.json({ error: 'Failed to create donation request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: requestData });
  } catch (error) {
    console.error('Donation request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  });
}
