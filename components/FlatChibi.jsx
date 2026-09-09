import React from 'react';
import { Flame, Meh, BatteryLow, Tv, Sparkles } from 'lucide-react';

// FlatChibi — flat vector avatar-maker character.
// Fully color/style customizable: body, hair style+color, outfit+color, shoes.
// viewBox 0 0 160 210. Inspired by the generated chibi sprite art.

export const HAIR_STYLES = ['leaf', 'sideswept', 'spiky', 'mane', 'flowing', 'buzz'];
export const OUTFIT_STYLES = ['tee', 'hoodie', 'tank'];

const OUTLINE = '#1A1A24';

const MOOD_META = {
  pumped:   { pill: 'bg-accent/15 border-accent/40 text-accent',   Icon: Flame },
  steady:   { pill: 'bg-primary/15 border-primary/40 text-primary', Icon: Meh },
  deflated: { pill: 'bg-surface-700/80 border-surface-600 text-surface-300', Icon: BatteryLow },
  couch:    { pill: 'bg-danger/15 border-danger/40 text-danger',   Icon: Tv },
};

function Hair({ style, color }) {
  switch (style) {
    case 'leaf':
      return (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round">
          <path d="M80 26 Q70 4 48 4 Q52 24 74 30 Z" fill={color} />
          <path d="M80 26 Q92 0 116 8 Q110 28 84 30 Z" fill={color} />
          <path d="M62 12 Q70 18 76 26" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" />
        </g>
      );
    case 'sideswept':
      return (
        <path d="M30 58 Q28 20 78 16 Q126 14 132 52 Q120 34 96 32 Q58 28 42 44 Q34 50 30 58 Z"
          fill={color} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      );
    case 'spiky':
      return (
        <path d="M30 56 Q26 22 60 14 L56 2 Q70 8 74 16 L80 0 Q88 10 88 18 L102 6 Q102 18 94 26 Q124 30 130 56 Q122 40 108 36 Q74 26 50 36 Q36 42 30 56 Z"
          fill={color} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      );
    case 'mane':
      return (
        <g fill={color} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round">
          <path d="M26 60 Q20 18 62 10 L54 -2 Q72 4 78 14 L86 -2 Q92 10 92 20 L108 8 Q108 22 100 30 Q126 36 132 60 Q124 42 106 38 Q70 28 46 38 Q32 44 26 60 Z" />
          <path d="M26 56 Q12 44 4 50 Q12 60 22 64 Z" />
          <path d="M134 56 Q148 44 156 50 Q148 60 138 64 Z" />
        </g>
      );
    case 'flowing':
      return (
        <g fill={color} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round">
          <path d="M28 58 Q22 18 66 12 L60 0 Q76 6 80 16 L88 2 Q92 12 92 22 L106 12 Q106 24 98 32 Q126 38 130 62 Q122 44 104 38 Q68 28 44 40 Q32 46 28 58 Z" />
          <path d="M30 62 Q20 84 30 100 Q18 92 18 74 Q18 62 30 62 Z" />
          <path d="M130 62 Q140 84 130 100 Q142 92 142 74 Q142 62 130 62 Z" />
        </g>
      );
    case 'buzz':
      return (
        <path d="M32 52 Q34 20 80 18 Q126 20 128 52 Q118 34 96 30 Q58 24 40 40 Q34 46 32 52 Z"
          fill={color} opacity="0.85" />
      );
    default:
      return null;
  }
}

function Outfit({ style, shirt, shorts }) {
  // torso region ~ y128-172, shorts y168-186
  return (
    <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round">
      {style === 'hoodie' ? (
        <>
          <path d="M52 118 Q80 108 108 118 L114 150 Q80 162 46 150 Z" fill={shirt} />
          <path d="M64 120 Q80 114 96 120 L94 128 Q80 122 66 128 Z" fill={OUTLINE} opacity="0.25" stroke="none" />
          <path d="M66 142 Q80 150 94 142 L94 152 Q80 158 66 152 Z" fill={OUTLINE} opacity="0.15" stroke="none" />
          <path d="M72 122 l0 10 M88 122 l0 10" stroke={OUTLINE} strokeWidth="3" />
        </>
      ) : style === 'tank' ? (
        <>
          <path d="M58 116 Q80 110 102 116 L104 148 Q80 158 56 148 Z" fill={shirt} />
          <path d="M66 118 Q80 128 94 118" fill="none" stroke={OUTLINE} strokeWidth="3" />
        </>
      ) : (
        <>
          <path d="M50 116 Q80 106 110 116 L112 148 Q80 160 48 148 Z" fill={shirt} />
          <path d="M62 112 Q80 122 98 112" fill="none" stroke={OUTLINE} strokeWidth="3" />
        </>
      )}
      {/* shorts */}
      <path d="M52 148 Q80 158 108 148 L110 172 Q94 178 80 172 L80 166 L80 172 Q66 178 50 172 Z" fill={shorts} />
    </g>
  );
}

