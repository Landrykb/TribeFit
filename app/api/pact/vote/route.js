import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { supabase, supabaseAdmin, isUsingMockData } from '@/lib/supabase';

// Mock vote data - in real app this would be in Supabase
let votes = {
  'req-1': {
    request_id: 'req-1',
    votes: [
      { user_id: '00000000-0000-0000-0000-000000000001', vote: 'approve', user_name: 'Alex Chen' },
      { user_id: '00000000-0000-0000-0000-000000000002', vote: 'approve', user_name: 'Jordan Kim' }
    ],
    total_members: 5,
    status: 'pending' // pending, approved, rejected
  },
  'req-2': {
    request_id: 'req-2',
    votes: [
      { user_id: '00000000-0000-0000-0000-000000000001', vote: 'approve', user_name: 'Alex Chen' },
      { user_id: '00000000-0000-0000-0000-000000000003', vote: 'reject', user_name: 'Sarah Wilson' }
    ],
    total_members: 5,
    status: 'pending'
  }
};

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const url = new URL(request.url);
    const requestId = url.searchParams.get('request_id');
    const tribeId = url.searchParams.get('tribe_id');

    if (requestId) {
      if (isUsingMockData) {
        const requestVotes = votes[requestId];
        if (!requestVotes) {
          return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }
        const approveCount = requestVotes.votes.filter(v => v.vote === 'approve').length;
        const rejectCount = requestVotes.votes.filter(v => v.vote === 'reject').length;
        const requiredVotes = Math.ceil(requestVotes.total_members / 2);
        return NextResponse.json({
          ...requestVotes,
          approve_count: approveCount,
          reject_count: rejectCount,
          required_votes: requiredVotes,
          can_approve: approveCount >= requiredVotes,
          can_reject: rejectCount >= requiredVotes
        });
      }

      const client = supabaseAdmin || supabase;
      const { data: reqData, error: reqErr } = await client
        .from('pact_spend_requests')
        .select('*, wallet_id')
        .eq('id', requestId)
        .single();
      if (reqErr || !reqData) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }
      if (reqData.type !== 'donation') {
        return NextResponse.json({ error: 'Only donation requests support voting' }, { status: 400 });
      }
      const { data: votesData } = await client
        .from('donation_votes')
        .select('*')
        .eq('request_id', requestId);

      const { data: wallet } = await client
        .from('pact_wallets')
        .select('id, tribe_id')
        .eq('id', reqData.wallet_id)
        .single();
      let totalMembers = 0;
      if (wallet?.tribe_id) {
        const { data: members } = await client
          .from('tribe_members')
          .select('user_id')
          .eq('tribe_id', wallet.tribe_id);
        totalMembers = members?.length || 0;
      }

      const approveCount = (votesData || []).filter(v => v.value === true).length;
      const rejectCount = (votesData || []).filter(v => v.value === false).length;
      const requiredVotes = Math.max(1, Math.ceil(totalMembers / 2));

      return NextResponse.json({
        request_id: requestId,
        votes: (votesData || []).map(v => ({ user_id: v.voter_id, vote: v.value ? 'approve' : 'reject' })),
        total_members: totalMembers,
        status: reqData.status || 'pending',
        approve_count: approveCount,
        reject_count: rejectCount,
        required_votes: requiredVotes,
        can_approve: approveCount >= requiredVotes,
        can_reject: rejectCount >= requiredVotes
      });
    }

    if (tribeId) {
      if (isUsingMockData) return NextResponse.json({ votes });
      const client = supabaseAdmin || supabase;
      const { data } = await client
        .from('donation_votes')
        .select('*')
        .eq('tribe_id', tribeId);
      return NextResponse.json({ votes: data || [] });
    }
    // Default: return votes shape
    return NextResponse.json({ votes: isUsingMockData ? votes : [] });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
  });
}

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const body = await request.json();
    const { request_id, user_id, vote, user_name } = body;

    // Validate required fields
    if (!request_id || !user_id || !vote) {
      return NextResponse.json(
        { error: 'Missing required fields: request_id, user_id, vote' },
        { status: 400 }
      );
    }

    // Validate vote value
    if (!['approve', 'reject'].includes(vote)) {
      return NextResponse.json(
        { error: 'Vote must be "approve" or "reject"' },
        { status: 400 }
      );
    }
    if (isUsingMockData) {
      if (!votes[request_id]) {
        votes[request_id] = { request_id, votes: [], total_members: 5, status: 'pending' };
      }
      const requestVotes = votes[request_id];
      const idx = requestVotes.votes.findIndex(v => v.user_id === user_id);
      if (idx >= 0) requestVotes.votes[idx].vote = vote; else requestVotes.votes.push({ user_id, vote, user_name: user_name || 'User', created_at: new Date().toISOString() });
      const approveCount = requestVotes.votes.filter(v => v.vote === 'approve').length;
      const rejectCount = requestVotes.votes.filter(v => v.vote === 'reject').length;
      const requiredVotes = Math.ceil(requestVotes.total_members / 2);
      let newStatus = 'pending';
      if (approveCount >= requiredVotes) newStatus = 'approved';
      else if (rejectCount >= requiredVotes) newStatus = 'rejected';
      requestVotes.status = newStatus;
      return NextResponse.json({ success: true, vote_recorded: vote, status: newStatus, approve_count: approveCount, reject_count: rejectCount, required_votes: requiredVotes });
    }

    // Real mode: persist vote and evaluate majority
    const client = supabaseAdmin || supabase;

    // Fetch request; must be donation type when feature on
    const { data: reqData, error: reqErr } = await client
      .from('pact_spend_requests')
      .select('*')
      .eq('id', request_id)
      .single();
    if (reqErr || !reqData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    if (process.env.FEATURE_DEAL_SPLIT === 'true' && reqData.type !== 'donation') {
      return NextResponse.json({ error: 'Only donation requests support voting' }, { status: 400 });
    }

    // Determine tribe via wallet
    const { data: wallet } = await client
      .from('pact_wallets')
      .select('id, tribe_id')
      .eq('id', reqData.wallet_id)
      .single();

    // Upsert vote
    const value = vote === 'approve';
    const voteRow = { tribe_id: wallet?.tribe_id || null, request_id: request_id, voter_id: user_id, value };
    await client.from('donation_votes').upsert(voteRow, { onConflict: 'request_id,voter_id' });

    // Recompute tallies
    const { data: allVotes } = await client
      .from('donation_votes')
      .select('*')
      .eq('request_id', request_id);

    const approveCount = (allVotes || []).filter(v => v.value === true).length;
    const rejectCount = (allVotes || []).filter(v => v.value === false).length;
    let totalMembers = 0;
    if (wallet?.tribe_id) {
      const { data: members } = await client
        .from('tribe_members')
        .select('user_id')
        .eq('tribe_id', wallet.tribe_id);
      totalMembers = members?.length || 0;
    }
    const requiredVotes = Math.max(1, Math.ceil(totalMembers / 2));

    // Determine new status
    let newStatus = 'requested';
    if (approveCount >= requiredVotes) newStatus = 'approved';
    else if (rejectCount >= requiredVotes) newStatus = 'rejected';

    // If approved: deduct from donation_pool_tc and record pact_tx
    if (newStatus === 'approved') {
      // Deduct from donation pool first, fallback to main balance if pool insufficient (optional)
      const { data: currentWallet } = await client
        .from('pact_wallets')
        .select('id, donation_pool_tc')
        .eq('id', reqData.wallet_id)
        .single();
      const amount = Number(reqData.amount_tc);
      const donationPool = Number(currentWallet?.donation_pool_tc || 0);
      if (donationPool < amount) {
        // Not enough in donation pool
        return NextResponse.json({ error: 'Insufficient donation pool funds' }, { status: 400 });
      }

      // Transactional updates (read-modify-write; supabase-js v2 has no .raw())
      await client.from('pact_wallets').update({ donation_pool_tc: donationPool - amount }).eq('id', reqData.wallet_id);

      // Update request status
      await client
        .from('pact_spend_requests')
        .update({ status: 'approved', approved_by: user_id, approved_at: new Date().toISOString() })
        .eq('id', request_id);

      // Record pact_tx donation spend
      await client
        .from('pact_tx')
        .insert({
          wallet_id: reqData.wallet_id,
          user_id: user_id,
          type: 'donate',
          amount_tc: amount,
          meta: { request_id, label: reqData.label, gym_name: reqData.gym_name }
        });
    } else if (newStatus === 'rejected') {
      await client
        .from('pact_spend_requests')
        .update({ status: 'rejected', approved_by: null, approved_at: null })
        .eq('id', request_id);
    } else {
      // Keep as requested/pending
    }

    return NextResponse.json({
      success: true,
      vote_recorded: vote,
      status: newStatus,
      votes: (allVotes || []).map(v => ({ user_id: v.voter_id, vote: v.value ? 'approve' : 'reject' })),
      approve_count: approveCount,
      reject_count: rejectCount,
      required_votes: requiredVotes
    });
    
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
  });
}