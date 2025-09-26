import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { 
  Dumbbell, Zap, Heart, Timer, Target, Users,
  Plus, X, Calendar, Clock, Sparkles
} from 'lucide-react';

// Predefined workout types with exercises
const workoutTypes = {
  strength: {
    name: 'Strength Training',
    icon: Dumbbell,
    color: 'text-red-400',
    exercises: ['Push-ups', 'Squats', 'Pull-ups', 'Deadlifts', 'Bench Press', 'Rows']
  },
  cardio: {
    name: 'Cardio',
    icon: Zap,
    color: 'text-yellow-400', 
    exercises: ['Running', 'Jumping Jacks', 'Burpees', 'Mountain Climbers', 'High Knees', 'Jump Rope']
  },
  yoga: {
    name: 'Yoga & Flexibility',
    icon: Heart,
    color: 'text-pink-400',
    exercises: ['Downward Dog', 'Warrior Pose', 'Child\'s Pose', 'Tree Pose', 'Sun Salutation', 'Cat-Cow']
  },
  hiit: {
    name: 'HIIT Training',
    icon: Timer,
    color: 'text-orange-400',
    exercises: ['Burpees', 'Jump Squats', 'Push-ups', 'Plank Jacks', 'Lunges', 'Bicycle Crunches']
  },
  crossfit: {
    name: 'CrossFit',
    icon: Target,
    color: 'text-green-400',
    exercises: ['Box Jumps', 'Kettlebell Swings', 'Wall Balls', 'Thrusters', 'Pull-ups', 'Double Unders']
  },
  custom: {
    name: 'Custom Workout',
    icon: Plus,
    color: 'text-blue-400',
    exercises: []
  }
};

