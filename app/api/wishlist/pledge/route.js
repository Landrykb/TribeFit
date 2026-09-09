import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { wishlist_item_id, pledge_amount, user_id } = await request.json();

    if (!wishlist_item_id || !pledge_amount || !user_id) {
      return NextResponse.json({ error: 'Missing required fields: wishlist_item_id, pledge_amount, user_id' }, { status: 400 });
    }

    if (pledge_amount <= 0) {
      return NextResponse.json({ error: 'Pledge amount must be greater than 0' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;

    const { data: wishlistItem, error: itemError } = await client
      .from('wishlist_items')
      .select('*, wishlists(tribe_id)')
      .eq('id', wishlist_item_id)
      .single();

    if (itemError || !wishlistItem) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    const { data: user, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if ((user.wallet_balance_tc || 0) < pledge_amount) {
      return NextResponse.json({
        error: 'Insufficient TribeCoins',
        needed: pledge_amount,
        current: user.wallet_balance_tc || 0
      }, { status: 402 });
    }

    const newPledgedAmount = (wishlistItem.pledged_tc || 0) + pledge_amount;
    const newBalance = (user.wallet_balance_tc || 0) - pledge_amount;

    await client.from('users').update({ wallet_balance_tc: newBalance }).eq('id', user_id);
    await client
      .from('wishlist_items')
      .update({
        pledged_tc: newPledgedAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wishlist_item_id);

    const tribe_id = wishlistItem.wishlists?.tribe_id;

    if (tribe_id) {
      const { data: pactWallet } = await client
        .from('pact_wallets')
        .select('*')
        .eq('tribe_id', tribe_id)
        .single();

      if (pactWallet) {
        await client.from('pact_tx').insert({
          wallet_id: pactWallet.id,
          user_id,
          type: 'wishlist_pledge',
          amount_tc: pledge_amount,
          meta: {
            wishlist_item_id,
            item_name: wishlistItem.label,
            new_pledged_total: newPledgedAmount,
            target_amount: wishlistItem.target_tc
          }
        });
      }
    }

    const isReady = newPledgedAmount >= wishlistItem.target_tc;

    if (isReady) {
      await client.from('wishlist_items').update({ status: 'ready' }).eq('id', wishlist_item_id);
    }

    const pledgeResult = {
      id: `pledge-${Date.now()}`,
      wishlist_item_id,
      user_id,
      amount: pledge_amount,
      new_total: newPledgedAmount,
      target: wishlistItem.target_tc,
      progress_pct: Math.round((newPledgedAmount / wishlistItem.target_tc) * 100),
      is_ready: isReady,
      pledged_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      pledge: pledgeResult,
      updated_item: {
        ...wishlistItem,
        pledged_tc: newPledgedAmount,
        status: isReady ? 'ready' : wishlistItem.status
      },
      new_balance: newBalance,
      message: isReady
        ? `Pledge successful! ${wishlistItem.label} is now ready for purchase!`
        : `Pledged ${pledge_amount} TC to ${wishlistItem.label}. ${Math.round((newPledgedAmount / wishlistItem.target_tc) * 100)}% funded!`
    });

  } catch (error) {
    console.error('Wishlist pledge error:', error);
    return NextResponse.json({ error: 'Failed to process pledge' }, { status: 500 });
  }
}
