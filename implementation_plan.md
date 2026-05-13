# Implementation Plan: Velora App Simplification & Fertility Tab

## Overview

Strip down the Velora period tracker app to focus on easy user usage. Remove information overload, simplify logging to flow-only, replace calendar with predictions, and add a dedicated Fertility tab (2nd tab, after Home) with nutrition, conception tips, and wellness content.

---

## Confirmed User Decisions

- **Log tab:** Flow level + notes field (remove mood, symptoms, all other fields)
- **Insights:** Show last **3** periods
- **Flow history:** Show last **7** days
- **Fertility tab:** Sections A + B + C + D + E (Fertile Window Dashboard, Phase Nutrition, Fertility Superfoods, Conception Tips, Lifestyle & Wellness)
- **Fertility tab position:** 2nd tab (right after Home) — prioritized when fertility tracking is on
- **Calendar tab:** Removed entirely

---

## Current State → Proposed State

### Current (5 Tabs)
| # | Tab | Content |
|---|-----|---------|
| 1 | Home | Blob + phase card + predictions + fertile bar + mood log + period status |
| 2 | Calendar | Monthly calendar with dots |
| 3 | Log | Flow + mood + 7 symptom sliders + 10+ other fields |
| 4 | Insights | Cycle charts + symptom trends + pattern cards + stat grid |
| 5 | Settings | Onboarding, dark mode, fertility toggle, units |

### Proposed (4–5 Tabs)
| # | Tab | Content |
|---|-----|---------|
| 1 | **Home** | Blob + phase card + next 3 predictions + quick flow log + period status |
| 2 | **Fertility** *(conditional)* | Fertile window + nutrition + superfoods + conception tips + wellness |
| 3 | **Log** | Flow selector + notes field only |
| 4 | **Insights** | Last 3 periods + next 3 predictions + 7-day flow history |
| 5 | **Settings** | Keep as-is |

*If fertility tracking is OFF, the Fertility tab is hidden → 4 tabs total.*

---

## PHASE 1: Foundation & Data Layer
*Create the nutrition/fertility data constants. No UI changes yet.*

### Files Created:
- `src/constants/nutrition.ts` — All nutrition data structured by phase

### Content of `nutrition.ts`:
```
Phase nutrition data (per CyclePhase):
  - nutrients: string[] (Iron, Vitamin C, etc.)
  - recommendedFoods: { name, emoji, description }[]
  - foodsToAvoid: { name, reason }[]
  - tip: string

Fertility superfoods:
  - { name, emoji, benefit, nutrients }[]

Key supplements:
  - { name, dosage, benefit }[]

Conception tips:
  - { title, icon, description }[]

Wellness tips (per phase):
  - exercise: { type, duration, description }
  - sleep: string
  - hydration: string
  - stressManagement: string
  - thingsToAvoid: string[]
```

### Verification:
- TypeScript compiles with `npx tsc --noEmit`

---

## PHASE 2: Fertility Tab Components
*Build all fertility UI components. Not wired to navigation yet.*

### Files Created:
- `src/components/fertility/FertileStatus.tsx`
  - Shows: fertile window dates, countdown, ovulation day, conception probability
  - Props: `prediction: Prediction`, `cycleStartDate: string`, `cycleLength: number`
  - Uses: `diffDays`, `today`, `formatDisplayDate` from dateUtils

- `src/components/fertility/PhaseNutrition.tsx`
  - Shows: current phase nutrients, recommended foods grid, foods to avoid, phase tip
  - Props: `currentPhase: CyclePhase`
  - Reads from: `nutrition.ts` constants

- `src/components/fertility/FertilityFoods.tsx`
  - Shows: top fertility superfoods list, key supplements list
  - Props: none (static content from constants)

- `src/components/fertility/ConceptionTips.tsx`
  - Shows: timing tips, ovulation signs, pregnancy test guidance
  - Props: `ovulationDay?: number`, `currentCycleDay?: number`

- `src/components/fertility/WellnessTips.tsx`
  - Shows: phase-specific exercise, sleep, hydration, stress tips, things to avoid
  - Props: `currentPhase: CyclePhase`

### Verification:
- All components render without errors (TypeScript compiles)

---

## PHASE 3: Fertility Tab Screen & Navigation
*Wire the fertility components into a new tab and update navigation.*

### Files Created:
- `app/(tabs)/fertility.tsx` — ScrollView with all 5 fertility sections stacked

