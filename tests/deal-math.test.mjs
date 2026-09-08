import { computeDealSplit } from '../lib/deal-math.js';

function assertEqual(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`);
  if (!ok) {
    console.log('  expected:', expected);
    console.log('  actual  :', actual);
    process.exitCode = 1;
  }
}

// S=100, d=0.10, N=4 -> donation=10, splitTotal=90, splitEach=30
assertEqual(
  computeDealSplit({ fee: 100, donationPct: 0.10, memberCount: 4 }),
  { donation: 10, splitEach: 30, splitTotal: 90 },
  'basic split 4 members'
);

// S=100, d=0.25, N=5 -> donation=25, splitTotal=75, splitEach=18 (floor)
assertEqual(
  computeDealSplit({ fee: 100, donationPct: 0.25, memberCount: 5 }),
  { donation: 25, splitEach: 18, splitTotal: 75 },
  'quarter donation 5 members'
);

// Edge: minimum members 2 -> R=1, all split to one member
assertEqual(
  computeDealSplit({ fee: 100, donationPct: 0.10, memberCount: 2 }),
  { donation: 10, splitEach: 90, splitTotal: 90 },
  'two members split'
);

console.log('Deal math tests completed.');
