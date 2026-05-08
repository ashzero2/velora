import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { CyclePhase } from '@src/types';
import { PHASE_COLORS } from '@src/constants/phases';
import { formatCycleDay } from '@src/utils/formatUtils';
import type { PhaseBoundaries } from '@src/types';
import { getPhaseBoundaries } from '@src/engines/CycleEngine';

interface CycleRingProps {
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  currentPhase: CyclePhase;
  size?: number;
  strokeWidth?: number;
}

/**
 * Circular phase visualizer showing current position in cycle.
 * Outer ring divided into 4 phase-colored arcs.
 * Dot marker at current day position.
 * Shows cycle day number in center.
 */
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

  // Calculate arc for each phase
  const phases: { phase: CyclePhase; start: number; end: number }[] = [
    { phase: CyclePhase.MENSTRUATION, start: boundaries.menstruation[0], end: boundaries.menstruation[1] },
    { phase: CyclePhase.FOLLICULAR, start: boundaries.follicular[0], end: boundaries.follicular[1] },
    { phase: CyclePhase.OVULATION, start: boundaries.ovulation[0], end: boundaries.ovulation[1] },
    { phase: CyclePhase.LUTEAL, start: boundaries.luteal[0], end: boundaries.luteal[1] },
  ];

  // Current day position (angle)
  const dayProgress = Math.min(cycleDay / cycleLength, 1);
  const dotAngle = dayProgress * 360 - 90; // Start from top
  const dotRad = (dotAngle * Math.PI) / 180;
  const dotX = center + radius * Math.cos(dotRad);
  const dotY = center + radius * Math.sin(dotRad);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <G>
          {/* Phase arcs */}
          {phases.map(({ phase, start, end }) => {
            const startFraction = (start - 1) / cycleLength;
            const endFraction = end / cycleLength;
            const arcLength = (endFraction - startFraction) * circumference;
            const offset = circumference * (1 - endFraction) + circumference * 0.25; // rotate to start from top

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

          {/* Current day marker */}
          <Circle
            cx={dotX}
            cy={dotY}
            r={strokeWidth / 2 + 3}
            fill="#ffffff"
            stroke={PHASE_COLORS[currentPhase]}
            strokeWidth={3}
          />
          <Circle
            cx={dotX}
            cy={dotY}
            r={strokeWidth / 2 - 2}
            fill={PHASE_COLORS[currentPhase]}
          />
        </G>
      </Svg>

      {/* Center content */}
      <View className="items-center">
        <Text className="text-4xl font-bold text-secondary-900">
          {cycleDay}
        </Text>
        <Text className="text-sm text-secondary-500 -mt-1">
          {formatCycleDay(cycleDay)}
        </Text>
      </View>
    </View>
  );
}