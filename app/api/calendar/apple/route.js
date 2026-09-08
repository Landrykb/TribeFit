import { NextResponse } from 'next/server';

// Apple Calendar (.ics/.ical) Parser
// This handles iCalendar format used by Apple Calendar and other calendar apps

export async function POST(request) {
  try {
    const { icsData } = await request.json();

    if (!icsData) {
      return NextResponse.json({ error: 'Calendar data required' }, { status: 400 });
    }

    const workouts = parseICalendar(icsData);

    return NextResponse.json({
      success: true,
      workouts,
      count: workouts.length,
    });

  } catch (error) {
    console.error('Apple Calendar Parse Error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse calendar file',
      details: error.message 
    }, { status: 500 });
  }
}

function parseICalendar(icsData) {
  const workouts = [];
  const events = icsData.split('BEGIN:VEVENT');
  
  events.slice(1).forEach(eventBlock => {
    try {
      const lines = eventBlock.split(/\r?\n/);
      const event = {
        name: '',
        date: '',
        time: '12:00',
        duration: 45,
        description: '',
        location: '',
        source: 'apple',
      };

      let currentField = null;
      let fieldValue = '';

      lines.forEach(line => {
        line = line.trim();
        
        // Handle multi-line values
        if (line.startsWith(' ') && currentField) {
          fieldValue += line.substring(1);
          return;
        }

        // Process completed field
        if (currentField && fieldValue) {
          processField(event, currentField, fieldValue);
        }

        // Parse new field
        if (line.includes(':')) {
          const colonIndex = line.indexOf(':');
          currentField = line.substring(0, colonIndex);
          fieldValue = line.substring(colonIndex + 1);
        }
      });

      // Process last field
      if (currentField && fieldValue) {
        processField(event, currentField, fieldValue);
      }

      // Filter workout-related events
      if (isWorkoutEvent(event)) {
        workouts.push(event);
      }
    } catch (err) {
      console.error('Error parsing event:', err);
    }
  });

  return workouts;
}

function processField(event, field, value) {
  if (field.startsWith('SUMMARY')) {
    event.name = cleanValue(value);
  } else if (field.startsWith('DTSTART')) {
    const { date, time } = parseDateTimeField(field, value);
    event.date = date;
    event.time = time;
  } else if (field.startsWith('DTEND')) {
    const startDateTime = new Date(`${event.date}T${event.time}`);
    const { date: endDate, time: endTime } = parseDateTimeField(field, value);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const diffMs = endDateTime - startDateTime;
    event.duration = Math.max(15, Math.round(diffMs / 60000));
  } else if (field.startsWith('DESCRIPTION')) {
    event.description = cleanValue(value);
  } else if (field.startsWith('LOCATION')) {
    event.location = cleanValue(value);
  } else if (field.startsWith('DURATION')) {
    // Parse ISO 8601 duration (e.g., PT1H30M)
    const durationMatch = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || 0);
      const minutes = parseInt(durationMatch[2] || 0);
      event.duration = hours * 60 + minutes;
    }
  }
}

function parseDateTimeField(field, value) {
  // Handle TZID parameter
  let dateTimeStr = value;
  if (field.includes('TZID=')) {
    // Extract actual datetime value after timezone
    const parts = value.split(':');
    dateTimeStr = parts[parts.length - 1];
  }

  // Parse datetime (format: YYYYMMDDTHHMMSS or YYYYMMDD)
  if (dateTimeStr.length >= 8) {
    const year = dateTimeStr.substring(0, 4);
    const month = dateTimeStr.substring(4, 6);
    const day = dateTimeStr.substring(6, 8);
    const date = `${year}-${month}-${day}`;

    if (dateTimeStr.includes('T') && dateTimeStr.length >= 15) {
      const hour = dateTimeStr.substring(9, 11);
      const minute = dateTimeStr.substring(11, 13);
      const time = `${hour}:${minute}`;
      return { date, time };
    }

    return { date, time: '12:00' };
  }

  return { date: new Date().toISOString().split('T')[0], time: '12:00' };
}

function cleanValue(value) {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function isWorkoutEvent(event) {
  const searchText = `${event.name} ${event.description} ${event.location}`.toLowerCase();
  
  const workoutKeywords = [
    'workout', 'gym', 'exercise', 'training', 'fitness',
    'run', 'running', 'jog', 'jogging',
    'yoga', 'pilates', 'stretch',
    'cardio', 'hiit', 'crossfit',
    'lift', 'lifting', 'weights',
    'swim', 'swimming', 'bike', 'cycling',
    'class', 'session', 'practice',
    'chest', 'back', 'legs', 'arms', 'shoulders',
    'push', 'pull', 'squat', 'deadlift', 'bench',
    'core', 'abs', 'plank'
  ];

  return workoutKeywords.some(keyword => searchText.includes(keyword));
}
