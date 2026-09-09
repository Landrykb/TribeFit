"use client";
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { Zap, Clock, Target, Dumbbell, Home, Warehouse, Building2, Sprout, TrendingUp, Flame } from 'lucide-react';

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
        toast.success('Workout plan generated successfully!');
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Fitness Goals */}
        <div>
          <label className="block text-sm font-bold text-surface-100 mb-4">
            <Target size={16} className="inline mr-2 text-primary" />
            Primary Fitness Goal
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'weight_loss', label: 'Weight Loss & Fat Burning' },
              { value: 'muscle_building', label: 'Muscle Building & Hypertrophy' },
              { value: 'strength', label: 'Strength & Power Training' },
              { value: 'endurance', label: 'Cardiovascular Endurance' },
              { value: 'general_fitness', label: 'General Fitness & Health' },
              { value: 'athletic_performance', label: 'Athletic Performance' }
            ].map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => handleInputChange('fitnessGoals', goal.value)}
                className={`p-4 text-left rounded-xl border transition-all duration-200 hover-elevate ${
                  formData.fitnessGoals === goal.value
                    ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary text-primary shadow-lg'
                    : 'bg-surface-700 border-surface-600 text-surface-200 hover:border-surface-500 hover:bg-surface-600 light:bg-white light:border-gray-300 light:text-gray-700 light:hover:border-gray-400'
                }`}
              >
                <span className="text-sm font-bold">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Available Time */}
        <div>
          <label className="block text-sm font-bold text-surface-100 mb-4">
            <Clock size={16} className="inline mr-2 text-accent" />
            Available Time Per Session
          </label>
          <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 light:bg-accent-50 border border-accent/20 light:border-accent-200 rounded-xl">
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={formData.availableTime}
                onChange={(e) => handleInputChange('availableTime', parseInt(e.target.value))}
                className="flex-1 h-3 bg-surface-700 light:bg-gray-200 rounded-full appearance-none cursor-pointer slider"
              />
              <span className="text-xl font-bold text-accent min-w-[5rem] text-center bg-accent/20 light:bg-orange-100 light:text-orange-800 px-3 py-1 rounded-lg">
                {formData.availableTime} min
              </span>
            </div>
          </div>
        </div>

        {/* Equipment Access */}
        <div>
          <label className="block text-sm font-bold text-surface-100 light:text-gray-800 mb-4">
            <Dumbbell size={16} className="inline mr-2 text-success" />
            Equipment Available
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'no_equipment', label: 'No Equipment (Bodyweight Only)', Icon: Home },
              { value: 'basic_home', label: 'Basic Home Equipment (Dumbbells, Bands)', Icon: Dumbbell },
              { value: 'home_gym', label: 'Home Gym (Full Equipment)', Icon: Warehouse },
              { value: 'commercial_gym', label: 'Commercial Gym Access', Icon: Building2 }
            ].map((eq) => {
              const EqIcon = eq.Icon;
              return (
                <button
                  key={eq.value}
                  type="button"
                  onClick={() => handleInputChange('equipment', eq.value)}
                  className={`p-4 text-left rounded-xl border transition-all duration-200 hover-elevate flex items-center gap-3 ${
                    formData.equipment === eq.value
                      ? 'bg-gradient-to-br from-success/20 to-success/10 border-success text-success shadow-lg'
                      : 'bg-surface-700 border-surface-600 text-surface-200 hover:border-surface-500 hover:bg-surface-600 light:bg-white light:border-gray-300 light:text-gray-700 light:hover:border-gray-400'
                  }`}
                >
                  <EqIcon size={20} />
                  <span className="text-sm font-bold">{eq.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-bold text-surface-100 light:text-gray-800 mb-4">
            <Zap size={16} className="inline mr-2 text-warning" />
            Experience Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'beginner', label: 'Beginner', desc: '0-6 months', Icon: Sprout },
              { value: 'intermediate', label: 'Intermediate', desc: '6 months - 2 years', Icon: TrendingUp },
              { value: 'advanced', label: 'Advanced', desc: '2+ years', Icon: Flame }
            ].map((level) => {
              const LevelIcon = level.Icon;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange('experienceLevel', level.value)}
                  className={`p-4 text-center rounded-xl border transition-all duration-200 hover-elevate ${
                    formData.experienceLevel === level.value
                      ? 'bg-gradient-to-br from-warning/20 to-warning/10 border-warning text-warning shadow-lg'
                      : 'bg-surface-700 border-surface-600 text-surface-200 hover:border-surface-500 hover:bg-surface-600 light:bg-white light:border-gray-300 light:text-gray-700 light:hover:border-gray-400'
                  }`}
                >
                  <LevelIcon size={24} className="mx-auto mb-2" />
                  <div className="text-sm font-bold">{level.label}</div>
                  <div className="text-xs opacity-70 mt-1">{level.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4 pt-6">
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
            className="flex-1 h-12 text-base font-bold"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Zap size={18} className="mr-2" />
                Generate Plan
              </>
            )}
          </Button>
        </div>
        </form>
      </div>
    </Modal>
  );
}

export function WorkoutPlanModal({ isOpen, onClose, plan, onSaveToCalendar }) {
  if (!plan) return null;

  // Convert the plan content to HTML-friendly format
  const formatPlanContent = (content) => {
    // Check if content exists and is a string
    if (!content || typeof content !== 'string') {
      return '<p>Workout plan content not available. Please try generating again.</p>';
    }
    
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
          dangerouslySetInnerHTML={{ 
            __html: formatPlanContent(
              plan.workoutPlan?.aiContent || 
              plan.workoutPlan?.content || 
              JSON.stringify(plan.workoutPlan, null, 2) || 
              'No workout content available'
            ) 
          }}
        />
      </div>
      
      <div className="flex space-x-3 pt-6 border-t border-surface-700">
        <Button
          variant="accent"
          className="flex-1 text-sm"
          onClick={() => {
            if (typeof onSaveToCalendar === 'function') {
              onSaveToCalendar(plan);
            } else {
              localStorage.setItem('currentWorkoutPlan', JSON.stringify(plan));
              toast.success('Workout plan saved!');
            }
          }}
        >
          Save to Calendar
        </Button>
        <Button
          variant="primary"  
          className="flex-1 text-sm"
          onClick={onClose}
        >
          Start
        </Button>
      </div>
    </Modal>
  );
}