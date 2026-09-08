'use client';
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { WorkoutGenerator } from './WorkoutGenerator';
import { 
  Calendar, Clock, Users, Eye, EyeOff, ArrowLeft, 
  Save, Zap, Dumbbell, Plus, X, Star
} from 'lucide-react';

export function WorkoutScheduler({ isOpen, onClose, selectedDate, onSchedule, user, userId, customWorkouts = [] }) {
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);
  const toast = useToast();
  const [workoutData, setWorkoutData] = useState({
    date: selectedDate || '',
    time: '07:00',
    workout_name: '',
    workout_type: 'custom',
    duration: '45 min',
    shared: true,
    user_name: user?.name || 'You',
    user_id: user?.id || '00000000-0000-0000-0000-000000000001'
  });

  // Update date when selectedDate prop changes
  React.useEffect(() => {
    if (selectedDate && selectedDate !== workoutData.date) {
      setWorkoutData(prev => ({
        ...prev,
        date: selectedDate
      }));
    }
  }, [selectedDate]);

  // Default time to next 15-minute slot when opening or date changes
  React.useEffect(() => {
    if (!isOpen) return;
    try {
      // Local date string to avoid UTC off-by-one
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const base = new Date();
      if (selectedDate && selectedDate !== todayStr) {
        // use 07:00 for non-today dates unless user already changed
        setWorkoutData(prev => ({ ...prev, time: prev.time || '07:00', date: prev.date || selectedDate }));
        return;
      }
      // next quarter hour
      const minutes = base.getMinutes();
      const next = Math.ceil((minutes + 1) / 15) * 15; // +1 to avoid immediate minute
      if (next >= 60) {
        base.setHours(base.getHours() + 1);
        base.setMinutes(0);
      } else {
        base.setMinutes(next);
      }
      const hh = String(base.getHours()).padStart(2, '0');
      const mm = String(base.getMinutes()).padStart(2, '0');
      setWorkoutData(prev => ({ ...prev, time: prev.time && prev.time !== '07:00' ? prev.time : `${hh}:${mm}` }));
    } catch {}
  }, [isOpen, selectedDate]);

  // Update user info when user prop changes
  React.useEffect(() => {
    if (user) {
      setWorkoutData(prev => ({
        ...prev,
        user_id: user.id || '00000000-0000-0000-0000-000000000001',
        user_name: user.name || 'You'
      }));
    }
  }, [user]);

  // Override user id from prop if provided
  React.useEffect(() => {
    if (userId) {
      setWorkoutData(prev => ({ ...prev, user_id: userId }));
    }
  }, [userId]);

  const predefinedWorkouts = [
    { name: 'Push/Pull/Legs', duration: '45 min', type: 'strength' },
    { name: 'Full Body HIIT', duration: '30 min', type: 'cardio' },
    { name: 'Upper Body Strength', duration: '40 min', type: 'strength' },
    { name: 'Yoga Flow', duration: '60 min', type: 'flexibility' },
    { name: 'Cardio Blast', duration: '25 min', type: 'cardio' },
    { name: 'Lower Body Power', duration: '35 min', type: 'strength' }
  ];

  const handleSchedule = async () => {
    // Validate all required fields
    if (!workoutData.workout_name || !workoutData.time || !workoutData.date || !workoutData.user_id) {
      toast.error('Please fill in workout name, date, time.');
      return;
    }
    
    try {
      // Ensure all required fields are included
      const schedulePayload = {
        date: workoutData.date,
        time: workoutData.time,
        workout_name: workoutData.workout_name,
        workout_type: workoutData.workout_type,
        user_id: workoutData.user_id,
        user_name: workoutData.user_name,
        shared: workoutData.shared,
        duration: workoutData.duration,
        ai_plan: workoutData.ai_plan || null
      };
      
      const result = await onSchedule(schedulePayload);
      
      if (result !== false) { // onSchedule returns false on error
        onClose();
      }
    } catch (error) {
      console.error('Failed to schedule workout:', error);
      toast.error('Failed to schedule workout');
    }
  };

  const handleAIWorkoutGenerated = (plan) => {
    setWorkoutData(prev => ({
      ...prev,
      workout_name: `AI Generated: ${plan.goals || 'Custom Workout'}`,
      workout_type: 'ai-generated',
      ai_plan: plan
    }));
    setShowWorkoutGenerator(false);
  };

  if (showWorkoutGenerator) {
    return (
      <WorkoutGenerator
        isOpen={showWorkoutGenerator}
        onClose={() => setShowWorkoutGenerator(false)}
        onPlanGenerated={handleAIWorkoutGenerated}
        mode="scheduler" // Special mode for scheduler
      />
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Schedule Workout" 
      size="lg"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Date and Time */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={workoutData.date}
              onChange={(e) => setWorkoutData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 focus:ring-2 focus:ring-primary focus:border-transparent light:bg-white light:border-gray-300 light:text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
              <Clock size={16} className="inline mr-2" />
              Time
            </label>
            <input
              type="time"
              value={workoutData.time}
              onChange={(e) => setWorkoutData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 focus:ring-2 focus:ring-primary focus:border-transparent light:bg-white light:border-gray-300 light:text-gray-900"
            />
          </div>
        </div>

        {/* Workout Selection */}
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-3">
            <Dumbbell size={16} className="inline mr-2" />
            Choose Workout
          </label>
          
          <div className="space-y-3">
            {/* AI Generate Option */}
            <button
              onClick={() => setShowWorkoutGenerator(true)}
              className="w-full p-4 bg-gradient-to-r from-primary/20 to-accent/20 light:bg-gradient-to-r light:from-primary-50 light:to-surface-50 border border-primary/30 light:border-primary-200 rounded-lg hover:from-primary/30 hover:to-accent/30 light:hover:from-primary-100 light:hover:to-surface-100 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 light:bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary/30 light:group-hover:bg-primary-200 transition-colors">
                  <Zap size={20} className="text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-surface-50 light:text-gray-900">AI Generate Workout</div>
                  <div className="text-sm text-surface-400 light:text-gray-600">Create a personalized workout plan</div>
                </div>
                <Plus size={16} className="text-primary" />
              </div>
            </button>
            
            {/* My Custom Workouts */}
            {customWorkouts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-surface-200 light:text-gray-700">
                  <Star size={14} className="text-success" />
                  <span>My Workouts</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {customWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => setWorkoutData(prev => ({ 
                        ...prev, 
                        workout_name: workout.name,
                        workout_type: 'custom',
                        duration: `${workout.duration} min`
                      }))}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        workoutData.workout_name === workout.name
                          ? 'bg-success/20 border-success text-success'
                          : 'bg-surface-800 light:bg-white border-surface-700 light:border-gray-300 text-surface-300 light:text-gray-700 hover:border-success/50 hover:bg-surface-700 light:hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{workout.name}</div>
                            <span className="text-xs px-1.5 py-0.5 bg-success/20 text-success rounded">
                              Custom
                            </span>
                          </div>
                          <div className="text-sm opacity-75 mt-0.5">
                            {workout.duration} min • {workout.exercises?.length || 0} exercises
                          </div>
                        </div>
                        {workoutData.workout_name === workout.name && (
                          <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                            <Star size={12} fill="white" className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Predefined Workouts */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-surface-200 light:text-gray-700">Templates</div>
              <div className="grid grid-cols-1 gap-2">
                {predefinedWorkouts.map((workout, index) => (
                  <button
                    key={index}
                    onClick={() => setWorkoutData(prev => ({ 
                      ...prev, 
                      workout_name: workout.name,
                      workout_type: 'predefined'
                    }))}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      workoutData.workout_name === workout.name
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface-800 light:bg-white border-surface-700 light:border-gray-300 text-surface-300 light:text-gray-700 hover:border-surface-600 hover:bg-surface-700 light:hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{workout.name}</div>
                        <div className="text-sm opacity-75">{workout.duration} • {workout.type}</div>
                      </div>
                      {workoutData.workout_name === workout.name && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom Workout Input */}
            <div>
              <label className="block text-sm text-surface-400 mb-2">Or enter custom workout:</label>
              <input
                type="text"
                value={workoutData.workout_type === 'custom' ? workoutData.workout_name : ''}
                onChange={(e) => setWorkoutData(prev => ({ 
                  ...prev, 
                  workout_name: e.target.value,
                  workout_type: 'custom'
                }))}
                placeholder="e.g., Morning Stretches, Beach Run, Home HIIT..."
                className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sharing Options */}
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-3">
            <Users size={16} className="inline mr-2" />
            Visibility
          </label>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setWorkoutData(prev => ({ ...prev, shared: true }))}
              className={`flex-1 p-3 rounded-lg border transition-all ${
                workoutData.shared
                  ? 'bg-success/20 border-success text-success'
                  : 'bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Eye size={16} />
                <span>Share with tribe</span>
              </div>
            </button>
            
            <button
              onClick={() => setWorkoutData(prev => ({ ...prev, shared: false }))}
              className={`flex-1 p-3 rounded-lg border transition-all ${
                !workoutData.shared
                  ? 'bg-warning/20 border-warning text-warning'
                  : 'bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <EyeOff size={16} />
                <span>Keep private</span>
              </div>
            </button>
          </div>
        </div>

        {/* Selected Workout Summary */}
        {workoutData.workout_name && (
          <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-50 mb-2">Workout Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">Date:</span>
                <span className="text-surface-200">{workoutData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Time:</span>
                <span className="text-surface-200">{workoutData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Workout:</span>
                <span className="text-surface-200">{workoutData.workout_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Visibility:</span>
                <span className={workoutData.shared ? 'text-success' : 'text-warning'}>
                  {workoutData.shared ? 'Shared with tribe' : 'Private'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-6 border-t border-surface-700">
        <Button
          onClick={onClose}
          variant="ghost"
          className="flex-1"
        >
          <ArrowLeft size={16} />
          Cancel
        </Button>
        
        <Button
          onClick={handleSchedule}
          variant="primary"
          className="flex-1"
          disabled={!workoutData.workout_name || !workoutData.date || !workoutData.time}
        >
          <Save size={16} />
          Schedule Workout
        </Button>
      </div>
    </Modal>
  );
}