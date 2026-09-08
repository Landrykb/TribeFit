import { NextResponse } from 'next/server';
import { generateAIWorkout } from '../../../lib/ai-service.js';

export async function POST(request) {
  try {
    const { fitnessGoals, availableTime, equipment, experienceLevel, userId } = await request.json();

    // Validate required fields
    if (!fitnessGoals || !availableTime || !equipment || !experienceLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: fitnessGoals, availableTime, equipment, experienceLevel' },
        { status: 400 }
      );
    }

    // Use GPT-4o-mini AI service to generate personalized workout
    const userProfile = {
      userId: userId || 'default-user',
      fitnessGoals,
      availableTime,
      equipment,
      experienceLevel,
      limitations: 'None' // Can be extended based on user input
    };

    try {
      const aiWorkoutPlan = await generateAIWorkout(userProfile);
      
      // Ensure we have the required structure for the frontend
      const workoutPlan = {
        planId: `ai-plan-${Date.now()}`,
        title: aiWorkoutPlan.title || `${experienceLevel} ${fitnessGoals} Workout`,
        goal: fitnessGoals,
        duration: availableTime,
        level: experienceLevel,
        equipment: equipment,
        exercises: aiWorkoutPlan.exercises || [],
        warmup: aiWorkoutPlan.warmup || [
          'Light stretching - 2 minutes',
          'Arm circles and leg swings - 2 minutes', 
          'Light cardio movement - 1 minute'
        ],
        cooldown: aiWorkoutPlan.cooldown || [
          'Deep breathing - 1 minute',
          'Full body stretching - 4 minutes'
        ],
        tips: aiWorkoutPlan.tips || [
          'Focus on proper form over speed',
          'Listen to your body and rest when needed',
          'Stay hydrated throughout the workout'
        ],
        estimatedCalories: aiWorkoutPlan.calories || Math.floor(availableTime * 6),
        createdAt: new Date().toISOString(),
        generatedBy: aiWorkoutPlan.generated_by || 'TribeFit AI Coach (GPT-4o-mini)',
        aiContent: aiWorkoutPlan.content, // Raw AI response if available
        difficulty: aiWorkoutPlan.difficulty || experienceLevel
      };

      return NextResponse.json({ 
        success: true, 
        workoutPlan,
        message: 'AI workout plan generated successfully with GPT-4o-mini' 
      });

    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      
      // Fallback to mock system if AI fails
      const fallbackWorkout = generateFallbackWorkout(userProfile);
      
      return NextResponse.json({ 
        success: true, 
        workoutPlan: fallbackWorkout,
        message: 'Workout plan generated (fallback mode)',
        note: 'AI temporarily unavailable - using smart fallback system'
      });
    }

  } catch (error) {
    console.error('Workout generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}

// Fallback function for when AI is unavailable
function generateFallbackWorkout({ fitnessGoals, availableTime, equipment, experienceLevel, userId }) {
  const mockWorkoutPlans = {
    'Muscle Building': {
      beginner: {
        title: 'Beginner Muscle Building',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: '8-12', rest: '60s', description: 'Keep body straight, lower chest to ground' },
          { name: 'Squats', sets: 3, reps: '10-15', rest: '60s', description: 'Lower hips back and down, keep chest up' },
          { name: 'Plank', sets: 3, reps: '30-60s', rest: '60s', description: 'Hold straight body position' }
        ]
      },
      intermediate: {
        title: 'Intermediate Muscle Building',
        exercises: [
          { name: 'Diamond Push-ups', sets: 4, reps: '10-15', rest: '90s', description: 'Hands form diamond shape' },
          { name: 'Jump Squats', sets: 4, reps: '12-15', rest: '90s', description: 'Explode up from squat position' },
          { name: 'Pike Push-ups', sets: 3, reps: '8-12', rest: '90s', description: 'Hands and feet form inverted V' }
        ]
      },
      advanced: {
        title: 'Advanced Muscle Building',
        exercises: [
          { name: 'One-arm Push-ups', sets: 5, reps: '5-8 each arm', rest: '2min', description: 'Ultimate push-up challenge' },
          { name: 'Pistol Squats', sets: 4, reps: '6-10 each leg', rest: '2min', description: 'Single-leg squat to ground' }
        ]
      }
    },
    'Weight Loss': {
      beginner: {
        title: 'Beginner Fat Burn',
        exercises: [
          { name: 'Marching in Place', sets: 3, reps: '30s', rest: '30s', description: 'High knees, pump arms' },
          { name: 'Wall Sits', sets: 3, reps: '20-30s', rest: '45s', description: 'Back against wall, thighs parallel' }
        ]
      },
      intermediate: {
        title: 'Intermediate HIIT Burn',
        exercises: [
          { name: 'Burpees', sets: 4, reps: '8-12', rest: '45s', description: 'Full body explosive movement' },
          { name: 'Mountain Climbers', sets: 4, reps: '20-30', rest: '45s', description: 'Run in plank position' }
        ]
      },
      advanced: {
        title: 'Advanced Cardio Blast',
        exercises: [
          { name: 'Burpee Box Jumps', sets: 5, reps: '8-10', rest: '60s', description: 'Burpee + explosive jump' },
          { name: 'Tabata Sprints', sets: 4, reps: '20s on/10s off', rest: '1min', description: 'High intensity intervals' }
        ]
      }
    }
  };

  const goalPlans = mockWorkoutPlans[fitnessGoals] || mockWorkoutPlans['Weight Loss'];
  const levelKey = experienceLevel.toLowerCase();
  const workout = goalPlans[levelKey] || goalPlans['beginner'];

  return {
    planId: `fallback-plan-${Date.now()}`,
    title: workout.title,
    goal: fitnessGoals,
    duration: availableTime,
    level: experienceLevel,
    equipment: equipment,
    exercises: workout.exercises,
    warmup: [
      'Light stretching - 2 minutes',
      'Arm circles and leg swings - 2 minutes',
      'Light cardio movement - 1 minute'
    ],
    cooldown: [
      'Deep breathing - 1 minute',
      'Full body stretching - 4 minutes'
    ],
    tips: [
      'Focus on proper form over speed',
      'Listen to your body and rest when needed',
      'Stay hydrated throughout the workout',
      'Gradually increase intensity as you get stronger'
    ],
    estimatedCalories: Math.floor(availableTime * (experienceLevel === 'Advanced' ? 8 : experienceLevel === 'Intermediate' ? 6 : 4)),
    createdAt: new Date().toISOString(),
    generatedBy: 'TribeFit Smart Fallback System'
  };
}