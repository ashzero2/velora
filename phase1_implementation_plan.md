# Phase 1 Implementation Plan — Luna: Foundation

[Overview]
Implement Phase 1 (Foundation) of the Luna period tracker app: project scaffolding, design system, database layer, CycleEngine, Zustand stores, onboarding flow, home dashboard, and basic settings.

This phase establishes the entire project foundation. By the end, a user can:
1. Launch the app and complete a lightweight onboarding flow
2. Log a period start date and mark when it ends
3. See their current cycle day and cycle phase (menstruation/follicular/ovulation/luteal)
4. View phase descriptions with hormonal trends, common symptoms, and energy levels
5. Edit their onboarding data and preferences from settings

No predictions, analytics, notifications, or advanced logging in this phase — those come in Phases 2–5. The focus here is a rock-solid foundation with clean architecture, proper database schema, reusable UI primitives, and a CycleEngine with zero UI dependencies.

**Refer to** `@implementation_plan.md` for the full project research, scientific references, formulas, and multi-phase overview.

**Architecture principles (Phase 1):**
- All business logic lives in `src/engines/CycleEngine.ts` as pure functions
- Database access is abstracted behind repository modules (`CycleRepository`, `SettingsRepository`)
- State management uses Zustand stores that call repositories and engines
- UI components consume stores via hooks — no direct DB or engine calls from components
- NativeWind (Tailwind CSS) for consistent, maintainable styling
- Expo Router for file-based navigation

---

[Types]
Phase 1 type definitions — only the types needed for foundation functionality.

### Phase 1 Enums (subset of full app)

```typescript
// src/types/index.ts

export enum CyclePhase {
  MENSTRUATION = 'menstruation',
  FOLLICULAR = 'follicular',
  OVULATION = 'ovulation',
  LUTEAL = 'luteal',
  UNKNOWN = 'unknown',
}

export enum FlowIntensity {
  SPOTTING = 'spotting',
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  VERY_HEAVY = 'very_heavy',
}

export enum Severity {
  NONE = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  VERY_SEVERE = 4,
}
```

### Phase 1 Interfaces

```typescript
// src/types/index.ts

export interface Cycle {
  id: string;
  startDate: string;           // ISO YYYY-MM-DD
  endDate: string | null;      // null = current/ongoing cycle
  periodEndDate: string | null;// when bleeding stopped
  cycleLength: number | null;  // calculated when next cycle starts
  periodLength: number | null; // calculated from start to periodEnd
  notes: string;
  createdAt: string;           // ISO datetime
  updatedAt: string;           // ISO datetime
}

export interface CyclePhaseInfo {
  phase: CyclePhase;
  dayInPhase: number;
  totalPhaseDays: number;
  cycleDay: number;
  description: string;
  hormonalTrends: string;
  commonSymptoms: string[];
  energyLevel: 'low' | 'rising' | 'peak' | 'declining';
}

export interface PhaseBoundaries {
  menstruation: [number, number];  // [startDay, endDay] inclusive
  follicular: [number, number];
  ovulation: [number, number];
  luteal: [number, number];
}

export interface OnboardingData {
  lastPeriodStart: string;         // ISO YYYY-MM-DD
  averageCycleLength: number;      // days
  averagePeriodLength: number;     // days
  typicalSymptoms?: string[];
  isIrregular?: boolean;
  fertilityTracking?: boolean;
  completedAt: string;             // ISO datetime
}

export interface UserSettings {
  onboardingComplete: boolean;
  darkMode: boolean | 'system';
  fertilityTrackingEnabled: boolean;
  temperatureUnit: 'fahrenheit' | 'celsius';
  weightUnit: 'kg' | 'lbs';
  waterUnit: 'ml' | 'oz';
  defaultLutealPhase: number;      // default 14
}

export interface CycleValidation {
  valid: boolean;
  errors: string[];
}

export interface PhaseDescription {
  description: string;
  hormonalTrends: string;
  commonSymptoms: string[];
  energyLevel: 'low' | 'rising' | 'peak' | 'declining';
}
```

---

[Files]
All files created in Phase 1 — 38 files total, all new (greenfield project).

