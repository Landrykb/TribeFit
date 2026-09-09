import { NextResponse } from 'next/server';
import { generateAIWorkout } from '../../../lib/ai-service.js';

export const dynamic = 'force-dynamic';

function generateFallbackWorkout(userProfile) {
  const { fitnessGoals, availableTime, equipment, experienceLevel } = userProfile;
  const exercises = [];

  if (fitnessGoals?.toLowerCase().includes('strength') || fitnessGoals?.toLowerCase().includes('muscle')) {
    exercises.push(
      { name: 'Push-ups', sets: 3, reps: '8-12', rest: '60s' },
      { name: 'Squats', sets: 3, reps: '10-15', rest: '60s' },
      { name: 'Plank', sets: 3, reps: '30s', rest: '45s' }
    );
  } else if (fitnessGoals?.toLowerCase().includes('cardio') || fitnessGoals?.toLowerCase().includes('endurance')) {
    exercises.push(
      { name: 'Jumping Jacks', sets: 3, reps: '45s', rest: '30s' },
      { name: 'High Knees', sets: 3, reps: '30s', rest: '30s' },
      { name: 'Burpees', sets: 3, reps: '10', rest: '60s' }
    );
  } else {
    exercises.push(
      { name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '45s' },
      { name: 'Push-ups', sets: 3, reps: '8-12', rest: '60s' },
      { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '45s' },
      { name: 'Plank', sets: 3, reps: '30s', rest: '30s' }
    );
  }

  return {
    planId: `fallback-${Date.now()}`,
    title: `${experienceLevel || 'Custom'} ${fitnessGoals || 'Fitness'} Workout`,
    goal: fitnessGoals,
    duration: availableTime,
    level: experienceLevel,
    equipment: equipment,
    exercises,
    warmup: ['Light stretching - 2 minutes', 'Arm circles - 1 minute', 'Light cardio - 2 minutes'],
    cooldown: ['Deep breathing - 1 minute', 'Full body stretching - 3 minutes'],
    tips: ['Focus on form', 'Stay hydrated', 'Rest when needed'],
    estimatedCalories: Math.floor(availableTime * 6),
    createdAt: new Date().toISOString(),
    generatedBy: 'TribeFit Fallback System',
    difficulty: experienceLevel,
  };
}

export async function POST(request) {
  try {
    const { fitnessGoals, availableTime, equipment, experienceLevel, userId } = await request.json();

    if (!fitnessGoals || !availableTime || !equipment || !experienceLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: fitnessGoals, availableTime, equipment, experienceLevel' },
        { status: 400 }
      );
    }

    const userProfile = {
      userId: userId || 'default-user',
      fitnessGoals,
      availableTime,
      equipment,
      experienceLevel,
      limitations: 'None'
    };

    try {
      const aiWorkoutPlan = await generateAIWorkout(userProfile);

      return NextResponse.json({
        success: true,
        workoutPlan: {
          planId: `ai-plan-${Date.now()}`,
          title: aiWorkoutPlan.title || `${experienceLevel} ${fitnessGoals} Workout`,
          goal: fitnessGoals,
          duration: availableTime,
          level: experienceLevel,
          equipment: equipment,
          exercises: aiWorkoutPlan.exercises || [],
          warmup: aiWorkoutPlan.warmup || ['Light stretching - 2 minutes', 'Arm circles and leg swings - 2 minutes', 'Light cardio movement - 1 minute'],
          cooldown: aiWorkoutPlan.cooldown || ['Deep breathing - 1 minute', 'Full body stretching - 4 minutes'],
          tips: aiWorkoutPlan.tips || ['Focus on proper form over speed', 'Listen to your body and rest when needed', 'Stay hydrated throughout the workout'],
          estimatedCalories: aiWorkoutPlan.calories || Math.floor(availableTime * 6),
          createdAt: new Date().toISOString(),
          generatedBy: aiWorkoutPlan.generated_by || 'TribeFit AI Coach (GPT-4o-mini)',
          aiContent: aiWorkoutPlan.content,
          difficulty: aiWorkoutPlan.difficulty || experienceLevel
        },
        message: 'AI workout plan generated successfully with GPT-4o-mini'
      });
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);

      return NextResponse.json({
        success: true,
        workoutPlan: generateFallbackWorkout(userProfile),
        message: 'Workout plan generated (fallback mode)',
        note: 'AI temporarily unavailable - using smart fallback system'
      });
    }
  } catch (error) {
    console.error('Generate workout error:', error);
    return NextResponse.json({ error: 'Failed to generate workout plan' }, { status: 500 });
  }
}
