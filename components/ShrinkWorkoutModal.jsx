import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { Clock, Zap, Target } from 'lucide-react';

export function ShrinkWorkoutModal({ isOpen, onClose, onShrink }) {
  const toast = useToast();
  const [selectedTime, setSelectedTime] = useState(30);
  const [customTime, setCustomTime] = useState('');
  
  const quickTimes = [15, 20, 30, 45];

  const handleShrink = () => {
    const finalTime = customTime ? parseInt(customTime) : selectedTime;
    
    if (!finalTime || finalTime < 5) {
      toast.error('Workout time must be at least 5 minutes');
      return;
    }

    if (finalTime > 120) {
      toast.error('Maximum workout time is 120 minutes');
      return;
    }

    onShrink(finalTime);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shrink Workout" size="md">
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="space-y-6 p-1">
          <div className="text-center">
            <Clock size={40} className="text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-50 light:text-gray-900 mb-2">Adjust Workout Duration</h3>
            <p className="text-surface-400 light:text-gray-600 text-sm">
              Choose how much time you have available. We&apos;ll optimize your workout accordingly.
            </p>
          </div>

        {/* Quick Time Selection */}
        <div>
          <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-3">
            <Target size={16} className="inline mr-2" />
            Quick Select (minutes)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {quickTimes.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTime(time);
                  setCustomTime('');
                }}
                className={`p-3 rounded-lg border transition-all ${
                  selectedTime === time && !customTime
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500 light:bg-white light:border-gray-300 light:text-gray-700 light:hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{time}</div>
                <div className="text-xs opacity-70">min</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Time Input */}
        <div>
          <label className="block text-sm font-medium text-surface-200 light:text-gray-700 mb-2">
            <Zap size={16} className="inline mr-2" />
            Custom Duration
          </label>
          <div className="relative">
            <input
              type="number"
              value={customTime}
              onChange={(e) => {
                setCustomTime(e.target.value);
                setSelectedTime(0);
              }}
              className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent light:bg-white light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              placeholder="Enter minutes (5-120)"
              min="5"
              max="120"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 light:text-gray-500 text-sm">
              minutes
            </span>
          </div>
          <p className="text-xs text-surface-500 light:text-gray-500 mt-1">
            Minimum: 5 minutes • Maximum: 120 minutes
          </p>
        </div>

        {/* Preview */}
        <div className="bg-surface-800 light:bg-gray-50 rounded-lg p-4 border border-surface-600 light:border-gray-200">
          <h4 className="font-medium text-surface-200 light:text-gray-800 mb-2">Workout Preview</h4>
          <div className="text-sm text-surface-400 light:text-gray-600">
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="text-primary font-medium">
                {customTime || selectedTime} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span>Exercises:</span>
              <span>3-4 optimized</span>
            </div>
            <div className="flex justify-between">
              <span>Intensity:</span>
              <span className="text-accent">High efficiency</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 min-w-0"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleShrink}
            className="flex-1 min-w-0"
          >
            <Clock size={16} />
            Shrink & Start
          </Button>
        </div>
        </div>
      </div>
    </Modal>
  );
}