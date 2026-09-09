-- Squad → Tribe Progression System Schema Extension
-- Run this after supabase-schema.sql
-- This file is safe to re-run: it uses IF NOT EXISTS / DROP IF EXISTS throughout.

-- =====================================================================================
-- ALIGN tribe_members WITH SQUAD FEATURES
-- =====================================================================================

-- Allow 'owner' role in memberships (the app uses 'owner' when the creator is added)
ALTER TABLE tribe_members
  DROP CONSTRAINT IF EXISTS tribe_members_role_check;

ALTER TABLE tribe_members
  ADD CONSTRAINT tribe_members_role_check
  CHECK (role IN ('member', 'admin', 'moderator', 'owner'));

-- Add membership status for invites / removed members
ALTER TABLE tribe_members
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

ALTER TABLE tribe_members
  DROP CONSTRAINT IF EXISTS tribe_members_status_check;

ALTER TABLE tribe_members
  ADD CONSTRAINT tribe_members_status_check
  CHECK (status IN ('active', 'invited', 'left', 'banned'));

-- Backfill existing rows
UPDATE tribe_members SET status = 'active' WHERE status IS NULL;

-- =====================================================================================
-- EXTEND tribes TABLE
-- =====================================================================================

ALTER TABLE tribes
  ADD COLUMN IF NOT EXISTS group_type VARCHAR(20) DEFAULT 'squad',
  ADD COLUMN IF NOT EXISTS progression_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS participation_rate DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS customization_data JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_tribes_group_type ON tribes(group_type);
CREATE INDEX IF NOT EXISTS idx_tribes_streak ON tribes(streak_days DESC);

-- Mark a default "Founders Tribe" as a real tribe if it exists (no error if missing)
UPDATE tribes
SET group_type = 'tribe',
    upgraded_at = NOW() - INTERVAL '30 days',
    customization_data = jsonb_build_object(
      'logo_url', '/tribe-logos/founders.png',
      'banner_color', '#6366f1',
      'theme_color', 'indigo'
    )
WHERE name = 'Founders Tribe';

-- =====================================================================================
-- SQUAD PROGRESSION HISTORY
-- =====================================================================================

CREATE TABLE IF NOT EXISTS squad_progression_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'streak_milestone', 'participation_update', 'upgrade_eligible', 'upgraded'
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

ALTER TABLE squad_progression_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view squad progression in their tribes" ON squad_progression_history;
CREATE POLICY "Users can view squad progression in their tribes" ON squad_progression_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tribe_members tm
    WHERE tm.tribe_id = squad_progression_history.squad_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

DROP POLICY IF EXISTS "Tribe leaders can insert squad progression events" ON squad_progression_history;
CREATE POLICY "Tribe leaders can insert squad progression events" ON squad_progression_history
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM tribes t
    WHERE t.id = squad_progression_history.squad_id
    AND t.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM tribe_members tm
    WHERE tm.tribe_id = squad_progression_history.squad_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
    AND tm.role IN ('admin', 'moderator', 'owner')
  )
);

-- =====================================================================================
-- SQUAD / TRIBE ANALYTICS
-- =====================================================================================

CREATE TABLE IF NOT EXISTS squad_tribe_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
  group_type VARCHAR(20) NOT NULL,
  analytics_date DATE DEFAULT CURRENT_DATE,
  member_count INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  workout_completions INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  deal_vault_balance INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  participation_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, analytics_date)
);

CREATE INDEX IF NOT EXISTS idx_squad_tribe_analytics_type_date ON squad_tribe_analytics(group_type, analytics_date DESC);
CREATE INDEX IF NOT EXISTS idx_squad_tribe_analytics_streak ON squad_tribe_analytics(streak_days DESC);
CREATE INDEX IF NOT EXISTS idx_squad_tribe_analytics_participation ON squad_tribe_analytics(participation_rate DESC);

ALTER TABLE squad_tribe_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view analytics for their groups" ON squad_tribe_analytics;
CREATE POLICY "Users can view analytics for their groups" ON squad_tribe_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tribe_members tm
    WHERE tm.tribe_id = squad_tribe_analytics.group_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

-- =====================================================================================
-- UPGRADE ELIGIBILITY VIEW
-- =====================================================================================

CREATE OR REPLACE VIEW squad_upgrade_eligibility AS
SELECT
  t.id,
  t.name,
  t.group_type,
  t.streak_days,
  t.participation_rate,
  COALESCE(tm.member_count, 0) AS member_count,
  (t.streak_days >= 30 AND t.participation_rate >= 70 AND COALESCE(tm.member_count, 0) >= 3) AS is_eligible,
  CASE
    WHEN t.streak_days < 30 THEN 30 - t.streak_days
    ELSE 0
  END AS days_until_streak_requirement,
  CASE
    WHEN t.participation_rate < 70 THEN 70 - t.participation_rate
    ELSE 0
  END AS participation_gap
