-- 003_views.sql  –  Useful views with security_invoker

-- Daily summary view per user
create or replace view daily_summary
  with (security_invoker = true)
as
select
  p.id as user_id,
  d.day,
  coalesce(f.cal_in,  0) as calories_in,
  coalesce(e.cal_out, 0) as calories_out,
  p.daily_calorie_goal,
  coalesce(f.protein_g, 0) as protein_g,
  coalesce(f.carbs_g,   0) as carbs_g,
  coalesce(f.fat_g,     0) as fat_g
from profiles p
cross join lateral (
  select logged_on as day from food_logs where user_id = p.id
  union
  select logged_on        from exercise_logs where user_id = p.id
) d
left join lateral (
  select
    sum(calories)  as cal_in,
    sum(protein_g) as protein_g,
    sum(carbs_g)   as carbs_g,
    sum(fat_g)     as fat_g
  from food_logs
  where user_id = p.id and logged_on = d.day
) f on true
left join lateral (
  select sum(calories_burned) as cal_out
  from exercise_logs
  where user_id = p.id and logged_on = d.day
) e on true;

