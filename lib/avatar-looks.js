// Tribeling look progression — pure logic, no DB access, so it can be unit tested.
//
// Everyone starts on the evolution artwork for their stage and body type (look = null),
// which is free forever and grows with the user's workouts. Base looks unlock for free
// as the user evolves; recolour variants and premium art cost TribeCoins. Restyling is
// free while the stage allowance lasts, then costs RESTYLE_FEE_TC per change.

export const EVOLUTION_STAGES = [
  { id: 'sprout', name: 'Sprout',  min_workouts: 0,  perk: 'Just sprouted' },
  { id: 'rookie', name: 'Rookie',  min_workouts: 1,  perk: '+5% TC on workouts' },
  { id: 'athlete', name: 'Athlete', min_workouts: 5,  perk: '+10% TC on workouts' },
  { id: 'beast',   name: 'Beast',   min_workouts: 15, perk: '+15% TC, skip fees -1 TC' },
  { id: 'legend',  name: 'Legend',  min_workouts: 30, perk: '+20% TC, free weekly shield' },
];

export function getEvolutionStage(totalWorkouts) {
  const n = Number(totalWorkouts || 0);
  let stage = EVOLUTION_STAGES[0];
  for (const s of EVOLUTION_STAGES) if (n >= s.min_workouts) stage = s;
  return stage;
}

export function stageIndex(stageId) {
  const i = EVOLUTION_STAGES.findIndex(s => s.id === stageId);
  return i < 0 ? 0 : i;
}

// ---- Body types ----------------------------------------------------------
// Evolution artwork can be drawn per body type. Anything a body type doesn't
// have art for falls back to the neutral track, so a partial art set is fine.
// Picking a body type is an identity choice, so it is always free.

export const DEFAULT_BODY_TYPE = 'neutral';

export const AVATAR_BODY_TYPES = {
  neutral: { id: 'neutral', name: 'Neutral' },
  female: { id: 'female', name: 'Female' },
};

const STAGE_ART = {
  neutral: {
    sprout: '/avatar/stage-sprout.png',
    rookie: '/avatar/stage-rookie.png',
    athlete: '/avatar/stage-rookie.png',
    beast: '/avatar/stage-legend.png',
    legend: '/avatar/stage-legend.png',
  },
  female: {
    athlete: '/avatar/stage-female-athlete.svg',
    beast: '/avatar/stage-female-beast.svg',
  },
};

export function isBodyType(id) {
  return Object.prototype.hasOwnProperty.call(AVATAR_BODY_TYPES, id);
}

export function stageArtFor(stageId, bodyType = DEFAULT_BODY_TYPE) {
  return STAGE_ART[bodyType]?.[stageId] || STAGE_ART[DEFAULT_BODY_TYPE][stageId] || null;
}

// Stages where a body type has its own dedicated artwork.
export function customStagesFor(bodyType) {
  return Object.keys(STAGE_ART[bodyType] || {});
}

// ---- Looks ---------------------------------------------------------------

export const RESTYLE_FEE_TC = 15;
// Free look changes granted per evolution stage reached (cumulative).
export const FREE_CHANGES_PER_STAGE = 2;

export const VARIANT_COLORS = ['red', 'orange', 'green', 'cyan', 'blue', 'purple'];

export const VARIANT_REGIONS = {
  skin: { id: 'skin', label: 'Skin', price_tc: 35 },
  outfit: { id: 'outfit', label: 'Outfit', price_tc: 25 },
};

// `regions` maps a region id to the colour-cluster indices it recolours — see
// scripts/gen-avatar-variants.mjs, which imports this to stay in sync. Trainer's
// kit is near-black, so recolouring it would be invisible; instead both of its
// blue clusters retint together as one coherent body colour.
export const LOOK_FAMILIES = [
  {
    slug: 'aurora', base: 'preset-6.svg', name: 'Aurora',
    stage: 'rookie', price_tc: 60,
    regions: { skin: [0], outfit: [1] },
  },
  {
    slug: 'shadow', base: 'preset-7.svg', name: 'Shadow',
    stage: 'athlete', price_tc: 80,
    regions: { skin: [0], outfit: [1] },
  },
  {
    slug: 'trainer', base: 'preset-trainer.svg', name: 'Trainer',
    stage: 'rookie', price_tc: 0,
    regions: { skin: [0, 1] },
  },
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function buildLooks() {
  const looks = {
    'preset-1.svg': { id: 'preset-1.svg', name: 'Sprout',      family: 'Starter', stage: 'sprout',  price_tc: 0 },
    'preset-2.svg': { id: 'preset-2.svg', name: 'Rookie',      family: 'Starter', stage: 'rookie',  price_tc: 0 },
    'preset-3.png': { id: 'preset-3.png', name: 'Nightfall',   family: 'Starter', stage: 'athlete', price_tc: 0 },
    'preset-4.png': { id: 'preset-4.png', name: 'Sunburst',    family: 'Starter', stage: 'beast',   price_tc: 0 },
    'preset-5.png': { id: 'preset-5.png', name: 'Trailblazer', family: 'Starter', stage: 'legend',  price_tc: 0 },
  };
  for (const fam of LOOK_FAMILIES) {
    looks[fam.base] = {
      id: fam.base,
      name: `${fam.name} Original`,
      family: fam.name,
      stage: fam.stage,
      price_tc: fam.price_tc,
    };
    for (const regionId of Object.keys(fam.regions)) {
      const region = VARIANT_REGIONS[regionId];
      for (const color of VARIANT_COLORS) {
        const id = `variant_${fam.slug}_${regionId}_${color}.svg`;
        looks[id] = {
          id,
          name: `${fam.name} ${region.label} ${cap(color)}`,
          family: fam.name,
          region: regionId,
          color,
          stage: fam.stage,
          price_tc: region.price_tc,
        };
      }
    }
  }
  return looks;
}

export const AVATAR_LOOKS = buildLooks();

// A look becomes available once the user has evolved far enough.
export function isLookUnlockedByStage(lookId, currentStageId) {
  const def = AVATAR_LOOKS[lookId];
  if (!def) return false;
  return stageIndex(currentStageId) >= stageIndex(def.stage);
}

// Free looks are auto-owned as soon as their stage is reached; paid ones are stored.
export function ownedLooks(state, currentStageId) {
  const stored = Array.isArray(state?.owned_looks) ? state.owned_looks : [];
  const earned = Object.values(AVATAR_LOOKS)
    .filter(l => l.price_tc === 0 && isLookUnlockedByStage(l.id, currentStageId))
    .map(l => l.id);
  return Array.from(new Set([...earned, ...stored.filter(id => AVATAR_LOOKS[id])]));
}

export function lookChangeBudget(state, currentStageId) {
  const allowance = (stageIndex(currentStageId) + 1) * FREE_CHANGES_PER_STAGE;
  const used = Number(state?.look_changes || 0);
  return { allowance, used, remaining: Math.max(0, allowance - used), fee_tc: RESTYLE_FEE_TC };
}

// Retired artwork must not 404 for users who still have it equipped.
export function sanitizeLook(lookId) {
  return lookId && AVATAR_LOOKS[lookId] ? lookId : null;
}
