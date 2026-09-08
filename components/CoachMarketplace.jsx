'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Award, Flame, TrendingUp, Users, CheckCircle, Lock, AlertCircle, Coins, MessageCircle, Calendar, Target } from 'lucide-react';
import { Button } from './ui/button';
import { StarDisplay } from './ui/CoachRating';

export function CoachMarketplace({ 
  isOpen, 
  onClose, 
  userId, 
  userName,
  userTribeId,
  userStreak,
  userTotalWorkouts,
  isInTribe,
  onHireCoach,
  onBecomeCoach,
  walletBalance
}) {
  const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, eligibility, myCoaching
  const [coaches, setCoaches] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [filterTribe, setFilterTribe] = useState('all'); // all, tribe, external

  // Eligibility requirements
  const COACH_REQUIREMENTS = {
    minStreak: 14, // 2 weeks consistent
    minWorkouts: 30, // 30 total workouts
    mustBeInTribe: true,
    platformFeePercent: 10 // 10% platform fee
  };

  useEffect(() => {
    if (isOpen) {
      loadCoaches();
      checkEligibility();
    }
  }, [isOpen, userId]);

  const checkEligibility = async () => {
    try {
      const res = await fetch(`/api/coach/eligibility?userId=${userId}`);
      const data = await res.json();
      setEligibility(data);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    }
  };

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coach/list');
      const data = await res.json();
      setCoaches(data.coaches || []);
    } catch (error) {
      console.error('Failed to load coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAsCoach = async () => {
    setLoading(true);
    try {
      await onBecomeCoach();
      await checkEligibility();
      setActiveTab('marketplace');
      await loadCoaches(); // Reload coaches to see yourself
    } catch (error) {
      console.error('Failed to apply:', error);
      // Error is already handled in onBecomeCoach
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCoaches = () => {
    if (filterTribe === 'tribe') {
      return coaches.filter(c => c.tribe_id === userTribeId);
    } else if (filterTribe === 'external') {
      return coaches.filter(c => c.tribe_id !== userTribeId);
    }
    return coaches;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-surface-900 light:bg-white rounded-[22px] border-2 border-surface-700 light:border-gray-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="p-6 border-b border-surface-700 light:border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-surface-50 light:text-gray-900 flex items-center gap-2">
                <Award className="text-success" size={28} />
                Coach Marketplace
              </h2>
              <p className="text-surface-400 light:text-gray-600 mt-1">Find your perfect coach or become one</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-800 light:hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-surface-400 light:text-gray-600" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-success text-white'
                  : 'bg-surface-800 light:bg-gray-100 text-surface-300 light:text-gray-600 hover:bg-surface-700 light:hover:bg-gray-200'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Find Coaches
            </button>
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'eligibility'
                  ? 'bg-success text-white'
                  : 'bg-surface-800 light:bg-gray-100 text-surface-300 light:text-gray-600 hover:bg-surface-700 light:hover:bg-gray-200'
              }`}
            >
              <Target size={16} className="inline mr-2" />
              Become a Coach
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterTribe('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filterTribe === 'all'
                      ? 'bg-primary text-surface-950'
                      : 'bg-surface-800 light:bg-gray-100 text-surface-300 light:text-gray-600'
                  }`}
                >
                  All Coaches
                </button>
                <button
                  onClick={() => setFilterTribe('tribe')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filterTribe === 'tribe'
                      ? 'bg-primary text-surface-950'
                      : 'bg-surface-800 light:bg-gray-100 text-surface-300 light:text-gray-600'
                  }`}
                >
                  My Tribe
                </button>
                <button
                  onClick={() => setFilterTribe('external')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filterTribe === 'external'
                      ? 'bg-primary text-surface-950'
                      : 'bg-surface-800 light:bg-gray-100 text-surface-300 light:text-gray-600'
                  }`}
                >
                  Other Tribes
                </button>
              </div>

              {/* Coach List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-success border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-surface-400 light:text-gray-600 mt-4">Loading coaches...</p>
                </div>
              ) : getFilteredCoaches().length === 0 ? (
                <div className="text-center py-12 card relative overflow-hidden">
                  <Award size={48} className="text-surface-600 light:text-gray-400 mx-auto mb-4" />
                  <p className="text-surface-400 light:text-gray-600 text-lg">No coaches available yet</p>
                  <p className="text-surface-500 light:text-gray-500 mt-2">Be the first to offer coaching!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredCoaches().map((coach) => (
                    <CoachCard
                      key={coach.id}
                      coach={coach}
                      onHire={() => onHireCoach(coach)}
                      onViewDetails={() => setSelectedCoach(coach)}
                      userTribeId={userTribeId}
                      walletBalance={walletBalance}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'eligibility' && (
            <EligibilityChecker
              userStreak={userStreak}
              userTotalWorkouts={userTotalWorkouts}
              isInTribe={isInTribe}
              requirements={COACH_REQUIREMENTS}
              eligibility={eligibility}
              onApply={handleApplyAsCoach}
              loading={loading}
            />
          )}
        </div>

        {/* Coach Details Modal */}
        {selectedCoach && (
          <CoachDetailsModal
            coach={selectedCoach}
            onClose={() => setSelectedCoach(null)}
            onHire={() => {
              onHireCoach(selectedCoach);
              setSelectedCoach(null);
            }}
            walletBalance={walletBalance}
          />
        )}
      </div>
    </div>
  );
}

