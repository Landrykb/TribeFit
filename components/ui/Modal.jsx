import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className={`bg-surface-900 rounded-2xl ${sizeClasses[size]} w-full animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-surface-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-surface-50">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-surface-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({ children }) {
  return (
    <div className="flex space-x-3 pt-4 border-t border-surface-700">
      {children}
    </div>
  );
}