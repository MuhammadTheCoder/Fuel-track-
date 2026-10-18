import {
  UserProfile,
  DailyTargets,
  ActivityLevel,
  ExerciseRoutine,
  MainGoal,
  BiologicalSex,
} from '../types/nutrition';

export interface CalculationBreakdown {
  rmr: number;
  tdee: number;
  activityFactor: number;
  exerciseAdjustmentKcal: number;
  goalDeltaKcal: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetWaterMl: number;
  methodNote: string;
  goalDescription: string;
  isMinor: boolean;
}

/**
 * Normalizes goal string across current and legacy values
 */
export function normalizeGoal(goal?: MainGoal): 'muscle' | 'maintain' | 'fat_loss' | 'health_growth' {
  if (!goal) return 'maintain';
  if (goal === 'muscle_strength' || goal === 'muscle_gain') return 'muscle';
  if (goal === 'fat_loss_preserve_muscle' || goal === 'weight_loss') return 'fat_loss';
  if (goal === 'general_health_activity' || goal === 'growth_active') return 'health_growth';
  return 'maintain';
}

/**
 * Calculates evidence-informed, personalized daily nutrition & hydration targets
 */
export function calculatePersonalizedTargets(profile: UserProfile): DailyTargets {
  // 1. Metric conversions
  const weightKg =
    profile.weightUnit === 'lb'
      ? Math.round(Number(profile.weight) * 0.45359237 * 10) / 10
      : Number(profile.weight) || 70;

  let heightCm: number;
  if (profile.heightUnit === 'ft_in' && profile.heightFt !== undefined) {
    const feet = Number(profile.heightFt) || 5;
    const inches = Number(profile.heightIn) || 8;
    heightCm = Math.round((feet * 12 + inches) * 2.54);
  } else {
    heightCm = Number(profile.height) || 170;
  }

  const age = Number(profile.age) || 25;
  const isMinor = age > 0 && age < 18;
  const sex: BiologicalSex = profile.sex || 'prefer_not_to_say';
  const activity: ActivityLevel = profile.activityLevel || 'moderate';
  const routine: ExerciseRoutine = profile.exerciseRoutine || '3_4_days';
  const goalCategory = normalizeGoal(profile.goal);

  // 2. Activity Multipliers
  const adultActivityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };

  const adolescentActivityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.45,
    light: 1.55,
    moderate: 1.7,
    very_active: 1.85,
    extremely_active: 1.95,
  };

  // Structured workout exercise allowance (kcal/day)
  const exerciseAdditions: Record<ExerciseRoutine, number> = {
    none: 0,
    '1_2_days': 60,
    '3_4_days': 120,
    '5_6_days': 180,
    daily: 250,
  };

  let rmr: number;
  let tdee: number;
  let targetCalories: number;
  let targetProtein: number;
  let methodNote: string;
  let goalDescription: string;

  if (isMinor) {
    // -------------------------------------------------------------------------
    // YOUTH & ADOLESCENT SAFEGUARD (< 18)
    // WHO / Schofield pediatric energy model prioritizing healthy development
    // -------------------------------------------------------------------------
    rmr = Math.round(15.5 * weightKg + 675);
    const actFactor = adolescentActivityFactors[activity] || 1.7;
    tdee = Math.round(rmr * actFactor + exerciseAdditions[routine]);

    // Safety floor for healthy adolescent growth (avoiding starvation or restriction)
    tdee = Math.max(1950, tdee);

    switch (goalCategory) {
      case 'muscle':
        targetCalories = tdee + 250;
        targetProtein = Math.round(weightKg * 1.6);
        goalDescription = 'Build Muscle & Muscular Development';
        methodNote =
          'Calibrated using adolescent dietary standards: modest wholesome energy surplus paired with 1.6g protein/kg to fuel natural strength and bone/tissue development without aggressive bulking.';
        break;

      case 'fat_loss':
        // CRITICAL SAFETY RULE: Never prescribe restrictive calorie deficits to minors
        targetCalories = tdee;
        targetProtein = Math.round(weightKg * 1.5);
        goalDescription = 'Active Body Recomposition & Health';
        methodNote =
          'Youth Health Protocol: For individuals under 18, body composition improvements are achieved through consistent physical activity and wholesome nutrition at maintenance calories. Restrictive calorie deficits are not prescribed. Consult a pediatric healthcare professional or dietitian for individualized medical advice.';
        break;

      case 'health_growth':
        targetCalories = tdee + 150;
        targetProtein = Math.round(weightKg * 1.5);
        goalDescription = 'Growth & Athletic Vitality';
        methodNote =
          'Adequate energy intake providing consistent fuel for growth, endurance, school/sports performance, and healthy bone density.';
        break;

      case 'maintain':
      default:
        targetCalories = tdee;
        targetProtein = Math.round(weightKg * 1.4);
        goalDescription = 'Daily Wholesome Maintenance';
        methodNote =
          'Balanced daily energy intake aligned with your natural daily activity and developmental needs.';
        break;
    }

    // Minors protein safety guard: 60g to 160g max
    targetProtein = Math.max(60, Math.min(160, targetProtein));
  } else {
    // -------------------------------------------------------------------------
    // ADULT NUTRITION ESTIMATION (18+)
    // Mifflin–St Jeor Equation (Recognized standard for resting metabolic rate)
    // -------------------------------------------------------------------------
    if (sex === 'male') {
      rmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    } else if (sex === 'female') {
      rmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
    } else {
      // Neutral average midpoint for users who prefer not to state biological sex
      rmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 78);
    }

    const actFactor = adultActivityFactors[activity] || 1.55;
    tdee = Math.round(rmr * actFactor + exerciseAdditions[routine]);

    switch (goalCategory) {
      case 'muscle': {
        const surplus = routine === '5_6_days' || routine === 'daily' ? 320 : 250;
        targetCalories = tdee + surplus;
        // Evidence-informed protein for resistance training: 1.8–2.0 g/kg
        const proteinFactor = profile.dietaryPreference === 'vegan' ? 2.0 : 1.8;
        targetProtein = Math.round(weightKg * proteinFactor);
        goalDescription = 'Build Muscle & Strength';
        methodNote = `Mifflin–St Jeor TDEE (${tdee} kcal) + modest ${surplus} kcal surplus with ${proteinFactor}g protein/kg to optimize progressive overload and muscle protein synthesis without unnecessary fat gain.`;
        break;
      }

      case 'fat_loss': {
        // Safe, sustainable 350-400 kcal deficit with lean mass protection floor
        const sexFloor = sex === 'female' ? 1300 : 1550;
        targetCalories = Math.max(sexFloor, tdee - 380);
        // Higher protein (1.8-2.0 g/kg) preserves lean muscle in a deficit
        targetProtein = Math.round(weightKg * 1.9);
        goalDescription = 'Lose Body Fat & Preserve Muscle';
        methodNote = `Mifflin–St Jeor TDEE (${tdee} kcal) with a moderate, sustainable 380 kcal deficit and high protein (1.9g/kg) to protect lean muscle tissue and maintain satiety.`;
        break;
      }

      case 'health_growth': {
        targetCalories = tdee + 75;
        targetProtein = Math.round(weightKg * 1.6);
        goalDescription = 'General Health & Daily Activity';
        methodNote = `Maintenance energy (${tdee} kcal) calibrated to your active lifestyle with balanced macronutrients for sustained vitality.`;
        break;
      }

      case 'maintain':
      default: {
        targetCalories = tdee;
        targetProtein = Math.round(weightKg * 1.6);
        goalDescription = 'Maintain Weight & Improve Fitness';
        methodNote = `Balanced maintenance intake matching your estimated expenditure (${tdee} kcal) with 1.6g protein/kg for lean body mass retention.`;
        break;
      }
    }

    // Adult protein bounds guard: 65g to 240g
    targetProtein = Math.max(65, Math.min(240, targetProtein));
  }

  // 3. Healthy Fats Allocation: 22% - 30% of total calories
  // 1 gram of fat = 9 kcal
  let fatPercentage = 0.26;
  if (goalCategory === 'fat_loss') fatPercentage = 0.24;
  if (goalCategory === 'health_growth') fatPercentage = 0.28;

  let targetFat = Math.round((targetCalories * fatPercentage) / 9);
  // Healthy fat floor: minimum 40g (essential fatty acids and hormone synthesis)
  targetFat = Math.max(40, targetFat);

  // 4. Carbohydrates Allocation: remaining calories
  // 1 gram of carb = 4 kcal
  const remainingKcal = targetCalories - (targetProtein * 4 + targetFat * 9);
  let targetCarbs = Math.round(remainingKcal / 4);
  // Carbohydrate floor: minimum 80g for glycogen and cognitive function
  targetCarbs = Math.max(80, targetCarbs);

  // 5. Absolute Internal Consistency:
  // Re-sum exact macro calories so Calories === (Protein×4) + (Carbs×4) + (Fat×9)
  const consistentCalories = targetProtein * 4 + targetCarbs * 4 + targetFat * 9;

  // 6. Water Target Calculation (Hydration):
  // Baseline: 35ml per kg of body weight + exercise allowance
  const baseWater = weightKg * 35;
  const exerciseWater =
    routine === 'daily'
      ? 800
      : routine === '5_6_days'
      ? 650
      : routine === '3_4_days'
      ? 450
      : routine === '1_2_days'
      ? 250
      : 0;

  let targetWaterMl = Math.round((baseWater + exerciseWater) / 50) * 50;
  // Clamp between 2000ml (approx 8 cups) and 4000ml (16 cups)
  targetWaterMl = Math.max(2000, Math.min(4000, targetWaterMl));

  return {
    calories: consistentCalories,
    protein: targetProtein,
    carbs: targetCarbs,
    fat: targetFat,
    waterMl: targetWaterMl,
    isMinor,
    isUnder18: isMinor,
    rmr: rmr,
    tdee: tdee,
    methodNote,
    goalDescription,
    goal: profile.goal,
    userProfile: profile,
  };
}

export const calculateTargetsFromQuiz = calculatePersonalizedTargets;
