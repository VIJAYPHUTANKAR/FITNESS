# Seed Data Reconciliation

This document lists the exact contents of `supabase/migrations/002_seed.sql` parsed by an automated script (`scratch/parse_seed.js`).

## 1. Discrepancy Analysis

- **Exercise Count**: Exactly **24** exercises exist in `002_seed.sql`.
  - In a previous audit report, a synthetic list was displayed that included fabricated names (such as "Walking stroll", "Power walking", "Running 12 km/h", "Hatha Yoga", "Vinyasa Yoga") and omitted the real seeded sports/activities (**Badminton, Football / Soccer, Cricket, Pilates, Stair Climbing, Dancing, Zumba, Elliptical, Rowing, Rock Climbing, Basketball, Stretching, Hiking, Gardening**).
  - The actual list below reflects the true contents of `supabase/migrations/002_seed.sql`.
- **Food Count**: Exactly **49** global foods exist in `002_seed.sql` (earlier prompt text cited 45; actual SQL inserts 49 rows).

---

## 2. Seeded Exercises

| # | Exercise Name | Category | Intensity | Equipment Needed | MET | MET verified against source? (yes/unverified) |
|---|---|---|---|---|---|---|
| 1 | Walking (5 km/h) | cardio | low | false | 3.5 | unverified |
| 2 | Brisk Walking (6.5 km/h) | cardio | moderate | false | 5.0 | unverified |
| 3 | Cycling (moderate) | cardio | moderate | true | 8.0 | unverified |
| 4 | Running (8 km/h) | cardio | high | false | 8.3 | unverified |
| 5 | Running (10 km/h) | cardio | high | false | 9.8 | unverified |
| 6 | Swimming (moderate) | cardio | moderate | false | 6.0 | unverified |
| 7 | Skipping / Jump Rope | cardio | high | true | 11.0 | unverified |
| 8 | Yoga | flexibility | low | false | 2.5 | unverified |
| 9 | Weight Training | strength | moderate | true | 5.0 | unverified |
| 10 | HIIT | cardio | high | false | 8.0 | unverified |
| 11 | Stair Climbing | cardio | high | false | 8.8 | unverified |
| 12 | Badminton | sports | moderate | true | 5.5 | unverified |
| 13 | Dancing | cardio | moderate | false | 5.0 | unverified |
| 14 | Zumba | cardio | moderate | false | 6.0 | unverified |
| 15 | Elliptical (moderate) | cardio | moderate | true | 5.0 | unverified |
| 16 | Rowing (moderate) | cardio | moderate | true | 7.0 | unverified |
| 17 | Rock Climbing | strength | high | true | 8.0 | unverified |
| 18 | Basketball | sports | moderate | false | 6.5 | unverified |
| 19 | Football / Soccer | sports | high | false | 7.0 | unverified |
| 20 | Cricket | sports | moderate | false | 5.0 | unverified |
| 21 | Pilates | flexibility | low | false | 3.0 | unverified |
| 22 | Stretching | flexibility | low | false | 2.3 | unverified |
| 23 | Hiking | cardio | moderate | false | 5.3 | unverified |
| 24 | Gardening | other | low | false | 3.5 | unverified |

---

## 3. Seeded Foods (49 total)

