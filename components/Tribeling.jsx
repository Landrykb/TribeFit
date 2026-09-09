import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Meh, BatteryLow, Tv, Sparkles } from 'lucide-react';
import { FlatChibi } from './FlatChibi';

// Tribeling: the user's creature avatar (Stompers-style).
// Evolution stage grows with lifetime workouts; mood reacts to daily activity;
// 'couch' appears when the user leans on ad-skips too much.

export const SKIN_PALETTES = {
  ember:    { body: '#A3E635', belly: '#D4F28F', accent: '#FF5436', cheek: '#FF8A75' },
  solar:    { body: '#FF9F1C', belly: '#FFD166', accent: '#EF476F', cheek: '#FF8FA3' },
  venom:    { body: '#2EC4B6', belly: '#8CE99A', accent: '#FF6B6B', cheek: '#FFA8A8' },
  frost:    { body: '#4CC9F0', belly: '#BDE0FE', accent: '#F72585', cheek: '#F9A8D4' },
  midnight: { body: '#3B3B4F', belly: '#6E6E85', accent: '#A3E635', cheek: '#BEEA5E' },
  magma:    { body: '#FF5436', belly: '#FFB4A2', accent: '#FFD166', cheek: '#FF8A80' },
};

const MOOD_META = {
  pumped:   { label: 'Fired up!',          Icon: Flame,      iconClass: 'text-accent',   pill: 'bg-accent/15 border-accent/40 text-accent' },
  steady:   { label: 'Warming up',         Icon: Meh,        iconClass: 'text-primary',  pill: 'bg-primary/15 border-primary/40 text-primary' },
  deflated: { label: 'Needs a workout...', Icon: BatteryLow, iconClass: 'text-surface-300', pill: 'bg-surface-700/80 border-surface-600 text-surface-300' },
  couch:    { label: 'Couch mode',         Icon: Tv,         iconClass: 'text-danger',   pill: 'bg-danger/15 border-danger/40 text-danger' },
};

// Accessories drawn on/around the head (viewBox 120x140)
function Accessory({ type, skin }) {
  switch (type) {
    case 'headband':
      return <path d="M22 46 q38 -20 76 0 l-4 10 q-34 -16 -68 0 Z" fill={skin.accent} />;
    case 'shades':
      return (
        <g>
          <rect x="34" y="52" width="22" height="15" rx="6" fill="#0C0B10" />
          <rect x="64" y="52" width="22" height="15" rx="6" fill="#0C0B10" />
          <rect x="54" y="57" width="12" height="4" fill="#0C0B10" />
          <path d="M34 56 L24 50 M86 56 L96 50" stroke="#0C0B10" strokeWidth="4" strokeLinecap="round" />
          <circle cx="40" cy="56" r="3" fill="#fff" opacity="0.5" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M28 55 q32 -38 64 0" stroke="#0C0B10" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="20" y="50" width="15" height="26" rx="7" fill="#0C0B10" />
          <rect x="85" y="50" width="15" height="26" rx="7" fill="#0C0B10" />
          <rect x="23" y="55" width="9" height="16" rx="4" fill={skin.accent} />
          <rect x="88" y="55" width="9" height="16" rx="4" fill={skin.accent} />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M34 36 l9 -17 l8 12 l9 -17 l9 17 l8 -12 l9 17 Z" fill="#FFD166" stroke="#B8860B" strokeWidth="2" />
          <circle cx="60" cy="24" r="3" fill={skin.accent} />
        </g>
      );
    default:
      return null;
  }
}

