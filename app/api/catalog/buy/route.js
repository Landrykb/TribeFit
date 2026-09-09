import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user_id, catalog_item_id, specs = {}, price_tc, tribe_id } = await request.json();

    if (!user_id || !catalog_item_id || !price_tc) {
      return NextResponse.json({ error: 'Missing required fields: user_id, catalog_item_id, price_tc' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;

    const { data: catalogItem, error: catalogError } = await client
      .from('catalog_items')
      .select('*')
      .eq('id', catalog_item_id)
      .single();

    if (catalogError || !catalogItem) {
      return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 });
    }

    const { data: user, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let finalPrice = price_tc;
    let discount = 0;
    let tribeDiscount = 0;

    if (tribe_id) {
      const { data: tribe } = await client
        .from('tribes')
        .select('group_type')
        .eq('id', tribe_id)
        .single();

      if (tribe && tribe.group_type === 'tribe') {
        tribeDiscount = 0.05;
        discount = Math.round(price_tc * tribeDiscount);
        finalPrice = price_tc - discount;
      }
    }

    if ((user.wallet_balance_tc || 0) < finalPrice) {
      return NextResponse.json({
        error: 'Insufficient TribeCoins',
        needed: finalPrice,
        current: user.wallet_balance_tc || 0
      }, { status: 402 });
    }

    const newBalance = (user.wallet_balance_tc || 0) - finalPrice;
    await client.from('users').update({ wallet_balance_tc: newBalance }).eq('id', user_id);

    const paymentData = {
      user_id,
      type: 'catalog_purchase',
      amount_tc: finalPrice,
      amount_cents: finalPrice * 100,
      status: 'succeeded',
      metadata: {
        catalog_item_id,
        catalog_item_name: catalogItem.title || catalogItem.name,
        original_price: price_tc,
        discount_amount: discount,
        tribe_discount_pct: tribeDiscount,
        specs,
        tribe_id
      }
    };

    await client.from('payments').insert(paymentData);

    if (tribe_id) {
      const { data: pactWallet, error: walletError } = await client
        .from('pact_wallets')
        .select('*')
        .eq('tribe_id', tribe_id)
        .single();

      if (pactWallet) {
        await client.from('pact_tx').insert({
          wallet_id: pactWallet.id,
          user_id,
          type: 'catalog_purchase',
          amount_tc: finalPrice,
          meta: {
            catalog_item_id,
            catalog_item_name: catalogItem.title || catalogItem.name,
            specs,
            discount_applied: discount > 0
          }
        });
      }
    }

    const purchase = {
      id: `purchase-${Date.now()}`,
      user_id,
      item: {
        ...catalogItem,
        id: catalog_item_id,
        specs
      },
      original_price_tc: price_tc,
      final_price_tc: finalPrice,
      discount_tc: discount,
      tribe_discount_applied: discount > 0,
      purchased_at: new Date().toISOString(),
      status: 'completed'
    };

    return NextResponse.json({
      success: true,
      purchase,
      new_balance: newBalance,
      savings: discount > 0 ? {
        amount: discount,
        percentage: Math.round(tribeDiscount * 100),
        reason: 'Tribe Member Discount'
      } : null,
      message: discount > 0
        ? `Purchase successful! Saved ${discount} TC with Tribe discount!`
        : 'Purchase successful!'
    });

  } catch (error) {
    console.error('Catalog purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id parameter' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;
    const { data: payments, error } = await client
      .from('payments')
      .select('*')
      .eq('user_id', user_id)
      .eq('type', 'catalog_purchase')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Purchase history error:', error);
      return NextResponse.json({ error: 'Failed to get purchase history' }, { status: 500 });
    }

    const purchases = (payments || []).map(p => ({
      id: p.id,
      item_name: p.metadata?.catalog_item_name || 'Catalog item',
      price_tc: p.amount_tc,
      purchased_at: p.created_at,
      status: p.status,
      discount_applied: p.metadata?.discount_amount || 0
    }));

    const totalSpent = purchases.reduce((sum, p) => sum + p.price_tc, 0);

    return NextResponse.json({
      success: true,
      purchases,
      total_spent: totalSpent
    });

  } catch (error) {
    console.error('Purchase history error:', error);
    return NextResponse.json({ error: 'Failed to get purchase history' }, { status: 500 });
  }
}
