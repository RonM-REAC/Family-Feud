-- JACKPOT shared game state for the Family Feud board-redesign app.
-- No-login mode: anyone with the public publishable key can read and update this
-- one shared game row. Never store private or personal information here.

create table if not exists public.jackpot_state (
  id text primary key check (id = 'main'),
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.jackpot_state enable row level security;
grant select, insert, update on public.jackpot_state to anon;

drop policy if exists "jackpot public read" on public.jackpot_state;
drop policy if exists "jackpot public insert main" on public.jackpot_state;
drop policy if exists "jackpot public update main" on public.jackpot_state;

create policy "jackpot public read"
  on public.jackpot_state for select to anon using (id = 'main');
create policy "jackpot public insert main"
  on public.jackpot_state for insert to anon with check (id = 'main');
create policy "jackpot public update main"
  on public.jackpot_state for update to anon using (id = 'main') with check (id = 'main');

insert into public.jackpot_state (id, state)
values ('main', jsonb_build_object(
  'questions', jsonb_build_array(jsonb_build_object(
    'question', 'Name something people bring to a party.',
    'answers', jsonb_build_array(
      jsonb_build_object('text', 'Food', 'points', 35, 'revealed', false),
      jsonb_build_object('text', 'Drinks', 'points', 25, 'revealed', false),
      jsonb_build_object('text', 'Music', 'points', 15, 'revealed', false),
      jsonb_build_object('text', 'Dessert', 'points', 10, 'revealed', false),
      jsonb_build_object('text', 'A gift', 'points', 8, 'revealed', false)
    )
  )),
  'currentQuestion', 0,
  'scores', jsonb_build_array(0, 0),
  'activePlayer', 0,
  'timerSeconds', 20,
  'timerRunning', false,
  'timerStartedAt', null,
  'scoresVisible', false
))
on conflict (id) do nothing;

-- The app polls the singleton row for cross-device updates. Realtime is also
-- enabled for future push-based updates. Run this block safely if already added.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'jackpot_state'
  ) then
    alter publication supabase_realtime add table public.jackpot_state;
  end if;
end $$;