### Configuration Files (6 files)
| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, Expo config |
| `tsconfig.json` | TypeScript configuration with path aliases |
| `babel.config.js` | Babel config for NativeWind + Expo Router |
| `tailwind.config.js` | NativeWind/Tailwind theme configuration |
| `metro.config.js` | Metro bundler config for NativeWind |
| `app.json` | Expo app configuration (name, scheme, plugins) |
| `nativewind-env.d.ts` | NativeWind TypeScript declarations |
| `global.css` | Tailwind CSS directives (@tailwind base/components/utilities) |

### App Navigation (5 files)
| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout: wraps app in DatabaseProvider, SafeAreaProvider, checks onboarding status |
| `app/index.tsx` | Entry point: redirects to `(onboarding)/welcome` or `(tabs)` based on onboarding completion |
| `app/(onboarding)/_layout.tsx` | Stack layout for onboarding screens |
| `app/(tabs)/_layout.tsx` | Tab navigator with Home and Settings tabs (Phase 1 only has 2 tabs) |
| `app/(tabs)/settings.tsx` | Settings screen |

### Onboarding Screens (4 files)
| File | Purpose |
|------|---------|
| `app/(onboarding)/welcome.tsx` | Welcome screen: app intro, privacy message, "Get Started" button |
| `app/(onboarding)/cycle-info.tsx` | Required fields: last period start date, average cycle length, average period length |
| `app/(onboarding)/preferences.tsx` | Optional: typical symptoms, irregular cycle toggle, fertility tracking preference |
| `app/(onboarding)/complete.tsx` | Confirmation: summary of entered data, "Start Tracking" button |

### Dashboard (1 file)
| File | Purpose |
|------|---------|
| `app/(tabs)/index.tsx` | Home dashboard: CycleRing, PhaseCard, cycle day counter, period start/end buttons |

### Engine (1 file)
| File | Purpose |
|------|---------|
| `src/engines/CycleEngine.ts` | Pure functions: phase calculation, cycle day, phase boundaries, validation, descriptions |

### Database (5 files)
| File | Purpose |
|------|---------|
| `src/database/schema.ts` | SQL CREATE TABLE statements for `cycles` and `settings` tables |
| `src/database/migrations.ts` | Database version management, migration runner |
| `src/database/DatabaseProvider.tsx` | React context providing initialized SQLite database instance |
| `src/database/repositories/CycleRepository.ts` | CRUD operations for cycles table |
| `src/database/repositories/SettingsRepository.ts` | Key-value settings storage operations |

### Stores (2 files)
| File | Purpose |
|------|---------|
| `src/stores/useCycleStore.ts` | Zustand store: cycle CRUD, current cycle, cycle list, phase info |
| `src/stores/useSettingsStore.ts` | Zustand store: onboarding data, user settings, preferences |

### Hooks (2 files)
| File | Purpose |
|------|---------|
| `src/hooks/useDatabase.ts` | Hook providing database instance from DatabaseProvider context |
| `src/hooks/useCurrentPhase.ts` | Hook computing current phase info from cycle store + engine |

### UI Components (7 files)
| File | Purpose |
|------|---------|
| `src/components/ui/Button.tsx` | Reusable button: primary, secondary, outline, ghost variants |
| `src/components/ui/Card.tsx` | Container card with consistent padding, border radius, shadow |
| `src/components/ui/Badge.tsx` | Small status badges (phase labels, flow indicators) |
| `src/components/ui/ProgressRing.tsx` | Animated circular progress indicator (used in CycleRing) |
| `src/components/ui/DatePicker.tsx` | Date selection component wrapping platform date picker |
| `src/components/ui/EmptyState.tsx` | Placeholder for empty data states with icon + message |
| `src/components/ui/Slider.tsx` | Numeric slider for cycle length, period length selection |

### Cycle Components (2 files)
| File | Purpose |
|------|---------|
| `src/components/cycle/CycleRing.tsx` | Circular phase visualizer showing current position in cycle |
| `src/components/cycle/PhaseCard.tsx` | Card displaying current phase name, description, hormones, energy |

### Log Components (1 file)
| File | Purpose |
|------|---------|
| `src/components/log/FlowSelector.tsx` | Flow intensity selector (spotting → very heavy) with visual indicators |

### Utility Modules (3 files)
| File | Purpose |
|------|---------|
| `src/utils/dateUtils.ts` | Date arithmetic: addDays, diffDays, formatDate, parseDate, today |
| `src/utils/formatUtils.ts` | Display formatting: phase names, cycle day labels, ordinals |
| `src/utils/idUtils.ts` | UUID generation wrapper |

