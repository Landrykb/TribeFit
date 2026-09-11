import fs from 'node:fs';
import path from 'node:path';
import {
  AVATAR_LOOKS, EVOLUTION_STAGES, RESTYLE_FEE_TC, FREE_CHANGES_PER_STAGE,
  getEvolutionStage, isLookUnlockedByStage, ownedLooks, lookChangeBudget,
  stageArtFor, AVATAR_BODY_TYPES, DEFAULT_BODY_TYPE,
} from '../lib/avatar-looks.js';

function assert(ok, label) {
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`);
  if (!ok) process.exitCode = 1;
}

function assertEqual(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`);
  if (!ok) {
    console.log('  expected:', expected);
    console.log('  actual  :', actual);
    process.exitCode = 1;
  }
}

// Every catalog entry must resolve to a real file the browser can fetch.
const presetDir = path.join(process.cwd(), 'public/avatar/presets');
const onDisk = new Set(fs.readdirSync(presetDir));
const missing = Object.keys(AVATAR_LOOKS).filter(id => !onDisk.has(id));
const orphans = [...onDisk].filter(f => /\.(svg|png)$/.test(f) && !AVATAR_LOOKS[f]);
assertEqual(missing, [], 'every look has artwork on disk');
assertEqual(orphans, [], 'every artwork file is in the catalog');

// Progression: everyone starts as a sprout.
assertEqual(getEvolutionStage(0).id, 'sprout', 'zero workouts -> sprout');
assertEqual(getEvolutionStage(1).id, 'rookie', 'one workout -> rookie');
assertEqual(getEvolutionStage(30).id, 'legend', '30 workouts -> legend');

// Stage gating: premium art stays locked until the stage is reached.
assert(isLookUnlockedByStage('preset-1.svg', 'sprout'), 'sprout look available at sprout');
assert(!isLookUnlockedByStage('preset-2.svg', 'sprout'), 'rookie look locked at sprout');
assert(!isLookUnlockedByStage('variant_shadow_skin_blue.svg', 'rookie'), 'athlete variant locked at rookie');
assert(isLookUnlockedByStage('variant_shadow_skin_blue.svg', 'athlete'), 'athlete variant open at athlete');
assert(!isLookUnlockedByStage('nope.svg', 'legend'), 'unknown look never unlocks');

// Free looks are auto-granted by stage; paid ones must be bought.
const sproutOwned = ownedLooks({}, 'sprout');
assertEqual(sproutOwned, ['preset-1.svg'], 'sprout starts with only the sprout look');
assert(!ownedLooks({}, 'legend').includes('preset-6.svg'), 'premium art is not auto-granted at legend');
assert(ownedLooks({}, 'legend').includes('preset-5.png'), 'legend free look auto-granted');
assert(
  ownedLooks({ owned_looks: ['preset-6.svg'] }, 'rookie').includes('preset-6.svg'),
  'purchased look stays owned',
);

// Restyle budget: free changes scale with stage, then a flat fee applies.
assertEqual(
  lookChangeBudget({}, 'sprout'),
  { allowance: FREE_CHANGES_PER_STAGE, used: 0, remaining: FREE_CHANGES_PER_STAGE, fee_tc: RESTYLE_FEE_TC },
  'sprout gets one stage worth of free changes',
);
assertEqual(
  lookChangeBudget({ look_changes: 2 }, 'sprout').remaining,
  0,
  'free changes run out',
);
assert(
  lookChangeBudget({ look_changes: 2 }, 'legend').remaining > 0,
  'evolving grants more free changes',
);
assertEqual(
  lookChangeBudget({ look_changes: 99 }, 'sprout').remaining,
  0,
  'remaining never goes negative',
);
assertEqual(
  lookChangeBudget({}, 'legend').allowance,
  EVOLUTION_STAGES.length * FREE_CHANGES_PER_STAGE,
  'legend has the full allowance',
);

// Body type axis exists and falls back to neutral for unknown/unmapped stages.
assert(Object.keys(AVATAR_BODY_TYPES).includes('female'), 'female body type exists');
assert(Object.keys(AVATAR_BODY_TYPES).includes(DEFAULT_BODY_TYPE), 'default body type exists');
assert(stageArtFor('athlete', 'female'), 'female athlete stage art exists');
assert(stageArtFor('beast', 'female'), 'female beast stage art exists');
assertEqual(
  stageArtFor('sprout', 'female'),
  stageArtFor('sprout', DEFAULT_BODY_TYPE),
  'female sprout falls back to neutral art',
);

// Female stage artwork exists on disk and has no Blaze references.
const publicAvatarDir = path.join(process.cwd(), 'public/avatar');
assert(fs.existsSync(path.join(publicAvatarDir, 'stage-female-athlete.svg')), 'female athlete art on disk');
assert(fs.existsSync(path.join(publicAvatarDir, 'stage-female-beast.svg')), 'female beast art on disk');
assert(!fs.existsSync(path.join(publicAvatarDir, 'presets', 'preset-8.svg')), 'blaze base removed');
const blazeFiles = fs.readdirSync(presetDir).filter(f => f.includes('blaze'));
assertEqual(blazeFiles, [], 'no blaze variant files remain');

// Trainer family is in the catalog as a customizable non-evolution look.
assert(AVATAR_LOOKS['preset-trainer.svg'], 'trainer base look exists');
assert(
  Object.keys(AVATAR_LOOKS).some(id => id.startsWith('variant_trainer_')),
  'trainer has recolor variants',
);
assert(!AVATAR_LOOKS['preset-trainer.svg'].price_tc, 'trainer base is free');

console.log('Avatar look tests completed.');
