'use client';

import React, { useState, useEffect } from 'react';
import { useApi, optimisticMutate } from '../lib/api';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { Skeleton } from './ui/skeleton';
import { WorkoutScheduler } from './WorkoutScheduler';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, 
  Users, Clock, Eye, EyeOff, ArrowLeft, Save, Trash2, Pencil, X, Dumbbell
} from 'lucide-react';

export function WorkoutCalendar({ isOpen, onClose, user, userId, onChanged, customWorkouts = [] }) {
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTribeWorkouts, setShowTribeWorkouts] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  
  // Server-backed calendar schedule: { [YYYY-MM-DD]: [ { id, user_id, user_name, time, workout, type, shared, duration, ai_plan } ] }
  const [workoutSchedule, setWorkoutSchedule] = useState({});
  const [editOpen, setEditOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editItem, setEditItem] = useState(null); // full item from calendar
  const [editTime, setEditTime] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState('45 min');
  const [editShared, setEditShared] = useState(false);

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
    // Use local time to avoid UTC off-by-one issues
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const uid = userId || user?.id || 'dev_user';
  const scheduleUrl = isOpen ? `/api/calendar?user_id=${encodeURIComponent(uid)}` : null;
  const { data: scheduleData, loading, mutate } = useApi(scheduleUrl);

  // Paint from cache first, then revalidate in background
  useEffect(() => {
    if (scheduleData?.schedule) {
      setWorkoutSchedule(scheduleData.schedule);
    }
  }, [scheduleData]);

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
      // Ensure required user_id
      const payload = { ...scheduleData, user_id: scheduleData.user_id || uid };
      // Conflict check: same date/time
      const dateKey = payload.date;
      const timeKey = payload.time;
      const conflicts = Array.isArray(workoutSchedule[dateKey]) && workoutSchedule[dateKey].some(w => w.time === timeKey);
      if (conflicts) {
        toast.error('Time conflict: there is already a workout at that time');
        return false; // keep scheduler open
      }
      const tempItem = {
        id: `tmp_${Date.now()}`,
        ...payload,
        workout: payload.workout_name,
        type: payload.workout_type || 'general',
        user_name: user?.name || 'User',
      };
      const promise = fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to schedule workout');
        return json;
      });

      await optimisticMutate(scheduleUrl, (current) => {
        if (!current) return current;
        const schedule = { ...(current.schedule || {}) };
        const list = schedule[dateKey] ? [...schedule[dateKey]] : [];
        if (list.some(w => w.time === timeKey)) return current;
        schedule[dateKey] = [...list, tempItem];
        return { ...current, schedule };
      }, promise);

      toast.success(`Workout scheduled for ${payload.date}!`);
      setShowScheduler(false);
      try { onChanged && onChanged(); } catch {}
      return true;
    } catch (error) {
      console.error('Schedule workout failed:', error);
      toast.error(error.message || 'Failed to schedule workout');
      return false;
    }
  };

  const openEdit = (dateStr, item) => {
    setEditDate(dateStr);
    setEditItem(item);
    setEditTime(item.time || '00:00');
    setEditTitle(item.workout || 'Workout');
    setEditDuration(item.duration || '45 min');
    setEditShared(!!item.shared);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      const payload = {
        user_id: uid,
        id: editItem.id,
        date: editDate,
        time: editTime,
        workout_name: editTitle,
        duration: editDuration,
        shared: editShared,
      };
      const promise = fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'update failed');
        return json;
      });

      await optimisticMutate(scheduleUrl, (current) => {
        if (!current) return current;
        const schedule = { ...(current.schedule || {}) };
        const nextSchedule = {};
        for (const [d, list] of Object.entries(schedule)) {
          nextSchedule[d] = [...list];
        }
        // Remove from old date lists
        for (const d of Object.keys(nextSchedule)) {
          nextSchedule[d] = nextSchedule[d].filter(w => w.id !== editItem.id);
        }
        // Add updated item to target date
        const updated = { ...editItem, date: editDate, time: editTime, workout: editTitle, duration: editDuration, shared: editShared };
        nextSchedule[editDate] = [...(nextSchedule[editDate] || []), updated];
        return { ...current, schedule: nextSchedule };
      }, promise);

      toast.success('Workout updated');
      setEditOpen(false);
      try { onChanged && onChanged(); } catch {}
    } catch (e) {
      toast.error(e.message || 'Failed to update');
    }
  };

  const deleteItem = async (target = editItem) => {
    if (!target) return;
    try {
      const promise = fetch(`/api/calendar?user_id=${encodeURIComponent(uid)}&id=${encodeURIComponent(target.id)}`, {
        method: 'DELETE'
      }).then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'delete failed');
        return json;
      });

      await optimisticMutate(scheduleUrl, (current) => {
        if (!current) return current;
        const schedule = { ...(current.schedule || {}) };
        const nextSchedule = {};
        let removed = false;
        for (const [d, list] of Object.entries(schedule)) {
          const nextList = list.filter(w => w.id !== target.id);
          nextSchedule[d] = nextList;
          if (nextList.length !== list.length) removed = true;
        }
        return removed ? { ...current, schedule: nextSchedule } : current;
      }, promise);

      toast.success('Workout deleted');
      setEditOpen(false);
      try { onChanged && onChanged(); } catch {}
    } catch (e) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tribe Workout Calendar" size="2xl">
      {loading ? (
        <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Calendar Header - Fixed at top */}
        <div className="sticky top-0 bg-surface-900 light:bg-gray-50 z-10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-surface-50 light:text-gray-900 whitespace-nowrap truncate">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex space-x-1 flex-shrink-0">
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
                <span className="hidden sm:inline">Tribe Workouts</span>
                <span className="sm:hidden">Tribe</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid - Artistic & Responsive */}
        <div className="rounded-3xl p-2 bg-surface-800/40 light:bg-white/60 border-2 border-surface-700 light:border-gray-200 shadow-toon overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map(day => (
              <div key={day} className="py-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-surface-400 light:text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = formatDate(date) === formatDate(new Date());
              const isSelected = selectedDate === formatDate(date);
              const workouts = getWorkoutsForDate(date);

              return (
                <div
                  key={index}
                  onClick={() => isCurrentMonth && setSelectedDate(formatDate(date))}
                  className={`relative min-h-[4.5rem] sm:min-h-[6.5rem] rounded-xl p-1.5 flex flex-col transition-all duration-200 cursor-pointer ${
                    isCurrentMonth
                      ? 'bg-surface-900/80 light:bg-white hover:bg-surface-800/80 light:hover:bg-gray-50'
                      : 'bg-surface-800/30 light:bg-gray-100/60 text-surface-500 light:text-gray-400'
                  } ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-800 light:ring-offset-white z-10' : ''} ${
                    isSelected ? 'outline outline-2 outline-primary/60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-xs sm:text-sm font-medium ${
                      isCurrentMonth ? 'text-surface-200 light:text-gray-800' : 'text-surface-500 light:text-gray-400'
                    } ${isToday ? 'font-bold text-primary' : ''}`}>
                      {date.getDate()}
                    </span>
                    {isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(formatDate(date));
                          setShowScheduler(true);
                        }}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-surface-700/50 light:bg-gray-200 hover:bg-primary/20 light:hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                        title="Schedule workout"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  {/* Workout chips */}
                  <div className="flex-1 min-w-0 mt-1 space-y-1 overflow-hidden">
                    {showTribeWorkouts && workouts.slice(0, 3).map((workout, i) => (
                      <div
                        key={workout.id || i}
                        className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-lg border shadow-sm truncate w-full ${
                          workout.shared
                            ? 'bg-gradient-to-r from-primary/25 to-primary/10 border-primary/30 text-primary'
                            : 'bg-surface-700/70 light:bg-gray-200 text-surface-200 light:text-gray-700 border-surface-600/40 light:border-gray-300'
                        }`}
                        title={`${workout.user_name || workout.user || 'User'} - ${workout.workout} at ${workout.time} (${workout.duration})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(formatDate(date), workout);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {workout.shared && <Users size={8} />}
                          <span className="truncate font-medium">{workout.time}</span>
                        </div>
                        <div className="truncate text-[10px] opacity-80">
                          {workout.workout}
                        </div>
                      </div>
                    ))}
                    {workouts.length > 3 && (
                      <div className="text-[9px] sm:text-[10px] text-surface-400 light:text-gray-500 text-center font-medium">
                        +{workouts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail — expanded sheet */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -16, height: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-3xl border-2 border-surface-700/60 light:border-gray-200 bg-surface-800/60 light:bg-white/80 shadow-toon p-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h4 className="text-lg font-black text-surface-50 light:text-gray-900 leading-tight">
                      {(() => {
                        const [y, m, d] = selectedDate.split('-').map(Number);
                        const dateObj = new Date(y, m - 1, d);
                        return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                      })()}
                    </h4>
                    <p className="text-xs text-surface-400 light:text-gray-500 mt-0.5">
                      {workoutSchedule[selectedDate]?.length || 0} workout{(workoutSchedule[selectedDate]?.length || 0) === 1 ? '' : 's'} planned
                    </p>
                  </div>
                  <Button size="xs" variant="ghost" onClick={() => setSelectedDate(null)} className="rounded-full h-8 w-8 p-0 flex items-center justify-center">
                    <X size={16} />
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {(workoutSchedule[selectedDate] || []).map((w, i) => (
                      <motion.div
                        key={w.id || i}
                        layout
                        initial={{ opacity: 0, x: -12, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.05 }}
                        onClick={() => openEdit(selectedDate, w)}
                        className="group relative rounded-2xl border border-surface-700/40 light:border-gray-200 bg-surface-900/50 light:bg-white p-3 cursor-pointer hover:bg-surface-800/70 light:hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                                <Clock size={10} /> {w.time}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${w.shared ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface-700/40 light:bg-gray-200 text-surface-300 light:text-gray-600 border-surface-600/40 light:border-gray-300'}`}>
                                {w.shared ? <Users size={10} /> : <Clock size={10} />}
                                {w.shared ? 'Tribe' : 'Solo'}
                              </span>
                            </div>
                            <div className="font-bold text-sm text-surface-100 light:text-gray-900 truncate">{w.workout}</div>
                            <div className="text-xs text-surface-400 light:text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                              <span>{w.duration || '45 min'}</span>
                              {w.user_name && <span>· {w.user_name}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); openEdit(selectedDate, w); }}
                              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 text-primary"
                              title="Edit workout"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); deleteItem(w); }}
                              className="h-8 w-8 p-0 rounded-full hover:bg-danger/10 text-danger"
                              title="Delete workout"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(!workoutSchedule[selectedDate] || workoutSchedule[selectedDate].length === 0) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6 rounded-2xl border border-dashed border-surface-700/40 light:border-gray-300 bg-surface-900/30 light:bg-gray-100/50"
                    >
                      <Dumbbell size={28} className="mx-auto text-surface-500 light:text-gray-400 mb-2" />
                      <p className="text-sm text-surface-300 light:text-gray-600 font-medium">No workouts yet</p>
                      <p className="text-xs text-surface-500 light:text-gray-500 mt-0.5">Tap + to add one</p>
                    </motion.div>
                  )}

                  <Button
                    variant="primary"
                    onClick={() => setShowScheduler(true)}
                    className="w-full h-11 mt-2 shadow-lg shadow-primary/20"
                  >
                    <Plus size={18} /> Add Workout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary/20 border border-primary/30 rounded"></div>
              <span className="text-surface-400 light:text-gray-600">Shared with tribe</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-surface-700 light:bg-gray-300 rounded"></div>
              <span className="text-surface-400 light:text-gray-600">Private workout</span>
            </div>
          </div>
          
          <div className="text-surface-500 light:text-gray-500">
            Click + to schedule a workout
          </div>
        </div>
      </div>
      )}

      {/* Fixed Action Buttons at Bottom */}
      <div className="sticky bottom-0 bg-surface-900 light:bg-gray-50 pt-4 border-t border-surface-700 light:border-gray-200">
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 min-w-0"
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
            className="flex-1 min-w-0"
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
          user={user}
          userId={uid}
          customWorkouts={customWorkouts}
        />
      )}

      {/* Edit Workout Modal */}
      {editOpen && (
        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Workout">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-surface-400">Date</label>
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full px-3 py-2 rounded border border-surface-700 bg-surface-800 text-surface-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-surface-400">Time</label>
                <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full px-3 py-2 rounded border border-surface-700 bg-surface-800 text-surface-100" />
              </div>
              <div>
                <label className="text-xs text-surface-400">Duration</label>
                <input type="text" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} placeholder="e.g. 45 min" className="w-full px-3 py-2 rounded border border-surface-700 bg-surface-800 text-surface-100" />
              </div>
            </div>
            <div>
              <label className="text-xs text-surface-400">Workout</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded border border-surface-700 bg-surface-800 text-surface-100" />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editShared} onChange={(e) => setEditShared(e.target.checked)} />
              Shared with tribe
            </label>
            <div className="flex gap-2 pt-2">
              <Button onClick={saveEdit} variant="primary" className="flex-1 min-w-0"><Save size={16} /> Save</Button>
              <Button onClick={deleteItem} variant="danger" className="flex-1 min-w-0"><Trash2 size={16} /> Delete</Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}