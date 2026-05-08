# Implementation Plan — Luna: Privacy-First Period Tracker

[Overview]
Build a modern, privacy-first period tracker React Native/Expo mobile app with intelligent cycle analysis, adaptive predictions, wellness insights, and meaningful notifications — using a phased delivery approach across 5 phases.

The app targets users who want to track menstrual cycles, predict upcoming periods, estimate ovulation and fertile windows, understand current cycle phases, identify symptom and cycle patterns, receive useful reminders, and gain transparent data-driven insights. The design must feel calm, trustworthy, scientifically grounded, and non-judgmental. It is NOT a medical diagnosis tool.

**Tech Stack:**
- React Native with Expo SDK 52+ (managed workflow)
- Expo Router (file-based routing with tab layout)
- expo-sqlite for local-first encrypted storage
- Zustand for lightweight reactive state management
- NativeWind (Tailwind CSS for React Native) for styling
- expo-notifications for push notifications
- expo-local-authentication for biometric lock
- victory-native for charts and analytics
- react-native-calendars for calendar views
- date-fns for date manipulation
- expo-file-system + expo-sharing for data export

**Phased Delivery:**
- Phase 1: Foundation — project setup, database, onboarding, core cycle tracking
- Phase 2: Intelligence — prediction engine, cycle phase analysis, confidence scoring
- Phase 3: Depth — daily logging, insights dashboard, symptom analytics
- Phase 4: Engagement — smart notifications, wellness engine, health pattern monitoring
- Phase 5: Polish — cycle-aware planner, privacy/security hardening, data export, testing

---

## RESEARCH: Scientific Foundations & Medical References

### R1. Menstrual Cycle Phases & Timing

**Source: Cleveland Clinic** — https://my.clevelandclinic.org/health/articles/10132-menstrual-cycle
> Normal cycle: 24–38 days, average 28 days. Bleeding: 3–7 days, 2–3 tablespoons blood loss.
> Four Phases:
> 1. MENSES PHASE: Day 1+, uterine lining sheds, bleeding 3–5 days typical
> 2. FOLLICULAR PHASE: Overlaps menses, ends at ovulation. Estrogen rises causing endometrium to thicken. FSH causes ovarian follicles to grow. Days 10–14 one follicle forms mature egg.
> 3. OVULATION: ~Day 14 in 28-day cycle. LH surge causes egg release.
> 4. LUTEAL PHASE: Day 15–28. Progesterone rises to prepare uterine lining. If no fertilization, estrogen and progesterone drop triggering menstruation.

**Source: Cleveland Clinic — Ovulation** — https://my.clevelandclinic.org/health/articles/23439-ovulation
> On average, ovulation happens on day 14 of a 28-day menstrual cycle (day 1 = first day of period).
> A "normal" cycle is anything between 21 and 35 days, so ovulation is unique to each person.
> LH surge causes ovary to release mature egg. Egg survives about 12–24 hours after ovulation.
> Sperm can live in uterus for 3–5 days. This means sex may lead to pregnancy from about 5 days before ovulation to 1 day after.
> BBT increases slightly during ovulation (typically about 0.5 to 1 degree Fahrenheit).
> Cervical mucus turns clear and slippery (like egg whites) just before ovulation.

**Source: ACOG Committee Opinion 651** — https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/12/menstruation-in-girls-and-adolescents-using-the-menstrual-cycle-as-a-vital-sign
> ACOG recommends the menstrual cycle be treated as a vital sign. Normal frequency: onset every 24–38 days.

**Source: UCSF Center for Reproductive Health** — https://crh.ucsf.edu/about-fertility/normal-menstrual-cycle
> Ovulation occurs approximately 14 days before the onset of the next menstrual period.
> Two main phases: follicular (variable length) and luteal (relatively constant ~14 days).

### R2. Ovulation Prediction Formulas

**Source: Calendar-based contraceptive methods (Wikipedia, citing Georgetown/WHO)** — https://en.wikipedia.org/wiki/Calendar-based_contraceptive_methods

#### Standard Days Method (Georgetown University, 2002)
```
Fixed fertile window: Days 8–19 of the menstrual cycle
Requirement: Cycles must be consistently between 26 and 32 days
Perfect-use efficacy: 95%; Typical-use: 82–90%
```

#### Knaus-Ogino Rhythm Method (1930)
```
First fertile day = length of shortest cycle − 18
Last fertile day  = length of longest cycle − 11
Example: cycles 30–36 days → fertile days 12–25
Typical-use failure rate: 25% per year
```

#### Personalized Ovulation Estimation (our approach)
```
Estimated ovulation day = predicted_cycle_length − estimated_luteal_phase
Fertile window = 5 days before estimated ovulation + ovulation day (6-day window)

Default luteal phase = 14 days (if unknown)
Personalized luteal phase = cycle_length − day_of_ovulation (if BBT/cervical mucus data available)
Luteal phase normal range: 10–16 days
```

### R3. Cycle Prediction — Weighted Historical Average

**Algorithm (adaptive, not hardcoded):**
```
weighted_average_cycle_length = Σ(cycle_length_i × weight_i) / Σ(weight_i)

Weights: more recent cycles get higher weight
  - Most recent cycle: weight = 6
  - 2nd most recent: weight = 5
  - 3rd most recent: weight = 4
  - ...continuing to weight = 1

predicted_next_period = last_period_start + weighted_average_cycle_length
estimated_ovulation = predicted_next_period − estimated_luteal_phase
fertile_window_start = estimated_ovulation − 5
fertile_window_end = estimated_ovulation
```

### R4. Confidence Scoring

```
Confidence is based on:
1. Number of logged cycles (n)
2. Cycle variability (standard deviation)
3. Data completeness

HIGH confidence: n >= 6 AND std_dev <= 2 days
MEDIUM confidence: n >= 3 AND std_dev <= 4 days
LOW confidence: n < 3 OR std_dev > 4 days

Display ranges instead of exact dates for MEDIUM/LOW confidence:
  range = std_dev × confidence_multiplier (1.0 for MEDIUM, 1.5 for LOW)
  predicted_start_range = [predicted - range, predicted + range]
```

