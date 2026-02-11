-- AI-xiaobai 企业咨询线索表
-- 在 Supabase -> SQL Editor 中整段执行一次即可

CREATE TABLE IF NOT EXISTS enterprise_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  employees TEXT,
  needs TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_consultations_created_at
  ON enterprise_consultations(created_at DESC);

ALTER TABLE enterprise_consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service can manage enterprise consultations" ON enterprise_consultations;

CREATE POLICY "Service can manage enterprise consultations"
  ON enterprise_consultations
  FOR ALL
  USING (true)
  WITH CHECK (true);
