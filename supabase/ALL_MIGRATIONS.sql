-- ============================================================================
-- PROMINENT NOTICE: FOR BOOTSTRAPPING A BRAND-NEW, EMPTY DATABASE ONLY
-- ============================================================================
-- DO NOT RUN THIS SCRIPT ON AN EXISTING DATABASE THAT ALREADY CONTAINS TABLES OR DATA.
-- This combined file is intended ONLY for bootstrapping a brand-new, EMPTY database from scratch.
-- Existing databases that have already applied prior migrations must NOT rerun this file;
-- instead, apply ONLY the incremental migration scripts in sequence:
--   - supabase/migrations/005_delete_account.sql
--   - supabase/migrations/006_idempotency.sql
--   - supabase/migrations/007_food_fk_cascade_policies.sql
--   - supabase/migrations/008_calorie_floor_and_minors.sql
-- (or supabase/PATCH_FOR_EXISTING_DB.sql).
-- ============================================================================

-- ── 1. TABLES & EXTENSIONS ───────────────────────────────────────────────────

-- Profiles
create table if not exists public.profiles (
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

-- Foods catalog
create table if not exists public.foods (
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
create index if not exists foods_name_fts on public.foods using gin (to_tsvector('simple', name));

-- Partial unique index on global foods to ensure zero duplicate global entries
create unique index if not exists foods_global_name_uniq
  on public.foods (lower(name))
  where user_id is null;

-- Food log entries
create table if not exists public.food_logs (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  food_id         bigint references public.foods(id),
  food_name       text not null,
  logged_on       date not null default current_date,
  meal_type       text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  quantity_grams  numeric(7,2) not null,
  calories        numeric(7,2) not null,
  protein_g       numeric(6,2),
  carbs_g         numeric(6,2),
  fat_g           numeric(6,2),
  created_at      timestamptz default now()
);
create index if not exists food_logs_user_date on public.food_logs (user_id, logged_on);

-- Exercises catalog
create table if not exists public.exercises (
  id                bigint generated always as identity primary key,
  name              text not null unique,
  category          text not null check (category in
    ('cardio','strength','flexibility','sports','other')),
  met               numeric(4,1) not null,
  intensity         text not null check (intensity in ('low','moderate','high')),
  equipment_needed  boolean not null default false,
  created_at        timestamptz default now()
);

-- Exercise log entries
create table if not exists public.exercise_logs (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  exercise_id     bigint references public.exercises(id),
  exercise_name   text not null,
  logged_on       date not null default current_date,
  duration_min    numeric(6,1) not null,
  calories_burned numeric(7,1) not null,
  created_at      timestamptz default now()
);
create index if not exists exercise_logs_user_date on public.exercise_logs (user_id, logged_on);

-- Weight log entries
create table if not exists public.weight_logs (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  logged_on   date not null default current_date,
  weight_kg   numeric(5,1) not null,
  created_at  timestamptz default now(),
  unique (user_id, logged_on)
);
create index if not exists weight_logs_user_date on public.weight_logs (user_id, logged_on);

-- Burn plans
create table if not exists public.burn_plans (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  calories_to_burn  int not null,
  days              int not null default 1,
  plan              jsonb not null,
  created_at        timestamptz default now()
);
create index if not exists burn_plans_user_date on public.burn_plans (user_id, created_at desc);

-- ── 2. ROW-LEVEL SECURITY & POLICIES ─────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.foods enable row level security;
alter table public.food_logs enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.burn_plans enable row level security;

-- Profiles policies
drop policy if exists "Users view own profile" on public.profiles;
create policy "Users view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users delete own profile" on public.profiles;
create policy "Users delete own profile" on public.profiles
  for delete using (auth.uid() = id);

-- Foods policies
drop policy if exists "Read global foods and own custom foods" on public.foods;
create policy "Read global foods and own custom foods" on public.foods
  for select using (user_id is null or user_id = auth.uid());

drop policy if exists "Insert own custom foods" on public.foods;
create policy "Insert own custom foods" on public.foods
  for insert with check (user_id = auth.uid());

drop policy if exists "Update own custom foods" on public.foods;
create policy "Update own custom foods" on public.foods
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Delete own custom foods" on public.foods;
create policy "Delete own custom foods" on public.foods
  for delete using (user_id = auth.uid());

-- Food logs policies
drop policy if exists "Users read own food_logs" on public.food_logs;
create policy "Users read own food_logs" on public.food_logs
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own food_logs" on public.food_logs;
create policy "Users insert own food_logs" on public.food_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own food_logs" on public.food_logs;
create policy "Users update own food_logs" on public.food_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own food_logs" on public.food_logs;
create policy "Users delete own food_logs" on public.food_logs
  for delete using (auth.uid() = user_id);

-- Exercises policies (Read-only for authenticated users; no write policy)
drop policy if exists "Read exercises catalog" on public.exercises;
create policy "Read exercises catalog" on public.exercises
  for select using (auth.role() = 'authenticated');

-- Exercise logs policies
drop policy if exists "Users read own exercise_logs" on public.exercise_logs;
create policy "Users read own exercise_logs" on public.exercise_logs
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own exercise_logs" on public.exercise_logs;
create policy "Users insert own exercise_logs" on public.exercise_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own exercise_logs" on public.exercise_logs;
create policy "Users update own exercise_logs" on public.exercise_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own exercise_logs" on public.exercise_logs;
create policy "Users delete own exercise_logs" on public.exercise_logs
  for delete using (auth.uid() = user_id);

-- Weight logs policies
drop policy if exists "Users read own weight_logs" on public.weight_logs;
create policy "Users read own weight_logs" on public.weight_logs
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own weight_logs" on public.weight_logs;
create policy "Users insert own weight_logs" on public.weight_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own weight_logs" on public.weight_logs;
create policy "Users update own weight_logs" on public.weight_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own weight_logs" on public.weight_logs;
create policy "Users delete own weight_logs" on public.weight_logs
  for delete using (auth.uid() = user_id);

-- Burn plans policies
drop policy if exists "Users read own burn_plans" on public.burn_plans;
create policy "Users read own burn_plans" on public.burn_plans
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own burn_plans" on public.burn_plans;
create policy "Users insert own burn_plans" on public.burn_plans
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own burn_plans" on public.burn_plans;
create policy "Users update own burn_plans" on public.burn_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own burn_plans" on public.burn_plans;
create policy "Users delete own burn_plans" on public.burn_plans
  for delete using (auth.uid() = user_id);

-- ── 3. AUTH TRIGGER & RPC FUNCTIONS ──────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
  for each row execute function public.handle_new_user();

-- Self-serve account deletion RPC
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ── 4. VIEWS ─────────────────────────────────────────────────────────────────

create or replace view public.daily_summary
with (security_invoker = true) as
select
  coalesce(f.user_id, e.user_id, w.user_id) as user_id,
  coalesce(f.logged_on, e.logged_on, w.logged_on) as date,
  coalesce(f.total_intake_kcal, 0) as total_intake_kcal,
  coalesce(f.total_protein_g, 0) as total_protein_g,
  coalesce(f.total_carbs_g, 0) as total_carbs_g,
  coalesce(f.total_fat_g, 0) as total_fat_g,
  coalesce(e.total_burned_kcal, 0) as total_burned_kcal,
  coalesce(e.total_exercise_min, 0) as total_exercise_min,
  w.weight_kg as recorded_weight_kg
from (
  select
    user_id,
    logged_on,
    sum(calories) as total_intake_kcal,
    sum(protein_g) as total_protein_g,
    sum(carbs_g) as total_carbs_g,
    sum(fat_g) as total_fat_g
  from public.food_logs
  group by user_id, logged_on
) f
full outer join (
  select
    user_id,
    logged_on,
    sum(calories_burned) as total_burned_kcal,
    sum(duration_min) as total_exercise_min
  from public.exercise_logs
  group by user_id, logged_on
) e on f.user_id = e.user_id and f.logged_on = e.logged_on
full outer join public.weight_logs w
  on coalesce(f.user_id, e.user_id) = w.user_id
  and coalesce(f.logged_on, e.logged_on) = w.logged_on;

-- ── 5. SEED DATA (EXERCISES & GLOBAL FOODS) ──────────────────────────────────

insert into public.exercises (name, category, met, intensity, equipment_needed) values
  ('Walking (5 km/h)',        'cardio',      3.5, 'low',      false),
  ('Brisk Walking (6.5 km/h)','cardio',      5.0, 'moderate', false),
  ('Cycling (moderate)',      'cardio',      8.0, 'moderate', true),
  ('Running (8 km/h)',        'cardio',      8.3, 'high',     false),
  ('Running (10 km/h)',       'cardio',      9.8, 'high',     false),
  ('Swimming (moderate)',     'cardio',      6.0, 'moderate', false),
  ('Skipping / Jump Rope',    'cardio',     11.0, 'high',     true),
  ('Yoga',                    'flexibility', 2.5, 'low',      false),
  ('Weight Training',         'strength',    5.0, 'moderate', true),
  ('HIIT',                    'cardio',      8.0, 'high',     false),
  ('Stair Climbing',          'cardio',      8.8, 'high',     false),
  ('Badminton',               'sports',      5.5, 'moderate', true),
  ('Dancing',                 'cardio',      5.0, 'moderate', false),
  ('Zumba',                   'cardio',      6.0, 'moderate', false),
  ('Elliptical (moderate)',   'cardio',      5.0, 'moderate', true),
  ('Rowing (moderate)',       'cardio',      7.0, 'moderate', true),
  ('Rock Climbing',           'strength',    8.0, 'high',     true),
  ('Basketball',              'sports',      6.5, 'moderate', false),
  ('Football / Soccer',       'sports',      7.0, 'high',     false),
  ('Cricket',                 'sports',      5.0, 'moderate', false),
  ('Pilates',                 'flexibility', 3.0, 'low',      false),
  ('Stretching',              'flexibility', 2.3, 'low',      false),
  ('Hiking',                  'cardio',      5.3, 'moderate', false),
  ('Gardening',               'other',       3.5, 'low',      false)
on conflict (name) do nothing;

insert into public.foods (user_id, name, brand, serving_desc, serving_grams,
  calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, source) values
  (null, 'Roti / Chapati (whole wheat)',  null, '1 medium (40g)', 40,  264, 8.5, 52.0, 3.7, 4.5, 'custom'),
  (null, 'White Rice (cooked)',           null, '1 cup (186g)',   100, 130, 2.7, 28.2, 0.3, 0.4, 'custom'),
  (null, 'Brown Rice (cooked)',           null, '1 cup (195g)',   100, 111, 2.6, 23.0, 0.9, 1.8, 'custom'),
  (null, 'Paratha (plain)',               null, '1 medium (60g)', 60,  326, 7.2, 47.0,12.5, 3.0, 'custom'),
  (null, 'Naan',                          null, '1 piece (90g)',  90,  262, 8.7, 45.0, 5.0, 1.8, 'custom'),
  (null, 'Poha (cooked)',                 null, '1 cup (180g)',   100, 110, 2.5, 23.0, 1.5, 1.2, 'custom'),
  (null, 'Idli',                          null, '2 pieces (80g)', 80,   58, 2.0, 12.0, 0.1, 0.5, 'custom'),
  (null, 'Dosa (plain)',                  null, '1 large (86g)',  86,  168, 3.9, 24.0, 6.4, 0.9, 'custom'),
  (null, 'Upma',                          null, '1 cup (200g)',   100, 131, 3.1, 21.0, 4.2, 1.5, 'custom'),
  (null, 'Dal Tadka (cooked)',            null, '1 cup (240g)',   100,  90, 5.4, 11.0, 3.0, 3.2, 'custom'),
  (null, 'Dal Makhani',                   null, '1 cup (240g)',   100, 130, 5.6, 13.5, 6.5, 3.4, 'custom'),
  (null, 'Chana Dal (cooked)',            null, '1 cup (200g)',   100, 164, 9.5, 27.2, 2.2, 7.6, 'custom'),
  (null, 'Rajma (cooked)',                null, '1 cup (200g)',   100, 127, 8.7, 22.8, 0.5, 6.4, 'custom'),
  (null, 'Chole / Chickpea curry',        null, '1 cup (240g)',   100, 164, 8.9, 27.4, 2.6, 7.6, 'custom'),
  (null, 'Aloo Sabzi (potato curry)',     null, '1 cup (200g)',   100, 100, 2.0, 20.0, 2.0, 2.5, 'custom'),
  (null, 'Palak Paneer',                  null, '1 cup (240g)',   100, 178,10.2, 10.5,11.0, 3.0, 'custom'),
  (null, 'Paneer (cottage cheese)',       null, '1 cube (30g)',   100, 265,18.3,  1.2,20.8, 0.0, 'custom'),
  (null, 'Mixed Vegetable Sabzi',         null, '1 cup (200g)',   100,  78, 2.8, 12.0, 2.0, 3.5, 'custom'),
  (null, 'Vada Pav',                      null, '1 piece (150g)',100, 250, 6.0, 38.0, 8.5, 2.5, 'custom'),
  (null, 'Samosa (potato)',               null, '1 piece (65g)', 65,  308, 5.2, 34.0,17.0, 2.8, 'custom'),
  (null, 'Pav Bhaji',                     null, '1 plate (350g)',100, 130, 3.8, 20.0, 4.2, 3.0, 'custom'),
  (null, 'Bhel Puri',                     null, '1 cup (150g)',  100, 200, 4.5, 35.0, 5.5, 2.0, 'custom'),
  (null, 'Pani Puri (6 pieces)',          null, '6 pieces (120g)',100,178, 3.5, 30.5, 5.2, 1.8, 'custom'),
  (null, 'Masala Chai (with milk+sugar)', null, '1 cup (200ml)', 100,  32, 1.2,  5.0, 1.0, 0.0, 'custom'),
  (null, 'Egg (whole, boiled)',           null, '1 large (50g)', 50,  155,12.6,  1.1,10.6, 0.0, 'custom'),
  (null, 'Chicken Breast (grilled)',      null, '100g',          100, 165,31.0,  0.0, 3.6, 0.0, 'custom'),
  (null, 'Salmon (baked)',                null, '100g',          100, 208,20.0,  0.0,13.0, 0.0, 'custom'),
  (null, 'Tofu (firm)',                   null, '100g',          100,  76, 8.0,  1.9, 4.8, 0.3, 'custom'),
  (null, 'Full Fat Milk',                 null, '1 cup (240ml)', 100,  61, 3.2,  4.8, 3.3, 0.0, 'custom'),
  (null, 'Dahi / Curd (full fat)',        null, '1 cup (245g)',  100,  63, 3.8,  4.7, 3.3, 0.0, 'custom'),
  (null, 'Buttermilk (lassi, salted)',    null, '1 cup (240ml)', 100,  40, 3.3,  4.8, 1.0, 0.0, 'custom'),
  (null, 'Banana',                        null, '1 medium (118g)',100,  89, 1.1, 22.8, 0.3, 2.6, 'custom'),
  (null, 'Apple',                         null, '1 medium (182g)',100,  52, 0.3, 13.8, 0.2, 2.4, 'custom'),
  (null, 'Mango',                         null, '1 cup sliced (165g)',100,60,0.8,15.0, 0.4, 1.6, 'custom'),
  (null, 'Orange',                        null, '1 medium (130g)',100,  47, 0.9, 11.8, 0.1, 2.4, 'custom'),
  (null, 'Coconut Water',                 null, '1 cup (240ml)', 100,  19, 0.7,  3.7, 0.2, 1.1, 'custom'),
  (null, 'Orange Juice (fresh)',          null, '1 cup (248ml)', 100,  45, 0.7, 10.4, 0.2, 0.2, 'custom'),
  (null, 'Gulab Jamun',                   null, '1 piece (40g)', 40,  380, 4.5, 60.0,14.0, 0.5, 'custom'),
  (null, 'Kheer (rice pudding)',          null, '1 cup (200g)',  100, 170, 4.5, 25.0, 5.5, 0.2, 'custom'),
  (null, 'Jalebi',                        null, '1 piece (35g)', 35,  400, 1.5, 68.0,15.0, 0.3, 'custom'),
  (null, 'Oats (cooked)',                 null, '1 cup (234g)',  100,  71, 2.5, 12.0, 1.5, 1.7, 'custom'),
  (null, 'Whole Wheat Bread',             null, '1 slice (30g)', 30,  265,11.6, 47.5, 3.9, 6.8, 'custom'),
  (null, 'Peanut Butter',                 null, '2 tbsp (32g)',  100, 588,25.1, 20.1,50.4, 6.0, 'custom'),
  (null, 'Almonds',                       null, '1 handful (28g)',100,576,21.2, 21.5,49.9,12.5, 'custom'),
  (null, 'Greek Yogurt (plain, low-fat)', null, '1 cup (245g)',  100,  59,10.2,  3.6, 0.4, 0.0, 'custom'),
  (null, 'Pasta (cooked)',                null, '1 cup (140g)',  100, 158, 5.8, 31.0, 0.9, 1.8, 'custom'),
  (null, 'Pizza Margherita',             null, '1 slice (107g)',100, 266,11.4, 32.7,10.4, 2.3, 'custom'),
  (null, 'Burger (veg)',                  null, '1 piece (150g)',100, 230, 6.0, 30.0, 9.0, 2.5, 'custom'),
  (null, 'Fried Rice (veg)',             null, '1 cup (200g)',  100, 163, 3.0, 30.0, 3.8, 1.5, 'custom')
on conflict (lower(name)) where user_id is null do nothing;

-- ── 6. IDEMPOTENT CONSTRAINTS & SANITY CHECKS ────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_weight_kg_check') then
    alter table public.profiles add constraint profiles_weight_kg_check
      check (weight_kg is null or (weight_kg >= 20.0 and weight_kg <= 500.0));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_height_cm_check') then
    alter table public.profiles add constraint profiles_height_cm_check
      check (height_cm is null or (height_cm >= 50.0 and height_cm <= 260.0));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_daily_calorie_goal_check') then
    alter table public.profiles add constraint profiles_daily_calorie_goal_check
      check (daily_calorie_goal is null or (daily_calorie_goal >= 500 and daily_calorie_goal <= 10000));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_calories_per_100g_check') then
    alter table public.foods add constraint foods_calories_per_100g_check
      check (calories_per_100g >= 0 and calories_per_100g <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_serving_grams_check') then
    alter table public.foods add constraint foods_serving_grams_check
      check (serving_grams is null or (serving_grams > 0 and serving_grams <= 5000));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_macros_check') then
    alter table public.foods add constraint foods_macros_check
      check (
        (protein_g is null or (protein_g >= 0 and protein_g <= 100)) and
        (carbs_g is null or (carbs_g >= 0 and carbs_g <= 100)) and
        (fat_g is null or (fat_g >= 0 and fat_g <= 100)) and
        (fiber_g is null or (fiber_g >= 0 and fiber_g <= 100))
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_quantity_grams_check') then
    alter table public.food_logs add constraint food_logs_quantity_grams_check
      check (quantity_grams > 0 and quantity_grams <= 5000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_calories_check') then
    alter table public.food_logs add constraint food_logs_calories_check
      check (calories >= 0 and calories <= 20000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_macros_check') then
    alter table public.food_logs add constraint food_logs_macros_check
      check (
        (protein_g is null or protein_g >= 0) and
        (carbs_g is null or carbs_g >= 0) and
        (fat_g is null or fat_g >= 0)
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercises_met_check') then
    alter table public.exercises add constraint exercises_met_check
      check (met > 0 and met <= 30.0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercise_logs_duration_min_check') then
    alter table public.exercise_logs add constraint exercise_logs_duration_min_check
      check (duration_min > 0 and duration_min <= 600);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercise_logs_calories_burned_check') then
    alter table public.exercise_logs add constraint exercise_logs_calories_burned_check
      check (calories_burned >= 0 and calories_burned <= 15000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'weight_logs_weight_kg_check') then
    alter table public.weight_logs add constraint weight_logs_weight_kg_check
      check (weight_kg >= 20.0 and weight_kg <= 500.0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'burn_plans_calories_check') then
    alter table public.burn_plans add constraint burn_plans_calories_check
      check (calories_to_burn > 0 and calories_to_burn <= 50000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'burn_plans_days_check') then
    alter table public.burn_plans add constraint burn_plans_days_check
      check (days >= 1 and days <= 90);
  end if;
end $$;
-- ── 005_delete_account.sql ───────────────────────────────────────────────────

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ── 006_idempotency.sql ──────────────────────────────────────────────────────

do $$
begin
  -- Repoint any food_logs referencing duplicate global foods to the lowest ID
  with duplicates as (
    select id,
           min(id) over (partition by lower(name)) as canonical_id
    from public.foods
    where user_id is null
  )
  update public.food_logs fl
  set food_id = d.canonical_id
  from duplicates d
  where fl.food_id = d.id
    and d.id <> d.canonical_id;

  -- Delete duplicate global food rows
  with duplicates as (
    select id,
           min(id) over (partition by lower(name)) as canonical_id
    from public.foods
    where user_id is null
  )
  delete from public.foods
  where id in (
    select id from duplicates where id <> canonical_id
  );
end $$;

-- Partial unique index on global foods
create unique index if not exists foods_global_name_uniq
  on public.foods (lower(name))
  where user_id is null;

-- Guarded unique constraint on exercises
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.exercises'::regclass
      and contype = 'u'
  ) then
    alter table public.exercises add constraint exercises_name_uniq unique (name);
  end if;
end $$;

-- Idempotent check constraints
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_weight_kg_check') then
    alter table public.profiles add constraint profiles_weight_kg_check
      check (weight_kg is null or (weight_kg >= 20.0 and weight_kg <= 500.0));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_height_cm_check') then
    alter table public.profiles add constraint profiles_height_cm_check
      check (height_cm is null or (height_cm >= 50.0 and height_cm <= 260.0));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_daily_calorie_goal_check') then
    alter table public.profiles add constraint profiles_daily_calorie_goal_check
      check (daily_calorie_goal is null or (daily_calorie_goal >= 500 and daily_calorie_goal <= 10000));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_calories_per_100g_check') then
    alter table public.foods add constraint foods_calories_per_100g_check
      check (calories_per_100g >= 0 and calories_per_100g <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_serving_grams_check') then
    alter table public.foods add constraint foods_serving_grams_check
      check (serving_grams is null or (serving_grams > 0 and serving_grams <= 5000));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_macros_check') then
    alter table public.foods add constraint foods_macros_check
      check (
        (protein_g is null or (protein_g >= 0 and protein_g <= 100)) and
        (carbs_g is null or (carbs_g >= 0 and carbs_g <= 100)) and
        (fat_g is null or (fat_g >= 0 and fat_g <= 100)) and
        (fiber_g is null or (fiber_g >= 0 and fiber_g <= 100))
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_quantity_grams_check') then
    alter table public.food_logs add constraint food_logs_quantity_grams_check
      check (quantity_grams > 0 and quantity_grams <= 5000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_calories_check') then
    alter table public.food_logs add constraint food_logs_calories_check
      check (calories >= 0 and calories <= 20000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_macros_check') then
    alter table public.food_logs add constraint food_logs_macros_check
      check (
        (protein_g is null or protein_g >= 0) and
        (carbs_g is null or carbs_g >= 0) and
        (fat_g is null or fat_g >= 0)
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercises_met_check') then
    alter table public.exercises add constraint exercises_met_check
      check (met > 0 and met <= 30.0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercise_logs_duration_min_check') then
    alter table public.exercise_logs add constraint exercise_logs_duration_min_check
      check (duration_min > 0 and duration_min <= 600);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercise_logs_calories_burned_check') then
    alter table public.exercise_logs add constraint exercise_logs_calories_burned_check
      check (calories_burned >= 0 and calories_burned <= 15000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'weight_logs_weight_kg_check') then
    alter table public.weight_logs add constraint weight_logs_weight_kg_check
      check (weight_kg >= 20.0 and weight_kg <= 500.0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'burn_plans_calories_check') then
    alter table public.burn_plans add constraint burn_plans_calories_check
      check (calories_to_burn > 0 and calories_to_burn <= 50000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'burn_plans_days_check') then
    alter table public.burn_plans add constraint burn_plans_days_check
      check (days >= 1 and days <= 90);
  end if;
end $$;

-- ── 007_food_fk_cascade_policies.sql ─────────────────────────────────────────

-- 1. Alter food_logs.food_id FK to ON DELETE SET NULL
alter table if exists public.food_logs
  drop constraint if exists food_logs_food_id_fkey;

alter table public.food_logs
  add constraint food_logs_food_id_fkey
  foreign key (food_id) references public.foods(id) on delete set null;

-- 2. Alter exercise_logs.exercise_id FK to ON DELETE SET NULL
alter table if exists public.exercise_logs
  drop constraint if exists exercise_logs_exercise_id_fkey;

alter table public.exercise_logs
  add constraint exercise_logs_exercise_id_fkey
  foreign key (exercise_id) references public.exercises(id) on delete set null;

-- 3. Update food_logs RLS policy to enforce referenced foods exist and are visible
drop policy if exists "own food logs" on public.food_logs;
create policy "own food logs" on public.food_logs
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (food_id is null or exists (select 1 from public.foods f where f.id = food_id))
  );

-- 4. Update exercise_logs RLS policy similarly
drop policy if exists "own exercise logs" on public.exercise_logs;
create policy "own exercise logs" on public.exercise_logs
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (exercise_id is null or exists (select 1 from public.exercises e where e.id = exercise_id))
  );

-- ── 008_calorie_floor_and_minors.sql ─────────────────────────────────────────

-- 1. Check constraint on daily_calorie_goal floor (1200 female / 1500 male and other)
alter table if exists public.profiles
  drop constraint if exists check_calorie_goal_floor;

alter table public.profiles
  add constraint check_calorie_goal_floor check (
    daily_calorie_goal is null or (
      case
        when gender = 'female' then daily_calorie_goal >= 1200
        else daily_calorie_goal >= 1500
      end
    )
  );

-- 2. Trigger function to enforce age >= 18 on date_of_birth
create or replace function public.enforce_profile_adult_age()
returns trigger language plpgsql as $$
begin
  if new.date_of_birth is not null and new.date_of_birth > (current_date - interval '18 years') then
    raise exception 'FitCalc is designed for adults (18+) only. Date of birth must reflect age 18 or older.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_adult_age_trigger on public.profiles;
create trigger enforce_profile_adult_age_trigger
  before insert or update of date_of_birth on public.profiles
  for each row
  execute function public.enforce_profile_adult_age();


-- ── 009_replace_log_policies.sql ─────────────────────────────────────────────

begin;

-- Drop every existing policy on public.food_logs and public.exercise_logs
do $$
declare
  r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('food_logs', 'exercise_logs')
  ) loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Single unified policy for public.food_logs
create policy "food_logs_authenticated_owner" on public.food_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (food_id is null or exists (select 1 from public.foods f where f.id = food_id))
  );

-- Single unified policy for public.exercise_logs
create policy "exercise_logs_authenticated_owner" on public.exercise_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (exercise_id is null or exists (select 1 from public.exercises e where e.id = exercise_id))
  );

-- Ensure RLS is enabled on both tables
alter table public.food_logs enable row level security;
alter table public.exercise_logs enable row level security;

commit;


-- ── 010_harden_age_trigger.sql ───────────────────────────────────────────────

-- Note: This trigger functions as a self-declared age gate at the database level,
-- relying on user-provided date of birth rather than verified identity documents.
create or replace function public.enforce_profile_adult_age()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.date_of_birth is not null and pg_catalog.age(pg_catalog.current_date, new.date_of_birth) < pg_catalog.interval '18 years' then
    raise exception 'FitCalc is designed for adults (18+) only. Date of birth must reflect age 18 or older.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_adult_age_trigger on public.profiles;
create trigger enforce_profile_adult_age_trigger
  before insert or update of date_of_birth on public.profiles
  for each row
  when (new.date_of_birth is not null)
  execute function public.enforce_profile_adult_age();
