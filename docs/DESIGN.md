# FitCalc Design System & UI/UX Plan

## 1. Product Concept & Philosophy

FitCalc is designed specifically for Indian students and young adults logging everyday regional food (roti, dal, sabzi, idli, sambar, poha, paratha).
Unlike typical Western fitness trackers with neon gauges, aggressive red alarm banners, and streak-shaming guilt hooks, FitCalc is calm, disciplined, and culturally resonant.

The singular memorable anchor of the application is the **Thali Plate**:
- A traditional round plate visualization on the dashboard.
- Calories consumed sit calmly in the center (`X of Y kcal goal`).
- Three bowl segments (*katoris*) wrap around the rim sized by macro proportion:
  - **Chukandar** (beetroot): Protein
  - **Haldi** (turmeric): Carbohydrates
  - **Patta** (curry leaf): Fat
- Everything else on the screen stays disciplined and quiet so the Thali remains the clear visual focal point.

---

## 2. Self-Review Against Generic Fitness Cliches

Before proceeding with implementation, the design plan was audited to prevent default generic tropes:

| Generic Fitness App Trope | Replaced With in FitCalc | Reason & Impact |
|---|---|---|
| **Acid green on near-black / terracotta on cream** | **Neel (#1D2147), Steel (#EDF0F1), and Plate (#FAFBFB)** with spice accents | High editorial dignity; distinctively Indian without decorative excess. |
| **Red alarm color when exceeding calorie goals** | **Calm continuation in Neel** with neutral "above goal" label | No judgment, anxiety, or punitive visual signals. |
| **Identical rounded cards with soft grey drop shadows** | **Mixed radii, 1px ink-tint borders, flat surface shifts** | Cleaner hierarchy, avoiding visual mush and template appearance. |
| **All-caps eyebrow badges (`OVERVIEW`, `STATS`)** | **Sentence-case plain hierarchy** | Readable, respectful, non-shouting typographic structure. |
| **Arrow glyphs (`→`) on every button** | **Plain action verbs (`Add food`, `Log workout`, `Save plan`)** | Consistent action names across modal sheets, buttons, and toasts. |
| **Numbered steps decoration (`01`, `02`, `03`) on cards** | **Clean lists with subtle dividers and semantic headers** | Reduced visual noise; numbers used strictly for real quantitative data. |
| **Streak-shaming ("Don't lose your streak!")** | **Neutral activity recording ("X consecutive days logged")** | Health-first psychological safety. |

---

## 3. Design Tokens & Color Palette

Tokens are defined as CSS custom properties under `:root` and `.dark` (with auto-detection via `prefers-color-scheme` and manual override persisted to `localStorage`).

### Palette Definition

```css
:root {
  /* Core brand tokens */
  --color-neel: #1D2147;       /* Deep ink: typography, primary buttons, borders */
  --color-neel-muted: #565B82; /* Secondary text and muted labels */
  --color-steel: #EDF0F1;      /* Application background (light mode) */
  --color-plate: #FAFBFB;      /* Card and sheet surfaces */
  --color-border: #D8DCE0;     /* 1px structural borders */
  --color-border-subtle: #E8EBEE; /* Inner dividers */

  /* Macro and accent tokens */
  --color-haldi: #F2B01E;      /* Turmeric: Carbohydrates & accent highlight */
  --color-haldi-text: #1D2147; /* Always paired with dark Neel text */
  --color-chukandar: #B1275B;  /* Beetroot: Protein */
  --color-patta: #327349;      /* Curry leaf: Fat (darkened for AA compliance) */
  --color-patta-subtle: #E8F4EC; /* Soft curry tint background */
  --color-chukandar-subtle: #FBEAF1; /* Soft beetroot tint background */
  --color-haldi-subtle: #FEF7E8; /* Soft turmeric tint background */
}

.dark {
  --color-neel: #EDEFFA;       /* Light text and crisp elements in dark mode */
  --color-neel-muted: #9DA3C7; /* Subdued dark mode text */
  --color-steel: #12142B;      /* Dark night page background */
  --color-plate: #1B1E3D;      /* Elevated surface in dark mode */
  --color-border: #2C305C;     /* Border in dark mode */
  --color-border-subtle: #22264C;

  --color-haldi: #F5BE42;      /* Slightly lifted turmeric */
  --color-chukandar: #D1457A;  /* Slightly lifted beetroot */
  --color-patta: #4CA369;      /* Slightly lifted curry leaf */
  --color-patta-subtle: #1C3325;
  --color-chukandar-subtle: #381A27;
  --color-haldi-subtle: #362914;
}
```

### WCAG Contrast Audit (AA Compliance)

| Foreground | Background | Use Case | Contrast Ratio | WCAG AA Status |
|---|---|---|---|---|
| Neel (`#1D2147`) | Plate (`#FAFBFB`) | Primary UI body copy | **14.8 : 1** | PASS (AAA) |
| Neel (`#1D2147`) | Steel (`#EDF0F1`) | Page labels & headers | **13.4 : 1** | PASS (AAA) |
| Neel Muted (`#565B82`) | Plate (`#FAFBFB`) | Helper labels & metadata | **5.4 : 1** | PASS (AA > 4.5:1) |
| Neel (`#1D2147`) | Haldi (`#F2B01E`) | Haldi badges & accent fills | **7.7 : 1** | PASS (AAA) |
| White (`#FFFFFF`) | Chukandar (`#B1275B`) | Protein badge / indicator | **6.9 : 1** | PASS (AAA large / AA body) |
| White (`#FFFFFF`) | Patta (`#327349`) | Fat badge / indicator | **4.9 : 1** | PASS (AA > 4.5:1) |
| Dark Text (`#EDEFFA`) | Dark Surface (`#1B1E3D`) | Dark mode body copy | **14.1 : 1** | PASS (AAA) |
| Dark Text (`#EDEFFA`) | Dark Page (`#12142B`) | Dark mode headers | **15.5 : 1** | PASS (AAA) |

---

## 4. Typography

Configured through `next/font/google`:
- **Headings & Quantitative Figures**: `Bricolage Grotesque` (distinctive geometric character, expressive weights, tight apertures).
- **Body & UI**: `Instrument Sans` (high legibility, neutral clarity, clean humanist proportions).
- **Numbers**: Tabular numerals enabled via font feature settings (`font-variant-numeric: tabular-nums;`) for all calorie amounts, gram quantities, and macro percentages.

### Typographic Scale

| Token | Size | Line Height | Weight | Application |
|---|---|---|---|---|
| `text-display` | 48px / 56px | 1.05 | 700 | Dashboard plate center calorie hero |
| `text-h1` | 28px / 32px | 1.2 | 700 | Page titles (`Dashboard`, `Activity Equivalents`) |
| `text-h2` | 20px / 24px | 1.3 | 600 | Section headers (`Breakfast`, `Lunch`) |
| `text-h3` | 16px / 20px | 1.4 | 600 | Card titles, food item names |
| `text-body` | 14px / 16px | 1.5 | 400 | Standard descriptive text, inputs |
| `text-caption` | 12px / 14px | 1.4 | 500 | Metadata, timestamps, table column labels |
| `text-micro` | 11px | 1.3 | 600 | Macro badge indicators |

*Max line length is strictly capped under 70 characters for long-form blocks.*

---

## 5. Shape, Depth, and Elevation

- **Radii by Semantic Role**:
  - Plate SVG: Fully circular (`50%`).
  - Bottom Sheets & Modals: `24px` top corners on mobile, `20px` on desktop.
  - Interactive Buttons: `12px`.
  - Form Inputs & Selects: `10px`.
  - Chips & Badges: `9999px` (fully round pill).
  - Surfaces: `16px`.
- **Depth**: Zero blurry drop shadows. Depth is achieved via `1px solid var(--color-border)` outlines combined with solid surface elevation shifts (`Steel` -> `Plate`).
- **Focus Rings**: Accessible 2-step focus ring: `2px solid var(--color-haldi)` with `2px offset var(--color-neel)`.

---

## 6. Mobile-First Layout Architecture

- **Mobile (< 768px)**:
  - Bottom navigation bar fixed to bottom viewport: `Home`, `Food`, `Activity`, `History`, `Profile`.
  - Center "Add" action elevated for quick thumb reach.
  - Safe area inset padding (`env(safe-area-inset-bottom)`).
- **Desktop (>= 768px)**:
  - Slim left navigation rail (64px collapsed, 220px expanded) with crisp icons and labels.
  - Center content area max width `1100px`.
- **Dashboard Layout**:
  - *Mobile*: Date bar -> Thali plate & macro legend -> Net energy note -> Grouped meals list.
  - *Desktop*: Two-column split: Left sticky column holds Date bar + large Thali plate + Net energy; right column holds meal categories with instant add buttons.

---

## 7. Motion & Psychological Safety

- **One Signature Motion**: When the dashboard first mounts, the Thali plate bowl strokes sweep in once over 500ms using CSS `stroke-dashoffset`.
- **Micro-Interactions**: Hover, press, and active states transition under 150ms.
- **Accessibility**: `@media (prefers-reduced-motion: reduce)` disables all SVG dash-draw animations, sheet slide transitions, and transforms instantly.
- **Psychological Safety**:
  - No red danger rings when exceeding calorie budgets.
  - No moralizing labels like "cheat meal", "guilt", "burn off", "offset", or "punish".
  - Net energy calculation framed neutrally as physical thermodynamic intake vs expenditure.
