'use client';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Modal } from './ui/Modal';
import { 
  Plus, Trash2, GripVertical, Clock, Target, Dumbbell,
  TrendingUp, Save, X, ChevronUp, ChevronDown,
  Copy, Upload, Calendar as CalendarIcon, Image as ImageIcon
} from 'lucide-react';
import { BODY_PARTS } from '../lib/workout-library';
import { BODY_PART_ICONS } from '../lib/body-part-icons';
import { useToast } from './ui/Toast';

export function AdvancedWorkoutEditor({ 
  workout, 
  onSave, 
  onCancel,
  userId 
}) {
  const toast = useToast();
  const [editedWorkout, setEditedWorkout] = useState(workout || {
    id: `custom_${Date.now()}`,
    name: 'New Workout',
    description: '',
    exercises: [],
    duration: 30,
    difficulty: 'beginner',
    bodyParts: [],
    isCustom: true
  });

  const [showImportOptions, setShowImportOptions] = useState(false);

  const addExercise = () => {
    const newExercise = {
      id: `ex_${Date.now()}`,
      name: '',
      sets: 3,
      reps: 12,
      restTime: 60,
      instructions: '',
      muscleGroups: []
    };
    
    setEditedWorkout({
      ...editedWorkout,
      exercises: [...editedWorkout.exercises, newExercise]
    });
  };

  const updateExercise = (index, field, value) => {
    const updated = [...editedWorkout.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setEditedWorkout({ ...editedWorkout, exercises: updated });
  };

  const deleteExercise = (index) => {
    const updated = editedWorkout.exercises.filter((_, i) => i !== index);
    setEditedWorkout({ ...editedWorkout, exercises: updated });
  };

  const duplicateExercise = (index) => {
    const exercise = { ...editedWorkout.exercises[index], id: `ex_${Date.now()}` };
    const updated = [...editedWorkout.exercises];
    updated.splice(index + 1, 0, exercise);
    setEditedWorkout({ ...editedWorkout, exercises: updated });
  };

  const moveExercise = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= editedWorkout.exercises.length) return;
    
    const updated = [...editedWorkout.exercises];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setEditedWorkout({ ...editedWorkout, exercises: updated });
  };

  const toggleBodyPart = (bodyPartId) => {
    const current = editedWorkout.bodyParts || [];
    const updated = current.includes(bodyPartId)
      ? current.filter(id => id !== bodyPartId)
      : [...current, bodyPartId];
    setEditedWorkout({ ...editedWorkout, bodyParts: updated });
  };

  const handleSave = () => {
    if (!editedWorkout.name.trim()) {
      toast.error('Please enter a workout name');
      return;
    }
    
    if (editedWorkout.exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    // Validate exercises
    const hasEmptyExercises = editedWorkout.exercises.some(ex => !ex.name.trim());
    if (hasEmptyExercises) {
      toast.error('Please name all exercises');
      return;
    }

    onSave(editedWorkout);
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Workout Editor" size="2xl">
      <div className="max-h-[75vh] overflow-y-auto space-y-6 pr-2">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
              Workout Name *
            </label>
            <input
              type="text"
              value={editedWorkout.name}
              onChange={(e) => setEditedWorkout({...editedWorkout, name: e.target.value})}
              className="w-full px-4 py-2 bg-surface-800 light:bg-white border border-surface-700 light:border-gray-300 rounded-lg text-surface-50 light:text-gray-900 placeholder-surface-400 light:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Upper Body Strength"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={editedWorkout.description}
              onChange={(e) => setEditedWorkout({...editedWorkout, description: e.target.value})}
              className="w-full px-4 py-2 bg-surface-800 light:bg-white border border-surface-700 light:border-gray-300 rounded-lg text-surface-50 light:text-gray-900 placeholder-surface-400 light:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe your workout..."
              rows={3}
            />
          </div>

          {/* Duration and Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
                <Clock size={14} className="inline mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                value={editedWorkout.duration}
                onChange={(e) => setEditedWorkout({...editedWorkout, duration: parseInt(e.target.value) || 30})}
                className="w-full px-4 py-2 bg-surface-800 light:bg-white border border-surface-700 light:border-gray-300 rounded-lg text-surface-50 light:text-gray-900"
                min="5"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
                <TrendingUp size={14} className="inline mr-1" />
                Difficulty
              </label>
              <select
                value={editedWorkout.difficulty}
                onChange={(e) => setEditedWorkout({...editedWorkout, difficulty: e.target.value})}
                className="w-full px-4 py-2 bg-surface-800 light:bg-white border border-surface-700 light:border-gray-300 rounded-lg text-surface-50 light:text-gray-900"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Body Parts */}
          <div>
            <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
              <Target size={14} className="inline mr-1" />
              Target Muscle Groups
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BODY_PARTS.map(part => (
                <button
                  key={part.id}
                  onClick={() => toggleBodyPart(part.id)}
                  className={`p-2 rounded-lg border text-xs transition-all ${
                    (editedWorkout.bodyParts || []).includes(part.id)
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-surface-800 light:bg-white border-surface-600 light:border-gray-300 text-surface-300 light:text-gray-600 hover:border-surface-500 light:hover:border-gray-400'
                  }`}
                >
                  {(() => {
                    const Icon = BODY_PART_ICONS[part.id] || Dumbbell;
                    return <Icon size={18} className="mx-auto mb-1 text-surface-300" />;
                  })()}
                  <div className="font-medium">{part.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Import Options */}
        <div className="border-t border-surface-700 light:border-gray-200 pt-4">
          <button
            onClick={() => setShowImportOptions(!showImportOptions)}
            className="w-full flex items-center justify-between p-3 bg-surface-800 light:bg-gray-50 rounded-lg hover:bg-surface-700 light:hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-primary" />
              <span className="text-sm font-medium text-surface-200 light:text-gray-700">Import Exercises</span>
            </div>
            {showImportOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showImportOptions && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                onClick={() => toast.info('Calendar import coming soon!')}
                variant="ghost"
                className="justify-start"
              >
                <CalendarIcon size={14} />
                From Calendar
              </Button>
              <Button
                onClick={() => toast.info('Photo import coming soon!')}
                variant="ghost"
                className="justify-start"
              >
                <ImageIcon size={14} />
                From Photo
              </Button>
            </div>
          )}
        </div>

        {/* Exercises List */}
        <div className="border-t border-surface-700 light:border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-surface-50 light:text-gray-900">
              Exercises ({editedWorkout.exercises.length})
            </h4>
            <Button onClick={addExercise} variant="primary" size="sm">
              <Plus size={14} />
              Add Exercise
            </Button>
          </div>

          <div className="space-y-3">
            {editedWorkout.exercises.map((exercise, index) => (
              <ExerciseEditor
                key={exercise.id}
                exercise={exercise}
                index={index}
                onUpdate={(field, value) => updateExercise(index, field, value)}
                onDelete={() => deleteExercise(index)}
                onDuplicate={() => duplicateExercise(index)}
                onMoveUp={() => moveExercise(index, 'up')}
                onMoveDown={() => moveExercise(index, 'down')}
                isFirst={index === 0}
                isLast={index === editedWorkout.exercises.length - 1}
              />
            ))}

            {editedWorkout.exercises.length === 0 && (
              <div className="text-center py-8 text-surface-400 light:text-gray-500">
                <p className="text-sm">No exercises yet.</p>
                <p className="text-xs mt-1">Click "Add Exercise" to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-surface-700 light:border-gray-200">
        <Button onClick={onCancel} variant="ghost" className="flex-1">
          <X size={16} />
          Cancel
        </Button>
        <Button onClick={handleSave} variant="primary" className="flex-1">
          <Save size={16} />
          Save Workout
        </Button>
      </div>
    </Modal>
  );
}

// Exercise Editor Component
function ExerciseEditor({ 
  exercise, 
  index, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-surface-900 light:bg-gray-50 border border-surface-700 light:border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="flex flex-col gap-1 pt-2">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="text-surface-500 hover:text-surface-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp size={16} />
          </button>
          <GripVertical size={16} className="text-surface-600" />
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="text-surface-500 hover:text-surface-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Exercise Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-500 light:text-gray-500 w-6">
              #{index + 1}
            </span>
            <input
              type="text"
              value={exercise.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder="Exercise name"
              className="flex-1 px-3 py-1.5 bg-surface-800 light:bg-white border border-surface-600 light:border-gray-300 rounded text-surface-50 light:text-gray-900 placeholder-surface-500 light:placeholder-gray-400 text-sm focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-surface-400 hover:text-surface-200"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {expanded && (
            <>
              {/* Sets, Reps, Rest */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-surface-400 light:text-gray-600 mb-1">Sets</label>
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => onUpdate('sets', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 bg-surface-800 light:bg-white border border-surface-600 light:border-gray-300 rounded text-surface-50 light:text-gray-900 text-sm"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-surface-400 light:text-gray-600 mb-1">Reps</label>
                  <input
                    type="text"
                    value={exercise.reps}
                    onChange={(e) => onUpdate('reps', e.target.value)}
                    className="w-full px-2 py-1 bg-surface-800 light:bg-white border border-surface-600 light:border-gray-300 rounded text-surface-50 light:text-gray-900 text-sm"
                    placeholder="12 or 30s"
                  />
                </div>
                <div>
                  <label className="block text-xs text-surface-400 light:text-gray-600 mb-1">Rest (s)</label>
                  <input
                    type="number"
                    value={exercise.restTime}
                    onChange={(e) => onUpdate('restTime', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-surface-800 light:bg-white border border-surface-600 light:border-gray-300 rounded text-surface-50 light:text-gray-900 text-sm"
                    min="0"
                    max="300"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs text-surface-400 light:text-gray-600 mb-1">Instructions</label>
                <textarea
                  value={exercise.instructions}
                  onChange={(e) => onUpdate('instructions', e.target.value)}
                  placeholder="Form cues and tips..."
                  className="w-full px-3 py-2 bg-surface-800 light:bg-white border border-surface-600 light:border-gray-300 rounded text-surface-50 light:text-gray-900 text-sm placeholder-surface-500 light:placeholder-gray-400"
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onDuplicate}
            className="p-1.5 text-surface-400 hover:text-primary rounded hover:bg-surface-800 light:hover:bg-gray-100"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-surface-400 hover:text-red-400 rounded hover:bg-surface-800 light:hover:bg-gray-100"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
