import React, { useEffect, useState } from 'react';
import { Swords, Coins, Crown, Timer, Medal } from 'lucide-react';
import { Tribeling } from './Tribeling';
import { Skeleton } from './ui/skeleton';
import { useTranslation } from '../lib/i18n-hooks';

// Stompers-style daily versus: group members compete on today's workout minutes.
// Winner at midnight takes the TC pot.
export function DailyVersus({ groupId, userId }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  const load = async () => {
    if (!groupId) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/versus?groupId=${encodeURIComponent(groupId)}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}`);
      if (res.ok) setData(await res.json());
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, [groupId, userId]);

  // Countdown to midnight
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight - now);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${h}h ${m}m`);
    };
    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, []);

  if (!groupId) return null;
  if (loading) {
    return (
      <div className="card space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }
  if (!data) return null;

  const { standings = [], pot = 0, last_result, your_rank } = data;
  const medalColors = ['text-yellow-400', 'text-surface-300', 'text-amber-600'];

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-surface-50 flex items-center gap-2">
          <Swords size={18} className="text-accent" /> {t('daily_versus')}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-surface-400"><Timer size={12} /> {countdown}</div>
      </div>

      {last_result && (
        <div className="text-xs bg-success/10 border border-success/30 text-success rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Crown size={13} /> Yesterday: <b>{last_result.winner_name}</b> took the {last_result.pot} TC pot!
        </div>
      )}

      {standings.length === 0 ? (
        <div className="text-sm text-surface-400 text-center py-3">
          {t('versus_empty')}
        </div>
      ) : (
        <div className="space-y-2">
          {standings.slice(0, 5).map((s, i) => (
            <div
              key={s.user_id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                s.user_id === userId
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-800/60 border-surface-700'
              }`}
            >
              <span className="w-6 flex justify-center">
                {i < 3 ? <Medal size={16} className={medalColors[i]} /> : <span className="text-xs text-surface-400">#{i + 1}</span>}
              </span>
              <Tribeling
                mood={i === 0 ? 'pumped' : 'steady'}
                stage={s.avatar?.stage}
                skin={s.avatar?.skin}
                accessory={s.avatar?.accessory}
                size={32}
                showLabel={false}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-surface-100 truncate">
                  {s.name}{s.user_id === userId ? ' (you)' : ''}
                </div>
                <div className="text-xs text-surface-400">{s.workouts} workout{s.workouts > 1 ? 's' : ''}</div>
              </div>
              <div className="text-sm font-bold text-surface-200 number-display">{s.minutes} min</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-surface-700">
        <span className="text-xs text-surface-400">{t('versus_hint')}</span>
        <span className="flex items-center gap-1 text-sm font-bold text-accent">
          <Coins size={14} /> {pot} TC pot
        </span>
      </div>
    </div>
  );
}

export default DailyVersus;