export function WorkoutScheduler({ isOpen, onClose, selectedDate, onSchedule }) {
  const toast = useToast();
  const [step, setStep] = useState(1); // 1: Type selection, 2: Exercise selection, 3: Details
  const [selectedType, setSelectedType] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [customExercise, setCustomExercise] = useState('');
  const [workoutDetails, setWorkoutDetails] = useState({
    time: '07:00',
    duration: 45,
    shareWithTribe: true,
    workoutName: ''
  });
  const [useAI, setUseAI] = useState(false);

  const resetForm = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedExercises([]);
    setCustomExercise('');
    setWorkoutDetails({
      time: '07:00',
      duration: 45,
      shareWithTribe: true,
      workoutName: ''
    });
    setUseAI(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type === 'custom') {
      setStep(2);
    } else {
      // Auto-select some exercises for predefined types
      const typeData = workoutTypes[type];
      setSelectedExercises(typeData.exercises.slice(0, 4));
      setWorkoutDetails(prev => ({
        ...prev,
        workoutName: typeData.name
      }));
      setStep(2);
    }
  };

  const toggleExercise = (exercise) => {
    setSelectedExercises(prev => 
      prev.includes(exercise) 
        ? prev.filter(e => e !== exercise)
        : [...prev, exercise]
    );
  };

  const addCustomExercise = () => {
    if (customExercise.trim() && !selectedExercises.includes(customExercise.trim())) {
      setSelectedExercises(prev => [...prev, customExercise.trim()]);
      setCustomExercise('');
    }
  };

  const handleSchedule = async () => {
    if (!selectedType || selectedExercises.length === 0) {
      toast.error('Please select workout type and exercises');
      return;
    }

    try {
      const scheduleData = {
        date: selectedDate,
        time: workoutDetails.time,
        workout_type: selectedType,
        workout_name: workoutDetails.workoutName || workoutTypes[selectedType]?.name || 'Custom Workout',
        exercises: selectedExercises,
        duration: workoutDetails.duration,
        shared: workoutDetails.shareWithTribe,
        user_id: 'current-user', // Will be set by API
        user_name: 'You'
      };

      await onSchedule(scheduleData);
      toast.success('Workout scheduled successfully! 📅');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to schedule workout:', error);
      toast.error('Failed to schedule workout');
    }
  };

  const handleAIGenerate = () => {
    setUseAI(true);
    toast.info('AI Generation feature coming soon! 🤖');
    // This would integrate with the existing WorkoutGenerator
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Schedule Workout - ${selectedDate}`} size="lg">
      <div className="max-h-[75vh] overflow-y-auto">
        <div className="space-y-6 p-1">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step ? 'bg-primary text-white' : 'bg-surface-700 text-surface-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-1 ml-2 ${
                    stepNum < step ? 'bg-primary' : 'bg-surface-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Workout Type Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-surface-50 mb-2">Choose Workout Type</h3>
                <p className="text-surface-400 text-sm">Select the type of workout you want to schedule</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(workoutTypes).map(([key, type]) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleTypeSelect(key)}
                      className={`p-4 bg-surface-800 hover:bg-surface-700 rounded-xl border-2 border-surface-600 hover:border-primary transition-all`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <IconComponent size={24} className={type.color} />
                        <span className="font-medium text-surface-100 text-sm">{type.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-surface-700">
                <Button
                  onClick={handleAIGenerate}
                  variant="accent"
                  className="w-full"
                >
                  <Sparkles size={16} />
                  Generate with AI
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Exercise Selection */}
          {step === 2 && selectedType && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-surface-50">
                  Select Exercises - {workoutTypes[selectedType].name}
                </h3>
                <button
                  onClick={() => setStep(1)}
                  className="text-surface-400 hover:text-surface-200 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Available Exercises */}
              {workoutTypes[selectedType].exercises.length > 0 && (
                <div>
                  <h4 className="font-medium text-surface-200 mb-3">Recommended Exercises</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {workoutTypes[selectedType].exercises.map((exercise) => (
                      <button
                        key={exercise}
                        onClick={() => toggleExercise(exercise)}
                        className={`p-3 text-left text-sm rounded-lg border transition-all ${
                          selectedExercises.includes(exercise)
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
                        }`}
                      >
                        {exercise}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Exercise Input */}
              <div>
                <h4 className="font-medium text-surface-200 mb-3">Add Custom Exercise</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customExercise}
                    onChange={(e) => setCustomExercise(e.target.value)}
                    className="flex-1 p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter exercise name"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomExercise()}
                  />
                  <Button
                    onClick={addCustomExercise}
                    variant="ghost"
                    disabled={!customExercise.trim()}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {/* Selected Exercises */}
              {selectedExercises.length > 0 && (
                <div>
                  <h4 className="font-medium text-surface-200 mb-3">
                    Selected Exercises ({selectedExercises.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedExercises.map((exercise) => (
                      <div
                        key={exercise}
                        className="flex items-center justify-between bg-surface-800 p-2 rounded-lg"
                      >
                        <span className="text-surface-200 text-sm">{exercise}</span>
                        <button
                          onClick={() => toggleExercise(exercise)}
                          className="text-surface-400 hover:text-red-400 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  variant="primary"
                  disabled={selectedExercises.length === 0}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Workout Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-surface-50">Workout Details</h3>
                <button
                  onClick={() => setStep(2)}
                  className="text-surface-400 hover:text-surface-200 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Workout Name */}
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">
                    Workout Name
                  </label>
                  <input
                    type="text"
                    value={workoutDetails.workoutName}
                    onChange={(e) => setWorkoutDetails(prev => ({ ...prev, workoutName: e.target.value }))}
                    className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter workout name"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">
                    <Clock size={16} className="inline mr-2" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={workoutDetails.time}
                    onChange={(e) => setWorkoutDetails(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">
                    Duration (minutes)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="15"
                      max="120"
                      step="15"
                      value={workoutDetails.duration}
                      onChange={(e) => setWorkoutDetails(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-primary font-bold min-w-[4rem] text-center">
                      {workoutDetails.duration} min
                    </span>
                  </div>
                </div>

                {/* Share with Tribe */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-surface-200">
                    <Users size={16} className="inline mr-2" />
                    Share with Tribe
                  </label>
                  <button
                    onClick={() => setWorkoutDetails(prev => ({ ...prev, shareWithTribe: !prev.shareWithTribe }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      workoutDetails.shareWithTribe ? 'bg-primary' : 'bg-surface-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        workoutDetails.shareWithTribe ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-surface-800 rounded-lg p-4 border border-surface-600">
                <h4 className="font-medium text-surface-200 mb-2">Summary</h4>
                <div className="text-sm text-surface-400 space-y-1">
                  <div>Workout: {workoutDetails.workoutName || workoutTypes[selectedType]?.name}</div>
                  <div>Time: {workoutDetails.time} • Duration: {workoutDetails.duration} min</div>
                  <div>Exercises: {selectedExercises.length} selected</div>
                  <div>Visibility: {workoutDetails.shareWithTribe ? 'Shared with tribe' : 'Private'}</div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="ghost"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSchedule}
                  variant="primary"
                  className="flex-1"
                >
                  <Calendar size={16} />
                  Schedule Workout
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Modal>
  );
}