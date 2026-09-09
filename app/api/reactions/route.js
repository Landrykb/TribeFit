import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const REACTION_TYPES = ['fire','flex','clap','lol','go','heart','wow','thinking'];

export async function POST(request) {
  try {
    const { tribe_id, from_user, to_user, type, meta = {} } = await request.json();

    if (!tribe_id || !from_user || !to_user || !type) {
      return NextResponse.json({ error: 'Missing required fields: tribe_id, from_user, to_user, type' }, { status: 400 });
    }

    if (!REACTION_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;

    const { data: fromMember } = await client
      .from('tribe_members')
      .select('*')
      .eq('tribe_id', tribe_id)
      .eq('user_id', from_user)
      .single();

    const { data: toMember } = await client
      .from('tribe_members')
      .select('*')
      .eq('tribe_id', tribe_id)
      .eq('user_id', to_user)
      .single();

    if (!fromMember || !toMember) {
      return NextResponse.json({ error: 'Users must be in the same tribe to send reactions' }, { status: 403 });
    }

    const reactionData = {
      tribe_id,
      from_user,
      to_user,
      type,
      meta: {
        ...meta,
        created_at: new Date().toISOString()
      }
    };

    let reactionId = `reaction-${Date.now()}`;

    const { data: reaction, error: reactionError } = await client
      .from('reactions')
      .insert(reactionData)
      .select()
      .single();

    if (reactionError) {
      console.error('Reaction creation error:', reactionError);
      return NextResponse.json({ error: 'Failed to create reaction' }, { status: 500 });
    }

    reactionId = reaction.id;

    const notification = {
      user_id: to_user,
      type: 'social',
      title: 'Reaction Received!',
      body: `Someone sent you a ${type} reaction`,
      created_at: new Date().toISOString(),
      read: false,
      meta: {
        reaction_id: reactionId,
        from_user,
        reaction_type: type
      }
    };

    try {
      await client.from('notifications').insert(notification);
    } catch (notifError) {
      console.error('Notification creation error:', notifError);
    }

    return NextResponse.json({
      success: true,
      reaction: reactionData,
      message: 'Reaction sent successfully!'
    });

  } catch (error) {
    console.error('Send reaction error:', error);
    return NextResponse.json({ error: 'Failed to send reaction' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tribe_id = searchParams.get('tribe_id');
    const to_user = searchParams.get('to_user');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!tribe_id) {
      return NextResponse.json({ error: 'Missing tribe_id parameter' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;

    let query = client
      .from('reactions')
      .select(`*, from_user_info:users!reactions_from_user_fkey(name), to_user_info:users!reactions_to_user_fkey(name)`)
      .eq('tribe_id', tribe_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (to_user) {
      query = query.eq('to_user', to_user);
    }

    const { data: reactions, error: reactionsError } = await query;

    if (reactionsError) {
      console.error('Reactions fetch error:', reactionsError);
      throw reactionsError;
    }

    const processedReactions = (reactions || []).map(reaction => ({
      ...reaction,
      from_user_name: reaction.from_user_info?.name || reaction.from_user_name || 'Unknown',
      to_user_name: reaction.to_user_info?.name || reaction.to_user_name || 'Unknown'
    }));

    return NextResponse.json({
      success: true,
      reactions: processedReactions,
      total: processedReactions.length
    });

  } catch (error) {
    console.error('Get reactions error:', error);
    return NextResponse.json({ error: 'Failed to get reactions' }, { status: 500 });
  }
}
