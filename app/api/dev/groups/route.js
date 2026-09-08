import { NextResponse } from 'next/server';
import { addUserToGroup, getAllGroups, getGroup, getDB, saveDB } from '../../_store/db';

export async function GET(request) {
  try {
    const groups = getAllGroups();
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

    // Handle different actions
    if (action === 'update_stats') {
      // Update squad/tribe stats
      if (!groupId || !updates) {
        return NextResponse.json({ error: 'Missing groupId or updates' }, { status: 400 });
      }

      const db = getDB();
      const group = db.groups[groupId];
      
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }

      // Update the group stats
      Object.assign(group, updates);
      saveDB(db);

      return NextResponse.json({ 
        success: true, 
        group,
        message: 'Squad stats updated successfully'
      });
    } else if (action === 'initiate_deletion') {
      // Initiate group deletion with notice period
      const { ownerId, ownerName } = body;
      
      if (!groupId) {
        return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
      }

      const db = getDB();
      const group = db.groups[groupId];
      
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }

      // Set deletion pending status
      const now = new Date();
      const deletionDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
      
      group.deletion_pending = true;
      group.deletion_initiated_at = now.toISOString();
      group.deletion_scheduled_at = deletionDate.toISOString();
      group.deletion_initiated_by = ownerId;
      group.deletion_initiated_by_name = ownerName;
      
      saveDB(db);

      return NextResponse.json({ 
        success: true,
        deletion_scheduled_at: deletionDate.toISOString(),
        hours_remaining: 48,
        message: 'Deletion notice sent to all members'
      });
    } else if (action === 'delete_group') {
      // Delete a group (immediate or after notice period)
      if (!groupId) {
        return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
      }

      const db = getDB();
      const group = db.groups[groupId];
      
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }

      // Remove all users from the group first
      Object.values(db.users || {}).forEach(user => {
        if (user.group_id === groupId) {
          user.group_id = null;
          user.group_type = null;
        }
      });

      // Delete the group
      delete db.groups[groupId];
      saveDB(db);

      return NextResponse.json({ 
        success: true, 
        message: 'Group deleted successfully'
      });
    } else if (action === 'create_group') {
      // Create a new squad/tribe
      const { name, description, type, ownerId, ownerName, isPrivate } = body;
      
      if (!name || !type || !ownerId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const db = getDB();
      const newGroupId = `group-${Date.now()}`;
      
      const newGroup = {
        id: newGroupId,
        name,
        description: description || '',
        type: type,
        group_type: type,
        members: [ownerId],
        member_count: 1,
        owner_id: ownerId,
        owner_name: ownerName || ownerId,
        streak_days: 0,
        participation_rate: 100,
        pact_balance_tc: 0,
        pact_balance: 0,
        donors: [],
        isPrivate: isPrivate || false,
        created_at: new Date().toISOString(),
        skip_mode: 'teammate_boost'
      };
      
      db.groups[newGroupId] = newGroup;
      
      // Add user to the group
      const user = db.users[ownerId];
      if (user) {
        user.group_id = newGroupId;
        user.group_type = type;
      }
      
      saveDB(db);

      return NextResponse.json({ 
        success: true,
        group: newGroup,
        message: 'Group created successfully'
      });
    } else {
      // Default: Add/Remove user to/from group
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }

      // Allow null groupId for leaving a group
      const result = addUserToGroup(userId, groupId);
      return NextResponse.json({ 
        success: true, 
        user: result.user,
        group: result.group 
      });
    }
  } catch (error) {
    console.error('Failed to process group action:', error);
    return NextResponse.json({ error: error.message || 'Failed to process group action' }, { status: 500 });
  }
}
