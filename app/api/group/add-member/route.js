import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { tribe_id, user_id, invited_by } = await request.json();

    if (!tribe_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields: tribe_id, user_id' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;

    const { data: group, error: groupError } = await client
      .from('tribes')
      .select('*, tribe_members(*)')
      .eq('id', tribe_id)
      .single();

    if (groupError || !group) {
      console.error('Group fetch error:', groupError);
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const existingMember = group.tribe_members.find(m => m.user_id === user_id);
    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this group' }, { status: 400 });
    }

    const currentMemberCount = group.tribe_members.length;
    const squadMax = parseInt(process.env.SQUAD_MAX || '4');
    const tribeMin = parseInt(process.env.TRIBE_MIN || '5');

    if (group.group_type === 'squad' && currentMemberCount >= squadMax) {
      if (currentMemberCount + 1 < tribeMin) {
        return NextResponse.json({ error: `Squad is at maximum capacity (${squadMax} members)` }, { status: 400 });
      }
    }

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
      return NextResponse.json({ error: 'Failed to add member to group' }, { status: 500 });
    }

    const newMemberCount = currentMemberCount + 1;
    let upgradeResult = null;

    if (process.env.FEATURE_TRIBE_UPGRADE_BY_SIZE === 'true' &&
        group.group_type === 'squad' &&
        newMemberCount >= tribeMin) {

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

        const memberIds = [...group.tribe_members.map(m => m.user_id), user_id];

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

        try {
          await client.from('notifications').insert(notifications);
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      }
    }

    const { data: updatedGroup } = await client
      .from('tribes')
      .select('*')
      .eq('id', tribe_id)
      .single();

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
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tribe_id = searchParams.get('tribe_id');
    const user_id = searchParams.get('user_id');

    if (!tribe_id || !user_id) {
      return NextResponse.json({ error: 'Missing tribe_id or user_id' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;

    const { data: existingMember } = await client
      .from('tribe_members')
      .select('*')
      .eq('tribe_id', tribe_id)
      .eq('user_id', user_id)
      .single();

    return NextResponse.json({
      isMember: !!existingMember,
      tribe_id,
      user_id
    });

  } catch (error) {
    console.error('Check membership error:', error);
    return NextResponse.json({ error: 'Failed to check membership' }, { status: 500 });
  }
}
