import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { 
  Play, Pause, SkipForward, Check, Timer, 
  Dumbbell, Trophy 
} from 'lucide-react';

export function WorkoutSession({ isOpen, onClose, workoutData }) {
  const toast = useToast();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState([]);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);

  // Mock workout exercises
  const exercises = workoutData?.exercises || [
    {
      name: 'Push-ups',
      sets: 3,
      reps: 12,
      restTime: 60,
      instructions: 'Keep your body straight, lower chest to ground, push up'
    },
    {
      name: 'Squats', 
      sets: 3,
      reps: 15,
      restTime: 90,
      instructions: 'Feet shoulder-width apart, lower until thighs parallel to ground'
    },
    {
      name: 'Plank',
      sets: 3,
      reps: '30 seconds',
      restTime: 60,
      instructions: 'Hold straight line from head to heels, engage core'
    },
    {
      name: 'Jumping Jacks',
      sets: 3,
      reps: 20,
      restTime: 45,
      instructions: 'Jump feet apart while raising arms, return to start'
    }
  ];

  const currentExerciseData = exercises[currentExercise];
  const isLastExercise = currentExercise === exercises.length - 1;
  const isLastSet = currentSet === currentExerciseData?.sets;

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false);
            if (isResting) {
              toast.success('Rest complete! Ready for next set 💪');
              setIsResting(false);
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isResting, toast]);

  useEffect(() => {
    let totalTimer;
    if (workoutStarted) {
      totalTimer = setInterval(() => {
        setTotalWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(totalTimer);
  }, [workoutStarted]);

  const startWorkout = () => {
    setWorkoutStarted(true);
    toast.success('Workout started! Let us go! 🔥');
  };

  const completeSet = () => {
    const setData = {
      exercise: currentExercise,
      set: currentSet,
      reps: currentExerciseData.reps,
      completedAt: new Date()
    };
    
    setCompletedSets(prev => [...prev, setData]);
    
    if (isLastSet && isLastExercise) {
      // Workout complete
      completeWorkout();
    } else if (isLastSet) {
      // Move to next exercise
      setCurrentExercise(prev => prev + 1);
      setCurrentSet(1);
      toast.success(`${currentExerciseData.name} complete! Moving to next exercise 🎯`);
    } else {
      // Rest between sets
      setCurrentSet(prev => prev + 1);
      setTimeLeft(currentExerciseData.restTime);
      setIsResting(true);
      setIsRunning(true);
      toast.info(`Set ${currentSet} complete! Rest for ${currentExerciseData.restTime}s`);
    }
  };

  const skipRest = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsResting(false);
    toast.success('Rest skipped! Ready for next set 💨');
  };

  const completeWorkout = () => {
    setWorkoutStarted(false);
    toast.success('🎉 Workout Complete! Amazing work! 🏆');
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workout Session" size="xl">
      <div className="space-y-6">
        {/* Workout Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-50 mb-2">
            {workoutStarted ? 'Workout In Progress' : 'Ready to Start?'}
          </h2>
          <div className="text-primary text-lg font-semibold">
            Total Time: {formatTotalTime(totalWorkoutTime)}
          </div>
        </div>

        {!workoutStarted ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <Dumbbell size={64} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-surface-50 mb-2">Today&apos;s Workout</h3>
              <p className="text-surface-400">
                {exercises.length} exercises • Estimated {Math.round(exercises.reduce((total, ex) => 
                  total + (ex.sets * 45) + (ex.sets * ex.restTime), 0) / 60)} minutes
              </p>
            </div>
            
            <div className="space-y-3 mb-8">
              {exercises.map((exercise, index) => (
                <div key={index} className="bg-surface-800 rounded-lg p-3 text-left">
                  <div className="font-medium text-surface-100">{exercise.name}</div>
                  <div className="text-sm text-surface-400">
                    {exercise.sets} sets × {exercise.reps} reps
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={startWorkout} variant="primary" size="lg" className="w-full">
              <Play size={20} />
              Start Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="bg-surface-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-surface-400">Exercise Progress</span>
                <span className="text-sm text-surface-400">
                  {currentExercise + 1} of {exercises.length}
                </span>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Exercise */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-surface-50 mb-2">
                {currentExerciseData.name}
              </h3>
              <div className="text-lg text-primary mb-4">
                Set {currentSet} of {currentExerciseData.sets} • {currentExerciseData.reps} reps
              </div>
              <div className="bg-surface-800 rounded-lg p-4 mb-4">
                <p className="text-surface-300 text-sm">
                  {currentExerciseData.instructions}
                </p>
              </div>
            </div>

            {/* Timer Display */}
            {isResting && (
              <div className="text-center">
                <div className="bg-accent/20 border border-accent rounded-xl p-6 mb-4">
                  <Timer size={32} className="text-accent mx-auto mb-2" />
                  <div className="text-3xl font-bold text-accent mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-surface-300">Rest Time</div>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => setIsRunning(!isRunning)}
                    variant="ghost"
                    className="flex-1"
                  >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    {isRunning ? 'Pause' : 'Resume'}
                  </Button>
                  <Button 
                    onClick={skipRest}
                    variant="accent"
                    className="flex-1"
                  >
                    <SkipForward size={16} />
                    Skip Rest
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isResting && (
              <div className="flex space-x-3">
                <Button 
                  onClick={completeSet}
                  variant="success"
                  size="lg"
                  className="flex-1"
                >
                  <Check size={20} />
                  Complete Set
                </Button>
              </div>
            )}

            {/* Completed Sets Summary */}
            {completedSets.length > 0 && (
              <div className="bg-surface-800 rounded-lg p-4">
                <h4 className="font-medium text-surface-200 mb-3">Completed Sets</h4>
                <div className="space-y-1">
                  {completedSets.map((set, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-surface-300">
                        {exercises[set.exercise].name} - Set {set.set}
                      </span>
                      <span className="text-success">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Emergency Actions */}
        <div className="flex space-x-3 pt-4 border-t border-surface-700">
          <Button 
            onClick={onClose}
            variant="ghost"
            className="flex-1"
          >
            Exit Workout
          </Button>
          {workoutStarted && (
            <Button 
              onClick={completeWorkout}
              variant="primary"
              className="flex-1"
            >
              <Trophy size={16} />
              Finish Early
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}