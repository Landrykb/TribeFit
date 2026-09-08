import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Trophy, Medal, Award, TrendingUp, Users, Zap, Crown } from 'lucide-react';

const RANK_STYLE = {
  1: { Icon: Trophy, cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-500' },
  2: { Icon: Medal,  cls: 'bg-surface-700/60 text-surface-200 border-surface-600/60', bar: 'bg-surface-300' },
  3: { Icon: Award,  cls: 'bg-amber-600/15 text-amber-500 border-amber-600/30', bar: 'bg-amber-600' },
};

const getTribeReward = (rank) => {
  switch (rank) {
    case 1: return { reward: "Free Coach Session", color: "text-yellow-500" };
    case 2: return { reward: "50% Equipment Discount", color: "text-surface-300" };
    case 3: return { reward: "25% Equipment Discount", color: "text-amber-500" };
    default: return { reward: "Keep pushing!", color: "text-surface-400" };
  }
};

export function TribeLeaderboard({ isOpen, onClose, tribes = [] }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Tribe Leaderboard" size="xl">
      <div className="space-y-4">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={22} className="text-primary" />
          </div>
          <p className="text-surface-400 text-sm">
            Top performing tribes earn exclusive rewards and recognition
          </p>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto">
          {tribes.map((tribe) => {
            const rs = RANK_STYLE[tribe.rank];
            const rankReward = getTribeReward(tribe.rank);
            const top = tribe.rank <= 3;

            return (
              <div
                key={tribe.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  top
                    ? 'bg-surface-800/80 border-primary/30'
                    : 'bg-surface-800/60 border-surface-700/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${rs ? rs.cls : 'bg-surface-700 text-surface-400 border-surface-600'}`}>
                  {rs ? <rs.Icon size={18} /> : <span className="text-sm font-bold">{tribe.rank}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-surface-50 truncate">{tribe.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                    <span className="flex items-center gap-1"><Users size={12} /> {tribe.members}</span>
                    <span className="flex items-center gap-1"><Zap size={12} /> {tribe.streak}d</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-primary number-display">{tribe.balance} TC</div>
                  <div className={`text-[10px] font-medium ${rankReward.color}`}>{rankReward.reward}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface-800/60 rounded-2xl p-4 border border-surface-700/60">
          <h3 className="font-medium text-surface-200 mb-2 flex items-center gap-2"><Crown size={14} className="text-yellow-500" /> Monthly Rewards</h3>
          <div className="text-sm text-surface-400 space-y-1.5">
            <div className="flex items-center gap-2"><Trophy size={12} className="text-yellow-500" /> #1 Tribe: Free coaching session for all members</div>
            <div className="flex items-center gap-2"><Medal size={12} className="text-surface-300" /> #2 Tribe: 50% discount on all equipment</div>
            <div className="flex items-center gap-2"><Award size={12} className="text-amber-500" /> #3 Tribe: 25% discount on equipment</div>
            <div className="flex items-center gap-2"><TrendingUp size={12} className="text-primary" /> All tribes: extra TC bonuses for streaks</div>
          </div>
        </div>

        <Button variant="primary" onClick={onClose} className="w-full h-11">
          Keep Climbing!
        </Button>
      </div>
    </Modal>
  );
}
