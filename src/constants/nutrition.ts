// ============================================================
// Velora — Nutrition & Fertility Data Constants
// Phase-based nutrition, fertility superfoods, conception tips,
// supplements, and wellness recommendations.
// Sources: Cleveland Clinic, Harvard Health, ACOG, NHS
// ============================================================

import { CyclePhase } from '@src/types';

// ----------------------------------------------------------
// Types
// ----------------------------------------------------------

export interface FoodItem {
  name: string;
  emoji: string;
  description: string;
}

export interface AvoidItem {
  name: string;
  reason: string;
}

export interface PhaseNutritionData {
  nutrients: string[];
  recommendedFoods: FoodItem[];
  foodsToAvoid: AvoidItem[];
  tip: string;
}

export interface SuperfoodItem {
  name: string;
  emoji: string;
  benefit: string;
  nutrients: string[];
}

export interface SupplementItem {
  name: string;
  dosage: string;
  benefit: string;
}

export interface ConceptionTip {
  title: string;
  icon: string;
  description: string;
}

export interface WellnessData {
  exercise: { type: string; duration: string; description: string };
  sleep: string;
  hydration: string;
  stressManagement: string;
  thingsToAvoid: string[];
}

// ----------------------------------------------------------
// Phase-Based Nutrition
// ----------------------------------------------------------