function CoachCard({ coach, onHire, onViewDetails, userTribeId, walletBalance }) {
  const isInMyTribe = coach.tribe_id === userTribeId;
  const price = coach.pricing?.per_session || 15; // Default mid-tier: 15 TC (¥1,500)
  const canAfford = walletBalance >= price;

  return (
    <div className="card bg-surface-800 light:bg-white hover-elevate p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-surface-950">
            {coach.name?.charAt(0) || 'C'}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-surface-50 light:text-gray-900 truncate">{coach.name}</h3>
            {isInMyTribe && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full whitespace-nowrap">
                Same Tribe
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-surface-400 light:text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-accent" />
              <span>{coach.streak || 0} streak</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-success" />
              <span>{coach.total_sessions || 0} sessions</span>
            </div>
          </div>

          {/* Rating */}
          {coach.avg_rating > 0 && (
            <div className="mb-2">
              <StarDisplay rating={coach.avg_rating} size={14} />
            </div>
          )}

          {/* Specialties */}
          {coach.specialties && coach.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {coach.specialties.slice(0, 3).map((specialty, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-surface-700 light:bg-gray-100 text-surface-300 light:text-gray-600 text-xs rounded">
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {/* Price & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Coins size={16} className="text-accent" />
              <span className="text-lg font-bold text-accent">{price}</span>
              <span className="text-xs text-surface-400 light:text-gray-600">TC/session</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onViewDetails}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                Details
              </Button>
              <Button
                onClick={onHire}
                variant="success"
                size="sm"
                disabled={!canAfford}
                className="h-8 px-3 text-xs"
              >
                {canAfford ? 'Hire' : 'Low Balance'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EligibilityChecker({ userStreak, userTotalWorkouts, isInTribe, requirements, eligibility, onApply, loading }) {
  const checks = [
    {
      label: 'Be part of a Tribe',
      requirement: 'Must be in a Tribe (not Squad)',
      met: isInTribe,
      current: isInTribe ? 'In Tribe ✓' : 'Not in Tribe',
      icon: Users
    },
    {
      label: 'Workout Consistency',
      requirement: `${requirements.minStreak}+ day streak`,
      met: userStreak >= requirements.minStreak,
      current: `${userStreak} days`,
      icon: Flame
    },
    {
      label: 'Total Workouts',
      requirement: `${requirements.minWorkouts}+ completed workouts`,
      met: userTotalWorkouts >= requirements.minWorkouts,
      current: `${userTotalWorkouts} workouts`,
      icon: TrendingUp
    }
  ];

  const allRequirementsMet = checks.every(c => c.met);
  const isAlreadyCoach = eligibility?.isCoach || false;
  const applicationPending = eligibility?.applicationPending || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Award size={56} className="text-success mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-surface-50 light:text-gray-900 mb-2">
          Become a TribeFit Coach
        </h3>
        <p className="text-surface-400 light:text-gray-600 max-w-xl mx-auto">
          Share your fitness journey and help others achieve their goals. Earn TribeCoins while making an impact!
        </p>
      </div>

      {/* Requirements */}
      <div className="card bg-surface-800 light:bg-gray-50 p-6">
        <h4 className="text-lg font-bold text-surface-50 light:text-gray-900 mb-4">Eligibility Requirements</h4>
        <div className="space-y-4">
          {checks.map((check, idx) => {
            const Icon = check.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  check.met
                    ? 'bg-success/10 border border-success/30'
                    : 'bg-surface-700 light:bg-white border border-surface-600 light:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  check.met ? 'bg-success/20' : 'bg-surface-700 light:bg-gray-200'
                }`}>
                  {check.met ? (
                    <CheckCircle size={20} className="text-success" />
                  ) : (
                    <Icon size={20} className="text-surface-400 light:text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-surface-50 light:text-gray-900">{check.label}</div>
                  <div className="text-sm text-surface-400 light:text-gray-600">{check.requirement}</div>
                </div>
                <div className={`font-bold ${
                  check.met ? 'text-success' : 'text-surface-400 light:text-gray-500'
                }`}>
                  {check.current}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Fee Info */}
      <div className="card bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-surface-50 light:text-gray-900 mb-1">Platform Fee</h5>
            <p className="text-sm text-surface-400 light:text-gray-600">
              TribeFit charges a <span className="font-bold text-primary">{requirements.platformFeePercent}% platform fee</span> on coaching sessions.
              This helps maintain the platform and support the community.
            </p>
            <p className="text-sm text-surface-400 light:text-gray-600 mt-2">
              <strong>Example:</strong> If you charge 15 TC/session, you'll receive ~14 TC after the platform fee.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="card bg-accent/5 border border-accent/20 p-4">
        <h5 className="font-semibold text-surface-50 light:text-gray-900 mb-3">Coach Benefits</h5>
        <ul className="space-y-2">
          {[
            'Earn TribeCoins for every coaching session',
            'Build your reputation with client ratings',
            'Access to exclusive coach community',
            'Set your own schedule and pricing',
            'Help others achieve their fitness goals'
          ].map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-surface-300 light:text-gray-700">
              <CheckCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="text-center">
        {isAlreadyCoach ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-success/20 border border-success/30 rounded-lg">
            <CheckCircle size={20} className="text-success" />
            <span className="text-success font-semibold">You're already a coach!</span>
          </div>
        ) : applicationPending ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent/20 border border-accent/30 rounded-lg">
            <AlertCircle size={20} className="text-accent" />
            <span className="text-accent font-semibold">Application under review</span>
          </div>
        ) : allRequirementsMet ? (
          <Button
            onClick={onApply}
            variant="success"
            size="lg"
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Award size={20} className="mr-2" />
                Apply to Become Coach
              </>
            )}
          </Button>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-surface-700 light:bg-gray-100 border border-surface-600 light:border-gray-300 rounded-lg">
            <Lock size={20} className="text-surface-400 light:text-gray-500" />
            <span className="text-surface-400 light:text-gray-600 font-semibold">Complete requirements to apply</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CoachDetailsModal({ coach, onClose, onHire, walletBalance }) {
  const price = coach.pricing?.per_session || 15; // Default mid-tier: 15 TC (¥1,500)
  const canAfford = walletBalance >= price;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-surface-900 light:bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-surface-950">
                  {coach.name?.charAt(0) || 'C'}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-surface-50 light:text-gray-900">{coach.name}</h3>
                {coach.avg_rating > 0 && (
                  <StarDisplay rating={coach.avg_rating} size={18} />
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-800 light:hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-surface-400 light:text-gray-600" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-surface-800 light:bg-gray-50 rounded-lg">
              <Flame size={24} className="text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-50 light:text-gray-900">{coach.streak || 0}</div>
              <div className="text-xs text-surface-400 light:text-gray-600">Day Streak</div>
            </div>
            <div className="text-center p-4 bg-surface-800 light:bg-gray-50 rounded-lg">
              <TrendingUp size={24} className="text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-50 light:text-gray-900">{coach.total_sessions || 0}</div>
              <div className="text-xs text-surface-400 light:text-gray-600">Sessions</div>
            </div>
            <div className="text-center p-4 bg-surface-800 light:bg-gray-50 rounded-lg">
              <Users size={24} className="text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-50 light:text-gray-900">{coach.clients_count || 0}</div>
              <div className="text-xs text-surface-400 light:text-gray-600">Clients</div>
            </div>
          </div>

          {/* Bio */}
          {coach.bio && (
            <div className="mb-6">
              <h4 className="font-bold text-surface-50 light:text-gray-900 mb-2">About</h4>
              <p className="text-surface-300 light:text-gray-700">{coach.bio}</p>
            </div>
          )}

          {/* Specialties */}
          {coach.specialties && coach.specialties.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-surface-50 light:text-gray-900 mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {coach.specialties.map((specialty, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-surface-800 light:bg-gray-100 text-surface-200 light:text-gray-700 rounded-lg text-sm font-medium">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="card bg-accent/10 border border-accent/30 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-surface-400 light:text-gray-600 mb-1">Price per session</div>
                <div className="flex items-center gap-2">
                  <Coins size={24} className="text-accent" />
                  <span className="text-3xl font-bold text-accent">{price}</span>
                  <span className="text-surface-400 light:text-gray-600">TC</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-surface-400 light:text-gray-600">Your balance</div>
                <div className="text-xl font-bold text-surface-50 light:text-gray-900">{walletBalance} TC</div>
              </div>
            </div>
          </div>

          {/* Action */}
          <Button
            onClick={onHire}
            variant="success"
            size="lg"
            disabled={!canAfford}
            className="w-full"
          >
            {canAfford ? (
              <>
                <Award size={20} className="mr-2" />
                Hire Coach for {price} TC
              </>
            ) : (
              <>
                <Lock size={20} className="mr-2" />
                Insufficient Balance
              </>
            )}
          </Button>
          {!canAfford && (
            <p className="text-sm text-center text-surface-400 light:text-gray-600 mt-2">
              You need {price - walletBalance} more TC to hire this coach
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
