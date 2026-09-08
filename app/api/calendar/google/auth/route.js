import { NextResponse } from 'next/server';

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const scopes = ['https://www.googleapis.com/auth/calendar.readonly'].join(' ');

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      error: 'Google Calendar not configured',
      required_env: ['GOOGLE_CLIENT_ID', 'GOOGLE_REDIRECT_URI', 'GOOGLE_CLIENT_SECRET'],
      next_steps: 'Set env vars and reload. This route will redirect to Google OAuth consent.'
    }, { status: 501 });
  }

  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || 'dev';

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('include_granted_scopes', 'true');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
