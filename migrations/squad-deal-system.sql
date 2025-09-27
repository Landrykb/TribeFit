-- TribeFit Squad → Tribe + Deal System Migration
-- Safe to run: uses new tables/columns only, no breaking changes

-- ========================================
-- 1. Group Types & Upgrade-by-Size
-- ========================================

-- Add group_type to existing tribes table (reuse existing table)
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS group_type TEXT DEFAULT 'tribe'; 
-- 'squad' | 'tribe'

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_tribes_group_type ON tribes(group_type);

-- Every existing row defaults to 'tribe'. For new Squads, set group_type='squad'

-- ========================================
-- 2. Donation Pool (distinct from main vault)
-- ========================================

-- Add donation pool to existing pact_wallets table
ALTER TABLE pact_wallets ADD COLUMN IF NOT EXISTS donation_pool_tc NUMERIC(12,2) DEFAULT 0;

-- ========================================
-- 3. Wishlist / Next Purchase Plan
-- ========================================

-- Wishlist (per tribe/squad)
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wishlist items (catalog items with specs and pledges)
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
  label TEXT,
  specs JSONB DEFAULT '{}',         -- chosen weight/size/flavor
  target_tc NUMERIC(12,2) DEFAULT 0,
  pledged_tc NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'planned',    -- planned|purchased|cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 4. Reactions (stickers) to skips
-- ========================================

CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
  from_user UUID REFERENCES users(id) ON DELETE SET NULL,
  to_user UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,               -- 'funny','motivate','fire','clap', etc.
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 5. Voting only for DONATIONS (kept, but not for gear spend)
-- ========================================

CREATE TABLE IF NOT EXISTS donation_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
  request_id UUID REFERENCES pact_spend_requests(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  value BOOLEAN NOT NULL,           -- true = approve
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, voter_id)
);

-- ========================================
-- 6. Calendar Integration
-- ========================================

-- Calendar connections (OAuth tokens)
CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,          -- 'google' | 'apple'
  access_token TEXT,
  refresh_token TEXT,
  calendar_id TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ========================================
-- 7. Enhanced Transaction Types
-- ========================================

-- Add new transaction types for deal split tracking
-- (Extends existing pact_transactions table)
-- Types: 'skip_split', 'donation_accrual', 'catalog_purchase', 'donation_spend'

-- ========================================
-- 8. Indexes for Performance  
-- ========================================

CREATE INDEX IF NOT EXISTS idx_wishlists_tribe_id ON wishlists(tribe_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_status ON wishlist_items(status);
CREATE INDEX IF NOT EXISTS idx_reactions_tribe_id ON reactions(tribe_id);
CREATE INDEX IF NOT EXISTS idx_reactions_to_user ON reactions(to_user);
CREATE INDEX IF NOT EXISTS idx_donation_votes_tribe_id ON donation_votes(tribe_id);
CREATE INDEX IF NOT EXISTS idx_donation_votes_request_id ON donation_votes(request_id);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_user_id ON calendar_connections(user_id);

-- ========================================
-- 9. RLS Policies (Security)
-- ========================================

-- Enable RLS on new tables
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

-- Wishlists: Members can view/modify their tribe's wishlist
CREATE POLICY IF NOT EXISTS "Members can manage tribe wishlists" ON wishlists
  FOR ALL USING (
    tribe_id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid()
    )
  );

-- Wishlist items: Members can view/modify items in their tribe's wishlist
CREATE POLICY IF NOT EXISTS "Members can manage wishlist items" ON wishlist_items
  FOR ALL USING (
    wishlist_id IN (
      SELECT w.id FROM wishlists w 
      JOIN tribe_members tm ON w.tribe_id = tm.tribe_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Reactions: Members can view reactions in their tribes, send reactions
CREATE POLICY IF NOT EXISTS "Members can view/send reactions" ON reactions
  FOR ALL USING (
    tribe_id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid()
    )
  );

-- Donation votes: Members can vote on their tribe's donation requests
CREATE POLICY IF NOT EXISTS "Members can vote on donations" ON donation_votes
  FOR ALL USING (
    tribe_id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid()
    )
  );

-- Calendar connections: Users can only access their own connections
CREATE POLICY IF NOT EXISTS "Users manage own calendar connections" ON calendar_connections
  FOR ALL USING (user_id = auth.uid());

-- ========================================
-- 10. Sample Data for Testing (Optional)
-- ========================================

-- Insert sample catalog items if catalog_items table is empty
INSERT INTO catalog_items (id, name, price_tc, category, description, specs)
SELECT 
  gen_random_uuid(),
  'Resistance Bands Set',
  150,
  'equipment',
  'Professional resistance bands with multiple resistance levels',
  '{"colors": ["red", "blue", "green"], "resistance": ["light", "medium", "heavy"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM catalog_items LIMIT 1);

INSERT INTO catalog_items (id, name, price_tc, category, description, specs)
SELECT 
  gen_random_uuid(),
  'Yoga Mat Premium',
  120,
  'equipment', 
  'Non-slip premium yoga mat',
  '{"colors": ["purple", "blue", "black"], "thickness": ["4mm", "6mm"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM catalog_items WHERE name = 'Yoga Mat Premium');

INSERT INTO catalog_items (id, name, price_tc, category, description, specs)
SELECT 
  gen_random_uuid(),
  'Protein Powder',
  200,
  'nutrition',
  'Whey protein powder for muscle recovery',
  '{"flavors": ["vanilla", "chocolate", "strawberry"], "size": ["1kg", "2kg"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM catalog_items WHERE name = 'Protein Powder');

-- ========================================
-- Migration Complete
-- ========================================

-- Log migration
INSERT INTO migration_log (version, description, applied_at)
VALUES ('squad_deal_v1', 'Squad → Tribe + Deal System Implementation', NOW())
ON CONFLICT (version) DO NOTHING;