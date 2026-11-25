-- JACKPOT shared game state for Supabase
-- WARNING: This intentionally permits anonymous visitors to read and modify one shared game row.
-- Do not reuse this table for private data.
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
create policy "jackpot public read" on public.jackpot_state for select to anon using (true);
create policy "jackpot public insert main" on public.jackpot_state for insert to anon with check (id = 'main');
create policy "jackpot public update main" on public.jackpot_state for update to anon using (id = 'main') with check (id = 'main');

insert into public.jackpot_state(id, state)
values ('main', jsonb_build_object(
  'questions', jsonb_build_array(jsonb_build_object(
    'question', 'Sample question: Name something people bring to a party.',
    'answers', jsonb_build_array(
      jsonb_build_object('text','Food','points',35,'revealed',false),
      jsonb_build_object('text','Drinks','points',25,'revealed',false),
      jsonb_build_object('text','Music','points',15,'revealed',false)
    )
  )),
  'currentQuestion', 0,
  'scores', jsonb_build_array(0,0),
  'activePlayer', 0,
  'timerSeconds', 20,
  'timerRunning', false,
  'timerStartedAt', null,
  'scoresVisible', false
))
on conflict (id) do nothing;

-- Enable Supabase Realtime for the state table. If this errors because it's already
-- in the publication, skip this line; the table is already configured.
alter publication supabase_realtime add table public.jackpot_state;