### R5. Irregular Cycle Detection — FIGO Classification

**Source: FIGO System 1 / ACOG** — https://en.wikipedia.org/wiki/Menstrual_disorder

| Parameter | Normal | Abnormal |
|-----------|--------|----------|
| Cycle length (frequency) | 24–38 days | <24 or >38 days |
| Cycle regularity | Variation ≤ ~8 days | Variation > 8 days |
| Flow duration | 3–7 days (up to 8–9) | >7 days |
| Flow volume | 5–80 mL per cycle | >80 mL (heavy) |

**When to flag for healthcare professional:**
- Cycles < 21 days or > 35 days consistently
- No period for > 90 days (secondary amenorrhea)
- Bleeding > 7 days
- Cycle-to-cycle variation > 8 days
- Very heavy bleeding (soaking pad/tampon every hour)
- Sudden change from regular to irregular

**Messaging approach (non-alarmist):**
> "Your recent cycles show higher variability than typical. This pattern may be worth discussing with a healthcare professional."

### R6. Wellness Recommendations Per Phase (Evidence-Based)

**Source: MedlinePlus/NIH PMS article** — https://medlineplus.gov/ency/article/001505.htm
> Lifestyle is the first step to managing PMS. Drink plenty of fluids (water/juice). Eat frequent small meals. Balanced diet with whole grains, vegetables, fruit. Limit salt and sugar. Get regular aerobic exercise throughout the month. Exercise more during weeks with PMS. Calcium, magnesium, tryptophan supplements may help.

**Source: Cleveland Clinic — Nutrition and Exercise Throughout Menstrual Cycle** — https://health.clevelandclinic.org/nutrition-and-exercise-throughout-your-menstrual-cycle
**Source: Geisinger Health — Menstrual Cycle Syncing** — https://www.geisinger.org/health-and-wellness/wellness-articles/2026/04/02/17/52/menstrual-cycle-syncing
**Source: Harvard Apple Women's Health Study** — https://hsph.harvard.edu/research/apple-womens-health-study/study-updates/exploring-exercise-habits-by-menstrual-cycle-phase/

#### Menstruation Phase (Days 1–5)
- **Energy**: Lower, fatigue common
- **Exercise**: Gentle — yoga, walking, stretching, light swimming
- **Nutrition**: Iron-rich foods (spinach, lentils, red meat), anti-inflammatory foods (ginger, turmeric), warm beverages
- **Wellness**: Rest, heat therapy for cramps, adequate sleep (8+ hrs), hydration
- **Avoid**: High-intensity exercise if fatigued, excessive caffeine

#### Follicular Phase (Days 1–13, overlapping menstruation)
- **Energy**: Rising, increasing motivation
- **Exercise**: Ramp up intensity — cardio, HIIT, strength training, new activities
- **Nutrition**: Complex carbs, lean proteins, fermented foods, leafy greens
- **Wellness**: Good time for challenging goals, social activities
- **Hormones**: Estrogen rising → better mood, higher energy

#### Ovulation Phase (Days 13–15)
- **Energy**: Peak energy and confidence
- **Exercise**: High-intensity — HIIT, heavy lifting, sprints, competitive sports
- **Nutrition**: Fiber-rich foods, antioxidant-rich fruits/vegetables, lighter meals
- **Wellness**: Peak social energy, communication skills
- **Hormones**: LH surge, peak estrogen, testosterone peak

#### Luteal Phase (Days 15–28)
- **Energy**: Gradually declining, PMS symptoms possible
- **Exercise**: Moderate — Pilates, moderate strength, swimming, walking
- **Nutrition**: Complex carbs (serotonin support), magnesium-rich foods (dark chocolate, nuts, seeds), B6, calcium
- **Wellness**: Prioritize sleep, stress reduction, warm baths, journaling
- **Hormones**: Progesterone rises then drops; possible bloating, mood swings, cravings
- **Avoid**: Excessive salt (bloating), alcohol, skipping meals

**IMPORTANT DISCLAIMER (must appear in app):**
> "This app does not provide medical advice. Wellness suggestions are general information based on common patterns and should not replace professional medical guidance."

### R7. Tracking Methods & Biomarkers

**Source: Cleveland Clinic — Ovulation** — https://my.clevelandclinic.org/health/articles/23439-ovulation

| Method | How It Works | Accuracy |
|--------|-------------|----------|
| Calendar/rhythm | Track cycle lengths, calculate fertile window | Low–Moderate |
| Basal Body Temp (BBT) | 0.5–1°F rise after ovulation | Moderate (retrospective) |
| Cervical mucus | Clear, slippery "egg white" = fertile | Moderate |
| LH test strips | Detect LH surge 24–36 hrs before ovulation | High |
| Symptothermal | Combines BBT + cervical mucus + calendar | High |

### R8. App UX & Privacy Best Practices

**Source: Analysis of Clue, Flo, Drip, Euki, Periodical** — GitHub open-source projects
**Source: WHO recommendations on menstrual health** — https://www.who.int/news-room/fact-sheets/detail/menstrual-health

**UX Patterns:**
- Calendar-centric interface with color-coded cycle phase indicators
- Quick-entry daily logging for symptoms, flow intensity, mood, energy
- At-a-glance dashboard: current cycle day, days until next period, fertile window
- Timeline/ring visualization for predicted period and fertile window
- Minimal onboarding: ask only last period date + average cycle length to start
- Gentle, non-clinical, inclusive language
- Customizable tracking categories (not everyone wants fertility tracking)

**Privacy Best Practices:**
- Local-first data storage (no cloud by default)
- End-to-end encryption for any cloud sync
- Biometric authentication (Face ID / Touch ID)
- Full data export (JSON/CSV)
- Complete data deletion capability
- No third-party analytics by default
- Minimal permissions (only notifications)
- Transparent data storage explanation in settings
- No selling or sharing of health data