### Constants (3 files)
| File | Purpose |
|------|---------|
| `src/constants/theme.ts` | Design tokens: colors, spacing, border radius, shadows, typography |
| `src/constants/phases.ts` | Phase definitions: descriptions, hormonal trends, symptoms, energy per phase |
| `src/constants/medical.ts` | Medical constants: normal cycle range (24–38), period range (3–7), luteal default (14) |

### Type Definitions (1 file)
| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript enums and interfaces for Phase 1 |

---

[Functions]
All functions implemented in Phase 1, organized by module.

### CycleEngine.ts — Pure Functions (no side effects)

```typescript
/**
 * Calculate current cycle day (1-based) from cycle start date.
 * Returns number of days since cycle started, inclusive of start day.
 * @param cycleStartDate - ISO date string YYYY-MM-DD
 * @param today - optional override for testing, defaults to current date
 * @returns cycle day number (1 = first day of period)
 */
export function getCurrentCycleDay(cycleStartDate: string, today?: string): number;

/**
 * Determine current cycle phase based on cycle day, cycle length, and period length.
 * Uses adaptive phase boundaries (NOT hardcoded day 14 for ovulation).
 * Ovulation estimated at: cycleLength - lutealPhase (default 14).
 * @returns full CyclePhaseInfo with description, hormones, symptoms, energy
 */
export function getCurrentPhase(
  cycleDay: number,
  cycleLength: number,
  periodLength: number,
  lutealPhase?: number
): CyclePhaseInfo;

/**
 * Calculate phase day boundaries for a given cycle configuration.
 * menstruation: [1, periodLength]
 * follicular: [periodLength + 1, ovulationDay - 2]
 * ovulation: [ovulationDay - 1, ovulationDay + 1] (3-day window)
 * luteal: [ovulationDay + 2, cycleLength]
 * where ovulationDay = cycleLength - lutealPhase
 */
export function getPhaseBoundaries(
  cycleLength: number,
  periodLength: number,
  lutealPhase?: number
): PhaseBoundaries;

/**
 * Calculate cycle length between two consecutive cycle start dates.
 * @returns number of days between currentStart and nextStart
 */
export function calculateCycleLength(currentStart: string, nextStart: string): number;

/**
 * Calculate period length from start and end dates.
 * @returns number of days inclusive
 */
export function calculatePeriodLength(periodStart: string, periodEnd: string): number;

/**
 * Validate cycle data for medical reasonableness.
 * Checks: date not in future, cycle length 15–60 days, period length 1–15 days,
 * end date after start date, etc.
 */
export function validateCycleData(
  startDate: string,
  endDate?: string | null,
  periodEndDate?: string | null
): CycleValidation;

/**
 * Get phase description with hormonal trends, symptoms, and energy level.
 * Sources from constants/phases.ts data.
 */
export function getPhaseDescription(phase: CyclePhase): PhaseDescription;
```

### CycleRepository.ts — Database Operations

```typescript
/**
 * Insert a new cycle record.
 * Auto-calculates cycle_length of the *previous* cycle if it exists.
 */
export async function createCycle(db: SQLiteDatabase, cycle: Omit<Cycle, 'createdAt' | 'updatedAt'>): Promise<Cycle>;

/** Get cycle by ID */
export async function getCycleById(db: SQLiteDatabase, id: string): Promise<Cycle | null>;

/** Get all cycles ordered by start_date descending */
export async function getAllCycles(db: SQLiteDatabase): Promise<Cycle[]>;

/** Get the most recent (current or latest) cycle */
export async function getCurrentCycle(db: SQLiteDatabase): Promise<Cycle | null>;

/** Update a cycle record (e.g., set periodEndDate, endDate, notes) */
export async function updateCycle(db: SQLiteDatabase, id: string, updates: Partial<Cycle>): Promise<void>;

/** Delete a cycle by ID */
export async function deleteCycle(db: SQLiteDatabase, id: string): Promise<void>;

/** End current cycle and start a new one (transaction) */
export async function startNewCycle(db: SQLiteDatabase, newStartDate: string): Promise<Cycle>;
```

### SettingsRepository.ts — Key-Value Storage

