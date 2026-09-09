import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApi, optimisticMutate } from '../lib/api';
import { Zap, Shield, Rocket, Package, Loader2, Coins, Crosshair, X } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { Skeleton } from './ui/skeleton';
import { useTranslation } from '../lib/i18n-hooks';

const ITEM_ICONS = {
  snatch: { Icon: Crosshair, className: 'text-accent',  blurb: 'Attack: halve a rival’s latest workout' },
  shield: { Icon: Shield,    className: 'text-primary-300', blurb: 'Defense: auto-saves your next missed streak' },
  boost:  { Icon: Rocket,    className: 'text-success', blurb: 'Bonus: next workout earns +10 TC' },
};

const RARITY_STYLES = {
  common: 'border-surface-600',
  rare: 'border-primary/60',
  epic: 'border-accent/70',
};

const RARITY_LABELS = { common: 'Common', rare: 'Rare', epic: 'Epic' };

// Stompers-style items: collect power-ups, open packs, whack rivals.
export function PowerUps({ userId, onWalletChange }) {
  const toast = useToast();
  const { t } = useTranslation();
  const [busy, setBusy] = useState('');
  const [reveal, setReveal] = useState(null);
  const [selected, setSelected] = useState(null); // magnified item detail
  const [snatchTarget, setSnatchTarget] = useState('');

  const itemsUrl = userId ? `/api/items?userId=${encodeURIComponent(userId)}` : null;
  const { data, loading, mutate } = useApi(itemsUrl);

  const postItems = (payload) => fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...payload }),
  }).then(async (res) => {
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  });

  const act = async (payload, busyKey, optimisticUpdater) => {
    setBusy(busyKey);
    try {
      const promise = postItems(payload);
      const json = optimisticUpdater
        ? await optimisticMutate(itemsUrl, optimisticUpdater, promise)
        : await promise;
      if (typeof json?.wallet_balance_tc === 'number') onWalletChange?.(json.wallet_balance_tc);
      if (!optimisticUpdater) await mutate(); // refresh from server
      return json;
    } catch (e) {
      toast.error(e.message);
      return null;
    } finally {
      setBusy('');
    }
  };

  const openPack = async () => {
    const json = await act({ action: 'open_pack' }, 'pack');
    if (json?.cards) {
      setReveal(json.cards);
      setTimeout(() => setReveal(null), 4000);
    }
  };

  const useItem = async (type) => {
    const payload = { action: 'use_item', item: type };
    if (type === 'snatch') {
      if (!snatchTarget) { toast.error('Pick a rival to snatch first'); return; }
      payload.targetUserId = snatchTarget;
    }
    const json = await act(payload, `use_${type}`, (current) => {
      if (!current) return current;
      const nextCounts = { ...current.counts, [type]: Math.max(0, (current.counts?.[type] || 0) - 1) };
      const nextEffects = { ...current.effects };
      if (type !== 'snatch') nextEffects[type] = true;
      return { ...current, counts: nextCounts, effects: nextEffects };
    });
    if (json?.message) { toast.success(json.message); setSelected(null); }
    if (type === 'snatch') setSnatchTarget('');
  };

  if (loading) {
    return (
      <div className="card space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }
  if (!data) return null;

  const { catalog, card_pack, counts = {}, effects = {}, targets = [] } = data;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-surface-50 flex items-center gap-2">
          <Zap size={18} className="text-primary" /> {t('power_ups')}
        </h3>
        <div className="flex gap-2 text-xs">
          {effects.shield && <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary-300 border border-primary/30 flex items-center gap-1"><Shield size={11} /> Shield on</span>}
          {effects.boost && <span className="px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30 flex items-center gap-1"><Rocket size={11} /> Boost on</span>}
        </div>
      </div>
      <p className="text-xs text-surface-400 -mt-2">{t('power_ups_hint')}</p>

      {/* Card pack reveal */}
      {reveal && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 animate-scale-in">
          <div className="text-xs font-bold text-primary-300 mb-2">{t('you_got')}</div>
          <div className="grid grid-cols-3 gap-2">
            {reveal.map((card, i) => {
              const meta = ITEM_ICONS[card.id] || ITEM_ICONS.boost;
              return (
                <div key={i} className={`rounded-lg border ${RARITY_STYLES[card.rarity]} bg-surface-800 p-2 text-center animate-confetti-pop`} style={{ animationDelay: `${i * 140}ms` }}>
                  <meta.Icon size={20} className={`${meta.className} mx-auto mb-1`} />
                  <div className="text-xs font-medium text-surface-100">{card.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Item cards — tap to magnify */}
      <div className="grid grid-cols-3 gap-2">
        {Object.values(catalog).map((def) => {
          const meta = ITEM_ICONS[def.id];
          const owned = counts[def.id] || 0;
          return (
            <button
              key={def.id}
              onClick={() => setSelected(def)}
              className={`rounded-xl border-2 ${RARITY_STYLES[def.rarity]} bg-surface-800/60 p-3 flex flex-col items-center text-center gap-1.5 transition-transform hover:scale-[1.04] active:scale-95`}
            >
              <meta.Icon size={26} className={meta.className} />
              <div className="text-xs font-bold text-surface-100 leading-tight">{def.name}</div>
              <div className="text-[10px] text-surface-400 leading-tight">{meta.blurb}</div>
              <div className="text-[10px] font-bold text-surface-200">
                {owned > 0 ? `x${owned} ${t('owned').toLowerCase()}` : `${def.price_tc} TC`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Pack purchase — explicit about what it does */}
      <Button onClick={openPack} loading={busy === 'pack'} variant="accent" className="w-full h-11">
        <Package size={16} /> {t('open_pack')} — {t('pack_contains', { cards: card_pack.cards })} · {card_pack.price_tc} TC
      </Button>
      <p className="text-[11px] text-surface-500 text-center -mt-2">{t('pack_detail', { cards: card_pack.cards })}</p>

      {/* Magnified item detail — spring zoom */}
      <AnimatePresence>
      {selected && (() => {
        const meta = ITEM_ICONS[selected.id];
        const owned = counts[selected.id] || 0;
        const isBusy = busy === `use_${selected.id}` || busy === `buy_${selected.id}`;
        const needsTarget = selected.id === 'snatch';
        return (
          <motion.div
            key="item-detail"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-surface-900 border-2 border-surface-600 rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl relative"
              initial={{ scale: 0.4, y: 60, rotate: -4, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.7, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-surface-700 text-surface-400">
                <X size={16} />
              </button>
              <motion.div
                className={`w-20 h-20 mx-auto rounded-2xl border-2 ${RARITY_STYLES[selected.rarity]} bg-surface-800 flex items-center justify-center mb-3`}
                initial={{ rotate: -10, scale: 0.6 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.08 }}
              >
                <meta.Icon size={40} className={meta.className} />
              </motion.div>
              <div className="text-lg font-bold text-surface-50">{selected.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-surface-400 mb-2">{RARITY_LABELS[selected.rarity]}</div>
              <p className="text-sm text-surface-200 mb-1">{selected.description}</p>
              <p className="text-xs text-surface-400 mb-4">{owned > 0 ? `x${owned} ${t('owned').toLowerCase()}` : `${selected.price_tc} TC`}</p>

              {needsTarget && targets.length > 0 && (
                <select
                  value={snatchTarget}
                  onChange={(e) => setSnatchTarget(e.target.value)}
                  className="w-full p-2 mb-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 text-sm"
                >
                  <option value="">{t('pick_rival')}</option>
                  {targets.map(t => <option key={t.id} value={t.id}>{t.name} · {t.streak}d streak</option>)}
                </select>
              )}
              {needsTarget && targets.length === 0 && (
                <p className="text-xs text-surface-400 mb-3">{t('snatch_no_targets')}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!!busy}
                  onClick={() => act({ action: 'buy_item', item: selected.id }, `buy_${selected.id}`, (current) => {
                    if (!current) return current;
                    const item = current.catalog?.[selected.id];
                    const price = item?.price_tc || selected.price_tc || 0;
                    return {
                      ...current,
                      counts: { ...current.counts, [selected.id]: (current.counts?.[selected.id] || 0) + 1 },
                      wallet_balance_tc: (current.wallet_balance_tc || 0) - price,
                    };
                  })}
                >
                  <Coins size={13} className="text-accent" /> {t('buy_for', { price: selected.price_tc })}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={isBusy}
                  disabled={owned === 0 || (needsTarget && (targets.length === 0 || !snatchTarget))}
                  onClick={() => useItem(selected.id)}
                >
                  {t('use_now')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
      </AnimatePresence>
    </div>
  );
}

export default PowerUps;
