import { NextResponse } from 'next/server';

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
  try {
    const url = new URL(request.url);
    const requestId = url.searchParams.get('request_id');
    const tribeId = url.searchParams.get('tribe_id');

    if (requestId) {
      // Get votes for specific request
      const requestVotes = votes[requestId];
      if (!requestVotes) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        );
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

    if (tribeId) {
      // Get all votes for tribe
      return NextResponse.json({ votes });
    }

    // Get all votes
    return NextResponse.json({ votes });
    
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    // Check if request exists
    if (!votes[request_id]) {
      // Create new vote record for this request
      votes[request_id] = {
        request_id,
        votes: [],
        total_members: 5, // Default tribe size
        status: 'pending'
      };
    }

    const requestVotes = votes[request_id];

    // Check if user already voted
    const existingVoteIndex = requestVotes.votes.findIndex(v => v.user_id === user_id);
    
    if (existingVoteIndex >= 0) {
      // Update existing vote
      requestVotes.votes[existingVoteIndex].vote = vote;
    } else {
      // Add new vote
      requestVotes.votes.push({
        user_id,
        vote,
        user_name: user_name || 'User',
        created_at: new Date().toISOString()
      });
    }

    // Check if voting is complete
    const approveCount = requestVotes.votes.filter(v => v.vote === 'approve').length;
    const rejectCount = requestVotes.votes.filter(v => v.vote === 'reject').length;
    const requiredVotes = Math.ceil(requestVotes.total_members / 2);

    let newStatus = 'pending';
    if (approveCount >= requiredVotes) {
      newStatus = 'approved';
    } else if (rejectCount >= requiredVotes) {
      newStatus = 'rejected';
    }

    requestVotes.status = newStatus;

    // In a real app, save to Supabase and update pact_spend_requests table:
    // if (newStatus === 'approved') {
    //   // Deduct from pact wallet balance
    //   // Update request status to 'approved'
    //   // Create transaction record
    // } else if (newStatus === 'rejected') {
    //   // Update request status to 'rejected'
    // }

    return NextResponse.json({ 
      success: true,
      vote_recorded: vote,
      status: newStatus,
      approve_count: approveCount,
      reject_count: rejectCount,
      required_votes: requiredVotes,
      message: newStatus === 'approved' ? 'Request approved by tribe!' :
               newStatus === 'rejected' ? 'Request rejected by tribe' :
               `Vote recorded. ${requiredVotes - Math.max(approveCount, rejectCount)} more votes needed.`
    });
    
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}