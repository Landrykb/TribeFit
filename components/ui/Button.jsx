import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-600 active:scale-[0.98] shadow-soft hover:shadow-glow",
    accent: "bg-accent text-white hover:bg-accent-600 active:scale-[0.98] shadow-soft hover:shadow-accent-glow",
    ghost: "bg-surface-800/50 border border-surface-600 text-surface-100 hover:bg-surface-700 hover:border-surface-500",
    danger: "bg-danger text-white hover:bg-red-600 active:scale-[0.98]",
    success: "bg-success text-white hover:bg-green-600 active:scale-[0.98]",
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm rounded-lg h-9",
    md: "px-4 py-2 text-sm rounded-xl h-11",
    lg: "px-6 py-3 text-base rounded-xl h-12",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="animate-spin h-4 w-4" />}
      {children}
    </button>
  );
}