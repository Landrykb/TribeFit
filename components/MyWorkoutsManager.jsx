'use client';
import React, { useState, useEffect } from 'react';
import { useApi, optimisticMutate } from '../lib/api';
import { Button } from './ui/button';
import { Modal } from './ui/Modal';
import { SkeletonList } from './ui/skeleton';
import { 
  Plus, Edit, Trash2, Copy, Star, Play, Clock, 
  Zap, TrendingUp, Check, X, Search, Filter,
  ChevronDown, ChevronUp, Dumbbell, Upload,
  LayoutGrid, Shield, Layers, Footprints, Target, HeartPulse, Flame, Sprout, Activity
} from 'lucide-react';

import { BODY_PART_ICONS } from '../lib/body-part-icons';

const LEVEL_CHIPS = [
  { id: 'all', label: 'All', Icon: LayoutGrid },
  { id: 'beginner', label: 'Beginner', Icon: Sprout },
  { id: 'intermediate', label: 'Intermediate', Icon: TrendingUp },
  { id: 'advanced', label: 'Advanced', Icon: Flame },
];
import { WORKOUT_TEMPLATES, BODY_PARTS, getWorkoutsByBodyPart } from '../lib/workout-library';
import { AdvancedWorkoutEditor } from './AdvancedWorkoutEditor';
import { CalendarImportModal } from './CalendarImportModal';
import { useToast } from './ui/Toast';