// Stage decorations — hair/aura per evolution stage
function StageDecor({ stage, skin }) {
  switch (stage) {
    case 'sprout':
      return null;
    case 'rookie':
      return (
        // simple side-swept hair
        <g>
          <path d="M28 44 q2 -22 32 -26 q30 -4 32 26 q-6 -12 -18 -14 q-22 -6 -34 4 q-8 6 -12 10 Z" fill={skin.accent} />
          <path d="M44 20 q-6 -8 -14 -8 q2 8 8 12 Z" fill={skin.accent} />
        </g>
      );
    case 'athlete':
      return (
        // spiky sport hair + sweatband already via accessory
        <g>
          <path d="M28 44 q0 -20 16 -26 l-4 -12 q10 6 14 12 l4 -14 q6 8 6 14 l10 -10 q2 10 -2 16 q14 4 16 26 q-4 -10 -14 -14 q-24 -8 -36 -2 q-8 4 -10 12 Z" fill={skin.accent} />
        </g>
      );
    case 'beast':
      return (
        // wild mane
        <g>
          <path d="M24 50 q-2 -26 20 -34 l-6 -14 q12 4 16 12 l6 -14 q4 10 4 16 l12 -12 q0 12 -6 18 q16 6 14 30 q-2 -12 -12 -18 q-26 -10 -40 -2 q-10 6 -8 16 Z" fill={skin.accent} />
          <path d="M22 44 q-8 -10 -16 -8 q4 8 10 12 Z" fill={skin.accent} />
          <path d="M98 44 q8 -10 16 -8 q-4 8 -10 12 Z" fill={skin.accent} />
        </g>
      );
    case 'legend':
      return (
        // flowing hair + golden aura ring
        <g>
          <circle cx="60" cy="52" r="46" fill="none" stroke="#FFD166" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.7" />
          <path d="M22 52 q-4 -30 22 -38 l-6 -12 q12 2 18 10 l6 -14 q4 10 4 16 l12 -12 q0 12 -6 18 q16 6 14 30 q-2 -14 -12 -20 q-28 -12 -42 -2 q-10 6 -10 22 Z" fill={skin.accent} />
          <path d="M24 56 q-6 16 4 26 q-14 -6 -14 -20 q0 -8 10 -6 Z" fill={skin.accent} opacity="0.8" />
          <path d="M96 56 q6 16 -4 26 q14 -6 14 -20 q0 -8 -10 -6 Z" fill={skin.accent} opacity="0.8" />
        </g>
      );
    default:
      return null;
  }
}

