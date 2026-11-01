-- =============================================================
-- 001_initial_schema.sql  –  Fitness Calorie Tracker
-- =============================================================

-- ── Profiles ──────────────────────────────────────────────────
create table if not exists profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  date_of_birth       date,
  gender              text check (gender in ('male','female','other')),
  height_cm           numeric(5,1),
  weight_kg           numeric(5,1),
  activity_level      text check (activity_level in
    ('sedentary','light','moderate','active','very_active')),
  goal_type           text check (goal_type in ('lose','maintain','gain')),
  daily_calorie_goal  int,
  created_at          timestamptz default now()
);

-- ── Foods catalog ──────────────────────────────────────────────
create table if not exists foods (
  id                  bigint generated always as identity primary key,
  user_id             uuid references auth.users(id) on delete cascade,
  name                text not null,
  brand               text,
  serving_desc        text default '100 g',
  serving_grams       numeric(7,2) default 100,
  calories_per_100g   numeric(7,2) not null,
  protein_g           numeric(6,2),
  carbs_g             numeric(6,2),
  fat_g               numeric(6,2),
  fiber_g             numeric(6,2),
  source              text,
  external_id         text,
  created_at          timestamptz default now()
);
create index if not exists foods_name_fts on foods using gin (to_tsvector('simple', name));

-- ── Food log entries ───────────────────────────────────────────
create table if not exists food_logs (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  food_id         bigint references foods(id),
  food_name       text not null,
  logged_on       date not null default current_date,
  meal_type       text check (meal_type in ('breakfast','lunch','dinner','snack')),
  quantity_grams  numeric(8,2) not null,
  calories        numeric(8,2) not null,
  protein_g       numeric(7,2),
  carbs_g         numeric(7,2),
  fat_g           numeric(7,2),
  created_at      timestamptz default now()
);
create index if not exists food_logs_user_date on food_logs (user_id, logged_on);

-- ── Exercises catalog (global) ─────────────────────────────────
create table if not exists exercises (
  id                bigint generated always as identity primary key,
  name              text not null unique,
  category          text,
  met               numeric(4,1) not null,
  intensity         text,
  equipment_needed  boolean default false
);

-- ── Exercise log ───────────────────────────────────────────────
create table if not exists exercise_logs (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  exercise_id     bigint references exercises(id),
  exercise_name   text not null,
  logged_on       date not null default current_date,
  duration_min    numeric(6,1) not null,
  calories_burned numeric(8,2) not null,
  created_at      timestamptz default now()
);
create index if not exists exercise_logs_user_date on exercise_logs (user_id, logged_on);

-- ── Weight history ─────────────────────────────────────────────
create table if not exists weight_logs (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  logged_on   date not null default current_date,
  weight_kg   numeric(5,1) not null,
  unique (user_id, logged_on)
);

-- ── Burn plans ─────────────────────────────────────────────────
create table if not exists burn_plans (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  calories_to_burn  int not null,
  days              int not null default 1,
  plan              jsonb not null,
  created_at        timestamptz default now()
);

-- ── Row Level Security ─────────────────────────────────────────
alter table profiles      enable row level security;
alter table food_logs     enable row level security;
alter table exercise_logs enable row level security;
alter table weight_logs   enable row level security;
alter table burn_plans    enable row level security;
alter table foods         enable row level security;
alter table exercises     enable row level security;

-- profiles
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- food_logs
create policy "own food logs" on food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- exercise_logs
create policy "own exercise logs" on exercise_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- weight_logs
create policy "own weight logs" on weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- burn_plans
create policy "own burn plans" on burn_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- foods: read global or own, write only own
create policy "read foods" on foods
  for select using (user_id is null or user_id = auth.uid());
create policy "manage own foods" on foods
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- exercises: authenticated read-only
create policy "read exercises" on exercises
  for select to authenticated using (true);

-- ── Auto-create profile on signup ─────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
