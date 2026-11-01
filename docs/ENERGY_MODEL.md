# Energy Model Specification

This document details the energy estimation model implemented in FitCalc.

---

## 1. Problem with the Naive Formula

A common trap in fitness applications is calculating calorie differences as:
$$\text{vsMaintenance} = \text{Intake} - \text{TDEE} - \text{Logged Exercise}$$

This formula **double-counts exercise**:
- The standard Total Daily Energy Expenditure (TDEE) multiplier already factors in typical weekly physical activity (e.g. $1.55 \times \text{BMR}$ for moderate activity).
- Subtracting explicitly logged workouts from an already activity-multiplied TDEE credits workout calories twice.
- Furthermore, comparing intake against a **deficit goal** (e.g. $\text{TDEE} - 400$) makes eating at physical maintenance appear as a $+400\text{ kcal}$ "surplus".
- Framing food intake as an exercise debt to "burn off" can reinforce unhealthy compensatory cycles. FitCalc decouples intake tracking from exercise calculations.

---

## 2. The Estimated Energy Model

FitCalc separates **behavioral goal tracking** from **estimated net energy**:

```
1. Baseline Maintenance (Sedentary, non-exercise)
   baselineMaintenance = BMR * 1.2

2. Estimated Net Energy Difference
   energyBalance = intake - (baselineMaintenance + loggedExerciseBurned)
```

All calorie and energy numbers are **estimates** and models, not exact measurements.

### Components

1. **Daily Calorie Ring ("vs your goal")**:
   - Compares logged food intake against `daily_calorie_goal`.
   - The daily goal is set during onboarding based on the user's selected objective and activity level.
   - It represents the day's nutritional budget.
2. **Dashboard Banner ("Estimated Net Energy (baseline + logged exercise)")**:
   - Represents estimated energy difference based on estimated baseline and logged activities.
   - Uses `baselineMaintenance` ($BMR \times 1.2$) as the base non-exercise estimate.
   - Adds only the user's explicitly logged workouts as additional expenditure.
   - Does NOT send or prefill values into any activity planner.
3. **Activity Equivalents (Decoupled Tool)**:
   - The Activity Equivalents page estimates the time required for various physical activities to expend a manually chosen calorie amount.
   - It is purely educational and exploratory. It takes only a manually typed calorie value (capped at 2,000 kcal).
   - Plans are capped at a maximum of 1,000 kcal/day and 120 minutes of daily activity to prevent extreme exertion planning.
4. **Missing Profile Data Handling**:
   - If onboarding is incomplete (missing weight, height, or DOB), `getProfileBMR()` returns `0`.
   - `calculateEnergyBalance()` flags `hasProfileMetrics: false`, setting `energyBalance: 0`.
   - The dashboard gracefully presents a setup banner directing the user to `/onboarding`.

---

## 3. Worked Examples

### Scenario A: User Eating at Maintenance
- User BMR = $1,500\text{ kcal}$. Sedentary baseline maintenance = $1,500 \times 1.2 = 1,800\text{ kcal}$.
- Active TDEE = $2,200\text{ kcal}$. Deficit goal = $1,800\text{ kcal}$.
- Intake = $1,800\text{ kcal}$. Logged workout = $0\text{ kcal}$.
- **vs Goal**: $1,800 - 1,800 = 0\text{ kcal}$ on target.
- **Estimated Net Energy**: $1,800 - (1,800 + 0) = 0\text{ kcal}$.

### Scenario B: Intake with Logged Activity
- User baseline maintenance = $1,800\text{ kcal}$.
- Intake = $2,300\text{ kcal}$ ($+500\text{ kcal}$ over baseline).
- Logged Workout = $300\text{ kcal}$ burned (e.g. 45 min cycling).
- **Estimated Net Energy**: $2,300 - (1,800 + 300) = +200\text{ kcal}$.
