import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/button';
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div>
            <label className="block text-sm font-bold text-surface-100 mb-3">
              <User size={16} className="inline mr-2 text-accent" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-4 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              placeholder="Enter your full name"
              required={!isLogin}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-surface-100 mb-3">
            <Mail size={16} className="inline mr-2 text-primary" />
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-4 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-surface-100 mb-3">
            <Lock size={16} className="inline mr-2 text-success" />
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full p-4 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            placeholder="Enter your password"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full h-12 text-base font-bold"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>

        <div className="text-center pt-6 border-t border-surface-700">
          <p className="text-sm text-surface-300">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary-400 font-bold text-sm mt-2 transition-colors duration-200"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl">
        <p className="text-sm font-bold text-accent mb-2">Demo credentials:</p>
        <p className="text-sm text-surface-200">Email: demo@tribefit.app</p>
        <p className="text-sm text-surface-200">Password: demo123</p>
      </div>
    </Modal>
  );
}