// Mood pill badge — render outside any ring/frame
export function MoodPill({ mood = 'steady', streak = 0 }) {
  const m = MOOD_META[mood] || MOOD_META.steady;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm max-w-full min-w-0 truncate ${m.pill}`}>
      <m.Icon size={12} className="flex-shrink-0" />
      <span className="truncate">{m.label}{streak > 0 ? ` · ${streak}d` : ''}</span>
    </div>
  );
}

// Layered-image avatar — composites body + face assets from /public/avatar.
// Full-character stage artwork (preferred when present)
const STAGE_ART = {
  sprout: '/avatar/stage-sprout.png',
  rookie: '/avatar/stage-rookie.png',
  athlete: '/avatar/stage-rookie.png',
  beast: '/avatar/stage-legend.png',
  legend: '/avatar/stage-legend.png',
};

const SKIN_BODY = {
  ember: 'lime', solar: 'orange', venom: 'teal', frost: 'blue',
  magma: 'coral', midnight: 'dark',
};
const MOOD_FACE = {
  pumped: 'determined', steady: 'neutral', deflated: 'neutral', couch: 'wink',
};
const MOOD_FILTER = {
  pumped: 'none',
  steady: 'none',
  deflated: 'saturate(0.55) brightness(0.92)',
  couch: 'saturate(0.3) brightness(0.8)',
};
const STAGE_AURA = {
  sprout: null,
  rookie: null,
  athlete: '0 0 18px rgba(163,230,53,0.35)',
  beast: '0 0 22px rgba(255,84,54,0.4)',
  legend: '0 0 26px rgba(255,209,102,0.55)',
};

export function Tribeling({
  mood = 'steady',
  energy = 0.8,
  streak = 0,
  stage = 'rookie',
  skin: skinId = 'ember',
  accessory = 'none',
  size = 96,
  showLabel = true,
  custom = null,
  parts = null,
}) {
  const PART_SRC = {
    body: (i) => `/avatar/sheet/body-${i}.png`,
    outfit: (i) => `/avatar/sheet/outfit-${i}.png`,
    face: (i) => i <= 6 ? `/avatar/sheet/face_t-${i}.png` : `/avatar/sheet/face_b-${i - 6}.png`,
    hair: (i) => `/avatar/sheet/hair-${i}.png`,
    accessory: (i) => i <= 6 ? `/avatar/sheet/acc_t-${i}.png` : `/avatar/sheet/acc_m-1.png`,
    aura: (i) => `/avatar/sheet/aura-${i}.png`,
  };

  const body = SKIN_BODY[skinId] || 'lime';
  const face = MOOD_FACE[mood] || 'neutral';
  const filter = MOOD_FILTER[mood] || 'none';
  const aura = STAGE_AURA[stage];
  const m = MOOD_META[mood] || MOOD_META.steady;
  const scale = Math.min(1.15, Math.max(0.6, energy));
  const stateKey = `${mood}-${stage}-${skinId}-${accessory}-${JSON.stringify(parts || {})}-${custom?.enabled || ''}`;

  // User-built layered avatar from extracted sheet parts
  if (parts && Object.values(parts).some(v => v > 0)) {
    const base = parts.outfit ? { key: 'outfit', src: PART_SRC.outfit(parts.outfit) }
      : parts.body ? { key: 'body', src: PART_SRC.body(parts.body) }
      : parts.aura ? { key: 'aura', src: PART_SRC.aura(parts.aura) }
      : null;
    const head = parts.accessory ? { key: 'accessory', src: PART_SRC.accessory(parts.accessory) }
      : parts.hair ? { key: 'hair', src: PART_SRC.hair(parts.hair) }
      : parts.face ? { key: 'face', src: PART_SRC.face(parts.face) }
      : null;
    return (
      <div className="flex flex-col items-center gap-1 select-none" title={`Tribeling - ${m.label}`}>
        <div className="relative inline-block" style={{ width: size * scale, transition: 'width 0.35s cubic-bezier(.34,1.56,.64,1)' }}>
          {base && <motion.img key={`${stateKey}-${base.key}`} src={base.src} alt="" className="block h-auto w-full" initial={{ opacity: 0.6, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} draggable={false} />}
          {head && <motion.img key={`${stateKey}-${head.key}`} src={head.src} alt="" className="absolute top-0 left-0 w-full h-auto z-10" initial={{ opacity: 0.6, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} draggable={false} />}
        </div>
        {showLabel && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm max-w-full min-w-0 truncate ${m.pill}`}>
            <m.Icon size={12} />
            <span className="truncate">{m.label}{streak > 0 ? ` · ${streak}d` : ''}</span>
          </div>
        )}
      </div>
    );
  }

  // Custom flat avatar (avatar-maker mode)
  if (custom?.enabled) {
    return (
      <div className="flex flex-col items-center gap-1 select-none" title={`Tribeling - ${m.label}`}>
        <div className="relative">
          {aura && <div className="absolute inset-[-8%] rounded-full" style={{ boxShadow: aura }} />}
          <FlatChibi {...custom} mood={mood} size={size * scale} />
        </div>
        {showLabel && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm max-w-full min-w-0 truncate ${m.pill}`}>
            <m.Icon size={12} />
            <span className="truncate">{m.label}{streak > 0 ? ` · ${streak}d` : ''}</span>
          </div>
        )}
      </div>
    );
  }

  const stageArt = STAGE_ART[stage];
  const layers = (
    <div className="relative" style={{ width: size * scale, height: size * scale, transition: 'width 0.35s cubic-bezier(.34,1.56,.64,1), height 0.35s cubic-bezier(.34,1.56,.64,1)' }}>
      {aura && (
        <div className="absolute inset-[-8%] rounded-full" style={{ boxShadow: aura }} />
      )}
      {stageArt ? (
        <motion.img
          key={stateKey}
          src={stageArt}
          alt="Tribeling"
          className={mood === 'pumped' ? 'animate-bounce-soft' : 'animate-wiggle-slow'}
          initial={{ opacity: 0.6, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter, display: 'block', transition: 'filter 0.35s ease' }}
          draggable={false}
        />
      ) : (
        <>
          <motion.img
            key={`${stateKey}-body`}
            src={`/avatar/body-${body}.svg`}
            alt="Tribeling"
            className={mood === 'pumped' ? 'animate-bounce-soft' : 'animate-wiggle-slow'}
            initial={{ opacity: 0.6, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            style={{ width: '100%', height: '100%', filter, display: 'block', transition: 'filter 0.35s ease' }}
            draggable={false}
          />
          <motion.img
            key={`${stateKey}-face`}
            src={`/avatar/face-${face}.svg`}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0.6, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter, pointerEvents: 'none', transition: 'filter 0.35s ease' }}
            draggable={false}
          />
        </>
      )}
      {mood === 'couch' && (
        <span className="absolute -top-1 -right-1 text-surface-400 font-bold" style={{ fontSize: size * 0.16 }}>z z</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1 select-none" title={`Tribeling - ${m.label}`}>
      {layers}
      {showLabel && (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm ${m.pill}`}>
          <m.Icon size={12} />
          <span>{m.label}{streak > 0 ? ` · ${streak}d` : ''}</span>
        </div>
      )}
    </div>
  );
}

