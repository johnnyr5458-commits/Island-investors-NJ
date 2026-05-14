-- Phase 5: Cadence Audit + Organizational Maintenance Layer
-- Creates persistent storage for audit reports.

CREATE TABLE IF NOT EXISTS cadence_audit_reports (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ran_at        timestamptz NOT NULL DEFAULT now(),
  triggered_by  text NOT NULL DEFAULT 'manual'
                  CHECK (triggered_by IN ('manual', 'scheduled', 'system')),
  duration_ms   integer,
  issue_count   integer NOT NULL DEFAULT 0,
  health_score  integer NOT NULL DEFAULT 100
                  CHECK (health_score BETWEEN 0 AND 100),
  summary       jsonb NOT NULL DEFAULT '{}',
  issues        jsonb NOT NULL DEFAULT '[]',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cadence_audit_reports_ran_at_idx
  ON cadence_audit_reports (ran_at DESC);

-- Authenticated HQ users can read audit reports
ALTER TABLE cadence_audit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HQ users can read audit reports"
  ON cadence_audit_reports FOR SELECT
  TO authenticated
  USING (true);