---

[Types]
Core TypeScript type definitions for the entire application.

### Enums

```typescript
enum CyclePhase {
  MENSTRUATION = 'menstruation',
  FOLLICULAR = 'follicular',
  OVULATION = 'ovulation',
  LUTEAL = 'luteal',
  UNKNOWN = 'unknown'
}

enum PredictionConfidence {
  HIGH = 'high',       // n >= 6, std_dev <= 2
  MEDIUM = 'medium',   // n >= 3, std_dev <= 4
  LOW = 'low',         // n < 3 or std_dev > 4
  NONE = 'none'        // no data
}

enum FlowIntensity {
  SPOTTING = 'spotting',
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  VERY_HEAVY = 'very_heavy'
}

enum MoodType {
  HAPPY = 'happy',
  CALM = 'calm',
  ENERGETIC = 'energetic',
  ANXIOUS = 'anxious',
  SAD = 'sad',
  IRRITABLE = 'irritable',
  SENSITIVE = 'sensitive',
  NEUTRAL = 'neutral'
}

enum Severity {
  NONE = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  VERY_SEVERE = 4
}

enum CervicalMucusType {
  DRY = 'dry',
  STICKY = 'sticky',
  CREAMY = 'creamy',
  WATERY = 'watery',
  EGG_WHITE = 'egg_white'
}

enum NotificationType {
  PERIOD_REMINDER = 'period_reminder',
  PRE_PERIOD_WARNING = 'pre_period_warning',
  OVULATION_REMINDER = 'ovulation_reminder',
  HYDRATION = 'hydration',
  HEALTHY_EATING = 'healthy_eating',
  SYMPTOM_LOGGING = 'symptom_logging',
  SLEEP = 'sleep',
  WELLNESS_TIP = 'wellness_tip'
}

enum IrregularityFlag {
  NORMAL = 'normal',
  MILDLY_IRREGULAR = 'mildly_irregular',
  IRREGULAR = 'irregular',
  CONSULT_RECOMMENDED = 'consult_recommended'
}
```

### Core Interfaces

```typescript
interface Cycle {
  id: string;
  startDate: string;       // ISO date YYYY-MM-DD
  endDate: string | null;  // null if ongoing
  periodEndDate: string | null;
  cycleLength: number | null;  // calculated when cycle ends
  periodLength: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DailyLog {
  id: string;
  date: string;            // ISO date YYYY-MM-DD
  cycleId: string | null;
  flow: FlowIntensity | null;
  mood: MoodType[];
  crampsSeverity: Severity;
  headacheSeverity: Severity;
  acneSeverity: Severity;
  libido: Severity;
  discharge: CervicalMucusType | null;
  sleepHours: number | null;
  exerciseMinutes: number | null;
  waterIntakeMl: number | null;
  bodyTemperature: number | null;  // Fahrenheit
  basalBodyTemperature: number | null;
  weight: number | null;
  medication: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Prediction {
  id: string;
  basedOnCycleIds: string[];
  predictedPeriodStart: string;
  predictedPeriodEnd: string;
  predictedPeriodStartRange: [string, string]; // [earliest, latest]
  estimatedOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  confidence: PredictionConfidence;
  confidenceScore: number;  // 0-100
  averageCycleLength: number;
  standardDeviation: number;
  lutealPhaseEstimate: number;
  basisDescription: string;  // human-readable explanation
  createdAt: string;
}

interface CyclePhaseInfo {
  phase: CyclePhase;
  dayInPhase: number;
  totalPhaseDays: number;
  cycleDay: number;
  description: string;
  hormonalTrends: string;
  commonSymptoms: string[];
  energyLevel: 'low' | 'rising' | 'peak' | 'declining';
}

interface WellnessSuggestion {
  id: string;
  phase: CyclePhase;
  category: 'exercise' | 'nutrition' | 'sleep' | 'hydration' | 'stress' | 'general';
  title: string;
  description: string;
  symptoms: string[];  // relevant symptoms that trigger this suggestion
  priority: number;    // 1-10
}

interface HealthPattern {
  type: 'long_period' | 'short_cycle' | 'long_cycle' | 'high_variability' | 'missed_period' | 'heavy_flow';
  severity: IrregularityFlag;
  message: string;
  detectedAt: string;
  dataPoints: number;
}

interface InsightItem {
  id: string;
  type: 'pattern' | 'trend' | 'correlation' | 'statistic';
  title: string;
  description: string;
  dataSource: string;
  confidence: number;
  generatedAt: string;
}

interface NotificationPreferences {
  enabled: boolean;
  periodReminder: boolean;
  periodReminderDaysBefore: number;
  prePeriodWarning: boolean;
  ovulationReminder: boolean;
  hydrationReminder: boolean;
  healthyEatingReminder: boolean;
  symptomLoggingReminder: boolean;
  sleepReminder: boolean;
  wellnessTips: boolean;
  quietHoursStart: string;  // "22:00"
  quietHoursEnd: string;    // "08:00"
  frequency: 'minimal' | 'moderate' | 'frequent';
}

interface OnboardingData {
  lastPeriodStart: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  typicalSymptoms?: string[];
  moodPatterns?: string[];
  isIrregular?: boolean;
  fertilityTracking?: boolean;
  healthGoals?: string[];
  notificationPreferences?: Partial<NotificationPreferences>;
  completedAt: string;
}

interface UserSettings {
  onboardingComplete: boolean;
  biometricLockEnabled: boolean;
  darkMode: boolean | 'system';
  fertilityTrackingEnabled: boolean;
  temperatureUnit: 'fahrenheit' | 'celsius';
  weightUnit: 'kg' | 'lbs';
  waterUnit: 'ml' | 'oz';
  defaultLutealPhase: number;  // default 14
  dataRetentionMonths: number; // 0 = forever
}

interface CycleStatistics {
  totalCycles: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  shortestCycle: number;
  longestCycle: number;
  cycleVariability: number;  // standard deviation
  regularityScore: number;   // 0-100
  irregularityFlag: IrregularityFlag;
}

interface PlannerDay {
  date: string;
  cycleDay: number;
  phase: CyclePhase;
  predictedEnergy: 'low' | 'moderate' | 'high' | 'peak';
  predictedSymptoms: string[];
  suggestedActivities: string[];
  isPeriodDay: boolean;
  isFertileDay: boolean;
  isOvulationDay: boolean;
}
```

