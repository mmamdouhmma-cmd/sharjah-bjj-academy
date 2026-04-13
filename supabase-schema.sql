-- ═══════════════════════════════════════════════════════════
-- MATS BJJ Academy Manager — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dob DATE,
  belt TEXT NOT NULL DEFAULT 'white',
  stripes INTEGER NOT NULL DEFAULT 0 CHECK (stripes >= 0 AND stripes <= 4),
  membership_start DATE,
  membership_end DATE,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Attendance table (one row per student per date)
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);

-- 3. Invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'membership' CHECK (type IN ('membership', 'renewal')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Fighter ratings (overall ratings per student)
CREATE TABLE fighter_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  focus INTEGER DEFAULT 0 CHECK (focus >= 0 AND focus <= 100),
  attendance_rating INTEGER DEFAULT 0 CHECK (attendance_rating >= 0 AND attendance_rating <= 100),
  performance INTEGER DEFAULT 0 CHECK (performance >= 0 AND performance <= 100),
  behavior INTEGER DEFAULT 0 CHECK (behavior >= 0 AND behavior <= 100),
  studying INTEGER DEFAULT 0 CHECK (studying >= 0 AND studying <= 100),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Technical evaluations (one row per student)
CREATE TABLE technical_evals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  bf_back TEXT, bf_side TEXT, bf_front TEXT,
  st_grabs TEXT, st_conn TEXT, st_coord TEXT, st_base TEXT, st_post TEXT, st_struct TEXT,
  tp_grabs TEXT, tp_conn TEXT, tp_coord TEXT, tp_base TEXT, tp_post TEXT, tp_struct TEXT,
  bt_hip TEXT, bt_tech TEXT, bt_sit TEXT,
  gd_align TEXT, gd_conn TEXT, gd_frame TEXT, gd_base TEXT, gd_post TEXT, gd_struct TEXT,
  gd_ctrl TEXT, gd_grips TEXT, gd_hooks TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Physical measurements (one row per student)
CREATE TABLE physical_evals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  heartbeat_rest TEXT, heartbeat_max TEXT,
  pushup TEXT, crunch TEXT, pullup TEXT,
  squat TEXT, deadlift TEXT, benchpress TEXT, barbentrow TEXT,
  forward_jump TEXT, single_leg_r TEXT, single_leg_l TEXT,
  sprint_50m TEXT, sprint_100m TEXT,
  run_400m TEXT, run_800m TEXT,
  balance_r TEXT, balance_l TEXT,
  dynamic_r TEXT, dynamic_l TEXT,
  "lateral" TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. App credentials (single-row table for the app login)
CREATE TABLE app_credentials (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO app_credentials (id, username, password) VALUES (1, 'khaled raafat', '258001')
  ON CONFLICT (id) DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_date ON invoices(date);

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fighter_ratings_updated BEFORE UPDATE ON fighter_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_technical_evals_updated BEFORE UPDATE ON technical_evals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_physical_evals_updated BEFORE UPDATE ON physical_evals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (open for now — add auth policies later)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fighter_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_evals ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_evals ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_credentials ENABLE ROW LEVEL SECURITY;

-- Public access policies (for development — restrict in production with auth)
CREATE POLICY "Allow all on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on fighter_ratings" ON fighter_ratings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on technical_evals" ON technical_evals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on physical_evals" ON physical_evals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on app_credentials" ON app_credentials FOR ALL USING (true) WITH CHECK (true);
