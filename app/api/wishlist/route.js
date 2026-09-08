import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tribe_id = searchParams.get('tribe_id');

    if (!tribe_id) {
      return NextResponse.json(
        { error: 'Missing tribe_id parameter' },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;

    // Get wishlist with items
    const { data: wishlist, error: wishlistError } = await client
      .from('wishlists')
      .select(`
        *,
        wishlist_items (
          *,
          catalog_items (
            id,
            name,
            price_tc,
            category,
            description,
            specs
          )
        )
      `)
      .eq('tribe_id', tribe_id)
      .single();

    if (wishlistError) {
      console.error('Wishlist fetch error:', wishlistError);
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist: wishlist || { tribe_id, items: [] }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to get wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { tribe_id, catalog_item_id, specs = {}, target_tc, user_id } = await request.json();

    // Validate required fields
    if (!tribe_id || !catalog_item_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: tribe_id, catalog_item_id, user_id' },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;

    // Get or create wishlist for the tribe
    let { data: wishlist, error: wishlistError } = await client
      .from('wishlists')
      .select('*')
      .eq('tribe_id', tribe_id)
      .single();

    if (wishlistError && wishlistError.code === 'PGRST116') {
      // Wishlist doesn't exist, create it
      const { data: newWishlist, error: createError } = await client
        .from('wishlists')
        .insert({
          tribe_id,
          created_by: user_id
        })
        .select()
        .single();

      if (createError) {
        console.error('Wishlist creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create wishlist' },
          { status: 500 }
        );
      }

      wishlist = newWishlist;
    } else if (wishlistError) {
      console.error('Wishlist fetch error:', wishlistError);
      return NextResponse.json(
        { error: 'Failed to access wishlist' },
        { status: 500 }
      );
    }

    // Get catalog item details
    const { data: catalogItem, error: catalogError } = await client
      .from('catalog_items')
      .select('*')
      .eq('id', catalog_item_id)
      .single();

    if (catalogError || !catalogItem) {
      return NextResponse.json(
        { error: 'Catalog item not found' },
        { status: 404 }
      );
    }

    // Check if item already exists in wishlist
    const { data: existingItem, error: existingError } = await client
      .from('wishlist_items')
      .select('*')
      .eq('wishlist_id', wishlist.id)
      .eq('catalog_item_id', catalog_item_id)
      .single();

    if (existingItem) {
      return NextResponse.json(
        { error: 'Item already exists in wishlist' },
        { status: 400 }
      );
    }

    // Add item to wishlist
    const { data: wishlistItem, error: itemError } = await client
      .from('wishlist_items')
      .insert({
        wishlist_id: wishlist.id,
        catalog_item_id,
        label: catalogItem.name,
        specs,
        target_tc: target_tc || catalogItem.price_tc,
        pledged_tc: 0,
        status: 'planned'
      })
      .select()
      .single();

    if (itemError) {
      console.error('Wishlist item creation error:', itemError);
      return NextResponse.json(
        { error: 'Failed to add item to wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist_item: wishlistItem,
      message: 'Item added to wishlist successfully!'
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}