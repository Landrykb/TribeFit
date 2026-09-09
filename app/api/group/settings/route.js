import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { getGroup, getGroupSettings, setGroupSettings } from '../../_store/db';
import { broadcastToGroup } from '../../events/route';

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const group = getGroup(groupId);
    const settings = getGroupSettings(groupId);
    return NextResponse.json({ success: true, group: { id: group.id, name: group.name, type: group.type }, settings });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
  });
}

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const body = await request.json();
    const groupId = body.groupId || 'default';
    const partial = body.settings || {};
    const next = setGroupSettings(groupId, partial);
    try {
      broadcastToGroup({ groupId, originUserId: 'system', payload: { type: 'settings_changed', settings: next } });
    } catch {}
    return NextResponse.json({ success: true, settings: next });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to set settings' }, { status: 500 });
  }
  });
}
