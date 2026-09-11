import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, optimisticMutate } from '../lib/api';
import { Lock, Check, Coins, Tv, Dumbbell, Sparkles, ChevronLeft, ChevronRight, Wand2, RotateCcw } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { Tribeling } from './Tribeling';
import { HAIR_STYLES } from './FlatChibi';
import { Skeleton } from './ui/skeleton';
import { useTranslation } from '../lib/i18n-hooks';

// Avatar Studio - Stompers-style skin/accessory customization + evolution track.
export function AvatarStudio({ isOpen, onClose, userId, onWalletChange }) {
  const toast = useToast();
  const { t } = useTranslation();
  const [busy, setBusy] = useState('');
  const [previewSkin, setPreviewSkin] = useState(null);
  const [previewAccessory, setPreviewAccessory] = useState(null);
  const [previewCustom, setPreviewCustom] = useState(null);
  const [previewParts, setPreviewParts] = useState(null);

  const avatarUrl = userId ? `/api/avatar?userId=${encodeURIComponent(userId)}` : null;
  const { data, loading, mutate } = useApi(avatarUrl);

  const CUSTOM_COLORS = {
    body: ['#A3E635', '#FF9F1C', '#2EC4B6', '#4CC9F0', '#FF5436', '#4A4A63'],
    hair: ['#2EC4B6', '#1A1A24', '#FF5436', '#FFD166', '#4CC9F0', '#8A63D2'],
    shirt: ['#FFFFFF', '#1A1A24', '#FF9F1C', '#4CC9F0', '#FF5436', '#A3E635'],
    shorts: ['#2B3A55', '#1A1A24', '#8B5E34', '#4CC9F0'],
    shoes: ['#2EC4B6', '#FF5436', '#1A1A24', '#FFD166'],
  };

  const updateCustom = (key, value) => {
    const next = { ...(previewCustom || a?.custom || {}), [key]: value, enabled: true };
    setPreviewCustom(next);
    act({ action: 'set_custom', custom: next }, `custom_${key}`);
  };

  const buildOptimisticAvatar = (payload, current) => {
    const avatar = current?.avatar || {};
    const wallet = current?.wallet_balance_tc || 0;
    switch (payload.action) {
      case 'set_skin':
        return { skin: payload.skin };
      case 'buy_skin': {
        const def = current?.skins?.[payload.skin];
        return {
          skin: payload.skin,
          owned_skins: Array.from(new Set([...(avatar.owned_skins || []), payload.skin])),
          wallet_balance_tc: wallet - (def?.price_tc || 0),
        };
      }
      case 'select_accessory':
        return { accessory: payload.accessory };
      case 'buy_accessory': {
        const def = current?.accessories?.[payload.accessory];
        return {
          accessory: payload.accessory,
          owned_accessories: Array.from(new Set([...(avatar.owned_accessories || []), payload.accessory])),
          wallet_balance_tc: wallet - (def?.price_tc || 0),
        };
      }
      case 'set_part': {
        const parts = { ...(avatar.parts || {}), [payload.part]: payload.idx };
        return { parts };
      }
      case 'clear_part': {
        const parts = { ...(avatar.parts || {}) };
        parts[payload.part] = 0;
        return { parts };
      }
      case 'select_look': {
        const budget = avatar.look_budget || {};
        const charge = budget.remaining > 0 ? 0 : (budget.fee_tc || 0);
        return {
          preset: payload.look,
          parts: {},
          look_budget: { ...budget, used: (budget.used || 0) + 1, remaining: Math.max(0, (budget.remaining || 0) - 1) },
          wallet_balance_tc: wallet - charge,
        };
      }
      case 'buy_look': {
        const def = current?.looks?.[payload.look];
        return {
          preset: payload.look,
          parts: {},
          owned_looks: Array.from(new Set([...(avatar.owned_looks || []), payload.look])),
          wallet_balance_tc: wallet - (def?.price_tc || 0),
        };
      }
      case 'clear_preset':
        return { preset: null };
      case 'set_custom':
        return { custom: payload.custom };
      case 'toggle_custom':
        return { custom: { ...(avatar.custom || {}), enabled: payload.enabled !== false } };
      default:
        return {};
    }
  };

  const act = async (payload, busyKey) => {
    setBusy(busyKey);
    try {
      const promise = fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...payload }),
      }).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed');
        return json;
      });
      const json = await optimisticMutate(avatarUrl, (current) => {
        if (!current) return current;
        const optimisticAvatar = buildOptimisticAvatar(payload, current);
        const { wallet_balance_tc: nextWallet, ...avatarUpdates } = optimisticAvatar;
        return {
          ...current,
          avatar: { ...current.avatar, ...avatarUpdates },
          wallet_balance_tc: nextWallet ?? current.wallet_balance_tc,
        };
      }, promise);
      if (typeof json.wallet_balance_tc === 'number') onWalletChange?.(json.wallet_balance_tc);
      if (json.unlocked) toast.success(`${json.unlocked.name} unlocked!`);
    } catch (e) {
      // Rollback previews to server state on error
      setPreviewSkin(null);
      setPreviewAccessory(null);
      setPreviewCustom(null);
      setPreviewParts(null);
      toast.error(e.message);
    } finally {
      setBusy('');
    }
  };

  const a = data?.avatar;
  const curSkin = previewSkin || a?.skin || 'ember';
  const curAccessory = previewAccessory !== null ? previewAccessory : (a?.accessory || 'none');

  // ---- Look try-on experience ----
  // `browsing` is the look the user is inspecting in the big preview. It is only
  // persisted once they hit "Wear it" / "Unlock", so browsing is always free.
  const looks = useMemo(() => Object.values(data?.looks || {}), [data]);
  const families = useMemo(() => {
    const out = [];
    for (const l of looks) {
      let group = out.find(g => g.name === l.family);
      if (!group) { group = { name: l.family, items: [] }; out.push(group); }
      group.items.push(l);
    }
    return out;
  }, [looks]);

  const [browsing, setBrowsing] = useState(null);
  useEffect(() => {
    if (isOpen) setBrowsing(a?.preset || null);
  }, [isOpen, a?.preset]);

  const budget = a?.look_budget || { remaining: 0, allowance: 0, fee_tc: data?.restyle_fee_tc || 0 };
  const ownedLooks = a?.owned_looks || [];
  const browsingDef = browsing ? data?.looks?.[browsing] : null;
  const browsingOwned = browsing ? ownedLooks.includes(browsing) : true;
  const stageReached = (id) => {
    const order = ['sprout', 'rookie', 'athlete', 'beast', 'legend'];
    return order.indexOf(a?.stage?.id) >= order.indexOf(id);
  };
  const browsingStageOk = browsingDef ? stageReached(browsingDef.stage) : true;
  const isEquipped = (a?.preset || null) === browsing;

  const step = (dir) => {
    if (!looks.length) return;
    const ids = [null, ...looks.map(l => l.id)];
    const i = ids.indexOf(browsing);
    setBrowsing(ids[(i + dir + ids.length) % ids.length]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('avatar_studio')} size="lg">
      {loading || !a ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-28 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Status strip: stage, wallet, remaining free restyles */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-bold">
              {a.stage?.name}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-800 border border-surface-700 text-surface-200 flex items-center gap-1">
              <Coins size={11} className="text-accent" />{data.wallet_balance_tc ?? 0} TC
            </span>
            <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1 ${
              budget.remaining > 0
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-surface-800 border-surface-700 text-surface-400'
            }`}>
              <Wand2 size={11} />
              {budget.remaining > 0 ? `${budget.remaining} free change${budget.remaining === 1 ? '' : 's'}` : `${budget.fee_tc} TC / change`}
            </span>
          </div>

          {/* Big try-on stage: browse looks without committing */}
          <div className="relative flex flex-col items-center py-5 bg-gradient-to-b from-surface-800/70 to-surface-900/40 rounded-3xl border border-surface-700 overflow-hidden">
            <div className="absolute inset-x-8 top-6 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            <button
              onClick={() => step(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface-800/90 border border-surface-600 text-surface-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              aria-label="Previous look"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => step(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface-800/90 border border-surface-600 text-surface-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              aria-label="Next look"
            >
              <ChevronRight size={18} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={browsing || 'evolution'}
                initial={{ opacity: 0, scale: 0.82, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                className={browsingOwned && browsingStageOk ? '' : 'opacity-90'}
              >
                <div style={{ filter: browsingStageOk ? 'none' : 'grayscale(0.85)' }}>
                  <Tribeling
                    mood={a.mood}
                    energy={a.energy}
                    streak={a.streak}
                    stage={a.stage?.id}
                    skin={curSkin}
                    accessory={curAccessory}
                    custom={previewCustom || a.custom}
                    parts={browsing ? null : (previewParts || a.parts)}
                    preset={browsing}
                    size={210}
                    showLabel={false}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-3 text-center px-10">
              <div className="text-base font-bold text-surface-100">
                {browsingDef ? browsingDef.name : `${a.stage?.name} (Evolution)`}
              </div>
              <div className="text-[11px] text-surface-400 mt-0.5">
                {!browsingDef
                  ? 'Your natural look — grows as you evolve'
                  : !browsingStageOk
                    ? `Locked until ${browsingDef.stage}`
                    : browsingOwned ? 'Unlocked' : `${browsingDef.price_tc} TC to unlock`}
              </div>
            </div>

            {/* Commit action */}
            <div className="mt-3 px-4 w-full flex flex-col items-center gap-1.5">
              {isEquipped ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
                  <Check size={14} /> Currently worn
                </div>
              ) : !browsingStageOk ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-400">
                  <Lock size={14} /> Keep training to unlock
                </div>
              ) : !browsingOwned ? (
                <Button
                  size="sm"
                  disabled={!!busy}
                  onClick={() => act({ action: 'buy_look', look: browsing }, `buy_${browsing}`)}
                  className="gap-1.5"
                >
                  <Coins size={14} /> Unlock for {browsingDef.price_tc} TC
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={!!busy}
                  onClick={() => act(
                    browsing ? { action: 'select_look', look: browsing } : { action: 'clear_preset' },
                    `wear_${browsing || 'evolution'}`,
                  )}
                  className="gap-1.5"
                >
                  <Wand2 size={14} /> Wear it
                </Button>
              )}
              {browsing && browsingOwned && browsingStageOk && !isEquipped && (
                <div className="text-[10px] text-surface-400">
                  {budget.remaining > 0
                    ? `${budget.remaining} free change${budget.remaining === 1 ? '' : 's'} left`
                    : `Costs ${budget.fee_tc} TC — evolve for more free changes`}
                </div>
              )}
            </div>
          </div>

          {/* Look picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-surface-100 flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> Looks
              </div>
              {a.preset && (
                <button
                  onClick={() => { setBrowsing(null); act({ action: 'clear_preset' }, 'clear_preset'); }}
                  className="text-[10px] px-2 py-1 rounded-full border border-surface-600 text-surface-300 flex items-center gap-1 hover:border-surface-500 hover:text-surface-100"
                >
                  <RotateCcw size={10} /> Reset to evolution
                </button>
              )}
            </div>

            {/* Evolution art (always free, always available) */}
            <button
              onClick={() => setBrowsing(null)}
              className={`w-full mb-3 flex items-center gap-3 rounded-2xl border-2 p-2 text-left transition-all ${
                browsing === null ? 'border-primary bg-primary/10' : 'border-surface-700 bg-surface-800/60 hover:border-surface-600'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-surface-900/60 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-surface-100">{a.stage?.name} · Evolution art</div>
                <div className="text-[10px] text-surface-400 truncate">Free forever — evolves with your workouts</div>
              </div>
            </button>

            {families.map((fam) => (
              <div key={fam.name} className="mb-3">
                <div className="text-[11px] uppercase tracking-wide text-surface-400 mb-1.5">{fam.name}</div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {fam.items.map((l) => {
                    const owned = ownedLooks.includes(l.id);
                    const stageOk = stageReached(l.stage);
                    const active = browsing === l.id;
                    const worn = a.preset === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setBrowsing(l.id)}
                        className={`relative flex-shrink-0 w-[68px] rounded-2xl border-2 p-1 transition-all ${
                          active ? 'border-primary bg-primary/15 scale-105' : 'border-surface-700 bg-surface-800/60 hover:border-surface-600'
                        }`}
                        title={l.name}
                      >
                        <img
                          src={`/avatar/presets/${l.id}`}
                          alt={l.name}
                          className="w-full h-14 object-contain"
                          style={{ filter: stageOk ? (owned ? 'none' : 'grayscale(0.5)') : 'grayscale(1) brightness(0.6)' }}
                        />
                        <div className="text-[9px] text-surface-300 truncate px-0.5">{l.color || l.name}</div>
                        {worn && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success text-surface-900 flex items-center justify-center">
                            <Check size={10} />
                          </span>
                        )}
                        {!stageOk && (
                          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-surface-900/40">
                            <Lock size={14} className="text-surface-300" />
                          </span>
                        )}
                        {stageOk && !owned && (
                          <span className="absolute -top-1 -right-1 px-1 h-4 rounded-full bg-accent text-[8px] font-bold text-surface-900 flex items-center">
                            {l.price_tc}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Custom look — flat avatar maker (hidden until flat art assets exist) */}
          {false && <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-surface-100 flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> Custom Look
              </span>
              <button
                onClick={() => act({ action: 'toggle_custom', enabled: !(previewCustom?.enabled ?? a.custom?.enabled) }, 'toggle_custom')}
                className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                  (previewCustom?.enabled ?? a.custom?.enabled)
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-surface-800 border-surface-600 text-surface-300'
                }`}
              >
                {(previewCustom?.enabled ?? a.custom?.enabled) ? 'On' : 'Off'}
              </button>
            </div>
            {(previewCustom?.enabled ?? a.custom?.enabled) && (
              <div className="space-y-2.5 bg-surface-800/50 rounded-2xl border border-surface-700 p-3">
                {Object.entries({ body: 'Body', hair: 'Hair', shirt: 'Shirt', shorts: 'Shorts', shoes: 'Shoes' }).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[11px] text-surface-400 w-12">{label}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {CUSTOM_COLORS[key].map((c) => (
                        <button
                          key={c}
                          onClick={() => updateCustom(key, c)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                            (previewCustom?.[key] || a.custom?.[key]) === c ? 'border-white scale-110' : 'border-surface-600'
                          }`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-surface-400 w-12">Style</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {HAIR_STYLES.map((h) => (
                      <button
                        key={h}
                        onClick={() => updateCustom('hairStyle', h)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border-2 transition-all capitalize ${
                          (previewCustom?.hairStyle || a.custom?.hairStyle) === h
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-surface-600 bg-surface-800 text-surface-300'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>}

          {/* Evolution track */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-surface-100 flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> {t('evolution')}: {a.stage?.name}
              </span>
              <span className="text-xs text-surface-400">{t('workouts_count', { count: a.stage_progress?.current || 0 })}</span>
            </div>
            {a.stage_progress?.next_stage && (
              <div className="h-2 rounded-full bg-surface-700 overflow-hidden mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (a.stage_progress.current / a.stage_progress.next_stage.min_workouts) * 100)}%` }}
                />
              </div>
            )}
            <div className="text-xs text-surface-400">
              {a.stage_progress?.next_stage
                ? t('next_evolution', { left: a.stage_progress.next_stage.min_workouts - a.stage_progress.current, stage: a.stage_progress.next_stage.name, perk: a.stage_progress.next_stage.perk })
                : t('max_evolution', { perk: a.stage?.perk })}
            </div>
            {/* What each stage unlocks */}
            <div className="mt-3 space-y-1.5">
              {['sprout', 'rookie', 'athlete', 'beast', 'legend'].map((sid) => {
                const reached = stageReached(sid);
                const unlocks = looks.filter(l => l.stage === sid);
                const free = unlocks.filter(l => l.price_tc === 0).length;
                const paid = unlocks.length - free;
                return (
                  <div key={sid} className={`flex items-center gap-2 text-[11px] ${reached ? 'text-surface-200' : 'text-surface-500'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      reached ? 'bg-success/20 text-success' : 'bg-surface-800 text-surface-500'
                    }`}>
                      {reached ? <Check size={9} /> : <Lock size={9} />}
                    </span>
                    <span className="capitalize font-semibold w-16">{sid}</span>
                    <span className="text-surface-400 truncate">
                      {free > 0 && `${free} free look${free === 1 ? '' : 's'}`}
                      {free > 0 && paid > 0 && ' · '}
                      {paid > 0 && `${paid} buyable`}
                      {unlocks.length === 0 && 'perks only'}
                    </span>
                  </div>
                );
              })}
            </div>
            {a.ads_this_week >= 2 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                <Tv size={14} /> {t('couch_warning', { count: a.ads_this_week })}
              </div>
            )}
          </div>

          {/* Skins — one row, simple choice (Hick's law) */}
          <div>
            <div className="text-sm font-bold text-surface-100 mb-2">{t('skin')}</div>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(data.skins || {}).map((s) => {
                const owned = a.owned_skins?.includes(s.id);
                const selected = curSkin === s.id;
                const busyKey = `skin_${s.id}`;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setPreviewSkin(s.id);
                      if (owned) act({ action: 'select_skin', skin: s.id }, busyKey);
                      else act({ action: 'buy_skin', skin: s.id }, busyKey);
                    }}
                    disabled={!!busy}
                    className={`rounded-xl border-2 p-2 transition-all animate-pop ${
                      selected ? 'border-primary bg-primary/15' : 'border-surface-600 bg-surface-800 hover:border-surface-500'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full mx-auto mb-1" style={{ background: `linear-gradient(135deg, ${s.body}, ${s.belly})` }} />
                    <div className="text-xs font-medium text-surface-100 flex items-center justify-center gap-1">
                      {s.name}
                      {selected && owned && <Check size={11} className="text-success" />}
                    </div>
                    <div className="text-[10px] text-surface-400 flex items-center justify-center gap-0.5">
                      {owned ? t('owned') : <><Coins size={9} className="text-accent" />{s.price_tc} TC</>}
                      {!owned && <Lock size={9} className="ml-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <div className="text-sm font-bold text-surface-100 mb-2">{t('accessory')}</div>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(data.accessories || {}).map((acc) => {
                const owned = a.owned_accessories?.includes(acc.id);
                const selected = curAccessory === acc.id;
                const busyKey = `acc_${acc.id}`;
                return (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setPreviewAccessory(acc.id);
                      if (owned) act({ action: 'select_accessory', accessory: acc.id }, busyKey);
                      else act({ action: 'buy_accessory', accessory: acc.id }, busyKey);
                    }}
                    disabled={!!busy}
                    className={`rounded-xl border-2 p-2 transition-all ${
                      selected ? 'border-accent bg-accent/15' : 'border-surface-600 bg-surface-800 hover:border-surface-500'
                    }`}
                  >
                    <div className="text-xs font-medium text-surface-100 flex items-center justify-center gap-1">
                      {acc.name}
                      {selected && owned && <Check size={11} className="text-success" />}
                    </div>
                    <div className="text-[10px] text-surface-400 flex items-center justify-center gap-0.5">
                      {owned ? t('owned') : <><Coins size={9} className="text-accent" />{acc.price_tc} TC</>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-surface-400 bg-surface-800/50 rounded-xl p-3 border border-surface-700">
            <Dumbbell size={14} className="text-primary flex-shrink-0 mt-0.5" />
            {t('avatar_tip')}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AvatarStudio;