export const PHASE_NUTRITION: Record<CyclePhase, PhaseNutritionData> = {
  [CyclePhase.MENSTRUATION]: {
    nutrients: ['Iron', 'Vitamin C', 'Omega-3', 'Magnesium'],
    recommendedFoods: [
      { name: 'Spinach', emoji: '🥬', description: 'Rich in iron to replenish blood loss' },
      { name: 'Lentils', emoji: '🫘', description: 'Plant-based iron and protein' },
      { name: 'Dark Chocolate', emoji: '🍫', description: 'Magnesium to ease cramps' },
      { name: 'Salmon', emoji: '🐟', description: 'Omega-3 fatty acids reduce inflammation' },
      { name: 'Ginger Tea', emoji: '🍵', description: 'Soothes cramps and nausea' },
      { name: 'Citrus Fruits', emoji: '🍊', description: 'Vitamin C boosts iron absorption' },
      { name: 'Red Meat', emoji: '🥩', description: 'Heme iron for faster absorption' },
      { name: 'Warm Soups', emoji: '🍲', description: 'Comforting and easy to digest' },
    ],
    foodsToAvoid: [
      { name: 'Caffeine', reason: 'Can worsen cramps and anxiety' },
      { name: 'Salty Foods', reason: 'Increases bloating and water retention' },
      { name: 'Processed Sugar', reason: 'Causes energy crashes and inflammation' },
      { name: 'Alcohol', reason: 'Dehydrating and worsens fatigue' },
    ],
    tip: 'Focus on replenishing iron lost during bleeding. Pair iron-rich foods with vitamin C for better absorption.',
  },

  [CyclePhase.FOLLICULAR]: {
    nutrients: ['B-Vitamins', 'Vitamin E', 'Probiotics', 'Zinc'],
    recommendedFoods: [
      { name: 'Yogurt', emoji: '🥛', description: 'Probiotics support gut and hormone balance' },
      { name: 'Eggs', emoji: '🥚', description: 'B-vitamins and choline for energy' },
      { name: 'Avocado', emoji: '🥑', description: 'Healthy fats and vitamin E' },
      { name: 'Broccoli', emoji: '🥦', description: 'Supports estrogen metabolism' },
      { name: 'Lean Chicken', emoji: '🍗', description: 'Protein and zinc for cell growth' },
      { name: 'Sprouted Grains', emoji: '🌾', description: 'Easy-to-digest complex carbs' },
      { name: 'Kimchi', emoji: '🥬', description: 'Fermented for gut health' },
      { name: 'Green Peas', emoji: '🫛', description: 'Plant protein and B-vitamins' },
    ],
    foodsToAvoid: [
      { name: 'Heavy Fried Foods', reason: 'Sluggish digestion during rising energy' },
      { name: 'Excess Sugar', reason: 'Can disrupt rising estrogen balance' },
    ],
    tip: 'Rising estrogen boosts your energy — embrace fresh, light, and colorful meals. Great time for trying new recipes!',
  },

  [CyclePhase.OVULATION]: {
    nutrients: ['Antioxidants', 'Zinc', 'Omega-3', 'Folate'],
    recommendedFoods: [
      { name: 'Berries', emoji: '🫐', description: 'Antioxidants protect egg quality' },
      { name: 'Leafy Greens', emoji: '🥗', description: 'Folate supports cell division' },
      { name: 'Quinoa', emoji: '🍚', description: 'Complete protein with zinc' },
      { name: 'Almonds', emoji: '🥜', description: 'Vitamin E and healthy fats' },
      { name: 'Wild Fish', emoji: '🐠', description: 'Omega-3 DHA for fertility' },
      { name: 'Flaxseeds', emoji: '🌰', description: 'Lignans support hormone balance' },
      { name: 'Bell Peppers', emoji: '🫑', description: 'High vitamin C and antioxidants' },
      { name: 'Pomegranate', emoji: '🍎', description: 'Powerful antioxidants for blood flow' },
    ],
    foodsToAvoid: [
      { name: 'Excess Dairy', reason: 'May increase inflammation in some women' },
      { name: 'Processed Foods', reason: 'Inflammatory and nutrient-poor' },
      { name: 'Trans Fats', reason: 'Linked to reduced fertility' },
    ],
    tip: 'Support egg quality with antioxidant-rich foods. This is your peak fertility window — nourish your body well.',
  },

  [CyclePhase.LUTEAL]: {
    nutrients: ['Magnesium', 'Vitamin B6', 'Complex Carbs', 'Fiber'],
    recommendedFoods: [
      { name: 'Sweet Potatoes', emoji: '🍠', description: 'Complex carbs stabilize blood sugar' },
      { name: 'Brown Rice', emoji: '🍚', description: 'Sustained energy from whole grains' },
      { name: 'Dark Chocolate', emoji: '🍫', description: 'Magnesium eases PMS symptoms' },
      { name: 'Bananas', emoji: '🍌', description: 'B6 and potassium for mood support' },
      { name: 'Turkey', emoji: '🦃', description: 'Tryptophan for serotonin production' },
      { name: 'Chickpeas', emoji: '🫘', description: 'Fiber and B6 for hormone balance' },
      { name: 'Pumpkin Seeds', emoji: '🎃', description: 'Zinc and magnesium powerhouse' },
      { name: 'Leafy Greens', emoji: '🥬', description: 'Calcium and magnesium for cramp relief' },
    ],
    foodsToAvoid: [
      { name: 'Refined Sugar', reason: 'Worsens mood swings and cravings' },
      { name: 'Caffeine', reason: 'Can intensify anxiety and breast tenderness' },
      { name: 'Alcohol', reason: 'Disrupts progesterone and sleep quality' },
      { name: 'Refined Carbs', reason: 'Spike blood sugar, crash mood' },
    ],
    tip: 'Combat PMS cravings with complex carbs and magnesium-rich foods. Your body needs more calories in this phase — honor that.',
  },

  [CyclePhase.UNKNOWN]: {
    nutrients: ['Iron', 'Folate', 'Omega-3', 'Vitamin D'],
    recommendedFoods: [
      { name: 'Leafy Greens', emoji: '🥬', description: 'Always a good foundation' },
      { name: 'Salmon', emoji: '🐟', description: 'Omega-3 for overall health' },
      { name: 'Eggs', emoji: '🥚', description: 'Complete nutrition' },
      { name: 'Nuts & Seeds', emoji: '🥜', description: 'Healthy fats and minerals' },
    ],
    foodsToAvoid: [
      { name: 'Processed Foods', reason: 'Low nutrition, high inflammation' },
    ],
    tip: 'Log your period start date to get phase-specific nutrition recommendations.',
  },
};

// ----------------------------------------------------------
// Fertility Superfoods
// ----------------------------------------------------------