```typescript
/** Get a setting value by key, with optional default */
export async function getSetting(db: SQLiteDatabase, key: string, defaultValue?: string): Promise<string | null>;

/** Set a setting value (upsert) */
export async function setSetting(db: SQLiteDatabase, key: string, value: string): Promise<void>;

/** Get all settings as a key-value object */
export async function getAllSettings(db: SQLiteDatabase): Promise<Record<string, string>>;

/** Delete a setting by key */
export async function deleteSetting(db: SQLiteDatabase, key: string): Promise<void>;

/** Save complete onboarding data (multiple settings in transaction) */
export async function saveOnboardingData(db: SQLiteDatabase, data: OnboardingData): Promise<void>;

/** Load onboarding data from settings */
export async function getOnboardingData(db: SQLiteDatabase): Promise<OnboardingData | null>;

/** Save user settings object */
export async function saveUserSettings(db: SQLiteDatabase, settings: UserSettings): Promise<void>;

/** Load user settings with defaults */
export async function getUserSettings(db: SQLiteDatabase): Promise<UserSettings>;
```

### useCycleStore.ts — Zustand Store

```typescript
interface CycleState {
  cycles: Cycle[];
  currentCycle: Cycle | null;
  currentPhaseInfo: CyclePhaseInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize(db: SQLiteDatabase): Promise<void>;
  startPeriod(db: SQLiteDatabase, startDate: string): Promise<void>;
  endPeriod(db: SQLiteDatabase, periodEndDate: string): Promise<void>;
  startNewCycle(db: SQLiteDatabase, newStartDate: string): Promise<void>;
  updateCycle(db: SQLiteDatabase, id: string, updates: Partial<Cycle>): Promise<void>;
  deleteCycle(db: SQLiteDatabase, id: string): Promise<void>;
  refreshPhaseInfo(cycleLength: number, periodLength: number): void;
}
```

### useSettingsStore.ts — Zustand Store

```typescript
interface SettingsState {
  settings: UserSettings;
  onboardingData: OnboardingData | null;
  isLoading: boolean;

  // Actions
  initialize(db: SQLiteDatabase): Promise<void>;
  completeOnboarding(db: SQLiteDatabase, data: OnboardingData): Promise<void>;
  updateSettings(db: SQLiteDatabase, updates: Partial<UserSettings>): Promise<void>;
  resetOnboarding(db: SQLiteDatabase): Promise<void>;
}
```

### dateUtils.ts — Date Helpers

```typescript
/** Add days to a date string, returns ISO date string */
export function addDays(dateStr: string, days: number): string;

/** Subtract days from a date string */
export function subDays(dateStr: string, days: number): string;

/** Calculate difference in days between two date strings */
export function diffDays(startDate: string, endDate: string): number;

/** Get today's date as ISO date string YYYY-MM-DD */
export function today(): string;

/** Format date for display: "May 18" or "May 18, 2026" */
export function formatDisplayDate(dateStr: string, includeYear?: boolean): string;

/** Format date range: "May 18–21" */
export function formatDateRange(startDate: string, endDate: string): string;

/** Parse ISO date string to Date object */
export function parseDate(dateStr: string): Date;

/** Check if date string is valid ISO format */
export function isValidDate(dateStr: string): boolean;

/** Check if date is in the future */
export function isFuture(dateStr: string): boolean;

/** Check if date is today */
export function isToday(dateStr: string): boolean;
```

### formatUtils.ts — Display Formatting

```typescript
/** Get human-readable phase name: "Menstruation" → "Period" */
export function formatPhaseName(phase: CyclePhase): string;

/** Format cycle day: "Day 14" */
export function formatCycleDay(day: number): string;

/** Format ordinal: 1 → "1st", 2 → "2nd", etc. */
export function ordinal(n: number): string;

/** Format flow intensity for display */
export function formatFlowIntensity(flow: FlowIntensity): string;
```

### idUtils.ts — ID Generation

```typescript
/** Generate a new UUID v4 string */
export function generateId(): string;
```

---

[Classes]
No classes are used in Phase 1. All modules use functional patterns:

- **CycleEngine**: exported pure functions
- **Repositories**: exported async functions accepting db instance
- **Stores**: Zustand `create()` with functional state
- **Components**: React functional components
- **DatabaseProvider**: React context with `createContext` / `useContext`

---

