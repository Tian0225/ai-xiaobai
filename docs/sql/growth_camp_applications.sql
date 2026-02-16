-- AI-xiaobai AI 变现实战陪跑报名线索表
-- 在 Supabase -> SQL Editor 中整段执行一次即可

CREATE TABLE IF NOT EXISTS growth_camp_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wechat TEXT NOT NULL,
  current_stage TEXT NOT NULL,
  goal TEXT NOT NULL,
  weekly_hours TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_camp_applications_created_at
  ON growth_camp_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_growth_camp_applications_status
  ON growth_camp_applications(status);

ALTER TABLE growth_camp_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service can manage growth camp applications" ON growth_camp_applications;

CREATE POLICY "Service can manage growth camp applications"
  ON growth_camp_applications
  FOR ALL
  USING (true)
  WITH CHECK (true);
