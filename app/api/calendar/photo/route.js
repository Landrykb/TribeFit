import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'Image file required' }, { status: 400 });
    }

    const visionApiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    if (visionApiKey) {
      return await processWithCloudVision(file, visionApiKey);
    } else {
      console.log('⚠️ Google Cloud Vision not configured, using fallback');
      return fallbackPhotoData();
    }

  } catch (error) {
    console.error('Photo OCR Error:', error);
    return fallbackPhotoData();
  }
}

async function processWithCloudVision(file, apiKey) {
  try {
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: 'TEXT_DETECTION' }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const text = data.responses[0]?.fullTextAnnotation?.text || '';

    if (!text) {
      return fallbackPhotoData();
    }

    const workouts = extractWorkoutsFromText(text);

    return NextResponse.json({
      success: true,
      workouts,
      count: workouts.length,
      extractedText: text,
    });

  } catch (error) {
    console.error('Cloud Vision Error:', error);
    return fallbackPhotoData();
  }
}

function extractWorkoutsFromText(text) {
  const workouts = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentWorkout = null;
  let currentExercises = [];

  lines.forEach((line) => {
    const timeMatch = line.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    const dateMatch = line.match(/(\d{1,2})\/(\d{1,2})|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i);

    if (timeMatch || dateMatch || isWorkoutTitle(line)) {
      if (currentWorkout && currentExercises.length > 0) {
        currentWorkout.exercises = currentExercises;
        workouts.push(currentWorkout);
      }

      currentWorkout = {
        name: line,
        date: new Date().toISOString().split('T')[0],
        time: timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : '12:00',
        duration: 45,
        description: '',
        source: 'photo',
        exercises: []
      };
      currentExercises = [];
    }
    else if (isExerciseLine(line)) {
      const exercise = parseExercise(line);
      if (exercise) {
        currentExercises.push(exercise);
      }
    }
  });

  if (currentWorkout && currentExercises.length > 0) {
    currentWorkout.exercises = currentExercises;
    workouts.push(currentWorkout);
  }

  if (workouts.length === 0 && currentExercises.length > 0) {
    workouts.push({
      name: 'Workout from Photo',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      duration: currentExercises.length * 10,
      description: 'Extracted from image',
      source: 'photo',
      exercises: currentExercises
    });
  }

  return workouts;
}

function isWorkoutTitle(line) {
  const workoutWords = [
    'workout', 'training', 'session', 'day',
    'upper', 'lower', 'push', 'pull', 'legs',
    'chest', 'back', 'shoulders', 'arms',
    'cardio', 'hiit', 'strength'
  ];
  const lowerLine = line.toLowerCase();
  return workoutWords.some(word => lowerLine.includes(word)) && line.length < 50;
}

function isExerciseLine(line) {
  const setsRepsPattern = /\d+\s*[x×]\s*\d+|\d+\s+sets?|\d+\s+reps?/i;
  return setsRepsPattern.test(line);
}

function parseExercise(line) {
  const setsRepsMatch = line.match(/(\d+)\s*[x×]\s*(\d+)/);
  const setsMatch = line.match(/(\d+)\s+sets?/i);
  const repsMatch = line.match(/(\d+)\s+reps?/i);

  let sets = 3;
  let reps = 12;

  if (setsRepsMatch) {
    sets = parseInt(setsRepsMatch[1]);
    reps = parseInt(setsRepsMatch[2]);
  } else if (setsMatch) {
    sets = parseInt(setsMatch[1]);
  } else if (repsMatch) {
    reps = parseInt(repsMatch[1]);
  }

  let name = line
    .replace(/\d+\s*[x×]\s*\d+/gi, '')
    .replace(/\d+\s+sets?/gi, '')
    .replace(/\d+\s+reps?/gi, '')
    .replace(/[-–—:]/g, '')
    .trim();

  if (!name) return null;

  return {
    name,
    sets,
    reps,
    restTime: 60,
    instructions: '',
    muscleGroups: []
  };
}

function fallbackPhotoData() {
  const workouts = [
    {
      name: 'Upper Body Workout (From Photo)',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: 45,
      description: 'Sample extraction - Configure Google Cloud Vision for real OCR',
      source: 'photo',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 8, restTime: 90, instructions: '' },
        { name: 'Dumbbell Rows', sets: 3, reps: 12, restTime: 60, instructions: '' },
        { name: 'Shoulder Press', sets: 3, reps: 10, restTime: 60, instructions: '' },
        { name: 'Bicep Curls', sets: 3, reps: 12, restTime: 45, instructions: '' },
        { name: 'Tricep Dips', sets: 3, reps: 12, restTime: 45, instructions: '' }
      ]
    }
  ];

  return NextResponse.json({
    success: true,
    workouts,
    count: workouts.length,
    fallback: true,
    message: 'Using sample data - configure Google Cloud Vision API for real OCR'
  });
}