---

[Files]
Complete file structure for the React Native/Expo app organized by phase.

### Project Root Structure
```
periods/
├── app.json
├── babel.config.js
├── tailwind.config.js
├── nativewind-env.d.ts
├── tsconfig.json
├── package.json
├── metro.config.js
├── implementation_plan.md
├── README.md
├── app/
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Entry redirect
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── cycle-info.tsx
│   │   ├── preferences.tsx
│   │   └── complete.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── calendar.tsx         # Calendar view
│   │   ├── log.tsx              # Daily logging
│   │   ├── insights.tsx         # Analytics/Insights
│   │   └── settings.tsx         # Settings
│   └── (modals)/
│       ├── log-detail.tsx       # Full log entry modal
│       ├── prediction-detail.tsx
│       ├── cycle-detail.tsx
│       └── planner.tsx          # Cycle-aware planner
├── src/
│   ├── engines/
│   │   ├── CycleEngine.ts       # Phase 1: Cycle tracking logic
│   │   ├── PredictionEngine.ts  # Phase 2: Adaptive predictions
│   │   ├── SymptomAnalyticsEngine.ts  # Phase 3: Pattern detection
│   │   ├── NotificationEngine.ts     # Phase 4: Smart notifications
│   │   ├── WellnessEngine.ts         # Phase 4: Phase-aware suggestions
│   │   └── HealthPatternEngine.ts    # Phase 4: Anomaly detection
│   ├── stores/
│   │   ├── useCycleStore.ts     # Phase 1: Cycle state
│   │   ├── usePredictionStore.ts # Phase 2: Prediction state
│   │   ├── useLogStore.ts       # Phase 3: Daily log state
│   │   ├── useInsightStore.ts   # Phase 3: Insights state
│   │   ├── useNotificationStore.ts # Phase 4: Notification state
│   │   └── useSettingsStore.ts  # Phase 1: Settings/onboarding
│   ├── database/
│   │   ├── schema.ts            # Phase 1: SQLite schema definitions
│   │   ├── migrations.ts        # Phase 1: Database migrations
│   │   ├── DatabaseProvider.tsx  # Phase 1: DB context provider
│   │   └── repositories/
│   │       ├── CycleRepository.ts      # Phase 1
│   │       ├── DailyLogRepository.ts   # Phase 3
│   │       ├── PredictionRepository.ts # Phase 2
│   │       ├── SettingsRepository.ts   # Phase 1
│   │       └── NotificationRepository.ts # Phase 4
│   ├── components/
│   │   ├── ui/                  # Shared UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── cycle/               # Cycle-specific components
│   │   │   ├── CycleRing.tsx         # Phase 1: Circular phase visualizer
│   │   │   ├── PhaseCard.tsx         # Phase 1: Current phase display
│   │   │   ├── PredictionCard.tsx    # Phase 2: Prediction with confidence
│   │   │   ├── FertileWindowBar.tsx  # Phase 2: Fertile window timeline
│   │   │   └── CycleTimeline.tsx     # Phase 3: Historical timeline
│   │   ├── log/                 # Logging components
│   │   │   ├── FlowSelector.tsx      # Phase 1
│   │   │   ├── MoodSelector.tsx      # Phase 3
│   │   │   ├── SymptomGrid.tsx       # Phase 3
│   │   │   ├── SeveritySlider.tsx    # Phase 3
│   │   │   └── QuickLogCard.tsx      # Phase 3
│   │   ├── insights/            # Analytics components
│   │   │   ├── StatCard.tsx          # Phase 3
│   │   │   ├── CycleLengthChart.tsx  # Phase 3
│   │   │   ├── SymptomTrendChart.tsx # Phase 3
│   │   │   ├── PatternInsightCard.tsx # Phase 3
│   │   │   └── HealthAlertCard.tsx   # Phase 4
│   │   ├── wellness/            # Wellness components
│   │   │   ├── WellnessTipCard.tsx   # Phase 4
│   │   │   └── PhaseWellnessPanel.tsx # Phase 4
│   │   ├── notifications/       # Notification components
│   │   │   └── NotificationPrefsForm.tsx # Phase 4
│   │   └── planner/             # Planner components
│   │       ├── PlannerDayCard.tsx    # Phase 5
│   │       └── EnergyForecast.tsx    # Phase 5
│   ├── hooks/
│   │   ├── useDatabase.ts       # Phase 1: DB access hook
│   │   ├── useCurrentPhase.ts   # Phase 1: Current phase calculation
│   │   ├── usePredictions.ts    # Phase 2: Prediction hook
│   │   ├── useInsights.ts       # Phase 3: Insights generation
│   │   └── useBiometricAuth.ts  # Phase 5: Biometric lock
│   ├── utils/
│   │   ├── dateUtils.ts         # Phase 1: Date helpers
│   │   ├── mathUtils.ts         # Phase 2: Statistics (std dev, weighted avg)
│   │   ├── formatUtils.ts       # Phase 1: Display formatting
│   │   ├── idUtils.ts           # Phase 1: UUID generation
│   │   └── exportUtils.ts       # Phase 5: Data export helpers
│   ├── constants/
│   │   ├── theme.ts             # Phase 1: Design tokens
│   │   ├── phases.ts            # Phase 1: Phase definitions & descriptions
│   │   ├── wellness.ts          # Phase 4: Wellness suggestion data
│   │   ├── notifications.ts     # Phase 4: Notification templates
│   │   └── medical.ts           # Phase 1: Medical constants (ranges, thresholds)
│   └── types/
│       └── index.ts             # All TypeScript types (from [Types] section)
├── assets/
│   ├── fonts/
│   └── images/
└── __tests__/
    ├── engines/
    │   ├── CycleEngine.test.ts
    │   ├── PredictionEngine.test.ts
    │   ├── SymptomAnalyticsEngine.test.ts
    │   └── HealthPatternEngine.test.ts
    ├── stores/
    │   └── useCycleStore.test.ts
    └── utils/
        ├── dateUtils.test.ts
        └── mathUtils.test.ts
```

