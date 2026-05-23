-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yngsuxuamhzefkkjsgus/sql/new

-- 1. Add invited_id column if missing
ALTER TABLE race_rooms ADD COLUMN IF NOT EXISTS invited_id uuid;

-- 2. Make sure RLS is enabled but permissive enough for authenticated users
ALTER TABLE race_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

-- 3. Drop and recreate policies cleanly
DROP POLICY IF EXISTS "Users can insert race rooms" ON race_rooms;
DROP POLICY IF EXISTS "Users can read race rooms" ON race_rooms;
DROP POLICY IF EXISTS "Users can update race rooms" ON race_rooms;
DROP POLICY IF EXISTS "Users can insert race results" ON race_results;
DROP POLICY IF EXISTS "Users can read race results" ON race_results;

CREATE POLICY "Users can insert race rooms"
  ON race_rooms FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can read race rooms"
  ON race_rooms FOR SELECT
  USING (true);

CREATE POLICY "Users can update race rooms"
  ON race_rooms FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = invited_id);

CREATE POLICY "Users can insert race results"
  ON race_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read race results"
  ON race_results FOR SELECT
  USING (true);

-- 4. battle_log table and policies
CREATE TABLE IF NOT EXISTS battle_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  winner_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  loser_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  room_id     text,
  stake       int DEFAULT 5,
  week_start  date NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE battle_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='battle_log' AND policyname='Anyone can read battle_log') THEN
    CREATE POLICY "Anyone can read battle_log" ON battle_log FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='battle_log' AND policyname='Winner inserts own battles') THEN
    CREATE POLICY "Winner inserts own battles" ON battle_log FOR INSERT WITH CHECK (auth.uid() = winner_id);
  END IF;
END $$;
