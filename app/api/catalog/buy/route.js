import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { user_id, catalog_item_id, specs = {}, price_tc, tribe_id } = await request.json();

    // Validate required fields
    if (!user_id || !catalog_item_id || !price_tc) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, catalog_item_id, price_tc' },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;

    // Get user's current balance (mock for now)
    const mockUserBalance = 500; // In production, fetch from users table
    
    // Check if user has sufficient balance
    if (mockUserBalance < price_tc) {
      return NextResponse.json(
        { 
          error: 'Insufficient TribeCoins',
          needed: price_tc,
          current: mockUserBalance 
        },
        { status: 402 }
      );
    }

    // Check if user is in a tribe for discount
    let finalPrice = price_tc;
    let discount = 0;
    let tribeDiscount = 0;

    if (tribe_id) {
      // Get tribe info to check if it's a tribe (not squad)
      try {
        const { data: tribe, error: tribeError } = await client
          .from('tribes')
          .select('group_type')
          .eq('id', tribe_id)
          .single();

        if (tribe && tribe.group_type === 'tribe') {
          // Apply 5% tribe discount
          tribeDiscount = 0.05;
          discount = Math.round(price_tc * tribeDiscount);
          finalPrice = price_tc - discount;
        }
      } catch (tribeError) {
        // Continue without discount
      }
    }

    // Get catalog item details (mock for now)
    const mockCatalogItems = {
      '1': { name: 'Resistance Bands Set', category: 'equipment' },
      '2': { name: 'Yoga Mat Premium', category: 'equipment' },
      '3': { name: 'Protein Powder', category: 'nutrition' },
      '4': { name: 'Dumbbells Set', category: 'equipment' },
      '5': { name: 'Pre-Workout Boost', category: 'nutrition' },
      '6': { name: 'Foam Roller', category: 'equipment' }
    };

    const catalogItem = mockCatalogItems[catalog_item_id];
    if (!catalogItem) {
      return NextResponse.json(
        { error: 'Catalog item not found' },
        { status: 404 }
      );
    }

    // Process the purchase
    // 1. Deduct from user's private wallet
    const newBalance = mockUserBalance - finalPrice;

    // 2. Record the purchase in payments table
    const paymentData = {
      user_id,
      type: 'catalog_purchase',
      amount_tc: finalPrice,
      amount_cents: finalPrice * 100,
      status: 'succeeded',
      metadata: {
        catalog_item_id,
        catalog_item_name: catalogItem.name,
        original_price: price_tc,
        discount_amount: discount,
        tribe_discount_pct: tribeDiscount,
        specs,
        tribe_id
      }
    };

    try {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        // Mock payment insertion for development
        // Mock payment for development
      } else {
        await client.from('payments').insert(paymentData);
      }
    } catch (paymentError) {
      console.error('Payment recording error:', paymentError);
      return NextResponse.json(
        { error: 'Purchase processing failed' },
        { status: 500 }
      );
    }

    // 3. Record transaction in pact transactions if tribe_id exists
    if (tribe_id) {
      try {
        // Get or create pact wallet for tribe
        let { data: pactWallet, error: walletError } = await client
          .from('pact_wallets')
          .select('*')
          .eq('tribe_id', tribe_id)
          .single();

        if (!pactWallet && walletError?.code === 'PGRST116') {
          // Create wallet if it doesn't exist
          const { data: newWallet, error: createError } = await client
            .from('pact_wallets')
            .insert({
              tribe_id,
              balance_tc: 0,
              donation_pool_tc: 0,
              goal_label: 'Equipment Fund'
            })
            .select()
            .single();

          if (createError) {
            console.error('Wallet creation error:', createError);
          } else {
            pactWallet = newWallet;
          }
        }

        if (pactWallet) {
          // Record transaction
          const transactionData = {
            pact_wallet_id: pactWallet.id,
            user_id,
            type: 'catalog_purchase',
            amount_tc: finalPrice,
            description: `Direct purchase: ${catalogItem.name}`,
            metadata: {
              catalog_item_id,
              specs,
              discount_applied: discount > 0
            }
          };

          if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            // Mock transaction for development
          } else {
            await client.from('pact_transactions').insert(transactionData);
          }
        }
      } catch (txError) {
        console.error('Transaction recording error:', txError);
        // Non-fatal, continue
      }
    }

    // 4. Create purchase confirmation
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
    return NextResponse.json(
      { error: 'Purchase failed' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Return purchase history or purchase info
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    // Mock purchase history
    const mockPurchases = [
      {
        id: 'purchase-1',
        item_name: 'Resistance Bands Set',
        price_tc: 150,
        purchased_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      },
      {
        id: 'purchase-2', 
        item_name: 'Yoga Mat Premium',
        price_tc: 114, // With 5% tribe discount
        purchased_at: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed',
        discount_applied: 6
      }
    ];

    return NextResponse.json({
      success: true,
      purchases: mockPurchases,
      total_spent: mockPurchases.reduce((sum, p) => sum + p.price_tc, 0)
    });

  } catch (error) {
    console.error('Purchase history error:', error);
    return NextResponse.json(
      { error: 'Failed to get purchase history' },
      { status: 500 }
    );
  }
}