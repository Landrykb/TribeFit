import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from './AuthProvider';
import { Mail, Lock, User, Zap } from 'lucide-react';

export function LoginModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.email, formData.password, formData.name);
      }

      if (result.success) {
        onClose();
        setFormData({ email: '', password: '', name: '' });
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center space-x-2">
          <Zap className="text-primary" size={20} />
          <span>{isLogin ? 'Welcome Back' : 'Join TribeFit'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">
              <User size={16} className="inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input"
              placeholder="Enter your full name"
              required={!isLogin}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-surface-200 mb-2">
            <Mail size={16} className="inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-200 mb-2">
            <Lock size={16} className="inline mr-2" />
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="input"
            placeholder="Enter your password"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>

        <div className="text-center pt-4 border-t border-surface-700">
          <p className="text-sm text-surface-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary-400 font-medium text-sm mt-1"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>

      {/* Demo credentials */}
      <div className="mt-4 p-3 bg-surface-800 rounded-lg border border-surface-600">
        <p className="text-xs text-surface-400 mb-2">Demo credentials:</p>
        <p className="text-xs text-surface-300">Email: demo@tribefit.app</p>
        <p className="text-xs text-surface-300">Password: demo123</p>
      </div>
    </Modal>
  );
}