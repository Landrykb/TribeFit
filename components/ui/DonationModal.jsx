import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';

export function DonationModal({ isOpen, onClose, onSubmitRequest }) {
  const [gymName, setGymName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!gymName.trim() || !amount) return;

    setLoading(true);
    try {
      await onSubmitRequest({
        type: 'donation',
        label: `Donation to ${gymName.trim()}`,
        amount_tc: parseFloat(amount),
        gym_name: gymName.trim()
      });
      
      // Reset and close
      setGymName('');
      setAmount('');
      onClose();
    } catch (error) {
      console.error('Failed to submit donation request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-sm w-full">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Donate to Gym</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Gym Name
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter gym name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Amount (TC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount in TC"
              min="1"
            />
          </div>

          <div className="text-xs text-gray-400">
            Your tribe will vote on this donation request. Once approved, the funds will be sent to support the gym.
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!gymName.trim() || !amount || loading}
              loading={loading}
              className="flex-1"
            >
              Submit Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}