| # | Food Name | Serving Desc | Serving Grams | kcal/100g | Protein (g) | Carbs (g) | Fat (g) | Fiber (g) |
|---|---|---|---|---|---|---|---|---|
| 1 | Roti / Chapati (whole wheat) | 1 medium (40g) | 40 | 264 | 8.5 | 52.0 | 3.7 | 4.5 |
| 2 | White Rice (cooked) | 1 cup (186g) | 100 | 130 | 2.7 | 28.2 | 0.3 | 0.4 |
| 3 | Brown Rice (cooked) | 1 cup (195g) | 100 | 111 | 2.6 | 23.0 | 0.9 | 1.8 |
| 4 | Paratha (plain) | 1 medium (60g) | 60 | 326 | 7.2 | 47.0 | 12.5 | 3.0 |
| 5 | Naan | 1 piece (90g) | 90 | 262 | 8.7 | 45.0 | 5.0 | 1.8 |
| 6 | Poha (cooked) | 1 cup (180g) | 100 | 110 | 2.5 | 23.0 | 1.5 | 1.2 |
| 7 | Idli | 2 pieces (80g) | 80 | 58 | 2.0 | 12.0 | 0.1 | 0.5 |
| 8 | Dosa (plain) | 1 large (86g) | 86 | 168 | 3.9 | 24.0 | 6.4 | 0.9 |
| 9 | Upma | 1 cup (200g) | 100 | 131 | 3.1 | 21.0 | 4.2 | 1.5 |
| 10 | Dal Tadka (cooked) | 1 cup (240g) | 100 | 90 | 5.4 | 11.0 | 3.0 | 3.2 |
| 11 | Dal Makhani | 1 cup (240g) | 100 | 130 | 5.6 | 13.5 | 6.5 | 3.4 |
| 12 | Chana Dal (cooked) | 1 cup (200g) | 100 | 164 | 9.5 | 27.2 | 2.2 | 7.6 |
| 13 | Rajma (cooked) | 1 cup (200g) | 100 | 127 | 8.7 | 22.8 | 0.5 | 6.4 |
| 14 | Chole / Chickpea curry | 1 cup (240g) | 100 | 164 | 8.9 | 27.4 | 2.6 | 7.6 |
| 15 | Aloo Sabzi (potato curry) | 1 cup (200g) | 100 | 100 | 2.0 | 20.0 | 2.0 | 2.5 |
| 16 | Palak Paneer | 1 cup (240g) | 100 | 178 | 10.2 | 10.5 | 11.0 | 3.0 |
| 17 | Paneer (cottage cheese) | 1 cube (30g) | 100 | 265 | 18.3 | 1.2 | 20.8 | 0.0 |
| 18 | Mixed Vegetable Sabzi | 1 cup (200g) | 100 | 78 | 2.8 | 12.0 | 2.0 | 3.5 |
| 19 | Vada Pav | 1 piece (150g) | 100 | 250 | 6.0 | 38.0 | 8.5 | 2.5 |
| 20 | Samosa (potato) | 1 piece (65g) | 65 | 308 | 5.2 | 34.0 | 17.0 | 2.8 |
| 21 | Pav Bhaji | 1 plate (350g) | 100 | 130 | 3.8 | 20.0 | 4.2 | 3.0 |
| 22 | Bhel Puri | 1 cup (150g) | 100 | 200 | 4.5 | 35.0 | 5.5 | 2.0 |
| 23 | Pani Puri (6 pieces) | 6 pieces (120g) | 100 | 178 | 3.5 | 30.5 | 5.2 | 1.8 |
| 24 | Masala Chai (with milk+sugar) | 1 cup (200ml) | 100 | 32 | 1.2 | 5.0 | 1.0 | 0.0 |
| 25 | Egg (whole, boiled) | 1 large (50g) | 50 | 155 | 12.6 | 1.1 | 10.6 | 0.0 |
| 26 | Chicken Breast (grilled) | 100g | 100 | 165 | 31.0 | 0.0 | 3.6 | 0.0 |
| 27 | Salmon (baked) | 100g | 100 | 208 | 20.0 | 0.0 | 13.0 | 0.0 |
| 28 | Tofu (firm) | 100g | 100 | 76 | 8.0 | 1.9 | 4.8 | 0.3 |
| 29 | Full Fat Milk | 1 cup (240ml) | 100 | 61 | 3.2 | 4.8 | 3.3 | 0.0 |
| 30 | Dahi / Curd (full fat) | 1 cup (245g) | 100 | 63 | 3.8 | 4.7 | 3.3 | 0.0 |
| 31 | Buttermilk (lassi, salted) | 1 cup (240ml) | 100 | 40 | 3.3 | 4.8 | 1.0 | 0.0 |
| 32 | Banana | 1 medium (118g) | 100 | 89 | 1.1 | 22.8 | 0.3 | 2.6 |
| 33 | Apple | 1 medium (182g) | 100 | 52 | 0.3 | 13.8 | 0.2 | 2.4 |
| 34 | Mango | 1 cup sliced (165g) | 100 | 60 | 0.8 | 15.0 | 0.4 | 1.6 |
| 35 | Orange | 1 medium (130g) | 100 | 47 | 0.9 | 11.8 | 0.1 | 2.4 |
| 36 | Coconut Water | 1 cup (240ml) | 100 | 19 | 0.7 | 3.7 | 0.2 | 1.1 |
| 37 | Orange Juice (fresh) | 1 cup (248ml) | 100 | 45 | 0.7 | 10.4 | 0.2 | 0.2 |
| 38 | Gulab Jamun | 1 piece (40g) | 40 | 380 | 4.5 | 60.0 | 14.0 | 0.5 |
| 39 | Kheer (rice pudding) | 1 cup (200g) | 100 | 170 | 4.5 | 25.0 | 5.5 | 0.2 |
| 40 | Jalebi | 1 piece (35g) | 35 | 400 | 1.5 | 68.0 | 15.0 | 0.3 |
| 41 | Oats (cooked) | 1 cup (234g) | 100 | 71 | 2.5 | 12.0 | 1.5 | 1.7 |
| 42 | Whole Wheat Bread | 1 slice (30g) | 30 | 265 | 11.6 | 47.5 | 3.9 | 6.8 |
| 43 | Peanut Butter | 2 tbsp (32g) | 100 | 588 | 25.1 | 20.1 | 50.4 | 6.0 |
| 44 | Almonds | 1 handful (28g) | 100 | 576 | 21.2 | 21.5 | 49.9 | 12.5 |
| 45 | Greek Yogurt (plain, low-fat) | 1 cup (245g) | 100 | 59 | 10.2 | 3.6 | 0.4 | 0.0 |
| 46 | Pasta (cooked) | 1 cup (140g) | 100 | 158 | 5.8 | 31.0 | 0.9 | 1.8 |
| 47 | Pizza Margherita | 1 slice (107g) | 100 | 266 | 11.4 | 32.7 | 10.4 | 2.3 |
| 48 | Burger (veg) | 1 piece (150g) | 100 | 230 | 6.0 | 30.0 | 9.0 | 2.5 |
| 49 | Fried Rice (veg) | 1 cup (200g) | 100 | 163 | 3.0 | 30.0 | 3.8 | 1.5 |
