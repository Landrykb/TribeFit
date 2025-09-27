import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { tribe_id, user_id, invited_by } = await request.json();

    console.log('Add member request:', { tribe_id, user_id, invited_by });

    // Validate required fields
    if (!tribe_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: tribe_id, user_id' },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;

    // Get current group info
    const { data: group, error: groupError } = await client
      .from('tribes')
      .select('*, tribe_members(*)')
      .eq('id', tribe_id)
      .single();

    if (groupError || !group) {
      console.error('Group fetch error:', groupError);
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = group.tribe_members.find(m => m.user_id === user_id);
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      );
    }

    const currentMemberCount = group.tribe_members.length;
    const squadMax = parseInt(process.env.SQUAD_MAX || '4');
    const tribeMin = parseInt(process.env.TRIBE_MIN || '5');

    // Check size constraints for squads
    if (group.group_type === 'squad' && currentMemberCount >= squadMax) {
      // Squad is at max capacity, check if we can upgrade
      if (currentMemberCount + 1 >= tribeMin) {
        // Will upgrade to tribe, allow the addition
      } else {
        return NextResponse.json(
          { error: `Squad is at maximum capacity (${squadMax} members)` },
          { status: 400 }
        );
      }
    }

    // Add the new member
    const { error: memberError } = await client
      .from('tribe_members')
      .insert({
        tribe_id: tribe_id,
        user_id: user_id,
        role: 'member',
        joined_at: new Date().toISOString(),
        invited_by: invited_by
      });

    if (memberError) {
      console.error('Member addition error:', memberError);
      return NextResponse.json(
        { error: 'Failed to add member to group' },
        { status: 500 }
      );
    }

    const newMemberCount = currentMemberCount + 1;
    let upgradeResult = null;

    // Check for auto-upgrade: Squad → Tribe by size
    if (process.env.FEATURE_TRIBE_UPGRADE_BY_SIZE === 'true' && 
        group.group_type === 'squad' && 
        newMemberCount >= tribeMin) {
      
      console.log(`Auto-upgrading squad ${group.name} to tribe (${newMemberCount} members)`);

      // Upgrade the group to tribe
      const { error: upgradeError } = await client
        .from('tribes')
        .update({
          group_type: 'tribe',
          upgraded_at: new Date().toISOString(),
          upgrade_reason: 'size_threshold'
        })
        .eq('id', tribe_id);

      if (upgradeError) {
        console.error('Upgrade error:', upgradeError);
      } else {
        upgradeResult = {
          upgraded: true,
          from: 'squad',
          to: 'tribe',
          reason: 'size_threshold',
          trigger_member_count: newMemberCount,
          threshold: tribeMin
        };

        // Send upgrade notifications to all members
        const memberIds = [...group.tribe_members.map(m => m.user_id), user_id];
        
        // Create upgrade notification
        const notifications = memberIds.map(memberId => ({
          user_id: memberId,
          type: 'group_upgrade',
          title: 'Squad Upgraded to Tribe! 🏆',
          body: `Your Squad "${group.name}" has evolved into a mighty Tribe! Unlock new features and exclusive perks.`,
          created_at: new Date().toISOString(),
          read: false,
          meta: {
            tribe_id: tribe_id,
            upgrade_reason: 'size_threshold',
            new_member_count: newMemberCount
          }
        }));

        // Insert notifications (if notifications table exists)
        try {
          await client.from('notifications').insert(notifications);
        } catch (notifError) {
          console.error('Notification error:', notifError);
          // Non-fatal, continue
        }
      }
    }

    // Get updated group info
    const { data: updatedGroup } = await client
      .from('tribes')
      .select('*')
      .eq('id', tribe_id)
      .single();

    console.log('Member added successfully:', { 
      tribe_id, 
      user_id, 
      new_member_count: newMemberCount,
      upgrade_result: upgradeResult 
    });

    return NextResponse.json({
      success: true,
      group: updatedGroup,
      member_count: newMemberCount,
      upgrade: upgradeResult,
      message: upgradeResult 
        ? `Member added and ${group.name} upgraded to Tribe! 🏆`
        : 'Member added successfully!'
    });

  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

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

    // Get group with members
    const { data: group, error: groupError } = await client
      .from('tribes')
      .select(`
        *,
        tribe_members (
          user_id,
          role,
          joined_at,
          users (
            id,
            name,
            email
          )
        )
      `)
      .eq('id', tribe_id)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const squadMax = parseInt(process.env.SQUAD_MAX || '4');
    const tribeMin = parseInt(process.env.TRIBE_MIN || '5');
    const memberCount = group.tribe_members.length;

    return NextResponse.json({
      group,
      member_count: memberCount,
      constraints: {
        type: group.group_type,
        max_members: group.group_type === 'squad' ? squadMax : null,
        upgrade_threshold: group.group_type === 'squad' ? tribeMin : null,
        can_add_members: group.group_type === 'tribe' || memberCount < squadMax,
        will_upgrade_on_next: group.group_type === 'squad' && memberCount + 1 >= tribeMin
      }
    });

  } catch (error) {
    console.error('Get group members error:', error);
    return NextResponse.json(
      { error: 'Failed to get group members' },
      { status: 500 }
    );
  }
}