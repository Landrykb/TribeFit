'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './button';
import { 
  Users, Flame, Crown, Plus, X, Eye, EyeOff, 
  Target, Clock, Info
} from 'lucide-react';
import { Features } from '../../lib/feature-flags';

export function SquadCreationModal({ isOpen, onClose, onCreateSquad }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'squad', // squad or tribe
    isPrivate: false,
    maxMembers: Features.SQUAD_MAX_MEMBERS || 8,
    initialSkipMode: 'teammate_boost',
  });
  
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a squad name');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateSquad(formData);
      setFormData({
        name: '',
        description: '',
        type: 'squad',
        isPrivate: false,
        maxMembers: Features.SQUAD_MAX_MEMBERS || 8
      });
      onClose();
    } catch (error) {
      console.error('Failed to create squad:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const groupOptions = [
    {
      type: 'squad',
      icon: <Flame size={24} className="text-orange-500" />,
      title: 'Squad',
      subtitle: 'Start your fitness journey',
      description: 'Entry-level group perfect for building habits',
      maxMembers: Features.SQUAD_MAX_MEMBERS || 8,
      features: ['Skip notifications', 'Basic challenges', 'Upgrade path to Tribe']
    },
    {
      type: 'tribe',
      icon: <Crown size={24} className="text-yellow-500" />,
      title: 'Tribe',
      subtitle: 'Advanced community',
      description: 'Premium group with enhanced features',
      maxMembers: Features.TRIBE_MAX_MEMBERS || 15,
      features: ['All Squad features', 'Custom themes', 'Priority coaching', 'Advanced analytics']
    }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create Your Group" 
      size="lg"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Group Type Selection */}
        <div>
          <h3 className="font-bold text-surface-50 mb-3">Choose Group Type</h3>
          <div className="grid grid-cols-1 gap-3">
            {groupOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: option.type,
                  maxMembers: option.maxMembers 
                }))}
                className={`p-4 text-left rounded-lg border transition-all ${
                  formData.type === option.type
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-surface-700 bg-surface-800 hover:border-surface-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-surface-50">{option.title}</h4>
                      <span className="text-surface-400 text-sm">• {option.subtitle}</span>
                    </div>
                    <p className="text-surface-300 text-sm mb-2">{option.description}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <Users size={12} className="text-surface-400" />
                        <span className="text-surface-400">Max {option.maxMembers} members</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {option.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="text-xs bg-surface-700 px-2 py-1 rounded text-surface-300">
                          {feature}
                        </span>
                      ))}
                      {option.features.length > 2 && (
                        <span className="text-xs text-surface-500">+{option.features.length - 2} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">
              {formData.type === 'squad' ? 'Squad' : 'Tribe'} Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={`e.g., Morning ${formData.type === 'squad' ? 'Legends' : 'Warriors'}`}
              className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={50}
            />
            <div className="text-xs text-surface-500 mt-1">{formData.name.length}/50 characters</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={`Describe your ${formData.type}'s goals and vibe...`}
              className="w-full p-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-surface-500 mt-1">{formData.description.length}/200 characters</div>
          </div>

          {/* Minimal initial tribe settings */}
          {formData.type === 'tribe' && (
            <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
              <h4 className="font-medium text-surface-50 mb-3">Initial Tribe Settings</h4>
              <div>
                <label className="block text-xs text-surface-300 mb-1">Skip Mode</label>
                <select
                  value={formData.initialSkipMode}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialSkipMode: e.target.value }))}
                  className="w-full p-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-50"
                >
                  <option value="teammate_boost">Teammate Boost (80% to active, 20% to vault)</option>
                  <option value="tribe_fund">Tribe Fund (100% to vault)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
          <h4 className="font-medium text-surface-50 mb-3 flex items-center space-x-2">
            <Eye size={16} />
            <span>Privacy Settings</span>
          </h4>
          
          <div className="space-y-3">
            <button
              onClick={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
              className={`w-full p-3 text-left rounded-lg border transition-all ${
                !formData.isPrivate
                  ? 'border-success bg-success/10 text-success'
                  : 'border-surface-600 bg-surface-700 text-surface-300 hover:border-surface-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Eye size={16} />
                <div>
                  <div className="font-medium">Public</div>
                  <div className="text-sm opacity-75">Anyone can discover and join</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
              className={`w-full p-3 text-left rounded-lg border transition-all ${
                formData.isPrivate
                  ? 'border-warning bg-warning/10 text-warning'
                  : 'border-surface-600 bg-surface-700 text-surface-300 hover:border-surface-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <EyeOff size={16} />
                <div>
                  <div className="font-medium">Private</div>
                  <div className="text-sm opacity-75">Invite-only membership</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Squad Benefits Preview */}
        {formData.type === 'squad' && (
          <div className="bg-gradient-to-r from-orange-500/10 to-primary/10 rounded-lg p-4 border border-orange-500/20">
            <div className="flex items-start space-x-3">
              <Info size={16} className="text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-surface-50 mb-2">Squad Benefits</h4>
                <ul className="text-sm text-surface-300 space-y-1">
                  <li>• Instant formation - no approval needed</li>
                  <li>• Build 30-day streak to unlock Tribe upgrade</li>
                  <li>• Upgrade unlocks Tribe Vault for shared purchases</li>
                  <li>• Friendly competition and accountability</li>
                </ul>
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
          className="flex-1 min-w-0"
          disabled={isCreating}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleCreate}
          variant="primary"
          className="flex-1 min-w-0"
          disabled={isCreating || !formData.name.trim()}
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Plus size={16} />
              Create {formData.type === 'squad' ? 'Squad' : 'Tribe'}
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}