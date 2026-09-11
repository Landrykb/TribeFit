// Generates recolored Tribeling look variants from the base SVG artwork.
//
// The base art is a flat-fill SVG (one <path fill="#rrggbb"> per shape). Shapes are
// grouped into colour clusters by hue, weighted by bounding-box area. The two
// largest clusters are treated as the character's "skin" and "outfit" regions, and
// each is retargeted to a set of named hues — preserving shading variation inside
// the cluster so the art keeps its highlights and outlines.
//
// Usage: node scripts/gen-avatar-variants.mjs

import fs from 'node:fs';
import path from 'node:path';

const PRESET_DIR = 'public/avatar/presets';

const FAMILIES = [
  { family: 'aurora', base: 'preset-6.svg' },
  { family: 'shadow', base: 'preset-7.svg' },
  { family: 'blaze', base: 'preset-8.svg' },
];

const TARGET_HUES = { red: 0, orange: 30, green: 140, cyan: 185, blue: 220, purple: 275 };
const REGIONS = ['skin', 'outfit'];

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

let created = 0;
for (const { family, base } of FAMILIES) {
  const basePath = path.join(PRESET_DIR, base);
  const svg = fs.readFileSync(basePath, 'utf8');
  const clusters = analyse(svg);

  REGIONS.forEach((region, i) => {
    const cluster = clusters[i];
    if (!cluster) return;
    for (const [color, hue] of Object.entries(TARGET_HUES)) {
      const out = recolorCluster(svg, cluster, hue);
      const name = `variant_${family}_${region}_${color}.svg`;
      fs.writeFileSync(path.join(PRESET_DIR, name), out);
      created++;
    }
  });

  console.log(`${family}: ${clusters.length} clusters, top hues ${clusters.slice(0, 2).map(c => Math.round(c.meanHue)).join(', ')}`);
}

console.log(`Created ${created} variants in ${PRESET_DIR}`);