export function MyWorkoutsManager({ 
  userId, 
  onSelectWorkout,
  onClose,
  isOpen 
}) {
  const toast = useToast();
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [templateWorkouts, setTemplateWorkouts] = useState(Object.values(WORKOUT_TEMPLATES));
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBodyPart, setFilterBodyPart] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const myWorkoutsUrl = userId ? `/api/workouts/my?userId=${encodeURIComponent(userId)}` : null;
  const { data: workoutsData, loading: workoutsLoading, mutate } = useApi(myWorkoutsUrl);

  // Hydrate from cache first, then revalidate in background
  useEffect(() => {
    if (workoutsData?.workouts) {
      setMyWorkouts(Array.isArray(workoutsData.workouts) ? workoutsData.workouts : []);
    }
  }, [workoutsData]);

  const getWorkoutsPromise = (url, body) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(async (res) => {
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed');
    return res.json();
  });

  const handleSaveWorkout = async (workout) => {
    if (!userId) {
      toast.error('No user ID found. Please refresh the page.');
      return;
    }
    try {
      const promise = getWorkoutsPromise('/api/workouts/save', { userId, workout });
      await optimisticMutate(myWorkoutsUrl, (current) => {
        if (!current) return current;
        const list = Array.isArray(current.workouts) ? current.workouts : [];
        const idx = list.findIndex(w => w.id === workout.id);
        const nextList = idx >= 0
          ? [...list.slice(0, idx), workout, ...list.slice(idx + 1)]
          : [workout, ...list];
        return { ...current, workouts: nextList };
      }, promise);
      setShowEditor(false);
      setSelectedWorkout(null);
      toast.success('Workout saved successfully!');
    } catch (err) {
      console.error('Failed to save workout:', err);
      toast.error(`Failed to save workout: ${err.message}`);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!confirm('Delete this workout?')) return;
    if (!userId) return;
    try {
      const promise = getWorkoutsPromise('/api/workouts/delete', { userId, workoutId });
      await optimisticMutate(myWorkoutsUrl, (current) => {
        if (!current) return current;
        const list = Array.isArray(current.workouts) ? current.workouts : [];
        return { ...current, workouts: list.filter(w => w.id !== workoutId) };
      }, promise);
      toast.success('Workout deleted');
    } catch (err) {
      console.error('Failed to delete workout:', err);
      toast.error('Failed to delete workout');
    }
  };

  const handleDuplicateWorkout = (workout) => {
    const duplicated = {
      ...workout,
      id: `custom_${Date.now()}`,
      name: `${workout.name} (Copy)`,
      isCustom: true
    };
    setSelectedWorkout(duplicated);
    setShowEditor(true);
  };

  const handleUseTemplate = (template) => {
    const customWorkout = {
      ...template,
      id: `custom_${Date.now()}`,
      isCustom: true,
      originalTemplate: template.id
    };
    setSelectedWorkout(customWorkout);
    setShowEditor(true);
  };

  const handleImportWorkouts = async (importedWorkouts) => {
    try {
      // Convert imported workouts to app format
      const converted = importedWorkouts.map(w => ({
        id: `imported_${Date.now()}_${Math.random()}`,
        name: w.name,
        description: w.description || '',
        exercises: w.exercises || [],
        duration: w.duration || 30,
        difficulty: 'beginner',
        bodyParts: [],
        isCustom: true,
        imported: true,
        importDate: new Date().toISOString()
      }));

      // Save each workout
      for (const workout of converted) {
        await handleSaveWorkout(workout);
      }
      
      setShowImportModal(false);
    } catch (err) {
      console.error('Failed to import workouts:', err);
    }
  };

  // Filter workouts
  const filteredWorkouts = myWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBodyPart = filterBodyPart === 'all' || workout.bodyParts?.includes(filterBodyPart);
    const matchesDifficulty = filterDifficulty === 'all' || workout.difficulty === filterDifficulty;
    
    return matchesSearch && matchesBodyPart && matchesDifficulty;
  });

  const filteredTemplates = templateWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBodyPart = filterBodyPart === 'all' || workout.bodyParts?.includes(filterBodyPart);
    const matchesDifficulty = filterDifficulty === 'all' || workout.difficulty === filterDifficulty;
    
    return matchesSearch && matchesBodyPart && matchesDifficulty;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Workouts" size="2xl">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workouts..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-800 border-2 border-surface-700 rounded-xl text-surface-50 placeholder-surface-400 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Body part icon grid — tap to filter */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-surface-400 mb-1.5">Body Part</div>
          <div className="grid grid-cols-5 gap-1.5">
            <button
              onClick={() => setFilterBodyPart('all')}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                filterBodyPart === 'all'
                  ? 'bg-primary/15 border-primary/50 text-primary'
                  : 'bg-surface-800/60 border-surface-700/60 text-surface-300 hover:border-surface-500'
              }`}
            >
              <LayoutGrid size={17} />
              <span className="text-[10px] font-medium">All</span>
            </button>
            {BODY_PARTS.map(part => {
              const Icon = BODY_PART_ICONS[part.id] || Dumbbell;
              return (
                <button
                  key={part.id}
                  onClick={() => setFilterBodyPart(part.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                    filterBodyPart === part.id
                      ? 'bg-primary/15 border-primary/50 text-primary scale-105'
                      : 'bg-surface-800/60 border-surface-700/60 text-surface-300 hover:border-surface-500'
                  }`}
                >
                  <Icon size={17} />
                  <span className="text-[10px] font-medium leading-none">{part.label.split('/')[0].split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level chips */}
        <div className="flex gap-1.5">
          {LEVEL_CHIPS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setFilterDifficulty(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                filterDifficulty === id
                  ? 'bg-primary/15 border-primary/50 text-primary'
                  : 'bg-surface-800/60 border-surface-700/60 text-surface-300 hover:border-surface-500'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => {
              setSelectedWorkout({
                id: `custom_${Date.now()}`,
                name: 'New Workout',
                description: '',
                exercises: [],
                duration: 30,
                difficulty: 'beginner',
                bodyParts: [],
                isCustom: true
              });
              setShowEditor(true);
            }}
            variant="primary"
            className="h-10 px-2 text-xs whitespace-nowrap"
          >
            <Plus size={15} />
            Create
          </Button>

          <Button
            onClick={() => setShowImportModal(true)}
            variant="ghost"
            className="h-10 px-2 text-xs whitespace-nowrap"
          >
            <Upload size={15} />
            Import
          </Button>

          <Button
            onClick={() => setShowTemplates(!showTemplates)}
            variant="ghost"
            className="h-10 px-2 text-xs whitespace-nowrap"
          >
            <Dumbbell size={15} />
            {showTemplates ? 'Mine' : 'Templates'}
          </Button>
        </div>

        {/* Workouts List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {workoutsLoading && !showTemplates ? (
            <SkeletonList count={3} />
          ) : !showTemplates ? (
            // My Custom Workouts
            filteredWorkouts.length > 0 ? (
              filteredWorkouts.map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onSelect={() => {
                    onSelectWorkout(workout);
                    onClose();
                  }}
                  onEdit={() => {
                    setSelectedWorkout(workout);
                    setShowEditor(true);
                  }}
                  onDelete={() => handleDeleteWorkout(workout.id)}
                  onDuplicate={() => handleDuplicateWorkout(workout)}
                  isCustom={true}
                />
              ))
            ) : (
              <div className="text-center py-8 text-surface-400">
                <Dumbbell size={40} className="mx-auto mb-3 opacity-50" />
                <p>No custom workouts yet.</p>
                <p className="text-sm mt-1">Create one or start from a template!</p>
              </div>
            )
          ) : (
            // Templates
            filteredTemplates.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onSelect={() => {
                  onSelectWorkout(workout);
                  onClose();
                }}
                onEdit={() => handleUseTemplate(workout)}
                isTemplate={true}
              />
            ))
          )}
        </div>
      </div>

      {/* Workout Editor Modal */}
      {showEditor && selectedWorkout && (
        <AdvancedWorkoutEditor
          workout={selectedWorkout}
          userId={userId}
          onSave={handleSaveWorkout}
          onCancel={() => {
            setShowEditor(false);
            setSelectedWorkout(null);
          }}
        />
      )}

      {/* Calendar Import Modal */}
      {showImportModal && (
        <CalendarImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportWorkouts}
          userId={userId}
        />
      )}
    </Modal>
  );
}

