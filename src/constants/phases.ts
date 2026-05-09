// ============================================================
// Velora — Phase Definitions & Descriptions
// Sources: Cleveland Clinic (R1), Geisinger Health (R6),
//          Harvard Apple Women's Health Study (R6)
// ============================================================

import { CyclePhase, type PhaseDescription } from '@src/types';

/**
 * Phase descriptions with hormonal trends, common symptoms, and energy levels.
 * Used by CycleEngine.getPhaseDescription() and PhaseCard component.
 */
export const PHASE_DESCRIPTIONS: Record<CyclePhase, PhaseDescription> = {
  [CyclePhase.MENSTRUATION]: {
    description:
      'Your body is shedding the uterine lining. This is day 1 of your cycle. Rest and gentle movement can help ease discomfort.',
    hormonalTrends:
      'Estrogen and progesterone are at their lowest levels. FSH begins to rise to stimulate new follicle growth.',
    commonSymptoms: [
      'Cramps',
      'Fatigue',
      'Lower back pain',
      'Headaches',
      'Bloating',
      'Mood changes',
      'Breast tenderness',
    ],
    energyLevel: 'low',
  },

  [CyclePhase.FOLLICULAR]: {
    description:
      'Your body is preparing for ovulation. Energy and mood typically start to improve as estrogen rises. A great time for new activities and goals.',
    hormonalTrends:
      'Estrogen rises steadily, thickening the uterine lining. FSH stimulates follicle growth in the ovaries. One dominant follicle forms a mature egg.',
    commonSymptoms: [
      'Increased energy',
      'Improved mood',
      'Better concentration',
      'Clearer skin',
      'Increased creativity',
    ],
    energyLevel: 'rising',
  },

  [CyclePhase.OVULATION]: {
    description:
      'An egg is released from the ovary. This is typically your highest energy point in the cycle. You may feel more social and confident.',
    hormonalTrends:
      'LH surges triggering egg release. Estrogen peaks. Testosterone reaches its highest point. The egg survives about 12–24 hours after release.',
    commonSymptoms: [
      'Peak energy',
      'Increased libido',
      'Mild pelvic pain (mittelschmerz)',
      'Clear, stretchy cervical mucus',
      'Slight temperature rise',
      'Heightened senses',
    ],
    energyLevel: 'peak',
  },

  [CyclePhase.LUTEAL]: {
    description:
      'Your body is preparing for a potential pregnancy. If the egg isn\'t fertilized, hormone levels will drop and your period will begin. PMS symptoms may appear.',
    hormonalTrends:
      'Progesterone rises to prepare the uterine lining, then drops if no implantation occurs. Estrogen has a secondary, smaller rise then also drops. These hormonal shifts can trigger PMS symptoms.',
    commonSymptoms: [
      'Bloating',
      'Mood swings',
      'Food cravings',
      'Breast tenderness',
      'Fatigue',
      'Irritability',
      'Headaches',
      'Acne',
    ],
    energyLevel: 'declining',
  },

  [CyclePhase.UNKNOWN]: {
    description:
      'We need more information to determine your current cycle phase. Log your period start date to get personalized phase tracking.',
    hormonalTrends: 'Phase information will be available once cycle data is logged.',
    commonSymptoms: [],
    energyLevel: 'low',
  },
};

/**
 * Human-readable phase display names.
 */
export const PHASE_DISPLAY_NAMES: Record<CyclePhase, string> = {
  [CyclePhase.MENSTRUATION]: 'Period',
  [CyclePhase.FOLLICULAR]: 'Follicular',
  [CyclePhase.OVULATION]: 'Ovulation',
  [CyclePhase.LUTEAL]: 'Luteal',
  [CyclePhase.UNKNOWN]: 'Unknown',
};

/**
 * Phase colors for UI components (matches tailwind.config.js theme).
 */
export const PHASE_COLORS: Record<CyclePhase, string> = {
  [CyclePhase.MENSTRUATION]: '#c97b7b',
  [CyclePhase.FOLLICULAR]: '#7ba5c9',
  [CyclePhase.OVULATION]: '#c9b87b',
  [CyclePhase.LUTEAL]: '#9b7bc9',
  [CyclePhase.UNKNOWN]: '#a8a29e',
};

/**
 * Energy level display labels and colors.
 */
export const ENERGY_LEVELS = {
  low: { label: 'Low Energy', color: '#c97b7b', icon: 'battery-low' },
  rising: { label: 'Rising Energy', color: '#7ba5c9', icon: 'battery-half' },
  peak: { label: 'Peak Energy', color: '#c9b87b', icon: 'battery-full' },
  declining: { label: 'Declining Energy', color: '#9b7bc9', icon: 'battery-half' },
} as const;