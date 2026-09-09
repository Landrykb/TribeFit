import { NextResponse } from 'next/server';
import {
  getAllGroups,
  getGroup,
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  updateGroupStats,
  deleteGroup,
} from '@/lib/supabase-db';

export async function GET(request) {
  try {
    const groups = await getAllGroups();
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('Failed to list groups:', error);
    return NextResponse.json({ error: 'Failed to list groups' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, groupId, updates } = body;

    if (action === 'update_stats') {
      if (!groupId || !updates) {
        return NextResponse.json({ error: 'Missing groupId or updates' }, { status: 400 });
      }
      const group = await updateGroupStats(groupId, updates);
      return NextResponse.json({
        success: true,
        group,
        message: 'Squad stats updated successfully'
      });
    }

    if (action === 'initiate_deletion') {
      if (!groupId) {
        return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
      }
      const group = await getGroup(groupId);
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }

      const now = new Date();
      const deletionDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const updated = await updateGroupStats(groupId, {
        settings: {
          ...group.settings,
          deletion_pending: true,
          deletion_initiated_at: now.toISOString(),
          deletion_scheduled_at: deletionDate.toISOString(),
          deletion_initiated_by: body.ownerId,
          deletion_initiated_by_name: body.ownerName,
        }
      });

      return NextResponse.json({
        success: true,
        deletion_scheduled_at: deletionDate.toISOString(),
        hours_remaining: 48,
        group: updated,
        message: 'Deletion notice sent to all members'
      });
    }

    if (action === 'delete_group') {
      if (!groupId) {
        return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
      }
      const result = await deleteGroup(groupId);
      return NextResponse.json(result);
    }

    if (action === 'create_group') {
      const { name, description, type, ownerId, isPrivate } = body;

      if (!name || !type || !ownerId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const group = await createGroup({
        name,
        description,
        group_type: type,
        owner_id: ownerId,
      });

      await addUserToGroup(ownerId, group.id);

      if (isPrivate) {
        await updateGroupStats(group.id, {
          settings: { ...group.settings, isPrivate: true }
        });
      }

      return NextResponse.json({
        success: true,
        group: await getGroup(group.id),
        message: 'Group created successfully'
      });
    }

    if (action === 'leave') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }
      const user = await removeUserFromGroup(userId);
      return NextResponse.json({ success: true, user });
    }

    // Default: add user to a group
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (!groupId) {
      const result = await removeUserFromGroup(userId);
      return NextResponse.json({ success: true, user: result });
    }

    const { user, group } = await addUserToGroup(userId, groupId);
    return NextResponse.json({ success: true, user, group });
  } catch (error) {
    console.error('Failed to process group action:', error);
    return NextResponse.json({ error: error.message || 'Failed to process group action' }, { status: 500 });
  }
}