### Phase-to-File Mapping

| Phase | New Files | Modified Files |
|-------|-----------|----------------|
| Phase 1 | app.json, package.json, tsconfig.json, babel.config.js, tailwind.config.js, metro.config.js, all `app/` layouts, app/(tabs)/index.tsx, app/(onboarding)/*, src/engines/CycleEngine.ts, src/database/*, src/stores/useCycleStore.ts, src/stores/useSettingsStore.ts, src/components/ui/*, src/components/cycle/CycleRing.tsx, src/components/cycle/PhaseCard.tsx, src/components/log/FlowSelector.tsx, src/hooks/useDatabase.ts, src/hooks/useCurrentPhase.ts, src/utils/dateUtils.ts, src/utils/formatUtils.ts, src/utils/idUtils.ts, src/constants/theme.ts, src/constants/phases.ts, src/constants/medical.ts, src/types/index.ts | None (greenfield) |
| Phase 2 | src/engines/PredictionEngine.ts, src/stores/usePredictionStore.ts, src/database/repositories/PredictionRepository.ts, src/components/cycle/PredictionCard.tsx, src/components/cycle/FertileWindowBar.tsx, src/hooks/usePredictions.ts, src/utils/mathUtils.ts | app/(tabs)/index.tsx (add predictions), app/(modals)/prediction-detail.tsx |
| Phase 3 | src/engines/SymptomAnalyticsEngine.ts, src/stores/useLogStore.ts, src/stores/useInsightStore.ts, src/database/repositories/DailyLogRepository.ts, app/(tabs)/log.tsx, app/(tabs)/insights.tsx, app/(tabs)/calendar.tsx, app/(modals)/log-detail.tsx, src/components/log/*, src/components/insights/*, src/components/cycle/CycleTimeline.tsx, src/hooks/useInsights.ts | app/(tabs)/_layout.tsx (add tabs) |
| Phase 4 | src/engines/NotificationEngine.ts, src/engines/WellnessEngine.ts, src/engines/HealthPatternEngine.ts, src/stores/useNotificationStore.ts, src/components/wellness/*, src/components/notifications/*, src/components/insights/HealthAlertCard.tsx, src/constants/wellness.ts, src/constants/notifications.ts | app/(tabs)/index.tsx (add wellness), app/(tabs)/insights.tsx (add health alerts), app/(tabs)/settings.tsx (add notification prefs) |
| Phase 5 | app/(modals)/planner.tsx, src/components/planner/*, src/hooks/useBiometricAuth.ts, src/utils/exportUtils.ts, __tests__/* | app/(tabs)/settings.tsx (add export/biometric), README.md |

---

[Functions]
Detailed function signatures organized by engine module.

### CycleEngine.ts (Phase 1)
```typescript
// Pure functions — no side effects, no UI dependencies

/** Calculate current cycle day from start date */
function getCurrentCycleDay(cycleStartDate: string, today?: string): number;

/** Determine current cycle phase based on cycle day and cycle length */
function getCurrentPhase(cycleDay: number, cycleLength: number, periodLength: number): CyclePhaseInfo;

/** Calculate phase boundaries for a given cycle length */
function getPhaseBoundaries(cycleLength: number, periodLength: number, lutealPhase?: number): {
  menstruation: [number, number];    // [startDay, endDay]
  follicular: [number, number];
  ovulation: [number, number];
  luteal: [number, number];
};

/** Calculate cycle length from start dates */
function calculateCycleLength(currentStart: string, nextStart: string): number;

/** Calculate period length from start and end dates */
function calculatePeriodLength(periodStart: string, periodEnd: string): number;

/** Validate cycle data for reasonable ranges */
function validateCycleData(startDate: string, endDate?: string): { valid: boolean; errors: string[] };

/** Get phase description text */
function getPhaseDescription(phase: CyclePhase): {
  description: string;
  hormonalTrends: string;
  commonSymptoms: string[];
  energyLevel: string;
};
```

### PredictionEngine.ts (Phase 2)
```typescript
/** Calculate weighted average cycle length from history */
function calculateWeightedAverageCycleLength(cycles: Cycle[]): number;

/** Calculate standard deviation of cycle lengths */
function calculateCycleVariability(cycles: Cycle[]): number;

/** Determine prediction confidence level */
function calculateConfidence(cycles: Cycle[]): {
  level: PredictionConfidence;
  score: number;  // 0-100
  factors: string[];
};

/** Generate full prediction for next cycle */
function generatePrediction(
  cycles: Cycle[],
  settings: { lutealPhase: number; fertilityTracking: boolean }
): Prediction;

/** Estimate luteal phase from BBT/cervical mucus data if available */
function estimateLutealPhase(
  cycles: Cycle[],
  dailyLogs: DailyLog[],
  defaultLutealPhase?: number
): number;

/** Calculate prediction range based on confidence */
function calculatePredictionRange(
  predictedDate: string,
  standardDeviation: number,
  confidence: PredictionConfidence
): [string, string];

