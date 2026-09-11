// Avatar art pipeline: imports source artwork and generates recoloured look variants.
//
// 1. Imports each source SVG from avatar_assets/ into public/, stripping the opaque
//    white background rect the export tool adds so the art composites cleanly.
// 2. For look families, groups the flat fills into colour clusters by hue weighted by
//    bounding-box area. The two largest clusters are treated as the character's "skin"
//    and "outfit" regions, and each is retargeted to a set of named hues — keeping each
//    fill's offset from its cluster mean so shading and highlights survive the recolor.
//
// Re-run after changing the source art: node scripts/gen-avatar-variants.mjs

import fs from 'node:fs';
import path from 'node:path';
import { LOOK_FAMILIES, VARIANT_COLORS } from '../lib/avatar-looks.js';

const SRC_DIR = 'avatar_assets';
const PUBLIC_DIR = 'public/avatar';
const PRESET_DIR = path.join(PUBLIC_DIR, 'presets');

// Source artwork -> published path. Keeps the published art reproducible from source.
const IMPORTS = [
  { src: 'edited-image-1789062744808.svg', dest: 'presets/preset-6.svg' },
  { src: 'edited-image-1789062919682.svg', dest: 'presets/preset-7.svg' },
  { src: 'edited-image-1789112083947.svg', dest: 'presets/preset-trainer.svg' },
  // Female evolution artwork.
  { src: 'edited-image-1789112106340.svg', dest: 'stage-female-athlete.svg' },
  { src: 'edited-image-1789112119007.svg', dest: 'stage-female-beast.svg' },
];

// Which hue each colour name targets. Keys must match VARIANT_COLORS.
const TARGET_HUES = { red: 0, orange: 30, green: 140, cyan: 185, blue: 220, purple: 275 };

const unknownColors = VARIANT_COLORS.filter(c => !(c in TARGET_HUES));
if (unknownColors.length) throw new Error(`No target hue for: ${unknownColors.join(', ')}`);

const PATH_RE = /<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})"(?:\s+transform="translate\((-?[\d.]+),(-?[\d.]+)\)")?\s*\/>/g;

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function rgbToHex([r, g, b]) {
  const c = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function rgbToHsl([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb([h, s, l]) {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
}

// The exporter emits a full-canvas near-white rect as the first path; drop it so the
// artwork has a transparent background.
function stripBackground(svg) {
  return svg.replace(
    /<path d="M0,0 L\d+,0 L\d+,\d+ L0,\d+ Z\s*" fill="#[A-Fa-f0-9]{6}"[^/]*\/>\s*/,
    '',
  );
}

// Area proxy for a path: bounding box of its coordinate pairs.
function pathArea(d) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  const xs = [], ys = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    xs.push(+nums[i]);
    ys.push(+nums[i + 1]);
  }
  if (!xs.length) return 0;
  return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
}

// Colours that carry the character's identity: skip outlines, shadows and whites.
function isTintable(hex) {
  const [, s, l] = rgbToHsl(hexToRgb(hex));
  return s >= 0.18 && l >= 0.12 && l <= 0.9;
}

function analyse(svg) {
  const weights = new Map();
  for (const m of svg.matchAll(PATH_RE)) {
    const [, d, fill] = m;
    if (!isTintable(fill)) continue;
    weights.set(fill, (weights.get(fill) || 0) + pathArea(d));
  }

  // Cluster tintable colours into 40-degree hue buckets.
  const buckets = new Map();
  for (const [hex, w] of weights) {
    const [h] = rgbToHsl(hexToRgb(hex));
    const key = Math.floor(h / 40);
    if (!buckets.has(key)) buckets.set(key, { colors: [], weight: 0 });
    const b = buckets.get(key);
    b.colors.push(hex);
    b.weight += w;
  }

  return [...buckets.values()]
    .sort((a, b) => b.weight - a.weight)
    .map((b) => {
      const hues = b.colors.map((hex) => rgbToHsl(hexToRgb(hex))[0]);
      return { ...b, meanHue: hues.reduce((s, h) => s + h, 0) / hues.length };
    });
}

// Merge several clusters into one so they retint together as a single region.
function mergeClusters(clusters, indices) {
  const picked = indices.map(i => clusters[i]).filter(Boolean);
  if (!picked.length) return null;
  const colors = picked.flatMap(c => c.colors);
  const hues = colors.map(hex => rgbToHsl(hexToRgb(hex))[0]);
  return { colors, meanHue: hues.reduce((s, h) => s + h, 0) / hues.length };
}

// Rotate a cluster's colours so its mean hue lands on `targetHue`, keeping each
// colour's offset from the cluster mean (so shading survives the recolor).
function recolorCluster(svg, cluster, targetHue) {
  let out = svg;
  for (const hex of cluster.colors) {
    const [h, s, l] = rgbToHsl(hexToRgb(hex));
    const offset = h - cluster.meanHue;
    const next = rgbToHex(hslToRgb([targetHue + offset * 0.35, Math.min(1, s * 1.05), l]));
    out = out.replaceAll(`fill="${hex}"`, `fill="${next}"`);
  }
  return out;
}

// --- 1. Import source art -------------------------------------------------

for (const { src, dest } of IMPORTS) {
  const srcPath = path.join(SRC_DIR, src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`skip import (missing source): ${srcPath}`);
    continue;
  }
  const out = stripBackground(fs.readFileSync(srcPath, 'utf8'));
  fs.writeFileSync(path.join(PUBLIC_DIR, dest), out);
  console.log(`imported ${src} -> ${dest}`);
}

// --- 2. Generate recolour variants ----------------------------------------

let created = 0;
for (const { slug, base, regions } of LOOK_FAMILIES) {
  const basePath = path.join(PRESET_DIR, base);
  if (!fs.existsSync(basePath)) {
    console.warn(`skip variants (missing base): ${basePath}`);
    continue;
  }
  const svg = fs.readFileSync(basePath, 'utf8');
  const clusters = analyse(svg);

  for (const [regionId, indices] of Object.entries(regions)) {
    const cluster = mergeClusters(clusters, indices);
    if (!cluster) {
      console.warn(`skip ${slug}/${regionId}: clusters ${indices.join(',')} not found`);
      continue;
    }
    for (const color of VARIANT_COLORS) {
      fs.writeFileSync(
        path.join(PRESET_DIR, `variant_${slug}_${regionId}_${color}.svg`),
        recolorCluster(svg, cluster, TARGET_HUES[color]),
      );
      created++;
    }
    console.log(`  ${slug}/${regionId}: clusters [${indices}] meanHue ${Math.round(cluster.meanHue)}`);
  }
}

console.log(`Created ${created} variants in ${PRESET_DIR}`);