FROM tribes t
LEFT JOIN (
  SELECT tribe_id, COUNT(*) AS member_count
  FROM tribe_members
  WHERE status = 'active'
  GROUP BY tribe_id
) tm ON t.id = tm.tribe_id
WHERE t.group_type = 'squad';

-- =====================================================================================
-- FUNCTION: UPGRADE A SQUAD TO A TRIBE
-- =====================================================================================

CREATE OR REPLACE FUNCTION upgrade_squad_to_tribe(squad_id UUID, upgraded_by UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, tribe_id UUID) AS $$
DECLARE
  squad_record tribes%ROWTYPE;
  eligibility_check RECORD;
BEGIN
  SELECT * INTO squad_record FROM tribes WHERE id = squad_id AND group_type = 'squad';

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Squad not found'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  SELECT * INTO eligibility_check FROM squad_upgrade_eligibility WHERE id = squad_id;

  IF eligibility_check IS NULL OR NOT eligibility_check.is_eligible THEN
    RETURN QUERY SELECT FALSE, 'Squad not eligible for upgrade'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  UPDATE tribes
  SET
    group_type = 'tribe',
    upgraded_at = NOW(),
    progression_data = jsonb_build_object(
      'upgraded_from', 'squad',
      'upgrade_date', NOW(),
      'upgraded_by', upgraded_by,
      'pre_upgrade_stats', jsonb_build_object(
        'streak_days', streak_days,
        'participation_rate', participation_rate,
        'member_count', eligibility_check.member_count
      )
    )
  WHERE id = squad_id;

  INSERT INTO squad_progression_history (squad_id, event_type, event_data, created_by)
  VALUES (
    squad_id,
    'upgraded',
    jsonb_build_object(
      'from_type', 'squad',
      'to_type', 'tribe',
      'streak_days', squad_record.streak_days,
      'participation_rate', squad_record.participation_rate,
      'member_count', eligibility_check.member_count
    ),
    upgraded_by
  );

  RETURN QUERY SELECT TRUE, 'Squad successfully upgraded to Tribe!'::TEXT, squad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- FUNCTION: UPDATE DAILY SQUAD/TRIBE STATISTICS
-- =====================================================================================

CREATE OR REPLACE FUNCTION update_squad_tribe_stats()
RETURNS void AS $$
BEGIN
  INSERT INTO squad_tribe_analytics (
    group_id,
    group_type,
    analytics_date,
    member_count,
    active_members,
    workout_completions,
    skip_count,
    deal_vault_balance,
    streak_days,
    participation_rate
  )
  SELECT
    t.id,
    t.group_type,
    CURRENT_DATE,
    COALESCE(m.member_count, 0),
    COALESCE(m.active_count, 0),
    COALESCE(w.workout_count, 0),
    COALESCE(s.skip_count, 0),
    COALESCE((SELECT pw.balance_tc::int FROM pact_wallets pw WHERE pw.tribe_id = t.id), 0),
    t.streak_days,
    t.participation_rate
  FROM tribes t
  LEFT JOIN (
    SELECT
      tm.tribe_id,
      COUNT(*) AS member_count,
      COUNT(DISTINCT s.user_id) AS active_count
    FROM tribe_members tm
    LEFT JOIN sessions s
      ON s.user_id = tm.user_id
      AND s.created_at >= CURRENT_DATE - INTERVAL '7 days'
    WHERE tm.status = 'active'
    GROUP BY tm.tribe_id
  ) m ON t.id = m.tribe_id
  LEFT JOIN (
    SELECT tribe_id, COUNT(*) AS workout_count
    FROM sessions
    WHERE completed = true
      AND created_at >= CURRENT_DATE
    GROUP BY tribe_id
  ) w ON t.id = w.tribe_id
  LEFT JOIN (
    SELECT tm.tribe_id, COUNT(*) AS skip_count
    FROM pact_tx pt
    JOIN tribe_members tm ON tm.user_id = pt.user_id AND tm.status = 'active'
    WHERE pt.type = 'skip'
      AND pt.created_at >= CURRENT_DATE
    GROUP BY tm.tribe_id
  ) s ON t.id = s.tribe_id
  ON CONFLICT (group_id, analytics_date)
  DO UPDATE SET
    member_count = EXCLUDED.member_count,
    active_members = EXCLUDED.active_members,
    workout_completions = EXCLUDED.workout_completions,
    skip_count = EXCLUDED.skip_count,
    deal_vault_balance = EXCLUDED.deal_vault_balance,
    streak_days = EXCLUDED.streak_days,
    participation_rate = EXCLUDED.participation_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