/** Generate human-readable explanation of prediction */
function generatePredictionBasis(
  cycles: Cycle[],
  weightedAvg: number,
  confidence: PredictionConfidence
): string;
// Example output: "Predicted ovulation on May 18 based on your last 6 cycles averaging 29 days."
```

### SymptomAnalyticsEngine.ts (Phase 3)
```typescript
/** Detect symptom patterns across cycles */
function detectSymptomPatterns(
  dailyLogs: DailyLog[],
  cycles: Cycle[]
): InsightItem[];

/** Find correlations between symptoms and cycle phases */
function findPhaseCorrelations(
  dailyLogs: DailyLog[],
  cycles: Cycle[]
): { symptom: string; phase: CyclePhase; frequency: number; averageSeverity: number }[];

/** Calculate symptom frequency statistics */
function calculateSymptomFrequency(
  dailyLogs: DailyLog[],
  symptomKey: string
): { total: number; perCycle: number; mostCommonPhase: CyclePhase };

/** Generate cycle statistics from historical data */
function generateCycleStatistics(cycles: Cycle[]): CycleStatistics;

/** Identify trending symptoms (increasing/decreasing over time) */
function identifySymptomTrends(
  dailyLogs: DailyLog[],
  windowCycles?: number
): { symptom: string; trend: 'increasing' | 'decreasing' | 'stable'; changePercent: number }[];
```

### NotificationEngine.ts (Phase 4)
```typescript
/** Schedule all upcoming notifications based on predictions and preferences */
function scheduleNotifications(
  prediction: Prediction,
  phaseInfo: CyclePhaseInfo,
  preferences: NotificationPreferences
): ScheduledNotification[];

/** Get phase-appropriate notification content */
function getNotificationContent(
  type: NotificationType,
  phase: CyclePhase,
  context: { daysUntilPeriod?: number; cycleDay?: number }
): { title: string; body: string };

/** Check if notification should be suppressed (quiet hours, frequency limits) */
function shouldSuppressNotification(
  type: NotificationType,
  preferences: NotificationPreferences,
  notificationLog: { type: NotificationType; sentAt: string; dismissed: boolean }[]
): boolean;

/** Adapt notification frequency based on user engagement */
function calculateAdaptiveFrequency(
  notificationLog: { type: NotificationType; sentAt: string; dismissed: boolean; opened: boolean }[]
): { type: NotificationType; recommendedFrequency: 'reduce' | 'maintain' | 'increase' }[];
```

### WellnessEngine.ts (Phase 4)
```typescript
/** Get wellness suggestions for current phase and symptoms */
function getWellnessSuggestions(
  phase: CyclePhase,
  recentSymptoms: DailyLog[],
  preferences: { fertilityTracking: boolean }
): WellnessSuggestion[];

/** Get phase-specific exercise recommendations */
function getExerciseRecommendations(phase: CyclePhase): WellnessSuggestion[];

/** Get phase-specific nutrition recommendations */
function getNutritionRecommendations(phase: CyclePhase, symptoms: string[]): WellnessSuggestion[];

/** Get sleep and rest recommendations based on phase and symptoms */
function getRestRecommendations(phase: CyclePhase, sleepData: number[]): WellnessSuggestion[];
```

### HealthPatternEngine.ts (Phase 4)
```typescript
/** Analyze cycles for health patterns that may need attention */
function analyzeHealthPatterns(
  cycles: Cycle[],
  dailyLogs: DailyLog[]
): HealthPattern[];

/** Check for irregular cycle patterns */
function checkIrregularity(cycles: Cycle[]): IrregularityFlag;

/** Detect unusually long periods */
function detectLongPeriods(cycles: Cycle[], threshold?: number): HealthPattern | null;

/** Detect missed or skipped cycles */
function detectMissedCycles(cycles: Cycle[]): HealthPattern | null;

/** Detect high cycle variability */
function detectHighVariability(cycles: Cycle[], threshold?: number): HealthPattern | null;

