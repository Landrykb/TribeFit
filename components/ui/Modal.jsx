"use client";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, onClose, title, children, size = 'md', contentClassName = '' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, [title]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, title, mounted]);

  if (!mounted) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 bg-black/60 light:bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[9999]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-gradient-to-br from-surface-800/95 to-surface-900/95 light:bg-white light:border-gray-200 backdrop-blur-lg border border-surface-700/50 rounded-3xl shadow-2xl ${sizeClasses[size]} w-full`}
          >
            <div className="p-6 border-b border-surface-700/50 light:border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">{title}</h2>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 6 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-surface-700/50 light:hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-surface-300 hover:text-surface-100 light:text-gray-500 light:hover:text-gray-700" />
                </motion.button>
              </div>
            </div>
            <div className={`p-6 max-h-[calc(90vh-120px)] overflow-y-auto ${contentClassName}`}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function ModalFooter({ children }) {
  return (
    <div className="flex space-x-3 pt-4 border-t border-surface-700 light:border-gray-200">
      {children}
    </div>
  );
}