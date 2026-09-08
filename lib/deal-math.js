// Deal split math utilities
// S = DEAL_SKIP_FEE_TC, d = DEAL_DONATION_PCT, R = N - 1
// Returns { donation, splitEach, splitTotal }
export function computeDealSplit({ fee = 100, donationPct = 0.10, memberCount = 4 }) {
  const N = Number(memberCount);
  if (!Number.isFinite(N) || N < 2) {
    throw new Error('memberCount must be >= 2');
  }
  const R = N - 1; // recipients excluding skipper
  const S = Number(fee);
  const d = Number(donationPct);
  const donation = Math.round(S * d);
  const splitTotal = S - donation;
  const splitEach = Math.floor(splitTotal / R);
  return { donation, splitEach, splitTotal };
}

// Example: S=100, d=0.10, N=4 => donation=10, splitTotal=90, splitEach=30