// Workout Card Component
function WorkoutCard({ workout, onSelect, onEdit, onDelete, onDuplicate, isCustom, isTemplate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-800 border-2 border-surface-700 rounded-2xl p-3 hover:border-primary/50 transition-all">
      <div className="flex items-center gap-1.5 flex-wrap mb-1">
        <h4 className="font-bold text-surface-50 light:text-gray-900 text-sm">{workout.name}</h4>
        {isTemplate && (
          <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded-lg font-medium">Template</span>
        )}
        {isCustom && !isTemplate && (
          <span className="text-[10px] px-1.5 py-0.5 bg-success/20 text-success rounded-lg font-medium flex items-center gap-0.5">
            <Star size={9} fill="currentColor" /> Custom
          </span>
        )}
        <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-lg font-medium capitalize">
          {workout.difficulty}
        </span>
      </div>

      <p className="text-xs text-surface-400 mb-2 line-clamp-2">{workout.description}</p>

      <div className="flex items-center gap-3 text-xs text-surface-500 mb-3">
        <span className="flex items-center gap-1"><Clock size={12} /> {workout.duration} min</span>
        <span className="flex items-center gap-1"><Dumbbell size={12} /> {workout.exercises?.length || 0}</span>
        {workout.bodyParts?.length > 0 && (
          <span className="flex items-center gap-1">
            {workout.bodyParts.slice(0, 3).map(bp => {
              const Icon = BODY_PART_ICONS[bp] || Dumbbell;
              return <Icon key={bp} size={12} className="text-primary" />;
            })}
          </span>
        )}
      </div>

      {expanded && workout.exercises && (
        <div className="mb-3 space-y-1 pl-3 border-l-2 border-surface-700">
          {workout.exercises.map((ex, idx) => (
            <div key={idx} className="text-xs text-surface-400">
              <span className="text-surface-300">{ex.name}</span> • {ex.sets}×{ex.reps}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <Button onClick={onSelect} variant="primary" className="flex-1 min-w-0 h-9 text-xs whitespace-nowrap">
          <Play size={14} /> Start
        </Button>
        <Button onClick={onEdit} variant="ghost" className="h-9 px-3 text-xs whitespace-nowrap flex-shrink-0">
          <Edit size={14} />
        </Button>
        {isCustom && onDuplicate && (
          <Button onClick={onDuplicate} variant="ghost" className="h-9 px-2.5"><Copy size={14} /></Button>
        )}
        {isCustom && onDelete && (
          <Button onClick={onDelete} variant="ghost" className="h-9 px-2.5 text-red-400 hover:text-red-300"><Trash2 size={14} /></Button>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>
  );
}
