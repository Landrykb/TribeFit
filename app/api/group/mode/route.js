import { NextResponse } from 'next/server';
import { getGroup, getGroupSkipMode, setGroupSkipMode } from '@/lib/supabase-db';
import { broadcastToGroup } from '../../events/route';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const group = await getGroup(groupId);
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    const skipMode = await getGroupSkipMode(groupId);
    return NextResponse.json({
      success: true,
      group: { id: group.id, name: group.name, type: group.type },
      skipMode
    });
  } catch (e) {
    console.error('group/mode GET error', e);
    return NextResponse.json({ error: 'Failed to get mode' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { groupId = 'default', mode } = await request.json();
    if (!mode || !['teammate_boost', 'tribe_fund'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const g = await getGroup(groupId);
    if (g?.settings?.require_vote_for_mode_change) {
      return NextResponse.json({ error: 'Mode change requires a governance vote' }, { status: 403 });
    }

    const group = await setGroupSkipMode(groupId, mode);
    try {
      broadcastToGroup({
        groupId,
        originUserId: 'system',
        payload: { type: 'mode_changed', skipMode: group.skip_mode }
      });
    } catch {}
    return NextResponse.json({
      success: true,
      skipMode: group.skip_mode,
      group: { id: group.id, name: group.name, type: group.type }
    });
  } catch (e) {
    console.error('group/mode POST error', e);
    return NextResponse.json({ error: e.message || 'Failed to set mode' }, { status: 500 });
  }
}