export const FERTILITY_SUPERFOODS: SuperfoodItem[] = [
  { name: 'Avocados', emoji: '🥑', benefit: 'Rich in folate and monounsaturated fats that support reproductive health', nutrients: ['Folate', 'Vitamin K', 'Healthy Fats'] },
  { name: 'Wild Salmon', emoji: '🐟', benefit: 'Omega-3 DHA improves blood flow to reproductive organs', nutrients: ['Omega-3 DHA', 'Vitamin D', 'Protein'] },
  { name: 'Eggs', emoji: '🥚', benefit: 'Choline and complete protein essential for egg development', nutrients: ['Choline', 'Vitamin D', 'B12'] },
  { name: 'Walnuts', emoji: '🌰', benefit: 'Plant-based omega-3 and antioxidants protect egg quality', nutrients: ['ALA Omega-3', 'Vitamin E', 'Manganese'] },
  { name: 'Sweet Potatoes', emoji: '🍠', benefit: 'Beta-carotene supports progesterone production', nutrients: ['Beta-Carotene', 'Vitamin C', 'Fiber'] },
  { name: 'Leafy Greens', emoji: '🥬', benefit: 'Folate is critical for preventing neural tube defects', nutrients: ['Folate', 'Iron', 'Calcium'] },
  { name: 'Berries', emoji: '🫐', benefit: 'Antioxidants protect eggs from oxidative damage', nutrients: ['Vitamin C', 'Anthocyanins', 'Fiber'] },
  { name: 'Lentils', emoji: '🫘', benefit: 'Plant-based iron and folate for blood health', nutrients: ['Iron', 'Folate', 'Protein'] },
  { name: 'Citrus Fruits', emoji: '🍊', benefit: 'Vitamin C improves iron absorption and progesterone levels', nutrients: ['Vitamin C', 'Folate', 'Potassium'] },
  { name: 'Full-Fat Yogurt', emoji: '🥛', benefit: 'Probiotics and calcium support hormonal balance', nutrients: ['Calcium', 'Probiotics', 'Protein'] },
];

// ----------------------------------------------------------
// Key Supplements
// ----------------------------------------------------------

export const KEY_SUPPLEMENTS: SupplementItem[] = [
  { name: 'Folate / Folic Acid', dosage: '400–800 mcg daily', benefit: 'Essential for cell division and preventing neural tube defects. Start before conception.' },
  { name: 'Vitamin D', dosage: '1000–2000 IU daily', benefit: 'Supports hormone production, egg quality, and implantation.' },
  { name: 'CoQ10', dosage: '200–600 mg daily', benefit: 'Improves egg quality and mitochondrial energy, especially for women over 35.' },
  { name: 'Iron', dosage: '18 mg daily', benefit: 'Prevents anemia and supports healthy blood flow to the uterus.' },
  { name: 'Omega-3 DHA', dosage: '200–300 mg daily', benefit: 'Supports brain development and reduces inflammation.' },
  { name: 'Vitamin B6', dosage: '25–50 mg daily', benefit: 'May help lengthen the luteal phase and support progesterone.' },
];

// ----------------------------------------------------------
// Conception Tips
// ----------------------------------------------------------

export const CONCEPTION_TIPS: ConceptionTip[] = [
  {
    title: 'Timing is Key',
    icon: 'time-outline',
    description: 'The best time to conceive is 1–2 days before ovulation. Sperm can survive up to 5 days, but the egg only lasts 12–24 hours after release.',
  },
  {
    title: 'Frequency Matters',
    icon: 'calendar-outline',
    description: 'Have intercourse every 1–2 days during your fertile window (about 6 days). Daily is fine — it does not reduce sperm quality.',
  },
  {
    title: 'Watch for Ovulation Signs',
    icon: 'eye-outline',
    description: 'Look for clear, stretchy cervical mucus (like egg whites), a slight temperature rise (0.2–0.5°C), and mild pelvic twinges (mittelschmerz).',
  },
  {
    title: 'Use Ovulation Predictor Kits',
    icon: 'flask-outline',
    description: 'OPKs detect the LH surge 24–36 hours before ovulation. A positive result means your most fertile time is the next 1–2 days.',
  },
  {
    title: 'When to Test',
    icon: 'medkit-outline',
    description: 'Wait until your period is at least 1 day late (about 14 days after ovulation). Testing too early may give a false negative.',
  },
  {
    title: 'Stay Lying Down After',
    icon: 'bed-outline',
    description: 'While not scientifically proven, lying down for 10–15 minutes after intercourse may help. Avoid jumping up immediately.',
  },
  {
    title: 'Limit Lubricants',
    icon: 'alert-circle-outline',
    description: 'Many commercial lubricants can impair sperm motility. Use fertility-friendly options if needed.',
  },
  {
    title: 'Track Consistently',
    icon: 'analytics-outline',
    description: 'The more cycles you track, the better the app can predict your fertile window. Log your period start date every month.',
  },
];

