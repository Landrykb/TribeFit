import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { wishlist_item_id, pledge_amount, user_id } = await request.json();

    console.log('Wishlist pledge request:', { wishlist_item_id, pledge_amount, user_id });

    // Validate required fields
    if (!wishlist_item_id || !pledge_amount || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: wishlist_item_id, pledge_amount, user_id' },
        { status: 400 }
      );
    }

    if (pledge_amount <= 0) {
      return NextResponse.json(
        { error: 'Pledge amount must be greater than 0' },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;

    // Get wishlist item
    const { data: wishlistItem, error: itemError } = await client
      .from('wishlist_items')
      .select(`
        *,
        wishlists (
          tribe_id
        )
      `)
      .eq('id', wishlist_item_id)
      .single();

    if (itemError || !wishlistItem) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance (mock for now)
    const mockUserBalance = 500;
    
    if (mockUserBalance < pledge_amount) {
      return NextResponse.json(
        { 
          error: 'Insufficient TribeCoins',
          needed: pledge_amount,
          current: mockUserBalance 
        },
        { status: 402 }
      );
    }

    // Update pledged amount on wishlist item
    const newPledgedAmount = (wishlistItem.pledged_tc || 0) + pledge_amount;
    
    const { error: updateError } = await client
      .from('wishlist_items')
      .update({
        pledged_tc: newPledgedAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wishlist_item_id);

    if (updateError) {
      console.error('Wishlist item update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update pledge' },
        { status: 500 }
      );
    }

    // Record the pledge transaction
    const tribe_id = wishlistItem.wishlists.tribe_id;
    
    try {
      // Get or create pact wallet for tribe
      let { data: pactWallet, error: walletError } = await client
        .from('pact_wallets')
        .select('*')
        .eq('tribe_id', tribe_id)
        .single();

      if (pactWallet) {
        // Record pledge transaction
        const transactionData = {
          pact_wallet_id: pactWallet.id,
          user_id,
          type: 'wishlist_pledge',
          amount_tc: pledge_amount,
          description: `Pledged ${pledge_amount} TC to ${wishlistItem.label}`,
          metadata: {
            wishlist_item_id,
            item_name: wishlistItem.label,
            new_pledged_total: newPledgedAmount,
            target_amount: wishlistItem.target_tc
          }
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('Mock pledge transaction:', transactionData);
        } else {
          await client.from('pact_transactions').insert(transactionData);
        }
      }
    } catch (txError) {
      console.error('Transaction recording error:', txError);
      // Non-fatal, continue
    }

    // Check if item is now ready for purchase
    const isReady = newPledgedAmount >= wishlistItem.target_tc;
    
    if (isReady) {
      // Update item status to ready
      await client
        .from('wishlist_items')
        .update({ status: 'ready' })
        .eq('id', wishlist_item_id);
    }

    // Create notification for tribe members about the pledge
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

    console.log('Wishlist pledge successful:', pledgeResult);

    return NextResponse.json({
      success: true,
      pledge: pledgeResult,
      updated_item: {
        ...wishlistItem,
        pledged_tc: newPledgedAmount,
        status: isReady ? 'ready' : wishlistItem.status
      },
      new_balance: mockUserBalance - pledge_amount,
      message: isReady 
        ? `Pledge successful! ${wishlistItem.label} is now ready for purchase! 🎉`
        : `Pledged ${pledge_amount} TC to ${wishlistItem.label}. ${Math.round((newPledgedAmount / wishlistItem.target_tc) * 100)}% funded!`
    });

  } catch (error) {
    console.error('Wishlist pledge error:', error);
    return NextResponse.json(
      { error: 'Failed to process pledge' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const tribe_id = searchParams.get('tribe_id');

    if (!user_id && !tribe_id) {
      return NextResponse.json(
        { error: 'Missing user_id or tribe_id parameter' },
        { status: 400 }
      );
    }

    // Mock pledge history
    const mockPledges = [
      {
        id: 'pledge-1',
        item_name: 'Resistance Bands Set',
        amount: 50,
        pledged_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'active'
      },
      {
        id: 'pledge-2',
        item_name: 'Yoga Mat Premium', 
        amount: 30,
        pledged_at: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed'
      }
    ];

    return NextResponse.json({
      success: true,
      pledges: mockPledges,
      total_pledged: mockPledges.reduce((sum, p) => sum + p.amount, 0)
    });

  } catch (error) {
    console.error('Pledge history error:', error);
    return NextResponse.json(
      { error: 'Failed to get pledge history' },
      { status: 500 }
    );
  }
}