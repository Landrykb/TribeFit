import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { name, group_type = 'squad', description, created_by } = await request.json();

    // Validate required fields
    if (!name || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields: name, created_by' },
        { status: 400 }
      );
    }

    // Validate group_type
    if (!['squad', 'tribe'].includes(group_type)) {
      return NextResponse.json(
        { error: 'Invalid group_type. Must be "squad" or "tribe"' },
        { status: 400 }
      );
    }

    // Check size constraints
    const squadMin = parseInt(process.env.SQUAD_MIN || '3');
    const squadMax = parseInt(process.env.SQUAD_MAX || '4');
    const tribeMin = parseInt(process.env.TRIBE_MIN || '5');

    // Generate invite code
    const invite_code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6) + 
                       Math.random().toString(36).substring(2, 5).toUpperCase();

    const client = supabaseAdmin || supabase;

    // Create the group in tribes table
    const { data: newGroup, error: groupError } = await client
      .from('tribes')
      .insert({
        name,
        description: description || `A ${group_type} for fitness accountability`,
        group_type,
        owner_id: created_by,
        invite_code,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (groupError) {
      console.error('Group creation error:', groupError);
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      );
    }

    // Add creator as first member
    const { error: memberError } = await client
      .from('tribe_members')
      .insert({
        tribe_id: newGroup.id,
        user_id: created_by,
        role: 'owner',
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      console.error('Member addition error:', memberError);
      return NextResponse.json(
        { error: 'Failed to add creator as member' },
        { status: 500 }
      );
    }

    // Create pact wallet for the group
    const { error: walletError } = await client
      .from('pact_wallets')
      .insert({
        tribe_id: newGroup.id,
        balance_tc: 0,
        donation_pool_tc: 0,
        goal_label: `${group_type === 'squad' ? 'Squad' : 'Tribe'} Equipment Fund`,
        goal_amount_tc: 1000
      });

    if (walletError) {
      console.error('Wallet creation error:', walletError);
      return NextResponse.json(
        { error: 'Failed to create group wallet' },
        { status: 500 }
      );
    }

    // Create wishlist for the group
    const { error: wishlistError } = await client
      .from('wishlists')
      .insert({
        tribe_id: newGroup.id,
        created_by: created_by
      });

    if (wishlistError) {
      console.error('Wishlist creation error:', wishlistError);
      // Non-fatal error, continue
    }

    return NextResponse.json({
      success: true,
      group: {
        ...newGroup,
        member_count: 1,
        size_constraints: {
          min: group_type === 'squad' ? squadMin : tribeMin,
          max: group_type === 'squad' ? squadMax : null,
          can_upgrade: group_type === 'squad'
        }
      },
      message: `${group_type === 'squad' ? 'Squad' : 'Tribe'} created successfully!`
    });

  } catch (error) {
    console.error('Group creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Return group creation constraints and info
    const squadMin = parseInt(process.env.SQUAD_MIN || '3');
    const squadMax = parseInt(process.env.SQUAD_MAX || '4');
    const tribeMin = parseInt(process.env.TRIBE_MIN || '5');

    return NextResponse.json({
      constraints: {
        squad: {
          min_members: squadMin,
          max_members: squadMax,
          auto_upgrade_at: tribeMin,
          description: 'Casual fitness group, automatically upgrades to Tribe at 5+ members'
        },
        tribe: {
          min_members: tribeMin,
          max_members: null,
          perks: ['5% catalog discount', 'Vendor matching on donations', 'Advanced customization'],
          description: 'Bonded fitness community with exclusive perks'
        }
      },
      feature_flags: {
        deal_split: process.env.FEATURE_DEAL_SPLIT === 'true',
        wishlist: process.env.FEATURE_WISHLIST === 'true',
        reactions: process.env.FEATURE_REACTIONS === 'true'
      }
    });

  } catch (error) {
    console.error('Group info error:', error);
    return NextResponse.json(
      { error: 'Failed to get group information' },
      { status: 500 }
    );
  }
}