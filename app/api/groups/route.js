import { NextResponse } from 'next/server';
import { listGroups } from '../_store/db';
import { runWithStore } from '@/app/api/_store/db';

export async function GET() {
  return runWithStore(async () => {
  try {
    const groups = listGroups().map(g => ({ 
      id: g.id, 
      name: g.name, 
      description: g.description,
      type: g.type,
      group_type: g.group_type || g.type, // Include group_type for SquadCard
      members: g.members || [], // Return actual members array
      member_count: g.member_count || g.members?.length || 0,
      streak_days: g.streak_days || 0,
      participation_rate: g.participation_rate || 0,
      pact_balance_tc: g.pact_balance_tc || g.pact_balance || 0, // CRITICAL: Include vault balance
      pact_balance: g.pact_balance_tc || g.pact_balance || 0, // Legacy support
      owner_id: g.owner_id || null, // Include owner for permission checks
      owner_name: g.owner_name || null,
      isPrivate: g.isPrivate || false, // Include privacy setting
      is_member: false // Will be updated on client
    }));
    return NextResponse.json({ success: true, groups });
  } catch (e) {
    return NextResponse.json({ success: false, groups: [] }, { status: 500 });
  }
  });
}
