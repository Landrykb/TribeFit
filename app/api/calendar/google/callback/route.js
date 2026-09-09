import { NextResponse } from 'next/server';
import { runWithStore } from '@/app/api/_store/db';
import { setGoogleToken } from '../../../_store/db';

export async function GET(request) {
  return runWithStore(async () => {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || 'dev_user';

    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI;

    if (!client_id || !client_secret || !redirect_uri) {
      return NextResponse.json({ error: 'Missing Google OAuth env (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)' }, { status: 501 });
    }
    if (!code) return NextResponse.json({ error: 'Missing OAuth code' }, { status: 400 });

    const body = new URLSearchParams();
    body.set('code', code);
    body.set('client_id', client_id);
    body.set('client_secret', client_secret);
    body.set('redirect_uri', redirect_uri);
    body.set('grant_type', 'authorization_code');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Token exchange failed', details: token }, { status: 500 });
    }

    // Compute expiry in ms epoch
    const expires_in = Number(token.expires_in || 0);
    const expiry_date = Date.now() + expires_in * 1000;
    const stored = {
      access_token: token.access_token,
      refresh_token: token.refresh_token, // may be undefined if not first consent
      scope: token.scope,
      token_type: token.token_type,
      expiry_date,
    };
    setGoogleToken(state, stored);

    // Redirect back to app
    const redirectBack = new URL('/', request.url);
    redirectBack.searchParams.set('google', 'connected');
    return NextResponse.redirect(redirectBack.toString());
  } catch (e) {
    return NextResponse.json({ error: 'Callback error' }, { status: 500 });
  }
  });
}
