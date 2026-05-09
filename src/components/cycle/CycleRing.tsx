import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { CyclePhase } from '@src/types';
import { PHASE_COLORS } from '@src/constants/phases';
import { formatCycleDay } from '@src/utils/formatUtils';
import { getPhaseBoundaries } from '@src/engines/CycleEngine';
import { colors } from '@src/constants/theme';

interface CycleRingProps {
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  currentPhase: CyclePhase;
  size?: number;
  strokeWidth?: number;
}

export function CycleRing({
  cycleDay,
  cycleLength,
  periodLength,
  currentPhase,
  size = 220,
  strokeWidth = 14,
}: CycleRingProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const boundaries = getPhaseBoundaries(cycleLength, periodLength);

  const phases: { phase: CyclePhase; start: number; end: number }[] = [
    { phase: CyclePhase.MENSTRUATION, start: boundaries.menstruation[0], end: boundaries.menstruation[1] },
    { phase: CyclePhase.FOLLICULAR, start: boundaries.follicular[0], end: boundaries.follicular[1] },
    { phase: CyclePhase.OVULATION, start: boundaries.ovulation[0], end: boundaries.ovulation[1] },
    { phase: CyclePhase.LUTEAL, start: boundaries.luteal[0], end: boundaries.luteal[1] },
  ];

  const dayProgress = Math.min(cycleDay / cycleLength, 1);
  const dotAngle = dayProgress * 360 - 90;
  const dotRad = (dotAngle * Math.PI) / 180;
  const dotX = center + radius * Math.cos(dotRad);
  const dotY = center + radius * Math.sin(dotRad);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G>
          {phases.map(({ phase, start, end }) => {
            const startFraction = (start - 1) / cycleLength;
            const endFraction = end / cycleLength;
            const arcLength = (endFraction - startFraction) * circumference;
            const offset = circumference * (1 - endFraction) + circumference * 0.25;
            return (
              <Circle
                key={phase}
                cx={center}
                cy={center}
                r={radius}
                stroke={PHASE_COLORS[phase]}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            );
          })}
          <Circle cx={dotX} cy={dotY} r={strokeWidth / 2 + 3} fill="#ffffff" stroke={PHASE_COLORS[currentPhase]} strokeWidth={3} />
          <Circle cx={dotX} cy={dotY} r={strokeWidth / 2 - 2} fill={PHASE_COLORS[currentPhase]} />
        </G>
      </Svg>
      <View style={styles.centerContent}>
        <Text style={styles.dayNumber}>{cycleDay}</Text>
        <Text style={styles.dayLabel}>{formatCycleDay(cycleDay)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: { alignItems: 'center' },
  dayNumber: { fontSize: 36, fontWeight: '700', color: colors.secondary[900] },
  dayLabel: { fontSize: 14, color: colors.secondary[500], marginTop: -4 },
});