function Face({ mood, cheek }) {
  const eyeY = 82;
  const dark = '#14131B';
  return (
    <g>
      {/* cheeks */}
      <ellipse cx="44" cy="98" rx="9" ry="6" fill={cheek} opacity="0.75" />
      <ellipse cx="116" cy="98" rx="9" ry="6" fill={cheek} opacity="0.75" />
      {mood === 'couch' ? (
        <>
          <path d={`M52 ${eyeY} h16`} stroke={dark} strokeWidth="5" strokeLinecap="round" />
          <path d={`M92 ${eyeY} h16`} stroke={dark} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : mood === 'deflated' ? (
        <>
          <path d={`M52 ${eyeY} q7 7 14 0`} stroke={dark} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d={`M94 ${eyeY} q7 7 14 0`} stroke={dark} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* big eyes */}
          <ellipse cx="58" cy={eyeY} rx="11" ry="13" fill="#fff" stroke={dark} strokeWidth="4" />
          <ellipse cx="102" cy={eyeY} rx="11" ry="13" fill="#fff" stroke={dark} strokeWidth="4" />
          <circle cx="60" cy={eyeY + 2} r="7" fill={dark} />
          <circle cx="100" cy={eyeY + 2} r="7" fill={dark} />
          <circle cx="56" cy={eyeY - 3} r="3" fill="#fff" />
          <circle cx="104" cy={eyeY - 3} r="3" fill="#fff" />
          {/* brows */}
          <path d="M50 64 q8 -5 16 -2" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M94 62 q8 -3 16 2" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* nose */}
      <path d="M80 92 q-2 4 0 6" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* mouth */}
      {mood === 'pumped' ? (
        <path d="M68 102 q12 14 24 0 Z" fill={dark} />
      ) : mood === 'deflated' ? (
        <path d="M70 106 q10 -6 20 0" stroke={dark} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      ) : mood === 'couch' ? (
        <ellipse cx="80" cy="106" rx="8" ry="6" fill={dark} opacity="0.85" />
      ) : (
        <path d="M70 102 q10 8 20 0" stroke={dark} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

export function FlatChibi({
  body = '#A3E635',
  hair = '#2EC4B6',
  hairStyle = 'leaf',
  shirt = '#FFFFFF',
  shorts = '#2B3A55',
  shoes = '#2EC4B6',
  cheek = '#FF8A75',
  mood = 'steady',
  size = 96,
}) {
  const droop = mood === 'deflated' || mood === 'couch';
  return (
    <svg width={size} height={size * 1.31} viewBox="0 0 160 210" aria-hidden="true"
      className={mood === 'pumped' ? 'animate-bounce-soft' : 'animate-wiggle-slow'}>
      {/* shadow */}
      <ellipse cx="80" cy="200" rx="36" ry="7" fill="#000" opacity="0.18" />
      {/* legs */}
      <path d="M66 178 l0 12" stroke={body} strokeWidth="12" strokeLinecap="round" />
      <path d="M94 178 l0 12" stroke={body} strokeWidth="12" strokeLinecap="round" />
      {/* shoes */}
      <ellipse cx="62" cy="196" rx="13" ry="7" fill={shoes} stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="98" cy="196" rx="13" ry="7" fill={shoes} stroke={OUTLINE} strokeWidth="4" />
      <rect x="52" y="190" width="20" height="4" rx="2" fill="#fff" opacity="0.8" />
      <rect x="88" y="190" width="20" height="4" rx="2" fill="#fff" opacity="0.8" />
      {/* arms */}
      {mood === 'pumped' ? (
        <>
          <path d="M52 128 Q34 112 36 92" stroke={body} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M108 128 Q126 112 124 92" stroke={body} strokeWidth="12" fill="none" strokeLinecap="round" />
          <circle cx="35" cy="88" r="8" fill={body} stroke={OUTLINE} strokeWidth="4" />
          <circle cx="125" cy="88" r="8" fill={body} stroke={OUTLINE} strokeWidth="4" />
        </>
      ) : droop ? (
        <>
          <path d="M50 128 Q38 142 42 156" stroke={body} strokeWidth="11" fill="none" strokeLinecap="round" />
          <path d="M110 128 Q122 142 118 156" stroke={body} strokeWidth="11" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M50 126 Q38 136 42 150" stroke={body} strokeWidth="11" fill="none" strokeLinecap="round" />
          <path d="M110 126 Q122 136 118 150" stroke={body} strokeWidth="11" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* outfit */}
      <Outfit style="tee" shirt={shirt} shorts={shorts} />
      {/* ears */}
      <ellipse cx="28" cy="86" rx="8" ry="10" fill={body} stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="132" cy="86" rx="8" ry="10" fill={body} stroke={OUTLINE} strokeWidth="4" />
      {/* head */}
      <ellipse cx="80" cy={droop ? 74 : 70} rx="54" ry="48" fill={body} stroke={OUTLINE} strokeWidth="4.5" />
      <ellipse cx="62" cy="48" rx="18" ry="9" fill="#fff" opacity="0.25" />
      <Hair style={hairStyle} color={hair} />
      <Face mood={mood} cheek={cheek} />
    </svg>
  );
}

export default FlatChibi;
