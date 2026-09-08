import { NextResponse } from 'next/server';

// Maintain a global set of SSE clients across route invocations (for dev only)
const getClients = () => {
  if (!globalThis.__SSE_CLIENTS__) {
    globalThis.__SSE_CLIENTS__ = new Set();
  }
  return globalThis.__SSE_CLIENTS__;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';
    const userId = searchParams.get('userId') || 'anon';

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const send = (data) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        const client = { controller, send, groupId, userId };
        getClients().add(client);

        // Initial hello
        send({ type: 'connected', groupId, userId, ts: Date.now() });

        // Heartbeat to keep connection alive
        client.heartbeat = setInterval(() => {
          try { send({ type: 'ping', ts: Date.now() }); } catch (_) {}
        }, 25000);

        // Cleanup on close
        controller.signal?.addEventListener?.('abort', () => {
          clearInterval(client.heartbeat);
          getClients().delete(client);
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('SSE error:', error);
    return NextResponse.json({ error: 'SSE failed' }, { status: 500 });
  }
}

// Utility used by broadcast route
export function broadcastToGroup({ groupId, originUserId, payload }) {
  const clients = getClients();
  clients.forEach((c) => {
    if (c.groupId !== (groupId || 'default')) return;
    try {
      c.send({ ...payload, forUserId: c.userId, originUserId });
    } catch (e) {
      try { getClients().delete(c); } catch (_) {}
    }
  });
}
