import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );

};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-50 max-w-sm pointer-events-none 
                 sm:top-4 sm:right-4 sm:left-auto sm:bottom-auto sm:transform-none 
                 left-1/2 -translate-x-1/2 bottom-4 
                 px-3 sm:px-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="space-y-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), toast.duration);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-danger border-red-500',
    warning: 'bg-warning border-yellow-500',
    info: 'bg-primary border-primary-500',
  };

  const IconComponent = icons[toast.type] || Info;

  return (
    <div
      className={`
        ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-2'}
        ${colors[toast.type] || 'bg-primary border-primary-500'}
        flex items-center p-4 rounded-lg shadow-soft border text-white
        transition-all duration-200 pointer-events-auto
      `}
    >
      <IconComponent size={20} className="flex-shrink-0 mr-3" />
      <p className="flex-1 min-w-0 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 ml-3 p-1 hover:bg-black/10 rounded transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};