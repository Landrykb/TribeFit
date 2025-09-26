'use client';
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { WorkoutGenerator } from './WorkoutGenerator';
import { 
  Calendar, Clock, Users, Eye, EyeOff, ArrowLeft, 
  Save, Zap, Dumbbell, Plus, X
} from 'lucide-react';

export function WorkoutScheduler({ isOpen, onClose, selectedDate, onSchedule }) {
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    date: selectedDate || '',
    time: '07:00',
    workout_name: '',
    workout_type: 'custom',
    shared: true,
    user_name: 'You'
  });

  const predefinedWorkouts = [
    { name: 'Push/Pull/Legs', duration: '45 min', type: 'strength' },
    { name: 'Full Body HIIT', duration: '30 min', type: 'cardio' },
    { name: 'Upper Body Strength', duration: '40 min', type: 'strength' },
    { name: 'Yoga Flow', duration: '60 min', type: 'flexibility' },
    { name: 'Cardio Blast', duration: '25 min', type: 'cardio' },
    { name: 'Lower Body Power', duration: '35 min', type: 'strength' }
  ];

  const handleSchedule = async () => {
    if (!workoutData.workout_name || !workoutData.time) return;
    
    try {
      await onSchedule(workoutData);
      onClose();
    } catch (error) {
      console.error('Failed to schedule workout:', error);
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
            <label className="block text-sm font-medium text-surface-200 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={workoutData.date}
              onChange={(e) => setWorkoutData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">
              <Clock size={16} className="inline mr-2" />
              Time
            </label>
            <input
              type="time"
              value={workoutData.time}
              onChange={(e) => setWorkoutData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full p-4 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg hover:from-primary/30 hover:to-accent/30 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Zap size={20} className="text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-surface-50">AI Generate Workout</div>
                  <div className="text-sm text-surface-400">Create a personalized workout plan</div>
                </div>
                <Plus size={16} className="text-primary" />
              </div>
            </button>
            
            {/* Predefined Workouts */}
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
                      : 'bg-surface-800 border-surface-700 text-surface-300 hover:border-surface-600 hover:bg-surface-700'
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