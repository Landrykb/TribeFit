import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { WorkoutScheduler } from './WorkoutScheduler';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, 
  Users, Clock, Eye, EyeOff, ArrowLeft, Save
} from 'lucide-react';

export function WorkoutCalendar({ isOpen, onClose }) {
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTribeWorkouts, setShowTribeWorkouts] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  
  // Mock workout data for tribe members
  const [workoutSchedule, setWorkoutSchedule] = useState({
    '2024-01-15': [
      { user: 'Alex Chen', time: '07:00', workout: 'Push/Pull/Legs', shared: true },
      { user: 'Jordan Kim', time: '18:30', workout: 'Cardio HIIT', shared: true }
    ],
    '2024-01-16': [
      { user: 'Sarah Wilson', time: '06:30', workout: 'Yoga Flow', shared: true },
      { user: 'Alex Chen', time: '19:00', workout: 'Upper Body', shared: false }
    ],
    '2024-01-17': [
      { user: 'Mike Torres', time: '12:00', workout: 'Full Body', shared: true },
      { user: 'Jordan Kim', time: '17:00', workout: 'Lower Body', shared: true }
    ]
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getWorkoutsForDate = (date) => {
    const dateStr = formatDate(date);
    return workoutSchedule[dateStr] || [];
  };

  const handleScheduleWorkout = async (scheduleData) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local schedule
        const dateStr = scheduleData.date;
        if (!workoutSchedule[dateStr]) {
          workoutSchedule[dateStr] = [];
        }
        workoutSchedule[dateStr].push({
          user: scheduleData.user_name,
          time: scheduleData.time,
          workout: scheduleData.workout_name,
          shared: scheduleData.shared
        });
        
        setWorkoutSchedule({...workoutSchedule});
        toast.success(`Workout scheduled for ${scheduleData.date}! 📅`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to schedule workout');
      }
    } catch (error) {
      console.error('Schedule workout failed:', error);
      toast.error('Failed to schedule workout');
    }
  };

  const addWorkout = (date) => {
    const timeInput = prompt('Enter workout time (HH:MM):', '07:00');
    if (!timeInput) return;
    
    const workoutInput = prompt('Enter workout name:', 'Morning Workout');
    if (!workoutInput) return;
    
    const shareWithTribe = confirm('Share with tribe members?');
    
    const dateStr = formatDate(date);
    const newWorkout = {
      user: 'You',
      time: timeInput,
      workout: workoutInput,
      shared: shareWithTribe
    };
    
    // In a real app, this would save to backend
    if (!workoutSchedule[dateStr]) {
      workoutSchedule[dateStr] = [];
    }
    workoutSchedule[dateStr].push(newWorkout);
    
    toast.success(`Workout scheduled for ${date.toLocaleDateString()}! 📅`);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tribe Workout Calendar" size="2xl">
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-surface-50">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTribeWorkouts(!showTribeWorkouts)}
            >
              {showTribeWorkouts ? <Eye size={16} /> : <EyeOff size={16} />}
              Tribe Workouts
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-surface-700 rounded-lg overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-surface-800">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-surface-300 border-r border-surface-700 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate).map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = formatDate(date) === formatDate(new Date());
              const workouts = getWorkoutsForDate(date);
              const hasWorkouts = workouts.length > 0;

              return (
                <div
                  key={index}
                  className={`relative h-20 border-r border-b border-surface-700 last:border-r-0 ${
                    isCurrentMonth ? 'bg-surface-900' : 'bg-surface-800/50'
                  } ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
                >
                  <div className="p-1 h-full flex flex-col">
                    <div className="flex justify-between items-start">
                      <span className={`text-xs ${
                        isCurrentMonth ? 'text-surface-200' : 'text-surface-500'
                      } ${isToday ? 'font-bold text-primary' : ''}`}>
                        {date.getDate()}
                      </span>
                      {isCurrentMonth && (
                        <button
                          onClick={() => {
                            setScheduleForm({
                              ...scheduleForm,
                              date: formatDate(date)
                            });
                            setShowScheduleModal(true);
                          }}
                          className="p-1 hover:bg-surface-700 rounded text-primary hover:text-primary-400 transition-colors"
                          title="Schedule workout"
                        >
                          <Plus size={10} />
                        </button>
                      )}
                    </div>
                    
                    {/* Workout indicators */}
                    <div className="flex-1 overflow-hidden">
                      {showTribeWorkouts && workouts.slice(0, 2).map((workout, i) => (
                        <div
                          key={i}
                          className={`text-xs p-1 mb-1 rounded truncate ${
                            workout.shared 
                              ? 'bg-primary/20 text-primary border border-primary/30' 
                              : 'bg-surface-700 text-surface-300'
                          }`}
                          title={`${workout.user} - ${workout.workout} at ${workout.time}`}
                        >
                          <div className="flex items-center space-x-1">
                            {workout.shared && <Users size={8} />}
                            <span className="truncate">{workout.time}</span>
                          </div>
                        </div>
                      ))}
                      {workouts.length > 2 && (
                        <div className="text-xs text-surface-400">
                          +{workouts.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary/20 border border-primary/30 rounded"></div>
              <span className="text-surface-400">Shared with tribe</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-surface-700 rounded"></div>
              <span className="text-surface-400">Private workout</span>
            </div>
          </div>
          
          <div className="text-surface-500">
            Click + to schedule a workout
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3 pt-4 border-t border-surface-700">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const today = new Date();
              addWorkout(today);
            }}
            className="flex-1"
          >
            <Calendar size={16} />
            Schedule Today
          </Button>
        </div>
      </div>
    </Modal>
  );
}