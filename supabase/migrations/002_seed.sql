-- =============================================================
-- 002_seed.sql  –  Exercises & common Indian/global foods
-- =============================================================

-- ── Exercises (MET values from Compendium of Physical Activities) ──
insert into exercises (name, category, met, intensity, equipment_needed) values
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

-- ── Common Indian & global foods (null user_id = global) ──────
insert into foods (user_id, name, brand, serving_desc, serving_grams,
  calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, source) values
  -- Staples
  (null, 'Roti / Chapati (whole wheat)',  null, '1 medium (40g)', 40,  264, 8.5, 52.0, 3.7, 4.5, 'custom'),
  (null, 'White Rice (cooked)',           null, '1 cup (186g)',   100, 130, 2.7, 28.2, 0.3, 0.4, 'custom'),
  (null, 'Brown Rice (cooked)',           null, '1 cup (195g)',   100, 111, 2.6, 23.0, 0.9, 1.8, 'custom'),
  (null, 'Paratha (plain)',               null, '1 medium (60g)', 60,  326, 7.2, 47.0,12.5, 3.0, 'custom'),
  (null, 'Naan',                          null, '1 piece (90g)',  90,  262, 8.7, 45.0, 5.0, 1.8, 'custom'),
  (null, 'Poha (cooked)',                 null, '1 cup (180g)',   100, 110, 2.5, 23.0, 1.5, 1.2, 'custom'),
  (null, 'Idli',                          null, '2 pieces (80g)', 80,   58, 2.0, 12.0, 0.1, 0.5, 'custom'),
  (null, 'Dosa (plain)',                  null, '1 large (86g)',  86,  168, 3.9, 24.0, 6.4, 0.9, 'custom'),
  (null, 'Upma',                          null, '1 cup (200g)',   100, 131, 3.1, 21.0, 4.2, 1.5, 'custom'),
  -- Dals & Lentils
  (null, 'Dal Tadka (cooked)',            null, '1 cup (240g)',   100,  90, 5.4, 11.0, 3.0, 3.2, 'custom'),
  (null, 'Dal Makhani',                   null, '1 cup (240g)',   100, 130, 5.6, 13.5, 6.5, 3.4, 'custom'),
  (null, 'Chana Dal (cooked)',            null, '1 cup (200g)',   100, 164, 9.5, 27.2, 2.2, 7.6, 'custom'),
  (null, 'Rajma (cooked)',                null, '1 cup (200g)',   100, 127, 8.7, 22.8, 0.5, 6.4, 'custom'),
  (null, 'Chole / Chickpea curry',        null, '1 cup (240g)',   100, 164, 8.9, 27.4, 2.6, 7.6, 'custom'),
  -- Vegetables
  (null, 'Aloo Sabzi (potato curry)',     null, '1 cup (200g)',   100, 100, 2.0, 20.0, 2.0, 2.5, 'custom'),
  (null, 'Palak Paneer',                  null, '1 cup (240g)',   100, 178,10.2, 10.5,11.0, 3.0, 'custom'),
  (null, 'Paneer (cottage cheese)',       null, '1 cube (30g)',   100, 265,18.3,  1.2,20.8, 0.0, 'custom'),
  (null, 'Mixed Vegetable Sabzi',         null, '1 cup (200g)',   100,  78, 2.8, 12.0, 2.0, 3.5, 'custom'),
  -- Street Food & Snacks
  (null, 'Vada Pav',                      null, '1 piece (150g)',100, 250, 6.0, 38.0, 8.5, 2.5, 'custom'),
  (null, 'Samosa (potato)',               null, '1 piece (65g)', 65,  308, 5.2, 34.0,17.0, 2.8, 'custom'),
  (null, 'Pav Bhaji',                     null, '1 plate (350g)',100, 130, 3.8, 20.0, 4.2, 3.0, 'custom'),
  (null, 'Bhel Puri',                     null, '1 cup (150g)',  100, 200, 4.5, 35.0, 5.5, 2.0, 'custom'),
  (null, 'Pani Puri (6 pieces)',          null, '6 pieces (120g)',100,178, 3.5, 30.5, 5.2, 1.8, 'custom'),
  (null, 'Masala Chai (with milk+sugar)', null, '1 cup (200ml)', 100,  32, 1.2,  5.0, 1.0, 0.0, 'custom'),
  -- Proteins
  (null, 'Egg (whole, boiled)',           null, '1 large (50g)', 50,  155,12.6,  1.1,10.6, 0.0, 'custom'),
  (null, 'Chicken Breast (grilled)',      null, '100g',          100, 165,31.0,  0.0, 3.6, 0.0, 'custom'),
  (null, 'Salmon (baked)',                null, '100g',          100, 208,20.0,  0.0,13.0, 0.0, 'custom'),
  (null, 'Tofu (firm)',                   null, '100g',          100,  76, 8.0,  1.9, 4.8, 0.3, 'custom'),
  -- Dairy
  (null, 'Full Fat Milk',                 null, '1 cup (240ml)', 100,  61, 3.2,  4.8, 3.3, 0.0, 'custom'),
  (null, 'Dahi / Curd (full fat)',        null, '1 cup (245g)',  100,  63, 3.8,  4.7, 3.3, 0.0, 'custom'),
  (null, 'Buttermilk (lassi, salted)',    null, '1 cup (240ml)', 100,  40, 3.3,  4.8, 1.0, 0.0, 'custom'),
  -- Fruits
  (null, 'Banana',                        null, '1 medium (118g)',100,  89, 1.1, 22.8, 0.3, 2.6, 'custom'),
  (null, 'Apple',                         null, '1 medium (182g)',100,  52, 0.3, 13.8, 0.2, 2.4, 'custom'),
  (null, 'Mango',                         null, '1 cup sliced (165g)',100,60,0.8,15.0, 0.4, 1.6, 'custom'),
  (null, 'Orange',                        null, '1 medium (130g)',100,  47, 0.9, 11.8, 0.1, 2.4, 'custom'),
  -- Beverages
  (null, 'Coconut Water',                 null, '1 cup (240ml)', 100,  19, 0.7,  3.7, 0.2, 1.1, 'custom'),
  (null, 'Orange Juice (fresh)',          null, '1 cup (248ml)', 100,  45, 0.7, 10.4, 0.2, 0.2, 'custom'),
  -- Sweets
  (null, 'Gulab Jamun',                   null, '1 piece (40g)', 40,  380, 4.5, 60.0,14.0, 0.5, 'custom'),
  (null, 'Kheer (rice pudding)',          null, '1 cup (200g)',  100, 170, 4.5, 25.0, 5.5, 0.2, 'custom'),
  (null, 'Jalebi',                        null, '1 piece (35g)', 35,  400, 1.5, 68.0,15.0, 0.3, 'custom'),
  -- International staples
  (null, 'Oats (cooked)',                 null, '1 cup (234g)',  100,  71, 2.5, 12.0, 1.5, 1.7, 'custom'),
  (null, 'Whole Wheat Bread',             null, '1 slice (30g)', 30,  265,11.6, 47.5, 3.9, 6.8, 'custom'),
  (null, 'Peanut Butter',                 null, '2 tbsp (32g)',  100, 588,25.1, 20.1,50.4, 6.0, 'custom'),
  (null, 'Almonds',                       null, '1 handful (28g)',100,576,21.2, 21.5,49.9,12.5, 'custom'),
  (null, 'Greek Yogurt (plain, low-fat)', null, '1 cup (245g)',  100,  59,10.2,  3.6, 0.4, 0.0, 'custom'),
  (null, 'Pasta (cooked)',                null, '1 cup (140g)',  100, 158, 5.8, 31.0, 0.9, 1.8, 'custom'),
  (null, 'Pizza Margherita',             null, '1 slice (107g)',100, 266,11.4, 32.7,10.4, 2.3, 'custom'),
  (null, 'Burger (veg)',                  null, '1 piece (150g)',100, 230, 6.0, 30.0, 9.0, 2.5, 'custom'),
  (null, 'Fried Rice (veg)',             null, '1 cup (200g)',  100, 163, 3.0, 30.0, 3.8, 1.5, 'custom')
on conflict do nothing;
