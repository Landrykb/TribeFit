import React, { useState } from 'react';
import { X, Coins } from 'lucide-react';

export function TipModal({ isOpen, onClose, recipient, onSubmitTip }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick tip amounts
  const quickAmounts = [5, 10, 25, 50];

  const handleSubmit = async () => {
    if (!amount || !recipient) return;

    setLoading(true);
    try {
      await onSubmitTip({
        fromUser: null, // Will be set by API based on current user
        toUser: recipient.id || recipient.user_id,
        postId: recipient.post_id,
        amountTc: parseFloat(amount)
      });
      
      // Reset and close
      setAmount('');
      onClose();
    } catch (error) {
      console.error('Failed to submit tip:', error);
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
            <h2 className="text-xl font-bold text-white">Tip TribeCoins</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-white">
                {recipient?.name?.charAt(0) || recipient?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <h3 className="font-semibold text-white">
              {recipient?.name || recipient?.user?.name || 'User'}
            </h3>
            <p className="text-sm text-gray-400">Send TribeCoins to show appreciation</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Quick Amounts
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                    amount === quickAmount.toString()
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {quickAmount} TC
                </button>
              ))}
            </div>
            
            <div className="relative">
              <Coins size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Custom amount"
                min="1"
              />
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Tips are sent instantly and cannot be reversed.
          </div>

          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!amount || loading}
              loading={loading}
              className="flex-1"
            >
              Send Tip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}