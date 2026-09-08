import React from 'react';
import { Flame, Meh, BatteryLow, Tv, Sparkles } from 'lucide-react';

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

// Stage decorations
function StageDecor({ stage, skin }) {
  switch (stage) {
    case 'sprout':
      return null; // sprout leaf drawn on head in body
    case 'athlete':
      return <path d="M60 6 q5 10 0 18 q-5 -8 0 -18" fill={skin.accent} />;
    case 'beast':
      return (
        <g>
          <path d="M36 18 q-10 -15 -18 -12 q3 13 10 20 Z" fill={skin.accent} />
          <path d="M84 18 q10 -15 18 -12 q-3 13 -10 20 Z" fill={skin.accent} />
        </g>
      );
    case 'legend':
      return (
        <g>
          <path d="M32 22 q-12 -17 -20 -15 q3 15 11 22 Z" fill={skin.accent} />
          <path d="M88 22 q12 -17 20 -15 q-3 15 -11 22 Z" fill={skin.accent} />
          <path d="M60 2 q7 12 0 22 q-7 -10 0 -22" fill={skin.accent} />
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
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm ${m.pill}`}>
      <m.Icon size={12} />
      <span>{m.label}{streak > 0 ? ` · ${streak}d` : ''}</span>
    </div>
  );
}

export function Tribeling({
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
  const scale = Math.min(1.3, Math.max(0.6, energy));
  const w = size * scale;
  const h = w * 1.16;

  // Sprout stage: tiny round seedling with a leaf
  if (isSprout) {
    return (
      <div className="flex flex-col items-center gap-1 select-none" title="Tribeling - Sprout">
        <svg width={w} height={h} viewBox="0 0 120 140" className="animate-wiggle" aria-hidden="true">
          {/* ground shadow */}
          <ellipse cx="60" cy="126" rx="30" ry="6" fill="#000" opacity="0.25" />
          {/* leaf sprout */}
          <path d="M60 38 q-3 -18 -14 -24 q16 -2 18 10 q8 -12 18 -8 q-6 14 -22 22 Z" fill="#8CE99A" stroke="#2EC4B6" strokeWidth="2" />
          {/* seedling body */}
          <ellipse cx="60" cy="82" rx="34" ry="38" fill={skin.body} />
          <ellipse cx="60" cy="92" rx="22" ry="24" fill={skin.belly} opacity="0.8" />
          {/* tiny feet */}
          <ellipse cx="46" cy="118" rx="8" ry="5" fill={skin.accent} />
          <ellipse cx="74" cy="118" rx="8" ry="5" fill={skin.accent} />
          {/* big cute eyes */}
          <circle cx="48" cy="74" r="7" fill="#0C0B10" />
          <circle cx="72" cy="74" r="7" fill="#0C0B10" />
          <circle cx="50.5" cy="71.5" r="2.5" fill="#fff" />
          <circle cx="74.5" cy="71.5" r="2.5" fill="#fff" />
          {/* blush cheeks */}
          <ellipse cx="38" cy="84" rx="6" ry="4" fill={skin.cheek} opacity="0.7" />
          <ellipse cx="82" cy="84" rx="6" ry="4" fill={skin.cheek} opacity="0.7" />
          {/* tiny smile */}
          <path d="M54 88 q6 5 12 0" stroke="#0C0B10" strokeWidth="3" fill="none" strokeLinecap="round" />
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
        <ellipse cx="60" cy="128" rx={couch ? 42 : 34} ry="7" fill="#000" opacity="0.25" />
        <StageDecor stage={stage} skin={skin} />
        {/* feet */}
        <ellipse cx="42" cy={droop || couch ? 118 : 120} rx="10" ry="6" fill={skin.accent} />
        <ellipse cx="78" cy={droop || couch ? 118 : 120} rx="10" ry="6" fill={skin.accent} />
        {/* little arms — up when pumped, droopy when deflated */}
        {mood === 'pumped' ? (
          <>
            <path d="M24 70 q-14 -18 -8 -28" stroke={skin.body} strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M96 70 q14 -18 8 -28" stroke={skin.body} strokeWidth="9" fill="none" strokeLinecap="round" />
            <circle cx="16" cy="40" r="7" fill={skin.body} />
            <circle cx="104" cy="40" r="7" fill={skin.body} />
          </>
        ) : droop || couch ? (
          <>
            <path d="M26 78 q-10 12 -6 22" stroke={skin.body} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M94 78 q10 12 6 22" stroke={skin.body} strokeWidth="8" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M26 74 q-10 8 -6 16" stroke={skin.body} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M94 74 q10 8 6 16" stroke={skin.body} strokeWidth="8" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* body blob — squashed when deflated/couch */}
        <ellipse cx="60" cy={droop || couch ? 84 : 76} rx={couch ? 48 : 42} ry={droop || couch ? 38 : 46} fill={skin.body} />
        {/* belly — bigger when couch potato */}
        <ellipse cx="60" cy={droop || couch ? 94 : 90} rx={couch ? 34 : 26} ry={droop || couch ? 24 : 28} fill={skin.belly} opacity="0.75" />
        {/* blush cheeks */}
        <ellipse cx="40" cy="72" rx="6" ry="4" fill={skin.cheek} opacity="0.6" />
        <ellipse cx="80" cy="72" rx="6" ry="4" fill={skin.cheek} opacity="0.6" />
        {/* eyes */}
        {couch ? (
          <>
            <path d="M38 62 h14" stroke="#0C0B10" strokeWidth="4" strokeLinecap="round" />
            <path d="M68 62 h14" stroke="#0C0B10" strokeWidth="4" strokeLinecap="round" />
            <path d="M38 62 q7 5 14 0" stroke="#0C0B10" strokeWidth="2.5" fill="none" opacity="0.5" />
            <path d="M68 62 q7 5 14 0" stroke="#0C0B10" strokeWidth="2.5" fill="none" opacity="0.5" />
          </>
        ) : droop ? (
          <>
            <path d="M40 62 q6 6 12 0" stroke="#0C0B10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M68 62 q6 6 12 0" stroke="#0C0B10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        ) : accessory === 'shades' ? null : (
          <>
            <circle cx="46" cy="60" r="6.5" fill="#0C0B10" />
            <circle cx="74" cy="60" r="6.5" fill="#0C0B10" />
            <circle cx="48.5" cy="57.5" r="2.2" fill="#fff" />
            <circle cx="76.5" cy="57.5" r="2.2" fill="#fff" />
          </>
        )}
        {/* mouth */}
        {mood === 'pumped' ? (
          <path d="M50 76 q10 10 20 0" stroke="#0C0B10" strokeWidth="4" fill="none" strokeLinecap="round" />
        ) : couch ? (
          <>
            <ellipse cx="60" cy="78" rx="8" ry="6" fill="#0C0B10" opacity="0.85" />
            <text x="104" y="38" fontSize="13" fill="#8E8EA3">z</text>
            <text x="110" y="28" fontSize="10" fill="#8E8EA3">z</text>
          </>
        ) : droop ? (
          <path d="M52 80 q8 -5 16 0" stroke="#0C0B10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M52 76 q8 5 16 0" stroke="#0C0B10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {/* sweat drop when deflated */}
        {droop && <path d="M94 46 q7 12 0 17 q-7 -5 0 -17" fill={skin.belly} opacity="0.9" />}
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