[Dependencies]
Phase 1 npm packages — installed via `npx create-expo-app` then augmented.

### Production Dependencies
```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-sqlite": "~15.0.0",
  "expo-status-bar": "~2.0.0",
  "expo-system-ui": "~4.0.0",
  "react": "18.3.1",
  "react-native": "0.76.0",
  "react-native-safe-area-context": "~4.12.0",
  "react-native-screens": "~4.1.0",
  "react-native-gesture-handler": "~2.20.0",
  "react-native-reanimated": "~3.16.0",
  "nativewind": "~4.1.0",
  "zustand": "~5.0.0",
  "date-fns": "~4.1.0",
  "uuid": "~10.0.0",
  "@expo/vector-icons": "~14.0.0",
  "react-native-svg": "~15.8.0"
}
```

### Dev Dependencies
```json
{
  "tailwindcss": "~3.4.0",
  "@types/react": "~18.3.0",
  "@types/uuid": "~10.0.0",
  "typescript": "~5.6.0"
}
```

### Installation Commands
```bash
# Step 1: Create Expo project
npx create-expo-app@latest periods --template blank-typescript

# Step 2: Install core deps
npx expo install expo-router expo-sqlite expo-status-bar expo-system-ui \
  react-native-safe-area-context react-native-screens \
  react-native-gesture-handler react-native-reanimated react-native-svg

# Step 3: Install NativeWind
npm install nativewind
npm install --save-dev tailwindcss

# Step 4: Install state & utilities
npm install zustand date-fns uuid @expo/vector-icons
npm install --save-dev @types/uuid
```

---

[Testing]
Phase 1 testing — focused on CycleEngine pure functions and utility functions.

### CycleEngine Unit Tests (`__tests__/engines/CycleEngine.test.ts`)
Tests for every pure function:

1. **getCurrentCycleDay**
   - Day 1 when today = start date
   - Day 14 when 13 days after start
   - Day 28 on last day of typical cycle
   - Handles edge case: future start date returns 0 or negative

2. **getCurrentPhase**
   - Returns MENSTRUATION for days 1–5 (period length 5, cycle length 28)
   - Returns FOLLICULAR for days 6–12
   - Returns OVULATION for days 13–15 (cycle 28, luteal 14 → ovulation day 14)
   - Returns LUTEAL for days 16–28
   - Works for short cycle (21 days): ovulation day 7
   - Works for long cycle (35 days): ovulation day 21
   - Returns UNKNOWN for cycle day > cycle length

3. **getPhaseBoundaries**
   - Standard 28-day cycle with 5-day period
   - Short 21-day cycle
   - Long 38-day cycle
   - Custom luteal phase (12 days instead of 14)
   - All boundaries are contiguous (no gaps or overlaps)

4. **calculateCycleLength**
   - 28 days between two dates
   - Handles cross-month dates
   - Handles cross-year dates

5. **calculatePeriodLength**
   - 5 days inclusive
   - 1 day (same start and end)

6. **validateCycleData**
   - Valid: normal date, no end date
   - Valid: start + end date in correct order
   - Invalid: future start date
   - Invalid: end date before start date
   - Invalid: unreasonably long cycle (>60 days)

### Utility Tests (`__tests__/utils/dateUtils.test.ts`)
1. **addDays / subDays**: basic arithmetic, month boundaries, year boundaries
2. **diffDays**: positive, negative, zero
3. **formatDisplayDate**: various months, with/without year
4. **isValidDate**: valid ISO, invalid strings, empty
5. **isFuture / isToday**: relative to current date

### Test Data Fixture (`__tests__/fixtures/sampleData.ts`)
```typescript
// Regular 28-day cycles for testing
export const regularCycles: Cycle[] = [
  { id: '1', startDate: '2026-01-05', endDate: '2026-02-01', periodEndDate: '2026-01-10', cycleLength: 28, periodLength: 5, ... },
  { id: '2', startDate: '2026-02-02', endDate: '2026-03-01', periodEndDate: '2026-02-07', cycleLength: 28, periodLength: 5, ... },
  // ... 6 cycles total
];

// Current ongoing cycle (no end date)
export const currentCycle: Cycle = {
  id: '7', startDate: '2026-07-27', endDate: null, periodEndDate: '2026-08-01', cycleLength: null, periodLength: 5, ...
};
```

---

