import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { CyclePhase } from '@src/types';
import { PHASE_COLORS, PHASE_DISPLAY_NAMES } from '@src/constants/phases';
import { getPhaseBoundaries } from '@src/engines/CycleEngine';
import { colors, spacing } from '@src/constants/theme';

interface CycleRingProps {
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  currentPhase: CyclePhase;
  size?: number;
  strokeWidth?: number;
}

/** Gradient color palettes for each phase */
const PHASE_GRADIENTS: Record<CyclePhase, { inner: string; outer: string; glow: string }> = {
  [CyclePhase.MENSTRUATION]: { inner: '#f8e8e8', outer: '#c97b7b', glow: '#c97b7b30' },
  [CyclePhase.FOLLICULAR]:   { inner: '#e8eff8', outer: '#7ba5c9', glow: '#7ba5c930' },
  [CyclePhase.OVULATION]:    { inner: '#f8f3e8', outer: '#c9b87b', glow: '#c9b87b30' },
  [CyclePhase.LUTEAL]:       { inner: '#f0e8f8', outer: '#9b7bc9', glow: '#9b7bc930' },
  [CyclePhase.UNKNOWN]:      { inner: '#f0efee', outer: '#a8a29e', glow: '#a8a29e30' },
};

const PHASE_LABELS: Record<CyclePhase, string> = {
  [CyclePhase.MENSTRUATION]: 'Period',
  [CyclePhase.FOLLICULAR]: 'Follicular',
  [CyclePhase.OVULATION]: 'Ovulation',
  [CyclePhase.LUTEAL]: 'Luteal',
  [CyclePhase.UNKNOWN]: '',
};

const ALL_PHASES: CyclePhase[] = [
  CyclePhase.MENSTRUATION,
  CyclePhase.FOLLICULAR,
  CyclePhase.OVULATION,
  CyclePhase.LUTEAL,
];

export function CycleRing({
  cycleDay,
  cycleLength,
  periodLength,
  currentPhase,
  size = 220,
}: CycleRingProps) {
  const center = size / 2;
  const blobRadius = size / 2 - 16;
  const glowRadius = size / 2 - 6;
  const progressRadius = size / 2 - 4;
  const progressStroke = 3;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const boundaries = getPhaseBoundaries(cycleLength, periodLength);

  const gradient = PHASE_GRADIENTS[currentPhase] ?? PHASE_GRADIENTS[CyclePhase.UNKNOWN];
  const phaseColor = PHASE_COLORS[currentPhase] ?? PHASE_COLORS[CyclePhase.UNKNOWN];
  const phaseName = PHASE_DISPLAY_NAMES[currentPhase] ?? 'Unknown';

  // Progress arc
  const dayProgress = Math.min(cycleDay / cycleLength, 1);
  const progressDashoffset = progressCircumference * (1 - dayProgress);

  // Phase progress info
  const phaseEntries = [
    { phase: CyclePhase.MENSTRUATION, start: boundaries.menstruation[0], end: boundaries.menstruation[1] },
    { phase: CyclePhase.FOLLICULAR, start: boundaries.follicular[0], end: boundaries.follicular[1] },
    { phase: CyclePhase.OVULATION, start: boundaries.ovulation[0], end: boundaries.ovulation[1] },
    { phase: CyclePhase.LUTEAL, start: boundaries.luteal[0], end: boundaries.luteal[1] },
  ];

  const currentPhaseData = phaseEntries.find((p) => p.phase === currentPhase);
  const phaseProgress = currentPhaseData
    ? `Day ${cycleDay - currentPhaseData.start + 1} of ${currentPhaseData.end - currentPhaseData.start + 1}`
    : '';

  return (
    <View style={styles.wrapper}>
      {/* Gradient blob */}
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="blobGradient" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={gradient.inner} stopOpacity={1} />
              <Stop offset="70%" stopColor={gradient.outer} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={gradient.outer} stopOpacity={0.15} />
            </RadialGradient>
          </Defs>

          {/* Outer glow */}
          <Circle
            cx={center}
            cy={center}
            r={glowRadius}
            fill="none"
            stroke={gradient.glow}
            strokeWidth={10}
          />

          {/* Main gradient blob */}
          <Circle
            cx={center}
            cy={center}
            r={blobRadius}
            fill="url(#blobGradient)"
          />

          {/* Thin progress arc */}
          <Circle
            cx={center}
            cy={center}
            r={progressRadius}
            fill="none"
            stroke={`${phaseColor}40`}
            strokeWidth={progressStroke}
          />
          <Circle
            cx={center}
            cy={center}
            r={progressRadius}
            fill="none"
            stroke={phaseColor}
            strokeWidth={progressStroke}
            strokeDasharray={`${progressCircumference}`}
            strokeDashoffset={progressDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.phaseName, { color: phaseColor }]}>
            {phaseName}
          </Text>
          <Text style={styles.dayNumber}>{cycleDay}</Text>
          <Text style={styles.dayLabel}>of {cycleLength} days</Text>
          {phaseProgress !== '' && (
            <View style={[styles.progressPill, { backgroundColor: `${phaseColor}15` }]}>
              <Text style={[styles.progressText, { color: phaseColor }]}>
                {phaseProgress}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Phase stepper bar */}
      <View style={styles.stepperContainer}>
        {ALL_PHASES.map((phase, idx) => {
          const isActive = phase === currentPhase;
          const entry = phaseEntries.find((e) => e.phase === phase);
          const widthPercent = entry
            ? ((entry.end - entry.start + 1) / cycleLength) * 100
            : 25;
          return (
            <View
              key={phase}
              style={[
                styles.stepperSegment,
                {
                  flex: widthPercent,
                  backgroundColor: isActive ? PHASE_COLORS[phase] : `${PHASE_COLORS[phase]}35`,
                  height: isActive ? 8 : 5,
                },
                idx === 0 && { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
                idx === ALL_PHASES.length - 1 && { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
              ]}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        {ALL_PHASES.map((phase) => {
          const isActive = phase === currentPhase;
          return (
            <View key={phase} style={[styles.legendItem, isActive && styles.legendItemActive]}>
              <View style={[styles.legendDot, { backgroundColor: PHASE_COLORS[phase] }]} />
              <Text style={[styles.legendText, isActive && styles.legendTextActive]}>
                {PHASE_LABELS[phase]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.md,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseName: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.secondary[900],
    lineHeight: 46,
  },
  dayLabel: {
    fontSize: 13,
    color: colors.secondary[500],
    marginTop: -2,
  },
  progressPill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    width: '80%',
    alignItems: 'center',
    gap: 3,
  },
  stepperSegment: {
    height: 5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  legendItemActive: {
    backgroundColor: colors.secondary[100],
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  legendTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});