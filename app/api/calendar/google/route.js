import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

// Google Calendar API Integration
// You'll need to add these to your .env.local file:
// GOOGLE_CLIENT_ID=your_google_client_id
// GOOGLE_CLIENT_SECRET=your_google_client_secret
// GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback

function calculateDuration(start, end) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime - startTime;
  const diffMins = Math.round(diffMs / 60000);
  return diffMins > 0 ? diffMins : 45;
}

function getDateString(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

function fallbackCalendarData() {
  const mockWorkouts = [
    { name: 'Morning Run', date: getDateString(1), time: '06:00', duration: 30, description: 'Easy 5K run', source: 'google' },
    { name: 'Gym Session - Upper Body', date: getDateString(2), time: '18:00', duration: 60, description: 'Chest and back workout', source: 'google' },
    { name: 'Yoga Class', date: getDateString(3), time: '17:30', duration: 45, description: 'Vinyasa flow', source: 'google' },
    { name: 'HIIT Training', date: getDateString(4), time: '07:00', duration: 30, description: 'High intensity intervals', source: 'google' },
  ];

  return NextResponse.json({
    success: true,
    workouts: mockWorkouts,
    count: mockWorkouts.length,
    fallback: true,
    message: 'Using sample data - configure Google Calendar API for real data'
  });
}

export async function POST(request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.log('️ Google Calendar credentials not configured, using fallback');
      return fallbackCalendarData();
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: thirtyDaysLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    const workouts = events
      .filter(event => {
        const summary = (event.summary || '').toLowerCase();
        return ['workout','gym','exercise','training','fitness','run','yoga','pilates','cardio','lift'].some(k => summary.includes(k));
      })
      .map(event => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        const duration = calculateDuration(start, end);

        return {
          name: event.summary || 'Workout',
          date: start.split('T')[0],
          time: start.includes('T') ? start.split('T')[1].substring(0, 5) : '12:00',
          duration: duration,
          description: event.description || '',
          source: 'google',
          location: event.location || '',
        };
      });

    return NextResponse.json({
      success: true,
      workouts,
      count: workouts.length,
    });

  } catch (error) {
    console.error('Google Calendar API Error:', error);
    console.log('️ Google Calendar API failed, using fallback data');
    return fallbackCalendarData();
  }
}

// OAuth URL generation
export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId) {
    return NextResponse.json({
      error: 'Google Calendar not configured',
      fallback: true
    }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  return NextResponse.json({ authUrl: url });
}
