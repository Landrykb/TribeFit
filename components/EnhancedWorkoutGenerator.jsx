'use client';
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Modal } from './ui/Modal';
import { 
  Sparkles, Clock, Target, Zap, TrendingUp, ChevronRight,
  Dumbbell, Heart, Brain, Star, Check, Calendar, Edit3, Trash2,
  Plus, ChevronUp, ChevronDown, Copy, Save
} from 'lucide-react';
import { BODY_PARTS, WORKOUT_TEMPLATES, getWorkoutsByBodyPart } from '../lib/workout-library';
import { useToast } from './ui/Toast';

export function EnhancedWorkoutGenerator({ 
  isOpen, 
  onClose, 
  onGenerate,
  userId,
  workoutHistory = []
}) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState('beginner');
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  });
  const [scheduleTime, setScheduleTime] = useState('07:00');
  const [scheduleOption, setScheduleOption] = useState('now'); // 'now' or 'later'

  // Calculate smart suggestions based on workout history
  useEffect(() => {
    if (workoutHistory.length > 0) {
      const suggestions = calculateSmartSuggestions(workoutHistory);
      setSmartSuggestions(suggestions);
    } else {
      // Default suggestions for new users
      setSmartSuggestions([
        {
          id: 'fullbody',
          title: 'Full Body Starter',
          reason: 'Great for beginners',
          bodyPart: 'fullbody',
          duration: 30,
          difficulty: 'beginner'
        },
        {
          id: 'cardio',
          title: 'Quick Cardio Burn',
          reason: 'Boost your energy',
          bodyPart: 'cardio',
          duration: 20,
          difficulty: 'beginner'
        },
        {
          id: 'core',
          title: 'Core Strength',
          reason: 'Build foundation',
          bodyPart: 'core',
          duration: 15,
          difficulty: 'beginner'
        }
      ]);
    }
  }, [workoutHistory]);

  const calculateSmartSuggestions = (history) => {
    const recentWorkouts = history.slice(0, 7); // Last week
    const bodyPartCounts = {};
    
    // Count which body parts were worked
    recentWorkouts.forEach(workout => {
      if (workout.bodyParts) {
        workout.bodyParts.forEach(part => {
          bodyPartCounts[part] = (bodyPartCounts[part] || 0) + 1;
        });
      }
    });

    // Find least worked body parts
    const allParts = BODY_PARTS.map(p => p.id);
    const leastWorked = allParts
      .filter(part => !bodyPartCounts[part] || bodyPartCounts[part] < 2)
      .slice(0, 3);

    return leastWorked.map(partId => {
      const bodyPart = BODY_PARTS.find(p => p.id === partId);
      return {
        id: partId,
        title: `${bodyPart.label} Focus`,
        reason: `Not trained this week`,
        bodyPart: partId,
        duration: 35,
        difficulty: 'intermediate'
      };
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    
    try {
      // Find matching template or create custom
      const matchingWorkouts = getWorkoutsByBodyPart(selectedBodyPart);
      const matchingDifficulty = matchingWorkouts.find(w => w.difficulty === difficulty);
      
      let workout = null;
      
      if (matchingDifficulty) {
        // Use template and customize duration
        workout = {
          ...matchingDifficulty,
          duration: duration,
          isGenerated: true,
          generatedAt: new Date().toISOString()
        };
      } else {
        // Generate custom workout
        workout = await generateCustomWorkout(selectedBodyPart, duration, difficulty);
      }

      setGeneratedWorkout(workout);
      setStep(3);
      
      toast.success('🎯 Workout generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate workout');
    } finally {
      setGenerating(false);
    }
  };

  const generateCustomWorkout = async (bodyPart, minutes, level) => {
    // AI-like workout generation based on parameters
    const bodyPartObj = BODY_PARTS.find(p => p.id === bodyPart);
    const exerciseCount = Math.ceil(minutes / 10); // ~10 min per exercise
    
    // This would call your AI API in production
    return {
      id: `ai_${Date.now()}`,
      name: `${bodyPartObj.label} ${level} Workout`,
      description: `AI-generated ${minutes}-minute ${bodyPartObj.label.toLowerCase()} workout`,
      duration: minutes,
      difficulty: level,
      bodyParts: [bodyPart],
      exercises: generateExercisesForBodyPart(bodyPart, exerciseCount, level),
      isGenerated: true,
      generatedAt: new Date().toISOString()
    };
  };

  const generateExercisesForBodyPart = (bodyPart, count, difficulty) => {
    // Exercise database by body part
    const exerciseLibrary = {
      chest: ['Push-ups', 'Bench Press', 'Chest Flyes', 'Incline Press', 'Cable Crossover'],
      back: ['Pull-ups', 'Rows', 'Lat Pulldown', 'Deadlifts', 'Face Pulls'],
      shoulders: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Arnold Press', 'Shrugs'],
      arms: ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Skull Crushers', 'Cable Curls'],
      legs: ['Squats', 'Lunges', 'Leg Press', 'Leg Curls', 'Calf Raises'],
      core: ['Plank', 'Crunches', 'Russian Twists', 'Leg Raises', 'Mountain Climbers'],
      cardio: ['Jumping Jacks', 'High Knees', 'Burpees', 'Jump Rope', 'Sprints'],
      fullbody: ['Burpees', 'Thrusters', 'Kettlebell Swings', 'Bear Crawls', 'Box Jumps']
    };

    const exercises = exerciseLibrary[bodyPart] || exerciseLibrary.fullbody;
    const selected = exercises.slice(0, Math.min(count, exercises.length));
    
    return selected.map(name => ({
      name,
      sets: difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5,
      reps: difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 12 : 15,
      restTime: difficulty === 'beginner' ? 60 : difficulty === 'intermediate' ? 45 : 30,
      instructions: `Perform with proper form. Focus on the ${bodyPart}.`,
      muscleGroups: [bodyPart]
    }));
  };

  const handleUseSuggestion = (suggestion) => {
    setSelectedBodyPart(suggestion.bodyPart);
    setDuration(suggestion.duration);
    setDifficulty(suggestion.difficulty);
    setStep(2);
  };

  const handleStartWorkout = async () => {
    if (scheduleOption === 'now') {
      // Save to calendar first with current date/time
      try {
        const now = new Date();
        const currentDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: currentDate,
            time: currentTime,
            workout_name: generatedWorkout.name,
            workout_type: 'ai_generated',
            duration: `${generatedWorkout.duration} min`,
            shared: true,
            user_id: userId || 'dev_user',
            user_name: 'You',
            ai_plan: generatedWorkout
          })
        });
      } catch (error) {
        console.error('Failed to save to calendar:', error);
        // Continue anyway - don't block workout start
      }
      
      // Start workout immediately
      onGenerate(generatedWorkout);
      onClose();
    } else {
      // Show scheduling step
      setStep(4);
    }
  };

  const handleScheduleWorkout = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      // Save to calendar - use correct endpoint
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: scheduleDate,
          time: scheduleTime,
          workout_name: generatedWorkout.name,
          workout_type: 'ai_generated',
          duration: `${generatedWorkout.duration} min`,
          shared: true,
          user_id: userId || 'dev_user',
          user_name: 'You',
          ai_plan: generatedWorkout
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`🗓️ Workout scheduled for ${scheduleDate} at ${scheduleTime}!`);
        onClose();
        // Reset state
        setTimeout(() => {
          setStep(1);
          setGeneratedWorkout(null);
          setScheduleOption('now');
        }, 500);
      } else {
        const errorData = await res.json();
        console.error('Schedule error response:', errorData);
        throw new Error(errorData.error || 'Failed to schedule');
      }
    } catch (error) {
      console.error('Schedule error:', error);
      toast.error(`Failed to schedule: ${error.message}`);
    }
  };

  const handleEditExercise = (index, field, value) => {
    const updated = { ...generatedWorkout };
    updated.exercises[index][field] = value;
    setGeneratedWorkout(updated);
  };

  const handleDeleteExercise = (index) => {
    const updated = { ...generatedWorkout };
    updated.exercises = updated.exercises.filter((_, i) => i !== index);
    setGeneratedWorkout(updated);
    toast.success('Exercise removed');
  };

  const handleDuplicateExercise = (index) => {
    const updated = { ...generatedWorkout };
    const duplicated = { ...updated.exercises[index] };
    updated.exercises.splice(index + 1, 0, duplicated);
    setGeneratedWorkout(updated);
    toast.success('Exercise duplicated');
  };

  const handleReorderExercise = (index, direction) => {
    const updated = { ...generatedWorkout };
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated.exercises.length) return;
    [updated.exercises[index], updated.exercises[newIndex]] = [updated.exercises[newIndex], updated.exercises[index]];
    setGeneratedWorkout(updated);
  };

  const handleAddExercise = () => {
    const updated = { ...generatedWorkout };
    updated.exercises.push({
      name: 'New Exercise',
      sets: 3,
      reps: 12,
      restTime: 60,
      instructions: 'Enter instructions',
      muscleGroups: generatedWorkout.bodyParts || []
    });
    setGeneratedWorkout(updated);
    toast.success('Exercise added');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Workout Generator" size="lg">
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= num 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-700 light:bg-gray-300 text-surface-400 light:text-gray-600'
              }`}>
                {step > num ? <Check size={16} /> : num}
              </div>
              {num < 4 && (
                <div className={`w-8 h-1 ${step > num ? 'bg-primary' : 'bg-surface-700 light:bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Smart Suggestions */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <Brain size={40} className="text-primary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-surface-50 mb-2">Smart Recommendations</h3>
              <p className="text-sm text-surface-400">
                Based on your workout history, here's what we suggest:
              </p>
            </div>

            <div className="space-y-2">
              {smartSuggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="w-full p-4 bg-surface-800 border border-surface-700 rounded-lg hover:border-primary/50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-surface-50 group-hover:text-primary transition-colors">
                        {suggestion.title}
                      </div>
                      <div className="text-sm text-surface-400 mt-1">
                        {suggestion.reason} • {suggestion.duration} min • {suggestion.difficulty}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-surface-500 group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-surface-700">
              <Button
                onClick={() => setStep(2)}
                variant="ghost"
                className="w-full"
              >
                <Sparkles size={16} />
                Or create custom workout
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Customization */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Target size={40} className="text-primary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-surface-50 mb-2">What do you want to work today?</h3>
            </div>

            {/* Body Part Selection */}
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-3">
                Target Muscle Group
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BODY_PARTS.map(part => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedBodyPart(part.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedBodyPart === part.id
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{part.emoji}</div>
                    <div className="text-sm font-medium">{part.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-2">
                <Clock size={14} className="inline mr-1" />
                Workout Duration
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-primary font-semibold w-16 text-right">{duration} min</span>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-2">
                <TrendingUp size={14} className="inline mr-1" />
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-2 rounded-lg border transition-all capitalize ${
                      difficulty === level
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setStep(1)} variant="ghost" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleGenerate} 
                variant="primary" 
                className="flex-1"
                disabled={!selectedBodyPart || generating}
              >
                {generating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Workout
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Edit Workout */}
        {step === 3 && generatedWorkout && (
          <div className="space-y-4">
            <div className="text-center">
              <Star size={40} className="text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-surface-50 light:text-gray-900 mb-2">Review & Customize</h3>
              <p className="text-sm text-surface-400 light:text-gray-600">Edit exercises before scheduling</p>
            </div>

            {/* Workout Info */}
            <div className="bg-surface-800 light:bg-white rounded-lg p-4 border border-surface-700 light:border-gray-300">
              <input
                type="text"
                value={generatedWorkout.name}
                onChange={(e) => setGeneratedWorkout({...generatedWorkout, name: e.target.value})}
                className="w-full bg-transparent text-surface-50 light:text-gray-900 font-semibold text-lg mb-2 border-none outline-none"
              />
              <div className="flex gap-4 text-sm">
                <span className="text-surface-400 light:text-gray-600">
                  <Clock size={14} className="inline mr-1" />
                  {generatedWorkout.duration} min
                </span>
                <span className="text-surface-400 light:text-gray-600">
                  <Dumbbell size={14} className="inline mr-1" />
                  {generatedWorkout.exercises.length} exercises
                </span>
              </div>
            </div>

            {/* Exercise Editor */}
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {generatedWorkout.exercises.map((ex, idx) => (
                <div key={idx} className="bg-surface-800 light:bg-white rounded-lg p-3 border border-surface-700 light:border-gray-300">
                  <div className="flex items-start justify-between mb-2">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => handleEditExercise(idx, 'name', e.target.value)}
                      className="flex-1 bg-transparent text-surface-50 light:text-gray-900 font-medium border-none outline-none"
                    />
                    <div className="flex gap-1 ml-2">
                      {idx > 0 && (
                        <button
                          onClick={() => handleReorderExercise(idx, 'up')}
                          className="p-1 hover:bg-surface-700 light:hover:bg-gray-200 rounded"
                        >
                          <ChevronUp size={16} className="text-surface-400 light:text-gray-600" />
                        </button>
                      )}
                      {idx < generatedWorkout.exercises.length - 1 && (
                        <button
                          onClick={() => handleReorderExercise(idx, 'down')}
                          className="p-1 hover:bg-surface-700 light:hover:bg-gray-200 rounded"
                        >
                          <ChevronDown size={16} className="text-surface-400 light:text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicateExercise(idx)}
                        className="p-1 hover:bg-surface-700 light:hover:bg-gray-200 rounded"
                      >
                        <Copy size={16} className="text-surface-400 light:text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(idx)}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-surface-400 light:text-gray-600">Sets</label>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => handleEditExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 bg-surface-700 light:bg-gray-100 border border-surface-600 light:border-gray-300 rounded text-surface-50 light:text-gray-900"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-400 light:text-gray-600">Reps</label>
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => handleEditExercise(idx, 'reps', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 bg-surface-700 light:bg-gray-100 border border-surface-600 light:border-gray-300 rounded text-surface-50 light:text-gray-900"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-400 light:text-gray-600">Rest (s)</label>
                      <input
                        type="number"
                        value={ex.restTime}
                        onChange={(e) => handleEditExercise(idx, 'restTime', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-surface-700 light:bg-gray-100 border border-surface-600 light:border-gray-300 rounded text-surface-50 light:text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Exercise Button */}
            <Button onClick={handleAddExercise} variant="ghost" className="w-full">
              <Plus size={16} />
              Add Exercise
            </Button>

            {/* Schedule Options */}
            <div className="bg-surface-800 light:bg-gray-50 rounded-lg p-4 border border-surface-700 light:border-gray-300">
              <div className="text-sm font-medium text-surface-200 light:text-gray-700 mb-3">When do you want to workout?</div>
              <div className="space-y-2">
                <button
                  onClick={() => setScheduleOption('now')}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    scheduleOption === 'now'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-surface-800 light:bg-white border-surface-700 light:border-gray-300 text-surface-300 light:text-gray-700 hover:border-surface-600 light:hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Start Now</div>
                  <div className="text-xs opacity-75">Begin workout immediately</div>
                </button>
                <button
                  onClick={() => setScheduleOption('later')}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    scheduleOption === 'later'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-surface-800 light:bg-white border-surface-700 light:border-gray-300 text-surface-300 light:text-gray-700 hover:border-surface-600 light:hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Schedule for Later</div>
                  <div className="text-xs opacity-75">Add to calendar</div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="ghost" className="flex-1">
                Regenerate
              </Button>
              <Button onClick={handleStartWorkout} variant="success" className="flex-1">
                {scheduleOption === 'now' ? (
                  <><Zap size={16} /> Start Now</>
                ) : (
                  <><Calendar size={16} /> Next</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Schedule Workout */}
        {step === 4 && generatedWorkout && (
          <div className="space-y-4">
            <div className="text-center">
              <Calendar size={40} className="text-success mx-auto mb-3" />
              <h3 className="text-lg font-bold text-surface-50 light:text-gray-900 mb-2">Schedule Workout</h3>
              <p className="text-sm text-surface-400 light:text-gray-600">Choose when to do: {generatedWorkout.name}</p>
            </div>

            {/* Date and Time Picker */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-3 bg-surface-800 light:bg-white border border-surface-700 light:border-gray-300 rounded-lg text-surface-50 light:text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-3 bg-surface-800 light:bg-white border border-surface-700 light:border-gray-300 rounded-lg text-surface-50 light:text-gray-900"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-surface-800 light:bg-gray-50 rounded-lg p-4 border border-surface-700 light:border-gray-300">
              <div className="text-sm text-surface-400 light:text-gray-600 mb-2">Summary</div>
              <div className="text-surface-50 light:text-gray-900 font-medium">{generatedWorkout.name}</div>
              <div className="text-sm text-surface-400 light:text-gray-600 mt-1">
                {generatedWorkout.exercises.length} exercises • {generatedWorkout.duration} minutes
              </div>
              <div className="text-success font-medium mt-2">
                <Calendar size={13} className="inline -mt-0.5" /> {scheduleDate} at {scheduleTime}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => setStep(3)} variant="ghost" className="flex-1">
                Back
              </Button>
              <Button onClick={handleScheduleWorkout} variant="success" className="flex-1">
                <Save size={16} />
                Add to Calendar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
