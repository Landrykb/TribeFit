-- Squad → Tribe Progression System Schema Extension
-- Non-breaking additions to existing TribeFit schema

-- Extend existing tribes table with squad/tribe type and progression data
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS group_type VARCHAR(20) DEFAULT 'tribe';
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS progression_data JSONB DEFAULT '{}';
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS participation_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS customization_data JSONB DEFAULT '{}';

-- Create index for efficient squad/tribe queries
CREATE INDEX IF NOT EXISTS idx_tribes_group_type ON tribes(group_type);
CREATE INDEX IF NOT EXISTS idx_tribes_streak ON tribes(streak_days DESC);

-- Squad progression tracking table
CREATE TABLE IF NOT EXISTS squad_progression_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'streak_milestone', 'participation_update', 'upgrade_eligible', 'upgraded'
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create RLS policies for squad progression
ALTER TABLE squad_progression_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view squad progression in their tribes" ON squad_progression_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tribe_memberships tm
    WHERE tm.tribe_id = squad_progression_history.squad_id
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Tribe leaders can insert squad progression events" ON squad_progression_history
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM tribe_memberships tm
    WHERE tm.tribe_id = squad_progression_history.squad_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('owner', 'admin')
  )
);

-- Squad/Tribe analytics table for leaderboards
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

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_squad_tribe_analytics_type_date ON squad_tribe_analytics(group_type, analytics_date DESC);
CREATE INDEX IF NOT EXISTS idx_squad_tribe_analytics_streak ON squad_tribe_analytics(streak_days DESC);
CREATE INDEX IF NOT EXISTS idx_squad_tribe_analytics_participation ON squad_tribe_analytics(participation_rate DESC);

-- Enable RLS for analytics
ALTER TABLE squad_tribe_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their groups" ON squad_tribe_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tribe_memberships tm
    WHERE tm.tribe_id = squad_tribe_analytics.group_id
    AND tm.user_id = auth.uid()
  )
);

-- Upgrade eligibility view
CREATE OR REPLACE VIEW squad_upgrade_eligibility AS
SELECT 
  t.id,
  t.name,
  t.group_type,
  t.streak_days,
  t.participation_rate,
  tm.member_count,
  (t.streak_days >= 30 AND t.participation_rate >= 70 AND tm.member_count >= 3) AS is_eligible,
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
  SELECT 
    tribe_id, 
    COUNT(*) as member_count 
  FROM tribe_memberships 
  WHERE status = 'active' 
  GROUP BY tribe_id
) tm ON t.id = tm.tribe_id
WHERE t.group_type = 'squad';

-- Function to upgrade squad to tribe
CREATE OR REPLACE FUNCTION upgrade_squad_to_tribe(squad_id UUID, upgraded_by UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, tribe_id UUID) AS $$
DECLARE
  squad_record tribes%ROWTYPE;
  eligibility_check RECORD;
BEGIN
  -- Get squad details
  SELECT * INTO squad_record FROM tribes WHERE id = squad_id AND group_type = 'squad';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Squad not found'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check eligibility
  SELECT * INTO eligibility_check FROM squad_upgrade_eligibility WHERE id = squad_id;
  
  IF NOT eligibility_check.is_eligible THEN
    RETURN QUERY SELECT FALSE, 'Squad not eligible for upgrade'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Perform upgrade
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
  
  -- Log progression event
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

-- Function to update squad/tribe statistics
CREATE OR REPLACE FUNCTION update_squad_tribe_stats()
RETURNS void AS $$
BEGIN
  -- Update daily analytics for all active squads and tribes
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
    COALESCE(tm.member_count, 0),
    COALESCE(tm.active_count, 0),
    COALESCE(ws.workout_count, 0),
    COALESCE(ss.skip_count, 0),
    COALESCE(t.pact_balance, 0),
    t.streak_days,
    t.participation_rate
  FROM tribes t
  LEFT JOIN (
    SELECT 
      tribe_id,
      COUNT(*) as member_count,
      COUNT(CASE WHEN last_active >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_count
    FROM tribe_memberships 
    WHERE status = 'active'
    GROUP BY tribe_id
  ) tm ON t.id = tm.tribe_id
  LEFT JOIN (
    SELECT 
      tribe_id,
      COUNT(*) as workout_count
    FROM workout_sessions ws
    JOIN tribe_memberships tm ON ws.user_id = tm.user_id
    WHERE ws.created_at >= CURRENT_DATE
    GROUP BY tribe_id
  ) ws ON t.id = ws.tribe_id
  LEFT JOIN (
    SELECT 
      tribe_id,
      COUNT(*) as skip_count
    FROM skip_history sh
    JOIN tribe_memberships tm ON sh.user_id = tm.user_id
    WHERE sh.created_at >= CURRENT_DATE
    GROUP BY tribe_id
  ) ss ON t.id = ss.tribe_id
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

-- Create a daily job to update stats (if using pg_cron extension)
-- SELECT cron.schedule('update-squad-tribe-stats', '0 1 * * *', 'SELECT update_squad_tribe_stats();');

-- Insert sample squads and progression data for testing
INSERT INTO tribes (id, name, description, group_type, streak_days, participation_rate, pact_balance, created_by) 
VALUES 
  ('30000000-0000-0000-0000-000000000001', 'Morning Legends', 'Early bird workout squad', 'squad', 25, 85.5, 450, '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', 'Iron Hearts', 'Strength training focused squad', 'squad', 35, 92.0, 680, '00000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000003', 'Cardio Crushers', 'High-energy cardio squad', 'squad', 15, 65.0, 230, '00000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Update existing tribe to be a tribe (not squad)
UPDATE tribes 
SET group_type = 'tribe', 
    upgraded_at = NOW() - INTERVAL '30 days',
    customization_data = jsonb_build_object(
      'logo_url', '/tribe-logos/founders.png',
      'banner_color', '#6366f1',
      'theme_color', 'indigo'
    )
WHERE name = 'Founders Tribe';

-- Add sample memberships for squads
INSERT INTO tribe_memberships (user_id, tribe_id, role, status, joined_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'owner', 'active', NOW() - INTERVAL '25 days'),
  ('00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'member', 'active', NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'member', 'active', NOW() - INTERVAL '15 days')
ON CONFLICT (user_id, tribe_id) DO NOTHING;