// ----------------------------------------------------------
// Wellness Tips (per phase)
// ----------------------------------------------------------

export const PHASE_WELLNESS: Record<CyclePhase, WellnessData> = {
  [CyclePhase.MENSTRUATION]: {
    exercise: { type: 'Gentle movement', duration: '20–30 min', description: 'Walking, yoga, stretching. Listen to your body — rest if needed.' },
    sleep: 'Aim for 8–9 hours. Your body is working hard — extra rest supports recovery.',
    hydration: 'Drink 8–10 glasses of water. Warm herbal teas (ginger, chamomile) can ease discomfort.',
    stressManagement: 'Practice gentle self-care: warm baths, journaling, light reading. This is your "inner winter."',
    thingsToAvoid: ['Intense exercise', 'Skipping meals', 'Cold beverages if they worsen cramps'],
  },
  [CyclePhase.FOLLICULAR]: {
    exercise: { type: 'Energetic workouts', duration: '30–45 min', description: 'Cardio, HIIT, strength training, dancing. Rising estrogen boosts endurance.' },
    sleep: 'You may need less sleep (7–8 hours). Energy is naturally higher.',
    hydration: 'Stay well-hydrated, especially if exercising intensely. Add electrolytes if sweating a lot.',
    stressManagement: 'Channel rising energy into creative projects, socializing, and new challenges. This is your "inner spring."',
    thingsToAvoid: ['Overtraining without rest days', 'Extreme calorie restriction'],
  },
  [CyclePhase.OVULATION]: {
    exercise: { type: 'Peak performance', duration: '30–60 min', description: 'This is your strongest phase. Go for personal bests, group classes, or intense cardio.' },
    sleep: '7–8 hours. Your body temperature rises slightly — keep your room cool.',
    hydration: 'Increase water intake. Body temperature is elevated, so you lose more fluid.',
    stressManagement: 'You naturally feel more social and confident. Great time for important conversations and decisions.',
    thingsToAvoid: ['Ignoring hydration', 'Overheating (hot yoga, saunas) if trying to conceive'],
  },
  [CyclePhase.LUTEAL]: {
    exercise: { type: 'Moderate activity', duration: '20–40 min', description: 'Pilates, swimming, moderate strength training, walking. Scale back as PMS symptoms appear.' },
    sleep: 'Aim for 8–9 hours. Progesterone makes you sleepier — honor that.',
    hydration: 'Drink plenty of water to reduce bloating. Limit caffeine and carbonated drinks.',
    stressManagement: 'Prioritize rest and routine. Reduce commitments if possible. This is your "inner autumn."',
    thingsToAvoid: ['Alcohol', 'Late-night screen time', 'Skipping meals (blood sugar dips worsen PMS)', 'Excessive caffeine'],
  },
  [CyclePhase.UNKNOWN]: {
    exercise: { type: 'Regular movement', duration: '30 min', description: 'Any moderate exercise you enjoy. Consistency matters more than intensity.' },
    sleep: 'Aim for 7–9 hours of quality sleep.',
    hydration: 'Drink at least 8 glasses of water daily.',
    stressManagement: 'Find what works for you: meditation, deep breathing, time in nature.',
    thingsToAvoid: ['Sedentary lifestyle', 'Chronic stress', 'Poor sleep habits'],
  },
};
