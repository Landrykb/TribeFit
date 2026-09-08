// Enhanced Workout Library with Detailed Exercises
// Categories: Push, Pull, Legs, Core, Cardio, Full Body, Upper Body, Lower Body

export const BODY_PARTS = [
  { id: 'chest', label: 'Chest', emoji: '💪' },
  { id: 'back', label: 'Back', emoji: '🦾' },
  { id: 'shoulders', label: 'Shoulders', emoji: '🏋️' },
  { id: 'arms', label: 'Arms', emoji: '💪' },
  { id: 'legs', label: 'Legs', emoji: '🦵' },
  { id: 'core', label: 'Core/Abs', emoji: '🎯' },
  { id: 'cardio', label: 'Cardio', emoji: '🏃' },
  { id: 'fullbody', label: 'Full Body', emoji: '🔥' },
];

export const WORKOUT_TEMPLATES = {
  // PUSH WORKOUTS
  push_beginner: {
    id: 'push_beginner',
    name: 'Push Beginner',
    category: 'push',
    bodyParts: ['chest', 'shoulders', 'arms'],
    difficulty: 'beginner',
    duration: 30,
    description: 'Perfect for beginners focusing on chest, shoulders, and triceps',
    exercises: [
      {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        restTime: 60,
        instructions: 'Keep your core tight, lower until chest nearly touches ground. Modify on knees if needed.',
        videoUrl: null,
        muscleGroups: ['chest', 'shoulders', 'triceps']
      },
      {
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Press dumbbells overhead, fully extend arms. Control the descent.',
        videoUrl: null,
        muscleGroups: ['shoulders', 'triceps']
      },
      {
        name: 'Tricep Dips',
        sets: 3,
        reps: 10,
        restTime: 45,
        instructions: 'Use a chair or bench. Lower body by bending elbows, keep shoulders down.',
        videoUrl: null,
        muscleGroups: ['triceps', 'chest']
      },
      {
        name: 'Lateral Raises',
        sets: 3,
        reps: 15,
        restTime: 45,
        instructions: 'Raise arms to shoulder height, slight bend in elbows. Control the movement.',
        videoUrl: null,
        muscleGroups: ['shoulders']
      }
    ]
  },
  
  push_intermediate: {
    id: 'push_intermediate',
    name: 'Push Intermediate',
    category: 'push',
    bodyParts: ['chest', 'shoulders', 'arms'],
    difficulty: 'intermediate',
    duration: 45,
    description: 'Challenging push workout with compound and isolation movements',
    exercises: [
      {
        name: 'Barbell Bench Press',
        sets: 4,
        reps: 8,
        restTime: 90,
        instructions: 'Lower bar to mid-chest, press explosively. Keep feet planted.',
        videoUrl: null,
        muscleGroups: ['chest', 'shoulders', 'triceps']
      },
      {
        name: 'Incline Dumbbell Press',
        sets: 4,
        reps: 10,
        restTime: 75,
        instructions: 'Set bench to 30-45°. Press dumbbells up, squeeze at top.',
        videoUrl: null,
        muscleGroups: ['upper chest', 'shoulders']
      },
      {
        name: 'Military Press',
        sets: 4,
        reps: 8,
        restTime: 90,
        instructions: 'Standing or seated. Press barbell overhead, keep core tight.',
        videoUrl: null,
        muscleGroups: ['shoulders', 'triceps']
      },
      {
        name: 'Cable Flyes',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Slight forward lean, bring handles together. Feel the chest stretch.',
        videoUrl: null,
        muscleGroups: ['chest']
      },
      {
        name: 'Overhead Tricep Extension',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Keep elbows close to head. Lower weight behind head, extend fully.',
        videoUrl: null,
        muscleGroups: ['triceps']
      }
    ]
  },

  // PULL WORKOUTS
  pull_beginner: {
    id: 'pull_beginner',
    name: 'Pull Beginner',
    category: 'pull',
    bodyParts: ['back', 'arms'],
    difficulty: 'beginner',
    duration: 30,
    description: 'Build a strong back and biceps with these foundational movements',
    exercises: [
      {
        name: 'Assisted Pull-ups',
        sets: 3,
        reps: 8,
        restTime: 90,
        instructions: 'Use resistance band or machine. Pull until chin over bar.',
        videoUrl: null,
        muscleGroups: ['back', 'biceps']
      },
      {
        name: 'Dumbbell Rows',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'One knee on bench. Pull dumbbell to hip, squeeze shoulder blade.',
        videoUrl: null,
        muscleGroups: ['back', 'biceps']
      },
      {
        name: 'Face Pulls',
        sets: 3,
        reps: 15,
        restTime: 45,
        instructions: 'Pull rope to face level. External rotation at end. Good for posture.',
        videoUrl: null,
        muscleGroups: ['rear delts', 'upper back']
      },
      {
        name: 'Bicep Curls',
        sets: 3,
        reps: 12,
        restTime: 45,
        instructions: 'Keep elbows stationary. Curl weight up, control the descent.',
        videoUrl: null,
        muscleGroups: ['biceps']
      }
    ]
  },

  pull_intermediate: {
    id: 'pull_intermediate',
    name: 'Pull Intermediate',
    category: 'pull',
    bodyParts: ['back', 'arms'],
    difficulty: 'intermediate',
    duration: 45,
    description: 'Advanced back training with varied angles and grips',
    exercises: [
      {
        name: 'Weighted Pull-ups',
        sets: 4,
        reps: 6,
        restTime: 120,
        instructions: 'Add weight with belt. Full range of motion, controlled tempo.',
        videoUrl: null,
        muscleGroups: ['lats', 'biceps']
      },
      {
        name: 'Barbell Rows',
        sets: 4,
        reps: 8,
        restTime: 90,
        instructions: 'Hinge at hips, pull bar to lower chest. Keep back straight.',
        videoUrl: null,
        muscleGroups: ['back', 'biceps']
      },
      {
        name: 'Lat Pulldowns',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Wide grip. Pull to upper chest, squeeze lats at bottom.',
        videoUrl: null,
        muscleGroups: ['lats', 'biceps']
      },
      {
        name: 'Seated Cable Rows',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Pull handle to abdomen. Keep chest up, squeeze shoulder blades.',
        videoUrl: null,
        muscleGroups: ['mid back', 'biceps']
      },
      {
        name: 'Hammer Curls',
        sets: 3,
        reps: 12,
        restTime: 45,
        instructions: 'Neutral grip. Curl dumbbells up, keep elbows stable.',
        videoUrl: null,
        muscleGroups: ['biceps', 'forearms']
      }
    ]
  },

  // LEGS WORKOUTS
  legs_beginner: {
    id: 'legs_beginner',
    name: 'Legs Beginner',
    category: 'legs',
    bodyParts: ['legs'],
    difficulty: 'beginner',
    duration: 35,
    description: 'Build strong legs with these fundamental exercises',
    exercises: [
      {
        name: 'Bodyweight Squats',
        sets: 3,
        reps: 15,
        restTime: 60,
        instructions: 'Feet shoulder-width. Lower until thighs parallel. Keep chest up.',
        videoUrl: null,
        muscleGroups: ['quads', 'glutes']
      },
      {
        name: 'Walking Lunges',
        sets: 3,
        reps: '10 each leg',
        restTime: 60,
        instructions: 'Step forward, lower back knee to ground. Alternate legs.',
        videoUrl: null,
        muscleGroups: ['quads', 'glutes', 'hamstrings']
      },
      {
        name: 'Leg Press',
        sets: 3,
        reps: 15,
        restTime: 75,
        instructions: 'Push through heels. Full range of motion. Control the descent.',
        videoUrl: null,
        muscleGroups: ['quads', 'glutes']
      },
      {
        name: 'Calf Raises',
        sets: 3,
        reps: 20,
        restTime: 45,
        instructions: 'Rise on toes, hold at top. Slow descent for stretch.',
        videoUrl: null,
        muscleGroups: ['calves']
      }
    ]
  },

  legs_intermediate: {
    id: 'legs_intermediate',
    name: 'Legs Intermediate',
    category: 'legs',
    bodyParts: ['legs'],
    difficulty: 'intermediate',
    duration: 50,
    description: 'Intense leg workout targeting all major muscle groups',
    exercises: [
      {
        name: 'Barbell Back Squats',
        sets: 4,
        reps: 8,
        restTime: 120,
        instructions: 'Bar on upper back. Squat deep, drive through heels. Brace core.',
        videoUrl: null,
        muscleGroups: ['quads', 'glutes', 'hamstrings']
      },
      {
        name: 'Romanian Deadlifts',
        sets: 4,
        reps: 10,
        restTime: 90,
        instructions: 'Hinge at hips, lower bar along legs. Feel hamstring stretch.',
        videoUrl: null,
        muscleGroups: ['hamstrings', 'glutes', 'lower back']
      },
      {
        name: 'Bulgarian Split Squats',
        sets: 3,
        reps: '10 each leg',
        restTime: 60,
        instructions: 'Rear foot elevated. Lower into lunge. Excellent for balance.',
        videoUrl: null,
        muscleGroups: ['quads', 'glutes']
      },
      {
        name: 'Leg Curls',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Lying or seated. Curl heels to glutes. Squeeze at top.',
        videoUrl: null,
        muscleGroups: ['hamstrings']
      },
      {
        name: 'Leg Extensions',
        sets: 3,
        reps: 15,
        restTime: 45,
        instructions: 'Extend legs fully. Control the weight. Focus on quad contraction.',
        videoUrl: null,
        muscleGroups: ['quads']
      }
    ]
  },

  // CORE/ABS WORKOUTS
  core_beginner: {
    id: 'core_beginner',
    name: 'Core Basics',
    category: 'core',
    bodyParts: ['core'],
    difficulty: 'beginner',
    duration: 20,
    description: 'Strengthen your core with these effective exercises',
    exercises: [
      {
        name: 'Plank',
        sets: 3,
        reps: '30-45 sec',
        restTime: 60,
        instructions: 'Forearms on ground. Body straight. Engage core, don\'t sag hips.',
        videoUrl: null,
        muscleGroups: ['core', 'abs']
      },
      {
        name: 'Crunches',
        sets: 3,
        reps: 20,
        restTime: 45,
        instructions: 'Lift shoulders off ground. Exhale at top. Controlled movement.',
        videoUrl: null,
        muscleGroups: ['abs']
      },
      {
        name: 'Russian Twists',
        sets: 3,
        reps: '15 each side',
        restTime: 45,
        instructions: 'Lean back slightly. Rotate torso side to side. Can hold weight.',
        videoUrl: null,
        muscleGroups: ['obliques', 'abs']
      },
      {
        name: 'Leg Raises',
        sets: 3,
        reps: 12,
        restTime: 45,
        instructions: 'Lie flat. Raise legs to 90°. Lower slowly without touching ground.',
        videoUrl: null,
        muscleGroups: ['lower abs']
      }
    ]
  },

  // CARDIO/HIIT
  hiit_beginner: {
    id: 'hiit_beginner',
    name: 'HIIT Starter',
    category: 'cardio',
    bodyParts: ['cardio', 'fullbody'],
    difficulty: 'beginner',
    duration: 20,
    description: 'High-intensity intervals to boost metabolism and burn calories',
    exercises: [
      {
        name: 'Jumping Jacks',
        sets: 3,
        reps: '30 sec',
        restTime: 30,
        instructions: 'Full range of motion. Keep core engaged. Moderate pace.',
        videoUrl: null,
        muscleGroups: ['cardio', 'shoulders']
      },
      {
        name: 'High Knees',
        sets: 3,
        reps: '30 sec',
        restTime: 30,
        instructions: 'Drive knees up to chest level. Quick tempo. Pump arms.',
        videoUrl: null,
        muscleGroups: ['cardio', 'legs']
      },
      {
        name: 'Burpees',
        sets: 3,
        reps: 10,
        restTime: 60,
        instructions: 'Jump down to plank, push-up, jump back up. Full body movement.',
        videoUrl: null,
        muscleGroups: ['full body', 'cardio']
      },
      {
        name: 'Mountain Climbers',
        sets: 3,
        reps: '30 sec',
        restTime: 45,
        instructions: 'Plank position. Drive knees to chest alternately. Fast pace.',
        videoUrl: null,
        muscleGroups: ['core', 'cardio']
      }
    ]
  },

  // FULL BODY
  fullbody_beginner: {
    id: 'fullbody_beginner',
    name: 'Full Body Basics',
    category: 'fullbody',
    bodyParts: ['fullbody'],
    difficulty: 'beginner',
    duration: 40,
    description: 'Complete workout hitting all major muscle groups',
    exercises: [
      {
        name: 'Goblet Squats',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Hold dumbbell at chest. Squat deep, elbows inside knees.',
        videoUrl: null,
        muscleGroups: ['legs', 'core']
      },
      {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        restTime: 60,
        instructions: 'Full range. Modify on knees if needed.',
        videoUrl: null,
        muscleGroups: ['chest', 'triceps', 'shoulders']
      },
      {
        name: 'Dumbbell Rows',
        sets: 3,
        reps: '12 each arm',
        restTime: 45,
        instructions: 'Support on bench. Pull to hip, squeeze shoulder blade.',
        videoUrl: null,
        muscleGroups: ['back', 'biceps']
      },
      {
        name: 'Shoulder Press',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Press overhead. Control descent.',
        videoUrl: null,
        muscleGroups: ['shoulders', 'triceps']
      },
      {
        name: 'Plank',
        sets: 3,
        reps: '45 sec',
        restTime: 45,
        instructions: 'Hold strong plank position. Body straight.',
        videoUrl: null,
        muscleGroups: ['core']
      }
    ]
  }
};

// Helper function to get workouts by body part
export function getWorkoutsByBodyPart(bodyPartId) {
  return Object.values(WORKOUT_TEMPLATES).filter(workout => 
    workout.bodyParts.includes(bodyPartId)
  );
}

// Helper function to get workouts by difficulty
export function getWorkoutsByDifficulty(difficulty) {
  return Object.values(WORKOUT_TEMPLATES).filter(workout => 
    workout.difficulty === difficulty
  );
}

// Get all workout IDs
export function getAllWorkoutIds() {
  return Object.keys(WORKOUT_TEMPLATES);
}

// Get workout by ID
export function getWorkoutById(id) {
  return WORKOUT_TEMPLATES[id] || null;
}
