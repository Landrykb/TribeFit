import { NextResponse } from 'next/server';
import { getGroup, getGroupSettings, setGroupSettings } from '@/lib/supabase-db';
import { broadcastToGroup } from '../../events/route';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const group = await getGroup(groupId);
    const settings = group ? await getGroupSettings(groupId) : { require_vote_for_mode_change: false, allow_snatched_for_top_ups: true, public_workouts: true };
    return NextResponse.json({ success: true, group: group ? { id: group.id, name: group.name, type: group.type } : { id: groupId, name: 'Default', type: 'squad' }, settings });
  } catch (e) {
    console.error('group/settings GET error', e);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const groupId = body.groupId || 'default';
    const partial = body.settings || {};
    const next = await setGroupSettings(groupId, partial);
    try {
      broadcastToGroup({ groupId, originUserId: 'system', payload: { type: 'settings_changed', settings: next } });
    } catch {}
    return NextResponse.json({ success: true, settings: next });
  } catch (e) {
    console.error('group/settings POST error', e);
    return NextResponse.json({ error: e.message || 'Failed to set settings' }, { status: 500 });
  }
}