[Implementation Order]
Phase 1 implementation in 10 sequential steps — each step builds on the previous.

### Step 1: Project Scaffolding
Create Expo project, install all Phase 1 dependencies, configure TypeScript, NativeWind, Expo Router, and Metro bundler.

**Files created:**
- `package.json` (via create-expo-app, then modified)
- `tsconfig.json` (add path aliases: `@/*` → `src/*`)
- `babel.config.js` (add nativewind/babel preset)
- `tailwind.config.js` (content paths, custom theme colors)
- `metro.config.js` (withNativeWind wrapper)
- `app.json` (scheme: "luna", plugins: expo-router)
- `nativewind-env.d.ts` (/// <reference types="nativewind/types" />)
- `global.css` (@tailwind base; @tailwind components; @tailwind utilities;)

**Verification:** `npx expo start` launches without errors.

### Step 2: Type Definitions & Constants
Create the type system and constant data that all other modules depend on.

**Files created:**
- `src/types/index.ts` — all Phase 1 enums + interfaces
- `src/constants/medical.ts` — NORMAL_CYCLE_MIN (24), NORMAL_CYCLE_MAX (38), NORMAL_PERIOD_MIN (3), NORMAL_PERIOD_MAX (7), DEFAULT_LUTEAL_PHASE (14), DEFAULT_CYCLE_LENGTH (28), DEFAULT_PERIOD_LENGTH (5)
- `src/constants/phases.ts` — PhaseDescription records for each CyclePhase (sourced from R1, R6 in implementation_plan.md)
- `src/constants/theme.ts` — color palette, spacing scale, border radius, shadow definitions

**Verification:** TypeScript compiles with no errors.

### Step 3: Utility Functions
Implement date helpers, formatting utilities, and ID generation.

**Files created:**
- `src/utils/dateUtils.ts` — all date functions using date-fns
- `src/utils/formatUtils.ts` — display formatting functions
- `src/utils/idUtils.ts` — UUID wrapper

**Verification:** Utility functions can be imported and used.

### Step 4: CycleEngine
Implement the core business logic as pure functions.

**Files created:**
- `src/engines/CycleEngine.ts` — all 7 functions: getCurrentCycleDay, getCurrentPhase, getPhaseBoundaries, calculateCycleLength, calculatePeriodLength, validateCycleData, getPhaseDescription

**Key logic:**
- Phase boundaries use adaptive ovulation: `ovulationDay = cycleLength - lutealPhase`
- NOT hardcoded to day 14
- Phase descriptions sourced from `constants/phases.ts`

**Verification:** All functions can be tested in isolation with sample inputs.

### Step 5: Database Layer
Set up SQLite schema, migrations, provider context, and repository modules.

**Files created:**
- `src/database/schema.ts` — CREATE TABLE for `cycles` and `settings`
- `src/database/migrations.ts` — version-based migration runner
- `src/database/DatabaseProvider.tsx` — React context with useEffect for DB initialization
- `src/database/repositories/CycleRepository.ts` — all cycle CRUD functions
- `src/database/repositories/SettingsRepository.ts` — settings key-value operations + onboarding helpers

**Schema (cycles table):**
```sql
CREATE TABLE IF NOT EXISTS cycles (
  id TEXT PRIMARY KEY,
  start_date TEXT NOT NULL,
  end_date TEXT,
  period_end_date TEXT,
  cycle_length INTEGER,
  period_length INTEGER,
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Schema (settings table):**
```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Verification:** Database initializes on app launch, tables created successfully.

### Step 6: Zustand Stores
Create state management stores that bridge DB, engine, and UI.

**Files created:**
- `src/stores/useCycleStore.ts` — manages cycle list, current cycle, phase info. Actions call CycleRepository then update state. `refreshPhaseInfo` calls CycleEngine.
- `src/stores/useSettingsStore.ts` — manages settings + onboarding data. Actions call SettingsRepository.

**Files created (hooks):**
- `src/hooks/useDatabase.ts` — `useContext(DatabaseContext)` wrapper
- `src/hooks/useCurrentPhase.ts` — derives phase info from useCycleStore + useSettingsStore

**Verification:** Stores can be initialized and state flows correctly.

### Step 7: UI Component Library
Build the shared UI primitives used across all screens.

**Files created:**
- `src/components/ui/Button.tsx` — variants: primary (sage), secondary (stone), outline, ghost. Sizes: sm, md, lg. Loading state.
- `src/components/ui/Card.tsx` — NativeWind styled container. Props: variant (default, elevated), padding.
- `src/components/ui/Badge.tsx` — phase-colored badges. Props: label, color, size.
- `src/components/ui/ProgressRing.tsx` — SVG-based circular progress. Props: progress (0–1), size, strokeWidth, color.
- `src/components/ui/DatePicker.tsx` — wraps RN DateTimePicker or a simple date input.
- `src/components/ui/EmptyState.tsx` — icon + title + description + optional action button.
- `src/components/ui/Slider.tsx` — numeric value selector with min/max/step, displays current value.

**Verification:** All components render correctly in isolation.

### Step 8: Cycle Components
Build the cycle-specific display components for the dashboard.

**Files created:**
- `src/components/cycle/CycleRing.tsx` — circular visualization: outer ring divided into 4 phase-colored arcs, dot/marker at current day position. Shows cycle day number in center. Uses ProgressRing + SVG.
- `src/components/cycle/PhaseCard.tsx` — displays: phase name (with Badge), description, hormonal trends, common symptoms list, energy level indicator. Uses Card.
- `src/components/log/FlowSelector.tsx` — 5 selectable options (spotting → very heavy) with droplet icons of increasing size/opacity.

**Verification:** Components render with mock data.

### Step 9: Onboarding Flow
Build the 4-screen onboarding experience.

**Files created:**
- `app/(onboarding)/_layout.tsx` — Stack navigator, no header, slide animations
- `app/(onboarding)/welcome.tsx` — App name "Luna", tagline, privacy note ("Your data stays on your device"), illustration/icon, "Get Started" button
- `app/(onboarding)/cycle-info.tsx` — DatePicker for last period start, Slider for avg cycle length (21–45, default 28), Slider for avg period length (1–10, default 5). Validation: all required.
- `app/(onboarding)/preferences.tsx` — Optional toggles: irregular cycle, fertility tracking. Multi-select: typical symptoms (cramps, headaches, bloating, mood swings, fatigue, acne, back pain). All skippable.
- `app/(onboarding)/complete.tsx` — Summary card showing entered data. "Start Tracking" button calls settingsStore.completeOnboarding(), creates initial cycle from lastPeriodStart, redirects to (tabs).

**UX requirements:**
- Each screen has a progress indicator (step 1/4, 2/4, etc.)
- Back navigation available on all screens except welcome
- Skip button on preferences screen
- Explain WHY data is requested (small helper text under each field)
- All fields show sensible defaults

**Verification:** User can complete onboarding, data persists in SQLite, app redirects to dashboard.

### Step 10: Dashboard + Settings + App Navigation
Build the main app screens and navigation structure.

**Files created:**
- `app/_layout.tsx` — Root layout: wraps in DatabaseProvider + SafeAreaProvider. On mount: initializes stores. Renders `<Slot />`.
- `app/index.tsx` — Checks `useSettingsStore().settings.onboardingComplete`. If false → redirect to `(onboarding)/welcome`. If true → redirect to `(tabs)`.
- `app/(tabs)/_layout.tsx` — Tab navigator with 2 tabs: Home (house icon) and Settings (gear icon). Phase 1 only.
- `app/(tabs)/index.tsx` — Dashboard screen:
  - **Top**: CycleRing showing current day position in cycle
  - **Middle**: PhaseCard with current phase description
  - **Bottom**: Action buttons — "Start Period" / "End Period" / "Period Ended" depending on state
  - **Empty state**: If no cycle data, show EmptyState with prompt to log first period
- `app/(tabs)/settings.tsx` — Settings screen:
  - View/edit: average cycle length, average period length, fertility tracking toggle
  - Display: last period start date, current cycle day
  - Actions: reset onboarding (with confirmation)
  - Info: "Your data is stored locally on this device" privacy note
  - Medical disclaimer at bottom

**State flow for period actions:**
```
No current cycle → "Start Period" button → creates new cycle with today as startDate
Current cycle, no periodEndDate → "End Period" button → sets periodEndDate to today
Current cycle, has periodEndDate → "Period Ended ✓" display + "Start New Cycle" (for next period)
```

**Verification:** Full app flow works: launch → onboarding → dashboard with cycle tracking → settings.
