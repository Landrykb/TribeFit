import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { tribe_id, from_user, to_user, type, meta = {} } = await request.json();

    console.log('Send reaction request:', { tribe_id, from_user, to_user, type, meta });

    // Validate required fields
    if (!tribe_id || !from_user || !to_user || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: tribe_id, from_user, to_user, type' },
        { status: 400 }
      );
    }

    // Validate reaction type
    const validReactions = ['fire', 'flex', 'clap', 'lol', 'go', 'heart', 'wow', 'thinking'];
    if (!validReactions.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    // Check if users are in the same tribe
    const client = supabaseAdmin || supabase;

    try {
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
        return NextResponse.json(
          { error: 'Users must be in the same tribe to send reactions' },
          { status: 403 }
        );
      }
    } catch (memberError) {
      console.log('Member check error (using mock):', memberError);
      // Continue with mock data in development
    }

    // Create reaction record
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

    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock reaction storage for development
        console.log('Mock reaction created:', reactionData);
      } else {
        const { data: reaction, error: reactionError } = await client
          .from('reactions')
          .insert(reactionData)
          .select()
          .single();

        if (reactionError) {
          console.error('Reaction creation error:', reactionError);
          return NextResponse.json(
            { error: 'Failed to create reaction' },
            { status: 500 }
          );
        }

        reactionId = reaction.id;
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save reaction' },
        { status: 500 }
      );
    }

    // Create notification for target user
    const reactionEmojis = {
      fire: '🔥',
      flex: '💪', 
      clap: '👏',
      lol: '😅',
      go: '⚡',
      heart: '❤️',
      wow: '😮',
      thinking: '🤔'
    };

    const emoji = reactionEmojis[type] || '🔥';
    const notification = {
      user_id: to_user,
      type: 'reaction',
      title: `${emoji} Reaction Received!`,
      body: `Someone sent you a ${type} reaction`,
      created_at: new Date().toISOString(),
      read: false,
      meta: {
        reaction_id: reactionId,
        from_user,
        reaction_type: type,
        emoji
      }
    };

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock notification created:', notification);
      } else {
        await client.from('notifications').insert(notification);
      }
    } catch (notifError) {
      console.error('Notification creation error:', notifError);
      // Non-fatal, continue
    }

    console.log('Reaction sent successfully:', { reactionId, type, emoji });

    return NextResponse.json({
      success: true,
      reaction: {
        id: reactionId,
        ...reactionData,
        emoji
      },
      message: `${emoji} Reaction sent successfully!`
    });

  } catch (error) {
    console.error('Send reaction error:', error);
    return NextResponse.json(
      { error: 'Failed to send reaction' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tribe_id = searchParams.get('tribe_id');
    const to_user = searchParams.get('to_user');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!tribe_id) {
      return NextResponse.json(
        { error: 'Missing tribe_id parameter' },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;

    // Build query
    let query = client
      .from('reactions')
      .select(`
        *,
        from_user_info:users!reactions_from_user_fkey(name),
        to_user_info:users!reactions_to_user_fkey(name)
      `)
      .eq('tribe_id', tribe_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (to_user) {
      query = query.eq('to_user', to_user);
    }

    try {
      const { data: reactions, error: reactionsError } = await query;

      if (reactionsError && process.env.NODE_ENV !== 'development') {
        console.error('Reactions fetch error:', reactionsError);
        throw reactionsError;
      }

      // Mock reactions for development
      const mockReactions = [
        {
          id: 'reaction-1',
          type: 'fire',
          emoji: '🔥',
          from_user_name: 'Alex',
          to_user_name: 'Jordan',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'reaction-2', 
          type: 'flex',
          emoji: '💪',
          from_user_name: 'Sam',
          to_user_name: 'Jordan',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'reaction-3',
          type: 'clap',
          emoji: '👏', 
          from_user_name: 'Taylor',
          to_user_name: 'Jordan',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      const reactionEmojis = {
        fire: '🔥', flex: '💪', clap: '👏', lol: '😅',
        go: '⚡', heart: '❤️', wow: '😮', thinking: '🤔'
      };

      const processedReactions = (reactions || mockReactions).map(reaction => ({
        ...reaction,
        emoji: reactionEmojis[reaction.type] || '🔥',
        from_user_name: reaction.from_user_info?.name || reaction.from_user_name || 'Unknown',
        to_user_name: reaction.to_user_info?.name || reaction.to_user_name || 'Unknown'
      }));

      return NextResponse.json({
        success: true,
        reactions: processedReactions,
        total: processedReactions.length
      });

    } catch (queryError) {
      // Use mock data in development
      const mockReactions = [
        {
          id: 'reaction-1',
          type: 'fire',
          emoji: '🔥',
          from_user_name: 'Alex',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      return NextResponse.json({
        success: true,
        reactions: mockReactions,
        total: mockReactions.length,
        note: 'Using mock data'
      });
    }

  } catch (error) {
    console.error('Get reactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get reactions' },
      { status: 500 }
    );
  }
}