import React, { useState } from 'react';
import { X, MapPin, Coins } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/60 light:bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-900 light:bg-white light:border-gray-200 border border-surface-700 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6 border-b border-surface-700 light:border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-surface-50">Donate to Gym</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-700 light:hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X size={20} className="text-surface-300 hover:text-surface-100 light:text-gray-500 light:hover:text-gray-700" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-surface-100 light:text-gray-800 mb-3">
              <MapPin size={16} className="inline mr-2 text-accent" />
              Gym Name
            </label>
            <input
              type="text"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="w-full p-4 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 light:bg-white light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              placeholder="Enter gym name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-100 light:text-gray-800 mb-3">
              Amount (TC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 light:bg-white light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              placeholder="Enter amount in TC"
              min="1"
            />
          </div>

          <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 light:bg-primary-50 border border-accent/20 light:border-primary-200 rounded-xl">
            <p className="text-sm text-surface-200 light:text-gray-700">
              <strong className="text-accent">How it works:</strong> Your tribe will vote on this donation request. Once approved, the funds will be sent to support the gym.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 min-w-0 bg-surface-700 border border-surface-600 hover:bg-surface-600 hover:border-surface-500 text-surface-100 rounded-xl px-4 py-3 transition-all duration-200 font-medium light:bg-white light:border-gray-300 light:text-gray-700 light:hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!gymName.trim() || !amount || loading}
              className="flex-1 min-w-0 bg-gradient-to-br from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-surface-600 disabled:to-surface-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center space-x-2 font-bold shadow-lg hover:shadow-accent/25"
            >
              {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
              <span>Submit Request</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}