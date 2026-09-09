import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { 
  Play, Pause, SkipForward, Check, Timer, 
  Dumbbell, Trophy, Coins, Tv, Zap, Footprints, Bike, MonitorPlay
} from 'lucide-react';
import { Confetti } from './Confetti';
import { PowerBurst } from './PowerBurst';

export function WorkoutSession({ isOpen, onClose, workoutData, userId, groupId, userName }) {
  const toast = useToast();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState([]);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [showSkipOptions, setShowSkipOptions] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [activityType, setActivityType] = useState('workout');

  // Normalize plan shape (direct or nested under workoutPlan)
  const plan = workoutData && typeof workoutData === 'object'
    ? (workoutData.workoutPlan ? workoutData.workoutPlan : workoutData)
    : null;

  // Mock workout exercises (fallback)
  const defaultExercises = [
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

  const exercises = Array.isArray(plan?.exercises) && plan.exercises.length > 0
    ? plan.exercises.map((ex) => ({
        name: ex.name || 'Exercise',
        sets: Number(ex.sets || 3),
        reps: ex.reps || '10-12',
        restTime: (() => {
          const r = String(ex.rest || '').match(/(\d+)/);
          return r ? Number(r[1]) : 60;
        })(),
        instructions: ex.description || 'Perform with controlled form.'
      }))
    : defaultExercises;

  const currentExerciseData = exercises[currentExercise];
  const isLastExercise = currentExercise === exercises.length - 1;

  // Derive display title and estimated duration
  const plannedTitle = plan?.title || "Today's Workout";
  const estimatedMinutes = typeof plan?.duration === 'number'
    ? plan.duration
    : Math.max(
        Math.round(
          exercises.reduce((total, ex) => {
            const sets = Number(ex.sets || 1);
            const rest = Number(ex.restTime || 0);
            // Approx 45s per set effort + rest
            return total + sets * 45 + sets * rest;
          }, 0) / 60
        ),
        5
      );

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            setIsRunning(false);
            setShowSkipOptions(false);
            toast.success('Rest complete! Ready for next set!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    return () => {
      if (isWatchingAd) {
        setIsWatchingAd(false);
        setAdProgress(0);
      }
    };
  }, []);

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
    toast.success('Workout started! Let\'s go!');
  };

  const completeSet = () => {
    const newCompletedSet = {
      exercise: currentExercise,
      set: currentSet
    };
    setCompletedSets(prev => [...prev, newCompletedSet]);
    
    if (currentSet < currentExerciseData.sets) {
      // More sets in current exercise
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setTimeLeft(currentExerciseData.restTime);
      setIsRunning(true);
      toast.info(`Set ${currentSet} complete! Rest for ${currentExerciseData.restTime}s`);
    } else if (currentExercise < exercises.length - 1) {
      // Move to next exercise
      setCurrentExercise(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(true);
      setTimeLeft(exercises[currentExercise + 1].restTime);
      setIsRunning(true);
      toast.success(`${currentExerciseData.name} complete! Moving to ${exercises[currentExercise + 1].name}`);
    } else {
      // Workout complete
      completeWorkout();
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setIsRunning(false);
    setTimeLeft(0);
    setShowSkipOptions(false);
    toast.success('Rest skipped!');
  };

  const handlePayToSkip = () => {
    // Mock payment logic - in real app, integrate with payment system
    toast.success('Paid 5 TC to skip rest!');
    skipRest();
  };

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setAdProgress(0);
    
    // Simulate 10-second ad
    const adInterval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(adInterval);
          setIsWatchingAd(false);
          toast.success('Ad completed! Rest skipped!');
          skipRest();
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  const completeWorkout = async () => {
    setWorkoutStarted(false);
    setCelebrating(true);
    toast.success('Workout Complete! Amazing work!');
    
    // Persist session results
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || 'dev_user',
          title: plannedTitle || 'Workout',
          duration_sec: totalWorkoutTime,
          completed_sets: completedSets.length,
          type: activityType,
          date: new Date().toISOString(),
        })
      });
      
      if (!res.ok) {
        console.error('Failed to save progress:', await res.text());
      }
    } catch (err) {
      console.error('Progress save error:', err);
    }

    // Broadcast completion to group (Virtual Gym presence)
    try {
      if (groupId && userId) {
        await fetch('/api/events/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: groupId || 'default',
            type: 'workout_completed',
            originUserId: userId,
            data: { originUserName: userName || 'Member' }
          })
        }).catch(err => console.error('Broadcast error:', err));
      }
    } catch (err) {
      console.error('Broadcast error:', err);
    }

    setTimeout(() => { if (onClose) onClose(); }, 2000);
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
      {celebrating && <><PowerBurst /><Confetti count={50} /></>}
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="space-y-6 p-1">
          {/* Workout Header */}
          <div className="text-center p-6 bg-surface-800/60 border border-primary/25 rounded-2xl">
            <h2 className="text-2xl font-bold text-primary mb-3">
              {workoutStarted ? 'Workout In Progress' : 'Ready to Start?'}
            </h2>
            <div className="text-primary text-xl font-bold bg-primary/20 light:bg-primary-100 light:text-primary-800 px-4 py-2 rounded-xl inline-block">
              Total Time: {formatTotalTime(totalWorkoutTime)}
            </div>
          </div>
        {!workoutStarted ? (
          <div className="text-center py-8">
            {/* Activity type picker — original styles: outdoor, treadmill, etc. */}
            <div className="mb-6">
              <div className="text-xs text-surface-400 uppercase tracking-wider mb-2">Activity type</div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { id: 'workout',       label: 'Gym',      Icon: Dumbbell },
                  { id: 'run_outdoor',   label: 'Outdoor run', Icon: Footprints },
                  { id: 'run_treadmill', label: 'Treadmill', Icon: MonitorPlay },
                  { id: 'walk',          label: 'Walk',     Icon: Footprints },
                  { id: 'cycle',         label: 'Cycle',    Icon: Bike },
                  { id: 'sports',        label: 'Sports',   Icon: Trophy },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActivityType(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      activityType === id
                        ? 'bg-primary/20 border-primary text-primary-200 scale-105'
                        : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
                    }`}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <Dumbbell size={72} className="text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-surface-50 mb-3">
                {workoutData?.title ? workoutData.title : plannedTitle}
              </h3>
              <p className="text-surface-300 light:text-gray-600 text-lg">
                {exercises.length} exercises • estimated {workoutData?.durationMin ? workoutData.durationMin : estimatedMinutes} minutes
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              {exercises.map((exercise, index) => (
                <div key={index} className="bg-gradient-to-br from-surface-700/50 to-surface-800/50 light:bg-white light:border-gray-200 border border-surface-600/50 rounded-xl p-4 text-left hover-elevate transition-all duration-200">
                  <div className="font-bold text-surface-100 light:text-gray-900 text-lg">{exercise.name}</div>
                  <div className="text-sm text-surface-300 light:text-gray-600 mt-1">
                    {exercise.sets} sets × {exercise.reps} reps
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={startWorkout} variant="primary" className="w-full h-14 text-lg font-bold">
              <Play size={24} />
              Start Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="bg-surface-800 light:bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-surface-400 light:text-gray-600">Exercise Progress</span>
                <span className="text-sm text-surface-400 light:text-gray-600">
                  {currentExercise + 1} of {exercises.length}
                </span>
              </div>
              <div className="w-full bg-surface-700 light:bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Exercise */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-surface-50 light:text-gray-900 mb-2">
                {currentExerciseData.name}
              </h3>
              <div className="text-lg text-primary mb-4">
                Set {currentSet} of {currentExerciseData.sets} • {currentExerciseData.reps} reps
              </div>
              <div className="bg-surface-800 light:bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-surface-300 light:text-gray-600 text-sm">
                  {currentExerciseData.instructions}
                </p>
              </div>
            </div>

            {/* Timer Display */}
            {isResting && (
              <div className="text-center">
                <div className="bg-accent/20 light:bg-accent-50 border border-accent light:border-accent-200 rounded-xl p-6 mb-4">
                  <Timer size={32} className="text-accent mx-auto mb-2" />
                  <div className="text-3xl font-bold text-accent mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-surface-300 light:text-gray-600">Rest Time</div>
                </div>
                
                <div className="space-y-3">
                  {/* Rest Timer Controls - Removed Skip Options (not useful) */}
                  <Button 
                    onClick={() => setIsRunning(!isRunning)}
                    variant="ghost"
                    className="w-full h-12"
                  >
                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                    {isRunning ? 'Pause' : 'Resume'}
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
              <div className="bg-surface-800 light:bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-surface-200 light:text-gray-800 mb-3">Completed Sets</h4>
                <div className="space-y-1">
                  {completedSets.map((set, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-surface-300 light:text-gray-600">
                        {exercises[set.exercise].name} - Set {set.set}
                      </span>
                      <Check size={14} className="text-success" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Emergency Actions */}
        <div className="flex space-x-3 pt-4 border-t border-surface-700 light:border-gray-200">
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
      </div>
    </Modal>
  );
}