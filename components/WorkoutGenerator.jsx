import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { Zap, Clock, Target, Dumbbell } from 'lucide-react';

export function WorkoutGenerator({ isOpen, onClose, onPlanGenerated }) {
  const [formData, setFormData] = useState({
    fitnessGoals: '',
    availableTime: 45,
    equipment: '',
    experienceLevel: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fitnessGoals || !formData.equipment || !formData.experienceLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Workout plan generated successfully! 🎯');
        onPlanGenerated(data);
        onClose();
        setFormData({
          fitnessGoals: '',
          availableTime: 45,
          equipment: '',
          experienceLevel: ''
        });
      } else {
        toast.error(data.error || 'Failed to generate workout plan');
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      toast.error('Failed to generate workout plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Workout Generator" size="lg">
      <div className="max-h-96 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fitness Goals */}
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-3">
            <Target size={16} className="inline mr-2" />
            Primary Fitness Goal
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'weight_loss', label: '🔥 Weight Loss & Fat Burning' },
              { value: 'muscle_building', label: '💪 Muscle Building & Hypertrophy' },
              { value: 'strength', label: '🏋️ Strength & Power Training' },
              { value: 'endurance', label: '🏃 Cardiovascular Endurance' },
              { value: 'general_fitness', label: '⚡ General Fitness & Health' },
              { value: 'athletic_performance', label: '🏆 Athletic Performance' }
            ].map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => handleInputChange('fitnessGoals', goal.value)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  formData.fitnessGoals === goal.value
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
                }`}
              >
                <span className="text-sm font-medium">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Available Time */}
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-3">
            <Clock size={16} className="inline mr-2" />
            Available Time Per Session
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={formData.availableTime}
              onChange={(e) => handleInputChange('availableTime', parseInt(e.target.value))}
              className="flex-1 h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-lg font-bold text-primary min-w-[4rem] text-center">
              {formData.availableTime} min
            </span>
          </div>
        </div>

        {/* Equipment Access */}
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-3">
            <Dumbbell size={16} className="inline mr-2" />
            Equipment Available
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'no_equipment', label: '🏠 No Equipment (Bodyweight Only)' },
              { value: 'basic_home', label: '🏡 Basic Home Equipment (Dumbbells, Bands)' },
              { value: 'home_gym', label: '🏋️ Home Gym (Full Equipment)' },
              { value: 'commercial_gym', label: '🏢 Commercial Gym Access' }
            ].map((eq) => (
              <button
                key={eq.value}
                type="button"
                onClick={() => handleInputChange('equipment', eq.value)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  formData.equipment === eq.value
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
                }`}
              >
                <span className="text-sm font-medium">{eq.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-3">
            <Zap size={16} className="inline mr-2" />
            Experience Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'beginner', label: '🌱 Beginner', desc: '0-6 months' },
              { value: 'intermediate', label: '🌿 Intermediate', desc: '6 months - 2 years' },
              { value: 'advanced', label: '🌳 Advanced', desc: '2+ years' }
            ].map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleInputChange('experienceLevel', level.value)}
                className={`p-4 text-center rounded-lg border transition-all ${
                  formData.experienceLevel === level.value
                    ? 'bg-success/20 border-success text-success'
                    : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
                }`}
              >
                <div className="text-sm font-medium">{level.label}</div>
                <div className="text-xs opacity-70 mt-1">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isGenerating}
            className="flex-1"
          >
            {isGenerating ? 'Generating Plan...' : 'Generate AI Workout Plan'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function WorkoutPlanModal({ isOpen, onClose, plan }) {
  if (!plan) return null;

  // Convert the plan content to HTML-friendly format
  const formatPlanContent = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-primary mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-accent mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-surface-50 mt-8 mb-4">$1</h1>')
      .replace(/\n/g, '<br />');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your AI Generated Workout Plan" size="2xl">
      <div className="max-h-96 overflow-y-auto">
        <div 
          className="prose prose-sm max-w-none text-surface-200"
          dangerouslySetInnerHTML={{ __html: formatPlanContent(plan.workoutPlan) }}
        />
      </div>
      
      <div className="flex space-x-3 pt-6 border-t border-surface-700">
        <Button
          variant="accent"
          className="flex-1"
          onClick={() => {
            // Save plan functionality
            localStorage.setItem('currentWorkoutPlan', JSON.stringify(plan));
            alert('Workout plan saved! 💾');
          }}
        >
          Save Plan
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={onClose}
        >
          Start Training
        </Button>
      </div>
    </Modal>
  );
}