/** Generate safe, non-alarmist health message */
function generateHealthMessage(pattern: HealthPattern): string;
```

---

[Classes]
No traditional classes are used. The architecture follows a functional approach with:

- **Engine modules**: Pure TypeScript functions (no classes)
- **Zustand stores**: Functional stores with hooks
- **React components**: Functional components with hooks
- **Repository modules**: Functional modules wrapping SQLite operations

This design choice ensures:
1. Better testability (pure functions are easy to test)
2. No `this` context issues
3. Tree-shaking friendly
4. Simpler mental model

The only class-like construct is the SQLite database wrapper, which uses the Expo SQLite API's functional interface.

---

[Dependencies]
All npm packages required for the project.

### Core Dependencies (Phase 1)
```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-sqlite": "~15.0.0",
  "expo-status-bar": "~2.0.0",
  "react": "18.3.1",
  "react-native": "0.76.0",
  "react-native-safe-area-context": "~4.12.0",
  "react-native-screens": "~4.1.0",
  "react-native-gesture-handler": "~2.20.0",
  "react-native-reanimated": "~3.16.0",
  "nativewind": "~4.1.0",
  "tailwindcss": "~3.4.0",
  "zustand": "~5.0.0",
  "date-fns": "~4.1.0",
  "uuid": "~10.0.0",
  "@expo/vector-icons": "~14.0.0"
}
```

### Phase 2 Dependencies
```json
{
  "react-native-calendars": "~1.1306.0"
}
```

### Phase 3 Dependencies
```json
{
  "victory-native": "~41.0.0",
  "react-native-svg": "~15.8.0"
}
```

### Phase 4 Dependencies
```json
{
  "expo-notifications": "~0.29.0",
  "expo-device": "~7.0.0"
}
```

### Phase 5 Dependencies
```json
{
  "expo-local-authentication": "~15.0.0",
  "expo-file-system": "~18.0.0",
  "expo-sharing": "~13.0.0"
}
```

### Dev Dependencies
```json
{
  "@types/react": "~18.3.0",
  "@types/uuid": "~10.0.0",
  "typescript": "~5.6.0",
  "jest": "~29.7.0",
  "@testing-library/react-native": "~12.7.0",
  "eslint": "~9.0.0",
  "prettier": "~3.4.0"
}
```

---

[Testing]
Testing strategy organized by phase.

### Unit Tests (All Phases)
- **Engine tests** (highest priority): All pure functions in `src/engines/` must have comprehensive unit tests
  - `CycleEngine.test.ts`: Phase calculation, cycle day, boundary calculations
  - `PredictionEngine.test.ts`: Weighted average, confidence scoring, range calculation, edge cases (1 cycle, irregular cycles, missing data)
  - `SymptomAnalyticsEngine.test.ts`: Pattern detection, correlation accuracy
  - `HealthPatternEngine.test.ts`: Irregularity detection, threshold accuracy

### Utility Tests
- `dateUtils.test.ts`: Date arithmetic, formatting, edge cases
- `mathUtils.test.ts`: Standard deviation, weighted average, statistical calculations

### Store Tests
- `useCycleStore.test.ts`: State management, CRUD operations, event-driven recalculation

### Test Data
Create `__tests__/fixtures/sampleData.ts` with:
- Regular 28-day cycles (6+ cycles)
- Irregular cycles (varying 24–35 days)
- Short cycles (21 days)
- Long cycles (38 days)
- Missing data scenarios
- Edge cases: only 1 cycle logged, no cycles logged

### Integration Tests (Phase 5)
- Onboarding flow end-to-end
- Log entry → prediction recalculation
- Notification scheduling after prediction update

---

[Implementation Order]
Phased implementation sequence with detailed steps per phase.

## Phase 1: Foundation (Core Tracking + Onboarding)
**Goal**: User can onboard, log periods, see current cycle day and phase.

1. **Project scaffolding**: Initialize Expo project with TypeScript, configure NativeWind, Expo Router, metro.config.js, babel.config.js
2. **Design system**: Create theme tokens (colors, spacing, typography), implement shared UI components (Button, Card, Badge, etc.)
3. **Type definitions**: Create all TypeScript types/enums in `src/types/index.ts`
4. **Constants**: Medical constants, phase definitions with descriptions
5. **Database layer**: SQLite schema, migrations, DatabaseProvider, CycleRepository, SettingsRepository
6. **CycleEngine**: Implement all phase 1 pure functions (getCurrentCycleDay, getCurrentPhase, getPhaseBoundaries, etc.)
7. **Stores**: useCycleStore (cycle CRUD, current cycle tracking), useSettingsStore (onboarding state, user preferences)
8. **Onboarding flow**: 4-screen flow (welcome → cycle-info → preferences → complete) with validation
9. **Home dashboard**: CycleRing visualization, PhaseCard showing current phase, cycle day counter, quick period start/end
10. **Basic settings screen**: Edit onboarding data, view stored data, basic preferences

**Deliverables**: Working app that onboards users, tracks period start/end, displays current cycle day and phase with descriptions.

## Phase 2: Intelligence (Predictions + Fertility)
**Goal**: Adaptive predictions with confidence scoring, ovulation/fertile window estimates.

1. **Math utilities**: Weighted average, standard deviation, statistical functions
2. **PredictionEngine**: Weighted historical average, confidence scoring, range calculation, prediction basis explanation
3. **PredictionRepository**: Store/retrieve predictions, prediction history snapshots
4. **usePredictionStore**: Manage prediction state, auto-recalculate on cycle changes
5. **PredictionCard component**: Display predicted next period with confidence badge and date range
6. **FertileWindowBar component**: Visual timeline of fertile window and estimated ovulation
7. **Prediction detail modal**: Full explanation of why prediction exists, data quality, confidence factors
8. **Calendar integration**: react-native-calendars with cycle phase color coding, predicted dates
9. **Update dashboard**: Add prediction section, fertile window (if fertility tracking enabled)

**Deliverables**: Predictions adapt over time, show confidence levels, explain reasoning transparently.

## Phase 3: Depth (Daily Logging + Insights)
**Goal**: Rich daily logging with symptom tracking, analytics dashboard with pattern detection.

1. **DailyLogRepository**: Full CRUD for daily logs with date indexing
2. **useLogStore**: Daily log state management, log creation/editing
3. **Logging UI**: MoodSelector, SymptomGrid, SeveritySlider, QuickLogCard
4. **Daily log screen**: Full logging form with all optional fields (mood, sleep, exercise, cramps, headaches, acne, libido, discharge, medication, weight, water intake, body temperature, BBT, cervical mucus)
5. **Log detail modal**: View/edit historical log entries
6. **SymptomAnalyticsEngine**: Pattern detection, phase correlations, symptom frequency
7. **useInsightStore**: Insights state management, auto-generation on new data
8. **Insights dashboard**: StatCard grid (avg cycle length, period length, variability), CycleLengthChart, SymptomTrendChart
9. **Pattern insight cards**: Auto-generated insights like "Cramps usually occur 1–2 days before your period"
10. **Calendar view**: Full calendar with cycle overlay, logged symptoms, period days highlighted
11. **CycleTimeline component**: Horizontal scrollable timeline of past cycles

**Deliverables**: Users can log detailed daily data, view analytics, see symptom patterns and cycle statistics.

## Phase 4: Engagement (Notifications + Wellness + Health Monitoring)
**Goal**: Smart adaptive notifications, phase-aware wellness suggestions, health pattern detection.

1. **NotificationEngine**: Schedule notifications based on predictions, phase-aware content, quiet hours, adaptive frequency
2. **expo-notifications setup**: Permission requests, scheduling, background handling
3. **NotificationRepository**: Track sent notifications, dismissals, opens for adaptive frequency
4. **useNotificationStore**: Manage notification preferences and scheduling
5. **NotificationPrefsForm**: Settings UI for configuring notification types, frequency, quiet hours
6. **WellnessEngine**: Phase-aware suggestions using research data (R6), symptom-responsive recommendations
7. **Wellness constants**: Complete suggestion database organized by phase and category
8. **WellnessTipCard + PhaseWellnessPanel**: Display contextual wellness suggestions on dashboard
9. **HealthPatternEngine**: Detect irregular cycles, long periods, missed cycles, high variability using FIGO thresholds (R5)
10. **HealthAlertCard**: Non-alarmist informational cards on insights screen when patterns detected
11. **Medical disclaimer**: Visible disclaimer on all wellness and health pattern screens

**Deliverables**: Intelligent notifications, contextual wellness tips, health pattern monitoring with safe messaging.

## Phase 5: Polish (Planner + Privacy + Export + Testing)
**Goal**: Cycle-aware planning, full privacy/security features, data export, comprehensive testing, documentation.

1. **Cycle-aware planner**: PlannerDayCard showing expected energy, symptoms, suggested activities for upcoming days
2. **EnergyForecast component**: Visual forecast of energy levels across upcoming cycle
3. **Planner modal**: Scrollable view of next 30 days with phase-based planning insights
4. **Biometric lock**: expo-local-authentication integration, Face ID/Touch ID on app launch
5. **Data export**: Export all data as JSON/CSV using expo-file-system + expo-sharing
6. **Data deletion**: Complete data wipe with confirmation
7. **Privacy settings**: Transparent explanation of what data is stored and where
8. **Dark mode**: System-aware dark mode with NativeWind dark: classes
9. **Empty/loading/error states**: All screens handle gracefully
10. **Unit tests**: CycleEngine, PredictionEngine, SymptomAnalyticsEngine, HealthPatternEngine, utility functions
11. **Test fixtures**: Sample data sets for all test scenarios
12. **README documentation**: Architecture explanation, setup instructions, feature overview, medical disclaimer

**Deliverables**: Production-ready app with planning features, robust privacy, full test coverage, and documentation.

---

## Database Schema (SQLite)

```sql
-- Phase 1
CREATE TABLE IF NOT EXISTS cycles (
  id TEXT PRIMARY KEY,
  start_date TEXT NOT NULL,          -- YYYY-MM-DD
  end_date TEXT,                     -- YYYY-MM-DD, NULL if current cycle
  period_end_date TEXT,              -- when bleeding stopped
  cycle_length INTEGER,              -- calculated when next cycle starts
  period_length INTEGER,             -- calculated from start to period_end
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Phase 2
CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  based_on_cycle_ids TEXT NOT NULL,  -- JSON array of cycle IDs
  predicted_period_start TEXT NOT NULL,
  predicted_period_end TEXT NOT NULL,
  predicted_start_range_early TEXT,
  predicted_start_range_late TEXT,
  estimated_ovulation_date TEXT,
  fertile_window_start TEXT,
  fertile_window_end TEXT,
  confidence TEXT NOT NULL,          -- 'high' | 'medium' | 'low' | 'none'
  confidence_score INTEGER,          -- 0-100
  average_cycle_length REAL,
  standard_deviation REAL,
  luteal_phase_estimate INTEGER,
  basis_description TEXT,
  created_at TEXT NOT NULL
);