### Files Modified:
- `app/(tabs)/_layout.tsx`
  - Remove Calendar tab entry
  - Add Fertility tab (2nd position, after Home, before Log)
  - Conditionally show/hide Fertility tab based on `settings.fertilityTrackingEnabled`
  - Icon: `Ionicons leaf-outline` or `heart-outline`

### Tab Order After Change:
1. Home (`index`) — `home`
2. Fertility (`fertility`) — `leaf-outline` *(conditional)*
3. Log (`log`) — `create-outline`
4. Insights (`insights`) — `bar-chart-outline`
5. Settings (`settings`) — `settings-outline`

### Verification:
- Fertility tab appears when `fertilityTrackingEnabled = true`
- Fertility tab hidden when `fertilityTrackingEnabled = false`
- All sections render correctly in ScrollView
- TypeScript compiles

---

## PHASE 4: Simplify Home Tab
*Strip down the Home screen to essentials.*

### File Modified:
- `app/(tabs)/index.tsx`

### Changes:
- REMOVE: `FertileWindowBar` import and usage (moved to Fertility tab)
- REMOVE: `PredictionCard` import and usage (info consolidated in Upcoming Cycles list)
- REMOVE: Quick mood log (`QuickLogCard` with mood toggle)
- REMOVE: Medical disclaimer text
- ADD: Quick flow log — replace mood toggle with `FlowSelector` inline
- KEEP: Gradient blob `CycleRing`
- KEEP: `PhaseCard`
- KEEP: Upcoming Cycles list (next 3 predictions)
- KEEP: Period Status card (start/end period buttons)
- KEEP: Cycle info card (cycle length, period length, current day)

### Verification:
- Home renders cleanly without FertileWindowBar or mood log
- Flow selector works inline
- TypeScript compiles

---

## PHASE 5: Simplify Log Tab
*Strip down to flow + notes only.*

### File Modified:
- `app/(tabs)/log.tsx`

### Changes:
- KEEP: Date picker (to log for past days)
- KEEP: `FlowSelector` component
- ADD: Simple `TextInput` for notes field
- ADD: Save button
- REMOVE: `MoodSelector` and all mood-related code
- REMOVE: `SymptomGrid` and all symptom categories
- REMOVE: `SeveritySlider` and all 7 severity fields
- REMOVE: All other fields (libido, discharge, sleep, exercise, water, temp, weight, medication)

### Verification:
- Log screen shows only: date picker + flow selector + notes + save button
- Saving a log writes flow and notes to database correctly
- TypeScript compiles

---

## PHASE 6: Simplify Insights Tab
*Replace charts with simple lists.*

### File Modified:
- `app/(tabs)/insights.tsx`

### Changes:
- REMOVE: `CycleLengthChart` import and usage
- REMOVE: `SymptomTrendChart` import and usage
- REMOVE: `PatternInsightCard` import and usage
- REMOVE: `StatCard` grid
- ADD: **Past Periods section** — List of last 3 completed cycles (start date, end date, cycle length, period length) using `Card` components
- ADD: **Upcoming Predictions section** — Next 3 predicted periods with dates and confidence badges
- ADD: **7-Day Flow History section** — Visual row of last 7 days showing flow level (water drop icons with intensity)

### Verification:
- Insights shows 3 clean sections
- Data loads correctly from stores
- TypeScript compiles

---

## PHASE 7: Cleanup & Final Verification
*Remove unused files and verify everything works.*

### Files to Delete (optional — can keep for future use):
- `app/(tabs)/calendar.tsx`

### Final Checks:
- `npx tsc --noEmit` passes with zero errors
- All 4-5 tabs render correctly
- Fertility tab shows/hides based on settings
- Flow logging works on Log tab and Home quick log
- Insights shows correct period history and predictions
- No broken imports or dead references

---

## Summary of All Phases

| Phase | Scope | Files Changed | Risk |
|-------|-------|--------------|------|
| 1 | Data constants | 1 new file | None |
| 2 | Fertility components | 5 new files | None |
| 3 | Fertility tab + nav | 2 files (1 new, 1 modified) | Low |
| 4 | Simplify Home | 1 file modified | Medium |
| 5 | Simplify Log | 1 file modified | Medium |
| 6 | Simplify Insights | 1 file modified | Medium |
| 7 | Cleanup + verify | Delete 1 file, full test | Low |

**Total: 8 new files, 4 modified files, 1 deleted file**

