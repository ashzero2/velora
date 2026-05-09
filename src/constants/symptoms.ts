// ============================================================
// Velora — Symptom, Mood & Tracking Constants
// Sources: Cleveland Clinic (SR1), IAPMD DRSP (SR2),
//          Cleveland Clinic Cervical Mucus (SR3), ACOG (SR4),
//          Mayo Clinic (SR4)
// ============================================================

import { MoodType, CervicalMucusType, Severity } from '@src/types';

// ────────────────────────────────────────────────────────────
// Symptom Categories
// Based on Cleveland Clinic PMS symptoms (SR1) and DRSP (SR2)
// ────────────────────────────────────────────────────────────

export interface SymptomCategory {
  key: string;
  label: string;
  icon: string;                // Ionicons name
  severityField: string;       // maps to DailyLog field name
}

/**
 * Trackable physical symptom categories.
 * Ref SR1: bloating, breast tenderness, headaches, acne, fatigue, joint/muscle pain
 * Ref SR2: DRSP tracks breast tenderness, bloating, headache, joint/muscle pain
 */
export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  { key: 'cramps', label: 'Cramps', icon: 'flash-outline', severityField: 'crampsSeverity' },
  { key: 'headache', label: 'Headache', icon: 'thunderstorm-outline', severityField: 'headacheSeverity' },
  { key: 'acne', label: 'Acne', icon: 'ellipse-outline', severityField: 'acneSeverity' },
  { key: 'bloating', label: 'Bloating', icon: 'resize-outline', severityField: 'bloatingSeverity' },
  { key: 'backPain', label: 'Back Pain', icon: 'body-outline', severityField: 'backPainSeverity' },
  { key: 'breastTenderness', label: 'Breast Tenderness', icon: 'heart-outline', severityField: 'breastTendernessSeverity' },
];

// ────────────────────────────────────────────────────────────
// Mood Options
// Based on ACOG premenstrual disorders (SR4) and Mayo Clinic (SR4)
// Ref SR4: irritability, anxiety, depressed mood, emotional lability, anger
// Ref SR2: DRSP mood categories: depressed, anxious, mood swings, irritable
// ────────────────────────────────────────────────────────────

export interface MoodOption {
  value: MoodType;
  label: string;
  emoji: string;
  color: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: MoodType.HAPPY, label: 'Happy', emoji: '😊', color: '#c9b87b' },
  { value: MoodType.CALM, label: 'Calm', emoji: '😌', color: '#7bc9a5' },
  { value: MoodType.ENERGETIC, label: 'Energetic', emoji: '⚡', color: '#7ba5c9' },
  { value: MoodType.ANXIOUS, label: 'Anxious', emoji: '😰', color: '#d4a574' },
  { value: MoodType.SAD, label: 'Sad', emoji: '😢', color: '#9b7bc9' },
  { value: MoodType.IRRITABLE, label: 'Irritable', emoji: '😤', color: '#c97b7b' },
  { value: MoodType.SENSITIVE, label: 'Sensitive', emoji: '🥺', color: '#c9a07b' },
  { value: MoodType.NEUTRAL, label: 'Neutral', emoji: '😐', color: '#a8a29e' },
];

// ────────────────────────────────────────────────────────────
// Cervical Mucus Options
// Based on Cleveland Clinic cervical mucus patterns (SR3)
// Ref SR3: dry → sticky → creamy → egg-white (ovulation) → sticky/dry
// ────────────────────────────────────────────────────────────

export interface CervicalMucusOption {
  value: CervicalMucusType;
  label: string;
  description: string;
}

export const CERVICAL_MUCUS_OPTIONS: CervicalMucusOption[] = [
  { value: CervicalMucusType.DRY, label: 'Dry', description: 'Little to no mucus' },
  { value: CervicalMucusType.STICKY, label: 'Sticky', description: 'Thick, white or yellowish' },
  { value: CervicalMucusType.CREAMY, label: 'Creamy', description: 'Lotiony, white' },
  { value: CervicalMucusType.WATERY, label: 'Watery', description: 'Clear, thin' },
  { value: CervicalMucusType.EGG_WHITE, label: 'Egg White', description: 'Clear, stretchy, slippery — most fertile' },
];

// ────────────────────────────────────────────────────────────
// Severity Labels
// Based on DRSP severity scale (SR2)
// DRSP uses 1–6 scale; we simplify to 0–4 (None through Very Severe)
// ────────────────────────────────────────────────────────────

export interface SeverityOption {
  value: Severity;
  label: string;
  color: string;
}

export const SEVERITY_OPTIONS: SeverityOption[] = [
  { value: Severity.NONE, label: 'None', color: '#a8a29e' },
  { value: Severity.MILD, label: 'Mild', color: '#7bc9a5' },
  { value: Severity.MODERATE, label: 'Moderate', color: '#c9b87b' },
  { value: Severity.SEVERE, label: 'Severe', color: '#d4a574' },
  { value: Severity.VERY_SEVERE, label: 'Very Severe', color: '#c97b7b' },
];

/**
 * Map Severity enum to display label.
 */
export const SEVERITY_LABELS: Record<Severity, string> = {
  [Severity.NONE]: 'None',
  [Severity.MILD]: 'Mild',
  [Severity.MODERATE]: 'Moderate',
  [Severity.SEVERE]: 'Severe',
  [Severity.VERY_SEVERE]: 'Very Severe',
};