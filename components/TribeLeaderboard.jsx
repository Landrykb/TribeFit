import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Trophy, Medal, Award, TrendingUp, Users, Zap } from 'lucide-react';

const getRankIcon = (rank) => {
  switch (rank) {
    case 1: return <Trophy className="text-yellow-500" size={20} />;
    case 2: return <Medal className="text-gray-400" size={20} />;
    case 3: return <Award className="text-amber-600" size={20} />;
    default: return <div className="w-5 h-5 bg-surface-600 rounded-full flex items-center justify-center text-xs text-surface-400">{rank}</div>;
  }
};

const getTribeReward = (rank) => {
  switch (rank) {
    case 1: return { reward: "Free Coach Session", color: "text-yellow-500" };
    case 2: return { reward: "50% Equipment Discount", color: "text-gray-400" };
    case 3: return { reward: "25% Equipment Discount", color: "text-amber-600" };
    default: return { reward: "Keep pushing!", color: "text-surface-400" };
  }
};

export function TribeLeaderboard({ isOpen, onClose, tribes = [] }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Tribe Leaderboard" size="xl">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <TrendingUp size={32} className="text-primary mx-auto mb-2" />
          <p className="text-surface-400 text-sm">
            Top performing tribes earn exclusive rewards and recognition
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tribes.map((tribe, index) => {
            const rankReward = getTribeReward(tribe.rank);
            
            return (
              <div 
                key={tribe.id}
                className={`p-4 rounded-xl border transition-all ${
                  tribe.rank <= 3 
                    ? 'bg-gradient-to-r from-surface-800 to-surface-700 border-primary/30 shadow-glow' 
                    : 'bg-surface-800 border-surface-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getRankIcon(tribe.rank)}
                    <div>
                      <h3 className="font-bold text-surface-50">{tribe.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-surface-400">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{tribe.members} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap size={14} />
                          <span>{tribe.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary number-display">
                      {tribe.balance} TC
                    </div>
                    <div className={`text-xs font-medium ${rankReward.color}`}>
                      {rankReward.reward}
                    </div>
                  </div>
                </div>

                {/* Progress indicators for top 3 */}
                {tribe.rank <= 3 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-surface-400">
                      <span>Weekly Activity</span>
                      <span>{Math.round((tribe.streak / 30) * 100)}%</span>
                    </div>
                    <div className="w-full bg-surface-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          tribe.rank === 1 ? 'bg-yellow-500' :
                          tribe.rank === 2 ? 'bg-gray-400' :
                          'bg-amber-600'
                        }`}
                        style={{ width: `${Math.round((tribe.streak / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-surface-800 rounded-lg p-4 border border-surface-600">
          <h3 className="font-medium text-surface-200 mb-2">Monthly Rewards</h3>
          <div className="text-sm text-surface-400 space-y-1">
            <div>🥇 #1 Tribe: Free coaching session for all members</div>
            <div>🥈 #2 Tribe: 50% discount on all equipment purchases</div>
            <div>🥉 #3 Tribe: 25% discount on equipment purchases</div>
            <div>📈 All tribes: Extra TC bonuses for consistent streaks</div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onClose}
          className="w-full"
        >
          Keep Climbing! 🚀
        </Button>
      </div>
    </Modal>
  );
}