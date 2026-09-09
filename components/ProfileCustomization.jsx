import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { useAuth } from './auth/AuthProvider';
import { 
  Zap, Trophy, Shield, Heart, Star, Crown, 
  Flame, Target, Dumbbell, Users, Globe, Mountain
} from 'lucide-react';

// Tribal-inspired profile icons
export const ProfileIcons = {
  zap: { icon: Zap, name: 'Lightning', color: 'text-yellow-400' },
  trophy: { icon: Trophy, name: 'Champion', color: 'text-yellow-500' },
  shield: { icon: Shield, name: 'Guardian', color: 'text-blue-400' },
  heart: { icon: Heart, name: 'Spirit', color: 'text-red-400' },
  star: { icon: Star, name: 'Bright Star', color: 'text-purple-400' },
  crown: { icon: Crown, name: 'Leader', color: 'text-gold' },
  flame: { icon: Flame, name: 'Fire Warrior', color: 'text-orange-400' },
  target: { icon: Target, name: 'Focused', color: 'text-green-400' },
  dumbbell: { icon: Dumbbell, name: 'Iron Will', color: 'text-gray-400' },
  users: { icon: Users, name: 'Unity', color: 'text-cyan-400' },
  globe: { icon: Globe, name: 'Explorer', color: 'text-teal-400' },
  mountain: { icon: Mountain, name: 'Peak Seeker', color: 'text-indigo-400' },
};

export function ProfileCustomization({ isOpen, onClose, userId, currentName, currentIcon, onSaved }) {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || user?.avatar_icon || 'zap');
  const [displayName, setDisplayName] = useState(currentName || user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const name = displayName.trim();
    if (!name) {
      toast.error('Display name is required');
      return;
    }
    const previousName = currentName || user?.name || '';
    const previousIcon = currentIcon || user?.avatar_icon || 'zap';
    setSaving(true);
    try {
      // Optimistic UI: apply immediately, roll back if the request fails
      updateUser({ name, avatar_icon: selectedIcon });
      onSaved?.({ name, avatar_icon: selectedIcon });
      if (userId) {
        const res = await fetch('/api/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_profile', userId, name, avatar_icon: selectedIcon }),
        });
        if (!res.ok) throw new Error('Save failed');
      }
      toast.success('Profile updated!');
      onClose();
    } catch (e) {
      // Rollback
      updateUser({ name: previousName, avatar_icon: previousIcon });
      onSaved?.({ name: previousName, avatar_icon: previousIcon });
      toast.error('Could not save: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Profile" size="lg">
      <div className="space-y-6 max-h-96 overflow-y-auto">{/* Made scrollable */}
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="Enter your display name"
          />
        </div>

        {/* Avatar Icons */}
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-3">
            Choose Your Tribal Avatar
          </label>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(ProfileIcons).map(([key, { icon: IconComponent, name, color }]) => (
              <button
                key={key}
                onClick={() => setSelectedIcon(key)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedIcon === key
                    ? 'border-primary bg-primary/20'
                    : 'border-surface-600 hover:border-surface-500 bg-surface-800'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <IconComponent size={24} className={color} />
                  <span className="text-xs text-surface-300">{name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-surface-200 mb-3">Preview</h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/15 border-2 border-primary/30 rounded-2xl flex items-center justify-center">
              {React.createElement(ProfileIcons[selectedIcon].icon, {
                size: 24,
                className: "text-white"
              })}
            </div>
            <div>
              <div className="font-medium text-surface-100">{displayName || 'Your Name'}</div>
              <div className="text-sm text-surface-400">Tribe Member</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}