# Energy Balance Model Specification

This document details the energy balance and surplus calculation model implemented in FitCalc.

---

## 1. Problem with the Naive Formula

A common trap in fitness applications is calculating surplus as:
$$\text{vsMaintenance} = \text{Intake} - \text{TDEE} - \text{Logged Exercise}$$

This formula **double-counts exercise**:
- The standard Total Daily Energy Expenditure (TDEE) multiplier already factors in typical weekly physical activity (e.g. $1.55 \times \text{BMR}$ for moderate activity).
- Subtracting explicitly logged workouts from an already activity-multiplied TDEE credits workout calories twice.
- Furthermore, comparing intake against a **deficit goal** (e.g. $\text{TDEE} - 400$) makes eating at physical maintenance appear as a $+400\text{ kcal}$ "surplus", prompting users into an unhealthy, unnecessary exercise compensation cycle.

---

## 2. The Consistent Energy Balance Model

FitCalc separates **behavioral goal tracking** from **thermodynamic energy balance**:

```
1. Baseline Maintenance (Sedentary, non-exercise)
   baselineMaintenance = BMR * 1.2

2. Thermodynamic Energy Balance
   energyBalance = intake - (baselineMaintenance + loggedExerciseBurned)

3. Burn Calculator Target
   caloriesToBurn = Math.max(0, energyBalance)
```

### Components

1. **Daily Calorie Ring ("vs your goal")**:
   - Compares logged food intake against `daily_calorie_goal`.
   - The daily goal is set during onboarding based on the user's selected objective (fat loss, maintenance, or muscle gain) and activity level.
   - It represents the day's nutritional budget.
2. **Surplus Banner ("Estimated energy balance (baseline + logged exercise)")**:
   - Represents physical energy surplus or deficit.
   - Uses `baselineMaintenance` ($BMR \times 1.2$) as the base non-exercise burn.
   - Adds only the user's explicitly logged workouts as additional expenditure.
   - Clamped to $\ge 0$ when sent to the **Burn Calculator**.
   - If energy balance is $\le 0$, the user is in an energy deficit or at neutral balance, so no burn target is suggested.
3. **Missing Profile Data Handling**:
   - If onboarding is incomplete (missing weight, height, or DOB), `getProfileBMR()` returns `0`.
   - `calculateEnergyBalance()` flags `hasProfileMetrics: false`, setting `energyBalance: 0` and `caloriesToBurn: 0`.
   - The dashboard gracefully presents a setup banner directing the user to `/onboarding`.

---

## 3. Worked Examples

### Scenario A: Fat-Loss User Eating at Maintenance
- User BMR = $1,500\text{ kcal}$. Sedentary baseline maintenance = $1,500 \times 1.2 = 1,800\text{ kcal}$.
- Active TDEE = $2,200\text{ kcal}$. Deficit goal = $1,800\text{ kcal}$.
- Intake = $1,800\text{ kcal}$. Logged workout = $0\text{ kcal}$.
- **vs Goal**: $1,800 - 1,800 = 0\text{ kcal}$ on target.
- **Energy Balance**: $1,800 - (1,800 + 0) = 0\text{ kcal}$ neutral balance. `caloriesToBurn = 0`.

### Scenario B: Surplus with Workout Compensation
- User baseline maintenance = $1,800\text{ kcal}$.
- Intake = $2,300\text{ kcal}$ ($+500\text{ kcal}$ over baseline).
- Logged Workout = $300\text{ kcal}$ burned (e.g. 45 min cycling).
- **Energy Balance**: $2,300 - (1,800 + 300) = +200\text{ kcal}$ surplus.
- **Burn Calculator Target**: Exactly $200\text{ kcal}$.
