import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

export function CoachRating({ isOpen, onClose, coach, hire, onSubmitRating }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;

    setLoading(true);
    try {
      await onSubmitRating({
        hireId: hire?.id,
        coachId: coach?.user_id || coach?.id,
        clientId: hire?.client_id,
        stars: rating,
        text: comment.trim()
      });
      
      // Reset and close
      setRating(0);
      setHoverRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Failed to submit rating:', error);
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
            <h2 className="text-xl font-bold text-white">Rate Coach</h2>
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
                {coach?.name?.charAt(0) || 'C'}
              </span>
            </div>
            <h3 className="font-semibold text-white">{coach?.name || 'Coach'}</h3>
            <p className="text-sm text-gray-400">How was your experience?</p>
          </div>

          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-all hover:scale-110"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Share your experience..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 min-w-0 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!rating || loading}
              className="flex-1 min-w-0 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-all flex items-center justify-center space-x-2"
            >
              {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
              <span>Submit Rating</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= Math.floor(rating)
              ? 'text-yellow-400 fill-yellow-400'
              : star <= rating
              ? 'text-yellow-400 fill-yellow-400/50'
              : 'text-gray-600'
          }`}
        />
      ))}
      <span className="text-sm text-gray-400 ml-1">
        {rating?.toFixed(1) || '0.0'}
      </span>
    </div>
  );
}