-- Phase 3
CREATE TABLE IF NOT EXISTS daily_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,         -- YYYY-MM-DD, one log per day
  cycle_id TEXT,
  flow TEXT,                         -- FlowIntensity enum value
  mood TEXT,                         -- JSON array of MoodType values
  cramps_severity INTEGER DEFAULT 0,
  headache_severity INTEGER DEFAULT 0,
  acne_severity INTEGER DEFAULT 0,
  libido INTEGER DEFAULT 0,
  discharge TEXT,                    -- CervicalMucusType enum value
  sleep_hours REAL,
  exercise_minutes INTEGER,
  water_intake_ml INTEGER,
  body_temperature REAL,
  basal_body_temperature REAL,
  weight REAL,
  medication TEXT,                   -- JSON array
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_cycle ON daily_logs(cycle_id);

-- Phase 4
CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                -- NotificationType
  title TEXT,
  body TEXT,
  scheduled_at TEXT NOT NULL,
  sent_at TEXT,
  opened BOOLEAN DEFAULT 0,
  dismissed BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(type);
```

---

## Design System

### Color Palette (calm, neutral, non-stereotypical)
```typescript
const colors = {
  // Primary — warm sage
  primary: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#6b9080', 600: '#5a7d6e', 700: '#4a6a5c' },
  // Secondary — warm stone
  secondary: { 50: '#fafaf9', 100: '#f5f5f4', 500: '#a8a29e', 600: '#78716c' },
  // Accent — soft amber
  accent: { 50: '#fffbeb', 100: '#fef3c7', 500: '#d4a574', 600: '#b8956a' },
  // Semantic
  menstruation: '#c97b7b',   // warm rose (not hot pink)
  follicular: '#7ba5c9',     // calm blue
  ovulation: '#c9b87b',      // warm gold
  luteal: '#9b7bc9',         // soft purple
  fertile: '#7bc9a5',        // gentle teal
  // Status
  success: '#6b9080',
  warning: '#d4a574',
  error: '#c97b7b',
  info: '#7ba5c9',
  // Neutrals
  background: { light: '#fafaf9', dark: '#1c1917' },
  surface: { light: '#ffffff', dark: '#292524' },
  text: { primary: '#1c1917', secondary: '#57534e', muted: '#a8a29e' },
  textDark: { primary: '#fafaf9', secondary: '#d6d3d1', muted: '#78716c' },
};
```

### Typography
- **Headings**: System font, bold, 20–28px
- **Body**: System font, regular, 16px (accessible minimum)
- **Caption**: System font, 13–14px
- **Numbers/Stats**: Monospace or tabular figures for cycle day counters

### Spacing Scale
4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Component Design Principles
- Generous touch targets (44px minimum)
- Rounded corners (12–16px for cards)
- Subtle shadows for depth
- Phase-colored accents (not overwhelming)
- One-handed bottom-reachable interactions
