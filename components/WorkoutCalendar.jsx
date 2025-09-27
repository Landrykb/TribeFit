import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { WorkoutScheduler } from './WorkoutScheduler';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, 
  Users, Clock, Eye, EyeOff, ArrowLeft, Save
} from 'lucide-react';

export function WorkoutCalendar({ isOpen, onClose, user }) {
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTribeWorkouts, setShowTribeWorkouts] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  
  // Enhanced mock workout data - multiple entries per day
  const [workoutSchedule, setWorkoutSchedule] = useState({
    '2024-01-15': [
      { id: 1, user: 'Alex Chen', time: '07:00', workout: 'Push/Pull/Legs', shared: true, duration: '45 min' },
      { id: 2, user: 'Alex Chen', time: '12:00', workout: 'Cardio Walk', shared: false, duration: '20 min' },
      { id: 3, user: 'Jordan Kim', time: '18:30', workout: 'Cardio HIIT', shared: true, duration: '30 min' }
    ],
    '2024-01-16': [
      { id: 4, user: 'Sarah Wilson', time: '06:30', workout: 'Yoga Flow', shared: true, duration: '60 min' },
      { id: 5, user: 'Alex Chen', time: '19:00', workout: 'Upper Body', shared: false, duration: '40 min' },
      { id: 6, user: 'Alex Chen', time: '20:30', workout: 'Stretching', shared: true, duration: '15 min' }
    ],
    '2024-01-17': [
      { id: 7, user: 'Mike Torres', time: '12:00', workout: 'Full Body', shared: true, duration: '50 min' },
      { id: 8, user: 'Jordan Kim', time: '17:00', workout: 'Lower Body', shared: true, duration: '35 min' },
      { id: 9, user: 'Mike Torres', time: '17:30', workout: 'Core Blast', shared: false, duration: '15 min' }
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
          id: Date.now(),
          user: scheduleData.user_name,
          time: scheduleData.time,
          workout: scheduleData.workout_name,
          shared: scheduleData.shared,
          duration: scheduleData.duration || '45 min'
        });
        
        setWorkoutSchedule({...workoutSchedule});
        toast.success(`Workout scheduled for ${scheduleData.date}! 📅`);
        setShowScheduler(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to schedule workout');
      }
    } catch (error) {
      console.error('Schedule workout failed:', error);
      toast.error('Failed to schedule workout');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tribe Workout Calendar" size="2xl">
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Calendar Header - Fixed at top */}
        <div className="sticky top-0 bg-surface-900 z-10 pb-4">
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
        </div>

        {/* Calendar Grid - Scrollable */}
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
                  className={`relative h-24 border-r border-b border-surface-700 last:border-r-0 ${
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
                            setSelectedDate(formatDate(date));
                            setShowScheduler(true);
                          }}
                          className="p-1 hover:bg-surface-700 rounded text-primary hover:text-primary-400 transition-colors"
                          title="Schedule workout"
                        >
                          <Plus size={10} />
                        </button>
                      )}
                    </div>
                    
                    {/* Enhanced workout indicators - Shows more workouts */}
                    <div className="flex-1 overflow-hidden">
                      {showTribeWorkouts && workouts.slice(0, 3).map((workout, i) => (
                        <div
                          key={workout.id || i}
                          className={`text-xs p-1 mb-1 rounded truncate ${
                            workout.shared 
                              ? 'bg-primary/20 text-primary border border-primary/30' 
                              : 'bg-surface-700 text-surface-300'
                          }`}
                          title={`${workout.user} - ${workout.workout} at ${workout.time} (${workout.duration})`}
                        >
                          <div className="flex items-center space-x-1">
                            {workout.shared && <Users size={6} />}
                            <span className="truncate font-medium">{workout.time}</span>
                          </div>
                          <div className="truncate text-[10px] opacity-75">
                            {workout.workout}
                          </div>
                        </div>
                      ))}
                      {workouts.length > 3 && (
                        <div className="text-xs text-surface-400 text-center">
                          +{workouts.length - 3} more
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
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="sticky bottom-0 bg-surface-900 pt-4 border-t border-surface-700">
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            <ArrowLeft size={16} />
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const today = new Date();
              setSelectedDate(formatDate(today));
              setShowScheduler(true);
            }}
            className="flex-1"
          >
            <Calendar size={16} />
            Schedule Today
          </Button>
        </div>
      </div>

      {/* Workout Scheduler Modal */}
      {showScheduler && (
        <WorkoutScheduler
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          selectedDate={selectedDate}
          onSchedule={handleScheduleWorkout}
        />
      )}
    </Modal>
  );
}