/* eslint-disable-next-line */
function TribelingLegacy({
  mood = 'steady',
  energy = 0.8,
  streak = 0,
  stage = 'rookie',
  skin: skinId = 'ember',
  accessory = 'none',
  size = 96,
  showLabel = true,
}) {
  const skin = SKIN_PALETTES[skinId] || SKIN_PALETTES.ember;
  const m = MOOD_META[mood] || MOOD_META.steady;
  const isSprout = stage === 'sprout';
  const droop = mood === 'deflated';
  const couch = mood === 'couch';
  const scale = Math.min(1.15, Math.max(0.6, energy));
  const w = size * scale;
  const h = w * 1.16;

  // Sprout stage: tiny round seedling with a leaf
  if (isSprout) {
    return (
      <div className="flex flex-col items-center gap-1 select-none" title="Tribeling - Sprout">
        <svg width={w} height={h} viewBox="0 0 120 140" className="animate-wiggle" aria-hidden="true">
          {/* ground shadow */}
          <ellipse cx="60" cy="126" rx="30" ry="6" fill="#000" opacity="0.25" />
          {/* tiny chibi body */}
          <ellipse cx="60" cy="106" rx="20" ry="18" fill={skin.body} />
          <ellipse cx="60" cy="110" rx="12" ry="11" fill={skin.belly} opacity="0.8" />
          {/* stubby legs + shoes */}
          <ellipse cx="50" cy="126" rx="8" ry="4.5" fill={skin.accent} />
          <ellipse cx="70" cy="126" rx="8" ry="4.5" fill={skin.accent} />
          {/* big chibi head */}
          <ellipse cx="60" cy="62" rx="36" ry="32" fill={skin.body} />
          {/* leaf sprout on head */}
          <path d="M60 32 q-3 -20 -16 -26 q16 -4 18 8 q8 -12 18 -8 q-6 16 -20 26 Z" fill="#8CE99A" stroke="#2EC4B6" strokeWidth="2" />
          {/* big cute eyes */}
          <ellipse cx="46" cy="62" rx="8" ry="9" fill="#0C0B10" />
          <ellipse cx="74" cy="62" rx="8" ry="9" fill="#0C0B10" />
          <circle cx="49" cy="58" r="3" fill="#fff" />
          <circle cx="77" cy="58" r="3" fill="#fff" />
          {/* blush cheeks */}
          <ellipse cx="32" cy="72" rx="6" ry="4" fill={skin.cheek} opacity="0.7" />
          <ellipse cx="88" cy="72" rx="6" ry="4" fill={skin.cheek} opacity="0.7" />
          {/* tiny smile */}
          <path d="M52 74 q8 6 16 0" stroke="#0C0B10" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* sparkles */}
          <path d="M96 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill={skin.accent} opacity="0.9" />
        </svg>
        {showLabel && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/40 text-primary text-xs font-semibold shadow-sm">
            <Sparkles size={12} /> Do a workout to grow!
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 select-none" title={`Tribeling - ${m.label}`}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 120 140"
        className={mood === 'pumped' ? 'animate-bounce-soft' : 'animate-wiggle-slow'}
        style={mood === 'pumped' ? { filter: `drop-shadow(0 0 14px ${skin.body}80)` } : undefined}
        aria-hidden="true"
      >
        {/* ground shadow */}
        <ellipse cx="60" cy="132" rx={couch ? 44 : 34} ry="6" fill="#000" opacity="0.22" />
        <StageDecor stage={stage} skin={skin} />

        {/* legs + shoes */}
        <path d="M48 118 l0 8" stroke={skin.body} strokeWidth="9" strokeLinecap="round" />
        <path d="M72 118 l0 8" stroke={skin.body} strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="44" cy="130" rx="10" ry="5" fill={skin.accent} />
        <ellipse cx="76" cy="130" rx="10" ry="5" fill={skin.accent} />

        {/* chibi torso — little tee + shorts */}
        <ellipse cx="60" cy={droop || couch ? 108 : 104} rx={couch ? 30 : 25} ry={droop || couch ? 22 : 24} fill={skin.body} />
        <path d="M42 112 q18 10 36 0 l0 8 q-18 8 -36 0 Z" fill={skin.accent} opacity="0.9" />
        <path d="M46 92 q14 -7 28 0 l-4 8 q-10 -6 -20 0 Z" fill={skin.belly} opacity="0.9" />
        {/* collar */}
        <path d="M50 88 q10 6 20 0 l-4 6 q-6 -4 -12 0 Z" fill={skin.accent} />

        {/* arms — up when pumped, droopy when deflated/couch */}
        {mood === 'pumped' ? (
          <>
            <path d="M38 100 q-16 -14 -14 -30" stroke={skin.body} strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M82 100 q16 -14 14 -30" stroke={skin.body} strokeWidth="9" fill="none" strokeLinecap="round" />
            <circle cx="23" cy="66" r="7" fill={skin.body} />
            <circle cx="97" cy="66" r="7" fill={skin.body} />
          </>
        ) : droop || couch ? (
          <>
            <path d="M38 102 q-12 10 -8 22" stroke={skin.body} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M82 102 q12 10 8 22" stroke={skin.body} strokeWidth="8" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M37 100 q-12 8 -8 20" stroke={skin.body} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M83 100 q12 8 8 20" stroke={skin.body} strokeWidth="8" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* ears */}
        <ellipse cx="22" cy="56" rx="6" ry="8" fill={skin.body} />
        <ellipse cx="98" cy="56" rx="6" ry="8" fill={skin.body} />
        <ellipse cx="23" cy="57" rx="3" ry="4" fill={skin.cheek} opacity="0.5" />
        <ellipse cx="97" cy="57" rx="3" ry="4" fill={skin.cheek} opacity="0.5" />

        {/* big chibi head */}
        <ellipse cx="60" cy={droop || couch ? 56 : 50} rx="40" ry="36" fill={skin.body} />
        {/* forehead highlight */}
        <ellipse cx="50" cy="34" rx="16" ry="8" fill="#fff" opacity="0.12" />

        {/* eyebrows */}
        {!couch && !droop && accessory !== 'shades' && (
          <>
            <path d="M38 42 q7 -4 14 -1" stroke="#0C0B10" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />
            <path d="M68 41 q7 -3 14 1" stroke="#0C0B10" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />
          </>
        )}
        {/* tiny nose */}
        <path d="M60 58 q-2 4 0 6" stroke="#0C0B10" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />

        {/* blush cheeks on face */}
        <ellipse cx="34" cy="62" rx="7" ry="4.5" fill={skin.cheek} opacity="0.65" />
        <ellipse cx="86" cy="62" rx="7" ry="4.5" fill={skin.cheek} opacity="0.65" />

        {/* eyes */}
        {couch ? (
          <>
            <path d="M40 52 h14" stroke="#0C0B10" strokeWidth="4" strokeLinecap="round" />
            <path d="M66 52 h14" stroke="#0C0B10" strokeWidth="4" strokeLinecap="round" />
            <path d="M40 52 q7 5 14 0" stroke="#0C0B10" strokeWidth="2.5" fill="none" opacity="0.5" />
            <path d="M66 52 q7 5 14 0" stroke="#0C0B10" strokeWidth="2.5" fill="none" opacity="0.5" />
          </>
        ) : droop ? (
          <>
            <path d="M42 52 q6 6 12 0" stroke="#0C0B10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M66 52 q6 6 12 0" stroke="#0C0B10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        ) : accessory === 'shades' ? null : (
          <>
            {/* big expressive chibi eyes */}
            <ellipse cx="46" cy="52" rx="8" ry="9" fill="#0C0B10" />
            <ellipse cx="74" cy="52" rx="8" ry="9" fill="#0C0B10" />
            <circle cx="49" cy="48" r="3" fill="#fff" />
            <circle cx="77" cy="48" r="3" fill="#fff" />
            <circle cx="43.5" cy="56" r="1.4" fill="#fff" opacity="0.7" />
            <circle cx="71.5" cy="56" r="1.4" fill="#fff" opacity="0.7" />
          </>
        )}

        {/* mouth */}
        {mood === 'pumped' ? (
          <path d="M50 66 q10 12 20 0" stroke="#0C0B10" strokeWidth="4" fill={skin.accent} strokeLinecap="round" opacity="0.9" />
        ) : couch ? (
          <>
            <ellipse cx="60" cy="68" rx="8" ry="6" fill="#0C0B10" opacity="0.85" />
            <text x="102" y="24" fontSize="13" fill="#8E8EA3">z</text>
            <text x="109" y="14" fontSize="10" fill="#8E8EA3">z</text>
          </>
        ) : droop ? (
          <path d="M52 70 q8 -5 16 0" stroke="#0C0B10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M52 66 q8 6 16 0" stroke="#0C0B10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}

        {/* sweat drop when deflated */}
        {droop && <path d="M96 40 q7 12 0 17 q-7 -5 0 -17" fill={skin.belly} opacity="0.9" />}

        {/* accessory on top */}
        <Accessory type={accessory} skin={skin} />
      </svg>
      {showLabel && (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm ${m.pill}`}>
          <m.Icon size={12} />
          <span>{m.label}{streak > 0 ? ` · ${streak}d` : ''}</span>
        </div>
      )}
    </div>
  );
}

export default Tribeling;
