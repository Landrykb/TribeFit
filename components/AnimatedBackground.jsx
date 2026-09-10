import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const PALETTES = {
  primary:   ['#A3E635', '#FF5436', '#FFD166'],
  accent:    ['#FF5436', '#FFD166', '#4CC9F0'],
  success:   ['#22C55E', '#86EFAC', '#FFD166'],
  danger:    ['#F43F5E', '#FB7185', '#FB923C'],
  purple:    ['#A855F7', '#C084FC', '#22D3EE'],
};

function Mesh({ colors, opacity }) {
  const shapes = useMemo(() => [
    { x: '-20%', y: '-10%', scale: 1, color: colors[0] },
    { x: '60%',  y: '10%',  scale: 0.8, color: colors[1] },
    { x: '20%',  y: '60%',  scale: 1.1, color: colors[2] || colors[0] },
    { x: '70%',  y: '70%',  scale: 0.9, color: colors[0] },
  ], [colors]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`,
            width: '60%',
            height: '60%',
            left: s.x,
            top: s.y,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 0.45,
            x: [0, 30, -20, 0],
            y: [0, -20, 20, 0],
            scale: [s.scale, s.scale * 1.1, s.scale * 0.95, s.scale],
          }}
          transition={{
            duration: 14 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  );
}

function Waves({ colors, opacity }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320" aria-hidden="true">
        <defs>
          <linearGradient id="wave1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0" />
            <stop offset="100%" stopColor={colors[0]} stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="wave2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[1]} stopOpacity="0" />
            <stop offset="100%" stopColor={colors[1]} stopOpacity="0.16" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#wave1)"
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{ d: [
            "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,224L48,213.3C96,203,192,181,288,170.7C384,160,480,160,576,170.7C672,181,768,203,864,213.3C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
          ]}}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          fill="url(#wave2)"
          d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,240C672,245,768,235,864,213.3C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{ d: [
            "M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,240C672,245,768,235,864,213.3C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,192L48,197.3C96,203,192,213,288,224C384,235,480,245,576,234.7C672,224,768,192,864,181.3C960,171,1056,181,1152,197.3C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,240C672,245,768,235,864,213.3C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
          ]}}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

function Dots({ colors, opacity }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity, backgroundImage: `radial-gradient(${colors[0]} 1.5px, transparent 1.5px)`, backgroundSize: '24px 24px' }}>
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 50%, ${colors[1]} 0%, transparent 60%)` }}
        animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function Aurora({ colors, opacity }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="aur1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0" />
            <stop offset="50%" stopColor={colors[0]} stopOpacity="0.35" />
            <stop offset="100%" stopColor={colors[1]} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="aur2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[1]} stopOpacity="0" />
            <stop offset="50%" stopColor={colors[1]} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors[2] || colors[0]} stopOpacity="0" />
          </linearGradient>
          <filter id="blur"><feGaussianBlur in="SourceGraphic" stdDeviation="12" /></filter>
        </defs>
        <motion.path
          d="M-50,250 Q100,100 200,220 T450,180"
          fill="none" stroke="url(#aur1)" strokeWidth="40" filter="url(#blur)" strokeLinecap="round"
          animate={{ d: ['M-50,250 Q100,100 200,220 T450,180', 'M-50,220 Q120,150 220,190 T450,250', 'M-50,250 Q100,100 200,220 T450,180'] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M-50,200 Q80,280 200,150 T450,220"
          fill="none" stroke="url(#aur2)" strokeWidth="32" filter="url(#blur)" strokeLinecap="round"
          animate={{ d: ['M-50,200 Q80,280 200,150 T450,220', 'M-50,240 Q90,120 210,260 T450,160', 'M-50,200 Q80,280 200,150 T450,220'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

function Blobs({ colors, opacity }) {
  const blobs = useMemo(() => [
    { d: 'M45.7,-58.9C58.9,-51.1,69.4,-36.5,73.5,-20.7C77.6,-4.9,75.3,12.1,67.8,25.9C60.3,39.7,47.7,50.4,33.4,57.8C19.1,65.2,3.1,69.4,-12.4,66.9C-27.9,64.4,-42.8,55.3,-53.2,42.8C-63.6,30.3,-69.5,14.4,-68.6,-0.8C-67.7,-16,-60,-30.5,-49.6,-38.4C-39.2,-46.3,-26,-47.6,-13.4,-51.9C-0.8,-56.2,11.2,-63.5,22.5,-64.4C33.8,-65.3,44.4,-59.7,45.7,-58.9Z', fill: colors[0], pos: '-top-10 -left-16', size: 'w-72 h-72' },
    { d: 'M39.9,-51.2C53.4,-42.9,67.3,-32.5,72.6,-18.4C77.9,-4.3,74.6,13.5,66.5,27.5C58.4,41.5,45.5,51.7,31.3,57.9C17.1,64.1,1.6,66.3,-13.4,63.6C-28.4,60.9,-42.9,53.3,-52.9,41.5C-62.9,29.7,-68.4,13.6,-67.6,-1.7C-66.8,-17,-59.7,-31.5,-49.1,-39.9C-38.5,-48.3,-24.4,-50.6,-10.4,-55.5C3.6,-60.4,18,-67.9,29.6,-66.4C41.2,-64.9,50,-54.4,39.9,-51.2Z', fill: colors[1], pos: '-bottom-14 -right-10', size: 'w-64 h-64' },
    { d: 'M47.5,-56.6C59.6,-47.8,66.4,-31.4,69.5,-14.6C72.6,2.2,72,19.4,64.8,32.4C57.6,45.4,43.8,54.2,29.2,59.8C14.6,65.4,-0.8,67.8,-15.4,63.9C-30,60,-43.8,49.8,-53,36.4C-62.2,23,-66.8,6.4,-65.1,-8.7C-63.4,-23.8,-55.4,-37.4,-44.1,-46.1C-32.8,-54.8,-18.2,-58.6,-2.6,-60.2C13,-61.8,26.1,-61.1,35.4,-56.7C44.7,-52.3,50.3,-44.1,47.5,-56.6Z', fill: colors[2] || colors[0], pos: 'top-1/3 right-1/4', size: 'w-40 h-40' },
  ], [colors]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {blobs.map((b, i) => (
        <motion.svg
          key={i}
          className={`absolute ${b.pos} ${b.size}`}
          viewBox="0 0 200 200"
          animate={{ x: [0, 20, -12, 0], y: [0, -18, 16, 0], scale: [1, 1.06, 0.98, 1], rotate: [0, 8, -6, 0] }}
          transition={{ duration: 18 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path fill={b.fill} fillOpacity="0.14" d={b.d} transform="translate(100 100)" />
        </motion.svg>
      ))}
    </div>
  );
}

export function AnimatedBackground({ variant = 'blobs', color = 'primary', opacity = 0.5, className = '' }) {
  const colors = PALETTES[color] || PALETTES.primary;
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {variant === 'blobs' && <Blobs colors={colors} opacity={opacity} />}
      {variant === 'mesh' && <Mesh colors={colors} opacity={opacity} />}
      {variant === 'waves' && <Waves colors={colors} opacity={opacity} />}
      {variant === 'dots' && <Dots colors={colors} opacity={opacity} />}
      {variant === 'aurora' && <Aurora colors={colors} opacity={opacity} />}
    </div>
  );
}
