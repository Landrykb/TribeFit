import React, { useState } from 'react';
import { useApi, optimisticMutate } from '../lib/api';
import { Lock, Check, Coins, Tv, Dumbbell, Sparkles } from 'lucide-react';
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

  const PRESETS = [
    { id: 'preset-1.svg', name: 'Sprout' },
    { id: 'preset-2.svg', name: 'Rookie' },
    { id: 'preset-3.png', name: 'Hoodie' },
    { id: 'preset-4.png', name: 'Ponytail' },
    { id: 'preset-5.png', name: 'Adventurer' },
    { id: 'preset-6.svg', name: 'Vector One' },
    { id: 'preset-7.svg', name: 'Vector Two' },
    { id: 'preset-8.svg', name: 'Vector Three' },
  ];

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
      case 'set_preset':
        return { preset: payload.preset, parts: {}, custom: { ...(avatar.custom || {}), enabled: false } };
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
          {/* Live preview */}
          <div className="flex flex-col items-center py-3 bg-surface-800/50 rounded-2xl border border-surface-700">
            <Tribeling
              mood={a.mood}
              energy={a.energy}
              streak={a.streak}
              stage={a.stage?.id}
              skin={curSkin}
              accessory={curAccessory}
              custom={previewCustom || a.custom}
              parts={previewParts || a.parts}
              preset={a.preset}
              size={140}
            />
          </div>

          {/* Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-surface-100 flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> {t('presets') || 'Presets'}
              </div>
              {a.preset && (
                <button
                  onClick={() => act({ action: 'clear_preset' }, 'clear_preset')}
                  className="text-[10px] px-2 py-1 rounded-full border border-surface-600 text-surface-300 hover:border-surface-500 hover:text-surface-100"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PRESETS.map((p) => {
                const selected = a.preset === p.id;
                const busyKey = `preset_${p.id}`;
                return (
                  <button
                    key={p.id}
                    onClick={() => act({ action: 'set_preset', preset: p.id }, busyKey)}
                    disabled={!!busy}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                      selected ? 'border-primary bg-primary/15' : 'border-surface-600 bg-surface-800 hover:border-surface-500'
                    }`}
                    title={p.name}
                  >
                    <img src={`/avatar/presets/${p.id}`} alt={p.name} className="w-full h-full object-contain p-1" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layer builder from extracted sheet */}
          <div>
            <div className="text-sm font-bold text-surface-100 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" /> Builder
            </div>
            {[
              { key: 'body', label: 'Body', count: 6 },
              { key: 'outfit', label: 'Outfit', count: 6 },
              { key: 'face', label: 'Face', count: 12 },
              { key: 'hair', label: 'Hair', count: 8 },
              { key: 'accessory', label: 'Accessory', count: 7 },
              { key: 'aura', label: 'Aura', count: 5 },
            ].map(({ key, label, count }) => (
              <div key={key} className="mb-2">
                <label className="block text-xs text-surface-400 mb-1">{label}</label>
                <select
                  className="w-full text-sm rounded-lg bg-surface-800 border border-surface-700 px-3 py-2 text-surface-100"
                  value={previewParts?.[key] ?? a.parts?.[key] ?? 0}
                  disabled={!!busy}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    const next = { ...(previewParts || a.parts || {}), [key]: idx };
                    setPreviewParts(next);
                    act({ action: 'set_part', part: key, idx }, `part_${key}`);
                  }}
                >
                  <option value={0}>None</option>
                  {Array.from({ length: count }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{label} {i + 1}</option>
                  ))}
                </select>
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
