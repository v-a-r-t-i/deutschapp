-- Run this in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/yngsuxuamhzefkkjsgus/sql

create table if not exists battle_log (
  id          uuid default gen_random_uuid() primary key,
  winner_id   uuid references profiles(id) on delete cascade,
  loser_id    uuid references profiles(id) on delete cascade,
  room_id     text,
  stake       int default 5,
  week_start  date not null,
  created_at  timestamptz default now()
);

alter table battle_log enable row level security;

create policy "Anyone can read battle_log"
  on battle_log for select using (true);

create policy "Winner inserts own battles"
  on battle_log for insert
  with check (auth.uid() = winner_id);
